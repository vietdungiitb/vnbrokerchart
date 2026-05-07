# Implementation Plan — Canvas DrawTools Next (CE-NEXT)

> **Trạng thái:** Đề xuất
> **Phiên bản:** 0.1 · 2026-05-06
> **Phụ thuộc:** CE-series hoàn tất
> **Lộ trình:** CE-11 → CE-12 → CE-13

---

## 1. Mục tiêu tổng

CE-NEXT đưa drawtools từ mức "vẽ được" sang mức "chỉnh sửa được và dùng được mỗi ngày".

### Outcome mong muốn

1. Người dùng kéo object đã vẽ để move mà không phải vẽ lại.
2. Người dùng resize qua handle đúng semantic của từng tool.
3. Người dùng xóa, copy, paste, duplicate và đổi layer ngay trên chart.
4. Người dùng nhìn thấy price label trên axis, hiểu ngay mức giá liên quan.
5. Người dùng dùng shortcut, context menu và measuring tool như TradingView.
6. Người dùng vẽ được trên indicator panes với scale đúng.

---

## 2. Nguyên tắc triển khai

1. **Additive trước, breaking change sau cùng.** Không phá CE-10.
2. **Object editing là ưu tiên số 1.** Nếu chưa move/resize/delete được thì chưa thể nói là editor.
3. **UX layer chỉ có ý nghĩa khi object editing đã ổn.** Vì vậy CE-12 sau CE-11.
4. **Pane-aware workflow là phase riêng.** Không nhảy sớm sang RSI/MACD support.
5. **i18n bắt buộc.** Không hardcode text mới trong UI.
6. **Không tạo engine song song.** Mọi thứ vẫn bám vào `src/lib/drawing/` hiện tại.

---

## 3. Slices

### CE-11 — Object editing core

| Slice | Mục tiêu | File chính | Gate |
|---|---|---|---|
| CE-11-01 | Thêm edit-state model và command surface | `useDrawingInteraction.ts`, `DrawingLayer.tsx` | type-check |
| CE-11-02 | Move body drag cho selected drawings | `DrawingLayer.tsx`, helper transform mới | browser smoke |
| CE-11-03 | Resize handles theo tool semantics | `hitTest.ts`, helper handle registry | browser smoke |
| CE-11-04 | Delete / duplicate / copy / paste / undo-redo | `useDrawingInteraction.ts`, `DrawingInspector.tsx` | test + smoke |
| CE-11-05 | Z-order / lock / multi-select refinements | `DrawingLayer.tsx`, inspector wiring | type-check + smoke |

**DoD CE-11:**
- Drag object đã chọn làm object di chuyển đúng.
- Handle drag làm resize đúng điểm.
- Delete và duplicate hoạt động từ keyboard/toolbar.
- History vẫn hoạt động.

---

### CE-12 — Trading UX layer

| Slice | Mục tiêu | File chính | Gate |
|---|---|---|---|
| CE-12-01 | Price label trên Y-axis | `priceLabel.ts`, `ChartCanvas.tsx` hoặc adapter tương ứng | smoke |
| CE-12-02 | Magnet cursor & measuring tool | `measuring.ts`, `demo.css`, `DrawingLayer.tsx` | smoke |
| CE-12-03 | Keyboard shortcuts + context menu | `shortcutMap.ts`, `contextMenu.tsx`, `LibraryShowcaseDemo.tsx` | smoke |
| CE-12-04 | Inline text editing | `DrawingInspector.tsx`, text interaction path | test + smoke |

**DoD CE-12:**
- Shortcut `L/F/R/T/Del/Esc/Ctrl+C/Ctrl+V/Ctrl+Z/Ctrl+Y` hoạt động.
- Right-click menu có các action chính.
- Measuring tool hiển thị Δ bars và Δ price.
- Price label trên axis update đúng khi selection hoặc zoom thay đổi.

---

### CE-13 — Multi-pane workflow

| Slice | Mục tiêu | File chính | Gate |
|---|---|---|---|
| CE-13-01 | Pane-aware drawing model | drawing types + persistence adapter | type-check |
| CE-13-02 | Render/hit test theo pane scale | `DrawingLayer.tsx`, pane adapter mới | smoke |
| CE-13-03 | Copy/paste/persist across panes | storage + demo wiring | browser smoke |
| CE-13-04 | Final audit & module tree | docs + scripts | full validation |

**DoD CE-13:**
- Vẽ trên RSI/MACD panes không lệch scale.
- Drawing lưu đúng paneId.
- Copy/paste không làm mất shape khi đổi pane.
- Layout reload vẫn giữ drawing đúng nơi.

---

## 4. Thứ tự thực hiện khuyến nghị

```text
CE-11-01 → CE-11-02 → CE-11-03 → CE-11-04 → CE-11-05
     ↓
CE-12-01 → CE-12-02 → CE-12-03 → CE-12-04
     ↓
CE-13-01 → CE-13-02 → CE-13-03 → CE-13-04
```

### Lý do thứ tự này

- Move/resize/delete là nền tảng của editor.
- Shortcut/context menu chỉ có giá trị khi object selection ổn định.
- Pane-aware support nên đến sau khi command layer đã ổn định, tránh đụng quá nhiều trục cùng lúc.

---

## 5. Dependency map

| Slice | Phụ thuộc |
|---|---|
| CE-11-02 | CE-11-01 |
| CE-11-03 | CE-11-01 |
| CE-11-04 | CE-11-02, CE-11-03 |
| CE-11-05 | CE-11-04 |
| CE-12-01 | CE-11-01, CE-11-02 |
| CE-12-02 | CE-11-04 |
| CE-12-03 | CE-11-04 |
| CE-12-04 | CE-11-01, CE-11-04 |
| CE-13-01 | CE-11-01 |
| CE-13-02 | CE-13-01 |
| CE-13-03 | CE-13-01, CE-13-02 |
| CE-13-04 | Tất cả slice trước |

---

## 6. Definition of Done theo sprint

### Sprint 1 — Object editing core

- Move, resize, delete hoạt động trên drawing đã chọn.
- Undo/redo giữ đúng history sau thao tác edit.
- Copy/paste tạo bản sao có id mới.
- Lock chặn edit nhưng không phá view state.

### Sprint 2 — Trading UX layer

- Shortcut và context menu có ích thật, không chỉ là menu demo.
- Price labels giúp đọc mức giá ngay trên axis.
- Measuring tool hỗ trợ đọc nhanh khoảng giá / số bars.
- Text tool có inline editing.

### Sprint 3 — Multi-pane workflow

- Drawing gắn đúng pane.
- Render/hit test theo scale pane.
- Persistence và smoke demo cho RSI/MACD panes pass.

---

## 7. Không làm trong giai đoạn này

- Không thêm collaboration đa người dùng.
- Không thêm marketplace / template sharing công khai.
- Không làm lại CE-10 renderer.
- Không chuyển tất cả storage sang backend.
- Không mở rộng sang mobile gesture parity đầy đủ.

---

## 8. Chốt lộ trình

CE-NEXT cần được làm theo thứ tự này vì đây là thứ tự giảm rủi ro tốt nhất:

1. Chỉnh sửa object đã có.
2. Làm UX power-user.
3. Mở rộng sang indicator panes.

Nếu đảo thứ tự, rất dễ tốn công xây shortcut / menu / label trên một nền object còn chưa chỉnh sửa được.
