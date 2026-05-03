# Phase 4 — Analytics Panels

> **Thuộc:** [ROADMAP.md](./ROADMAP.md)  
> **Ước tính:** 3–4 tuần  
> **Mục tiêu:** Orderbook, Time & Sales, Watchlist, Whale Alerts

---

## 4.1 Orderbook / Depth of Market (DOM)

### Panel Layout
```
┌─────────────────────────────────┐
│  BTCUSD  Last: 78,749  Spread: 0.5 │
├──────────────┬──────────────────┤
│  Ask Volume  │  Price   │ Bid Vol │
├──────────────┼──────────┼─────────┤
│     1,234    │ 78,755   │         │ ← background bar % of max
│       892    │ 78,754   │         │
│     2,100    │ 78,753   │         │
│─────────────────────────────────│
│              │ 78,749 ● │         │ ← Last price
│─────────────────────────────────│
│              │ 78,748   │   543   │
│              │ 78,747   │ 1,890   │
│              │ 78,746   │ 3,200   │
└──────────────┴──────────┴─────────┘
```

**Tính năng:**
- Cumulative volume bars (background fill thể hiện % so với max level)
- Large order highlighting: level > threshold → highlight màu đặc biệt
- Aggregation: gộp nhiều tick cùng giá
- Grouping: group by price tick (0.1, 0.5, 1.0, 5.0, 10.0...)
- Imbalance ratio: Ask/Bid > 3 → hiện badge

**WebSocket data:**
```typescript
type OrderbookUpdate = {
    symbol: string;
    bids: Array<[price: number, size: number]>; // sorted desc
    asks: Array<[price: number, size: number]>; // sorted asc
    timestamp: number;
    type: 'snapshot' | 'delta';
};
```

### Depth Chart
```
Volume
  │         ╱╲
  │        ╱  ╲
  │   ─────    ─────
  └────────────────── Price
        Bid   Ask
```
- X-axis: price, Y-axis: cumulative volume
- Bid side: xanh (curve từ market price đi sang trái)
- Ask side: đỏ (curve từ market price đi sang phải)

---

## 4.2 Time & Sales (Tape Reading)

### Layout
```
┌────────────────────────────────────────┐
│  Filter: Min Size [    1000   ] ▼ BUY/SELL │
├────────┬───────┬──────────┬──────────┤
│  Time  │ Price │  Volume  │  Side    │
├────────┼───────┼──────────┼──────────┤
│ 19:07:12 │ 78,749 │ 2,500  │ 🔴 SELL │ ← red background
│ 19:07:11 │ 78,750 │   800  │ 🟢 BUY  │ ← green background
│ 19:07:11 │ 78,748 │  5,200 │ 🔴 SELL │ ← bold (large trade)
│ 19:07:10 │ 78,751 │   300  │ 🟢 BUY  │
└────────┴───────┴──────────┴──────────┘
```

**Tính năng:**
- Real-time stream từ WebSocket
- **Whale filter:** Min size input → chỉ hiện giao dịch lớn
- Color-code: xanh = buyer aggressive (hit ask), đỏ = seller aggressive (hit bid)
- Bold/highlight lệnh > threshold (whale marker)
- Auto-scroll xuống dưới theo real-time (có thể tắt)
- Export CSV

**VN Market note:** HOSE/HNX không public tape → cần data từ broker API hoặc suy ra từ bid/ask spread

---

## 4.3 Watchlist

### Layout
```
┌──────────┬──────────┬────────┬────────┬──────────┬──────────┐
│ Symbol ▼ │ Last     │ Change │  %Chg  │ Volume   │ Nước ngoài │
├──────────┼──────────┼────────┼────────┼──────────┼──────────┤
│ VCB      │ 89,500   │ +1,200 │ +1.36% │ 2.3M     │ +500K  │ ← green row
│ BID      │ 45,200   │  -800  │ -1.74% │ 1.1M     │ -200K  │ ← red row
│ TCB      │ 28,900   │    +50 │ +0.17% │ 4.5M     │ +1.2M  │
│ HPG      │ 26,100   │ -1,100 │ -4.05% │ 8.2M     │ -2.3M  │ ← bold (large move)
└──────────┴──────────┴────────┴────────┴──────────┴──────────┘
```

**Tính năng:**
- Multi-list: tạo nhiều danh sách (VN30, Cổ phiếu tôi, Crypto...)
- Sort by any column
- Filter theo ngành, sàn
- Alert từ watchlist: click chuột phải → "Set price alert"
- Mini candle preview khi hover
- **CVD & OI Scanner:** cột thêm hiện CVD, OI change real-time
- Heatmap view: tile view với màu sắc theo %change

### Portfolio Heatmap
- Grid tiles, size = market cap, màu = %change
- Click tile → mở chart symbol đó

---

## 4.4 Whale Alerts ⚡

> **Ưu tiên cao nhất theo thiết kế dự án**

### Hiển thị trên chart
```
Chart timeline:
  19:05 │ 🐳 78,750 × 5,200 (BUY) ← marker trên price bar
  19:07 │ 🐳 78,748 × 8,900 (SELL)
```

**Tính năng:**
- **Marker trực tiếp trên chart:** mũi tên hoặc icon whale tại timestamp + giá
- Tooltip: "BUY 5,200 BTC @ 78,750 | 19:07:11 | Bybit"
- Threshold cấu hình: mặc định 1,000 BTC (crypto) / 100,000 cổ phiếu (VN)
- **KHÔNG ẩn bất kỳ lệnh nào trên ngưỡng** — hiển thị đầy đủ
- Separate panel (danh sách) + chart overlay

### Whale Panel (side panel)
```
┌─────────────────────────────────────────┐
│  🐳 Whale Alerts — BTCUSD              │
│  Min Size: [ 500 BTC ] ▼               │
├──────────┬───────┬────────┬────────────┤
│  Time    │ Price │  Size  │ Side       │
├──────────┼───────┼────────┼────────────┤
│ 19:07:11 │78,750 │ 5,200  │ 🟢 BUY    │
│ 19:05:33 │78,748 │ 8,900  │ 🔴 SELL   │
│ 19:01:15 │78,720 │ 3,100  │ 🟢 BUY    │
└──────────┴───────┴────────┴────────────┘
```

### Aggregation theo price level
- Gom tất cả lệnh whale tại cùng price level trong 1 khoảng thời gian
- Hiện tổng: "78,750: Tổng BUY 12,400 | SELL 3,200 | Net: +9,200"

### Data flow
```
Exchange WebSocket (trade stream)
    → Django Consumer (filter by size > threshold)
    → Redis pub/sub channel "whale_alerts_{symbol}"
    → React WebSocket hook
    → Chart marker + Whale panel
```

---

## 4.5 Files cần tạo

| File | Thay đổi |
|------|----------|
| `src/demo/panels/OrderbookPanel.tsx` | DOM/L2 orderbook |
| `src/demo/panels/DepthChart.tsx` | Bid/Ask depth curve |
| `src/demo/panels/TimeAndSales.tsx` | Tape reader |
| `src/demo/panels/Watchlist.tsx` | Watchlist với sort/filter |
| `src/demo/panels/WatchlistHeatmap.tsx` | Portfolio heatmap |
| `src/demo/panels/WhaleAlerts.tsx` | Whale panel + chart markers |
| `src/lib/series/WhaleMarkerSeries.tsx` | Canvas markers cho whale |
| `src/demo/hooks/useOrderbook.ts` | Orderbook WebSocket |
| `src/demo/hooks/useTapeData.ts` | Time & Sales WebSocket |
| `src/demo/hooks/useWhaleAlerts.ts` | Whale filter + stream |

---

## Checklist hoàn thành Phase 4

- [ ] OrderbookPanel render đúng với background bars
- [ ] Orderbook real-time update (snapshot + delta)
- [ ] Depth Chart render bid/ask curves
- [ ] Large order highlighting trong orderbook
- [ ] TimeAndSales stream với color coding
- [ ] Whale filter input hoạt động đúng
- [ ] Watchlist với multi-list support
- [ ] Watchlist sort/filter
- [ ] Watchlist alert integration
- [ ] CVD column trong watchlist
- [ ] WhaleAlerts panel với real-time stream
- [ ] WhaleMarkerSeries vẽ markers trên chart canvas
- [ ] Whale aggregation theo price level
- [ ] Whale threshold cấu hình được
