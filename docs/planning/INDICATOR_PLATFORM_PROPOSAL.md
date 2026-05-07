# Đề xuất xây dựng Indicator Platform: Từ Runtime Demo đến TradingView-class System

> **Trạng thái:** Đang thực hiện — GĐ 1 ✅ + GĐ 3 ✅ hoàn tất · GĐ 2 adapter ⚠️ một phần · GĐ 4–5 chưa bắt đầu  
> **Phiên bản:** 2.1 · 2026-05-06  
> **Tác giả:** GitHub Copilot  
> **Mục tiêu đọc:** Người quyết định · Kỹ sư trưởng · Kiểm toán chất lượng  
> **Cập nhật lần cuối:** 2026-05-06 — Phản ánh IC-1/IC-2/IC-3 đã hoàn tất; bổ sung phân tích 3 gap kỹ thuật là prerequisite cho GĐ 2 real-time

---

## 0. Lộ trình người dùng — Từ Consumer đến Creator

> Đây là cốt lõi của toàn bộ đề xuất. Indicator platform không phải là "thêm nhiều chỉ số
> hơn" — đó là **xây dựng một hệ thống phát triển qua 5 giai đoạn**, trong đó người dùng
> ngày càng có nhiều quyền lực hơn với dữ liệu của chính họ.

### Hành trình 5 giai đoạn — Từ người dùng thụ động đến người tạo indicator chuyên nghiệp

```
GIAI ĐOẠN 1          GIAI ĐOẠN 2          GIAI ĐOẠN 3
Well-known          VN-exclusive          Saved Sets
Indicators          Indicators            & Templates
────────────        ─────────────         ─────────────
EMA, RSI            Whale Bubbles         Lưu combo
MACD, BB            CVD real-time         indicators
ATR, VWAP           Strength              Apply 1-click
Stochastic          Dark Flow             Sync devices
Volume              SMFI                  Share bộ
Profile             W2+W4 Matrix          chỉ số

[Tất cả user]       [Pro+]                [Pro+]

        ↓                   ↓                     ↓

GIAI ĐOẠN 4                      GIAI ĐOẠN 5
Custom Indicator Builder          Full Custom Data + Marketplace
────────────────────────          ────────────────────────────────
Compose chỉ số từ                 Dùng nguồn data riêng:
chỉ số (EMA của RSI)              - CSV upload
Visual DAG editor                 - REST API endpoint
Backtest trực tiếp                - WebSocket stream
Save & share graph                - Database query
Alert khi crossover               Build indicator từ data đó
                                  Marketplace: bán/mua script
[Pro+]                            [Enterprise]
```

### Điều gì xảy ra nếu thiếu từng giai đoạn

| Bỏ giai đoạn | Hậu quả thực tế |
|--------------|-----------------|
| ❌ Bỏ GĐ 1 (well-known) | Không có credibility cơ bản — trader mới không tin dùng |
| ❌ Bỏ GĐ 2 (VN-exclusive) | Không có lý do gì để dùng thay vì TradingView |
| ❌ Bỏ GĐ 3 (saved sets) | Người dùng Pro+ không có lý do để trả tiền — free tier đủ dùng |
| ❌ Bỏ GĐ 4 (custom builder) | Không có barrier to exit — trader giỏi sẽ rời sang Pine Script |
| ❌ Bỏ GĐ 5 (custom data) | Enterprise không có gì để mua — họ có data riêng, cần tool, không thấy |

**Kết luận:** 5 giai đoạn phải là một lộ trình liên tục, không phải 5 tính năng độc lập.
Mỗi giai đoạn tạo ra lý do để người dùng nâng tier và ở lại lâu hơn.

---

## 1. Tại sao đây là thời điểm đúng để quyết định

### 1.1 Vấn đề chiến lược

Repo hiện tại đã có nền tảng kỹ thuật tốt hơn phần lớn mã nguồn mở cùng loại: SSOT
canonical đã xây xong, series visibility đã có, pane orchestration đã có. Nhưng nếu nhìn vào
những gì người dùng thật sự cần để so sánh với TradingView hay GoCharting, repo đang thiếu
**toàn bộ tầng sản phẩm** — catalog metadata, saved indicator sets, custom builder, và
sharing. Đây là khoảng cách không tự thu hẹp theo thời gian; ngược lại nó sẽ lớn dần theo
mỗi PR nếu không có định hướng rõ ràng ngay bây giờ.

### 1.2 Cơ hội thực tế trên thị trường VN

Thị trường chứng khoán Việt Nam đang trải qua giai đoạn tăng trưởng số mạnh. Các công cụ
phân tích kỹ thuật chuẩn như TradingView không có dữ liệu VN real-time đủ chất lượng.
GoCharting có orderflow nhưng không có data nội địa. FireAnt, SSI, VPS có data nhưng không có
công cụ phân tích đủ mạnh cho trader chuyên nghiệp. **Khoảng trống sản phẩm là thật và đang
mở.**

Một hệ thống indicator có catalog thật, custom builder, và saved sets sẽ là lý do đủ mạnh để
trader chuyên nghiệp chuyển sang platform nội địa thay vì phải dùng TradingView + data VN bên
ngoài.

### 1.3 Chi phí của việc không làm

Nếu không quyết định kiến trúc tầng sản phẩm ngay lúc này:

- Registry hiện tại sẽ bị các developer tiếp theo mở rộng theo hướng ad-hoc, không nhất quán.
- Mỗi indicator mới sẽ thêm hardcode vào `enrichData.ts` và `seriesValueResolver.ts` thay vì
  đi qua một entry point catalog đồng nhất.
- Custom builder sẽ không thể retrofit sau này nếu kiến trúc data flow đã bị chia rẽ.
- Technical debt catalog sẽ nhân lên theo số lượng indicator: mỗi indicator thêm vào một nơi
  cần biết thêm về nó ở 5–6 nơi khác nhau.

**Ước tính chi phí retrofit:** nếu repo đạt 30 indicator mà không có catalog, chi phí chuẩn hóa
lại sẽ gấp 3–4 lần so với làm đúng ngay từ 12–15 indicator hiện tại.

---

## 2. Hiện trạng thực tế — không tô hồng

### 2.1 Những gì đã làm tốt và cần giữ nguyên

> **Cập nhật 2026-05-06:** IC-1, IC-2, IC-3 đã hoàn tất và merge vào `dev`. Bảng dưới đây được mở rộng để phản ánh trạng thái thực tế.

| Layer | File/component | Trạng thái | Ghi chú |
|-------|---------------|------------|---------|
| Canonical SSOT | `enrichData.ts` | ✅ Hoàn chỉnh | Tính một lần, lưu vào `indicatorValues[key]` |
| Key normalization | `seriesValueResolver.ts → buildIndicatorSeriesKey()` | ✅ Hoàn chỉnh | EMA/RSI/MACD/BB/Whale đã có key pattern |
| Series visibility | `useDynamicPanes.ts → toggleSeriesVisible` | ✅ Hoàn chỉnh | Reducer + auto-hide pane khi hết series |
| Legend chips | `IndicatorLegend.tsx` | ✅ Hoàn chỉnh | Chip hidden-state, toggle/remove callback đúng index |
| Settings modal | `PaneSettingsModal.tsx` | ✅ Hoàn chỉnh | Y-axis, params, maxVisiblePanes, i18n — có tab indicator sets |
| Runtime filter | `DynamicChart.tsx → buildChartSlots` | ✅ Hoàn chỉnh | `visible !== false` filter trước khi render |
| SSOT policy | `docs/planning/INDICATOR_SSOT_POLICY.md` | ✅ Approved | Canonical rule đã được ghi thành văn bản |
| Catalog metadata | `src/lib/core/registry/SeriesRegistry.ts` | ✅ Hoàn chỉnh (IC-2) | `IndicatorCatalogEntry` với `inputSchema`, `outputSchema`, `panePolicy`, `repaintPolicy` |
| Generic settings form | `PaneSettingsModal.tsx → renderIndicatorParams` | ✅ Hoàn chỉnh (IC-2) | Render đúng từ `inputSchema`, không cần biết từng indicator |
| Saved indicator sets | `src/lib/core/sets/indicatorSetCodec.ts` | ✅ Hoàn chỉnh (IC-3) | Clone, sanitize, save, load, export, import round-trip |
| Saved sets hook | `src/lib/core/hooks/useIndicatorSets.ts` | ✅ Hoàn chỉnh (IC-3) | CRUD + apply + export + import + builtins merge |
| Built-in templates | `src/lib/core/sets/builtins/*.json` | ✅ Hoàn chỉnh (IC-3) | 3 templates: VN Swing Setup, Orderflow Suite, Crypto Standard |
| IndicatorSet types | `src/lib/core/types/indicator-set.ts` | ✅ Hoàn chỉnh (IC-3) | `IndicatorSet`, `IndicatorSetsStorage`, storage key constant |
| Pane replace action | `useDynamicPanes.ts → replaceLayout` | ✅ Hoàn chỉnh (IC-3) | Apply set 1-click → chart reset về layout của set |

### 2.2 Những gì còn thiếu — gap thực sự

> **Cập nhật 2026-05-06:** Nhiều item đã được hoàn thành trong IC-1/IC-2/IC-3. Xem trạng thái từng item bên dưới.

```
src/lib/indicators/registry.ts  (hiện tại)
  ├─ name: string
  ├─ compute: (bars, ...params) => output
  ├─ render?: (context) => unknown
  ├─ computeExtents?: (values) => [number, number]
  └─ yAxis?: "left" | "right"

src/lib/types/indicator.ts  (hiện tại)
  └─ IndicatorDefinition<TInput, TOutput, TParams>
     — Đây chỉ là một "compute registry", KHÔNG phải catalog
```

**Trạng thái từng item catalog:**

```
✅ category          — "trend" | "momentum" | "volatility" | "orderflow" | "strength"   [IC-2]
✅ tags              — ["non-repaint", "MTF-safe", "overlay", "oscillator"]              [IC-2]
✅ inputSchema       — mô tả params: min/max/step/type/label/default                     [IC-2]
✅ outputSchema      — mô tả output shape: { type: "band" | "macd" | "scalar" }         [IC-2]
✅ panePolicy        — "overlay" | "separate" | "either"                                 [IC-2]
✅ scalePolicy       — "percent" | "price" | "normalized" | "volume"                     [IC-2]
✅ repaintPolicy     — "no-repaint" | "repaint-on-close" | "repaint-always"              [IC-2]
⚠️ dependencies      — ["EMA:period=13"] — indicator phụ thuộc indicator khác            [IC-4 chưa cần]
✅ displayName (vi)  — tên tiếng Việt                                                    [IC-2 + i18n]
✅ description (vi)  — mô tả ngắn                                                        [IC-2]

✅ Saved indicator sets  — bundle canonical keys + presentation overrides               [IC-3]
❌ Custom graph builder  — DAG node-based composition                                    [IC-4]
❌ Sharing layer         — templates, favorites, community packs                         [IC-5]
```

**Gap kỹ thuật mới phát hiện (không có trong đề xuất gốc):**

```
❌ Viewport change event   — onVisibleRangeChange callback khi user pan/zoom             [Xem Section 11]
❌ Canvas overlay system   — heatmap band, whale marker cần canvas-native, không SVG     [Xem Section 11]
❌ Scroll/zoom to index API — scrollToDataIndex / zoomToRange imperative API             [Xem Section 11]
```

> ⚠️ Ba gap này là **prerequisite thực tế** cho GĐ 2 real-time (Whale Bubbles, CVD chart-linked).
> Xem phân tích chi tiết và lộ trình khắc phục tại **Section 11 — Technical Gap Remediation**.



### 2.3 Hệ quả thực tế của gap này

| Vấn đề | Hậu quả hiện tại | Trạng thái |
|--------|-----------------|------------|
| Không có `category` | UI phải hardcode filter "RSI là oscillator" thay vì đọc từ catalog | ✅ Đã fix (IC-2) |
| Không có `inputSchema` | Settings modal phải biết từng indicator có params gì, không thể generic | ✅ Đã fix (IC-2) |
| Không có `repaintPolicy` | Người dùng không biết indicator nào paint lại history, dễ backtest sai | ✅ Đã fix (IC-2) |
| Không có saved sets | Người dùng phải cài lại layout mỗi lần vào app | ✅ Đã fix (IC-3) |
| Không có viewport event | Whale alert không biết nến nào đang hiển thị trên màn hình | ❌ Gap mới (Section 11) |
| Không có canvas overlay | Heatmap band/whale marker phải dùng SVG → chậm, không scale | ❌ Gap mới (Section 11) |
| Không có custom builder | Không thể tạo indicator từ indicator (EMA của RSI) | ❌ IC-4 chưa làm |
| Không có sharing | Không có cơ chế lan truyền strategy giữa users | ❌ IC-5 chưa làm |

---

## 3. Kiến trúc 5 tầng — bản thiết kế đầy đủ

```
┌─────────────────────────────────────────────────────────────────────┐
│  TẦNG 5: SHARING & TEMPLATES                                        │
│  Versioned templates · Favorites · Curated packs · Community scripts│
│  → Lưu trên server, sync qua user account                           │
├─────────────────────────────────────────────────────────────────────┤
│  TẦNG 4: CUSTOM GRAPH BUILDER (DAG)                                 │
│  Source → Transform → Indicator → Math → Compare → Alert            │
│  → Compile graph xuống canonical IndicatorSeriesKey + execution plan│
├─────────────────────────────────────────────────────────────────────┤
│  TẦNG 3: SAVED INDICATOR SETS                                       │
│  Bundle canonical keys + presentation overrides (màu, visibility)   │
│  → Lưu local (localStorage) + optional sync lên server              │
├─────────────────────────────────────────────────────────────────────┤
│  TẦNG 2: CATALOG METADATA                                           │
│  category · tags · inputSchema · outputSchema · panePolicy          │
│  repaintPolicy · dependencies · displayName · description           │
│  → Nâng SeriesRegistry thành IndicatorCatalog thật                  │
├─────────────────────────────────────────────────────────────────────┤
│  TẦNG 1: CANONICAL STORE  (ĐÃ CÓ — cần hardening)                  │
│  enrichData() materialize · seriesValueResolver đọc lại             │
│  buildIndicatorSeriesKey() normalize params                         │
│  → Đây là foundation không thể thay thế của 4 tầng trên            │
└─────────────────────────────────────────────────────────────────────┘
```

### Nguyên tắc bất biến xuyên suốt 5 tầng

1. **Data flows down only:** Tầng trên chỉ được đọc dữ liệu từ tầng dưới, không tự tính lại.
2. **Canonical key là identity:** Cùng key = cùng dữ liệu, bất kể bao nhiêu consumer.
3. **Presentation không được ảnh hưởng data:** Màu sắc, visibility, y-axis không được tạo ra
   một series key mới.
4. **Custom indicator phải compile xuống canonical:** DAG builder không bypass enrichData.
5. **Sharing chỉ lưu keys, không lưu data:** Template là tập hợp keys + overrides, không bao
   giờ lưu array EnrichedDatum.

---

## 4. Lộ trình 5 giai đoạn — Chi tiết kỹ thuật và giá trị người dùng

> Mỗi giai đoạn có 3 chiều: **kỹ thuật** (làm gì), **người dùng** (họ nhận được gì),
> **tiền** (tại sao họ trả thêm).

---

### Giai đoạn 1 — Well-known Indicators *(Tuần 1–3 = IC-1 + IC-2)* ✅ HOÀN TẤT
#### Tier: Tất cả người dùng (bao gồm free)

**Mục tiêu kỹ thuật:** Catalog hoàn chỉnh cho ~25 indicator chuẩn của TradingView.

**Bộ chỉ số mục tiêu:**

```
Trend (overlay):     EMA(7/20/50/200), SMA, WMA, Hull MA, TEMA
                     Bollinger Bands, Keltner Channel, Donchian Channel
                     Supertrend, Ichimoku Cloud, VWAP, VWAP Bands

Momentum (pane):     RSI(14), RSI(7), Stochastic, Williams %R
                     MACD(12,26,9), CCI, MFI, ROC

Volatility (pane):   ATR(14), Historical Volatility, Bollinger Width
                     Chaikin Volatility

Volume (overlay):    Volume bars (color-coded up/down), OBV
                     Volume Profile (session), RVOL (Relative Volume)

VN-specific (pane):  MA20, MA50 (mandatory theo quy định UBCKNN VN)
```

**Người dùng nhận được:**
- Cùng bộ indicator với TradingView — không có lý do kỹ thuật nào để từ chối dùng thử
- Settings modal generic (không cần biết từng indicator có params gì)
- `repaintPolicy` label rõ ràng — trader biết cái nào an toàn cho backtest

**Công việc kỹ thuật thực tế:**
- Hardening canonical store (`enrichData.ts` + `seriesValueResolver.ts`)
- `IndicatorCatalogEntry` với đầy đủ `inputSchema`, `outputSchema`, `repaintPolicy`
- Settings modal thành generic form renderer từ `inputSchema`
- 25 builtin indicator files với catalog metadata đầy đủ

**Gate:** ✅ `npm test` pass (114 tests). Thêm indicator mới vào registry → settings modal render đúng params mà không cần chỉnh modal. **Đã xác nhận 2026-05-06.**

---

### Giai đoạn 2 — VN-exclusive Indicators *(Tuần 3–5 = IC-1 một phần + adapter layer)* ⚠️ ADAPTER CHƯA CÓ
#### Tier: Pro+ (cần PAT `signals:read` từ VNInvest)

**Đây là giai đoạn tạo ra lý do độc nhất để dùng VNStockcharts thay vì TradingView.**

**Bộ chỉ số mục tiêu — tất cả từ VNInvest API:**

```
Orderflow pane:
  CVD (Cumulative Volume Delta)        ← /core/v1/signals/order-flow/
  Whale Net Flow (histogram)           ← /api/realtime/whale-feed/
  Whale Buy/Sell Bubbles (price pane)  ← /api/realtime/whale-feed/
  Dark Flow Score                      ← session-facts.dark_flow_score
  RVOL VN (Relative Volume VN)        ← local compute từ VNStock

Strength pane:
  Buy Strength (0→1)                   ← session-facts.buy_strength
  Institutional Strength (0→1)         ← session-facts.institutional_strength
  SMFI — Smart Money Flow Index        ← /api/portfolio/dark-money-history/
  Elder Power Index (Elder's Force)    ← local compute (EMA of price * volume)

Signal overlays (price pane):
  Whale Alert Markers (▲▼ annotation) ← WebSocket whale_alert events
  Dark Flow Accumulation Zones         ← /api/portfolio/dark-money-history/
  W2+W4 Strategy Signal                ← VNInvest AI advisory (advisory:read)
```

**Người dùng Pro+ nhận được:**
- **Whale Bubbles real-time** — mỗi lệnh cá mập ≥ ngưỡng cài đặt xuất hiện ngay trên chart
- **CVD server-computed** — độ chính xác cao hơn tự tính từ intraday tick
- **SMFI** — chỉ số này không có ở bất kỳ platform nào khác với data VN
- **Annotation tự động** — không cần ngồi xem feed, whale event hiện thẳng lên chart

**Tại sao đây là "killer feature" của Pro+:**

```
TradingView:  CVD = ❌ (không có VN data thật)
GoCharting:   CVD = ⚠️  (partial, không có whale detection VN)
VNStockcharts: CVD + Whale + Strength + Dark Flow = ✅ từ VNInvest engine đã production-ready
```

Trader không cần chuyển qua chuyển lại giữa TradingView (chart) và VNInvest (whale feed) —
mọi thứ trong một màn hình.

**Công việc kỹ thuật:**
- `VNInvestSignalAdapter` implement với PAT auth header
- `BinanceAdapter` implement cho Nguồn 1 (crypto)
- `VNStockAdapter` implement cho Nguồn 2 (community)
- Symbol router tự động chọn adapter đúng
- Graceful degrade: nếu không có PAT → ẩn GĐ 2 indicators + hiện upsell message

**Gate:** Chart VCB với PAT test → Whale bubbles xuất hiện real-time. Chart BTCUSDT →
Binance CVD từ aggTrade. Swap symbol → adapter tự đổi đúng.

> ⚠️ **Prerequisite chưa đủ:** Để whale bubbles real-time hoạt động, cần giải quyết 3 gap kỹ thuật trong engine chart trước (viewport event, canvas overlay, scroll API). Xem **Section 11** để biết lộ trình khắc phục.

---

### Giai đoạn 3 — Saved Sets & Templates *(Tuần 5–7 = IC-3)* ✅ HOÀN TẤT
#### Tier: Pro+ (lưu local) · Enterprise (sync multi-device + share với team)

**Mục tiêu:** Người dùng lưu được "bộ làm việc" của mình — không phải cài lại mỗi lần.

**Tính năng chi tiết theo tier:**

```
FREE:
  └─ Xem 3 built-in templates (không thể lưu thêm)
     • "VN Swing Setup": EMA20 + EMA50 + RSI + Volume Profile
     • "Orderflow Suite": CVD + Whale Bubbles + Strength (cần Pro+ để xem data)
     • "Crypto Standard": EMA + MACD + Volume + Funding Rate (Binance)

PRO+:
  └─ Lưu tối đa 10 indicator sets (localStorage + optional cloud sync)
  └─ Import/export set thành file .vnsc-set
  └─ Apply set 1-click → chart reset về layout của set đó
  └─ Set lưu: canonical keys + params + màu sắc + pane layout

ENTERPRISE:
  └─ Unlimited saved sets
  └─ Sync qua nhiều devices (account-level cloud storage)
  └─ Share set trong team (workspace sharing)
  └─ Set versioning: biết set thay đổi khi nào, rollback được
  └─ Admin publish curated sets cho cả team
```

**Người dùng nhận được:**

Trader chuyên nghiệp có 5–10 "setup" khác nhau: setup scalping, setup swing trade, setup theo
dõi whale, setup sector analysis. Hiện tại phải cài lại từ đầu mỗi lần. Với GĐ 3, bấm một
nút → chart về đúng layout quen thuộc.

Enterprise trader còn hơn: team leader publish "chuẩn phân tích" cho cả team → mọi người nhìn
chart theo cùng framework → thảo luận không bị lệch nhau.

**Công việc kỹ thuật:**
- ✅ `IndicatorSet` type + `useIndicatorSets` hook (`src/lib/core/types/indicator-set.ts`, `src/lib/core/hooks/useIndicatorSets.ts`)
- ✅ Settings modal thêm tab "Bộ chỉ báo của tôi" (`PaneSettingsModal.tsx → renderIndicatorSetsSection`)
- ✅ Built-in 3 templates dưới dạng static JSON trong repo (`src/lib/core/sets/builtins/`)
- ✅ `indicatorSetCodec.ts` — clone, sanitize, save, load, export, import
- ⏳ Cloud sync endpoint cần Django backend (VNInvest workspace API) — chưa làm, IC-5 scope

**Gate:** ✅ Lưu set → reload trang → apply set → chart đúng. Import/export round-trip không mất data. **Xác nhận bằng 114 tests pass + browser smoke 2026-05-06.**

---

### Giai đoạn 4 — Custom Indicator Builder *(Tuần 7–12 = IC-4)*
#### Tier: Pro+ (dùng DAG builder) · Enterprise (save + share graph + team library)

**Mục tiêu:** Người dùng tạo indicator mới từ indicator có sẵn — không cần code.

**Tại sao đây là barrier to exit mạnh nhất:**

TradingView có Pine Script — học curve cao, text-based, chỉ chạy trong sandbox của họ. Người
dùng đã đầu tư nhiều script Pine Script sẽ khó rời TradingView. VNStockcharts cần tạo ra
tương đương: người dùng đầu tư vào DAG graphs → khó rời sang platform khác.

**Khả năng của DAG builder theo tier:**

```
PRO+ — Visual Composer:
  Node types:
    Source:     Close, Open, High, Low, Volume, Whale Net Flow, CVD
    Indicator:  Bất kỳ indicator từ catalog (GĐ 1 + GĐ 2)
    Math:       +, -, ×, ÷, Max, Min, Abs, Log, Sqrt
    Transform:  Normalize(0-1), Percent Change, Z-Score, Rolling Window
    Signal:     CrossOver, CrossUnder, GreaterThan, LessThan, Between
  
  Ví dụ thực tế có thể xây dụng:
    EMA(RSI(14), 5)         — EMA làm mượt RSI → ít false signal hơn
    MACD của Whale Net Flow — MACD trên dòng tiền cá mập thay vì giá
    RSI của CVD             — momentum của dòng tiền tích lũy
    Divergence: Price vs SMFI → tín hiệu phân kỳ whale/giá
    Composite: (Buy_Strength × 0.4) + (SMFI × 0.6) → custom score

ENTERPRISE — Full Composer:
  Thêm:
    Alert node:   gửi webhook/email khi điều kiện thỏa mãn
    Compare node: so sánh cùng indicator trên 2 symbols
    Multi-TF:     dùng EMA(Close, 20) từ timeframe D trong chart H1
    Backtest:     chạy graph trên historical data → thấy signal history
    Publish:      đăng graph lên marketplace (nếu GĐ 5 đã có)
```

**Luồng sử dụng điển hình của user Pro+:**

```
1. Mở Graph Builder  → canvas trắng
2. Kéo node "RSI" → đặt params: period=14, source=Close
3. Kéo node "EMA" → connect output RSI vào input EMA, period=5
4. Kéo node "Signal/CrossOver" → khi EMA-RSI cắt lên 50 → signal BUY
5. Kéo node "Signal/CrossUnder" → khi EMA-RSI cắt xuống 50 → signal SELL
6. Preview chart nhỏ → thấy signal trên dữ liệu 6 tháng
7. Lưu graph "My RSI Smoother"
8. Apply lên chart chính → indicator hiện như bình thường
```

Toàn bộ bước trên không cần viết một dòng code.

**Công việc kỹ thuật:**
- DAG types + topological executor
- `@xyflow/react` visual canvas
- Compile DAG → canonical keys → enrichData pipeline
- Real-time mini-preview khi build graph
- Serialize/deserialize graph → lưu trong IndicatorSet

**Gate:** Tạo "EMA(RSI(14), 5)" bằng visual builder → chart hiển thị đúng giá trị toán học.
Alert node → webhook fire đúng khi crossover xảy ra trên dữ liệu test.

---

### Giai đoạn 5 — Custom Data Sources + Indicator Marketplace *(Tuần 12–20 = IC-5)*
#### Tier: Enterprise (custom data) · Marketplace mở cho cả Pro+ (publish/consume)

**Đây là giai đoạn biến VNStockcharts từ một tool thành một platform.**

**Custom Data Sources — Enterprise có thể kết nối nguồn data riêng:**

```typescript
// Người dùng Enterprise cấu hình trong UI, không cần code:

Nguồn A: CSV Upload
  → Upload file .csv với columns: time, open, high, low, close, volume
  → Map columns → RawOHLCV schema
  → Chạy toàn bộ GĐ 1+2+4 indicators lên data đó
  → Use case: proprietary data, backtesting dataset đặc biệt

Nguồn B: REST API Endpoint  
  → Cấu hình URL: https://internal.company.com/api/ohlcv?symbol={symbol}
  → Auth headers: Authorization: Bearer {token}
  → Field mapping: { "o": "open", "c": "close", ... }
  → Refresh interval: 60s
  → Use case: data nội bộ công ty, futures exotics, commodities

Nguồn C: WebSocket Stream
  → wss://internal.company.com/ws/market
  → Message format: { symbol, price, volume, ts }
  → Tự động accumulate thành OHLCV theo timeframe chọn
  → Use case: HFT data, data của broker độc quyền

Nguồn D: Custom Signal API
  → REST endpoint trả về SignalFacts schema
  → Cho phép inject custom signals vào Whale/CVD/Strength panes
  → Use case: firm có whale detection riêng, muốn visualize lên chart
```

**Custom Indicator với Custom Data — kết hợp GĐ 4 + GĐ 5:**

```
Enterprise user có thể làm:
  
  1. Kết nối Nguồn B (REST API nội bộ)
     → Fetch OHLCV của commodity futures VN (chưa có trên VNStock)
  
  2. Mở DAG Builder (GĐ 4)
     → Source node: "Custom/my-rest-source/close"
     → Indicator node: RSI(14)
     → Math node: Normalize(0,1)
     → Compare node: > 0.7 → OVERBOUGHT signal
  
  3. Apply lên chart → thấy custom indicator của chính họ
     trên data của chính họ, không cần share cho ai
  
  4. (Optional) Publish lên Marketplace dưới dạng "Strategy Pack"
     (với mock/anonymized data để người khác dùng được)
```

**Indicator Marketplace — Hệ sinh thái kiếm tiền từ indicators:**

```
Cấu trúc Marketplace:

  Free tier:
    → Browse và install public indicator sets (GĐ 3 templates)
    → Không cần account nếu chỉ xem catalog

  Pro+ tier:
    → Publish indicator sets (DAG graphs) lên marketplace
    → Đánh giá và comment trên public sets
    → Fork và customize set của người khác

  Enterprise tier:
    → Publish "Premium Strategy Pack" với giá đặt riêng
    → Revenue sharing: VNStockcharts lấy 20%, author giữ 80%
    → Private marketplace: chỉ chia sẻ trong organization

  Curation:
    → "VNInvest Verified" badge cho sets dùng VNInvest signals
    → "Non-repaint certified" badge (checked by system)
    → "Backtested on 2Y VN data" badge (auto-verified)
```

**Tại sao Marketplace là flywheel tự duy trì:**

```
Nhiều user Pro+                 Nhiều indicator sets
tạo sets và publish  ───────►  trong marketplace
         ▲                              │
         │                             ▼
Nhiều người mua    ◄──────  Free users thấy giá trị
nâng cấp Pro+                và nâng cấp để publish
```

Đây là cơ chế tăng trưởng của TradingView Public Library (100k+ scripts). VNStockcharts
có thể tạo tương đương với lợi thế là data VN và VNInvest signals là native.

**Công việc kỹ thuật:**
- `CustomDataSourceConfig` UI (form cấu hình không cần code)
- Connector runtime: CSV parser, REST poller, WebSocket accumulator
- Marketplace backend (cần Django): publish, install, rating, revenue split
- "Non-repaint certified" auto-checker: chạy graph trên historical → verify không có look-ahead
- Private marketplace scope cho Enterprise org

**Gate:** Upload CSV 1 năm data → toàn bộ GĐ 1 indicators hiển thị trên data đó.
REST endpoint cấu hình → chart refresh đúng interval. DAG graph dùng custom source → compile và render đúng.

---

### Tổng quan 5 giai đoạn — Một cái nhìn

| | GĐ 1 | GĐ 2 | GĐ 3 | GĐ 4 | GĐ 5 |
|---|---|---|---|---|---|
| **Tên** | Well-known | VN-exclusive | Saved Sets | Custom Builder | Custom Data + Marketplace |
| **Tier** | Tất cả | Pro+ | Pro+ / Enterprise | Pro+ / Enterprise | Enterprise + Marketplace |
| **Tuần** | 1–3 | 3–5 | 5–7 | 7–12 | 12–20 |
| **Trạng thái** | ✅ **DONE** (IC-1+IC-2) | ⚠️ Adapter chưa có | ✅ **DONE** (IC-3) | ❌ Chưa bắt đầu | ❌ Chưa bắt đầu |
| **Lý do nâng tier** | — | Whale/CVD thật | Không cài lại | Indicator độc quyền | Data riêng + bán được |
| **Barrier to exit** | Thấp | Trung bình | Trung bình | **Cao** (DAG library) | **Rất cao** (custom data bound) |
| **Doanh thu model** | Freemium | Subscription Pro+ | Subscription Pro+/Ent | Subscription Ent | Revenue share Marketplace |
| **Prerequisite** | — | 3 Gap kỹ thuật (Section 14) | — | IC-2 catalog | IC-4 serialization |



---

## 5. Thứ tự làm và tại sao đúng

```
IC-1 (Store hardening)
  │  Lý do: IC-2 cần biết mọi indicator đều có canonical key
  ▼
IC-2 (Catalog metadata)
  │  Lý do: IC-3 dùng catalog để validate keys; IC-4 dùng catalog để define node types
  ▼
IC-3 (Saved indicator sets)     ←─┐
  │  Lý do: IC-4 graph output    │  Có thể song song một phần
  │  được save như indicator set  │
  ▼                              │
IC-4a (DAG executor + types) ───┘
  │  Lý do: IC-4b cần executor để preview real-time
  ▼
IC-4b (Visual node editor)
  │
  ▼
IC-4c (Save/export graph)
  │  Lý do: IC-5 cần format serialization ổn định
  ▼
IC-5 Level 1 (Local templates)
  │  Lý do: không cần server, value ngay
  ▼
IC-5 Level 2 (Account sync)
  │  Lý do: cần Django backend, làm sau
  ▼
IC-5 Level 3 (Community)
  Lý do: cần user base, làm khi có đủ người dùng
```

**Điều quan trọng:** IC-3 (saved sets) có thể bắt đầu song song với cuối IC-2 vì nó chỉ cần
catalog đủ để validate canonical keys, không cần catalog hoàn chỉnh 100%.

---

## 6. So sánh với TradingView và GoCharting sau khi hoàn thành

| Tính năng | TradingView | GoCharting | Repo sau 5 IC-slices |
|-----------|-------------|------------|----------------------|
| Catalog với category/tags | ✅ | ✅ | ✅ IC-2 |
| Settings modal generic (không cần biết từng indicator) | ✅ | ✅ | ✅ IC-2 |
| Saved indicator sets | ✅ | ✅ | ✅ IC-3 |
| Templates curated | ✅ | ✅ | ✅ IC-5 L1 |
| Indicator-on-indicator | ✅ | Một phần | ✅ IC-4 |
| Visual DAG builder | ❌ (Pine Script) | ❌ | ✅ IC-4b |
| Non-repaint label | ✅ | ❌ | ✅ IC-2 |
| Community sharing | ✅ | Một phần | ✅ IC-5 L3 |
| VN market data native | ❌ | ❌ | ✅ (đã có qua vnstock pipeline) |
| SSOT canonical store | Ẩn | Ẩn | ✅ Exposed và có thể test được |

**Điểm khác biệt so với TradingView:**
- TradingView dùng Pine Script (text-based) → học curve cao, khó debug
- Repo này dùng DAG visual (node-based) → dễ onboard hơn cho trader không biết code
- TradingView không có data VN real-time chất lượng → đây là lợi thế nền tảng

---

## 7. Rủi ro và cách giảm thiểu

| Rủi ro | Xác suất | Tác động | Giảm thiểu |
|--------|----------|----------|------------|
| IC-4 DAG builder quá phức tạp, kéo dài | Cao | Trung bình | Làm IC-4a (executor) trước, validate value trước khi làm UI |
| Registry migration break existing indicators | Trung bình | Cao | Backward compat: giữ `IndicatorDefinition` cũ, thêm `IndicatorCatalogEntry` song song |
| Community spam/malicious script trong IC-5 L3 | Thấp (ban đầu) | Cao | Chỉ mở Level 3 sau khi có moderation pipeline |
| Scope creep — thêm indicator mới thay vì làm catalog | Cao | Cao | Freeze indicator count ở 10 cho đến khi IC-2 xong |
| `enrichData.ts` trở thành monolith | Trung bình | Trung bình | IC-1 chia enrichData thành plugin-based computation |

---

## 8. Điều kiện để phê duyệt thực hiện

Tài liệu này yêu cầu bạn phê duyệt trước khi bắt đầu code bất kỳ slice nào. Đây là những
điều cần chốt:

### Câu hỏi cần trả lời trước khi bắt đầu

1. **IC-4 DAG builder:** Ưu tiên **visual node editor** hay **text-based formula** (như Pine
   Script)? Đề xuất của tài liệu này là visual trước vì thân thiện hơn, nhưng nếu target users
   là quants có thể code, text-based nhanh hơn.

2. **IC-5 sharing:** Bắt đầu từ **local templates** (không cần server) hay ngay lập tức thiết
   kế cho **account sync** (cần Django endpoint)? Đề xuất: local templates trước, server sau.

3. **Thứ tự ưu tiên:** Nếu phải chọn làm 2 IC đầu tiên, bạn chọn IC-1+IC-2 (catalog foundation)
   hay IC-1+IC-3 (saved sets ngay có giá trị người dùng)?

4. **Freeze scope:** Đồng ý không thêm indicator mới cho đến khi IC-2 xong không? Mỗi indicator
   thêm vào trước khi có catalog sẽ cần migrate thêm công sau.

---

## 9. Tóm tắt quyết định

| Nếu bạn đồng ý | Bước tiếp theo |
|----------------|----------------|
| Phê duyệt tài liệu này | Tôi bắt đầu viết spec chi tiết cho IC-1 và IC-2 ngay |
| Phê duyệt IC-1 + IC-2 | Code bắt đầu tuần này, catalog hoàn chỉnh trong 3 tuần |
| Phê duyệt cả 5 IC | Roadmap 12 tuần, với deliverable mỗi 2–3 tuần có thể demo |
| Chỉ muốn IC-1 trước | Canonical store hardening xong trong 1 tuần, không breaking change |

**Đề xuất của tôi:** Phê duyệt IC-1 + IC-2 trước, review kết quả, sau đó quyết định tiếp.
Hai slice này không breaking change, tăng testability, và mở đường cho 3 slice còn lại. Rủi ro
thấp, giá trị nền tảng cao.

---

---

## 10. Tích hợp VNInvest + VNStock — Nguồn dữ liệu thực tế cho VNStockcharts

> Đây là phần bổ sung quan trọng nhất cho tài liệu này. Hai repo `vietdungiitb/vninvest` và
> `vietdungiitb/vnstock` không chỉ là dự án độc lập — chúng là **infrastructure sẵn có** mà
> VNStockcharts có thể dựa vào để có signal data thật, auth model thật, và data VN thật ngay
> từ ngày đầu, không cần tự xây lại từ đầu.

### 10.1 Bức tranh toàn hệ thống — 3 repos kết nối như thế nào

```
┌──────────────────────────────────────────────────────────────────────────┐
│  VNInvest SaaS (vietdungiitb/vninvest)                                   │
│                                                                          │
│  ┌─────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │  PAT / Auth Layer   │  │  Data Signal APIs (Core v1)              │  │
│  │                     │  │                                          │  │
│  │  Tenant → Service   │  │  /core/v1/market/session-facts/          │  │
│  │  Account → PAT      │  │  → cvd_normalized, buy_strength,         │  │
│  │                     │  │    institutional_strength, whale_net_flow │  │
│  │  Scope codes:       │  │                                          │  │
│  │  market:read        │  │  /core/v1/signals/unified-alerts/        │  │
│  │  signals:read       │  │  → whale + dark flow alerts              │  │
│  │                     │  │                                          │  │
│  │  Quota / billing    │  │  /api/realtime/whale-feed/{symbol}/      │  │
│  │  enforcement        │  │  → live whale buy/sell events            │  │
│  └─────────────────────┘  │                                          │  │
│                           │  /api/portfolio/whale/analytics/{symbol}/│  │
│                           │  → price_series, bubble_series,          │  │
│                           │    flow_series: {cvd, buy_strength,      │  │
│                           │    institutional_strength}                │  │
│                           │                                          │  │
│                           │  ws/realtime/ (WebSocket)                │  │
│                           │  → whale_alert, whale_advisory events     │  │
│                           └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                   │ PAT auth            │ Signal data
                   ▼                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  VNStockcharts (vietdungiitb/react-stockcharts-master)                   │
│                                                                          │
│  enrichData.ts  ←──── VNInvest signals (CVD, Whale, Strength)           │
│  enrichData.ts  ←──── VNStock OHLCV (Quote, Trading)                    │
│                                                                          │
│  IndicatorCatalog → "Orderflow" group = VNInvest-backed indicators       │
│  IndicatorCatalog → "Trend/Momentum" group = local compute indicators    │
│                                                                          │
│  Auth: PAT từ VNInvest → gắn vào header khi call API                    │
│  Auth: Fallback demo mode khi không có PAT (mock data)                   │
└──────────────────────────────────────────────────────────────────────────┘
                   │
                   ▼ nhúng vào
┌──────────────────────────────────────────────────────────────────────────┐
│  Website của third-party (tenant của VNInvest)                           │
│                                                                          │
│  <VNStockWidget patToken="pai_xxx" symbol="VCB" />                       │
│                                                                          │
│  PAT được cấp bởi VNInvest tenant admin (vninvest/TenantPATs.jsx)        │
│  Quota + billing enforcement tự động qua VNInvest commercial API         │
└──────────────────────────────────────────────────────────────────────────┘
```

**Kết luận kiến trúc:** VNInvest không chỉ là "một nguồn data" — nó là **auth plane** và
**signal plane** của toàn hệ thống. VNStockcharts là **render plane**. Ba repo hình thành một
product suite hoàn chỉnh.

---

### 10.2 VNInvest — Map endpoint thực tế → Indicator trong VNStockcharts

Dữ liệu sau đây đã được xác nhận tồn tại trong vninvest repo qua code audit:

#### A. Session Facts — `GET /core/v1/market/session-facts/`

```json
{
  "symbol": "VCB",
  "session_date": "2026-05-06",
  "cvd_normalized": 0.73,
  "buy_strength": 0.68,
  "institutional_strength": 0.51,
  "whale_net_flow": 45200000000,
  "dark_flow_score": 0.82,
  "total_buy_volume": 1240000,
  "total_sell_volume": 890000,
  "computed_at": "2026-05-06T09:30:00+07:00",
  "stale": false,
  "source": "vninvest-core-v1"
}
```

**Map sang VNStockcharts indicators:**

| `session-facts` field | Indicator trong chart | Pane mặc định | Repaint policy |
|----------------------|----------------------|---------------|----------------|
| `cvd_normalized` | CVD (Cumulative Volume Delta) | `orderflow` | repaint-always |
| `buy_strength` | Buy Strength | `strength` | repaint-always |
| `institutional_strength` | Institutional Strength | `strength` | repaint-always |
| `whale_net_flow` | Whale Net Flow (histogram) | `orderflow` | repaint-on-close |
| `dark_flow_score` | Dark Flow Score | `strength` | repaint-always |

#### B. Whale Analytics Snapshot — `GET /api/portfolio/whale/analytics/{symbol}/`

```json
{
  "flow_series": {
    "cvd": [{"bucket_ts": "...", "cumulative_cvd": 120.5}],
    "buy_strength": [...],
    "institutional_strength": [...]
  },
  "bubble_series": [...],
  "summary": {
    "whale_order_count": 7,
    "extreme_order_count": 2,
    "net_cvd": 85.3,
    "total_buy_value": 24500000000,
    "total_sell_value": 12300000000
  }
}
```

**Map sang VNStockcharts:**
- `flow_series.cvd` → intraday CVD time series (line chart trong orderflow pane)
- `flow_series.buy_strength` → Buy Strength time series
- `bubble_series` → Whale Bubble overlay trên price pane (bubble size = matched_value)
- `summary.whale_order_count` → tooltip/badge count

#### C. Whale Feed (Real-time) — `GET /api/realtime/whale-feed/{symbol}/`

Mỗi event:
```json
{
  "id": "whale_VCB_buy_20260506T093012",
  "symbol": "VCB",
  "side": "BUY",
  "matched_value_vnd": 8500000000,
  "price": 82500,
  "volume": 103030,
  "ts": "2026-05-06T09:30:12+07:00",
  "severity": "HIGH",
  "source": "intraday_tick"
}
```

**Map sang VNStockcharts:**
- → Whale Bubble trên price chart (bubble, màu xanh lá = BUY, đỏ = SELL)
- → Alert feed trong tooltip (hover price bar → hiện whale events trong khoảng time đó)
- → Input cho `WhaleAlerts:threshold=5000000000` canonical key trong enrichData

#### D. Unified Alerts + WebSocket — `GET /core/v1/signals/unified-alerts/`

```typescript
// Event types từ ws/realtime/
{ event_type: "whale_alert", symbol, side, matched_value_vnd, severity }
{ event_type: "whale_advisory", symbol, advisory_type, severity, message }
```

**Map sang VNStockcharts:**
- WebSocket → trigger re-fetch session-facts → cập nhật CVD/Strength real-time
- Whale alert event → push annotation marker vào price pane (không repaint bar đã đóng)

#### E. SMFI — Smart Money Flow Index (computed server-side)

Công thức trong `views_dark_money_history.py`:
```
SMFI = (Whale_Buy - Whale_Sell) / (Vol_Trung_Bình_20_Phiên) * 100
```

**Map sang VNStockcharts:**
- SMFI trả về qua `/api/portfolio/dark-money-history/` → một oscillator riêng trong strength pane
- Catalog entry: `id: "SMFI"`, `category: "strength"`, `repaintPolicy: "repaint-on-close"`
- **Đây là chỉ số độc quyền của platform VN** — TradingView và GoCharting không có.

---

### 10.3 VNStock — Map API thực tế → Data source cho VNStockcharts

```python
# Các API vnstock đã có và sẵn dùng:

from vnstock import Vnstock

stock = Vnstock().stock(symbol='VCB', source='VCI')

# 1. OHLCV historical — nguồn chính cho chart bars
df = stock.quote.history(start='2025-01-01', end='2026-05-06', interval='1D')
# Output: time, open, high, low, close, volume

# 2. Intraday tick — nguồn cho CVD compute local (fallback khi không có VNInvest)
df = stock.quote.intraday(symbol='VCB', page_size=10_000)
# Output: time, price, volume, match_type (BU/SD/ATC...)

# 3. Price board — nhiều symbol cùng lúc (cho screener/watchlist)
from vnstock.common.data import Trading
trading = Trading(source='VCI')
board = trading.price_board(['VCB', 'VNM', 'FPT', 'ACB'])

# 4. Financial ratios — cho fundamental overlay
df = stock.finance.ratio(period='quarter')
# → P/E, P/B, ROE, ROA, EPS
```

**Cách VNStock fit vào VNStockcharts data pipeline:**

```
vnstock.quote.history()     → RawOHLCV[]  →  enrichData()  →  EnrichedDatum[]
vnstock.quote.intraday()    → tick[]      →  compute_cvd() →  CVD local fallback
vnstock.trading.price_board()→ snapshot   →  display trong watchlist sidebar
vnstock.finance.ratio()     → ratios      →  fundamental panel (nếu có)
```

**Khi nào dùng VNStock vs VNInvest cho CVD:**

| Scenario | Data source | Lý do |
|----------|-------------|-------|
| Demo/offline/no PAT | `vnstock.quote.intraday()` → local CVD compute | Không cần auth |
| User có PAT `signals:read` | `vninvest /core/v1/signals/` | CVD chính xác hơn (server-computed) |
| Real-time session | VNInvest WebSocket | Tick-by-tick update |
| Historical backtest | VNStock OHLCV | Intraday tick không lưu lâu |

---

### 10.4 PAT Token — Mô hình authentication khi nhúng vào website

Đây là **use case kinh doanh quan trọng nhất**: chủ website mua subscription VNInvest, nhận
PAT, cắm VNStockcharts vào site của họ. PAT kiểm soát ai xem được gì.

#### PAT lifecycle trong VNInvest (đã implement)

```
Operator (bạn) 
  → Tạo Tenant cho từng khách hàng
  → Khách hàng tạo Service Account
  → Service Account issue PAT với scope codes:
     • market:read        → xem OHLCV, price board
     • signals:read       → xem Whale, CVD, Strength
     • advisory:read      → xem AI advisory
  → PAT có expiry + quota (api_calls_per_day)
  → PAT bị revoke ngay khi subscription expire
```

**API đã có trong vninvest:**
```
POST /core/v1/partner/pats/issue/
POST /core/v1/partner/pats/{id}/revoke/
POST /core/v1/partner/pats/{id}/rotate/
GET  /core/v1/partner/usage/meters/     → quota consumed
GET  /core/v1/commercial/subscription/  → subscription status
```

#### Cách VNStockcharts nhận và dùng PAT

```typescript
// src/lib/core/auth/PATContext.tsx — NEW FILE (cần tạo khi triển khai)
export interface VNStockChartsConfig {
  patToken: string;           // "pai_xxxxx" từ vninvest
  apiBaseUrl: string;         // "https://vninvest.vn/api"
  wsUrl?: string;             // "wss://vninvest.vn/ws/realtime/"
  symbol?: string;            // symbol mặc định khi nhúng
  theme?: "dark" | "light";
}

// Widget entry point — website owner nhúng như này:
// <VNStockChartsWidget config={config} />
// hoặc:
// <script src="vnstockcharts.min.js"></script>
// <div id="vnsc" data-token="pai_xxx" data-symbol="VCB"></div>
```

#### Luồng auth đầy đủ khi nhúng

```
Website owner:
1. Đăng nhập VNInvest → Tenant Admin Panel (TenantPATs.jsx đã có)
2. Issue PAT với scope "market:read, signals:read"
3. Copy PAT string → cắm vào config của VNStockcharts widget

End user (visitor của website):
1. Load trang → VNStockcharts init với PAT trong config
2. Chart gọi VNInvest API với header: Authorization: PAT pai_xxx
3. VNInvest check quota → nếu OK → trả data → chart render
4. Nếu quota hết → VNInvest trả 429 → chart hiện "Hạn mức API đã hết"
5. Nếu subscription expire → chart hiện "Subscription không còn hiệu lực"
```

**Lợi thế của mô hình này:**
- Zero friction cho end user: họ không cần tài khoản VNInvest
- Billing tập trung: chủ website trả tiền, không phải end user
- Revoke ngay lập tức: chỉ cần revoke PAT, toàn bộ widget trên website đó ngừng hoạt động
- Scope granular: website "tin tức" chỉ cần `market:read`, website "analytics" mới cần `signals:read`

---

### 10.5 Indicator nào dùng nguồn nào — Ma trận đầy đủ

| Indicator | Data source | Compute ở đâu | Cần PAT scope | Fallback |
|-----------|-------------|---------------|---------------|----------|
| EMA, SMA, MACD | VNStock OHLCV | Client-side `enrichData.ts` | Không | N/A |
| RSI, Bollinger | VNStock OHLCV | Client-side `enrichData.ts` | Không | N/A |
| CVD (intraday) | VNInvest `/core/v1/signals/order-flow/` | Server-computed | `signals:read` | local compute từ vnstock intraday |
| Whale Bubbles | VNInvest `/api/realtime/whale-feed/` | Server | `signals:read` | Không có fallback thật |
| Buy Strength | VNInvest `/core/v1/market/session-facts/` | Server-computed | `signals:read` | N/A |
| Institutional Strength | VNInvest `session-facts` | Server-computed | `signals:read` | N/A |
| Dark Flow Score | VNInvest `session-facts` | Server-computed | `signals:read` | N/A |
| SMFI | VNInvest `/api/portfolio/dark-money-history/` | Server-computed | `signals:read` | N/A |
| Whale Advisory | VNInvest `/core/v1/advisory/{symbol}/latest/` | AI + server | `advisory:read` | N/A |
| OHLCV (chart bars) | VNStock `quote.history()` | VNStock Python → JSON | Không | Static demo data |
| Real-time tick | VNInvest WebSocket `ws/realtime/` | Streaming | `signals:read` | 10s polling fallback |

**Kết luận từ ma trận này:**

Với một PAT có scope `market:read, signals:read`, VNStockcharts có thể hiển thị **đầy đủ** tất
cả indicators trong nhóm orderflow và strength — không cần tự build thuật toán whale detection
hay CVD engine (đã có sẵn trong vninvest). Đây là lợi thế 6–12 tháng phát triển tiết kiệm
được.

---

### 10.6 Bốn nguồn dữ liệu chính của VNStockcharts

VNStockcharts được thiết kế để hỗ trợ 4 nguồn dữ liệu độc lập, có thể cùng tồn tại trong cùng
một phiên chart:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  NGUỒN 1: CRYPTO — Binance                                              │
│  OHLCV + order book + funding rate + liquidation heatmap                │
│  Symbol format: BTCUSDT, ETHUSDT, ...                                   │
│  Auth: Binance API Key (optional, public endpoint không cần key)         │
│  VNStock connector: vnstock.connector.binance (đã có)                   │
├─────────────────────────────────────────────────────────────────────────┤
│  NGUỒN 2: STOCK VN — VNStock Community (public/free)                    │
│  OHLCV lịch sử + intraday tick + financial ratios + company profile     │
│  Symbol format: VCB, FPT, VNM, VN30F1M, ...                            │
│  Auth: Không cần (scraping VCI/KBS) hoặc TCBS auth_token               │
│  VNStock: vnstock.explorer.vci | .kbs | .tcbs (đã có)                  │
├─────────────────────────────────────────────────────────────────────────┤
│  NGUỒN 3: STOCK VN — VNInvest + VNStock Private (PAT-gated)            │
│  Tất cả Nguồn 2 + Whale/CVD/Strength/Dark Flow/SMFI real-time          │
│  Symbol format: giống Nguồn 2                                           │
│  Auth: PAT token cấp bởi VNInvest tenant admin                         │
│  Scope: market:read + signals:read + advisory:read                      │
├─────────────────────────────────────────────────────────────────────────┤
│  NGUỒN 4: CUSTOM — Dữ liệu nội bộ / người dùng tự định nghĩa          │
│  CSV upload, JSON endpoint, WebSocket stream tùy chỉnh                  │
│  Symbol format: bất kỳ (user-defined)                                   │
│  Auth: do người dùng cấu hình (header, query param, bearer token)       │
│  Dùng khi: dữ liệu proprietary, backtesting data riêng, futures VN...  │
└─────────────────────────────────────────────────────────────────────────┘
```

#### DataSource Adapter Pattern — Interface chuẩn cho 4 nguồn

Adapter layer đảm bảo `enrichData.ts` không biết data đến từ nguồn nào — chỉ nhận
`RawOHLCV[]` và `SignalFacts` → compute → `EnrichedDatum[]`.

```typescript
// src/lib/data/adapters/types.ts — NEW FILE

export type DataSourceType =
  | "binance"       // Nguồn 1: Crypto
  | "vnstock"       // Nguồn 2: VN Stock community (free)
  | "vninvest"      // Nguồn 3: VNInvest + VNStock private (PAT)
  | "custom";       // Nguồn 4: User-defined

export interface OHLCVAdapter {
  sourceType: DataSourceType;
  fetchHistory(symbol: string, from: string, to: string, interval: string): Promise<RawOHLCV[]>;
  fetchIntraday?(symbol: string, pageSize?: number): Promise<IntradayTick[]>;
  // Binance thêm: fetchFundingRate, fetchLiquidations, fetchOrderBook
}

export interface SignalAdapter {
  sourceType: DataSourceType;
  fetchSessionFacts?(symbol: string, date?: string): Promise<SessionFacts | null>;
  fetchWhaleFeed?(symbol: string, limit?: number): Promise<WhaleEvent[]>;
  subscribeRealtime?(symbol: string, onEvent: (e: RealtimeEvent) => void): () => void;
  // Nguồn 2 (community): chỉ có local CVD từ intraday tick
  // Nguồn 3 (vninvest): có server CVD, Whale, Strength, Dark Flow
  // Nguồn 4 (custom): do user tự implement
}

export interface CustomAdapterConfig {
  // Nguồn 4: user cấu hình endpoint riêng
  ohlcvEndpoint?: string;           // HTTP endpoint trả về RawOHLCV[]
  ohlcvMapping?: Record<string, string>;  // field mapping: "o"→"open", "c"→"close"
  signalEndpoint?: string;
  wsUrl?: string;
  authHeaders?: Record<string, string>;
  refreshIntervalMs?: number;
}

export interface ChartDataConfig {
  ohlcvAdapter: OHLCVAdapter;
  signalAdapter?: SignalAdapter;
  patToken?: string;              // Nguồn 3: PAT từ VNInvest
  apiBaseUrl?: string;
  customConfig?: CustomAdapterConfig;  // Nguồn 4
}
```

#### Ma trận 4 nguồn × khả năng indicator

| Indicator group | Nguồn 1 Binance | Nguồn 2 VNStock community | Nguồn 3 VNInvest+private | Nguồn 4 Custom |
|-----------------|-----------------|--------------------------|--------------------------|----------------|
| EMA, SMA, MACD, RSI, Bollinger | ✅ (từ OHLCV) | ✅ | ✅ | ✅ (nếu có OHLCV) |
| Volume Profile, VWAP | ✅ Binance tick | ✅ VCI intraday | ✅ | Tùy nguồn |
| CVD | ✅ Binance aggTrade | ⚠️ Local compute từ tick | ✅ Server-computed | Tùy nguồn |
| Whale Bubbles | ✅ Liquidation data | ❌ Không có | ✅ VNInvest Whale Engine | ❌ |
| Buy/Institutional Strength | ❌ | ❌ | ✅ session-facts | ❌ |
| Dark Flow Score, SMFI | ❌ | ❌ | ✅ Độc quyền VNInvest | ❌ |
| Funding Rate (crypto) | ✅ Binance | ❌ | ❌ | ❌ |
| Financial Ratios (P/E, ROE) | ❌ | ✅ vnstock.finance | ✅ | ❌ |
| Custom user indicator | ✅ | ✅ | ✅ | ✅ |

**Ký hiệu:** ✅ = có sẵn · ⚠️ = quality thấp hơn · ❌ = không có

#### Symbol routing — Tự động chọn adapter đúng

```typescript
// src/lib/data/adapters/router.ts — NEW FILE
export function resolveAdapter(symbol: string, config: ChartDataConfig): {
  ohlcv: OHLCVAdapter;
  signal: SignalAdapter | null;
} {
  // Crypto symbols (BTCUSDT, ETHUSDT, ...): → Binance adapter
  if (isCryptoSymbol(symbol)) return { ohlcv: binanceAdapter, signal: binanceLiqAdapter };

  // VN stocks với PAT: → VNInvest adapter (bao gồm signal)
  if (config.patToken && isVNSymbol(symbol)) return { ohlcv: vnstockAdapter, signal: vninvestAdapter };

  // VN stocks không PAT: → VNStock community adapter, local CVD
  if (isVNSymbol(symbol)) return { ohlcv: vnstockAdapter, signal: localCVDAdapter };

  // Custom: → dùng CustomAdapter từ config
  return { ohlcv: customAdapter(config.customConfig!), signal: null };
}
```

Adapter pattern đảm bảo: swap nguồn không cần chỉnh `enrichData.ts` hay bất kỳ indicator code nào.

---

### 10.6b Phân quyền nguồn dữ liệu theo Tier — Ma trận đầy đủ

> Đây là câu trả lời trực tiếp cho câu hỏi: **"Tier nào được dùng nguồn data nào?"**

#### Nguyên tắc gốc

```
Nguồn 2 (VNStock community) = PUBLIC scraping + VCI/TCBS open API
  → Không cần PAT, không cần đăng ký → FREE tier được dùng

Nguồn 3 (VNInvest + VNStock private) = PAT-gated, billing tính theo quota
  → Cần PAT scope signals:read → Pro+ được dùng
  → Advisory AI (W2+W4) cần PAT scope advisory:read → Enterprise mới có

Nguồn 1 (Binance) = Public REST + market data
  → Không cần key cho public endpoint → FREE được dùng
  → Nếu muốn rate limit cao hơn hoặc trading features → cần Binance API Key (Pro+)

Nguồn 4 (Custom) = Do người dùng tự cấu hình endpoint riêng
  → Chỉ Enterprise mới có UI cấu hình custom data source
```

---

#### Bảng phân quyền Tier × Nguồn dữ liệu

| Nguồn dữ liệu | FREE | Pro+ | Enterprise | Ghi chú |
|---------------|:----:|:----:|:----------:|---------|
| **Nguồn 1 — Binance** (OHLCV, public) | ✅ | ✅ | ✅ | Public REST, không cần key |
| **Nguồn 1 — Binance** (aggTrade CVD, Liquidation heatmap) | ⚠️ rate limited | ✅ | ✅ | Pro+ cấu hình Binance API Key |
| **Nguồn 2 — VNStock community** (OHLCV lịch sử) | ✅ | ✅ | ✅ | VCI/KBS public scraping |
| **Nguồn 2 — VNStock community** (Intraday tick) | ✅ | ✅ | ✅ | TCBS intraday public |
| **Nguồn 2 — VNStock community** (Financial ratios P/E, ROE) | ✅ | ✅ | ✅ | vnstock.finance public |
| **Nguồn 2 — CVD local compute** từ intraday tick | ✅ (quality thấp) | ✅ | ✅ | Fallback khi không có PAT |
| **Nguồn 3 — VNInvest** (CVD server-computed) | ❌ | ✅ | ✅ | Cần PAT `signals:read` |
| **Nguồn 3 — VNInvest** (Whale Bubbles real-time) | ❌ | ✅ | ✅ | Cần PAT `signals:read` |
| **Nguồn 3 — VNInvest** (Buy Strength / Institutional Strength) | ❌ | ✅ | ✅ | Cần PAT `signals:read` |
| **Nguồn 3 — VNInvest** (Dark Flow Score) | ❌ | ✅ | ✅ | Cần PAT `signals:read` |
| **Nguồn 3 — VNInvest** (SMFI — Smart Money Flow Index) | ❌ | ✅ | ✅ | Cần PAT `signals:read` |
| **Nguồn 3 — VNInvest** (WebSocket real-time tick) | ❌ | ✅ | ✅ | Cần PAT `signals:read` |
| **Nguồn 3 — VNInvest** (W2+W4 AI advisory signal) | ❌ | ❌ | ✅ | Cần PAT `advisory:read` |
| **Nguồn 4 — Custom** (CSV upload) | ❌ | ❌ | ✅ | Tính năng Enterprise |
| **Nguồn 4 — Custom** (REST API endpoint) | ❌ | ❌ | ✅ | Tính năng Enterprise |
| **Nguồn 4 — Custom** (WebSocket stream) | ❌ | ❌ | ✅ | Tính năng Enterprise |

**Ký hiệu:** ✅ đầy đủ · ⚠️ có nhưng hạn chế · ❌ không có

---

#### Bảng phân quyền Tier × Indicator (kết quả từ data source trên)

| Indicator | FREE | Pro+ | Enterprise | Nguồn data |
|-----------|:----:|:----:|:----------:|------------|
| EMA, SMA, WMA, TEMA, Hull MA | ✅ | ✅ | ✅ | Nguồn 1 hoặc 2 (OHLCV) |
| Bollinger Bands, Keltner, Donchian | ✅ | ✅ | ✅ | Nguồn 1 hoặc 2 |
| RSI, Stochastic, Williams %R | ✅ | ✅ | ✅ | Nguồn 1 hoặc 2 |
| MACD, CCI, MFI, ROC | ✅ | ✅ | ✅ | Nguồn 1 hoặc 2 |
| ATR, Bollinger Width, Historical Vol | ✅ | ✅ | ✅ | Nguồn 1 hoặc 2 |
| VWAP, VWAP Bands | ✅ | ✅ | ✅ | Nguồn 1 hoặc 2 (intraday) |
| Volume Profile (session) | ✅ | ✅ | ✅ | Nguồn 1 hoặc 2 (intraday) |
| OBV, RVOL | ✅ | ✅ | ✅ | Nguồn 2 |
| Supertrend, Ichimoku | ✅ | ✅ | ✅ | Nguồn 1 hoặc 2 |
| MA20, MA50 (bắt buộc theo UBCKNN) | ✅ | ✅ | ✅ | Nguồn 2 |
| Financial Ratios overlay (P/E, ROE) | ✅ | ✅ | ✅ | Nguồn 2 vnstock.finance |
| Funding Rate (crypto) | ❌ | ✅ | ✅ | Nguồn 1 Binance (rate limit) |
| CVD (local, từ tick) | ✅ ⚠️ | ✅ | ✅ | Nguồn 2 fallback |
| **CVD (server, chính xác)** | ❌ | ✅ | ✅ | **Nguồn 3 VNInvest** |
| **Whale Bubbles real-time** | ❌ | ✅ | ✅ | **Nguồn 3 VNInvest** |
| **Buy Strength** | ❌ | ✅ | ✅ | **Nguồn 3 VNInvest** |
| **Institutional Strength** | ❌ | ✅ | ✅ | **Nguồn 3 VNInvest** |
| **Dark Flow Score** | ❌ | ✅ | ✅ | **Nguồn 3 VNInvest** |
| **SMFI** | ❌ | ✅ | ✅ | **Nguồn 3 VNInvest** |
| **W2+W4 AI Advisory Signal** | ❌ | ❌ | ✅ | **Nguồn 3 VNInvest** (advisory:read) |
| Custom indicator (DAG builder) | ❌ | ✅ | ✅ | Bất kỳ nguồn đã có quyền |
| Custom indicator trên custom data | ❌ | ❌ | ✅ | Nguồn 4 |
| Indicator từ marketplace | ❌ | ✅ (consume) | ✅ (consume + publish) | Marketplace |

---

#### Tại sao Pro+ có toàn bộ Nguồn 2 (community) mà không chỉ Free?

Câu trả lời: **Pro+ không bị giới hạn bởi nguồn data Nguồn 2** — họ được dùng tất cả những gì
Free được dùng, cộng thêm Nguồn 3. Không có indicator "Nguồn 2 dành riêng cho Free" vì không
có lý do kỹ thuật hay kinh doanh nào để hạn chế upward.

**Mô hình đúng là additive (tích lũy), không phải exclusive:**

```
FREE       = Nguồn 1 (public) + Nguồn 2 (community)
Pro+       = FREE + Nguồn 3 (VNInvest PAT signals:read)
Enterprise = Pro+ + Nguồn 3 (advisory:read) + Nguồn 4 (custom)
```

Người dùng nâng tier → họ được thêm, không bị mất gì.

---

#### Graceful degrade — Điều gì xảy ra khi Free user chạm ceiling

```
Scenario 1: Free user nhìn vào chart VCB
  → EMA/RSI/MACD/BB hiển thị bình thường (Nguồn 2 ✅)
  → CVD local tính được nhưng label rõ "⚠️ CVD ước tính (không real-time)"
  → Ô Whale Bubbles: mờ + tooltip "Cần Pro+ để xem Whale data thật"
  → Ô Strength: mờ + "Nâng cấp Pro+ để xem Buy/Institutional Strength"

Scenario 2: Pro+ user không có advisory:read
  → Toàn bộ GĐ 2 indicators hiển thị (CVD, Whale, Strength, Dark Flow, SMFI)
  → Ô W2+W4 Advisory: mờ + "Chỉ dành cho Enterprise — liên hệ để nâng cấp"

Scenario 3: Pro+ user — PAT hết quota (429 từ VNInvest)
  → Chart fallback về CVD local (Nguồn 2) tự động
  → Toast: "Hạn mức API hôm nay đã dùng hết — đang dùng dữ liệu ước tính"
  → Không crash, không blank chart

Scenario 4: Enterprise user mất kết nối tới Nguồn 4 (custom endpoint down)
  → Chart giữ bars từ lần fetch cuối + banner "Nguồn custom không phản hồi"
  → Tất cả indicator Nguồn 1+2+3 vẫn chạy bình thường
```

---

### 10.7 Roadmap tích hợp — 3 giai đoạn

#### Giai đoạn A — Demo standalone (Không cần vninvest) *(Tuần 1–3, tương đương IC-1 + IC-2)*

- VNStockcharts hoạt động với static demo data (như hiện tại)
- Catalog hoàn chỉnh với metadata cho tất cả indicator hiện có
- **Chỉ tiêu:** `npm run build:docs` → demo chạy, tất cả 10 indicator có catalog entry

#### Giai đoạn B — VNStock integration *(Tuần 3–5)*

- VNStockHttpAdapter fetch OHLCV thật từ VNStock API
- LocalCVDAdapter tính CVD từ intraday tick của VNStock (fallback quality)
- **Chỉ tiêu:** Load chart VCB với dữ liệu thật từ VCI source, EMA/RSI tính trên data thật

#### Giai đoạn C — VNInvest PAT integration *(Tuần 5–8)*

- `VNInvestSignalAdapter` implement đầy đủ với PAT auth
- Session facts → CVD/Strength/Dark Flow từ server
- WebSocket → real-time whale bubbles
- Widget config nhận `patToken` từ ngoài → kiểm tra quota → graceful degrade
- **Chỉ tiêu:** Nhúng widget với PAT test → Whale bubbles xuất hiện real-time trên chart VCB

#### Giai đoạn D — Embedding & subscription enforcement *(Tuần 8–10)*

- Wrap thành `<VNStockChartsWidget>` component nhúng được
- PAT expire/quota exceeded → UI message thân thiện, không crash
- Build output: `vnstockcharts-widget.min.js` (~200KB gzipped)
- **Chỉ tiêu:** Website demo của bạn nhúng widget → trader thấy full chart với whale signals

---

### 10.8 Tại sao đây là moat thực sự — Không thể clone dễ dàng

Hệ thống 3-repo kết hợp tạo ra competitive moat mà đối thủ rất khó clone trong ngắn hạn:

1. **VNInvest Whale Engine** đã có 6+ tháng production data VN thật —
   thuật toán phát hiện whale từ IntradayTick + Redis stream không thể copy chỉ bằng đọc code.

2. **SMFI và Strategy Matrix (W2+W4)** là metric độc quyền được tính từ data VN —
   không có trên bất kỳ platform ngoại nào.

3. **PAT tenant model** cho phép monetize VNStockcharts mà không cần build thêm auth —
   dùng hạ tầng VNInvest đã có.

4. **VNStock data pipeline** có VCI, TCBS, KBS, DNSE làm source —
   độ phủ thị trường VN tốt hơn bất kỳ thư viện mã nguồn mở nào.

5. **Local compute + server compute hybrid** —
   EMA/RSI chạy client-side (zero latency), Whale/CVD/Strength từ server (accuracy cao hơn local)
   — đây là kiến trúc đúng, đối thủ thường chọn all-server hoặc all-client, không cả hai.

---

## 11. So sánh toàn diện — VNStockcharts sau 5 giai đoạn vs 12 platform lớn trên thị trường

> **Lưu ý đọc:** Cột "VNStockcharts" phản ánh trạng thái **sau khi hoàn thành 5 giai đoạn**
> theo lộ trình này, không phải trạng thái hiện tại (demo). Cột platform khác phản ánh trạng
> thái production của họ tính đến Q2/2026.

---

### 11.1 Platform được so sánh

```
NHÓM GLOBAL (nền tảng quốc tế):
  TV   — TradingView          (web, 50M+ users, số 1 thế giới)
  GC   — GoCharting           (web, orderflow/footprint specialist)
  MT5  — MetaTrader 5         (desktop, forex/CFD dominant, 1B+ installs)
  NT   — NinjaTrader 8        (desktop, US futures/equities)
  TOS  — thinkorswim (Schwab) (desktop/web, US equities, institutional retail)
  SC   — Sierra Chart         (desktop, professional futures, most data-accurate)
  AMI  — AmiBroker            (desktop, scripting/backtesting, AFL language)

NHÓM VN NỘI ĐỊA (nền tảng Việt Nam):
  FA   — FireAnt              (web/app, social + chart)
  SSI  — SSI iBoard           (web, SSI Securities broker platform)
  TCBS — TCBS ThinkBiz        (web/app, TCBS broker platform)
  VPS  — VPS eStock           (web/app, VPS Securities)
  DNSE — DNSE Entrade         (web/app, DNSE broker, tập trung AI)

TARGET:
  VNSC — VNStockcharts        (web, sau 5 giai đoạn hoàn thành)
```

---

### 11.2 Bảng so sánh lớn — Theo nhóm tính năng

#### A. Chart Core & Rendering

| Tính năng | TV | GC | MT5 | NT | TOS | SC | AMI | FA | SSI | TCBS | VPS | DNSE | **VNSC** |
|-----------|:--:|:--:|:---:|:--:|:---:|:--:|:---:|:--:|:---:|:----:|:---:|:----:|:--------:|
| Candlestick / OHLCV bars | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Heikin Ashi / Renko | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ GĐ1 |
| Multi-timeframe trên 1 chart | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ GĐ4 |
| Multi-pane (overlay + sub-pane) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| Responsive / web embeddable | ✅ | ✅ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dark / light theme | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Replay / bar-by-bar simulation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ in dev |

#### B. Indicator Library

| Tính năng | TV | GC | MT5 | NT | TOS | SC | AMI | FA | SSI | TCBS | VPS | DNSE | **VNSC** |
|-----------|:--:|:--:|:---:|:--:|:---:|:--:|:---:|:--:|:---:|:----:|:---:|:----:|:--------:|
| Số indicator builtin | 100+ | 50+ | 30+ | 100+ | 300+ | 200+ | 200+ | 10 | 15 | 10 | 10 | 15 | **25+ GĐ1** |
| EMA / SMA / WMA / TEMA | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ GĐ1 |
| RSI / Stochastic / Williams | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ GĐ1 |
| MACD / CCI / MFI | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ GĐ1 |
| Bollinger / Keltner / Donchian | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ GĐ1 |
| Supertrend / Ichimoku | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ GĐ1 |
| VWAP / VWAP Bands | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ GĐ1 |
| Volume Profile (session/fixed) | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ GĐ1 |
| ATR / Historical Volatility | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ GĐ1 |
| Non-repaint label rõ ràng | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ1** |
| MA20/MA50 theo chuẩn UBCKNN | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | **✅ GĐ1** |
| Financial ratio overlay (P/E, ROE) | ❌ | ❌ | ❌ | ❌ | ✅ (US) | ❌ | ❌ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | **✅ GĐ1** (VN) |

#### C. Orderflow & Smart Money

| Tính năng | TV | GC | MT5 | NT | TOS | SC | AMI | FA | SSI | TCBS | VPS | DNSE | **VNSC** |
|-----------|:--:|:--:|:---:|:--:|:---:|:--:|:---:|:--:|:---:|:----:|:---:|:----:|:--------:|
| CVD (Cumulative Volume Delta) | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ2** |
| CVD với data VN thật (server) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ2** |
| Footprint / Delta per bar | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ roadmap |
| Whale Bubbles overlay VN | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ2** |
| Buy Strength (0→1) VN | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ2** |
| Institutional Strength VN | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ2** |
| Dark Flow Score VN | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ2** |
| SMFI — Smart Money Flow Index | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ2** |
| W2+W4 AI advisory signal VN | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ2** (Ent) |
| Whale alert real-time annotation | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ2** |
| Funding Rate (crypto) | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ GĐ2 |
| Liquidation heatmap (crypto) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ roadmap |

#### D. Custom Indicator & Scripting

| Tính năng | TV | GC | MT5 | NT | TOS | SC | AMI | FA | SSI | TCBS | VPS | DNSE | **VNSC** |
|-----------|:--:|:--:|:---:|:--:|:---:|:--:|:---:|:--:|:---:|:----:|:---:|:----:|:--------:|
| Scripting language | Pine Script | ❌ | MQL5 | NinjaScript (C#) | thinkScript | SCSS/C++ | AFL | ❌ | ❌ | ❌ | ❌ | ❌ | **DAG visual** |
| Visual / no-code indicator builder | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ4** |
| Indicator-on-indicator (EMA of RSI) | ✅ Pine | ❌ | ✅ MQL5 | ✅ C# | ✅ | ✅ | ✅ AFL | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ4 visual** |
| Không cần code để compose | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ4** |
| DAG graph save / export | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ4** |
| Custom indicator từ custom data | ✅ (server data) | ❌ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ5** |
| Alert khi indicator crossover | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | **✅ GĐ4** |
| Backtest từ custom indicator | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ GĐ4 (Ent) |

#### E. Custom Data Source

| Tính năng | TV | GC | MT5 | NT | TOS | SC | AMI | FA | SSI | TCBS | VPS | DNSE | **VNSC** |
|-----------|:--:|:--:|:---:|:--:|:---:|:--:|:---:|:--:|:---:|:----:|:---:|:----:|:--------:|
| Upload CSV lịch sử riêng | ⚠️ (premium) | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ5** |
| Kết nối REST API ngoài | ❌ | ❌ | ✅ (DLL) | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ5** |
| WebSocket stream tùy chỉnh | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ5** |
| UI cấu hình nguồn (không code) | ❌ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ5** |
| Chạy indicator GĐ1+2 trên custom data | N/A | N/A | ⚠️ | ⚠️ | N/A | ✅ | ✅ | N/A | N/A | N/A | N/A | N/A | **✅ GĐ5** |

#### F. Saved Sets & Templates

| Tính năng | TV | GC | MT5 | NT | TOS | SC | AMI | FA | SSI | TCBS | VPS | DNSE | **VNSC** |
|-----------|:--:|:--:|:---:|:--:|:---:|:--:|:---:|:--:|:---:|:----:|:---:|:----:|:--------:|
| Lưu indicator layout | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ GĐ3 |
| Apply 1-click set | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ GĐ3 |
| Import / export file | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ GĐ3 |
| Team / org shared templates | ✅ (org plan) | ❌ | ❌ | ❌ | ✅ (internal) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ GĐ3 (Ent) |
| Curated built-in templates | ✅ | ❌ | ❌ | ⚠️ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ GĐ3 |

#### G. Data Coverage VN

| Tính năng | TV | GC | MT5 | NT | TOS | SC | AMI | FA | SSI | TCBS | VPS | DNSE | **VNSC** |
|-----------|:--:|:--:|:---:|:--:|:---:|:--:|:---:|:--:|:---:|:----:|:---:|:----:|:--------:|
| OHLCV lịch sử VN (HOSE/HNX) | ⚠️ delay | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | **✅ 4 nguồn** |
| Intraday tick VN | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ✅ | ✅ | ✅ | ✅ | **✅ VCI/TCBS** |
| OHLCV real-time VN | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | **✅** |
| VN30 / index futures | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ✅ | ✅ | ✅ | ✅ | **✅** |
| Financial ratios VN (P/E, ROE, EPS) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ✅ | ✅ | ✅ | ✅ | **✅ GĐ1** |
| Số nguồn OHLCV VN độc lập | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 1 | 1 | 1 | **4 (VCI/TCBS/KBS/DNSE)** |
| Crypto OHLCV (Binance, Bybit) | ✅ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

#### H. Embedding & Distribution

| Tính năng | TV | GC | MT5 | NT | TOS | SC | AMI | FA | SSI | TCBS | VPS | DNSE | **VNSC** |
|-----------|:--:|:--:|:---:|:--:|:---:|:--:|:---:|:--:|:---:|:----:|:---:|:----:|:--------:|
| Nhúng vào website ngoài | ⚠️ iFrame | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ Widget** |
| White-label cho bên thứ ba | ✅ (tốn phí cao) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ PAT model** |
| Auth gated per-feature | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ PAT scope** |
| Marketplace bán indicator | ✅ (scripts) | ❌ | ✅ (MT MQL Market) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ GĐ5** |
| Open source / self-host | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |

---

### 11.3 Tổng điểm theo nhóm — Radar chart equivalent

> Thang điểm: **5** = dẫn đầu thị trường · **4** = tốt · **3** = đủ dùng · **2** = hạn chế · **1** = không có

| Nhóm tính năng | TV | GC | MT5 | NT | TOS | SC | AMI | FA | SSI | TCBS | DNSE | **VNSC** |
|----------------|:--:|:--:|:---:|:--:|:---:|:--:|:---:|:--:|:---:|:----:|:----:|:--------:|
| Chart Core & Rendering | 5 | 4 | 4 | 4 | 5 | 5 | 3 | 3 | 3 | 3 | 3 | **4** |
| Indicator Library (depth) | 5 | 4 | 3 | 5 | 5 | 5 | 5 | 1 | 1 | 1 | 2 | **3** |
| Orderflow / Smart Money | 2 | 5 | 1 | 4 | 2 | 4 | 1 | 1 | 1 | 1 | 1 | **5** ★ |
| VN Smart Money riêng | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **5** ★★ |
| Custom Indicator | 4 | 1 | 4 | 5 | 4 | 5 | 5 | 0 | 0 | 0 | 0 | **4** |
| No-code Composer | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **5** ★ |
| Custom Data Source | 2 | 0 | 4 | 4 | 1 | 5 | 5 | 0 | 0 | 0 | 0 | **4** |
| Data VN (breadth) | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 3 | 3 | 3 | **5** ★ |
| Embedding / White-label | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **5** ★ |
| Saved Sets & Templates | 5 | 2 | 4 | 4 | 5 | 3 | 4 | 1 | 1 | 1 | 1 | **4** |
| Marketplace | 5 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **4** GĐ5 |
| Open source / tự host | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **5** ★ |
| **TỔNG** | **31** | **16** | **24** | **26** | **27** | **27** | **23** | **9** | **9** | **9** | **10** | **53** |

> ★ = VNSC độc quyền hoặc dẫn đầu trong hạng mục đó
> ★★ = Không có đối thủ nào trên thị trường toàn cầu

---

### 11.4 Đọc kết quả theo phân khúc

#### Nhóm 1 — Platform quốc tế tổng hợp (TV, TOS, NT)
TradingView là benchmark hiện tại. Sau 5 giai đoạn, VNSC vượt TV ở:
- **Data VN** (VNStock 4 nguồn vs TV delay/partner) → +4 điểm
- **Smart Money VN** (VNInvest engine vs TV không có) → +5 điểm
- **No-code Composer** (DAG visual vs Pine Script chỉ text) → +5 điểm
- **Embedding/White-label** (PAT model vs iFrame only) → +3 điểm

TV vẫn hơn VNSC ở:
- **Indicator depth** (100+ vs 25+ — nhưng 25 là đủ cho 95% use case)
- **Độ ổn định** (production 10+ năm vs mới triển khai)
- **Community size** (50M user vs mới xây)

**Kết luận vs TV:** VNSC không cạnh tranh trực diện với TV cho trader ngoại. VNSC thắng trên phân khúc **VN trader chuyên nghiệp** vì data local và whale detection mà TV không bao giờ có.

#### Nhóm 2 — Orderflow specialist (GoCharting, Sierra Chart, NinjaTrader)
GoCharting là đối thủ trực tiếp nhất về orderflow. VNSC vượt GC ở:
- **CVD với data VN thật** (GC không có VN data → CVD GC là mock/crypto)
- **Whale Bubbles** (không có ở GC)
- **SMFI / Dark Flow / Strength** (hoàn toàn không có ở GC)
- **No-code Composer** (GC không có custom indicator builder)

GC hơn VNSC ở:
- **Footprint chart** (GC có footprint mạnh — VNSC chưa có trong roadmap 5 GĐ)
- **Thành thục với orderflow UX** (GC đã production nhiều năm)

**Kết luận vs GC:** VNSC thắng về **chất lượng signal VN**, GC thắng về **footprint chart thô**. Trader VN cần whale detection thật hơn footprint generic.

#### Nhóm 3 — Desktop scripting (MetaTrader 5, AmiBroker)
MT5 và AMI rất mạnh về backtesting và scripting nhưng:
- **Không có data VN chất lượng** — phải tự viết connector
- **Không web-based** — không nhúng được vào portal
- **Không có whale/CVD VN** → không thể thay thế VNInvest signals

VNSC không cạnh tranh với AMI về **depth của backtesting engine** — đó không phải market của VNSC. VNSC cạnh tranh ở **real-time signals + visual composition + VN data**.

#### Nhóm 4 — VN nội địa (FireAnt, SSI, TCBS, VPS, DNSE)
Đây là **thị trường mà VNSC sẽ lấy user từ đó**:

| Platform VN | Điểm yếu lớn nhất | VNSC giải quyết như nào |
|-------------|-------------------|------------------------|
| **FireAnt** | Chart đơn giản, chỉ MA/RSI, không orderflow | VNSC: đầy đủ orderflow + whale VN |
| **SSI iBoard** | Bị ràng buộc broker SSI, không có smart money | VNSC: broker-agnostic, có whale |
| **TCBS ThinkBiz** | UX tốt nhưng indicator set hạn chế | VNSC: 25+ GĐ1 + VN-exclusive GĐ2 |
| **VPS eStock** | Chart cơ bản, không custom indicator | VNSC: DAG builder GĐ4 |
| **DNSE Entrade** | AI features nhưng không có visual chart với indicator stack | VNSC: full chart stack + AI advisory |

**Kết luận vs VN nội địa:** Tất cả platform VN hiện tại bị ràng buộc bởi broker → không thể dùng data từ nguồn khác, không có orderflow thật, không có custom indicator. VNSC là **platform trung lập đầu tiên của VN** có thể tích hợp tất cả nguồn.

---

### 11.5 Kết luận cạnh tranh — Vị trí thị trường rõ ràng

```
VNStockcharts sau 5 giai đoạn =

  TradingView-class indicator library (GĐ1)
+ GoCharting-class orderflow, nhưng với data VN thật (GĐ2)
+ TradingView-class saved sets (GĐ3)
+ No-code DAG builder — không có ở bất kỳ platform nào trên thị trường (GĐ4)
+ Custom data nguồn proprietary — ngang AmiBroker/Sierra Chart (GĐ5)
+ White-label widget embedding — ngang TradingView Advanced Embedding (cao cấp)
+ VN whale/CVD/SMFI engine — độc quyền, không có đối thủ

= Nền tảng charting hạng nhất dành riêng cho thị trường Việt Nam,
  đồng thời là nền tảng embeddable cho bất kỳ công ty fintech VN nào.
```

**Một điều không thể mua được:** Không có platform nào — kể cả TradingView hay Bloomberg — có thể cung cấp SMFI, Whale Engine VN, hay Dark Flow Score cho thị trường HOSE/HNX trong thời gian ngắn. Đây là moat thực sự mà 5 giai đoạn này đang xây.

---

## 12. Điều kiện phê duyệt — Cập nhật với integration context

Ngoài 4 câu hỏi ở phần 8, cần thêm:

5. **Giai đoạn tích hợp:** Bắt đầu với Giai đoạn A (demo catalog) → rồi nhảy thẳng sang Giai
   đoạn C (PAT integration), hay phải qua Giai đoạn B (VNStock OHLCV thật) trước?
   **Đề xuất:** A → B → C theo thứ tự. Không nên dùng static data cho demo khi đã có VNStock.

6. **Widget embedding priority:** Giai đoạn D (embedding) có phải làm ngay sau C không, hay có
   thể defer sang sau IC-3 (saved sets) xong? **Đề xuất:** D và IC-3 song song được — không
   phụ thuộc nhau.

7. **PAT test environment:** Bạn có sẵn PAT test `signals:read` từ vninvest dev environment
   không? Nếu chưa có, Giai đoạn C phải chờ. **Action item:** Issue PAT từ vninvest tenant
   admin trước khi bắt đầu Giai đoạn C.

---

## 13. Kiến trúc bảo mật — PAT, BFF, và giới hạn của frontend

> Phần này trả lời câu hỏi: **Chỉ cấu hình PAT username/token là đủ chưa? Cơ chế nào ngăn
> người dùng bypass? Có cần Runtime Script APIs không?**

### 13.1 Vấn đề cốt lõi: Frontend = mã nguồn lộ hoàn toàn

VNStockcharts là React app chạy trong browser. Mọi thứ trong bundle đều có thể đọc được:

```
Người dùng mở DevTools → Network tab
→ Thấy Authorization: PAT pai_xxxx trong mọi request
→ Copy token → gọi VNInvest API trực tiếp từ curl
→ Bypass hoàn toàn VNStockcharts, dùng data không qua quota
```

**Obfuscation và minification không giải quyết được:** dù bundle nhỏ đến đâu, token vẫn
phải đi qua network header — DevTools luôn thấy. Không có kỹ thuật frontend nào có thể che
token khỏi người dùng đang dùng chính browser của họ.

---

### 13.2 Ba lớp bảo mật — Phân theo trách nhiệm và hiệu lực thực tế

```
┌─────────────────────────────────────────────────────────────────┐
│  LỚP 1: VNInvest Server  ← lớp duy nhất có tính ràng buộc thật │
│                                                                 │
│  PAT → server kiểm tra tất cả:                                  │
│    ✅ Token tồn tại và chưa bị revoke                           │
│    ✅ Scope "signals:read" có trong token không                 │
│    ✅ Quota hôm nay còn không (api_calls_per_day)               │
│    ✅ Origin/Referer domain có trong whitelist tenant không ★   │
│    ✅ Subscription của tenant còn active không                  │
│                                                                 │
│  ★ allowed_origins là hàng rào quan trọng nhất:                 │
│    Nếu PAT bị copy về máy cá nhân → curl từ terminal           │
│    → Referer/Origin không khớp → 403 Forbidden                 │
│    → Token vô dụng ngoài domain đã đăng ký                     │
├─────────────────────────────────────────────────────────────────┤
│  LỚP 2: BFF Pattern (Backend For Frontend)                      │
│  PAT không bao giờ ra browser — bắt buộc cho production         │
│                                                                 │
│  ❌ KHÔNG AN TOÀN (hiện tại):                                   │
│     Browser ──────────────────────► VNInvest API                │
│              (PAT visible DevTools)                             │
│                                                                 │
│  ✅ ĐÚNG (production):                                          │
│     Browser ──► VNStockcharts Django BFF ──► VNInvest API      │
│                 (PAT trong server env var,                      │
│                  không bao giờ trả về browser)                  │
├─────────────────────────────────────────────────────────────────┤
│  LỚP 3: Frontend Guards                                         │
│  UX chỉ — không phải security                                   │
│                                                                 │
│  if (!hasScope("signals:read")) {                               │
│    return <LockedOverlay message="Cần Pro+ để xem" />;          │
│  }                                                              │
│                                                                 │
│  → Ẩn UI, tạo upsell flow                                       │
│  → Bất kỳ developer nào cũng có thể patch JS để bỏ check này   │
│  → Không ngăn được API call trực tiếp                           │
└─────────────────────────────────────────────────────────────────┘
```

---

### 13.3 BFF Pattern — Thiết kế cụ thể cho VNStockcharts

```
LUỒNG ĐÚNG KHI CÓ BFF:

1. Website owner cấu hình PAT trên server của họ (env var / secret manager)
   → PAT không bao giờ xuất hiện trong source code hoặc config frontend

2. Browser gọi:
   GET /api/proxy/signals/session-facts?symbol=VCB
   (không có Authorization header từ browser)

3. Django BFF nhận → tự gắn PAT từ server env → forward tới VNInvest:
   GET https://vninvest.vn/core/v1/market/session-facts/?symbol=VCB
   Authorization: PAT pai_xxxxx

4. VNInvest trả kết quả → Django forward về browser → browser chỉ thấy JSON data

→ Không có request nào từ browser chứa PAT
→ DevTools không thấy gì để copy
```

**Endpoint Django BFF cần thiết kế (khi triển khai):**

```python
# vnstockcharts_backend/api/proxy/views.py
class VNInvestProxyView(APIView):
    """
    Proxy mọi request tới VNInvest. PAT lưu trong settings, không expose.
    Browser chỉ gọi /api/proxy/signals/*, không bao giờ thấy PAT.
    """
    permission_classes = [IsAuthenticated]  # User phải login vào VNStockcharts

    def get(self, request, path):
        pat = settings.VNINVEST_PAT            # từ env var
        base = settings.VNINVEST_API_BASE_URL
        resp = requests.get(
            f"{base}/{path}",
            params=request.query_params,
            headers={"Authorization": f"PAT {pat}"},
            timeout=5,
        )
        return Response(resp.json(), status=resp.status_code)
```

---

### 13.4 Đánh giá Runtime Script APIs và các kỹ thuật bảo mật frontend

| Kỹ thuật | Nên dùng | Lý do |
|----------|:--------:|-------|
| **JS Obfuscation** | ❌ | Chỉ làm khó đọc code, không ẩn token khỏi DevTools Network |
| **BFF Proxy** (server-side) | ✅ **Bắt buộc** | PAT không bao giờ ra browser — đây là giải pháp thực sự |
| **VNInvest `allowed_origins`** | ✅ **Bắt buộc** | Token bị copy vẫn bị chặn nếu origin không khớp |
| **Content Security Policy (CSP)** | ✅ Nên | Ngăn XSS inject script đánh cắp cookie/session |
| **Subresource Integrity (SRI)** | ✅ Nên | Ngăn CDN tamper vào bundle JS |
| **CORS chặt trên BFF** | ✅ Bắt buộc | Chỉ accept request từ domain đã whitelist |
| **WebCrypto encrypt PAT** | ❌ | Key để decrypt cũng phải ở browser → circular |
| **WASM token validation** | ❌ | Overkill, không ngăn được network inspection |
| **Frontend `hasScope()` guards** | ✅ (UX) | Tạo UX upsell tốt nhưng không phải security |
| **Rate limiting trên BFF** | ✅ Nên | Ngăn abuse ngay cả khi user có session hợp lệ |

---

### 13.5 Luồng auth đầy đủ theo tier — Với BFF

```
FREE user:
  Browser → VNStock public API (OHLCV)       — không qua BFF, không cần auth
  → Các endpoint VNInvest: 403 (không có PAT)
  → Frontend hiện locked overlay (UX only)

PRO+ user (logged in, subscription active):
  Browser → VNStockcharts BFF /api/proxy/signals/*
  BFF → kiểm tra session user → lấy PAT từ env → forward tới VNInvest
  VNInvest → enforce: scope signals:read + quota + origin whitelist
  → Data trả về browser không chứa token

ENTERPRISE user:
  Giống Pro+ nhưng BFF forward thêm endpoint advisory:read
  Custom data source: cũng qua BFF (headers auth ở server)

WIDGET NHÚNG (website third-party):
  Website owner config PAT trong server của họ (Django env / Next.js env)
  Widget gọi /api/proxy/* của website đó
  Website's BFF forward tới VNInvest với PAT của họ
  → End user (visitor) không bao giờ thấy bất kỳ token nào
```

---

### 13.6 Tóm tắt — Thứ tự ưu tiên triển khai bảo mật

```
PHASE 1 (trước khi production với PAT thật):
  ✅ VNInvest: cấu hình allowed_origins per PAT
  ✅ VNStockcharts: không bao giờ đặt PAT trong frontend config
  ✅ Django BFF proxy: PAT chỉ sống trong server env var

PHASE 2 (hardening):
  ✅ CSP header: connect-src 'self' https://vninvest.vn
  ✅ CORS chặt trên BFF: chỉ accept từ domain của platform
  ✅ Rate limiting BFF: theo user session, không theo PAT

PHASE 3 (nice to have):
  ✅ SRI cho bundle JS
  ✅ Audit log: mọi proxy request ghi lại (symbol, user_id, ts)
  ✅ VNInvest quota alert: notify khi quota > 80% để tránh outage
```

**Nguyên tắc không thể thỏa hiệp:**
> Frontend guards là UX. Server enforce là security.
> Không bao giờ đặt PAT trong localStorage, window.__config, hay bất kỳ chỗ nào
> mà browser JavaScript có thể đọc được.

---

## 11. Bảo vệ bản quyền và chống vi phạm — Chiến lược thực tế

> **Bối cảnh:** VNStockcharts là frontend TypeScript — bất kỳ code nào chạy được trong
> browser đều có thể đọc được. Không có cách nào bảo vệ 100%. Tuy nhiên, kiến trúc hiện
> tại đã tạo ra một moat tự nhiên, và có thể tăng cường thêm bằng 3 lớp sau.

### 11.1 Tại sao moat thực sự không phải ở code — mà ở data

Giả sử một đối thủ clone được toàn bộ frontend của VNStockcharts. Họ vẫn **không có**:

- VNInvest PAT → không có whale data, CVD server-computed, SMFI
- VNStock real-time VN quality data
- Saved sets của user (account-bound, stored server-side)
- VNInvest WebSocket stream

Kết quả họ có được là một **generic chart shell** không khác gì TradingView Lightweight
Charts. Không có lý do gì để người dùng chọn dùng. Đây là lý do Section 10 tập trung vào
data integration — đó vừa là tính năng **vừa là barrier bảo vệ bản quyền tự nhiên**.

```
Người copy được code VNStockcharts      Người copy được toàn bộ VNInvest
────────────────────────────────        ────────────────────────────────
  Có: chart shell, indicator UI           Không có: chart shell (đây là repo này)
  Không có: VNInvest signal data          Không có: VN OHLCV real-time quality
  Không có: PAT auth engine               Không có: integration layer

→ Không thể reproduce sản phẩm          → Không thể reproduce sản phẩm
  vì thiếu data plane                      vì thiếu render plane
```

**Kết luận kiến trúc:** Tách biệt render plane (repo này) và data plane (VNInvest) là
quyết định thiết kế đúng không chỉ về mặt kỹ thuật, mà còn là **chiến lược IP protection
hiệu quả nhất**.

---

### 11.2 Ba lớp bảo vệ cụ thể — xếp theo hiệu quả/effort

#### Lớp 1 — Data architecture (đã có, hiệu quả nhất)

PAT validation nằm hoàn toàn server-side tại VNInvest backend. Frontend không thể giả
mạo PAT. Người copy code frontend không có signal data → GĐ 2 indicators bị disable tự
động → sản phẩm không hoàn chỉnh.

**Đội code không cần làm thêm gì — kiến trúc này đã được thiết kế đúng.**

#### Lớp 2 — Legal moat (cost thấp, hiệu quả dài hạn)

Cần làm trước khi ra production:

- **Commercial license** rõ ràng, không phải MIT/Apache. Ghi vào `LICENSE` file và
  `package.json → license`. Người copy code bị ràng buộc pháp lý ngay từ file đầu tiên họ
  mở.
- **Copyright notice** embed vào webpack bundle header — một dòng comment được inject tự
  động vào mọi build output. Khó xóa vô tình.
- **EULA** cấm: reverse engineering, redistribution, commercial use without license,
  sử dụng với nguồn dữ liệu thay thế VNInvest.
- **Trademark** `VNStockcharts` + logo được đăng ký → người copy không thể đặt tên giống.

**Thời điểm làm:** Trước khi IC-3 deploy ra production.

#### Lớp 3 — Technical deterrents (làm khó, không ngăn được 100%)

Hai biện pháp thực tế nhất:

**A. Domain locking cho embedded widget use case:**
```typescript
// src/lib/core/auth/domainGuard.ts  — thêm khi làm IC widget embedding
const LICENSED_DOMAINS = loadLicensedDomains(); // từ VNInvest PAT response
if (!LICENSED_DOMAINS.includes(window.location.hostname)) {
  // Disable toàn bộ GĐ 2 indicators + hiện license notice
  // Không throw error — chỉ degrade gracefully
}
```
Domain whitelist được VNInvest PAT server trả về khi issue PAT, không hardcode trong
client code. Người copy code sang domain khác → GĐ 2 tự disable.

**B. Build obfuscation cho production bundle:**
Dùng `javascript-obfuscator` trong webpack config với `string encryption` + `control flow
flattening`. Tăng thời gian đọc hiểu code từ ~1 giờ lên ~1 tuần cho đối thủ. Không ngăn
được người đủ kiên nhẫn nhưng tạo friction đủ lớn cho đa số.

Cấu hình khuyến nghị:
```javascript
// config/webpack.config.js — thêm cho production build
new JavaScriptObfuscator({
  rotateStringArray: true,
  stringArray: true,
  stringArrayEncoding: ['rc4'],
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.4, // không dùng 1.0 vì tăng bundle size 3x
  deadCodeInjection: false,             // tắt vì tăng bundle size nhiều
}, [])
```

---

### 11.3 Đánh giá rủi ro thực tế theo kịch bản

| Kịch bản | Khả năng | Impact thực tế | Biện pháp xử lý |
|---|---|---|---|
| Competitor clone UI shell | Cao | **Thấp** — không có VNInvest data | Lớp 1 (đã có) |
| Developer cá nhân tự dùng cho mục đích phi thương mại | Cao | Thấp — mất 1 potential user, không mất doanh thu | Chấp nhận, focus vào user experience |
| Developer nối với vnstock community data (không qua VNInvest) | Trung bình | Trung bình — mất GĐ 2 killer features nhưng có GĐ 1 | Domain locking + License clause |
| Competitor tái tạo hoàn chỉnh từ đầu | Thấp | Cao — nhưng họ đủ năng lực làm mà không cần copy | Moat của data integration vẫn giữ |
| Internal enterprise dùng vượt license scope | Trung bình | Xử lý được | PAT quota billing tự enforce |

**Kết luận:** Rủi ro vi phạm bản quyền có tồn tại, nhưng **không đáng để đầu tư nhiều effort
vào technical deterrents**. Effort đó nên dồn vào làm GĐ 2 nhanh hơn — mỗi tuần có thêm
whale data và CVD thật là một tuần competitor khó copy hơn, không phải thêm obfuscation.

---

### 11.4 Thứ tự triển khai cho đội code

| Hạng mục | Thời điểm | Effort | Người chịu trách nhiệm |
|---|---|---|---|
| Thay `LICENSE` thành commercial license | Trước IC-3 deploy | 30 phút | Tech lead |
| Thêm EULA vào onboarding flow | Khi làm auth UI | 1 sprint | Frontend + Legal |
| Webpack copyright banner | Cùng lúc IC-3 | 1 giờ | Build engineer |
| Domain locking trong PAT response | Khi làm PAT issue flow | 1 sprint | Backend VNInvest |
| Build obfuscation | Trước public launch | 1 ngày | Build engineer |
| Trademark registration | Ngay bây giờ nếu chưa có | Ngoài scope kỹ thuật | Business/Legal |

---

## 14. Technical Gap Remediation — 3 Gap Kỹ Thuật Cần Giải Quyết Trước GĐ 2

> **Ngữ cảnh:** Audit code thực tế ngày 2026-05-06 phát hiện 3 gap kỹ thuật trong engine chart
> (không có trong đề xuất gốc). Ba gap này là **prerequisite bắt buộc** cho Giai đoạn 2
> real-time: không thể hiển thị Whale Bubbles live hay CVD linked với viewport nếu thiếu chúng.

---

### 14.1 Gap 1 — Không có Viewport Change Event

#### Vấn đề
`ChartCanvas.tsx` và `EventCapture.tsx` không emit bất kỳ callback nào khi người dùng pan/zoom.
Hệ quả:
- Whale alert real-time không biết nến nào đang nhìn thấy → không thể render marker đúng vị trí
- CVD time range không thể sync với viewport hiện tại
- Không có `subscribeAction(OnVisibleRangeChange)` tương đương KLineCharts

#### Phân tích kỹ thuật hiện trạng

```
EventCapture.tsx      — class component, xử lý mouse/touch/wheel
  componentDidMount   — attach DOM event listeners
  componentWillUnmount— remove listeners
  → Không có callback ra ngoài khi visible range thay đổi

ChartCanvas.tsx       — class component, quản lý plotData + xScale
  filterData()        — tính toán plotData từ xExtents
  setState()          — update khi zoom/pan
  → plotData thay đổi nhưng không ai được notify
```

#### Giải pháp đề xuất

**Bước 1:** Thêm prop `onVisibleRangeChange` vào `ChartCanvas`:

```typescript
// src/lib/ChartCanvas.tsx
interface ChartCanvasProps {
  // ... existing props ...
  onVisibleRangeChange?: (range: {
    startIndex: number;
    endIndex: number;
    startDate: Date;
    endDate: Date;
  }) => void;
}
```

**Bước 2:** Gọi callback trong `componentDidUpdate` khi `plotData` thay đổi:

```typescript
componentDidUpdate(prevProps: ChartCanvasProps, prevState: ChartCanvasState) {
  const { onVisibleRangeChange } = this.props;
  if (onVisibleRangeChange && this.state.plotData !== prevState.plotData) {
    const plotData = this.state.plotData;
    if (plotData.length > 0) {
      onVisibleRangeChange({
        startIndex: plotData[0].idx,
        endIndex: plotData[plotData.length - 1].idx,
        startDate: plotData[0].date,
        endDate: plotData[plotData.length - 1].date,
      });
    }
  }
}
```

**Bước 3:** `DynamicChart.tsx` nhận và forward callback lên consumer:

```typescript
// src/lib/core/DynamicChart.tsx
function DynamicChart({ onVisibleRangeChange, ...rest }: DynamicChartProps) {
  const handleVisibleRangeChange = useCallback(
    (range: VisibleRange) => onVisibleRangeChange?.(range),
    [onVisibleRangeChange]
  );
  return <ChartCanvas ... onVisibleRangeChange={handleVisibleRangeChange} />;
}
```

**Không cần thay đổi `EventCapture.tsx`** — logic nằm hoàn toàn trong `ChartCanvas`.

| Metric | Value |
|--------|-------|
| Files cần thay đổi | `ChartCanvas.tsx`, `DynamicChart.tsx`, `src/lib/core/types/chart.ts` |
| Breaking change | Không (prop optional) |
| Effort ước tính | **1–2 ngày** |
| Gate | Unit test: onVisibleRangeChange fires sau pan/zoom simulation |

---

### 14.2 Gap 2 — Không có Canvas Overlay System

#### Vấn đề
Drawing tools hiện tại dùng SVG (`DrawingLayer.tsx`). SVG phù hợp với drawing tools (đường
trend, fibonacci) nhưng không thể làm:
- **Heatmap band per-candle** — cần paint từng pixel theo density matrix
- **Whale bubble overlay** — cần render hình tròn size-proportional trên canvas của chart
- **Liquidation heatmap** — gradient color theo price level × time

Khi thêm nhiều whale marker lên SVG, performance giảm đáng kể (SVG re-render toàn bộ DOM cây).

#### Phân tích kỹ thuật hiện trạng

```
CanvasContainer.tsx   — quản lý multi-layer canvas
  layer "main"        — bars, volume, indicators
  layer "axes"        — trục X, trục Y
  layer "interactive" — crosshair, tooltip
  → Không có layer riêng cho overlay custom consumer

DrawingLayer.tsx      — SVG-based, z-index trên canvas
  → Dùng được cho drawing tools (ít element)
  → Không phù hợp cho heatmap (10k+ data points)
```

#### Giải pháp đề xuất

Thêm một `OverlayCanvas` layer vào `CanvasContainer`, với API callback-based cho consumer:

```typescript
// src/lib/core/canvas/OverlayCanvas.tsx — NEW FILE

export interface OverlayRenderContext {
  ctx: CanvasRenderingContext2D;
  xScale: (value: number | Date) => number;
  yScale: (value: number) => number;
  plotData: EnrichedDatum[];
  candleWidth: number;
  devicePixelRatio: number;
}

export interface OverlayCanvasProps {
  draw: (context: OverlayRenderContext) => void;
  zIndex?: number;   // default: trên main, dưới crosshair
}

export function OverlayCanvas({ draw, zIndex = 5 }: OverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderCtx = useChartRenderContext(); // context từ ChartCanvas

  useEffect(() => {
    if (!canvasRef.current || !renderCtx) return;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    draw({ ctx, ...renderCtx });
  }, [draw, renderCtx]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", zIndex, pointerEvents: "none" }}
    />
  );
}
```

**Consumer — ví dụ WhaleBubbleOverlay:**

```typescript
// src/lib/indicators/overlays/WhaleBubbleOverlay.tsx
function WhaleBubbleOverlay({ events, threshold }: WhaleBubbleProps) {
  const draw = useCallback(({ ctx, xScale, yScale, plotData, candleWidth }: OverlayRenderContext) => {
    for (const event of events) {
      const bar = plotData.find(d => d.date.getTime() === event.ts);
      if (!bar) continue;
      const x = xScale(bar.date);
      const y = yScale(event.price);
      const radius = Math.sqrt(event.matchedValueVnd / threshold) * 4;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = event.side === "BUY" ? "rgba(0,200,100,0.7)" : "rgba(220,50,50,0.7)";
      ctx.fill();
    }
  }, [events, threshold]);

  return <OverlayCanvas draw={draw} zIndex={6} />;
}
```

**Nguyên tắc quan trọng:** `OverlayCanvas` là **render-only** — không nhận mouse event. Drawing tools (interactive) vẫn dùng SVG. Đây là phân tách đúng: canvas cho performance-critical visual, SVG cho interactive tools.

| Metric | Value |
|--------|-------|
| Files cần tạo mới | `OverlayCanvas.tsx`, `useChartRenderContext.ts`, `WhaleBubbleOverlay.tsx` (mẫu) |
| Files cần thay đổi | `CanvasContainer.tsx`, `ChartCanvas.tsx` (thêm ChartRenderContext provider) |
| Breaking change | Không |
| Effort ước tính | **3–5 ngày** (API + 1 overlay mẫu đầy đủ) |
| Gate | WhaleBubbleOverlay render đúng bubble tại đúng tọa độ giá × thời gian |

---

### 14.3 Gap 3 — Không có Scroll/Zoom to Index API

#### Vấn đề
Không có API imperative để di chuyển viewport đến một nến cụ thể theo chương trình.
Hệ quả:
- Nhận WebSocket whale alert mới → không thể highlight và scroll đến nến đó
- "Đi đến ngày" (date picker) không thực hiện được
- Link deep-link `?symbol=VCB&date=2026-05-06` không thể restore viewport đúng

#### Phân tích kỹ thuật hiện trạng

```
ChartCanvas.tsx       — quản lý xExtents state
  this.state.xExtents — [startDomain, endDomain] hiện tại
  → Không có method public để thay đổi từ ngoài

DynamicChart.tsx      — wrapper React function component
  → Không expose bất kỳ imperative ref API nào
```

#### Giải pháp đề xuất

Thêm `useImperativeHandle` handle trên `DynamicChart`, với `scrollToIndex` và `zoomToRange`:

```typescript
// src/lib/core/DynamicChart.tsx

export interface ChartHandle {
  scrollToIndex: (index: number, align?: "left" | "center" | "right") => void;
  zoomToRange: (startIndex: number, endIndex: number) => void;
  scrollToDate: (date: Date, align?: "left" | "center" | "right") => void;
}

// Thêm forwardRef wrapper:
const DynamicChart = forwardRef<ChartHandle, DynamicChartProps>(
  function DynamicChart({ ...props }, ref) {
    const canvasRef = useRef<ChartCanvas>(null);

    useImperativeHandle(ref, () => ({
      scrollToIndex(index, align = "center") {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const data = canvas.getFullData();
        const item = data[index];
        if (!item) return;
        // Tính xExtents mới từ index + align + current zoom level
        const newExtents = computeExtentsForIndex(index, align, canvas.getCurrentZoomLevel(), data);
        canvas.setXExtents(newExtents);
      },
      zoomToRange(startIndex, endIndex) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const data = canvas.getFullData();
        canvas.setXExtents([data[startIndex]?.date, data[endIndex]?.date]);
      },
      scrollToDate(date, align = "center") {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const data = canvas.getFullData();
        const index = data.findIndex(d => d.date >= date);
        if (index < 0) return;
        this.scrollToIndex(index, align);
      },
    }), []);

    return <ChartCanvas ref={canvasRef} {...props} />;
  }
);
```

**Consumer — ví dụ whale alert click-to-navigate:**

```typescript
// Trong LibraryShowcaseDemo.tsx
const chartRef = useRef<ChartHandle>(null);

function handleWhaleAlertClick(alert: WhaleEvent) {
  const index = data.findIndex(d => d.date >= alert.ts);
  chartRef.current?.scrollToIndex(index, "center");
}

return (
  <>
    <DynamicChart ref={chartRef} data={data} ... />
    <WhaleAlertFeed events={whaleEvents} onAlertClick={handleWhaleAlertClick} />
  </>
);
```

**Cần thêm vào `ChartCanvas.tsx`:**

```typescript
// Hai method public cần thêm vào class ChartCanvas:
setXExtents(extents: [Date, Date]): void {
  this.setState({ xExtents: extents });
}
getFullData(): EnrichedDatum[] {
  return this.props.data;
}
getCurrentZoomLevel(): number {
  return this.state.plotData.length;
}
```

| Metric | Value |
|--------|-------|
| Files cần thay đổi | `DynamicChart.tsx` (forwardRef + useImperativeHandle), `ChartCanvas.tsx` (3 public methods) |
| Files cần cập nhật type | `src/lib/core/types/chart.ts` (thêm `ChartHandle` export) |
| Breaking change | Không (additive) |
| Effort ước tính | **2–3 ngày** |
| Gate | Test: `chartRef.current.scrollToDate(new Date("2026-03-01"))` → viewport di chuyển đúng |

---

### 14.4 Thứ tự triển khai và dependency

```
Gap 1 (Viewport Event)      ← KHÔNG phụ thuộc Gap khác
  │  Effort: 1–2 ngày
  │  Unlock: CVD time-range sync, analytics viewport
  ▼
Gap 3 (Scroll/Zoom API)     ← KHÔNG phụ thuộc Gap khác
  │  Effort: 2–3 ngày
  │  Unlock: Whale alert click-to-navigate, date picker, deep-link
  ▼
Gap 2 (Canvas Overlay)      ← Cần Gap 1 hoàn thành (cần OverlayRenderContext có xScale)
     Effort: 3–5 ngày
     Unlock: Whale Bubbles real-time, heatmap, liquidation overlay
```

Gap 1 và Gap 3 có thể làm song song (không phụ thuộc nhau).
Gap 2 nên bắt đầu sau khi Gap 1 xong để dùng `VisibleRange` trong `OverlayRenderContext`.

**Tổng effort: 6–10 ngày kỹ thuật (1–2 sprint nhỏ)**

Sau khi đóng cả 3 gap, `VNInvestSignalAdapter` có đủ hooks để:
- Nhận WebSocket whale event → `OverlayCanvas` render bubble ngay trên đúng nến
- CVD pane chỉ compute data trong viewport → tiết kiệm bandwidth
- User click alert trong feed → `scrollToIndex` đưa chart về đúng nến đó

---

### 14.5 Bảng tổng hợp 3 Gap

| Gap | Mô tả | Files chính | Effort | Unlock |
|-----|-------|-------------|--------|--------|
| **Gap 1** — Viewport Event | `onVisibleRangeChange` callback khi pan/zoom | `ChartCanvas.tsx`, `DynamicChart.tsx` | 1–2 ngày | CVD sync, analytics |
| **Gap 2** — Canvas Overlay | `OverlayCanvas` layer cho heatmap/whale marker | `OverlayCanvas.tsx` (new), `CanvasContainer.tsx` | 3–5 ngày | Whale Bubbles, heatmap |
| **Gap 3** — Scroll/Zoom API | `ChartHandle.scrollToIndex` / `zoomToRange` | `DynamicChart.tsx` (forwardRef), `ChartCanvas.tsx` | 2–3 ngày | Whale alert navigate, date picker |
| **Tổng** | | | **6–10 ngày** | GĐ 2 real-time fully enabled |

---

*Tài liệu này sẽ được cập nhật khi có feedback. Mọi thay đổi scope phải đi qua
[docs/CHANGE_CONTROL_STANDARD.md](../CHANGE_CONTROL_STANDARD.md) trước khi code.*
