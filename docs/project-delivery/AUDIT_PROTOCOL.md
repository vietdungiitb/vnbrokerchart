# Audit Protocol

## 1. Mục tiêu

Mỗi slice đóng xong phải để lại bằng chứng đủ cho người audit trả lời ba câu hỏi:

1. Đã thay đổi gì.
2. Thay đổi đó có đúng với spec/tài liệu không.
3. Có thể verify lại nhanh bằng command nào.

## 2. Evidence bắt buộc

- Danh sách file đã sửa
- Tóm tắt hành vi mới hoặc hành vi đã sửa
- Kết quả validation
- Risk còn tồn đọng
- Link cập nhật trong `docs/upgrade-standard/AUDIT_LEDGER.md`

## 3. Validation chuẩn

Chạy từ root repo bằng đường dẫn tương đối:

```bash
npm run type-check
npm test
npm run build:docs
python scripts/generate_module_tree.py
```

## 4. UI smoke checklist

### LibraryShowcaseDemo

- Theme toggle đổi cả shell và canvas
- Splitter hiện khi hover và resize được
- Pane menu hide/show đúng state
- Settings modal mở đúng section và đóng được
- Chuyển `vi/en` đổi text ngay, không cần reload

### Demo phụ

- `FullDemo` đổi locale được
- `OriginalLikeDemo` đổi locale được
- `LiveDemo` fallback text đổi theo locale hiện tại

## 5. Quy tắc modified file list

Mọi task hoàn tất phải update `docs/upgrade-standard/AUDIT_LEDGER.md` với:

- ngày giờ
- mục tiêu slice
- file modified
- validation evidence

Không chấp nhận câu “có vài file thay đổi nhỏ” mà không liệt kê cụ thể.

## 6. Mẫu báo cáo ngắn

```text
Scope:
Changed files:
Behavioral change:
Validation:
Residual risk:
```
