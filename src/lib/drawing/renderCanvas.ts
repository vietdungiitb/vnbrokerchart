import { chartPointToPixel, type ChartScales, type PlotDatum } from "./coordinateUtils";
import { resolveDrawingStyle } from "./drawingStyleRegistry";
import type { DrawingObject, DrawingStyle } from "./types";
import { calculateParallelChannelGeometry } from "./builtin/parallelChannel";
import { calculatePitchforkGeometry } from "./builtin/pitchfork";
import { calculateAbcdPatternMetrics, resolveAbcdPatternFillColor, resolveAbcdPatternFillOpacity } from "./builtin/abcdPattern";
import { calculateFibArcGeometry } from "./builtin/fibArc";
import { calculateFibTimeZoneGeometry } from "./builtin/fibTimeZone";
import { calculateRegressionChannelMetrics } from "./builtin/regressionChannel";

export interface RenderCanvasOptions {
	chartWidth: number;
	chartHeight: number;
	isSelected: boolean;
	plotData?: PlotDatum[];
}

export const DEFAULT_FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618];
export const DEFAULT_FIB_EXTENSION_LEVELS = [1.272, 1.414, 1.618, 2, 2.618];

function numberFormatter(value: number) {
	return new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}

function strokeDasharrayForStyle(style: DrawingStyle): number[] {
	switch (style.strokeDasharray) {
		case "dashed":
			return [6, 4];
		case "dotted":
			return [2, 4];
		case "solid":
		case undefined:
		default:
			return [];
	}
}

function applyLineStyle(ctx: CanvasRenderingContext2D, style: DrawingStyle) {
	ctx.strokeStyle = style.stroke;
	ctx.lineWidth = style.strokeWidth;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.setLineDash(strokeDasharrayForStyle(style));
	ctx.globalAlpha = style.opacity ?? 1;
}

function toPixel(point: DrawingObject["points"][number], scales: ChartScales) {
	return chartPointToPixel(point, scales);
}

function drawSelectionHandles(
	ctx: CanvasRenderingContext2D,
	points: Array<{ x: number; y: number }>,
	color: string,
) {
	if (points.length === 0) {
		return;
	}

	ctx.save();
	ctx.globalAlpha = 1;
	ctx.setLineDash([]);
	ctx.lineWidth = 1;
	points.forEach((point) => {
		ctx.beginPath();
		ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
		ctx.fillStyle = color;
		ctx.strokeStyle = "#ffffff";
		ctx.fill();
		ctx.stroke();
	});
	ctx.restore();
}

export function clipSegmentToBox(
	start: { x: number; y: number },
	end: { x: number; y: number },
	chartWidth: number,
	chartHeight: number,
) {
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	let t0 = 0;
	let t1 = 1;

	const edges: Array<[number, number]> = [
		[-dx, start.x],
		[dx, chartWidth - start.x],
		[-dy, start.y],
		[dy, chartHeight - start.y],
	];

	for (const [p, q] of edges) {
		if (p === 0) {
			if (q < 0) {
				return null;
			}
			continue;
		}

		const r = q / p;
		if (p < 0) {
			if (r > t1) {
				return null;
			}
			if (r > t0) {
				t0 = r;
			}
		} else {
			if (r < t0) {
				return null;
			}
			if (r < t1) {
				t1 = r;
			}
		}
	}

	if (t1 < t0) {
		return null;
	}

	return [
		{ x: start.x + dx * t0, y: start.y + dy * t0 },
		{ x: start.x + dx * t1, y: start.y + dy * t1 },
	] as const;
}

function extendLineThroughBox(point: { x: number; y: number }, direction: { x: number; y: number }, chartWidth: number, chartHeight: number) {
	return clipSegmentToBox(
		{ x: point.x - direction.x * 10_000, y: point.y - direction.y * 10_000 },
		{ x: point.x + direction.x * 10_000, y: point.y + direction.y * 10_000 },
		chartWidth,
		chartHeight,
	);
}

function drawLine(
	ctx: CanvasRenderingContext2D,
	start: { x: number; y: number },
	end: { x: number; y: number },
	style: DrawingStyle,
) {
	ctx.save();
	applyLineStyle(ctx, style);
	ctx.beginPath();
	ctx.moveTo(start.x, start.y);
	ctx.lineTo(end.x, end.y);
	ctx.stroke();
	ctx.restore();
}

function drawPolyline(
	ctx: CanvasRenderingContext2D,
	points: Array<{ x: number; y: number }>,
	style: DrawingStyle,
) {
	if (points.length < 2) {
		return;
	}

	ctx.save();
	applyLineStyle(ctx, style);
	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);
	for (let index = 1; index < points.length; index += 1) {
		ctx.lineTo(points[index].x, points[index].y);
	}
	ctx.stroke();
	ctx.restore();
}

function drawTextLabel(
	ctx: CanvasRenderingContext2D,
	text: string,
	position: { x: number; y: number },
	style: DrawingStyle,
	options: {
		align?: CanvasTextAlign;
		baseline?: CanvasTextBaseline;
		weight?: number;
		fillStyle?: string;
		fontSize?: number;
	},
) {
	ctx.save();
	ctx.globalAlpha = style.opacity ?? 1;
	ctx.fillStyle = options.fillStyle ?? style.stroke;
	ctx.font = `${options.weight ? `${options.weight} ` : ""}${options.fontSize ?? style.fontSize ?? 11}px ${style.fontFamily ?? "sans-serif"}`;
	ctx.textAlign = options.align ?? "left";
	ctx.textBaseline = options.baseline ?? "alphabetic";
	ctx.fillText(text, position.x, position.y);
	ctx.restore();
}

function drawFilledRect(
	ctx: CanvasRenderingContext2D,
	rect: { x: number; y: number; width: number; height: number },
	fill: string,
	fillAlpha: number,
) {
	ctx.save();
	ctx.globalAlpha = fillAlpha;
	ctx.fillStyle = fill;
	ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
	ctx.restore();
}

function drawStrokedRect(
	ctx: CanvasRenderingContext2D,
	rect: { x: number; y: number; width: number; height: number },
	style: DrawingStyle,
) {
	ctx.save();
	applyLineStyle(ctx, style);
	ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
	ctx.restore();
}

function drawPolygonFill(
	ctx: CanvasRenderingContext2D,
	points: Array<{ x: number; y: number }>,
	fill: string,
	fillAlpha: number,
) {
	if (points.length < 3) {
		return;
	}

	ctx.save();
	ctx.globalAlpha = fillAlpha;
	ctx.fillStyle = fill;
	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);
	for (let index = 1; index < points.length; index += 1) {
		ctx.lineTo(points[index].x, points[index].y);
	}
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}

function drawTrendLine(drawing: DrawingObject, scales: ChartScales, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return;
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	drawLine(ctx, start, end, drawing.style);
	if (isSelected) {
		drawSelectionHandles(ctx, [start, end], drawing.style.stroke);
	}
}

function drawHLine(drawing: DrawingObject, scales: ChartScales, chartWidth: number, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const point = drawing.points[0];
	if (!point) {
		return;
	}

	const y = toPixel(point, scales).y;
	const left = { x: 0, y };
	const right = { x: chartWidth, y };
	drawLine(ctx, left, right, drawing.style);
	if (isSelected) {
		drawSelectionHandles(ctx, [left, right], drawing.style.stroke);
	}
}

function drawVLine(drawing: DrawingObject, scales: ChartScales, chartHeight: number, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const point = drawing.points[0];
	if (!point) {
		return;
	}

	const x = toPixel(point, scales).x;
	const top = { x, y: 0 };
	const bottom = { x, y: chartHeight };
	drawLine(ctx, top, bottom, drawing.style);
	if (isSelected) {
		drawSelectionHandles(ctx, [top, bottom], drawing.style.stroke);
	}
}

function drawFibonacci(drawing: DrawingObject, scales: ChartScales, chartWidth: number, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return;
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const levels = drawing.fibLevels ?? DEFAULT_FIB_LEVELS;
	const priceDelta = endPoint.y - startPoint.y;
	const pixelDelta = end.y - start.y;

	levels.forEach((level, index) => {
		const y = start.y + pixelDelta * level;
		const price = startPoint.y + priceDelta * level;
		drawLine(ctx, { x: 0, y }, { x: chartWidth, y }, drawing.style);
		drawTextLabel(ctx, `${(level * 100).toFixed(1)}% — ${numberFormatter(price)}`, { x: chartWidth - 6, y: y - 4 }, drawing.style, {
			align: "right",
			baseline: "alphabetic",
			fontSize: drawing.style.fontSize ?? 11,
		});
	});

	if (isSelected) {
		drawSelectionHandles(ctx, [start, end], drawing.style.stroke);
	}
}

function drawChannel(drawing: DrawingObject, scales: ChartScales, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const [startPoint, endPoint, offsetPoint] = drawing.points;
	if (!startPoint || !endPoint || !offsetPoint) {
		return;
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const offsetAnchor = toPixel(offsetPoint, scales);
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const length = Math.hypot(dx, dy);
	const offsetVector = length === 0
		? { x: offsetAnchor.x - start.x, y: offsetAnchor.y - start.y }
		: (() => {
			const normal = { x: -dy / length, y: dx / length };
			const distance = (offsetAnchor.x - start.x) * normal.x + (offsetAnchor.y - start.y) * normal.y;
			return { x: normal.x * distance, y: normal.y * distance };
		})();
	const offsetStart = { x: start.x + offsetVector.x, y: start.y + offsetVector.y };
	const offsetEnd = { x: end.x + offsetVector.x, y: end.y + offsetVector.y };
	drawLine(ctx, start, end, drawing.style);
	drawLine(ctx, offsetStart, offsetEnd, drawing.style);
	if (isSelected) {
		drawSelectionHandles(ctx, [start, end, offsetAnchor], drawing.style.stroke);
	}
}

function drawParallelChannel(drawing: DrawingObject, scales: ChartScales, chartWidth: number, chartHeight: number, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const geometry = calculateParallelChannelGeometry(drawing, scales);
	if (!geometry) {
		return;
	}

	const upper = clipSegmentToBox(
		{ x: geometry.start.x + geometry.offsetVector.x, y: geometry.start.y + geometry.offsetVector.y },
		{ x: geometry.end.x + geometry.offsetVector.x, y: geometry.end.y + geometry.offsetVector.y },
		chartWidth,
		chartHeight,
	);
	const middle = clipSegmentToBox(geometry.start, geometry.end, chartWidth, chartHeight);
	const lower = clipSegmentToBox(
		{ x: geometry.start.x - geometry.offsetVector.x, y: geometry.start.y - geometry.offsetVector.y },
		{ x: geometry.end.x - geometry.offsetVector.x, y: geometry.end.y - geometry.offsetVector.y },
		chartWidth,
		chartHeight,
	);

	if (upper) {
		drawLine(ctx, upper[0], upper[1], drawing.style);
	}
	if (middle) {
		drawLine(ctx, middle[0], middle[1], drawing.style);
	}
	if (lower) {
		drawLine(ctx, lower[0], lower[1], drawing.style);
	}

	if (isSelected) {
		drawSelectionHandles(ctx, [geometry.start, geometry.end, geometry.offsetAnchor], drawing.style.stroke);
	}
}

function drawPitchfork(drawing: DrawingObject, scales: ChartScales, chartWidth: number, chartHeight: number, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const geometry = calculatePitchforkGeometry(drawing, scales);
	if (!geometry || (geometry.direction.x === 0 && geometry.direction.y === 0)) {
		return;
	}

	const median = extendLineThroughBox(geometry.pivot, geometry.direction, chartWidth, chartHeight);
	const leftFork = extendLineThroughBox(geometry.leftSwing, geometry.direction, chartWidth, chartHeight);
	const rightFork = extendLineThroughBox(geometry.rightSwing, geometry.direction, chartWidth, chartHeight);
	if (!median || !leftFork || !rightFork) {
		return;
	}

	drawLine(ctx, median[0], median[1], drawing.style);
	drawLine(ctx, leftFork[0], leftFork[1], drawing.style);
	drawLine(ctx, rightFork[0], rightFork[1], drawing.style);
	drawTextLabel(ctx, "A", { x: geometry.pivot.x + 6, y: geometry.pivot.y - 6 }, drawing.style, { weight: 700, fontSize: drawing.style.fontSize ?? 11 });
	drawTextLabel(ctx, "B", { x: geometry.leftSwing.x + 6, y: geometry.leftSwing.y - 6 }, drawing.style, { weight: 700, fontSize: drawing.style.fontSize ?? 11 });
	drawTextLabel(ctx, "C", { x: geometry.rightSwing.x + 6, y: geometry.rightSwing.y - 6 }, drawing.style, { weight: 700, fontSize: drawing.style.fontSize ?? 11 });

	if (isSelected) {
		drawSelectionHandles(ctx, [geometry.pivot, geometry.leftSwing, geometry.rightSwing], drawing.style.stroke);
	}
}

function drawAbcdPattern(drawing: DrawingObject, scales: ChartScales, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const metrics = calculateAbcdPatternMetrics(drawing, scales);
	if (!metrics) {
		return;
	}

	const [a, b, c, d] = metrics.points;
	drawPolygonFill(ctx, [a, b, c, d], resolveAbcdPatternFillColor(drawing.style), resolveAbcdPatternFillOpacity(drawing.style) * (drawing.style.opacity ?? 1));
	drawLine(ctx, a, b, drawing.style);
	drawLine(ctx, b, c, drawing.style);
	drawLine(ctx, c, d, drawing.style);

	const badgeStyle = { weight: 700, fontSize: drawing.style.fontSize ?? 11 };
	drawTextLabel(ctx, "A", { x: a.x + 6, y: a.y - 6 }, drawing.style, badgeStyle);
	drawTextLabel(ctx, "B", { x: b.x + 6, y: b.y - 6 }, drawing.style, badgeStyle);
	drawTextLabel(ctx, "C", { x: c.x + 6, y: c.y - 6 }, drawing.style, badgeStyle);
	drawTextLabel(ctx, "D", { x: d.x + 6, y: d.y - 6 }, drawing.style, badgeStyle);

	const ratioAB = metrics.bcToAb == null ? "BC/AB n/a" : `BC/AB ${metrics.bcToAb.toFixed(2)}`;
	const ratioBC = metrics.cdToBc == null ? "CD/BC n/a" : `CD/BC ${metrics.cdToBc.toFixed(2)}`;
	drawTextLabel(ctx, ratioAB, { x: metrics.segmentMidpoints[1].x, y: metrics.segmentMidpoints[1].y - 10 }, drawing.style, {
		align: "center",
		baseline: "alphabetic",
		weight: 700,
		fontSize: drawing.style.fontSize ?? 11,
	});
	drawTextLabel(ctx, ratioBC, { x: metrics.segmentMidpoints[2].x, y: metrics.segmentMidpoints[2].y - 10 }, drawing.style, {
		align: "center",
		baseline: "alphabetic",
		weight: 700,
		fontSize: drawing.style.fontSize ?? 11,
	});

	if (isSelected) {
		drawSelectionHandles(ctx, metrics.points, drawing.style.stroke);
	}
}

function drawFibArc(drawing: DrawingObject, scales: ChartScales, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const geometry = calculateFibArcGeometry(drawing, scales);
	if (!geometry) {
		return;
	}

	geometry.radii.forEach((radius, index) => {
		ctx.save();
		applyLineStyle(ctx, drawing.style);
		ctx.beginPath();
		ctx.arc(geometry.center.x, geometry.center.y, radius, Math.PI, 0);
		ctx.stroke();
		ctx.restore();

		drawTextLabel(ctx, `${(geometry.levels[index] * 100).toFixed(1)}%`, {
			x: geometry.center.x + radius + 4,
			y: geometry.center.y - radius - 4,
		}, drawing.style, {
			baseline: "alphabetic",
			fontSize: drawing.style.fontSize ?? 11,
		});
	});

	if (isSelected) {
		drawSelectionHandles(ctx, [geometry.center, geometry.reference], drawing.style.stroke);
	}
}

function drawFibTimeZone(drawing: DrawingObject, scales: ChartScales, chartHeight: number, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const geometry = calculateFibTimeZoneGeometry(drawing, scales);
	if (!geometry) {
		return;
	}

	geometry.positions.forEach((x, index) => {
		drawLine(ctx, { x, y: 0 }, { x, y: chartHeight }, drawing.style);
		drawTextLabel(ctx, `${geometry.levels[index]}`, { x: x + 4, y: 12 }, drawing.style, {
			baseline: "alphabetic",
			fontSize: drawing.style.fontSize ?? 11,
		});
	});

	if (isSelected) {
		drawSelectionHandles(ctx, [geometry.start, geometry.end], drawing.style.stroke);
	}
}

function drawRegressionChannel(drawing: DrawingObject, scales: ChartScales, options: RenderCanvasOptions, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const metrics = calculateRegressionChannelMetrics(drawing, scales, options.plotData ?? []);
	if (!metrics) {
		return;
	}

	const fill = drawing.style.fill && drawing.style.fill !== "transparent" ? drawing.style.fill : "rgba(100,149,237,0.08)";
	const fillAlpha = (drawing.style.fillOpacity ?? 1) * (drawing.style.opacity ?? 1);
	drawPolygonFill(ctx, [
		{ x: metrics.startX, y: metrics.upperStartY },
		{ x: metrics.endX, y: metrics.upperEndY },
		{ x: metrics.endX, y: metrics.lowerEndY },
		{ x: metrics.startX, y: metrics.lowerStartY },
	], fill, fillAlpha);

	const dashedStyle: DrawingStyle = { ...drawing.style, strokeDasharray: "dashed" };
	drawLine(ctx, { x: metrics.startX, y: metrics.upperStartY }, { x: metrics.endX, y: metrics.upperEndY }, dashedStyle);
	drawLine(ctx, { x: metrics.startX, y: metrics.lowerStartY }, { x: metrics.endX, y: metrics.lowerEndY }, dashedStyle);
	drawLine(ctx, { x: metrics.startX, y: metrics.startY }, { x: metrics.endX, y: metrics.endY }, drawing.style);

	drawTextLabel(ctx, `R² ${metrics.rSquared.toFixed(2)}`, { x: metrics.endX - 4, y: Math.min(metrics.upperEndY, metrics.lowerEndY, metrics.endY) - 6 }, drawing.style, {
		align: "right",
		baseline: "alphabetic",
		weight: 700,
		fontSize: drawing.style.fontSize ?? 11,
	});

	if (isSelected) {
		const handles = drawing.points
			.filter((point): point is DrawingObject["points"][number] => Boolean(point))
			.map((point) => toPixel(point, scales));
		drawSelectionHandles(ctx, handles, drawing.style.stroke);
	}
}

function drawText(drawing: DrawingObject, scales: ChartScales, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const point = drawing.points[0];
	if (!point) {
		return;
	}

	const pixel = toPixel(point, scales);
	const text = drawing.text?.trim().length ? drawing.text : "Text";
	drawTextLabel(ctx, text, pixel, drawing.style, {
		baseline: "middle",
		fontSize: drawing.style.fontSize ?? 12,
	});

	if (isSelected) {
		drawSelectionHandles(ctx, [pixel], drawing.style.stroke);
	}
}

function drawRay(drawing: DrawingObject, scales: ChartScales, chartWidth: number, chartHeight: number, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return;
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const clipped = clipSegmentToBox(
		start,
		{ x: start.x + (end.x - start.x) * 10_000, y: start.y + (end.y - start.y) * 10_000 },
		chartWidth,
		chartHeight,
	);

	if (!clipped) {
		return;
	}

	drawLine(ctx, clipped[0], clipped[1], drawing.style);
	if (isSelected) {
		drawSelectionHandles(ctx, [clipped[0], clipped[1]], drawing.style.stroke);
	}
}

function drawExtendedLine(drawing: DrawingObject, scales: ChartScales, chartWidth: number, chartHeight: number, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return;
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const vector = { x: end.x - start.x, y: end.y - start.y };
	const clipped = clipSegmentToBox(
		{ x: start.x - vector.x * 10_000, y: start.y - vector.y * 10_000 },
		{ x: start.x + vector.x * 10_000, y: start.y + vector.y * 10_000 },
		chartWidth,
		chartHeight,
	);

	if (!clipped) {
		return;
	}

	drawLine(ctx, clipped[0], clipped[1], drawing.style);
	if (isSelected) {
		drawSelectionHandles(ctx, [clipped[0], clipped[1]], drawing.style.stroke);
	}
}

function drawPolylineTool(drawing: DrawingObject, scales: ChartScales, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	if (drawing.points.length < 2) {
		return;
	}

	const pixels = drawing.points.map((point) => toPixel(point, scales));
	drawPolyline(ctx, pixels, drawing.style);
	if (isSelected) {
		drawSelectionHandles(ctx, pixels, drawing.style.stroke);
	}
}

function drawDateAndPriceRange(drawing: DrawingObject, scales: ChartScales, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return;
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const x = Math.min(start.x, end.x);
	const y = Math.min(start.y, end.y);
	const width = Math.abs(end.x - start.x);
	const height = Math.abs(end.y - start.y);
	const percent = startPoint.y === 0 ? 0 : ((endPoint.y - startPoint.y) / Math.abs(startPoint.y)) * 100;
	const bars = Math.max(1, Math.round(Math.abs(end.x - start.x) / 6));
	const badge = `Δ ${percent >= 0 ? "+" : ""}${percent.toFixed(2)}% · ${bars} bars`;

	ctx.save();
	const fillColor = drawing.style.fill && drawing.style.fill !== "transparent" ? drawing.style.fill : drawing.style.stroke;
	ctx.globalAlpha = drawing.style.fillOpacity ?? drawing.style.opacity ?? 1;
	ctx.fillStyle = fillColor;
	ctx.fillRect(x, y, width, height);
	ctx.restore();
	drawStrokedRect(ctx, { x, y, width, height }, drawing.style);
	drawTextLabel(ctx, badge, { x: x + 8, y: y + 16 }, drawing.style, {
		weight: 700,
		fontSize: drawing.style.fontSize ?? 11,
	});

	if (isSelected) {
		drawSelectionHandles(ctx, [start, end], drawing.style.stroke);
	}
}

function drawPositionZones(drawing: DrawingObject, scales: ChartScales, mode: "long" | "short", ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return;
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const left = Math.min(start.x, end.x);
	const right = Math.max(start.x, end.x);
	const width = Math.max(0, right - left);
	const riskReward = drawing.riskReward ?? {
		entry: startPoint.y,
		stop: mode === "long" ? Math.min(startPoint.y, endPoint.y) : Math.max(startPoint.y, endPoint.y),
		target: mode === "long" ? Math.max(startPoint.y, endPoint.y) : Math.min(startPoint.y, endPoint.y),
	};

	const entryY = toPixel({ x: startPoint.x, y: riskReward.entry }, scales).y;
	const stopY = toPixel({ x: startPoint.x, y: riskReward.stop }, scales).y;
	const targetY = toPixel({ x: startPoint.x, y: riskReward.target }, scales).y;
	const reward = Math.abs(riskReward.target - riskReward.entry);
	const risk = Math.abs(riskReward.entry - riskReward.stop);
	const ratio = risk > 0 ? reward / risk : undefined;
	const badge = ratio ? `R/R 1:${ratio.toFixed(1)}` : "R/R n/a";
	const tpFill = "rgba(34, 171, 92, 0.18)";
	const slFill = "rgba(215, 50, 75, 0.18)";
	const tpBounds = { x: left, y: Math.min(entryY, targetY), width, height: Math.abs(targetY - entryY) };
	const slBounds = { x: left, y: Math.min(entryY, stopY), width, height: Math.abs(stopY - entryY) };

	drawFilledRect(ctx, tpBounds, tpFill, 1);
	drawFilledRect(ctx, slBounds, slFill, 1);
	drawLine(ctx, { x: left, y: entryY }, { x: right, y: entryY }, drawing.style);
	drawLine(ctx, { x: left, y: targetY }, { x: right, y: targetY }, drawing.style);
	drawLine(ctx, { x: left, y: stopY }, { x: right, y: stopY }, drawing.style);
	drawTextLabel(ctx, badge, { x: right - 4, y: Math.min(entryY, stopY, targetY) - 6 }, drawing.style, {
		align: "right",
		baseline: "alphabetic",
		weight: 700,
		fontSize: drawing.style.fontSize ?? 11,
	});

	if (isSelected) {
		drawSelectionHandles(ctx, [start, end], drawing.style.stroke);
	}
}

function drawRectangle(drawing: DrawingObject, scales: ChartScales, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return;
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const x = Math.min(start.x, end.x);
	const y = Math.min(start.y, end.y);
	const width = Math.abs(end.x - start.x);
	const height = Math.abs(end.y - start.y);
	const fill = drawing.style.fill ?? "transparent";
	const fillAlpha = drawing.style.fillOpacity ?? drawing.style.opacity ?? 1;
	ctx.save();
	ctx.globalAlpha = fillAlpha;
	ctx.fillStyle = fill;
	ctx.fillRect(x, y, width, height);
	ctx.restore();
	drawStrokedRect(ctx, { x, y, width, height }, drawing.style);

	if (isSelected) {
		drawSelectionHandles(ctx, [start, end], drawing.style.stroke);
	}
}

function drawArrow(drawing: DrawingObject, scales: ChartScales, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return;
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const length = Math.hypot(dx, dy);
	const headLength = Math.max(8, drawing.style.strokeWidth * 4);
	const headWidth = Math.max(5, drawing.style.strokeWidth * 2);

	drawLine(ctx, start, end, drawing.style);
	if (length > 0) {
		const ux = dx / length;
		const uy = dy / length;
		const px = -uy;
		const py = ux;
		const base = {
			x: end.x - ux * headLength,
			y: end.y - uy * headLength,
		};
		const left = {
			x: base.x + px * headWidth,
			y: base.y + py * headWidth,
		};
		const right = {
			x: base.x - px * headWidth,
			y: base.y - py * headWidth,
		};

		ctx.save();
		ctx.globalAlpha = drawing.style.opacity ?? 1;
		ctx.beginPath();
		ctx.moveTo(end.x, end.y);
		ctx.lineTo(left.x, left.y);
		ctx.lineTo(right.x, right.y);
		ctx.closePath();
		ctx.fillStyle = drawing.style.stroke;
		ctx.strokeStyle = drawing.style.stroke;
		ctx.lineWidth = drawing.style.strokeWidth;
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}

	if (isSelected) {
		drawSelectionHandles(ctx, [start, end], drawing.style.stroke);
	}
}

function drawLongPosition(drawing: DrawingObject, scales: ChartScales, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	drawPositionZones(drawing, scales, "long", ctx, isSelected);
}

function drawShortPosition(drawing: DrawingObject, scales: ChartScales, ctx: CanvasRenderingContext2D, isSelected: boolean) {
	drawPositionZones(drawing, scales, "short", ctx, isSelected);
}

export function renderDrawingToCanvas(
	ctx: CanvasRenderingContext2D,
	drawing: DrawingObject,
	scales: ChartScales,
	options: RenderCanvasOptions,
): void {
	if (drawing.visible === false) {
		return;
	}

	const effectiveDrawing = {
		...drawing,
		style: resolveDrawingStyle(drawing),
	};

	switch (effectiveDrawing.type as string) {
		case "trendLine":
			drawTrendLine(effectiveDrawing, scales, ctx, options.isSelected);
			return;
		case "hLine":
			drawHLine(effectiveDrawing, scales, options.chartWidth, ctx, options.isSelected);
			return;
		case "vLine":
			drawVLine(effectiveDrawing, scales, options.chartHeight, ctx, options.isSelected);
			return;
		case "fibonacci":
			drawFibonacci(effectiveDrawing, scales, options.chartWidth, ctx, options.isSelected);
			return;
		case "channel":
			drawChannel(effectiveDrawing, scales, ctx, options.isSelected);
			return;
		case "text":
			drawText(effectiveDrawing, scales, ctx, options.isSelected);
			return;
		case "rectangle":
			drawRectangle(effectiveDrawing, scales, ctx, options.isSelected);
			return;
		case "arrow":
			drawArrow(effectiveDrawing, scales, ctx, options.isSelected);
			return;
		case "ray":
			drawRay(effectiveDrawing, scales, options.chartWidth, options.chartHeight, ctx, options.isSelected);
			return;
		case "extendedLine":
			drawExtendedLine(effectiveDrawing, scales, options.chartWidth, options.chartHeight, ctx, options.isSelected);
			return;
		case "polyline":
			drawPolylineTool(effectiveDrawing, scales, ctx, options.isSelected);
			return;
		case "dateAndPriceRange":
			drawDateAndPriceRange(effectiveDrawing, scales, ctx, options.isSelected);
			return;
		case "longPosition":
			drawLongPosition(effectiveDrawing, scales, ctx, options.isSelected);
			return;
		case "shortPosition":
			drawShortPosition(effectiveDrawing, scales, ctx, options.isSelected);
			return;
		case "fibExtension": {
			const [startPoint, endPoint] = effectiveDrawing.points;
			if (!startPoint || !endPoint) {
				return;
			}

			const start = toPixel(startPoint, scales);
			const end = toPixel(endPoint, scales);
			const levels = effectiveDrawing.fibLevels ?? DEFAULT_FIB_EXTENSION_LEVELS;
			const priceDelta = endPoint.y - startPoint.y;
			levels.forEach((level) => {
				const extensionPrice = endPoint.y + priceDelta * level;
				const y = toPixel({ x: endPoint.x, y: extensionPrice }, scales).y;
				drawLine(ctx, { x: 0, y }, { x: options.chartWidth, y }, effectiveDrawing.style);
				drawTextLabel(ctx, `${(level * 100).toFixed(1)}% — ${numberFormatter(extensionPrice)}`, { x: options.chartWidth - 6, y: y - 4 }, effectiveDrawing.style, {
					align: "right",
					baseline: "alphabetic",
					fontSize: effectiveDrawing.style.fontSize ?? 11,
				});
			});

			if (options.isSelected) {
				drawSelectionHandles(ctx, [start, end], effectiveDrawing.style.stroke);
			}
			return;
		}
		case "parallelChannel":
			drawParallelChannel(effectiveDrawing, scales, options.chartWidth, options.chartHeight, ctx, options.isSelected);
			return;
		case "pitchfork":
			drawPitchfork(effectiveDrawing, scales, options.chartWidth, options.chartHeight, ctx, options.isSelected);
			return;
		case "abcdPattern":
			drawAbcdPattern(effectiveDrawing, scales, ctx, options.isSelected);
			return;
		case "fibArc":
			drawFibArc(effectiveDrawing, scales, ctx, options.isSelected);
			return;
		case "fibTimeZone":
			drawFibTimeZone(effectiveDrawing, scales, options.chartWidth, ctx, options.isSelected);
			return;
		case "regressionChannel":
			drawRegressionChannel(effectiveDrawing, scales, options, ctx, options.isSelected);
			return;
		default:
			return;
	}
}