# Handoff Manifest — VNInvest Integration (Slice INT)

**Version:** 1.0  
**Ngày:** 2026-05-08  
**Trạng thái:** READY — chờ xác nhận pre-condition CORS (G-00)  
**Backend source verified:** `C:\Mujoco Projects\vninvest`  
**Production server:** `https://vninvest.edusuccess.vn`

---

## Mục tiêu

Tích hợp nguồn dữ liệu **VNInvest SAAS** vào VNStockChart demo shell, cho phép người dùng:
1. Nhập PAT token cá nhân từ tài khoản vninvest.edusuccess.vn
2. Tìm kiếm mã chứng khoán VN (VCB, HPG, VIC...)
3. Xem biểu đồ OHLCV thật từ thị trường Việt Nam
4. (Tuỳ chọn) Xem dòng tiền cá mập / whale orders real-time

---

## Bộ tài liệu giao kèm

| Tệp | Vai trò |
|---|---|
| `HANDOFF_MANIFEST.md` | **File này** — entry point, đọc trước |
| `TECH_SPEC.md` | API contract đã xác minh, kiến trúc module, TypeScript interfaces, i18n keys, storage contract, security |
| `IMPLEMENTATION_PLAN.md` | Chi tiết từng slice: INT-1..INT-5, code templates, exit criteria |
| `TASKBOARD.md` | 16 tasks INT-01..INT-16 với DoD rõ ràng, dependency chain, gate milestones |
| `AUDIT_PROTOCOL.md` | Test matrix 14 unit tests, 9 browser smoke tests, 5 security checks, evidence template |

---

## Thứ tự đọc cho code team

1. **TECH_SPEC.md** — Đọc section 2 (Pre-conditions) và section 3 (API contract) trước
2. **IMPLEMENTATION_PLAN.md** — Đọc Slice INT-1 để bắt đầu
3. **TASKBOARD.md** — Theo thứ tự INT-01 → INT-14
4. **AUDIT_PROTOCOL.md** — Dùng khi đóng mỗi milestone

---

## Pre-conditions bắt buộc

Trước khi bắt đầu code **bất kỳ task nào**, xác nhận 2 điều kiện này:

| # | Điều kiện | Action |
|---|---|---|
| G-00 | `vninvest.edusuccess.vn` CORS cho phép `localhost:3000` | Yêu cầu team backend vninvest thêm origin; kiểm tra với `OPTIONS` request |
| G-01 | Có PAT token test có thể dùng ngay | Đăng nhập vninvest.edusuccess.vn → Settings/API → copy PAT |

---

## Files sẽ được tạo mới (không sửa file nào ngoài danh sách)

```
src/demo/
├── dataSources/
│   ├── types.ts                             [INT-01]
│   ├── demoDataSource.ts                    [INT-06]
│   └── vninvestDataSource.ts                [INT-07]
├── vninvest/
│   ├── VNInvestClient.ts                    [INT-02]
│   ├── adapters.ts                          [INT-03]
│   └── __tests__/
│       ├── VNInvestClient.test.ts           [INT-04]
│       └── adapters.test.ts                 [INT-05]
└── components/
    ├── PATTokenModal.tsx                    [INT-09]
    ├── VNSymbolSearch.tsx                   [INT-10]
    └── DataSourceSwitcher.tsx               [INT-11]
```

## Files sẽ được sửa

```
src/demo/i18n.tsx                   [INT-08] — thêm 34 keys
src/demo/LibraryShowcaseDemo.tsx    [INT-12, INT-13] — thêm state + wire components
```

## Files sẽ được regenerate (sau khi done)

```
module_tree_full.md
docs/upgrade-standard/AUDIT_LEDGER.md
```

---

## Architecture boundaries (KHÔNG được vi phạm)

1. `src/lib/**` KHÔNG được import từ `src/demo/**` — hard rule repo
2. `VNInvestClient` KHÔNG được dùng trong `src/lib/**`
3. PAT KHÔNG được log vào console, KHÔNG được đặt vào URL
4. `enrichData()` pipeline KHÔNG thay đổi — chỉ thay đổi input source
5. Không tạo thêm demo surface mới, không tạo layout riêng

---

## Quyết định đã chốt (không cần hỏi lại)

| # | Quyết định |
|---|---|
| D-01 | DataSource abstraction nằm trong `src/demo/dataSources/` — không phải `src/lib/` |
| D-02 | Symbol search được thực hiện client-side (filter local list) |
| D-03 | PAT lưu `localStorage['vni_pat']` — không encrypt, không gửi server khác |
| D-04 | Khi `points: []` → hiện noData, KHÔNG fallback về demo data |
| D-05 | Whale panel là demo-only component, không kết nối SeriesRegistry core |
| D-06 | Intraday timeframes (1m, 5m, 15m, 1H) không fallback về daily candles |
| D-07 | Stock list loaded một lần rồi filter client-side (không search API riêng) |

---

## Trạng thái pre-handoff

- [x] API contract đã xác minh từ source code `market_data_service.py`
- [x] Chart response schema đã xác nhận: `{points: [{date, open, high, low, close, volume}]}`
- [x] TypeScript interfaces đã viết đầy đủ
- [x] Adapter logic đã thiết kế và documented
- [x] i18n keys đã định nghĩa 34 keys (vi + en)
- [x] Security contract đã ghi rõ
- [x] Error handling contract đã ghi rõ
- [x] Unit test cases đã định nghĩa (12 cases)
- [x] Browser smoke checklist đã viết (9 scenarios)
- [ ] CORS G-00 xác nhận (chờ team backend vninvest)
- [ ] Code thực thi (chờ dev team)
