# Implementation Plan: Full TypeScript Migration (v3.0)

## 1. Mục tiêu

Chuyển **100% file `.js`** trong `src/` sang TypeScript với `strict: true`, sử dụng React 19 + D3 v3–v4 scoped packages. Sau chương trình này, `src/` không còn file `.js` nào.

## 2. Tiền đề đã hoàn thành

| Hạng mục | Slice | Trạng thái |
| :--- | :--- | :--- |
| React 19 context / findDOMNode sweep | S2 | ✅ Done |
| `ChartCanvas.tsx` + `GenericComponent.tsx` typed | S3 | ✅ Done |
| `StockChartContext.tsx` + `types.ts` | S1/S3 | ✅ Done |
| `strict: true` trong tsconfig | S1 | ✅ Done |
| Legacy D3/lifecycle purge | S13 | ✅ Done |
| Runtime zoom/pan/layout bugs fixed | S15 | ✅ Done |
| Demo (FullDemo + LiveDemo) hoạt động | S7/S9 | ✅ Done |

## 3. Nguyên tắc bắt buộc

1. **Không đổi public API** mà không có lý do.
2. **Không refactor logic** khi migrate — chỉ thêm types.
3. **Giữ nguyên `propTypes`** khi chạm file — thêm comment `// React 19 — runtime validation`.
4. **Demo không vỡ** sau mỗi slice — `npm run build:docs` luôn phải pass.
5. **`npm run type-check` pass** trước khi đóng mỗi gate.
6. **Dùng `any` có chú thích** — `// TODO(ts-migration): narrow type` — không dùng `@ts-ignore`.
7. **Index file migrate sau cùng** trong mỗi thư mục.

### 3.1 Mẫu slice chuẩn

Mọi slice mới hoặc slice được chỉnh sửa phải điền theo đúng thứ tự trường dưới đây. Nếu một trường không áp dụng, ghi rõ `N/A` thay vì bỏ trống.

| Trường | Cần điền | Ý nghĩa |
| :--- | :--- | :--- |
| Slice ID | Bắt buộc | Mã slice duy nhất, ví dụ `S17` |
| Mục tiêu | Bắt buộc | Kết quả đầu ra đo được của slice |
| Phạm vi | Bắt buộc | Directory, file, hoặc subsystem bị chạm |
| Không làm | Bắt buộc | Các thay đổi bị loại trừ rõ ràng |
| Phụ thuộc | Bắt buộc | Slice, gate, hoặc điều kiện phải xong trước |
| Thay đổi chính | Bắt buộc | Behavior hoặc migration effect cần đạt |
| Gate | Bắt buộc | Command / smoke / pass criteria |
| Evidence | Bắt buộc | File list, validation output, module tree, ledger link |
| Rủi ro | Bắt buộc | Residual risk cần theo dõi |
| Trạng thái | Bắt buộc | `TODO`, `READY`, hoặc `DONE` |

### 3.2 Quy ước điền

- Một slice chỉ nên có một mục tiêu chính.
- Gate phải đủ hẹp để falsify được giả thuyết local của slice.
- Khi slice chạm source code, evidence phải nhắc tới `AUDIT_LEDGER.md` và `module_tree_full.md`.
- Không trộn validation của slice này với slice khác trong cùng một entry.
- Nếu scope mở rộng, ghi rõ phần mới và phần giữ nguyên để audit không phải suy luận.

## 4. Slice map — Chương trình v3.0

| Slice | Giai đoạn | Mục tiêu | Phạm vi chính | Gate |
| :--- | :--- | :--- | :--- | :--- |
| S16 | 1 | Migrate utils | `utils/` (14) | — |
| S17 | 1 | Migrate scale + helper + calculator + index | `scale/`(5) + `helper/`(5) + `calculator/`(20) + `src/index.js` | **Gate G1**: type-check pass; build:docs pass |
| S18 | 2 | Migrate series (còn lại) + axes | `series/`(~24) + `axes/`(7) | — |
| S19 | 2 | Migrate coordinates + tooltip + annotation | `coordinates/`(11) + `tooltip/`(13) + `annotation/`(6) | **Gate G2**: demo full render; type-check pass |
| S20 | 2 | Gate G2 | Validation | — |
| S21 | 3 | Migrate indicator + interactive | `indicator/`(21) + `interactive/`(22) | — |
| S22 | 3 | Migrate root files + Gate G3 | `EventCapture`, `CanvasContainer`, `BackgroundText`, `ZoomButtons` + final audit | **Gate G3**: 0 file `.js` trong `src/`; type-check zero error; demo full smoke |

## 5. Định nghĩa chi tiết từng slice

### S16 — Migrate `utils/`

**Mục đích**: Migrate 14 utility files — pure functions, không JSX, không React deps.

**Files**:
```
utils/identity.js       → .ts
utils/noop.js           → .ts
utils/shallowEqual.js   → .ts
utils/rebind.js         → .ts
utils/merge.js          → .ts
utils/accumulatingWindow.js → .ts
utils/slidingWindow.js  → .ts
utils/mappedSlidingWindow.js → .ts
utils/zipper.js         → .ts
utils/barWidth.js       → .ts
utils/strokeDasharray.js → .ts
utils/zoomBehavior.js   → .ts
utils/ChartDataUtil.js  → .ts
utils/PureComponent.js  → .ts
utils/index.js          → .ts
```

**Không làm**: Không đổi signature hàm, không merge hàm.

**Evidence**: tên file mới, `npm run type-check` không còn lỗi trong `utils/`.

---

### S17 — Migrate `scale/` + `helper/` + `calculator/` + root index

**Mục đích**: Hoàn thiện Giai đoạn 1 — scale engine, responsive helpers, indicator math.

**Files scale/**:
```
scale/levels.js                         → .ts
scale/evaluator.js                      → .ts
scale/financeDiscontinuousScale.js      → .ts
scale/discontinuousTimeScaleProvider.js → .ts
scale/index.js                          → .ts
```

**Files helper/**:
```
helper/fitWidth.js         → .ts
helper/fitDimensions.js    → .tsx  (React HOC)
helper/TypeChooser.js      → .tsx
helper/SaveChartAsImage.js → .ts
helper/index.js            → .ts
```

**Files calculator/** (20 files):
```
atr, bollingerband, change, compare, defaultOptionsForComputation,
elderRay, ema, forceIndex, heikinAshi, kagi, macd, pointAndFigure,
renko, rsi, sar, sma, smoothedForceIndex, sto, tma, wma
→ tất cả .ts (không có JSX)
calculator/index.js → .ts
```

**Root**:
```
src/index.js → src/index.ts
```

**Gate G1** (sau S17):
- `npm run type-check` pass hoàn toàn cho `utils/`, `scale/`, `helper/`, `calculator/`.
- `npm run build:docs` pass.
- `module_tree_full.md` regenerated.

---

### S18 — Migrate `series/` (còn lại) + `axes/`

**Mục đích**: Hoàn thiện visual primitives layer.

**Files series/** còn lại (~24 files, đã có 3 TS):
```
AlternatingFillAreaSeries, AreaOnlySeries, AreaSeries,
BollingerSeries, CircleMarker, ElderRaySeries, GroupedBarSeries,
KagiSeries, MACDSeries, OHLCSeries, OverlayBarSeries,
PointAndFigureSeries, RenkoSeries, RSISeries, SARSeries,
ScatterSeries, SquareMarker, StackedBarSeries, StochasticSeries,
StraightLine, SVGComponent, TriangleMarker, VolumeProfileSeries
→ tất cả .tsx
series/index.js → .ts (re-exports)
```

**Files axes/**:
```
Axis, AxisLine, AxisTicks, AxisZoomCapture, XAxis, YAxis → .tsx
axes/index.js → .ts
```

**Evidence**: Demo render price/volume/BB/EMA layer đầy đủ.

---

### S19 — Migrate `coordinates/` + `tooltip/` + `annotation/`

**Files coordinates/**:
```
CrossHairCursor, CurrentCoordinate, Cursor, EdgeCoordinate,
EdgeCoordinateV2, EdgeCoordinateV3, EdgeIndicator,
MouseCoordinateX, MouseCoordinateXV2, MouseCoordinateY, PriceCoordinate
→ .tsx
coordinates/index.js → .ts
```

**Files tooltip/**:
```
BollingerBandTooltip, displayValuesFor, GroupTooltip, HoverTooltip,
MACDTooltip, MovingAverageTooltip, OHLCTooltip, RSITooltip,
SingleValueTooltip, StochasticTooltip, ToolTipText, ToolTipTSpanLabel
→ .tsx
tooltip/index.js → .ts
```

**Files annotation/**:
```
Annotate, BarAnnotation, Label, LabelAnnotation, SvgPathAnnotation
→ .tsx
annotation/index.js → .ts
```

---

### S20 — Gate G2

**Kiểm tra**:
1. `npm run type-check` — zero error trong Giai đoạn 2 scope.
2. `npm run build:docs` — pass.
3. Browser smoke: candlestick + BB + RSI + MACD + axis + tooltip + cursor đều render.
4. `module_tree_full.md` regenerated.

---

### S21 — Migrate `indicator/` + `interactive/`

**Files indicator/** (21 files):
```
atr, baseIndicator, bollingerBand, change, compare,
defaultOptionsForAppearance, elderImpulse, elderRay, ema,
forceIndex, heikinAshi, kagi, macd, pointAndFigure, renko,
rsi, sar, sma, stochasticOscillator, tma, wma
→ .ts/.tsx
indicator/index.js → .ts
```

**Files interactive/** (22 files):
```
Brush, ClickCallback, DrawingObjectSelector, EquidistantChannel,
FibonacciRetracement, GannFan, InteractiveText, InteractiveYCoordinate,
StandardDeviationChannel, TrendLine, utils
→ .tsx/.ts
components/: ChannelWithArea, ClickableCircle, ClickableShape, GannFan,
HoverTextNearMouse, InteractiveText, InteractiveYCoordinate,
LinearRegressionChannelWithArea, MouseLocationIndicator, StraightLine, Text
→ .tsx
wrapper/: EachEquidistantChannel, EachFibRetracement, EachGannFan,
EachInteractiveYCoordinate, EachLinearRegressionChannel, EachText, EachTrendLine
→ .tsx
interactive/index.js → .ts
```

---

### S22 — Migrate root files + Gate G3 + Final audit

**Files**:
```
src/lib/EventCapture.js     → .tsx
src/lib/CanvasContainer.js  → .tsx
src/lib/BackgroundText.js   → .tsx
src/lib/ZoomButtons.js      → .tsx
src/lib/algorithm/index.js  → .ts
```

**Gate G3**:
1. `npm run type-check` — zero error toàn bộ `src/`.
2. `npm run build:docs` — pass.
3. Kiểm tra: `Get-ChildItem src -Recurse -Include "*.js"` → 0 kết quả.
4. Browser smoke đầy đủ: zoom, pan, brush, indicators, tooltip, axes.
5. AUDIT_LEDGER.md cập nhật S16–S22.
6. `module_tree_full.md` regenerated.
7. DELIVERY_CLOSEOUT.md v3.0 cập nhật.

## 6. Checklist audit mỗi slice

- [ ] Danh sách file đã rename (tên cũ → tên mới)
- [ ] Mô tả behavior mới hoặc behavior đã sửa
- [ ] Output `npm run type-check` (pass / số lỗi còn lại)
- [ ] Output `npm run build:docs` (pass / warnings)
- [ ] File `module_tree_full.md` được regenerate
- [ ] AUDIT_LEDGER cập nhật entry mới
- [ ] Rủi ro còn lại được ghi rõ
- [ ] Kết luận PASS / FAIL có thể đọc nhanh

## 2. Nguyên tắc bắt buộc

- Không đổi public API một cách không cần thiết.
- Không mở rộng phạm vi ngoài `src/lib` và `src/demo` nếu không có lý do đóng gói.
- Không xoá `propTypes` tùy tiện; khi chạm file có `propTypes`, giữ lại và thêm ghi chú React 19 nếu file đó được sửa.
- Không dùng `contextTypes`, `childContextTypes`, `findDOMNode`, string refs, hoặc pattern legacy context mới nào.
- Demo phải có đường chạy offline-safe: nếu mạng lỗi, vẫn hiển thị dữ liệu mẫu/local fallback để QA không bị chặn.

## 3. Luồng triển khai bắt buộc

1. Chốt baseline và inventory.
2. Chuẩn hoá tooling và type declarations.
3. Dọn React 19 blockers ở core path.
4. Migrate lõi render/tính toán theo cụm phụ thuộc.
5. Migrate series, axes, coordinates, tooltip, interactive.
6. Khôi phục demo đầy đủ.
7. Chạy audit cuối và đóng gói bàn giao.

## 4. Slice map

| Slice | Mục tiêu | Phạm vi chính | Phụ thuộc | Exit gate | Minh chứng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| S0 | Baseline & inventory | Capturing current state, module tree, blocker list | None | Có snapshot baseline + inventory hiện tại | Log type-check ban đầu, module tree doc |
| S1 | Tooling & typing baseline | `package.json`, `tsconfig`, declaration files, shared domain types | S0 | Type system nhận đủ module và JSX | `npm run type-check` giảm lỗi thiếu typings |
| S2 | React 19 blockers | `contextTypes`, `childContextTypes`, `findDOMNode`, ref cleanup | S1 | Không còn legacy React API ở `src/lib` | Grep sạch + smoke render |
| S3 | Core chart engine | `ChartCanvas`, `GenericComponent`, `GenericChartComponent`, context providers | S2 | Canvas/SVG path render được dưới React 19 | Demo core chart load được |
| S4 | Utilities / scale / helper | `utils`, `scale`, `helper`, responsive wrappers | S1 | Utility layer compile sạch và ổn định | Unit smoke or type-check on touched slice |
| S5 | Series / axes / coordinates / tooltip | Toàn bộ primitives hiển thị chart | S3, S4 | Demo render đủ primitives cơ bản | Demo chart + screenshot/smoke run |
| S6 | Interactive layer | `Brush`, `TrendLine`, `FibonacciRetracement`, drawing wrappers | S3, S5 | Tương tác cơ bản không regress | Manual interaction checklist |
| S7 | Demo restoration | `FullDemo`, `LiveDemo`, entry HTML, fallback data | S5 | Demo chạy độc lập và không phụ thuộc vào hỏi lại | Browser smoke + fallback proof |
| S8 | Final validation & handoff | Audit, ledger, docs, final build | S0-S7 | `type-check`, `build:docs`, smoke test pass | Audit ledger hoàn chỉnh |

## 5. Định nghĩa từng slice

### S0 - Baseline & inventory

**Mục đích**: biết chính xác hiện trạng trước khi sửa bất kỳ file source nào.

**Đầu vào**:
- `package.json`
- `tsconfig.json`
- `config/webpack.config.js`
- `src/lib/` và `src/demo/`

**Đầu ra**:
- Bản liệt kê module/tree hiện tại.
- Danh sách blocker React 19 và TypeScript.
- Log type-check baseline để so sánh về sau.

**Không làm ở slice này**:
- Không refactor logic.
- Không đổi public API.

### S1 - Tooling & typing baseline

**Mục đích**: làm cho TypeScript hiểu đúng React, JSX, PropTypes, và các module d3.

**Đầu ra mong muốn**:
- Thiếu typings được xử lý.
- Domain types dùng chung cho OHLCV/chart config được đặt ở vị trí thống nhất.
- Compiler/config không chặn các file TS/TSX mới.

**Gợi ý file**:
- `package.json`
- `tsconfig.json`
- `src/lib/*.d.ts` hoặc `src/types/*`

### S2 - React 19 blockers

**Mục đích**: xóa các pattern trực tiếp không tương thích React 19.

**Trọng tâm**:
- `contextTypes` / `childContextTypes`
- `findDOMNode`
- string refs hoặc ref patterns cũ
- behavior của `propTypes` khi file được chạm tới

**Gợi ý file**:
- `src/lib/axes/XAxis.js`
- `src/lib/axes/YAxis.js`
- `src/lib/coordinates/Cursor.js`
- `src/lib/tooltip/HoverTooltip.js`
- `src/lib/helper/fitDimensions.js`
- `src/lib/BackgroundText.js`
- `src/lib/annotation/Label.js`
- `src/lib/coordinates/CrossHairCursor.js`
- `src/lib/ZoomButtons.js`
- `src/lib/interactive/InteractiveText.js`
- `src/lib/interactive/InteractiveYCoordinate.js`

### S3 - Core chart engine

**Mục đích**: bảo đảm xương sống charting vẫn hoạt động khi đã chuyển sang provider/context typed.

**Gợi ý file**:
- `src/lib/ChartCanvas.tsx`
- `src/lib/GenericComponent.tsx`
- `src/lib/GenericChartComponent.tsx`
- `src/lib/ChartContext.tsx`
- `src/lib/StockChartContext.tsx`

### S4 - Utilities / scale / helper

**Mục đích**: chuyển logic thuần, không JSX, sang TypeScript trước để giảm rủi ro runtime.

**Gợi ý file**:
- `src/lib/utils/*`
- `src/lib/scale/*`
- `src/lib/helper/*`

### S5 - Series / axes / coordinates / tooltip

**Mục đích**: chuyển toàn bộ primitives hiển thị và các lớp hiển thị phụ trợ.

**Gợi ý file**:
- `src/lib/series/*`
- `src/lib/axes/*`
- `src/lib/coordinates/*`
- `src/lib/tooltip/*`

### S6 - Interactive layer

**Mục đích**: bảo đảm công cụ tương tác/drawing vẫn hoạt động với context mới và typing mới.

**Gợi ý file**:
- `src/lib/interactive/*`
- `src/lib/annotation/*`
- `src/lib/BackgroundText.js`

### S7 - Demo restoration

**Mục đích**: khôi phục demo đầy đủ, không còn phụ thuộc vào câu trả lời thủ công hay nhắc lại phạm vi.

**Yêu cầu demo**:
- Có live data path.
- Có local fallback/offline path.
- Có loading/error/empty state.
- Có responsive sizing an toàn trong browser.

**Gợi ý file**:
- `src/demo/index.tsx`
- `src/demo/FullDemo.tsx`
- `src/demo/LiveDemo.tsx`
- `src/demo/index.html`

### S8 - Final validation & handoff

**Mục đích**: chốt chất lượng và bàn giao.

**Gate cuối**:
- `npm run type-check`
- `npm run build:docs`
- Smoke test demo trên browser
- `AUDIT_LEDGER.md` đã cập nhật đầy đủ

## 6. Quy tắc chuyển slice

- Không mở slice tiếp theo nếu slice hiện tại chưa có evidence trong `SLICE_AUDIT.md`.
- Không gộp slice core engine với slice demo nếu chưa có smoke test riêng.
- Không coi `lint` hoặc `build` pass là đủ nếu `type-check` vẫn còn lỗi ở file đã chạm.
