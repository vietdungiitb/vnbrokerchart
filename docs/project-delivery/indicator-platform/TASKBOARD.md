# Taskboard — Indicator Platform GĐ1

## Quy ước trạng thái

- `READY`: có thể code ngay theo tài liệu hiện có.
- `TODO`: đã được ghi trong plan nhưng chưa đến lượt bắt đầu.
- `DONE`: slice hoặc task đã đóng, có audit evidence.

---

## 1. IC-1 — Canonical Store Hardening

| ID | Trạng thái | Công việc | Đầu ra bắt buộc |
| --- | --- | --- | --- |
| IC1-01 | DONE | Tạo `IndicatorPlugin` interface và registry skeleton | Type/module helper cho canonical store hoàn tất |
| IC1-02 | DONE | Tách compute logic hiện có sang plugin files | `enrichData.ts` không còn compute monolith |
| IC1-03 | DONE | Giữ `enrichData` như orchestrator | Output shape không đổi |
| IC1-04 | DONE | Thêm parity tests cho dữ liệu mẫu | Test pass, output trước/sau khớp |
| IC1-05 | DONE | Ghi audit và refresh inventory | `AUDIT_LEDGER.md` + `module_tree_full.md` |

**Gate IC-1:** `npm run type-check` · `npm test` · `npm run build:docs` · `python scripts/generate_module_tree.py`

---

## 2. IC-2 — Indicator Catalog Metadata

| ID | Trạng thái | Công việc | Đầu ra bắt buộc |
| --- | --- | --- | --- |
| IC2-01 | DONE | Tạo `IndicatorCatalogEntry` và các type liên quan | Type file mới, field chuẩn hóa |
| IC2-02 | DONE | Nâng `SeriesRegistry` sang catalog metadata | Backward compatible với `IndicatorDefinition` |
| IC2-03 | DONE | Viết generic renderer cho `PaneSettingsModal.tsx` | Form render từ `inputSchema` |
| IC2-04 | DONE | Thêm i18n key cho catalog labels | `vi/en` đầy đủ |
| IC2-05 | DONE | Thêm catalog validation tests | Mọi entry có field bắt buộc |
| IC2-06 | DONE | Browser smoke + audit ledger | Smoke note, ledger entry, module tree nếu chạm source |

**Gate IC-2:** `npm run type-check` · `npm test` · `npm run build:docs` · browser smoke settings modal

---

## 3. IC-3 — Saved Indicator Sets

> **Phụ thuộc:** IC-1 ✅ · IC-2 ✅  
> **Gate tổng:** type-check · 6 unit tests mới · browser smoke apply/save/import/export  
> **Chi tiết kỹ thuật:** [IC3_IMPLEMENTATION_PLAN.md](./IC3_IMPLEMENTATION_PLAN.md)

| ID | Trạng thái | Công việc | Đầu ra bắt buộc |
| --- | --- | --- | --- |
| IC3-01 | DONE | Tạo `IndicatorSet` type + `IndicatorSetsStorage` | `src/lib/core/types/indicator-set.ts` mới, type-check PASS |
| IC3-02 | DONE | Hook `useIndicatorSets` — CRUD + localStorage | `src/lib/core/hooks/useIndicatorSets.ts` mới, 8 unit tests PASS |
| IC3-03 | DONE | 3 built-in templates tĩnh | `src/lib/core/sets/builtins.ts` + JSON templates, shape validate PASS |
| IC3-04 | DONE | Wire `applySet` vào `LibraryShowcaseDemo.tsx` + `useDynamicPanes` | Browser smoke: apply template → chart đúng |
| IC3-05 | DONE | Tab "Bộ chỉ báo" trong `PaneSettingsModal.tsx` | Browser smoke: list + save + apply UI hoạt động |
| IC3-06 | DONE | Import/export `.vnsc-set` file | Round-trip test: export → import → `deepEqual` PASS |
| IC3-07 | DONE | i18n keys IC-3 (13 keys × 2 ngôn ngữ) | `src/demo/i18n.tsx` updated, type-check PASS |
| IC3-08 | DONE | Audit ledger + module tree refresh | `AUDIT_LEDGER.md` entry, `module_tree_full.md` updated |

**Gate IC-3:** `npm run type-check` · `npm test` (114 tests PASS) · `npm run build:docs` · browser smoke đủ 6 kịch bản

---

## 4. IC-GAP — Technical Gap Remediation

> **Phụ thuộc:** IC-1 ✅ · IC-2 ✅ · IC-3 ✅  
> **Trạng thái:** APPROVED — sẵn sàng code  
> **Chi tiết kỹ thuật:** [IC_GAP_IMPLEMENTATION_PLAN.md](./IC_GAP_IMPLEMENTATION_PLAN.md)  
> **Taskboard chi tiết:** [IC_GAP_TASKBOARD.md](./IC_GAP_TASKBOARD.md)

| ID | Trạng thái | Công việc | Đầu ra bắt buộc |
|----|-----------|-----------|------------------|
| GAP1-01 | READY | Tạo `VisibleRange` + `ChartHandle` types | `src/lib/core/types/chart.ts` mới, export từ indexes |
| GAP1-02 | TODO | `onVisibleRangeChange` vào `ChartCanvas` | emit trong `componentDidUpdate`, guard index chưa đổi |
| GAP1-03 | TODO | Forward prop qua `DynamicChart` | `useCallback` stable, type-check PASS |
| GAP1-04 | TODO | 5 unit tests Gap 1 | `gap1-viewport-event.test.ts` PASS |
| GAP3-02 | TODO | 3 public methods vào `ChartCanvas` | `setXExtents`, `getFullData`, `getCurrentViewportBarCount` |
| GAP3-03 | TODO | `forwardRef + useImperativeHandle` trong `DynamicChart` | backward compat no-ref |
| GAP3-04 | TODO | 7 unit tests Gap 3 | `gap3-scroll-zoom-api.test.ts` PASS |
| GAP2-01 | TODO | `ChartRenderContext` + wire Provider | hook throw ngoài Provider |
| GAP2-02 | TODO | `OverlayCanvas` component | `pointerEvents: none`, HiDPI, exception guard |
| GAP2-03 | TODO | `WhaleBubbleOverlay` minh họa | bubble đúng tọa độ, radius tỷ lệ |
| GAP2-04 | TODO | 7 unit tests Gap 2 | `gap2-canvas-overlay.test.ts` PASS |
| GAP-FINAL | TODO | Audit, ledger, module tree, build | `npm test` ≥127 · ledger entry · `module_tree_full.md` updated |

**Gate IC-GAP:** `npm run type-check` exit 0 · `npm test` ≥127 PASS · `npm run build:docs` · browser smoke Gap 2 + Gap 3

---

## 5. Cách đọc bảng này

- Làm theo thứ tự từ trên xuống dưới.
- Không bắt đầu IC-2 cho đến khi IC-1 pass gate và có audit entry.
- Không bắt đầu IC-3 cho đến khi IC-2 pass gate và có audit entry.
- Không bắt đầu GAP2-01 cho đến khi GAP1-02 DONE.
- Gap 1 và Gap 3 có thể làm song song (cùng bắt đầu từ GAP1-01 / GAP3-01).
- Nếu task nào phát hiện scope mới ngoài plan, dừng lại và cập nhật tài liệu trước khi code tiếp.
