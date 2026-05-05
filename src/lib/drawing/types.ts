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
	| "text"
	| "rectangle"
	| "arrow"
	| "ray"
	| "extendedLine"
	| "polyline"
	| "dateAndPriceRange"
	| "longPosition"
	| "shortPosition"
	| "fibExtension";

export interface DrawingStyle {
	stroke: string;
	strokeWidth: number;
	strokeDasharray?: "solid" | "dashed" | "dotted";
	fill?: string;
	fillOpacity?: number;
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
	fibLevels?: number[];
	label?: string;
	symbol?: string;
	timeframe?: string;
	zIndex?: number;
	clonedFrom?: string;
	riskReward?: { entry: number; stop: number; target: number; quantity?: number };
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