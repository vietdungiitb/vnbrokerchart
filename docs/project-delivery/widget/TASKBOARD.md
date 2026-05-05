# Taskboard: VNStockChart Widget Layer (Slice F)

## Quy ước

- **Status:** `TODO` | `IN PROGRESS` | `DONE` | `BLOCKED`
- **Gate:** điều kiện bắt buộc phải pass trước khi chuyển sang task tiếp.
- **DoD:** Definition of Done cho task đó.
- **Dependency:** task nào phải DONE trước.

---

## Bảng task tổng quan

| ID | Status | Task | Dependency | Người thực hiện |
| :--- | :--- | :--- | :--- | :--- |
| F-01 | TODO | Tạo contract + cấu trúc thư mục | — | Dev |
| F-02 | TODO | Tạo message files vi/en | F-01 | Dev |
| F-03 | TODO | Tạo WidgetI18nContext | F-02 | Dev |
| F-04 | TODO | Tạo WidgetErrorBoundary + WidgetEmptyState | F-03 | Dev |
| F-05 | TODO | Tạo VNStockChart.tsx | F-04 | Dev |
| F-06 | TODO | Hoàn thiện index + update src/index.ts | F-05 | Dev |
| F-07 | TODO | Migrate LibraryShowcaseDemo sang VNStockChart | F-06 | Dev |
| F-08 | TODO | Thêm regression tests | F-07 | Dev |
| F-09 | TODO | Final validation + audit + ledger | F-08 | Dev + QA |

---

## Task F-01 — Contract + Folder Structure

**Status:** TODO  
**Dependency:** Không  
**Estimated effort:** Nhỏ (< 30 phút)

### Files tạo mới
| File | Nội dung |
| :--- | :--- |
| `src/widget/i18n/types.ts` | `WidgetLocale = "vi" \| "en"`, `WidgetMessages = Record<string, string>` |
| `src/widget/index.ts` | Skeleton — chỉ export từ `./i18n/types` |

### DoD F-01
- [ ] `src/widget/i18n/types.ts` tồn tại, export `WidgetLocale` và `WidgetMessages`
- [ ] `src/widget/index.ts` tồn tại, re-export 2 types trên
- [ ] `npm run type-check` PASS

### Lưu ý kỹ thuật
Không có logic. Chỉ types. Không import bất cứ gì từ `src/demo/**`.

---

## Task F-02 — Widget i18n Message Files

**Status:** TODO  
**Dependency:** F-01 DONE  
**Estimated effort:** Trung bình (1–2 giờ — copy + verify key coverage)

### Files tạo mới
| File | Nội dung |
| :--- | :--- |
| `src/widget/i18n/messages.vi.ts` | Toàn bộ key từ demo `vi` dictionary + 3 key widget mới |
| `src/widget/i18n/messages.en.ts` | Toàn bộ key từ demo `en` dictionary + 3 key widget mới |

### 3 key widget-specific bắt buộc thêm mới
| Key | VI | EN |
| :--- | :--- | :--- |
| `widget.loading` | `"Đang tải biểu đồ…"` | `"Loading chart…"` |
| `widget.noData` | `"Chưa có dữ liệu"` | `"No data available"` |
| `widget.error` | `"Đã xảy ra lỗi trong biểu đồ"` | `"An error occurred in the chart"` |

### DoD F-02
- [ ] `messages.vi.ts` có type annotation `Record<string, string>`
- [ ] `messages.en.ts` có type annotation `Record<string, string>`
- [ ] `Object.keys(vi).length === Object.keys(en).length` (không thiếu key nào ở một trong hai)
- [ ] 3 widget-specific keys có mặt trong cả hai file
- [ ] `npm run type-check` PASS

### Lưu ý kỹ thuật
**Không xóa** `src/demo/i18n.tsx`. Demo vẫn dùng provider của nó. Widget messages là **bản tham chiếu độc lập**.

---

## Task F-03 — WidgetI18nContext

**Status:** TODO  
**Dependency:** F-02 DONE  
**Estimated effort:** Trung bình (1–2 giờ)

### Files tạo mới
| File | Nội dung |
| :--- | :--- |
| `src/widget/context/WidgetI18nContext.tsx` | Provider + hook |
| `src/widget/context/__tests__/WidgetI18nContext.test.tsx` | Unit tests W-01 đến W-05 |

### Interface bắt buộc
```typescript
interface WidgetI18nContextValue {
  locale: WidgetLocale;
  setLocale: (locale: WidgetLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}
```

### Fallback chain (phải đúng thứ tự)
```
prop locale → document.documentElement.lang → "vi"
```

### DoD F-03
- [ ] `WidgetI18nProvider` export từ `WidgetI18nContext.tsx`
- [ ] `useWidgetI18n()` export từ `WidgetI18nContext.tsx`
- [ ] Test W-01: `document.lang = "vi"`, no prop → `locale === "vi"` PASS
- [ ] Test W-02: `document.lang = "en"`, no prop → `locale === "en"` PASS
- [ ] Test W-03: `document.lang = "fr"`, no prop → `locale === "vi"` PASS
- [ ] Test W-04: prop `locale="en"` + `document.lang = "vi"` → `locale === "en"` PASS
- [ ] Test W-05: `t("widget.loading")` returns non-empty PASS
- [ ] `npm run type-check` + `npm test` PASS

---

## Task F-04 — WidgetErrorBoundary + WidgetEmptyState

**Status:** TODO  
**Dependency:** F-03 DONE  
**Estimated effort:** Nhỏ (30–60 phút)

### Files tạo mới
| File | Nội dung |
| :--- | :--- |
| `src/widget/WidgetErrorBoundary.tsx` | React class component, `componentDidCatch` |
| `src/widget/WidgetEmptyState.tsx` | Functional component loading/noData state |

### WidgetErrorBoundary props
```typescript
interface WidgetErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}
```

### WidgetEmptyState props
```typescript
interface WidgetEmptyStateProps {
  loading: boolean;
}
```

### DoD F-04
- [ ] `WidgetErrorBoundary` dùng `useWidgetI18n()` để lấy text fallback
- [ ] Fallback UI có `role="alert"`
- [ ] `WidgetEmptyState` hiện spinner + text `"widget.loading"` khi `loading === true`
- [ ] `WidgetEmptyState` hiện text `"widget.noData"` khi `loading === false`
- [ ] Không có D3/canvas call nào trong cả hai file
- [ ] `npm run type-check` PASS

---

## Task F-05 — VNStockChart.tsx

**Status:** TODO  
**Dependency:** F-04 DONE  
**Estimated effort:** Lớn (2–4 giờ — xử lý adapter lifecycle kỹ)

### Files tạo mới
| File | Nội dung |
| :--- | :--- |
| `src/widget/VNStockChart.tsx` | Component chính + `VNStockChartInner` |

### Skeleton cấu trúc
```tsx
// Outer shell — provides context
export function VNStockChart(props: VNStockChartProps) {
  return (
    <WidgetErrorBoundary onError={props.onError}>
      <WidgetI18nProvider
        locale={props.locale}
        messages={props.messages}
        onLocaleChange={props.onLocaleChange}
      >
        <VNStockChartInner {...props} />
      </WidgetI18nProvider>
    </WidgetErrorBoundary>
  );
}

// Inner — manages data lifecycle
function VNStockChartInner(props: VNStockChartProps) {
  const [bars, setBars] = useState<readonly OHLCVBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Adapter lifecycle with AbortController
  useEffect(() => {
    const controller = new AbortController();
    setBars([]);
    setLoading(true);
    setError(null);
    // ... fetch + subscribe
    return () => {
      controller.abort();
      // ... unsubscribe
    };
  }, [props.adapter, props.symbol, props.timeframe]);

  if (error) throw error; // let ErrorBoundary handle
  if (bars.length === 0) return <WidgetEmptyState loading={loading} />;

  return (
    <div
      data-chart-theme={props.theme ?? "light"}
      className={props.className}
      style={props.style}
    >
      <ChartTerminal
        data={bars}
        panes={props.panes ?? DEFAULT_PANES}
        adapter={props.adapter}
      />
    </div>
  );
}
```

### Import rules bắt buộc
| Import | Nguồn |
| :--- | :--- |
| `ChartTerminal` | `../lib/core/ChartTerminal` |
| `DEFAULT_PANES` | `../lib/core/types/pane-descriptor` |
| `OHLCVBar` | `../lib/types/ohlcv` |
| **KHÔNG import từ** | `../../demo/**` |

### DoD F-05
- [ ] `AbortController.abort()` được gọi khi `[adapter, symbol, timeframe]` thay đổi
- [ ] `setBars([])` được gọi trước khi fetch mới
- [ ] Khi `bars.length === 0` → `WidgetEmptyState` render (không crash)
- [ ] Khi `error !== null` → `throw error` để `WidgetErrorBoundary` bắt
- [ ] Không có import từ `src/demo/**`
- [ ] `npm run type-check` PASS

---

## Task F-06 — Hoàn thiện index + update src/index.ts

**Status:** TODO  
**Dependency:** F-05 DONE  
**Estimated effort:** Nhỏ (< 30 phút)

### Files sửa
| File | Thay đổi |
| :--- | :--- |
| `src/widget/index.ts` | Thêm đủ exports từ VNStockChart, WidgetErrorBoundary, WidgetI18nContext, i18n types |
| `src/index.ts` | Thêm `export ... from "./widget"` và `export type ... from "./widget"` |

### DoD F-06
- [ ] `import { VNStockChart } from "react-stockcharts"` resolve đúng
- [ ] `import type { VNStockChartProps } from "react-stockcharts"` resolve đúng
- [ ] `import type { WidgetLocale, WidgetMessages } from "react-stockcharts"` resolve đúng
- [ ] `import type { StockDataAdapter } from "react-stockcharts"` vẫn còn resolve (từ entry cũ)
- [ ] `npm run type-check` + `npm run build:docs` PASS

---

## Task F-07 — Migrate LibraryShowcaseDemo sang VNStockChart

**Status:** TODO  
**Dependency:** F-06 DONE  
**Estimated effort:** Lớn (2–4 giờ — cần cẩn thận để không break demo chrome)

### Files sửa
| File | Thay đổi |
| :--- | :--- |
| `src/demo/LibraryShowcaseDemo.tsx` | Wrap chart section bằng `VNStockChart` thay vì gọi `ChartTerminal` trực tiếp |

### Chiến lược migration (quan trọng)
1. **Không xóa** demo chrome (topbar, settings modal, replay bar, drawing toolbar, range buttons).
2. Chỉ thay thế phần render chart terminal thành `<VNStockChart ... />`.
3. Demo vẫn truyền `adapter`, `symbol`, `timeframe`, `locale`, `theme`, `panes` như props của widget.
4. Data loading (backfill, range buttons, fetchHistoricalDemoBars) vẫn là trách nhiệm của demo shell; truyền data đã load vào widget qua `adapter` hoặc `data` prop.

### Kiểm tra sau migration
- Chart vẫn render với nến BTCUSDT.
- Range buttons (1D/5D/1M/3M/YTD/1Y/All) vẫn điều khiển viewport.
- Backfill badge hiển thị khi đang nạp lịch sử.
- Replay, drawing tools, settings modal vẫn hoạt động.

### DoD F-07
- [ ] `LibraryShowcaseDemo` không còn import `ChartTerminal` trực tiếp
- [ ] `LibraryShowcaseDemo` dùng `VNStockChart` từ `"../widget"`
- [ ] Browser smoke: build/index.html chart render đúng
- [ ] `npm run type-check` PASS

---

## Task F-08 — Regression Tests

**Status:** TODO  
**Dependency:** F-07 DONE  
**Estimated effort:** Trung bình (1–2 giờ)

### Files tạo mới
| File | Tests chứa |
| :--- | :--- |
| `src/widget/context/__tests__/WidgetI18nContext.test.tsx` | W-01 đến W-05 |
| `src/widget/__tests__/VNStockChart.contract.test.tsx` | W-06 đến W-08 |

### Test matrix đầy đủ

| ID | Description | Expected |
| :--- | :--- | :--- |
| W-01 | i18n — `document.lang="vi"` + no prop | `locale === "vi"` |
| W-02 | i18n — `document.lang="en"` + no prop | `locale === "en"` |
| W-03 | i18n — `document.lang="fr"` + no prop | `locale === "vi"` (default fallback) |
| W-04 | i18n — prop `locale="en"` overrides `document.lang="vi"` | `locale === "en"` |
| W-05 | i18n — `t("widget.loading")` returns non-empty | truthy string |
| W-06 | VNStockChart — `bars=[]` → WidgetEmptyState renders | no crash, empty state visible |
| W-07 | VNStockChart — adapter changes → `abort()` spy called | spy.calls >= 1 |
| W-08 | VNStockChart — adapter throws → ErrorBoundary fallback (no crash) | `role="alert"` rendered |

### DoD F-08
- [ ] Tất cả W-01 đến W-08 PASS
- [ ] Không có snapshot test (dùng behavior assertions)
- [ ] `npm test -- src/widget` PASS

---

## Task F-09 — Final Validation + Audit

**Status:** TODO  
**Dependency:** F-08 DONE  
**Estimated effort:** Nhỏ (< 30 phút — validation + docs)

### Checklist cuối cùng

#### Build validation
- [ ] `npm run type-check` → 0 errors
- [ ] `npm test` → toàn bộ test suite PASS
- [ ] `npm run build:docs` → bundle include VNStockChart export

#### Architecture guard
- [ ] Grep `src/widget/**` cho import từ `src/demo/**` → 0 kết quả
- [ ] Grep `src/lib/**` cho import từ `src/demo/**` → 0 kết quả
- [ ] Grep `src/lib/**` cho import từ `src/widget/**` → 0 kết quả

#### Smoke test (browser)
- [ ] `build/index.html` mở được
- [ ] Chart render đúng BTCUSDT nến
- [ ] Range button `1M` click → viewport thay đổi
- [ ] Không có console.error crash khi chart mount

#### Documentation
- [ ] `docs/upgrade-standard/AUDIT_LEDGER.md` có entry Slice F với:
  - Modified files list
  - Validation evidence (type-check, test, build)
  - Smoke evidence
- [ ] `module_tree_full.md` regenerated (module count tăng so với 659)
- [ ] `docs/project-delivery/TASKBOARD.md` PD-06 cập nhật DONE
- [ ] `docs/project-delivery/IMPLEMENTATION_PLAN.md` Slice F trạng thái DONE
- [ ] `docs/project-delivery/HANDOFF_MANIFEST.md` cập nhật Slice F DONE

### DoD F-09 = Slice F DONE
Tất cả ô trên được tick.
