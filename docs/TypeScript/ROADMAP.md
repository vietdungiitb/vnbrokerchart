# Lộ trình xây dựng thư viện React/TypeScript

> **Mục tiêu:** Đóng gói `react-stockcharts-master` thành thư viện npm thuần TypeScript,  
> tích hợp được vào bất kỳ dự án nào — đặc biệt là backend Django + vnstock.
>
> **Điểm vào triển khai chi tiết:** xem [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).
> **Quy định bắt buộc trước khi coding:** xem [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md).
> **Bộ tài liệu bàn giao cho đội code:** xem [HANDOFF_MANIFEST.md](./HANDOFF_MANIFEST.md).
> **Nếu hệ thống phải chịu tải lớn:** xem thêm mục công nghệ quy mô lớn trong [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

---

## Nguyên tắc thiết kế

### Data Adapter Pattern
Tách hoàn toàn rendering logic khỏi data source. Backend chỉ cần trả JSON đúng interface.

```
Backend (Django/vnstock)              Library (TypeScript)
────────────────────────              ────────────────────
REST /api/bars/{symbol}    ──────→   DataAdapter interface
WebSocket /ws/orderbook    ──────→          ↓
                                    <StockChart data={...} />
                                    <OrderbookPanel data={...} />
                                    <WhaleAlerts stream={...} />
```

### Core interface — `OHLCVBar`
```typescript
export interface OHLCVBar {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    // Mở rộng cho orderflow:
    buyVolume?: number;
    sellVolume?: number;
    openInterest?: number;
}
```

---

## Tổng quan các Phase

| Phase | Tên | Tuần | Phụ thuộc |
|-------|-----|------|-----------|
| [1](./PHASE1_FOUNDATION.md) | Library Foundation | 2–3 | — |
| [2](./PHASE2_CHART_TYPES.md) | Chart Types | 3–4 | Phase 1 |
| [3](./PHASE3_INDICATORS.md) | Indicators (pure TS) | 4–5 | Phase 1 |
| [4](./PHASE4_ORDERFLOW.md) | Orderflow Suite | 4–5 | Phase 2, 3 |
| [5](./PHASE5_DRAWING_TOOLS.md) | Drawing Tools | 3–4 | Phase 2 |
| [6–7](./PHASE6_7_LAYOUT_ADAPTER.md) | Multi-Panel Layout + Data Adapter | 2–3 | Phase 2, 3 |

**Thứ tự ưu tiên khởi đầu:**
Phase 1 → Phase 2 + 3 (song song) → Phase 4 (CVD/Orderflow — cốt lõi VN market) → Phase 5 → Phase 6–7.

**Build system khuyến nghị:** `tsup` cho thư viện publish; `webpack` chỉ nên giữ cho demo/preview cũ nếu cần.

---

## Cấu trúc thư viện sau khi hoàn thành

```
@myorg/stock-charts/
├── src/
│   ├── lib/
│   │   ├── components/       ← React components (chart, panel, overlay)
│   │   ├── indicators/       ← Pure TS functions (no React)
│   │   ├── adapters/         ← DataAdapter interface + helpers
│   │   ├── drawing/          ← Drawing tools state machine
│   │   ├── layout/           ← Multi-panel layout engine
│   │   └── types/            ← Public TypeScript types
│   └── index.ts              ← Public API exports
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Tích hợp vào dự án Django/vnstock

```typescript
// Implement adapter cho backend của bạn:
class DjangoVnstockAdapter implements StockDataAdapter {
    async fetchBars(symbol, timeframe, from, to) {
        const res = await fetch(
            `/api/bars/${symbol}?tf=${timeframe}&from=${from.toISOString()}&to=${to.toISOString()}`
        );
        return res.json(); // Django trả OHLCVBar[]
    }

    subscribeToBar(symbol, timeframe, cb) {
        const ws = new WebSocket(`/ws/bars/${symbol}/${timeframe}/`);
        ws.onmessage = (e) => cb(JSON.parse(e.data));
        return () => ws.close();
    }
}

// Dùng trong React app:
<ChartCanvas
    adapter={new DjangoVnstockAdapter()}
    symbol="VCB"
    timeframe="1D"
/>
```
