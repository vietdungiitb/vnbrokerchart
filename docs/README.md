# Repository Docs Hub

## Mục đích

Đây là cổng vào cấp repo cho toàn bộ tài liệu vận hành, delivery, migration và audit. Nếu bạn là thành viên mới của đội code hoặc đội audit, hãy bắt đầu từ đây để tránh đọc sai bộ tài liệu cho đúng loại công việc.

## Quy ước hiệu lực

- Luật cứng cấp cao nhất cho hành vi dự án nằm ở [project-delivery/PROJECT_GOVERNANCE.md](project-delivery/PROJECT_GOVERNANCE.md).
- Quy tắc phê duyệt và code-go nằm ở [CHANGE_CONTROL_STANDARD.md](CHANGE_CONTROL_STANDARD.md).
- Chuẩn chất lượng và ngưỡng chặn release nằm ở [../quality/QUALITY.md](../quality/QUALITY.md).
- Ledger chứng cứ và modified-file register nằm ở [upgrade-standard/AUDIT_LEDGER.md](upgrade-standard/AUDIT_LEDGER.md).
- Nếu một task đã có trong plan hoặc taskboard, đội code được phép triển khai trực tiếp theo tài liệu mà không cần hỏi lại từng bước nhỏ.
- Nếu task đòi hỏi contract mới, data-source mới, hoặc scope vượt plan hiện có, phải cập nhật tài liệu hiệu lực trước khi code.

## Chọn đúng luồng

### 1. Delivery và runtime UI

Đọc theo thứ tự:

1. [project-delivery/README.md](project-delivery/README.md)
2. [project-delivery/HANDOFF_MANIFEST.md](project-delivery/HANDOFF_MANIFEST.md)
3. [project-delivery/PROJECT_GOVERNANCE.md](project-delivery/PROJECT_GOVERNANCE.md)
4. [project-delivery/TECH_SPEC.md](project-delivery/TECH_SPEC.md)
5. [project-delivery/IMPLEMENTATION_PLAN.md](project-delivery/IMPLEMENTATION_PLAN.md)
6. [project-delivery/TASKBOARD.md](project-delivery/TASKBOARD.md)
7. [project-delivery/HANDOFF_CHECKLIST.md](project-delivery/HANDOFF_CHECKLIST.md)
8. [project-delivery/AUDIT_PROTOCOL.md](project-delivery/AUDIT_PROTOCOL.md)
9. [upgrade-standard/AUDIT_LEDGER.md](upgrade-standard/AUDIT_LEDGER.md)

### 2. Migration và repo-wide cleanup

Đọc theo thứ tự:

1. [upgrade-standard/README.md](upgrade-standard/README.md)
2. [upgrade-standard/HANDOFF_MANIFEST.md](upgrade-standard/HANDOFF_MANIFEST.md)
3. [upgrade-standard/TECH_SPEC.md](upgrade-standard/TECH_SPEC.md)
4. [upgrade-standard/MIGRATION_GUIDE.md](upgrade-standard/MIGRATION_GUIDE.md)
5. [upgrade-standard/IMPLEMENTATION_PLAN.md](upgrade-standard/IMPLEMENTATION_PLAN.md)
6. [upgrade-standard/TASKBOARD.md](upgrade-standard/TASKBOARD.md)
7. [upgrade-standard/BACKLOG.md](upgrade-standard/BACKLOG.md)
8. [upgrade-standard/SLICE_AUDIT.md](upgrade-standard/SLICE_AUDIT.md)
9. [upgrade-standard/AUDIT_LEDGER.md](upgrade-standard/AUDIT_LEDGER.md)
10. [upgrade-standard/DELIVERY_CLOSEOUT.md](upgrade-standard/DELIVERY_CLOSEOUT.md)

### 3. Quality và audit

Đọc theo thứ tự:

1. [../quality/QUALITY.md](../quality/QUALITY.md)
2. [../quality/RUN_CODE_REVIEW.md](../quality/RUN_CODE_REVIEW.md)
3. [../quality/RUN_INTEGRATION_TESTS.md](../quality/RUN_INTEGRATION_TESTS.md)
4. [../quality/RUN_SPEC_AUDIT.md](../quality/RUN_SPEC_AUDIT.md)

## Quy tắc điều hướng

- Nếu task chạm demo shell, pane orchestration, i18n, widget boundary, hoặc data fidelity runtime, bắt đầu ở luồng delivery.
- Nếu task chạm TypeScript migration, rename hàng loạt, cleanup JS legacy, hoặc gate G1/G2/G3, bắt đầu ở luồng migration.
- Nếu task là review hoặc audit, bắt đầu ở luồng quality rồi quay lại đúng docs delivery/migration để đối chiếu.

## Tài liệu nền bắt buộc

- [../AGENTS.md](../AGENTS.md)
- [../module_tree_full.md](../module_tree_full.md)
- [CHANGE_CONTROL_STANDARD.md](CHANGE_CONTROL_STANDARD.md)
- [planning/INDICATOR_SSOT_POLICY.md](planning/INDICATOR_SSOT_POLICY.md)

## Định nghĩa hoàn tất ở mức repo

Một thay đổi chỉ được coi là xong khi:

- Có file index đúng luồng cho loại task đó.
- Có `AUDIT_LEDGER.md` ghi modified file list và validation.
- Có command gate phù hợp với slice hoặc subsystem.
- Có risk còn tồn đọng được ghi rõ, nếu vẫn còn.