# Execution Runbook: Zero-Question Handoff

> Mục tiêu: cho phép đội code thực thi trọn vẹn từ P0 đến P6 (và closeout) mà không cần hỏi lại owner.
>
> Entry point: [HANDOFF_MANIFEST.md](./HANDOFF_MANIFEST.md)

---

## 1. Phạm vi tài liệu này

- Quy trình vận hành chuẩn cho từng slice công việc.
- Input/Output bắt buộc để chuyển giao giữa các role.
- Danh sách artifact phải nộp để close task và close slice.

Tài liệu này không thay thế quy tắc. Mọi thao tác vẫn phải tuân thủ:

- [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)
- [ARCHITECTURE_GUARDS.md](./ARCHITECTURE_GUARDS.md)
- [TASKBOARD.md](./TASKBOARD.md)
- [AUDIT_TEST_MATRIX.md](./AUDIT_TEST_MATRIX.md)

---

## 2. Vai trò và trách nhiệm

| Role | Trách nhiệm chính | Bàn giao đầu ra |
| :--- | :--- | :--- |
| Slice owner | Thực thi kỹ thuật theo đúng scope slice | Code + test pass + evidence block |
| QA owner | Kiểm tra gate test và guard detection | Gate status, issue list, rerun note |
| Release owner | Đối chiếu ledger/taskboard/closeout | Cập nhật trạng thái và kết luận PASS/FAIL |

---

## 3. Input bắt buộc trước khi bắt đầu một slice

1. Xác định đúng task id trong [TASKBOARD.md](./TASKBOARD.md).
2. Xác định dependency task đã Completed.
3. Đọc lại module inventory mới nhất trong [module_tree_full.md](../module_tree_full.md).
4. Xác định nhóm guard áp dụng từ [ARCHITECTURE_GUARDS.md](./ARCHITECTURE_GUARDS.md).
5. Xác định test gate bắt buộc từ [AUDIT_TEST_MATRIX.md](./AUDIT_TEST_MATRIX.md).

Nếu thiếu 1 trong 5 đầu vào trên, không được chuyển task sang In progress.

---

## 4. Quy trình thực thi chuẩn cho mỗi slice

## B1 - Scope lock

- Khóa file được phép sửa và file không được chạm theo task spec.
- Chốt command validation cần chạy.
- Chốt artifact cần nộp sau khi xong.

## B2 - Implement

- Thực thi thay đổi nhỏ nhất có thể.
- Không refactor rộng ngoài scope slice.
- Không đổi API public nếu task không yêu cầu.

## B3 - Validate

- Chạy mandatory test gate của task.
- Chạy detection command cho các guard áp dụng.
- Nếu fail: sửa ngay trong cùng slice, không nhảy slice.

## B4 - Evidence

- Điền block minh chứng vào [SLICE_AUDIT.md](./SLICE_AUDIT.md).
- Cập nhật modified-file list và trạng thái vào [AUDIT_LEDGER.md](./AUDIT_LEDGER.md).
- Nếu chạm source code: cập nhật [module_tree_full.md](../module_tree_full.md).

## B5 - Handover

- Cập nhật trạng thái task trong [TASKBOARD.md](./TASKBOARD.md).
- Đảm bảo ledger và taskboard không lệch.
- Xác nhận điều kiện close gate theo [DELIVERY_CLOSEOUT.md](./DELIVERY_CLOSEOUT.md).

---

## 5. Artifact bắt buộc khi đóng task

Mỗi task chuyển sang Completed phải có đủ 6 artifact:

1. Danh sách file đã sửa.
2. Danh sách command đã chạy.
3. Kết quả quan sát (không chỉ PASS/FAIL).
4. Danh sách guard đã kiểm tra.
5. Rủi ro còn lại.
6. Kết luận PASS/FAIL và lý do.

Thiếu 1 artifact thì task được xem là chưa hoàn tất.

---

## 6. Definition of Done theo cấp

| Cấp | Điều kiện Done |
| :--- | :--- |
| File-level | Build/typecheck không lỗi trong phạm vi thay đổi |
| Task-level | Mandatory gate pass + evidence đủ 6 artifact |
| Slice-level | Tất cả task trong slice đã Completed + ledger cập nhật |
| Release-level | Tất cả P0-P6 PASS + closeout checklist đầy đủ |

---

## 7. Hand-off packet bắt buộc cho đội code

Trước khi bắt đầu coding, đội code phải có đầy đủ packet sau:

- [HANDOFF_MANIFEST.md](./HANDOFF_MANIFEST.md)
- [ROADMAP.md](./ROADMAP.md)
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- [TASKBOARD.md](./TASKBOARD.md)
- [AUDIT_TEST_MATRIX.md](./AUDIT_TEST_MATRIX.md)
- [SLICE_AUDIT.md](./SLICE_AUDIT.md)
- [SELF_AUDIT_PLAYBOOK.md](./SELF_AUDIT_PLAYBOOK.md)
- [DELIVERY_CLOSEOUT.md](./DELIVERY_CLOSEOUT.md)

Nếu packet không đầy đủ, phải bổ sung trước khi bắt đầu.

---

## 8. Escalation không hỏi lại owner

Khi gặp tình huống mơ hồ, đội code xử lý theo thứ tự:

1. Ưu tiên quy tắc hard-stop trong [ARCHITECTURE_GUARDS.md](./ARCHITECTURE_GUARDS.md).
2. Nếu xung đột, ưu tiên [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md).
3. Nếu vẫn mơ hồ, chọn phương án an toàn hơn và ghi rõ giả định vào evidence.
4. Không tự ý mở rộng scope task.

---

## 9. Quick start 10 phút

1. Mở [HANDOFF_MANIFEST.md](./HANDOFF_MANIFEST.md).
2. Kiểm tra task tiếp theo trong [TASKBOARD.md](./TASKBOARD.md).
3. Kiểm tra mandatory tests trong [AUDIT_TEST_MATRIX.md](./AUDIT_TEST_MATRIX.md).
4. Kiểm tra guard detection command trong [ARCHITECTURE_GUARDS.md](./ARCHITECTURE_GUARDS.md).
5. Implement theo scope lock.
6. Điền evidence vào [SLICE_AUDIT.md](./SLICE_AUDIT.md) và [AUDIT_LEDGER.md](./AUDIT_LEDGER.md).
