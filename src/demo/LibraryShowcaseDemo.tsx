import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { format } from "d3-format";
import { scaleTime } from "d3-scale";
import { timeFormat } from "d3-time-format";

import {
	PaneHeader,
	PaneLabel,
	IndicatorLegend,
	useDynamicPanes,
	DrawingLayer,
	DrawingContextMenu,
	DrawingInspector,
	DrawingListPanel,
	useDrawingInteraction,
	useDrawingStorage,
	BarReplayController,
	MAGNET_TOLERANCE,
	type MagnetSensitivity,
	type PaneDescriptor,
	type BarReplayState,
	type SeriesConfig,
	type SeriesTypeId,
	type YAxisSide,
	type ReplaySpeed,
		type StockDataAdapter,
		type VisibleRange,
	ChartSplitter,
	useChartTheme,
	VNBrokerChart,
		resolveDrawingShortcut,
		subscribeDrawingStyleChanges,
		subscribeSeriesStyleChanges,
	widgetMessagesEn,
	widgetMessagesVi,
} from "../index";
import { DrawingPriceLabels } from "../lib/drawing/priceLabel";
import { restorePersistedStyleOverrides, saveCurrentStyleOverrides } from "./styleOverridesPersistence";
import type { OHLCVBar } from "../lib/types/ohlcv";
import type { DrawingObject } from "../lib/drawing/types";
import type { DrawingInspectorLabels } from "../lib/drawing/DrawingInspector";
import type { DrawingListPanelLabels } from "../lib/drawing/DrawingListPanel";
import { cloneDrawingSnapshot, offsetDrawingByPixels } from "../lib/drawing/clipboard";
import { enrichData } from "../lib/core/calculators/enrichData";
import type { EnrichedDatum, RawOHLCV } from "../lib/core/calculators/types";
import { transformHeikinAshi } from "./heikinAshi";
import { getOfflineDemoBars, mergeBarsByDate } from "./demoData";
import { binanceAdapter, LocalCacheAdapter, VNStocksAdapter, type DataAdapter, type KLineBar } from "../lib/adapters";
import { CHART_RANGE_LABEL_KEYS, CHART_RANGES, DEFAULT_CHART_RANGE, resolveChartRangeExtents, resolveChartRangeStart, type ChartRange } from "./chartRange";
import DemoPageShell from "./DemoPageShell";
import { useDemoI18n } from "./i18n";
import { PaneSettingsModal, type SettingsSection } from "./PaneSettingsModal";
import { AboutDialog, BrandFooter, BrandMark, PATTokenModal, WhalePanel } from "./components";
import { VNInvestClient } from "./dataSources/VNInvestClient";
import { VNInvestDataSource, DemoDataSource, type DataSource } from "./dataSources";
import { VNInvestAdapter } from "../lib/adapters/VNInvestAdapter";
import type { WhaleFeedResponse } from "./vninvest/types";
import { computeLoadedWindow, computeMissingSegments, computeTargetWindow, type MissingSegments, type TimeWindow } from "./historyWindowPlanner";
import { HistoryFetchQueue } from "./historyFetchQueue";
import { computeVNIViewportBackfillWindow } from "./vniViewportBackfill";
import { useReleaseNotice } from "./release/useReleaseNotice";
import "./demo.css";
import "../lib/styles/pane-overlays.css";

const DEMO_SETTINGS_STORAGE_KEY = "rsc-demo-settings-v1";
const DEFAULT_MAX_VISIBLE_PANES = 5;

interface DemoSettings {
	maxVisiblePanes: number;
	showDrawingPriceMarkers: boolean;
	showNonTradingDays: boolean;
	maxVisibleBars: number;
}

const DEFAULT_DEMO_SETTINGS: DemoSettings = {
	maxVisiblePanes: DEFAULT_MAX_VISIBLE_PANES,
	showDrawingPriceMarkers: true,
	showNonTradingDays: false,
	maxVisibleBars: 500,
};

function loadDemoSettings(): DemoSettings {
	if (typeof localStorage === "undefined") {
		return DEFAULT_DEMO_SETTINGS;
	}
	try {
		const raw = localStorage.getItem(DEMO_SETTINGS_STORAGE_KEY);
		if (!raw) {
			return DEFAULT_DEMO_SETTINGS;
		}
		const parsed = JSON.parse(raw) as Partial<DemoSettings>;
		return {
			maxVisiblePanes: typeof parsed.maxVisiblePanes === "number" && Number.isFinite(parsed.maxVisiblePanes)
				? Math.max(1, Math.floor(parsed.maxVisiblePanes))
				: DEFAULT_MAX_VISIBLE_PANES,
			showDrawingPriceMarkers: typeof parsed.showDrawingPriceMarkers === "boolean"
				? parsed.showDrawingPriceMarkers
				: DEFAULT_DEMO_SETTINGS.showDrawingPriceMarkers,
			showNonTradingDays: typeof parsed.showNonTradingDays === "boolean"
				? parsed.showNonTradingDays
				: DEFAULT_DEMO_SETTINGS.showNonTradingDays,
			maxVisibleBars: typeof parsed.maxVisibleBars === "number" && Number.isFinite(parsed.maxVisibleBars)
				? Math.max(100, Math.min(2000, Math.floor(parsed.maxVisibleBars)))
				: DEFAULT_DEMO_SETTINGS.maxVisibleBars,
		};
	} catch {
		// ignore malformed settings payloads
	}
	return DEFAULT_DEMO_SETTINGS;
}

function saveDemoSettings(settings: DemoSettings) {
	if (typeof localStorage === "undefined") {
		return;
	}
	try {
		localStorage.setItem(DEMO_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
	} catch {
		// ignore storage errors
	}
}

const priceFormat = format(".2f");
const volumeFormat = format(".3s");
const dateFormat = timeFormat("%d/%m/%Y %H:%M");
const shortDateFormat = timeFormat("%d/%m/%Y");

function klineBarToRawOHLCV(bar: KLineBar): RawOHLCV {
	return { date: new Date(bar.timestamp), open: bar.open, high: bar.high, low: bar.low, close: bar.close, volume: bar.volume };
}

const TIMEFRAMES = ["1m", "3m", "5m", "15m", "30m", "1h", "4h"] as const;
type Timeframe = typeof TIMEFRAMES[number];

const VNI_TIMEFRAMES = ["1m", "5m", "15m", "1H", "2H", "4H", "D", "W", "M", "Y"] as const;
type VNITimeframe = typeof VNI_TIMEFRAMES[number];

const CHART_TYPES = ["candlestick", "hollow", "ohlc", "heikinashi", "line", "area"] as const;
type ChartTypeId = typeof CHART_TYPES[number];

const VNI_VALID_TIMEFRAMES = new Set<string>(VNI_TIMEFRAMES);

function normalizeVNITimeframe(input: string | null | undefined): string {
	const value = (input || "").trim();
	if (!value) {
		return "D";
	}
	if (VNI_VALID_TIMEFRAMES.has(value)) {
		return value;
	}
	const lowered = value.toLowerCase();
	if (lowered === "1h") {
		return "1H";
	}
	if (lowered === "1d" || lowered === "d") {
		return "D";
	}
	return "D";
}
const CANDLE_TYPE_STORAGE_KEY = "vnsc_candleType";

/** Map a ChartRange button to the number of calendar days to request from the VNInvest API. */
function chartRangeToDays(range: ChartRange): number {
	switch (range) {
		case "1D": return 3;
		case "5D": return 8;
		case "1M": return 40;
		case "3M": return 100;
		case "YTD": {
			const now = new Date();
			return Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86_400_000) + 10;
		}
		case "1Y": return 380;
		case "All": return 1825;
		default: return 90;
	}
}

const CHART_TYPE_TO_SERIES: Record<ChartTypeId, SeriesTypeId> = {
	candlestick: "Candlestick",
	hollow: "HollowCandle",
	ohlc: "OHLC",
	heikinashi: "HeikinAshi",
	line: "Line",
	area: "Area",
};

const MAIN_PRICE_SERIES_TYPES: SeriesTypeId[] = ["Candlestick", "HollowCandle", "OHLC", "HeikinAshi", "Line", "Area", "Bar"];

function loadChartType(): ChartTypeId {
	if (typeof localStorage === "undefined") {
		return "candlestick";
	}

	try {
		const saved = localStorage.getItem(CANDLE_TYPE_STORAGE_KEY);
		if (saved && CHART_TYPES.includes(saved as ChartTypeId)) {
			return saved as ChartTypeId;
		}
	} catch {
		// ignore storage errors
	}

	return "candlestick";
}

const TOOL_GROUPS = [
	{ id: "lines", tools: ["cursor", "crosshair", "trendLine", "ray", "extendedLine", "hLine", "vLine"] as const },
	{ id: "fibonacci", tools: ["fibonacci", "fibExtension"] as const },
	{ id: "shapes", tools: ["rectangle", "arrow", "polyline"] as const },
	{ id: "analysis", tools: ["channel", "text", "dateAndPriceRange", "longPosition", "shortPosition", "parallelChannel", "pitchfork", "abcdPattern", "fibArc", "fibTimeZone", "regressionChannel"] as const },
] as const;
type ToolId = typeof TOOL_GROUPS[number]["tools"][number];

const DRAWING_PANEL_WIDTH = 360;
const REPLAY_SPEEDS: ReplaySpeed[] = [0.5, 1, 2, 5, 10, "max"];
const PERCENT_FORMAT = format(".1%");

function isYAxisSide(value: string | undefined): value is YAxisSide {
	return value === "left" || value === "right";
}

function resolveDrawingPlacementForPane(sourceDrawing: DrawingObject, targetPane: PaneDescriptor | undefined) {
	if (!targetPane || targetPane.id === sourceDrawing.paneId) {
		return {
			paneId: sourceDrawing.paneId,
			yScaleId: sourceDrawing.yScaleId,
		};
	}

	const targetSides: YAxisSide[] = [];
	for (const series of targetPane.series) {
		if (!targetSides.includes(series.yAxis)) {
			targetSides.push(series.yAxis);
		}
	}

	const preferredSide = isYAxisSide(sourceDrawing.yScaleId) && targetSides.includes(sourceDrawing.yScaleId)
		? sourceDrawing.yScaleId
		: targetSides.includes("right")
			? "right"
			: targetSides[0];

	return {
		paneId: targetPane.id,
		yScaleId: preferredSide,
	};
}


interface PaperTradePosition {
	entryDate: Date | number;
	entryPrice: number;
	entryIndex: number;
}

interface ClosedPaperTrade extends PaperTradePosition {
	exitDate: Date | number;
	exitPrice: number;
	exitIndex: number;
	pnl: number;
	barsHeld: number;
}

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

function getSelectedDrawingIds(drawingState: { type: string; objectId?: string; objectIds?: string[]; object?: DrawingObject }) {
	switch (drawingState.type) {
		case "selected":
			return drawingState.objectId ? [drawingState.objectId] : [];
		case "selectedMultiple":
			return drawingState.objectIds ?? [];
		case "moving":
		case "resizing":
		case "editing":
			return drawingState.objectId ? [drawingState.objectId] : [];
		case "complete":
			return drawingState.object?.id ? [drawingState.object.id] : [];
		default:
			return [];
	}
}

function clonePoint(point: { x: number; y: number }) {
	return { x: point.x, y: point.y };
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

function isEditableTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) {
		return false;
	}

	const tagName = target.tagName.toLowerCase();
	return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
}

function normalizeDate(value: Date | number) {
	return value instanceof Date ? value : new Date(value);
}

function estimateSeriesWarmupBars(series: readonly SeriesConfig[]): number {
	return series.reduce((maxBars, config) => {
		const params = config.params ?? {};
		const period = Number(params.period ?? params.windowSize ?? 0);
		const signal = Number(params.signal ?? 0);
		const slow = Number(params.slow ?? 0);
		const longPeriod = Number(params.long ?? 0);
		const shortPeriod = Number(params.short ?? 0);

		const bars = (() => {
			switch (config.type) {
				case "EMA":
				case "MA":
				case "BollingerBand":
				case "RSI":
				case "CCI":
				case "WR":
				case "VR":
				case "MTM":
				case "ROC":
				case "PSY":
					return period;
				case "MACD":
					return slow + signal;
				case "KDJ":
					return period + signal;
				case "TRIX":
					return period * 3;
				case "DMA":
					return Math.max(shortPeriod, longPeriod);
				default:
					return 0;
			}
		})();

		return Math.max(maxBars, Number.isFinite(bars) ? bars : 0);
	}, 0);
}

function formatSignedPrice(value: number) {
	return `${value >= 0 ? "+" : ""}${priceFormat(value)}`;
}

function formatBarsHeld(barsHeld: number, unitLabel: string) {
	return `${barsHeld} ${unitLabel}`;
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
	const initialDemoSettings = useMemo(() => loadDemoSettings(), []);
	const shellRef = useRef<HTMLDivElement | null>(null);
	const [chartWidth, setChartWidth] = useState(0);
	const [chartHeight, setChartHeight] = useState(0);
	const [timeframe, setTimeframe] = useState<Timeframe>(() => {
		try {
			const stored = typeof localStorage !== "undefined" && localStorage.getItem("vnsc_timeframe");
			if (stored && (TIMEFRAMES as readonly string[]).includes(stored)) return stored as Timeframe;
		} catch { /* ignore */ }
		return "1h";
	});
	const [chartRange, setChartRange] = useState<ChartRange>(DEFAULT_CHART_RANGE);
	const [chartType, setChartType] = useState<ChartTypeId>(() => loadChartType());
	const [showPanesMenu, setShowPanesMenu] = useState(false);
	const [showWhaleDialog, setShowWhaleDialog] = useState(true);
	const [aboutOpen, setAboutOpen] = useState(false);
	const releaseNotice = useReleaseNotice();
	const panesMenuRef = useRef<HTMLDivElement | null>(null);
	const [showProfileMenu, setShowProfileMenu] = useState(false);
	const profileMenuRef = useRef<HTMLDivElement | null>(null);
	const [activeTool, setActiveTool] = useState<string>("cursor");
	const [openGroupId, setOpenGroupId] = useState<string | null>(null);
	const toolbarRef = useRef<HTMLElement | null>(null);
	const [magnetSensitivity, setMagnetSensitivity] = useState<MagnetSensitivity>(() => {
		try {
			return (typeof localStorage !== "undefined" && (localStorage.getItem("vnsc_magnet") as MagnetSensitivity)) || "normal";
		} catch {
			return "normal";
		}
	});
	const [dataAdapterName, setDataAdapterName] = useState<string>(() => {
		try {
			return (typeof localStorage !== "undefined" && localStorage.getItem("vnsc_dataAdapter")) || "binance";
		} catch {
			return "binance";
		}
	});
	
	// Track selected symbol per adapter to avoid switching datasources on timeframe change
	const [selectedSymbol, setSelectedSymbol] = useState<string>(() => {
		try {
			const stored = typeof localStorage !== "undefined" && localStorage.getItem("vnsc_selectedSymbol");
			if (stored) return stored;
		} catch { /* ignore */ }
		return "BTCUSDT"; // Default for binance
	});
	
	const [selectedPaneId, setSelectedPaneId] = useState("price");

	const [settingsSection, setSettingsSection] = useState<SettingsSection>("layout");
	const [settingsPaneId, setSettingsPaneId] = useState("price");
	const [maxVisiblePanes, setMaxVisiblePanes] = useState(initialDemoSettings.maxVisiblePanes);
	const [showDrawingPriceMarkers, setShowDrawingPriceMarkers] = useState(initialDemoSettings.showDrawingPriceMarkers);
	const [showNonTradingDays, setShowNonTradingDays] = useState(initialDemoSettings.showNonTradingDays);
	const [maxVisibleBars, setMaxVisibleBars] = useState(initialDemoSettings.maxVisibleBars);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [showReplayBar, setShowReplayBar] = useState(false);
	const [showDrawingList, setShowDrawingList] = useState(false);
	const [drawingContextMenu, setDrawingContextMenu] = useState<{ x: number; y: number; drawingId: string } | null>(null);
	const [drawingTextDraft, setDrawingTextDraft] = useState("");
	const [paperTradePosition, setPaperTradePosition] = useState<PaperTradePosition | null>(null);
	const [paperTradeHistory, setPaperTradeHistory] = useState<ClosedPaperTrade[]>([]);
	const openAbout = useCallback(() => setAboutOpen(true), []);
	const closeAbout = useCallback(() => setAboutOpen(false), []);
	const chartRangeRef = useRef(chartRange);
	const paperTradePositionRef = useRef<PaperTradePosition | null>(null);
	const lastPaperTradeClickRef = useRef<{ timestamp: number; index: number } | null>(null);
	const lastPaperTradeSignatureRef = useRef<string | null>(null);
	const drawingInteraction = useDrawingInteraction();
	const { undo, redo, deleteSelected, cancelDrawing, selectObject, replaceDrawings, updateDrawing, updateSelectedDrawings, bringSelectedToFront: reorderSelectedToFront, sendSelectedToBack: reorderSelectedToBack } = drawingInteraction;
	const drawingClipboardRef = useRef<DrawingObject | null>(null);
	const importInputRef = useRef<HTMLInputElement | null>(null);
	const handleLoadDrawings = useCallback((drawings: DrawingObject[]) => {
		drawingInteraction.dispatch({ type: "REPLACE", drawings });
	}, [drawingInteraction.dispatch]);
	const drawingStorage = useDrawingStorage(selectedSymbol, timeframe, drawingInteraction.allDrawings, handleLoadDrawings);
	const { theme, toggleTheme, isDark } = useChartTheme("light");
	useEffect(() => {
		if (typeof document === "undefined") {
			return undefined;
		}

		const root = document.documentElement;
		const previousTheme = root.getAttribute("data-chart-theme");
		const previousColorScheme = root.style.colorScheme;
		root.setAttribute("data-chart-theme", theme);
		root.style.colorScheme = theme;

		return () => {
			if (previousTheme === null) {
				if (root.getAttribute("data-chart-theme") === theme) {
					root.removeAttribute("data-chart-theme");
				}
			} else if (root.getAttribute("data-chart-theme") === theme) {
				root.setAttribute("data-chart-theme", previousTheme);
			}

			if (previousColorScheme) {
				root.style.colorScheme = previousColorScheme;
			} else {
				root.style.removeProperty("color-scheme");
			}
		};
	}, [theme]);
	const canvasBg = "var(--gc-surface)";
	const closeDrawingContextMenu = useCallback(() => setDrawingContextMenu(null), []);

	// Live Binance data state
	const [liveData, setLiveData] = useState<RawOHLCV[]>([]);
	const [dataStatus, setDataStatus] = useState<"loading" | "live" | "offline" | "error">("loading");
	const [dataError, setDataError] = useState<string>("");
	const [historyStatus, setHistoryStatus] = useState<"idle" | "backfilling">("idle");
	const [visibleDomain, setVisibleDomain] = useState<[Date, Date] | null>(null);
	const [visibleRange, setVisibleRange] = useState<VisibleRange | null>(null);
	const [hoveredItem, setHoveredItem] = useState<EnrichedDatum | null>(null);
	const liveDataRef = useRef<RawOHLCV[]>([]);
	const visibleDomainRef = useRef<[Date, Date] | null>(null);
	const chartDataRef = useRef<EnrichedDatum[]>([]);
	const maxVisibleBarsRef = useRef(maxVisibleBars);
	const visibleRangeRef = useRef<VisibleRange | null>(null);
	const backfillInFlightRef = useRef(false);
	const warmupInFlightRef = useRef(false);
	const backfillDebounceRef = useRef<number | null>(null);
	const vniViewportBackfillInFlightRef = useRef(false);
	const vniViewportHistoryExhaustedAtRef = useRef<number | null>(null);
	const mountedRef = useRef(true);
	const initialWarmupRequestedRef = useRef(false);
	const vniLoadingRef = useRef(false);
	const activeSourceRef = useRef<"demo" | "vninvest">("demo");
	const BACKFILL_PAGE_LIMIT = 1000;
	const BACKFILL_MAX_PAGES = 20;
	const SCHEDULER_TICK_MS = 250;
	const SCHEDULER_LEFT_PREFETCH_RATIO = 2.0;
	const SCHEDULER_RIGHT_PREFETCH_RATIO = 0.5;
	const SCHEDULER_MAX_BACKWARD_PAGES = 8;
	const SCHEDULER_MAX_FORWARD_PAGES = 2;
	const VNI_VIEWPORT_BACKFILL_DEBOUNCE_MS = 120;
	const INITIAL_HISTORY_TARGET_BARS = 5000;
	const INITIAL_HISTORY_MAX_PAGES = 8;
	const queueRef = useRef(new HistoryFetchQueue());
	const schedulerGenerationRef = useRef(0);
	const lastMissingRef = useRef<MissingSegments | null>(null);

	// VNInvest integration state
	const [activeSource, setActiveSource] = useState<"demo" | "vninvest">("demo");
	const isVNInvestSource = activeSource === "vninvest";
	const [vniSymbol, setVniSymbol] = useState<string>(() => {
		try {
			return (typeof localStorage !== "undefined" && localStorage.getItem("vni_last_symbol")) || "VCB";
		} catch {
			return "VCB";
		}
	});
	const [vniTimeframe, setVniTimeframe] = useState<string>(() => {
		try {
			return normalizeVNITimeframe(typeof localStorage !== "undefined" ? localStorage.getItem("vni_last_timeframe") : null);
		} catch {
			return "D";
		}
	});
	const [vniDays, setVniDays] = useState<number>(() => {
		try {
			const stored = typeof localStorage !== "undefined" && localStorage.getItem("vni_last_days");
			return stored ? Math.max(1, Math.min(1825, parseInt(stored, 10))) : 90;
		} catch {
			return 90;
		}
	});
	const vniDaysRef = useRef(vniDays);
	const [patModalOpen, setPatModalOpen] = useState(false);
	const [vniLoading, setVniLoading] = useState(false);
	const [vniError, setVniError] = useState<string | null>(null);
	const [sourceNotice, setSourceNotice] = useState<string | null>(null);
	const [vniHistoryFloorDate, setVniHistoryFloorDate] = useState<Date | null>(null);
	const [vniHasPAT, setVniHasPAT] = useState(() => {
		try {
			return typeof localStorage !== "undefined" && !!localStorage.getItem("vni_pat");
		} catch {
			return false;
		}
	});

	// Whale data state
	const [whaleData, setWhaleData] = useState<WhaleFeedResponse | null>(null);
	const [whaleLoading, setWhaleLoading] = useState(false);

	// VNInvest data sources
	const vninvestClient = useMemo(() => new VNInvestClient(), []);
	// VNInvestAdapter: widget-layer StockDataAdapter routed to core-api.
	const vninvestAdapter = useMemo(() => new VNInvestAdapter(), []);
	const demoDataSource = useMemo(() => new DemoDataSource(), []);
	const vninvestDataSource = useMemo(() => new VNInvestDataSource(vninvestClient), [vninvestClient]);
	const currentDataSource = useMemo<DataSource>(() => {
		return activeSource === "vninvest" ? vninvestDataSource : demoDataSource;
	}, [activeSource, demoDataSource, vninvestDataSource]);

	// Load PAT on mount
	useEffect(() => {
		if (typeof localStorage === "undefined") {
			return;
		}
		try {
			const token = localStorage.getItem("vni_pat");
			if (token) {
				vninvestClient.setPAT(token);
				setVniHasPAT(true);
			}
		} catch {
			// ignore
		}
	}, [vninvestClient]);

	const localCacheAdapter = useMemo(() => {
		const adapter = new LocalCacheAdapter();
		const bars = getOfflineDemoBars().map((b) => ({
			timestamp: b.date.valueOf(), open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume,
		}));
		adapter.loadBars(selectedSymbol, timeframe, bars);
		return adapter;
	}, [timeframe, selectedSymbol]);

	const dataAdapter = useMemo<DataAdapter>(() => {
		if (dataAdapterName === "local") return localCacheAdapter;
		if (dataAdapterName === "vnstocks") return new VNStocksAdapter();
		return binanceAdapter;
	}, [dataAdapterName, localCacheAdapter]);

	useEffect(() => {
		liveDataRef.current = liveData;
	}, [liveData]);

	useEffect(() => {
		activeSourceRef.current = activeSource;
	}, [activeSource]);

	useEffect(() => {
		vniDaysRef.current = vniDays;
	}, [vniDays]);

	useEffect(() => {
		vniLoadingRef.current = vniLoading;
	}, [vniLoading]);

	useEffect(() => {
		visibleDomainRef.current = visibleDomain;
	}, [visibleDomain]);

	useEffect(() => {
		maxVisibleBarsRef.current = maxVisibleBars;
	}, [maxVisibleBars]);

	useEffect(() => {
		chartRangeRef.current = chartRange;
	}, [chartRange]);

	useEffect(() => {
		if (typeof localStorage === "undefined") {
			return;
		}
		try {
			localStorage.setItem(CANDLE_TYPE_STORAGE_KEY, chartType);
		} catch {
			// ignore storage errors
		}
	}, [chartType]);

	// When adapter changes, reset selected symbol to adapter's default
	useEffect(() => {
		const defaultSymbol = dataAdapterName === "binance" || dataAdapterName === "local" ? "BTCUSDT" : "VCB";
		setSelectedSymbol(defaultSymbol);
		try {
			if (typeof localStorage !== "undefined") {
				localStorage.setItem("vnsc_selectedSymbol", defaultSymbol);
			}
		} catch { /* ignore storage errors */ }
	}, [dataAdapterName]);

	useEffect(() => {
		try {
			if (typeof localStorage !== "undefined") {
				localStorage.setItem("vnsc_timeframe", timeframe);
				localStorage.setItem("vnsc_selectedSymbol", selectedSymbol);
			}
		} catch {
			// ignore storage errors
		}
	}, [timeframe, selectedSymbol]);

	useEffect(() => () => {
		mountedRef.current = false;
		if (backfillDebounceRef.current !== null) {
			clearTimeout(backfillDebounceRef.current);
			backfillDebounceRef.current = null;
		}
	}, []);

	const paneState = useDynamicPanes(chartHeight, { maxVisiblePanes });
	const visiblePanes = paneState.visiblePanes;
	const paneHeights = paneState.heights;
	const available = paneState.available;
	const addPane = paneState.addPane;
	const applyDelta = paneState.applyDelta;
	const resetToDefault = paneState.resetToDefault;
	const handleExportDrawings = useCallback(() => {
		drawingStorage.exportJSON();
	}, [drawingStorage]);
	const handleImportButtonClick = useCallback(() => {
		importInputRef.current?.click();
	}, []);
	const handleClearDrawings = useCallback(() => {
		drawingStorage.clearAll();
	}, [drawingStorage]);
	const handleImportFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}
		await drawingStorage.importJSON(file);
		event.target.value = "";
	}, [drawingStorage]);
	const drawingInspectorLabels = useMemo(() => ({
		title: t("drawing.inspectorTitle"),
		alert: t("drawing.alert"),
		alertEnabled: t("drawing.alertEnabled"),
		alertTrigger: t("drawing.alertTrigger"),
		alertTouch: t("drawing.alertTouch"),
		alertBreak: t("drawing.alertBreak"),
		alertCloseAbove: t("drawing.alertCloseAbove"),
		alertCloseBelow: t("drawing.alertCloseBelow"),
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
	const drawingListPanelLabels = useMemo(() => ({
		title: t("drawing.drawingsList"),
		empty: t("drawing.drawingsListEmpty"),
		alert: t("drawing.alert"),
		visible: t("drawing.visible"),
		hidden: t("drawing.hidden"),
		locked: t("drawing.locked"),
		selected: t("drawing.selected"),
		delete: t("drawing.delete"),
	}), [t]);
	const handleAddPane = useCallback(() => {
		addPane({
			label: t("library.genericPaneLabel", { index: paneState.panes.length + 1 }),
			pinned: false,
			visible: true,
			heightRatio: 0.2,
			splitScale: false,
			tooltip: "value",
			series: [],
		});
	}, [addPane, paneState.panes.length, t]);
	const selectDrawingById = useCallback((id: string) => {
		selectObject(id);
		setActiveTool("cursor");
	}, [selectObject]);
	const toggleDrawingVisibleById = useCallback((id: string) => {
		const target = drawingInteraction.allDrawings.find((drawing) => drawing.id === id);
		if (!target) {
			return;
		}
		updateDrawing(id, { visible: target.visible === false });
	}, [drawingInteraction.allDrawings, updateDrawing]);
	const deleteDrawingById = useCallback((id: string) => {
		const nextDrawings = drawingInteraction.allDrawings.filter((drawing) => drawing.id !== id);
		replaceDrawings(nextDrawings);
		if (getSelectedDrawingId(drawingInteraction.drawingState) === id) {
			cancelDrawing();
		}
	}, [cancelDrawing, drawingInteraction.allDrawings, drawingInteraction.drawingState, replaceDrawings]);

	useEffect(() => {
		restorePersistedStyleOverrides();
	}, []);

	useEffect(() => {
		const persistStyleOverrides = () => {
			saveCurrentStyleOverrides();
		};

		persistStyleOverrides();
		const unsubscribeSeries = subscribeSeriesStyleChanges(persistStyleOverrides);
		const unsubscribeDrawings = subscribeDrawingStyleChanges(persistStyleOverrides);
		return () => {
			unsubscribeSeries();
			unsubscribeDrawings();
		};
	}, []);

	useEffect(() => {
		saveDemoSettings({ maxVisiblePanes, showDrawingPriceMarkers, showNonTradingDays, maxVisibleBars });
	}, [maxVisiblePanes, showDrawingPriceMarkers, showNonTradingDays, maxVisibleBars]);

	useEffect(() => {
		try {
			if (typeof localStorage !== "undefined") {
				localStorage.setItem("vnsc_magnet", magnetSensitivity);
			}
		} catch {
			// ignore storage errors
		}
	}, [magnetSensitivity]);

	useEffect(() => {
		try {
			if (typeof localStorage !== "undefined") {
				localStorage.setItem("vnsc_dataAdapter", dataAdapterName);
			}
		} catch {
			// ignore storage errors
		}
	}, [dataAdapterName]);

	const normalizeDomain = useCallback((domain: [Date | number, Date | number]) => {
		return [normalizeDate(domain[0]), normalizeDate(domain[1])] as [Date, Date];
	}, []);

	const handlePATSaved = useCallback((token: string) => {
		if (typeof localStorage === "undefined") {
			return;
		}
		try {
			localStorage.setItem("vni_pat", token);
			vninvestClient.setPAT(token);
			vninvestAdapter.setPAT(token);
			setVniHasPAT(true);
			setPatModalOpen(false);
			setVniError(null);
			setSourceNotice(null);
		} catch {
			setVniError(t("vninvest.error.patStorage") ?? "Failed to save token");
		}
	}, [vninvestClient, vninvestAdapter, t]);

	const vniAbortRef = useRef<AbortController | null>(null);

	const switchToDemoSource = useCallback(() => {
		activeSourceRef.current = "demo";
		vniLoadingRef.current = false;
		vniViewportHistoryExhaustedAtRef.current = null;
		setActiveSource("demo");
		setDataAdapterName((cur) => (cur === "vnstocks" ? "binance" : cur));
		setVisibleRange(null);
		setHoveredItem(null);
		setVniHistoryFloorDate(null);
		setWhaleData(null);
		setWhaleLoading(false);
		setVniError(null);
	}, []);

	const handleLoadVNIChart = useCallback(async () => {
		// Guard: chỉ chạy khi có PAT
		if (!vninvestClient.hasPAT()) {
			setVniHasPAT(false);
			setVniError(t("vninvest.error.noPAT") ?? "PAT token not configured");
			setDataStatus("error");
			return;
		}

		// Cancel bất kỳ fetch cũ nào (user đổi range/symbol/timeframe nhanh)
		vniAbortRef.current?.abort();
		const abortController = new AbortController();
		vniAbortRef.current = abortController;

		vniViewportHistoryExhaustedAtRef.current = null;
		// Update refs synchronously so viewport backfill guards see the loading state
		// before the next render cycle (setState is async).
		vniLoadingRef.current = true;
		dataStatusRef.current = "loading";
		setVniLoading(true);
		setVniError(null);
		setVniHistoryFloorDate(null);
		setDataStatus("loading");

		try {
			const rawData = await vninvestDataSource.loadBars(vniSymbol, {
				timeframe: vniTimeframe,
				days: vniDays,
			});

			// Bỏ qua kết quả nếu request đã bị cancel hoặc đã unmount hoặc source đã thay đổi
			if (abortController.signal.aborted || !mountedRef.current || activeSourceRef.current !== "vninvest") {
				return;
			}

			if (rawData.length === 0) {
				setVniError(t("vninvest.error.noData") ?? `No data found for ${vniSymbol}`);
				setDataStatus("error");
				return;
			}

			setLiveData(rawData);
			setVisibleDomain(resolveChartRangeExtents(rawData, chartRangeRef.current));
			setDataStatus("live");

			// Fetch whale data song song (optional)
			vninvestClient.getWhaleFeed(vniSymbol)
				.then((response) => {
					if (mountedRef.current && !abortController.signal.aborted) setWhaleData(response);
				})
				.catch(() => {});

			// Persist selections
			if (typeof localStorage !== "undefined") {
				try {
					localStorage.setItem("vni_last_symbol", vniSymbol);
					localStorage.setItem("vni_last_timeframe", vniTimeframe);
					localStorage.setItem("vni_last_days", vniDays.toString());
				} catch { /* ignore */ }
			}
		} catch (err: unknown) {
			if (abortController.signal.aborted || !mountedRef.current) return;
			const msg = err instanceof Error ? err.message : String(err);
			if (msg.includes("401") || msg.includes("TOKEN_EXPIRED")) {
				try {
					if (typeof localStorage !== "undefined") {
						localStorage.removeItem("vni_pat");
					}
				} catch {
					// ignore storage errors
				}
				vninvestClient.clearPAT();
				vninvestAdapter.setPAT("");
				setVniHasPAT(false);
				setPatModalOpen(true);
				setSourceNotice(t("vninvest.notice.autoSwitchedToDemo") ?? "Switched to demo source because VNInvest token is invalid");
				switchToDemoSource();
				setDataStatus("loading");
				return;
			} else if (msg.includes("NO_PAT")) {
				setVniError(t("vninvest.error.noPAT") ?? "PAT token not configured");
			} else {
				setVniError(msg);
			}
			setDataStatus("error");
		} finally {
			if (mountedRef.current && !abortController.signal.aborted) {
				vniLoadingRef.current = false;
				setVniLoading(false);
			}
		}
	}, [switchToDemoSource, vninvestAdapter, vninvestClient, vninvestDataSource, vniSymbol, vniTimeframe, vniDays, t]);

	// Auto-trigger load when switching to VNI source, or when symbol/timeframe/days change.
	// Matches vnstockchars pattern: handleLoadVNIChart changes when its deps (vniDays, vniSymbol,
	// vniTimeframe) change, so this effect re-fires and re-fetches automatically.
	const handleLoadVNIChartRef = useRef(handleLoadVNIChart);
	useEffect(() => { handleLoadVNIChartRef.current = handleLoadVNIChart; }, [handleLoadVNIChart]);
	useEffect(() => {
		if (activeSource !== "vninvest") return;
		if (!vniHasPAT) {
			setVniError(t("vninvest.error.noPAT") ?? "PAT token not configured");
			setDataStatus("error");
			return;
		}
		void handleLoadVNIChart();
	}, [activeSource, handleLoadVNIChart, vniHasPAT, t]); // fires on source switch + any dep change

	const handleFetchWhaleData = useCallback(async () => {
		if (activeSource !== "vninvest" || !vniHasPAT || !vniSymbol) {
			return;
		}

		setWhaleLoading(true);

		try {
			const response = await vninvestClient.getWhaleFeed(vniSymbol);
			setWhaleData(response);
		} catch (err: unknown) {
			// Whale data is optional, just log error
			const msg = err instanceof Error ? err.message : String(err);
			console.warn("Failed to fetch whale data:", msg);
		} finally {
			setWhaleLoading(false);
		}
	}, [activeSource, vniHasPAT, vniSymbol, vninvestClient]);

	const scheduleForViewport = useCallback((viewport: TimeWindow) => {
		if (isVNInvestSource) {
			return;
		}

		const loadedWindow = computeLoadedWindow(liveDataRef.current);
		if (!loadedWindow) {
			return;
		}

		const targetWindow = computeTargetWindow(viewport, {
			leftPrefetchRatio: SCHEDULER_LEFT_PREFETCH_RATIO,
			rightPrefetchRatio: SCHEDULER_RIGHT_PREFETCH_RATIO,
		});
		const missing = computeMissingSegments(targetWindow, loadedWindow);
		lastMissingRef.current = missing;

		const key = `${dataAdapter.name}:${selectedSymbol}:${timeframe}`;
		if (missing.leftMissing) {
			queueRef.current.enqueue({
				key,
				side: "left",
				targetTs: missing.leftTargetMs,
				priority: 10,
				generation: schedulerGenerationRef.current,
			});
		}
		if (missing.rightMissing) {
			queueRef.current.enqueue({
				key,
				side: "right",
				targetTs: missing.rightTargetMs,
				priority: 5,
				generation: schedulerGenerationRef.current,
			});
		}

		if (queueRef.current.hasPending(schedulerGenerationRef.current)) {
			setHistoryStatus("backfilling");
		}
	}, [SCHEDULER_LEFT_PREFETCH_RATIO, SCHEDULER_RIGHT_PREFETCH_RATIO, dataAdapter.name, isVNInvestSource, selectedSymbol, timeframe]);

	const warmupInitialBinanceHistory = useCallback(async (seedBars: RawOHLCV[]) => {
		if (
			dataAdapter.name !== "binance"
			|| seedBars.length === 0
			|| seedBars.length >= INITIAL_HISTORY_TARGET_BARS
			|| warmupInFlightRef.current
		) {
			return;
		}

		warmupInFlightRef.current = true;
		setHistoryStatus("backfilling");

		try {
			let currentBars = seedBars;
			let pagesLoaded = 0;

			while (
				mountedRef.current
				&& currentBars.length < INITIAL_HISTORY_TARGET_BARS
				&& pagesLoaded < INITIAL_HISTORY_MAX_PAGES
			) {
				const previousEarliestTs = currentBars[0]?.date?.valueOf?.() ?? Number.NaN;
				if (!Number.isFinite(previousEarliestTs)) {
					break;
				}

				const { bars: olderBarRaw } = await dataAdapter.getBars({
					type: "backward",
					symbol: selectedSymbol,
					interval: timeframe,
					limit: BACKFILL_PAGE_LIMIT,
					timestamp: previousEarliestTs,
				});
				const olderBars = olderBarRaw.map(klineBarToRawOHLCV);

				if (olderBars.length === 0) {
					break;
				}

				const oldestReturnedTs = olderBars[0]?.date?.valueOf?.() ?? Number.POSITIVE_INFINITY;
				if (!Number.isFinite(oldestReturnedTs) || oldestReturnedTs >= previousEarliestTs) {
					break;
				}

				currentBars = mergeBarsByDate(olderBars, currentBars);
				pagesLoaded += 1;
			}

			if (mountedRef.current && currentBars.length > liveDataRef.current.length) {
				setLiveData(currentBars);
				setVisibleDomain((current) => current ?? resolveChartRangeExtents(currentBars, chartRangeRef.current));
			}
		} catch (err: unknown) {
			if (!mountedRef.current) {
				return;
			}
			const msg = err instanceof Error ? err.message : String(err);
			setDataError(msg);
		} finally {
			warmupInFlightRef.current = false;
			if (mountedRef.current) {
				setHistoryStatus("idle");
			}
		}
	}, [BACKFILL_PAGE_LIMIT, INITIAL_HISTORY_MAX_PAGES, INITIAL_HISTORY_TARGET_BARS, dataAdapter, selectedSymbol, timeframe]);

	const ensureRangeHistory = useCallback(async (range: ChartRange) => {
		const currentBars = liveDataRef.current;
		if (currentBars.length === 0) {
			return;
		}

		const rangeDomain = resolveChartRangeExtents(currentBars, range);
		setVisibleDomain(rangeDomain);
		const rangeEnd = currentBars[currentBars.length - 1]?.date;
		if (!rangeEnd) {
			return;
		}
		scheduleForViewport({
			startMs: resolveChartRangeStart(rangeEnd, range).valueOf(),
			endMs: rangeEnd.valueOf(),
		});
	}, [scheduleForViewport]);

	const handleVisibleDomainChange = useCallback((domain: [Date | number, Date | number]) => {
		const normalized = normalizeDomain(domain);
		// Do NOT call setVisibleDomain here — that would change xExtents prop, which is in
		// ChartCanvas.CANDIDATES_FOR_RESET, triggering resetChart() on every zoom/pan gesture
		// and causing a feedback loop that can produce blank NaN charts when filterData returns
		// an empty range. visibleDomain is only updated by explicit user actions (range buttons,
		// chart load). The xExtents useMemo applies the zoom-out clamp as a display constraint.

		// Update the ref synchronously so scheduleForViewport and future clamp checks are current.
		visibleDomainRef.current = normalized;

		if (isVNInvestSource) {
			scheduleVNInvestViewportBackfill(visibleRangeRef.current);
			return;
		}

		// Clamp the backfill viewport to maxVisibleBars so we don't request excessive history.
		const data = chartDataRef.current;
		const limit = maxVisibleBarsRef.current;
		const endMs = normalized[1].valueOf();
		let startMs = normalized[0].valueOf();
		if (data.length >= 2 && limit > 0) {
			const intervalMs = data[data.length - 1].date.valueOf() - data[data.length - 2].date.valueOf();
			if (intervalMs > 0) {
				const maxSpanMs = limit * intervalMs;
				if (endMs - startMs > maxSpanMs) {
					startMs = endMs - maxSpanMs;
				}
			}
		}

		scheduleForViewport({ startMs, endMs });
	}, [isVNInvestSource, normalizeDomain, scheduleForViewport, scheduleVNInvestViewportBackfill, setVniDays]);
	const vniWarmupBars = useMemo(
		() => Math.max(120, estimateSeriesWarmupBars(paneState.panes.flatMap((pane) => pane.series)) + 40),
		[paneState.panes],
	);

	const requestVNInvestViewportHistory = useCallback(async (range: VisibleRange) => {
		if (!isVNInvestSource || !vniHasPAT || dataStatusRef.current !== "live" || vniLoadingRef.current) {
			return;
		}

		const currentBars = liveDataRef.current;
		if (currentBars.length === 0 || vniViewportBackfillInFlightRef.current) {
			return;
		}

		const window = computeVNIViewportBackfillWindow(range, currentBars, {
			minBufferBars: vniWarmupBars,
			minTriggerBars: vniWarmupBars,
			leftBufferRatio: 2.5,
		});
		if (!window) {
			return;
		}

		const loadedStartMs = window.loadedStart.getTime();
		if (vniViewportHistoryExhaustedAtRef.current === loadedStartMs) {
			return;
		}

		vniViewportBackfillInFlightRef.current = true;
		setHistoryStatus("backfilling");

		try {
			const normalizedTimeframe = normalizeVNITimeframe(vniTimeframe);
			let olderBars = await vninvestAdapter.fetchBars(vniSymbol, normalizedTimeframe, window.fetchFrom, window.fetchTo);
			if (olderBars.length === 0) {
				olderBars = await vninvestAdapter.fetchMoreBars(
					vniSymbol,
					normalizedTimeframe,
					window.loadedStart,
					Math.max(range.barCount * 3, 90),
				);
			}

			const normalizedOlderBars = olderBars
				.filter((bar) => bar.date.valueOf() < loadedStartMs)
				.map((bar) => ({ ...bar, date: new Date(bar.date) }));

			if (normalizedOlderBars.length === 0) {
				vniViewportHistoryExhaustedAtRef.current = loadedStartMs;
				setVniHistoryFloorDate(new Date(window.loadedStart));
				return;
			}

			const mergedBars = mergeBarsByDate(normalizedOlderBars, currentBars);
			if (mergedBars.length === currentBars.length) {
				vniViewportHistoryExhaustedAtRef.current = loadedStartMs;
				setVniHistoryFloorDate(new Date(window.loadedStart));
				return;
			}

			const viewportDomain = visibleDomainRef.current ?? [normalizeDate(range.startDate), normalizeDate(range.endDate)] as [Date, Date];
			vniViewportHistoryExhaustedAtRef.current = null;
			setVniHistoryFloorDate(null);
			liveDataRef.current = mergedBars;
			visibleDomainRef.current = viewportDomain;
			setVisibleDomain(viewportDomain);
			setLiveData(mergedBars);
		} catch (err: unknown) {
			if (!mountedRef.current) {
				return;
			}
			const status = (err as any)?.status;
			if (status === 429) {
				// API throttled — stop backfill attempts for this position so we
				// don't hammer the backend further. The circuit breaker in
				// VNInvestClient will block subsequent requests automatically.
				vniViewportHistoryExhaustedAtRef.current = loadedStartMs;
				const remainSec = Math.ceil(((err as any)?.throttledUntil ?? 0) - Date.now()) / 1000;
				console.warn(
					`VNI viewport backfill throttled (429). Backfill paused ~${Math.max(0, Math.ceil(remainSec))}s.`
				);
			} else {
				console.warn("VNI viewport backfill error:", err instanceof Error ? err.message : String(err));
			}
		} finally {
			vniViewportBackfillInFlightRef.current = false;
			if (mountedRef.current) {
				setHistoryStatus("idle");
			}
		}
	}, [isVNInvestSource, vniHasPAT, vninvestAdapter, vniSymbol, vniTimeframe, vniWarmupBars]);

	useEffect(() => {
		if (!isVNInvestSource || vniLoading || dataStatus !== "live") {
			return;
		}

		const range = visibleRangeRef.current;
		if (!range) {
			return;
		}

		void requestVNInvestViewportHistory(range);
	}, [dataStatus, isVNInvestSource, requestVNInvestViewportHistory, vniLoading]);

	function scheduleVNInvestViewportBackfill(range: VisibleRange | null) {
		if (!range) {
			return;
		}
		if (backfillDebounceRef.current !== null) {
			clearTimeout(backfillDebounceRef.current);
		}
		backfillDebounceRef.current = window.setTimeout(() => {
			backfillDebounceRef.current = null;
			void requestVNInvestViewportHistory(range);
		}, VNI_VIEWPORT_BACKFILL_DEBOUNCE_MS);
	}

	const handleVisibleRangeChange = useCallback((range: VisibleRange) => {
		visibleRangeRef.current = range;
		setVisibleRange(range);
		setHoveredItem(null);
		if (isVNInvestSource) {
			scheduleVNInvestViewportBackfill(range);
			return;
		}

		const currentDomain = visibleDomainRef.current;
		if (currentDomain) {
			scheduleForViewport({
				startMs: currentDomain[0].valueOf(),
				endMs: currentDomain[1].valueOf(),
			});
		}
	}, [isVNInvestSource, scheduleVNInvestViewportBackfill, scheduleForViewport]);

	const dataStatusRef = useRef(dataStatus);
	useEffect(() => { dataStatusRef.current = dataStatus; }, [dataStatus]);

	const publishWarmupDebug = useCallback((reason: string) => {
		if (typeof window === "undefined") {
			return;
		}
		(window as typeof window & { __twlWarmupDebug?: unknown }).__twlWarmupDebug = {
			reason,
			dataStatus: dataStatusRef.current,
			adapterName: dataAdapter.name,
			requested: initialWarmupRequestedRef.current,
			liveBars: liveDataRef.current.length,
		};
	}, [dataAdapter.name]);

	const handleChartRangeChange = useCallback((range: ChartRange) => {
		setChartRange(range);
		visibleRangeRef.current = null;
		setVisibleRange(null);
		setHoveredItem(null);
		setVniHistoryFloorDate(null);

		// For VNInvest source: map range → required days.
		// Setting vniDays causes handleLoadVNIChart to be recreated (it depends on vniDays),
		// which triggers the auto-load useEffect above to re-fetch the right history window.
		if (isVNInvestSource && vniHasPAT) {
			const days = chartRangeToDays(range);
			vniDaysRef.current = days;
			setVniDays(days);
			return;
		}

		const currentBars = liveDataRef.current;
		if (currentBars.length > 0) {
			setVisibleDomain(resolveChartRangeExtents(currentBars, range));
		}
		void ensureRangeHistory(range);
	}, [ensureRangeHistory, isVNInvestSource, vniHasPAT]);

	// Unified timeframe change: routes to the correct state depending on active source.
	const handleTimeframeChange = useCallback((value: string) => {
		if (isVNInvestSource) {
			setVniTimeframe(value);
		} else {
			if ((TIMEFRAMES as readonly string[]).includes(value)) {
				setTimeframe(value as Timeframe);
			}
		}
	}, [isVNInvestSource]);

	// Fetch history on mount and on timeframe/adapter change.
	useEffect(() => {
		if (isVNInvestSource) {
			return undefined;
		}

		mountedRef.current = true;
		const abortController = new AbortController();
		setDataStatus("loading");
		setDataError("");
		setHistoryStatus("idle");
		initialWarmupRequestedRef.current = false;
		schedulerGenerationRef.current += 1;
		queueRef.current.clearAll();
		lastMissingRef.current = null;
		visibleRangeRef.current = null;
		setVisibleRange(null);
		setHoveredItem(null);
		setVisibleDomain(null);

		dataAdapter.getBars({ type: "init", symbol: selectedSymbol, interval: timeframe, limit: BACKFILL_PAGE_LIMIT, timestamp: null, signal: abortController.signal })
			.then((result) => {
				if (abortController.signal.aborted) return;
				const bars = result.bars.map(klineBarToRawOHLCV);
				liveDataRef.current = bars;
				setLiveData(bars);
				const initialDomain = resolveChartRangeExtents(bars, chartRangeRef.current);
				setVisibleDomain(initialDomain);
				setDataStatus("live");
				scheduleForViewport({
					startMs: initialDomain[0].valueOf(),
					endMs: initialDomain[1].valueOf(),
				});
				window.setTimeout(() => {
					initialWarmupRequestedRef.current = true;
					publishWarmupDebug("warmup-timer-fired");
					void warmupInitialBinanceHistory(bars);
				}, 0);
			})
			.catch((err: unknown) => {
				if (abortController.signal.aborted) return;
				const msg = err instanceof Error ? err.message : String(err);
				setDataError(msg);
				// Fallback to offline data
				const offlineBars = getOfflineDemoBars();
				setLiveData(offlineBars);
				setVisibleDomain(resolveChartRangeExtents(offlineBars, chartRangeRef.current));
				setDataStatus("offline");
			});

		return () => abortController.abort();
	}, [BACKFILL_PAGE_LIMIT, dataAdapter, isVNInvestSource, publishWarmupDebug, scheduleForViewport, selectedSymbol, timeframe, warmupInitialBinanceHistory]);

	const data = useMemo<RawOHLCV[]>(
		() => {
			if (liveData.length > 0) {
				return liveData;
			}
			return isVNInvestSource ? [] : getOfflineDemoBars();
		},
		[isVNInvestSource, liveData],
	);

	useEffect(() => {
		if (isVNInvestSource || dataStatus !== "live") {
			return;
		}

		const timer = window.setInterval(() => {
			if (backfillInFlightRef.current || !mountedRef.current) {
				return;
			}

			void dataAdapter.getBars({ type: "forward", symbol: selectedSymbol, interval: timeframe, limit: BACKFILL_PAGE_LIMIT, timestamp: null })
				.then((result) => {
					const latestBars = result.bars.map(klineBarToRawOHLCV);
					if (!mountedRef.current || latestBars.length === 0) {
						return;
					}
					setLiveData((current) => mergeBarsByDate(current, latestBars));
				})
				.catch((err: unknown) => {
					if (!mountedRef.current) {
						return;
					}
					const msg = err instanceof Error ? err.message : String(err);
					setDataError(msg);
				});
		}, 30000);

		return () => window.clearInterval(timer);
	}, [BACKFILL_PAGE_LIMIT, dataAdapter, dataStatus, isVNInvestSource, selectedSymbol, timeframe]);

	useEffect(() => {
		if (isVNInvestSource || dataStatus !== "live") {
			return;
		}

		const timer = window.setInterval(() => {
			if (backfillInFlightRef.current || !mountedRef.current) {
				return;
			}

			const job = queueRef.current.dequeue(schedulerGenerationRef.current);
			if (!job) {
				if (!queueRef.current.hasPending(schedulerGenerationRef.current) && historyStatus !== "idle") {
					setHistoryStatus("idle");
				}
				return;
			}

			backfillInFlightRef.current = true;
			setHistoryStatus("backfilling");

			void (async () => {
				let currentBars = liveDataRef.current;
				try {
					if (job.side === "left") {
						let pagesLoaded = 0;
						while (
							mountedRef.current
							&& currentBars.length > 0
							&& currentBars[0].date.valueOf() > job.targetTs
							&& pagesLoaded < SCHEDULER_MAX_BACKWARD_PAGES
						) {
							const previousEarliestTs = currentBars[0].date.valueOf();
							const { bars: olderBarRaw } = await dataAdapter.getBars({
								type: "backward",
								symbol: selectedSymbol,
								interval: timeframe,
								limit: BACKFILL_PAGE_LIMIT,
								timestamp: previousEarliestTs,
							});
							const olderBars = olderBarRaw.map(klineBarToRawOHLCV);
							if (olderBars.length === 0) {
								break;
							}

							const oldestReturnedTs = olderBars[0]?.date?.valueOf?.() ?? Number.POSITIVE_INFINITY;
							if (!Number.isFinite(oldestReturnedTs) || oldestReturnedTs >= previousEarliestTs) {
								break;
							}

							currentBars = mergeBarsByDate(olderBars, currentBars);
							pagesLoaded += 1;
						}

						if (
							mountedRef.current
							&& currentBars.length > 0
							&& currentBars[0].date.valueOf() > job.targetTs
						) {
							queueRef.current.enqueue({
								key: job.key,
								side: "left",
								targetTs: job.targetTs,
								priority: job.priority,
								generation: job.generation,
							});
						}
					} else {
						let pagesLoaded = 0;
						while (
							mountedRef.current
							&& currentBars.length > 0
							&& currentBars[currentBars.length - 1].date.valueOf() < job.targetTs
							&& pagesLoaded < SCHEDULER_MAX_FORWARD_PAGES
						) {
							const previousLatestTs = currentBars[currentBars.length - 1].date.valueOf();
							const { bars: newerBarRaw } = await dataAdapter.getBars({
								type: "forward",
								symbol: selectedSymbol,
								interval: timeframe,
								limit: BACKFILL_PAGE_LIMIT,
								timestamp: null,
							});
							const newerBars = newerBarRaw.map(klineBarToRawOHLCV);
							if (newerBars.length === 0) {
								break;
							}

							const mergedBars = mergeBarsByDate(currentBars, newerBars);
							const mergedLatestTs = mergedBars[mergedBars.length - 1]?.date?.valueOf?.() ?? Number.NEGATIVE_INFINITY;
							if (!Number.isFinite(mergedLatestTs) || mergedLatestTs <= previousLatestTs) {
								break;
							}

							currentBars = mergedBars;
							pagesLoaded += 1;
						}
					}

					if (currentBars !== liveDataRef.current) {
						setLiveData(currentBars);
					}
				} catch (err: unknown) {
					if (mountedRef.current) {
						const msg = err instanceof Error ? err.message : String(err);
						setDataError(msg);
					}
				} finally {
					queueRef.current.complete(job.id);
					backfillInFlightRef.current = false;
					if (!queueRef.current.hasPending(schedulerGenerationRef.current)) {
						setHistoryStatus("idle");
					}
				}
			})();
		}, SCHEDULER_TICK_MS);

		return () => window.clearInterval(timer);
	}, [BACKFILL_PAGE_LIMIT, SCHEDULER_MAX_BACKWARD_PAGES, SCHEDULER_MAX_FORWARD_PAGES, SCHEDULER_TICK_MS, dataAdapter, dataStatus, historyStatus, isVNInvestSource, selectedSymbol, timeframe]);

	// Periodic polling for VNInvest real-time data updates.
	// Binance source has its own forward-fetch mechanism above; this handles VNI REST polling.
	useEffect(() => {
		if (!isVNInvestSource || !vniHasPAT || dataStatus === "loading") {
			return undefined;
		}

		// Poll every 60s — short enough to catch intraday candle updates, conservative enough for REST.
		const POLL_INTERVAL_MS = 60_000;

		const poll = () => {
			if (!mountedRef.current) return;
			void vninvestDataSource.loadBars(vniSymbol, {
				timeframe: vniTimeframe,
				days: Math.min(vniDays, 5),
			}).then((latestBars) => {
				if (!mountedRef.current || latestBars.length === 0) return;
				const current = liveDataRef.current;
				const merged = mergeBarsByDate(current, latestBars);
				// Only update state when there is actually new/changed data.
				const hasNew = merged.length > current.length
					|| merged[merged.length - 1]?.close !== current[current.length - 1]?.close;
				if (hasNew) {
					liveDataRef.current = merged;
					setLiveData(merged);
				}
			}).catch((err: unknown) => {
				// Polling errors are non-fatal — log quietly.
				console.warn("VNI poll error:", err instanceof Error ? err.message : String(err));
			});
		};

		const timer = window.setInterval(poll, POLL_INTERVAL_MS);
		return () => window.clearInterval(timer);
	}, [isVNInvestSource, vniHasPAT, dataStatus, vninvestDataSource, vniSymbol, vniTimeframe, vniDays]);

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

	useEffect(() => {
		setPaperTradePosition(null);
		setPaperTradeHistory([]);
		paperTradePositionRef.current = null;
		lastPaperTradeSignatureRef.current = null;
	}, [timeframe]);

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

	const plotData = useMemo<EnrichedDatum[]>(() => {
		const enrichedData = enrichData(replayVisibleData, { series: indicatorSeries });
		if (chartType !== "heikinashi" || enrichedData.length === 0) return enrichedData;
		const transformed = transformHeikinAshi(replayVisibleData);
		return transformed.map((bar, i) => ({
			...enrichedData[i],
			open: bar.open,
			high: bar.high,
			low:   bar.low,
			close: bar.close,
		}));
	}, [chartType, indicatorSeries, replayVisibleData]);

	const chartData = useMemo<EnrichedDatum[]>(() => plotData.filter((bar): bar is EnrichedDatum => Boolean(bar && bar.date)), [plotData]);

	useEffect(() => {
		chartDataRef.current = chartData;
	}, [chartData]);
	const widgetData = useMemo<OHLCVBar[]>(() => replayVisibleData.map((bar, index) => ({
		...bar,
		index,
		dataIndex: index,
	})), [replayVisibleData]);

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

	const xExtents = useMemo<[Date, Date]>(() => {
		const base: [Date, Date] = visibleDomain ?? resolveChartRangeExtents(chartData, chartRange);
		if (chartData.length >= 2 && maxVisibleBars > 0) {
			const endMs = base[1].valueOf();
			const baseSpan = endMs - base[0].valueOf();
			const intervalMs = chartData[chartData.length - 1].date.valueOf() - chartData[chartData.length - 2].date.valueOf();
			if (intervalMs > 0) {
				const maxSpanMs = maxVisibleBars * intervalMs;
				// Only clamp when domain is wider than the limit (zoom-out guard).
				if (baseSpan > maxSpanMs) {
					const clampedStart = endMs - maxSpanMs;
					return [new Date(clampedStart), base[1]];
				}
			}
		}
		return base;
	}, [visibleDomain, chartRange, chartData, maxVisibleBars]);
	const lastBar = chartData[chartData.length - 1];
	const visibleBarCount = visibleRange?.barCount ?? chartData.length;
	const visibleEndIndex = visibleRange ? Math.min(visibleRange.endIndex, Math.max(chartData.length - 1, 0)) : chartData.length - 1;
	const visibleLastBar = visibleEndIndex >= 0 ? chartData[visibleEndIndex] ?? null : null;
	const hoveredBar = hoveredItem
		? chartData.find((bar) => bar.date.valueOf() === hoveredItem.date.valueOf()) ?? hoveredItem
		: null;
	const ohlcBar = hoveredBar ?? visibleLastBar ?? lastBar ?? null;
	const selectedDrawingId = useMemo(() => getSelectedDrawingId(drawingInteraction.drawingState), [drawingInteraction.drawingState]);
	const selectedDrawingIds = useMemo(() => getSelectedDrawingIds(drawingInteraction.drawingState), [drawingInteraction.drawingState]);
	const selectedDrawingCount = selectedDrawingIds.length;
	const sortedDrawings = useMemo(() => sortDrawings(drawingInteraction.allDrawings), [drawingInteraction.allDrawings]);
	const selectedDrawing = useMemo(() => sortedDrawings.find((drawing) => drawing.id === selectedDrawingId) ?? null, [selectedDrawingId, sortedDrawings]);
	const selectedDrawingSet = useMemo(() => new Set(selectedDrawingIds), [selectedDrawingIds]);
	const selectedDrawings = useMemo(() => drawingInteraction.allDrawings.filter((drawing) => selectedDrawingSet.has(drawing.id)), [drawingInteraction.allDrawings, selectedDrawingSet]);
	const selectedAllLocked = selectedDrawingCount > 0 && selectedDrawings.every((drawing) => drawing.locked === true);
	const selectedAllVisible = selectedDrawingCount > 0 && selectedDrawings.every((drawing) => drawing.visible !== false);
	const selectedAnyLocked = selectedDrawingCount > 0 && selectedDrawings.some((drawing) => drawing.locked === true);
	const isEditingText = drawingInteraction.drawingState.type === "editing"
		&& selectedDrawingCount === 1
		&& selectedDrawing?.type === "text"
		&& drawingInteraction.drawingState.objectId === selectedDrawing.id;
	const drawingContextMenuDrawing = useMemo(() => {
		if (!drawingContextMenu) {
			return null;
		}

		return sortedDrawings.find((drawing) => drawing.id === drawingContextMenu.drawingId) ?? selectedDrawing;
	}, [drawingContextMenu, selectedDrawing, sortedDrawings]);
	const drawingPanelX = useMemo(() => Math.max(16, chartWidth - DRAWING_PANEL_WIDTH - 16), [chartWidth]);
	const drawingInspectorPosition = useMemo(() => ({ x: drawingPanelX, y: 16 }), [drawingPanelX]);
	const drawingListPosition = useMemo(() => ({ x: drawingPanelX, y: 286 }), [drawingPanelX]);
	const storageToolbarPosition = useMemo(() => ({ x: 16, y: 16 }), []);
	const drawingTextEditorLabels = useMemo(() => ({
		title: t("drawing.textEditorTitle"),
		label: t("drawing.textEditorLabel"),
		placeholder: t("drawing.textEditorPlaceholder"),
		edit: t("drawing.textEditorEdit"),
		save: t("drawing.textEditorSave"),
		cancel: t("drawing.textEditorCancel"),
		empty: t("drawing.textEditorEmpty"),
	}), [t]);
	const replayFinished = replayState.allData.length > 0 && replayState.currentIndex >= replayState.allData.length && !replayState.isPlaying;
	const paperTradePanelVisible = showReplayBar || paperTradePosition !== null || paperTradeHistory.length > 0;
	const paperTradeReportVisible = replayFinished || paperTradeHistory.length > 0;
	const paperTradeRealizedPnl = useMemo(
		() => paperTradeHistory.reduce((sum, trade) => sum + trade.pnl, 0),
		[paperTradeHistory],
	);
	const paperTradeUnrealizedPnl = useMemo(
		() => (paperTradePosition && lastBar ? lastBar.close - paperTradePosition.entryPrice : 0),
		[lastBar, paperTradePosition],
	);
	const paperTradeSummary = useMemo(() => {
		const totalTrades = paperTradeHistory.length;
		const wins = paperTradeHistory.filter((trade) => trade.pnl > 0).length;
		const losses = paperTradeHistory.filter((trade) => trade.pnl < 0).length;
		const realizedPnl = paperTradeRealizedPnl;
		const averagePnl = totalTrades > 0 ? realizedPnl / totalTrades : 0;
		const averageBarsHeld = totalTrades > 0
			? paperTradeHistory.reduce((sum, trade) => sum + trade.barsHeld, 0) / totalTrades
			: 0;
		const bestTrade = totalTrades > 0
			? paperTradeHistory.reduce((best, trade) => (trade.pnl > best.pnl ? trade : best), paperTradeHistory[0])
			: null;
		const worstTrade = totalTrades > 0
			? paperTradeHistory.reduce((worst, trade) => (trade.pnl < worst.pnl ? trade : worst), paperTradeHistory[0])
			: null;

		return {
			totalTrades,
			wins,
			losses,
			winRate: totalTrades > 0 ? wins / totalTrades : 0,
			realizedPnl,
			averagePnl,
			averageBarsHeld,
			bestTrade,
			worstTrade,
		};
	}, [paperTradeHistory, paperTradeRealizedPnl]);
	const paperTradeJournal = useMemo(() => [...paperTradeHistory].reverse(), [paperTradeHistory]);
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

	const closePaperTradePosition = useCallback((exitBar: { date: Date | number; close: number }, exitIndex: number) => {
		const currentPosition = paperTradePositionRef.current;
		if (!currentPosition) {
			return;
		}

		const closedTrade: ClosedPaperTrade = {
			...currentPosition,
			exitDate: exitBar.date,
			exitPrice: exitBar.close,
			exitIndex,
			pnl: exitBar.close - currentPosition.entryPrice,
			barsHeld: Math.max(0, exitIndex - currentPosition.entryIndex),
		};
		const signature = [
			normalizeDate(closedTrade.entryDate).getTime(),
			normalizeDate(closedTrade.exitDate).getTime(),
			closedTrade.entryPrice.toFixed(2),
			closedTrade.exitPrice.toFixed(2),
			closedTrade.barsHeld,
		].join(":");
		if (lastPaperTradeSignatureRef.current === signature) {
			return;
		}
		lastPaperTradeSignatureRef.current = signature;
		paperTradePositionRef.current = null;
		setPaperTradePosition(null);
		setPaperTradeHistory((history) => [...history, closedTrade]);
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

	const handlePaperTradeReset = useCallback(() => {
		setPaperTradePosition(null);
		setPaperTradeHistory([]);
		paperTradePositionRef.current = null;
		lastPaperTradeSignatureRef.current = null;
	}, []);

	const handlePaperTradeClick = useCallback((moreProps: { currentItem?: EnrichedDatum }) => {
		if (!replayState.isPlaying) {
			return;
		}

		const currentItem = moreProps.currentItem ?? replayState.currentBar;
		if (!currentItem) {
			return;
		}

		const now = Date.now();
		const lastClick = lastPaperTradeClickRef.current;
		if (lastClick && lastClick.index === replayState.currentIndex && now - lastClick.timestamp < 100) {
			return;
		}
		lastPaperTradeClickRef.current = {
			timestamp: now,
			index: replayState.currentIndex,
		};

		if (paperTradePositionRef.current) {
			closePaperTradePosition(currentItem, replayState.currentIndex);
			return;
		}

		const nextPosition = {
			entryDate: currentItem.date,
			entryPrice: currentItem.close,
			entryIndex: replayState.currentIndex,
		};
		paperTradePositionRef.current = nextPosition;
		setPaperTradePosition(nextPosition);
		lastPaperTradeSignatureRef.current = null;
	}, [closePaperTradePosition, replayState.currentBar, replayState.currentIndex, replayState.isPlaying]);

	useEffect(() => {
		if (!replayFinished || !paperTradePositionRef.current || !lastBar) {
			return;
		}

		closePaperTradePosition(lastBar, replayState.currentIndex);
	}, [closePaperTradePosition, lastBar, replayFinished, replayState.currentIndex]);

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
	const candleTypeLabel = useCallback((type: ChartTypeId) => t(`candleType.${type}`), [t]);
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

	const chartReady = dataStatus !== "loading" && chartWidth > 0 && chartHeight > 0 && chartData.length > 0 && paneState.visiblePanes.length > 0;
	// Keep PAT in sync between VNInvestClient (demo data layer) and VNInvestAdapter (widget layer).
	useEffect(() => {
		if (typeof localStorage === "undefined") return;
		try {
			const token = localStorage.getItem("vni_pat");
			if (token) vninvestAdapter.setPAT(token);
		} catch { /* ignore */ }
	}, [vninvestAdapter]);

	const localChartAdapter = useMemo<StockDataAdapter>(() => ({
		async fetchBars(_symbol: string, _timeframe: string, _from: Date, _to: Date) {
			return widgetData.map((bar) => ({ ...bar, date: new Date(bar.date) }));
		},
		async fetchMoreBars(_symbol: string, _timeframe: string, before: Date, limit = 300) {
			return widgetData
				.filter((bar) => bar.date < before)
				.slice(-limit)
				.map((bar) => ({ ...bar, date: new Date(bar.date) }));
		},
		subscribeToBar() { return () => undefined; },
		subscribeToTrades() { return () => undefined; },
		subscribeToOrderbook() { return () => undefined; },
		async searchSymbols() {
			return [{ symbol: "BTCUSDT", name: "Bitcoin / Tether", exchange: "BINANCE" }];
		},
	}), [widgetData]);

	// When activeSource is "vninvest" the widget routes through VNInvestAdapter
	// so it reads live data from core-api:8100.  Any other source uses local data.
	const chartAdapter = useMemo<StockDataAdapter>(
		() => activeSource === "vninvest" ? vninvestAdapter : localChartAdapter,
		[activeSource, vninvestAdapter, localChartAdapter],
	);
	const widgetMessages = language === "vi" ? widgetMessagesVi : widgetMessagesEn;

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

	// Close profile menu when clicking outside
	useEffect(() => {
		if (!showProfileMenu) return;
		const handler = (e: MouseEvent) => {
			if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
				setShowProfileMenu(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [showProfileMenu]);

	useEffect(() => {
		if (activeSource !== "vninvest") {
			setShowWhaleDialog(false);
			return;
		}
		setShowWhaleDialog(true);
	}, [activeSource]);

	// Close drawing tool flyout when clicking outside toolbar
	useEffect(() => {
		if (!openGroupId) return;
		const handler = (e: MouseEvent) => {
			if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
				setOpenGroupId(null);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [openGroupId]);

	const ratio = window.devicePixelRatio || 1;
	const priceIsUp = (ohlcBar?.close ?? 0) >= (ohlcBar?.open ?? 0);
	const vniHistoryFloorLabel = vniHistoryFloorDate
		? t("library.vniHistoryAvailableFrom", { date: shortDateFormat(vniHistoryFloorDate) })
		: null;
	const handleDrawingToolUsed = useCallback(() => setActiveTool("cursor"), []);
	const updateSelectedDrawing = useCallback((patch: Partial<DrawingObject>) => {
		if (selectedDrawingCount === 0) {
			return;
		}

		if (selectedDrawingCount > 1) {
			updateSelectedDrawings(patch);
			return;
		}

		updateDrawing(selectedDrawing!.id, patch);
	}, [selectedDrawing, selectedDrawingCount, updateDrawing, updateSelectedDrawings]);

	const toggleSelectedLock = useCallback(() => {
		if (selectedDrawingCount === 0) {
			return;
		}

		if (selectedDrawingCount > 1) {
			updateSelectedDrawings({ locked: !selectedAllLocked });
			return;
		}

		updateSelectedDrawing({ locked: !selectedDrawing!.locked });
	}, [selectedAllLocked, selectedDrawing, selectedDrawingCount, updateSelectedDrawing, updateSelectedDrawings]);

	const toggleSelectedVisible = useCallback(() => {
		if (selectedDrawingCount === 0) {
			return;
		}

		if (selectedDrawingCount > 1) {
			updateSelectedDrawings({ visible: !selectedAllVisible });
			return;
		}

		updateSelectedDrawing({ visible: selectedDrawing!.visible === false });
	}, [selectedAllVisible, selectedDrawing, selectedDrawingCount, updateSelectedDrawing, updateSelectedDrawings]);

	const bringSelectedToFront = useCallback(() => {
		reorderSelectedToFront();
	}, [reorderSelectedToFront]);

	const sendSelectedToBack = useCallback(() => {
		reorderSelectedToBack();
	}, [reorderSelectedToBack]);

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
		const nextClone = offsetDrawingByPixels(selectedDrawing, timeOffset, priceOffset, resolveDrawingPlacementForPane(selectedDrawing, selectedPane));
		replaceDrawings([...drawingInteraction.allDrawings, nextClone]);
		selectObject(nextClone.id);
		setActiveTool("cursor");
	}, [chartHeight, chartWidth, drawingInteraction.allDrawings, plotData, replaceDrawings, selectObject, selectedDrawing, selectedPane]);
	const copySelectedDrawing = useCallback(() => {
		if (!selectedDrawing) {
			return;
		}

		drawingClipboardRef.current = cloneDrawingSnapshot(selectedDrawing);
	}, [selectedDrawing]);
	const pasteCopiedDrawing = useCallback(() => {
		const clipboardDrawing = drawingClipboardRef.current;
		if (!clipboardDrawing || chartWidth <= 0 || chartHeight <= 0 || plotData.length < 2) {
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
		const nextPaste = offsetDrawingByPixels(clipboardDrawing, timeOffset, priceOffset, resolveDrawingPlacementForPane(clipboardDrawing, selectedPane));
		replaceDrawings([...drawingInteraction.allDrawings, nextPaste]);
		selectObject(nextPaste.id);
		setActiveTool("cursor");
	}, [chartHeight, chartWidth, drawingInteraction.allDrawings, plotData, replaceDrawings, selectObject, selectedPane]);

	const handleDrawingContextMenu = useCallback((moreProps: { hitDrawing?: DrawingObject | null }, event: unknown) => {
		const targetDrawing = moreProps.hitDrawing;
		if (!targetDrawing) {
			closeDrawingContextMenu();
			return;
		}

		const shellNode = shellRef.current;
		if (!shellNode) {
			return;
		}

		const nativeEvent = event as MouseEvent | undefined;
		const rect = shellNode.getBoundingClientRect();
		const x = Math.min(
			Math.max(12, (nativeEvent?.clientX ?? rect.left) - rect.left + 8),
			Math.max(12, rect.width - 260),
		);
		const y = Math.min(
			Math.max(12, (nativeEvent?.clientY ?? rect.top) - rect.top + 8),
			Math.max(12, rect.height - 320),
		);

		selectObject(targetDrawing.id);
		setDrawingContextMenu({ x, y, drawingId: targetDrawing.id });
	}, [closeDrawingContextMenu, selectObject]);

	useEffect(() => {
		if (drawingInteraction.drawingState.type === "editing") {
			setDrawingTextDraft(drawingInteraction.drawingState.text);
			return;
		}

		setDrawingTextDraft("");
	}, [drawingInteraction.drawingState]);

	const handleStartTextEdit = useCallback(() => {
		if (!selectedDrawing || selectedDrawing.type !== "text") {
			return;
		}

		drawingInteraction.startEditing(selectedDrawing.id, selectedDrawing.text ?? "");
		setDrawingTextDraft(selectedDrawing.text ?? "");
	}, [drawingInteraction, selectedDrawing]);

	const handleCommitTextEdit = useCallback(() => {
		if (!selectedDrawing || selectedDrawing.type !== "text") {
			return;
		}

		updateDrawing(selectedDrawing.id, { text: drawingTextDraft });
		cancelDrawing();
		selectObject(selectedDrawing.id);
		setActiveTool("cursor");
	}, [cancelDrawing, drawingTextDraft, selectObject, selectedDrawing, updateDrawing]);

	const handleCancelTextEdit = useCallback(() => {
		if (selectedDrawing && selectedDrawing.type === "text") {
			setDrawingTextDraft(selectedDrawing.text ?? "");
		}

		cancelDrawing();
		if (selectedDrawing) {
			selectObject(selectedDrawing.id);
		}
		setActiveTool("cursor");
	}, [cancelDrawing, selectObject, selectedDrawing]);

	useEffect(() => {
		const handleDrawingShortcuts = (event: KeyboardEvent) => {
			if (isEditableTarget(event.target)) {
				return;
			}

			const shortcut = resolveDrawingShortcut(event);
			if (!shortcut) {
				return;
			}

			event.preventDefault();
			closeDrawingContextMenu();

			if (shortcut.type === "tool") {
				cancelDrawing();
				setActiveTool(shortcut.tool);
				return;
			}

			switch (shortcut.command) {
				case "delete":
					deleteSelected();
					return;
				case "copy":
					copySelectedDrawing();
					return;
				case "paste":
					pasteCopiedDrawing();
					return;
				case "clone":
					cloneSelectedDrawing();
					return;
				case "undo":
					undo();
					return;
				case "redo":
					redo();
					return;
				case "escape":
					cancelDrawing();
					setActiveTool("cursor");
					return;
			}
		};

		window.addEventListener("keydown", handleDrawingShortcuts);
		return () => window.removeEventListener("keydown", handleDrawingShortcuts);
	}, [cancelDrawing, closeDrawingContextMenu, cloneSelectedDrawing, copySelectedDrawing, deleteSelected, pasteCopiedDrawing, redo, undo]);

	const handleCloseDrawingInspector = useCallback(() => {
		closeDrawingContextMenu();
		cancelDrawing();
		setActiveTool("cursor");
	}, [cancelDrawing, closeDrawingContextMenu]);

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
		setShowDrawingPriceMarkers(DEFAULT_DEMO_SETTINGS.showDrawingPriceMarkers);
		setShowNonTradingDays(DEFAULT_DEMO_SETTINGS.showNonTradingDays);
		setMaxVisibleBars(DEFAULT_DEMO_SETTINGS.maxVisibleBars);
		setSettingsSection("layout");
		setSettingsPaneId("price");
		setSettingsOpen(false);
	}, [paneState]);

	const isStockContext = isVNInvestSource;

	const handleSourceChange = useCallback((source: "demo" | "vninvest") => {
		activeSourceRef.current = source;
		// Reset VNI loading guard so the new source can fetch immediately
		vniLoadingRef.current = false;
		vniViewportHistoryExhaustedAtRef.current = null;
		setActiveSource(source);
		if (source === "vninvest") {
			const days = chartRangeToDays(chartRange);
			vniDaysRef.current = days;
			setVniDays(days);
		}
		setVisibleRange(null);
		setHoveredItem(null);
		setVniHistoryFloorDate(null);
		// Keep adapter in sync: vnstocks <-> vninvest, binance <-> demo
		if (source === "vninvest") {
			setDataAdapterName((cur) => cur === "vnstocks" ? cur : "vnstocks");
		} else {
			setDataAdapterName((cur) => cur === "vnstocks" ? "binance" : cur);
		}
		setVniError(null);
		setSourceNotice(null);
	}, [chartRange]);

	const handleDataAdapterChange = useCallback((nextAdapter: string) => {
		setDataAdapterName(nextAdapter);
		// Keep activeSource in sync with adapter choice
		if (nextAdapter === "vnstocks") {
			activeSourceRef.current = "vninvest";
			setActiveSource("vninvest");
			const days = chartRangeToDays(chartRange);
			vniDaysRef.current = days;
			setVniDays(days);
		} else {
			activeSourceRef.current = "demo";
			setActiveSource("demo");
		}
		setVisibleRange(null);
		setHoveredItem(null);
		setVniHistoryFloorDate(null);
		setVniError(null);
		setSourceNotice(null);
	}, [chartRange]);

	useEffect(() => {
		if (aboutOpen) {
			void releaseNotice.refresh();
		}
	}, [aboutOpen, releaseNotice.refresh]);

	return (
		<DemoPageShell className="demo-page--terminal" frameClassName="demo-frame--terminal">
			<div className={`gc-terminal gc-terminal--embedded${showReplayBar ? " gc-terminal--replay-bar" : ""}`}>
			<header className="gc-topbar">
				<div className="gc-topbar__left">
					<button
						type="button"
						className="gc-logo gc-logo--button"
						aria-label={t("brand.openAbout")}
						aria-haspopup="dialog"
						onClick={openAbout}
					>
						<BrandMark className="gc-brand-mark" size={28} />
					</button>

					<div className="gc-symbol-block">
					<span className="gc-symbol-name">{isVNInvestSource ? vniSymbol : selectedSymbol}</span>
					</div>

					<div className="gc-topbar-sep" />

					{/* Unified timeframe selector — options differ by data source */}
					{(() => {
						const isStock = isVNInvestSource;
						const options = isStock ? VNI_TIMEFRAMES : TIMEFRAMES;
						const value = isStock ? vniTimeframe : timeframe;
						return (
							<select
								className="vnsc-candle-type-select"
								aria-label={t("library.timeframes")}
								value={value}
								style={{ width: "fit-content" }}
								onChange={(e) => handleTimeframeChange(e.target.value)}
							>
								{options.map((tf) => (
									<option key={tf} value={tf}>{tf}</option>
								))}
							</select>
						);
					})()}

					<div className="gc-topbar-sep" />

					<select
						className="vnsc-candle-type-select"
						aria-label={t("toolbar.candleType")}
						value={chartType}
						style={{ width: "fit-content" }}
						onChange={(event) => handleChartTypeChange(event.target.value as ChartTypeId)}
					>
						{CHART_TYPES.map((id) => (
							<option key={id} value={id}>
								{candleTypeLabel(id)}
							</option>
						))}
					</select>

					<button
						type="button"
						className={`gc-topbar-btn${showReplayBar ? " gc-topbar-btn--active" : ""}`}
						onClick={() => setShowReplayBar((v) => !v)}
						title={t("replay.controls")}
						aria-pressed={showReplayBar}
					>
						<svg width="13" height="13" viewBox="0 0 16 16" fill="none">
							<polygon points="4,2 14,8 4,14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill={showReplayBar ? "currentColor" : "none"} />
						</svg>
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
								{activeSource === "vninvest" ? (
									<button
										type="button"
										className={`gc-chart-type-item${showWhaleDialog ? " gc-chart-type-item--active" : ""}`}
										onClick={() => setShowWhaleDialog((value) => !value)}
										title={showWhaleDialog ? t("library.hidePane") : t("library.showPane")}
									>
										{showWhaleDialog ? (
											<svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: 6, flexShrink: 0 }}>
												<path d="M2 6l3 3 5-5" stroke="#2962ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										) : (
											<span style={{ display: "inline-block", width: 18, flexShrink: 0 }} />
										)}
										{t("vninvest.whale")}
									</button>
								) : null}
							</div>
						)}
					</div>
				</div>

				<div className="gc-topbar__right">
					{sourceNotice && (
						<span className="gc-offline-badge" role="status" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
							{sourceNotice}
							<button
								type="button"
								onClick={() => setSourceNotice(null)}
								title={t("release.dismiss")}
								aria-label={t("release.dismiss")}
								className="gc-topbar-btn"
								style={{ padding: "0 4px", minHeight: 18 }}
							>
								x
							</button>
						</span>
					)}
					{dataStatus === "live" && <span className="gc-live-badge">{t(isVNInvestSource ? "common.liveVNInvest" : "common.liveBinance")}</span>}
					{historyStatus === "backfilling" && <span className="gc-loading-badge">{t("library.backfillingHistory")}</span>}
					{isVNInvestSource && dataStatus === "live" && vniHistoryFloorLabel && historyStatus !== "backfilling" && (
						<span className="gc-history-floor-badge">{vniHistoryFloorLabel}</span>
					)}
					{dataStatus === "offline" && <span className="gc-offline-badge" title={dataError}>{t("common.offlineFallback")}</span>}
					{dataStatus === "loading" && <span className="gc-loading-badge">{t("common.loading")}</span>}
					{/* Compact datasource badge — click để mở Settings tab Nguồn dữ liệu */}
					<button
						type="button"
						className="gc-topbar-btn"
						onClick={() => openSettings("datasource")}
						title={t("settings.datasource")}
						style={{ fontWeight: activeSource === "vninvest" ? 700 : undefined, gap: 4 }}
					>
						{activeSource === "vninvest"
							? <><span style={{ color: "#4caf50", fontSize: 9 }}>●</span> {vniSymbol || "VNI"}</>
							: <><span style={{ color: "var(--gc-text-muted)", fontSize: 9 }}>●</span> Demo</>
						}
					</button>
					<div className="gc-topbar-sep" />
					<div className="gc-chart-type-wrap" role="group" aria-label={t("language.label")}>
						<button type="button" className={`gc-topbar-btn${language === "vi" ? " gc-topbar-btn--active" : ""}`} onClick={() => setLanguage("vi")}>
							{t("language.vi")}
						</button>
						<button type="button" className={`gc-topbar-btn${language === "en" ? " gc-topbar-btn--active" : ""}`} onClick={() => setLanguage("en")}>
							{t("language.en")}
						</button>
					</div>
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
					<div className="gc-topbar-sep" />
					{/* Profile icon + dropdown */}
					<div className="gc-chart-type-wrap" ref={profileMenuRef}>
						<button
							type="button"
							className={`gc-topbar-btn${showProfileMenu ? " gc-topbar-btn--active" : ""}`}
							onClick={() => setShowProfileMenu((v) => !v)}
							title={t("profile.menu")}
							aria-label={t("profile.menu")}
							aria-expanded={showProfileMenu}
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="12" cy="8" r="4" />
								<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
							</svg>
						</button>
						{showProfileMenu && (
							<div className="gc-chart-type-menu gc-chart-type-menu--right" style={{ minWidth: 160 }}>
								<button type="button" className="gc-chart-type-item" onClick={() => setShowProfileMenu(false)}>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ marginRight: 8, flexShrink: 0 }}>
										<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
									</svg>
									{t("profile.login")}
								</button>
								<button type="button" className="gc-chart-type-item" onClick={() => setShowProfileMenu(false)}>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ marginRight: 8, flexShrink: 0 }}>
										<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" />
									</svg>
									{t("profile.register")}
								</button>
								<div style={{ height: 1, background: "var(--gc-border, rgba(120,120,120,0.2))", margin: "4px 8px" }} />
								<button type="button" className="gc-chart-type-item gc-chart-type-item--accent" onClick={() => setShowProfileMenu(false)}>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ marginRight: 8, flexShrink: 0 }}>
										<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
									</svg>
									{t("profile.upgrade")}
								</button>
							</div>
						)}
					</div>
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
				<aside ref={toolbarRef} className="gc-tools" aria-label={t("library.drawingTools")}>
					{TOOL_GROUPS.map((group, groupIndex) => {
						const isOpen = openGroupId === group.id;
						const activeInGroup = group.tools.find((id) => id === activeTool) ?? null;
						const iconId = activeInGroup ?? group.tools[0];
						return (
							<Fragment key={group.id}>
								<div className="gc-tools-group-container">
									<button
										type="button"
										title={t(`tool.group.${group.id}`)}
										aria-expanded={isOpen}
										aria-haspopup="true"
										className={`gc-tool-btn gc-tool-btn--group${activeInGroup ? " gc-tool-btn--active" : ""}`}
										onClick={() => setOpenGroupId(isOpen ? null : group.id)}
									>
										<ToolIcon id={iconId} />
										<span className="gc-tools-chevron">▾</span>
									</button>
									{isOpen && (
										<div className="gc-tools-flyout" role="menu">
											{group.tools.map((toolId) => (
												<button
													key={toolId}
													type="button"
													role="menuitem"
													title={toolLabel(toolId)}
													aria-pressed={activeTool === toolId}
													className={`gc-tool-btn${activeTool === toolId ? " gc-tool-btn--active" : ""}`}
													onClick={() => { setActiveTool(toolId); setOpenGroupId(null); }}
												>
													<ToolIcon id={toolId} />
												</button>
											))}
										</div>
									)}
								</div>
								{groupIndex < TOOL_GROUPS.length - 1 && <span className="rsc-toolbar-divider" aria-hidden="true" />}
							</Fragment>
						);
					})}
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
					{activeTool !== "cursor" && activeTool !== "crosshair" && (
						<>
							<span className="rsc-toolbar-divider" aria-hidden="true" />
							<div className="gc-tools-group" title={t("drawing.magnetSensitivity")}>
								{(["weak", "normal", "strong"] as const).map((level) => (
									<button
										key={level}
										type="button"
										title={t(`drawing.magnet.${level}`)}
										aria-pressed={magnetSensitivity === level}
										className={`gc-tool-btn gc-tool-btn--magnet${magnetSensitivity === level ? " gc-tool-btn--active" : ""}`}
										onClick={() => setMagnetSensitivity(level)}
									>
										{MAGNET_TOLERANCE[level]}
									</button>
								))}
							</div>
						</>
					)}
				</aside>

				<section className="gc-chart-area">
					<div className="gc-ohlc-strip">
						<span className="gc-ohlc-pair">{isVNInvestSource ? vniSymbol : selectedSymbol} <span className="gc-ohlc-tf">· {isVNInvestSource ? vniTimeframe : timeframe}</span></span>
						{dataStatus !== "loading" && ohlcBar ? (
							<>
								<span className="gc-ohlc-item">O <b>{priceFormat(ohlcBar.open)}</b></span>
								<span className="gc-ohlc-item">H <b className="gc-col-up">{priceFormat(ohlcBar.high)}</b></span>
								<span className="gc-ohlc-item">L <b className="gc-col-dn">{priceFormat(ohlcBar.low)}</b></span>
								<span className="gc-ohlc-item">C <b className={priceIsUp ? "gc-col-up" : "gc-col-dn"}>{priceFormat(ohlcBar.close)}</b></span>
								<span className="gc-ohlc-item gc-ohlc-vol">{t("library.volumeShort")} <b>{volumeFormat(ohlcBar.volume)}</b></span>
								<span className="gc-ohlc-item gc-ohlc-bars">{t("library.pairBars", { count: visibleBarCount })}</span>
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
						) : (
							<VNBrokerChart
								adapter={chartAdapter}
								data={widgetData}
								panes={paneState.panes}
								locale={language}
								messages={widgetMessages}
								theme={theme}
								showNonTradingDays={isStockContext ? showNonTradingDays : true}
								xExtents={xExtents}
								measurementEnabled={activeTool === "crosshair"}
								onClick={handlePaperTradeClick}
								onContextMenu={handleReplayContextMenu}
								onCurrentItemChange={setHoveredItem}
								onVisibleDomainChange={handleVisibleDomainChange}
								onVisibleRangeChange={handleVisibleRangeChange}
							>
								<DrawingPriceLabels drawing={selectedDrawing} displayFormat={priceFormat} enabled={showDrawingPriceMarkers} highlighted={selectedDrawing != null} />
								<DrawingLayer
									activeTool={activeTool}
									interaction={drawingInteraction}
									magnetSensitivity={magnetSensitivity}
									onToolUsed={handleDrawingToolUsed}
									onContextMenu={handleDrawingContextMenu}
								/>
							</VNBrokerChart>
						)}

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

						{drawingContextMenu && drawingContextMenuDrawing && (
							<DrawingContextMenu
								ariaLabel={t("drawing.contextMenuTitle")}
								title={t("drawing.contextMenuTitle")}
								isDark={isDark}
								position={{ x: drawingContextMenu.x, y: drawingContextMenu.y }}
								onClose={closeDrawingContextMenu}
								items={[
									{ key: "copy", label: t("drawing.copy"), onSelect: copySelectedDrawing },
									{ key: "paste", label: t("drawing.paste"), onSelect: pasteCopiedDrawing, disabled: drawingClipboardRef.current === null },
									{ key: "clone", label: t("drawing.clone"), onSelect: cloneSelectedDrawing },
									{
										key: "lock",
										label: t(drawingContextMenuDrawing.locked ? "drawing.unlock" : "drawing.lock"),
										onSelect: toggleSelectedLock,
									},
									{
										key: "visibility",
										label: t(drawingContextMenuDrawing.visible === false ? "drawing.show" : "drawing.hide"),
										onSelect: toggleSelectedVisible,
									},
									{ key: "front", label: t("drawing.bringToFront"), onSelect: bringSelectedToFront },
									{ key: "back", label: t("drawing.sendToBack"), onSelect: sendSelectedToBack },
									...(drawingContextMenuDrawing.groupId
										? [
												{
													key: "selectGroup",
													label: t("drawing.selectGroup"),
													onSelect: () => {
														drawingInteraction.selectGroup(drawingContextMenuDrawing.groupId!);
														closeDrawingContextMenu();
													},
												},
												{
													key: "deleteGroup",
													label: t("drawing.deleteGroup"),
													onSelect: () => {
														drawingInteraction.deleteGroup(drawingContextMenuDrawing.groupId!);
														closeDrawingContextMenu();
													},
													danger: true,
												},
											]
										: []),
									{ key: "delete", label: t("drawing.delete"), onSelect: deleteSelected, danger: true },
								]}
							/>
						)}

						{activeSource === "vninvest" && showWhaleDialog ? (
							<div className="gc-whale-dialog" role="dialog" aria-label={t("vninvest.whale")}> 
								<button
									type="button"
									className="gc-whale-dialog__close"
									onClick={() => setShowWhaleDialog(false)}
									aria-label={t("drawing.close")}
									title={t("drawing.close")}
								>
									×
								</button>
								<WhalePanel
									data={whaleData}
									isLoading={whaleLoading}
									symbol={vniSymbol}
								/>
							</div>
						) : null}

						<DrawingInspector
							drawing={selectedDrawing}
							labels={drawingInspectorLabels}
							selectionCount={selectedDrawingCount}
							selectionSummary={selectedDrawingCount > 1 ? t("drawing.selectedCount", { count: selectedDrawingCount }) : undefined}
							selectionLocked={selectedDrawingCount > 1 ? selectedAllLocked : undefined}
							selectionVisible={selectedDrawingCount > 1 ? selectedAllVisible : undefined}
							selectionContainsLocked={selectedDrawingCount > 1 ? selectedAnyLocked : undefined}
							textEditor={selectedDrawing?.type === "text" ? {
								active: isEditingText,
								value: drawingTextDraft,
								labels: drawingTextEditorLabels,
								onChange: setDrawingTextDraft,
								onStartEdit: handleStartTextEdit,
								onCommit: handleCommitTextEdit,
								onCancel: handleCancelTextEdit,
							} : undefined}
							position={drawingInspectorPosition}
							onUpdate={updateSelectedDrawing}
							onDelete={deleteSelected}
							onClone={cloneSelectedDrawing}
							onToggleLock={toggleSelectedLock}
							onToggleVisible={toggleSelectedVisible}
							onBringToFront={bringSelectedToFront}
							onSendToBack={sendSelectedToBack}
							onClose={handleCloseDrawingInspector}
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
						{paperTradePanelVisible && (
							<div className="gc-paper-trade-panel">
								<div className="gc-paper-trade-panel__header">
									<strong>{t("paperTrading.title")}</strong>
									<div className="gc-paper-trade-panel__header-actions">
										{replayFinished && <span className="gc-paper-trade-panel__chip">{t("paperTrading.finalized")}</span>}
										<button type="button" className="gc-paper-trade-panel__reset" onClick={handlePaperTradeReset}>
											{t("paperTrading.reset")}
										</button>
									</div>
								</div>
								<div className="gc-paper-trade-panel__hint">{t("paperTrading.hint")}</div>
								<div className="gc-paper-trade-panel__stats">
									<div className="gc-paper-trade-panel__stat">
										<span className="gc-paper-trade-panel__label">{t("paperTrading.total")}</span>
										<strong className="gc-paper-trade-panel__value">{paperTradeHistory.length}</strong>
									</div>
									<div className="gc-paper-trade-panel__stat">
										<span className="gc-paper-trade-panel__label">{t("paperTrading.wins")}</span>
										<strong className="gc-paper-trade-panel__value gc-col-up">{paperTradeSummary.wins}</strong>
									</div>
									<div className="gc-paper-trade-panel__stat">
										<span className="gc-paper-trade-panel__label">{t("paperTrading.losses")}</span>
										<strong className="gc-paper-trade-panel__value gc-col-dn">{paperTradeSummary.losses}</strong>
									</div>
									<div className="gc-paper-trade-panel__stat">
										<span className="gc-paper-trade-panel__label">{t("paperTrading.winRate")}</span>
										<strong className="gc-paper-trade-panel__value">{PERCENT_FORMAT(paperTradeSummary.winRate)}</strong>
									</div>
									<div className="gc-paper-trade-panel__stat">
										<span className="gc-paper-trade-panel__label">{t("paperTrading.realized")}</span>
										<strong className={`gc-paper-trade-panel__value${paperTradeRealizedPnl >= 0 ? " gc-col-up" : " gc-col-dn"}`}>
											{formatSignedPrice(paperTradeRealizedPnl)}
										</strong>
									</div>
									<div className="gc-paper-trade-panel__stat">
										<span className="gc-paper-trade-panel__label">{t("paperTrading.avgPnl")}</span>
										<strong className={`gc-paper-trade-panel__value${paperTradeSummary.averagePnl >= 0 ? " gc-col-up" : " gc-col-dn"}`}>
											{formatSignedPrice(paperTradeSummary.averagePnl)}
										</strong>
									</div>
									<div className="gc-paper-trade-panel__stat">
										<span className="gc-paper-trade-panel__label">{t("paperTrading.unrealized")}</span>
										<strong className={`gc-paper-trade-panel__value${paperTradeUnrealizedPnl >= 0 ? " gc-col-up" : " gc-col-dn"}`}>
											{formatSignedPrice(paperTradeUnrealizedPnl)}
										</strong>
									</div>
									<div className="gc-paper-trade-panel__stat">
										<span className="gc-paper-trade-panel__label">{t("paperTrading.avgBarsHeld")}</span>
										<strong className="gc-paper-trade-panel__value">
											{formatBarsHeld(Math.round(paperTradeSummary.averageBarsHeld), t("paperTrading.barsUnit"))}
										</strong>
									</div>
									<div className="gc-paper-trade-panel__stat">
										<span className="gc-paper-trade-panel__label">{t("paperTrading.bestTrade")}</span>
										<strong className="gc-paper-trade-panel__value gc-col-up">
											{paperTradeSummary.bestTrade
												? `${formatSignedPrice(paperTradeSummary.bestTrade.pnl)} · ${formatBarsHeld(paperTradeSummary.bestTrade.barsHeld, t("paperTrading.barsUnit"))}`
												: "—"}
										</strong>
									</div>
									<div className="gc-paper-trade-panel__stat">
										<span className="gc-paper-trade-panel__label">{t("paperTrading.worstTrade")}</span>
										<strong className="gc-paper-trade-panel__value gc-col-dn">
											{paperTradeSummary.worstTrade
												? `${formatSignedPrice(paperTradeSummary.worstTrade.pnl)} · ${formatBarsHeld(paperTradeSummary.worstTrade.barsHeld, t("paperTrading.barsUnit"))}`
												: "—"}
										</strong>
									</div>
								</div>
								{paperTradeReportVisible && (
									<div className="gc-paper-trade-panel__report">
										<div className="gc-paper-trade-panel__section-title">{t("paperTrading.report")}</div>
										<div className="gc-paper-trade-panel__journal-list">
											{paperTradeJournal.length > 0 ? paperTradeJournal.map((trade, index) => (
												<div
													key={`${trade.entryIndex}-${trade.exitIndex}-${index}`}
													className={`gc-paper-trade-panel__journal-item${trade.pnl >= 0 ? " gc-paper-trade-panel__journal-item--positive" : " gc-paper-trade-panel__journal-item--negative"}`}
												>
													<div className="gc-paper-trade-panel__journal-top">
														<strong>#{paperTradeJournal.length - index}</strong>
														<span className={trade.pnl >= 0 ? "gc-col-up" : "gc-col-dn"}>{formatSignedPrice(trade.pnl)}</span>
													</div>
													<div className="gc-paper-trade-panel__journal-meta">
														<span>{dateFormat(normalizeDate(trade.entryDate))}</span>
														<span>→</span>
														<span>{dateFormat(normalizeDate(trade.exitDate))}</span>
													</div>
													<div className="gc-paper-trade-panel__journal-meta">
														<span>{priceFormat(trade.entryPrice)} → {priceFormat(trade.exitPrice)}</span>
														<span>{formatBarsHeld(trade.barsHeld, t("paperTrading.barsUnit"))}</span>
													</div>
												</div>
											)) : (
												<div className="gc-paper-trade-panel__journal-empty">{t("paperTrading.empty")}</div>
											)}
										</div>
									</div>
								)}
								{paperTradePosition ? (
									<div className="gc-paper-trade-panel__position">
										<span className="gc-paper-trade-panel__position-label">{t("paperTrading.position")}</span>
										<strong>{t("paperTrading.open")}</strong>
										<div className="gc-paper-trade-panel__position-meta">
											<span>{t("paperTrading.entry")}</span>
											<span>{dateFormat(normalizeDate(paperTradePosition.entryDate))}</span>
											<span>{priceFormat(paperTradePosition.entryPrice)}</span>
										</div>
									</div>
								) : paperTradeHistory.length > 0 ? (
									<div className="gc-paper-trade-panel__position gc-paper-trade-panel__position--idle">
										{t("paperTrading.closed")}
									</div>
								) : (
									<div className="gc-paper-trade-panel__position gc-paper-trade-panel__position--idle">
										{t("paperTrading.empty")}
									</div>
								)}
							</div>
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
							showDrawingPriceMarkers={showDrawingPriceMarkers}
							onShowDrawingPriceMarkersChange={setShowDrawingPriceMarkers}
						onAddPane={handleAddPane}
						onReset={handleResetSettings}
						isDark={isDark}
						toggleTheme={toggleTheme}
						onClose={closeSettings}
						dataAdapterName={dataAdapterName}
						onDataAdapterChange={handleDataAdapterChange}
						activeSource={activeSource}
						onSourceChange={handleSourceChange}
						isStockContext={isStockContext}
						showNonTradingDays={showNonTradingDays}
						onShowNonTradingDaysChange={setShowNonTradingDays}
						hasPAT={vniHasPAT}
						onPATModalOpen={() => { setPatModalOpen(true); }}
						dataSource={currentDataSource}
						selectedSymbol={vniSymbol}
						onSymbolChange={setVniSymbol}
						selectedTimeframe={vniTimeframe}
						onTimeframeChange={setVniTimeframe}
						selectedDays={vniDays}
						onDaysChange={setVniDays}
						onLoadChart={handleLoadVNIChart}
						isVniLoading={vniLoading}
						maxVisibleBars={maxVisibleBars}
						onMaxVisibleBarsChange={setMaxVisibleBars}
					/>
				) : null}
			</div>

			<footer className="gc-bottombar">
				{CHART_RANGES.map((range) => (
					<button
						key={range}
						type="button"
						className={`gc-bottom-btn${chartRange === range ? " gc-bottom-btn--active" : ""}`}
						aria-pressed={chartRange === range}
						onClick={() => handleChartRangeChange(range)}
					>
						{t(CHART_RANGE_LABEL_KEYS[range])}
					</button>
				))}
				<div className="gc-bottombar-sep" />
				<button type="button" className="gc-bottom-btn">{t("common.script")}</button>
				<button type="button" className="gc-bottom-btn">{t("common.alert")}</button>
				<button type="button" className="gc-bottom-btn">{t("common.trade")}</button>
				<div className="gc-grow" />
				<BrandFooter
					version={releaseNotice.currentVersion}
					releaseStatus={releaseNotice.status}
					hasUpdate={releaseNotice.hasUpdate}
					onOpenAbout={openAbout}
				/>
				<button type="button" className="gc-publish-btn">{t("common.publish")}</button>
			</footer>
			</div>

			<AboutDialog
				open={aboutOpen}
				currentVersion={releaseNotice.currentVersion}
				latestRelease={releaseNotice.latestRelease}
				releaseStatus={releaseNotice.status}
				onClose={closeAbout}
				onCheckAgain={releaseNotice.refresh}
				onDismissCurrentRelease={releaseNotice.dismissCurrentRelease}
			/>

			{patModalOpen && (
				<PATTokenModal
					isOpen={patModalOpen}
					onClose={() => setPatModalOpen(false)}
					onPATSaved={handlePATSaved}
					currentToken={vniHasPAT ? "***" : undefined}
				/>
			)}

			{vniError && (
				<div style={{
					position: "fixed",
					bottom: 20,
					right: 20,
					maxWidth: 300,
					padding: "12px 16px",
					background: "var(--gc-danger, #f44336)",
					color: "#fff",
					borderRadius: 4,
					fontSize: 13,
					zIndex: 1000,
				}}>
					{vniError}
				</div>
			)}
		</DemoPageShell>
	);
}
