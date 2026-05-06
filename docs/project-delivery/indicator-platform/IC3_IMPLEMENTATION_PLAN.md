# Implementation Plan — IC-3: Saved Indicator Sets

> **Trạng thái:** IMPLEMENTED  
> **Phiên bản:** 1.0 · 2026-05-06  
> **Phụ thuộc:** IC-1 ✅ DONE · IC-2 ✅ DONE  
> **Phạm vi:** localStorage-only trước — không cần Django backend  
> **Ràng buộc:** tuân thủ [PROJECT_GOVERNANCE.md](../PROJECT_GOVERNANCE.md) và [CHANGE_CONTROL_STANDARD.md](../../CHANGE_CONTROL_STANDARD.md)

---

## 1. Mục tiêu

Người dùng lưu được "bộ làm việc" — tập hợp canonical indicator keys + params + màu sắc + pane layout — và apply lại 1-click mà không phải cài lại từ đầu mỗi lần vào app.

**Kết quả đo được khi IC-3 hoàn tất:**

1. Lưu set → reload trang → apply set → chart đúng với tập indicator ban đầu.
2. Import/export round-trip `.vnsc-set` không mất data.
3. 3 built-in templates xuất hiện ngay khi không có set nào được lưu.
4. Thêm indicator từ UI → set mới tạo chứa đúng canonical key.

---

## 2. Nguyên tắc triển khai

1. **Lưu keys, không lưu data.** Set chỉ ghi `SeriesConfig[]` + pane layout — không bao giờ lưu `EnrichedDatum[]`.
2. **Không bypass canonical store.** Apply set → set active series trong `useDynamicPanes` → `enrichData` tự tính lại.
3. **Backward compat.** Người dùng không có set nào vẫn thấy app hoạt động bình thường (fallback sang default config).
4. **Không để `src/lib/**` import từ `src/demo/**`** — hook `useIndicatorSets` nằm trong `src/lib/core/hooks/`.
5. **localStorage key phải versioned** — `vnsc:indicator-sets:v1` — để migration an toàn sau này.

---

## 3. Slice map

| Slice ID | Mục tiêu | Phạm vi chính | Gate |
|---|---|---|---|
| IC3-01 | Định nghĩa `IndicatorSet` type | `src/lib/core/types/indicator-set.ts` *(new)* | type-check |
| IC3-02 | Hook `useIndicatorSets` — CRUD + localStorage | `src/lib/core/hooks/useIndicatorSets.ts` *(new)* | type-check + unit tests |
| IC3-03 | 3 built-in templates tĩnh | `src/lib/core/sets/builtins.ts` + `src/lib/core/sets/builtins/*.json` | type-check |
| IC3-04 | Tích hợp vào `LibraryShowcaseDemo.tsx` — apply set | `src/demo/LibraryShowcaseDemo.tsx` | browser smoke |
| IC3-05 | UI panel "Bộ chỉ báo của tôi" trong settings modal | `src/demo/PaneSettingsModal.tsx` | browser smoke |
| IC3-06 | Import/export `.vnsc-set` file | `src/lib/core/hooks/useIndicatorSets.ts` | round-trip test |
| IC3-07 | i18n keys mới cho IC-3 UI | `src/demo/i18n.tsx` | type-check |
| IC3-08 | Audit ledger + module tree refresh | `docs/upgrade-standard/AUDIT_LEDGER.md` | gate final |

---

## 4. Chi tiết từng slice

### IC3-01 — Type `IndicatorSet`

**File:** `src/lib/core/types/indicator-set.ts` *(new)*

```typescript
// Shape tối thiểu — không thêm field nếu không cần cho IC-3
export interface IndicatorSet {
  id: string;                      // uuid v4
  name: string;                    // tên do user đặt
  createdAt: string;               // ISO 8601
  updatedAt: string;               // ISO 8601
  series: readonly SeriesConfig[]; // canonical keys + params + color
  paneLayout?: readonly {
    paneId: string;
    yAxis: "left" | "right";
    height?: number;               // relative fraction, tổng = 1.0
  }[];
  isBuiltin?: boolean;             // true = built-in template, không xóa được
}

export interface IndicatorSetsStorage {
  version: 1;
  sets: IndicatorSet[];
}
```

**Không trong scope IC3-01:**
- maxPanes, visibility overrides — đưa vào IC-3 extension sau nếu cần
- sharing metadata (sharedBy, sharedAt) — IC-5

**Gate:** `npm run type-check` PASS.

---

### IC3-02 — Hook `useIndicatorSets`

**File:** `src/lib/core/hooks/useIndicatorSets.ts` *(new)*

**API hook:**
```typescript
interface UseIndicatorSetsReturn {
  sets: IndicatorSet[];             // builtin + user sets
  saveCurrentAsSet: (name: string, series: readonly SeriesConfig[]) => IndicatorSet;
  applySet: (id: string) => SeriesConfig[] | null;
  deleteSet: (id: string) => void;  // không xóa được isBuiltin
  renameSet: (id: string, name: string) => void;
  exportSet: (id: string) => void;  // trigger download .vnsc-set
  importSet: (file: File) => Promise<IndicatorSet | null>; // parse + validate
}
```

**Storage strategy:**
```typescript
const STORAGE_KEY = "vnsc:indicator-sets:v1";

// Read: merge builtinTemplates + localStorage sets
// Write: chỉ ghi user sets vào localStorage, builtin không lưu
// Validate on read: nếu JSON malformed → log warn + return builtins only
```

**Ràng buộc quan trọng:**
- Không import từ `src/demo/**`
- `importSet` phải validate shape trước khi accept — không đọc file mù vào state
- `exportSet` tạo file `{set-name}-{date}.vnsc-set` (JSON, extension custom)

**Tests cần viết:**
- `saveCurrentAsSet` → localStorage có entry mới
- `deleteSet` → không xóa builtin, xóa được user set
- `applySet` → trả về đúng `SeriesConfig[]`
- `importSet` với JSON hợp lệ → thêm vào sets
- `importSet` với JSON sai schema → return null, không crash
- round-trip: save → export → import → sets bằng nhau

**Gate:** `npm run type-check` + 6 unit tests PASS.

---

### IC3-03 — Built-in templates

**File:** `src/lib/core/sets/builtins.ts` + `src/lib/core/sets/builtins/*.json`

3 templates tĩnh (không cần backend):

```typescript
// Template 1 — VN Swing Setup
{
  id: "builtin-vn-swing",
  name: "VN Swing Setup",
  isBuiltin: true,
  series: [
    { type: "Candlestick", yAxis: "right", params: {} },
    { type: "EMA", yAxis: "right", params: { period: 20 }, color: "#f59e0b" },
    { type: "EMA", yAxis: "right", params: { period: 50 }, color: "#3b82f6" },
    { type: "BollingerBand", yAxis: "right", params: { period: 20, stdDev: 2 } },
    { type: "RSI", yAxis: "left", params: { period: 14 } },
    { type: "Volume", yAxis: "right", params: {} },
  ]
}

// Template 2 — Orderflow Suite (GĐ 2 indicators hiển thị nếu có PAT)
{
  id: "builtin-orderflow",
  name: "Orderflow Suite",
  isBuiltin: true,
  series: [
    { type: "Candlestick", yAxis: "right", params: {} },
    { type: "CVDApprox", yAxis: "right", params: {} },
    { type: "Whale", yAxis: "right", params: { threshold: 50_000 } },
    { type: "StrengthElder", yAxis: "right", params: {} },
  ]
}

// Template 3 — Crypto Standard
{
  id: "builtin-crypto",
  name: "Crypto Standard",
  isBuiltin: true,
  series: [
    { type: "Candlestick", yAxis: "right", params: {} },
    { type: "EMA", yAxis: "right", params: { period: 20 }, color: "#f59e0b" },
    { type: "MACD", yAxis: "right", params: { fast: 12, slow: 26, signal: 9 } },
    { type: "Volume", yAxis: "right", params: {} },
  ]
}
```

**Gate:** `npm run type-check` PASS, mỗi template pass validation schema.

---

### IC3-04 — Apply set trong `LibraryShowcaseDemo.tsx`

**Thay đổi tối thiểu:**
- Import `useIndicatorSets` và expose `applySet` callback
- Khi user chọn apply → gọi `setActiveSeriesFromSet(series)` vào `useDynamicPanes`
- `useDynamicPanes` đã có reducer — cần thêm action `SET_SERIES_BATCH` hoặc dùng `RESET_TO_SERIES`

**Không làm trong IC3-04:**
- Không thêm UI nào vào demo — UI nằm ở IC3-05
- Không thay đổi default panes khi không có set được apply

**Gate:** Browser smoke — apply "VN Swing Setup" → chart hiển thị EMA20 + EMA50 + BB + RSI + Volume đúng.

---

### IC3-05 — UI panel "Bộ chỉ báo của tôi"

**File:** `src/demo/PaneSettingsModal.tsx`

Thêm tab thứ 3 vào modal: **"Bộ chỉ báo"** (i18n key: `settings.indicatorSets`)

Layout tab:

```
┌─────────────────────────────────────────────────────┐
│  [Tab: Chỉ báo]  [Tab: Layout]  [Tab: Bộ chỉ báo]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Bộ có sẵn                                          │
│  ┌─────────────────────────────────────────────┐    │
│  │ ⭐ VN Swing Setup              [Áp dụng]   │    │
│  │ 📊 Orderflow Suite             [Áp dụng]   │    │
│  │ ₿  Crypto Standard             [Áp dụng]   │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  Bộ của tôi                                         │
│  ┌─────────────────────────────────────────────┐    │
│  │ (chưa có bộ nào)                            │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  [Lưu cấu hình hiện tại]  [Nhập từ file]           │
└─────────────────────────────────────────────────────┘
```

Khi user set đã có:
```
│  Bộ của tôi                                         │
│  ┌─────────────────────────────────────────────┐    │
│  │ 📌 Scalping VCB    [Áp dụng] [Xuất] [Xóa] │    │
│  │ 📌 Swing HOSE      [Áp dụng] [Xuất] [Xóa] │    │
│  └─────────────────────────────────────────────┘    │
```

**Lưu ý i18n:** Tất cả label dùng `t()` — không hardcode text tiếng Việt vào JSX.

**Gate:** Browser smoke — 3 built-in templates hiển thị. Bấm "Lưu cấu hình hiện tại" → đặt tên → xuất hiện trong "Bộ của tôi". Bấm "Áp dụng" → chart cập nhật.

---

### IC3-06 — Import/export `.vnsc-set`

**Thuộc `useIndicatorSets` hook** — extend thêm vào IC3-02 nếu chưa xong, hoặc thêm vào file đã tạo.

**Export:**
```typescript
function exportSet(id: string): void {
  const set = findSet(id);
  if (!set) return;
  const blob = new Blob([JSON.stringify(set, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  // trigger download với filename: `{set.name}-{YYYYMMDD}.vnsc-set`
}
```

**Import validation:**
```typescript
function validateImportedSet(raw: unknown): raw is IndicatorSet {
  // Kiểm tra: id string, name string, series array
  // Kiểm tra: mỗi series có type thuộc listRegistered()
  // KHÔNG kiểm tra: color, params deep equality — dùng defaults nếu thiếu
}
```

**Security note:** Import từ file không được eval hay execute bất cứ thứ gì — chỉ parse JSON và validate shape. Không có code injection risk nếu chỉ đọc structure data.

**Gate:** Round-trip test: export set → đọc file → import → `deepEqual(original, imported)` PASS.

---

### IC3-07 — i18n keys mới

**File:** `src/demo/i18n.tsx`

Keys cần thêm vào cả `vi` và `en`:

```typescript
// vi
"settings.indicatorSets": "Bộ chỉ báo",
"settings.builtinSets": "Bộ có sẵn",
"settings.mySets": "Bộ của tôi",
"settings.noUserSets": "Chưa có bộ nào được lưu",
"settings.saveCurrentSet": "Lưu cấu hình hiện tại",
"settings.importSet": "Nhập từ file",
"settings.applySet": "Áp dụng",
"settings.exportSet": "Xuất",
"settings.deleteSet": "Xóa",
"settings.setNamePlaceholder": "Đặt tên cho bộ chỉ báo...",
"settings.setApplied": "Đã áp dụng bộ \"{name}\"",
"settings.setDeleted": "Đã xóa bộ \"{name}\"",
"settings.importError": "File không hợp lệ hoặc không đúng định dạng",

// en
"settings.indicatorSets": "Indicator Sets",
"settings.builtinSets": "Built-in",
"settings.mySets": "My Sets",
"settings.noUserSets": "No saved sets yet",
"settings.saveCurrentSet": "Save current layout",
"settings.importSet": "Import from file",
"settings.applySet": "Apply",
"settings.exportSet": "Export",
"settings.deleteSet": "Delete",
"settings.setNamePlaceholder": "Name this indicator set...",
"settings.setApplied": "Applied \"{name}\"",
"settings.setDeleted": "Deleted \"{name}\"",
"settings.importError": "Invalid file or format not recognized",
```

**Gate:** `npm run type-check` PASS. i18n test hiện có PASS.

---

### IC3-08 — Audit ledger + module tree

Sau khi IC3-01 → IC3-07 đều pass gate:

1. Append entry vào `docs/upgrade-standard/AUDIT_LEDGER.md` với:
   - Files changed
   - Test results
   - Browser smoke evidence
   - Module count before/after

2. Chạy `python scripts/generate_module_tree.py` → verify số module tăng đúng (dự kiến +3 new files = ~675 modules).

3. Commit toàn bộ IC-3 lên `dev`.

---

## 5. Thứ tự thực hiện khuyến nghị

```
IC3-01 (types)
   │ không phụ thuộc gì
   ▼
IC3-02 (hook logic)  ←── cần type từ IC3-01
   │                 ←── cần builtinTemplates từ IC3-03
   ▼
IC3-03 (templates)
   │
   ▼
IC3-07 (i18n) ← song song với IC3-03, không phụ thuộc
   │
   ▼
IC3-04 (demo wiring)  ←── cần hook từ IC3-02
   │
   ▼
IC3-05 (settings UI)  ←── cần i18n từ IC3-07, hook từ IC3-02
   │
   ▼
IC3-06 (import/export) ←── thêm vào hook IC3-02
   │
   ▼
IC3-08 (audit + commit)
```

IC3-01, IC3-03, IC3-07 có thể làm song song vì không có dependency với nhau.

---

## 6. Files sẽ bị chạm

| File | Loại thay đổi |
|---|---|
| `src/lib/core/types/indicator-set.ts` | NEW |
| `src/lib/core/hooks/useIndicatorSets.ts` | NEW |
| `src/lib/core/sets/builtins.ts` | NEW |
| `src/lib/core/sets/builtins/vn-swing-setup.json` | NEW |
| `src/lib/core/sets/builtins/orderflow-suite.json` | NEW |
| `src/lib/core/sets/builtins/crypto-standard.json` | NEW |
| `src/lib/core/hooks/useIndicatorSets.test.ts` | NEW |
| `src/lib/core/index.ts` | EXTEND — export new types + hook |
| `src/lib/core/hooks/useDynamicPanes.ts` | EXTEND — thêm action `RESET_SERIES` |
| `src/demo/LibraryShowcaseDemo.tsx` | EXTEND — wire applySet callback |
| `src/demo/PaneSettingsModal.tsx` | EXTEND — thêm tab "Bộ chỉ báo" |
| `src/demo/i18n.tsx` | EXTEND — 13 keys mới × 2 ngôn ngữ |
| `docs/upgrade-standard/AUDIT_LEDGER.md` | APPEND |
| `module_tree_full.md` | REGENERATE |

**Không chạm:**
- `enrichData.ts` — không cần thay đổi
- `SeriesRegistry.ts` — không cần thay đổi
- `indicator-catalog.ts` — không cần thay đổi

---

## 7. Gate tổng IC-3

```
npm run type-check     → 0 errors
npm test               → tất cả tests PASS (bao gồm 6 tests mới của useIndicatorSets)
npm run build:docs     → PASS, bundle không tăng > 15KB gzipped
browser smoke:
  - 3 built-in templates hiển thị trong modal tab "Bộ chỉ báo"
  - Apply "VN Swing Setup" → chart đúng layout
  - Save current → đặt tên → xuất hiện trong "Bộ của tôi"
  - Export → file tải về, mở ra JSON hợp lệ
  - Import file đó → set xuất hiện lại
  - Reload trang → sets vẫn còn (localStorage persist)
python scripts/generate_module_tree.py → module_tree_full.md updated
```

---

## 8. Quyết định đã được chốt

| Câu hỏi | Quyết định |
|---|---|
| Storage scope | localStorage-only trước; cloud sync là IC-5 Level 2 |
| Max user sets | Không giới hạn ở IC-3; quota là concern của tier system |
| File extension | `.vnsc-set` (JSON content, custom extension) |
| Tab vị trí | Tab thứ 3 trong settings modal |
| Built-in templates | 3 templates tĩnh hard-coded trong repo |
| Pane layout trong set | Lưu `paneId` + `yAxis`; height tùy chọn |

---

## 9. Rủi ro và giảm thiểu

| Rủi ro | Xác suất | Giảm thiểu |
|---|---|---|
| `useDynamicPanes` không có action batch reset | Trung bình | Thêm `RESET_SERIES` action — backward compat, không thay đổi existing actions |
| localStorage quota exceeded (nhiều sets) | Thấp | Sets nhỏ (~1-2KB/set); 10 sets = 20KB, không gần limit 5MB |
| Import file độc hại | Thấp | Validate shape trước khi accept, không execute bất cứ thứ gì |
| Tab thứ 3 làm modal quá rộng mobile | Trung bình | Kiểm tra responsive; dùng icon + tooltip thay vì text label nếu cần |
