import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { format } from "d3-format";
import { scaleTime } from "d3-scale";
import { timeFormat } from "d3-time-format";

import {
	ChartPane,
	ChartTerminal,
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
import { OHLCTooltip } from "../lib/tooltip";
import { getOfflineDemoData, type DemoDatum } from "./demoData";
import "./demo.css";

const priceFormat = format(".2f");
const volumeFormat = format(".3s");
const dateFormat = timeFormat("%d/%m/%Y %H:%M");

const INDICATOR_CATALOG = ["EMA", "SMA", "RSI", "MACD", "BOLLINGER", "VOLUME", "CVD"] as const;
const DRAWING_TOOL_NAMES = ["trendLine", "hLine", "vLine", "fibonacci", "channel", "text"] as const;

type TerminalPreset = "Terminal" | "Orderflow" | "Stress";
type DrawingToolName = typeof DRAWING_TOOL_NAMES[number];

type AdapterProbe = {
	barsFetched: number;
	barTicks: number;
	tradeTicks: number;
	orderbookTicks: number;
	lastSpreadBps: string;
	status: "idle" | "running" | "done";
};

function normalizeDate(value: Date | number) {
	return value instanceof Date ? value : new Date(value);
}

function toDateRange(data: DemoDatum[]) {
	const end = data.length - 1;
	const start = Math.max(0, end - 140);
	return [normalizeDate(data[start].date), normalizeDate(data[end].date)] as [Date, Date];
}

function summarizeIndicatorValue(value: unknown) {
	if (Array.isArray(value)) {
		if (value.length === 0) {
			return "empty";
		}
		const lastValue = value[value.length - 1];
		if (typeof lastValue === "number") {
			return priceFormat(lastValue);
		}
		if (lastValue && typeof lastValue === "object") {
			const compact = JSON.stringify(lastValue);
			return compact.length > 42 ? `${compact.slice(0, 42)}...` : compact;
		}
		return String(lastValue);
	}

	if (value && typeof value === "object") {
		return "object";
	}

	return String(value ?? "n/a");
}

function createPaneTemplate(label: string, heightPx: number, indicatorNames: readonly string[]) {
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

export default function LibraryShowcaseDemo() {
	const surfaceRef = useRef<HTMLDivElement | null>(null);
	const [chartWidth, setChartWidth] = useState(0);
	const [timeframe, setTimeframe] = useState("30m");
	const [preset, setPreset] = useState<TerminalPreset>("Terminal");
	const [selectedPaneId, setSelectedPaneId] = useState("");
	const [adapterProbe, setAdapterProbe] = useState<AdapterProbe>({
		barsFetched: 0,
		barTicks: 0,
		tradeTicks: 0,
		orderbookTicks: 0,
		lastSpreadBps: "0.00",
		status: "idle",
	});
	const [drawingHistoryState, setDrawingHistoryState] = useState(() => createDrawingHistory([]));

	const paneManager = usePaneManager([
		createPaneTemplate("Price", 170, ["EMA", "BOLLINGER"]),
		createPaneTemplate("Volume", 120, ["VOLUME"]),
		createPaneTemplate("Momentum", 120, ["RSI", "MACD"]),
	]);

	const data = useMemo(() => getOfflineDemoData().map((datum) => ({ ...datum })), []);
	const xExtents = useMemo(() => toDateRange(data), [data]);

	const selectedPane = useMemo(() => {
		return paneManager.panes.find((pane) => pane.id === selectedPaneId) ?? paneManager.panes[0];
	}, [paneManager.panes, selectedPaneId]);

	useEffect(() => {
		if (!selectedPane && paneManager.panes.length > 0) {
			setSelectedPaneId(paneManager.panes[0].id);
		}
	}, [paneManager.panes, selectedPane]);

	useEffect(() => {
		const node = surfaceRef.current;
		if (!node) {
			return;
		}

		const updateSize = () => {
			setChartWidth(Math.floor(node.getBoundingClientRect().width));
		};
		updateSize();

		const observer = new ResizeObserver(updateSize);
		observer.observe(node);
		window.addEventListener("resize", updateSize);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", updateSize);
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
			lastSpreadBps: "0.00",
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
					const mid = (bestBid + bestAsk) / 2;
					const spreadBps = mid > 0 ? ((bestAsk - bestBid) / mid) * 10_000 : 0;
					setAdapterProbe((prev) => ({
						...prev,
						orderbookTicks: prev.orderbookTicks + 1,
						lastSpreadBps: spreadBps.toFixed(2),
					}));
				});
				timerId = window.setTimeout(() => {
					stopBars?.();
					stopTrades?.();
					stopOrderbook?.();
					setAdapterProbe((prev) => ({ ...prev, status: "done" }));
				}, 1600);
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
		const indicatorInput: OHLCVBar[] = sample.map((datum, index) => ({
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

		return INDICATOR_CATALOG.map((name) => {
			const indicator = getIndicator(name);
			if (!indicator) {
				return { name, status: "missing", value: "n/a" };
			}
			const computed = indicator.compute(indicatorInput);
			return { name, status: "ok", value: summarizeIndicatorValue(computed) };
		});
	}, [data]);

	const drawingProbe = useMemo(() => {
		const tools = listDrawingTools().map((tool) => tool.name);
		const serialized = serializeDrawings(drawingHistoryState.present);
		return {
			toolCount: tools.length,
			toolNames: tools,
			serializedLength: serialized.length,
			historyDepth: drawingHistoryState.past.length,
			futureDepth: drawingHistoryState.future.length,
			drawingsNow: drawingHistoryState.present.length,
			serialized,
		};
	}, [drawingHistoryState]);

	const coreProbe = useMemo(() => {
		return [
			{ name: "ChartTerminal", ok: typeof ChartTerminal === "function" },
			{ name: "ChartPane", ok: typeof ChartPane === "function" },
			{ name: "PaneSplitter", ok: typeof PaneSplitter === "function" },
			{ name: "usePaneManager", ok: typeof usePaneManager === "function" },
		];
	}, []);

	const ready = chartWidth > 0 && data.length > 0;
	const ratio = window.devicePixelRatio || 1;
	const priceHeight = 430;
	const volumeHeight = 130;
	const totalHeight = priceHeight + volumeHeight;

	const toggleIndicator = (name: string) => {
		if (!selectedPane) {
			return;
		}
		const exists = selectedPane.indicators.some((indicator) => indicator.name === name);
		if (exists) {
			paneManager.removeIndicator(selectedPane.id, name);
			return;
		}
		paneManager.addIndicator(selectedPane.id, {
			name,
			visible: true,
			yAxis: "right",
		});
	};

	const addPane = () => {
		const paneNumber = paneManager.panes.length + 1;
		const paneId = paneManager.addPane(createPaneTemplate(`Pane ${paneNumber}`, 110, ["EMA"]));
		setSelectedPaneId(paneId);
	};

	const removePane = () => {
		if (!selectedPane || paneManager.panes.length <= 1) {
			return;
		}
		paneManager.removePane(selectedPane.id);
	};

	const applyPreset = (nextPreset: TerminalPreset) => {
		setPreset(nextPreset);
		const existingPaneIds = paneManager.panes.map((pane) => pane.id);
		existingPaneIds.forEach((paneId) => paneManager.removePane(paneId));

		const templates = nextPreset === "Orderflow"
			? [
				createPaneTemplate("Price", 170, ["EMA", "BOLLINGER", "CVD"]),
				createPaneTemplate("Volume", 110, ["VOLUME"]),
				createPaneTemplate("Execution", 110, ["RSI"]),
			]
			: nextPreset === "Stress"
				? [
					createPaneTemplate("Price", 160, ["EMA", "BOLLINGER"]),
					createPaneTemplate("Volume", 105, ["VOLUME"]),
					createPaneTemplate("Momentum", 105, ["RSI", "MACD"]),
					createPaneTemplate("Flow", 105, ["CVD"]),
				]
				: [
					createPaneTemplate("Price", 170, ["EMA", "BOLLINGER"]),
					createPaneTemplate("Volume", 120, ["VOLUME"]),
					createPaneTemplate("Momentum", 120, ["RSI", "MACD"]),
				];

		const newPaneIds = templates.map((template) => paneManager.addPane(template));
		if (newPaneIds[0]) {
			setSelectedPaneId(newPaneIds[0]);
		}
	};

	const addDrawing = (tool: DrawingToolName) => {
		const draft = createDraftFromTool(tool, {
			x: 40 + drawingHistoryState.present.length * 14,
			y: 48 + drawingHistoryState.present.length * 9,
		});
		const finalized = createDrawingTool(tool).updateDraft(draft, {
			x: draft.points[0].x + 132,
			y: draft.points[0].y + 42,
		});
		setDrawingHistoryState((prev) => historyReducer(prev, { type: "PUSH", drawing: finalized }));
	};

	const undoDrawing = () => {
		setDrawingHistoryState((prev) => historyReducer(prev, { type: "UNDO" }));
	};

	const redoDrawing = () => {
		setDrawingHistoryState((prev) => historyReducer(prev, { type: "REDO" }));
	};

	const clearDrawing = () => {
		setDrawingHistoryState((prev) => historyReducer(prev, { type: "CLEAR" }));
	};

	const restoreDrawing = () => {
		const restored = deserializeDrawings(drawingProbe.serialized);
		setDrawingHistoryState((prev) => historyReducer(prev, { type: "REPLACE", drawings: restored }));
	};

	return (
		<div className="demo-page terminal-shell">
			<div className="demo-frame terminal-frame">
				<section className="terminal-topbar">
					<div className="terminal-ticker">BYBIT:BTCUSD · {timeframe}</div>
					<div className="terminal-actions">
						{(["15m", "30m", "1h"] as const).map((value) => (
							<button
								type="button"
								key={value}
								onClick={() => setTimeframe(value)}
								className={`control-button ${timeframe === value ? "control-button--active" : ""}`}
							>
								{value}
							</button>
						))}
						{(["Terminal", "Orderflow", "Stress"] as const).map((value) => (
							<button
								type="button"
								key={value}
								onClick={() => applyPreset(value)}
								className={`control-button ${preset === value ? "control-button--active" : ""}`}
							>
								Preset {value}
							</button>
						))}
					</div>
				</section>

				<section className="demo-grid terminal-grid">
					<div className="demo-side terminal-left">
						<div className="demo-panel">
							<h2>Pane runtime controls</h2>
							<div className="control-grid">
								<button type="button" className="control-button" onClick={addPane}>Add pane</button>
								<button type="button" className="control-button" onClick={removePane} disabled={paneManager.panes.length <= 1}>Remove selected</button>
							</div>
							<p className="demo-note">Pane hiện tại: {selectedPane?.label ?? "n/a"} ({selectedPane?.id ?? "-"})</p>
						</div>

						<div className="demo-panel">
							<h2>Indicators</h2>
							<div className="control-grid">
								{INDICATOR_CATALOG.map((name) => {
									const isActive = Boolean(selectedPane?.indicators.some((indicator) => indicator.name === name));
									return (
										<button
											type="button"
											key={name}
											onClick={() => toggleIndicator(name)}
											className={`control-button ${isActive ? "control-button--active" : ""}`}
										>
											{name}
										</button>
									);
								})}
							</div>
						</div>

						<div className="demo-panel">
							<h2>Drawing tools</h2>
							<div className="control-grid">
								{DRAWING_TOOL_NAMES.map((tool) => (
									<button type="button" key={tool} className="control-button" onClick={() => addDrawing(tool)}>
										{tool}
									</button>
								))}
							</div>
							<div className="control-grid">
								<button type="button" className="control-button" onClick={undoDrawing}>Undo</button>
								<button type="button" className="control-button" onClick={redoDrawing}>Redo</button>
								<button type="button" className="control-button" onClick={clearDrawing}>Clear</button>
								<button type="button" className="control-button" onClick={restoreDrawing}>Restore</button>
							</div>
						</div>
					</div>

					<div className="demo-chart-card terminal-center">
						<div className="demo-chart-card__header">
							<div>
								<h2 className="demo-chart-card__title">Chart canvas + runtime pane lab</h2>
								<p className="demo-chart-card__meta">Layout mô phỏng terminal: chart trung tâm, pane lab kéo splitter, controls runtime bên cạnh.</p>
							</div>
							<span className={`source-chip ${ready ? "source-chip--positive" : "source-chip--neutral"}`}>
								{ready ? "Chart ready" : "Initializing"}
							</span>
						</div>
						<div className="chart-shell" ref={surfaceRef}>
							{ready ? (
								<>
									<div className="chart-surface">
										<ChartCanvas
											height={totalHeight}
											width={chartWidth}
											margin={{ left: 80, right: 80, top: 16, bottom: 34 }}
											type="hybrid"
											seriesName="terminal-showcase"
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
											<Chart id={1} height={priceHeight} yExtents={(datum: DemoDatum) => [datum.high, datum.low, datum.ema20, datum.ema50]}>
												<XAxis axisAt="bottom" orient="bottom" />
												<YAxis axisAt="right" orient="right" ticks={5} />
												<CandlestickSeries />
												<LineSeries yAccessor={(datum: DemoDatum) => datum.ema20} stroke="#22d3ee" />
												<LineSeries yAccessor={(datum: DemoDatum) => datum.ema50} stroke="#f59e0b" />
												<OHLCTooltip xDisplayFormat={dateFormat} volumeFormat={volumeFormat} displayTexts={{ d: "Ngày", o: "Mở", h: "Cao", l: "Thấp", c: "Đóng", v: "KL", na: "n/a" }} />
												<MouseCoordinateX displayFormat={dateFormat} />
												<MouseCoordinateY rectWidth={60} displayFormat={priceFormat} />
											</Chart>
											<Chart id={2} height={volumeHeight} origin={(_w: number, h: number) => [0, h - volumeHeight]} yExtents={(datum: DemoDatum) => datum.volume}>
												<XAxis axisAt="bottom" orient="bottom" />
												<YAxis axisAt="right" orient="right" ticks={4} tickFormat={volumeFormat} />
												<BarSeries yAccessor={(datum: DemoDatum) => datum.volume} fill={(datum: DemoDatum) => (datum.close >= datum.open ? "#10b981" : "#ef4444")} />
											</Chart>
											<CrossHairCursor />
										</ChartCanvas>
									</div>

									<div className="runtime-lab">
										{paneManager.panes.map((pane, index) => (
											<Fragment key={pane.id}>
												<div
													className={`runtime-pane ${pane.id === selectedPane?.id ? "runtime-pane--selected" : ""}`}
													style={{
														height: pane.heightPx,
														minHeight: pane.minHeightPx ?? 90,
													}}
													onClick={() => setSelectedPaneId(pane.id)}
												>
													<div className="runtime-pane__header">
														<span>{pane.label ?? pane.id}</span>
														<span>{pane.heightPx ?? 0}px</span>
													</div>
													<div className="runtime-pane__indicators">
														{pane.indicators.length === 0 ? (
															<span className="runtime-chip runtime-chip--muted">No indicator</span>
														) : (
															pane.indicators.map((indicator) => (
																<span className="runtime-chip" key={`${pane.id}-${indicator.name}`}>{indicator.name}</span>
															))
														)}
													</div>
												</div>
												{index < paneManager.panes.length - 1 ? (
													<PaneSplitter className="runtime-splitter" onResize={(heightPx) => paneManager.resizePane(pane.id, heightPx)} minTopHeight={90} minBottomHeight={90} />
												) : null}
											</Fragment>
										))}
									</div>
								</>
							) : (
								<div className="chart-placeholder">Dang khoi tao chart showcase...</div>
							)}
						</div>
					</div>

					<div className="demo-side">
						<div className="demo-panel">
							<h2>Core API checks</h2>
							<div className="legend-list">
								{coreProbe.map((item) => (
									<div className="legend-row" key={item.name}>
										<div className="legend-row__key">
											<span className="legend-swatch legend-swatch--block" style={{ background: item.ok ? "#10b981" : "#ef4444" }} />
											<div className="legend-row__label">{item.name}</div>
										</div>
										<div className="legend-row__detail">{item.ok ? "Export ready" : "Missing"}</div>
									</div>
								))}
							</div>
						</div>

						<div className="demo-panel">
							<h2>Indicator registry</h2>
							<div className="legend-list">
								{indicatorProbe.map((item) => (
									<div className="legend-row" key={item.name}>
										<div className="legend-row__key">
											<span className="legend-swatch legend-swatch--line" style={{ background: item.status === "ok" ? "#22d3ee" : "#ef4444" }} />
											<div className="legend-row__label">{item.name}</div>
										</div>
										<div className="legend-row__detail">Sample: {item.value}</div>
									</div>
								))}
							</div>
						</div>

						<div className="demo-panel">
							<h2>Drawing + Adapter telemetry</h2>
							<div className="feature-list">
								<div className="feature-item"><span className="feature-dot" /><div>Tools: {drawingProbe.toolNames.join(", ")}</div></div>
								<div className="feature-item"><span className="feature-dot" /><div>Drawings: {drawingProbe.drawingsNow} | Past: {drawingProbe.historyDepth} | Future: {drawingProbe.futureDepth}</div></div>
								<div className="feature-item"><span className="feature-dot" /><div>Serialized bytes: {drawingProbe.serializedLength}</div></div>
								<div className="feature-item"><span className="feature-dot" /><div>Adapter status: {adapterProbe.status}</div></div>
								<div className="feature-item"><span className="feature-dot" /><div>Ticks bars/trades/orderbook: {adapterProbe.barTicks}/{adapterProbe.tradeTicks}/{adapterProbe.orderbookTicks}</div></div>
								<div className="feature-item"><span className="feature-dot" /><div>Last spread: {adapterProbe.lastSpreadBps} bps</div></div>
							</div>
							<p className="demo-note">Layout tham chiếu terminal trading: thanh công cụ, khu chart trung tâm, panel điều khiển trái/phải, pane splitter runtime.</p>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
