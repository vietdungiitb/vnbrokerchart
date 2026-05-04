# Audit Ledger: Canonical Delivery Register (v3.0)

Tài liệu này là đăng ký duy nhất cho trạng thái delivery, file đã sửa, và gates từng slice. Phải cập nhật liên tục trong quá trình migration.

## 1. Canonical File Register

| File | Mục đích | Trạng thái |
| :--- | :--- | :--- |
| [TECH_SPEC.md](TECH_SPEC.md) | Đặc tả kỹ thuật và target shape | Updated v3.0 |
| [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) | Hướng dẫn chiến thuật cho developer | Updated v3.0 |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Kế hoạch triển khai theo slice | Updated v3.0 |
| [TASKBOARD.md](TASKBOARD.md) | Bảng công việc hàng ngày | Updated v3.0 |
| [BACKLOG.md](BACKLOG.md) | Đăng ký backlog đầy đủ | Updated v3.0 |
| [SLICE_AUDIT.md](SLICE_AUDIT.md) | Template audit và evidence từng slice | Updated v3.0 |
| [AUDIT_LEDGER.md](AUDIT_LEDGER.md) | Ledger này | Updated v3.0 |
| [HANDOFF_MANIFEST.md](HANDOFF_MANIFEST.md) | Entry point bàn giao | Updated v3.0 |
| [DELIVERY_CLOSEOUT.md](DELIVERY_CLOSEOUT.md) | Báo cáo đóng delivery | Updated v3.0 |

## 2. Slice Status

### Đã hoàn thành (S0–S16)

| Slice | Status | Gate owner | Evidence summary |
| :--- | :--- | :--- | :--- |
| S0 Baseline & inventory | ✅ Completed | Platform lead | Module tree 319 modules; blocker list captured |
| S1 Tooling & typing baseline | ✅ Completed | Tooling owner | @types installed; types.ts created |
| S2 React 19 blockers | ✅ Completed | Core owner | Zero contextTypes/findDOMNode |
| S3 Core chart engine | ✅ Completed | Core owner | ChartCanvas.tsx, GenericComponent.tsx typed |
| S4 Utilities / scale / helper | ✅ Completed | Infrastructure owner | d3-collection removed; utils compile |
| S5 Series / axes / coordinates / tooltip | ✅ Completed | Visual primitives owner | Primitives compile and render |
| S6 Interactive layer | ✅ Completed | Interaction owner | Brush/TrendLine smoke pass |
| S7 Demo restoration | ✅ Completed | Demo owner | FullDemo + LiveDemo + offline fallback |
| S8 Final validation | ✅ Completed | QA / release owner | type-check + build pass |
| S9 Demo landing polish | ✅ Completed | Demo owner | Responsive landing page |
| S10 Interaction wheel fix | ✅ Completed | Interaction owner | Native wheel listener; no passive warning |
| S11 Chart visibility fix | ✅ Completed | Demo owner | Chart fits viewport |
| S12 Offline BTC data refresh | ✅ Completed | Demo owner | Variable BTC dataset |
| S13 Legacy purge | ✅ Completed | Core/Interaction owners | Zero d3-collection, d3Event, legacy lifecycle |
| S14 Delivery closeout | ✅ Completed | Release owner | Open items = 0 |
| S15 Runtime bug fixes | ✅ Completed | Core/Demo owner | Zoom/brush/reset verified; panel layout fixed |
| S16 Migrate utils | ✅ Completed | Infrastructure owner | 15 utils files renamed to .ts; build + type-check pass |

### Chưa thực hiện (S21–S22) — Chương trình TS Migration v3.0

| Slice | Status | Gate owner | Required evidence |
| :--- | :--- | :--- | :--- |
| S17 Migrate scale/helper/calculator/index + Gate G1 | ✅ Completed | Infrastructure owner | 30 files renamed; Gate G1 pass; build:docs pass; 0 .js in scope |
| S18 Migrate series (còn lại) + axes | ✅ Completed | Visual primitives owner | 28 TSX files added/updated; 13 JS duplicates deleted; type-check + build:docs pass; module tree regenerated |
| S19 Migrate coordinates/tooltip/annotation | ✅ Completed | Visual primitives owner | 31 files updated; type-check + build:docs pass; module tree regenerated; no .js files remain in coordinates/tooltip/annotation |
| S20 Gate G2 | ✅ Completed | QA owner | type-check clean; build:docs pass; browser smoke pass; module tree regenerated |
| S21 Migrate indicator/interactive | ✅ Completed | Indicator/Interaction owners | Indicator + interactive sub-slices complete; type-check + build:docs pass; module tree regenerated; 0 .js in src/lib/interactive |
| S22 Migrate root files + Gate G3 + Final audit | ✅ Completed | Release owner | Root files migrated; type-check + build:docs pass; browser smoke pass; 0 file .js trong src/ |

### Ad-hoc documentation package — Pane splitter resize handoff

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: Tài liệu bàn giao cho đội code triển khai splitter thay đổi chiều cao pane kỹ thuật theo phong cách GoCharting
- Files modified:
  - `docs/upgrade-standard/splitter-pane-resize/HANDOFF_MANIFEST.md`
  - `docs/upgrade-standard/splitter-pane-resize/TECH_SPEC.md`
  - `docs/upgrade-standard/splitter-pane-resize/IMPLEMENTATION_PLAN.md`
  - `docs/upgrade-standard/splitter-pane-resize/TASKBOARD.md`
  - `docs/upgrade-standard/splitter-pane-resize/AUDIT_PROTOCOL.md`
  - `docs/upgrade-standard/HANDOFF_MANIFEST.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
- Nội dung bàn giao:
  - Spec kỹ thuật chi tiết cho splitter (drag, clamp, minHeight, persist, reset).
  - Kế hoạch triển khai theo phase + gates.
  - Taskboard thực thi và checklist exit trước merge.
  - Audit protocol với functional/regression matrix và evidence bắt buộc.
- Validation:
  - Documentation completeness review → PASS

### Ad-hoc demo task — Chart type switcher (GoCharting-style)

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: `src/demo` topbar chart menu + price series switching
- Files modified:
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `src/demo/demo.css`
  - `module_tree_full.md`
- Tính năng bàn giao:
  - Thêm dropdown chọn loại chart trên topbar: Candlestick, Hollow Candle, OHLC Bar, Heikin Ashi, Line, Area, Bar Chart.
  - Chuyển series hiển thị động theo lựa chọn thay vì hardcode một loại.
  - Heikin Ashi dùng transform `heikinAshi()` và giữ lại các trường indicator từ dữ liệu gốc.
  - Đóng menu khi click ra ngoài, highlight active item, đổi `seriesName` theo chart type để ép re-render đúng.
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS
  - `python scripts/generate_module_tree.py` → PASS (Modules: 594)

### S21 progress — indicator sub-slice

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: `src/lib/indicator/`
- Files added/updated:
  - `src/lib/indicator/baseIndicator.ts`
  - `src/lib/indicator/defaultOptionsForAppearance.ts`
  - `src/lib/indicator/index.ts`
  - `src/lib/indicator/ema.ts`
  - `src/lib/indicator/sma.ts`
  - `src/lib/indicator/wma.ts`
  - `src/lib/indicator/tma.ts`
  - `src/lib/indicator/rsi.ts`
  - `src/lib/indicator/stochasticOscillator.ts`
  - `src/lib/indicator/heikinAshi.ts`
  - `src/lib/indicator/elderRay.ts`
  - `src/lib/indicator/forceIndex.ts`
  - `src/lib/indicator/pointAndFigure.ts`
  - `src/lib/indicator/kagi.ts`
  - `src/lib/indicator/renko.ts`
  - `src/lib/indicator/sar.ts`
  - `src/lib/indicator/change.ts`
  - `src/lib/indicator/compare.ts`
  - `src/lib/indicator/atr.ts`
  - `src/lib/indicator/bollingerBand.ts`
  - `src/lib/indicator/macd.ts`
  - `src/lib/indicator/elderImpulse.ts`
  - `module_tree_full.md`
- Files deleted:
  - `src/lib/indicator/baseIndicator.js`
  - `src/lib/indicator/defaultOptionsForAppearance.js`
  - `src/lib/indicator/index.js`
  - `src/lib/indicator/ema.js`
  - `src/lib/indicator/sma.js`
  - `src/lib/indicator/wma.js`
  - `src/lib/indicator/tma.js`
  - `src/lib/indicator/rsi.js`
  - `src/lib/indicator/stochasticOscillator.js`
  - `src/lib/indicator/heikinAshi.js`
  - `src/lib/indicator/elderRay.js`
  - `src/lib/indicator/forceIndex.js`
  - `src/lib/indicator/pointAndFigure.js`
  - `src/lib/indicator/kagi.js`
  - `src/lib/indicator/renko.js`
  - `src/lib/indicator/sar.js`
  - `src/lib/indicator/change.js`
  - `src/lib/indicator/compare.js`
  - `src/lib/indicator/atr.js`
  - `src/lib/indicator/bollingerBand.js`
  - `src/lib/indicator/macd.js`
  - `src/lib/indicator/elderImpulse.js`
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - `python scripts/generate_module_tree.py` → Modules: 319
  - `src/lib/indicator/` → 0 `.js` files

### S21 interactive sub-slice

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: `src/lib/interactive/`
- Files added/updated:
  - `src/lib/interactive/Brush.tsx`
  - `src/lib/interactive/ClickCallback.tsx`
  - `src/lib/interactive/DrawingObjectSelector.tsx`
  - `src/lib/interactive/EquidistantChannel.tsx`
  - `src/lib/interactive/FibonacciRetracement.tsx`
  - `src/lib/interactive/GannFan.tsx`
  - `src/lib/interactive/InteractiveText.tsx`
  - `src/lib/interactive/InteractiveYCoordinate.tsx`
  - `src/lib/interactive/StandardDeviationChannel.tsx`
  - `src/lib/interactive/TrendLine.tsx`
  - `src/lib/interactive/index.ts`
  - `src/lib/interactive/components/ChannelWithArea.tsx`
  - `src/lib/interactive/components/ClickableCircle.tsx`
  - `src/lib/interactive/components/ClickableShape.tsx`
  - `src/lib/interactive/components/GannFan.tsx`
  - `src/lib/interactive/components/HoverTextNearMouse.tsx`
  - `src/lib/interactive/components/InteractiveText.tsx`
  - `src/lib/interactive/components/InteractiveYCoordinate.tsx`
  - `src/lib/interactive/components/LinearRegressionChannelWithArea.tsx`
  - `src/lib/interactive/components/MouseLocationIndicator.tsx`
  - `src/lib/interactive/components/StraightLine.tsx`
  - `src/lib/interactive/components/Text.tsx`
  - `src/lib/interactive/utils.ts`
  - `src/lib/interactive/wrapper/EachEquidistantChannel.tsx`
  - `src/lib/interactive/wrapper/EachFibRetracement.tsx`
  - `src/lib/interactive/wrapper/EachGannFan.tsx`
  - `src/lib/interactive/wrapper/EachInteractiveYCoordinate.tsx`
  - `src/lib/interactive/wrapper/EachLinearRegressionChannel.tsx`
  - `src/lib/interactive/wrapper/EachText.tsx`
  - `src/lib/interactive/wrapper/EachTrendLine.tsx`
  - `module_tree_full.md`
- Files deleted:
  - `src/lib/interactive/Brush.js`
  - `src/lib/interactive/ClickCallback.js`
  - `src/lib/interactive/DrawingObjectSelector.js`
  - `src/lib/interactive/EquidistantChannel.js`
  - `src/lib/interactive/FibonacciRetracement.js`
  - `src/lib/interactive/GannFan.js`
  - `src/lib/interactive/InteractiveText.js`
  - `src/lib/interactive/InteractiveYCoordinate.js`
  - `src/lib/interactive/StandardDeviationChannel.js`
  - `src/lib/interactive/TrendLine.js`
  - `src/lib/interactive/index.js`
  - `src/lib/interactive/utils.js`
  - `src/lib/interactive/components/ChannelWithArea.js`
  - `src/lib/interactive/components/ClickableCircle.js`
  - `src/lib/interactive/components/ClickableShape.js`
  - `src/lib/interactive/components/GannFan.js`
  - `src/lib/interactive/components/HoverTextNearMouse.js`
  - `src/lib/interactive/components/InteractiveText.js`
  - `src/lib/interactive/components/InteractiveYCoordinate.js`
  - `src/lib/interactive/components/LinearRegressionChannelWithArea.js`
  - `src/lib/interactive/components/MouseLocationIndicator.js`
  - `src/lib/interactive/components/StraightLine.js`
  - `src/lib/interactive/components/Text.js`
  - `src/lib/interactive/wrapper/EachEquidistantChannel.js`
  - `src/lib/interactive/wrapper/EachFibRetracement.js`
  - `src/lib/interactive/wrapper/EachGannFan.js`
  - `src/lib/interactive/wrapper/EachInteractiveYCoordinate.js`
  - `src/lib/interactive/wrapper/EachLinearRegressionChannel.js`
  - `src/lib/interactive/wrapper/EachText.js`
  - `src/lib/interactive/wrapper/EachTrendLine.js`
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - `python scripts/generate_module_tree.py` → Modules: 319
  - `src/lib/interactive/` → 0 `.js` files

### S22 root-file sub-slice

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: `src/lib/` root entrypoints
- Files added/updated:
  - `src/lib/EventCapture.tsx`
  - `src/lib/CanvasContainer.tsx`
  - `src/lib/BackgroundText.tsx`
  - `src/lib/ZoomButtons.tsx`
  - `src/lib/algorithm/index.ts`
  - `src/vendor.d.ts`
  - `module_tree_full.md`
- Files deleted:
  - `src/lib/EventCapture.js`
  - `src/lib/CanvasContainer.js`
  - `src/lib/BackgroundText.js`
  - `src/lib/ZoomButtons.js`
  - `src/lib/algorithm/index.js`
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - `python scripts/generate_module_tree.py` → Modules: 319
  - `src/` → 0 `.js` files
  - Browser smoke on `http://127.0.0.1:4173/index.html` → PASS

### Demo simplification — clean chart landing

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: `src/demo/`
- Files added/updated:
  - `src/demo/SimpleDemo.tsx`
  - `src/demo/index.tsx`
  - `module_tree_full.md`
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - `python scripts/generate_module_tree.py` → Modules: 320
  - Browser smoke on `http://127.0.0.1:4173/index.html` → PASS
- Kết luận: PASS — demo landing simplified và brush span vẫn giữ được.

### Demo restoration — original-like layout

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: `src/demo/`, `src/lib/tooltip/`, `src/lib/ChartCanvas.tsx`
- Files added/updated:
  - `src/demo/OriginalLikeDemo.tsx`
  - `src/demo/index.tsx`
  - `src/demo/demo.css`
  - `src/lib/ChartCanvas.tsx`
  - `src/lib/tooltip/MovingAverageTooltip.tsx`
  - `src/lib/tooltip/OHLCTooltip.tsx`
  - `src/lib/tooltip/MACDTooltip.tsx`
  - `module_tree_full.md`
- Files deleted:
  - `src/demo/SimpleDemo.tsx`
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - `python scripts/generate_module_tree.py` → Modules: 320
  - Browser smoke on `http://127.0.0.1:4173/index.html` → PASS
  - `xExtents` reset verified via browser state after brush callback
- Kết luận: PASS — demo gọn nhưng giữ cấu trúc gốc; wheel zoom và brush span đều hoạt động.

## 3. Modified-file rule

Mọi slice đã hoàn thành phải liệt kê chính xác tên file đã sửa. File không có trong ledger không được đóng audit.

## 4. Audit checklist — luôn phải pass

- [ ] `npm run type-check` pass.
- [ ] `npm run build:docs` pass.
- [ ] Không còn `contextTypes` / `childContextTypes` / `findDOMNode` trong `src/lib`.
- [ ] `propTypes` blocks được giữ nguyên trong mọi file được chạm.
- [ ] Demo có offline fallback — không phụ thuộc network.
- [ ] `module_tree_full.md` được regenerate sau khi rename file.

## 5. Evidence S0–S15 (lưu trữ)

_(Các evidence chi tiết của S0–S15 được giữ nguyên bên dưới cho tham chiếu lịch sử.)_

### S0 Evidence
- `scripts/generate_module_tree.py` corrected. Modules: 319.
- Files: `scripts/generate_module_tree.py`, `module_tree_full.md`

### S1 Evidence
- `@types/react`, `@types/react-dom`, `@types/prop-types`, `@types/d3-shape` installed.
- `src/lib/types.ts` created. `GenericComponent`, `BarSeries`, `CandlestickSeries`, `LineSeries` typed.
- Files: `package.json`, `package-lock.json`, `src/lib/types.ts`, `src/lib/GenericComponent.tsx`, `src/lib/series/BarSeries.tsx`, `src/lib/series/CandlestickSeries.tsx`, `src/lib/series/LineSeries.tsx`, `module_tree_full.md`

### S3 Evidence
- `ChartCanvas.tsx`, `GenericComponent.tsx`, `GenericChartComponent.tsx`, `Chart.tsx`, `StockChartContext.tsx`, `types.ts` typed.
- Files: above 6 files

### S4 Evidence
- `d3-collection` → native Set. `utils/ChartDataUtil.js`, `utils/index.js`, `package.json`, `package-lock.json`

### S5 Evidence
- Series: `BarSeries`, `CandlestickSeries`, `LineSeries`, `StraightLine`, `MACDSeries`, `RSISeries`.
- Axes: `XAxis.js`, `YAxis.js`. Coordinates: `CrossHairCursor.js`, `Cursor.js`. Tooltip: `HoverTooltip.js`.

### S6 Evidence
- `EventCapture.js`, `axes/AxisZoomCapture.js` — pointer-based D3 APIs.

### S7 Evidence
- `config/webpack.config.js`, `src/demo/demoData.ts`, `src/demo/FullDemo.tsx`, `src/demo/LiveDemo.tsx`, `src/demo/index.tsx` + series files above.

### S8 Evidence
- Docs updated. `npm run type-check` + `npm run build:docs` pass.

### S15 Evidence
- `src/lib/ChartCanvas.tsx` — added `pointsPerPxThreshold: 2, minPointsPerPxThreshold: 0.02` to defaultProps.
- `src/lib/scale/evaluator.js` — null-guard in `canShowTheseManyPeriods`.
- `src/demo/FullDemo.tsx` — fixed `volumeOrigin`, `rsiOrigin`, `macdOrigin` to include `overviewHeight`.
- `module_tree_full.md` — regenerated (323 modules).

## 6. Evidence S16–S22 (điền khi hoàn thành)

### S16 Evidence
- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Files renamed:
  - `src/lib/utils/noop.js` → `src/lib/utils/noop.ts`
  - `src/lib/utils/identity.js` → `src/lib/utils/identity.ts`
  - `src/lib/utils/shallowEqual.js` → `src/lib/utils/shallowEqual.ts`
  - `src/lib/utils/rebind.js` → `src/lib/utils/rebind.ts`
  - `src/lib/utils/strokeDasharray.js` → `src/lib/utils/strokeDasharray.ts`
  - `src/lib/utils/barWidth.js` → `src/lib/utils/barWidth.ts`
  - `src/lib/utils/PureComponent.js` → `src/lib/utils/PureComponent.ts`
  - `src/lib/utils/zipper.js` → `src/lib/utils/zipper.ts`
  - `src/lib/utils/merge.js` → `src/lib/utils/merge.ts`
  - `src/lib/utils/accumulatingWindow.js` → `src/lib/utils/accumulatingWindow.ts`
  - `src/lib/utils/mappedSlidingWindow.js` → `src/lib/utils/mappedSlidingWindow.ts`
  - `src/lib/utils/slidingWindow.js` → `src/lib/utils/slidingWindow.ts`
  - `src/lib/utils/ChartDataUtil.js` → `src/lib/utils/ChartDataUtil.ts`
  - `src/lib/utils/zoomBehavior.js` → `src/lib/utils/zoomBehavior.ts`
  - `src/lib/utils/index.js` → `src/lib/utils/index.ts`
- Support file added:
  - `src/vendor.d.ts`
- npm run type-check: PASS
- npm run build:docs: PASS (3 warnings; non-blocking)
- python scripts/generate_module_tree.py: Modules: 324
- Kết luận: PASS — S16 closed, utils slice fully migrated to TypeScript.

### S17 Evidence + Gate G1 — ✅ Completed

```
Người thực hiện: GitHub Copilot
Ngày: 2025-01-31
Files renamed (30 files):
  Calculator (20 files):
  - src/lib/calculator/defaultOptionsForComputation.js → .ts
  - src/lib/calculator/change.js → .ts
  - src/lib/calculator/compare.js → .ts
  - src/lib/calculator/ema.js → .ts
  - src/lib/calculator/sma.js → .ts
  - src/lib/calculator/wma.js → .ts
  - src/lib/calculator/tma.js → .ts
  - src/lib/calculator/atr.js → .ts
  - src/lib/calculator/forceIndex.js → .ts
  - src/lib/calculator/smoothedForceIndex.js → .ts
  - src/lib/calculator/elderRay.js → .ts
  - src/lib/calculator/heikinAshi.js → .ts
  - src/lib/calculator/bollingerband.js → .ts
  - src/lib/calculator/macd.js → .ts
  - src/lib/calculator/rsi.js → .ts
  - src/lib/calculator/sar.js → .ts
  - src/lib/calculator/sto.js → .ts
  - src/lib/calculator/kagi.js → .ts
  - src/lib/calculator/renko.js → .ts
  - src/lib/calculator/pointAndFigure.js → .ts
  - src/lib/calculator/index.js → .ts
  Scale (5 files):
  - src/lib/scale/levels.js → .ts
  - src/lib/scale/evaluator.js → .ts
  - src/lib/scale/financeDiscontinuousScale.js → .ts
  - src/lib/scale/discontinuousTimeScaleProvider.js → .ts
  - src/lib/scale/index.js → .ts
  Helper (5 files):
  - src/lib/helper/SaveChartAsImage.js → .ts
  - src/lib/helper/TypeChooser.js → .tsx
  - src/lib/helper/fitWidth.js → .tsx
  - src/lib/helper/fitDimensions.js → .tsx
  - src/lib/helper/index.js → .ts
  Root:
  - src/index.js → .ts
  Support:
  - src/vendor.d.ts (added save-svg-as-png declaration)
Gate G1:
  npm run type-check: PASS
  npm run build:docs: PASS (3 warnings; non-blocking)
  Get-ChildItem ... -Include "*.js": 0 results
  python scripts/generate_module_tree.py: regenerated
Fixes applied:
  - path() defaultValue made optional
  - stdDev ?? 0 in bollingerband.ts
  - avgGain/avgLoss typed as number with ?? 0 in rsi.ts
  - timeFormatDefaultLocale removed (d3-time-format v3 API change)
  - getClosestItemIndexes 4th arg passed as undefined in evaluator.ts
  - merge() cast as any in kagi.ts and renko.ts
Kết luận: PASS — S17 closed, Gate G1 passed.
```

### S18 Evidence — ✅ Completed

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: `src/lib/series/*` còn lại + `src/lib/axes/*`
- Detailed file list: xem [SLICE_AUDIT.md](SLICE_AUDIT.md) mục S18
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - `python scripts/generate_module_tree.py` → Modules: 319
- Kết luận: PASS — S18 closed; series/axes layer đã migrate sang TypeScript, JS duplicates đã được dọn sạch.

### S19 Evidence — ✅ Completed
- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: `src/lib/coordinates/`, `src/lib/tooltip/`, `src/lib/annotation/`
- Files updated:
  - `src/lib/coordinates/CurrentCoordinate.tsx`
  - `src/lib/coordinates/CrossHairCursor.tsx`
  - `src/lib/coordinates/EdgeIndicator.tsx`
  - `src/lib/coordinates/MouseCoordinateX.tsx`
  - `src/lib/coordinates/MouseCoordinateY.tsx`
  - `src/lib/coordinates/PriceCoordinate.tsx`
  - `src/lib/coordinates/index.ts`
  - `src/lib/coordinates/EdgeCoordinate.tsx`
  - `src/lib/coordinates/EdgeCoordinateV2.tsx`
  - `src/lib/coordinates/EdgeCoordinateV3.tsx`
  - `src/lib/coordinates/Cursor.tsx`
  - `src/lib/coordinates/MouseCoordinateXV2.tsx`
  - `src/lib/tooltip/displayValuesFor.ts`
  - `src/lib/tooltip/ToolTipTSpanLabel.tsx`
  - `src/lib/tooltip/ToolTipText.tsx`
  - `src/lib/tooltip/index.ts`
  - `src/lib/tooltip/SingleValueTooltip.tsx`
  - `src/lib/tooltip/RSITooltip.tsx`
  - `src/lib/tooltip/BollingerBandTooltip.tsx`
  - `src/lib/tooltip/StochasticTooltip.tsx`
  - `src/lib/tooltip/MACDTooltip.tsx`
  - `src/lib/tooltip/MovingAverageTooltip.tsx`
  - `src/lib/tooltip/OHLCTooltip.tsx`
  - `src/lib/tooltip/HoverTooltip.tsx`
  - `src/lib/tooltip/GroupTooltip.tsx`
  - `src/lib/annotation/Annotate.tsx`
  - `src/lib/annotation/SvgPathAnnotation.tsx`
  - `src/lib/annotation/LabelAnnotation.tsx`
  - `src/lib/annotation/Label.tsx`
  - `src/lib/annotation/BarAnnotation.tsx`
  - `src/lib/annotation/index.ts`
  - `module_tree_full.md`
- Files deleted:
  - `src/lib/coordinates/EdgeCoordinate.js`
  - `src/lib/coordinates/EdgeCoordinateV2.js`
  - `src/lib/coordinates/EdgeCoordinateV3.js`
  - `src/lib/coordinates/Cursor.js`
  - `src/lib/coordinates/MouseCoordinateXV2.js`
  - `src/lib/tooltip/displayValuesFor.js`
  - `src/lib/tooltip/ToolTipTSpanLabel.js`
  - `src/lib/tooltip/ToolTipText.js`
  - `src/lib/tooltip/index.js`
  - `src/lib/tooltip/SingleValueTooltip.js`
  - `src/lib/tooltip/RSITooltip.js`
  - `src/lib/tooltip/BollingerBandTooltip.js`
  - `src/lib/tooltip/StochasticTooltip.js`
  - `src/lib/tooltip/MACDTooltip.js`
  - `src/lib/tooltip/MovingAverageTooltip.js`
  - `src/lib/tooltip/OHLCTooltip.js`
  - `src/lib/tooltip/HoverTooltip.js`
  - `src/lib/tooltip/GroupTooltip.js`
  - `src/lib/annotation/Annotate.js`
  - `src/lib/annotation/SvgPathAnnotation.js`
  - `src/lib/annotation/LabelAnnotation.js`
  - `src/lib/annotation/Label.js`
  - `src/lib/annotation/BarAnnotation.js`
  - `src/lib/annotation/index.js`
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - `python scripts/generate_module_tree.py` → Modules: 319
  - `src/lib/coordinates/`, `src/lib/tooltip/`, `src/lib/annotation/` → 0 `.js` files
- Kết luận: PASS — S19 closed; coordinates, tooltip, annotation layers migrated.

### S20 Evidence (Gate G2) — ✅ Completed
- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: Gate validation only, no source edits
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - Browser smoke on [Demo đầy đủ](http://127.0.0.1:4173/index.html) → candlestick, axes, cursor, Bollinger Band, RSI, MACD, and tooltip layers rendered
  - `python scripts/generate_module_tree.py` → Modules: 319
- Kết luận: PASS — S20/Gate G2 cleared.

### S21 Evidence — ⬜ Chưa thực hiện

### S22 Evidence + Gate G3 + Final audit — ⬜ Chưa thực hiện

```
Gate G3:
  npm run type-check: PASS (zero error)
  npm run build:docs: PASS
  Get-ChildItem src -Recurse -Include "*.js": 0 kết quả
  python scripts/generate_module_tree.py: Modules: N (0 .js)
  Browser smoke: zoom / pan / brush / indicators / tooltip: tất cả PASS
Kết luận: 100% TypeScript — DONE
```

## 1. Canonical File Register

| File | Purpose | Status |
| :--- | :--- | :--- |
| [TECH_SPEC.md](TECH_SPEC.md) | Architecture standard and target shape | Baseline |
| [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) | Tactical migration order | Baseline |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Slice execution plan | New |
| [TASKBOARD.md](TASKBOARD.md) | Day-to-day workboard | New |
| [BACKLOG.md](BACKLOG.md) | Full task backlog | New |
| [SLICE_AUDIT.md](SLICE_AUDIT.md) | Evidence template for each slice | New |
| [HANDOFF_MANIFEST.md](HANDOFF_MANIFEST.md) | Entry point for the handoff package | Updated |

## 2. Slice Status

| Slice | Status | Gate owner role | Required evidence |
| :--- | :--- | :--- | :--- |
| S0 Baseline & inventory | Completed | Platform lead | Baseline type-check log, module tree snapshot, current blocker list |
| S1 Tooling & typing baseline | Completed | Tooling owner | Dependency install record, tsconfig diff, type declaration coverage |
| S2 React 19 blockers | Completed | Core owner | Zero legacy context APIs, zero `findDOMNode`, ref rule sweep |
| S3 Core chart engine | Completed | Core owner | `ChartCanvas`/`GenericComponent` passing type-check and render smoke test |
| S4 Utilities / scale / helper | Completed | Infrastructure owner | Utility files compile cleanly and remain behaviorally unchanged |
| S5 Series / axes / coordinates / tooltip | Completed | Visual primitives owner | Chart primitives compile and the demo renders without runtime regressions |
| S6 Interactive layer | Completed | Interaction owner | Drawing tools and interactive wrappers behave under React 19 |
| S7 Demo restoration | Completed | Demo owner | Full demo loads with internet data and offline fallback |
| S8 Final validation & handoff | Completed | QA / release owner | Final type-check, build, smoke test, and audit closure |
| S9 Demo landing polish | Completed | Demo owner | Responsive landing-page build, browser smoke, live/local source toggle smoke |
| S10 Interaction wheel fix | Completed | Interaction owner | Native wheel listener avoids passive preventDefault warnings and preserves zoom smoke |
| S11 Chart visibility fix | Completed | Demo owner | Chart surface fits viewport more cleanly so brush span is reachable without extra scrolling |
| S12 Offline BTC data refresh | Completed | Demo owner | Local fallback uses a variable BTC dataset so changes are visible before toggling live data |
| S13 Legacy purge (D3 + lifecycle) | Completed | Core/interaction owners | Zero d3-collection imports, zero d3Event, zero legacy lifecycle usage in src |
| S14 Delivery closeout | Completed | Release owner | Backlog statusized with Open items = 0 and formal closeout report added |
| S15 Runtime bug fixes: zoom/pan/brush | Completed | Core/Demo owner | Zoom, brush-span navigation, ZoomButtons reset verified in browser |

## 3. Modified-file rule

Every completed slice must update this ledger with the exact files changed in that slice. If a file is not listed here, it is not eligible for audit closure.

## 4. Audit checklist

- No `contextTypes` or `childContextTypes` remain in `src/lib`.
- No `findDOMNode` calls remain.
- `propTypes` blocks stay in place, with the React 19 note comment above each block when touched.
- `LiveDemo` has a local fallback path so the demo does not depend on a live network response to be verified.
- `npm run type-check` and `npm run build:docs` are the final gates before handoff.

## 5. Slice 0 Evidence

### Completed

- `scripts/generate_module_tree.py` was corrected to scan the repository root and write the inventory to `module_tree_full.md`.
- `module_tree_full.md` was regenerated successfully and now covers `config/`, `docs/`, `scripts/`, and `src/`.
- Baseline type-check remains failing with the existing React/TypeScript typing gaps already observed in `src/lib`.

### Validation

- Command run: `& "c:/Mujoco Projects/react-stockcharts-master/.venv/Scripts/python.exe" scripts/generate_module_tree.py`
- Output: `Generated: C:\Mujoco Projects\react-stockcharts-master\module_tree_full.md`
- Output: `Modules: 319`

### Files touched in this slice

- [scripts/generate_module_tree.py](../../scripts/generate_module_tree.py)
- [module_tree_full.md](../../module_tree_full.md)

### Next slice

- S2 React 19 blockers

## 6. Slice 1 Evidence

### Completed

- Installed `@types/react`, `@types/react-dom`, `@types/prop-types`, and `@types/d3-shape`.
- Added shared chart typings in `src/lib/types.ts`.
- Typed `GenericComponent`, `BarSeries`, `CandlestickSeries`, and `LineSeries` against the new shared contracts.
- Regenerated `module_tree_full.md` after the source changes.

### Validation

- Command run: `npm run type-check`
- Command run: `& "c:/Mujoco Projects/react-stockcharts-master/.venv/Scripts/python.exe" scripts/generate_module_tree.py`
- Result: baseline typings errors are gone from the touched files; remaining type-check failures have moved to `src/lib/ChartCanvas.tsx` and are now the next slice's responsibility.

### Files touched in this slice

- [package.json](../../package.json)
- [package-lock.json](../../package-lock.json)
- [src/lib/types.ts](../../src/lib/types.ts)
- [src/lib/GenericComponent.tsx](../../src/lib/GenericComponent.tsx)
- [src/lib/series/BarSeries.tsx](../../src/lib/series/BarSeries.tsx)
- [src/lib/series/CandlestickSeries.tsx](../../src/lib/series/CandlestickSeries.tsx)
- [src/lib/series/LineSeries.tsx](../../src/lib/series/LineSeries.tsx)
- [module_tree_full.md](../../module_tree_full.md)

## 7. Slice 3 Evidence

### Completed

- `ChartCanvas`, `GenericComponent`, `GenericChartComponent`, `Chart`, `StockChartContext`, and shared `types` all passed file-scoped validation.
- The core engine no longer blocks the repo-wide type-check, and the render path advances into the series/demo layer cleanly.

### Validation

- Command run: `get_errors` on `src/lib/ChartCanvas.tsx`, `src/lib/GenericComponent.tsx`, `src/lib/GenericChartComponent.tsx`, `src/lib/Chart.tsx`, `src/lib/StockChartContext.tsx`, and `src/lib/types.ts`
- Command run: `npm run type-check`
- Result: no errors in the touched core files; repo type-check advances past the core engine and into the visual/demo slices.

### Files touched in this slice

- [src/lib/ChartCanvas.tsx](../../src/lib/ChartCanvas.tsx)
- [src/lib/GenericComponent.tsx](../../src/lib/GenericComponent.tsx)
- [src/lib/GenericChartComponent.tsx](../../src/lib/GenericChartComponent.tsx)
- [src/lib/Chart.tsx](../../src/lib/Chart.tsx)
- [src/lib/StockChartContext.tsx](../../src/lib/StockChartContext.tsx)
- [src/lib/types.ts](../../src/lib/types.ts)

## 8. Slice 7 Evidence

### Completed

- Added a raw-CSV module path and an offline demo data helper that parses the local BTC/USD CSV and enriches it with RSI and MACD.
- Switched the demo entry to the local fallback path by default and kept `LiveDemo` on a live fetch path with offline fallback.
- Modernized the Webpack and Babel runtime config so the demo bundle can build under the existing TypeScript/React 19 stack.
- Fixed the remaining D3 v7 interaction breakpoints in `EventCapture` and `AxisZoomCapture` by switching to pointer-based APIs.
- Regenerated `module_tree_full.md` after the source changes.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Browser smoke test on `build/index.html` after the final rebuild
- Result: bundle builds successfully, the browser opens the demo without page errors, and the chart renders with local fallback data.

### Files touched in this slice

- [config/webpack.config.js](../../config/webpack.config.js)
- [.babelrc](../../.babelrc)
- [package.json](../../package.json)
- [package-lock.json](../../package-lock.json)
- [src/csv.d.ts](../../src/csv.d.ts)
- [src/demo/demoData.ts](../../src/demo/demoData.ts)
- [src/demo/FullDemo.tsx](../../src/demo/FullDemo.tsx)
- [src/demo/LiveDemo.tsx](../../src/demo/LiveDemo.tsx)
- [src/demo/index.tsx](../../src/demo/index.tsx)
- [src/lib/EventCapture.js](../../src/lib/EventCapture.js)
- [src/lib/axes/AxisZoomCapture.js](../../src/lib/axes/AxisZoomCapture.js)
- [src/lib/utils/index.js](../../src/lib/utils/index.js)
- [src/lib/series/BarSeries.tsx](../../src/lib/series/BarSeries.tsx)
- [src/lib/series/CandlestickSeries.tsx](../../src/lib/series/CandlestickSeries.tsx)
- [src/lib/series/LineSeries.tsx](../../src/lib/series/LineSeries.tsx)
- [src/lib/series/StraightLine.tsx](../../src/lib/series/StraightLine.tsx)
- [src/lib/series/MACDSeries.tsx](../../src/lib/series/MACDSeries.tsx)
- [src/lib/series/RSISeries.tsx](../../src/lib/series/RSISeries.tsx)
- [module_tree_full.md](../../module_tree_full.md)

## 9. Slice 4 Evidence

### Completed

- Replaced the last `d3-collection` usage in `ChartDataUtil` with a native `Set`, then removed the unused `d3-collection` package from the manifest.
- Kept the modern D3 color scale import in `src/lib/utils/index.js` so the overlay color helper continues to work under the newer package split.
- Regenerated `module_tree_full.md` after the dependency and utility cleanup.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Result: utilities/scale compile clean, the bundle still emits successfully, and the extra legacy collection dependency is gone.

### Files touched in this slice

- [src/lib/utils/ChartDataUtil.js](../../src/lib/utils/ChartDataUtil.js)
- [src/lib/utils/index.js](../../src/lib/utils/index.js)
- [package.json](../../package.json)
- [package-lock.json](../../package-lock.json)
- [module_tree_full.md](../../module_tree_full.md)

## 10. Slice 5 Evidence

### Completed

- Series primitives and supporting chart primitives now render cleanly under the modern bundle path.
- The chart stack keeps the React 19 propTypes documentation comment where the files were touched, and the browser smoke shows the full chart shell rendering without runtime regressions.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: browser smoke test on `build/index.html`
- Result: price/volume/indicator primitives render under the demo bundle and the chart remains stable in the browser.

### Files touched in this slice

- [src/lib/series/BarSeries.tsx](../../src/lib/series/BarSeries.tsx)
- [src/lib/series/CandlestickSeries.tsx](../../src/lib/series/CandlestickSeries.tsx)
- [src/lib/series/LineSeries.tsx](../../src/lib/series/LineSeries.tsx)
- [src/lib/series/StraightLine.tsx](../../src/lib/series/StraightLine.tsx)
- [src/lib/series/MACDSeries.tsx](../../src/lib/series/MACDSeries.tsx)
- [src/lib/series/RSISeries.tsx](../../src/lib/series/RSISeries.tsx)
- [src/lib/axes/XAxis.js](../../src/lib/axes/XAxis.js)
- [src/lib/axes/YAxis.js](../../src/lib/axes/YAxis.js)
- [src/lib/coordinates/CrossHairCursor.js](../../src/lib/coordinates/CrossHairCursor.js)
- [src/lib/coordinates/Cursor.js](../../src/lib/coordinates/Cursor.js)
- [src/lib/tooltip/HoverTooltip.js](../../src/lib/tooltip/HoverTooltip.js)

## 11. Slice 6 Evidence

### Completed

- Switched the remaining interaction hot paths to pointer-based D3 APIs so the demo no longer depends on removed `mouse()`/`touches()` helpers.
- Restored the React import in the classic JSX JS files so the interaction render path no longer crashes with `React is not defined`.
- Verified the chart with hover/pan/drag/wheel smoke in the browser after the final rebuild.

### Validation

- Command run: `npm run build:docs`
- Command run: browser hover/drag/wheel smoke on the demo page
- Result: interaction surfaces stay up without page errors after the event-layer migration.

### Files touched in this slice

- [src/lib/EventCapture.js](../../src/lib/EventCapture.js)
- [src/lib/axes/AxisZoomCapture.js](../../src/lib/axes/AxisZoomCapture.js)

## 12. Slice 8 Evidence

### Completed

- Updated the delivery board, slice audit, and audit ledger to reflect the completed migration slices.
- Regenerated `module_tree_full.md` after the final source changes.
- Re-ran `npm run type-check`, `npm run build:docs`, and browser smoke on the refreshed bundle.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: browser smoke test on `build/index.html`
- Result: final validation passed and the handoff records are current.

### Files touched in this slice

- [docs/upgrade-standard/TASKBOARD.md](../../docs/upgrade-standard/TASKBOARD.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [module_tree_full.md](../../module_tree_full.md)

## S15 Evidence: Runtime bug fixes — zoom/pan/brush

### Bugs fixed

**Bug 1 – Zoom/pan domain never changed**
- Root cause: `pointsPerPxThreshold` and `minPointsPerPxThreshold` had no default values in `ChartCanvas.defaultProps`. This caused `canShowTheseManyPeriods(width, arrayLength, undefined, undefined)` to evaluate `Math.floor(839 * undefined) = NaN`, making `arrayLength < NaN` always `false`. `filterData` therefore always returned the unchanged `currentDomain`.
- Fix 1a: Added `pointsPerPxThreshold: 2, minPointsPerPxThreshold: 0.02` to `ChartCanvas.defaultProps`.
- Fix 1b: Added null-guard in `evaluator.js` `canShowTheseManyPeriods` → returns `true` when thresholds are missing.

**Bug 2 – Panel layout overlap (overview panel overlapped MACD)**
- Root cause: `volumeOrigin`, `rsiOrigin`, and `macdOrigin` in `FullDemo.tsx` did not include `overviewHeight` (74 px) in their offset calculations. This created a 74 px blank gap between the price chart and volume chart, and the overview/brush panel overlapped the MACD panel.
- Fix: Added `overviewHeight` term to each `createOrigin(...)` call for volume, RSI, and MACD panels.

### Verification (Playwright browser tests)

| Interaction | Result |
| :--- | :--- |
| Zoom in (5× scroll-up) | `plotDataLength` 160 → 99; domain narrowed from `17:48–20:27` to `18:17–19:56` ✅ |
| Zoom out (5× scroll-down) | Domain expanded from `17:48–20:27` to `17:21–20:53` ✅ |
| Brush span drag (overview panel) | Domain narrowed to brushed range; confirmed `changed: true` ✅ |
| ZoomButtons reset ("C") | Domain reset to full dataset range; confirmed `changed: true` ✅ |
| Pan (drag) | Intentionally disabled when Brush is enabled (`disablePan={enabled}` in `Brush.js` line 191) — by-design behavior ✅ |

### Files touched in this slice

- [src/lib/ChartCanvas.tsx](../../src/lib/ChartCanvas.tsx) — added `pointsPerPxThreshold: 2, minPointsPerPxThreshold: 0.02` to defaultProps
- [src/lib/scale/evaluator.js](../../src/lib/scale/evaluator.js) — null-guard in `canShowTheseManyPeriods`
- [src/demo/FullDemo.tsx](../../src/demo/FullDemo.tsx) — fixed `volumeOrigin`, `rsiOrigin`, `macdOrigin` to include `overviewHeight`
- [module_tree_full.md](../../module_tree_full.md) — regenerated (323 modules)

## 13. Demo landing polish

### Completed

- Rebuilt the demo shell into a polished Vietnamese landing page with a responsive hero, source toggle, stats panel, feature legend, and chart chrome.
- Expanded the demo data helper to add EMA overlays and a live Binance fetch path that shares the same enrichment pipeline as the local CSV fallback.
- Added a small declaration shim for `d3-format` and `d3-time-format`, then installed the missing `d3-force` runtime dependency required by the existing axis implementation.
- Regenerated `module_tree_full.md` after the source changes and verified the new bundle in the browser, including the live source toggle path.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Browser smoke test on `build/index.html`
- Browser toggle smoke on the `Binance trực tiếp` control
- Result: the demo bundle builds successfully, the page renders without runtime errors, and the source toggle switches data without breaking the interaction layer.

### Files touched in this slice

- [package.json](../../package.json)
- [package-lock.json](../../package-lock.json)
- [src/demo/demoData.ts](../../src/demo/demoData.ts)
- [src/demo/FullDemo.tsx](../../src/demo/FullDemo.tsx)
- [src/demo/index.tsx](../../src/demo/index.tsx)
- [src/demo/index.html](../../src/demo/index.html)
- [src/demo/demo.css](../../src/demo/demo.css)
- [src/d3-format.d.ts](../../src/d3-format.d.ts)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [docs/upgrade-standard/TASKBOARD.md](../../docs/upgrade-standard/TASKBOARD.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [module_tree_full.md](../../module_tree_full.md)

## 19. Runtime brush-drag fix — visible span selection

### Completed

- Shrunk the original-like demo layout so the brush overview stays inside the visible viewport on the 504px browser height used here.
- Wired `EventCapture` to keep window `mousemove` attached during brush presses, then moved the `ChartCanvas` mousemove state update out of the RAF gate so brush drags cannot get stuck waiting for redraw timing.
- Regenerated `module_tree_full.md` after the source changes and confirmed the browser span drag now changes the visible range.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: `python scripts/generate_module_tree.py`
- Browser drag smoke on `http://127.0.0.1:4173/index.html`
- Result: span brush now works in the visible viewport and the x-domain changes from `[50,199]` to `[85,122]` after a real drag.

### Files touched in this slice

- [src/lib/EventCapture.tsx](../../src/lib/EventCapture.tsx)
- [src/lib/ChartCanvas.tsx](../../src/lib/ChartCanvas.tsx)
- [src/demo/OriginalLikeDemo.tsx](../../src/demo/OriginalLikeDemo.tsx)
- [src/demo/demo.css](../../src/demo/demo.css)
- [module_tree_full.md](../../module_tree_full.md)

## 20. Runtime wheel-focus + visible range badge fix

### Completed

- Removed the wheel-focus gate from `EventCapture` so a fresh load can zoom immediately without requiring an initial click.
- Added a live visible-range badge to the demo header so wheel zoom and brush spans are obvious even when the chart change is subtle.
- Kept the brush selection styling visible on the dark theme and regenerated `module_tree_full.md` after the runtime change.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: `python scripts/generate_module_tree.py`
- Browser smoke on a fresh tab without click focus
- Result: wheel zoom changed the badge from `149 nến` to `291 nến` immediately, and brush drag updated the badge and visible span styling.

### Files touched in this slice

- [src/lib/EventCapture.tsx](../../src/lib/EventCapture.tsx)
- [src/lib/ChartCanvas.tsx](../../src/lib/ChartCanvas.tsx)
- [src/demo/OriginalLikeDemo.tsx](../../src/demo/OriginalLikeDemo.tsx)
- [src/demo/demo.css](../../src/demo/demo.css)
- [module_tree_full.md](../../module_tree_full.md)

## 21. Zoom-sensitive axis labels

### Completed

- Added zoom-sensitive x-axis formatting so the time labels shift to finer granularity when the visible candle count is small.
- Enabled the upper price chart x-axis while zoomed in, making the axis itself visibly change instead of relying only on the candle density.
- Kept the visible-range badge capped to the real dataset size so the header stays truthful to the rendered candles.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: `python scripts/generate_module_tree.py`
- Browser smoke on a fresh tab while zoomed in
- Result: visible range badge and x-axis format both update with zoom; the page no longer relies on a static axis presentation.

### Files touched in this slice

- [src/demo/OriginalLikeDemo.tsx](../../src/demo/OriginalLikeDemo.tsx)
- [src/lib/ChartCanvas.tsx](../../src/lib/ChartCanvas.tsx)
- [module_tree_full.md](../../module_tree_full.md)

## 22. Empty-plot safety + synced view state

### Completed

- Hardened `getCurrentItem` and `getXValue` so empty plot windows do not crash hover, drag, or zoom anchors.
- Added Brush fallbacks for start/end x-values when the mouse is not over a data point, so selection can still complete safely.
- Synced the demo `xExtents` state to the current visible domain and reset it with the chart so rerenders do not snap the chart back to an old brush range.
- Regenerated `module_tree_full.md` after the source changes.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: `python scripts/generate_module_tree.py`
- Browser smoke on a fresh tab: wheel zoom, brush drag, reset button
- Result: no NaN after zoom, brush drag updates the visible range, and Reset View returns to `149/200` with `X: 50.0 → 199.0`.

### Files touched in this slice

- [src/lib/utils/ChartDataUtil.ts](../../src/lib/utils/ChartDataUtil.ts)
- [src/lib/utils/zoomBehavior.ts](../../src/lib/utils/zoomBehavior.ts)
- [src/lib/interactive/Brush.tsx](../../src/lib/interactive/Brush.tsx)
- [src/demo/OriginalLikeDemo.tsx](../../src/demo/OriginalLikeDemo.tsx)
- [module_tree_full.md](../../module_tree_full.md)

## 7. Slice 2 Evidence

### Completed

- Removed legacy context declarations from the remaining `src/lib` React 19 blockers.
- Replaced the `findDOMNode`-based resize path in `fitDimensions.js` with a wrapper-div measurement path.
- Regenerated `module_tree_full.md` after the source changes.
- Updated the migration board and slice audit to reflect the completed blocker sweep.

### Validation

- Command run: `get_errors` on the touched files
- Command run: `npm run type-check`
- Command run: `& "c:/Mujoco Projects/react-stockcharts-master/.venv/Scripts/python.exe" scripts/generate_module_tree.py`
- Command run: `rg -n "contextTypes|childContextTypes|findDOMNode" src/lib`
- Output: file-scoped checks passed; legacy API grep returned zero matches; module tree regenerated to 320 modules; repo type-check now stops in `src/lib/ChartCanvas.tsx` and `src/lib/GenericComponent.tsx`, which is the next slice

### Files touched in this slice

- [src/lib/BackgroundText.js](../../src/lib/BackgroundText.js)
- [src/lib/annotation/Label.js](../../src/lib/annotation/Label.js)
- [src/lib/coordinates/CrossHairCursor.js](../../src/lib/coordinates/CrossHairCursor.js)
- [src/lib/coordinates/Cursor.js](../../src/lib/coordinates/Cursor.js)
- [src/lib/tooltip/HoverTooltip.js](../../src/lib/tooltip/HoverTooltip.js)
- [src/lib/ZoomButtons.js](../../src/lib/ZoomButtons.js)
- [src/lib/axes/XAxis.js](../../src/lib/axes/XAxis.js)
- [src/lib/axes/YAxis.js](../../src/lib/axes/YAxis.js)
- [src/lib/interactive/InteractiveText.js](../../src/lib/interactive/InteractiveText.js)
- [src/lib/interactive/InteractiveYCoordinate.js](../../src/lib/interactive/InteractiveYCoordinate.js)
- [src/lib/helper/fitDimensions.js](../../src/lib/helper/fitDimensions.js)
- [docs/upgrade-standard/TASKBOARD.md](../../docs/upgrade-standard/TASKBOARD.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [docs/upgrade-standard/IMPLEMENTATION_PLAN.md](../../docs/upgrade-standard/IMPLEMENTATION_PLAN.md)
- [module_tree_full.md](../../module_tree_full.md)

## 14. Slice 10 Evidence

### Completed

- Moved the wheel handler in `EventCapture` onto a native `wheel` listener with `passive: false` so chart zoom can still call `preventDefault` without console noise.
- Verified the live Binance path still loads candles, the brush span still changes the visible range, and wheel zoom changes the hovered data point on the fresh HTTP bundle.
- Regenerated the module inventory after the runtime touch so the repository tree stays in sync with the source snapshot.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Browser smoke test on `http://127.0.0.1:4173/index.html`
- Browser smoke on the `Binance trực tiếp` control
- Browser wheel zoom smoke on the chart surface
- Result: live candles, zoom, and brush interaction remain functional and the passive listener warning no longer appears on the fresh build.

### Files touched in this slice

- [src/lib/EventCapture.js](../../src/lib/EventCapture.js)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [docs/upgrade-standard/TASKBOARD.md](../../docs/upgrade-standard/TASKBOARD.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [module_tree_full.md](../../module_tree_full.md)

## 15. Slice 11 Evidence

### Completed

- Reduced the chart surface height so the brush overview remains inside the visible viewport on smaller layouts.
- Verified the brush span and zoom interactions on the HTTP-served demo after the layout change.
- Regenerated `module_tree_full.md` so the repository inventory reflects the updated runtime snapshot.

### Validation

- Command run: `npm run build:docs`
- Browser measurement of `.chart-surface` after scrolling to the chart
- Browser live-source zoom smoke
- Browser live-source brush span smoke
- Result: the brush panel is visible without extra scrolling on the demo viewport, and zoom / span remain functional on the fresh bundle.

### Files touched in this slice

- [src/demo/FullDemo.tsx](../../src/demo/FullDemo.tsx)
- [src/demo/demo.css](../../src/demo/demo.css)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [docs/upgrade-standard/TASKBOARD.md](../../docs/upgrade-standard/TASKBOARD.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [module_tree_full.md](../../module_tree_full.md)

## 16. Slice 12 Evidence

### Completed

- Fixed brush finalize behavior so span selection now commits on native mouseup/touchend instead of depending on click timing.
- Verified the brush selection in the actual overview panel changes the visible time window and clears the overlay after release.
- Regenerated `module_tree_full.md` after the runtime touch so the source inventory stays current.

### Validation

- Command run: `npm run build:docs`
- Browser drag smoke on the brush panel at the correct chart origin
- Before/after hover comparison on the same point
- Mid-drag screenshot check
- Result: dragging inside the overview panel now changes the visible range and no lingering selection rectangle remains after mouseup.

### Files touched in this slice

- [src/lib/interactive/Brush.js](../../src/lib/interactive/Brush.js)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [module_tree_full.md](../../module_tree_full.md)

## 17. Slice 13 Evidence

### Completed

- Removed legacy D3 event usage by replacing the stale `d3Event` path in `EventCapture` with direct event forwarding.
- Replaced legacy React lifecycles (`componentWillMount`, `componentWillReceiveProps`) with React 19-safe patterns.
- Purged `d3-collection` usage from scale and series layers via native `Map`/`Set` reducers and deterministic key sorting.
- Removed leftover commented legacy import references and regenerated `module_tree_full.md`.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: `rg -n "from \"d3-collection\"|from 'd3-collection'|d3Event|componentWillMount|componentWillReceiveProps" src/**`
- Command run: `& "c:/Mujoco Projects/react-stockcharts-master/.venv/Scripts/python.exe" scripts/generate_module_tree.py`
- Result: type-check/build pass; grep returns zero active legacy matches in `src`; inventory file updated.

### Files touched in this slice

- [src/lib/EventCapture.js](../../src/lib/EventCapture.js)
- [src/lib/interactive/components/InteractiveText.js](../../src/lib/interactive/components/InteractiveText.js)
- [src/lib/scale/financeDiscontinuousScale.js](../../src/lib/scale/financeDiscontinuousScale.js)
- [src/lib/scale/discontinuousTimeScaleProvider.js](../../src/lib/scale/discontinuousTimeScaleProvider.js)
- [src/lib/series/OHLCSeries.js](../../src/lib/series/OHLCSeries.js)
- [src/lib/series/ScatterSeries.js](../../src/lib/series/ScatterSeries.js)
- [src/lib/series/StackedBarSeries.js](../../src/lib/series/StackedBarSeries.js)
- [src/lib/series/VolumeProfileSeries.js](../../src/lib/series/VolumeProfileSeries.js)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [module_tree_full.md](../../module_tree_full.md)

## 18. Slice 14 Evidence

### Completed

- Normalized backlog records with explicit status and evidence columns for every item B-001..B-022.
- Updated taskboard done-lane with final closure tasks and kept execution lanes empty.
- Added final delivery closeout report and linked it from the handoff manifest.
- Kept closure reporting explicit by documenting mixed JS/TS composition as accepted state for this handoff cycle.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: legacy blocker scan in `src/**`
- Result: build/type-check pass, no active legacy blocker match, backlog register reports `Open items: 0`.

### Files touched in this slice

- [docs/upgrade-standard/BACKLOG.md](../../docs/upgrade-standard/BACKLOG.md)
- [docs/upgrade-standard/TASKBOARD.md](../../docs/upgrade-standard/TASKBOARD.md)
- [docs/upgrade-standard/DELIVERY_CLOSEOUT.md](../../docs/upgrade-standard/DELIVERY_CLOSEOUT.md)
- [docs/upgrade-standard/HANDOFF_MANIFEST.md](../../docs/upgrade-standard/HANDOFF_MANIFEST.md)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [module_tree_full.md](../../module_tree_full.md)

## 19. Slice 15 Evidence

### Completed

- Fixed candlestick rendering in demo where candle bodies collapsed into near-vertical lines.
- Root cause addressed by switching demo candlestick width logic to interval-step pixel width instead of domain-span width.
- Kept dist deletions out of commit scope; only runtime/source files and module tree inventory are included.

### Validation

- Command run: `npx tsc --noEmit`
- Command run: `npm run build:docs`
- Browser check at `http://localhost:8080/` after reload confirms candle body thickness is visible and no longer line-like.
- Result: type-check/build pass and visual regression fixed for candlestick mode.

### Files touched in this slice

- [src/demo/LibraryShowcaseDemo.tsx](../../src/demo/LibraryShowcaseDemo.tsx)
- [src/demo/demo.css](../../src/demo/demo.css)
- [src/demo/usePaneLayout.ts](../../src/demo/usePaneLayout.ts)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [module_tree_full.md](../../module_tree_full.md)

## 20. Slice 16 Evidence

### Completed

- Fixed pane-resize behavior to avoid an initially locked splitter state by rebalancing default pane ratios and minimum heights.
- Hardened splitter pointer handling by using `currentTarget` pointer capture/release and resetting drag state on pointer leave.
- Fixed volume pane rendering regression by anchoring y-extents at zero and applying computed bar width for continuous-time data.
- Regenerated module inventory after source updates.

### Validation

- Command run: `npx tsc --noEmit`
- Command run: `npm run build:docs`
- Command run: `python scripts/generate_module_tree.py`
- Browser audit at `http://localhost:8080/`:
  - Volume bars render as proper bars (no compressed black line artifact).
  - Splitter drag now changes pane boundaries from reset defaults.
  - Chart type switch (`Candlestick` ↔ `OHLC Bar`) updates series label and chart rendering.

### Files touched in this slice

- [src/demo/usePaneLayout.ts](../../src/demo/usePaneLayout.ts)
- [src/demo/ChartPaneSplitter.tsx](../../src/demo/ChartPaneSplitter.tsx)
- [src/demo/LibraryShowcaseDemo.tsx](../../src/demo/LibraryShowcaseDemo.tsx)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [module_tree_full.md](../../module_tree_full.md)
