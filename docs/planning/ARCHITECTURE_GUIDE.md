# Dynamic Pane System — Hướng dẫn kiến trúc

> Phiên bản: 1.0 · Branch: `dev`  
> Đọc bắt buộc trước khi code bất kỳ slice nào.

---

## 1. Tổng quan data flow

```
Data Sources
  ├── fetchData() → RawOHLCV[]         (HTTP, Phase 1)
  └── BinanceTradeWS                   (WebSocket, Phase 4)
            │
            ▼
      enrichData(raw)
            │
      EnrichedDatum[]                  (useMemo, tái tính khi data thay đổi)
            │
            ▼
      useDynamicPanes(totalHeight)
            │
       PaneDescriptor[]  +  heights[]  +  actions{}
            │
            ▼
      DynamicChart
            │
      buildChartSlots(pane)            → ChartSlot[] (1 hoặc 2 per pane)
            │
            ▼
      <ChartCanvas>
        <Chart id=1 height={h0}>       ← Price pane, slot 0
          <YAxis right>
          <CandlestickSeries>
          <EMAIndicator>
          <PaneTooltip>
        </Chart>
        <Chart id=2 height={h1}>       ← Volume pane, slot 0
          <YAxis right>
          <BarSeries volume>
        </Chart>
        <Chart id=3 height={h2}>       ← Momentum pane, slot 0 (RSI, left scale)
          <YAxis left>
          <RSISeries>
        </Chart>
        <Chart id=4 height={h2}>       ← Momentum pane, slot 1 (MACD, right scale)
          <YAxis right>                  (cùng origin & height với Chart id=3)
          <MACDSeries>
          <XAxis bottom>               ← Chỉ ở slot cuối cùng của pane cuối cùng
        </Chart>
      </ChartCanvas>
```

---

## 2. Component hierarchy

```
LibraryShowcaseDemo
  ├── TopBar
  │     ├── CandlestickButton
  │     ├── SettingsGearButton → opens PaneSettingsModal
  │     ├── ReplayButton
  │     ├── CompareButton
  │     ├── AddPaneButton → AddPaneMenu (S2.2)
  │     └── ThemeToggleButton
  │
  └── ChartShell (div.gc-chart-shell)
        ├── PaneWrap (div.rsc-pane-wrap) × N visible panes
        │     ├── PaneLabel (position absolute, left=0)
        │     ├── PaneHeader (position absolute, hover overlay) ← S1.7
        │     │     ├── label span
        │     │     ├── [+] button → pane-local composer in PaneSettingsModal ← S2.1
        │     │     ├── [👁] button → toggleVisible()
        │     │     └── [×] button → removePane() (hidden nếu pinned)
        │     └── [ChartCanvas area]
        │
        ├── ChartSplitter × (N-1)     ← drag resize between panes
        │
        ├── ChartCanvas
        │     └── DynamicChart (renders <Chart> slots)
        │
        └── PaneSettingsModal (modal overlay, top-right gear icon)
```

---

## 3. Bẫy kỹ thuật react-stockcharts — ĐỌC KỸ

### 3.1 Canvas không repaint tự động

**Vấn đề:** react-stockcharts render trên `<canvas>`. Khi state thay đổi (theme, heights), canvas **không repaint** vì `ChartCanvas` không nhận biết thay đổi.

**Giải pháp:** Dùng `key` prop để force remount toàn bộ `ChartCanvas`:

```tsx
<ChartCanvas
  key={`${visiblePanes.map(p => p.id).join("-")}-${theme}-${heights.join("-")}`}
  // ...
/>
```

**Rule:** Bất cứ thứ gì ảnh hưởng đến layout canvas (panes visible, heights, theme) phải vào `key`. Sẽ gây unmount/remount — acceptable vì ChartCanvas có animation.

### 3.2 Mỗi `<Chart>` chỉ có 1 Y scale

**Vấn đề:** RSI (0-100) và MACD (tuyệt đối, có thể âm) không thể dùng chung scale. Nếu nhét vào cùng 1 `<Chart>`, scale bị distorted.

**Giải pháp: `splitScale: true` → 2 `<Chart>` chồng nhau**

```tsx
// Slot 0: RSI (left scale)
<Chart id={id++} height={h} origin={origin}>
  <YAxis axisAt="left" orient="left" ticks={5} />
  <RSISeries yAccessor={d => d.rsi} />
</Chart>

// Slot 1: MACD (right scale) — CÙNG origin và height
<Chart id={id++} height={h} origin={origin}>
  <YAxis axisAt="right" orient="right" ticks={5} />
  <MACDSeries yAccessor={...} />
</Chart>
```

**Kết quả:** 2 Chart chồng nhau, mỗi chart có scale riêng. YAxis trái/phải độc lập.

**Khi chỉ có 1 series:** Ẩn axis không dùng bằng `width={0}` thay vì xóa:
```tsx
<YAxis axisAt="left" orient="left" width={hasLeftAxis ? 55 : 0} />
```

### 3.3 Pointer events trên canvas

**Vấn đề:** Canvas bắt tất cả mouse events. `ChartSplitter` và `PaneHeader` phải nằm **ngoài** ChartCanvas DOM element.

**Giải pháp:** `PaneHeader` là `position: absolute` trên wrapper div, nằm ngoài ChartCanvas. ChartSplitter tương tự.

### 3.4 Chart id phải unique và ổn định

Chart `id` phải là integer duy nhất trong cùng một `ChartCanvas`. Nếu pane list thay đổi (add/remove), id assignment phải ổn định — dùng counter tăng dần trong mỗi render của DynamicChart.

### 3.5 `origin` tính toán

`origin` trong react-stockcharts là function `(w, h) => [x, y]` với `h` là **tổng height của ChartCanvas**. Để đặt Chart ở vị trí pane thứ `i`:

```tsx
origin={(_w, _h) => [0, marginTop + sumOfPreviousHeights]}
```

Không dùng `h` từ ChartCanvas (đó là tổng), dùng sum heights slice:

```tsx
const paneTop = (i: number) => {
  const margin = 8; // ChartCanvas default margin
  return margin + heights.slice(0, i).reduce((a, b) => a + b, 0);
};
```

### 3.6 `xAccessor` vs `displayXAccessor` — phân biệt bắt buộc

react-stockcharts dùng 2 loại accessor khác nhau:

- **`xAccessor`**: trả về **index số** sau khi đã loại bỏ gaps (dùng `discontinuousTimeScaleProvider`). Đây là giá trị tính toán scale.
- **`displayXAccessor`**: trả về **Date** gốc để hiển thị trên tooltip và XAxis.

```tsx
const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date);
const { data: scaledData, xScale, xAccessor, displayXAccessor } = xScaleProvider(rawData);

// ĐÚNG: pass scaledData, không phải rawData
<ChartCanvas data={scaledData} xAccessor={xAccessor} displayXAccessor={displayXAccessor} ... />

// SAI: nếu pass rawData với xAccessor = d => d.date → scale bị lỗi khi có weekend gaps
```

**Hệ quả cho EnrichedDatum:** `enrichData()` phải nhận và trả về data đã qua `xScaleProvider` transform, hoặc `DynamicChart` phải tự apply transform trước khi pass vào `ChartCanvas`.

### 3.7 `ChartCanvas` width phải là pixel integer — đo bằng ResizeObserver

`ChartCanvas` không hỗ trợ CSS `width`. Phải đo container width bằng ResizeObserver rồi pass giá trị số:

```tsx
const containerRef = useRef<HTMLDivElement>(null);
const [width, setWidth] = useState(0);

useEffect(() => {
  const obs = new ResizeObserver(entries => {
    setWidth(Math.floor(entries[0].contentRect.width));
  });
  obs.observe(containerRef.current!);
  return () => obs.disconnect();
}, []);

<div ref={containerRef}>
  {width > 0 && <ChartCanvas width={width} ... />}
</div>
```

**Lưu ý:** Render `ChartCanvas` chỉ khi `width > 0`. Nếu width = 0 → crash hoặc blank canvas.

### 3.8 `yExtents` với accessor trả về `undefined` — tránh `NaN`

react-stockcharts xử lý `undefined` từ accessor bằng cách ignore datum đó khi tính scale. `NaN` thì **không** — gây scale broken hoàn toàn.

```tsx
// ĐÚNG — trả về undefined thay vì NaN
yExtents={[d => d.ema20, d => d.ema50]}       // undefined ok cho bars đầu

// SAI — nếu giá trị tính toán cho ra NaN
yExtents={d => d.high - d.low === 0 ? NaN : d.close / (d.high - d.low)}
// Fix: thêm guard
yExtents={d => d.high - d.low === 0 ? undefined : d.close / (d.high - d.low)}
```

Với Bollinger Band (accessor trả về object):
```tsx
// Phải destructure thành từng accessor riêng
yExtents={[d => d.bollingerBand?.top, d => d.bollingerBand?.bottom]}
```

### 3.9 `ChartCanvas` chỉ accept `<Chart>` làm children trực tiếp

DOM elements (div, span) bên trong `ChartCanvas` → undefined behavior hoặc crash. **Mọi DOM overlay phải nằm ngoài `ChartCanvas`.**

```tsx
// ĐÚNG
<div style={{ position: "relative" }}>
  <PaneHeader ... />        {/* DOM overlay — ngoài ChartCanvas */}
  <ChartCanvas ...>
    <Chart ...>...</Chart>  {/* chỉ Chart bên trong */}
  </ChartCanvas>
</div>

// SAI
<ChartCanvas ...>
  <div class="overlay">...</div>  {/* crash */}
  <Chart ...>...</Chart>
</ChartCanvas>
```

### 3.10 `<MouseCoordinateY>` cần `displayFormat` và `rectWidth` tường minh

Nếu không pass `displayFormat`, một số chart types gây console warning hoặc hiển thị `[object Object]`. Luôn khai báo tường minh:

```tsx
<MouseCoordinateY
  at="right"
  orient="right"
  displayFormat={format(".2f")}
  rectWidth={64}
/>
```

Với pane có scale khác (RSI 0-100, CVD lớn) → điều chỉnh `displayFormat` phù hợp:
- RSI: `format(".1f")` (1 decimal)
- CVD: `format(".3s")` (SI prefix: "1.2M", "300k")

### 3.11 `<Chart>` id counter phải reset mỗi render cycle — không dùng global

```tsx
// SAI — biến global, không reset → id trùng sau remount
let globalChartId = 1;

// ĐÚNG — reset mỗi lần DynamicChart render
const DynamicChart = ({ panes, ... }) => {
  let chartId = 1;  // local variable, reset every render
  return (
    <>
      {panes.flatMap(pane => buildChartSlots(pane).map(slot => (
        <Chart id={chartId++} ... />  // luôn sequential từ 1
      )))}
    </>
  );
};
```

**Tại sao quan trọng:** react-stockcharts dùng `id` để register Chart vào ChartCanvas context. Nếu id trùng → crosshair, tooltip, event dispatch bị sai chart.

### 3.12 Phase 4: WebSocket event — không setState trực tiếp, phải batch

Binance `@trade` stream gửi hàng nghìn events/giây. `setState` mỗi event → React render storm → UI freeze.

**Pattern bắt buộc — buffer 250ms:**

```tsx
const tradeBuffer = useRef<TradeEvent[]>([]);
const flushTimerRef = useRef<ReturnType<typeof setInterval>>();

// Trong WS onTrade callback:
const handleTrade = useCallback((event: TradeEvent) => {
  tradeBuffer.current.push(event);
}, []);

// Batch flush mỗi 250ms:
useEffect(() => {
  flushTimerRef.current = setInterval(() => {
    const events = tradeBuffer.current.splice(0);  // drain buffer
    if (events.length === 0) return;
    setEnrichedData(prev => mergeTradeEvents(prev, events));
  }, 250);
  return () => clearInterval(flushTimerRef.current);
}, []);
```

**Không** dùng `useEffect` với dependency array là buffer — React không track `ref.current` mutations.

### 3.13 Indicator SSOT — quy định bắt buộc

Indicator trong dự án này phải tuân thủ **Single Source of Truth**.

- Cùng `indicatorType + source + timeframe + transform + params` phải cho ra cùng một canonical series.
- Pane, `yAxis`, template render, theme, và layout chỉ là presentation layer.
- `DynamicChart`, tooltip, `yExtents`, computed values, settings preview không được đọc từ các nguồn khác nhau cho cùng một indicator instance.

Tài liệu chuẩn: [INDICATOR_SSOT_POLICY.md](INDICATOR_SSOT_POLICY.md)

---

## 4. `useDynamicPanes` State Machine

```
State: { panes: PaneDescriptor[] }
Derived: visiblePanes = panes.filter(p => p.visible)

Constraints always enforced:
  - panes[0].pinned === true (Price, không bao giờ thay đổi)
  - visiblePanes.length >= 1 (Price luôn visible)
  - visiblePanes.length <= PANE_MAX_VISIBLE (3)
  - sum(visiblePanes.heightRatio) === 1.0 (normalize sau mỗi thay đổi)

Transitions:
  toggleVisible(id)
    GUARD: pane.pinned → reject
    GUARD: visible && visiblePanes.length === 1 → reject (last visible)
    → pane.visible = !pane.visible
    → normalizeRatios()   [redistribute height pro-rata]

  addPane(desc)
    GUARD: visiblePanes.length >= PANE_MAX_VISIBLE → reject
    → new pane với id = uuid(), visible = true
    → normalizeRatios()

  removePane(id)
    GUARD: pane.pinned → reject
    → panes.filter(p => p.id !== id)
    → normalizeRatios() trong visible set còn lại

  restorePane(id)
    GUARD: visiblePanes.length >= PANE_MAX_VISIBLE → reject (không hiện nếu đã đủ)
    → pane.visible = true
    → normalizeRatios()

  applyDelta(splitterIndex, deltaY)
    → điều chỉnh heightRatio của visible[splitterIndex] và visible[splitterIndex+1]
    → min height guard: 80px per pane
    → normalizeRatios()

  resetToDefault()
    → panes = DEFAULT_PANES (deep clone)
    → localStorage.removeItem(PANE_LAYOUT_STORAGE_KEY)

normalizeRatios():
  total = sum(visiblePanes.heightRatio)
  visiblePanes.forEach(p => p.heightRatio /= total)
```

---

## 5. localStorage Schema

### Key: `rsc-pane-layout-v1`

```typescript
type StoredLayout = {
  version: 1;
  panes: Array<{
    id: string;
    label: string;
    pinned: boolean;
    visible: boolean;
    heightRatio: number;
    series: SeriesConfig[];
    splitScale: boolean;
    tooltip: TooltipMode;
  }>;
};
```

**Validation khi load:**
- `version !== 1` → discard, dùng DEFAULT_PANES
- `panes[0].pinned !== true` → discard (invariant violation)
- `panes` rỗng → discard
- JSON parse throw → discard

### Key: `rsc-chart-theme` (đã có từ useChartTheme)

```
"light" | "dark"
```

### Key: `rsc-demo-panes-v1` (DEPRECATED sau S1.8)

Key cũ của `usePaneSizes`. Sau khi `useDynamicPanes` take over, key này không còn dùng. Có thể để lại (không cleanup cần thiết).

---

## 6. CSS Custom Properties & Theming

### Hierarchy

```
:root / [data-chart-theme="light"]    ←  --rsc-* tokens (lib/styles/chart-theme.css)
                                          mapped to --gc-* (demo.css)
[data-chart-theme="dark"]             ←  dark overrides
```

### Classes naming convention

| Prefix | Scope | Ví dụ |
|--------|-------|-------|
| `rsc-` | Library (`src/lib/`) | `.rsc-pane-header`, `.rsc-pane-label` |
| `gc-`  | Demo (`src/demo/`) | `.gc-topbar-btn`, `.gc-terminal` |

**Không dùng `gc-` trong lib components.**

### Pane-specific CSS variables (optional, Phase 2+)

```css
/* Mỗi pane có thể có màu accent riêng */
.rsc-pane-wrap[data-pane-id="price"]    { --rsc-pane-accent: var(--rsc-green); }
.rsc-pane-wrap[data-pane-id="volume"]   { --rsc-pane-accent: var(--rsc-blue-dim); }
.rsc-pane-wrap[data-pane-id="momentum"] { --rsc-pane-accent: var(--rsc-purple); }
```

---

## 7. SeriesRegistry — Cách thêm series mới

```typescript
// Ví dụ thêm CCI indicator (không có trong Phase 1 plan)
import { CCISeries } from "../../series/CCISeries";

registerSeries("CCI", {
  component: CCISeries,
  defaultParams: { period: 20 },
  defaultYAxis: "left",
  yExtentsAccessors: [d => d.cci],
  tooltipEntry: (cfg) => ({
    label: `CCI(${cfg.params?.period ?? 20})`,
    format: v => v.toFixed(0),
    accessor: d => d.cci,
  }),
});
```

**Để series xuất hiện trong SeriesPicker:** Đảm bảo type được thêm vào `SeriesTypeId` union (S1.1).

---

## 8. Enriched Data — Accessor functions

Mọi accessor phải **handle undefined** vì không phải datum nào cũng có đủ indicator (ví dụ: EMA20 undefined cho 19 bars đầu tiên):

```typescript
// ĐÚNG
yExtents={[d => d.ema20, d => d.ema50].map(fn => d => fn(d) ?? 0)}

// SAI — sẽ gây lỗi scale nếu datum ban đầu undefined
yExtents={d => d.ema20}
```

Với Bollinger Band (trả về object):
```typescript
yExtents={[d => d.bollingerBand?.top, d => d.bollingerBand?.bottom]}
```

---

## 9. Sizing & Margins

```
ChartCanvas.margin = { left: 60, right: 68, top: 8, bottom: 30 }
                              │               │
                        YAxis right       YAxis left
                        (60px default)    (68px when both axes present)

ChartCanvas.height = sum(heights) + 38   // marginTop(8) + marginBottom(30)
ChartCanvas.width  = containerWidth       // measured với react-measure hoặc ResizeObserver
```

**PaneLabel** chiếm 18px trong phần `margin.left = 60px`.  
**PaneHeader** chiếm `left: 60px, right: 68px` (trong chart area).

---

## 10. Binance WebSocket (Phase 4)

**Endpoint:** `wss://stream.binance.com/ws/<symbol>@trade`  
**Message format:**
```json
{
  "e": "trade",
  "T": 1699000000000,
  "s": "BTCUSDT",
  "p": "35000.00",
  "q": "0.001",
  "m": false
}
```
`m = false` → buyer là maker → **sell** từ góc nhìn market  
`m = true` → buyer là taker → **buy** từ góc nhìn market  
`dollarValue = parseFloat(p) * parseFloat(q)`  
Whale threshold: `dollarValue >= 50_000`

**Security:** Không cần API key. Stream là public read-only. Không gửi credential lên WS.

---

## 11. Performance Guidelines

- `enrichData()` phải nằm trong `useMemo` phụ thuộc vào `rawData`
- `DynamicChart` không được render lại khi actions (toggleVisible) không làm thay đổi `visiblePanes` hay `heights`
- `useDynamicPanes` — dùng `useCallback` cho tất cả action functions
- `ChartSplitter` dùng `pointer capture` — không cần global mouseup listener
- Phase 4: Trade events không được trực tiếp setState — buffer 250ms + batch update

---

## 12. Naming convention summary

| Thứ | Convention | Ví dụ |
|----|-----------|-------|
| Hook | `use` + PascalCase | `useDynamicPanes` |
| Type/Interface | PascalCase | `PaneDescriptor`, `SeriesConfig` |
| SeriesTypeId | PascalCase string | `"CVDApprox"`, `"StrengthElder"` |
| CSS class lib | `rsc-` + kebab | `.rsc-pane-header__label` |
| CSS class demo | `gc-` + kebab | `.gc-topbar-btn` |
| localStorage key | `rsc-` + kebab + `-v1` | `rsc-pane-layout-v1` |
| Calculator file | `calc` + PascalCase | `calcCVDApprox.ts` |
| Enriched field | camelCase | `cvdApprox`, `bullPower`, `whaleBuyVol` |
