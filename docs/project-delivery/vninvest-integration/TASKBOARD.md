# Taskboard — VNInvest Integration (Slice INT)

**Cập nhật:** 2026-05-08  
**Trạng thái slice:** READY — chờ xác nhận CORS (pre-condition P-01)

---

## Cách đọc bảng này

- **DoD (Definition of Done):** Tất cả điều kiện phải đạt trước khi tick DONE.
- `BLOCKED`: task có dependency chưa DONE.
- `READY`: dependency đã DONE, có thể bắt đầu ngay.
- `TODO`: chưa nên bắt đầu trong sprint này.

---

## Gate pre-conditions (chạy trước INT-01)

| ID | Điều kiện | Cách kiểm tra | Phụ trách |
|---|---|---|---|
| G-00 | CORS vninvest.edusuccess.vn cho phép `localhost:3000` | `OPTIONS /api/auth/token/` trả 200 + header CORS đúng | Team vninvest backend |
| G-01 | PAT token test đã có và còn hiệu lực | `curl -H "Authorization: Bearer <PAT>" https://vninvest.edusuccess.vn/api/stock-management/stocks/VCB/chart/?days=5` → 200 | Dev thực thi |

---

## Milestone INT-1: Infrastructure

### INT-01: Tạo `src/demo/dataSources/types.ts`

**Trạng thái:** READY  
**Phụ thuộc:** Không  

**Việc cần làm:**
1. Tạo file `src/demo/dataSources/types.ts`
2. Định nghĩa đúng các interface theo spec section 5.1: `DataSourceId`, `RawOHLCVBar`, `SymbolResult`, `DataSource`

**DoD:**
- [ ] File tồn tại tại đúng path
- [ ] `npm run type-check` PASS không có lỗi mới

---

### INT-02: Tạo `src/demo/vninvest/VNInvestClient.ts`

**Trạng thái:** READY sau INT-01  
**Phụ thuộc:** INT-01  

**Việc cần làm:**
1. Tạo file `src/demo/vninvest/VNInvestClient.ts`
2. Implement class `VNInvestClient` theo spec section 5.2
3. Export tất cả interfaces: `VNInvestTimeframe`, `VNInvestChartPoint`, `VNInvestChartResponse`, `VNInvestStockProfile`, `VNInvestTicker`, `VNInvestWhaleSummary`, `VNInvestWhaleOrder`, `VNInvestWhaleFeed`

**Yêu cầu security bắt buộc:**
- [ ] KHÔNG log PAT vào console bất kỳ lúc nào
- [ ] KHÔNG đặt PAT vào URL param
- [ ] PAT chỉ gửi trong header `Authorization: Bearer`
- [ ] Khi 401: gọi `clearPAT()` trước khi throw

**DoD:**
- [ ] `npm run type-check` PASS
- [ ] Không có hardcoded UI string nào (không có key nào)
- [ ] Method signatures khớp spec section 5.2

---

### INT-03: Tạo `src/demo/vninvest/adapters.ts`

**Trạng thái:** READY sau INT-01  
**Phụ thuộc:** INT-01  

**Việc cần làm:**
1. Tạo `src/demo/vninvest/adapters.ts`
2. Implement `chartPointsToRawOHLCV()` theo spec section 5.3 + 5.4

**DoD:**
- [ ] `npm run type-check` PASS
- [ ] Adapter không import `src/lib/**`

---

### INT-04: Viết unit tests cho VNInvestClient

**Trạng thái:** READY sau INT-02  
**Phụ thuộc:** INT-02  

**Việc cần làm:**
1. Tạo `src/demo/vninvest/__tests__/VNInvestClient.test.ts`
2. Mock `fetch` global
3. Implement test cases theo spec IMPLEMENTATION_PLAN.md slice INT-1

**Test cases bắt buộc (7 cases):**
- [ ] login thành công → PAT lưu localStorage → `hasPAT()` = true
- [ ] login 401 → throw Error chứa "401"
- [ ] getChart 200 → trả đúng `VNInvestChartResponse` shape
- [ ] getChart 401 → `clearPAT()` được gọi + throw "PAT_EXPIRED"
- [ ] getChart 404 → throw "SYMBOL_NOT_FOUND:VCB"
- [ ] `hasPAT()` = false khi localStorage rỗng trước constructor
- [ ] `hasPAT()` = true sau `setPAT("test-token")`

**DoD:**
- [ ] `npm test -- src/demo/vninvest/__tests__/VNInvestClient.test.ts` PASS
- [ ] Tất cả 7 cases đều GREEN

---

### INT-05: Viết unit tests cho adapters

**Trạng thái:** READY sau INT-03  
**Phụ thuộc:** INT-03  

**Việc cần làm:**
1. Tạo `src/demo/vninvest/__tests__/adapters.test.ts`
2. Implement test cases theo spec

**Test cases bắt buộc (5 cases):**
- [ ] point với `close=null` bị lọc ra khỏi kết quả
- [ ] point với `open=null` → `open` = `close` trong output
- [ ] date string `"2026-05-08T00:00:00"` → `Date` object đúng
- [ ] `volume=null` → `volume = 0` trong output
- [ ] mảng rỗng → mảng rỗng

**DoD:**
- [ ] `npm test -- src/demo/vninvest/__tests__/adapters.test.ts` PASS
- [ ] 5 cases GREEN

---

**Gate M1:** `npm run type-check` PASS · `npm test -- src/demo/vninvest` PASS (cả 12+ cases)

---

## Milestone INT-2: DataSource Abstraction

### INT-06: Tạo `src/demo/dataSources/demoDataSource.ts`

**Trạng thái:** READY sau Gate M1  
**Phụ thuộc:** INT-01  

**Việc cần làm:**
1. Tạo `src/demo/dataSources/demoDataSource.ts`
2. Wrap existing demoData vào `DataSource` interface
3. Giữ nguyên symbols demo: `BTC`, `ETH`, `AAPL` (tuỳ theo demoData.ts có gì)

**DoD:**
- [ ] `demoDataSource` implement đúng interface `DataSource`
- [ ] `demoDataSource.getOHLCV()` trả `RawOHLCVBar[]` có `date: Date`
- [ ] `npm run type-check` PASS

---

### INT-07: Tạo `src/demo/dataSources/vninvestDataSource.ts`

**Trạng thái:** READY sau Gate M1  
**Phụ thuộc:** INT-01, INT-02, INT-03  

**Việc cần làm:**
1. Tạo `src/demo/dataSources/vninvestDataSource.ts`
2. Export singleton `vniClient` và `vninvestDataSource`
3. `searchSymbols`: load danh sách từ `vniClient.listStocks()`, filter theo query (client-side), trả max 20 kết quả

**DoD:**
- [ ] `vninvestDataSource` implement đúng interface `DataSource`
- [ ] Search filter đúng theo cả symbol và company_name (case-insensitive)
- [ ] `npm run type-check` PASS

---

**Gate M2:** `npm run type-check` PASS · `demoDataSource` và `vninvestDataSource` type-safe

---

## Milestone INT-3: i18n + UI Components

### INT-08: Thêm i18n keys vào `src/demo/i18n.tsx`

**Trạng thái:** READY sau Gate M2  
**Phụ thuộc:** Gate M1 (để biết keys cần thiết)  

**Việc cần làm:**
1. Thêm tất cả 34 keys từ bảng TECH_SPEC.md section 6 vào dict `vi` và `en`
2. Thêm TypeScript type union cho các keys mới

**DoD:**
- [ ] Cả 34 keys có mặt trong dict `vi`
- [ ] Cả 34 keys có mặt trong dict `en`
- [ ] `npm run type-check` PASS
- [ ] `npm test -- src/demo/__tests__/i18n.test.tsx` PASS (test i18n hiện có không fail)

---

### INT-09: Tạo `src/demo/components/PATTokenModal.tsx`

**Trạng thái:** READY sau INT-08  
**Phụ thuộc:** INT-02 (client), INT-08 (i18n)  

**Việc cần làm:**
1. Tạo `src/demo/components/PATTokenModal.tsx`
2. Modal 2 tab: "Dán token" và "Đăng nhập"
3. Dùng modal overlay pattern giống `PaneSettingsModal.tsx` (tham khảo file đó để giữ consistent)
4. Props: `{ open: boolean; onClose(): void; onPATSaved(pat: string): void; client: VNInvestClient }`

**DoD:**
- [ ] Tất cả text qua `useDemoI18n()` — KHÔNG hardcode chuỗi
- [ ] Tab "Dán token": textarea nhập, nút Lưu, nút Xóa token
- [ ] Tab "Đăng nhập": input user/pass, nút "Đăng nhập"
- [ ] Khi lưu/login thành công: gọi `onPATSaved(token)` rồi `onClose()`
- [ ] Error state inline, không dùng `alert()`
- [ ] `npm run type-check` PASS

---

### INT-10: Tạo `src/demo/components/VNSymbolSearch.tsx`

**Trạng thái:** READY sau INT-08  
**Phụ thuộc:** INT-07 (vninvestDataSource), INT-08 (i18n)  

**Việc cần làm:**
1. Tạo `src/demo/components/VNSymbolSearch.tsx`
2. Props: `{ source: DataSource; onSelect(symbol: string): void; initialValue?: string; disabled?: boolean }`
3. Input text + dropdown autocomplete
4. Debounce 300ms trên input
5. Keyboard: ArrowUp/Down navigate, Enter chọn, Esc đóng dropdown

**DoD:**
- [ ] Debounce 300ms đúng
- [ ] Hiển thị: `{SYMBOL} — {company_name} ({exchange})`
- [ ] Keyboard navigation hoạt động
- [ ] Placeholder từ i18n key `vninvest.symbolSearch.placeholder`
- [ ] `npm run type-check` PASS

---

### INT-11: Tạo `src/demo/components/DataSourceSwitcher.tsx`

**Trạng thái:** READY sau INT-10  
**Phụ thuộc:** INT-06, INT-07, INT-09, INT-10  

**Việc cần làm:**
1. Tạo `src/demo/components/DataSourceSwitcher.tsx`
2. Props: `{ activeSource: DataSourceId; onSourceChange(id: DataSourceId): void; onOpenPATModal(): void; hasVNIPAT: boolean; ... }`
3. Khi source = `'vninvest'`: render VNSymbolSearch + timeframe select + days select + nút "Tải biểu đồ"
4. Timeframe options: `1m`, `5m`, `15m`, `1H`, `1D` (labels từ i18n)
5. Days options: `30`, `90`, `180`, `365`
6. Status badge: dùng `vninvest.status.*` keys

**DoD:**
- [ ] Tất cả text từ i18n
- [ ] Khi chưa có PAT: nút 🔑 gọi `onOpenPATModal()`
- [ ] Khi có PAT: hiện badge "Đã kết nối" + icon
- [ ] `npm run type-check` PASS

---

**Gate M3:** `npm run type-check` PASS · 3 components render không crash · i18n keys đủ

---

## Milestone INT-4: Wire vào Shell

### INT-12: Adapt `LibraryShowcaseDemo.tsx` — state + handlers

**Trạng thái:** READY sau Gate M3  
**Phụ thuộc:** Gate M3, INT-06, INT-07  

**Việc cần làm:**
1. Thêm state mới theo spec IMPLEMENTATION_PLAN.md Slice INT-4
2. Implement `handleLoadVNIChart` handler
3. Implement PAT modal open/close handler
4. Persist `vni_last_symbol`, `vni_last_timeframe`, `vni_last_days` vào localStorage

**DoD:**
- [ ] State types rõ ràng, không dùng `any`
- [ ] Error `PAT_EXPIRED` → tự mở PATModal
- [ ] Error `SYMBOL_NOT_FOUND:*` → set vniError với message phù hợp
- [ ] Empty `points[]` → set `vniError(t('vninvest.noData'))` không crash
- [ ] `npm run type-check` PASS

---

### INT-13: Adapt `LibraryShowcaseDemo.tsx` — mount components vào JSX

**Trạng thái:** READY sau INT-12  
**Phụ thuộc:** INT-12  

**Việc cần làm:**
1. Thêm `DataSourceSwitcher` vào topbar
2. Mount `PATTokenModal` với `open={patModalOpen}`
3. Hiển thị `vniError` khi có
4. Hiển thị loading state khi `vniLoading === true`

**DoD:**
- [ ] Demo build không crash (browser smoke INT-S01 đến INT-S08 theo AUDIT_PROTOCOL.md)
- [ ] `npm run type-check` PASS
- [ ] `npm test` PASS (tất cả 238+ tests hiện có)
- [ ] `npm run build:docs` PASS

---

### INT-14: Cập nhật module tree và audit

**Trạng thái:** READY sau INT-13  
**Phụ thuộc:** INT-13  

**Việc cần làm:**
1. `python scripts/generate_module_tree.py` → commit `module_tree_full.md`
2. Cập nhật `docs/upgrade-standard/AUDIT_LEDGER.md` với evidence INT-1..4

**DoD:**
- [ ] `module_tree_full.md` đã được regenerate
- [ ] AUDIT_LEDGER ghi đủ: files modified, behavioral change, validation evidence

---

**Gate M4 (Release gate):**
```
npm run type-check   → PASS
npm test             → PASS (không ít hơn 238 tests)
npm run build:docs   → PASS
```
Browser smoke INT-S01 đến INT-S08 theo AUDIT_PROTOCOL.md.

---

## Milestone INT-5 (Optional): Whale Panel

### INT-15: Tạo `src/demo/components/WhalePanel.tsx`

**Trạng thái:** TODO (sau Gate M4)  
**Phụ thuộc:** Gate M4  

**Việc cần làm:**
1. Tạo `src/demo/components/WhalePanel.tsx`
2. Props: `{ data: VNInvestWhaleFeed | null; loading: boolean }`
3. Hiển thị 2 bar buy/sell, số liệu shark/whale/small, flow_net
4. Hiện `vninvest.whale.noData` khi `data === null` hoặc `whale_orders: []`

**DoD:**
- [ ] Tất cả text từ i18n
- [ ] Không crash khi `summary.total_value = 0`
- [ ] `npm run type-check` PASS

---

### INT-16: Wire WhalePanel + polling vào shell

**Trạng thái:** TODO (sau INT-15)  
**Phụ thuộc:** INT-15  

**Việc cần làm:**
1. Thêm `whaleData` state vào `LibraryShowcaseDemo`
2. Sau `handleLoadVNIChart` thành công: gọi `vniClient.getWhaleFeed(vniSymbol)` → `setWhaleData`
3. Mount `WhalePanel` dưới chart canvas khi `activeSource === 'vninvest'`
4. Polling 30s nếu `market_phase === 'continuous'`

**DoD:**
- [ ] Whale panel visible khi có data
- [ ] Polling dừng khi source chuyển về demo hoặc component unmount (cleanup interval)
- [ ] `npm run type-check` PASS · `npm test` PASS

---

**Gate M5 (Optional):** Gate M4 + whale panel smoke PASS

---

## Summary bảng task

| ID | Task | Milestone | Trạng thái |
|---|---|---|---|
| INT-01 | `dataSources/types.ts` | M1 | READY |
| INT-02 | `VNInvestClient.ts` | M1 | READY |
| INT-03 | `adapters.ts` | M1 | READY |
| INT-04 | Unit test VNInvestClient | M1 | READY |
| INT-05 | Unit test adapters | M1 | READY |
| INT-06 | `demoDataSource.ts` | M2 | BLOCKED → M1 |
| INT-07 | `vninvestDataSource.ts` | M2 | BLOCKED → M1 |
| INT-08 | i18n keys 34 | M3 | BLOCKED → M1 |
| INT-09 | `PATTokenModal.tsx` | M3 | BLOCKED → M2, INT-08 |
| INT-10 | `VNSymbolSearch.tsx` | M3 | BLOCKED → M2, INT-08 |
| INT-11 | `DataSourceSwitcher.tsx` | M3 | BLOCKED → INT-09, INT-10 |
| INT-12 | Shell — state + handlers | M4 | BLOCKED → M3 |
| INT-13 | Shell — JSX mount | M4 | BLOCKED → INT-12 |
| INT-14 | Module tree + audit | M4 | BLOCKED → INT-13 |
| INT-15 | `WhalePanel.tsx` | M5 (opt) | TODO |
| INT-16 | Wire whale + polling | M5 (opt) | TODO |
