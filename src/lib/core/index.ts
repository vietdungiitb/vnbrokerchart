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

export type { ChartSyncState } from "./ChartPane";
export type { PaneInput, PaneManagerState, PaneManagerAction } from "./hooks/usePaneManager";
export type { ChartSplitterProps } from "./ChartSplitter";
export type { UsePaneSizesOptions, UsePaneSizesResult } from "./hooks/usePaneSizes";
export type { UseChartThemeResult, ChartTheme } from "./hooks/useChartTheme";