# Handoff Manifest — Time-Window Data Loader (Slice TWL)

Version: 1.0  
Ngay: 2026-05-11  
Trang thai: READY_FOR_EXECUTION

---

## Muc tieu

Thay co che backfill heuristic hien tai bang bo lap lich nap du lieu theo cua so thoi gian viewport:

1. Mỗi lần chart pan/zoom/span, tinh viewport window hien tai `[tStart, tEnd]`.
2. Tinh target coverage co prefetch: `[tStart - alpha*W, tEnd + beta*W]`, voi `W = tEnd - tStart`.
3. So sanh target coverage voi loaded coverage hien co trong bo nho.
4. Dua phan thieu vao hang doi fetch (left/right), xu ly tuan tu, gop request trung.
5. Dam bao so bars khong bi kep cung 1000 va hanh vi tai du lieu on dinh.

---

## Tai lieu giao kem

| Tep | Vai tro |
|---|---|
| HANDOFF_MANIFEST.md | Entry point, quyet dinh da chot, pham vi |
| TECH_SPEC.md | Contract ky thuat, data model, scheduler, state machine |
| IMPLEMENTATION_PLAN.md | Ke hoach slice theo milestone va gate |
| TASKBOARD.md | Task atomic co DoD, dependency, owner lane |
| AUDIT_PROTOCOL.md | Test matrix, smoke checklist, evidence template |

---

## Pham vi

Trong pham vi:
- `src/demo/LibraryShowcaseDemo.tsx`: thay trigger heuristic bang scheduler queue time-window.
- Reuse `DataAdapter.getBars(type="backward"|"forward")` hien co.
- Them utility pure functions o `src/demo/` cho planner/scheduler.
- Them unit tests va integration tests cho planner + queue.

Ngoai pham vi:
- Khong thay doi public API cua `src/widget/VNStockChart.tsx`.
- Khong thay doi `src/lib/**` contracts (tru khi phat hien blocker critical).
- Khong them datasource moi.
- Khong chuyen sang websocket streaming.

---

## Quyet dinh da chot (khong hoi lai)

1. Nguon quyet dinh nap du lieu la viewport time-window, khong la startIndex heuristic.
2. Su dung scheduler queue single-flight theo cap `(symbol,timeframe,adapter)`.
3. Left-missing la uu tien cao nhat (vi user keo trai de xem lich su).
4. Van giu forward poll 30s, nhung bo sung right-prefetch theo target coverage.
5. Khong hien thi text UI moi cho end-user trong slice nay (debug thong qua logger dev-mode, khong hardcoded UI label).

---

## Files du kien tao/sua

Tao moi:
- `src/demo/historyWindowPlanner.ts`
- `src/demo/historyFetchQueue.ts`
- `src/demo/__tests__/historyWindowPlanner.test.ts`
- `src/demo/__tests__/historyFetchQueue.test.ts`

Sua:
- `src/demo/LibraryShowcaseDemo.tsx`
- `docs/project-delivery/IMPLEMENTATION_PLAN.md` (add Slice TWL summary)
- `docs/upgrade-standard/AUDIT_LEDGER.md` (evidence sau moi milestone)
- `module_tree_full.md` (regenerate khi co thay doi source)

---

## Ranh gioi kien truc

1. Khong de `src/lib/**` import nguoc tu `src/demo/**`.
2. Scheduler chi duoc dung state/refs trong demo shell, khong chen side-effects vao core lib.
3. Moi string UI moi (neu phat sinh) phai qua i18n key.
4. Khong dong slice neu chua co evidence day du trong `AUDIT_LEDGER.md`.

---

## Thu tu doc cho doi code

1. `TECH_SPEC.md` section 2,3,4,6
2. `IMPLEMENTATION_PLAN.md` theo milestone TWL-1 -> TWL-4
3. `TASKBOARD.md` task TWL-01 -> TWL-18
4. `AUDIT_PROTOCOL.md` de run gate va ghi evidence

---

## Dieu kien ban giao hoan tat

- Type-check PASS
- Test lien quan planner/queue PASS
- Smoke pan/zoom/span PASS, bars vuot 1000 va tiep tuc tang khi can
- `AUDIT_LEDGER.md` cap nhat day du file list + evidence
- `module_tree_full.md` da regenerate
