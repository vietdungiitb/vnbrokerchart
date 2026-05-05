# Technical Specification: VNStockChart Widget Layer (Slice F)

## 1. Mục tiêu kỹ thuật

Tạo lớp widget (`src/widget/`) là **Orchestrator** duy nhất mà host app cần biết. Widget encapsulate:
- Theme context (`useChartTheme`)
- i18n context (`WidgetI18nContext`) với fallback chain
- Data lifecycle (fetch + subscribe + cleanup qua `StockDataAdapter`)
- Pane state (`useDynamicPanes`)
- Error Boundary (bảo vệ host app khỏi crash)
- Empty State / Loading Overlay (trạng thái "chưa có nến")

Rendering logic (canvas, SVG, D3, chart math) **không được phép** nằm trong `src/widget/`. Tất cả rendering ở `src/lib/core/**`.

---

## 2. Cấu trúc thư mục mục tiêu

```
src/widget/
├── index.ts                         # Public API — tất cả export của widget
├── VNStockChart.tsx                 # Component chính, entry point duy nhất
├── WidgetErrorBoundary.tsx          # React class Error Boundary
├── WidgetEmptyState.tsx             # Empty state khi bars.length === 0
├── context/
│   └── WidgetI18nContext.tsx        # Provider + hook cho i18n widget
└── i18n/
    ├── types.ts                     # WidgetLocale, WidgetMessages types
    ├── messages.vi.ts               # Vietnamese translations
    └── messages.en.ts               # English translations
```

---

## 3. Props Contract — `VNStockChartProps`

```typescript
import type { CSSProperties } from "react";
import type { StockDataAdapter } from "../lib/types/adapter";
import type { ChartTheme } from "../lib/core/hooks/useChartTheme";
import type { PaneDescriptor } from "../lib/core/types/pane-descriptor";
import type { WidgetLocale, WidgetMessages } from "./i18n/types";

export interface VNStockChartProps {
  // ── Data source (bắt buộc) ──────────────────────────────────────────────
  adapter: StockDataAdapter;

  // ── Symbol & timeframe ──────────────────────────────────────────────────
  symbol?: string;          // default: "BTCUSDT"
  timeframe?: string;       // default: "1h"

  // ── i18n ────────────────────────────────────────────────────────────────
  locale?: WidgetLocale;              // default: "vi" (fallback chain bên dưới)
  messages?: Partial<WidgetMessages>; // override messages cho host app
  onLocaleChange?: (locale: WidgetLocale) => void;

  // ── Theme ────────────────────────────────────────────────────────────────
  theme?: ChartTheme;                  // "light" | "dark", default: "light"
  onThemeChange?: (theme: ChartTheme) => void;

  // ── Pane layout ──────────────────────────────────────────────────────────
  panes?: readonly PaneDescriptor[];  // override default pane layout
  onPanesChange?: (panes: readonly PaneDescriptor[]) => void;

  // ── Host DOM ─────────────────────────────────────────────────────────────
  className?: string;
  style?: CSSProperties;
}
```

### Quy tắc quan trọng của props contract

| Prop | Giá trị mặc định | Ghi chú |
| :--- | :--- | :--- |
| `adapter` | **bắt buộc** | Widget không self-source data |
| `symbol` | `"BTCUSDT"` | Phải truyền để adapter biết fetch gì |
| `timeframe` | `"1h"` | Binding vào `StockDataAdapter.fetchBars()` |
| `locale` | `"vi"` (qua fallback chain) | Xem fallback chain §4 |
| `theme` | `"light"` | Sync với `data-chart-theme` attribute |
| `panes` | `DEFAULT_PANES` từ `pane-descriptor.ts` | Host có thể truyền custom layout |

---

## 4. i18n Fallback Chain

Khi widget mount, locale được xác định theo thứ tự ưu tiên:

```
1. prop `locale` (nếu được truyền vào)
         ↓ (nếu không có)
2. document.documentElement.lang (nếu là "vi" hoặc "en")
         ↓ (nếu không match)
3. "vi" (hardcoded default)
```

- Host app có thể ghi đè hoàn toàn bằng prop `locale`.
- `onLocaleChange` callback được gọi khi locale thay đổi từ bên trong widget (ví dụ: language switcher built-in).
- Widget không persist locale vào `localStorage` nội bộ — đó là trách nhiệm của host app nếu cần.

### WidgetLocale và WidgetMessages types

```typescript
// src/widget/i18n/types.ts
export type WidgetLocale = "vi" | "en";
export type WidgetMessages = Record<string, string>;
```

### Key coverage bắt buộc

`messages.vi.ts` và `messages.en.ts` phải chứa **đầy đủ tất cả key** hiện có trong `src/demo/i18n.tsx`. Audit Protocol sẽ kiểm tra coverage này.

---

## 5. Adapter Lifecycle (Data Flow)

### 5.1 Sequence khi mount

```
VNStockChart mounts
  → new AbortController()
  → adapter.fetchBars(symbol, timeframe, from, to)
  → set bars state
  → adapter.subscribeToBar(symbol, timeframe, onBar)
  → render ChartTerminal với bars
```

### 5.2 Sequence khi adapter / symbol / timeframe thay đổi

```
adapter/symbol/timeframe prop changes
  → abortController.abort()          ← BẮT BUỘC cleanup request đang bay
  → setBars([])                       ← BẮT BUỘC xóa bar buffer cũ
  → unsubscribe previous bar subscription
  → new AbortController()
  → re-fetch + re-subscribe với adapter/symbol/timeframe mới
```

### 5.3 Sequence khi unmount

```
VNStockChart unmounts
  → abortController.abort()
  → unsubscribe tất cả subscriptions
```

### 5.4 Implementation pattern (useEffect)

```typescript
useEffect(() => {
  const controller = new AbortController();
  setBars([]);  // clear buffer trước khi fetch
  
  let unsubscribe: (() => void) | null = null;

  adapter.fetchBars(symbol, timeframe, from, to)
    .then((newBars) => {
      if (controller.signal.aborted) return;
      setBars(newBars);
      unsubscribe = adapter.subscribeToBar(symbol, timeframe, (bar) => {
        if (controller.signal.aborted) return;
        setBars((prev) => mergeBar(prev, bar));
      });
    })
    .catch((err) => {
      if (controller.signal.aborted) return;
      setError(err);
    });

  return () => {
    controller.abort();
    unsubscribe?.();
  };
}, [adapter, symbol, timeframe]);
```

---

## 6. Error Boundary (`WidgetErrorBoundary`)

`WidgetErrorBoundary` là React class component bọc toàn bộ VNStockChart internals:

```typescript
interface WidgetErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
```

- Khi lỗi xảy ra: hiển thị fallback UI tối giản (không crash host app — không có WSOD).
- Fallback UI dùng key từ `WidgetI18nContext`.
- Error được log ra `console.error` nhưng không re-throw lên host.
- Host app có thể truyền `onError?: (error: Error, info: ErrorInfo) => void` nếu cần telemetry.

---

## 7. Empty State (`WidgetEmptyState`)

Hiển thị khi `bars.length === 0` và không có error:

- Loading state: spinner + text từ i18n key `"widget.loading"`.
- Ready nhưng không có data: text từ i18n key `"widget.noData"`.
- Widget không render `ChartTerminal` khi `bars.length === 0` để tránh ChartCanvas crash.

---

## 8. Theme Contract

- Widget đọc `theme` prop (hoặc default `"light"`).
- Apply `data-chart-theme={theme}` lên root element.
- Dùng `useChartTheme` nội bộ nếu muốn toggle từ built-in UI.
- Nếu host truyền `theme` prop, widget không override qua localStorage.

---

## 9. Ranh giới import tuyệt đối

```
✅ src/widget/** → src/lib/**   (được phép)
✅ src/widget/** → react        (được phép)
✅ src/demo/**   → src/widget/** (được phép — demo dùng widget)
❌ src/widget/** → src/demo/**  (CẤM)
❌ src/lib/**    → src/demo/**  (CẤM — đã có từ trước)
❌ src/lib/**    → src/widget/** (CẤM — widget là lớp ngoài)
```

---

## 10. Public exports từ `src/widget/index.ts`

```typescript
// Components
export { VNStockChart } from "./VNStockChart";
export { WidgetErrorBoundary } from "./WidgetErrorBoundary";

// Context & hook
export { WidgetI18nProvider, useWidgetI18n } from "./context/WidgetI18nContext";

// Types
export type { VNStockChartProps } from "./VNStockChart";
export type { WidgetLocale, WidgetMessages } from "./i18n/types";

// Re-export adapter interface (host app cần để type adapter của họ)
export type { StockDataAdapter, Timeframe } from "../lib/types/adapter";
```

---

## 11. Public exports cần bổ sung vào `src/index.ts`

```typescript
// Widget layer
export { VNStockChart } from "./widget";
export { WidgetErrorBoundary } from "./widget";
export { WidgetI18nProvider, useWidgetI18n } from "./widget";
export type { VNStockChartProps, WidgetLocale, WidgetMessages } from "./widget";
```

---

## 12. Known gaps không thuộc phạm vi Slice F

| Gap | Lý do không thuộc phạm vi |
| :--- | :--- |
| Micro-animations khi đổi source | Có thể thêm ở slice sau khi widget stable |
| TypeScript strict null checks toàn codebase | Quá rộng, cần riêng slice |
| Widget CSS design tokens tách rời demo tokens | Thêm sau khi widget mount stable |
| Multi-symbol support | Không trong contract ban đầu |
