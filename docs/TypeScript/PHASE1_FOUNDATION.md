# Phase 1 — Library Foundation

> **Thuộc:** [ROADMAP.md](./ROADMAP.md)  
> **Ước tính:** 2–3 tuần  
> **Mục tiêu:** Đóng gói thành thư viện npm, setup build pipeline, public API ổn định

---

## 1.1 Package Setup

### `package.json` exports (dual CJS + ESM)
```json
{
  "name": "@myorg/stock-charts",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "d3": "^7.0.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.0.0",
    "@storybook/react": "^8.0.0"
  }
}
```

### `tsup.config.ts` — build tool
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,                    // generate .d.ts
    splitting: true,              // code splitting cho tree-shaking
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'd3'],
    treeshake: true,
});
```

---

## 1.2 TypeScript Strict Mode

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist"
  }
}
```

**Mục tiêu:** Toàn bộ `src/` không dùng `any`. Dùng `unknown` + type guard ở boundaries.

---

## 1.3 Public API Design

### `src/index.ts` — những gì người dùng import
```typescript
// Components
export { ChartCanvas } from './lib/components/ChartCanvas';
export { CandlestickSeries } from './lib/components/CandlestickSeries';
export { LineSeries } from './lib/components/LineSeries';
export { VolumeSeries } from './lib/components/VolumeSeries';
export { XAxis, YAxis } from './lib/components/Axes';

// Panels
export { MultiPanelLayout } from './lib/layout/MultiPanelLayout';

// Adapters
export type { StockDataAdapter } from './lib/adapters/StockDataAdapter';
export { createRestAdapter } from './lib/adapters/RestAdapter';

// Types
export type { OHLCVBar, OrderbookSnapshot, Trade } from './lib/types';

// Hooks
export { useIndicator } from './lib/hooks/useIndicator';
export { useChartData } from './lib/hooks/useChartData';

// Indicators (pure functions — tree-shakeable)
export * from './lib/indicators';
```

**Quy tắc:** Không re-export barrel vòng. Mỗi module import trực tiếp từ nguồn.

---

## 1.4 Testing Setup

### Vitest — test indicators (pure functions)
```typescript
// src/lib/indicators/__tests__/ema.test.ts
import { describe, it, expect } from 'vitest';
import { ema } from '../moving-averages/ema';

describe('ema()', () => {
    it('tính đúng EMA 3 kỳ', () => {
        const closes = [10, 11, 12, 13, 14];
        const result = ema(closes, 3);
        expect(result[2]).toBeCloseTo(11.0);
        expect(result[4]).toBeCloseTo(12.75);
    });

    it('trả về NaN cho các giá trị đầu chưa đủ kỳ', () => {
        const result = ema([10, 11, 12], 5);
        expect(result.slice(0, 4).every(isNaN)).toBe(true);
    });
});
```

---

## 1.5 Storybook 8

Thay thế `docs/` demo hiện tại bằng Storybook interactive stories:

```
src/
└── stories/
    ├── CandlestickChart.stories.tsx
    ├── VolumeProfile.stories.tsx
    ├── Orderbook.stories.tsx
    └── WhaleAlerts.stories.tsx
```

Mỗi story dùng **mock data** để không cần backend:
```typescript
// stories/CandlestickChart.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CandlestickChart } from '../lib/components';
import { generateOHLCV } from '../lib/utils/mockData';

const meta: Meta<typeof CandlestickChart> = { component: CandlestickChart };
export default meta;

export const Default: StoryObj = {
    args: { data: generateOHLCV(200), width: 800, height: 500 }
};
```

---

## 1.6 Checklist hoàn thành Phase 1

- [ ] `tsup` build thành công, output `dist/index.js` + `dist/index.d.ts`
- [ ] `peerDependencies` đúng (react, d3 không bundle sẵn)
- [ ] `strict: true` — 0 lỗi TypeScript
- [ ] Public API export ổn định (không phá vỡ giữa minor versions)
- [ ] Vitest chạy được: `npm test`
- [ ] Storybook khởi động: `npm run storybook`
- [ ] README hướng dẫn install + ví dụ cơ bản
- [ ] `npm pack` → kiểm tra bundle size < 150KB (gzip)
