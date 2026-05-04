# S-2: DynamicChart Skips Hidden Series
## Exact Code Diff — Ready for Implementation

**Branch target:** `dev`  
**Depends on:** S-1 (SeriesConfig.visible field must exist)  
**Slice status:** NOT STARTED

---

## File: `src/lib/core/DynamicChart.tsx`

### Change 1 of 1 — Filter hidden series in `buildChartSlots`

The `buildChartSlots` function currently operates on `pane.series` directly without filtering `visible === false` entries.

**Find this function (starts around line 137):**
```typescript
export function buildChartSlots(pane: PaneDescriptor): ChartSlot[] {
	if (!pane.splitScale) {
		const seriesTypes = pane.series.map((series) => series.type);
		const hasLeftAxis = pane.series.some((series) => series.yAxis === "left");
		const hasRightAxis = pane.series.some((series) => series.yAxis === "right");
		return [{
			series: pane.series,
			accessors: pane.series.flatMap((series) => getSeries(series.type).yExtentsAccessors),
			tooltipEntries: buildTooltipEntriesForSeries(pane.series),
			hasLeftAxis,
			hasRightAxis,
			tooltipMode: pane.tooltip,
			axisFormat: axisFormatForSeriesTypes(seriesTypes),
			seriesTypes,
		}];
	}

	const leftSeries = pane.series.filter((series) => series.yAxis === "left");
	const rightSeries = pane.series.filter((series) => series.yAxis === "right");
	const slots: ChartSlot[] = [];

	if (leftSeries.length > 0) {
		const seriesTypes = leftSeries.map((s) => s.type);
		slots.push({
			series: leftSeries,
			accessors: leftSeries.flatMap((series) => getSeries(series.type).yExtentsAccessors),
			tooltipEntries: buildTooltipEntriesForSeries(leftSeries),
			hasLeftAxis: true,
			hasRightAxis: false,
			tooltipMode: pane.tooltip,
			axisFormat: axisFormatForSeriesTypes(seriesTypes),
			seriesTypes,
		});
	}

	if (rightSeries.length > 0) {
		const seriesTypes = rightSeries.map((s) => s.type);
		slots.push({
			series: rightSeries,
			accessors: rightSeries.flatMap((series) => getSeries(series.type).yExtentsAccessors),
			tooltipEntries: buildTooltipEntriesForSeries(rightSeries),
			hasLeftAxis: false,
			hasRightAxis: true,
			tooltipMode: pane.tooltip,
			axisFormat: axisFormatForSeriesTypes(seriesTypes),
			seriesTypes,
		});
	}

	return slots;
}
```

**Replace with:**
```typescript
export function buildChartSlots(pane: PaneDescriptor): ChartSlot[] {
	// Only render series that are not explicitly hidden (visible !== false)
	const activeSeries = pane.series.filter((s) => s.visible !== false);

	if (!pane.splitScale) {
		const seriesTypes = activeSeries.map((series) => series.type);
		const hasLeftAxis = activeSeries.some((series) => series.yAxis === "left");
		const hasRightAxis = activeSeries.some((series) => series.yAxis === "right");
		return [{
			series: activeSeries,
			accessors: activeSeries.flatMap((series) => getSeries(series.type).yExtentsAccessors),
			tooltipEntries: buildTooltipEntriesForSeries(activeSeries),
			hasLeftAxis,
			hasRightAxis,
			tooltipMode: pane.tooltip,
			axisFormat: axisFormatForSeriesTypes(seriesTypes),
			seriesTypes,
		}];
	}

	const leftSeries = activeSeries.filter((series) => series.yAxis === "left");
	const rightSeries = activeSeries.filter((series) => series.yAxis === "right");
	const slots: ChartSlot[] = [];

	if (leftSeries.length > 0) {
		const seriesTypes = leftSeries.map((s) => s.type);
		slots.push({
			series: leftSeries,
			accessors: leftSeries.flatMap((series) => getSeries(series.type).yExtentsAccessors),
			tooltipEntries: buildTooltipEntriesForSeries(leftSeries),
			hasLeftAxis: true,
			hasRightAxis: false,
			tooltipMode: pane.tooltip,
			axisFormat: axisFormatForSeriesTypes(seriesTypes),
			seriesTypes,
		});
	}

	if (rightSeries.length > 0) {
		const seriesTypes = rightSeries.map((s) => s.type);
		slots.push({
			series: rightSeries,
			accessors: rightSeries.flatMap((series) => getSeries(series.type).yExtentsAccessors),
			tooltipEntries: buildTooltipEntriesForSeries(rightSeries),
			hasLeftAxis: false,
			hasRightAxis: true,
			tooltipMode: pane.tooltip,
			axisFormat: axisFormatForSeriesTypes(seriesTypes),
			seriesTypes,
		});
	}

	return slots;
}
```

### Explanation of change

**Line-by-line:**
1. `const activeSeries = pane.series.filter((s) => s.visible !== false);` — This one line replaces all 3 occurrences of `pane.series` in the function with the filtered list. The condition `!== false` means:
   - `{ visible: undefined }` → kept (backwards compat with existing DEFAULT_PANES)
   - `{ visible: true }` → kept
   - `{ visible: false }` → excluded from rendering, yExtents, and tooltips
2. Everything downstream (`buildYExtents`, tooltip, `renderSeries`) already operates on what `buildChartSlots` passes — no further changes needed there.

### Edge cases handled

| Scenario | Behavior |
|----------|----------|
| All series in pane hidden | `activeSeries = []`, slot has `series: []`, `accessors: []`. `buildYExtents([])` falls back to `d => d.close`. Chart renders empty axes. Pane should already be auto-hidden by AD-2 from S-1, so this is defense-in-depth. |
| `splitScale=true`, only left series hidden | Only right slot produced. No left YAxis rendered. |
| `splitScale=true`, both sides hidden | `slots = []`. `DynamicChart` flatMaps to empty array for this pane — no Chart node rendered. |
| `visible: undefined` (all existing panes) | Treated as visible. Zero visual change. |

---

## No Test Changes Required

S-2 is a pure render filter — its correctness is verified by manual browser smoke tests (see acceptance criteria below). Unit tests for `buildChartSlots` can be added optionally:

```typescript
// Optional test in DynamicChart.test.ts (create file if needed)
import { buildChartSlots } from "../../DynamicChart";
import { DEFAULT_PANES } from "../../types/pane-descriptor";

it("buildChartSlots excludes series with visible=false", () => {
  const pane = {
    ...DEFAULT_PANES[2], // momentum: RSI + MACD
    series: [
      { ...DEFAULT_PANES[2].series[0], visible: false as const }, // RSI hidden
      { ...DEFAULT_PANES[2].series[1] },                           // MACD visible
    ],
  };
  const slots = buildChartSlots(pane);
  // splitScale=true; only MACD (right) should produce a slot
  const allSeries = slots.flatMap((s) => s.series);
  expect(allSeries.every((s) => s.type !== "RSI")).toBe(true);
  expect(allSeries.some((s) => s.type === "MACD")).toBe(true);
});
```

---

## Acceptance Criteria Checklist

- [ ] `buildChartSlots` uses `activeSeries = pane.series.filter(s => s.visible !== false)`
- [ ] All 3 usages of `pane.series` inside the function replaced with `activeSeries`
- [ ] Manual test: set `RSI.visible = false` temporarily in DEFAULT_PANES → RSI line disappears from chart
- [ ] YAxis range narrows when RSI hidden (no longer includes 0–100 range)
- [ ] Tooltip for momentum pane does not show RSI entry when RSI hidden
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run test` → all tests pass (no regressions)
- [ ] `npm run build:docs` → compiled successfully
