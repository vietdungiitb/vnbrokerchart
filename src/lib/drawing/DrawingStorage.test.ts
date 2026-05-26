import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDrawingObject } from "./shared";
import { createLocalStorageAdapter, DrawingImportError } from "./DrawingStorage";
import { clearDrawingStyleTemplates, getDrawingStyleTemplate, saveDrawingStyleTemplate } from "./drawingStyleRegistry";

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
	], { id: "drawing-1", paneId: "momentum", yScaleId: "right" });

	beforeEach(() => {
		vi.stubGlobal("localStorage", createStorageMock());
		clearDrawingStyleTemplates();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		clearDrawingStyleTemplates();
	});

	it("round-trips drawings by symbol and timeframe", () => {
		const adapter = createLocalStorageAdapter();
		adapter.save("BTCUSD", "1h", [drawing]);

		expect(adapter.load("BTCUSD", "1h")).toEqual({ drawings: [drawing], hasData: true });
		expect(adapter.load("BTCUSD", "5m")).toEqual({ drawings: [], hasData: false });

		adapter.clear("BTCUSD", "1h");
		expect(adapter.load("BTCUSD", "1h")).toEqual({ drawings: [], hasData: false });
	});

	it("preserves alert rules through load and export", () => {
		const alertDrawing = createDrawingObject("hLine", [
			{ x: 100_000, y: 20 },
			{ x: 160_000, y: 20 },
		], {
			id: "drawing-alert-1",
			alert: { enabled: true, trigger: "closeAbove" },
		});
		const adapter = createLocalStorageAdapter();
		adapter.save("BTCUSD", "1h", [alertDrawing]);

		expect(adapter.load("BTCUSD", "1h")).toEqual({ drawings: [alertDrawing], hasData: true });
		expect(adapter.importJSON(adapter.exportJSON([alertDrawing]))).toEqual([alertDrawing]);
	});

	it("exports and imports JSON payloads", () => {
		const adapter = createLocalStorageAdapter();
		const payload = adapter.exportJSON([drawing]);
		expect(JSON.parse(payload)).toEqual({
			drawings: [drawing],
			styleTemplates: {},
		});
		expect(adapter.importJSON(payload)).toEqual([drawing]);
	});

	it("restores the previous style templates if import validation fails", () => {
		saveDrawingStyleTemplate("trendLine", {
			stroke: "#123456",
			strokeWidth: 2,
		});

		const adapter = createLocalStorageAdapter();
		const payload = JSON.stringify({
			drawings: [
				{
					id: "broken-drawing",
					type: "legacyTool",
					points: [{ x: 100_000, y: 20 }],
					style: { stroke: "#ff0000", strokeWidth: 3 },
				},
			],
			styleTemplates: {
				trendLine: {
					stroke: "#ff0000",
					strokeWidth: 3,
				},
			},
		});

		expect(() => adapter.importJSON(payload)).toThrow(DrawingImportError);
		expect(getDrawingStyleTemplate("trendLine")).toEqual({
			stroke: "#123456",
			strokeWidth: 2,
		});
	});

	it("applies saved templates to new drawings and restores them from storage", () => {
		saveDrawingStyleTemplate("trendLine", {
			stroke: "#ff0000",
			strokeWidth: 3,
			fill: "#ffeeee",
		});
		saveDrawingStyleTemplate("fibonacci", {
			stroke: "#00aa88",
			strokeDasharray: "dotted",
		});

		const trendLine = createDrawingObject("trendLine", [
			{ x: 100_000, y: 20 },
			{ x: 160_000, y: 40 },
		], { id: "drawing-template-1" });
		const fibonacci = createDrawingObject("fibonacci", [
			{ x: 100_000, y: 20 },
			{ x: 160_000, y: 40 },
		], { id: "drawing-template-2" });

		expect(trendLine.style).toMatchObject({
			stroke: "#ff0000",
			strokeWidth: 3,
			fill: "#ffeeee",
		});
		expect(fibonacci.style).toMatchObject({
			stroke: "#00aa88",
			strokeDasharray: "dotted",
		});

		const adapter = createLocalStorageAdapter();
		const payload = adapter.exportJSON([trendLine, fibonacci]);

		expect(JSON.parse(payload)).toEqual({
			drawings: [trendLine, fibonacci],
			styleTemplates: {
				trendLine: {
					stroke: "#ff0000",
					strokeWidth: 3,
					fill: "#ffeeee",
				},
				fibonacci: {
					stroke: "#00aa88",
					strokeDasharray: "dotted",
				},
			},
		});

		clearDrawingStyleTemplates();
		expect(getDrawingStyleTemplate("trendLine")).toBeUndefined();

		expect(adapter.importJSON(payload)).toEqual([trendLine, fibonacci]);
		expect(getDrawingStyleTemplate("trendLine")).toEqual({
			stroke: "#ff0000",
			strokeWidth: 3,
			fill: "#ffeeee",
		});
		expect(getDrawingStyleTemplate("fibonacci")).toEqual({
			stroke: "#00aa88",
			strokeDasharray: "dotted",
		});
	});

	it("rejects invalid payloads", () => {
		const adapter = createLocalStorageAdapter();
		expect(() => adapter.importJSON("{}" )).toThrow(DrawingImportError);
	});

	it("ignores and clears invalid cached drawings on load", () => {
		const adapter = createLocalStorageAdapter();
		globalThis.localStorage.setItem("rsc-drawings-v1-BTCUSD-1h", JSON.stringify([
			{
				id: "drawing-legacy",
				type: "legacyTool",
				points: [{ x: 100_000, y: 20 }],
				style: { stroke: "#fff", strokeWidth: 1 },
			},
		]));

		expect(adapter.load("BTCUSD", "1h")).toEqual({ drawings: [], hasData: true });
		expect(globalThis.localStorage.getItem("rsc-drawings-v1-BTCUSD-1h")).toBeNull();
	});
});
