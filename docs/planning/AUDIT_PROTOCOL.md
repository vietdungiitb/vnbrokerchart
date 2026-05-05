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

#### Unit Tests

**File:** `src/lib/core/__tests__/SeriesPicker.test.tsx`

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { SeriesPicker } from "../SeriesPicker";
import { initRegistry } from "../registry/registerAll";

const mockPane = DEFAULT_PANES[0]; // Price pane with Candlestick+EMA+Bollinger

beforeAll(() => initRegistry());

describe("SeriesPicker", () => {
  it("hiển thị danh sách tất cả registered series", () => {
    render(<SeriesPicker pane={mockPane} onAddSeries={jest.fn()} onRemoveSeries={jest.fn()} anchorRef={{ current: null }} />);
    expect(screen.getByText(/CVDApprox/i)).toBeInTheDocument();
    expect(screen.getByText(/Whale/i)).toBeInTheDocument();
  });

  it("series đã có trong pane → hiện checkmark", () => {
    render(<SeriesPicker pane={mockPane} onAddSeries={jest.fn()} onRemoveSeries={jest.fn()} anchorRef={{ current: null }} />);
    const candlestickItem = screen.getByText(/Candlestick/i).closest("li");
    expect(candlestickItem).toHaveClass("rsc-series-item--active");  // hoặc aria-checked
  });

  it("click series chưa có → gọi onAddSeries với config đúng", () => {
    const onAdd = jest.fn();
    render(<SeriesPicker pane={mockPane} onAddSeries={onAdd} onRemoveSeries={jest.fn()} anchorRef={{ current: null }} />);
    fireEvent.click(screen.getByText(/Whale/i));
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ type: "Whale" }));
  });

  it("click series đã có → gọi onRemoveSeries", () => {
    const onRemove = jest.fn();
    render(<SeriesPicker pane={mockPane} onAddSeries={jest.fn()} onRemoveSeries={onRemove} anchorRef={{ current: null }} />);
    fireEvent.click(screen.getByText(/Candlestick/i));
    expect(onRemove).toHaveBeenCalledWith("Candlestick");
  });
});
```

#### Manual Test Scenarios

| # | Kịch bản | Expected | Screenshot |
|---|---------|----------|------------|
| 2.1.1 | Click `+` trên Volume header | Dropdown mở ngay dưới nút | evidence/s2.1-01-picker-open.png |
| 2.1.2 | EMA hiện trong picker với checkmark (Price pane đang chứa EMA) | Checkmark visual rõ ràng | evidence/s2.1-02-checkmark.png |
| 2.1.3 | Click Whale trong picker | Whale series thêm vào pane, render histogram | evidence/s2.1-03-add-whale.png |
| 2.1.4 | Click EMA lần 2 (remove) | EMA xóa khỏi pane | evidence/s2.1-04-remove-ema.png |
| 2.1.5 | Nhấn Escape | Picker đóng | evidence/s2.1-05-escape.png |
| 2.1.6 | focus-within giữ header visible | Header không fade khi picker open | evidence/s2.1-06-focus-within.png |

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| Unit tests pass | ☐ PASS / ☐ FAIL | |
| Scenarios 2.1.1-2.1.6 | ☐ ALL PASS / ☐ FAIL: ___ | |

---

### SLICE S2.2 — Add Pane Menu

#### Unit Tests (via useDynamicPanes integration)

Dùng lại `useDynamicPanes` tests, bổ sung:

```typescript
describe("AddPaneMenu — canAddPane logic", () => {
  it("3 visible → canAddPane = false, menu items disabled", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    expect(result.current.canAddPane).toBe(false);
  });

  it("ẩn 1 pane → canAddPane = true", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.toggleVisible("momentum"));
    expect(result.current.canAddPane).toBe(true);
  });

  it("restorePane khi canAddPane = false → không có effect", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    // Tất cả 3 visible → thêm hidden pane không thể
    act(() => result.current.addPane({
      label: "CVD", pinned: false, visible: true,
      heightRatio: 0.2, series: [], splitScale: false, tooltip: "value"
    }));
    expect(result.current.visiblePanes.length).toBe(3); // vẫn 3
  });
});
```

#### Manual Test Scenarios

| # | Kịch bản | Expected | Screenshot |
|---|---------|----------|------------|
| 2.2.1 | 3 visible pane, click `+` topbar | Menu mở, "Thêm mới" items disabled | evidence/s2.2-01-menu-full.png |
| 2.2.2 | Ẩn Volume, click `+` topbar | "Thêm Volume" disabled, "Hiện lại: Volume" enabled | evidence/s2.2-02-restore-available.png |
| 2.2.3 | Click "Hiện lại: Volume" | Volume restore, heights normalize (sum ≈ total) | evidence/s2.2-03-restored.png |
| 2.2.4 | Click "CVD" | Pane CVD mới với CVDApprox series xuất hiện | evidence/s2.2-04-add-cvd.png |
| 2.2.5 | Đóng menu bằng Escape hoặc click ngoài | Menu đóng | evidence/s2.2-05-dismiss.png |

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| Unit tests pass | ☐ PASS / ☐ FAIL | |
| Scenarios 2.2.1-2.2.5 | ☐ ALL PASS / ☐ FAIL: ___ | |

---

### SLICE S2.3 — Reset to Default

#### Unit Tests

```typescript
describe("resetToDefault", () => {
  it("sau reset → state = DEFAULT_PANES", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.toggleVisible("momentum"));
    act(() => result.current.removePane("volume"));
    act(() => result.current.resetToDefault());
    // Phải khớp DEFAULT_PANES
    expect(result.current.panes.length).toBe(DEFAULT_PANES.length);
    expect(result.current.visiblePanes.length).toBe(3);
  });

  it("sau reset → localStorage key bị xóa", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.toggleVisible("momentum"));
    act(() => result.current.resetToDefault());
    expect(localStorage.getItem(PANE_LAYOUT_STORAGE_KEY)).toBeNull();
  });

  it("reload sau reset → vẫn là DEFAULT_PANES (không restore cũ)", () => {
    // Simulate reload bằng cách unmount rồi remount hook
    const { result, unmount } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.toggleVisible("momentum"));
    act(() => result.current.resetToDefault());
    unmount();
    // Mount lại — localStorage đã cleared
    const { result: result2 } = renderHook(() => useDynamicPanes(600));
    expect(result2.current.visiblePanes.length).toBe(3);
  });
});
```

#### Manual Test Scenarios

| # | Kịch bản | Expected | Screenshot |
|---|---------|----------|------------|
| 2.3.1 | Click "↺ Mặc định" → confirm | Layout reset về 3 pane mặc định | evidence/s2.3-01-reset.png |
| 2.3.2 | Sau reset, reload trang | Vẫn DEFAULT_PANES (localStorage cleared) | evidence/s2.3-02-reload-after-reset.png |

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| Unit tests (3 cases) | ☐ PASS / ☐ FAIL | |
| Scenarios 2.3.1-2.3.2 | ☐ ALL PASS / ☐ FAIL | |

---

## PHASE 3 — Audit Checklist

### SLICE S3.1 — Drag Reorder

#### Unit Tests

**File:** `src/lib/core/hooks/__tests__/useDynamicPanes-reorder.test.ts`

```typescript
describe("useDynamicPanes — reorderPanes", () => {
  it("reorder non-pinned panes → thứ tự thay đổi", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    // Initial order: price[0], volume[1], momentum[2]
    act(() => result.current.reorderPanes(2, 1)); // momentum → vị trí 1
    const ids = result.current.visiblePanes.map(p => p.id);
    expect(ids[0]).toBe("price");     // pinned, luôn vị trí 0
    expect(ids[1]).toBe("momentum");  // sau reorder
    expect(ids[2]).toBe("volume");
  });

  it("reorder về vị trí 0 → bị reject (Price guard)", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    const initialIds = result.current.visiblePanes.map(p => p.id);
    act(() => result.current.reorderPanes(1, 0)); // volume → vị trí 0
    const afterIds = result.current.visiblePanes.map(p => p.id);
    expect(afterIds).toEqual(initialIds); // không thay đổi
  });

  it("reorder pane pinned → bị reject", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    const initialIds = result.current.visiblePanes.map(p => p.id);
    act(() => result.current.reorderPanes(0, 2)); // price → vị trí 2
    const afterIds = result.current.visiblePanes.map(p => p.id);
    expect(afterIds).toEqual(initialIds); // không thay đổi
  });

  it("heights giữ nguyên theo pane sau reorder", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    const heightsBefore = [...result.current.heights]; // [h0, h1, h2]
    act(() => result.current.reorderPanes(1, 2)); // volume ↔ momentum
    // Heights của pane[1] và pane[2] phải swap theo pane
    const [h0, h1, h2] = heightsBefore;
    expect(result.current.heights[0]).toBeCloseTo(h0);
    expect(result.current.heights[1]).toBeCloseTo(h2); // momentum height
    expect(result.current.heights[2]).toBeCloseTo(h1); // volume height
  });

  it("localStorage persist sau reorder", () => {
    const { result } = renderHook(() => useDynamicPanes(600));
    act(() => result.current.reorderPanes(2, 1));
    const stored = JSON.parse(localStorage.getItem(PANE_LAYOUT_STORAGE_KEY)!);
    expect(stored.panes[1].id).toBe("momentum");
    expect(stored.panes[2].id).toBe("volume");
    localStorage.clear();
  });
});
```

**Lưu ý:** `reorderPanes(fromIndex, toIndex)` phải được thêm vào `UseDynamicPanesResult` interface tại S3.1. Đây là action mới, không có ở Phase 1.

#### Manual Test Scenarios

| # | Kịch bản | Expected | Screenshot |
|---|---------|----------|------------|
| 3.1.1 | Drag Momentum lên trên Volume | Thứ tự đổi: Price → Momentum → Volume | evidence/s3.1-01-reorder.png |
| 3.1.2 | Cố drag Price pane (grab handle) | Handle ẩn hoặc cursor mặc định (không draggable) | evidence/s3.1-02-price-no-drag.png |
| 3.1.3 | Cố drop vào vị trí 0 (trên Price) | Không thay đổi thứ tự, ghost snap back | evidence/s3.1-03-drop-guard.png |
| 3.1.4 | Heights sau reorder | Mỗi pane giữ nguyên chiều cao tương đối của nó | evidence/s3.1-04-heights.png |
| 3.1.5 | localStorage sau reorder | Kiểm tra Console: `JSON.parse(localStorage.getItem("rsc-pane-layout-v1"))` → order mới | evidence/s3.1-05-localstorage.png |

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| Unit tests (5 cases) | ☐ PASS / ☐ FAIL | |
| Scenarios 3.1.1-3.1.5 | ☐ ALL PASS / ☐ FAIL: ___ | |

---

## PHASE 4 — Audit Checklist

### SLICE S4.1 — WebSocket

#### Unit Tests

**File:** `src/lib/core/ws/__tests__/BinanceTradeWS.test.ts`

```typescript
// Dùng mock WebSocket (jest.fn hoặc 'ws' mock library)
describe("BinanceTradeWS", () => {
  it("connect → gửi đúng URL endpoint", () => {
    const mockWS = jest.fn();
    (global as any).WebSocket = mockWS;
    new BinanceTradeWS({ symbol: "btcusdt", onTrade: jest.fn() }).connect();
    expect(mockWS).toHaveBeenCalledWith(
      expect.stringContaining("btcusdt@trade")
    );
  });

  it("parse message đúng TradeEvent format", () => {
    const onTrade = jest.fn();
    const ws = new BinanceTradeWS({ symbol: "btcusdt", onTrade });
    const rawMsg = JSON.stringify({
      e: "trade", T: 1699000000000, s: "BTCUSDT",
      p: "35000.00", q: "0.001", m: false
    });
    ws["handleMessage"]({ data: rawMsg } as MessageEvent);
    expect(onTrade).toHaveBeenCalledWith({
      symbol: "BTCUSDT",
      price: 35000,
      quantity: 0.001,
      isBuyerMaker: false,
      tradeTime: 1699000000000,
    });
  });

  it("disconnect → không gọi onTrade sau đó", () => {
    const onTrade = jest.fn();
    const ws = new BinanceTradeWS({ symbol: "btcusdt", onTrade });
    ws.connect();
    ws.disconnect();
    // Simulate message after disconnect
    ws["handleMessage"]({ data: JSON.stringify({ e: "trade", T: 1, s: "BTCUSDT", p: "35000", q: "0.001", m: false }) } as MessageEvent);
    expect(onTrade).not.toHaveBeenCalled();
  });
});
```

#### Manual Test Scenarios

| # | Kịch bản | Expected | Screenshot |
|---|---------|----------|------------|
| 4.1.1 | Mở DevTools Network, kết nối BTCUSDT | Tab WS hiện stream trades liên tục | evidence/s4.1-01-ws-connected.png |
| 4.1.2 | Tắt Network Throttling → "Offline" 3s → bật lại | Console: reconnect attempts với backoff, rồi "WS connected" | evidence/s4.1-02-reconnect.png |
| 4.1.3 | Đổi symbol từ BTCUSDT sang ETHUSDT | WS cũ đóng, WS mới mở với ethusdt@trade | evidence/s4.1-03-change-symbol.png |

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| Unit tests (3 cases) | ☐ PASS / ☐ FAIL | |
| Scenarios 4.1.1-4.1.3 | ☐ ALL PASS / ☐ FAIL: ___ | |

---

### SLICE S4.2 — CVD Real-time

#### Unit Tests

**File:** `src/lib/core/ws/__tests__/CVDAccumulator.test.ts`

```typescript
describe("CVDAccumulator", () => {
  const TIMEFRAME_1M = 60_000;

  it("buy trade → buyVol tăng, sellVol không đổi", () => {
    const acc = new CVDAccumulator(TIMEFRAME_1M);
    acc.addTrade({ price: 35000, quantity: 1.0, isBuyerMaker: false, tradeTime: 1699000000000, symbol: "BTCUSDT" });
    const buckets = acc["buckets"];
    expect(buckets[0].buyVol).toBeCloseTo(1.0);
    expect(buckets[0].sellVol).toBeCloseTo(0);
    expect(buckets[0].delta).toBeCloseTo(1.0);
  });

  it("sell trade (isBuyerMaker=true) → sellVol tăng", () => {
    const acc = new CVDAccumulator(TIMEFRAME_1M);
    acc.addTrade({ price: 35000, quantity: 0.5, isBuyerMaker: true, tradeTime: 1699000000000, symbol: "BTCUSDT" });
    expect(acc["buckets"][0].sellVol).toBeCloseTo(0.5);
    expect(acc["buckets"][0].delta).toBeCloseTo(-0.5);
  });

  it("CVD cộng dồn đúng qua nhiều buckets", () => {
    const acc = new CVDAccumulator(TIMEFRAME_1M);
    // Bar 1: delta = +2
    acc.addTrade({ price: 35000, quantity: 2, isBuyerMaker: false, tradeTime: 1699000000000, symbol: "BTCUSDT" });
    // Bar 2 (1 phút sau): delta = -1
    acc.addTrade({ price: 35000, quantity: 1, isBuyerMaker: true, tradeTime: 1699000060000, symbol: "BTCUSDT" });
    const buckets = acc["buckets"].sort((a, b) => a.openTime - b.openTime);
    expect(buckets[0].cvd).toBeCloseTo(2);
    expect(buckets[1].cvd).toBeCloseTo(1);  // 2 + (-1)
  });

  it("reset() → buckets rỗng", () => {
    const acc = new CVDAccumulator(TIMEFRAME_1M);
    acc.addTrade({ price: 35000, quantity: 1, isBuyerMaker: false, tradeTime: 1699000000000, symbol: "BTCUSDT" });
    acc.reset();
    expect(acc["buckets"].length).toBe(0);
  });

  it("mergeInto() override đúng cvdRealtime field", () => {
    const acc = new CVDAccumulator(TIMEFRAME_1M);
    acc.addTrade({ price: 35000, quantity: 3, isBuyerMaker: false, tradeTime: 1699000000000, symbol: "BTCUSDT" });
    const mockData: EnrichedDatum[] = [{
      date: new Date(1699000030000), open: 35000, high: 35100, low: 34900, close: 35050, volume: 100
    } as EnrichedDatum];
    const merged = acc.mergeInto(mockData);
    expect(merged[0].cvdRealtime).toBeCloseTo(3);
  });
});
```

#### Manual Test Scenarios

| # | Kịch bản | Expected | Screenshot |
|---|---------|----------|------------|
| 4.2.1 | CVD pane visible với WS connected | CVD line thay đổi real-time (mỗi 250ms flush) | evidence/s4.2-01-cvd-realtime.png |
| 4.2.2 | Đổi timeframe 1m → 5m | CVD reset về 0, tính lại từ đầu theo 5m bars | evidence/s4.2-02-timeframe-reset.png |

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| Unit tests (5 cases) | ☐ PASS / ☐ FAIL | |
| Scenarios 4.2.1-4.2.2 | ☐ ALL PASS / ☐ FAIL: ___ | |

---

### SLICE S4.3 — Whale Real-time

#### Unit Tests

**File:** `src/lib/core/ws/__tests__/WhaleAccumulator.test.ts`

```typescript
describe("WhaleAccumulator", () => {
  it("trade < threshold → không vào bucket", () => {
    const acc = new WhaleAccumulator(60_000, 50_000);
    acc.addTrade({ price: 35000, quantity: 1.0, isBuyerMaker: false, tradeTime: 1699000000000, symbol: "BTCUSDT" });
    // 35000 * 1.0 = $35,000 < $50,000
    expect(acc["buckets"].length).toBe(0);
  });

  it("trade >= threshold → vào bucket", () => {
    const acc = new WhaleAccumulator(60_000, 50_000);
    acc.addTrade({ price: 35000, quantity: 2.0, isBuyerMaker: false, tradeTime: 1699000000000, symbol: "BTCUSDT" });
    // 35000 * 2.0 = $70,000 >= $50,000
    expect(acc["buckets"].length).toBe(1);
    expect(acc["buckets"][0].whaleBuyVol).toBeCloseTo(2.0);
  });

  it("whale buy vs whale sell phân biệt đúng", () => {
    const acc = new WhaleAccumulator(60_000, 50_000);
    acc.addTrade({ price: 35000, quantity: 2, isBuyerMaker: false, tradeTime: 1699000000000, symbol: "BTCUSDT" }); // buy
    acc.addTrade({ price: 35000, quantity: 2, isBuyerMaker: true,  tradeTime: 1699000001000, symbol: "BTCUSDT" }); // sell
    expect(acc["buckets"][0].whaleBuyVol).toBeCloseTo(2);
    expect(acc["buckets"][0].whaleSellVol).toBeCloseTo(2);
  });

  it("threshold configurable", () => {
    const acc = new WhaleAccumulator(60_000, 100_000); // $100k threshold
    acc.addTrade({ price: 35000, quantity: 2.0, isBuyerMaker: false, tradeTime: 1699000000000, symbol: "BTCUSDT" }); // $70k — dưới threshold
    expect(acc["buckets"].length).toBe(0);
  });

  it("whaleBuyVol và whaleSellVol không âm", () => {
    const acc = new WhaleAccumulator(60_000, 50_000);
    acc.addTrade({ price: 35000, quantity: 2, isBuyerMaker: false, tradeTime: 1699000000000, symbol: "BTCUSDT" });
    expect(acc["buckets"][0].whaleBuyVol).toBeGreaterThanOrEqual(0);
    expect(acc["buckets"][0].whaleSellVol).toBeGreaterThanOrEqual(0);
  });
});
```

#### Manual Test Scenarios

| # | Kịch bản | Expected | Screenshot |
|---|---------|----------|------------|
| 4.3.1 | Console: `acc.addTrade({ price: 35000, quantity: 2, ... })` | whaleBuyVol tăng, whaleSellVol = 0 | evidence/s4.3-01-whale-buy.png |
| 4.3.2 | Whale pane visible trên chart khi có WS connected | Whale histogram bars xuất hiện cho trades > $50k | evidence/s4.3-02-whale-chart.png |

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| Unit tests (5 cases) | ☐ PASS / ☐ FAIL | |
| Scenarios 4.3.1-4.3.2 | ☐ ALL PASS / ☐ FAIL: ___ | |

---

### SLICE S4.4 — Strength Relative vs BTC

#### Unit Tests

**File:** `src/lib/core/ws/__tests__/StrengthRelativeCalc.test.ts`

```typescript
import { calcStrengthRelative } from "../StrengthRelativeCalc";

function makeDatum(date: number, close: number): EnrichedDatum {
  return { date: new Date(date), open: close, high: close, low: close, close, volume: 1000 } as EnrichedDatum;
}

describe("calcStrengthRelative", () => {
  it("asset và BTC tăng cùng tỉ lệ → RS = 1.0", () => {
    const asset = [makeDatum(1000, 100), makeDatum(2000, 110), makeDatum(3000, 121)];
    const btcCloses = new Map([[1000, 50000], [2000, 55000], [3000, 60500]]);
    const result = calcStrengthRelative(asset, btcCloses);
    result.forEach(d => {
      if (d.strengthRelative !== undefined) {
        expect(d.strengthRelative).toBeCloseTo(1.0, 3);
      }
    });
  });

  it("asset tăng 10%, BTC flat → RS ≈ 1.1", () => {
    const asset = [makeDatum(1000, 100), makeDatum(2000, 110)];
    const btcCloses = new Map([[1000, 50000], [2000, 50000]]);
    const result = calcStrengthRelative(asset, btcCloses);
    expect(result[1].strengthRelative).toBeCloseTo(1.1, 3);
  });

  it("asset flat, BTC tăng 10% → RS ≈ 0.909", () => {
    const asset = [makeDatum(1000, 100), makeDatum(2000, 100)];
    const btcCloses = new Map([[1000, 50000], [2000, 55000]]);
    const result = calcStrengthRelative(asset, btcCloses);
    expect(result[1].strengthRelative).toBeCloseTo(1/1.1, 3);
  });

  it("btcCloses rỗng → không crash, data không thay đổi", () => {
    const asset = [makeDatum(1000, 100), makeDatum(2000, 110)];
    const result = calcStrengthRelative(asset, new Map());
    expect(result).toHaveLength(2);
    expect(result[0].strengthRelative).toBeUndefined();
  });

  it("asset rỗng → trả về mảng rỗng", () => {
    const result = calcStrengthRelative([], new Map([[1000, 50000]]));
    expect(result).toHaveLength(0);
  });
});
```

#### Manual Test Scenarios

| # | Kịch bản | Expected | Screenshot |
|---|---------|----------|------------|
| 4.4.1 | Strength pane visible, WS connected với asset + BTC stream | RS line hiển thị, baseline = 1.0 | evidence/s4.4-01-rs-line.png |
| 4.4.2 | Symbol = "btcusdt" | Không mở 2nd WS stream (kiểm tra Network tab: chỉ 1 WS) | evidence/s4.4-02-no-dual-stream.png |

#### Evidence

| Item | Kết quả | Commit SHA |
|------|---------|------------|
| `npx tsc --noEmit` | ☐ PASS / ☐ FAIL | |
| Unit tests (5 cases) | ☐ PASS / ☐ FAIL | |
| Scenarios 4.4.1-4.4.2 | ☐ ALL PASS / ☐ FAIL: ___ | |

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
