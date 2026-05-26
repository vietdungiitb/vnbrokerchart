import { afterEach, describe, expect, it, vi } from "vitest";
import { createDrawingObject } from "./shared";
import { applyDrawingStyleTemplate, clearDrawingStyleTemplate, clearDrawingStyleTemplates, clearDrawingStyleOverride, clearDrawingStyleOverrides, getDrawingStyleOverride, getDrawingStyleTemplate, listDrawingStyleOverrides, listDrawingStyleTemplates, overrideDrawingStyle, projectDrawingStyleUpdate, resolveDrawingStyle, saveDrawingStyleTemplate, subscribeDrawingStyle, subscribeDrawingStyleChanges } from "./drawingStyleRegistry";

afterEach(() => {
	clearDrawingStyleOverrides();
	clearDrawingStyleTemplates();
	vi.restoreAllMocks();
});

describe("drawing style override registry", () => {
	it("sets and merges overrides per drawing", () => {
		const drawing = createDrawingObject("trendLine", [
			{ x: 10, y: 20 },
			{ x: 20, y: 30 },
		], { id: "drawing-1" });

		overrideDrawingStyle(drawing.id, { color: "#ff0000" });
		overrideDrawingStyle(drawing.id, { lineWidth: 3, dashPattern: [6, 4] });

		expect(getDrawingStyleOverride(drawing.id)).toEqual({ color: "#ff0000", lineWidth: 3, dashPattern: [6, 4] });
		expect(listDrawingStyleOverrides()).toEqual({
			"drawing-1": { color: "#ff0000", lineWidth: 3, dashPattern: [6, 4] },
		});
		expect(resolveDrawingStyle(drawing)).toMatchObject({
			stroke: "#ff0000",
			strokeWidth: 3,
			strokeDasharray: "dashed",
		});
	});

	it("projects resolved style updates back into the object snapshot and override layer", () => {
		const drawing = createDrawingObject("trendLine", [
			{ x: 10, y: 20 },
			{ x: 20, y: 30 },
		], {
			id: "drawing-3",
			style: {
				stroke: "#111111",
				strokeWidth: 1,
				strokeDasharray: "dashed",
				fill: "#222222",
			},
		});

		overrideDrawingStyle(drawing.id, { color: "#ff0000" });

		const { drawingPatch, overridePatch } = projectDrawingStyleUpdate(drawing, { strokeWidth: 4, strokeDasharray: "solid", fill: "#333333" });

		expect(drawingPatch.style).toMatchObject({
			stroke: "#ff0000",
			strokeWidth: 4,
			strokeDasharray: "solid",
			fill: "#333333",
		});
		expect(overridePatch).toEqual({
			lineWidth: 4,
			dashPattern: [],
		});
	});

	it("saves and applies templates by tool type", () => {
		saveDrawingStyleTemplate("trendLine", {
			stroke: "#ff0000",
			strokeWidth: 3,
			fill: "#ffeeee",
		});
		saveDrawingStyleTemplate("fibonacci", {
			stroke: "#00aa88",
			strokeDasharray: "dotted",
		});

		expect(getDrawingStyleTemplate("trendLine")).toEqual({
			stroke: "#ff0000",
			strokeWidth: 3,
			fill: "#ffeeee",
		});
		expect(listDrawingStyleTemplates()).toEqual({
			trendLine: {
				stroke: "#ff0000",
				strokeWidth: 3,
				fill: "#ffeeee",
			},
			fibonacci: {
				stroke: "#00aa88",
				strokeDasharray: "dotted",
			},
		});

		const trendLine = createDrawingObject("trendLine", [
			{ x: 10, y: 20 },
			{ x: 20, y: 30 },
		]);
		const fibonacci = createDrawingObject("fibonacci", [
			{ x: 10, y: 20 },
			{ x: 20, y: 30 },
		]);

		expect(trendLine.style).toMatchObject({
			stroke: "#ff0000",
			strokeWidth: 3,
			fill: "#ffeeee",
		});
		expect(fibonacci.style).toMatchObject({
			stroke: "#00aa88",
			strokeDasharray: "dotted",
		});
		expect(applyDrawingStyleTemplate("trendLine", trendLine.style)).toMatchObject({
			stroke: "#ff0000",
			strokeWidth: 3,
			fill: "#ffeeee",
		});
		expect(applyDrawingStyleTemplate("fibonacci", fibonacci.style)).toMatchObject({
			stroke: "#00aa88",
			strokeDasharray: "dotted",
		});

		clearDrawingStyleTemplate("trendLine");
		expect(getDrawingStyleTemplate("trendLine")).toBeUndefined();
	});

	it("notifies subscribers and clears overrides", () => {
		const drawing = createDrawingObject("trendLine", [
			{ x: 10, y: 20 },
			{ x: 20, y: 30 },
		], { id: "drawing-2" });
		const perDrawing = vi.fn();
		const global = vi.fn();
		const unsubscribeInstance = subscribeDrawingStyle(drawing.id, perDrawing);
		const unsubscribeGlobal = subscribeDrawingStyleChanges(global);

		overrideDrawingStyle(drawing.id, { opacity: 0.4 });
		clearDrawingStyleOverride(drawing.id);

		expect(perDrawing).toHaveBeenCalledTimes(2);
		expect(global).toHaveBeenCalledTimes(2);
		expect(getDrawingStyleOverride(drawing.id)).toBeUndefined();

		unsubscribeInstance();
		unsubscribeGlobal();
	});
});