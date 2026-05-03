# Phase 2 — Chart Types

> **Thuộc:** [ROADMAP.md](./ROADMAP.md)  
> **Ước tính:** 3–4 tuần  
> **Mục tiêu:** Đủ loại nến + series cho VN market

---

## 2.1 Danh sách Series Components

| Component | Mô tả | Ưu tiên |
|-----------|--------|---------|
| `CandlestickSeries` | Nến Nhật cơ bản (refactor từ hiện tại) | P0 |
| `HollowCandlestickSeries` | Nến rỗng — tô màu đảo chiều trend | P0 |
| `HeikinAshiSeries` | Lọc nhiễu, trend rõ hơn | P1 |
| `BarSeries` | OHLC bar truyền thống | P1 |
| `LineSeries` | Đường giá đóng cửa | P0 |
| `AreaSeries` | Area dưới đường giá | P1 |
| `BaselineSeries` | Delta so với reference price | P2 |
| `RenkoBars` | Lọc thời gian, chỉ vẽ khi giá thay đổi đủ | P2 |
| `VolumeSeries` | Cột volume dưới chart | P0 |
| `OHLCSeries` | Tick chart theo từng giao dịch | P2 |

---

## 2.2 API Component chuẩn hóa

Mọi series dùng cùng prop interface:

```typescript
export interface SeriesProps {
    // Data accessor
    yAccessor?: (d: OHLCVBar) => number;          // cho LineSeries
    
    // Style
    stroke?: string;
    fill?: string | ((d: OHLCVBar) => string);
    opacity?: number;
    strokeWidth?: number;
    
    // Candlestick-specific
    wickStroke?: string | ((d: OHLCVBar) => string);
    candleStrokeWidth?: number;
    
    // Hollow candle config
    hollowWhenRising?: boolean;                    // default true
}
```

### Ví dụ sử dụng
```tsx
<ChartCanvas data={data} width={900} height={600}>
    <Chart id={1} yExtents={(d) => [d.high, d.low]}>
        <XAxis />
        <YAxis />
        <CandlestickSeries
            wickStroke={(d) => d.close > d.open ? '#26a69a' : '#ef5350'}
            fill={(d) => d.close > d.open ? '#26a69a' : '#ef5350'}
        />
        <VolumeSeries
            fill={(d) => d.close > d.open ? 'rgba(38,166,154,0.4)' : 'rgba(239,83,80,0.4)'}
        />
    </Chart>
</ChartCanvas>
```

---

## 2.3 HollowCandlestickSeries

Nến rỗng: thân nến được vẽ rỗng (outline) khi giá đóng cao hơn giá đóng kỳ trước,  
dù nến đó close < open — thể hiện momentum tốt hơn nến Nhật thông thường.

```typescript
// Logic xác định hollow/filled:
function isHollow(current: OHLCVBar, previous: OHLCVBar): boolean {
    return current.close > previous.close;
}

// Màu sắc:
// Close > prev.close && Close > Open  → xanh filled
// Close > prev.close && Close < Open  → xanh hollow (rỗng)
// Close < prev.close && Close > Open  → đỏ hollow
// Close < prev.close && Close < Open  → đỏ filled
```

---

## 2.4 HeikinAshi Transform

Heikin-Ashi không phải series mới — là **data transform** trước khi render:

```typescript
// src/lib/transforms/heikinAshi.ts
export function toHeikinAshi(bars: OHLCVBar[]): OHLCVBar[] {
    return bars.map((bar, i) => {
        const prev = i === 0 ? bar : bars[i - 1]!;
        const haClose = (bar.open + bar.high + bar.low + bar.close) / 4;
        const haOpen = i === 0 ? (bar.open + bar.close) / 2 : (prev.open + prev.close) / 2;
        return {
            ...bar,
            open: haOpen,
            close: haClose,
            high: Math.max(bar.high, haOpen, haClose),
            low: Math.min(bar.low, haOpen, haClose),
        };
    });
}

// Dùng:
const haData = useMemo(() => toHeikinAshi(rawData), [rawData]);
<CandlestickSeries /> // render bình thường với haData
```

---

## 2.5 BaselineSeries

Đường giá với fill màu khác nhau khi trên/dưới baseline (reference price):

```typescript
interface BaselineSeriesProps extends SeriesProps {
    baseValue: number | ((data: OHLCVBar[]) => number); // giá cơ sở
    topFill?: string;      // màu khi > baseline (default xanh)
    bottomFill?: string;   // màu khi < baseline (default đỏ)
}
```

---

## 2.6 Checklist hoàn thành Phase 2

- [ ] CandlestickSeries refactor với prop API mới
- [ ] HollowCandlestickSeries render đúng 4 trạng thái màu
- [ ] HeikinAshi transform + story demo
- [ ] BarSeries (OHLC stick) render
- [ ] LineSeries với gradient fill
- [ ] AreaSeries
- [ ] VolumeSeries với buy/sell color split (nếu có buyVolume/sellVolume)
- [ ] BaselineSeries
- [ ] Tất cả series có Storybook story
- [ ] Snapshot tests cho canvas output
