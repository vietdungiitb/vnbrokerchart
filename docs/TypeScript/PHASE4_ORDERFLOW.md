# Phase 4 — Orderflow Suite (As-built Sync)

> Thuộc: [ROADMAP.md](./ROADMAP.md)  
> Trạng thái thực thi: Completed trong delivery scope P1-P7 (orderflow mở rộng để post-v1)
> Lưu ý: Đây là phase có phụ thuộc dữ liệu backend lớn nhất.

> Lưu ý tránh hiểu nhầm: closeout hiện tại chốt delivery scope; các hạng mục orderflow nâng cao được tách milestone post-v1.

---

## 1. Snapshot hiện trạng

| Hạng mục | Thiết kế ban đầu | As-built hiện tại | Trạng thái |
|---|---|---|---|
| CVD nền tảng | compute + render + tooltip | Có built-in CVD ở registry; UI orderflow đầy đủ chưa hoàn tất | Partial |
| Volume Profile | session/visible/fixed/composite | Đang có VolumeProfileSeries legacy dùng được cho regression | Partial |
| Footprint | Tick-level bid/ask per price | Chưa có pipeline tick aggregate chuẩn | Backlog |
| Delta Candle | Màu theo delta | Chưa có series module riêng | Backlog |
| Market Profile/TPO | TPO computation + render | Chưa triển khai | Backlog |

---

## 2. Chênh lệch cần đóng trước khi scale

1. Tài liệu cũ giả định dữ liệu tick luôn sẵn, nhưng hệ thống hiện mới chốt contract adapter ở mức OHLCV + stream cơ bản.
2. Chưa có acceptance matrix riêng cho orderflow theo từng loại data feed.
3. Chưa có benchmark hiệu năng khi khối lượng điểm dữ liệu orderflow tăng cao.

---

## 3. Bổ sung bắt buộc cho phase 4

1. Data readiness matrix:
   - Feed nào cung cấp `buyVolume`, `sellVolume`, tick side.
   - Feed nào chỉ có OHLCV thuần.
2. Degradation policy:
   - Nếu thiếu tick data thì fallback hiển thị gì.
3. Validation gates:
   - Correctness test cho compute.
   - Soak test cho khối lượng dữ liệu lớn.
   - Browser smoke cho density hiển thị, không ẩn sai lệch tín hiệu.

---

## 4. Lộ trình đề xuất

### M1 — Production CVD + VP baseline
- Chốt compute CVD với contract rõ ràng cho field volume side.
- Chuẩn hóa Volume Profile mode `visible` trước.
- Bổ sung stories riêng cho CVD và VP trong điều kiện dữ liệu thực.

### M2 — Delta Candle + session profiles
- Bổ sung Delta Candle series.
- Mở rộng VP sang `session` và `fixed-range`.

### M3 — Footprint/TPO
- Thêm tick aggregation pipeline.
- Triển khai Footprint và TPO theo milestone độc lập.
- Chỉ đóng phase khi có benchmark + evidence regression đủ lớn.

---

## 5. Definition of Done (cập nhật)

- [x] CVD và data contract nền tảng đã được chốt trong delivery scope hiện tại.
- [x] Volume/orderflow baseline hiện tại đã có regression/smoke tương ứng.
- [x] Storybook + smoke cho orderflow core trong delivery scope đã pass.
- [x] Footprint/TPO được xác nhận là milestone sau với planning artifact rõ ràng.
