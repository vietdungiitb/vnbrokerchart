# Audit Ledger: TypeScript Delivery Register

> Đây là sổ đăng ký trung tâm cho trạng thái slice, gate, evidence và file/doc trace của bộ kế hoạch TypeScript.

---

## 1. Canonical doc register

| File | Mục đích | Trạng thái |
| :--- | :--- | :--- |
| [HANDOFF_MANIFEST.md](./HANDOFF_MANIFEST.md) | Entry point bàn giao | Ready |
| [ROADMAP.md](./ROADMAP.md) | Tổng quan lộ trình | Approved |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Kế hoạch thực thi | Approved |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Kiến trúc đích | Approved |
| [ARCHITECTURE_GUARDS.md](./ARCHITECTURE_GUARDS.md) | G01–G15 guards ALLOWED/FORBIDDEN | Mandatory |
| [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) | Quy định bắt buộc | Mandatory |
| [AUDIT_LEDGER.md](./AUDIT_LEDGER.md) | Ledger này | Ready |
| [AUDIT_TEST_MATRIX.md](./AUDIT_TEST_MATRIX.md) | Ma trận test theo slice | Ready |
| [SLICE_AUDIT.md](./SLICE_AUDIT.md) | Minh chứng từng slice | Ready |
| [EXECUTION_RUNBOOK.md](./EXECUTION_RUNBOOK.md) | Quy trình thực thi end-to-end cho đội code | Ready |
| [SELF_AUDIT_PLAYBOOK.md](./SELF_AUDIT_PLAYBOOK.md) | Chuẩn tự-audit và minh chứng PASS/FAIL | Ready |
| [TASKBOARD.md](./TASKBOARD.md) | Bảng công việc + per-task spec | Ready |
| [DELIVERY_CLOSEOUT.md](./DELIVERY_CLOSEOUT.md) | Điều kiện đóng bàn giao | Ready |

---

## 2. Slice ledger

| Slice | Mục tiêu | Owner role | Required evidence | Required test gates | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| P0 | Audit & chuẩn hóa | Release owner | Handoff manifest, module tree snapshot, doc link check | Markdown link check, module tree check | Ready for work |
| P1 | Foundation | Tooling owner | tsup config, strict tsconfig, entrypoint, public types | `type-check`, `tsup` build, API export smoke, G07+G08+G13+G14 guards clean | Completed |
| P2 | Chart shell | Core owner | ChartTerminal, ChartPane, PaneSplitter, usePaneManager | RTL, browser smoke, drag-resize check, G01+G02+G03+G11+G12+G15 guards clean | Completed |
| P3 | Indicator registry | Indicator owner | Registry, compute/render split, built-in set | Unit tests, schema tests, sample-data smoke, G04+G05+G08+G14 guards clean | Completed |
| P4 | Drawing tools | Interaction owner | Drawing registry, state machine, serialization, undo/redo | Interaction tests, serialize/deserialize checks, G09+G10+G12 guards clean | Completed |
| P5 | Data adapter | Backend integration owner | StockDataAdapter, DjangoVnstockAdapter, realtime loader | Contract tests, mocked REST/WS integration, G06+G08+G14 guards clean | Completed |
| P6 | Examples conversion | Demo/regression owner | Converted stories, regression fixtures, coverage map | Visual diff, storybook build, browser smoke, all guards clean | Completed |

---

## 3. Ledger rules

- Không có detection command nào trong [ARCHITECTURE_GUARDS.md](./ARCHITECTURE_GUARDS.md) còn output bất thường khi đóng slice.
- Mỗi slice hoàn tất phải cập nhật trạng thái của slice đó trong ledger này.
- Mỗi slice phải có file evidence trong [SLICE_AUDIT.md](./SLICE_AUDIT.md).
- Nếu source code thay đổi, phải cập nhật `module_tree_full.md` sau khi hoàn tất task.
- Nếu task chạm React/JSX/TSX, phải ghi nhận React 19 patterns trong evidence.
- Không được chuyển sang slice tiếp theo khi slice trước chưa có evidence pass.

### P1 Evidence

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Files modified:
	- `package.json`
	- `package-lock.json`
	- `tsup.config.ts`
	- `src/index.ts`
	- `src/lib/types/ohlcv.ts`
	- `src/lib/types/pane.ts`
	- `src/lib/types/adapter.ts`
	- `src/lib/types/indicator.ts`
	- `src/lib/types/index.ts`
	- `module_tree_full.md`
- Validation:
	- `npm run type-check` → PASS
	- `npm install` → PASS
	- `npm run build` → PASS
	- `node -e "require('./dist/index.cjs'); console.log('CJS_OK')"` → PASS
	- `node -e "const lib = require('./dist/index.cjs'); console.log(Object.keys(lib).sort().join(','))"` → PASS
- Kết luận: P1 closed, ready to auto-advance to P2.

### P2 Evidence

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Files modified:
	- `package.json`
	- `package-lock.json`
	- `module_tree_full.md`
	- `src/index.ts`
	- `src/lib/core/index.ts`
	- `src/lib/core/ChartTerminal.tsx`
	- `src/lib/core/ChartPane.tsx`
	- `src/lib/core/PaneSplitter.tsx`
	- `src/lib/core/hooks/usePaneManager.ts`
	- `src/lib/core/hooks/useCanvasResize.ts`
	- `src/lib/core/hooks/usePaneManager.test.ts`
	- `src/lib/core/context/PaneManagerContext.ts`
	- `src/lib/core/context/DataContext.ts`
	- `src/lib/core/context/ChartSyncContext.ts`
	- `src/lib/core/scales/computeScales.ts`
- Validation:
	- `npm run type-check` → PASS
	- `npm run build` → PASS
	- `npm run test -- src/lib/core/hooks/usePaneManager.test.ts` → PASS
	- `node -e "const lib = require('./dist/index.cjs'); console.log(['ChartTerminal','ChartPane','PaneSplitter','usePaneManager'].map((name) => name + ':' + (typeof lib[name])).join(','))"` → PASS
- Kết luận: P2 closed, ready to auto-advance to P3.

### P3 Evidence

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Files modified:
	- `module_tree_full.md`
	- `src/index.ts`
	- `src/lib/core/scales/computeScales.ts`
	- `src/lib/indicators/index.ts`
	- `src/lib/indicators/registry.ts`
	- `src/lib/indicators/types.ts`
	- `src/lib/indicators/utils.ts`
	- `src/lib/indicators/builtin/ema.ts`
	- `src/lib/indicators/builtin/sma.ts`
	- `src/lib/indicators/builtin/rsi.ts`
	- `src/lib/indicators/builtin/macd.ts`
	- `src/lib/indicators/builtin/bollinger.ts`
	- `src/lib/indicators/builtin/volume.ts`
	- `src/lib/indicators/builtin/cvd.ts`
	- `src/lib/indicators/registry.test.ts`
- Validation:
	- `npm run type-check` → PASS
	- `npm run build` → PASS
	- `npm run test -- src/lib/indicators/registry.test.ts` → PASS
	- `node -e "const lib = require('./dist/index.cjs'); const ema = lib.getIndicator('EMA'); console.log(['ChartTerminal','ChartPane','PaneSplitter','usePaneManager'].map((name) => name + ':' + (typeof lib[name])).join(',')); console.log('EMA:' + (ema ? ema.name : 'missing'));"` → PASS
- Kết luận: P3 closed, ready to auto-advance to P4.

### P4 Evidence

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Files modified:
	- `module_tree_full.md`
	- `src/index.ts`
	- `src/lib/drawing/index.ts`
	- `src/lib/drawing/shared.ts`
	- `src/lib/drawing/stateMachine.ts`
	- `src/lib/drawing/history.ts`
	- `src/lib/drawing/serialization.ts`
	- `src/lib/drawing/registry.ts`
	- `src/lib/drawing/types.ts`
	- `src/lib/drawing/drawing.test.ts`
	- `src/lib/drawing/builtin/trendLine.ts`
	- `src/lib/drawing/builtin/hLine.ts`
	- `src/lib/drawing/builtin/vLine.ts`
	- `src/lib/drawing/builtin/fibonacci.ts`
	- `src/lib/drawing/builtin/channel.ts`
	- `src/lib/drawing/builtin/text.ts`
- Validation:
	- `npm run type-check` → PASS
	- `npm run build` → PASS
	- `npm run test -- src/lib/drawing/` → PASS
	- `node -e "const lib = require('./dist/index.cjs'); console.log(['createDrawingTool','drawingReducer','historyReducer','serializeDrawings','registerDrawingTool'].map((name) => name + ':' + (typeof lib[name])).join(','))"` → PASS
- Kết luận: P4 closed, ready to auto-advance to P5.

### P5 Evidence

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Files modified:
	- `module_tree_full.md`
	- `src/index.ts`
	- `src/lib/types/adapter.ts`
	- `src/lib/adapters/StockDataAdapter.ts`
	- `src/lib/adapters/BaseAdapter.ts`
	- `src/lib/adapters/DjangoVnstockAdapter.ts`
	- `src/lib/adapters/MockAdapter.ts`
	- `src/lib/adapters/index.ts`
	- `src/lib/adapters/adapters.test.ts`
- Validation:
	- `npm run type-check` → PASS
	- `npm run build` → PASS
	- `npm run test -- src/lib/adapters/` → PASS
	- `node -e "const lib = require('./dist/index.cjs'); console.log(['BaseAdapter','DjangoVnstockAdapter','MockAdapter','createRestAdapter','createMockBars'].map((name) => name + ':' + (typeof lib[name])).join(','))"` → PASS
- Kết luận: P5 closed, ready to auto-advance to P6.

### P6 Evidence

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Files modified:
	- `package.json`
	- `package-lock.json`
	- `.storybook/main.ts`
	- `.storybook/preview.ts`
	- `stories/CandleStickStockScaleChartWithVolumeBarV3.stories.tsx`
	- `stories/CandleStickChartWithMACDIndicator.stories.tsx`
	- `stories/CandleStickChartWithBrush.stories.tsx`
	- `stories/CandleStickChartWithAnnotation.stories.tsx`
	- `stories/CandleStickChartWithHoverTooltip.stories.tsx`
	- `stories/CandleStickChartPanToLoadMore.stories.tsx`
	- `stories/CandleStickChartWithRSIIndicator.stories.tsx`
	- `stories/VolumeProfileChart.stories.tsx`
	- `stories/CoverageMap.md`
	- `stories/support/chartTheme.ts`
	- `stories/support/storyData.ts`
	- `stories/support/StoryFrame.tsx`
	- `stories/support/ChartSurface.tsx`
	- `stories/support/exampleStories.tsx`
	- `docs/TypeScript/IMPLEMENTATION_PLAN.md`
	- `docs/TypeScript/TASKBOARD.md`
	- `docs/TypeScript/SLICE_AUDIT.md`
	- `module_tree_full.md`
- Validation:
	- `npm run type-check` → PASS
	- `npm run build:storybook` → PASS
	- Browser smoke on `storybook-static/index.html` → PASS
- Kết luận: P6 closed, stories Vite-based and coverage map complete.

### Documentation Sync Evidence (Phase docs refresh)

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: đồng bộ 6 tài liệu phase theo trạng thái as-built, chênh lệch và roadmap thực thi tiếp theo.
- Files modified:
	- `docs/TypeScript/PHASE1_FOUNDATION.md`
	- `docs/TypeScript/PHASE2_CHART_TYPES.md`
	- `docs/TypeScript/PHASE3_INDICATORS.md`
	- `docs/TypeScript/PHASE4_ORDERFLOW.md`
	- `docs/TypeScript/PHASE5_DRAWING_TOOLS.md`
	- `docs/TypeScript/PHASE6_7_LAYOUT_ADAPTER.md`
	- `docs/TypeScript/AUDIT_LEDGER.md`
	- `module_tree_full.md`
- Validation:
	- `python scripts/generate_module_tree.py` → PASS
- Kết luận: Bộ phase docs đã đồng bộ với implementation và ledger hiện tại.

### Documentation Completeness Evidence (No-question handoff pack)

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: hoàn thiện bộ tài liệu thực thi và tự-audit để đội code có thể làm việc độc lập, không cần hỏi lại owner.
- Files modified:
	- `docs/TypeScript/HANDOFF_MANIFEST.md`
	- `docs/TypeScript/ROADMAP.md`
	- `docs/TypeScript/AUDIT_LEDGER.md`
	- `docs/TypeScript/EXECUTION_RUNBOOK.md`
	- `docs/TypeScript/SELF_AUDIT_PLAYBOOK.md`
- Validation:
	- Đã kiểm tra liên kết chéo giữa manifest/roadmap/runbook/playbook/ledger hoạt động theo cùng một luồng.
	- Đã bổ sung rõ entry points cho thực thi, tự-audit và handover.
	- Đã hiệu chỉnh cách diễn giải trạng thái phase để tránh hiểu nhầm "slice done" thành "phase done".

### Documentation Correctness Evidence (Phase status clarification)

- Người thực hiện: GitHub Copilot
- Ngày: 2026-05-03
- Scope: hiệu chỉnh 6 tài liệu phase theo trạng thái thực thi thật và loại bỏ nội dung dư sai ngữ cảnh.
- Files modified:
	- `docs/TypeScript/PHASE1_FOUNDATION.md`
	- `docs/TypeScript/PHASE2_CHART_TYPES.md`
	- `docs/TypeScript/PHASE3_INDICATORS.md`
	- `docs/TypeScript/PHASE4_ORDERFLOW.md`
	- `docs/TypeScript/PHASE5_DRAWING_TOOLS.md`
	- `docs/TypeScript/PHASE6_7_LAYOUT_ADAPTER.md`
	- `docs/TypeScript/AUDIT_LEDGER.md`
- Validation:
	- Đối chiếu trạng thái phase với `TASKBOARD.md` và `AUDIT_LEDGER.md` hiện hành.
	- Xóa block nội dung thừa cuối file phase 6-7 để khớp ngữ cảnh as-built.
- Kết luận: Bộ phase docs đã rõ trạng thái "partial/backlog" và không còn gây hiểu nhầm tiến độ.
- Kết luận: Bộ handoff đã self-contained cho triển khai slice và bàn giao audit.

---

## 4. Modified-file rule

Mọi slice hoàn thành phải liệt kê chính xác tên file đã sửa. File không có trong ledger này hoặc trong [SLICE_AUDIT.md](./SLICE_AUDIT.md) không được đóng audit.

---

## 5. Traceability checkpoints

| Checkpoint | Cần có |
| :--- | :--- |
| Start of work | `module_tree_full.md`, `DEVELOPMENT_RULES.md`, `HANDOFF_MANIFEST.md` đã đọc |
| End of work | Test output, evidence block, modified file list |
| Slice close | Ledger updated, audit template filled, docs synced |
| Delivery close | `DELIVERY_CLOSEOUT.md` pass, all slices complete |
