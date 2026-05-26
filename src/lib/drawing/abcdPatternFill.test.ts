import { describe, expect, it, vi } from "vitest";
import type { ChartScales } from "./coordinateUtils";
import { hitTestDrawing } from "./hitTest";
import { renderDrawingToCanvas } from "./renderCanvas";
import { renderDrawingToSvg } from "./renderSvg";
import { createDrawingObject } from "./shared";
import type { DrawingObject } from "./types";

function makeScales(): ChartScales {
	const now = Date.now();
	const xScale = Object.assign(
		(value: Date) => ((value.getTime() - now) / 100) * 800,
		{ invert: (px: number) => new Date(now + (px / 800) * 100) },
	) as any;
	const yScale = Object.assign(
		(value: number) => 400 - value * 4,
		{ invert: (px: number) => (400 - px) / 4 },
	) as any;
	return {
		xScale,
		xScaleInvert: xScale.invert,
		yScale,
		yScaleInvert: yScale.invert,
		xAccessor: (datum: any) => datum.date,
		plotData: [],
	};
}

function createPattern(points: Array<{ x: number; y: number }>, patch: Partial<DrawingObject> = {}) {
	return createDrawingObject("abcdPattern", points, patch);
}

function createCanvasMock() {
	const fillCalls: Array<{ fillStyle: string; globalAlpha: number }> = [];
	const ctx: any = {
		canvas: { width: 800, height: 400 },
		fillStyle: "",
		globalAlpha: 1,
		lineWidth: 1,
		strokeStyle: "",
		font: "",
		textAlign: "",
		textBaseline: "",
		save: vi.fn(),
		restore: vi.fn(),
		beginPath: vi.fn(),
		moveTo: vi.fn(),
		lineTo: vi.fn(),
		closePath: vi.fn(),
		stroke: vi.fn(),
		fill: vi.fn(() => {
			fillCalls.push({ fillStyle: ctx.fillStyle, globalAlpha: ctx.globalAlpha });
		}),
		fillText: vi.fn(),
		arc: vi.fn(),
		strokeRect: vi.fn(),
		fillRect: vi.fn(),
		setLineDash: vi.fn(),
		measureText: vi.fn(() => ({ width: 0 })),
	};

	return { ctx, fillCalls };
}

describe("ABCD pattern fill rendering", () => {
	const scales = makeScales();
	const options = { chartWidth: 800, chartHeight: 400, isSelected: false };
	const now = Date.now();
	const points = [
		{ x: now, y: 20 },
		{ x: now + 25, y: 20 },
		{ x: now + 25, y: 40 },
		{ x: now, y: 40 },
	];

	it("renders a subtle default fill polygon in SVG", () => {
		const drawing = createPattern(points, { id: "abcd-svg-default" });
		const elements = renderDrawingToSvg(drawing, scales, options);
		const polygon = elements.find((element) => element.type === "polygon") as any;

		expect(polygon).toBeDefined();
		expect(polygon?.props.fill).toBe("#bfdbfe");
		expect(polygon?.props.fillOpacity).toBe(0.08);
	});

	it("honors an explicit fill color and opacity override", () => {
		const drawing = createPattern(points, {
			id: "abcd-svg-custom",
			style: {
				stroke: "#2962ff",
				strokeWidth: 1,
				strokeDasharray: "solid",
				fill: "#fecaca",
				fillOpacity: 0.22,
				opacity: 1,
			},
		});
		const elements = renderDrawingToSvg(drawing, scales, options);
		const polygon = elements.find((element) => element.type === "polygon") as any;

		expect(polygon).toBeDefined();
		expect(polygon?.props.fill).toBe("#fecaca");
		expect(polygon?.props.fillOpacity).toBe(0.22);
	});

	it("renders the same light fill on canvas", () => {
		const drawing = createPattern(points, { id: "abcd-canvas-default" });
		const { ctx, fillCalls } = createCanvasMock();

		renderDrawingToCanvas(ctx as CanvasRenderingContext2D, drawing, scales, options);

		expect(fillCalls).toEqual([
			{ fillStyle: "#bfdbfe", globalAlpha: 0.08 },
		]);
	});

	it("treats clicks inside the fill as a hit", () => {
		const drawing = createPattern(points, { id: "abcd-hit" });

		expect(hitTestDrawing(drawing, 100, 280, scales, options)).toBe(true);
	});
});
