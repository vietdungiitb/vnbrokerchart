import { describe, expect, it } from "vitest";
import { DEFAULT_PANES, PANE_LAYOUT_STORAGE_KEY } from "../../types/pane-descriptor";
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
		expect(panes).toHaveLength(3);
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
		expect(panes).toHaveLength(3);
	});

	it("savePaneLayout writes the storage key payload", () => {
		const storage = createMockStorage();
		savePaneLayout(DEFAULT_PANES, storage);
		const payload = JSON.parse(storage.value ?? "null") as { version?: number; panes?: unknown[] } | null;
		expect(payload?.version).toBe(1);
		expect(payload?.panes).toHaveLength(3);
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

	it("addPane is rejected when three panes are already visible", () => {
		const next = dynamicPanesReducer(createDefaultPaneLayout(), {
			type: "addPane",
			pane: { label: "CVD", pinned: false, visible: true, heightRatio: 0.2, series: [], splitScale: false, tooltip: "value" },
		});
		expect(next).toHaveLength(3);
	});

	it("removePane ignores pinned panes", () => {
		const next = dynamicPanesReducer(createDefaultPaneLayout(), { type: "removePane", id: "price" });
		expect(next).toHaveLength(3);
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
});
