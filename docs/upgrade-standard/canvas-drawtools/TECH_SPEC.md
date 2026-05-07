# Technical Specification: Canvas DrawTools Engine (CE-Series)

**Phiên bản:** v1.0 | **Ngày:** 2026-05-06 | **Trạng thái:** Approved

---

## 1. Bối cảnh kỹ thuật

`src/lib/drawing/` (M1) đã có solid foundations:
- `types.ts` — 21 DrawingToolType, DrawingObject, DrawingStyle
- `stateMachine.ts` — 7-state FSM, DrawingAction reducer
- `history.ts` — undo/redo reducer, DrawingHistory
- `registry.ts` + `builtin/` — 21 tools implemented (createDraft, updateDraft)
- `coordinateUtils.ts` — pixelToChartPoint / chartPointToPixel
- `DrawingInspector.tsx`, `DrawingListPanel.tsx`, `DrawingStorage.ts`, `useDrawingStorage.ts`
- `DrawingLayer.tsx` — **SVG via GenericComponent.svgDraw** ← cần replace bằng canvas
- `renderSvg.ts` — React SVG elements renderer ← cần replace bằng Canvas 2D

**Mục tiêu CE:** Thay thế toàn bộ SVG layer bằng pure Canvas 2D, thêm snap + hit testing trực tiếp.

---

## 2. Kiến trúc CE

### 2.1 Rendering pipeline (trước vs sau)

```
TRƯỚC (SVG):
DrawingLayer → GenericComponent.svgDraw → React SVG elements → DOM SVG layer

SAU (Canvas):
DrawingLayer → GenericComponent.canvasDraw → ctx.beginPath/stroke/fill → mouseCanvas 2D
```

### 2.2 File map — CE additions

| File | Loại | Mô tả |
| :--- | :--- | :--- |
| `src/lib/drawing/renderCanvas.ts` | TẠO MỚI | Canvas 2D renderer cho 21 tool types |
| `src/lib/drawing/hitTest.ts` | TẠO MỚI | Point-in-shape hit testing algorithms |
| `src/lib/drawing/snap.ts` | TẠO MỚI | Snap to OHLC / drawing endpoints |
| `src/lib/drawing/DrawingLayer.tsx` | THAY THẾ | Switch từ `svgDraw` sang `canvasDraw` + hit test + snap |
| `src/demo/demo.css` | SỬA | Canvas handle styles, snap cursor, position zone colors |

### 2.3 Không thay đổi (giữ nguyên)

- `types.ts`, `stateMachine.ts`, `history.ts`, `serialization.ts`
- `registry.ts`, toàn bộ `builtin/`
- `coordinateUtils.ts`
- `DrawingInspector.tsx`, `DrawingListPanel.tsx`
- `DrawingStorage.ts`, `useDrawingStorage.ts`
- `index.ts` (không cần export renderCanvas — là internal)

---

## 3. Canvas Rendering Contract

### 3.1 `renderCanvas.ts` API

```typescript
export interface RenderCanvasOptions {
  chartWidth: number;
  chartHeight: number;
  isSelected: boolean;
  plotData?: PlotDatum[];
}

export function renderDrawingToCanvas(
  ctx: CanvasRenderingContext2D,
  drawing: DrawingObject,
  scales: ChartScales,
  options: RenderCanvasOptions,
): void;
```

- Mỗi gọi phải `ctx.save()` trước và `ctx.restore()` sau
- Không clear canvas — chỉ draw, không erase
- Drawing.visible === false → return ngay (không vẽ)

### 3.2 Style → Canvas mapping

| DrawingStyle field | Canvas operation |
| :--- | :--- |
| `stroke` | `ctx.strokeStyle = stroke` |
| `strokeWidth` | `ctx.lineWidth = strokeWidth` |
| `strokeDasharray: "solid"` | `ctx.setLineDash([])` |
| `strokeDasharray: "dashed"` | `ctx.setLineDash([6, 4])` |
| `strokeDasharray: "dotted"` | `ctx.setLineDash([2, 4])` |
| `opacity` | `ctx.globalAlpha = opacity` |
| `fill` | `ctx.fillStyle = fill` |
| `fillOpacity` | handled via rgba fill or globalAlpha |
| `fontSize`, `fontFamily` | `ctx.font = "${fontSize}px ${fontFamily}"` |

### 3.3 Selection handles

Khi `isSelected = true`, vẽ các control handles (circles) tại từng `DrawingObject.points`:
- Radius: 5px
- Fill: `drawing.style.stroke`
- Stroke: `"#ffffff"`, lineWidth: 1.5
- Phải `save/restore` quanh việc vẽ handles để không bị ảnh hưởng bởi style của drawing chính

### 3.4 Position zone colors (hardcoded vì canvas không có CSS classes)

| Zone | Fill |
| :--- | :--- |
| Long TP zone (above entry) | `rgba(34, 171, 92, 0.18)` |
| Long SL zone (below entry) | `rgba(215, 50, 75, 0.18)` |
| Short TP zone (below entry) | `rgba(34, 171, 92, 0.18)` |
| Short SL zone (above entry) | `rgba(215, 50, 75, 0.18)` |

---

## 4. Hit Testing Contract

### 4.1 `hitTest.ts` API

```typescript
export function hitTestDrawing(
  drawing: DrawingObject,
  mouseX: number,
  mouseY: number,
  scales: ChartScales,
  options: { chartWidth: number; chartHeight: number; plotData?: PlotDatum[] },
  tolerance?: number,  // default: 6px
): boolean;
```

### 4.2 Algorithms per tool type

| Tool | Hit algorithm |
| :--- | :--- |
| `trendLine`, `ray`, `extendedLine`, `polyline` | `distanceToSegment(mouseX, mouseY, x1, y1, x2, y2) < tolerance` |
| `hLine` | `Math.abs(mouseY - lineY) < tolerance` |
| `vLine` | `Math.abs(mouseX - lineX) < tolerance` |
| `fibonacci`, `fibExtension` | Any horizontal fib level within tolerance |
| `rectangle`, `dateAndPriceRange`, `longPosition`, `shortPosition` | Point inside rect OR on any edge |
| `channel`, `parallelChannel` | Distance to either parallel line < tolerance |
| `text` | Bounding box of text |
| `pitchfork` | Distance to median or fork lines |
| `abcdPattern` | Distance to AB, BC, or CD segments |
| `fibArc` | Distance to any arc |
| `fibTimeZone` | Distance to any vertical zone line |
| `regressionChannel` | Point inside fill area or near border lines |
| `arrow` | Distance to shaft or arrowhead |

### 4.3 `distanceToSegment` formula

```typescript
function distanceToSegment(px, py, x1, y1, x2, y2): number {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}
```

---

## 5. Snap Engine Contract

### 5.1 `snap.ts` API

```typescript
export interface SnapResult {
  chartPoint: { x: number; y: number };  // domain coordinates (timestamp ms, price)
  pixelPoint: { x: number; y: number };  // pixel coordinates on canvas
  snapType: "ohlc" | "endpoint";
}

export function findSnapPoint(
  mouseX: number,
  mouseY: number,
  scales: ChartScales,
  plotData: PlotDatum[],
  existingDrawings: DrawingObject[],
  tolerance?: number,  // default: 8px
): SnapResult | null;
```

### 5.2 Priority

1. **OHLC snap** — bar high/low/open/close trong X-window 20px, Y tolerance 8px
2. **Endpoint snap** — điểm đầu/cuối của drawings khác trong 10px sphere

---

## 6. DrawingLayer Update Contract

### 6.1 Thay đổi trong `DrawingLayer.tsx`

```typescript
// TRƯỚC:
<GenericComponent
  svgDraw={renderSVG}
  ...
/>

// SAU:
<GenericComponent
  svgDraw={() => null}             // no-op, svgDraw là required
  canvasDraw={drawToCanvas}
  canvasToDraw={getMouseCanvas}
  ...
/>
```

### 6.2 `drawToCanvas(ctx, moreProps)`

- Gọi `renderDrawingToCanvas(ctx, drawing, scales, opts)` cho mỗi drawing
- Render draft/in-progress drawing nếu đang trong state "drawing"
- Vẽ snap indicator nếu `snapRef.current !== null`

### 6.3 Snap indicator visual

Khi snap active:
- Small circle r=6, màu `#f5a623`, strokeStyle `#ffffff`
- `setLineDash([])`, lineWidth 1.5
- Vẽ tại snap pixel point

### 6.4 Hit testing trong click handler

```typescript
const handleClick = useCallback((moreProps) => {
  if (activeTool !== "cursor") {
    // ... existing drawing tool logic
    return;
  }
  // Canvas hit testing
  const [mouseX, mouseY] = moreProps.mouseXY;
  const scales = buildRenderScales(moreProps);
  const chartConfig = resolveChartConfig(moreProps);
  const clicked = [...interaction.history.present]
    .reverse()  // top-most drawing first (highest zIndex)
    .find((d) => hitTestDrawing(d, mouseX, mouseY, scales, {
      chartWidth: chartConfig.width,
      chartHeight: chartConfig.height,
      plotData: scales.plotData,
    }));
  if (clicked) {
    if (moreProps.event?.shiftKey) {
      // multi-select logic
    } else {
      interaction.dispatch({ type: "SELECT_OBJECT", objectId: clicked.id });
    }
  } else {
    interaction.dispatch({ type: "CANCEL" });
  }
}, [activeTool, interaction]);
```

---

## 7. Coordinate System (không thay đổi)

- `DrawingObject.points` luôn lưu **chart domain coordinates**: `{ x: timestamp_ms, y: price }`
- Render time: convert to pixel via `chartPointToPixel(point, scales)`
- Store time: never store pixel coordinates

---

## 8. CSS classes cần thêm vào `demo.css`

```css
/* Canvas selection handle (SVG handles không còn, nhưng cursor classes vẫn cần) */
.rsc-drawing-snap-active {
  cursor: crosshair;
}

/* Position zones (canvas hardcodes colors, CSS chỉ cần cho SVG fallback) */
.rsc-long-tp-zone { fill: rgba(34, 171, 92, 0.18); }
.rsc-long-sl-zone { fill: rgba(215, 50, 75, 0.18); }
.rsc-short-tp-zone { fill: rgba(34, 171, 92, 0.18); }
.rsc-short-sl-zone { fill: rgba(215, 50, 75, 0.18); }
```

---

## 9. Constraint kiến trúc (Hard Rules)

1. `renderCanvas.ts` KHÔNG được import `src/demo/**`
2. `hitTest.ts`, `snap.ts` KHÔNG được import `src/demo/**`
3. Canvas coordinates: `moreProps.mouseXY` là `[x, y]` trong pixel space tương đối với chart container
4. `getMouseCanvas` từ `../GenericComponent` là canvas target — không tạo canvas element mới
5. `svgDraw={() => null}` phải được giữ để tránh PropTypes error trên `GenericComponent`
6. Không xóa `renderSvg.ts` cho đến khi CE-10 audit pass (reference, không phải production path)
