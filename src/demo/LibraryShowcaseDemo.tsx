import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { format } from "d3-format";
import { scaleTime } from "d3-scale";
import { timeFormat } from "d3-time-format";

import {
	DynamicChart,
	PaneHeader,
	PaneLabel,
	IndicatorLegend,
	useDynamicPanes,
	DrawingLayer,
	DrawingInspector,
	DrawingListPanel,
	useDrawingInteraction,
	useDrawingStorage,
	BarReplayController,
	type PaneDescriptor,
	type BarReplayState,
	type SeriesConfig,
	type SeriesTypeId,
	type ReplaySpeed,
	ChartSplitter,
	useChartTheme,
	version,
} from "../index";
import type { DrawingObject } from "../lib/drawing/types";
import type { DrawingInspectorLabels } from "../lib/drawing/DrawingInspector";
import type { DrawingListPanelLabels } from "../lib/drawing/DrawingListPanel";
import { enrichData } from "../lib/core/calculators/enrichData";
import type { EnrichedDatum, RawOHLCV } from "../lib/core/calculators/types";
import ChartCanvas from "../lib/ChartCanvas";
import { heikinAshi } from "../lib/calculator";
import { fetchLiveDemoBars, getOfflineDemoBars } from "./demoData";
import DemoPageShell from "./DemoPageShell";
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

const TOOL_GROUPS = [
	{ id: "lines", tools: ["cursor", "crosshair", "trendLine", "ray", "extendedLine", "hLine", "vLine"] as const },
	{ id: "fibonacci", tools: ["fibonacci", "fibExtension"] as const },
	{ id: "shapes", tools: ["rectangle", "arrow", "polyline"] as const },
	{ id: "analysis", tools: ["channel", "text", "dateAndPriceRange", "longPosition", "shortPosition", "parallelChannel", "pitchfork", "abcdPattern", "fibArc", "fibTimeZone", "regressionChannel"] as const },
] as const;
type ToolId = typeof TOOL_GROUPS[number]["tools"][number];

const DRAWING_PANEL_WIDTH = 360;
const REPLAY_SPEEDS: ReplaySpeed[] = [0.5, 1, 2, 5, 10, "max"];

function getSelectedDrawingId(drawingState: { type: string; objectId?: string; object?: DrawingObject }) {
	switch (drawingState.type) {
		case "selected":
		case "moving":
		case "resizing":
		case "editing":
			return drawingState.objectId;
		case "complete":
			return drawingState.object?.id;
		default:
			return undefined;
	}
}

function clonePoint(point: { x: number; y: number }) {
	return { x: point.x, y: point.y };
}

function mergeDrawingPatch(drawing: DrawingObject, patch: Partial<DrawingObject>): DrawingObject {
	return {
		...drawing,
		...patch,
		points: patch.points ? patch.points.map(clonePoint) : drawing.points.map(clonePoint),
		style: patch.style ? { ...drawing.style, ...patch.style } : { ...drawing.style },
		updatedAt: Date.now(),
	};
}

function sortDrawings(drawings: readonly DrawingObject[]) {
	return [...drawings].sort((left, right) => {
		const leftZ = left.zIndex ?? 0;
		const rightZ = right.zIndex ?? 0;
		if (leftZ !== rightZ) {
			return leftZ - rightZ;
		}
		return left.createdAt - right.createdAt;
	});
}

function offsetDrawingByPixels(drawing: DrawingObject, xOffset: number, yOffset: number): DrawingObject {
	return {
		...drawing,
		id: `${drawing.id}-clone-${Date.now()}`,
		points: drawing.points.map((point) => ({ x: point.x + xOffset, y: point.y + yOffset })),
		style: { ...drawing.style },
		locked: false,
		visible: true,
		clonedFrom: drawing.id,
		zIndex: (drawing.zIndex ?? 0) + 1,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};
}

function normalizeDate(value: Date | number) {
	return value instanceof Date ? value : new Date(value);
}

function chartDomain(data: Array<{ date: Date | number }>) {
	if (data.length === 0) {
		return [new Date(0), new Date(0)] as [Date, Date];
	}

	if (data.length === 1) {
		return [normalizeDate(data[0].date), normalizeDate(data[0].date)] as [Date, Date];
	}

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
		case "ray":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<line x1="3" y1="12" x2="13" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
					<path d="M10.5 4H13V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			);
		case "extendedLine":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<line x1="2" y1="12" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
					<circle cx="2" cy="12" r="1.2" fill="currentColor" />
					<circle cx="14" cy="4" r="1.2" fill="currentColor" />
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
		case "fibExtension":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<line x1="1" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1" />
					<line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.3" />
					<line x1="1" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1" />
					<line x1="11" y1="3" x2="11" y2="13" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1" />
				</svg>
			);
		case "parallelChannel":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<line x1="2" y1="11" x2="13" y2="4" stroke="currentColor" strokeWidth="1.4" />
					<line x1="3" y1="13" x2="14" y2="6" stroke="currentColor" strokeWidth="1.1" strokeDasharray="3 2" />
					<line x1="1" y1="9" x2="12" y2="2" stroke="currentColor" strokeWidth="1.1" strokeDasharray="3 2" />
				</svg>
			);
		case "pitchfork":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<line x1="8" y1="13" x2="8" y2="5" stroke="currentColor" strokeWidth="1.4" />
					<line x1="8" y1="9" x2="3" y2="3" stroke="currentColor" strokeWidth="1.1" strokeDasharray="3 2" />
					<line x1="8" y1="9" x2="13" y2="3" stroke="currentColor" strokeWidth="1.1" strokeDasharray="3 2" />
				</svg>
			);
		case "abcdPattern":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<polyline points="2,12 5,6 9,10 13,4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
					<circle cx="2" cy="12" r="1" fill="currentColor" />
					<circle cx="13" cy="4" r="1" fill="currentColor" />
				</svg>
			);
		case "fibArc":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<path d="M3 11A5 5 0 0 1 13 11" stroke="currentColor" strokeWidth="1.3" />
					<path d="M4.2 11A3.8 3.8 0 0 1 11.8 11" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
				</svg>
			);
		case "fibTimeZone":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<line x1="3" y1="2" x2="3" y2="14" stroke="currentColor" strokeWidth="1.2" />
					<line x1="6" y1="2" x2="6" y2="14" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
					<line x1="10" y1="2" x2="10" y2="14" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
					<line x1="13" y1="2" x2="13" y2="14" stroke="currentColor" strokeWidth="1.2" />
				</svg>
			);
		case "regressionChannel":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<path d="M2 11l11-7" stroke="currentColor" strokeWidth="1.4" />
					<path d="M1.5 13l11-7" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
					<path d="M2.5 9l11-7" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
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
		case "rectangle":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<rect x="2" y="3" width="12" height="9" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
				</svg>
			);
		case "polyline":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<polyline points="2,12 5,9 8,11 12,5 14,7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
					<circle cx="2" cy="12" r="1" fill="currentColor" />
					<circle cx="14" cy="7" r="1" fill="currentColor" />
				</svg>
			);
		case "arrow":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<path d="M3 12L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
					<path d="M8.5 3H12V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			);
		case "dateAndPriceRange":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
					<path d="M4 6.5h8M4 9.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
				</svg>
			);
		case "longPosition":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
					<path d="M8 11V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
					<path d="M6.2 6.8L8 5l1.8 1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			);
		case "shortPosition":
			return (
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
					<path d="M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
					<path d="M6.2 9.2L8 11l1.8-1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
	const [showReplayBar, setShowReplayBar] = useState(false);
	const [showDrawingList, setShowDrawingList] = useState(false);
	const drawingInteraction = useDrawingInteraction();
	const { undo, redo, deleteSelected, cancelDrawing } = drawingInteraction;
	const importInputRef = useRef<HTMLInputElement | null>(null);
	const handleLoadDrawings = useCallback((drawings: DrawingObject[]) => {
		drawingInteraction.dispatch({ type: "REPLACE", drawings });
	}, [drawingInteraction.dispatch]);
	const drawingStorage = useDrawingStorage("BTCUSD", timeframe, drawingInteraction.allDrawings, handleLoadDrawings);

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
	const replayControllerRef = useRef<BarReplayController<RawOHLCV> | null>(null);
	if (replayControllerRef.current === null) {
		replayControllerRef.current = new BarReplayController<RawOHLCV>({
			allData: data,
			startIndex: data.length,
		});
	}
	const [replayState, setReplayState] = useState<BarReplayState<RawOHLCV>>(() => replayControllerRef.current!.getState());
	const [replayContextMenu, setReplayContextMenu] = useState<{
		x: number;
		y: number;
		date: Date | number;
		label: string;
	} | null>(null);

	useEffect(() => {
		const controller = replayControllerRef.current;
		if (!controller) {
			return;
		}

		return controller.subscribe(setReplayState);
	}, []);

	useEffect(() => {
		replayControllerRef.current?.setData(data, data.length);
	}, [data]);

	const indicatorSeries = useMemo(
		() => paneState.panes.flatMap((pane) => pane.series),
		[paneState.panes],
	);

	const replayVisibleData = useMemo(() => {
		if (replayState.visibleData.length > 1) {
			return replayState.visibleData;
		}

		if (replayState.currentIndex <= 0 || data.length <= 1) {
			return data;
		}

		return data.slice(0, Math.min(2, data.length));
	}, [data, replayState.currentIndex, replayState.visibleData]);

	// Heikin Ashi transform — reuse base indicator fields, swap OHLC only
	const plotData = useMemo<EnrichedDatum[]>(() => {
		const enrichedData = enrichData(replayVisibleData, { series: indicatorSeries });
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
	}, [chartType, indicatorSeries, replayVisibleData]);

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
	const selectedDrawingId = useMemo(() => getSelectedDrawingId(drawingInteraction.drawingState), [drawingInteraction.drawingState]);
	const sortedDrawings = useMemo(() => sortDrawings(drawingInteraction.allDrawings), [drawingInteraction.allDrawings]);
	const selectedDrawing = useMemo(() => sortedDrawings.find((drawing) => drawing.id === selectedDrawingId) ?? null, [selectedDrawingId, sortedDrawings]);
	const drawingPanelX = useMemo(() => Math.max(16, chartWidth - DRAWING_PANEL_WIDTH - 16), [chartWidth]);
	const drawingInspectorPosition = useMemo(() => ({ x: drawingPanelX, y: 16 }), [drawingPanelX]);
	const drawingListPosition = useMemo(() => ({ x: drawingPanelX, y: 286 }), [drawingPanelX]);
	const storageToolbarPosition = useMemo(() => ({ x: 16, y: 16 }), []);
	const replayProgressLabel = t("replay.progress", {
		current: replayState.currentIndex,
		total: replayState.allData.length,
	});
	const replayToggleTitle = replayState.isPlaying ? t("replay.pause") : t("replay.play");
	const replayController = replayControllerRef.current;

	const handleReplayToggle = useCallback(() => {
		if (!replayController) {
			return;
		}

		if (replayController.isPlayingNow()) {
			replayController.pause();
			return;
		}

		if (replayController.getCurrentIndex() >= replayController.getState().allData.length) {
			replayController.rewind();
		}

		replayController.play();
	}, [replayController]);

	const handleReplayRewind = useCallback(() => {
		replayController?.rewind();
	}, [replayController]);

	const handleReplayStepBack = useCallback(() => {
		replayController?.stepBack();
	}, [replayController]);

	const handleReplayStepForward = useCallback(() => {
		replayController?.stepForward();
	}, [replayController]);

	const handleReplayJumpLatest = useCallback(() => {
		replayController?.jumpToLatest();
	}, [replayController]);

	const handleReplaySpeedChange = useCallback((speed: ReplaySpeed) => {
		replayController?.setSpeed(speed);
	}, [replayController]);

	const closeReplayContextMenu = useCallback(() => {
		setReplayContextMenu(null);
	}, []);

	const handleReplayFromHere = useCallback(() => {
		if (!replayController || !replayContextMenu) {
			return;
		}

		replayController.jumpToDate(replayContextMenu.date);
		replayController.play();
		setReplayContextMenu(null);
	}, [replayContextMenu, replayController]);

	const handleReplayContextMenu = useCallback((moreProps: { currentItem?: EnrichedDatum }, event: unknown) => {
		const currentItem = moreProps.currentItem;
		if (!currentItem?.date) {
			return;
		}

		const shellNode = shellRef.current;
		if (!shellNode) {
			return;
		}

		const nativeEvent = event as MouseEvent | undefined;
		const rect = shellNode.getBoundingClientRect();
		const x = Math.min(Math.max(12, (nativeEvent?.clientX ?? rect.left) - rect.left + 8), Math.max(12, rect.width - 198));
		const y = Math.min(Math.max(12, (nativeEvent?.clientY ?? rect.top) - rect.top + 8), Math.max(12, rect.height - 92));

		setReplayContextMenu({
			x,
			y,
			date: currentItem.date,
			label: dateFormat(normalizeDate(currentItem.date)),
		});
	}, [dateFormat]);

	useEffect(() => {
		if (!replayContextMenu) {
			return;
		}

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setReplayContextMenu(null);
			}
		};

		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [replayContextMenu]);

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
	const handleDrawingToolUsed = useCallback(() => setActiveTool("cursor"), []);
	const updateSelectedDrawing = useCallback((patch: Partial<DrawingObject>) => {
		if (!selectedDrawing) {
			return;
		}

		const nextDrawings = drawingInteraction.allDrawings.map((drawing) => (
			drawing.id === selectedDrawing.id ? mergeDrawingPatch(drawing, patch) : drawing
		));
		drawingInteraction.dispatch({ type: "REPLACE", drawings: nextDrawings });
	}, [drawingInteraction.allDrawings, drawingInteraction.dispatch, selectedDrawing]);

	const toggleSelectedLock = useCallback(() => {
		if (!selectedDrawing) {
			return;
		}
		updateSelectedDrawing({ locked: !selectedDrawing.locked });
	}, [selectedDrawing, updateSelectedDrawing]);

	const toggleSelectedVisible = useCallback(() => {
		if (!selectedDrawing) {
			return;
		}
		updateSelectedDrawing({ visible: selectedDrawing.visible === false });
	}, [selectedDrawing, updateSelectedDrawing]);

	const bringSelectedToFront = useCallback(() => {
		if (!selectedDrawing) {
			return;
		}
		const maxZ = drawingInteraction.allDrawings.reduce((currentMax, drawing) => Math.max(currentMax, drawing.zIndex ?? 0), 0);
		updateSelectedDrawing({ zIndex: maxZ + 1 });
	}, [drawingInteraction.allDrawings, selectedDrawing, updateSelectedDrawing]);

	const sendSelectedToBack = useCallback(() => {
		if (!selectedDrawing) {
			return;
		}
		const minZ = drawingInteraction.allDrawings.reduce((currentMin, drawing) => Math.min(currentMin, drawing.zIndex ?? 0), 0);
		updateSelectedDrawing({ zIndex: minZ - 1 });
	}, [drawingInteraction.allDrawings, selectedDrawing, updateSelectedDrawing]);

	const cloneSelectedDrawing = useCallback(() => {
		if (!selectedDrawing || chartWidth <= 0 || chartHeight <= 0 || plotData.length < 2) {
			return;
		}

		const firstBar = plotData[0];
		const lastVisibleBar = plotData[plotData.length - 1];
		const allPrices = plotData.flatMap((bar) => [bar.open, bar.high, bar.low, bar.close]);
		const minPrice = Math.min(...allPrices);
		const maxPrice = Math.max(...allPrices);
		const innerWidth = Math.max(1, chartWidth - 128);
		const innerHeight = Math.max(1, chartHeight - 56);
		const timeOffset = ((new Date(lastVisibleBar.date).getTime() - new Date(firstBar.date).getTime()) / innerWidth) * 20;
		const priceOffset = -((maxPrice - minPrice) / innerHeight) * 20;

		const nextClone = offsetDrawingByPixels(selectedDrawing, timeOffset, priceOffset);
		drawingInteraction.dispatch({ type: "REPLACE", drawings: [...drawingInteraction.allDrawings, nextClone] });
		drawingInteraction.dispatch({ type: "SELECT_OBJECT", objectId: nextClone.id });
		setActiveTool("cursor");
	}, [chartHeight, chartWidth, drawingInteraction.allDrawings, drawingInteraction.dispatch, plotData, selectedDrawing]);

	const deleteSelectedDrawing = useCallback(() => {
		if (!selectedDrawing) {
			return;
		}
		deleteSelected();
	}, [deleteSelected, selectedDrawing]);

	const selectDrawingById = useCallback((drawingId: string) => {
		setActiveTool("cursor");
		drawingInteraction.dispatch({ type: "SELECT_OBJECT", objectId: drawingId });
	}, [drawingInteraction.dispatch]);

	const toggleDrawingVisibleById = useCallback((drawingId: string) => {
		const nextDrawings = drawingInteraction.allDrawings.map((drawing) => (
			drawing.id === drawingId ? mergeDrawingPatch(drawing, { visible: drawing.visible === false }) : drawing
		));
		drawingInteraction.dispatch({ type: "REPLACE", drawings: nextDrawings });
	}, [drawingInteraction.allDrawings, drawingInteraction.dispatch]);

	const deleteDrawingById = useCallback((drawingId: string) => {
		const target = drawingInteraction.allDrawings.find((drawing) => drawing.id === drawingId);
		if (!target || target.locked) {
			return;
		}
		drawingInteraction.dispatch({ type: "REPLACE", drawings: drawingInteraction.allDrawings.filter((drawing) => drawing.id !== drawingId) });
	}, [drawingInteraction.allDrawings, drawingInteraction.dispatch]);

	const drawingInspectorLabels = useMemo<DrawingInspectorLabels>(() => ({
		title: t("drawing.inspectorTitle"),
		stroke: t("drawing.stroke"),
		fill: t("drawing.fill"),
		strokeWidth: t("drawing.strokeWidth"),
		lineStyle: t("drawing.lineStyle"),
		opacity: t("drawing.opacity"),
		solid: t("drawing.solid"),
		dashed: t("drawing.dashed"),
		dotted: t("drawing.dotted"),
		lock: t("drawing.lock"),
		unlock: t("drawing.unlock"),
		clone: t("drawing.clone"),
		hide: t("drawing.hide"),
		show: t("drawing.show"),
		bringToFront: t("drawing.bringToFront"),
		sendToBack: t("drawing.sendToBack"),
		delete: t("drawing.delete"),
		close: t("drawing.close"),
	}), [t]);

	const drawingListPanelLabels = useMemo<DrawingListPanelLabels>(() => ({
		title: t("drawing.drawingsList"),
		empty: t("drawing.drawingsListEmpty"),
		visible: t("drawing.visible"),
		hidden: t("drawing.hidden"),
		locked: t("drawing.locked"),
		selected: t("drawing.selected"),
		delete: t("drawing.delete"),
	}), [t]);

	const handleExportDrawings = useCallback(() => {
		drawingStorage.exportJSON();
	}, [drawingStorage]);

	const handleImportButtonClick = useCallback(() => {
		importInputRef.current?.click();
	}, []);

	const handleImportFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) {
			return;
		}
		drawingStorage.importJSON(file).catch(() => undefined);
	}, [drawingStorage]);

	const handleClearDrawings = useCallback(() => {
		drawingStorage.clearAll();
	}, [drawingStorage]);

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

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
				return;
			}

			if (event.key === "Escape") {
				event.preventDefault();
				cancelDrawing();
				setActiveTool("cursor");
				return;
			}

			if (event.key === "Delete" || event.key === "Backspace") {
				event.preventDefault();
				deleteSelected();
				return;
			}

			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
				event.preventDefault();
				if (event.shiftKey) {
					redo();
				} else {
					undo();
				}
				return;
			}

			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
				event.preventDefault();
				redo();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [cancelDrawing, deleteSelected, redo, setActiveTool, undo]);

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
		<DemoPageShell className="demo-page--terminal" frameClassName="demo-frame--terminal">
			<div className={`gc-terminal gc-terminal--embedded${showReplayBar ? " gc-terminal--replay-bar" : ""}`} data-chart-theme={theme}>
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
					<button
						type="button"
						className={`gc-topbar-btn${showReplayBar ? " gc-topbar-btn--active" : ""}`}
						onClick={() => setShowReplayBar((v) => !v)}
						title={t("replay.controls")}
						aria-pressed={showReplayBar}
					>
						<svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ marginRight: 4 }}>
							<polygon points="4,2 14,8 4,14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill={showReplayBar ? "currentColor" : "none"} />
						</svg>
						{t("library.replay")}
					</button>

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

			{showReplayBar && (
				<div className="gc-replay-bar" role="group" aria-label={t("replay.controls")}>
					<button type="button" className="gc-replay-bar__btn" onClick={handleReplayRewind} title={t("replay.rewind")} aria-label={t("replay.rewind")}>
						<svg width="13" height="13" viewBox="0 0 16 16" fill="none">
							<path d="M13 2v12M4 8l7-5v10L4 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
						</svg>
					</button>
					<button type="button" className="gc-replay-bar__btn" onClick={handleReplayStepBack} title={t("replay.stepBack")} aria-label={t("replay.stepBack")}>
						<svg width="13" height="13" viewBox="0 0 16 16" fill="none">
							<path d="M11 3L5 8l6 5V3z" fill="currentColor" />
						</svg>
					</button>
					<button
						type="button"
						className={`gc-replay-bar__btn${replayState.isPlaying ? " gc-replay-bar__btn--active" : ""}`}
						onClick={handleReplayToggle}
						title={replayToggleTitle}
						aria-pressed={replayState.isPlaying}
					>
						{replayState.isPlaying ? (
							<svg width="13" height="13" viewBox="0 0 16 16" fill="none">
								<rect x="3" y="3" width="4" height="10" fill="currentColor" rx="1" />
								<rect x="9" y="3" width="4" height="10" fill="currentColor" rx="1" />
							</svg>
						) : (
							<svg width="13" height="13" viewBox="0 0 16 16" fill="none">
								<polygon points="3,2 14,8 3,14" fill="currentColor" />
							</svg>
						)}
						<span style={{ fontSize: 11 }}>{replayToggleTitle}</span>
					</button>
					<button type="button" className="gc-replay-bar__btn" onClick={handleReplayStepForward} title={t("replay.stepForward")} aria-label={t("replay.stepForward")}>
						<svg width="13" height="13" viewBox="0 0 16 16" fill="none">
							<path d="M5 3l6 5-6 5V3z" fill="currentColor" />
						</svg>
					</button>
					<button type="button" className="gc-replay-bar__btn" onClick={handleReplayJumpLatest} title={t("replay.jumpLatest")} aria-label={t("replay.jumpLatest")}>
						<svg width="13" height="13" viewBox="0 0 16 16" fill="none">
							<path d="M3 2v12M13 8L6 3v10l7-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
						</svg>
					</button>
					<div className="gc-replay-bar__sep" aria-hidden="true" />
					<div className="gc-replay-bar__speeds" role="group" aria-label={t("replay.speed")}>
						{REPLAY_SPEEDS.map((speed) => (
							<button
								key={speed}
								type="button"
								className={`gc-replay-bar__btn${replayState.speed === speed ? " gc-replay-bar__btn--active" : ""}`}
								onClick={() => handleReplaySpeedChange(speed)}
								aria-pressed={replayState.speed === speed}
								title={t("replay.speed")}
							>
								{speed === "max" ? "MAX" : `${speed}x`}
							</button>
						))}
					</div>
					<div className="gc-replay-bar__sep" aria-hidden="true" />
					<span className="gc-replay-bar__status">{replayProgressLabel}</span>
					<div className="gc-replay-bar__spacer" />
					<button
						type="button"
						className="gc-replay-bar__btn gc-replay-bar__close"
						onClick={() => { replayController?.pause(); setShowReplayBar(false); }}
						title={t("replay.closeBar")}
						aria-label={t("replay.closeBar")}
					>
						<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
							<path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						</svg>
					</button>
				</div>
			)}

			<div className="gc-main">
				<aside className="gc-tools" aria-label={t("library.drawingTools")}>
					{TOOL_GROUPS.map((group, groupIndex) => (
						<Fragment key={group.id}>
							<div className="gc-tools-group">
								{group.tools.map((id) => (
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
							</div>
							{groupIndex < TOOL_GROUPS.length - 1 && <span className="rsc-toolbar-divider" aria-hidden="true" />}
						</Fragment>
					))}
					<span className="rsc-toolbar-divider" aria-hidden="true" />
					<button
						type="button"
						title={t("drawing.toggleList")}
						aria-pressed={showDrawingList}
						className={`gc-tool-btn${showDrawingList ? " gc-tool-btn--active" : ""}`}
						onClick={() => setShowDrawingList((v) => !v)}
					>
						<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
							<line x1="5" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
							<line x1="5" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
							<line x1="5" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
							<circle cx="2.5" cy="4" r="1.3" fill="currentColor" />
							<circle cx="2.5" cy="8" r="1.3" fill="currentColor" />
							<circle cx="2.5" cy="12" r="1.3" fill="currentColor" />
						</svg>
					</button>
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
						{showDrawingList && (
							<div className="rsc-drawing-storage-toolbar" style={{ left: storageToolbarPosition.x, top: storageToolbarPosition.y }}>
								<button type="button" className="rsc-drawing-storage-toolbar__button" onClick={handleExportDrawings}>{t("drawing.exportJson")}</button>
								<button type="button" className="rsc-drawing-storage-toolbar__button" onClick={handleImportButtonClick}>{t("drawing.importJson")}</button>
								<button type="button" className="rsc-drawing-storage-toolbar__button" onClick={handleClearDrawings}>{t("drawing.clearAll")}</button>
								<input ref={importInputRef} type="file" accept="application/json" hidden onChange={handleImportFileChange} />
							</div>
						)}

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
									onContextMenu={handleReplayContextMenu}
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
										onContextMenu: handleReplayContextMenu,
									})}
									<DrawingLayer
										activeTool={activeTool}
										interaction={drawingInteraction}
										onToolUsed={handleDrawingToolUsed}
									/>
								</ChartCanvas>

									{replayContextMenu && (
										<>
											<div className="gc-replay-menu-backdrop" aria-hidden="true" onClick={closeReplayContextMenu} />
											<div className="gc-replay-menu" style={{ left: replayContextMenu.x, top: replayContextMenu.y }}>
												<div className="gc-replay-menu__meta">{replayContextMenu.label}</div>
												<button type="button" className="gc-replay-menu__action" onClick={handleReplayFromHere}>
													{t("replay.fromHere")}
												</button>
											</div>
										</>
									)}

									<DrawingInspector
										drawing={selectedDrawing}
										labels={drawingInspectorLabels}
										position={drawingInspectorPosition}
										onUpdate={updateSelectedDrawing}
										onDelete={deleteSelectedDrawing}
										onClone={cloneSelectedDrawing}
										onToggleLock={toggleSelectedLock}
										onToggleVisible={toggleSelectedVisible}
										onBringToFront={bringSelectedToFront}
										onSendToBack={sendSelectedToBack}
										onClose={() => setActiveTool("cursor")}
									/>
										{showDrawingList && (
										<DrawingListPanel
											drawings={sortedDrawings}
											selectedId={selectedDrawingId ?? null}
											labels={drawingListPanelLabels}
											position={drawingListPosition}
											onSelect={selectDrawingById}
											onToggleVisible={toggleDrawingVisibleById}
											onDelete={deleteDrawingById}
										/>
									)}

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
		</DemoPageShell>
	);
}
