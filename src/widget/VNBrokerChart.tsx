import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { format } from "d3-format";
import { scaleTime } from "d3-scale";
import { timeFormat } from "d3-time-format";
import { DynamicChart, DEFAULT_PANES, type PaneDescriptor, type ChartTheme, type VisibleRange, useChartTheme } from "../lib/core";
import { DrawingLayer, evaluateDrawingAlerts, useDrawingInteraction, useDrawingStorage, type DrawingAlertEvent, type DrawingObject, type MagnetSensitivity } from "../lib/drawing";
import { discontinuousTimeScaleProviderBuilder } from "../lib/scale/discontinuousTimeScaleProvider";
import type { EnrichedDatum } from "../lib/core/calculators/types";
import { enrichData } from "../lib/core/calculators/enrichData";
import { useCanvasResize } from "../lib/core/hooks/useCanvasResize";
import type { StockDataAdapter, Timeframe } from "../lib/types/adapter";
import type { OHLCVBar } from "../lib/types/ohlcv";
import { WidgetErrorBoundary } from "./WidgetErrorBoundary";
import { WidgetEmptyState } from "./WidgetEmptyState";
import MeasurementOverlay from "./MeasurementOverlay";
import { WidgetI18nProvider } from "./context/WidgetI18nContext";
import type { WidgetLocale, WidgetMessages } from "./i18n/types";
import type { DrawingStorageAdapter } from "../lib/drawing/DrawingStorage";

export interface VNBrokerChartDrawingConfig {
	enabled?: boolean;
	activeTool?: string;
	magnetSensitivity?: MagnetSensitivity;
	initialDrawings?: readonly DrawingObject[];
	onChange?: (drawings: readonly DrawingObject[]) => void;
	onSelectionChange?: (drawing: DrawingObject | null) => void;
	onAlert?: (alert: DrawingAlertEvent) => void;
	onToolUsed?: () => void;
	onContextMenu?: (moreProps: { hitDrawing?: DrawingObject | null }, event: unknown) => void;
}

export interface VNBrokerChartProps {
	adapter: StockDataAdapter;
	data?: readonly OHLCVBar[];
	symbol?: string;
	timeframe?: Timeframe;
	locale?: WidgetLocale;
	messages?: Partial<WidgetMessages>;
	theme?: ChartTheme;
	panes?: readonly PaneDescriptor[];
	xExtents?: readonly [Date | number, Date | number];
	children?: ReactNode;
	drawing?: VNBrokerChartDrawingConfig;
	className?: string;
	style?: CSSProperties;
	measurementEnabled?: boolean;
	onClick?: (moreProps: { currentItem?: EnrichedDatum; currentCharts?: number[]; mouseXY?: [number, number] }, event: unknown) => void;
	onContextMenu?: (moreProps: { currentItem?: EnrichedDatum; currentCharts?: number[]; mouseXY?: [number, number] }, event: unknown) => void;
	onCurrentItemChange?: (currentItem: EnrichedDatum | null) => void;
	onVisibleDomainChange?: (domain: [Date | number, Date | number]) => void;
	onVisibleRangeChange?: (range: VisibleRange) => void;
	showNonTradingDays?: boolean;
	onError?: (error: Error) => void;
}

const priceFormat = format(",.2f");
const volumeFormat = format(".3s");
const dateFormat = timeFormat("%d/%m/%Y %H:%M");

function resolveFetchWindow(timeframe: Timeframe): { from: Date; to: Date } {
	const to = new Date();
	const oneDay = 24 * 60 * 60 * 1000;
	const lookbackDays = (() => {
		switch (timeframe) {
			case "1m":
			case "3m":
			case "5m":
				return 7;
			case "15m":
			case "30m":
				return 14;
			case "1h":
				return 30;
			case "4h":
				return 90;
			case "1d":
				return 365;
			default:
				return 30;
		}
	})();
	return { from: new Date(to.getTime() - lookbackDays * oneDay), to };
}

function mergeBarsByDate(previousBars: readonly OHLCVBar[], nextBar: OHLCVBar): readonly OHLCVBar[] {
	if (previousBars.length === 0) {
		return [nextBar];
	}
	const lastBar = previousBars[previousBars.length - 1];
	if (lastBar.date.getTime() === nextBar.date.getTime()) {
		return [...previousBars.slice(0, -1), nextBar];
	}
	if (lastBar.date.getTime() < nextBar.date.getTime()) {
		return [...previousBars, nextBar];
	}
	const existingIndex = previousBars.findIndex((bar) => bar.date.getTime() === nextBar.date.getTime());
	if (existingIndex >= 0) {
		return previousBars.map((bar, index) => (index === existingIndex ? nextBar : bar));
	}
	return [...previousBars, nextBar].sort((left, right) => left.date.getTime() - right.date.getTime());
}

function getSelectedDrawingId(drawingState: { type: string; objectId?: string }) {
	switch (drawingState.type) {
		case "selected":
		case "moving":
		case "resizing":
		case "editing":
			return drawingState.objectId;
		default:
			return undefined;
	}
}

function createDisabledDrawingStorageAdapter(initialDrawings: readonly DrawingObject[]): DrawingStorageAdapter {
	return {
		save: () => {},
		load: () => ({ drawings: [...initialDrawings], hasData: false }),
		clear: () => {},
		exportJSON: () => JSON.stringify(initialDrawings),
		importJSON: () => [...initialDrawings],
	};
}

function isEditableTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) {
		return false;
	}

	const tagName = target.tagName.toLowerCase();
	return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
}

function VNBrokerChartContent({
	adapter,
	data,
	symbol,
	timeframe,
	theme,
	panes,
	xExtents: controlledXExtents,
	children,
	drawing,
	className,
	style,
	measurementEnabled,
	onClick,
	onContextMenu,
	onCurrentItemChange,
	onVisibleDomainChange,
	onVisibleRangeChange,
	showNonTradingDays,
	onError,
}: VNBrokerChartProps) {
	const { ref, size } = useCanvasResize<HTMLDivElement>();
	const themeState = useChartTheme("light");
	const resolvedTheme = theme ?? themeState.theme;
	const isDark = resolvedTheme === "dark";

	useEffect(() => {
		if (typeof document === "undefined") {
			return undefined;
		}

		const root = document.documentElement;
		const previousTheme = root.getAttribute("data-chart-theme");
		root.setAttribute("data-chart-theme", resolvedTheme);

		return () => {
			if (previousTheme === null) {
				if (root.getAttribute("data-chart-theme") === resolvedTheme) {
					root.removeAttribute("data-chart-theme");
				}
				return;
			}

			if (root.getAttribute("data-chart-theme") === resolvedTheme) {
				root.setAttribute("data-chart-theme", previousTheme);
			}
		};
	}, [resolvedTheme]);

	const hasExternalData = Array.isArray(data);
	const [bars, setBars] = useState<readonly OHLCVBar[]>(data ?? []);
	const [loading, setLoading] = useState(() => !hasExternalData);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!hasExternalData) {
			return;
		}
		setBars(data ?? []);
		setLoading(false);
		setError(null);
	}, [data, hasExternalData]);

	const activeSymbol = symbol ?? "BTCUSDT";
	const activeTimeframe = timeframe ?? "1h";
	const visiblePanes = useMemo(() => {
		const candidatePanes = panes?.length ? panes : DEFAULT_PANES;
		const nextPanes = candidatePanes.filter((pane) => pane.visible);
		return nextPanes.length > 0 ? nextPanes : DEFAULT_PANES.filter((pane) => pane.visible);
	}, [panes]);
	const sortedBars = useMemo<readonly OHLCVBar[]>(() => {
		if (bars.length <= 1) {
			return bars;
		}
		return [...bars].sort((left, right) => left.date.getTime() - right.date.getTime());
	}, [bars]);
	const drawingRuntimeEnabled = drawing?.enabled ?? Boolean(
		drawing?.activeTool
		|| drawing?.onChange
		|| drawing?.onSelectionChange
		|| drawing?.onAlert
		|| drawing?.onToolUsed
		|| drawing?.onContextMenu
		|| (drawing?.initialDrawings?.length ?? 0) > 0,
	);
	const drawingInteraction = useDrawingInteraction(drawing?.initialDrawings ?? []);
	const drawingStorageAdapter = useMemo(() => (
		drawingRuntimeEnabled ? undefined : createDisabledDrawingStorageAdapter(drawing?.initialDrawings ?? [])
	), [drawing?.initialDrawings, drawingRuntimeEnabled]);
	useDrawingStorage(activeSymbol, activeTimeframe, drawingInteraction.allDrawings, drawingInteraction.replaceDrawings, drawingStorageAdapter);
	const selectedDrawingId = useMemo(() => getSelectedDrawingId(drawingInteraction.drawingState), [drawingInteraction.drawingState]);
	const selectedDrawing = useMemo(
		() => drawingInteraction.allDrawings.find((candidate) => candidate.id === selectedDrawingId) ?? null,
		[drawingInteraction.allDrawings, selectedDrawingId],
	);
	const onDrawingChange = drawing?.onChange;
	const onDrawingSelectionChange = drawing?.onSelectionChange;
	const onDrawingAlert = drawing?.onAlert;
	const onDrawingToolUsed = drawing?.onToolUsed;
	const onDrawingContextMenu = drawing?.onContextMenu;
	const previousAlertBarRef = useRef<OHLCVBar | null>(null);
	const alertSignatureRef = useRef(new Map<string, string>());

	useEffect(() => {
		previousAlertBarRef.current = null;
		alertSignatureRef.current.clear();
	}, [activeSymbol, activeTimeframe]);

	useEffect(() => {
		if (!drawingRuntimeEnabled || !onDrawingChange) {
			return;
		}

		onDrawingChange(drawingInteraction.allDrawings);
	}, [drawingInteraction.allDrawings, drawingRuntimeEnabled, onDrawingChange]);

	useEffect(() => {
		if (!drawingRuntimeEnabled || !onDrawingSelectionChange) {
			return;
		}

		onDrawingSelectionChange(selectedDrawing);
	}, [drawingRuntimeEnabled, onDrawingSelectionChange, selectedDrawing]);

	useEffect(() => {
		const currentBar = sortedBars[sortedBars.length - 1];
		if (!currentBar) {
			previousAlertBarRef.current = null;
			return;
		}

		const previousBar = previousAlertBarRef.current;
		previousAlertBarRef.current = currentBar;

		if (!drawingRuntimeEnabled || !onDrawingAlert || !previousBar) {
			return;
		}

		const alertEvents = evaluateDrawingAlerts(drawingInteraction.allDrawings, previousBar, currentBar, {
			symbol: activeSymbol,
			timeframe: activeTimeframe,
		});

		alertEvents.forEach((event) => {
			const signature = `${event.drawing.id}:${event.drawing.updatedAt}:${event.trigger}:${event.bar.date.getTime()}`;
			if (alertSignatureRef.current.get(event.drawing.id) === signature) {
				return;
			}

			alertSignatureRef.current.set(event.drawing.id, signature);
			onDrawingAlert(event);
		});
	}, [activeSymbol, activeTimeframe, drawingInteraction.allDrawings, drawingRuntimeEnabled, onDrawingAlert, sortedBars]);

	useEffect(() => {
		if (!drawingRuntimeEnabled) {
			return undefined;
		}

		const handleDrawingKeyboardShortcuts = (event: KeyboardEvent) => {
			if (isEditableTarget(event.target)) {
				return;
			}

			if (event.key === "Delete" || event.key === "Backspace") {
				event.preventDefault();
				drawingInteraction.deleteSelected();
				return;
			}

			if (event.key === "Escape") {
				event.preventDefault();
				drawingInteraction.cancelDrawing();
			}
		};

		window.addEventListener("keydown", handleDrawingKeyboardShortcuts);
		return () => window.removeEventListener("keydown", handleDrawingKeyboardShortcuts);
	}, [drawingInteraction, drawingRuntimeEnabled]);

	const enrichedData = useMemo<EnrichedDatum[]>(() => {
		return enrichData(sortedBars, {
			series: visiblePanes.flatMap((pane) => pane.series),
		});
	}, [sortedBars, visiblePanes]);
	const plotData = useMemo<EnrichedDatum[]>(() => enrichedData.filter((datum): datum is EnrichedDatum => Boolean(datum && datum.date)), [enrichedData]);

	const computedXExtents = useMemo(() => {
		if (enrichedData.length === 0) {
			return undefined;
		}
		const firstBar = enrichedData[0];
		const lastBar = enrichedData[enrichedData.length - 1];
		if (firstBar.date.getTime() === lastBar.date.getTime()) {
			return [firstBar.date, new Date(lastBar.date.getTime() + 60_000)] as [Date, Date];
		}
		return [firstBar.date, lastBar.date] as [Date, Date];
	}, [enrichedData]);
	const resolvedXExtents = controlledXExtents ?? computedXExtents;
	const shouldHideNonTradingDays = showNonTradingDays === false;

	const chartScaleState = useMemo(() => {
		const timeXAccessor = (datum?: EnrichedDatum) => datum?.date ?? new Date(0);
		const buildContinuousState = () => ({
			plotData,
			xScale: scaleTime(),
			xAccessor: timeXAccessor as (datum: EnrichedDatum) => Date,
			displayXAccessor: timeXAccessor as (datum: EnrichedDatum) => Date,
			xExtents: resolvedXExtents,
			toDomainDate: (value: Date | number) => (value instanceof Date ? value : new Date(value)),
		});

		if (!shouldHideNonTradingDays || plotData.length === 0) {
			return buildContinuousState();
		}

 		try {
			const provider = discontinuousTimeScaleProviderBuilder().inputDateAccessor((datum: EnrichedDatum) => datum.date);
			const scaled = provider(plotData as EnrichedDatum[]);
			const scaledData = scaled.data as EnrichedDatum[];
			const scaledXAccessor = scaled.xAccessor as (datum: EnrichedDatum) => number;
			const scaledDisplayXAccessor = scaled.displayXAccessor as (datum: EnrichedDatum) => Date;

			const firstIndex = scaledData.length > 0 ? scaledXAccessor(scaledData[0]) : 0;
			const lastIndex = scaledData.length > 0 ? scaledXAccessor(scaledData[scaledData.length - 1]) : 0;

 			const resolveNearestIndex = (bound: Date | number): number => {
				if (scaledData.length === 0) {
					return 0;
				}
				if (typeof bound === "number" && Number.isFinite(bound) && bound >= firstIndex && bound <= lastIndex) {
					return bound;
				}

 				const targetMs = bound instanceof Date ? bound.getTime() : Number(bound);
				if (!Number.isFinite(targetMs)) {
					return firstIndex;
				}

				let nearest = scaledData[0];
				let minDiff = Math.abs(scaledDisplayXAccessor(nearest).getTime() - targetMs);
				for (let i = 1; i < scaledData.length; i += 1) {
					const current = scaledData[i];
					const diff = Math.abs(scaledDisplayXAccessor(current).getTime() - targetMs);
					if (diff < minDiff) {
						minDiff = diff;
						nearest = current;
					}
				}
				return scaledXAccessor(nearest);
			};

			const scaledXExtents = (() => {
				if (scaledData.length === 0) {
					return undefined;
				}
				if (controlledXExtents) {
					return [resolveNearestIndex(controlledXExtents[0]), resolveNearestIndex(controlledXExtents[1])] as [number, number];
				}
				return [scaledXAccessor(scaledData[0]), scaledXAccessor(scaledData[scaledData.length - 1])] as [number, number];
			})();

			const toDomainDate = (value: Date | number): Date => {
				if (value instanceof Date) {
					return value;
				}
				if (!Number.isFinite(value) || scaledData.length === 0) {
					return new Date(value);
				}
				let nearest = scaledData[0];
				let minDiff = Math.abs(scaledXAccessor(nearest) - value);
				for (let i = 1; i < scaledData.length; i += 1) {
					const current = scaledData[i];
					const diff = Math.abs(scaledXAccessor(current) - value);
					if (diff < minDiff) {
						minDiff = diff;
						nearest = current;
					}
				}
				return scaledDisplayXAccessor(nearest);
			};

			return {
				plotData: scaledData,
				xScale: scaled.xScale,
				xAccessor: scaledXAccessor,
				displayXAccessor: scaledDisplayXAccessor,
				xExtents: scaledXExtents,
				toDomainDate,
			};
		} catch {
			return buildContinuousState();
		}
	}, [controlledXExtents, plotData, resolvedXExtents, shouldHideNonTradingDays]);

	useEffect(() => {
		if (hasExternalData) {
			return undefined;
		}

		const controller = new AbortController();
		let unsubscribe: (() => void) | null = null;
		let disposed = false;

		setBars([]);
		setLoading(true);
		setError(null);

		const { from, to } = resolveFetchWindow(activeTimeframe);

		void adapter
			.fetchBars(activeSymbol, activeTimeframe, from, to)
			.then((nextBars) => {
				if (disposed || controller.signal.aborted) {
					return;
				}
				setBars(nextBars);
				setLoading(false);
				try {
					unsubscribe = adapter.subscribeToBar(activeSymbol, activeTimeframe, (nextBar) => {
						if (disposed || controller.signal.aborted) {
							return;
						}
						setBars((previousBars) => mergeBarsByDate(previousBars, nextBar));
					});
				} catch (subscribeError) {
					if (!disposed && !controller.signal.aborted) {
						setError(subscribeError instanceof Error ? subscribeError : new Error(String(subscribeError)));
					}
				}
			})
			.catch((fetchError) => {
				if (disposed || controller.signal.aborted) {
					return;
				}
				setLoading(false);
				setError(fetchError instanceof Error ? fetchError : new Error(String(fetchError)));
			});

		return () => {
			disposed = true;
			controller.abort();
			unsubscribe?.();
		};
	}, [adapter, activeSymbol, activeTimeframe, hasExternalData]);

	if (error) {
		throw error;
	}

	const ready = size.width > 0 && size.height > 0;
		if (!ready || (loading && !hasExternalData) || plotData.length === 0) {
		return (
			<div
				ref={ref}
				className={className}
				style={{
					display: "flex",
					flexDirection: "column",
					width: "100%",
					height: "100%",
					minHeight: 0,
					...style,
				}}
			>
				<WidgetEmptyState loading={loading || !ready} />
			</div>
		);
	}

	const axisStroke = isDark ? "#64748b" : "#475569";
	const axisTickFill = isDark ? "#e2e8f0" : "#0f172a";
	const chartInnerHeight = Math.max(1, size.height - 8 - 28);
	const paneHeights = visiblePanes.map((pane) => pane.heightRatio * chartInnerHeight);
	const handleChartVisibleDomainChange = (domain: [Date | number, Date | number]) => {
		onVisibleDomainChange?.([
			chartScaleState.toDomainDate(domain[0]),
			chartScaleState.toDomainDate(domain[1]),
		]);
	};
	const handleChartVisibleRangeChange = (range: VisibleRange) => {
		onVisibleRangeChange?.({
			...range,
			startDate: chartScaleState.toDomainDate(range.startDate),
			endDate: chartScaleState.toDomainDate(range.endDate),
		});
	};
	const handleChartCurrentItemChange = (currentItem: EnrichedDatum | null | undefined) => {
		onCurrentItemChange?.(currentItem ?? null);
	};

	return (
		<div
			ref={ref}
			className={className}
			data-chart-theme={resolvedTheme}
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				minHeight: 0,
				...style,
			}}
		>
			<DynamicChart
				panes={visiblePanes}
				heights={paneHeights}
				data={chartScaleState.plotData}
				width={size.width}
				height={size.height}
				margin={{ left: 60, right: 68, top: 8, bottom: 28 }}
				type="hybrid"
				seriesName={`vnstock-${activeSymbol}-${activeTimeframe}-${shouldHideNonTradingDays ? "discontinuous" : "continuous"}`}
				xScale={chartScaleState.xScale}
				xAccessor={chartScaleState.xAccessor}
				displayXAccessor={chartScaleState.displayXAccessor}
				xExtents={chartScaleState.xExtents}
				ratio={typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1}
				mouseMoveEvent
				zoomEvent
				panEvent
				useCrossHairStyleCursor
				onClick={onClick}
				onContextMenu={onContextMenu}
				onCurrentItemChange={handleChartCurrentItemChange}
				onVisibleDomainChange={handleChartVisibleDomainChange}
				onVisibleRangeChange={handleChartVisibleRangeChange}
				axisStroke={axisStroke}
				axisTickFill={axisTickFill}
				isDark={isDark}
				dateFormat={(date: Date) => dateFormat(date)}
				priceFormat={(value: number) => priceFormat(value)}
				volumeFormat={(value: number) => volumeFormat(value)}
				className={className}
			>
				{children}
				{drawingRuntimeEnabled && (
					<DrawingLayer
						activeTool={drawing?.activeTool ?? "cursor"}
						interaction={drawingInteraction}
						magnetSensitivity={drawing?.magnetSensitivity}
						onToolUsed={onDrawingToolUsed}
						onContextMenu={onDrawingContextMenu}
					/>
				)}
				<MeasurementOverlay
					enabled={measurementEnabled ?? false}
					isDark={isDark}
					priceFormat={priceFormat}
				/>
			</DynamicChart>
		</div>
	);
}

export function VNBrokerChart(props: VNBrokerChartProps) {
	return (
		<WidgetI18nProvider locale={props.locale} messages={props.messages}>
			<WidgetErrorBoundary onError={(caughtError) => props.onError?.(caughtError)}>
				<VNBrokerChartContent {...props} />
			</WidgetErrorBoundary>
		</WidgetI18nProvider>
	);
}
