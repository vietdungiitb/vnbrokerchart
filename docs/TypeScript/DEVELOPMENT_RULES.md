# Quy định phát triển bắt buộc

> Tài liệu này là cổng bắt buộc trước mọi công việc coding trong dự án.
> Team code và AI code phải đọc và tuân thủ đầy đủ trước khi bắt đầu sửa bất kỳ file nào.

---

## 1. Nguyên tắc bắt buộc

- Không code trước khi có điểm vào rõ ràng: file, symbol, test lỗi, log lỗi, hoặc một path cụ thể.
- Không mở rộng phạm vi ngoài slice đang làm nếu chưa hoàn tất slice hiện tại.
- Không sửa theo cảm tính; mọi thay đổi phải bám vào kiến trúc trong [ARCHITECTURE.md](./ARCHITECTURE.md) và kế hoạch trong [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).
- Không phá vỡ API public nếu không có lý do kiến trúc rõ ràng và được ghi nhận trong plan.
- Không dùng workaround tạm bợ nếu đã thấy root cause có thể sửa được ngay.

---

## 2. Điều kiện vào việc trước khi coding

Trước khi viết code, bắt buộc phải xác nhận đủ 5 điểm sau:

- Có mục tiêu cụ thể của task.
- Có file hoặc module anchor đang chịu trách nhiệm chính.
- Có một giả thuyết cục bộ có thể kiểm chứng hoặc bác bỏ.
- Có một kiểm tra rẻ nhất để phân biệt giả thuyết đúng/sai.
- Có kế hoạch sửa nhỏ nhất có thể để kiểm chứng giả thuyết đó.

Nếu chưa có đủ 5 điểm trên thì phải dừng lại để bổ sung context, không được code lan man.

---

## 3. Quy trình làm việc bắt buộc

### 3.1 Trước khi sửa

- Đọc các tài liệu liên quan: [ROADMAP.md](./ROADMAP.md), [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md), [ARCHITECTURE.md](./ARCHITECTURE.md).
- Đọc [HANDOFF_MANIFEST.md](./HANDOFF_MANIFEST.md) để lấy đúng entry point của bộ tài liệu bàn giao trước khi bắt đầu coding.
- Đọc [ARCHITECTURE_GUARDS.md](./ARCHITECTURE_GUARDS.md) và xác định guards nào áp dụng cho slice hiện tại.
- Bắt buộc đọc [module_tree_full.md](../module_tree_full.md) để nắm cấu trúc thư viện hiện tại trước khi bắt đầu coding.
- Nếu task chạm file React/JSX/TSX, bắt buộc đọc và tuân thủ bộ quy tắc React 19 source patterns đã có sẵn trong workspace trước khi sửa.
- Xác định task thuộc phase nào.
- Xác định các file sẽ chạm tối thiểu.
- Nếu task lớn, phải có plan được đồng ý trước khi code.

### 3.2 Trong khi sửa

- Chỉ sửa đúng slice đang làm.
- Giữ thay đổi nhỏ, rõ, dễ rollback.
- Không refactor rộng nếu không phục vụ trực tiếp task.
- Không thêm phụ thuộc mới nếu chưa chứng minh cần thiết.
- Không đổi naming convention, folder structure hay public API nếu chưa cập nhật plan.

### 3.3 Sau khi sửa

- Chạy kiểm tra phù hợp nhất với thay đổi vừa làm.
- Nếu có lỗi, sửa đúng slice đó trước khi mở rộng phạm vi.
- Cập nhật tài liệu liên quan nếu hành vi, API, hoặc kiến trúc thay đổi.
- Cập nhật danh sách file đã sửa trong phần audit nội bộ của tài liệu liên quan hoặc trong doc kế hoạch tương ứng.
- Sau khi hoàn thành code, bắt buộc chạy `scripts/generate_module_tree.py` để cập nhật `module_tree_full.md` theo cấu trúc thư viện mới.
- Nếu không thể chạy script ngay, phải nêu rõ blocker và không được coi task là hoàn tất cho đến khi inventory được cập nhật.

---

## 4. Quy định riêng cho AI code

- AI phải ưu tiên đọc tài liệu gốc trước khi đề xuất code.
- AI không được tự ý nhảy sang kiến trúc khác khi đã có kiến trúc chốt.
- AI không được trả lời bằng lý thuyết nếu task có thể thực thi ngay.
- AI không được sửa hàng loạt ngoài vùng liên quan.
- AI phải nêu rõ file nào sẽ đổi, vì sao đổi, và kiểm tra nào sẽ xác minh.
- AI phải dừng để xin xác nhận nếu task là major change hoặc ảnh hưởng nhiều module.

---

## 5. Quy định riêng cho team code

- Mọi dev phải đọc rules này trước khi bắt đầu slice mới.
- Mọi dev phải cập nhật audit file list sau khi kết thúc task.
- Mọi dev phải ưu tiên fix root cause thay vì triệu hồi patch tạm.
- Mọi dev phải chạy validation hẹp trước, rồi mới mở rộng.
- Mọi dev phải giữ repo ở trạng thái có thể build và review được sau mỗi task.

---

## 6. Quy tắc bắt buộc về chất lượng

- Không merge code chưa có kiểm tra phù hợp.
- Không bỏ qua cảnh báo quan trọng nếu nó liên quan trực tiếp đến slice đang sửa.
- Không dùng `any` mới trong phần public API nếu có thể thay bằng type rõ ràng.
- Không thêm side effect ẩn trong compute logic.
- Không để rendering, data fetching và state management lẫn lộn một chỗ nếu có thể tách được.

### 6.1 Kiến trúc bất biến — Guards G01–G15

Bộ quy tắc ALLOWED/FORBIDDEN chi tiết cho từng quyết định kiến trúc đã chốt được đặt trong [ARCHITECTURE_GUARDS.md](./ARCHITECTURE_GUARDS.md). Đây là tài liệu bắt buộc đọc và đối chiếu trước mọi coding trong P1 trở đi.

- Mỗi guard có detection command cụ thể để chạy khi code review.
- Mọi vi phạm là **hard stop** — không được bypass bằng comment hoặc owner approval trừ khi có lý do kiến trúc ghi vào ARCHITECTURE.md và AUDIT_LEDGER.md.
- Khi phát hiện vi phạm: ghi vào SLICE_AUDIT.md, sửa trước khi tiếp tục.

### 6.2 Quy tắc bắt buộc cho React 19

- Mọi file React/JSX/TSX phải tuân thủ React 19 source patterns như một rule cứng, không phải gợi ý.
- Entry points phải dùng `createRoot()`/`hydrateRoot()` thay cho `ReactDOM.render()`/`ReactDOM.hydrate()` khi code mới hoặc khi đụng tới migration.
- Khi không có lý do kiến trúc đặc biệt, ưu tiên ref-as-prop thay vì bọc `forwardRef()` cho component mới.
- Dùng `useRef(null)` thay vì `useRef()` không tham số.
- Dùng `createContext()` thay cho legacy context, và không dùng string refs hoặc `this.refs`.
- Không xoá các block `.propTypes`; giữ chúng như tài liệu runtime/IDE, kèm ghi chú rằng React 19 không còn chạy validation runtime từ React package.
- Ưu tiên default params của ES6 thay cho `defaultProps` khi viết mới hoặc refactor phù hợp.
- Chỉ xoá `import React from 'react'` khi file không còn dùng `React.` và không cần cho style/build hiện tại.
- Nếu một thay đổi React có nguy cơ vi phạm các rule này, phải dừng lại và chỉnh theo React 19 patterns trước khi tiếp tục.

---

## 7. Validation tối thiểu

Mỗi task code phải kết thúc bằng ít nhất một trong các kiểm tra sau, theo thứ tự ưu tiên:

- Test hoặc check nhắm đúng slice vừa sửa.
- Typecheck hoặc lint hẹp cho file/chùm file vừa chạm.
- Build hẹp nếu task liên quan build output.
- Diff check chỉ được dùng khi không có validation executable phù hợp hơn.

---

## 8. Quy tắc tài liệu và audit

- Sau mỗi task, phải ghi rõ file nào đã sửa.
- Nếu task ảnh hưởng runtime, phải cập nhật tài liệu kiến trúc hoặc kế hoạch tương ứng.
- Nếu task thêm hoặc đổi quy ước làm việc, phải cập nhật tài liệu quy định này.
- Không kết thúc task mà không có trace cho audit sau này.

---

## 9. Checklist bắt đầu coding

- [ ] Đã đọc `ROADMAP.md`
- [ ] Đã đọc `IMPLEMENTATION_PLAN.md`
- [ ] Đã đọc `ARCHITECTURE.md`
- [ ] Đã đọc `HANDOFF_MANIFEST.md`
- [ ] Đã đọc `ARCHITECTURE_GUARDS.md` và biết guards nào áp dụng cho slice này
- [ ] Đã đọc `module_tree_full.md`
- [ ] Nếu task chạm React/JSX/TSX, đã đọc và áp dụng React 19 source patterns
- [ ] Đã xác định file anchor
- [ ] Đã có giả thuyết cục bộ
- [ ] Đã có kiểm tra rẻ nhất
- [ ] Đã có slice sửa nhỏ nhất
- [ ] Task này có cần plan được đồng ý trước không

---

## 10. Checklist kết thúc coding

- [ ] Chạy validation hẹp phù hợp
- [ ] Sửa lỗi phát sinh trong slice hiện tại nếu có
- [ ] Cập nhật docs nếu hành vi/kiến trúc thay đổi
- [ ] Nếu task chạm React/JSX/TSX, xác nhận không vi phạm React 19 source patterns
- [ ] Đã chạy `scripts/generate_module_tree.py`
- [ ] `module_tree_full.md` đã được cập nhật theo thay đổi mới nhất
- [ ] Chạy detection commands trong ARCHITECTURE_GUARDS.md cho guards áp dụng — kết quả sạch
- [ ] Ghi audit file list
- [ ] Không mở rộng scope sang task khác
