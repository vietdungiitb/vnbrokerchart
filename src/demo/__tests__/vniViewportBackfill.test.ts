import { describe, expect, it } from "vitest";

import { computeVNIViewportBackfillWindow } from "../vniViewportBackfill";

function createBars(count: number) {
	return Array.from({ length: count }, (_, index) => ({
		date: new Date(Date.UTC(2026, 0, index + 1)),
	}));
}

describe("vniViewportBackfill", () => {
	it("returns null when the viewport is not near the left edge", () => {
		const bars = createBars(120);
		const window = computeVNIViewportBackfillWindow({
			startIndex: 30,
			endIndex: 59,
			startDate: bars[30].date,
			endDate: bars[59].date,
			barCount: 30,
		}, bars);

		expect(window).toBeNull();
	});

	it("derives the backfill window from timestamps in the current viewport", () => {
		const bars = createBars(90);
		const window = computeVNIViewportBackfillWindow({
			startIndex: 4,
			endIndex: 23,
			startDate: bars[4].date,
			endDate: bars[23].date,
			barCount: 20,
		}, bars, {
			leftTriggerRatio: 0.25,
			leftBufferRatio: 2,
			minBufferBars: 30,
		});

		expect(window).not.toBeNull();
		expect(window?.fetchTo.getTime()).toBe(bars[0].date.getTime() - 1);
		expect(window?.fetchFrom.getTime()).toBe(new Date(Date.UTC(2025, 10, 28)).getTime());
	});

	it("keeps a minimum history buffer when the viewport span is very small", () => {
		const bars = createBars(90);
		const window = computeVNIViewportBackfillWindow({
			startIndex: 2,
			endIndex: 6,
			startDate: bars[2].date,
			endDate: bars[6].date,
			barCount: 5,
		}, bars, {
			leftTriggerRatio: 0.5,
			leftBufferRatio: 1,
			minBufferBars: 20,
		});

		expect(window).not.toBeNull();
		expect(window?.fetchFrom.getTime()).toBe(new Date(Date.UTC(2025, 11, 14)).getTime());
	});

	it("triggers early when indicator warmup needs more bars than the viewport edge ratio", () => {
		const bars = createBars(220);
		const window = computeVNIViewportBackfillWindow({
			startIndex: 40,
			endIndex: 99,
			startDate: bars[40].date,
			endDate: bars[99].date,
			barCount: 60,
		}, bars, {
			leftTriggerRatio: 0.25,
			minTriggerBars: 120,
			minBufferBars: 120,
		});

		expect(window).not.toBeNull();
		expect(window?.triggerBars).toBe(120);
	});
});