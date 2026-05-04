# S-5: Settings Panel + Study Button
## Exact Code Diff — Ready for Implementation

**Branch target:** `dev`  
**Depends on:** S-1 (`updateSeriesParams` action must be in reducer)  
**Slice status:** NOT STARTED

---

## Overview

Two changes:
1. **Settings side panel tab** — new `"settings"` tab in the right panel with editable indicator parameters
2. **Study button wiring** — clicking "Study" in topbar opens the `"indicators"` tab (existing behavior, just needs `onClick`)

---

## File 1: `src/demo/LibraryShowcaseDemo.tsx`

### Change 1 of 5 — Extend `SidePanelTab` type

**Find:**
```typescript
type SidePanelTab = "indicators" | "drawings" | "adapter" | "panes";
```

**Replace with:**
```typescript
type SidePanelTab = "indicators" | "drawings" | "adapter" | "panes" | "settings";
```

---

### Change 2 of 5 — Wire the Study button

**Find:**
```typescript
					<button type="button" className="gc-topbar-btn">Study</button>
```

**Replace with:**
```typescript
					<button
						type="button"
						className="gc-topbar-btn"
						onClick={() => { setSidePanelTab("settings"); }}
						title="Cài đặt indicator"
					>
						Study
					</button>
```

---

### Change 3 of 5 — Add "Settings" tab button to tab bar

**Find:**
```typescript
					{([
						["indicators", "Indicators"],
						["drawings",   "Drawing"],
						["adapter",    "Adapter"],
						["panes",      "Layout"],
					] as [SidePanelTab, string][]).map(([tab, label]) => (
```

**Replace with:**
```typescript
					{([
						["indicators", "Indicators"],
						["drawings",   "Drawing"],
						["adapter",    "Adapter"],
						["panes",      "Layout"],
						["settings",   "Settings"],
					] as [SidePanelTab, string][]).map(([tab, label]) => (
```

---

### Change 4 of 5 — Add Settings panel content

**Find this block (at the end of the side panel, just before the closing `</aside>`):**
```typescript
				{/* ── Layout / Panes ── */}
				{sidePanelTab === "panes" && (
```

**Add BEFORE it:**
```typescript
				{/* ── Settings ── */}
				{sidePanelTab === "settings" && (
					<div className="gc-sp-body">
						<div className="gc-sp-label">Thông số Indicator</div>

						{/* EMA periods — price pane */}
						{(() => {
							const pricePane = paneState.panes.find((p) => p.id === "price");
							const emaList = pricePane?.series.filter((s) => s.type === "EMA") ?? [];
							if (!pricePane || emaList.length === 0) return null;
							return (
								<>
									<div className="gc-sp-label gc-sp-label--sub">EMA (pane Price)</div>
									{emaList.map((ema, i) => (
										<div key={`ema-${i}`} className="gc-setting-row">
											<label className="gc-setting-label">
												{`EMA ${i + 1} — Period`}
											</label>
											<input
												type="number"
												className="gc-setting-input"
												min={1}
												max={300}
												step={1}
												defaultValue={typeof ema.params?.period === "number" ? ema.params.period : i === 0 ? 20 : 50}
												onBlur={(e) => {
													const val = parseInt(e.target.value, 10);
													if (!Number.isFinite(val) || val < 1) return;
													paneState.updateSeriesParams(pricePane.id, "EMA", { period: val });
												}}
											/>
										</div>
									))}
								</>
							);
						})()}

						{/* Bollinger Band params — price pane */}
						{(() => {
							const pricePane = paneState.panes.find((p) => p.id === "price");
							const bb = pricePane?.series.find((s) => s.type === "BollingerBand");
							if (!pricePane || !bb) return null;
							return (
								<>
									<div className="gc-sp-label gc-sp-label--sub">Bollinger Band</div>
									<div className="gc-setting-row">
										<label className="gc-setting-label">Period</label>
										<input
											type="number"
											className="gc-setting-input"
											min={5}
											max={200}
											step={1}
											defaultValue={typeof bb.params?.period === "number" ? bb.params.period : 20}
											onBlur={(e) => {
												const val = parseInt(e.target.value, 10);
												if (!Number.isFinite(val) || val < 5) return;
												paneState.updateSeriesParams(pricePane.id, "BollingerBand", { period: val });
											}}
										/>
									</div>
									<div className="gc-setting-row">
										<label className="gc-setting-label">Std Deviation</label>
										<input
											type="number"
											className="gc-setting-input"
											min={0.5}
											max={5}
											step={0.5}
											defaultValue={typeof bb.params?.stdDev === "number" ? bb.params.stdDev : 2}
											onBlur={(e) => {
												const val = parseFloat(e.target.value);
												if (!Number.isFinite(val) || val < 0.5) return;
												paneState.updateSeriesParams(pricePane.id, "BollingerBand", { stdDev: val });
											}}
										/>
									</div>
								</>
							);
						})()}

						{/* RSI period — momentum pane */}
						{(() => {
							const momPane = paneState.panes.find((p) => p.id === "momentum");
							const rsi = momPane?.series.find((s) => s.type === "RSI");
							if (!momPane || !rsi) return null;
							return (
								<>
									<div className="gc-sp-label gc-sp-label--sub">RSI (pane Momentum)</div>
									<div className="gc-setting-row">
										<label className="gc-setting-label">Period</label>
										<input
											type="number"
											className="gc-setting-input"
											min={2}
											max={50}
											step={1}
											defaultValue={typeof rsi.params?.period === "number" ? rsi.params.period : 14}
											onBlur={(e) => {
												const val = parseInt(e.target.value, 10);
												if (!Number.isFinite(val) || val < 2) return;
												paneState.updateSeriesParams(momPane.id, "RSI", { period: val });
											}}
										/>
									</div>
								</>
							);
						})()}

						{/* Whale threshold — orderflow pane */}
						{(() => {
							const ofPane = paneState.panes.find((p) => p.id === "orderflow");
							const whale = ofPane?.series.find((s) => s.type === "Whale");
							if (!ofPane || !whale) return null;
							return (
								<>
									<div className="gc-sp-label gc-sp-label--sub">Whale (pane Order Flow)</div>
									<div className="gc-setting-row">
										<label className="gc-setting-label">Min size (USD)</label>
										<input
											type="number"
											className="gc-setting-input"
											min={1000}
											max={10_000_000}
											step={1000}
											defaultValue={typeof whale.params?.threshold === "number" ? whale.params.threshold : 50_000}
											onBlur={(e) => {
												const val = parseInt(e.target.value, 10);
												if (!Number.isFinite(val) || val < 1000) return;
												paneState.updateSeriesParams(ofPane.id, "Whale", { threshold: val });
											}}
										/>
									</div>
								</>
							);
						})()}

						<div className="gc-sp-divider" />
						<div className="gc-sp-label">⚠ Lưu ý</div>
						<p className="gc-sp-note">
							Các thay đổi period cho RSI/EMA/BB cần tải lại trang để enrichData tính toán lại.
							Thay đổi Whale threshold có hiệu lực ngay khi dữ liệu được làm giàu lại.
						</p>

						<div className="gc-sp-divider" />
						<button
							type="button"
							className="gc-btn gc-btn--danger"
							onClick={() => {
								paneState.resetToDefault();
							}}
						>
							↺ Reset toàn bộ về mặc định
						</button>
					</div>
				)}

```

---

### Change 5 of 5 — Add CSS for settings UI

Add these classes to `src/demo/demo.css` (or inline in a `<style>` tag — prefer the CSS file):

```css
/* ─── Settings Panel ──────────────────────────────────────────────────── */
.gc-sp-label--sub {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--rsc-text-muted, #7c8798);
  margin-top: 10px;
  margin-bottom: 4px;
}

.gc-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.gc-setting-label {
  font-size: 11px;
  color: var(--rsc-text, #1e2a3b);
  flex: 1;
  white-space: nowrap;
}

.gc-setting-input {
  width: 72px;
  padding: 3px 6px;
  font-size: 11px;
  border: 1px solid var(--rsc-border, rgba(148,163,184,0.3));
  border-radius: 4px;
  background: var(--rsc-surface, #fff);
  color: var(--rsc-text, #1e2a3b);
  text-align: right;
}

.gc-setting-input:focus {
  outline: none;
  border-color: #2962ff;
}

.gc-sp-note {
  font-size: 10px;
  color: var(--rsc-text-muted, #7c8798);
  line-height: 1.5;
  margin: 0;
}

.gc-btn--danger {
  background: transparent;
  color: #f23645;
  border: 1px solid rgba(242, 54, 69, 0.3);
}

.gc-btn--danger:hover {
  background: rgba(242, 54, 69, 0.08);
}
```

---

## Known Limitation: EMA/RSI period changes don't re-compute

The `enrichData()` function in `src/lib/core/calculators/enrichData.ts` currently hardcodes:
- EMA periods: 13, 20, 50
- RSI period: 14
- MACD: 12/26/9

**`updateSeriesParams` stores the new value in pane state but does NOT trigger re-computation of indicator values.** The chart will continue showing the old computed values. A reload resets enrichData with the same hardcoded values.

**To fully implement parametric enrichment (S-5 extended scope):**
1. Refactor `enrichData(data, params: EnrichParams)` to accept periods
2. Pass `indicatorParams` from pane state into the `useMemo` that calls `enrichData`
3. This is a separate task; the Settings UI should be built first and note the limitation

**Whale threshold** is already passed to `enrichData` as a parameter:
```typescript
enrichData(rawData, whaleThreshold)
```
So whale threshold changes DO work immediately. The demo must pass the current threshold value:

**Find in LibraryShowcaseDemo.tsx** (the data pipeline — around `useMemo` for enriched data):
Look for where `enrichData` is called or where `demoData.ts` computes indicators, and thread the whale threshold from `paneState.panes.find(p=>p.id==="orderflow")?.series.find(s=>s.type==="Whale")?.params?.threshold ?? 50_000`.

*(This threading depends on the actual `enrichData` call site — implementer should grep for `whaleBuyVol` or `enrichData` in the demo pipeline.)*

---

## Acceptance Criteria Checklist

- [ ] `SidePanelTab` type includes `"settings"`
- [ ] Tab bar shows 5 tabs including "Settings"
- [ ] "Study" button in topbar opens the Settings tab
- [ ] Settings tab shows EMA period inputs for each EMA series in Price pane
- [ ] Settings tab shows BB period + stdDev inputs
- [ ] Settings tab shows RSI period input
- [ ] Settings tab shows Whale threshold input (for orderflow pane — only visible if pane exists)
- [ ] `updateSeriesParams` called on `onBlur` of each input
- [ ] Reset button calls `paneState.resetToDefault()`
- [ ] Note shown about period changes requiring reload
- [ ] CSS classes `.gc-setting-row`, `.gc-setting-label`, `.gc-setting-input` added
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run test` → all tests pass
- [ ] `npm run build:docs` → compiled successfully
- [ ] Browser test: Study button → Settings tab opens
- [ ] Browser test: Change EMA period → `paneState.panes[0].series[1].params.period` updated (verifiable via localStorage dump)
