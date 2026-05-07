# Implementation Plan — IC-GAP: Technical Gap Remediation

> **Trạng thái:** Approved — sẵn sàng code  
> **Phiên bản:** 1.0 · 2026-05-06  
> **Phụ thuộc:** IC-1 ✅ · IC-2 ✅ · IC-3 ✅  
> **Manifest:** [IC_GAP_HANDOFF_MANIFEST.md](./IC_GAP_HANDOFF_MANIFEST.md)  
> **Tech Spec:** [IC_GAP_TECH_SPEC.md](./IC_GAP_TECH_SPEC.md)  
> **Taskboard:** [IC_GAP_TASKBOARD.md](./IC_GAP_TASKBOARD.md)

---

## 1. Mục tiêu

Đóng 3 gap kỹ thuật trong chart engine để GĐ2 (VN-exclusive indicators — Whale Bubbles, CVD
real-time) có thể được triển khai mà không cần thay đổi thêm engine.

**Kết quả đo được khi IC-GAP hoàn tất:**

1. `DynamicChart` emit `onVisibleRangeChange` callback đúng mỗi khi viewport thay đổi.
2. `OverlayCanvas` component tồn tại, render được, không block mouse, nhận `draw` callback.
3. `WhaleBubbleOverlay` render bubble tại đúng tọa độ trên canvas với mock data.
4. `DynamicChart` accept `ref: React.Ref<ChartHandle>` — `scrollToIndex`, `zoomToRange`,
   `scrollToDate` hoạt động.
5. Tất cả tests cũ (≥114) vẫn pass. Có ≥8 test mới covering 3 gap.
6. `npm run type-check` exit 0. `npm run build:docs` thành công.

---

## 2. Nguyên tắc triển khai

1. **Additive only** — không thay đổi behavior hiện có. Mọi prop mới là optional.
2. **Không chạm EventCapture.tsx** — Gap 1 emit từ `ChartCanvas.componentDidUpdate`.
3. **Canvas overlay là render-only** — `pointerEvents: none` bắt buộc.
4. **WhaleBubbleOverlay không có network** — nhận data qua props, không tự fetch.
5. **Gap 1 trước Gap 2** — `VisibleRange` type cần tồn tại trước khi viết `ChartRenderContext`.
6. **Gap 3 song song với Gap 1** — `ChartHandle` type độc lập, `forwardRef` không cần Gap 1.

---

## 3. Slice map

| Slice ID | Mô tả | Gap | Effort | Phụ thuộc |
|----------|-------|-----|--------|-----------|
| GAP1-01 | Thêm `VisibleRange` type + export | Gap 1 | 0.5 ngày | — |
| GAP1-02 | `onVisibleRangeChange` prop + emit trong `ChartCanvas` | Gap 1 | 0.5 ngày | GAP1-01 |
| GAP1-03 | Forward callback trong `DynamicChart` | Gap 1 | 0.5 ngày | GAP1-02 |
| GAP1-04 | Unit tests Gap 1 | Gap 1 | 0.5 ngày | GAP1-03 |
| GAP3-01 | Thêm `ChartHandle` type + export | Gap 3 | 0.5 ngày | — (song song GAP1) |
| GAP3-02 | Thêm 3 public methods vào `ChartCanvas` | Gap 3 | 0.5 ngày | GAP3-01 |
| GAP3-03 | `forwardRef` + `useImperativeHandle` trên `DynamicChart` | Gap 3 | 1 ngày | GAP3-02, GAP1-03 |
| GAP3-04 | Unit tests Gap 3 | Gap 3 | 0.5 ngày | GAP3-03 |
| GAP2-01 | `ChartRenderContext` provider | Gap 2 | 1 ngày | GAP1-01 (cần VisibleRange) |
| GAP2-02 | `OverlayCanvas` component | Gap 2 | 1 ngày | GAP2-01 |
| GAP2-03 | `WhaleBubbleOverlay` minh họa | Gap 2 | 1 ngày | GAP2-02 |
| GAP2-04 | Unit tests Gap 2 | Gap 2 | 1 ngày | GAP2-03 |
| GAP-FINAL | Audit, ledger, module tree | tất cả | 0.5 ngày | tất cả slice trên |

**Thứ tự khuyến nghị:**
```
Ngày 1: GAP1-01 → GAP1-02 → GAP1-03 (xong Gap 1 core)
         GAP3-01 → GAP3-02 (song song)
Ngày 2: GAP1-04 + GAP3-03 → GAP3-04 (xong Gap 3)
Ngày 3: GAP2-01 → GAP2-02 → GAP2-03
Ngày 4: GAP2-04 → GAP-FINAL
```

---

## 4. DoD từng slice

### GAP1-01 — VisibleRange type

**File:** `src/lib/core/types/chart.ts` *(tạo mới hoặc thêm vào file đã có)*

**Definition of Done:**
- [ ] Interface `VisibleRange` có đủ 5 fields: `startIndex`, `endIndex`, `startDate`, `endDate`, `barCount`
- [ ] Export từ `src/lib/core/index.ts` và `src/index.ts`
- [ ] `npm run type-check` exit 0

**Code target:**
```typescript
export interface VisibleRange {
  startIndex: number;
  endIndex: number;
  startDate: Date;
  endDate: Date;
  barCount: number;
}
```

---

### GAP1-02 — onVisibleRangeChange trong ChartCanvas

**File:** `src/lib/ChartCanvas.tsx`

**Definition of Done:**
- [ ] Props interface có `onVisibleRangeChange?: (range: VisibleRange) => void`
- [ ] `componentDidUpdate` emit callback khi `plotData` thay đổi index range
- [ ] Emit chỉ xảy ra khi `startIndex` hoặc `endIndex` thực sự thay đổi (guard)
- [ ] Không emit khi `plotData.length === 0`
- [ ] Instance variable `currentVisibleRange` được update trước khi emit (cần cho Gap 2)
- [ ] `npm run type-check` exit 0

**Kiểm tra trực tiếp trong code:**
1. Tìm `ChartCanvasProps` (hoặc `propTypes`) → thêm `onVisibleRangeChange`
2. Tìm `componentDidUpdate` → thêm emit logic
3. Tìm field `plotData` trong state → dùng để đọc `startIndex`/`endIndex`
4. Kiểm tra field tên index trong `EnrichedDatum` (có thể là `idx` hoặc `index`) → điều chỉnh

---

### GAP1-03 — Forward trong DynamicChart

**File:** `src/lib/core/DynamicChart.tsx`

**Definition of Done:**
- [ ] `DynamicChartProps` có `onVisibleRangeChange?: (range: VisibleRange) => void`
- [ ] Import `VisibleRange` từ `./types/chart`
- [ ] Callback được wrap trong `useCallback` và pass xuống `ChartCanvas`
- [ ] Khi `onVisibleRangeChange` không được truyền, không tạo closure (conditional pass)
- [ ] `npm run type-check` exit 0

---

### GAP1-04 — Unit tests Gap 1

**File:** `src/lib/core/__tests__/gap1-viewport-event.test.ts` *(new)*

**Definition of Done:**
- [ ] Test 1: `ChartCanvas` emit `onVisibleRangeChange` với đúng `startIndex` khi plotData thay đổi
- [ ] Test 2: Không emit khi `plotData` empty
- [ ] Test 3: Emit với đúng `barCount` = plotData.length
- [ ] Test 4: Guard — không emit khi index không đổi (cùng start/end)
- [ ] Test 5: `DynamicChart` forward callback đến `ChartCanvas`
- [ ] `npm test -- gap1` → tất cả pass
- [ ] Không có regression trong tests cũ

**Gợi ý cấu trúc test:**
```typescript
import { render, act } from "@testing-library/react";
// hoặc vitest mount nếu codebase dùng vitest

describe("Gap 1 — Viewport Change Event", () => {
  it("emits onVisibleRangeChange khi plotData thay đổi", () => { ... });
  it("không emit khi plotData empty", () => { ... });
  it("barCount đúng bằng plotData.length", () => { ... });
  it("không emit khi range không thay đổi", () => { ... });
  it("DynamicChart forward callback đến ChartCanvas", () => { ... });
});
```

---

### GAP3-01 — ChartHandle type

**File:** `src/lib/core/types/chart.ts` *(cùng file với VisibleRange)*

**Definition of Done:**
- [ ] Interface `ChartHandle` có 3 method: `scrollToIndex`, `zoomToRange`, `scrollToDate`
- [ ] JSDoc đầy đủ cho mỗi method
- [ ] Export từ `src/lib/core/index.ts` và `src/index.ts`
- [ ] `npm run type-check` exit 0

---

### GAP3-02 — Public methods trong ChartCanvas

**File:** `src/lib/ChartCanvas.tsx`

**Definition of Done:**
- [ ] Method `setXExtents(extents: [Date, Date]): void` — gọi `this.setState({ xExtents })`
- [ ] Method `getFullData(): readonly Record<string, unknown>[]` — trả về `this.props.data`
- [ ] Method `getCurrentViewportBarCount(): number` — trả về `this.state.plotData.length`
- [ ] Các method là `public` (không phải private/protected)
- [ ] `npm run type-check` exit 0

**Quan trọng:** Kiểm tra tên prop data thực tế của `ChartCanvas`. Có thể là `data`, `fullData`,
hay tên khác. Điều chỉnh `getFullData()` cho khớp.

---

### GAP3-03 — forwardRef + useImperativeHandle trên DynamicChart

**File:** `src/lib/core/DynamicChart.tsx`

**Definition of Done:**
- [ ] `DynamicChart` được wrap bằng `forwardRef<ChartHandle, DynamicChartProps>`
- [ ] `useImperativeHandle` expose đủ 3 method
- [ ] `scrollToIndex` tính đúng extents dựa trên `align` + current viewport size
- [ ] `scrollToIndex(-1, ...)` và `scrollToIndex(index > fullData.length, ...)` bị guard
- [ ] `zoomToRange(start > end, ...)` bị guard
- [ ] `scrollToDate` với date không tìm thấy → return ngay
- [ ] `DynamicChart.displayName = "DynamicChart"` được set
- [ ] Backward compat: `<DynamicChart data={...} />` không có ref vẫn compile và hoạt động
- [ ] `npm run type-check` exit 0

---

### GAP3-04 — Unit tests Gap 3

**File:** `src/lib/core/__tests__/gap3-scroll-zoom-api.test.ts` *(new)*

**Definition of Done:**
- [ ] Test 1: `scrollToIndex(50, "center")` → `setXExtents` được gọi với args có sense
- [ ] Test 2: `scrollToIndex(-1)` → không gọi `setXExtents`
- [ ] Test 3: `zoomToRange(10, 30)` → `setXExtents([data[10].date, data[30].date])`
- [ ] Test 4: `zoomToRange(30, 10)` (invalid) → không gọi `setXExtents`
- [ ] Test 5: `scrollToDate(new Date(...))` → tìm đúng index và gọi `scrollToIndex`
- [ ] Test 6: `scrollToDate` với date không tìm thấy → không throw
- [ ] Test 7: `<DynamicChart />` không có ref → vẫn render bình thường
- [ ] `npm test -- gap3` → tất cả pass

---

### GAP2-01 — ChartRenderContext

**File:** `src/lib/core/canvas/ChartRenderContext.ts` *(new)*

**Definition of Done:**
- [ ] `ChartRenderContextValue` interface đủ 8 fields: `xScale`, `yScale`, `plotData`,
      `candleWidth`, `devicePixelRatio`, `visibleRange`, `width`, `height`
- [ ] `ChartRenderContext = createContext<ChartRenderContextValue | null>(null)`
- [ ] `useChartRenderContext()` hook với error khi dùng ngoài Provider
- [ ] `ChartCanvas.render()` wrap children trong `ChartRenderContext.Provider`
- [ ] Provider value được tính từ state hiện tại của `ChartCanvas`
- [ ] `npm run type-check` exit 0

**Ghi chú về yScale:** `ChartCanvas` có thể có nhiều yScale (mỗi pane một scale riêng).
Trong scope Gap 2, dùng yScale của price pane (primary pane). Ghi chú trong code nếu đây
là simplification.

---

### GAP2-02 — OverlayCanvas component

**File:** `src/lib/core/canvas/OverlayCanvas.tsx` *(new)*

**Definition of Done:**
- [ ] Component nhận props: `draw: (ctx: OverlayDrawContext) => void`, `zIndex?: number`, `className?: string`
- [ ] Canvas có `position: absolute`, `pointerEvents: none`
- [ ] HiDPI setup: `canvas.width = width * dpr`, `ctx.scale(dpr, dpr)`
- [ ] `ctx.clearRect(0, 0, width, height)` trước mỗi draw
- [ ] `useEffect` dependency array gồm `[draw, renderCtx]`
- [ ] Exception trong `draw` được catch, không crash chart
- [ ] Canvas skip render nếu `width === 0 || height === 0`
- [ ] `npm run type-check` exit 0

---

### GAP2-03 — WhaleBubbleOverlay minh họa

**File:** `src/lib/indicators/overlays/WhaleBubbleOverlay.tsx` *(new)*

**Definition of Done:**
- [ ] Component nhận `events: readonly WhaleEvent[]`, `threshold?`, `baseRadius?`, `maxRadius?`
- [ ] `draw` callback stable qua `useCallback` với deps đúng
- [ ] BUY bubble màu xanh, SELL bubble màu đỏ
- [ ] Radius scale theo `sqrt(matchedValue / threshold) * baseRadius`, cap ở `maxRadius`
- [ ] `EXTREME` severity → stroke đậm hơn, hiện label `▲`/`▼` nếu radius đủ lớn
- [ ] `events` empty → return ngay không vẽ gì
- [ ] Bar không tìm thấy trong `plotData` → skip event đó (không crash)
- [ ] Export `WhaleEvent` type từ file này hoặc từ `src/lib/core/types/`
- [ ] `npm run type-check` exit 0

---

### GAP2-04 — Unit tests Gap 2

**File:** `src/lib/core/__tests__/gap2-canvas-overlay.test.ts` *(new)*

**Definition of Done:**
- [ ] Test 1: `OverlayCanvas` render không throw khi có Provider
- [ ] Test 2: `OverlayCanvas` throw khi dùng ngoài Provider
- [ ] Test 3: `draw` callback được gọi với đúng `ctx`
- [ ] Test 4: canvas có `pointerEvents: none`
- [ ] Test 5: `draw` throw → error được catch, không propagate
- [ ] Test 6: `WhaleBubbleOverlay` với mock events → `draw` được gọi
- [ ] Test 7: `WhaleBubbleOverlay` với events empty → `draw` return ngay
- [ ] `npm test -- gap2` → tất cả pass

---

### GAP-FINAL — Audit + module tree

**Definition of Done:**
- [ ] `npm run type-check` exit 0 (toàn bộ)
- [ ] `npm test` → tất cả pass (≥114 + ≥13 test mới = ≥127 total)
- [ ] `npm run build:docs` thành công
- [ ] `python scripts/generate_module_tree.py` → số module tăng (có file mới)
- [ ] `docs/upgrade-standard/AUDIT_LEDGER.md` có entry mới cho IC-GAP
- [ ] `module_tree_full.md` được commit cùng với source changes
- [ ] Tất cả file mới có header comment ngắn gọn mô tả mục đích

---

## 5. Files sẽ bị thay đổi hoặc tạo mới

### Files thay đổi (modify)

| File | Gap | Loại thay đổi |
|------|-----|---------------|
| `src/lib/ChartCanvas.tsx` | Gap 1 + Gap 2 + Gap 3 | Thêm prop, public methods, context provider |
| `src/lib/core/DynamicChart.tsx` | Gap 1 + Gap 3 | Thêm prop, forwardRef, useImperativeHandle |
| `src/lib/core/index.ts` | Gap 1 + Gap 2 + Gap 3 | Thêm exports |
| `src/index.ts` | Gap 1 + Gap 2 + Gap 3 | Thêm public exports |

### Files mới (create)

| File | Gap | Mục đích |
|------|-----|----------|
| `src/lib/core/types/chart.ts` | Gap 1 + Gap 3 | `VisibleRange`, `ChartHandle` types |
| `src/lib/core/canvas/ChartRenderContext.ts` | Gap 2 | Context provider + hook |
| `src/lib/core/canvas/OverlayCanvas.tsx` | Gap 2 | Canvas overlay component |
| `src/lib/indicators/overlays/WhaleBubbleOverlay.tsx` | Gap 2 | Minh họa overlay |
| `src/lib/core/__tests__/gap1-viewport-event.test.ts` | Gap 1 | 5 unit tests |
| `src/lib/core/__tests__/gap2-canvas-overlay.test.ts` | Gap 2 | 7 unit tests |
| `src/lib/core/__tests__/gap3-scroll-zoom-api.test.ts` | Gap 3 | 7 unit tests |

### Files không được sửa

- `src/lib/EventCapture.tsx` — quyết định đã chốt
- `src/demo/**` — không có UI mới trong IC-GAP
- `src/lib/core/hooks/**` — không thay đổi hooks IC-3
- `docs/project-delivery/indicator-platform/IMPLEMENTATION_PLAN.md` — file cũ cho IC-1+IC-2

---

## 6. Rủi ro và cách giảm thiểu

| Rủi ro | Xác suất | Giảm thiểu |
|--------|----------|-----------|
| `ChartCanvas.componentDidUpdate` chưa có hoặc có logic phức tạp | Trung bình | Đọc file trước khi code, xác nhận field tên `plotData` trong state |
| `yScale` trong `ChartRenderContext` lấy nhầm scale (nhiều pane) | Trung bình | Ghi note rõ trong code: "primary pane yScale only — GĐ2 cần per-pane scale" |
| `forwardRef` trên `DynamicChart` break consumer hiện tại | Thấp | `forwardRef` backward compat — ref là optional, không có ref vẫn hoạt động |
| `OverlayCanvas` bị z-index conflict với layer khác | Thấp | Dùng `zIndex` prop default 5, test visually sau khi build |
| `ChartCanvas` class không có `componentDidUpdate` | Thấp | `componentDidUpdate` là React lifecycle standard — class component chắc có |
| Test utilities chưa đủ để test canvas operations | Trung bình | Mock `getContext("2d")` trong test, không test pixel-level output |

---

## 7. Thứ tự làm và checkpoint hằng ngày

```
=== Ngày 1 ===
AM: GAP1-01 + GAP3-01 (types) → type-check
PM: GAP1-02 (ChartCanvas emit) + GAP3-02 (public methods) → type-check

=== Ngày 2 ===
AM: GAP1-03 (DynamicChart forward) + GAP1-04 (tests)
PM: GAP3-03 (forwardRef) → type-check + test

=== Ngày 3 ===
AM: GAP3-04 (tests Gap 3) → npm test toàn bộ
PM: GAP2-01 (ChartRenderContext) + GAP2-02 (OverlayCanvas)

=== Ngày 4 ===
AM: GAP2-03 (WhaleBubbleOverlay) → type-check
PM: GAP2-04 (tests Gap 2) → npm test toàn bộ

=== Ngày 5 ===
Sáng: GAP-FINAL (audit, ledger, module tree, build verify)
Chiều: Browser smoke + commit
```
