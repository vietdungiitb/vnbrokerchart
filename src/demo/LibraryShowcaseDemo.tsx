import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "d3-format";
import { scaleTime } from "d3-scale";
import { timeFormat } from "d3-time-format";

import {
	DynamicChart,
	PaneHeader,
	PaneLabel,
	IndicatorLegend,
	useDynamicPanes,
	type PaneDescriptor,
	type SeriesConfig,
	type SeriesTypeId,
	ChartSplitter,
	useChartTheme,
	version,
} from "../index";
import { enrichData } from "../lib/core/calculators/enrichData";
import type { EnrichedDatum, RawOHLCV } from "../lib/core/calculators/types";
import ChartCanvas from "../lib/ChartCanvas";
import { heikinAshi } from "../lib/calculator";
import { fetchLiveDemoBars, getOfflineDemoBars } from "./demoData";
import { useDemoI18n } from "./i18n";
import { PaneSettingsModal, type SettingsSection } from "./PaneSettingsModal";
import "./demo.css";
import "../lib/styles/pane-overlays.css";

const DEMO_SETTINGS_STORAGE_KEY = "rsc-demo-settings-v1";
const DEFAULT_MAX_VISIBLE_PANES = 5;

function loadDemoSettings() {
	if (typeof localStorage === "undefined") {
		return { maxVisiblePanes: DEFAULT_MAX_VISIBLE_PANES };
	}
	try {
		const raw = localStorage.getItem(DEMO_SETTINGS_STORAGE_KEY);
		if (!raw) {
			return { maxVisiblePanes: DEFAULT_MAX_VISIBLE_PANES };
		}
		const parsed = JSON.parse(raw) as Partial<{ maxVisiblePanes: number }>;
		if (typeof parsed.maxVisiblePanes === "number" && Number.isFinite(parsed.maxVisiblePanes)) {
			return { maxVisiblePanes: Math.max(1, Math.floor(parsed.maxVisiblePanes)) };
		}
	} catch {
		// ignore malformed settings payloads
	}
	return { maxVisiblePanes: DEFAULT_MAX_VISIBLE_PANES };
}

function saveDemoSettings(maxVisiblePanes: number) {
	if (typeof localStorage === "undefined") {
		return;
	}
	try {
		localStorage.setItem(DEMO_SETTINGS_STORAGE_KEY, JSON.stringify({ maxVisiblePanes }));
	} catch {
		// ignore storage errors
	}
}

const priceFormat = format(".2f");
const volumeFormat = format(".3s");
const dateFormat = timeFormat("%d/%m/%Y %H:%M");

const TIMEFRAMES = ["1m", "3m", "5m", "15m", "30m", "1h", "4h", "1D", "1W"] as const;
type Timeframe = typeof TIMEFRAMES[number];

const CHART_TYPES = ["candlestick", "hollow", "ohlc", "heikinashi", "line", "area"] as const;
type ChartTypeId = typeof CHART_TYPES[number];

const CHART_TYPE_TO_SERIES: Record<ChartTypeId, SeriesTypeId> = {
	candlestick: "Candlestick",
	hollow: "HollowCandle",
	ohlc: "OHLC",
	heikinashi: "HeikinAshi",
	line: "Line",
	area: "Area",
};

const MAIN_PRICE_SERIES_TYPES: SeriesTypeId[] = ["Candlestick", "HollowCandle", "OHLC", "HeikinAshi", "Line", "Area", "Bar"];

const TOOL_DEFS = ["cursor", "crosshair", "trendLine", "hLine", "vLine", "fibonacci", "channel", "text"] as const;
type ToolId = typeof TOOL_DEFS[number];

function normalizeDate(value: Date | number) {
	return value instanceof Date ? value : new Date(value);
}

function chartDomain(data: Array<{ date: Date | number }>) {
	const end = data.length - 1;
	const start = Math.max(0, end - 140);
	return [normalizeDate(data[start].date), normalizeDate(data[end].date)] as [Date, Date];
}

function paneTemplate(label: string, heightRatio: number, series: SeriesConfig[] = [{ type: "Line", yAxis: "right" }]): Omit<PaneDescriptor, "id"> {
	return {
		label,
		pinned: false,
		visible: true,
		heightRatio,
		series,
		splitScale: false,
		tooltip: "value",
	};
}

// SVG tool icons
function ToolIcon({ id }: { id: string }) {
	switch (id) {
		case "cursor":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<path d="M3 2l10 6.8-5.5 1.2-2.8 5.3L3 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
				</svg>
			);
		case "crosshair":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
					<line x1="8" y1="1" x2="8" y2="4.5" stroke="currentColor" strokeWidth="1.4" />
					<line x1="8" y1="11.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.4" />
					<line x1="1" y1="8" x2="4.5" y2="8" stroke="currentColor" strokeWidth="1.4" />
					<line x1="11.5" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.4" />
				</svg>
			);
		case "trendLine":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<circle cx="3" cy="13" r="1.5" fill="currentColor" />
					<circle cx="13" cy="3" r="1.5" fill="currentColor" />
					<line x1="4" y1="12" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5" />
				</svg>
			);
		case "hLine":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
					<circle cx="3" cy="8" r="1.5" fill="currentColor" />
				</svg>
			);
		case "vLine":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<line x1="8" y1="1" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
					<circle cx="8" cy="13" r="1.5" fill="currentColor" />
				</svg>
			);
		case "fibonacci":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<line x1="1" y1="4"  x2="15" y2="4"  stroke="currentColor" strokeWidth="1" />
					<line x1="1" y1="8"  x2="15" y2="8"  stroke="currentColor" strokeWidth="1.5" />
					<line x1="1" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1" />
				</svg>
			);
		case "channel":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<line x1="1" y1="4"  x2="15" y2="9"  stroke="currentColor" strokeWidth="1.5" />
					<line x1="1" y1="8"  x2="15" y2="13" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
				</svg>
			);
		case "text":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16">
					<text x="2" y="13" fontSize="13" fontWeight="700" fill="currentColor" fontFamily="Georgia, serif">T</text>
				</svg>
			);
		case "settings":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
					<path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
				</svg>
			);
		default:
			return <span style={{ fontSize: 11 }}>?</span>;
	}
}

export default function LibraryShowcaseDemo() {
	const { language, setLanguage, t, getPaneLabel } = useDemoI18n();
	const shellRef = useRef<HTMLDivElement | null>(null);
	const chartMenuRef = useRef<HTMLDivElement | null>(null);
	const [chartWidth, setChartWidth] = useState(0);
	const [chartHeight, setChartHeight] = useState(0);
	const [timeframe, setTimeframe] = useState<Timeframe>("1h");
	const [chartType, setChartType] = useState<ChartTypeId>("candlestick");
	const [showChartMenu, setShowChartMenu] = useState(false);
	const [showPanesMenu, setShowPanesMenu] = useState(false);
	const panesMenuRef = useRef<HTMLDivElement | null>(null);
	const [activeTool, setActiveTool] = useState<string>("cursor");
	const [selectedPaneId, setSelectedPaneId] = useState("price");

	const [settingsSection, setSettingsSection] = useState<SettingsSection>("layout");
	const [settingsPaneId, setSettingsPaneId] = useState("price");
	const [maxVisiblePanes, setMaxVisiblePanes] = useState(() => loadDemoSettings().maxVisiblePanes);
	const [settingsOpen, setSettingsOpen] = useState(false);

	// Live Binance data state
	const [liveData, setLiveData] = useState<RawOHLCV[]>([]);
	const [dataStatus, setDataStatus] = useState<"loading" | "live" | "offline" | "error">("loading");
	const [dataError, setDataError] = useState<string>("");

	const paneState = useDynamicPanes(chartHeight, { maxVisiblePanes });

	useEffect(() => {
		saveDemoSettings(maxVisiblePanes);
	}, [maxVisiblePanes]);

	// Fetch live Binance data on mount and on timeframe change
	useEffect(() => {
		const abortController = new AbortController();
		setDataStatus("loading");
		setDataError("");

		fetchLiveDemoBars({ interval: timeframe, limit: 300, signal: abortController.signal })
			.then((bars) => {
				if (abortController.signal.aborted) return;
				setLiveData(bars);
				setDataStatus("live");
			})
			.catch((err: unknown) => {
				if (abortController.signal.aborted) return;
				const msg = err instanceof Error ? err.message : String(err);
				setDataError(msg);
				// Fallback to offline data
				setLiveData(getOfflineDemoBars());
				setDataStatus("offline");
			});

		return () => abortController.abort();
	}, [timeframe]);

	const data = useMemo<RawOHLCV[]>(
		() => (liveData.length > 0 ? liveData : getOfflineDemoBars()),
		[liveData],
	);

	const indicatorSeries = useMemo(
		() => paneState.panes.flatMap((pane) => pane.series),
		[paneState.panes],
	);

	// Heikin Ashi transform — reuse base indicator fields, swap OHLC only
	const plotData = useMemo<EnrichedDatum[]>(() => {
		const enrichedData = enrichData(data, { series: indicatorSeries });
		if (chartType !== "heikinashi" || enrichedData.length === 0) return enrichedData;
		const haCalc = heikinAshi();
		const transformed = haCalc(enrichedData as any[]) as any[];
		return transformed.map((bar: any, i: number) => ({
			...enrichedData[i],
			open:  bar.open,
			high:  bar.high,
			low:   bar.low,
			close: bar.close,
		}));
	}, [data, chartType, indicatorSeries]);

	// scaleTime + default candlestick width can collapse to near-zero body width.
	// Use distance between adjacent bars in screen space for stable candle bodies.
	const candleWidth = useMemo(() => {
		return (
			props: { widthRatio?: number },
			moreProps: {
				xScale: (value: Date) => number;
				xAccessor: (datum: EnrichedDatum) => Date;
				plotData: EnrichedDatum[];
			},
		): number => {
			const { xScale, xAccessor, plotData } = moreProps;
			const ratio = props.widthRatio ?? 0.8;
			if (plotData.length < 2) return 6;

			const first = xAccessor(plotData[0]);
			const second = xAccessor(plotData[1]);
			const stepPx = Math.abs(xScale(second) - xScale(first));

			if (!Number.isFinite(stepPx) || stepPx <= 0) return 6;
			return Math.max(3, stepPx * ratio);
		};
	}, []);

	const xExtents = useMemo(() => chartDomain(plotData), [plotData]);
	const lastBar = plotData[plotData.length - 1];

	const selectedPane = useMemo(
		() => paneState.panes.find((pane) => pane.id === selectedPaneId) ?? paneState.visiblePanes[0] ?? paneState.panes[0],
		[paneState.panes, paneState.visiblePanes, selectedPaneId],
	);

	const paneLabel = useCallback((pane: PaneDescriptor) => getPaneLabel(pane.id, pane.label), [getPaneLabel]);
	const localizePane = useCallback((pane: PaneDescriptor): PaneDescriptor => {
		const nextLabel = paneLabel(pane);
		return nextLabel === pane.label ? pane : { ...pane, label: nextLabel };
	}, [paneLabel]);
	const chartTypeLabel = useCallback((type: ChartTypeId) => t(`chartType.${type}`), [t]);
	const toolLabel = useCallback((toolId: ToolId) => t(`tool.${toolId}`), [t]);

	useEffect(() => {
		if (!selectedPane && paneState.panes.length > 0) {
			setSelectedPaneId(paneState.visiblePanes[0]?.id ?? paneState.panes[0].id);
		}
	}, [paneState.panes, paneState.visiblePanes, selectedPane]);

	// Switch the primary price series and chartType atomically in one callback.
	// By calling both pane dispatches and setChartType inside the same synchronous
	// event handler, React 18 batches all updates into a single render, preventing
	// the intermediate frame where chartType="candlestick" but pane.series still
	// contains "Bar" (which forced y-domain [0..80k] and made bars fill the pane).
	const handleChartTypeChange = useCallback((nextType: ChartTypeId) => {
		const desiredType = CHART_TYPE_TO_SERIES[nextType];
		const pricePane = paneState.panes.find((pane) => pane.id === "price");
		if (pricePane) {
			pricePane.series.forEach((series) => {
				if (MAIN_PRICE_SERIES_TYPES.includes(series.type) && series.type !== desiredType) {
					paneState.removeSeries(pricePane.id, series.type);
				}
			});
			if (!pricePane.series.some((series) => series.type === desiredType)) {
				paneState.addSeries(pricePane.id, { type: desiredType, yAxis: "right" });
			}
		}
		setChartType(nextType);
	}, [paneState.panes, paneState.addSeries, paneState.removeSeries]);

	// Safety-net: if panes are reset externally (e.g. resetToDefault) while a
	// non-default chartType is active, re-sync the primary series to match.
	useEffect(() => {
		const pricePane = paneState.panes.find((pane) => pane.id === "price");
		if (!pricePane) return;
		const desiredType = CHART_TYPE_TO_SERIES[chartType];
		const primary = pricePane.series.find((s) => MAIN_PRICE_SERIES_TYPES.includes(s.type));
		// Already in sync — nothing to do
		if (primary?.type === desiredType && pricePane.series.filter((s) => MAIN_PRICE_SERIES_TYPES.includes(s.type)).length === 1) {
			return;
		}
		pricePane.series.forEach((s) => {
			if (MAIN_PRICE_SERIES_TYPES.includes(s.type) && s.type !== desiredType) {
				paneState.removeSeries(pricePane.id, s.type);
			}
		});
		if (!pricePane.series.some((s) => s.type === desiredType)) {
			paneState.addSeries(pricePane.id, { type: desiredType, yAxis: "right" });
		}
	}, [chartType, paneState.panes, paneState.addSeries, paneState.removeSeries]);

	useEffect(() => {
		const node = shellRef.current;
		if (!node) return;

		const readSize = () => {
			// getBoundingClientRect forces a synchronous layout and always returns
			// accurate post-resize dimensions regardless of how the resize was triggered.
			const rect = node.getBoundingClientRect();
			const w = Math.floor(rect.width);
			const h = Math.floor(rect.height);
			if (w > 0 && h > 0) {
				setChartWidth(w);
				setChartHeight(h);
			}
		};

		// Initial measurement
		readSize();

		// ResizeObserver covers CSS/layout-driven resizes (e.g., pane splitter)
		const observer = new ResizeObserver(readSize);
		observer.observe(node);

		// window resize listener guarantees detection of browser-window resizes,
		// which is the primary scenario where ResizeObserver may fire late or not at all.
		window.addEventListener("resize", readSize);

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", readSize);
		};
	}, []);

	const chartReady = chartWidth > 0 && chartHeight > 0 && plotData.length > 0 && paneState.visiblePanes.length > 0;

	// Close chart type menu when clicking outside
	useEffect(() => {
		if (!showChartMenu) return;
		const handler = (e: MouseEvent) => {
			if (chartMenuRef.current && !chartMenuRef.current.contains(e.target as Node)) {
				setShowChartMenu(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [showChartMenu]);

	// Close panes menu when clicking outside
	useEffect(() => {
		if (!showPanesMenu) return;
		const handler = (e: MouseEvent) => {
			if (panesMenuRef.current && !panesMenuRef.current.contains(e.target as Node)) {
				setShowPanesMenu(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [showPanesMenu]);

	const ratio = window.devicePixelRatio || 1;
	const priceIsUp = (lastBar?.close ?? 0) >= (lastBar?.open ?? 0);

	// ── Theme ─────────────────────────────────────────────────────────────────
	const { theme, toggleTheme, isDark } = useChartTheme();

	useEffect(() => {
		document.documentElement.setAttribute("data-chart-theme", theme);
	}, [theme]);

	useEffect(() => {
		return () => {
			document.documentElement.removeAttribute("data-chart-theme");
		};
	}, []);

	const { visiblePanes, heights: paneHeights, applyDelta, resetToDefault, available } = paneState;

	// Theme-aware canvas element colours (canvas is drawn programmatically,
	// so it doesn't pick up CSS vars automatically).
	const axisStroke    = isDark ? "#d1d4dc" : "#1e2a3b";
	const axisTickFill  = isDark ? "#d1d4dc" : "#1e2a3b";
	const canvasBg      = isDark ? "#1e2130" : "#ffffff";

	const addPane = () => {
		paneState.addPane(paneTemplate(t("library.genericPaneLabel", { index: paneState.panes.length + 1 }), 0.18));
	};

	const paneHeaderLabels = useMemo(() => ({
		dragAriaLabel: (label: string) => t("library.dragPane", { pane: label }),
		dragTitle: (pane: PaneDescriptor) => pane.pinned ? t("library.dragDisabled") : t("library.dragTitle"),
		addSeriesAriaLabel: (label: string) => t("library.addSeriesToPane", { pane: label }),
		addSeriesTitle: t("library.addSeries"),
		toggleVisibleAriaLabel: (label: string, visible: boolean) => t(visible ? "library.hidePaneAria" : "library.showPaneAria", { pane: label }),
		toggleVisibleTitle: (pane: PaneDescriptor) => pane.pinned ? t("library.primaryPaneLocked") : t(pane.visible ? "library.hidePane" : "library.restorePane"),
		removeAriaLabel: (label: string) => t("library.hidePaneAria", { pane: label }),
		removeTitle: t("library.removePaneHint"),
	}), [t]);

	const indicatorLegendLabels = useMemo(() => ({
		showIndicatorTitle: t("library.showIndicator"),
		hideIndicatorTitle: t("library.hideIndicator"),
		removeIndicatorTitle: t("library.removeIndicator"),
		showIndicatorAriaLabel: (label: string) => t("library.showIndicatorAria", { series: label }),
		hideIndicatorAriaLabel: (label: string) => t("library.hideIndicatorAria", { series: label }),
		removeIndicatorAriaLabel: (label: string) => t("library.removeIndicatorAria", { series: label }),
	}), [t]);

	const openSettings = useCallback((section: SettingsSection, paneId?: string) => {
		setSettingsSection(section);
		if (paneId) {
			setSettingsPaneId(paneId);
		}
		setSettingsOpen(true);
	}, []);

	const closeSettings = useCallback(() => {
		setSettingsOpen(false);
	}, []);

	const handleResetSettings = useCallback(() => {
		paneState.resetToDefault();
		setMaxVisiblePanes(DEFAULT_MAX_VISIBLE_PANES);
		saveDemoSettings(DEFAULT_MAX_VISIBLE_PANES);
		setSettingsSection("layout");
		setSettingsPaneId("price");
		setSettingsOpen(false);
	}, [paneState]);

	return (
		<div className="gc-terminal" data-chart-theme={theme}>
			<header className="gc-topbar">
				<div className="gc-topbar__left">
					<div className="gc-logo" aria-label={t("library.topbarAria")}>BT</div>

					<div className="gc-symbol-block">
						<span className="gc-symbol-name">BTCUSD</span>
						<span className="gc-symbol-exchange">BINANCE</span>
					</div>

					<div className="gc-topbar-sep" />

					<nav className="gc-tf-chips" aria-label={t("library.timeframes")}>
						{TIMEFRAMES.map((tf) => (
							<button
								key={tf}
								type="button"
								className={`gc-tf-chip${timeframe === tf ? " gc-tf-chip--active" : ""}`}
								onClick={() => setTimeframe(tf)}
							>
								{tf}
							</button>
						))}
					</nav>

					<div className="gc-topbar-sep" />

					<div className="gc-chart-type-wrap" ref={chartMenuRef}>
						<button
							type="button"
							className={`gc-topbar-btn gc-chart-type-btn${showChartMenu ? " gc-topbar-btn--active" : ""}`}
							onClick={() => setShowChartMenu((v) => !v)}
						>
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginRight: 4 }}>
								<rect x="1" y="10" width="3" height="5" fill="currentColor" rx="1" />
								<rect x="6" y="6" width="3" height="9" fill="currentColor" rx="1" />
								<rect x="11" y="2" width="3" height="13" fill="currentColor" rx="1" />
							</svg>
							{chartTypeLabel(chartType)}
							<svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 4 }}>
								<path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
							</svg>
						</button>

						{showChartMenu && (
							<div className="gc-chart-type-menu">
								{CHART_TYPES.map((id) => (
									<button
										key={id}
										type="button"
										className={`gc-chart-type-item${chartType === id ? " gc-chart-type-item--active" : ""}`}
										onClick={() => {
											handleChartTypeChange(id);
											setShowChartMenu(false);
										}}
									>
										{chartType === id && (
											<svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: 6 }}>
												<path d="M2 6l3 3 5-5" stroke="#2962ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										)}
										{chartTypeLabel(id)}
									</button>
								))}
							</div>
						)}
					</div>

					<button type="button" className="gc-topbar-btn">{t("library.compare")}</button>
					<button type="button" className="gc-topbar-btn">{t("library.replay")}</button>

					<div className="gc-topbar-sep" />
					<div className="gc-chart-type-wrap" ref={panesMenuRef}>
						<button
							type="button"
							className={`gc-topbar-btn${showPanesMenu ? " gc-topbar-btn--active" : ""}`}
							onClick={() => setShowPanesMenu((v) => !v)}
							title={t("library.managePanes")}
						>
							<svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ marginRight: 4 }}>
								<rect x="1" y="1" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
								<rect x="1" y="9" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
							</svg>
							{t("common.panes")}
							<svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 4 }}>
								<path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
							</svg>
						</button>

						{showPanesMenu && (
							<div className="gc-chart-type-menu">
								{paneState.panes.map((pane) => (
									<button
										key={pane.id}
										type="button"
										className={`gc-chart-type-item${pane.visible ? " gc-chart-type-item--active" : ""}`}
										onClick={() => {
											if (!pane.pinned) {
												paneState.toggleVisible(pane.id);
											}
										}}
										disabled={pane.pinned}
										title={pane.pinned ? t("library.primaryPaneLocked") : pane.visible ? t("library.hidePane") : t("library.showPane")}
									>
										{pane.visible ? (
											<svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: 6, flexShrink: 0 }}>
												<path d="M2 6l3 3 5-5" stroke="#2962ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										) : (
											<span style={{ display: "inline-block", width: 18, flexShrink: 0 }} />
										)}
										{paneLabel(pane)}
										{pane.pinned && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.5 }}>🔒</span>}
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				<div className="gc-topbar__right">
					{dataStatus === "live" && <span className="gc-live-badge">{t("common.liveBinance")}</span>}
					{dataStatus === "offline" && <span className="gc-offline-badge" title={dataError}>{t("common.offlineFallback")}</span>}
					{dataStatus === "loading" && <span className="gc-loading-badge">{t("common.loading")}</span>}
					<div className="gc-chart-type-wrap" role="group" aria-label={t("language.label")}>
						<button type="button" className={`gc-topbar-btn${language === "vi" ? " gc-topbar-btn--active" : ""}`} onClick={() => setLanguage("vi")}>
							{t("language.vi")}
						</button>
						<button type="button" className={`gc-topbar-btn${language === "en" ? " gc-topbar-btn--active" : ""}`} onClick={() => setLanguage("en")}>
							{t("language.en")}
						</button>
					</div>
					<span className="gc-version-text">v{version}</span>
					<div className="gc-topbar-sep" />
					<button
						type="button"
						className="gc-topbar-btn gc-theme-toggle"
						onClick={toggleTheme}
						title={isDark ? t("library.switchToLight") : t("library.switchToDark")}
						aria-label={isDark ? t("library.switchToLightAria") : t("library.switchToDarkAria")}
					>
						{isDark ? (
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
								<circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
								<line x1="8" y1="1" x2="8" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
								<line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
								<line x1="1" y1="8" x2="3" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
								<line x1="13" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
								<line x1="3.05" y1="3.05" x2="4.46" y2="4.46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
								<line x1="11.54" y1="11.54" x2="12.95" y2="12.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
								<line x1="11.54" y1="4.46" x2="12.95" y2="3.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
								<line x1="3.05" y1="12.95" x2="4.46" y2="11.54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
							</svg>
						) : (
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
								<path d="M13.5 10.5A6 6 0 0 1 5.5 2.5a6 6 0 1 0 8 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
							</svg>
						)}
					</button>
					<button
						type="button"
						className="gc-topbar-btn gc-theme-toggle"
						onClick={() => {
							openSettings("layout", selectedPane?.id ?? "price");
						}}
						title={t("settings.open")}
						aria-label={t("settings.openDialog")}
					>
						<ToolIcon id="settings" />
					</button>
					<button type="button" className="gc-upgrade-btn">{t("library.upgrade")}</button>
				</div>
			</header>

			<div className="gc-main">
				<aside className="gc-tools" aria-label={t("library.drawingTools")}>
					{TOOL_DEFS.map((id) => (
						<button
							key={id}
							type="button"
							title={toolLabel(id)}
							aria-pressed={activeTool === id}
							className={`gc-tool-btn${activeTool === id ? " gc-tool-btn--active" : ""}`}
							onClick={() => setActiveTool(id)}
						>
							<ToolIcon id={id} />
						</button>
					))}
				</aside>

				<section className="gc-chart-area">
					<div className="gc-ohlc-strip">
						<span className="gc-ohlc-pair">BTCUSD <span className="gc-ohlc-tf">· {timeframe}</span></span>
						{dataStatus !== "loading" && lastBar ? (
							<>
								<span className="gc-ohlc-item">O <b>{priceFormat(lastBar.open)}</b></span>
								<span className="gc-ohlc-item">H <b className="gc-col-up">{priceFormat(lastBar.high)}</b></span>
								<span className="gc-ohlc-item">L <b className="gc-col-dn">{priceFormat(lastBar.low)}</b></span>
								<span className="gc-ohlc-item">C <b className={priceIsUp ? "gc-col-up" : "gc-col-dn"}>{priceFormat(lastBar.close)}</b></span>
								<span className="gc-ohlc-item gc-ohlc-vol">{t("library.volumeShort")} <b>{volumeFormat(lastBar.volume)}</b></span>
								<span className="gc-ohlc-item gc-ohlc-bars">{t("library.pairBars", { count: data.length })}</span>
							</>
						) : (
							<span className="gc-ohlc-loading">{t("library.loadingPriceData")}</span>
						)}
					</div>

					<div className="gc-chart-shell" ref={shellRef} style={{ background: canvasBg }}>
						{dataStatus === "loading" ? (
							<div className="gc-chart-placeholder gc-chart-loading">
								<div className="gc-spinner" />
								<span>{t("library.loadingRealData")}</span>
							</div>
						) : chartReady ? (
							<>
								<ChartCanvas
									key={`chart-canvas-${chartType}-${timeframe}-${theme}`}
									height={chartHeight}
									width={chartWidth}
									margin={{ left: 60, right: 68, top: 8, bottom: 28 }}
									type="hybrid"
									seriesName={`terminal-demo-${chartType}`}
									data={plotData}
									xScale={scaleTime()}
									xAccessor={(datum: EnrichedDatum) => datum.date}
									displayXAccessor={(datum: EnrichedDatum) => datum.date}
									xExtents={xExtents}
									ratio={ratio}
									mouseMoveEvent
									zoomEvent
									panEvent
									useCrossHairStyleCursor
								>
									{DynamicChart({
										panes: visiblePanes,
										heights: paneHeights,
										data: plotData as any,
										axisStroke,
										axisTickFill,
										isDark,
										dateFormat,
										priceFormat,
										volumeFormat,
									})}
								</ChartCanvas>

								{visiblePanes.map((pane, index) => {
									const paneTop = 8 + paneHeights.slice(0, index).reduce((sum, value) => sum + value, 0);
									const paneH = paneHeights[index] ?? 0;
									return (
										<Fragment key={pane.id}>
											<div
												className="rsc-pane-wrap"
												style={{
													position: "absolute",
													top: paneTop,
													left: 0,
													right: 0,
													height: 28,
													zIndex: 20,
												}}
											>
												{(() => {
													const localizedPane = localizePane(pane);
													return (
														<>
															<PaneHeader
																pane={localizedPane}
																onToggleVisible={() => paneState.toggleVisible(pane.id)}
																onRemove={() => paneState.removePane(pane.id)}
																onAddSeries={() => {
																	setSelectedPaneId(pane.id);
																	openSettings("indicators", pane.id);
																}}
																addButtonRef={undefined}
																labels={paneHeaderLabels}
															/>
															<IndicatorLegend
																pane={localizedPane}
																onToggleSeries={(seriesType, seriesIndex) => paneState.toggleSeriesVisible(pane.id, seriesType, seriesIndex)}
																onRemoveSeries={(seriesType, seriesIndex) => paneState.removeSeries(pane.id, seriesType, seriesIndex)}
																labels={indicatorLegendLabels}
															/>
														</>
													);
												})()}
											</div>
											<PaneLabel label={paneLabel(pane)} top={paneTop} height={paneH} />
										</Fragment>
									);
								})}
							</>
						) : (
							<div className="gc-chart-placeholder">{t("common.canvasInitializing")}</div>
						)}

						{chartReady && (
							<>
								{visiblePanes.slice(0, -1).map((pane, index) => {
									const top = 8 + paneHeights.slice(0, index + 1).reduce((sum, value) => sum + value, 0);
									return (
										<ChartSplitter
											key={`${pane.id}-splitter`}
											splitterIndex={index}
											available={available}
											onCommitDelta={applyDelta}
											onDoubleClick={resetToDefault}
												title={t("library.splitterHint")}
											style={{ top }}
										/>
									);
								})}
							</>
						)}
					</div>
				</section>

				{settingsOpen ? (
					<PaneSettingsModal
						open={settingsOpen}
						section={settingsSection}
						onSectionChange={setSettingsSection}
						selectedPaneId={settingsPaneId}
						onSelectedPaneIdChange={setSettingsPaneId}
						paneState={paneState}
						maxVisiblePanes={maxVisiblePanes}
						onMaxVisiblePanesChange={setMaxVisiblePanes}
						onAddPane={addPane}
						onReset={handleResetSettings}
						isDark={isDark}
						toggleTheme={toggleTheme}
						onClose={closeSettings}
					/>
				) : null}
			</div>

			<footer className="gc-bottombar">
				{(["1D", "5D", "1M", "3M", "YTD", "1Y", "All"] as const).map((range, index) => (
					<button
						key={range}
						type="button"
						className={`gc-bottom-btn${index === 0 ? " gc-bottom-btn--active" : ""}`}
					>
						{range}
					</button>
				))}
				<div className="gc-bottombar-sep" />
				<button type="button" className="gc-bottom-btn">{t("common.script")}</button>
				<button type="button" className="gc-bottom-btn">{t("common.alert")}</button>
				<button type="button" className="gc-bottom-btn">{t("common.trade")}</button>
				<div className="gc-grow" />
				<span className="gc-version-badge">v{version}</span>
				<button type="button" className="gc-publish-btn">{t("common.publish")}</button>
			</footer>
		</div>
	);
}
