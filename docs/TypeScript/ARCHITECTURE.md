# Kiến trúc thư viện — KLineChart-style Runtime API

> Tham khảo: [KLineChart](https://github.com/klinecharts/KLineChart)  
> Mục tiêu: Thư viện thuần TypeScript (framework-agnostic core), React wrapper tùy chọn.  
> Runtime: thêm/xóa pane, thay indicator, load data — tất cả không cần unmount/remount.

---

## 1. Triết lý thiết kế

### Framework-agnostic core + React wrapper tùy chọn

```
@myorg/stock-charts-core        ← thuần TypeScript, zero React dependency
    Chart class (imperative API)
    PaneManager
    IndicatorRegistry
    DataStore
    Canvas renderer

@myorg/stock-charts-react       ← thin React wrapper (useRef + useEffect)
    <StockChart ref={chartRef} />
    useChart() hook
    useIndicator() hook
```

### Imperative API (như KLineChart/TradingView)
```typescript
// Khởi tạo một lần
const chart = createChart(domElement, options);

// Runtime: thêm data
chart.applyNewData(bars);
chart.updateLastBar(latestBar);

// Runtime: thêm/xóa indicator
const paneId = chart.createIndicator('RSI', { period: 14 });
chart.removeIndicator({ name: 'RSI' });

// Runtime: thêm pane mới
chart.createIndicator('MACD', { period: [12, 26, 9] }, { id: 'pane-macd', height: 120 });

// Runtime: thay đổi pane
chart.setPaneOptions({ id: 'pane-macd', height: 200 });

// Dọn dẹp
chart.dispose();
```

---

## 2. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                     Chart (facade)                          │
│  createChart() → Chart instance → public API               │
├─────────────────┬───────────────┬───────────────────────────┤
│   PaneManager   │   DataStore   │   EventBus                │
│  ─────────────  │  ───────────  │  ──────────               │
│  CandlePane     │  KLineData[]  │  onCrosshairChange        │
│  IndicatorPane  │  visibleRange │  onZoom                   │
│  XAxisPane      │  barSpace     │  onScroll                 │
│  SeparatorPane  │  scrollOffset │  onDataLoad               │
├─────────────────┴───────────────┴───────────────────────────┤
│                 IndicatorRegistry                           │
│  registerIndicator(name, def)                              │
│  createIndicator(name, params, paneId)                     │
│  removeIndicator(filter)                                   │
├─────────────────────────────────────────────────────────────┤
│                 OverlayRegistry                             │
│  registerOverlay(name, def) ← drawing tools               │
│  createOverlay(name, points)                               │
├─────────────────────────────────────────────────────────────┤
│              Canvas Renderer (per pane)                     │
│  MainWidget (candlestick + indicators)                     │
│  YAxisWidget (price axis)                                  │
│  SeparatorWidget (drag to resize)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Pane System

### Pane types

```typescript
type PaneType = 'candle' | 'indicator' | 'xAxis';

interface PaneOptions {
    id: string;
    height?: number;
    minHeight?: number;
    order?: number;                      // thứ tự hiển thị từ trên xuống
    state?: 'normal' | 'maximize' | 'minimize';
    axis?: {
        name?: string;                   // custom YAxis
        scrollZoomEnabled?: boolean;
        position?: 'left' | 'right';
        inside?: boolean;                // axis bên trong chart area
        gap?: { top?: number; bottom?: number };
    };
}

const PaneIdConstants = {
    CANDLE: 'candle_pane',
    X_AXIS: 'x_axis_pane',
} as const;
```

### Vòng đời pane

```
createIndicator('RSI', params, { id: 'pane-rsi', height: 100 })
    → IndicatorRegistry.get('RSI') → IndicatorClass
    → DataStore.addIndicator(instance, 'pane-rsi')
    → PaneManager.createPane(IndicatorPane, 'pane-rsi', options)  ← nếu pane chưa tồn tại
    → layout() → DOM re-sort → measure → canvas redraw

removeIndicator({ paneId: 'pane-rsi' })
    → DataStore.removeIndicator(...)
    → PaneManager.removePane('pane-rsi')   ← nếu pane không còn indicator nào
    → layout() → recalculate heights → redraw
```

---

## 4. DataStore & DataLoader

### KLineData interface (tương thích KLineChart)
```typescript
export interface KLineData {
    timestamp: number;    // unix ms
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
    turnover?: number;
    // Mở rộng cho VN/orderflow:
    buyVolume?: number;
    sellVolume?: number;
    openInterest?: number;
    [key: string]: unknown;  // custom fields cho indicator
}
```

### DataLoader — infinite scroll + real-time
```typescript
export interface LoadDataParams {
    type: 'forward' | 'backward';   // forward = cuộn ngược, backward = cuộn xuôi
    data: KLineData[];               // data hiện có
    callback: (data: KLineData[], noMore?: boolean) => void;
}

export interface DataLoader {
    load(params: LoadDataParams): void;
}

// Implement cho Django/vnstock:
class DjangoDataLoader implements DataLoader {
    constructor(private symbol: string, private timeframe: string) {}

    load({ type, data, callback }: LoadDataParams): void {
        if (type === 'forward') {
            // Tải bars cũ hơn (cuộn trái)
            const oldest = data[0];
            fetch(`/api/bars/${this.symbol}/?tf=${this.timeframe}&before=${oldest?.timestamp}`)
                .then(r => r.json())
                .then((bars: KLineData[]) => callback(bars, bars.length === 0));
        }
    }
}

// Dùng:
chart.setDataLoader(new DjangoDataLoader('VCB', '1D'));
chart.applyNewData(initialBars);  // load 300 bars đầu tiên
// Sau đó khi user scroll trái → DataLoader.load() tự động được gọi
```

---

## 5. Indicator System

### Định nghĩa indicator
```typescript
export interface IndicatorTemplate<T = unknown> {
    name: string;
    shortName?: string;
    series?: 'normal' | 'price' | 'volume';  // loại giá trị
    precision?: number;
    calcParams?: number[];                    // default params

    // Hàm tính toán — pure function
    calc(dataList: KLineData[], indicator: Indicator<T>): T[] | Promise<T[]>;

    // Cách vẽ — nếu không khai báo → dùng figures
    draw?(params: IndicatorDrawParams<T>): boolean;

    // Mô tả từng output để vẽ tự động
    figures?: IndicatorFigure<T>[];

    // Tooltip labels
    regenerateFigures?: (calcParams: number[]) => IndicatorFigure<T>[];
}

export interface IndicatorFigure<T> {
    key: string;                   // tên field trong T
    title?: string;                // label tooltip
    type?: 'line' | 'bar' | 'circle';
    baseValue?: number;            // baseline cho bar (mặc định 0)
    styles?: (data: IndicatorFigureStylesData<T>) => IndicatorFigureStyles;
}
```

### Ví dụ: Đăng ký RSI
```typescript
import { registerIndicator } from '@myorg/stock-charts-core';

registerIndicator({
    name: 'RSI',
    shortName: 'RSI',
    calcParams: [14],
    precision: 2,
    figures: [
        { key: 'rsi', title: 'RSI: ', type: 'line' },
    ],
    calc(dataList, { calcParams: [period] }) {
        const closes = dataList.map(d => d.close);
        return rsiPure(closes, period).map(v => ({ rsi: v }));
    },
});
```

### Ví dụ: Đăng ký CVD (custom)
```typescript
registerIndicator({
    name: 'CVD',
    shortName: 'CVD',
    series: 'normal',
    figures: [
        {
            key: 'delta',
            title: 'Delta: ',
            type: 'bar',
            baseValue: 0,
            styles: ({ data }) => ({
                color: (data.current?.delta ?? 0) >= 0 ? '#26a69a' : '#ef5350',
            }),
        },
        { key: 'cvd', title: 'CVD: ', type: 'line' },
    ],
    calc(dataList) {
        let cumulative = 0;
        return dataList.map(d => {
            const delta = (d.buyVolume ?? 0) - (d.sellVolume ?? 0);
            cumulative += delta;
            return { delta, cvd: cumulative };
        });
    },
});

// Runtime: thêm vào chart
chart.createIndicator('CVD', false, { id: 'pane-cvd', height: 120 });
```

---

## 6. Overlay System (Drawing Tools)

```typescript
export interface OverlayTemplate {
    name: string;
    totalStep?: number;              // số điểm cần click để hoàn thành

    // Các figures tạo thành overlay (line, circle, rect, text...)
    createPointFigures?(params: OverlayCreateFiguresParams): OverlayFigure[];
    createXAxisFigures?(params: OverlayCreateFiguresParams): OverlayFigure[];

    // Lifecycle hooks
    onDrawStart?(event: OverlayEvent): boolean | void;
    onDrawing?(event: OverlayEvent): boolean | void;
    onDrawEnd?(event: OverlayEvent): boolean | void;
    onSelected?(event: OverlayEvent): boolean | void;
    onDeselected?(event: OverlayEvent): boolean | void;
    onPressedMoveStart?(event: OverlayEvent): boolean | void;
    onPressedMoving?(event: OverlayEvent): boolean | void;
    onPressedMoveEnd?(event: OverlayEvent): boolean | void;
    onRightClick?(event: OverlayEvent): boolean | void;
    onRemoved?(event: OverlayEvent): boolean | void;
}

// Ví dụ: TrendLine
registerOverlay({
    name: 'trendLine',
    totalStep: 2,
    createPointFigures({ coordinates, overlay }) {
        return [
            {
                type: 'line',
                attrs: { coordinates },
                styles: { style: overlay.styles?.line },
            },
        ];
    },
});

// Runtime:
chart.createOverlay('trendLine');
// Sau đó user click 2 điểm → tự động hoàn thành
```

---

## 7. React Wrapper

```tsx
// @myorg/stock-charts-react
import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { createChart, type Chart, type Options } from '@myorg/stock-charts-core';

export interface StockChartRef {
    chart: Chart | null;
}

interface StockChartProps {
    options?: Options;
    style?: React.CSSProperties;
    className?: string;
    onInit?: (chart: Chart) => void;
}

export const StockChart = forwardRef<StockChartRef, StockChartProps>(
    ({ options, style, className, onInit }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const chartRef = useRef<Chart | null>(null);

        useImperativeHandle(ref, () => ({ chart: chartRef.current }));

        useEffect(() => {
            if (!containerRef.current) return;
            const chart = createChart(containerRef.current, options);
            chartRef.current = chart;
            onInit?.(chart);
            return () => {
                chart.dispose();
                chartRef.current = null;
            };
        }, []); // Chỉ mount một lần — mọi thay đổi qua imperative API

        return <div ref={containerRef} style={style} className={className} />;
    }
);

// Dùng:
function TradingView() {
    const chartRef = useRef<StockChartRef>(null);

    const handleAddRSI = () => {
        chartRef.current?.chart?.createIndicator('RSI', false, {
            id: 'pane-rsi',
            height: 120,
        });
    };

    const handleRemoveRSI = () => {
        chartRef.current?.chart?.removeIndicator({ name: 'RSI' });
    };

    return (
        <>
            <button onClick={handleAddRSI}>+ RSI</button>
            <button onClick={handleRemoveRSI}>- RSI</button>
            <StockChart
                ref={chartRef}
                style={{ width: '100%', height: '600px' }}
                onInit={(chart) => {
                    chart.setDataLoader(new DjangoDataLoader('VCB', '1D'));
                    chart.applyNewData(initialBars);
                }}
            />
        </>
    );
}
```

---

## 8. Cấu trúc thư mục

```
packages/
├── core/                          ← @myorg/stock-charts-core
│   ├── src/
│   │   ├── Chart.ts               ← facade (createChart, dispose)
│   │   ├── Store.ts               ← DataStore (KLineData[], scrollOffset, barSpace)
│   │   ├── Event.ts               ← mouse/touch/wheel event handler
│   │   ├── pane/
│   │   │   ├── DrawPane.ts        ← base class
│   │   │   ├── CandlePane.ts
│   │   │   ├── IndicatorPane.ts
│   │   │   ├── XAxisPane.ts
│   │   │   └── SeparatorPane.ts
│   │   ├── component/
│   │   │   ├── Indicator.ts       ← indicator instance model
│   │   │   ├── Overlay.ts         ← drawing tool instance model
│   │   │   ├── XAxis.ts
│   │   │   └── YAxis.ts
│   │   ├── widget/
│   │   │   ├── MainWidget.ts      ← canvas renderer cho pane body
│   │   │   └── YAxisWidget.ts     ← canvas renderer cho Y axis
│   │   ├── extension/
│   │   │   ├── indicator/         ← built-in indicators + registry
│   │   │   │   ├── registry.ts
│   │   │   │   ├── MA.ts
│   │   │   │   ├── RSI.ts
│   │   │   │   ├── MACD.ts
│   │   │   │   ├── BOLL.ts
│   │   │   │   ├── VOL.ts
│   │   │   │   ├── CVD.ts
│   │   │   │   └── ...
│   │   │   ├── overlay/           ← built-in drawing tools + registry
│   │   │   │   ├── registry.ts
│   │   │   │   ├── trendLine.ts
│   │   │   │   ├── fibRetracement.ts
│   │   │   │   └── ...
│   │   │   └── figure/            ← primitive shapes (line, rect, circle, text)
│   │   ├── common/
│   │   │   ├── Styles.ts          ← theme / style config
│   │   │   ├── DataLoader.ts
│   │   │   └── utils/
│   │   └── index.ts               ← public API exports
│   ├── tsconfig.json
│   └── package.json
│
└── react/                         ← @myorg/stock-charts-react
    ├── src/
    │   ├── StockChart.tsx         ← forwardRef wrapper
    │   ├── hooks/
    │   │   ├── useChart.ts        ← access chart instance from context
    │   │   └── useDataLoader.ts   ← convenience hook
    │   └── index.ts
    ├── tsconfig.json
    └── package.json
```

---

## 9. So sánh với KLineChart

| Tính năng | KLineChart | Thư viện này |
|-----------|------------|--------------|
| Core | Pure TS, no deps | Pure TS, no deps |
| React | Không có official wrapper | `@myorg/stock-charts-react` |
| Indicator API | `registerIndicator` + `createIndicator` | Tương tự + thêm async calc |
| Drawing tools | `registerOverlay` + `createOverlay` | Tương tự |
| Pane | Dynamic, runtime | Dynamic, runtime |
| DataLoader | ✅ (forward/backward) | ✅ + WebSocket realtime |
| VN market | Không có | VN-specific: buyVolume, sellVolume, foreignVolume |
| Orderflow | Không có | CVD, Volume Profile, Delta |
| Multi-chart sync | Không có | Cross-chart crosshair sync |

---

## 10. Thứ tự implementation

```
Phase 1: Core skeleton
    Chart.ts facade
    Store.ts (data management)  
    PaneManager (CandlePane + XAxisPane)
    Canvas rendering cơ bản (candlestick)
    Zoom + scroll + pan

Phase 2: Indicator system
    IndicatorRegistry
    createIndicator / removeIndicator
    IndicatorPane
    Built-in: MA, RSI, MACD, BOLL, VOL, CVD

Phase 3: Drawing tools
    OverlayRegistry
    createOverlay state machine
    Built-in: TrendLine, HorizontalLine, FibRetracement

Phase 4: DataLoader
    infinite scroll (forward)
    real-time update (updateLastBar, addNewBar)

Phase 5: React wrapper
    StockChart component
    useChart hook

Phase 6: VN orderflow
    buyVolume/sellVolume field support
    CVD, Volume Profile, Delta indicators
    Whale marker overlay
```
