import { describe, expect, it } from "vitest";
import { calcCVDApprox } from "../calcCVDApprox";
import { enrichData } from "../enrichData";
import { mockOHLCV300 } from "../fixtures/mockData";
import type { RawOHLCV } from "../types";

describe("enrichData", () => {
	it("returns same number of items", () => {
		const enriched = enrichData(mockOHLCV300);
		expect(enriched).toHaveLength(mockOHLCV300.length);
	});

	it("ema20 is undefined for the first 19 bars", () => {
		const enriched = enrichData(mockOHLCV300);
		for (let index = 0; index < 19; index += 1) {
			expect(enriched[index]?.ema20).toBeUndefined();
		}
		expect(enriched[19]?.ema20).toBeDefined();
	});

	it("cvdApprox is cumulative and matches running delta sum", () => {
		const enriched = enrichData(mockOHLCV300);
		let cumulative = 0;
		enriched.forEach((bar) => {
			cumulative += bar.cvdDelta ?? 0;
			if (bar.cvdApprox !== undefined) {
				expect(Math.abs(bar.cvdApprox - cumulative)).toBeLessThan(0.01);
			}
		});
	});

	it("bullPower equals high - ema13 when ema13 is available", () => {
		const enriched = enrichData(mockOHLCV300);
		for (let index = 12; index < 30; index += 1) {
			const bar = enriched[index];
			if (bar?.ema13 !== undefined && bar.bullPower !== undefined) {
				expect(bar.bullPower).toBeCloseTo(bar.high - bar.ema13, 6);
				expect(bar.bearPower).toBeCloseTo(bar.low - bar.ema13, 6);
			}
		}
	});

	it("whale buy/sell volumes are never negative", () => {
		const enriched = enrichData(mockOHLCV300);
		enriched.forEach((bar) => {
			if (bar.whaleBuyVol !== undefined) {
				expect(bar.whaleBuyVol).toBeGreaterThanOrEqual(0);
			}
			if (bar.whaleSellVol !== undefined) {
				expect(bar.whaleSellVol).toBeGreaterThanOrEqual(0);
			}
		});
	});

	it("handles doji edge case with High === Low", () => {
		const singleBar: RawOHLCV[] = [{
			date: new Date(),
			open: 100,
			high: 100,
			low: 100,
			close: 100,
			volume: 1_000,
		}];
		const result = calcCVDApprox(singleBar);
		expect(result[0]?.cvdDelta).toBeCloseTo(0, 6);
		expect(result[0]?.cvdApprox).toBeCloseTo(0, 6);
	});

	it("performance: 1000 bars under 50ms", () => {
		const bigData = Array.from({ length: 1000 }, (_, index): RawOHLCV => ({
			date: new Date(Date.UTC(2024, 0, index + 1)),
			open: 100,
			high: 105,
			low: 98,
			close: 103,
			volume: 10_000,
		}));
		const startedAt = performance.now();
		enrichData(bigData);
		expect(performance.now() - startedAt).toBeLessThan(50);
	});
});
