# Handoff Manifest: Drawing Tools Engine (TradingView/GoCharting-grade)

## 1. Mục tiêu

Bàn giao bộ tài liệu thực thi hệ thống Drawing Tools đạt chuẩn quốc tế, cho phép người dùng vẽ và phân tích kỹ thuật trực tiếp trên chart với chất lượng ngang TradingView/GoCharting. Công việc được chia thành 3 milestone độc lập, mỗi milestone có gate riêng.

Phạm vi: `src/lib/drawing/`, `src/lib/core/DynamicChart.tsx`, `src/demo/LibraryShowcaseDemo.tsx`, `src/demo/i18n.tsx`, `src/demo/demo.css`.

## 2. Bộ tài liệu bàn giao

| File | Vai trò |
| :--- | :--- |
| [TECH_SPEC.md](TECH_SPEC.md) | Đặc tả kỹ thuật, data model, coordinate bridge, constraint kiến trúc |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Kế hoạch triển khai M1/M2/M3 với gate rõ ràng |
| [TASKBOARD.md](TASKBOARD.md) | Bảng task chi tiết, dependency, DoD từng task |
| [AUDIT_PROTOCOL.md](AUDIT_PROTOCOL.md) | Quy trình kiểm chứng, functional/regression matrix, evidence bắt buộc |

## 3. Định nghĩa Done tổng thể

### Milestone M1 — Core Drawing Engine

1. Click chọn tool → cursor đổi theo mode (crosshair cho trendLine/fib, horizontal cho hLine, vertical cho vLine).
2. Click đặt điểm đầu → preview đường hiển thị ngay khi move chuột.
3. Click điểm cuối → drawing được commit vào history.
4. ESC hủy drawing đang vẽ và về idle.
5. Click vào drawing đã vẽ → highlight selected state.
6. Delete/Backspace → xóa selected drawing.
7. Ctrl+Z undo / Ctrl+Y redo hoạt động.
8. Tất cả 8 tool built-in (Trend Line, H-Line, V-Line, Fibonacci, Channel, Text, Rectangle, Arrow) đều render đúng trên chart.
9. `npm run type-check` PASS; `npm run test` PASS.

### Milestone M2 — Inspector + Persistence

1. Click drawing → panel inspector hiện, hiển thị màu, stroke width, line style, lock state.
2. Thay đổi bất kỳ thuộc tính nào → drawing cập nhật ngay.
3. Lock drawing → không thể kéo/xóa; icon lock hiện.
4. Reload page → toàn bộ drawings vẫn còn (per symbol + timeframe).
5. Export JSON → tải file về đúng schema.
6. Import JSON → restore drawings.
7. `npm run type-check` PASS.

### Milestone M3 — Advanced Tools + Alert Markers

1. Price Range tool: kéo 2 điểm → badge hiện Δ% và số bars.
2. Position Box: 3 dòng giá (entry/stop/target) → box fill xanh/đỏ + R/R ratio badge.
3. Fib Extension: levels 127.2%, 141.4%, 161.8%, 200%, 261.8%.
4. Multi-select: Shift+click → group highlight, Delete xóa nhóm.
5. Toolbar có divider nhóm rõ: Lines | Fib | Shapes | Analysis.
6. `npm run type-check` PASS.

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

## 6. Trạng thái điểm bắt đầu (as-built)

### Đã có — sẵn dùng

| Component | File | Trạng thái |
| :--- | :--- | :--- |
| DrawingObject type | `src/lib/drawing/types.ts` | Done — 6 tool types |
| State machine | `src/lib/drawing/stateMachine.ts` | Done — idle/drawing/complete/selected/moving/resizing/editing |
| History reducer | `src/lib/drawing/history.ts` | Done — push/undo/redo/clear |
| Serialization | `src/lib/drawing/serialization.ts` | Done — JSON round-trip |
| Tool registry | `src/lib/drawing/registry.ts` | Done |
| 6 built-in tools | `src/lib/drawing/builtin/` | Done — data model only, render: () => undefined |
| Toolbar UI | `src/demo/LibraryShowcaseDemo.tsx` | Done — 8 buttons, activeTool state |

### Chưa có — cần xây

| Component | Milestone |
| :--- | :--- |
| Coordinate bridge (pixel ↔ price/time) | M1 |
| SVG render functions cho từng tool | M1 |
| DrawingLayer SVG overlay component | M1 |
| Wire toolbar → drawing interaction | M1 |
| Keyboard shortcuts | M1 |
| DrawingInspector (property panel) | M2 |
| DrawingStorage (localStorage adapter) | M2 |
| useDrawingStorage hook | M2 |
| Rectangle built-in tool | M1 |
| Arrow built-in tool | M1 |
| PriceRange tool | M3 |
| PositionBox tool | M3 |
| FibExtension tool | M3 |

## 7. Handoff owner

- Product owner: Chart UX team
- Implementation owner: Drawing tools frontend team
- Audit owner: QA + Tech lead
- i18n owner: Demo i18n team
