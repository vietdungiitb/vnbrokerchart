# Taskboard

| ID | Trạng thái | Công việc | Đầu ra bắt buộc |
| --- | --- | --- | --- |
| PD-01 | DONE | Chuẩn hóa shell demo và settings modal | Runtime shell ổn định, không còn panel cũ hoạt động |
| PD-02 | DONE | Thêm i18n `vi/en` cho demo surfaces | Provider, dictionary, locale switch, html lang sync |
| PD-03 | DONE | Thực thi SSOT cho indicator runtime | Canonical indicator data flow qua `enrichData`, regressions PASS |
| PD-04 | DONE | Bổ sung functional spec tests | i18n, pane restore, chart range helper, type-check/build PASS |
| PD-05 | DONE | Khôi phục lịch sử Binance thật | Pagination/backfill, pan-left append, range `1D`/`5D`/`1M`/`3M`/`YTD`/`1Y`/`All` đúng lịch sử |
| PD-06 | READY | Tách widget boundary — VNStockChart | Bộ tài liệu đầy đủ tại `docs/project-delivery/widget/`. Tasks F-01→F-09 đã định nghĩa. Chờ code. |

## Cách dùng bảng này

- `DONE`: đã có evidence trong `AUDIT_LEDGER.md`
- `READY`: slice đã đủ context và có thể code ngay sau khi được duyệt
- `TODO`: chưa nên triển khai trước khi slice trước đóng đủ evidence

---

## 7. Drawing Tools Engine (TB-41–TB-63)

> Gate M1 phải PASS trước khi bắt đầu M2. Gate M2 phải PASS trước khi bắt đầu M3.  
> Tài liệu chi tiết: [`docs/upgrade-standard/drawing-tools/`](../upgrade-standard/drawing-tools/HANDOFF_MANIFEST.md)

### Milestone M1 — Core Drawing Engine

| ID | Trạng thái | Công việc | Đầu ra bắt buộc |
| :--- | :--- | :--- | :--- |
| TB-41 | TODO | Tạo `coordinateUtils.ts` — coordinate bridge | pixelToChartPoint + chartPointToPixel roundtrip test PASS |
| TB-42 | TODO | Tạo `renderSvg.ts` — SVG render cho 8 tool types | renderDrawingToSvg trả ReactElement[] cho cả 8 types; type-check PASS |
| TB-43 | TODO | Tạo `useDrawingInteraction.ts` — interaction hook | Hook expose state/undo/redo/delete/cancel; unit test PASS |
| TB-44 | TODO | Tạo `DrawingLayer.tsx` — SVG overlay component | Mount SVG overlay; pointer events → dispatch đúng action; browser smoke PASS |
| TB-45 | TODO | Tạo `builtin/rectangle.ts` | createDraft + updateDraft test PASS; type-check clean |
| TB-46 | TODO | Tạo `builtin/arrow.ts` | createDraft + updateDraft test PASS; type-check clean |
| TB-47 | TODO | Sửa `types.ts` — thêm rectangle, arrow, fibLevels, label | DrawingToolType union đúng; type-check PASS |
| TB-48 | TODO | Sửa `drawing/index.ts` — export + register mới | listDrawingTools() trả 8 tools; export đầy đủ |
| TB-49 | TODO | Sửa `LibraryShowcaseDemo.tsx` — mount DrawingLayer + keyboard | Click tool → vẽ được; Ctrl+Z/Y/ESC/Del hoạt động |
| TB-50 | TODO | Sửa `i18n.tsx` — thêm "tool.rectangle", "tool.arrow" | Cả vi + en có key; không còn missing i18n key |
| TB-51 | TODO | Sửa `demo.css` — cursor modes, handles, selected state | CSS classes đúng per tool mode; visual check PASS |

**Gate M1:** `npm run type-check` PASS · `npm test` PASS · browser smoke F01–F27 PASS

### Milestone M2 — Inspector + Persistence

| ID | Trạng thái | Công việc | Đầu ra bắt buộc |
| :--- | :--- | :--- | :--- |
| TB-52 | TODO | Tạo `DrawingStorage.ts` — localStorage adapter | save/load/clear/export/import đúng schema; unit test PASS |
| TB-53 | TODO | Tạo `useDrawingStorage.ts` — auto-save hook | Auto-save + load on mount; smoke: reload giữ drawings |
| TB-54 | TODO | Tạo `DrawingInspector.tsx` — floating property panel | Color/stroke/linestyle/lock controls render; onChange PASS |
| TB-55 | TODO | Sửa `types.ts` — thêm symbol, timeframe; sửa strokeDasharray type | Type-check PASS |
| TB-56 | TODO | Sửa `drawing/index.ts` — export mới M2 | Export đầy đủ; type-check PASS |
| TB-57 | TODO | Sửa `LibraryShowcaseDemo.tsx` — wire storage, inspector, export/import | Reload = persist; inspector hiện khi selected; browser smoke PASS |
| TB-58 | TODO | Sửa `i18n.tsx` — thêm drawing.* keys M2 | Cả vi + en có key |
| TB-59 | TODO | Sửa `demo.css` — inspector panel, color swatch, slider | Panel đẹp, không overlap chart; visual check PASS |

**Gate M2:** `npm run type-check` PASS · browser smoke F30–F39 PASS

### Milestone M3 — Advanced Tools + Alert Markers

| ID | Trạng thái | Công việc | Đầu ra bắt buộc |
| :--- | :--- | :--- | :--- |
| TB-60 | TODO | Sửa `types.ts` + Tạo `builtin/priceRange.ts` + `positionBox.ts` + `fibExtension.ts` | Type-check PASS; unit tests PASS; badge text đúng; R/R ratio đúng |
| TB-61 | TODO | Sửa `renderSvg.ts` + `DrawingLayer.tsx` — render M3 tools + multi-select | Render đúng trên browser; Shift+click highlights 2+ drawings |
| TB-62 | TODO | Sửa `drawing/index.ts` + `LibraryShowcaseDemo.tsx` — toolbar divider M3 | 11 tools registered; toolbar có divider Lines/Fib/Shapes/Analysis |
| TB-63 | TODO | Sửa `i18n.tsx` + `demo.css` — M3 additions | Keys đủ; CSS positionBox + priceRange; visual check PASS |

**Gate M3:** `npm run type-check` PASS · browser smoke F40–F47 PASS · `module_tree_full.md` regenerated
