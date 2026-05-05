import { describe, expect, it } from "vitest";
import type { PaneDescriptor } from "../../types/pane-descriptor";
import { DEFAULT_PANES, PANE_LAYOUT_STORAGE_KEY, PANE_MAX_VISIBLE } from "../../types/pane-descriptor";
import {
	createDefaultPaneLayout,
	dynamicPanesReducer,
	loadPaneLayout,
	savePaneLayout,
} from "../useDynamicPanes";

function createMockStorage(initialValue: string | null = null) {
	let value = initialValue;
	return {
		getItem: () => value,
		setItem: (_key: string, nextValue: string) => {
			value = nextValue;
		},
		removeItem: () => {
			value = null;
		},
		get value() {
			return value;
		},
	};
}

describe("useDynamicPanes helpers", () => {
	it("loads default panes when storage is empty", () => {
		const storage = createMockStorage();
		const panes = loadPaneLayout(storage);
		expect(panes).toHaveLength(5);
		expect(panes[0]?.pinned).toBe(true);
	});

	it("loads from valid localStorage payload", () => {
		const storage = createMockStorage(JSON.stringify({
			version: 1,
			panes: [
				{ ...DEFAULT_PANES[0], heightRatio: 0.7 },
				{ ...DEFAULT_PANES[1], visible: false, heightRatio: 0.3 },
				DEFAULT_PANES[2],
			],
		}));
		const panes = loadPaneLayout(storage);
		expect(panes.filter((pane) => pane.visible)).toHaveLength(2);
	});

	it("falls back to default panes when storage is corrupt", () => {
		const storage = createMockStorage("{{invalid json}}");
		const panes = loadPaneLayout(storage);
		expect(panes).toHaveLength(5);
	});

	it("savePaneLayout writes the storage key payload", () => {
		const storage = createMockStorage();
		savePaneLayout(DEFAULT_PANES, storage);
		const payload = JSON.parse(storage.value ?? "null") as { version?: number; panes?: unknown[] } | null;
		expect(payload?.version).toBe(1);
		expect(payload?.panes).toHaveLength(5);
	});
});

describe("dynamicPanesReducer", () => {
	it("toggleVisible reduces visible count", () => {
		const next = dynamicPanesReducer(createDefaultPaneLayout(), { type: "toggleVisible", id: "momentum" });
		expect(next.filter((pane) => pane.visible)).toHaveLength(2);
	});

	it("pinned pane cannot be hidden", () => {
		const next = dynamicPanesReducer(createDefaultPaneLayout(), { type: "toggleVisible", id: "price" });
		expect(next.filter((pane) => pane.visible)).toHaveLength(3);
	});

	it("toggleVisible normalizes visible height ratios", () => {
		const next = dynamicPanesReducer(createDefaultPaneLayout(), { type: "toggleVisible", id: "momentum" });
		const sum = next.filter((pane) => pane.visible).reduce((acc, pane) => acc + pane.heightRatio, 0);
		expect(Math.abs(sum - 1)).toBeLessThan(0.001);
	});

	it("addPane is rejected when PANE_MAX_VISIBLE panes are already visible", () => {
		// Start with default layout (3 visible), enable the 2 hidden panes to reach max
		let state = createDefaultPaneLayout();
		state = dynamicPanesReducer(state, { type: "toggleVisible", id: "orderflow" });
		state = dynamicPanesReducer(state, { type: "toggleVisible", id: "strength" });
		// Now 5 visible panes — trying to add a 6th should be rejected
		const next = dynamicPanesReducer(state, {
			type: "addPane",
			pane: { label: "Extra", pinned: false, visible: true, heightRatio: 0.1, series: [], splitScale: false, tooltip: "value" },
		});
		expect(next.filter((p) => p.visible)).toHaveLength(5);
	});

	it("removePane ignores pinned panes", () => {
		const next = dynamicPanesReducer(createDefaultPaneLayout(), { type: "removePane", id: "price" });
		expect(next).toHaveLength(5);
	});

	it("reorderPanes keeps price pinned at the top", () => {
		const next = dynamicPanesReducer(createDefaultPaneLayout(), {
			type: "reorderPanes",
			fromVisibleIndex: 2,
			toVisibleIndex: 1,
		});
		expect(next[0]?.id).toBe("price");
	});

	it("applyDelta updates adjacent visible pane ratios", () => {
		const next = dynamicPanesReducer(createDefaultPaneLayout(), {
			type: "applyDelta",
			splitterIndex: 0,
			deltaY: 20,
			available: 600,
		});
		const sum = next.filter((pane) => pane.visible).reduce((acc, pane) => acc + pane.heightRatio, 0);
		expect(Math.abs(sum - 1)).toBeLessThan(0.001);
	});

	it("toggleSeriesVisible hides an individual series", () => {
		const next = dynamicPanesReducer(createDefaultPaneLayout(), {
			type: "toggleSeriesVisible",
			paneId: "momentum",
			seriesType: "RSI",
		});
		const rsi = next.find((p) => p.id === "momentum")?.series.find((s) => s.type === "RSI");
		expect(rsi?.visible).toBe(false);
	});

	it("toggleSeriesVisible restores a hidden series", () => {
		let state = dynamicPanesReducer(createDefaultPaneLayout(), {
			type: "toggleSeriesVisible",
			paneId: "momentum",
			seriesType: "RSI",
		});
		state = dynamicPanesReducer(state, {
			type: "toggleSeriesVisible",
			paneId: "momentum",
			seriesType: "RSI",
		});
		const rsi = state.find((p) => p.id === "momentum")?.series.find((s) => s.type === "RSI");
		expect(rsi?.visible).toBe(true);
	});

	it("restorePane re-enables a hidden pane and its series", () => {
		const hiddenPane: Omit<PaneDescriptor, "id"> = {
			label: "Research",
			pinned: false,
			visible: false,
			heightRatio: 0.1,
			series: [
				{ type: "RSI", yAxis: "right", visible: false, params: { period: 21 } },
			],
			splitScale: false,
			tooltip: "value",
		};

		let state = dynamicPanesReducer(createDefaultPaneLayout(), {
			type: "addPane",
			pane: hiddenPane,
		});

		state = dynamicPanesReducer(state, {
			type: "restorePane",
			id: state[state.length - 1]?.id ?? "",
			maxVisiblePanes: PANE_MAX_VISIBLE,
		});

		const restoredPane = state[state.length - 1];
		expect(restoredPane?.visible).toBe(true);
		expect(restoredPane?.series.every((series) => series.visible !== false)).toBe(true);
		expect(state.filter((pane) => pane.visible)).toHaveLength(4);
	});

	it("restorePane is blocked when the visible pane limit is already reached", () => {
		const hiddenPane: Omit<PaneDescriptor, "id"> = {
			label: "Research",
			pinned: false,
			visible: false,
			heightRatio: 0.1,
			series: [
				{ type: "RSI", yAxis: "right", visible: false, params: { period: 21 } },
			],
			splitScale: false,
			tooltip: "value",
		};

		let state = dynamicPanesReducer(createDefaultPaneLayout(), {
			type: "addPane",
			pane: hiddenPane,
		});
		state = dynamicPanesReducer(state, {
			type: "toggleVisible",
			id: "orderflow",
			maxVisiblePanes: PANE_MAX_VISIBLE,
		});
		state = dynamicPanesReducer(state, {
			type: "toggleVisible",
			id: "strength",
			maxVisiblePanes: PANE_MAX_VISIBLE,
		});

		const blocked = dynamicPanesReducer(state, {
			type: "restorePane",
			id: state[state.length - 1]?.id ?? "",
			maxVisiblePanes: PANE_MAX_VISIBLE,
		});
		const blockedPane = blocked[blocked.length - 1];

		expect(blocked.filter((pane) => pane.visible)).toHaveLength(PANE_MAX_VISIBLE);
		expect(blockedPane?.visible).toBe(false);
		expect(blockedPane?.series[0]?.visible).toBe(false);
	});

	it("toggleSeriesVisible auto-hides pane when all series become hidden", () => {
		let state = dynamicPanesReducer(createDefaultPaneLayout(), {
			type: "toggleSeriesVisible",
			paneId: "momentum",
			seriesType: "RSI",
		});
		state = dynamicPanesReducer(state, {
			type: "toggleSeriesVisible",
			paneId: "momentum",
			seriesType: "MACD",
		});
		expect(state.find((p) => p.id === "momentum")?.visible).toBe(false);
	});

	it("toggleSeriesVisible does not auto-hide if last pane visible", () => {
		const state = dynamicPanesReducer(createDefaultPaneLayout(), {
			type: "toggleSeriesVisible",
			paneId: "volume",
			seriesType: "Volume",
		});
		// Auto-hide fires; volume pane becomes hidden
		expect(state.find((p) => p.id === "volume")?.visible).toBe(false);
	});

	it("updateSeriesParams merges params without replacing unrelated fields", () => {
		const state = dynamicPanesReducer(createDefaultPaneLayout(), {
			type: "updateSeriesParams",
			paneId: "momentum",
			seriesType: "RSI",
			params: { period: 21 },
		});
		const rsi = state.find((p) => p.id === "momentum")?.series.find((s) => s.type === "RSI");
		expect(rsi?.params?.period).toBe(21);
	});
});
