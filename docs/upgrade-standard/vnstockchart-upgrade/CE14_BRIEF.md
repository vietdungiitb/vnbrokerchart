# CE14 Sprint Brief — Stability & Bug Fixes

> **Sprint:** CE14  
> **Prerequisite:** CE13 DONE (pane-aware drawing, Sprint 3 fully closed)  
> **Priority:** HIGHEST — phải làm đầu tiên  
> **Estimated:** 2–3 ngày

---

## Mục tiêu sprint

1. Cải thiện độ tin cậy của left-scroll pagination (load nến cũ khi kéo trái đến biên).

> **Ghi chú:** CE14-01 ban đầu nhắm vào `removeChild` React crash. Sau kiểm tra, `fitDimensions.tsx` và `fitWidth.tsx` trong project này **đã có guard đầy đủ** (`componentWillUnmount` chỉ remove event listener; `handleWindowResize` đã guard `!node || !node.parentNode`). Crash không tồn tại ở đây — CE14-01 không áp dụng.

---

## CE14-01 — Cải thiện left-scroll pagination trigger

### Hiện trạng
Code hiện tại trong `LibraryShowcaseDemo.tsx`:
- `requestOlderHistoryPage` defined tại ~line 587.
- Trigger tại ~line 761: `if (visibleDomain[0] <= earliestBar.date)`.
- Vấn đề: trigger chỉ chạy khi `visibleDomain` thay đổi; nếu user kéo chậm và dừng chính xác ở biên, trigger có thể fire nhiều lần hoặc miss.

### Hành động yêu cầu

**Bước 1 — Đọc context:**
```
read_file src/demo/LibraryShowcaseDemo.tsx lines 575–620  # requestOlderHistoryPage
read_file src/demo/LibraryShowcaseDemo.tsx lines 745–780  # domain change handler
```

**Bước 2 — Thêm debounce cho trigger:**
```typescript
import { useRef, useCallback } from "react";

const backfillDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const triggerBackfillDebounced = useCallback(() => {
  if (backfillDebounceRef.current) return; // already pending
  backfillDebounceRef.current = setTimeout(() => {
    backfillDebounceRef.current = null;
    requestOlderHistoryPage();
  }, 200);
}, [requestOlderHistoryPage]);
```

**Bước 3 — Thêm guard khi đang inflight:**
`backfillInFlightRef` đã tồn tại — dùng nó để guard:
```typescript
if (!backfillInFlightRef.current && visibleDomain[0] <= earliestBar.date) {
  triggerBackfillDebounced();
}
```

**Bước 4 — Verify visually:**
- Demo mở tại http://localhost:8080.
- Kéo chart về phía trái đến hết nến.
- Spinner hoặc status text phải xuất hiện.
- Nến mới phải được append sau vài giây.

### Files cần sửa
- `src/demo/LibraryShowcaseDemo.tsx`

---

## CE14-02 — Regression test

Sau fix, chạy:
```powershell
npm test
```
Tất cả 37 test files phải PASS. Nếu có test fail, đọc output và fix.

---

## CE14-03 — Final audit

### Gate commands
```powershell
npm run type-check   # Expected: 0 errors
npm test             # Expected: PASS
npm run build:docs   # Expected: OK
python scripts/generate_module_tree.py  # Expected: ≥703 modules
```

### Ledger entry
Sau khi pass tất cả gates, thêm entry vào `docs/upgrade-standard/AUDIT_LEDGER.md`:

```markdown
## CE14 — Stability & Bug Fixes

**Ngày hoàn tất:** [date]
**Sprint:** CE14

### Thay đổi
- `src/demo/LibraryShowcaseDemo.tsx` — debounce + inflight guard cho left-scroll pagination trigger
- CE14-01 (removeChild crash): đã kiểm tra — không tồn tại trong project này, không cần sửa

### Gate evidence
| Gate | Kết quả |
|---|---|
| type-check | 0 errors |
| npm test | XX tests PASS |
| build:docs | OK |
| module_tree | XXX modules |
```

---

## Commit convention

```bash
git add -A
git commit -m "fix(CE14): improve left-scroll pagination debounce + inflight guard

- Debounce + inflight guard for backfill trigger in LibraryShowcaseDemo
- Verified fitDimensions/fitWidth: no removeChild issue in this project

Gates: type-check OK | tests PASS | build OK"

git push origin dev
```
