# Project Delivery Operating Model

## Mục đích

Đây là điểm vào của bộ tài liệu delivery. Điểm vào cấp repo là [../README.md](../README.md), còn trang này tập trung riêng cho runtime demo / widget / delivery slice.

Nếu cần biết khi nào được code ngay sau duyệt, hãy đọc [../CHANGE_CONTROL_STANDARD.md](../CHANGE_CONTROL_STANDARD.md) trước.

Nếu bạn là AI session mới, hãy đọc `AGENTS.md` trước, sau đó quay lại tài liệu này.

## Đường đọc chuẩn

### Đội code

| Bước | Tài liệu | Mục đích |
| --- | --- | --- |
| 1 | `HANDOFF_MANIFEST.md` | Chốt scope, deliverables và các tài liệu liên quan |
| 2 | `PROJECT_GOVERNANCE.md` | Luật bắt buộc và ranh giới không được phá |
| 3 | `TECH_SPEC.md` | Target architecture, contracts và behavior hiện trạng |
| 4 | `IMPLEMENTATION_PLAN.md` | Thứ tự slice và gate thực thi |
| 5 | `TASKBOARD.md` | Trạng thái việc hằng ngày |
| 6 | `HANDOFF_CHECKLIST.md` | Điều kiện bàn giao trước khi đóng slice |
| 7 | `AUDIT_PROTOCOL.md` | Validation, evidence và format báo cáo |
| 8 | `../upgrade-standard/AUDIT_LEDGER.md` | Ledger canonical cho file đã sửa và evidence |

### Đội audit

| Bước | Tài liệu | Mục đích |
| --- | --- | --- |
| 1 | `../../quality/QUALITY.md` | Chuẩn chất lượng và chống coverage theater |
| 2 | `../../quality/RUN_CODE_REVIEW.md` | Quy tắc review và format finding |
| 3 | `../../quality/RUN_INTEGRATION_TESTS.md` | Chuỗi validation tự động và smoke |
| 4 | `../../quality/RUN_SPEC_AUDIT.md` | Quy trình Council of Three |
| 5 | `PROJECT_GOVERNANCE.md` | Ranh giới và luật repo |
| 6 | `TECH_SPEC.md` | Spec để đối chiếu behavior |
| 7 | `AUDIT_PROTOCOL.md` | Mẫu evidence và gate commands |
| 8 | `../upgrade-standard/AUDIT_LEDGER.md` | Nguồn chứng cứ canonical |

### Khi task thuộc migration hoặc cleanup repo-wide

Đọc thêm `../upgrade-standard/HANDOFF_MANIFEST.md` sau tài liệu này để vào đúng luồng `upgrade-standard`.

## Nguồn sự thật canonical

| Chủ đề | Nguồn canonical |
| --- | --- |
| Scope của slice | `HANDOFF_MANIFEST.md` |
| Luật bắt buộc | `PROJECT_GOVERNANCE.md` |
| Kiến trúc và contract | `TECH_SPEC.md` |
| Thứ tự triển khai | `IMPLEMENTATION_PLAN.md` |
| Trạng thái việc | `TASKBOARD.md` |
| Điều kiện đóng slice | `HANDOFF_CHECKLIST.md` |
| Validation và evidence | `AUDIT_PROTOCOL.md` |
| Modified file list và ledger | `../upgrade-standard/AUDIT_LEDGER.md` |
| Repo inventory | `../../module_tree_full.md` |
| Indicator SSOT policy | `../planning/INDICATOR_SSOT_POLICY.md` |

## Luồng làm việc chuẩn

1. Xác định slice và anchor kỹ thuật gần nhất.
2. Đọc đúng bộ tài liệu tương ứng với slice đó, không mở rộng scope sớm.
3. Mở code ở điểm kiểm soát hành vi gần nhất, rồi chỉ sửa slice đó.
4. Chạy validation hẹp ngay sau edit đầu tiên để kiểm tra giả thuyết local.
5. Khi task xong, cập nhật `AUDIT_LEDGER.md` với danh sách file đã sửa, validation và risk còn lại.
6. Nếu thay đổi chạm source code, regenerate `module_tree_full.md` trước khi bàn giao.

## Điều kiện bàn giao

Một task chỉ được coi là hoàn tất khi có đủ các mục sau:

- Modified file list rõ ràng trong `../upgrade-standard/AUDIT_LEDGER.md`.
- Mô tả behavior mới hoặc behavior đã sửa.
- Validation command và kết quả.
- Risk còn tồn đọng, nếu có.
- Link đúng tới spec và audit docs liên quan.

## Quy tắc chống lệch mục tiêu

- Không thêm text UI mới nếu chưa đi qua i18n key.
- Không để `src/lib/**` import ngược từ `src/demo/**`.
- Không dùng build pass làm bằng chứng duy nhất nếu behavior chưa khớp spec.
- Không đóng slice nếu thiếu audit ledger hoặc thiếu modified file list.
- Nếu task đã được duyệt trong change-control standard, đội code có thể bắt đầu ngay mà không cần hỏi lại các quyết định đã chốt.