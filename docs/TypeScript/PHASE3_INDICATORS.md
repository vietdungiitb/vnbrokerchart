# Phase 3 — Indicators (Pure TypeScript)

> **Thuộc:** [ROADMAP.md](./ROADMAP.md)  
> **Ước tính:** 4–5 tuần  
> **Mục tiêu:** Tất cả tính toán indicator chạy hoàn toàn client-side, không cần backend

---

## 3.1 Nguyên tắc thiết kế

- **Pure functions:** Mỗi indicator là `(input: number[], ...params) => number[]`
- **No side effects:** Dễ test, dễ cache, dễ parallelize
- **NaN padding:** Các giá trị đầu chưa đủ kỳ trả về `NaN` (không phải 0 hay null)
- **Tree-shakeable:** Import riêng từng indicator, không bundle toàn bộ

```typescript
// ✅ Đúng — pure function
export function ema(closes: number[], period: number): number[]

// ❌ Sai — không dùng class với state
class EMACalculator { calculate() {...} }
```

---

## 3.2 Cấu trúc thư mục

```
src/lib/indicators/
├── moving-averages/
│   ├── sma.ts          simple moving average
│   ├── ema.ts          exponential moving average
│   ├── wma.ts          weighted moving average
│   ├── hull.ts         hull moving average
│   ├── tema.ts         triple EMA
│   ├── kama.ts         kaufman adaptive MA
│   └── index.ts
├── oscillators/
│   ├── rsi.ts
│   ├── stochrsi.ts
│   ├── stochastic.ts
│   ├── cci.ts
│   ├── mfi.ts
│   └── index.ts
├── trend/
│   ├── macd.ts
│   ├── adx.ts
│   ├── parabolicSAR.ts
│   ├── supertrend.ts
│   ├── ichimoku.ts
│   └── index.ts
├── volatility/
│   ├── atr.ts
│   ├── bollinger.ts
│   ├── keltner.ts
│   ├── donchian.ts
│   └── index.ts
├── volume/
│   ├── obv.ts
│   ├── cmf.ts
│   ├── vwap.ts
│   └── index.ts
├── orderflow/
│   ├── delta.ts
│   ├── cvd.ts
│   ├── buyPressure.ts
│   └── index.ts
└── index.ts            ← re-export tất cả
```

---

## 3.3 Signatures chuẩn

### Moving Averages
```typescript
export function sma(values: number[], period: number): number[]
export function ema(values: number[], period: number): number[]
export function wma(values: number[], period: number): number[]
export function hull(values: number[], period: number): number[]
export function kama(values: number[], period?: number, fastK?: number, slowK?: number): number[]
```

### Oscillators
```typescript
export function rsi(closes: number[], period: number): number[]
export function stochastic(
    highs: number[], lows: number[], closes: number[],
    kPeriod: number, dPeriod: number
): { k: number[]; d: number[] }

export function cci(highs: number[], lows: number[], closes: number[], period: number): number[]
export function mfi(
    highs: number[], lows: number[], closes: number[], volumes: number[],
    period: number
): number[]
```

### MACD
```typescript
export interface MACDResult {
    macd: number[];
    signal: number[];
    histogram: number[];
}
export function macd(
    closes: number[],
    fastPeriod: number,
    slowPeriod: number,
    signalPeriod: number
): MACDResult
```

### Bollinger Bands
```typescript
export interface BollingerBandsResult {
    upper: number[];
    middle: number[];
    lower: number[];
    bandwidth: number[];
    percentB: number[];
}
export function bollingerBands(
    values: number[],
    period: number,
    multiplier: number
): BollingerBandsResult
```

### VWAP
```typescript
export function vwap(bars: OHLCVBar[]): number[]

// VWAP Bands (dùng cho anchored VWAP)
export function anchoredVWAP(bars: OHLCVBar[], anchorIndex: number): number[]
```

### Supertrend
```typescript
export interface SupertrendResult {
    supertrend: number[];
    direction: Array<1 | -1>; // 1 = bullish, -1 = bearish
    trend: Array<'up' | 'down'>;
}
export function supertrend(
    highs: number[], lows: number[], closes: number[],
    period: number, multiplier: number
): SupertrendResult
```

---

## 3.4 Orderflow Indicators

### CVD (Cumulative Volume Delta)
```typescript
// Cần buyVolume + sellVolume từ data
export function delta(bars: OHLCVBar[]): number[] {
    return bars.map(b => (b.buyVolume ?? 0) - (b.sellVolume ?? 0));
}

export function cvd(bars: OHLCVBar[]): number[] {
    const deltas = delta(bars);
    let cumulative = 0;
    return deltas.map(d => (cumulative += d));
}

export function buyPressure(bars: OHLCVBar[]): number[] {
    return bars.map(b => {
        const total = b.volume;
        if (!total || !b.buyVolume) return NaN;
        return b.buyVolume / total; // 0–1
    });
}
```

---

## 3.5 React Hook Layer

### `useIndicator` — generic hook
```typescript
// src/lib/hooks/useIndicator.ts
export function useIndicator<TParams extends unknown[], TResult>(
    data: OHLCVBar[],
    indicator: (bars: OHLCVBar[], ...params: TParams) => TResult,
    params: TParams
): { values: TResult; isLoading: boolean } {
    return useMemo(() => ({
        values: indicator(data, ...params),
        isLoading: false,
    }), [data, ...params]);
}

// Sử dụng:
const { values: emaValues } = useIndicator(data, (bars, p) => 
    ema(bars.map(b => b.close), p), [20]);

const { values: rsiValues } = useIndicator(data, (bars, p) =>
    rsi(bars.map(b => b.close), p), [14]);
```

---

## 3.6 Indicator Overlay Components

```tsx
// Dùng indicator trực tiếp trong chart:
<Chart id={2} yExtents={[0, 100]}>
    <YAxis />
    <RSISeries period={14} stroke="#7c3aed" />
    <RSITooltip />
    <SingleValueTooltip yLabel="RSI" />
</Chart>

<Chart id={1} yExtents={(d) => [d.high, d.low]}>
    <CandlestickSeries />
    <BollingerBandOverlay period={20} multiplier={2} />
    <EMAOverlay period={20} stroke="#f59e0b" />
    <EMAOverlay period={50} stroke="#3b82f6" />
    <VWAPOverlay stroke="#e879f9" />
</Chart>
```

---

## 3.7 Checklist hoàn thành Phase 3

- [ ] Tất cả MA functions: sma, ema, wma, hull, tema, kama
- [ ] RSI với NaN cho kỳ đầu
- [ ] Stochastic (K + D lines)
- [ ] MACD (macd + signal + histogram)
- [ ] Bollinger Bands (upper/middle/lower + %B + bandwidth)
- [ ] ATR
- [ ] Supertrend với direction
- [ ] VWAP từ OHLCV
- [ ] Anchored VWAP (chọn điểm neo)
- [ ] OBV
- [ ] CVD + Delta từ buyVolume/sellVolume
- [ ] `useIndicator` hook
- [ ] Unit tests với Vitest cho mọi indicator
- [ ] Storybook stories cho mọi overlay
