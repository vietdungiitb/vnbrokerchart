export type Point = Readonly<{
	x: number;
	y: number;
}>;

export type DrawingToolType =
	| "trendLine"
	| "hLine"
	| "vLine"
	| "fibonacci"
	| "channel"
	| "text";

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
	points: Point[];
	style: DrawingStyle;
	text?: string;
	extendLeft?: boolean;
	extendRight?: boolean;
	locked?: boolean;
	visible?: boolean;
	createdAt: number;
	updatedAt: number;
}

export interface DrawingToolDefinition {
	name: DrawingToolType;
	createDraft: (startPoint: Point) => DrawingObject;
	updateDraft: (draft: DrawingObject, nextPoint: Point) => DrawingObject;
	render?: (ctx: CanvasRenderingContext2D, object: DrawingObject) => void;
}