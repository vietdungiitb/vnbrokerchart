# Project Governance Standard

## 1. Mục đích

Đây là quy phạm điều phối cấp repo. Mục tiêu là giữ cho dự án phát triển theo hướng `demo hoàn chỉnh trước`, `kiến trúc đủ sạch để tách widget sau`, và `không để runtime drift khỏi tài liệu đã chốt`.

Quy phạm này vận hành cùng `docs/CHANGE_CONTROL_STANDARD.md`; khi một change request đã ở trạng thái `Approved`, đội code được phép triển khai trong phạm vi đó mà không cần hỏi lại các quyết định đã chốt.

## 2. Phạm vi áp dụng

Quy phạm này áp dụng cho mọi thay đổi trong `src/`, `docs/`, `quality/`, `scripts/`, và toàn bộ tài liệu bàn giao có ảnh hưởng đến hành vi runtime, tiêu chuẩn chất lượng, hoặc cách bàn giao cho đội code và audit.

## 3. Thứ bậc hiệu lực

Nếu có xung đột giữa tài liệu, thứ bậc hiệu lực là:

1. `docs/README.md`
2. `docs/project-delivery/README.md`
3. `docs/project-delivery/PROJECT_GOVERNANCE.md`
4. `docs/project-delivery/TECH_SPEC.md`
5. `docs/project-delivery/IMPLEMENTATION_PLAN.md`
6. `docs/project-delivery/TASKBOARD.md`
7. `docs/project-delivery/HANDOFF_CHECKLIST.md`
8. `docs/project-delivery/AUDIT_PROTOCOL.md`
9. `quality/QUALITY.md`
10. `docs/upgrade-standard/AUDIT_LEDGER.md`

## 4. Từ khóa quy phạm

- `MUST` / `PHẢI`: bắt buộc, không được bỏ qua.
- `SHOULD` / `NÊN`: mặc định nên làm, chỉ được bỏ qua khi có lý do rõ ràng và ghi lại trong audit.
- `MAY` / `CÓ THỂ`: tùy chọn, không bắt buộc.
- Nếu tài liệu không nói rõ, không được tự suy diễn ngoài phạm vi đã chốt.

## 5. Phân loại thay đổi

| Loại thay đổi | Khi được làm | Bắt buộc trước khi code | Evidence tối thiểu |
| --- | --- | --- | --- |
| Doc-only | Khi chỉ điều chỉnh tài liệu, không đổi behavior | Xác định tài liệu đích và tác động | Cập nhật file doc liên quan + ledger nếu là tài liệu quy phạm |
| Narrow bugfix | Khi đã có anchor kỹ thuật gần nhất và giả thuyết local | Nêu được cheap discriminating check | Validation hẹp, ghi rõ risk còn lại |
| Approved slice work | Khi task nằm trong `IMPLEMENTATION_PLAN.md` hoặc `TASKBOARD.md` | Bám đúng slice hiện có | Updated audit ledger, taskboard nếu cần |
| Contract / API change | Khi slice đã ghi nhận thay đổi contract | Cập nhật `TECH_SPEC.md` và plan trước | Evidence + review gate rõ ràng |
| Data-source / market-fidelity change | Khi nguồn dữ liệu, backfill, hoặc range math đổi | Có spec và smoke path riêng | Browser smoke + ledger + source fidelity note |
| Repo-wide cleanup | Khi scope vượt một subsystem | Có plan, ledger, và mô tả phạm vi | Validation chuẩn + module tree nếu chạm source |

## 6. Luật cứng

1. Với feature lớn, refactor lớn, contract change, hoặc data-source change, phải có plan được chốt trước khi code.
2. Nếu task đã nằm trong slice/plan hiện có, đội code được phép tiến hành ngay theo tài liệu, không cần hỏi lại từng bước nhỏ.
3. Nếu task không có trong plan, không tự mở rộng scope; phải cập nhật plan hoặc spec trước khi tiếp tục.
4. Mọi thay đổi indicator phải tôn trọng SSOT: cùng `source + timeframe + transform + indicatorType + normalizedParams` phải cho cùng dữ liệu và hình dạng ở mọi nơi tiêu thụ.
5. Mọi text UI mới phải đi qua i18n key; không hardcode thêm chuỗi mới trong component demo hoặc widget.
6. Mặc định locale là `vi`; `en` là secondary locale bắt buộc có mặt.
7. Core library chỉ nhận props/callback từ ngoài; không import `src/demo` từ `src/lib/**`.
8. Không dùng fix bề mặt nếu nguyên nhân gốc còn đó.
9. Không chấp nhận trạng thái `build pass` nhưng UI, data fidelity, hoặc contract vẫn lệch spec.
10. Không giả định có Docker stack trong repo này; mọi hướng dẫn runtime phải dựa trên công cụ thực tế đang có trong workspace.
11. Toàn bộ ứng dụng phải dùng chung một bộ template giao diện với web root; mọi surface mới phải bám template gốc thay vì tự tạo layout độc lập nếu không có phê duyệt riêng.
12. Nếu bề mặt công bố dữ liệu thị trường thật, nguồn dữ liệu, ticker label, timestamp và độ dài lịch sử phải khớp với nguồn gốc; không được trình diễn sample history ngắn như full history.
13. Sau refactor phải dọn code chết, branch logic thừa, CSS thừa, state thừa.
14. Sau thay đổi source code phải cập nhật `docs/upgrade-standard/AUDIT_LEDGER.md`; nếu chạm source trong `src/`, phải regenerate `module_tree_full.md`.
15. Không mở dependency mới cho i18n nếu giải pháp demo-local hiện tại vẫn đủ nhẹ và rõ ràng.

## 7. Chu kỳ làm việc chuẩn

1. Xác định slice, anchor kỹ thuật, và tài liệu hiệu lực cao nhất.
2. Kiểm tra thay đổi có nằm trong plan hiện có hay không.
3. Nếu nằm trong plan, tiến hành ngay với chỉnh sửa nhỏ nhất có thể.
4. Nếu không nằm trong plan, cập nhật plan/spec trước hoặc chỉ hỏi lại khi có quyết định bên ngoài không thể suy ra từ tài liệu.
5. Sau edit đầu tiên, chạy validation hẹp để falsify giả thuyết local.
6. Hoàn tất slice, chạy validation chuẩn, ghi audit evidence, modified files, và risk còn tồn đọng.
7. Regenerate module tree khi có source change.

## 8. Điều kiện phải hỏi lại

Chỉ hỏi lại người dùng khi thay đổi đụng một trong các trường hợp sau và không có đường xử lý rõ ràng trong tài liệu hiện có:

- Thay đổi public API / contract ngoài plan.
- Thay đổi nguồn dữ liệu production-facing.
- Thêm dependency nền tảng mới.
- Thay đổi có ảnh hưởng cross-slice nhưng chưa có slice map hoặc spec tương ứng.
- Có xung đột giữa tài liệu mà thứ bậc hiệu lực không giải được.

## 9. Quy tắc repo hygiene

- Không revert thay đổi ngoài phạm vi nếu chưa được yêu cầu.
- Không dùng fix bề mặt nếu nguyên nhân gốc còn đó.
- Không mở dependency mới cho i18n nếu giải pháp demo-local hiện tại vẫn đủ nhẹ và rõ ràng.
- Không đóng task nếu thiếu modified-file list, validation, hoặc risk note.

## 10. Quy tắc chuyển sang widget hóa

Chỉ bắt đầu tách widget khi đồng thời đạt đủ ba điều kiện:

1. Demo shell đã ổn định về SSOT.
2. i18n không còn hardcoded text rải rác ngoài dictionary/hook.
3. Các interaction hiện tại có ranh giới rõ giữa `shell`, `data`, `chart core`, `settings`, `locale`.
