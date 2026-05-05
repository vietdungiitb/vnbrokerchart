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

### M1 sign-off checklist

- [ ] Tất cả F01–F27 PASS
- [ ] Tất cả R01–R08 PASS
- [ ] Unit tests F01 group (coordinateUtils, renderSvg, useDrawingInteraction) PASS
- [ ] `npm run type-check` → 0 errors
- [ ] `npm test` → 0 failures
- [ ] `python scripts/generate_module_tree.py` → OK
- [ ] AUDIT_LEDGER.md updated với entry M1
- [ ] `module_tree_full.md` regenerated

### M2 sign-off checklist

- [ ] M1 sign-off đã hoàn tất
- [ ] F30–F39 PASS
- [ ] DrawingStorage unit tests PASS
- [ ] `npm run type-check` → 0 errors
- [ ] AUDIT_LEDGER.md updated với entry M2

### M3 sign-off checklist

- [ ] M2 sign-off đã hoàn tất
- [ ] F40–F47 PASS
- [ ] `npm run type-check` → 0 errors
- [ ] AUDIT_LEDGER.md updated với entry M3
- [ ] `module_tree_full.md` regenerated

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
