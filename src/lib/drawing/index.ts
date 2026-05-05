import { createDraftFromTool, createTool, isDrawingToolName, listDrawingTools, registerDrawingTool } from "./registry";
import type { DrawingAction, DrawingState } from "./stateMachine";
import { drawingReducer } from "./stateMachine";
import type { DrawingHistory } from "./history";
import { createDrawingHistory, historyReducer } from "./history";
import type { ChartScales, PlotDatum } from "./coordinateUtils";
import { chartPointToPixel, pixelToChartPoint } from "./coordinateUtils";
import {
	deserializeDrawingHistory,
	deserializeDrawingObject,
	deserializeDrawings,
	serializeDrawingHistory,
	serializeDrawingObject,
	serializeDrawings,
} from "./serialization";
import TrendLine from "./builtin/trendLine";
import HLine from "./builtin/hLine";
import VLine from "./builtin/vLine";
import Fibonacci from "./builtin/fibonacci";
import Channel from "./builtin/channel";
import Text from "./builtin/text";
import Rectangle from "./builtin/rectangle";
import Arrow from "./builtin/arrow";
import type { DrawingInteractionAction, DrawingInteractionState, UseDrawingInteractionReturn } from "./useDrawingInteraction";
import { createDrawingInteractionState, deleteSelectedInteractionState, drawingInteractionReducer, useDrawingInteraction } from "./useDrawingInteraction";
import { renderDrawingToSvg } from "./renderSvg";
import DrawingLayer from "./DrawingLayer";

registerDrawingTool(TrendLine);
registerDrawingTool(HLine);
registerDrawingTool(VLine);
registerDrawingTool(Fibonacci);
registerDrawingTool(Channel);
registerDrawingTool(Text);
registerDrawingTool(Rectangle);
registerDrawingTool(Arrow);

export {
	createDraftFromTool,
	createTool,
	createDrawingHistory,
	deserializeDrawingHistory,
	deserializeDrawingObject,
	deserializeDrawings,
	drawingReducer,
	historyReducer,
	isDrawingToolName,
	listDrawingTools,
	registerDrawingTool,
	renderDrawingToSvg,
	serializeDrawingHistory,
	serializeDrawingObject,
	serializeDrawings,
	chartPointToPixel,
	pixelToChartPoint,
	createDrawingInteractionState,
	deleteSelectedInteractionState,
	drawingInteractionReducer,
	useDrawingInteraction,
	DrawingLayer,
};

export type {
	DrawingAction,
	DrawingState,
} from "./stateMachine";

export type { DrawingHistory } from "./history";

export type {
	DrawingObject,
	DrawingStyle,
	DrawingToolDefinition,
	DrawingToolType,
	Point,
} from "./types";

export type {
	DrawingInteractionAction,
	DrawingInteractionState,
	UseDrawingInteractionReturn,
} from "./useDrawingInteraction";

export type {
	ChartScales,
	PlotDatum,
} from "./coordinateUtils";

export {
	TrendLine,
	HLine,
	VLine,
	Fibonacci,
	Channel,
	Text,
	Rectangle,
	Arrow,
};