# Taskboard — IC-GAP: Technical Gap Remediation

> **Trạng thái package:** COMPLETE — source + tests + final gates đã PASS (2026-05-06)  
> **Baseline tests:** 114 (từ IC-3)  
> **Target tests:** ≥127 (114 + ≥13 test mới)  
> **Implementation Plan:** [IC_GAP_IMPLEMENTATION_PLAN.md](./IC_GAP_IMPLEMENTATION_PLAN.md)  
> **Audit Protocol:** [IC_GAP_AUDIT_PROTOCOL.md](./IC_GAP_AUDIT_PROTOCOL.md)

---

## Quy ước trạng thái

- `READY` — có thể code ngay theo tài liệu hiện có
- `TODO` — đã trong plan nhưng chờ prerequisite
- `IN_PROGRESS` — đang code
- `DONE` — slice đã đóng, có audit evidence

---

## Gap 1 — Viewport Change Event

> **Phụ thuộc:** IC-1 ✅ · IC-2 ✅ · IC-3 ✅  
> **Effort ước tính:** 1–2 ngày  
> **File chính:** `src/lib/ChartCanvas.tsx`, `src/lib/core/DynamicChart.tsx`  
> **Gate:** type-check + 5 unit tests PASS + không regression

| ID | Trạng thái | Công việc | File đích | Đầu ra bắt buộc |
|----|-----------|-----------|-----------|-----------------|
| GAP1-01 | DONE | Thêm `VisibleRange` interface vào `chart.ts` + export | `src/lib/core/types/chart.ts` *(new)* | type-check PASS; export từ `core/index.ts` và `src/index.ts` |
| GAP1-02 | DONE | Thêm `onVisibleRangeChange` prop vào `ChartCanvas` + emit trong `componentDidUpdate` | `src/lib/ChartCanvas.tsx` | prop optional; emit chỉ khi index thực sự thay đổi; không emit khi plotData empty |
| GAP1-03 | DONE | Forward `onVisibleRangeChange` qua `DynamicChart` với `useCallback` | `src/lib/core/DynamicChart.tsx` | prop optional; callback stable; không tạo closure thừa |
| GAP1-04 | DONE | Viết 5 unit tests cho viewport event | `src/lib/core/__tests__/gap1-viewport-event.test.tsx` *(new)* | 5 tests PASS; không regression |

**Gate GAP1:** `npm run type-check` exit 0 · `npm test` ≥119 pass · không regression

---

## Gap 3 — Scroll/Zoom API

> **Phụ thuộc:** IC-1 ✅ · IC-2 ✅ · IC-3 ✅ · GAP1-01 (cần VisibleRange type — làm song song)  
> **Effort ước tính:** 2–3 ngày  
> **File chính:** `src/lib/ChartCanvas.tsx`, `src/lib/core/DynamicChart.tsx`  
> **Gate:** type-check + 7 unit tests PASS + backward compat

| ID | Trạng thái | Công việc | File đích | Đầu ra bắt buộc |
|----|-----------|-----------|-----------|-----------------|
| GAP3-01 | DONE | Thêm `ChartHandle` interface vào `chart.ts` + export | `src/lib/core/types/chart.ts` | 3 method signature; JSDoc đầy đủ; export từ indexes |
| GAP3-02 | DONE | Thêm 3 public methods vào `ChartCanvas` class | `src/lib/ChartCanvas.tsx` | `setXExtents`, `getFullData`, `getCurrentViewportBarCount` public; type-check PASS |
| GAP3-03 | DONE | Wrap `DynamicChart` bằng `forwardRef<ChartHandle>` + `useImperativeHandle` | `src/lib/core/DynamicChart.tsx` | 3 method hoạt động; guard cho invalid args; `displayName` set; backward compat |
| GAP3-04 | DONE | Viết 7 unit tests cho scroll/zoom API | `src/lib/core/__tests__/gap3-scroll-zoom-api.test.tsx` *(new)* | 7 tests PASS; test invalid args; test backward compat no-ref |

**Gate GAP3:** `npm run type-check` exit 0 · `npm test` ≥121 pass · `<DynamicChart />` không có ref vẫn compile

---

## Gap 2 — Canvas Overlay System

> **Phụ thuộc:** GAP1-01 ✅ (cần `VisibleRange`) · GAP1-02 (cần `currentVisibleRange` trong ChartCanvas)  
> **Effort ước tính:** 3–5 ngày  
> **File chính:** `ChartCanvas.tsx` (context provider), 3 files mới  
> **Gate:** type-check + 7 unit tests PASS + visual smoke

| ID | Trạng thái | Công việc | File đích | Đầu ra bắt buộc |
|----|-----------|-----------|-----------|-----------------|
| GAP2-01 | DONE | Tạo `ChartRenderContext` + `useChartRenderContext` hook + wire provider vào `ChartCanvas.render()` | `src/lib/core/canvas/ChartRenderContext.ts` *(new)* + thay đổi `ChartCanvas.tsx` | hook throw error ngoài Provider; Provider value từ state ChartCanvas |
| GAP2-02 | DONE | Tạo `OverlayCanvas` component | `src/lib/core/canvas/OverlayCanvas.tsx` *(new)* | `pointerEvents: none`; HiDPI setup; clear trước draw; exception guard |
| GAP2-03 | DONE | Tạo `WhaleBubbleOverlay` minh họa | `src/lib/indicators/overlays/WhaleBubbleOverlay.tsx` *(new)* | Bubble tại đúng tọa độ; màu theo side; radius tỷ lệ; `draw` stable qua `useCallback` |
| GAP2-04 | DONE | Viết 7 unit tests cho canvas overlay | `src/lib/core/__tests__/gap2-canvas-overlay.test.tsx` *(new)* | 7 tests PASS; test Provider guard; test draw callback; test pointerEvents |

**Gate GAP2:** `npm run type-check` exit 0 · `npm test` ≥127 pass · visual smoke: bubble hiện đúng vị trí

---

## Gate tổng — GAP-FINAL

| ID | Trạng thái | Công việc | Đầu ra bắt buộc |
|----|-----------|-----------|-----------------|
| GAP-FINAL-01 | DONE | Chạy `npm run type-check` toàn bộ | Exit 0 ✓ |
| GAP-FINAL-02 | DONE | Chạy `npm test` toàn bộ | 133 tests PASS (target ≥127) ✓ |
| GAP-FINAL-03 | DONE | Chạy `npm run build:docs` | webpack 5.106.2 compiled 8.83 MiB ✓ |
| GAP-FINAL-04 | DONE | Regenerate module tree | 685 modules (+8) ✓ |
| GAP-FINAL-05 | DONE | Ghi entry vào `AUDIT_LEDGER.md` | Entry #26 ✓ |
| GAP-FINAL-06 | DONE | Browser smoke Gap 2 | `ChartRenderContext.Provider` live với 8 fields (xScale, yScale, plotData, candleWidth, devicePixelRatio, visibleRange, width, height) xác nhận qua React fiber |
| GAP-FINAL-07 | DONE | Browser smoke Gap 3 | `ChartCanvas.setXExtents([t-20, t])` gọi thành công, viewport zoom từ 121 nến → 20 nến, `visibleRange.barCount === 20` xác nhận qua React fiber |

---

## Thứ tự làm (dependency graph trực quan)

```
GAP1-01 ──┬──► GAP1-02 ──► GAP1-03 ──► GAP1-04 (tests)
           │
GAP3-01 ──┴──► GAP3-02 ──► GAP3-03 ──► GAP3-04 (tests)
                                    ↑
                               cần GAP1-03 xong

GAP1-02 ──► GAP2-01 ──► GAP2-02 ──► GAP2-03 ──► GAP2-04 (tests)
  ↑ (cần currentVisibleRange)

Tất cả DONE ──► GAP-FINAL
```

**Gap 1 + Gap 3 song song.  Gap 2 bắt đầu sau khi Gap 1 xong.**

---

## Cách đọc bảng này

- Bắt đầu từ `READY` → làm xong → đánh `DONE` → chuyển task tiếp
- Không bắt đầu GAP2-01 cho đến khi GAP1-02 DONE
- Không bắt đầu GAP3-03 cho đến khi GAP1-03 DONE (cần `DynamicChartProps` đã có `onVisibleRangeChange`)
- Mỗi gate cần pass trước khi đóng slice
- Nếu phát hiện scope mới ngoài plan → dừng, cập nhật tài liệu trước khi code tiếp
