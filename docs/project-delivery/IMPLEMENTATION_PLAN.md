# Implementation Plan

## Nguyên tắc lập slice

Mỗi slice phải có đầu ra dùng được, validation rõ ràng, và không tạo thêm debt ngược với mục tiêu widget hóa.

## Slice roadmap

### Slice A. Shell stabilization

Trạng thái: DONE

- Settings modal thay cho right panel cũ
- Dynamic pane integration
- Theme sync shell/canvas
- Splitter restore và hover behavior
- Cleanup JSX/CSS cũ

### Slice B. Demo i18n foundation

Trạng thái: DONE

- Thêm `src/demo/i18n.tsx`
- Wrap demo root bằng provider
- Thêm `DemoI18nBoundary` cho demo mount standalone
- Chuyển các surface demo chính sang key-based translation

Exit criteria:

- Demo shell chính không còn chuỗi hardcoded mới ở các vùng vừa chỉnh
- Có switch `vi` và `en` ở các demo chính
- `html lang` sync với locale runtime

### Slice C. Indicator SSOT runtime

Trạng thái: DONE

Mục tiêu:

- Xóa duplicated indicator computation path
- Tạo canonical series store/accessor theo params
- Đồng nhất chart render, yExtents, tooltip, settings preview

Bằng chứng hiện có:

- `src/demo/demoData.ts` đi qua `enrichData`
- `src/demo/OriginalLikeDemo.tsx` đọc indicator canonical thay vì recompute cục bộ
- `src/lib/core/calculators/__tests__/enrichData.test.ts`
- `src/lib/core/__tests__/seriesValueResolver.test.ts`
- `npm run type-check`, `npm test`, `npm run build:docs`

### Slice D. Quality hardening

Trạng thái: DONE

Mục tiêu:

- Bổ sung functional spec tests cho i18n, pane orchestration và chart range helper
- Tăng coverage theo `quality/QUALITY.md`

Bằng chứng hiện có:

- `src/demo/__tests__/i18n.test.tsx`
- `src/lib/core/hooks/__tests__/useDynamicPanes.test.ts`
- `src/demo/__tests__/chartRange.test.ts`
- `npm run type-check`, `npm test`, `npm run build:docs`

### Slice E. Market-faithful historical data and live update

Trạng thái: DONE

Mục tiêu:

- Dùng Binance Klines làm nguồn lịch sử thật, có pagination/backfill
- Khi pan/scroll sang trái phải nạp thêm nến cũ thay vì dừng ở 300 bar
- `1D`, `5D`, `1M`, `3M`, `YTD`, `1Y`, `All` phải cắt trên dữ liệu thật đã tải
- Nếu live/polling có mặt, bar cuối phải cập nhật theo dữ liệu upstream thật

Xác nhận hoàn tất:

- Ticker và nguồn hiển thị khớp upstream
- Browser smoke: range buttons hoạt động, `1M` / `3M` đổi viewport đúng, và lịch sử vẫn giữ nhãn `BTCUSDT` / `BINANCE`
- Test suite gắn với pagination/backfill/range math PASS
- `AUDIT_LEDGER.md` có evidence thật cho data fidelity

### Slice F. Widget boundary extraction — VNStockChart

Trạng thái: TODO

Tài liệu chi tiết: [`docs/project-delivery/widget/`](../project-delivery/widget/HANDOFF_MANIFEST.md)

Mục tiêu:

- Tạo `src/widget/VNStockChart.tsx` làm public API duy nhất mà host app cần biết.
- Widget encapsulate: theme, i18n (với fallback chain), data lifecycle (fetch + subscribe + cleanup via `StockDataAdapter`), pane state, Error Boundary, Empty State.
- `src/widget` là **Orchestrator** — không chứa rendering logic (rendering ở `src/lib/core/**`).
- Demo (`LibraryShowcaseDemo`) trở thành host app mẫu gọi `<VNStockChart ... />`.

Tasks:

| ID | Task | Dependency |
| :--- | :--- | :--- |
| F-01 | Tạo contract + cấu trúc thư mục `src/widget/` | — |
| F-02 | Tạo `messages.vi.ts` + `messages.en.ts` | F-01 |
| F-03 | Tạo `WidgetI18nContext` với fallback chain | F-02 |
| F-04 | Tạo `WidgetErrorBoundary` + `WidgetEmptyState` | F-03 |
| F-05 | Tạo `VNStockChart.tsx` với adapter lifecycle | F-04 |
| F-06 | Hoàn thiện `src/widget/index.ts` + update `src/index.ts` | F-05 |
| F-07 | Migrate `LibraryShowcaseDemo` sang `VNStockChart` | F-06 |
| F-08 | Thêm regression tests W-01 → W-18 | F-07 |
| F-09 | Final validation + audit + ledger update | F-08 |

Props contract chính:

```typescript
interface VNStockChartProps {
  adapter: StockDataAdapter;    // bắt buộc
  symbol?: string;              // default "BTCUSDT"
  timeframe?: string;           // default "1h"
  locale?: "vi" | "en";         // fallback: document.lang → "vi"
  messages?: Partial<Record<string, string>>;
  onLocaleChange?: (locale: "vi" | "en") => void;
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
  panes?: readonly PaneDescriptor[];
  onPanesChange?: (panes: readonly PaneDescriptor[]) => void;
  className?: string;
  style?: CSSProperties;
}
```

Exit criteria:

- `<VNStockChart adapter={mockAdapter} />` mount được độc lập, không cần demo shell.
- Khi `bars.length === 0`: Empty State render, không crash.
- Khi adapter throw: Error Boundary hiển thị fallback, không crash host.
- Khi adapter thay đổi: `AbortController.abort()` gọi, buffer xóa.
- Demo browser smoke vẫn pass sau migration.
- `src/widget/**` không import từ `src/demo/**`.
- `src/lib/**` không import từ `src/demo/**`.
- Tests W-01 → W-18 PASS.
- `AUDIT_LEDGER.md` + `module_tree_full.md` đã cập nhật.

### Slice INT. VNInvest Integration — Data Source Switcher

Trạng thái: READY — chờ xác nhận CORS pre-condition (G-00)

Bộ tài liệu đầy đủ tại `docs/project-delivery/vninvest-integration/`.

Mục tiêu:

- Cho phép demo shell chuyển đổi nguồn dữ liệu giữa Binance Demo và VNInvest SAAS
- PAT token input UI; symbol search mã CK Việt Nam
- Biểu đồ OHLCV thật từ `GET /api/stock-management/stocks/{symbol}/chart/`
- (Tuỳ chọn INT-5) Whale money flow panel từ `GET /api/realtime/whale-feed/{symbol}/`

Bằng chứng yêu cầu khi đóng:

- `npm run type-check` PASS
- `npm test` PASS (không ít hơn 238 tests hiện có + 12 tests mới)
- `npm run build:docs` PASS
- Browser smoke INT-S01 đến INT-S08 PASS (theo `docs/project-delivery/vninvest-integration/AUDIT_PROTOCOL.md`)
- Security audit SEC-01 đến SEC-05 PASS
- `module_tree_full.md` đã regenerate
- `docs/upgrade-standard/AUDIT_LEDGER.md` đã cập nhật với evidence đầy đủ
