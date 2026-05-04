import { describe, expect, it } from "vitest";
import { DEFAULT_PANES, PANE_LAYOUT_STORAGE_KEY } from "../pane-descriptor";

describe("DEFAULT_PANES", () => {
	it("sum of visible heightRatio equals 1.0", () => {
		const visible = DEFAULT_PANES.filter((pane) => pane.visible);
		const sum = visible.reduce((acc, pane) => acc + pane.heightRatio, 0);
		expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
	});

	it("first pane is pinned", () => {
		expect(DEFAULT_PANES[0]?.pinned).toBe(true);
	});

	it("all panes have unique id", () => {
		const ids = DEFAULT_PANES.map((pane) => pane.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("DEFAULT_PANES has 3 panes all visible", () => {
		expect(DEFAULT_PANES).toHaveLength(3);
		expect(DEFAULT_PANES.every((pane) => pane.visible)).toBe(true);
	});
});

describe("PANE_LAYOUT_STORAGE_KEY", () => {
	it("equals rsc-pane-layout-v1", () => {
		expect(PANE_LAYOUT_STORAGE_KEY).toBe("rsc-pane-layout-v1");
	});
});
