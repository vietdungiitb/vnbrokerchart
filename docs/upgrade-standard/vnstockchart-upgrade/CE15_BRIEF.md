# CE15 Sprint Brief — Indicator Pack 1

> **Sprint:** CE15  
> **Prerequisite:** CE14 DONE  
> **Indicators:** MA, BBI, SAR, OBV, WR, VR (6 indicators)  
> **Estimated:** 3–4 ngày

---

## Mục tiêu sprint

Thêm 6 indicators quan trọng thường gặp trên các platform chuyên nghiệp:
- **MA** — Moving Average multi-period overlay trên candle
- **BBI** — Bull and Bear Index
- **SAR** — Parabolic Stop and Reverse
- **OBV** — On Balance Volume
- **WR** — Williams %R
- **VR** — Volume Ratio

**Toàn bộ 6 indicators phải tuân theo SSOT 8-bước tại [TECH_SPEC.md](TECH_SPEC.md#2-pattern-thêm-indicator-mới).**

---

## SSOT Compliance Checklist (áp dụng cho MỌI indicator trong sprint này)

Với mỗi indicator, coder phải check đủ 8 bước:

- [ ] 1. Plugin file trong `src/lib/indicators/builtin/`
- [ ] 2. Compute function trong `src/lib/indicators/utils.ts`
- [ ] 3. Đăng ký trong `src/lib/indicators/index.ts`
- [ ] 4. Output key trong `EnrichedDatum` (`src/lib/core/calculators/types.ts`)
- [ ] 5. Compute call trong `enrichData.ts` (thêm vào plugin list — KHÔNG viết inline)
- [ ] 6. `RegistryEntry` trong `SeriesRegistry.ts`
- [ ] 7. i18n keys trong `src/demo/i18n.tsx` (VI + EN)
- [ ] 8. `SeriesTypeId` mới trong `pane-descriptor.ts`

---

## CE15-01 — MA (Multi-period Moving Average)

### Định nghĩa
MA là đường SMA thông thường, nhưng nhiều MA có thể overlay trên cùng một pane với periods khác nhau.  
VNStockCharts đã có `SMA` — MA ở đây là wrapper cho phép nhanh thêm MA(5), MA(10), MA(20), MA(60) mà không phải tạo 4 series riêng.

### Cách triển khai
Không tạo file mới nếu `SMA` đã đủ — kiểm tra trước:
```
read_file src/lib/indicators/builtin/sma.ts (full)
```

Nếu `SMA` đã có `period` param và có thể dùng tốt, chỉ cần:
1. Thêm `SeriesTypeId` `"MA"` vào `pane-descriptor.ts` (alias của SMA, khác display name).
2. Thêm `RegistryEntry` "MA" trong `SeriesRegistry.ts` trỏ vào cùng component SMA.
3. Thêm i18n key `"indicator.ma"` / `"indicator.ma.description"`.

### i18n keys
```typescript
"indicator.ma": "MA",
"indicator.ma.description": "Đường trung bình động",
// EN:
"indicator.ma": "MA",
"indicator.ma.description": "Moving Average",
```

---

## CE15-02 — BBI (Bull and Bear Index)

### Định nghĩa
BBI = (MA3 + MA6 + MA12 + MA24) / 4

### Compute function
```typescript
// src/lib/indicators/utils.ts
export function bbiSeries(bars: readonly OHLCVBar[]): number[] {
  const close = bars.map((b) => b.close);
  const ma3 = simpleMovingAverage(close, 3);
  const ma6 = simpleMovingAverage(close, 6);
  const ma12 = simpleMovingAverage(close, 12);
  const ma24 = simpleMovingAverage(close, 24);
  return close.map((_, i) => (ma3[i] + ma6[i] + ma12[i] + ma24[i]) / 4);
}
```

### Plugin file skeleton
```typescript
// src/lib/indicators/builtin/bbi.ts
const BBI: IndicatorDefinition<OHLCVBar, { bbi: number[] }, []> = {
  name: "BBI",
  compute: (bars) => ({ bbi: bbiSeries(bars) }),
  computeExtents: (v) => numericExtent(v.bbi),
  yAxis: "right",
};
export default BBI;
```

### i18n keys
```typescript
"indicator.bbi": "BBI",
"indicator.bbi.description": "Chỉ số Bò và Gấu",
// EN: "Bull and Bear Index"
```

---

## CE15-03 — SAR (Parabolic SAR)

### Định nghĩa
Parabolic SAR dots xuất hiện phía trên giá khi downtrend, phía dưới khi uptrend.

### Params
- `accelerationFactor` (AF): step = 0.02, max = 0.2 (defaults chuẩn)

### Compute function (viết trong utils.ts)
```typescript
export function sarSeries(
  bars: readonly OHLCVBar[],
  afStep = 0.02,
  afMax = 0.2
): number[] {
  // Standard Wilder's Parabolic SAR algorithm
  // Reference: https://school.stockcharts.com/doku.php?id=technical_indicators:parabolic_sar
  ...
}
```

### RegistryEntry
SAR dùng dạng "scatter dots" — có thể dùng `ScatterSeries` hoặc `LineSeries` với `strokeStyle: "none"` và `markerStyle: "dot"`. Kiểm tra component có sẵn trong thư viện trước khi tạo mới.

### Render position
Nằm trên candle pane (cùng Y-axis với candlestick, `yAxis: "right"`).

### i18n keys
```typescript
"indicator.sar": "SAR",
"indicator.sar.description": "Parabolic SAR",
```

---

## CE15-04 — OBV (On Balance Volume)

### Định nghĩa
```
OBV[i] = OBV[i-1] + volume[i]  nếu close[i] > close[i-1]
OBV[i] = OBV[i-1] - volume[i]  nếu close[i] < close[i-1]
OBV[i] = OBV[i-1]              nếu close[i] = close[i-1]
```

### Pane placement
OBV không nằm chung pane với candle — phải có **pane riêng** (indicator pane).  
`yAxis` setting phải tách riêng.

### Compute function
```typescript
export function obvSeries(bars: readonly OHLCVBar[]): number[] {
  const result: number[] = [0];
  for (let i = 1; i < bars.length; i++) {
    const delta = bars[i].close > bars[i - 1].close
      ? bars[i].volume
      : bars[i].close < bars[i - 1].close
      ? -bars[i].volume
      : 0;
    result.push(result[i - 1] + delta);
  }
  return result;
}
```

### i18n keys
```typescript
"indicator.obv": "OBV",
"indicator.obv.description": "Khối lượng cân bằng",
// EN: "On Balance Volume"
```

---

## CE15-05 — WR (Williams %R)

### Định nghĩa
```
WR = (Highest High(n) - Close) / (Highest High(n) - Lowest Low(n)) * -100
```
Range: -100 → 0. Overbought: WR > -20. Oversold: WR < -80.

### Compute function
```typescript
export function wrSeries(bars: readonly OHLCVBar[], period = 14): number[] {
  return bars.map((_, i) => {
    if (i < period - 1) return NaN;
    const window = bars.slice(i - period + 1, i + 1);
    const hh = Math.max(...window.map((b) => b.high));
    const ll = Math.min(...window.map((b) => b.low));
    if (hh === ll) return -50;
    return ((hh - bars[i].close) / (hh - ll)) * -100;
  });
}
```

### RegistryEntry
- Pane riêng, Y-axis range fixed: min = -100, max = 0.
- Hiển thị 2 horizontal bands ở -20 và -80.
- Tooltip: `WR(14): -35.2`

### i18n keys
```typescript
"indicator.wr": "WR",
"indicator.wr.description": "Williams %R",
```

---

## CE15-06 — VR (Volume Ratio)

### Định nghĩa
```
VR = (Sum của volume khi close tăng + 0.5 * Sum khi close không đổi) /
     (Sum của volume khi close giảm + 0.5 * Sum khi close không đổi)
     × 100
```
Tính trong cửa sổ `period` bars.

### Compute function
```typescript
export function vrSeries(bars: readonly OHLCVBar[], period = 26): number[] {
  return bars.map((_, i) => {
    if (i < period) return NaN;
    const window = bars.slice(i - period + 1, i + 1);
    let up = 0, down = 0, flat = 0;
    for (let j = 1; j < window.length; j++) {
      if (window[j].close > window[j - 1].close) up += window[j].volume;
      else if (window[j].close < window[j - 1].close) down += window[j].volume;
      else flat += window[j].volume;
    }
    if (down + flat * 0.5 === 0) return 100;
    return ((up + flat * 0.5) / (down + flat * 0.5)) * 100;
  });
}
```

### i18n keys
```typescript
"indicator.vr": "VR",
"indicator.vr.description": "Tỷ lệ khối lượng",
// EN: "Volume Ratio"
```

---

## CE15-07 — Update pane-descriptor.ts

Thêm 6 types mới vào union type `SeriesTypeId`:

```typescript
export type SeriesTypeId =
  | "Candlestick" | "HollowCandle" | "OHLC" | "HeikinAshi" | "Line" | "Area" | "Bar"
  | "Volume" | "EMA" | "SMA" | "RSI" | "MACD" | "BollingerBand"
  | "CVDApprox" | "CVDRealtime" | "Whale" | "ElderRay" | "StrengthElder" | "StrengthRelative"
  // CE15 additions:
  | "MA" | "BBI" | "SAR" | "OBV" | "WR" | "VR";
```

---

## CE15-08 — Unit tests

Mỗi compute function cần ít nhất 1 unit test kiểm tra:
1. Output length = input length (hoặc input length - warmup period).
2. Giá trị tại một data point đã biết trước (golden test).

Test file: `src/lib/indicators/builtin/__tests__/ce15.test.ts` (hoặc tách riêng).

---

## CE15-09 — Final audit

### Gate commands
```powershell
npm run type-check   # 0 errors
npm test             # PASS (tăng thêm ≥6 tests cho CE15)
npm run build:docs   # OK
python scripts/generate_module_tree.py
```

### Commit
```bash
git commit -m "feat(CE15): add MA, BBI, SAR, OBV, WR, VR indicators

SSOT-compliant: plugin → enrichData → SeriesRegistry
i18n: VI+EN labels for all 6 indicators
Tests: unit tests for compute functions

Gates: type-check OK | tests PASS | build OK"

git push origin dev
```
