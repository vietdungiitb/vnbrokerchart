# Implementation Plan: VNStockChart Widget Layer (Slice F)

## Nguyên tắc thực thi

- Thực hiện **đúng thứ tự** F-01 → F-09 vì có dependency chain.
- Mỗi task phải pass gate của nó trước khi sang task tiếp.
- Không code task tiếp theo nếu `npm run type-check` đang fail ở task trước.
- Sau khi tạo file mới, chạy `python scripts/generate_module_tree.py` ngay để giữ tree sync.

---

## Task F-01: Định nghĩa contract + cấu trúc thư mục

**Mục tiêu:** Tạo skeleton `src/widget/` với types đầy đủ, chưa có logic.

**Files tạo mới:**
```
src/widget/i18n/types.ts
src/widget/index.ts          (skeleton, chỉ export placeholder)
```

**Files sửa:**  
_Không có._

**Nội dung `src/widget/i18n/types.ts`:**
```typescript
export type WidgetLocale = "vi" | "en";
export type WidgetMessages = Record<string, string>;
```

**Nội dung `src/widget/index.ts` (skeleton):**
```typescript
// Populated by F-05 → F-06
export type { WidgetLocale, WidgetMessages } from "./i18n/types";
```

**Gate F-01:**
- `npm run type-check` PASS
- `src/widget/` tồn tại, `src/widget/i18n/types.ts` có export đúng

---

## Task F-02: Tạo widget i18n message files

**Mục tiêu:** Tách tất cả key từ `src/demo/i18n.tsx` thành `messages.vi.ts` và `messages.en.ts` trong widget layer.

**Dependency:** F-01 phải pass.

**Files tạo mới:**
```
src/widget/i18n/messages.vi.ts
src/widget/i18n/messages.en.ts
```

**Files sửa:**  
_Không có — demo i18n vẫn giữ nguyên._

**Yêu cầu kỹ thuật:**
- Copy toàn bộ key từ dictionary `vi` trong `src/demo/i18n.tsx` → `messages.vi.ts`.
- Copy toàn bộ key từ dictionary `en` trong `src/demo/i18n.tsx` → `messages.en.ts`.
- Type annotation: `export const messages: Record<string, string> = { ... }`.
- Thêm 2 key mới bắt buộc chưa có trong demo:
  - `"widget.loading"` — VI: `"Đang tải biểu đồ…"` / EN: `"Loading chart…"`
  - `"widget.noData"` — VI: `"Chưa có dữ liệu"` / EN: `"No data available"`
  - `"widget.error"` — VI: `"Đã xảy ra lỗi trong biểu đồ"` / EN: `"An error occurred in the chart"`

**Gate F-02:**
- `npm run type-check` PASS
- `Object.keys(messages_vi).length === Object.keys(messages_en).length` (key count khớp)

---

## Task F-03: Tạo `WidgetI18nContext`

**Mục tiêu:** Provider + hook i18n cho widget layer với fallback chain đúng spec.

**Dependency:** F-02 phải pass.

**Files tạo mới:**
```
src/widget/context/WidgetI18nContext.tsx
```

**Yêu cầu kỹ thuật:**

```typescript
interface WidgetI18nContextValue {
  locale: WidgetLocale;
  setLocale: (locale: WidgetLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}
```

**Fallback chain khi resolve locale ban đầu:**
```typescript
function resolveInitialLocale(prop?: WidgetLocale): WidgetLocale {
  if (prop === "vi" || prop === "en") return prop;
  const docLang = document?.documentElement?.lang?.toLowerCase() ?? "";
  if (docLang.startsWith("en")) return "en";
  return "vi"; // hardcoded default
}
```

**`t()` function:**
```typescript
function t(locale: WidgetLocale, extraMessages: Partial<WidgetMessages>, key: string, params?) {
  const msg = extraMessages[key] ?? (locale === "vi" ? messagesVi[key] : messagesEn[key]) ?? messagesVi[key] ?? key;
  return interpolate(msg, params);
}
```

> Lưu ý: `extraMessages` là `messages` prop từ host app để override cụ thể key nào.

**Export:**
```typescript
export { WidgetI18nProvider, useWidgetI18n };
```

**Gate F-03:**
- Unit test `src/widget/context/__tests__/WidgetI18nContext.test.tsx` với 3 case:
  1. Không truyền `locale` prop + `document.lang = "vi"` → `locale === "vi"`
  2. Không truyền `locale` prop + `document.lang = "en"` → `locale === "en"`
  3. Không truyền `locale` prop + `document.lang = "fr"` → `locale === "vi"` (fallback)
- `npm run type-check` + `npm test` PASS

---

## Task F-04: Tạo `WidgetErrorBoundary` và `WidgetEmptyState`

**Mục tiêu:** Bảo vệ host app và xử lý trạng thái chưa có dữ liệu.

**Dependency:** F-03 phải pass.

**Files tạo mới:**
```
src/widget/WidgetErrorBoundary.tsx
src/widget/WidgetEmptyState.tsx
```

**`WidgetErrorBoundary` spec:**
- React class component (bắt buộc dùng class vì `componentDidCatch`).
- Props: `children: ReactNode`, `onError?: (error: Error, info: ErrorInfo) => void`.
- State: `{ hasError: boolean; error: Error | null }`.
- Fallback UI: div với `role="alert"`, text từ `"widget.error"` key.
- Gọi `onError?.(error, info)` trong `componentDidCatch`.

**`WidgetEmptyState` spec:**
- Functional component.
- Props: `loading: boolean`.
- Khi `loading === true`: spinner + text `"widget.loading"`.
- Khi `loading === false`: text `"widget.noData"`.
- Không dùng bất kỳ canvas hay D3 call nào.

**Gate F-04:**
- `npm run type-check` PASS
- Render smoke: `<WidgetEmptyState loading={true} />` không crash trong jsdom.

---

## Task F-05: Tạo `VNStockChart.tsx`

**Mục tiêu:** Component chính của widget — Orchestrator.

**Dependency:** F-04 phải pass.

**Files tạo mới:**
```
src/widget/VNStockChart.tsx
```

**Cấu trúc component:**
```tsx
export function VNStockChart(props: VNStockChartProps) {
  return (
    <WidgetErrorBoundary onError={props.onError}>
      <WidgetI18nProvider locale={props.locale} messages={props.messages} onLocaleChange={props.onLocaleChange}>
        <VNStockChartInner {...props} />
      </WidgetI18nProvider>
    </WidgetErrorBoundary>
  );
}
```

**`VNStockChartInner` (internal):**
- State: `bars: readonly OHLCVBar[]`, `loading: boolean`, `error: Error | null`.
- `useEffect` với `[adapter, symbol, timeframe]` dep array:
  - `AbortController.abort()` + `setBars([])` trước khi fetch.
  - Fetch + subscribe theo pattern ở TECH_SPEC §5.4.
- Khi `bars.length === 0 && !error`: render `<WidgetEmptyState loading={loading} />`.
- Khi `bars.length > 0`: render `<ChartTerminal data={bars} panes={resolvedPanes} adapter={adapter} ... />`.
- Apply `data-chart-theme={theme}` lên root `<div>`.

**Yêu cầu:**
- `ChartTerminal` import từ `src/lib/core/ChartTerminal.tsx` — không import từ `src/demo/**`.
- `DEFAULT_PANES` import từ `src/lib/core/types/pane-descriptor.ts`.
- Không có bất kỳ rendering logic (D3, canvas, SVG) trong file này.

**Gate F-05:**
- `npm run type-check` PASS
- Render smoke: mount `<VNStockChart adapter={mockAdapter} />` không crash.

---

## Task F-06: Hoàn thiện `src/widget/index.ts` + update `src/index.ts`

**Mục tiêu:** Expose public API đầy đủ từ package root.

**Dependency:** F-05 phải pass.

**Files sửa:**
```
src/widget/index.ts      (hoàn thiện với tất cả export)
src/index.ts             (thêm widget exports)
```

**`src/widget/index.ts` cuối cùng:**
```typescript
export { VNStockChart } from "./VNStockChart";
export { WidgetErrorBoundary } from "./WidgetErrorBoundary";
export { WidgetI18nProvider, useWidgetI18n } from "./context/WidgetI18nContext";
export type { VNStockChartProps } from "./VNStockChart";
export type { WidgetLocale, WidgetMessages } from "./i18n/types";
export type { StockDataAdapter, Timeframe } from "../lib/types/adapter";
```

**Thêm vào `src/index.ts`:**
```typescript
export { VNStockChart, WidgetErrorBoundary, WidgetI18nProvider, useWidgetI18n } from "./widget";
export type { VNStockChartProps, WidgetLocale, WidgetMessages } from "./widget";
```

**Gate F-06:**
- `npm run type-check` PASS
- `npm run build:docs` PASS (bundle có `VNStockChart` export)

---

## Task F-07: Update demo để dùng VNStockChart

**Mục tiêu:** `LibraryShowcaseDemo` trở thành host app mẫu gọi `<VNStockChart ... />`.

**Dependency:** F-06 phải pass.

**Files sửa:**
```
src/demo/LibraryShowcaseDemo.tsx
```

**Chiến lược migration:**
- Không xóa logic demo (backfill, range buttons, settings modal, drawing tools, replay).
- Dùng `VNStockChart` như outer wrapper; truyền `adapter`, `symbol`, `timeframe`, `locale`, `theme` từ demo state.
- `LibraryShowcaseDemo` vẫn giữ demo chrome (topbar, settings, replay bar, drawing toolbar).
- Về cơ bản: demo wrap VNStockChart thay vì tự quản lý ChartTerminal trực tiếp.

**Ranh giới sau migration:**
```
LibraryShowcaseDemo (demo chrome + state)
  └── VNStockChart (adapter, symbol, timeframe, locale, theme, panes)
        └── ChartTerminal (core rendering — không đổi)
```

**Gate F-07:**
- Browser smoke: chart vẫn render, range buttons vẫn hoạt động.
- `npm run type-check` PASS.

---

## Task F-08: Thêm regression tests

**Mục tiêu:** Lock down widget contract / adapter boundary để phát hiện regression.

**Dependency:** F-07 phải pass.

**Files tạo mới:**
```
src/widget/context/__tests__/WidgetI18nContext.test.tsx
src/widget/__tests__/VNStockChart.contract.test.tsx
```

**Test cases bắt buộc:**

| ID | Test | Expected |
| :--- | :--- | :--- |
| W-01 | WidgetI18nContext — locale fallback from `document.lang = "vi"` | `locale === "vi"` |
| W-02 | WidgetI18nContext — locale fallback from `document.lang = "en"` | `locale === "en"` |
| W-03 | WidgetI18nContext — locale fallback from `document.lang = "fr"` | `locale === "vi"` |
| W-04 | WidgetI18nContext — prop `locale="en"` overrides `document.lang = "vi"` | `locale === "en"` |
| W-05 | WidgetI18nContext — `t("widget.loading")` returns non-empty string | truthy |
| W-06 | VNStockChart — mount với `bars = []` renders WidgetEmptyState, không crash | PASS |
| W-07 | VNStockChart — adapter thay đổi → AbortController.abort() được gọi | spy called |
| W-08 | VNStockChart — khi adapter throw → WidgetErrorBoundary hiện fallback (không crash) | PASS |

**Gate F-08:**
- `npm test -- src/widget` → tất cả W-01 đến W-08 PASS

---

## Task F-09: Final validation + audit

**Mục tiêu:** Đóng slice với đầy đủ evidence.

**Dependency:** F-08 phải pass.

**Checklist:**
- [ ] `npm run type-check` PASS (0 errors)
- [ ] `npm test` PASS (toàn bộ test suite)
- [ ] `npm run build:docs` PASS (bundle có VNStockChart)
- [ ] `python scripts/generate_module_tree.py` chạy thành công
- [ ] Không có import ngược `src/widget/**` → `src/demo/**`
- [ ] Không có import ngược `src/lib/**` → `src/demo/**`
- [ ] Browser smoke: build/index.html chart render đúng sau migration
- [ ] `docs/upgrade-standard/AUDIT_LEDGER.md` có entry Slice F
- [ ] `module_tree_full.md` được regenerate với các file widget mới
- [ ] `docs/project-delivery/HANDOFF_MANIFEST.md` được cập nhật trạng thái

**Gate F-09 (Slice F DONE):**
Tất cả checklist trên tick.
