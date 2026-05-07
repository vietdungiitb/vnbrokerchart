# Handoff Manifest — Canvas DrawTools Next (CE-NEXT)

> **Trạng thái:** Đề xuất — chờ phê duyệt
> **Phiên bản:** 0.1 · 2026-05-06
> **Entry point repo:** [docs/upgrade-standard/README.md](../README.md)
> **Phụ thuộc bắt buộc:** CE-series hoàn tất tại [../canvas-drawtools/HANDOFF_MANIFEST.md](../canvas-drawtools/HANDOFF_MANIFEST.md)
> **Mục tiêu đọc:** Người quyết định · Kỹ sư trưởng · QA/Audit lead

---

## 1. Tại sao phải tiếp tục

CE-series đã hoàn thành phần nền: renderer canvas, hit testing, snap, inspector, audit và smoke. Nhưng nhìn từ góc độ người dùng thực chiến, drawtools vẫn chưa đạt mức "editor" mà mới đạt mức "renderable object".

Các gap còn lại không còn nằm ở render path nữa mà nằm ở vòng đời tương tác của object:

| Gap hiện tại | Ảnh hưởng thực tế | Vì sao phải làm tiếp |
|---|---|---|
| Không drag-move được drawing đã vẽ | Mỗi sai một điểm là phải xóa và vẽ lại | Phá flow phân tích, chart nhanh chóng biến thành rác |
| Không resize được qua handle | Trendline, rectangle, fib, text khó hiệu chỉnh chính xác | Không đạt được thao tác như TradingView |
| Không delete/copy/paste trực tiếp | Xóa / nhân bản phải qua đường vòng | Tốn thao tác, không phù hợp power-user workflow |
| Không có price label trên Y-axis | Stop/target/trendline thiếu ngữ nghĩa giá | Người dùng phải đoán hoặc zoom quá nhiều |
| Không có shortcut, context menu, measuring tool | Thao tác chậm, thiếu công cụ đọc nhanh | Không đủ để dùng hằng ngày |
| Không hỗ trợ indicator panes | RSI/MACD workflow bị bỏ trống | Không phải chart editor hoàn chỉnh |

Kết luận thẳng: nếu dừng ở CE-10, drawtools vẫn hữu ích cho demo và vẽ cơ bản, nhưng chưa đủ để dùng làm công cụ phân tích chính thức.

---

## 2. Mục tiêu của CE-NEXT

CE-NEXT biến drawtools từ "đã vẽ xong thì gần như bất biến" thành "đối tượng có thể chỉnh sửa, tái sử dụng và thao tác nhanh".

### Mục tiêu sản phẩm

- Cho phép drag để move bất kỳ drawing nào đã chọn.
- Cho phép resize qua handle theo đúng tool semantics.
- Cho phép xóa, nhân bản, copy/paste và đổi thứ tự layer ngay trên chart.
- Hiển thị price label trên axis để drawing có ý nghĩa giao dịch rõ ràng.
- Có context menu, keyboard shortcuts và measuring tool để giảm thao tác thừa.
- Hỗ trợ vẽ trên indicator panes như RSI, MACD, Strength, Volume pane.

### Mục tiêu kỹ thuật

- Giữ nguyên CE canvas engine hiện có làm nền tảng.
- Không tạo kiến trúc song song mới như `src/lib/drawEngine/`.
- Mở rộng đúng cụm `src/lib/drawing/` và các adapter liên quan.
- Không phá hành vi CE-10 đã xác nhận.

---

## 3. Phạm vi

### In scope

| File / surface | Việc cần làm |
|---|---|
| `src/lib/drawing/useDrawingInteraction.ts` | Thêm logic move/resize/delete/copy/paste/lock/z-order |
| `src/lib/drawing/DrawingLayer.tsx` | Bổ sung drag body, handle resize, selection semantics |
| `src/lib/drawing/DrawingInspector.tsx` | Thêm action editing sâu hơn: duplicate, delete, lock, bring-to-front |
| `src/lib/drawing` mới | Interaction controller, handle map, price labels, measuring, shortcuts, context menu |
| `src/lib/ChartCanvas.tsx` / `src/lib/core/DynamicChart.tsx` | Support pane-aware coordinates và editor hooks |
| `src/demo/LibraryShowcaseDemo.tsx` | Wire toolbar shortcuts, menu state, pane routing |
| `src/demo/i18n.tsx` | Thêm key cho menu, shortcut hint, measuring tool, axis label |

### Out of scope

- Collaboration multi-user / realtime sync.
- Marketplace, template sharing public.
- Mobile gesture parity đầy đủ.
- Viết lại renderer canvas hiện có.
- Đổi toàn bộ drawing model sang backend-first storage.

---

## 4. Deliverables

| File | Vai trò |
|---|---|
| `HANDOFF_MANIFEST.md` | Entry point, mục tiêu và ranh giới |
| `TECH_SPEC.md` | Target architecture, state model, contracts |
| `IMPLEMENTATION_PLAN.md` | 3 sprint CE-11→CE-13 với gate rõ ràng |
| `TASKBOARD.md` | Taskboard tác chiến hằng ngày |
| `AUDIT_PROTOCOL.md` | Validation, smoke và evidence template |

---

## 5. Quyết định đã chốt

1. **CE-NEXT là phần tiếp theo của cùng một drawtools stack.** Không tạo engine thứ hai.
2. **Move/resize/deletion là ưu tiên số 1.** Nếu không chỉnh sửa được drawing đã vẽ, mọi tính năng khác đều bị giảm giá trị.
3. **Axis label và shortcut chỉ có ý nghĩa khi object editing ổn định.** Vì vậy CE-11 phải xong trước CE-12.
4. **Indicator panes là phase riêng sau object editing.** Không nhảy sớm sang pane support nếu chưa làm xong lifecycle của drawing.
5. **i18n là bắt buộc.** Không thêm text UI mới bằng hardcode.
6. **Không phá CE-10.** Mọi mở rộng phải additive và backward compatible.

---

## 6. Kết quả mong đợi sau CE-NEXT

- Người dùng kéo một trendline đã vẽ để chỉnh lại vị trí thay vì xóa đi vẽ lại.
- Người dùng kéo handle để chỉnh rectangle, fib, text và các shape phức tạp.
- Người dùng xóa / copy / paste drawing bằng keyboard hoặc context menu.
- Người dùng nhìn thấy giá trị trên Y-axis mà không cần mở inspector.
- Người dùng vẽ được trên RSI/MACD panes đúng scale hiện hành.
- User flow thực tế gần hơn đáng kể với TradingView/GoCharting.

---

## 7. Ràng buộc chất lượng

- `npm run type-check` phải pass trước khi đóng mỗi sprint.
- `npm test` phải pass, không thêm regression vào CE-series.
- `npm run build:docs` phải pass trước bàn giao.
- `python scripts/generate_module_tree.py` phải chạy lại khi source thay đổi.
- Audit ledger phải ghi đầy đủ file sửa và residual risk.

---

## 8. Cấu trúc lộ trình

```
CE-10 (nền tảng canvas/hitTest/snap) ✅ done
  ↓
CE-11 (object editing core)
  ↓
CE-12 (Trading UX layer)
  ↓
CE-13 (indicator panes + pane-aware workflow)
```

---

## 9. Kết luận

CE-NEXT không phải "thêm tính năng cho vui". Đây là phần còn thiếu để drawtools trở thành công cụ làm việc thật: chỉnh sửa được, xoá được, nhân bản được, đọc được giá trị, và dùng được trên mọi pane quan trọng.

Nếu CE-10 trả lời câu hỏi "có thể vẽ không?", thì CE-NEXT trả lời câu hỏi "có dùng được hàng ngày không?".
