# Audit Protocol — IC-GAP: Technical Gap Remediation

> **Phiên bản:** 1.0 · 2026-05-06  
> **Áp dụng cho:** Gap 1 (Viewport Event) · Gap 2 (Canvas Overlay) · Gap 3 (Scroll/Zoom API)  
> **Manifest:** [IC_GAP_HANDOFF_MANIFEST.md](./IC_GAP_HANDOFF_MANIFEST.md)  
> **Quality standard:** [quality/QUALITY.md](../../../quality/QUALITY.md)

---

## 1. Mục tiêu

Mỗi gap phải để lại đủ evidence để audit trả lời nhanh 3 câu hỏi:

1. Đã thay đổi gì.
2. Thay đổi đó có đúng spec và plan không.
3. Có thể verify lại nhanh bằng lệnh nào.

---

## 2. Validation commands chuẩn

Chạy từ root repo sau mỗi gap:

```powershell
# Từ C:\Mujoco Projects\react-stockcharts-master
npm run type-check
npm test
npm run build:docs
python scripts/generate_module_tree.py
```

**Expected results sau khi đóng toàn bộ IC-GAP:**

```
type-check : exit 0, 0 errors
npm test   : ≥127 tests PASS (baseline 114 + ≥13 mới)
build:docs : "compiled successfully" hoặc tương đương
module_tree: số modules tăng (baseline 677 + 7 files mới tối thiểu)
```

---

## 3. Gate commands theo gap

### Gap 1 — Viewport Event

```powershell
# Type check chỉ các file liên quan
npx tsc --noEmit --strict src/lib/ChartCanvas.tsx src/lib/core/DynamicChart.tsx src/lib/core/types/chart.ts

# Chạy test riêng
npm test -- --reporter=verbose gap1

# Verify export
node -e "const m = require('./src/lib/core/index.ts'); console.log('VisibleRange' in m || Object.keys(m));"
```

**Smoke test thủ công Gap 1:**

1. Mở `build/index.html` trong browser
2. Mở DevTools Console
3. Gõ lệnh sau (nếu `window.__chartRef` exposed từ demo):
   ```javascript
   // Kiểm tra callback fire khi pan
   // → Nếu không có global ref, verify qua Network/Performance tab
   // → Pan chart sang trái → check console không có error
   ```
4. Pan chart → không có error trong console
5. Zoom in → không có error

### Gap 2 — Canvas Overlay

```powershell
# Type check files mới
npx tsc --noEmit --strict src/lib/core/canvas/ChartRenderContext.ts src/lib/core/canvas/OverlayCanvas.tsx src/lib/indicators/overlays/WhaleBubbleOverlay.tsx

# Chạy test riêng
npm test -- --reporter=verbose gap2
```

**Smoke test thủ công Gap 2:**

1. Thêm `WhaleBubbleOverlay` vào `LibraryShowcaseDemo.tsx` với mock data:
   ```typescript
   const mockWhaleEvents = [
     { ts: data[50]?.date, price: data[50]?.close, side: "BUY" as const,
       matchedValue: 8_000_000_000, severity: "HIGH" as const },
     { ts: data[30]?.date, price: data[30]?.close, side: "SELL" as const,
       matchedValue: 15_000_000_000, severity: "EXTREME" as const },
   ];
   // <WhaleBubbleOverlay events={mockWhaleEvents} />
   ```
2. Build và mở browser
3. **Verify:**
   - Bubble xanh lá xuất hiện gần nến 50
   - Bubble đỏ lớn hơn xuất hiện gần nến 30 (EXTREME — 15 tỷ)
   - Bubble không block chart interaction (click/pan vẫn hoạt động)
   - Bubble reposition đúng khi pan/zoom
4. Xóa mock data sau khi smoke xong (không commit mock vào demo)

### Gap 3 — Scroll/Zoom API

```powershell
# Type check
npx tsc --noEmit --strict src/lib/core/DynamicChart.tsx src/lib/core/types/chart.ts

# Chạy test riêng
npm test -- --reporter=verbose gap3
```

**Smoke test thủ công Gap 3:**

1. Thêm test ref vào demo (tạm thời, xóa sau smoke):
   ```typescript
   // Trong LibraryShowcaseDemo.tsx (tạm thời)
   const chartRef = useRef<ChartHandle>(null);
   // ...
   <button onClick={() => chartRef.current?.scrollToIndex(0, "left")}>Đầu</button>
   <button onClick={() => chartRef.current?.scrollToIndex(data.length - 1, "right")}>Cuối</button>
   <DynamicChart ref={chartRef} ... />
   ```
2. Build và mở browser
3. **Verify:**
   - Bấm "Đầu" → chart nhảy về nến đầu tiên
   - Bấm "Cuối" → chart nhảy về nến mới nhất
   - Không có error trong console
4. Xóa mock buttons sau smoke (không commit vào demo)

---

## 4. Smoke checklist tổng hợp

### Sau khi đóng Gap 1

- [ ] `VisibleRange` type export từ `src/lib/core/index.ts`
- [ ] `onVisibleRangeChange` nhận callback → callback được gọi khi pan/zoom
- [ ] Callback KHÔNG gọi khi chart chưa load data
- [ ] Không có TypeScript error mới
- [ ] 5 unit tests PASS

### Sau khi đóng Gap 3

- [ ] `ChartHandle` type export từ `src/lib/core/index.ts`
- [ ] `<DynamicChart ref={ref} />` compile không error
- [ ] `<DynamicChart />` (không có ref) compile và hoạt động bình thường
- [ ] `scrollToIndex(50)` di chuyển viewport
- [ ] `scrollToIndex(-1)` không crash
- [ ] `zoomToRange(10, 30)` thu hẹp viewport
- [ ] 7 unit tests PASS

### Sau khi đóng Gap 2

- [ ] `OverlayCanvas` render được trong cây `ChartCanvas`
- [ ] `OverlayCanvas` throw khi dùng ngoài `ChartCanvas` tree
- [ ] Canvas có `pointerEvents: none` — chart interaction không bị block
- [ ] Bubble hiện đúng tại tọa độ mock data
- [ ] Bubble reposition sau pan/zoom
- [ ] 7 unit tests PASS

### Gate tổng — GAP-FINAL

- [ ] `npm run type-check` exit 0
- [ ] `npm test` ≥127 tests PASS
- [ ] `npm run build:docs` không lỗi
- [ ] `python scripts/generate_module_tree.py` chạy xong, số module tăng
- [ ] `AUDIT_LEDGER.md` có entry IC-GAP
- [ ] `module_tree_full.md` đã regenerate
- [ ] Không có TODO comment `// FIXME`, `// HACK`, `// TEMP` trong code commit

---

## 5. Test spec chi tiết

### 5.1 Gap 1 Tests — `gap1-viewport-event.test.ts`

```typescript
// Cấu trúc test tham chiếu cho đội code
// Dùng Vitest (framework hiện tại của dự án)

import { describe, it, expect, vi } from "vitest";

describe("Gap 1 — onVisibleRangeChange", () => {
  it("T1: emit callback khi plotData thay đổi với index khác", () => {
    // Setup: mount ChartCanvas với onVisibleRangeChange spy
    // Action: trigger componentDidUpdate với plotData mới (index khác)
    // Assert: spy được gọi 1 lần với { startIndex, endIndex, startDate, endDate, barCount }
  });

  it("T2: không emit khi plotData empty", () => {
    // Setup: ChartCanvas với plotData = []
    // Action: trigger componentDidUpdate
    // Assert: spy KHÔNG được gọi
  });

  it("T3: barCount bằng plotData.length", () => {
    // Setup: plotData có 30 bars
    // Action: trigger componentDidUpdate
    // Assert: spy được gọi với barCount = 30
  });

  it("T4: không emit khi startIndex và endIndex không đổi", () => {
    // Setup: prevState.plotData[0].idx === nextState.plotData[0].idx
    // Action: trigger componentDidUpdate
    // Assert: spy KHÔNG được gọi (guard hoạt động)
  });

  it("T5: DynamicChart forward onVisibleRangeChange đến ChartCanvas", () => {
    // Setup: mount DynamicChart với onVisibleRangeChange spy
    // Assert: ChartCanvas nhận prop onVisibleRangeChange đúng reference
  });
});
```

### 5.2 Gap 3 Tests — `gap3-scroll-zoom-api.test.ts`

```typescript
describe("Gap 3 — ChartHandle Scroll/Zoom API", () => {
  it("T1: scrollToIndex(50, 'center') gọi setXExtents với args hợp lý", () => {
    // Setup: DynamicChart với ref + fullData 100 bars
    // Action: ref.current.scrollToIndex(50, "center")
    // Assert: ChartCanvas.setXExtents được gọi với [Date, Date] hợp lý
  });

  it("T2: scrollToIndex(-1) không gọi setXExtents", () => {
    // Action: ref.current.scrollToIndex(-1)
    // Assert: setXExtents KHÔNG được gọi
  });

  it("T3: zoomToRange(10, 30) gọi setXExtents với [data[10].date, data[30].date]", () => {
    // Action: ref.current.zoomToRange(10, 30)
    // Assert: setXExtents([data[10].date, data[30].date])
  });

  it("T4: zoomToRange(30, 10) (invalid) không gọi setXExtents", () => {
    // Action: ref.current.zoomToRange(30, 10)
    // Assert: setXExtents KHÔNG được gọi
  });

  it("T5: scrollToDate tìm đúng index và gọi scrollToIndex tương đương", () => {
    // Setup: data[25].date = new Date("2026-03-01")
    // Action: ref.current.scrollToDate(new Date("2026-03-01"))
    // Assert: setXExtents được gọi với extents tương đương scrollToIndex(25)
  });

  it("T6: scrollToDate với date không tìm thấy không throw", () => {
    // Action: ref.current.scrollToDate(new Date("1900-01-01"))
    // Assert: không throw, setXExtents KHÔNG được gọi
  });

  it("T7: <DynamicChart /> không có ref vẫn render bình thường", () => {
    // Setup: mount DynamicChart mà không truyền ref
    // Assert: render không throw, không có error
  });
});
```

### 5.3 Gap 2 Tests — `gap2-canvas-overlay.test.ts`

```typescript
describe("Gap 2 — Canvas Overlay System", () => {
  it("T1: OverlayCanvas render không throw khi có ChartRenderContext.Provider", () => {
    // Setup: wrap OverlayCanvas trong mock Provider
    // Assert: render thành công
  });

  it("T2: useChartRenderContext throw khi dùng ngoài Provider", () => {
    // Action: render component gọi useChartRenderContext, không có Provider
    // Assert: error được throw với message "phải được dùng bên trong ChartCanvas tree"
  });

  it("T3: draw callback được gọi với ctx và các args đúng", () => {
    // Setup: draw spy, mock context value
    // Assert: spy được gọi với { ctx, xScale, yScale, plotData, candleWidth, ... }
  });

  it("T4: canvas element có style pointerEvents: none", () => {
    // Assert: canvas.style.pointerEvents === "none"
  });

  it("T5: draw throw exception → error được log, không propagate lên", () => {
    // Setup: draw = () => { throw new Error("draw error") }
    // Assert: component không unmount, không re-throw
  });

  it("T6: WhaleBubbleOverlay với mock events → draw được gọi", () => {
    // Setup: mount WhaleBubbleOverlay với events mock
    // Assert: draw callback được gọi ít nhất 1 lần
  });

  it("T7: WhaleBubbleOverlay với events empty → không có vẽ bubble", () => {
    // Setup: events = []
    // Assert: ctx.arc KHÔNG được gọi (mock ctx)
  });
});
```

---

## 6. Template audit note cho AUDIT_LEDGER.md

```text
## [Section N] IC-GAP — Technical Gap Remediation (Gap 1 + Gap 2 + Gap 3)

**Ngày:** 2026-xx-xx  
**Trạng thái:** COMPLETE  
**Phiên bản:** 1.0

### Files mới tạo
- src/lib/core/types/chart.ts (VisibleRange, ChartHandle)
- src/lib/core/canvas/ChartRenderContext.ts
- src/lib/core/canvas/OverlayCanvas.tsx
- src/lib/indicators/overlays/WhaleBubbleOverlay.tsx
- src/lib/core/__tests__/gap1-viewport-event.test.ts
- src/lib/core/__tests__/gap2-canvas-overlay.test.ts
- src/lib/core/__tests__/gap3-scroll-zoom-api.test.ts

### Files thay đổi
- src/lib/ChartCanvas.tsx (onVisibleRangeChange, 3 public methods, ChartRenderContext.Provider)
- src/lib/core/DynamicChart.tsx (onVisibleRangeChange forward, forwardRef, useImperativeHandle)
- src/lib/core/index.ts (new exports)
- src/index.ts (new public exports)

### Behavior mới
- Gap 1: ChartCanvas emit onVisibleRangeChange khi viewport thay đổi
- Gap 2: OverlayCanvas layer canvas-native cho whale bubbles và heatmap
- Gap 3: DynamicChart.scrollToIndex / zoomToRange / scrollToDate imperative API

### Validation
- type-check: exit 0
- npm test: XXX/XXX pass (≥127)
- build:docs: PASS
- module_tree: XXX modules
- browser smoke Gap 2: bubble render đúng vị trí
- browser smoke Gap 3: scrollToIndex(50) → viewport di chuyển

### Residual risk
- yScale trong ChartRenderContext là primary pane only — GĐ2 sẽ cần per-pane scale
- OverlayCanvas HiDPI chưa test trên display >2x DPR
- WhaleBubbleOverlay là minh họa — GĐ2 cần adapter thật
```

---

## 7. Quy tắc đóng package IC-GAP

Không được đóng IC-GAP nếu thiếu một trong các mục sau:

1. `AUDIT_LEDGER.md` đã có entry mới với danh sách file đầy đủ
2. `module_tree_full.md` đã regenerate và commit
3. `npm test` ≥127 tests PASS
4. `npm run type-check` exit 0
5. `npm run build:docs` thành công
6. Smoke checklist Gap 2 (visual) và Gap 3 (functional) đã tick hết
7. Không có TODO/FIXME/TEMP comment trong code commit

**Không được đóng slice nếu:**
- Có test fail từ IC-1/IC-2/IC-3 (regression)
- `OverlayCanvas` bị `pointerEvents: auto` — phá chart interaction
- `ChartCanvas.tsx` bị break bởi Gap 1 emit (plotData không còn update đúng)
