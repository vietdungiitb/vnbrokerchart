# Kiến trúc thư viện — GoCharting-style React/TypeScript

> Định hướng: GoCharting terminal — professional financial chart library  
> Stack: React 19 + TypeScript strict + HTML5 Canvas (hybrid)  
> Tham khảo thêm: KLineChart (runtime pane API), TradingView (UX patterns)  
>  
> **Nguyên tắc cốt lõi:** React state điều khiển cấu trúc pane layout.  
> Canvas rendering độc lập mỗi pane — thêm/xóa pane runtime không làm canvas khác bị redraw.

---

## 1. Triết lý thiết kế

### React JSX declarative là giao diện chính

```tsx
// Toàn bộ layout được khai báo bằng JSX — không có imperative DOM manipulation.
// Thêm/xóa pane = cập nhật React state → React diff → canvas pane mới tự mount.

<ChartTerminal symbol="VCB" timeframe="1D" adapter={djangoAdapter}>
    <ChartPane id="price" height="60%">
        <CandlestickSeries />
        <EMAOverlay period={20} />
        <BollingerBandOverlay period={20} />
        <VolumeProfileSeries mode="visible" />

        {/* Trục Y phải — hệ tọa độ thứ 2 trên cùng pane */}
        <YAxisRight>
            <VolumeSeries />   {/* volume dùng thang đo riêng */}
        </YAxisRight>
    </ChartPane>

    <PaneSplitter />   {/* kéo để resize runtime */}

    <ChartPane id="rsi" height="20%">
        <RSISeries period={14} />
        <RSILevels levels={[30, 70]} />
    </ChartPane>

    <PaneSplitter />

    <ChartPane id="cvd" height="20%">
        <CumulativeDeltaSeries />
    </ChartPane>
</ChartTerminal>
```

### Runtime = React state, không phải imperative API

```tsx
// usePaneManager hook quản lý danh sách pane dưới dạng React state.
// Thêm RSI runtime = push config vào mảng → React mount pane mới.
// Pane cũ không bị redraw vì mỗi ChartPane có canvas độc lập.

function TradingTerminal() {
    const { panes, addPane, removePane, resizePane } = usePaneManager([
        { id: 'price', height: '60%', indicators: [] },
    ]);

    return (
        <ChartTerminal>
            {panes.map((pane, i) => (
                <>
                    <ChartPane key={pane.id} config={pane} onClose={() => removePane(pane.id)} />
                    {i < panes.length - 1 && (
                        <PaneSplitter onResize={(delta) => resizePane(pane.id, delta)} />
                    )}
                </>
            ))}
        </ChartTerminal>
    );
}
```

---

## 2. Kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────────────────┐
│  ChartTerminal (React component)                                     │
│  ├── ChartSyncContext  ← xDomain, crosshairX, shared state          │
│  ├── DataContext       ← OHLCVBar[], isLoading, loadMore()          │
│  └── PaneManagerContext ← panes[], addPane(), removePane()          │
├──────────────┬───────────────────────────────────────────────────────┤
│  ChartPane   │  PaneSplitter (draggable divider)                    │
│  ──────────  │                                                       │
│  PaneToolbar │  Drag → resizePane(id, newHeightPx)                  │
│  ChartCanvas │  Min height: 40px, animated resize                   │
│  ├── MainCanvas (price series + overlays)                           │
│  ├── OverlayCanvas (crosshair, drawing tools)                       │
│  ├── YAxisLeft  ← primary scale (price)                            │
│  └── YAxisRight ← secondary scale (volume, OI, custom)             │
├──────────────────────────────────────────────────────────────────────┤
│  Indicator Registry (pure TS functions)                             │
│  registerIndicator(def) / getIndicator(name)                        │
│  Built-in: EMA, BOLL, VWAP, RSI, MACD, Supertrend, CVD,            │
│            VolumeProfile, Footprint, TPO, Delta, OI                 │
├──────────────────────────────────────────────────────────────────────┤
│  Drawing Tool Registry                                              │
│  registerDrawingTool(def) / createTool(name)                        │
│  Built-in: TrendLine, HLine, VLine, Fibonacci, Channel, Arrow, Text │
├──────────────────────────────────────────────────────────────────────┤
│  Data Adapter (interface)                                           │
│  fetchBars() / fetchMoreBars() / subscribeToBar()                   │
│  DjangoAdapter / MockAdapter / BinanceAdapter                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Runtime Pane Management

### PaneConfig — định nghĩa một pane

```typescript
export interface IndicatorConfig {
    name: string;           // 'RSI' | 'EMA' | 'CVD' | 'VolumeProfile' | ...
    params?: Record<string, unknown>;
    yAxis?: 'left' | 'right';   // gắn vào hệ tọa độ nào
    style?: Partial<IndicatorStyle>;
}

export interface PaneConfig {
    id: string;
    heightPx?: number;          // px, undefined = flexible fill
    heightPercent?: number;     // 0–1, dùng khi layout theo %
    minHeightPx?: number;       // default 40
    label?: string;
    indicators: IndicatorConfig[];
    leftAxis?: YAxisConfig;
    rightAxis?: YAxisConfig;    // nếu có → hiện 2 hệ tọa độ
}

export interface YAxisConfig {
    autoScale?: boolean;
    inverted?: boolean;
    scaleType?: 'linear' | 'log' | 'percentage';
    tickFormat?: (value: number) => string;
}
```

### usePaneManager hook

```typescript
export function usePaneManager(initialPanes: PaneConfig[]) {
    const [panes, setPanes] = useState<PaneConfig[]>(initialPanes);

    const addPane = useCallback((config: Omit<PaneConfig, 'id'> & { id?: string }) => {
        const id = config.id ?? `pane-${nanoid(6)}`;
        setPanes(prev => [...prev, { ...config, id }]);
        return id;
    }, []);

    const removePane = useCallback((id: string) => {
        setPanes(prev => prev.filter(p => p.id !== id));
    }, []);

    const resizePane = useCallback((id: string, newHeightPx: number) => {
        setPanes(prev => prev.map(p =>
            p.id === id ? { ...p, heightPx: Math.max(p.minHeightPx ?? 40, newHeightPx) } : p
        ));
    }, []);

    const addIndicator = useCallback((paneId: string, indicator: IndicatorConfig) => {
        setPanes(prev => prev.map(p =>
            p.id === paneId ? { ...p, indicators: [...p.indicators, indicator] } : p
        ));
    }, []);

    const removeIndicator = useCallback((paneId: string, indicatorName: string) => {
        setPanes(prev => prev.map(p =>
            p.id === paneId
                ? { ...p, indicators: p.indicators.filter(i => i.name !== indicatorName) }
                : p
        ));
    }, []);

    const updateIndicator = useCallback((paneId: string, name: string, patch: Partial<IndicatorConfig>) => {
        setPanes(prev => prev.map(p =>
            p.id === paneId
                ? { ...p, indicators: p.indicators.map(i => i.name === name ? { ...i, ...patch } : i) }
                : p
        ));
    }, []);

    return { panes, addPane, removePane, resizePane, addIndicator, removeIndicator, updateIndicator };
}
```

### Ví dụ runtime — thêm RSI pane khi user click

```tsx
function GoChartingTerminal() {
    const { panes, addPane, removePane, resizePane } = usePaneManager([
        {
            id: 'price',
            heightPercent: 0.6,
            indicators: [
                { name: 'Candlestick' },
                { name: 'EMA', params: { period: 20 }, yAxis: 'left' },
                { name: 'Volume', yAxis: 'right' },   // ← thang đo thứ 2
            ],
            rightAxis: { autoScale: true },
        },
    ]);

    const handleAddRSI = () =>
        addPane({ label: 'RSI(14)', indicators: [{ name: 'RSI', params: { period: 14 } }] });

    const handleAddMACD = () =>
        addPane({ label: 'MACD', indicators: [{ name: 'MACD', params: { fast: 12, slow: 26, signal: 9 } }] });

    const handleAddCVD = () =>
        addPane({ label: 'CVD', indicators: [{ name: 'CVD' }] });

    return (
        <div className="terminal">
            <IndicatorToolbar
                onAddRSI={handleAddRSI}
                onAddMACD={handleAddMACD}
                onAddCVD={handleAddCVD}
            />
            <ChartTerminal>
                {panes.map((pane, i) => (
                    <React.Fragment key={pane.id}>
                        <ChartPane
                            config={pane}
                            onClose={() => removePane(pane.id)}
                        />
                        {i < panes.length - 1 && (
                            <PaneSplitter
                                onResize={(newHeight) => resizePane(pane.id, newHeight)}
                            />
                        )}
                    </React.Fragment>
                ))}
            </ChartTerminal>
        </div>
    );
}
```

---

## 4. Dual Y-Axis — Hai hệ tọa độ trên một pane

### Vấn đề cần giải quyết

Một pane giá cần hiển thị đồng thời:
- **Trục trái:** giá (10,000–100,000 VND) — cho Candlestick, EMA, Bollinger
- **Trục phải:** volume (0–10,000,000 cổ phiếu) — cho VolumeSeries, OI

Nếu dùng chung một thang đo, volume sẽ đè lên toàn bộ biểu đồ giá.

### Cơ chế

```
ChartPane
├── MainCanvas
│   ├── LeftScale  = d3.scaleLinear([priceMin, priceMax] → [height, 0])
│   └── RightScale = d3.scaleLinear([volumeMin, volumeMax] → [height * 0.25, 0])
│                                                            ↑ chỉ chiếm 25% từ dưới lên
├── YAxisLeft   ← tick labels cho LeftScale
└── YAxisRight  ← tick labels cho RightScale (mờ hơn, nhỏ hơn)
```

### TypeScript implementation

```typescript
// Mỗi series khai báo mình thuộc về scale nào
export interface SeriesRenderContext {
    xScale: d3.ScaleLinear<number, number>;
    leftScale: d3.ScaleLinear<number, number>;
    rightScale?: d3.ScaleLinear<number, number>;   // undefined nếu pane không có rightAxis
    canvasWidth: number;
    canvasHeight: number;
    data: OHLCVBar[];
    visibleData: OHLCVBar[];
}

// Series khai báo yAxis preference
export interface SeriesDefinition {
    name: string;
    defaultYAxis?: 'left' | 'right';
    computeExtents(data: OHLCVBar[]): [min: number, max: number];
    render(ctx: CanvasRenderingContext2D, renderCtx: SeriesRenderContext): void;
}

// ChartPane tính toán scale độc lập cho từng nhóm:
function computeScales(
    pane: PaneConfig,
    data: OHLCVBar[],
    canvasHeight: number
): { leftScale: Scale; rightScale?: Scale } {
    const leftSeries = pane.indicators.filter(i => (i.yAxis ?? 'left') === 'left');
    const rightSeries = pane.indicators.filter(i => i.yAxis === 'right');

    const leftExtents = leftSeries.map(s => getIndicator(s.name).computeExtents(data, s.params));
    const rightExtents = rightSeries.map(s => getIndicator(s.name).computeExtents(data, s.params));

    const leftScale = d3.scaleLinear()
        .domain(mergeExtents(leftExtents))
        .range([canvasHeight, 0])
        .nice();

    const rightScale = rightExtents.length > 0
        ? d3.scaleLinear()
            .domain(mergeExtents(rightExtents))
            .range([canvasHeight, canvasHeight * 0.75])  // chiếm 25% phía dưới
            .nice()
        : undefined;

    return { leftScale, rightScale };
}
```

### Ví dụ — Price + Volume trên cùng pane

```tsx
<ChartPane
    id="price"
    config={{
        indicators: [
            { name: 'Candlestick', yAxis: 'left' },
            { name: 'EMA', params: { period: 20 }, yAxis: 'left' },
            { name: 'Volume', yAxis: 'right' },
            { name: 'OpenInterest', yAxis: 'right' },
        ],
        leftAxis: { autoScale: true },
        rightAxis: {
            autoScale: true,
            tickFormat: (v) => formatBigNumber(v),
        },
    }}
/>
```

```
Biểu đồ kết quả:
│                     ┊              │
│ ╱╲  ╱╲    EMA ────  │              │ ← Trục giá (trái)
│╱  ╲╱  ╲   Candlestick             │
├──────────────────────────────────── │
│ ▃▃ ▇▇ ▃ ▇▇▇▃▃ ▇ ▃ │              │ ← Volume bars (phải, 25% dưới)
└─────────────────────┴─────────────┘
Price axis (left)      Vol axis (right)
```

---

## 5. PaneSplitter — Resize Runtime

### Component

```tsx
interface PaneSplitterProps {
    onResize: (topPaneNewHeightPx: number) => void;
    minTopHeight?: number;
    minBottomHeight?: number;
}

export function PaneSplitter({ onResize, minTopHeight = 40, minBottomHeight = 40 }: PaneSplitterProps) {
    const splitterRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const startY = useRef(0);
    const startHeight = useRef(0);

    const onMouseDown = (e: React.MouseEvent) => {
        dragging.current = true;
        startY.current = e.clientY;
        // Lấy height của pane phía trên
        const topPane = splitterRef.current?.previousElementSibling as HTMLElement | null;
        startHeight.current = topPane?.getBoundingClientRect().height ?? 0;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!dragging.current) return;
        const delta = e.clientY - startY.current;
        const newHeight = Math.max(minTopHeight, startHeight.current + delta);
        onResize(newHeight);
    };

    const onMouseUp = () => {
        dragging.current = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    return (
        <div
            ref={splitterRef}
            className="pane-splitter"
            onMouseDown={onMouseDown}
            style={{ height: 4, cursor: 'row-resize', background: 'rgba(148,163,184,0.2)' }}
        />
    );
}
```

### CSS transitions để smooth resize

```css
.chart-pane {
    transition: height 0s;   /* NO transition during drag */
    overflow: hidden;
}
.chart-pane.resizing {
    transition: none;
}
```

### Layout engine — tính lại height khi pane bị thay đổi

```typescript
function redistributeHeights(
    panes: PaneConfig[],
    changedId: string,
    newHeightPx: number,
    totalHeightPx: number
): PaneConfig[] {
    const minTotal = panes.reduce((s, p) => s + (p.minHeightPx ?? 40), 0);
    const available = totalHeightPx - minTotal;

    // Pane được resize nhận height mới, các pane còn lại chia đều phần còn thiếu
    const changedPane = panes.find(p => p.id === changedId)!;
    const oldHeight = changedPane.heightPx ?? 0;
    const delta = newHeightPx - oldHeight;

    const otherPanes = panes.filter(p => p.id !== changedId);
    const totalOther = otherPanes.reduce((s, p) => s + (p.heightPx ?? 0), 0);

    return panes.map(p => {
        if (p.id === changedId) return { ...p, heightPx: newHeightPx };
        const ratio = (p.heightPx ?? 0) / totalOther;
        return { ...p, heightPx: Math.max(p.minHeightPx ?? 40, (p.heightPx ?? 0) - delta * ratio) };
    });
}
```

---

## 6. Indicator Registry — Pure TS

### Định nghĩa indicator

```typescript
export interface IndicatorDefinition {
    name: string;
    shortName: string;
    defaultParams?: Record<string, unknown>;
    defaultYAxis?: 'left' | 'right';

    /** Tính toán — pure function, không có side effects */
    compute(data: OHLCVBar[], params: Record<string, unknown>): ComputedIndicator;

    /** Vẽ lên canvas */
    render(ctx: CanvasRenderingContext2D, computed: ComputedIndicator, renderCtx: SeriesRenderContext): void;

    /** Tooltip text khi crosshair hover */
    tooltip?(computed: ComputedIndicator, dataIndex: number): TooltipItem[];

    /** Settings UI — tự động generate form */
    paramSchema?: ParamSchema[];
}

export interface ComputedIndicator {
    name: string;
    values: unknown[];       // tương ứng 1-1 với data[]
    meta?: Record<string, unknown>;  // VolumeProfile bins, TPO letters, v.v.
}
```

### Ví dụ: RSI

```typescript
registerIndicator({
    name: 'RSI',
    shortName: 'RSI',
    defaultParams: { period: 14 },
    defaultYAxis: 'left',

    compute(data, { period }) {
        return { name: 'RSI', values: rsi(data.map(d => d.close), period as number) };
    },

    render(ctx, { values }, { leftScale, xScale, visibleData, canvasHeight }) {
        // Vẽ horizontal bands 30/70
        ctx.strokeStyle = 'rgba(148,163,184,0.3)';
        [30, 70].forEach(level => {
            const y = leftScale(level);
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ctx.canvas.width, y); ctx.stroke();
        });
        // Vẽ RSI line
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        visibleData.forEach((bar, i) => {
            const x = xScale(bar.index);
            const rsiVal = values[bar.dataIndex];
            if (typeof rsiVal !== 'number' || isNaN(rsiVal)) return;
            const y = leftScale(rsiVal);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
    },

    tooltip({ values }, dataIndex) {
        const val = values[dataIndex];
        return [{ label: 'RSI', value: typeof val === 'number' ? val.toFixed(2) : '—' }];
    },

    paramSchema: [
        { key: 'period', label: 'Kỳ', type: 'number', min: 2, max: 200, step: 1 },
    ],
});
```

### Ví dụ: CVD (custom cho VN/crypto)

```typescript
registerIndicator({
    name: 'CVD',
    shortName: 'CVD',
    defaultYAxis: 'left',

    compute(data) {
        let cumulative = 0;
        const values = data.map(d => {
            const delta = (d.buyVolume ?? 0) - (d.sellVolume ?? 0);
            cumulative += delta;
            return { delta, cvd: cumulative };
        });
        return { name: 'CVD', values };
    },

    render(ctx, { values }, { leftScale, xScale, visibleData, barWidth }) {
        // Histogram (delta per bar)
        visibleData.forEach(bar => {
            const v = values[bar.dataIndex] as { delta: number; cvd: number } | undefined;
            if (!v) return;
            const x = xScale(bar.index) - barWidth / 2;
            const y0 = leftScale(0);
            const y1 = leftScale(v.delta);
            ctx.fillStyle = v.delta >= 0 ? '#26a69a' : '#ef5350';
            ctx.fillRect(x, Math.min(y0, y1), barWidth, Math.abs(y0 - y1));
        });
        // CVD line
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        visibleData.forEach((bar, i) => {
            const v = values[bar.dataIndex] as { cvd: number } | undefined;
            if (!v) return;
            const x = xScale(bar.index);
            const y = leftScale(v.cvd);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
    },
});
```

---

## 7. Data Adapter — Interface chuẩn cho Django/vnstock

### OHLCVBar — core data type

```typescript
export interface OHLCVBar {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    // VN market extensions:
    buyVolume?: number;
    sellVolume?: number;
    foreignBuy?: number;
    foreignSell?: number;
    openInterest?: number;
    // dataIndex được gán bởi thư viện:
    index: number;
    dataIndex: number;
}
```

### StockDataAdapter interface

```typescript
export interface StockDataAdapter {
    fetchBars(symbol: string, timeframe: string, from: Date, to: Date): Promise<OHLCVBar[]>;
    fetchMoreBars(symbol: string, timeframe: string, before: Date, limit?: number): Promise<OHLCVBar[]>;
    subscribeToBar(symbol: string, timeframe: string, cb: (bar: OHLCVBar) => void): Unsubscribe;
    subscribeToTrades(symbol: string, cb: (trade: Trade) => void): Unsubscribe;
    subscribeToOrderbook(symbol: string, cb: (snapshot: OrderbookSnapshot) => void): Unsubscribe;
    searchSymbols(query: string): Promise<SymbolInfo[]>;
}

export type Unsubscribe = () => void;
```

### DjangoVnstockAdapter — implement mẫu

```typescript
export class DjangoVnstockAdapter implements StockDataAdapter {
    constructor(private baseUrl = '') {}

    async fetchBars(symbol, timeframe, from, to) {
        const params = new URLSearchParams({
            tf: timeframe, from: from.toISOString(), to: to.toISOString(),
        });
        const res = await fetch(`${this.baseUrl}/api/bars/${symbol}/?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json() as RawBar[]).map(toOHLCVBar);
    }

    async fetchMoreBars(symbol, timeframe, before, limit = 300) {
        const params = new URLSearchParams({
            tf: timeframe, before: before.toISOString(), limit: String(limit),
        });
        const res = await fetch(`${this.baseUrl}/api/bars/${symbol}/?${params}`);
        return (await res.json() as RawBar[]).map(toOHLCVBar);
    }

    subscribeToBar(symbol, timeframe, cb) {
        const ws = new WebSocket(`${this.wsUrl}/ws/bars/${symbol}/${timeframe}/`);
        ws.onmessage = (e) => cb(toOHLCVBar(JSON.parse(e.data as string)));
        return () => ws.close();
    }
    // ...
}
```

---

## 8. Cấu trúc thư mục

```
src/
├── lib/
│   ├── components/
│   │   ├── ChartTerminal.tsx          ← root component, cung cấp contexts
│   │   ├── ChartPane.tsx              ← một pane (có canvas riêng)
│   │   ├── PaneSplitter.tsx           ← drag-to-resize divider
│   │   ├── PaneToolbar.tsx            ← label + settings + close button
│   │   ├── YAxisLeft.tsx
│   │   ├── YAxisRight.tsx
│   │   ├── XAxis.tsx
│   │   └── Crosshair.tsx              ← vertical line + tooltip
│   │
│   ├── canvas/
│   │   ├── ChartCanvas.tsx            ← manages canvases (main + overlay layers)
│   │   ├── CandlestickRenderer.ts     ← draws candles
│   │   ├── IndicatorLayer.ts          ← calls each indicator's render()
│   │   ├── DrawingToolLayer.ts        ← handles drawing state machine
│   │   └── canvasUtils.ts
│   │
│   ├── indicators/
│   │   ├── registry.ts                ← registerIndicator / getIndicator
│   │   ├── moving-averages/
│   │   │   ├── sma.ts                 ← pure function
│   │   │   ├── ema.ts
│   │   │   ├── hull.ts
│   │   │   └── index.ts               ← indicator definitions (compute + render)
│   │   ├── oscillators/
│   │   │   ├── rsi.ts
│   │   │   ├── macd.ts
│   │   │   └── index.ts
│   │   ├── volatility/
│   │   │   ├── bollinger.ts
│   │   │   ├── atr.ts
│   │   │   └── index.ts
│   │   ├── orderflow/
│   │   │   ├── cvd.ts
│   │   │   ├── volumeProfile.ts
│   │   │   ├── footprint.ts
│   │   │   ├── delta.ts
│   │   │   └── index.ts
│   │   └── built-in.ts                ← registerIndicator() cho tất cả built-in
│   │
│   ├── drawing-tools/
│   │   ├── registry.ts
│   │   ├── state-machine.ts           ← idle→drawing→selected→moving→resizing
│   │   ├── tools/
│   │   │   ├── trendLine.ts
│   │   │   ├── horizontalLine.ts
│   │   │   ├── fibonacci.ts
│   │   │   ├── rectangle.ts
│   │   │   └── arrowMarker.ts
│   │   └── DrawingObject.ts           ← serializable state
│   │
│   ├── hooks/
│   │   ├── usePaneManager.ts          ← pane add/remove/resize state
│   │   ├── useChartSync.ts            ← crosshair + xDomain sync across panes
│   │   ├── useDataLoader.ts           ← infinite scroll + realtime
│   │   ├── useIndicator.ts            ← compute indicator values
│   │   └── useDrawingTool.ts          ← drawing state machine
│   │
│   ├── adapters/
│   │   ├── StockDataAdapter.ts        ← interface
│   │   ├── DjangoAdapter.ts           ← implement cho Django backend
│   │   ├── MockAdapter.ts             ← cho testing / Storybook
│   │   └── BinanceAdapter.ts          ← crypto reference impl
│   │
│   └── types/
│       ├── OHLCVBar.ts
│       ├── PaneConfig.ts
│       ├── IndicatorDefinition.ts
│       ├── DrawingObject.ts
│       └── index.ts
│
├── index.ts                           ← public exports
└── demo/
    └── OriginalLikeDemo.tsx           ← demo hiện tại
```

---

## 9. So sánh: React-declarative (thư viện này) vs Imperative (KLineChart)

| Tiêu chí | Thư viện này (GoCharting-style) | KLineChart (imperative) |
|----------|--------------------------------|------------------------|
| **API chính** | JSX: `<ChartPane indicators={...} />` | JS method: `chart.createIndicator(...)` |
| **Thêm pane runtime** | `addPane(config)` → React re-render pane mới | `chart.createIndicator(name, false, {paneId})` |
| **Xóa pane** | `removePane(id)` → React unmount | `chart.removeIndicator({paneId})` |
| **Dual Y-axis** | `<YAxisRight>` wrapper + `yAxis: 'right'` prop | Không có |
| **Resize pane** | `<PaneSplitter onResize>` + `resizePane()` | Không có |
| **React dependency** | Bắt buộc — đây là React library | Optional wrapper |
| **Indicator settings UI** | Auto-generate từ `paramSchema` | Tự build |
| **Theme** | CSS variables + Tailwind | JS styles object |
| **Testing** | React Testing Library + Vitest | Vitest |

### Tại sao chọn React-declarative?

1. **Django + React project** — React đã là phần của stack → không cần framework-agnostic core
2. **GoCharting UX** — Toolbar, sidebar, settings modal là React components → tight integration
3. **State management** — Pane layout, indicator params, drawing objects đều là React state → dễ persist, undo/redo
4. **TypeScript strict** — Prop types enforce đúng indicator + pane config tại compile time

---

## 10. Thứ tự implementation (cập nhật)

```
Phase 1: Foundation (2–3 tuần)
    tsup build config, strict TypeScript
    OHLCVBar, PaneConfig, IndicatorDefinition types
    ChartTerminal + ChartSyncContext
    ChartCanvas cơ bản (candlestick, zoom, scroll)

Phase 2: Pane System (2–3 tuần)
    usePaneManager hook
    PaneSplitter + drag-resize logic
    Layout engine (height redistribution)
    PaneToolbar (label, settings, close)

Phase 3: Dual Y-Axis (1–2 tuần)
    YAxisRight component
    computeScales với left + right
    VolumeSeries trên rightAxis

Phase 4: Indicator Registry (4–5 tuần)
    registerIndicator / IndicatorDefinition interface
    Built-in: EMA, BOLL, RSI, MACD, Supertrend, VWAP
    Built-in orderflow: CVD, VolumeProfile, Delta, Footprint

Phase 5: Drawing Tools (3–4 tuần)
    State machine: idle → drawing → selected → moving
    DrawingObject serializable → lưu DB
    Built-in: TrendLine, HLine, Fibonacci, Rectangle

Phase 6: Data Adapter (2 tuần)
    StockDataAdapter interface
    DjangoVnstockAdapter implementation
    useDataLoader hook (infinite scroll + realtime)

Phase 7: Indicator Settings UI (2 tuần)
    paramSchema → auto-generate settings modal
    Runtime update params → recompute → redraw
    Undo/redo cho indicator changes
```

---

## 11. Tính năng mượn từ KLineChart (chỉ ý tưởng, không copy code)

| Ý tưởng từ KLineChart | Implement theo GoCharting-style |
|-----------------------|--------------------------------|
| Pane tạo/xóa runtime | `usePaneManager()` React hook |
| `IndicatorTemplate.calc()` pure function | `IndicatorDefinition.compute()` |
| `DataLoader` forward/backward | `useDataLoader` hook với infinite scroll |
| `registerIndicator` global registry | Module-level `Map<string, IndicatorDefinition>` |
| Separator pane drag resize | `<PaneSplitter onResize>` React component |
