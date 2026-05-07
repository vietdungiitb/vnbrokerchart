# Implementation Plan: Canvas DrawTools Engine (CE-Series)

**Phiên bản:** v1.0 | **Ngày:** 2026-05-06 | **Branch:** `dev`  
**Tài liệu liên quan:** [HANDOFF_MANIFEST.md](./HANDOFF_MANIFEST.md) · [TECH_SPEC.md](./TECH_SPEC.md)

---

## Tổng quan slices

| Slice | Tên | File chính | Ưu tiên |
| :---: | :--- | :--- | :---: |
| CE-01 | Canvas renderer — line types | `renderCanvas.ts` | P0 |
| CE-02 | Canvas renderer — fill shapes | `renderCanvas.ts` | P0 |
| CE-03 | Canvas renderer — fibonacci & arcs | `renderCanvas.ts` | P0 |
| CE-04 | Canvas renderer — complex tools | `renderCanvas.ts` | P0 |
| CE-05 | Hit testing core | `hitTest.ts` | P0 |
| CE-06 | Snap engine | `snap.ts` | P1 |
| CE-07 | DrawingLayer switch to canvasDraw | `DrawingLayer.tsx` | P0 |
| CE-08 | Demo CSS + visual polish | `demo.css` | P1 |
| CE-09 | LibraryShowcaseDemo wiring | `LibraryShowcaseDemo.tsx` | P1 |
| CE-10 | Audit, ledger, module tree | docs + scripts | P1 |

**Thứ tự thực hiện:** CE-01→CE-02→CE-03→CE-04 (renderCanvas hoàn chỉnh) → CE-05 → CE-06 → CE-07 → CE-08 → CE-09 → CE-10

---

## CE-01: Canvas renderer — line types

**File:** `src/lib/drawing/renderCanvas.ts` (TẠO MỚI)

### Mô tả
Tạo file canvas renderer với toàn bộ boilerplate và implement các tool vẽ đường:
`trendLine`, `hLine`, `vLine`, `ray`, `extendedLine`, `polyline`, `channel`, `arrow`

### Imports cần thiết

```typescript
import { chartPointToPixel, type ChartScales, type PlotDatum } from "./coordinateUtils";
import type { DrawingObject, DrawingStyle } from "./types";
import { calculateParallelChannelGeometry } from "./builtin/parallelChannel";
import { calculatePitchforkGeometry } from "./builtin/pitchfork";
import { calculateAbcdPatternMetrics } from "./builtin/abcdPattern";
import { calculateFibArcGeometry } from "./builtin/fibArc";
import { calculateFibTimeZoneGeometry } from "./builtin/fibTimeZone";
import { calculateRegressionChannelMetrics } from "./builtin/regressionChannel";
```

### Interface chính

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
): void
```

### Helper functions cần implement

```typescript
// Apply dash style to ctx
function applyLineStyle(ctx, style: DrawingStyle): void

// Draw a segment from (x1,y1) to (x2,y2) with current ctx style
function strokeLine(ctx, x1, y1, x2, y2): void

// Draw selection handle circles at each control point
function drawSelectionHandles(ctx, points: {x,y}[], color: string): void

// Liang-Barsky line clipping (copy from renderSvg.ts clipSegmentToBox)
function clipSegmentToBox(start, end, chartWidth, chartHeight): [{x,y},{x,y}] | null
```

### Các tool trong CE-01

**trendLine:**
```
[p0, p1] → toPixel → ctx.beginPath; moveTo; lineTo; stroke
isSelected: drawSelectionHandles([start, end])
```

**hLine:**
```
[p0] → toPixel y only → horizontal line from x=0 to x=chartWidth
isSelected: drawSelectionHandles([{x:0,y}, {x:chartWidth,y}])
```

**vLine:**
```
[p0] → toPixel x only → vertical line from y=0 to y=chartHeight
isSelected: drawSelectionHandles([{x,y:0}, {x,y:chartHeight}])
```

**ray:**
```
[p0, p1] → toPixel → compute direction vector → extend 10000x → clipSegmentToBox
strokeLine(clipped[0], clipped[1])
```

**extendedLine:**
```
[p0, p1] → toPixel → extend both directions 10000x → clipSegmentToBox
strokeLine(clipped[0], clipped[1])
```

**polyline:**
```
points.map(toPixel) → ctx.beginPath; moveTo(pts[0]); pts.slice(1).forEach(lineTo); stroke
isSelected: drawSelectionHandles(all pixel points)
```

**channel:**
```
[p0, p1, p2] → compute offset vector from p2 to line p0-p1 (normal projection)
line1: start→end; line2: (start+offset)→(end+offset)
```

**arrow:**
```
[p0, p1] → draw shaft line; compute arrowhead triangle from end point
ctx.beginPath; draw head polygon; ctx.fill; ctx.stroke
```

### DoD CE-01
- [ ] File `src/lib/drawing/renderCanvas.ts` tồn tại
- [ ] 8 tool types render không throw error
- [ ] `npm run type-check` pass
- [ ] Visual: trendLine hiển thị đúng màu/độ dày khi draw thử qua canvas test

---

## CE-02: Canvas renderer — fill shapes

**File:** `src/lib/drawing/renderCanvas.ts` (TIẾP TỤC)

### Các tool trong CE-02

**rectangle:**
```
[p0, p1] → compute (x, y, w, h) from min/max
ctx.fillStyle = fill ?? "transparent"; ctx.fillRect
ctx.strokeRect
isSelected: drawSelectionHandles([start, end])
```

**dateAndPriceRange:**
```
[p0, p1] → rect với fill + fillOpacity
Badge text: "Δ +/-X.XX% · N bars" via ctx.fillText
Font: `bold ${fontSize ?? 11}px ${fontFamily ?? "sans-serif"}`
isSelected: drawSelectionHandles([start, end])
```

**longPosition / shortPosition (renderPositionZonesCanvas):**
```
[p0, p1] → lấy riskReward (entry, stop, target)
tpZone (entryY→targetY): fillStyle = rgba(34,171,92,0.18)
slZone (entryY→stopY): fillStyle = rgba(215,50,75,0.18)
3 horizontal lines: entry (solid), target (dashed), stop (dashed)
Badge "R/R 1:X.X" tại góc trên phải của zone
isSelected: drawSelectionHandles([start, end])
```

### DoD CE-02
- [ ] Rectangle vẽ đúng với fill color
- [ ] DateAndPriceRange hiển thị badge text
- [ ] LongPosition: TP zone xanh, SL zone đỏ, 3 đường horizontal
- [ ] ShortPosition: tương tự long nhưng TP/SL ngược nhau
- [ ] `npm run type-check` pass

---

## CE-03: Canvas renderer — fibonacci & arcs

**File:** `src/lib/drawing/renderCanvas.ts` (TIẾP TỤC)

### Các tool trong CE-03

**fibonacci:**
```
DEFAULT_FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618]
Mỗi level: y = start.y + (end.y - start.y) * level
ctx.beginPath; moveTo(0, y); lineTo(chartWidth, y); stroke
Label: ctx.fillText(`${(level*100).toFixed(1)}% — ${price}`, chartWidth - 6, y - 4)
ctx.textAlign = "right"
isSelected: drawSelectionHandles([start, end])
```

**fibExtension:**
```
DEFAULT_FIB_EXTENSION_LEVELS = [1.272, 1.414, 1.618, 2, 2.618]
extensionPrice = endPoint.y + (endPoint.y - startPoint.y) * level
y = toPixel({x: endPoint.x, y: extensionPrice}).y
Horizontal line + label (same pattern as fibonacci)
```

**fibArc:**
```
geometry = calculateFibArcGeometry(drawing, scales)
geometry.radii.forEach(radius => {
  ctx.beginPath()
  ctx.arc(center.x, center.y, radius, Math.PI, 0)  // upper semicircle
  ctx.stroke()
  label at (center.x + radius + 4, center.y)
})
isSelected: drawSelectionHandles([center, reference])
```

**fibTimeZone:**
```
geometry = calculateFibTimeZoneGeometry(drawing, scales)
geometry.positions.forEach(x => {
  vertical line x=x from y=0 to y=chartHeight
  label at (x+4, 12)
})
isSelected: drawSelectionHandles([start, end])
```

### DoD CE-03
- [ ] Fibonacci vẽ đúng 9 levels với labels
- [ ] FibExtension vẽ đúng 5 extension levels
- [ ] FibArc vẽ semicircles đúng radius
- [ ] FibTimeZone vẽ vertical zones đúng positions
- [ ] `npm run type-check` pass

---

## CE-04: Canvas renderer — complex tools

**File:** `src/lib/drawing/renderCanvas.ts` (TIẾP TỤC)

### Các tool trong CE-04

**text:**
```
[p0] → toPixel
ctx.fillStyle = stroke
ctx.font = `${fontSize ?? 12}px ${fontFamily ?? "sans-serif"}`
ctx.textBaseline = "middle"
ctx.fillText(drawing.text || "Text", pixel.x, pixel.y)
```

**parallelChannel:**
```
geometry = calculateParallelChannelGeometry(drawing, scales)
upper = clipSegmentToBox(start+offset, end+offset, ...)
lower = clipSegmentToBox(start-offset, end-offset, ...)
middle = clipSegmentToBox(start, end, ...)
3 lines: upper, middle (dashed), lower
isSelected: drawSelectionHandles([start, end, offsetAnchor])
```

**pitchfork:**
```
geometry = calculatePitchforkGeometry(drawing, scales)
median = extendLineThroughBox(pivot, direction)
leftFork = extendLineThroughBox(leftSwing, direction)
rightFork = extendLineThroughBox(rightSwing, direction)
3 lines + labels "A", "B", "C" at pivot, leftSwing, rightSwing
isSelected: drawSelectionHandles([pivot, leftSwing, rightSwing])
```

**abcdPattern:**
```
metrics = calculateAbcdPatternMetrics(drawing, scales)
segments: AB, BC, CD
labels: "A","B","C","D" at each point + 6px offset
ratio labels at segment midpoints
isSelected: drawSelectionHandles(metrics.points)
```

**regressionChannel:**
```
metrics = calculateRegressionChannelMetrics(drawing, scales, plotData)
fill polygon: (startX,upperStartY)→(endX,upperEndY)→(endX,lowerEndY)→(startX,lowerStartY)
ctx.fillStyle = fill ?? "rgba(100,149,237,0.08)"
upper line (dashed), lower line (dashed), center line (solid)
badge "R² X.XX" at top-right
isSelected: drawSelectionHandles([p0pixel, p1pixel])
```

### DoD CE-04
- [ ] Text renders tại đúng vị trí
- [ ] ParallelChannel: 3 lines đúng vị trí
- [ ] Pitchfork: median + 2 forks + A/B/C labels
- [ ] AbcdPattern: 3 segments + labels + ratios
- [ ] RegressionChannel: fill polygon + 3 lines + R² badge
- [ ] `npm run type-check` pass
- [ ] Toàn bộ 21 tools không throw error khi render

---

## CE-05: Hit testing core

**File:** `src/lib/drawing/hitTest.ts` (TẠO MỚI)

### Interface

```typescript
export function hitTestDrawing(
  drawing: DrawingObject,
  mouseX: number,
  mouseY: number,
  scales: ChartScales,
  options: { chartWidth: number; chartHeight: number; plotData?: PlotDatum[] },
  tolerance?: number,  // default: 6
): boolean

export function getResizeHandleIndex(
  drawing: DrawingObject,
  mouseX: number,
  mouseY: number,
  scales: ChartScales,
  tolerance?: number,  // default: 8
): number | null
```

### Thuật toán chi tiết

**`distanceToSegment(px, py, x1, y1, x2, y2): number`** — core helper:
```
dx=x2-x1; dy=y2-y1; lenSq=dx²+dy²
if lenSq===0: return hypot(px-x1, py-y1)
t = clamp(((px-x1)*dx+(py-y1)*dy)/lenSq, 0, 1)
return hypot(px-(x1+t*dx), py-(y1+t*dy))
```

**`pointInRect(px, py, rx, ry, rw, rh): boolean`**:
```
px >= rx && px <= rx+rw && py >= ry && py <= ry+rh
```

| Tool | Thuật toán |
| :--- | :--- |
| `trendLine`, `arrow` | distanceToSegment(start, end) < tolerance |
| `ray` | clip ray, distanceToSegment(clipped) < tolerance |
| `extendedLine` | clip both ways, distanceToSegment < tolerance |
| `hLine` | abs(mouseY - lineY) < tolerance |
| `vLine` | abs(mouseX - lineX) < tolerance |
| `fibonacci` | any fib level: abs(mouseY - levelY) < tolerance |
| `fibExtension` | same as fibonacci |
| `rectangle` | pointInRect OR edge distance < tolerance |
| `dateAndPriceRange` | same as rectangle |
| `longPosition`, `shortPosition` | pointInRect of total zone |
| `channel` | distanceToSegment(line1) OR distanceToSegment(line2) < tolerance |
| `parallelChannel` | same as channel + middle line |
| `pitchfork` | distanceToSegment for median/leftFork/rightFork |
| `polyline` | any segment distanceToSegment < tolerance |
| `text` | rough bounding box (fontSize × text.length width) |
| `abcdPattern` | distanceToSegment for AB, BC, CD |
| `fibArc` | abs(hypot(mx-cx, my-cy) - radius) < tolerance for any arc |
| `fibTimeZone` | abs(mouseX - zoneX) < tolerance for any zone |
| `regressionChannel` | pointInRect of channel bounding box |

### DoD CE-05
- [ ] `hitTestDrawing` trả về `true` khi click trúng đường vẽ
- [ ] `hitTestDrawing` trả về `false` khi click xa
- [ ] `getResizeHandleIndex` trả về đúng index handle
- [ ] `npm run type-check` pass

---

## CE-06: Snap engine

**File:** `src/lib/drawing/snap.ts` (TẠO MỚI)

### Interface

```typescript
export interface SnapResult {
  chartPoint: { x: number; y: number };
  pixelPoint: { x: number; y: number };
  snapType: "ohlc" | "endpoint";
}

export function findSnapPoint(
  mouseX: number,
  mouseY: number,
  scales: ChartScales,
  plotData: PlotDatum[],
  existingDrawings: DrawingObject[],
  tolerance?: number,  // default: 8
): SnapResult | null
```

### Logic

**Bước 1: OHLC snap**
1. Tìm bar gần nhất: `plotData.find` bar có `xScale(xAccessor(bar))` gần `mouseX` nhất (trong 20px X-tolerance)
2. Convert OHLC prices sang pixel Y
3. Nếu bất kỳ giá nào (open/high/low/close) trong Y-tolerance: return snap point

**Bước 2: Endpoint snap** (nếu OHLC không match)
1. Collect all endpoints từ `existingDrawings.flatMap(d => d.points)`
2. Convert mỗi point → pixel
3. Nếu `hypot(mouseX - px, mouseY - py) < tolerance * 1.5`: return snap point type "endpoint"

**Return:** first match theo priority trên; null nếu không có snap

### DoD CE-06
- [ ] Snap vào OHLC high/low/open/close
- [ ] Snap vào endpoint của drawing khác
- [ ] Trả về null khi chuột ở giữa không có gì
- [ ] `npm run type-check` pass

---

## CE-07: DrawingLayer switch to canvasDraw

**File:** `src/lib/drawing/DrawingLayer.tsx` (SỬA)

### Thay đổi cụ thể

**1. Thêm imports:**
```typescript
import { renderDrawingToCanvas, type RenderCanvasOptions } from "./renderCanvas";
import { hitTestDrawing } from "./hitTest";
import { findSnapPoint, type SnapResult } from "./snap";
```

**2. Xóa import:**
```typescript
// XÓA:
import { renderDrawingToSvg, type RenderSvgOptions } from "./renderSvg";
import type { ReactElement } from "react";
```

**3. Thêm snapRef:**
```typescript
const snapRef = useRef<SnapResult | null>(null);
```

**4. Thay `renderSVG` callback bằng `drawToCanvas`:**
```typescript
const drawToCanvas = useCallback((ctx: CanvasRenderingContext2D, moreProps: any): void => {
  const chartConfig = resolveChartConfig(moreProps);
  if (!chartConfig) return;
  const scales = buildRenderScales(moreProps);
  const drawings = [...interaction.history.present]
    .filter(d => d.visible !== false)
    .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  const draft = currentDrawing(interaction.history.present, interaction.drawingState);
  const allToDraw = draft && !drawings.some(d => d.id === draft.id)
    ? [...drawings, draft]
    : drawings;
  const opts: RenderCanvasOptions = {
    chartWidth: chartConfig.width,
    chartHeight: chartConfig.height,
    isSelected: false,
    plotData: scales.plotData,
  };
  for (const drawing of allToDraw) {
    renderDrawingToCanvas(ctx, drawing, scales, {
      ...opts,
      isSelected: selectedObjectIdSet.has(drawing.id),
    });
  }
  // Snap indicator
  const snap = snapRef.current;
  if (snap) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(snap.pixelPoint.x, snap.pixelPoint.y, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "#f5a623";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}, [interaction.history.present, interaction.drawingState, selectedObjectIdSet]);
```

**5. Cập nhật `handleMouseMove` để update snapRef:**
```typescript
// Sau khi lấy point từ toChartPoint, cập nhật snapRef:
if (scales.plotData?.length) {
  snapRef.current = findSnapPoint(mouseXY[0], mouseXY[1], scales, scales.plotData, interaction.history.present);
} else {
  snapRef.current = null;
}
// Nếu snap active, dùng snap.chartPoint thay vì point raw:
const effectivePoint = snapRef.current?.chartPoint ?? point;
```

**6. Cập nhật `handleMouseDown` để apply snap:**
```typescript
const snap = snapRef.current;
const effectivePoint = snap ? snap.chartPoint : point;
// Dùng effectivePoint thay vì point
```

**7. Cập nhật `handleClick` để thêm hit testing khi cursor tool:**
```typescript
// Đầu handleClick, trước existing logic:
if (activeTool === "cursor" && interaction.drawingState.type !== "drawing") {
  const chartConfig = resolveChartConfig(moreProps);
  const scales = buildRenderScales(moreProps);
  const [mouseX, mouseY] = moreProps.mouseXY;
  const clicked = [...interaction.history.present]
    .filter(d => d.visible !== false)
    .reverse()
    .find(d => hitTestDrawing(d, mouseX, mouseY, scales, {
      chartWidth: chartConfig.width,
      chartHeight: chartConfig.height,
      plotData: scales.plotData,
    }));
  if (clicked) {
    if (moreProps.event?.shiftKey) {
      const next = selectedObjectIdSet.has(clicked.id)
        ? selectedObjectIds.filter(id => id !== clicked.id)
        : [...selectedObjectIds, clicked.id];
      interaction.dispatch({ type: "SET_SELECTED_OBJECTS", objectIds: next });
    } else {
      interaction.dispatch({ type: "SELECT_OBJECT", objectId: clicked.id });
    }
  } else {
    interaction.dispatch({ type: "CANCEL" });
  }
  return;
}
```

**8. Thay GenericComponent props:**
```typescript
// XÓA: svgDraw={renderSVG}
// THÊM:
svgDraw={() => null}
canvasDraw={drawToCanvas}
canvasToDraw={(contexts: any) => contexts?.mouseCoord}
```

**9. Cập nhật `drawOn`:**
```typescript
drawOn={["mousemove", "click", "drag", "dragend", "pan", "zoom"]}
```

### DoD CE-07
- [ ] Drawings hiển thị qua canvas (không phải SVG)
- [ ] Snap indicator hiển thị khi chuột gần OHLC
- [ ] Click vào drawing → select
- [ ] Click vào trống → deselect
- [ ] `npm run type-check` pass
- [ ] `npm test` pass

---

## CE-08: Demo CSS + visual polish

**File:** `src/demo/demo.css` (SỬA)

### Thêm vào cuối file

```css
/* ── Canvas DrawTools CE-08 ── */
.rsc-drawing-snap-active {
  cursor: crosshair;
}

/* Position zone colors (fallback cho SVG path nếu còn tồn tại) */
.rsc-long-tp-zone  { fill: rgba(34, 171, 92, 0.18); }
.rsc-long-sl-zone  { fill: rgba(215, 50, 75, 0.18); }
.rsc-short-tp-zone { fill: rgba(34, 171, 92, 0.18); }
.rsc-short-sl-zone { fill: rgba(215, 50, 75, 0.18); }
```

### DoD CE-08
- [ ] CSS classes tồn tại trong file
- [ ] Build không có CSS error

---

## CE-09: LibraryShowcaseDemo wiring

**File:** `src/demo/LibraryShowcaseDemo.tsx` (KIỂM TRA + SỬA NẾU CẦN)

### Kiểm tra
1. `DrawingLayer` được import từ `src/lib/drawing/DrawingLayer` (không phải interactive/)
2. Không còn import nào từ `src/lib/interactive/` liên quan drawing tools
3. `DrawingInspector` được wire đúng với `onUpdate`, `onDelete`, etc.

### Nếu có interactive/ imports: xóa và thay bằng canvas-based DrawingLayer đã cập nhật.

### DoD CE-09
- [ ] Không còn import từ `src/lib/interactive/` (ngoài Brush nếu vẫn dùng)
- [ ] DrawingInspector hoạt động (update style, delete, lock)
- [ ] DrawingListPanel hiển thị danh sách drawings
- [ ] `npm run type-check` pass

---

## CE-10: Audit, ledger, module tree

### Các bước

1. **Update AUDIT_LEDGER.md:**  
   File: `docs/upgrade-standard/AUDIT_LEDGER.md`  
   Thêm entry cho toàn bộ CE-01→CE-09 với date, files modified, test status

2. **Regenerate module tree:**
   ```bash
   python scripts/generate_module_tree.py
   ```
   Verify `module_tree_full.md` updated với `renderCanvas.ts`, `hitTest.ts`, `snap.ts`

3. **Final type check:**
   ```bash
   npm run type-check
   ```
   Kết quả phải: 0 errors

4. **Run tests:**
   ```bash
   npm test
   ```
   Kết quả: all pass (hoặc chỉ pre-existing failures)

5. **Build:**
   ```bash
   npm run build:docs
   ```
   Kết quả: build success

### DoD CE-10
- [ ] AUDIT_LEDGER.md updated với CE series entry
- [ ] module_tree_full.md có `renderCanvas`, `hitTest`, `snap`
- [ ] `npm run type-check` → 0 errors
- [ ] `npm test` → pass
- [ ] `npm run build:docs` → success
- [ ] Git commit với message: `feat(drawing): CE canvas engine CE-01→CE-09 complete`
