# Phase 3 — Orderflow Suite

> **Thuộc:** [ROADMAP.md](./ROADMAP.md)  
> **Ước tính:** 4–6 tuần  
> **Mục tiêu:** Phân tích dòng tiền — CVD, Volume Profile, Footprint, DOM  
> ⚡ **CVD + Whale là primary indicators theo thiết kế dự án**

---

## Kiến trúc Orderflow

```
Tick Data (bid/ask tagged) 
    → Django Celery (aggregation)
    → Redis (per-bar orderflow cache)
    → WebSocket push
    → React (render on canvas)
```

**Yêu cầu dữ liệu đầu vào:**
- Mỗi tick phải có tag: `side ∈ { buy, sell }` (taker side)
- Nếu API không cung cấp → suy ra từ: nếu `price >= ask` → buy; nếu `price <= bid` → sell

---

## 3A — PHASE ƯU TIÊN CAO

### Delta & Cumulative Delta Volume (CVD)

**Khái niệm:**
- `delta = buyVolume - sellVolume` cho từng nến
- `CVD = Σ delta` tích lũy từ điểm bắt đầu
- Divergence: giá tăng nhưng CVD giảm → potential reversal

**Implementation:**

```typescript
// Tính delta tại server (Pandas vectorized)
df['buy_vol'] = df.loc[df['side'] == 'buy', 'volume']
df['sell_vol'] = df.loc[df['side'] == 'sell', 'volume']
ohlcv = df.resample(tf).agg({
    'open': 'first', 'high': 'max', 'low': 'min', 'close': 'last',
    'volume': 'sum', 'buy_vol': 'sum', 'sell_vol': 'sum'
})
ohlcv['delta'] = ohlcv['buy_vol'] - ohlcv['sell_vol']
ohlcv['cvd'] = ohlcv['delta'].cumsum()
```

**React component (pane riêng dưới chart):**
```tsx
// CVDSeries.tsx — vẽ đường CVD trên canvas
// DeltaBarSeries.tsx — mỗi nến màu xanh/đỏ theo delta sign
// Kết hợp: nến chính + overlay delta trong cùng pane
```

**Hiển thị:**
- `DeltaBarSeries`: histogram dưới mỗi nến, xanh = delta dương, đỏ = delta âm
- `CVDSeries`: đường line riêng ở pane dưới
- Tooltip: "Δ +1,234 | Buy 8,432 | Sell 7,198"
- **KHÔNG ẩn bớt bất kỳ bar nào** dù nhỏ — hiển thị đầy đủ mật độ

---

### Volume Profile

**Loại hỗ trợ:**

| Loại | Kích hoạt | Mô tả |
|------|-----------|-------|
| Session VP | Tự động theo ngày | Volume phân bổ theo giá trong 1 phiên |
| Fixed Range VP | Brush chọn vùng | VP cho đoạn time được chọn |
| Visible Range VP | Realtime | VP tính theo khung nhìn hiện tại |
| Composite VP | Chọn số session | Gộp N session lại |

**Tính toán (Pandas):**
```python
def volume_profile(df: pd.DataFrame, bins: int = 100) -> pd.DataFrame:
    price_min, price_max = df['low'].min(), df['high'].max()
    levels = np.linspace(price_min, price_max, bins)
    vp = pd.DataFrame({'price': levels, 'buy_vol': 0.0, 'sell_vol': 0.0})
    
    for _, row in df.iterrows():
        # Distribute bar volume across price levels it touched
        mask = (levels >= row['low']) & (levels <= row['high'])
        n = mask.sum()
        if n > 0:
            vp.loc[mask, 'buy_vol'] += row.get('buy_vol', row['volume'] / 2) / n
            vp.loc[mask, 'sell_vol'] += row.get('sell_vol', row['volume'] / 2) / n
    
    vp['total_vol'] = vp['buy_vol'] + vp['sell_vol']
    poc_idx = vp['total_vol'].idxmax()
    vp['is_poc'] = False
    vp.loc[poc_idx, 'is_poc'] = True
    
    # Value Area: 70% of total volume around POC
    total = vp['total_vol'].sum()
    va_threshold = total * 0.70
    # ... expand from POC until 70% covered
    return vp
```

**Render (Canvas):**
- Histogram nằm ngang bên phải chart (overlay trên price pane)
- POC: đường ngang nổi bật màu vàng
- VAH/VAL: đường ngang màu xanh nhạt
- Buy vol: xanh lá, Sell vol: đỏ (split bar)

---

### VWAP Suite

```typescript
// VWAP = Σ(typicalPrice × volume) / Σvolume
// typicalPrice = (high + low + close) / 3

function calculateVWAP(data: Bar[], anchorIndex: number = 0): Bar[] {
    let cumTPV = 0, cumVol = 0;
    return data.map((bar, i) => {
        if (i < anchorIndex) return { ...bar, vwap: undefined };
        const tp = (bar.high + bar.low + bar.close) / 3;
        cumTPV += tp * bar.volume;
        cumVol += bar.volume;
        const vwap = cumVol > 0 ? cumTPV / cumVol : tp;
        // VWAP Bands: std deviation of (typical - vwap)
        return { ...bar, vwap };
    });
}
```

**Anchor VWAP:**
- Right-click trên chart → "Anchor VWAP from here"
- Có thể có nhiều anchor VWAP cùng lúc
- Lưu anchor points vào Django DB theo symbol

---

## 3B — PHASE NÂNG CAO

### Footprint / Cluster Chart

**Khái niệm:** Mỗi nến được chia thành lưới `price_level × time_bucket`, hiển thị `bid_vol @ ask_vol` tại từng ô

**Data structure (per bar):**
```typescript
type FootprintBar = {
    timestamp: Date;
    open: number; high: number; low: number; close: number;
    // Mảng các price level từ low đến high (step = tickSize)
    levels: Array<{
        price: number;
        bidVol: number;   // sell-initiated volume tại mức này
        askVol: number;   // buy-initiated volume tại mức này
        delta: number;    // askVol - bidVol
        imbalance: boolean; // |askVol/bidVol| > 3 hoặc |bidVol/askVol| > 3
    }>;
    totalDelta: number;
    pocPrice: number;     // price level có volume cao nhất
};
```

**Render strategy:**
- Canvas 2D: mỗi ô là `rect` nhỏ, text nhỏ trong ô
- Màu sắc: gradient từ xanh (buy heavy) đến đỏ (sell heavy)
- Imbalance: highlight viền vàng
- Khi nến quá hẹp → chỉ hiện POC, hover để xem full

**Metrics có thể hiện (21+):**
- Bid/Ask Volume
- Delta per level
- % Delta
- Bid/Ask Imbalance
- Volume per level
- Trades count
- Large trade markers

---

### Market Profile (TPO)

**Khái niệm:** Mỗi chữ cái (TPO = Time Price Opportunity) đại diện cho một khoảng thời gian giá đã giao dịch tại một mức giá

```typescript
// Mỗi 30 phút = 1 chữ (A, B, C, ...)
// A = 00:00-00:30, B = 00:30-01:00, ...
type TPOProfile = {
    date: Date;
    tickSize: number;
    levels: Map<number, string[]>; // price → ['A', 'B', 'C', ...]
    poc: number;      // Price level với nhiều TPO nhất
    vah: number;      // Value Area High (70% volume)
    val: number;      // Value Area Low
    ib_high: number;  // Initial Balance High (first 1h)
    ib_low: number;   // Initial Balance Low
};
```

**Render:** chữ cái nhỏ xếp ngang theo từng price level, mỗi session một màu

---

### Open Interest (OI)

```typescript
// OI từ sàn crypto (Bybit, Binance futures)
// OI VN: cần API từ SSI/VSD
type OIBar = {
    timestamp: Date;
    oi: number;          // Open Interest tuyệt đối
    oiChange: number;    // Thay đổi so với nến trước
    oiDelta: number;     // OI change + Price direction analysis
};
```

**Hiển thị:**
- Histogram pane dưới chart
- Màu: xanh khi `oiChange > 0 && price up` (long buildup), đỏ khi ngược
- OI Heatmap: heat map dạng gradient price × time

---

## Checklist hoàn thành Phase 3A

- [ ] `DeltaBarSeries.tsx` — histogram delta dưới nến
- [ ] `CVDSeries.tsx` — đường CVD trong pane riêng
- [ ] Backend: tick aggregator tính buy/sell vol per bar
- [ ] `VolumeProfile.tsx` — render VP horizontal histogram
- [ ] Volume Profile tính toán phía server (Pandas)
- [ ] POC/VAH/VAL calculation đúng
- [ ] `VWAPSeries.tsx` — daily/weekly VWAP line
- [ ] Anchor VWAP — right-click → set anchor
- [ ] VWAP Bands (±1σ/2σ)

## Checklist hoàn thành Phase 3B

- [ ] `FootprintSeries.tsx` — render cluster chart
- [ ] Data structure FootprintBar đầy đủ
- [ ] Imbalance detection algorithm
- [ ] `TPOProfile.tsx` — render market profile
- [ ] Merge/Split sessions cho TPO
- [ ] OI histogram pane
- [ ] OI Heatmap
