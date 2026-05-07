# Tech Spec — IC-GAP: Technical Gap Remediation

> **Trạng thái:** Approved  
> **Phiên bản:** 1.0 · 2026-05-06  
> **Phụ thuộc:** IC-1 ✅ · IC-2 ✅ · IC-3 ✅  
> **Scope:** Gap 1 (Viewport Event) · Gap 2 (Canvas Overlay) · Gap 3 (Scroll/Zoom API)  
> **Manifest:** [IC_GAP_HANDOFF_MANIFEST.md](./IC_GAP_HANDOFF_MANIFEST.md)

---

## 0. Hiện trạng kỹ thuật cần nắm trước khi code

### 0.1 ChartCanvas.tsx — class component

```
src/lib/ChartCanvas.tsx
  ├─ class component (NOT function component)
  ├─ state: { plotData, xScale, xExtents, ... }
  ├─ filterData(): tính plotData từ fullData + xExtents
  ├─ componentDidUpdate(): được gọi sau mỗi pan/zoom
  └─ Props: data, xExtents, width, height, ratio, children, ...
             → hiện tại KHÔNG có onVisibleRangeChange
             → hiện tại KHÔNG có public method setXExtents, getFullData
```

### 0.2 EventCapture.tsx — class component (KHÔNG sửa)

```
src/lib/EventCapture.tsx
  ├─ class component
  ├─ componentDidMount: attach wheel/touch/mouse DOM listeners
  ├─ componentWillUnmount: remove listeners
  └─ Emit: onZoom, onPan, onMouseMove internal → update ChartCanvas state
           → KHÔNG emit bất kỳ visible-range callback ra ngoài
```

**Quyết định:** Gap 1 KHÔNG chạm `EventCapture.tsx`. Callback được emit từ `ChartCanvas.componentDidUpdate`.

### 0.3 DynamicChart.tsx — function component

```
src/lib/core/DynamicChart.tsx
  ├─ function component (React 19)
  ├─ Wrapper quanh ChartCanvas legacy + pane layout logic
  ├─ Nhận: data, panes, width, height, ...
  └─ KHÔNG expose ref (chưa có forwardRef)
```

### 0.4 CanvasContainer.tsx — quản lý multi-layer canvas

```
src/lib/CanvasContainer.tsx (hoặc tương đương)
  ├─ Render nhiều <canvas> layer chồng nhau
  ├─ Layers: main (bars), axes, interactive (crosshair)
  └─ KHÔNG có consumer-extensible overlay layer
```

---

## 1. Gap 1 — Viewport Change Event

### 1.1 Type mới

**File:** `src/lib/core/types/chart.ts` *(thêm vào file đã tồn tại, hoặc tạo nếu chưa có)*

```typescript
/**
 * Mô tả dải dữ liệu hiện đang hiển thị trên chart viewport.
 * Được emit bởi ChartCanvas qua prop onVisibleRangeChange.
 */
export interface VisibleRange {
  /** 0-based index của bar đầu tiên trong viewport */
  startIndex: number;
  /** 0-based index của bar cuối cùng trong viewport */
  endIndex: number;
  /** Date/time của bar đầu tiên */
  startDate: Date;
  /** Date/time của bar cuối cùng */
  endDate: Date;
  /** Số bar đang hiển thị */
  barCount: number;
}
```

### 1.2 ChartCanvas.tsx — thêm prop và emit

**Thêm vào interface props của ChartCanvas:**

```typescript
// Trong ChartCanvasProps interface (tìm theo propTypes hoặc interface hiện có):
onVisibleRangeChange?: (range: VisibleRange) => void;
```

**Thêm vào componentDidUpdate:**

```typescript
componentDidUpdate(prevProps: ChartCanvasProps, prevState: ChartCanvasState) {
  // === GAP 1: Emit visible range khi plotData thay đổi ===
  const { onVisibleRangeChange } = this.props;
  if (onVisibleRangeChange && this.state.plotData !== prevState.plotData) {
    const { plotData } = this.state;
    if (plotData.length > 0) {
      onVisibleRangeChange({
        startIndex: plotData[0].idx as number,
        endIndex: plotData[plotData.length - 1].idx as number,
        startDate: plotData[0].date as Date,
        endDate: plotData[plotData.length - 1].date as Date,
        barCount: plotData.length,
      });
    }
  }
  // === END GAP 1 ===

  // ... rest của componentDidUpdate nếu có
}
```

> **Lưu ý:** `plotData[n].idx` là field index trong fullData — đây là index 0-based trong
> mảng data gốc. Nếu field có tên khác trong codebase, điều chỉnh cho khớp. Kiểm tra shape
> của `EnrichedDatum` hoặc tương đương trong `src/lib/core/types/`.

**Quan trọng — performance guard:** Chỉ emit khi `plotData` thực sự thay đổi reference
(`!==`). Không emit trong mọi render. React class component so sánh reference của state
object — nếu `filterData()` luôn tạo array mới thì mọi update sẽ emit. Nếu cần, thêm
deepEqual guard cho `[startIndex, endIndex]`:

```typescript
// Nếu cần thêm guard:
const prevRange = prevState.plotData.length > 0
  ? { startIndex: prevState.plotData[0].idx, endIndex: prevState.plotData[prevState.plotData.length - 1].idx }
  : null;
const nextRange = plotData.length > 0
  ? { startIndex: plotData[0].idx, endIndex: plotData[plotData.length - 1].idx }
  : null;
if (
  prevRange?.startIndex !== nextRange?.startIndex ||
  prevRange?.endIndex !== nextRange?.endIndex
) {
  onVisibleRangeChange({ ... });
}
```

### 1.3 DynamicChart.tsx — forward callback

**Thêm vào DynamicChartProps:**

```typescript
import { VisibleRange } from "./types/chart";

interface DynamicChartProps {
  // ... existing props ...
  onVisibleRangeChange?: (range: VisibleRange) => void;
}
```

**Trong function body, truyền qua ChartCanvas:**

```typescript
function DynamicChart({ onVisibleRangeChange, ...rest }: DynamicChartProps) {
  // Stable callback — wrap trong useCallback để tránh re-render cascade
  const handleVisibleRangeChange = useCallback(
    (range: VisibleRange) => onVisibleRangeChange?.(range),
    [onVisibleRangeChange]
  );

  return (
    <ChartCanvas
      ...
      onVisibleRangeChange={onVisibleRangeChange ? handleVisibleRangeChange : undefined}
    />
  );
}
```

### 1.4 Export

Thêm `VisibleRange` vào:
- `src/lib/core/index.ts`
- `src/index.ts` (public package export)

---

## 2. Gap 2 — Canvas Overlay System

### 2.1 ChartRenderContext

**File:** `src/lib/core/canvas/ChartRenderContext.ts` *(new)*

```typescript
import { createContext, useContext } from "react";
import { VisibleRange } from "../types/chart";

/**
 * Context chứa thông tin render hiện tại của chart.
 * Được provide bởi ChartCanvas và consumed bởi OverlayCanvas.
 */
export interface ChartRenderContextValue {
  /** d3-scale hoặc tương đương: map Date/number → pixel x */
  xScale: (value: Date | number) => number;
  /** d3-scale hoặc tương đương: map price/value → pixel y */
  yScale: (value: number) => number;
  /** Dữ liệu đang hiển thị trong viewport */
  plotData: readonly Record<string, unknown>[];
  /** Chiều rộng một cây nến (pixel) */
  candleWidth: number;
  /** devicePixelRatio để xử lý HiDPI */
  devicePixelRatio: number;
  /** Dải hiển thị hiện tại (từ Gap 1) */
  visibleRange: VisibleRange | null;
  /** Chiều rộng canvas (CSS pixel) */
  width: number;
  /** Chiều cao canvas (CSS pixel) */
  height: number;
}

export const ChartRenderContext = createContext<ChartRenderContextValue | null>(null);

export function useChartRenderContext(): ChartRenderContextValue {
  const ctx = useContext(ChartRenderContext);
  if (!ctx) {
    throw new Error(
      "useChartRenderContext phải được dùng bên trong ChartCanvas tree"
    );
  }
  return ctx;
}
```

### 2.2 ChartCanvas.tsx — provide context

`ChartCanvas` cần wrap children trong `ChartRenderContext.Provider`. Tìm phần `render()` của
class component:

```typescript
// Trong render() của ChartCanvas:
import { ChartRenderContext, ChartRenderContextValue } from "./core/canvas/ChartRenderContext";

render() {
  // ... existing render logic ...

  const renderContextValue: ChartRenderContextValue = {
    xScale: this.state.xScale,       // lấy từ state hiện tại
    yScale: this.getYScale(),         // helper hiện có hoặc lấy từ children context
    plotData: this.state.plotData,
    candleWidth: this.state.chartConfig?.width ?? 8,
    devicePixelRatio: this.props.ratio ?? window.devicePixelRatio ?? 1,
    visibleRange: this.currentVisibleRange ?? null,  // từ Gap 1 emit
    width: this.props.width ?? 0,
    height: this.props.height ?? 0,
  };

  return (
    <ChartRenderContext.Provider value={renderContextValue}>
      {/* existing children */}
    </ChartRenderContext.Provider>
  );
}
```

> **Lưu ý implementation:** `ChartCanvas` là class component. `ChartRenderContext.Provider`
> bọc bên trong `render()` là đúng pattern. `this.currentVisibleRange` là một instance variable
> được set trong `componentDidUpdate` (Gap 1 đã emit callback — cùng lúc update instance var).

**Thêm instance variable vào class:**

```typescript
private currentVisibleRange: VisibleRange | null = null;

componentDidUpdate(...) {
  // Gap 1 code...
  if (onVisibleRangeChange && ...) {
    const range: VisibleRange = { ... };
    this.currentVisibleRange = range;  // cập nhật instance var
    onVisibleRangeChange(range);
  }
}
```

### 2.3 OverlayCanvas component

**File:** `src/lib/core/canvas/OverlayCanvas.tsx` *(new)*

```typescript
import React, { useRef, useEffect, useCallback } from "react";
import { useChartRenderContext, ChartRenderContextValue } from "./ChartRenderContext";

export interface OverlayDrawContext {
  ctx: CanvasRenderingContext2D;
  xScale: ChartRenderContextValue["xScale"];
  yScale: ChartRenderContextValue["yScale"];
  plotData: ChartRenderContextValue["plotData"];
  candleWidth: ChartRenderContextValue["candleWidth"];
  devicePixelRatio: ChartRenderContextValue["devicePixelRatio"];
  visibleRange: ChartRenderContextValue["visibleRange"];
  width: ChartRenderContextValue["width"];
  height: ChartRenderContextValue["height"];
}

export interface OverlayCanvasProps {
  /**
   * Callback render. Được gọi mỗi khi chart re-render.
   * Phải stable (useCallback) từ phía consumer để tránh vòng lặp render.
   */
  draw: (context: OverlayDrawContext) => void;
  /**
   * z-index CSS của canvas overlay.
   * Mặc định 5: trên main chart (3), dưới crosshair (10).
   */
  zIndex?: number;
  /** CSS class cho overlay canvas nếu cần style */
  className?: string;
}

/**
 * Canvas overlay render-only (pointerEvents: none).
 * Được dùng cho whale bubbles, heatmap, liquidation markers.
 * Không được dùng cho drawing tools interactive — dùng SVG cho đó.
 *
 * Phải đặt bên trong cây component của ChartCanvas để có context.
 */
export function OverlayCanvas({ draw, zIndex = 5, className }: OverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderCtx = useChartRenderContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { devicePixelRatio, width, height } = renderCtx;

    // Thiết lập HiDPI
    const physicalWidth = width * devicePixelRatio;
    const physicalHeight = height * devicePixelRatio;
    if (canvas.width !== physicalWidth || canvas.height !== physicalHeight) {
      canvas.width = physicalWidth;
      canvas.height = physicalHeight;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    // Clear trước khi vẽ
    ctx.clearRect(0, 0, width, height);

    // Delegate sang consumer
    draw({
      ctx,
      xScale: renderCtx.xScale,
      yScale: renderCtx.yScale,
      plotData: renderCtx.plotData,
      candleWidth: renderCtx.candleWidth,
      devicePixelRatio: renderCtx.devicePixelRatio,
      visibleRange: renderCtx.visibleRange,
      width: renderCtx.width,
      height: renderCtx.height,
    });
  }, [draw, renderCtx]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex,
        pointerEvents: "none",  // QUAN TRỌNG: không block mouse event
        width: renderCtx.width,
        height: renderCtx.height,
      }}
    />
  );
}
```

### 2.4 WhaleBubbleOverlay — ví dụ minh họa

**File:** `src/lib/indicators/overlays/WhaleBubbleOverlay.tsx` *(new)*

```typescript
import React, { useCallback } from "react";
import { OverlayCanvas, OverlayDrawContext } from "../../core/canvas/OverlayCanvas";

export interface WhaleEvent {
  /** Timestamp khớp với date của bar trong plotData */
  ts: Date;
  /** Giá tại thời điểm lệnh cá mập */
  price: number;
  /** BUY hoặc SELL */
  side: "BUY" | "SELL";
  /** Giá trị lệnh (VND hoặc USD) */
  matchedValue: number;
  /** Severity: HIGH | EXTREME */
  severity?: "HIGH" | "EXTREME";
}

export interface WhaleBubbleOverlayProps {
  /** Danh sách whale events để render */
  events: readonly WhaleEvent[];
  /**
   * Ngưỡng matchedValue để tính radius.
   * radius = sqrt(event.matchedValue / threshold) * baseRadius
   * Mặc định: 5_000_000_000 (5 tỷ VND)
   */
  threshold?: number;
  /** Base radius pixel (tương ứng với 1x threshold). Mặc định: 12 */
  baseRadius?: number;
  /** Max radius để tránh bubble quá lớn. Mặc định: 40 */
  maxRadius?: number;
}

/**
 * Overlay render whale buy/sell bubble trực tiếp lên canvas price pane.
 * Phải đặt bên trong cây component của ChartCanvas.
 *
 * Data thật đến từ VNInvestSignalAdapter (GĐ2). File này chỉ là renderer.
 */
export function WhaleBubbleOverlay({
  events,
  threshold = 5_000_000_000,
  baseRadius = 12,
  maxRadius = 40,
}: WhaleBubbleOverlayProps) {
  const draw = useCallback(
    ({ ctx, xScale, yScale, plotData }: OverlayDrawContext) => {
      if (events.length === 0) return;

      // Build ts → bar lookup
      const tsToBar = new Map<number, Record<string, unknown>>();
      for (const bar of plotData) {
        const d = bar["date"] as Date | undefined;
        if (d) tsToBar.set(d.getTime(), bar);
      }

      for (const event of events) {
        const bar = tsToBar.get(event.ts.getTime());
        if (!bar) continue;

        const barDate = bar["date"] as Date;
        const x = xScale(barDate);
        const y = yScale(event.price);

        const rawRadius = Math.sqrt(event.matchedValue / threshold) * baseRadius;
        const radius = Math.min(rawRadius, maxRadius);

        // Màu theo side + severity
        const alpha = event.severity === "EXTREME" ? 0.85 : 0.65;
        const fillColor =
          event.side === "BUY"
            ? `rgba(0, 200, 100, ${alpha})`
            : `rgba(220, 50, 50, ${alpha})`;
        const strokeColor =
          event.side === "BUY" ? "rgba(0, 255, 120, 0.9)" : "rgba(255, 80, 80, 0.9)";

        // Vẽ bubble
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = event.severity === "EXTREME" ? 2 : 1;
        ctx.stroke();

        // Label nhỏ ở tâm nếu EXTREME
        if (event.severity === "EXTREME" && radius > 20) {
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${Math.round(radius * 0.5)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(event.side === "BUY" ? "▲" : "▼", x, y);
        }
      }
    },
    [events, threshold, baseRadius, maxRadius]
  );

  return <OverlayCanvas draw={draw} zIndex={6} />;
}
```

---

## 3. Gap 3 — Scroll/Zoom API

### 3.1 ChartHandle type

**File:** `src/lib/core/types/chart.ts` *(thêm vào cùng file với VisibleRange)*

```typescript
/**
 * Imperative handle cho DynamicChart.
 * Dùng qua forwardRef + useImperativeHandle.
 *
 * @example
 * const chartRef = useRef<ChartHandle>(null);
 * <DynamicChart ref={chartRef} ... />
 * chartRef.current?.scrollToIndex(50, "center");
 */
export interface ChartHandle {
  /**
   * Di chuyển viewport đến bar tại index (0-based trong fullData).
   * @param index - index 0-based của bar trong mảng data gốc
   * @param align - vị trí bar trong viewport sau khi scroll (mặc định: "center")
   */
  scrollToIndex(index: number, align?: "left" | "center" | "right"): void;

  /**
   * Thu hẹp viewport về khoảng [startIndex, endIndex] (inclusive).
   * @param startIndex - index đầu (0-based)
   * @param endIndex - index cuối (0-based)
   */
  zoomToRange(startIndex: number, endIndex: number): void;

  /**
   * Di chuyển viewport đến date gần nhất với giá trị được cho.
   * Tìm bar có `date >= targetDate` đầu tiên rồi gọi scrollToIndex.
   * @param date - target date
   * @param align - vị trí sau khi scroll (mặc định: "center")
   */
  scrollToDate(date: Date, align?: "left" | "center" | "right"): void;
}
```

### 3.2 ChartCanvas.tsx — thêm public methods

Thêm 3 method vào class `ChartCanvas`:

```typescript
/**
 * Set xExtents mới để di chuyển viewport.
 * Được gọi bởi DynamicChart handle.
 */
public setXExtents(extents: [Date, Date]): void {
  this.setState({ xExtents: extents });
}

/**
 * Trả về toàn bộ fullData (data gốc, không lọc).
 * Được gọi bởi DynamicChart handle để tính index.
 */
public getFullData(): readonly Record<string, unknown>[] {
  // data là prop của ChartCanvas — tên prop thực tế có thể là `data` hoặc `fullData`
  // Kiểm tra và điều chỉnh cho khớp với codebase
  return this.props.data as readonly Record<string, unknown>[];
}

/**
 * Trả về số bar hiện đang hiển thị (zoom level).
 * Được gọi bởi DynamicChart handle để tính extents mới sau scroll.
 */
public getCurrentViewportBarCount(): number {
  return this.state.plotData.length;
}
```

### 3.3 DynamicChart.tsx — forwardRef + useImperativeHandle

**Đây là thay đổi chính nhất của Gap 3.**

```typescript
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
} from "react";
import { ChartHandle, VisibleRange } from "./types/chart";
import ChartCanvas from "../ChartCanvas";

// Type của ref trỏ vào ChartCanvas class instance
type ChartCanvasRef = InstanceType<typeof ChartCanvas>;

// Helper: tính extents mới từ index + align + current zoom level
function computeExtentsForIndex(
  index: number,
  align: "left" | "center" | "right",
  currentBarCount: number,
  fullData: readonly Record<string, unknown>[]
): [Date, Date] | null {
  if (fullData.length === 0) return null;

  const half = Math.floor(currentBarCount / 2);
  let start: number;
  let end: number;

  switch (align) {
    case "left":
      start = index;
      end = Math.min(index + currentBarCount - 1, fullData.length - 1);
      break;
    case "right":
      end = index;
      start = Math.max(index - currentBarCount + 1, 0);
      break;
    case "center":
    default:
      start = Math.max(index - half, 0);
      end = Math.min(index + half, fullData.length - 1);
      break;
  }

  const startDate = (fullData[start] as { date: Date }).date;
  const endDate = (fullData[end] as { date: Date }).date;
  return [startDate, endDate];
}

// DynamicChartProps — thêm onVisibleRangeChange (từ Gap 1)
interface DynamicChartProps {
  // ... existing props ...
  onVisibleRangeChange?: (range: VisibleRange) => void;
}

/**
 * DynamicChart với forwardRef để expose ChartHandle.
 *
 * Backward compatible: <DynamicChart /> không có ref vẫn hoạt động.
 */
const DynamicChart = forwardRef<ChartHandle, DynamicChartProps>(
  function DynamicChart({ onVisibleRangeChange, ...rest }, ref) {
    const canvasRef = useRef<ChartCanvasRef>(null);

    useImperativeHandle(
      ref,
      () => ({
        scrollToIndex(index, align = "center") {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const fullData = canvas.getFullData();
          const barCount = canvas.getCurrentViewportBarCount();
          const extents = computeExtentsForIndex(index, align, barCount, fullData);
          if (extents) canvas.setXExtents(extents);
        },

        zoomToRange(startIndex, endIndex) {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const fullData = canvas.getFullData();
          if (startIndex < 0 || endIndex >= fullData.length) return;
          const startDate = (fullData[startIndex] as { date: Date }).date;
          const endDate = (fullData[endIndex] as { date: Date }).date;
          canvas.setXExtents([startDate, endDate]);
        },

        scrollToDate(date, align = "center") {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const fullData = canvas.getFullData();
          // Tìm index đầu tiên có date >= target
          const index = fullData.findIndex(
            (d) => (d as { date: Date }).date >= date
          );
          if (index < 0) return;
          const barCount = canvas.getCurrentViewportBarCount();
          const extents = computeExtentsForIndex(index, align, barCount, fullData);
          if (extents) canvas.setXExtents(extents);
        },
      }),
      [] // deps trống — handle chỉ cần canvasRef.current, không stale
    );

    const handleVisibleRangeChange = useCallback(
      (range: VisibleRange) => onVisibleRangeChange?.(range),
      [onVisibleRangeChange]
    );

    return (
      <ChartCanvas
        ref={canvasRef}
        onVisibleRangeChange={onVisibleRangeChange ? handleVisibleRangeChange : undefined}
        {...rest}
      />
    );
  }
);

DynamicChart.displayName = "DynamicChart";

export default DynamicChart;
export type { DynamicChartProps };
```

> **Lưu ý về `ChartCanvas` ref:** `ChartCanvas` là class component → `useRef<ChartCanvasRef>`
> trả về instance trực tiếp. Không cần `forwardRef` trên `ChartCanvas`.

### 3.4 Export

Thêm vào `src/lib/core/index.ts`:
```typescript
export type { ChartHandle, VisibleRange } from "./types/chart";
export { OverlayCanvas } from "./canvas/OverlayCanvas";
export { useChartRenderContext } from "./canvas/ChartRenderContext";
```

Thêm vào `src/index.ts`:
```typescript
export type { ChartHandle, VisibleRange } from "./lib/core/types/chart";
export { OverlayCanvas } from "./lib/core/canvas/OverlayCanvas";
export { WhaleBubbleOverlay } from "./lib/indicators/overlays/WhaleBubbleOverlay";
```

---

## 4. Edge cases và guard rails

### Gap 1 — Guard rails

| Case | Behavior mong muốn |
|------|--------------------|
| `plotData` empty (chart chưa load data) | Không emit callback |
| `onVisibleRangeChange` không được truyền | Không tạo closure, không overhead |
| Pan đến đầu/cuối data | Emit với startIndex=0 hoặc endIndex=fullData.length-1 |
| Data thay đổi (symbol mới) | Emit ngay khi plotData đầu tiên được set |

### Gap 2 — Guard rails

| Case | Behavior mong muốn |
|------|--------------------|
| `draw` throw exception | catch trong useEffect, log warning, không crash chart |
| `events` array empty | `draw` return ngay, không clear canvas không cần thiết |
| Canvas width/height = 0 | Skip render cycle, không divide by zero |
| `OverlayCanvas` unmount | useEffect cleanup không cần vì canvas biến mất |

### Gap 3 — Guard rails

| Case | Behavior mong muốn |
|------|--------------------|
| `ref` không được truyền | `forwardRef` xử lý gracefully — không có effect |
| `scrollToIndex(-1, ...)` | Return ngay, không gọi `setXExtents` |
| `scrollToIndex(9999, ...)` với data 100 bar | Clamp về max index (fullData.length - 1) |
| `zoomToRange(50, 10)` (start > end) | Return ngay (invalid range) |
| `scrollToDate` với date trước tất cả data | Scroll về index 0 |
| `scrollToDate` với date sau tất cả data | findIndex trả -1 → return ngay |
| `canvasRef.current` là null khi method được gọi | Guard `if (!canvas) return` |

---

## 5. Không được làm (Forbidden)

1. **Không sửa `EventCapture.tsx`** — mọi thứ cần làm trong Gap 1 nằm trong `ChartCanvas.tsx`.
2. **Không thêm `pointerEvents` trên `OverlayCanvas`** — canvas overlay phải transparent với
   mouse. Drawing tools vẫn dùng SVG.
3. **Không để `WhaleBubbleOverlay` tự fetch data** — component chỉ nhận `events` prop.
   Network calls thuộc về GĐ2 adapter, không phải Gap 2.
4. **Không thay đổi signature hiện có của `DynamicChart`** — forwardRef là additive. Tất cả
   consumer hiện tại phải compile không cần chỉnh.
5. **Không thêm third-party dependency** — tất cả giải pháp dùng React, TypeScript, và DOM API.
