import { createElement } from "react";
import type { ReactElement } from "react";
import { chartPointToPixel, type ChartScales } from "./coordinateUtils";
import type { DrawingObject, DrawingStyle } from "./types";

export interface RenderSvgOptions {
	chartWidth: number;
	chartHeight: number;
	isSelected: boolean;
	onSelect?: (drawing: DrawingObject, event?: { shiftKey?: boolean }) => void;
}

const DEFAULT_FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618];
const DEFAULT_FIB_EXTENSION_LEVELS = [1.272, 1.414, 1.618, 2, 2.618];

function strokeDasharrayForStyle(style: DrawingStyle): string | undefined {
	switch (style.strokeDasharray) {
		case "dashed":
			return "6 4";
		case "dotted":
			return "2 4";
		case "solid":
		case undefined:
			return undefined;
		default:
			return style.strokeDasharray;
	}
}

function numberFormatter(value: number) {
	return new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}

function lineElement(key: string, props: Record<string, unknown>) {
	return createElement("line", { key, ...props });
}

function textElement(key: string, props: Record<string, unknown>, text: string) {
	return createElement("text", { key, ...props }, text);
}

function circleElement(key: string, props: Record<string, unknown>) {
	return createElement("circle", { key, ...props });
}

function polylineElement(key: string, props: Record<string, unknown>) {
	return createElement("polyline", { key, ...props });
}

function rectElement(key: string, props: Record<string, unknown>) {
	return createElement("rect", { key, ...props });
}

function polygonElement(key: string, props: Record<string, unknown>) {
	return createElement("polygon", { key, ...props });
}

function toPixel(point: DrawingObject["points"][number], scales: ChartScales) {
	return chartPointToPixel(point, scales);
}

function interactiveProps(drawing: DrawingObject, options: RenderSvgOptions) {
	return options.onSelect
		? {
			onClick: (event: { shiftKey?: boolean }) => options.onSelect?.(drawing, event),
			pointerEvents: "all",
		}
		: {};
}

function selectionHandles(points: Array<{ x: number; y: number }>, drawing: DrawingObject, options: RenderSvgOptions): ReactElement[] {
	return points.map((point, index) => circleElement(`${drawing.id}-handle-${index}`, {
		cx: point.x,
		cy: point.y,
		r: 4,
		className: "rsc-drawing-handle",
		fill: drawing.style.stroke,
		stroke: "#ffffff",
		strokeWidth: 1,
		pointerEvents: "all",
		onClick: (event: { shiftKey?: boolean }) => options.onSelect?.(drawing, event),
	}));
}

function clipSegmentToBox(start: { x: number; y: number }, end: { x: number; y: number }, chartWidth: number, chartHeight: number) {
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
	];
}

function renderLineWithHandles(
	drawing: DrawingObject,
	start: { x: number; y: number },
	end: { x: number; y: number },
	options: RenderSvgOptions,
	key: string,
	className?: string,
) {
	const line = lineElement(key, {
		x1: start.x,
		y1: start.y,
		x2: end.x,
		y2: end.y,
		stroke: drawing.style.stroke,
		strokeWidth: drawing.style.strokeWidth,
		strokeDasharray: strokeDasharrayForStyle(drawing.style),
		fill: "none",
		className,
		vectorEffect: "non-scaling-stroke",
		...interactiveProps(drawing, options),
	});

	return options.isSelected ? [line, ...selectionHandles([start, end], drawing, options)] : [line];
}

function renderTrendLine(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return [];
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const line = lineElement(`${drawing.id}-trend-line`, {
		x1: start.x,
		y1: start.y,
		x2: end.x,
		y2: end.y,
		stroke: drawing.style.stroke,
		strokeWidth: drawing.style.strokeWidth,
		strokeDasharray: strokeDasharrayForStyle(drawing.style),
		fill: "none",
		className: options.isSelected ? "rsc-drawing-selected" : undefined,
		vectorEffect: "non-scaling-stroke",
		...interactiveProps(drawing, options),
	});

	return options.isSelected ? [line, ...selectionHandles([start, end], drawing, options)] : [line];
}

function renderHLine(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	const point = drawing.points[0];
	if (!point) {
		return [];
	}

	const y = toPixel(point, scales).y;
	const left = { x: 0, y };
	const right = { x: options.chartWidth, y };
	const line = lineElement(`${drawing.id}-h-line`, {
		x1: left.x,
		y1: left.y,
		x2: right.x,
		y2: right.y,
		stroke: drawing.style.stroke,
		strokeWidth: drawing.style.strokeWidth,
		strokeDasharray: strokeDasharrayForStyle(drawing.style),
		fill: "none",
		className: options.isSelected ? "rsc-drawing-selected" : undefined,
		vectorEffect: "non-scaling-stroke",
		...interactiveProps(drawing, options),
	});

	return options.isSelected ? [line, ...selectionHandles([left, right], drawing, options)] : [line];
}

function renderVLine(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	const point = drawing.points[0];
	if (!point) {
		return [];
	}

	const x = toPixel(point, scales).x;
	const top = { x, y: 0 };
	const bottom = { x, y: options.chartHeight };
	const line = lineElement(`${drawing.id}-v-line`, {
		x1: top.x,
		y1: top.y,
		x2: bottom.x,
		y2: bottom.y,
		stroke: drawing.style.stroke,
		strokeWidth: drawing.style.strokeWidth,
		strokeDasharray: strokeDasharrayForStyle(drawing.style),
		fill: "none",
		className: options.isSelected ? "rsc-drawing-selected" : undefined,
		vectorEffect: "non-scaling-stroke",
		...interactiveProps(drawing, options),
	});

	return options.isSelected ? [line, ...selectionHandles([top, bottom], drawing, options)] : [line];
}

function renderFibonacci(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return [];
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const levels = drawing.fibLevels ?? DEFAULT_FIB_LEVELS;
	const elements: ReactElement[] = [];
	const priceDelta = endPoint.y - startPoint.y;
	const pixelDelta = end.y - start.y;

	levels.forEach((level, index) => {
		const y = start.y + pixelDelta * level;
		const price = startPoint.y + priceDelta * level;
		elements.push(lineElement(`${drawing.id}-fib-line-${index}`, {
			x1: 0,
			y1: y,
			x2: options.chartWidth,
			y2: y,
			stroke: drawing.style.stroke,
			strokeWidth: drawing.style.strokeWidth,
			strokeDasharray: strokeDasharrayForStyle(drawing.style),
			fill: "none",
			className: options.isSelected ? "rsc-drawing-selected" : undefined,
			vectorEffect: "non-scaling-stroke",
			...interactiveProps(drawing, options),
		}));
		elements.push(textElement(`${drawing.id}-fib-label-${index}`, {
			x: options.chartWidth - 6,
			y: y - 4,
			fill: drawing.style.stroke,
			fontSize: drawing.style.fontSize ?? 11,
			fontFamily: drawing.style.fontFamily ?? "sans-serif",
			textAnchor: "end",
			className: options.isSelected ? "rsc-drawing-selected" : undefined,
			...interactiveProps(drawing, options),
		}, `${(level * 100).toFixed(1)}% — ${numberFormatter(price)}`));
	});

	return options.isSelected ? [...elements, ...selectionHandles([start, end], drawing, options)] : elements;
}

function renderChannel(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	const [startPoint, endPoint, offsetPoint] = drawing.points;
	if (!startPoint || !endPoint || !offsetPoint) {
		return [];
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
	const lineProps = {
		stroke: drawing.style.stroke,
		strokeWidth: drawing.style.strokeWidth,
		strokeDasharray: strokeDasharrayForStyle(drawing.style),
		fill: "none",
		className: options.isSelected ? "rsc-drawing-selected" : undefined,
		vectorEffect: "non-scaling-stroke",
		...interactiveProps(drawing, options),
	};

	return options.isSelected
		? [
			lineElement(`${drawing.id}-channel-primary`, { x1: start.x, y1: start.y, x2: end.x, y2: end.y, ...lineProps }),
			lineElement(`${drawing.id}-channel-secondary`, { x1: offsetStart.x, y1: offsetStart.y, x2: offsetEnd.x, y2: offsetEnd.y, ...lineProps }),
			...selectionHandles([start, end, offsetAnchor], drawing, options),
		]
		: [
			lineElement(`${drawing.id}-channel-primary`, { x1: start.x, y1: start.y, x2: end.x, y2: end.y, ...lineProps }),
			lineElement(`${drawing.id}-channel-secondary`, { x1: offsetStart.x, y1: offsetStart.y, x2: offsetEnd.x, y2: offsetEnd.y, ...lineProps }),
		];
}

function renderText(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	const point = drawing.points[0];
	if (!point) {
		return [];
	}

	const pixel = toPixel(point, scales);
	const text = drawing.text?.trim().length ? drawing.text : "Text";

	return [textElement(`${drawing.id}-text`, {
		x: pixel.x,
		y: pixel.y,
		fill: drawing.style.stroke,
		fontSize: drawing.style.fontSize ?? 12,
		fontFamily: drawing.style.fontFamily ?? "sans-serif",
		alignmentBaseline: "middle",
		className: options.isSelected ? "rsc-drawing-selected" : undefined,
		...interactiveProps(drawing, options),
	}, text)];
}

function renderRay(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return [];
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const clipped = clipSegmentToBox(
		start,
		{ x: start.x + (end.x - start.x) * 10_000, y: start.y + (end.y - start.y) * 10_000 },
		options.chartWidth,
		options.chartHeight,
	);

	if (!clipped) {
		return [];
	}

	return renderLineWithHandles(drawing, clipped[0], clipped[1], options, `${drawing.id}-ray`);
}

function renderExtendedLine(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return [];
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const vector = { x: end.x - start.x, y: end.y - start.y };
	const clipped = clipSegmentToBox(
		{ x: start.x - vector.x * 10_000, y: start.y - vector.y * 10_000 },
		{ x: start.x + vector.x * 10_000, y: start.y + vector.y * 10_000 },
		options.chartWidth,
		options.chartHeight,
	);

	if (!clipped) {
		return [];
	}

	return renderLineWithHandles(drawing, clipped[0], clipped[1], options, `${drawing.id}-extended-line`);
}

function renderPolyline(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	if (drawing.points.length < 2) {
		return [];
	}

	const pixels = drawing.points.map((point) => toPixel(point, scales));
	const element = polylineElement(`${drawing.id}-polyline`, {
		points: pixels.map((point) => `${point.x},${point.y}`).join(" "),
		stroke: drawing.style.stroke,
		strokeWidth: drawing.style.strokeWidth,
		strokeDasharray: strokeDasharrayForStyle(drawing.style),
		fill: "none",
		className: options.isSelected ? "rsc-drawing-selected" : undefined,
		vectorEffect: "non-scaling-stroke",
		...interactiveProps(drawing, options),
	});

	return options.isSelected ? [element, ...selectionHandles(pixels, drawing, options)] : [element];
}

function renderDateAndPriceRange(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return [];
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

	const rect = rectElement(`${drawing.id}-range`, {
		x,
		y,
		width,
		height,
		stroke: drawing.style.stroke,
		strokeWidth: drawing.style.strokeWidth,
		fill: drawing.style.fill && drawing.style.fill !== "transparent" ? drawing.style.fill : drawing.style.stroke,
		fillOpacity: drawing.style.fillOpacity ?? 0.16,
		opacity: drawing.style.opacity ?? 1,
		className: options.isSelected ? "rsc-drawing-selected" : undefined,
		vectorEffect: "non-scaling-stroke",
		...interactiveProps(drawing, options),
	});
	const badgeText = textElement(`${drawing.id}-range-badge`, {
		x: x + 8,
		y: y + 16,
		fill: drawing.style.stroke,
		fontSize: drawing.style.fontSize ?? 11,
		fontFamily: drawing.style.fontFamily ?? "sans-serif",
		fontWeight: 700,
		textAnchor: "start",
		alignmentBaseline: "middle",
		className: options.isSelected ? "rsc-drawing-selected" : undefined,
		...interactiveProps(drawing, options),
	}, badge);

	return options.isSelected ? [rect, badgeText, ...selectionHandles([start, end], drawing, options)] : [rect, badgeText];
}

function renderPositionZones(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions, mode: "long" | "short"): ReactElement[] {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return [];
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
	const tpZoneClass = mode === "long" ? "rsc-long-tp-zone" : "rsc-short-tp-zone";
	const slZoneClass = mode === "long" ? "rsc-long-sl-zone" : "rsc-short-sl-zone";
	const tpZone = rectElement(`${drawing.id}-tp-zone`, {
		x: left,
		y: Math.min(entryY, targetY),
		width,
		height: Math.abs(targetY - entryY),
		className: tpZoneClass,
		stroke: drawing.style.stroke,
		strokeWidth: drawing.style.strokeWidth,
		...interactiveProps(drawing, options),
	});
	const slZone = rectElement(`${drawing.id}-sl-zone`, {
		x: left,
		y: Math.min(entryY, stopY),
		width,
		height: Math.abs(stopY - entryY),
		className: slZoneClass,
		stroke: drawing.style.stroke,
		strokeWidth: drawing.style.strokeWidth,
		...interactiveProps(drawing, options),
	});
	const entryLine = lineElement(`${drawing.id}-entry-line`, {
		x1: left,
		y1: entryY,
		x2: right,
		y2: entryY,
		stroke: drawing.style.stroke,
		strokeWidth: drawing.style.strokeWidth,
		strokeDasharray: strokeDasharrayForStyle(drawing.style),
		fill: "none",
		vectorEffect: "non-scaling-stroke",
		...interactiveProps(drawing, options),
	});
	const stopLine = lineElement(`${drawing.id}-stop-line`, {
		x1: left,
		y1: stopY,
		x2: right,
		y2: stopY,
		stroke: drawing.style.stroke,
		strokeWidth: drawing.style.strokeWidth,
		strokeDasharray: strokeDasharrayForStyle(drawing.style),
		fill: "none",
		vectorEffect: "non-scaling-stroke",
		...interactiveProps(drawing, options),
	});
	const targetLine = lineElement(`${drawing.id}-target-line`, {
		x1: left,
		y1: targetY,
		x2: right,
		y2: targetY,
		stroke: drawing.style.stroke,
		strokeWidth: drawing.style.strokeWidth,
		strokeDasharray: strokeDasharrayForStyle(drawing.style),
		fill: "none",
		vectorEffect: "non-scaling-stroke",
		...interactiveProps(drawing, options),
	});
	const badgeText = textElement(`${drawing.id}-rr-badge`, {
		x: right - 4,
		y: Math.min(entryY, stopY, targetY) - 6,
		fill: drawing.style.stroke,
		fontSize: drawing.style.fontSize ?? 11,
		fontFamily: drawing.style.fontFamily ?? "sans-serif",
		fontWeight: 700,
		textAnchor: "end",
		alignmentBaseline: "middle",
		className: ["rsc-rr-badge", options.isSelected ? "rsc-drawing-selected" : ""].filter(Boolean).join(" "),
		...interactiveProps(drawing, options),
	}, badge);

	const elements = [tpZone, slZone, entryLine, targetLine, stopLine, badgeText];
	return options.isSelected ? [...elements, ...selectionHandles([start, end], drawing, options)] : elements;
}

function renderLongPosition(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	return renderPositionZones(drawing, scales, options, "long");
}

function renderShortPosition(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	return renderPositionZones(drawing, scales, options, "short");
}

function renderFibExtension(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return [];
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const levels = drawing.fibLevels ?? DEFAULT_FIB_EXTENSION_LEVELS;
	const priceDelta = endPoint.y - startPoint.y;
	const elements: ReactElement[] = [];

	levels.forEach((level, index) => {
		const extensionPrice = endPoint.y + priceDelta * level;
		const y = toPixel({ x: endPoint.x, y: extensionPrice }, scales).y;
		elements.push(lineElement(`${drawing.id}-fib-extension-line-${index}`, {
			x1: 0,
			y1: y,
			x2: options.chartWidth,
			y2: y,
			stroke: drawing.style.stroke,
			strokeWidth: drawing.style.strokeWidth,
			strokeDasharray: strokeDasharrayForStyle(drawing.style),
			fill: "none",
			className: options.isSelected ? "rsc-drawing-selected" : undefined,
			vectorEffect: "non-scaling-stroke",
			...interactiveProps(drawing, options),
		}));
		elements.push(textElement(`${drawing.id}-fib-extension-label-${index}`, {
			x: options.chartWidth - 6,
			y: y - 4,
			fill: drawing.style.stroke,
			fontSize: drawing.style.fontSize ?? 11,
			fontFamily: drawing.style.fontFamily ?? "sans-serif",
			textAnchor: "end",
			className: options.isSelected ? "rsc-drawing-selected" : undefined,
			...interactiveProps(drawing, options),
		}, `${(level * 100).toFixed(1)}% — ${numberFormatter(extensionPrice)}`));
	});

	return options.isSelected ? [...elements, ...selectionHandles([start, end], drawing, options)] : elements;
}

function renderRectangle(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return [];
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const x = Math.min(start.x, end.x);
	const y = Math.min(start.y, end.y);
	const width = Math.abs(end.x - start.x);
	const height = Math.abs(end.y - start.y);

	return [rectElement(`${drawing.id}-rectangle`, {
		x,
		y,
		width,
		height,
		stroke: drawing.style.stroke,
		strokeWidth: drawing.style.strokeWidth,
		strokeDasharray: strokeDasharrayForStyle(drawing.style),
		fill: drawing.style.fill ?? "transparent",
		fillOpacity: drawing.style.fillOpacity ?? drawing.style.opacity ?? 1,
		opacity: drawing.style.opacity ?? 1,
		className: options.isSelected ? "rsc-drawing-selected" : undefined,
		vectorEffect: "non-scaling-stroke",
		...interactiveProps(drawing, options),
	})];
}

function renderArrow(drawing: DrawingObject, scales: ChartScales, options: RenderSvgOptions): ReactElement[] {
	const [startPoint, endPoint] = drawing.points;
	if (!startPoint || !endPoint) {
		return [];
	}

	const start = toPixel(startPoint, scales);
	const end = toPixel(endPoint, scales);
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const length = Math.hypot(dx, dy);
	const headLength = Math.max(8, drawing.style.strokeWidth * 4);
	const headWidth = Math.max(5, drawing.style.strokeWidth * 2);
	const line = lineElement(`${drawing.id}-arrow-line`, {
		x1: start.x,
		y1: start.y,
		x2: end.x,
		y2: end.y,
		stroke: drawing.style.stroke,
		strokeWidth: drawing.style.strokeWidth,
		strokeDasharray: strokeDasharrayForStyle(drawing.style),
		fill: "none",
		className: options.isSelected ? "rsc-drawing-selected" : undefined,
		vectorEffect: "non-scaling-stroke",
		...interactiveProps(drawing, options),
	});

	if (length === 0) {
		return [line];
	}

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

	return options.isSelected
		? [
			line,
			polygonElement(`${drawing.id}-arrow-head`, {
				points: `${end.x},${end.y} ${left.x},${left.y} ${right.x},${right.y}`,
				fill: drawing.style.stroke,
				stroke: drawing.style.stroke,
				strokeWidth: drawing.style.strokeWidth,
				className: "rsc-drawing-selected",
				...interactiveProps(drawing, options),
			}),
			...selectionHandles([start, end], drawing, options),
		]
		: [
			line,
			polygonElement(`${drawing.id}-arrow-head`, {
				points: `${end.x},${end.y} ${left.x},${left.y} ${right.x},${right.y}`,
				fill: drawing.style.stroke,
				stroke: drawing.style.stroke,
				strokeWidth: drawing.style.strokeWidth,
				...interactiveProps(drawing, options),
			}),
		];
}

export function renderDrawingToSvg(
	drawing: DrawingObject,
	scales: ChartScales,
	options: RenderSvgOptions,
): ReactElement[] {
	if (drawing.visible === false) {
		return [];
	}

	switch (drawing.type as string) {
		case "trendLine":
				return renderTrendLine(drawing, scales, options);
		case "ray":
			return renderRay(drawing, scales, options);
		case "extendedLine":
			return renderExtendedLine(drawing, scales, options);
		case "polyline":
			return renderPolyline(drawing, scales, options);
		case "dateAndPriceRange":
			return renderDateAndPriceRange(drawing, scales, options);
		case "longPosition":
			return renderLongPosition(drawing, scales, options);
		case "shortPosition":
			return renderShortPosition(drawing, scales, options);
		case "fibExtension":
			return renderFibExtension(drawing, scales, options);
		case "hLine":
			return renderHLine(drawing, scales, options);
		case "vLine":
			return renderVLine(drawing, scales, options);
		case "fibonacci":
			return renderFibonacci(drawing, scales, options);
		case "channel":
				return renderChannel(drawing, scales, options);
		case "text":
				return renderText(drawing, scales, options);
		case "rectangle":
				return renderRectangle(drawing, scales, options);
		case "arrow":
				return renderArrow(drawing, scales, options);
		default:
			return [];
	}
}