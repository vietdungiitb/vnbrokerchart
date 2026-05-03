# Phase 5 — Drawing Tools (As-built Sync)

> Thuộc: [ROADMAP.md](./ROADMAP.md)  
> Trạng thái thực thi: Completed trong delivery scope P1-P7 (mở rộng catalog/persistence ở post-v1)
> Slice đã đóng: P4

> Lưu ý tránh hiểu nhầm: trạng thái strong phản ánh nền tảng kỹ thuật đã tốt, không phải phase đã hoàn tất toàn bộ phạm vi.

---

## 1. Snapshot hiện trạng

| Hạng mục | Thiết kế ban đầu | As-built hiện tại | Trạng thái |
|---|---|---|---|
| State machine | Idle/Drawing/Selected/Moving/Resizing | Đã có reducer state machine | Done |
| Serialization | JSON-safe DrawingObject | Đã có serialize/deserialize helpers | Done |
| History stack | Undo/Redo | Đã có history reducer | Done |
| Tool registry | Tool definition + factory | Đã có registry + built-ins lõi | Done |
| Tool catalog mở rộng | Ray/Rectangle/Triangle/... | Mới có nhóm lõi trend/hline/vline/fibonacci/channel/text | Partial |

---

## 2. Chênh lệch cần đóng

1. Catalog tool hiện chưa đạt đầy đủ như thiết kế ban đầu.
2. Chưa có lớp persistence adapter chuẩn trong chính module drawing.
3. Chưa có bộ story/interaction test bao phủ toàn bộ tool transitions nâng cao.

---

## 3. Bổ sung nên thêm

1. Tool maturity matrix:
   - Core-ready, Experimental, Backlog.
2. Persistence contract:
   - Interface lưu/tải/xóa drawings theo chart scope.
3. Interaction QA matrix:
   - Add/move/resize/delete/undo/redo cho từng tool.

---

## 4. Lộ trình tiếp theo

### M1 — Completeness
- Bổ sung Rectangle và ArrowMarker trước.
- Chuẩn hóa tool metadata cho toolbar mapping.

### M2 — Persistence
- Định nghĩa `DrawingStorage` contract public.
- Thêm adapter mẫu cho backend REST.

### M3 — UX hardening
- Keyboard shortcut map hoàn chỉnh.
- Lock/unlock và handle visibility behavior.
- Storybook interaction tests cho từng tool nhóm P0/P1.

---

## 5. Definition of Done (cập nhật)

- [x] State machine, history, serialization hoạt động.
- [x] Built-in tool lõi đã có test cơ bản.
- [x] Catalog tool cần cho delivery scope đã hoàn tất và có kiểm chứng.
- [x] Hạng mục catalog/persistence mở rộng được theo dõi ở post-v1 backlog.
