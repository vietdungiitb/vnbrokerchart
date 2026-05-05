# Technical Spec: Drawing Tools Engine

## 1. Bối cảnh

M1 đã hoàn thành (commit `b1bf284`, 2026-05-05). Hệ thống có đầy đủ: coordinate bridge, SVG render engine, 8 built-in tools, DrawingLayer overlay, useDrawingInteraction hook, keyboard shortcuts, i18n, Vitest unit tests.

Spec này bao gồm toàn bộ M1→M4. Phần M1 là reference; M2→M4 là specification cho đội code implement.

## 2. Scope

### ✅ Done — M1 (2026-05-05)

- Coordinate bridge: `pixelToChartPoint` / `chartPointToPixel`.
- SVG render layer (`DrawingLayer.tsx`) mount qua `GenericComponent`.
- 8 tool types: trendLine, hLine, vLine, fibonacci, channel, text, rectangle, arrow.
- Selection, delete, undo/redo (Ctrl+Z/Y/Shift+Z, Del, ESC).
- 67 unit tests pass; type-check clean; build clean.

### In scope — M2

- DrawingInspector: floating property panel (màu, stroke width, line style, lock, clone, hide, z-order).
- DrawingListPanel: danh sách drawings sidebar.
- Persistence: localStorage per symbol+timeframe, auto-save.
- Export JSON / Import JSON.

### In scope — M3

- 7 công cụ mới: Ray, Extended Line (X-Line), Polyline, Date & Price Range, Long Position, Short Position, Fibonacci Extension.
- Multi-select (Shift+click, drag-box select, group delete/move).
- Toolbar groups với visual divider: Lines | Fibonacci | Shapes | Analysis.

### In scope — M4

- 6 công cụ pro: Parallel Channel (3-point), Andrew's Pitchfork, ABCD Harmonic, Fibonacci Arc, Fibonacci Time Zone, Regression Channel.
- Drawings list sort/filter.
- Snap to OHLC high/low (optional, nếu time permits).

### Out of scope (tất cả milestone)

- Backend persistence (Django/REST/cloud).
- Drawing templates/sharing/publish.
- Alert triggers từ drawing levels.
- Drawing trên indicator panes (chỉ price pane).

## 3. Data Model

### DrawingObject (hiện tại — giữ nguyên, chỉ extend)

```typescript
### DrawingObject — as-built M1 (đây là contract hiện tại, không thay đổi)

```typescript
// src/lib/drawing/types.ts — AS-BUILT M1
export type DrawingToolType =
  | "trendLine" | "hLine" | "vLine"
  | "fibonacci" | "channel" | "text"
  | "rectangle" | "arrow";

export interface DrawingStyle {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;  // chuỗi SVG dasharray, e.g. "5,3"
  fill?: string;
  opacity?: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface DrawingObject {
  id: string;
  type: DrawingToolType;
  points: Point[];        // LUÔN chart coordinates — timestamp (ms) + price. KHÔNG BAO GIỜ pixel.
  style: DrawingStyle;
  text?: string;
  fibLevels?: number[];   // custom fib levels nếu khác default
  label?: string;
  extendLeft?: boolean;
  extendRight?: boolean;
  locked?: boolean;
  visible?: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### Extension M2 — thêm vào types.ts

```typescript
// Bổ sung vào DrawingToolType union — KHÔNG xóa items cũ
export type DrawingToolType =
  | "trendLine" | "hLine" | "vLine"
  | "fibonacci" | "channel" | "text"
  | "rectangle" | "arrow"
  // M2: không thêm tool type mới — chỉ extend DrawingObject fields

// Bổ sung optional fields vào DrawingObject interface:
//   symbol?: string;         // e.g. "BTCUSD" — cho localStorage key
//   timeframe?: string;      // e.g. "1h"
//   zIndex?: number;         // z-order trong drawing list, default 0
//   clonedFrom?: string;     // id của drawing gốc nếu là bản clone

// Sửa DrawingStyle.strokeDasharray thành union type rõ ràng:
export interface DrawingStyle {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: "solid" | "4,4" | "2,2";  // solid | dashed | dotted
  fill?: string;
  fillOpacity?: number;      // NEW M2 — tách riêng fill opacity khỏi stroke opacity
  opacity?: number;
  fontSize?: number;
  fontFamily?: string;
}
```

### Extension M3 — thêm vào types.ts

```typescript
// Bổ sung vào DrawingToolType union:
export type DrawingToolType =
  | "trendLine" | "hLine" | "vLine"
  | "fibonacci" | "channel" | "text"
  | "rectangle" | "arrow"
  | "ray"              // NEW M3 — extends 1 direction
  | "extendedLine"     // NEW M3 — extends both directions (X-Line)
  | "polyline"         // NEW M3 — multi-segment, N points
  | "dateAndPriceRange" // NEW M3 — box + badge Δ%
  | "longPosition"     // NEW M3 — entry/TP/SL box green/red
  | "shortPosition"    // NEW M3 — inverted longPosition
  | "fibExtension";    // NEW M3 — extension levels beyond range

// Bổ sung optional fields vào DrawingObject:
//   riskReward?: {
//     entry: number;       // price
//     stop: number;        // price
//     target: number;      // price
//     quantity?: number;   // số lượng (cho P&L calc)
//   };
//   multiSelectGroup?: string;  // group id khi multi-select
```

### Extension M4 — thêm vào types.ts

```typescript
// Bổ sung vào DrawingToolType union:
  | "parallelChannel"    // NEW M4 — 3 points, 2 parallel lines + midline
  | "pitchfork"          // NEW M4 — Andrew's Pitchfork, 3 points A/B/C
  | "abcdPattern"        // NEW M4 — 4 points A/B/C/D
  | "fibArc"             // NEW M4 — 2 points → 3 arcs at 0.382/0.5/0.618
  | "fibTimeZone"        // NEW M4 — vertical columns at Fib intervals
  | "regressionChannel"; // NEW M4 — best-fit line + std-dev bands
```

## 4. Coordinate Bridge — AS-BUILT
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

### Tạo mới (M1 = DONE ✅)

| File | Milestone | Trạng thái |
| :--- | :--- | :--- |
| `src/lib/drawing/coordinateUtils.ts` | M1 | ✅ Done |
| `src/lib/drawing/renderSvg.ts` | M1 | ✅ Done |
| `src/lib/drawing/useDrawingInteraction.ts` | M1 | ✅ Done |
| `src/lib/drawing/DrawingLayer.tsx` | M1 | ✅ Done |
| `src/lib/drawing/builtin/rectangle.ts` | M1 | ✅ Done |
| `src/lib/drawing/builtin/arrow.ts` | M1 | ✅ Done |
| `src/lib/drawing/DrawingInspector.tsx` | M2 | TODO |
| `src/lib/drawing/DrawingStorage.ts` | M2 | TODO |
| `src/lib/drawing/useDrawingStorage.ts` | M2 | TODO |
| `src/lib/drawing/DrawingListPanel.tsx` | M2 | TODO |
| `src/lib/drawing/builtin/ray.ts` | M3 | TODO |
| `src/lib/drawing/builtin/extendedLine.ts` | M3 | TODO |
| `src/lib/drawing/builtin/polyline.ts` | M3 | TODO |
| `src/lib/drawing/builtin/dateAndPriceRange.ts` | M3 | TODO |
| `src/lib/drawing/builtin/longPosition.ts` | M3 | TODO |
| `src/lib/drawing/builtin/shortPosition.ts` | M3 | TODO |
| `src/lib/drawing/builtin/fibExtension.ts` | M3 | TODO |
| `src/lib/drawing/builtin/parallelChannel.ts` | M4 | TODO |
| `src/lib/drawing/builtin/pitchfork.ts` | M4 | TODO |
| `src/lib/drawing/builtin/abcdPattern.ts` | M4 | TODO |
| `src/lib/drawing/builtin/fibArc.ts` | M4 | TODO |
| `src/lib/drawing/builtin/fibTimeZone.ts` | M4 | TODO |
| `src/lib/drawing/builtin/regressionChannel.ts` | M4 | TODO |

### Sửa

| File | Thay đổi | Milestone | Trạng thái |
| :--- | :--- | :--- | :--- |
| `src/lib/drawing/types.ts` | +rectangle, arrow, fibLevels, label | M1 | ✅ Done |
| `src/lib/drawing/index.ts` | Export M1 symbols | M1 | ✅ Done |
| `src/lib/drawing/types.ts` | +symbol, timeframe, zIndex, clonedFrom, fillOpacity, dasharray union | M2 | TODO |
| `src/lib/drawing/index.ts` | Export M2: DrawingInspector, DrawingStorage, useDrawingStorage, DrawingListPanel | M2 | TODO |
| `src/lib/drawing/types.ts` | +ray, extendedLine, polyline, dateAndPriceRange, longPosition, shortPosition, fibExtension, riskReward | M3 | TODO |
| `src/lib/drawing/stateMachine.ts` | +multi-select state | M3 | TODO |
| `src/lib/drawing/renderSvg.ts` | +render cho 7 M3 tools | M3 | TODO |
| `src/lib/drawing/DrawingLayer.tsx` | +Shift+click multi-select, polyline N-click | M3 | TODO |
| `src/lib/drawing/index.ts` | Export M3 tools | M3 | TODO |
| `src/lib/drawing/types.ts` | +parallelChannel, pitchfork, abcdPattern, fibArc, fibTimeZone, regressionChannel | M4 | TODO |
| `src/lib/drawing/renderSvg.ts` | +render cho 6 M4 tools | M4 | TODO |
| `src/lib/drawing/DrawingLayer.tsx` | +N-click accumulation cho pitchfork, ABCD | M4 | TODO |
| `src/lib/drawing/index.ts` | Export M4 tools | M4 | TODO |
| `src/demo/LibraryShowcaseDemo.tsx` | M1: DrawingLayer mount, keyboard ✅; M2: Inspector + storage; M3: +7 tools + groups; M4: +6 tools | M1-M4 | M1 ✅ |
| `src/demo/i18n.tsx` | i18n keys mới theo mỗi milestone | M1-M4 | M1 ✅ |
| `src/demo/demo.css` | Cursor rules, inspector panel, position box colors, group badges | M1-M4 | M1 partial |

## 12. Spec chi tiết M2 — DrawingInspector + DrawingStorage

### DrawingStorage

```typescript
// src/lib/drawing/DrawingStorage.ts

export interface DrawingStorageAdapter {
  save(symbol: string, timeframe: string, drawings: DrawingObject[]): void;
  load(symbol: string, timeframe: string): DrawingObject[];
  clear(symbol: string, timeframe: string): void;
  exportJSON(drawings: DrawingObject[]): string;          // returns JSON string
  importJSON(json: string): DrawingObject[];              // throws DrawingImportError if invalid
}

export class DrawingImportError extends Error {
  constructor(message: string) { super(message); }
}

export function createLocalStorageAdapter(): DrawingStorageAdapter;

// Storage key format:
// `rsc-drawings-v1-${symbol.toUpperCase()}-${timeframe}`
// e.g. "rsc-drawings-v1-BTCUSD-1h"

// Validation schema (importJSON):
// - Must be array
// - Each item must have: id (string), type (DrawingToolType), points (Point[]), style (DrawingStyle), createdAt (number)
// - If validation fails: throw DrawingImportError with field path
```

### useDrawingStorage hook

```typescript
// src/lib/drawing/useDrawingStorage.ts

export interface UseDrawingStorageReturn {
  exportJSON: () => void;         // triggers browser file download "drawings.json"
  importJSON: (file: File) => Promise<void>;  // reads file, validates, dispatches LOAD action
  clearAll: () => void;
}

export function useDrawingStorage(
  symbol: string,
  timeframe: string,
  drawings: DrawingObject[],       // current drawings list (from useDrawingInteraction)
  onLoad: (drawings: DrawingObject[]) => void,  // callback to inject loaded drawings
  adapter?: DrawingStorageAdapter   // default: createLocalStorageAdapter()
): UseDrawingStorageReturn;

// Behavior:
// - On mount: load() → if result non-empty → onLoad(result)
// - On drawings change (useEffect): save() — debounce 300ms
// - exportJSON(): JSON.stringify(drawings) → download blob
// - importJSON(file): FileReader → validate → onLoad(imported)
```

### DrawingInspector component

```typescript
// src/lib/drawing/DrawingInspector.tsx

export interface DrawingInspectorProps {
  drawing: DrawingObject | null;       // null = inspector hidden
  position?: { x: number; y: number }; // screen position, default auto-near drawing
  onUpdate: (patch: Partial<DrawingObject>) => void;  // partial patch applied to drawing
  onDelete: () => void;
  onClone: () => void;                 // create duplicate offset by +20px
  onToggleLock: () => void;
  onToggleVisible: () => void;
  onBringToFront: () => void;          // zIndex = max + 1
  onSendToBack: () => void;            // zIndex = min - 1
  onClose: () => void;
}

// UI Controls:
// ┌─ Color swatch ─ stroke color picker (<input type="color" />) ─────────┐
// │ Fill color picker (<input type="color" />) [only for rect/posBox/etc] │
// │ Stroke width slider (1–5px)                                            │
// │ Line style dropdown: Solid / Dashed / Dotted                           │
// │ Opacity slider (0.1–1.0)                                               │
// ├─ Lock toggle ─ Clone button ─ Hide button ─────────────────────────── │
// │ Bring to Front | Send to Back                                           │
// │ [Delete button — red]                                                   │
// └────────────────────────────────────────────────────────────────────────┘
//
// Panel là position:fixed, anchor near bounding box của drawing selected
// Đóng khi: click ngoài panel, ESC, activeTool thay đổi
```

### DrawingListPanel component

```typescript
// src/lib/drawing/DrawingListPanel.tsx

export interface DrawingListPanelProps {
  drawings: DrawingObject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onDelete: (id: string) => void;
}

// Hiển thị dạng vertical list ở bên phải toolbar hoặc dưới drawing toolbar
// Mỗi item: [icon type] [label: type + createdAt time] [eye icon] [delete icon]
// Click item → onSelect → chart scroll to drawing nếu ngoài viewport
// Eye icon click → toggle visible
```

## 13. Spec chi tiết M3 — New Tool Behaviors

### Ray

```
- 2 điểm: P1 (anchor) + P2 (direction point)
- Render: đường từ P1 → extend theo hướng P1→P2 đến edge của chart
- Không extend về phía ngược lại
- Interaction: 1-click P1, 1-click P2 → complete
- Handles khi selected: handle ở P1 (grab = reanchor), handle ở P2 (grab = change direction)
```

### Extended Line (X-Line)

```
- 2 điểm: P1, P2
- Render: đường extend vô tận cả 2 chiều, clip tại chart boundary
- Interaction: 1-click P1, 1-click P2 → complete
- Cùng pattern với trendLine nhưng extend = true cả 2 hướng
```

### Polyline

```
- N điểm (N ≥ 2)
- Interaction: click để add điểm; double-click hoặc ESC để hoàn tất; Enter cũng commit
- Preview: đường từ last committed point đến cursor
- Render: SVG <polyline> hoặc <path> qua tất cả points
- Handles khi selected: circle ở mỗi điểm; kéo để reposition
- updateDraft: append điểm khi click; replace last point khi mouse move (preview)
- Cần thêm action APPEND_POINT vào stateMachine nếu chưa có
```

### Date & Price Range

```
- 2 điểm: P1 (corner 1) + P2 (corner 2)
- Render:
  - SVG <rect> fill bán trong suốt (rgba(100,149,237,0.15))
  - Badge SVG <text> ở góc trên phải: "Δ+3.2% · 28 bars"
  - Đường dọc tại P1.x và P2.x; đường ngang tại P1.y và P2.y
- Badge calculation:
  - Δ% = (P2.y - P1.y) / P1.y × 100 → round 2 decimal
  - bars = count of visible candles between P1.x and P2.x timestamps
- Interaction: drag P1→P2 (same as rectangle)
```

### Long Position Box

```
- 3 giá: entry (click 1), target/TP (drag up), stop/SL (drag down)
- Interaction:
  1. Click xác định entry price (horizontal line)
  2. Drag up → xác định TP price
  3. Auto-calculate SL mirrored hoặc separate click
  Cách đơn giản hơn: drag P1→P2 (entry = P1.y, TP = max(P1.y, P2.y), SL = min(P1.y, P2.y))
  → Sau khi commit: user có thể drag từng line riêng qua Inspector
- Render:
  - Box xanh lá (entry → TP): fill rgba(0,200,83,0.15), stroke green
  - Box đỏ (entry → SL): fill rgba(239,83,80,0.15), stroke red
  - 3 horizontal lines: entry (white/dashed), TP (green), SL (red)
  - Badge ở góc phải:
    - "R/R 1:2.0" (ratio = |TP-entry| / |entry-SL|)
    - "+ 3.2%" (gain to TP)
    - "- 1.6%" (loss to SL)
    - "P&L +$640" (nếu có quantity trong riskReward.quantity)
- points[0] = entry, points[1] = TP corner, points[2] = SL corner
  (x = timestamp range cho box width; y = respective price)
```

### Short Position Box

```
- Tương tự Long Position Box nhưng:
  - Box đỏ (entry → TP/cover): fill rgba(239,83,80,0.15)
  - Box xanh (entry → SL): fill rgba(0,200,83,0.15)
  - Entry ở trên, TP ở dưới, SL ở trên entry
  - Badge hiện "Short" label
```

### Fibonacci Extension

```
- 2 điểm: P1 (swing low/high), P2 (swing high/low đối diện)
- Extension levels: [1.272, 1.414, 1.618, 2.0, 2.618]
- Render:
  - Mỗi level = 1 horizontal line full-width + label bên phải: "161.8% — 94,250.00"
  - Màu giảm dần opacity theo distance (161.8% đậm nhất)
  - Range P1-P2 cũng hiển thị (levels 0% và 100%)
- Direction:
  - Nếu P2 > P1 (upswing): extension levels = P2 + (P2-P1) × level_ratio
  - Nếu P2 < P1 (downswing): extension levels = P2 - (P1-P2) × level_ratio
```

## 14. Spec chi tiết M4 — Pattern Tool Behaviors

### Parallel Channel (3-point)

```
- 3 điểm: P1, P2 (định nghĩa line chính), P3 (xác định offset)
- Render: line P1→P2, parallel line offset theo P3, midline (trung điểm)
- Interaction: click P1, click P2, click P3 → complete
- Tất cả 3 lines extend đến chart boundary
- Handles khi selected: P1, P2, P3 + handle di chuyển toàn bộ channel
```

### Andrew's Pitchfork

```
- 3 điểm: A (pivot), B (swing 1), C (swing 2)
- Render:
  - Median Line: A → midpoint(B, C), extend
  - Upper fork: B → parallel to median line, extend
  - Lower fork: C → parallel to median line, extend
- Labels: "A", "B", "C" tại mỗi điểm
- Interaction: click A, click B, click C → complete
```

### ABCD Harmonic Pattern

```
- 4 điểm: A, B, C, D
- Render:
  - Lines: A→B, B→C, C→D
  - Labels tại mỗi điểm: A, B, C, D
  - Ratio badges:
    - AB: label khoảng cách giá
    - BC/AB: tỷ lệ (ideal: 0.382–0.886)
    - CD/BC: tỷ lệ (ideal: 1.272–1.618)
- Interaction: click A, B, C, D lần lượt → complete
- Highlight màu nếu ratios nằm trong vùng harmonic ideal
```

### Fibonacci Arc

```
- 2 điểm: P1 (center), P2 (radius point)
- Radius = distance(P1, P2) (in price pixels)
- Render: 3 bán nguyệt SVG <path> arc tại bán kính × [0.382, 0.5, 0.618]
- Arc chỉ render phía dưới (half-circle) hướng forward theo thời gian
- Labels tại điểm giao với edge: "38.2%", "50%", "61.8%"
```

### Fibonacci Time Zone

```
- 2 điểm: P1 (bar 0), P2 (bar 1) — xác định độ rộng 1 bar unit
- Render: vertical lines tại Fibonacci intervals: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89 bars
  (tính từ P1)
- Mỗi line là full-height dashed vertical line + label nhỏ ở đỉnh: "8"
- Fill alternating bands bán trong suốt (optional)
```

### Regression Channel

```
- 2 điểm: P1 (start timestamp), P2 (end timestamp)
- Algorithm:
  1. Lọc plotData trong khoảng [P1.x, P2.x]
  2. Linear regression: y = ax + b (least squares, x = bar index, y = close price)
  3. Std deviation của residuals σ
- Render:
  - Median line (regression line): extend đến P2 hoặc toàn chart
  - Upper band: median + σ (dashed)
  - Lower band: median - σ (dashed)
  - Fill vùng giữa 2 bands (rgba, opacity 0.1)
  - R² badge ở góc phải: "R² 0.94"
- Interaction: drag P1→P2 (same as dateAndPriceRange)
```
