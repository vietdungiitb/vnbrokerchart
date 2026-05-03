import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import ChartCanvas from "../lib/ChartCanvas";
import Chart from "../lib/Chart";
import { Brush } from "../lib/interactive";
import ZoomButtons from "../lib/ZoomButtons";
import BarSeries from "../lib/series/BarSeries";
import AreaSeries from "../lib/series/AreaSeries";
import CandlestickSeries from "../lib/series/CandlestickSeries";
import LineSeries from "../lib/series/LineSeries";
import MACDSeries from "../lib/series/MACDSeries";
import { XAxis, YAxis } from "../lib/axes";
import {
    CrossHairCursor,
    CurrentCoordinate,
    EdgeIndicator,
    MouseCoordinateX,
    MouseCoordinateY,
} from "../lib/coordinates";
import { OHLCTooltip, MovingAverageTooltip, MACDTooltip } from "../lib/tooltip";
import { discontinuousTimeScaleProvider } from "../lib/scale";
import { ema, sma, macd } from "../lib/indicator";
import { last } from "../lib/utils";
import { getOfflineDemoData, type DemoDatum, type MACDPoint } from "./demoData";
import "./demo.css";

type BrushPoint = {
    xValue: Date | number;
    yValue: number;
};

type BrushSelection = {
    start: BrushPoint;
    end: BrushPoint;
};

type OriginalLikeDatum = DemoDatum & {
    ema12?: number;
    ema26?: number;
    smaVolume10?: number;
    macd?: MACDPoint;
};

const priceFormat = format(".2f");
const volumeFormat = format(".3s");
const volumeAxisFormat = format(".2s");
const volumeMouseFormat = format(".4s");
const macdFormat = format(".2f");
const tooltipDateFormat = timeFormat("%d/%m/%Y %H:%M");
const macdDateFormat = timeFormat("%Y-%m-%d");
const themeFontFamily = '"Segoe UI Variable Text", "Aptos", "Segoe UI", sans-serif';

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

const bullishColor = "#10b981";
const bearishColor = "#ef4444";
const ema12Stroke = "#22d3ee";
const ema26Stroke = "#f59e0b";

const ema26 = (ema() as any)
    .id(0)
    .options({
        windowSize: 26,
    })
    .merge((datum: OriginalLikeDatum, value: number | undefined) => {
        datum.ema26 = value;
    })
    .accessor((datum: OriginalLikeDatum) => datum.ema26);

const ema12 = (ema() as any)
    .id(1)
    .options({
        windowSize: 12,
    })
    .merge((datum: OriginalLikeDatum, value: number | undefined) => {
        datum.ema12 = value;
    })
    .accessor((datum: OriginalLikeDatum) => datum.ema12);

const macdCalculator = (macd() as any)
    .options({
        fast: 12,
        slow: 26,
        signal: 9,
    })
    .merge((datum: OriginalLikeDatum, value: MACDPoint | undefined) => {
        datum.macd = value;
    })
    .accessor((datum: OriginalLikeDatum) => datum.macd);

const smaVolume10 = (sma() as any)
    .id(3)
    .options({
        windowSize: 10,
        sourcePath: "volume",
    })
    .merge((datum: OriginalLikeDatum, value: number | undefined) => {
        datum.smaVolume10 = value;
    })
    .accessor((datum: OriginalLikeDatum) => datum.smaVolume10);

const macdAppearance = {
    stroke: {
        macd: "#38bdf8",
        signal: "#f59e0b",
    },
    fill: {
        divergence: "#ef4444",
    },
};

const BRUSH_TYPE = "2D";

function createOrigin(offsetFromBottom: number) {
    return (_width: number, height: number) => [0, height - offsetFromBottom] as [number, number];
}

const OriginalLikeDemo = () => {
    const chartSurfaceRef = useRef<HTMLDivElement | null>(null);
    const [chartWidth, setChartWidth] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight);

    const rawData = useMemo(() => {
        return getOfflineDemoData().map((datum) => ({ ...datum })) as OriginalLikeDatum[];
    }, []);

    const calculatedData = useMemo(() => {
        return macdCalculator(smaVolume10(ema12(ema26(rawData)))) as OriginalLikeDatum[];
    }, [rawData]);

    const xScaleProvider = useMemo(() => {
        return discontinuousTimeScaleProvider.inputDateAccessor((datum: OriginalLikeDatum) => datum.date);
    }, []);

    const { data, xScale, xAccessor, displayXAccessor } = useMemo(() => {
        return xScaleProvider(calculatedData);
    }, [calculatedData, xScaleProvider]);

    const initialXExtents = useMemo<[number, number]>(() => {
        const endIndex = data.length - 1;
        const startIndex = Math.max(0, data.length - 150);
        return [xAccessor(last(data)), xAccessor(data[startIndex])] as [number, number];
    }, [data, xAccessor]);

    const [xExtents, setXExtents] = useState<[number, number]>(initialXExtents);

    useEffect(() => {
        setXExtents(initialXExtents);
    }, [initialXExtents]);

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
        const left = Math.min(start.xValue as number, end.xValue as number);
        const right = Math.max(start.xValue as number, end.xValue as number);
        setXExtents([left, right]);
    };

    const handleResetView = () => {
        setXExtents(initialXExtents);
    };

    const resolvedChartWidth = chartWidth || Math.max(960, Math.floor(window.innerWidth - 48));
    const chartHeight = 600;
    const margin = { left: 70, right: 70, top: 20, bottom: 30 };
    const priceHeight = 400;
    const volumeHeight = 150;
    const macdHeight = 150;
    const priceYAxisTheme = {
        ...axisTheme,
        innerTickSize: -(resolvedChartWidth - margin.left - margin.right),
        tickStrokeOpacity: 0.08,
    };
    const volumeYAxisTheme = {
        ...axisTheme,
        ticks: 5,
        tickFormat: volumeAxisFormat,
    };
    const macdYAxisTheme = {
        ...axisTheme,
        ticks: 2,
        tickFormat: macdFormat,
    };
    const volumeOrigin = createOrigin(300);
    const macdOrigin = createOrigin(150);

    return (
        <main className="demo-page demo-page--classic">
            <div className="demo-frame demo-frame--classic">
                <section className="demo-chart-card demo-chart-card--classic">
                    <header className="demo-chart-card__header demo-chart-card__header--classic">
                        <div>
                            <h1 className="demo-chart-card__title">React Stockcharts · bản gốc gọn</h1>
                            <p className="demo-chart-card__meta">
                                Candlestick, volume, MACD, zoom bằng scroll, pan bằng drag và brush span theo mẫu gốc.
                            </p>
                        </div>
                        <span className="source-chip source-chip--accent">Brush span + wheel zoom</span>
                    </header>

                    <div className="chart-shell chart-shell--classic">
                        <div className="chart-surface chart-surface--classic" ref={chartSurfaceRef}>
                            {resolvedChartWidth > 0 ? (
                                <ChartCanvas
                                    height={chartHeight}
                                    width={resolvedChartWidth}
                                    ratio={window.devicePixelRatio || 1}
                                    margin={margin}
                                    type="hybrid"
                                    seriesName="BTCUSD-brush-demo"
                                    data={data}
                                    xScale={xScale}
                                    xAccessor={xAccessor}
                                    displayXAccessor={displayXAccessor}
                                    xExtents={xExtents}
                                    mouseMoveEvent
                                    panEvent
                                    zoomEvent
                                    useCrossHairStyleCursor
                                >
                                    <Chart
                                        id={1}
                                        height={priceHeight}
                                        yExtents={[(datum: OriginalLikeDatum) => [datum.high, datum.low], ema26.accessor(), ema12.accessor()]}
                                        padding={{ top: 10, bottom: 20 }}
                                    >
                                        <XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
                                        <YAxis axisAt="right" orient="right" ticks={5} {...priceYAxisTheme} tickFormat={priceFormat} />
                                        <MouseCoordinateY {...coordinateTheme} at="right" orient="right" displayFormat={priceFormat} />
                                        <CandlestickSeries />
                                        <LineSeries yAccessor={ema26.accessor()} stroke={ema26Stroke} />
                                        <LineSeries yAccessor={ema12.accessor()} stroke={ema12Stroke} />
                                        <CurrentCoordinate yAccessor={ema26.accessor()} fill={ema26Stroke} />
                                        <CurrentCoordinate yAccessor={ema12.accessor()} fill={ema12Stroke} />
                                        <EdgeIndicator
                                            itemType="last"
                                            orient="right"
                                            edgeAt="right"
                                            yAccessor={(datum: OriginalLikeDatum) => datum.close}
                                            fill={(datum: OriginalLikeDatum) => (datum.close > datum.open ? "#6BA583" : "#FF0000")}
                                        />
                                        <OHLCTooltip origin={[-40, 0]} xDisplayFormat={tooltipDateFormat} volumeFormat={volumeFormat} />
                                        <MovingAverageTooltip
                                            origin={[-38, 15]}
                                            displayFormat={priceFormat}
                                            options={[
                                                {
                                                    yAccessor: ema26.accessor(),
                                                    type: ema26.type(),
                                                    stroke: ema26.stroke(),
                                                    windowSize: ema26.options().windowSize,
                                                },
                                                {
                                                    yAccessor: ema12.accessor(),
                                                    type: ema12.type(),
                                                    stroke: ema12.stroke(),
                                                    windowSize: ema12.options().windowSize,
                                                },
                                            ]}
                                        />
                                        <Brush
                                            enabled={true}
                                            type={BRUSH_TYPE}
                                            onStart={() => {}}
                                            onBrush={handleBrush}
                                        />
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

                                    <Chart id={2} height={volumeHeight} origin={volumeOrigin} yExtents={[(datum: OriginalLikeDatum) => datum.volume, smaVolume10.accessor()] }>
                                        <YAxis axisAt="left" orient="left" {...volumeYAxisTheme} />
                                        <MouseCoordinateY {...coordinateTheme} at="left" orient="left" displayFormat={volumeMouseFormat} />
                                        <BarSeries yAccessor={(datum: OriginalLikeDatum) => datum.volume} fill={(datum: OriginalLikeDatum) => (datum.close > datum.open ? "#6BA583" : "#FF0000")} />
                                        <AreaSeries yAccessor={smaVolume10.accessor()} stroke={smaVolume10.stroke()} fill={smaVolume10.fill()} />
                                    </Chart>

                                    <Chart
                                        id={3}
                                        height={macdHeight}
                                        origin={macdOrigin}
                                        yExtents={macdCalculator.accessor()}
                                        padding={{ top: 10, bottom: 10 }}
                                    >
                                        <XAxis axisAt="bottom" orient="bottom" />
                                        <YAxis axisAt="right" orient="right" {...macdYAxisTheme} />
                                        <MouseCoordinateX at="bottom" orient="bottom" displayFormat={macdDateFormat} />
                                        <MouseCoordinateY {...coordinateTheme} at="right" orient="right" displayFormat={macdFormat} />
                                        <Brush
                                            enabled={true}
                                            type={BRUSH_TYPE}
                                            onStart={() => {}}
                                            onBrush={handleBrush}
                                        />
                                        <MACDSeries yAccessor={macdCalculator.accessor()} stroke={macdAppearance.stroke} fill={macdAppearance.fill} />
                                        <MACDTooltip
                                            origin={[-38, 15]}
                                            yAccessor={macdCalculator.accessor()}
                                            options={macdCalculator.options()}
                                            appearance={macdAppearance}
                                        />
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

export default OriginalLikeDemo;
