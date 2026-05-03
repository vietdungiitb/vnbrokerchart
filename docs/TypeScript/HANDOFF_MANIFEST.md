# Handoff Manifest: TypeScript Library Delivery

> Đây là cổng vào duy nhất cho đội code và AI code trước khi bắt đầu thực thi kế hoạch TypeScript.
>
> Trình tự đọc bắt buộc: [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) → [HANDOFF_MANIFEST.md](./HANDOFF_MANIFEST.md) → [ROADMAP.md](./ROADMAP.md) → [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) → [EXECUTION_RUNBOOK.md](./EXECUTION_RUNBOOK.md) → [SELF_AUDIT_PLAYBOOK.md](./SELF_AUDIT_PLAYBOOK.md) → [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 1. Mục đích của bộ handoff

- Đưa ra một bộ tài liệu đủ để đội code bắt tay vào thực thi mà không cần hỏi lại.
- Gắn chặt kế hoạch thực hiện với audit, test, evidence, và closeout.
- Ép mọi slice code đi qua cùng một cổng kiểm soát: rules → plan → taskboard → test matrix → slice audit → ledger.

---

## 2. Bộ tài liệu bàn giao

| File | Vai trò | Trạng thái |
| :--- | :--- | :--- |
| [ROADMAP.md](./ROADMAP.md) | Tổng quan lộ trình theo phase | Approved |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Kế hoạch thực hiện chi tiết theo slice | Approved |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Kiến trúc đích và quyết định thiết kế | Approved |
| [ARCHITECTURE_GUARDS.md](./ARCHITECTURE_GUARDS.md) | G01–G15 ALLOWED/FORBIDDEN cụ thể, detection commands | Mandatory |
| [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) | Quy định bắt buộc cho team và AI | Mandatory |
| [AUDIT_LEDGER.md](./AUDIT_LEDGER.md) | Sổ đăng ký slice, evidence và gate | Ready |
| [AUDIT_TEST_MATRIX.md](./AUDIT_TEST_MATRIX.md) | Ma trận test cho từng slice | Ready |
| [SLICE_AUDIT.md](./SLICE_AUDIT.md) | Template minh chứng từng slice | Ready |
| [EXECUTION_RUNBOOK.md](./EXECUTION_RUNBOOK.md) | Runbook thực thi end-to-end không cần hỏi lại | Ready |
| [SELF_AUDIT_PLAYBOOK.md](./SELF_AUDIT_PLAYBOOK.md) | Playbook tự audit và mẫu minh chứng bắt buộc | Ready |
| [TASKBOARD.md](./TASKBOARD.md) | Bảng công việc triển khai + per-task execution spec | Ready |
| [DELIVERY_CLOSEOUT.md](./DELIVERY_CLOSEOUT.md) | Điều kiện đóng bàn giao | Ready |

---

## 3. Slice map theo kế hoạch đã phê duyệt

| Slice | Mục tiêu | Deliverable chính | Test gate | Evidence cần có |
| :--- | :--- | :--- | :--- | :--- |
| P0 | Audit & chuẩn hóa | Doc set, inventory, rules, manifest | Link check, module tree check | Audit block P0 trong [SLICE_AUDIT.md](./SLICE_AUDIT.md) |
| P1 | Foundation | tsup, strict TS, entrypoint, public types | `type-check`, `tsup` build | Evidence P1 |
| P2 | Chart shell | ChartTerminal, ChartPane, PaneSplitter, usePaneManager | RTL + browser smoke | Evidence P2 |
| P3 | Indicator registry | Registry, compute/render split, built-ins | Unit tests + schema tests | Evidence P3 |
| P4 | Drawing tools | State machine, serialize, undo/redo | Interaction tests | Evidence P4 |
| P5 | Data adapter | Django/vnstock adapter, realtime loader | Contract + integration tests | Evidence P5 |
| P6 | Examples conversion | Stories/regressions từ examples | Visual + browser smoke | Evidence P6 |

---

## 4. Cách dùng bộ tài liệu

1. Đọc [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) để biết cấm gì và phải làm gì.
2. Đọc [ARCHITECTURE_GUARDS.md](./ARCHITECTURE_GUARDS.md) để biết G01–G15 ALLOWED/FORBIDDEN áp dụng cho slice nào.
3. Đọc manifest này để biết phải mở tài liệu nào tiếp theo.
4. Đọc [ROADMAP.md](./ROADMAP.md) và [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) để xác định slice hiện tại.
5. Mở [EXECUTION_RUNBOOK.md](./EXECUTION_RUNBOOK.md) để chạy đúng quy trình thực thi và handover.
6. Mở [TASKBOARD.md](./TASKBOARD.md) để lấy thứ tự triển khai, dependency và per-task execution spec.
7. Mở [AUDIT_TEST_MATRIX.md](./AUDIT_TEST_MATRIX.md) để biết test bắt buộc.
8. Mở [SELF_AUDIT_PLAYBOOK.md](./SELF_AUDIT_PLAYBOOK.md) để điền minh chứng đúng chuẩn PASS/FAIL.
9. Sau khi code xong, điền [SLICE_AUDIT.md](./SLICE_AUDIT.md) và cập nhật [AUDIT_LEDGER.md](./AUDIT_LEDGER.md).
10. Kết thúc bằng [DELIVERY_CLOSEOUT.md](./DELIVERY_CLOSEOUT.md) khi toàn bộ slice đã pass.

---

## 5. Quy tắc handoff không được bỏ qua

- Không bắt đầu slice nếu chưa đọc `module_tree_full.md`, `HANDOFF_MANIFEST.md` và `ARCHITECTURE_GUARDS.md`.
- Không chốt task nếu chưa có entry tương ứng trong `SLICE_AUDIT.md`.
- Không nhận slice mới nếu `AUDIT_LEDGER.md` chưa phản ánh slice trước đó.
- Không để taskboard và test matrix lệch nhau.
- Không coi task là hoàn tất nếu chưa có evidence và module tree đã cập nhật khi chạm source code.
- Không merge code khi detection commands trong ARCHITECTURE_GUARDS.md vẫn có output bất thường.
