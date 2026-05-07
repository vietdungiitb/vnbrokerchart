# Audit Protocol: Canvas DrawTools Engine (CE-Series)

**Phiên bản:** v1.0 | **Ngày:** 2026-05-06  
**Tài liệu liên quan:** [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) · [TASKBOARD.md](./TASKBOARD.md)

---

## 1. Các lệnh kiểm tra

### 1.1 Type check (bắt buộc sau mỗi slice)

```powershell
cd "C:\Mujoco Projects\react-stockcharts-master"
npm run type-check
```

**Pass criteria:** 0 errors. Warnings cho phép.

### 1.2 Unit tests

```powershell
npm test
```

**Pass criteria:** Tất cả test pass. Nếu có pre-existing failures, document chúng trước CE-01.

### 1.3 Build

```powershell
npm run build:docs
```

**Pass criteria:** Build thành công, không có ERROR (warnings cho phép).

### 1.4 Module tree regeneration

```powershell
python scripts/generate_module_tree.py
```

**Pass criteria:** File `module_tree_full.md` updated, chứa `renderCanvas`, `hitTest`, `snap`.

---

## 2. Validation matrix per slice

### CE-01 Validation

| Kiểm tra | Lệnh / Cách kiểm | Kết quả mong đợi |
| :--- | :--- | :--- |
| Type check | `npm run type-check` | 0 errors |
| File tồn tại | `Test-Path src/lib/drawing/renderCanvas.ts` | True |
| 8 tool cases | Grep `case "trendLine"` đến `case "arrow"` trong renderCanvas.ts | 8 case branches |
| applyLineStyle | Grep `setLineDash` trong renderCanvas.ts | Xuất hiện ≥ 3 lần (solid/dashed/dotted) |

### CE-02 Validation

| Kiểm tra | Lệnh / Cách kiểm | Kết quả mong đợi |
| :--- | :--- | :--- |
| Type check | `npm run type-check` | 0 errors |
| longPosition fill | Grep `rgba(34, 171, 92` trong renderCanvas.ts | Xuất hiện ≥ 1 lần |
| shortPosition fill | Grep `rgba(215, 50, 75` trong renderCanvas.ts | Xuất hiện ≥ 1 lần |
| Rectangle case | Grep `case "rectangle"` | Xuất hiện |

### CE-03 Validation

| Kiểm tra | Lệnh / Cách kiểm | Kết quả mong đợi |
| :--- | :--- | :--- |
| Type check | `npm run type-check` | 0 errors |
| FibArc arc draw | Grep `ctx.arc` trong renderCanvas.ts | Xuất hiện |
| FibTimeZone lines | Grep `case "fibTimeZone"` | Xuất hiện |
| Fib labels | Grep `ctx.fillText` trong renderCanvas.ts | Xuất hiện ≥ 4 lần |

### CE-04 Validation

| Kiểm tra | Lệnh / Cách kiểm | Kết quả mong đợi |
| :--- | :--- | :--- |
| Type check | `npm run type-check` | 0 errors |
| 21 tool cases | Đếm `case "` trong switch của `renderDrawingToCanvas` | Đúng 21 cases |
| RegressionChannel fill | Grep `rgba(100,149,237` trong renderCanvas.ts | Xuất hiện |
| R² badge | Grep `R²` hoặc `rSquared` trong renderCanvas.ts | Xuất hiện |
| No SVG imports | Grep `createElement` trong renderCanvas.ts | Không xuất hiện |

### CE-05 Validation

| Kiểm tra | Lệnh / Cách kiểm | Kết quả mong đợi |
| :--- | :--- | :--- |
| Type check | `npm run type-check` | 0 errors |
| File tồn tại | `Test-Path src/lib/drawing/hitTest.ts` | True |
| distanceToSegment | Grep `distanceToSegment` trong hitTest.ts | Xuất hiện ≥ 5 lần |
| 21 tool cases | Đếm `case "` trong switch của `hitTestDrawing` | ≥ 21 cases |
| getResizeHandleIndex | Grep `getResizeHandleIndex` trong hitTest.ts | Export function tồn tại |

### CE-06 Validation

| Kiểm tra | Lệnh / Cách kiểm | Kết quả mong đợi |
| :--- | :--- | :--- |
| Type check | `npm run type-check` | 0 errors |
| File tồn tại | `Test-Path src/lib/drawing/snap.ts` | True |
| OHLC snap | Grep `"ohlc"` trong snap.ts | Xuất hiện |
| Endpoint snap | Grep `"endpoint"` trong snap.ts | Xuất hiện |
| null return | Grep `return null` trong snap.ts | Xuất hiện |

### CE-07 Validation

| Kiểm tra | Lệnh / Cách kiểm | Kết quả mong đợi |
| :--- | :--- | :--- |
| Type check | `npm run type-check` | 0 errors |
| Unit tests | `npm test` | All pass |
| canvasDraw prop | Grep `canvasDraw` trong DrawingLayer.tsx | Xuất hiện |
| svgDraw no-op | Grep `svgDraw={() => null}` trong DrawingLayer.tsx | Xuất hiện |
| hitTest import | Grep `hitTestDrawing` trong DrawingLayer.tsx | Import + usage |
| snap import | Grep `findSnapPoint` trong DrawingLayer.tsx | Import + usage |
| No renderSvg import | Grep `renderDrawingToSvg` trong DrawingLayer.tsx | Không xuất hiện |

### CE-08 Validation

| Kiểm tra | Lệnh / Cách kiểm | Kết quả mong đợi |
| :--- | :--- | :--- |
| CSS classes | Grep `rsc-drawing-snap-active` trong demo.css | Xuất hiện |
| Position zones | Grep `rsc-long-tp-zone` trong demo.css | Xuất hiện |
| Build | `npm run build:docs` | Success |

### CE-09 Validation

| Kiểm tra | Lệnh / Cách kiểm | Kết quả mong đợi |
| :--- | :--- | :--- |
| Type check | `npm run type-check` | 0 errors |
| No interactive/ drawing imports | Grep `interactive/TrendLine\|interactive/Fibonacci` trong LibraryShowcaseDemo.tsx | Không xuất hiện |
| DrawingLayer props | Grep `activeTool=` và `interaction=` trong JSX | Xuất hiện |

### CE-10 Validation (Final Gate)

```powershell
# Full validation sequence
npm run type-check
npm test
npm run build:docs
python scripts/generate_module_tree.py

# Check AUDIT_LEDGER
Select-String -Pattern "CE-" -Path "docs/upgrade-standard/AUDIT_LEDGER.md"

# Check module tree
Select-String -Pattern "renderCanvas|hitTest|snap" -Path "module_tree_full.md"
```

---

## 3. Visual regression checklist

Sau CE-07 (DrawingLayer switch), kiểm tra visual trong browser:

```
http://localhost:8080  (hoặc file:///...build/index.html sau build)
```

| Tool | Hành động | Kết quả mong đợi |
| :--- | :--- | :--- |
| trendLine | Draw 2 điểm | Đường thẳng đúng màu, độ dày |
| hLine | Draw 1 điểm | Đường nằm ngang full width |
| vLine | Draw 1 điểm | Đường thẳng đứng full height |
| fibonacci | Draw 2 điểm | 9 fib levels với labels giá |
| rectangle | Draw 2 điểm | Hình chữ nhật với fill |
| longPosition | Draw 2 điểm | TP zone xanh, SL zone đỏ, R/R badge |
| shortPosition | Draw 2 điểm | TP zone xanh (dưới entry), SL zone đỏ (trên entry) |
| ray | Draw 2 điểm | Tia từ p0 qua p1, kéo dài đến edge |
| extendedLine | Draw 2 điểm | Đường kéo dài cả 2 chiều đến edge |
| arrow | Draw 2 điểm | Đường với đầu mũi tên tại p1 |
| text | Click | Text "Text" hoặc drawing.text tại vị trí click |
| cursor + click | Click vào drawing | Drawing được select (selection handles hiện) |
| cursor + click | Click vào trống | Drawing deselect |
| cursor + shift+click | Shift+click nhiều drawings | Multi-select |
| snap | Hover gần OHLC | Snap indicator vàng hiện tại đỉnh/đáy nến |

---

## 4. Regression test file targets

Các test file hiện tại cần pass sau CE series:

- `src/lib/drawing/drawing.test.ts` — stateMachine tests
- `src/lib/drawing/DrawingStorage.test.ts` — storage tests
- `src/lib/drawing/useDrawingInteraction.test.ts` — hook tests
- `src/lib/drawing/renderSvg.test.ts` — SVG tests (vẫn pass, renderSvg.ts không bị xóa)
- `src/lib/drawing/coordinateUtils.test.ts` — coordinate tests
- `src/lib/drawing/m3.test.ts`, `m4.test.ts` — existing slice tests

**Lưu ý:** Không cần viết thêm test mới cho CE series trong scope này. Nếu có `renderCanvas.test.ts` được tạo thêm, nó là bonus.

---

## 5. Evidence template cho AUDIT_LEDGER

Khi CE-10 hoàn thành, thêm entry sau vào `docs/upgrade-standard/AUDIT_LEDGER.md`:

```markdown
## CE-Series: Canvas DrawTools Engine

| Field | Value |
| :--- | :--- |
| Date | 2026-05-XX |
| Branch | dev |
| Slices | CE-01 → CE-10 |
| Files modified | src/lib/drawing/renderCanvas.ts (TẠO), src/lib/drawing/hitTest.ts (TẠO), src/lib/drawing/snap.ts (TẠO), src/lib/drawing/DrawingLayer.tsx (SỬA), src/demo/demo.css (SỬA) |
| Files docs | docs/upgrade-standard/canvas-drawtools/HANDOFF_MANIFEST.md, TECH_SPEC.md, IMPLEMENTATION_PLAN.md, TASKBOARD.md, AUDIT_PROTOCOL.md |
| Type check | 0 errors |
| Tests | All pass |
| Build | Success |
| Visual | ✅ 21 tools render trên canvas |
| Notes | SVG renderSvg.ts giữ nguyên, không xóa. Canvas path active qua DrawingLayer.canvasDraw |
```

---

## 6. Rollback plan

Nếu CE-07 gây ra regression không sửa được trong 1 ngày:

1. Revert `DrawingLayer.tsx` về phiên bản SVG: khôi phục `svgDraw={renderSVG}`, xóa `canvasDraw`
2. Giữ `renderCanvas.ts`, `hitTest.ts`, `snap.ts` — chúng không ảnh hưởng đến render path cũ
3. Tạo feature flag trong `LibraryShowcaseDemo.tsx`:
   ```typescript
   const USE_CANVAS = localStorage.getItem("rsc-canvas-engine") === "true";
   ```
   Truyền vào DrawingLayer để switch giữa SVG và canvas

Không xóa `renderSvg.ts` cho đến khi CE-10 audit pass và verified trên production build.
