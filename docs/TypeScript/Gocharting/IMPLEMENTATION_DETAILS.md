# Giải pháp thực hiện chi tiết từng hạng mục

Tài liệu này hướng dẫn cách triển khai các tính năng nâng cấp dựa trên mã nguồn hiện có của thư viện `react-stockcharts`.

## 1. Triển khai Terminal Shell (Layout)

Thay vì render trực tiếp `FullDemo`, chúng ta cần một `AppShell` bao quanh.

**Mã giả cấu trúc TSX:**
```tsx
const AppTerminal = () => {
  return (
    <div className="terminal-container">
      <TopToolbar />
      <div className="terminal-body">
        <LeftSidebar />
        <main className="chart-area">
          <ChartCanvas ... />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}
```

**CSS gợi ý cho Layout chuyên nghiệp:**
```css
.terminal-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0f172a; /* Slate 900 */
  color: #e2e8f0;
}

.terminal-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.chart-area {
  flex: 1;
  position: relative;
  background: #020617; /* Slate 950 */
}
```

## 2. Tích hợp Công cụ vẽ (Drawing Tools)

Để tích hợp `TrendLine` từ Sidebar, chúng ta cần quản lý trạng thái `enableTrendLine` trong component cha.

**Cách thức thực hiện:**

1. **State Management**:
```tsx
const [enableTrendLine, setEnableTrendLine] = useState(false);
const [trends, setTrends] = useState([]);

const onTrendLineComplete = (newTrends) => {
    setTrends(newTrends);
    setEnableTrendLine(false); // Tự động tắt chế độ vẽ sau khi xong
};
```

2. **Render trong `ChartCanvas`**:
```tsx
<ChartCanvas ...>
    <Chart id={1} ...>
        <TrendLine
            enabled={enableTrendLine}
            type="LINE"
            snap={false}
            trends={trends}
            onComplete={onTrendLineComplete}
        />
    </Chart>
</ChartCanvas>
```

## 3. Hệ thống Chỉ báo động (Dynamic Indicators)

Hiện tại các chỉ báo được viết cứng. Cần chuyển sang dạng danh sách các cấu hình.

**Cấu trúc dữ liệu chỉ báo:**
```tsx
interface IndicatorConfig {
  id: string;
  type: 'EMA' | 'RSI' | 'MACD' | 'Bollinger';
  params: any;
  visible: boolean;
}

const [activeIndicators, setActiveIndicators] = useState<IndicatorConfig[]>([]);
```

**Logic render động:**
```tsx
{activeIndicators.map(ind => {
  if (ind.type === 'EMA' && ind.visible) {
    return <LineSeries yAccessor={d => d[`ema${ind.params.period}`]} ... />;
  }
  // Tương tự cho các loại khác
})}
```

## 4. Tích hợp Dữ liệu Thời gian thực (Real-time)

Sử dụng `Binance WebSocket` để cập nhật dữ liệu.

**Mã nguồn tham khảo:**
```tsx
useEffect(() => {
  const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1h');
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const candle = message.k;
    const newDatum = {
      date: new Date(candle.t),
      open: parseFloat(candle.o),
      high: parseFloat(candle.h),
      low: parseFloat(candle.l),
      close: parseFloat(candle.c),
      volume: parseFloat(candle.v),
    };
    
    setRawData(prev => {
      // Cập nhật nến cuối cùng hoặc thêm nến mới
      const last = prev[prev.length - 1];
      if (last.date.getTime() === newDatum.date.getTime()) {
        return [...prev.slice(0, -1), newDatum];
      }
      return [...prev, newDatum];
    });
  };
  return () => ws.close();
}, []);
```

## 5. Tối ưu hóa Thẩm mỹ (Aesthetics)

- **Gradients**: Sử dụng `linearGradient` trong SVG để làm đẹp cho các vùng RSI hoặc MACD Divergence.
- **Crosshair Customization**: Tùy chỉnh `CrossHairCursor` với màu sắc mờ ảo và nét đứt (strokeDasharray).
- **Smooth Transitions**: Sử dụng `framer-motion` cho các sidebar và modal để tạo cảm giác cao cấp.
