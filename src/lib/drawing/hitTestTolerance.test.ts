import { describe, it, expect } from "vitest";
import { HIT_TOLERANCE, hitTestDrawing, type PointerDeviceType } from "./hitTest";
import type { DrawingObject } from "./types";
import type { ChartScales } from "./coordinateUtils";

// Minimal scales for a 800×400 canvas
function makeScales(): ChartScales {
	const now = Date.now();
	// xScale maps [now, now+100] → [0, 800]
	const xScale = Object.assign(
		(v: number) => ((v - now) / 100) * 800,
		{ invert: (px: number) => now + (px / 800) * 100 },
	) as any;
	// yScale maps [0, 100] → [400, 0] (inverted — price 0 is at bottom)
	const yScale = Object.assign(
		(v: number) => 400 - v * 4,
		{ invert: (px: number) => (400 - px) / 4 },
	) as any;
	return {
		xScale,
		xScaleInvert: xScale.invert,
		yScale,
		yScaleInvert: yScale.invert,
		xAccessor: (d: any) => d.date,
		plotData: [],
	};
}

function makeTrendLine(x1Date: number, y1: number, x2Date: number, y2: number): DrawingObject {
	return {
		id: "test-tl",
		type: "trendLine",
		points: [
			{ x: x1Date, y: y1 },
			{ x: x2Date, y: y2 },
		],
		style: {},
		visible: true,
	} as unknown as DrawingObject;
}

// ----------------------------------------------------------------
// HIT_TOLERANCE constants
// ----------------------------------------------------------------
describe("HIT_TOLERANCE", () => {
	it("mouse tolerance is 6", () => {
		expect(HIT_TOLERANCE.mouse).toBe(6);
	});

	it("touch tolerance is 16", () => {
		expect(HIT_TOLERANCE.touch).toBe(16);
	});

	it("pen tolerance is 8", () => {
		expect(HIT_TOLERANCE.pen).toBe(8);
	});

	it("touch tolerance is greater than mouse tolerance", () => {
		expect(HIT_TOLERANCE.touch).toBeGreaterThan(HIT_TOLERANCE.mouse);
	});
});

// ----------------------------------------------------------------
// hitTestDrawing — tolerance dispatch
// ----------------------------------------------------------------
describe("hitTestDrawing tolerance dispatch", () => {
	const now = Date.now();
	const scales = makeScales();
	// Vertical trendline at x=now, y from 50→50 (horizontal → pixel Y = 400 - 50*4 = 200)
	// Pixel: start = (0, 200), end = (400, 200) (x=now+50 maps to px 400)
	const drawing = makeTrendLine(now, 50, now + 50, 50);
	const options = { chartWidth: 800, chartHeight: 400 };

	it("hit with default (mouse) tolerance at 4px away returns true", () => {
		// Point at pixel (200, 204) — 4px below the line, within mouse tolerance (6)
		const mouseX = 200;
		const mouseY = 204;
		expect(hitTestDrawing(drawing, mouseX, mouseY, scales, options)).toBe(true);
	});

	it("miss with default (mouse) tolerance at 8px away returns false", () => {
		// 8px away — outside mouse tolerance (6)
		expect(hitTestDrawing(drawing, 200, 208, scales, options)).toBe(false);
	});

	it("hit with touch tolerance at 14px away returns true", () => {
		// 14px below line — within touch tolerance (16)
		expect(hitTestDrawing(drawing, 200, 214, scales, options, "touch")).toBe(true);
	});

	it("miss with touch tolerance at 18px away returns false", () => {
		// 18px — outside touch tolerance (16)
		expect(hitTestDrawing(drawing, 200, 218, scales, options, "touch")).toBe(false);
	});

	it("hit with pen tolerance at 7px away returns true", () => {
		// 7px — within pen tolerance (8)
		expect(hitTestDrawing(drawing, 200, 207, scales, options, "pen")).toBe(true);
	});

	it("backward-compat: numeric tolerance argument still works", () => {
		// Pass numeric 12 directly
		expect(hitTestDrawing(drawing, 200, 211, scales, options, 12)).toBe(true);
		expect(hitTestDrawing(drawing, 200, 213, scales, options, 12)).toBe(false);
	});

	it("invisible drawing always misses regardless of tolerance", () => {
		const invisible = { ...drawing, visible: false };
		expect(hitTestDrawing(invisible as any, 200, 200, scales, options, "touch")).toBe(false);
	});

	// Verify all pointerType values are accepted
	const allTypes: PointerDeviceType[] = ["mouse", "touch", "pen"];
	for (const pt of allTypes) {
		it(`accepts pointerType="${pt}" without error`, () => {
			expect(() => hitTestDrawing(drawing, 200, 200, scales, options, pt)).not.toThrow();
		});
	}
});
