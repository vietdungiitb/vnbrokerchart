import { useEffect, useMemo, useRef, useState } from "react";
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

type AdapterProbe = {
	barsFetched: number;
	barTicks: number;
	tradeTicks: number;
	status: "idle" | "running" | "done";
};

function normalizeDate(value: Date | number) {
	return value instanceof Date ? value : new Date(value);
}

function toDateRange(data: DemoDatum[]) {
	const end = data.length - 1;
	const start = Math.max(0, end - 120);
	return [data[start].date, data[end].date] as [Date, Date];
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

export default function LibraryShowcaseDemo() {
	const surfaceRef = useRef<HTMLDivElement | null>(null);
	const [chartWidth, setChartWidth] = useState(0);
	const [adapterProbe, setAdapterProbe] = useState<AdapterProbe>({
		barsFetched: 0,
		barTicks: 0,
		tradeTicks: 0,
		status: "idle",
	});

	const data = useMemo(() => getOfflineDemoData().map((datum) => ({ ...datum })), []);
	const xExtents = useMemo(() => toDateRange(data), [data]);

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
		let timerId: number | undefined;
		let disposed = false;

		setAdapterProbe((prev) => ({ ...prev, status: "running", barTicks: 0, tradeTicks: 0 }));

		adapter.fetchBars("VCB", "1D", from, to)
			.then((bars) => {
				if (disposed) {
					return;
				}
				setAdapterProbe((prev) => ({ ...prev, barsFetched: bars.length }));
				stopBars = adapter.subscribeToBar("VCB", "1D", () => {
					setAdapterProbe((prev) => ({ ...prev, barTicks: prev.barTicks + 1 }));
				});
				stopTrades = adapter.subscribeToTrades("VCB", () => {
					setAdapterProbe((prev) => ({ ...prev, tradeTicks: prev.tradeTicks + 1 }));
				});
				timerId = window.setTimeout(() => {
					stopBars?.();
					stopTrades?.();
					setAdapterProbe((prev) => ({ ...prev, status: "done" }));
				}, 1200);
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
		};
	}, [data]);

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
		const names = ["EMA", "SMA", "RSI", "MACD", "BOLLINGER", "VOLUME", "CVD"];
		return names.map((name) => {
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
		const firstDraft = createDraftFromTool("trendLine", { x: 24, y: 44 });
		const updated = createDrawingTool("trendLine").updateDraft(firstDraft, { x: 180, y: 88 });
		const serialized = serializeDrawings([updated]);
		const restored = deserializeDrawings(serialized);
		const history = createDrawingHistory(restored);
		const next = historyReducer(history, {
			type: "PUSH",
			drawing: createDraftFromTool("text", { x: 72, y: 56 }),
		});

		return {
			toolCount: tools.length,
			toolNames: tools,
			serializedLength: serialized.length,
			historyDepth: next.past.length,
			drawingsNow: next.present.length,
		};
	}, []);

	const coreProbe = useMemo(() => {
		const checks = [
			{ name: "ChartTerminal", ok: typeof ChartTerminal === "function" },
			{ name: "ChartPane", ok: typeof ChartPane === "function" },
			{ name: "PaneSplitter", ok: typeof PaneSplitter === "function" },
			{ name: "usePaneManager", ok: typeof usePaneManager === "function" },
		];
		return checks;
	}, []);

	const ready = chartWidth > 0 && data.length > 0;
	const ratio = window.devicePixelRatio || 1;
	const priceHeight = 430;
	const volumeHeight = 130;
	const totalHeight = priceHeight + volumeHeight;

	return (
		<div className="demo-page">
			<div className="demo-frame">
				<section className="demo-hero">
					<div className="demo-hero__content">
						<span className="demo-eyebrow">Library Showcase</span>
						<h1 className="demo-title">Demo phản ánh đầy đủ thư viện mới</h1>
						<p className="demo-subtitle">
							Trang này hiển thị chart runtime và probe trực tiếp cho các module đã chốt trong P1-P7:
							 core shell, indicator registry, drawing engine và data adapter.
						</p>
						<div className="demo-badges">
							<span className="demo-badge">Version {version}</span>
							<span className="demo-badge">React 19</span>
							<span className="demo-badge">TypeScript Strict</span>
						</div>
					</div>

					<div className="demo-summary-card">
						<div className="demo-summary-card__header">
							<h2>Probe tổng quan</h2>
							<span className="source-chip source-chip--accent">Runtime smoke</span>
						</div>
						<div className="demo-summary-grid">
							<div className="metric-tile metric-tile--accent">
								<div className="metric-tile__label">Core API</div>
								<div className="metric-tile__value">{coreProbe.filter((item) => item.ok).length}/4</div>
								<div className="metric-tile__detail">ChartTerminal, ChartPane, PaneSplitter, usePaneManager</div>
							</div>
							<div className="metric-tile metric-tile--positive">
								<div className="metric-tile__label">Indicator Registry</div>
								<div className="metric-tile__value">{indicatorProbe.filter((item) => item.status === "ok").length}/7</div>
								<div className="metric-tile__detail">EMA, SMA, RSI, MACD, Bollinger, Volume, CVD</div>
							</div>
							<div className="metric-tile metric-tile--accent">
								<div className="metric-tile__label">Drawing Engine</div>
								<div className="metric-tile__value">{drawingProbe.toolCount} tools</div>
								<div className="metric-tile__detail">Serialize + history reducer đã chạy probe</div>
							</div>
							<div className="metric-tile metric-tile--positive">
								<div className="metric-tile__label">Adapter Probe</div>
								<div className="metric-tile__value">{adapterProbe.barsFetched} bars</div>
								<div className="metric-tile__detail">Ticks bars/trades: {adapterProbe.barTicks}/{adapterProbe.tradeTicks}</div>
							</div>
						</div>
					</div>
				</section>

				<section className="demo-grid">
					<div className="demo-chart-card">
						<div className="demo-chart-card__header">
							<div>
								<h2 className="demo-chart-card__title">Chart runtime</h2>
								<p className="demo-chart-card__meta">Nến + EMA20/EMA50 + volume để kiểm tra hành vi render thực tế.</p>
							</div>
							<span className={`source-chip ${ready ? "source-chip--positive" : "source-chip--neutral"}`}>
								{ready ? "Chart ready" : "Initializing"}
							</span>
						</div>
						<div className="chart-shell" ref={surfaceRef}>
							{ready ? (
								<div className="chart-surface">
									<ChartCanvas
										height={totalHeight}
										width={chartWidth}
										margin={{ left: 80, right: 80, top: 16, bottom: 34 }}
										type="hybrid"
										seriesName="library-showcase"
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
							) : (
								<div className="chart-placeholder">Đang khởi tạo chart showcase...</div>
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
										<div className="legend-row__detail">{item.ok ? "Export sẵn sàng" : "Không tìm thấy export"}</div>
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
							<h2>Drawing + Adapter</h2>
							<div className="feature-list">
								<div className="feature-item">
									<span className="feature-dot" />
									<div>
										Tools: {drawingProbe.toolNames.join(", ")}
									</div>
								</div>
								<div className="feature-item">
									<span className="feature-dot" />
									<div>
										Serialized length: {drawingProbe.serializedLength} | History depth: {drawingProbe.historyDepth} | Drawings: {drawingProbe.drawingsNow}
									</div>
								</div>
								<div className="feature-item">
									<span className="feature-dot" />
									<div>
										Adapter status: {adapterProbe.status} | Bars fetched: {adapterProbe.barsFetched} | Bar ticks: {adapterProbe.barTicks} | Trade ticks: {adapterProbe.tradeTicks}
									</div>
								</div>
							</div>
							<p className="demo-note">
								Probe chạy ngay khi load trang để xác nhận các module mới có thể gọi runtime mà không cần script phụ trợ.
							</p>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
