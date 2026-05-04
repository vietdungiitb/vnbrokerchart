import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { format } from "d3-format";
import { scaleTime } from "d3-scale";
import { timeFormat } from "d3-time-format";

import {
	MockAdapter,
	type OHLCVBar,
	PaneSplitter,
	createDraftFromTool,
	createDrawingHistory,
	createDrawingTool,
	deserializeDrawings,
	getIndicator,
	historyReducer,
	listDrawingTools,
	serializeDrawings,
	usePaneManager,
	version,
} from "../index";
import ChartCanvas from "../lib/ChartCanvas";
import Chart from "../lib/Chart";
import type { IndicatorConfig } from "../lib/types/pane";
import { XAxis, YAxis } from "../lib/axes";
import { CrossHairCursor, MouseCoordinateX, MouseCoordinateY } from "../lib/coordinates";
import AreaSeries from "../lib/series/AreaSeries";
import BarSeries from "../lib/series/BarSeries";
import CandlestickSeries from "../lib/series/CandlestickSeries";
import LineSeries from "../lib/series/LineSeries";
import MACDSeries from "../lib/series/MACDSeries";
import OHLCSeries from "../lib/series/OHLCSeries";
import RSISeries from "../lib/series/RSISeries";
import { OHLCTooltip } from "../lib/tooltip";
import { heikinAshi } from "../lib/calculator";
import { fetchLiveDemoData, getOfflineDemoData, type DemoDatum } from "./demoData";
import "./demo.css";

const priceFormat = format(".2f");
const volumeFormat = format(".3s");
const dateFormat = timeFormat("%d/%m/%Y %H:%M");

const TIMEFRAMES = ["1m", "3m", "5m", "15m", "30m", "1h", "4h", "1D", "1W"] as const;
type Timeframe = typeof TIMEFRAMES[number];

const CHART_TYPES = [
	{ id: "candlestick" as const, label: "Candlestick" },
	{ id: "hollow"      as const, label: "Hollow Candle" },
	{ id: "ohlc"        as const, label: "OHLC Bar" },
	{ id: "heikinashi"  as const, label: "Heikin Ashi" },
	{ id: "line"        as const, label: "Line" },
	{ id: "area"        as const, label: "Area" },
	{ id: "bar"         as const, label: "Bar Chart" },
];
type ChartTypeId = "candlestick" | "hollow" | "ohlc" | "heikinashi" | "line" | "area" | "bar";

const INDICATOR_OPTIONS = ["EMA", "SMA", "RSI", "MACD", "BOLLINGER", "VOLUME", "CVD"] as const;
const DRAWING_TOOLS = ["trendLine", "hLine", "vLine", "fibonacci", "channel", "text"] as const;
type DrawingToolName = typeof DRAWING_TOOLS[number];
type SidePanelTab = "indicators" | "drawings" | "adapter" | "panes";

const TOOL_DEFS: { id: string; label: string }[] = [
	{ id: "cursor",    label: "Cursor" },
	{ id: "crosshair", label: "Crosshair" },
	{ id: "trendLine", label: "Trend Line" },
	{ id: "hLine",     label: "Horiz. Line" },
	{ id: "vLine",     label: "Vert. Line" },
	{ id: "fibonacci", label: "Fibonacci" },
	{ id: "channel",   label: "Channel" },
	{ id: "text",      label: "Text Note" },
];

type AdapterProbe = {
	barsFetched: number;
	barTicks: number;
	tradeTicks: number;
	orderbookTicks: number;
	spreadBps: string;
	status: "idle" | "running" | "done";
};

function normalizeDate(value: Date | number) {
	return value instanceof Date ? value : new Date(value);
}

function chartDomain(data: DemoDatum[]) {
	const end = data.length - 1;
	const start = Math.max(0, end - 140);
	return [normalizeDate(data[start].date), normalizeDate(data[end].date)] as [Date, Date];
}

function paneTemplate(label: string, heightPx: number, indicatorNames: readonly string[]) {
	const indicators: IndicatorConfig[] = indicatorNames.map((name) => ({
		name,
		visible: true,
		yAxis: "right",
	}));
	return { label, heightPx, minHeightPx: 90, indicators };
}

function summarizeIndicator(value: unknown) {
	if (Array.isArray(value)) {
		if (value.length === 0) return "empty";
		const lastValue = value[value.length - 1];
		if (typeof lastValue === "number") return priceFormat(lastValue);
		if (lastValue && typeof lastValue === "object") return JSON.stringify(lastValue).slice(0, 36);
		return String(lastValue);
	}
	return String(value ?? "n/a");
}

// ── SVG Tool Icons ───────────────────────────────────────────────────────────
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

// Price series switcher — renders the correct series for the chosen chart type
function PriceSeries({ chartType }: { chartType: ChartTypeId }) {
	const up = "#089981";
	const dn = "#f23645";
	switch (chartType) {
		case "ohlc":
			return (
				<OHLCSeries
					stroke={(d: DemoDatum) => (d.close >= d.open ? up : dn)}
				/>
			);
		case "line":
			return <LineSeries yAccessor={(d: DemoDatum) => d.close} stroke="#2962ff" strokeWidth={1.5} />;
		case "area":
			return (
				<AreaSeries
					yAccessor={(d: DemoDatum) => d.close}
					stroke="#2962ff"
					fill="#2962ff"
					strokeWidth={1.5}
				/>
			);
		case "bar":
			return (
				<BarSeries
					yAccessor={(d: DemoDatum) => d.close}
					fill={(d: DemoDatum) => (d.close >= d.open ? up : dn)}
				/>
			);
		case "hollow":
			return (
				<CandlestickSeries
					wickStroke={(d: DemoDatum) => (d.close >= d.open ? up : dn)}
					fill={(d: DemoDatum) => (d.close >= d.open ? "transparent" : dn)}
					stroke={(d: DemoDatum) => (d.close >= d.open ? up : dn)}
				/>
			);
		default: // candlestick | heikinashi
			return (
				<CandlestickSeries
					wickStroke={(d: DemoDatum) => (d.close >= d.open ? up : dn)}
					fill={(d: DemoDatum) => (d.close >= d.open ? up : dn)}
				/>
			);
	}
}

export default function LibraryShowcaseDemo() {
	const shellRef = useRef<HTMLDivElement | null>(null);
	const chartMenuRef = useRef<HTMLDivElement | null>(null);
	const [chartWidth, setChartWidth] = useState(0);
	const [chartHeight, setChartHeight] = useState(0);
	const [timeframe, setTimeframe] = useState<Timeframe>("1h");
	const [chartType, setChartType] = useState<ChartTypeId>("candlestick");
	const [showChartMenu, setShowChartMenu] = useState(false);
	const [activeTool, setActiveTool] = useState<string>("cursor");
	const [sidePanelTab, setSidePanelTab] = useState<SidePanelTab>("indicators");
	const [selectedPaneId, setSelectedPaneId] = useState("");

	// Live Binance data state
	const [liveData, setLiveData] = useState<DemoDatum[]>([]);
	const [dataStatus, setDataStatus] = useState<"loading" | "live" | "offline" | "error">("loading");
	const [dataError, setDataError] = useState<string>("");

	const [adapterProbe, setAdapterProbe] = useState<AdapterProbe>({
		barsFetched: 0,
		barTicks: 0,
		tradeTicks: 0,
		orderbookTicks: 0,
		spreadBps: "0.00",
		status: "idle",
	});
	const [drawingState, setDrawingState] = useState(() => createDrawingHistory([]));

	const paneManager = usePaneManager([
		paneTemplate("Price", 170, ["EMA", "BOLLINGER"]),
		paneTemplate("Volume", 110, ["VOLUME"]),
		paneTemplate("Momentum", 120, ["RSI", "MACD"]),
	]);

	// Fetch live Binance data on mount and on timeframe change
	useEffect(() => {
		const abortController = new AbortController();
		setDataStatus("loading");
		setDataError("");

		fetchLiveDemoData({ interval: timeframe, limit: 300, signal: abortController.signal })
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
				setLiveData(getOfflineDemoData());
				setDataStatus("offline");
			});

		return () => abortController.abort();
	}, [timeframe]);

	const data = useMemo(
		() => (liveData.length > 0 ? liveData : getOfflineDemoData()),
		[liveData],
	);

	// Heikin Ashi transform — reuse base indicator fields, swap OHLC only
	const plotData = useMemo<DemoDatum[]>(() => {
		if (chartType !== "heikinashi" || data.length === 0) return data;
		const haCalc = heikinAshi();
		const transformed = haCalc(data as any[]) as any[];
		return transformed.map((bar: any, i: number) => ({
			...data[i],
			open:  bar.open,
			high:  bar.high,
			low:   bar.low,
			close: bar.close,
		}));
	}, [data, chartType]);

	const xExtents = useMemo(() => chartDomain(plotData), [plotData]);
	const lastBar = plotData[plotData.length - 1];

	const selectedPane = useMemo(
		() => paneManager.panes.find((pane) => pane.id === selectedPaneId) ?? paneManager.panes[0],
		[paneManager.panes, selectedPaneId],
	);

	useEffect(() => {
		if (!selectedPane && paneManager.panes.length > 0) {
			setSelectedPaneId(paneManager.panes[0].id);
		}
	}, [paneManager.panes, selectedPane]);

	useEffect(() => {
		const node = shellRef.current;
		if (!node) return;
		const update = () => {
			const rect = node.getBoundingClientRect();
			setChartWidth(Math.floor(rect.width));
			setChartHeight(Math.floor(rect.height));
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(node);
		window.addEventListener("resize", update);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", update);
		};
	}, []);

	useEffect(() => {
		const adapter = new MockAdapter({ intervalMs: 180 });
		const from = normalizeDate(data[Math.max(0, data.length - 100)]?.date ?? new Date(Date.now() - 86_400_000 * 7));
		const to = normalizeDate(data[data.length - 1]?.date ?? new Date());
		let stopBars: (() => void) | undefined;
		let stopTrades: (() => void) | undefined;
		let stopOrderbook: (() => void) | undefined;
		let timerId: number | undefined;
		let disposed = false;

		setAdapterProbe((prev) => ({ ...prev, status: "running", barTicks: 0, tradeTicks: 0, orderbookTicks: 0, spreadBps: "0.00" }));

		adapter.fetchBars("BTCUSD", timeframe, from, to).then((bars) => {
			if (disposed) return;
			setAdapterProbe((prev) => ({ ...prev, barsFetched: bars.length }));

			stopBars = adapter.subscribeToBar("BTCUSD", timeframe, () => {
				setAdapterProbe((prev) => ({ ...prev, barTicks: prev.barTicks + 1 }));
			});
			stopTrades = adapter.subscribeToTrades("BTCUSD", () => {
				setAdapterProbe((prev) => ({ ...prev, tradeTicks: prev.tradeTicks + 1 }));
			});
			stopOrderbook = adapter.subscribeToOrderbook("BTCUSD", (snapshot) => {
				const bestBid = snapshot.bids[0]?.price ?? 0;
				const bestAsk = snapshot.asks[0]?.price ?? 0;
				const mid = (bestAsk + bestBid) / 2;
				const spreadBps = mid > 0 ? ((bestAsk - bestBid) / mid) * 10000 : 0;
				setAdapterProbe((prev) => ({
					...prev,
					orderbookTicks: prev.orderbookTicks + 1,
					spreadBps: spreadBps.toFixed(2),
				}));
			});

			timerId = window.setTimeout(() => {
				stopBars?.();
				stopTrades?.();
				stopOrderbook?.();
				setAdapterProbe((prev) => ({ ...prev, status: "done" }));
			}, 1800);
		}).catch(() => {
			if (!disposed) setAdapterProbe((prev) => ({ ...prev, status: "done" }));
		});

		return () => {
			disposed = true;
			if (timerId !== undefined) window.clearTimeout(timerId);
			stopBars?.();
			stopTrades?.();
			stopOrderbook?.();
		};
	}, [data, timeframe]);

	const indicatorProbe = useMemo(() => {
		const sample = data.slice(Math.max(0, data.length - 90));
		const input: OHLCVBar[] = sample.map((datum, index) => ({
			date: normalizeDate(datum.date),
			open: datum.open,
			high: datum.high,
			low: datum.low,
			close: datum.close,
			volume: datum.volume,
			buyVolume: datum.buyVolume,
			sellVolume: datum.sellVolume,
			openInterest: datum.openInterest,
			index,
			dataIndex: index,
		}));
		return INDICATOR_OPTIONS.map((name) => {
			const indicator = getIndicator(name);
			if (!indicator) return { name, status: "missing", sample: "n/a" };
			return { name, status: "ok", sample: summarizeIndicator(indicator.compute(input)) };
		});
	}, [data]);

	const drawingProbe = useMemo(() => {
		const serialized = serializeDrawings(drawingState.present);
		return {
			toolNames: listDrawingTools().map((tool) => tool.name),
			count: drawingState.present.length,
			past: drawingState.past.length,
			future: drawingState.future.length,
			serialized,
		};
	}, [drawingState]);

	const chartReady = chartWidth > 0 && chartHeight > 0 && plotData.length > 0;

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
	const ratio = window.devicePixelRatio || 1;
	const priceIsUp = (lastBar?.close ?? 0) >= (lastBar?.open ?? 0);

	// Dynamic pane heights based on actual container size
	const MARGIN_V = 36; // top(8) + bottom(28)
	const volumeH  = Math.max(60,  Math.round(chartHeight * 0.15));
	const momentumH = Math.max(70, Math.round(chartHeight * 0.20));
	const priceH   = Math.max(80,  chartHeight - volumeH - momentumH - MARGIN_V);

	const toggleIndicator = (name: string) => {
		if (!selectedPane) return;
		const hasIt = selectedPane.indicators.some((indicator) => indicator.name === name);
		if (hasIt) {
			paneManager.removeIndicator(selectedPane.id, name);
		} else {
			paneManager.addIndicator(selectedPane.id, { name, yAxis: "right", visible: true });
		}
	};

	const addPane = () => {
		const id = paneManager.addPane(paneTemplate(`Pane ${paneManager.panes.length + 1}`, 105, ["EMA"]));
		setSelectedPaneId(id);
	};
	const removePane = () => {
		if (!selectedPane || paneManager.panes.length <= 1) return;
		paneManager.removePane(selectedPane.id);
	};

	const addDrawing = (tool: DrawingToolName) => {
		const startX = 24 + drawingState.present.length * 12;
		const draft = createDraftFromTool(tool, { x: startX, y: 42 });
		const completed = createDrawingTool(tool).updateDraft(draft, { x: startX + 120, y: 84 });
		setDrawingState((prev) => historyReducer(prev, { type: "PUSH", drawing: completed }));
	};
	const undoDrawing   = () => setDrawingState((prev) => historyReducer(prev, { type: "UNDO" }));
	const redoDrawing   = () => setDrawingState((prev) => historyReducer(prev, { type: "REDO" }));
	const clearDrawing  = () => setDrawingState((prev) => historyReducer(prev, { type: "CLEAR" }));
	const restoreDrawing = () => {
		const restored = deserializeDrawings(drawingProbe.serialized);
		setDrawingState((prev) => historyReducer(prev, { type: "REPLACE", drawings: restored }));
	};

	return (
		<div className="gc-terminal">

			{/* ─── TOP BAR ────────────────────────────────────────────────── */}
			<header className="gc-topbar">
				<div className="gc-topbar__left">
					<div className="gc-logo" aria-label="BT Charts">BT</div>

					<div className="gc-symbol-block">
						<span className="gc-symbol-name">BTCUSD</span>
						<span className="gc-symbol-exchange">BYBIT</span>
					</div>

					<div className="gc-topbar-sep" />

					<nav className="gc-tf-chips" aria-label="Khung thời gian">
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
							{CHART_TYPES.find((ct) => ct.id === chartType)?.label ?? "Candlestick"}
							<svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 4 }}>
								<path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
							</svg>
						</button>

						{showChartMenu && (
							<div className="gc-chart-type-menu">
								{CHART_TYPES.map(({ id, label }) => (
									<button
										key={id}
										type="button"
										className={`gc-chart-type-item${chartType === id ? " gc-chart-type-item--active" : ""}`}
										onClick={() => {
											setChartType(id);
											setShowChartMenu(false);
										}}
									>
										{chartType === id && (
											<svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: 6 }}>
												<path d="M2 6l3 3 5-5" stroke="#2962ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										)}
										{label}
									</button>
								))}
							</div>
						)}
					</div>
					<button type="button" className="gc-topbar-btn">Compare</button>
					<button type="button" className="gc-topbar-btn">Study</button>
					<button type="button" className="gc-topbar-btn">Replay</button>
				</div>

				<div className="gc-topbar__right">
					{dataStatus === "live" && (
						<span className="gc-live-badge">● LIVE · Binance</span>
					)}
					{dataStatus === "offline" && (
						<span className="gc-offline-badge" title={dataError}>⚠ Offline fallback</span>
					)}
					{dataStatus === "loading" && (
						<span className="gc-loading-badge">↻ Loading…</span>
					)}
					<span className="gc-version-text">v{version}</span>
					<div className="gc-topbar-sep" />
					<button type="button" className="gc-upgrade-btn">Upgrade</button>
				</div>
			</header>

			{/* ─── MAIN ───────────────────────────────────────────────────── */}
			<div className="gc-main">

				{/* Left toolbar */}
				<aside className="gc-tools" aria-label="Drawing tools">
					{TOOL_DEFS.map(({ id, label }) => (
						<button
							key={id}
							type="button"
							title={label}
							aria-pressed={activeTool === id}
							className={`gc-tool-btn${activeTool === id ? " gc-tool-btn--active" : ""}`}
							onClick={() => setActiveTool(id)}
						>
							<ToolIcon id={id} />
						</button>
					))}

					<div className="gc-tools-gap" />

					<button
						type="button"
						title="Settings"
						className="gc-tool-btn"
					>
						<ToolIcon id="settings" />
					</button>
				</aside>

				{/* Chart area */}
				<section className="gc-chart-area">
					{/* OHLC info strip */}
					<div className="gc-ohlc-strip">
						<span className="gc-ohlc-pair">BINANCE:BTCUSDT <span className="gc-ohlc-tf">· {timeframe}</span></span>
						{dataStatus !== "loading" && lastBar ? (
							<>
								<span className="gc-ohlc-item">O <b>{priceFormat(lastBar.open)}</b></span>
								<span className="gc-ohlc-item">H <b className="gc-col-up">{priceFormat(lastBar.high)}</b></span>
								<span className="gc-ohlc-item">L <b className="gc-col-dn">{priceFormat(lastBar.low)}</b></span>
								<span className="gc-ohlc-item">C <b className={priceIsUp ? "gc-col-up" : "gc-col-dn"}>{priceFormat(lastBar.close)}</b></span>
								<span className="gc-ohlc-item gc-ohlc-vol">Vol <b>{volumeFormat(lastBar.volume)}</b></span>
								<span className="gc-ohlc-item gc-ohlc-bars">{data.length} bars</span>
							</>
						) : (
							<span className="gc-ohlc-loading">Đang tải dữ liệu Binance…</span>
						)}
					</div>

					{/* Canvas */}
					<div className="gc-chart-shell" ref={shellRef}>
						{dataStatus === "loading" ? (
							<div className="gc-chart-placeholder gc-chart-loading">
								<div className="gc-spinner" />
								<span>Đang tải dữ liệu thật từ Binance…</span>
							</div>
						) : chartReady ? (
							<ChartCanvas
								height={chartHeight}
								width={chartWidth}
								margin={{ left: 60, right: 68, top: 8, bottom: 28 }}
								type="hybrid"
								seriesName={`terminal-demo-${chartType}`}
								data={plotData}
								xScale={scaleTime()}
								xAccessor={(datum: DemoDatum) => datum.date}
								displayXAccessor={(datum: DemoDatum) => datum.date}
								xExtents={xExtents}
								ratio={ratio}
								mouseMoveEvent
								zoomEvent
								panEvent
								useCrossHairStyleCursor
							>
								<Chart
									id={1}
									height={priceH}
									yExtents={(datum: DemoDatum) => [
										datum.high, datum.low,
										datum.ema20, datum.ema50,
										datum.bollingerBand?.top,
										datum.bollingerBand?.bottom,
									]}
								>
									<XAxis axisAt="bottom" orient="bottom" />
									<YAxis axisAt="right" orient="right" ticks={6} />
									<PriceSeries chartType={chartType} />
									<LineSeries yAccessor={(datum: DemoDatum) => datum.ema20} stroke="#2d9cdb" strokeWidth={1.5} />
									<LineSeries yAccessor={(datum: DemoDatum) => datum.ema50} stroke="#f2994a" strokeWidth={1.5} />
									<OHLCTooltip
										xDisplayFormat={dateFormat}
										volumeFormat={volumeFormat}
										displayTexts={{ d: "Ngày", o: "Mở", h: "Cao", l: "Thấp", c: "Đóng", v: "KL", na: "n/a" }}
									/>
									<MouseCoordinateX displayFormat={dateFormat} />
									<MouseCoordinateY rectWidth={64} displayFormat={priceFormat} />
								</Chart>

								<Chart
									id={2}
									height={volumeH}
									origin={(_w: number, h: number) => [0, h - volumeH - momentumH]}
									yExtents={(datum: DemoDatum) => datum.volume}
								>
									<YAxis axisAt="right" orient="right" ticks={3} tickFormat={volumeFormat} />
									<BarSeries
										yAccessor={(datum: DemoDatum) => datum.volume}
										fill={(datum: DemoDatum) => (datum.close >= datum.open ? "#089981" : "#f23645")}
									/>
								</Chart>

								<Chart
									id={3}
									height={momentumH}
									origin={(_w: number, h: number) => [0, h - momentumH]}
									yExtents={(datum: DemoDatum) => [datum.macd?.macd, datum.macd?.signal, datum.macd?.divergence, datum.rsi]}
								>
									<YAxis axisAt="right" orient="right" ticks={3} />
									<RSISeries yAccessor={(datum: DemoDatum) => datum.rsi} />
									<MACDSeries yAccessor={(datum: DemoDatum) => datum.macd} />
								</Chart>

								<CrossHairCursor />
							</ChartCanvas>
						) : (
							<div className="gc-chart-placeholder">Đang khởi tạo canvas…</div>
						)}
					</div>
				</section>

				{/* Right side panel */}
				<aside className="gc-sidepanel" aria-label="Side panel">
					{/* Tab bar */}
					<div className="gc-sp-tabbar">
						{([
							["indicators", "Indicators"],
							["drawings",   "Drawing"],
							["adapter",    "Adapter"],
							["panes",      "Layout"],
						] as [SidePanelTab, string][]).map(([tab, label]) => (
							<button
								key={tab}
								type="button"
								className={`gc-sp-tab${sidePanelTab === tab ? " gc-sp-tab--active" : ""}`}
								onClick={() => setSidePanelTab(tab)}
							>
								{label}
							</button>
						))}
					</div>

					{/* ── Indicators ── */}
					{sidePanelTab === "indicators" && (
						<div className="gc-sp-body">
							<div className="gc-sp-label">
								Pane: <strong>{selectedPane?.label ?? "–"}</strong>
							</div>
							<div className="gc-chip-wrap">
								{INDICATOR_OPTIONS.map((name) => {
									const active = Boolean(selectedPane?.indicators.some((ind) => ind.name === name));
									return (
										<button
											key={name}
											type="button"
											className={`gc-chip${active ? " gc-chip--on" : ""}`}
											onClick={() => toggleIndicator(name)}
										>
											{name}
										</button>
									);
								})}
							</div>
							<div className="gc-sp-divider" />
							<div className="gc-sp-label">Computed values</div>
							<table className="gc-tbl">
								<tbody>
									{indicatorProbe.map((item) => (
										<tr key={item.name}>
											<td className={`gc-tbl-name gc-tbl-st--${item.status}`}>{item.name}</td>
											<td className="gc-tbl-val">{item.sample}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{/* ── Drawings ── */}
					{sidePanelTab === "drawings" && (
						<div className="gc-sp-body">
							<div className="gc-sp-label">Add drawing</div>
							<div className="gc-chip-wrap">
								{DRAWING_TOOLS.map((tool) => (
									<button key={tool} type="button" className="gc-chip" onClick={() => addDrawing(tool)}>
										{tool}
									</button>
								))}
							</div>
							<div className="gc-sp-divider" />
							<div className="gc-row gc-gap4">
								<button type="button" className="gc-btn" onClick={undoDrawing} disabled={drawingProbe.past === 0}>↩ Undo</button>
								<button type="button" className="gc-btn" onClick={redoDrawing} disabled={drawingProbe.future === 0}>↪ Redo</button>
								<button type="button" className="gc-btn" onClick={clearDrawing}>Clear</button>
								<button type="button" className="gc-btn" onClick={restoreDrawing}>Restore</button>
							</div>
							<div className="gc-sp-divider" />
							<table className="gc-tbl">
								<tbody>
									<tr><td className="gc-tbl-name">Drawings</td><td className="gc-tbl-val">{drawingProbe.count}</td></tr>
									<tr><td className="gc-tbl-name">Past / Future</td><td className="gc-tbl-val">{drawingProbe.past} / {drawingProbe.future}</td></tr>
									<tr><td className="gc-tbl-name">Available tools</td><td className="gc-tbl-val">{drawingProbe.toolNames.length}</td></tr>
								</tbody>
							</table>
						</div>
					)}

					{/* ── Adapter ── */}
					{sidePanelTab === "adapter" && (
						<div className="gc-sp-body">
							<div className="gc-sp-label">MockAdapter · {timeframe}</div>
							<div className={`gc-status-badge gc-st--${adapterProbe.status}`}>
								{adapterProbe.status.toUpperCase()}
							</div>
							<div className="gc-sp-divider" />
							<table className="gc-tbl">
								<tbody>
									<tr><td className="gc-tbl-name">Bars fetched</td><td className="gc-tbl-val">{adapterProbe.barsFetched}</td></tr>
									<tr><td className="gc-tbl-name">Bar ticks</td><td className="gc-tbl-val">{adapterProbe.barTicks}</td></tr>
									<tr><td className="gc-tbl-name">Trade ticks</td><td className="gc-tbl-val">{adapterProbe.tradeTicks}</td></tr>
									<tr><td className="gc-tbl-name">Orderbook ticks</td><td className="gc-tbl-val">{adapterProbe.orderbookTicks}</td></tr>
									<tr><td className="gc-tbl-name">Spread (bps)</td><td className="gc-tbl-val">{adapterProbe.spreadBps}</td></tr>
								</tbody>
							</table>
						</div>
					)}

					{/* ── Layout / Panes ── */}
					{sidePanelTab === "panes" && (
						<div className="gc-sp-body">
							<div className="gc-sp-label">Pane layout</div>
							<div className="gc-row gc-gap4">
								<button type="button" className="gc-btn gc-btn--accent" onClick={addPane}>+ Add</button>
								<button type="button" className="gc-btn" onClick={removePane} disabled={paneManager.panes.length <= 1}>Remove</button>
							</div>
							<div className="gc-sp-divider" />
							<div className="gc-pane-lab">
								{paneManager.panes.map((pane, index) => (
									<Fragment key={pane.id}>
										<div
											className={`gc-pane-item${pane.id === selectedPane?.id ? " gc-pane-item--active" : ""}`}
											style={{ height: pane.heightPx, minHeight: pane.minHeightPx ?? 90 }}
											onClick={() => setSelectedPaneId(pane.id)}
										>
											<div className="gc-pane-item__head">
												<span className="gc-pane-label">{pane.label ?? pane.id}</span>
												<span className="gc-pane-px">{pane.heightPx ?? 0}px</span>
											</div>
											<div className="gc-tag-wrap">
												{pane.indicators.map((ind) => (
													<span key={`${pane.id}-${ind.name}`} className="gc-tag">{ind.name}</span>
												))}
											</div>
										</div>
										{index < paneManager.panes.length - 1 ? (
											<PaneSplitter
												className="gc-splitter"
												onResize={(heightPx) => paneManager.resizePane(pane.id, heightPx)}
												minTopHeight={90}
												minBottomHeight={90}
											/>
										) : null}
									</Fragment>
								))}
							</div>
						</div>
					)}
				</aside>
			</div>

			{/* ─── BOTTOM BAR ─────────────────────────────────────────────── */}
			<footer className="gc-bottombar">
				{(["1D", "5D", "1M", "3M", "YTD", "1Y", "All"] as const).map((range, i) => (
					<button
						key={range}
						type="button"
						className={`gc-bottom-btn${i === 0 ? " gc-bottom-btn--active" : ""}`}
					>
						{range}
					</button>
				))}
				<div className="gc-bottombar-sep" />
				<button type="button" className="gc-bottom-btn">Script</button>
				<button type="button" className="gc-bottom-btn">Alert</button>
				<button type="button" className="gc-bottom-btn">Trade</button>
				<div className="gc-grow" />
				<span className="gc-version-badge">v{version}</span>
				<button type="button" className="gc-publish-btn">Publish</button>
			</footer>
		</div>
	);
}
