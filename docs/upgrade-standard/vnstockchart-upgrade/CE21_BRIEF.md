# CE21 Sprint Brief — Mobile/Touch Support

> **Sprint:** CE21  
> **Prerequisite:** CE14 DONE  
> **Estimated:** 5–7 ngày

---

## Mục tiêu sprint

Đưa chart demo dùng được trên mobile devices (375px+):
1. Pan bằng 1 ngón tay.
2. Zoom bằng pinch 2 ngón.
3. Drawing selection/move bằng ngón tay.
4. Toolbar không overflow màn nhỏ.
5. Context menu qua long-press (không cần right-click).

**Ràng buộc cứng:** Không thêm npm dependency mới. Chỉ dùng Pointer Events API (native browser).

---

## CE21-01 — Pointer Events pan (1 pointer)

### Đọc trước
```
grep_search "onMouseDown\|onMouseMove\|onMouseUp\|addEventListener.*mouse" src/lib/
```
Tìm `EventCapture.tsx` hoặc file tương đương xử lý mouse events.

```
read_file src/lib/EventCapture.tsx (full)  # nếu tồn tại
```

### Vấn đề hiện tại
Mouse events (`mousedown`, `mousemove`, `mouseup`) không fire trên mobile touch. Cần thêm Pointer Events handlers.

### Approach
**Không xóa mouse event handlers** — giữ nguyên để desktop hoạt động. Thêm pointer event handlers song song.

```typescript
// Thêm vào EventCapture hoặc wrapper component

function handlePointerDown(e: React.PointerEvent<SVGElement>) {
  if (e.pointerType === "mouse") return; // handled by mouse events
  if (e.isPrimary) {
    e.currentTarget.setPointerCapture(e.pointerId);
    onPanStart({ x: e.clientX, y: e.clientY });
  }
}

function handlePointerMove(e: React.PointerEvent<SVGElement>) {
  if (e.pointerType === "mouse") return;
  if (e.isPrimary && isPanning) {
    onPanMove({ x: e.clientX, y: e.clientY });
  }
}

function handlePointerUp(e: React.PointerEvent<SVGElement>) {
  if (e.pointerType === "mouse") return;
  if (e.isPrimary) {
    onPanEnd();
  }
}
```

### i18n
Không cần i18n cho pointer events logic.

---

## CE21-02 — Pinch-to-zoom (2 pointers)

### Approach

```typescript
// State để track 2 pointers đồng thời
const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());

function handlePointerDown(e: React.PointerEvent) {
  if (e.pointerType === "mouse") return;
  activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
}

function handlePointerMove(e: React.PointerEvent) {
  if (e.pointerType === "mouse") return;
  const prev = activePointers.current.get(e.pointerId);
  if (!prev) return;
  
  activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  
  // Pinch detection: 2 pointers active
  if (activePointers.current.size === 2) {
    const [p1, p2] = [...activePointers.current.values()];
    const currentDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    
    if (prevPinchDist.current !== null) {
      const zoomFactor = currentDist / prevPinchDist.current;
      onPinchZoom(zoomFactor, midpoint(p1, p2));
    }
    prevPinchDist.current = currentDist;
  }
}

function handlePointerUp(e: React.PointerEvent) {
  if (e.pointerType === "mouse") return;
  activePointers.current.delete(e.pointerId);
  if (activePointers.current.size < 2) {
    prevPinchDist.current = null;
  }
}

const prevPinchDist = useRef<number | null>(null);

function midpoint(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}
```

### Tích hợp với chart zoom
`onPinchZoom(factor, center)` phải gọi cùng logic với wheel scroll zoom hiện tại, nhưng với `factor` và `center` từ pinch.

Đọc cách wheel zoom được xử lý:
```
grep_search "onWheel\|wheelDelta\|zoom" src/lib/
```

---

## CE21-03 — Touch hit-test (tapRadius lớn hơn)

### Vấn đề
Hit-test hiện tại dùng tolerance nhỏ (~5px) phù hợp với mouse cursor. Ngón tay có diện tích ~44px nên cần tolerance lớn hơn.

### Đọc trước
```
read_file src/lib/drawing/hitTest.ts (full)  # hoặc file chứa hit test logic
```

### Thay đổi
```typescript
// Thêm device-aware tolerance
const HIT_TOLERANCE = {
  mouse: 5,   // pixel
  touch: 16,  // pixel — ngón tay
  pen: 8,
} as const;

// Pass pointerType xuống hit test khi cần
function testDrawingHit(
  drawing: DrawingObject,
  point: { x: number; y: number },
  pointerType: "mouse" | "touch" | "pen" = "mouse",
  xScale: ...,
  yScale: ...
): boolean {
  const tolerance = HIT_TOLERANCE[pointerType];
  // existing hit test logic với tolerance variable
  ...
}
```

### KHÔNG làm
- Không làm tolerance quá lớn (>20px) vì sẽ gây nhầm khi nhiều drawings gần nhau.
- Không thay đổi mouse tolerance.

---

## CE21-04 — Responsive toolbar

### Breakpoint target
- ≥768px: toolbar hiện tại giữ nguyên.
- <768px: toolbar collapse thành 1 hàng với scroll ngang + nút "More..." cho overflow items.

### Đọc trước
```
grep_search "toolbar\|class.*tool" src/demo/LibraryShowcaseDemo.tsx
```

### Approach: CSS-only trước
Không dùng JS breakpoint detection nếu CSS đủ.

```css
/* Thêm vào CSS file của demo */
@media (max-width: 767px) {
  .vnsc-toolbar {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;  /* hide scrollbar on mobile */
  }
  
  .vnsc-toolbar::-webkit-scrollbar {
    display: none;
  }
  
  .vnsc-toolbar-item {
    flex-shrink: 0;
    min-width: 36px;
    min-height: 36px;  /* Touch target minimum 44px recommended, 36px acceptable */
  }
}
```

### Touch targets
Theo WCAG, tất cả interactive elements phải có tap target ≥44×44px trên mobile.  
Kiểm tra buttons trong toolbar có đủ kích thước không — nếu thiếu, thêm padding.

### i18n
Nếu có label "More..." cần i18n:
```typescript
"toolbar.more": "Thêm" / "More",
```

---

## CE21-05 — Long-press context menu

### Vấn đề
Context menu hiện tại chỉ trigger bằng right-click (`onContextMenu`). Mobile không có right-click.

### Implementation: Long-press detector
```typescript
function useLongPress(
  callback: (e: React.PointerEvent) => void,
  delay = 500
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movedRef = useRef(false);
  
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return; // context menu handles mouse
    movedRef.current = false;
    timerRef.current = setTimeout(() => {
      if (!movedRef.current) callback(e);
    }, delay);
  };
  
  const onPointerMove = (e: React.PointerEvent) => {
    // If moved more than 10px, cancel long press
    movedRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  
  const onPointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  
  return { onPointerDown, onPointerMove, onPointerUp };
}
```

### Tích hợp vào drawing hit area
Khi long-press trúng một drawing → mở context menu giống như right-click.

### i18n không cần thêm
Context menu items đã có i18n từ CE11-CE13.

---

## CE21-06 — Unit tests cho touch logic

### Test pan
```typescript
describe("touch pan", () => {
  it("starts pan on primary pointer down (touch)", () => {
    const onPanStart = vi.fn();
    // simulate PointerEvent với pointerType = "touch"
    ...
    expect(onPanStart).toHaveBeenCalled();
  });
  
  it("does NOT start pan for mouse pointer (delegated to mouse handler)", () => {
    const onPanStart = vi.fn();
    // simulate PointerEvent với pointerType = "mouse"
    ...
    expect(onPanStart).not.toHaveBeenCalled();
  });
});
```

### Test pinch zoom
```typescript
describe("pinch zoom", () => {
  it("computes zoom factor from pinch distance change", () => {
    const onZoom = vi.fn();
    // simulate 2 pointers moving apart
    // initial dist = 100px, final dist = 200px → zoom factor = 2
    ...
    expect(onZoom).toHaveBeenCalledWith(expect.closeTo(2, 1), expect.any(Object));
  });
});
```

### Test long press
```typescript
describe("useLongPress", () => {
  it("calls callback after 500ms without movement", async () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const { onPointerDown, onPointerUp } = useLongPress(cb, 500);
    
    onPointerDown({ pointerType: "touch" } as React.PointerEvent);
    vi.advanceTimersByTime(500);
    expect(cb).toHaveBeenCalled();
  });
  
  it("cancels if pointer moves more than 10px", () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const { onPointerDown, onPointerMove } = useLongPress(cb, 500);
    
    onPointerDown({ pointerType: "touch" } as React.PointerEvent);
    onPointerMove({ pointerType: "touch", movementX: 15 } as React.PointerEvent);
    vi.advanceTimersByTime(500);
    expect(cb).not.toHaveBeenCalled();
  });
});
```

---

## CE21-07 — Final audit

### Visual verification (manual)
Mở Chrome DevTools → Device Toolbar → iPhone SE (375×667).  
Verify:
- [ ] Chart render đúng trên 375px.
- [ ] Pan bằng 1 ngón tay.
- [ ] Pinch zoom 2 ngón.
- [ ] Toolbar không overflow (scroll hoặc collapse).
- [ ] Long-press trên drawing mở context menu.
- [ ] Drawing có thể chọn và di chuyển bằng ngón tay.

### Gate commands
```powershell
npm run type-check
npm test
npm run build:docs
python scripts/generate_module_tree.py
```

### Commit
```bash
git commit -m "feat(CE21): mobile/touch support — pan, pinch zoom, responsive toolbar, long-press menu

- Pointer Events for pan (1 finger) and pinch zoom (2 fingers)
- Touch-aware hit-test tolerance (16px vs 5px for mouse)
- Responsive toolbar scrolls on <768px
- Long-press context menu (500ms, cancels on move)
- Tests for pan, pinch, long-press logic
- No new dependencies

Gates: type-check OK | tests PASS | build OK"

git push origin dev
```

---

## Browser compatibility note

Pointer Events API support:
- Chrome/Edge 55+: full support
- Firefox 59+: full support
- Safari 13+: full support (iOS 13+)
- iOS 12 và cũ hơn: KHÔNG support → graceful fallback (mouse/touch events là backup)

Không cần polyfill cho iOS 13+ nhưng ghi chú này vào code comment để team biết giới hạn.
