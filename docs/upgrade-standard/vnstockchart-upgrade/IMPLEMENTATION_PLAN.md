# Implementation Plan — VNStockChart Upgrade CE14→CE21

> **Phiên bản:** 1.0 · 2026-05-07  
> **Tham chiếu TECH_SPEC:** [TECH_SPEC.md](TECH_SPEC.md)  
> **Nguyên tắc:** Mỗi sprint là điều kiện tiên quyết của sprint sau (trừ CE18 song song CE17 và CE20 song song CE19).

---

## Nguyên tắc lập slice

1. Mỗi slice phải có đầu ra dùng được (feature hoặc bugfix có thể smoke-test ngay).
2. Mỗi slice kết thúc phải pass toàn bộ `npm run type-check`, `npm test`, `npm run build:docs`.
3. SSOT không được vi phạm: mọi indicator mới đi qua `enrichData.ts` + `SeriesRegistry`.
4. i18n không được bị bỏ qua: mọi text mới phải có key trong `i18n.tsx`.
5. Ledger + module tree phải cập nhật sau mỗi slice.

---

## Sprint CE14 — Stability & Bug Fixes

**Trạng thái:** READY  
**Prerequisite:** Không có  
**Ước lượng:** 2-3 ngày

| Slice ID | Công việc | File đích | Đầu ra bắt buộc |
|---|---|---|---|
| CE14-01 | Fix `removeChild` React crash — isolate legacy component gây lỗi, guard stale DOM refs | `src/lib/helper/fitDimensions.tsx`, `src/lib/helper/fitWidth.tsx`, `src/demo/ErrorBoundary.tsx` | Không còn crash khi mount/unmount chart |
| CE14-02 | Tăng cường left-scroll pagination trigger — hiện tại trigger chỉ chạy khi domain change; cần debounce + guard khi ở biên trái | `src/demo/LibraryShowcaseDemo.tsx` | Kéo trái đến biên load thêm nến (spinner hiện) |
| CE14-03 | Smoke test regression CE14 | `tests/` | Tests pass, không còn crash theo reproduce steps |
| CE14-04 | Final audit CE14 | `docs/upgrade-standard/AUDIT_LEDGER.md`, `module_tree_full.md` | Entry ledger đầy đủ |

---

## Sprint CE15 — Indicator Pack 1 (Price Overlays + Volume)

**Trạng thái:** READY sau CE14  
**Prerequisite:** CE14 DONE  
**Ước lượng:** 3-4 ngày

| Slice ID | Công việc | File đích | Đầu ra bắt buộc |
|---|---|---|---|
| CE15-01 | Indicator **MA** (Simple Moving Average multi-period, phân biệt với SMA 1-period) | `src/lib/indicators/builtin/ma.ts`, `SeriesRegistry.ts`, `enrichData.ts`, `i18n.tsx` | MA(5), MA(10), MA(20), MA(60) hoạt động trên candle pane |
| CE15-02 | Indicator **BBI** (Bull and Bear Index = avg của 3,6,12,24-period MA) | `src/lib/indicators/builtin/bbi.ts`, `enrichData.ts`, `SeriesRegistry.ts`, `i18n.tsx` | BBI hiển thị đúng trên candle pane |
| CE15-03 | Indicator **SAR** (Parabolic SAR) | `src/lib/indicators/builtin/sar.ts`, `enrichData.ts`, `SeriesRegistry.ts`, `i18n.tsx` | SAR dots hiển thị trên candle pane, đảo chiều đúng |
| CE15-04 | Indicator **OBV** (On Balance Volume) | `src/lib/indicators/builtin/obv.ts`, `enrichData.ts`, `SeriesRegistry.ts`, `i18n.tsx` | OBV line hiển thị đúng trong pane riêng |
| CE15-05 | Indicator **WR** (Williams %R) | `src/lib/indicators/builtin/wr.ts`, `enrichData.ts`, `SeriesRegistry.ts`, `i18n.tsx` | WR oscillator -100→0, hiển thị overbought/oversold bands |
| CE15-06 | Indicator **VR** (Volume Ratio) | `src/lib/indicators/builtin/vr.ts`, `enrichData.ts`, `SeriesRegistry.ts`, `i18n.tsx` | VR line với tham số period và signal period |
| CE15-07 | Đăng ký SeriesTypeId mới vào `pane-descriptor.ts` | `src/lib/core/types/pane-descriptor.ts` | Type-check pass với MA, BBI, SAR, OBV, WR, VR |
| CE15-08 | Unit tests CE15 indicators | `src/lib/indicators/builtin/*.test.ts` | Mỗi indicator có ≥1 test kiểm tra compute logic |
| CE15-09 | Final audit CE15 | ledger, module tree | Entry ledger đầy đủ |

---

## Sprint CE16 — Indicator Pack 2 (Advanced Oscillators)

**Trạng thái:** READY sau CE15  
**Prerequisite:** CE15 DONE  
**Ước lượng:** 5-6 ngày

| Slice ID | Công việc | File đích | Đầu ra bắt buộc |
|---|---|---|---|
| CE16-01 | Indicator **KDJ** (Stochastic: K, D, J lines) | builtin/kdj.ts, utils.ts | 3 lines K/D/J với params (9,3,3) |
| CE16-02 | Indicator **CCI** (Commodity Channel Index) | builtin/cci.ts | CCI line với period=20, band ±100 |
| CE16-03 | Indicator **DMI** (+DI, -DI, ADX) | builtin/dmi.ts | 3 lines, params (14,6) |
| CE16-04 | Indicator **BIAS** (Deviation Rate vs MA) | builtin/bias.ts | BIAS line với period |
| CE16-05 | Indicator **BRAR** (Bull-Bear Ratio: BR, AR) | builtin/brar.ts | 2 lines với period=26 |
| CE16-06 | Indicator **MTM** (Momentum) | builtin/mtm.ts | MTM + signal line |
| CE16-07 | Indicator **EMV** (Ease of Movement) | builtin/emv.ts | EMV line — yêu cầu `volume` field |
| CE16-08 | Indicator **AO** (Awesome Oscillator) | builtin/ao.ts | Histogram bar xanh/đỏ |
| CE16-09 | Indicator **ROC** (Rate of Change) | builtin/roc.ts | ROC line với period=12 |
| CE16-10 | Indicator **TRIX** (Triple Exponential MA) | builtin/trix.ts | TRIX + signal, params (12,9) |
| CE16-11 | Indicator **DMA** (Differential MA) | builtin/dma.ts | 2 lines DDD + AMA |
| CE16-12 | Indicator **PVT** (Price Volume Trend) | builtin/pvt.ts | Cumulative PVT line |
| CE16-13 | Indicator **PSY** (Psychological Line) | builtin/psy.ts | PSY + signal line |
| CE16-14 | Indicator **CR** (CR indicator + MACD of CR) | builtin/cr.ts | CR line với MA bands |
| CE16-15 | Unit tests CE16 | test files | Mỗi indicator ≥1 compute test |
| CE16-16 | Final audit CE16 | ledger, module tree | Entry ledger đầy đủ |

---

## Sprint CE17 — Candle Types Switcher

**Trạng thái:** READY sau CE15 (có thể song song với CE16)  
**Prerequisite:** CE15 DONE  
**Ước lượng:** 2-3 ngày

| Slice ID | Công việc | File đích | Đầu ra bắt buộc |
|---|---|---|---|
| CE17-01 | Thêm `candleType` state + persist localStorage | `src/demo/LibraryShowcaseDemo.tsx` | Reload giữ loại candle đã chọn |
| CE17-02 | HeikinAshi data transform function | `src/demo/demoData.ts` hoặc util mới | `transformHeikinAshi(bars)` trả về bars với HA values |
| CE17-03 | Candle type dropdown UI thay thế button "Candlestick" | `src/demo/LibraryShowcaseDemo.tsx`, CSS | Dropdown 6 options: Candlestick, Hollow, OHLC, Heikin-Ashi, Area, Line |
| CE17-04 | i18n keys cho 6 candle types | `src/demo/i18n.tsx` | VI+EN labels |
| CE17-05 | Map `candleType` → `SeriesConfig.type` trong chart data preparation | `src/demo/LibraryShowcaseDemo.tsx` | Đổi candle type → chart re-render đúng |
| CE17-06 | Smoke test: thay đổi qua tất cả 6 loại không crash | Manual smoke + optional test | No crash, render đúng |
| CE17-07 | Final audit CE17 | ledger, module tree | Entry ledger đầy đủ |

---

## Sprint CE18 — Style Override API

**Trạng thái:** READY sau CE15 (có thể song song với CE17)  
**Prerequisite:** CE15 DONE  
**Ước lượng:** 2-3 ngày

| Slice ID | Công việc | File đích | Đầu ra bắt buộc |
|---|---|---|---|
| CE18-01 | `SeriesStyleOverride` interface + `overrideSeriesStyle()` API | `src/lib/core/registry/SeriesRegistry.ts` | API public, type-safe |
| CE18-02 | `overrideDrawingStyle(id, partialStyle)` API | `src/lib/drawing/DrawingLayer.tsx` hoặc context | Override drawing color/width không cần re-select |
| CE18-03 | Color picker trong DrawingInspector dùng override API | `src/lib/drawing/DrawingInspector.tsx` | Đổi màu qua color picker → áp dụng ngay |
| CE18-04 | Persist style overrides vào localStorage | `src/demo/LibraryShowcaseDemo.tsx` hoặc hook | Reload giữ màu đã chỉnh |
| CE18-05 | Tests cho overrideSeriesStyle | test file | Unit test cover happy path |
| CE18-06 | Final audit CE18 | ledger, module tree | Entry ledger đầy đủ |

---

## Sprint CE19 — Drawing Overlay API

**Trạng thái:** READY sau CE13 (có thể song song với CE20)  
**Prerequisite:** CE13 DONE  
**Ước lượng:** 3-4 ngày

| Slice ID | Công việc | File đích | Đầu ra bắt buộc |
|---|---|---|---|
| CE19-01 | `registerDrawingTool(def)` public API trong `src/lib/drawing/registry.ts` | `registry.ts` (mở rộng) | Có thể register custom tool từ ngoài lib |
| CE19-02 | `groupId` field cho `DrawingObject` và bulk operations | `types.ts`, `DrawingLayer.tsx`, `useDrawingInteraction.ts` | Select theo groupId, xóa theo groupId |
| CE19-03 | Magnet sensitivity config: 3 mức weak/normal/strong | `snap.ts`, `shortcutMap.ts`, settings UI | Magnet sensitivity persist và ảnh hưởng đến snap tolerance |
| CE19-04 | X/Y axis figures tích hợp với overlay highlight | `DrawingLayer.tsx`, `priceLabel.tsx` | Drawing được chọn highlight giá trên Y-axis |
| CE19-05 | Tests cho registry API + groupId operations | test files | Unit tests pass |
| CE19-06 | Final audit CE19 | ledger, module tree | Entry ledger đầy đủ |

---

## Sprint CE20 — Data Adapter Abstraction

**Trạng thái:** READY sau CE14 (có thể song song với CE19)  
**Prerequisite:** CE14 DONE  
**Ước lượng:** 4-5 ngày

| Slice ID | Công việc | File đích | Đầu ra bắt buộc |
|---|---|---|---|
| CE20-01 | `DataAdapter` interface | `src/lib/adapters/DataAdapter.ts` (new) | Type-safe interface |
| CE20-02 | `BinanceAdapter` implements DataAdapter | `src/lib/adapters/BinanceAdapter.ts` (new) | Wraps fetchHistoricalDemoBars hiện tại |
| CE20-03 | `LocalCacheAdapter` cho offline mode | `src/lib/adapters/LocalCacheAdapter.ts` (new) | Dùng CSV data offline |
| CE20-04 | `LibraryShowcaseDemo` dùng adapter thay vì direct Binance call | `src/demo/LibraryShowcaseDemo.tsx` | Không còn direct `fetchHistoricalDemoBars` call |
| CE20-05 | VN stocks adapter stub (`VNStocksAdapter`) | `src/lib/adapters/VNStocksAdapter.ts` (new stub) | Interface compliant, no-op implementation |
| CE20-06 | Adapter selection UI trong Settings modal (prototype) | `src/demo/PaneSettingsModal.tsx` | Có thể switch adapter trong dev mode |
| CE20-07 | Tests cho BinanceAdapter + LocalCacheAdapter | test files | Unit tests mock fetch, verify callback |
| CE20-08 | Final audit CE20 | ledger, module tree | Entry ledger đầy đủ |

---

## Sprint CE21 — Mobile/Touch

**Trạng thái:** READY sau CE14  
**Prerequisite:** CE14 DONE  
**Ước lượng:** 5-7 ngày

| Slice ID | Công việc | File đích | Đầu ra bắt buộc |
|---|---|---|---|
| CE21-01 | Pointer events pan (1 pointer drag = chart pan) | `src/lib/EventCapture.tsx` | Chart pan được trên mobile bằng finger |
| CE21-02 | Pinch-to-zoom (2 pointer distance = zoom factor) | `src/lib/EventCapture.tsx` | Chart zoom được bằng 2 ngón tay |
| CE21-03 | Touch hit-test cho drawing tools (tapRadius lớn hơn mouseRadius) | `src/lib/drawing/hitTest.ts` | Drawing có thể chọn/di chuyển bằng ngón tay |
| CE21-04 | Responsive toolbar collapse ≤768px | `src/demo/LibraryShowcaseDemo.tsx`, CSS | Toolbar không che chart trên màn nhỏ |
| CE21-05 | Touch-friendly context menu (không dùng right-click) | `src/lib/drawing/contextMenu.tsx` | Long press ≥500ms mở context menu |
| CE21-06 | Tests cho touch pan/zoom event logic | test files | Unit test pointer event sequences |
| CE21-07 | Final audit CE21 | ledger, module tree | Entry ledger đầy đủ |

---

## Lộ trình tổng thể

```
CE14 ─── CE15 ─── CE16
    │         └─── CE17 (song song với CE16)
    │         └─── CE18 (song song với CE16+CE17)
    └─── CE20 (song song với CE19)
              └─── CE19 (sau CE13)
CE21 (sau CE14, có thể last)
```

Sau khi hoàn tất **CE14 + CE15 + CE16**: VNStockCharts đạt ngang bằng KLineCharts về indicator count.  
Sau **CE17**: Ngang bằng về candle types.  
Sau **CE20**: Vượt KLineCharts về data adapter flexibility (VN stocks support).  
Sau **CE19**: Vượt về drawing overlay extensibility.  
Sau **CE21**: Ngang bằng về mobile support.
