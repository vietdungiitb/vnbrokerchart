# Taskboard: Drawing Tools Engine

## 1. Board rules

- Chỉ kéo task sang In Progress khi task trước trong cùng phase đã Done.
- Mỗi task phải map về đúng bước trong IMPLEMENTATION_PLAN.md.
- **Gate M1 phải pass trước khi bắt đầu M2.**
- **Gate M2 phải pass trước khi bắt đầu M3.**
- File mới được tạo phải được ghi vào AUDIT_LEDGER.md của feature này (AUDIT_PROTOCOL.md phần evidence).
- Sau khi thêm file mới → chạy `python scripts/generate_module_tree.py`.

---

## 2. Milestone M1 — ✅ DONE (2026-05-05, commit b1bf284)

### Phase M1-P0: Coordinate foundation

| ID | Task | Owner role | Trạng thái |
| :--- | :--- | :--- | :--- |
| DT-01 | Tạo `coordinateUtils.ts` | Drawing core | ✅ Done |
| DT-02 | Tạo `renderSvg.ts` | Drawing render | ✅ Done |
| DT-03 | Tạo `useDrawingInteraction.ts` | Drawing core | ✅ Done |
| DT-04 | Tạo `DrawingLayer.tsx` | Drawing UI | ✅ Done |

### Phase M1-P1: New built-in tools

| ID | Task | Owner role | Trạng thái |
| :--- | :--- | :--- | :--- |
| DT-05 | Tạo `builtin/rectangle.ts` | Drawing core | ✅ Done |
| DT-06 | Tạo `builtin/arrow.ts` | Drawing core | ✅ Done |

### Phase M1-P2: Type extension

| ID | Task | Owner role | Trạng thái |
| :--- | :--- | :--- | :--- |
| DT-07 | Sửa `types.ts` — thêm rectangle, arrow, fibLevels, label | Drawing core | ✅ Done |

### Phase M1-P3: Export + registry

| ID | Task | Owner role | Trạng thái |
| :--- | :--- | :--- | :--- |
| DT-08 | Sửa `drawing/index.ts` — export + register mới | Drawing core | ✅ Done |

### Phase M1-P4: Demo wiring

| ID | Task | Owner role | Trạng thái |
| :--- | :--- | :--- | :--- |
| DT-09 | Sửa `LibraryShowcaseDemo.tsx` — mount DrawingLayer + keyboard | Demo | ✅ Done |
| DT-10 | Sửa `i18n.tsx` — thêm "tool.rectangle", "tool.arrow" | Demo i18n | ✅ Done |
| DT-11 | Sửa `demo.css` — cursor modes, handles, selected state | Demo CSS | ✅ Done |

### Gate M1 checklist ✅ ALL PASSED (2026-05-05)

- [x] DT-01 → DT-11 all Done
- [x] `npm run type-check` → PASS (0 errors)
- [x] `npm run test` → PASS (67 tests)
- [x] `python scripts/generate_module_tree.py` → OK
- [x] Browser smoke M1: all 10 tools work, Ctrl+Z/Y/ESC/Del functional
- [x] Commit: `b1bf284` on branch `dev`

---

## 3. Milestone M2 — Inspector + Persistence

| ID | Task | Owner role | Depends on | Acceptance criteria | DoD |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DT-12 | Tạo `DrawingStorage.ts` | Drawing data | Gate M1 | localStorage save/load/clear/export/import đúng schema; validate on import | Unit test pass |
| DT-13 | Tạo `useDrawingStorage.ts` | Drawing data | DT-12 | Auto-save debounce 300ms + load on mount hoạt động | Smoke: reload giữ drawings |
| DT-14 | Tạo `DrawingInspector.tsx` | Drawing UI | Gate M1 | Color/stroke/linestyle/lock/clone/hide/z-order controls render | Smoke: đổi màu → drawing cập nhật |
| DT-15 | Tạo `DrawingListPanel.tsx` | Drawing UI | Gate M1 | List hiện tất cả drawings; click to select; eye icon toggle visible | Smoke: click item → selected |
| DT-16 | Sửa `types.ts` — symbol, timeframe, zIndex, clonedFrom, fillOpacity, dasharray union | Drawing core | DT-12 | Type-check clean | PASS |
| DT-17 | Sửa `drawing/index.ts` — export M2 symbols | Drawing core | DT-12→DT-16 | Export đầy đủ | PASS |
| DT-18 | Sửa `LibraryShowcaseDemo.tsx` — wire storage, inspector, list panel, export/import | Demo | DT-13, DT-14, DT-15, DT-17 | Reload = persist; inspector hiện khi selected; Export/Import buttons work | Smoke pass |
| DT-19 | Sửa `i18n.tsx` + `demo.css` — M2 additions | Demo | DT-18 | drawing.* keys đủ cả vi + en; inspector panel styled | Visual check pass |

### Gate M2 checklist

- [ ] DT-12 → DT-19 all Done
- [ ] `npm run type-check` → PASS
- [ ] `npm test` → PASS (DrawingStorage unit tests)
- [ ] Browser smoke: inspector, localStorage persist, export/import

---

## 4. Milestone M3 — Lines Nâng Cao + Position Tools

| ID | Task | Owner role | Depends on | Acceptance criteria | DoD |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DT-20 | Sửa `types.ts` — thêm 7 types M3 + riskReward field | Drawing core | Gate M2 | Type-check clean | PASS |
| DT-21 | Tạo `builtin/ray.ts` | Drawing core | DT-20 | createDraft + updateDraft correct; ray extends forward | Test pass |
| DT-22 | Tạo `builtin/extendedLine.ts` | Drawing core | DT-20 | Both extendLeft=true, extendRight=true | Test pass |
| DT-23 | Tạo `builtin/polyline.ts` | Drawing core | DT-20 | N-point accumulation; double-click completes | Test: 3 clicks + dblclick → complete |
| DT-24 | Tạo `builtin/dateAndPriceRange.ts` | Drawing core | DT-20 | Badge text = "Δ+X.XX% · N bars" | Test: badge math correct |
| DT-25 | Tạo `builtin/longPosition.ts` | Drawing core | DT-20 | entry/TP/SL from drag; riskReward calc | Test: R/R ratio correct (|TP-E|/|E-SL|) |
| DT-26 | Tạo `builtin/shortPosition.ts` | Drawing core | DT-20 | Inverted of longPosition | Test pass |
| DT-27 | Tạo `builtin/fibExtension.ts` | Drawing core | DT-20 | Extension levels [1.272, 1.414, 1.618, 2.0, 2.618] correct | Test: level prices correct |
| DT-28 | Sửa `renderSvg.ts` — thêm render cho 7 tools M3 | Drawing render | DT-21→DT-27 | Mỗi tool render đúng SVG; longPosition: xanh/đỏ box + badge | Smoke pass |
| DT-29 | Sửa `DrawingLayer.tsx` — Shift+click multi-select; polyline N-click | Drawing UI | Gate M2 | Shift+click 2 drawings → both highlighted; polyline: click→click→dblclick=complete | Smoke pass |
| DT-30 | Sửa `drawing/index.ts` — export + register 7 tools | Drawing core | DT-21→DT-27 | 15 tools total registered | PASS |
| DT-31 | Sửa `LibraryShowcaseDemo.tsx` — 7 tools + toolbar groups + dividers | Demo | DT-28, DT-29, DT-30 | 4 toolbar groups: Lines/Fibonacci/Shapes/Analysis với visual divider | Smoke pass |
| DT-32 | Sửa `i18n.tsx` + `demo.css` — M3 additions | Demo | DT-31 | tool.ray, tool.extendedLine, ..., longPosition/shortPosition CSS colors | Visual pass |

### Gate M3 checklist

- [ ] DT-20 → DT-32 all Done
- [ ] `npm run type-check` → PASS
- [ ] `npm test` → PASS (tests cho ray extend, longPosition R/R, fibExtension levels, polyline N-click)
- [ ] Browser smoke: all 7 new tools functional; multi-select; toolbar groups

---

## 5. Milestone M4 — Pattern Tools + Pro

| ID | Task | Owner role | Depends on | Acceptance criteria | DoD |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DT-33 | Sửa `types.ts` — thêm 6 types M4 | Drawing core | Gate M3 | Type-check clean | PASS |
| DT-34 | Tạo `builtin/parallelChannel.ts` | Drawing core | DT-33 | 3-point: P1/P2 main line, P3 offset; createDraft 3-click | Test: offset calc correct |
| DT-35 | Tạo `builtin/pitchfork.ts` | Drawing core | DT-33 | A/B/C → median + 2 side forks; midpoint calc correct | Test: median = A→mid(B,C) |
| DT-36 | Tạo `builtin/abcdPattern.ts` | Drawing core | DT-33 | 4-click ABCD; ratio badges BC/AB, CD/BC | Test: ratio math correct |
| DT-37 | Tạo `builtin/fibArc.ts` | Drawing core | DT-33 | 2-point; radius = dist(P1,P2); 3 arcs at 0.382/0.5/0.618 radius | Test: arc radii correct |
| DT-38 | Tạo `builtin/fibTimeZone.ts` | Drawing core | DT-33 | 2-point bar width; vertical lines at Fib seq [1,2,3,5,8,13,21,34] | Test: x positions correct |
| DT-39 | Tạo `builtin/regressionChannel.ts` | Drawing core | DT-33 | Least-squares regression; ±σ bands; R² badge | Test: regression math (slope, intercept, σ) |
| DT-40 | Sửa `renderSvg.ts` — thêm render cho 6 tools M4 | Drawing render | DT-34→DT-39 | Mỗi tool render đúng SVG | Smoke pass |
| DT-41 | Sửa `DrawingLayer.tsx` — N-click cho pitchfork (3) + abcd (4) | Drawing UI | Gate M3 | 3/4 clicks → auto-complete; APPEND_POINT action dispatched correctly | Smoke pass |
| DT-42 | Sửa `drawing/index.ts` — export + register 6 tools M4 | Drawing core | DT-34→DT-39 | 21 tools total | PASS |
| DT-43 | Sửa `LibraryShowcaseDemo.tsx` — 6 tools M4 trong toolbar Analysis | Demo | DT-40, DT-41, DT-42 | 6 tools accessible from Analysis group | Smoke pass |
| DT-44 | Sửa `i18n.tsx` + `demo.css` — M4 additions | Demo | DT-43 | tool.parallelChannel, ..., fibArc, etc. keys + CSS | Visual pass |

### Gate M4 checklist

- [x] DT-33 → DT-44 all Done
- [x] `npm run type-check` → PASS
- [x] `npm test` → PASS (tests cho pitchfork geometry, regression channel LSQ, fibArc radius)
- [x] Browser smoke: all 6 pattern tools functional; R² badge visible; pitchfork 3-click
- [x] `docs/upgrade-standard/AUDIT_LEDGER.md` updated
- [x] `module_tree_full.md` regenerated

---

## 6. Thứ tự thực hiện khuyến nghị

```
M1: ✅ DONE

M2: DT-12 → DT-13 (song song)
    DT-14 → DT-15 (song song với DT-12/13)
    DT-16 → DT-17
    DT-18 → DT-19
    → Gate M2 validation

M3: DT-20
    → DT-21 + DT-22 + DT-23 + DT-24 + DT-25 + DT-26 + DT-27 (song song)
    → DT-28 + DT-29 (song song)
    → DT-30 → DT-31 → DT-32
    → Gate M3 validation

M4: DT-33
    → DT-34 + DT-35 + DT-36 + DT-37 + DT-38 + DT-39 (song song)
    → DT-40 + DT-41 (song song)
    → DT-42 → DT-43 → DT-44
    → Gate M4 validation
```
