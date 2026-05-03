# Kế hoạch triển khai thư viện React/TypeScript

> Mục tiêu: chuyển `react-stockcharts-master` thành thư viện React 19 + TypeScript strict có thể xuất bản, tích hợp được vào các dự án tài chính dùng Django + vnstock.
>
> Điểm xuất phát: kiến trúc đã chốt trong [ARCHITECTURE.md](./ARCHITECTURE.md), cộng với kho tính năng hiện có trong `src/lib/`, `react-stockcharts-examples/` và `react-stockcharts-examples2`.
>
> Trước khi bắt đầu coding, bắt buộc đọc [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md).
>
> Bộ tài liệu bàn giao, audit và evidence: [HANDOFF_MANIFEST.md](./HANDOFF_MANIFEST.md), [AUDIT_LEDGER.md](./AUDIT_LEDGER.md), [AUDIT_TEST_MATRIX.md](./AUDIT_TEST_MATRIX.md), [SLICE_AUDIT.md](./SLICE_AUDIT.md), [TASKBOARD.md](./TASKBOARD.md), [DELIVERY_CLOSEOUT.md](./DELIVERY_CLOSEOUT.md).

---

## 1. Quyết định build: tsup thay vì webpack cho phần thư viện

### Kết luận

Chọn `tsup` làm build tool chính cho package thư viện. Giữ `webpack` chỉ cho demo app hoặc các luồng preview cũ nếu thật sự cần.

### Lý do

- `tsup` sinh đồng thời ESM, CJS và `.d.ts` từ một cấu hình rất nhỏ.
- Thư viện chart cần tree-shaking tốt, bundle gọn, build nhanh và dễ phát hành npm.
- `webpack` phù hợp hơn với một ứng dụng web lớn nhiều loader/plugin, nhưng với library publish thì thường nặng và dư thừa.
- Kiến trúc trong [ARCHITECTURE.md](./ARCHITECTURE.md) yêu cầu public API rõ ràng, strict TypeScript và surface ổn định; `tsup` khớp trực tiếp với mục tiêu đó.

### Quy tắc thực thi

- Dùng `tsup` cho `src/index.ts` và mọi entry public của package.
- Dùng `webpack` chỉ nếu cần giữ nguyên build demo hiện tại trong giai đoạn chuyển tiếp.
- Không phụ thuộc vào `webpack` cho contract public của thư viện.
- Storybook regression/build cho P6 dùng builder Vite; không quay lại pipeline Webpack cho stories.

---

## 2. Bản đồ hiện trạng của repo → kiến trúc mục tiêu

| Hiện trạng | Vai trò mới | Ghi chú |
|------------|-------------|---------|
| `src/lib/ChartCanvas.tsx` | `ChartTerminal` + engine điều phối | Root container, zoom/pan, sync state |
| `src/lib/Chart.tsx` | `ChartPane` | Một pane độc lập, có thể mount/unmount runtime |
| `src/lib/axes/` | `XAxis`, `YAxisLeft`, `YAxisRight` | Dual axis và scale render |
| `src/lib/series/` | Built-in renderers | Candlestick, Line, Area, Bar, Volume, VolumeProfile |
| `src/lib/indicator/` + `src/lib/calculator/` | Indicator compute layer | Pure functions, tách khỏi React |
| `src/lib/interactive/` | Drawing tools | TrendLine, Fibonacci, Channel, Text, Y-coordinate |
| `src/lib/tooltip/` | Tooltip adapters | Tooltip gắn vào indicator hoặc series |
| `react-stockcharts-examples/` | Source nghiệp vụ/feature inventory | Nhìn theo hướng “cái gì cần có trong library” |
| `react-stockcharts-examples2/` | Regression stories / feature catalog | Nguồn map các example cũ sang component mới |

---

## 3. Những nhóm tính năng cần bóc ra từ examples

### Chart types

- Candlestick, OHLC, Area, Line, Bar, Scatter, Bubble.
- Non-time-series: Heikin Ashi, Kagi, Renko, Point and Figure.

### Indicators và overlays

- MA, EMA, WMA, TMA, MACD, RSI, Bollinger, SAR, Stochastic, ElderRay, ElderImpulse, ForceIndex.
- Volume overlay, VolumeProfile, compare, price markers.

### Tương tác

- Zoom, pan, brush, hover tooltip, crosshair, click callback.
- Annotation, interactive indicator, text, Y-coordinate, edge markers.

### Layout và runtime pane

- Multi-pane layout.
- Pane create/remove runtime.
- PaneSplitter kéo để resize.
- Dual Y-axis trên cùng một pane.

### Orderflow

- CVD, delta, footprint, volume profile, whale alert, orderbook, time & sales.

### Data lifecycle

- Load thêm dữ liệu khi kéo về quá khứ.
- Realtime update qua WebSocket hoặc stream tương tự.

---

## 4. Lộ trình triển khai

### Phase 0 — Audit và chuẩn hóa

- Chốt public API và naming conventions.
- Chốt cấu trúc thư mục target theo [ARCHITECTURE.md](./ARCHITECTURE.md).
- Lập map giữa feature trong examples và component tương lai.
- Xác định tập example tối thiểu để dùng làm regression stories.

### Phase 1 — Foundation

- Cấu hình `tsup` cho ESM + CJS + declaration.
- Bật strict TypeScript.
- Tạo `src/index.ts` làm public entry point.
- Chốt các type cốt lõi: `OHLCVBar`, `PaneConfig`, `IndicatorConfig`, `IndicatorDefinition`, `StockDataAdapter`.

### Phase 2 — Chart shell

- Tách `ChartCanvas` thành `ChartTerminal`.
- Tách `Chart` thành `ChartPane`.
- Implement `usePaneManager()`.
- Thêm `PaneSplitter` cho drag-resize runtime.
- Thêm dual Y-axis trên cùng một pane.

### Phase 3 — Indicator registry

- Chuyển indicator từ kiểu chain cũ sang `IndicatorDefinition`.
- Tách compute pure functions và render functions.
- Đăng ký built-in indicators qua registry.
- Ưu tiên: EMA, SMA, MACD, RSI, Bollinger, Volume, CVD, VolumeProfile.

### Phase 4 — Drawing tools

- Chuyển `interactive/` thành drawing tool registry.
- Thêm state machine cho tạo/sửa/xóa annotation.
- Bảo đảm object vẽ có thể serialize để lưu xuống backend.

### Phase 5 — Data adapter

- Implement `StockDataAdapter`.
- Tạo adapter mẫu cho Django + vnstock.
- Hỗ trợ fetch lịch sử, load thêm dữ liệu, subscribe realtime.

### Phase 6 — Examples conversion

- Chọn các example tiêu biểu từ `react-stockcharts-examples2` để chuyển sang stories/components.
- Dùng chúng làm tài liệu sống và regression check cho library mới.
- Không copy nguyên xi UI cũ; chỉ chuyển logic, hành vi và coverage.

---

## 5. Ưu tiên chuyển đổi từ examples2

| Ví dụ cũ | Chuyển thành | Giá trị trong kiến trúc mới |
|---------|--------------|-----------------------------|
| `CandleStickStockScaleChartWithVolumeBarV3` | Multi-pane + splitter + right-axis volume | Chứng minh layout runtime và dual Y-axis |
| `CandleStickChartWithMACDIndicator` | MACD registry entry + tooltip + overlay | Chứng minh registry indicator |
| `CandleStickChartWithBrush`, `CandleStickChartWithZoomPan`, `CandleStickChartWithCHMousePointer` | Interaction primitives | Chứng minh zoom/pan/brush/crosshair |
| `CandleStickChartWithAnnotation`, `CandleStickChartWithText`, `CandleStickChartWithInteractiveIndicator` | Drawing tools | Chứng minh annotation model |
| `VolumeProfileChart`, `VolumeProfileBySessionChart` | Orderflow modules | Chứng minh volume profile / profile theo session |
| `HeikinAshi`, `Kagi`, `Renko`, `PointAndFigure` | Chart type modules | Chứng minh non-time-series chart types |
| `CandleStickChartPanToLoadMore`, `CandleStickChartWithUpdatingData`, `KagiWithUpdatingData` | Data adapter + realtime loader | Chứng minh load thêm và update realtime |
| `OHLCChartWithElderImpulseIndicator`, `OHLCChartWithElderRayIndicator`, `CandleStickChartWithRSIIndicator`, `CandleStickChartWithSAR` | Built-in indicators | Chứng minh indicator catalog |

---

## 6. Quy tắc tổ chức file khi triển khai

- `src/lib/types/` cho contract public.
- `src/lib/core/` cho shell chart, pane manager và context.
- `src/lib/indicators/` cho compute + render + registry.
- `src/lib/drawing/` cho tools và state machine.
- `src/lib/adapters/` cho backend integration.
- `src/lib/utils/` chỉ giữ helper thuần, không chứa logic business.

---

## 7. Công nghệ cần áp dụng cho hệ thống nhiều người truy cập

Thư viện chart chỉ là một phần. Với các ứng dụng tài chính có hàng nghìn người dùng đồng thời, phải thiết kế cả tầng dữ liệu, realtime và hạ tầng triển khai để không dồn tải về trình duyệt hoặc một tiến trình Django duy nhất.

### 7.1 Frontend của ứng dụng dùng thư viện

| Lớp | Công nghệ khuyến nghị | Vai trò |
|-----|------------------------|--------|
| UI runtime | React 19 + TypeScript strict | Giữ state giao diện, pane layout, indicator settings |
| Build package | `tsup` | Build thư viện nhanh, gọn, tree-shakeable |
| App shell | Vite hoặc Next.js | Vite cho dashboard SPA, Next.js nếu cần SSR/SEO |
| Data fetching | TanStack Query | Cache, dedupe request, background refetch |
| UI state | Zustand hoặc Redux Toolkit | Quản lý layout, watchlist, theme, modal |
| Heavy compute | Web Worker | Tính toán indicator nặng, volume profile, orderflow |
| Canvas optimization | OffscreenCanvas khi hỗ trợ | Giảm jitter khi vẽ nhiều layer |
| Re-render control | requestAnimationFrame batching | Tránh update DOM/canvas quá dày |

### 7.2 Backend phục vụ dữ liệu thị trường

| Lớp | Công nghệ khuyến nghị | Vai trò |
|-----|------------------------|--------|
| API chính | Django REST Framework | Endpoint lịch sử, chart config, symbol search |
| Realtime | Django Channels + ASGI | WebSocket cho bar update, orderbook, trade tape |
| App server | Gunicorn/Uvicorn | Chạy nhiều worker, tách HTTP và ASGI đúng cách |
| Background jobs | Celery | Đồng bộ dữ liệu, tính chỉ báo nặng, quét whale alerts |
| Broker/cache | Redis | Cache, session, pub/sub, rate limit, Celery broker |
| Database chính | PostgreSQL | Lưu user, watchlist, config, bar lịch sử chuẩn |
| Time-series nâng cao | TimescaleDB hoặc ClickHouse | Tối ưu OHLCV, tick, orderflow khối lượng lớn |
| Search | PostgreSQL full-text hoặc OpenSearch | Tìm mã, lọc symbol, lookup nhanh theo tên/sector |

### 7.3 Tầng dữ liệu và tính toán

- Ưu tiên SQL projection để chỉ lấy đúng cột cần cho chart, filter và pagination.
- Dùng Pandas vectorized computation cho indicator, aggregation và resample.
- Dùng materialized view hoặc bảng tổng hợp cho các khung thời gian phổ biến như 1m, 5m, 1h, 1D.
- Tách dữ liệu tick, orderbook và bar history thành các bảng/collection riêng để giảm contention.
- Với luồng lớn, dùng Kafka hoặc NATS chỉ khi Redis pub/sub không còn đủ.

### 7.4 Hạ tầng triển khai và quan sát

| Lớp | Công nghệ khuyến nghị | Vai trò |
|-----|------------------------|--------|
| Edge | Nginx hoặc Cloudflare | TLS, compression, caching, reverse proxy |
| Container | Docker | Đóng gói đồng nhất dev/staging/prod |
| Orchestration | Kubernetes hoặc ECS | Tự động scale khi traffic tăng |
| Cache/CDN | Cloudflare CDN / edge cache | Giảm tải API và static assets |
| Observability | OpenTelemetry + Prometheus + Grafana | Metrics, tracing, dashboard |
| Logging | Structured JSON logs | Debug request, job, websocket session |
| Error tracking | Sentry | Bắt lỗi frontend/backend theo release |
| Rate limit | Redis-based rate limiting | Chống burst traffic và abuse |

### 7.5 Kết luận thực thi

- Bắt đầu với Docker + Nginx + Django REST Framework + Channels + Redis + Celery + PostgreSQL.
- Khi tải tăng, nâng cấp storage time-series và thêm hàng đợi sự kiện chuyên dụng.
- Giữ chart rendering ở client, nhưng mọi tính toán nặng và tái tổng hợp dữ liệu nên đi qua backend hoặc worker.
- Không để mỗi user tự tính lại toàn bộ data history; phải cache theo symbol, timeframe và visible window.

---

## 8. Audit file list của lần cập nhật này

- `package.json`
- `package-lock.json`
- `.storybook/main.ts`
- `.storybook/preview.ts`
- `stories/CandleStickStockScaleChartWithVolumeBarV3.stories.tsx`
- `stories/CandleStickChartWithMACDIndicator.stories.tsx`
- `stories/CandleStickChartWithBrush.stories.tsx`
- `stories/CandleStickChartWithAnnotation.stories.tsx`
- `stories/CandleStickChartWithHoverTooltip.stories.tsx`
- `stories/CandleStickChartPanToLoadMore.stories.tsx`
- `stories/CandleStickChartWithRSIIndicator.stories.tsx`
- `stories/VolumeProfileChart.stories.tsx`
- `stories/CoverageMap.md`
- `stories/support/chartTheme.ts`
- `stories/support/storyData.ts`
- `stories/support/StoryFrame.tsx`
- `stories/support/ChartSurface.tsx`
- `stories/support/exampleStories.tsx`
- `docs/TypeScript/IMPLEMENTATION_PLAN.md`
- `docs/TypeScript/TASKBOARD.md`
- `docs/TypeScript/AUDIT_LEDGER.md`
- `docs/TypeScript/SLICE_AUDIT.md`
- `module_tree_full.md`
