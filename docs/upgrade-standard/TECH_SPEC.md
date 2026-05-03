# Technical Specification: React Stockcharts — Full TypeScript Migration (v3.0)

## 1. Mục tiêu chương trình

Chuyển đổi **100% source code** trong `src/` từ JavaScript sang **TypeScript nghiêm ngặt** tương thích với:

| Thư viện | Phiên bản hiện tại | Trạng thái |
| :--- | :--- | :--- |
| React / React-DOM | 19.x | ✅ Đang dùng |
| TypeScript | 5.9.x | ✅ Đang dùng |
| D3 (scale/array/shape/time…) | v3–v4 scoped packages | ✅ Đang dùng |
| Webpack | 5.x | ✅ Đang dùng |

Sau migration, **không còn file `.js` nào trong `src/`**. Toàn bộ 168 file JS còn lại phải được rename và typed đầy đủ.

## 2. Phạm vi hiện trạng

- **File JS chưa migrate**: 168 (tính đến 2026-05-03)
- **File TS/TSX đã migrate**: 20
- **Tổng**: 188 source files

Phân bổ theo thư mục:

| Thư mục | File JS | Ghi chú |
| :--- | ---: | :--- |
| `src/lib/utils/` | 14 | Pure functions — ít phụ thuộc |
| `src/lib/scale/` | 5 | Discontinuous scale engine |
| `src/lib/calculator/` | 20 | Indicator math (atr, bb, ema, macd…) |
| `src/lib/indicator/` | 21 | Indicator wrappers |
| `src/lib/series/` | 27 | Chart primitives (đã có 3 TS) |
| `src/lib/axes/` | 7 | XAxis, YAxis, AxisLine… |
| `src/lib/coordinates/` | 11 | Cursor, EdgeCoordinate… |
| `src/lib/tooltip/` | 13 | Tooltip layer |
| `src/lib/annotation/` | 6 | Annotate, Label… |
| `src/lib/helper/` | 5 | fitWidth, fitDimensions… |
| `src/lib/interactive/` | 22 | Brush, TrendLine, Fib… |
| `src/lib/` (root) | 5 | EventCapture, CanvasContainer, BackgroundText, ZoomButtons, index |
| `src/` (root) | 1 | index.js |

## 3. Kiến trúc TypeScript mục tiêu

### 3.1. Strict mode

`tsconfig.json` đã bật `"strict": true`. Mọi file migrate phải **pass strict** — không được dùng `@ts-ignore` trừ trường hợp có comment giải thích + issue link.

### 3.2. Type hierarchy (đã tồn tại, cần mở rộng)

```
src/lib/types.ts          ← domain types chung (OHLCV, ChartConfig, …)
src/lib/StockChartContext.tsx  ← context typed
src/lib/ChartCanvas.tsx   ← root engine (TS)
src/lib/GenericComponent.tsx  ← base component (TS)
```

Mỗi nhóm file có thể thêm type file riêng trong thư mục nếu cần, ví dụ `src/lib/interactive/types.ts`.

### 3.3. Mẫu component chuẩn

```typescript
// Class component giữ nguyên nếu dùng static contextType
import React from 'react';
import PropTypes from 'prop-types';

interface Props {
  // khai báo đầy đủ
}

class MyComponent extends React.Component<Props> {
  static propTypes = { /* giữ lại — không xóa */ };
  static defaultProps: Partial<Props> = { /* … */ };
  render() { return null; }
}
export default MyComponent;

// Functional component ưu tiên khi không cần class
const MyFunc: React.FC<Props> = (props) => { … };
```

### 3.4. D3 typing

- Dùng `@types/d3-scale`, `@types/d3-array`, `@types/d3-shape` (đã cài).
- Các hàm D3 trả về `ScaleContinuousNumeric` hoặc `ScaleTime` phải được type rõ.
- Không dùng `any` cho scale domain/range — dùng `Date | number` hoặc generic đúng.

### 3.5. Canvas / SVG hybrid rendering

Không thay đổi logic vẽ. Chỉ:
1. Rename file `.js` → `.ts` / `.tsx`.
2. Thêm types cho params và return values.
3. Sửa lỗi compile tối thiểu — **không refactor logic**.

## 4. Nguyên tắc bắt buộc

1. **Không refactor logic** khi migrate — chỉ thêm types.
2. **Giữ nguyên `propTypes`** ở mọi file được chạm; thêm ghi chú `// React 19 — runtime validation` nếu muốn.
3. **Không dùng `contextTypes`/`childContextTypes`** — đã bị xóa từ S2.
4. **Không dùng `findDOMNode`** — đã bị xóa từ S2.
5. **Gate từng giai đoạn**: `npm run type-check` phải pass sau mỗi giai đoạn.
6. **Demo không được vỡ** sau bất kỳ commit nào — `npm run build:docs` phải pass.

## 5. Giai đoạn migration (3 giai đoạn)

### Giai đoạn 1 — Foundation (S16–S17)
Pure functions và scale engine — ít JSX, ít React deps.

**Phạm vi**: `utils/`, `scale/`, `helper/`, `calculator/`, `src/index.js`

**Gate**: `npm run type-check` pass; `npm run build:docs` pass.

### Giai đoạn 2 — Visual primitives (S18–S20)
React components dùng Canvas/SVG nhưng ít interactive state.

**Phạm vi**: `series/` (còn lại), `axes/`, `coordinates/`, `tooltip/`, `annotation/`

**Gate**: Demo render đủ candlestick + BB + RSI + MACD + axis + tooltip.

### Giai đoạn 3 — Interactive & root (S21–S22)
Components phức tạp nhất (event handling, drawing tools) và các file root.

**Phạm vi**: `interactive/`, `indicator/`, `EventCapture.js`, `CanvasContainer.js`, `BackgroundText.js`, `ZoomButtons.js`

**Gate**: Zoom, pan, brush, indicator wrappers hoạt động; `npm run type-check` zero error; 0 file `.js` còn lại trong `src/`.

## 6. Performance targets (giữ nguyên)

- Frame rate: > 60fps trong pan.
- Initial load: < 200ms cho 10,000 điểm dữ liệu.
- Bundle size không tăng > 5% so với baseline hiện tại.
