# CE19 Sprint Brief — Drawing Overlay API

> **Sprint:** CE19  
> **Prerequisite:** CE13 DONE (có thể song song với CE20)  
> **Estimated:** 3–4 ngày

---

## Mục tiêu sprint

Mở rộng drawing subsystem để:
1. Cho phép register custom drawing tools từ bên ngoài library.
2. Hỗ trợ groupId cho bulk operations (select/delete theo nhóm).
3. Thêm 3 mức độ nhạy của magnet snap.
4. Highlight axis label khi drawing được chọn.

---

## CE19-01 — `registerDrawingTool()` public API

### Vị trí
`src/lib/drawing/registry.ts` (mở rộng — đọc file hiện tại trước)

```
read_file src/lib/drawing/registry.ts (full)
```

### Interface target
```typescript
export interface DrawingToolDefinition {
  type: string;           // unique identifier, e.g. "fibonacci-extension"
  labelKey: string;       // i18n key for display name
  iconKey?: string;       // optional icon identifier
  defaultParams?: Record<string, unknown>;
  
  /** Called when user starts drawing. Returns initial DrawingObject */
  onStart(params: {
    paneId: string;
    xValue: number;    // timestamp
    yValue: number;    // price
    pixelX: number;
    pixelY: number;
  }): Omit<DrawingObject, "id" | "createdAt" | "updatedAt">;
  
  /** Called on each mouse move during drawing */
  onUpdate?(
    drawing: DrawingObject,
    params: { xValue: number; yValue: number; pixelX: number; pixelY: number }
  ): Partial<DrawingObject>;
  
  /** Called when user finishes drawing (mouseup/click) */
  onFinish?(drawing: DrawingObject): DrawingObject;
  
  /** Render function for SVG/Canvas overlay */
  render(props: {
    drawing: DrawingObject;
    xScale: (v: number) => number;
    yScale: (v: number) => number;
    isSelected: boolean;
  }): React.ReactElement | null;
  
  /** Hit-test for mouse interaction */
  hitTest(
    drawing: DrawingObject,
    point: { pixelX: number; pixelY: number },
    xScale: (v: number) => number,
    yScale: (v: number) => number,
    tolerance: number
  ): boolean;
}

/** Đăng ký custom drawing tool */
export function registerDrawingTool(definition: DrawingToolDefinition): void {
  if (_drawingTools.has(definition.type)) {
    console.warn(`[DrawingRegistry] Overwriting existing tool: ${definition.type}`);
  }
  _drawingTools.set(definition.type, definition);
}

export function getDrawingTool(type: string): DrawingToolDefinition | undefined {
  return _drawingTools.get(type);
}

export function listDrawingTools(): readonly DrawingToolDefinition[] {
  return [..._drawingTools.values()];
}

const _drawingTools = new Map<string, DrawingToolDefinition>();
```

### Export từ public API
Thêm vào `src/lib/drawing/index.ts` (nếu có) hoặc `src/index.ts`:
```typescript
export { registerDrawingTool, getDrawingTool, listDrawingTools } from "./drawing/registry";
```

---

## CE19-02 — `groupId` field + bulk operations

### Thêm groupId vào DrawingObject

Đọc trước:
```
read_file src/lib/drawing/types.ts (full)
```

`groupId` ĐÃ có trong plan — kiểm tra nếu đã có trong type, nếu chưa thêm:
```typescript
export interface DrawingObject {
  // ... existing fields ...
  groupId?: string;  // CE19-02: drawings cùng group được chọn/xóa cùng lúc
}
```

### Bulk operations trong useDrawingInteraction

```
read_file src/lib/drawing/useDrawingInteraction.ts (full)  # hoặc file tương đương
```

Thêm 2 operations:
```typescript
/** Chọn tất cả drawings có cùng groupId */
function selectGroup(groupId: string): void {
  const ids = drawings
    .filter((d) => d.groupId === groupId)
    .map((d) => d.id);
  setSelectedIds(ids);
}

/** Xóa tất cả drawings có cùng groupId */
function deleteGroup(groupId: string): void {
  const newDrawings = drawings.filter((d) => d.groupId !== groupId);
  setDrawings(newDrawings);
}
```

### UI context menu entry
Khi right-click drawing có groupId, thêm option:
- "Chọn cả nhóm" / "Select Group"
- "Xóa cả nhóm" / "Delete Group"

i18n keys:
```typescript
"drawing.selectGroup": "Chọn cả nhóm" / "Select Group",
"drawing.deleteGroup": "Xóa cả nhóm" / "Delete Group",
```

---

## CE19-03 — Magnet sensitivity 3 mức

### Thiết kế
```typescript
// src/lib/drawing/snap.ts
export type MagnetSensitivity = "weak" | "normal" | "strong";

export const MAGNET_TOLERANCE: Record<MagnetSensitivity, number> = {
  weak: 5,
  normal: 10,
  strong: 20,
} as const;
```

### State persistence
```typescript
// Trong LibraryShowcaseDemo.tsx
const [magnetSensitivity, setMagnetSensitivity] = useState<MagnetSensitivity>(() => {
  return (localStorage.getItem("vnsc_magnet") as MagnetSensitivity) ?? "normal";
});
```

### UI control
Dropdown hoặc 3-button toggle trong toolbar (chỉ visible khi drawing mode active):
```tsx
<select
  value={magnetSensitivity}
  onChange={(e) => setMagnetSensitivity(e.target.value as MagnetSensitivity)}
  aria-label={t("drawing.magnetSensitivity")}
>
  <option value="weak">{t("drawing.magnet.weak")}</option>
  <option value="normal">{t("drawing.magnet.normal")}</option>
  <option value="strong">{t("drawing.magnet.strong")}</option>
</select>
```

### i18n keys
```typescript
"drawing.magnetSensitivity": "Độ nhạy nam châm" / "Magnet Sensitivity",
"drawing.magnet.weak": "Yếu" / "Weak",
"drawing.magnet.normal": "Bình thường" / "Normal",
"drawing.magnet.strong": "Mạnh" / "Strong",
```

### Pass tolerance vào snap logic
```
grep_search "snapToPrice\|snapToBar\|magnet\|tolerance" src/lib/drawing/
```
Tìm nơi tolerance được hardcode, thay bằng `MAGNET_TOLERANCE[magnetSensitivity]`.

---

## CE19-04 — Y-axis highlight khi drawing được chọn

### Mục tiêu
Khi một drawing được chọn (selected), giá của các điểm neo (anchor points) phải được highlight trên Y-axis.

### Implementation approach
1. Khi `selectedIds` thay đổi, collect tất cả price values từ selected drawings.
2. Pass danh sách này xuống `PriceLabel` component hoặc tương đương.
3. Render highlighted label (khác màu, border đậm hơn) tại mỗi giá.

```
grep_search "PriceLabel\|yAxis\|priceLabel" src/lib/  # tìm component hiện tại
```

### Không làm
- Không tạo component mới nếu `PriceLabel` hoặc tương đương đã có.
- Không thay đổi Y-axis scale logic — chỉ thêm visual highlight.

---

## CE19-05 — Unit tests

```typescript
describe("registerDrawingTool", () => {
  it("registers and retrieves a custom tool", () => {
    const mockTool: DrawingToolDefinition = {
      type: "custom-test",
      labelKey: "test.label",
      onStart: () => ({ type: "custom-test", points: [] }),
      render: () => null,
      hitTest: () => false,
    };
    registerDrawingTool(mockTool);
    expect(getDrawingTool("custom-test")).toBe(mockTool);
  });

  it("warns when overwriting existing tool", () => {
    const warn = vi.spyOn(console, "warn");
    registerDrawingTool({ type: "custom-test", /* ... */ });
    registerDrawingTool({ type: "custom-test", /* ... */ });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Overwriting"));
  });
});

describe("groupId operations", () => {
  it("selectGroup selects all drawings with groupId", () => { ... });
  it("deleteGroup removes all drawings with groupId", () => { ... });
});
```

---

## CE19-06 — Final audit

### Gate commands
```powershell
npm run type-check
npm test
npm run build:docs
python scripts/generate_module_tree.py
```

### Commit
```bash
git commit -m "feat(CE19): drawing overlay API — registerDrawingTool, groupId, magnet sensitivity

- registerDrawingTool/getDrawingTool/listDrawingTools public API
- groupId field in DrawingObject + selectGroup/deleteGroup bulk ops
- MagnetSensitivity 3 levels (weak/normal/strong) with persist
- Y-axis price highlight for selected drawings
- i18n VI+EN for new UI labels
- Unit tests for registry + groupId ops

Gates: type-check OK | tests PASS | build OK"

git push origin dev
```

---

## Export boundary

`registerDrawingTool`, `getDrawingTool`, `listDrawingTools` phải được export từ public `src/index.ts` hoặc `src/lib/index.ts` để người dùng bên ngoài có thể dùng.

Kiểm tra:
```
read_file src/index.ts (full)
```

Nếu file này là public API surface, thêm 3 exports ở đó.
