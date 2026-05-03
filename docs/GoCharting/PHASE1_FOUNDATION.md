# Phase 1 — Terminal Foundation

> **Thuộc:** [ROADMAP.md](./ROADMAP.md)  
> **Ước tính:** 2–4 tuần  
> **Mục tiêu:** Giao diện terminal chuyên nghiệp, data thực VN, layout chuẩn

---

## 1.1 Layout Terminal

### Toolbar trái (Vertical)
Thanh đứng bên trái, luôn hiển thị, chứa các mode tương tác:

| Icon | Mode | Phím tắt |
|------|------|----------|
| ↖ | Cursor / Select | Esc |
| ✏ | Trendline | T |
| ➡ | Ray | R |
| ─ | Horizontal line | H |
| ╎ | Vertical line | V |
| ▭ | Rectangle | B |
| 📐 | Fibonacci | F |
| 🅰 | Text | X |
| 🗑 | Delete selected | Del |
| 🧹 | Clear all drawings | — |

**Implementation notes:**
- State machine: `cursorMode ∈ { select, trendline, ray, hline, vline, rect, fib, text }`
- Khi chọn drawing mode → ChartCanvas nhận `drawingMode` prop → EventCapture route mouse events sang DrawingManager
- ESC luôn reset về `select`

### Toolbar trên (Header bar)
```
[Logo] [Symbol Search ▼] [30m ▼] [Candlestick ▼]  |  [Indicators] [Drawings]  |  [Replay] [Alert] [Settings]
```

- **Symbol Search:** Autocomplete, gõ mã VN hoặc crypto → dropdown kết quả từ API
- **Timeframe selector:** 1s/5s/15s/30s/1m/3m/5m/15m/30m/1h/2h/4h/1D/1W/1M + custom
- **Chart type switcher:** Dropdown icon cho Candlestick/Hollow/OHLC/Line/Area/Heikin Ashi/Renko/Kagi

### Status bar (dưới chart hoặc trên chart)
```
BTCUSD  O: 78,631.5  H: 78,759.6  L: 78,631.5  C: 78,749.0  Vol: 4.85M  OI: +130 (+0.17%)  19:07:12 UTC+7
```

### Multi-panel layout
- Button layout switcher: 1 / 2 ngang / 2 dọc / 4 ô
- Mỗi panel là `ChartCanvas` instance độc lập
- Sync mode: bật sync → scroll/zoom một panel → cập nhật tất cả panel cùng symbol/timeframe

---

## 1.2 Data Pipeline (VN Market)

### WebSocket Architecture
```
vnstock/TCBS API → Django Channels (Consumer) → Redis Pub/Sub → WebSocket → React
```

**Django Channels consumer:**
```python
class OHLCVConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        symbol = self.scope['url_route']['kwargs']['symbol']
        tf = self.scope['url_route']['kwargs']['timeframe']
        await self.channel_layer.group_add(f"ohlcv_{symbol}_{tf}", self.channel_name)
        await self.accept()

    async def ohlcv_update(self, event):
        await self.send(json.dumps(event['data']))
```

**Celery task (tick aggregator):**
```python
@app.task
def aggregate_ticks(symbol: str, timeframe: str):
    # Pandas vectorized: resample ticks → OHLCV bars
    df = pd.DataFrame(tick_buffer[symbol])
    bar = df.resample(timeframe).agg({'price': 'ohlc', 'volume': 'sum'})
    # Push to Redis → Channels
    cache.publish(f"ohlcv_{symbol}_{timeframe}", bar.to_json())
```

### Timeframe aggregation
Hỗ trợ trên server:
- Tick → 1s, 5s, 15s, 30s
- 1m → 3m, 5m, 15m, 30m (resample từ 1m)
- 1h → 2h, 4h (resample)
- 1D → 1W, 1M

### Symbol Search API
```
GET /api/symbols/search/?q=VCB&market=HOSE
→ [{ symbol: "VCB", name: "Vietcombank", market: "HOSE", type: "stock" }]
```

### Historical Loader (Infinite Scroll)
- Khi user scroll trái đến đầu data → trigger `onLoadMore(fromDate)` callback
- ChartCanvas emit event, demo component gọi API lấy thêm data cũ
- Prepend vào `fullData`, re-calculate `xAccessor`, preserve current view

---

## 1.3 Chart Types mở rộng

### OHLC Bar Chart
- Đã có `OHLCSeries` trong lib → chỉ cần UI toggle trong toolbar

### Hollow Candlestick
- Candlestick body rỗng khi `close > prevClose` (so với nến trước, không phải open)
- Thêm prop `hollow={true}` vào `CandlestickSeries`

### Heikin Ashi
- Đã có `HeikinAshi` series → thêm vào chart type selector

### Renko (nâng cao)
- Mỗi brick = fixed price movement (e.g. 10 điểm)
- Không theo thời gian — cần custom scale provider

---

## 1.4 Files cần tạo/sửa

| File | Thay đổi |
|------|----------|
| `src/demo/TerminalLayout.tsx` | Component layout mới thay thế OriginalLikeDemo |
| `src/demo/ToolbarLeft.tsx` | Vertical toolbar |
| `src/demo/ToolbarTop.tsx` | Symbol search + timeframe + chart type |
| `src/demo/StatusBar.tsx` | OHLCV real-time display |
| `src/demo/MultiPanel.tsx` | Multi-chart layout manager |
| `src/lib/DrawingManager.tsx` | State machine cho drawing tools |
| `src/demo/hooks/useWebSocket.ts` | WebSocket connection hook |
| `src/demo/hooks/useSymbol.ts` | Symbol data management |

---

## Checklist hoàn thành Phase 1

- [ ] TerminalLayout.tsx render được với toolbar trái + trên
- [ ] ChartCanvas nhận `drawingMode` prop từ toolbar
- [ ] Symbol search hoạt động với mock data (trước khi có real API)
- [ ] Timeframe selector trigger reload data
- [ ] Chart type switcher chuyển đổi giữa Candlestick / Heikin Ashi / Line
- [ ] Layout 1/2/4 panel hoạt động
- [ ] WebSocket hook kết nối được với Django Channels
- [ ] Infinite scroll trái load thêm nến lịch sử
