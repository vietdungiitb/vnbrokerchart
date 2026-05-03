# Migration Guide: Full JavaScript → TypeScript Conversion

Tài liệu này là hướng dẫn chiến thuật cho developer migrate từng file JS còn lại trong `src/` sang TypeScript. Đọc kỹ trước khi bắt tay vào bất kỳ file nào.

---

## 1. Tiền đề đã hoàn thành (không cần làm lại)

| Hạng mục | Trạng thái |
| :--- | :--- |
| React 19 context API (`contextTypes` / `childContextTypes`) | ✅ Đã xóa (S2) |
| `findDOMNode` | ✅ Đã xóa (S2) |
| `d3-collection`, `d3Event`, `componentWillMount` | ✅ Đã xóa (S13) |
| `ChartCanvas.tsx`, `GenericComponent.tsx` | ✅ Đã typed (S3) |
| `StockChartContext.tsx`, `src/lib/types.ts` | ✅ Đã typed (S1–S3) |
| `tsconfig.json` với `strict: true` | ✅ Đang hoạt động |

---

## 2. Quy trình chuẩn cho mỗi file

```
1. Đổi tên:  mv src/lib/foo/Bar.js  →  src/lib/foo/Bar.tsx  (nếu có JSX)
                                    →  src/lib/foo/Bar.ts   (nếu không có JSX)

2. Chạy:     npm run type-check  → ghi lại danh sách lỗi

3. Sửa lỗi theo thứ tự:
   a. Import missing types  (thêm import hoặc khai báo kiểu)
   b. Props / params       (thêm interface Props, gán kiểu tham số)
   c. Return types         (thêm kiểu trả về hàm)
   d. Lỗi runtime implicit-any còn lại  (dùng `unknown` hoặc generic)

4. KHÔNG refactor logic — chỉ thêm types.

5. Chạy lại: npm run build:docs  → đảm bảo không vỡ bundle
```

---

## 3. Patterns tái sử dụng thường gặp

### 3.1. Class component với propTypes

```typescript
import React from 'react';
import PropTypes from 'prop-types';

interface Props {
  xScale: any;         // thay bằng type cụ thể nếu biết
  width: number;
  height: number;
  onZoom?: (factor: number) => void;
}

// React 19 — runtime validation
MyComponent.propTypes = {
  xScale: PropTypes.any.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  onZoom: PropTypes.func,
};

MyComponent.defaultProps = {
  onZoom: undefined,
};
```

### 3.2. Functional component

```typescript
import React from 'react';

interface Props {
  value: number;
  label: string;
}

const MyDisplay: React.FC<Props> = ({ value, label }) => (
  <text>{label}: {value}</text>
);

export default MyDisplay;
```

### 3.3. Canvas draw function

```typescript
function drawOnCanvas(
  ctx: CanvasRenderingContext2D,
  moreProps: Record<string, unknown>
): void {
  // logic giữ nguyên
}
```

### 3.4. D3 scale type

```typescript
import { ScaleTime, ScaleLinear } from 'd3-scale';

// Continuous numeric scale
type NumericScale = ScaleLinear<number, number>;
// Time scale
type TimeScale = ScaleTime<number, number>;
```

### 3.5. xAccessor / displayXAccessor

```typescript
type Accessor<T, R> = (d: T) => R;
// Đã định nghĩa trong src/lib/types.ts — import từ đó
import { OHLCVDatum } from '../types';
```

---

## 4. Thứ tự migration theo giai đoạn

### Giai đoạn 1 — Foundation (ưu tiên cao, ít breaking)

Bắt đầu từ đây vì không có JSX, ít React deps, dễ test:

| # | File | Loại |
| :--- | :--- | :--- |
| 1 | `src/lib/utils/identity.js` | `.ts` |
| 2 | `src/lib/utils/noop.js` | `.ts` |
| 3 | `src/lib/utils/shallowEqual.js` | `.ts` |
| 4 | `src/lib/utils/rebind.js` | `.ts` |
| 5 | `src/lib/utils/merge.js` | `.ts` |
| 6 | `src/lib/utils/accumulatingWindow.js` | `.ts` |
| 7 | `src/lib/utils/slidingWindow.js` | `.ts` |
| 8 | `src/lib/utils/mappedSlidingWindow.js` | `.ts` |
| 9 | `src/lib/utils/zipper.js` | `.ts` |
| 10 | `src/lib/utils/barWidth.js` | `.ts` |
| 11 | `src/lib/utils/strokeDasharray.js` | `.ts` |
| 12 | `src/lib/utils/zoomBehavior.js` | `.ts` |
| 13 | `src/lib/utils/ChartDataUtil.js` | `.ts` |
| 14 | `src/lib/utils/PureComponent.js` | `.ts` |
| 15 | `src/lib/utils/index.js` | `.ts` |
| 16 | `src/lib/scale/levels.js` | `.ts` |
| 17 | `src/lib/scale/evaluator.js` | `.ts` |
| 18 | `src/lib/scale/financeDiscontinuousScale.js` | `.ts` |
| 19 | `src/lib/scale/discontinuousTimeScaleProvider.js` | `.ts` |
| 20 | `src/lib/scale/index.js` | `.ts` |
| 21 | `src/lib/helper/fitWidth.js` | `.ts` |
| 22 | `src/lib/helper/fitDimensions.js` | `.tsx` |
| 23 | `src/lib/helper/TypeChooser.js` | `.tsx` |
| 24 | `src/lib/helper/SaveChartAsImage.js` | `.ts` |
| 25 | `src/lib/helper/index.js` | `.ts` |
| 26–45 | `src/lib/calculator/*.js` (20 files) | `.ts` |
| 46 | `src/index.js` | `.ts` |

**Gate G1**: `npm run type-check` pass; `npm run build:docs` pass.

---

### Giai đoạn 2 — Visual primitives

| # | Nhóm | Files |
| :--- | :--- | :--- |
| 47–70 | `src/lib/series/` còn lại | ~24 files `.tsx` |
| 71–77 | `src/lib/axes/` | 7 files `.tsx` |
| 78–88 | `src/lib/coordinates/` | 11 files `.tsx` |
| 89–101 | `src/lib/tooltip/` | 13 files `.tsx` |
| 102–107 | `src/lib/annotation/` | 6 files `.tsx` |

**Gate G2**: Demo render đầy đủ candlestick + BB + RSI + MACD + axis + tooltip; `npm run type-check` pass.

---

### Giai đoạn 3 — Interactive & root

| # | Nhóm | Files |
| :--- | :--- | :--- |
| 108–128 | `src/lib/indicator/` | 21 files `.ts/.tsx` |
| 129–150 | `src/lib/interactive/` | 22 files `.tsx` |
| 151 | `src/lib/EventCapture.js` | `.tsx` |
| 152 | `src/lib/CanvasContainer.js` | `.tsx` |
| 153 | `src/lib/BackgroundText.js` | `.tsx` |
| 154 | `src/lib/ZoomButtons.js` | `.tsx` |

**Gate G3**: `npm run type-check` zero error; `0` file `.js` trong `src/`; zoom/pan/brush/indicators hoạt động.

---

## 5. Điều cấm tuyệt đối

- ❌ Đổi tên function, class, hoặc export đã có.
- ❌ Xóa `propTypes` block.
- ❌ Dùng `// @ts-ignore` mà không có comment giải thích.
- ❌ Merge commit nếu `npm run build:docs` vẫn đang báo lỗi.
- ❌ Bỏ qua file `index.js` của một thư mục — phải migrate cùng nhóm.

---

## 6. Cách xử lý `any` tạm thời

Khi không xác định được type cụ thể ngay lập tức, dùng quy ước:

```typescript
// TODO(ts-migration): narrow this type — currently unknown shape
const moreProps: Record<string, unknown> = ...;
```

Sau đó track qua backlog item **B-TS-XXX** để narrow sau.
