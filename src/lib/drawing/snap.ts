import { chartPointToPixel, type ChartScales, type PlotDatum } from "./coordinateUtils";
import type { DrawingObject, Point } from "./types";

// CE19-03: Magnet sensitivity levels
export type MagnetSensitivity = "weak" | "normal" | "strong";

export const MAGNET_TOLERANCE: Record<MagnetSensitivity, number> = {
	weak: 5,
	normal: 10,
	strong: 20,
} as const;

export type SnapType = "ohlc" | "intersection" | "endpoint" | "midpoint" | "grid";

export interface SnapResult {
	chartPoint: Point;
	pixelPoint: Point;
	snapType: SnapType;
}

type SnapCandidate = SnapResult & {
	distance: number;
};

type Segment = {
	drawingId: string;
	segmentIndex: number;
	startChart: Point;
	endChart: Point;
	startPixel: Point;
	endPixel: Point;
};

type ScaleTickValue = Date | number;

const SNAP_PRIORITY: SnapType[] = ["ohlc", "intersection", "endpoint", "midpoint", "grid"];
const STRUCTURAL_TOLERANCE_MULTIPLIER = 1.5;
const GRID_TICK_COUNT = 8;
const INTERSECTION_ENDPOINT_EPSILON = 0.5;

function toDate(value: Date | number) {
	return value instanceof Date ? value : new Date(value);
}

function isFinitePoint(point: Point) {
	return Number.isFinite(point.x) && Number.isFinite(point.y);
}

function chartPointFromPixel(pixelPoint: Point, scales: ChartScales): Point | null {
	const xValue = scales.xScaleInvert(pixelPoint.x) as Date | number;
	const yValue = scales.yScaleInvert(pixelPoint.y);
	const x = xValue instanceof Date ? xValue.getTime() : Number(xValue);
	if (!Number.isFinite(x) || !Number.isFinite(yValue)) {
		return null;
	}

	return {
		x,
		y: yValue,
	};
}

function makeCandidate(
	snapType: SnapType,
	chartPoint: Point,
	pixelPoint: Point,
	mouseX: number,
	mouseY: number,
): SnapCandidate {
	return {
		chartPoint,
		pixelPoint,
		snapType,
		distance: Math.hypot(mouseX - pixelPoint.x, mouseY - pixelPoint.y),
	};
}

function isBetterCandidate(current: SnapCandidate | null, next: SnapCandidate | null) {
	if (!next) {
		return current;
	}

	if (!current || next.distance < current.distance) {
		return next;
	}

	return current;
}

function getDatumDate(datum: PlotDatum, scales: ChartScales) {
	const xAccessor = scales.xAccessor;
	const value = xAccessor ? xAccessor(datum) : datum.date;
	return toDate(value);
}

function findNearestBar(mouseX: number, scales: ChartScales, plotData: PlotDatum[], xTolerance: number) {
	let best: { datum: PlotDatum; pixelX: number; distance: number } | null = null;

	for (const datum of plotData) {
		const date = getDatumDate(datum, scales);
		if (!Number.isFinite(date.getTime())) {
			continue;
		}

		const pixelX = scales.xScale(date);
		const distance = Math.abs(mouseX - pixelX);
		if (distance <= xTolerance && (!best || distance < best.distance)) {
			best = { datum, pixelX, distance };
		}
	}

	return best;
}

function pickEndpointSnap(
	mouseX: number,
	mouseY: number,
	scales: ChartScales,
	existingDrawings: DrawingObject[],
	tolerance: number,
) {
	let best: SnapResult | null = null;
	let bestDistance = Number.POSITIVE_INFINITY;

	for (const drawing of existingDrawings) {
		if (drawing.visible === false) {
			continue;
		}

		for (const point of drawing.points) {
			const pixelPoint = chartPointToPixel(point, scales);
			const distance = Math.hypot(mouseX - pixelPoint.x, mouseY - pixelPoint.y);
			if (distance <= tolerance && distance < bestDistance) {
				bestDistance = distance;
				best = {
					chartPoint: { x: point.x, y: point.y },
					pixelPoint,
					snapType: "endpoint",
				};
			}
		}
	}

	return best;
}

function getVisibleDrawings(existingDrawings: readonly DrawingObject[]) {
	return existingDrawings.filter((drawing) => drawing.visible !== false);
}

function getDrawingSegments(drawing: DrawingObject, scales: ChartScales): Segment[] {
	const points = drawing.points.filter(isFinitePoint);
	if (points.length < 2) {
		return [];
	}

	const segments: Segment[] = [];
	for (let index = 1; index < points.length; index += 1) {
		const startChart = points[index - 1];
		const endChart = points[index];
		if (startChart.x === endChart.x && startChart.y === endChart.y) {
			continue;
		}

		segments.push({
			drawingId: drawing.id,
			segmentIndex: index - 1,
			startChart,
			endChart,
			startPixel: chartPointToPixel(startChart, scales),
			endPixel: chartPointToPixel(endChart, scales),
		});
	}

	return segments;
}

function segmentBoundingBox(segment: Segment) {
	return {
		minX: Math.min(segment.startPixel.x, segment.endPixel.x),
		maxX: Math.max(segment.startPixel.x, segment.endPixel.x),
		minY: Math.min(segment.startPixel.y, segment.endPixel.y),
		maxY: Math.max(segment.startPixel.y, segment.endPixel.y),
	};
}

function bboxContainsPoint(bbox: ReturnType<typeof segmentBoundingBox>, x: number, y: number, padding = 0) {
	return x >= bbox.minX - padding && x <= bbox.maxX + padding && y >= bbox.minY - padding && y <= bbox.maxY + padding;
}

function segmentIntersection(a: Point, b: Point, c: Point, d: Point): Point | null {
	const r = { x: b.x - a.x, y: b.y - a.y };
	const s = { x: d.x - c.x, y: d.y - c.y };
	const denominator = r.x * s.y - r.y * s.x;
	if (Math.abs(denominator) < 1e-9) {
		return null;
	}

	const delta = { x: c.x - a.x, y: c.y - a.y };
	const t = (delta.x * s.y - delta.y * s.x) / denominator;
	const u = (delta.x * r.y - delta.y * r.x) / denominator;
	if (t < 0 || t > 1 || u < 0 || u > 1) {
		return null;
	}

	return {
		x: a.x + t * r.x,
		y: a.y + t * r.y,
	};
}

function pointNearSegmentEndpoint(point: Point, segment: Segment, epsilon = INTERSECTION_ENDPOINT_EPSILON) {
	return Math.hypot(point.x - segment.startPixel.x, point.y - segment.startPixel.y) <= epsilon
		|| Math.hypot(point.x - segment.endPixel.x, point.y - segment.endPixel.y) <= epsilon;
}

function collectAnchorSnap(
	mouseX: number,
	mouseY: number,
	scales: ChartScales,
	drawings: readonly DrawingObject[],
	tolerance: number,
	snapType: "endpoint" | "midpoint",
): SnapCandidate | null {
	let best: SnapCandidate | null = null;
	const structuralTolerance = tolerance * STRUCTURAL_TOLERANCE_MULTIPLIER;

	for (const drawing of drawings) {
		if (snapType === "endpoint") {
			for (const point of drawing.points) {
				if (!isFinitePoint(point)) {
					continue;
				}

				const pixelPoint = chartPointToPixel(point, scales);
				const candidate = makeCandidate(snapType, point, pixelPoint, mouseX, mouseY);
				if (candidate.distance <= structuralTolerance) {
					best = isBetterCandidate(best, candidate);
				}
			}
			continue;
		}

		for (const segment of getDrawingSegments(drawing, scales)) {
			const pixelPoint = {
				x: (segment.startPixel.x + segment.endPixel.x) / 2,
				y: (segment.startPixel.y + segment.endPixel.y) / 2,
			};
			const chartPoint = chartPointFromPixel(pixelPoint, scales);
			if (!chartPoint) {
				continue;
			}

			const candidate = makeCandidate(snapType, chartPoint, pixelPoint, mouseX, mouseY);
			if (candidate.distance <= structuralTolerance) {
				best = isBetterCandidate(best, candidate);
			}
		}
	}

	return best;
}

function collectIntersectionSnap(
	mouseX: number,
	mouseY: number,
	scales: ChartScales,
	drawings: readonly DrawingObject[],
	tolerance: number,
): SnapCandidate | null {
	const segments = drawings.flatMap((drawing) => getDrawingSegments(drawing, scales));
	const nearbySegments = segments.filter((segment) => bboxContainsPoint(segmentBoundingBox(segment), mouseX, mouseY, tolerance));
	let best: SnapCandidate | null = null;

	for (let index = 0; index < nearbySegments.length; index += 1) {
		const left = nearbySegments[index];
		for (let otherIndex = index + 1; otherIndex < nearbySegments.length; otherIndex += 1) {
			const right = nearbySegments[otherIndex];
			if (left.drawingId === right.drawingId && Math.abs(left.segmentIndex - right.segmentIndex) <= 1) {
				continue;
			}

			const pixelPoint = segmentIntersection(left.startPixel, left.endPixel, right.startPixel, right.endPixel);
			if (!pixelPoint) {
				continue;
			}

			if (pointNearSegmentEndpoint(pixelPoint, left) || pointNearSegmentEndpoint(pixelPoint, right)) {
				continue;
			}

			const chartPoint = chartPointFromPixel(pixelPoint, scales);
			if (!chartPoint) {
				continue;
			}

			const candidate = makeCandidate("intersection", chartPoint, pixelPoint, mouseX, mouseY);
			if (candidate.distance <= tolerance) {
				best = isBetterCandidate(best, candidate);
			}
		}
	}

	return best;
}

function getScaleTicks(scale: { ticks?: (...args: any[]) => unknown[] }, tickCount: number): unknown[] {
	if (typeof scale.ticks !== "function") {
		return [];
	}

	return scale.ticks(tickCount);
}

function resolveXTickPoint(scale: any, tick: unknown) {
	if (tick instanceof Date) {
		const pixelX = scale(tick);
		if (!Number.isFinite(pixelX)) {
			return null;
		}

		return {
			chartX: tick.getTime(),
			pixelX,
		};
	}

	if (typeof tick === "number") {
		const pixelX = scale(tick);
		if (!Number.isFinite(pixelX)) {
			return null;
		}

		const resolvedDate = typeof scale.value === "function" ? scale.value(tick) : undefined;
		return {
			chartX: resolvedDate instanceof Date ? resolvedDate.getTime() : tick,
			pixelX,
		};
	}

	return null;
}

function resolveYTickPoint(scale: any, tick: unknown) {
	const chartY = Number(tick);
	if (!Number.isFinite(chartY)) {
		return null;
	}

	const pixelY = scale(chartY);
	if (!Number.isFinite(pixelY)) {
		return null;
	}

	return {
		chartY,
		pixelY,
	};
}

function collectGridSnap(mouseX: number, mouseY: number, scales: ChartScales, tolerance: number): SnapCandidate | null {
	const xScale = scales.xScale as any;
	const yScale = scales.yScale as any;
	const xTicks = getScaleTicks(xScale, GRID_TICK_COUNT);
	const yTicks = getScaleTicks(yScale, GRID_TICK_COUNT);

	let bestX: { chartX: number; pixelX: number; distance: number } | null = null;
	for (const tick of xTicks) {
		const point = resolveXTickPoint(xScale, tick);
		if (!point) {
			continue;
		}

		const distance = Math.abs(mouseX - point.pixelX);
		if (!bestX || distance < bestX.distance) {
			bestX = { ...point, distance };
		}
	}

	let bestY: { chartY: number; pixelY: number; distance: number } | null = null;
	for (const tick of yTicks) {
		const point = resolveYTickPoint(yScale, tick);
		if (!point) {
			continue;
		}

		const distance = Math.abs(mouseY - point.pixelY);
		if (!bestY || distance < bestY.distance) {
			bestY = { ...point, distance };
		}
	}

	if (!bestX || !bestY) {
		return null;
	}

	const pixelPoint = {
		x: bestX.pixelX,
		y: bestY.pixelY,
	};
	const distance = Math.hypot(mouseX - pixelPoint.x, mouseY - pixelPoint.y);
	if (distance > tolerance * STRUCTURAL_TOLERANCE_MULTIPLIER) {
		return null;
	}

	return {
		chartPoint: {
			x: bestX.chartX,
			y: bestY.chartY,
		},
		pixelPoint,
		snapType: "grid",
		distance,
	};
}

function pickOhlcSnap(mouseX: number, mouseY: number, scales: ChartScales, plotData: PlotDatum[], tolerance: number) {
	const nearestBar = findNearestBar(mouseX, scales, plotData, 20);
	if (!nearestBar) {
		return null;
	}

	const date = getDatumDate(nearestBar.datum, scales);
	const candidates: Array<{ price: number }> = [
		{ price: Number(nearestBar.datum.high) },
		{ price: Number(nearestBar.datum.low) },
		{ price: Number(nearestBar.datum.open) },
		{ price: Number(nearestBar.datum.close) },
	];

	let best: SnapCandidate | null = null;
	for (const candidate of candidates) {
		if (!Number.isFinite(candidate.price)) {
			continue;
		}

		const pixelPoint = {
			x: nearestBar.pixelX,
			y: scales.yScale(candidate.price),
		};
		const chartPoint = {
			x: date.getTime(),
			y: candidate.price,
		};
		const nextCandidate = makeCandidate("ohlc", chartPoint, pixelPoint, mouseX, mouseY);
		if (nextCandidate.distance <= tolerance) {
			best = isBetterCandidate(best, nextCandidate);
		}
	}

	return best;
}

export function findSnapPoint(
	mouseX: number,
	mouseY: number,
	scales: ChartScales,
	plotData: PlotDatum[],
	existingDrawings: DrawingObject[],
	tolerance = 8,
): SnapResult | null {
	const visibleDrawings = getVisibleDrawings(existingDrawings);
	const pickers: Array<() => SnapCandidate | null> = [
		() => pickOhlcSnap(mouseX, mouseY, scales, plotData, tolerance),
		() => collectIntersectionSnap(mouseX, mouseY, scales, visibleDrawings, tolerance),
		() => collectAnchorSnap(mouseX, mouseY, scales, visibleDrawings, tolerance, "endpoint"),
		() => collectAnchorSnap(mouseX, mouseY, scales, visibleDrawings, tolerance, "midpoint"),
		() => collectGridSnap(mouseX, mouseY, scales, tolerance),
	];

	for (const pick of pickers) {
		const candidate = pick();
		if (candidate) {
			return {
				chartPoint: candidate.chartPoint,
				pixelPoint: candidate.pixelPoint,
				snapType: candidate.snapType,
			};
		}
	}

	return null;
}