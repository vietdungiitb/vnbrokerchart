# Audit Protocol — VNInvest Integration (Slice INT)

**Version:** 1.0  
**Ngày:** 2026-05-08  

---

## 1. Mục tiêu

Mỗi milestone trong slice INT phải để lại bằng chứng đủ cho auditor trả lời:
1. Đã thêm/sửa gì
2. Thay đổi đó có đúng với TECH_SPEC không
3. Có thể verify lại nhanh bằng command / thao tác nào

---

## 2. Validation commands chuẩn

```bash
npm run type-check
npm test
npm run build:docs
python scripts/generate_module_tree.py
```

---

## 3. Test matrix tự động

| ID | Scope | Test file | Loại |
|---|---|---|---|
| T-INT-01 | VNInvestClient.login 200 | `__tests__/VNInvestClient.test.ts` | Unit |
| T-INT-02 | VNInvestClient.login 401 throws | `__tests__/VNInvestClient.test.ts` | Unit |
| T-INT-03 | VNInvestClient.getChart 200 | `__tests__/VNInvestClient.test.ts` | Unit |
| T-INT-04 | VNInvestClient.getChart 401 → clearPAT | `__tests__/VNInvestClient.test.ts` | Unit |
| T-INT-05 | VNInvestClient.getChart 404 → SYMBOL_NOT_FOUND | `__tests__/VNInvestClient.test.ts` | Unit |
| T-INT-06 | VNInvestClient.hasPAT false when empty | `__tests__/VNInvestClient.test.ts` | Unit |
| T-INT-07 | VNInvestClient.hasPAT true after setPAT | `__tests__/VNInvestClient.test.ts` | Unit |
| T-INT-08 | adapter: null close filtered | `__tests__/adapters.test.ts` | Unit |
| T-INT-09 | adapter: null open fallback to close | `__tests__/adapters.test.ts` | Unit |
| T-INT-10 | adapter: date parse correct | `__tests__/adapters.test.ts` | Unit |
| T-INT-11 | adapter: null volume → 0 | `__tests__/adapters.test.ts` | Unit |
| T-INT-12 | adapter: empty array → empty | `__tests__/adapters.test.ts` | Unit |
| T-INT-13 | i18n: tất cả vninvest.* keys tồn tại trong vi | `src/demo/__tests__/i18n.test.tsx` (extend) | Unit |
| T-INT-14 | i18n: tất cả vninvest.* keys tồn tại trong en | `src/demo/__tests__/i18n.test.tsx` (extend) | Unit |

---

## 4. Browser smoke checklist

Chạy sau khi INT-13 DONE. Server: `npm run build:docs` → serve `build/index.html` qua http server.

### INT-S01: Demo mode không bị ảnh hưởng

- [ ] Load trang → mặc định hiển thị Binance Demo data (không đổi so với trước)
- [ ] `DataSourceSwitcher` hiển thị, active = "Binance Demo"
- [ ] Chart render bình thường

### INT-S02: Chuyển sang VNInvest không có PAT

- [ ] Click "VNInvest" trên switcher
- [ ] Badge hiện `"Chưa có token — bấm 🔑 để kết nối"` (tiếng Việt)
- [ ] Nút "Tải biểu đồ" bị disabled

### INT-S03: Mở PATTokenModal

- [ ] Bấm icon 🔑
- [ ] Modal mở, có 2 tab: "Dán token" / "Đăng nhập"
- [ ] Close button đóng modal, không crash

### INT-S04: Lưu PAT bằng paste

- [ ] Tab "Dán token" → paste token hợp lệ → bấm "Lưu token"
- [ ] Modal đóng
- [ ] Badge đổi thành "Đã kết nối VNInvest"
- [ ] `localStorage['vni_pat']` có giá trị

### INT-S05: Load chart VNInvest thành công

- [ ] Symbol search → gõ "VCB" → dropdown hiển thị "VCB — Ngân hàng Ngoại thương Việt Nam (HOSE)"
- [ ] Chọn VCB
- [ ] Timeframe = 1D, Days = 90 → bấm "Tải biểu đồ"
- [ ] Loading state hiển thị trong lúc chờ
- [ ] Chart render với candles VN (giá ~80,000–90,000 VND)
- [ ] Ticker trong title bar (nếu có) hiển thị đúng symbol "VCB"

### INT-S06: Locale switch trong VNInvest mode

- [ ] Đang ở VNInvest mode → switch sang "en"
- [ ] Tất cả text DataSourceSwitcher và labels chuyển sang tiếng Anh
- [ ] Switch về "vi" → về tiếng Việt
- [ ] Chart data không thay đổi

### INT-S07: Error handling — Symbol không tồn tại

- [ ] Nhập symbol "XXXX999" → bấm Tải
- [ ] Hiện inline error (không crash, không alert)

### INT-S08: Chuyển về Binance Demo

- [ ] Đang ở VNInvest mode → click "Binance Demo"
- [ ] DataSourceSwitcher ẩn symbol search
- [ ] Chart hiển thị lại Binance demo data

### INT-S09 (Optional — INT-5 Whale panel)

- [ ] Sau load VCB chart, WhalePanel hiện dưới chart
- [ ] Buy bar và Sell bar hiển thị màu đúng (xanh/đỏ)
- [ ] Numbers format đúng (tỷ đồng hoặc tỷ lệ %)

---

## 5. Security audit checklist

Thực hiện trước khi đóng slice INT-4:

| # | Kiểm tra | Cách verify |
|---|---|---|
| SEC-01 | PAT không xuất hiện trong console | Mở DevTools → Console → không có dòng nào in token |
| SEC-02 | PAT không xuất hiện trong Network URLs | DevTools → Network → filter XHR → không có request URL nào chứa PAT |
| SEC-03 | PAT chỉ trong header Authorization | Inspect request headers trong DevTools → `Authorization: Bearer <token>` |
| SEC-04 | PAT không được gửi tới server nào khác ngoài `vninvest.edusuccess.vn` | DevTools Network → không có request nào tới domain khác chứa Authorization header |
| SEC-05 | localStorage key rõ ràng | `localStorage.getItem('vni_pat')` → token; không có key nào khác chứa token |

---

## 6. Evidence template

Sau khi đóng mỗi milestone, điền vào mẫu này và đưa vào `AUDIT_LEDGER.md`:

```
=== INT Milestone [M1|M2|M3|M4|M5] ===
Ngày:
Người thực hiện:

Scope:
  Slice INT-[N..M]

Files tạo mới:
  - src/demo/dataSources/types.ts
  - src/demo/vninvest/VNInvestClient.ts
  - ... (liệt kê đủ)

Files sửa:
  - src/demo/i18n.tsx (thêm 34 keys)
  - src/demo/LibraryShowcaseDemo.tsx (thêm DataSourceSwitcher, state, handlers)

Behavioral change:
  [Mô tả hành vi mới: ví dụ "User có thể chọn VNInvest làm source, nhập PAT, search VCB, load chart thật"]

Validation:
  npm run type-check → PASS
  npm test → PASS ([N] tests, không có failures)
  npm run build:docs → PASS
  module_tree_full.md → regenerated

Browser smoke:
  INT-S01 → PASS
  INT-S02 → PASS
  INT-S03 → PASS
  ... (liệt kê đến INT-S08)

Security audit:
  SEC-01 → PASS
  SEC-02 → PASS
  SEC-03 → PASS
  SEC-04 → PASS
  SEC-05 → PASS

Residual risk:
  - [Liệt kê risk còn lại, ví dụ: "CORS chưa verify trên production domain"]
  - [Hoặc: "Intraday frames chưa test do chưa có data 1m từ server"]
```

---

## 7. Ghi chú về data fidelity

- Chart từ VNInvest là **dữ liệu thật** — ticker label phải hiển thị đúng symbol upstream.
- Nếu `points: []` (intraday empty), KHÔNG được hiện sample data giả. Hiển thị `vninvest.noData` là behavior đúng.
- `technical` field trong chart response (rsi_14, macd...) là **metadata từ server** — demo có thể hiển thị hoặc bỏ qua, nhưng không được dùng để giả indicator tính cục bộ khi server chưa trả về.

---

## 8. Known gaps và out-of-scope

| Gap | Trạng thái | Ghi chú |
|---|---|---|
| Realtime streaming (WebSocket/SSE) | Out of scope INT | Chỉ polling hoặc on-demand |
| Multi-symbol comparison mode | Out of scope INT | Chỉ 1 symbol tại một thời điểm |
| VNInvest auth refresh / session management | Out of scope INT | PAT long-lived, không cần refresh |
| Widget boundary extraction | Slice F riêng | Không làm trong INT |
| Production CORS | Phụ thuộc vninvest team | Pre-condition G-00 |
