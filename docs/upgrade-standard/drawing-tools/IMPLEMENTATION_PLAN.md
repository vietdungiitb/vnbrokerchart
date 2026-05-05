# Implementation Plan: Drawing Tools Engine

## 1. Tiền đề đã hoàn thành (không cần làm lại)

| Hạng mục | File | Trạng thái |
| :--- | :--- | :--- |
| DrawingObject data model | `src/lib/drawing/types.ts` | ✅ Done |
| State machine (idle/drawing/complete/selected/moving/resizing/editing) | `src/lib/drawing/stateMachine.ts` | ✅ Done |
| History reducer (push/undo/redo/clear) | `src/lib/drawing/history.ts` | ✅ Done |
| JSON serialization/deserialization | `src/lib/drawing/serialization.ts` | ✅ Done |
| Tool registry | `src/lib/drawing/registry.ts` | ✅ Done |
| 6 built-in tools (data model, render stub) | `src/lib/drawing/builtin/` | ✅ Done |
| Toolbar UI (8 buttons, activeTool state) | `src/demo/LibraryShowcaseDemo.tsx` | ✅ Done |

## 2. Nguyên tắc bắt buộc cho cả 3 milestone

1. **Không thay thế** data model đã kiểm chứng — chỉ extend optional fields.
2. **Không import** `src/demo/**` từ bất kỳ file nào trong `src/lib/**`.
3. **DrawingObject.points** luôn lưu chart coordinates (timestamp + price), không bao giờ lưu pixel.
4. **Mọi text UI mới** phải có i18n key trong `src/demo/i18n.tsx`.
5. **type-check PASS** trước khi đóng mỗi milestone.
6. **module_tree_full.md** phải được regenerate sau khi thêm file mới.

## 3. Milestone M1 — Core Drawing Engine

**Mục tiêu:** Người dùng có thể chọn tool, vẽ đường lên chart, undo/redo, xóa.

### Phase M1-P0: Coordinate foundation

**Thứ tự file bắt buộc** (dependency chain — không được đảo):

#### Bước 1: `src/lib/drawing/coordinateUtils.ts` (TẠO MỚI)

**Phụ thuộc:** Không có — pure functions.

**Spec:**
```typescript
export interface PlotDatum {
  date: Date | number;
  open: number; high: number; low: number; close: number;
  volume: number;
  [key: string]: unknown;
}

export interface ChartScales {
  xScale: (date: Date) => number;
  xScaleInvert: (px: number) => Date;
  yScale: (price: number) => number;
  yScaleInvert: (px: number) => number;
}

export function pixelToChartPoint(
  clientX: number, clientY: number,
  containerRect: DOMRect,
  scales: ChartScales
): Point;

export function chartPointToPixel(
  point: Point,
  scales: ChartScales
): { x: number; y: number };
```

**Test:** Unit test — roundtrip pixel → chartPoint → pixel phải giữ nguyên trong sai số 1px.

---

#### Bước 2: `src/lib/drawing/renderSvg.ts` (TẠO MỚI)

**Phụ thuộc:** `coordinateUtils.ts` (bước 1).

**Spec:**
```typescript
// Render functions thuần — không side effects
export function renderDrawingToSvg(
  drawing: DrawingObject,
  scales: ChartScales,
  options: { chartWidth: number; chartHeight: number; isSelected: boolean }
): ReactElement[];

// Internal helpers (không export):
// renderTrendLine, renderHLine, renderVLine,
// renderFibonacci, renderChannel, renderText,
// renderRectangle, renderArrow
```

**Fibonacci levels:** `[0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.618, 2.618]`

Mỗi level = 1 SVG `<line>` + 1 SVG `<text>` label bên phải: `"61.8% — 94,250.00"`

**Channel:** 2 lines song song. P1→P2 là line chính; P3 xác định offset. Line thứ 2 = P1 + offset → P2 + offset.

**Arrow:** Render `<line>` thân + `<polygon>` đầu mũi tên theo hướng P1→P2.

**Rectangle:** Render `<rect>` với fill bán trong suốt.

**Text:** Render `<foreignObject>` chứa `<input>` khi editing, hoặc `<text>` SVG khi committed.

---

#### Bước 3: `src/lib/drawing/useDrawingInteraction.ts` (TẠO MỚI)

**Phụ thuộc:** `stateMachine.ts`, `history.ts` (đã có).

```typescript
export interface UseDrawingInteractionReturn {
  drawingState: DrawingState;
  history: DrawingHistory;
  dispatch: Dispatch<DrawingAction | DrawingHistoryAction>;
  undo: () => void;
  redo: () => void;
  deleteSelected: () => void;
  cancelDrawing: () => void;
  canUndo: boolean;
  canRedo: boolean;
  allDrawings: DrawingObject[];  // history.present
}
```

---

#### Bước 4: `src/lib/drawing/DrawingLayer.tsx` (TẠO MỚI)

**Phụ thuộc:** bước 1 + 2 + 3.

```typescript
export interface DrawingLayerProps {
  width: number;
  height: number;
  scales: ChartScales;
  activeTool: string;
  interaction: UseDrawingInteractionReturn;  // từ hook ở demo
}
```

**SVG overlay:** `position: absolute; top: 0; left: 0; pointer-events: all; z-index: 10`

**Event map:**
- `onPointerDown` → pixelToChartPoint → dispatch `START_DRAWING` (khi tool != "cursor")
- `onPointerMove` → dispatch `UPDATE_DRAWING` (khi state.type === "drawing")
- `onPointerUp` → dispatch `COMPLETE_DRAWING` → historyReducer `PUSH`
- click trên drawing element → dispatch `SELECT_OBJECT`
- drag selected drawing handle → dispatch `START_MOVING` → `COMPLETE_DRAWING`

---

### Phase M1-P1: New built-in tools

#### Bước 5: `src/lib/drawing/builtin/rectangle.ts` (TẠO MỚI)

```typescript
const Rectangle: DrawingToolDefinition = {
  name: "rectangle",
  createDraft: (startPoint) => createDrawingObject("rectangle", [startPoint, startPoint]),
  updateDraft: (draft, nextPoint) => replacePoint(draft, 1, nextPoint),
  render: () => undefined,  // render xử lý trong renderSvg.ts
};
```

#### Bước 6: `src/lib/drawing/builtin/arrow.ts` (TẠO MỚI)

```typescript
const Arrow: DrawingToolDefinition = {
  name: "arrow",
  createDraft: (startPoint) => createDrawingObject("arrow", [startPoint, startPoint]),
  updateDraft: (draft, nextPoint) => replacePoint(draft, 1, nextPoint),
  render: () => undefined,
};
```

---

### Phase M1-P2: Type extension

#### Bước 7: `src/lib/drawing/types.ts` (SỬA)

Thêm vào `DrawingToolType` union:
```typescript
| "rectangle"
| "arrow"
```

Thêm optional fields vào `DrawingObject`:
```typescript
fibLevels?: number[];   // custom fib levels — undefined = dùng default
label?: string;         // user label
```

---

### Phase M1-P3: Export + registry

#### Bước 8: `src/lib/drawing/index.ts` (SỬA)

Thêm exports:
- `DrawingLayer`, `useDrawingInteraction`, từ `coordinateUtils`
- `Rectangle`, `Arrow`
- Gọi `registerDrawingTool(Rectangle)`, `registerDrawingTool(Arrow)`

---

### Phase M1-P4: Demo wiring

#### Bước 9: `src/demo/LibraryShowcaseDemo.tsx` (SỬA)

**Thêm:**
1. `useDrawingInteraction()` hook call.
2. `useEffect` cho keyboard: `keydown` → Ctrl+Z undo, Ctrl+Y redo, ESC cancelDrawing, Delete/Backspace deleteSelected.
3. Mount `DrawingLayer` trong `position: relative` wrapper bao quanh chart area.
4. Thêm `"rectangle"` và `"arrow"` vào `TOOL_DEFS`.
5. `ToolIcon` — thêm case `"rectangle"` và `"arrow"`.

**Không thêm:**
- Không sửa routing hay layout shell.
- Không thêm state mới ngoài `useDrawingInteraction`.

---

#### Bước 10: `src/demo/i18n.tsx` (SỬA)

Thêm vào cả `vi` và `en`:
```
"tool.rectangle" → "Rectangle"
"tool.arrow" → "Arrow"
```

---

#### Bước 11: `src/demo/demo.css` (SỬA)

Thêm:
```css
/* Drawing cursor modes */
.gc-chart-area--drawing-trend { cursor: crosshair; }
.gc-chart-area--drawing-hline { cursor: ns-resize; }
.gc-chart-area--drawing-vline { cursor: ew-resize; }
.gc-chart-area--drawing-text  { cursor: text; }

/* Drawing object handles */
.rsc-drawing-handle { cursor: grab; }
.rsc-drawing-handle:active { cursor: grabbing; }

/* Selected drawing highlight */
.rsc-drawing-selected { outline: 1.5px solid #2d9cdb; }
```

---

### Gate M1

```
✅ npm run type-check → PASS, zero error
✅ npm run test        → PASS (unit tests coordinateUtils + renderSvg roundtrip)
✅ python scripts/generate_module_tree.py → chạy thành công
✅ Browser smoke:
   - Chọn Trend Line → vẽ đường trên chart → đường xuất hiện đúng mức giá
   - Chọn H-Line → đường ngang full width
   - Chọn V-Line → đường dọc tại bar đó
   - Chọn Fibonacci → 9 level labels
   - Ctrl+Z undo → đường biến mất
   - Ctrl+Y redo → đường quay lại
   - ESC → hủy đang vẽ
   - Delete → xóa selected drawing
```

---

## 4. Milestone M2 — Inspector + Persistence

**Mục tiêu:** Drawing có thuộc tính chỉnh được; lưu per symbol+timeframe; export/import.

**Thứ tự bắt buộc:**

### Bước 1: `src/lib/drawing/DrawingStorage.ts` (TẠO MỚI)

```typescript
export interface DrawingStorage {
  saveDrawings(symbol: string, timeframe: string, drawings: DrawingObject[]): void;
  loadDrawings(symbol: string, timeframe: string): DrawingObject[];
  clearDrawings(symbol: string, timeframe: string): void;
  exportJSON(): string;
  importJSON(json: string): DrawingObject[];
}

export function createLocalStorageDrawingStorage(): DrawingStorage;
```

Storage key: `rsc-drawings-v1-${symbol}-${tf}`

Validate payload trước khi import: phải là array, mỗi phần tử phải có `id`, `type`, `points`, `style`, `createdAt`. Throw nếu invalid.

### Bước 2: `src/lib/drawing/useDrawingStorage.ts` (TẠO MỚI)

```typescript
export function useDrawingStorage(
  symbol: string,
  timeframe: string,
  drawings: DrawingObject[],
  onLoad: (drawings: DrawingObject[]) => void
): {
  exportJSON: () => void;   // trigger file download
  importJSON: (file: File) => void;
};
```

Auto-save khi `drawings` thay đổi. Load on mount.

### Bước 3: `src/lib/drawing/DrawingInspector.tsx` (TẠO MỚI)

Floating panel — hiện khi có `selectedDrawing`.

```typescript
export interface DrawingInspectorProps {
  drawing: DrawingObject | null;
  onUpdate: (updated: DrawingObject) => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onClose: () => void;
}
```

**Controls:**
- Color swatch (stroke) — `<input type="color">`
- Stroke width — `<input type="range" min="1" max="5">`
- Line style — dropdown: Solid / Dashed / Dotted
- Lock/Unlock toggle button
- Delete button

### Bước 4: `src/lib/drawing/types.ts` (SỬA)

Thêm optional vào `DrawingObject`:
```typescript
symbol?: string;
timeframe?: string;
```

Sửa `DrawingStyle.strokeDasharray`:
```typescript
strokeDasharray?: "solid" | "dashed" | "dotted";
```

### Bước 5: `src/lib/drawing/index.ts` (SỬA)

Export: `DrawingInspector`, `DrawingStorage`, `useDrawingStorage`, `createLocalStorageDrawingStorage`.

### Bước 6: `src/demo/LibraryShowcaseDemo.tsx` (SỬA)

- Thêm `useDrawingStorage("BTCUSD", timeframe, allDrawings, onLoad)`.
- Mount `DrawingInspector` khi `drawingState.type === "selected"`.
- Export/Import button trong toolbar drawing area.

### Bước 7: `src/demo/i18n.tsx` + `src/demo/demo.css` (SỬA)

i18n keys:
```
"drawing.color", "drawing.strokeWidth", "drawing.lineStyle",
"drawing.solid", "drawing.dashed", "drawing.dotted",
"drawing.lock", "drawing.unlock", "drawing.exportJson", "drawing.importJson"
```

CSS: inspector panel, color swatch, slider, lock icon.

### Gate M2

```
✅ npm run type-check → PASS
✅ Browser smoke:
   - Click drawing → inspector panel hiện
   - Đổi màu → đường đổi màu ngay
   - Lock → drag không di chuyển được
   - Reload page → drawings vẫn còn
   - Export JSON → file tải về
   - Import JSON file → drawings restore
```

---

## 5. Milestone M3 — Advanced Tools + Alert Markers

**Mục tiêu:** Công cụ phân tích chuyên nghiệp: measure, R/R box, fib extension, multi-select.

### Thứ tự bắt buộc:

**Bước 1:** `src/lib/drawing/types.ts` — thêm `"priceRange" | "positionBox" | "fibExtension"` vào `DrawingToolType`; thêm `riskReward?: { entry: number; stop: number; target: number }`.

**Bước 2:** `src/lib/drawing/builtin/priceRange.ts` — TẠO MỚI

```typescript
// 2 điểm corner → badge hiển thị Δ% và số bars
// badge text = `Δ ${percent}% · ${bars} bars`
```

**Bước 3:** `src/lib/drawing/builtin/positionBox.ts` — TẠO MỚI

```typescript
// 3 điểm: entry price, stop price, target price
// Rectangle fill: xanh lá (target side), đỏ (stop side)
// R/R badge = `R/R 1:${ratio.toFixed(1)}`
```

**Bước 4:** `src/lib/drawing/builtin/fibExtension.ts` — TẠO MỚI

```typescript
// Extension levels: [1.272, 1.414, 1.618, 2.0, 2.618]
// Render trên cùng chart nhưng extend ra ngoài range P1-P2
```

**Bước 5:** `src/lib/drawing/renderSvg.ts` — SỬA, thêm render functions cho 3 tools mới.

**Bước 6:** `src/lib/drawing/DrawingLayer.tsx` — SỬA, thêm Shift+click multi-select.

**Bước 7:** `src/lib/drawing/index.ts` — SỬA, export và register 3 tools mới.

**Bước 8:** `src/demo/LibraryShowcaseDemo.tsx` — SỬA:
- Thêm 3 tool vào `TOOL_DEFS` và `ToolIcon`.
- Thêm toolbar group divider: `Lines | Fib | Shapes | Analysis`.

**Bước 9:** `src/demo/i18n.tsx` + `src/demo/demo.css` — SỬA.

### Gate M3

```
✅ npm run type-check → PASS
✅ Browser smoke:
   - priceRange: kéo 2 điểm → badge "Δ 3.2% · 28 bars"
   - positionBox: 3 dòng giá → box fill + R/R badge
   - fibExtension: levels xuất hiện bên ngoài P1-P2
   - Shift+click 2 drawings → cả 2 highlight; Delete → xóa cả 2
   - Toolbar có divider nhóm rõ
```

---

## 6. File impact matrix tổng hợp

| File | M1 | M2 | M3 | Tạo mới hay sửa |
| :--- | :---: | :---: | :---: | :--- |
| `src/lib/drawing/coordinateUtils.ts` | ✎ | — | — | TẠO MỚI |
| `src/lib/drawing/renderSvg.ts` | ✎ | — | ✎ | TẠO MỚI (M1), SỬA (M3) |
| `src/lib/drawing/useDrawingInteraction.ts` | ✎ | — | — | TẠO MỚI |
| `src/lib/drawing/DrawingLayer.tsx` | ✎ | — | ✎ | TẠO MỚI (M1), SỬA (M3) |
| `src/lib/drawing/builtin/rectangle.ts` | ✎ | — | — | TẠO MỚI |
| `src/lib/drawing/builtin/arrow.ts` | ✎ | — | — | TẠO MỚI |
| `src/lib/drawing/DrawingStorage.ts` | — | ✎ | — | TẠO MỚI |
| `src/lib/drawing/useDrawingStorage.ts` | — | ✎ | — | TẠO MỚI |
| `src/lib/drawing/DrawingInspector.tsx` | — | ✎ | — | TẠO MỚI |
| `src/lib/drawing/builtin/priceRange.ts` | — | — | ✎ | TẠO MỚI |
| `src/lib/drawing/builtin/positionBox.ts` | — | — | ✎ | TẠO MỚI |
| `src/lib/drawing/builtin/fibExtension.ts` | — | — | ✎ | TẠO MỚI |
| `src/lib/drawing/types.ts` | ✎ | ✎ | ✎ | SỬA |
| `src/lib/drawing/index.ts` | ✎ | ✎ | ✎ | SỬA |
| `src/demo/LibraryShowcaseDemo.tsx` | ✎ | ✎ | ✎ | SỬA |
| `src/demo/i18n.tsx` | ✎ | ✎ | ✎ | SỬA |
| `src/demo/demo.css` | ✎ | ✎ | ✎ | SỬA |
