# Backlog: Full TypeScript Migration — Delivery Register

## 1. Backlog format

Mỗi item: priority, slice, scope, phụ thuộc, tiêu chí nghiệm thu.

---

## 2. Closed items (S0–S16) — đã hoàn thành chu kỳ trước

| ID | Priority | Slice | Task | Status |
| :--- | :---: | :--- | :--- | :--- |
| B-001 | P0 | S0 | Baseline snapshot | Completed |
| B-002 | P0 | S0 | Module tree inventory | Completed |
| B-003 | P0 | S1 | Add React/DOM typings | Completed |
| B-004 | P0 | S1 | Add PropTypes typings path | Completed |
| B-005 | P0 | S1 | Create shared chart types | Completed |
| B-006 | P0 | S2 | Remove legacy context APIs | Completed |
| B-007 | P0 | S2 | Remove `findDOMNode` | Completed |
| B-008 | P0 | S3 | Type `ChartCanvas` core | Completed |
| B-009 | P0 | S3 | Type `GenericComponent` stack | Completed |
| B-010 | P1 | S4 | Convert utilities (partial) | Completed |
| B-011 | P1 | S4 | Convert scale helpers (partial) | Completed |
| B-012 | P1 | S5 | Convert candlestick/bar/line series | Completed |
| B-013 | P1 | S5 | Convert RSI/MACD/StraightLine | Completed |
| B-014 | P1 | S5 | Convert axes and coordinates | Completed |
| B-015 | P1 | S5 | Convert tooltip layer | Completed |
| B-016 | P1 | S6 | Convert interactive drawings | Completed |
| B-017 | P0 | S7 | Restore FullDemo | Completed |
| B-018 | P0 | S7 | Restore LiveDemo | Completed |
| B-019 | P1 | S7 | Make demo responsive | Completed |
| B-020 | P1 | S8 | Add smoke QA checklist | Completed |
| B-021 | P1 | S8 | Update audit ledger | Completed |
| B-022 | P2 | S8 | Refresh module tree doc | Completed |
| B-023 | P0 | S15 | Fix zoom/pan (pointsPerPxThreshold) | Completed |
| B-024 | P0 | S15 | Fix panel layout (overviewHeight) | Completed |
| B-101 | P0 | S16 | Migrate `utils/` (15 files) | Completed |
| B-102 | P0 | S16 | Migrate `scale/` (5 files) | Completed |
| B-103 | P0 | S16 | Migrate `helper/` (5 files) | Completed |
| B-104 | P0 | S16 | Migrate `calculator/` (20 files) | Completed |
| B-105 | P0 | S16 | Migrate `src/index.js` | Completed |
| B-106 | P1 | S17 | Gate G1 validation | Completed |
| B-107 | P0 | S18 | Migrate `series/` còn lại (~24 files) | Completed |
| B-108 | P0 | S18 | Migrate `axes/` (7 files) | Completed |
| B-109 | P0 | S18 | Migrate `coordinates/` (11 files) | Completed |
| B-110 | P0 | S19 | Migrate `tooltip/` (13 files) | Completed |
| B-111 | P1 | S19 | Migrate `annotation/` (6 files) | Completed |
| B-112 | P0 | S20 | Gate G2 validation | Completed |

---

## 3. Open items — Chương trình TS migration mới (S21–S22)

| ID | Priority | Slice | Task | Scope | Depends on | Acceptance criteria | Est. | Status |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| B-113 | P0 | S21 | Migrate `indicator/` (21 files) | `.ts/.tsx` conversion | B-104, B-107 | Indicator wrappers typed; demo indicator OK | XL | Open |
| B-114 | P0 | S21 | Migrate `interactive/` (22 files) | `.tsx` conversion | B-016, B-109 | Brush/TrendLine/Fib typed; interaction smoke | XL | Open |
| B-115 | P0 | S22 | Migrate `EventCapture.js` | `.tsx` conversion | B-009, B-114 | Zoom/pan/brush hoạt động post-migration | L | Open |
| B-116 | P0 | S22 | Migrate `CanvasContainer.js` | `.tsx` | B-008 | Canvas layering typed | M | Open |
| B-117 | P0 | S22 | Migrate `BackgroundText.js` | `.tsx` | B-009 | BackgroundText typed | S | Open |
| B-118 | P0 | S22 | Migrate `ZoomButtons.js` | `.tsx` | B-008 | ZoomButtons typed | S | Open |
| B-119 | P0 | S22 | Gate G3 + final validation | type-check zero error; 0 file `.js` trong `src/`; full demo smoke | B-113–118 | 100% TS; demo hoạt động đầy đủ | M | Open |
| B-120 | P1 | S22 | Cập nhật audit ledger S16–S22 | AUDIT_LEDGER.md entries | B-119 | Ledger đầy đủ evidence cho mỗi slice | S | Open |
| B-121 | P1 | S22 | Regenerate module_tree_full.md | module_tree_full.md | B-119 | Inventory 0 file `.js` trong src | S | Open |

**Open items: 9**

---

## 3b. Drawing Tools Engine — Workstream mới (DT-M1/M2/M3)

*Tham chiếu đầy đủ: `docs/upgrade-standard/drawing-tools/HANDOFF_MANIFEST.md`*

| ID | Priority | Milestone | Task | Scope | Depends on | Acceptance criteria | Est. | Status |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| B-130 | P0 | DT-M1 | Tạo `coordinateUtils.ts` | Coordinate bridge pixel↔chart | — | Roundtrip unit test pass | S | Open |
| B-131 | P0 | DT-M1 | Tạo `renderSvg.ts` | SVG render cho 8 tool types | B-130 | `renderDrawingToSvg` trả đúng elements | M | Open |
| B-132 | P0 | DT-M1 | Tạo `useDrawingInteraction.ts` | Hook wrap state machine + history | — | undo/redo/delete/cancel hoạt động | S | Open |
| B-133 | P0 | DT-M1 | Tạo `DrawingLayer.tsx` | SVG overlay + pointer events | B-130, B-131, B-132 | Browser smoke: click → line appears | M | Open |
| B-134 | P0 | DT-M1 | Wire `LibraryShowcaseDemo.tsx` | Mount DrawingLayer + keyboard | B-133 | Ctrl+Z/Y/ESC/Del hoạt động | M | Open |
| B-135 | P1 | DT-M1 | Tạo `rectangle.ts` + `arrow.ts` built-ins | 2 tool mới | — | createDraft/updateDraft test pass | S | Open |
| B-136 | P0 | DT-M2 | Tạo `DrawingInspector.tsx` | Floating property panel | Gate M1 | Color/stroke/lock controls | M | Open |
| B-137 | P0 | DT-M2 | Tạo `DrawingStorage.ts` + `useDrawingStorage.ts` | localStorage persistence | Gate M1 | Reload → drawings persist | M | Open |
| B-138 | P1 | DT-M3 | Tạo `priceRange.ts`, `positionBox.ts`, `fibExtension.ts` | 3 advanced tools | Gate M2 | Badge + R/R ratio đúng | L | Open |
| B-139 | P1 | DT-M3 | Multi-select + toolbar groups | Shift+click; divider UI | Gate M2 | Shift+click 2 → Delete xóa 2 | M | Open |

**Drawing Tools open items: 10**

---

## 3c. Canvas DrawTools Next — Workstream mới (CE-11/CE-12/CE-13)

*Tham chiếu đầy đủ: `docs/upgrade-standard/canvas-drawtools-next/HANDOFF_MANIFEST.md`*

| ID | Priority | Milestone | Task | Scope | Depends on | Acceptance criteria | Est. | Status |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| B-140 | P0 | CE-11 | Object editing core | Move/resize/delete/copy-paste/z-order | CE-10 | Drag object và handle resize pass smoke | XL | Open |
| B-141 | P0 | CE-12 | Trading UX layer | Axis price labels, measuring tool, shortcuts, context menu | CE-11 | Shortcut/context menu/labels pass smoke | L | Open |
| B-142 | P1 | CE-13 | Indicator pane workflow | Pane-aware render/hit test/persist | CE-11, CE-12 | Vẽ trên RSI/MACD pane đúng scale | XL | Open |
| B-143 | P1 | CE-NEXT | Audit + closeout | Audit ledger + module tree + package closeout | CE-11–CE-13 | Evidence đủ, inventory cập nhật | S | Open |

---

## 4. Ghi chú cho team

- **Không bắt đầu Giai đoạn 2 trước khi Gate G1 pass**.
- **Không bắt đầu Giai đoạn 3 trước khi Gate G2 pass**.
- Nếu một file trong Giai đoạn 1 có JSX → đổi thành `.tsx` thay vì `.ts`.
- `any` tạm thời được phép nhưng phải có comment `// TODO(ts-migration): narrow type`.
- Mọi file được chạm → phải update AUDIT_LEDGER với tên file chính xác.

---

## 5. Thứ tự thực hiện gợi ý

1. B-113 → B-114 song song; sau đó B-115 → B-116 → B-117 → B-118
2. B-119 → B-120 → B-121
