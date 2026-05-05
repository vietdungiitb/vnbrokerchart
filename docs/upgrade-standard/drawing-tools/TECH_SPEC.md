# Technical Spec: Drawing Tools Engine

## 1. Bối cảnh

Repo hiện có data model và state machine cho drawing tools (`src/lib/drawing/`), nhưng:
1. Tất cả built-in tool có `render: () => undefined` — không có rendering thực.
2. Không có coordinate bridge để map pixel chuột ↔ giá trị giá/thời gian.
3. Toolbar `activeTool` state chưa wire vào bất kỳ interaction logic nào.

Feature này xây lớp thực thi trên nền sẵn có, không thay thế data model đã được kiểm chứng.

## 2. Scope

### In scope — M1

- Coordinate bridge: pixel chuột → chart-space point (price + bar index).
- SVG render layer mount trên chart area.
- Interactive drawing creation: click-and-drag từ toolbar selection.
- Preview real-time khi move chuột trong drawing mode.
- Selection, delete, undo/redo bằng keyboard.
- 8 tool types: Trend Line, H-Line, V-Line, Fibonacci, Channel, Text, Rectangle, Arrow.

### In scope — M2

- DrawingInspector: floating property panel khi có selected drawing.
- Persistence: localStorage per symbol + timeframe.
- Export/Import JSON.

### In scope — M3

- Price Range (measure tool).
- Position Box (risk-reward box).
- Fibonacci Extension.
- Multi-select.
- Toolbar nhóm với divider.

### Out of scope

- Backend persistence (Django/REST).
- Drawing templates/sharing.
- Alert triggers từ drawing levels.
- Drawing trên indicator panes (chỉ price pane M1/M2).
- Snap vào OHLC high/low (có thể thêm M3+).

## 3. Data Model

### DrawingObject (hiện tại — giữ nguyên, chỉ extend)

```typescript
// src/lib/drawing/types.ts — hiện tại
export interface DrawingObject {
  id: string;
  type: DrawingToolType;
  points: Point[];        // chart coordinates — KHÔNG phải pixel
  style: DrawingStyle;
  text?: string;
  extendLeft?: boolean;
  extendRight?: boolean;
  locked?: boolean;
  visible?: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### Extension cần thêm (M1)

```typescript
// Bổ sung 2 tool type mới vào union
export type DrawingToolType =
  | "trendLine" | "hLine" | "vLine"
  | "fibonacci" | "channel" | "text"
  | "rectangle"   // NEW M1
  | "arrow";      // NEW M1

// Bổ sung field cho label fibonacci
// (không break existing — optional)
// interface DrawingObject:
//   fibLevels?: number[];   // custom levels, default [0,0.236,0.382,0.5,0.618,0.786,1.0,1.618,2.618]
//   label?: string;         // user label for any drawing
```

### Extension cần thêm (M2)

```typescript
// Bổ sung context cho persistence
// interface DrawingObject:
//   symbol?: string;      // e.g. "BTCUSD"
//   timeframe?: string;   // e.g. "1h"

// DrawingStyle stroke typing
export interface DrawingStyle {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: "solid" | "dashed" | "dotted";  // M2: type đúng hơn
  fill?: string;
  opacity?: number;
  fontSize?: number;
  fontFamily?: string;
}
```

### Extension cần thêm (M3)

```typescript
// Bổ sung 3 tool type mới
export type DrawingToolType =
  // ... existing ...
  | "priceRange"    // NEW M3
  | "positionBox"   // NEW M3
  | "fibExtension"; // NEW M3

// interface DrawingObject:
//   riskReward?: { entry: number; stop: number; target: number };
```

## 4. Coordinate Bridge

### Vấn đề cốt lõi

Chart dùng D3 `scaleTime` cho trục X (time → pixel) và `scaleLinear` cho trục Y (price → pixel). DrawingObject lưu chart coordinates, không phải pixel. Cần bridge bidirectional.

### Spec

```typescript
// src/lib/drawing/coordinateUtils.ts

export interface ChartScales {
  xScale: (date: Date) => number;          // time → pixel x
  xScaleInvert: (px: number) => Date;      // pixel x → time
  yScale: (price: number) => number;       // price → pixel y
  yScaleInvert: (px: number) => number;    // pixel y → price
  xAccessor: (datum: PlotDatum) => Date;   // datum → Date
  plotData: PlotDatum[];                   // visible bar data
}

export interface PlotDatum {
  date: Date | number;
  open: number; high: number; low: number; close: number;
  volume: number;
  [key: string]: unknown;
}

// Map pixel (e, rect) → chart Point
export function pixelToChartPoint(
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  scales: ChartScales
): Point {
  const px = clientX - containerRect.left;
  const py = clientY - containerRect.top;
  return {
    x: scales.xScaleInvert(px).getTime(),  // store as timestamp number
    y: scales.yScaleInvert(py),
  };
}

// Map chart Point → pixel (for render)
export function chartPointToPixel(
  point: Point,
  scales: ChartScales
): { x: number; y: number } {
  return {
    x: scales.xScale(new Date(point.x)),
    y: scales.yScale(point.y),
  };
}
```

**Lưu ý quan trọng:** `Point.x` lưu timestamp (milliseconds). Điều này làm cho DrawingObject portable theo thời gian, không phụ thuộc vào index của bar trong dataset.

## 5. SVG Render Functions

### Spec

```typescript
// src/lib/drawing/renderSvg.ts

import type { DrawingObject } from "./types";
import type { ChartScales } from "./coordinateUtils";
import { chartPointToPixel } from "./coordinateUtils";

export interface RenderResult {
  // JSX elements (ReactElement[]) — trả về để DrawingLayer render
  elements: ReactElement[];
  // Handles cho resize — circle SVG elements
  handles: HandleSpec[];
}

export interface HandleSpec {
  id: string;        // "start" | "end" | "p3" | ...
  cx: number;
  cy: number;
}

// Mỗi render function nhận drawing + scales, trả về SVG path/line specs
export function renderTrendLine(drawing: DrawingObject, scales: ChartScales): RenderResult;
export function renderHLine(drawing: DrawingObject, scales: ChartScales, chartWidth: number): RenderResult;
export function renderVLine(drawing: DrawingObject, scales: ChartScales, chartHeight: number): RenderResult;
export function renderFibonacci(drawing: DrawingObject, scales: ChartScales, chartWidth: number): RenderResult;
export function renderChannel(drawing: DrawingObject, scales: ChartScales): RenderResult;
export function renderText(drawing: DrawingObject, scales: ChartScales): RenderResult;
export function renderRectangle(drawing: DrawingObject, scales: ChartScales): RenderResult;
export function renderArrow(drawing: DrawingObject, scales: ChartScales): RenderResult;
```

### Fibonacci detail

Levels mặc định: `[0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.618, 2.618]`

Mỗi level render 1 horizontal line + label bên phải: `"61.8% — 94,250.00"`

## 6. DrawingLayer Component

### Spec

```typescript
// src/lib/drawing/DrawingLayer.tsx

export interface DrawingLayerProps {
  width: number;
  height: number;
  scales: ChartScales;
  activeTool: string;                      // từ demo toolbar
  onToolUsed?: () => void;                 // callback về cursor sau khi vẽ xong 1 drawing
}

// Component mount SVG overlay absolute-positioned trên chart area
// Xử lý toàn bộ pointer events
// Compose: useDrawingInteraction + renderSvg functions
// SVG element dùng pointer-events: all; các pane khác dùng pointer-events: none khi đang draw mode

export default function DrawingLayer(props: DrawingLayerProps): ReactElement;
```

### Interaction lifecycle

```
activeTool === "trendLine"
  → pointerDown: dispatch START_DRAWING, pixelToChartPoint → startPoint
  → pointerMove: dispatch UPDATE_DRAWING, preview end point
  → pointerUp (2nd click): dispatch COMPLETE_DRAWING, historyReducer PUSH

activeTool === "hLine"
  → pointerDown: dispatch START_DRAWING
  → (no pointerMove preview needed — y fixed)
  → pointerUp: dispatch COMPLETE_DRAWING

activeTool === "text"
  → pointerDown: dispatch START_DRAWING
  → pointerUp: dispatch COMPLETE_DRAWING, then START_EDITING
  → input blur: commit text

activeTool === "cursor"
  → pointerDown trên drawing: dispatch SELECT_OBJECT
  → pointerMove khi selected + drag: dispatch START_MOVING
  → pointerUp: commit move to history
```

## 7. useDrawingInteraction Hook

```typescript
// src/lib/drawing/useDrawingInteraction.ts

export interface UseDrawingInteractionReturn {
  drawingState: DrawingState;
  history: DrawingHistory;
  dispatch: Dispatch<DrawingAction>;
  undo: () => void;
  redo: () => void;
  deleteSelected: () => void;
  cancelDrawing: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useDrawingInteraction(
  initialDrawings?: DrawingObject[]
): UseDrawingInteractionReturn;
```

Hook wrap `useReducer(drawingReducer)` và `useReducer(historyReducer)`. Không có side effects — pure state management.

## 8. DynamicChart Integration

`DynamicChart.tsx` cần nhận thêm prop:

```typescript
export interface DynamicChartProps {
  // ... existing props ...
  drawingLayerProps?: {
    activeTool: string;
    scales?: ChartScales;                  // injected by chart after render
    onToolUsed?: () => void;
  };
}
```

Hoặc cách thực thi đơn giản hơn (ưu tiên M1): `LibraryShowcaseDemo` mount `DrawingLayer` trực tiếp bên ngoài `DynamicChart`, vì nó đã có `chartWidth`/`chartHeight` và có thể wrap chart area bằng `position: relative` container.

**Khuyến nghị M1:** Mount `DrawingLayer` ở demo layer (LibraryShowcaseDemo), không cần chạm `DynamicChart.tsx`. Điều này tránh breaking DynamicChart và giữ separation rõ.

## 9. Constraint kiến trúc

| ID | Constraint | Guard |
| :--- | :--- | :--- |
| AC-01 | `src/lib/drawing/` không import từ `src/demo/` | Scan import — zero cross-boundary |
| AC-02 | DrawingObject không chứa pixel coordinates | `pixelX\|pixelY\|screenX\|screenY` không có trong types |
| AC-03 | DrawingObject không chứa CanvasRenderingContext2D | Scan types.ts |
| AC-04 | State machine dùng discriminated union, không dùng boolean flags | G09: no `isDrawing\|drawingMode` |
| AC-05 | JSON.stringify(drawingObject) không throw | Unit test |
| AC-06 | Mọi UI text mới phải có i18n key trong `src/demo/i18n.tsx` | Review diff |

## 10. Performance constraints

- Không re-render toàn bộ chart khi chuột move trong drawing mode — chỉ re-render SVG overlay.
- DrawingLayer dùng `React.memo` hoặc tách state riêng để isolate re-render.
- `renderSvg` functions là pure — không side effects, có thể memoize.

## 11. Danh sách file cần tạo/sửa tổng hợp

### Tạo mới

| File | Milestone |
| :--- | :--- |
| `src/lib/drawing/coordinateUtils.ts` | M1 |
| `src/lib/drawing/renderSvg.ts` | M1 |
| `src/lib/drawing/useDrawingInteraction.ts` | M1 |
| `src/lib/drawing/DrawingLayer.tsx` | M1 |
| `src/lib/drawing/builtin/rectangle.ts` | M1 |
| `src/lib/drawing/builtin/arrow.ts` | M1 |
| `src/lib/drawing/DrawingInspector.tsx` | M2 |
| `src/lib/drawing/DrawingStorage.ts` | M2 |
| `src/lib/drawing/useDrawingStorage.ts` | M2 |
| `src/lib/drawing/builtin/priceRange.ts` | M3 |
| `src/lib/drawing/builtin/positionBox.ts` | M3 |
| `src/lib/drawing/builtin/fibExtension.ts` | M3 |

### Sửa

| File | Thay đổi | Milestone |
| :--- | :--- | :--- |
| `src/lib/drawing/types.ts` | Thêm "rectangle"\|"arrow" vào DrawingToolType; fibLevels, label optional | M1 |
| `src/lib/drawing/index.ts` | Export mới: DrawingLayer, useDrawingInteraction, coordinateUtils, Rectangle, Arrow | M1 |
| `src/lib/drawing/types.ts` | Thêm "priceRange"\|"positionBox"\|"fibExtension"; symbol, timeframe optional | M2/M3 |
| `src/demo/LibraryShowcaseDemo.tsx` | Mount DrawingLayer, wire activeTool, keyboard handler | M1 |
| `src/demo/LibraryShowcaseDemo.tsx` | Mount DrawingInspector, useDrawingStorage | M2 |
| `src/demo/LibraryShowcaseDemo.tsx` | Thêm 3 tool M3 + toolbar group divider | M3 |
| `src/demo/i18n.tsx` | Thêm i18n keys mới theo mỗi milestone | M1/M2/M3 |
| `src/demo/demo.css` | Cursor rules, drawing handles, inspector panel styles | M1/M2/M3 |
