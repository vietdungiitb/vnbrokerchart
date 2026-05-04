import { beforeEach, describe, expect, it } from "vitest";
import type { SeriesTypeId } from "../../types/pane-descriptor";
import { getSeries, listRegistered } from "../SeriesRegistry";
import { initRegistry } from "../registerAll";

beforeEach(() => {
	initRegistry();
});

describe("SeriesRegistry", () => {
	it("getSeries('Candlestick') returns a valid entry", () => {
		const entry = getSeries("Candlestick");
		expect(entry.component).toBeDefined();
		expect(typeof entry.tooltipEntry).toBe("function");
	});

	it("getSeries with unknown type throws a clear error", () => {
		expect(() => getSeries("UnknownType" as SeriesTypeId)).toThrow(/unknown type/i);
	});

	it("listRegistered contains all phase 1 types", () => {
		const registered = listRegistered();
		const phaseOneTypes: SeriesTypeId[] = [
			"Candlestick",
			"Volume",
			"EMA",
			"BollingerBand",
			"RSI",
			"MACD",
			"CVDApprox",
			"StrengthElder",
			"Whale",
		];

		phaseOneTypes.forEach((type) => {
			expect(registered).toContain(type);
		});
	});

	it("every registered entry has non-empty yExtentsAccessors", () => {
		listRegistered().forEach((type) => {
			const entry = getSeries(type);
			expect(Array.isArray(entry.yExtentsAccessors)).toBe(true);
			expect(entry.yExtentsAccessors.length).toBeGreaterThan(0);
		});
	});
});
