# CE20 Sprint Brief — Data Adapter Abstraction

> **Sprint:** CE20  
> **Prerequisite:** CE14 DONE (có thể song song với CE19)  
> **Estimated:** 4–5 ngày

---

## Mục tiêu sprint

Tách biệt logic fetch data ra khỏi `LibraryShowcaseDemo.tsx` vào một DataAdapter abstraction layer. Mục tiêu:
1. `LibraryShowcaseDemo` không còn biết Binance URL hay fetch logic.
2. Có thể swap adapter (Binance → VN stocks API → offline CSV) mà không thay đổi chart component.
3. Chuẩn bị cho việc tích hợp VN stocks data sau.

---

## CE20-01 — `DataAdapter` interface

### Vị trí
Tạo file mới: `src/lib/adapters/DataAdapter.ts`

```typescript
// src/lib/adapters/DataAdapter.ts

export interface KLineBar {
  timestamp: number;    // milliseconds UTC
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type GetBarsType = "init" | "forward" | "backward";

export interface GetBarsParams {
  type: GetBarsType;
  symbol: string;
  interval: string;       // e.g. "1m", "5m", "1h", "1d"
  timestamp: number | null;  // null = get latest bars
  limit: number;
}

export interface GetBarsResult {
  bars: KLineBar[];
  hasMore: boolean;      // false nếu đã hết data về phía backward
}

export interface DataAdapter {
  /** Fetch bars */
  getBars(params: GetBarsParams): Promise<GetBarsResult>;
  
  /** Subscribe to realtime bar updates (optional) */
  subscribeBar?(params: {
    symbol: string;
    interval: string;
    callback: (bar: KLineBar) => void;
  }): () => void;  // returns unsubscribe function
  
  /** Human-readable name for debug/logging */
  readonly name: string;
}
```

**Không thêm bất kỳ implementation vào file này.**

---

## CE20-02 — `BinanceAdapter`

### Vị trí
Tạo file mới: `src/lib/adapters/BinanceAdapter.ts`

### Đọc trước để hiểu logic hiện tại
```
read_file src/demo/demoData.ts (full)
```

### Implementation (wrap logic hiện tại)
```typescript
// src/lib/adapters/BinanceAdapter.ts
import type { DataAdapter, GetBarsParams, GetBarsResult, KLineBar } from "./DataAdapter";

const BINANCE_BASE = "https://api.binance.com/api/v3";
const BINANCE_INTERVALS: Record<string, string> = {
  "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
  "1h": "1h", "4h": "4h", "1d": "1d",
};

export class BinanceAdapter implements DataAdapter {
  readonly name = "Binance";
  
  async getBars(params: GetBarsParams): Promise<GetBarsResult> {
    const interval = BINANCE_INTERVALS[params.interval] ?? "1h";
    const endTime = params.timestamp ?? Date.now();
    
    // Wrap logic từ fetchHistoricalDemoBars trong demoData.ts
    const url = new URL(`${BINANCE_BASE}/klines`);
    url.searchParams.set("symbol", params.symbol.toUpperCase());
    url.searchParams.set("interval", interval);
    url.searchParams.set("endTime", String(endTime));
    url.searchParams.set("limit", String(params.limit));
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }
    
    const raw: unknown[][] = await response.json();
    const bars: KLineBar[] = raw.map((row) => ({
      timestamp: Number(row[0]),
      open: parseFloat(row[1] as string),
      high: parseFloat(row[2] as string),
      low: parseFloat(row[3] as string),
      close: parseFloat(row[4] as string),
      volume: parseFloat(row[5] as string),
    }));
    
    return { bars, hasMore: bars.length === params.limit };
  }
}

/** Singleton instance */
export const binanceAdapter = new BinanceAdapter();
```

---

## CE20-03 — `LocalCacheAdapter`

### Vị trí
Tạo file mới: `src/lib/adapters/LocalCacheAdapter.ts`

### Mục đích
Dùng offline CSV data từ `docs/data/` cho khi không có internet hoặc cho testing.

### Implementation
```typescript
// src/lib/adapters/LocalCacheAdapter.ts
import type { DataAdapter, GetBarsParams, GetBarsResult, KLineBar } from "./DataAdapter";

export class LocalCacheAdapter implements DataAdapter {
  readonly name = "LocalCache";
  
  private _bars: Map<string, KLineBar[]> = new Map();
  
  /** Load pre-parsed bars vào cache */
  loadBars(symbol: string, interval: string, bars: KLineBar[]): void {
    this._bars.set(`${symbol}:${interval}`, bars);
  }
  
  async getBars(params: GetBarsParams): Promise<GetBarsResult> {
    const key = `${params.symbol}:${params.interval}`;
    const allBars = this._bars.get(key) ?? [];
    
    let slice: KLineBar[];
    if (params.timestamp === null) {
      slice = allBars.slice(-params.limit);
    } else {
      const endIdx = allBars.findIndex((b) => b.timestamp > params.timestamp!);
      const end = endIdx === -1 ? allBars.length : endIdx;
      slice = allBars.slice(Math.max(0, end - params.limit), end);
    }
    
    return {
      bars: slice,
      hasMore: slice.length > 0 && slice[0].timestamp > allBars[0].timestamp,
    };
  }
}
```

### Tích hợp với offline demo data
Trong `demoData.ts` hoặc demo init code, load CSV data vào `LocalCacheAdapter`:
```typescript
import { LocalCacheAdapter } from "../lib/adapters/LocalCacheAdapter";
import { getOfflineDemoBars } from "./demoData";

export const localCacheAdapter = new LocalCacheAdapter();
const offlineBars = getOfflineDemoBars();
localCacheAdapter.loadBars("BTCUSDT", "1h", offlineBars.map(toKLineBar));
```

---

## CE20-04 — `LibraryShowcaseDemo` dùng adapter

### Đọc trước
```
read_file src/demo/LibraryShowcaseDemo.tsx lines 1–100   # imports + props
read_file src/demo/LibraryShowcaseDemo.tsx lines 570–620  # requestOlderHistoryPage
```

### Thay đổi props
```typescript
interface LibraryShowcaseDemoProps {
  adapter?: DataAdapter;  // optional — fallback về binanceAdapter
  // ... existing props ...
}
```

### Thay đổi data fetching
```typescript
// Thay:
const data = await fetchHistoricalDemoBars(symbol, interval, timestamp);

// Bằng:
const effectiveAdapter = props.adapter ?? binanceAdapter;
const result = await effectiveAdapter.getBars({
  type: "backward",
  symbol,
  interval,
  timestamp,
  limit: 300,
});
const data = result.bars.map(toOHLCVBar);  // convert KLineBar → OHLCVBar
```

### Helper conversion function
```typescript
// Trong LibraryShowcaseDemo.tsx hoặc utils file
function toOHLCVBar(bar: KLineBar): OHLCVBar {
  return {
    date: new Date(bar.timestamp),
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
    volume: bar.volume,
  };
}
```

**KHÔNG xóa `fetchHistoricalDemoBars` hay `getOfflineDemoBars` trong `demoData.ts` cho đến khi adapter hoàn toàn ổn định (sau CE20 release được dùng trên prod).**

---

## CE20-05 — `VNStocksAdapter` stub

### Vị trí
Tạo file mới: `src/lib/adapters/VNStocksAdapter.ts`

### Mục đích
Placeholder cho tương lai — chưa có implementation thực.

```typescript
// src/lib/adapters/VNStocksAdapter.ts
import type { DataAdapter, GetBarsParams, GetBarsResult } from "./DataAdapter";

/**
 * VNStocksAdapter — placeholder cho VN stocks data integration.
 * TODO: Implement với actual VN stocks API endpoint.
 */
export class VNStocksAdapter implements DataAdapter {
  readonly name = "VNStocks";
  
  async getBars(_params: GetBarsParams): Promise<GetBarsResult> {
    throw new Error("VNStocksAdapter: not implemented yet");
  }
}
```

### Ghi chú cho team
File này là template — khi team tích hợp VN stocks:
1. Thay throw bằng actual API call.
2. Map response format → `KLineBar`.
3. Handle authentication nếu cần.
4. Implement `subscribeBar` cho realtime.

---

## CE20-06 — Adapter selection UI (dev mode)

### Vị trí
`src/demo/PaneSettingsModal.tsx` hoặc sidebar settings.

### Implementation (chỉ show trong dev mode)
```tsx
{import.meta.env.DEV && (
  <div className="settings-section">
    <label>{t("settings.dataAdapter")}</label>
    <select
      value={currentAdapter}
      onChange={(e) => setCurrentAdapter(e.target.value)}
    >
      <option value="binance">Binance</option>
      <option value="local">Local Cache (offline)</option>
    </select>
  </div>
)}
```

### i18n keys
```typescript
"settings.dataAdapter": "Nguồn dữ liệu" / "Data Source",
```

---

## CE20-07 — Tests

### BinanceAdapter tests (mock fetch)
```typescript
describe("BinanceAdapter", () => {
  it("fetches bars and maps to KLineBar format", async () => {
    const mockResponse = [[1700000000000, "50000", "51000", "49000", "50500", "100"]];
    vi.stubGlobal("fetch", () =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockResponse) })
    );
    
    const adapter = new BinanceAdapter();
    const result = await adapter.getBars({
      type: "backward",
      symbol: "BTCUSDT",
      interval: "1h",
      timestamp: null,
      limit: 1,
    });
    
    expect(result.bars).toHaveLength(1);
    expect(result.bars[0].open).toBe(50000);
  });
});
```

### LocalCacheAdapter tests
```typescript
describe("LocalCacheAdapter", () => {
  it("returns slice of loaded bars", async () => {
    const adapter = new LocalCacheAdapter();
    const bars = Array.from({ length: 100 }, (_, i) => ({
      timestamp: i * 3600000,
      open: 100, high: 110, low: 90, close: 105, volume: 1000,
    }));
    adapter.loadBars("TEST", "1h", bars);
    
    const result = await adapter.getBars({
      type: "backward",
      symbol: "TEST",
      interval: "1h",
      timestamp: null,
      limit: 10,
    });
    
    expect(result.bars).toHaveLength(10);
  });
});
```

---

## CE20-08 — Final audit

### Gate commands
```powershell
npm run type-check
npm test
npm run build:docs
python scripts/generate_module_tree.py
```

### Commit
```bash
git commit -m "feat(CE20): DataAdapter abstraction layer

- DataAdapter interface (getBars, subscribeBar)
- BinanceAdapter wraps existing fetch logic
- LocalCacheAdapter for offline/testing
- VNStocksAdapter stub for future VN stocks integration
- LibraryShowcaseDemo uses adapter (fallback to Binance)
- Dev mode adapter selection UI
- Tests for BinanceAdapter (mock) + LocalCacheAdapter

Gates: type-check OK | tests PASS | build OK"

git push origin dev
```

---

## Lưu ý bảo mật (OWASP)

`BinanceAdapter.getBars` dùng `fetch` với URL được build từ params. Đảm bảo:
1. `symbol` chỉ chứa alphanumeric (validate trước khi URL-encode).
2. `interval` được validate qua allowlist `BINANCE_INTERVALS` (đã làm trong skeleton).
3. Không log URL có thể chứa sensitive params.

```typescript
// Validate symbol trước khi fetch
if (!/^[A-Z0-9]{2,20}$/.test(params.symbol.toUpperCase())) {
  throw new Error("Invalid symbol format");
}
```
