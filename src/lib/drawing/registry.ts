import type { DrawingToolDefinition, DrawingToolType, Point } from "./types";

const drawingToolRegistry = new Map<DrawingToolType, DrawingToolDefinition>();

export function registerDrawingTool(tool: DrawingToolDefinition) {
	drawingToolRegistry.set(tool.name, tool);
	return tool;
}

export function createTool(name: DrawingToolType) {
	const tool = drawingToolRegistry.get(name);
	if (!tool) {
		throw new Error(`Missing drawing tool: ${name}`);
	}
	return tool;
}

export function listDrawingTools() {
	return [...drawingToolRegistry.values()];
}

export function isDrawingToolName(name: string): name is DrawingToolType {
	return drawingToolRegistry.has(name as DrawingToolType);
}

export function createDraftFromTool(name: DrawingToolType, startPoint: Point) {
	return createTool(name).createDraft(startPoint);
}