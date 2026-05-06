# Technical Specification — Indicator Platform GĐ1 (IC-1 + IC-2)

> **Phiên bản:** 1.0 · 2026-05-06  
> **Áp dụng cho:** IC-1 (Canonical Store Hardening) + IC-2 (Catalog Metadata)  
> **Governance:** [PROJECT_GOVERNANCE.md](../PROJECT_GOVERNANCE.md)

---

## 1. Hiện trạng hệ thống trước IC-1

### 1.1 Những gì đang hoạt động tốt (KHÔNG được đổi)

| Layer | File | Trạng thái | Ghi chú |
|-------|------|-----------|---------|
| Canonical SSOT | `src/lib/core/enrichData.ts` | ✅ Hoạt động | Tính một lần, lưu vào `indicatorValues[key]` |
| Key normalization | `src/lib/core/seriesValueResolver.ts → buildIndicatorSeriesKey()` | ✅ Hoạt động | EMA/RSI/MACD/BB/Whale đã có key pattern |
| Series visibility | `src/lib/core/hooks/useDynamicPanes.ts → toggleSeriesVisible` | ✅ Hoạt động | Reducer pattern |
| Legend chips | `src/lib/core/IndicatorLegend.tsx` | ✅ Hoạt động | hidden-state, toggle/remove |
| Settings modal | `src/demo/PaneSettingsModal.tsx` | ✅ Hoạt động nhưng hardcoded | Cần nâng lên generic renderer (IC-2) |
| Runtime filter | `src/lib/core/DynamicChart.tsx → buildChartSlots` | ✅ Hoạt động | `visible !== false` filter |
| Registry hiện tại | `src/lib/core/registry/SeriesRegistry.ts` | ⚠️ Partial | Chỉ có `name + compute + render`, thiếu catalog metadata |

### 1.2 Gap cần lấp trong GĐ1

```
IndicatorDefinition hiện tại:
  ├─ name: string
  ├─ compute: (bars, ...params) => output
  ├─ render?: (context) => unknown
  ├─ computeExtents?: (values) => [number, number]
  └─ yAxis?: "left" | "right"

IndicatorCatalogEntry cần có (target IC-2):
  ├─ category: "trend" | "momentum" | "volatility" | "orderflow" | "strength" | "volume"
  ├─ tags: string[]                    — ["non-repaint", "overlay", "oscillator", "MTF-safe"]
  ├─ inputSchema: InputField[]         — params với label, type, min/max/step/default
  ├─ outputSchema: OutputDescriptor    — { type: "band" | "macd" | "scalar" | "histogram" }
  ├─ panePolicy: "overlay" | "separate" | "either"
  ├─ scalePolicy: "percent" | "price" | "normalized" | "volume"
  ├─ repaintPolicy: "no-repaint" | "repaint-on-close" | "repaint-always"
  ├─ displayName: { vi: string; en: string }
  ├─ description: { vi: string; en: string }
  └─ dependencies?: string[]           — optional: ["EMA:period=13"]
```

---

## 2. IC-1 — Canonical Store Hardening

### 2.1 Vấn đề cụ thể cần giải quyết

`enrichData.ts` hiện là một hàm lớn chứa compute logic của tất cả indicators trong cùng một
thân. Khi thêm indicator mới, phải chỉnh trực tiếp vào thân hàm này. Điều này vi phạm nguyên
tắc open/closed và tạo ra merge conflicts khi nhiều người cùng làm.

**Mục tiêu IC-1:** Refactor `enrichData.ts` sang plugin-based architecture — mỗi indicator là
một pure function riêng, `enrichData` chỉ là orchestrator.

### 2.2 Kiến trúc target IC-1

```typescript
// src/lib/core/indicators/ema.ts
export const emaPlugin: IndicatorPlugin = {
  key: (params) => buildIndicatorSeriesKey("EMA", params),
  compute: (bars, params) => computeEma(bars, params.period),
};

// src/lib/core/indicators/rsi.ts
export const rsiPlugin: IndicatorPlugin = {
  key: (params) => buildIndicatorSeriesKey("RSI", params),
  compute: (bars, params) => computeRsi(bars, params.period),
};

// src/lib/core/enrichData.ts — sau IC-1
import { registeredPlugins } from "./indicators/index";

export function enrichData(bars: RawDatum[], activeIndicators: SeriesDescriptor[]): EnrichedDatum[] {
  return bars.map((bar, i, all) => {
    const indicatorValues: Record<string, unknown> = {};
    for (const plugin of registeredPlugins) {
      if (activeIndicators.some(s => s.key === plugin.key(s.params))) {
        indicatorValues[plugin.key(s.params)] = plugin.compute(all, s.params)[i];
      }
    }
    return { ...bar, indicatorValues };
  });
}
```

### 2.3 Contract bắt buộc

1. Public API của `enrichData(bars, activeIndicators)` **không thay đổi**.
2. Output shape `EnrichedDatum` **không thay đổi**.
3. `buildIndicatorSeriesKey()` **không thay đổi** — chỉ gọi thêm từ nhiều chỗ hơn.
4. Regression: mọi test hiện tại PHẢI pass sau IC-1.
5. Performance: benchmark thời gian enrich với 1000 bars trước và sau IC-1 — không được
   chậm hơn >10%.

### 2.4 Files chạm trong IC-1

| File | Thay đổi |
|------|----------|
| `src/lib/core/enrichData.ts` | Refactor thành orchestrator; logic move sang plugin files |
| `src/lib/core/indicators/ema.ts` *(new)* | EMA plugin |
| `src/lib/core/indicators/rsi.ts` *(new)* | RSI plugin |
| `src/lib/core/indicators/macd.ts` *(new)* | MACD plugin |
| `src/lib/core/indicators/bollinger.ts` *(new)* | Bollinger Bands plugin |
| `src/lib/core/indicators/whale.ts` *(new)* | Whale Bubbles plugin (mock/demo) |
| `src/lib/core/indicators/index.ts` *(new)* | Auto-register tất cả plugins |
| `src/lib/core/types/indicator-plugin.ts` *(new)* | `IndicatorPlugin` interface |
| `src/lib/core/__tests__/enrichData.test.ts` | Thêm test cho plugin pattern |

### 2.5 Gate IC-1

```bash
npm run type-check        # PHẢI pass, 0 errors
npm test                  # PHẢI pass, tất cả tests bao gồm tests mới IC-1
npm run build:docs        # PHẢI pass
python scripts/generate_module_tree.py  # PHẢI pass
```

**Smoke:** Chart load với indicators hiện tại → data không thay đổi so với trước IC-1.

---

## 3. IC-2 — Indicator Catalog Metadata

### 3.1 Target type: `IndicatorCatalogEntry`

```typescript
// src/lib/core/types/indicator-catalog.ts

export type IndicatorCategory =
  | "trend"
  | "momentum"
  | "volatility"
  | "orderflow"
  | "strength"
  | "volume";

export type RepaintPolicy =
  | "no-repaint"        // không bao giờ vẽ lại bar đã đóng
  | "repaint-on-close"  // chỉ cập nhật khi bar đóng
  | "repaint-always";   // cập nhật real-time kể cả bar đang mở

export type PanePolicy =
  | "overlay"   // vẽ chồng lên price pane
  | "separate"  // cần pane riêng
  | "either";   // user chọn

export type ScalePolicy =
  | "percent"
  | "price"
  | "normalized"  // 0-1 hoặc -1 đến 1
  | "volume";

export interface InputField {
  id: string;
  label: { vi: string; en: string };
  type: "number" | "select" | "color" | "boolean";
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: { vi: string; en: string } }>;
}

export interface OutputDescriptor {
  type: "scalar" | "band" | "histogram" | "macd" | "stochastic";
  fields?: string[];  // e.g. ["upper", "middle", "lower"] for band
}

export interface IndicatorCatalogEntry {
  // Identity
  id: string;                             // machine-readable, e.g. "EMA"
  displayName: { vi: string; en: string };
  description: { vi: string; en: string };

  // Classification
  category: IndicatorCategory;
  tags: string[];

  // Schema
  inputSchema: InputField[];
  outputSchema: OutputDescriptor;

  // Placement & behavior
  panePolicy: PanePolicy;
  scalePolicy: ScalePolicy;
  repaintPolicy: RepaintPolicy;

  // Optional
  dependencies?: string[];  // other indicator keys this one depends on

  // Backward compat — giữ nguyên từ IndicatorDefinition cũ
  compute: (...args: unknown[]) => unknown;
  render?: (...args: unknown[]) => unknown;
  computeExtents?: (values: unknown[]) => [number, number];
  yAxis?: "left" | "right";
}
```

### 3.2 Catalog entries cần có trong IC-2 (Priority 1 — phải có)

| ID | Category | PanePolicy | RepaintPolicy | Ghi chú |
|----|----------|-----------|--------------|---------|
| EMA | trend | overlay | no-repaint | Params: period, source |
| SMA | trend | overlay | no-repaint | Params: period, source |
| RSI | momentum | separate | no-repaint | Params: period; overbought/oversold |
| MACD | momentum | separate | no-repaint | Params: fast, slow, signal |
| BollingerBands | volatility | overlay | no-repaint | Params: period, stdDev; type: band |
| ATR | volatility | separate | no-repaint | Params: period |
| Volume | volume | separate | no-repaint | Hầu hết đã có, thêm metadata |
| VWAP | trend | overlay | repaint-on-close | Session VWAP |
| Stochastic | momentum | separate | no-repaint | Params: kPeriod, dPeriod, smooth |
| WhaleBubbles | orderflow | overlay | repaint-always | GĐ2 data; demo mock trong GĐ1 |

### 3.3 Settings modal → Generic renderer

**Trước IC-2 (hiện tại):** `PaneSettingsModal.tsx` có `if (indicator.id === "EMA") { render EMA fields }` — hardcoded từng indicator.

**Sau IC-2 (target):** `PaneSettingsModal.tsx` đọc `catalog.inputSchema` và render form tự động.

```tsx
// PaneSettingsModal.tsx — sau IC-2
function renderIndicatorForm(entry: IndicatorCatalogEntry, params: Record<string, unknown>) {
  return entry.inputSchema.map((field) => (
    <FormField key={field.id} field={field} value={params[field.id]} onChange={...} />
  ));
}
```

**Lợi ích kiểm chứng:** Thêm indicator `CCI` mới vào catalog với `inputSchema` đầy đủ → mở
settings modal → fields hiển thị tự động, không cần chỉnh `PaneSettingsModal.tsx`.

### 3.4 Files chạm trong IC-2

| File | Thay đổi |
|------|----------|
| `src/lib/core/types/indicator-catalog.ts` *(new)* | Type definitions |
| `src/lib/core/registry/SeriesRegistry.ts` | Nâng từ `IndicatorDefinition` lên `IndicatorCatalogEntry` |
| `src/lib/core/indicators/ema.ts` | Thêm catalog metadata (từ IC-1 file) |
| `src/lib/core/indicators/rsi.ts` | Thêm catalog metadata |
| `src/lib/core/indicators/macd.ts` | Thêm catalog metadata |
| `src/lib/core/indicators/bollinger.ts` | Thêm catalog metadata |
| `src/lib/core/indicators/volume.ts` | Thêm catalog metadata |
| `src/lib/core/indicators/vwap.ts` | Thêm catalog metadata |
| `src/lib/core/indicators/atr.ts` | Thêm catalog metadata |
| `src/lib/core/indicators/stochastic.ts` | Thêm catalog metadata |
| `src/lib/core/indicators/whale.ts` | Thêm catalog metadata (mock/demo tier) |
| `src/demo/PaneSettingsModal.tsx` | Generic renderer từ `inputSchema` |
| `src/demo/i18n.tsx` | Thêm i18n keys cho catalog labels |
| `src/lib/core/__tests__/catalogValidation.test.ts` *(new)* | Test mọi entry có đủ fields |

### 3.5 Gate IC-2

```bash
npm run type-check        # PHẢI pass
npm test                  # PHẢI pass (test mới phải cover catalog validation)
npm run build:docs        # PHẢI pass
python scripts/generate_module_tree.py
```

**Browser smoke:**
1. Mở settings cho pane có EMA → form hiển thị đúng params từ `inputSchema`
2. Thêm `CCI` vào catalog (test entry) → settings modal render đúng mà không chỉnh modal
3. `repaintPolicy` label hiển thị trong UI (vi/en)

---

## 4. Ràng buộc kỹ thuật bắt buộc

1. `src/lib/**` **không được** import từ `src/demo/**`.
2. `IndicatorCatalogEntry` phải backward compatible với `IndicatorDefinition` — không xóa field
   cũ, chỉ extend.
3. Mọi `displayName` và `description` phải có đủ `vi` và `en`.
4. `inputSchema` là SSOT duy nhất cho params của indicator — không được có danh sách params ở
   nơi nào khác (không còn `if indicator === "EMA"` trong component).
5. Performance: `enrichData` với plugin-based KHÔNG chậm hơn version monolith trên 1000 bars.

---

## 5. Ranh giới không được vượt (GĐ1)

| Không làm | Lý do |
|-----------|-------|
| Thêm indicator mới (ngoài 10 ở trên) | Freeze cho đến khi catalog xong |
| VNInvest PAT auth | Đó là GĐ2 |
| Saved indicator sets | Đó là GĐ3 |
| DAG builder | Đó là GĐ4 |
| Thay đổi public API `enrichData` | Breaking change không có trong scope |
| Xóa `IndicatorDefinition` cũ | Backward compat phải giữ |

---

## 6. Known Gaps sau GĐ1 (ghi lại cho GĐ2)

- Whale Bubbles trong IC-2 là demo mock — GĐ2 mới có data thật từ VNInvest API
- `dependencies` field trong `IndicatorCatalogEntry` chưa được enforce runtime — GĐ2 mới cần
- Custom indicator (EMA của RSI) chưa có — đó là GĐ4
- Cloud sync saved sets — đó là GĐ3 Level 2
