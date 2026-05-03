# Taskboard: Approved TypeScript Delivery

> Bảng công việc này là backlog bàn giao cho đội code. Mỗi task phải map về slice tương ứng trong [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

---

## 1. Board rules

- Chỉ bắt đầu task khi đã đọc [HANDOFF_MANIFEST.md](./HANDOFF_MANIFEST.md) và [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md).
- Không kéo task sang In progress nếu slice trước chưa có evidence trong [SLICE_AUDIT.md](./SLICE_AUDIT.md).
- Mỗi task phải có test gate và evidence artifact rõ ràng.
- Không được để taskboard lệch với audit ledger.

---

## 2. Ready lane — thực thi theo thứ tự ưu tiên

| ID | Task | Slice | Owner role | Dependency | Evidence gate | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TB-01 | Khóa bộ tài liệu bàn giao | P0 | Release owner | — | Manifest + ledger + rules pass | Ready |
| TB-02 | Chốt foundation build | P1 | Tooling owner | TB-01 | type-check + tsup + export smoke | Ready |
| TB-03 | Dựng chart shell runtime | P2 | Core owner | TB-02 | pane manager + splitter smoke | Ready |
| TB-04 | Dựng indicator registry | P3 | Indicator owner | TB-02 | unit test + registry evidence | Ready |
| TB-05 | Dựng drawing tools | P4 | Interaction owner | TB-03 | serialization + undo/redo evidence | Ready |
| TB-06 | Dựng data adapter & realtime | P5 | Backend integration owner | TB-02 | adapter contract + mocked WS | Ready |
| TB-07 | Chuyển examples sang stories | P6 | Demo/regression owner | TB-03, TB-04 | visual diff + browser smoke | Completed |
| TB-08 | Bổ sung scale/perf soak | P5/P6 | QA owner | TB-06, TB-07 | k6/Locust + memory checks | Ready |
| TB-09 | Đóng closeout và bàn giao | All | Release owner | TB-01..TB-08 | closeout pass | Ready |

---

## 3. In progress lane

- Chưa có task nào được kéo vào In progress.

---

## 4. Done lane

- TB-07 — Chuyển examples sang stories (P6) → Completed.

---

## 5. Per-task execution spec

> Phần này là đặc tả chi tiết bắt buộc cho từng task. Mọi người thực hiện phải đọc đặc tả của task trước khi bắt đầu. Vi phạm scope hoặc forbidden patterns phải được ghi nhận trong [SLICE_AUDIT.md](./SLICE_AUDIT.md).

---

### TB-01 — Khóa bộ tài liệu bàn giao (P0)

**Mục tiêu:** Bảo đảm toàn bộ bộ handoff docs đầy đủ, link hợp lệ, không gãy, và module tree đã được đọc.

**Files được phép tạo/sửa:**
- `docs/TypeScript/*.md` — toàn bộ doc set trong thư mục này
- `docs/GoCharting/*.md` — nếu cần đồng bộ

**Files KHÔNG được chạm:**
- `src/` (bất kỳ file nào)
- `package.json`, `tsconfig.json`, `webpack.config.js`
- `scripts/` (chỉ chạy, không sửa)

**Lệnh exit bắt buộc:**
```bash
git diff --check -- docs/TypeScript/
python scripts/generate_module_tree.py   # đọc, không cần sửa code
```

**Deviation signals:**
- Bắt đầu tạo file `.ts` hoặc `.tsx` trước khi TB-01 done → dừng lại
- Link gãy giữa docs TypeScript → sửa trước khi đóng TB-01

---

### TB-02 — Chốt foundation build (P1)

**Mục tiêu:** tsup build được, TypeScript strict không lỗi, public API surface xuất hiện đủ.

**Files phải tạo mới:**
```
tsup.config.ts
src/index.ts                         ← public entry duy nhất
src/lib/types/ohlcv.ts               ← OHLCVBar interface
src/lib/types/pane.ts                ← PaneConfig, IndicatorConfig, YAxisConfig
src/lib/types/adapter.ts             ← StockDataAdapter interface
src/lib/types/indicator.ts           ← IndicatorDefinition interface
src/lib/types/index.ts               ← re-export tất cả types
tsconfig.json                        ← bật strict: true nếu chưa có
```

**Files được phép sửa:**
- `package.json` — thêm `build: tsup` script và tsup devDependency

**Files KHÔNG được chạm:**
- `src/lib/ChartCanvas.tsx` (legacy, để nguyên)
- `src/lib/Chart.tsx` (legacy, để nguyên)
- `config/webpack.config.js` (giữ nguyên cho demo)
- Bất kỳ file trong `src/lib/series/`, `src/lib/axes/`, `src/lib/interactive/`

**Lệnh exit bắt buộc:**
```bash
npm run type-check               # tsc --noEmit, phải PASS
npm run build                    # tsup build, phải tạo dist/
node -e "require('./dist/index.cjs')"   # smoke test CJS
# Kiểm tra exported symbols tối thiểu:
node -e "const lib = require('./dist/index.cjs'); ['OHLCVBar'].forEach(s => { if(typeof lib[s] === 'undefined') throw new Error('Missing: ' + s) })"
```

**Guards áp dụng:** G07, G08, G13, G14

**Deviation signals:**
- `tsup.config.ts` có nhiều hơn 1 entry → vi phạm G07
- `src/lib/types/` chứa `any` → vi phạm G14
- `npm run build` vẫn gọi webpack → vi phạm G13

---

### TB-03 — Dựng chart shell runtime (P2)

**Mục tiêu:** ChartTerminal, ChartPane, PaneSplitter, usePaneManager hoạt động; thêm/xóa/resize pane runtime; dual Y-axis theo config.

**Files phải tạo mới:**
```
src/lib/core/ChartTerminal.tsx
src/lib/core/ChartPane.tsx
src/lib/core/PaneSplitter.tsx
src/lib/core/hooks/usePaneManager.ts
src/lib/core/hooks/useCanvasResize.ts      ← resize observer cho canvas
src/lib/core/context/ChartSyncContext.ts
src/lib/core/context/DataContext.ts
src/lib/core/context/PaneManagerContext.ts
src/lib/core/scales/computeScales.ts       ← G11: left+right scale computation
src/lib/core/index.ts                      ← re-export core
```

**Files được phép sửa:**
- `src/index.ts` — thêm export từ core

**Files KHÔNG được chạm:**
- `src/lib/ChartCanvas.tsx` (legacy)
- `src/lib/Chart.tsx` (legacy)
- `src/lib/indicator/` (legacy compute)
- `src/lib/interactive/`
- `src/lib/series/`

**Lệnh exit bắt buộc:**
```bash
npm run type-check                                     # phải PASS
# Unit test pane manager
vitest run src/lib/core/hooks/usePaneManager.test.ts
# Smoke: addPane trả về id, removePane xóa đúng pane, resizePane update heightPx
```

**Guards áp dụng:** G01, G02, G03, G11, G12, G15

**Deviation signals:**
- Import `ChartCanvas` trong file mới → vi phạm G01
- `useState<PaneConfig[]>` ngoài `usePaneManager.ts` → vi phạm G02
- Một canvas ref được dùng bởi nhiều ChartPane → vi phạm G03
- `element.style.height =` trong PaneSplitter → vi phạm G15
- `d3.scaleLinear()` gọi trực tiếp trong ChartPane render → vi phạm G11

---

### TB-04 — Dựng indicator registry (P3)

**Mục tiêu:** IndicatorDefinition registry, compute/render tách rời, built-in set EMA/SMA/RSI/MACD/Bollinger/Volume/CVD/VolumeProfile đã đăng ký.

**Files phải tạo mới:**
```
src/lib/indicators/registry.ts
src/lib/indicators/types.ts             ← IndicatorDefinition, IndicatorStyle
src/lib/indicators/builtin/ema.ts
src/lib/indicators/builtin/sma.ts
src/lib/indicators/builtin/rsi.ts
src/lib/indicators/builtin/macd.ts
src/lib/indicators/builtin/bollinger.ts
src/lib/indicators/builtin/volume.ts
src/lib/indicators/builtin/cvd.ts
src/lib/indicators/builtin/volumeProfile.ts
src/lib/indicators/index.ts
```

**Files được phép sửa:**
- `src/index.ts` — thêm export từ indicators
- `src/lib/types/indicator.ts` — nếu cần mở rộng interface

**Files KHÔNG được chạm:**
- `src/lib/indicator/` (legacy, để nguyên hoàn toàn)
- `src/lib/calculator/` (legacy, chỉ tham khảo logic)
- `src/lib/core/` (không sửa core khi đang làm P3 trừ khi có evidence gate)

**Lệnh exit bắt buộc:**
```bash
npm run type-check
vitest run src/lib/indicators/
# Mỗi built-in phải pass unit test với sample data AAPL
# Registry smoke:
node -e "const {getIndicator} = require('./dist/index.cjs'); const ema = getIndicator('EMA'); console.log(ema.name)"
```

**Guards áp dụng:** G04, G05, G08, G14

**Deviation signals:**
- `.merge(` hoặc `.accessor(` trong file indicator mới → vi phạm G05
- Tính toán indicator bên trong `.tsx` file → vi phạm G04
- `data.ema20 = c` (mutation data object) → vi phạm G05
- `any` trong `compute` hoặc `render` signature → vi phạm G14

---

### TB-05 — Dựng drawing tools (P4)

**Mục tiêu:** Drawing tool registry, state machine idle→drawing→complete→editing, serialize/deserialize, undo/redo.

**Files phải tạo mới:**
```
src/lib/drawing/registry.ts
src/lib/drawing/stateMachine.ts        ← DrawingState enum + drawingReducer
src/lib/drawing/serialization.ts       ← serialize/deserialize DrawingObject
src/lib/drawing/history.ts             ← undo/redo stack
src/lib/drawing/types.ts               ← DrawingObject, DrawingStyle, Point (chart coords)
src/lib/drawing/builtin/trendLine.ts
src/lib/drawing/builtin/hLine.ts
src/lib/drawing/builtin/vLine.ts
src/lib/drawing/builtin/fibonacci.ts
src/lib/drawing/builtin/channel.ts
src/lib/drawing/builtin/text.ts
src/lib/drawing/index.ts
```

**Files KHÔNG được chạm:**
- `src/lib/interactive/` (legacy, chỉ tham khảo)
- `src/lib/indicators/` (không sửa khi đang làm P4)

**Lệnh exit bắt buộc:**
```bash
npm run type-check
vitest run src/lib/drawing/
# Serialize round-trip test:
# JSON.stringify(drawingObject) và JSON.parse() → phải khôi phục đúng
# Undo/redo test: thêm 3 object → undo 2 lần → redo 1 lần → state đúng
```

**Guards áp dụng:** G09, G10, G12

**Deviation signals:**
- `isDrawing: boolean` thay vì state machine → vi phạm G09
- `ctx: CanvasRenderingContext2D` trong DrawingObject → vi phạm G10
- `pixelX`, `pixelY` trong Point type → vi phạm G10 (phải là chart coordinates)
- `boolean` flag control drawing flow → vi phạm G09

---

### TB-06 — Dựng data adapter & realtime (P5)

**Mục tiêu:** StockDataAdapter interface, DjangoVnstockAdapter implementation, MockAdapter, realtime subscription, retry và error path.

**Files phải tạo mới:**
```
src/lib/adapters/StockDataAdapter.ts   ← interface (đã khai báo sơ ở TB-02, hoàn thiện ở đây)
src/lib/adapters/DjangoVnstockAdapter.ts
src/lib/adapters/MockAdapter.ts
src/lib/adapters/BaseAdapter.ts        ← retry logic, cache, dedup (optional abstract class)
src/lib/adapters/index.ts
```

**Files KHÔNG được chạm:**
- `src/lib/core/` (không thêm fetch vào core components)
- `src/lib/indicators/`
- `src/lib/drawing/`

**Lệnh exit bắt buộc:**
```bash
npm run type-check
vitest run src/lib/adapters/
# Contract test: MockAdapter implements StockDataAdapter đầy đủ
# fetchBars returns OHLCVBar[]
# subscribeToBar returns unsubscribe function
# error path: adapter throws → component nhận được error state
```

**Guards áp dụng:** G06, G08, G14

**Deviation signals:**
- `fetch('/api/...')` trực tiếp trong `src/lib/core/` → vi phạm G06
- `axios` import trong `src/lib/indicators/` → vi phạm G06
- `adapter.fetchBars(...)` return type là `any` → vi phạm G14

---

### TB-07 — Chuyển examples sang stories (P6)

**Mục tiêu:** Chuyển ít nhất 8 examples tiêu biểu thành stories/fixtures; visual diff và browser smoke pass; feature coverage map hoàn chỉnh; Storybook regression dùng builder Vite.

**Sources tham khảo (read-only):**
```
react-stockcharts-examples/README.md
```

**Files phải tạo mới:**
```
.storybook/main.ts
.storybook/preview.ts
stories/                               ← thư mục mới, không nằm trong src/
stories/support/chartTheme.ts
stories/support/storyData.ts
stories/support/StoryFrame.tsx
stories/support/ChartSurface.tsx
stories/support/exampleStories.tsx
stories/CandleStickStockScaleChartWithVolumeBarV3.stories.tsx
stories/CandleStickChartWithMACDIndicator.stories.tsx
stories/CandleStickChartWithBrush.stories.tsx
stories/CandleStickChartWithAnnotation.stories.tsx
stories/CandleStickChartWithHoverTooltip.stories.tsx
stories/CandleStickChartPanToLoadMore.stories.tsx
stories/CandleStickChartWithRSIIndicator.stories.tsx
stories/VolumeProfileChart.stories.tsx
stories/CoverageMap.md                 ← liệt kê feature cũ → component mới
```

**Files KHÔNG được chạm:**
- `react-stockcharts-examples/` (read-only source, không sửa)
- `src/lib/indicator/` (legacy, không sửa)
- `docs/` (không sửa docs khi đang viết stories)

**Lệnh exit bắt buộc:**
```bash
npm run type-check
npm run build:storybook              # storybook build phải PASS
# Browser smoke: mở story CandleStickChartPanToLoadMore, kiểm tra sidebar và preview render hoạt động
# Visual diff: screenshot so sánh với fixture (nếu đã set up)
```

**Deviation signals:**
- Copy nguyên `ChartCanvas` code cũ vào story → vi phạm G01
- Story dùng chain pattern `.merge(...)` → vi phạm G05
- Story fetch trực tiếp không qua adapter → vi phạm G06

---

### TB-08 — Scale/perf soak (P5/P6)

**Mục tiêu:** Xác minh render 20.000 bars không vượt ngưỡng, 500 WebSocket subscribers không gây memory leak, p95 API latency dưới ngưỡng chấp nhận.

**Files phải tạo:**
```
tests/soak/render_heavy.test.ts        ← benchmark canvas render
tests/soak/adapter_concurrent.test.ts  ← concurrent subscribers
```

**Deviation signals:**
- Soak test pass nhưng memory không được đo → incomplete evidence
- Benchmark không có baseline → không thể so sánh regression

---

### TB-09 — Đóng closeout (All)

**Lệnh exit bắt buộc:**
```bash
npm run type-check
npm run build
git diff --check
python scripts/generate_module_tree.py
# Mọi detection command trong ARCHITECTURE_GUARDS.md phải clean
# DELIVERY_CLOSEOUT.md final verification checklist phải đủ tick
```

**Deviation signals:**
- Bất kỳ detection command nào trong ARCHITECTURE_GUARDS.md còn output → không được đóng
