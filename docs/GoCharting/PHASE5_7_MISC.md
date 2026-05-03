# Phase 5 — Bar Replay & Backtesting

> **Thuộc:** [ROADMAP.md](./ROADMAP.md)  
> **Ước tính:** 2–3 tuần

## Bar Replay

### Controls
- Play / Pause / Step Forward / Step Back / Jump to date
- Speed: 0.5x / 1x / 2x / 5x / 10x / Max
- Right-click trên chart → "Replay from here"

### Implementation
```typescript
class BarReplayController {
    private allData: Bar[];
    private currentIndex: number;
    private speed: number;
    private timer: ReturnType<typeof setInterval> | null;
    
    // Expose subset data = allData.slice(0, currentIndex)
    // On tick: currentIndex++, notify ChartCanvas
}
```

### Paper Trading on Replay
- Click trên chart khi replay đang chạy → đặt lệnh ảo
- Track PnL theo từng step
- Báo cáo kết quả sau khi replay kết thúc

---

# Phase 6 — Custom Scripting

> **Thuộc:** [ROADMAP.md](./ROADMAP.md)  
> **Ước tính:** 5–8 tuần

## Lipi-style Script Engine

### Cú pháp mục tiêu
```
// VN Script — Custom indicator
study("My EMA Cross", overlay=true)

fast = ema(close, 12)
slow = ema(close, 26)

plot(fast, color=color.cyan, linewidth=2)
plot(slow, color=color.orange, linewidth=2)

if crossover(fast, slow)
    plotshape(low, style=shape.triangleup, color=color.green)
if crossunder(fast, slow)
    plotshape(high, style=shape.triangledown, color=color.red)
```

### Architecture
```
Source code (string)
    → Lexer → Tokens
    → Parser → AST
    → Type Checker
    → Evaluator (per bar)
    → Plot commands → Canvas render
```

### Built-in Functions
| Category | Functions |
|----------|-----------|
| MA | `ema(src, len)`, `sma(src, len)`, `wma(src, len)`, `hull(src, len)` |
| Oscillators | `rsi(src, len)`, `stoch(k, d, len)`, `cci(len)`, `mfi(len)` |
| Volatility | `atr(len)`, `stddev(src, len)`, `bb(src, len, mult)` |
| Utility | `highest(src, len)`, `lowest(src, len)`, `crossover(a, b)`, `crossunder(a, b)` |
| Math | `abs(x)`, `max(a, b)`, `min(a, b)`, `floor(x)`, `round(x)` |
| Orderflow | `buyVolume(len)`, `sellVolume(len)`, `delta(len)`, `cvd(len)` |

### Monaco Editor Integration
```tsx
import * as monaco from 'monaco-editor';

// Custom language definition
monaco.languages.register({ id: 'vnscript' });
monaco.languages.setMonarchTokensProvider('vnscript', vnScriptGrammar);
monaco.languages.registerCompletionItemProvider('vnscript', completionProvider);
```

---

# Phase 7 — Trading Integration

> **Thuộc:** [ROADMAP.md](./ROADMAP.md)  
> **Ước tính:** 4–6 tuần

## Kết nối Broker VN

### Supported Brokers
| Broker | API | Status |
|--------|-----|--------|
| TCBS | REST + WebSocket | Priority 1 |
| SSI | FastConnect API | Priority 2 |
| VPS | REST | Priority 3 |
| MBS | REST | Priority 4 |

### One-Click Trading
```tsx
// Click trên chart ở price level → modal nhanh
<QuickOrderModal
    symbol="VCB"
    price={89500}
    side="buy"
    onConfirm={(order) => placeOrder(order)}
/>
```

### Chart Trading
- **Long Position tool:** kéo từ entry → TP, auto vẽ SL xuống dưới
- **Short Position tool:** ngược lại
- Drag TP/SL line để điều chỉnh
- Hiện R:R ratio, potential PnL

### Bracket Orders
```typescript
type BracketOrder = {
    symbol: string;
    entry: { price: number; type: 'limit' | 'market' };
    takeProfit: { price: number; distance: number };
    stopLoss: { price: number; distance: number };
    quantity: number;
    riskReward: number;
};
```

### Trading Journal
- Auto log mọi lệnh
- PnL chart theo ngày/tuần/tháng
- Win rate, avg R:R, max drawdown
- Notes cho từng trade
