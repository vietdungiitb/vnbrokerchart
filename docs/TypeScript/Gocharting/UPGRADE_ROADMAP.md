# Kế hoạch nâng cấp dự án đạt tiêu chuẩn GoCharting

Kế hoạch này chia thành 4 giai đoạn, từ việc thay đổi cấu trúc khung nhìn đến việc tích hợp các tính năng chuyên sâu.

## Giai đoạn 1: Chuyển đổi kiến trúc Layout (Terminal Shell)
*Mục tiêu: Tạo ra khung làm việc giống một ứng dụng terminal thay vì một trang web.*

1. **Xây dựng `TerminalLayout`**:
    - Sử dụng `CSS Grid` hoặc `Flexbox` để chia 3 phần chính: Toolbar Top, Sidebar Left, và Main Center.
    - Implement khả năng ẩn/hiện Sidebar để tối ưu không gian cho Chart.
2. **Refactor `FullDemo.tsx`**:
    - Tách logic của `ChartCanvas` ra khỏi các component UI.
    - Đưa `ChartCanvas` vào vùng Main Center của layout mới.
3. **Thống nhất Design System**:
    - Sử dụng bảng màu Dark Mode chuẩn (ví dụ: Slate-900 cho nền, Slate-800 cho sidebar).
    - Đồng bộ font chữ và icon (Lucide-react hoặc Phosphor Icons).

## Giai đoạn 2: Interactive Toolbar & Drawing Tools
*Mục tiêu: Đưa các công cụ vẽ từ thư viện lên giao diện người dùng.*

1. **Sidebar Drawing Tools**:
    - Tạo danh sách các icon: Trendline, Fibonacci, Text, v.v.
    - Logic: Khi click vào icon, kích hoạt trạng thái "Interactive Mode" trên Chart.
2. **Tích hợp các Interactive Components**:
    - Kết nối Sidebar với `TrendLine`, `FibonacciRetracement`, `GannFan` có sẵn trong `src/lib/interactive`.
    - Xây dựng cơ chế "Object Selection" để người dùng có thể xóa hoặc sửa các đường đã vẽ.

## Giai đoạn 3: Dynamic Indicators & Command Center
*Mục tiêu: Cho phép người dùng tùy biến biểu đồ mà không cần sửa code.*

1. **Indicator Manager**:
    - Xây dựng Modal "Indicators" với thanh tìm kiếm.
    - Danh sách các chỉ báo: SMA, EMA, RSI, MACD, Bollinger Bands, Volume.
    - Logic: Cho phép thêm/xóa chỉ báo khỏi mảng `activeIndicators` trong Global State.
2. **Top Toolbar Controls**:
    - **Symbol Search**: Tích hợp ô tìm kiếm (dùng Binance API để lấy danh sách cặp tiền).
    - **Timeframe Selector**: Các nút bấm 1m, 5m, 15m, 1h, 4h, 1D. Khi đổi, trigger lại hàm fetch dữ liệu.
3. **Chart Settings**:
    - Cho phép đổi kiểu biểu đồ (Candlestick, Area, Heikin Ashi).

## Giai đoạn 4: Data Panels & Real-time Integration
*Mục tiêu: Hoàn thiện trải nghiệm terminal với dữ liệu trực tiếp.*

1. **Right Sidebar (Data Panels)**:
    - **Order Book**: Hiển thị lệnh mua/bán (Bid/Ask) từ WebSocket Binance.
    - **Trade History**: Danh sách các lệnh khớp gần nhất.
2. **WebSocket Synchronization**:
    - Thay thế cơ chế fetch định kỳ bằng WebSocket để biểu đồ nhảy "tick by tick".
3. **Persistance**:
    - Lưu trạng thái biểu đồ (layout, indicators, drawings) vào `localStorage`.
