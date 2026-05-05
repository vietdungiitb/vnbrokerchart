# Project Governance

## Mục tiêu điều phối

Giữ cho repo phát triển theo hướng: `demo hoàn chỉnh trước`, `kiến trúc đủ sạch để tách widget sau`, và `không để runtime drift khỏi tài liệu đã chốt`.

## Luật bắt buộc

1. Với feature lớn hoặc refactor lớn, phải có plan được duyệt trước khi code.
2. Mọi thay đổi indicator phải tôn trọng SSOT: cùng `source + timeframe + transform + indicatorType + normalizedParams` thì dữ liệu và hình dạng phải giống nhau ở mọi nơi tiêu thụ.
3. Mọi text UI mới phải đi qua i18n key; không hardcode thêm chuỗi mới trong component demo.
4. Mặc định locale là `vi`; `en` là secondary locale bắt buộc có mặt.
5. Core library chỉ nhận props/callback từ ngoài; không import `src/demo` từ `src/lib/**`.
6. Sau refactor phải dọn code chết, branch logic thừa, CSS thừa, state thừa.
7. Không đóng slice nếu chưa cập nhật `AUDIT_LEDGER.md` và `module_tree_full.md`.
8. Không giả định có Docker stack trong repo này; mọi hướng dẫn runtime phải dựa trên công cụ thực tế đang có trong workspace.
9. Toàn bộ ứng dụng phải dùng chung một bộ template giao diện với web root; mọi surface mới phải bám template gốc thay vì tự tạo layout độc lập nếu không có phê duyệt riêng.
10. Nếu bề mặt công bố dữ liệu thị trường thật, nguồn dữ liệu, ticker label, timestamp và độ dài lịch sử phải khớp với nguồn gốc; không được trình diễn sample history ngắn như full history.

## Chu kỳ làm việc chuẩn

1. Xác định slice và anchor kỹ thuật.
2. Cập nhật hoặc tạo plan cho slice.
3. Thực hiện thay đổi nhỏ, validate hẹp ngay sau edit đầu tiên.
4. Hoàn tất toàn slice, chạy validation chuẩn.
5. Ghi audit evidence, modified files, risk tồn đọng.
6. Regenerate module tree.

## Quy tắc repo hygiene

- Không revert thay đổi ngoài phạm vi nếu chưa được yêu cầu.
- Không dùng fix bề mặt nếu nguyên nhân gốc còn đó.
- Không chấp nhận trạng thái “build pass nhưng UI vẫn lệch spec”.
- Không mở dependency mới cho i18n nếu giải pháp demo-local hiện tại vẫn đủ nhẹ và rõ ràng.

## Quy tắc chuyển sang widget hóa

Chỉ bắt đầu tách widget khi đồng thời đạt đủ ba điều kiện:

1. Demo shell đã ổn định về SSOT.
2. i18n không còn hardcoded text rải rác ngoài dictionary/hook.
3. Các interaction hiện tại có ranh giới rõ giữa `shell`, `data`, `chart core`, `settings`, `locale`.
