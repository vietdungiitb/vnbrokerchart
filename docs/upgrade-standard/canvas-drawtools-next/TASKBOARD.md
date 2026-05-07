# Taskboard — Canvas DrawTools Next (CE-NEXT)

> **Trạng thái package:** Đề xuất
> **Baseline:** CE-10 đã hoàn tất
> **Mục tiêu:** editor-grade drawing workflow

---

## 1. Quy ước trạng thái

- `READY` — có thể bắt đầu ngay.
- `TODO` — có trong plan nhưng chờ prerequisite.
- `IN_PROGRESS` — đang code.
- `DONE` — slice đã đóng và có evidence.
- `BLOCKED` — chặn bởi dependency hoặc scope chưa duyệt.

---

## 2. Sprint 1 — Object editing core

| ID | Trạng thái | Công việc | File đích | Đầu ra bắt buộc |
|---|---|---|---|---|
| CE11-01 | DONE | Thêm edit-state model và command surface | `useDrawingInteraction.ts` / helper mới | state machine có moving/resizing/editing |
| CE11-02 | DONE | Drag body để move drawing | `DrawingLayer.tsx` | drag object đã chọn di chuyển đúng |
| CE11-03 | DONE | Resize handles theo tool semantics | `hitTest.ts` / handle registry | endpoint/corner drag resize đúng |
| CE11-04 | DONE | Delete, duplicate, copy, paste, undo-redo | `useDrawingInteraction.ts`, inspector | shortcut + toolbar command hoạt động |
| CE11-05 | DONE | Z-order, lock, multi-select refinements | `DrawingLayer.tsx`, inspector | bring-to-front / lock / shift-select pass |

---

## 3. Sprint 2 — Trading UX layer

| ID | Trạng thái | Công việc | File đích | Đầu ra bắt buộc |
|---|---|---|---|---|
| CE12-01 | DONE | Price label trên Y-axis | `priceLabel.tsx` / demo shell + axis coordinate | label hiển thị đúng mức giá liên quan |
| CE12-02 | DONE | Magnet cursor + measuring tool | `measuring.ts`, `MeasurementOverlay.tsx`, `demo.css` | hover/snap cue và Δ bars/price |
| CE12-03 | DONE | Keyboard shortcuts + context menu | `shortcutMap.ts`, `contextMenu.tsx` | L/F/R/T/Del/Ctrl+C/V/Z/Y/Esc |
| CE12-04 | DONE | Inline text editing | `DrawingInspector.tsx` / text path | double-click text edit commit/cancel |

---

## 4. Sprint 3 — Multi-pane workflow

| ID | Trạng thái | Công việc | File đích | Đầu ra bắt buộc |
|---|---|---|---|---|
| CE13-01 | DONE | Pane-aware drawing model | drawing types + storage adapter | paneId / yScaleId được lưu |
| CE13-02 | DONE | Render/hit test theo pane scale | `DrawingLayer.tsx`, pane adapter | RSI/MACD panes hit đúng |
| CE13-03 | DONE | Copy/paste/persist across panes | storage + demo wiring | reload vẫn đúng pane |
| CE13-04 | DONE | Final audit và module tree | docs + scripts | audit ledger + inventory update |

---

## 5. Definition of Done theo task nhóm

### CE11 — Object editing core

- Drag object move đúng chart coordinates.
- Resize chỉ chỉnh handle được chọn.
- Delete xóa object đã chọn.
- Undo/redo giữ lịch sử đúng.

### CE12 — Trading UX layer

- Shortcut hoạt động.
- Context menu mở đúng object.
- Price label trên axis phản ánh drawing.
- Measuring tool hiển thị Δ price và Δ bars.

### CE13 — Multi-pane workflow

- Drawing trên indicator pane render và hit test đúng scale.
- Copy/paste không mất geometry.
- Persistence giữ pane mapping.

---

## 6. Dependency notes

- CE11-01 là prerequisite cho hầu hết task còn lại.
- CE12 không nên bắt đầu trước khi CE11 xong.
- CE13 chỉ nên bắt đầu sau khi object editing ổn định.

---

## 7. Ghi chú điều phối

- Không thêm text UI mới nếu chưa có i18n key.
- Không mở rộng scope sang collaboration/marketplace.
- Không tạo engine mới ngoài `src/lib/drawing/` và các adapter liên quan.
- Mỗi slice xong phải có audit evidence trước khi chuyển sang slice tiếp theo.
