# Taskboard: Pane Splitter Resize

## 1. Ready

- [ ] T1. Baseline read: map current pane height flow trong LibraryShowcaseDemo.
- [ ] T2. Define constraints: minHeight cho 3 pane.
- [ ] T3. Draft utility API cho ratio/clamp/sanitize.

## 2. In Progress

- [ ] Chưa có task active.

## 3. Build Tasks

- [ ] T4. Implement ratio utilities.
- [ ] T5. Add unit tests cho edge cases clamp.
- [ ] T6. Render splitter UI elements giữa các pane.
- [ ] T7. Implement pointer drag lifecycle.
- [ ] T8. Wire delta -> layout update theo thời gian thực.
- [ ] T9. Add double-click reset.
- [ ] T10. Persist layout vào local storage.
- [ ] T11. Restore + sanitize persisted layout.
- [ ] T12. Handle container resize and re-clamp.

## 4. QA Tasks

- [ ] T13. Manual smoke desktop (1366x768, 1920x1080).
- [ ] T14. Manual smoke viewport nhỏ.
- [ ] T15. Verify đổi timeframe/chart type không làm mất layout.
- [ ] T16. Verify volume/momentum không còn mất chiều cao.
- [ ] T17. Capture screenshot/video evidence.

## 5. Done

- [ ] Chưa có task done.

## 6. Exit checklist trước merge

- [ ] type-check pass.
- [ ] build:docs pass.
- [ ] test:soak pass.
- [ ] Audit protocol evidence complete.
- [ ] AUDIT_LEDGER trung tâm đã cập nhật.
