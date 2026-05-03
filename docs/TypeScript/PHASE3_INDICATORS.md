# Phase 3 — Indicators (As-built Sync)

> Thuộc: [ROADMAP.md](./ROADMAP.md)  
> Trạng thái thực thi: Completed trong delivery scope P1-P7 (catalog mở rộng giữ ở post-v1 backlog)
> Slice đã đóng: P3

> Lưu ý tránh hiểu nhầm: việc P3 PASS không đồng nghĩa hoàn tất toàn bộ roadmap indicator của phase này.

---

## 1. Snapshot hiện trạng

| Hạng mục | Thiết kế ban đầu | As-built hiện tại | Trạng thái |
|---|---|---|---|
| Indicator registry | Bắt buộc có registry | Đã có registry + built-ins | Done |
| Built-ins lõi | EMA/SMA/RSI/MACD/Bollinger/Volume/CVD | Đã có đủ nhóm lõi này | Done |
| Catalog mở rộng | ATR/ADX/VWAP/Supertrend/... | Chưa triển khai đầy đủ | Backlog |
| Hook layer mới | `useIndicator` generic | Chưa có hook chuẩn mới ở public API | Backlog |
| Overlay story coverage | Mọi overlay có story | Mới có coverage tiêu biểu qua 8 stories | Partial |

---

## 2. Chênh lệch quan trọng

1. Thiết kế cũ thuần shape `number[]`, còn implementation hiện tại đã dùng `IndicatorDefinition` và cho phép output object (ví dụ MACD/Bollinger).
2. Registry mới cùng tồn tại với layer indicator/calculator legacy để giữ tương thích.
3. Chưa có đầy đủ catalog indicator như tài liệu thiết kế ban đầu mô tả.

---

## 3. Cần bổ sung trong tài liệu phase 3

1. Bảng "Implemented built-ins" chốt chính xác indicator đang có trong registry.
2. Mục "Output contracts" cho indicator object outputs:
   - MACD: `macd`, `signal`, `histogram`.
   - Bollinger: `upper`, `middle`, `lower`.
3. Mục "Legacy coexistence":
   - Khi nào dùng registry mới.
   - Khi nào còn dùng chain-style cũ.

---

## 4. Lộ trình tiếp theo

### M1 — Catalog completion
- Thêm các indicator ưu tiên cao: ATR, VWAP, OBV, Supertrend.
- Mỗi indicator mới bắt buộc có unit test + scale extent test.

### M2 — Integration consistency
- Đồng bộ `computeScales` với mọi output shape mới.
- Chuẩn hóa tooltip data adapters cho pane và overlay.

### M3 — Public hook layer
- Bổ sung `useIndicator` theo public contract.
- Thêm docs usage patterns cho app tích hợp.

---

## 5. Definition of Done (cập nhật)

- [x] Registry hoạt động, built-ins lõi đã đăng ký.
- [x] Unit tests của P3 pass.
- [x] Indicator catalog cần cho delivery scope đã hoàn tất và có evidence test.
- [x] Hook/catalog mở rộng đã được ghi nhận post-v1, không chặn closeout P1-P7.
