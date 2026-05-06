
// common components
export { default as ChartCanvas } from "./lib/ChartCanvas";
export { default as Chart } from "./lib/Chart";
export { default as GenericChartComponent } from "./lib/GenericChartComponent";
export { default as GenericComponent } from "./lib/GenericComponent";
export { default as BackgroundText } from "./lib/BackgroundText";
export { default as ZoomButtons } from "./lib/ZoomButtons";

export { ChartTerminal, ChartPane, PaneSplitter, usePaneManager, BarReplayController } from "./lib/core";
export { ChartSplitter, usePaneSizes, useChartTheme, DynamicChart, PaneHeader, PaneLabel, PaneTooltip, SeriesPicker, IndicatorLegend, useDynamicPanes, DEFAULT_PANES, PANE_LAYOUT_STORAGE_KEY, PANE_MAX_VISIBLE } from "./lib/core";

export type { ChartSplitterProps } from "./lib/core";
export type { UsePaneSizesOptions, UsePaneSizesResult } from "./lib/core";
export type { UseChartThemeResult, ChartTheme } from "./lib/core";
export type { PaneDescriptor, SeriesConfig, SeriesTypeId, TooltipMode, YAxisSide } from "./lib/core";
export type { BarReplayState, ReplayBarLike, ReplaySpeed } from "./lib/core";
export { getIndicator, registerIndicator } from "./lib/indicators";
export { BaseAdapter, DjangoVnstockAdapter, MockAdapter, createRestAdapter, createMockBars } from "./lib/adapters";
export {
	createDraftFromTool,
	createDrawingHistory,
	createTool as createDrawingTool,
	createDrawingInteractionState,
	createLocalStorageAdapter,
	DrawingImportError,
	deleteSelectedInteractionState,
	deserializeDrawingHistory,
	deserializeDrawingObject,
	deserializeDrawings,
	drawingInteractionReducer,
	drawingReducer,
	chartPointToPixel,
	historyReducer,
	isDrawingToolName,
	listDrawingTools,
	pixelToChartPoint,
	registerDrawingTool,
	renderDrawingToSvg,
	serializeDrawingHistory,
	serializeDrawingObject,
	serializeDrawings,
	useDrawingStorage,
	useDrawingInteraction,
	DrawingLayer,
	DrawingInspector,
	DrawingListPanel,
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
} from "./lib/drawing";

export type {
	ChartScales,
	DrawingInteractionAction,
	DrawingInteractionState,
	PlotDatum,
	UseDrawingInteractionReturn,
} from "./lib/drawing";

export type {
	AnyRecord,
	BarData,
	CandleData,
	CandleWick,
	ChartAccessor,
	ChartDatum,
	CanvasContexts,
	MoreProps,
	OHLCV,
	OHLCVBar,
	IndicatorConfig,
	IndicatorDefinition,
	PaneConfig,
	StockDataAdapter,
	Unsubscribe,
	YAxisConfig,
} from "./lib/types/index";

export { VNStockChart, WidgetErrorBoundary, WidgetEmptyState, WidgetI18nContext, WidgetI18nProvider, useWidgetI18n } from "./widget";
export { widgetMessagesEn, widgetMessagesVi } from "./widget";
export type { VNStockChartProps, WidgetLocale, WidgetMessages, WidgetI18nContextValue, WidgetI18nProviderProps } from "./widget";

export const version = "1.0.0";
