export { ChartTerminal } from "./ChartTerminal";
export { ChartPane } from "./ChartPane";
export { PaneSplitter } from "./PaneSplitter";
export { usePaneManager, paneManagerReducer } from "./hooks/usePaneManager";
export { useCanvasResize } from "./hooks/useCanvasResize";
export { computeScales } from "./scales/computeScales";

// ── Pane sizing & splitter ────────────────────────────────────────────────────
export { ChartSplitter } from "./ChartSplitter";
export { usePaneSizes } from "./hooks/usePaneSizes";
export { useChartTheme } from "./hooks/useChartTheme";
export { DynamicChart } from "./DynamicChart";
export { PaneLabel } from "./PaneLabel";
export { PaneHeader } from "./PaneHeader";
export { PaneTooltip } from "./PaneTooltip";
export { SeriesPicker } from "./SeriesPicker";
export { useDynamicPanes, dynamicPanesReducer, createDefaultPaneLayout, loadPaneLayout, savePaneLayout } from "./hooks/useDynamicPanes";
export { DEFAULT_PANES, PANE_LAYOUT_STORAGE_KEY, PANE_MAX_VISIBLE } from "./types/pane-descriptor";
export type { PaneDescriptor, SeriesConfig, SeriesTypeId, TooltipMode, YAxisSide } from "./types/pane-descriptor";
export { getSeries, listRegistered, registerSeries } from "./registry/SeriesRegistry";
export { initRegistry } from "./registry/registerAll";

export type { ChartSyncState } from "./ChartPane";
export type { PaneInput, PaneManagerState, PaneManagerAction } from "./hooks/usePaneManager";
export type { ChartSplitterProps } from "./ChartSplitter";
export type { UsePaneSizesOptions, UsePaneSizesResult } from "./hooks/usePaneSizes";
export type { UseChartThemeResult, ChartTheme } from "./hooks/useChartTheme";