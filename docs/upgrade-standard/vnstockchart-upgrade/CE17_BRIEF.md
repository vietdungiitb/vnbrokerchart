# CE17 Sprint Brief — Candle Type Switcher

> **Sprint:** CE17  
> **Prerequisite:** CE15 DONE (có thể chạy song song với CE16)  
> **Estimated:** 2–3 ngày

---

## Mục tiêu sprint

Thêm UI dropdown cho phép user chuyển đổi giữa 6 loại candle:
1. Candlestick (hiện tại)
2. Hollow Candle
3. OHLC Bar
4. Heikin-Ashi
5. Area
6. Line

**Lưu ý quan trọng:** `SeriesRegistry.ts` ĐÃ đăng ký đầy đủ 6 loại này. CE17 là **thuần UI work** + HeikinAshi data transform.

---

## CE17-01 — `candleType` state + localStorage persist

### Vị trí
`src/demo/LibraryShowcaseDemo.tsx`

### Implementation
```typescript
// Thêm vào state section của LibraryShowcaseDemo
const [candleType, setCandleType] = useState<SeriesTypeId>(() => {
  const saved = localStorage.getItem("vnsc_candleType");
  if (saved && VALID_CANDLE_TYPES.includes(saved as SeriesTypeId)) {
    return saved as SeriesTypeId;
  }
  return "Candlestick";
});

const VALID_CANDLE_TYPES: readonly SeriesTypeId[] = [
  "Candlestick", "HollowCandle", "OHLC", "HeikinAshi", "Area", "Line"
] as const;

// Persist khi thay đổi
useEffect(() => {
  localStorage.setItem("vnsc_candleType", candleType);
}, [candleType]);
```

### Vị trí đọc reference trong file
Đọc file trước khi thêm:
```
read_file src/demo/LibraryShowcaseDemo.tsx lines 1–60  # imports và state setup
```

---

## CE17-02 — HeikinAshi data transform

### Vị trí
Tạo file mới: `src/demo/heikinAshi.ts` (không thêm vào `demoData.ts` để giữ separation of concerns).

### Implementation
```typescript
// src/demo/heikinAshi.ts
import type { OHLCVBar } from "../lib/types/ohlcv";

/**
 * Transform OHLCV bars thành Heikin-Ashi bars.
 * Không mutate input.
 */
export function transformHeikinAshi(bars: readonly OHLCVBar[]): OHLCVBar[] {
  if (bars.length === 0) return [];

  const result: OHLCVBar[] = [];
  
  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    const haClose = (bar.open + bar.high + bar.low + bar.close) / 4;
    
    let haOpen: number;
    if (i === 0) {
      haOpen = (bar.open + bar.close) / 2;
    } else {
      haOpen = (result[i - 1].open + result[i - 1].close) / 2;
    }
    
    const haHigh = Math.max(bar.high, haOpen, haClose);
    const haLow = Math.min(bar.low, haOpen, haClose);
    
    result.push({
      ...bar,            // giữ timestamp và volume
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
    });
  }
  
  return result;
}
```

### Unit test bắt buộc
```typescript
// Trong unit test file
describe("transformHeikinAshi", () => {
  it("HA_Close = (O+H+L+C)/4 cho mỗi bar", () => {
    const bars = [{ open: 10, high: 12, low: 9, close: 11, volume: 100, date: new Date() }];
    const result = transformHeikinAshi(bars);
    expect(result[0].close).toBeCloseTo((10 + 12 + 9 + 11) / 4);
  });
  
  it("HA_High >= max(H, HA_Open, HA_Close)", () => {
    // ...
  });
});
```

---

## CE17-03 — Dropdown UI trong toolbar

### Vị trí
`src/demo/LibraryShowcaseDemo.tsx` — khu vực toolbar hiện tại.

### Đọc trước
```
grep_search "Candlestick" LibraryShowcaseDemo.tsx  # tìm nơi hiển thị nút candle hiện tại
```

### UI skeleton
```tsx
{/* Thay thế nút "Candlestick" hiện tại */}
<select
  value={candleType}
  onChange={(e) => setCandleType(e.target.value as SeriesTypeId)}
  className="vnsc-candle-type-select"
  aria-label={t("toolbar.candleType")}
>
  {VALID_CANDLE_TYPES.map((type) => (
    <option key={type} value={type}>
      {t(`candleType.${type.toLowerCase()}`)}
    </option>
  ))}
</select>
```

### CSS
Thêm vào file CSS hiện có của demo (không tạo file CSS mới):
```css
.vnsc-candle-type-select {
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--border-color, #444);
  background: var(--surface-color, #1a1a1a);
  color: var(--text-primary, #fff);
  font-size: 12px;
  cursor: pointer;
}
```

---

## CE17-04 — i18n keys

Thêm vào `src/demo/i18n.tsx` **trong cả 2 dictionaries** (VI và EN):

```typescript
// Vietnamese
"toolbar.candleType": "Loại nến",
"candleType.candlestick": "Nến Nhật",
"candleType.hollowcandle": "Nến rỗng",
"candleType.ohlc": "Thanh OHLC",
"candleType.heikinashi": "Heikin-Ashi",
"candleType.area": "Biểu đồ diện tích",
"candleType.line": "Biểu đồ đường",

// English
"toolbar.candleType": "Candle Type",
"candleType.candlestick": "Candlestick",
"candleType.hollowcandle": "Hollow Candle",
"candleType.ohlc": "OHLC Bar",
"candleType.heikinashi": "Heikin-Ashi",
"candleType.area": "Area Chart",
"candleType.line": "Line Chart",
```

**Lưu ý:** Key phải lowercase để match `type.toLowerCase()` trong dropdown.

---

## CE17-05 — Map `candleType` → `SeriesConfig` trong chart data

### Vị trí
`src/demo/LibraryShowcaseDemo.tsx` — section build `panes` config truyền vào `DynamicChart`.

### Đọc trước
```
read_file src/demo/LibraryShowcaseDemo.tsx lines 800–880  # khu vực build chart config
```

### Implementation
1. Tìm nơi `panes[0].series[0]` được tạo (primary candle series).
2. Thay type cứng `"Candlestick"` bằng `candleType`:
   ```typescript
   const mainSeries: SeriesConfig = {
     id: "main-candle",
     type: candleType,  // đây thay vì "Candlestick"
     params: {},
   };
   ```

3. Nếu `candleType === "HeikinAshi"`, transform data trước khi truyền:
   ```typescript
   const displayData = useMemo(() => {
     if (candleType === "HeikinAshi") {
       return transformHeikinAshi(ohlcvData);
     }
     return ohlcvData;
   }, [ohlcvData, candleType]);
   ```

4. Truyền `displayData` (không phải `ohlcvData`) vào `DynamicChart`.

**QUAN TRỌNG:** Indicators (enrichData) phải dùng `ohlcvData` gốc (không phải HA-transformed), vì HA chỉ là visual representation. Đảm bảo `enrichData(ohlcvData)` không bị thay thế bằng `enrichData(displayData)`.

---

## CE17-06 — Smoke test

Thực hiện thủ công trên dev server:
1. Mở http://localhost:8080
2. Lần lượt chọn từng option trong dropdown.
3. Xác nhận:
   - Candlestick → nến thông thường
   - Hollow Candle → nến rỗng (nến tăng không fill)
   - OHLC Bar → thanh dọc với gạch ngang open/close
   - Heikin-Ashi → nến HA (ít wick hơn, body mịn hơn)
   - Area → biểu đồ diện tích với fill
   - Line → đường close
4. Không có console error.
5. Reload page → giữ đúng type đã chọn.

---

## CE17-07 — Final audit

### Gate commands
```powershell
npm run type-check
npm test
npm run build:docs
python scripts/generate_module_tree.py
```

### Commit
```bash
git commit -m "feat(CE17): candle type switcher — dropdown + HeikinAshi transform

- candleType state with localStorage persist
- transformHeikinAshi() pure function
- Dropdown UI with 6 options (Candlestick/Hollow/OHLC/HA/Area/Line)
- i18n VI+EN for candle type labels
- HeikinAshi only transforms display data, enrichData uses raw OHLCV

Gates: type-check OK | tests PASS | build OK"

git push origin dev
```
