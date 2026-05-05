# Audit Ledger: Canonical Delivery Register (v3.0)

Tài liệu này là đăng ký duy nhất cho trạng thái delivery, file đã sửa, và gates từng slice. Phải cập nhật liên tục trong quá trình migration.

## 1. Canonical File Register

| File | Mục đích | Trạng thái |
| :--- | :--- | :--- |
| [TECH_SPEC.md](TECH_SPEC.md) | Đặc tả kỹ thuật và target shape | Updated v3.0 |
| [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) | Hướng dẫn chiến thuật cho developer | Updated v3.0 |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Kế hoạch triển khai theo slice | Updated v3.0 |
| [TASKBOARD.md](TASKBOARD.md) | Bảng công việc hàng ngày | Updated v3.0 |
| [BACKLOG.md](BACKLOG.md) | Đăng ký backlog đầy đủ | Updated v3.0 |
| [SLICE_AUDIT.md](SLICE_AUDIT.md) | Template audit và evidence từng slice | Updated v3.0 |
| [AUDIT_LEDGER.md](AUDIT_LEDGER.md) | Ledger này | Updated v3.0 |
| [HANDOFF_MANIFEST.md](HANDOFF_MANIFEST.md) | Entry point bàn giao | Updated v3.0 |
| [DELIVERY_CLOSEOUT.md](DELIVERY_CLOSEOUT.md) | Báo cáo đóng delivery | Updated v3.0 |
| [widget/HANDOFF_MANIFEST.md](../project-delivery/widget/HANDOFF_MANIFEST.md) | Entry point Slice F — VNStockChart widget boundary | Created 2026-05-05 |
| [widget/TECH_SPEC.md](../project-delivery/widget/TECH_SPEC.md) | Props contract, i18n fallback, adapter lifecycle | Created 2026-05-05 |
| [widget/IMPLEMENTATION_PLAN.md](../project-delivery/widget/IMPLEMENTATION_PLAN.md) | Tasks F-01→F-09 với dependency chain | Created 2026-05-05 |
| [widget/TASKBOARD.md](../project-delivery/widget/TASKBOARD.md) | Bảng task chi tiết + DoD | Created 2026-05-05 |
| [widget/AUDIT_PROTOCOL.md](../project-delivery/widget/AUDIT_PROTOCOL.md) | Test matrix W-01→W-18 + gate commands + evidence template | Created 2026-05-05 |

## 2. Slice Status

### Tài liệu bàn giao — Slice F: VNStockChart Widget Boundary Extraction

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: Tạo bộ tài liệu đầy đủ cho Slice F theo chuẩn governance, sẵn sàng bàn giao cho đội code thực hiện
- Files tạo mới:
  - `docs/project-delivery/widget/HANDOFF_MANIFEST.md`
  - `docs/project-delivery/widget/TECH_SPEC.md`
  - `docs/project-delivery/widget/IMPLEMENTATION_PLAN.md`
  - `docs/project-delivery/widget/TASKBOARD.md`
  - `docs/project-delivery/widget/AUDIT_PROTOCOL.md`
  - `src/widget/i18n/types.ts`
- Files sửa:
  - `docs/project-delivery/IMPLEMENTATION_PLAN.md` — Slice F section mở rộng với task table + props contract + exit criteria
  - `docs/project-delivery/TASKBOARD.md` — PD-06 status → READY
  - `docs/project-delivery/HANDOFF_MANIFEST.md` — thêm widget docs vào manifest table
  - `docs/upgrade-standard/AUDIT_LEDGER.md` — thêm widget docs vào canonical register
- Nội dung bàn giao:
  - **HANDOFF_MANIFEST**: Done definition 4 milestone M1→M4, constraint tuyệt đối, trạng thái as-built
  - **TECH_SPEC**: `VNStockChartProps` contract đầy đủ, i18n fallback chain, adapter lifecycle pattern (useEffect + AbortController), Error Boundary + Empty State spec, ranh giới import
  - **IMPLEMENTATION_PLAN**: 9 tasks F-01→F-09 với code skeleton chi tiết, gate từng task
  - **TASKBOARD**: DoD chi tiết từng task, dependency chain, key coverage audit script
  - **AUDIT_PROTOCOL**: ma trận test W-01→W-18, architecture guard G-01→G-03, export checks E-01→E-05, smoke checklist 10 bước, evidence template, rejection criteria
- Validation:
  - Documentation alignment review → PASS

### Đã hoàn thành (S0–S16)

| Slice | Status | Gate owner | Evidence summary |
| :--- | :--- | :--- | :--- |
| S0 Baseline & inventory | ✅ Completed | Platform lead | Module tree 319 modules; blocker list captured |
| S1 Tooling & typing baseline | ✅ Completed | Tooling owner | @types installed; types.ts created |
| S2 React 19 blockers | ✅ Completed | Core owner | Zero contextTypes/findDOMNode |
| S3 Core chart engine | ✅ Completed | Core owner | ChartCanvas.tsx, GenericComponent.tsx typed |
| S4 Utilities / scale / helper | ✅ Completed | Infrastructure owner | d3-collection removed; utils compile |
| S5 Series / axes / coordinates / tooltip | ✅ Completed | Visual primitives owner | Primitives compile and render |
| S6 Interactive layer | ✅ Completed | Interaction owner | Brush/TrendLine smoke pass |
| S7 Demo restoration | ✅ Completed | Demo owner | FullDemo + LiveDemo + offline fallback |
| S8 Final validation | ✅ Completed | QA / release owner | type-check + build pass |
| S9 Demo landing polish | ✅ Completed | Demo owner | Responsive landing page |
| S10 Interaction wheel fix | ✅ Completed | Interaction owner | Native wheel listener; no passive warning |
| S11 Chart visibility fix | ✅ Completed | Demo owner | Chart fits viewport |
| S12 Offline BTC data refresh | ✅ Completed | Demo owner | Variable BTC dataset |
| S13 Legacy purge | ✅ Completed | Core/Interaction owners | Zero d3-collection, d3Event, legacy lifecycle |
| S14 Delivery closeout | ✅ Completed | Release owner | Open items = 0 |
| S15 Runtime bug fixes | ✅ Completed | Core/Demo owner | Zoom/brush/reset verified; panel layout fixed |
| S16 Migrate utils | ✅ Completed | Infrastructure owner | 15 utils files renamed to .ts; build + type-check pass |

### Chưa thực hiện (S21–S22) — Chương trình TS Migration v3.0

| Slice | Status | Gate owner | Required evidence |
| :--- | :--- | :--- | :--- |
| S17 Migrate scale/helper/calculator/index + Gate G1 | ✅ Completed | Infrastructure owner | 30 files renamed; Gate G1 pass; build:docs pass; 0 .js in scope |
| S18 Migrate series (còn lại) + axes | ✅ Completed | Visual primitives owner | 28 TSX files added/updated; 13 JS duplicates deleted; type-check + build:docs pass; module tree regenerated |
| S19 Migrate coordinates/tooltip/annotation | ✅ Completed | Visual primitives owner | 31 files updated; type-check + build:docs pass; module tree regenerated; no .js files remain in coordinates/tooltip/annotation |
| S20 Gate G2 | ✅ Completed | QA owner | type-check clean; build:docs pass; browser smoke pass; module tree regenerated |
| S21 Migrate indicator/interactive | ✅ Completed | Indicator/Interaction owners | Indicator + interactive sub-slices complete; type-check + build:docs pass; module tree regenerated; 0 .js in src/lib/interactive |
| S22 Migrate root files + Gate G3 + Final audit | ✅ Completed | Release owner | Root files migrated; type-check + build:docs pass; browser smoke pass; 0 file .js trong src/ |

### Ad-hoc demo task — Bar replay integration

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: nối `BarReplayController` vào demo shell, thêm replay controls, và harden chart path cho replay ngắn
- Files modified:
  - `src/lib/core/replay/BarReplayController.ts`
  - `src/lib/core/replay/BarReplayController.test.ts`
  - `src/index.ts`
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `src/demo/i18n.tsx`
  - `src/demo/demo.css`
  - `module_tree_full.md`
- Nội dung bàn giao:
  - Replay topbar controls cho rewind, step back/forward, jump latest, speed, và toggle play/pause.
  - Chart data source chuyển sang subset replay thay vì luôn dùng toàn bộ series.
  - Guard dữ liệu ngắn để replay ở đầu stream không làm crash `ChartCanvas`.
- Validation:
  - `npm run type-check` → PASS
  - `npm test -- src/lib/core/replay/BarReplayController.test.ts` → PASS
  - `npm run build:docs` → PASS
  - Browser smoke: rewind → `1/300 nến`, play toggle → `aria-pressed=true`, jump latest → `300/300 nến`

### Ad-hoc UI audit & redesign — Replay sub-toolbar + Drawing panel visibility + CSS theme alignment

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: Audit toàn bộ UI so với spec GoCharting, sửa 4 vấn đề giao diện: topbar overflow do replay cluster, drawing panels luôn hiển thị che chart, CSS không dùng CSS variables, live/offline badge màu hardcoded
- Files modified:
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `src/demo/i18n.tsx`
  - `src/demo/demo.css`
  - `module_tree_full.md`
- Nội dung bàn giao:
  - **Replay sub-toolbar**: Thay thế cụm 6 nút replay trong topbar bằng một nút toggle `▶ Phát lại`. Khi nhấn, hiện `gc-replay-bar` dưới topbar (36px strip) chứa: rewind/step-back/play-pause/step-forward/jump-latest, speed selector, tiến trình, nút close. Grid row tự điều chỉnh qua class `gc-terminal--replay-bar`.
  - **Drawing panels**: Toolbar export/import/clear và `DrawingListPanel` được ẩn mặc định (không hiển thị trên chart). Thêm nút list-icon vào sidebar trái để toggle `showDrawingList`. Chỉ render khi người dùng bật.
  - **CSS theme alignment**: Xóa màu hardcoded khỏi `.rsc-drawing-inspector`, `.rsc-drawing-list-panel`, `.rsc-drawing-storage-toolbar`, `.gc-live-badge`, `.gc-offline-badge`, `.gc-replay-menu`, `.gc-replay-menu__action`. Tất cả đổi sang `var(--gc-*)` CSS variables.
  - **i18n**: Thêm 2 key mới `replay.closeBar` và `drawing.toggleList` (vi + en).
- Audit findings addressed:
  1. ✅ Topbar không còn overflow khi replay controls xuất hiện
  2. ✅ Drawing panels không còn che chart mặc định
  3. ✅ CSS context menu, inspector, list panel dùng CSS vars - adapt theo dark/light theme
  4. ✅ Live/offline badge không còn màu hardcoded light-mode
- Validation:
  - `npm run type-check` → PASS (0 errors)
  - `npm test` → PASS (18 files, 85 tests)
  - `npm run build:docs` → PASS (webpack compiled successfully in 3739ms)
  - `python scripts/generate_module_tree.py` → PASS (655 modules)

### Ad-hoc demo task — Paper trading on replay

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: paper-trading slice cho Phase 5 replay, dùng click trên chart để mở/đóng vị thế ảo khi replay đang chạy
- Files modified:
  - `src/lib/ChartCanvas.tsx`
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `src/demo/i18n.tsx`
  - `src/demo/demo.css`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
  - `module_tree_full.md`
- Nội dung bàn giao:
  - `ChartCanvas` expose callback click cho demo qua `onClick`, không cần hack qua right-click hay tooltip.
  - Demo giữ một vị thế ảo đơn giản: click đầu tiên mở long theo bar hiện tại, click tiếp theo đóng vị thế và ghi nhận PnL.
  - Panel `Giao dịch ảo` hiển thị số lệnh, realized PnL, unrealized PnL, và entry hiện tại; chỉ hoạt động khi replay đang chạy.
  - CSS panel dùng theme variables và đặt gọn ở góc dưới trái của chart shell.
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS
  - `npm test` → PASS (18 files, 85 tests)
  - Browser smoke: replay start → click chart mở vị thế `1/300`, click lần hai đóng vị thế và panel cập nhật `Lệnh 1`, `PnL đã chốt -12.39`, `Đã đóng`

  ### Ad-hoc demo task — Paper trading report hardening

  - Người thực hiện: GitHub Copilot
  - Ngày: 2026-05-05
  - Scope: chặn race duplicate-close/journal khi replay gần kết thúc hoặc khi close path và replay-finished effect cùng chạy
  - Files modified:
    - `src/demo/LibraryShowcaseDemo.tsx`
    - `docs/upgrade-standard/AUDIT_LEDGER.md`
    - `module_tree_full.md`
  - Nội dung bàn giao:
    - Thay `paperTradePosition` state updater side-effect bằng ref-based close flow để close chỉ được ghi nhận một lần.
    - Thêm idempotency guard cho closed-trade fingerprint và giữ ref vị thế hiện tại đồng bộ với state.
    - Giữ replay paper-trade journal ổn định khi người dùng click close ở gần cuối replay và khi auto-close on replay finish chạy cùng frame.
  - Validation:
    - `npm run type-check` → PASS
    - `npm run build:docs` → PASS
    - Browser smoke: replay play → click mở vị thế → chờ replay tiến gần cuối → click đóng vị thế → `Tổng lệnh 1`, `Đã chốt`, `Báo cáo replay#1` và không còn duplicate journal

  ### Ad-hoc demo task — Indicator SSOT runtime

  - Người thực hiện: GitHub Copilot
  - Ngày: 2026-05-05
  - Scope: route demo data generation through canonical `enrichData` and remove the duplicate local indicator calculators from the legacy demo surface
  - Files modified:
    - `src/demo/demoData.ts`
    - `src/demo/OriginalLikeDemo.tsx`
    - `src/demo/FullDemo.tsx`
    - `src/lib/core/calculators/__tests__/enrichData.test.ts`
    - `docs/upgrade-standard/AUDIT_LEDGER.md`
    - `module_tree_full.md`
  - Nội dung bàn giao:
    - `getOfflineDemoData()` / `formatBinanceKlines()` / `fetchLiveDemoData()` now flow through the canonical `enrichData` pipeline with explicit default indicator keys.
    - `OriginalLikeDemo` reads EMA/MACD values from the canonical enriched payload instead of recomputing them with local indicator calculators; only the unrelated SMA volume overlay remains local.
    - `FullDemo` stays compatible with the enriched demo datum shape while preserving the existing visual behavior.
    - Added a core regression asserting the default demo indicator keys (`EMA`, `RSI`, `MACD`, `BollingerBand`) are materialized in the canonical indicator store.
  - Validation:
    - `npm run type-check` → PASS
    - `npm test -- src/lib/core/calculators/__tests__/enrichData.test.ts src/lib/core/__tests__/seriesValueResolver.test.ts` → PASS
    - `npm run build:docs` → PASS
    - Browser smoke: reload main demo shell after rebuild → PASS, no runtime regression

  ### Ad-hoc quality hardening — i18n boundary + pane restore guards

  - Người thực hiện: GitHub Copilot
  - Ngày: 2026-05-05
  - Scope: lock down two uncovered runtime-quality gaps in the demo shell and pane reducer tests
  - Files modified:
    - `src/lib/core/hooks/__tests__/useDynamicPanes.test.ts`
    - `src/demo/__tests__/i18n.test.tsx`
    - `package.json`
    - `package-lock.json`
    - `docs/upgrade-standard/AUDIT_LEDGER.md`
    - `module_tree_full.md`
  - Nội dung bàn giao:
    - Added a reducer regression proving `restorePane` re-enables a hidden pane and its nested series visibility, and another regression proving restoration is rejected once the configured visible-pane cap is already reached.
    - Added a jsdom-backed demo i18n regression that mounts `DemoI18nBoundary`, verifies language fallback from `document.documentElement.lang`, and confirms both DOM `lang` sync and localStorage persistence when switching between vi/en.
    - Added `jsdom` as a dev dependency so the runtime i18n boundary can be exercised in Vitest without introducing a larger testing stack.
  - Validation:
    - `npm test -- src/lib/core/hooks/__tests__/useDynamicPanes.test.ts src/demo/__tests__/i18n.test.tsx` → PASS (19 tests)
    - `python scripts/generate_module_tree.py` → PASS (656 modules)

  ### Ad-hoc demo task — chart range buttons

  - Người thực hiện: GitHub Copilot
  - Ngày: 2026-05-05
  - Scope: make the footer range buttons (1D/5D/1M/3M/YTD/1Y/All) actually control the visible chart window
  - Files modified:
    - `src/demo/chartRange.ts`
    - `src/demo/__tests__/chartRange.test.ts`
    - `src/demo/LibraryShowcaseDemo.tsx`
    - `src/demo/i18n.tsx`
    - `src/lib/core/hooks/__tests__/useDynamicPanes.test.ts`
    - `docs/upgrade-standard/AUDIT_LEDGER.md`
    - `module_tree_full.md`
  - Nội dung bàn giao:
    - Added a dedicated chart-range helper that converts the footer presets into real `xExtents` windows and clamps them to the available dataset.
    - Wired the footer buttons to `selectedRange` state, `aria-pressed`, and the active CSS state so clicking a button now changes the viewport instead of acting as a static label.
    - Added focused regression coverage for the helper's default five-day window, YTD clamping, and full-range behavior.
    - Kept the range labels on the existing Vietnamese/English i18n surface so the footer remains localized-consistent with the rest of the demo shell.
  - Validation:
    - `npm test -- src/demo/__tests__/chartRange.test.ts src/demo/__tests__/i18n.test.tsx` → PASS (4 tests)
    - `npm run type-check` → PASS
    - `npm run build:docs` → PASS
    - Browser smoke: click `1D` in the footer and confirm `aria-pressed=true` / active class moved from `5D` to `1D`

### Ad-hoc documentation package — delivery handoff standard

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: chuẩn hóa bộ tài liệu bàn giao để đội code nhận việc không cần hỏi lại
- Files modified:
  - `docs/project-delivery/HANDOFF_MANIFEST.md`
  - `docs/project-delivery/PROJECT_GOVERNANCE.md`
  - `docs/project-delivery/TECH_SPEC.md`
  - `docs/project-delivery/IMPLEMENTATION_PLAN.md`
  - `docs/project-delivery/TASKBOARD.md`
  - `docs/project-delivery/BACKLOG.md`
  - `docs/project-delivery/AUDIT_PROTOCOL.md`
  - `docs/project-delivery/HANDOFF_CHECKLIST.md`
  - `quality/QUALITY.md`
  - `quality/RUN_SPEC_AUDIT.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
- Nội dung bàn giao:
  - Roadmap được chốt lại theo trạng thái thật: SSOT runtime và quality hardening đã DONE; historical market data fidelity được đưa lên READY; widget boundary extraction giữ ở TODO.
  - Taskboard/backlog được sắp lại để ưu tiên dữ liệu lịch sử Binance thật, backfill, và source fidelity thay vì để các mục đã xong còn treo ở READY/TODO.
  - Tech spec, governance, audit protocol, checklist, và quality docs đều bổ sung ràng buộc cho market data fidelity, range buttons, backfill, và smoke evidence.
  - Audit package giờ nêu rõ modified file list, validation expectations, và smoke checks mà đội code / QA phải có khi chạm dữ liệu thị trường.
- Validation:
  - Documentation alignment review → PASS

### Demo cleanup — remove duplicate topbar timeframe chips

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: gỡ 1D/1W khỏi topbar timeframe chips vì footer range bar đã giữ các preset viewport tương ứng
- Files modified:
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
  - `module_tree_full.md`
- Nội dung bàn giao:
  - Thu hẹp `TIMEFRAMES` trong topbar để chỉ còn các chip intraday; không đụng vào footer range bar.
  - Giữ nguyên state `timeframe` và data fetch path, nên thay đổi chỉ là loại bỏ nút trùng trong UI.
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS
  - Browser smoke on [build/index.html](../../build/index.html) → PASS; topbar shows `1m/3m/5m/15m/30m/1h/4h`, footer still shows `1D/5D/1M/3M/YTD/1Y/All`
  - `python scripts/generate_module_tree.py` → PASS (Modules: 658)

### Ad-hoc demo task — Bar replay from here

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: right-click context menu trên chart để replay từ bar đang trỏ
- Files modified:
  - `src/lib/ChartCanvas.tsx`
  - `src/lib/core/DynamicChart.tsx`
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `src/demo/i18n.tsx`
  - `src/demo/demo.css`
- Nội dung bàn giao:
  - `ChartCanvas` gọi thẳng callback right-click của demo với `currentItem` và `currentCharts`.
  - Demo hiển thị context menu nhẹ “Phát lại từ đây” tại bar được trỏ.
  - Chọn menu item sẽ `jumpToDate()` rồi `play()` từ bar đó.
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS
  - Browser smoke: right-click hiện menu `29/04/2026 16:00`, chọn action làm replay về `161/300 nến`, `aria-pressed=true`

### Ad-hoc documentation package — GoCharting-style settings dialog rewrite

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: settings modal / pane inspector documentation alignment for the dynamic-pane rewrite
- Files modified:
  - `docs/planning/S5_SETTINGS_DIALOG_SPEC.md`
  - `docs/planning/S5_SETTINGS_PANEL_SPEC.md`
  - `docs/planning/INDICATOR_VISIBILITY_PLAN.md`
  - `docs/planning/DYNAMIC_PANE_SYSTEM.md`
  - `docs/planning/AUDIT_EVIDENCE_TEMPLATE.md`
  - `docs/TypeScript/ARCHITECTURE.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
- Nội dung bàn giao:
  - Modal settings dialog with top-right gear icon near theme toggle.
  - Pane-local indicator editor with mandatory `left` / `right` Y-axis selection.
  - Configurable `maxVisiblePanes` persisted in demo settings.
  - Optional multi-template indicator support documented as a stretch path.
- Validation:
  - Documentation alignment review → PASS

### Ad-hoc documentation package — Indicator SSOT policy

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: lưu trữ quyết định kiến trúc về SSOT cho indicator data để dùng làm chuẩn phát triển và code review
- Files modified:
  - `docs/planning/INDICATOR_SSOT_POLICY.md`
  - `docs/planning/ARCHITECTURE_GUIDE.md`
  - `docs/planning/IMPLEMENTATION_PLAN.md`
  - `docs/planning/DYNAMIC_PANE_SYSTEM.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
- Nội dung bàn giao:
  - Xác nhận indicator không phải nguồn dữ liệu riêng mà là phép chiếu từ cùng `RawOHLCV` hoặc transform đã phê duyệt.
  - Chốt rule canonical identity cho indicator theo `source + timeframe + transform + type + params`.
  - Chốt yêu cầu chart, tooltip, yExtents, computed values và settings phải cùng đọc một canonical series.
  - Ghi lại anti-pattern bị cấm và acceptance checks bắt buộc cho các thay đổi sau này.
- Validation:
  - Documentation alignment review → PASS

### Ad-hoc documentation amendment — Indicator SSOT visual invariance example

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: làm rõ bằng ví dụ trực quan rằng cùng indicator trên cùng nguồn phải trùng X timeline và Y value ở mọi pane
- Files modified:
  - `docs/planning/INDICATOR_SSOT_POLICY.md`
  - `docs/planning/DYNAMIC_PANE_SYSTEM.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
- Nội dung bàn giao:
  - Bổ sung ví dụ chuẩn với `BTCUSDT` Binance để chốt rằng cùng indicator ở 2 pane phải trùng timestamp trên trục X.
  - Chốt thêm rằng giá trị Y tại cùng timestamp phải giống nhau tuyệt đối; khác biệt hợp lệ chỉ là pane height hoặc y-scale tick spacing.
  - Nâng acceptance checks để QA có thể bắt lỗi lệch hình, lệch timestamp hoặc lệch value giữa các pane.
- Validation:
  - Documentation alignment review → PASS

### Ad-hoc demo task — GoCharting settings modal implementation

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: gear-icon settings modal, pane-local indicator editing, and dynamic-pane runtime wiring
- Files modified:
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `src/demo/PaneSettingsModal.tsx`
  - `src/demo/demo.css`
  - `src/lib/core/hooks/useDynamicPanes.ts`
  - `module_tree_full.md`
- Nội dung bàn giao:
  - Gear icon đặt cạnh theme toggle để mở modal cài đặt GoCharting-style.
  - Composer chỉ báo bắt buộc chọn trục Y trái/phải trước khi thêm.
  - `maxVisiblePanes` được persist và đồng bộ với layout động của pane.
  - Modal được Việt hóa đầy đủ và có CSS riêng cho backdrop, navigation, panel, và responsive layout.
- Validation:
  - `npm run type-check` → PASS
  - `npm run test` → PASS
  - `python scripts/generate_module_tree.py` → PASS (Modules: 620)

### Ad-hoc documentation package — Pane splitter resize handoff

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: Tài liệu bàn giao cho đội code triển khai splitter thay đổi chiều cao pane kỹ thuật theo phong cách GoCharting
- Files modified:
  - `docs/upgrade-standard/splitter-pane-resize/HANDOFF_MANIFEST.md`
  - `docs/upgrade-standard/splitter-pane-resize/TECH_SPEC.md`
  - `docs/upgrade-standard/splitter-pane-resize/IMPLEMENTATION_PLAN.md`
  - `docs/upgrade-standard/splitter-pane-resize/TASKBOARD.md`
  - `docs/upgrade-standard/splitter-pane-resize/AUDIT_PROTOCOL.md`
  - `docs/upgrade-standard/HANDOFF_MANIFEST.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
- Nội dung bàn giao:
  - Spec kỹ thuật chi tiết cho splitter (drag, clamp, minHeight, persist, reset).
  - Kế hoạch triển khai theo phase + gates.
  - Taskboard thực thi và checklist exit trước merge.
  - Audit protocol với functional/regression matrix và evidence bắt buộc.
- Validation:
  - Documentation completeness review → PASS

---

### Ad-hoc documentation package — Drawing Tools Engine handoff (M1/M2/M3)

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: Tài liệu bàn giao đầy đủ cho đội code triển khai Drawing Tools Engine chuẩn TradingView/GoCharting (3 milestone)
- Files created:
  - `docs/upgrade-standard/drawing-tools/HANDOFF_MANIFEST.md`
  - `docs/upgrade-standard/drawing-tools/TECH_SPEC.md`
  - `docs/upgrade-standard/drawing-tools/IMPLEMENTATION_PLAN.md`
  - `docs/upgrade-standard/drawing-tools/TASKBOARD.md`
  - `docs/upgrade-standard/drawing-tools/AUDIT_PROTOCOL.md`
- Files modified:
  - `docs/upgrade-standard/HANDOFF_MANIFEST.md` (thêm link drawing-tools package)
  - `docs/upgrade-standard/BACKLOG.md` (thêm B-130–B-139)
  - `docs/upgrade-standard/TASKBOARD.md` (thêm TB-41–TB-63)
  - `docs/upgrade-standard/AUDIT_LEDGER.md` (entry này)
- Nội dung bàn giao:
  - Gap analysis: 3 vấn đề cốt lõi (activeTool không wire, render stubs, không có coordinate bridge).
  - TECH_SPEC với TypeScript interface specs đầy đủ cho ChartScales, DrawingLayer, useDrawingInteraction.
  - IMPLEMENTATION_PLAN với thứ tự dependency bắt buộc cho 11 bước M1, 8 bước M2, 9 bước M3.
  - TASKBOARD với task ID DT-01–DT-28 + gate checklist per milestone.
  - AUDIT_PROTOCOL với functional matrix F01–F47, regression matrix R01–R08, unit test specs, edge cases E01–E08.
- Validation:
  - Documentation completeness review → PASS

### Ad-hoc demo task — Chart type switcher (GoCharting-style)

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: `src/demo` topbar chart menu + price series switching
- Files modified:
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `src/demo/demo.css`
  - `module_tree_full.md`
- Tính năng bàn giao:
  - Thêm dropdown chọn loại chart trên topbar: Candlestick, Hollow Candle, OHLC Bar, Heikin Ashi, Line, Area, Bar Chart.
  - Chuyển series hiển thị động theo lựa chọn thay vì hardcode một loại.
  - Heikin Ashi dùng transform `heikinAshi()` và giữ lại các trường indicator từ dữ liệu gốc.
  - Đóng menu khi click ra ngoài, highlight active item, đổi `seriesName` theo chart type để ép re-render đúng.
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS
  - `python scripts/generate_module_tree.py` → PASS (Modules: 594)

### Ad-hoc demo task — Dynamic pane runtime integration

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: core dynamic pane state, registry bridge, chart runtime, and demo wiring
- Files modified:
  - `src/lib/core/types/pane-descriptor.ts`
  - `src/lib/core/calculators/types.ts`
  - `src/lib/core/calculators/fixtures/mockData.ts`
  - `src/lib/core/calculators/calcCVDApprox.ts`
  - `src/lib/core/calculators/calcStrengthElder.ts`
  - `src/lib/core/calculators/calcWhaleApprox.ts`
  - `src/lib/core/calculators/enrichData.ts`
  - `src/lib/core/calculators/__tests__/enrichData.test.ts`
  - `src/lib/core/registry/SeriesRegistry.ts`
  - `src/lib/core/registry/registerAll.ts`
  - `src/lib/core/registry/__tests__/SeriesRegistry.test.ts`
  - `src/lib/core/hooks/useDynamicPanes.ts`
  - `src/lib/core/hooks/__tests__/useDynamicPanes.test.ts`
  - `src/lib/core/DynamicChart.tsx`
  - `src/lib/core/PaneHeader.tsx`
  - `src/lib/core/PaneLabel.tsx`
  - `src/lib/core/PaneTooltip.tsx`
  - `src/lib/core/SeriesPicker.tsx`
  - `src/lib/core/index.ts`
  - `src/lib/styles/pane-overlays.css`
  - `src/index.ts`
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `src/demo/demo.css`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
  - `module_tree_full.md`
- Tính năng bàn giao:
  - `DynamicChart` renders visible panes from `useDynamicPanes` state and drives per-pane tooltips, overlays, and splitters.
  - `PaneHeader`, `PaneLabel`, `PaneTooltip`, and `SeriesPicker` are exported from the core package and wired into the demo shell.
  - The demo topbar chart type selector now swaps the primary price series instead of relying on a fixed three-chart stack.
  - Pane layout persists in localStorage and rebuilds cleanly after reset/reorder/show-hide operations.
- Validation:
  - `npm run type-check` → PASS
  - `npm test -- src/lib/core/types/__tests__/pane-descriptor.test.ts src/lib/core/calculators/__tests__/enrichData.test.ts src/lib/core/registry/__tests__/SeriesRegistry.test.ts src/lib/core/hooks/__tests__/useDynamicPanes.test.ts` → PASS (27 tests)
  - `npm run build:docs` → PASS
  - `python scripts/generate_module_tree.py` → PASS (Modules: 618)
  - Browser smoke on [build/index.html](../../build/index.html) → PASS; demo shell loads, live/offline data path renders, duplicate-key warning cleared after rebuild

### Ad-hoc demo task — Drawing persistence and floating inspector

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: drawing storage toolbar, floating inspector/list panel, demo i18n, and module tree refresh
- Files modified:
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `src/demo/i18n.tsx`
  - `src/demo/demo.css`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
  - `module_tree_full.md`
- Nội dung bàn giao:
  - Mount drawing export/import/clear controls directly inside the demo chart shell.
  - Wire the floating inspector and list panel to the drawing interaction state.
  - Persist drawings by symbol/timeframe through `useDrawingStorage` and rehydrate on mount.
  - Add Vietnamese and English labels for all new drawing UI controls.
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS
  - Browser smoke on [build/index.html](../../build/index.html) → PASS; drawing toolbar renders with localized labels and demo bundle loads cleanly
  - `python scripts/generate_module_tree.py` → PASS (Modules: 637)

### Ad-hoc drawing task — M4 pattern tools + pro

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: M4 pattern tools, shared render pipeline, toolbar/i18n, and audit refresh
- Files modified:
  - `src/lib/drawing/types.ts`
  - `src/lib/drawing/shared.ts`
  - `src/lib/drawing/builtin/channel.ts`
  - `src/lib/drawing/builtin/parallelChannel.ts`
  - `src/lib/drawing/builtin/pitchfork.ts`
  - `src/lib/drawing/builtin/abcdPattern.ts`
  - `src/lib/drawing/builtin/fibArc.ts`
  - `src/lib/drawing/builtin/fibTimeZone.ts`
  - `src/lib/drawing/builtin/regressionChannel.ts`
  - `src/lib/drawing/renderSvg.ts`
  - `src/lib/drawing/DrawingLayer.tsx`
  - `src/lib/drawing/index.ts`
  - `src/index.ts`
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `src/demo/i18n.tsx`
  - `src/lib/drawing/m4.test.ts`
  - `docs/upgrade-standard/drawing-tools/TASKBOARD.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
  - `module_tree_full.md`
- Nội dung bàn giao:
  - Thêm 6 pattern tools vào shared registry và SVG renderer.
  - Multi-click completion giờ hỗ trợ channel-style tools cùng pitchfork và ABCD.
  - Regression channel dùng least-squares dựa trên plotData với badge R².
  - Toolbar và i18n hiển thị đủ tool M4 trong demo shell.
- Validation:
  - `npm run type-check` → PASS
  - `npm test -- src/lib/drawing/m4.test.ts` → PASS
  - `npm run build:docs` → PASS
  - Browser smoke on [build/index.html](../../build/index.html) → PASS; Parallel Channel, Pitchfork, and Regression Channel buttons activate
  - `python scripts/generate_module_tree.py` → PASS (Modules: 653)

### Ad-hoc replay task — M5 slice 1 controller foundation

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: Phase 5 bar replay controller foundation, subscription model, step/play/pause flow, and controller tests
- Files modified:
  - `src/lib/core/replay/BarReplayController.ts`
  - `src/lib/core/replay/BarReplayController.test.ts`
  - `src/lib/core/index.ts`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
  - `module_tree_full.md`
- Nội dung bàn giao:
  - Added a reusable `BarReplayController` with visible-data slicing, play/pause, step forward/back, speed control, jump-to-date, and subscription support.
  - Kept the controller domain-only so it can be wired into the chart shell in the next slice without refactoring the replay state model.
  - Added targeted tests for slice semantics, replay jumps, and timer-driven playback stop at stream end.
- Validation:
  - `npm test -- src/lib/core/replay/BarReplayController.test.ts` → PASS
  - `npm run type-check` → PASS
  - `python scripts/generate_module_tree.py` → PASS (Modules: 655)

### Ad-hoc governance update — Shared UI template rule

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: repo-wide governance hard rule for a single shared UI template across all surfaces
- Files modified:
  - `AGENTS.md`
  - `docs/project-delivery/PROJECT_GOVERNANCE.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
- Nội dung bàn giao:
  - Chốt quy định cứng rằng mọi surface của ứng dụng phải dùng chung template giao diện với web root.
  - Cấm tạo layout/template riêng cho từng surface nếu cùng chức năng và chưa có phê duyệt riêng.
  - Bổ sung rule ở lớp agent bootstrap và governance gốc để các slice sau không đi lệch template.
- Validation:
  - Documentation alignment review → PASS

### Demo shell unification — shared page frame

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: shared `demo-page` / `demo-frame` wrapper across demo surfaces
- Files modified:
  - `src/demo/DemoPageShell.tsx`
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `src/demo/FullDemo.tsx`
  - `src/demo/OriginalLikeDemo.tsx`
  - `src/demo/LiveDemo.tsx`
  - `src/demo/demo.css`
  - `module_tree_full.md`
- Nội dung bàn giao:
  - Introduced a shared demo shell wrapper so the drawing runtime and the main demo surfaces use the same outer page frame.
  - Kept runtime drawing/chart logic intact while moving the outer layout behind a single reusable template.
  - Added terminal-specific shell modifiers so the embedded drawing surface still receives a full-height canvas.
- Validation:
  - `npm run type-check` → PASS

### Milestone M3 slice — advanced drawing tools and grouped toolbar

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: M3 advanced drawing tool family, render layer, selection flow, demo toolbar grouping, and M3 tests
- Files modified:
  - `src/lib/drawing/types.ts`
  - `src/lib/drawing/shared.ts`
  - `src/lib/drawing/DrawingStorage.ts`
  - `src/lib/drawing/stateMachine.ts`
  - `src/lib/drawing/useDrawingInteraction.ts`
  - `src/lib/drawing/renderSvg.ts`
  - `src/lib/drawing/DrawingLayer.tsx`
  - `src/lib/drawing/index.ts`
  - `src/index.ts`
  - `src/lib/drawing/m3.test.ts`
  - `src/lib/drawing/builtin/ray.ts`
  - `src/lib/drawing/builtin/extendedLine.ts`
  - `src/lib/drawing/builtin/polyline.ts`
  - `src/lib/drawing/builtin/dateAndPriceRange.ts`
  - `src/lib/drawing/builtin/longPosition.ts`
  - `src/lib/drawing/builtin/shortPosition.ts`
  - `src/lib/drawing/builtin/fibExtension.ts`
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `src/demo/i18n.tsx`
  - `src/demo/demo.css`
  - `module_tree_full.md`
- Nội dung bàn giao:
  - Added the M3 drawing tool family: ray, extendedLine, polyline, dateAndPriceRange, longPosition, shortPosition, and fibExtension.
  - Extended the render layer to draw the new shapes, including position zones, R/R badge, extended lines, and polyline paths.
  - Added shift-click multi-select and polyline multi-click/double-click completion in the interaction layer.
  - Grouped the demo drawing toolbar into four visual sections with dividers and localized labels.
  - Added dedicated M3 tests for registration, geometry, polyline accumulation, multi-select delete, and render output.
- Validation:
  - `npm run type-check` → PASS
  - `npm test -- src/lib/drawing/m3.test.ts` → PASS
  - `npm run build:docs` → PASS
  - Browser smoke on [build/index.html](../../build/index.html) → PASS; grouped toolbar renders, new tool labels are visible, and the live fallback chart still loads with drawing storage UI intact
  - `python scripts/generate_module_tree.py` → PASS (Modules: 646)

### Demo hotfix — direct Chart children

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: `src/lib/core/DynamicChart.tsx`, `src/demo/LibraryShowcaseDemo.tsx`, `module_tree_full.md`
- Root cause: `ChartCanvas` only reads `Chart` configs from direct children. The earlier `<DynamicChart />` wrapper hid the price/volume chart elements, so those panes mounted as empty frames.
- Fix: dynamic chart slots are now emitted as direct children of `ChartCanvas` by calling `DynamicChart({...})` inside the demo render tree.
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS
  - Browser smoke on [build/index.html](../../build/index.html) → PASS; price, volume, and momentum panes render visually with live values
  - `python scripts/generate_module_tree.py` → PASS (Modules: 618)

### Demo hotfix — restore candlestick body width

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: `src/lib/core/DynamicChart.tsx`
- Historical root cause: commit `64dbf3b` previously fixed candlestick width in the demo by injecting a `width` callback into `CandlestickSeries`. The later dynamic-chart refactor dropped that prop, so the default width path became active again.
- Fix: reintroduced the candle body width callback and applied it to both `Candlestick` and `HollowCandle` series inside `DynamicChart`.
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS
  - Browser smoke on [build/index.html](../../build/index.html) → PASS; candlestick bodies render with stable width again

### Demo hotfix — pane labels outside SVG

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: `src/demo/LibraryShowcaseDemo.tsx`
- Root cause: `PaneLabel` was rendered as a child of `ChartCanvas`, so it was inserted into the SVG subtree and lost its absolute-position overlay behavior.
- Fix: moved `PaneLabel` outside `ChartCanvas` so it renders as an HTML overlay in `gc-chart-shell`, keeping the vertical pane names outside the left Y axis.
- Validation:
  - `npm run build:docs` → PASS
  - Browser smoke on [build/index.html](../../build/index.html) → PASS; pane labels now render vertically outside the left axis area

### Demo hotfix — remove bottom XAxis domain line

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: `src/lib/core/DynamicChart.tsx`, `docs/upgrade-standard/AUDIT_LEDGER.md`, `module_tree_full.md`
- Root cause: the bottom `XAxis` was still rendering its default domain path, which appears as a black streak under the time axis.
- Fix: set `showDomain={false}` on the bottom `XAxis` so the tick labels remain visible without the line artifact.
- Validation:
  - `get_errors` on `src/lib/core/DynamicChart.tsx` → PASS
  - `python scripts/generate_module_tree.py` → PASS (Modules: 618)

### Demo cleanup — modal shell, theme parity, and splitter restoration

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: `src/demo/LibraryShowcaseDemo.tsx`, `src/demo/demo.css`, `module_tree_full.md`, `docs/upgrade-standard/AUDIT_LEDGER.md`
- Files modified:
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `src/demo/demo.css`
  - `module_tree_full.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
- Root cause:
  - `LibraryShowcaseDemo.tsx` vẫn còn render right-side panel legacy sau khi đã migrate sang settings modal.
  - `src/demo/demo.css` không import lại `chart-theme.css` và `chart-splitter.css`, khiến shell bị lẫn sáng/tối và splitter hover không nhận đúng style `.rsc-splitter`.
  - File CSS demo vẫn giữ một khối selector side-panel/splitter legacy không còn khớp với cây JSX mới.
- Fix:
  - Dựng lại toàn bộ render tree cuối của `LibraryShowcaseDemo.tsx` để chỉ còn topbar, chart shell, settings modal, và footer; gỡ hẳn right-side panel cũ.
  - Đồng bộ `data-chart-theme` lên `document.documentElement` để theme áp dụng xuyên suốt toàn shell.
  - Import lại shared theme/splitter CSS trong `src/demo/demo.css`, chuyển `gc-main` về layout 2 cột, và dọn selector sidepanel/splitter/settings legacy đã chết.
- Validation:
  - `npm run build:docs` → PASS
  - `npm run type-check` → PASS
  - `npm test` → PASS (`51/51` tests)
  - `python scripts/generate_module_tree.py` → PASS (Modules: 620)

### Ad-hoc delivery task — Demo VN/EN i18n rollout and handoff package

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: triển khai i18n cục bộ cho demo bằng tiếng Việt/English, giữ `src/lib/core` độc lập với demo, và tạo bộ tài liệu chuyển giao + quality playbook cho giai đoạn tiếp theo.
- Files modified:
  - `src/demo/i18n.tsx`
  - `src/demo/index.tsx`
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `src/demo/PaneSettingsModal.tsx`
  - `src/demo/FullDemo.tsx`
  - `src/demo/OriginalLikeDemo.tsx`
  - `src/demo/LiveDemo.tsx`
  - `src/lib/core/PaneHeader.tsx`
  - `src/lib/core/IndicatorLegend.tsx`
  - `src/lib/core/ChartSplitter.tsx`
  - `src/lib/core/index.ts`
  - `src/index.ts`
  - `docs/project-delivery/HANDOFF_MANIFEST.md`
  - `docs/project-delivery/PROJECT_GOVERNANCE.md`
  - `docs/project-delivery/TECH_SPEC.md`
  - `docs/project-delivery/IMPLEMENTATION_PLAN.md`
  - `docs/project-delivery/TASKBOARD.md`
  - `docs/project-delivery/BACKLOG.md`
  - `docs/project-delivery/AUDIT_PROTOCOL.md`
  - `docs/project-delivery/HANDOFF_CHECKLIST.md`
  - `quality/QUALITY.md`
  - `quality/RUN_CODE_REVIEW.md`
  - `quality/RUN_INTEGRATION_TESTS.md`
  - `quality/RUN_SPEC_AUDIT.md`
  - `quality/code_reviews/.gitkeep`
  - `quality/results/.gitkeep`
  - `quality/spec_audits/.gitkeep`
  - `AGENTS.md`
  - `build/index.html`
  - `build/react-stockcharts-demo.7ed268f353b1c5b827e6.js`
  - `module_tree_full.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
- Nội dung bàn giao:
  - Thêm `DemoI18nProvider` mặc định `vi`, hỗ trợ `en`, lưu locale vào localStorage và đồng bộ `document.documentElement.lang`.
  - Việt hóa/Anh hóa shell demo chính, settings modal, và các demo standalone (`FullDemo`, `OriginalLikeDemo`, `LiveDemo`) theo hướng sẵn sàng tách widget sau này.
  - Mở rộng `PaneHeader`, `IndicatorLegend`, và `ChartSplitter` bằng optional label props để demo truyền text đã localize mà không tạo dependency ngược từ core sang `src/demo`.
  - Tạo bộ `docs/project-delivery/*`, `quality/*`, và `AGENTS.md` để bàn giao cho đội code với governance, taskboard, audit protocol, review flow, integration test flow, và spec audit flow.
- Validation:
  - `npm run type-check` → PASS
  - `npm test` → PASS (`51/51` tests)
  - `npm run build:docs` → PASS
  - `python scripts/generate_module_tree.py` → PASS (Modules: 621)

### S21 progress — indicator sub-slice

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: `src/lib/indicator/`
- Files added/updated:
  - `src/lib/indicator/baseIndicator.ts`
  - `src/lib/indicator/defaultOptionsForAppearance.ts`
  - `src/lib/indicator/index.ts`
  - `src/lib/indicator/ema.ts`
  - `src/lib/indicator/sma.ts`
  - `src/lib/indicator/wma.ts`
  - `src/lib/indicator/tma.ts`
  - `src/lib/indicator/rsi.ts`
  - `src/lib/indicator/stochasticOscillator.ts`
  - `src/lib/indicator/heikinAshi.ts`
  - `src/lib/indicator/elderRay.ts`
  - `src/lib/indicator/forceIndex.ts`
  - `src/lib/indicator/pointAndFigure.ts`
  - `src/lib/indicator/kagi.ts`
  - `src/lib/indicator/renko.ts`
  - `src/lib/indicator/sar.ts`
  - `src/lib/indicator/change.ts`
  - `src/lib/indicator/compare.ts`
  - `src/lib/indicator/atr.ts`
  - `src/lib/indicator/bollingerBand.ts`
  - `src/lib/indicator/macd.ts`
  - `src/lib/indicator/elderImpulse.ts`
  - `module_tree_full.md`
- Files deleted:
  - `src/lib/indicator/baseIndicator.js`
  - `src/lib/indicator/defaultOptionsForAppearance.js`
  - `src/lib/indicator/index.js`
  - `src/lib/indicator/ema.js`
  - `src/lib/indicator/sma.js`
  - `src/lib/indicator/wma.js`
  - `src/lib/indicator/tma.js`
  - `src/lib/indicator/rsi.js`
  - `src/lib/indicator/stochasticOscillator.js`
  - `src/lib/indicator/heikinAshi.js`
  - `src/lib/indicator/elderRay.js`
  - `src/lib/indicator/forceIndex.js`
  - `src/lib/indicator/pointAndFigure.js`
  - `src/lib/indicator/kagi.js`
  - `src/lib/indicator/renko.js`
  - `src/lib/indicator/sar.js`
  - `src/lib/indicator/change.js`
  - `src/lib/indicator/compare.js`
  - `src/lib/indicator/atr.js`
  - `src/lib/indicator/bollingerBand.js`
  - `src/lib/indicator/macd.js`
  - `src/lib/indicator/elderImpulse.js`
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - `python scripts/generate_module_tree.py` → Modules: 319
  - `src/lib/indicator/` → 0 `.js` files

### S21 interactive sub-slice

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: `src/lib/interactive/`
- Files added/updated:
  - `src/lib/interactive/Brush.tsx`
  - `src/lib/interactive/ClickCallback.tsx`
  - `src/lib/interactive/DrawingObjectSelector.tsx`
  - `src/lib/interactive/EquidistantChannel.tsx`
  - `src/lib/interactive/FibonacciRetracement.tsx`
  - `src/lib/interactive/GannFan.tsx`
  - `src/lib/interactive/InteractiveText.tsx`
  - `src/lib/interactive/InteractiveYCoordinate.tsx`
  - `src/lib/interactive/StandardDeviationChannel.tsx`
  - `src/lib/interactive/TrendLine.tsx`
  - `src/lib/interactive/index.ts`
  - `src/lib/interactive/components/ChannelWithArea.tsx`
  - `src/lib/interactive/components/ClickableCircle.tsx`
  - `src/lib/interactive/components/ClickableShape.tsx`
  - `src/lib/interactive/components/GannFan.tsx`
  - `src/lib/interactive/components/HoverTextNearMouse.tsx`
  - `src/lib/interactive/components/InteractiveText.tsx`
  - `src/lib/interactive/components/InteractiveYCoordinate.tsx`
  - `src/lib/interactive/components/LinearRegressionChannelWithArea.tsx`
  - `src/lib/interactive/components/MouseLocationIndicator.tsx`
  - `src/lib/interactive/components/StraightLine.tsx`
  - `src/lib/interactive/components/Text.tsx`
  - `src/lib/interactive/utils.ts`
  - `src/lib/interactive/wrapper/EachEquidistantChannel.tsx`
  - `src/lib/interactive/wrapper/EachFibRetracement.tsx`
  - `src/lib/interactive/wrapper/EachGannFan.tsx`
  - `src/lib/interactive/wrapper/EachInteractiveYCoordinate.tsx`
  - `src/lib/interactive/wrapper/EachLinearRegressionChannel.tsx`
  - `src/lib/interactive/wrapper/EachText.tsx`
  - `src/lib/interactive/wrapper/EachTrendLine.tsx`
  - `module_tree_full.md`
- Files deleted:
  - `src/lib/interactive/Brush.js`
  - `src/lib/interactive/ClickCallback.js`
  - `src/lib/interactive/DrawingObjectSelector.js`
  - `src/lib/interactive/EquidistantChannel.js`
  - `src/lib/interactive/FibonacciRetracement.js`
  - `src/lib/interactive/GannFan.js`
  - `src/lib/interactive/InteractiveText.js`
  - `src/lib/interactive/InteractiveYCoordinate.js`
  - `src/lib/interactive/StandardDeviationChannel.js`
  - `src/lib/interactive/TrendLine.js`
  - `src/lib/interactive/index.js`
  - `src/lib/interactive/utils.js`
  - `src/lib/interactive/components/ChannelWithArea.js`
  - `src/lib/interactive/components/ClickableCircle.js`
  - `src/lib/interactive/components/ClickableShape.js`
  - `src/lib/interactive/components/GannFan.js`
  - `src/lib/interactive/components/HoverTextNearMouse.js`
  - `src/lib/interactive/components/InteractiveText.js`
  - `src/lib/interactive/components/InteractiveYCoordinate.js`
  - `src/lib/interactive/components/LinearRegressionChannelWithArea.js`
  - `src/lib/interactive/components/MouseLocationIndicator.js`
  - `src/lib/interactive/components/StraightLine.js`
  - `src/lib/interactive/components/Text.js`
  - `src/lib/interactive/wrapper/EachEquidistantChannel.js`
  - `src/lib/interactive/wrapper/EachFibRetracement.js`
  - `src/lib/interactive/wrapper/EachGannFan.js`
  - `src/lib/interactive/wrapper/EachInteractiveYCoordinate.js`
  - `src/lib/interactive/wrapper/EachLinearRegressionChannel.js`
  - `src/lib/interactive/wrapper/EachText.js`
  - `src/lib/interactive/wrapper/EachTrendLine.js`
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - `python scripts/generate_module_tree.py` → Modules: 319
  - `src/lib/interactive/` → 0 `.js` files

### S22 root-file sub-slice

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: `src/lib/` root entrypoints
- Files added/updated:
  - `src/lib/EventCapture.tsx`
  - `src/lib/CanvasContainer.tsx`
  - `src/lib/BackgroundText.tsx`
  - `src/lib/ZoomButtons.tsx`
  - `src/lib/algorithm/index.ts`
  - `src/vendor.d.ts`
  - `module_tree_full.md`
- Files deleted:
  - `src/lib/EventCapture.js`
  - `src/lib/CanvasContainer.js`
  - `src/lib/BackgroundText.js`
  - `src/lib/ZoomButtons.js`
  - `src/lib/algorithm/index.js`
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - `python scripts/generate_module_tree.py` → Modules: 319
  - `src/` → 0 `.js` files
  - Browser smoke on `http://127.0.0.1:4173/index.html` → PASS

### Demo simplification — clean chart landing

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: `src/demo/`
- Files added/updated:
  - `src/demo/SimpleDemo.tsx`
  - `src/demo/index.tsx`
  - `module_tree_full.md`
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - `python scripts/generate_module_tree.py` → Modules: 320
  - Browser smoke on `http://127.0.0.1:4173/index.html` → PASS
- Kết luận: PASS — demo landing simplified và brush span vẫn giữ được.

### Demo restoration — original-like layout

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: `src/demo/`, `src/lib/tooltip/`, `src/lib/ChartCanvas.tsx`
- Files added/updated:
  - `src/demo/OriginalLikeDemo.tsx`
  - `src/demo/index.tsx`
  - `src/demo/demo.css`
  - `src/lib/ChartCanvas.tsx`
  - `src/lib/tooltip/MovingAverageTooltip.tsx`
  - `src/lib/tooltip/OHLCTooltip.tsx`
  - `src/lib/tooltip/MACDTooltip.tsx`
  - `module_tree_full.md`
- Files deleted:
  - `src/demo/SimpleDemo.tsx`
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - `python scripts/generate_module_tree.py` → Modules: 320
  - Browser smoke on `http://127.0.0.1:4173/index.html` → PASS
  - `xExtents` reset verified via browser state after brush callback
- Kết luận: PASS — demo gọn nhưng giữ cấu trúc gốc; wheel zoom và brush span đều hoạt động.

### Ad-hoc runtime task — Indicator SSOT canonical resolver integration

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: hợp nhất canonical indicator access giữa enrich pipeline, dynamic renderer, tooltip/yExtents accessor, và main demo data path để cùng `indicatorType + params` luôn đọc cùng series.
- Files modified:
  - `src/lib/core/calculators/types.ts`
  - `src/lib/core/seriesValueResolver.ts`
  - `src/lib/core/__tests__/seriesValueResolver.test.ts`
  - `src/lib/core/calculators/enrichData.ts`
  - `src/lib/core/calculators/__tests__/enrichData.test.ts`
  - `src/lib/core/DynamicChart.tsx`
  - `src/demo/demoData.ts`
  - `src/demo/LibraryShowcaseDemo.tsx`
  - `module_tree_full.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
- Nội dung bàn giao:
  - Thêm canonical resolver layer để build exact indicator keys theo runtime params và tái sử dụng cùng accessor cho chart render, tooltip, và `yExtents`.
  - Mở rộng `EnrichedDatum` với `indicatorValues` để materialize series values theo params thay vì chỉ dựa vào các field legacy cố định như `ema20`, `ema50`, `rsi14`.
  - Cập nhật `enrichData()` để tính và lưu canonical EMA, RSI, Bollinger, MACD, và Whale values cho các series thực tế đang được yêu cầu.
  - Cập nhật `DynamicChart` và main demo pipeline để dùng canonical resolver thay cho threshold fallback, qua đó giữ cùng indicator cùng params cho cùng hình dạng ở nhiều pane.
  - Bổ sung regression tests cho canonical key building, exact EMA lookup, structured Bollinger/MACD access, và enrichData runtime-param materialization.
- Validation:
  - `npm run type-check` → PASS
  - `npm test -- src/lib/core/__tests__/seriesValueResolver.test.ts` → PASS (`4/4` tests)
  - `npm test -- src/lib/core/__tests__/seriesValueResolver.test.ts src/lib/core/calculators/__tests__/enrichData.test.ts` → PASS (`12/12` tests)
  - `npm test` → PASS (`56/56` tests)
  - `npm run build:docs` → PASS
  - `python scripts/generate_module_tree.py` → PASS (Modules: 623)

### Ad-hoc UI task — Settings modal template alignment with root shell

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: đồng bộ visual language của Settings modal với terminal shell chung của root page để bỏ cảm giác lệch template, quá nặng hiệu ứng, và thiếu style cho summary/tag blocks.
- Files modified:
  - `src/demo/PaneSettingsModal.tsx`
  - `src/demo/demo.css`
  - `module_tree_full.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
- Nội dung bàn giao:
  - Chuyển header, nav rail, content surface, pane cards, series cards, tags, và close button của Settings modal về cùng hệ token và hình khối `gc-*` của shell chính.
  - Thêm meta badges ở header để modal hiển thị section hiện tại, pane count, và pane đang chọn theo cùng nhịp UI của root shell.
  - Bổ sung style còn thiếu cho `gc-settings-pane-summary`, `gc-tag`, và highlight state cho pane đang được chọn.
  - Giảm blur/gradient riêng của modal, làm input/button/panel nhất quán hơn với topbar, dropdown, và chart shell hiện có.
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS
  - Browser smoke on `build/index.html` → PASS; Settings modal mở đúng, header/nav/card spacing đồng nhất với shell và không còn block summary/tag bị thô.
  - `python scripts/generate_module_tree.py` → PASS (Modules: 623)

### Ad-hoc i18n task — Keep indicator labels in English for VI locale

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: chuẩn hóa các study/pane names theo English financial terminology ngay cả khi UI shell đang ở locale tiếng Việt.
- Files modified:
  - `src/demo/i18n.tsx`
  - `module_tree_full.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
- Nội dung bàn giao:
  - Đổi các pane labels trong locale VI từ `Giá`, `Khối lượng`, `Dòng lệnh`, `Sức mạnh` sang `Price`, `Volume`, `Order Flow`, `Strength`.
  - Giữ các tên study đang hiển thị như `EMA`, `RSI`, `MACD`, `Bollinger Band`, `Volume` theo English chuẩn tài chính thay vì Việt hóa.
  - Chuẩn hóa thêm volume badge/metric/guide text để UI tiếng Việt vẫn đọc tự nhiên nhưng không đổi tên indicator.
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS
  - Browser smoke on `build/index.html` → PASS; chart shell hiển thị `Price`, `Volume`, `RSI+MACD` và tooltip/pane controls dùng English labels đúng theo locale rule mới.
  - `python scripts/generate_module_tree.py` → PASS (Modules: 623)

### Ad-hoc i18n task — Keep charting tool terms in English for VI locale

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-04
- Scope: chuẩn hóa chart-type labels và drawing-tool labels trong locale tiếng Việt theo English charting terminology.
- Files modified:
  - `src/demo/i18n.tsx`
  - `module_tree_full.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
- Nội dung bàn giao:
  - Đổi `chartType.hollow`, `chartType.ohlc`, `chartType.line`, `chartType.area` sang `Hollow Candle`, `OHLC Bar`, `Line`, `Area` trong locale VI.
  - Đổi `tool.cursor`, `tool.trendLine`, `tool.hLine`, `tool.vLine`, `tool.channel`, `tool.text` sang `Cursor`, `Trend Line`, `Horizontal Line`, `Vertical Line`, `Channel`, `Text Note`.
  - Giữ nguyên phần vỏ UI tiếng Việt, chỉ chuẩn hóa các thuật ngữ chart/drawing để nhất quán với terminology tài chính trên toàn bộ demo shell.
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS
  - Browser smoke on `build/index.html` → PASS; toolbar hiển thị `Cursor`, `Trend Line`, `Horizontal Line`, `Vertical Line`, `Channel`, `Text Note`, và chart-type label active giữ English.
  - `python scripts/generate_module_tree.py` → PASS (Modules: 623)

### Ad-hoc — Drawing Tools M1 Core Drawing Engine + Compatibility Bridge

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Commit: `b1bf284` (branch `dev`)
- Scope: Drawing engine core, 8 builtin tools, demo wiring, GenericChartComponent compat bridge

**Files created:**
  - `src/lib/drawing/types.ts`
  - `src/lib/drawing/stateMachine.ts`
  - `src/lib/drawing/history.ts`
  - `src/lib/drawing/serialization.ts`
  - `src/lib/drawing/registry.ts`
  - `src/lib/drawing/shared.ts`
  - `src/lib/drawing/coordinateUtils.ts`
  - `src/lib/drawing/renderSvg.ts`
  - `src/lib/drawing/useDrawingInteraction.ts`
  - `src/lib/drawing/DrawingLayer.tsx`
  - `src/lib/drawing/index.ts`
  - `src/lib/drawing/builtin/trendLine.ts`
  - `src/lib/drawing/builtin/hLine.ts`
  - `src/lib/drawing/builtin/vLine.ts`
  - `src/lib/drawing/builtin/fibonacci.ts`
  - `src/lib/drawing/builtin/channel.ts`
  - `src/lib/drawing/builtin/text.ts`
  - `src/lib/drawing/builtin/rectangle.ts`
  - `src/lib/drawing/builtin/arrow.ts`

**Files modified:**
  - `src/lib/GenericChartComponent.tsx` (soft ChartContext fallback)
  - `src/index.ts` (export drawing package)
  - `src/demo/LibraryShowcaseDemo.tsx` (toolbar + keyboard + DrawingLayer mount)
  - `src/demo/i18n.tsx` (tool.rectangle, tool.arrow, tool.crosshair keys)
  - `src/demo/demo.css` (drawing cursors, handles, selected state)
  - `module_tree_full.md` (regenerated, 632 modules)

**Validation:**
  - `npm run type-check` → PASS (0 errors)
  - `npm test` → PASS (67 tests)
  - `npm run build:docs` → PASS (8.31 MiB)
  - `python scripts/generate_module_tree.py` → PASS (Modules: 632)
  - Browser smoke → PASS (10 tools, Ctrl+Z/Y/ESC/Del functional)
  - lib→demo reverse-import scan → PASS (0 violations)

### Ad-hoc runtime fix — Drawing default style normalization

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: normalize default stroke dasharray and isolate style objects in drawing helper

**Files modified:**
  - `src/lib/drawing/shared.ts`
  - `src/lib/drawing/drawing.test.ts`

**Nội dung bàn giao:**
  - `defaultDrawingStyle.strokeDasharray` đổi từ `Solid` sang `solid` để SVG dasharray được chuẩn hóa đúng.
  - `createDrawingObject` luôn clone style mặc định cho từng drawing, tránh shared mutable style object.
  - Thêm regression test để khóa hành vi normalize style và style isolation.

**Validation:**
  - `npx vitest run src/lib/drawing/coordinateUtils.test.ts src/lib/drawing/renderSvg.test.ts src/lib/drawing/drawing.test.ts` → PASS (14 tests)

### Ad-hoc — Drawing Tools Documentation Package M2-M4

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: Cập nhật toàn bộ bộ tài liệu bàn giao Drawing Tools để phản ánh M1 Done + spec đầy đủ M2/M3/M4

**Files modified:**
  - `docs/upgrade-standard/drawing-tools/HANDOFF_MANIFEST.md`
  - `docs/upgrade-standard/drawing-tools/TECH_SPEC.md`
  - `docs/upgrade-standard/drawing-tools/IMPLEMENTATION_PLAN.md`
  - `docs/upgrade-standard/drawing-tools/TASKBOARD.md`
  - `docs/upgrade-standard/drawing-tools/AUDIT_PROTOCOL.md`
  - `docs/upgrade-standard/AUDIT_LEDGER.md` (entry này)

**Nội dung bàn giao:**
  - HANDOFF_MANIFEST: M1 marked ✅ DONE với commit evidence; M2/M3/M4 Done definitions đầy đủ; as-built table cập nhật.
  - TECH_SPEC: thêm Section 12 (M2 DrawingStorage/Inspector spec), Section 13 (M3 tool behaviors), Section 14 (M4 pattern tools); file impact matrix M1→M4.
  - IMPLEMENTATION_PLAN: M1 marked Done; M2 thêm DrawingListPanel; M3 expand thành 14 bước (7 tools mới); M4 thêm mới 12 bước (6 pattern tools); file impact matrix M1→M4.
  - TASKBOARD: M1 tasks DT-01→DT-11 marked ✅ Done; Gate M1 all checked; M2 thêm DT-15 (DrawingListPanel); M3 expand DT-20→DT-32 (7 tools); M4 thêm DT-33→DT-44 (6 tools).
  - AUDIT_PROTOCOL: M1 sign-off ✅ COMPLETED; M2 mở rộng F50-F56 (clone/hide/z-order/list); M3 thêm F57-F70 (7 tools); M4 thêm F80-F90 (6 tools); unit test specs cho M3/M4.

**Validation:**
  - Documentation completeness review → PASS

Mọi slice đã hoàn thành phải liệt kê chính xác tên file đã sửa. File không có trong ledger không được đóng audit.

## 4. Audit checklist — luôn phải pass

- [ ] `npm run type-check` pass.
- [ ] `npm run build:docs` pass.
- [ ] Không còn `contextTypes` / `childContextTypes` / `findDOMNode` trong `src/lib`.
- [ ] `propTypes` blocks được giữ nguyên trong mọi file được chạm.
- [ ] Demo có offline fallback — không phụ thuộc network.
- [ ] `module_tree_full.md` được regenerate sau khi rename file.

## 5. Evidence S0–S15 (lưu trữ)

_(Các evidence chi tiết của S0–S15 được giữ nguyên bên dưới cho tham chiếu lịch sử.)_

### S0 Evidence
- `scripts/generate_module_tree.py` corrected. Modules: 319.
- Files: `scripts/generate_module_tree.py`, `module_tree_full.md`

### S1 Evidence
- `@types/react`, `@types/react-dom`, `@types/prop-types`, `@types/d3-shape` installed.
- `src/lib/types.ts` created. `GenericComponent`, `BarSeries`, `CandlestickSeries`, `LineSeries` typed.
- Files: `package.json`, `package-lock.json`, `src/lib/types.ts`, `src/lib/GenericComponent.tsx`, `src/lib/series/BarSeries.tsx`, `src/lib/series/CandlestickSeries.tsx`, `src/lib/series/LineSeries.tsx`, `module_tree_full.md`

### S3 Evidence
- `ChartCanvas.tsx`, `GenericComponent.tsx`, `GenericChartComponent.tsx`, `Chart.tsx`, `StockChartContext.tsx`, `types.ts` typed.
- Files: above 6 files

## 24. Slice 20 Evidence

### Completed

- Fixed splitter drag reliability by switching to Pointer Events with pointer capture in chart overlay splitter.
- Raised splitter overlay stacking order and interaction settings so drag events are not lost to canvas layers.
- Reduced pane min-height constraints and bumped layout storage key to clear stale clamped ratios from previous sessions.

### Validation

- Command run: `npx tsc --noEmit`
- Browser audit at `http://localhost:8080/` confirms realtime splitter movement during drag:
  - Splitter #1 moved `before=272` → `mid=212` → `after=184` in one drag sequence.
- Command run: `python scripts/generate_module_tree.py`

### Files touched in this slice

- [src/demo/ChartPaneSplitter.tsx](../../src/demo/ChartPaneSplitter.tsx)
- [src/demo/demo.css](../../src/demo/demo.css)
- [src/demo/usePaneLayout.ts](../../src/demo/usePaneLayout.ts)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [module_tree_full.md](../../module_tree_full.md)

### S4 Evidence
- `d3-collection` → native Set. `utils/ChartDataUtil.js`, `utils/index.js`, `package.json`, `package-lock.json`

### S5 Evidence
- Series: `BarSeries`, `CandlestickSeries`, `LineSeries`, `StraightLine`, `MACDSeries`, `RSISeries`.
- Axes: `XAxis.js`, `YAxis.js`. Coordinates: `CrossHairCursor.js`, `Cursor.js`. Tooltip: `HoverTooltip.js`.

### S6 Evidence
- `EventCapture.js`, `axes/AxisZoomCapture.js` — pointer-based D3 APIs.

### S7 Evidence
- `config/webpack.config.js`, `src/demo/demoData.ts`, `src/demo/FullDemo.tsx`, `src/demo/LiveDemo.tsx`, `src/demo/index.tsx` + series files above.

### S8 Evidence
- Docs updated. `npm run type-check` + `npm run build:docs` pass.

### S15 Evidence
- `src/lib/ChartCanvas.tsx` — added `pointsPerPxThreshold: 2, minPointsPerPxThreshold: 0.02` to defaultProps.
- `src/lib/scale/evaluator.js` — null-guard in `canShowTheseManyPeriods`.
- `src/demo/FullDemo.tsx` — fixed `volumeOrigin`, `rsiOrigin`, `macdOrigin` to include `overviewHeight`.
- `module_tree_full.md` — regenerated (323 modules).

## 6. Evidence S16–S22 (điền khi hoàn thành)

### S16 Evidence
- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Files renamed:
  - `src/lib/utils/noop.js` → `src/lib/utils/noop.ts`
  - `src/lib/utils/identity.js` → `src/lib/utils/identity.ts`
  - `src/lib/utils/shallowEqual.js` → `src/lib/utils/shallowEqual.ts`
  - `src/lib/utils/rebind.js` → `src/lib/utils/rebind.ts`
  - `src/lib/utils/strokeDasharray.js` → `src/lib/utils/strokeDasharray.ts`
  - `src/lib/utils/barWidth.js` → `src/lib/utils/barWidth.ts`
  - `src/lib/utils/PureComponent.js` → `src/lib/utils/PureComponent.ts`
  - `src/lib/utils/zipper.js` → `src/lib/utils/zipper.ts`
  - `src/lib/utils/merge.js` → `src/lib/utils/merge.ts`
  - `src/lib/utils/accumulatingWindow.js` → `src/lib/utils/accumulatingWindow.ts`
  - `src/lib/utils/mappedSlidingWindow.js` → `src/lib/utils/mappedSlidingWindow.ts`
  - `src/lib/utils/slidingWindow.js` → `src/lib/utils/slidingWindow.ts`
  - `src/lib/utils/ChartDataUtil.js` → `src/lib/utils/ChartDataUtil.ts`
  - `src/lib/utils/zoomBehavior.js` → `src/lib/utils/zoomBehavior.ts`
  - `src/lib/utils/index.js` → `src/lib/utils/index.ts`
- Support file added:
  - `src/vendor.d.ts`
- npm run type-check: PASS
- npm run build:docs: PASS (3 warnings; non-blocking)
- python scripts/generate_module_tree.py: Modules: 324
- Kết luận: PASS — S16 closed, utils slice fully migrated to TypeScript.

### S17 Evidence + Gate G1 — ✅ Completed

```
Người thực hiện: GitHub Copilot
Ngày: 2025-01-31
Files renamed (30 files):
  Calculator (20 files):
  - src/lib/calculator/defaultOptionsForComputation.js → .ts
  - src/lib/calculator/change.js → .ts
  - src/lib/calculator/compare.js → .ts
  - src/lib/calculator/ema.js → .ts
  - src/lib/calculator/sma.js → .ts
  - src/lib/calculator/wma.js → .ts
  - src/lib/calculator/tma.js → .ts
  - src/lib/calculator/atr.js → .ts
  - src/lib/calculator/forceIndex.js → .ts
  - src/lib/calculator/smoothedForceIndex.js → .ts
  - src/lib/calculator/elderRay.js → .ts
  - src/lib/calculator/heikinAshi.js → .ts
  - src/lib/calculator/bollingerband.js → .ts
  - src/lib/calculator/macd.js → .ts
  - src/lib/calculator/rsi.js → .ts
  - src/lib/calculator/sar.js → .ts
  - src/lib/calculator/sto.js → .ts
  - src/lib/calculator/kagi.js → .ts
  - src/lib/calculator/renko.js → .ts
  - src/lib/calculator/pointAndFigure.js → .ts
  - src/lib/calculator/index.js → .ts
  Scale (5 files):
  - src/lib/scale/levels.js → .ts
  - src/lib/scale/evaluator.js → .ts
  - src/lib/scale/financeDiscontinuousScale.js → .ts
  - src/lib/scale/discontinuousTimeScaleProvider.js → .ts
  - src/lib/scale/index.js → .ts
  Helper (5 files):
  - src/lib/helper/SaveChartAsImage.js → .ts
  - src/lib/helper/TypeChooser.js → .tsx
  - src/lib/helper/fitWidth.js → .tsx
  - src/lib/helper/fitDimensions.js → .tsx
  - src/lib/helper/index.js → .ts
  Root:
  - src/index.js → .ts
  Support:
  - src/vendor.d.ts (added save-svg-as-png declaration)
Gate G1:
  npm run type-check: PASS
  npm run build:docs: PASS (3 warnings; non-blocking)
  Get-ChildItem ... -Include "*.js": 0 results
  python scripts/generate_module_tree.py: regenerated
Fixes applied:
  - path() defaultValue made optional
  - stdDev ?? 0 in bollingerband.ts
  - avgGain/avgLoss typed as number with ?? 0 in rsi.ts
  - timeFormatDefaultLocale removed (d3-time-format v3 API change)
  - getClosestItemIndexes 4th arg passed as undefined in evaluator.ts
  - merge() cast as any in kagi.ts and renko.ts
Kết luận: PASS — S17 closed, Gate G1 passed.
```

### S18 Evidence — ✅ Completed

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: `src/lib/series/*` còn lại + `src/lib/axes/*`
- Detailed file list: xem [SLICE_AUDIT.md](SLICE_AUDIT.md) mục S18
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - `python scripts/generate_module_tree.py` → Modules: 319
- Kết luận: PASS — S18 closed; series/axes layer đã migrate sang TypeScript, JS duplicates đã được dọn sạch.

### S19 Evidence — ✅ Completed
- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: `src/lib/coordinates/`, `src/lib/tooltip/`, `src/lib/annotation/`
- Files updated:
  - `src/lib/coordinates/CurrentCoordinate.tsx`
  - `src/lib/coordinates/CrossHairCursor.tsx`
  - `src/lib/coordinates/EdgeIndicator.tsx`
  - `src/lib/coordinates/MouseCoordinateX.tsx`
  - `src/lib/coordinates/MouseCoordinateY.tsx`
  - `src/lib/coordinates/PriceCoordinate.tsx`
  - `src/lib/coordinates/index.ts`
  - `src/lib/coordinates/EdgeCoordinate.tsx`
  - `src/lib/coordinates/EdgeCoordinateV2.tsx`
  - `src/lib/coordinates/EdgeCoordinateV3.tsx`
  - `src/lib/coordinates/Cursor.tsx`
  - `src/lib/coordinates/MouseCoordinateXV2.tsx`
  - `src/lib/tooltip/displayValuesFor.ts`
  - `src/lib/tooltip/ToolTipTSpanLabel.tsx`
  - `src/lib/tooltip/ToolTipText.tsx`
  - `src/lib/tooltip/index.ts`
  - `src/lib/tooltip/SingleValueTooltip.tsx`
  - `src/lib/tooltip/RSITooltip.tsx`
  - `src/lib/tooltip/BollingerBandTooltip.tsx`
  - `src/lib/tooltip/StochasticTooltip.tsx`
  - `src/lib/tooltip/MACDTooltip.tsx`
  - `src/lib/tooltip/MovingAverageTooltip.tsx`
  - `src/lib/tooltip/OHLCTooltip.tsx`
  - `src/lib/tooltip/HoverTooltip.tsx`
  - `src/lib/tooltip/GroupTooltip.tsx`
  - `src/lib/annotation/Annotate.tsx`
  - `src/lib/annotation/SvgPathAnnotation.tsx`
  - `src/lib/annotation/LabelAnnotation.tsx`
  - `src/lib/annotation/Label.tsx`
  - `src/lib/annotation/BarAnnotation.tsx`
  - `src/lib/annotation/index.ts`
  - `module_tree_full.md`
- Files deleted:
  - `src/lib/coordinates/EdgeCoordinate.js`
  - `src/lib/coordinates/EdgeCoordinateV2.js`
  - `src/lib/coordinates/EdgeCoordinateV3.js`
  - `src/lib/coordinates/Cursor.js`
  - `src/lib/coordinates/MouseCoordinateXV2.js`
  - `src/lib/tooltip/displayValuesFor.js`
  - `src/lib/tooltip/ToolTipTSpanLabel.js`
  - `src/lib/tooltip/ToolTipText.js`
  - `src/lib/tooltip/index.js`
  - `src/lib/tooltip/SingleValueTooltip.js`
  - `src/lib/tooltip/RSITooltip.js`
  - `src/lib/tooltip/BollingerBandTooltip.js`
  - `src/lib/tooltip/StochasticTooltip.js`
  - `src/lib/tooltip/MACDTooltip.js`
  - `src/lib/tooltip/MovingAverageTooltip.js`
  - `src/lib/tooltip/OHLCTooltip.js`
  - `src/lib/tooltip/HoverTooltip.js`
  - `src/lib/tooltip/GroupTooltip.js`
  - `src/lib/annotation/Annotate.js`
  - `src/lib/annotation/SvgPathAnnotation.js`
  - `src/lib/annotation/LabelAnnotation.js`
  - `src/lib/annotation/Label.js`
  - `src/lib/annotation/BarAnnotation.js`
  - `src/lib/annotation/index.js`
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - `python scripts/generate_module_tree.py` → Modules: 319
  - `src/lib/coordinates/`, `src/lib/tooltip/`, `src/lib/annotation/` → 0 `.js` files
- Kết luận: PASS — S19 closed; coordinates, tooltip, annotation layers migrated.

### S20 Evidence (Gate G2) — ✅ Completed
- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: Gate validation only, no source edits
- Validation:
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS (3 warnings; non-blocking)
  - Browser smoke on [Demo đầy đủ](http://127.0.0.1:4173/index.html) → candlestick, axes, cursor, Bollinger Band, RSI, MACD, and tooltip layers rendered
  - `python scripts/generate_module_tree.py` → Modules: 319
- Kết luận: PASS — S20/Gate G2 cleared.

### S21 Evidence — ⬜ Chưa thực hiện

### S22 Evidence + Gate G3 + Final audit — ⬜ Chưa thực hiện

```
Gate G3:
  npm run type-check: PASS (zero error)
  npm run build:docs: PASS
  Get-ChildItem src -Recurse -Include "*.js": 0 kết quả
  python scripts/generate_module_tree.py: Modules: N (0 .js)
  Browser smoke: zoom / pan / brush / indicators / tooltip: tất cả PASS
Kết luận: 100% TypeScript — DONE
```

## 1. Canonical File Register

| File | Purpose | Status |
| :--- | :--- | :--- |
| [TECH_SPEC.md](TECH_SPEC.md) | Architecture standard and target shape | Baseline |
| [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) | Tactical migration order | Baseline |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Slice execution plan | New |
| [TASKBOARD.md](TASKBOARD.md) | Day-to-day workboard | New |
| [BACKLOG.md](BACKLOG.md) | Full task backlog | New |
| [SLICE_AUDIT.md](SLICE_AUDIT.md) | Evidence template for each slice | New |
| [HANDOFF_MANIFEST.md](HANDOFF_MANIFEST.md) | Entry point for the handoff package | Updated |

## 2. Slice Status

| Slice | Status | Gate owner role | Required evidence |
| :--- | :--- | :--- | :--- |
| S0 Baseline & inventory | Completed | Platform lead | Baseline type-check log, module tree snapshot, current blocker list |
| S1 Tooling & typing baseline | Completed | Tooling owner | Dependency install record, tsconfig diff, type declaration coverage |
| S2 React 19 blockers | Completed | Core owner | Zero legacy context APIs, zero `findDOMNode`, ref rule sweep |
| S3 Core chart engine | Completed | Core owner | `ChartCanvas`/`GenericComponent` passing type-check and render smoke test |
| S4 Utilities / scale / helper | Completed | Infrastructure owner | Utility files compile cleanly and remain behaviorally unchanged |
| S5 Series / axes / coordinates / tooltip | Completed | Visual primitives owner | Chart primitives compile and the demo renders without runtime regressions |
| S6 Interactive layer | Completed | Interaction owner | Drawing tools and interactive wrappers behave under React 19 |
| S7 Demo restoration | Completed | Demo owner | Full demo loads with internet data and offline fallback |
| S8 Final validation & handoff | Completed | QA / release owner | Final type-check, build, smoke test, and audit closure |
| S9 Demo landing polish | Completed | Demo owner | Responsive landing-page build, browser smoke, live/local source toggle smoke |
| S10 Interaction wheel fix | Completed | Interaction owner | Native wheel listener avoids passive preventDefault warnings and preserves zoom smoke |
| S11 Chart visibility fix | Completed | Demo owner | Chart surface fits viewport more cleanly so brush span is reachable without extra scrolling |
| S12 Offline BTC data refresh | Completed | Demo owner | Local fallback uses a variable BTC dataset so changes are visible before toggling live data |
| S13 Legacy purge (D3 + lifecycle) | Completed | Core/interaction owners | Zero d3-collection imports, zero d3Event, zero legacy lifecycle usage in src |
| S14 Delivery closeout | Completed | Release owner | Backlog statusized with Open items = 0 and formal closeout report added |
| S15 Runtime bug fixes: zoom/pan/brush | Completed | Core/Demo owner | Zoom, brush-span navigation, ZoomButtons reset verified in browser |

## 3. Modified-file rule

Every completed slice must update this ledger with the exact files changed in that slice. If a file is not listed here, it is not eligible for audit closure.

## 4. Audit checklist

- No `contextTypes` or `childContextTypes` remain in `src/lib`.
- No `findDOMNode` calls remain.
- `propTypes` blocks stay in place, with the React 19 note comment above each block when touched.
- `LiveDemo` has a local fallback path so the demo does not depend on a live network response to be verified.
- `npm run type-check` and `npm run build:docs` are the final gates before handoff.

## 5. Slice 0 Evidence

### Completed

- `scripts/generate_module_tree.py` was corrected to scan the repository root and write the inventory to `module_tree_full.md`.
- `module_tree_full.md` was regenerated successfully and now covers `config/`, `docs/`, `scripts/`, and `src/`.
- Baseline type-check remains failing with the existing React/TypeScript typing gaps already observed in `src/lib`.

### Validation

- Command run: `& "c:/Mujoco Projects/react-stockcharts-master/.venv/Scripts/python.exe" scripts/generate_module_tree.py`
- Output: `Generated: C:\Mujoco Projects\react-stockcharts-master\module_tree_full.md`
- Output: `Modules: 319`

### Files touched in this slice

- [scripts/generate_module_tree.py](../../scripts/generate_module_tree.py)
- [module_tree_full.md](../../module_tree_full.md)

### Next slice

- S2 React 19 blockers

## 6. Slice 1 Evidence

### Completed

- Installed `@types/react`, `@types/react-dom`, `@types/prop-types`, and `@types/d3-shape`.
- Added shared chart typings in `src/lib/types.ts`.
- Typed `GenericComponent`, `BarSeries`, `CandlestickSeries`, and `LineSeries` against the new shared contracts.
- Regenerated `module_tree_full.md` after the source changes.

### Validation

- Command run: `npm run type-check`
- Command run: `& "c:/Mujoco Projects/react-stockcharts-master/.venv/Scripts/python.exe" scripts/generate_module_tree.py`
- Result: baseline typings errors are gone from the touched files; remaining type-check failures have moved to `src/lib/ChartCanvas.tsx` and are now the next slice's responsibility.

### Files touched in this slice

- [package.json](../../package.json)
- [package-lock.json](../../package-lock.json)
- [src/lib/types.ts](../../src/lib/types.ts)
- [src/lib/GenericComponent.tsx](../../src/lib/GenericComponent.tsx)
- [src/lib/series/BarSeries.tsx](../../src/lib/series/BarSeries.tsx)
- [src/lib/series/CandlestickSeries.tsx](../../src/lib/series/CandlestickSeries.tsx)
- [src/lib/series/LineSeries.tsx](../../src/lib/series/LineSeries.tsx)
- [module_tree_full.md](../../module_tree_full.md)

## 7. Slice 3 Evidence

### Completed

- `ChartCanvas`, `GenericComponent`, `GenericChartComponent`, `Chart`, `StockChartContext`, and shared `types` all passed file-scoped validation.
- The core engine no longer blocks the repo-wide type-check, and the render path advances into the series/demo layer cleanly.

### Validation

- Command run: `get_errors` on `src/lib/ChartCanvas.tsx`, `src/lib/GenericComponent.tsx`, `src/lib/GenericChartComponent.tsx`, `src/lib/Chart.tsx`, `src/lib/StockChartContext.tsx`, and `src/lib/types.ts`
- Command run: `npm run type-check`
- Result: no errors in the touched core files; repo type-check advances past the core engine and into the visual/demo slices.

### Files touched in this slice

- [src/lib/ChartCanvas.tsx](../../src/lib/ChartCanvas.tsx)
- [src/lib/GenericComponent.tsx](../../src/lib/GenericComponent.tsx)
- [src/lib/GenericChartComponent.tsx](../../src/lib/GenericChartComponent.tsx)
- [src/lib/Chart.tsx](../../src/lib/Chart.tsx)
- [src/lib/StockChartContext.tsx](../../src/lib/StockChartContext.tsx)
- [src/lib/types.ts](../../src/lib/types.ts)

## 8. Slice 7 Evidence

### Completed

- Added a raw-CSV module path and an offline demo data helper that parses the local BTC/USD CSV and enriches it with RSI and MACD.
- Switched the demo entry to the local fallback path by default and kept `LiveDemo` on a live fetch path with offline fallback.
- Modernized the Webpack and Babel runtime config so the demo bundle can build under the existing TypeScript/React 19 stack.
- Fixed the remaining D3 v7 interaction breakpoints in `EventCapture` and `AxisZoomCapture` by switching to pointer-based APIs.
- Regenerated `module_tree_full.md` after the source changes.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Browser smoke test on `build/index.html` after the final rebuild
- Result: bundle builds successfully, the browser opens the demo without page errors, and the chart renders with local fallback data.

### Files touched in this slice

- [config/webpack.config.js](../../config/webpack.config.js)
- [.babelrc](../../.babelrc)
- [package.json](../../package.json)
- [package-lock.json](../../package-lock.json)
- [src/csv.d.ts](../../src/csv.d.ts)
- [src/demo/demoData.ts](../../src/demo/demoData.ts)
- [src/demo/FullDemo.tsx](../../src/demo/FullDemo.tsx)
- [src/demo/LiveDemo.tsx](../../src/demo/LiveDemo.tsx)
- [src/demo/index.tsx](../../src/demo/index.tsx)
- [src/lib/EventCapture.js](../../src/lib/EventCapture.js)
- [src/lib/axes/AxisZoomCapture.js](../../src/lib/axes/AxisZoomCapture.js)
- [src/lib/utils/index.js](../../src/lib/utils/index.js)
- [src/lib/series/BarSeries.tsx](../../src/lib/series/BarSeries.tsx)
- [src/lib/series/CandlestickSeries.tsx](../../src/lib/series/CandlestickSeries.tsx)
- [src/lib/series/LineSeries.tsx](../../src/lib/series/LineSeries.tsx)
- [src/lib/series/StraightLine.tsx](../../src/lib/series/StraightLine.tsx)
- [src/lib/series/MACDSeries.tsx](../../src/lib/series/MACDSeries.tsx)
- [src/lib/series/RSISeries.tsx](../../src/lib/series/RSISeries.tsx)
- [module_tree_full.md](../../module_tree_full.md)

## 9. Slice 4 Evidence

### Completed

- Replaced the last `d3-collection` usage in `ChartDataUtil` with a native `Set`, then removed the unused `d3-collection` package from the manifest.
- Kept the modern D3 color scale import in `src/lib/utils/index.js` so the overlay color helper continues to work under the newer package split.
- Regenerated `module_tree_full.md` after the dependency and utility cleanup.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Result: utilities/scale compile clean, the bundle still emits successfully, and the extra legacy collection dependency is gone.

### Files touched in this slice

- [src/lib/utils/ChartDataUtil.js](../../src/lib/utils/ChartDataUtil.js)
- [src/lib/utils/index.js](../../src/lib/utils/index.js)
- [package.json](../../package.json)
- [package-lock.json](../../package-lock.json)
- [module_tree_full.md](../../module_tree_full.md)

## 10. Slice 5 Evidence

### Completed

- Series primitives and supporting chart primitives now render cleanly under the modern bundle path.
- The chart stack keeps the React 19 propTypes documentation comment where the files were touched, and the browser smoke shows the full chart shell rendering without runtime regressions.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: browser smoke test on `build/index.html`
- Result: price/volume/indicator primitives render under the demo bundle and the chart remains stable in the browser.

### Files touched in this slice

- [src/lib/series/BarSeries.tsx](../../src/lib/series/BarSeries.tsx)
- [src/lib/series/CandlestickSeries.tsx](../../src/lib/series/CandlestickSeries.tsx)
- [src/lib/series/LineSeries.tsx](../../src/lib/series/LineSeries.tsx)
- [src/lib/series/StraightLine.tsx](../../src/lib/series/StraightLine.tsx)
- [src/lib/series/MACDSeries.tsx](../../src/lib/series/MACDSeries.tsx)
- [src/lib/series/RSISeries.tsx](../../src/lib/series/RSISeries.tsx)
- [src/lib/axes/XAxis.js](../../src/lib/axes/XAxis.js)
- [src/lib/axes/YAxis.js](../../src/lib/axes/YAxis.js)
- [src/lib/coordinates/CrossHairCursor.js](../../src/lib/coordinates/CrossHairCursor.js)
- [src/lib/coordinates/Cursor.js](../../src/lib/coordinates/Cursor.js)
- [src/lib/tooltip/HoverTooltip.js](../../src/lib/tooltip/HoverTooltip.js)

## 11. Slice 6 Evidence

### Completed

- Switched the remaining interaction hot paths to pointer-based D3 APIs so the demo no longer depends on removed `mouse()`/`touches()` helpers.
- Restored the React import in the classic JSX JS files so the interaction render path no longer crashes with `React is not defined`.
- Verified the chart with hover/pan/drag/wheel smoke in the browser after the final rebuild.

### Validation

- Command run: `npm run build:docs`
- Command run: browser hover/drag/wheel smoke on the demo page
- Result: interaction surfaces stay up without page errors after the event-layer migration.

### Files touched in this slice

- [src/lib/EventCapture.js](../../src/lib/EventCapture.js)
- [src/lib/axes/AxisZoomCapture.js](../../src/lib/axes/AxisZoomCapture.js)

## 12. Slice 8 Evidence

### Completed

- Updated the delivery board, slice audit, and audit ledger to reflect the completed migration slices.
- Regenerated `module_tree_full.md` after the final source changes.
- Re-ran `npm run type-check`, `npm run build:docs`, and browser smoke on the refreshed bundle.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: browser smoke test on `build/index.html`
- Result: final validation passed and the handoff records are current.

### Files touched in this slice

- [docs/upgrade-standard/TASKBOARD.md](../../docs/upgrade-standard/TASKBOARD.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [module_tree_full.md](../../module_tree_full.md)

## S15 Evidence: Runtime bug fixes — zoom/pan/brush

### Bugs fixed

**Bug 1 – Zoom/pan domain never changed**
- Root cause: `pointsPerPxThreshold` and `minPointsPerPxThreshold` had no default values in `ChartCanvas.defaultProps`. This caused `canShowTheseManyPeriods(width, arrayLength, undefined, undefined)` to evaluate `Math.floor(839 * undefined) = NaN`, making `arrayLength < NaN` always `false`. `filterData` therefore always returned the unchanged `currentDomain`.
- Fix 1a: Added `pointsPerPxThreshold: 2, minPointsPerPxThreshold: 0.02` to `ChartCanvas.defaultProps`.
- Fix 1b: Added null-guard in `evaluator.js` `canShowTheseManyPeriods` → returns `true` when thresholds are missing.

**Bug 2 – Panel layout overlap (overview panel overlapped MACD)**
- Root cause: `volumeOrigin`, `rsiOrigin`, and `macdOrigin` in `FullDemo.tsx` did not include `overviewHeight` (74 px) in their offset calculations. This created a 74 px blank gap between the price chart and volume chart, and the overview/brush panel overlapped the MACD panel.
- Fix: Added `overviewHeight` term to each `createOrigin(...)` call for volume, RSI, and MACD panels.

### Verification (Playwright browser tests)

| Interaction | Result |
| :--- | :--- |
| Zoom in (5× scroll-up) | `plotDataLength` 160 → 99; domain narrowed from `17:48–20:27` to `18:17–19:56` ✅ |
| Zoom out (5× scroll-down) | Domain expanded from `17:48–20:27` to `17:21–20:53` ✅ |
| Brush span drag (overview panel) | Domain narrowed to brushed range; confirmed `changed: true` ✅ |
| ZoomButtons reset ("C") | Domain reset to full dataset range; confirmed `changed: true` ✅ |
| Pan (drag) | Intentionally disabled when Brush is enabled (`disablePan={enabled}` in `Brush.js` line 191) — by-design behavior ✅ |

### Files touched in this slice

- [src/lib/ChartCanvas.tsx](../../src/lib/ChartCanvas.tsx) — added `pointsPerPxThreshold: 2, minPointsPerPxThreshold: 0.02` to defaultProps
- [src/lib/scale/evaluator.js](../../src/lib/scale/evaluator.js) — null-guard in `canShowTheseManyPeriods`
- [src/demo/FullDemo.tsx](../../src/demo/FullDemo.tsx) — fixed `volumeOrigin`, `rsiOrigin`, `macdOrigin` to include `overviewHeight`
- [module_tree_full.md](../../module_tree_full.md) — regenerated (323 modules)

## 13. Demo landing polish

### Completed

- Rebuilt the demo shell into a polished Vietnamese landing page with a responsive hero, source toggle, stats panel, feature legend, and chart chrome.
- Expanded the demo data helper to add EMA overlays and a live Binance fetch path that shares the same enrichment pipeline as the local CSV fallback.
- Added a small declaration shim for `d3-format` and `d3-time-format`, then installed the missing `d3-force` runtime dependency required by the existing axis implementation.
- Regenerated `module_tree_full.md` after the source changes and verified the new bundle in the browser, including the live source toggle path.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Browser smoke test on `build/index.html`
- Browser toggle smoke on the `Binance trực tiếp` control
- Result: the demo bundle builds successfully, the page renders without runtime errors, and the source toggle switches data without breaking the interaction layer.

### Files touched in this slice

- [package.json](../../package.json)
- [package-lock.json](../../package-lock.json)
- [src/demo/demoData.ts](../../src/demo/demoData.ts)
- [src/demo/FullDemo.tsx](../../src/demo/FullDemo.tsx)
- [src/demo/index.tsx](../../src/demo/index.tsx)
- [src/demo/index.html](../../src/demo/index.html)
- [src/demo/demo.css](../../src/demo/demo.css)
- [src/d3-format.d.ts](../../src/d3-format.d.ts)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [docs/upgrade-standard/TASKBOARD.md](../../docs/upgrade-standard/TASKBOARD.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [module_tree_full.md](../../module_tree_full.md)

## 19. Runtime brush-drag fix — visible span selection

### Completed

- Shrunk the original-like demo layout so the brush overview stays inside the visible viewport on the 504px browser height used here.
- Wired `EventCapture` to keep window `mousemove` attached during brush presses, then moved the `ChartCanvas` mousemove state update out of the RAF gate so brush drags cannot get stuck waiting for redraw timing.
- Regenerated `module_tree_full.md` after the source changes and confirmed the browser span drag now changes the visible range.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: `python scripts/generate_module_tree.py`
- Browser drag smoke on `http://127.0.0.1:4173/index.html`
- Result: span brush now works in the visible viewport and the x-domain changes from `[50,199]` to `[85,122]` after a real drag.

### Files touched in this slice

- [src/lib/EventCapture.tsx](../../src/lib/EventCapture.tsx)
- [src/lib/ChartCanvas.tsx](../../src/lib/ChartCanvas.tsx)
- [src/demo/OriginalLikeDemo.tsx](../../src/demo/OriginalLikeDemo.tsx)
- [src/demo/demo.css](../../src/demo/demo.css)
- [module_tree_full.md](../../module_tree_full.md)

## 20. Runtime wheel-focus + visible range badge fix

### Completed

- Removed the wheel-focus gate from `EventCapture` so a fresh load can zoom immediately without requiring an initial click.
- Added a live visible-range badge to the demo header so wheel zoom and brush spans are obvious even when the chart change is subtle.
- Kept the brush selection styling visible on the dark theme and regenerated `module_tree_full.md` after the runtime change.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: `python scripts/generate_module_tree.py`
- Browser smoke on a fresh tab without click focus
- Result: wheel zoom changed the badge from `149 nến` to `291 nến` immediately, and brush drag updated the badge and visible span styling.

### Files touched in this slice

- [src/lib/EventCapture.tsx](../../src/lib/EventCapture.tsx)
- [src/lib/ChartCanvas.tsx](../../src/lib/ChartCanvas.tsx)
- [src/demo/OriginalLikeDemo.tsx](../../src/demo/OriginalLikeDemo.tsx)
- [src/demo/demo.css](../../src/demo/demo.css)
- [module_tree_full.md](../../module_tree_full.md)

## 21. Zoom-sensitive axis labels

### Completed

- Added zoom-sensitive x-axis formatting so the time labels shift to finer granularity when the visible candle count is small.
- Enabled the upper price chart x-axis while zoomed in, making the axis itself visibly change instead of relying only on the candle density.
- Kept the visible-range badge capped to the real dataset size so the header stays truthful to the rendered candles.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: `python scripts/generate_module_tree.py`
- Browser smoke on a fresh tab while zoomed in
- Result: visible range badge and x-axis format both update with zoom; the page no longer relies on a static axis presentation.

### Files touched in this slice

- [src/demo/OriginalLikeDemo.tsx](../../src/demo/OriginalLikeDemo.tsx)
- [src/lib/ChartCanvas.tsx](../../src/lib/ChartCanvas.tsx)
- [module_tree_full.md](../../module_tree_full.md)

## 22. Empty-plot safety + synced view state

### Completed

- Hardened `getCurrentItem` and `getXValue` so empty plot windows do not crash hover, drag, or zoom anchors.
- Added Brush fallbacks for start/end x-values when the mouse is not over a data point, so selection can still complete safely.
- Synced the demo `xExtents` state to the current visible domain and reset it with the chart so rerenders do not snap the chart back to an old brush range.
- Regenerated `module_tree_full.md` after the source changes.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: `python scripts/generate_module_tree.py`
- Browser smoke on a fresh tab: wheel zoom, brush drag, reset button
- Result: no NaN after zoom, brush drag updates the visible range, and Reset View returns to `149/200` with `X: 50.0 → 199.0`.

### Files touched in this slice

- [src/lib/utils/ChartDataUtil.ts](../../src/lib/utils/ChartDataUtil.ts)
- [src/lib/utils/zoomBehavior.ts](../../src/lib/utils/zoomBehavior.ts)
- [src/lib/interactive/Brush.tsx](../../src/lib/interactive/Brush.tsx)
- [src/demo/OriginalLikeDemo.tsx](../../src/demo/OriginalLikeDemo.tsx)
- [module_tree_full.md](../../module_tree_full.md)

## 7. Slice 2 Evidence

### Completed

- Removed legacy context declarations from the remaining `src/lib` React 19 blockers.
- Replaced the `findDOMNode`-based resize path in `fitDimensions.js` with a wrapper-div measurement path.
- Regenerated `module_tree_full.md` after the source changes.
- Updated the migration board and slice audit to reflect the completed blocker sweep.

### Validation

- Command run: `get_errors` on the touched files
- Command run: `npm run type-check`
- Command run: `& "c:/Mujoco Projects/react-stockcharts-master/.venv/Scripts/python.exe" scripts/generate_module_tree.py`
- Command run: `rg -n "contextTypes|childContextTypes|findDOMNode" src/lib`
- Output: file-scoped checks passed; legacy API grep returned zero matches; module tree regenerated to 320 modules; repo type-check now stops in `src/lib/ChartCanvas.tsx` and `src/lib/GenericComponent.tsx`, which is the next slice

### Files touched in this slice

- [src/lib/BackgroundText.js](../../src/lib/BackgroundText.js)
- [src/lib/annotation/Label.js](../../src/lib/annotation/Label.js)
- [src/lib/coordinates/CrossHairCursor.js](../../src/lib/coordinates/CrossHairCursor.js)
- [src/lib/coordinates/Cursor.js](../../src/lib/coordinates/Cursor.js)
- [src/lib/tooltip/HoverTooltip.js](../../src/lib/tooltip/HoverTooltip.js)
- [src/lib/ZoomButtons.js](../../src/lib/ZoomButtons.js)
- [src/lib/axes/XAxis.js](../../src/lib/axes/XAxis.js)
- [src/lib/axes/YAxis.js](../../src/lib/axes/YAxis.js)
- [src/lib/interactive/InteractiveText.js](../../src/lib/interactive/InteractiveText.js)
- [src/lib/interactive/InteractiveYCoordinate.js](../../src/lib/interactive/InteractiveYCoordinate.js)
- [src/lib/helper/fitDimensions.js](../../src/lib/helper/fitDimensions.js)
- [docs/upgrade-standard/TASKBOARD.md](../../docs/upgrade-standard/TASKBOARD.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [docs/upgrade-standard/IMPLEMENTATION_PLAN.md](../../docs/upgrade-standard/IMPLEMENTATION_PLAN.md)
- [module_tree_full.md](../../module_tree_full.md)

## 14. Slice 10 Evidence

### Completed

- Moved the wheel handler in `EventCapture` onto a native `wheel` listener with `passive: false` so chart zoom can still call `preventDefault` without console noise.
- Verified the live Binance path still loads candles, the brush span still changes the visible range, and wheel zoom changes the hovered data point on the fresh HTTP bundle.
- Regenerated the module inventory after the runtime touch so the repository tree stays in sync with the source snapshot.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Browser smoke test on `http://127.0.0.1:4173/index.html`
- Browser smoke on the `Binance trực tiếp` control
- Browser wheel zoom smoke on the chart surface
- Result: live candles, zoom, and brush interaction remain functional and the passive listener warning no longer appears on the fresh build.

### Files touched in this slice

- [src/lib/EventCapture.js](../../src/lib/EventCapture.js)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [docs/upgrade-standard/TASKBOARD.md](../../docs/upgrade-standard/TASKBOARD.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [module_tree_full.md](../../module_tree_full.md)

## 15. Slice 11 Evidence

### Completed

- Reduced the chart surface height so the brush overview remains inside the visible viewport on smaller layouts.
- Verified the brush span and zoom interactions on the HTTP-served demo after the layout change.
- Regenerated `module_tree_full.md` so the repository inventory reflects the updated runtime snapshot.

### Validation

- Command run: `npm run build:docs`
- Browser measurement of `.chart-surface` after scrolling to the chart
- Browser live-source zoom smoke
- Browser live-source brush span smoke
- Result: the brush panel is visible without extra scrolling on the demo viewport, and zoom / span remain functional on the fresh bundle.

### Files touched in this slice

- [src/demo/FullDemo.tsx](../../src/demo/FullDemo.tsx)
- [src/demo/demo.css](../../src/demo/demo.css)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [docs/upgrade-standard/TASKBOARD.md](../../docs/upgrade-standard/TASKBOARD.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [module_tree_full.md](../../module_tree_full.md)

## 16. Slice 12 Evidence

### Completed

- Fixed brush finalize behavior so span selection now commits on native mouseup/touchend instead of depending on click timing.
- Verified the brush selection in the actual overview panel changes the visible time window and clears the overlay after release.
- Regenerated `module_tree_full.md` after the runtime touch so the source inventory stays current.

### Validation

- Command run: `npm run build:docs`
- Browser drag smoke on the brush panel at the correct chart origin
- Before/after hover comparison on the same point
- Mid-drag screenshot check
- Result: dragging inside the overview panel now changes the visible range and no lingering selection rectangle remains after mouseup.

### Files touched in this slice

- [src/lib/interactive/Brush.js](../../src/lib/interactive/Brush.js)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [module_tree_full.md](../../module_tree_full.md)

## 17. Slice 13 Evidence

### Completed

- Removed legacy D3 event usage by replacing the stale `d3Event` path in `EventCapture` with direct event forwarding.
- Replaced legacy React lifecycles (`componentWillMount`, `componentWillReceiveProps`) with React 19-safe patterns.
- Purged `d3-collection` usage from scale and series layers via native `Map`/`Set` reducers and deterministic key sorting.
- Removed leftover commented legacy import references and regenerated `module_tree_full.md`.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: `rg -n "from \"d3-collection\"|from 'd3-collection'|d3Event|componentWillMount|componentWillReceiveProps" src/**`
- Command run: `& "c:/Mujoco Projects/react-stockcharts-master/.venv/Scripts/python.exe" scripts/generate_module_tree.py`
- Result: type-check/build pass; grep returns zero active legacy matches in `src`; inventory file updated.

### Files touched in this slice

- [src/lib/EventCapture.js](../../src/lib/EventCapture.js)
- [src/lib/interactive/components/InteractiveText.js](../../src/lib/interactive/components/InteractiveText.js)
- [src/lib/scale/financeDiscontinuousScale.js](../../src/lib/scale/financeDiscontinuousScale.js)
- [src/lib/scale/discontinuousTimeScaleProvider.js](../../src/lib/scale/discontinuousTimeScaleProvider.js)
- [src/lib/series/OHLCSeries.js](../../src/lib/series/OHLCSeries.js)
- [src/lib/series/ScatterSeries.js](../../src/lib/series/ScatterSeries.js)
- [src/lib/series/StackedBarSeries.js](../../src/lib/series/StackedBarSeries.js)
- [src/lib/series/VolumeProfileSeries.js](../../src/lib/series/VolumeProfileSeries.js)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [module_tree_full.md](../../module_tree_full.md)

## 18. Slice 14 Evidence

### Completed

- Normalized backlog records with explicit status and evidence columns for every item B-001..B-022.
- Updated taskboard done-lane with final closure tasks and kept execution lanes empty.
- Added final delivery closeout report and linked it from the handoff manifest.
- Kept closure reporting explicit by documenting mixed JS/TS composition as accepted state for this handoff cycle.

### Validation

- Command run: `npm run type-check`
- Command run: `npm run build:docs`
- Command run: legacy blocker scan in `src/**`
- Result: build/type-check pass, no active legacy blocker match, backlog register reports `Open items: 0`.

### Files touched in this slice

- [docs/upgrade-standard/BACKLOG.md](../../docs/upgrade-standard/BACKLOG.md)
- [docs/upgrade-standard/TASKBOARD.md](../../docs/upgrade-standard/TASKBOARD.md)
- [docs/upgrade-standard/DELIVERY_CLOSEOUT.md](../../docs/upgrade-standard/DELIVERY_CLOSEOUT.md)
- [docs/upgrade-standard/HANDOFF_MANIFEST.md](../../docs/upgrade-standard/HANDOFF_MANIFEST.md)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [docs/upgrade-standard/SLICE_AUDIT.md](../../docs/upgrade-standard/SLICE_AUDIT.md)
- [module_tree_full.md](../../module_tree_full.md)

## 19. Slice 15 Evidence

### Completed

- Fixed candlestick rendering in demo where candle bodies collapsed into near-vertical lines.
- Root cause addressed by switching demo candlestick width logic to interval-step pixel width instead of domain-span width.
- Kept dist deletions out of commit scope; only runtime/source files and module tree inventory are included.

### Validation

- Command run: `npx tsc --noEmit`
- Command run: `npm run build:docs`
- Browser check at `http://localhost:8080/` after reload confirms candle body thickness is visible and no longer line-like.
- Result: type-check/build pass and visual regression fixed for candlestick mode.

### Files touched in this slice

- [src/demo/LibraryShowcaseDemo.tsx](../../src/demo/LibraryShowcaseDemo.tsx)
- [src/demo/demo.css](../../src/demo/demo.css)
- [src/demo/usePaneLayout.ts](../../src/demo/usePaneLayout.ts)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [module_tree_full.md](../../module_tree_full.md)

## 20. Slice 16 Evidence

### Completed

- Fixed pane-resize behavior to avoid an initially locked splitter state by rebalancing default pane ratios and minimum heights.
- Hardened splitter pointer handling by using `currentTarget` pointer capture/release and resetting drag state on pointer leave.
- Fixed volume pane rendering regression by anchoring y-extents at zero and applying computed bar width for continuous-time data.
- Regenerated module inventory after source updates.

### Validation

- Command run: `npx tsc --noEmit`
- Command run: `npm run build:docs`
- Command run: `python scripts/generate_module_tree.py`
- Browser audit at `http://localhost:8080/`:
  - Volume bars render as proper bars (no compressed black line artifact).
  - Splitter drag now changes pane boundaries from reset defaults.
  - Chart type switch (`Candlestick` ↔ `OHLC Bar`) updates series label and chart rendering.

### Files touched in this slice

- [src/demo/usePaneLayout.ts](../../src/demo/usePaneLayout.ts)
- [src/demo/ChartPaneSplitter.tsx](../../src/demo/ChartPaneSplitter.tsx)
- [src/demo/LibraryShowcaseDemo.tsx](../../src/demo/LibraryShowcaseDemo.tsx)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [module_tree_full.md](../../module_tree_full.md)

## 21. Slice 17 Evidence

### Completed

- Removed persistent black compressed band artifact by relocating the visible time axis to the bottom pane and suppressing X-axis domain/tick strokes.
- Kept time labels visible while disabling the line rendering that caused the heavy black strip illusion.
- Revalidated the chart layout with live data and regenerated module inventory.

### Validation

- Command run: `npx tsc --noEmit`
- Browser audit at `http://localhost:8080/` confirms:
  - No black compressed band above volume pane.
  - No black compressed band below momentum pane.
  - Time labels still visible at chart bottom.
- Command run: `python scripts/generate_module_tree.py`

### Files touched in this slice

- [src/demo/LibraryShowcaseDemo.tsx](../../src/demo/LibraryShowcaseDemo.tsx)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [module_tree_full.md](../../module_tree_full.md)

## 22. Slice 18 Evidence

### Completed

- Fixed splitter drag reliability by rewriting the splitter interaction to global mouse move/up handling instead of fragile element-local pointer flow.
- Reset pane layout persistence key and widened drag headroom (lower pane minimums) so stored clamped layouts no longer lock splitter movement.
- Prevented chart-type visual overlap by remounting ChartCanvas on chart type/timeframe switch.

### Validation

- Command run: `npx tsc --noEmit`
- Browser audit at `http://localhost:8080/` confirms:
  - Splitter #1 moved from y=272 to y=222 after drag.
  - Splitter #2 moved from y=373 to y=323 after drag.
  - Switching `Candlestick` ↔ `OHLC Bar` no longer leaves overlapped stale drawings.
- Command run: `python scripts/generate_module_tree.py`

### Files touched in this slice

- [src/demo/ChartPaneSplitter.tsx](../../src/demo/ChartPaneSplitter.tsx)
- [src/demo/usePaneLayout.ts](../../src/demo/usePaneLayout.ts)
- [src/demo/LibraryShowcaseDemo.tsx](../../src/demo/LibraryShowcaseDemo.tsx)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [module_tree_full.md](../../module_tree_full.md)

## 23. Slice 19 Evidence

### Completed

- Fixed realtime pane response during splitter drag by binding ChartCanvas reset key (`seriesName`) to current pane heights.
- This ensures each drag delta (`priceH/volumeH/momentumH`) triggers immediate redraw rather than delayed visual updates.

### Validation

- Command run: `npx tsc --noEmit`
- Browser audit at `http://localhost:8080/` confirms splitter boundary updates continuously during drag:
  - Splitter #1 moved `before=222` → `mid=257` → `after=273` in one drag sequence.
- Command run: `python scripts/generate_module_tree.py`

### Files touched in this slice

- [src/demo/LibraryShowcaseDemo.tsx](../../src/demo/LibraryShowcaseDemo.tsx)
- [docs/upgrade-standard/AUDIT_LEDGER.md](../../docs/upgrade-standard/AUDIT_LEDGER.md)
- [module_tree_full.md](../../module_tree_full.md)

---

### Ad-hoc documentation sync — Drawing Tools central docs alignment (2026-05-05)

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: Đồng bộ central project-delivery docs với drawing-tools package đã có sẵn ở `docs/upgrade-standard/drawing-tools/`
- Files modified:
  - `docs/project-delivery/BACKLOG.md` (thêm section 3b: B-130–B-139 Drawing Tools workstream)
  - `docs/project-delivery/TASKBOARD.md` (thêm section 7: TB-41–TB-63 M1/M2/M3 task list)
  - `docs/project-delivery/HANDOFF_MANIFEST.md` (thêm link tới `docs/upgrade-standard/drawing-tools/HANDOFF_MANIFEST.md`)
  - `docs/upgrade-standard/AUDIT_LEDGER.md` (entry này)
- Nội dung:
  - `docs/project-delivery/BACKLOG.md` section 3b: 10 backlog items B-130–B-139 phân nhóm theo milestone M1/M2/M3, pointer về HANDOFF_MANIFEST package.
  - `docs/project-delivery/TASKBOARD.md` section 7: 23 tasks TB-41–TB-63 (TB-41–TB-51 M1, TB-52–TB-59 M2, TB-60–TB-63 M3) với trạng thái TODO, đầu ra bắt buộc, và gate summary per milestone.
  - `docs/project-delivery/HANDOFF_MANIFEST.md`: thêm row bảng cho `docs/upgrade-standard/drawing-tools/HANDOFF_MANIFEST.md` để team có entry point từ central manifest.
- Context:
  - `docs/upgrade-standard/drawing-tools/` đã có 5 file hoàn chỉnh (HANDOFF_MANIFEST, TECH_SPEC, IMPLEMENTATION_PLAN, TASKBOARD, AUDIT_PROTOCOL) từ 2026-05-04.
  - `docs/upgrade-standard/BACKLOG.md` và `docs/upgrade-standard/TASKBOARD.md` đã có Drawing Tools sections từ trước.
  - Đây là lần sync để project-delivery docs (bề mặt central governance) cũng reflect workstream drawing tools.
- Validation:
  - Documentation review → PASS; no broken links; no content gaps

### Drawing Tools Engine — Milestone M1 (core engine + demo integration)

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: Tạo mới toàn bộ drawing engine M1: coordinate bridge, state machine, undo/redo history, SVG render layer, DrawingLayer overlay component, 8 builtin tools (trendLine, hLine, vLine, fibonacci, channel, text, rectangle, arrow), demo shell toolbar integration, i18n keys, keyboard shortcuts (Ctrl+Z/Y, Del, ESC), Vitest unit tests.
- Files mới tạo (src/lib/drawing/):
  - `coordinateUtils.ts` + `coordinateUtils.test.ts`
  - `stateMachine.ts`
  - `history.ts`
  - `renderSvg.ts` + `renderSvg.test.ts`
  - `DrawingLayer.tsx`
  - `registry.ts`
  - `serialization.ts`
  - `shared.ts`
  - `types.ts`
  - `index.ts`
  - `drawing.test.ts`
  - `useDrawingInteraction.ts` + `useDrawingInteraction.test.ts`
  - `builtin/trendLine.ts`, `builtin/hLine.ts`, `builtin/vLine.ts`, `builtin/fibonacci.ts`, `builtin/channel.ts`, `builtin/text.ts`, `builtin/rectangle.ts`, `builtin/arrow.ts`
- Files cập nhật:
  - `src/index.ts` (export drawing engine API)
  - `src/demo/LibraryShowcaseDemo.tsx` (TOOL_DEFS, useDrawingInteraction, DrawingLayer, keyboard shortcuts)
  - `src/demo/i18n.tsx` (tool.rectangle, tool.arrow keys — cả VI lẫn EN)
- Validation:
  - `npm run type-check` → Exit 0, 0 errors
  - `npm test` → 14 test files, 67 tests, 0 failures (16 drawing tests PASS)
  - `npm run build:docs` → webpack compiled successfully, 8.31 MiB bundle
  - Browser smoke → Page loads; toolbar 10 buttons visible; no JS errors; Cursor/Rectangle/Arrow/TrendLine buttons toggle correctly (aria-pressed verified)
  - R08 regression scan (lib→demo boundary) → grep empty, PASS
  - `python scripts/generate_module_tree.py` → 632 modules
  - `module_tree_full.md` regenerated

### Ad-hoc runtime compatibility bridge — GenericChartComponent fallback for drawing tools

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-05
- Scope: bridge runtime ChartProvider mismatch so the drawing-tools demo can mount through the legacy ChartCanvas shell without crashing
- Files modified:
  - `src/lib/GenericChartComponent.tsx`
  - `docs/upgrade-standard/AUDIT_LEDGER.md`
  - `docs/upgrade-standard/SLICE_AUDIT.md`
  - `module_tree_full.md`
- Nội dung:
  - `GenericChartComponentWrapper` now resolves `chartId` from `ChartContext` when available and falls back to the active `StockChartContext` chart list when the provider is missing.
  - The browser demo no longer throws `useChart must be used within a ChartProvider` on the drawing-tools page load path.
- Validation:
  - `get_errors` on `src/lib/GenericChartComponent.tsx` → PASS
  - `npm run type-check` → PASS
  - `npm run build:docs` → PASS
  - Browser smoke on `build/index.html` → PASS; toolbar renders and the page loads without the ChartProvider crash

  ### Ad-hoc demo task — Historical BTCUSDT backfill + ChartCanvas hardening

  - Người thực hiện: GitHub Copilot
  - Ngày: 2026-05-05
  - Scope: nối dữ liệu lịch sử Binance pageable vào demo shell, khử crash startup của ChartCanvas, và chốt smoke/bundle evidence cho viewport range chạy trên history thật
  - Files modified:
    - `src/demo/demoData.ts`
    - `src/demo/chartRange.ts`
    - `src/demo/i18n.tsx`
    - `src/demo/LibraryShowcaseDemo.tsx`
    - `src/demo/__tests__/demoData.test.ts`
    - `src/lib/scale/evaluator.ts`
    - `docs/upgrade-standard/AUDIT_LEDGER.md`
    - `module_tree_full.md`
  - Nội dung bàn giao:
    - Demo BTCUSDT chuyển sang lịch sử Binance pageable/backfill thay vì chỉ một lần load cửa sổ ngắn, nên range button giờ có dữ liệu để kéo viewport thật.
    - Topbar timeframe chips được thu gọn để bỏ `1D` / `1W`, tránh trùng với footer range bar.
    - Chart startup được harden bằng một lớp mount-gate và evaluator fallback để `ChartCanvas` không crash khi vùng lọc ban đầu tạm rỗng.
    - Thêm regression cho helper backfill/merge để bảo vệ path tải lịch sử thật và chặn tái phát lỗi data-loader.
  - Validation:
    - `npm test -- src/demo/__tests__/demoData.test.ts src/demo/__tests__/chartRange.test.ts src/demo/__tests__/i18n.test.tsx` → PASS (6 tests)
    - `npm run type-check` → PASS
    - `npm run build:docs` → PASS
    - Browser smoke on fresh `build/index.html` → PASS; `1M` and `3M` buttons switched to `pressed`/active state and the live BTCUSDT shell kept rendering without ChartCanvas errors
    - Browser smoke on fresh `build/index.html` → PASS; BTCUSDT / BINANCE labels render, topbar chỉ còn intraday chips, footer range presets hiện đúng, và page load không còn ChartCanvas pageError
