import { createDraftFromTool, createTool, isDrawingToolName, listDrawingTools, registerDrawingTool } from "./registry";
import type { DrawingAction, DrawingState } from "./stateMachine";
import { drawingReducer } from "./stateMachine";
import type { DrawingHistory } from "./history";
import { createDrawingHistory, historyReducer } from "./history";
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

registerDrawingTool(TrendLine);
registerDrawingTool(HLine);
registerDrawingTool(VLine);
registerDrawingTool(Fibonacci);
registerDrawingTool(Channel);
registerDrawingTool(Text);

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
	serializeDrawingHistory,
	serializeDrawingObject,
	serializeDrawings,
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

export {
	TrendLine,
	HLine,
	VLine,
	Fibonacci,
	Channel,
	Text,
};