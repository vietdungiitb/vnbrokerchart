# Audit Test Matrix: TypeScript Delivery

> Tài liệu này xác định tối thiểu phải test gì cho từng slice, test nào là bắt buộc, và bằng chứng nào phải giữ lại.

---

## 1. Test tiers bắt buộc

| Tier | Mục đích | Công cụ khuyến nghị |
| :--- | :--- | :--- |
| Static | Kiểm tra link, markdown, type surface | `git diff --check`, markdown lint, `tsc` |
| Unit | Xác minh logic thuần | Vitest |
| Integration | Xác minh component/service phối hợp | React Testing Library, mocked API |
| Browser smoke | Xác minh hành vi thực tế | Playwright |
| Visual regression | Xác minh layout/render | Storybook test runner, Playwright screenshot diff |
| Load/soak | Xác minh tải lớn | k6 hoặc Locust |
| Bundle budget | Kiểm soát kích thước package | size-limit, source-map-explorer |

---

## 2. Slice-to-test matrix

| Slice | Mandatory tests | Scale/production tests | Evidence artifact |
| :--- | :--- | :--- | :--- |
| P0 | `git diff --check`, link check, module tree inventory | N/A | Audit block P0 |
| P1 | `type-check`, `tsup` build, export smoke, unit tests cho types/utilities | Bundle budget check | Evidence P1 |
| P2 | Pane manager unit tests, ChartPane render smoke, PaneSplitter drag-resize Playwright | Multi-pane stress smoke | Evidence P2 |
| P3 | Indicator compute unit tests, registry tests, schema validation, tooltip smoke | Batch compute benchmark | Evidence P3 |
| P4 | Drawing state machine tests, serialize/deserialize, undo/redo history tests | Long-session interaction soak | Evidence P4 |
| P5 | Adapter contract tests, mocked REST/WS integration, retry/error-path tests | 1k-client cache/pub-sub soak | Evidence P5 |
| P6 | Visual regression, storybook build, example conversion smoke | Browser smoke on mixed datasets | Evidence P6 |

---

## 3. Bài test bắt buộc cho hệ thống tải lớn

Các bài test dưới đây phải xuất hiện trong kế hoạch kiểm thử khi tiến gần production:

- 1.000 client đồng thời đọc cùng một symbol/timeframe qua cache.
- 500+ websocket subscribers cùng lúc cho orderbook/trade tape.
- Render 5.000 đến 20.000 bars mà không vượt ngưỡng phản hồi UI chấp nhận được.
- Soak Celery/worker với các job tính indicator và aggregate orderflow.
- Đo p95 latency của REST API và websocket message delivery.
- Đo cache hit ratio của Redis cho symbol/timeframe phổ biến.
- Kiểm tra memory growth của frontend khi đổi pane, đổi indicator, và scroll sâu.

---

## 4. Exit criteria per slice

### P0

- Tài liệu bàn giao đầy đủ và đúng link.
- `module_tree_full.md` được đọc và inventory khớp.

### P1

- Package build được bằng `tsup`.
- TypeScript strict không lỗi trong phần public API.

### P2

- Thêm/xóa/resize pane chạy đúng.
- Dual Y-axis hiển thị đúng theo config.

### P3

- Indicator registry hoạt động và có unit coverage.
- Compute pure và render tách rời rõ ràng.

### P4

- Drawing object serialize được.
- Undo/redo không làm hỏng state.

### P5

- Adapter contract khớp backend Django/vnstock.
- Realtime subscription và retry path pass.

### P6

- Examples đã chuyển thành stories hoặc regression fixtures.
- Browser smoke và visual diff pass.
