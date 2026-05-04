# Implementation Plan: Pane Splitter Resize

## Phase P0: Prep và baseline

### Mục tiêu

Xác định điểm tích hợp, tách rõ vùng height khả dụng và baseline behavior hiện tại.

### Công việc

1. Chụp baseline logic chia chiều cao pane trong src/demo/LibraryShowcaseDemo.tsx.
2. Chốt preset mặc định ratio (đề xuất 65/15/20).
3. Chốt minHeight cho từng pane (đề xuất price 140, volume 80, momentum 90).

### Gate G0

- Document baseline trong PR note.
- Team thống nhất preset + minHeight.

## Phase P1: Core layout engine

### Mục tiêu

Xây utility resize/clamp hoạt động độc lập với UI.

### Công việc

1. Tạo hàm normalize ratio.
2. Tạo hàm ratioToPixels và pixelsToRatio.
3. Tạo hàm applySplitterDelta với clamp minHeight.
4. Tạo unit tests cho utility.

### Gate G1

- Utility tests pass.
- Không có case pane <= 0px trong test matrix.

## Phase P2: Splitter interaction

### Mục tiêu

Gắn pointer interaction vào UI chart.

### Công việc

1. Render splitter giữa pane Price-Volume và Volume-Momentum.
2. Implement pointerdown/move/up.
3. Hiển thị trạng thái hover/drag.
4. Add double-click reset.

### Gate G2

- Kéo splitter hoạt động mượt ở desktop.
- Reset layout hoạt động ổn định.

## Phase P3: Persistence và hardening

### Mục tiêu

Lưu/khôi phục layout và chống lỗi dữ liệu.

### Công việc

1. Lưu ratio vào local storage sau khi drag end.
2. Restore khi mount.
3. Sanitize layout invalid.
4. Re-clamp khi resize container.

### Gate G3

- Reload vẫn giữ layout.
- Dữ liệu local storage hỏng không làm vỡ UI.

## Phase P4: Audit và handoff

### Mục tiêu

Hoàn tất kiểm chứng và bàn giao cho QA/tech lead.

### Công việc

1. Chạy đầy đủ test matrix trong AUDIT_PROTOCOL.
2. Ghi evidence command output + screenshot.
3. Cập nhật AUDIT_LEDGER trung tâm.
4. Mở PR với checklist completed.

### Gate G4

- Tất cả acceptance criteria pass.
- Đủ evidence để sign-off.
