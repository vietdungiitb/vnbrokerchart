# Taskboard: Drawing Tools Engine

## 1. Board rules

- Chỉ kéo task sang In Progress khi task trước trong cùng phase đã Done.
- Mỗi task phải map về đúng bước trong IMPLEMENTATION_PLAN.md.
- **Gate M1 phải pass trước khi bắt đầu M2.**
- **Gate M2 phải pass trước khi bắt đầu M3.**
- File mới được tạo phải được ghi vào AUDIT_LEDGER.md của feature này (AUDIT_PROTOCOL.md phần evidence).
- Sau khi thêm file mới → chạy `python scripts/generate_module_tree.py`.

---

## 2. Milestone M1 — Core Drawing Engine

### Phase M1-P0: Coordinate foundation

| ID | Task | Owner role | Depends on | Acceptance criteria | DoD |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DT-01 | Tạo `coordinateUtils.ts` | Drawing core | — | `pixelToChartPoint` + `chartPointToPixel` roundtrip test pass | Unit test pass; no type errors |
| DT-02 | Tạo `renderSvg.ts` | Drawing render | DT-01 | `renderDrawingToSvg` trả ReactElement[] cho tất cả 8 tool types | `npm run type-check` PASS trên file |
| DT-03 | Tạo `useDrawingInteraction.ts` | Drawing core | — (chỉ dùng existing reducers) | Hook expose đủ state, undo/redo, deleteSelected, cancelDrawing | Unit test pass |
| DT-04 | Tạo `DrawingLayer.tsx` | Drawing UI | DT-01, DT-02, DT-03 | Component mount SVG overlay; pointer events → dispatch đúng action | Browser smoke: click → line appears |

### Phase M1-P1: New built-in tools

| ID | Task | Owner role | Depends on | Acceptance criteria | DoD |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DT-05 | Tạo `builtin/rectangle.ts` | Drawing core | — | `createDraft` + `updateDraft` test pass | Test pass; type-check clean |
| DT-06 | Tạo `builtin/arrow.ts` | Drawing core | — | `createDraft` + `updateDraft` test pass | Test pass; type-check clean |

### Phase M1-P2: Type extension

| ID | Task | Owner role | Depends on | Acceptance criteria | DoD |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DT-07 | Sửa `types.ts` — thêm rectangle, arrow, fibLevels, label | Drawing core | DT-05, DT-06 | `DrawingToolType` union đúng; type-check clean | PASS |

### Phase M1-P3: Export + registry

| ID | Task | Owner role | Depends on | Acceptance criteria | DoD |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DT-08 | Sửa `drawing/index.ts` — export + register mới | Drawing core | DT-04, DT-05, DT-06, DT-07 | `listDrawingTools()` trả 8 tools; export đầy đủ | type-check PASS; smoke pass |

### Phase M1-P4: Demo wiring

| ID | Task | Owner role | Depends on | Acceptance criteria | DoD |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DT-09 | Sửa `LibraryShowcaseDemo.tsx` — mount DrawingLayer + keyboard | Demo | DT-04, DT-08 | Click tool → vẽ được; Ctrl+Z/Y/ESC/Del hoạt động | Browser smoke pass |
| DT-10 | Sửa `i18n.tsx` — thêm "tool.rectangle", "tool.arrow" | Demo i18n | DT-09 | Cả vi + en có key | Không còn missing i18n key |
| DT-11 | Sửa `demo.css` — cursor modes, handles, selected state | Demo CSS | DT-09 | CSS classes đúng per tool mode | Visual check pass |

### Gate M1 checklist

- [ ] DT-01 Done
- [ ] DT-02 Done
- [ ] DT-03 Done
- [ ] DT-04 Done
- [ ] DT-05 Done
- [ ] DT-06 Done
- [ ] DT-07 Done
- [ ] DT-08 Done
- [ ] DT-09 Done
- [ ] DT-10 Done
- [ ] DT-11 Done
- [ ] `npm run type-check` → PASS
- [ ] `npm run test` → PASS
- [ ] `python scripts/generate_module_tree.py` → chạy OK
- [ ] Browser smoke M1 pass (xem AUDIT_PROTOCOL.md phần F01–F12)

---

## 3. Milestone M2 — Inspector + Persistence

| ID | Task | Owner role | Depends on | Acceptance criteria | DoD |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DT-12 | Tạo `DrawingStorage.ts` | Drawing data | Gate M1 | localStorage save/load/clear/export/import đúng schema | Unit test pass |
| DT-13 | Tạo `useDrawingStorage.ts` | Drawing data | DT-12 | Auto-save + load on mount hoạt động | Test pass; smoke: reload giữ drawings |
| DT-14 | Tạo `DrawingInspector.tsx` | Drawing UI | Gate M1 | Color/stroke/linestyle/lock controls render; onChange callback | Browser: đổi màu → drawing cập nhật |
| DT-15 | Sửa `types.ts` — thêm symbol, timeframe; sửa strokeDasharray type | Drawing core | DT-12 | Type-check clean | PASS |
| DT-16 | Sửa `drawing/index.ts` — export mới M2 | Drawing core | DT-12, DT-13, DT-14, DT-15 | Export đầy đủ | PASS |
| DT-17 | Sửa `LibraryShowcaseDemo.tsx` — wire storage, inspector, export/import | Demo | DT-13, DT-14, DT-16 | Reload = persist; inspector hiện khi selected | Browser smoke pass |
| DT-18 | Sửa `i18n.tsx` — thêm drawing.* keys | Demo i18n | DT-17 | Cả vi + en có key | PASS |
| DT-19 | Sửa `demo.css` — inspector panel, color swatch, slider | Demo CSS | DT-17 | Panel đẹp, không overlap chart | Visual check pass |

### Gate M2 checklist

- [ ] DT-12 Done
- [ ] DT-13 Done
- [ ] DT-14 Done
- [ ] DT-15 Done
- [ ] DT-16 Done
- [ ] DT-17 Done
- [ ] DT-18 Done
- [ ] DT-19 Done
- [ ] `npm run type-check` → PASS
- [ ] Browser smoke M2 pass (xem AUDIT_PROTOCOL.md phần F13–F20)

---

## 4. Milestone M3 — Advanced Tools + Alert Markers

| ID | Task | Owner role | Depends on | Acceptance criteria | DoD |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DT-20 | Sửa `types.ts` — thêm priceRange, positionBox, fibExtension; riskReward | Drawing core | Gate M2 | Type-check clean | PASS |
| DT-21 | Tạo `builtin/priceRange.ts` | Drawing core | DT-20 | draft, update, badge text đúng | Test: badge = "Δ X% · N bars" |
| DT-22 | Tạo `builtin/positionBox.ts` | Drawing core | DT-20 | 3 điểm → box fill + R/R | Test: R/R ratio đúng |
| DT-23 | Tạo `builtin/fibExtension.ts` | Drawing core | DT-20 | Extension levels đúng | Test: levels [1.272, 1.414, 1.618, 2.0, 2.618] |
| DT-24 | Sửa `renderSvg.ts` — thêm render cho 3 tools | Drawing render | DT-21, DT-22, DT-23 | Render đúng trên browser | Browser smoke pass |
| DT-25 | Sửa `DrawingLayer.tsx` — thêm Shift+click multi-select | Drawing UI | Gate M2 | Shift+click highlights 2+ drawings | Browser smoke pass |
| DT-26 | Sửa `drawing/index.ts` — export + register 3 tools mới | Drawing core | DT-21, DT-22, DT-23 | 11 tools registered | PASS |
| DT-27 | Sửa `LibraryShowcaseDemo.tsx` — thêm 3 tools + toolbar divider | Demo | DT-24, DT-25, DT-26 | Toolbar có divider Lines/Fib/Shapes/Analysis | Browser visual pass |
| DT-28 | Sửa `i18n.tsx` + `demo.css` — M3 additions | Demo | DT-27 | Keys đủ; CSS positionBox + priceRange | Visual check pass |

### Gate M3 checklist

- [ ] DT-20 Done
- [ ] DT-21 Done
- [ ] DT-22 Done
- [ ] DT-23 Done
- [ ] DT-24 Done
- [ ] DT-25 Done
- [ ] DT-26 Done
- [ ] DT-27 Done
- [ ] DT-28 Done
- [ ] `npm run type-check` → PASS
- [ ] Browser smoke M3 pass (xem AUDIT_PROTOCOL.md phần F21–F28)

---

## 5. Thứ tự thực hiện khuyến nghị

```
M1: DT-01 → DT-02 → DT-03 (song song với DT-01/02)
    → DT-05 + DT-06 (song song)
    → DT-04 → DT-07 → DT-08
    → DT-09 → DT-10 → DT-11
    → Gate M1 validation

M2: DT-12 → DT-13 → DT-14 → DT-15 → DT-16
    → DT-17 → DT-18 → DT-19
    → Gate M2 validation

M3: DT-20 → DT-21 + DT-22 + DT-23 (song song)
    → DT-24 + DT-25 (song song)
    → DT-26 → DT-27 → DT-28
    → Gate M3 validation
```
