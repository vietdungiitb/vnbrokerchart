# CE16 Sprint Brief — Indicator Pack 2 (Advanced Oscillators)

> **Sprint:** CE16  
> **Prerequisite:** CE15 DONE  
> **Indicators:** KDJ, CCI, DMI, BIAS, BRAR, MTM, EMV, AO, ROC, TRIX, DMA, PVT, PSY, CR (14 indicators)  
> **Estimated:** 5–6 ngày

---

## Mục tiêu sprint

Thêm 14 indicators để đưa tổng số lên ≥27 (ngang KLineCharts 30 khi tính tất cả variants).  
Tất cả phải tuân thủ **SSOT 8-bước** như CE15.

---

## Pattern tham chiếu

Toàn bộ indicator trong sprint này dùng đúng pattern CE15.  
Đọc [CE15_BRIEF.md](CE15_BRIEF.md) để hiểu pattern trước khi bắt đầu bất kỳ indicator nào.

---

## CE16-01 — KDJ (Stochastic + J line)

### Định nghĩa
```
RSV(n) = (Close - LowestLow(n)) / (HighestHigh(n) - LowestLow(n)) * 100
K = EMA(RSV, m1)  — thường m1 = 3
D = EMA(K, m2)    — thường m2 = 3
J = 3*K - 2*D
```
Params: period=9, m1=3, m2=3

### Output type
```typescript
export interface KDJValue {
  k: number[];
  d: number[];
  j: number[];
}
```

### Pane placement
Pane riêng. Y-axis range thường 0–100 nhưng J có thể vượt ra ngoài.

### i18n
```
"indicator.kdj": "KDJ"
"indicator.kdj.description": "Stochastic KDJ" (VI) / "Stochastic KDJ" (EN)
```

---

## CE16-02 — CCI (Commodity Channel Index)

### Định nghĩa
```
TP = (H + L + C) / 3
CCI = (TP - SMA(TP, n)) / (0.015 * MeanAbsoluteDeviation(TP, n))
```
Params: period=20

### Horizontal bands
±100 hiển thị dưới dạng horizontal reference lines trên pane.

### i18n
```
"indicator.cci": "CCI"
"indicator.cci.description": "Chỉ số kênh hàng hóa" / "Commodity Channel Index"
```

---

## CE16-03 — DMI (Directional Movement Index)

### Định nghĩa
```
TR = max(H - L, |H - prevC|, |L - prevC|)
+DM = max(H - prevH, 0)  khi H - prevH > prevL - L, else 0
-DM = max(prevL - L, 0)  khi prevL - L > H - prevH, else 0
+DI(n) = 100 * Wilder_EMA(+DM, n) / Wilder_EMA(TR, n)
-DI(n) = 100 * Wilder_EMA(-DM, n) / Wilder_EMA(TR, n)
ADX = Wilder_EMA(|+DI - -DI| / (+DI + -DI) * 100, n)
```
Params: period=14

### Output
```typescript
interface DMIValue {
  plusDI: number[];
  minusDI: number[];
  adx: number[];
}
```

### i18n
```
"indicator.dmi": "DMI"
"indicator.dmi.description": "Chỉ số chuyển động định hướng" / "Directional Movement Index"
```

---

## CE16-04 — BIAS (Deviation Rate)

### Định nghĩa
```
BIAS(n) = (Close - SMA(n)) / SMA(n) * 100
```
Params: period=6 (default), thường dùng 6,12,24

### i18n
```
"indicator.bias": "BIAS"
"indicator.bias.description": "Tỷ lệ lệch" / "Bias Ratio"
```

---

## CE16-05 — BRAR (Bull and Bear Ratio)

### Định nghĩa
```
AR(n) = Sum(H - O) / Sum(O - L) * 100
BR(n) = Sum(H - prevC) / Sum(prevC - L) * 100
```
Params: period=26

### Output
```typescript
interface BRARValue {
  ar: number[];
  br: number[];
}
```

### i18n
```
"indicator.brar": "BRAR"
"indicator.brar.description": "Tỷ lệ Bò-Gấu" / "Bull Bear Ratio"
```

---

## CE16-06 — MTM (Momentum)

### Định nghĩa
```
MTM(n) = Close - Close[n periods ago]
Signal = SMA(MTM, signalPeriod)
```
Params: period=6, signalPeriod=6

### Output
```typescript
interface MTMValue {
  mtm: number[];
  signal: number[];
}
```

### i18n
```
"indicator.mtm": "MTM"
"indicator.mtm.description": "Đà tăng/giảm" / "Momentum"
```

---

## CE16-07 — EMV (Ease of Movement)

### Định nghĩa
```
MidPoint = (H + L) / 2
BoxRatio = Volume / (H - L)
EMV = (MidPoint - prevMidPoint) / BoxRatio
Signal = SMA(EMV, n)
```
Params: period=14

**Lưu ý:** EMV yêu cầu `volume` field trong OHLCVBar. Xác nhận field tồn tại trước khi compute.

### i18n
```
"indicator.emv": "EMV"
"indicator.emv.description": "Dễ chuyển động" / "Ease of Movement"
```

---

## CE16-08 — AO (Awesome Oscillator)

### Định nghĩa
```
Midpoint = (H + L) / 2
AO = SMA(Midpoint, 5) - SMA(Midpoint, 34)
```
Histogram: xanh khi AO > prev AO, đỏ khi AO < prev AO.

### Render
Dùng `HistogramSeries` (hoặc `BarSeries`) với color accessor. Tương tự MACD histogram nếu đã có component.

### i18n
```
"indicator.ao": "AO"
"indicator.ao.description": "Bộ dao động tuyệt vời" / "Awesome Oscillator"
```

---

## CE16-09 — ROC (Rate of Change)

### Định nghĩa
```
ROC(n) = (Close - Close[n]) / Close[n] * 100
```
Params: period=12

### i18n
```
"indicator.roc": "ROC"
"indicator.roc.description": "Tỷ lệ thay đổi" / "Rate of Change"
```

---

## CE16-10 — TRIX (Triple Exponential Moving Average)

### Định nghĩa
```
EMA1 = EMA(Close, n)
EMA2 = EMA(EMA1, n)
EMA3 = EMA(EMA2, n)
TRIX = (EMA3 - prevEMA3) / prevEMA3 * 100
Signal = EMA(TRIX, signalPeriod)
```
Params: period=12, signalPeriod=9

### i18n
```
"indicator.trix": "TRIX"
"indicator.trix.description": "MA lũy thừa ba" / "Triple Exponential MA"
```

---

## CE16-11 — DMA (Differential Moving Average)

### Định nghĩa
```
DDD = MA(n1) - MA(n2)     — thường n1=10, n2=50
AMA = SMA(DDD, m)          — thường m=10
```

### Output
```typescript
interface DMAValue {
  ddd: number[];
  ama: number[];
}
```

### i18n
```
"indicator.dma": "DMA"
"indicator.dma.description": "MA vi sai" / "Differential Moving Average"
```

---

## CE16-12 — PVT (Price Volume Trend)

### Định nghĩa
```
PVT = cumSum(Volume * (Close - prevClose) / prevClose)
```

### i18n
```
"indicator.pvt": "PVT"
"indicator.pvt.description": "Xu hướng Giá-Khối lượng" / "Price Volume Trend"
```

---

## CE16-13 — PSY (Psychological Line)

### Định nghĩa
```
PSY(n) = Count(Close > prevClose trong n bars) / n * 100
Signal = SMA(PSY, m)
```
Params: period=12, signalPeriod=6

### i18n
```
"indicator.psy": "PSY"
"indicator.psy.description": "Đường tâm lý" / "Psychological Line"
```

---

## CE16-14 — CR (CR Indicator)

### Định nghĩa
```
HM = (H + prevH + prevL + prevC) / 4  (trung điểm hôm qua mở rộng)
CR = Sum(H - HM) / Sum(HM - L) * 100
MA1 = SMA(CR, m1), MA2 = SMA(CR, m2), MA3 = SMA(CR, m3), MA4 = SMA(CR, m4)
```
Params: period=26, m1=10, m2=20, m3=40, m4=60

### Output
```typescript
interface CRValue {
  cr: number[];
  ma1: number[];
  ma2: number[];
  ma3: number[];
  ma4: number[];
}
```

### i18n
```
"indicator.cr": "CR"
"indicator.cr.description": "Chỉ số CR" / "CR Indicator"
```

---

## CE16-15 — Unit tests

Tương tự CE15: mỗi compute function ít nhất 1 golden test kiểm tra với dữ liệu đã biết trước.

**Tối thiểu bắt buộc cho CE16:**
- KDJ: test K không quá 100/dưới 0 với dữ liệu bình thường.
- CCI: test value = 0 khi close = SMA.
- DMI: test +DI + -DI <= 200.
- AO: test histogram color logic (xanh/đỏ so với prev bar).

---

## CE16-16 — Final audit

### Gate commands
```powershell
npm run type-check   # 0 errors
npm test             # PASS (tăng ≥14 tests cho CE16)
npm run build:docs   # OK
python scripts/generate_module_tree.py
```

### Commit
```bash
git commit -m "feat(CE16): add 14 advanced oscillators (KDJ, CCI, DMI, BIAS, BRAR, MTM, EMV, AO, ROC, TRIX, DMA, PVT, PSY, CR)

SSOT-compliant: plugin → enrichData → SeriesRegistry
i18n: VI+EN for all 14
Tests: compute unit tests

Gates: type-check OK | tests PASS | build OK"

git push origin dev
```

---

## Accuracy validation

Trước khi đóng CE16, cross-check ít nhất 3 indicators với TradingView hoặc reference implementation:
1. Load cùng symbol, cùng period, cùng params.
2. So sánh giá trị tại cùng thời điểm.
3. Chênh lệch < 0.01% là acceptable (floating point).

Ghi kết quả cross-check vào ledger entry.
