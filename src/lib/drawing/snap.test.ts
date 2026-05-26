import { scaleLinear, scaleTime } from "d3-scale";
import { describe, expect, it } from "vitest";
import type { ChartScales, PlotDatum } from "./coordinateUtils";
import { createDrawingObject } from "./shared";
import { findSnapPoint } from "./snap";

const day = 24 * 60 * 60 * 1000;
const baseDate = new Date("2026-05-15T00:00:00.000Z");

function createScales(): ChartScales {
	const xScale = scaleTime().domain([baseDate, new Date(baseDate.getTime() + 8 * day)]).range([0, 160]);
	const yScale = scaleLinear().domain([0, 100]).range([160, 0]);

	return {
		xScale: xScale as ChartScales["xScale"],
		xScaleInvert: xScale.invert as ChartScales["xScaleInvert"],
		yScale: yScale as ChartScales["yScale"],
		yScaleInvert: yScale.invert as ChartScales["yScaleInvert"],
	};
}

function createPlotData(): PlotDatum[] {
	return [
		{
			date: new Date(baseDate.getTime() + 4 * day),
			open: 50,
			high: 50,
			low: 50,
			close: 50,
			volume: 1,
		},
	];
}

describe("findSnapPoint", () => {
	it("prefers OHLC over a closer endpoint when both are available", () => {
		const scales = createScales();
		const endpointDrawing = createDrawingObject("trendLine", [{ x: baseDate.getTime() + 4 * day, y: 50.625 }], {
			id: "endpoint-drawing",
		});

		const snap = findSnapPoint(81, 79, scales, createPlotData(), [endpointDrawing], 10);

		expect(snap).toMatchObject({
			snapType: "ohlc",
			pixelPoint: { x: 80, y: 80 },
		});
	});

	it("snaps to intersections before nearby endpoints", () => {
		const scales = createScales();
		const rising = createDrawingObject("trendLine", [
			{ x: baseDate.getTime(), y: 0 },
			{ x: baseDate.getTime() + 8 * day, y: 100 },
		], { id: "rising" });
		const falling = createDrawingObject("trendLine", [
			{ x: baseDate.getTime(), y: 100 },
			{ x: baseDate.getTime() + 8 * day, y: 0 },
		], { id: "falling" });
		const nearbyEndpoint = createDrawingObject("trendLine", [{ x: baseDate.getTime() + 4 * day, y: 50.625 }], {
			id: "endpoint-near-intersection",
		});

		const snap = findSnapPoint(81, 79, scales, [], [rising, falling, nearbyEndpoint], 10);

		expect(snap).toMatchObject({
			snapType: "intersection",
			pixelPoint: { x: 80, y: 80 },
		});
	});

	it("snaps to drawing endpoints when they are the closest structural target", () => {
		const scales = createScales();
		const endpointDrawing = createDrawingObject("trendLine", [{ x: baseDate.getTime() + 2 * day, y: 40 }], {
			id: "endpoint",
		});

		const snap = findSnapPoint(40, 96, scales, [], [endpointDrawing], 10);

		expect(snap).toMatchObject({
			snapType: "endpoint",
			pixelPoint: { x: 40, y: 96 },
		});
	});

	it("snaps to segment midpoints before falling back to grid", () => {
		const scales = createScales();
		const lineDrawing = createDrawingObject("trendLine", [
			{ x: baseDate.getTime(), y: 20 },
			{ x: baseDate.getTime() + 8 * day, y: 80 },
		], { id: "midpoint" });

		const snap = findSnapPoint(82, 82, scales, [], [lineDrawing], 10);

		expect(snap).toMatchObject({
			snapType: "midpoint",
			pixelPoint: { x: 80, y: 80 },
		});
	});

	it("falls back to chart grid ticks when no structural target is nearby", () => {
		const scales = createScales();
		const xScaleTicks = (scales.xScale as any).ticks?.(8) ?? [];
		const yScaleTicks = (scales.yScale as any).ticks?.(8) ?? [];
		const xTick = xScaleTicks[Math.min(3, xScaleTicks.length - 1)];
		const yTick = yScaleTicks[Math.min(3, yScaleTicks.length - 1)];
		if (!(xTick instanceof Date) || typeof yTick !== "number") {
			throw new Error("unexpected grid tick types");
		}

		const x = scales.xScale(xTick);
		const y = scales.yScale(yTick);
		const snap = findSnapPoint(x + 1, y + 1, scales, [], [], 10);

		expect(snap).toMatchObject({
			snapType: "grid",
			pixelPoint: { x, y },
			chartPoint: { x: xTick.getTime(), y: yTick },
		});
	});
});