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
- Nếu task chạm market data, phải ghi rõ nguồn dữ liệu, ticker, phạm vi lịch sử đã tải, và cách backfill / range math hoạt động.

## 3. Validation chuẩn

Chạy từ root repo bằng đường dẫn tương đối:

```bash
npm run type-check
npm test
npm run build:docs
python scripts/generate_module_tree.py
```

Nếu thay đổi liên quan dữ liệu thị trường thật hoặc viewport lịch sử, cần thêm smoke check tối thiểu:

- scroll / pan về trái để kiểm tra backfill
- click `1D` / `5D` / `1M` / `3M` / `YTD` / `1Y` / `All`
- xác nhận ticker label khớp nguồn upstream

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

## 7. Ghi chú audit cho data fidelity

- Không chấp nhận mô tả “dữ liệu thật” nếu code vẫn chỉ load sample history ngắn.
- Nếu có fallback offline, phải ghi rõ là fallback và không được dùng làm bằng chứng full-history.
- Nếu task thay đổi view range, audit phải chỉ rõ range math hay data loading layer là nguồn của thay đổi.
