# Indicator SSOT Policy

> Trạng thái: Canonical rule · Áp dụng cho toàn bộ indicator pipeline, renderer, tooltip, computed values, và settings runtime.

---

## 1. Nguyên tắc gốc

Trong dự án này, indicator **không phải nguồn dữ liệu riêng**.

- Nguồn dữ liệu gốc là `RawOHLCV[]` và các transform đã được phê duyệt như Heikin Ashi.
- Indicator chỉ là các phép chiếu hoặc phép tổng hợp khác nhau từ cùng một nguồn dữ liệu gốc.
- Pane, `yAxis`, template render, màu sắc, theme, layout, và vị trí hiển thị chỉ là **presentation layer**.

Hệ quả bắt buộc:

- Cùng một indicator, cùng `source`, cùng `timeframe`, cùng `transform`, cùng `params` phải cho ra **cùng một chuỗi dữ liệu canonical**.
- Nếu indicator đó xuất hiện ở nhiều pane hoặc nhiều bề mặt UI khác nhau, hình dạng phải giống nhau tuyệt đối.
- Khác pane hoặc khác trục Y không được sinh ra dữ liệu indicator mới.

Ví dụ chuẩn để tránh hiểu sai:

- Nếu cùng nguồn là `BTCUSDT` của Binance, cùng timeframe, cùng transform, cùng indicator và cùng params, thì indicator ở 2 pane khác nhau phải dùng cùng trục thời gian X và cùng chuỗi giá trị Y ở từng timestamp.
- Khác biệt được phép chỉ là biểu diễn thị giác do chiều cao pane khác nhau hoặc cách chia độ trục Y khác nhau.
- Nói cách khác: cùng timestamp thì phải ra cùng giá trị indicator; không được có chuyện pane A và pane B vẽ hai hình khác nhau cho cùng một indicator instance.

---

## 2. Định nghĩa SSOT cho indicator

Một indicator instance chỉ được coi là hợp lệ khi có một canonical identity rõ ràng:

```ts
type IndicatorSeriesKey = {
  sourceId: string;
  timeframe: string;
  transformKey: string;
  indicatorType: string;
  normalizedParams: string;
};
```

Trong đó:

- `sourceId`: định danh nguồn nến gốc, ví dụ `BTCUSD-BINANCE`.
- `timeframe`: `1m`, `5m`, `1h`, `1D`...
- `transformKey`: `raw`, `heikinashi`, hoặc chuỗi transform được phê duyệt.
- `indicatorType`: `EMA`, `RSI`, `MACD`, `BollingerBand`, `CVDApprox`...
- `normalizedParams`: params đã chuẩn hóa theo thứ tự key ổn định.

Nếu và chỉ nếu 5 thành phần này giống nhau, hệ thống phải tái sử dụng cùng một indicator series.

---

## 3. Kiến trúc bắt buộc

Indicator data phải đi theo kiến trúc này:

```text
RawOHLCV[]
  -> approved transform pipeline
  -> Canonical Indicator Store
  -> consumers read by IndicatorSeriesKey

Consumers:
  - DynamicChart renderSeries
  - yExtents accessors
  - tooltip entries
  - computed values panels
  - settings preview / inspector
```

Nguyên tắc thực thi:

- **Compute once, read many**: tính một lần cho mỗi `IndicatorSeriesKey`, sau đó mọi consumer chỉ được đọc lại.
- `DynamicChart` không được tự suy luận một nguồn dữ liệu riêng cho cùng indicator.
- `SeriesRegistry` không được hardcode accessor cố định làm sai `params` runtime.
- Tooltip, `yExtents`, legend, computed values phải đi qua cùng một accessor family.

---

## 4. Rule bắt buộc cho team code

### 4.1 Rule kiến trúc

- `enrichData()` hoặc một canonical indicator store tương đương là nơi duy nhất được phép materialize indicator values.
- `PaneDescriptor` chỉ mô tả **presentation intent**, không phải nơi lưu dữ liệu indicator đã tính riêng theo pane.
- Nếu một indicator được add vào pane thứ hai với cùng params, hệ thống phải reuse canonical series thay vì tính lại một bản khác.

### 4.2 Rule presentation

- Đổi `yAxis` chỉ đổi scale hiển thị, không đổi dữ liệu.
- Đổi pane, reorder pane, hide/show pane không đổi dữ liệu.
- Đổi template từ `line` sang `bar` hay `area` chỉ đổi renderer, không đổi canonical values.
- Khác chiều cao pane hoặc khác tick spacing trên trục Y không được làm thay đổi hình dạng logic của indicator; chỉ được thay đổi pixel mapping khi render.

### 4.3 Rule tham số

- Thay đổi params tạo ra `IndicatorSeriesKey` mới.
- Mọi consumer của indicator đó phải cùng chuyển sang key mới trong cùng một commit logic.
- Không được để chart render theo params mới nhưng tooltip hoặc `yExtents` vẫn đọc theo params cũ.

### 4.4 Rule realtime

- Override realtime như `CVDRealtime` hoặc `StrengthRelative` phải nhập vào cùng canonical store.
- Không được để chart dùng chuỗi realtime nhưng panel phụ vẫn đọc chuỗi approximation khác trừ khi loại indicator thật sự khác (`CVDApprox` khác `CVDRealtime`).

---

## 5. Anti-pattern bị cấm

Các pattern sau bị coi là vi phạm SSOT:

- `DynamicChart` render `EMA(period=13)` nhưng `yExtents` lại hardcode `d.ema20` hoặc `d.ema50`.
- Tooltip gọi một hàm `compute()` riêng trong lúc chart đọc dữ liệu đã enrich sẵn.
- Computed values panel dùng pipeline indicator khác với pipeline chart.
- Cùng `MACD(12,26,9)` ở hai pane nhưng mỗi pane đọc một cấu trúc field khác nhau.
- Tạo field cố định kiểu `ema20`, `ema50`, `rsi14` rồi gắn nhãn runtime linh hoạt làm người dùng hiểu sai.
- Cùng `BTCUSDT` / Binance / timeframe / params nhưng pane A bị lệch timestamp hoặc lệch giá trị so với pane B, kể cả khi nhìn bằng tooltip tại cùng crosshair position.

---

## 6. Acceptance checks bắt buộc

Mọi thay đổi liên quan indicator phải chứng minh được các kiểm tra sau:

- `EMA(20)` ở 2 pane khác nhau có chuỗi giá trị giống nhau.
- `MACD(12,26,9)` ở 2 pane khác nhau có cùng `macd`, `signal`, `histogram`.
- Với cùng nguồn `BTCUSDT` Binance, indicator ở 2 pane phải trùng timestamp trên trục X và trùng giá trị tại từng timestamp; chỉ khác tỷ lệ hiển thị do pane height hoặc y-scale.
- Đổi `yAxis` không làm thay đổi series values.
- Đổi pane order hoặc hide/show pane không làm thay đổi series values.
- Đổi theme, màu, template render không làm thay đổi series values.
- Đổi params tạo canonical key mới và mọi consumer cùng đọc key mới.

---

## 7. Hướng dẫn triển khai

### 7.1 Nên làm

- Chuẩn hóa params trước khi tạo cache key.
- Tạo helper chung kiểu `resolveIndicatorAccessor(config)` hoặc `resolveIndicatorSeries(key)`.
- Đặt test regression cho các indicator có nhiều output như Bollinger và MACD.
- Gộp chart, tooltip, `yExtents`, computed values vào cùng một source accessor layer.

### 7.2 Không nên làm

- Để registry vừa định nghĩa metadata vừa hardcode field data theo preset cũ.
- Tính indicator trong component render.
- Tính lại indicator riêng cho từng pane chỉ vì người dùng add cùng loại sang pane khác.

---

## 8. Trích dẫn ngắn để dùng trong code review

> Cùng indicator, cùng source, cùng timeframe, cùng transform, cùng params => phải dùng cùng canonical series. Pane chỉ là presentation, không phải data source.
