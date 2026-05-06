# Handoff Manifest — Indicator Platform (GĐ1+GĐ3: IC-1 + IC-2 + IC-3)

> **Trạng thái GĐ1 (IC-1+IC-2):** COMPLETE ✅  
> **Trạng thái GĐ3 (IC-3):** READY TO CODE  
> **Phiên bản:** 2.0 · 2026-05-06  
> **Entry point repo:** [docs/project-delivery/README.md](../README.md)  
> **Nguồn đề xuất:** [docs/planning/INDICATOR_PLATFORM_PROPOSAL.md](../../planning/INDICATOR_PLATFORM_PROPOSAL.md)

---

## 1. Mục tiêu của package này

Bộ tài liệu này là gói chuyển giao chính thức cho **Giai đoạn 1 của Indicator Platform** —
hai slice đầu tiên (IC-1 + IC-2) trong lộ trình 5 giai đoạn đã được phê duyệt tại
`docs/planning/INDICATOR_PLATFORM_PROPOSAL.md`.

**Kết quả đầu ra khi IC-1 + IC-2 hoàn tất:**

- Thêm 1 indicator mới vào registry → settings modal render đúng params tự động, không cần
  chỉnh modal.
- Mọi indicator đi qua canonical key một cách đồng nhất và có thể test được.
- `enrichData.ts` không còn là monolith — computation tách thành plugin functions.
- `SeriesRegistry` được nâng lên `IndicatorCatalogEntry` với đầy đủ metadata.

---

## 2. Phạm vi GĐ1

### Trong phạm vi (IN SCOPE)

| Hạng mục | File / Component | IC slice |
|----------|-----------------|----------|
| Canonical store hardening | `src/lib/core/enrichData.ts` | IC-1 |
| Key normalization audit | `src/lib/core/seriesValueResolver.ts` | IC-1 |
| Registry → Catalog entry | `src/lib/core/registry/SeriesRegistry.ts` | IC-2 |
| IndicatorCatalogEntry type | `src/lib/core/types/indicator-catalog.ts` *(new)* | IC-2 |
| Generic settings modal | `src/demo/PaneSettingsModal.tsx` | IC-2 |
| i18n keys cho catalog labels | `src/demo/i18n.tsx` | IC-2 |
| Unit tests IC-1 + IC-2 | `src/lib/core/__tests__/` | IC-1+IC-2 |

### Ngoài phạm vi (OUT OF SCOPE — dành cho IC-3 đến IC-5)

- VNInvest adapter / PAT auth
- Whale Bubbles, CVD real-time (GĐ2)
- ~~Saved indicator sets (GĐ3)~~ → **Đã lên plan, xem IC3_IMPLEMENTATION_PLAN.md**
- DAG custom builder (GĐ4)
- Marketplace, custom data sources (GĐ5)
- Cloud sync cho sets (GĐ3 Enterprise — sau IC-3 localStorage)
- Thêm indicator mới (freeze đến khi IC-3 xong)

---

## 3. Quyết định đã chốt

1. **Catalog không thay thế `IndicatorDefinition` cũ** — `IndicatorCatalogEntry` extends /
   wraps `IndicatorDefinition` để backward compatible. Không breaking change.
2. **Settings modal chuyển sang generic renderer** — đọc `inputSchema` từ catalog, không còn
   hardcode params của từng indicator.
3. **Freeze indicator count** — không thêm indicator mới cho đến khi IC-2 xong để tránh
   technical debt catalog nhân lên.
4. **i18n bắt buộc** — `displayName` trong catalog phải có cả `vi` và `en`. Không hardcode tên
   indicator trong component.
5. **enrichData plugin-based** — mỗi indicator compute là một pure function riêng, không viết
   thêm vào thân `enrichData.ts`. IC-1 không đổi public API của `enrichData`.

---

## 4. Tài liệu giao kèm

| File | Vai trò |
|------|---------|
| `HANDOFF_MANIFEST.md` *(file này)* | Entry point, scope và quyết định đã chốt |
| `TECH_SPEC.md` | Đặc tả kỹ thuật target architecture IC-1 + IC-2 |
| `IMPLEMENTATION_PLAN.md` | Slice definition IC-1 + IC-2 với DoD từng task |
| `IC3_IMPLEMENTATION_PLAN.md` | **[MỚI]** Slice definition IC-3 với DoD từng task |
| `TASKBOARD.md` | Bảng task tác chiến hằng ngày, trạng thái ticket |
| `AUDIT_PROTOCOL.md` | Gate commands, evidence template, smoke checklist |
| `[docs/project-delivery/PROJECT_GOVERNANCE.md](../PROJECT_GOVERNANCE.md)` | Luật bắt buộc |
| `[docs/project-delivery/AUDIT_PROTOCOL.md](../AUDIT_PROTOCOL.md)` | Evidence format chung |
| `[quality/QUALITY.md](../../../quality/QUALITY.md)` | Hiến pháp chất lượng |
| `[docs/upgrade-standard/AUDIT_LEDGER.md](../../upgrade-standard/AUDIT_LEDGER.md)` | Ledger canonical |

---

## 5. Tiêu chí chấp nhận

### GĐ1 (IC-1 + IC-2) — COMPLETE ✅

- `npm run type-check` → PASS (0 errors)
- `npm test` → PASS (105/105 tests)
- `npm run build:docs` → PASS
- `python scripts/generate_module_tree.py` → 672 modules
- Browser smoke: settings modal generic renderer hoạt động
- `AUDIT_LEDGER.md` có entry IC-1 + IC-2

### GĐ3 (IC-3) — Tiêu chí cần đạt

- `npm run type-check` → PASS (0 errors)
- `npm test` → PASS (≥ 111 tests — 6 unit tests mới cho `useIndicatorSets`)
- `npm run build:docs` → PASS, bundle tăng ≤ 15KB gzipped
- Browser smoke:
  - 3 built-in templates hiển thị trong tab "Bộ chỉ báo"
  - Apply "VN Swing Setup" → chart hiển thị EMA20 + EMA50 + BB + RSI + Volume
  - Save current → đặt tên → xuất hiện trong "Bộ của tôi"
  - Export → file `.vnsc-set` tải về, mở ra JSON hợp lệ
  - Import file đó → set xuất hiện lại
  - Reload trang → user sets vẫn còn (localStorage persist)
- `AUDIT_LEDGER.md` có entry IC-3

---

## 6. Thứ tự dependency

```
IC-1 (Canonical Store Hardening)  ✅ DONE
  ↓
IC-2 (Indicator Catalog Metadata) ✅ DONE
  ↓
IC-3 (Saved Indicator Sets)       ← READY TO CODE — plan tại IC3_IMPLEMENTATION_PLAN.md
  ↓ (future)
IC-4 (DAG Custom Builder)
IC-5 (Marketplace)
```

---

## 7. Liên kết tài liệu upstream

- Đề xuất gốc: [INDICATOR_PLATFORM_PROPOSAL.md](../../planning/INDICATOR_PLATFORM_PROPOSAL.md)
- SSOT policy: [INDICATOR_SSOT_POLICY.md](../../planning/INDICATOR_SSOT_POLICY.md)
- Repo governance: [PROJECT_GOVERNANCE.md](../PROJECT_GOVERNANCE.md)
- Change control: [CHANGE_CONTROL_STANDARD.md](../../CHANGE_CONTROL_STANDARD.md)
