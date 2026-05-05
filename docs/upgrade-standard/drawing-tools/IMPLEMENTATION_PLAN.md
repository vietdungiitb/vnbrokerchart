# Implementation Plan: Drawing Tools Engine

## 1. Tiền đề đã hoàn thành — M1 DONE ✅ (2026-05-05, commit b1bf284)

| Hạng mục | File | Trạng thái |
| :--- | :--- | :--- |
| DrawingObject data model (8 tool types) | `src/lib/drawing/types.ts` | ✅ Done |
| State machine (7 states) | `src/lib/drawing/stateMachine.ts` | ✅ Done |
| History reducer (push/undo/redo/clear) | `src/lib/drawing/history.ts` | ✅ Done |
| JSON serialization/deserialization | `src/lib/drawing/serialization.ts` | ✅ Done |
| Tool registry | `src/lib/drawing/registry.ts` | ✅ Done |
| 8 built-in tools (trendLine, hLine, vLine, fibonacci, channel, text, rectangle, arrow) | `src/lib/drawing/builtin/` | ✅ Done |
| Coordinate bridge | `src/lib/drawing/coordinateUtils.ts` | ✅ Done |
| SVG render engine (8 tools, selection handles) | `src/lib/drawing/renderSvg.ts` | ✅ Done |
| Drawing interaction hook | `src/lib/drawing/useDrawingInteraction.ts` | ✅ Done |
| DrawingLayer SVG overlay | `src/lib/drawing/DrawingLayer.tsx` | ✅ Done |
| Package API surface | `src/lib/drawing/index.ts` | ✅ Done |
| Demo toolbar (10 tools, keyboard shortcuts) | `src/demo/LibraryShowcaseDemo.tsx` | ✅ Done |
| i18n keys M1 (vi + en) | `src/demo/i18n.tsx` | ✅ Done |
| Drawing CSS (cursors, handles) | `src/demo/demo.css` | ✅ Done (partial — inspector CSS pending M2) |
| GenericChartComponent soft fallback | `src/lib/GenericChartComponent.tsx` | ✅ Done |
| 67 unit tests passing | `src/lib/drawing/*.test.ts` | ✅ Done |

## 2. Nguyên tắc bắt buộc cho cả 3 milestone

1. **Không thay thế** data model đã kiểm chứng — chỉ extend optional fields.
2. **Không import** `src/demo/**` từ bất kỳ file nào trong `src/lib/**`.
3. **DrawingObject.points** luôn lưu chart coordinates (timestamp + price), không bao giờ lưu pixel.
4. **Mọi text UI mới** phải có i18n key trong `src/demo/i18n.tsx`.
5. **type-check PASS** trước khi đóng mỗi milestone.
6. **module_tree_full.md** phải được regenerate sau khi thêm file mới.

## 3. Milestone M1 — ✅ DONE (2026-05-05)

Xem Section 1 cho danh sách đầy đủ. Tất cả bước M1 đã hoàn thành và commit vào branch `dev`.

**Evidence:** `git log --oneline dev | head -1` → `b1bf284 feat(drawing): M1 Core Drawing Engine`

---

## 4. Milestone M2 — Inspector + Persistence

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

## 5. Milestone M3 — Lines Nâng Cao + Position Tools

**Mục tiêu:** 7 công cụ mới: Ray, Extended Line, Polyline, Date & Price Range, Long/Short Position, Fib Extension; multi-select; toolbar groups.

### Thứ tự bắt buộc:

**Bước 1:** `src/lib/drawing/types.ts` — SỬA

Thêm vào `DrawingToolType`:
```typescript
| "ray" | "extendedLine" | "polyline"
| "dateAndPriceRange" | "longPosition" | "shortPosition"
| "fibExtension"
```
Thêm field:
```typescript
riskReward?: { entry: number; stop: number; target: number; quantity?: number };
```

---

**Bước 2:** `src/lib/drawing/builtin/ray.ts` — TẠO MỚI

```typescript
// createDraft(P1): 2 points [P1, P1]
// updateDraft(draft, nextPoint): replacePoint(draft, 1, nextPoint)
// render: xử lý trong renderSvg — extends 1 direction (forward)
```

**Bước 3:** `src/lib/drawing/builtin/extendedLine.ts` — TẠO MỚI

```typescript
// Same as trendLine nhưng extendLeft = true, extendRight = true
// createDraft(P1): 2 points, flags extendLeft/extendRight = true
// updateDraft: replacePoint(draft, 1, nextPoint)
```

**Bước 4:** `src/lib/drawing/builtin/polyline.ts` — TẠO MỚI

```typescript
// N-point tool — double-click to complete
// createDraft(P1): [P1, P1] — first segment preview
// updateDraft(draft, cursor): replacePoint(draft, last, cursor) — live preview
// appendPoint(draft, P): [...points, P] — on single click
// Cần action APPEND_POINT trong stateMachine hoặc handle trong DrawingLayer
```

**Bước 5:** `src/lib/drawing/builtin/dateAndPriceRange.ts` — TẠO MỚI

```typescript
// 2 điểm corner → badge Δ% + bars
// Same interaction as rectangle
// badge text = `Δ ${percent > 0 ? '+' : ''}${percent.toFixed(2)}% · ${bars} bars`
```

**Bước 6:** `src/lib/drawing/builtin/longPosition.ts` — TẠO MỚI

```typescript
// Interaction: drag P1→P2 where
//   entry = P1.y (horizontal line)
//   top-of-box = max(P1.y, P2.y) = TP
//   bottom-of-box = min(P1.y, P2.y) = SL
// points = [P1, P2] — xác định entry + range
// riskReward = { entry: P1.y, stop: bottomY, target: topY }
```

**Bước 7:** `src/lib/drawing/builtin/shortPosition.ts` — TẠO MỚI

```typescript
// Tương tự longPosition nhưng:
//   SL = max(P1.y, P2.y), TP = min(P1.y, P2.y)
//   Màu: zone trên entry = red (SL), zone dưới entry = green (TP)
```

**Bước 8:** `src/lib/drawing/builtin/fibExtension.ts` — TẠO MỚI

```typescript
// Extension levels: [1.272, 1.414, 1.618, 2.0, 2.618]
// Nếu P2 > P1: level price = P2 + (P2-P1) × ratio
// Nếu P2 < P1: level price = P2 - (P1-P2) × ratio
```

---

**Bước 9:** `src/lib/drawing/renderSvg.ts` — SỬA

Thêm render cases cho: `ray`, `extendedLine`, `polyline`, `dateAndPriceRange`, `longPosition`, `shortPosition`, `fibExtension`.

- **ray**: slope = (P2.y-P1.y)/(P2.x-P1.x); extend line từ P1 theo hướng P1→P2 đến chart right edge x2=chartWidth.
- **extendedLine**: clip cả 2 hướng tại x=0 và x=chartWidth.
- **polyline**: SVG `<polyline>` với points = all pixels.
- **dateAndPriceRange**: `<rect>` bán trong suốt + badge `<text>`.
- **longPosition**: 2 `<rect>` (xanh + đỏ) + 3 `<line>` (entry/TP/SL) + badge `<text>` R/R.
- **shortPosition**: tương tự longPosition, đảo màu.
- **fibExtension**: horizontal lines tại mỗi extension level + label bên phải.

---

**Bước 10:** `src/lib/drawing/DrawingLayer.tsx` — SỬA

Thêm:
- Shift+click drawing → toggle multi-select (set `selectedIds: Set<string>`).
- Drag trên empty area (shift held) → không bắt đầu drawing mới, thu thập box select.
- Khi polyline đang active: single-click = append point; double-click = complete.

---

**Bước 11:** `src/lib/drawing/index.ts` — SỬA

Export và register: ray, extendedLine, polyline, dateAndPriceRange, longPosition, shortPosition, fibExtension.

---

**Bước 12:** `src/demo/LibraryShowcaseDemo.tsx` — SỬA

- Thêm 7 tool vào `TOOL_DEFS` và `ToolIcon`.
- Thêm visual divider giữa toolbar groups: **Lines** (cursor, trendLine, ray, extendedLine, hLine, vLine) | **Fibonacci** (fibonacci, fibExtension) | **Shapes** (rectangle, arrow, polyline) | **Analysis** (channel, text, dateAndPriceRange, longPosition, shortPosition).

---

**Bước 13:** `src/demo/i18n.tsx` — SỬA

Thêm vào vi + en:
```
"tool.ray", "tool.extendedLine", "tool.polyline",
"tool.dateAndPriceRange", "tool.longPosition", "tool.shortPosition", "tool.fibExtension"
```

---

**Bước 14:** `src/demo/demo.css` — SỬA

Thêm:
```css
/* Position box fills */
.rsc-long-tp-zone  { fill: rgba(0, 200, 83, 0.15); }
.rsc-long-sl-zone  { fill: rgba(239, 83, 80, 0.15); }
.rsc-short-tp-zone { fill: rgba(239, 83, 80, 0.15); }
.rsc-short-sl-zone { fill: rgba(0, 200, 83, 0.15); }
/* R/R badge */
.rsc-rr-badge { font-size: 11px; fill: #e0e0e0; font-family: monospace; }
/* Drawing toolbar group divider */
.rsc-toolbar-divider { width: 1px; background: rgba(255,255,255,0.2); margin: 4px 6px; }
```

---

### Gate M3

```
✅ npm run type-check → PASS
✅ npm test → PASS (thêm tests mới cho: ray extend logic, longPosition riskReward calc, fibExtension level values)
✅ Browser smoke:
   - Ray: vẽ → đường extend đến phải màn hình
   - Extended Line: vẽ → đường extend 2 phía
   - Polyline: click 3 điểm → double-click → path xuất hiện
   - Date & Price Range: kéo → badge "Δ+3.2% · 28 bars"
   - Long Position: kéo → vùng xanh phía trên, đỏ phía dưới + badge "R/R 1:2.0"
   - Short Position: kéo → vùng đỏ phía trên + badge "Short"
   - Fib Extension: 2 điểm → levels [127.2%→261.8%] bên ngoài range
   - Shift+click 2 drawings → cả 2 highlight xanh; Delete → xóa cả 2
   - Toolbar groups hiện divider rõ
```

---

## 6. Milestone M4 — Pattern Tools + Pro

**Mục tiêu:** 6 công cụ pattern nâng cao cho trader chuyên nghiệp.

### Thứ tự bắt buộc:

**Bước 1:** `src/lib/drawing/types.ts` — SỬA

Thêm vào `DrawingToolType`:
```typescript
| "parallelChannel" | "pitchfork" | "abcdPattern"
| "fibArc" | "fibTimeZone" | "regressionChannel"
```

---

**Bước 2:** `src/lib/drawing/builtin/parallelChannel.ts` — TẠO MỚI

```typescript
// 3 điểm: P1 (start main line), P2 (end main line), P3 (offset point)
// createDraft(P1): [P1, P1, P1]
// updateDraft(draft, cursor):
//   if points.length === 2: replacePoint(1, cursor)  — preview main line
//   if points.length === 3: replacePoint(2, cursor)  — preview offset
// complete: sau click P3
```

**Bước 3:** `src/lib/drawing/builtin/pitchfork.ts` — TẠO MỚI

```typescript
// 3 điểm: A (pivot), B (swing 1), C (swing 2)
// Median = A → midpoint(B,C), extend
// Side forks: B → parallel to median, extend; C → parallel to median, extend
// Labels A, B, C tại mỗi điểm
```

**Bước 4:** `src/lib/drawing/builtin/abcdPattern.ts` — TẠO MỚI

```typescript
// 4 điểm: A, B, C, D
// Lines: A→B, B→C, C→D
// Labels: A, B, C, D
// Ratio badges:
//   BC/AB = |B.y-C.y| / |A.y-B.y|
//   CD/BC = |C.y-D.y| / |B.y-C.y|
// 4 clicks để complete
```

**Bước 5:** `src/lib/drawing/builtin/fibArc.ts` — TẠO MỚI

```typescript
// 2 điểm: P1 (center), P2 (edge)
// radius_px = sqrt((P2x-P1x)^2 + (P2y-P1y)^2)
// 3 arcs ở radii: radius_px × [0.382, 0.5, 0.618]
// SVG arc: <path d="M x1 y1 A rx ry 0 0 1 x2 y2" />
// Chỉ render bán cung phía dưới (sweep từ trái sang phải)
```

**Bước 6:** `src/lib/drawing/builtin/fibTimeZone.ts` — TẠO MỚI

```typescript
// 2 điểm: P1, P2 — xác định khoảng cách 1 bar
// barWidth_px = P2.x_pixel - P1.x_pixel
// Fibonacci sequence: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
// Vertical lines tại: P1.x_pixel + n × barWidth_px
// Mỗi line: full chart height, label nhỏ ở trên cùng
```

**Bước 7:** `src/lib/drawing/builtin/regressionChannel.ts` — TẠO MỚI

```typescript
// 2 điểm: start timestamp, end timestamp
// Cần access plotData → pass qua DrawingLayer → DrawingToolDefinition.createDraft nhận context
// Algorithm:
//   bars = plotData.filter(d => d.date >= P1.x && d.date <= P2.x)
//   xs = [0, 1, 2, ..., n-1], ys = bars.map(b => b.close)
//   least squares: a = (Σ(xi*yi) - n*mean(x)*mean(y)) / (Σxi² - n*mean(x)²)
//                  b = mean(y) - a * mean(x)
//   residuals = ys.map((y, i) => y - (a*i+b))
//   σ = sqrt(Σ(residuals²) / n)
// Render:
//   median line, upper = +σ (dashed), lower = -σ (dashed)
//   fill rgba(100,149,237,0.08)
//   badge: "R² 0.94"
```

---

**Bước 8:** `src/lib/drawing/renderSvg.ts` — SỬA

Thêm render cho 6 M4 tools. Tham khảo TECH_SPEC.md Section 14.

---

**Bước 9:** `src/lib/drawing/DrawingLayer.tsx` — SỴA

Thêm xử lý N-click accumulation cho pitchfork (3 clicks) và abcdPattern (4 clicks):
- Mỗi click khi tool đang `drawing` state → `APPEND_POINT` action.
- Sau khi đủ N điểm → auto `COMPLETE_DRAWING`.

---

**Bước 10:** `src/lib/drawing/index.ts` — SỬA

Export và register 6 tools M4.

---

**Bước 11:** `src/demo/LibraryShowcaseDemo.tsx` — SỬA

Thêm 6 tool M4 vào `TOOL_DEFS`, `ToolIcon`, và nhóm **Analysis** trong toolbar.

---

**Bước 12:** `src/demo/i18n.tsx` — SỬA

Thêm vào vi + en:
```
"tool.parallelChannel", "tool.pitchfork", "tool.abcdPattern",
"tool.fibArc", "tool.fibTimeZone", "tool.regressionChannel"
```

---

### Gate M4

```
✅ npm run type-check → PASS
✅ npm test → PASS (thêm tests cho pitchfork median math, regression channel least-squares, fibArc radius calc)
✅ Browser smoke:
   - Parallel Channel: 3 clicks → 2 parallel lines + midline
   - Pitchfork: A/B/C → median + 2 forks, labels đúng
   - ABCD: 4 clicks A/B/C/D → lines + ratio badges
   - Fib Arc: 2 điểm → 3 bán nguyệt đúng bán kính
   - Fib Time Zone: 2 điểm → vertical lines tại Fib intervals
   - Regression Channel: drag → best-fit line + 2 std-dev bands + R² badge
```

---

## 7. File impact matrix tổng hợp

| File | M1 | M2 | M3 | M4 | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/lib/drawing/coordinateUtils.ts` | ✅ | — | — | — | Done |
| `src/lib/drawing/renderSvg.ts` | ✅ | — | SỬA | SỬA | Done (M1) |
| `src/lib/drawing/useDrawingInteraction.ts` | ✅ | — | — | — | Done |
| `src/lib/drawing/DrawingLayer.tsx` | ✅ | — | SỬA | SỬA | Done (M1) |
| `src/lib/drawing/stateMachine.ts` | ✅ | — | SỬA | SỬA | Done (M1) |
| `src/lib/drawing/builtin/rectangle.ts` | ✅ | — | — | — | Done |
| `src/lib/drawing/builtin/arrow.ts` | ✅ | — | — | — | Done |
| `src/lib/drawing/DrawingStorage.ts` | — | TẠO | — | — | TODO |
| `src/lib/drawing/useDrawingStorage.ts` | — | TẠO | — | — | TODO |
| `src/lib/drawing/DrawingInspector.tsx` | — | TẠO | — | — | TODO |
| `src/lib/drawing/DrawingListPanel.tsx` | — | TẠO | — | — | TODO |
| `src/lib/drawing/builtin/ray.ts` | — | — | TẠO | — | TODO |
| `src/lib/drawing/builtin/extendedLine.ts` | — | — | TẠO | — | TODO |
| `src/lib/drawing/builtin/polyline.ts` | — | — | TẠO | — | TODO |
| `src/lib/drawing/builtin/dateAndPriceRange.ts` | — | — | TẠO | — | TODO |
| `src/lib/drawing/builtin/longPosition.ts` | — | — | TẠO | — | TODO |
| `src/lib/drawing/builtin/shortPosition.ts` | — | — | TẠO | — | TODO |
| `src/lib/drawing/builtin/fibExtension.ts` | — | — | TẠO | — | TODO |
| `src/lib/drawing/builtin/parallelChannel.ts` | — | — | — | TẠO | TODO |
| `src/lib/drawing/builtin/pitchfork.ts` | — | — | — | TẠO | TODO |
| `src/lib/drawing/builtin/abcdPattern.ts` | — | — | — | TẠO | TODO |
| `src/lib/drawing/builtin/fibArc.ts` | — | — | — | TẠO | TODO |
| `src/lib/drawing/builtin/fibTimeZone.ts` | — | — | — | TẠO | TODO |
| `src/lib/drawing/builtin/regressionChannel.ts` | — | — | — | TẠO | TODO |
| `src/lib/drawing/types.ts` | ✅ | SỬA | SỬA | SỬA | Done (M1) |
| `src/lib/drawing/index.ts` | ✅ | SỬA | SỬA | SỬA | Done (M1) |
| `src/demo/LibraryShowcaseDemo.tsx` | ✅ | SỬA | SỬA | SỬA | Done (M1) |
| `src/demo/i18n.tsx` | ✅ | SỬA | SỬA | SỬA | Done (M1) |
| `src/demo/demo.css` | ✅ | SỬA | SỬA | SỬA | Done (M1, partial) |
