# Audit Protocol — Indicator Platform GĐ1

## 1. Mục tiêu

Mỗi slice IC-1 hoặc IC-2 phải để lại đủ evidence để audit trả lời nhanh 3 câu hỏi:

1. Đã thay đổi gì.
2. Thay đổi đó có đúng spec và plan không.
3. Có thể verify lại nhanh bằng lệnh nào.

---

## 2. Evidence bắt buộc

Mỗi slice hoàn tất phải có:

- Danh sách file đã sửa
- Mô tả hành vi trước / sau
- Kết quả validation
- Risk còn tồn đọng
- Link tới entry tương ứng trong `docs/upgrade-standard/AUDIT_LEDGER.md`
- Nếu chạm source trong `src/`, phải regenerate `module_tree_full.md`

---

## 3. Validation chuẩn

Chạy từ root repo:

```bash
npm run type-check
npm test
npm run build:docs
python scripts/generate_module_tree.py
```

### Bổ sung theo slice

- **IC-1:** so sánh output canonical trên fixture trước/sau refactor; nếu có benchmark helper thì ghi runtime không được chậm hơn đáng kể.
- **IC-2:** browser smoke settings modal; xác nhận field render từ `inputSchema` và label hiển thị đúng `vi/en`.

---

## 4. Smoke checklist

### IC-1

- Dữ liệu indicator hiện tại không đổi shape.
- `buildIndicatorSeriesKey()` vẫn là canonical key.
- Không có regression ở test hiện có.

### IC-2

- Mở settings modal của pane indicator.
- Form fields render đúng theo catalog schema.
- Đổi locale `vi/en` không làm mất label của catalog.

---

## 5. Template audit note

```text
Scope:
Changed files:
Behavioral change:
Validation:
Residual risk:
Ledger link:
```

---

## 6. Quy tắc đóng slice

Không được đóng IC-1 hoặc IC-2 nếu thiếu một trong các mục sau:

- `AUDIT_LEDGER.md` đã có entry mới
- `module_tree_full.md` đã regenerate khi chạm source
- Có validation output rõ ràng
- Có note residual risk nếu còn phần chưa khóa
