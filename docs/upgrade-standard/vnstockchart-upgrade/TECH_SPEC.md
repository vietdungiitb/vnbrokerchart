# Technical Specification — VNStockChart Upgrade CE14→CE21

> **Phiên bản:** 1.0 · 2026-05-07  
> **Governance:** [PROJECT_GOVERNANCE.md](../../project-delivery/PROJECT_GOVERNANCE.md)  
> **SSOT Policy:** [INDICATOR_SSOT_POLICY.md](../../planning/INDICATOR_SSOT_POLICY.md)

---

## 1. Kiến trúc tham chiếu hiện tại

```
src/
├── demo/
│   ├── LibraryShowcaseDemo.tsx    ← main shell, data fetching, drawing integration
│   ├── demoData.ts                ← Binance fetch, offline fallback, mergeBarsByDate
│   ├── i18n.tsx                   ← VI/EN dictionary, provider, hook
│   └── PaneSettingsModal.tsx      ← indicator settings, pane config
├── lib/
│   ├── indicators/
│   │   ├── builtin/               ← ema.ts, rsi.ts, macd.ts, bollinger.ts, sma.ts, cvd.ts, volume.ts
│   │   ├── registry.ts            ← registerIndicator(), getIndicator(), listIndicators()
│   │   ├── utils.ts               ← emaSeries, rsiSeries, macdSeries, bollingerSeries, ...
│   │   └── types.ts               ← RegisteredIndicator, IndicatorRegistry
│   ├── drawing/
│   │   ├── builtin/               ← 21 drawing tools
│   │   ├── clipboard.ts           ← DrawingPlacement, cloneDrawingSnapshot, offsetDrawingByPixels
│   │   ├── DrawingLayer.tsx       ← pane-aware render/hit-test
│   │   └── types.ts               ← DrawingObject, DrawingToolType
│   └── core/
│       ├── calculators/
│       │   └── enrichData.ts      ← orchestrator: gọi compute từ plugins
│       ├── registry/
│       │   ├── SeriesRegistry.ts  ← registerSeries(), getSeries(), RegistryEntry
│       │   └── registerAll.ts     ← gọi registerPhaseOneSeries()
│       └── types/
│           └── pane-descriptor.ts ← SeriesTypeId, SeriesConfig, PaneDescriptor
```

---

## 2. Pattern thêm indicator mới (PHẢI tuân thủ cho CE15+CE16)

### Bước 1 — Tạo plugin file trong `src/lib/indicators/builtin/`

```typescript
// src/lib/indicators/builtin/cci.ts
import type { IndicatorDefinition } from "../../types/indicator";
import type { OHLCVBar } from "../../types/ohlcv";
import { numericExtent } from "../utils";

export interface CCIValue {
  cci: number[];
}

const CCI: IndicatorDefinition<OHLCVBar, CCIValue, readonly [number?]> = {
  name: "CCI",
  compute: (bars, period = 20) => ({
    cci: cciSeries(bars, period),
  }),
  computeExtents: (values) => numericExtent(values.cci),
  yAxis: "right",
  render: () => undefined,
};

export default CCI;
```

### Bước 2 — Thêm compute function vào `src/lib/indicators/utils.ts`

```typescript
export function cciSeries(bars: readonly OHLCVBar[], period: number): number[] {
  // typical price = (high + low + close) / 3
  // CCI = (typical - SMA(typical)) / (0.015 * mean absolute deviation)
  ...
}
```

### Bước 3 — Đăng ký trong `src/lib/indicators/index.ts`

```typescript
import CCI from "./builtin/cci";
registerIndicator(CCI);
```

### Bước 4 — Thêm output key vào `EnrichedDatum` trong `src/lib/core/calculators/types.ts`

```typescript
export interface EnrichedDatum extends RawOHLCV {
  // ... existing fields ...
  cci?: number;       // CE16-02
}
```

### Bước 5 — Thêm compute call trong `enrichData.ts`

Không viết thêm vào thân hàm chính. Thêm một plugin entry vào mảng orchestrator:

```typescript
// Thêm vào plugin list, KHÔNG thêm inline
{ key: "CCI", compute: computeCCI, accessor: (d) => d.cci }
```

### Bước 6 — Đăng ký `RegistryEntry` trong `SeriesRegistry.ts`

```typescript
registerLineSeries("CCI", {
  component: LineSeries,
  defaultParams: { period: 20 },
  yExtentsAccessors: [(d) => d.cci],
  settingsFields: [
    { key: "period", labelKey: "settings.period", type: "number", defaultValue: 20, min: 5, step: 1 },
  ],
  tooltipEntry: (config) => ({
    label: `CCI(${periodFromConfig(config, 20)})`,
    format: format(".1f"),
    accessor: (d) => d.cci,
  }),
});
```

### Bước 7 — Thêm i18n keys vào `src/demo/i18n.tsx`

```typescript
// Thêm vào dictionary vi + en
"indicator.cci": "CCI",
"indicator.cci.description": "Commodity Channel Index",
```

### Bước 8 — Thêm SeriesTypeId mới vào `pane-descriptor.ts`

```typescript
export type SeriesTypeId =
  | "Candlestick" | "HollowCandle" | "OHLC" | "HeikinAshi" | "Line" | "Area" | "Bar"
  | "Volume" | "EMA" | "SMA" | "RSI" | "MACD" | "BollingerBand" | "CVDApprox" | "CVDRealtime"
  | "Whale" | "ElderRay" | "StrengthElder" | "StrengthRelative"
  // Thêm mới:
  | "MA" | "BBI" | "SAR" | "OBV" | "WR" | "VR"             // CE15
  | "KDJ" | "CCI" | "DMI" | "BIAS" | "BRAR" | "MTM"        // CE16
  | "EMV" | "AO" | "ROC" | "TRIX" | "DMA" | "PVT" | "PSY" | "CR"; // CE16
```

---

## 3. Candle Type Switcher (CE17)

### Hiện trạng
`SeriesRegistry.ts` ĐÃ register: `Candlestick`, `HollowCandle`, `OHLC`, `HeikinAshi`, `Area`, `Line`.

### Còn thiếu
1. **UI switcher** trong toolbar (nút "Candlestick" hiện tại phải mở dropdown với 6 lựa chọn).
2. **HeikinAshi data transform**: khi user chọn HeikinAshi, cần transform lại OHLCV data trước khi render:
   ```
   HA_Close = (O + H + L + C) / 4
   HA_Open  = (prev_HA_Open + prev_HA_Close) / 2
   HA_High  = max(H, HA_Open, HA_Close)
   HA_Low   = min(L, HA_Open, HA_Close)
   ```
3. **State** `candleType: SeriesTypeId` trong `LibraryShowcaseDemo.tsx`, persisted vào localStorage.
4. **i18n keys** cho tên candle types.

### Architecture cho HeikinAshi
- Không transform trong `enrichData.ts` (đó là SSOT cho raw data).
- Transform tại `LibraryShowcaseDemo.tsx` khi build `chartData` prop truyền vào `DynamicChart`.
- Hoặc thêm `transformedData` computed memo: `useMemo(() => transformHeikinAshi(data), [data, candleType])`.

---

## 4. Style Override API (CE18)

### Target interface
```typescript
// src/lib/core/registry/SeriesRegistry.ts
export function overrideSeriesStyle(
  type: SeriesTypeId,
  instanceId: string,
  partialStyle: Partial<SeriesStyleOverride>
): void;

export interface SeriesStyleOverride {
  color?: string;
  lineWidth?: number;
  visible?: boolean;
  opacity?: number;
}
```

### Scope
- Override per-instance (theo `SeriesConfig.id` hoặc theo `type+params` key).
- Override được persist vào localStorage như các cài đặt khác.
- `DrawingInspector` dùng API này để cập nhật màu drawing thay vì mutate trực tiếp.

---

## 5. Drawing Overlay API (CE19)

### Target interface
```typescript
// src/lib/drawing/registry.ts (mở rộng)
export function registerDrawingTool(definition: DrawingToolDefinition): void;
export function getDrawingTool(type: string): DrawingToolDefinition | undefined;
export function listDrawingTools(): readonly DrawingToolDefinition[];
```

### GroupId concept
```typescript
// Thêm vào DrawingObject (types.ts đã có sẵn chỗ)
export interface DrawingObject {
  // ... existing ...
  groupId?: string;  // CE19-02: group management
}
```

### Magnet sensitivity
```typescript
export type MagnetSensitivity = "weak" | "normal" | "strong";
// weak: tolerance = 5px, normal: 10px, strong: 20px
```

---

## 6. Data Adapter (CE20)

### Interface target
```typescript
// src/lib/adapters/DataAdapter.ts
export interface KLineBar {
  timestamp: number;  // milliseconds
  open: number; high: number; low: number; close: number;
  volume: number;
}

export type GetBarsType = "init" | "forward" | "backward";

export interface DataAdapter {
  getBars(params: {
    type: GetBarsType;
    symbol: string;
    interval: string;
    timestamp: number | null;
    limit: number;
  }): Promise<{ bars: KLineBar[]; hasMore: boolean }>;

  subscribeBar?(params: {
    symbol: string;
    interval: string;
    callback: (bar: KLineBar) => void;
  }): () => void;  // returns unsubscribe function
}
```

### Migration path
1. `BinanceAdapter` implements `DataAdapter` (wraps current `fetchHistoricalDemoBars`).
2. `LibraryShowcaseDemo` nhận `adapter?: DataAdapter` prop, fallback về `BinanceAdapter`.
3. `LocalCacheAdapter` dùng offline CSV data cho demo offline.
4. **Không xóa `demoData.ts`** cho đến khi adapter hoàn toàn ổn định.

---

## 7. Mobile/Touch (CE21)

### Pointer Events API (không cần dependency)
```typescript
// Trong EventCapture.tsx hoặc wrapper mới
// Pan: pointerdown → pointermove → pointerup với 1 pointer
// Pinch zoom: pointerdown với 2 pointers đồng thời
// tap: pointerdown + pointerup < 200ms, không move > 5px
```

### Responsive toolbar
- Dưới 768px: toolbar collapse thành bottom sheet hoặc floating button.
- Không thêm breakpoint CSS toàn cục; dùng container query hoặc inline style có điều kiện.

---

## 8. Thứ bậc hiệu lực cho package này

1. `docs/project-delivery/PROJECT_GOVERNANCE.md`
2. `docs/planning/INDICATOR_SSOT_POLICY.md`
3. `docs/upgrade-standard/vnstockchart-upgrade/TECH_SPEC.md` *(file này)*
4. `docs/upgrade-standard/vnstockchart-upgrade/IMPLEMENTATION_PLAN.md`
5. `docs/upgrade-standard/vnstockchart-upgrade/TASKBOARD.md`
6. `docs/upgrade-standard/vnstockchart-upgrade/CE1X_BRIEF.md` (từng sprint)
7. `docs/upgrade-standard/AUDIT_LEDGER.md`
