# Implementation Plan — Indicator Platform GĐ1 (IC-1 + IC-2)

> **Trạng thái:** READY TO CODE  
> **Phạm vi:** chỉ IC-1 và IC-2 của [INDICATOR_PLATFORM_PROPOSAL.md](../../planning/INDICATOR_PLATFORM_PROPOSAL.md)  
> **Ràng buộc:** phải tuân thủ [PROJECT_GOVERNANCE.md](../PROJECT_GOVERNANCE.md) và [CHANGE_CONTROL_STANDARD.md](../../CHANGE_CONTROL_STANDARD.md)

---

## 1. Mục tiêu chương trình

Mục tiêu của GĐ1 là tạo nền tảng đủ cứng để các indicator sau này có thể được mở rộng như một catalog chuẩn, thay vì tiếp tục mở rộng ad-hoc.

Hai slice đầu tiên phải đạt được 2 kết quả đo được:

1. Canonical store vẫn cho ra output ổn định, nhưng compute logic đã được tách thành plugin riêng.
2. Registry đã có metadata catalog đủ để settings modal render form tự động từ schema.

---

## 2. Nguyên tắc triển khai

1. Không đổi public API nếu chưa được ghi rõ trong tài liệu này.
2. Không thêm indicator mới trong lúc IC-1 và IC-2 đang được hoàn tất.
3. Mọi thay đổi indicator phải giữ SSOT: cùng key và cùng input thì phải cho cùng output.
4. Không để `src/lib/**` import ngược từ `src/demo/**`.
5. Sau mỗi slice phải có audit ledger, validation output, và nếu chạm source thì regenerate `module_tree_full.md`.

---

## 3. Slice map

| Slice | Trạng thái | Mục tiêu | Phạm vi chính | Gate |
| --- | --- | --- | --- | --- |
| IC-1 | READY | Canonical Store Hardening | `src/lib/core/enrichData.ts`, plugin files, parity tests | `npm run type-check` + `npm test` + `npm run build:docs` |
| IC-2 | TODO | Indicator Catalog Metadata | `SeriesRegistry.ts`, catalog types, settings modal, i18n, catalog tests | `npm run type-check` + `npm test` + `npm run build:docs` + browser smoke |

---

## 4. IC-1 — Canonical Store Hardening

### 4.1 Mục tiêu

Tách compute logic indicator ra khỏi thân `enrichData.ts` thành các plugin riêng mà không thay đổi API, output shape, hay semantics của dữ liệu hiện tại.

### 4.2 Phạm vi

- `src/lib/core/calculators/enrichData.ts`
- `src/lib/core/calculators/indicatorComputation.ts` *(new orchestration helper)*
- `src/lib/core/seriesValueResolver.ts`
- `src/lib/core/__tests__/enrichData*.test.ts`

### 4.3 Không làm

- Không đổi signature của `enrichData(bars, activeIndicators)`.
- Không đổi key normalization contract.
- Không thêm indicator mới ngoài tập đang có.
- Không chạm UI nếu không cần cho test.

### 4.4 Thay đổi chính

1. Tạo helper orchestration module `indicatorComputation.ts` để gom planning, compute và materialization.
2. Di chuyển toàn bộ compute path hiện có ra khỏi thân `enrichData.ts`.
3. Giữ `enrichData.ts` như orchestrator: normalize options, gọi helper, materialize output hiện tại.
4. Thêm test parity để đảm bảo output của dữ liệu mẫu không đổi.

### 4.5 Files dự kiến chạm

| File | Loại thay đổi |
| --- | --- |
| `src/lib/core/calculators/enrichData.ts` | Refactor sang orchestrator |
| `src/lib/core/calculators/indicatorComputation.ts` *(new)* | Planning/compute/materialization helper |
| `src/lib/core/__tests__/enrichData.test.ts` | Parity test |
| `src/lib/core/registry/__tests__/SeriesRegistry.test.ts` | Registry metadata regression |

### 4.6 Gate

- `npm run type-check`
- `npm test`
- `npm run build:docs`
- `python scripts/generate_module_tree.py`

### 4.7 Evidence bắt buộc

- Danh sách file đã sửa
- Kết quả validation
- Link audit ledger entry
- `module_tree_full.md` đã refresh nếu có chạm source
- Note residual risk nếu có

### 4.8 Risk còn lại

- Có thể phát sinh lỗi lệch key nếu plugin registry không bám đúng `buildIndicatorSeriesKey()`.
- Có thể có regression performance nếu plugin selection quá chậm.

---

## 5. IC-2 — Indicator Catalog Metadata

### 5.1 Mục tiêu

Nâng `SeriesRegistry` thành catalog thật với metadata đủ để render settings modal tự động, không còn hardcode form field theo từng indicator.

### 5.2 Phạm vi

- `src/lib/core/registry/SeriesRegistry.ts`
- `src/lib/core/types/indicator-catalog.ts` *(new)*
- `src/lib/core/index.ts`
- `src/demo/PaneSettingsModal.tsx`
- `src/lib/core/registry/__tests__/SeriesRegistry.test.ts`

### 5.3 Không làm

- Không tách widget.
- Không làm saved sets.
- Không làm VNInvest adapter.
- Không thêm DAG builder.
- Không cho phép custom data source.

### 5.4 Thay đổi chính

1. Thêm `IndicatorCatalogEntry` và các field bắt buộc: `category`, `inputSchema`, `outputSchema`, `panePolicy`, `scalePolicy`, `repaintPolicy`, `displayName`, `description`, `tags`.
2. Nâng registry hiện tại để giữ backward compatibility với `IndicatorDefinition` cũ.
3. Chuyển `PaneSettingsModal.tsx` sang generic form renderer đọc schema từ catalog.
4. Bổ sung i18n key cho label/description của catalog.
5. Thêm test đảm bảo registry entry có metadata settingsField đủ cho modal.

### 5.5 Files dự kiến chạm

| File | Loại thay đổi |
| --- | --- |
| `src/lib/core/types/indicator-catalog.ts` | Type mới |
| `src/lib/core/registry/SeriesRegistry.ts` | Nâng registry metadata |
| `src/lib/core/index.ts` | Re-export type catalog |
| `src/demo/PaneSettingsModal.tsx` | Generic form renderer |
| `src/demo/i18n.tsx` | Reuse existing keys for catalog labels |
| `src/lib/core/registry/__tests__/SeriesRegistry.test.ts` | Catalog validation |

### 5.6 Gate

- `npm run type-check`
- `npm test`
- `npm run build:docs`
- Browser smoke: mở settings modal của một pane indicator và xác nhận form fields được render từ schema

### 5.7 Evidence bắt buộc

- Danh sách file đã sửa
- Kết quả validation
- Link audit ledger entry
- Screenshot / smoke note của settings modal
- `module_tree_full.md` nếu source đã chạm

### 5.8 Risk còn lại

- Metadata catalog có thể thiếu đồng bộ nếu một indicator không khai báo đủ `inputSchema`.
- Generic renderer có thể expose edge case UI nhỏ, cần smoke kỹ.

---

## 6. Trình tự thực thi

1. Đóng IC-1 trước.
2. Sau khi IC-1 pass, mới mở IC-2.
3. Nếu IC-2 cần sửa metadata ở plugin files, chỉ sửa phần catalog metadata, không quay lại thay đổi compute logic nếu không có lý do.
4. Không mở rộng scope sang IC-3 trong cùng nhánh này.

---

## 7. Stop conditions

Dừng và hỏi lại chỉ khi:

- Một thay đổi làm lệch public API ngoài phạm vi đã chốt.
- Một indicator mới phát sinh ngoài freeze scope.
- Một dependency nền tảng mới cần được thêm.
- Evidence hoặc smoke cho thấy output canonical đã đổi.
