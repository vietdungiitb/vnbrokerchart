# Implementation Plan — VNInvest Integration (Slice INT)

**Version:** 1.0  
**Ngày:** 2026-05-08  
**Trạng thái:** READY — chờ xác nhận CORS pre-condition (P-01)  
**Phụ thuộc:** Slice E (DONE), Slice D (DONE). Không phụ thuộc widget hoặc indicator-platform.

---

## Nguyên tắc slice

- Mỗi slice có đầu ra dùng được và validation độc lập.
- Code theo thứ tự INT-1 → INT-2 → INT-3 → INT-4 vì mỗi slice phụ thuộc slice trước.
- INT-5 (Whale Panel) là **tuỳ chọn**, thực hiện sau khi INT-4 PASS hoàn toàn.
- Không sửa `src/lib/**`. Không sửa bất kỳ file nào ngoài danh sách đã liệt kê.

---

## Slice INT-1: Infrastructure — VNInvest Client + Adapter

**Mục tiêu:** Tạo lớp HTTP client và adapter chuyển đổi data. Không có UI.

**Files tạo mới:**

| File | Mô tả |
|---|---|
| `src/demo/dataSources/types.ts` | Interface `DataSource`, `RawOHLCVBar`, `SymbolResult` |
| `src/demo/vninvest/VNInvestClient.ts` | HTTP client có PAT Bearer auth, PAT storage helpers |
| `src/demo/vninvest/adapters.ts` | `chartPointsToRawOHLCV()` converter |
| `src/demo/vninvest/__tests__/VNInvestClient.test.ts` | Unit test: login mock, getChart mock, error cases |
| `src/demo/vninvest/__tests__/adapters.test.ts` | Unit test: null filtering, Date parse, volume fallback |

**Files sửa:** Không có.

**Chi tiết VNInvestClient:**

```ts
// src/demo/vninvest/VNInvestClient.ts
export class VNInvestClient {
  static readonly PAT_STORAGE_KEY = 'vni_pat';
  static readonly BASE_URL_PROD = 'https://vninvest.edusuccess.vn';

  private pat: string | null = null;
  private readonly baseUrl: string;

  constructor(baseUrl = VNInvestClient.BASE_URL_PROD) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.loadPATFromStorage();
  }

  setPAT(token: string): void {
    this.pat = token;
    localStorage.setItem(VNInvestClient.PAT_STORAGE_KEY, token);
  }

  clearPAT(): void {
    this.pat = null;
    localStorage.removeItem(VNInvestClient.PAT_STORAGE_KEY);
  }

  hasPAT(): boolean {
    return Boolean(this.pat);
  }

  loadPATFromStorage(): void {
    this.pat = localStorage.getItem(VNInvestClient.PAT_STORAGE_KEY) ?? null;
  }

  private get authHeaders(): HeadersInit {
    if (!this.pat) throw new Error('PAT token chưa được thiết lập');
    return { 'Authorization': `Bearer ${this.pat}`, 'Content-Type': 'application/json' };
  }

  async login(username: string, password: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => res.statusText);
      throw new Error(`Login failed (${res.status}): ${detail}`);
    }
    const data: { access: string } = await res.json();
    this.setPAT(data.access);
    return data.access;
  }

  async getChart(
    symbol: string,
    days: number,
    timeframe: VNInvestTimeframe
  ): Promise<VNInvestChartResponse> {
    const url = `${this.baseUrl}/api/stock-management/stocks/${encodeURIComponent(symbol)}/chart/`
      + `?days=${days}&timeframe=${timeframe}`;
    const res = await fetch(url, { headers: this.authHeaders });
    if (res.status === 401) { this.clearPAT(); throw new Error('PAT_EXPIRED'); }
    if (res.status === 404) throw new Error(`SYMBOL_NOT_FOUND:${symbol}`);
    if (!res.ok) throw new Error(`API_ERROR:${res.status}`);
    return res.json();
  }

  async listStocks(signal?: AbortSignal): Promise<VNInvestStockProfile[]> {
    const res = await fetch(`${this.baseUrl}/api/stock-management/stocks/`, {
      headers: this.authHeaders,
      signal,
    });
    if (!res.ok) throw new Error(`API_ERROR:${res.status}`);
    return res.json();
  }

  async getTicker(symbol: string): Promise<VNInvestTicker> {
    const res = await fetch(
      `${this.baseUrl}/api/realtime/ticker/${encodeURIComponent(symbol)}/`,
      { headers: this.authHeaders }
    );
    if (!res.ok) throw new Error(`API_ERROR:${res.status}`);
    return res.json();
  }

  async getWhaleFeed(symbol: string): Promise<VNInvestWhaleFeed> {
    const res = await fetch(
      `${this.baseUrl}/api/realtime/whale-feed/${encodeURIComponent(symbol)}/`,
      { headers: this.authHeaders }
    );
    if (!res.ok) throw new Error(`API_ERROR:${res.status}`);
    return res.json();
  }
}
```

**Chi tiết adapters.ts:**

```ts
// src/demo/vninvest/adapters.ts
export function chartPointsToRawOHLCV(
  points: VNInvestChartPoint[]
): RawOHLCVBar[] {
  return points
    .filter(p => p.close !== null)
    .map(p => ({
      date: new Date(p.date),
      open:   p.open   ?? p.close!,
      high:   p.high   ?? p.close!,
      low:    p.low    ?? p.close!,
      close:  p.close!,
      volume: p.volume ?? 0,
    }));
}
```

**Test cases bắt buộc:**

- `VNInvestClient.test.ts`:
  - mock fetch → login thành công → PAT lưu localStorage
  - mock fetch → login 401 → throw error
  - mock fetch → getChart 200 → trả đúng shape
  - mock fetch → getChart 401 → gọi clearPAT() + throw PAT_EXPIRED
  - mock fetch → getChart 404 → throw SYMBOL_NOT_FOUND
  - hasPAT() = false khi localStorage rỗng
  - hasPAT() = true sau setPAT()

- `adapters.test.ts`:
  - point với close=null bị lọc ra
  - point với open/high/low null → dùng close làm fallback
  - date parse từ "2026-05-08T00:00:00" → Date object đúng
  - volume null → 0
  - mảng rỗng → []

**Exit criteria INT-1:**
- `npm run type-check` PASS
- `npm test -- src/demo/vninvest` PASS
- VNInvestClient không import bất kỳ file `src/lib/**`

---

## Slice INT-2: DataSource abstraction + demoDataSource

**Mục tiêu:** Tạo abstraction layer để `LibraryShowcaseDemo` có thể swap source mà không cần biết chi tiết từng nguồn.

**Files tạo mới:**

| File | Mô tả |
|---|---|
| `src/demo/dataSources/demoDataSource.ts` | Wrap demoData.ts hiện tại → DataSource interface |
| `src/demo/dataSources/vninvestDataSource.ts` | Wrap VNInvestClient → DataSource interface |

**Files sửa:** Không có trong slice này.

**Chi tiết demoDataSource.ts:**

```ts
// src/demo/dataSources/demoDataSource.ts
import { getDemoData } from '../demoData';   // hàm đã có sẵn

export const demoDataSource: DataSource = {
  id: 'demo',
  labelKey: 'dataSource.demo',
  async getOHLCV(symbol, days, _timeframe) {
    const raw = await getDemoData(symbol);
    return raw.slice(-days);
  },
  async searchSymbols(_query) {
    return [
      { symbol: 'BTC', company_name: 'Bitcoin (Demo)', exchange: 'Binance' },
      { symbol: 'ETH', company_name: 'Ethereum (Demo)', exchange: 'Binance' },
    ];
  },
};
```

**Chi tiết vninvestDataSource.ts:**

```ts
// src/demo/dataSources/vninvestDataSource.ts
import { VNInvestClient } from '../vninvest/VNInvestClient';
import { chartPointsToRawOHLCV } from '../vninvest/adapters';

export const vniClient = new VNInvestClient();

export const vninvestDataSource: DataSource = {
  id: 'vninvest',
  labelKey: 'dataSource.vninvest',
  async getOHLCV(symbol, days, timeframe) {
    const res = await vniClient.getChart(symbol, days, timeframe as VNInvestTimeframe);
    return chartPointsToRawOHLCV(res.points);
  },
  async searchSymbols(query) {
    const all = await vniClient.listStocks();
    const q = query.toUpperCase();
    return all
      .filter(s => s.symbol.includes(q) || s.company_name.toUpperCase().includes(q))
      .slice(0, 20)
      .map(s => ({ symbol: s.symbol, company_name: s.company_name, exchange: s.exchange }));
  },
};
```

**Exit criteria INT-2:**
- `npm run type-check` PASS
- `demoDataSource` và `vninvestDataSource` đều implement đầy đủ `DataSource` interface

---

## Slice INT-3: i18n keys + UI components

**Mục tiêu:** Thêm i18n keys và tạo 3 components UI. Chưa wire vào shell.

**Files sửa:**

| File | Thay đổi |
|---|---|
| `src/demo/i18n.tsx` | Thêm 34 keys `dataSource.*` và `vninvest.*` vào cả dict `vi` và `en` |

**Files tạo mới:**

| File | Mô tả |
|---|---|
| `src/demo/components/PATTokenModal.tsx` | Modal 2 tab: "Dán token" và "Đăng nhập". Dùng modal pattern của PaneSettingsModal. |
| `src/demo/components/VNSymbolSearch.tsx` | Dropdown autocomplete với debounce 300ms |
| `src/demo/components/DataSourceSwitcher.tsx` | Toggle Binance Demo ↔ VNInvest. Khi chọn VNInvest render SymbolSearch + timeframe + days selector. |

**Chi tiết PATTokenModal:**
- Tab "Dán token": textarea nhập PAT, nút Lưu, nút Xóa
- Tab "Đăng nhập": input username + password, nút "Đăng nhập để lấy token"
- Sau khi lưu/đăng nhập thành công: đóng modal, dispatch `onPATSaved(token)`
- Error state hiển thị inline (không dùng alert)
- i18n: toàn bộ text qua `useDemoI18n()`

**Chi tiết VNSymbolSearch:**
- Props: `{ onSelect(symbol: string): void, initialValue?: string }`
- Khi user gõ: debounce 300ms → `dataSource.searchSymbols(query)` → render dropdown
- Hiển thị: `{symbol} — {company_name} ({exchange})`
- Keyboard: ArrowUp/Down để navigate, Enter để chọn, Esc để đóng

**Chi tiết DataSourceSwitcher:**
- Props: `{ activeSource: DataSourceId, onSourceChange(id: DataSourceId): void, ... }`
- Khi source = `'vninvest'` và chưa có PAT: show badge "Chưa kết nối" + icon 🔑
- Bấm 🔑 → `onOpenPATModal()`

**Exit criteria INT-3:**
- `npm run type-check` PASS
- `npm test -- src/demo` PASS (i18n tests không fail vì key mới)
- 3 component file tồn tại, type-check clean

---

## Slice INT-4: Wire vào LibraryShowcaseDemo

**Mục tiêu:** Kết nối toàn bộ INT-1..3 vào shell chính. Biểu đồ VN data có thể hiển thị.

**Files sửa:**

| File | Thay đổi |
|---|---|
| `src/demo/LibraryShowcaseDemo.tsx` | Thêm DataSourceSwitcher vào top bar; state `activeSource`, `selectedSymbol`, `selectedTimeframe`, `selectedDays`; khi user bấm "Tải biểu đồ" → gọi `dataSource.getOHLCV()` → `enrichData()` → setState chart data |
| `src/demo/LibraryShowcaseDemo.tsx` | Mount PATTokenModal khi `patModalOpen === true` |

**State mới trong LibraryShowcaseDemo:**

```ts
const [activeSource, setActiveSource] = useState<DataSourceId>('demo');
const [vniSymbol, setVniSymbol] = useState<string>(
  localStorage.getItem('vni_last_symbol') ?? 'VCB'
);
const [vniTimeframe, setVniTimeframe] = useState<string>(
  localStorage.getItem('vni_last_timeframe') ?? '1D'
);
const [vniDays, setVniDays] = useState<number>(
  parseInt(localStorage.getItem('vni_last_days') ?? '90', 10)
);
const [patModalOpen, setPatModalOpen] = useState(false);
const [vniLoading, setVniLoading] = useState(false);
const [vniError, setVniError] = useState<string | null>(null);
```

**Load chart handler:**

```ts
const handleLoadVNIChart = useCallback(async () => {
  setVniLoading(true);
  setVniError(null);
  try {
    const raw = await vninvestDataSource.getOHLCV(vniSymbol, vniDays, vniTimeframe);
    if (raw.length === 0) {
      setVniError(t('vninvest.noData'));
      return;
    }
    const enriched = enrichData(raw, { series: activePanes.flatMap(p => p.series) });
    setDemoData(enriched);           // reuse existing setState cho chart data
    localStorage.setItem('vni_last_symbol', vniSymbol);
    localStorage.setItem('vni_last_timeframe', vniTimeframe);
    localStorage.setItem('vni_last_days', String(vniDays));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === 'PAT_EXPIRED') setPatModalOpen(true);
    setVniError(t('vninvest.status.error'));
  } finally {
    setVniLoading(false);
  }
}, [vniSymbol, vniDays, vniTimeframe, activePanes]);
```

**Exit criteria INT-4:**
- `npm run type-check` PASS
- `npm test` PASS (tất cả 238+ tests)
- `npm run build:docs` PASS
- Browser smoke: chọn VNInvest → nhập PAT → search "VCB" → bấm Tải → chart hiển thị với candles VN
- `python scripts/generate_module_tree.py` → `module_tree_full.md` updated

---

## Slice INT-5 (Tuỳ chọn): Whale Money Flow Panel

**Điều kiện:** INT-4 đã PASS đầy đủ.

**Mục tiêu:** Hiển thị summary whale (buy/sell/shark/whale) dưới chart khi ở VNInvest mode.

**Files tạo mới:**

| File | Mô tả |
|---|---|
| `src/demo/components/WhalePanel.tsx` | Panel: 2 bar mua (xanh) / bán (đỏ) + số liệu shark/whale/small |

**Files sửa:**

| File | Thay đổi |
|---|---|
| `src/demo/LibraryShowcaseDemo.tsx` | Thêm `whaleData` state, gọi `vniClient.getWhaleFeed(vniSymbol)` sau khi load chart, render `WhalePanel` phía dưới chart canvas |
| `src/demo/i18n.tsx` | Các key `vninvest.whale.*` đã thêm sẵn ở INT-3 |

**WhalePanel không sửa core library** — đây là component demo-level thuần túy.

**Polling:** Nếu `market_phase` từ ticker là `continuous`, auto-refresh whale data mỗi 30s. Dừng khi user rời khỏi VNInvest mode hoặc unmount.

**Exit criteria INT-5:**
- Whale panel hiển thị đúng khi có data
- Panel ẩn / hiển thị "Chưa có dữ liệu whale" khi `whale_orders: []`
- Không crash khi `summary.total_value = 0`
- `npm run type-check` PASS, `npm test` PASS

---

## Dependency chain

```
INT-1 (client + adapter)
  └─▶ INT-2 (datasource abstraction)
        └─▶ INT-3 (i18n + UI components)
              └─▶ INT-4 (wire vào shell) ← Điểm release
                    └─▶ INT-5 (whale panel) [optional]
```

---

## Ước tính effort

| Slice | Dev effort | Ghi chú |
|---|---|---|
| INT-1 | 1.5 ngày | Nhiều unit test |
| INT-2 | 0.5 ngày | Nhỏ |
| INT-3 | 2 ngày | 3 component UI + i18n |
| INT-4 | 1.5 ngày | Nhiều state + error handling |
| INT-5 | 1.5 ngày | Tuỳ chọn |
| **Tổng bắt buộc** | **5.5 ngày** | |
| **Tổng có whale** | **7 ngày** | |
