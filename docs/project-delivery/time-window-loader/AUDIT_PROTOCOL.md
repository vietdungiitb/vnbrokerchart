# Audit Protocol — Time-Window Data Loader (Slice TWL)

Version: 1.0  
Ngay: 2026-05-11

---

## 1. Validation commands

```bash
npm run type-check
npm test
npm run build:docs
python scripts/generate_module_tree.py
```

---

## 2. Unit test matrix

| ID | Scope | Test file | Loai |
|---|---|---|---|
| TWL-U01 | computeTargetWindow basic | `src/demo/__tests__/historyWindowPlanner.test.ts` | Unit |
| TWL-U02 | computeTargetWindow width=0 clamp | `src/demo/__tests__/historyWindowPlanner.test.ts` | Unit |
| TWL-U03 | computeLoadedWindow empty | `src/demo/__tests__/historyWindowPlanner.test.ts` | Unit |
| TWL-U04 | computeLoadedWindow multi bars | `src/demo/__tests__/historyWindowPlanner.test.ts` | Unit |
| TWL-U05 | missing left only | `src/demo/__tests__/historyWindowPlanner.test.ts` | Unit |
| TWL-U06 | missing right only | `src/demo/__tests__/historyWindowPlanner.test.ts` | Unit |
| TWL-U07 | missing both sides | `src/demo/__tests__/historyWindowPlanner.test.ts` | Unit |
| TWL-U08 | no missing | `src/demo/__tests__/historyWindowPlanner.test.ts` | Unit |
| TWL-U09 | queue dedupe LEFT target | `src/demo/__tests__/historyFetchQueue.test.ts` | Unit |
| TWL-U10 | queue dedupe RIGHT target | `src/demo/__tests__/historyFetchQueue.test.ts` | Unit |
| TWL-U11 | priority LEFT over RIGHT | `src/demo/__tests__/historyFetchQueue.test.ts` | Unit |
| TWL-U12 | single-flight lock | `src/demo/__tests__/historyFetchQueue.test.ts` | Unit |
| TWL-U13 | generation invalidation | `src/demo/__tests__/historyFetchQueue.test.ts` | Unit |
| TWL-U14 | stop NO_PROGRESS | `src/demo/__tests__/historyFetchQueue.test.ts` | Unit |
| TWL-U15 | stop TARGET_REACHED | `src/demo/__tests__/historyFetchQueue.test.ts` | Unit |
| TWL-U16 | stop MAX_PAGES | `src/demo/__tests__/historyFetchQueue.test.ts` | Unit |

---

## 3. Browser smoke checklist

Server: serve `build/index.html` qua HTTP (`http://127.0.0.1:<port>/index.html`).

### TWL-S01: Init coverage
- [ ] Mo BTCUSDT 1h
- [ ] Header bars > 1000 sau khi settle

### TWL-S02: Pan left sustained
- [ ] Keo trai lien tuc 3 lan
- [ ] Moc thoi gian lui them, khong dung cung

### TWL-S03: Zoom out trigger
- [ ] Zoom out manh
- [ ] Planner schedule LEFT fetch dung theo viewport moi

### TWL-S04: Zoom in no storm
- [ ] Zoom in lien tuc
- [ ] Khong tao request duplicate storm

### TWL-S05: Span via range button
- [ ] Chuyen 5D -> 1M -> 3M
- [ ] Data duoc phu du theo target window moi

### TWL-S06: Timeframe switch
- [ ] 15m -> 1h -> 4h
- [ ] Generation cu bi huy, khong mix du lieu sai timeframe

### TWL-S07: Right edge freshness
- [ ] O gan right edge
- [ ] Forward poll van cap nhat candle moi binh thuong

### TWL-S08: Replay safety
- [ ] Bat/tat replay mode
- [ ] Khong crash, scheduler khong pha replay logic

### TWL-S09: Error handling
- [ ] Gia lap adapter error
- [ ] State ve `error` ro rang, khong loop vo han

### TWL-S10: Performance sanity
- [ ] Pan/zoom trong 2 phut
- [ ] Khong freeze UI, fps chap nhan duoc

---

## 4. Evidence template cho AUDIT_LEDGER

```
=== TWL Milestone [M1|M2|M3|M4] ===
Ngay:
Nguoi thuc hien:

Scope:
  Slice TWL-[x..y]

Files tao moi:
  - src/demo/historyWindowPlanner.ts
  - src/demo/historyFetchQueue.ts
  - src/demo/__tests__/historyWindowPlanner.test.ts
  - src/demo/__tests__/historyFetchQueue.test.ts

Files sua:
  - src/demo/LibraryShowcaseDemo.tsx
  - docs/project-delivery/IMPLEMENTATION_PLAN.md

Behavioral change:
  [Mo ta hanh vi viewport-driven scheduler]

Validation:
  npm run type-check -> PASS
  npm test -> PASS
  npm run build:docs -> PASS
  module_tree_full.md -> regenerated

Browser smoke:
  TWL-S01 -> PASS
  ...
  TWL-S10 -> PASS

Residual risk:
  - [neu con]
```

---

## 5. Reject criteria

Fail gate neu co bat ky dieu nao sau:
1. Bars van co kha nang kep cung 1000 trong 1h/15m khi API co du lieu.
2. Duplicate request storm (network requests tang dot bien khi pan).
3. Mix bars sai timeframe sau khi switch timeframe.
4. Khong co evidence modified file list trong AUDIT_LEDGER.
