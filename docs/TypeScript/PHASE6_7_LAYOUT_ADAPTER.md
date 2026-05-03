# Phase 6-7 — Layout and Adapter (As-built Sync)

> Thuộc: [ROADMAP.md](./ROADMAP.md)  
> Trạng thái thực thi: Completed trong delivery scope P1-P7 (layout UX/adaptor hardening nâng cao ở post-v1)
> Slice liên quan đã đóng: P2, P5, P6

> Lưu ý tránh hiểu nhầm: closeout hiện tại chốt đầy đủ delivery scope; các hạng mục mở rộng được quản trị như backlog post-v1.

---

## 1. Snapshot tổng hợp

| Track | Thiết kế ban đầu | As-built hiện tại | Trạng thái |
|---|---|---|---|
| Layout runtime | Multi-panel sync như TradingView | Đã có pane manager, splitter, core contexts | Done (core) |
| Panel UX nâng cao | Toolbar, reorder, settings | Chưa hoàn thiện đầy đủ | Backlog |
| Adapter contract | StockDataAdapter chuẩn | Đã có interface + Base/Django/Mock adapters | Done |
| Realtime integration | subscribe bars/trades/orderbook | Đã có hợp đồng và test cơ bản | Partial |
| Examples regression | stories đại diện | Đã có 8 stories, Storybook Vite build pass | Done |

---

## 2. Chênh lệch cần đóng

1. Layout hiện đã có nền tảng kỹ thuật nhưng chưa có đầy đủ UX controls theo thiết kế.
2. Adapter layer có contract tốt, nhưng cần hardening thêm cho reliability và retry ở môi trường tải thật.
3. Storybook migration đã về Vite, cần giữ baseline này và không quay lại builder webpack cho stories.

---

## 3. Bổ sung vào phase 6-7

1. Tách hai checklist độc lập:
   - Checklist Layout runtime.
   - Checklist Adapter production readiness.
2. Thêm reliability gates cho adapter:
   - reconnect policy.
   - timeout/backoff.
   - invalid payload handling.
3. Thêm regression gates cho stories:
   - `npm run build:storybook` pass.
   - Browser smoke trên bản static.

---

## 4. Lộ trình tiếp theo

### M1 — Layout UX completion
- Bổ sung toolbar, panel close/hide.
- Thiết kế drag reorder cho panes.
- Chốt constraints min/max height bằng test.

### M2 — Adapter hardening
- Chuẩn hóa retry/backoff cho REST và WS.
- Thêm contract tests cho payload lỗi và reconnect.

### M3 — Integration closeout
- Bổ sung docs tích hợp Django/vnstock từ adapter hiện có.
- Khóa release checklist cho app dùng nhiều users đồng thời.

---

## 5. Definition of Done (cập nhật)

- [x] Core layout runtime hoạt động.
- [x] Adapter contract và implementations mẫu có test.
- [x] Regression stories đã chuyển đổi và build pass trên Vite.
- [x] Panel UX trong delivery scope hiện tại đã được chốt cùng regression stories.
- [x] Adapter reliability baseline + soak evidence cho closeout hiện tại đã hoàn tất.
