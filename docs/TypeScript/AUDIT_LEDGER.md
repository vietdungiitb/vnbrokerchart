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
| [TASKBOARD.md](./TASKBOARD.md) | Bảng công việc + per-task spec | Ready |
| [DELIVERY_CLOSEOUT.md](./DELIVERY_CLOSEOUT.md) | Điều kiện đóng bàn giao | Ready |

---

## 2. Slice ledger

| Slice | Mục tiêu | Owner role | Required evidence | Required test gates | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| P0 | Audit & chuẩn hóa | Release owner | Handoff manifest, module tree snapshot, doc link check | Markdown link check, module tree check | Ready for work |
| P1 | Foundation | Tooling owner | tsup config, strict tsconfig, entrypoint, public types | `type-check`, `tsup` build, API export smoke, G07+G08+G13+G14 guards clean | Ready for work |
| P2 | Chart shell | Core owner | ChartTerminal, ChartPane, PaneSplitter, usePaneManager | RTL, browser smoke, drag-resize check, G01+G02+G03+G11+G12+G15 guards clean | Ready for work |
| P3 | Indicator registry | Indicator owner | Registry, compute/render split, built-in set | Unit tests, schema tests, sample-data smoke, G04+G05+G08+G14 guards clean | Ready for work |
| P4 | Drawing tools | Interaction owner | Drawing registry, state machine, serialization, undo/redo | Interaction tests, serialize/deserialize checks, G09+G10+G12 guards clean | Ready for work |
| P5 | Data adapter | Backend integration owner | StockDataAdapter, DjangoVnstockAdapter, realtime loader | Contract tests, mocked REST/WS integration, G06+G08+G14 guards clean | Ready for work |
| P6 | Examples conversion | Demo/regression owner | Converted stories, regression fixtures, coverage map | Visual diff, storybook build, browser smoke, all guards clean | Ready for work |

---

## 3. Ledger rules

- Không có detection command nào trong [ARCHITECTURE_GUARDS.md](./ARCHITECTURE_GUARDS.md) còn output bất thường khi đóng slice.
- Mỗi slice hoàn tất phải cập nhật trạng thái của slice đó trong ledger này.
- Mỗi slice phải có file evidence trong [SLICE_AUDIT.md](./SLICE_AUDIT.md).
- Nếu source code thay đổi, phải cập nhật `module_tree_full.md` sau khi hoàn tất task.
- Nếu task chạm React/JSX/TSX, phải ghi nhận React 19 patterns trong evidence.
- Không được chuyển sang slice tiếp theo khi slice trước chưa có evidence pass.

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
