import { describe, expect, it } from "vitest";

import { evaluateDrawingAlerts } from "./drawingAlerts";
import { createDrawingObject } from "./shared";

function createBar(date: string, open: number, high: number, low: number, close: number, index: number) {
	return {
		date: new Date(date),
		open,
		high,
		low,
		close,
		volume: 1_000,
		index,
		dataIndex: index,
	};
}

describe("drawing alerts", () => {
	it("emits a touch alert when the bar range touches the line", () => {
		const drawing = createDrawingObject("hLine", [
			{ x: Date.parse("2026-01-01T00:00:00.000Z"), y: 100 },
			{ x: Date.parse("2026-01-02T00:00:00.000Z"), y: 100 },
		], {
			alert: { enabled: true, trigger: "touch" },
		});
		const previousBar = createBar("2026-01-01T00:00:00.000Z", 95, 99, 94, 96, 0);
		const currentBar = createBar("2026-01-02T00:00:00.000Z", 96, 102, 95, 101, 1);

		const events = evaluateDrawingAlerts([drawing], previousBar, currentBar, {
			symbol: "VCB",
			timeframe: "1d",
		});

		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			drawing: expect.objectContaining({ id: drawing.id }),
			trigger: "touch",
			referencePrice: 100,
			symbol: "VCB",
			timeframe: "1d",
		});
	});

	it("emits a break alert when the candle body crosses the line", () => {
		const drawing = createDrawingObject("hLine", [
			{ x: Date.parse("2026-01-01T00:00:00.000Z"), y: 100 },
			{ x: Date.parse("2026-01-02T00:00:00.000Z"), y: 100 },
		], {
			alert: { enabled: true, trigger: "break" },
		});
		const previousBar = createBar("2026-01-01T00:00:00.000Z", 95, 99, 94, 96, 0);
		const currentBar = createBar("2026-01-02T00:00:00.000Z", 98, 103, 97, 102, 1);

		const events = evaluateDrawingAlerts([drawing], previousBar, currentBar);

		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			trigger: "break",
			referencePrice: 100,
		});
	});

	it("emits a close-above alert on an interpolated trend line", () => {
		const drawing = createDrawingObject("trendLine", [
			{ x: Date.parse("2026-01-01T00:00:00.000Z"), y: 100 },
			{ x: Date.parse("2026-01-03T00:00:00.000Z"), y: 110 },
		], {
			alert: { enabled: true, trigger: "closeAbove" },
		});
		const previousBar = createBar("2026-01-01T00:00:00.000Z", 99, 101, 98, 104, 0);
		const currentBar = createBar("2026-01-02T00:00:00.000Z", 104, 107, 103, 107, 1);

		const events = evaluateDrawingAlerts([drawing], previousBar, currentBar);

		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			trigger: "closeAbove",
			referencePrice: 105,
		});
	});
});
