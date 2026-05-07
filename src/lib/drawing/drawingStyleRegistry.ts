import type { DrawingObject, DrawingStyle } from "./types";

export interface DrawingStyleOverride {
	color?: string;
	lineWidth?: number;
	opacity?: number;
	dashPattern?: number[];
}

const drawingStyleOverrides = new Map<string, Partial<DrawingStyleOverride>>();
const drawingStyleListeners = new Map<string, Set<() => void>>();
const drawingStyleChangeListeners = new Set<() => void>();

function normalizeDrawingStyleOverride(partialStyle: Partial<DrawingStyleOverride>): Partial<DrawingStyleOverride> {
	const normalized: Partial<DrawingStyleOverride> = {};
	if (typeof partialStyle.color === "string" && partialStyle.color.length > 0) {
		normalized.color = partialStyle.color;
	}
	if (typeof partialStyle.lineWidth === "number" && Number.isFinite(partialStyle.lineWidth)) {
		normalized.lineWidth = partialStyle.lineWidth;
	}
	if (typeof partialStyle.opacity === "number" && Number.isFinite(partialStyle.opacity)) {
		normalized.opacity = Math.min(1, Math.max(0, partialStyle.opacity));
	}
	if (Array.isArray(partialStyle.dashPattern)) {
		const dashPattern = partialStyle.dashPattern.filter((value) => typeof value === "number" && Number.isFinite(value) && value > 0);
		if (dashPattern.length > 0) {
			normalized.dashPattern = dashPattern;
		}
	}
	return normalized;
}

function cloneDrawingStyleOverride(style?: Partial<DrawingStyleOverride>): Partial<DrawingStyleOverride> | undefined {
	if (!style) {
		return undefined;
	}
	return {
		...style,
		dashPattern: style.dashPattern ? [...style.dashPattern] : undefined,
	};
}

function notifyDrawingStyleChange(instanceId: string) {
	drawingStyleListeners.get(instanceId)?.forEach((callback) => callback());
	drawingStyleChangeListeners.forEach((callback) => callback());
}

function notifyAllDrawingStyleChanges() {
	for (const [instanceId, listeners] of drawingStyleListeners) {
		listeners.forEach((callback) => callback());
	}
	drawingStyleChangeListeners.forEach((callback) => callback());
}

function dashPatternToStrokeDasharray(dashPattern?: number[]): DrawingStyle["strokeDasharray"] {
	if (!dashPattern || dashPattern.length === 0) {
		return "solid";
	}
	if (dashPattern.length === 1) {
		return dashPattern[0] <= 2 ? "dotted" : "dashed";
	}
	return dashPattern[0] <= 2 ? "dotted" : "dashed";
}

export function overrideDrawingStyle(drawingId: string, partialStyle: Partial<DrawingStyleOverride>): void {
	const normalized = normalizeDrawingStyleOverride(partialStyle);
	const current = drawingStyleOverrides.get(drawingId) ?? {};
	drawingStyleOverrides.set(drawingId, { ...current, ...normalized });
	notifyDrawingStyleChange(drawingId);
}

export function getDrawingStyleOverride(drawingId: string): Partial<DrawingStyleOverride> | undefined {
	return cloneDrawingStyleOverride(drawingStyleOverrides.get(drawingId));
}

export function clearDrawingStyleOverride(drawingId: string): void {
	drawingStyleOverrides.delete(drawingId);
	notifyDrawingStyleChange(drawingId);
}

export function clearDrawingStyleOverrides(): void {
	drawingStyleOverrides.clear();
	notifyAllDrawingStyleChanges();
}

export function listDrawingStyleOverrides(): Record<string, Partial<DrawingStyleOverride>> {
	return Object.fromEntries([...drawingStyleOverrides.entries()].map(([drawingId, style]) => [drawingId, cloneDrawingStyleOverride(style) ?? {}]));
}

export function subscribeDrawingStyle(drawingId: string, callback: () => void): () => void {
	if (!drawingStyleListeners.has(drawingId)) {
		drawingStyleListeners.set(drawingId, new Set());
	}
	drawingStyleListeners.get(drawingId)!.add(callback);
	return () => {
		const listeners = drawingStyleListeners.get(drawingId);
		if (!listeners) {
			return;
		}
		listeners.delete(callback);
		if (listeners.size === 0) {
			drawingStyleListeners.delete(drawingId);
		}
	};
}

export function subscribeDrawingStyleChanges(callback: () => void): () => void {
	drawingStyleChangeListeners.add(callback);
	return () => {
		drawingStyleChangeListeners.delete(callback);
	};
}

export function resolveDrawingStyle(drawing: DrawingObject): DrawingStyle {
	const override = drawingStyleOverrides.get(drawing.id);
	if (!override) {
		return { ...drawing.style };
	}
	return {
		...drawing.style,
		stroke: override.color ?? drawing.style.stroke,
		strokeWidth: override.lineWidth ?? drawing.style.strokeWidth,
		opacity: override.opacity ?? drawing.style.opacity,
		strokeDasharray: dashPatternToStrokeDasharray(override.dashPattern) ?? drawing.style.strokeDasharray,
	};
}