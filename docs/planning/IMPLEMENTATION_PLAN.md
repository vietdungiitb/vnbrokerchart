# Dynamic Pane System — Kế hoạch thực hiện chi tiết

> Phiên bản: 1.0 · Ngày: 2026-05-04 · Branch target: `dev`  
> Tham chiếu: `docs/planning/DYNAMIC_PANE_SYSTEM.md`  
> Đọc kèm: `docs/planning/ARCHITECTURE_GUIDE.md`, `docs/planning/AUDIT_PROTOCOL.md`

---

## Quy tắc chung cho team code

1. **Không code nếu chưa đọc ARCHITECTURE_GUIDE.md** — đặc biệt phần bẫy kỹ thuật react-stockcharts.
2. **Mỗi slice hoàn thành → chạy `npx tsc --noEmit` trước khi sang slice tiếp.**
3. **Mỗi slice hoàn thành → điền evidence vào AUDIT_PROTOCOL.md phần tương ứng.**
4. **Không thay đổi API public đã định nghĩa ở S1.1 mà không cập nhật tài liệu.**
5. **Commit message format:** `feat(slice-X.Y): <mô tả ngắn>` hoặc `fix(slice-X.Y): <mô tả>`.
6. **Không merge vào `main` cho đến khi Phase 1 + Phase 2 pass toàn bộ audit checklist.**
7. **Indicator phải tuân thủ SSOT:** cùng `source + timeframe + transform + indicatorType + params` phải dùng cùng canonical series. Xem [INDICATOR_SSOT_POLICY.md](INDICATOR_SSOT_POLICY.md).

---

## Tổng quan phases và dependencies

```
Phase 1 (Nền tảng)
  S1.1 Types ──────────────────────────────────────────┐
  S1.2 SeriesRegistry ← S1.1                           │
  S1.3 DataEnricher   ← S1.1                           │
  S1.4 useDynamicPanes← S1.1, S1.3                     │
  S1.5 DynamicChart   ← S1.1, S1.2, S1.4               ├── Phase 2
  S1.6 DOM Overlays   ← S1.1, S1.5                     │
  S1.7 PaneHeader     ← S1.1, S1.4, S1.6               │
  S1.8 Integration    ← tất cả S1.x                    │

Phase 2 (Interactivity)
  S2.1 SeriesPicker   ← S1.2, S1.7
  S2.2 AddPane Menu   ← S1.4, S2.1
  S2.3 Reset Default  ← S1.4
  S2.4 Full Header    ← S2.1, S2.2, S2.3

Phase 3 (Drag Reorder)
  S3.1 DnD Reorder    ← Phase 2 complete

Phase 4 (Real-time WS)
  S4.1 WS Handler     ← S1.3
  S4.2 CVD Real-time  ← S4.1
  S4.3 Whale Real-time← S4.1
  S4.4 Strength RS    ← S4.1
```

---

## PHASE 1 — Nền tảng + Header tối giản

### S1.1 — Types & Data Model

**Mục tiêu:** Định nghĩa toàn bộ TypeScript types được dùng xuyên suốt hệ thống.

**File tạo mới:** `src/lib/core/types/pane-descriptor.ts`

**Nội dung bắt buộc:**

```typescript
// ── Series ───────────────────────────────────────────────────────────────────

export type SeriesTypeId =
  | "Candlestick" | "HollowCandle" | "OHLC" | "HeikinAshi"
  | "Line" | "Area" | "Bar"
  | "Volume"
  | "EMA" | "BollingerBand"
  | "RSI" | "MACD"
  | "CVDApprox"          // Phase 1: từ OHLCV
  | "CVDRealtime"        // Phase 4: từ WS @trade
  | "StrengthElder"      // Phase 1: Bull/Bear Power
  | "StrengthRelative"   // Phase 4: RS vs BTC
  | "Whale";             // Phase 1 approx / Phase 4 realtime

export type YAxisSide = "left" | "right";

export interface SeriesConfig {
  type: SeriesTypeId;
  params?: Record<string, unknown>;  // { period: 14, color: "#2d9cdb", ... }
  yAxis: YAxisSide;
  overlay?: boolean;                 // true = overlay trên series khác cùng pane
  color?: string;                    // override màu mặc định từ registry
}

// ── Pane ─────────────────────────────────────────────────────────────────────

export type TooltipMode = "ohlc" | "value" | "none";

export interface PaneDescriptor {
  id: string;                        // unique, ví dụ "price" | "volume" | uuid
  label: string;                     // tên hiển thị dọc bên trái
  pinned: boolean;                   // true = Price pane, không xóa/ẩn/reorder
  visible: boolean;                  // false = ẩn hoàn toàn (không render Chart)
  heightRatio: number;               // tỉ lệ chiều cao (tổng visible = 1.0)
  series: SeriesConfig[];
  splitScale: boolean;               // true = 2 Chart thật chồng nhau (dual scale)
  tooltip: TooltipMode;
}

// ── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_PANES: PaneDescriptor[] = [
  {
    id: "price",
    label: "Price",
    pinned: true,
    visible: true,
    heightRatio: 0.55,
    splitScale: false,
    tooltip: "ohlc",
    series: [
      { type: "Candlestick", yAxis: "right" },
      { type: "EMA", params: { period: 20, color: "#2d9cdb" }, yAxis: "right", overlay: true },
      { type: "EMA", params: { period: 50, color: "#f2994a" }, yAxis: "right", overlay: true },
      { type: "BollingerBand", params: { period: 20, stdDev: 2 }, yAxis: "right", overlay: true },
    ],
  },
  {
    id: "volume",
    label: "Volume",
    pinned: false,
    visible: true,
    heightRatio: 0.25,
    splitScale: false,
    tooltip: "value",
    series: [
      { type: "Volume", yAxis: "right" },
    ],
  },
  {
    id: "momentum",
    label: "RSI+MACD",
    pinned: false,
    visible: true,
    heightRatio: 0.20,
    splitScale: true,   // RSI và MACD có domain khác nhau
    tooltip: "value",
    series: [
      { type: "RSI", params: { period: 14 }, yAxis: "left" },
      { type: "MACD", params: { fast: 12, slow: 26, signal: 9 }, yAxis: "right" },
    ],
  },
];

// ── Storage ───────────────────────────────────────────────────────────────────

export const PANE_LAYOUT_STORAGE_KEY = "rsc-pane-layout-v1";
export const PANE_MAX_VISIBLE = 3;
```

**File sửa:** `src/lib/core/index.ts` — thêm export:
```typescript
export type { SeriesTypeId, YAxisSide, SeriesConfig, PaneDescriptor, TooltipMode } from "./types/pane-descriptor";
export { DEFAULT_PANES, PANE_LAYOUT_STORAGE_KEY, PANE_MAX_VISIBLE } from "./types/pane-descriptor";
```

**File sửa:** `src/index.ts` — thêm re-export từ `./lib/core`.

**Acceptance criteria:**
- [ ] `npx tsc --noEmit` pass
- [ ] Không có `any` type không rõ lý do
- [ ] `DEFAULT_PANES` sum heightRatio của visible panes = 1.0

---

### S1.2 — SeriesRegistry

**Mục tiêu:** Map từ `SeriesTypeId` → `{ component, defaultParams, defaultYAxis, yExtentsAccessor, tooltipEntry }`. Registry là điểm duy nhất thêm series type mới.

**File tạo mới:** `src/lib/core/registry/SeriesRegistry.ts`

**Nội dung bắt buộc:**

```typescript
import type { SeriesTypeId, SeriesConfig } from "../types/pane-descriptor";
import type { EnrichedDatum } from "../calculators/types";

export interface TooltipEntryDef {
  label: string;
  color?: string;
  format: (v: number) => string;
  accessor: (d: EnrichedDatum) => number | undefined;
}

export interface RegistryEntry {
  component: React.ComponentType<any>;       // Series component
  defaultParams: Record<string, unknown>;
  defaultYAxis: "left" | "right";
  // Hàm tính yExtents từ datum (dùng cho Chart yExtents prop)
  yExtentsAccessors: Array<(d: EnrichedDatum) => number | undefined>;
  tooltipEntry: (cfg: SeriesConfig) => TooltipEntryDef;
}

// Registry là plain object — không dùng class
const registry: Partial<Record<SeriesTypeId, RegistryEntry>> = {};

export function registerSeries(type: SeriesTypeId, entry: RegistryEntry): void {
  registry[type] = entry;
}

export function getSeries(type: SeriesTypeId): RegistryEntry {
  const entry = registry[type];
  if (!entry) throw new Error(`SeriesRegistry: unknown type "${type}"`);
  return entry;
}

export function listRegistered(): SeriesTypeId[] {
  return Object.keys(registry) as SeriesTypeId[];
}
```

**File tạo mới:** `src/lib/core/registry/registerAll.ts`
- Import tất cả series components từ `../../series/`
- Gọi `registerSeries(...)` cho từng type
- Export `initRegistry()` function
- Phase 1 cần: Candlestick, HollowCandle, OHLC, HeikinAshi, Line, Area, Bar, Volume, EMA, BollingerBand, RSI, MACD, CVDApprox, StrengthElder, Whale

**Quan trọng:** `yExtentsAccessors` phải cover tất cả giá trị series có thể vẽ để Chart tự scale đúng.

**Acceptance criteria:**
- [ ] `getSeries("Candlestick")` trả về entry hợp lệ
- [ ] `getSeries("UnknownType")` throw Error rõ ràng
- [ ] Mọi `SeriesTypeId` trong Phase 1 đều có entry
- [ ] `npx tsc --noEmit` pass

---

### S1.3 — DataEnricher & Calculators

**Mục tiêu:** Pipeline tính toàn bộ indicator từ OHLCV, trả về `EnrichedDatum[]`.

**File tạo mới:** `src/lib/core/calculators/types.ts`

```typescript
export interface RawOHLCV {
  date: Date;
  open: number; high: number; low: number; close: number; volume: number;
}

export interface EnrichedDatum extends RawOHLCV {
  // EMA
  ema20?: number;
  ema50?: number;
  // Bollinger
  bollingerBand?: { top: number; middle: number; bottom: number };
  // RSI
  rsi?: number;
  // MACD
  macd?: { macd: number; signal: number; divergence: number };
  // CVD approximate (Phase 1)
  cvdApprox?: number;
  cvdDelta?: number;          // buy - sell per bar
  // Strength Elder (Phase 1)
  bullPower?: number;         // High - EMA(13)
  bearPower?: number;         // Low - EMA(13)
  // Whale (Phase 1 approx — bars vượt ngưỡng volume*close)
  whaleBuyVol?: number;
  whaleSellVol?: number;
  // Phase 4 (placeholder, undefined ở Phase 1)
  cvdRealtime?: number;
  strengthRelative?: number;
}
```

**File tạo mới:** `src/lib/core/calculators/calcCVDApprox.ts`
```
Input: RawOHLCV[]
Output: thêm cvdApprox, cvdDelta vào mỗi item
Công thức:
  range = high - low
  buyVol = range > 0 ? volume * (close - low) / range : volume * 0.5
  sellVol = volume - buyVol
  delta = buyVol - sellVol
  cvd[i] = cvd[i-1] + delta[i]   (cvd[0] = delta[0])
```

**File tạo mới:** `src/lib/core/calculators/calcStrengthElder.ts`
```
Input: RawOHLCV[] + ema13 (tính nội bộ hoặc nhận từ ngoài)
Output: thêm bullPower (High - ema13), bearPower (Low - ema13)
Dùng EMA period 13 (Elder's default)
```

**File tạo mới:** `src/lib/core/calculators/calcWhaleApprox.ts`
```
Input: RawOHLCV[], threshold (default $50,000 USD)
Estimate: dollarVolume = close * volume
Heuristic: nếu dollarVolume * (close-low)/(high-low) >= threshold → whaleBuyVol = ước lượng
whaleSellVol tương tự với sell side
NOTE: Đây là approximation — Phase 4 mới có data thật từ WS
```

**File tạo mới:** `src/lib/core/calculators/enrichData.ts`
```typescript
// Pipeline chính — gọi theo thứ tự:
// 1. calcEMA(20), calcEMA(50)
// 2. calcBollingerBand(20, 2)
// 3. calcRSI(14)
// 4. calcMACD(12, 26, 9)
// 5. calcCVDApprox()
// 6. calcStrengthElder() — dùng EMA(13) tính nội bộ
// 7. calcWhaleApprox(threshold=50000)
// Return: EnrichedDatum[]

export function enrichData(raw: RawOHLCV[], whaleThreshold = 50_000): EnrichedDatum[]
```

**Lưu ý:** Tái dùng calculator hiện có trong `src/lib/calculator/` nếu đã có EMA, RSI, MACD. Không duplicate logic.

**Acceptance criteria:**
- [ ] `enrichData([...300 bars])` không throw
- [ ] `cvdApprox` là cumulative (monotone-ish, không reset giữa chừng)
- [ ] `bullPower` = `high - ema13` với sai số < 0.01
- [ ] `whaleBuyVol` undefined hoặc ≥ 0 (không âm)
- [ ] Performance: 1000 bars < 50ms (dùng `console.time`)

---

### S1.4 — useDynamicPanes Hook

**Mục tiêu:** Hook quản lý toàn bộ `PaneDescriptor[]`, integrate với `usePaneSizes`, persist localStorage.

**File tạo mới:** `src/lib/core/hooks/useDynamicPanes.ts`

**Interface bắt buộc:**

```typescript
export interface UseDynamicPanesResult {
  // State
  panes: PaneDescriptor[];                      // tất cả panes (visible + hidden)
  visiblePanes: PaneDescriptor[];               // chỉ visible
  heights: number[];                            // pixel heights của visible panes
  available: number;                            // tổng height available

  // Pane-level actions
  toggleVisible: (id: string) => void;          // ẩn/hiện pane (không áp dụng với pinned)
  addPane: (desc: Omit<PaneDescriptor, "id">) => void;  // thêm pane mới (reject nếu ≥ PANE_MAX_VISIBLE visible)
  removePane: (id: string) => void;             // xóa pane (reject nếu pinned)
  restorePane: (id: string) => void;            // set visible=true cho hidden pane

  // Series-level actions
  addSeries: (paneId: string, series: SeriesConfig) => void;
  removeSeries: (paneId: string, seriesType: SeriesTypeId) => void;

  // Splitter
  applyDelta: (splitterIndex: number, deltaY: number) => void;  // chỉ visible panes

  // Layout reset
  resetToDefault: () => void;                   // xóa localStorage, restore DEFAULT_PANES

  // Computed
  canAddPane: boolean;                          // true nếu visiblePanes.length < PANE_MAX_VISIBLE
}

export function useDynamicPanes(totalHeight: number): UseDynamicPanesResult
```

**Yêu cầu logic:**
- Load từ localStorage `PANE_LAYOUT_STORAGE_KEY` khi mount (parse JSON, validate structure)
- Nếu localStorage corrupt/missing → dùng `DEFAULT_PANES`
- Save vào localStorage mỗi khi `panes` thay đổi (useEffect)
- `usePaneSizes` được gọi với `totalHeight` và chỉ `visiblePanes.length` panes
- Khi `toggleVisible` làm pane ẩn: heights redistribute cho visible còn lại
- Khi restore pane hidden: normalize tất cả visible heightRatio sao cho sum = 1

**Acceptance criteria:**
- [ ] `toggleVisible("momentum")` → visiblePanes giảm 1, heights[0] + heights[1] = available (sau margin)
- [ ] `addPane(...)` khi đã có 3 visible → không thay đổi state
- [ ] `resetToDefault()` → panes = DEFAULT_PANES, localStorage cleared
- [ ] Reload trang → restore state từ localStorage
- [ ] `removePane("price")` → không thay đổi (pinned guard)

---

### S1.5 — DynamicChart Renderer

**Mục tiêu:** Component render `<Chart>` từ `PaneDescriptor[]` thay vì JSX hardcode.

**File tạo mới:** `src/lib/core/DynamicChart.tsx`

**Interface:**
```typescript
interface DynamicChartProps {
  panes: PaneDescriptor[];           // chỉ visible panes
  heights: number[];                 // pixel height per visible pane
  data: EnrichedDatum[];
  axisStroke: string;
  axisTickFill: string;
  isDark: boolean;
  // Forwarded từ ChartCanvas context (không cần — children của ChartCanvas)
}
```

**Logic render:**

```typescript
// Đếm Chart id liên tục
let chartId = 1;

// Mỗi pane render 1 hoặc 2 Chart (splitScale)
visiblePanes.map((pane, i) => {
  const paneTop = 8 + sum(heights.slice(0, i));  // 8 = margin top ChartCanvas
  const slots = buildChartSlots(pane);            // 1 slot hoặc 2 slot

  return slots.map((slot, si) => (
    <Chart
      key={`${pane.id}-slot${si}`}
      id={chartId++}
      height={heights[i]}
      origin={(_w, h) => [0, h - sum(heights.slice(i))]}
      yExtents={buildYExtents(slot, data)}
    >
      {slot.hasLeftAxis  && <YAxis axisAt="left" orient="left" stroke={axisStroke} tickLabelFill={axisTickFill} />}
      {slot.hasRightAxis && <YAxis axisAt="right" orient="right" stroke={axisStroke} tickLabelFill={axisTickFill} />}
      {slot.series.map(sc => renderSeries(sc, data, isDark))}
      {/* XAxis chỉ ở pane cuối cùng, slot đầu tiên */}
      {i === visiblePanes.length - 1 && si === 0 && (
        <XAxis axisAt="bottom" orient="bottom" stroke={axisStroke} tickLabelFill={axisTickFill} />
      )}
      <PaneTooltip pane={pane} slot={slot} />
      <MouseCoordinateX displayFormat={dateFormat} />
      <MouseCoordinateY rectWidth={64} displayFormat={priceFormat} />
    </Chart>
  ));
})
```

**Hàm helper `buildChartSlots(pane)`:**
- `splitScale: false` → 1 slot, tất cả series vào đó
- `splitScale: true` → 2 slot: slot[0] = series có `yAxis: "left"`, slot[1] = series có `yAxis: "right"`
- Cả 2 slot dùng cùng `origin` và `height` (chồng nhau)

**Hàm helper `renderSeries(sc, data, isDark)`:**
- Lookup `getSeries(sc.type)` từ registry
- Lấy component, merge `sc.params` với `defaultParams`
- Return JSX

**Acceptance criteria:**
- [ ] 3 pane mặc định render giống hệt hardcode cũ (visual regression)
- [ ] Ẩn momentum pane → chỉ còn Price + Volume, XAxis xuống Volume
- [ ] Thêm pane CVD → render đúng series CVDApprox
- [ ] `splitScale: true` → 2 Chart chồng nhau, mỗi scale độc lập

---

### S1.6 — PaneLabel & PaneTooltip (DOM Overlays)

**Mục tiêu:** Label dọc bên trái + tooltip top-left generic cho mỗi pane.

**File tạo mới:** `src/lib/core/PaneLabel.tsx`

```typescript
interface PaneLabelProps {
  label: string;
  top: number;    // pixel từ top của chart-shell
  height: number; // pixel height của pane
  isDark?: boolean;
}
// Render: position absolute, left=0, writing-mode vertical-rl
// Nằm trong phần 60px left margin của ChartCanvas
```

**File tạo mới:** `src/lib/core/PaneTooltip.tsx`

```typescript
// Wrapper mỏng — với Price pane dùng OHLCTooltip hiện có
// Với các pane khác: hiển thị label + value từ registry tooltipEntry
// Position: bên trong <Chart> (react-stockcharts pattern — render như child của Chart)
interface PaneTooltipProps {
  pane: PaneDescriptor;
  xDisplayFormat: (d: Date) => string;
  volumeFormat: (v: number) => string;
}
```

**CSS thêm vào** `src/lib/styles/chart-splitter.css` hoặc file mới `src/lib/styles/pane-overlays.css`:
```css
.rsc-pane-label {
  position: absolute;
  left: 0;
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--rsc-text-micro);
  pointer-events: none;
  user-select: none;
  z-index: 10;
}
```

**Acceptance criteria:**
- [ ] PaneLabel hiển thị đúng text, xoay 90°, không đè lên trục Y
- [ ] PaneTooltip Price pane hiển thị OHLC + Volume khi hover crosshair
- [ ] PaneTooltip CVD pane hiển thị "CVD: 12,345" khi hover
- [ ] Dark/light theme: màu theo `--rsc-text-micro`

---

### S1.7 — PaneHeader (Tối giản — Hover Overlay)

**Mục tiêu:** Header hiện khi hover, chứa label + nút 👁 + nút ×. Không chiếm canvas height.

**File tạo mới:** `src/lib/core/PaneHeader.tsx`

```typescript
interface PaneHeaderProps {
  pane: PaneDescriptor;
  onToggleVisible: () => void;
  onRemove: () => void;
  // Phase 2 additions (optional, undefined ở Phase 1):
  onAddSeries?: () => void;
}
```

**HTML structure:**
```html
<div class="rsc-pane-wrap" style="position: relative">
  <!-- Canvas area (ChartCanvas nằm ở đây) -->
  
  <!-- Hover overlay header -->
  <div class="rsc-pane-header">
    <span class="rsc-pane-header__label">{pane.label}</span>
    <div class="rsc-pane-header__actions">
      <!-- Nút 👁: disabled nếu pinned -->
      <button class="rsc-pane-btn" title="Ẩn pane">👁</button>
      <!-- Nút ×: hidden nếu pinned -->
      {!pane.pinned && <button class="rsc-pane-btn" title="Xóa pane">×</button>}
    </div>
  </div>
</div>
```

**CSS bắt buộc** (hover-only, thuần CSS):
```css
.rsc-pane-wrap { position: relative; }

.rsc-pane-header {
  position: absolute;
  top: 0; left: 60px; right: 68px;   /* trong phạm vi chart area */
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  background: var(--rsc-surface);
  border-bottom: 1px solid var(--rsc-border);
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease;
  z-index: 50;
}

/* Hiện khi hover pane HOẶC khi dropdown đang mở (focus-within) */
.rsc-pane-wrap:hover .rsc-pane-header,
.rsc-pane-wrap:focus-within .rsc-pane-header {
  opacity: 1;
  pointer-events: auto;
}
```

**Acceptance criteria:**
- [ ] Header ẩn hoàn toàn khi không hover
- [ ] Header hiện khi hover bất kỳ điểm nào trong pane
- [ ] Nút 👁 click → gọi `onToggleVisible()`, pane ẩn/hiện đúng
- [ ] Nút × ẩn với Price pane (pinned)
- [ ] Nút × click → gọi `onRemove()`, pane bị xóa
- [ ] CSS `focus-within` giữ header visible khi focus vào button bên trong

---

### S1.8 — Integration vào LibraryShowcaseDemo

**Mục tiêu:** Thay 3 `<Chart>` hardcode bằng `DynamicChart` + `useDynamicPanes`.

**File sửa:** `src/demo/LibraryShowcaseDemo.tsx`

**Thay đổi:**
1. Xóa `usePaneSizes` — thay bằng `useDynamicPanes(chartHeight)`
2. Xóa 3 `<Chart>` hardcode — thay bằng `<DynamicChart panes={visiblePanes} heights={heights} data={enrichedData} ... />`
3. Xóa `<ChartSplitter>` hardcode × 2 — thay bằng `visiblePanes.slice(0,-1).map((_, i) => <ChartSplitter splitterIndex={i} ... />)`
4. Bọc chart-shell trong `<PaneWrap>` để có pane header overlay
5. Thêm `<PaneLabel>` overlays cho từng visible pane
6. `enrichData()` chạy qua `useMemo` từ `plotData`
7. `ChartCanvas key` include `visiblePanes.map(p=>p.id).join("-")` để remount khi pane thay đổi

**Acceptance criteria:**
- [ ] Visual y chang lúc ban đầu (Price + Volume + Momentum)
- [ ] Hover vào Price pane → header hiện (label "Price" + 👁 disabled + × hidden)
- [ ] Hover vào Momentum pane → header hiện (label "RSI+MACD" + 👁 + ×)
- [ ] Click 👁 Momentum → pane ẩn, Price + Volume chiếm toàn bộ height
- [ ] Click × Volume → Volume xóa, Price + Momentum chiếm height
- [ ] Splitter resize vẫn hoạt động sau khi xóa 1 pane
- [ ] `npx tsc --noEmit` pass

---

## PHASE 2 — Interactivity đầy đủ

### S2.1 — SeriesPicker Dropdown

**Mục tiêu:** Dropdown cho phép add/remove series trong một pane.

**File tạo mới:** `src/lib/core/SeriesPicker.tsx`

```typescript
interface SeriesPickerProps {
  pane: PaneDescriptor;
  onAddSeries: (sc: SeriesConfig) => void;
  onRemoveSeries: (type: SeriesTypeId) => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
}
```

**Danh sách hiển thị trong picker:** `listRegistered()` từ SeriesRegistry.  
**Checkmark** với series đã có trong pane. Click lại để remove.  
**Dismiss:** click ngoài (mousedown listener) hoặc Escape.

**Acceptance criteria:**
- [ ] Click `+` trên pane header → picker mở ngay bên dưới nút
- [ ] EMA đã có → hiện checkmark, click → remove
- [ ] CVDApprox chưa có → click → add → series xuất hiện trên chart
- [ ] Escape đóng picker
- [ ] `focus-within` giữ pane header visible khi picker mở

---

### S2.2 — Add Pane Menu & Restore Hidden

**Mục tiêu:** Nút "+" ở topbar → menu thêm pane mới hoặc restore pane đang hidden.

**Vị trí nút:** Topbar right section (trước nút theme toggle).

**Menu items:**
- "Volume" — disabled nếu pane id="volume" đã tồn tại (visible hoặc hidden)
- "RSI + MACD" — tương tự
- "CVD" — có thể add nhiều lần với id khác nhau
- "Strength" — Elder hoặc Relative (Phase 4)
- "Whale" —
- Nếu pane đang hidden → item hiện "Hiện lại: [label]" thay vì "Thêm mới"
- Nếu đã có 3 visible pane → tất cả "Thêm mới" disabled, chỉ "Hiện lại" còn enable

**Acceptance criteria:**
- [ ] 3 visible pane → "Thêm Volume" disabled
- [ ] Ẩn Volume → "Thêm Volume" disabled nhưng "Hiện lại: Volume" enabled
- [ ] Click "Hiện lại: Volume" → Volume visible lại, heights normalize
- [ ] Click "CVD" → pane CVD mới xuất hiện với CVDApprox series

---

### S2.3 — Reset to Default

**Vị trí:** Nút "↺ Mặc định" trong menu Add Pane (footer của menu).

**Hành vi:** Confirm dialog → `resetToDefault()` → UI về DEFAULT_PANES, localStorage cleared.

**Acceptance criteria:**
- [ ] Sau reset → layout y chang DEFAULT_PANES
- [ ] localStorage key `rsc-pane-layout-v1` bị xóa
- [ ] Reload trang sau reset → vẫn là DEFAULT_PANES (không restore layout cũ)

---

### S2.4 — Full Pane Header (Phase 2 complete)

Nâng cấp `PaneHeader` từ S1.7:
- Thêm nút `+` gắn với `SeriesPicker` (S2.1)
- Thêm drag handle `⠿` (disabled với pinned pane) — visual only ở S2.4, functional ở S3.1

---

## PHASE 3 — Drag Reorder

### S3.1 — Drag-and-Drop Reorder Panes

**Cơ chế:** HTML5 Drag API (không thêm dependency).

**Chỉ áp dụng với:** visible panes, non-pinned.

**Logic:**
- `dragstart` → lưu `dragIndex` vào ref
- `dragover` → tính `dropIndex` từ position
- `drop` → gọi `reorderPanes(dragIndex, dropIndex)` trong `useDynamicPanes`
- Ghost: browser default drag ghost + CSS `cursor: grabbing`
- Price pane (index 0, pinned) → `draggable={false}`, handle disabled

**Constraint:** Không thể drop lên vị trí 0 (Price luôn đứng đầu).

**Acceptance criteria:**
- [ ] Kéo Momentum lên trên Volume → thứ tự đổi, canvas remount đúng
- [ ] Không thể kéo Price
- [ ] Không thể drop vào vị trí 0 (Price guard)
- [ ] Heights giữ nguyên theo pane sau reorder

---

## PHASE 4 — Real-time WebSocket Data

### S4.1 — Binance Trade WebSocket Handler

**File tạo mới:** `src/lib/core/ws/BinanceTradeWS.ts`

```typescript
interface TradeEvent {
  symbol: string;
  price: number;
  quantity: number;
  isBuyerMaker: boolean;  // m field từ WS
  tradeTime: number;       // T field
}

interface BinanceTradeWSOptions {
  symbol: string;           // "btcusdt"
  onTrade: (event: TradeEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

class BinanceTradeWS {
  constructor(options: BinanceTradeWSOptions)
  connect(): void
  disconnect(): void
  reconnect(): void   // auto-reconnect với exponential backoff
}
```

**Acceptance criteria:**
- [ ] Connect → nhận trade events liên tục
- [ ] Disconnect → auto-reconnect sau 1s, 2s, 4s (max 30s)
- [ ] Đổi symbol → disconnect + reconnect với symbol mới

### S4.2 — CVD Real-time Accumulator

**Mục tiêu:** Tích lũy CVD thật từ trade events, bucket theo timeframe, override `cvdApprox`.

**File tạo mới:** `src/lib/core/ws/CVDAccumulator.ts`

```typescript
export interface CVDBucket {
  openTime: number;   // epoch ms — mốc mở bar
  closeTime: number;  // openTime + timeframeDurationMs
  buyVol: number;
  sellVol: number;
  delta: number;      // buyVol - sellVol
  cvd: number;        // cumulative từ bar đầu tiên trong session
}

export class CVDAccumulator {
  private buckets: CVDBucket[] = [];
  private timeframeMs: number;

  constructor(timeframeMs: number) {
    this.timeframeMs = timeframeMs;
  }

  // Gọi từ BinanceTradeWS.onTrade (qua buffer — xem Architecture trap 3.12)
  addTrade(event: TradeEvent): void {
    const barTime = Math.floor(event.tradeTime / this.timeframeMs) * this.timeframeMs;
    let bucket = this.buckets.find(b => b.openTime === barTime);
    if (!bucket) {
      bucket = { openTime: barTime, closeTime: barTime + this.timeframeMs,
                 buyVol: 0, sellVol: 0, delta: 0, cvd: 0 };
      this.buckets.push(bucket);
    }
    // m=true → buyer là maker → seller là aggressor = SELL (market sell order)
    if (event.isBuyerMaker) bucket.sellVol += event.quantity;
    else                     bucket.buyVol  += event.quantity;
    bucket.delta = bucket.buyVol - bucket.sellVol;
    // Recalculate running CVD
    this.recalcCVD();
  }

  // Gộp vào EnrichedDatum[] — override cvdRealtime field
  mergeInto(data: EnrichedDatum[]): EnrichedDatum[] {
    return data.map(d => {
      const bucket = this.buckets.find(b =>
        d.date.getTime() >= b.openTime && d.date.getTime() < b.closeTime
      );
      return bucket ? { ...d, cvdRealtime: bucket.cvd } : d;
    });
  }

  reset(): void {
    this.buckets = [];
  }

  private recalcCVD(): void {
    let running = 0;
    this.buckets
      .sort((a, b) => a.openTime - b.openTime)
      .forEach(b => { running += b.delta; b.cvd = running; });
  }
}
```

**Hook tích hợp:** `src/lib/core/ws/useWSEnrichedData.ts`
```typescript
// Kết hợp BinanceTradeWS + CVDAccumulator + buffer flush (250ms)
// Trả về enrichedData với cvdRealtime override cvdApprox
export function useWSEnrichedData(
  baseData: EnrichedDatum[],
  symbol: string,
  timeframeMs: number
): EnrichedDatum[]
```

**Acceptance criteria:**
- [ ] `addTrade({ isBuyerMaker: false, quantity: 1.0 })` → `buyVol += 1.0`, `delta = +1`
- [ ] `addTrade({ isBuyerMaker: true, quantity: 0.5 })` → `sellVol += 0.5`, `delta = 0.5`
- [ ] CVD cộng dồn đúng sau nhiều buckets
- [ ] `reset()` → buckets rỗng
- [ ] `mergeInto(data)` override đúng bar tương ứng
- [ ] Đổi timeframe → `reset()` được gọi, CVD tính lại từ đầu

---

### S4.3 — Whale Real-time Filter

**Mục tiêu:** Lọc trades lớn ≥ threshold từ WS stream, hiển thị histogram Whale Buy/Sell per bar.

**File tạo mới:** `src/lib/core/ws/WhaleAccumulator.ts`

```typescript
export interface WhaleBucket {
  openTime: number;
  whaleBuyVol: number;
  whaleSellVol: number;
  whaleBuyCount: number;   // số lượng whale buy trades
  whaleSellCount: number;
}

export class WhaleAccumulator {
  private buckets: WhaleBucket[] = [];
  private timeframeMs: number;
  private threshold: number;   // USD (default 50_000)

  constructor(timeframeMs: number, threshold = 50_000) {
    this.timeframeMs = timeframeMs;
    this.threshold   = threshold;
  }

  addTrade(event: TradeEvent): void {
    const dollarValue = event.price * event.quantity;
    if (dollarValue < this.threshold) return;  // không phải whale → skip

    const barTime = Math.floor(event.tradeTime / this.timeframeMs) * this.timeframeMs;
    let bucket = this.buckets.find(b => b.openTime === barTime);
    if (!bucket) {
      bucket = { openTime: barTime, whaleBuyVol: 0, whaleSellVol: 0,
                 whaleBuyCount: 0, whaleSellCount: 0 };
      this.buckets.push(bucket);
    }
    if (event.isBuyerMaker) {
      bucket.whaleSellVol += event.quantity;
      bucket.whaleSellCount++;
    } else {
      bucket.whaleBuyVol += event.quantity;
      bucket.whaleBuyCount++;
    }
  }

  mergeInto(data: EnrichedDatum[]): EnrichedDatum[] {
    return data.map(d => {
      const bucket = this.buckets.find(b =>
        d.date.getTime() >= b.openTime && d.date.getTime() < b.openTime + this.timeframeMs
      );
      return bucket
        ? { ...d, whaleBuyVol: bucket.whaleBuyVol, whaleSellVol: bucket.whaleSellVol }
        : d;
    });
  }

  reset(): void { this.buckets = []; }
}
```

**Acceptance criteria:**
- [ ] Trade < $50k → không vào bucket
- [ ] Trade = $60k buy (isBuyerMaker=false) → `whaleBuyVol += qty`
- [ ] Trade = $60k sell (isBuyerMaker=true) → `whaleSellVol += qty`
- [ ] `mergeInto()` override đúng bar
- [ ] Threshold configurable khi khởi tạo

---

### S4.4 — Strength Relative vs BTC

**Mục tiêu:** Tính RS = sức mạnh tương đối của asset so với BTC, cập nhật real-time.

**File tạo mới:** `src/lib/core/ws/StrengthRelativeCalc.ts`

```typescript
// Công thức: RS[i] = (close_asset[i] / close_asset[0]) / (close_btc[i] / close_btc[0])
// close_asset[0] và close_btc[0] là giá mở phiên (hoặc bar đầu tiên trong window)
// RS > 1: asset mạnh hơn BTC. RS < 1: yếu hơn. RS = 1: baseline.

export function calcStrengthRelative(
  assetData: EnrichedDatum[],
  btcCloses: Map<number, number>   // epoch ms → close price
): EnrichedDatum[] {
  if (assetData.length === 0) return assetData;

  const assetBase = assetData[0].close;
  // btcBase: giá BTC tại thời điểm gần nhất với bar đầu tiên của asset
  const firstTime = assetData[0].date.getTime();
  const btcBase = findClosestBTCClose(btcCloses, firstTime);
  if (!btcBase) return assetData;   // BTC data chưa có → skip

  return assetData.map(d => {
    const btcClose = findClosestBTCClose(btcCloses, d.date.getTime());
    if (!btcClose) return d;
    const strengthRelative = (d.close / assetBase) / (btcClose / btcBase);
    return { ...d, strengthRelative };
  });
}

// Helper: tìm giá BTC gần nhất trong map
function findClosestBTCClose(map: Map<number, number>, targetMs: number): number | undefined {
  // Tìm key gần nhất (trong ±timeframe tolerance)
  // Implementation: iterate sorted keys, find closest
}
```

**Nguồn BTC data:**
- Phase 4: dùng `BinanceTradeWS` với symbol `"btcusdt"` song song với asset stream
- Track last close price của mỗi bar BTC → `btcCloses` map

**Hook tích hợp:** Trong `useWSEnrichedData`, nếu `symbol !== "btcusdt"`, mở thêm 1 WS stream cho BTCUSDT. Cả 2 stream share cùng `BinanceTradeWS` class.

**Acceptance criteria:**
- [ ] `calcStrengthRelative(assetBars, btcCloses)` với BTC và asset đồng đều → RS ≈ 1.0 cho mọi bar
- [ ] Asset tăng 10%, BTC flat → RS = 1.1 tại bar đó
- [ ] Asset flat, BTC tăng 10% → RS = 0.909 tại bar đó
- [ ] `btcCloses` rỗng → không crash, trả về data không modified
- [ ] Symbol = "btcusdt" → không mở 2nd WS stream (tránh circular)

---

## Thứ tự thực hiện khuyến nghị

```
Tuần 1: S1.1 → S1.2 → S1.3
Tuần 2: S1.4 → S1.5
Tuần 3: S1.6 → S1.7 → S1.8
Tuần 4: S2.1 → S2.2
Tuần 5: S2.3 → S2.4 → Phase 2 audit
Tuần 6: S3.1 → Phase 3 audit
Tuần 7-8: S4.1 → S4.2 → S4.3 → S4.4
```

---

## Files sẽ tạo/sửa (đầy đủ)

```
src/lib/core/
  types/
    pane-descriptor.ts           [NEW - S1.1]
  registry/
    SeriesRegistry.ts            [NEW - S1.2]
    registerAll.ts               [NEW - S1.2]
    __tests__/
      SeriesRegistry.test.ts     [NEW - S1.2 audit]
  calculators/
    types.ts                     [NEW - S1.3]
    calcCVDApprox.ts             [NEW - S1.3]
    calcStrengthElder.ts         [NEW - S1.3]
    calcWhaleApprox.ts           [NEW - S1.3]
    enrichData.ts                [NEW - S1.3]
    fixtures/
      mockData.ts                [NEW - S1.3 test fixture]
    __tests__/
      enrichData.test.ts         [NEW - S1.3 audit]
  hooks/
    useDynamicPanes.ts           [NEW - S1.4]
    __tests__/
      useDynamicPanes.test.ts    [NEW - S1.4 audit]
  ws/
    BinanceTradeWS.ts            [NEW - S4.1]
    CVDAccumulator.ts            [NEW - S4.2]
    WhaleAccumulator.ts          [NEW - S4.3]
    StrengthRelativeCalc.ts      [NEW - S4.4]
    useWSEnrichedData.ts         [NEW - S4.2, S4.3, S4.4 integration hook]
    __tests__/
      CVDAccumulator.test.ts     [NEW - S4.2 audit]
      WhaleAccumulator.test.ts   [NEW - S4.3 audit]
      StrengthRelativeCalc.test.ts [NEW - S4.4 audit]
  DynamicChart.tsx               [NEW - S1.5]
  PaneLabel.tsx                  [NEW - S1.6]
  PaneTooltip.tsx                [NEW - S1.6]
  PaneHeader.tsx                 [NEW - S1.7]
  SeriesPicker.tsx               [NEW - S2.1]
  index.ts                       [MODIFIED - S1.1, S1.2, S1.7]
src/lib/styles/
  pane-overlays.css              [NEW - S1.6, S1.7 styles]
src/index.ts                     [MODIFIED - re-export core types]
src/demo/
  LibraryShowcaseDemo.tsx        [MODIFIED - S1.8 integration]
  demo.css                       [MODIFIED - S1.7 pane header styles, S2.2 topbar button]
docs/planning/
  evidence/                      [NEW - screenshots per AUDIT_PROTOCOL.md naming]
  IMPLEMENTATION_PLAN.md         [này]
  ARCHITECTURE_GUIDE.md          [tham chiếu]
  AUDIT_PROTOCOL.md              [tham chiếu]
  DYNAMIC_PANE_SYSTEM.md         [gốc - master design]
```
