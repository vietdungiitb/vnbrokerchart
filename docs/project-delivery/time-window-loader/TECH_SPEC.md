# Technical Specification — Time-Window Data Loader (Slice TWL)

Version: 1.0  
Ngay: 2026-05-11

---

## 1. Problem statement

Hien tai co nhieu co che trigger backfill (domain edge, range edge, warmup), nhung van co rui ro:
- Hanh vi khong on dinh khi pan clamp/zoom span thay doi nhanh.
- Scheduler hien tai khong mo ta ro muc tieu coverage theo thoi gian.
- Kho kiem soat duplicate request/no-progress va kho audit.

Muc tieu TWL: dung 1 mo hinh duy nhat dua tren viewport time-window + queue.

---

## 2. Core model

### 2.1 Definitions

- Viewport window: `V = [tStart, tEnd]`
- View width: `W = max(1, tEnd - tStart)`
- Target coverage: `T = [tStart - alpha*W, tEnd + beta*W]`
- Loaded coverage: `L = [lMin, lMax]` tinh tu `liveData`

Default constants:
- `alphaLeftPrefetch = 2.0`
- `betaRightPrefetch = 0.5`
- `maxBackwardPagesPerJob = 8`
- `maxForwardPagesPerJob = 2`
- `pageLimit = 1000`
- `schedulerTickMs = 250`

### 2.2 Missing segments

- Missing left neu `T.left < L.left`
- Missing right neu `T.right > L.right`

Segments tao queue items:
- `LEFT_FETCH(targetTs = T.left)`
- `RIGHT_FETCH(targetTs = T.right)`

Priority:
- LEFT_FETCH = high
- RIGHT_FETCH = medium

---

## 3. Data contracts

Khong doi `DataAdapter` public contract.

Su dung lai:
- `getBars({ type: "backward", timestamp })`
- `getBars({ type: "forward", timestamp: null })`

No-progress guard bat buoc:
- backward page hop le khi oldestReturnedTs < previousEarliestTs
- neu khong hop le -> stop job va mark `NO_PROGRESS`

---

## 4. Runtime architecture

### 4.1 New modules

1. `src/demo/historyWindowPlanner.ts`
- Pure functions:
  - `computeTargetWindow(viewport, options)`
  - `computeLoadedWindow(data)`
  - `computeMissingSegments(target, loaded)`
  - `shouldScheduleFetch(prevPlan, nextPlan)`

2. `src/demo/historyFetchQueue.ts`
- Queue engine:
  - enqueue / dedupe / dequeue
  - single-flight lock
  - cancellation token by generation
  - metrics snapshot

### 4.2 LibraryShowcaseDemo integration

Trong `src/demo/LibraryShowcaseDemo.tsx`:
- Thay trigger scattered bang scheduler pipeline:
  1. On init: set viewport + call `scheduleForViewport`
  2. On visible domain change
  3. On visible range change
  4. On chart range button change
- Worker loop chay theo tick, consume queue item theo priority.
- Sau moi page merge:
  - update `liveData`
  - recompute loaded coverage
  - neu da phu target thi close job

### 4.3 State machine

States:
- `IDLE`
- `PLANNING`
- `QUEUED`
- `FETCHING_LEFT`
- `FETCHING_RIGHT`
- `SETTLED`
- `NO_PROGRESS`
- `ERROR`

Transitions:
- viewport event -> `PLANNING`
- missing segments -> `QUEUED`
- worker consume LEFT -> `FETCHING_LEFT`
- worker consume RIGHT -> `FETCHING_RIGHT`
- completed target -> `SETTLED`
- no-progress guard -> `NO_PROGRESS`
- exception -> `ERROR`

---

## 5. Concurrency and race safety

1. Single-flight per `(adapter,symbol,timeframe)`
- New request cung key khong spawn worker moi.

2. Generation-based invalidation
- Khi symbol/timeframe/adapter doi -> tang generation.
- Worker page response generation cu bi discard.

3. Queue dedupe
- LEFT target moi chi update target cu (lay min timestamp)
- RIGHT target moi chi update target cu (lay max timestamp)

4. Replay mode guard
- Neu replay mode lock data thi scheduler tam dung queue.

---

## 6. Parameter tuning guidelines

Muc tieu truoc:
- 1h timeframe: after init + scheduler settle, tong bars >= 5000 trong dieu kien API co du lieu.
- Pan left lien tuc khong giat, khong loop vo han.

Rules:
- Neu request rate cao -> giam `maxBackwardPagesPerJob` truoc khi giam alpha.
- Neu user van gap loading muon -> tang alphaLeftPrefetch len 3.0.
- Khong doi pageLimit > 1000 (gioi han Binance).

---

## 7. Logging and observability (dev-only)

Them logger helper (khong UI text):
- scheduler plan: viewport, target, loaded, missing
- queue ops: enqueue/dequeue/dedupe
- worker page stats: requestedTs, oldest/newest returned, mergedDelta
- stop reason: TARGET_REACHED, EMPTY_PAGE, NO_PROGRESS, MAX_PAGES, ERROR

Log gating:
- chi bat khi `process.env.NODE_ENV !== "production"`.

---

## 8. Acceptance criteria

1. Functional
- Init khong con kep cung 1000 bars khi API co du lieu lich su.
- Pan/zoom/span bat ky deu kich hoat planner dung theo viewport.
- Khong co duplicate backfill storm.

2. Performance
- Main thread khong block > 16ms/frame do scheduler.
- Khong co memory growth bat thuong sau 5 phut pan/zoom.

3. Quality
- Unit test planner + queue pass.
- Regression tests cho khung 15m va 1h pass.
- Type-check pass.

---

## 9. Rollback plan

Neu TWL gay regression:
1. Disable scheduler bang feature flag local `ENABLE_TIME_WINDOW_LOADER=false`.
2. Fallback ve warmup + edge-backfill hien tai.
3. Ghi ro rollback evidence vao AUDIT_LEDGER.
