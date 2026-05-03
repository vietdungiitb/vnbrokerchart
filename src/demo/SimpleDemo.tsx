import { useEffect, useMemo, useRef, useState } from "react";
import { scaleTime } from "d3-scale";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import ChartCanvas from "../lib/ChartCanvas";
import Chart from "../lib/Chart";
import { Brush } from "../lib/interactive";
import ZoomButtons from "../lib/ZoomButtons";
import CandlestickSeries from "../lib/series/CandlestickSeries";
import LineSeries from "../lib/series/LineSeries";
import { XAxis, YAxis } from "../lib/axes";
import { CrossHairCursor, CurrentCoordinate, EdgeIndicator, MouseCoordinateX, MouseCoordinateY } from "../lib/coordinates";
import { OHLCTooltip } from "../lib/tooltip";
import { getOfflineDemoData, type DemoDatum } from "./demoData";
import "./demo.css";

interface BrushPoint {
    xValue: Date | number;
    yValue: number;
}

interface BrushSelection {
    start: BrushPoint;
    end: BrushPoint;
}

const themeFontFamily = '"Segoe UI Variable Text", "Aptos", "Segoe UI", sans-serif';
const priceFormat = format(".2f");
const volumeFormat = format(".3s");
const dateFormat = timeFormat("%d/%m/%Y %H:%M");

const axisTheme = {
    stroke: "rgba(148, 163, 184, 0.38)",
    tickStroke: "rgba(148, 163, 184, 0.38)",
    tickLabelFill: "#cbd5e1",
    fontFamily: themeFontFamily,
    fontSize: 12,
    fontWeight: 500,
};

const coordinateTheme = {
    fill: "rgba(15, 23, 42, 0.96)",
    opacity: 1,
    stroke: "rgba(148, 163, 184, 0.38)",
    strokeOpacity: 1,
    strokeWidth: 1,
    fontFamily: themeFontFamily,
    fontSize: 12,
    textFill: "#e2e8f0",
};

const ema20Stroke = "#22d3ee";
const ema50Stroke = "#f59e0b";
const bullishColor = "#10b981";
const bearishColor = "#ef4444";

function createOrigin(offsetFromBottom: number) {
    return (_width: number, height: number) => [0, height - offsetFromBottom] as [number, number];
}

function getInitialExtents(data: DemoDatum[], visibleCount = 160): [Date, Date] {
    const endIndex = data.length - 1;
    const startIndex = Math.max(0, data.length - Math.min(visibleCount, data.length));
    return [data[startIndex].date as Date, data[endIndex].date as Date];
}

function normalizeBrushExtents(start: BrushPoint, end: BrushPoint): [Date, Date] {
    const startDate = new Date(start.xValue);
    const endDate = new Date(end.xValue);
    return startDate.valueOf() <= endDate.valueOf()
        ? [startDate, endDate]
        : [endDate, startDate];
}

const SimpleDemo = () => {
    const chartData = useMemo(() => getOfflineDemoData(), []);
    const initialExtents = useMemo(() => getInitialExtents(chartData), [chartData]);
    const [xExtents, setXExtents] = useState<[Date, Date]>(initialExtents);
    const [chartWidth, setChartWidth] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight);
    const chartSurfaceRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const node = chartSurfaceRef.current;
        if (!node) return;

        const updateWidth = () => {
            setChartWidth(Math.floor(node.getBoundingClientRect().width));
        };

        updateWidth();

        if (typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", updateWidth);
            return () => window.removeEventListener("resize", updateWidth);
        }

        const observer = new ResizeObserver(() => updateWidth());
        observer.observe(node);
        window.addEventListener("resize", updateWidth);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", updateWidth);
        };
    }, []);

    useEffect(() => {
        const handleResize = () => setViewportHeight(window.innerHeight);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleBrush = ({ start, end }: BrushSelection) => {
        setXExtents(normalizeBrushExtents(start, end));
    };

    const handleResetView = () => {
        setXExtents(initialExtents);
    };

    const resolvedChartWidth = chartWidth || Math.max(320, Math.floor(window.innerWidth * 0.92));
    const chartHeight = Math.max(420, Math.min(560, Math.round(viewportHeight * 0.58)));
    const margin = { left: 60, right: 70, top: 18, bottom: 36 };
    const plotHeight = chartHeight - margin.top - margin.bottom;
    const priceHeight = Math.round(plotHeight * 0.78);
    const overviewHeight = plotHeight - priceHeight;
    const gridWidth = Math.max(0, resolvedChartWidth - margin.left - margin.right);

    const topXAxisTheme = {
        ...axisTheme,
        outerTickSize: 0,
        showTicks: false,
    };

    const priceYAxisTheme = {
        ...axisTheme,
        innerTickSize: -gridWidth,
        tickStrokeOpacity: 0.08,
    };

    const overviewOrigin = createOrigin(overviewHeight);

    return (
        <main className="demo-page">
            <div className="demo-frame">
                <section className="demo-chart-card">
                    <header className="demo-chart-card__header">
                        <div>
                            <h1 className="demo-chart-card__title">Biểu đồ nến BTC/USD</h1>
                            <p className="demo-chart-card__meta">
                                Candlestick, EMA 20/50, zoom bằng scroll, pan bằng drag và brush span ở panel dưới.
                            </p>
                        </div>
                        <span className="source-chip source-chip--accent">Kéo dải dưới để zoom span</span>
                    </header>

                    <div className="chart-shell">
                        <div className="chart-surface" ref={chartSurfaceRef}>
                            {resolvedChartWidth > 0 ? (
                                <ChartCanvas
                                    height={chartHeight}
                                    width={resolvedChartWidth}
                                    margin={margin}
                                    type="hybrid"
                                    seriesName="BTCUSD-simple"
                                    data={chartData}
                                    xScale={scaleTime()}
                                    xAccessor={(datum: DemoDatum) => datum.date}
                                    displayXAccessor={(datum: DemoDatum) => datum.date}
                                    xExtents={xExtents}
                                    ratio={window.devicePixelRatio || 1}
                                    mouseMoveEvent
                                    panEvent
                                    zoomEvent
                                    useCrossHairStyleCursor
                                >
                                    <Chart id={1} height={priceHeight} yExtents={[(datum: DemoDatum) => [datum.high, datum.low], (datum: DemoDatum) => datum.ema20, (datum: DemoDatum) => datum.ema50]} padding={{ top: 12, bottom: 18 }}>
                                        <XAxis axisAt="bottom" orient="bottom" {...topXAxisTheme} />
                                        <YAxis axisAt="right" orient="right" ticks={6} {...priceYAxisTheme} tickFormat={priceFormat} />
                                        <CandlestickSeries
                                            fill={(datum: DemoDatum) => (datum.close >= datum.open ? bullishColor : bearishColor)}
                                            stroke="rgba(15, 23, 42, 0.9)"
                                            wickStroke="rgba(226, 232, 240, 0.78)"
                                        />
                                        <LineSeries yAccessor={(datum: DemoDatum) => datum.ema20} stroke={ema20Stroke} />
                                        <LineSeries yAccessor={(datum: DemoDatum) => datum.ema50} stroke={ema50Stroke} />
                                        <CurrentCoordinate yAccessor={(datum: DemoDatum) => datum.ema20} fill={ema20Stroke} />
                                        <CurrentCoordinate yAccessor={(datum: DemoDatum) => datum.ema50} fill={ema50Stroke} />
                                        <EdgeIndicator
                                            itemType="last"
                                            orient="right"
                                            edgeAt="right"
                                            yAccessor={(datum: DemoDatum) => datum.close}
                                            fill={(datum: DemoDatum) => (datum.close >= datum.open ? "#065f46" : "#991b1b")}
                                            lineStroke={(datum: DemoDatum) => (datum.close >= datum.open ? "#14532d" : "#7f1d1d")}
                                            textFill="#f8fafc"
                                        />
                                        <OHLCTooltip origin={[12, 12]} xDisplayFormat={dateFormat} volumeFormat={volumeFormat} textFill="#f8fafc" labelFill="#cbd5e1" />
                                        <MouseCoordinateY {...coordinateTheme} at="right" orient="right" displayFormat={priceFormat} />
                                        <ZoomButtons
                                            onReset={handleResetView}
                                            size={[28, 24]}
                                            heightFromBase={48}
                                            fill="rgba(15, 23, 42, 0.88)"
                                            fillOpacity={1}
                                            stroke="rgba(148, 163, 184, 0.28)"
                                            strokeWidth={1}
                                            textFill="#e2e8f0"
                                            textStrokeWidth={0}
                                        />
                                    </Chart>

                                    <Chart id={2} height={overviewHeight} origin={overviewOrigin} yExtents={(datum: DemoDatum) => datum.close} padding={{ top: 6, bottom: 6 }}>
                                        <XAxis axisAt="bottom" orient="bottom" {...axisTheme} />
                                        <LineSeries yAccessor={(datum: DemoDatum) => datum.close} stroke="#67e8f9" />
                                        <Brush
                                            enabled={true}
                                            type="2D"
                                            onStart={() => {}}
                                            onBrush={handleBrush}
                                            stroke="#22d3ee"
                                            fill="rgba(34, 211, 238, 0.20)"
                                            strokeOpacity={1}
                                            fillOpacity={0.2}
                                            strokeDashArray="ShortDash"
                                        />
                                        <MouseCoordinateX {...coordinateTheme} at="bottom" orient="bottom" displayFormat={dateFormat} />
                                    </Chart>

                                    <CrossHairCursor stroke="#e2e8f0" opacity={0.16} strokeDasharray="ShortDash" />
                                </ChartCanvas>
                            ) : (
                                <div className="chart-placeholder">Đang khởi tạo khung biểu đồ...</div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default SimpleDemo;