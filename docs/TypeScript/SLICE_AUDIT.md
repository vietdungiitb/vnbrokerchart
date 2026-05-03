# Slice Audit: TypeScript Delivery Evidence

> Sau mỗi slice, code team phải điền một block evidence đầy đủ vào file này. Không có evidence thì slice chưa được coi là hoàn tất.

---

## 1. Evidence template chung

```text
Người thực hiện:
Ngày:
Slice:
Mục tiêu:
Files touched:
  -
Lệnh xác minh:
  -
Kết quả quan sát:
  -
Rủi ro còn lại:
Kết luận: PASS / FAIL
```

---

## 2. Slice evidence blocks

### P0 — Audit & chuẩn hóa

- Scope: thống nhất lộ trình, kiến trúc, quy định phát triển và inventory.
- Required evidence:
  - Link hợp lệ tới `HANDOFF_MANIFEST.md`, `ROADMAP.md`, `IMPLEMENTATION_PLAN.md`, `DEVELOPMENT_RULES.md`.
  - `module_tree_full.md` đã được đọc và ghi nhận trong quá trình khởi tạo work.
- Required commands:
  - `git diff --check`
  - `python scripts/generate_module_tree.py`
- Pass criteria:
  - Doc set đầy đủ, link không gãy, inventory khớp repository hiện tại.

### P1 — Foundation

- Scope: tsup, strict TypeScript, public entrypoint, public types.
- Required evidence:
  - Cấu hình build/entrypoint.
  - API export smoke hoặc unit test cho public surface.
  - Kết quả build output và declaration output.
- Required commands:
  - `npm run type-check`
  - `npm run build`
  - `npm pack` hoặc build kiểm tra bundle
- Pass criteria:
  - Build và type-check pass, package surface ổn định.

**File existence checks (phải có sau TB-02):**
```
tsup.config.ts                  → tồn tại, entry: ['src/index.ts']
src/index.ts                    → tồn tại, chứa export
src/lib/types/ohlcv.ts          → tồn tại, export interface OHLCVBar
src/lib/types/pane.ts           → tồn tại, export interface PaneConfig, IndicatorConfig, YAxisConfig
src/lib/types/adapter.ts        → tồn tại, export interface StockDataAdapter
src/lib/types/indicator.ts      → tồn tại, export interface IndicatorDefinition
dist/index.js                   → sau build, tồn tại
dist/index.d.ts                 → sau build, tồn tại
```

**Symbol export checks:**
```bash
# Chạy sau npm run build
node -e "
const lib = require('./dist/index.cjs')
const required = ['OHLCVBar']
// type-only checks qua tsc
"
npx tsc --strict --noEmit --project tsconfig.json
```

**Architecture guard checks (G07, G08, G13, G14):**
```bash
# G13: tsup dùng trong build
grep -n "tsup" package.json                                    # phải có
grep -n "webpack" package.json | grep '"build"'                # phải không có

# G08: types không khai báo inline trong core
# (chưa có src/lib/core/ ở P1, nên check chỉ cần src/lib/types/ tồn tại)
ls src/lib/types/                                              # phải có 4+ file

# G14: không any trong public types
npx tsc --strict --noImplicitAny --noEmit 2>&1 | grep "src/lib/types"  # phải trống
```

### P2 — Chart shell

- Scope: ChartTerminal, ChartPane, usePaneManager, PaneSplitter, dual Y-axis.
- Required evidence:
  - Danh sách pane runtime và ảnh/chụp màn hình browser smoke.
  - Test drag-resize và render multi-pane.
- Required commands:
  - `npm run type-check`
  - test component hẹp hoặc Playwright smoke
- Pass criteria:
  - Thêm/xóa/resize pane hoạt động, layout không vỡ.

**File existence checks (phải có sau TB-03):**
```
src/lib/core/ChartTerminal.tsx
src/lib/core/ChartPane.tsx
src/lib/core/PaneSplitter.tsx
src/lib/core/hooks/usePaneManager.ts
src/lib/core/context/ChartSyncContext.ts
src/lib/core/context/DataContext.ts
src/lib/core/scales/computeScales.ts
```

**Architecture guard checks (G01, G02, G03, G11, G12, G15):**
```bash
# G01: không import ChartCanvas trong code mới
grep -rn "import.*ChartCanvas" src/lib/core src/lib/indicators
# phải không có kết quả

# G02: usePaneManager là nơi duy nhất quản lý mảng pane
grep -rn "useState.*\[\]" src/lib/core/ChartTerminal.tsx src/lib/core/ChartPane.tsx
# phải không có useState<PaneConfig[]> ngoài usePaneManager

# G03: mỗi ChartPane tự khai báo canvas ref
grep -n "useRef.*HTMLCanvasElement" src/lib/core/ChartPane.tsx
# phải có ít nhất 1 kết quả

# G11: computeScales được gọi trong ChartPane, không có scaleLinear inline
grep -n "scaleLinear" src/lib/core/ChartPane.tsx
# phải không có kết quả (chỉ trong computeScales.ts)

# G15: không mutation style.height
grep -rn "\.style\.height\|\.style\.flex" src/lib/core/PaneSplitter.tsx
# phải không có kết quả
```

### P3 — Indicator registry

- Scope: registry, compute/render split, built-in indicators.
- Required evidence:
  - Unit test cho indicator compute.
  - Registry entries và parameter schema.
  - Smoke render cho ít nhất một indicator overlay và một indicator pane.
- Required commands:
  - `npm run type-check`
  - `vitest`
- Pass criteria:
  - Indicator pass unit test và render đúng trên sample data.

**File existence checks (phải có sau TB-04):**
```
src/lib/indicators/registry.ts
src/lib/indicators/types.ts
src/lib/indicators/builtin/ema.ts
src/lib/indicators/builtin/sma.ts
src/lib/indicators/builtin/rsi.ts
src/lib/indicators/builtin/macd.ts
src/lib/indicators/builtin/bollinger.ts
src/lib/indicators/builtin/volume.ts
src/lib/indicators/builtin/cvd.ts
```

**Architecture guard checks (G04, G05, G08, G14):**
```bash
# G05: không dùng chain pattern cũ
grep -rn "\.merge(\|\.accessor(\|\.id(" src/lib/indicators
# phải không có kết quả

# G04: không compute inline trong tsx
grep -rn "reduce\|forEach\|for.*of" src/lib/core
# kiểm tra thủ công: không có vòng lặp tính toán indicator trong .tsx

# G14: không any trong indicator public signature
grep -rn ": any" src/lib/indicators/registry.ts src/lib/indicators/types.ts
# phải không có kết quả

# Registry smoke
node -e "const {getIndicator}=require('./dist/index.cjs'); ['EMA','SMA','RSI','MACD','Volume'].forEach(n=>{const i=getIndicator(n);if(!i)throw new Error('Missing: '+n);console.log('OK:',n)})"
```

### P4 — Drawing tools

- Scope: drawing state machine, serialization, undo/redo.
- Required evidence:
  - History state capture.
  - Serialize/deserialize fixture.
  - Interaction smoke cho tạo/sửa/xóa.
- Required commands:
  - `npm run type-check`
  - Playwright interaction smoke
- Pass criteria:
  - Object vẽ ổn định qua lưu/khôi phục, không mất state.

**File existence checks (phải có sau TB-05):**
```
src/lib/drawing/registry.ts
src/lib/drawing/stateMachine.ts
src/lib/drawing/serialization.ts
src/lib/drawing/history.ts
src/lib/drawing/types.ts
src/lib/drawing/builtin/trendLine.ts
src/lib/drawing/builtin/fibonacci.ts
```

**Architecture guard checks (G09, G10):**
```bash
# G09: không dùng boolean flags cho drawing state
grep -rn "isDrawing\|drawingMode" src/lib/drawing
# phải không có kết quả

# G10: DrawingObject JSON-serializable
# Unit test: JSON.stringify(sampleDrawingObject) phải không throw

# G10: không có pixel coordinates trong type
grep -rn "pixelX\|pixelY\|screenX\|screenY" src/lib/drawing/types.ts
# phải không có kết quả

# G10: không lưu canvas context
grep -rn "CanvasRenderingContext2D" src/lib/drawing/types.ts
# phải không có kết quả (chỉ được phép trong DrawingDefinition.render)
```

### P5 — Data adapter

- Scope: StockDataAdapter, DjangoVnstockAdapter, realtime loader.
- Required evidence:
  - Mocked API responses.
  - WebSocket subscription path hoặc contract test.
  - Cache/dedupe behavior.
- Required commands:
  - `npm run type-check`
  - integration tests cho adapter
- Pass criteria:
  - Adapter fetch, subscribe và error path đúng contract.

**File existence checks (phải có sau TB-06):**
```
src/lib/adapters/StockDataAdapter.ts
src/lib/adapters/DjangoVnstockAdapter.ts
src/lib/adapters/MockAdapter.ts
src/lib/adapters/index.ts
```

**Architecture guard checks (G06, G08, G14):**
```bash
# G06: không có raw fetch/axios trong core hoặc indicators
grep -rn "import.*axios\|fetch(" src/lib/core src/lib/indicators src/lib/drawing
# phải không có kết quả

# G06: đảm bảo DjangoVnstockAdapter implements StockDataAdapter đầy đủ
npx tsc --noEmit --strict 2>&1 | grep DjangoVnstockAdapter
# phải không có type error

# Contract test: MockAdapter phải trả OHLCVBar[] đúng shape
# vitest run src/lib/adapters/MockAdapter.test.ts
```

### P6 — Examples conversion

- Scope: chuyển examples sang stories/regression fixtures.
- Required evidence:
  - Danh sách example đã chuyển.
  - Screenshot diff hoặc storybook artifact.
  - Coverage map chứng minh feature inventory đã được cover.
- Required commands:
  - `npm run type-check`
  - storybook build
  - browser smoke
- Pass criteria:
  - Stories chạy được, layout và behavior khớp mục tiêu kiến trúc.

---

## 3. Cách điền evidence sau mỗi slice

1. Chọn đúng section P0–P6.
2. Dán template evidence đã hoàn thành.
3. Ghi rõ lệnh chạy và kết quả quan sát được.
4. Liệt kê file đã chạm.
5. Chốt `PASS` hoặc `FAIL`.
