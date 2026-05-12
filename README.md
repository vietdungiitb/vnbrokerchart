# VNStockChart

> **Nền tảng biểu đồ chứng khoán chuyên nghiệp cho thị trường Việt Nam**  
> Từ Runtime Demo đến TradingView-class Indicator Platform

[![Release](https://img.shields.io/github/v/release/vietdungiitb/vnstockcharts?include_prereleases=true&label=release)](https://github.com/vietdungiitb/vnstockcharts/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6)](https://www.typescriptlang.org)

---

## Giới thiệu

**VNStockChart** là thư viện biểu đồ kỹ thuật được xây dựng đặc biệt cho thị trường chứng khoán Việt Nam, với kiến trúc indicator platform 5 tầng hướng đến chuẩn TradingView. Dự án tích hợp trực tiếp với **VNInvest** (whale flow, CVD, dark money signals) và **VNStock** (dữ liệu nội địa VN), cung cấp những chỉ báo độc quyền mà không một platform quốc tế nào có được trên data VN thật.

Điểm khác biệt cốt lõi so với TradingView hay GoCharting:

- **Dữ liệu VN real-time native** — VNInvest signals tích hợp sẵn, không cần bridge thủ công
- **Whale flow trực tiếp trên chart** — Whale Buy/Sell Bubbles, CVD, Dark Flow hiển thị ngay trên price pane
- **Visual DAG Builder** (Giai đoạn 4) — tạo indicator từ indicator bằng giao diện kéo thả, không cần code
- **SSOT canonical store** — mọi indicator tính một lần, không double-compute, testable 100%

---

## Tác giả

**Phạm Việt Dũng**  
Email: [vietdung@edusuccess.vn](mailto:vietdung@edusuccess.vn)  
Website: [https://vninvest.edusuccess.vn](https://vninvest.edusuccess.vn)

---

## Công nghệ nền tảng

| Layer | Công nghệ | Lý do chọn |
|-------|-----------|-----------|
| UI Framework | **React 19** | Server Components, Actions, concurrent rendering — sẵn sàng cho real-time update không flicker |
| Language | **TypeScript strict** | Type-safe canonical keys, interface contract giữa catalog và renderer |
| Charting core | **D3 v7** + SVG/Canvas | Kiểm soát tuyệt đối pixel-level; hybrid SVG (axes) + Canvas (series) cho hiệu năng cao |
| Build tool | **Webpack 5** (demo) + **tsup** (lib) | Code splitting cho demo shell; ESM/CJS dual output cho library |
| Test | **Vitest** | Fast HMR-compatible, mocks timer cho BarReplayController, jsdom environment |
| Styling | **CSS Variables** (`--gc-*`) | Dark/light theme không re-render React tree; `html[data-chart-theme]` root switching |
| State | React hooks thuần (`useReducer`) | Không dependency ngoài — dễ embed, dễ test, không vendor lock-in |
| Replay engine | **BarReplayController** (domain class) | Tách hoàn toàn khỏi React — testable bằng fake timers, không cần mount component |

### Tại sao không dùng ECharts / Recharts / Chart.js cho core?

Các thư viện charting phổ thông đóng gói rendering pipeline — không thể inject whale bubble annotations vào đúng price bar theo bar index, không thể sync drawing layer với zoom/pan state. VNStockChart cần kiểm soát toàn bộ render loop để:

1. Overlay whale events chính xác theo timestamp trên canvas layer
2. Drawing tools tương tác trực tiếp với chart coordinate system
3. Bar replay cắt visible data slice mà không trigger ChartCanvas full reset
4. Volume Profile render trên cùng y-axis với price, không phải y-axis riêng

---

## Kiến trúc hiện tại

```
src/
├── lib/
│   ├── core/
│   │   ├── calculators/enrichData.ts        ← SSOT: tính indicator một lần
│   │   ├── calculators/seriesValueResolver.ts ← canonical key lookup
│   │   ├── hooks/useDynamicPanes.ts          ← pane orchestration + series visibility
│   │   ├── replay/BarReplayController.ts     ← domain replay engine
│   │   ├── registry/SeriesRegistry.ts        ← series render registry
│   │   └── DynamicChart.tsx                  ← chart slots builder
│   ├── drawing/                              ← 20+ drawing tools + interaction FSM
│   ├── indicators/                           ← indicator compute registry
│   └── types/                               ← shared TypeScript types
├── demo/
│   ├── LibraryShowcaseDemo.tsx              ← main demo shell (~1700 lines)
│   ├── demo.css                             ← gc-* layout + CSS variables theme
│   └── i18n.tsx                             ← VI/EN i18n
└── widget/
    └── VNStockChart.tsx                     ← embeddable widget surface
```

### Nguyên tắc kiến trúc bất biến

1. **Data flows down only** — tầng trên chỉ đọc từ tầng dưới, không tự tính lại
2. **Canonical key là identity** — cùng key = cùng dữ liệu, bất kể bao nhiêu consumer
3. **`src/lib/**` không import ngược từ `src/demo/**`** — lib là pure library
4. **Presentation không ảnh hưởng data** — màu sắc, visibility không tạo series key mới

---

## Lộ trình phát triển — 5 Giai đoạn

> Mỗi giai đoạn tạo ra lý do để người dùng nâng tier và ở lại lâu hơn.

```
GĐ 1 (Tuần 1–3)     GĐ 2 (Tuần 3–5)     GĐ 3 (Tuần 5–7)
Well-known           VN-exclusive         Saved Sets
Indicators           Indicators           & Templates
─────────────        ─────────────        ─────────────
EMA, RSI, MACD       Whale Bubbles        Lưu combo
Bollinger, ATR       CVD real-time        indicators
VWAP, Stochastic     Strength, SMFI       Apply 1-click
Volume Profile       Dark Flow            Share bộ chỉ số
MA20/MA50 VN         W2+W4 Matrix         Sync devices

[Tất cả user]        [Pro+]               [Pro+ / Enterprise]

GĐ 4 (Tuần 7–12)                  GĐ 5 (Tuần 12–20)
Custom Indicator Builder           Custom Data + Marketplace
────────────────────────           ─────────────────────────
EMA(RSI(14), 5)                    Upload CSV data riêng
MACD của Whale Flow                REST/WebSocket custom feed
Visual DAG editor                  Marketplace: mua/bán script
Backtest trực tiếp                 Revenue sharing 80/20
Alert khi crossover                Enterprise team library

[Pro+]                             [Enterprise + Marketplace]
```

### Chi tiết từng giai đoạn

#### Giai đoạn 1 — Well-known Indicators *(Tất cả user)*

Hoàn thiện catalog cho ~25 indicator chuẩn. Mục tiêu: không có lý do kỹ thuật nào để từ chối dùng thử.

- **Trend (overlay):** EMA(7/20/50/200), SMA, Hull MA, Bollinger Bands, Keltner Channel, Supertrend, Ichimoku, VWAP
- **Momentum (pane):** RSI, Stochastic, MACD, CCI, MFI, Williams %R
- **Volatility:** ATR, Historical Volatility, Bollinger Width
- **Volume:** Volume bars, OBV, Volume Profile, RVOL
- **VN bắt buộc:** MA20, MA50 (theo quy định UBCKNN)

**Gate:** Thêm 1 indicator mới vào registry → settings modal render đúng params tự động, không cần chỉnh modal.

#### Giai đoạn 2 — VN-exclusive Indicators *(Pro+ — PAT `signals:read`)*

Đây là **killer feature** — những chỉ báo không có ở bất kỳ platform quốc tế nào với data VN thật:

- **CVD (Cumulative Volume Delta)** từ VNInvest `/core/v1/signals/order-flow/`
- **Whale Net Flow + Buy/Sell Bubbles** từ `/api/realtime/whale-feed/`
- **Dark Flow Score** từ `session-facts.dark_flow_score`
- **Buy Strength + Institutional Strength** (0→1 normalized)
- **SMFI — Smart Money Flow Index** từ `/api/portfolio/dark-money-history/`
- **Whale Alert Markers** real-time qua WebSocket `whale_alert` events

**Gate:** Chart VCB với PAT → Whale bubbles xuất hiện real-time. Swap sang BTCUSDT → Binance CVD tự động.

#### Giai đoạn 3 — Saved Sets & Templates *(Pro+/Enterprise)*

Trader chuyên nghiệp có 5–10 "setup" khác nhau. Hiện phải cài lại từ đầu mỗi lần. GĐ 3 giải quyết điều đó.

- **Free:** 3 built-in templates (VN Swing, Orderflow Suite, Crypto Standard)
- **Pro+:** Lưu 10 sets, import/export `.vnsc-set`, apply 1-click
- **Enterprise:** Unlimited sets, cloud sync, team sharing, versioning, admin publish

#### Giai đoạn 4 — Custom Indicator Builder *(Pro+/Enterprise)*

Visual DAG builder — tạo indicator từ indicator mà không cần viết code:

```
Source → Indicator → Math → Transform → Signal → Alert
  ↓          ↓         ↓        ↓           ↓        ↓
Close      RSI(14)   × 0.5   Normalize   CrossOver  Webhook
Whale Flow EMA(20)   + ATR   Z-Score     > 0.7      Email
CVD        MACD      Abs     Percent     Between    Annotation
```

Ví dụ thực tế: `EMA(RSI(14), 5)` — làm mượt RSI bằng EMA, giảm false signal. Toàn bộ không cần một dòng code.

**Đây là barrier to exit mạnh nhất** — người dùng đầu tư vào DAG graphs sẽ khó rời sang platform khác.

#### Giai đoạn 5 — Custom Data + Marketplace *(Enterprise + Marketplace)*

Biến VNStockChart từ tool thành platform:

- **Custom data sources:** CSV upload, REST API endpoint, WebSocket stream, Database query
- **Combine với DAG Builder:** indicator trên data nội bộ công ty, không share với ai
- **Marketplace:** publish/mua indicator sets, revenue sharing 80% cho tác giả
- **"Non-repaint certified"** badge auto-verified bởi system
- **Private marketplace** cho Enterprise organization

---

## Trạng thái hiện tại (v1.0.0)

| Tính năng | Trạng thái |
|-----------|-----------|
| Demo shell với live Binance data | ✅ Production |
| Dark/light theme với CSS variables | ✅ Production |
| 20+ drawing tools (Trend Line, Fibonacci, Channel...) | ✅ Production |
| Bar Replay với paper trading | ✅ Production |
| Dynamic panes + splitter resize | ✅ Production |
| SSOT canonical store (`enrichData` + `seriesValueResolver`) | ✅ Production |
| Series visibility toggle + auto-hide pane | ✅ Production |
| Settings modal (layout, series, params) | ✅ Production |
| VI/EN i18n | ✅ Production |
| Indicator catalog với metadata (GĐ 1) | 🔄 In progress |
| VN-exclusive indicators qua VNInvest (GĐ 2) | 📋 Planned |
| Saved indicator sets (GĐ 3) | 📋 Planned |
| Visual DAG Builder (GĐ 4) | 📋 Planned |
| Custom data sources + Marketplace (GĐ 5) | 📋 Planned |

---

## Cài đặt và chạy

### Yêu cầu

- Node.js ≥ 18
- npm ≥ 9

### Chạy demo

```bash
npm install
npm run watch          # dev server tại http://localhost:3000
```

### Build production

```bash
npm run build:docs     # build demo → build/
npm run build          # build library → dist/
```

### Kiểm tra chất lượng

```bash
npm run type-check     # TypeScript strict check
npm test               # Vitest (104 tests)
python scripts/generate_module_tree.py  # cập nhật module_tree_full.md
```

---

## Tài liệu công khai

| File | Mục đích |
|------|---------|
| [public-docs/README.md](public-docs/README.md) | Cổng vào cho tài liệu công khai |
| [public-docs/planning/INDICATOR_PLATFORM_PROPOSAL.md](public-docs/planning/INDICATOR_PLATFORM_PROPOSAL.md) | Đề xuất kiến trúc indicator platform |
| [public-docs/planning/INDICATOR_SSOT_POLICY.md](public-docs/planning/INDICATOR_SSOT_POLICY.md) | Quy tắc canonical store bắt buộc |
| [public-docs/roadmap/COMING-SOON.md](public-docs/roadmap/COMING-SOON.md) | Roadmap công khai / legacy notes |
| [AGENTS.md](AGENTS.md) | Bootstrap guide cho AI agents |

---

## Đóng góp

Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) và [AGENTS.md](AGENTS.md) trước khi tạo PR. Mọi thay đổi lớn cần có implementation plan được phê duyệt trước khi code.

---

## License

MIT © 2026 Phạm Việt Dũng



Create highly customizable stock charts

Built with [React JS](http://facebook.github.io/react/) and [d3](http://d3js.org/)

If you like this project checkout <a href="https://gocharting.com" target="_blank">gocharting.com</a>
 - integrates multiple charttypes
 - over 60 technical indicators and overlays
 - drawing objects

Multiple [quick start examples](https://github.com/rrag/react-stockcharts-examples2)

- svg and canvas for improved performance. 
- pan and zoom, on touch devices too

#### Chart types

- Scatter
- Area
- Line
- Candlestick
- OHLC
- HeikenAshi
- Renko
- Kagi
- Point & Figure

#### Indicators

- EMA, SMA, WMA, TMA
- Bollinger band
- SAR
- MACD
- RSI
- ATR
- Stochastic (fast, slow, full)
- ForceIndex
- ElderRay
- Elder Impulse

(more to come), 

and it is simple to create your own indicator too

#### Interactive Indicators

- Trendline
- Fibonacci Retracements
- Gann Fan
- Channel
- Linear regression channel

---

### Installation
```sh
npm install  --save react-stockcharts
```

### Documentation

[Repository docs hub](./docs/README.md)

[Project delivery docs](./docs/project-delivery/README.md)

[Upgrade-standard docs](./docs/upgrade-standard/README.md)

[Quality docs](./quality/QUALITY.md)


### Contributing

Refer to [CONTRIBUTING.md](./CONTRIBUTING.md)

### Stability

This is alpha state software, the api will change with each minor version.

### Roadmap

[Roadmap](./docs/md/COMING-SOON.md)

### LICENSE

[MIT](./LICENSE)