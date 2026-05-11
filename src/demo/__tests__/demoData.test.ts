import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("../../../docs/data/bitfinex_xbtusd_1m.csv", () => ({ default: "" }));
import { fetchHistoricalDemoBars, mergeBarsByDate } from "../demoData";

function makeResponse(payload: unknown) {
	return {
		ok: true,
		json: async () => payload,
	};
}

function buildKlinePage(startTimestamp: number, stepMs: number, count: number, basePrice: number) {
	return Array.from({ length: count }, (_unused, index) => {
		const timestamp = startTimestamp + index * stepMs;
		const price = basePrice + index;
		return [
			timestamp,
			String(price),
			String(price + 5),
			String(price - 5),
			String(price + 1),
			String(1_000 + index),
		];
	});
}

describe("demoData history loaders", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("merges older bars without dropping newer timestamps", () => {
		const olderBars = [
			{ date: new Date(2026, 0, 1, 0, 0, 0), open: 1, high: 2, low: 0.5, close: 1.5, volume: 10 },
			{ date: new Date(2026, 0, 1, 1, 0, 0), open: 2, high: 3, low: 1.5, close: 2.5, volume: 11 },
		];
		const currentBars = [
			{ date: new Date(2026, 0, 1, 1, 0, 0), open: 20, high: 21, low: 19, close: 20.5, volume: 99 },
			{ date: new Date(2026, 0, 1, 2, 0, 0), open: 3, high: 4, low: 2.5, close: 3.5, volume: 12 },
		];

		const merged = mergeBarsByDate(olderBars, currentBars);

		expect(merged).toHaveLength(3);
		expect(merged.map((bar) => bar.date.getHours())).toEqual([0, 1, 2]);
		expect(merged[1]?.close).toBe(20.5);
	});

	it("pages backwards through Binance history", async () => {
		const firstPage = makeResponse([
			[1700003600000, "100", "110", "90", "105", "1000"],
			[1700007200000, "105", "115", "95", "110", "1100"],
		]);
		const secondPage = makeResponse([
			[1699996400000, "96", "106", "92", "101", "900"],
			[1700000000000, "101", "108", "97", "104", "950"],
		]);

		fetchMock
			.mockResolvedValueOnce(firstPage)
			.mockResolvedValueOnce(secondPage);

		const bars = await fetchHistoricalDemoBars({ interval: "1h", limit: 2, pages: 2 });

		expect(bars).toHaveLength(4);
		expect(bars.map((bar) => bar.date.getTime())).toEqual([
			1699996400000,
			1700000000000,
			1700003600000,
			1700007200000,
		]);
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(String(fetchMock.mock.calls[1]?.[0])).toContain("endTime=1700003599999");
		expect(String(fetchMock.mock.calls[1]?.[0])).toContain("limit=2");
	});

	describe.each([
		["15m", 15 * 60 * 1000],
		["1h", 60 * 60 * 1000],
	] as const)("pages backwards through %s history beyond the initial 1000-bar page", (interval, stepMs) => {
		it("loads two full pages and preserves Binance paging semantics", async () => {
			const latestPageStart = 1_700_000_000_000;
			const newestPage = makeResponse(buildKlinePage(latestPageStart, stepMs, 1_000, 100));
			const olderPage = makeResponse(buildKlinePage(latestPageStart - 1_000 * stepMs, stepMs, 1_000, 50));

			fetchMock
				.mockResolvedValueOnce(newestPage)
				.mockResolvedValueOnce(olderPage);

			const bars = await fetchHistoricalDemoBars({ interval, limit: 1_000, pages: 2 });

			expect(bars).toHaveLength(2_000);
			expect(bars[0]?.date.getTime()).toBe(latestPageStart - 1_000 * stepMs);
			expect(bars[1_999]?.date.getTime()).toBe(latestPageStart + 999 * stepMs);
			expect(fetchMock).toHaveBeenCalledTimes(2);
			expect(String(fetchMock.mock.calls[0]?.[0])).toContain(`interval=${interval}`);
			expect(String(fetchMock.mock.calls[1]?.[0])).toContain(`interval=${interval}`);
			expect(String(fetchMock.mock.calls[1]?.[0])).toContain(`endTime=${latestPageStart - 1}`);
			expect(String(fetchMock.mock.calls[1]?.[0])).toContain("limit=1000");
		});
	});
});