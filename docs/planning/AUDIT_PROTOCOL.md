# Dynamic Pane System — Giao thức tự-audit & kiểm thử

> Phiên bản: 1.0 · Branch: `dev`  
> Mục tiêu: Mỗi developer hoàn thành slice phải tự điền checklist trước khi merge.

---

## Quy trình audit cho mỗi slice

```
1. npx tsc --noEmit                   → PASS required
2. Chạy unit tests liên quan          → PASS required
3. Khởi động dev server, mở browser
4. Thực hiện manual test scenarios    → Screenshot evidence
5. Điền bảng evidence bên dưới
6. git commit với message đúng format
```

---

## Công cụ test

- **TypeScript typecheck:** `npx tsc --noEmit`
- **Unit tests:** `npm test` (nếu có Jest/Vitest setup) — hoặc run test file trực tiếp
- **Dev server:** `npm run watch` → `http://localhost:8080/`
- **Screenshot:** Windows Snip & Sketch (Win+Shift+S), lưu vào `docs/planning/evidence/`

---

## PHASE 1 — Audit Checklist

---

### SLICE S1.1 — Types & Data Model

#### TypeScript Check
```bash
npx tsc --noEmit
# Expected: 0 errors
```

#### Unit Tests

**File:** `src/lib/core/types/__tests__/pane-descriptor.test.ts`

```typescript
describe("DEFAULT_PANES", () => {
  it("sum of visible heightRatio = 1.0", () => {
    const visible = DEFAULT_PANES.filter(p => p.visible);
    const sum = visible.reduce((acc, p) => acc + p.heightRatio, 0);
    expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
  });

  it("first pane is pinned", () => {
    expect(DEFAULT_PANES[0].pinned).toBe(true);
  });

  it("all panes have unique id", () => {
    const ids = DEFAULT_PANES.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("DEFAULT_PANES has 3 panes all visible", () => {
    expect(DEFAULT_PANES.length).toBe(3);
    expect(DEFAULT_PANES.every(p => p.visible)).toBe(true);
  });
});

describe("PANE_LAYOUT_STORAGE_KEY", () => {
  it("equals rsc-pane-layout-v1", () => {
    expect(PANE_LAYOUT_STORAGE_KEY).toBe("rsc-pane-layout-v1");
  });
});
```

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| Unit tests pass | ☐ PASS / ☐ FAIL | |

---

### SLICE S1.2 — SeriesRegistry

#### Unit Tests

**File:** `src/lib/core/registry/__tests__/SeriesRegistry.test.ts`

```typescript
describe("SeriesRegistry", () => {
  beforeEach(() => {
    initRegistry(); // register all series
  });

  it("getSeries('Candlestick') trả về entry hợp lệ", () => {
    const entry = getSeries("Candlestick");
    expect(entry.component).toBeDefined();
    expect(typeof entry.tooltipEntry).toBe("function");
  });

  it("getSeries với type không tồn tại throw Error", () => {
    expect(() => getSeries("NonExistent" as any)).toThrow(/unknown type/i);
  });

  it("listRegistered() chứa tất cả Phase 1 types", () => {
    const registered = listRegistered();
    const phase1Types: SeriesTypeId[] = [
      "Candlestick", "Volume", "EMA", "BollingerBand",
      "RSI", "MACD", "CVDApprox", "StrengthElder", "Whale"
    ];
    phase1Types.forEach(t => {
      expect(registered).toContain(t);
    });
  });

  it("mọi entry có yExtentsAccessors là array không rỗng", () => {
    listRegistered().forEach(type => {
      const entry = getSeries(type);
      expect(Array.isArray(entry.yExtentsAccessors)).toBe(true);
      expect(entry.yExtentsAccessors.length).toBeGreaterThan(0);
    });
  });
});
```

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| Unit tests pass | ☐ PASS / ☐ FAIL | |

---

### SLICE S1.3 — DataEnricher

#### Unit Tests

**File:** `src/lib/core/calculators/__tests__/enrichData.test.ts`

```typescript
// Fixture: 300 OHLCV bars với giá trị hợp lý
import { mockOHLCV300 } from "../fixtures/mockData";

describe("enrichData", () => {
  let enriched: EnrichedDatum[];
  
  beforeAll(() => {
    enriched = enrichData(mockOHLCV300);
  });

  it("trả về cùng số lượng phần tử", () => {
    expect(enriched.length).toBe(mockOHLCV300.length);
  });

  it("ema20 undefined ở 19 bars đầu, defined sau đó", () => {
    for (let i = 0; i < 19; i++) expect(enriched[i].ema20).toBeUndefined();
    expect(enriched[19].ema20).toBeDefined();
  });

  it("cvdApprox là cumulative (không bao giờ reset)", () => {
    // cvdApprox phải là running sum, không phải per-bar delta
    const deltas = enriched.map(d => d.cvdDelta ?? 0);
    let cumulative = 0;
    enriched.forEach((d, i) => {
      cumulative += deltas[i];
      if (d.cvdApprox !== undefined) {
        expect(Math.abs(d.cvdApprox - cumulative)).toBeLessThan(0.01);
      }
    });
  });

  it("bullPower = high - ema13 (sau 13 bars)", () => {
    // Kiểm tra ít nhất 5 bars sau bar 13
    for (let i = 13; i < 18; i++) {
      if (enriched[i].bullPower !== undefined && enriched[i].ema20 !== undefined) {
        // bullPower phải có magnitude hợp lý (không quá lớn so với spread)
        const spread = enriched[i].high - enriched[i].low;
        expect(Math.abs(enriched[i].bullPower!)).toBeLessThan(spread * 10);
      }
    }
  });

  it("whaleBuyVol >= 0 (không âm)", () => {
    enriched.forEach(d => {
      if (d.whaleBuyVol !== undefined) expect(d.whaleBuyVol).toBeGreaterThanOrEqual(0);
      if (d.whaleSellVol !== undefined) expect(d.whaleSellVol).toBeGreaterThanOrEqual(0);
    });
  });

  it("performance: 1000 bars dưới 50ms", () => {
    const bigData = Array(1000).fill(null).map((_, i) => ({
      date: new Date(2020, 0, i + 1),
      open: 100, high: 105, low: 98, close: 103, volume: 10000
    }));
    const start = performance.now();
    enrichData(bigData);
    expect(performance.now() - start).toBeLessThan(50);
  });
});

describe("calcCVDApprox edge case", () => {
  it("High === Low → buyVol = volume / 2", () => {
    const singleBar = [{ date: new Date(), open: 100, high: 100, low: 100, close: 100, volume: 1000 }];
    const result = enrichData(singleBar);
    expect(result[0].cvdDelta).toBeCloseTo(0, 2); // buyVol = sellVol = 500
  });
});
```

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| Unit tests pass | ☐ PASS / ☐ FAIL | |
| Performance 1000 bars | ☐ < 50ms / ☐ FAIL | |

---

### SLICE S1.4 — useDynamicPanes

#### Unit Tests

**File:** `src/lib/core/hooks/__tests__/useDynamicPanes.test.ts`

Dùng `@testing-library/react-hooks` hoặc `renderHook` từ `@testing-library/react`.

```typescript
describe("useDynamicPanes — initialization", () => {
  it("khởi tạo với DEFAULT_PANES khi localStorage trống", () => {
    localStorage.clear();
    const { result } = renderHook(() => useDynamicPanes(600));
    expect(result.current.panes.length).toBe(3);
    expect(result.current.visiblePanes.length).toBe(3);
  });

  it("khởi tạo từ localStorage nếu có dữ liệu hợp lệ", () => {
    const stored: StoredLayout = {
      version: 1,
      panes: [
        { ...DEFAULT_PANES[0], heightRatio: 0.7 },
        { ...DEFAULT_PANES[1], visible: false, heightRatio: 0.3 },
        DEFAULT_PANES[2],
      ]
    };
    localStorage.setItem(PANE_LAYOUT_STORAGE_KEY, JSON.stringify(stored));
    const { result } = renderHook(() => useDynamicPanes(600));
    expect(result.current.visiblePanes.length).toBe(2);
    localStorage.clear();
  });

  it("bỏ qua localStorage corrupt → dùng DEFAULT_PANES", () => {
    localStorage.setItem(PANE_LAYOUT_STORAGE_KEY, "{{invalid json}}");
    const { result } = renderHook(() => useDynamicPanes(600));
    expect(result.current.panes.length).toBe(3);
    localStorage.clear();
  });
});

describe("useDynamicPanes — toggleVisible", () => {
  it("ẩn pane non-pinned → visiblePanes giảm 1", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.toggleVisible("momentum"));
    expect(result.current.visiblePanes.length).toBe(2);
  });

  it("không thể ẩn pinned pane (Price)", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.toggleVisible("price"));
    expect(result.current.visiblePanes.length).toBe(3); // không thay đổi
  });

  it("không thể ẩn pane cuối cùng visible (non-pinned)", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.toggleVisible("volume"));
    act(() => result.current.toggleVisible("momentum"));
    // Chỉ còn Price visible — thử ẩn thêm sẽ không thay đổi
    expect(result.current.visiblePanes.length).toBe(1);
    // Cố ẩn Price
    act(() => result.current.toggleVisible("price"));
    expect(result.current.visiblePanes.length).toBe(1);
  });

  it("normalize heightRatio sau toggleVisible (sum = 1)", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.toggleVisible("momentum"));
    const sum = result.current.visiblePanes.reduce((a, p) => a + p.heightRatio, 0);
    expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
  });
});

describe("useDynamicPanes — addPane / removePane", () => {
  it("addPane khi đã có 3 visible → không thay đổi", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.addPane({
      label: "Test", pinned: false, visible: true,
      heightRatio: 0.2, series: [], splitScale: false, tooltip: "none"
    }));
    expect(result.current.visiblePanes.length).toBe(3); // vẫn 3
  });

  it("addPane khi chỉ có 2 visible → thêm thành công", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.toggleVisible("momentum")); // ẩn 1 → còn 2 visible
    act(() => result.current.addPane({
      label: "CVD", pinned: false, visible: true,
      heightRatio: 0.2, series: [{ type: "CVDApprox", yAxis: "right" }],
      splitScale: false, tooltip: "value"
    }));
    expect(result.current.visiblePanes.length).toBe(3);
  });

  it("removePane pinned (Price) → không thay đổi", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.removePane("price"));
    expect(result.current.panes.length).toBe(3); // không thay đổi
  });

  it("removePane non-pinned → xóa khỏi panes", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.removePane("volume"));
    expect(result.current.panes.find(p => p.id === "volume")).toBeUndefined();
  });
});

describe("useDynamicPanes — resetToDefault", () => {
  it("reset → panes = DEFAULT_PANES, localStorage cleared", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.toggleVisible("momentum"));
    act(() => result.current.resetToDefault());
    expect(result.current.visiblePanes.length).toBe(3);
    expect(localStorage.getItem(PANE_LAYOUT_STORAGE_KEY)).toBeNull();
  });
});

describe("useDynamicPanes — canAddPane", () => {
  it("3 visible → canAddPane = false", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    expect(result.current.canAddPane).toBe(false);
  });

  it("2 visible → canAddPane = true", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.toggleVisible("momentum"));
    expect(result.current.canAddPane).toBe(true);
  });
});
```

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| 16 unit tests pass | ☐ PASS / ☐ FAIL | |

---

### SLICE S1.5 — DynamicChart

#### Manual Test Scenarios (Browser)

| # | Kịch bản | Expected | Screenshot |
|---|---------|----------|------------|
| 1.5.1 | Load trang lần đầu | 3 pane hiển thị giống layout cũ (Price/Volume/Momentum) | evidence/s1.5-01-default.png |
| 1.5.2 | Kiểm tra Price pane | Candlestick + EMA20 + EMA50 + Bollinger | evidence/s1.5-02-price.png |
| 1.5.3 | Kiểm tra Volume pane | Volume bars, màu xanh/đỏ theo close>open | evidence/s1.5-03-volume.png |
| 1.5.4 | Kiểm tra Momentum pane | RSI line (trục trái) + MACD histogram (trục phải) | evidence/s1.5-04-momentum.png |
| 1.5.5 | Crosshair | Hover → crosshair xuất hiện trên tất cả 3 pane đồng bộ | evidence/s1.5-05-crosshair.png |
| 1.5.6 | Scroll/zoom | Pinch/wheel zoom hoạt động, tất cả pane zoom đồng bộ | evidence/s1.5-06-zoom.png |

#### Regression — So sánh với layout hardcode cũ

```
BEFORE (hardcode): Commit hash trước S1.8 integration _______
AFTER (DynamicChart): Commit hash sau S1.8 __________________

Visual diff: Không có sự khác biệt nhìn thấy được.
Nếu có diff → documenting tại: evidence/s1.5-regression-diff.png
```

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| Scenario 1.5.1-1.5.6 | ☐ ALL PASS / ☐ FAIL: ___ | |
| Crosshair đồng bộ | ☐ PASS / ☐ FAIL | |
| Visual regression | ☐ IDENTICAL / ☐ DIFF (documented) | |

---

### SLICE S1.7 — PaneHeader (Hover Overlay)

#### Manual Test Scenarios

| # | Kịch bản | Expected | Screenshot |
|---|---------|----------|------------|
| 1.7.1 | Load trang, không hover | Header ẩn hoàn toàn (opacity 0, không chiếm space) | evidence/s1.7-01-hidden.png |
| 1.7.2 | Hover vào Price pane | Header hiện: "Price", 👁 disabled, × hidden | evidence/s1.7-02-price-header.png |
| 1.7.3 | Hover vào Volume pane | Header hiện: "Volume", 👁 active, × visible | evidence/s1.7-03-volume-header.png |
| 1.7.4 | Hover vào Momentum pane | Header hiện: "RSI+MACD", 👁 active, × visible | evidence/s1.7-04-momentum-header.png |
| 1.7.5 | Dark theme: hover Volume | Header background = dark surface, text trắng | evidence/s1.7-05-dark-header.png |
| 1.7.6 | Hover ra ngoài pane | Header fade out (opacity → 0, transition 150ms) | evidence/s1.7-06-fadeout.gif (optional) |

#### CSS Rule Verification

Mở DevTools → Inspect `.rsc-pane-header`:
```
opacity: 0                     ← khi không hover
pointer-events: none           ← khi không hover
position: absolute             ← không chiếm height
```

```
opacity: 1                     ← khi .rsc-pane-wrap:hover
pointer-events: auto           ← khi .rsc-pane-wrap:hover
```

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| Scenarios 1.7.1-1.7.6 | ☐ ALL PASS / ☐ FAIL: ___ | |
| Header không chiếm canvas height | ☐ CONFIRMED / ☐ FAIL | |

---

### SLICE S1.8 — Integration

#### Manual Test Scenarios (End-to-End Phase 1)

| # | Kịch bản | Expected | Screenshot |
|---|---------|----------|------------|
| 1.8.1 | Load → hover → click 👁 Momentum | Momentum ẩn, Price+Volume chiếm toàn bộ height | evidence/s1.8-01-hide-momentum.png |
| 1.8.2 | Sau đó click 👁 Momentum lại | Momentum hiện, heights normalize lại | evidence/s1.8-02-restore-momentum.png |
| 1.8.3 | Click × Volume | Volume xóa, Price+Momentum resize | evidence/s1.8-03-remove-volume.png |
| 1.8.4 | Splitter resize sau khi ẩn pane | Kéo splitter giữa Price và Volume, resize OK | evidence/s1.8-04-splitter-after-hide.png |
| 1.8.5 | Reload trang | Layout restore từ localStorage (momentum vẫn hidden) | evidence/s1.8-05-localstorage-restore.png |
| 1.8.6 | Theme toggle → Dark | Tất cả pane chuyển sang dark, không mất pane state | evidence/s1.8-06-dark-theme.png |
| 1.8.7 | Theme toggle → Light | Chuyển về light, pane state giữ nguyên | evidence/s1.8-07-light-theme.png |

#### localStorage Verification

```javascript
// Mở Console, chạy:
JSON.parse(localStorage.getItem("rsc-pane-layout-v1"))
// Expected: Object với version: 1, panes: [...]
// Confirm: panes[0].pinned === true
// Confirm: tất cả visible panes sum heightRatio ≈ 1.0
```

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| Scenarios 1.8.1-1.8.7 | ☐ ALL PASS / ☐ FAIL: ___ | |
| localStorage schema valid | ☐ CONFIRMED | |

---

## PHASE 2 — Audit Checklist

### SLICE S2.1 — SeriesPicker

| # | Kịch bản | Expected |
|---|---------|----------|
| 2.1.1 | Click `+` trên Volume header | Dropdown mở ngay dưới nút |
| 2.1.2 | EMA trong picker (đang có trên Price pane) | Hiện checkmark nếu là pane đang mở |
| 2.1.3 | Click Whale trong picker | Whale series thêm vào pane, render histogram |
| 2.1.4 | Click EMA lần 2 (remove) | EMA xóa khỏi pane |
| 2.1.5 | Nhấn Escape | Picker đóng |
| 2.1.6 | focus-within giữ header visible | Header không fade khi picker open |

### SLICE S2.2 — Add Pane Menu

| # | Kịch bản | Expected |
|---|---------|----------|
| 2.2.1 | 3 visible pane, click `+` topbar | Menu mở, "Thêm mới" items disabled |
| 2.2.2 | Ẩn Volume, click `+` topbar | "Thêm Volume" disabled, "Hiện lại: Volume" enabled |
| 2.2.3 | Click "Hiện lại: Volume" | Volume restore, heights normalize |
| 2.2.4 | Click "CVD" | Pane CVD mới với CVDApprox series xuất hiện |

### SLICE S2.3 — Reset to Default

| # | Kịch bản | Expected |
|---|---------|----------|
| 2.3.1 | Click "↺ Mặc định" → confirm | Layout reset về 3 pane mặc định |
| 2.3.2 | Sau reset, reload trang | Vẫn DEFAULT_PANES (localStorage cleared) |

---

## PHASE 3 — Audit Checklist

### SLICE S3.1 — Drag Reorder

| # | Kịch bản | Expected |
|---|---------|----------|
| 3.1.1 | Drag Momentum lên trên Volume | Thứ tự đổi: Price → Momentum → Volume |
| 3.1.2 | Cố drag Price pane | Cursor không đổi, không có drag behavior |
| 3.1.3 | Cố drop vào vị trí 0 | Không thay đổi thứ tự |
| 3.1.4 | Heights sau reorder | Mỗi pane giữ nguyên height của nó |
| 3.1.5 | localStorage sau reorder | Thứ tự mới được persist |

---

## PHASE 4 — Audit Checklist

### SLICE S4.1 — WebSocket

| # | Kịch bản | Expected |
|---|---------|----------|
| 4.1.1 | Connect với BTCUSDT | Console: "WS connected", events flow vào |
| 4.1.2 | Tắt network tạm → bật lại | Auto-reconnect sau backoff |
| 4.1.3 | Đổi symbol | Disconnect + reconnect với symbol mới |

### SLICE S4.2 — CVD Real-time

| # | Kịch bản | Expected |
|---|---------|----------|
| 4.2.1 | CVD pane visible với WS connected | CVD line cập nhật real-time |
| 4.2.2 | Đổi timeframe 1m → 5m | CVD reset và tính lại theo timeframe mới |

### SLICE S4.3 — Whale Real-time

| # | Kịch bản | Expected |
|---|---------|----------|
| 4.3.1 | Trade > $50k USD xuất hiện | Whale marker hiển thị trên Price pane |
| 4.3.2 | Console log whale event | `{ side: "buy" | "sell", dollar: 51234, price: 35000 }` |

---

## Audit Ledger (Điền sau khi hoàn thành)

| Slice | Ngày | Dev | tsc | Unit Tests | Manual Tests | Commit SHA |
|-------|------|-----|-----|-----------|--------------|------------|
| S1.1  |      |     | ☐   | ☐         | N/A          |            |
| S1.2  |      |     | ☐   | ☐         | N/A          |            |
| S1.3  |      |     | ☐   | ☐         | N/A          |            |
| S1.4  |      |     | ☐   | ☐         | N/A          |            |
| S1.5  |      |     | ☐   | N/A       | ☐            |            |
| S1.6  |      |     | ☐   | N/A       | ☐            |            |
| S1.7  |      |     | ☐   | N/A       | ☐            |            |
| S1.8  |      |     | ☐   | N/A       | ☐            |            |
| S2.1  |      |     | ☐   | ☐         | ☐            |            |
| S2.2  |      |     | ☐   | N/A       | ☐            |            |
| S2.3  |      |     | ☐   | ☐         | ☐            |            |
| S2.4  |      |     | ☐   | N/A       | ☐            |            |
| S3.1  |      |     | ☐   | ☐         | ☐            |            |
| S4.1  |      |     | ☐   | ☐         | ☐            |            |
| S4.2  |      |     | ☐   | ☐         | ☐            |            |
| S4.3  |      |     | ☐   | ☐         | ☐            |            |
| S4.4  |      |     | ☐   | ☐         | ☐            |            |

---

## Definition of Done — Phase gates

### Phase 1 complete khi:
- [ ] Tất cả S1.x slices audit ledger đã điền
- [ ] `npx tsc --noEmit` pass trên toàn bộ codebase
- [ ] Không có visual regression so với layout hardcode cũ
- [ ] localStorage persist/restore hoạt động
- [ ] Splitter resize hoạt động sau DynamicChart refactor

### Phase 2 complete khi:
- [ ] Phase 1 complete
- [ ] Tất cả S2.x slices audit ledger đã điền
- [ ] SeriesPicker mở/đóng đúng, focus-within giữ header visible
- [ ] Add pane / restore hidden pane / reset default hoạt động

### Phase 3 complete khi:
- [ ] Phase 2 complete
- [ ] Drag reorder không phá vỡ Price pane position

### Phase 4 complete khi:
- [ ] Phase 3 complete (hoặc có thể song song với Phase 2+)
- [ ] WS connect/disconnect/reconnect hoạt động
- [ ] CVD real-time override CVD approx
- [ ] Whale marker hiển thị đúng

---

## Evidence folder structure

```
docs/planning/evidence/
  s1.5-01-default.png
  s1.5-02-price.png
  ...
  s1.7-01-hidden.png
  s1.7-02-price-header.png
  ...
  s1.8-01-hide-momentum.png
  ...
```

**Naming:** `s{slice}-{index:02d}-{description}.png`

---

## Câu hỏi thường gặp khi audit

**Q: TypeScript compile pass nhưng runtime crash?**
A: Check `yExtentsAccessors` — accessor trả về `undefined` cho datum đầu tiên có thể crash react-stockcharts. Dùng `d => d.ema20 ?? 0` pattern.

**Q: Canvas không cập nhật sau khi toggle pane?**
A: Kiểm tra `ChartCanvas key` có include `visiblePanes.map(p=>p.id).join("-")` không. Nếu key không thay đổi → canvas không remount → không repaint.

**Q: Splitter không hoạt động sau khi thêm pane?**
A: `applyDelta(splitterIndex, deltaY)` phải được gọi trên `useDynamicPanes` không phải `usePaneSizes` cũ. Đảm bảo `ChartSplitter.onCommitDelta` được bind vào `useDynamicPanes.applyDelta`.

**Q: PaneHeader hiện luôn (không chỉ khi hover)?**
A: Check CSS `pointer-events: none` khi opacity = 0. Nếu pane có `overflow: visible` thì hover vùng ngoài pane vẫn trigger `:hover`. Fix: `overflow: hidden` trên `.rsc-pane-wrap`.
