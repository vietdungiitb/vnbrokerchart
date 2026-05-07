# CE18 Sprint Brief — Style Override API

> **Sprint:** CE18  
> **Prerequisite:** CE15 DONE (có thể chạy song song với CE16+CE17)  
> **Estimated:** 2–3 ngày

---

## Mục tiêu sprint

Xây dựng một API cho phép code ngoài (và UI) override màu sắc/style của indicator series và drawing objects mà không cần rewrite registry hoặc mutate global state.

---

## CE18-01 — `overrideSeriesStyle()` API trong SeriesRegistry

### Thiết kế
```typescript
// Thêm vào src/lib/core/registry/SeriesRegistry.ts

export interface SeriesStyleOverride {
  color?: string;          // hex hoặc rgba
  lineWidth?: number;      // pixel
  visible?: boolean;
  opacity?: number;        // 0–1
  dashPattern?: number[];  // [4, 2] = dash 4px, gap 2px
}

/** Override style cho một instance cụ thể (theo instanceId) */
export function overrideSeriesStyle(
  instanceId: string,
  partialStyle: Partial<SeriesStyleOverride>
): void {
  _styleOverrides.set(instanceId, {
    ...(_styleOverrides.get(instanceId) ?? {}),
    ...partialStyle,
  });
  _notifyStyleChange(instanceId);
}

/** Lấy override đang áp dụng cho instanceId */
export function getSeriesStyleOverride(
  instanceId: string
): Partial<SeriesStyleOverride> | undefined {
  return _styleOverrides.get(instanceId);
}

/** Xóa override, trả về style mặc định */
export function clearSeriesStyleOverride(instanceId: string): void {
  _styleOverrides.delete(instanceId);
  _notifyStyleChange(instanceId);
}

// Internal state — không expose trực tiếp
const _styleOverrides = new Map<string, Partial<SeriesStyleOverride>>();
const _styleListeners = new Map<string, Set<() => void>>();

function _notifyStyleChange(instanceId: string) {
  _styleListeners.get(instanceId)?.forEach((fn) => fn());
}

/** Hook cho component đăng ký lắng nghe style change */
export function subscribeSeriesStyle(
  instanceId: string,
  callback: () => void
): () => void {
  if (!_styleListeners.has(instanceId)) {
    _styleListeners.set(instanceId, new Set());
  }
  _styleListeners.get(instanceId)!.add(callback);
  return () => {
    _styleListeners.get(instanceId)?.delete(callback);
  };
}
```

### Đọc trước khi sửa
```
read_file src/lib/core/registry/SeriesRegistry.ts lines 1–50  # imports, existing state
```

### Scope
`instanceId` là `SeriesConfig.id` (unique per series instance trong chart). Không per-type — cho phép 2 EMA(14) trên 2 panes có màu khác nhau.

---

## CE18-02 — `overrideDrawingStyle()` API

### Thiết kế
```typescript
// Thêm vào src/lib/drawing/DrawingLayer.tsx
// HOẶC tạo src/lib/drawing/drawingStyleRegistry.ts nếu muốn tách logic

export interface DrawingStyleOverride {
  color?: string;
  lineWidth?: number;
  opacity?: number;
  dashPattern?: number[];
}

export function overrideDrawingStyle(
  drawingId: string,
  partialStyle: Partial<DrawingStyleOverride>
): void { ... }

export function getDrawingStyleOverride(
  drawingId: string
): Partial<DrawingStyleOverride> | undefined { ... }

export function clearDrawingStyleOverride(drawingId: string): void { ... }
```

**Lưu ý:** `drawingId` là `DrawingObject.id`.

### Đọc trước khi sửa
```
read_file src/lib/drawing/types.ts (full)  # xem DrawingObject interface
```

---

## CE18-03 — Color picker trong DrawingInspector

### Hiện trạng
`DrawingInspector` hiện có thể chỉnh `strokeColor` trực tiếp qua mutation. CE18 chuyển sang dùng `overrideDrawingStyle()`.

### Đọc trước
```
grep_search "DrawingInspector" src/lib/drawing/
```

### Implementation
```tsx
// Trong DrawingInspector.tsx
import { overrideDrawingStyle } from "./drawingStyleRegistry";

const handleColorChange = (newColor: string) => {
  overrideDrawingStyle(drawing.id, { color: newColor });
};

// Render color picker
<input
  type="color"
  value={currentStyle.color ?? drawing.strokeColor ?? "#ffffff"}
  onChange={(e) => handleColorChange(e.target.value)}
  aria-label={t("drawing.strokeColor")}
/>
```

### i18n keys cần thêm (nếu chưa có)
```typescript
"drawing.strokeColor": "Màu đường" / "Stroke Color",
"drawing.lineWidth": "Độ dày" / "Line Width",
```

---

## CE18-04 — Persist style overrides vào localStorage

### Implementation
Persist qua `useEffect` khi override state thay đổi.

```typescript
// Trong LibraryShowcaseDemo.tsx hoặc custom hook useStyleOverrides

const STORAGE_KEY = "vnsc_style_overrides";

// Load on mount
useEffect(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Record<string, Partial<SeriesStyleOverride>>;
      Object.entries(parsed).forEach(([id, style]) => {
        overrideSeriesStyle(id, style);
      });
    }
  } catch {
    // ignore corrupt data
  }
}, []);

// Save on change — subscribe to style changes
// ...
```

**KHÔNG** serialize function references hay non-serializable objects vào localStorage.

---

## CE18-05 — Unit tests

```typescript
describe("overrideSeriesStyle", () => {
  it("sets override for an instanceId", () => {
    overrideSeriesStyle("ema-1", { color: "#ff0000" });
    expect(getSeriesStyleOverride("ema-1")).toEqual({ color: "#ff0000" });
  });

  it("merges partial updates", () => {
    overrideSeriesStyle("ema-1", { color: "#ff0000" });
    overrideSeriesStyle("ema-1", { lineWidth: 2 });
    expect(getSeriesStyleOverride("ema-1")).toEqual({ color: "#ff0000", lineWidth: 2 });
  });

  it("clearSeriesStyleOverride removes entry", () => {
    overrideSeriesStyle("ema-2", { color: "#ff0000" });
    clearSeriesStyleOverride("ema-2");
    expect(getSeriesStyleOverride("ema-2")).toBeUndefined();
  });

  it("notifies subscriber on change", () => {
    const cb = vi.fn();
    subscribeSeriesStyle("ema-3", cb);
    overrideSeriesStyle("ema-3", { color: "#00ff00" });
    expect(cb).toHaveBeenCalledOnce();
  });
});
```

---

## CE18-06 — Final audit

### Gate commands
```powershell
npm run type-check
npm test
npm run build:docs
python scripts/generate_module_tree.py
```

### Commit
```bash
git commit -m "feat(CE18): style override API for series and drawings

- overrideSeriesStyle/clearSeriesStyleOverride/subscribeSeriesStyle API
- overrideDrawingStyle/clearDrawingStyleOverride API
- Color picker in DrawingInspector uses override API
- Persist style overrides to localStorage
- Tests cover merge, clear, subscriber notification

Gates: type-check OK | tests PASS | build OK"

git push origin dev
```

---

## Ràng buộc thiết kế quan trọng

1. `_styleOverrides` Map là **module-level state**, không phải React state. Components subscribe thông qua `subscribeSeriesStyle()` và trigger React re-render bằng `useState` + `useEffect`.
2. Override không thay đổi RegistryEntry — registry giữ nguyên defaults; override chỉ là layer trên cùng.
3. Nếu override bị xóa → style trở về default từ RegistryEntry (không cần fallback logic phức tạp).
