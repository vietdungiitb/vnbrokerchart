# Handoff Manifest: Pane Splitter Resize (GoCharting-style)

## 1. Mục tiêu

Bàn giao bộ tài liệu thực thi tính năng splitter cho phép kéo thay đổi chiều cao các pane kỹ thuật trên demo chart, hành vi tương tự GoCharting.

Phạm vi hiện tại tập trung vào khu vực chart demo tại src/demo/LibraryShowcaseDemo.tsx.

## 2. Bộ tài liệu bàn giao

| File | Vai trò |
| :--- | :--- |
| [TECH_SPEC.md](TECH_SPEC.md) | Đặc tả kỹ thuật và hành vi UI/UX bắt buộc |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Kế hoạch triển khai theo phase và gate |
| [TASKBOARD.md](TASKBOARD.md) | Backlog task chi tiết cho đội code |
| [AUDIT_PROTOCOL.md](AUDIT_PROTOCOL.md) | Quy trình kiểm chứng, test matrix, evidence cần nộp |

## 3. Định nghĩa Done

1. Người dùng kéo splitter giữa các pane dưới price pane để thay đổi chiều cao theo thời gian thực.
2. Không pane nào bị tụt về 0 chiều cao (enforce minHeight).
3. Layout pane vẫn ổn định khi đổi timeframe, đổi chart type, resize cửa sổ.
4. Có chức năng reset layout mặc định bằng double-click splitter.
5. Layout được lưu và khôi phục sau reload.
6. Tất cả test trong AUDIT_PROTOCOL pass.

## 4. Quy trình thực thi bắt buộc

1. Đọc TECH_SPEC trước khi code.
2. Thực hiện theo thứ tự phase trong IMPLEMENTATION_PLAN.
3. Tick task trực tiếp trong TASKBOARD khi hoàn thành.
4. Thu thập evidence theo AUDIT_PROTOCOL trước khi mở PR.
5. Cập nhật docs/upgrade-standard/AUDIT_LEDGER.md khi kết thúc.

## 5. Deliverable code kỳ vọng

- Logic state chia pane theo tỉ lệ.
- Splitter UI có drag interaction với pointer events.
- Min-height guard + clamp algorithm.
- Persist layout (local storage).
- Bộ test/kiểm chứng đầy đủ theo protocol.

## 6. Handoff owner

- Product owner: Demo chart UX
- Implementation owner: Frontend chart team
- Audit owner: QA + Tech lead
