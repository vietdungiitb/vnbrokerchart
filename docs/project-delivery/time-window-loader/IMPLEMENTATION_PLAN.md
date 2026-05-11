# Implementation Plan — Time-Window Data Loader (Slice TWL)

Version: 1.0  
Ngay: 2026-05-11  
Trang thai: READY

---

## Nguyen tac

- Plan truoc, code sau.
- Moi milestone co gate doc lap.
- Moi task code xong phai cap nhat `docs/upgrade-standard/AUDIT_LEDGER.md`.
- Neu co thay doi source code, phai regenerate `module_tree_full.md`.

---

## Hien trang vs Muc tieu

| Thanh phan | Trang thai hien tai | Gap |
|---|---|---|
| Init history load | Co warmup 5000 bars cho Binance | Chua gan voi viewport target, logic rieng le |
| Backfill trigger | Domain/index edge + watchdog | Chua co planner theo time-window thong nhat |
| Queue model | Chua ro rang, trigger rời rạc | Thieu queue dedupe + single-flight explicit |
| Observability | Co status text backfilling | Chua co metrics scheduler de audit |
| Test coverage | Type-check pass | Chua co unit test planner/queue ring-fence |

---

## Milestone roadmap

### TWL-1: Planner foundation

Muc tieu:
- Tao bo pure functions tinh target window, loaded window, missing segments.

Artifacts:
- `src/demo/historyWindowPlanner.ts`
- `src/demo/__tests__/historyWindowPlanner.test.ts`

DoD:
- [ ] Co full function signatures theo spec
- [ ] 12+ test cases planner pass
- [ ] Type-check pass

Gate M1:
- `npm run type-check`
- `npm test -- src/demo/__tests__/historyWindowPlanner.test.ts`

---

### TWL-2: Fetch queue engine

Muc tieu:
- Tao queue engine co dedupe, single-flight, generation invalidation.

Artifacts:
- `src/demo/historyFetchQueue.ts`
- `src/demo/__tests__/historyFetchQueue.test.ts`

DoD:
- [ ] Queue item LEFT/RIGHT duoc dedupe dung
- [ ] Lock single-flight hoat dong dung
- [ ] No-progress handling co stop reason

Gate M2:
- `npm run type-check`
- `npm test -- src/demo/__tests__/historyFetchQueue.test.ts`

---

### TWL-3: Wire vao LibraryShowcaseDemo

Muc tieu:
- Thay trigger scattered bang planner + queue runtime.

Artifacts:
- `src/demo/LibraryShowcaseDemo.tsx`

DoD:
- [ ] On init call `scheduleForViewport`
- [ ] On pan/zoom/range-change cung call scheduler
- [ ] Worker consume queue va merge bars an toan
- [ ] Khong crash replay path

Gate M3:
- `npm run type-check`
- `npm test -- src/demo/__tests__/chartRange.test.ts`
- `npm test -- src/demo` (subset lien quan)

---

### TWL-4: Stabilization and audit closeout

Muc tieu:
- Tune tham so + smoke + hoan tat artifacts governance.

Artifacts:
- `docs/upgrade-standard/AUDIT_LEDGER.md`
- `module_tree_full.md`

DoD:
- [ ] 1h va 15m khong kep cung 1000 bars
- [ ] Pan/zoom/span tai du lieu on dinh
- [ ] Khong duplicate storm request
- [ ] Evidence day du theo audit protocol

Gate M4:
- `npm run type-check`
- `npm test`
- `npm run build:docs`
- Browser smoke TWL-S01..TWL-S10 PASS
- `python scripts/generate_module_tree.py`

---

## Dependency graph

TWL-1 -> TWL-2 -> TWL-3 -> TWL-4

Khong co fast-track skip gate.

---

## Commit plan

- Commit 1: `TWL-1 planner foundation`
- Commit 2: `TWL-2 queue engine`
- Commit 3: `TWL-3 integrate scheduler into demo shell`
- Commit 4: `TWL-4 tuning, tests, audit artifacts`

Moi commit push ngay branch `dev`.

---

## Risks and mitigations

| Risk | Muc do | Mitigation |
|---|---|---|
| Request storm khi pan nhanh | High | queue dedupe + single-flight + throttle tick |
| No-progress do API tra trung page | High | oldestReturnedTs guard + NO_PROGRESS stop |
| Race khi doi timeframe | Medium | generation invalidation discard response cu |
| Regression replay mode | Medium | replay guard + integration tests |
| Performance drop | Medium | gioi han max pages/job + profiler smoke |

---

## Open assumptions (da khoa cho team code)

1. Adapter Binance tiep tuc ho tro backward theo `endTime = timestamp - 1`.
2. Team code duoc phep tao 2 file utility moi trong `src/demo/`.
3. Khong can doi API contract public cua widget.
