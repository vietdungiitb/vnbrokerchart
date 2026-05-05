# Handoff Manifest

## Mục tiêu

Bộ tài liệu này là gói chuyển giao chuẩn cho `react-stockcharts-master` trong giai đoạn `demo-first`, với định hướng tiếp theo là tách thành widget nhúng được. Tài liệu phải đủ rõ để đội code tiếp tục mà không cần hỏi lại các quyết định nền tảng.

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
| `docs/project-delivery/PROJECT_GOVERNANCE.md` | Luật phát triển không được phá vỡ |
| `docs/project-delivery/TECH_SPEC.md` | Đặc tả kỹ thuật hiện trạng và ranh giới hệ thống |
| `docs/project-delivery/IMPLEMENTATION_PLAN.md` | Lộ trình triển khai theo slice |
| `docs/project-delivery/TASKBOARD.md` | Bảng công việc tác chiến ngắn hạn |
| `docs/project-delivery/BACKLOG.md` | Backlog ưu tiên sau các slice hiện tại |
| `docs/project-delivery/AUDIT_PROTOCOL.md` | Quy trình audit, evidence và validation |
| `docs/project-delivery/HANDOFF_CHECKLIST.md` | Checklist bàn giao trước khi đóng slice |
| `quality/QUALITY.md` | Hiến pháp chất lượng của repo |
| `quality/RUN_CODE_REVIEW.md` | Quy trình review có guardrail |
| `quality/RUN_INTEGRATION_TESTS.md` | Quy trình kiểm thử tích hợp và smoke |
| `quality/RUN_SPEC_AUDIT.md` | Quy trình audit spec kiểu Council of Three |
| `AGENTS.md` | Bootstrap file cho mọi AI session mới |
| `docs/upgrade-standard/drawing-tools/HANDOFF_MANIFEST.md` | Entry point cho Drawing Tools Engine package |

## Quyết định đã chốt

1. Demo vẫn là bề mặt chính trong giai đoạn này; chưa tách widget ngay.
2. UI mới và UI cập nhật phải hỗ trợ song ngữ `vi` và `en`, mặc định `vi`.
3. Core library không được phụ thuộc ngược vào `src/demo`.
4. Indicators phải đi về SSOT; cùng tham số và cùng nguồn phải cho cùng một hình dạng ở mọi pane.
5. Sau mọi thay đổi mã nguồn phải cập nhật `docs/upgrade-standard/AUDIT_LEDGER.md` và regenerate `module_tree_full.md`.

## Tiêu chí chấp nhận mỗi slice

- `npm run type-check`
- `npm test`
- `npm run build:docs`
- `python scripts/generate_module_tree.py`
- Cập nhật `docs/upgrade-standard/AUDIT_LEDGER.md`

## Trạng thái giao tại thời điểm hiện tại

- Dynamic pane, settings modal, splitter, theme sync: đã có.
- Demo-local i18n cho `vi` và `en`: đã có trên các bề mặt demo chính.
- SSOT runtime cho indicator data flow: chưa hoàn tất, là workstream tiếp theo.
- Widget extraction: chưa bắt đầu, chỉ mới chuẩn bị ranh giới kiến trúc.
