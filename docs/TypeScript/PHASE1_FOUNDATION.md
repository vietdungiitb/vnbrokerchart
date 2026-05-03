# Phase 1 — Library Foundation (As-built Sync)

> Thuộc: [ROADMAP.md](./ROADMAP.md)  
> Trạng thái hiện tại: Completed  
> Chốt theo evidence: [SLICE_AUDIT.md](./SLICE_AUDIT.md), [AUDIT_LEDGER.md](./AUDIT_LEDGER.md)

---

## 1. Snapshot hiện trạng

| Hạng mục | Thiết kế ban đầu | As-built hiện tại | Trạng thái |
|---|---|---|---|
| Build library | tsup ESM/CJS/d.ts | Đã chạy bằng `tsup` qua `npm run build` | Done |
| Public entry | `src/index.ts` | Đã có root barrel `src/index.ts` | Done |
| Public types | OHLCV, Pane, Indicator, Adapter | Đã có đủ trong `src/lib/types/` | Done |
| Strict TypeScript | strict mode + type-check gate | Đã có `npm run type-check` và gate pass | Done |
| Storybook | Storybook 8 (đề xuất cũ) | Storybook 10 + Vite builder | Updated |

---

## 2. Chênh lệch cần ghi nhận

1. Tài liệu cũ mô tả Storybook 8, nhưng thực tế đang dùng Storybook 10 và Vite builder.
2. Build contract của thư viện hiện giữ `tsup` làm chuẩn, webpack chỉ còn cho luồng demo cũ.
3. Public surface đang ưu tiên tương thích với legacy exports, không phải greenfield API hoàn toàn mới.

---

## 3. Cần bổ sung vào Phase 1

1. Thêm mục "Toolchain baseline" chốt version và vai trò:
   - `tsup` cho package build.
   - Storybook regression dùng Vite builder.
2. Thêm mục "Compatibility policy" cho `src/index.ts`:
   - Public export nào stable.
   - Export nào transitional/legacy.
3. Thêm mục "Release gate":
   - `npm run type-check` pass.
   - `npm run build` pass.
   - `npm run build:storybook` pass.

---

## 4. Lộ trình tiếp theo cho nền tảng

### M1 — Hardening (1 sprint)
- Rà lại type của public APIs không để `any` lọt qua contract mới.
- Chuẩn hóa changelog cho các export có nguy cơ breaking change.

### M2 — Packaging quality (1 sprint)
- Thêm kiểm tra kích thước bundle theo budget.
- Bổ sung smoke publish bằng `npm pack` trong pipeline CI.

### M3 — Developer ergonomics (1 sprint)
- Bổ sung ví dụ tích hợp adapter + stories theo pattern hiện tại.
- Bổ sung tài liệu migration ngắn cho user từ legacy API.

---

## 5. Definition of Done (duy trì)

- [x] `npm run type-check` pass.
- [x] `npm run build` pass (tsup).
- [x] Root public entry và type contracts tồn tại, nhất quán với ledger.
- [x] Storybook regression build chạy được với Vite.
- [ ] Budget bundle và publish smoke được tự động hóa trong CI.
