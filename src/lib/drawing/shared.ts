import type { DrawingObject, DrawingStyle, DrawingToolType, Point } from "./types";

let drawingIdSeed = 0;

export function createDrawingId() {
	drawingIdSeed += 1;
	return `drawing-${drawingIdSeed}`;
}

export const defaultDrawingStyle: DrawingStyle = {
	stroke: "#111827",
	strokeWidth: 1,
	strokeDasharray: "solid",
	fill: "transparent",
	opacity: 1,
};

export function clonePoint(point: Point): Point {
	return { x: point.x, y: point.y };
}

export function createDrawingObject(type: DrawingToolType, points: Point[], patch: Partial<DrawingObject> = {}): DrawingObject {
	const now = Date.now();
	return {
		id: patch.id ?? createDrawingId(),
		type,
		points: points.map(clonePoint),
		style: { ...defaultDrawingStyle, ...patch.style },
		text: patch.text,
		fibLevels: patch.fibLevels ? [...patch.fibLevels] : undefined,
		label: patch.label,
		symbol: patch.symbol,
		timeframe: patch.timeframe,
		zIndex: patch.zIndex,
		clonedFrom: patch.clonedFrom,
		riskReward: patch.riskReward ? { ...patch.riskReward } : undefined,
		extendLeft: patch.extendLeft,
		extendRight: patch.extendRight,
		locked: patch.locked,
		visible: patch.visible ?? true,
		createdAt: patch.createdAt ?? now,
		updatedAt: patch.updatedAt ?? now,
	};
}

export function appendPoint(object: DrawingObject, nextPoint: Point) {
	return {
		...object,
		points: [...object.points.map(clonePoint), clonePoint(nextPoint)],
		updatedAt: Date.now(),
	};
}

export function replacePoint(object: DrawingObject, index: number, nextPoint: Point) {
	return {
		...object,
		points: object.points.map((point, pointIndex) => (pointIndex === index ? nextPoint : point)),
		updatedAt: Date.now(),
	};
}