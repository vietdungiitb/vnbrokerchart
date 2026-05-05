import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDrawingObject } from "./shared";
import { createLocalStorageAdapter, DrawingImportError } from "./DrawingStorage";

function createStorageMock() {
	const store = new Map<string, string>();
	return {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => {
			store.set(key, value);
		},
		removeItem: (key: string) => {
			store.delete(key);
		},
		clear: () => {
			store.clear();
		},
	};
}

describe("DrawingStorage adapter", () => {
	const drawing = createDrawingObject("trendLine", [
		{ x: 100_000, y: 20 },
		{ x: 160_000, y: 40 },
	], { id: "drawing-1" });

	beforeEach(() => {
		vi.stubGlobal("localStorage", createStorageMock());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("round-trips drawings by symbol and timeframe", () => {
		const adapter = createLocalStorageAdapter();
		adapter.save("BTCUSD", "1h", [drawing]);

		expect(adapter.load("BTCUSD", "1h")).toEqual([drawing]);
		expect(adapter.load("BTCUSD", "5m")).toEqual([]);

		adapter.clear("BTCUSD", "1h");
		expect(adapter.load("BTCUSD", "1h")).toEqual([]);
	});

	it("exports and imports JSON payloads", () => {
		const adapter = createLocalStorageAdapter();
		const payload = adapter.exportJSON([drawing]);
		expect(adapter.importJSON(payload)).toEqual([drawing]);
	});

	it("rejects invalid payloads", () => {
		const adapter = createLocalStorageAdapter();
		expect(() => adapter.importJSON("{}" )).toThrow(DrawingImportError);
	});
});
