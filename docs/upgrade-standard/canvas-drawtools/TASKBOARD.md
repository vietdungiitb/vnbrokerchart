# Taskboard: Canvas DrawTools Engine (CE-Series)

**Phiên bản:** v1.0 | **Ngày:** 2026-05-06  
**Tài liệu liên quan:** [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

---

## Trạng thái tổng quan

| Slice | Tên | Trạng thái | Assignee | Phụ thuộc |
| :---: | :--- | :---: | :--- | :--- |
| CE-01 | Canvas renderer — line types | ⬜ Chưa bắt đầu | — | — |
| CE-02 | Canvas renderer — fill shapes | ⬜ Chưa bắt đầu | — | CE-01 |
| CE-03 | Canvas renderer — fibonacci & arcs | ⬜ Chưa bắt đầu | — | CE-01 |
| CE-04 | Canvas renderer — complex tools | ⬜ Chưa bắt đầu | — | CE-01, CE-02, CE-03 |
| CE-05 | Hit testing core | ⬜ Chưa bắt đầu | — | CE-01 |
| CE-06 | Snap engine | ⬜ Chưa bắt đầu | — | — |
| CE-07 | DrawingLayer switch | ⬜ Chưa bắt đầu | — | CE-01→CE-04, CE-05, CE-06 |
| CE-08 | Demo CSS + polish | ⬜ Chưa bắt đầu | — | CE-07 |
| CE-09 | LibraryShowcaseDemo wiring | ⬜ Chưa bắt đầu | — | CE-07 |
| CE-10 | Audit + ledger + tree | ⬜ Chưa bắt đầu | — | CE-01→CE-09 |

**Trạng thái ký hiệu:** ⬜ Chưa bắt đầu | 🔵 Đang làm | ✅ Hoàn thành | ❌ Bị chặn

---

## CE-01: Canvas renderer — line types

**File cần tạo:** `src/lib/drawing/renderCanvas.ts`

**Task checklist:**

- [ ] Tạo file với boilerplate: imports, interfaces `RenderCanvasOptions`, export `renderDrawingToCanvas`
- [ ] Implement `applyLineStyle(ctx, style)` — set stroke, lineWidth, lineDash
- [ ] Implement `clipSegmentToBox(start, end, w, h)` — Liang-Barsky (copy từ renderSvg.ts)
- [ ] Implement `drawSelectionHandles(ctx, points, color)` — circles tại control points
- [ ] Implement `drawTrendLine(ctx, drawing, scales, options)` — 2-point segment
- [ ] Implement `drawHLine(ctx, drawing, scales, options)` — full-width horizontal
- [ ] Implement `drawVLine(ctx, drawing, scales, options)` — full-height vertical
- [ ] Implement `drawRay(ctx, drawing, scales, options)` — half-infinite line
- [ ] Implement `drawExtendedLine(ctx, drawing, scales, options)` — infinite line
- [ ] Implement `drawPolyline(ctx, drawing, scales, options)` — multi-segment
- [ ] Implement `drawChannel(ctx, drawing, scales, options)` — 2 parallel lines from 3 points
- [ ] Implement `drawArrow(ctx, drawing, scales, options)` — line + arrowhead triangle
- [ ] Implement dispatcher `renderDrawingToCanvas` switch với 8 cases trên
- [ ] `npm run type-check` → 0 errors

**Thời lượng ước tính:** 3-4 giờ  
**Output:** `src/lib/drawing/renderCanvas.ts` (partial, 8/21 tools)

---

## CE-02: Canvas renderer — fill shapes

**File cần sửa:** `src/lib/drawing/renderCanvas.ts`

**Task checklist:**

- [ ] Implement `drawRectangle(ctx, drawing, scales, options)` — filled/stroked rect
- [ ] Implement `drawDateAndPriceRange(ctx, drawing, scales, options)` — filled rect + badge text
- [ ] Implement `drawPositionZones(ctx, drawing, scales, options, mode)` — TP/SL zones
  - [ ] TP zone fill: `rgba(34,171,92,0.18)`
  - [ ] SL zone fill: `rgba(215,50,75,0.18)`
  - [ ] 3 horizontal lines: entry, target, stop
  - [ ] R/R badge text
- [ ] Implement `drawLongPosition` → gọi `drawPositionZones(..., "long")`
- [ ] Implement `drawShortPosition` → gọi `drawPositionZones(..., "short")`
- [ ] Cập nhật dispatcher với 5 cases mới
- [ ] `npm run type-check` → 0 errors

**Thời lượng ước tính:** 2-3 giờ  
**Output:** `renderCanvas.ts` (13/21 tools)

---

## CE-03: Canvas renderer — fibonacci & arcs

**File cần sửa:** `src/lib/drawing/renderCanvas.ts`

**Task checklist:**

- [ ] Implement `drawFibonacci(ctx, drawing, scales, options)` — 9 fib levels
- [ ] Implement `drawFibExtension(ctx, drawing, scales, options)` — 5 extension levels
- [ ] Implement `drawFibArc(ctx, drawing, scales, options)` — semicircles
- [ ] Implement `drawFibTimeZone(ctx, drawing, scales, options)` — vertical zone lines
- [ ] Cập nhật dispatcher với 4 cases mới
- [ ] Test visual: fib levels đúng ratio, arc đúng radius
- [ ] `npm run type-check` → 0 errors

**Thời lượng ước tính:** 2 giờ  
**Output:** `renderCanvas.ts` (17/21 tools)

---

## CE-04: Canvas renderer — complex tools

**File cần sửa:** `src/lib/drawing/renderCanvas.ts`

**Task checklist:**

- [ ] Implement `drawText(ctx, drawing, scales, options)` — ctx.fillText
- [ ] Implement `drawParallelChannel(ctx, drawing, scales, options)` — 3 lines (upper, middle dashed, lower)
- [ ] Implement `drawPitchfork(ctx, drawing, scales, options)` — median + 2 forks + A/B/C labels
- [ ] Implement `drawAbcdPattern(ctx, drawing, scales, options)` — AB/BC/CD + labels + ratios
- [ ] Implement `drawRegressionChannel(ctx, drawing, scales, options)` — fill polygon + 3 lines + R² badge
- [ ] Cập nhật dispatcher với 5 cases còn lại (tổng 21/21 tools)
- [ ] Test: gọi `renderDrawingToCanvas` với dummy drawing của mỗi type → không throw
- [ ] `npm run type-check` → 0 errors

**Thời lượng ước tính:** 3 giờ  
**Output:** `renderCanvas.ts` hoàn chỉnh (21/21 tools)

---

## CE-05: Hit testing core

**File cần tạo:** `src/lib/drawing/hitTest.ts`

**Task checklist:**

- [ ] Implement `distanceToSegment(px, py, x1, y1, x2, y2): number`
- [ ] Implement `pointInRect(px, py, rx, ry, rw, rh): boolean`
- [ ] Implement `hitTestDrawing(...)` switch cho 21 tool types:
  - [ ] trendLine, arrow: distanceToSegment
  - [ ] ray, extendedLine: clip + distanceToSegment
  - [ ] hLine: abs(mouseY - y) < tolerance
  - [ ] vLine: abs(mouseX - x) < tolerance
  - [ ] fibonacci, fibExtension: any level Y within tolerance
  - [ ] rectangle, dateAndPriceRange: pointInRect
  - [ ] longPosition, shortPosition: pointInRect total zone
  - [ ] channel, parallelChannel: any line segment within tolerance
  - [ ] pitchfork: median + 2 forks within tolerance
  - [ ] polyline: any segment within tolerance
  - [ ] text: rough bounding box
  - [ ] abcdPattern: AB+BC+CD segments
  - [ ] fibArc: radial distance to any arc
  - [ ] fibTimeZone: any zone X within tolerance
  - [ ] regressionChannel: bounding rect
- [ ] Implement `getResizeHandleIndex(...)` — scan control points
- [ ] `npm run type-check` → 0 errors

**Thời lượng ước tính:** 3 giờ  
**Output:** `src/lib/drawing/hitTest.ts`

---

## CE-06: Snap engine

**File cần tạo:** `src/lib/drawing/snap.ts`

**Task checklist:**

- [ ] Implement `findNearestBar(mouseX, scales, plotData, xTolerance)` — find bar by X proximity
- [ ] Implement OHLC snap logic — check high/low/open/close Y within tolerance
- [ ] Implement endpoint snap — scan existing drawing endpoints
- [ ] Export `findSnapPoint(...)` với priority: OHLC first, endpoint second
- [ ] Return `null` khi không có snap match
- [ ] `npm run type-check` → 0 errors

**Thời lượng ước tính:** 1-2 giờ  
**Output:** `src/lib/drawing/snap.ts`

---

## CE-07: DrawingLayer switch to canvasDraw

**File cần sửa:** `src/lib/drawing/DrawingLayer.tsx`

**Task checklist:**

- [ ] Thêm imports: `renderDrawingToCanvas`, `hitTestDrawing`, `findSnapPoint`, `SnapResult`
- [ ] Xóa imports: `renderDrawingToSvg`, `RenderSvgOptions`, `ReactElement` (from react)
- [ ] Thêm `snapRef = useRef<SnapResult | null>(null)`
- [ ] Thay callback `renderSVG` → `drawToCanvas` với logic vẽ canvas
- [ ] Thêm snap indicator vẽ trong `drawToCanvas`
- [ ] Cập nhật `handleMouseMove`: update snapRef, apply snap để lấy effective point
- [ ] Cập nhật `handleMouseDown`: apply snap
- [ ] Thêm hit testing vào đầu `handleClick` khi activeTool === "cursor"
- [ ] Thay `svgDraw={renderSVG}` → `svgDraw={() => null}`
- [ ] Thêm `canvasDraw={drawToCanvas}` và `canvasToDraw={(contexts: any) => contexts?.mouseCoord}`
- [ ] Cập nhật `drawOn` để thêm `"pan"` và `"zoom"`
- [ ] `npm run type-check` → 0 errors
- [ ] `npm test` → pass

**Thời lượng ước tính:** 2-3 giờ  
**Output:** `DrawingLayer.tsx` sử dụng canvas

---

## CE-08: Demo CSS + visual polish

**File cần sửa:** `src/demo/demo.css`

**Task checklist:**

- [ ] Thêm `.rsc-drawing-snap-active { cursor: crosshair; }`
- [ ] Thêm 4 position zone CSS classes (fallback)
- [ ] Build `npm run build:docs` → success

**Thời lượng ước tính:** 15 phút

---

## CE-09: LibraryShowcaseDemo wiring

**File cần kiểm tra:** `src/demo/LibraryShowcaseDemo.tsx`

**Task checklist:**

- [ ] Kiểm tra imports: không có `src/lib/interactive/` import cho drawing tools
- [ ] Kiểm tra `DrawingLayer` usage: props đầy đủ (activeTool, interaction, onToolUsed)
- [ ] Kiểm tra `DrawingInspector` wiring: onUpdate, onDelete, onClone, onToggleLock, onToggleVisible, onBringToFront, onSendToBack, onClose
- [ ] Kiểm tra `DrawingListPanel` wiring nếu có
- [ ] Sửa bất kỳ prop mismatch nào
- [ ] `npm run type-check` → 0 errors

**Thời lượng ước tính:** 30 phút - 1 giờ

---

## CE-10: Audit, ledger, module tree

**Task checklist:**

- [ ] Cập nhật `docs/upgrade-standard/AUDIT_LEDGER.md` — thêm CE series row
- [ ] Chạy `python scripts/generate_module_tree.py`
- [ ] Verify `module_tree_full.md` chứa: `renderCanvas`, `hitTest`, `snap`
- [ ] `npm run type-check` → 0 errors (final gate)
- [ ] `npm test` → all pass
- [ ] `npm run build:docs` → success
- [ ] Git commit: `feat(drawing): CE canvas drawtools engine complete`

---

## Dependency graph

```
CE-01 (renderCanvas partial)
  ├─→ CE-02 (fill shapes)
  ├─→ CE-03 (fib & arcs)
  └─→ CE-05 (hitTest)
CE-02 + CE-03 ──→ CE-04 (complex tools)
CE-06 (snap) ────→ independent
CE-01+02+03+04+CE-05+CE-06 ──→ CE-07 (DrawingLayer)
CE-07 ──→ CE-08 (CSS)
CE-07 ──→ CE-09 (Demo wiring)
CE-08+CE-09 ──→ CE-10 (Audit)
```

## Cách cập nhật trạng thái

Khi bắt đầu một slice, thay `⬜ Chưa bắt đầu` → `🔵 Đang làm`.  
Khi hoàn thành, thay → `✅ Hoàn thành` và điền date vào cột Assignee.  
Nếu bị chặn bởi dependency hoặc lỗi chưa giải quyết được, thay → `❌ Bị chặn` và ghi chú.
