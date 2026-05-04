import { format as d3Format } from "d3-format";
import { timeFormat } from "d3-time-format";
import Chart from "../Chart";
import { XAxis, YAxis } from "../axes";
import { CrossHairCursor, MouseCoordinateX, MouseCoordinateY } from "../coordinates";
import AreaSeries from "../series/AreaSeries";
import BarSeries from "../series/BarSeries";
import BollingerSeries from "../series/BollingerSeries";
import CandlestickSeries from "../series/CandlestickSeries";
import ElderRaySeries from "../series/ElderRaySeries";
import LineSeries from "../series/LineSeries";
import MACDSeries from "../series/MACDSeries";
import OHLCSeries from "../series/OHLCSeries";
import RSISeries from "../series/RSISeries";
import type { EnrichedDatum } from "./calculators/types";
import { getSeries } from "./registry/SeriesRegistry";
import { PaneTooltip, type PaneTooltipEntry } from "./PaneTooltip";
import type { PaneDescriptor, SeriesConfig, SeriesTypeId } from "./types/pane-descriptor";

export interface DynamicChartProps {
	panes: readonly PaneDescriptor[];
	heights: readonly number[];
	data: readonly EnrichedDatum[];
	axisStroke: string;
	axisTickFill: string;
	isDark: boolean;
	dateFormat?: (date: Date) => string;
	priceFormat?: (value: number) => string;
	volumeFormat?: (value: number) => string;
	className?: string;
}

interface ChartSlot {
	series: SeriesConfig[];
	accessors: Array<(datum: EnrichedDatum) => number | undefined>;
	tooltipEntries: PaneTooltipEntry[];
	hasLeftAxis: boolean;
	hasRightAxis: boolean;
	tooltipMode: PaneDescriptor["tooltip"];
	axisFormat: (value: number) => string;
	seriesTypes: SeriesTypeId[];
}

function finiteExtent(values: readonly number[]): [number, number] {
	const finiteValues = values.filter((value) => Number.isFinite(value));
	if (finiteValues.length === 0) {
		return [0, 1];
	}
	const minValue = Math.min(...finiteValues);
	const maxValue = Math.max(...finiteValues);
	if (minValue === maxValue) {
		return [minValue - 1, maxValue + 1];
	}
	return [minValue, maxValue];
}

function firstSeriesParam(series: SeriesConfig, key: string, fallback: number) {
	const value = series.params?.[key];
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Gap (px) added at the top of each non-first pane to visually separate charts. */
const INNER_PANE_GAP = 10;

const PRICE_SERIES: SeriesTypeId[] = ["Candlestick", "HollowCandle", "OHLC", "HeikinAshi", "Line", "Area", "Bar"];
const VOLUME_SERIES: SeriesTypeId[] = ["Volume", "Whale", "CVDApprox", "CVDRealtime"];
const OSCILLATOR_SERIES: SeriesTypeId[] = ["RSI", "StrengthRelative"];

function axisFormatForSeriesTypes(types: SeriesTypeId[]): (v: number) => string {
	if (types.some((t) => VOLUME_SERIES.includes(t))) return d3Format(".3s");
	if (types.some((t) => OSCILLATOR_SERIES.includes(t))) return d3Format(".0f");
	if (types.some((t) => t === "MACD" || t === "StrengthElder")) return d3Format(".1f");
	if (types.some((t) => PRICE_SERIES.includes(t))) return d3Format(",.0f");
	return d3Format(".4s");
}

function extractSeriesValue(datum: EnrichedDatum, seriesType: SeriesTypeId, series: SeriesConfig): number | undefined {
	switch (seriesType) {
		case "Candlestick":
		case "HollowCandle":
		case "OHLC":
		case "HeikinAshi":
			return datum.close;
		case "Line":
		case "Area":
		case "Bar":
			return datum.close;
		case "Volume":
			return datum.volume;
		case "EMA": {
			const period = firstSeriesParam(series, "period", 20);
			if (period >= 50) return datum.ema50 ?? datum.ema20 ?? datum.close;
			if (period >= 20) return datum.ema20 ?? datum.ema50 ?? datum.close;
			return datum.ema13 ?? datum.close;
		}
		case "CVDApprox":
			return datum.cvdApprox;
		case "CVDRealtime":
			return datum.cvdRealtime;
		case "RSI":
			return datum.rsi;
		case "MACD":
			return datum.macd?.macd;
		case "StrengthRelative":
			return datum.strengthRelative;
		case "Whale":
			return datum.whaleBuyVol ?? datum.whaleSellVol;
		default:
			return datum.close;
	}
}

function buildTooltipEntriesForSeries(series: SeriesConfig[]): PaneTooltipEntry[] {
	return series.flatMap((item) => {
		const entry = getSeries(item.type);
		const tooltip = entry.tooltipEntry(item);
		return {
			label: tooltip.label,
			color: tooltip.color,
			format: tooltip.format,
			value: tooltip.accessor,
		} satisfies PaneTooltipEntry;
	});
}

function buildPriceTooltipEntries(priceFormat: (value: number) => string, volumeFormat: (value: number) => string): PaneTooltipEntry[] {
	return [
		{ label: "O", format: priceFormat, value: (d) => d.open },
		{ label: "H", format: priceFormat, value: (d) => d.high },
		{ label: "L", format: priceFormat, value: (d) => d.low },
		{ label: "C", format: priceFormat, value: (d) => d.close },
		{ label: "Vol", format: volumeFormat, value: (d) => d.volume },
	];
}

export function buildChartSlots(pane: PaneDescriptor): ChartSlot[] {
	if (!pane.splitScale) {
		const seriesTypes = pane.series.map((series) => series.type);
		const hasLeftAxis = pane.series.some((series) => series.yAxis === "left");
		const hasRightAxis = pane.series.some((series) => series.yAxis === "right");
		return [{
			series: pane.series,
			accessors: pane.series.flatMap((series) => getSeries(series.type).yExtentsAccessors),
			tooltipEntries: buildTooltipEntriesForSeries(pane.series),
			hasLeftAxis,
			hasRightAxis,
			tooltipMode: pane.tooltip,
			axisFormat: axisFormatForSeriesTypes(seriesTypes),
			seriesTypes,
		}];
	}

	const leftSeries = pane.series.filter((series) => series.yAxis === "left");
	const rightSeries = pane.series.filter((series) => series.yAxis === "right");
	const slots: ChartSlot[] = [];

	if (leftSeries.length > 0) {
		const seriesTypes = leftSeries.map((s) => s.type);
		slots.push({
			series: leftSeries,
			accessors: leftSeries.flatMap((series) => getSeries(series.type).yExtentsAccessors),
			tooltipEntries: buildTooltipEntriesForSeries(leftSeries),
			hasLeftAxis: true,
			hasRightAxis: false,
			tooltipMode: pane.tooltip,
			axisFormat: axisFormatForSeriesTypes(seriesTypes),
			seriesTypes,
		});
	}

	if (rightSeries.length > 0) {
		const seriesTypes = rightSeries.map((s) => s.type);
		slots.push({
			series: rightSeries,
			accessors: rightSeries.flatMap((series) => getSeries(series.type).yExtentsAccessors),
			tooltipEntries: buildTooltipEntriesForSeries(rightSeries),
			hasLeftAxis: false,
			hasRightAxis: true,
			tooltipMode: pane.tooltip,
			axisFormat: axisFormatForSeriesTypes(seriesTypes),
			seriesTypes,
		});
	}

	return slots;
}

// Only true histogram-from-zero series need 0 anchored in the y-domain.
// "Bar" (price bar chart) uses close price and must NOT be included here —
// anchoring to 0 causes y-axis 0→80k and full-height bars on the price pane.
const BAR_SERIES_TYPES: SeriesTypeId[] = ["Volume", "Whale"];

function buildYExtents(slot: ChartSlot) {
	const accessors = slot.accessors.length > 0 ? slot.accessors : [(_: EnrichedDatum) => _.close as number | undefined];
	// Bar series draw from y=0 upward — yExtents must include 0 so the baseline anchors correctly
	if (slot.seriesTypes.some((t) => BAR_SERIES_TYPES.includes(t))) {
		return [(_: EnrichedDatum) => 0 as number | undefined, ...accessors];
	}
	return accessors;
}

function candleBodyWidth(
	props: { widthRatio?: number },
	moreProps: {
		xScale: (value: Date) => number;
		xAccessor: (datum: EnrichedDatum) => Date;
		plotData: EnrichedDatum[];
	},
) {
	const ratio = props.widthRatio ?? 0.8;
	if (moreProps.plotData.length < 2) return 6;

	const first = moreProps.xAccessor(moreProps.plotData[0]);
	const second = moreProps.xAccessor(moreProps.plotData[1]);
	const stepPx = Math.abs(moreProps.xScale(second) - moreProps.xScale(first));

	if (!Number.isFinite(stepPx) || stepPx <= 0) return 6;
	return Math.max(3, stepPx * ratio);
}

function renderSeries(series: SeriesConfig) {
	const type = series.type;
	const entry = getSeries(type);
	const params = { ...entry.defaultParams, ...series.params };

	const lineColor = series.color ?? String(params.color ?? "#2962ff");
	const fillColor = series.color ?? String(params.fill ?? lineColor);
	const upColor = String(params.upColor ?? "#089981");
	const downColor = String(params.downColor ?? "#f23645");

	const accessor = (datum: EnrichedDatum) => extractSeriesValue(datum, type, series);

	switch (type) {
		case "Candlestick":
		case "HeikinAshi":
			return (
				<CandlestickSeries
					key={type}
					width={candleBodyWidth}
					yAccessor={(datum: EnrichedDatum) => datum as any}
						fill={((datum: EnrichedDatum) => (datum.close >= datum.open ? upColor : downColor)) as any}
						stroke={((datum: EnrichedDatum) => (datum.close >= datum.open ? upColor : downColor)) as any}
						wickStroke={((datum: EnrichedDatum) => (datum.close >= datum.open ? upColor : downColor)) as any}
				/>
			);
			case "HollowCandle":
				return (
					<CandlestickSeries
						key={type}
						width={candleBodyWidth}
						yAccessor={(datum: EnrichedDatum) => datum as any}
						fill={((datum: EnrichedDatum) => (datum.close >= datum.open ? "transparent" : downColor)) as any}
						stroke={((datum: EnrichedDatum) => (datum.close >= datum.open ? upColor : downColor)) as any}
						wickStroke={((datum: EnrichedDatum) => (datum.close >= datum.open ? upColor : downColor)) as any}
					/>
				);
		case "OHLC":
				return <OHLCSeries key={type} stroke={(datum: EnrichedDatum) => (datum.close >= datum.open ? upColor : downColor)} />;
		case "Line":
		case "EMA":
		case "CVDApprox":
		case "CVDRealtime":
		case "StrengthRelative":
			return (
				<LineSeries
					key={`${type}-${series.params?.period ?? ""}`}
					yAccessor={accessor as any}
					stroke={lineColor}
					strokeWidth={series.overlay ? 1.5 : 1.2}
				/>
			);
		case "Area":
			return (
				<AreaSeries
					key={type}
					yAccessor={accessor as any}
					stroke={lineColor}
					fill={fillColor}
					strokeWidth={1.2}
				/>
			);
		case "Bar":
		case "Volume":
		case "Whale":
			return (
				<BarSeries
					key={type}
					width={candleBodyWidth}
					yAccessor={(datum: EnrichedDatum) => {
						if (type === "Whale") {
							return datum.whaleBuyVol ?? (datum.whaleSellVol ? -datum.whaleSellVol : undefined);
						}
						return accessor(datum) as number | undefined;
					}}
					fill={(datum: EnrichedDatum) => (datum.close >= datum.open ? upColor : downColor)}
					opacity={type === "Volume" ? 0.75 : 0.6}
				/>
			);
		case "BollingerBand":
			return (
				<BollingerSeries
					key={type}
					yAccessor={(datum: EnrichedDatum) => datum.bollingerBand}
					stroke={{ top: lineColor, middle: fillColor, bottom: lineColor }}
					fill={fillColor}
				/>
			);
		case "RSI":
			return <RSISeries key={type} yAccessor={(datum: EnrichedDatum) => datum.rsi} />;
		case "MACD":
			return <MACDSeries key={type} yAccessor={(datum: EnrichedDatum) => datum.macd} />;
		case "StrengthElder":
			return <ElderRaySeries key={type} yAccessor={(datum: EnrichedDatum) => ({ bullPower: datum.bullPower, bearPower: datum.bearPower })} />;
		default:
			return <LineSeries key={type} yAccessor={accessor as any} stroke={lineColor} />;
	}
}

export function DynamicChart({
	panes,
	heights,
	data,
	axisStroke,
	axisTickFill,
	isDark,
	dateFormat = timeFormat("%Y-%m-%d"),
	priceFormat = d3Format(".2f"),
	volumeFormat = d3Format(".3s"),
	className,
}: DynamicChartProps) {
	const chartSlots = panes.flatMap((pane) => buildChartSlots(pane).map((slot) => ({ pane, slot })));
	let chartId = 1;
	// Track how many slots have been rendered per pane (for tooltip y-stagger in splitScale panes)
	const paneSlotCounter = new Map<string, number>();

	return chartSlots.flatMap(({ pane, slot }, index) => {
		const paneIndex = panes.findIndex((item) => item.id === pane.id);
		const slotInPane = paneSlotCounter.get(pane.id) ?? 0;
		paneSlotCounter.set(pane.id, slotInPane + 1);

		const isInnerPane = paneIndex > 0;
		// Inner panes get a small top gap so charts don't visually merge at splitter lines
		const gap = isInnerPane ? INNER_PANE_GAP : 0;
		const origin = (_w: number, h: number) => [
			0,
			h - heights.slice(paneIndex).reduce((sum, value) => sum + value, 0) + gap,
		];
		const paneHeight = (heights[paneIndex] ?? 0) - gap;
		const hasBottomAxis = paneIndex === panes.length - 1 && index >= 0;
		const isLastSlot = index === chartSlots.length - 1;
		const yExtents = buildYExtents(slot);
		const yAxisFormat = slot.axisFormat;
		// Tooltip: first slot of each pane sits just below the gap/splitter (y=4).
		// Subsequent slots in the same pane (splitScale) are staggered down 20px each
		// so their labels don't overlap.
		const tooltipY = 4 + slotInPane * 20;

		return [
			(
				<Chart
					key={`${pane.id}-${index}`}
					id={chartId++}
					height={paneHeight}
					origin={origin}
					yExtents={yExtents}
					className={className}
				>
					{slot.hasLeftAxis ? <YAxis axisAt="left" orient="left" ticks={5} stroke={axisStroke} tickLabelFill={axisTickFill} tickStroke={axisStroke} tickFormat={yAxisFormat as any} /> : null}
					{slot.hasRightAxis ? <YAxis axisAt="right" orient="right" ticks={5} stroke={axisStroke} tickLabelFill={axisTickFill} tickStroke={axisStroke} tickFormat={yAxisFormat as any} /> : null}
					{pane.tooltip === "ohlc"
						? (
							<PaneTooltip
								entries={buildPriceTooltipEntries(priceFormat, volumeFormat).concat(slot.tooltipEntries)}
								xDisplayFormat={dateFormat}
								origin={[8, tooltipY]}
								labelFill={isDark ? "#d1d4dc" : "#1e2a3b"}
								textFill={isDark ? "#f8fafc" : "#1e2a3b"}
							/>
						)
						: pane.tooltip === "none"
							? null
							: <PaneTooltip entries={slot.tooltipEntries} xDisplayFormat={dateFormat} origin={[8, tooltipY]} labelFill={isDark ? "#d1d4dc" : "#1e2a3b"} textFill={isDark ? "#f8fafc" : "#1e2a3b"} />}
					{slot.series.map((series) => renderSeries(series))}
					{hasBottomAxis && slot === chartSlots[chartSlots.length - 1]?.slot ? (
					<XAxis
						axisAt="bottom"
						orient="bottom"
						showDomain={false}
						innerTickSize={0}
						outerTickSize={0}
						tickStroke="transparent"
						tickStrokeOpacity={0}
						tickStrokeWidth={0}
						stroke="transparent"
						tickLabelFill={axisTickFill}
					/>
					) : null}
					{/* MouseCoordinateX only on the last slot (bottom pane) — shows just HH:MM
					    at the crosshair position. Date context is already in the OHLC tooltip. */}
					{isLastSlot ? <MouseCoordinateX displayFormat={timeFormat("%H:%M")} /> : null}
					<MouseCoordinateY rectWidth={64} displayFormat={yAxisFormat as any} />
				</Chart>
			),
		];
	}).concat(<CrossHairCursor key="crosshair-cursor" />);
}
