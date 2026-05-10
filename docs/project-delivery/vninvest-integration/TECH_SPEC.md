# Technical Specification — VNInvest Integration (INT)

**Version:** 1.0  
**Ngày:** 2026-05-08  
**Tác giả:** GitHub Copilot (session audit)  
**Server sản xuất:** `https://vninvest.edusuccess.vn`  
**Backend codebase:** `C:\Mujoco Projects\vninvest`  

---

## 1. Mục tiêu

Tích hợp nguồn dữ liệu VNInvest SAAS vào VNStockChart demo shell. Người dùng có thể chuyển đổi giữa nguồn demo (Binance/static) và nguồn VNInvest bằng PAT token cá nhân. Biểu đồ, indicator, và whale panel hiển thị dữ liệu thị trường Việt Nam thời gian thực.

---

## 2. Pre-conditions (phải đảm bảo trước khi code)

| # | Điều kiện | Cách kiểm tra |
|---|---|---|
| P-01 | CORS: `vninvest.edusuccess.vn` cho phép `localhost:3000` (dev) và domain demo production | `OPTIONS https://vninvest.edusuccess.vn/api/auth/token/` → 200 với header `Access-Control-Allow-Origin` |
| P-02 | PAT token tạo qua `POST /api/auth/token/` có quyền `stock-management` + `realtime` | Gọi `GET /api/stock-management/stocks/VCB/chart/?days=5` với token → 200 |
| P-03 | Không có rate-limit ngặt phía server cho chart + ticker cho demo cá nhân | Gọi 5 lần/s → không bị 429 |

> **Nếu P-01 chưa sẵn sàng**, cần team vninvest thêm origin vào `CORS_ALLOWED_ORIGINS` trong Django settings trước khi test browser.

---

## 3. API contract đã xác minh

Toàn bộ contract dưới đây đã được đọc trực tiếp từ `backend/portfolio/market_data_service.py` và `backend/portfolio/market_views.py`.

### 3.1 Authentication

```
POST /api/auth/token/
Content-Type: application/json
Body: { "username": "...", "password": "..." }

Response 200:
{
  "access": "<PAT_TOKEN>",
  "refresh": "<PAT_TOKEN>",
  "token_type": "PAT"
}
```

Tất cả API call sau đó dùng header:
```
Authorization: Bearer <PAT_TOKEN>
```

PAT là **long-lived** — không cần refresh định kỳ. Lưu vào `localStorage['vni_pat']`.

### 3.2 Chart OHLCV (primary feed)

```
GET /api/stock-management/stocks/{symbol}/chart/
Authorization: Bearer <PAT>
Query params:
  days      : int, [1..3650], default 180
  timeframe : '1m' | '5m' | '15m' | '1H' | '1D', default '1H'

Response 200:
{
  "symbol": "VCB",
  "days": 90,
  "timeframe": "1D",
  "interval": "1D",
  "start_date": "2026-02-07",
  "end_date": "2026-05-08",
  "points": [
    {
      "date": "2026-02-10T00:00:00",
      "open": 83500.0,
      "high": 84200.0,
      "low": 83100.0,
      "close": 83800.0,
      "volume": 1234567.0
    }
    // ...
  ],
  "technical": {
    "change_percent": 1.2,
    "rsi_14": 55.3,
    "macd": 123.4,
    "macd_signal": 100.2,
    "atr_14": 1200.0,
    "volatility_20": 0.015,
    "volume_ratio": 1.3
  }
}
```

**Ghi chú quan trọng:**
- `points[i].open/high/low/close` là **VND** (ví dụ: `83500` = 83,500 đồng/cổ phiếu)
- Với intraday frame nếu provider không có data, `points` trả về `[]` (KHÔNG dùng daily candles làm fallback)
- Intraday lookback cap theo server: `1m` = 1 ngày, `5m` = 3 ngày, `15m` = 7 ngày, `1H` = 30 ngày

### 3.3 Stock list / search

```
GET /api/stock-management/stocks/
Authorization: Bearer <PAT>
Query: (không có search param — trả toàn bộ)

Response 200: [
  {
    "symbol": "VCB",
    "company_name": "Ngân hàng Ngoại thương Việt Nam",
    "exchange": "HOSE",
    "industry": "Banking"
  }
  // ...
]
```

> Symbol search được thực hiện **client-side** bằng cách filter local list đã tải.

### 3.4 Realtime ticker

```
GET /api/realtime/ticker/{symbol}/
Authorization: Bearer <PAT>

Response 200:
{
  "symbol": "VCB",
  "current_price": 84000.0,
  "prev_price": 83500.0,
  "change_value": 500.0,
  "change_pct": 0.60,
  "open_price": 83700.0,
  "high_price": 84500.0,
  "low_price": 83400.0,
  "volume": 2345678,
  "last_date": "2026-05-08T09:45:00+07:00",
  "freshness_seconds": 8,
  "stale": false,
  "market_phase": "continuous",
  "market_code": "VN_STOCK"
}
```

### 3.5 Whale feed

```
GET /api/realtime/whale-feed/{symbol}/
Authorization: Bearer <PAT>

Response 200:
{
  "symbol": "VCB",
  "threshold": 2000000000,
  "threshold_source": "user_default",
  "source": "redis_stream",
  "weights_version": "v1",
  "whale_orders": [
    {
      "ts": "2026-05-08T09:43:12+07:00",
      "price": 84000.0,
      "volume": 30000,
      "matched_value": 2520000000.0,
      "side": "buy",
      "size_class": "whale",
      "event_score": 72.5,
      "display_score": 8,
      "threshold_source": "user_default"
    }
    // max 50 items, sorted by matched_value desc
  ],
  "summary": {
    "buy_value": 12500000000.0,
    "sell_value": 8300000000.0,
    "unknown_value": 1000000000.0,
    "total_value": 21800000000.0,
    "flow_net": 4200000000.0,
    "shark_value": 5000000000.0,
    "whale_value": 9000000000.0,
    "small_value": 7800000000.0,
    "buy_pct": 57.3,
    "sell_pct": 38.1,
    "unknown_pct": 4.6,
    "shark_pct": 22.9,
    "whale_pct": 41.3,
    "small_pct": 35.8
  },
  "source_event_at": "2026-05-08T09:43:12+07:00",
  "fetched_at": "2026-05-08T09:43:15+07:00"
}
```

---

## 4. Kiến trúc module mới

### 4.1 Cấu trúc thư mục

```
src/demo/
├── dataSources/
│   ├── types.ts                   [NEW] Interface DataSource, RawOHLCVBar, SymbolResult
│   ├── demoDataSource.ts          [NEW] Wrap demoData.ts hiện tại → DataSource
│   └── vninvestDataSource.ts      [NEW] Gọi VNInvestClient → DataSource
├── vninvest/
│   ├── VNInvestClient.ts          [NEW] Typed HTTP client với PAT Bearer auth
│   ├── adapters.ts                [NEW] VNInvestChartPoint[] → RawOHLCV[]
│   └── __tests__/
│       ├── VNInvestClient.test.ts [NEW] Unit test cho client
│       └── adapters.test.ts       [NEW] Unit test cho adapter
├── components/
│   ├── DataSourceSwitcher.tsx     [NEW] Toggle Binance Demo ↔ VNInvest
│   ├── PATTokenModal.tsx          [NEW] Modal nhập PAT token
│   └── VNSymbolSearch.tsx         [NEW] Autocomplete search mã CK
└── LibraryShowcaseDemo.tsx        [ADAPT] nhận dataSource, wire PATModal, SymbolSearch
```

### 4.2 Ranh giới kiến trúc

- `src/demo/vninvest/**` và `src/demo/dataSources/**` chỉ được import bởi `src/demo/**`.  
- `src/lib/**` KHÔNG được import bất kỳ file nào từ `src/demo/**` (hard rule đã có sẵn).  
- VNInvestClient KHÔNG được sử dụng trong `src/lib/**`.

### 4.3 Data flow

```
User chọn [VNInvest] + nhập symbol + bấm "Tải biểu đồ"
  │
  ▼
VNInvestClient.getChart(symbol, days, timeframe)
  → GET /api/stock-management/stocks/{symbol}/chart/?days=N&timeframe=T
  → Authorization: Bearer <PAT_from_localStorage>
  │
  ▼  Response: { points: [{date, open, high, low, close, volume}] }
  │
  ▼
adapters.chartPointsToRawOHLCV(points)
  → RawOHLCV[] = [{ date: Date, open, high, low, close, volume }]
  │
  ▼
enrichData(raw, { series: activePanes.flatMap(p => p.series) })
  → EnrichedDatum[]   (đường đi hiện có, KHÔNG thay đổi)
  │
  ▼
LibraryShowcaseDemo setState → DynamicChart render
```

---

## 5. TypeScript interface contracts

### 5.1 `src/demo/dataSources/types.ts`

```ts
export type DataSourceId = 'demo' | 'vninvest';

export interface RawOHLCVBar {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolResult {
  symbol: string;
  company_name: string;
  exchange: string;
}

export interface DataSource {
  id: DataSourceId;
  labelKey: string; // i18n key
  getOHLCV(
    symbol: string,
    days: number,
    timeframe: string
  ): Promise<RawOHLCVBar[]>;
  searchSymbols(query: string): Promise<SymbolResult[]>;
}
```

### 5.2 `src/demo/vninvest/VNInvestClient.ts` (public interface)

```ts
export type VNInvestTimeframe = '1m' | '5m' | '15m' | '1H' | '1D';

export interface VNInvestChartPoint {
  date: string;          // ISO 8601, e.g. "2026-05-08T00:00:00"
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

export interface VNInvestChartResponse {
  symbol: string;
  days: number;
  timeframe: VNInvestTimeframe;
  interval: string;
  start_date: string;
  end_date: string;
  points: VNInvestChartPoint[];
  technical: {
    change_percent: number | null;
    rsi_14: number | null;
    macd: number | null;
    macd_signal: number | null;
    atr_14: number | null;
    volatility_20: number | null;
    volume_ratio: number | null;
  };
}

export interface VNInvestStockProfile {
  symbol: string;
  company_name: string;
  exchange: string;
  industry?: string;
}

export interface VNInvestTicker {
  symbol: string;
  current_price: number | null;
  prev_price: number | null;
  change_value: number | null;
  change_pct: number | null;
  open_price: number | null;
  high_price: number | null;
  low_price: number | null;
  volume: number | null;
  last_date: string | null;
  freshness_seconds: number | null;
  stale: boolean;
  market_phase: string;
  market_code: string;
}

export interface VNInvestWhaleSummary {
  buy_value: number;
  sell_value: number;
  total_value: number;
  flow_net: number;
  shark_value: number;
  whale_value: number;
  small_value: number;
  buy_pct: number;
  sell_pct: number;
  shark_pct: number;
  whale_pct: number;
  small_pct: number;
}

export interface VNInvestWhaleOrder {
  ts: string;
  price: number;
  volume: number;
  matched_value: number;
  side: 'buy' | 'sell' | 'neutral';
  size_class: 'whale' | 'shark' | 'small';
  event_score: number;
  display_score: number;
}

export interface VNInvestWhaleFeed {
  symbol: string;
  threshold: number;
  threshold_source: string;
  source: string;
  whale_orders: VNInvestWhaleOrder[];
  summary: VNInvestWhaleSummary;
  source_event_at: string | null;
  fetched_at: string;
}

export class VNInvestClient {
  static readonly PAT_STORAGE_KEY = 'vni_pat';
  static readonly BASE_URL_PROD = 'https://vninvest.edusuccess.vn';

  constructor(baseUrl?: string);

  // --- PAT management ---
  setPAT(token: string): void;
  clearPAT(): void;
  hasPAT(): boolean;
  loadPATFromStorage(): void;     // reads localStorage['vni_pat']

  // --- Auth ---
  async login(username: string, password: string): Promise<string>; // returns PAT

  // --- Data ---
  async getChart(
    symbol: string,
    days: number,
    timeframe: VNInvestTimeframe
  ): Promise<VNInvestChartResponse>;

  async listStocks(signal?: AbortSignal): Promise<VNInvestStockProfile[]>;

  async getTicker(symbol: string): Promise<VNInvestTicker>;

  async getWhaleFeed(symbol: string): Promise<VNInvestWhaleFeed>;
}
```

### 5.3 `src/demo/vninvest/adapters.ts` (public interface)

```ts
import type { RawOHLCVBar } from '../dataSources/types';
import type { VNInvestChartPoint } from './VNInvestClient';

/**
 * Convert VNInvest chart points → RawOHLCVBar[] cho enrichData pipeline.
 * Giá đã ở đơn vị VND — không cần convert.
 * Points có close=null bị lọc bỏ.
 */
export function chartPointsToRawOHLCV(
  points: VNInvestChartPoint[]
): RawOHLCVBar[];
```

### 5.4 Adapter logic chi tiết

```ts
function chartPointsToRawOHLCV(points: VNInvestChartPoint[]): RawOHLCVBar[] {
  return points
    .filter(p => p.close !== null)
    .map(p => ({
      date: new Date(p.date),
      open: p.open ?? p.close!,
      high: p.high ?? p.close!,
      low: p.low ?? p.close!,
      close: p.close!,
      volume: p.volume ?? 0,
    }));
}
```

---

## 6. i18n keys bắt buộc

File: `src/demo/i18n.tsx` — thêm vào cả dict `vi` và `en`.

| Key | vi | en |
|---|---|---|
| `dataSource.demo` | `Binance Demo` | `Binance Demo` |
| `dataSource.vninvest` | `VNInvest` | `VNInvest` |
| `vninvest.patModal.title` | `Kết nối VNInvest` | `Connect to VNInvest` |
| `vninvest.patModal.tokenLabel` | `PAT Token` | `PAT Token` |
| `vninvest.patModal.tokenPlaceholder` | `Dán token từ vninvest.edusuccess.vn/settings/api` | `Paste token from vninvest.edusuccess.vn/settings/api` |
| `vninvest.patModal.usernameLabel` | `Tên đăng nhập` | `Username` |
| `vninvest.patModal.passwordLabel` | `Mật khẩu` | `Password` |
| `vninvest.patModal.loginBtn` | `Đăng nhập để lấy token` | `Login to get token` |
| `vninvest.patModal.saveBtn` | `Lưu token` | `Save token` |
| `vninvest.patModal.clearBtn` | `Xóa token` | `Clear token` |
| `vninvest.patModal.loginSuccess` | `Đã lấy và lưu token thành công` | `Token retrieved and saved` |
| `vninvest.patModal.loginError` | `Đăng nhập thất bại. Kiểm tra lại thông tin.` | `Login failed. Check your credentials.` |
| `vninvest.symbolSearch.placeholder` | `Tìm mã CK (VCB, HPG, VIC...)` | `Search symbol (VCB, HPG, VIC...)` |
| `vninvest.status.noToken` | `Chưa có token — bấm 🔑 để kết nối` | `No token — click 🔑 to connect` |
| `vninvest.status.connecting` | `Đang kết nối...` | `Connecting...` |
| `vninvest.status.connected` | `Đã kết nối VNInvest` | `Connected to VNInvest` |
| `vninvest.status.error` | `Lỗi kết nối VNInvest` | `VNInvest connection error` |
| `vninvest.load` | `Tải biểu đồ` | `Load chart` |
| `vninvest.timeframe.1m` | `1 phút` | `1 min` |
| `vninvest.timeframe.5m` | `5 phút` | `5 min` |
| `vninvest.timeframe.15m` | `15 phút` | `15 min` |
| `vninvest.timeframe.1H` | `1 giờ` | `1 hour` |
| `vninvest.timeframe.1D` | `1 ngày` | `1 day` |
| `vninvest.days.label` | `Lịch sử` | `History` |
| `vninvest.days.30` | `30 ngày` | `30 days` |
| `vninvest.days.90` | `90 ngày` | `90 days` |
| `vninvest.days.180` | `180 ngày` | `180 days` |
| `vninvest.days.365` | `1 năm` | `1 year` |
| `vninvest.noData` | `Không có dữ liệu` | `No data` |
| `vninvest.fallback` | `Dữ liệu fallback (provider lỗi)` | `Fallback data (provider error)` |
| `vninvest.stale` | `Dữ liệu có thể chưa cập nhật` | `Data may be stale` |
| `vninvest.whale.title` | `Dòng tiền cá mập` | `Whale Money Flow` |
| `vninvest.whale.buy` | `Mua ròng` | `Net Buy` |
| `vninvest.whale.sell` | `Bán ròng` | `Net Sell` |
| `vninvest.whale.noData` | `Chưa có dữ liệu whale` | `No whale data yet` |

---

## 7. Storage contract

| Key localStorage | Loại | Nội dung | Lifetime |
|---|---|---|---|
| `vni_pat` | string | PAT token | Xóa khi user bấm "Xóa token" hoặc logout |
| `vni_last_symbol` | string | Mã CK gần nhất (ví dụ: `"VCB"`) | Persist qua sessions |
| `vni_last_timeframe` | string | Timeframe gần nhất (ví dụ: `"1D"`) | Persist qua sessions |
| `vni_last_days` | string | Số ngày gần nhất (ví dụ: `"90"`) | Persist qua sessions |

**Security note:** PAT chỉ gửi qua HTTPS header `Authorization: Bearer`. Không log PAT vào console. Không đặt PAT vào URL param.

---

## 8. UI layout

```
TopBar của LibraryShowcaseDemo (đề xuất bố cục):

[Binance Demo ▾] [🇻🇳 VNInvest ▾]   [🔑]   [vi | en]   [⚙]

Khi đang ở VNInvest mode, sau data source switcher:
[  Tìm mã CK... ▾  ]   [1D ▾]   [90 ngày ▾]   [Tải biểu đồ]

Khi chưa có PAT:
→ Bấm [🔑] → PATTokenModal mở
→ PAT modal có 2 tab: "Dán token" / "Đăng nhập"
```

`PATTokenModal` là modal (tương tự `PaneSettingsModal` đã có), mở theo z-index chuẩn của shell.  
`VNSymbolSearch` là dropdown autocomplete, debounce 300ms, filter local list.

---

## 9. Error handling contract

| Lỗi | Hành vi UI |
|---|---|
| Không có PAT | Hiển thị status `vninvest.status.noToken`, disable nút Tải biểu đồ |
| 401 Unauthorized | Xóa PAT khỏi localStorage, mở PATTokenModal, hiển thị "Token hết hạn" |
| 404 symbol không tồn tại | Toast/inline error: "Mã {symbol} không tồn tại trên VNInvest" |
| `points: []` (intraday empty) | Hiển thị `vninvest.noData`, KHÔNG fallback về demo data |
| Network timeout | Hiển thị `vninvest.status.error`, giữ nguyên chart cũ nếu có |
| CORS blocked | Console.error với hướng dẫn cụ thể; UI hiển thị "Lỗi kết nối" |

---

## 10. Phạm vi KHÔNG nằm trong INT

- Không thêm websocket / SSE realtime streaming (chỉ polling nếu cần).
- Không thêm authentication flow đầy đủ (chỉ PAT — không quản lý user session, JWT refresh).
- Không kết nối whale panel vào SeriesRegistry core (whale panel là component demo-level).
- Không thay đổi `src/lib/**` bất kỳ file nào.
- Không tạo thêm demo surface mới (không tách thành trang riêng).
