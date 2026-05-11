import { describe, expect, it } from "vitest";
import { computeLoadedWindow, computeMissingSegments, computeTargetWindow, shouldScheduleFetch } from "../historyWindowPlanner";

describe("historyWindowPlanner", () => {
	it("expands viewport with default prefetch ratios", () => {
		const target = computeTargetWindow({ startMs: 1000, endMs: 2000 });
		expect(target.startMs).toBe(-1000);
		expect(target.endMs).toBe(2500);
	});

	it("clamps zero-width viewport to at least 1ms", () => {
		const target = computeTargetWindow({ startMs: 5000, endMs: 5000 }, { leftPrefetchRatio: 1, rightPrefetchRatio: 1 });
		expect(target.startMs).toBe(4999);
		expect(target.endMs).toBe(5001);
	});

	it("uses custom prefetch ratios", () => {
		const target = computeTargetWindow({ startMs: 1000, endMs: 3000 }, { leftPrefetchRatio: 0.5, rightPrefetchRatio: 2 });
		expect(target.startMs).toBe(0);
		expect(target.endMs).toBe(7000);
	});

	it("returns null loaded window for empty data", () => {
		expect(computeLoadedWindow([])).toBeNull();
	});

	it("computes loaded window for sorted bars", () => {
		const loaded = computeLoadedWindow([
			{ date: new Date(1_000) },
			{ date: new Date(2_000) },
			{ date: new Date(3_000) },
		]);
		expect(loaded).toEqual({ startMs: 1000, endMs: 3000 });
	});

	it("detects left missing only", () => {
		const missing = computeMissingSegments({ startMs: 0, endMs: 3000 }, { startMs: 1000, endMs: 4000 });
		expect(missing.leftMissing).toBe(true);
		expect(missing.rightMissing).toBe(false);
	});

	it("detects right missing only", () => {
		const missing = computeMissingSegments({ startMs: 2000, endMs: 6000 }, { startMs: 1000, endMs: 5000 });
		expect(missing.leftMissing).toBe(false);
		expect(missing.rightMissing).toBe(true);
	});

	it("detects no missing when loaded fully covers target", () => {
		const missing = computeMissingSegments({ startMs: 2000, endMs: 4000 }, { startMs: 1000, endMs: 5000 });
		expect(missing.leftMissing).toBe(false);
		expect(missing.rightMissing).toBe(false);
	});

	it("schedules when next missing expands left target", () => {
		const previous = { leftMissing: true, rightMissing: false, leftTargetMs: 1000, rightTargetMs: 5000 };
		const next = { leftMissing: true, rightMissing: false, leftTargetMs: 500, rightTargetMs: 5000 };
		expect(shouldScheduleFetch(previous, next)).toBe(true);
	});

	it("does not schedule when missing does not expand", () => {
		const previous = { leftMissing: true, rightMissing: false, leftTargetMs: 500, rightTargetMs: 5000 };
		const next = { leftMissing: true, rightMissing: false, leftTargetMs: 700, rightTargetMs: 5000 };
		expect(shouldScheduleFetch(previous, next)).toBe(false);
	});
});
