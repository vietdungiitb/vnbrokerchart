# Taskboard — VNStockChart Upgrade CE14→CE21

> **Cập nhật lần cuối:** 2026-05-07  
> **Package:** [HANDOFF_MANIFEST.md](HANDOFF_MANIFEST.md)

---

## Quy ước trạng thái

- `READY` — sẵn sàng bắt đầu ngay, không blocked.
- `TODO` — trong plan nhưng chờ prerequisite.
- `IN_PROGRESS` — đang code.
- `DONE` — đã đóng với evidence.
- `BLOCKED` — bị chặn, cần ghi rõ lý do.

---

## Sprint CE14 — Stability & Bug Fixes

| ID | Status | Công việc | File đích | DoD |
|---|---|---|---|---|
| CE14-01 | READY | Tăng cường left-scroll pagination trigger (debounce + inflight guard) | `LibraryShowcaseDemo.tsx` | Kéo trái đến biên → spinner → load nến mới |
| CE14-02 | TODO | Regression test CE14 | `tests/` | Tests pass |
| CE14-03 | TODO | Audit CE14 | `AUDIT_LEDGER.md`, `module_tree_full.md` | Ledger entry đầy đủ |

> `removeChild` crash đã kiểm tra — không tồn tại trong project này (`fitDimensions/fitWidth` đã có guard đầy đủ).

**Definition of Done CE14:** Left-scroll load hoạt động. Type-check + test + build PASS.

---

## Sprint CE15 — Indicator Pack 1

| ID | Status | Công việc | File đích | DoD |
|---|---|---|---|---|
| CE15-01 | TODO | MA (multi-period) | `builtin/ma.ts`, `SeriesRegistry.ts`, `enrichData.ts`, `i18n.tsx` | MA(5/10/20/60) hiển thị đúng |
| CE15-02 | TODO | BBI | `builtin/bbi.ts`, `SeriesRegistry.ts`, `enrichData.ts`, `i18n.tsx` | BBI overlay đúng |
| CE15-03 | TODO | SAR | `builtin/sar.ts`, `SeriesRegistry.ts`, `enrichData.ts`, `i18n.tsx` | SAR dots đảo chiều đúng |
| CE15-04 | TODO | OBV | `builtin/obv.ts`, `SeriesRegistry.ts`, `enrichData.ts`, `i18n.tsx` | OBV line đúng hướng |
| CE15-05 | TODO | WR | `builtin/wr.ts`, `SeriesRegistry.ts`, `enrichData.ts`, `i18n.tsx` | WR range -100→0 |
| CE15-06 | TODO | VR | `builtin/vr.ts`, `SeriesRegistry.ts`, `enrichData.ts`, `i18n.tsx` | VR line với params |
| CE15-07 | TODO | Update pane-descriptor.ts SeriesTypeId | `pane-descriptor.ts` | type-check pass |
| CE15-08 | TODO | Unit tests | `builtin/*.test.ts` | ≥1 compute test mỗi indicator |
| CE15-09 | TODO | Audit CE15 | ledger, module tree | Ledger entry đầy đủ |

**DoD CE15:** 6 indicators mới có thể thêm vào pane settings, hiển thị đúng giá trị. Không vi phạm SSOT. i18n labels đủ VI+EN.

---

## Sprint CE16 — Indicator Pack 2

| ID | Status | Công việc | File đích | DoD |
|---|---|---|---|---|
| CE16-01 | TODO | KDJ | `builtin/kdj.ts` | 3 lines K/D/J đúng |
| CE16-02 | TODO | CCI | `builtin/cci.ts` | CCI với bands ±100 |
| CE16-03 | TODO | DMI | `builtin/dmi.ts` | +DI/-DI/ADX đúng |
| CE16-04 | TODO | BIAS | `builtin/bias.ts` | BIAS vs MA |
| CE16-05 | TODO | BRAR | `builtin/brar.ts` | BR/AR 2 lines |
| CE16-06 | TODO | MTM | `builtin/mtm.ts` | MTM + signal |
| CE16-07 | TODO | EMV | `builtin/emv.ts` | Yêu cầu volume field |
| CE16-08 | TODO | AO | `builtin/ao.ts` | Histogram xanh/đỏ |
| CE16-09 | TODO | ROC | `builtin/roc.ts` | ROC% line |
| CE16-10 | TODO | TRIX | `builtin/trix.ts` | TRIX + signal |
| CE16-11 | TODO | DMA | `builtin/dma.ts` | DDD + AMA lines |
| CE16-12 | TODO | PVT | `builtin/pvt.ts` | Cumulative line |
| CE16-13 | TODO | PSY | `builtin/psy.ts` | PSY + signal |
| CE16-14 | TODO | CR | `builtin/cr.ts` | CR + MA bands |
| CE16-15 | TODO | Unit tests | test files | ≥1 test mỗi indicator |
| CE16-16 | TODO | Audit CE16 | ledger, module tree | Ledger entry đầy đủ |

**DoD CE16:** 14 indicators mới pass SSOT. Tổng: 21 indicators (7 cũ + 6 CE15 + 14 CE16 → mục tiêu ≥30 với overlap). Type-check + test + build PASS.

---

## Sprint CE17 — Candle Types Switcher

| ID | Status | Công việc | File đích | DoD |
|---|---|---|---|---|
| CE17-01 | TODO | `candleType` state + persist | `LibraryShowcaseDemo.tsx` | Reload giữ setting |
| CE17-02 | TODO | HeikinAshi transform | `demoData.ts` hoặc util | Transform đúng HA formula |
| CE17-03 | TODO | Dropdown UI (6 options) | `LibraryShowcaseDemo.tsx`, CSS | Dropdown hoạt động |
| CE17-04 | TODO | i18n keys candle types | `i18n.tsx` | VI+EN labels |
| CE17-05 | TODO | Map candleType → SeriesConfig | `LibraryShowcaseDemo.tsx` | Chart re-render đúng type |
| CE17-06 | TODO | Smoke test | Manual | Không crash qua 6 loại |
| CE17-07 | TODO | Audit CE17 | ledger, module tree | Entry đầy đủ |

**DoD CE17:** Dropdown có 6 options: Candlestick / Hollow Candle / OHLC Bar / Heikin-Ashi / Area / Line. Mỗi option render đúng. Setting persist qua reload.

---

## Sprint CE18 — Style Override API

| ID | Status | Công việc | File đích | DoD |
|---|---|---|---|---|
| CE18-01 | TODO | `overrideSeriesStyle()` API | `SeriesRegistry.ts` | Public API type-safe |
| CE18-02 | TODO | `overrideDrawingStyle()` API | `DrawingLayer.tsx` | Override apply ngay |
| CE18-03 | TODO | Color picker trong DrawingInspector | `DrawingInspector.tsx` | Color picker functional |
| CE18-04 | TODO | Persist style overrides | `LibraryShowcaseDemo.tsx` | Reload giữ màu |
| CE18-05 | TODO | Unit tests | test files | Happy path covered |
| CE18-06 | TODO | Audit CE18 | ledger, module tree | Entry đầy đủ |

**DoD CE18:** Có thể đổi màu indicator/drawing qua UI, persist qua reload. API type-safe.

---

## Sprint CE19 — Drawing Overlay API

| ID | Status | Công việc | File đích | DoD |
|---|---|---|---|---|
| CE19-01 | TODO | `registerDrawingTool()` public API | `src/lib/drawing/registry.ts` | External code có thể register custom tool |
| CE19-02 | TODO | groupId + bulk ops | `types.ts`, `DrawingLayer.tsx`, `useDrawingInteraction.ts` | Select/delete theo group |
| CE19-03 | TODO | Magnet sensitivity 3 levels | `snap.ts`, settings UI | weak/normal/strong persist |
| CE19-04 | TODO | Axis highlight khi chọn drawing | `DrawingLayer.tsx`, `priceLabel.tsx` | Y-axis highlight đúng giá |
| CE19-05 | TODO | Tests | test files | Unit tests pass |
| CE19-06 | TODO | Audit CE19 | ledger, module tree | Entry đầy đủ |

**DoD CE19:** `registerDrawingTool()` exportable từ `src/lib/drawing`. groupId bulk ops hoạt động. Magnet sensitivity UI có 3 mức.

---

## Sprint CE20 — Data Adapter Abstraction

| ID | Status | Công việc | File đích | DoD |
|---|---|---|---|---|
| CE20-01 | TODO | `DataAdapter` interface | `src/lib/adapters/DataAdapter.ts` | Interface đầy đủ, type-safe |
| CE20-02 | TODO | `BinanceAdapter` | `src/lib/adapters/BinanceAdapter.ts` | Wraps current logic, tests pass |
| CE20-03 | TODO | `LocalCacheAdapter` | `src/lib/adapters/LocalCacheAdapter.ts` | Offline CSV data hoạt động |
| CE20-04 | TODO | Demo dùng adapter | `LibraryShowcaseDemo.tsx` | Không còn direct Binance call |
| CE20-05 | TODO | VNStocksAdapter stub | `src/lib/adapters/VNStocksAdapter.ts` | Interface compliant stub |
| CE20-06 | TODO | Adapter selection UI | `PaneSettingsModal.tsx` | Dev mode: switch adapter |
| CE20-07 | TODO | Tests adapter | test files | Mock fetch tests pass |
| CE20-08 | TODO | Audit CE20 | ledger, module tree | Entry đầy đủ |

**DoD CE20:** Không còn Binance hard-code trong LibraryShowcaseDemo. BinanceAdapter + LocalCacheAdapter implement đúng interface. Demo vẫn hoạt động như cũ.

---

## Sprint CE21 — Mobile/Touch

| ID | Status | Công việc | File đích | DoD |
|---|---|---|---|---|
| CE21-01 | TODO | Pointer pan | `EventCapture.tsx` | Pan được trên mobile |
| CE21-02 | TODO | Pinch zoom | `EventCapture.tsx` | Zoom được 2 ngón |
| CE21-03 | TODO | Touch hit-test | `hitTest.ts` | Drawing chọn được trên mobile |
| CE21-04 | TODO | Responsive toolbar | `LibraryShowcaseDemo.tsx`, CSS | Toolbar không bị overflow trên 375px |
| CE21-05 | TODO | Long-press context menu | `contextMenu.tsx` | Long press 500ms mở menu |
| CE21-06 | TODO | Tests touch logic | test files | Unit test pointer sequences |
| CE21-07 | TODO | Audit CE21 | ledger, module tree | Entry đầy đủ |

**DoD CE21:** Demo dùng được trên mobile Chrome (375px). Pan, zoom, drawing selection bằng tay. Không dùng dependency mới.
