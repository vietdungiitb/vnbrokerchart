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

const INDICATOR_OPTIONS = ["EMA", "SMA", "RSI", "MACD", "BOLLINGER", "VOLUME", "CVD"] as const;
const DRAWING_TOOLS = ["trendLine", "hLine", "vLine", "fibonacci", "channel", "text"] as const;

type DrawingToolName = typeof DRAWING_TOOLS[number];

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

	return {
		label,
		heightPx,
		minHeightPx: 90,
		indicators,
	};
}

function summarizeIndicator(value: unknown) {
	if (Array.isArray(value)) {
		if (value.length === 0) {
			return "empty";
		}
		const lastValue = value[value.length - 1];
		if (typeof lastValue === "number") {
			return priceFormat(lastValue);
		}
		if (lastValue && typeof lastValue === "object") {
			return JSON.stringify(lastValue).slice(0, 36);
		}
		return String(lastValue);
	}
	return String(value ?? "n/a");
}

export default function LibraryShowcaseDemo() {
	const shellRef = useRef<HTMLDivElement | null>(null);
	const [chartWidth, setChartWidth] = useState(0);
	const [timeframe, setTimeframe] = useState("30m");
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

	const selectedPane = useMemo(() => {
		return paneManager.panes.find((pane) => pane.id === selectedPaneId) ?? paneManager.panes[0];
	}, [paneManager.panes, selectedPaneId]);

	useEffect(() => {
		if (!selectedPane && paneManager.panes.length > 0) {
			setSelectedPaneId(paneManager.panes[0].id);
		}
	}, [paneManager.panes, selectedPane]);

	useEffect(() => {
		const node = shellRef.current;
		if (!node) {
			return;
		}

		const update = () => {
			setChartWidth(Math.floor(node.getBoundingClientRect().width));
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

		setAdapterProbe((prev) => ({
			...prev,
			status: "running",
			barTicks: 0,
			tradeTicks: 0,
			orderbookTicks: 0,
			spreadBps: "0.00",
		}));

		adapter.fetchBars("BTCUSD", timeframe, from, to)
			.then((bars) => {
				if (disposed) {
					return;
				}
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
			})
			.catch(() => {
				if (disposed) {
					return;
				}
				setAdapterProbe((prev) => ({ ...prev, status: "done" }));
			});

		return () => {
			disposed = true;
			if (timerId !== undefined) {
				window.clearTimeout(timerId);
			}
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
			if (!indicator) {
				return { name, status: "missing", sample: "n/a" };
			}
			return {
				name,
				status: "ok",
				sample: summarizeIndicator(indicator.compute(input)),
			};
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

	const toggleIndicator = (name: string) => {
		if (!selectedPane) {
			return;
		}
		const hasIt = selectedPane.indicators.some((indicator) => indicator.name === name);
		if (hasIt) {
			paneManager.removeIndicator(selectedPane.id, name);
			return;
		}
		paneManager.addIndicator(selectedPane.id, { name, yAxis: "right", visible: true });
	};

	const addPane = () => {
		const id = paneManager.addPane(paneTemplate(`Pane ${paneManager.panes.length + 1}`, 105, ["EMA"]));
		setSelectedPaneId(id);
	};

	const removePane = () => {
		if (!selectedPane || paneManager.panes.length <= 1) {
			return;
		}
		paneManager.removePane(selectedPane.id);
	};

	const addDrawing = (tool: DrawingToolName) => {
		const startX = 24 + drawingState.present.length * 12;
		const draft = createDraftFromTool(tool, { x: startX, y: 42 });
		const completed = createDrawingTool(tool).updateDraft(draft, { x: startX + 120, y: 84 });
		setDrawingState((prev) => historyReducer(prev, { type: "PUSH", drawing: completed }));
	};

	const undoDrawing = () => setDrawingState((prev) => historyReducer(prev, { type: "UNDO" }));
	const redoDrawing = () => setDrawingState((prev) => historyReducer(prev, { type: "REDO" }));
	const clearDrawing = () => setDrawingState((prev) => historyReducer(prev, { type: "CLEAR" }));
	const restoreDrawing = () => {
		const restored = deserializeDrawings(drawingProbe.serialized);
		setDrawingState((prev) => historyReducer(prev, { type: "REPLACE", drawings: restored }));
	};

	return (
		<div className="gc-terminal">
			<header className="gc-topbar">
				<div className="gc-topbar__left">
					<div className="gc-logo">BT</div>
					<div className="gc-symbol">BTCUSD</div>
					<select className="gc-select" value={timeframe} onChange={(event) => setTimeframe(event.target.value)}>
						<option value="15m">15m</option>
						<option value="30m">30m</option>
						<option value="1h">1h</option>
					</select>
					<button type="button" className="gc-tab">Charts</button>
					<button type="button" className="gc-tab">Compare</button>
					<button type="button" className="gc-tab">Study</button>
				</div>
				<div className="gc-topbar__right">
					<span className="gc-version">v{version}</span>
					<button type="button" className="gc-upgrade">Upgrade</button>
				</div>
			</header>

			<div className="gc-main">
				<aside className="gc-tools">
					{["+", "↗", "T", "╳", "◧", "◫", "⚑", "✎", "⌖", "⚙"].map((symbol) => (
						<button key={symbol} type="button" className="gc-tool-btn">{symbol}</button>
					))}
				</aside>

				<section className="gc-chart-area">
					<div className="gc-ohlc-strip">
						<span>BYBIT:BTCUSD ({timeframe})</span>
						<span>O: {priceFormat(data[data.length - 1]?.open ?? 0)}</span>
						<span>H: {priceFormat(data[data.length - 1]?.high ?? 0)}</span>
						<span>L: {priceFormat(data[data.length - 1]?.low ?? 0)}</span>
						<span>C: {priceFormat(data[data.length - 1]?.close ?? 0)}</span>
					</div>

					<div className="gc-chart-shell" ref={shellRef}>
						{chartReady ? (
							<ChartCanvas
								height={620}
								width={chartWidth}
								margin={{ left: 60, right: 60, top: 8, bottom: 28 }}
								type="hybrid"
								seriesName="terminal-like-demo"
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
								<Chart id={1} height={380} yExtents={(datum: DemoDatum) => [datum.high, datum.low, datum.ema20, datum.ema50, datum.bollingerBand?.top, datum.bollingerBand?.bottom]}>
									<XAxis axisAt="bottom" orient="bottom" />
									<YAxis axisAt="right" orient="right" ticks={6} />
									<CandlestickSeries />
									<LineSeries yAccessor={(datum: DemoDatum) => datum.ema20} stroke="#2d9cdb" />
									<LineSeries yAccessor={(datum: DemoDatum) => datum.ema50} stroke="#f2994a" />
									<OHLCTooltip xDisplayFormat={dateFormat} volumeFormat={volumeFormat} displayTexts={{ d: "Ngay", o: "Mo", h: "Cao", l: "Thap", c: "Dong", v: "KL", na: "n/a" }} />
									<MouseCoordinateX displayFormat={dateFormat} />
									<MouseCoordinateY rectWidth={58} displayFormat={priceFormat} />
								</Chart>
								<Chart id={2} height={110} origin={(_w: number, h: number) => [0, h - 230]} yExtents={(datum: DemoDatum) => datum.volume}>
									<YAxis axisAt="right" orient="right" ticks={4} tickFormat={volumeFormat} />
									<BarSeries yAccessor={(datum: DemoDatum) => datum.volume} fill={(datum: DemoDatum) => (datum.close >= datum.open ? "#27ae60" : "#eb5757")} />
								</Chart>
								<Chart id={3} height={120} origin={(_w: number, h: number) => [0, h - 120]} yExtents={(datum: DemoDatum) => [datum.macd?.macd, datum.macd?.signal, datum.macd?.divergence, datum.rsi]}>
									<YAxis axisAt="right" orient="right" ticks={4} />
									<RSISeries yAccessor={(datum: DemoDatum) => datum.rsi} />
									<MACDSeries yAccessor={(datum: DemoDatum) => datum.macd} />
								</Chart>
								<CrossHairCursor />
							</ChartCanvas>
						) : (
							<div className="gc-chart-placeholder">Dang khoi tao terminal...</div>
						)}
					</div>
				</section>

				<aside className="gc-sidepanel">
					<div className="gc-panel">
						<div className="gc-panel__title">Pane Runtime</div>
						<div className="gc-row">
							<button type="button" className="gc-btn" onClick={addPane}>Add Pane</button>
							<button type="button" className="gc-btn" onClick={removePane} disabled={paneManager.panes.length <= 1}>Remove</button>
						</div>
						<div className="gc-pane-lab">
							{paneManager.panes.map((pane, index) => (
								<Fragment key={pane.id}>
									<div
										className={`gc-pane-item ${pane.id === selectedPane?.id ? "gc-pane-item--active" : ""}`}
										style={{ height: pane.heightPx, minHeight: pane.minHeightPx ?? 90 }}
										onClick={() => setSelectedPaneId(pane.id)}
									>
										<div className="gc-pane-item__head">
											<span>{pane.label ?? pane.id}</span>
											<span>{pane.heightPx ?? 0}px</span>
										</div>
										<div className="gc-tag-wrap">
											{pane.indicators.map((indicator) => (
												<span key={`${pane.id}-${indicator.name}`} className="gc-tag">{indicator.name}</span>
											))}
										</div>
									</div>
									{index < paneManager.panes.length - 1 ? (
										<PaneSplitter className="gc-splitter" onResize={(heightPx) => paneManager.resizePane(pane.id, heightPx)} minTopHeight={90} minBottomHeight={90} />
									) : null}
								</Fragment>
							))}
						</div>
					</div>

					<div className="gc-panel">
						<div className="gc-panel__title">Indicators</div>
						<div className="gc-row gc-wrap">
							{INDICATOR_OPTIONS.map((name) => {
								const active = Boolean(selectedPane?.indicators.some((indicator) => indicator.name === name));
								return (
									<button key={name} type="button" className={`gc-btn ${active ? "gc-btn--active" : ""}`} onClick={() => toggleIndicator(name)}>
										{name}
									</button>
								);
							})}
						</div>
						<div className="gc-telemetry-list">
							{indicatorProbe.map((item) => (
								<div key={item.name} className="gc-telemetry-item">
									<span>{item.name}</span>
									<span>{item.sample}</span>
								</div>
							))}
						</div>
					</div>

					<div className="gc-panel">
						<div className="gc-panel__title">Drawing + Adapter</div>
						<div className="gc-row gc-wrap">
							{DRAWING_TOOLS.map((tool) => (
								<button key={tool} type="button" className="gc-btn" onClick={() => addDrawing(tool)}>{tool}</button>
							))}
						</div>
						<div className="gc-row">
							<button type="button" className="gc-btn" onClick={undoDrawing}>Undo</button>
							<button type="button" className="gc-btn" onClick={redoDrawing}>Redo</button>
							<button type="button" className="gc-btn" onClick={clearDrawing}>Clear</button>
							<button type="button" className="gc-btn" onClick={restoreDrawing}>Restore</button>
						</div>
						<div className="gc-telemetry-list">
							<div className="gc-telemetry-item"><span>Drawings</span><span>{drawingProbe.count}</span></div>
							<div className="gc-telemetry-item"><span>History</span><span>{drawingProbe.past}/{drawingProbe.future}</span></div>
							<div className="gc-telemetry-item"><span>Adapter</span><span>{adapterProbe.status}</span></div>
							<div className="gc-telemetry-item"><span>Bars/Trades/Book</span><span>{adapterProbe.barTicks}/{adapterProbe.tradeTicks}/{adapterProbe.orderbookTicks}</span></div>
							<div className="gc-telemetry-item"><span>Spread</span><span>{adapterProbe.spreadBps} bps</span></div>
						</div>
					</div>
				</aside>
			</div>

			<footer className="gc-bottombar">
				<button type="button" className="gc-bottom-btn gc-bottom-btn--active">1D</button>
				<button type="button" className="gc-bottom-btn">5D</button>
				<button type="button" className="gc-bottom-btn">1M</button>
				<button type="button" className="gc-bottom-btn">Script</button>
				<button type="button" className="gc-bottom-btn">Alert</button>
				<button type="button" className="gc-bottom-btn">Trade</button>
				<div className="gc-grow" />
				<button type="button" className="gc-publish">Publish</button>
			</footer>
		</div>
	);
}
