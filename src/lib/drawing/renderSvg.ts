import { createElement } from "react";
import type { ReactElement } from "react";
import { chartPointToPixel, type ChartScales } from "./coordinateUtils";
import type { DrawingObject, DrawingStyle } from "./types";

export interface RenderSvgOptions {
	chartWidth: number;
	chartHeight: number;
	isSelected: boolean;
	onSelect?: (drawing: DrawingObject) => void;
}

const DEFAULT_FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618];

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
			onClick: () => options.onSelect?.(drawing),
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
		onClick: () => options.onSelect?.(drawing),
	}));
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