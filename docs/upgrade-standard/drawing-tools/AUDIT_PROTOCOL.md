# Audit Protocol: Drawing Tools Engine

## 1. Evidence bắt buộc — per milestone

### Mỗi milestone phải có đủ evidence sau trước khi sign-off

| Evidence | Command | Expected |
| :--- | :--- | :--- |
| Type check | `npm run type-check` | Exit 0, zero errors |
| Unit tests | `npm test` | All pass, no skip |
| Module tree | `python scripts/generate_module_tree.py` | Completes, no exception |
| Build | `npm run build` | Exit 0, bundle size < 2x baseline |

### Evidence về đường dẫn file mới

Sau khi tạo file mới trong `src/lib/drawing/` hoặc `src/demo/`, phải verify:
```bash
# Windows
Get-ChildItem "src\lib\drawing" -Recurse -Filter "*.ts" | Select-Object Name
Get-ChildItem "src\lib\drawing" -Recurse -Filter "*.tsx" | Select-Object Name
```

---

## 2. Matrix kiểm thử chức năng — Milestone M1

### F01: Tool selection changes toolbar state

| ID | Scenario | Input | Expected | PASS / FAIL |
| :--- | :--- | :--- | :--- | :--- |
| F01 | Click "Trend Line" button | `onClick` | Button active style; activeTool = "trendLine" | |
| F02 | Click "H-Line" button | `onClick` | activeTool = "hLine" | |
| F03 | Click "V-Line" button | `onClick` | activeTool = "vLine" | |
| F04 | Click "Fibonacci" button | `onClick` | activeTool = "fibonacci" | |
| F05 | Click "Channel" button | `onClick` | activeTool = "channel" | |
| F06 | Click "Text" button | `onClick` | activeTool = "text" | |
| F07 | Click "Rectangle" button | `onClick` | activeTool = "rectangle" | |
| F08 | Click "Arrow" button | `onClick` | activeTool = "arrow" | |
| F09 | Click "Cursor" button | `onClick` | activeTool = "cursor" | |

### F10: Drawing creation per tool type

| ID | Scenario | Input | Expected | PASS / FAIL |
| :--- | :--- | :--- | :--- | :--- |
| F10 | Trend Line: pointerDown chart → pointerMove → pointerUp | Drag P1→P2 | SVG line appears at correct price levels | |
| F11 | H-Line: pointerDown chart | 1 click | Full-width horizontal line at click's price | |
| F12 | V-Line: pointerDown chart | 1 click | Vertical line at click's timestamp | |
| F13 | Fibonacci: pointerDown → pointerUp | Drag | 9 horizontal lines + labels appear | |
| F14 | Channel: 3 clicks (P1, P2, P3) | 3 clicks | 2 parallel lines appear | |
| F15 | Text: click chart → type | Click + type | Text visible on chart at click position | |
| F16 | Rectangle: drag | Drag P1→P2 | Filled rectangle appears | |
| F17 | Arrow: drag | Drag P1→P2 | Arrow with arrowhead appears | |

### F18: Undo/Redo/Cancel/Delete

| ID | Scenario | Input | Expected | PASS / FAIL |
| :--- | :--- | :--- | :--- | :--- |
| F18 | Undo after draw | Ctrl+Z | Most recent drawing removed | |
| F19 | Redo after undo | Ctrl+Y | Drawing reappears | |
| F20 | ESC during drawing | ESC (mid-draw) | Preview disappears; no drawing committed | |
| F21 | Delete selected drawing | Click drawing → Del | Drawing removed | |
| F22 | Undo/redo chained × 5 | Ctrl+Z × 5, then Ctrl+Y × 5 | Stack correct both ways | |

### F23: Cursor change per tool mode

| ID | Scenario | Expected cursor | PASS / FAIL |
| :--- | :--- | :--- | :--- |
| F23 | activeTool = "trendLine" | crosshair | |
| F24 | activeTool = "hLine" | ns-resize | |
| F25 | activeTool = "vLine" | ew-resize | |
| F26 | activeTool = "text" | text | |
| F27 | activeTool = "cursor" | default | |

---

## 3. Matrix kiểm thử regression — Milestone M1

*Mục đích: Đảm bảo chart hiện tại không bị ảnh hưởng.*

| ID | Scenario | Expected | PASS / FAIL |
| :--- | :--- | :--- | :--- |
| R01 | Chart load không có activeTool changes | Candlestick render bình thường | |
| R02 | Zoom / pan chart | Chart vẫn responsive, drawing layer theo sát | |
| R03 | Pane resize (SplitterPaneResize) | Panes resize; drawings scale theo chartWidth/chartHeight | |
| R04 | Symbol change (nếu có) | Chart rerender; cũ drawings không render ra chart mới (no orphan) | |
| R05 | activeTool = "cursor" — không vẽ được | Click chart → không tạo drawing | |
| R06 | Toolbar render toàn bộ 9 buttons | Tất cả icon hiển thị đúng | |
| R07 | DynamicChart props không thay đổi | DynamicChart.tsx unchanged; no prop regression | |
| R08 | `src/lib/**` không import `src/demo/**` | Grep result empty | |

**Regression scan command:**
```bash
# Windows
Select-String -Path "src\lib\**\*.ts","src\lib\**\*.tsx" -Pattern "from.*src/demo" -Recurse
# Expected: zero matches
```

---

## 4. Matrix kiểm thử chức năng — Milestone M2

| ID | Scenario | Expected | PASS / FAIL |
| :--- | :--- | :--- | :--- |
| F30 | Click drawing → inspector panel hiện | Panel floating, không overlap toolbar | |
| F31 | Đổi màu trong inspector | Drawing stroke color cập nhật ngay | |
| F32 | Đổi stroke width | Drawing line dày/mỏng cập nhật ngay | |
| F33 | Chọn "Dashed" | Đường chuyển dashed ngay | |
| F34 | Lock drawing | Drag không di chuyển drawing | |
| F35 | Close inspector → click lại drawing | Inspector re-open | |
| F36 | Reload browser | All drawings still present (localStorage) | |
| F37 | Clear all drawings | localStorage cleared; chart trống | |
| F38 | Export JSON | File tải về; valid JSON; id/type/points đúng | |
| F39 | Import JSON | Drawings restore từ file; render đúng | |

---

## 5. Matrix kiểm thử chức năng — Milestone M3

| ID | Scenario | Expected | PASS / FAIL |
| :--- | :--- | :--- | :--- |
| F40 | priceRange: drag 2 điểm | Badge "Δ X% · N bars" hiện | |
| F41 | priceRange badge đúng số | Tính Δ% = (P2.y - P1.y) / P1.y × 100 | |
| F42 | positionBox: 3 điểm | Box fill đúng màu; R/R badge đúng ratio | |
| F43 | positionBox R/R = 1:2 | Badge "R/R 1:2.0" | |
| F44 | fibExtension: 2 điểm | Extension levels [1.272, ...] render bên ngoài range | |
| F45 | Multi-select: Shift+click 2 drawings | Cả 2 highlight | |
| F46 | Multi-select → Delete | Cả 2 drawings xóa | |
| F47 | Toolbar divider nhóm | Lines / Fib / Shapes / Analysis rõ | |

---

## 6. Unit tests bắt buộc

### Test file: `tests/drawing/coordinateUtils.test.ts`

```
✅ pixelToChartPoint → chartPointToPixel roundtrip: sai số < 1px
✅ pixelToChartPoint với containerRect offset đúng
✅ chartPointToPixel với timestamp cũ vẫn render đúng
```

### Test file: `tests/drawing/renderSvg.test.ts`

```
✅ renderDrawingToSvg trả non-empty array cho mỗi 8 tool types
✅ renderFibonacci tạo đúng 9 line elements + 9 text elements
✅ renderHLine tạo 1 line với x1=0, x2=chartWidth
✅ renderVLine tạo 1 line với y1=0, y2=chartHeight
```

### Test file: `tests/drawing/useDrawingInteraction.test.ts`

```
✅ canUndo = false khi history rỗng
✅ canUndo = true sau 1 draw
✅ undo → canRedo = true
✅ deleteSelected khi không có selected → không throw
✅ cancelDrawing khi không trong drawing state → không throw
```

### Test file: `tests/drawing/DrawingStorage.test.ts` (M2)

```
✅ saveDrawings → loadDrawings roundtrip giữ đủ fields
✅ loadDrawings trên key không tồn tại → trả []
✅ importJSON với invalid JSON → throw với message rõ
✅ importJSON thiếu required field → throw validation error
```

---

## 7. Sign-off rules

### M1 sign-off checklist ✅ COMPLETED (2026-05-05)

- [x] Tất cả F01–F27 PASS
- [x] Tất cả R01–R08 PASS
- [x] Unit tests (coordinateUtils, renderSvg, useDrawingInteraction) PASS
- [x] `npm run type-check` → 0 errors
- [x] `npm test` → 67 tests, 0 failures
- [x] `python scripts/generate_module_tree.py` → OK
- [x] AUDIT_LEDGER.md updated với entry M1
- [x] `module_tree_full.md` regenerated (632 modules)
- [x] Commit: `b1bf284` on branch `dev`

### M2 sign-off checklist

- [ ] M1 sign-off đã hoàn tất ✅
- [ ] F30–F39 PASS
- [ ] F50–F56 PASS (M2 additions: clone, hide, z-order, drawings list)
- [ ] DrawingStorage unit tests PASS
- [ ] `npm run type-check` → 0 errors
- [ ] `npm test` → all pass
- [ ] AUDIT_LEDGER.md updated với entry M2
- [ ] `module_tree_full.md` regenerated

### M3 sign-off checklist

- [ ] M2 sign-off đã hoàn tất
- [ ] F40–F47 PASS (original M3 tests)
- [ ] F57–F70 PASS (expanded M3 tools)
- [ ] `npm run type-check` → 0 errors
- [ ] `npm test` → all pass (longPosition R/R test, ray extend test, polyline N-click test)
- [ ] AUDIT_LEDGER.md updated với entry M3
- [ ] `module_tree_full.md` regenerated

### M4 sign-off checklist

- [ ] M3 sign-off đã hoàn tất
- [ ] F80–F90 PASS (M4 matrix)
- [ ] `npm run type-check` → 0 errors
- [ ] `npm test` → all pass (pitchfork geometry test, regression LSQ test, fibArc radius test)
- [ ] AUDIT_LEDGER.md updated với entry M4
- [ ] `module_tree_full.md` regenerated

---

## 8. Matrix kiểm thử chức năng — M2 mở rộng (F50–F56)

| ID | Scenario | Expected | PASS / FAIL |
| :--- | :--- | :--- | :--- |
| F50 | Clone drawing | Bản copy xuất hiện offset +20px | |
| F51 | Hide drawing via inspector | Drawing ẩn khỏi chart; item vẫn trong drawings list (eye icon crossed) | |
| F52 | Show drawing via eye icon | Drawing reappears | |
| F53 | Bring to Front | Drawing render trên tất cả others | |
| F54 | Send to Back | Drawing render dưới tất cả others | |
| F55 | Drawings list panel hiện | Panel liệt kê đủ tất cả drawings | |
| F56 | Click item trong Drawings list | Drawing được selected; chart scroll nếu cần | |

---

## 9. Matrix kiểm thử chức năng — M3 mở rộng (F57–F70)

| ID | Scenario | Expected | PASS / FAIL |
| :--- | :--- | :--- | :--- |
| F57 | Ray: vẽ 2 điểm | Đường extend về phía phải đến edge chart; không extend phía trái | |
| F58 | Extended Line: vẽ 2 điểm | Đường extend cả 2 phía đến edges | |
| F59 | Polyline: 3 clicks + double-click | Multi-segment path xuất hiện; complete sau dblclick | |
| F60 | Polyline: handles khi selected | Handle circle tại mỗi điểm; drag reposition | |
| F61 | Date & Price Range: drag | Box + badge "Δ+X.XX% · N bars" hiện; số đúng | |
| F62 | Date & Price Range badge: P2 thấp hơn P1 | Badge "Δ−X.XX%" (negative) | |
| F63 | Long Position: drag entry→TP khi TP > entry | Vùng xanh phía trên entry; vùng đỏ phía dưới | |
| F64 | Long Position badge | "R/R 1:X.X" đúng; "P&L +X.XX%" đúng | |
| F65 | Short Position: drag | Vùng đỏ phía trên entry; vùng xanh phía dưới | |
| F66 | Fib Extension: P2 > P1 | Levels 127.2–261.8% render above P2 | |
| F67 | Fib Extension: P2 < P1 | Levels render below P2 (inverted) | |
| F68 | Multi-select: Shift+click 3 drawings | 3 items highlighted | |
| F69 | Multi-select + Delete | Tất cả selected drawings xóa | |
| F70 | Toolbar groups: divider thấy rõ | 4 nhóm Lines/Fibonacci/Shapes/Analysis phân tách rõ | |

---

## 10. Matrix kiểm thử chức năng — M4 (F80–F90)

| ID | Scenario | Expected | PASS / FAIL |
| :--- | :--- | :--- | :--- |
| F80 | Parallel Channel: 3 clicks P1/P2/P3 | 2 parallel lines + midline render | |
| F81 | Parallel Channel: extend | Lines extend đến chart boundaries | |
| F82 | Andrew's Pitchfork: 3 clicks A/B/C | Median line + 2 side forks + labels A/B/C | |
| F83 | Pitchfork median math | Median = A → midpoint(B,C) verify visually | |
| F84 | ABCD: 4 clicks A/B/C/D | 3 lines + labels + ratio badges BC/AB, CD/BC | |
| F85 | Fib Arc: 2 điểm | 3 bán nguyệt tại 38.2%, 50%, 61.8% của khoảng cách P1-P2 | |
| F86 | Fib Time Zone: 2 điểm | Vertical lines tại Fib seq bars [1,2,3,5,8,13,21,34] | |
| F87 | Regression Channel: drag | Best-fit line + 2 dashed bands + R² badge | |
| F88 | Regression Channel: high R² (>0.9) | Bands tight; visually narrow channel | |
| F89 | Regression Channel: low R² (<0.3) | Bands wide; label "R² 0.XX" in badge | |
| F90 | Tất cả M4 tools: undo/redo | Undo → pattern disappears; Redo → reappears | |

---

## 11. Unit tests bắt buộc — M3/M4

### Test file: `tests/drawing/ray.test.ts` (M3)

```
✅ ray createDraft: points = [P1, P1]
✅ ray render: given slope, extend x2 to chartWidth
✅ ray render: vertical ray (P2.x === P1.x) handled (render as full-height vLine)
```

### Test file: `tests/drawing/positionRisk.test.ts` (M3)

```
✅ longPosition R/R: entry=100, TP=120, SL=90 → R/R = |120-100|/|100-90| = 2.0
✅ shortPosition R/R: entry=100, TP=80, SL=110 → R/R = |100-80|/|110-100| = 2.0
✅ P&L percent: (|TP-entry|/entry) × 100 for long = +20%
```

### Test file: `tests/drawing/fibExtension.test.ts` (M3)

```
✅ upswing (P2>P1): level 1.618 = P2 + (P2-P1) × 0.618
✅ downswing (P2<P1): level 1.618 = P2 - (P1-P2) × 0.618
✅ all 5 levels computed correctly for known values
```

### Test file: `tests/drawing/pitchfork.test.ts` (M4)

```
✅ median start = A
✅ median end = midpoint(B, C) = { x: (B.x+C.x)/2, y: (B.y+C.y)/2 }
✅ upper fork: starts at B, direction parallel to median vector
✅ lower fork: starts at C, direction parallel to median vector
```

### Test file: `tests/drawing/regressionChannel.test.ts` (M4)

```
✅ perfect linear data (y = 2x): slope ≈ 2, intercept ≈ 0, R² ≈ 1.0, σ ≈ 0
✅ random scatter: R² < 0.5
✅ σ bands ≥ 0
```

### Test file: `tests/drawing/fibArc.test.ts` (M4)

```
✅ radius = sqrt((P2.x-P1.x)^2 + (P2.y-P1.y)^2) pixel distance
✅ arc radii = [radius*0.382, radius*0.5, radius*0.618]
✅ arcs are SVG arc path strings with correct A command params
```

---

## 8. Trường hợp biên cần test đặc biệt

| ID | Trường hợp biên | Expected behavior |
| :--- | :--- | :--- |
| E01 | Drag rất ngắn (< 5px) | Không tạo drawing (threshold lọc noise) |
| E02 | Click ngoài vùng chart | Không xử lý event |
| E03 | Drawing tại y = 0 (giá = 0) | Render ổn, không crash |
| E04 | Import JSON trống `[]` | Không crash, chart trống |
| E05 | localStorage bị corrupt | `loadDrawings` trả `[]`, log warning, không crash |
| E06 | 100+ drawings trên chart cùng lúc | Không lag > 16ms frame |
| E07 | Undo nhiều hơn history stack | `canUndo = false`, không crash |
| E08 | Chart resize về width = 0 | DrawingLayer không throw |
