# Audit Protocol: VNStockChart Widget Layer (Slice F)

## 1. Mục tiêu

Tài liệu này định nghĩa toàn bộ quy trình kiểm chứng, ma trận functional test, và evidence bắt buộc để đóng Slice F. Phải hoàn tất toàn bộ checklist trước khi cập nhật `AUDIT_LEDGER.md` với trạng thái DONE.

---

## 2. Gate validation commands

Chạy theo thứ tự này sau khi hoàn thành mỗi task:

```bash
# 1. Type check
npm run type-check

# 2. Unit tests
npm test

# 3. Widget tests riêng (nhanh hơn để check trong task)
npm test -- src/widget

# 4. Build
npm run build:docs

# 5. Module tree
python scripts/generate_module_tree.py

# 6. Architecture guard (không có import ngược)
# Grep import từ demo vào lib hoặc widget
grep -r "from.*src/demo" src/lib/
grep -r "from.*src/demo" src/widget/
grep -r "from.*src/widget" src/lib/
```

---

## 3. Functional Test Matrix

### 3.1 i18n Contract (F-03)

| ID | Input | Expected | File kiểm tra |
| :--- | :--- | :--- | :--- |
| W-01 | `document.lang = "vi"`, không truyền `locale` prop | `useWidgetI18n().locale === "vi"` | `WidgetI18nContext.test.tsx` |
| W-02 | `document.lang = "en"`, không truyền `locale` prop | `useWidgetI18n().locale === "en"` | `WidgetI18nContext.test.tsx` |
| W-03 | `document.lang = "fr"`, không truyền `locale` prop | `useWidgetI18n().locale === "vi"` | `WidgetI18nContext.test.tsx` |
| W-04 | `locale="en"` prop + `document.lang = "vi"` | `useWidgetI18n().locale === "en"` | `WidgetI18nContext.test.tsx` |
| W-05 | Gọi `t("widget.loading")` | String non-empty, khác key | `WidgetI18nContext.test.tsx` |
| W-06 | Gọi `t("widget.noData")` | String non-empty, khác key | `WidgetI18nContext.test.tsx` |
| W-07 | Gọi `t("widget.error")` | String non-empty, khác key | `WidgetI18nContext.test.tsx` |
| W-08 | Gọi `t("nonexistent.key")` | Trả lại key đó (không crash) | `WidgetI18nContext.test.tsx` |
| W-09 | `t("widget.loading")` với `locale = "en"` | English string (không phải Vietnamese) | `WidgetI18nContext.test.tsx` |

### 3.2 Adapter Lifecycle (F-05)

| ID | Input | Expected | File kiểm tra |
| :--- | :--- | :--- | :--- |
| W-10 | Mount `VNStockChart` với `bars=[]` | `WidgetEmptyState` render, không crash | `VNStockChart.contract.test.tsx` |
| W-11 | Mount với `loading=true` (chưa có bars) | Loading state UI visible | `VNStockChart.contract.test.tsx` |
| W-12 | `adapter` prop thay đổi | `AbortController.abort()` spy được gọi | `VNStockChart.contract.test.tsx` |
| W-13 | `symbol` prop thay đổi | `setBars([])` được gọi trước fetch mới | `VNStockChart.contract.test.tsx` |
| W-14 | `timeframe` prop thay đổi | `setBars([])` được gọi trước fetch mới | `VNStockChart.contract.test.tsx` |
| W-15 | `adapter.fetchBars()` throw Error | `WidgetErrorBoundary` fallback render, không crash host | `VNStockChart.contract.test.tsx` |
| W-16 | Unmount component | `AbortController.abort()` được gọi trong cleanup | `VNStockChart.contract.test.tsx` |

### 3.3 Error Boundary (F-04)

| ID | Input | Expected | File kiểm tra |
| :--- | :--- | :--- | :--- |
| W-17 | Bọc component throw Error bằng `WidgetErrorBoundary` | `role="alert"` render, không crash | `VNStockChart.contract.test.tsx` |
| W-18 | `onError` callback truyền vào `WidgetErrorBoundary` | Callback được gọi với đúng Error object | `VNStockChart.contract.test.tsx` |

### 3.4 Architecture Guard

| ID | Kiểm tra | Command | Expected |
| :--- | :--- | :--- | :--- |
| G-01 | `src/widget/**` không import từ `src/demo/**` | `grep -r "from.*demo" src/widget/` | 0 kết quả |
| G-02 | `src/lib/**` không import từ `src/demo/**` | `grep -r "from.*demo" src/lib/` | 0 kết quả |
| G-03 | `src/lib/**` không import từ `src/widget/**` | `grep -r "from.*widget" src/lib/` | 0 kết quả |

### 3.5 Public API Export

| ID | Import | Expected |
| :--- | :--- | :--- |
| E-01 | `import { VNStockChart } from "react-stockcharts"` | Resolves, component mountable |
| E-02 | `import type { VNStockChartProps } from "react-stockcharts"` | Type resolves, no error |
| E-03 | `import type { WidgetLocale } from "react-stockcharts"` | `"vi" \| "en"` type |
| E-04 | `import type { WidgetMessages } from "react-stockcharts"` | `Record<string, string>` type |
| E-05 | `import type { StockDataAdapter } from "react-stockcharts"` | Existing type vẫn resolve |

---

## 4. Key Coverage Audit (F-02)

Kiểm tra message key coverage giữa demo i18n và widget messages:

```typescript
// Verification script (có thể chạy trong Node REPL)
import { messages as vi } from "./src/widget/i18n/messages.vi";
import { messages as en } from "./src/widget/i18n/messages.en";

const viKeys = new Set(Object.keys(vi));
const enKeys = new Set(Object.keys(en));

// Kiểm tra key count khớp
console.assert(viKeys.size === enKeys.size, "Key count mismatch");

// Kiểm tra không có key nào ở vi mà thiếu ở en
for (const key of viKeys) {
  console.assert(enKeys.has(key), `Missing EN key: ${key}`);
}

// Kiểm tra widget-specific keys có mặt
["widget.loading", "widget.noData", "widget.error"].forEach(k => {
  console.assert(viKeys.has(k), `Missing widget key in VI: ${k}`);
  console.assert(enKeys.has(k), `Missing widget key in EN: ${k}`);
});
```

---

## 5. Browser Smoke Checklist

Chạy sau `npm run build:docs` khi hoàn tất F-07:

| # | Bước | Expected |
| :--- | :--- | :--- |
| 1 | Mở `build/index.html` | Trang load, không có JS error trong console |
| 2 | Quan sát chart | Nến BTCUSDT render, không blank |
| 3 | Click range button `1M` | Viewport thay đổi, button có `aria-pressed="true"` |
| 4 | Click range button `3M` | Viewport thay đổi, `1M` không còn active |
| 5 | Kiểm tra badge | `● LIVE · Binance` hoặc backfill badge visible |
| 6 | Kiểm tra OHLCV tooltip | Di chuột lên chart, giá trị OHLCV hiển thị |
| 7 | Kiểm tra settings modal | Click gear icon → modal mở |
| 8 | Kiểm tra language switch | Switch VI/EN → text thay đổi |
| 9 | Kiểm tra theme toggle | Click sun/moon → theme thay đổi |
| 10 | Hard reload (`Ctrl+Shift+R`) | Chart vẫn mount, không crash |

---

## 6. Evidence bắt buộc cho AUDIT_LEDGER.md

Khi thêm entry vào `AUDIT_LEDGER.md`, phải có đủ:

```markdown
### Slice F — VNStockChart Widget Boundary Extraction

- Người thực hiện: [tên]
- Ngày: [ngày]
- Scope: [mô tả ngắn]

- Files tạo mới:
  - src/widget/i18n/types.ts
  - src/widget/i18n/messages.vi.ts
  - src/widget/i18n/messages.en.ts
  - src/widget/context/WidgetI18nContext.tsx
  - src/widget/context/__tests__/WidgetI18nContext.test.tsx
  - src/widget/WidgetErrorBoundary.tsx
  - src/widget/WidgetEmptyState.tsx
  - src/widget/VNStockChart.tsx
  - src/widget/index.ts
  - src/widget/__tests__/VNStockChart.contract.test.tsx

- Files sửa:
  - src/index.ts
  - src/demo/LibraryShowcaseDemo.tsx

- Validation:
  - npm run type-check → PASS (0 errors)
  - npm test → PASS (X tests)
  - npm run build:docs → PASS
  - python scripts/generate_module_tree.py → PASS (X modules)

- Architecture guard:
  - grep src/widget/**->demo/** → 0 kết quả
  - grep src/lib/**->demo/** → 0 kết quả

- Browser smoke:
  - Chart render BTCUSDT: PASS
  - Range 1M/3M buttons: PASS
  - VNStockChart as host wrapper: PASS
  - Hard reload: PASS

- Test coverage:
  - W-01 đến W-18: PASS
  - G-01 đến G-03: PASS
```

---

## 7. Rejection criteria (Không được đóng Slice F nếu)

| Condition | Reason |
| :--- | :--- |
| `npm run type-check` còn lỗi | Hard gate |
| `npm test` còn fail | Hard gate |
| `npm run build:docs` fail | Hard gate |
| Có import ngược `src/widget/**` → `src/demo/**` | Architecture violation |
| Có import ngược `src/lib/**` → `src/demo/**` | Architecture violation |
| Browser smoke chart không render | Functional regression |
| `AUDIT_LEDGER.md` chưa có entry Slice F | Governance rule 7 |
| `module_tree_full.md` chưa regenerate | Governance rule 7 |
| Widget messages thiếu key so với demo i18n | i18n coverage fail |
| `WidgetErrorBoundary` chưa bao quanh `VNStockChart` | Safety requirement |
