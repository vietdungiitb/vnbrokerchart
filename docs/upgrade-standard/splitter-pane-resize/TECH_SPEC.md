# Technical Spec: Pane Splitter Resize

## 1. Bối cảnh

Hiện chart có nhiều pane kỹ thuật (Price, Volume, Momentum) nhưng chiều cao đang chia tự động cố định, dẫn đến rủi ro pane bị quá thấp hoặc mất khả năng đọc. Tính năng splitter cần cho phép người dùng tự điều chỉnh chiều cao theo nhu cầu.

## 2. Scope

### In scope

- Splitter dọc giữa các pane kỹ thuật trong chart area.
- Resize theo kéo chuột/touch (pointer events).
- Giới hạn minHeight cho từng pane.
- Lưu layout pane theo tỉ lệ và khôi phục sau reload.
- Reset layout mặc định bằng double-click splitter.

### Out of scope

- Tùy biến màu splitter từ UI settings.
- Lưu layout theo user account backend.
- Splitter cho panel bên phải.

## 3. Yêu cầu chức năng

1. Người dùng hover splitter thấy cursor row-resize.
2. Pointer down trên splitter kích hoạt drag mode.
3. Khi kéo, hai pane kề splitter thay đổi chiều cao ngược chiều nhau.
4. Nếu một pane chạm minHeight thì dừng co tiếp pane đó (clamp).
5. Pointer up kết thúc drag và commit state.
6. Double-click splitter reset về preset mặc định.
7. Layout sau commit được lưu local storage.

## 4. Ràng buộc kỹ thuật

1. Lưu state theo tỉ lệ thay vì px để giữ ổn định khi resize cửa sổ.
2. Trong runtime render, quy đổi ratio -> px từ chartHeight hiện tại.
3. Tổng chiều cao pane phải luôn bằng vùng pane khả dụng.
4. Không dùng API React legacy.
5. Tương thích strict TypeScript.

## 5. Dữ liệu trạng thái đề xuất

```ts
interface PaneLayoutRatio {
  price: number;
  volume: number;
  momentum: number;
}

interface PaneResizeConstraints {
  priceMinPx: number;
  volumeMinPx: number;
  momentumMinPx: number;
}
```

## 6. Thuật toán resize đề xuất

1. Xác định splitter index đang kéo.
2. Đọc deltaY từ pointer hiện tại so với pointerDown.
3. Tính candidateHeight cho pane phía trên và pane phía dưới.
4. Clamp cả hai candidate theo minHeight.
5. Nếu clamp phát sinh, điều chỉnh pane đối diện tương ứng để bảo toàn tổng.
6. Commit ratio mới sau mỗi frame cập nhật.

## 7. UI/UX acceptance

1. Splitter luôn nhìn thấy ở ranh giới pane.
2. Drag phản hồi trực quan, không trễ gây khó chịu.
3. Pane không giật, không nhảy layout bất thường khi kéo nhanh.
4. Khi reset, layout trở về preset mặc định ngay lập tức.

## 8. Các nguy cơ cần chặn

1. Pane âm chiều cao khi chartHeight giảm mạnh.
2. Sai lệch tổng chiều cao do làm tròn px.
3. Mất state khi đổi timeframe/chart type.
4. Local storage dữ liệu hỏng gây crash.

## 9. Biện pháp an toàn

1. Hàm sanitize layout ratio trước khi apply.
2. Fallback về preset mặc định nếu dữ liệu persisted invalid.
3. Clamp cuối cùng sau mỗi lần quy đổi ratio -> px.
4. Unit test cho các case biên (minHeight, resize nhỏ, drag cực nhanh).
