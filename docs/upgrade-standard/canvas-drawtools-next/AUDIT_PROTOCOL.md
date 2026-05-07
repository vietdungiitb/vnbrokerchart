# Audit Protocol — Canvas DrawTools Next (CE-NEXT)

> **Phiên bản:** 0.1 · 2026-05-06
> **Áp dụng cho:** CE-11 · CE-12 · CE-13
> **Phụ thuộc:** CE-10 đã hoàn tất

---

## 1. Mục tiêu audit

Audit của CE-NEXT phải trả lời rõ 3 câu hỏi:

1. Đã thay đổi gì trong object editing và pane-aware workflow.
2. Thay đổi đó có khớp với spec và plan hay không.
3. Có thể verify lại nhanh bằng command và smoke nào.

---

## 2. Validation commands chuẩn

Chạy từ root repo sau mỗi sprint hoặc sau mỗi slice lớn:

```powershell
npm run type-check
npm test
npm run build:docs
python scripts/generate_module_tree.py
```

### Pass criteria mong đợi

- `npm run type-check` -> 0 errors.
- `npm test` -> không có regression mới.
- `npm run build:docs` -> build thành công.
- `python scripts/generate_module_tree.py` -> inventory cập nhật nếu source thay đổi.

---

## 3. Smoke checklist theo sprint

### Sprint 1 — Object editing core

- [ ] Drag object đã chọn -> object move đúng theo chart coordinates.
- [ ] Resize handle -> geometry update đúng tool.
- [ ] Delete -> drawing biến mất khỏi chart.
- [ ] Duplicate / Copy / Paste -> tạo bản sao có id mới và offset hợp lý.
- [ ] Undo / Redo -> state quay lại đúng.
- [ ] Lock -> không cho move/resize/delete nhưng vẫn render.

### Sprint 2 — Trading UX layer

- [ ] Price label trên Y-axis hiển thị đúng.
- [ ] Magnet cursor xuất hiện khi snap active.
- [ ] Measuring tool hiển thị Δ price và Δ bars.
- [ ] Keyboard shortcuts hoạt động đúng.
- [ ] Right-click context menu mở đúng object ngữ cảnh.
- [ ] Inline text editing commit/cancel đúng.

### Sprint 3 — Multi-pane workflow

- [ ] Drawing trên RSI/MACD pane render đúng.
- [ ] Hit test theo pane scale đúng.
- [ ] Copy/paste giữa panes không làm hỏng geometry.
- [ ] Persistence giữ paneId và yScale binding.
- [ ] Reload demo vẫn giữ các drawing đúng pane.

---

## 4. Evidence template cho AUDIT_LEDGER.md

Khi từng sprint hoàn tất, ghi vào `docs/upgrade-standard/AUDIT_LEDGER.md` theo khung sau:

```markdown
## CE-NEXT — Sprint X

| Field | Value |
|---|---|
| Date | 2026-05-XX |
| Sprint | CE-11 / CE-12 / CE-13 |
| Files modified | ... |
| Behavior changed | ... |
| Validation | ... |
| Browser smoke | ... |
| Residual risk | ... |
```

### Yêu cầu bắt buộc

- Ghi đầy đủ file modified.
- Ghi command và kết quả thực tế.
- Ghi residual risk nếu còn.
- Không đóng sprint nếu thiếu browser smoke khi sprint đó có UI change.

---

## 5. Checklist audit finale

Package CE-NEXT chỉ được coi là đóng khi:

- [ ] CE-11, CE-12, CE-13 đều có evidence.
- [ ] `AUDIT_LEDGER.md` có entry cho từng sprint.
- [ ] `module_tree_full.md` được regenerate sau source change.
- [ ] `npm run type-check` pass.
- [ ] `npm test` pass.
- [ ] `npm run build:docs` pass.
- [ ] Browser smoke cho move/resize/delete/label/pane support đều đạt.

---

## 6. Gợi ý smoke theo rủi ro

| Rủi ro | Smoke ưu tiên |
|---|---|
| Drag move lệch tọa độ | Kéo line rồi so điểm đầu/cuối trước và sau drag |
| Resize sai handle | Kéo từng handle riêng và đo geometry |
| Delete không đồng bộ selection | Xóa object rồi kiểm tra inspector / selection state |
| Shortcut xung đột browser | Thử L/F/R/T/Del/Esc/Ctrl+C/V/Z/Y trong chart focus |
| Pane-aware lệch scale | Vẽ cùng object trên price pane và indicator pane |

---

## 7. Quy tắc đóng việc

- Không đóng sprint nếu thiếu evidence trong ledger.
- Không dùng build pass làm bằng chứng duy nhất nếu behavior chưa đúng.
- Không thêm scope mới vào giữa sprint nếu chưa update plan.
- Nếu phát hiện thêm gap lớn, mở backlog item mới thay vì lách vào sprint hiện tại.
