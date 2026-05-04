# S-4: 5 Preset Panes + PANE_MAX_VISIBLE = 5
## Exact Code Diff — Ready for Implementation

**Branch target:** `dev`  
**Depends on:** S-1 (SeriesConfig.visible field must exist)  
**Can run in parallel with:** S-2, S-3 (independent from render layer)  
**Slice status:** NOT STARTED

---

## File 1: `src/lib/core/types/pane-descriptor.ts`

### Change 1 of 2 — Update `PANE_MAX_VISIBLE`

**Find:**
```typescript
export const PANE_LAYOUT_STORAGE_KEY = "rsc-pane-layout-v1";
export const PANE_MAX_VISIBLE = 3;
```

**Replace with:**
```typescript
export const PANE_LAYOUT_STORAGE_KEY = "rsc-pane-layout-v1";
export const PANE_MAX_VISIBLE = 5;
```

**Why keep storage key v1:** `sanitizeLayout()` in `useDynamicPanes.ts` validates loaded layouts. A valid v1 layout with 3 panes will load fine. The new 2 panes (orderflow, strength) are simply absent from stored layouts — users will not see them until they `resetToDefault`. This is intentional and non-destructive.

---

### Change 2 of 2 — Update `DEFAULT_PANES`

**Find the entire DEFAULT_PANES export (lines ~44 to end of file):**
```typescript
export const DEFAULT_PANES: PaneDescriptor[] = [
	{
		id: "price",
		label: "Price",
		pinned: true,
		visible: true,
		heightRatio: 0.55,
		splitScale: false,
		tooltip: "ohlc",
		series: [
			{ type: "Candlestick", yAxis: "right" },
			{ type: "EMA", params: { period: 20, color: "#2d9cdb" }, yAxis: "right", overlay: true },
			{ type: "EMA", params: { period: 50, color: "#f2994a" }, yAxis: "right", overlay: true },
			{ type: "BollingerBand", params: { period: 20, stdDev: 2 }, yAxis: "right", overlay: true },
		],
	},
	{
		id: "volume",
		label: "Volume",
		pinned: false,
		visible: true,
		heightRatio: 0.25,
		splitScale: false,
		tooltip: "value",
		series: [
			{ type: "Volume", yAxis: "right" },
		],
	},
	{
		id: "momentum",
		label: "RSI+MACD",
		pinned: false,
		visible: true,
		heightRatio: 0.20,
		splitScale: true,
		tooltip: "value",
		series: [
			{ type: "RSI", params: { period: 14 }, yAxis: "left" },
			{ type: "MACD", params: { fast: 12, slow: 26, signal: 9 }, yAxis: "right" },
		],
	},
];
```

**Replace with:**
```typescript
export const DEFAULT_PANES: PaneDescriptor[] = [
	// ── 1: PRICE — pinned, always visible ────────────────────────────────────
	{
		id: "price",
		label: "Price",
		pinned: true,
		visible: true,
		heightRatio: 0.50,
		splitScale: false,
		tooltip: "ohlc",
		series: [
			{ type: "Candlestick", yAxis: "right" },
			{ type: "EMA", params: { period: 20, color: "#2d9cdb" }, yAxis: "right", overlay: true },
			{ type: "EMA", params: { period: 50, color: "#f2994a" }, yAxis: "right", overlay: true },
			{ type: "BollingerBand", params: { period: 20, stdDev: 2 }, yAxis: "right", overlay: true },
		],
	},
	// ── 2: VOLUME — visible by default ───────────────────────────────────────
	{
		id: "volume",
		label: "Volume",
		pinned: false,
		visible: true,
		heightRatio: 0.22,
		splitScale: false,
		tooltip: "value",
		series: [
			{ type: "Volume", yAxis: "right" },
		],
	},
	// ── 3: MOMENTUM (RSI + MACD) — visible by default ────────────────────────
	{
		id: "momentum",
		label: "RSI+MACD",
		pinned: false,
		visible: true,
		heightRatio: 0.28,
		splitScale: true,
		tooltip: "value",
		series: [
			{ type: "RSI", params: { period: 14 }, yAxis: "left" },
			{ type: "MACD", params: { fast: 12, slow: 26, signal: 9 }, yAxis: "right" },
		],
	},
	// ── 4: ORDER FLOW — hidden by default, enable via Panes menu ─────────────
	{
		id: "orderflow",
		label: "Order Flow",
		pinned: false,
		visible: false,
		heightRatio: 0.20,
		splitScale: false,
		tooltip: "value",
		series: [
			{ type: "Whale", params: { threshold: 50_000 }, yAxis: "right" },
			{ type: "CVDApprox", yAxis: "right" },
		],
	},
	// ── 5: STRENGTH — hidden by default, enable via Panes menu ───────────────
	{
		id: "strength",
		label: "Strength",
		pinned: false,
		visible: false,
		heightRatio: 0.18,
		splitScale: true,
		tooltip: "value",
		series: [
			{ type: "StrengthElder", yAxis: "left" },
			{ type: "StrengthRelative", yAxis: "right" },
		],
	},
];
```

**Height ratio check — visible panes only:**
- Price: 0.50
- Volume: 0.22
- Momentum: 0.28
- **Total = 1.00** ✓

Hidden panes (orderflow=0.20, strength=0.18) are irrelevant to normalization on load since `normalizeVisibleRatios()` only sums visible pane ratios. Their stored ratios are used when the pane is restored.

---

## File 2: `src/lib/core/types/__tests__/pane-descriptor.test.ts`

### Change — Update tests that hardcode "3 panes"

**Find:**
```typescript
	it("DEFAULT_PANES has 3 panes all visible", () => {
		expect(DEFAULT_PANES).toHaveLength(3);
		expect(DEFAULT_PANES.every((pane) => pane.visible)).toBe(true);
	});
```

**Replace with:**
```typescript
	it("DEFAULT_PANES has 5 panes, 3 visible by default", () => {
		expect(DEFAULT_PANES).toHaveLength(5);
		expect(DEFAULT_PANES.filter((pane) => pane.visible)).toHaveLength(3);
		// Only the pinned pane is guaranteed visible; others vary
		expect(DEFAULT_PANES[0]?.pinned).toBe(true);
		expect(DEFAULT_PANES[0]?.visible).toBe(true);
	});
```

**Find:**
```typescript
	it("equals rsc-pane-layout-v1", () => {
		expect(PANE_LAYOUT_STORAGE_KEY).toBe("rsc-pane-layout-v1");
	});
```

**Keep as-is** (storage key unchanged).

Also **find and update** the `loadPaneLayout` test that checks `toHaveLength(3)`:

```typescript
	it("loads default panes when storage is empty", () => {
		const storage = createMockStorage();
		const panes = loadPaneLayout(storage);
		expect(panes).toHaveLength(3);   // ← CHANGE TO 5
		expect(panes[0]?.pinned).toBe(true);
	});
```

**Replace the expectation:**
```typescript
	it("loads default panes when storage is empty", () => {
		const storage = createMockStorage();
		const panes = loadPaneLayout(storage);
		expect(panes).toHaveLength(5);
		expect(panes[0]?.pinned).toBe(true);
	});
```

---

## File 3: `src/lib/core/hooks/__tests__/useDynamicPanes.test.ts`

### Change — Update `addPane` rejection test

**Find:**
```typescript
	it("addPane is rejected when three panes are already visible", () => {
		const next = dynamicPanesReducer(createDefaultPaneLayout(), {
			type: "addPane",
			pane: { label: "CVD", pinned: false, visible: true, heightRatio: 0.2, series: [], splitScale: false, tooltip: "value" },
		});
		expect(next).toHaveLength(3);
	});
```

**Replace with:**
```typescript
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
```

Also **update the `loadPaneLayout` test** in this file if it also checks length:
```typescript
	it("falls back to default panes when storage is corrupt", () => {
		const storage = createMockStorage("{{invalid json}}");
		const panes = loadPaneLayout(storage);
		expect(panes).toHaveLength(5);  // was 3
	});
```

---

## Acceptance Criteria Checklist

- [ ] `PANE_MAX_VISIBLE` = 5
- [ ] `DEFAULT_PANES` has exactly 5 entries
- [ ] `DEFAULT_PANES[0].id === "price"`, `pinned: true`, `visible: true`
- [ ] `DEFAULT_PANES[3].id === "orderflow"`, `visible: false`
- [ ] `DEFAULT_PANES[4].id === "strength"`, `visible: false`
- [ ] `sum(visible pane heightRatios) === 1.0` (3 visible panes: 0.50 + 0.22 + 0.28 = 1.00)
- [ ] `orderflow` pane includes `Whale` and `CVDApprox` series
- [ ] `strength` pane includes `StrengthElder` and `StrengthRelative` series
- [ ] Test `DEFAULT_PANES has 5 panes` updated and passing
- [ ] Test `addPane is rejected when PANE_MAX_VISIBLE` updated and passing
- [ ] Browser test: Panes menu shows 5 entries (3 checked, 2 unchecked)
- [ ] Browser test: Check "Order Flow" → Whale + CVD bars appear in new pane
- [ ] Browser test: Check "Strength" → Elder Ray + RS line appear in new pane
- [ ] Browser test: Uncheck a pane → pane hides, ratio redistributes
- [ ] Browser test: `resetToDefault` → returns to 3 visible panes
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run test` → all tests pass
- [ ] `npm run build:docs` → compiled successfully

---

## Notes for Implementation

### Why `heightRatio: 0.20` for hidden panes?
This is the ratio used when those panes are restored. `normalizeVisibleRatios()` does NOT touch hidden panes. When a user enables OrderFlow, the visible panes are re-normalized including its 0.20 ratio contribution — so Price will shrink proportionally. This is correct GoCharting-like behavior (new panes take space from existing ones).

### EMA color conflict
DEFAULT_PANES uses `params: { period: 20, color: "#2d9cdb" }` for EMA. The `color` in params is the legacy pattern from original. The new `SeriesConfig.color` field is preferred. Both exist — `renderSeries` checks `series.color ?? String(params.color ?? "#2962ff")`. No conflict.

### `splitScale: false` for OrderFlow
Both `Whale` and `CVDApprox` are bar series on the same y-axis. `splitScale: false` puts them in a single Chart with a shared scale. `CVDApprox` is a running sum (line shape) so it would share the bar scale. **If the team prefers CVD on a separate scale**, change `orderflow.splitScale = true` and set `CVDApprox.yAxis = "right"`.
