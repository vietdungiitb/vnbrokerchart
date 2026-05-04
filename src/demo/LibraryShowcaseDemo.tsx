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
import BarSeries from "../lib/series/BarSeries";
import CandlestickSeries from "../lib/series/CandlestickSeries";
import LineSeries from "../lib/series/LineSeries";
import MACDSeries from "../lib/series/MACDSeries";
import RSISeries from "../lib/series/RSISeries";
import { OHLCTooltip } from "../lib/tooltip";
import { getOfflineDemoData, type DemoDatum } from "./demoData";
import "./demo.css";

const priceFormat = format(".2f");
const volumeFormat = format(".3s");
const dateFormat = timeFormat("%d/%m/%Y %H:%M");

const TIMEFRAMES = ["1m", "3m", "5m", "15m", "30m", "1h", "4h", "1D", "1W"] as const;
type Timeframe = typeof TIMEFRAMES[number];

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

export default function LibraryShowcaseDemo() {
	const shellRef = useRef<HTMLDivElement | null>(null);
	const [chartWidth, setChartWidth] = useState(0);
	const [timeframe, setTimeframe] = useState<Timeframe>("30m");
	const [activeTool, setActiveTool] = useState<string>("cursor");
	const [sidePanelTab, setSidePanelTab] = useState<SidePanelTab>("indicators");
	const [selectedPaneId, setSelectedPaneId] = useState("");
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

	const data = useMemo(() => getOfflineDemoData().map((datum) => ({ ...datum })), []);
	const xExtents = useMemo(() => chartDomain(data), [data]);
	const lastBar = data[data.length - 1];

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
		const update = () => setChartWidth(Math.floor(node.getBoundingClientRect().width));
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

	const chartReady = chartWidth > 0 && data.length > 0;
	const ratio = window.devicePixelRatio || 1;
	const priceIsUp = (lastBar?.close ?? 0) >= (lastBar?.open ?? 0);

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

					<button type="button" className="gc-topbar-btn">Charts</button>
					<button type="button" className="gc-topbar-btn">Compare</button>
					<button type="button" className="gc-topbar-btn">Study</button>
					<button type="button" className="gc-topbar-btn">Replay</button>
				</div>

				<div className="gc-topbar__right">
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
						<span className="gc-ohlc-pair">BYBIT:BTCUSD <span className="gc-ohlc-tf">· {timeframe}</span></span>
						<span className="gc-ohlc-item">O <b>{priceFormat(lastBar?.open ?? 0)}</b></span>
						<span className="gc-ohlc-item">H <b className="gc-col-up">{priceFormat(lastBar?.high ?? 0)}</b></span>
						<span className="gc-ohlc-item">L <b className="gc-col-dn">{priceFormat(lastBar?.low ?? 0)}</b></span>
						<span className="gc-ohlc-item">C <b className={priceIsUp ? "gc-col-up" : "gc-col-dn"}>{priceFormat(lastBar?.close ?? 0)}</b></span>
						<span className="gc-ohlc-item gc-ohlc-vol">Vol <b>{volumeFormat(lastBar?.volume ?? 0)}</b></span>
					</div>

					{/* Canvas */}
					<div className="gc-chart-shell" ref={shellRef}>
						{chartReady ? (
							<ChartCanvas
								height={620}
								width={chartWidth}
								margin={{ left: 60, right: 68, top: 8, bottom: 28 }}
								type="hybrid"
								seriesName="terminal-demo"
								data={data}
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
									height={380}
									yExtents={(datum: DemoDatum) => [
										datum.high, datum.low,
										datum.ema20, datum.ema50,
										datum.bollingerBand?.top,
										datum.bollingerBand?.bottom,
									]}
								>
									<XAxis axisAt="bottom" orient="bottom" />
									<YAxis axisAt="right" orient="right" ticks={6} />
									<CandlestickSeries
										wickStroke={(datum: DemoDatum) => (datum.close >= datum.open ? "#089981" : "#f23645")}
										fill={(datum: DemoDatum) => (datum.close >= datum.open ? "#089981" : "#f23645")}
									/>
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
									height={110}
									origin={(_w: number, h: number) => [0, h - 230]}
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
									height={120}
									origin={(_w: number, h: number) => [0, h - 120]}
									yExtents={(datum: DemoDatum) => [datum.macd?.macd, datum.macd?.signal, datum.macd?.divergence, datum.rsi]}
								>
									<YAxis axisAt="right" orient="right" ticks={3} />
									<RSISeries yAccessor={(datum: DemoDatum) => datum.rsi} />
									<MACDSeries yAccessor={(datum: DemoDatum) => datum.macd} />
								</Chart>

								<CrossHairCursor />
							</ChartCanvas>
						) : (
							<div className="gc-chart-placeholder">Đang khởi tạo terminal…</div>
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
