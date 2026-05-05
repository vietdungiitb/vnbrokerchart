# Implementation Plan

## Nguyên tắc lập slice

Mỗi slice phải có đầu ra dùng được, validation rõ ràng, và không tạo thêm debt ngược với mục tiêu widget hóa.

## Slice roadmap

### Slice A. Shell stabilization

Trạng thái: DONE

- Settings modal thay cho right panel cũ
- Dynamic pane integration
- Theme sync shell/canvas
- Splitter restore và hover behavior
- Cleanup JSX/CSS cũ

### Slice B. Demo i18n foundation

Trạng thái: DONE

- Thêm `src/demo/i18n.tsx`
- Wrap demo root bằng provider
- Thêm `DemoI18nBoundary` cho demo mount standalone
- Chuyển các surface demo chính sang key-based translation

Exit criteria:

- Demo shell chính không còn chuỗi hardcoded mới ở các vùng vừa chỉnh
- Có switch `vi` và `en` ở các demo chính
- `html lang` sync với locale runtime

### Slice C. Indicator SSOT runtime

Trạng thái: READY

Mục tiêu:

- Xóa duplicated indicator computation path
- Tạo canonical series store/accessor theo params
- Đồng nhất chart render, yExtents, tooltip, settings preview

Exit criteria:

- Cùng indicator cùng params ở 2 pane cho cùng shape
- Đổi params trong settings làm toàn bộ consumer cập nhật từ cùng nguồn

### Slice D. Quality hardening

Trạng thái: TODO

- Bổ sung functional spec tests cho i18n + pane orchestration + SSOT invariance
- Tăng coverage theo `quality/QUALITY.md`

### Slice E. Widget boundary extraction

Trạng thái: TODO

- Định nghĩa chart widget contract
- Tách shell demo khỏi embeddable widget surface
- Thiết kế adapter cho host app truyền locale/theme/data
