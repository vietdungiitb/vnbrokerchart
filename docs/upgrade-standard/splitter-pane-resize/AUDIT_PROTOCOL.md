# Audit Protocol: Pane Splitter Resize

## 1. Mục tiêu audit

Xác nhận splitter pane hoạt động đúng chức năng, ổn định layout, và không gây regression cho chart demo.

## 2. Audit evidence bắt buộc

1. Log command:
   - npm run type-check
   - npm run build:docs
   - npm run test:soak
2. Video hoặc gif kéo splitter ở ít nhất 2 viewport.
3. Screenshot trước và sau khi resize pane.
4. Screenshot sau reload chứng minh persistence.
5. Ghi chú test case pass/fail theo bảng bên dưới.

## 3. Functional test matrix

| ID | Test case | Kỳ vọng | Status |
| :--- | :--- | :--- | :--- |
| F01 | Kéo splitter Price-Volume lên/xuống | Cả hai pane đổi chiều cao realtime | ⬜ |
| F02 | Kéo splitter Volume-Momentum lên/xuống | Cả hai pane đổi chiều cao realtime | ⬜ |
| F03 | Kéo tới giới hạn minHeight volume | Volume không nhỏ hơn minHeight | ⬜ |
| F04 | Kéo tới giới hạn minHeight momentum | Momentum không nhỏ hơn minHeight | ⬜ |
| F05 | Double-click splitter | Layout reset về mặc định | ⬜ |
| F06 | Reload trang sau khi kéo | Layout được khôi phục | ⬜ |
| F07 | Local storage invalid data | Fallback mặc định, không crash | ⬜ |
| F08 | Đổi timeframe khi đã resize | Layout vẫn hợp lệ, không vỡ pane | ⬜ |
| F09 | Đổi chart type khi đã resize | Layout vẫn hợp lệ, không vỡ pane | ⬜ |
| F10 | Resize cửa sổ nhỏ | Không pane nào bị 0/âm chiều cao | ⬜ |

## 4. Regression test matrix

| ID | Test case | Kỳ vọng | Status |
| :--- | :--- | :--- | :--- |
| R01 | Candlestick hiển thị | Nến hiển thị đầy đủ thân/wick | ⬜ |
| R02 | Volume pane hiển thị | Cột volume đọc được | ⬜ |
| R03 | MACD pane hiển thị | MACD lines/axis không bị cắt | ⬜ |
| R04 | Zoom + pan | Tương tác vẫn hoạt động | ⬜ |
| R05 | Tooltip/OHLC strip | Giá trị cập nhật đúng và readable | ⬜ |

## 5. Non-functional checks

1. Không giật mạnh khi kéo liên tiếp.
2. Không có warning/error mới trên console.
3. Không memory leak do listener chưa cleanup.

## 6. Sign-off rules

- QA sign-off khi toàn bộ Fxx và Rxx pass.
- Tech lead sign-off sau khi review clamp logic + persistence safety.
- Không merge nếu còn test case fail chưa có waiver.
