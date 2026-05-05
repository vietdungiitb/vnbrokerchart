import { createDraftFromTool, createTool, isDrawingToolName, listDrawingTools, registerDrawingTool } from "./registry";
import type { DrawingAction, DrawingState } from "./stateMachine";
import { drawingReducer } from "./stateMachine";
import type { DrawingHistory } from "./history";
import { createDrawingHistory, historyReducer } from "./history";
import type { ChartScales, PlotDatum } from "./coordinateUtils";
import { chartPointToPixel, pixelToChartPoint } from "./coordinateUtils";
import { createLocalStorageAdapter, DrawingImportError } from "./DrawingStorage";
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
import Ray from "./builtin/ray";
import ExtendedLine from "./builtin/extendedLine";
import Polyline from "./builtin/polyline";
import DateAndPriceRange from "./builtin/dateAndPriceRange";
import LongPosition from "./builtin/longPosition";
import ShortPosition from "./builtin/shortPosition";
import FibExtension from "./builtin/fibExtension";
import ParallelChannel from "./builtin/parallelChannel";
import Pitchfork from "./builtin/pitchfork";
import AbcdPattern from "./builtin/abcdPattern";
import FibArc from "./builtin/fibArc";
import FibTimeZone from "./builtin/fibTimeZone";
import RegressionChannel from "./builtin/regressionChannel";
import DrawingInspector from "./DrawingInspector";
import DrawingListPanel from "./DrawingListPanel";
import type { DrawingInteractionAction, DrawingInteractionState, UseDrawingInteractionReturn } from "./useDrawingInteraction";
import { createDrawingInteractionState, deleteSelectedInteractionState, drawingInteractionReducer, useDrawingInteraction } from "./useDrawingInteraction";
import { renderDrawingToSvg } from "./renderSvg";
import DrawingLayer from "./DrawingLayer";
import { useDrawingStorage } from "./useDrawingStorage";

registerDrawingTool(TrendLine);
registerDrawingTool(HLine);
registerDrawingTool(VLine);
registerDrawingTool(Fibonacci);
registerDrawingTool(Channel);
registerDrawingTool(Text);
registerDrawingTool(Rectangle);
registerDrawingTool(Arrow);
registerDrawingTool(Ray);
registerDrawingTool(ExtendedLine);
registerDrawingTool(Polyline);
registerDrawingTool(DateAndPriceRange);
registerDrawingTool(LongPosition);
registerDrawingTool(ShortPosition);
registerDrawingTool(FibExtension);
registerDrawingTool(ParallelChannel);
registerDrawingTool(Pitchfork);
registerDrawingTool(AbcdPattern);
registerDrawingTool(FibArc);
registerDrawingTool(FibTimeZone);
registerDrawingTool(RegressionChannel);

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
	createLocalStorageAdapter,
	DrawingImportError,
	useDrawingStorage,
	DrawingLayer,
	DrawingInspector,
	DrawingListPanel,
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
	Ray,
	ExtendedLine,
	Polyline,
	DateAndPriceRange,
	LongPosition,
	ShortPosition,
	FibExtension,
	ParallelChannel,
	Pitchfork,
	AbcdPattern,
	FibArc,
	FibTimeZone,
	RegressionChannel,
};