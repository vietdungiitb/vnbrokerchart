# Technical Specification

## 1. Mục tiêu sản phẩm hiện tại

Repo đang đóng vai trò thư viện chart kèm demo tương tác giàu tính năng cho crypto/stocks. Trạng thái hiện tại ưu tiên hoàn thiện demo shell, nhưng mọi quyết định mới phải giữ khả năng tách thành widget nhúng cho web app khác trong bước sau.

## 2. Kiến trúc thực thi

### 2.1 Bề mặt runtime

- `src/demo/index.tsx`: bootstrap demo root.
- `src/demo/LibraryShowcaseDemo.tsx`: terminal-like shell chính, panes, topbar, settings modal, live/offline status.
- `src/demo/PaneSettingsModal.tsx`: cấu hình pane, series, theme, reset.
- `src/demo/FullDemo.tsx`, `OriginalLikeDemo.tsx`, `LiveDemo.tsx`: demo showcase độc lập, phục vụ trình diễn và đối chiếu UX.

### 2.2 Core chart runtime

- `src/lib/core/hooks/useDynamicPanes.ts`: reducer/state cho pane layout.
- `src/lib/core/DynamicChart.tsx`: render visible panes và mapped series.
- `src/lib/core/registry/SeriesRegistry.ts`: registry indicator/component/default params.
- `src/lib/core/types/pane-descriptor.ts`: model pane/series canonical.

### 2.3 Data flow hiện tại

- Nguồn local/offline và live Binance đi qua `src/demo/demoData.ts`.
- `LibraryShowcaseDemo` và các demo phụ render chart từ `DemoDatum[]`.
- Indicator data của demo chính hiện đã đi qua `enrichData` để giữ SSOT runtime.
- Gap còn lại là lịch sử thị trường thật: data path hiện vẫn giới hạn theo cửa sổ load hiện tại, chưa backfill nhiều trang khi pan trái.

## 2.4 Data fidelity contract

- Binance Klines hoặc một upstream được phê duyệt là nguồn lịch sử canonical cho chart BTC.
- Các giá trị `limit`, `window`, hoặc `range` chỉ là viewport / paging, không phải trần lịch sử.
- `1D`, `5D`, `1M`, `3M`, `YTD`, `1Y`, `All` phải cắt trên dữ liệu thật đã load; không được mô phỏng lịch sử từ 300 bar.
- Nếu rơi về offline fallback, UI phải nói rõ đó là fallback, không được ngụy trang thành market truth.
- Symbol hiển thị phải khớp symbol upstream đang fetch.

## 3. Kiến trúc i18n hiện tại

### 3.1 Thành phần

- `src/demo/i18n.tsx` cung cấp:
  - `DemoI18nProvider`
  - `DemoI18nBoundary`
  - `useDemoI18n()`
  - dictionary `vi` và `en`
  - persistence key `rsc-demo-language-v1`

### 3.2 Hành vi bắt buộc

- Locale mặc định: `vi`
- Locale được lưu trong `localStorage`
- `document.documentElement.lang` phải sync với locale hiện tại
- Bề mặt demo mount standalone phải tự có provider thông qua `DemoI18nBoundary`

### 3.3 Ranh giới kiến trúc

- i18n hiện chỉ sống trong `src/demo/**`
- `src/lib/**` chỉ nhận label/title translated qua props nếu cần
- Không import `src/demo/i18n.tsx` từ `src/lib/**`

## 4. Ràng buộc kỹ thuật quan trọng

1. Splitter phải là overlay nhẹ, không ép remount chart theo từng pixel drag.
2. Theme phải sync giữa shell DOM và chart canvas.
3. Pane labels mặc định phải có thể localize theo `pane.id`, không phụ thuộc tuyệt đối vào label stored trong state.
4. Mọi overlay text phát sinh từ core component dùng trong demo phải được truyền từ shell qua props nếu cần dịch.

## 5. Known Gaps

1. Historical market backfill chưa hoàn tất; scrolling trái chưa nạp thêm dữ liệu cũ.
2. Widget boundary extraction chưa bắt đầu.
3. i18n mới phủ bề mặt demo chính; các surface mới trong tương lai vẫn phải đi vào cùng dictionary thay vì hardcode lại.

## 6. Điều kiện cho widget extraction

- Tách `shell controls` khỏi `chart rendering`
- Tách `demo data sourcing` khỏi `chart input contract`
- Nâng i18n từ demo scope lên widget scope hoặc adapter scope
- Chuẩn hóa props contract cho theme, locale, pane state, data source
