import { getCurrentItem, getXValue } from "../utils/ChartDataUtil";
import { getClosestItem, isDefined } from "../utils";

type ChartConfigLike = {
	id?: number | string;
	yScale?: {
		invert?: (value: number) => number;
		(value: number): number;
	};
};

export interface MeasurementPoint {
	index: number;
	date: Date;
	price: number;
}

export interface MeasurementSelection {
	start: MeasurementPoint;
	end: MeasurementPoint;
}

export interface MeasurementSummary {
	bars: number;
	priceDelta: number;
	priceDeltaPercent: number | null;
}

function resolveChartConfig(moreProps: any): ChartConfigLike | undefined {
	const chartConfigList = moreProps.chartConfig;
	if (Array.isArray(chartConfigList)) {
		return chartConfigList.find((each: ChartConfigLike) => each.id === moreProps.chartId) || chartConfigList[0];
	}
	return chartConfigList;
}

function resolveMeasurementIndex(plotData: readonly unknown[], xAccessor: (datum: any) => Date | number | undefined, dateValue: Date) {
	if (plotData.length === 0) {
		return -1;
	}

	const closestItem = getClosestItem([...plotData], dateValue, xAccessor);
	if (!isDefined(closestItem)) {
		return -1;
	}

	return plotData.indexOf(closestItem);
}

export function resolveMeasurementPoint(moreProps: any, mousePosition: readonly [number, number] = moreProps.mouseXY): MeasurementPoint | undefined {
	const chartConfig = resolveChartConfig(moreProps);
	const { xScale, xAccessor, plotData } = moreProps;

	if (!chartConfig || typeof chartConfig.yScale?.invert !== "function") {
		return undefined;
	}

	if (!Array.isArray(mousePosition) || mousePosition.length < 2) {
		return undefined;
	}

	if (!Array.isArray(plotData) || plotData.length === 0 || typeof xAccessor !== "function") {
		return undefined;
	}

	const currentItem = getCurrentItem(xScale, xAccessor, mousePosition, plotData);
	const xValue = currentItem ? xAccessor(currentItem) : getXValue(xScale, xAccessor, mousePosition, plotData);
	const dateValue = xValue instanceof Date ? xValue : new Date(xValue);
	const priceValue = chartConfig.yScale.invert(mousePosition[1]);

	if (!Number.isFinite(dateValue.valueOf()) || !Number.isFinite(priceValue)) {
		return undefined;
	}

	const index = resolveMeasurementIndex(plotData, xAccessor, dateValue);
	if (index < 0) {
		return undefined;
	}

	return {
		index,
		date: dateValue,
		price: priceValue,
	};
}

export function measurementPointToPixel(point: MeasurementPoint, moreProps: any): { x: number; y: number } | undefined {
	const chartConfig = resolveChartConfig(moreProps);
	if (!chartConfig) {
		return undefined;
	}

	const { xScale } = moreProps;
	if (typeof xScale !== "function" || typeof chartConfig.yScale !== "function") {
		return undefined;
	}

	const x = xScale(point.date);
	const y = chartConfig.yScale(point.price);

	if (!Number.isFinite(x) || !Number.isFinite(y)) {
		return undefined;
	}

	return { x, y };
}

export function summarizeMeasurement(selection: MeasurementSelection): MeasurementSummary {
	const bars = Math.abs(selection.end.index - selection.start.index);
	const priceDelta = selection.end.price - selection.start.price;
	const priceDeltaPercent = selection.start.price !== 0 ? priceDelta / Math.abs(selection.start.price) : null;

	return {
		bars,
		priceDelta,
		priceDeltaPercent,
	};
}