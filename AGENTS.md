# AGENTS

## Project summary

`react-stockcharts-master` là repo charting demo-first với core chart library và nhiều demo surfaces. Mục tiêu ngắn hạn là hoàn thiện demo shell và correctness runtime. Mục tiêu dài hạn là tách thành widget nhúng được.

## Read first

1. `docs/project-delivery/HANDOFF_MANIFEST.md`
2. `docs/project-delivery/PROJECT_GOVERNANCE.md`
3. `docs/project-delivery/TECH_SPEC.md`
4. `quality/QUALITY.md`
5. `docs/planning/INDICATOR_SSOT_POLICY.md`

## Canonical commands

```bash
npm run type-check
npm test
npm run build:docs
npm run build
python scripts/generate_module_tree.py
```

## Architecture map

- Demo entry: `src/demo/index.tsx`
- Main runtime shell: `src/demo/LibraryShowcaseDemo.tsx`
- Demo i18n: `src/demo/i18n.tsx`
- Pane state: `src/lib/core/hooks/useDynamicPanes.ts`
- Core dynamic chart: `src/lib/core/DynamicChart.tsx`
- Series registry: `src/lib/core/registry/SeriesRegistry.ts`
- Demo data source: `src/demo/demoData.ts`

## Hard rules for any agent

1. Không thêm hardcoded UI text mới; dùng i18n key.
2. Không để `src/lib/**` import ngược từ `src/demo/**`.
3. Với thay đổi lớn, bám slice trong `docs/project-delivery/IMPLEMENTATION_PLAN.md`.
4. Sau thay đổi mã nguồn phải update `docs/upgrade-standard/AUDIT_LEDGER.md` và `module_tree_full.md`.
5. Không coi build pass là đủ nếu spec/runtime behavior chưa đúng.
6. Toàn bộ ứng dụng phải dùng chung một bộ template giao diện với web root; không tạo template hoặc layout riêng cho từng surface nếu cùng chức năng.

## Known active gap

- SSOT indicator runtime chưa hoàn tất. Đây là workstream ưu tiên tiếp theo.

## Quality docs

- `quality/QUALITY.md`
- `quality/RUN_CODE_REVIEW.md`
- `quality/RUN_INTEGRATION_TESTS.md`
- `quality/RUN_SPEC_AUDIT.md`
