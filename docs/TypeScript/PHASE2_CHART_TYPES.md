# Phase 2 — Chart Types (As-built Sync)

> Thuộc: [ROADMAP.md](./ROADMAP.md)  
> Trạng thái thực thi: Partial (đã có nền tảng từ P2/P6, chưa hoàn tất mục tiêu phase chart types đầy đủ)  
> Liên quan thực thi: P2 chart shell + P6 stories

> Lưu ý tránh hiểu nhầm: Done ở bảng snapshot chỉ là done theo hạng mục con đã triển khai, không phải done toàn phase.

---

## 1. Snapshot hiện trạng

| Nhóm | Thiết kế ban đầu | As-built hiện tại | Trạng thái |
|---|---|---|---|
| Chart shell | Multi-pane runtime | Có `ChartTerminal`, `ChartPane`, `PaneSplitter`, `usePaneManager` | Done |
| Series cơ bản | Candlestick/Line/Bar/Volume/... | Series legacy đã có và được dùng trong stories | Done (legacy) |
| Chart types mới | Hollow/HeikinAshi/Baseline/Renko mở rộng | Chưa có module mới theo thiết kế này | Backlog |
| Story coverage | Mỗi loại chart có story | Đã có 8 story tiêu biểu cho regression | Partial |

---

## 2. Chênh lệch chính cần đóng

1. Tài liệu cũ giả định sẽ tạo mới nhiều series; thực tế đang tái sử dụng tốt legacy series để giữ tương thích.
2. Chưa có lớp chuẩn hóa API prop cho tất cả series theo một interface chung.
3. Non-time-series chart types vẫn còn ở trạng thái inventory, chưa thành module TypeScript mới.

---

## 3. Bổ sung nên thêm ngay

1. Bảng "Series status map" trong tài liệu:
   - Có sẵn và đang dùng.
   - Có sẵn nhưng chưa được regression story bao phủ.
   - Chưa triển khai.
2. Tiêu chí thoát phase 2 theo thực tế:
   - Không bắt buộc viết lại toàn bộ series cũ ngay.
   - Bắt buộc có coverage regression cho các luồng chính.
3. Tách rõ hai track:
   - Track A: giữ tương thích + hardening.
   - Track B: series API chuẩn hóa thế hệ mới.

---

## 4. Lộ trình thực thi đề xuất

### M1 — Consolidation
- Chuẩn hóa style/accessor props cho nhóm Candlestick, Line, Bar, Volume.
- Thêm stories cho các series còn thiếu trong nhóm P0/P1.

### M2 — New chart types
- Ưu tiên `HollowCandlestickSeries` và transform Heikin Ashi.
- Đưa BaselineSeries vào backlog triển khai độc lập.

### M3 — Advanced types
- Lập milestone riêng cho Renko/Kagi/Point and Figure.
- Bắt buộc có visual regression cho từng loại trước khi đóng.

---

## 5. Definition of Done (cập nhật)

- [x] Shell runtime pane hoạt động ổn định.
- [x] Regression stories đại diện đã có và build pass.
- [ ] Bộ chart types mới theo thiết kế đã được triển khai module hóa.
- [ ] API chuẩn hóa cho toàn bộ series được chốt và có migration notes.
