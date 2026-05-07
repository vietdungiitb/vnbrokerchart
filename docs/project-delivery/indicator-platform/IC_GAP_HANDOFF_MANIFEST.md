# Handoff Manifest — IC-GAP: Technical Gap Remediation (Gap 1 + Gap 2 + Gap 3)

> **Trạng thái:** Approved — sẵn sàng code  
> **Phiên bản:** 1.0 · 2026-05-06  
> **Phụ thuộc upstream:** IC-1 ✅ · IC-2 ✅ · IC-3 ✅  
> **Entry point repo:** [docs/project-delivery/README.md](../README.md)  
> **Nguồn phân tích gap:** [docs/planning/INDICATOR_PLATFORM_PROPOSAL.md §14](../../planning/INDICATOR_PLATFORM_PROPOSAL.md)  
> **Ràng buộc:** tuân thủ [PROJECT_GOVERNANCE.md](../PROJECT_GOVERNANCE.md) và [CHANGE_CONTROL_STANDARD.md](../../CHANGE_CONTROL_STANDARD.md)

---

## 1. Lý do tồn tại

Audit code ngày 2026-05-06 phát hiện 3 gap kỹ thuật trong chart engine (không có trong đề
xuất gốc) là **prerequisite bắt buộc** để Giai đoạn 2 (VN-exclusive indicators — Whale
Bubbles, CVD real-time) hoạt động được:

| Gap | Vấn đề | Hậu quả nếu không fix |
|-----|--------|----------------------|
| **Gap 1** — Viewport Event | Không có callback khi user pan/zoom | CVD pane không biết range hiện tại; whale marker render sai vị trí |
| **Gap 2** — Canvas Overlay | Drawing tools dùng SVG, không có canvas-native overlay | Heatmap và whale bubble không scale; performance yếu khi nhiều event |
| **Gap 3** — Scroll/Zoom API | Không có imperative API để di chuyển viewport | Click whale alert → không nhảy được đến nến đó; date picker không hoạt động |

**Không có Gap 1+2+3, GĐ2 không thể triển khai được.**

---

## 2. Phạm vi

### Trong phạm vi (IN SCOPE)

| Hạng mục | File / Component | Gap |
|----------|-----------------|-----|
| `onVisibleRangeChange` prop + emit | `src/lib/ChartCanvas.tsx` | Gap 1 |
| `VisibleRange` type export | `src/lib/core/types/chart.ts` *(new fields)* | Gap 1 |
| Forward callback qua `DynamicChart` | `src/lib/core/DynamicChart.tsx` | Gap 1 |
| `ChartRenderContext` provider | `src/lib/core/canvas/ChartRenderContext.ts` *(new)* | Gap 2 |
| `OverlayCanvas` component | `src/lib/core/canvas/OverlayCanvas.tsx` *(new)* | Gap 2 |
| `useChartRenderContext` hook | `src/lib/core/canvas/useChartRenderContext.ts` *(new)* | Gap 2 |
| `WhaleBubbleOverlay` ví dụ minh họa | `src/lib/indicators/overlays/WhaleBubbleOverlay.tsx` *(new)* | Gap 2 |
| `ChartHandle` interface | `src/lib/core/types/chart.ts` | Gap 3 |
| `forwardRef` trên `DynamicChart` | `src/lib/core/DynamicChart.tsx` | Gap 3 |
| `useImperativeHandle` với 3 method | `src/lib/core/DynamicChart.tsx` | Gap 3 |
| Public methods trên `ChartCanvas` | `src/lib/ChartCanvas.tsx` | Gap 3 |
| Export `ChartHandle` từ public index | `src/lib/core/index.ts` + `src/index.ts` | Gap 3 |
| Unit tests 3 gap | `src/lib/core/__tests__/gap*.test.ts` *(new)* | tất cả |
| i18n keys mới (nếu có UI string) | `src/demo/i18n.tsx` | nếu có |

### Ngoài phạm vi (OUT OF SCOPE)

- Triển khai `VNInvestSignalAdapter` thật (GĐ2 scope, sau khi gap đóng)
- WebSocket connection management
- Footprint chart, order book visualization
- Heatmap data từ server (WhaleBubbleOverlay chỉ là component skeleton với mock data)
- Thay đổi class component `EventCapture.tsx` thành function component
- Bất kỳ thay đổi nào ở `EventCapture.tsx` (gap 1 không cần chạm file này)

---

## 3. Quyết định đã chốt

1. **Gap 1 không đụng EventCapture.tsx** — callback được emit từ `componentDidUpdate` trong
   `ChartCanvas.tsx` khi `plotData` thay đổi. Không cần sửa DOM event layer.

2. **OverlayCanvas là render-only** — không nhận mouse event, `pointerEvents: none`. Drawing
   tools interactive vẫn dùng SVG. Tách biệt đúng vai trò: canvas cho performance-critical
   render, SVG cho interactive tools.

3. **Gap 3 dùng `forwardRef` không phải Context** — `ChartHandle` ref là imperative pattern
   đúng theo React 19 (không cần `useImperativeHandle` trong Context vì chart có thể có nhiều
   instance).

4. **Không breaking change** — tất cả props mới là optional. `DynamicChart` với forwardRef vẫn
   dùng được không cần ref. `onVisibleRangeChange` optional.

5. **`WhaleBubbleOverlay` chỉ là mẫu minh họa** — nhận `events: WhaleEvent[]` prop, render
   bubble trên canvas. Không có network call. Data thật đến từ GĐ2 adapter, không phải Gap 2.

6. **i18n bắt buộc** — nếu có string UI mới (tooltip, label) phải thêm vào `i18n.tsx`.

7. **Dependency order:** Gap 1 → Gap 2 (Gap 2 cần `VisibleRange` từ Gap 1 trong
   `ChartRenderContext`). Gap 3 độc lập, có thể làm song song với Gap 1.

---

## 4. Tài liệu giao kèm

| File | Vai trò |
|------|---------|
| `IC_GAP_HANDOFF_MANIFEST.md` *(file này)* | Entry point, scope và quyết định đã chốt |
| `IC_GAP_TECH_SPEC.md` | Đặc tả kỹ thuật: interface, props, behavior từng gap |
| `IC_GAP_IMPLEMENTATION_PLAN.md` | Slice definition với DoD từng task |
| `IC_GAP_TASKBOARD.md` | Bảng task tác chiến, trạng thái ticket |
| `IC_GAP_AUDIT_PROTOCOL.md` | Gate commands, evidence template, smoke checklist |

---

## 5. Tiêu chí chấp nhận (Acceptance Criteria)

### Gate chung (chạy sau khi đóng mỗi gap)

```bash
npm run type-check    # phải exit 0
npm test              # phải pass >= 114 tests (baseline) + các test mới
npm run build:docs    # phải compile thành công
python scripts/generate_module_tree.py  # phải regenerate
```

### Gate Gap 1 — Viewport Event

- `ChartCanvas` có prop `onVisibleRangeChange?: (range: VisibleRange) => void`
- Callback fire khi user pan hoặc zoom (plotData thay đổi)
- `DynamicChart` forward callback qua với đúng type
- Unit test: mock `plotData` update → verify callback được gọi với đúng `startIndex`, `endIndex`
- Không có regression test nào bị break

### Gate Gap 2 — Canvas Overlay

- `OverlayCanvas` render được lên màn hình (không bị hidden bởi chart layers)
- `draw` callback nhận `ctx`, `xScale`, `yScale`, `plotData`, `candleWidth` đúng kiểu
- `WhaleBubbleOverlay` render bubble tại đúng tọa độ giá × thời gian với mock data
- `pointerEvents: none` — không block mouse event lên chart
- Canvas clear đúng trước mỗi render cycle
- Unit test: render `OverlayCanvas` với mock context → verify `draw` được gọi

### Gate Gap 3 — Scroll/Zoom API

- `DynamicChart` accept `ref` kiểu `React.Ref<ChartHandle>`
- `chartRef.current.scrollToIndex(50, "center")` → viewport di chuyển
- `chartRef.current.zoomToRange(0, 30)` → viewport thu hẹp về range đó
- `chartRef.current.scrollToDate(new Date(...))` → tìm index gần nhất và scroll
- Unit test: gọi method → verify `ChartCanvas.setXExtents` được gọi với args đúng
- Không breaking: `<DynamicChart />` không có ref vẫn compile và hoạt động

---

## 6. Dependency map

```
Gap 1 (Viewport Event)       Gap 3 (Scroll/Zoom API)
  ↑ 1–2 ngày                   ↑ 2–3 ngày
  │ KHÔNG phụ thuộc nhau — làm song song được
  │
  ▼ Gap 1 done
Gap 2 (Canvas Overlay)
  ↑ 3–5 ngày
  │ Cần VisibleRange type từ Gap 1
  │ Cần ChartRenderContext có plotData + xScale
```

---

## 7. Non-goals

- Không refactor `EventCapture.tsx` thành function component.
- Không implement GĐ2 data adapters trong package này.
- Không thêm network request nào.
- Không thêm third-party dependency mới.
- Không thay đổi bất kỳ behavior hiện có nào — additive only.
