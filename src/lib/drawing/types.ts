import type React from "react";

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
	| "fibExtension"
	| "parallelChannel"
	| "pitchfork"
	| "abcdPattern"
	| "fibArc"
	| "fibTimeZone"
	| "regressionChannel";

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

export type DrawingAlertTrigger = "touch" | "break" | "closeAbove" | "closeBelow";

export interface DrawingAlertConfig {
	enabled: boolean;
	trigger: DrawingAlertTrigger;
}

export interface DrawingObject {
	id: string;
	type: DrawingToolType;
	points: Point[];
	style: DrawingStyle;
	paneId?: string;
	yScaleId?: string;
	text?: string;
	fibLevels?: number[];
	label?: string;
	symbol?: string;
	timeframe?: string;
	zIndex?: number;
	clonedFrom?: string;
	groupId?: string;
	riskReward?: { entry: number; stop: number; target: number; quantity?: number };
	alert?: DrawingAlertConfig;
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

/** CE19-01: Public plugin API for registering custom drawing tools from outside the library. */
export interface DrawingPluginDefinition {
	type: string;
	labelKey: string;
	iconKey?: string;
	defaultParams?: Record<string, unknown>;
	onStart(params: {
		paneId: string;
		xValue: number;
		yValue: number;
		pixelX: number;
		pixelY: number;
	}): Omit<DrawingObject, "id" | "createdAt" | "updatedAt">;
	onUpdate?(
		drawing: DrawingObject,
		params: { xValue: number; yValue: number; pixelX: number; pixelY: number },
	): Partial<DrawingObject>;
	onFinish?(drawing: DrawingObject): DrawingObject;
	render(props: {
		drawing: DrawingObject;
		xScale: (v: number) => number;
		yScale: (v: number) => number;
		isSelected: boolean;
	}): React.ReactElement | null;
	hitTest(
		drawing: DrawingObject,
		point: { pixelX: number; pixelY: number },
		xScale: (v: number) => number,
		yScale: (v: number) => number,
		tolerance: number,
	): boolean;
}