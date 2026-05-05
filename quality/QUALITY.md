# QUALITY

## 1. Purpose

Chất lượng của repo này không được đo bằng “build pass” đơn thuần. Repo đạt chất lượng khi demo shell vận hành đúng với spec, indicator không drift khỏi SSOT, i18n không để lại trạng thái nửa Việt nửa Anh, và kiến trúc vẫn đủ sạch để tách widget ở bước sau.

## 2. Coverage targets

| Subsystem | Mục tiêu | Lý do |
| --- | --- | --- |
| Demo shell và topbar | 90% hành vi chính | Đây là bề mặt người dùng kiểm tra trực tiếp |
| Pane orchestration | 90% reducer branches quan trọng | Hide/show/reorder/resize rất dễ regression |
| Dynamic chart rendering | 85% | Sai yExtents hoặc sai mapped series gây chart đúng-looking nhưng sai dữ liệu |
| Data enrichment và indicator accessors | 90% | Đây là vùng nhạy nhất cho SSOT drift |
| i18n runtime | 85% | Mixed locale là regression nhìn thấy ngay nhưng dễ bị bỏ sót |
| Historical data fidelity và backfill | 90% | Range buttons và pan/scroll chỉ trung thực khi lịch sử upstream đủ dài |

## 3. Coverage theater cần tránh

- Test chỉ assert component render được nhưng không kiểm tra locale đổi text.
- Test chỉ mock reducer return state mà không đi qua action thật.
- Test chart chỉ kiểm tra có node SVG/canvas mà không kiểm tra mapped pane/series logic.
- Test i18n chỉ kiểm tra hook trả về string, không kiểm tra `html lang` và persistence.
- Test range/backfill chỉ kiểm tra `aria-pressed` hoặc state local mà không kiểm tra lịch sử upstream thật đã được nạp.

## 4. Fitness-to-purpose scenarios

### Q-01. Chart type drift

Nếu topbar đổi chart type nhưng pane chính vẫn giữ series cũ, y-domain có thể bị lệch và biểu đồ nhìn đúng bố cục nhưng sai hình thái giá.

How to verify: đổi lần lượt `candlestick`, `ohlc`, `line`, `heikinashi` và kiểm tra pane chính chỉ có đúng primary series tương ứng.

### Q-02. Pane visibility limit drift

Nếu `maxVisiblePanes` và reducer state không đồng bộ, user có thể restore pane vượt ngưỡng hoặc bị kẹt ở trạng thái không thêm pane mới được.

How to verify: hạ limit, ẩn/hiện nhiều pane, xác nhận cảnh báo và nút restore/add phản ứng đúng.

### Q-03. Splitter remount flicker

Nếu resize pane commit theo từng pixel thay vì preview visual-only, canvas sẽ remount liên tục gây flicker và cảm giác “lag nặng”.

How to verify: drag splitter dài trên shell chart và kiểm tra chỉ commit khi thả chuột.

### Q-04. Theme mixed-state

Nếu theme chỉ đổi DOM shell mà không đổi canvas/theme attrs, giao diện sẽ lẫn sáng/tối và tạo cảm giác sản phẩm lỗi.

How to verify: toggle theme nhiều lần, kiểm tra shell background, chart canvas và splitter đều cùng mode.

### Q-05. Locale mixed-state

Nếu text mới bị hardcode ngoài dictionary, đổi locale sẽ cho giao diện nửa Việt nửa Anh.

How to verify: chuyển `vi/en` trên mọi demo chính, kiểm tra topbar, modal, badges, placeholder và status text.

### Q-06. Live data fallback failure

Nếu live fetch lỗi mà fallback không giữ được text/state đúng, user không biết demo đang dùng dữ liệu nào.

How to verify: chặn mạng, reload demo, xác nhận fallback data vẫn render và status text đúng theo locale.

### Q-07. Indicator SSOT mismatch

Nếu cùng indicator cùng params được tính từ hai pipeline khác nhau, hai pane có thể hiển thị hình dạng khác nhau dù cùng logic business.

How to verify: sau slice SSOT, gắn cùng indicator vào hai pane và so hình dạng/tooltip/yExtents.

### Q-08. Widget-boundary leak

Nếu `src/lib/**` bắt đầu import ngược từ `src/demo/**`, bước widget extraction sau này sẽ mắc coupling khó gỡ.

How to verify: audit imports mới, đảm bảo demo chỉ truyền props xuống core.

### Q-09. Historical backfill fidelity

Nếu chart chỉ có 300 bar hoặc không backfill khi pan trái, các nút `1M`, `3M`, `1Y`, `All` sẽ nhìn như hoạt động nhưng đang kể sai lịch sử thị trường.

How to verify: load demo, pan/scroll trái đến mép dữ liệu, xác nhận older Binance bars được fetch và append; click `1M`/`3M`/`1Y`/`All` và kiểm tra window tương ứng với dữ liệu thật đã tải cho đúng symbol.

## 5. AI session discipline

1. Đọc `AGENTS.md` và tài liệu trong `docs/project-delivery/` trước khi mở scope mới.
2. Không thêm text UI mới nếu chưa có i18n key.
3. Không chạm SSOT bằng patch bề mặt ở UI nếu root cause nằm trong data/accessor layer.
4. Sau edit đầu tiên phải có validation hẹp.
5. Với dữ liệu thị trường, luôn phân biệt rõ between source history loading and viewport range math.

## 6. Human gate

Những thay đổi sau cần review người thật trước khi merge:

- thay đổi policy SSOT
- đổi contract widget boundary
- thay đổi data source production-facing
- thêm dependency nền tảng cho i18n/state/data
