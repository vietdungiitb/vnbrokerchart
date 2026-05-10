# VNStockChart — Đề xuất cải tiến engine & roadmap migration

> **Phiên bản:** 1.1  
> **Ngày:** 2026-05-07  
> **Tác giả:** GitHub Copilot (phân tích so sánh KLineChart v9 / TradingView LWC v5 / DXCharts Lite vs VNStockChart)  
> **Trạng thái:** DRAFT — chờ review và phê duyệt trước khi lên IMPLEMENTATION_PLAN

---

## 1. Đính chính kiến trúc hiện tại — VNStockChart đã là Hybrid

**VNStockChart không thuần SVG.** `react-stockcharts` (thư viện gốc GoCharting dùng) đã có
chế độ `"hybrid"` từ phiên bản đầu và đây là **mặc định** trong `DynamicChart.tsx`:

```tsx
// src/lib/core/DynamicChart.tsx
<ChartCanvas type={props.type ?? "hybrid"} ...>
```

Kiến trúc thực tế của `ChartCanvas` khi `type="hybrid"`:

```
┌────────────────────────────────────────────┐
│  <div position:absolute>  (CanvasContainer) │
│    <canvas id="bg">          ← price bars, MA, BB, indicators vẽ bằng Canvas 2D │
│    <canvas id="axes">        ← axis tick labels                                  │
│    <canvas id="mouseCoord">  ← crosshair cursor                                  │
│  </div>                                     │
│  <svg>                                      │
│    drawing tools (TrendLine, Fib...)  ← SVG interactive overlay                  │
│    tooltip layer                       ← SVG vì dễ hit-test                       │
│  </svg>                                     │
└────────────────────────────────────────────┘
```

Source: `src/lib/CanvasContainer.tsx`, `src/lib/GenericComponent.tsx` (kiểm tra `chartCanvasType !== "svg"`).

**Vậy performance bottleneck thực sự không phải SVG rendering mà là:**

| # | Bottleneck thực sự | Mức độ |
|---|---|---|
| 1 | **React reconciler overhead** — mỗi scroll/pan trigger re-render toàn bộ React component tree dù draw là Canvas | 🔴 Cao |
| 2 | **`enrichData()` recalculation** — tất cả indicator math tính lại trên toàn bộ dataset khi pan | 🟠 Trung bình–cao |
| 3 | **D3 scale recalculation** — `xScale/yScale` tính lại mỗi frame | 🟠 Trung bình |
| 4 | **Bundle size** — ~9.4 MB do D3 đầy đủ + legacy react-stockcharts deps | 🟠 Trung bình |
| 5 | **Mobile / touch** — không có touch event handler cho pan/zoom | 🟡 Trung bình |
| 6 | **SVG drawing overlay** — lag nếu có >50 drawing objects đồng thời | 🟡 Thấp–Trung bình |

---

## 2. So sánh kỹ thuật Canvas vs React reconciler path

### 2.1 Rendering path hiện tại (Hybrid mode)

```
User scroll/pan
    │
    ▼
React event → setState/context update
    │
    ▼
React reconciler diff (full tree)       ← ĐÂY là bottleneck chính
    │
    ▼
GenericComponent.componentDidUpdate()
    │ if canvasDraw && type !== "svg"
    ▼
ctx.clearRect() → canvasDraw(ctx, moreProps) ← Canvas draw (nhanh)
    │
    ▼
Kết quả vẽ lên canvas                   ← cuối cùng vẫn ra Canvas
```

### 2.2 Rendering path của KLineChart / LWC (pure Canvas)

```
User scroll/pan
    │
    ▼
PointerEvent handler (vanilla JS)        ← không qua React
    │
    ▼
Tính toán visible range mới
    │
    ▼
requestAnimationFrame → drawAll()         ← 1 frame, dirty region only
    │
    ▼
Kết quả vẽ lên canvas
```

Sự khác biệt: **React reconciler bị bypass hoàn toàn** → đây là lý do canvas-native library nhanh hơn ngay cả khi VNStockChart đã dùng Canvas để vẽ.

### 2.3 Benchmark tham khảo

| Kịch bản | VNStockChart hybrid (ước tính) | KLineChart v9 (tài liệu chính thức) |
|---|---|---|
| 5000 nến, 8 indicator panes | ~20–35 FPS (laptop tầm trung) | ~55–60 FPS |
| Ngưỡng bắt đầu lag | ~1500–2000 nến với 5+ panes | 10 triệu dữ liệu vẫn mượt |
| Intraday 1-min tick >3000 bars | Stuttering rõ | Không vấn đề |
| Mobile scroll | Không hỗ trợ | 60fps trên mid-range Android |

---

---

## 3. Canvas chart engines open source khả thi

Dưới đây là các thư viện Canvas financial chart open source đã được đánh giá theo tiêu chí:
**license**, **financial domain fit** (có hỗ trợ OHLCV, multi-pane không), **TypeScript**, **tích hợp với React**, **bundle size**, **độ trưởng thành**.

### 3.1 Bảng so sánh tổng quan

| Thư viện | License | Stars | Bundle | TS | Multi-pane | Indicator API | React | Domain fit |
|---|---|---|---|---|---|---|---|---|
| **KLineChart v9** | Apache 2.0 | 3.7k | ~40kb gzip | ✅ | ✅ native | `registerIndicator()` | Wrapper cần viết | ⭐⭐⭐⭐⭐ |
| **TradingView LWC v5** | Apache 2.0* | 15.6k | ~40kb gzip | ✅ | ❌ 1 pane/chart | Plugin API v5 | Wrapper cần viết | ⭐⭐⭐⭐ |
| **DXCharts Lite** | MPL-2.0 | 89 | ~? | ✅ 98% | ✅ PaneManager | Custom series | Wrapper cần viết | ⭐⭐⭐⭐ |
| **Apache ECharts** | Apache 2.0 | 66k | ~1MB | ✅ | ✅ grid array | `registerTransform` | `echarts-for-react` | ⭐⭐⭐ |
| **Chart.js v4** | MIT | 67.4k | ~200kb | Partial | ❌ | Plugin API | `react-chartjs-2` | ⭐⭐ |

*TradingView LWC yêu cầu attribution link/logo trên trang sử dụng.

### 3.2 Chi tiết từng engine

#### 🥇 KLineChart v9 — Phù hợp nhất cho VNStockChart

```
npm install klinecharts
```

- **License:** Apache 2.0 — tự do thương mại, không cần attribution
- **Rendering:** Canvas 2D, zero dependency, ~40kb gzip
- **Financial domain:** Built-in 26+ indicators (MA/EMA/MACD/KDJ/DMI/RSI...), 14 overlay types
- **Custom indicator:** `chart.registerIndicator({ name, calc, figures })` — rất clean
- **Custom overlay:** `chart.registerOverlay({ name, createPointFigures, ... })` — event-driven
- **Multi-pane:** `chart.createIndicator('RSI', false, { id: 'pane_rsi' })` — native
- **Mobile:** Có — touch pan/zoom built-in
- **React:** Không có binding, cần `useRef + useEffect` wrapper (~50 LOC)
- **Phiên bản:** v9 stable, v10 beta (Nov 2025)

**Điểm trừ:** Imperative API, không dùng JSX. Domain indicators (CVD, Whale) phải implement thủ công qua `registerIndicator`.

**Độ phù hợp VNStockChart:** ⭐⭐⭐⭐⭐ — **Lựa chọn ưu tiên #1**

---

#### 🥈 TradingView Lightweight Charts v5 — Nhiều star nhất, nhưng có ràng buộc

```
npm install lightweight-charts
```

- **License:** Apache 2.0 **nhưng yêu cầu hiển thị logo/link TradingView** — không phù hợp nếu VNStockChart là sản phẩm độc lập
- **Rendering:** Canvas 2D, zero dependency, ~40kb gzip, TypeScript 47%
- **Financial domain:** Built-in candlestick, bar, area, histogram, baseline
- **Plugin API v5 (mới):** `ISeriesPrimitive` — có thể render custom shape. Tuy nhiên không có built-in multi-indicator
- **Multi-pane:** Không native — mỗi `createChart()` là 1 pane riêng lẻ, phải sync thủ công
- **Indicator:** Không built-in — phải tự tính và truyền vào `LineSeries`
- **Mobile:** Có
- **Cộng đồng:** 15.6k stars, 60 contributors, 47 releases

**Điểm trừ:** Attribution bắt buộc, không có multi-pane native, không có indicator API — phải tự làm quá nhiều.

**Độ phù hợp VNStockChart:** ⭐⭐⭐ — **Không khuyến nghị** vì attribution + thiếu multi-pane

---

#### 🥉 DXCharts Lite — Tiềm năng cao nhưng community nhỏ

```
npm install @devexperts/dxcharts-lite
```

- **License:** MPL-2.0 — cho phép dùng thương mại, modifications phải open-source theo MPL
- **Rendering:** Canvas, TypeScript 98%
- **Financial domain:** OHLCV, volume, events markers, navigation map
- **Multi-pane:** `PaneManager` + `PaneComponent` native
- **API:** `CrossToolComponent` với OHLC magnet, `HighlightsComponent`, `SnapshotComponent`
- **Stars:** Chỉ 89 — cộng đồng rất nhỏ, risk về maintenance
- **Origin:** Devexperts — công ty fintech chuyên nghiệp, sản phẩm gốc dùng trong enterprise trading app

**Điểm trừ:** 89 stars = ít documentation, ít example, risk nếu Devexperts ngừng maintain public version.

**Độ phù hợp VNStockChart:** ⭐⭐⭐⭐ — **Lựa chọn #2** nếu cần PaneManager API clean hơn KLineChart

---

#### ECharts — General purpose, không chuyên financial

- **License:** Apache 2.0
- **Bundle:** ~1MB — **quá nặng** cho project đã có 9.4MB
- **Financial:** Có candlestick chart nhưng không có indicator math, không có drawing tools
- **Dùng phù hợp cho:** Dashboard, analytics — **không phù hợp làm chart engine chính** cho VNStockChart

---

#### Chart.js — General purpose, thiếu financial features

- **License:** MIT
- **Bundle:** ~200kb
- **Financial:** Cần plugin `chartjs-chart-financial` (third party) cho candlestick
- **Indicator:** Không có — phải tự implement hoặc dùng `chartjs-plugin-annotation`
- **Kết luận:** Không phù hợp

---

### 3.3 Khuyến nghị cuối

```
Cho VNStockChart:
  1. KLineChart v9    ← lựa chọn tốt nhất: financial domain, zero dep, Apache 2.0, 26+ indicators
  2. DXCharts Lite    ← thay thế nếu cần PaneManager API; check MPL-2.0 compliance
  3. Tự viết minimal  ← chỉ nếu cả 2 không đủ flexibility
  ✗ TradingView LWC   ← loại ngay vì attribution bắt buộc
  ✗ ECharts / Chart.js ← không đúng domain
```

---

## 4. Phân tích các hướng giải pháp

### Hướng A — Tối ưu React reconciler path (ít rủi ro nhất)

Vì price data đã vẽ trên Canvas, bottleneck chính là React reconciler. Có thể giảm đáng kể mà không thay engine:

```
Optimization targets:
  1. shouldComponentUpdate / React.memo  → skip re-render khi data không đổi
  2. useMemo(enrichData, [data])          → đã có nhưng kiểm tra dependency đúng chưa
  3. Tách pan/zoom state ra khỏi React   → dùng useRef + direct canvas redraw
  4. requestAnimationFrame throttle      → không vẽ lại nhiều hơn 60fps
```

**Effort:** Thấp (1–2 sprint). **Impact:** Cải thiện 30–50% FPS.

### Hướng B — Migrate sang KLineChart engine (khuyến nghị dài hạn)

```
React Shell (demo, pane system, settings modal, i18n, bar replay UI)
    │
    └─→ KLineChart instance (chart.init())
              │
              ├─ registerIndicator(CVD, Whale, StrengthElder...)  ← domain logic giữ nguyên
              ├─ registerOverlay(TrendLine, Fib, Channel...)       ← migrate từ SVG interactive
              └─ createTooltipDataSource(...)                      ← custom tooltip content
```

**Ưu điểm:**
- Canvas performance ngay lập tức, React reconciler không còn trên critical path
- Mobile support miễn phí
- Bundle giảm mạnh: D3 không cần nữa (tiết kiệm ~800 KB–1.2 MB gzip)
- KLineChart API trưởng thành: 97 releases, Apache 2.0

**Nhược điểm:**
- **Effort cao** — toàn bộ series/indicator rendering viết lại dưới `registerIndicator`
- Drawing tools phải migrate sang `registerOverlay` API
- Bar Replay và Paper Trading phải re-implement trên KLineChart data feed model
- Risk: breaking changes khi KLineChart ra v10

### Hướng C — Canvas engine tự viết (không khuyến nghị)

Viết một `CanvasChartEngine` tối giản chỉ hỗ trợ đúng những gì VNStockChart cần:
- Price pane (OHLCV)
- Volume pane
- N indicator panes với coordinate system nhất quán

Giữ nguyên:
- React shell, hooks, state management
- Drawing tools SVG layer
- Series API (chỉ thay backend renderer)

**Ưu điểm:**
- Kiểm soát hoàn toàn, không phụ thuộc bên ngoài
- Tối ưu cho VNStockChart use case

**Nhược điểm:**
- **Effort cao nhất về thời gian** — 6–12 tháng để làm đúng
- Phải tự xử lý: HiDPI, coordinate transforms, hit-testing, dirty region

---

## 5. Cải tiến khác (không liên quan engine)

Những cải tiến này **độc lập với engine migration**, có thể làm ngay:

### P1 — UX gaps rõ ràng

| # | Vấn đề | Giải pháp | Effort |
|---|---|---|---|
| U1 | Không có hotkeys | `Alt+D` drawing, `Esc` cancel, `Delete` xóa tool, `Ctrl+Z` undo, `Space` replay play/pause | 1 sprint |
| U2 | Magnet 1 mức (on/off) | Thêm `weak` (gần nhất trong threshold) và `strong` (snap exact OHLC) | 0.5 sprint |
| U3 | Không có undo/redo drawing | `DrawingHistoryStack` — 20 step, Ctrl+Z/Y | 2 sprint |
| U4 | Không thể xem full list tools active | Drawing panel đã có — cần thêm highlight selected | 0.5 sprint |

### P2 — Chỉ báo còn thiếu

| Chỉ báo | Ghi chú | Effort |
|---|---|---|
| **Ichimoku Kinko Hyo** | 5 đường phức tạp (Tenkan, Kijun, Chikou, Senkou A/B) | 1.5 sprint |
| **Supertrend** | Phổ biến VN market | 1 sprint |
| **VWAP** với anchored variant | Anchor từ ngày tùy chọn | 1.5 sprint |
| **Pivot Points** (Standard, Fibonacci, Camarilla) | Intraday rất quan trọng | 1 sprint |
| **Volume Profile** | Đã có partial — hoàn thiện horizontal bar | 1 sprint |

### P3 — Developer experience

| # | Vấn đề | Giải pháp |
|---|---|---|
| D1 | Custom indicator API chưa public | Export `registerSeries()` + type definitions ra widget boundary |
| D2 | Bundle size 9.4 MB | Audit D3 imports, tree-shake, lazy-load panes không dùng ngay |
| D3 | Storybook chưa cover canvas panes | Thêm stories khi migrate |

---

## 6. Dependency analysis — D3 có thể loại bỏ gì?

Hiện tại D3 dùng trong VNStockChart:

| D3 module | Dùng ở đâu | Có thể thay không? |
|---|---|---|
| `d3-scale` (scaleTime, scaleLinear) | coordinate mapping | Có thể tự implement nếu canvas renderer |
| `d3-array` (bisect, extent) | data lookup | Có thể dùng native hoặc lodash-es |
| `d3-shape` (line, area) | SVG path generator | Không cần nếu canvas |
| `d3-format` | Axis tick formatting | Thay bằng Intl.NumberFormat |
| `d3-time-format` | Date formatting | Thay bằng date-fns/dayjs |
| `d3-selection` | DOM manipulation | Không dùng nếu canvas |
| `d3-zoom` | Pan/zoom SVG | Thay bằng PointerEvent handler nếu canvas |

Ước tính tiết kiệm bundle nếu loại D3: **-800 KB đến -1.2 MB gzip**.

---

## 7. Risk register

| Risk | Xác suất | Impact | Mitigation |
|---|---|---|---|
| React reconciler overhead không giảm sau optimization (Hướng A) | Trung bình | Trung bình | Benchmark từng bước; nếu không đủ → commit sang Hướng B |
| KLineChart v10 breaking changes (Hướng B) | Trung bình | Cao | Pin version `"klinecharts": "9.x"`, wrapper adapter isolate API |
| CVD/Whale không implement được qua `registerIndicator` | Thấp | Cao | PoC trước khi commit — 1 tuần để validate |
| Mất drawing tool data khi migrate | Thấp | Cao | Export/import JSON format bất biến — đã có |
| HiDPI (Retina) bug khi tự vẽ Canvas | Thấp | Thấp | Luôn multiply `devicePixelRatio`, test trên 2x display |

---

## 8. Decision criteria

Trước khi commit vào Hướng A hay B, trả lời:

| Câu hỏi | Nếu "Có" | Nếu "Không" |
|---|---|---|
| Cần mobile support? | → Hướng B (KLineChart) | → Hướng A trước |
| Timeline < 3 tháng? | → Hướng A (incremental) | → Hướng B feasible |
| Team ≥ 3 dev? | → Hướng B | → Hướng A |
| CVD PoC thành công trong KLineChart? | → Hướng B confirmed | → Hướng A hoặc DXCharts Lite |
| Bundle size < 2MB là requirement? | → Hướng B (loại D3) | → Hướng A đủ |

---

## 9. Bước tiếp theo đề xuất

**Tuần 1 — PoC Performance:** Profile React reconciler
- [ ] Thêm `React DevTools Profiler` vào DynamicChart, scroll 5000 nến, đo render time
- [ ] Xác định top 3 component re-render nhiều nhất → quyết định Hướng A có đủ không

**Tuần 2 — PoC KLineChart:**
- [ ] Implement CVD indicator trong `registerIndicator({ name: 'CVD', calc, figures })`
- [ ] Implement 1 drawing tool (TrendLine) trong `registerOverlay`
- [ ] Đo FPS với 10k nến

**Cuối tuần 2 — Review & Commit:**
- [ ] So sánh kết quả 2 PoC → chọn hướng
- [ ] Viết slice spec, đưa vào `IMPLEMENTATION_PLAN.md`
- [ ] Tạo branch `feat/engine-migration-poc`

---

*Tài liệu này cần review trước khi tạo implementation slices. Cập nhật lần cuối: 2026-05-07 (v1.1).*
