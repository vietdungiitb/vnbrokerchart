# Dynamic Pane System — Tài liệu thiết kế

> Tạo: 2026-05-04 · Branch: dev · Trạng thái: **Thảo luận / Chưa code**

---

## 1. Bối cảnh

Terminal Demo (`LibraryShowcaseDemo`) hiện có 3 pane cố định hardcode trong JSX:

| Pane | Chart id | Nội dung cố định |
|---|---|---|
| **Price** | `id={1}` | Candlestick / Area / OHLC + EMA20 + EMA50 + Bollinger |
| **Volume** | `id={2}` | BarSeries khối lượng theo màu up/down |
| **Momentum** | `id={3}` | RSI + MACD |

**Nhược điểm:** không thể thêm, xóa, hoán đổi hay thay nội dung pane ở runtime mà không sửa code.

**Mục tiêu:** Biến các pane thành data-driven, cho phép người dùng:
- Thêm pane mới (CVD, Strength, Whale, bất kỳ indicator nào)
- Xóa pane không cần (ví dụ xóa Momentum, thêm CVD)
- Reorder pane (drag header)
- Thêm/xóa series trong từng pane
- Price pane luôn được ưu tiên (pinned, không xóa được)

---

## 2. Nguồn dữ liệu — CVD, Strength, Whale

### 2.1 CVD từ OHLCV (xấp xỉ — Phase 1)

Tính offline từ dữ liệu nến hiện có, không cần WebSocket bổ sung.

$$buyVol_i = V_i \times \frac{Close_i - Low_i}{High_i - Low_i}$$
$$sellVol_i = V_i - buyVol_i$$
$$CVD_i = CVD_{i-1} + (buyVol_i - sellVol_i)$$

**Edge case:** khi `High == Low` (nến doji) → `buyVol = V/2`.

**Độ chính xác:** ~60–70%. Phù hợp làm baseline.

### 2.2 CVD thật từ Binance Trade Stream (Phase 4)

WebSocket endpoint: `wss://stream.binance.com/ws/<symbol>@trade`

Mỗi event trade có field:
- `q` — quantity (volume)  
- `m` — isBuyerMaker (`true` = người bán chủ động = `sellVol`, `false` = người mua chủ động = `buyVol`)

$$delta_i = \begin{cases} +q_i & \text{nếu } m = false \text{ (buy)} \\ -q_i & \text{nếu } m = true \text{ (sell)} \end{cases}$$

$$CVD = \sum_{i=0}^{n} delta_i$$

**Độ chính xác:** ~99% (data gốc từ exchange).

**Lưu ý kiến trúc:** CVD WS cần accumulate theo từng timeframe bucket. Khi user đổi timeframe → reset accumulator và rebuild từ aggregate trade data.

### 2.3 Whale Buy/Sell (từ Trade Stream)

Cùng WS `@trade` stream, lọc theo ngưỡng giá trị:

$$isWhale = price_i \times q_i \geq threshold$$

Trade vượt ngưỡng → ghi nhận là Whale Buy (m=false) hoặc Whale Sell (m=true).

**Ngưỡng cần xác định:** mặc định đề xuất **$50,000 USD** mỗi trade (có thể cấu hình). Chưa chốt — cần thảo luận thêm.

Hiển thị: histogram theo thời gian (tương tự Volume pane nhưng chỉ tính trades > threshold).

### 2.4 Dark Money / OTC Flow (tương lai xa)

- Không capture được từ exchange WebSocket thông thường
- Cần feed bên thứ ba: Kaiko, Laevitas, Glassnode (on-chain cho crypto)
- **Không nằm trong phạm vi hiện tại**

### 2.5 Strength

Hai cách tính:

**A. Bull/Bear Power (Elder's method):**
$$BullPower = High - EMA(n)$$
$$BearPower = Low - EMA(n)$$

**B. Relative Strength so với index/BTC:**
$$RS_i = \frac{Return_{asset}}{Return_{BTC}}$$

→ **Chưa chốt phương pháp** — cần thảo luận thêm.

---

## 3. Kiến trúc hệ thống Dynamic Pane

### 3.1 Data Model

```ts
// SeriesConfig — mô tả một series trong pane
type SeriesConfig = {
  type: SeriesTypeId;                  // "Candlestick"|"Volume"|"CVD"|"RSI"|"MACD"|"Strength"|"Whale"|"EMA"|...
  params?: Record<string, unknown>;   // { period: 20, color: "#2d9cdb", threshold: 50000 }
  yAxisSide?: "left" | "right";       // dual Y-axis support
  overlay?: boolean;                  // overlay trên series khác trong cùng pane
};

// PaneDescriptor — mô tả đầy đủ một pane
type PaneDescriptor = {
  id: string;                          // "price" | "volume" | "cvd" | uuid...
  label: string;                       // hiển thị trên header pane
  pinned?: boolean;                    // true = Price pane, không xóa/reorder
  heightRatio: number;                 // tỉ lệ chiều cao (tổng = 1)
  series: SeriesConfig[];
  yExtentsMode?: "auto" | "fixed";
  secondaryYAxis?: boolean;            // có trục Y thứ 2 không
};
```

### 3.2 Cấu hình mặc định (thay thế 3 pane hardcode)

```ts
const DEFAULT_PANES: PaneDescriptor[] = [
  {
    id: "price", label: "Price", pinned: true, heightRatio: 0.50,
    series: [
      { type: "Candlestick" },
      { type: "EMA", params: { period: 20, color: "#2d9cdb" }, overlay: true },
      { type: "EMA", params: { period: 50, color: "#f2994a" }, overlay: true },
    ]
  },
  {
    id: "volume", label: "Volume", pinned: false, heightRatio: 0.27,
    series: [{ type: "Volume" }]
  },
  {
    id: "momentum", label: "RSI + MACD", pinned: false, heightRatio: 0.23,
    series: [{ type: "RSI" }, { type: "MACD" }]
  },
];
```

### 3.3 SeriesRegistry

Map từ `SeriesTypeId` → `{ component, calculator, defaultParams }`:

```ts
// Ví dụ entry
registry["CVD"] = {
  component: CVDSeries,
  calculator: calcCVDFromOHLCV,   // Phase 1: offline; Phase 4: từ WS
  defaultParams: {},
};
registry["Whale"] = {
  component: WhaleSeries,
  calculator: calcWhaleFromTrades,
  defaultParams: { threshold: 50_000 },
};
```

### 3.4 DataEnricher

Nhận `DemoDatum[]` (OHLCV) → trả về `EnrichedDatum[]` (OHLCV + tất cả indicator values):

```
OHLCV[] 
  → calcEMA(20) → calcEMA(50) 
  → calcRSI(14) 
  → calcMACD(12,26,9) 
  → calcBollingerBand(20,2) 
  → calcCVDApprox()        ← Phase 1
  → calcStrength()
  → [Phase 4] mergeWSCVD() ← override CVD với data WS thật
```

### 3.5 DynamicChart Renderer

Thay vì 3 `<Chart>` hardcode, render từ `panes.map()`:

```tsx
{panes.map((pane, i) => (
  <Chart
    key={pane.id}
    id={i + 1}
    height={heights[i]}
    origin={calcOrigin(i, heights)}
    yExtents={buildYExtents(pane, data)}
  >
    {buildYAxis(pane, axisStroke, axisTickFill)}
    {pane.series.map(s => renderSeries(s, data))}
    {i === panes.length - 1 && <XAxis ... />}
  </Chart>
))}
```

---

## 4. UI Controls

### 4.1 Dropdown (Add/Remove Series — trong pane)

Mỗi pane header có nút `+`:
- Click → picker dropdown show danh sách indicator available
- Click indicator → add `SeriesConfig` vào pane đó
- Indicator đã có trong pane → show checkmark, click lại để remove

### 4.2 Drag-and-Drop (Reorder pane)

Mỗi pane header có drag handle `⠿`:
- Kéo → ghost preview vị trí mới
- Drop → reorder `PaneDescriptor[]` array
- Price pane (`pinned: true`) → drag handle disabled, luôn ở slot 0
- Thư viện dùng: **HTML5 Drag API** (không cần thêm dependency)

### 4.3 Cả 2 cơ chế song song

- Dropdown (add series vào pane hiện có) **+** drag reorder (đổi vị trí pane)
- Hai cơ chế độc lập, không xung đột

### 4.4 Pane Header

```
[ ⠿ ]  RSI + MACD          [ + ]  [ × ]
```
- `⠿` = drag handle (ẩn với pinned pane)
- `+` = add series picker
- `×` = xóa pane (disabled với pinned pane)

---

## 5. Lộ trình thực hiện

### Phase 1 — Nền tảng (Priority: Cao)
- [ ] Định nghĩa types: `SeriesTypeId`, `SeriesConfig`, `PaneDescriptor`
- [ ] `SeriesRegistry` — map string → component
- [ ] `DataEnricher` — OHLCV → EnrichedDatum (CVD xấp xỉ, Strength Bull/Bear Power)
- [ ] `DynamicChart` renderer — `panes.map()` thay hardcode
- [ ] `useDynamicPanes` hook — quản lý `PaneDescriptor[]` + integrate `usePaneSizes`
- [ ] Tích hợp vào Terminal Demo, replace 3 pane cố định

### Phase 2 — Interactivity (Priority: Cao)
- [ ] Pane header UI (label + nút +/×)
- [ ] Add/Remove series dropdown picker
- [ ] Add pane mới (chọn loại pane từ danh sách)
- [ ] Remove pane (trừ pinned)

### Phase 3 — Drag Reorder (Priority: Trung bình)
- [ ] Drag handle trên pane header
- [ ] HTML5 Drag API reorder logic
- [ ] Visual ghost/placeholder khi drag
- [ ] Prevent reorder với pinned pane

### Phase 4 — Real-time Data (Priority: Trung bình)
- [ ] Binance `@trade` WebSocket handler
- [ ] CVD accumulator (bucket theo timeframe)
- [ ] Whale filter (threshold configurable)
- [ ] Merge WS data vào `EnrichedDatum[]`
- [ ] Auto-reconnect + reset khi đổi timeframe/symbol

---

## 6. Câu hỏi chưa chốt (cần thảo luận tiếp)

| # | Câu hỏi | Trạng thái |
|---|---|---|
| 1 | Ngưỡng Whale mặc định là bao nhiêu USD? | **Chưa chốt** |
| 2 | Strength dùng Bull/Bear Power (Elder) hay Relative Strength so BTC/index? | **Chưa chốt** |
| 3 | CVD Phase 1 dùng OHLCV xấp xỉ trước rồi Phase 4 WS override — có đồng ý không? | Đề xuất: Đồng ý |
| 4 | Số pane tối đa cho phép thêm? | **Chưa chốt** (đề xuất 6) |
| 5 | Persist layout pane vào localStorage không? (key mới tách biệt với pane height ratios) | **Chưa chốt** |
| 6 | Dark mode cho pane header UI — cần thiết kế riêng không? | Tự động theo --rsc-* tokens |

---

## 7. Files sẽ tạo/sửa (ước tính)

```
src/
  lib/
    core/
      types/
        pane-descriptor.ts       ← NEW: PaneDescriptor, SeriesConfig types
      registry/
        SeriesRegistry.ts        ← NEW: map SeriesTypeId → component + calculator
      calculators/
        calcCVD.ts               ← NEW: CVD từ OHLCV xấp xỉ
        calcStrength.ts          ← NEW: Bull/Bear Power
        calcWhale.ts             ← NEW: Whale filter từ trade stream
      hooks/
        useDynamicPanes.ts       ← NEW: quản lý PaneDescriptor[]
      DynamicChart.tsx           ← NEW: renderer panes.map()
      PaneHeader.tsx             ← NEW: header với drag handle + add/remove buttons
      SeriesPicker.tsx           ← NEW: dropdown picker indicator
  demo/
    LibraryShowcaseDemo.tsx      ← MODIFIED: dùng DynamicChart thay hardcode
    demo.css                     ← MODIFIED: thêm styles cho pane header
```

---

*Tài liệu này sẽ được cập nhật sau mỗi buổi thảo luận trước khi bắt đầu code.*
