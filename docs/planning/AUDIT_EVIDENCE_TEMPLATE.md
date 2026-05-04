# AUDIT EVIDENCE TEMPLATE — Indicator Visibility System
## Format chuẩn để dev điền vào sau mỗi Slice

---

## S-1: SeriesConfig.visible + toggleSeriesVisible Action

### Code changes
| File | Thay đổi |
|------|----------|
| `src/lib/core/types/pane-descriptor.ts` | Thêm `visible?: boolean` vào `SeriesConfig` |
| `src/lib/core/hooks/useDynamicPanes.ts` | Thêm 2 action, 2 reducer case, 2 callback, 2 return field |

### Test run — BASELINE (trước khi code S-1)
```
Date: 2026-05-04
Command: npm run test
Output:
  Test Files: 10 passed (10)
  Tests: 46 passed (46)
  Duration: 2.82s

Baseline đã xác nhận: 46 tests, 0 failures
```

### Test run — SAU S-1
```
Date: _______________
Command: npm run test
Output:
  Test Files: ___ passed
  Tests: ___ passed (0 failed)  ← cần ≥ 51 (46 + 5 new)
  Duration: ___s
  
New tests added: 5 (toggleSeriesVisible × 4, updateSeriesParams × 1)
```

### Type check
```
Date: _______________
Command: npm run type-check
Output: (paste full output or "Found 0 errors")
```

### Build
```
Date: _______________
Command: npm run build:docs
Output: (paste last 5 lines)
Status: [ ] PASSED  [ ] FAILED
```

### Browser smoke test
- [ ] Demo loads without console errors
- [ ] No visual regression (3 panes render normally)
- [ ] localStorage key `"rsc-pane-layout-v1"` contains valid JSON with `series` array (no `visible` field = OK)

---

## S-2: DynamicChart Filter

### Code changes
| File | Thay đổi |
|------|----------|
| `src/lib/core/DynamicChart.tsx` | `buildChartSlots` uses `activeSeries` filter |

### Test run
```
Date: _______________
Command: npm run test
Output: (all pass, no regressions)
```

### Build + browser smoke test
```
Date: _______________
npm run build:docs: PASSED
```

### Manual visual test
Bước thực hiện:
1. Mở `build/index.html`
2. Mở browser DevTools → Console
3. Paste vào console:
   ```javascript
   const layout = JSON.parse(localStorage.getItem('rsc-pane-layout-v1')).panes;
   const momentum = layout.find(p => p.id === 'momentum');
   const rsi = momentum.series.find(s => s.type === 'RSI');
   rsi.visible = false;
   localStorage.setItem('rsc-pane-layout-v1', JSON.stringify({version:1, panes: layout}));
   location.reload();
   ```
4. Kết quả mong đợi:
   - [ ] Đường RSI không xuất hiện trên chart
   - [ ] YAxis range của momentum pane thay đổi (không còn range 0-100 của RSI)
   - [ ] Tooltip không hiển thị row RSI

---

## S-3: Indicator Legend Chips

### Code changes
| File | Thay đổi |
|------|----------|
| `src/lib/core/IndicatorLegend.tsx` | File mới (tạo) |
| `src/lib/styles/pane-overlays.css` | Thêm `.rsc-indicator-legend` + `.rsc-indicator-chip*` |
| `src/lib/core/index.ts` | Export `IndicatorLegend` |
| `src/demo/LibraryShowcaseDemo.tsx` | Import + render `<IndicatorLegend>` per pane |

### Test run
```
Date: _______________
npm run test: PASSED (no new unit tests required for S-3)
```

### Browser visual test
- [ ] Hover vào pane Price → chips EMA(20), EMA(50), BB(20) xuất hiện
- [ ] Hover vào pane Volume → chip Vol xuất hiện
- [ ] Hover vào pane RSI+MACD → chips RSI(14) và MACD(12,26) xuất hiện
- [ ] Click icon 👁 trên chip EMA(20) → đường EMA biến mất, chip chuyển xám
- [ ] Click icon 👁 lại → đường EMA xuất hiện lại
- [ ] Click × trên chip BB → BollingerBand bị xóa khỏi pane
- [ ] Screenshot (dán file path hoặc base64 tại đây):
  ```
  Screenshot path: _______________
  ```

---

## S-4: 5 Preset Panes + PANE_MAX_VISIBLE = 5

### Code changes
| File | Thay đổi |
|------|----------|
| `src/lib/core/types/pane-descriptor.ts` | `PANE_MAX_VISIBLE = 5`, `DEFAULT_PANES` có 5 entries |

### Test run
```
Date: _______________
npm run test: PASSED
Tests updated: 2 (pane-descriptor.test + useDynamicPanes.test)
```

### Browser visual test
- [ ] Fresh load (xóa localStorage → reload): 3 panes hiển thị
- [ ] Menu Panes trong topbar hiện 5 entries (3 tích, 2 không tích)
- [ ] Tick "Order Flow" → pane mới xuất hiện với bars Whale + line CVD
- [ ] Tick "Strength" → pane mới xuất hiện với Elder Ray + RS line
- [ ] Cả 5 panes có thể ẩn/hiện qua menu
- [ ] `resetToDefault` trả về 3 panes visible
- [ ] localStorage JSON vẫn hợp lệ sau mọi thao tác

---

## S-5: Settings Panel + Study Button

### Code changes
| File | Thay đổi |
|------|----------|
| `src/demo/LibraryShowcaseDemo.tsx` | Thêm `"settings"` tab, wire Study button, render settings content |
| `src/demo/demo.css` | Thêm `.gc-setting-row`, `.gc-setting-label`, `.gc-setting-input`, `.gc-btn--danger` |

### Test run
```
Date: _______________
npm run test: PASSED
```

### Browser visual test
- [ ] Click nút "Study" trong topbar → Settings tab mở ra
- [ ] Tab "Settings" xuất hiện trong tab bar
- [ ] EMA period inputs hiển thị (default 20 và 50)
- [ ] BB inputs hiển thị
- [ ] RSI period input hiển thị
- [ ] Whale threshold input hiển thị (nếu orderflow pane tồn tại)
- [ ] Thay đổi EMA period → `paneState` cập nhật (kiểm tra qua DevTools)
- [ ] Reset button → panes trở về default

---

## FINAL INTEGRATION TEST

### Full smoke test sequence:
```
1. Xóa localStorage
2. Load build/index.html
3. Verify 3 visible panes
4. Open Panes menu → enable Order Flow
5. Open Panes menu → enable Strength (now 5 panes)
6. Hover Price pane → click 👁 on EMA(20) chip → EMA line gone
7. Hover Momentum pane → click 👁 on RSI chip → RSI gone; pane stays (MACD still visible)
8. Open Settings → change RSI period to 21 → blur → localStorage updated
9. Hover Momentum pane → click 👁 on MACD chip → momentum pane auto-hides
10. Open Panes menu → re-enable Momentum → pane appears with both series visible
11. resetToDefault → 3 visible panes, all series visible
```

Result:
- [ ] All 11 steps passed
- [ ] No console errors
- [ ] No visual artifacts (no black streaks, no layout glitches)

---

## FILES MODIFIED — Complete Audit List

| # | File | S-1 | S-2 | S-3 | S-4 | S-5 |
|---|------|:---:|:---:|:---:|:---:|:---:|
| 1 | `src/lib/core/types/pane-descriptor.ts` | ✎ | — | — | ✎ | — |
| 2 | `src/lib/core/hooks/useDynamicPanes.ts` | ✎ | — | — | — | — |
| 3 | `src/lib/core/DynamicChart.tsx` | — | ✎ | — | — | — |
| 4 | `src/lib/core/IndicatorLegend.tsx` | — | — | NEW | — | — |
| 5 | `src/lib/core/index.ts` | — | — | ✎ | — | — |
| 6 | `src/lib/styles/pane-overlays.css` | — | — | ✎ | — | — |
| 7 | `src/demo/LibraryShowcaseDemo.tsx` | — | — | ✎ | — | ✎ |
| 8 | `src/demo/demo.css` | — | — | — | — | ✎ |
| 9 | `src/lib/core/types/__tests__/pane-descriptor.test.ts` | — | — | — | ✎ | — |
| 10 | `src/lib/core/hooks/__tests__/useDynamicPanes.test.ts` | ✎ | — | — | ✎ | — |

**Legend:** ✎ = modified, NEW = created, — = untouched

---

## KNOWN ISSUES & DEFERRED WORK

| Issue | Impact | Defer reason |
|-------|--------|--------------|
| EMA/RSI period changes require page reload to re-compute | Low — settings saved, values show on reload | enrichData refactor is larger scope |
| MACD param validation (fast < slow) | Medium — invalid params crash MACD render | Need validation modal |
| CVDRealtime always undefined (offline data) | Low — line just doesn't render | WebSocket feed not available in demo |
| Color picker for per-series color | Low UX | Needs swatch component |
