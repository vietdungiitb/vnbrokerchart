# Phase 5 — Drawing Tools

> **Thuộc:** [ROADMAP.md](./ROADMAP.md)  
> **Ước tính:** 3–4 tuần  
> **Mục tiêu:** Drawing tools với state machine rõ ràng, state serializable thành JSON

---

## 5.1 Danh sách Drawing Tools

| Tool | Số điểm | Ưu tiên |
|------|---------|---------|
| TrendLine | 2 | P0 |
| HorizontalLine | 1 (y only) | P0 |
| VerticalLine | 1 (x only) | P1 |
| Ray | 2 (extend one direction) | P1 |
| ExtendedLine | 2 (extend both) | P1 |
| FibonacciRetracement | 2 | P0 |
| FibonacciExtension | 3 | P1 |
| ParallelChannel | 3 | P1 |
| PitchforkAndrews | 3 | P2 |
| Rectangle | 2 (corners) | P1 |
| Triangle | 3 | P2 |
| ArrowMarker | 1 | P1 |
| TextAnnotation | 1 | P1 |
| MeasureRule | 2 (hiện %move + bars) | P1 |

---

## 5.2 State Machine

```typescript
type DrawingState =
    | { status: 'idle' }
    | { status: 'drawing'; tool: DrawingToolType; points: DrawingPoint[] }
    | { status: 'selected'; id: string }
    | { status: 'moving'; id: string; offsetX: number; offsetY: number }
    | { status: 'resizing'; id: string; handleIndex: number };
```

**Transitions:**
```
idle ──[select tool]──→ drawing
drawing ──[click]──→ drawing (add point)
drawing ──[enough points]──→ idle (save drawing)
drawing ──[Escape]──→ idle
idle ──[click on drawing]──→ selected
selected ──[drag body]──→ moving
selected ──[drag handle]──→ resizing
selected ──[Delete key]──→ idle (remove drawing)
moving/resizing ──[mouseup]──→ selected
```

---

## 5.3 TypeScript Data Model

```typescript
export interface DrawingPoint {
    x: Date;    // timestamp
    y: number;  // price
}

export interface DrawingStyle {
    stroke: string;
    strokeWidth: number;
    strokeDasharray?: string;
    fill?: string;
    opacity?: number;
    fontSize?: number;
    fontFamily?: string;
}

export interface DrawingObject {
    id: string;
    type: DrawingToolType;
    points: DrawingPoint[];
    style: DrawingStyle;
    text?: string;          // cho TextAnnotation
    extendLeft?: boolean;   // cho lines
    extendRight?: boolean;
    locked?: boolean;       // không cho di chuyển
    visible?: boolean;
    createdAt: number;
}

// Toàn bộ state = DrawingObject[] → JSON.stringify() → lưu DB
```

---

## 5.4 Fibonacci Retracement

```typescript
const FIBO_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.272, 1.618];

export function computeFiboLevels(
    point1: DrawingPoint,
    point2: DrawingPoint
): Array<{ level: number; price: number }> {
    const diff = point2.y - point1.y;
    return FIBO_LEVELS.map(level => ({
        level,
        price: point2.y - diff * level,
    }));
}
```

---

## 5.5 Undo/Redo

```typescript
// Dùng useReducer + history stack
interface DrawingHistory {
    past: DrawingObject[][];
    present: DrawingObject[];
    future: DrawingObject[][];
}

function drawingReducer(state: DrawingHistory, action: DrawingAction): DrawingHistory {
    switch (action.type) {
        case 'ADD':
            return {
                past: [...state.past, state.present],
                present: [...state.present, action.drawing],
                future: [],
            };
        case 'UNDO':
            const [prev, ...rest] = state.past.slice().reverse();
            return prev ? {
                past: state.past.slice(0, -1),
                present: prev,
                future: [state.present, ...state.future],
            } : state;
        case 'REDO':
            const [next, ...remaining] = state.future;
            return next ? {
                past: [...state.past, state.present],
                present: next,
                future: remaining,
            } : state;
    }
}
```

---

## 5.6 Persistence Interface

```typescript
// Lưu/tải drawing state từ backend
export interface DrawingStorage {
    save(chartId: string, drawings: DrawingObject[]): Promise<void>;
    load(chartId: string): Promise<DrawingObject[]>;
    delete(chartId: string, drawingId: string): Promise<void>;
}

// Ví dụ implement cho Django:
class DjangoDrawingStorage implements DrawingStorage {
    async save(chartId, drawings) {
        await fetch(`/api/charts/${chartId}/drawings/`, {
            method: 'POST',
            body: JSON.stringify(drawings),
            headers: { 'Content-Type': 'application/json' },
        });
    }
    async load(chartId) {
        const res = await fetch(`/api/charts/${chartId}/drawings/`);
        return res.json();
    }
}
```

---

## 5.7 Checklist hoàn thành Phase 5

- [ ] DrawingState machine hoạt động đúng tất cả transitions
- [ ] TrendLine: vẽ, di chuyển, resize 2 đầu
- [ ] HorizontalLine với extend
- [ ] FibonacciRetracement với labels giá
- [ ] Rectangle
- [ ] ArrowMarker + TextAnnotation
- [ ] Undo/Redo (Ctrl+Z / Ctrl+Y)
- [ ] DrawingObject serializable thành JSON
- [ ] DrawingStorage interface
- [ ] Keyboard: Delete xóa, Escape hủy đang vẽ
- [ ] Lock/unlock drawing
- [ ] Storybook stories cho từng tool
