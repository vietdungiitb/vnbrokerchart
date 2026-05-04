# Phân tích khoảng cách: GoCharting vs. Dự án hiện tại

Tài liệu này so sánh các tính năng và trải nghiệm người dùng của [GoCharting Terminal](https://gocharting.com/terminal?ticker=BYBIT:BTCUSD) với trạng thái hiện tại của dự án `react-stockcharts`.

## 1. So sánh tổng quan

| Hạng mục | GoCharting Terminal | Dự án hiện tại (`FullDemo.tsx`) |
| :--- | :--- | :--- |
| **Bố cục (Layout)** | **Dạng Terminal chuyên nghiệp**: Đa bảng (Multi-pane), sidebar linh hoạt, toolbar cố định. | **Dạng Trang Web truyền thống**: Biểu đồ nằm trong một card, có panel thông tin bên cạnh. |
| **Công cụ vẽ (Drawing Tools)** | Sidebar bên trái chứa Trendlines, Fibonacci, Gann, Shapes, v.v. | Chưa có UI điều khiển (Mặc dù thư viện có hỗ trợ trong `lib/interactive`). |
| **Chỉ báo (Indicators)** | Menu tìm kiếm động, cho phép thêm/xóa/cấu hình hàng trăm chỉ báo. | Cấu hình cứng (Hardcoded) trong code: EMA, RSI, MACD, Bollinger. |
| **Dữ liệu thực tế** | WebSocket thời gian thực, Orderbook, DOM, Trade History. | REST API (Binance) hoặc dữ liệu offline CSV. |
| **Tương tác** | Context menu, phím tắt chuyên nghiệp, kéo thả bảng. | Zoom/Pan cơ bản, tooltip, brush span. |
| **Thẩm mỹ (Aesthetics)** | Dark mode sâu, các dải màu gradient, icon hiện đại, font chuyên dụng. | Theme hiện đại nhưng vẫn mang tính chất "bản demo" hơn là "sản phẩm". |

## 2. Các vấn đề cốt lõi của dự án hiện tại

1. **Thiếu Shell Terminal**: Dự án hiện tại không tạo cảm giác là một "Công cụ giao dịch". Nó giống một trang báo cáo hơn. Người dùng không thể tối đa hóa không gian biểu đồ một cách linh hoạt.
2. **Thiếu khả năng tùy biến động**: Để thêm một chỉ báo mới hoặc thay đổi mã (ticker), người dùng phải sửa code. GoCharting cho phép thực hiện tất cả qua UI.
3. **Quản lý trạng thái (State Management)**: Hiện tại `FullDemo.tsx` quản lý mọi thứ bằng `useState` đơn lẻ. Khi nâng cấp lên cấp độ GoCharting, cần một hệ thống quản lý trạng thái phức tạp hơn (như Redux Toolkit hoặc Zustand) để đồng bộ hóa giữa các panel.
4. **Hiệu suất UI**: GoCharting tối ưu hóa việc render sidebar và toolbar để không ảnh hưởng đến tốc độ của Canvas. Dự án hiện tại đang render mọi thứ chung trong một cây React lớn, có thể gây lag khi nhiều thành phần cùng cập nhật.

## 3. Các tính năng "Pro" còn thiếu

- **Symbol Search**: Một thanh tìm kiếm thông minh hỗ trợ nhiều sàn giao dịch.
- **Timeframe Switcher**: Nút chuyển nhanh 1m, 5m, 1h, 1D.
- **Layer Manager**: Quản lý các đối tượng đã vẽ trên biểu đồ (ẩn/hiện/xóa).
- **Multi-Chart Layout**: Khả năng chia màn hình thành 2, 3, 4 biểu đồ khác nhau.
- **Save/Load Template**: Lưu cấu hình chỉ báo và các đường vẽ.
