# Handoff Manifest

## Mục tiêu

Bộ tài liệu này là gói chuyển giao chuẩn cho `react-stockcharts-master` trong giai đoạn `demo-first`, với định hướng tiếp theo là tách thành widget nhúng được. Điểm vào của bundle này là [README.md](README.md); điểm vào cấp repo là [../README.md](../README.md).

## Phạm vi hiện tại

- Demo shell chính: `src/demo/LibraryShowcaseDemo.tsx`
- Demo phụ: `src/demo/FullDemo.tsx`, `src/demo/OriginalLikeDemo.tsx`, `src/demo/LiveDemo.tsx`
- Core chart runtime: `src/lib/core/**`
- Data demo và live fallback: `src/demo/demoData.ts`
- i18n demo-local: `src/demo/i18n.tsx`
- Chính sách kiến trúc đã có: `docs/planning/DYNAMIC_PANE_SYSTEM.md`, `docs/planning/INDICATOR_SSOT_POLICY.md`

## Tài liệu giao kèm

| Tệp | Vai trò |
| --- | --- |
| `docs/project-delivery/README.md` | Entry point vận hành cho code team và auditor |
| `docs/project-delivery/PROJECT_GOVERNANCE.md` | Luật phát triển không được phá vỡ |
| `docs/project-delivery/TECH_SPEC.md` | Đặc tả kỹ thuật hiện trạng và ranh giới hệ thống |
| `docs/project-delivery/IMPLEMENTATION_PLAN.md` | Lộ trình triển khai theo slice |
| `docs/project-delivery/TASKBOARD.md` | Bảng công việc tác chiến ngắn hạn |
| `docs/project-delivery/BACKLOG.md` | Backlog ưu tiên sau các slice hiện tại |
| `docs/project-delivery/AUDIT_PROTOCOL.md` | Quy trình audit, evidence và validation |
| `docs/project-delivery/HANDOFF_CHECKLIST.md` | Checklist bàn giao trước khi đóng slice |
| `docs/project-delivery/widget/HANDOFF_MANIFEST.md` | **Entry point Slice F — VNStockChart widget boundary** |
| `docs/project-delivery/widget/TECH_SPEC.md` | Đặc tả kỹ thuật VNStockChart: props, i18n, adapter lifecycle |
| `docs/project-delivery/widget/IMPLEMENTATION_PLAN.md` | Tasks F-01→F-09 với dependency chain |
| `docs/project-delivery/widget/TASKBOARD.md` | Bảng task chi tiết + DoD từng task |
| `docs/project-delivery/widget/AUDIT_PROTOCOL.md` | Ma trận test W-01→W-18, gate commands, evidence template |
| `docs/project-delivery/indicator-platform/HANDOFF_MANIFEST.md` | **Entry point GĐ1 — Indicator Platform (IC-1 + IC-2)** |
| `docs/project-delivery/indicator-platform/TECH_SPEC.md` | Đặc tả kỹ thuật GĐ1: canonical store hardening và catalog metadata |
| `docs/project-delivery/indicator-platform/IMPLEMENTATION_PLAN.md` | Slice map IC-1→IC-2 với gate và evidence |
| `docs/project-delivery/indicator-platform/TASKBOARD.md` | Taskboard tác chiến cho IC-1 + IC-2 |
| `docs/project-delivery/indicator-platform/AUDIT_PROTOCOL.md` | Audit protocol riêng cho GĐ1 Indicator Platform |
| `docs/project-delivery/vninvest-integration/HANDOFF_MANIFEST.md` | **Entry point Slice INT — VNInvest Integration** |
| `docs/project-delivery/vninvest-integration/TECH_SPEC.md` | API contract xác minh, TypeScript interfaces, i18n keys, security |
| `docs/project-delivery/vninvest-integration/IMPLEMENTATION_PLAN.md` | Slices INT-1..INT-5 với code templates và exit criteria |
| `docs/project-delivery/vninvest-integration/TASKBOARD.md` | Tasks INT-01→INT-16 với DoD và dependency chain |
| `docs/project-delivery/vninvest-integration/AUDIT_PROTOCOL.md` | Test matrix 14 unit + 9 smoke + 5 security checks + evidence template |
| `quality/QUALITY.md` | Hiến pháp chất lượng của repo |
| `quality/RUN_CODE_REVIEW.md` | Quy trình review có guardrail |
| `quality/RUN_INTEGRATION_TESTS.md` | Quy trình kiểm thử tích hợp và smoke |
| `quality/RUN_SPEC_AUDIT.md` | Quy trình audit spec kiểu Council of Three |
| `AGENTS.md` | Bootstrap file cho mọi AI session mới |
| `docs/upgrade-standard/AUDIT_LEDGER.md` | Ledger chứng cứ thay đổi và validation |
| `module_tree_full.md` | Snapshot inventory module mới nhất |
| `docs/upgrade-standard/drawing-tools/HANDOFF_MANIFEST.md` | Entry point cho Drawing Tools Engine package |

## Quyết định đã chốt

1. Demo vẫn là bề mặt chính trong giai đoạn này; chưa tách widget ngay.
2. UI mới và UI cập nhật phải hỗ trợ song ngữ `vi` và `en`, mặc định `vi`.
3. Core library không được phụ thuộc ngược vào `src/demo`.
4. Indicators phải đi về SSOT; cùng tham số và cùng nguồn phải cho cùng một hình dạng ở mọi pane.
5. Sau mọi thay đổi mã nguồn phải cập nhật `docs/upgrade-standard/AUDIT_LEDGER.md` và regenerate `module_tree_full.md`.
6. Nếu bề mặt công bố dữ liệu thị trường thật, ticker label và lịch sử phải khớp nguồn; không dùng sample history ngắn để giả full history.
7. GĐ1 Indicator Platform là package riêng đã chuẩn bị tài liệu; code team phải bám package `docs/project-delivery/indicator-platform/` và chạy IC-1 trước IC-2.

## Tiêu chí chấp nhận mỗi slice

- `npm run type-check`
- `npm test`
- `npm run build:docs`
- `python scripts/generate_module_tree.py`
- Cập nhật `docs/upgrade-standard/AUDIT_LEDGER.md`

## Trạng thái giao tại thời điểm hiện tại

- Dynamic pane, settings modal, splitter, theme sync: đã có.
- Demo-local i18n cho `vi` và `en`: đã có trên các bề mặt demo chính.
- SSOT runtime cho indicator data flow: đã bàn giao.
- Quality hardening: đã có functional tests cho i18n, pane orchestration, và chart range.
- Historical market data fidelity / backfill: đã bàn giao (Slice E DONE).
- Widget extraction: bộ tài liệu Slice F đã hoàn tất tại `docs/project-delivery/widget/`. Sẵn sàng code F-01.
- Indicator Platform GĐ1: bộ tài liệu IC-1 + IC-2 đã hoàn tất tại `docs/project-delivery/indicator-platform/`. Sẵn sàng code IC-1.
- VNInvest Integration: bộ tài liệu Slice INT đã hoàn tất tại `docs/project-delivery/vninvest-integration/`. Sẵn sàng code sau khi xác nhận CORS pre-condition G-00.
