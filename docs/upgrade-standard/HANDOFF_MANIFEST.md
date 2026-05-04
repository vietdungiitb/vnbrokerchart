# Handoff Manifest: TypeScript Migration v3.0

## 1. Bối cảnh

Tài liệu này là **entry point** cho chương trình chuyển đổi 100% source code `src/` từ JavaScript sang TypeScript nghiêm ngặt (strict mode), sử dụng React 19 + TypeScript 5.9 + D3 scoped packages.

**Ngày bắt đầu chương trình v3.0**: 2026-05-03  
**Hiện trạng tại thời điểm khởi đầu**: 168 file `.js` còn lại / 20 file `.ts/.tsx` đã có  
**Mục tiêu kết thúc**: 0 file `.js` trong `src/`

---

## 2. Deliverables trong `docs/upgrade-standard/`

| File | Mục đích | Phiên bản |
| :--- | :--- | :--- |
| [TECH_SPEC.md](TECH_SPEC.md) | Đặc tả kỹ thuật, target architecture, nguyên tắc | v3.0 |
| [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) | Hướng dẫn chiến thuật per-file cho developer | v3.0 |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Kế hoạch theo slice với gates rõ ràng | v3.0 |
| [TASKBOARD.md](TASKBOARD.md) | Bảng công việc — Done/Ready/Queued/Blocked | v3.0 |
| [BACKLOG.md](BACKLOG.md) | Đăng ký backlog với 21 open items | v3.0 |
| [SLICE_AUDIT.md](SLICE_AUDIT.md) | Checklist audit + evidence template từng slice | v3.0 |
| [AUDIT_LEDGER.md](AUDIT_LEDGER.md) | Ledger trạng thái canonical + file register | v3.0 |
| [DELIVERY_CLOSEOUT.md](DELIVERY_CLOSEOUT.md) | Báo cáo đóng v2.0 + trạng thái mở cho v3.0 | v3.0 |

### Gói bàn giao bổ sung cho tính năng mới

- [splitter-pane-resize/HANDOFF_MANIFEST.md](splitter-pane-resize/HANDOFF_MANIFEST.md): Entry point cho bộ tài liệu triển khai splitter thay đổi chiều cao pane kỹ thuật (GoCharting-style), bao gồm spec, implementation plan, taskboard và audit protocol.

---

## 3. Trạng thái tiền đề (không cần làm lại)

| Hạng mục | Trạng thái |
| :--- | :--- |
| React 19 API (`contextTypes`, `findDOMNode`) | ✅ Đã xóa — S2 |
| Core engine (`ChartCanvas.tsx`, `GenericComponent.tsx`) | ✅ Đã typed — S3 |
| Context (`StockChartContext.tsx`) + domain types (`types.ts`) | ✅ Đã typed — S1/S3 |
| `tsconfig.json` với `strict: true` | ✅ Đang hoạt động |
| Legacy D3/lifecycle purge | ✅ Đã xóa — S13 |
| Demo (FullDemo + LiveDemo + offline fallback) | ✅ Hoạt động — S7/S9 |
| Runtime zoom/pan/brush verified | ✅ Hoạt động — S15 |

---

## 4. Thứ tự làm việc cho team

1. **Đọc trước**: `TECH_SPEC.md` → hiểu target architecture và nguyên tắc.
2. **Chiến thuật per-file**: `MIGRATION_GUIDE.md` → quy trình rename + type từng file.
3. **Chọn slice**: `IMPLEMENTATION_PLAN.md` → xem slice nào đang mở, gate nào cần pass.
4. **Theo dõi tiến độ**: `TASKBOARD.md` → kéo task từ Ready → In Progress → Done.
5. **Ghi evidence**: `SLICE_AUDIT.md` → điền checklist sau mỗi slice.
6. **Cập nhật ledger**: `AUDIT_LEDGER.md` → ghi tên file đã rename, output lệnh.

---

## 5. Tiêu chí thành công cuối cùng (Gate G3)

```
✅ npm run type-check   → PASS, zero error
✅ npm run build:docs   → PASS
✅ Get-ChildItem src -Recurse -Include "*.js" → 0 kết quả
✅ python scripts/generate_module_tree.py → 0 file .js trong src/
✅ Browser smoke: zoom + pan + brush + indicators + tooltip + axes → tất cả hoạt động
✅ AUDIT_LEDGER.md S16–S22 đầy đủ evidence
✅ DELIVERY_CLOSEOUT.md v3.0 cập nhật
```

---

## 6. Quy tắc vận hành

- Mọi task không có trong `BACKLOG.md` không thuộc delivery cycle này.
- Không commit nếu `npm run build:docs` đang lỗi.
- Không bắt đầu Giai đoạn 2 trước khi Gate G1 pass.
- Không bắt đầu Giai đoạn 3 trước khi Gate G2 pass.

---

## 7. Tóm tắt tiến độ

| Giai đoạn | Slice | Files | Status |
| :--- | :--- | :--- | :--- |
| **Đã hoàn thành (v2.0)** | S0–S15 | 20 TS files; runtime OK | ✅ Done |
| **Giai đoạn 1** | S16–S17 | 46 files (utils/scale/helper/calculator/index) | ⬜ Open |
| **Giai đoạn 2** | S18–S20 | 61 files (series/axes/coords/tooltip/annotation) | ⬜ Open |
| **Giai đoạn 3** | S21–S22 | 61 files (indicator/interactive/root) | ⬜ Open |

## 2. Deliverables in `docs/upgrade-standard/`
1. **[TECH_SPEC.md](TECH_SPEC.md)**: The architectural blueprint.
2. **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)**: The tactical "how-to" for developers.
3. **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)**: Slice-by-slice execution plan with gates and ordering.
4. **[TASKBOARD.md](TASKBOARD.md)**: Workboard for the delivery team.
5. **[BACKLOG.md](BACKLOG.md)**: Backlog register with status and open-item count.
6. **[SLICE_AUDIT.md](SLICE_AUDIT.md)**: Self-audit evidence template and validation gates per slice.
7. **[AUDIT_LEDGER.md](AUDIT_LEDGER.md)**: Canonical status ledger and modified-file register.
8. **[DELIVERY_CLOSEOUT.md](DELIVERY_CLOSEOUT.md)**: Final closure report and release-ready handoff summary.

## 3. Key Reference points
- **Source Code**: `src/lib/` (To be migrated).
- **Original Project**: [https://github.com/rrag/react-stockcharts](https://github.com/rrag/react-stockcharts) (Legacy Reference).
- **Target Platform**: React 19, TypeScript 5.x, Webpack 5.x.

## 4. Execution Order for the Team
1. **Validation**: Read `TECH_SPEC.md` and `MIGRATION_GUIDE.md` before touching code.
2. **Plan lock**: Use `IMPLEMENTATION_PLAN.md` to choose the active slice.
3. **Track work**: Move tasks in `TASKBOARD.md` and expand items from `BACKLOG.md`.
4. **Prove each slice**: Record command output and file-level proof in `SLICE_AUDIT.md`.
5. **Ledger discipline**: Update `AUDIT_LEDGER.md` after every completed slice.
6. **Demo**: Restore the demo last, with an offline-safe fallback so the app can be verified without asking for clarification.

## 5. Success Criteria
- The library builds without errors.
- The `LiveDemo` renders a candlestick chart with real-time/internet data.
- Zero usage of legacy React APIs in active source paths.
- Backlog register has `Open items: 0` with audited evidence links.

## 6. Current closure state
- Migration program S0-S13: closed and evidenced.
- Operational backlog for this handoff cycle: closed.
- Mixed JS/TS composition in `src/lib` is accepted for this cycle and documented in `DELIVERY_CLOSEOUT.md`.

## 7. Operating Rule
The team should treat this manifest as the entry point. If a task is not in `BACKLOG.md`, it is not part of the current delivery slice.

