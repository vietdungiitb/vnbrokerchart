# S-3: Indicator Legend Chips
## Exact Code Diff — Ready for Implementation

**Branch target:** `dev`  
**Depends on:** S-1 (toggleSeriesVisible must be in useDynamicPanes hook) + S-2 (hiding a series must visually take effect)  
**Slice status:** NOT STARTED

---

## File 1: `src/lib/core/IndicatorLegend.tsx` — NEW FILE

Create this file from scratch:

```typescript
import type { CSSProperties } from "react";
import type { PaneDescriptor, SeriesTypeId } from "./types/pane-descriptor";

export interface IndicatorLegendProps {
	pane: PaneDescriptor;
	onToggleSeries: (seriesType: SeriesTypeId) => void;
	onRemoveSeries: (seriesType: SeriesTypeId) => void;
}

// Human-readable short labels for each series type
const SERIES_LABELS: Partial<Record<SeriesTypeId, string>> = {
	Candlestick: "Candle",
	HollowCandle: "Hollow",
	OHLC: "OHLC",
	HeikinAshi: "HA",
	Line: "Line",
	Area: "Area",
	Bar: "Bar",
	EMA: "EMA",
	BollingerBand: "BB",
	Volume: "Vol",
	Whale: "Whale",
	CVDApprox: "CVD",
	CVDRealtime: "CVD RT",
	RSI: "RSI",
	MACD: "MACD",
	StrengthElder: "Elder",
	StrengthRelative: "RS",
};

function seriesLabel(type: SeriesTypeId, params?: Record<string, unknown>): string {
	const base = SERIES_LABELS[type] ?? type;
	if (type === "EMA" && typeof params?.period === "number") return `EMA(${params.period})`;
	if (type === "RSI" && typeof params?.period === "number") return `RSI(${params.period})`;
	if (type === "BollingerBand" && typeof params?.period === "number") return `BB(${params.period})`;
	if (type === "MACD") {
		const fast = typeof params?.fast === "number" ? params.fast : 12;
		const slow = typeof params?.slow === "number" ? params.slow : 26;
		return `MACD(${fast},${slow})`;
	}
	return base;
}

// Price-chart primary series: shown in the chip strip only for non-pinned panes.
// For the pinned (price) pane, price type chips are hidden since chart type is
// controlled separately by the chart type button in the topbar.
const PRIMARY_CHART_TYPES: SeriesTypeId[] = [
	"Candlestick", "HollowCandle", "OHLC", "HeikinAshi", "Line", "Area", "Bar",
];

export function IndicatorLegend({ pane, onToggleSeries, onRemoveSeries }: IndicatorLegendProps) {
	// For the price pane: exclude primary chart types (controlled by topbar chart type picker)
	// For other panes: show all series
	const chips = pane.pinned
		? pane.series.filter((s) => !PRIMARY_CHART_TYPES.includes(s.type))
		: pane.series;

	if (chips.length === 0) return null;

	return (
		<div className="rsc-indicator-legend">
			{chips.map((series) => {
				const hidden = series.visible === false;
				const chipStyle = series.color
					? ({ "--chip-color": series.color } as CSSProperties)
					: undefined;

				return (
					<div
						key={`${series.type}-${String(series.params?.period ?? "")}`}
						className={`rsc-indicator-chip${hidden ? " rsc-indicator-chip--hidden" : ""}`}
						style={chipStyle}
					>
						<span className="rsc-indicator-chip__dot" aria-hidden="true" />
						<span className="rsc-indicator-chip__name">
							{seriesLabel(series.type, series.params)}
						</span>
						<button
							type="button"
							className="rsc-indicator-chip__btn rsc-indicator-chip__btn--eye"
							onClick={() => onToggleSeries(series.type)}
							title={hidden ? "Hiện indicator" : "Ẩn indicator"}
							aria-label={hidden ? `Hiện ${series.type}` : `Ẩn ${series.type}`}
							aria-pressed={!hidden}
						>
							{hidden ? "◌" : "👁"}
						</button>
						<button
							type="button"
							className="rsc-indicator-chip__btn rsc-indicator-chip__btn--remove"
							onClick={() => onRemoveSeries(series.type)}
							title="Xóa indicator khỏi pane này"
							aria-label={`Xóa ${series.type}`}
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

---

## File 2: `src/lib/styles/pane-overlays.css` — ADD CSS classes

Add at the end of the file (after the last existing rule):

```css
/* ─── Indicator Legend Chips ─────────────────────────────────────────────── */

.rsc-indicator-legend {
  position: absolute;
  top: 28px;          /* flush below the 28px pane-header hover zone */
  left: 60px;         /* align with chart area (accounts for y-axis width) */
  right: 68px;        /* avoid right y-axis area */
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px 0;
  /* Hidden by default — revealed on pane hover */
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease;
  z-index: 15;        /* above chart canvas (z=0), below pane-header (z=20) */
}

/* Reveal on hover (same trigger as .rsc-pane-header) */
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
  background: var(--rsc-surface, rgba(255, 255, 255, 0.92));
  border: 1px solid var(--rsc-border, rgba(148, 163, 184, 0.24));
  font-size: 10px;
  font-weight: 500;
  color: var(--rsc-text, #1e2a3b);
  cursor: default;
  user-select: none;
  white-space: nowrap;
}

.rsc-indicator-chip--hidden {
  opacity: 0.45;
}

.rsc-indicator-chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--chip-color, #2962ff);
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
  display: flex;
  align-items: center;
}

.rsc-indicator-chip__btn:hover {
  background: rgba(148, 163, 184, 0.18);
}

.rsc-indicator-chip__btn--remove {
  opacity: 0.5;
}

.rsc-indicator-chip__btn--remove:hover {
  opacity: 1;
  color: #f23645;
  background: rgba(242, 54, 69, 0.08);
}
```

---

## File 3: `src/lib/core/index.ts` — Export new component

**Find:**
```typescript
export { SeriesPicker } from "./SeriesPicker";
```

**Add after:**
```typescript
export { SeriesPicker } from "./SeriesPicker";
export { IndicatorLegend } from "./IndicatorLegend";
export type { IndicatorLegendProps } from "./IndicatorLegend";
```

---

## File 4: `src/demo/LibraryShowcaseDemo.tsx` — Wire IndicatorLegend

### Change 1 — Add import

**Find the existing import block for core components (somewhere around top of file):**
```typescript
import { PaneHeader } from "../lib/core/PaneHeader";
```

**Add on the next line:**
```typescript
import { PaneHeader } from "../lib/core/PaneHeader";
import { IndicatorLegend } from "../lib/core/IndicatorLegend";
```

### Change 2 — Render `<IndicatorLegend>` in the pane overlay loop

The demo currently renders per-pane overlays in a map like:
```tsx
{visiblePanes.map((pane, index) => {
  const paneTop = 8 + paneHeights.slice(0, index).reduce((s, v) => s + v, 0);
  return (
    <Fragment key={pane.id}>
      <div
        className="rsc-pane-wrap"
        style={{ position: "absolute", top: paneTop, left: 0, right: 0, height: 28, zIndex: 20 }}
      >
        <PaneHeader pane={pane} onToggleVisible ... />
      </div>
      <PaneLabel label={pane.label} top={paneTop} height={paneHeights[index]} />
    </Fragment>
  );
})}
```

**Find the `<PaneLabel .../>` line inside this loop and add `<IndicatorLegend>` after it:**

```tsx
{visiblePanes.map((pane, index) => {
  const paneTop = 8 + paneHeights.slice(0, index).reduce((s, v) => s + v, 0);
  return (
    <Fragment key={pane.id}>
      <div
        className="rsc-pane-wrap"
        style={{ position: "absolute", top: paneTop, left: 0, right: 0, height: 28, zIndex: 20 }}
      >
        <PaneHeader pane={pane} onToggleVisible ... />
        {/* IndicatorLegend is a child of rsc-pane-wrap so the :hover CSS trigger works */}
        <IndicatorLegend
          pane={pane}
          onToggleSeries={(seriesType) => paneState.toggleSeriesVisible(pane.id, seriesType)}
          onRemoveSeries={(seriesType) => paneState.removeSeries(pane.id, seriesType)}
        />
      </div>
      <PaneLabel label={pane.label} top={paneTop} height={paneHeights[index]} />
    </Fragment>
  );
})}
```

**CRITICAL:** `IndicatorLegend` must be a descendant of `.rsc-pane-wrap` for the CSS `:hover` selector to work. Placing it inside the `rsc-pane-wrap` div (as shown above) is correct.

**Note on absolute positioning:** The `.rsc-indicator-legend` CSS uses `position: absolute` with `top: 28px`. Since it's inside `.rsc-pane-wrap` which has `position: absolute`, the chip strip will appear 28px below the top of the overlay div — which is exactly below the pane-header 28px zone. This is correct.

---

## Acceptance Criteria Checklist

- [ ] `IndicatorLegend.tsx` created with correct `IndicatorLegendProps` interface
- [ ] `seriesLabel()` returns `EMA(20)`, `RSI(14)`, `BB(20)` format with params
- [ ] Primary chart types excluded from chip strip in pinned (price) pane
- [ ] CSS classes added to `pane-overlays.css` (`.rsc-indicator-legend`, `.rsc-indicator-chip`, etc.)
- [ ] Exported from `src/lib/core/index.ts`
- [ ] Imported and rendered in `LibraryShowcaseDemo.tsx`
- [ ] `IndicatorLegend` placed inside `.rsc-pane-wrap` div (for CSS `:hover` to work)
- [ ] Browser test: hover on volume pane → Volume chip appears
- [ ] Browser test: click 👁 on EMA(20) chip → line disappears; chip turns grey
- [ ] Browser test: click 👁 again → EMA(20) line reappears
- [ ] Browser test: click × on BB chip → BollingerBand removed from pane
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run test` → all tests pass (no regressions)
- [ ] `npm run build:docs` → compiled successfully
