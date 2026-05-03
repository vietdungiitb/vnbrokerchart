# Phase 2 — Indicators & Drawing Tools

> **Thuộc:** [ROADMAP.md](./ROADMAP.md)  
> **Ước tính:** 3–5 tuần  
> **Mục tiêu:** Indicator manager, bộ indicators đầy đủ, drawing tools cơ bản

---

## 2.1 Indicator Manager Architecture

### Study Panel (Modal)
- Nút "Indicators" trên toolbar → mở modal
- Tìm kiếm theo tên, lọc theo nhóm (Overlay / Oscillator / Momentum / Orderflow)
- Click indicator → thêm vào chart với settings mặc định
- Mỗi indicator hiện thị trên **pane riêng** hoặc **overlay lên price** tùy loại

### Indicator Instance
```typescript
type IndicatorInstance = {
    id: string;          // unique per chart
    type: string;        // 'ema', 'rsi', 'bollinger', ...
    paneId: number;      // 0 = price pane, 1+ = sub-panes
    params: Record<string, number | string | boolean>;
    style: {
        color: string;
        lineWidth: number;
        lineStyle: 'solid' | 'dashed' | 'dotted';
        visible: boolean;
    };
};
```

### Settings Dialog
- Click vào legend indicator → mở dialog chỉnh params
- Live preview khi thay đổi
- Lưu template settings

---

## 2.2 Overlays — Danh sách ưu tiên VN

### VWAP (Rất quan trọng)
```typescript
// Xem chi tiết ở PHASE3_ORDERFLOW.md
// Cần làm ngay cùng Phase 2
```

### Ichimoku Cloud
- **Tenkan-sen** (Conversion): (highest_high + lowest_low) / 2 của 9 kỳ
- **Kijun-sen** (Base): (highest_high + lowest_low) / 2 của 26 kỳ  
- **Senkou Span A** (Leading A): (Tenkan + Kijun) / 2, dịch 26 kỳ về phía trước
- **Senkou Span B** (Leading B): (highest + lowest) / 2 của 52 kỳ, dịch 26 kỳ
- **Chikou Span** (Lagging): close dịch 26 kỳ về phía sau
- Cloud: vùng giữa Span A và B, tô màu xanh khi A > B, đỏ khi ngược

### Supertrend
```typescript
function supertrend(data: Bar[], period = 7, multiplier = 3) {
    // ATR-based trend following
    // Upper band = (high+low)/2 + multiplier * ATR
    // Lower band = (high+low)/2 - multiplier * ATR
    // Trend flip khi close vượt band
}
```
- Render: line xanh khi uptrend (dưới giá), đỏ khi downtrend (trên giá)

### Bollinger Bands (đã có trong lib)
- Middle = SMA(20)
- Upper = SMA(20) + 2*stddev
- Lower = SMA(20) - 2*stddev
- Bandwidth, %B indicators từ Bollinger

### Pivot Points
```typescript
type PivotType = 'standard' | 'fibonacci' | 'camarilla' | 'woodie' | 'demark';
// Standard: PP = (H+L+C)/3; R1 = 2*PP-L; S1 = 2*PP-H; R2,R3,S2,S3...
// Fibonacci: R1 = PP + 0.382*(H-L); R2 = PP + 0.618*(H-L); R3 = PP + (H-L)
```
- Render: horizontal lines tĩnh (không di chuyển theo thời gian)
- Label: PP, R1, R2, R3, S1, S2, S3

### ATR Trailing Stop
- Dựa trên ATR để đặt trailing stop động
- Flip direction khi close vượt qua stop

---

## 2.3 Oscillators — Danh sách

### RSI
```typescript
function rsi(data: number[], period = 14): number[] {
    // Wilder smoothing average
    // RSI = 100 - (100 / (1 + RS))
    // RS = avgGain / avgLoss
}
```
- Pane riêng: 0–100
- OB zone: > 70 (đỏ nhạt), OS zone: < 30 (xanh nhạt)
- Divergence markers (tùy chọn)

### Stochastic RSI
- RSI của RSI, normalize về 0–100
- %K = (RSI - minRSI_n) / (maxRSI_n - minRSI_n) * 100
- %D = SMA(%K, 3)

### ADX + DI
- ADX: Average Directional Index (trend strength 0–100)
- +DI, -DI: directional movement indicators
- ADX > 25 = trending; < 20 = ranging

### MFI (Money Flow Index)
- RSI nhưng dùng volume: MFI = 100 - 100/(1 + MF_ratio)
- Phát hiện divergence giữa giá và dòng tiền

### OBV (On Balance Volume)
- Tích lũy: nếu close > prev_close → OBV += volume; ngược lại OBV -= volume
- Divergence với price là tín hiệu

---

## 2.4 Drawing Tools Implementation

### State Machine
```typescript
type DrawingMode = 
    | 'select'
    | 'trendline' | 'ray' | 'extended_line'
    | 'hline' | 'vline'
    | 'rectangle' | 'circle'
    | 'fibonacci_retracement' | 'fibonacci_extension'
    | 'parallel_channel' | 'pitchfork'
    | 'text';

// Transitions:
// select → trendline: click toolbar
// trendline (placing) → trendline (complete): 2nd click
// complete → select: ESC hoặc click lại tool
```

### Drawing Data Model
```typescript
type Drawing = {
    id: string;
    type: DrawingMode;
    symbol: string;
    timeframe: string;
    points: Array<{ xValue: number; yValue: number }>; // index-based x
    style: DrawingStyle;
    locked: boolean;
    visible: boolean;
    createdAt: Date;
};

type DrawingStyle = {
    color: string;
    lineWidth: number;
    lineStyle: 'solid' | 'dashed' | 'dotted';
    fillColor?: string;
    fillOpacity?: number;
    showLabels?: boolean;
    fontSize?: number;
};
```

### Fibonacci Retracement
```typescript
// Points: [start, end]
// Levels: 0%, 23.6%, 38.2%, 50%, 61.8%, 78.6%, 100%, 161.8%, 261.8%
const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.618, 2.618];

function renderFibRetracement(ctx, start, end, xScale, yScale) {
    const priceRange = start.yValue - end.yValue;
    FIB_LEVELS.forEach(level => {
        const price = end.yValue + priceRange * level;
        const y = yScale(price);
        // draw horizontal line at y
        // draw label: `${(level * 100).toFixed(1)}% — ${price.toFixed(2)}`
    });
}
```

### Parallel Channel
- 3 điểm: P1 (start), P2 (end), P3 (xác định độ rộng kênh)
- Tính vector hướng từ P1→P2
- Channel line = trendline offset theo P3

### Persistence (Django)
```python
class Drawing(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    symbol = models.CharField(max_length=20)
    timeframe = models.CharField(max_length=10)
    type = models.CharField(max_length=30)
    points = models.JSONField()
    style = models.JSONField()
    locked = models.BooleanField(default=False)
    visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Undo/Redo Stack
```typescript
class DrawingHistory {
    private past: Drawing[][] = [];
    private future: Drawing[][] = [];
    
    push(drawings: Drawing[]) {
        this.past.push([...drawings]);
        this.future = []; // clear redo stack
    }
    
    undo(): Drawing[] | null {
        if (this.past.length < 2) return null;
        this.future.push(this.past.pop()!);
        return [...this.past[this.past.length - 1]];
    }
    
    redo(): Drawing[] | null {
        if (!this.future.length) return null;
        const next = this.future.pop()!;
        this.past.push(next);
        return [...next];
    }
}
```

---

## 2.5 Files cần tạo/sửa

| File | Thay đổi |
|------|----------|
| `src/lib/indicator/vwap.ts` | VWAP calculator |
| `src/lib/indicator/ichimoku.ts` | Ichimoku calculator |
| `src/lib/indicator/supertrend.ts` | Supertrend calculator |
| `src/lib/indicator/pivots.ts` | Pivot Points calculator |
| `src/lib/indicator/rsi.ts` | RSI (cải thiện từ lib cũ) |
| `src/lib/indicator/mfi.ts` | MFI calculator |
| `src/lib/series/VWAPSeries.tsx` | VWAP line renderer |
| `src/lib/series/IchimokuSeries.tsx` | Ichimoku cloud renderer |
| `src/lib/series/SupertrendSeries.tsx` | Supertrend renderer |
| `src/lib/drawing/DrawingManager.tsx` | Core drawing state machine |
| `src/lib/drawing/TrendlineTool.tsx` | Trendline implementation |
| `src/lib/drawing/FibRetracement.tsx` | Fibonacci retracement |
| `src/lib/drawing/HorizontalLine.tsx` | H-line |
| `src/lib/drawing/VerticalLine.tsx` | V-line |
| `src/lib/drawing/Rectangle.tsx` | Rectangle |
| `src/lib/drawing/TextLabel.tsx` | Text annotation |
| `src/demo/StudyPanel.tsx` | Indicator manager modal |
| `src/demo/DrawingHistory.ts` | Undo/Redo stack |

---

## Checklist hoàn thành Phase 2

- [ ] StudyPanel modal tìm và thêm indicator
- [ ] Indicator settings dialog với live preview
- [ ] VWAP overlay (session + anchor)
- [ ] Ichimoku Cloud render đúng
- [ ] Supertrend flip logic đúng
- [ ] Pivot Points render (Standard + Fibonacci)
- [ ] RSI pane với OB/OS zones
- [ ] Stochastic RSI
- [ ] DrawingManager state machine hoàn chỉnh
- [ ] Trendline: click 2 điểm, drag để di chuyển, handle để resize
- [ ] Horizontal/Vertical lines
- [ ] Rectangle với fill
- [ ] Fibonacci Retracement với đủ levels và labels
- [ ] Undo/Redo (Ctrl+Z / Ctrl+Y)
- [ ] Save/Load drawings từ Django API
- [ ] Drawing templates
