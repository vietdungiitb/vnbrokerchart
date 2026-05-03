# Phase 6 — Multi-Panel Layout

> **Thuộc:** [ROADMAP.md](./ROADMAP.md)  
> **Ước tính:** 2–3 tuần  
> **Mục tiêu:** Layout engine chia panel như TradingView, crosshair đồng bộ

---

## 6.1 API

```tsx
<ChartLayout
    panels={[
        {
            id: 'price',
            height: '60%',
            label: 'BTCUSD',
            children: (
                <ChartCanvas>
                    <CandlestickSeries />
                    <BollingerBandOverlay />
                    <VolumeProfileSeries />
                </ChartCanvas>
            ),
        },
        {
            id: 'volume',
            height: '15%',
            label: 'Volume',
            children: (
                <ChartCanvas>
                    <VolumeSeries />
                </ChartCanvas>
            ),
        },
        {
            id: 'rsi',
            height: '12.5%',
            label: 'RSI(14)',
            children: (
                <ChartCanvas>
                    <RSISeries period={14} />
                    <RSILevels levels={[30, 70]} />
                </ChartCanvas>
            ),
        },
        {
            id: 'cvd',
            height: '12.5%',
            label: 'CVD',
            children: (
                <ChartCanvas>
                    <CumulativeDeltaSeries />
                </ChartCanvas>
            ),
        },
    ]}
    syncCrosshair   // crosshair dọc đồng bộ tất cả panels
    syncZoom        // zoom đồng bộ tất cả panels
    resizable       // kéo divider để resize panel
/>
```

---

## 6.2 Context đồng bộ

```typescript
// ChartSyncContext — shared state giữa tất cả panels
interface ChartSyncContext {
    // Crosshair
    crosshairX: number | null;
    setCrosshairX: (x: number | null) => void;

    // Zoom/pan
    xDomain: [number, number];
    setXDomain: (domain: [number, number]) => void;

    // Data
    data: OHLCVBar[];
    visibleData: OHLCVBar[];
}

const ChartSyncProvider: React.FC<{
    children: React.ReactNode;
    data: OHLCVBar[];
}>;
```

Mỗi panel subscribe vào context, khi panel chính zoom thì tất cả panels khác cập nhật `xDomain` → hiển thị cùng khoảng thời gian.

---

## 6.3 Resizable Dividers

```tsx
// Kéo divider thay đổi chiều cao panels
<ResizableDivider
    onDrag={(deltaY) => {
        setPanelHeights(prev => adjustHeights(prev, panelIndex, deltaY));
    }}
/>
```

Min height mỗi panel: 60px để không bị collapse hoàn toàn.

---

## 6.4 Panel Toolbar

Mỗi panel có thanh toolbar nhỏ phía trên:
```
┌─ RSI(14) ──────────────────────── ⚙ ✕ ─┐
│                                          │
│  [RSI chart here]                        │
└──────────────────────────────────────────┘
```
- **⚙** → mở settings (thay đổi period, màu)
- **✕** → ẩn/xóa panel
- Drag label → sắp xếp lại thứ tự panels

---

## 6.5 Checklist hoàn thành Phase 6

- [ ] ChartSyncContext hoạt động đúng
- [ ] syncCrosshair: crosshair dọc hiện trên tất cả panels
- [ ] syncZoom: zoom 1 panel → tất cả panels sync
- [ ] ResizableDivider kéo được
- [ ] Panel min/max height constraints
- [ ] Panel toolbar (settings + close)
- [ ] Drag-to-reorder panels
- [ ] Storybook story với 4-panel layout

---

# Phase 7 — Data Adapter Layer

> **Thuộc:** [ROADMAP.md](./ROADMAP.md)  
> **Ước tính:** 2 tuần  
> **Mục tiêu:** Interface chuẩn tích hợp bất kỳ backend nào

---

## 7.1 StockDataAdapter Interface

```typescript
// src/lib/adapters/StockDataAdapter.ts

export type Unsubscribe = () => void;

export interface StockDataAdapter {
    // ── REST ──────────────────────────────────────────
    /** Lấy OHLCV bars theo timeframe và khoảng thời gian */
    fetchBars(
        symbol: string,
        timeframe: Timeframe,
        from: Date,
        to: Date
    ): Promise<OHLCVBar[]>;

    /** Infinite scroll ngược — tải thêm bars cũ hơn */
    fetchMoreBars(
        symbol: string,
        timeframe: Timeframe,
        before: Date,
        limit?: number
    ): Promise<OHLCVBar[]>;

    /** Tìm kiếm symbol */
    searchSymbols(query: string): Promise<SymbolInfo[]>;

    // ── WebSocket ─────────────────────────────────────
    /** Subscribe real-time bar updates */
    subscribeToBar(
        symbol: string,
        timeframe: Timeframe,
        onBar: (bar: OHLCVBar) => void
    ): Unsubscribe;

    /** Subscribe orderbook (L2) */
    subscribeToOrderbook(
        symbol: string,
        onUpdate: (snapshot: OrderbookSnapshot) => void
    ): Unsubscribe;

    /** Subscribe trade stream (cho T&S, Whale Alerts) */
    subscribeToTrades(
        symbol: string,
        onTrade: (trade: Trade) => void
    ): Unsubscribe;
}

export type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1D' | '1W' | '1M';

export interface SymbolInfo {
    symbol: string;
    name: string;
    exchange: string;
    type: 'stock' | 'crypto' | 'forex' | 'futures' | 'index';
    currency: string;
    pricePrecision: number;
    volumePrecision: number;
}
```

---

## 7.2 DjangoVnstockAdapter (ví dụ)

```typescript
// Người dùng tự implement trong project của họ:
import type { StockDataAdapter, OHLCVBar, Timeframe } from '@myorg/stock-charts';

export class DjangoVnstockAdapter implements StockDataAdapter {
    constructor(private baseUrl = '') {}

    async fetchBars(symbol, timeframe, from, to): Promise<OHLCVBar[]> {
        const params = new URLSearchParams({
            tf: timeframe,
            from: from.toISOString(),
            to: to.toISOString(),
        });
        const res = await fetch(`${this.baseUrl}/api/bars/${symbol}/?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json() as Array<{ date: string } & Omit<OHLCVBar, 'date'>>;
        return json.map(b => ({ ...b, date: new Date(b.date) }));
    }

    async fetchMoreBars(symbol, timeframe, before, limit = 300): Promise<OHLCVBar[]> {
        const params = new URLSearchParams({
            tf: timeframe,
            before: before.toISOString(),
            limit: String(limit),
        });
        const res = await fetch(`${this.baseUrl}/api/bars/${symbol}/?${params}`);
        const json = await res.json() as Array<{ date: string } & Omit<OHLCVBar, 'date'>>;
        return json.map(b => ({ ...b, date: new Date(b.date) }));
    }

    subscribeToBar(symbol, timeframe, onBar) {
        const ws = new WebSocket(`ws://${location.host}/ws/bars/${symbol}/${timeframe}/`);
        ws.onmessage = (e) => {
            const raw = JSON.parse(e.data as string) as { date: string } & Omit<OHLCVBar, 'date'>;
            onBar({ ...raw, date: new Date(raw.date) });
        };
        return () => ws.close();
    }

    subscribeToOrderbook(symbol, onUpdate) {
        const ws = new WebSocket(`ws://${location.host}/ws/orderbook/${symbol}/`);
        ws.onmessage = (e) => onUpdate(JSON.parse(e.data as string));
        return () => ws.close();
    }

    subscribeToTrades(symbol, onTrade) {
        const ws = new WebSocket(`ws://${location.host}/ws/trades/${symbol}/`);
        ws.onmessage = (e) => onTrade(JSON.parse(e.data as string));
        return () => ws.close();
    }

    async searchSymbols(query) {
        const res = await fetch(`${this.baseUrl}/api/symbols/search/?q=${encodeURIComponent(query)}`);
        return res.json();
    }
}

// Dùng:
const adapter = new DjangoVnstockAdapter();
<ChartCanvas adapter={adapter} symbol="VCB" timeframe="1D" />
```

---

## 7.3 Checklist hoàn thành Phase 7

- [ ] `StockDataAdapter` interface đầy đủ + exported
- [ ] `useChartData` hook dùng adapter (fetchBars + infinite scroll)
- [ ] `useRealtimeBar` hook (subscribeToBar)
- [ ] `useOrderbook` hook
- [ ] `useTrades` hook
- [ ] `createRestAdapter(baseUrl)` helper cho REST-only backends
- [ ] Mock adapter cho testing/Storybook
- [ ] README ví dụ DjangoVnstockAdapter đầy đủ
