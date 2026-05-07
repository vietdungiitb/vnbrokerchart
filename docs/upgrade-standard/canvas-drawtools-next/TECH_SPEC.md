# Technical Specification — Canvas DrawTools Next (CE-NEXT)

> **Trạng thái:** Đề xuất
> **Phiên bản:** 0.1 · 2026-05-06
> **Phụ thuộc:** CE-series hoàn tất
> **Phạm vi:** CE-11 · CE-12 · CE-13

---

## 0. Hiện trạng làm mốc

CE-10 đã cung cấp các khả năng nền sau:

- Canvas renderer cho 21 tool types.
- Tool-aware hit testing.
- Snap OHLC và endpoint.
- Inspector và drawing list.
- Demo shell hiện có trên `LibraryShowcaseDemo.tsx`.

CE-NEXT không thay renderer nền. Nó thêm lớp editor, command layer và pane-aware behavior lên trên nền CE-10.

---

## 1. Vấn đề kỹ thuật còn thiếu

### 1.1 Object editor chưa tồn tại

`DrawingObject` hiện là dữ liệu vẽ, nhưng chưa có một lớp điều khiển vòng đời của object khi người dùng muốn chỉnh sửa nó.

Thiếu cụ thể:

- Move body theo drag.
- Resize qua handle theo tool semantics.
- Delete / duplicate / copy / paste.
- Z-order / lock / multi-select.
- Inline text editing cho Text tool.

### 1.2 Interaction model còn thiếu command layer

Hiện có hit test và snap, nhưng chưa có command bus cho:

- Right-click context menu.
- Keyboard shortcuts.
- Measuring tool.
- Magnet cursor state.
- Selection persistence sau thao tác.

### 1.3 Pane-aware drawing chưa được mô hình hoá

Drawings hiện thiên về price pane. Để hỗ trợ RSI/MACD/strength panes, cần có concept pane identity, y-scale identity và render target rõ ràng.

---

## 2. Target architecture

### 2.1 Đề xuất lớp mới

```
Pointer / Keyboard / Menu events
  ↓
DrawingCommandController
  ↓
useDrawingInteraction / state machine
  ↓
DrawingLayer / ChartCanvas / pane adapters
  ↓
Canvas renderer + hitTest + snap + labels
```

### 2.2 Mục tiêu của từng lớp

- **DrawingCommandController**: xử lý command-level intents như move, resize, delete, duplicate, lock, edit text.
- **State machine**: giữ trạng thái interaction nhất quán giữa select/move/resize/edit/measure.
- **DrawingLayer**: thực thi thao tác trực tiếp trên drawing object và emit update.
- **Pane adapters**: gắn một drawing với pane và y-scale đúng.

---

## 3. State model mở rộng

### 3.1 Trạng thái interaction đề xuất

```ts
export type DrawingEditState =
  | { type: "idle" }
  | { type: "selected"; ids: string[] }
  | { type: "moving"; ids: string[]; anchorPoint: { x: number; y: number } }
  | { type: "resizing"; id: string; handle: string }
  | { type: "editingText"; id: string }
  | { type: "measuring"; anchor: { x: number; y: number } }
  | { type: "menuOpen"; id?: string };
```

### 3.2 Mục tiêu hành vi

- `moving` áp dụng cho body drag của object đã chọn.
- `resizing` chỉ update điểm/handle đúng semantic của tool.
- `editingText` mở inline editor cho Text tool.
- `measuring` hiển thị Δ price và Δ bars khi hover/drag.
- `menuOpen` giữ ngữ cảnh cho right-click actions.

### 3.3 Trạng thái selection

Selection cần hỗ trợ:

- Một object.
- Nhiều object.
- Shift-click thêm/bớt object.
- Selection giữ nguyên khi context menu mở.

---

## 4. Object manipulation contract

### 4.1 Move

Khi kéo body object đã chọn:

- Lấy delta chart-space, không dùng pixel-space làm nguồn sự thật.
- Translate toàn bộ points của drawing theo delta đó.
- Không đổi `paneId` trừ khi user kéo sang pane khác và hành vi đó được cho phép.
- Snap vẫn có thể hoạt động khi move, nhưng phải là lựa chọn rõ ràng và không làm giật object.

### 4.2 Resize

Resize cần tool-aware:

- Line-like tools: endpoint handles.
- Rectangle/zone tools: corners.
- Text: anchor / baseline handle.
- Fib / channel / pitchfork: handle map riêng theo geometry.

Không được áp dụng resize kiểu “một công thức cho tất cả”. Điều đó sẽ phá semantics của từng tool.

### 4.3 Delete / duplicate / copy-paste

- Delete xóa selection hiện tại.
- Duplicate tạo bản sao offset nhẹ để người dùng thấy ngay object mới.
- Copy/paste giữ style, tool type và geometry, nhưng phải tạo id mới.
- Undo/redo phải coi các thao tác này là command đầu tiên chứ không chỉ là UI side effect.

### 4.4 Z-order / lock

- Bring to front / send to back thay đổi render order.
- Lock chặn move/resize/delete nhưng vẫn cho phép hiển thị và inspect.
- Multi-select được dùng cho nhóm object cùng thao tác.

---

## 5. Trading UX layer contract

### 5.1 Price label trên Y-axis

Mỗi drawing cần một strategy để xác định mức giá chính:

- Trendline: anchor cuối hoặc price gần mouse nhất.
- Horizontal tools: mức giá cố định.
- Rectangle / zone: mức giá focus hoặc vùng top/bottom.
- Stop/target tools: entry, stop, target đều có thể cần label riêng.

Mục tiêu là hiển thị label trên axis để user đọc giá mà không phải mở tooltip hay inspector.

### 5.2 Magnet cursor

Magnet cursor là tín hiệu trực quan cho snap state.

- Khi snap engine active, cursor phải đổi sang magnet/crosshair cue rõ ràng.
- Không dùng icon mơ hồ.
- Trạng thái phải ổn định khi user di chuyển gần OHLC hoặc endpoint.

### 5.3 Measuring tool

Measuring tool là công cụ hỗ trợ đọc nhanh:

- Δ bars.
- Δ price.
- Δ percent.
- Có thể mở bằng hotkey hoặc từ context menu.

Nó không thay thế drawing object, mà là overlay tạm thời cho phân tích nhanh.

### 5.4 Keyboard shortcuts

Các shortcut tối thiểu cần có:

- `L` line.
- `F` fib.
- `R` rectangle.
- `T` text.
- `Del` xóa selection.
- `Esc` thoát tool hiện tại hoặc đóng menu/editor.
- `Ctrl/Cmd+C` copy.
- `Ctrl/Cmd+V` paste.
- `Ctrl/Cmd+Z` undo.
- `Ctrl/Cmd+Y` redo.

### 5.5 Right-click context menu

Menu ngữ cảnh cần chứa:

- Move / Duplicate / Delete.
- Lock / Unlock.
- Bring to front / Send to back.
- Copy / Paste.
- Edit text nếu object hỗ trợ.
- Start measuring nếu user đang trên chart.

### 5.6 Inline text editing

Text tool phải cho phép edit trực tiếp trên canvas/drawing region thay vì chỉ qua modal.

- Double-click text để vào edit mode.
- Enter để commit.
- Esc để cancel.
- Không phá selection state hiện tại.

---

## 6. Pane-aware drawing contract

### 6.1 Điều cần có

- Mỗi drawing biết mình thuộc pane nào.
- Mỗi drawing biết y-scale nào đang chi phối nó.
- Render và hit test phải đọc đúng scale pane đó.
- Copy/paste giữa panes phải có chuyển đổi hợp lệ hoặc cảnh báo rõ ràng.

### 6.2 Mô hình dữ liệu đề xuất

```ts
export interface DrawingPlacement {
  paneId: string;
  yScaleId?: string;
  coordinateSpace: "price" | "indicator" | "normalized";
}
```

### 6.3 Quy tắc pane

- Drawing đặt trong price pane dùng price y-scale.
- Drawing đặt trong indicator pane dùng scale pane đó.
- Khi symbol hoặc layout đổi, drawing giữ được paneId nếu pane còn tồn tại.
- Nếu pane biến mất, drawing cần fallback hoặc được đánh dấu orphan rõ ràng.

---

## 7. Mô-đun source đề xuất

Các module sau là ứng viên tự nhiên cho CE-NEXT:

- `src/lib/drawing/interactionController.ts`
- `src/lib/drawing/handleRegistry.ts`
- `src/lib/drawing/priceLabel.ts`
- `src/lib/drawing/measuring.ts`
- `src/lib/drawing/contextMenu.tsx`
- `src/lib/drawing/shortcutMap.ts`
- `src/lib/drawing/paneAdapter.ts`
- `src/lib/drawing/selectionTransforms.ts`

Các module này nên bám theo kiến trúc hiện tại, không tách thành engine thứ hai.

---

## 8. Acceptance criteria

### CE-11 — Object editing core

- Drag body moves object theo chart-space.
- Resize handle chỉnh đúng điểm/semantic.
- Delete xóa object đã chọn.
- Copy/paste tạo bản sao đúng style và geometry.
- Undo/redo hoạt động cho các command trên.

### CE-12 — Trading UX layer

- Price label trên Y-axis hiển thị đúng.
- Magnet cursor icon phản hồi khi snap.
- Shortcut hoạt động ổn định.
- Context menu mở đúng object ngữ cảnh.
- Measuring tool hiển thị Δ price và Δ bars.
- Inline text edit commit/cancel đúng.

### CE-13 — Multi-pane workflow

- Drawing có thể gắn với indicator panes.
- Hit test và render dùng đúng pane scale.
- Copy/paste giữa panes không mất shape.
- Persistence giữ đúng `paneId`.
- Smoke test trên RSI/MACD panes pass.

---

## 9. Rủi ro chính

| Rủi ro | Tác động | Giảm thiểu |
|---|---|---|
| Resize semantics khác nhau giữa tool types | Phá chính xác geometry | Handle map riêng theo tool type |
| Pane-aware scale phức tạp | Drawing lệch vị trí | Thêm pane adapter và smoke riêng |
| Shortcut / menu đụng browser default | UX không ổn định | Dùng command controller có precedence rõ ràng |
| Copy/paste clone sai id / state | Trùng object hoặc hỏng history | Tạo clone helper riêng và test round-trip |
| Inline text edit phá selection | Mất ngữ cảnh người dùng | Tách edit state khỏi selected state |

---

## 10. Kết luận

CE-NEXT là bước chuyển từ công cụ vẽ sang công cụ chỉnh sửa. Nếu không có lớp này, user sẽ 계속 phải xóa rồi vẽ lại. Nếu có lớp này, chart trở thành không gian làm việc thật sự.
