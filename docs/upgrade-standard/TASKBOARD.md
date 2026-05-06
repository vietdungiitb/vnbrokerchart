# Taskboard: TypeScript Migration Delivery Board (v3.0)

## 1. Board rules

- Chỉ kéo task sang `In progress` khi slice trước đã có evidence trong AUDIT_LEDGER.
- Mỗi task phải map về đúng slice trong IMPLEMENTATION_PLAN.
- **Gate G1 phải pass trước khi bắt đầu Giai đoạn 2.**
- **Gate G2 phải pass trước khi bắt đầu Giai đoạn 3.**
- Mọi file được rename `.js → .ts/.tsx` phải được ghi vào AUDIT_LEDGER.
- Task ở lane `READY` hoặc task đã được duyệt trong `docs/CHANGE_CONTROL_STANDARD.md` có thể code theo plan mà không cần hỏi lại quyết định đã chốt, miễn là không có xung đột với governance hoặc quality.

---

## 2. Done lane — S0–S16 (chu kỳ trước)

| ID | Task | Owner role | Evidence |
| :--- | :--- | :--- | :--- |
| TB-01 | Chốt baseline type-check và blocker list | Platform lead | AUDIT_LEDGER S0 |
| TB-02 | Generate module tree và inventory | Platform lead | `module_tree_full.md` (319 → 323 modules) |
| TB-03 | Chuẩn hoá typings nền tảng | Tooling owner | `@types` packages installed; `src/lib/types.ts` added |
| TB-04 | Tạo shared domain types | Core owner | `src/lib/types.ts` |
| TB-05 | Sweep React 19 blockers | Core owner | Zero legacy context API / `findDOMNode` |
| TB-06 | Type hoá core chart engine | Core owner | `ChartCanvas.tsx`, `StockChartContext.tsx` |
| TB-07 | Sửa helper responsive/ref path | Infrastructure owner | `fitDimensions` không dùng `findDOMNode` |
| TB-08 | Migrate utils và scale (partial) | Infrastructure owner | Utilities/scale compile |
| TB-09 | Migrate series primitives batch 1 | Visual primitives owner | `BarSeries` / `CandlestickSeries` / `LineSeries` |
| TB-10 | Migrate series primitives batch 2 | Visual primitives owner | `RSI` / `MACD` / `StraightLine` |
| TB-11 | Migrate axes và coordinates | Visual primitives owner | XAxis/YAxis/Cursor render |
| TB-12 | Migrate tooltips | Visual primitives owner | Tooltip layer render |
| TB-13 | Migrate interactive layer | Interaction owner | Brush/TrendLine smoke pass |
| TB-14 | Restore FullDemo và LiveDemo | Demo owner | Demo bundle renders offline |
| TB-15 | Add final audit artifacts | QA owner | Audit ledger, slice audit, module tree updated |
| TB-16 | Làm đẹp demo landing page | Demo owner | Live/local source toggle stable |
| TB-17 | Sửa wheel listener passive | Interaction owner | Native wheel listener zoom OK |
| TB-18 | Thu gọn chart layout | Demo owner | Chart + brush fit viewport |
| TB-19 | Purge toàn bộ legacy D3/lifecycle | Core + Interaction owners | Zero d3-collection, d3Event, componentWillMount |
| TB-20 | Chốt backlog và bàn giao S0-S13 | Release owner | Open items = 0 |
| TB-21 | Fix zoom/pan runtime bug | Core owner | AUDIT_LEDGER S15 |
| TB-22 | Fix panel layout overviewHeight | Demo owner | AUDIT_LEDGER S15 |
| TB-23 | Migrate `src/lib/utils/` (15 files) | Infrastructure owner | AUDIT_LEDGER S16 |

---

## 3. Done lane — Giai đoạn 1 (S17)

| ID | Task | Owner role | Backlog IDs | Evidence |
| :--- | :--- | :--- | :--- | :--- |
| TB-24 | Migrate `src/lib/scale/` (5 files) | Infrastructure owner | B-102 | S17 completed; scale engine typed |
| TB-25 | Migrate `src/lib/helper/` (5 files) | Infrastructure owner | B-103 | S17 completed; fitWidth/fitDimensions typed |
| TB-26 | Migrate `src/lib/calculator/` (20 files) | Infrastructure owner | B-104 | S17 completed; calculator math typed |
| TB-27 | Migrate `src/index.js` | Infrastructure owner | B-105 | S17 completed; public API exports typed |
| TB-28 | Gate G1 validation | QA owner | B-106 | S17 completed; type-check + build:docs pass |

---

## 4. Done lane — Giai đoạn 2 (S18–S19)

| ID | Task | Owner role | Backlog IDs | Evidence |
| :--- | :--- | :--- | :--- | :--- |
| TB-29 | Migrate `src/lib/series/` còn lại (~24 files) | Visual primitives owner | B-107 | S18 completed: TSX added; JS duplicates removed |
| TB-30 | Migrate `src/lib/axes/` (7 files) | Visual primitives owner | B-108 | S18 completed: TSX added; JS duplicates removed |
| TB-31 | Migrate `src/lib/coordinates/` (11 files) | Visual primitives owner | B-109 | S19 completed: coordinates TSX added; JS duplicates removed |
| TB-32 | Migrate `src/lib/tooltip/` (13 files) | Visual primitives owner | B-110 | S19 completed: tooltip TSX added; JS duplicates removed |
| TB-33 | Migrate `src/lib/annotation/` (6 files) | Visual primitives owner | B-111 | S19 completed: annotation TSX added; JS duplicates removed |

---

## 5. Done lane — Gate G2 (S20)

| ID | Task | Owner role | Backlog IDs | Evidence |
| :--- | :--- | :--- | :--- | :--- |
| TB-34 | Gate G2 validation | QA owner | B-112 | S20 completed; type-check + build:docs pass; browser smoke pass |

---

## 6. Ready lane — Giai đoạn 3 (sau Gate G2)

| ID | Task | Owner role | Backlog IDs | Dependency |
| :--- | :--- | :--- | :--- | :--- |
| TB-35 | Migrate `src/lib/indicator/` (21 files) | Indicator owner | B-113 | Gate G2 |
| TB-36 | Migrate `src/lib/interactive/` (22 files) | Interaction owner | B-114 | Gate G2 |
| TB-37 | Migrate `EventCapture.js` | Interaction owner | B-115 | TB-36 |
| TB-38 | Migrate `CanvasContainer.js` | Core owner | B-116 | Gate G2 |
| TB-39 | Migrate `BackgroundText.js` + `ZoomButtons.js` | Core owner | B-117, B-118 | Gate G2 |
| TB-40 | Gate G3 + Final 100% TS validation | QA/Release owner | B-119–121 | TB-35–39 |

---

## 7. Ready lane — Drawing Tools Engine (M1/M2/M3)

*Tham chiếu: `docs/upgrade-standard/drawing-tools/TASKBOARD.md` cho chi tiết từng task DT-01–DT-28.*

### Milestone M1 — Core Drawing Engine

| ID | Task | Owner role | Backlog ref | Depends on |
| :--- | :--- | :--- | :--- | :--- |
| TB-41 | Tạo `coordinateUtils.ts` | Drawing core | B-130 | — |
| TB-42 | Tạo `renderSvg.ts` | Drawing render | B-131 | TB-41 |
| TB-43 | Tạo `useDrawingInteraction.ts` | Drawing core | B-132 | — |
| TB-44 | Tạo `DrawingLayer.tsx` | Drawing UI | B-133 | TB-41, TB-42, TB-43 |
| TB-45 | Tạo `rectangle.ts` + `arrow.ts` built-ins | Drawing core | B-135 | — |
| TB-46 | Sửa `types.ts` (M1 extension) | Drawing core | B-130 | TB-45 |
| TB-47 | Sửa `drawing/index.ts` (M1 exports) | Drawing core | B-130 | TB-44, TB-45, TB-46 |
| TB-48 | Wire `LibraryShowcaseDemo.tsx` + keyboard | Demo | B-134 | TB-44, TB-47 |
| TB-49 | Sửa `i18n.tsx` + `demo.css` (M1 keys) | Demo | B-134 | TB-48 |
| TB-50 | Gate M1 validation (type-check + test + smoke) | QA | B-134 | TB-41–TB-49 |

### Milestone M2 — Inspector + Persistence

| ID | Task | Owner role | Backlog ref | Depends on |
| :--- | :--- | :--- | :--- | :--- |
| TB-51 | Tạo `DrawingStorage.ts` | Drawing data | B-137 | TB-50 |
| TB-52 | Tạo `useDrawingStorage.ts` | Drawing data | B-137 | TB-51 |
| TB-53 | Tạo `DrawingInspector.tsx` | Drawing UI | B-136 | TB-50 |
| TB-54 | Sửa `types.ts` + `drawing/index.ts` (M2) | Drawing core | B-137 | TB-51 |
| TB-55 | Wire M2 vào `LibraryShowcaseDemo.tsx` | Demo | B-136, B-137 | TB-52, TB-53, TB-54 |
| TB-56 | Sửa `i18n.tsx` + `demo.css` (M2 keys) | Demo | B-136 | TB-55 |
| TB-57 | Gate M2 validation | QA | B-136, B-137 | TB-51–TB-56 |

### Milestone M3 — Advanced Tools

| ID | Task | Owner role | Backlog ref | Depends on |
| :--- | :--- | :--- | :--- | :--- |
| TB-58 | Sửa `types.ts` M3 (3 tool types, riskReward) | Drawing core | B-138 | TB-57 |
| TB-59 | Tạo `priceRange.ts`, `positionBox.ts`, `fibExtension.ts` | Drawing core | B-138 | TB-58 |
| TB-60 | Sửa `renderSvg.ts` + `DrawingLayer.tsx` (M3) | Drawing render | B-138, B-139 | TB-59 |
| TB-61 | Wire M3 vào `LibraryShowcaseDemo.tsx` + toolbar groups | Demo | B-138, B-139 | TB-60 |
| TB-62 | Sửa `i18n.tsx` + `demo.css` (M3 keys) | Demo | B-139 | TB-61 |
| TB-63 | Gate M3 validation | QA | B-138, B-139 | TB-58–TB-62 |
