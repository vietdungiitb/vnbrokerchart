# Upgrade Standard Operating Model

## Mục đích

Đây là entry point cho chương trình migration và cleanup repo-wide. Nếu task không thuộc chuyển đổi kỹ thuật hoặc gate G1/G2/G3, hãy quay lại [../README.md](../README.md) để chọn luồng đúng.

Khi cần biết một task đã đủ điều kiện code hay chưa, đọc thêm [../CHANGE_CONTROL_STANDARD.md](../CHANGE_CONTROL_STANDARD.md).

## Đường đọc chuẩn

1. [../README.md](../README.md)
2. [HANDOFF_MANIFEST.md](HANDOFF_MANIFEST.md)
3. [TECH_SPEC.md](TECH_SPEC.md)
4. [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
5. [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
6. [TASKBOARD.md](TASKBOARD.md)
7. [BACKLOG.md](BACKLOG.md)
8. [SLICE_AUDIT.md](SLICE_AUDIT.md)
9. [AUDIT_LEDGER.md](AUDIT_LEDGER.md)
10. [DELIVERY_CLOSEOUT.md](DELIVERY_CLOSEOUT.md)

## Cách dùng bộ tài liệu này

### Khi làm migration code

- Chọn slice trong [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).
- Kéo task sang đúng lane trong [TASKBOARD.md](TASKBOARD.md).
- Ghi evidence vào [SLICE_AUDIT.md](SLICE_AUDIT.md) sau mỗi slice.
- Cập nhật [AUDIT_LEDGER.md](AUDIT_LEDGER.md) trước khi đóng việc.
- Chạy các gate theo [DELIVERY_CLOSEOUT.md](DELIVERY_CLOSEOUT.md) khi chuẩn bị release.

### Khi làm review hoặc audit

- Bắt đầu ở [../quality/QUALITY.md](../quality/QUALITY.md).
- Dùng [../quality/RUN_CODE_REVIEW.md](../quality/RUN_CODE_REVIEW.md) để review các finding.
- Dùng [../quality/RUN_INTEGRATION_TESTS.md](../quality/RUN_INTEGRATION_TESTS.md) cho validation tự động và smoke.
- Dùng [../quality/RUN_SPEC_AUDIT.md](../quality/RUN_SPEC_AUDIT.md) cho Council of Three.

## Quy tắc vận hành

- Không bắt đầu Giai đoạn 2 trước khi Gate G1 pass.
- Không bắt đầu Giai đoạn 3 trước khi Gate G2 pass.
- Không đóng slice nếu thiếu evidence trong AUDIT_LEDGER.
- Không thêm scope mới nếu BACKLOG không có task tương ứng.
- Nếu task đã được duyệt trong change-control standard, có thể code trực tiếp theo plan mà không cần hỏi lại từng bước nhỏ.

## Tài liệu liên quan

- [../project-delivery/README.md](../project-delivery/README.md)
- [../project-delivery/HANDOFF_MANIFEST.md](../project-delivery/HANDOFF_MANIFEST.md)
- [../project-delivery/PROJECT_GOVERNANCE.md](../project-delivery/PROJECT_GOVERNANCE.md)
- [../project-delivery/TECH_SPEC.md](../project-delivery/TECH_SPEC.md)