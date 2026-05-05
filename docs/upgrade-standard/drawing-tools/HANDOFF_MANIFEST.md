# Handoff Manifest: Drawing Tools Engine (TradingView/GoCharting-grade)

## 1. Mục tiêu

Bàn giao bộ tài liệu thực thi hệ thống Drawing Tools đạt chuẩn quốc tế, cho phép người dùng vẽ và phân tích kỹ thuật trực tiếp trên chart với chất lượng ngang TradingView/GoCharting. Công việc được chia thành 4 milestone độc lập (M1→M4), mỗi milestone có gate riêng.

Phạm vi: `src/lib/drawing/`, `src/lib/core/DynamicChart.tsx`, `src/demo/LibraryShowcaseDemo.tsx`, `src/demo/i18n.tsx`, `src/demo/demo.css`.

## 2. Bộ tài liệu bàn giao

| File | Vai trò |
| :--- | :--- |
| [TECH_SPEC.md](TECH_SPEC.md) | Đặc tả kỹ thuật, data model, coordinate bridge, constraint kiến trúc — M1→M4 |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Kế hoạch triển khai M1→M4 với gate rõ ràng, thứ tự file bắt buộc |
| [TASKBOARD.md](TASKBOARD.md) | Bảng task chi tiết, dependency, DoD từng task — DT-01→DT-50 |
| [AUDIT_PROTOCOL.md](AUDIT_PROTOCOL.md) | Quy trình kiểm chứng, functional/regression matrix M1→M4, evidence bắt buộc |

## 3. Định nghĩa Done tổng thể

### Milestone M1 — Core Drawing Engine ✅ DONE (2026-05-05)

1. Click chọn tool → cursor đổi theo mode (crosshair cho trendLine/fib, horizontal cho hLine, vertical cho vLine).
2. Click đặt điểm đầu → preview đường hiển thị ngay khi move chuột.
3. Click điểm cuối → drawing được commit vào history.
4. ESC hủy drawing đang vẽ và về idle.
5. Click vào drawing đã vẽ → highlight selected state.
6. Delete/Backspace → xóa selected drawing.
7. Ctrl+Z undo / Ctrl+Y redo hoạt động.
8. Tất cả 8 tool built-in (Trend Line, H-Line, V-Line, Fibonacci, Channel, Text, Rectangle, Arrow) đều render đúng trên chart.
9. `npm run type-check` PASS; `npm run test` PASS (67 tests, 0 failures).

**Evidence:** commit `b1bf284` trên branch `dev`. AUDIT_LEDGER.md entry M1 đã được thêm.

### Milestone M2 — Inspector + Persistence

1. Click drawing → floating inspector panel hiện, hiển thị màu, stroke width, line style, lock state.
2. Thay đổi bất kỳ thuộc tính nào → drawing cập nhật ngay lập tức.
3. Lock drawing → không thể kéo/xóa; biểu tượng lock hiện bên cạnh drawing.
4. Clone drawing → bản copy xuất hiện offset 20px.
5. Hide drawing → ẩn khỏi chart nhưng vẫn trong danh sách.
6. Z-order: Bring to Front / Send to Back hoạt động.
7. Reload page → toàn bộ drawings vẫn còn (localStorage, key theo symbol + timeframe).
8. Export JSON → tải file về đúng schema, readable.
9. Import JSON → restore drawings đúng type/points/style.
10. Drawings list panel → danh sách tất cả drawings, click to select, eye icon toggle.
11. `npm run type-check` PASS; `npm test` PASS.

### Milestone M3 — Lines Nâng Cao + Position Tools

1. **Ray**: vẽ từ 1 điểm → extend vô tận 1 chiều; render đúng đến edge chart.
2. **Extended Line (X-Line)**: 2 điểm → extend vô tận 2 chiều; chuẩn TA.
3. **Polyline**: click nhiều điểm → double-click để hoàn tất; multi-segment path.
4. **Date & Price Range**: drag 2 điểm → box fill + badge `Δ+3.4% · 28 bars` đúng số.
5. **Long Position Box**: entry price + drag TP → drag SL → box fill xanh + đỏ + badge `R/R 1:2.0`, `P&L +$XXX`.
6. **Short Position Box**: tương tự Long nhưng inverted.
7. **Fibonacci Extension**: 2 điểm → levels [127.2%, 141.4%, 161.8%, 200%, 261.8%] render bên ngoài P1–P2.
8. **Multi-select**: Shift+click highlight ≥2 drawings; Delete xóa tất cả selected; drag di chuyển group.
9. **Toolbar groups**: divider rõ Lines | Fibonacci | Shapes | Analysis.
10. `npm run type-check` PASS; `npm test` PASS.

### Milestone M4 — Pattern Tools + Pro

1. **Parallel Channel (3-point)**: P1–P2 line chính + P3 xác định offset → 2 parallel lines + midline.
2. **Andrew's Pitchfork**: 3 điểm A/B/C → median line + 2 side lines song song.
3. **ABCD Harmonic**: 4 điểm A/B/C/D → label từng điểm + ratio badge AB/BC/CD.
4. **Fibonacci Arc**: 2 điểm → bán nguyệt với 3 cung tại 0.382/0.5/0.618 của khoảng cách.
5. **Fibonacci Time Zone**: 2 điểm (P1=0, P2=1) → các cột dọc tại Fibonacci intervals theo thời gian.
6. **Regression Channel**: 2 điểm thời gian → auto best-fit linear regression + std-dev bands.
7. Drawings list panel (nếu chưa có ở M2) có sort/filter by type.
8. `npm run type-check` PASS; `npm test` PASS.

## 4. Quy trình thực thi bắt buộc

1. Đọc `TECH_SPEC.md` trước khi code — đặc biệt phần Coordinate Bridge và Architecture Constraints.
2. Thực hiện đúng thứ tự file trong IMPLEMENTATION_PLAN.md — có dependency chain.
3. Tick task trong TASKBOARD.md khi hoàn thành từng task.
4. Thu thập evidence theo AUDIT_PROTOCOL.md trước khi đóng milestone.
5. Cập nhật `docs/upgrade-standard/AUDIT_LEDGER.md` khi kết thúc mỗi milestone.
6. Regenerate `module_tree_full.md` sau khi thêm file mới.

## 5. Constraint tuyệt đối (không được vi phạm)

| Constraint | Lý do |
| :--- | :--- |
| `src/lib/**` không import từ `src/demo/**` | Kiến trúc guard G08 — widget boundary |
| DrawingObject phải JSON-serializable tại mọi thời điểm | Persistence và undo/redo |
| Không dùng pixel coordinates trong DrawingObject — dùng chart coords | Responsive, resize-safe |
| Không lưu canvas context hoặc DOM ref trong DrawingObject | Serialization constraint |
| Tất cả UI text mới phải có i18n key | Standing rule dự án |
| Không dùng boolean flags rời rạc cho drawing state | Architecture guard G09 |

## 6. Trạng thái điểm bắt đầu (as-built 2026-05-05)

### Đã có — M1 COMPLETED ✅

| Component | File | Trạng thái |
| :--- | :--- | :--- |
| DrawingObject type + 8 tool types | `src/lib/drawing/types.ts` | ✅ Done — trendLine, hLine, vLine, fibonacci, channel, text, rectangle, arrow |
| State machine (7 states) | `src/lib/drawing/stateMachine.ts` | ✅ Done — idle/drawing/complete/selected/moving/resizing/editing |
| History reducer | `src/lib/drawing/history.ts` | ✅ Done — push/undo/redo/clear |
| JSON serialization | `src/lib/drawing/serialization.ts` | ✅ Done — round-trip verified |
| Tool registry | `src/lib/drawing/registry.ts` | ✅ Done |
| 8 built-in tools | `src/lib/drawing/builtin/` | ✅ Done — trendLine, hLine, vLine, fibonacci, channel, text, rectangle, arrow |
| Coordinate bridge | `src/lib/drawing/coordinateUtils.ts` | ✅ Done — pixel↔chart roundtrip tested |
| SVG render engine | `src/lib/drawing/renderSvg.ts` | ✅ Done — 8 tool types, selection handles |
| Drawing interaction hook | `src/lib/drawing/useDrawingInteraction.ts` | ✅ Done — undo/redo/deleteSelected/cancelDrawing |
| DrawingLayer overlay | `src/lib/drawing/DrawingLayer.tsx` | ✅ Done — SVG overlay, pointer events wired |
| Drawing API surface | `src/lib/drawing/index.ts` | ✅ Done — full export |
| Shared helpers | `src/lib/drawing/shared.ts` | ✅ Done |
| Demo toolbar (10 tools) | `src/demo/LibraryShowcaseDemo.tsx` | ✅ Done — Ctrl+Z/Y, Del, ESC wired |
| i18n keys M1 | `src/demo/i18n.tsx` | ✅ Done — vi + en, 10 tool keys |
| Vitest unit tests | `src/lib/drawing/*.test.ts` | ✅ Done — 16 drawing tests pass |
| GenericChartComponent bridge | `src/lib/GenericChartComponent.tsx` | ✅ Done — soft ChartContext fallback |
| Package API | `src/index.ts` | ✅ Done — drawing exports |

### Chưa có — cần xây theo thứ tự M2 → M3 → M4

| Component | Milestone | File đích |
| :--- | :--- | :--- |
| DrawingStorage (localStorage adapter) | M2 | `src/lib/drawing/DrawingStorage.ts` |
| useDrawingStorage hook | M2 | `src/lib/drawing/useDrawingStorage.ts` |
| DrawingInspector (floating property panel) | M2 | `src/lib/drawing/DrawingInspector.tsx` |
| Drawings list panel | M2 | `src/lib/drawing/DrawingListPanel.tsx` |
| Ray built-in tool | M3 | `src/lib/drawing/builtin/ray.ts` |
| Extended Line (X-Line) built-in | M3 | `src/lib/drawing/builtin/extendedLine.ts` |
| Polyline built-in | M3 | `src/lib/drawing/builtin/polyline.ts` |
| Date & Price Range built-in | M3 | `src/lib/drawing/builtin/dateAndPriceRange.ts` |
| Long Position built-in | M3 | `src/lib/drawing/builtin/longPosition.ts` |
| Short Position built-in | M3 | `src/lib/drawing/builtin/shortPosition.ts` |
| Fibonacci Extension built-in | M3 | `src/lib/drawing/builtin/fibExtension.ts` |
| Multi-select state | M3 | `src/lib/drawing/stateMachine.ts` (sửa) |
| Parallel Channel (3-point) | M4 | `src/lib/drawing/builtin/parallelChannel.ts` |
| Andrew's Pitchfork | M4 | `src/lib/drawing/builtin/pitchfork.ts` |
| ABCD Harmonic Pattern | M4 | `src/lib/drawing/builtin/abcdPattern.ts` |
| Fibonacci Arc | M4 | `src/lib/drawing/builtin/fibArc.ts` |
| Fibonacci Time Zone | M4 | `src/lib/drawing/builtin/fibTimeZone.ts` |
| Regression Channel | M4 | `src/lib/drawing/builtin/regressionChannel.ts` |

## 7. Handoff owner

- Product owner: Chart UX team
- Implementation owner: Drawing tools frontend team
- Audit owner: QA + Tech lead
- i18n owner: Demo i18n team
