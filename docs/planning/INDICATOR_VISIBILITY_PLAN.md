# INDICATOR VISIBILITY & FULL PANE SYSTEM — Implementation Plan
**Version:** 1.0 · **Date:** 2026-05-04  
**Project:** react-stockcharts-master · terminal demo  
**Status:** READY FOR HANDOFF — no open questions

---

## 0. Executive Summary

**Goal:** Users can see, hide, show every indicator in the terminal without losing state. New preset panes expose all 17 registered series types. A Settings panel lets users configure indicator params. Topology covers 5 slices delivered sequentially.

**Scope boundary:** Demo (`src/demo/`) + Core library (`src/lib/core/`). No changes to existing d3/canvas rendering engine (`src/lib/series/`, `src/lib/axes/`).

---

## 1. Audit Evidence — Current State

### 1.1 Registered series (17 types) — `src/lib/core/registry/SeriesRegistry.ts`

| # | SeriesTypeId | Category | Pane location (default) | Data field on EnrichedDatum |
|---|-------------|----------|------------------------|----------------------------|
| 1 | `Candlestick` | Price chart | Price (pinned) | `open/high/low/close` |
| 2 | `HollowCandle` | Price chart | Price (pinned) | `open/high/low/close` |
| 3 | `OHLC` | Price chart | Price (pinned) | `open/high/low/close` |
| 4 | `HeikinAshi` | Price chart | Price (pinned) | transformed OHLC |
| 5 | `Line` | Price chart | Price (pinned) | `close` |
| 6 | `Area` | Price chart | Price (pinned) | `close` |
| 7 | `Bar` | Price chart | Price (pinned) | `close` |
| 8 | `EMA` | Overlay | Price (pinned) | `ema20` / `ema50` |
| 9 | `BollingerBand` | Overlay | Price (pinned) | `bollingerBand.{top,middle,bottom}` |
| 10 | `Volume` | Order Flow | Volume pane | `volume` |
| 11 | `Whale` | Order Flow | OrderFlow pane (NEW) | `whaleBuyVol` / `whaleSellVol` |
| 12 | `CVDApprox` | Order Flow | OrderFlow pane (NEW) | `cvdApprox` |
| 13 | `CVDRealtime` | Order Flow | OrderFlow pane (NEW) | `cvdRealtime` |
| 14 | `RSI` | Oscillator | Momentum pane | `rsi` |
| 15 | `MACD` | Oscillator | Momentum pane | `macd.{macd,signal,divergence}` |
| 16 | `StrengthElder` | Oscillator | Strength pane (NEW) | `bullPower` / `bearPower` |
| 17 | `StrengthRelative` | Oscillator | Strength pane (NEW) | `strengthRelative` |

### 1.2 Current DEFAULT_PANES (3 panes) — `src/lib/core/types/pane-descriptor.ts`

```typescript
// MAX_VISIBLE = 3  ← NEEDS INCREASE TO 5
[
  { id: "price",    pinned: true,  visible: true, heightRatio: 0.55, splitScale: false, tooltip: "ohlc",
    series: [Candlestick, EMA(20), EMA(50), BollingerBand] },

  { id: "volume",   pinned: false, visible: true, heightRatio: 0.25, splitScale: false, tooltip: "value",
    series: [Volume] },

  { id: "momentum", pinned: false, visible: true, heightRatio: 0.20, splitScale: true,  tooltip: "value",
    series: [RSI(left), MACD(right)] },
]
// MISSING: Whale, CVDApprox, CVDRealtime, StrengthElder, StrengthRelative
```

### 1.3 `SeriesConfig` — missing `visible` field — `src/lib/core/types/pane-descriptor.ts`

```typescript
// CURRENT:
export interface SeriesConfig {
  type: SeriesTypeId;
  params?: Record<string, unknown>;
  yAxis: YAxisSide;
  overlay?: boolean;
  color?: string;
  // MISSING: visible?: boolean
}
```

### 1.4 `useDynamicPanes` reducer — `src/lib/core/hooks/useDynamicPanes.ts`

Current actions:
- `toggleVisible` · `addPane` · `removePane` · `restorePane`
- `addSeries` · `removeSeries` · `applyDelta` · `resetToDefault` · `reorderPanes`

**MISSING:** `toggleSeriesVisible` action.

### 1.5 `DynamicChart.tsx` — renders all series unconditionally

In `renderSeries()` and `buildChartSlots()` there is no guard for `series.visible === false`. All series render regardless of their intended visibility.

### 1.6 Existing tests — `src/lib/core/{hooks,types,registry}/...`

27 unit tests currently passing (vitest). Affected by this plan:
- `pane-descriptor.test.ts` — will need updating when the pane-settings model becomes configurable
- `useDynamicPanes.test.ts` — needs new cases for `toggleSeriesVisible`, `maxVisiblePanes`, and pane-local `yAxis` selection

### 1.7 CSS — `src/lib/styles/pane-overlays.css`

Existing classes: `.rsc-pane-label`, `.rsc-pane-header`, `.rsc-pane-btn`, `.rsc-series-picker*`  
**Missing:** `.rsc-indicator-chip` classes for the legend strip overlay

### 1.8 Demo settings entry — `src/demo/LibraryShowcaseDemo.tsx`

Current tabs: `indicators | drawings | adapter | panes`  
**New canonical entry:** gear icon in the top-right cluster, next to the theme toggle, opens the settings modal.  
**Legacy flow:** the old `Study` button should not be the primary affordance.

---

## 2. Architecture Decisions

### AD-1: `SeriesConfig.visible` semantics
- `undefined` or `true` → series renders
- `false` → series is hidden (data still computed, just not drawn, excluded from yExtents, excluded from tooltip)
- This matches GoCharting / TradingView pattern: hidden ≠ deleted

### AD-2: Auto-pane sync rule (pane-series coupling)
When `toggleSeriesVisible` fires:
1. If the only visible series in a pane becomes hidden → `pane.visible = false` automatically
2. If a series in a hidden pane is set to visible → `pane.visible = true` automatically
3. Pinned pane (price) is exempt from rule #1 (it never auto-hides)

### AD-3: `maxVisiblePanes` is configurable
Default the visible-pane ceiling to 5, but read it from demo settings rather than a hard-coded constant.  
`addPane` / restore-pane logic must guard against the current setting value.

### AD-4: `DEFAULT_PANES` storage versioning
The storage key stays `"rsc-pane-layout-v1"`. However, changing `DEFAULT_PANES` means users with **no stored layout** get the new 5-pane default; users with a **stored layout** keep their layout (only `resetToDefault` resets them). This is safe because `sanitizeLayout()` validates before using stored data.

### AD-5: Indicator Legend Chips
HTML overlay (not SVG) positioned absolutely above each pane. Z-index: 15 (below pane-header z=20, above chart canvas). Chips appear on pane hover, like pane-header.

### AD-6: Settings modal location
The settings surface is a GoCharting-style modal dialog opened by the gear icon near the theme toggle. Pane-local editing belongs in this modal, not in a right side panel.

### AD-7: Optional custom templates
If the registry supports multiple render modes, the settings modal may expose a template selector for line/bar/area/histogram style indicators. This is optional but should be documented and wired into the data model now.

---

## 3. Slice Breakdown — 5 Slices, Fully Sequential

---

### SLICE S-1: `SeriesConfig.visible` + Reducer Action

**Goal:** Add the data model foundation. No visual change yet.

**Files to modify:**
| File | Change |
|------|--------|
| `src/lib/core/types/pane-descriptor.ts` | Add `visible?: boolean` to `SeriesConfig` |
| `src/lib/core/hooks/useDynamicPanes.ts` | Add `toggleSeriesVisible` action + handler |
| `src/lib/core/index.ts` | Re-export `toggleSeriesVisible` action type |

**Exact code changes:**

#### `pane-descriptor.ts` — Add field to interface
```typescript
// BEFORE:
export interface SeriesConfig {
  type: SeriesTypeId;
  params?: Record<string, unknown>;
  yAxis: YAxisSide;
  overlay?: boolean;
  color?: string;
}

// AFTER:
export interface SeriesConfig {
  type: SeriesTypeId;
  params?: Record<string, unknown>;
  yAxis: YAxisSide;
  overlay?: boolean;
  color?: string;
  visible?: boolean;  // undefined | true = show, false = hide
}
```

#### `useDynamicPanes.ts` — Add action type
```typescript
// ADD to DynamicPaneAction union:
| { type: "toggleSeriesVisible"; paneId: string; seriesType: SeriesTypeId }
```

#### `useDynamicPanes.ts` — Add reducer case
```typescript
case "toggleSeriesVisible": {
  const next = clonePaneList(state);
  const pane = next.find((p) => p.id === action.paneId);
  if (!pane) return next;
  const series = pane.series.find((s) => s.type === action.seriesType);
  if (!series) return next;
  // Toggle: undefined/true → false, false → true
  series.visible = series.visible === false ? true : false;
  // AD-2: auto-hide pane if all series hidden (except pinned)
  if (!pane.pinned) {
    const anyVisible = pane.series.some((s) => s.visible !== false);
    if (!anyVisible) pane.visible = false;
  }
  return normalizeVisibleRatios(next);
}
```

#### `useDynamicPanes.ts` — restorePane should also restore series
```typescript
case "restorePane": {
  const next = clonePaneList(state);
  if (visibleCount(next) >= PANE_MAX_VISIBLE) return next;
  const pane = next.find((p) => p.id === action.id);
  if (!pane) return next;
  pane.visible = true;
  // Restore all series in the pane when restoring it
  pane.series.forEach((s) => { s.visible = true; });
  return normalizeVisibleRatios(next);
}
```

#### `useDynamicPanes.ts` — Add `toggleSeriesVisible` to hook return
```typescript
// ADD to UseDynamicPanesResult interface:
toggleSeriesVisible: (paneId: string, seriesType: SeriesTypeId) => void;

// ADD to hook body:
const toggleSeriesVisible = useCallback((paneId: string, seriesType: SeriesTypeId) => {
  dispatch({ type: "toggleSeriesVisible", paneId, seriesType });
}, []);

// ADD to return object:
toggleSeriesVisible,
```

**New `cloneSeries` must preserve `visible` field** (check `clonePaneList` implementation — currently spreads `SeriesConfig`, so `visible` will be copied automatically once field exists).

**Tests to ADD** to `useDynamicPanes.test.ts`:
```typescript
it("toggleSeriesVisible hides a series", () => {
  const state = createDefaultPaneLayout();
  const next = dynamicPanesReducer(state, {
    type: "toggleSeriesVisible", paneId: "momentum", seriesType: "RSI",
  });
  const rsi = next.find(p => p.id === "momentum")?.series.find(s => s.type === "RSI");
  expect(rsi?.visible).toBe(false);
});

it("toggleSeriesVisible auto-hides pane when all series hidden", () => {
  // Hide RSI first
  let state = dynamicPanesReducer(createDefaultPaneLayout(), {
    type: "toggleSeriesVisible", paneId: "momentum", seriesType: "RSI",
  });
  // Hide MACD — now 0 visible series → pane should auto-hide
  state = dynamicPanesReducer(state, {
    type: "toggleSeriesVisible", paneId: "momentum", seriesType: "MACD",
  });
  expect(state.find(p => p.id === "momentum")?.visible).toBe(false);
});

it("toggleSeriesVisible auto-shows pane when a series is revealed", () => {
  // First hide entire pane by hiding all series
  let state = dynamicPanesReducer(createDefaultPaneLayout(), {
    type: "toggleSeriesVisible", paneId: "volume", seriesType: "Volume",
  });
  expect(state.find(p => p.id === "volume")?.visible).toBe(false);
  // Re-enable the series → pane should auto-show
  state = dynamicPanesReducer(state, {
    type: "toggleSeriesVisible", paneId: "volume", seriesType: "Volume",
  });
  expect(state.find(p => p.id === "volume")?.visible).toBe(true);
});
```

**Acceptance criteria (S-1):**
- [ ] TypeScript compiles with zero errors (`npm run type-check`)
- [ ] All existing 27 tests pass
- [ ] 3 new `toggleSeriesVisible` tests pass
- [ ] `SeriesConfig.visible` is `undefined` in DEFAULT_PANES (backwards-compatible)

---

### SLICE S-2: DynamicChart respects `series.visible`

**Goal:** Series with `visible === false` do not render, are excluded from yExtents and tooltips.

**Files to modify:**
| File | Change |
|------|--------|
| `src/lib/core/DynamicChart.tsx` | Filter hidden series in `buildChartSlots`, `buildYExtents`, `renderSeries` |

**Exact code changes:**

#### `buildChartSlots` — filter `series.visible !== false` before building slots
```typescript
export function buildChartSlots(pane: PaneDescriptor): ChartSlot[] {
  // Only consider visible series (visible === undefined or true)
  const activeSeries = pane.series.filter((s) => s.visible !== false);

  if (!pane.splitScale) {
    const seriesTypes = activeSeries.map((s) => s.type);
    const hasLeftAxis = activeSeries.some((s) => s.yAxis === "left");
    const hasRightAxis = activeSeries.some((s) => s.yAxis === "right");
    return [{
      series: activeSeries,   // ← was pane.series
      accessors: activeSeries.flatMap(...),
      tooltipEntries: buildTooltipEntriesForSeries(activeSeries),
      hasLeftAxis,
      hasRightAxis,
      tooltipMode: pane.tooltip,
      axisFormat: axisFormatForSeriesTypes(seriesTypes),
      seriesTypes,
    }];
  }

  const leftSeries = activeSeries.filter((s) => s.yAxis === "left");   // ← was pane.series
  const rightSeries = activeSeries.filter((s) => s.yAxis === "right"); // ← was pane.series
  // ... rest same
}
```

**Logic note:** If `activeSeries` is empty (all hidden), `buildChartSlots` returns `[{ series: [], ... }]` — the Chart still renders but shows empty. This is fine since pane.visible will be false (from AD-2) and DynamicChart already skips hidden panes.

**Acceptance criteria (S-2):**
- [ ] Set `RSI.visible = false` manually in DEFAULT_PANES → RSI line does not appear on chart
- [ ] YAxis range for momentum pane no longer includes RSI range when RSI hidden
- [ ] Tooltip for momentum pane does not show RSI entry when hidden
- [ ] Build passes (`npm run build:docs`)

---

### SLICE S-3: Indicator Legend Chips on chart

**Goal:** Each pane shows a horizontal strip of chips (series name + 👁 + ×) that appear on hover, just below the pane-header hover zone.

**Files to create:**
| File | Purpose |
|------|---------|
| `src/lib/core/IndicatorLegend.tsx` | New component: renders chip row for one pane |

**Files to modify:**
| File | Change |
|------|--------|
| `src/lib/styles/pane-overlays.css` | Add `.rsc-indicator-legend`, `.rsc-indicator-chip` styles |
| `src/demo/LibraryShowcaseDemo.tsx` | Render `<IndicatorLegend>` overlay per pane |

#### `IndicatorLegend.tsx` — new component

```typescript
// src/lib/core/IndicatorLegend.tsx
import type { PaneDescriptor, SeriesTypeId } from "./types/pane-descriptor";

export interface IndicatorLegendProps {
  pane: PaneDescriptor;
  onToggleSeries: (seriesType: SeriesTypeId) => void;
  onRemoveSeries: (seriesType: SeriesTypeId) => void;
  isDark?: boolean;
}

// SERIES_LABELS: human-readable short label for each type
const SERIES_LABELS: Partial<Record<SeriesTypeId, string>> = {
  Candlestick: "Candle", HollowCandle: "Hollow", OHLC: "OHLC",
  HeikinAshi: "HA", Line: "Line", Area: "Area", Bar: "Bar",
  EMA: "EMA", BollingerBand: "BB",
  Volume: "Vol", Whale: "Whale", CVDApprox: "CVD", CVDRealtime: "CVD RT",
  RSI: "RSI", MACD: "MACD", StrengthElder: "Elder", StrengthRelative: "RS",
};

function seriesLabel(type: SeriesTypeId, params?: Record<string, unknown>): string {
  const base = SERIES_LABELS[type] ?? type;
  if (type === "EMA" && params?.period) return `EMA(${params.period})`;
  if (type === "RSI" && params?.period) return `RSI(${params.period})`;
  if (type === "BollingerBand" && params?.period) return `BB(${params.period})`;
  return base;
}

export function IndicatorLegend({ pane, onToggleSeries, onRemoveSeries }: IndicatorLegendProps) {
  // Non-primary series only (don't show Candlestick/HeikinAshi/etc in chip strip
  // since they're already represented by the Candlestick/chartType button in topbar)
  const PRIMARY_TYPES: SeriesTypeId[] = ["Candlestick","HollowCandle","OHLC","HeikinAshi","Line","Area","Bar"];
  const chips = pane.series.filter((s) => !PRIMARY_TYPES.includes(s.type) || !pane.pinned);

  if (chips.length === 0) return null;

  return (
    <div className="rsc-indicator-legend">
      {chips.map((series) => {
        const hidden = series.visible === false;
        return (
          <div
            key={series.type}
            className={`rsc-indicator-chip${hidden ? " rsc-indicator-chip--hidden" : ""}`}
            style={series.color ? { "--chip-color": series.color } as React.CSSProperties : undefined}
          >
            <span className="rsc-indicator-chip__dot" />
            <span className="rsc-indicator-chip__name">
              {seriesLabel(series.type, series.params)}
            </span>
            <button
              type="button"
              className="rsc-indicator-chip__btn"
              onClick={() => onToggleSeries(series.type)}
              title={hidden ? "Show indicator" : "Hide indicator"}
              aria-label={hidden ? `Show ${series.type}` : `Hide ${series.type}`}
            >
              {hidden ? "◌" : "👁"}
            </button>
            <button
              type="button"
              className="rsc-indicator-chip__btn rsc-indicator-chip__btn--remove"
              onClick={() => onRemoveSeries(series.type)}
              title="Remove indicator"
              aria-label={`Remove ${series.type}`}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

#### CSS additions to `pane-overlays.css`
```css
.rsc-indicator-legend {
  position: absolute;
  top: 28px;          /* below pane-header hover zone */
  left: 60px;         /* align with chart area (after y-axis) */
  right: 68px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease;
  z-index: 15;
}

/* Show legend on pane hover (same trigger as pane-header) */
.rsc-pane-wrap:hover .rsc-indicator-legend,
.rsc-pane-wrap:focus-within .rsc-indicator-legend {
  opacity: 1;
  pointer-events: auto;
}

.rsc-indicator-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px 2px 4px;
  border-radius: 4px;
  background: var(--rsc-surface, rgba(255,255,255,0.92));
  border: 1px solid var(--rsc-border, rgba(148,163,184,0.24));
  font-size: 10px;
  font-weight: 500;
  color: var(--rsc-text, #1e2a3b);
  cursor: default;
}

.rsc-indicator-chip--hidden {
  opacity: 0.45;
}

.rsc-indicator-chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chip-color, #2962ff);
  flex-shrink: 0;
}

.rsc-indicator-chip__name {
  white-space: nowrap;
}

.rsc-indicator-chip__btn {
  border: 0;
  background: transparent;
  color: inherit;
  padding: 0 2px;
  cursor: pointer;
  font-size: 11px;
  line-height: 1;
  border-radius: 2px;
}
.rsc-indicator-chip__btn:hover { background: rgba(148,163,184,0.18); }
.rsc-indicator-chip__btn--remove { opacity: 0.5; }
.rsc-indicator-chip__btn--remove:hover { opacity: 1; color: #f23645; }
```

#### Demo wiring in `LibraryShowcaseDemo.tsx`
In the `visiblePanes.map(...)` block that renders pane overlays, add `<IndicatorLegend>` below the pane-wrap div:
```tsx
// Inside the Fragment per pane:
<IndicatorLegend
  pane={pane}
  onToggleSeries={(seriesType) => paneState.toggleSeriesVisible(pane.id, seriesType)}
  onRemoveSeries={(seriesType) => paneState.removeSeries(pane.id, seriesType)}
  isDark={isDark}
/>
```

**Export** `IndicatorLegend` from `src/lib/core/index.ts`.

**Acceptance criteria (S-3):**
- [ ] Chips appear on pane hover; disappear when mouse leaves
- [ ] Click 👁 on EMA(20) → line disappears from chart, chip greys out
- [ ] Click 👁 again → line reappears
- [ ] Click × on a chip → series removed from pane (existing `removeSeries` action)
- [ ] Build passes

---

### SLICE S-4: 5 preset panes + PANE_MAX_VISIBLE = 5

**Goal:** Two new hidden-by-default panes expose the 5 missing series. Users can enable via Panes menu.

**Files to modify:**
| File | Change |
|------|--------|
| `src/lib/core/types/pane-descriptor.ts` | Update `DEFAULT_PANES` + `PANE_MAX_VISIBLE` |
| `src/lib/core/hooks/useDynamicPanes.ts` | Update `addPane` guard (already uses constant, no change needed) |

#### Updated `pane-descriptor.ts`
```typescript
export const PANE_MAX_VISIBLE = 5;  // was 3

export const DEFAULT_PANES: PaneDescriptor[] = [
  // --- 1: PRICE (pinned, always visible) ---
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
  // --- 2: VOLUME (visible by default) ---
  {
    id: "volume",
    label: "Volume",
    pinned: false,
    visible: true,
    heightRatio: 0.20,
    splitScale: false,
    tooltip: "value",
    series: [
      { type: "Volume", yAxis: "right" },
    ],
  },
  // --- 3: MOMENTUM (visible by default) ---
  {
    id: "momentum",
    label: "RSI+MACD",
    pinned: false,
    visible: true,
    heightRatio: 0.15,
    splitScale: true,
    tooltip: "value",
    series: [
      { type: "RSI", params: { period: 14 }, yAxis: "left" },
      { type: "MACD", params: { fast: 12, slow: 26, signal: 9 }, yAxis: "right" },
    ],
  },
  // --- 4: ORDER FLOW (hidden by default) ---
  {
    id: "orderflow",
    label: "Order Flow",
    pinned: false,
    visible: false,   // ← hidden until user enables
    heightRatio: 0.15,
    splitScale: false,
    tooltip: "value",
    series: [
      { type: "Whale", yAxis: "right" },
      { type: "CVDApprox", yAxis: "right" },
    ],
  },
  // --- 5: STRENGTH (hidden by default) ---
  {
    id: "strength",
    label: "Strength",
    pinned: false,
    visible: false,   // ← hidden until user enables
    heightRatio: 0.15,
    splitScale: true,
    tooltip: "value",
    series: [
      { type: "StrengthElder", yAxis: "left" },
      { type: "StrengthRelative", yAxis: "right" },
    ],
  },
];
```

**Height ratio note:** Only 3 visible panes on first load (Price 0.50 + Volume 0.20 + Momentum 0.15 = 0.85 ≠ 1). `normalizeVisibleRatios()` is called at load and handles this correctly — it normalizes only visible pane ratios. Invisible panes keep their saved ratio (used when restored).

**Storage versioning:** The storage key remains `"rsc-pane-layout-v1"`. Existing users have stored layouts with 3 panes. The `sanitizeLayout()` validator requires `panes[0].pinned === true` — it will accept 3-pane layouts and silently ignore the missing new panes. This means: **existing users do NOT get Order Flow / Strength automatically**. They get them only after `resetToDefault`. This is correct behavior (non-destructive upgrade).

**Tests to UPDATE** in `pane-descriptor.test.ts`:
```typescript
// CHANGE: was 3, now 5
it("DEFAULT_PANES has 5 panes, 3 visible by default", () => {
  expect(DEFAULT_PANES).toHaveLength(5);
  expect(DEFAULT_PANES.filter(p => p.visible)).toHaveLength(3);
  expect(DEFAULT_PANES.every(p => p.pinned ? p.visible : true)).toBe(true);
});
```

**Tests to UPDATE** in `useDynamicPanes.test.ts`:
```typescript
// CHANGE: addPane is rejected when MAX_VISIBLE reached (was 3, now 5)
it("addPane is rejected when five panes are already visible", () => {
  let state = createDefaultPaneLayout();
  // enable orderflow and strength
  state = dynamicPanesReducer(state, { type: "toggleVisible", id: "orderflow" });
  state = dynamicPanesReducer(state, { type: "toggleVisible", id: "strength" });
  // try to add a 6th
  const next = dynamicPanesReducer(state, {
    type: "addPane",
    pane: { label: "X", pinned: false, visible: true, heightRatio: 0.1, series: [], splitScale: false, tooltip: "value" },
  });
  expect(next.filter(p => p.visible)).toHaveLength(5);
});
```

**Acceptance criteria (S-4):**
- [ ] On fresh load (no localStorage): Price + Volume + RSI+MACD visible; OrderFlow + Strength hidden
- [ ] Click "OrderFlow" in Panes menu → pane appears with Whale + CVD bars
- [ ] Click "Strength" in Panes menu → pane appears with Elder Ray + RS line
- [ ] resetToDefault returns to 3 visible panes
- [ ] Type-check and tests pass

---

### SLICE S-5: Settings Dialog

**Goal:** Ship the GoCharting-style modal settings flow documented in [S5_SETTINGS_DIALOG_SPEC.md](S5_SETTINGS_DIALOG_SPEC.md). The settings surface must live behind the top-right gear icon, support pane-local indicator editing, require `yAxis` selection on add/edit, and allow the visible-pane ceiling to be changed at runtime.

**Files to modify:**
| File | Change |
|------|--------|
| `src/demo/LibraryShowcaseDemo.tsx` | Replace the old right-side settings flow with the gear-icon modal entry and pane inspector |
| `src/demo/demo.css` | Add modal, dialog, and inspector styling |
| `src/lib/core/hooks/useDynamicPanes.ts` | Enforce runtime `maxVisiblePanes`, add/update/remove series with `yAxis` awareness |
| `src/lib/core/types/pane-descriptor.ts` | Add any dialog-driven series fields needed by the composer |
| `src/lib/core/DynamicChart.tsx` | Rebuild chart slots immediately when pane structure changes |

**Required behavior:**
- The gear icon is the only primary opener for settings.
- Every add-indicator flow must expose `left` / `right` Y-axis choice before commit.
- Any pane-local change that affects structure or axis assignment must redraw immediately.
- `maxVisiblePanes` is persisted and respected when restoring or adding panes.
- Optional template selection may appear for indicators that support multiple render modes.

**See also:** [S5_SETTINGS_DIALOG_SPEC.md](S5_SETTINGS_DIALOG_SPEC.md) for the full UI contract and component-level layout.

**Acceptance criteria (S-5):**
- [ ] Gear icon in the top-right cluster opens the settings modal
- [ ] Modal contains pane-local inspector controls, not a right-side settings tab
- [ ] Adding an indicator requires an explicit `yAxis` choice
- [ ] Changing `yAxis`, visibility, or pane order redraws immediately
- [ ] `maxVisiblePanes` can be changed and persists across reloads
- [ ] Optional template selector appears for multi-template indicators
- [ ] Reset action restores the default pane layout and indicator params

---

## 4. Deferred Work (Out of Scope for This Plan)

| Item | Reason deferred |
|------|----------------|
| MACD params live-edit | MACD requires slow period > fast: need validation modal. Deferred to avoid blocking UX work. |
| Per-indicator color picker | Requires a color swatch component. Can be added as S-6 later. |
| Indicator param change → `enrichData()` re-run for EMA/RSI | Currently `enrichData` hardcodes periods (ema20, ema50, rsi-14). Full parametric enrichment requires refactoring `enrichData()` to accept a full params config. Scoped separately. |
| CVDRealtime data source | `cvdRealtime` is always `undefined` in offline/Binance data (needs WebSocket feed). Show as disabled chip in OrderFlow pane. |
| SMA type (non-EMA MA) | Not yet in `SeriesTypeId`. Not registered. |

---

## 5. File Impact Matrix

| File | S-1 | S-2 | S-3 | S-4 | S-5 |
|------|-----|-----|-----|-----|-----|
| `src/lib/core/types/pane-descriptor.ts` | ✎ | — | — | ✎ | — |
| `src/lib/core/hooks/useDynamicPanes.ts` | ✎ | — | — | — | ✎ |
| `src/lib/core/DynamicChart.tsx` | — | ✎ | — | — | — |
| `src/lib/core/IndicatorLegend.tsx` | — | — | **NEW** | — | — |
| `src/lib/core/index.ts` | ✎ | — | ✎ | — | ✎ |
| `src/lib/styles/pane-overlays.css` | — | — | ✎ | — | — |
| `src/demo/LibraryShowcaseDemo.tsx` | — | — | ✎ | — | ✎ |
| `src/lib/core/types/__tests__/pane-descriptor.test.ts` | — | — | — | ✎ | — |
| `src/lib/core/hooks/__tests__/useDynamicPanes.test.ts` | ✎ | — | — | ✎ | — |

---

## 6. Audit Checklist — Per Slice

Each slice is considered **DONE** when ALL items below are checked:

### S-1 checklist
- [ ] `SeriesConfig.visible?: boolean` added to interface
- [ ] `toggleSeriesVisible` action type added to `DynamicPaneAction` union
- [ ] Reducer case `toggleSeriesVisible` handles: toggle, auto-hide pane, auto-show pane
- [ ] `UseDynamicPanesResult` exposes `toggleSeriesVisible` method
- [ ] `useDynamicPanes` hook dispatches action via `useCallback`
- [ ] `restorePane` resets all series `visible = true`
- [ ] 3 new unit tests written and passing
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run test` → all pass (min 30 tests)
- [ ] `npm run build:docs` → compiled successfully

### S-2 checklist
- [ ] `buildChartSlots` filters `activeSeries = pane.series.filter(s => s.visible !== false)`
- [ ] Both `splitScale` branches use `activeSeries` not `pane.series`
- [ ] `buildYExtents` operates only on active series
- [ ] `buildTooltipEntriesForSeries` called with active series only
- [ ] Manual smoke test: toggle RSI hidden → RSI disappears from chart
- [ ] YAxis range no longer includes RSI values when RSI hidden
- [ ] `npm run build:docs` → OK

### S-3 checklist
- [ ] `IndicatorLegend.tsx` created with correct props interface
- [ ] Exported from `src/lib/core/index.ts`
- [ ] CSS classes added to `pane-overlays.css`
- [ ] Chips visible on pane hover (CSS `:hover` trigger working)
- [ ] 👁 button calls `toggleSeriesVisible` with correct paneId + type
- [ ] Hidden series shows greyed chip with ◌ icon
- [ ] × button calls `removeSeries` (existing action)
- [ ] `npm run build:docs` → OK
- [ ] Screenshot evidence showing chips

### S-4 checklist
- [ ] `PANE_MAX_VISIBLE` = 5
- [ ] `DEFAULT_PANES` has 5 entries: price, volume, momentum, orderflow, strength
- [ ] orderflow and strength have `visible: false`
- [ ] `normalizeVisibleRatios` does NOT crash with hidden panes (existing behavior)
- [ ] `resetToDefault` yields 3 visible panes
- [ ] Panes menu in topbar shows all 5 panes with correct tick/no-tick state
- [ ] Clicking OrderFlow in menu → pane appears with Whale + CVD
- [ ] Clicking Strength in menu → pane appears with Elder Ray + RS
- [ ] Updated tests pass
- [ ] `npm run build:docs` → OK

### S-5 checklist
- [ ] `updateSeriesParams` action added to reducer
- [ ] Gear icon opens the settings modal
- [ ] Pane inspector exposes explicit `left` / `right` Y-axis selection
- [ ] EMA period editable
- [ ] BB period + stdDev editable
- [ ] RSI period editable
- [ ] Whale threshold editable
- [ ] `maxVisiblePanes` is editable and persisted
- [ ] Reset button calls `resetToDefault`
- [ ] `npm run build:docs` → OK

---

## 7. Run Commands Reference

```powershell
# Type-check
cd "c:\Mujoco Projects\react-stockcharts-master"
npm run type-check

# All unit tests
npm run test

# Build demo
npm run build:docs

# Open demo
# Open: build/index.html in browser
```

---

## 8. Known Constraints

1. **`buildChartSlots` empty-slot edge case:** If all series in a `splitScale=true` pane are hidden, both left and right slot arrays are empty. `DynamicChart` will still produce a `<Chart>` with empty extents. Since the pane is auto-hidden (AD-2), this Chart node is never rendered — no visual issue.

2. **LocalStorage schema**: Users with existing 3-pane stored layouts will NOT automatically see the new panes until they click "Reset". This is intentional (non-destructive).

3. **Vitest test for `PANE_MAX_VISIBLE`**: The test `addPane is rejected when three panes are already visible` must be updated in S-4 to test 5 panes. This test will **fail intentionally** after S-4 until updated.

4. **`enrichData` hard-coded periods**: Changing RSI/MACD periods in S-5 Settings does NOT re-compute the calculated fields unless `enrichData()` is re-invoked with new params. Full parametric enrichData is deferred. S-5 Settings UI will show the params but note that re-computation requires page reload (or a follow-up slice).

---

*End of document. This plan is self-contained. The dev team can implement S-1 through S-5 sequentially without further clarification.*

---

## 9. Actual Task Audit Snapshot — 2026-05-04

### Validation results
- `npm run type-check` → PASS
- `npm run test` → PASS (`51/51` tests)
- `scripts/generate_module_tree.py` → regenerated `module_tree_full.md` (`619` modules)

### Modified files
- `docs/planning/INDICATOR_VISIBILITY_PLAN.md`
- `src/lib/core/types/pane-descriptor.ts`
- `src/lib/core/hooks/useDynamicPanes.ts`
- `src/lib/core/DynamicChart.tsx`
- `src/lib/core/IndicatorLegend.tsx`
- `src/lib/core/index.ts`
- `src/index.ts`
- `src/lib/styles/pane-overlays.css`
- `src/demo/LibraryShowcaseDemo.tsx`
- `src/demo/demo.css`
- `src/lib/core/types/__tests__/pane-descriptor.test.ts`
- `src/lib/core/hooks/__tests__/useDynamicPanes.test.ts`
- `module_tree_full.md`

## 10. Follow-up Fix Snapshot — 2026-05-04

### Validation results
- `npm run build:docs` → PASS

### Modified files
- `src/demo/demo.css`
- `docs/planning/INDICATOR_VISIBILITY_PLAN.md`
