# Phase 4 — Orderflow Suite

> **Thuộc:** [ROADMAP.md](./ROADMAP.md)  
> **Ước tính:** 4–5 tuần  
> **Ưu tiên cao nhất** — CVD, Volume Profile, Delta là tính năng cốt lõi

---

## 4.1 CVD (Cumulative Volume Delta)

### Render dưới dạng histogram + line
```tsx
<Chart id={3} yExtents={cvdExtents}>
    <YAxis />
    <CumulativeDeltaSeries
        fill={(d, cvdValue) => cvdValue >= 0 ? '#26a69a' : '#ef5350'}
        stroke="#94a3b8"
        showLine        // vẽ thêm đường CVD ở trên histogram
        lineStroke="#22d3ee"
    />
    <CVDTooltip />
</Chart>
```

### Data flow
```
OHLCVBar[] có buyVolume + sellVolume
    → delta[] = buyVolume - sellVolume (per bar)
    → cvd[] = cumulative sum of delta
    → render histogram màu xanh/đỏ theo cvdValue
```

---

## 4.2 Volume Profile

### 3 modes
```typescript
type VolumeProfileMode =
    | 'session'       // 1 phiên giao dịch (mặc định cho intraday)
    | 'visible'       // chỉ tính bars đang hiển thị trên chart
    | 'fixed-range'   // chọn range cố định bằng tay
    | 'composite';    // gộp nhiều phiên

interface VolumeProfileConfig {
    mode: VolumeProfileMode;
    numBins: number;             // số hàng ngang, default 48
    showValueArea: boolean;      // tô màu Value Area (70% volume)
    showPOC: boolean;            // đường POC (Price of Control)
    splitBuySell: boolean;       // chia 2 màu buy/sell
    width: number;               // % chiều rộng panel chiếm
    position: 'left' | 'right';
}
```

### Render
```
Price │    ██████████████  ← POC (dày nhất)
      │ █████████
      │ ███████████████
      │   █████████████   ← Value Area (70% volume)
      │ ██████
      │ ████
      │ ██████████
      └───────────────────
```

### Computation (pure TS)
```typescript
export interface PriceBin {
    priceFrom: number;
    priceTo: number;
    buyVolume: number;
    sellVolume: number;
    totalVolume: number;
}

export interface VolumeProfileResult {
    bins: PriceBin[];
    poc: number;                 // price at max volume bin
    valueAreaHigh: number;
    valueAreaLow: number;
    totalVolume: number;
}

export function computeVolumeProfile(
    bars: OHLCVBar[],
    numBins: number
): VolumeProfileResult
```

---

## 4.3 Footprint Candle

Mỗi nến hiển thị bid × ask tại từng mức giá bên trong nến.  
Cần **tick data** (từng giao dịch riêng lẻ).

```
Price  │  Bid × Ask
78,755 │  120 × 340   ← nhiều buy hơn → delta dương
78,754 │  890 × 210   ← nhiều sell hơn → delta âm → tô đỏ
78,753 │  456 × 456   ← balanced
78,752 │  230 × 890
```

### TypeScript interfaces
```typescript
export interface Tick {
    timestamp: number;
    price: number;
    size: number;
    side: 'buy' | 'sell';
}

export interface FootprintLevel {
    price: number;
    bidVolume: number;
    askVolume: number;
    delta: number;
    imbalance: number | null; // ratio nếu > threshold
}

export interface FootprintBar extends OHLCVBar {
    levels: FootprintLevel[];
    totalDelta: number;
    maxVolume: number; // để normalize bar width
}

export function aggregateFootprint(
    ticks: Tick[],
    bars: OHLCVBar[],
    tickSize: number
): FootprintBar[]
```

---

## 4.4 Delta Candle

Nến tô màu theo delta của nến đó (không phải open/close):

```typescript
// Màu:
// delta > 0 (buy pressure) → xanh
// delta < 0 (sell pressure) → đỏ
// Độ đậm nhạt theo magnitude

const fill = (d: OHLCVBar) => {
    const delta = (d.buyVolume ?? 0) - (d.sellVolume ?? 0);
    const intensity = Math.min(Math.abs(delta) / d.volume, 1);
    return delta > 0
        ? `rgba(38, 166, 154, ${0.3 + intensity * 0.7})`
        : `rgba(239, 83, 80, ${0.3 + intensity * 0.7})`;
};
```

---

## 4.5 Market Profile (TPO)

Time Price Opportunity — mỗi chữ cái đại diện cho 30 phút giao dịch tại 1 mức giá.

```
Price │ TPO Letters
78,755 │ A
78,754 │ A B
78,753 │ A B C D
78,752 │ A B B C D D    ← POC (nhiều chữ nhất)
78,751 │ A B C
78,750 │ B C
```

```typescript
export interface TPOBar {
    price: number;
    letters: string[];      // ['A', 'B', 'C', ...]
    count: number;          // số lần ghé thăm
    isValueArea: boolean;
    isPOC: boolean;
}

export function computeTPO(
    bars: OHLCVBar[],
    tickSize: number,
    periodMinutes: number   // thường 30
): TPOBar[]
```

---

## 4.6 Checklist hoàn thành Phase 4

- [ ] `computeVolumeProfile` với 4 modes
- [ ] VolumeProfileSeries render đúng với POC, Value Area
- [ ] CumulativeDeltaSeries (histogram + line)
- [ ] CVDTooltip
- [ ] DeltaCandleSeries (màu theo delta)
- [ ] `aggregateFootprint` từ tick data
- [ ] FootprintCandleSeries render bid×ask per level
- [ ] Footprint imbalance highlight
- [ ] `computeTPO`
- [ ] MarketProfileSeries render TPO letters
- [ ] Storybook stories cho tất cả
