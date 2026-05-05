# Lộ trình phát triển: react-stockcharts → GoCharting-level Terminal

> **Tham khảo:** https://gocharting.com/terminal?ticker=BYBIT:BTCUSD  
> **Cập nhật:** 2026-05-03  
> **Dự án:** VN Stock Tracker + Robo-Advisor  
> **Stack:** React + Django + Pandas + Redis + Celery + vnstock

---

## So sánh hiện trạng

| Chiều | react-stockcharts hiện tại | GoCharting |
|-------|---------------------------|------------|
| Chart types | Candlestick, bar, area, line, Heikin Ashi, Kagi | 15+ types kể cả Footprint, Renko, Range Bar |
| Indicators | EMA, SMA, MACD, Bollinger | 80+ indicators + Orderflow |
| Drawing tools | Brush, ZoomButtons | 40+ drawing tools |
| Data | Static/offline | Real-time WebSocket + multi-exchange |
| Layout | Single chart | Multi-chart, sync, panels |
| Orderflow | Không có | Volume Profile, CVD, DOM, Footprint |

---

## Thứ tự ưu tiên tổng thể

```
Phase 1 (Foundation) ──► Phase 2 (Indicators + Drawings)
                               │
                               ▼
                    Phase 3A (CVD + Volume Profile)  ← ưu tiên cao nhất
                               │
                         Phase 4 (Analytics)
                               │
                    Phase 3B (Footprint + TPO)
                               │
                    Phase 7 (Trading) ◄── kết nối Django backend
```

---

## PHASE 1 — Terminal Foundation

> **Mục tiêu:** Giao diện terminal chuyên nghiệp, data thực VN  
> **Ước tính:** 2–4 tuần  
> **File chi tiết:** [PHASE1_FOUNDATION.md](./PHASE1_FOUNDATION.md)

### 1.1 Layout Terminal
- [ ] Toolbar trái — vertical icon bar: Drawing tools, cursor mode, delete
- [ ] Toolbar trên — Symbol search, timeframe selector (1m/5m/15m/1h/1D/1W), chart type switcher
- [ ] Panel hệ thống — header cố định, chart fullscreen, status bar (giá real-time, %change, OI)
- [ ] Multi-panel layout — chia màn hình 1/2/4 chart, sync crosshair

### 1.2 Data Pipeline (VN Market)
- [ ] WebSocket real-time — kết nối vnstock / TCBS / SSI feed, push OHLCV live
- [ ] Timeframe aggregation — gộp tick → 1m/5m/15m/30m/1h/4h/1D server-side (Pandas + Redis)
- [ ] Symbol search — tìm mã VN30, HOSE, HNX với autocomplete
- [ ] Historical loader — page-load cuộn trái auto-load thêm nến cũ (infinite scroll)

### 1.3 Chart Types mở rộng
- [ ] OHLC bar chart
- [ ] Hollow Candlestick
- [ ] Heikin Ashi (đã có trong lib, cần UI toggle)
- [ ] Line / Area / Mountain (đã có)

---

## PHASE 2 — Indicators & Drawing Tools

> **Mục tiêu:** Bộ indicator đầy đủ + drawing tools cơ bản  
> **Ước tính:** 3–5 tuần  
> **File chi tiết:** [PHASE2_INDICATORS.md](./PHASE2_INDICATORS.md)

### 2.1 Indicator Manager
- [ ] Settings modal (gear icon) — modal tìm kiếm indicator, add vào chart, chọn Y-axis trái/phải
- [ ] Indicator settings — dialog cài thông số (period, color, line style)
- [ ] Indicator on indicator — ví dụ EMA của RSI

### 2.2 Overlays (ưu tiên VN)
- [ ] RSI (14)
- [ ] Stochastic (K/D)
- [ ] Bollinger Bands
- [ ] **VWAP** (daily/weekly/monthly) — cực quan trọng
- [ ] **Ichimoku Cloud**
- [ ] **Supertrend**
- [ ] Pivot Points (Standard / Fibonacci / Camarilla)
- [ ] ATR Bands / Keltner Channel
- [ ] SMA/EMA/WMA multi-instance

### 2.3 Oscillators (pane riêng)
- [ ] RSI + OB/OS zones
- [ ] Stochastic RSI
- [ ] ADX + DI+/-
- [ ] CCI, MFI, OBV, Williams %R

### 2.4 Drawing Tools — Nhóm 1 (cần nhất)
- [ ] Trendline — click 2 điểm, kéo dài vô tận
- [ ] Horizontal line — support/resistance
- [ ] Vertical line — event marker
- [ ] Rectangle / Box — highlight vùng
- [ ] Text label — ghi chú trên chart

### 2.4 Drawing Tools — Nhóm 2 (phân tích)
- [ ] Fibonacci Retracement — click 2 điểm, vẽ các mức 0/23.6/38.2/50/61.8/78.6/100
- [ ] Fibonacci Extension
- [ ] Parallel Channel — trendline + 2 kênh song song
- [ ] Pitchfork (Andrews)

### 2.4 Drawing Tools — Nhóm 3 (nâng cao)
- [ ] Ray, Arrow, Projection
- [ ] Gann Fan / Gann Box
- [ ] Harmonic Patterns (ABCD, Bat, Gartley)

### 2.5 Persistence
- [ ] Save drawings to backend — lưu theo symbol + timeframe vào Django DB
- [ ] Drawing templates — lưu bộ drawing/indicator preset
- [ ] Undo/Redo — Ctrl+Z cho drawing

---

## PHASE 3 — Orderflow Suite

> **Mục tiêu:** Bộ tính năng phân tích dòng tiền — USP của terminal  
> **Ước tính:** 4–6 tuần  
> **File chi tiết:** [PHASE3_ORDERFLOW.md](./PHASE3_ORDERFLOW.md)  
> ⚡ **CVD và Delta là ưu tiên cao nhất theo thiết kế dự án**

### 3A — Ưu tiên cao (làm trước)

#### Delta / CVD
- [ ] **Delta Bars** — mỗi nến hiển thị buy volume - sell volume
- [ ] **Cumulative Delta Volume (CVD)** — đường tích lũy delta, divergence signal
- [ ] Buy/Sell pressure coloring — nến theo delta thay vì close>open

#### Volume Profile
- [ ] **Session VP** — histogram ngang theo price level, POC, VAH/VAL
- [ ] **Fixed Range VP** — VP cho vùng được chọn bằng brush
- [ ] **Visible Range VP** — VP tính theo khung nhìn hiện tại
- [ ] Composite VP — gộp nhiều session

#### VWAP Suite
- [ ] Session VWAP
- [ ] **Anchor VWAP** — click chọn điểm neo tùy ý
- [ ] VWAP Bands (±1σ/2σ/3σ)

### 3B — Nâng cao (làm sau)

#### Footprint / Cluster Chart
- [ ] Cluster chart — mỗi nến = lưới price × volume, hiển thị bid/ask tại từng tick
- [ ] Imbalance highlight — tô màu vùng mất cân bằng bid/ask > threshold
- [ ] Bar Statistics — tooltip: total vol, delta, trades, bid vol, ask vol

#### Market Profile (TPO)
- [ ] TPO letters theo giá × thời gian
- [ ] POC, Value Area High/Low, Single Prints
- [ ] Merge/Split sessions

#### Open Interest
- [ ] OI chart dưới dạng histogram
- [ ] OI Heatmap (giá × OI theo thời gian)
- [ ] OI thay đổi so với nến trước

---

## PHASE 4 — Analytics Panels

> **Mục tiêu:** Các panel hỗ trợ quyết định ngoài biểu đồ  
> **Ước tính:** 3–4 tuần  
> **File chi tiết:** [PHASE4_ANALYTICS.md](./PHASE4_ANALYTICS.md)

### 4.1 Orderbook (Depth of Market)
- [ ] Level 2 orderbook — bid/ask theo từng mức giá, real-time
- [ ] DOM panel — dạng bảng: price | bid vol | ask vol
- [ ] Depth chart — đường cong bid/ask tích lũy

### 4.2 Time & Sales (Tape)
- [ ] Stream giao dịch khớp lệnh real-time
- [ ] Lọc theo size (whale filter)
- [ ] Color-code buy-initiated vs sell-initiated

### 4.3 Watchlist
- [ ] Bảng danh mục: mã, giá, %change, volume, khối lượng nước ngoài
- [ ] Sort/filter, Alert khi giá chạm ngưỡng
- [ ] Heatmap portfolio

### 4.4 Whale Alerts ⚡ (ưu tiên cao)
- [ ] Hiển thị lệnh lớn (khối lượng > threshold) trực tiếp trên chart
- [ ] Tập hợp theo giá level
- [ ] Marker trên timeline

---

## PHASE 5 — Bar Replay & Backtesting

> **Mục tiêu:** Replay lại lịch sử để test strategy  
> **Ước tính:** 2–3 tuần  
> **File chi tiết:** [PHASE5_REPLAY.md](./PHASE5_REPLAY.md)

- [ ] Bar Replay — play/pause/step từng nến, kiểm tra signal
- [ ] Speed control — 1x/2x/5x/10x
- [ ] Replay từ bất kỳ điểm nào — right-click → "Replay from here"
- [ ] Paper trading trên replay — test entry/exit ảo

---

## PHASE 6 — Custom Scripting

> **Mục tiêu:** Người dùng viết indicator riêng (như TradingView Pine Script)  
> **Ước tính:** 5–8 tuần  
> **File chi tiết:** [PHASE6_SCRIPTING.md](./PHASE6_SCRIPTING.md)

- [ ] Script engine — parser + evaluator cho ngôn ngữ script đơn giản
- [ ] Built-in functions: `ema()`, `sma()`, `highest()`, `lowest()`, `crossover()`, `crossunder()`
- [ ] Plot functions: `plot()`, `plotshape()`, `bgcolor()`, `barcolor()`
- [ ] Script editor — Monaco editor với syntax highlight
- [ ] Community scripts — chia sẻ script (Django backend)

---

## PHASE 7 — Trading Integration

> **Mục tiêu:** Đặt lệnh thực từ chart — kết nối robo-advisor VN  
> **Ước tính:** 4–6 tuần  
> **File chi tiết:** [PHASE7_TRADING.md](./PHASE7_TRADING.md)

- [ ] One-click trading — click trên chart để đặt lệnh
- [ ] Bracket orders — TP/SL drag trực tiếp trên chart
- [ ] Kết nối broker VN — TCBS, SSI, VPS, MBS qua API
- [ ] Trading journal — tự động log, PnL chart

---

## Stack kỹ thuật

| Layer | Công nghệ |
|-------|-----------|
| Charting core | react-stockcharts (TypeScript) — tiếp tục mở rộng |
| Real-time data | WebSocket → Redis Pub/Sub → React state |
| Backend indicators | Pandas vectorized |
| Storage | Django ORM → drawings, templates, layouts |
| Script engine | Custom AST parser (TypeScript) |
| Auth/multi-user | Django JWT |

---

## Ghi chú thiết kế

- **Độ trung thực thị giác:** Mọi lệnh trên ngưỡng phải được hiển thị đầy đủ, không dùng opacity/ẩn bớt để tránh sai cảm nhận mật độ giao dịch.
- **Ưu tiên chart:** Whale buy/sell, CVD, Strengths là primary; RSI/MA/MACD/Bollinger là supporting layers.
- **Data processing:** Ưu tiên SQL values projection cho filtering/selection và Pandas vectorized computation cho performance.
- **Charting library:** ECharts là mặc định cho các visualization mới ngoài core stockcharts.
