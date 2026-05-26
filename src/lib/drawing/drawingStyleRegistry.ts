import type { DrawingObject, DrawingStyle, DrawingToolType } from "./types";

export interface DrawingStyleOverride {
	color?: string;
	lineWidth?: number;
	opacity?: number;
	dashPattern?: number[];
}

const drawingStyleOverrides = new Map<string, Partial<DrawingStyleOverride>>();
const drawingStyleTemplates = new Map<DrawingToolType, Partial<DrawingStyle>>();
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
		normalized.dashPattern = dashPattern;
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

function normalizeDrawingStyleTemplate(partialStyle: Partial<DrawingStyle>): Partial<DrawingStyle> {
	const normalized: Partial<DrawingStyle> = {};
	if (typeof partialStyle.stroke === "string" && partialStyle.stroke.length > 0) {
		normalized.stroke = partialStyle.stroke;
	}
	if (typeof partialStyle.strokeWidth === "number" && Number.isFinite(partialStyle.strokeWidth) && partialStyle.strokeWidth > 0) {
		normalized.strokeWidth = partialStyle.strokeWidth;
	}
	if (typeof partialStyle.strokeDasharray === "string" && (partialStyle.strokeDasharray === "solid" || partialStyle.strokeDasharray === "dashed" || partialStyle.strokeDasharray === "dotted")) {
		normalized.strokeDasharray = partialStyle.strokeDasharray;
	}
	if (typeof partialStyle.fill === "string" && partialStyle.fill.length > 0) {
		normalized.fill = partialStyle.fill;
	}
	if (typeof partialStyle.fillOpacity === "number" && Number.isFinite(partialStyle.fillOpacity)) {
		normalized.fillOpacity = Math.min(1, Math.max(0, partialStyle.fillOpacity));
	}
	if (typeof partialStyle.opacity === "number" && Number.isFinite(partialStyle.opacity)) {
		normalized.opacity = Math.min(1, Math.max(0, partialStyle.opacity));
	}
	if (typeof partialStyle.fontSize === "number" && Number.isFinite(partialStyle.fontSize) && partialStyle.fontSize > 0) {
		normalized.fontSize = partialStyle.fontSize;
	}
	if (typeof partialStyle.fontFamily === "string" && partialStyle.fontFamily.length > 0) {
		normalized.fontFamily = partialStyle.fontFamily;
	}
	return normalized;
}

function cloneDrawingStyleTemplate(style?: Partial<DrawingStyle>): Partial<DrawingStyle> | undefined {
	if (!style) {
		return undefined;
	}
	return { ...style };
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

export function saveDrawingStyleTemplate(toolType: DrawingToolType, partialStyle: Partial<DrawingStyle>): void {
	const normalized = normalizeDrawingStyleTemplate(partialStyle);
	const current = drawingStyleTemplates.get(toolType) ?? {};
	drawingStyleTemplates.set(toolType, { ...current, ...normalized });
}

export function getDrawingStyleTemplate(toolType: DrawingToolType): Partial<DrawingStyle> | undefined {
	return cloneDrawingStyleTemplate(drawingStyleTemplates.get(toolType));
}

export function clearDrawingStyleTemplate(toolType: DrawingToolType): void {
	drawingStyleTemplates.delete(toolType);
}

export function clearDrawingStyleTemplates(): void {
	drawingStyleTemplates.clear();
}

export function listDrawingStyleTemplates(): Record<string, Partial<DrawingStyle>> {
	return Object.fromEntries([...drawingStyleTemplates.entries()].map(([toolType, style]) => [toolType, cloneDrawingStyleTemplate(style) ?? {}]));
}

export function restoreDrawingStyleTemplates(templates: Record<string, Partial<DrawingStyle>>): void {
	clearDrawingStyleTemplates();
	for (const [toolType, style] of Object.entries(templates)) {
		saveDrawingStyleTemplate(toolType as DrawingToolType, style);
	}
}

export function applyDrawingStyleTemplate(toolType: DrawingToolType, style: DrawingStyle): DrawingStyle {
	const template = drawingStyleTemplates.get(toolType);
	if (!template) {
		return { ...style };
	}
	return {
		...style,
		...template,
	};
}

function strokeDasharrayToDashPattern(strokeDasharray?: DrawingStyle["strokeDasharray"]): number[] | undefined {
	switch (strokeDasharray) {
		case "dashed":
			return [6, 4];
		case "dotted":
			return [2, 4];
		case "solid":
		default:
			return [];
	}
}

export interface DrawingStyleSyncResult {
	drawingPatch: Partial<DrawingObject>;
	overridePatch: Partial<DrawingStyleOverride>;
}

export function projectDrawingStyleUpdate(drawing: DrawingObject, patch: Partial<DrawingStyle>): DrawingStyleSyncResult {
	const resolvedStyle = resolveDrawingStyle(drawing);
	const nextStyle = {
		...resolvedStyle,
		...patch,
	};
	const overridePatch: Partial<DrawingStyleOverride> = {};

	if (typeof patch.stroke === "string" && patch.stroke.length > 0) {
		overridePatch.color = patch.stroke;
	}
	if (typeof patch.strokeWidth === "number" && Number.isFinite(patch.strokeWidth)) {
		overridePatch.lineWidth = patch.strokeWidth;
	}
	if (typeof patch.opacity === "number" && Number.isFinite(patch.opacity)) {
		overridePatch.opacity = Math.min(1, Math.max(0, patch.opacity));
	}
	if (typeof patch.strokeDasharray !== "undefined") {
		overridePatch.dashPattern = strokeDasharrayToDashPattern(patch.strokeDasharray);
	}

	return {
		drawingPatch: { style: nextStyle },
		overridePatch,
	};
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