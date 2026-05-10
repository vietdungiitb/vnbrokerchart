# VNStockChart → DXCharts Lite: Phân tích migration từ lõi

> **Phiên bản:** 1.0  
> **Ngày:** 2026-05-07  
> **Phạm vi:** Phân tích kỹ thuật chi tiết — phần nào kế thừa, phần nào viết lại  
> **Tiền đề:** Đọc trước `CANVAS_ENGINE_MIGRATION.md`  
> **License target:** MPL-2.0 (DXCharts Lite) — VNStockChart app code không bị ảnh hưởng

---

## 1. DXCharts Lite — Kiến trúc cần nắm

### 1.1 Canvas layers (6 lớp)

```
backgroundCanvas      ← màu nền, grid
mainCanvas            ← candles, volume bars, data series
dynamicObjectsCanvas  ← MA, BB, indicators, custom drawers
yAxisLabelsCanvas     ← y-axis labels, price labels
crossToolCanvas       ← crosshair cursor
hitTestCanvas         ← invisible layer cho mouse hit-testing
```

Truy cập từ chart instance:
```ts
chart.backgroundCanvasModel.ctx      // CanvasRenderingContext2D
chart.yAxisLabelsCanvasModel.ctx
chart.dynamicObjectsCanvasModel.ctx  // ← dùng nhiều nhất cho custom indicators
```

### 1.2 Custom Drawer API (cho indicators tùy chỉnh)

```ts
const myIndicatorDrawer = {
  draw() {
    const ctx = chart.dynamicObjectsCanvasModel.ctx;
    const series = chart.chartModel.mainCandleSeries.getSeriesInViewport().flat();
    const bounds = chart.bounds.getBounds('PANE_CHART');
    
    ctx.save();
    clipToBounds(ctx, bounds);  // clip về pane, không tràn ra trục
    
    series.forEach(candle => {
      const x = candle.x(chart.scale);  // timestamp → pixel X
      const y = candle.y(chart.scale);  // price → pixel Y
      ctx.fillRect(x, y, 2, 2);
    });
    
    ctx.restore();
  },
  getCanvasIds() {
    return [chart.dynamicObjectsCanvasModel.canvasId];
  }
};

chart.drawingManager.addDrawerAfter(myIndicatorDrawer, 'CVD_DRAWER', 'DATA_SERIES');
```

### 1.3 Custom Data Series Drawer API (đơn giản hơn, nhận pre-calc points)

```ts
// DXCharts tính toán VisualSeriesPoint[] cho mình từ raw data
const myLineDrawer = {
  draw(ctx, allPoints, model, hitTestConfig) {
    allPoints.forEach(points => {
      const flat = points.flat();
      ctx.beginPath();
      flat.forEach((pt, i) => {
        const x = pt.x(model.view);
        const y = pt.y(model.view);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = hitTestConfig.color ?? '#2962ff';
      ctx.stroke();
    });
  }
};

chart.data.registerDataSeriesTypeDrawer('RSI_LINE', myLineDrawer);

// Sau đó dùng:
const pane = chart.paneManager.createPane('RSI_PANE', { ... });
const dataSeries = pane.createDataSeries();
dataSeries.setDataPoints(rsiPoints);   // VisualSeriesPoint[]
dataSeries.setType('RSI_LINE');
```

### 1.4 PaneManager API

```ts
// Tạo pane mới
const pane = chart.paneManager.createPane(uuid, { yExtent: { visible: true } });

// Quản lý panes
chart.paneManager.removePane(uuid);
chart.paneManager.panes[uuid].moveUp();
chart.paneManager.panes[uuid].moveDown();
const order = chart.paneManager.panesOrder;  // uuid[]

// Data series trong pane
const ds = pane.createDataSeries();
ds.setDataPoints(points);    // VisualSeriesPoint[]
ds.setType('RSI_LINE');      // dùng registered drawer
pane.removeDataSeries(ds);
```

### 1.5 React integration pattern (official)

```tsx
const DXChartsWrapper: React.FC<Props> = ({ candles, panes }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartInstance | null>(null);

  // Init một lần
  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (node && !chartRef.current) {
      chartRef.current = DXChart.createChart(node, config);
    }
  }, []);

  // Update data imperatively
  useEffect(() => {
    chartRef.current?.setData({ candles });
  }, [candles]);

  return <div ref={setRef} style={{ width: '100%', height }} />;
};
```

### 1.6 Coordinate system

```ts
// Value → pixel
const x = candlePoint.x(chart.scale);   // number (px)
const y = candlePoint.y(chart.scale);   // number (px)

// Ngược lại: pixel → value
const price = chart.scale.fromY(pixelY);
const time  = chart.scale.fromX(pixelX);
```

---

## 2. VNStockChart — Bản đồ source hiện tại

```
src/
├── lib/
│   ├── core/
│   │   ├── calculators/
│   │   │   ├── enrichData.ts               [A] KEEP
│   │   │   ├── indicatorComputation.ts     [A] KEEP
│   │   │   ├── types.ts (EnrichedDatum)    [A] KEEP
│   │   │   ├── calcCVDApprox.ts            [A] KEEP
│   │   │   ├── calcStrengthElder.ts        [A] KEEP
│   │   │   ├── calcWhaleApprox.ts          [A] KEEP
│   │   │   └── __tests__/                  [A] KEEP
│   │   ├── hooks/
│   │   │   └── useDynamicPanes.ts          [B] ADAPT (giữ state logic, thay apply)
│   │   ├── types/
│   │   │   ├── pane-descriptor.ts          [A] KEEP
│   │   │   └── seriesComponents.ts         [A] KEEP
│   │   ├── registry/
│   │   │   └── SeriesRegistry.ts           [C] REWRITE (đổi sang DXCharts API)
│   │   ├── DynamicChart.tsx                [C] REWRITE (React wrapper cho DXChart)
│   │   └── seriesValueResolver.ts          [A] KEEP
│   ├── indicators/                         [A] KEEP (math utils)
│   │   ├── builtin/ (30 files)
│   │   ├── utils.ts
│   │   └── registry.ts
│   ├── calculator/ (20 files JS)           [A] KEEP (legacy math, dùng bởi indicators/)
│   ├── ChartCanvas.tsx                     [D] OBSOLETE
│   ├── CanvasContainer.tsx                 [D] OBSOLETE
│   ├── Chart.tsx                           [D] OBSOLETE
│   ├── GenericComponent.tsx                [D] OBSOLETE
│   ├── series/ (27 files)                  [C] REWRITE as DXCharts drawers
│   ├── interactive/ (22 files)             [C] REWRITE as DXCharts custom drawers
│   ├── axes/ (7 files)                     [D] OBSOLETE → DXCharts axis config
│   ├── coordinates/ (11 files)             [D] OBSOLETE → DXCharts crossTool
│   ├── tooltip/ (13 files)                 [C] REWRITE → DXCharts y-label-provider
│   ├── annotation/ (6 files)               [C] REWRITE → DXCharts custom drawers
│   └── helper/ (5 files)                   [D] OBSOLETE (fitWidth → DXCharts auto-resize)
├── demo/
│   ├── LibraryShowcaseDemo.tsx             [A] KEEP
│   ├── PaneSettingsModal.tsx               [A] KEEP
│   ├── i18n.tsx                            [A] KEEP
│   ├── demoData.ts                         [A] KEEP
│   └── demo.css                            [A] KEEP
└── widget/                                 [A] KEEP shell
```

**Legend:**
- `[A] KEEP` — giữ nguyên, không cần thay đổi
- `[B] ADAPT` — giữ logic, thay phần interface với chart engine
- `[C] REWRITE` — viết lại hoàn toàn dưới DXCharts API
- `[D] OBSOLETE` — xóa, DXCharts thay thế hoàn toàn

---

## 3. Phân tích chi tiết từng module

### 3.1 [A] enrichData pipeline — GIỮ NGUYÊN 100%

**File:** `src/lib/core/calculators/enrichData.ts`, `indicatorComputation.ts`, `types.ts`

Đây là lõi domain logic — **không phụ thuộc vào rendering engine nào**. Nhận `RawOHLCV[]`, trả `EnrichedDatum[]` với tất cả indicator values đã tính. DXCharts Lite không cung cấp indicator math, nên đây là lợi thế cạnh tranh giữ lại hoàn toàn.

```ts
// Không thay đổi gì:
const enriched = enrichData(rawBars, { series: panes.flatMap(p => p.series) });
// Kết quả EnrichedDatum[] → convert sang VisualSeriesPoint[] cho DXCharts
```

**Conversion layer cần viết (nhỏ):**
```ts
// src/lib/core/dxcharts/pointConverters.ts  (NEW, ~50 LOC)
function enrichedToVisualPoints(enriched: EnrichedDatum[], accessor: (d: EnrichedDatum) => number | undefined): VisualSeriesPoint[] {
  return enriched
    .filter(d => accessor(d) !== undefined)
    .map(d => ({ timestamp: d.date.getTime(), value: accessor(d)! }));
}
```

### 3.2 [A] Calculator math — GIỮ NGUYÊN

**Files:** `src/lib/calculator/` (20 file JS), `src/lib/indicators/` (30+ files)

Toàn bộ toán học (EMA, MACD, RSI, CVD, Whale, StrengthElder...) là pure functions, không phụ thuộc React hay D3 rendering. Giữ nguyên.

### 3.3 [A] Types & SSOT — GIỮ NGUYÊN

**Files:** `pane-descriptor.ts`, `seriesComponents.ts`

`SeriesTypeId`, `SeriesConfig`, `DEFAULT_PANES`, `SERIES_SUB_COMPONENTS` — tất cả là type/data definitions thuần, không coupled với engine.

### 3.4 [B] useDynamicPanes — ADAPT (thay apply layer)

**File:** `src/lib/core/hooks/useDynamicPanes.ts`

Giữ nguyên:
- `useReducer` state management
- `loadPaneLayout()` / `savePaneLayout()` localStorage persistence
- `addPane`, `removePane`, `movePaneUp/Down`, `updateSeriesColor`, `updateSeriesSubColor` actions
- Toàn bộ Redux-style reducer logic

**Cần thay:**
```ts
// Hiện tại (không có — DynamicChart.tsx đọc state và render JSX)
// Sau migration: thêm "sync to DXCharts" effect

// src/lib/core/hooks/useDynamicPanes.ts — thêm vào cuối
export function useSyncToDXChart(
  chartRef: React.RefObject<DXChartInstance>,
  panes: PaneDescriptor[],
  enriched: EnrichedDatum[]
) {
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    syncPanesToDXChart(chart, panes, enriched);  // hàm mới
  }, [chartRef, panes, enriched]);
}
```

### 3.5 [C] SeriesRegistry — VIẾT LẠI

**File:** `src/lib/core/registry/SeriesRegistry.ts`

Hiện tại registry chứa `label`, `defaultColor`, `yAxis`, `isOverlay` cho mỗi SeriesTypeId. Sau migration cần thêm:

```ts
// src/lib/core/registry/SeriesRegistry.ts — thêm field
export interface RegistryEntry {
  label: string;
  defaultColor: string;
  yAxis: "left" | "right";
  isOverlay: boolean;
  // NEW: DXCharts integration
  drawerType: string;             // ← tên đăng ký với DXCharts
  drawerFactory: () => DXChartsSeriesDrawer;  // ← factory tạo drawer
  toVisualPoints: (enriched: EnrichedDatum[], config: SeriesConfig) => DXSeriesPoint[];  // ← convert data
}
```

Mỗi `registerSeries()` call thêm 3 fields mới. Ví dụ RSI:

```ts
registerSeries("RSI", {
  label: "RSI",
  defaultColor: "#2962ff",
  yAxis: "right",
  isOverlay: false,
  // NEW:
  drawerType: "RSI_DRAWER",
  drawerFactory: () => createRsiDrawer(),   // vẽ line + thresholds
  toVisualPoints: (enriched, cfg) => enriched.map(d => ({
    timestamp: d.date.getTime(),
    value: d.rsi ?? Number.NaN,
  })),
});
```

### 3.6 [C] DynamicChart — VIẾT LẠI

**File:** `src/lib/core/DynamicChart.tsx`

Hiện tại: JSX component với `<ChartCanvas>`, `<Chart>`, switch-case render series.

Sau migration:

```tsx
// src/lib/core/DynamicChart.tsx — viết lại hoàn toàn (~300 LOC → ~200 LOC)
export const DynamicChart: React.FC<DynamicChartProps> = ({
  data, panes, height, width, ...
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dxChartRef = useRef<DXChartInstance | null>(null);

  // 1. Init DXChart
  useEffect(() => {
    if (!containerRef.current) return;
    dxChartRef.current = DXChart.createChart(containerRef.current, buildDXConfig());
    registerAllDrawers(dxChartRef.current);  // đăng ký toàn bộ 30+ drawers một lần
    return () => { DXChart.dispose(containerRef.current!); };
  }, []);

  // 2. Sync enriched data
  const enriched = useMemo(() => enrichData(data, { series: flatSeries(panes) }), [data, panes]);

  // 3. Sync panes → DXChart paneManager
  useEffect(() => {
    const chart = dxChartRef.current;
    if (!chart) return;
    syncPanesToDXChart(chart, panes, enriched);
  }, [panes, enriched]);

  // 4. Sync dimensions
  useEffect(() => {
    dxChartRef.current?.setSize(width, height);
  }, [width, height]);

  return <div ref={containerRef} style={{ width, height }} />;
};
```

`syncPanesToDXChart` là hàm mới (~150 LOC) replace toàn bộ logic JSX render hiện tại:

```ts
function syncPanesToDXChart(chart: DXChartInstance, panes: PaneDescriptor[], enriched: EnrichedDatum[]) {
  const { paneManager } = chart;

  // Reconcile panes: add/remove/reorder
  const existingUUIDs = new Set(paneManager.panesOrder);
  panes.forEach(pane => {
    if (!existingUUIDs.has(pane.id)) {
      paneManager.createPane(pane.id, { yExtent: { visible: true } });
    }
  });
  existingUUIDs.forEach(uuid => {
    if (!panes.find(p => p.id === uuid)) {
      paneManager.removePane(uuid);
    }
  });

  // Sync series data in each pane
  panes.forEach(pane => {
    const dxPane = paneManager.panes[pane.id];
    pane.series.forEach(series => {
      const entry = getSeries(series.type);
      const points = entry.toVisualPoints(enriched, series);
      const ds = getOrCreateDataSeries(dxPane, series.id);
      ds.setDataPoints(points);
      ds.setType(entry.drawerType);
    });
  });
}
```

### 3.7 [C] Series drawers — VIẾT LẠI (quan trọng nhất)

**Files:** `src/lib/series/` (27 files) — toàn bộ thay bằng DXCharts custom drawers

Mỗi series type cần một drawer function. Ví dụ:

#### Candlestick drawer
```ts
// src/lib/core/dxcharts/drawers/candlestickDrawer.ts
export const createCandlestickDrawer = (): DXChartsSeriesDrawer => ({
  draw(ctx, allPoints, model, hitTest) {
    allPoints.flat().forEach(pt => {
      const x = pt.x(model.view);
      const yOpen = /* convert open price to pixel */;
      const yClose = /* convert close price to pixel */;
      const isUp = pt.close > pt.open;
      
      ctx.fillStyle = hitTest.color ?? (isUp ? '#26a69a' : '#ef5350');
      ctx.fillRect(x - candleHalfWidth, Math.min(yOpen, yClose), candleWidth, Math.abs(yClose - yOpen));
      // wick...
    });
  }
});
```

#### CVD Approx drawer (domain-specific)
```ts
// src/lib/core/dxcharts/drawers/cvdDrawer.ts
export const createCVDDrawer = (): DXChartsSeriesDrawer => ({
  draw(ctx, allPoints, model, hitTest) {
    // CVD là line chart tích lũy
    const points = allPoints.flat();
    ctx.beginPath();
    points.forEach((pt, i) => {
      const x = pt.x(model.view);
      const y = pt.y(model.view);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = hitTest.color ?? '#7b1fa2';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
});
```

#### Whale drawer (bar chart với threshold coloring)
```ts
// src/lib/core/dxcharts/drawers/whaleDrawer.ts
export const createWhaleDrawer = (): DXChartsSeriesDrawer => ({
  draw(ctx, allPoints, model, hitTest) {
    allPoints.flat().forEach(pt => {
      const x = pt.x(model.view);
      const y0 = model.view.toY(0);  // baseline = 0
      const y = pt.y(model.view);
      const isBuy = pt.rawValue > 0;
      
      ctx.fillStyle = hitTest.color ?? (isBuy ? '#26a69a' : '#ef5350');
      ctx.fillRect(x - barHalfWidth, Math.min(y, y0), barWidth, Math.abs(y - y0));
    });
  }
});
```

**Ước tính:** ~27 drawers, mỗi cái ~30–80 LOC = ~1500–2000 LOC tổng, nhưng pattern lặp lại nhiều (line, histogram, multi-line) nên có thể dùng factory helpers:

```ts
// src/lib/core/dxcharts/drawers/helpers.ts
export const createLineDrawer = (defaultColor: string): DXChartsSeriesDrawer => ({ ... });
export const createHistogramDrawer = (upColor: string, downColor: string): DXChartsSeriesDrawer => ({ ... });
export const createMultiLineDrawer = (keys: string[]): DXChartsSeriesDrawer => ({ ... });
```

Với helpers này, nhiều drawers chỉ cần 3–5 LOC:
```ts
registerSeries("RSI", { ..., drawerFactory: () => createMultiLineDrawer(['line', 'overbought', 'middle', 'oversold']) });
registerSeries("MACD", { ..., drawerFactory: () => createMacdDrawer() });
registerSeries("CVDApprox", { ..., drawerFactory: () => createLineDrawer('#7b1fa2') });
```

### 3.8 [C] Drawing tools — VIẾT LẠI dưới DXCharts custom drawers

**Files:** `src/lib/interactive/` (22 files)

DXCharts **không có** built-in drawing tools (TrendLine, Fib, Channel...). Cần implement lại bằng cách dùng `chart.dynamicObjectsCanvasModel.ctx` và `chart.crossToolComponent` cho event handling.

**Approach:**

```ts
// src/lib/core/dxcharts/drawings/trendLineDrawing.ts
export class TrendLineDrawing {
  private startPoint: { price: number; timestamp: number } | null = null;
  private endPoint: { price: number; timestamp: number } | null = null;

  getDrawer(chart: DXChartInstance): DXChartsDrawer {
    return {
      draw() {
        if (!this.startPoint || !this.endPoint) return;
        const ctx = chart.dynamicObjectsCanvasModel.ctx;
        const x1 = chart.scale.toX(this.startPoint.timestamp);
        const y1 = chart.scale.toY(this.startPoint.price);
        const x2 = chart.scale.toX(this.endPoint.timestamp);
        const y2 = chart.scale.toY(this.endPoint.price);
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      },
      getCanvasIds: () => [chart.dynamicObjectsCanvasModel.canvasId],
    };
  }
}
```

**Lưu ý quan trọng:** Mouse event handling không qua DXCharts — phải dùng native DOM events trên container.

**Ưu điểm so với hiện tại:** Drawing state JSON (đã có persistence/import/export) **giữ nguyên hoàn toàn** vì format không phụ thuộc vào SVG hay Canvas.

### 3.9 [D] Obsolete layer — XÓA

Các file sau không cần sau migration:

| File | Dòng code | Lý do xóa |
|---|---|---|
| `src/lib/ChartCanvas.tsx` | ~680 | DXChart.createChart() thay thế |
| `src/lib/CanvasContainer.tsx` | ~60 | DXCharts quản lý canvas nội bộ |
| `src/lib/Chart.tsx` | ~200 | pane.createDataSeries() thay thế |
| `src/lib/GenericComponent.tsx` | ~400 | DXCharts drawingManager thay thế |
| `src/lib/EventCapture.tsx` | ~300 | DXCharts built-in event handling |
| `src/lib/axes/` (7 files) | ~500 | DXCharts axis config |
| `src/lib/coordinates/` (11 files) | ~600 | DXCharts crossTool + scale |
| `src/lib/helper/` (5 files) | ~200 | DXCharts auto-resize |
| D3 dependencies | ~1.2MB | Không cần nếu không dùng SVG |
| **Tổng** | **~2940 LOC** | → giảm bundle ~1.5MB gzip |

---

## 4. Bảng tổng hợp: Kế thừa vs Viết lại

| Module | Dòng code | Action | Effort | Ghi chú |
|---|---|---|---|---|
| `enrichData.ts` + `indicatorComputation.ts` | ~600 | ✅ KEEP | 0 | Lõi domain, không đổi |
| `calcCVD/Whale/StrengthElder.ts` | ~300 | ✅ KEEP | 0 | Domain specific advantage |
| `calculator/` (20 files) | ~2000 | ✅ KEEP | 0 | Math pure functions |
| `indicators/builtin/` (30 files) | ~1500 | ✅ KEEP | 0 | Math + accessor |
| `types/pane-descriptor.ts` | ~200 | ✅ KEEP | 0 | Types |
| `types/seriesComponents.ts` | ~100 | ✅ KEEP | 0 | SSOT sub-colors |
| `seriesValueResolver.ts` | ~80 | ✅ KEEP | 0 | |
| `demo/` shell (5 files) | ~1500 | ✅ KEEP | 0 | UI, i18n, settings |
| `useDynamicPanes.ts` | ~700 | 🔄 ADAPT | 1 sprint | Thêm sync effect |
| `SeriesRegistry.ts` | ~700 | 🔄 ADAPT | 1 sprint | Thêm 3 fields/entry |
| `DynamicChart.tsx` | ~750 | ✍️ REWRITE | 2 sprint | React → DXChart wrapper |
| Drawer helpers | 0 → ~400 | ✍️ NEW | 1 sprint | Line/histogram/multi-line factories |
| Series drawers (27 types) | 0 → ~1500 | ✍️ NEW | 3 sprint | Dùng factories, pattern đơn giản |
| Drawing tools (22 tools) | ~2200 | ✍️ REWRITE | 4 sprint | Phức tạp nhất, event handling |
| pointConverters.ts | 0 → ~100 | ✍️ NEW | 0.5 sprint | EnrichedDatum → DXSeriesPoint |
| **TỔNG VIẾT MỚI/THAY** | ~5650 LOC | | **~12 sprint** | |
| **TỔNG XÓA** | ~2940 LOC | | | |
| **TỔNG GIỮ** | ~7080 LOC | | | |

---

## 5. Phân tích rủi ro đặc thù

### R1 — Coordinate system gap (NGHIÊM TRỌNG)

VNStockChart hiện dùng D3 `scaleTime` / `scaleLinear` làm coordinate system. DXCharts dùng `chart.scale` riêng. Khi convert:

```ts
// Hiện tại (D3)
const xScale = d3.scaleTime().domain([t0, t1]).range([0, width]);
const x = xScale(datum.date);

// Sau migration (DXCharts)
const x = seriesPoint.x(chart.scale);        // DXCharts tự tính
// hoặc: chart.scale.toX(datum.date.getTime())
```

**Vấn đề với Drawing tools:** Tools như TrendLine cần convert mouse click position → (price, timestamp) để store trong JSON. DXCharts cung cấp `chart.scale.fromX(px)` và `chart.scale.fromY(px)` nhưng cần kiểm tra behavior với discontinuous time scale (weekends, gaps).

**Mitigation:** Viết `CoordinateAdapter` wrapper — abstraction layer che giấu DXCharts scale internals. Viết unit tests cho coordinate roundtrip.

### R2 — Data model mismatch

DXCharts dùng `VisualSeriesPoint { timestamp: number, value: number }` — chỉ hỗ trợ single value per point. VNStockChart có multi-value indicators (MACD: macd + signal + divergence; KDJ: k + d + j...).

**Giải pháp:** Mỗi sub-component là một DataSeries riêng trong cùng pane:
```ts
// RSI pane: 4 data series
const dsLine = pane.createDataSeries();   dsLine.setType('RSI_LINE');
const dsOB   = pane.createDataSeries();   dsOB.setType('RSI_OVERBOUGHT');
const dsMid  = pane.createDataSeries();   dsMid.setType('RSI_MIDDLE');
const dsOS   = pane.createDataSeries();   dsOS.setType('RSI_OVERSOLD');
```

Pattern này map hoàn hảo với `SERIES_SUB_COMPONENTS` SSOT đã có.

### R3 — Tooltip custom content

DXCharts cung cấp `chart.yAxis.registerLabelColorResolver()` và `chart.yAxis.registerYAxisLabelPlugin()` nhưng không có sẵn "hover tooltip" kiểu GoCharting. 

**Giải pháp:** Dùng DXCharts `crossToolComponent` để nhận candle hover events, sau đó render tooltip bằng React DOM overlay (div tuyệt đối):
```ts
chart.crossToolComponent.onHover.subscribe(({ candle }) => {
  setTooltipData(buildTooltipData(candle, enriched, panes));
});
```

Tooltip React component không cần thay đổi gì — chỉ thêm event subscription.

### R4 — MPL-2.0 compliance

DXCharts Lite là **MPL-2.0**. Quy tắc:
- ✅ VNStockChart **app code** (src/demo/, src/lib/core/) có thể giữ bất kỳ license nào
- ✅ Nếu VNStockChart dùng DXCharts như thư viện (không modify source) → không bị MPL
- ⚠️ Nếu **modify DXCharts source** (fork, patch internals) → modifications phải MPL-2.0
- **Recommendation:** Đừng fork DXCharts — dùng public API + custom drawers. Nếu cần patch, gửi PR upstream.

---

## 6. Migration path — Phase plan

### Phase 0: Foundation (2 tuần)
- [ ] Cài `@devexperts/dxcharts-lite`, viết type declarations nếu cần
- [ ] Viết `CoordinateAdapter` (D3 scale compat wrapper)
- [ ] Viết `pointConverters.ts` (EnrichedDatum → VisualSeriesPoint)
- [ ] Viết `DXChartsWrapper.tsx` cơ bản (chỉ Candlestick)
- [ ] Benchmark FPS: 5000 nến so sánh trước/sau → validate ROI

### Phase 1: Core series (3 tuần)
- [ ] Drawer helpers: `createLineDrawer`, `createHistogramDrawer`, `createMultiLineDrawer`
- [ ] Đăng ký 10 drawers đơn giản: MA, EMA, RSI, Volume, BB, MACD, KDJ, DMI, OBV, CCI
- [ ] `syncPanesToDXChart()` function
- [ ] Update `SeriesRegistry.ts` với `drawerFactory` + `toVisualPoints`

### Phase 2: Domain indicators (1 tuần)
- [ ] CVD Approx/Realtime drawers
- [ ] Whale drawer (buy/sell bars)
- [ ] StrengthElder drawer (bull/bear power histogram)
- [ ] StrengthRelative drawer

### Phase 3: DynamicChart rewrite (2 tuần)
- [ ] Viết lại `DynamicChart.tsx` dùng DXChart instance
- [ ] `useSyncToDXChart` hook
- [ ] Đảm bảo Settings modal vẫn work (color picking → update drawer config)
- [ ] PaneSettings sub-colors sync với drawer state

### Phase 4: Drawing tools (4 tuần)
- [ ] CoordinateAdapter đầy đủ (mouse → price/timestamp)
- [ ] TrendLine, HorizontalLine, VerticalLine (đơn giản nhất)
- [ ] FibRetracement (multi-line)
- [ ] Channel, Pitchfork (phức tạp)
- [ ] ABCD, PositionTool (phức tạp nhất)
- [ ] Persistence: export/import JSON → giữ format hiện tại

### Phase 5: Cleanup (1 tuần)
- [ ] Xóa `src/lib/series/`, `src/lib/axes/`, `src/lib/coordinates/`, `src/lib/helper/`
- [ ] Xóa `ChartCanvas.tsx`, `CanvasContainer.tsx`, `Chart.tsx`, `GenericComponent.tsx`
- [ ] Remove D3 deps không còn dùng → giảm bundle
- [ ] Update `module_tree_full.md`

**Tổng:** ~13 tuần (3 tháng) — 1 dev full-time

---

## 7. PoC đề nghị trước khi commit

**Tuần 1 — PoC nhanh (1 ngày):**

```bash
npm install @devexperts/dxcharts-lite
```

```tsx
// src/poc/DXChartsPoC.tsx
import * as DXChart from '@devexperts/dxcharts-lite';
import { useRef, useEffect } from 'react';
import { enrichData } from '../lib/core/calculators/enrichData';

export const DXChartsPoC = ({ rawData }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = DXChart.createChart(ref.current);
    const enriched = enrichData(rawData);
    chart.setData({ candles: enriched.map(d => ({
      timestamp: d.date.getTime(),
      open: d.open, high: d.high, low: d.low, close: d.close, volume: d.volume
    }))});
    
    // RSI pane
    const pane = chart.paneManager.createPane('RSI', {});
    const ds = pane.createDataSeries();
    ds.setDataPoints(enriched.map(d => ({ timestamp: d.date.getTime(), value: d.rsi ?? NaN })));
    
    return () => DXChart.dispose(ref.current!);
  }, [rawData]);
  return <div ref={ref} style={{ width: '100%', height: 600 }} />;
};
```

**Mục tiêu PoC:** Xác nhận:
1. Candlestick render đúng với `enrichData()` output
2. RSI pane hiển thị trong pane riêng
3. FPS với 5000 nến + RSI pane > 50fps
4. React integration không có memory leak

---

*Tài liệu này là input cho implementation slices. Phải hoàn thành PoC trước khi tạo Phase 1 slices.*  
*Cập nhật lần cuối: 2026-05-07 (v1.0)*
