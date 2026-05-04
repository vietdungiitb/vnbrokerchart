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

### 2.5 Strength (2 phương pháp — đã chốt)

**Phase 1 — Elder Bull/Bear Power** (offline, từ OHLCV + EMA):
$$BullPower = High - EMA(n)$$
$$BearPower = Low - EMA(n)$$
Hai đường riêng biệt trong cùng 1 pane, trục Y phải. Hiển thị dạng histogram: BullPower màu xanh (trên 0), BearPower màu đỏ (dưới 0).

**Phase 4 — Relative Strength vs BTC** (realtime, cần WS data BTC song song):
$$RS_i = \frac{\Delta price_{asset}}{\Delta price_{BTC}}$$
RS > 1: asset mạnh hơn BTC. RS < 1: yếu hơn. Hiển thị dạng line, baseline = 1.

Cả 2 phương pháp là 2 `SeriesTypeId` khác nhau trong registry (`"StrengthElder"` và `"StrengthRelative"`), user có thể add cả 2 vào cùng pane hoặc pane riêng.

---

## 3. Thiết kế Visual của từng Pane (đã chốt)

### 3.0 Layout anatomy một pane

```
┌─ gc-pane-label (tên pane, xoay dọc, ngoài cùng trái) ──────────────────────────────────┐
│                                                                                          │
│  [Tooltip top-left: OHLC / giá trị series tại crosshair]                                │
│                                                                                          │
│  Y-left │                                                    │ Y-right                  │
│  (trục  │         CANVAS AREA (series render ở đây)         │  (trục                   │
│   trái) │                                                    │   phải)                  │
│         │_____________________________________________ X (time) ─────────────────────── │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**Quy tắc:**
- **Luôn có 2 trục Y** (trái + phải). Nếu chỉ dùng 1 trục → trục còn lại hidden (width=0, không chiếm không gian).
- **Trục X (thời gian) đồng bộ** toàn bộ ChartCanvas — react-stockcharts đảm bảo điều này bởi vì tất cả `<Chart>` nằm trong cùng 1 `<ChartCanvas>`.
- **Tên pane** (label): render dưới dạng `<div>` xoay 90° bằng CSS (`writing-mode: vertical-rl; transform: rotate(180deg)`) nằm ngoài cùng bên trái mỗi pane, bên trái trục Y-left. **Không vẽ lên canvas**, render qua DOM overlay tuyệt đối (giống pattern splitter).
- **Tooltip top-left**: DOM overlay `position: absolute; top: N; left: 60px` (60px = margin-left của ChartCanvas). Hiển thị giá trị crosshair của tất cả series trong pane. Đã có pattern từ `<OHLCTooltip>` ở Price pane — cần nhân rộng cho các pane khác dưới dạng `<PaneTooltip>` generic.

### 3.1 Dual Y-Axis — Phân bổ series

Mỗi `SeriesConfig` khai báo mình thuộc trục nào:

```ts
// SeriesConfig — mô tả một series trong pane
type SeriesConfig = {
  type: SeriesTypeId;                 // "Candlestick"|"Volume"|"CVD"|"RSI"|"MACD"|"Strength"|"Whale"|"EMA"|...
  params?: Record<string, unknown>;  // { period: 20, color: "#2d9cdb", threshold: 50000 }
  yAxis: "left" | "right";           // BẮT BUỘC — series này dùng trục Y nào
  overlay?: boolean;                  // overlay trên series khác trong cùng pane
};
```

**Cách react-stockcharts handle dual Y-axis:**

react-stockcharts cho phép nhiều `<YAxis>` trong một `<Chart>`, phân biệt bằng `axisAt`:

```tsx
// Trục phải (primary)
<YAxis axisAt="right" orient="right" ... />

// Trục trái (secondary) — chỉ render khi có series dùng yAxis="left"
{hasLeftAxis && <YAxis axisAt="left" orient="left" ... />}
```

`yExtents` của Chart phải bao phủ tất cả series. Để dual scale độc lập (RSI 0-100 bên trái, Volume tuyệt đối bên phải), cần dùng **2 `<Chart>` riêng cùng origin/height** (react-stockcharts pattern cho dual scale). Đây là hạn chế kỹ thuật — xem mục 3.1a.

### 3.1a Hạn chế kỹ thuật Dual Scale trong react-stockcharts

`<Chart>` trong react-stockcharts dùng **một scale Y duy nhất** cho toàn bộ `yExtents`. Nếu 2 series có domain khác nhau (VD: RSI 0-100 và Volume 0-5000), chúng không thể share cùng scale.

**Giải pháp:**
- Mỗi "logical pane" trong mô hình của chúng ta = **1 hoặc 2 `<Chart>` thật** trong ChartCanvas:
  - 1 Chart nếu tất cả series có thể share scale (VD: Candlestick + EMA — cùng price domain)
  - 2 Chart chồng nhau (cùng `origin`, cùng `height`) nếu cần 2 scale độc lập

```
PaneDescriptor (logical) 
  → chartSlots: ChartSlot[]   ← 1 hoặc 2 Chart thật
  → mỗi ChartSlot có yExtents riêng + list series thuộc slot đó
```

`PaneDescriptor` sẽ có thêm field `splitScale?: boolean` — khi `true` tự động tách thành 2 Chart slot.

**Ví dụ:** Pane có RSI (0-100, trục trái) + Histogram delta (giá trị tuyệt đối, trục phải) → `splitScale: true`.

### 3.2 Data Model (cập nhật)

```ts
type SeriesConfig = {
  type: SeriesTypeId;
  params?: Record<string, unknown>;
  yAxis: "left" | "right";           // trục Y của series này
  overlay?: boolean;
  color?: string;                    // override màu mặc định từ registry
};

type PaneDescriptor = {
  id: string;
  label: string;                     // hiển thị dọc bên trái pane
  pinned?: boolean;                  // true = Price pane — không xóa, không reorder
  visible: boolean;                  // ẩn/hiện pane (khi hidden: height = 0, không render Chart)
  heightRatio: number;               // tỉ lệ khi visible; giữ nguyên khi hidden để restore
  series: SeriesConfig[];
  splitScale?: boolean;              // true = dùng 2 Chart thật cho 2 scale độc lập
  tooltip?: "ohlc" | "value" | "none"; // loại tooltip top-left
};
```

### 3.3 PaneLabel — Tên pane dọc

DOM overlay, không vẽ lên canvas:

```tsx
// Absolute overlay, positioned left of chartCanvas left margin
<div
  className="gc-pane-label"
  style={{ top: paneTop, height: paneHeight }}
>
  {pane.label}
</div>
```

```css
.gc-pane-label {
  position: absolute;
  left: 0;
  width: 18px;                  /* chiều ngang của chữ dọc */
  display: flex;
  align-items: center;
  justify-content: center;
  writing-mode: vertical-rl;
  transform: rotate(180deg);    /* chữ đọc từ dưới lên */
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--rsc-text-micro);
  pointer-events: none;
  user-select: none;
}
```

**Lưu ý:** `left margin` của ChartCanvas hiện tại là 60px. PaneLabel chiếm 18px trong 60px đó — không cần thay đổi margin canvas.

### 3.4 PaneTooltip — Tooltip top-left generic

Thay thế `<OHLCTooltip>` hardcode bằng `<PaneTooltip>` linh hoạt:

```tsx
type PaneTooltipEntry = {
  label: string;    // "O" | "H" | "L" | "C" | "CVD" | "RSI" | ...
  value: (datum: EnrichedDatum) => number | string | undefined;
  color?: string;
  format?: (v: number) => string;
};

<PaneTooltip
  entries={pane.tooltipEntries}    // từ registry của từng series
  xDisplayFormat={dateFormat}
/>
```

Với Price pane, `tooltipEntries` = OHLC + Volume → giống `<OHLCTooltip>` hiện tại.  
Với CVD pane, `tooltipEntries` = `[{ label: "CVD", value: d => d.cvd }]`.

---

## 4. Kiến trúc hệ thống Dynamic Pane

### 4.1 SeriesRegistry

Map từ `SeriesTypeId` → `{ component, calculator, defaultParams, defaultYAxis, tooltipEntry }`:

```ts
registry["CVD"] = {
  component: CVDSeries,
  calculator: calcCVDFromOHLCV,
  defaultParams: {},
  defaultYAxis: "right",
  tooltipEntry: (params) => ({ label: "CVD", value: d => d.cvd, format: format(".0f") }),
};
registry["Whale"] = {
  component: WhaleSeries,
  calculator: calcWhaleFromTrades,
  defaultParams: { threshold: 50_000 },
  defaultYAxis: "right",
  tooltipEntry: (params) => ({ label: "Whale", value: d => d.whaleDelta, format: format(".3s") }),
};
```

### 4.2 DataEnricher pipeline

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

### 4.3 DynamicChart Renderer

```tsx
{panes.map((pane, i) => {
  const slots = buildChartSlots(pane);  // 1 hoặc 2 ChartSlot
  return slots.map((slot, slotIdx) => (
    <Chart
      key={`${pane.id}-slot${slotIdx}`}
      id={chartIdCounter++}
      height={heights[i]}
      origin={calcOrigin(i, heights)}
      yExtents={slot.yExtents}
    >
      {slot.showLeftAxis  && <YAxis axisAt="left"  orient="left"  ... />}
      {slot.showRightAxis && <YAxis axisAt="right" orient="right" ... />}
      {slot.series.map(s => renderSeries(s, data))}
      {i === panes.length - 1 && slotIdx === 0 && <XAxis ... />}
      <PaneTooltip entries={buildTooltipEntries(slot.series)} ... />
    </Chart>
  ));
})}

{/* DOM overlays — ngoài ChartCanvas */}
{panes.map((pane, i) => (
  <PaneLabel key={pane.id} label={pane.label} top={calcPaneTop(i)} height={heights[i]} />
))}
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

### 4.0 Ràng buộc số pane (đã chốt)

| Ràng buộc | Giá trị |
|---|---|
| **Số pane tối thiểu hiển thị** | 1 (luôn là Price pane — pinned) |
| **Số pane tối đa** | 3 |
| **Price pane** | Luôn visible, không ẩn được, không xóa được |

**Hệ quả logic:**
- Khi đang có 3 pane → nút "Add pane" bị disable
- Khi đang có 1 pane visible (Price) → nút "Add pane" available (còn slot)
- Pane có thể ở trạng thái `visible: false` (ẩn) mà không mất cấu hình — slot đó không chiếm không gian trên canvas
- Khi ẩn pane thứ 2 hoặc 3 → `usePaneSizes` redistribute height cho các pane đang visible

### 4.1 Toggle ẩn/hiện pane (đã chốt)

Pane header có nút **`👁`** (eye icon) để ẩn/hiện:

```
[ ⠿ ]  RSI + MACD     [ 👁 ]  [ + ]  [ × ]
```

**Hành vi:**
- Click 👁 khi `visible: true` → `visible: false`:
  - Pane không render `<Chart>` (không chiếm canvas height)
  - `heightRatio` giữ nguyên trong state (để khi show lại, restore đúng tỉ lệ cũ)
  - `usePaneSizes` chỉ nhận các pane `visible: true` để phân bổ height
  - **Không hiện collapsed strip** — pane ẩn hoàn toàn, restore qua menu "Add pane"
  - Splitter của pane đó ẩn đi
- Click 👁 khi `visible: false` → `visible: true`:
  - Restore `heightRatio` cũ
  - Nếu tổng ratio visible > 1 sau restore → normalize lại
- Price pane (`pinned: true`) → nút 👁 disabled (không cho ẩn)

### 4.2 Add pane — menu restore hidden pane

Nút `+` ở **topbar** (hoặc sidebar) → mở menu:
- Danh sách loại pane có thể add: Volume, CVD, RSI+MACD, Strength, Whale...
- Nếu pane loại đó đang hidden → hiện mục "Restore [tên pane]" thay vì "Add mới"
- Nếu đã có 3 visible pane → các mục add mới bị disabled (chỉ còn option restore hidden pane)

### 4.3 Dropdown (Add/Remove Series — trong pane)

Mỗi pane header có nút `+`:
- Click → picker dropdown show danh sách indicator available
- Click indicator → add `SeriesConfig` vào pane đó
- Indicator đã có trong pane → show checkmark, click lại để remove

### 4.3 Drag-and-Drop (Reorder pane)

Mỗi pane header có drag handle `⠿`:
- Kéo → ghost preview vị trí mới
- Drop → reorder `PaneDescriptor[]` array
- Price pane (`pinned: true`) → drag handle disabled, luôn ở slot 0
- Thư viện dùng: **HTML5 Drag API** (không cần thêm dependency)
- Chỉ reorder các pane `visible: true` — pane ẩn không tham gia drag

### 4.4 Cả 2 cơ chế song song

- Dropdown (add series vào pane hiện có) **+** drag reorder (đổi vị trí pane)
- Hai cơ chế độc lập, không xung đột

### 4.5 Pane Header (full layout)

```
[ ⠿ ]  RSI + MACD               [ 👁 ]  [ + ]  [ × ]
```

| Control | Pinned pane | Pane thường | Pane hidden |
|---|---|---|---|
| `⠿` drag handle | Hidden | Visible | Hidden |
| `👁` toggle | Disabled | Active | Active (để restore) |
| `+` add series | Active | Active | Active (edit config khi ẩn) |
| `×` xóa pane | Hidden | Active (nếu < max) | Active |

---

## 5. Lộ trình thực hiện

### Phase 1 — Nền tảng + Header tối giản (Priority: Cao)
- [ ] Định nghĩa types: `SeriesTypeId`, `SeriesConfig`, `PaneDescriptor` (có `visible`)
- [ ] `SeriesRegistry` — map string → component + calculator
- [ ] `DataEnricher` — upfront: OHLCV → EnrichedDatum (CVD xấp xỉ, Strength Elder, Whale threshold $50k)
- [ ] `useDynamicPanes` hook — quản lý `PaneDescriptor[]`, enforce max=3 visible, toggle visible, localStorage persist, nút reset default, integrate `usePaneSizes` chỉ với visible panes
- [ ] `DynamicChart` renderer — `panes.filter(p => p.visible).map()` thay hardcode
- [ ] `PaneHeader` tối giản — hover overlay, label + 👁 + ×
- [ ] `PaneLabel` dọc bên trái (DOM overlay)
- [ ] `PaneTooltip` generic thay `OHLCTooltip` hardcode
- [ ] Tích hợp vào Terminal Demo, replace 3 pane cố định

### Phase 2 — Interactivity đầy đủ (Priority: Cao)
- [ ] Dropdown picker add/remove series trong pane (nút + trên pane header)
- [ ] Menu add pane / restore hidden pane (topbar hoặc sidebar)
- [ ] Nút "Reset mặc định" → xóa localStorage, restore DEFAULT_PANES
- [ ] Strength Phase 1 Elder hiển thị trong pane

### Phase 3 — Drag Reorder (Priority: Trung bình)
- [ ] Drag handle trên pane header (chỉ visible pane)
- [ ] HTML5 Drag API reorder logic
- [ ] Visual ghost/placeholder khi drag
- [ ] Prevent reorder với pinned pane

### Phase 4 — Real-time Data (Priority: Trung bình)
- [ ] Binance `@trade` WebSocket handler
- [ ] CVD accumulator thật (bucket theo timeframe), replace CVD xấp xỉ
- [ ] Whale filter ($50,000 USD threshold, configurable)
- [ ] Strength Relative vs BTC (WS data BTC song song)
- [ ] Merge WS data vào `EnrichedDatum[]`
- [ ] Auto-reconnect + reset khi đổi timeframe/symbol

---

## 6. Câu hỏi chưa chốt (cần thảo luận tiếp)

| # | Câu hỏi | Trạng thái |
|---|---|---|
| 1 | Ngưỡng Whale mặc định | **Đã chốt: $50,000 USD/trade** (linh hoạt hơn quantity) |
| 2 | Strength dùng phương pháp nào | **Đã chốt: CẢ HAI** — Elder Phase 1 (offline), Relative vs BTC Phase 4 (realtime) |
| 3 | CVD Phase 1 OHLCV xấp xỉ, Phase 4 WS override | **Đã chốt: Đồng ý** |
| 4 | Số pane tối đa | **Đã chốt: 3 visible** |
| 5 | Số pane tối thiểu | **Đã chốt: 1 (Price pinned)** |
| 6 | Persist layout vào localStorage | **Đã chốt: CÓ** — kèm nút "Reset mặc định" |
| 7 | Dark mode cho pane header UI | **Đã chốt: Tự động** theo `--rsc-*` tokens |
| 8 | Collapsed hidden pane strip | **Đã chốt: KHÔNG hiện strip** — restore qua menu "Add pane" |
| B1 | Pane header nằm ở đâu | **Đã chốt: Hiện khi hover** vào pane (không chiếm chiều cao canvas) |
| C3 | DataEnricher tính khi nào | **Đã chốt: Upfront** — tính tất cả khi load, lazy nâng cấp sau |
| E1 | Phase 1 có pane header UI không | **Đã chốt: CÓ** — tối giản (label + 👁 + ×) |

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
