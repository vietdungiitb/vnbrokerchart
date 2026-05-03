# Self Audit Playbook: Minh Chung Slice Khong Hoi Lai

> Mục tiêu: chuẩn hóa cách tự audit cho mỗi slice để đội code tự kiểm chứng và bàn giao có bằng chứng đủ.
>
> Tài liệu này được dùng cùng [SLICE_AUDIT.md](./SLICE_AUDIT.md) và [AUDIT_LEDGER.md](./AUDIT_LEDGER.md).

---

## 1. Nguyên tắc tự audit

- Bằng chứng phải lặp lại được.
- Mọi kết luận PASS phải có command và output quan sát.
- Nếu có giả định, phải ghi rõ trong phần Rủi ro còn lại.
- Không được báo PASS nếu chưa chạy mandatory gates.

---

## 2. Bộ hồ sơ minh chứng chuẩn cho mỗi slice

Mỗi block minh chứng trong [SLICE_AUDIT.md](./SLICE_AUDIT.md) phải có đủ:

1. Người thực hiện.
2. Ngày thực hiện.
3. Slice và mục tiêu.
4. Danh sách file touched.
5. Danh sách command xác minh.
6. Kết quả quan sát.
7. Guard checks đã chạy.
8. Rủi ro còn lại.
9. Kết luận PASS/FAIL.

---

## 3. Mandatory gates theo slice

| Slice | Gates bắt buộc |
| :--- | :--- |
| P0 | link check, module tree inventory |
| P1 | type-check, build tsup, export smoke |
| P2 | pane manager tests, shell smoke, resize checks |
| P3 | indicator unit tests, registry smoke |
| P4 | drawing state machine tests, serialize/undo-redo |
| P5 | adapter contract tests, mocked REST/WS path |
| P6 | build storybook, browser smoke, visual coverage map |

Chi tiết mapping xem thêm [AUDIT_TEST_MATRIX.md](./AUDIT_TEST_MATRIX.md).

---

## 4. Mức score tự audit

Dùng thang điểm này trước khi đánh PASS:

- 0 điểm: chưa có evidence.
- 1 điểm: có command nhưng output mơ hồ.
- 2 điểm: command + output rõ nhưng thiếu guard checks.
- 3 điểm: đầy đủ command, output, guard, và rủi ro.

Slice chỉ được đóng khi đạt 3/3.

---

## 5. Mẫu biên bản tự audit (copy/paste)

```text
Nguoi thuc hien:
Ngay:
Slice:
Muc tieu:

Files touched:
  -

Mandatory gates:
  -

Commands da chay:
  -

Ket qua quan sat:
  -

Guard checks:
  - Guard:
    Command:
    Ket qua:

Rui ro con lai:

Audit score: 0/1/2/3
Ket luan: PASS / FAIL
```

---

## 6. Checklist nhanh trước khi ghi PASS

- [ ] Đã chạy đủ mandatory gates của slice.
- [ ] Đã đối chiếu guard detection command từ [ARCHITECTURE_GUARDS.md](./ARCHITECTURE_GUARDS.md).
- [ ] Đã ghi rõ kết quả quan sát (không chỉ PASS).
- [ ] Đã liệt kê đủ file touched.
- [ ] Đã cập nhật [AUDIT_LEDGER.md](./AUDIT_LEDGER.md).
- [ ] Nếu chạm source, đã cập nhật [module_tree_full.md](../module_tree_full.md).

---

## 7. Quy tắc FAIL bắt buộc

Phải đánh FAIL nếu gặp một trong các trường hợp:

- Chưa chạy mandatory gate nhưng vẫn đánh PASS.
- Có vi phạm hard-stop guard.
- Không có modified-file list.
- Không có output quan sát cho command chính.
- Ledger và evidence block không đồng bộ.

---

## 8. Tự audit cho TB-08 và TB-09

## TB-08 (Scale/perf soak)

- Bắt buộc ghi rõ baseline và ngưỡng chấp nhận.
- Bắt buộc có số liệu p95 hoặc percentile tương đương.
- Bắt buộc ghi memory trend khi mở/rộng pane và subscribe websocket.

## TB-09 (Closeout)

- Bắt buộc check tất cả gate trong [DELIVERY_CLOSEOUT.md](./DELIVERY_CLOSEOUT.md).
- Bắt buộc xác nhận không còn output bất thường từ detection commands.
- Bắt buộc chốt handoff bundle đầy đủ.
