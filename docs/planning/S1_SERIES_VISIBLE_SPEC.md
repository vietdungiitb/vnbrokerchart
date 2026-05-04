# S-1: SeriesConfig.visible + toggleSeriesVisible Action
## Exact Code Diff — Ready for Implementation

**Branch target:** `dev`  
**Depends on:** nothing  
**Slice status:** NOT STARTED

---

## File 1: `src/lib/core/types/pane-descriptor.ts`

### Change 1 of 1 — Add `visible?: boolean` to `SeriesConfig`

```diff
 export interface SeriesConfig {
 	type: SeriesTypeId;
 	params?: Record<string, unknown>;
 	yAxis: YAxisSide;
 	overlay?: boolean;
 	color?: string;
+	visible?: boolean;  // undefined | true = render; false = hidden (soft-hide, data still computed)
 }
```

**Why:** Foundation for all other slices. `undefined` means "visible" for backwards compatibility — all existing series in DEFAULT_PANES will continue to render without any changes needed.

---

## File 2: `src/lib/core/hooks/useDynamicPanes.ts`

### Change 1 of 4 — Add action to `DynamicPaneAction` union

**Find this block (lines ~23–31):**
```typescript
export type DynamicPaneAction =
	| { type: "toggleVisible"; id: string }
	| { type: "addPane"; pane: Omit<PaneDescriptor, "id"> }
	| { type: "removePane"; id: string }
	| { type: "restorePane"; id: string }
	| { type: "addSeries"; paneId: string; series: SeriesConfig }
	| { type: "removeSeries"; paneId: string; seriesType: SeriesTypeId }
	| { type: "applyDelta"; splitterIndex: number; deltaY: number; available: number }
	| { type: "resetToDefault" }
	| { type: "reorderPanes"; fromVisibleIndex: number; toVisibleIndex: number };
```

**Replace with:**
```typescript
export type DynamicPaneAction =
	| { type: "toggleVisible"; id: string }
	| { type: "addPane"; pane: Omit<PaneDescriptor, "id"> }
	| { type: "removePane"; id: string }
	| { type: "restorePane"; id: string }
	| { type: "addSeries"; paneId: string; series: SeriesConfig }
	| { type: "removeSeries"; paneId: string; seriesType: SeriesTypeId }
	| { type: "toggleSeriesVisible"; paneId: string; seriesType: SeriesTypeId }
	| { type: "updateSeriesParams"; paneId: string; seriesType: SeriesTypeId; params: Record<string, unknown> }
	| { type: "applyDelta"; splitterIndex: number; deltaY: number; available: number }
	| { type: "resetToDefault" }
	| { type: "reorderPanes"; fromVisibleIndex: number; toVisibleIndex: number };
```

**Notes:**
- `toggleSeriesVisible` — used by S-1/S-3 indicator legend chips
- `updateSeriesParams` — used by S-5 Settings panel (included here to avoid a second PR)

---

### Change 2 of 4 — Add `toggleSeriesVisible` and `updateSeriesParams` to `UseDynamicPanesResult`

**Find this block (lines ~33–47):**
```typescript
export interface UseDynamicPanesResult {
	panes: PaneDescriptor[];
	visiblePanes: PaneDescriptor[];
	heights: number[];
	available: number;
	toggleVisible: (id: string) => void;
	addPane: (pane: Omit<PaneDescriptor, "id">) => void;
	removePane: (id: string) => void;
	restorePane: (id: string) => void;
	addSeries: (paneId: string, series: SeriesConfig) => void;
	removeSeries: (paneId: string, seriesType: SeriesTypeId) => void;
	applyDelta: (splitterIndex: number, deltaY: number) => void;
	resetToDefault: () => void;
	reorderPanes: (fromVisibleIndex: number, toVisibleIndex: number) => void;
	canAddPane: boolean;
}
```

**Replace with:**
```typescript
export interface UseDynamicPanesResult {
	panes: PaneDescriptor[];
	visiblePanes: PaneDescriptor[];
	heights: number[];
	available: number;
	toggleVisible: (id: string) => void;
	addPane: (pane: Omit<PaneDescriptor, "id">) => void;
	removePane: (id: string) => void;
	restorePane: (id: string) => void;
	addSeries: (paneId: string, series: SeriesConfig) => void;
	removeSeries: (paneId: string, seriesType: SeriesTypeId) => void;
	toggleSeriesVisible: (paneId: string, seriesType: SeriesTypeId) => void;
	updateSeriesParams: (paneId: string, seriesType: SeriesTypeId, params: Record<string, unknown>) => void;
	applyDelta: (splitterIndex: number, deltaY: number) => void;
	resetToDefault: () => void;
	reorderPanes: (fromVisibleIndex: number, toVisibleIndex: number) => void;
	canAddPane: boolean;
}
```

---

### Change 3 of 4 — Add `restorePane` series reset + new reducer cases

**Find this block in `dynamicPanesReducer` (after the `addPane` case):**
```typescript
		case "removePane": {
```

**Add BEFORE `removePane` (i.e. as a new case immediately after `addPane`'s closing brace):**

First, update `restorePane` to also reset all series visible state. Find this exact block:
```typescript
		case "restorePane": {
			const next = clonePaneList(state);
			if (visibleCount(next) >= PANE_MAX_VISIBLE) {
				return next;
			}
			const pane = next.find((item) => item.id === action.id);
			if (!pane) {
				return next;
			}
			pane.visible = true;
			return normalizeVisibleRatios(next);
		}
```

**Replace with:**
```typescript
		case "restorePane": {
			const next = clonePaneList(state);
			if (visibleCount(next) >= PANE_MAX_VISIBLE) {
				return next;
			}
			const pane = next.find((item) => item.id === action.id);
			if (!pane) {
				return next;
			}
			pane.visible = true;
			// Restore all series visibility when restoring a pane
			pane.series.forEach((s) => { s.visible = true; });
			return normalizeVisibleRatios(next);
		}
```

Then find the `default:` case at the bottom of the reducer and add new cases BEFORE it:

**Find:**
```typescript
		default:
			return clonePaneList(state);
	}
}
```

**Replace with:**
```typescript
		case "toggleSeriesVisible": {
			const next = clonePaneList(state);
			const pane = next.find((p) => p.id === action.paneId);
			if (!pane) return next;
			const series = pane.series.find((s) => s.type === action.seriesType);
			if (!series) return next;
			// Toggle: false → true, undefined/true → false
			series.visible = series.visible === false ? true : false;
			// AD-2: auto-hide non-pinned pane when all its series are hidden
			if (!pane.pinned) {
				const anyVisible = pane.series.some((s) => s.visible !== false);
				if (!anyVisible && pane.visible && visibleCount(next) > 1) {
					pane.visible = false;
				}
			}
			return normalizeVisibleRatios(next);
		}
		case "updateSeriesParams": {
			const next = clonePaneList(state);
			const pane = next.find((p) => p.id === action.paneId);
			if (!pane) return next;
			const series = pane.series.find((s) => s.type === action.seriesType);
			if (!series) return next;
			series.params = { ...(series.params ?? {}), ...action.params };
			return next;
		}
		default:
			return clonePaneList(state);
	}
}
```

---

### Change 4 of 4 — Add callbacks and return values in `useDynamicPanes` hook

**Find this block (the `reorderPanes` callback near end of hook):**
```typescript
	const reorderPanes = useCallback((fromVisibleIndex: number, toVisibleIndex: number) => {
		dispatch({ type: "reorderPanes", fromVisibleIndex, toVisibleIndex });
	}, []);

	return {
		panes,
		visiblePanes,
		heights,
		available,
		toggleVisible,
		addPane,
		removePane,
		restorePane,
		addSeries,
		removeSeries,
		applyDelta,
		resetToDefault,
		reorderPanes,
		canAddPane: visiblePanes.length < PANE_MAX_VISIBLE,
	};
}
```

**Replace with:**
```typescript
	const reorderPanes = useCallback((fromVisibleIndex: number, toVisibleIndex: number) => {
		dispatch({ type: "reorderPanes", fromVisibleIndex, toVisibleIndex });
	}, []);

	const toggleSeriesVisible = useCallback((paneId: string, seriesType: SeriesTypeId) => {
		dispatch({ type: "toggleSeriesVisible", paneId, seriesType });
	}, []);

	const updateSeriesParams = useCallback((paneId: string, seriesType: SeriesTypeId, params: Record<string, unknown>) => {
		dispatch({ type: "updateSeriesParams", paneId, seriesType, params });
	}, []);

	return {
		panes,
		visiblePanes,
		heights,
		available,
		toggleVisible,
		addPane,
		removePane,
		restorePane,
		addSeries,
		removeSeries,
		toggleSeriesVisible,
		updateSeriesParams,
		applyDelta,
		resetToDefault,
		reorderPanes,
		canAddPane: visiblePanes.length < PANE_MAX_VISIBLE,
	};
}
```

---

## File 3: `src/lib/core/hooks/__tests__/useDynamicPanes.test.ts`

Add these 5 tests at the end of the `dynamicPanesReducer` describe block:

```typescript
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
		// Volume pane has 1 series — hide it; but if it's the last non-pinned visible pane, still hide it
		// (pinned=price is always visible, so other panes can all hide)
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
```

---

## Acceptance Criteria Checklist

- [ ] `SeriesConfig.visible?: boolean` field added
- [ ] `DynamicPaneAction` union includes `toggleSeriesVisible` and `updateSeriesParams`
- [ ] `UseDynamicPanesResult` interface includes `toggleSeriesVisible` and `updateSeriesParams`
- [ ] `restorePane` case resets all series visible to `true`
- [ ] `toggleSeriesVisible` reducer toggles `series.visible`, auto-hides pane if needed
- [ ] `updateSeriesParams` reducer merges params
- [ ] 5 new tests pass
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run test` → all tests pass (≥ 32)
- [ ] `npm run build:docs` → compiled successfully
