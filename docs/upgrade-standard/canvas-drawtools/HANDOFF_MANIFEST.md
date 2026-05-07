# Handoff Manifest: Canvas DrawTools Engine (CE-Series)

**Trạng thái:** `Approved` — Sẵn sàng để code team thực thi ngay theo bộ tài liệu này mà không cần hỏi lại.  
**Ngày tạo:** 2026-05-06  
**Phiên bản:** v1.1 (kiến trúc in-place upgrade)  
**Branch target:** `dev`

---

## 1. Mục tiêu

Nâng cấp hệ thống vẽ kỹ thuật từ kiến trúc SVG (M1 `src/lib/drawing/renderSvg.ts`) lên kiến trúc **pure Canvas 2D**, đạt chuẩn chức năng ngang TradingView/GoCharting.

**Chiến lược: In-place upgrade** — KHÔNG tạo module mới. Toàn bộ upgrade nằm trong `src/lib/drawing/` hiện tại bằng cách thêm 3 file mới (`renderCanvas.ts`, `hitTest.ts`, `snap.ts`) và cập nhật `DrawingLayer.tsx` để dùng `canvasDraw` thay `svgDraw`. Tất cả 21 tools, FSM, history, storage, inspector đã có sẵn — chỉ thay render path.

---

## 2. Tại sao cần nâng cấp (Context kỹ thuật)

| Vấn đề hiện tại | Hậu quả | Giải pháp CE |
| :--- | :--- | :--- |
| SVG render (`renderSvg.ts`) trong GenericComponent.svgDraw | Re-render React tree khi pan/zoom; không scale tốt >50 objects | Canvas 2D via `GenericComponent.canvasDraw` — không trigger React re-render |
| Click detection dựa vào SVG pointer events | Không thể customize tolerance, không hoạt động khi canvas overlay che | `hitTest.ts` với distanceToSegment per tool type |
| Không có snap engine | Điểm vẽ không khớp OHLC | `snap.ts` 8px tolerance, OHLC-first, endpoint-second |
| Legacy `src/lib/interactive/` class components | Class components không dùng hooks | Wiring qua canvas DrawingLayer; interactive/ sẽ depreacted |

---

## 3. Phạm vi (In Scope vs Out of Scope)

### In scope (CE-Series)

| File | Loại | Mô tả |
| :--- | :--- | :--- |
| `src/lib/drawing/renderCanvas.ts` | TẠO MỚI | Canvas 2D renderer cho 21 tool types, thay thế renderSvg.ts |
| `src/lib/drawing/hitTest.ts` | TẠO MỚI | Hit testing per-tool để select drawing bằng click |
| `src/lib/drawing/snap.ts` | TẠO MỚI | Snap engine: OHLC + drawing endpoint |
| `src/lib/drawing/DrawingLayer.tsx` | SỬA | Switch từ `svgDraw` → `canvasDraw` + tích hợp hitTest + snap |
| `src/demo/demo.css` | SỬA | Snap cursor styles, position zone colors |
| `src/demo/LibraryShowcaseDemo.tsx` | KIỂM TRA/SỬA | Đảm bảo không còn `src/lib/interactive/` imports cho drawing tools |

### Không thay đổi (giữ nguyên 100%)

- `src/lib/drawing/types.ts` — 21 tool types, DrawingObject, DrawingStyle
- `src/lib/drawing/stateMachine.ts` — 7-state FSM
- `src/lib/drawing/history.ts` — undo/redo
- `src/lib/drawing/registry.ts` + `builtin/` — 21 tool definitions
- `src/lib/drawing/coordinateUtils.ts` — coordinate bridge
- `src/lib/drawing/DrawingInspector.tsx`, `DrawingListPanel.tsx`
- `src/lib/drawing/DrawingStorage.ts`, `useDrawingStorage.ts`
- `src/lib/drawing/renderSvg.ts` — giữ nguyên (không xóa cho đến CE-10 pass)

### Out of scope

- Tạo module mới `src/lib/drawEngine/` — KHÔNG làm
- Backend persistence
- Drawing trên indicator panes (chỉ price pane)
- Mobile touch drawing

---

## 4. Bộ tài liệu bàn giao

| File | Vai trò |
| :--- | :--- |
| **[HANDOFF_MANIFEST.md](HANDOFF_MANIFEST.md)** | Tài liệu này — entry point, scope, định nghĩa done |
| **[TECH_SPEC.md](TECH_SPEC.md)** | Kiến trúc đầy đủ: FSM, interfaces, coordinate bridge, rendering pipeline, hit testing, snap, tool catalog |
| **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** | Kế hoạch 10 slice CE-01→CE-10, file-by-file, TypeScript signatures, gate criteria |
| **[TASKBOARD.md](TASKBOARD.md)** | Mọi task CE-01-T01 đến CE-10-T05 với dependency, DoD, acceptance criteria |
| **[AUDIT_PROTOCOL.md](AUDIT_PROTOCOL.md)** | Test matrix F01→F90+, regression matrix R01→R25, unit test requirements, evidence template |

---

## 5. Quan hệ với package drawing-tools (M1→M4 SVG)

| Package | Đường dẫn | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- |
| SVG Drawing Tools M1 | `docs/upgrade-standard/drawing-tools/` | M1 Done (commit `b1bf284`) | Reference — không xóa, giữ làm historical evidence |
| SVG Drawing Tools M2→M4 | `docs/upgrade-standard/drawing-tools/` | **Superseded** bởi CE-Series | M2→M4 SVG không cần thực hiện; CE-series thay thế toàn bộ |
| **Canvas DrawTools CE** | `docs/upgrade-standard/canvas-drawtools/` | **Active** | Bộ tài liệu này — thực thi ngay |

**Quyết định chốt (không hỏi lại):** CE-Series thay thế M2→M4 SVG. Đội code không cần implement M2→M4 SVG theo `docs/upgrade-standard/drawing-tools/`; thay vào đó thực thi CE-01→CE-10 theo bộ tài liệu này.

---

## 6. Milestone map

| Slice | Tên | File target | Gate |
| :--- | :--- | :--- | :--- |
| **CE-01** | Canvas renderer — line types (8 tools) | `renderCanvas.ts` (partial) | type-check pass |
| **CE-02** | Canvas renderer — fill shapes (5 tools) | `renderCanvas.ts` (partial) | type-check pass |
| **CE-03** | Canvas renderer — fibonacci & arcs (4 tools) | `renderCanvas.ts` (partial) | type-check pass |
| **CE-04** | Canvas renderer — complex tools (4 tools) | `renderCanvas.ts` (complete, 21/21) | type-check + no SVG imports |
| **CE-05** | Hit testing core | `hitTest.ts` (new) | type-check pass |
| **CE-06** | Snap engine | `snap.ts` (new) | type-check pass |
| **CE-07** | DrawingLayer switch canvasDraw | `DrawingLayer.tsx` (modified) | type-check + npm test pass |
| **CE-08** | Demo CSS polish | `demo.css` (modified) | build pass |
| **CE-09** | LibraryShowcaseDemo wiring | `LibraryShowcaseDemo.tsx` (check/fix) | no interactive/ imports |
| **CE-10** | Audit + ledger + module tree | docs + scripts | full validation gate |

---

## 7. Định nghĩa Done (DoD) tổng thể

Bộ tài liệu này được coi là **hoàn tất bàn giao** khi tất cả điều kiện sau đều đúng:

### Gate CE-01→CE-04 (renderCanvas.ts hoàn chỉnh)
- [ ] `src/lib/drawing/renderCanvas.ts` tồn tại
- [ ] Đủ 21 `case` trong switch của `renderDrawingToCanvas`
- [ ] Không có `import { createElement }` hay bất kỳ SVG element import
- [ ] `npm run type-check` → 0 errors

### Gate CE-05 (hitTest.ts)
- [ ] `src/lib/drawing/hitTest.ts` tồn tại
- [ ] `hitTestDrawing(drawing, mouseX, mouseY, scales, opts)` export đúng
- [ ] `getResizeHandleIndex(...)` export đúng
- [ ] `npm run type-check` → 0 errors

### Gate CE-06 (snap.ts)
- [ ] `src/lib/drawing/snap.ts` tồn tại
- [ ] `findSnapPoint(...)` export đúng với SnapResult interface
- [ ] `npm run type-check` → 0 errors

### Gate CE-07 (DrawingLayer switch — quan trọng nhất)
- [ ] `DrawingLayer.tsx` dùng `canvasDraw={drawToCanvas}` thay `svgDraw={renderSVG}`
- [ ] `svgDraw={() => null}` (no-op, required prop)
- [ ] Snap indicator vàng hiện khi hover gần OHLC
- [ ] Click drawing → SELECT_OBJECT dispatch
- [ ] Click trống → CANCEL dispatch
- [ ] `npm run type-check` → 0 errors; `npm test` → pass

### Gate CE-08 (CSS)
- [ ] `.rsc-drawing-snap-active` tồn tại trong `demo.css`
- [ ] `npm run build:docs` → success

### Gate CE-09 (Demo wiring)
- [ ] Không còn `interactive/TrendLine` hay `interactive/Fibonacci` import trong `LibraryShowcaseDemo.tsx`
- [ ] DrawingInspector props đầy đủ: `onUpdate, onDelete, onClone, onToggleLock, onToggleVisible`
- [ ] `npm run type-check` → 0 errors

### Gate CE-10 (Final audit)
- [ ] `docs/upgrade-standard/AUDIT_LEDGER.md` có entry CE-series
- [ ] `module_tree_full.md` chứa `renderCanvas`, `hitTest`, `snap`
- [ ] `npm run type-check` → 0 errors
- [ ] `npm test` → all pass
- [ ] `npm run build:docs` → success

---

## 8. Nguyên tắc bắt buộc (Hard Rules)

1. **KHÔNG thêm text UI mới** mà không có i18n key trong `src/demo/i18n.tsx`.
2. **KHÔNG import** `src/demo/**` từ bất kỳ file nào trong `src/lib/**`.
3. **DrawingObject.points LUÔN lưu chart coordinates** (timestamp ms + price) — không bao giờ lưu pixel.
4. **Pure Canvas 2D** cho rendering — `renderCanvas.ts` KHÔNG được import `createElement` hay React SVG elements.
5. **type-check PASS** trước khi đóng mỗi gate.
6. **module_tree_full.md PHẢI regenerate** sau khi thêm file mới vào `src/`.
7. **AUDIT_LEDGER.md** phải được cập nhật tại CE-10.
8. **Không xóa `renderSvg.ts`** cho đến khi CE-10 pass — giữ làm reference và fallback.
9. **KHÔNG tạo module `src/lib/drawEngine/`** — toàn bộ CE làm trong `src/lib/drawing/`.
10. **`svgDraw={() => null}`** phải được giữ trong GenericComponent để tránh PropTypes error.

---

## 9. Liên kết tài liệu governance

| Tài liệu | Đường dẫn |
| :--- | :--- |
| Change Control Standard | `docs/CHANGE_CONTROL_STANDARD.md` |
| Project Governance | `docs/project-delivery/PROJECT_GOVERNANCE.md` |
| Quality Constitution | `quality/QUALITY.md` |
| Audit Ledger canonical | `docs/upgrade-standard/AUDIT_LEDGER.md` |
| Module inventory | `module_tree_full.md` |
| SVG M1 reference (done) | `docs/upgrade-standard/drawing-tools/HANDOFF_MANIFEST.md` |

---

## 10. Trạng thái phê duyệt

> **Status: `Approved`**  
> Bộ tài liệu đã đủ rõ ràng theo `docs/CHANGE_CONTROL_STANDARD.md` Mục 6 (điều kiện code-ready). Đội code có thể bắt đầu CE-01 ngay mà không cần hỏi lại. Sau khi hoàn thành CE-01, tự động chuyển sang CE-02 không cần xin phép thêm.
