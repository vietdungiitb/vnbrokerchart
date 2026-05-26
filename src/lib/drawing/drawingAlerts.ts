import type { OHLCVBar } from "../types/ohlcv";
import type { DrawingAlertConfig, DrawingAlertTrigger, DrawingObject, DrawingToolType, Point } from "./types";

export interface DrawingAlertEvent {
	drawing: DrawingObject;
	trigger: DrawingAlertTrigger;
	referencePrice: number;
	previousBar: OHLCVBar;
	bar: OHLCVBar;
	symbol?: string;
	timeframe?: string;
}

const ALERTABLE_TOOL_TYPES = new Set<DrawingToolType>([
	"trendLine",
	"hLine",
	"ray",
	"extendedLine",
]);

export function isAlertableDrawingType(type: DrawingToolType) {
	return ALERTABLE_TOOL_TYPES.has(type);
}

function interpolateLineValue(startPoint: Point, endPoint: Point, xValue: number) {
	const deltaX = endPoint.x - startPoint.x;
	if (deltaX === 0) {
		return undefined;
	}

	const ratio = (xValue - startPoint.x) / deltaX;
	return startPoint.y + (endPoint.y - startPoint.y) * ratio;
}

function resolveAlertReferencePrice(drawing: DrawingObject, barDate: Date) {
	if (!ALERTABLE_TOOL_TYPES.has(drawing.type)) {
		return undefined;
	}

	const [startPoint, endPoint] = drawing.points;
	if (!startPoint) {
		return undefined;
	}

	if (drawing.type === "hLine") {
		return startPoint.y;
	}

	if (!endPoint) {
		return undefined;
	}

	const barTime = barDate.getTime();
	const startTime = startPoint.x;
	const endTime = endPoint.x;

	if (drawing.type === "trendLine" && (barTime < Math.min(startTime, endTime) || barTime > Math.max(startTime, endTime))) {
		return undefined;
	}

	if (drawing.type === "ray") {
		const direction = endTime - startTime;
		if (direction === 0 || (barTime - startTime) * direction < 0) {
			return undefined;
		}
	}

	return interpolateLineValue(startPoint, endPoint, barTime);
}

function didTouch(referencePrice: number, previousBar: OHLCVBar, bar: OHLCVBar) {
	const currentTouches = bar.high >= referencePrice && bar.low <= referencePrice;
	if (!currentTouches) {
		return false;
	}

	const previousTouches = previousBar.high >= referencePrice && previousBar.low <= referencePrice;
	return !previousTouches;
}

function didBreak(referencePrice: number, previousBar: OHLCVBar, bar: OHLCVBar) {
	const currentBodyCrosses = (bar.open - referencePrice) * (bar.close - referencePrice) < 0;
	if (!currentBodyCrosses) {
		return false;
	}

	const previousBodyCrosses = (previousBar.open - referencePrice) * (previousBar.close - referencePrice) < 0;
	return !previousBodyCrosses;
}

function didCloseAbove(referencePrice: number, previousBar: OHLCVBar, bar: OHLCVBar) {
	return previousBar.close <= referencePrice && bar.close > referencePrice;
}

function didCloseBelow(referencePrice: number, previousBar: OHLCVBar, bar: OHLCVBar) {
	return previousBar.close >= referencePrice && bar.close < referencePrice;
}

function didTriggerAlert(trigger: DrawingAlertTrigger, referencePrice: number, previousBar: OHLCVBar, bar: OHLCVBar) {
	switch (trigger) {
		case "touch":
			return didTouch(referencePrice, previousBar, bar);
		case "break":
			return didBreak(referencePrice, previousBar, bar);
		case "closeAbove":
			return didCloseAbove(referencePrice, previousBar, bar);
		case "closeBelow":
			return didCloseBelow(referencePrice, previousBar, bar);
		default:
			return false;
	}
}

export function evaluateDrawingAlerts(
	drawings: readonly DrawingObject[],
	previousBar: OHLCVBar,
	bar: OHLCVBar,
	context?: { symbol?: string; timeframe?: string },
): DrawingAlertEvent[] {
	if (previousBar.date.getTime() > bar.date.getTime()) {
		return [];
	}

	return drawings.flatMap((drawing) => {
		const alert = drawing.alert as DrawingAlertConfig | undefined;
		if (!alert?.enabled) {
			return [];
		}

		const referencePrice = resolveAlertReferencePrice(drawing, bar.date);
		if (referencePrice === undefined || !Number.isFinite(referencePrice)) {
			return [];
		}

		if (!didTriggerAlert(alert.trigger, referencePrice, previousBar, bar)) {
			return [];
		}

		return [{
			drawing,
			trigger: alert.trigger,
			referencePrice,
			previousBar,
			bar,
			symbol: context?.symbol,
			timeframe: context?.timeframe,
		}];
	});
}
