# RUN_INTEGRATION_TESTS

## Working directory

Mọi command chạy từ root repo bằng đường dẫn tương đối. Không dùng absolute path trong protocol này.

## Execution UX

### Phase 1. Plan

Trước khi chạy, agent phải hiển thị bảng sau:

| Step | Mục tiêu | Loại | Blocking |
| --- | --- | --- | --- |
| 1 | Type check | automated | yes |
| 2 | Unit/regression tests | automated | yes |
| 3 | Docs build | automated | yes |
| 4 | Offline UI smoke | manual-assisted | yes |
| 5 | Live fallback smoke | manual-assisted | optional theo network |

### Phase 2. Progress

Mỗi bước phải cập nhật một dòng:

- `⧗ Step 2/5 npm test`
- `✓ Step 2/5 passed`
- `✗ Step 4/5 failed: locale switch left mixed strings in modal`

### Phase 3. Summary

Kết thúc bằng bảng pass/fail và một khuyến nghị merge hay không merge.

## Automated matrix

```bash
npm run type-check
npm test
npm run build:docs
python scripts/generate_module_tree.py
```

Pass criteria:

- Không có TypeScript error mới.
- Không có test failure mới.
- Build docs thành công.
- Module tree regenerate thành công.

## Manual-assisted UI matrix

### T1. LibraryShowcaseDemo locale smoke

Kiểm tra:

- Chuyển `vi/en` đổi topbar, panes menu, settings modal, placeholders.
- Reload trang giữ locale theo `localStorage`.

### T2. Theme smoke

Kiểm tra:

- Toggle theme đổi shell và chart cùng lúc.
- Không còn mixed light/dark artifact.

### T3. Splitter smoke

Kiểm tra:

- Splitter chỉ hiện rõ khi hover.
- Drag splitter resize đúng và double-click reset được.

### T4. Offline fallback smoke

Kiểm tra:

- Khi live fetch fail, chart vẫn render từ local fallback.
- Status text đúng locale hiện tại.

## Reporting template

```text
Automated:
Manual:
Known blockers:
Recommendation:
```
