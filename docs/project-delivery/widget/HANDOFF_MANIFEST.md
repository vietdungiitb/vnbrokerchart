# Handoff Manifest: VNStockChart — Widget Boundary Extraction (Slice F)

## 1. Mục tiêu

Bàn giao bộ tài liệu thực thi tách `VNStockChart` thành widget public API — lớp orchestrator mỏng ngồi trên `src/lib/core/**`, đóng gói theme, i18n, data sourcing, pane state, Error Boundary và Empty State thành một điểm nhúng duy nhất cho host app. Sau khi hoàn thành, demo chỉ còn là host app mẫu gọi `<VNStockChart ... />`.

Phạm vi: `src/widget/`, `src/lib/core/ChartTerminal.tsx`, `src/index.ts`, `src/demo/LibraryShowcaseDemo.tsx`, `src/demo/i18n.tsx`.

## 2. Bộ tài liệu bàn giao

| File | Vai trò |
| :--- | :--- |
| [TECH_SPEC.md](TECH_SPEC.md) | Đặc tả kỹ thuật: props contract, i18n fallback, data lifecycle, constraint kiến trúc |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Kế hoạch triển khai F-01→F-09 với thứ tự và dependency bắt buộc |
| [TASKBOARD.md](TASKBOARD.md) | Bảng task chi tiết, DoD từng task, dependency chain |
| [AUDIT_PROTOCOL.md](AUDIT_PROTOCOL.md) | Quy trình kiểm chứng, functional/regression matrix, evidence bắt buộc |

## 3. Định nghĩa Done tổng thể

### Milestone M1 — Contract & Folder Structure (F-01)
1. `src/widget/` tồn tại với cấu trúc thư mục đúng spec.
2. `VNStockChartProps`, `WidgetLocale`, `WidgetMessages` được export từ `src/widget/index.ts`.
3. `StockDataAdapter` từ `src/lib/types/adapter.ts` được re-export từ `src/widget/index.ts`.
4. `npm run type-check` PASS.

### Milestone M2 — i18n Widget Layer (F-02 + F-03)
1. `messages.vi.ts` và `messages.en.ts` chứa toàn bộ key từ demo i18n (không thiếu key nào hiện có).
2. `WidgetI18nContext` cung cấp `t()`, `locale`, `setLocale` — fallback chain: `prop locale` → `document.documentElement.lang` → `"vi"`.
3. `DemoI18nProvider` trong demo vẫn hoạt động — không phá demo surface hiện tại.
4. Test mới cho `WidgetI18nContext` fallback chain PASS.
5. `npm run type-check` + `npm test` PASS.

### Milestone M3 — VNStockChart Component (F-04 + F-05 + F-06)
1. `<VNStockChart adapter={...} />` mount được độc lập với demo shell.
2. Khi `bars.length === 0`: hiển thị Empty State (không crash, không blank canvas).
3. Khi adapter throw: Error Boundary hiển thị fallback UI (không crash host app).
4. Khi adapter thay đổi: `AbortController.abort()` được gọi, bar buffer được xóa.
5. `VNStockChart` export từ `src/index.ts`.
6. `npm run type-check` + `npm test` + `npm run build:docs` PASS.

### Milestone M4 — Demo Migration + Regression (F-07 + F-08 + F-09)
1. `LibraryShowcaseDemo` dùng `VNStockChart` làm wrapper.
2. Demo browser smoke: chart vẫn render đúng sau migration.
3. Không có import ngược `src/lib/**` → `src/demo/**`.
4. Không có import ngược `src/widget/**` → `src/demo/**`.
5. Regression test cho widget contract / adapter boundary PASS.
6. `AUDIT_LEDGER.md` + `module_tree_full.md` đã cập nhật.

## 4. Quy trình thực thi bắt buộc

1. Đọc `TECH_SPEC.md` trước khi code — đặc biệt phần Props Contract, i18n Fallback Chain, và Adapter Lifecycle.
2. Thực hiện **đúng thứ tự** task trong `IMPLEMENTATION_PLAN.md` — có dependency chain.
3. Tick task trong `TASKBOARD.md` khi hoàn thành từng task.
4. Thu thập evidence theo `AUDIT_PROTOCOL.md` trước khi đóng milestone.
5. Cập nhật `docs/upgrade-standard/AUDIT_LEDGER.md` khi kết thúc mỗi milestone.
6. Regenerate `module_tree_full.md` sau khi thêm file mới.

## 5. Constraint tuyệt đối (không được vi phạm)

| Constraint | Lý do |
| :--- | :--- |
| `src/widget/**` không chứa rendering logic (canvas, SVG, D3) | Widget là Orchestrator — rendering ở `src/lib/core/**` |
| `src/lib/**` không import từ `src/demo/**` | Architecture guard đã có — không tạo thêm vi phạm |
| `src/widget/**` không import từ `src/demo/**` | Widget phải mount được mà không cần demo bootstrap |
| Tất cả UI text trong widget phải đi qua `WidgetI18nContext` | Standing rule dự án |
| Locale mặc định phải là `"vi"` | Standing rule dự án |
| Không hardcode storage key demo vào widget layer | Widget có storage key riêng |
| AbortController phải cleanup khi adapter thay đổi | Tránh race condition nến cũ |
| Error Boundary phải bao quanh toàn bộ widget | Host app không được chết khi chart lỗi |

## 6. Trạng thái điểm bắt đầu (as-built 2026-05-05)

### Đã có

| Component | File | Trạng thái |
| :--- | :--- | :--- |
| Core chart runtime | `src/lib/core/ChartTerminal.tsx` | ✅ Stable — nhận `data`, `panes`, `adapter` |
| Adapter interface | `src/lib/types/adapter.ts` | ✅ Stable — `StockDataAdapter` đầy đủ |
| Theme hook | `src/lib/core/hooks/useChartTheme.ts` | ✅ Stable — `useChartTheme()` |
| Pane descriptor | `src/lib/core/types/pane-descriptor.ts` | ✅ Stable — `PaneDescriptor`, `DEFAULT_PANES` |
| Demo i18n | `src/demo/i18n.tsx` | ✅ 677 dòng — vi + en, cần được tham chiếu khi tạo widget messages |
| Demo data loader | `src/demo/demoData.ts` | ✅ Stable — Binance pageable, không cần đụng |

### Chưa có (cần tạo)

| Component | File mục tiêu | Trạng thái |
| :--- | :--- | :--- |
| Widget folder | `src/widget/` | ❌ Chưa có |
| Widget messages VI | `src/widget/i18n/messages.vi.ts` | ❌ Chưa có |
| Widget messages EN | `src/widget/i18n/messages.en.ts` | ❌ Chưa có |
| Widget i18n types | `src/widget/i18n/types.ts` | ⚠ Tạo được 1 file trước khi bị dừng |
| Widget i18n context | `src/widget/context/WidgetI18nContext.tsx` | ❌ Chưa có |
| VNStockChart component | `src/widget/VNStockChart.tsx` | ❌ Chưa có |
| Widget index | `src/widget/index.ts` | ❌ Chưa có |
| Widget error boundary | `src/widget/WidgetErrorBoundary.tsx` | ❌ Chưa có |
| Widget empty state | `src/widget/WidgetEmptyState.tsx` | ❌ Chưa có |

## 7. File cần xóa sau khi hoàn tất

Không có file nào cần xóa. `src/demo/i18n.tsx` vẫn giữ nguyên vì demo vẫn cần provider riêng. Widget messages chỉ **sao chép** key, không di chuyển.

## 8. Rủi ro và giảm thiểu

| Rủi ro | Mức độ | Giảm thiểu |
| :--- | :--- | :--- |
| Demo break sau khi migrate shell sang VNStockChart | Cao | F-07 chỉ dùng VNStockChart như wrapper thin; data path không đổi |
| Widget i18n missing key so với demo i18n | Trung bình | AUDIT_PROTOCOL kiểm tra key coverage tường minh |
| Race condition bar cũ khi đổi adapter | Trung bình | AbortController + clear buffer trong F-04 |
| Type export conflict giữa demo và widget | Thấp | Widget export type alias riêng; không re-export demo types |
