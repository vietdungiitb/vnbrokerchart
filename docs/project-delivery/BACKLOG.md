# Backlog

## Ưu tiên cao

1. SSOT runtime cho indicators và tooltip/yExtents.
2. Functional tests cho i18n, pane visibility, chart type switching.
3. Smoke check tự động cho live fallback path.

## Ưu tiên trung bình

1. Locale-aware date/time formatting cho axes và tooltip.
2. Chuẩn hóa naming cho series labels ngắn trong legend.
3. Exportable widget shell adapter.

## Ưu tiên thấp

1. Nâng i18n từ demo-local thành shared adapter khi widgetization bắt đầu.
2. Bổ sung docs cho embed API mẫu.
3. Tách riêng demo design tokens và widget design tokens.

## 3b. Drawing Tools Engine (B-130–B-139)

| ID | Hạng mục | Milestone | Ưu tiên |
| :--- | :--- | :--- | :--- |
| B-130 | Tạo `coordinateUtils.ts` — pixel ↔ chart coordinate bridge (pixelToChartPoint, chartPointToPixel, ChartScales interface) | M1 | Cao |
| B-131 | Tạo `renderSvg.ts` — SVG render functions cho 8 built-in tool types (trendLine, hLine, vLine, fibonacci, channel, text, rectangle, arrow) | M1 | Cao |
| B-132 | Tạo `useDrawingInteraction.ts` — hook wrap stateMachine + historyReducer, expose undo/redo/deleteSelected/cancelDrawing | M1 | Cao |
| B-133 | Tạo `DrawingLayer.tsx` — SVG overlay absolute-positioned, xử lý pointer events, compose coordinateUtils + renderSvg + interaction hook | M1 | Cao |
| B-134 | Tạo `builtin/rectangle.ts` + `builtin/arrow.ts`; sửa `types.ts` — thêm "rectangle"\|"arrow" vào DrawingToolType union | M1 | Cao |
| B-135 | Wire demo M1: mount DrawingLayer trong LibraryShowcaseDemo, keyboard handler (Ctrl+Z/Y/ESC/Del), i18n keys, cursor CSS | M1 | Cao |
| B-136 | Tạo `DrawingStorage.ts` + `useDrawingStorage.ts` — localStorage persistence per symbol+timeframe, export/import JSON | M2 | Trung bình |
| B-137 | Tạo `DrawingInspector.tsx` — floating property panel: color, stroke width, line style, lock toggle, delete; wire vào demo M2 | M2 | Trung bình |
| B-138 | Tạo 3 advanced tools M3: `builtin/priceRange.ts`, `builtin/positionBox.ts`, `builtin/fibExtension.ts` + render + demo wiring | M3 | Thấp |
| B-139 | M3 multi-select (Shift+click), toolbar group divider (Lines/Fib/Shapes/Analysis), i18n + CSS hoàn chỉnh | M3 | Thấp |

> Tài liệu đặc tả đầy đủ: [`docs/upgrade-standard/drawing-tools/`](../upgrade-standard/drawing-tools/HANDOFF_MANIFEST.md)
