import { describe, expect, it } from "vitest";
import { resolveBollingerBandFillColor } from "../DynamicChart";

describe("resolveBollingerBandFillColor", () => {
	it("falls back to a stable light fill when no custom fill is provided", () => {
		expect(resolveBollingerBandFillColor({})).toBe("#bfdbfe");
	});

	it("preserves an explicit fill override", () => {
		expect(resolveBollingerBandFillColor({ fill: "#dbeafe" })).toBe("#dbeafe");
	});

	it("ignores unrelated params and keeps the fallback stable", () => {
		expect(resolveBollingerBandFillColor({ color: "#ef4444", opacity: 0.9, fillOpacity: 0.3 })).toBe("#bfdbfe");
	});
});
