import type { DrawingObject, DrawingStyle, DrawingToolType, Point } from "./types";

let drawingIdSeed = 0;

export function createDrawingId() {
	drawingIdSeed += 1;
	return `drawing-${drawingIdSeed}`;
}

export const defaultDrawingStyle: DrawingStyle = {
	stroke: "#111827",
	strokeWidth: 1,
	strokeDasharray: "Solid",
	fill: "transparent",
	opacity: 1,
};

export function createDrawingObject(type: DrawingToolType, points: Point[], patch: Partial<DrawingObject> = {}): DrawingObject {
	const now = Date.now();
	return {
		id: patch.id ?? createDrawingId(),
		type,
		points,
		style: patch.style ? { ...defaultDrawingStyle, ...patch.style } : defaultDrawingStyle,
		text: patch.text,
		extendLeft: patch.extendLeft,
		extendRight: patch.extendRight,
		locked: patch.locked,
		visible: patch.visible ?? true,
		createdAt: patch.createdAt ?? now,
		updatedAt: patch.updatedAt ?? now,
	};
}

export function replacePoint(object: DrawingObject, index: number, nextPoint: Point) {
	return {
		...object,
		points: object.points.map((point, pointIndex) => (pointIndex === index ? nextPoint : point)),
		updatedAt: Date.now(),
	};
}