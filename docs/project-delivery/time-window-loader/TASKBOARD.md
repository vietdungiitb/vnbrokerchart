# Taskboard — Time-Window Data Loader (Slice TWL)

Cap nhat: 2026-05-11  
Trang thai slice: READY

---

## Cach dung

- `READY`: co the lam ngay.
- `BLOCKED`: cho dependency.
- `DONE`: da dat tat ca DoD.
- Sau moi task DONE: update `AUDIT_LEDGER.md`.

---

## Milestone TWL-1

### TWL-01: Tao planner interfaces

Trang thai: READY  
Phu thuoc: none

Files:
- CREATE `src/demo/historyWindowPlanner.ts`

Yeu cau:
1. Khai bao types: `TimeWindow`, `TargetWindow`, `LoadedWindow`, `MissingSegments`, `PlannerOptions`.
2. Export signatures pure functions.

DoD:
- [ ] File tao dung path
- [ ] Type-check pass

---

### TWL-02: Implement computeTargetWindow

Trang thai: BLOCKED  
Phu thuoc: TWL-01

Files:
- MODIFY `src/demo/historyWindowPlanner.ts`

Yeu cau:
1. Input viewport + alpha/beta.
2. Clamp width >= 1ms.
3. Return deterministic values.

DoD:
- [ ] Co unit test happy path + edge width=0
- [ ] Type-check pass

---

### TWL-03: Implement computeLoadedWindow + computeMissingSegments

Trang thai: BLOCKED  
Phu thuoc: TWL-01

Files:
- MODIFY `src/demo/historyWindowPlanner.ts`

Yeu cau:
1. Loaded window tu `liveData[0]` va `liveData[last]`.
2. Missing left/right dung cong thuc spec.

DoD:
- [ ] Unit tests for empty/single/multi bars
- [ ] Unit tests for left/right/both/no-missing

---

### TWL-04: Viet tests planner

Trang thai: BLOCKED  
Phu thuoc: TWL-02, TWL-03

Files:
- CREATE `src/demo/__tests__/historyWindowPlanner.test.ts`

DoD:
- [ ] >= 12 test cases pass
- [ ] Bao gom boundary va regression cases

---

## Milestone TWL-2

### TWL-05: Tao queue engine skeleton

Trang thai: BLOCKED  
Phu thuoc: TWL-04

Files:
- CREATE `src/demo/historyFetchQueue.ts`

Yeu cau:
1. Queue item model (`LEFT_FETCH`, `RIGHT_FETCH`).
2. Priority comparator.
3. Dedupe keys theo symbol/timeframe/side.

DoD:
- [ ] API queue ro rang, typed
- [ ] Type-check pass

---

### TWL-06: Implement single-flight + generation invalidation

Trang thai: BLOCKED  
Phu thuoc: TWL-05

Files:
- MODIFY `src/demo/historyFetchQueue.ts`

DoD:
- [ ] Co lock state + release an toan
- [ ] Response generation cu bi discard
- [ ] Unit tests pass

---

### TWL-07: Implement no-progress and stop reasons

Trang thai: BLOCKED  
Phu thuoc: TWL-05

Files:
- MODIFY `src/demo/historyFetchQueue.ts`

DoD:
- [ ] Stop reasons day du: TARGET_REACHED, EMPTY_PAGE, NO_PROGRESS, MAX_PAGES, ERROR
- [ ] Unit tests cho moi stop reason

---

### TWL-08: Viet tests queue engine

Trang thai: BLOCKED  
Phu thuoc: TWL-06, TWL-07

Files:
- CREATE `src/demo/__tests__/historyFetchQueue.test.ts`

DoD:
- [ ] >= 14 test cases pass
- [ ] Cover dedupe, priority, lock, generation, no-progress

---

## Milestone TWL-3

### TWL-09: Refactor init flow sang scheduler

Trang thai: BLOCKED  
Phu thuoc: TWL-08

Files:
- MODIFY `src/demo/LibraryShowcaseDemo.tsx`

Yeu cau:
1. Giu init fetch page dau.
2. Sau init goi scheduler planning thay vi warmup loop rieng.

DoD:
- [ ] Init khong crash
- [ ] HistoryStatus map dung scheduler state

---

### TWL-10: Wire onVisibleDomainChange to planner

Trang thai: BLOCKED  
Phu thuoc: TWL-09

Files:
- MODIFY `src/demo/LibraryShowcaseDemo.tsx`

DoD:
- [ ] Moi domain change deu cap nhat desired window
- [ ] Khong tao request duplicate khi pan lien tuc

---

### TWL-11: Wire onVisibleRangeChange to planner

Trang thai: BLOCKED  
Phu thuoc: TWL-09

Files:
- MODIFY `src/demo/LibraryShowcaseDemo.tsx`

DoD:
- [ ] Range callback support planner scheduling
- [ ] Khong conflict voi domain callback

---

### TWL-12: Replace edge watchdog with queue worker tick

Trang thai: BLOCKED  
Phu thuoc: TWL-10, TWL-11

Files:
- MODIFY `src/demo/LibraryShowcaseDemo.tsx`

DoD:
- [ ] Worker tick 250ms consume queue
- [ ] Khong con state edgeBackfillArmed heuristic

---

### TWL-13: Integrate backward worker paging

Trang thai: BLOCKED  
Phu thuoc: TWL-12

Files:
- MODIFY `src/demo/LibraryShowcaseDemo.tsx`

DoD:
- [ ] Left target duoc phu den muc tieu hoac stop reason ro rang
- [ ] Merge bars khong duplicate timestamp

---

### TWL-14: Integrate forward worker alignment

Trang thai: BLOCKED  
Phu thuoc: TWL-12

Files:
- MODIFY `src/demo/LibraryShowcaseDemo.tsx`

DoD:
- [ ] Right target duoc xu ly bo sung ben canh poll 30s
- [ ] Khong phat sinh regressions live update

---

### TWL-15: Add dev logging hooks

Trang thai: BLOCKED  
Phu thuoc: TWL-13, TWL-14

Files:
- MODIFY `src/demo/LibraryShowcaseDemo.tsx`

DoD:
- [ ] Log chi bat o non-production
- [ ] Khong them UI text moi

---

## Milestone TWL-4

### TWL-16: Regression tests (timeframe 15m/1h)

Trang thai: BLOCKED  
Phu thuoc: TWL-15

Files:
- MODIFY/CREATE tests duoi `src/demo/__tests__/`

DoD:
- [ ] Cover init > 1000 bars path
- [ ] Cover pan left/zoom out trigger queue path

---

### TWL-17: Full gate run + smoke

Trang thai: BLOCKED  
Phu thuoc: TWL-16

DoD:
- [ ] `npm run type-check` PASS
- [ ] `npm test` PASS
- [ ] `npm run build:docs` PASS
- [ ] Smoke TWL-S01..TWL-S10 PASS

---

### TWL-18: Governance closeout

Trang thai: BLOCKED  
Phu thuoc: TWL-17

Files:
- MODIFY `docs/upgrade-standard/AUDIT_LEDGER.md`
- MODIFY `module_tree_full.md`

DoD:
- [ ] Ledger co modified files + evidence + residual risks
- [ ] module tree regenerated
- [ ] commit rieng va push dev
