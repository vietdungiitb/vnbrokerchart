# Architecture Guards: Chống Lệch Kiến Trúc

> Tài liệu này dịch trực tiếp từ các quyết định kiến trúc đã chốt trong [ARCHITECTURE.md](./ARCHITECTURE.md) thành các **cặp ALLOWED/FORBIDDEN** cụ thể.
>
> Mọi code review và AI code generation phải đối chiếu với danh sách này trước khi merge hoặc submit bất kỳ file nào.
>
> **Khi phát hiện vi phạm:** dừng ngay, ghi nhận vào evidence block của slice tương ứng trong [SLICE_AUDIT.md](./SLICE_AUDIT.md), sửa trước khi tiếp tục.

---

## Danh sách guards

| Guard | Áp dụng từ slice | Mức độ |
| :--- | :--- | :--- |
| [G01 — Root container](#g01--root-container) | P2+ | Hard stop |
| [G02 — Pane state](#g02--pane-state) | P2+ | Hard stop |
| [G03 — Canvas isolation](#g03--canvas-isolation) | P2+ | Hard stop |
| [G04 — Indicator compute outside React](#g04--indicator-compute-outside-react) | P3+ | Hard stop |
| [G05 — IndicatorDefinition registry](#g05--indicatordefinition-registry) | P3+ | Hard stop |
| [G06 — Data access through adapter](#g06--data-access-through-adapter) | P5+ | Hard stop |
| [G07 — Public API via src/index.ts](#g07--public-api-via-srcindexts) | P1+ | Hard stop |
| [G08 — Types trong src/lib/types/](#g08--types-trong-srclibtype) | P1+ | Hard stop |
| [G09 — Drawing state machine](#g09--drawing-state-machine) | P4+ | Hard stop |
| [G10 — Drawing serialization](#g10--drawing-serialization) | P4+ | Hard stop |
| [G11 — Dual Y-axis qua YAxisConfig](#g11--dual-y-axis-qua-yaxisconfig) | P2+ | Hard stop |
| [G12 — React 19 patterns](#g12--react-19-patterns) | Tất cả slices | Hard stop |
| [G13 — Build tool là tsup](#g13--build-tool-là-tsup) | P1+ | Hard stop |
| [G14 — Không any trong public API](#g14--không-any-trong-public-api) | P1+ | Hard stop |
| [G15 — Pane resize qua callback](#g15--pane-resize-qua-callback) | P2+ | Hard stop |

---

## Chi tiết từng guard

### G01 — Root container

Kiến trúc đích dùng `ChartTerminal` làm container gốc. `ChartCanvas` là legacy, không dùng cho code mới.

**ALLOWED:**
```tsx
// src/lib/core/ChartTerminal.tsx
export function ChartTerminal({ symbol, timeframe, adapter, children }: ChartTerminalProps) { ... }

// Trong ứng dụng
<ChartTerminal symbol="VCB" timeframe="1D" adapter={djangoAdapter}>
    <ChartPane id="price" ... />
</ChartTerminal>
```

**FORBIDDEN:**
```tsx
// Dùng ChartCanvas cũ cho code mới
import ChartCanvas from '../lib/ChartCanvas'    // ← FORBIDDEN trong new code
<ChartCanvas width={...} height={...}>           // ← FORBIDDEN

// Import ChartCanvas trong src/lib/core/
import { ChartCanvas } from '../../ChartCanvas' // ← FORBIDDEN
```

**Detection:** `grep -r "import.*ChartCanvas" src/lib/core src/lib/indicators src/lib/drawing src/lib/adapters`

---

### G02 — Pane state

Danh sách pane và các thao tác thêm/xóa/resize pane phải đi qua `usePaneManager`. Không khởi tạo `useState` riêng cho mảng pane bên ngoài hook này.

**ALLOWED:**
```tsx
// Trong component
const { panes, addPane, removePane, resizePane } = usePaneManager([
    { id: 'price', heightPercent: 0.6, indicators: [] }
])
```

**FORBIDDEN:**
```tsx
// State mảng pane ngoài hook
const [panes, setPanes] = useState<PaneConfig[]>([])   // ← FORBIDDEN ngoài usePaneManager

// Class component state
this.state = { panes: [] }                              // ← FORBIDDEN

// Ref thay vì state cho pane list
const panesRef = useRef<PaneConfig[]>([])               // ← FORBIDDEN cho danh sách pane
```

**Detection:** `grep -rn "useState.*pane\|setState.*pane\|panesRef\|panes.*useRef" src/lib/core`

---

### G03 — Canvas isolation

Mỗi `ChartPane` phải có `<canvas>` riêng. Không bao giờ dùng chung canvas giữa các pane. Lý do: pane mới mount không làm canvas của pane khác redraw.

**ALLOWED:**
```tsx
// ChartPane.tsx — mỗi pane tự tạo canvas của mình
export function ChartPane({ config }: ChartPaneProps) {
    const mainCanvasRef = useRef<HTMLCanvasElement>(null)
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
    return (
        <div className="chart-pane">
            <canvas ref={mainCanvasRef} />
            <canvas ref={overlayCanvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
        </div>
    )
}
```

**FORBIDDEN:**
```tsx
// Context cung cấp canvas dùng chung cho nhiều pane
const SharedCanvasContext = createContext<HTMLCanvasElement>(null)  // ← FORBIDDEN

// ChartTerminal tạo một canvas rồi pass xuống
const canvasRef = useRef<HTMLCanvasElement>(null)
return <SharedCanvasContext.Provider value={canvasRef.current}> ... // ← FORBIDDEN
```

**Detection:** Kiểm tra `ChartPane.tsx` phải tự khai báo `useRef<HTMLCanvasElement>` nội bộ, không nhận canvas từ props/context.

---

### G04 — Indicator compute outside React

Tất cả tính toán indicator (SMA, EMA, RSI, MACD, CVD...) phải là pure TypeScript functions không phụ thuộc vào React hooks. Không compute indicator bên trong component body hoặc useEffect inline.

**ALLOWED:**
```typescript
// src/lib/indicators/builtin/ema.ts
export function computeEMA(data: OHLCVBar[], period: number): number[] {
    const k = 2 / (period + 1)
    const result: number[] = []
    // ... pure computation
    return result
}

// Trong component — chỉ gọi compute, không viết inline
const emaValues = useMemo(() => computeEMA(data, params.period), [data, params.period])
```

**FORBIDDEN:**
```tsx
// Compute inline trong component render
function ChartPane({ data }) {
    const k = 2 / (period + 1)                         // ← FORBIDDEN
    const emaValues = data.reduce((acc, d) => { ... }, [])  // ← FORBIDDEN

    // useEffect compute
    useEffect(() => {
        const result = data.map(d => d.close * 0.1 + prev * 0.9)  // ← FORBIDDEN
        setEmaData(result)
    }, [data])
}
```

**Detection:** Không có biến tính toán dữ liệu (loop, reduce, accum) trực tiếp trong `.tsx` files của `src/lib/core/` hoặc `src/lib/indicators/`; computation phải ở file `.ts` thuần.

---

### G05 — IndicatorDefinition registry

Dùng `IndicatorDefinition` và registry. Không dùng lại pattern chain cũ `ema().id(0).options(...).merge(...).accessor(...)`.

**ALLOWED:**
```typescript
// src/lib/indicators/registry.ts
registerIndicator({
    name: 'EMA',
    defaultParams: { period: 20 },
    computeExtents: (data, params) => {
        const values = computeEMA(data, params.period)
        return [Math.min(...values), Math.max(...values)]
    },
    compute: (data, params) => computeEMA(data, params.period),
    render: (ctx, renderContext, params) => { /* canvas drawing */ },
})

// Dùng registry trong ChartPane
const indicator = getIndicator('EMA')
const values = indicator.compute(visibleData, config.params)
```

**FORBIDDEN:**
```typescript
// Pattern chain cũ
import { ema } from '../../lib/indicator'
const ema20 = ema()
    .id(0)
    .options({ windowSize: 20 })
    .merge((d, c) => { d.ema20 = c })     // ← FORBIDDEN
    .accessor(d => d.ema20)               // ← FORBIDDEN

// Mutate data object để gắn indicator
d.ema20 = computedValue                   // ← FORBIDDEN — dữ liệu phải immutable
```

**Detection:** `grep -rn "\.merge\|\.accessor\|\.id(" src/lib/indicators src/lib/core`

---

### G06 — Data access through adapter

Component không được gọi `fetch()`, `axios`, hay bất kỳ HTTP client nào trực tiếp. Mọi truy cập dữ liệu phải qua `StockDataAdapter` interface.

**ALLOWED:**
```tsx
// Nhận adapter qua context
const adapter = useContext(DataContext)

// Gọi qua interface
const bars = await adapter.fetchBars({ symbol: 'VCB', timeframe: '1D', limit: 300 })
const unsub = adapter.subscribeToBar({ symbol: 'VCB', timeframe: '1D' }, (bar) => { ... })
```

**FORBIDDEN:**
```tsx
// Fetch trực tiếp trong component
useEffect(() => {
    fetch('/api/v1/bars/VCB?tf=1D')         // ← FORBIDDEN
        .then(r => r.json())
        .then(data => setData(data))
}, [])

// axios trực tiếp
import axios from 'axios'
const { data } = await axios.get('/api/bars')  // ← FORBIDDEN trong component
```

**Detection:** `grep -rn "import.*axios\|fetch(" src/lib/core src/lib/indicators src/lib/drawing`

---

### G07 — Public API via src/index.ts

Người dùng thư viện chỉ được import từ package root. Không export internal paths.

**ALLOWED:**
```typescript
// src/index.ts — entry duy nhất
export { ChartTerminal } from './lib/core/ChartTerminal'
export { ChartPane } from './lib/core/ChartPane'
export { PaneSplitter } from './lib/core/PaneSplitter'
export { usePaneManager } from './lib/core/hooks/usePaneManager'
export { registerIndicator, getIndicator } from './lib/indicators/registry'
export type { OHLCVBar, PaneConfig, IndicatorDefinition, StockDataAdapter } from './lib/types'
```

**FORBIDDEN:**
```typescript
// package.json "exports" trỏ vào đường dẫn sâu
{
  "exports": {
    "./core": "./dist/lib/core/index.js"        // ← FORBIDDEN
  }
}

// Người dùng import sâu
import { computeEMA } from 'my-lib/lib/indicators/builtin/ema'  // ← FORBIDDEN
```

**Detection:** `tsup.config.ts` phải chỉ có `entry: ['src/index.ts']`; không có entry phụ nào trỏ vào internal.

---

### G08 — Types trong src/lib/types/

Tất cả interface và type được export ra public API phải nằm trong `src/lib/types/`. Không khai báo public contract inline trong file component.

**ALLOWED:**
```typescript
// src/lib/types/ohlcv.ts
export interface OHLCVBar {
    date: Date
    open: number; high: number; low: number; close: number; volume: number
    buyVolume?: number; sellVolume?: number; openInterest?: number
}

// src/lib/types/pane.ts
export interface PaneConfig { ... }
export interface IndicatorConfig { ... }
export interface YAxisConfig { ... }

// src/lib/types/adapter.ts
export interface StockDataAdapter { ... }

// src/lib/types/indicator.ts
export interface IndicatorDefinition { ... }
```

**FORBIDDEN:**
```tsx
// ChartTerminal.tsx — khai báo public interface inline
export interface OHLCVBar { ... }       // ← FORBIDDEN, phải ở src/lib/types/

// Định nghĩa type chỉ dùng nội bộ nhưng export ra
// src/lib/core/ChartTerminal.tsx
export type PaneConfig = { ... }        // ← FORBIDDEN nếu là public contract
```

**Detection:**

```bash
# Public API phải lấy type contracts từ src/lib/types thông qua src/index.ts
grep -n "export type" src/index.ts
grep -n "from './lib/types" src/index.ts

# Nội bộ module được phép export type helper, nhưng không được leak contract mới ra ngoài src/index.ts
grep -rn "export interface OHLCVBar\|export interface PaneConfig\|export interface StockDataAdapter\|export interface IndicatorDefinition" src/lib/core src/lib/indicators src/lib/drawing
```

Kết quả kỳ vọng: các contract public cốt lõi không được khai báo lại ngoài `src/lib/types/`.

---

### G09 — Drawing state machine

Drawing tools phải dùng state machine rõ ràng với enum states. Không dùng boolean flags rời rạc.

**ALLOWED:**
```typescript
// src/lib/drawing/stateMachine.ts
export type DrawingState =
    | { type: 'idle' }
    | { type: 'drawing'; toolName: string; startPoint: Point }
    | { type: 'complete'; object: DrawingObject }
    | { type: 'editing'; objectId: string; handle: string }

export function drawingReducer(state: DrawingState, action: DrawingAction): DrawingState { ... }
```

**FORBIDDEN:**
```typescript
// Boolean flags rời rạc
let isDrawing = false                    // ← FORBIDDEN
let drawingTool: string | null = null    // ← FORBIDDEN

const [isDrawingMode, setIsDrawingMode] = useState(false)  // ← FORBIDDEN thay cho state machine
const [currentTool, setCurrentTool] = useState<string | null>(null)  // ← FORBIDDEN
```

**Detection:** `grep -rn "isDrawing\|drawingMode\|boolean.*draw\|draw.*boolean" src/lib/drawing`

---

### G10 — Drawing serialization

Drawing objects phải JSON-serializable tại mọi thời điểm. Không lưu canvas context, DOM node, hay function vào drawing state.

**ALLOWED:**
```typescript
// src/lib/drawing/types.ts
export interface DrawingObject {
    id: string
    type: string                        // 'TrendLine' | 'Fibonacci' | ...
    points: Array<{ x: number; y: number }>  // chart coordinates, not pixel
    style: DrawingStyle                 // JSON-serializable style
    metadata?: Record<string, string | number | boolean>
}

// Serialize/deserialize
const json = JSON.stringify(drawingObjects)      // ← phải không throw
const restored = JSON.parse(json) as DrawingObject[]
```

**FORBIDDEN:**
```typescript
// Lưu canvas context
interface DrawingObject {
    ctx: CanvasRenderingContext2D       // ← FORBIDDEN
    domElement: HTMLElement             // ← FORBIDDEN
    renderFn: () => void                // ← FORBIDDEN
}

// Pixel coordinates (sẽ sai khi resize)
points: [{ pixelX: 234, pixelY: 567 }]  // ← FORBIDDEN — phải dùng chart coordinates
```

**Detection:** `JSON.stringify(drawingObjects)` trong unit test phải không throw; pixel coordinates phải bị chặn ở type level.

---

### G11 — Dual Y-axis qua YAxisConfig

Scale thứ 2 phải được tính bởi `computeScales()` trong `ChartPane`. Không tự tính scale inline.

**ALLOWED:**
```typescript
// src/lib/core/ChartPane.tsx
const { leftScale, rightScale } = useMemo(
    () => computeScales(config, visibleData, canvasHeight),
    [config, visibleData, canvasHeight]
)

// PaneConfig khai báo rightAxis
const config: PaneConfig = {
    indicators: [
        { name: 'Candlestick', yAxis: 'left' },
        { name: 'Volume', yAxis: 'right' },
    ],
    rightAxis: { autoScale: true }
}
```

**FORBIDDEN:**
```tsx
// Tự tính scale thứ 2 inline trong component render
const volumeMax = Math.max(...data.map(d => d.volume))  // ← FORBIDDEN inline
const rightScale = d3.scaleLinear()                       // ← FORBIDDEN ngoài computeScales
    .domain([0, volumeMax])
    .range([height, height * 0.75])

// Hard-code secondary scale range
const y = (height * 0.25) * (volume / volumeMax)          // ← FORBIDDEN
```

**Detection:** `grep -rn "d3.scaleLinear\|scaleLinear()" src/lib/core/ChartPane` — phải chỉ xuất hiện trong `computeScales`, không ở render trực tiếp.

---

### G12 — React 19 patterns

Bắt buộc theo React 19 source patterns cho mọi file React/JSX/TSX trong project. Đây là hard rule, không phải gợi ý.

**ALLOWED:**
```tsx
// Function component
export function ChartTerminal(props: ChartTerminalProps) { ... }

// ref-as-prop (React 19 way)
export function ChartPane({ ref, ...props }: ChartPaneProps & { ref?: Ref<HTMLDivElement> }) { ... }

// createRoot
createRoot(document.getElementById('root')!).render(<App />)

// useRef với null
const canvasRef = useRef<HTMLCanvasElement>(null)

// createContext
const ChartSyncContext = createContext<ChartSyncValue | null>(null)
```

**FORBIDDEN:**
```tsx
// Class component cho code mới
class ChartPane extends React.Component { render() { ... } }  // ← FORBIDDEN

// forwardRef khi ref-as-prop đủ (React 19)
const ChartPane = forwardRef<HTMLDivElement, Props>((props, ref) => { ... })  // ← FORBIDDEN khi không cần

// ReactDOM.render()
ReactDOM.render(<App />, document.getElementById('root'))     // ← FORBIDDEN

// React.FC type
const ChartTerminal: React.FC<Props> = (props) => { ... }    // ← FORBIDDEN

// defaultProps
ChartPane.defaultProps = { height: '20%' }                    // ← FORBIDDEN cho code mới

// String refs
<div ref="myRef">                                             // ← FORBIDDEN
```

**Detection:** Chạy linter rule React 19 source patterns đã cài sẵn trong workspace.

---

### G13 — Build tool là tsup

Library build phải dùng `tsup`. Không thêm webpack dependency vào library output.

**ALLOWED:**
```typescript
// tsup.config.ts
export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ['react', 'react-dom', 'd3-*'],
})
```

**FORBIDDEN:**
```javascript
// webpack.config.js cho library output
module.exports = {
    entry: './src/index.ts',
    output: { library: 'MyLib', libraryTarget: 'umd' }  // ← FORBIDDEN cho library
}

// package.json scripts dùng webpack cho library
"build": "webpack --config config/webpack.config.js"     // ← FORBIDDEN cho library build
```

**Detection:** `package.json` phải có `"build": "tsup"` (không phải webpack). `webpack.config.js` chỉ được giữ nếu có script tách biệt rõ ràng là `"build:demo"`.

---

### G14 — Không any trong public API

Public types và exported functions phải strict typed. Không có `any` trong `src/lib/types/` và `src/index.ts`.

**ALLOWED:**
```typescript
// Dùng generics hoặc Record thay any
export interface IndicatorDefinition<P extends Record<string, unknown> = Record<string, unknown>> {
    name: string
    compute: (data: OHLCVBar[], params: P) => number[]
}

// unknown cho input chưa xác định
compute: (data: OHLCVBar[], params: unknown) => number[]  // ← ACCEPTABLE nếu validated trước dùng
```

**FORBIDDEN:**
```typescript
// any trong public types
export interface IndicatorDefinition {
    params: any                         // ← FORBIDDEN
    compute: (data: any, params: any) => any  // ← FORBIDDEN
}

// @ts-ignore trong public API files
// @ts-ignore                          // ← FORBIDDEN trong src/lib/types/ và src/index.ts
export function registerIndicator(def: any) { ... }  // ← FORBIDDEN
```

**Detection:** `npx tsc --strict --noImplicitAny --noEmit --project tsconfig.json 2>&1 | grep "src/lib/types\|src/index"` phải cho output rỗng.

---

### G15 — Pane resize qua callback

Resize pane thông qua `resizePane` callback, không mutation DOM style trực tiếp.

**ALLOWED:**
```tsx
// PaneSplitter.tsx
<PaneSplitter onResize={(newHeightPx) => resizePane(pane.id, newHeightPx)} />

// usePaneManager xử lý state update
const resizePane = useCallback((id: string, newHeightPx: number) => {
    setPanes(prev => prev.map(p =>
        p.id === id ? { ...p, heightPx: Math.max(p.minHeightPx ?? 40, newHeightPx) } : p
    ))
}, [])

// React re-render → ChartPane tính lại height từ state
```

**FORBIDDEN:**
```tsx
// Mutation DOM style trực tiếp
const topPane = splitterRef.current?.previousElementSibling as HTMLElement
topPane.style.height = newHeight + 'px'   // ← FORBIDDEN

// Flex manipulation trực tiếp
topPane.style.flex = `0 0 ${newHeight}px` // ← FORBIDDEN

// Imperative canvas resize
canvas.height = newHeight                  // ← FORBIDDEN trong drag handler, dùng state để trigger
```

**Detection:** `grep -rn "\.style\.height\|\.style\.flex\|canvas\.height.*=" src/lib/core/PaneSplitter`

---

## Quy trình dùng guards trong code review

1. Trước mỗi PR/commit, reviewer chạy tất cả detection commands trên.
2. Nếu phát hiện vi phạm: ghi vào evidence block của slice hiện tại, yêu cầu fix trước merge.
3. Guards G01–G15 là hard stops — không được override bằng comment hay owner approval trừ khi có lý do kiến trúc được ghi nhận vào [ARCHITECTURE.md](./ARCHITECTURE.md) và [AUDIT_LEDGER.md](./AUDIT_LEDGER.md).
4. Mọi exception phải có approval từ release owner và được ghi rõ lý do.

---

## Audit file list

- `docs/TypeScript/ARCHITECTURE_GUARDS.md` (file này)
