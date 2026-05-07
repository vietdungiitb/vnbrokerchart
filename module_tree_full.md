# React Stockcharts Module Tree (Auto-generated)

> Do not edit manually. Regenerate with `python scripts/generate_module_tree.py`.

Generated at: `2026-05-07 14:58:38`

## Summary

- Total modules: 710
- Python modules: 1
- JS/TS modules: 709
- Total classes: 353
- Total functions: 3853
- Total top-level variables: 8503

## Python Modules

### `scripts/generate_module_tree.py`

- Classes:
  - `ClassInfo`
  - `ModuleInfo`
- Functions:
  - `is_ignored`, `iter_source_files`, `main`, `module_has_symbols`, `parse_js_ts_module`, `parse_module`, `parse_python_module`, `pick_first_group`, `render_markdown`, `unique_sorted`
- Top-level variables:
  - `IGNORE_DIR_NAMES`, `IGNORE_PATH_PARTS`, `JS_ARROW_RE`, `JS_CLASS_RE`, `JS_EXTS`, `JS_FUNC_EXPR_RE`, `JS_FUNC_RE`, `JS_VAR_RE`, `OUTPUT`, `PY_EXTS`, `ROOT`, `VAR_NAME_RE`

## JS/TS Modules

### `.storybook/main.ts`

- Top-level variables:
  - `config`

### `.storybook/preview.ts`

- Top-level variables:
  - `preview`

### `config/webpack.config.js`

- Top-level variables:
  - `HtmlWebpackPlugin`, `isProduction`, `path`

### `docs/documentation.js`

- Classes:
  - `ExamplesPage`
- Functions:
  - `compressString`, `loadPage`, `parseData`, `renderPage`, `renderPartialPage`
- Top-level variables:
  - `ALGORITHMIC_INDICATORS`, `ALL_PAGES`, `CHART_FEATURES`, `CHART_TYPES`, `Chart`, `DOCUMENTATION`, `INDICATORS`, `INTERACTIVE`, `Page`, `firstPage`, `horizontalBarData`, `horizontalGroupedBarData`, `pages`, `parseDate`, `parseDateTime`, `promiseBarData`, `promiseBubbleData`, `promiseCompare`, `promiseIntraDayContinuous`, `promiseIntraDayDiscontinuous`, `promiseMSFT`, `promiseMSFTfull`, `promisegroupedBarData`, `selected`, `selectedPage`

### `docs/index.js`

- Functions:
  - `loadPage`
- Top-level variables:
  - `ReadME`, `parseDate`

### `docs/lib/charts/AreaChart.js`

- Classes:
  - `AreaChart`
- Top-level variables:
  - `canvasGradient`

### `docs/lib/charts/AreaChartWithYPercent.js`

- Classes:
  - `AreaChartWithYPercent`

### `docs/lib/charts/AreaChartWithZoomPan.js`

- Classes:
  - `AreaChartWithEdge`
- Top-level variables:
  - `end`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/BarChart.js`

- Classes:
  - `BarChart`
- Top-level variables:
  - `data`

### `docs/lib/charts/BubbleChart.js`

- Classes:
  - `BubbleChart`
- Functions:
  - `fill`, `radius`
- Top-level variables:
  - `data`, `f`, `r`

### `docs/lib/charts/CandleStickChart.js`

- Classes:
  - `CandleStickChart`
- Functions:
  - `xAccessor`
- Top-level variables:
  - `xExtents`

### `docs/lib/charts/CandleStickChartForContinuousIntraDay.js`

- Classes:
  - `CandleStickChartForContinuousIntraDay`
- Functions:
  - `xAccessor`
- Top-level variables:
  - `end`, `start`, `xExtents`

### `docs/lib/charts/CandleStickChartForDiscontinuousIntraDay.js`

- Classes:
  - `CandleStickChartForDiscontinuousIntraDay`
- Top-level variables:
  - `end`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartPanToLoadMore.js`

- Classes:
  - `CandleStickChartPanToLoadMore`
- Functions:
  - `getMaxUndefined`
- Top-level variables:
  - `LENGTH_TO_SHOW`, `calculatedData`, `dataToCalculate`, `ema12`, `ema26`, `indexCalculator`, `macdAppearance`, `macdCalculator`, `maxWindowSize`, `rowsToDownload`, `smaVolume50`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithAnnotation.js`

- Classes:
  - `CandleStickChartWithAnnotation`
- Top-level variables:
  - `annotationProps`, `end`, `height`, `margin`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithBollingerBandOverlay.js`

- Classes:
  - `CandleStickChartWithBollingerBandOverlay`
- Top-level variables:
  - `bb`, `bbFill`, `bbStroke`, `calculatedData`, `ema20`, `ema50`, `end`, `sma20`, `smaVolume50`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithBrush.js`

- Classes:
  - `CandlestickChart`
- Top-level variables:
  - `BRUSH_TYPE`, `CandleStickChartWithBrush`, `calculatedData`, `ema12`, `ema26`, `end`, `high`, `keyCode`, `left`, `low`, `macdAppearance`, `macdCalculator`, `right`, `smaVolume50`, `start`, `xExtents`, `xScaleProvider`, `yExtents1`, `yExtents3`

### `docs/lib/charts/CandleStickChartWithCHMousePointer.js`

- Classes:
  - `CandleStickChartWithCHMousePointer`
- Top-level variables:
  - `end`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithClickHandlerCallback.js`

- Classes:
  - `CandlestickChart`
- Top-level variables:
  - `CandleStickChartWithClickHandlerCallback`, `calculatedData`, `ema12`, `ema26`, `end`, `macdAppearance`, `macdCalculator`, `smaVolume50`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithCompare.js`

- Classes:
  - `CandleStickChartWithCompare`
- Top-level variables:
  - `compareCalculator`, `end`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithDarkTheme.js`

- Classes:
  - `CandleStickChartWithDarkTheme`
- Top-level variables:
  - `bb`, `bbAppearance`, `calculatedData`, `ema20`, `ema50`, `end`, `fastSTO`, `fullSTO`, `gridHeight`, `gridWidth`, `height`, `margin`, `showGrid`, `slowSTO`, `start`, `stoAppearance`, `xExtents`, `xGrid`, `xScaleProvider`, `yGrid`

### `docs/lib/charts/CandleStickChartWithEdge.js`

- Classes:
  - `CandleStickChartWithEdge`
- Top-level variables:
  - `calculatedData`, `ema20`, `ema50`, `end`, `smaVolume70`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithEquidistantChannel.js`

- Classes:
  - `CandleStickChartWithEquidistantChannel`
- Top-level variables:
  - `calculatedData`, `channels_1`, `channels_3`, `ema12`, `ema26`, `end`, `keyCode`, `macdAppearance`, `macdCalculator`, `start`, `state`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithFibonacciInteractiveIndicator.js`

- Classes:
  - `CandleStickChartWithFibonacciInteractiveIndicator`
- Top-level variables:
  - `calculatedData`, `ema12`, `ema26`, `end`, `keyCode`, `macdAppearance`, `macdCalculator`, `retracements_1`, `retracements_3`, `smaVolume50`, `start`, `state`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithForceIndexIndicator.js`

- Classes:
  - `CandleStickChartWithForceIndexIndicator`
- Top-level variables:
  - `calculatedData`, `end`, `fi`, `fiEMA13`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithFullStochasticsIndicator.js`

- Classes:
  - `CandleStickChartWithFullStochasticsIndicator`
- Top-level variables:
  - `calculatedData`, `ema20`, `ema50`, `end`, `fastSTO`, `fullSTO`, `gridHeight`, `gridWidth`, `height`, `margin`, `showGrid`, `slowSTO`, `start`, `stoAppearance`, `xExtents`, `xGrid`, `xScaleProvider`, `yGrid`

### `docs/lib/charts/CandleStickChartWithGannFan.js`

- Classes:
  - `CandleStickChartWithGannFan`
- Top-level variables:
  - `end`, `fans`, `keyCode`, `start`, `state`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithHoverTooltip.js`

- Classes:
  - `CandleStickChartWithHoverTooltip`
- Functions:
  - `tooltipContent`
- Top-level variables:
  - `calculatedData`, `dateFormat`, `ema20`, `ema50`, `end`, `keyValues`, `margin`, `newItem`, `numberFormat`, `numberOfDeletion`, `randomKey`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithInteractiveIndicator.js`

- Classes:
  - `CandlestickChart`
- Top-level variables:
  - `CandleStickChartWithInteractiveIndicator`, `calculatedData`, `ema12`, `ema26`, `end`, `keyCode`, `macdAppearance`, `macdCalculator`, `start`, `state`, `trends_1`, `trends_3`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithInteractiveYCoordinate.js`

- Classes:
  - `CandleStickChartWithInteractiveYCoordinate`, `Dialog`
- Functions:
  - `round`
- Top-level variables:
  - `CandleStickChart`, `alert`, `alertDragged`, `buy`, `calculatedData`, `chartId`, `d`, `end`, `first`, `independentCharts`, `key`, `keyCode`, `list`, `macdAppearance`, `macdCalculator`, `morePropsForChart`, `newAlert`, `newAlertList`, `sell`, `start`, `state`, `xExtents`, `xScaleProvider`, `yCoordinateList`, `yValue`

### `docs/lib/charts/CandleStickChartWithMA.js`

- Classes:
  - `CandleStickChartWithMA`
- Top-level variables:
  - `calculatedData`, `ema20`, `ema50`, `end`, `sma20`, `smaVolume50`, `start`, `tma20`, `wma20`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithMACDIndicator.js`

- Classes:
  - `CandleStickChartWithMACDIndicator`
- Top-level variables:
  - `calculatedData`, `ema12`, `ema26`, `macdAppearance`, `macdCalculator`, `mouseEdgeAppearance`, `smaVolume50`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithPriceMarkers.js`

- Classes:
  - `CandleStickChartWithPriceMarkers`
- Top-level variables:
  - `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithRSIIndicator.js`

- Classes:
  - `CandleStickChartWithRSIIndicator`
- Top-level variables:
  - `atr14`, `calculatedData`, `ema12`, `ema26`, `end`, `rsiCalculator`, `smaVolume50`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithSAR.js`

- Classes:
  - `CandleStickChartWithSAR`
- Top-level variables:
  - `accelerationFactor`, `calculatedData`, `defaultSar`, `end`, `maxAccelerationFactor`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithStandardDeviationChannel.js`

- Classes:
  - `CandleStickChartWithStandardDeviationChannel`
- Top-level variables:
  - `channels_1`, `end`, `keyCode`, `start`, `state`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithText.js`

- Classes:
  - `CandleStickChartWithText`, `Dialog`
- Top-level variables:
  - `CandleStickChart`, `allButLast`, `calculatedData`, `end`, `first`, `independentCharts`, `keyCode`, `lastText`, `macdAppearance`, `macdCalculator`, `morePropsForChart`, `newText`, `position`, `start`, `state`, `textList`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickChartWithUpdatingData.js`

- Top-level variables:
  - `CandleStickChartWithUpdatingData`

### `docs/lib/charts/CandleStickChartWithZoomPan.js`

- Classes:
  - `CandleStickChartWithZoomPan`
- Top-level variables:
  - `end`, `gridHeight`, `gridWidth`, `height`, `margin`, `showGrid`, `start`, `xExtents`, `xGrid`, `xScaleProvider`, `yGrid`

### `docs/lib/charts/CandleStickStockScaleChart.js`

- Classes:
  - `CandleStickStockScaleChart`
- Top-level variables:
  - `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickStockScaleChartWithVolumeBarV1.js`

- Classes:
  - `CandleStickStockScaleChartWithVolumeBarV1`
- Top-level variables:
  - `end`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickStockScaleChartWithVolumeBarV2.js`

- Classes:
  - `CandleStickStockScaleChartWithVolumeBarV2`
- Top-level variables:
  - `end`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/CandleStickStockScaleChartWithVolumeBarV3.js`

- Classes:
  - `CandleStickStockScaleChartWithVolumeBarV3`
- Top-level variables:
  - `end`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/ChartWithAxis.js`

- Classes:
  - `ChartWithAxis`
- Top-level variables:
  - `end`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/GroupedBarChart.js`

- Classes:
  - `GroupedBarChart`
- Functions:
  - `fill`
- Top-level variables:
  - `f`

### `docs/lib/charts/HeikinAshi.js`

- Classes:
  - `HeikinAshi`
- Top-level variables:
  - `calculatedData`, `ema20`, `ema50`, `end`, `ha`, `smaVolume50`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/HorizontalBarChart.js`

- Classes:
  - `HorizontalBarChart`

### `docs/lib/charts/HorizontalStackedBarChart.js`

- Classes:
  - `HorizontalStackedBarChart`
- Functions:
  - `fill`
- Top-level variables:
  - `f`

### `docs/lib/charts/interactiveutils.js`

- Functions:
  - `getInteractiveNodes`, `handleSelection`, `saveInteractiveNode`, `saveInteractiveNodes`
- Top-level variables:
  - `interactive`, `key`

### `docs/lib/charts/Kagi.js`

- Classes:
  - `Kagi`
- Top-level variables:
  - `calculatedData`, `end`, `kagiCalculator`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/KagiWithUpdatingData.js`

- Top-level variables:
  - `KagiWithUpdatingData`

### `docs/lib/charts/LineAndScatterChart.js`

- Classes:
  - `LineAndScatterChart`
- Top-level variables:
  - `xExtents`, `xScaleProvider`

### `docs/lib/charts/LineAndScatterChartGrid.js`

- Classes:
  - `LineAndScatterChartGrid`
- Top-level variables:
  - `Series`, `end`, `gridHeight`, `gridWidth`, `height`, `margin`, `showGrid`, `start`, `xExtents`, `xGrid`, `xScaleProvider`, `yGrid`

### `docs/lib/charts/MovingAverageCrossOverAlgorithmV1.js`

- Classes:
  - `MovingAverageCrossOverAlgorithmV1`
- Top-level variables:
  - `buySell`, `calculatedData`, `defaultAnnotationProps`, `ema20`, `ema50`, `end`, `height`, `longAnnotationProps`, `margin`, `shortAnnotationProps`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/MovingAverageCrossOverAlgorithmV2.js`

- Classes:
  - `MovingAverageCrossOverAlgorithmV2`
- Top-level variables:
  - `buySell`, `calculatedData`, `defaultAnnotationProps`, `ema20`, `ema50`, `end`, `height`, `longAnnotationProps`, `margin`, `shortAnnotationProps`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/OHLCChartWithElderImpulseIndicator.js`

- Classes:
  - `OHLCChartWithElderImpulseIndicator`
- Top-level variables:
  - `calculatedData`, `changeCalculator`, `elderImpulseCalculator`, `ema12`, `end`, `macdAppearance`, `macdCalculator`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/OHLCChartWithElderRayIndicator.js`

- Classes:
  - `OHLCChartWithElderRayIndicator`
- Top-level variables:
  - `calculatedData`, `changeCalculator`, `elder`, `end`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/PointAndFigure.js`

- Classes:
  - `PointAndFigure`
- Top-level variables:
  - `calculatedData`, `end`, `pAndF`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/PointAndFigureWithUpdatingData.js`

- Top-level variables:
  - `PointAndFigureWithUpdatingData`

### `docs/lib/charts/Renko.js`

- Classes:
  - `Renko`
- Top-level variables:
  - `calculatedData`, `end`, `renkoCalculator`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/RenkoWithUpdatingData.js`

- Top-level variables:
  - `RenkoWithUpdatingData`

### `docs/lib/charts/StackedBarChart.js`

- Classes:
  - `StackedBarChart`
- Functions:
  - `fill`
- Top-level variables:
  - `f`

### `docs/lib/charts/updatingDataWrapper.js`

- Classes:
  - `UpdatingComponentHOC`
- Functions:
  - `getDisplayName`
- Top-level variables:
  - `LENGTH`, `delta`, `keyCode`, `name`

### `docs/lib/charts/VolumeProfileBySessionChart.js`

- Classes:
  - `VolumeProfileBySessionChart`
- Top-level variables:
  - `calculatedData`, `changeCalculator`, `end`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/charts/VolumeProfileChart.js`

- Classes:
  - `VolumeProfileChart`
- Top-level variables:
  - `calculatedData`, `changeCalculator`, `end`, `start`, `xExtents`, `xScaleProvider`

### `docs/lib/content-section.js`

- Classes:
  - `ContentSection`

### `docs/lib/main-container.js`

- Classes:
  - `MainContainer`

### `docs/lib/menu-group.js`

- Classes:
  - `MenuGroup`

### `docs/lib/MenuItem.js`

- Classes:
  - `MenuItem`
- Top-level variables:
  - `className`

### `docs/lib/navbar.js`

- Classes:
  - `Nav`

### `docs/lib/page/AnnotationsPage.js`

- Classes:
  - `AnnotationsPage`

### `docs/lib/page/AreaChartPage.js`

- Classes:
  - `OverviewPage`

### `docs/lib/page/AxisPage.js`

- Classes:
  - `AxisPage`

### `docs/lib/page/BarChartPage.js`

- Classes:
  - `BarChartPage`

### `docs/lib/page/BollingerBandOverlayPage.js`

- Classes:
  - `BollingerBandOverlayPage`

### `docs/lib/page/BrushSupportPage.js`

- Classes:
  - `BrushSupportPage`

### `docs/lib/page/BubbleChartPage.js`

- Classes:
  - `BubbleChartPage`

### `docs/lib/page/CandleStickChartPage.js`

- Classes:
  - `CandleStickChartPage`

### `docs/lib/page/ChangeLogPage.js`

- Classes:
  - `ChangeLogPage`

### `docs/lib/page/ClickHandlerCallbackPage.js`

- Classes:
  - `ClickHandlerCallbackPage`

### `docs/lib/page/ComingSoonPage.js`

- Classes:
  - `ComingSoonPage`

### `docs/lib/page/CompareWithPage.js`

- Classes:
  - `CompareWithPage`

### `docs/lib/page/DarkThemePage.js`

- Classes:
  - `DarkThemePage`
- Top-level variables:
  - `container`

### `docs/lib/page/EdgeCoordinatesPage.js`

- Classes:
  - `EdgeCoordinatesPage`

### `docs/lib/page/ElderImpulseIndicatorPage.js`

- Classes:
  - `ElderImpulseIndicatorPage`

### `docs/lib/page/ElderRayIndicatorPage.js`

- Classes:
  - `ElderRayIndicatorPage`

### `docs/lib/page/EquidistantChannelPage.js`

- Classes:
  - `EquidistantChannelPage`

### `docs/lib/page/EquityIntraDayDataPage.js`

- Classes:
  - `IntraDayContinuousDataPage`

### `docs/lib/page/FibonacciInteractiveIndicatorPage.js`

- Classes:
  - `FibonacciInteractiveIndicatorPage`

### `docs/lib/page/ForceIndexIndicatorPage.js`

- Classes:
  - `ForceIndexIndicatorPage`

### `docs/lib/page/GannFanPage.js`

- Classes:
  - `GannFanPage`

### `docs/lib/page/GettingStartedPage.js`

- Classes:
  - `GettingStartedPage`

### `docs/lib/page/GridPage.js`

- Classes:
  - `GridPage`
- Top-level variables:
  - `options`

### `docs/lib/page/GroupedBarChartPage.js`

- Classes:
  - `GroupedBarChartPage`

### `docs/lib/page/HeikinAshiPage.js`

- Classes:
  - `HeikinAshiPage`

### `docs/lib/page/HorizontalBarChartPage.js`

- Classes:
  - `HorizontalBarChartPage`

### `docs/lib/page/HorizontalStackedBarChartPage.js`

- Classes:
  - `HorizontalBarChartPage`

### `docs/lib/page/InteractiveYCoordinatePage.js`

- Classes:
  - `InteractiveYCoordinatePage`

### `docs/lib/page/IntraDayContinuousDataPage.js`

- Classes:
  - `IntraDayContinuousDataPage`

### `docs/lib/page/KagiPage.js`

- Classes:
  - `KagiPage`

### `docs/lib/page/LineAndScatterChartPage.js`

- Classes:
  - `LineAndScatterChartPage`

### `docs/lib/page/LoadMoreDataPage.js`

- Classes:
  - `LoadMoreDataPage`

### `docs/lib/page/LotsOfDataPage.js`

- Classes:
  - `LotsOfDataPage`

### `docs/lib/page/MACDIndicatorPage.js`

- Classes:
  - `MACDIndicatorPage`

### `docs/lib/page/MAOverlayPage.js`

- Classes:
  - `MAOverlayPage`

### `docs/lib/page/MiscChartsPage.js`

- Classes:
  - `MiscChartsPage`

### `docs/lib/page/MouseFollowingTooltipPage.js`

- Classes:
  - `MouseFollowingTooltipPage`

### `docs/lib/page/MousePointerPage.js`

- Classes:
  - `MousePointerPage`

### `docs/lib/page/MovingAverageCrossoverAlgorithmPage.js`

- Classes:
  - `AnnotationsPage`

### `docs/lib/page/MovingAverageCrossoverAlgorithmPage2.js`

- Classes:
  - `MovingAverageCrossoverAlgorithmPage2`

### `docs/lib/page/OverviewPage.js`

- Classes:
  - `OverviewPage`

### `docs/lib/page/PointAndFigurePage.js`

- Classes:
  - `PointAndFigurePage`

### `docs/lib/page/PriceMarkerPage.js`

- Classes:
  - `PriceMarkerPage`

### `docs/lib/page/RenkoPage.js`

- Classes:
  - `RenkoPage`

### `docs/lib/page/RSIIndicatorPage.js`

- Classes:
  - `RSIIndicatorPage`

### `docs/lib/page/SARIndicatorPage.js`

- Classes:
  - `ForceIndexIndicatorPage`

### `docs/lib/page/StackedBarChartPage.js`

- Classes:
  - `StackedBarChartPage`

### `docs/lib/page/StandardDeviationChannelPage.js`

- Classes:
  - `EquidistantChannelPage`

### `docs/lib/page/StochasticIndicatorPage.js`

- Classes:
  - `StochasticIndicatorPage`
- Top-level variables:
  - `container`

### `docs/lib/page/SvgVsCanvasPage.js`

- Classes:
  - `SvgVsCanvasPage`

### `docs/lib/page/TextPage.js`

- Classes:
  - `TextPage`

### `docs/lib/page/TrendLineInteractiveIndicatorPage.js`

- Classes:
  - `TrendLineInteractiveIndicatorPage`
- Top-level variables:
  - `container`

### `docs/lib/page/UpdatingDataPage.js`

- Classes:
  - `UpdatingDataPage`

### `docs/lib/page/UpdatingDataPageForCandleStick.js`

- Classes:
  - `UpdatingDataPageForCandleStick`

### `docs/lib/page/VolumeBarPage.js`

- Classes:
  - `VolumeBarPage`

### `docs/lib/page/VolumeProfileBySessionPage.js`

- Classes:
  - `VolumeProfileBySessionPage`

### `docs/lib/page/VolumeProfilePage.js`

- Classes:
  - `VolumeProfilePage`

### `docs/lib/page/ZoomAndPanPage.js`

- Classes:
  - `ZoomAndPanPage`
- Top-level variables:
  - `value`, `zoomAnchor`

### `docs/lib/row.js`

- Classes:
  - `Row`
- Top-level variables:
  - `anchor`, `title`

### `docs/lib/section.js`

- Classes:
  - `Section`
- Top-level variables:
  - `className`, `title`

### `docs/lib/serverside/example.js`

- Top-level variables:
  - `Chart`, `MSFT`, `ReStock`, `React`, `ReactServer`, `delimiter`, `each`, `fs`, `item`, `length`, `parseDate`, `rd`, `svg`

### `docs/lib/sidebar.js`

- Classes:
  - `SideBar`

### `docs/pageTemplate.js`

- Functions:
  - `getDevServerJs`, `getDocumentationContent`, `getExternalAssets`, `getIndexContent`

### `react-stockcharts-examples/examples/AreaChart/src/Chart.js`

- Classes:
  - `AreaChart`
- Top-level variables:
  - `canvasGradient`

### `react-stockcharts-examples/examples/AreaChart/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/AreaChart/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/AreaChartWithYPercent/src/Chart.js`

- Classes:
  - `AreaChartWithYPercent`

### `react-stockcharts-examples/examples/AreaChartWithYPercent/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/AreaChartWithYPercent/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/AreaChartWithZoomPan/src/Chart.js`

- Classes:
  - `AreaChartWithEdge`
- Top-level variables:
  - `end`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/AreaChartWithZoomPan/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/AreaChartWithZoomPan/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/BarChart/src/Chart.js`

- Classes:
  - `BarChart`
- Top-level variables:
  - `data`

### `react-stockcharts-examples/examples/BarChart/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/BarChart/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `promiseBarData`

### `react-stockcharts-examples/examples/BubbleChart/src/Chart.js`

- Classes:
  - `BubbleChart`
- Functions:
  - `fill`, `radius`
- Top-level variables:
  - `data`, `f`, `r`

### `react-stockcharts-examples/examples/BubbleChart/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/BubbleChart/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `promiseBubbleData`

### `react-stockcharts-examples/examples/CandleStickChart/src/Chart.js`

- Classes:
  - `CandleStickChart`
- Functions:
  - `xAccessor`
- Top-level variables:
  - `xExtents`

### `react-stockcharts-examples/examples/CandleStickChart/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChart/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartForContinuousIntraDay/src/Chart.js`

- Classes:
  - `CandleStickChartForContinuousIntraDay`
- Functions:
  - `xAccessor`
- Top-level variables:
  - `end`, `start`, `xExtents`

### `react-stockcharts-examples/examples/CandleStickChartForContinuousIntraDay/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartForContinuousIntraDay/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDateTime`, `promiseIntraDayContinuous`

### `react-stockcharts-examples/examples/CandleStickChartForDiscontinuousIntraDay/src/Chart.js`

- Classes:
  - `CandleStickChartForDiscontinuousIntraDay`
- Top-level variables:
  - `end`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartForDiscontinuousIntraDay/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartForDiscontinuousIntraDay/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `promiseIntraDayDiscontinuous`

### `react-stockcharts-examples/examples/CandleStickChartPanToLoadMore/src/Chart.js`

- Classes:
  - `CandleStickChartPanToLoadMore`
- Functions:
  - `getMaxUndefined`
- Top-level variables:
  - `LENGTH_TO_SHOW`, `calculatedData`, `dataToCalculate`, `ema12`, `ema26`, `indexCalculator`, `macdAppearance`, `macdCalculator`, `maxWindowSize`, `rowsToDownload`, `smaVolume50`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartPanToLoadMore/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartPanToLoadMore/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithAnnotation/src/Chart.js`

- Classes:
  - `CandleStickChartWithAnnotation`
- Top-level variables:
  - `annotationProps`, `end`, `height`, `margin`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithAnnotation/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithAnnotation/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithBollingerBandOverlay/src/Chart.js`

- Classes:
  - `CandleStickChartWithBollingerBandOverlay`
- Top-level variables:
  - `bb`, `bbFill`, `bbStroke`, `calculatedData`, `ema20`, `ema50`, `end`, `sma20`, `smaVolume50`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithBollingerBandOverlay/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithBollingerBandOverlay/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithBrush/src/Chart.js`

- Classes:
  - `CandlestickChart`
- Top-level variables:
  - `BRUSH_TYPE`, `CandleStickChartWithBrush`, `calculatedData`, `ema12`, `ema26`, `end`, `high`, `keyCode`, `left`, `low`, `macdAppearance`, `macdCalculator`, `right`, `smaVolume50`, `start`, `xExtents`, `xScaleProvider`, `yExtents1`, `yExtents3`

### `react-stockcharts-examples/examples/CandleStickChartWithBrush/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithBrush/src/interactiveutils.js`

- Functions:
  - `getInteractiveNodes`, `handleSelection`, `saveInteractiveNode`, `saveInteractiveNodes`
- Top-level variables:
  - `interactive`, `key`

### `react-stockcharts-examples/examples/CandleStickChartWithBrush/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithCHMousePointer/src/Chart.js`

- Classes:
  - `CandleStickChartWithCHMousePointer`
- Top-level variables:
  - `end`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithCHMousePointer/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithCHMousePointer/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithClickHandlerCallback/src/Chart.js`

- Classes:
  - `CandlestickChart`
- Top-level variables:
  - `CandleStickChartWithClickHandlerCallback`, `calculatedData`, `ema12`, `ema26`, `end`, `macdAppearance`, `macdCalculator`, `smaVolume50`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithClickHandlerCallback/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithClickHandlerCallback/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithCompare/src/Chart.js`

- Classes:
  - `CandleStickChartWithCompare`
- Top-level variables:
  - `compareCalculator`, `end`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithCompare/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithCompare/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseCompare`

### `react-stockcharts-examples/examples/CandleStickChartWithDarkTheme/src/Chart.js`

- Classes:
  - `CandleStickChartWithDarkTheme`
- Top-level variables:
  - `bb`, `bbAppearance`, `calculatedData`, `ema20`, `ema50`, `end`, `fastSTO`, `fullSTO`, `gridHeight`, `gridWidth`, `height`, `margin`, `showGrid`, `slowSTO`, `start`, `stoAppearance`, `xExtents`, `xGrid`, `xScaleProvider`, `yGrid`

### `react-stockcharts-examples/examples/CandleStickChartWithDarkTheme/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithDarkTheme/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithEdge/src/Chart.js`

- Classes:
  - `CandleStickChartWithEdge`
- Top-level variables:
  - `calculatedData`, `ema20`, `ema50`, `end`, `smaVolume70`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithEdge/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithEdge/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithEquidistantChannel/src/Chart.js`

- Classes:
  - `CandleStickChartWithEquidistantChannel`
- Top-level variables:
  - `calculatedData`, `channels_1`, `channels_3`, `ema12`, `ema26`, `end`, `keyCode`, `macdAppearance`, `macdCalculator`, `start`, `state`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithEquidistantChannel/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithEquidistantChannel/src/interactiveutils.js`

- Functions:
  - `getInteractiveNodes`, `handleSelection`, `saveInteractiveNode`, `saveInteractiveNodes`
- Top-level variables:
  - `interactive`, `key`

### `react-stockcharts-examples/examples/CandleStickChartWithEquidistantChannel/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithFibonacciInteractiveIndicator/src/Chart.js`

- Classes:
  - `CandleStickChartWithFibonacciInteractiveIndicator`
- Top-level variables:
  - `calculatedData`, `ema12`, `ema26`, `end`, `keyCode`, `macdAppearance`, `macdCalculator`, `retracements_1`, `retracements_3`, `smaVolume50`, `start`, `state`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithFibonacciInteractiveIndicator/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithFibonacciInteractiveIndicator/src/interactiveutils.js`

- Functions:
  - `getInteractiveNodes`, `handleSelection`, `saveInteractiveNode`, `saveInteractiveNodes`
- Top-level variables:
  - `interactive`, `key`

### `react-stockcharts-examples/examples/CandleStickChartWithFibonacciInteractiveIndicator/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithForceIndexIndicator/src/Chart.js`

- Classes:
  - `CandleStickChartWithForceIndexIndicator`
- Top-level variables:
  - `calculatedData`, `end`, `fi`, `fiEMA13`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithForceIndexIndicator/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithForceIndexIndicator/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithFullStochasticsIndicator/src/Chart.js`

- Classes:
  - `CandleStickChartWithFullStochasticsIndicator`
- Top-level variables:
  - `calculatedData`, `ema20`, `ema50`, `end`, `fastSTO`, `fullSTO`, `gridHeight`, `gridWidth`, `height`, `margin`, `showGrid`, `slowSTO`, `start`, `stoAppearance`, `xExtents`, `xGrid`, `xScaleProvider`, `yGrid`

### `react-stockcharts-examples/examples/CandleStickChartWithFullStochasticsIndicator/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithFullStochasticsIndicator/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithGannFan/src/Chart.js`

- Classes:
  - `CandleStickChartWithGannFan`
- Top-level variables:
  - `end`, `fans`, `keyCode`, `start`, `state`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithGannFan/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithGannFan/src/interactiveutils.js`

- Functions:
  - `getInteractiveNodes`, `handleSelection`, `saveInteractiveNode`, `saveInteractiveNodes`
- Top-level variables:
  - `interactive`, `key`

### `react-stockcharts-examples/examples/CandleStickChartWithGannFan/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithHoverTooltip/src/Chart.js`

- Classes:
  - `CandleStickChartWithHoverTooltip`
- Functions:
  - `tooltipContent`
- Top-level variables:
  - `calculatedData`, `dateFormat`, `ema20`, `ema50`, `end`, `keyValues`, `margin`, `newItem`, `numberFormat`, `numberOfDeletion`, `randomKey`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithHoverTooltip/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithHoverTooltip/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithInteractiveIndicator/src/Chart.js`

- Classes:
  - `CandlestickChart`
- Top-level variables:
  - `CandleStickChartWithInteractiveIndicator`, `calculatedData`, `ema12`, `ema26`, `end`, `keyCode`, `macdAppearance`, `macdCalculator`, `start`, `state`, `trends_1`, `trends_3`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithInteractiveIndicator/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithInteractiveIndicator/src/interactiveutils.js`

- Functions:
  - `getInteractiveNodes`, `handleSelection`, `saveInteractiveNode`, `saveInteractiveNodes`
- Top-level variables:
  - `interactive`, `key`

### `react-stockcharts-examples/examples/CandleStickChartWithInteractiveIndicator/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithInteractiveYCoordinate/src/Chart.js`

- Classes:
  - `CandleStickChartWithInteractiveYCoordinate`, `Dialog`
- Functions:
  - `round`
- Top-level variables:
  - `CandleStickChart`, `alert`, `alertDragged`, `buy`, `calculatedData`, `chartId`, `d`, `end`, `first`, `independentCharts`, `key`, `keyCode`, `list`, `macdAppearance`, `macdCalculator`, `morePropsForChart`, `newAlert`, `newAlertList`, `sell`, `start`, `state`, `xExtents`, `xScaleProvider`, `yCoordinateList`, `yValue`

### `react-stockcharts-examples/examples/CandleStickChartWithInteractiveYCoordinate/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithInteractiveYCoordinate/src/interactiveutils.js`

- Functions:
  - `getInteractiveNodes`, `handleSelection`, `saveInteractiveNode`, `saveInteractiveNodes`
- Top-level variables:
  - `interactive`, `key`

### `react-stockcharts-examples/examples/CandleStickChartWithInteractiveYCoordinate/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithMA/src/Chart.js`

- Classes:
  - `CandleStickChartWithMA`
- Top-level variables:
  - `calculatedData`, `ema20`, `ema50`, `end`, `sma20`, `smaVolume50`, `start`, `tma20`, `wma20`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithMA/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithMA/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithMACDIndicator/src/Chart.js`

- Classes:
  - `CandleStickChartWithMACDIndicator`
- Top-level variables:
  - `calculatedData`, `ema12`, `ema26`, `macdAppearance`, `macdCalculator`, `mouseEdgeAppearance`, `smaVolume50`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithMACDIndicator/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithMACDIndicator/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithPriceMarkers/src/Chart.js`

- Classes:
  - `CandleStickChartWithPriceMarkers`
- Top-level variables:
  - `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithPriceMarkers/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithPriceMarkers/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithRSIIndicator/src/Chart.js`

- Classes:
  - `CandleStickChartWithRSIIndicator`
- Top-level variables:
  - `atr14`, `calculatedData`, `ema12`, `ema26`, `end`, `rsiCalculator`, `smaVolume50`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithRSIIndicator/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithRSIIndicator/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithSAR/src/Chart.js`

- Classes:
  - `CandleStickChartWithSAR`
- Top-level variables:
  - `accelerationFactor`, `calculatedData`, `defaultSar`, `end`, `maxAccelerationFactor`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithSAR/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithSAR/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithStandardDeviationChannel/src/Chart.js`

- Classes:
  - `CandleStickChartWithStandardDeviationChannel`
- Top-level variables:
  - `channels_1`, `end`, `keyCode`, `start`, `state`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithStandardDeviationChannel/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithStandardDeviationChannel/src/interactiveutils.js`

- Functions:
  - `getInteractiveNodes`, `handleSelection`, `saveInteractiveNode`, `saveInteractiveNodes`
- Top-level variables:
  - `interactive`, `key`

### `react-stockcharts-examples/examples/CandleStickChartWithStandardDeviationChannel/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithText/src/Chart.js`

- Classes:
  - `CandleStickChartWithText`, `Dialog`
- Top-level variables:
  - `CandleStickChart`, `allButLast`, `calculatedData`, `end`, `first`, `independentCharts`, `keyCode`, `lastText`, `macdAppearance`, `macdCalculator`, `morePropsForChart`, `newText`, `position`, `start`, `state`, `textList`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithText/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithText/src/interactiveutils.js`

- Functions:
  - `getInteractiveNodes`, `handleSelection`, `saveInteractiveNode`, `saveInteractiveNodes`
- Top-level variables:
  - `interactive`, `key`

### `react-stockcharts-examples/examples/CandleStickChartWithText/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithUpdatingData/src/CandleStickChartWithMACDIndicator.js`

- Classes:
  - `CandleStickChartWithMACDIndicator`
- Top-level variables:
  - `calculatedData`, `ema12`, `ema26`, `macdAppearance`, `macdCalculator`, `mouseEdgeAppearance`, `smaVolume50`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickChartWithUpdatingData/src/Chart.js`

- Top-level variables:
  - `CandleStickChartWithUpdatingData`

### `react-stockcharts-examples/examples/CandleStickChartWithUpdatingData/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithUpdatingData/src/updatingDataWrapper.js`

- Classes:
  - `UpdatingComponentHOC`
- Functions:
  - `getDisplayName`
- Top-level variables:
  - `LENGTH`, `delta`, `keyCode`, `name`

### `react-stockcharts-examples/examples/CandleStickChartWithUpdatingData/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickChartWithZoomPan/src/Chart.js`

- Classes:
  - `CandleStickChartWithZoomPan`
- Top-level variables:
  - `end`, `gridHeight`, `gridWidth`, `height`, `margin`, `showGrid`, `start`, `xExtents`, `xGrid`, `xScaleProvider`, `yGrid`

### `react-stockcharts-examples/examples/CandleStickChartWithZoomPan/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickChartWithZoomPan/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickStockScaleChart/src/Chart.js`

- Classes:
  - `CandleStickStockScaleChart`
- Top-level variables:
  - `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickStockScaleChart/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickStockScaleChart/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickStockScaleChartWithVolumeBarV1/src/Chart.js`

- Classes:
  - `CandleStickStockScaleChartWithVolumeBarV1`
- Top-level variables:
  - `end`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickStockScaleChartWithVolumeBarV1/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickStockScaleChartWithVolumeBarV1/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickStockScaleChartWithVolumeBarV2/src/Chart.js`

- Classes:
  - `CandleStickStockScaleChartWithVolumeBarV2`
- Top-level variables:
  - `end`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickStockScaleChartWithVolumeBarV2/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickStockScaleChartWithVolumeBarV2/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/CandleStickStockScaleChartWithVolumeBarV3/src/Chart.js`

- Classes:
  - `CandleStickStockScaleChartWithVolumeBarV3`
- Top-level variables:
  - `end`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/CandleStickStockScaleChartWithVolumeBarV3/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/CandleStickStockScaleChartWithVolumeBarV3/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/GroupedBarChart/src/Chart.js`

- Classes:
  - `GroupedBarChart`
- Functions:
  - `fill`
- Top-level variables:
  - `f`

### `react-stockcharts-examples/examples/GroupedBarChart/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/GroupedBarChart/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `promiseBarData`

### `react-stockcharts-examples/examples/HeikinAshi/src/Chart.js`

- Classes:
  - `HeikinAshi`
- Top-level variables:
  - `calculatedData`, `ema20`, `ema50`, `end`, `ha`, `smaVolume50`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/HeikinAshi/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/HeikinAshi/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/HorizontalBarChart/src/Chart.js`

- Classes:
  - `HorizontalBarChart`

### `react-stockcharts-examples/examples/HorizontalBarChart/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/HorizontalBarChart/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `promiseBarData`

### `react-stockcharts-examples/examples/HorizontalStackedBarChart/src/Chart.js`

- Classes:
  - `HorizontalStackedBarChart`
- Functions:
  - `fill`
- Top-level variables:
  - `f`

### `react-stockcharts-examples/examples/HorizontalStackedBarChart/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/HorizontalStackedBarChart/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `promiseBarData`

### `react-stockcharts-examples/examples/Kagi/src/Chart.js`

- Classes:
  - `Kagi`
- Top-level variables:
  - `calculatedData`, `end`, `kagiCalculator`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/Kagi/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/Kagi/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/KagiWithUpdatingData/src/Chart.js`

- Top-level variables:
  - `KagiWithUpdatingData`

### `react-stockcharts-examples/examples/KagiWithUpdatingData/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/KagiWithUpdatingData/src/Kagi.js`

- Classes:
  - `Kagi`
- Top-level variables:
  - `calculatedData`, `end`, `kagiCalculator`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/KagiWithUpdatingData/src/updatingDataWrapper.js`

- Classes:
  - `UpdatingComponentHOC`
- Functions:
  - `getDisplayName`
- Top-level variables:
  - `LENGTH`, `delta`, `keyCode`, `name`

### `react-stockcharts-examples/examples/KagiWithUpdatingData/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/LineAndScatterChart/src/Chart.js`

- Classes:
  - `LineAndScatterChart`
- Top-level variables:
  - `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/LineAndScatterChart/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/LineAndScatterChart/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseCompare`

### `react-stockcharts-examples/examples/LineAndScatterChartGrid/src/Chart.js`

- Classes:
  - `LineAndScatterChartGrid`
- Top-level variables:
  - `Series`, `end`, `gridHeight`, `gridWidth`, `height`, `margin`, `showGrid`, `start`, `xExtents`, `xGrid`, `xScaleProvider`, `yGrid`

### `react-stockcharts-examples/examples/LineAndScatterChartGrid/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/LineAndScatterChartGrid/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/MovingAverageCrossOverAlgorithmV1/src/Chart.js`

- Classes:
  - `MovingAverageCrossOverAlgorithmV1`
- Top-level variables:
  - `buySell`, `calculatedData`, `defaultAnnotationProps`, `ema20`, `ema50`, `end`, `height`, `longAnnotationProps`, `margin`, `shortAnnotationProps`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/MovingAverageCrossOverAlgorithmV1/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/MovingAverageCrossOverAlgorithmV1/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/MovingAverageCrossOverAlgorithmV2/src/Chart.js`

- Classes:
  - `MovingAverageCrossOverAlgorithmV2`
- Top-level variables:
  - `buySell`, `calculatedData`, `defaultAnnotationProps`, `ema20`, `ema50`, `end`, `height`, `longAnnotationProps`, `margin`, `shortAnnotationProps`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/MovingAverageCrossOverAlgorithmV2/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/MovingAverageCrossOverAlgorithmV2/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/OHLCChartWithElderImpulseIndicator/src/Chart.js`

- Classes:
  - `OHLCChartWithElderImpulseIndicator`
- Top-level variables:
  - `calculatedData`, `changeCalculator`, `elderImpulseCalculator`, `ema12`, `end`, `macdAppearance`, `macdCalculator`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/OHLCChartWithElderImpulseIndicator/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/OHLCChartWithElderImpulseIndicator/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/OHLCChartWithElderRayIndicator/src/Chart.js`

- Classes:
  - `OHLCChartWithElderRayIndicator`
- Top-level variables:
  - `calculatedData`, `changeCalculator`, `elder`, `end`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/OHLCChartWithElderRayIndicator/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/OHLCChartWithElderRayIndicator/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/PointAndFigure/src/Chart.js`

- Classes:
  - `PointAndFigure`
- Top-level variables:
  - `calculatedData`, `end`, `pAndF`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/PointAndFigure/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/PointAndFigure/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/PointAndFigureWithUpdatingData/src/Chart.js`

- Top-level variables:
  - `PointAndFigureWithUpdatingData`

### `react-stockcharts-examples/examples/PointAndFigureWithUpdatingData/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/PointAndFigureWithUpdatingData/src/PointAndFigure.js`

- Classes:
  - `PointAndFigure`
- Top-level variables:
  - `calculatedData`, `end`, `pAndF`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/PointAndFigureWithUpdatingData/src/updatingDataWrapper.js`

- Classes:
  - `UpdatingComponentHOC`
- Functions:
  - `getDisplayName`
- Top-level variables:
  - `LENGTH`, `delta`, `keyCode`, `name`

### `react-stockcharts-examples/examples/PointAndFigureWithUpdatingData/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/Renko/src/Chart.js`

- Classes:
  - `Renko`
- Top-level variables:
  - `calculatedData`, `end`, `renkoCalculator`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/Renko/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/Renko/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/RenkoWithUpdatingData/src/Chart.js`

- Top-level variables:
  - `RenkoWithUpdatingData`

### `react-stockcharts-examples/examples/RenkoWithUpdatingData/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/RenkoWithUpdatingData/src/Renko.js`

- Classes:
  - `Renko`
- Top-level variables:
  - `calculatedData`, `end`, `renkoCalculator`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/RenkoWithUpdatingData/src/updatingDataWrapper.js`

- Classes:
  - `UpdatingComponentHOC`
- Functions:
  - `getDisplayName`
- Top-level variables:
  - `LENGTH`, `delta`, `keyCode`, `name`

### `react-stockcharts-examples/examples/RenkoWithUpdatingData/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/StackedBarChart/src/Chart.js`

- Classes:
  - `StackedBarChart`
- Functions:
  - `fill`
- Top-level variables:
  - `f`

### `react-stockcharts-examples/examples/StackedBarChart/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/StackedBarChart/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/VolumeProfileBySessionChart/src/Chart.js`

- Classes:
  - `VolumeProfileBySessionChart`
- Top-level variables:
  - `calculatedData`, `changeCalculator`, `end`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/VolumeProfileBySessionChart/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/VolumeProfileBySessionChart/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/examples/VolumeProfileChart/src/Chart.js`

- Classes:
  - `VolumeProfileChart`
- Top-level variables:
  - `calculatedData`, `changeCalculator`, `end`, `start`, `xExtents`, `xScaleProvider`

### `react-stockcharts-examples/examples/VolumeProfileChart/src/index.js`

- Classes:
  - `ChartComponent`

### `react-stockcharts-examples/examples/VolumeProfileChart/src/utils.js`

- Functions:
  - `getData`, `parseData`
- Top-level variables:
  - `parseDate`, `promiseMSFT`

### `react-stockcharts-examples/scripts/buildexamples.js`

- Classes:
  - `ChartComponent`
- Functions:
  - `getData`, `parseData`, `publish`, `remove`
- Top-level variables:
  - `args`, `barData`, `base`, `bubbleData`, `comparison`, `continuous`, `destDir`, `destExample`, `discontinuous`, `endOfDayMSFT`, `examplesToPublish`, `fse`, `groupedBarData`, `horizontalBarData`, `horizontalGroupedBarData`, `index`, `mode`, `parseData`, `parseDate`, `parseDateTime`, `path`, `promiseBarData`, `promiseBubbleData`, `promiseCompare`, `promiseIntraDayContinuous`, `promiseIntraDayDiscontinuous`, `promiseMSFT`, `srcDir`, `srcExample`, `template`, `templatePackage`

### `scripts/parseIntraday.js`

- Functions:
  - `buildRow`
- Top-level variables:
  - `fs`, `oneMin`, `rd`, `stack`, `startTime`, `target`, `ticker`

### `scripts/release.js`

- Top-level variables:
  - `buildPackage`, `fs`, `origPackage`, `path`, `pkg`, `root`

### `scripts/updateVersion.js`

- Top-level variables:
  - `fs`, `indexjs`, `packageJson`, `path`, `root`, `shell`, `version`

### `src/csv.d.ts`

- Top-level variables:
  - `content`

### `src/d3-format.d.ts`

- Functions:
  - `format`, `timeFormat`

### `src/demo/__tests__/chartRange.test.ts`

- Functions:
  - `buildBars`
- Top-level variables:
  - `data`

### `src/demo/__tests__/demoData.test.ts`

- Functions:
  - `makeResponse`
- Top-level variables:
  - `bars`, `currentBars`, `fetchMock`, `firstPage`, `merged`, `olderBars`, `secondPage`

### `src/demo/__tests__/i18n.test.tsx`

- Functions:
  - `DemoI18nProbe`
- Top-level variables:
  - `DemoI18nBoundary`, `act`, `container`, `createRoot`, `originalConsoleError`, `probe`, `reactActEnvironment`, `root`, `setLanguageForTest`, `useDemoI18n`

### `src/demo/ChartPaneSplitter.tsx`

- Functions:
  - `handlePointerDown`, `handlePointerMove`, `stopDragging`
- Top-level variables:
  - `applyDragDeltaRef`, `availableRef`, `drag`, `dragRef`, `node`, `rootRef`, `totalDelta`

### `src/demo/chartRange.ts`

- Functions:
  - `normalizeDate`, `resolveChartRangeExtents`, `resolveChartRangeStart`, `subtractDays`, `subtractMonths`, `subtractYears`
- Top-level variables:
  - `CHART_RANGES`, `CHART_RANGE_LABEL_KEYS`, `DEFAULT_CHART_RANGE`, `dayOfMonth`, `first`, `last`, `lastDayOfMonth`, `next`, `rangeStart`, `single`

### `src/demo/demoData.ts`

- Functions:
  - `computeIndicators`, `fetchBinanceKlinePage`, `fetchHistoricalDemoBars`, `fetchLiveDemoBars`, `fetchLiveDemoData`, `formatBinanceKlineBars`, `formatBinanceKlines`, `getOfflineDemoBars`, `getOfflineDemoData`, `mergeBarsByDate`, `normalizeBars`, `parseCsvRow`, `parseDateTime`, `sortBars`, `toTimeValue`
- Top-level variables:
  - `BINANCE_BASE`, `BINANCE_INTERVAL_MAP`, `BINANCE_MAX_LIMIT`, `BOLLINGER_BAND_OPTIONS`, `DEMO_CANONICAL_SERIES`, `DEMO_WINDOW`, `bars`, `binanceInterval`, `deduped`, `endTimeValue`, `json`, `lastBar`, `merged`, `nextEndTime`, `pageBars`, `params`, `response`, `sorted`, `startTimeValue`, `url`

### `src/demo/DemoPageShell.tsx`

- Top-level variables:
  - `frameClassNameValue`, `pageClassName`

### `src/demo/FullDemo.tsx`

- Functions:
  - `FullDemoContent`, `LegendRow`, `MetricTile`, `createOrigin`, `formatSigned`, `getInitialExtents`, `handleBrush`, `handleResetView`, `handleResize`, `normalizeBrushExtents`, `updateWidth`
- Top-level variables:
  - `axisTheme`, `bearishColor`, `bollingerAppearance`, `bottomXAxisTheme`, `bullishColor`, `cancelled`, `chartData`, `chartHeight`, `chartSurfaceRef`, `controller`, `coordinateTheme`, `dateFormat`, `ema20Stroke`, `ema50Stroke`, `emaTrendUp`, `endDate`, `endIndex`, `gridWidth`, `integerFormat`, `latest`, `macdAppearance`, `macdHeight`, `macdOrigin`, `margin`, `node`, `observer`, `offlineData`, `overviewHeight`, `overviewOrigin`, `percentFormat`, `plotHeight`, `previous`, `priceChange`, `priceChangePercent`, `priceFormat`, `priceHeight`, `priceYAxisTheme`, `resolvedChartWidth`, `rsiAppearance`, `rsiOrigin`, `rsiPanelHeight`, `rsiValue`, `sign`, `sourceStatusLabel`, `sourceTone`, `startDate`, `startIndex`, `themeFontFamily`, `tooltipDisplayTexts`, `topXAxisTheme`, `volumeFormat`, `volumeHeight`, `volumeOrigin`, `volumeYAxisTheme`

### `src/demo/i18n.tsx`

- Functions:
  - `DemoI18nBoundary`, `DemoI18nProvider`, `interpolate`, `readStoredLanguage`, `translate`, `useDemoI18n`
- Top-level variables:
  - `DEMO_LANGUAGE_STORAGE_KEY`, `DemoI18nContext`, `context`, `defaultContextValue`, `getPaneLabel`, `key`, `paneLabelKeys`, `setLanguage`, `stored`, `t`, `template`, `translations`, `value`

### `src/demo/index.tsx`

- Top-level variables:
  - `container`, `root`

### `src/demo/LibraryShowcaseDemo.tsx`

- Functions:
  - `ToolIcon`, `clonePoint`, `formatBarsHeld`, `formatSignedPrice`, `getSelectedDrawingId`, `handleDrawingShortcuts`, `handleEscape`, `handler`, `isEditableTarget`, `isYAxisSide`, `loadDemoSettings`, `normalizeDate`, `paneTemplate`, `readSize`, `resolveDrawingPlacementForPane`, `saveDemoSettings`, `sortDrawings`
- Top-level variables:
  - `BACKFILL_MAX_PAGES`, `BACKFILL_PAGE_LIMIT`, `CHART_TYPES`, `CHART_TYPE_TO_SERIES`, `DEFAULT_DEMO_SETTINGS`, `DEFAULT_MAX_VISIBLE_PANES`, `DEMO_SETTINGS_STORAGE_KEY`, `DRAWING_PANEL_WIDTH`, `MAIN_PRICE_SERIES_TYPES`, `PERCENT_FORMAT`, `REPLAY_SPEEDS`, `TIMEFRAMES`, `TOOL_GROUPS`, `abortController`, `addPane`, `allPrices`, `applyDelta`, `available`, `averageBarsHeld`, `averagePnl`, `backfillDebounceRef`, `backfillInFlightRef`, `bestTrade`, `bringSelectedToFront`, `candleWidth`, `canvasBg`, `chartAdapter`, `chartData`, `chartMenuRef`, `chartRangeRef`, `chartReady`, `chartTypeLabel`, `clipboardDrawing`, `cloneSelectedDrawing`, `closeDrawingContextMenu`, `closePaperTradePosition`, `closeReplayContextMenu`, `closeSettings`, `closedTrade`, `controller`, `copySelectedDrawing`, `currentBars`, `currentItem`, `currentPosition`, `data`, `dateFormat`, `deleteDrawingById`, `desiredType`, `drawingClipboardRef`, `drawingContextMenuDrawing`, `drawingInspectorLabels`, `drawingInspectorPosition`, `drawingInteraction`, `drawingListPanelLabels`, `drawingListPosition`, `drawingPanelX`, `drawingStorage`, `drawingTextEditorLabels`, `earliestBar`, `enrichedData`, `ensureRangeHistory`, `file`, `first`, `firstBar`, `h`, `haCalc`, `handleAddPane`, `handleCancelTextEdit`, `handleChartRangeChange`, `handleChartTypeChange`, `handleClearDrawings`, `handleCloseDrawingInspector`, `handleCommitTextEdit`, `handleDrawingContextMenu`, `handleDrawingToolUsed`, `handleExportDrawings`, `handleImportButtonClick`, `handleImportFileChange`, `handleLoadDrawings`, `handlePaperTradeClick`, `handlePaperTradeReset`, `handleReplayContextMenu`, `handleReplayFromHere`, `handleReplayJumpLatest`, `handleReplayRewind`, `handleReplaySpeedChange`, `handleReplayStepBack`, `handleReplayStepForward`, `handleReplayToggle`, `handleResetSettings`, `handleStartTextEdit`, `handleVisibleDomainChange`, `importInputRef`, `indicatorLegendLabels`, `indicatorSeries`, `initialDemoSettings`, `innerHeight`, `innerWidth`, `isEditingText`, `lastBar`, `lastClick`, `lastPaperTradeClickRef`, `lastPaperTradeSignatureRef`, `lastVisibleBar`, `leftZ`, `liveDataRef`, `localizePane`, `localizedPane`, `losses`, `maxPrice`, `maxZ`, `minPrice`, `minZ`, `mountedRef`, `msg`, `nativeEvent`, `nextClone`, `nextDrawings`, `nextLabel`, `nextPaste`, `nextPosition`, `node`, `normalizeDomain`, `now`, `observer`, `offlineBars`, `olderBars`, `openSettings`, `pagesLoaded`, `paneH`, `paneHeaderLabels`, `paneHeights`, `paneLabel`, `paneState`, `paneTop`, `panesMenuRef`, `paperTradeJournal`, `paperTradePanelVisible`, `paperTradePositionRef`, `paperTradeRealizedPnl`, `paperTradeReportVisible`, `paperTradeSummary`, `paperTradeUnrealizedPnl`, `parsed`, `pasteCopiedDrawing`, `plotData`, `preferredSide`, `priceFormat`, `priceIsUp`, `priceOffset`, `pricePane`, `primary`, `ratio`, `raw`, `realizedPnl`, `rect`, `replayController`, `replayControllerRef`, `replayFinished`, `replayProgressLabel`, `replayToggleTitle`, `replayVisibleData`, `requestOlderHistoryPage`, `resetToDefault`, `rightZ`, `second`, `selectDrawingById`, `selectedDrawing`, `selectedDrawingId`, `selectedPane`, `sendSelectedToBack`, `shellNode`, `shellRef`, `shortcut`, `signature`, `sortedDrawings`, `stepPx`, `storageToolbarPosition`, `tagName`, `target`, `targetDrawing`, `targetSides`, `targetStart`, `timeOffset`, `timer`, `toggleDrawingVisibleById`, `toggleSelectedLock`, `toggleSelectedVisible`, `toolLabel`, `top`, `totalTrades`, `transformed`, `triggerBackfillDebounced`, `updateSelectedDrawing`, `visiblePanes`, `volumeFormat`, `w`, `widgetData`, `widgetMessages`, `wins`, `worstTrade`, `x`, `xExtents`, `y`

### `src/demo/LiveDemo.tsx`

- Functions:
  - `LiveDemoContent`
- Top-level variables:
  - `cancelled`, `height`, `margin`, `sourceLabel`, `width`

### `src/demo/OriginalLikeDemo.tsx`

- Functions:
  - `OriginalLikeDemoContent`, `createOrigin`, `ema12Accessor`, `ema26Accessor`, `handleBrush`, `handleResetView`, `handleResize`, `handleVisibleDomainChange`, `macdAccessor`, `updateWidth`, `xAxisTickFormat`
- Top-level variables:
  - `BRUSH_TYPE`, `EMA12_SERIES`, `EMA26_SERIES`, `MACD_SERIES`, `axisTheme`, `bearishColor`, `bullishColor`, `calculatedData`, `chartHeight`, `chartSurfaceRef`, `coordinateTheme`, `ema12Stroke`, `ema26Stroke`, `endIndex`, `initialXExtents`, `isZoomedIn`, `left`, `macdAppearance`, `macdDateFormat`, `macdFormat`, `macdFormat3`, `macdHeight`, `macdOrigin`, `macdYAxisTheme`, `macdYAxisTickFormat`, `macdYAxisTicks`, `margin`, `node`, `observer`, `priceFormat`, `priceFormat1`, `priceFormat3`, `priceHeight`, `priceYAxisTheme`, `priceYAxisTickFormat`, `priceYAxisTicks`, `rawData`, `resolvedChartWidth`, `right`, `smaVolume10`, `startIndex`, `themeFontFamily`, `tickDatum`, `tickIndex`, `tooltipDateFormat`, `tooltipDisplayTexts`, `visibleBars`, `visibleDomainLabel`, `volumeAxisFormat`, `volumeFormat`, `volumeHeight`, `volumeMouseFormat`, `volumeOrigin`, `volumeYAxisTheme`, `xScaleProvider`

### `src/demo/PaneSettingsModal.tsx`

- Functions:
  - `PaneSettingsModal`, `describeSeries`, `getIndicatorSetLabel`, `handleAddSeries`, `handleApplyIndicatorSet`, `handleBackdropMouseDown`, `handleDeleteIndicatorSet`, `handleDeletePane`, `handleImportIndicatorSetChange`, `handleImportIndicatorSetClick`, `handleKeyDown`, `handleSaveCurrentIndicatorSet`, `handleSeriesParamChange`, `paneLabel`, `parseNumber`, `renderField`, `renderIndicatorSetsSection`, `renderIndicatorsSection`, `renderLayoutSection`, `renderResetSection`, `renderSeriesParams`, `renderSetCard`, `renderThemeSection`
- Top-level variables:
  - `availableSeriesTypes`, `builtinSets`, `canAddPane`, `canMoveDown`, `canMoveUp`, `composerEntry`, `currentValue`, `dialogRef`, `entry`, `fast`, `fields`, `file`, `gridClassName`, `hidden`, `importInputRef`, `imported`, `indicatorSets`, `isDefaultPane`, `isSelected`, `label`, `next`, `nextSelectedPaneId`, `overLimit`, `rawValue`, `resolvedComposerType`, `revealEnabled`, `saved`, `sectionLabels`, `selectedPane`, `set`, `slow`, `userSets`, `visibleCount`, `visibleIndex`

### `src/demo/usePaneLayout.ts`

- Functions:
  - `applyDelta`, `loadRatio`, `pxToRatio`, `ratioToPx`, `sanitize`, `saveRatio`, `usePaneLayout`
- Top-level variables:
  - `DEFAULT_RATIO`, `LS_KEY`, `MIN_PX`, `PANE_MARGIN_V`, `applyDragDelta`, `available`, `k`, `momentumH`, `newA`, `newB`, `newMomentumH`, `newPriceH`, `newVolumeH`, `overflow`, `priceH`, `px`, `r`, `resetLayout`, `stored`, `sum`, `total`, `volumeH`

### `src/index.ts`

- Top-level variables:
  - `version`

### `src/lib/adapters/adapters.test.ts`

- Classes:
  - `MockSocket`
- Functions:
  - `createResponse`
- Top-level variables:
  - `adapter`, `bars`, `fetchMock`, `from`, `moreBars`, `onBar`, `onOrderbook`, `onTrade`, `sampleBars`, `sampleSymbols`, `symbols`, `to`, `unsubscribeBar`, `unsubscribeOrderbook`, `unsubscribeTrades`, `url`

### `src/lib/adapters/BaseAdapter.ts`

- Top-level variables:
  - `cached`, `fallbackOrigin`, `now`, `rawDate`, `response`, `url`, `value`

### `src/lib/adapters/DjangoVnstockAdapter.ts`

- Classes:
  - `DjangoVnstockAdapter`
- Functions:
  - `createRestAdapter`, `normalizeOrderbook`, `normalizeTrade`
- Top-level variables:
  - `cacheKey`, `params`, `rawBar`, `rawBars`, `rawSnapshot`, `rawTrade`, `socket`

### `src/lib/adapters/index.ts`

- No parseable top-level symbols found

### `src/lib/adapters/MockAdapter.ts`

- Classes:
  - `MockAdapter`
- Functions:
  - `cloneBar`, `createMockBars`, `createSampleBars`, `emitNext`, `emitSnapshot`, `emitTrade`
- Top-level variables:
  - `bar`, `bars`, `close`, `cursor`, `drift`, `high`, `low`, `normalizedQuery`, `open`, `snapshotIndex`, `timerId`, `tradeIndex`

### `src/lib/adapters/StockDataAdapter.ts`

- No parseable top-level symbols found

### `src/lib/algorithm/index.ts`

- Top-level variables:
  - `algorithm`, `calculator`, `defaultAlgorithm`, `newData`, `windowSize`

### `src/lib/annotation/Annotate.tsx`

- Classes:
  - `Annotate`
- Functions:
  - `helper`
- Top-level variables:
  - `data`

### `src/lib/annotation/BarAnnotation.tsx`

- Classes:
  - `BarAnnotation`
- Functions:
  - `getArrowForTextIcon`, `helper`
- Top-level variables:
  - `arrows`, `xFunc`, `yFunc`

### `src/lib/annotation/index.ts`

- Functions:
  - `buyPath`, `sellPath`
- Top-level variables:
  - `bottomWidth`, `halfWidth`, `height`

### `src/lib/annotation/Label.tsx`

- Classes:
  - `Label`
- Functions:
  - `drawOnCanvas`, `drawOnCanvas2`, `getText`, `getYScale`
- Top-level variables:
  - `radians`

### `src/lib/annotation/LabelAnnotation.tsx`

- Classes:
  - `LabelAnnotation`
- Functions:
  - `helper`
- Top-level variables:
  - `defaultProps`, `xFunc`, `yFunc`

### `src/lib/annotation/SvgPathAnnotation.tsx`

- Classes:
  - `SvgPathAnnotation`
- Functions:
  - `helper`
- Top-level variables:
  - `xFunc`, `yFunc`

### `src/lib/axes/Axis.tsx`

- Classes:
  - `Axis`
- Functions:
  - `Tick`, `axisLineSVG`, `axisTicksSVG`, `drawAxisLine`, `drawEachTick`, `drawEachTickLabel`, `drawTicks`, `tickHelper`
- Top-level variables:
  - `GenericChartComponentAny`, `baseFormat`, `baseTickValues`, `d`, `domain`, `format`, `nodes`, `result`, `sign`, `simulation`, `tickProps`, `tickSpacing`, `tickValues`, `ticks`, `x`, `xAxis`, `y`, `zip`, `zoomCapture`

### `src/lib/axes/AxisLine.tsx`

- Classes:
  - `AxisLine`
- Functions:
  - `d3_scaleExtent`, `d3_scaleRange`
- Top-level variables:
  - `d`, `sign`, `start`, `xAxis`

### `src/lib/axes/AxisTicks.tsx`

- Classes:
  - `AxisTicks`, `Tick`
- Functions:
  - `tickTransform_svg_axisX`, `tickTransform_svg_axisY`
- Top-level variables:
  - `baseFormat`, `format`, `origin`, `result`, `sign`, `tickSpacing`, `tickTransform`, `ticks`, `xAxis`

### `src/lib/axes/AxisZoomCapture.tsx`

- Classes:
  - `AxisZoomCapture`
- Top-level variables:
  - `center`, `cursor`, `diff`, `mouseXY`, `newDomain`, `startScale`, `startXY`, `tempRange`

### `src/lib/axes/index.ts`

- No parseable top-level symbols found

### `src/lib/axes/XAxis.tsx`

- Classes:
  - `XAxis`
- Functions:
  - `getXScale`, `helper`
- Top-level variables:
  - `axisLocation`, `moreProps`, `trueDomain`, `trueRange`, `x`, `y`

### `src/lib/axes/YAxis.tsx`

- Classes:
  - `YAxis`
- Functions:
  - `getYScale`, `helper`
- Top-level variables:
  - `axisLocation`, `trueDomain`, `trueRange`, `x`, `y`

### `src/lib/BackgroundText.tsx`

- Classes:
  - `BackgroundText`
- Top-level variables:
  - `contexts`, `interval`, `props`, `text`

### `src/lib/calculator/atr.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `atrAlgorithm`, `atrValue`, `d`, `newData`, `options`, `prev`, `prevATR`, `source`, `tr`, `trueRangeAlgorithm`

### `src/lib/calculator/bollingerband.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `avg`, `bollingerBandAlgorithm`, `meanAlgorithm`, `options`, `source`, `stdDev`, `tuples`, `zip`

### `src/lib/calculator/change.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `absoluteChange`, `algo`, `newData`, `options`, `percentChange`

### `src/lib/calculator/compare.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `b`, `base`, `compareData`, `first`, `firsts`, `options`, `result`

### `src/lib/calculator/defaultOptionsForComputation.ts`

- Top-level variables:
  - `ATR`, `BollingerBand`, `Change`, `Compare`, `EMA`, `ElderImpulse`, `ElderRay`, `ForceIndex`, `FullStochasticOscillator`, `Kagi`, `MACD`, `PointAndFigure`, `RSI`, `Renko`, `SAR`, `SMA`, `SmoothedForceIndex`, `TMA`, `WMA`

### `src/lib/calculator/elderRay.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `bearPower`, `bullPower`, `meanAlgorithm`, `newData`, `ohlc`, `options`, `zip`

### `src/lib/calculator/ema.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `alpha`, `initialAccumulator`, `initialValue`, `nextValue`, `options`, `previous`, `skip`, `source`, `v`

### `src/lib/calculator/forceIndex.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `forceIndex`, `forceIndexCalulator`, `options`, `source`, `volume`

### `src/lib/calculator/heikinAshi.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `algorithm`, `close`, `high`, `low`, `open`, `source`

### `src/lib/calculator/index.ts`

- No parseable top-level symbols found

### `src/lib/calculator/kagi.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `atrAlgorithm`, `atrCalculator`, `dateAccessor`, `dateMutator`, `dir`, `kagiData`, `line`, `nextChangePoint`, `nextLineOpen`, `options`, `prevPeak`, `priceMovement`, `reversalThreshold`, `source`, `startAs`

### `src/lib/calculator/macd.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `fastEMA`, `macdArray`, `macdCalculator`, `macdResult`, `options`, `signalArray`, `signalEMA`, `slowEMA`, `undefinedArray`, `zip`

### `src/lib/calculator/pointAndFigure.ts`

- Functions:
  - `calculator`, `createBox`, `updateColumns`
- Top-level variables:
  - `box`, `column`, `columnData`, `dateAccessor`, `dateMutator`, `downwardMovement`, `noOfBoxes`, `options`, `prevBoxClose`, `pricingMethod`, `source`, `upwardMovement`

### `src/lib/calculator/renko.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `atrAlgorithm`, `atrCalculator`, `brick`, `brickSize`, `dateAccessor`, `dateMutator`, `index`, `j`, `newBrick`, `noOfBricks`, `options`, `prevCloseToHigh`, `pricingMethod`, `renkoData`, `source`

### `src/lib/calculator/rsi.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `avgGain`, `avgLoss`, `change`, `gainsAndLosses`, `gainsAndLossesCalculator`, `now`, `options`, `prev`, `prevAvgGain`, `relativeStrength`, `rsiAlgorithm`, `rsiData`, `rsiValue`, `source`

### `src/lib/calculator/sar.ts`

- Functions:
  - `calc`, `calculator`
- Top-level variables:
  - `algorithm`, `calculatedData`, `current`, `fallingEp`, `fallingSar`, `options`, `risingEp`, `risingSar`, `use`

### `src/lib/calculator/sma.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `average`, `options`

### `src/lib/calculator/smoothedForceIndex.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `algo`, `force`, `forceMA`, `ma`, `merge`, `options`, `smoothed`, `underlyingAlgorithm`

### `src/lib/calculator/sto.ts`

- Functions:
  - `calculator`, `high`
- Top-level variables:
  - `currentClose`, `dData`, `dWindow`, `highestHigh`, `indicatorData`, `k`, `kData`, `kSmoothed`, `kWindow`, `lowestLow`, `options`, `source`, `stoAlgorithm`

### `src/lib/calculator/tma.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `n`, `options`, `total`, `triaverage`, `weight`

### `src/lib/calculator/wma.ts`

- Functions:
  - `calculator`
- Top-level variables:
  - `options`, `total`, `waverage`, `weight`

### `src/lib/CanvasContainer.tsx`

- Classes:
  - `CanvasContainer`
- Top-level variables:
  - `log`

### `src/lib/Chart.tsx`

- Functions:
  - `Chart`, `listener`
- Top-level variables:
  - `chartConfig`

### `src/lib/ChartCanvas.tsx`

- Classes:
  - `ChartCanvas`
- Functions:
  - `calculateFullData`, `calculateState`, `getCursorStyle`, `getDimensions`, `getXScaleDirection`, `resetChart`, `setXRange`, `shouldResetChart`, `updateChart`
- Top-level variables:
  - `CANDIDATES_FOR_RESET`, `c`, `candleWidth`, `canvases`, `chartConfig`, `contextValue`, `currentCharts`, `currentItem`, `cursor`, `cursorStyle`, `cx`, `dimensions`, `direction`, `dragableComponents`, `dx`, `endIndex`, `endValue`, `extent`, `firstItem`, `initialPlotData`, `interaction`, `item`, `lastItem`, `lastItemX`, `log`, `newDomain`, `newDomainExtent`, `newStart`, `nextVisibleRange`, `plotData`, `previousVisibleRange`, `renderContextValue`, `reset`, `response`, `result`, `s`, `sizeChanged`, `startIndex`, `startValue`, `state`, `tooltipStyle`, `updatedScale`, `updatedXScale`, `useWholeData`, `visibleRange`

### `src/lib/ChartContext.tsx`

- Functions:
  - `useChart`
- Top-level variables:
  - `ChartContext`, `ChartProvider`, `context`

### `src/lib/coordinates/CrossHairCursor.tsx`

- Classes:
  - `CrossHairCursor`
- Functions:
  - `customX`, `helper`
- Top-level variables:
  - `dashArray`, `line1`, `line2`, `lines`, `originX`, `originY`, `safeLines`, `x`

### `src/lib/coordinates/CurrentCoordinate.tsx`

- Classes:
  - `CurrentCoordinate`
- Functions:
  - `helper`
- Top-level variables:
  - `circle`, `fillColor`, `x`, `xValue`, `y`, `yValue`

### `src/lib/coordinates/Cursor.tsx`

- Classes:
  - `Cursor`
- Functions:
  - `customSnapX`
- Top-level variables:
  - `centerX`, `cursors`, `dashArray`, `originX`, `originY`, `safeCursors`, `shapeWidth`, `x`, `xCursor`, `xPos`, `xShape`, `xShapeFill`, `xShapeStroke`, `xValue`, `yCursor`

### `src/lib/coordinates/EdgeCoordinate.tsx`

- Classes:
  - `EdgeCoordinate`
- Functions:
  - `helper`
- Top-level variables:
  - `coordinateBase`, `edge`, `edgeCoordinate`, `edgeCoordinateBase`, `edgeLine`, `edgeXRect`, `line`, `path`, `textAnchor`, `x`, `y`

### `src/lib/coordinates/EdgeCoordinateV2.tsx`

- Functions:
  - `drawOnCanvas`, `helper`, `renderSVG`
- Top-level variables:
  - `coordinateBase`, `edge`, `edgeCoordinate`, `edgeCoordinateBase`, `edgeLine`, `edgeXRect`, `line`, `path`, `textAnchor`, `x`, `y`

### `src/lib/coordinates/EdgeCoordinateV3.tsx`

- Functions:
  - `drawOnCanvas`, `helper`, `renderSVG`, `roundRect`
- Top-level variables:
  - `coordinate`, `coordinateBase`, `dashArray`, `dy`, `edge`, `edgeCoordinate`, `edgeCoordinateBase`, `edgeLine`, `edgeXRect`, `halfHeight`, `line`, `path`, `textAnchor`, `width`, `x`, `y`

### `src/lib/coordinates/EdgeIndicator.tsx`

- Classes:
  - `EdgeIndicator`
- Functions:
  - `getEdge`, `helper`
- Top-level variables:
  - `edge`, `edgeX`, `item`, `props`, `x1`, `yValue`

### `src/lib/coordinates/index.ts`

- No parseable top-level symbols found

### `src/lib/coordinates/MouseCoordinateX.tsx`

- Classes:
  - `MouseCoordinateX`
- Functions:
  - `customX`, `helper`
- Top-level variables:
  - `coordinate`, `coordinateProps`, `edgeAt`, `hideLine`, `props`, `type`, `x`, `y1`

### `src/lib/coordinates/MouseCoordinateXV2.tsx`

- Classes:
  - `MouseCoordinateXV2`
- Functions:
  - `drawCoordinate`, `getXCoordinateInfo`, `xPosition`
- Top-level variables:
  - `defaultProps`, `halfWidth`, `height`, `pad`, `propTypes`, `shape`, `sign`, `t`, `textWidth`, `x`, `xValue`, `y`

### `src/lib/coordinates/MouseCoordinateY.tsx`

- Classes:
  - `MouseCoordinateY`
- Functions:
  - `getYCoordinate`, `helper`
- Top-level variables:
  - `coordinate`, `coordinateProps`, `edgeAt`, `hideLine`, `props`, `type`, `x1`, `y`

### `src/lib/coordinates/PriceCoordinate.tsx`

- Classes:
  - `PriceCoordinate`
- Functions:
  - `helper`
- Top-level variables:
  - `coordinate`, `coordinateProps`, `edgeAt`, `hideLine`, `props`, `show`, `type`, `x1`, `y`

### `src/lib/core/__tests__/gap1-viewport-event.test.tsx`

- Functions:
  - `createBars`, `createCanvasContextMock`, `createChartCanvasProps`, `createChartChildren`, `createDynamicChartProps`, `xAccessor`
- Top-level variables:
  - `Chart`, `ChartCanvas`, `DynamicChart`, `act`, `bars`, `canvasContext`, `close`, `consoleErrorSpy`, `container`, `createRoot`, `date`, `getContextSpy`, `onVisibleDomainChange`, `onVisibleRangeChange`, `open`, `pane`, `reactActEnvironment`, `root`, `xExtents`

### `src/lib/core/__tests__/gap2-canvas-overlay.test.tsx`

- Classes:
  - `Boundary`
- Functions:
  - `Probe`, `createBars`, `createCanvasContextMock`, `createRenderContext`
- Top-level variables:
  - `act`, `bars`, `canvas`, `canvasContext`, `caughtError`, `close`, `consoleErrorSpy`, `container`, `contextValue`, `createRoot`, `date`, `draw`, `events`, `getContextSpy`, `open`, `reactActEnvironment`, `root`

### `src/lib/core/__tests__/gap3-scroll-zoom-api.test.tsx`

- Functions:
  - `createBars`, `createCanvasContextMock`, `createDynamicChartProps`, `xAccessor`
- Top-level variables:
  - `ChartCanvas`, `DynamicChart`, `act`, `bars`, `canvasContext`, `chartRef`, `close`, `consoleErrorSpy`, `container`, `createRoot`, `date`, `getContextSpy`, `open`, `pane`, `reactActEnvironment`, `root`, `setXExtentsSpy`

### `src/lib/core/__tests__/IndicatorLegend.test.tsx`

- Functions:
  - `createPane`
- Top-level variables:
  - `IndicatorLegend`, `act`, `chips`, `container`, `createRoot`, `eyeButtons`, `onRemoveSeries`, `onToggleSeries`, `originalConsoleError`, `reactActEnvironment`, `removeButtons`, `root`

### `src/lib/core/__tests__/seriesValueResolver.test.ts`

- Functions:
  - `makeDatum`
- Top-level variables:
  - `accessors`, `datum`, `ema21`, `ema34`, `ema50`, `series`, `value`

### `src/lib/core/calculators/__tests__/enrichData.test.ts`

- Top-level variables:
  - `bar`, `bigData`, `cumulative`, `enriched`, `result`, `series`, `singleBar`, `startedAt`

### `src/lib/core/calculators/calcCVDApprox.ts`

- Functions:
  - `calcCVDApprox`
- Top-level variables:
  - `buyVol`, `cumulative`, `delta`, `range`, `sellVol`

### `src/lib/core/calculators/calcStrengthElder.ts`

- Functions:
  - `blankUntil`, `calcStrengthElder`
- Top-level variables:
  - `closes`, `ema`, `ema13`

### `src/lib/core/calculators/calcWhaleApprox.ts`

- Functions:
  - `calcWhaleApprox`
- Top-level variables:
  - `buyDollar`, `buyShare`, `dollarVolume`, `next`, `range`, `sellDollar`, `sellShare`

### `src/lib/core/calculators/enrichData.ts`

- Functions:
  - `enrichData`, `normalizeOptions`
- Top-level variables:
  - `indicatorValues`, `options`, `plan`, `result`

### `src/lib/core/calculators/fixtures/mockData.ts`

- Top-level variables:
  - `base`, `close`, `drift`, `high`, `low`, `mockOHLCV300`, `open`, `volume`

### `src/lib/core/calculators/indicatorComputation.ts`

- Functions:
  - `blankUntil`, `buildIndicatorComputationPlan`, `computeIndicatorComputationResult`, `defaultSeries`, `indicatorKey`, `materializeIndicatorValues`, `mergeBand`, `numberParam`
- Top-level variables:
  - `bbi`, `bbiEnabled`, `bollingerByKey`, `bollingerConfigs`, `closes`, `cvd`, `defaultBollingerKey`, `defaultBollingerSeries`, `defaultMacdKey`, `defaultMacdSeries`, `defaultWhaleKey`, `defaultWhaleSeries`, `emaByPeriod`, `emaPeriods`, `histogramLine`, `histogramValue`, `indicatorValues`, `key`, `macd`, `macdByKey`, `macdConfigs`, `macdLine`, `macdValue`, `obv`, `obvEnabled`, `rsiByPeriod`, `rsiPeriods`, `sarByKey`, `series`, `signalLine`, `signalValue`, `smaByPeriod`, `smaPeriods`, `strength`, `value`, `vrByPeriod`, `vrPeriods`, `whaleByKey`, `whaleThresholds`, `wrByPeriod`, `wrPeriods`

### `src/lib/core/calculators/types.ts`

- No parseable top-level symbols found

### `src/lib/core/canvas/ChartRenderContext.ts`

- Functions:
  - `useChartRenderContext`
- Top-level variables:
  - `ChartRenderContext`, `context`

### `src/lib/core/canvas/OverlayCanvas.tsx`

- Functions:
  - `OverlayCanvas`
- Top-level variables:
  - `canvas`, `canvasRef`, `context`, `physicalHeight`, `physicalWidth`, `renderContext`

### `src/lib/core/ChartPane.tsx`

- Functions:
  - `ChartPane`
- Top-level variables:
  - `chartScales`, `mainCanvasRef`, `mergedStyle`, `overlayCanvasRef`, `resolvedHeight`, `resolvedWidth`, `syncValue`

### `src/lib/core/ChartSplitter.tsx`

- Functions:
  - `ChartSplitter`, `handlePointerDown`, `handlePointerMove`, `stopDragging`
- Top-level variables:
  - `availableRef`, `cls`, `commitRef`, `drag`, `dragRef`, `node`, `rootRef`, `totalDelta`

### `src/lib/core/ChartTerminal.tsx`

- Functions:
  - `ChartTerminal`
- Top-level variables:
  - `mergedStyle`, `paneState`

### `src/lib/core/context/ChartSyncContext.ts`

- Functions:
  - `ChartSyncProvider`, `useChartSync`
- Top-level variables:
  - `ChartSyncContext`, `context`

### `src/lib/core/context/DataContext.ts`

- Functions:
  - `DataProvider`, `useDataContext`
- Top-level variables:
  - `DataContext`, `context`

### `src/lib/core/context/PaneManagerContext.ts`

- Functions:
  - `PaneManagerProvider`, `usePaneManagerContext`
- Top-level variables:
  - `PaneManagerContext`, `context`

### `src/lib/core/DynamicChart.tsx`

- Functions:
  - `accessor`, `axisFormatForSeriesTypes`, `buildChartSlots`, `buildPriceTooltipEntries`, `buildTooltipEntriesForSeries`, `buildYExtents`, `candleBodyWidth`, `computeExtentsForIndex`, `finiteExtent`, `origin`, `renderDynamicChartChildren`, `renderSeries`
- Top-level variables:
  - `BAR_SERIES_TYPES`, `DynamicChartComponent`, `INNER_PANE_GAP`, `OSCILLATOR_SERIES`, `PRICE_SERIES`, `VOLUME_SERIES`, `accessors`, `activeSeries`, `barCount`, `canvas`, `chartCanvasRef`, `chartChildren`, `chartId`, `chartSlots`, `clampedIndex`, `downColor`, `end`, `endDate`, `entry`, `extents`, `fillColor`, `finiteValues`, `first`, `fullData`, `gap`, `half`, `handleVisibleRangeChange`, `hasBottomAxis`, `hasLeftAxis`, `hasRightAxis`, `index`, `isInnerPane`, `isLastSlot`, `leftSeries`, `lineColor`, `maxValue`, `minValue`, `paneHeight`, `paneIndex`, `paneSlotCounter`, `params`, `ratio`, `rightSeries`, `second`, `seriesTypes`, `slotInPane`, `slots`, `start`, `startDate`, `stepPx`, `tooltip`, `tooltipY`, `type`, `upColor`, `whale`, `yAxisFormat`, `yExtents`, `yScaleId`

### `src/lib/core/hooks/__tests__/useDynamicPanes.test.ts`

- Functions:
  - `createMockStorage`
- Top-level variables:
  - `blocked`, `blockedPane`, `customPaneId`, `defaultState`, `hiddenPane`, `next`, `panes`, `payload`, `restoredPane`, `rsi`, `state`, `storage`, `sum`, `value`

### `src/lib/core/hooks/useCanvasResize.ts`

- Functions:
  - `updateSize`, `useCanvasResize`
- Top-level variables:
  - `element`, `observer`, `ref`

### `src/lib/core/hooks/useChartTheme.ts`

- Functions:
  - `useChartTheme`
- Top-level variables:
  - `STORAGE_KEY`, `setTheme`, `stored`, `toggleTheme`

### `src/lib/core/hooks/useDynamicPanes.ts`

- Functions:
  - `clonePane`, `clonePaneList`, `cloneSeries`, `createDefaultPaneLayout`, `createId`, `dynamicPanesReducer`, `getVisiblePanes`, `heightsToRatios`, `loadPaneLayout`, `makeDefaultLayout`, `mutateVisibleRatio`, `normalizeDefaultPane`, `normalizeLoadedPaneLayout`, `normalizeVisibleRatios`, `ratiosToHeights`, `readStoredPaneLayout`, `reorderVisiblePanes`, `replacePaneLayout`, `resolveSeriesIndex`, `sanitizeLayout`, `savePaneLayout`, `syncSplitScale`, `useDynamicPanes`, `validatePane`, `visibleCount`, `visibleIndices`, `writeStoredPaneLayout`
- Top-level variables:
  - `FRAME_VERTICAL_MARGIN`, `MIN_PANE_HEIGHT`, `activeSeries`, `addPane`, `addSeries`, `allocated`, `anyVisible`, `applyDelta`, `available`, `bottomHeight`, `bottomPane`, `byId`, `cloned`, `cursor`, `customPanes`, `defaultPanes`, `deletePane`, `height`, `heights`, `indices`, `layout`, `maxVisiblePanes`, `minBottom`, `minTop`, `next`, `nextBottom`, `nextLabel`, `nextTop`, `orderedVisible`, `pairTotal`, `pane`, `parsed`, `ratio`, `raw`, `removePane`, `removeSeries`, `renamePane`, `reorderPanes`, `replaceLayout`, `replacement`, `resetToDefault`, `restorePane`, `series`, `seriesIndex`, `stored`, `toggleSeriesVisible`, `toggleVisible`, `topHeight`, `topPane`, `total`, `updateSeriesParams`, `updateSeriesYAxis`, `updated`, `visible`, `visibleCursor`, `visiblePanes`, `visibleSlots`

### `src/lib/core/hooks/useIndicatorSets.ts`

- Functions:
  - `mergeSets`, `pickStorage`, `readFileAsText`, `useIndicatorSets`
- Top-level variables:
  - `allowedSeriesTypes`, `applySet`, `blob`, `builtinSets`, `deleteSet`, `exportSet`, `getSetById`, `importSet`, `imported`, `link`, `loaded`, `merged`, `nextSet`, `parsed`, `reader`, `removed`, `renameSet`, `renamed`, `saveCurrentAsSet`, `set`, `sets`, `storage`, `text`, `trimmed`, `url`

### `src/lib/core/hooks/usePaneManager.test.ts`

- Top-level variables:
  - `nextState`, `pricePane`, `volumePane`

### `src/lib/core/hooks/usePaneManager.ts`

- Functions:
  - `clampHeight`, `createPaneId`, `normalizePane`, `paneManagerReducer`, `usePaneManager`
- Top-level variables:
  - `addIndicator`, `addPane`, `normalizedPane`, `paneIdSeed`, `removeIndicator`, `removePane`, `resizePane`, `updateIndicator`

### `src/lib/core/hooks/usePaneSizes.ts`

- Functions:
  - `applyDeltaBetween`, `loadRatios`, `normalise`, `pxToRatios`, `ratiosToPx`, `sanitize`, `saveRatios`, `sum`, `usePaneSizes`
- Top-level variables:
  - `a`, `applyDelta`, `available`, `b`, `consumed`, `count`, `defaultRatios`, `defaultRatiosRef`, `heights`, `minA`, `minB`, `minH`, `minHRef`, `minTotal`, `n`, `newA`, `newB`, `px`, `reset`, `result`, `stored`, `sum`, `total`, `updated`

### `src/lib/core/index.ts`

- No parseable top-level symbols found

### `src/lib/core/IndicatorLegend.tsx`

- Functions:
  - `IndicatorLegend`, `seriesLabel`
- Top-level variables:
  - `PRIMARY_CHART_TYPES`, `SERIES_LABELS`, `base`, `chipStyle`, `chips`, `fast`, `hidden`, `seriesIndex`, `shortLabel`, `slow`

### `src/lib/core/PaneHeader.tsx`

- Functions:
  - `PaneHeader`
- Top-level variables:
  - `style`

### `src/lib/core/PaneLabel.tsx`

- Functions:
  - `PaneLabel`
- Top-level variables:
  - `style`

### `src/lib/core/PaneSplitter.tsx`

- Functions:
  - `PaneSplitter`, `clamp`, `handleMove`, `handlePointerDown`, `handleUp`
- Top-level variables:
  - `availableHeight`, `bottomPaneElement`, `deltaY`, `dragState`, `dragStateRef`, `mergedStyle`, `nextHeight`, `splitterElement`, `startTopHeight`, `topPaneElement`

### `src/lib/core/PaneTooltip.tsx`

- Functions:
  - `PaneTooltip`, `defaultDateValue`, `toDisplayValue`
- Top-level variables:
  - `chartConfigList`, `config`, `currentItem`, `lines`, `rawValue`, `renderSVG`, `resolvedOrigin`

### `src/lib/core/registry/__tests__/SeriesRegistry.test.ts`

- Top-level variables:
  - `entry`, `phaseOneTypes`, `registered`

### `src/lib/core/registry/registerAll.ts`

- Functions:
  - `initRegistry`

### `src/lib/core/registry/SeriesRegistry.ts`

- Functions:
  - `clearRegistry`, `colorFromConfig`, `getSeries`, `listRegistered`, `periodFromConfig`, `registerLineSeries`, `registerPhaseOneSeries`, `registerSeries`
- Top-level variables:
  - `entry`, `period`, `registry`

### `src/lib/core/replay/BarReplayController.test.ts`

- Functions:
  - `createBar`
- Top-level variables:
  - `controller`, `states`, `unsubscribe`

### `src/lib/core/replay/BarReplayController.ts`

- Classes:
  - `BarReplayController`
- Functions:
  - `clampIndex`, `intervalForSpeed`, `toTimeValue`
- Top-level variables:
  - `foundIndex`, `nextStartIndex`, `state`, `targetTime`

### `src/lib/core/scales/computeScales.ts`

- Functions:
  - `collectAxisExtents`, `computeScales`, `finiteExtent`, `mergeExtents`
- Top-level variables:
  - `computed`, `definition`, `extents`, `finiteValues`, `flattened`, `hasRightAxis`, `leftScale`, `leftSeriesExtents`, `leftValues`, `maxValue`, `minValue`, `rightScale`, `rightSeriesExtents`, `rightValues`

### `src/lib/core/SeriesPicker.tsx`

- Functions:
  - `SeriesPicker`, `buildDefaultSeries`, `handleKeyDown`, `handleMouseDown`, `updatePosition`
- Top-level variables:
  - `active`, `anchor`, `anchorRect`, `clickInsideAnchor`, `clickInsidePicker`, `container`, `containerRect`, `entry`, `picker`, `pickerRef`, `seriesTypes`, `target`

### `src/lib/core/seriesValueResolver.ts`

- Functions:
  - `asNumber`, `buildIndicatorSeriesKey`, `exactLegacyValue`, `numberParam`, `resolveSeriesDatumValue`, `resolveSeriesStructuredValue`, `resolveSeriesValue`, `resolveSeriesValueAccessors`
- Top-level variables:
  - `fast`, `key`, `period`, `signal`, `slow`, `stdDev`, `threshold`, `value`, `whale`

### `src/lib/core/sets/__tests__/indicatorSetCodec.test.ts`

- Functions:
  - `createMockStorage`
- Top-level variables:
  - `exported`, `imported`, `layout`, `loaded`, `next`, `original`, `payload`, `samplePane`, `savedSet`, `set`, `storage`, `value`

### `src/lib/core/sets/builtins.ts`

- Top-level variables:
  - `BUILTIN_INDICATOR_SETS`

### `src/lib/core/sets/indicatorSetCodec.ts`

- Functions:
  - `buildIndicatorSetFileName`, `cloneIndicatorSet`, `clonePane`, `cloneSeries`, `createId`, `createIndicatorSet`, `indicatorSetToPaneLayout`, `isPaneDescriptor`, `isPlainObject`, `isSeriesConfig`, `isSeriesTypeId`, `isTooltipMode`, `isYAxisSide`, `loadIndicatorSets`, `sanitizeIndicatorSet`, `sanitizeIndicatorSetsStorage`, `saveIndicatorSets`, `stringifyIndicatorSet`
- Top-level variables:
  - `allowed`, `byId`, `parsed`, `payload`, `raw`, `sanitized`, `slug`, `stamp`

### `src/lib/core/types/__tests__/pane-descriptor.test.ts`

- Top-level variables:
  - `ids`, `sum`, `visible`

### `src/lib/core/types/chart.ts`

- No parseable top-level symbols found

### `src/lib/core/types/index.ts`

- No parseable top-level symbols found

### `src/lib/core/types/indicator-catalog.ts`

- No parseable top-level symbols found

### `src/lib/core/types/indicator-set.ts`

- Top-level variables:
  - `INDICATOR_SETS_STORAGE_KEY`

### `src/lib/core/types/pane-descriptor.ts`

- Functions:
  - `isDefaultPaneId`
- Top-level variables:
  - `DEFAULT_PANES`, `DEFAULT_PANE_ID_SET`, `PANE_LAYOUT_STORAGE_KEY`, `PANE_MAX_VISIBLE`

### `src/lib/drawing/builtin/abcdPattern.ts`

- Functions:
  - `calculateAbcdPatternMetrics`
- Top-level variables:
  - `AbcdPattern`, `ab`, `bc`, `cd`, `points`

### `src/lib/drawing/builtin/arrow.ts`

- Top-level variables:
  - `Arrow`

### `src/lib/drawing/builtin/channel.ts`

- Top-level variables:
  - `Channel`

### `src/lib/drawing/builtin/dateAndPriceRange.ts`

- Top-level variables:
  - `DateAndPriceRange`

### `src/lib/drawing/builtin/extendedLine.ts`

- Top-level variables:
  - `ExtendedLine`

### `src/lib/drawing/builtin/fibArc.ts`

- Functions:
  - `calculateFibArcGeometry`
- Top-level variables:
  - `DEFAULT_FIB_ARC_LEVELS`, `FibArc`, `baseRadius`, `center`, `levels`, `reference`

### `src/lib/drawing/builtin/fibExtension.ts`

- Top-level variables:
  - `FIB_EXTENSION_LEVELS`, `FibExtension`

### `src/lib/drawing/builtin/fibonacci.ts`

- Top-level variables:
  - `Fibonacci`

### `src/lib/drawing/builtin/fibTimeZone.ts`

- Functions:
  - `calculateFibTimeZoneGeometry`
- Top-level variables:
  - `DEFAULT_FIB_TIME_ZONE_LEVELS`, `FibTimeZone`, `end`, `levels`, `start`, `stepX`

### `src/lib/drawing/builtin/hLine.ts`

- Top-level variables:
  - `HLine`

### `src/lib/drawing/builtin/longPosition.ts`

- Functions:
  - `calculateRiskReward`
- Top-level variables:
  - `LongPosition`, `updated`

### `src/lib/drawing/builtin/parallelChannel.ts`

- Functions:
  - `calculateParallelChannelGeometry`
- Top-level variables:
  - `ParallelChannel`, `dx`, `dy`, `end`, `length`, `normal`, `offsetAnchor`, `offsetDistance`, `start`

### `src/lib/drawing/builtin/pitchfork.ts`

- Functions:
  - `calculatePitchforkGeometry`
- Top-level variables:
  - `Pitchfork`, `leftSwing`, `midpoint`, `pivot`, `rightSwing`

### `src/lib/drawing/builtin/polyline.ts`

- Top-level variables:
  - `Polyline`

### `src/lib/drawing/builtin/ray.ts`

- Top-level variables:
  - `Ray`

### `src/lib/drawing/builtin/rectangle.ts`

- Top-level variables:
  - `Rectangle`

### `src/lib/drawing/builtin/regressionChannel.ts`

- Functions:
  - `calculateRegressionChannelMetrics`, `toTimeValue`
- Top-level variables:
  - `RegressionChannel`, `barTime`, `bars`, `closes`, `denominator`, `end`, `endPrice`, `endTime`, `endX`, `intercept`, `leftBar`, `meanY`, `n`, `rSquared`, `residuals`, `rightBar`, `slope`, `ssRes`, `ssTot`, `start`, `startPrice`, `startTime`, `startX`, `stdDev`, `sumX`, `sumXX`, `sumXY`, `sumY`, `xs`

### `src/lib/drawing/builtin/shortPosition.ts`

- Functions:
  - `calculateRiskReward`
- Top-level variables:
  - `ShortPosition`, `updated`

### `src/lib/drawing/builtin/text.ts`

- Top-level variables:
  - `Text`

### `src/lib/drawing/builtin/trendLine.ts`

- Top-level variables:
  - `TrendLine`

### `src/lib/drawing/builtin/vLine.ts`

- Top-level variables:
  - `VLine`

### `src/lib/drawing/clipboard.test.ts`

- Top-level variables:
  - `drawing`, `offset`, `snapshot`

### `src/lib/drawing/clipboard.ts`

- Functions:
  - `cloneDrawingSnapshot`, `offsetDrawingByPixels`
- Top-level variables:
  - `now`, `snapshot`

### `src/lib/drawing/contextMenu.test.tsx`

- Top-level variables:
  - `button`, `container`, `onClose`, `onSelect`, `reactActEnvironment`, `root`

### `src/lib/drawing/contextMenu.tsx`

- Functions:
  - `DrawingContextMenu`, `handleKeyDown`, `resolvePalette`
- Top-level variables:
  - `backdropStyle`, `itemListStyle`, `overlayStyle`, `palette`, `panelStyle`, `titleStyle`

### `src/lib/drawing/coordinateUtils.test.ts`

- Top-level variables:
  - `containerRect`, `pixel`, `point`, `scales`

### `src/lib/drawing/coordinateUtils.ts`

- Functions:
  - `chartPointToPixel`, `pixelToChartPoint`
- Top-level variables:
  - `localX`, `localY`

### `src/lib/drawing/drawing.test.ts`

- Functions:
  - `createTextObject`, `createTrendLineObject`
- Top-level variables:
  - `arrow`, `completeState`, `draft`, `drawing`, `drawingState`, `editingState`, `first`, `history`, `initialHistory`, `movingState`, `nextPoint`, `pushedHistory`, `rectangle`, `redoneHistory`, `resizingState`, `second`, `selectedState`, `serializedDrawing`, `serializedDrawings`, `serializedHistory`, `startPoint`, `text`, `tool`, `toolNames`, `trendLine`, `undoneHistory`, `updatedDraft`, `updatedState`

### `src/lib/drawing/DrawingInspector.test.tsx`

- Top-level variables:
  - `buttons`, `cancelButton`, `container`, `drawing`, `editButton`, `labels`, `onCancel`, `onChange`, `onCommit`, `onStartEdit`, `reactActEnvironment`, `root`, `saveButton`, `textLabels`, `textarea`

### `src/lib/drawing/DrawingInspector.tsx`

- Functions:
  - `isColorString`, `updateStyle`
- Top-level variables:
  - `left`, `locked`, `strokeDasharray`, `style`, `top`, `visible`

### `src/lib/drawing/DrawingLayer.hover.test.tsx`

- Top-level variables:
  - `actual`, `baseChartConfig`, `capturedProps`, `container`, `drawing`, `interaction`, `momentumChartConfig`, `onToolUsed`, `reactActEnvironment`, `root`, `xScale`

### `src/lib/drawing/DrawingLayer.test.ts`

- Top-level variables:
  - `line`, `moved`, `nextDrawings`, `position`, `untouched`

### `src/lib/drawing/DrawingLayer.tsx`

- Functions:
  - `buildRenderScales`, `calculatePositionRiskReward`, `constrainResizePoint`, `currentDrawing`, `findHitDrawing`, `getAdjustedMousePosition`, `getChartConfigList`, `getSelectedDrawingId`, `getSnapPoint`, `getVisibleDrawings`, `handleSelect`, `hasRemainingPlaceholder`, `isMultiStepTool`, `resizeDrawing`, `resizeDrawingsByIds`, `resolveActiveChartConfig`, `resolveBaseChartConfig`, `resolveDrawingChartConfig`, `sortVisibleDrawings`, `toChartPoint`, `toDrawingPoint`, `translateDrawing`, `translateDrawingsByIds`, `withChartTranslation`
- Top-level variables:
  - `adjustedMousePosition`, `anchorIndex`, `anchorPoint`, `baseChartConfig`, `baseDrawings`, `canDragSelectedDrawing`, `canvasOptions`, `chartConfig`, `chartConfigList`, `chartCursorClass`, `completed`, `constrainedPoint`, `currentChartPoint`, `currentCharts`, `currentMatch`, `dateValue`, `deltaX`, `deltaY`, `draft`, `draftChartConfig`, `dragPreviewRef`, `dragSessionRef`, `drawToCanvas`, `drawings`, `exactMatch`, `handleClick`, `handleContextMenu`, `handleDoubleClick`, `handleDrag`, `handleDragComplete`, `handleDragStart`, `handleHover`, `handleMouseDown`, `handleMouseMove`, `handleUnHover`, `hit`, `isHover`, `match`, `nativeEvent`, `nextSelectedIds`, `paneChartConfigs`, `pendingResizeHandleRef`, `plotData`, `point`, `previewDrawings`, `renderScales`, `resizeHandleIndex`, `resized`, `resolved`, `selectedCursorClass`, `selectedDrawing`, `selectedDrawingId`, `selectedObjectIdSet`, `selectedObjectIds`, `session`, `snap`, `snapRef`, `startChartPoint`, `startPoint`, `targetChartConfig`, `targetIndex`, `tool`, `toolName`, `updated`, `xValue`, `yValue`

### `src/lib/drawing/DrawingListPanel.tsx`

- Functions:
  - `formatDrawingLabel`, `formatTimestamp`
- Top-level variables:
  - `hidden`, `isSelected`, `left`, `locked`, `top`

### `src/lib/drawing/DrawingStorage.test.ts`

- Functions:
  - `createStorageMock`
- Top-level variables:
  - `adapter`, `drawing`, `payload`, `store`

### `src/lib/drawing/DrawingStorage.ts`

- Classes:
  - `DrawingImportError`
- Functions:
  - `createLocalStorageAdapter`, `getStorage`, `getStorageKey`, `isDrawingType`, `isPoint`, `isRecord`, `isRiskReward`, `isStyle`, `normalizeDasharray`, `normalizeDrawingObject`, `normalizeDrawings`
- Top-level variables:
  - `DRAWING_TOOL_TYPES`, `createdAt`, `normalized`, `raw`, `style`, `updatedAt`

### `src/lib/drawing/history.ts`

- Functions:
  - `cloneDrawings`, `createDrawingHistory`, `historyReducer`
- Top-level variables:
  - `nextPast`, `previousPresent`

### `src/lib/drawing/hitTest.ts`

- Functions:
  - `distanceToPolyline`, `distanceToSegment`, `getResizeHandleIndex`, `getTextBounds`, `hitTestAbcdPattern`, `hitTestChannelLike`, `hitTestDrawing`, `hitTestFibArc`, `hitTestFibTimeZone`, `hitTestFibonacciLike`, `hitTestLineLike`, `hitTestParallelChannel`, `hitTestPitchfork`, `hitTestPositionZones`, `hitTestRayLike`, `hitTestRectangleLike`, `hitTestRegressionChannel`, `pathBounds`, `pointInRect`, `toPixel`
- Top-level variables:
  - `best`, `bounds`, `clipped`, `distance`, `distanceFromCenter`, `dx`, `dy`, `end`, `fontSize`, `geometry`, `height`, `leftFork`, `length`, `lengthSquared`, `lower`, `maxX`, `maxY`, `median`, `metrics`, `middle`, `minX`, `minY`, `normal`, `offsetAnchor`, `offsetEnd`, `offsetStart`, `offsetVector`, `pixel`, `pixelDelta`, `pixels`, `point`, `priceDelta`, `rightFork`, `start`, `t`, `text`, `upper`, `width`, `x`, `x1`, `x2`, `xs`, `y`, `y1`, `y2`, `ys`

### `src/lib/drawing/index.ts`

- No parseable top-level symbols found

### `src/lib/drawing/m3.test.ts`

- Functions:
  - `createSimpleDrawing`
- Top-level variables:
  - `completed`, `dateAndPriceRange`, `deleted`, `draft`, `endPoint`, `extendedLine`, `extendedLineElements`, `fibExtension`, `first`, `flatPoint`, `initial`, `longPosition`, `names`, `options`, `polyline`, `preview`, `ray`, `scales`, `second`, `selected`, `shortPosition`, `startPoint`

### `src/lib/drawing/m4.test.ts`

- Functions:
  - `createSimpleDrawing`
- Top-level variables:
  - `abcd`, `drawing`, `endPoint`, `fibArc`, `fibTimeZone`, `metrics`, `midPoint`, `names`, `options`, `parallel`, `pitchfork`, `plotData`, `regression`, `regressionElements`, `scales`, `startPoint`

### `src/lib/drawing/measuring.test.ts`

- Top-level variables:
  - `moreProps`, `pixelPoint`, `plotData`, `point`, `summary`, `xScale`, `yScale`

### `src/lib/drawing/measuring.ts`

- Functions:
  - `measurementPointToPixel`, `resolveChartConfig`, `resolveMeasurementIndex`, `resolveMeasurementPoint`, `summarizeMeasurement`
- Top-level variables:
  - `bars`, `chartConfig`, `chartConfigList`, `closestItem`, `currentItem`, `dateValue`, `index`, `priceDelta`, `priceDeltaPercent`, `priceValue`, `x`, `xValue`, `y`

### `src/lib/drawing/priceLabel.test.ts`

- Top-level variables:
  - `drawing`

### `src/lib/drawing/priceLabel.tsx`

- Functions:
  - `DrawingPriceLabels`, `addPriceMarker`, `collectPointPriceMarkers`, `isFinitePrice`, `resolveDrawingPriceMarkers`, `resolveFibExtensionMarkers`, `resolveFibonacciMarkers`
- Top-level variables:
  - `firstPoint`, `labelFill`, `labelStroke`, `labelStrokeWidth`, `labelTextFill`, `lastPoint`, `levels`, `markers`, `normalized`, `priceDelta`, `riskReward`, `seen`

### `src/lib/drawing/registry.ts`

- Functions:
  - `createDraftFromTool`, `createTool`, `isDrawingToolName`, `listDrawingTools`, `registerDrawingTool`
- Top-level variables:
  - `drawingToolRegistry`, `tool`

### `src/lib/drawing/renderCanvas.ts`

- Functions:
  - `applyLineStyle`, `clipSegmentToBox`, `drawAbcdPattern`, `drawArrow`, `drawChannel`, `drawDateAndPriceRange`, `drawExtendedLine`, `drawFibArc`, `drawFibTimeZone`, `drawFibonacci`, `drawFilledRect`, `drawHLine`, `drawLine`, `drawLongPosition`, `drawParallelChannel`, `drawPitchfork`, `drawPolygonFill`, `drawPolyline`, `drawPolylineTool`, `drawPositionZones`, `drawRay`, `drawRectangle`, `drawRegressionChannel`, `drawSelectionHandles`, `drawShortPosition`, `drawStrokedRect`, `drawText`, `drawTextLabel`, `drawTrendLine`, `drawVLine`, `extendLineThroughBox`, `numberFormatter`, `renderDrawingToCanvas`, `strokeDasharrayForStyle`, `toPixel`
- Top-level variables:
  - `DEFAULT_FIB_EXTENSION_LEVELS`, `DEFAULT_FIB_LEVELS`, `badge`, `badgeStyle`, `bars`, `base`, `bottom`, `clipped`, `dashedStyle`, `distance`, `dx`, `dy`, `edges`, `end`, `entryY`, `extensionPrice`, `fill`, `fillAlpha`, `fillColor`, `geometry`, `handles`, `headLength`, `headWidth`, `height`, `left`, `leftFork`, `length`, `levels`, `lower`, `median`, `metrics`, `middle`, `normal`, `offsetAnchor`, `offsetEnd`, `offsetStart`, `offsetVector`, `percent`, `pixel`, `pixelDelta`, `pixels`, `point`, `price`, `priceDelta`, `px`, `py`, `r`, `ratio`, `ratioAB`, `ratioBC`, `reward`, `right`, `rightFork`, `risk`, `riskReward`, `slBounds`, `slFill`, `start`, `stopY`, `t0`, `t1`, `targetY`, `text`, `top`, `tpBounds`, `tpFill`, `upper`, `ux`, `uy`, `vector`, `width`, `x`, `y`

### `src/lib/drawing/renderSvg.test.ts`

- Functions:
  - `createExtendedDrawing`
- Top-level variables:
  - `arrow`, `circleElements`, `drawing`, `elements`, `lineElements`, `options`, `rectangle`, `scales`, `textElements`

### `src/lib/drawing/renderSvg.ts`

- Functions:
  - `circleElement`, `clipSegmentToBox`, `extendLineThroughBox`, `interactiveProps`, `lineElement`, `numberFormatter`, `pathElement`, `polygonElement`, `polylineElement`, `rectElement`, `renderAbcdPattern`, `renderArrow`, `renderChannel`, `renderDateAndPriceRange`, `renderDrawingToSvg`, `renderExtendedLine`, `renderFibArc`, `renderFibExtension`, `renderFibTimeZone`, `renderFibonacci`, `renderHLine`, `renderLineWithHandles`, `renderLongPosition`, `renderParallelChannel`, `renderPitchfork`, `renderPolyline`, `renderPositionZones`, `renderRay`, `renderRectangle`, `renderRegressionChannel`, `renderShortPosition`, `renderText`, `renderTrendLine`, `renderVLine`, `selectionHandles`, `strokeDasharrayForStyle`, `textElement`, `toPixel`
- Top-level variables:
  - `DEFAULT_FIB_EXTENSION_LEVELS`, `DEFAULT_FIB_LEVELS`, `arcs`, `badge`, `badgeProps`, `badgeText`, `bars`, `base`, `bottom`, `clipped`, `dashedStroke`, `distance`, `dx`, `dy`, `edges`, `element`, `elements`, `end`, `entryLine`, `entryY`, `extensionPrice`, `fill`, `geometry`, `headLength`, `headWidth`, `height`, `labels`, `left`, `leftFork`, `leftX`, `length`, `levels`, `line`, `lineProps`, `median`, `metrics`, `middle`, `negativeBoundary`, `normal`, `offsetAnchor`, `offsetEnd`, `offsetStart`, `offsetVector`, `path`, `percent`, `pixel`, `pixelDelta`, `pixels`, `point`, `polygon`, `positiveBoundary`, `price`, `priceDelta`, `px`, `py`, `r`, `ratio`, `ratioAB`, `ratioBC`, `rect`, `reward`, `right`, `rightFork`, `rightX`, `risk`, `riskReward`, `slZone`, `slZoneClass`, `start`, `stopLine`, `stopY`, `stroke`, `t0`, `t1`, `targetLine`, `targetY`, `text`, `top`, `tpZone`, `tpZoneClass`, `ux`, `uy`, `vector`, `width`, `x`, `y`

### `src/lib/drawing/serialization.ts`

- Functions:
  - `deserializeDrawingHistory`, `deserializeDrawingObject`, `deserializeDrawings`, `serializeDrawingHistory`, `serializeDrawingObject`, `serializeDrawings`

### `src/lib/drawing/shared.ts`

- Functions:
  - `appendPoint`, `clonePoint`, `createDrawingId`, `createDrawingObject`, `replaceNextPoint`, `replacePoint`
- Top-level variables:
  - `defaultDrawingStyle`, `drawingIdSeed`, `now`, `placeholderIndex`, `startPoint`, `targetIndex`

### `src/lib/drawing/shortcutMap.test.ts`

- No parseable top-level symbols found

### `src/lib/drawing/shortcutMap.ts`

- Functions:
  - `normalizeShortcutKey`, `resolveDrawingShortcut`
- Top-level variables:
  - `DRAWING_SHORTCUTS`, `hasModifier`, `key`

### `src/lib/drawing/snap.ts`

- Functions:
  - `findNearestBar`, `findSnapPoint`, `getDatumDate`, `pickEndpointSnap`, `toDate`
- Top-level variables:
  - `best`, `bestDistance`, `bestOhlc`, `candidates`, `date`, `distance`, `nearestBar`, `pixelPoint`, `pixelX`, `value`, `xAccessor`

### `src/lib/drawing/stateMachine.ts`

- Functions:
  - `drawingReducer`, `getSelectedObjectIds`, `normalizeSelectedObjectIds`, `selectionStateFor`
- Top-level variables:
  - `normalized`

### `src/lib/drawing/types.ts`

- No parseable top-level symbols found

### `src/lib/drawing/useDrawingInteraction.test.ts`

- Functions:
  - `DrawingInteractionProbe`, `createTrendLineDrawing`, `renderInteractionProbe`
- Top-level variables:
  - `completeState`, `container`, `currentInteraction`, `currentRoot`, `deletedSnapshot`, `drawing`, `drawingState`, `nextPoint`, `pushedState`, `reactActEnvironment`, `root`, `selectedSnapshot`, `selectedState`, `snapshot`, `snapshotPoints`, `startPoint`

### `src/lib/drawing/useDrawingInteraction.ts`

- Functions:
  - `cloneDrawingPoints`, `createDrawingInteractionState`, `deleteSelectedInteractionState`, `drawingInteractionReducer`, `getSelectedObjectIds`, `isHistoryAction`, `patchDrawing`, `replaceDrawingById`, `useDrawingInteraction`
- Top-level variables:
  - `cancelDrawing`, `deleteSelected`, `didChange`, `nextDrawings`, `nextHistory`, `redo`, `replaceDrawings`, `selectObject`, `selectedDrawings`, `selectedObjectIds`, `setSelectedObjects`, `startEditing`, `startMoving`, `startResizing`, `undo`, `updateDrawing`

### `src/lib/drawing/useDrawingStorage.ts`

- Functions:
  - `useDrawingStorage`
- Top-level variables:
  - `anchor`, `blob`, `clearAll`, `exportJSON`, `hydratedRef`, `importJSON`, `imported`, `loaded`, `payload`, `storage`, `timeoutId`, `url`

### `src/lib/EventCapture.test.tsx`

- Top-level variables:
  - `EventCapture`, `actual`, `capture`, `event`, `node`, `onClick`, `onDoubleClick`, `pointerMock`

### `src/lib/EventCapture.tsx`

- Classes:
  - `EventCapture`
- Top-level variables:
  - `className`, `currentCharts`, `dx`, `dxdy`, `dy`, `interactionProps`, `mouseXY`, `newPos`, `pan`, `touchXY`, `win`, `yZoom`, `zoomDir`

### `src/lib/GenericChartComponent.tsx`

- Classes:
  - `GenericChartComponent`
- Functions:
  - `GenericChartComponentWrapper`
- Top-level variables:
  - `ALWAYS_TRUE_TYPES`, `canvasOriginX`, `canvasOriginY`, `chartConfig`, `chartContext`, `chartId`

### `src/lib/GenericComponent.tsx`

- Classes:
  - `GenericComponent`
- Functions:
  - `getAxisCanvas`, `getMouseCanvas`
- Top-level variables:
  - `aliases`, `ctx`, `draggable`, `moreProps`, `newType`, `prevHover`, `proceed`, `style`, `suffix`, `type`

### `src/lib/helper/fitDimensions.tsx`

- Classes:
  - `ResponsiveComponent`
- Functions:
  - `getDimensions`, `getDisplayName`
- Top-level variables:
  - `backingStoreRatio`, `context`, `devicePixelRatio`, `dimensions`, `h`, `name`, `node`, `ratio`, `ref`, `w`

### `src/lib/helper/fitWidth.tsx`

- Classes:
  - `ResponsiveComponent`
- Functions:
  - `getDisplayName`
- Top-level variables:
  - `backingStoreRatio`, `context`, `devicePixelRatio`, `el`, `name`, `ratio`, `ref`, `w`

### `src/lib/helper/index.ts`

- No parseable top-level symbols found

### `src/lib/helper/SaveChartAsImage.ts`

- Top-level variables:
  - `SaveChartAsImage`, `a`, `canvas`, `canvasList`, `context`, `dx`, `dy`, `each`, `image`, `parent`, `rect`

### `src/lib/helper/TypeChooser.tsx`

- Classes:
  - `TypeChooser`

### `src/lib/indicator/atr.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicator/baseIndicator.ts`

- Functions:
  - `baseIndicator`
- Top-level variables:
  - `accessor`, `echo`, `fill`, `i`, `id`, `stroke`, `type`

### `src/lib/indicator/bollingerBand.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicator/change.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicator/compare.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicator/defaultOptionsForAppearance.ts`

- Top-level variables:
  - `BollingerBand`, `ElderImpulse`, `FullStochasticOscillator`, `MACD`, `themes`

### `src/lib/indicator/elderImpulse.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `currEMA`, `currMACDDivergence`, `indicator`, `macdSource`, `mergedAlgorithm`, `newData`, `prevEMA`, `prevMACDDivergence`, `underlyingAlgorithm`

### `src/lib/indicator/elderRay.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicator/ema.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicator/forceIndex.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicator/heikinAshi.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicator/index.ts`

- No parseable top-level symbols found

### `src/lib/indicator/kagi.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `underlyingAlgorithm`

### `src/lib/indicator/macd.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicator/pointAndFigure.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `underlyingAlgorithm`

### `src/lib/indicator/renko.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `underlyingAlgorithm`

### `src/lib/indicator/rsi.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicator/sar.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicator/sma.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicator/stochasticOscillator.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicator/tma.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicator/wma.ts`

- Top-level variables:
  - `ALGORITHM_TYPE`, `base`, `indicator`, `mergedAlgorithm`, `underlyingAlgorithm`

### `src/lib/indicators/builtin/__tests__/ce15.test.ts`

- Functions:
  - `makeBar`
- Top-level variables:
  - `bars`, `result`

### `src/lib/indicators/builtin/bbi.ts`

- Top-level variables:
  - `BBI`

### `src/lib/indicators/builtin/bollinger.ts`

- Top-level variables:
  - `BOLLINGER`

### `src/lib/indicators/builtin/cvd.ts`

- Top-level variables:
  - `CVD`, `cumulative`, `delta`

### `src/lib/indicators/builtin/ema.ts`

- Top-level variables:
  - `EMA`

### `src/lib/indicators/builtin/ma.ts`

- Top-level variables:
  - `MA`

### `src/lib/indicators/builtin/macd.ts`

- Top-level variables:
  - `MACD`

### `src/lib/indicators/builtin/obv.ts`

- Top-level variables:
  - `OBV`

### `src/lib/indicators/builtin/rsi.ts`

- Top-level variables:
  - `RSI`

### `src/lib/indicators/builtin/sar.ts`

- Top-level variables:
  - `SAR`

### `src/lib/indicators/builtin/sma.ts`

- Top-level variables:
  - `SMA`

### `src/lib/indicators/builtin/volume.ts`

- Top-level variables:
  - `VOLUME`

### `src/lib/indicators/builtin/vr.ts`

- Top-level variables:
  - `VR`

### `src/lib/indicators/builtin/wr.ts`

- Top-level variables:
  - `WR`

### `src/lib/indicators/index.ts`

- No parseable top-level symbols found

### `src/lib/indicators/overlays/WhaleBubbleOverlay.tsx`

- Functions:
  - `WhaleBubbleOverlay`
- Top-level variables:
  - `alpha`, `bar`, `barDate`, `barsByTimestamp`, `dateValue`, `draw`, `fillColor`, `radius`, `rawRadius`, `strokeColor`, `x`, `y`

### `src/lib/indicators/registry.test.ts`

- Top-level variables:
  - `bollingerIndicator`, `customIndicator`, `emaIndicator`, `macdIndicator`, `names`, `sampleBars`

### `src/lib/indicators/registry.ts`

- Functions:
  - `getIndicator`, `listIndicators`, `normalizeIndicatorName`, `registerIndicator`
- Top-level variables:
  - `indicatorRegistry`

### `src/lib/indicators/types.ts`

- No parseable top-level symbols found

### `src/lib/indicators/utils.ts`

- Functions:
  - `bbiSeries`, `bollingerSeries`, `collectNumbers`, `emaSeries`, `macdSeries`, `numericExtent`, `obvSeries`, `rollingStandardDeviation`, `rsiSeries`, `sarSeries`, `smaSeries`, `vrSeries`, `wrSeries`
- Top-level variables:
  - `af`, `averageGain`, `averageLoss`, `bar`, `change`, `close`, `current`, `delta`, `denom`, `deviation`, `divisor`, `ep`, `fastEma`, `finiteValues`, `gain`, `gainAverage`, `hh`, `histogram`, `isUpTrend`, `ll`, `loss`, `lossAverage`, `lower`, `ma12`, `ma24`, `ma3`, `ma6`, `macd`, `maxValue`, `mean`, `middle`, `minValue`, `prevSar`, `previousEma`, `relativeStrength`, `result`, `rollingSum`, `sar`, `series`, `signal`, `slice`, `slowEma`, `smoothing`, `startIndex`, `up`, `upper`, `variance`, `window`

### `src/lib/interactive/Brush.tsx`

- Classes:
  - `Brush`
- Top-level variables:
  - `dashArray`, `height`, `shouldBrush`, `width`, `x`, `x1y1`, `xValue`, `y`

### `src/lib/interactive/ClickCallback.tsx`

- Classes:
  - `ClickCallback`

### `src/lib/interactive/components/ChannelWithArea.tsx`

- Classes:
  - `ChannelWithArea`
- Functions:
  - `getLines`, `getPath`, `helper`
- Top-level variables:
  - `area`, `ctx`, `line`, `line1`, `line1Hovering`, `line2`, `line2Hovering`, `lines`, `x1`, `x2`, `y1`, `y2`

### `src/lib/interactive/components/ClickableCircle.tsx`

- Classes:
  - `ClickableCircle`
- Functions:
  - `helper`
- Top-level variables:
  - `hover`, `r`, `x`, `y`

### `src/lib/interactive/components/ClickableShape.tsx`

- Classes:
  - `ClickableShape`
- Functions:
  - `helper`
- Top-level variables:
  - `end1`, `end2`, `halfWidth`, `start1`, `start2`, `x`, `y`

### `src/lib/interactive/components/GannFan.tsx`

- Classes:
  - `GannFan`
- Functions:
  - `getLineCoordinates`, `helper`
- Top-level variables:
  - `bottom`, `ctx`, `dx`, `dy`, `end`, `halfX`, `halfY`, `hovering`, `isWithinLineBounds`, `left`, `line1`, `lineCoods`, `lines`, `oneEighthX`, `oneEighthY`, `oneFourthX`, `oneFourthY`, `oneThirdX`, `oneThirdY`, `pairsOfLines`, `right`, `top`

### `src/lib/interactive/components/HoverTextNearMouse.tsx`

- Classes:
  - `HoverTextNearMouse`
- Functions:
  - `helper`
- Top-level variables:
  - `MIN_WIDTH`, `PADDING`, `cx`, `cy`, `numberOrString`, `rect`, `text`, `textMetaData`, `textNode`

### `src/lib/interactive/components/InteractiveText.tsx`

- Classes:
  - `InteractiveText`
- Functions:
  - `helper`
- Top-level variables:
  - `rect`, `x`, `y`

### `src/lib/interactive/components/InteractiveYCoordinate.tsx`

- Classes:
  - `InteractiveYCoordinate`
- Functions:
  - `helper`
- Top-level variables:
  - `newEdge`, `rect`, `values`, `y`, `yCoord`, `yValue`

### `src/lib/interactive/components/LinearRegressionChannelWithArea.tsx`

- Classes:
  - `LinearRegressionChannelWithArea`
- Functions:
  - `edge1Provider`, `edge2Provider`, `helper`
- Top-level variables:
  - `a`, `array`, `b`, `combine`, `ctx`, `dy`, `endIndex`, `hovering`, `line`, `n`, `newy1`, `newy2`, `startIndex`, `stdDev`, `x1`, `x2`, `xSquareds`, `xs`, `xys`, `y1`, `y2`, `yDiffs`, `ys`

### `src/lib/interactive/components/MouseLocationIndicator.tsx`

- Classes:
  - `MouseLocationIndicator`
- Top-level variables:
  - `pos`, `x`, `xValue`, `y`, `yValue`

### `src/lib/interactive/components/StraightLine.tsx`

- Classes:
  - `StraightLine`
- Functions:
  - `generateLine`, `getLineCoordinates`, `getRayCoordinates`, `getSlope`, `getXLineCoordinates`, `getYIntercept`, `helper`, `isHovering`, `isHovering2`
- Top-level variables:
  - `b`, `end`, `hovering`, `line`, `lineWidth`, `m`, `modLine`, `start`, `x1`, `x2`, `y`, `y1`, `y2`

### `src/lib/interactive/components/Text.tsx`

- Classes:
  - `Text`

### `src/lib/interactive/DrawingObjectSelector.tsx`

- Classes:
  - `DrawingObjectSelector`
- Top-level variables:
  - `allSelected`, `interactiveNodes`, `interactives`, `item`, `key`, `morePropsForChart`, `objects`, `selected`, `valueArray`, `valuePresent`

### `src/lib/interactive/EquidistantChannel.tsx`

- Classes:
  - `EquidistantChannel`
- Top-level variables:
  - `b`, `dy`, `eachAppearance`, `m`, `newChannels`, `overrideIndex`, `tempChannel`, `y`

### `src/lib/interactive/FibonacciRetracement.tsx`

- Classes:
  - `FibonacciRetracement`
- Top-level variables:
  - `currentRetracement`, `dx`, `eachAppearance`, `eachHoverText`, `hoverTextWidthDefault`, `newRetracements`, `overrideIndex`

### `src/lib/interactive/GannFan.tsx`

- Classes:
  - `GannFan`
- Top-level variables:
  - `eachAppearance`, `newfans`, `overrideIndex`, `tempChannel`

### `src/lib/interactive/index.ts`

- No parseable top-level symbols found

### `src/lib/interactive/InteractiveText.tsx`

- Classes:
  - `InteractiveText`
- Top-level variables:
  - `defaultHoverText`, `newText`, `newTextList`, `props`, `selected`, `xyValue`

### `src/lib/interactive/InteractiveYCoordinate.tsx`

- Classes:
  - `InteractiveYCoordinate`
- Top-level variables:
  - `draggedAlert`, `newAlertList`, `props`, `selected`

### `src/lib/interactive/StandardDeviationChannel.tsx`

- Classes:
  - `StandardDeviationChannel`
- Top-level variables:
  - `eachAppearance`, `eachDefaultAppearance`, `eachHoverText`, `hoverTextDefault`, `newChannels`, `tempLine`

### `src/lib/interactive/TrendLine.tsx`

- Classes:
  - `TrendLine`
- Top-level variables:
  - `eachAppearance`, `hoverTextWithDefault`, `newTrends`, `tempLine`

### `src/lib/interactive/utils.ts`

- Functions:
  - `getMorePropsForChart`, `getMouseXY`, `getSelected`, `getValueFromOverride`, `isHover`, `isHoverForInteractiveType`, `saveNodeType`, `terminate`
- Top-level variables:
  - `chartConfig`, `hovering`, `interactive`, `mouseXY`, `objects`, `selecedNodes`, `selected`

### `src/lib/interactive/wrapper/EachEquidistantChannel.tsx`

- Classes:
  - `EachEquidistantChannel`
- Top-level variables:
  - `dx`, `dy`, `hoverHandler`, `line1Edge`, `line2Edge`, `newDy`, `newX1Value`, `newX2Value`, `newY1Value`, `newY2Value`, `x1`, `x2`, `y1`, `y2`

### `src/lib/interactive/wrapper/EachFibRetracement.tsx`

- Classes:
  - `EachFibRetracement`
- Functions:
  - `helper`, `xyProvider`
- Top-level variables:
  - `dir`, `dragHandler`, `dx`, `dy`, `edge1DragHandler`, `edge2DragHandler`, `firstOrLast`, `hoverHandler`, `interactiveCursorClass`, `interactiveEdgeCursorClass`, `lineType`, `lines`, `newX1Value`, `newX2Value`, `newY1Value`, `newY2Value`, `retracements`, `text`, `x`, `x1`, `x2`, `y`, `y1`, `y2`

### `src/lib/interactive/wrapper/EachGannFan.tsx`

- Classes:
  - `EachGannFan`
- Top-level variables:
  - `dx`, `dy`, `hoverHandler`, `line1Edge`, `newDy`, `newX1Value`, `newX2Value`, `newY1Value`, `newY2Value`, `x1`, `x2`, `y1`, `y2`

### `src/lib/interactive/wrapper/EachInteractiveYCoordinate.tsx`

- Classes:
  - `EachInteractiveYCoordinate`
- Top-level variables:
  - `dragProps`, `dy`, `hoverHandler`, `newYValue`

### `src/lib/interactive/wrapper/EachLinearRegressionChannel.tsx`

- Classes:
  - `EachLinearRegressionChannel`
- Functions:
  - `getNewXY`
- Top-level variables:
  - `currentItem`, `hoverHandler`, `x`, `y`

### `src/lib/interactive/wrapper/EachText.tsx`

- Classes:
  - `EachText`
- Top-level variables:
  - `dx`, `dy`, `hoverHandler`, `xValue`, `xyValue`

### `src/lib/interactive/wrapper/EachTrendLine.tsx`

- Classes:
  - `EachTrendLine`
- Functions:
  - `getNewXY`
- Top-level variables:
  - `dx`, `dy`, `mouseY`, `newX1Value`, `newX2Value`, `newY`, `newY1Value`, `newY2Value`, `x`, `x1`, `x2`, `y`, `y1`, `y2`

### `src/lib/scale/discontinuousTimeScaleProvider.ts`

- Functions:
  - `discontinuousTimeScaleProviderBuilder`, `doStuff`, `evaluateLevel`
- Top-level variables:
  - `calculate`, `currentFormatters`, `date`, `dateAccessor`, `discontinuousIndexCalculator`, `discontinuousIndexCalculatorLocalTime`, `discontinuousTimeScaleProvider`, `finalData`, `i`, `index`, `initialIndex`, `inputDateAccessor`, `inputIndex`, `level`, `mergedData`, `offsetInMillis`, `response`, `row`, `startOf15Minutes`, `startOf30Minutes`, `startOf30Seconds`, `startOf5Minutes`, `startOfDay`, `startOfEighthOfADay`, `startOfHalfDay`, `startOfHour`, `startOfMinute`, `startOfMonth`, `startOfQuarter`, `startOfQuarterDay`, `startOfWeek`, `startOfYear`, `xScale`

### `src/lib/scale/evaluator.ts`

- Functions:
  - `canShowTheseManyPeriods`, `extentsWrapper`, `filterData`, `getFilteredResponse`, `getNewEnd`, `showMax`, `showMaxThreshold`, `showMinThreshold`
- Top-level variables:
  - `chartWidth`, `clampedDomain`, `filteredData`, `firstItem`, `lastItem`, `lastItemXValue`, `left`, `log`, `newEnd`, `newLeftIndex`, `newRightIndex`, `newWidth`, `newXScale`, `plotData`, `realInputDomain`, `right`, `width`, `xScale`

### `src/lib/scale/financeDiscontinuousScale.ts`

- Functions:
  - `scale`
- Top-level variables:
  - `MAX_LEVEL`, `backingTicks`, `d`, `desiredTickCount`, `distance`, `end`, `inverted`, `start`, `temp`, `tickValues`, `ticks`, `ticksAtLevel`, `ticksMap`, `ticksSet`, `unsortedTicks`

### `src/lib/scale/index.ts`

- No parseable top-level symbols found

### `src/lib/scale/levels.ts`

- Top-level variables:
  - `defaultFormatters`, `levelDefinition`

### `src/lib/series/AlternatingFillAreaSeries.tsx`

- Classes:
  - `AlternatingFillAreaSeries`
- Top-level variables:
  - `id1`, `id2`, `style1`, `style2`

### `src/lib/series/AreaOnlySeries.tsx`

- Classes:
  - `AreaOnlySeries`
- Top-level variables:
  - `areaSeries`, `d`, `newBase`, `newClassName`

### `src/lib/series/AreaSeries.tsx`

- Functions:
  - `AreaSeries`

### `src/lib/series/BarSeries.tsx`

- Classes:
  - `BarSeries`
- Functions:
  - `getBars`
- Top-level variables:
  - `bars`, `getBase`, `getFill`, `h`, `offset`, `width`, `widthFunctor`, `x`, `y`, `yValue`

### `src/lib/series/BollingerSeries.tsx`

- Classes:
  - `BollingerSeries`

### `src/lib/series/CandlestickSeries.tsx`

- Classes:
  - `CandlestickSeries`
- Functions:
  - `drawOnCanvas`, `getCandleData`, `getCandlesSVG`, `getWicksSVG`
- Top-level variables:
  - `candleData`, `d`, `fill`, `height`, `offset`, `ohlc`, `stroke`, `wickStroke`, `width`, `widthFunctor`, `x`, `y`

### `src/lib/series/CircleMarker.tsx`

- Functions:
  - `Circle`
- Top-level variables:
  - `radius`

### `src/lib/series/ElderRaySeries.tsx`

- Classes:
  - `ElderRaySeries`
- Top-level variables:
  - `y`

### `src/lib/series/GroupedBarSeries.tsx`

- Classes:
  - `GroupedBarSeries`
- Functions:
  - `postProcessor`

### `src/lib/series/index.ts`

- No parseable top-level symbols found

### `src/lib/series/KagiSeries.tsx`

- Classes:
  - `KagiSeries`
- Functions:
  - `drawOnCanvas`, `helper`
- Top-level variables:
  - `begin`, `d`, `dataSeries`, `idx`, `kagi`, `kagiLine`, `last`, `lastPlot`, `pathD`, `paths`, `prevX`

### `src/lib/series/LineSeries.tsx`

- Classes:
  - `LineSeries`
- Top-level variables:
  - `d`, `dataSeries`, `hoverProps`

### `src/lib/series/MACDSeries.tsx`

- Functions:
  - `MACDSeries`, `yAccessorForDivergence`, `yAccessorForDivergenceBase`, `yAccessorForMACD`, `yAccessorForSignal`
- Top-level variables:
  - `fillConfig`, `strokeConfig`

### `src/lib/series/OHLCSeries.tsx`

- Classes:
  - `OHLCSeries`
- Functions:
  - `drawOnCanvas`, `getOHLCBars`
- Top-level variables:
  - `barData`, `barWidth`, `bars`, `classNameFunc`, `ohlc`, `strokeFunc`, `strokeWidth`, `wickNest`, `width`, `x`, `y1`

### `src/lib/series/OverlayBarSeries.tsx`

- Classes:
  - `OverlayBarSeries`
- Functions:
  - `getBars`
- Top-level variables:
  - `b`, `bars`, `getBase`, `getClassName`, `getFill`, `h`, `innerBars`, `offset`, `width`, `widthFunctor`, `x`, `xValue`, `y`, `yValue`

### `src/lib/series/PointAndFigureSeries.tsx`

- Classes:
  - `PointAndFigureSeries`
- Functions:
  - `drawOnCanvas`, `getColumns`
- Top-level variables:
  - `anyBox`, `boxHeight`, `boxes`, `columnWidth`, `columns`, `width`, `xOffset`

### `src/lib/series/RenkoSeries.tsx`

- Classes:
  - `RenkoSeries`
- Functions:
  - `drawOnCanvas`, `getRenko`
- Top-level variables:
  - `candleWidth`, `candles`, `ohlc`, `svgfill`, `width`, `x`

### `src/lib/series/RSISeries.tsx`

- Functions:
  - `RSISeries`, `renderClip`
- Top-level variables:
  - `clipId1`, `clipId2`, `defaultOpacity`, `defaultStroke`, `defaultStrokeDasharray`, `defaultStrokeWidth`, `opacityConfig`, `strokeConfig`, `strokeDasharrayConfig`, `strokeWidthConfig`

### `src/lib/series/SARSeries.tsx`

- Classes:
  - `SARSeries`
- Top-level variables:
  - `centerX`, `centerY`, `color`, `currentY`, `d`, `hoverProps`, `radius`, `width`, `y`

### `src/lib/series/ScatterSeries.tsx`

- Classes:
  - `ScatterSeries`
- Functions:
  - `drawOnCanvas`, `helper`
- Top-level variables:
  - `fill`, `groupedByFill`, `mProps`, `points`, `stroke`

### `src/lib/series/SquareMarker.tsx`

- Functions:
  - `Square`
- Top-level variables:
  - `w`, `x`, `y`

### `src/lib/series/StackedBarSeries.tsx`

- Classes:
  - `StackedBarSeries`
- Functions:
  - `convertToArray`, `doStuff`, `drawOnCanvas2`, `drawOnCanvasHelper`, `getBars`, `getBarsSVG2`, `identityStack`, `rotateXY`, `stack`, `svgHelper`
- Top-level variables:
  - `appearance`, `array`, `arrays`, `barWidth`, `bars`, `d`, `data`, `ds`, `eachBarWidth`, `fillStyle`, `getBase`, `getClassName`, `getFill`, `groupedByFill`, `h`, `key`, `keys`, `modifiedXAccessor`, `modifiedXScale`, `modifiedYAccessor`, `modifiedYScale`, `newData`, `offset`, `postProcessor`, `response`, `stackFn`, `width`, `widthFunctor`, `y`

### `src/lib/series/StochasticSeries.tsx`

- Classes:
  - `StochasticSeries`

### `src/lib/series/StraightLine.tsx`

- Classes:
  - `StraightLine`
- Functions:
  - `getLineCoordinates`
- Top-level variables:
  - `lineCoordinates`

### `src/lib/series/SVGComponent.tsx`

- Classes:
  - `SVGComponent`

### `src/lib/series/TriangleMarker.tsx`

- Functions:
  - `Triangle`, `getFillColor`, `getRotationInDegrees`, `getStrokeColor`, `getTrianglePoints`
- Top-level variables:
  - `directionVal`, `fillColor`, `innerHypotenuse`, `innerOpposite`, `points`, `rotate`, `rotation`, `rotationDeg`, `strokeColor`, `w`

### `src/lib/series/VolumeProfileSeries.tsx`

- Classes:
  - `VolumeProfileSeries`
- Functions:
  - `base`, `drawOnCanvas`, `helper`
- Top-level variables:
  - `allRects`, `begin`, `d`, `directionComparator`, `dx`, `finish`, `histogram2`, `rects`, `sessionBg`, `sessionBgSvg`, `sessionBuilder`, `sessionWidth`, `sessions`, `totalVolume`, `totalVolumeX`, `totalVolumes`, `totalsByDirection`, `values`, `volumeInBins`, `volumeValues`, `w1`, `w2`, `widthValue`, `ws`, `x`, `xScale`

### `src/lib/StockChartContext.tsx`

- Functions:
  - `useStockChart`
- Top-level variables:
  - `StockChartContext`, `StockChartProvider`, `context`

### `src/lib/tooltip/BollingerBandTooltip.tsx`

- Classes:
  - `BollingerBandTooltip`
- Top-level variables:
  - `currentItem`, `item`, `origin`, `tooltipLabel`, `tooltipValue`, `top`

### `src/lib/tooltip/displayValuesFor.ts`

- No parseable top-level symbols found

### `src/lib/tooltip/GroupTooltip.tsx`

- Classes:
  - `GroupTooltip`, `SingleTooltip`
- Functions:
  - `orig`
- Top-level variables:
  - `VALID_LAYOUTS`, `comp`, `currentItem`, `dx`, `dy`, `groupTextAnchor`, `singleTooltip`, `textAnchor`, `xPos`, `xyPos`, `yDisplayValue`, `yPos`, `yValue`

### `src/lib/tooltip/HoverTooltip.tsx`

- Classes:
  - `HoverTooltip`
- Functions:
  - `backgroundShapeCanvas`, `backgroundShapeSVG`, `calculateTooltipSize`, `drawOnCanvas`, `helper`, `measureText`, `normalizeX`, `normalizeY`, `origin`, `sumSizes`, `tooltipCanvas`, `tooltipSVG`
- Top-level variables:
  - `PADDING`, `X`, `Y`, `bgShape`, `bgSize`, `canvas`, `centerX`, `chartIndex`, `content`, `originX`, `originY`, `pointWidth`, `pointer`, `safePointer`, `startY`, `textY`, `tspans`, `x`, `xValue`, `y`, `yValue`

### `src/lib/tooltip/index.ts`

- No parseable top-level symbols found

### `src/lib/tooltip/MACDTooltip.tsx`

- Classes:
  - `MACDTooltip`
- Top-level variables:
  - `chartConfigList`, `config`, `currentItem`, `divergence`, `macd`, `macdValue`, `origin`, `signal`

### `src/lib/tooltip/MovingAverageTooltip.tsx`

- Classes:
  - `MovingAverageTooltip`, `SingleMAToolTip`
- Top-level variables:
  - `chartConfigList`, `config`, `currentItem`, `origin`, `tooltipLabel`, `translate`, `yDisplayValue`, `yValue`

### `src/lib/tooltip/OHLCTooltip.tsx`

- Classes:
  - `OHLCTooltip`
- Functions:
  - `defaultDisplay`
- Top-level variables:
  - `chartConfigList`, `config`, `currentItem`, `displayDate`, `displayTextsDefault`, `item`, `itemsToDisplay`, `origin`

### `src/lib/tooltip/RSITooltip.tsx`

- Classes:
  - `RSITooltip`
- Top-level variables:
  - `currentItem`, `origin`, `rsi`, `tooltipLabel`, `value`

### `src/lib/tooltip/SingleValueTooltip.tsx`

- Classes:
  - `SingleValueTooltip`
- Top-level variables:
  - `currentItem`, `origin`, `xDisplayValue`, `yDisplayValue`

### `src/lib/tooltip/StochasticTooltip.tsx`

- Classes:
  - `StochasticTooltip`
- Top-level variables:
  - `D`, `K`, `currentItem`, `origin`, `stochastic`

### `src/lib/tooltip/ToolTipText.tsx`

- Classes:
  - `ToolTipText`

### `src/lib/tooltip/ToolTipTSpanLabel.tsx`

- Functions:
  - `ToolTipTSpanLabel`

### `src/lib/types.ts`

- No parseable top-level symbols found

### `src/lib/types/adapter.ts`

- No parseable top-level symbols found

### `src/lib/types/index.ts`

- No parseable top-level symbols found

### `src/lib/types/indicator.ts`

- No parseable top-level symbols found

### `src/lib/types/ohlcv.ts`

- No parseable top-level symbols found

### `src/lib/types/pane.ts`

- No parseable top-level symbols found

### `src/lib/utils/accumulatingWindow.ts`

- Top-level variables:
  - `accumulateTill`, `accumulatedWindow`, `accumulatingWindowFn`, `accumulatorIdx`, `d`, `i`, `response`

### `src/lib/utils/barWidth.ts`

- Functions:
  - `plotDataLengthBarWidth`, `timeIntervalBarWidth`
- Top-level variables:
  - `first`, `totalWidth`, `width`

### `src/lib/utils/ChartDataUtil.ts`

- Functions:
  - `getChartConfigWithUpdatedYScales`, `getChartOrigin`, `getCurrentCharts`, `getCurrentItem`, `getDimensions`, `getNewChartConfig`, `getXValue`, `isArraySize2AndNumber`, `setRange`, `values`, `yDomainFromYExtents`
- Top-level variables:
  - `allYValues`, `another`, `bottom`, `chartHeight`, `chartProps`, `combine`, `currentCharts`, `d`, `domain`, `newYScale`, `obj`, `originCoordinates`, `prevChartConfig`, `realYDomain`, `top`, `updatedChartConfig`, `xValue`, `yDomainDY`, `yDomains`, `yExtents`, `yScale`, `yValues`

### `src/lib/utils/identity.ts`

- No parseable top-level symbols found

### `src/lib/utils/index.ts`

- Functions:
  - `capitalizeFirst`, `clearCanvas`, `createVerticalLinearGradient`, `d3Window`, `degrees`, `find`, `forOwn`, `functor`, `getClosestItem`, `getClosestItemIndexes`, `getClosestItemIndexes2`, `getClosestValue`, `getLogger`, `getTouchProps`, `head`, `hexToRGBA`, `isDefined`, `isNotDefined`, `isObject`, `last`, `mapObject`, `mapValue`, `mousePosition`, `path`, `radians`, `replaceAtIndex`, `sign`, `tail`, `toObject`, `touchPosition`, `yes`
- Top-level variables:
  - `MOUSEENTER`, `MOUSELEAVE`, `MOUSEMOVE`, `MOUSEUP`, `TOUCHEND`, `TOUCHMOVE`, `b`, `closest`, `container`, `d3win`, `diff`, `first`, `g`, `grd`, `hex`, `index`, `isArray`, `isProduction`, `item`, `key`, `left`, `length`, `lo`, `logger`, `mappedValue`, `mid`, `multiplier`, `object`, `overlayColors`, `props`, `r`, `rect`, `result`, `right`, `value`, `values`

### `src/lib/utils/mappedSlidingWindow.ts`

- Top-level variables:
  - `accumulatorIdx`, `mapped`, `mappedSlidingWindowFn`, `result`, `size`, `undef`, `undefinedValue`, `windowData`

### `src/lib/utils/merge.ts`

- Functions:
  - `mergeCompute`
- Top-level variables:
  - `algorithm`, `result`, `zip`

### `src/lib/utils/noop.ts`

- No parseable top-level symbols found

### `src/lib/utils/PureComponent.ts`

- Classes:
  - `PureComponent`

### `src/lib/utils/rebind.ts`

- Functions:
  - `createReboundMethod`
- Top-level variables:
  - `method`, `value`

### `src/lib/utils/shallowEqual.ts`

- Functions:
  - `isDate`, `isEqual`
- Top-level variables:
  - `numKeysA`

### `src/lib/utils/slidingWindow.ts`

- Top-level variables:
  - `accumulatorIdx`, `size`, `slidingWindowFn`, `sourceFunction`, `undef`, `undefinedValue`, `windowData`

### `src/lib/utils/strokeDasharray.ts`

- Functions:
  - `getStrokeDasharray`, `getStrokeDasharrayCanvas`
- Top-level variables:
  - `a`, `strokeDashTypes`

### `src/lib/utils/zipper.ts`

- Functions:
  - `d3_zipLength`, `zip`
- Top-level variables:
  - `combine`, `i`, `m`, `n`

### `src/lib/utils/zoomBehavior.ts`

- Functions:
  - `lastVisibleItemBasedZoomAnchor`, `mouseBasedZoomAnchor`, `rightDomainBasedZoomAnchor`
- Top-level variables:
  - `currentItem`, `lastItem`

### `src/lib/withContext.tsx`

- Functions:
  - `withChart`, `withChartAndStockChart`, `withStockChart`
- Top-level variables:
  - `chartContext`, `context`, `stockChartContext`

### `src/lib/ZoomButtons.tsx`

- Classes:
  - `ZoomButtons`
- Top-level variables:
  - `c`, `centerX`, `cx`, `foo`, `hLength`, `left`, `resetX`, `right`, `textY`, `wLength`, `y`, `zoomIn`, `zoomInX`, `zoomOut`, `zoomOutX`

### `src/vendor.d.ts`

- No parseable top-level symbols found

### `src/widget/__tests__/VNStockChart.contract.test.tsx`

- Functions:
  - `ThrowingChild`, `createAdapter`, `createDeferred`
- Top-level variables:
  - `VNStockChart`, `WidgetErrorBoundary`, `WidgetI18nProvider`, `abortSpy`, `act`, `adapter`, `container`, `createRoot`, `fetchDeferred`, `firstAdapter`, `firstFetch`, `originalConsoleError`, `promise`, `reactActEnvironment`, `ref`, `reject`, `resolve`, `root`, `secondAdapter`, `secondFetch`

### `src/widget/context/__tests__/WidgetI18nContext.test.tsx`

- Functions:
  - `WidgetI18nProbe`
- Top-level variables:
  - `WidgetI18nProvider`, `act`, `container`, `createRoot`, `originalConsoleError`, `probe`, `reactActEnvironment`, `root`, `setLocaleForTest`, `useWidgetI18n`

### `src/widget/context/WidgetI18nContext.tsx`

- Functions:
  - `WidgetI18nProvider`, `interpolate`, `isWidgetLocale`, `resolveInitialLocale`, `useWidgetI18n`
- Top-level variables:
  - `WidgetI18nContext`, `defaultValue`, `documentLocale`, `primaryDictionary`, `resolvedLocale`, `secondaryDictionary`, `setLocale`, `t`, `template`, `value`

### `src/widget/i18n/messages.en.ts`

- Top-level variables:
  - `widgetMessagesEn`

### `src/widget/i18n/messages.vi.ts`

- Top-level variables:
  - `widgetMessagesVi`

### `src/widget/i18n/types.ts`

- No parseable top-level symbols found

### `src/widget/index.ts`

- No parseable top-level symbols found

### `src/widget/MeasurementOverlay.tsx`

- Classes:
  - `MeasurementOverlayImpl`
- Functions:
  - `MeasurementOverlayWithI18n`, `drawMeasurementLabel`, `drawPoint`, `drawRoundedRect`, `formatSignedPrice`
- Top-level variables:
  - `accentColor`, `bottom`, `boxHeight`, `boxWidth`, `boxX`, `boxY`, `chartConfig`, `drawOn`, `endPixel`, `hoverPixel`, `hoverPoint`, `labels`, `lineHeight`, `lines`, `paddingX`, `paddingY`, `point`, `right`, `selection`, `startPixel`, `summary`

### `src/widget/VNStockChart.tsx`

- Functions:
  - `VNStockChart`, `VNStockChartContent`, `lookbackDays`, `mergeBarsByDate`, `resolveFetchWindow`, `safeXAccessor`
- Top-level variables:
  - `activeSymbol`, `activeTimeframe`, `axisStroke`, `axisTickFill`, `candidatePanes`, `chartInnerHeight`, `computedXExtents`, `controller`, `dateFormat`, `disposed`, `enrichedData`, `existingIndex`, `firstBar`, `hasExternalData`, `isDark`, `lastBar`, `nextPanes`, `oneDay`, `paneHeights`, `plotData`, `previousTheme`, `priceFormat`, `ready`, `resolvedTheme`, `resolvedXExtents`, `root`, `themeState`, `to`, `unsubscribe`, `visiblePanes`, `volumeFormat`

### `src/widget/WidgetEmptyState.tsx`

- Functions:
  - `WidgetEmptyState`
- Top-level variables:
  - `copy`

### `src/widget/WidgetErrorBoundary.tsx`

- Classes:
  - `WidgetErrorBoundary`

### `stories/CandleStickChartPanToLoadMore.stories.tsx`

- Top-level variables:
  - `Default`

### `stories/CandleStickChartWithAnnotation.stories.tsx`

- Top-level variables:
  - `Default`

### `stories/CandleStickChartWithBrush.stories.tsx`

- Top-level variables:
  - `Default`

### `stories/CandleStickChartWithHoverTooltip.stories.tsx`

- Top-level variables:
  - `Default`

### `stories/CandleStickChartWithMACDIndicator.stories.tsx`

- Top-level variables:
  - `Default`

### `stories/CandleStickChartWithRSIIndicator.stories.tsx`

- Top-level variables:
  - `Default`

### `stories/CandleStickStockScaleChartWithVolumeBarV3.stories.tsx`

- Top-level variables:
  - `Default`

### `stories/support/ChartSurface.tsx`

- Functions:
  - `ChartSurface`, `xAccessor`
- Top-level variables:
  - `displayXAccessor`, `resolvedExtents`, `width`

### `stories/support/chartTheme.ts`

- Functions:
  - `createOrigin`, `resolveStoryWidth`
- Top-level variables:
  - `axisTheme`, `chartMargin`, `chartShellStyle`, `chartTheme`, `coordinateTheme`, `dateFormat`, `frameActionsStyle`, `frameDescriptionStyle`, `frameHeaderStyle`, `frameKickerStyle`, `frameStyle`, `frameTitleStyle`, `percentFormat`, `priceFormat`, `priceFormat3`, `storyButtonStyle`, `themeFontFamily`, `tooltipDisplayTexts`, `volumeAxisFormat`, `volumeFormat`

### `stories/support/exampleStories.tsx`

- Functions:
  - `CandleStickChartPanToLoadMoreStory`, `CandleStickChartWithAnnotationStory`, `CandleStickChartWithBrushStory`, `CandleStickChartWithHoverTooltipStory`, `CandleStickChartWithMACDIndicatorStory`, `CandleStickChartWithRSIIndicatorStory`, `CandleStickStockScaleChartWithVolumeBarV3Story`, `MacdYAxis`, `PriceXAxis`, `PriceYAxis`, `RsiYAxis`, `VolumeProfileChartStory`, `VolumeYAxis`, `bollingerExtents`, `macdExtents`, `macdOptions`, `normalizeDateRange`, `priceExtents`, `totalHeight`
- Top-level variables:
  - `annotatedDatum`, `annotationPaneHeight`, `band`, `baseData`, `bollingerStroke`, `endDate`, `extendedData`, `hoverPaneHeight`, `loadMorePriceHeight`, `macdAppearance`, `macdPaneHeight`, `orderedRange`, `pricePaneHeight`, `rsiOpacity`, `rsiPaneHeight`, `rsiStroke`, `rsiStrokeDasharray`, `rsiStrokeWidth`, `startDate`, `visibleData`, `volumePaneHeight`, `volumeProfileHeight`

### `stories/support/storyData.ts`

- Functions:
  - `buildDefaultExtents`, `createStoryData`, `createSyntheticBar`, `extractBollinger`, `extractMacd`, `extractNumberArray`
- Top-level variables:
  - `bar`, `bars`, `baseTime`, `bollingerBand`, `bollingerIndicator`, `candidate`, `close`, `ema20`, `ema50`, `emaIndicator`, `endIndex`, `macd`, `macdIndicator`, `open`, `previousClose`, `rsi`, `rsiIndicator`, `spread`, `startIndex`, `swing`

### `stories/support/StoryFrame.tsx`

- Functions:
  - `StoryFrame`

### `stories/VolumeProfileChart.stories.tsx`

- Top-level variables:
  - `Default`

### `storybook-static/assets/CandleStickChartPanToLoadMore.stories-B_Ept7IH.js`

- No parseable top-level symbols found

### `storybook-static/assets/CandleStickChartWithAnnotation.stories-BlAs3LUd.js`

- No parseable top-level symbols found

### `storybook-static/assets/CandleStickChartWithBrush.stories-BYsFVgiO.js`

- No parseable top-level symbols found

### `storybook-static/assets/CandleStickChartWithHoverTooltip.stories-vDMBXtxy.js`

- No parseable top-level symbols found

### `storybook-static/assets/CandleStickChartWithMACDIndicator.stories-D1NC4oM9.js`

- No parseable top-level symbols found

### `storybook-static/assets/CandleStickChartWithRSIIndicator.stories-C7tbMpRs.js`

- No parseable top-level symbols found

### `storybook-static/assets/CandleStickStockScaleChartWithVolumeBarV3.stories-CqOvkQWj.js`

- No parseable top-level symbols found

### `storybook-static/assets/chunk-DnJy8xQt.js`

- Top-level variables:
  - `e`

### `storybook-static/assets/exampleStories-BK9DQyGg.js`

- No parseable top-level symbols found

### `storybook-static/assets/iframe-mh8sIC6d.js`

- Functions:
  - `__vite__mapDeps`
- Top-level variables:
  - `button`, `canvas`

### `storybook-static/assets/preload-helper-DVWkohm0.js`

- No parseable top-level symbols found

### `storybook-static/assets/react-18-CNyK0AP9.js`

- No parseable top-level symbols found

### `storybook-static/assets/VolumeProfileChart.stories-B40S_7r_.js`

- No parseable top-level symbols found

### `storybook-static/sb-addons/common-manager-bundle.js`

- No parseable top-level symbols found

### `storybook-static/sb-manager/globals-runtime.js`

- Classes:
  - `CustomMatcher`, `EarlyEndOfParseError`, `Lexer`, `NoParsletFoundError`, `Parser2`, `UnexpectedTypeError`
- Functions:
  - `A3`, `Ac`, `Ae`, `Af`, `Ag`, `Ah`, `Ai`, `AllLineNumbers`, `BaseModal`, `Bb`, `Bc`, `Be`, `Bf`, `Bg`, `Bh`, `Bi`, `BrowserRouter`, `C`, `C2`, `Cb`, `Cc`, `Ce`, `Cg`, `Ch`, `Ci`, `Ck`, `Component5`, `D`, `Db`, `Dc`, `De`, `DefaultErrorComponent`, `DefinedInfo`, `Dg`, `Di`, `Dj`, `Dk`, `E`, `Eb`, `Ee`, `Ef`, `EffectOnMount`, `Eg`, `Eh`, `Ej`, `Ek`, `Empty`, `F`, `FakeMap`, `Fb`, `Fe`, `Fg`, `Fi`, `Filter2`, `Fj`, `Fk`, `FormatError2`, `ForwardRefFunction`, `G`, `Gb`, `Ge`, `Gg`, `Gi`, `Gk`, `H`, `Hash`, `Hb`, `Hg`, `Hi`, `Hj`, `Hk`, `I`, `Ie`, `If`, `Ig`, `Ii`, `Ij`, `Ik`, `Info`, `InteractiveTooltipWrapper`, `IntlMessageFormat2`, `InvalidValueError2`, `InvalidValueTypeError2`, `J`, `Jb`, `Je`, `JestChaiExpect`, `JestExtend`, `JestExtendPlugin`, `Jg`, `Ji`, `Jk`, `K2`, `Ka`, `Kb`, `Ke`, `Kf`, `Ki`, `Kk`, `Le`, `Lf`, `Lg`, `Li`, `LinkedList`, `ListCache`, `Lj`, `Lk`, `Location`, `LocationProvider`, `M`, `Ma`, `ManagerConsumer`, `MapCache`, `Match`, `Me`, `MemoryRouter`, `Mf`, `Mg`, `Mh`, `MissingValueError2`, `Mj`, `Mk`, `N`, `Nb`, `Ne`, `Ng`, `Nh`, `Ni`, `Nk`, `O`, `Oa`, `ObjectWithoutPrototypeCache2`, `Oe`, `Og`, `Oj`, `Ok`, `P2`, `P3`, `Pa`, `Parser2`, `Pd`, `Pg`, `Pj`, `Pk`, `PolishedError2`, `Provider`, `Q`, `Qa`, `Qg`, `Qi`, `Qj`, `Qk`, `R`, `RE`, `Ra`, `Refractor`, `Rg`, `Rj`, `Rk`, `Route2`, `Router`, `S`, `Sa`, `SameValueZero`, `Sc`, `Schema`, `SetLike3`, `Sg`, `Sh`, `Si`, `Similar`, `Sj`, `Sk`, `Slottable22`, `StyleSheet2`, `T2`, `Ta`, `Tb`, `Tc`, `Tg`, `Th`, `Ti`, `Tj`, `Tk`, `Token`, `Tooltip2`, `Ua`, `Ub`, `Uc`, `Ue`, `Uf`, `Uh`, `Ui`, `Uj`, `Uk`, `Va`, `Vb`, `Vc`, `Ve`, `Vh`, `Vi`, `Vj`, `W`, `Wa`, `Wb`, `Wc`, `Wh`, `Wj`, `Wk`, `Wrapper9`, `X`, `Xa`, `Xb`, `Xc`, `Xh`, `Xi`, `Xk`, `Ya`, `Yb`, `Yc`, `Yf`, `Yh`, `Yi`, `Yj`, `Yk`, `Za`, `Zb`, `Zc`, `Ze`, `Zf`, `Zh`, `Zi`, `Zj`, `Zk`, `ZoomElement`, `__`, `__assign`, `__commonJS`, `__esm`, `__export`, `__extends`, `__rest`, `__spreadArray`, `__toESM`, `_arrayLikeToArray`, `_arrayLikeToArray2`, `_arrayWithHoles`, `_arrayWithoutHoles`, `_assertThisInitialized`, `_check_private_redeclaration`, `_classCallCheck`, `_classCallCheck2`, `_classCallCheck3`, `_class_apply_descriptor_get`, `_class_apply_descriptor_set`, `_class_extract_field_descriptor`, `_class_private_field_get`, `_class_private_field_init`, `_class_private_field_set`, `_compileAtrule`, `_construct`, `_createClass`, `_createClass2`, `_createClass3`, `_createForOfIteratorHelper`, `_defineProperties`, `_defineProperties2`, `_defineProperties3`, `_defineProperty`, `_defineProperty2`, `_defineProperty3`, `_defineProperty4`, `_defineProperty5`, `_define_property`, `_define_property2`, `_define_property3`, `_define_property4`, `_define_property5`, `_define_property6`, `_define_property7`, `_define_property8`, `_define_property9`, `_extends`, `_extends2`, `_extends3`, `_extends4`, `_getPrototypeOf`, `_getRequireWildcardCache`, `_inheritsLoose`, `_interopRequireDefault`, `_interopRequireWildcard`, `_isAlpha`, `_isAlphaOrSlash`, `_isNativeFunction`, `_isNativeReflectConstruct`, `_isPatternSyntax`, `_isPotentialElementNameChar`, `_isWhiteSpace`, `_iterableToArray`, `_iterableToArrayLimit`, `_loop`, `_mergeNamespaces`, `_nonIterableRest`, `_nonIterableSpread`, `_objectSpread`, `_objectSpread2`, `_objectSpread3`, `_objectSpread4`, `_objectWithoutProperties`, `_objectWithoutPropertiesLoose`, `_objectWithoutPropertiesLoose2`, `_setPrototypeOf`, `_slicedToArray`, `_toConsumableArray`, `_toPrimitive`, `_toPrimitive2`, `_toPrimitive3`, `_toPrimitive4`, `_toPropertyKey`, `_toPropertyKey2`, `_toPropertyKey3`, `_toPropertyKey4`, `_traverse`, `_typeof`, `_typeof2`, `_typeof3`, `_typeof4`, `_typeof5`, `_typeof6`, `_unsupportedIterableToArray`, `_unsupportedIterableToArray2`, `_wrapNativeSuper`, `a`, `a2`, `ab`, `acceptNode`, `ad`, `addAfter`, `addAlias`, `addChainableMethod`, `addChild`, `addHighlight`, `addItem`, `addLengthGuard`, `addMethod`, `addMethod2`, `addProperty`, `addProperty2`, `adjustHue`, `ag`, `ah`, `ai`, `aj`, `ak`, `al`, `alias`, `alloc`, `allowsNameFromContent`, `allowsNameFromContent2`, `alphabetical`, `alphanumerical`, `an`, `ansiMess`, `append`, `appendErrorRef`, `applyPosition`, `applyStyles`, `areDepsEqual`, `areObjectsEqual`, `areValidElements`, `ariaRoleRelationConceptAttributeEquals`, `ariaRoleRelationConceptEquals`, `ariaRoleRelationConstraintsEquals`, `ariaTransform`, `arrayBufferEquality`, `arrayFrom`, `arrayFrom2`, `arrayFromSet`, `arrayFromSet2`, `arrayMap`, `arrow`, `asFlatString`, `asFlatString2`, `assemble`, `assembleLineNumberStyles`, `assembleStyles`, `assert`, `assert2`, `assertAbove`, `assertArrayOrTupleResult`, `assertBelow`, `assertChanges`, `assertDecreases`, `assertDelta`, `assertDescriptor`, `assertEql`, `assertEqual`, `assertExist`, `assertIncreases`, `assertInstanceOf`, `assertIsMock`, `assertKeys`, `assertLeast`, `assertLength`, `assertLengthChain`, `assertMatch`, `assertMost`, `assertNotNullOrUndefined`, `assertNumberOrVariadicNameResult`, `assertOwnProperty`, `assertOwnPropertyDescriptor`, `assertPlainKeyValueOrNameResult`, `assertPlainKeyValueOrRootResult`, `assertPlainKeyValueResult`, `assertPointerEvents`, `assertProperty`, `assertRootResult`, `assertThrows`, `assertTypes`, `assertions`, `assignProps`, `assocIndexOf`, `asymmetricMatch`, `atcontainer`, `atcustommedia`, `atdocument`, `atfontface`, `athost`, `atkeyframes`, `atlayer`, `atmedia`, `atpage`, `atrule`, `atstartingstyle`, `atsupports`, `attachClipboardStubToView`, `attemptFocus`, `attributes`, `b`, `baseGet`, `baseGetTag`, `baseIsNative`, `baseToString`, `bash2`, `bb`, `bd`, `bg`, `bh`, `bi`, `bind`, `bj`, `bk`, `bl`, `blurElement`, `build2`, `buildElementRoleList`, `buildElementRoleList2`, `buildQueries`, `buildTimeValue`, `builder`, `bySelectorSpecificity`, `c`, `cachedIsSubtreeInaccessible`, `calculateNewValue`, `calculateNodeHeight`, `callReturnedUnsubscribeFn`, `calls`, `camelcase`, `canElementBeDisabled`, `canSuggest`, `capture`, `caret`, `caseInsensitiveTransform`, `caseSensitiveTransform`, `castPath`, `categoryForCode`, `catharsisTransform`, `cb`, `cg`, `ch`, `char`, `charat`, `checkArguments`, `checkBooleanAttribute`, `checkCallback`, `checkContainerType`, `checkDCE`, `checkHasWindow`, `checkHtmlElement`, `checkIfSnapshotChanged`, `checkNode`, `checkPointerEvents`, `checkRealTimersCallback`, `checkToAppear`, `children`, `ci`, `cj`, `ck`, `cl`, `clamp`, `clampIndex`, `cleanup`, `cleanupModifierEffects`, `clear`, `clear2`, `clear3`, `clearAllMocks`, `clearInitialValue`, `clearStyles2`, `click`, `click2`, `clike`, `clone`, `clone2`, `cloneEvent`, `close`, `closeTag`, `closeTo`, `closestPointerEventsDeclaration`, `clsx`, `collectOwnProperties`, `collide`, `colorToHex`, `colorToInt`, `colorise`, `colorise2`, `combine`, `combineParameters`, `comment`, `comment2`, `commenter`, `comments`, `commitInput`, `commitValueAfterInput`, `compareAsSet`, `compareByInspect`, `compareObjects`, `comparePrimitive`, `compareSubset`, `compatibleConstructor`, `compatibleInstance`, `compatibleMessage`, `compile`, `composeContextScopes`, `composeEventHandlers`, `composeParslet`, `composeRefs`, `composeRefs2`, `computeAccessibleDescription`, `computeAccessibleDescription2`, `computeAccessibleName`, `computeAccessibleName2`, `computeAriaBusy`, `computeAriaChecked`, `computeAriaCurrent`, `computeAriaExpanded`, `computeAriaPressed`, `computeAriaSelected`, `computeAriaValueMax`, `computeAriaValueMin`, `computeAriaValueNow`, `computeAriaValueText`, `computeAutoPlacement`, `computeElementTextAlternative`, `computeFilterFunctions`, `computeHeadingLevel`, `computeKeySlice`, `computeMiscTextAlternative`, `computeOffsets`, `computeStyles`, `computeTextAlternative`, `computeTextAlternative2`, `computeTextAlternative3`, `computeTooltipAttributeValue`, `concatenateRelevantDiffs`, `configure`, `configureText`, `containerRef`, `contains`, `context`, `controlOrMetaSymbol`, `convertToHex`, `convertToInt`, `convertToReactAriaPlacement`, `convertUnconventionalData`, `copy`, `copy2`, `copy3`, `copy5`, `copySelection`, `copyStackTrace`, `copyUsingClipboardAPI`, `copyUsingWorkAround`, `countBy`, `countChanges`, `create4`, `createAdjustMap`, `createAssertionMessage`, `createBrowserChannel`, `createBrowserHistory`, `createBrowserHref`, `createBrowserLocation`, `createCanvas`, `createChildren`, `createClassNameString`, `createClipboardItem`, `createClipboardStub`, `createConfig`, `createContext32`, `createContextScope`, `createCopyToClipboardFunction`, `createDOMElementFilter`, `createDataTransfer`, `createDataTransferStub`, `createDefaultFormatters`, `createElement4`, `createEvent`, `createEvent2`, `createExpect`, `createFastMemoizeCache`, `createFileList`, `createFunctionParslet`, `createHref`, `createIndent`, `createIndent2`, `createInline`, `createInstance`, `createInternalSpy`, `createKey`, `createKeyValueParslet`, `createLine`, `createLineElement`, `createLocation`, `createLocation2`, `createMemoryHistory`, `createMemoryLocation`, `createNameParslet`, `createNamePathParslet`, `createObjectFieldParslet`, `createObjectParslet`, `createParameterListParslet`, `createPatchMark`, `createPath`, `createScope`, `createSlot`, `createSlotClone`, `createSlottable`, `createSpecialNamePathParslet`, `createStatusStore`, `createStringFromObject`, `createStyleElement`, `createStyleObject`, `createTestProviderStore`, `createTupleParslet`, `createURL`, `createUnwrappedLine`, `createValuePattern`, `createVariadicParslet`, `createWrappedLine`, `css`, `css3`, `cssEscape`, `curried`, `curry`, `customMatcher`, `cut`, `cut2`, `d`, `darken`, `dataTransfer`, `datasetToAttribute`, `datasetToProperty`, `db`, `dblClick`, `dblClick2`, `dealloc`, `debounce`, `debug`, `decimal`, `declaration`, `declaration2`, `declarations`, `decode`, `decodeCodePoint`, `decodeEntity`, `decodeStrict`, `decodeURIComponent2`, `dedent`, `deepClone`, `deepElementFromPoint`, `deepEqual`, `def`, `defaultRenderer`, `defaultShouldSerializeObject`, `define2`, `defineValue`, `delimit`, `delimiter`, `deprecate2`, `dequal`, `desaturate`, `describe`, `deselectOptions`, `deselectOptions2`, `destroy`, `detachClipboardStubFromView`, `detectOverflow`, `dg`, `di`, `diff`, `diffLinesRaw`, `diffLinesUnified`, `diffLinesUnified2`, `diffSequence`, `diffStrings`, `diffStringsRaw`, `diffStringsUnified`, `diff_cleanupMerge`, `diff_cleanupSemantic`, `diff_cleanupSemanticLossless`, `diff_cleanupSemanticScore_`, `diff_commonOverlap_`, `diff_commonPrefix`, `diff_commonSuffix`, `disallowed`, `dispatchDOMEvent`, `dispatchEvent`, `dispatchUIEvent`, `display`, `distanceAndSkiddingToXY`, `dj`, `dk`, `dl`, `doc`, `draw`, `drawBorder`, `drawBoxModel`, `drawContent`, `drawFloatingLabel`, `drawLabel`, `drawMargin`, `drawPadding`, `drawSelectedElement`, `drawStack`, `e`, `ed`, `editContenteditable`, `editInputElement`, `effect`, `effect2`, `effect3`, `eh`, `ei`, `ek`, `el`, `encode`, `encode2`, `encodeString`, `endsWith`, `enhanceSpy`, `ensurePanel`, `entriesEqual`, `eq`, `eq2`, `eq3`, `equal`, `equals`, `equalsArgumentArray`, `error`, `errorGen`, `escape`, `escape2`, `escape4`, `escapeHTML`, `escapeHTML2`, `escapeHTML3`, `escapeRegExp`, `escapeUTF8`, `escaping`, `expandToHashMap`, `expect`, `expect4`, `expectTypes`, `expectWrapper`, `expectedDiff`, `extend`, `extendStatics`, `extensiveDeepEqual`, `extensiveDeepEqualByType`, `externalToValue`, `extractEventHiddenProperties`, `extractSize`, `extractSpecialParams`, `f3`, `f4`, `fa`, `factory`, `fb`, `fd`, `ff`, `fi`, `filterCommentsAndDefaultIgnoreTagsTags`, `filterZeroValues`, `finalArgs`, `finalAriaLabel`, `find`, `find2`, `findAndDrawElement`, `findChildEntriesRecursively`, `findClosest`, `findClosingBracket`, `findClosingParenthese`, `findLabelableElement`, `findLabelableElement2`, `findNodeAtTextOffset`, `findPlugin`, `findPlugin2`, `fireEvent`, `fl`, `flag`, `flattenCodeTree`, `flattenDOM`, `flip`, `floatingAlignment`, `floatingOffset`, `flush`, `fn`, `fn2`, `fn4`, `focusElement`, `focusManager`, `format`, `format2`, `format4`, `formatCalls`, `formatReturns`, `formatToParts`, `formatTrailingSpaces`, `fuzzyMatches`, `g2`, `gb`, `gd`, `ge`, `generateBoundingClientRect`, `generateOutput`, `generateToBeMessage`, `generatorEqual`, `get`, `get3`, `getASCIIEncoder`, `getAccessibleValue`, `getActiveElement`, `getActiveElementOrBody`, `getActiveTarget`, `getActual`, `getAddonsStore`, `getAddonsStore2`, `getAlignedDiffs`, `getAllFormValues`, `getAllLineNumbers`, `getAllProperties`, `getAltAxis`, `getAnimationName`, `getArrayName`, `getAttributeComment`, `getBasePlacement`, `getBaseValue`, `getBestPattern`, `getBlobFromDataTransferItem`, `getBoundingClientRect`, `getBrowserInfo`, `getChildren`, `getChildren2`, `getClassNameCombinations`, `getClientRectFromMixedType`, `getClipboardDataFromString`, `getClippingParents`, `getClippingRect`, `getCodeFrame`, `getCodeTree`, `getColorsEmpty`, `getColorsHighlight`, `getColorsHighlight2`, `getCommonAndChangedSubstrings`, `getCommonMessage`, `getCompareKeys`, `getCompositeRect`, `getComputedStyle2`, `getConfig`, `getConfig2`, `getConstructorName`, `getConstructorName2`, `getContainingBlock`, `getContentEditable`, `getContextLines`, `getControlOfLabel`, `getControlOfLabel2`, `getCurrentLocation`, `getCustomEqualityTesters`, `getDeepObject`, `getDefaultColors`, `getDefaultExportFromCjs`, `getDefaultExportFromCjs2`, `getDefaultHourSymbolFromLocale`, `getDefaultNormalizer`, `getDefaultOptions`, `getDescendant`, `getDescriptor`, `getDescriptor2`, `getDocument`, `getDocument2`, `getDocumentElement`, `getDocumentFromNode`, `getDocumentRect`, `getDocumentWidthAndHeight`, `getElement`, `getElement2`, `getElementError`, `getElementRef`, `getElementRef2`, `getElementRef3`, `getEmWidthOfNumber`, `getEnumerableKeys`, `getEnumerableSymbols`, `getErrorMessage`, `getEscapeRegex`, `getEscapeString`, `getEventClass`, `getEventConstructors`, `getEventMetadata`, `getExpandedFallbackPlacements`, `getExpectedClassNamesAndOptions`, `getExpectedValues`, `getExplicitOrImplicitRoles`, `getExplicitRole`, `getExplicitRole2`, `getFormEncType`, `getFormSubmissionInfo`, `getFormValue`, `getFormatOptions`, `getFreshSideObject`, `getGeneratorEntries`, `getHTMLElementScroll`, `getHistoryState`, `getHooksContextOrNull`, `getHooksContextOrThrow`, `getIdentifier`, `getImplicitAriaRoles`, `getImplicitAriaRoles2`, `getImplicitRole`, `getImplicitRole2`, `getIndex`, `getInitialValue`, `getInlineLineNumber`, `getInnerBoundingClientRect`, `getInputRange`, `getInputValue`, `getInvalidPathError`, `getInverse`, `getInverseObj`, `getInverseReplacer`, `getIteratorEntries`, `getKeysOfEnumerableProperties`, `getKeysOfEnumerableProperties2`, `getLabelContent`, `getLabelDescr`, `getLabelPrinter`, `getLabels`, `getLabels2`, `getLabels3`, `getLatestWhatsNewPost`, `getLayoutRect`, `getLevelRef`, `getLocalName`, `getLocalName2`, `getMainAxisFromPlacement`, `getMapData`, `getMatcherState`, `getMatcherUtils`, `getMatches`, `getMaxLength`, `getMemberType`, `getMessage`, `getMessage2`, `getMessage3`, `getMouseButtonId`, `getMouseEventButton`, `getMultiElementValue`, `getMultipleElementsFoundError`, `getName`, `getNameHint`, `getNative`, `getNewLineSymbol`, `getNewLines`, `getNextCharacterContentNode`, `getNextCursorPosition`, `getNodeName`, `getNodeScroll`, `getNodeText`, `getNormalizedHtml`, `getNumber`, `getObjectKeys`, `getObjectSubset`, `getObjectsDifference`, `getOffset`, `getOffsetParent`, `getOperator`, `getOppositePlacement`, `getOppositeVariationPlacement`, `getOwnEnumerableProperties`, `getOwnEnumerablePropertySymbols`, `getOwnProperties`, `getParameters`, `getParentNode`, `getPathContributingMatches`, `getPathInfo`, `getPlaygroundUrl`, `getPrevTarget`, `getPrintFunctionName`, `getPromiseValue`, `getPropKeys`, `getProperties`, `getPropertyDescriptor`, `getPureName`, `getQueriesForElement`, `getQuoteStyle`, `getQuoted`, `getRawTag`, `getRealLabels`, `getRecordEntries`, `getRecordEntries2`, `getRegExpMatcher`, `getRegisteredStyles`, `getRemainingElements`, `getReplacer`, `getRole`, `getRole2`, `getRoles`, `getScrollParent`, `getScrollPosition`, `getScrollPositionFromPointer`, `getSelectValue`, `getSelection`, `getSelectorSpecificity`, `getSideOffsets`, `getSingleElementValue`, `getSlotContents`, `getSlotContents2`, `getSnapshotWrapper`, `getSpy`, `getState`, `getStateForTestProvider`, `getStatics`, `getStoryHref`, `getStrictDecoder`, `getStringifier`, `getStyleDeclaration`, `getSubtree`, `getSuggestedQuery`, `getSuggestionError`, `getSymbols`, `getTabDestination`, `getTag`, `getTag2`, `getTagNameOfElementAssociatedWithLabelViaFor`, `getTargetTypeAndSelection`, `getTextContent`, `getTextRange`, `getTextualContent`, `getTextualContent2`, `getThumbOffsetFromScroll`, `getThumbRatio`, `getThumbSize`, `getToken`, `getTooltipProps`, `getTreeDiff`, `getTrueOffsetParent`, `getType`, `getType2`, `getType3`, `getTypeMatcher`, `getTypeName`, `getUAString`, `getUISelection`, `getUIValue`, `getUnnamedParameters`, `getUnserializableMessage`, `getUrlBasedHistory`, `getUserCodeFrame`, `getValue`, `getValueOfTextbox`, `getValueOfTextbox2`, `getValueOrTextContent`, `getValues`, `getVariation`, `getViewportRect`, `getWindow`, `getWindow2`, `getWindowFromNode`, `getWindowScroll`, `getWindowScrollBarX`, `getter`, `gh`, `gi`, `gj`, `gk`, `gl`, `globalListeners`, `graphql2`, `guard`, `h3`, `ha`, `handleAnimationEnd`, `handleChange`, `handleClick`, `handleClickOutside`, `handleDisplay`, `handleDragScroll`, `handleException`, `handleInterpolation`, `handlePointerEnter`, `handlePop`, `handleRequest`, `handleRgb`, `handleScroll`, `handleTestError`, `handleTimeout`, `handleWheel`, `handler`, `hasAbstractRole`, `hasAbstractRole2`, `hasAnyConcreteRoles`, `hasAnyConcreteRoles2`, `hasAssertions`, `hasBitFlag`, `hasCaretPosition`, `hasCommonDiff`, `hasDefinedKey`, `hasGlobalAriaAttributes`, `hasGlobalAriaAttributes2`, `hasIterator`, `hasIteratorFunction`, `hasKey`, `hasNoSelection`, `hasOwnSelection`, `hasPointerEvents`, `hasProperty`, `hasPropertyInObject`, `hasReleaseSelf`, `hasUISelection`, `hash`, `hashClear`, `hashDelete`, `hashGet`, `hashHas`, `hashSet`, `hb`, `hd`, `he`, `headerCommon`, `hexCodeToInt`, `hexadecimal`, `hg`, `hh`, `hi`, `hide`, `hide2`, `highlight`, `highlightAutomaticallyCallback`, `highlight_default`, `hj`, `hk`, `hl`, `hoistNonReactStatics2`, `hover`, `hover2`, `hsl`, `hslToHex`, `hslToRgb`, `hsla`, `ib`, `icuUnitToEcma`, `identifier`, `identifierRule`, `identityFunc`, `identityTransformRules`, `ig`, `ignorePresentationalRole`, `ignorePresentationalRole2`, `ih`, `ii`, `ij`, `ik`, `il`, `include`, `includeChainingBehavior`, `increment`, `indexof`, `inferControl`, `inferType`, `init`, `init10`, `init11`, `init2`, `init3`, `init5`, `init7`, `init8`, `init9`, `initClipboardEvent`, `initFocusEvent`, `initInputEvent`, `initKeyboardEvent`, `initMouseEvent`, `initPointerEvent`, `initUIEvent`, `initUIEventModifiers`, `initialCheck`, `input`, `insertHighlightedCode`, `inspect2`, `inspect22`, `inspect3`, `inspect4`, `inspectArguments`, `inspectArguments2`, `inspectArray`, `inspectArray2`, `inspectAttribute`, `inspectAttribute2`, `inspectBigInt`, `inspectBigInt2`, `inspectClass`, `inspectClass2`, `inspectDate`, `inspectDate2`, `inspectFunction`, `inspectFunction2`, `inspectHTML`, `inspectHTML2`, `inspectList`, `inspectList2`, `inspectMap`, `inspectMap2`, `inspectMapEntry`, `inspectMapEntry2`, `inspectNode`, `inspectNode2`, `inspectNodeCollection`, `inspectNodeCollection2`, `inspectNumber`, `inspectNumber2`, `inspectObject`, `inspectObject2`, `inspectObject22`, `inspectObject3`, `inspectProperty`, `inspectProperty2`, `inspectRegExp`, `inspectRegExp2`, `inspectSet`, `inspectSet2`, `inspectString`, `inspectString2`, `inspectSymbol`, `inspectSymbol2`, `inspectTypedArray`, `inspectTypedArray2`, `instrument`, `intercept`, `interleaveSeparators`, `internalGetPathValue`, `internalSpyOn`, `intersect_default`, `invariant`, `invariant2`, `is`, `isA`, `isAcceptableFile`, `isAllSelected`, `isAncestorDisabled`, `isAnySideFullyClipped`, `isArgumentElement`, `isAsymmetric`, `isAsymmetricMatcher`, `isAttributeVisible`, `isButtonElement`, `isCallable`, `isCallable2`, `isChecked`, `isChildren`, `isClass`, `isClickableInput`, `isClipboardStub`, `isContentEditable`, `isControl`, `isControl2`, `isCustomElement`, `isDataView`, `isDateElement`, `isDateOrTime`, `isDateTimeSkeleton`, `isDescendantOfNativeHostLanguageTextAlternativeElement`, `isDescendantOfNativeHostLanguageTextAlternativeElement2`, `isDifferentPointerPosition`, `isDisabled2`, `isDocument`, `isDocument2`, `isDomNode`, `isEditable`, `isEditableInputOrTextArea`, `isElement`, `isElement2`, `isElement3`, `isElement4`, `isElement5`, `isElementDisabled`, `isElementDisabledByParent`, `isElementHavingAriaInvalid`, `isElementInvalid`, `isElementOrAncestorDisabled`, `isElementRequiredByARIA`, `isElementScaled`, `isElementType`, `isElementVisible`, `isEmptyElement`, `isEmptyString`, `isEqual`, `isEqual4`, `isEqualWith`, `isEqualWithImpl`, `isErrorEqual`, `isErrorInstance`, `isFinalObj`, `isFirstLegendChildOfFieldset`, `isFocusable`, `isFormDataSubmitterSupported`, `isFormElement`, `isFormatXMLElementFn`, `isFunction`, `isFunction32`, `isHTMLElement`, `isHTMLFieldSetElement`, `isHTMLFieldSetElement2`, `isHTMLInputElement`, `isHTMLInputElement2`, `isHTMLLegendElement`, `isHTMLLegendElement2`, `isHTMLOptGroupElement`, `isHTMLOptGroupElement2`, `isHTMLSelectElement`, `isHTMLSelectElement2`, `isHTMLSlotElement`, `isHTMLSlotElement2`, `isHTMLTableCaptionElement`, `isHTMLTableCaptionElement2`, `isHTMLTableElement`, `isHTMLTableElement2`, `isHTMLTextAreaElement`, `isHTMLTextAreaElement2`, `isHidden`, `isHidden2`, `isHighSurrogate`, `isHighSurrogate2`, `isHighlightJs`, `isHtmlElement`, `isImmutable`, `isImmutableList`, `isImmutableOrderedKeyed`, `isImmutableOrderedSet`, `isImmutableRecord`, `isImmutableUnorderedKeyed`, `isImmutableUnorderedSet`, `isInaccessible`, `isInputElement`, `isKey`, `isKeyable`, `isKeyboardEvent`, `isLabelable`, `isLabelableElement`, `isLabelableElement2`, `isLayoutViewport`, `isLazyComponent`, `isLink`, `isLiteralElement`, `isLiteralValue`, `isMacLike2`, `isMarkedPresentational`, `isMarkedPresentational2`, `isMasked`, `isMockFunction`, `isMockFunction2`, `isModifiedEvent`, `isModifierKey`, `isModifierLock`, `isMouseEvent`, `isMulti`, `isNamedNodeMap`, `isNamedNodeMap2`, `isNativeHostLanguageTextAlternativeElement`, `isNativeHostLanguageTextAlternativeElement2`, `isNewPlugin`, `isNewPlugin2`, `isNode2`, `isNumberElement`, `isNumberSkeleton`, `isNumeric`, `isObject`, `isObject2`, `isObject5`, `isObjectLike`, `isObjectLiteral`, `isObjectType`, `isObjectWithKeys`, `isPartiallyChecked`, `isPlainObject`, `isPluralElement`, `isPoundElement`, `isPressedRef`, `isPrimitive`, `isPrimitive2`, `isPrimitive4`, `isPromise2`, `isPromiseLike`, `isPrototypeKey`, `isProxyEnabled`, `isQuestionMarkUnknownType`, `isReact17Element`, `isReactChildString`, `isRegExp2`, `isRegExp22`, `isRemoved`, `isReplaceable`, `isRequiredOnFormTagsExceptInput`, `isRequiredOnSupportedInput`, `isRouteErrorResponse`, `isSVGElement`, `isSVGElement2`, `isSVGSVGElement`, `isSVGSVGElement2`, `isSVGTitleElement`, `isSVGTitleElement2`, `isScrollParent`, `isScrollingWithinScrollbarBounds`, `isSelectElement`, `isSelected`, `isShadowRoot`, `isSlottable`, `isSlottable2`, `isSpyCalledBeforeAnotherSpy`, `isSpyFunction`, `isSquaredProperty`, `isStyleVisible`, `isSubset`, `isSubsetOf`, `isSubtreeInaccessible`, `isSupportsValidityMethod`, `isSymbol`, `isTableElement`, `isTagElement`, `isTestEnvironment`, `isTextNode`, `isTimeElement`, `isToStringedArrayType`, `isToStringedArrayType2`, `isTokenType`, `isTransitionEvent`, `isTreatedAsCharacterContent`, `isType`, `isTypedArray`, `isUISelectionStart`, `isUIValue`, `isUnsafeProperty`, `isValidDateOrTimeValue`, `isValidInput`, `isValidNumberInput`, `isVisible`, `isWindow`, `itemRef`, `iterableEqual`, `iterableEquality`, `iterableEqualityWithStack`, `iterationDecorator`, `iteratorProxy`, `javascript`, `jb`, `jd`, `je`, `jestFakeTimersAreEnabled`, `jg`, `ji`, `jj`, `jk`, `jl`, `join`, `joinAlignedDiffsExpand`, `joinAlignedDiffsNoExpand`, `joinPaths`, `jsExtras2`, `json3`, `jsx10`, `jtpTransform`, `k`, `kb`, `ke`, `kebab`, `keyDef`, `keyboard`, `keyboard2`, `keyboardAction`, `keyframe`, `keyframes`, `keys`, `keys2`, `keysEqual`, `kh`, `ki`, `kj`, `kk`, `l`, `labelStacks`, `lb`, `lh`, `li`, `lighten`, `linearScale`, `listCacheClear`, `listCacheDelete`, `listCacheGet`, `listCacheHas`, `listCacheSet`, `listLanguages`, `listScrollParents`, `listenWhenCalled`, `lj`, `ll`, `loadShould`, `logDOM`, `logRoles`, `m3`, `main`, `makeDocumentPositionErrorString`, `makeElementSelector`, `makeFindQuery`, `makeGetAllQuery`, `makeKeyWordRule`, `makeName`, `makeNormalizer`, `makePunctuationRule`, `makeRoleSelector`, `makeSingleQuery`, `makeSuggestion`, `mapCacheClear`, `mapCacheDelete`, `mapCacheGet`, `mapCacheHas`, `mapCacheSet`, `mapSymbols`, `mapToEntries`, `mapToEntries2`, `mapToStyles`, `mapValues`, `mark`, `markdown2`, `markup2`, `match`, `match3`, `matchGrammar`, `matchPattern`, `matchRegExp`, `matcherHint`, `matches`, `matches2`, `matches3`, `mc`, `me`, `measureElement`, `memoize`, `memoize12`, `memoize2`, `memoizeCapped`, `memoizeCompare`, `memoizeSet`, `memoized`, `memoizerific`, `merge`, `merge3`, `mergeByName`, `mergeConfig`, `mergeConfigs`, `mergeLiteral`, `mergePaddingObject`, `mergeProps`, `mergeProps2`, `mergeWith`, `merge_default`, `method`, `mh`, `mi`, `middleware`, `mix`, `ml`, `mockCall`, `mockChannel`, `mockChannel2`, `mocked`, `modifySelectionPerMouseMove`, `monadic`, `moveSelection`, `moveToMostRecentLru`, `murmur2`, `n`, `nameSpaceClassNames`, `nameToHex`, `navigateToKey`, `nc`, `nd`, `ne`, `nestResults`, `newline`, `next`, `nf`, `nh`, `ni`, `nj`, `nl`, `noColor`, `node`, `node3`, `nodeIsComment`, `nodeIsComment2`, `nodeIsComment3`, `nodeIsFragment`, `nodeIsFragment2`, `nodeIsFragment3`, `nodeIsText`, `nodeIsText2`, `nodeIsText3`, `noop`, `noop2`, `noop3`, `normaliseOptions`, `normaliseOptions2`, `normalize`, `normalize3`, `normalize4`, `normalizeDiffOptions`, `normalizeErrorMessage`, `normalizeSearch`, `notAvailableTransform`, `notCategory`, `now`, `nullableParslet`, `numberToHex`, `numberValueDeserializer`, `o`, `oa`, `ob`, `objDisplay`, `objRef`, `objectEqual`, `objectToString`, `od`, `oe`, `offset`, `offset2`, `oh`, `oi`, `oj`, `ol`, `omit`, `onClick`, `onContextMenu`, `onDone`, `onFocus`, `onHide`, `onHoverStart`, `onKeyDown`, `onMockCall`, `onPointerMove`, `onPointerOver`, `onPointerUp`, `onScroll`, `onSelect`, `onTouchMove`, `onTransitionStart`, `onceListener`, `oneOf`, `opacify`, `open`, `openAt`, `optionOrResetToInternal`, `optionToInternal`, `orDefault`, `order`, `orderModifiers`, `ordinalOf`, `outlineCSS`, `overlapAdjustment`, `overwriteChainableMethod`, `overwriteMethod`, `overwriteProperty`, `ownKeys`, `ownKeys2`, `ownKeys3`, `ownKeys4`, `p`, `p2`, `p3`, `pa`, `parse2`, `parse8`, `parse9`, `parseBoolean`, `parseCSS`, `parseConciseScientificAndEngineeringStem`, `parseDateTimeSkeleton`, `parseEntities`, `parseError`, `parseErrorCode`, `parseKeyDef`, `parseKeyDef2`, `parseNotationOptions`, `parseNumberSkeleton`, `parseNumberSkeletonFromString`, `parsePath`, `parsePath3`, `parsePrimitive`, `parsePrimitives`, `parseQuery`, `parseSign`, `parseSignificantPrecision`, `parseToHsl`, `parseToRgb`, `parseUrl`, `parslet`, `partition`, `paste`, `paste2`, `patchFocus`, `patchedBlur`, `patchedFocus`, `pd`, `peek`, `pf`, `ph`, `pi`, `pick`, `pickBy`, `pickFrameByRefId`, `pj`, `pl`, `pluralize`, `pointer`, `pointer2`, `pointerAction`, `popperGenerator`, `popperOffsets`, `position2`, `positionCoordinate`, `powerSetPermutations`, `prefix3`, `prepareDocument`, `prepareElement`, `prepareForTelemetry`, `prepareInterceptor`, `prepareRangeTextInterceptor`, `prepareSelectionInterceptor`, `prepareValueInterceptor`, `prettyDOM`, `prettyRoles`, `prev`, `preventDefaultAndToggle`, `preventOverflow`, `printAnnotation`, `printAttribute`, `printBasicValue`, `printBasicValue2`, `printBigInt`, `printBigInt2`, `printChildren`, `printChildren3`, `printComment`, `printComment3`, `printCommonLine`, `printComplexValue`, `printComplexValue2`, `printDeleteLine`, `printDiffLine`, `printDiffLines`, `printDiffOrStringify`, `printElement`, `printElement3`, `printElementAsLeaf`, `printElementAsLeaf3`, `printError`, `printError2`, `printExpected`, `printExpected2`, `printFunction`, `printFunction2`, `printImmutableEntries`, `printImmutableRecord`, `printImmutableRecord2`, `printImmutableSeq`, `printImmutableValues`, `printInsertLine`, `printIteratorEntries`, `printIteratorEntries2`, `printIteratorValues`, `printIteratorValues2`, `printListItems`, `printListItems2`, `printNumber`, `printNumber2`, `printObjectProperties`, `printObjectProperties2`, `printPlugin`, `printPlugin2`, `printProps`, `printProps2`, `printProps3`, `printReceived`, `printReceived2`, `printSymbol`, `printSymbol2`, `printText`, `printText3`, `printTree`, `printWithType`, `printer`, `printer2`, `printoutStyles`, `process2`, `processError`, `processLines`, `prohibited`, `prohibitsNaming`, `prohibitsNaming2`, `proxify`, `pruneLocation`, `push`, `pushBackgroundColor`, `pushForegroundColor`, `pushStyle`, `pushTag`, `pushText`, `pxToNumber`, `q`, `qa`, `qd`, `qf`, `qh`, `qi`, `qj`, `ql`, `queryAllByAttribute`, `queryAllLabels`, `queryAllLabelsByText`, `queryByAttribute`, `queryIdRefs`, `queryIdRefs2`, `querySelectedOptions`, `querySelectedOptions2`, `querySelectorAllSubtree`, `querySelectorAllSubtree2`, `queue`, `quote`, `quoteComplexKey`, `quoteComplexKey2`, `r`, `r2`, `range`, `rb`, `rd`, `re`, `reactiveMock`, `readBlobText`, `readDataTransferFromClipboard`, `readNextDescriptor`, `readPrintableChar`, `readSelectedValueFromInput`, `readTag`, `realText`, `reassign`, `recordAsyncExpect`, `rectToClientRect`, `regexpEqual`, `register`, `registered`, `releaseAllKeys`, `remove2`, `removeCachedResult`, `removeRange`, `removeRemovedOptions`, `removeXterm256Background`, `removeXterm256Foreground`, `renderMenu`, `replace`, `replace2`, `replaceAsymmetricMatcher`, `replaceTrailingSpaces`, `replaceTrailingSpaces2`, `replacer`, `replacer3`, `requireBuild`, `requireJsTokens`, `requireReactIs`, `requireReactIs_production`, `requireReactIs_production_min`, `rescale`, `reset2`, `resetAllMocks`, `resetClipboardStubOnView`, `resetStyles`, `resolveCaretPosition`, `resolvePath`, `resolvePathname`, `resolveTo`, `respondTo`, `restore`, `restore2`, `restoreAllMocks`, `restoreProperty`, `rgb`, `rgb2`, `rgbToHsl`, `rgba`, `ri`, `rj`, `rl`, `roleSupportsChecked`, `roles3`, `root2`, `round`, `roundOffsetsByDPR`, `roundedRect`, `rule`, `rules`, `ruleset`, `rulesheet`, `runModifierEffects`, `runWithExpensiveErrorDiagnosticsDisabled`, `s3`, `sa`, `safe`, `safeWindow`, `safeWindow2`, `sanitize`, `sanitizeNumber`, `sanitizeValue`, `satisfy`, `saturate`, `sb2`, `scroll`, `se`, `selectAll`, `selectOption`, `selectOptions`, `selectOptions2`, `selectOptionsBase`, `selector`, `serialize`, `serialize2`, `serialize3`, `serializeStyles`, `serializeValue`, `serializerDefault`, `set2`, `setCanvasWidthAndHeight`, `setFiles`, `setHue`, `setLevelRef`, `setLightness`, `setMousePosition`, `setNativeValue`, `setRef`, `setRef2`, `setSaturation`, `setSelectedFromDefault`, `setSelection`, `setSelectionPerMouseDown`, `setSelectionRange`, `setState`, `setStyleColor`, `setUISelection`, `setUISelectionClean`, `setUISelectionRaw`, `setUIValue`, `setUIValueClean`, `setWhatsNewCache`, `setWhatsNewState`, `setupDirect`, `setupMain`, `setupSub`, `sf`, `sh`, `shade`, `sheetForTag`, `shift`, `shouldCloseOnInteractOutside`, `shouldGetter`, `shouldHighlight`, `shouldProcessLinkClick`, `shouldSetter`, `shouldSkipShortcut`, `si`, `simpleEqual`, `singleCharReplacer`, `sizeof`, `sizes`, `sj`, `slice`, `sort`, `sortMap`, `sortSet`, `sorter`, `sparseArrayEquality`, `splitClassNames`, `spyOn`, `spyOn2`, `stack`, `startTrackValue`, `store_setup_default`, `strategyDefault`, `strategyMonadic`, `strategyVariadic`, `stringDistanceCapped`, `stringValueRule`, `stringify2`, `stringify5`, `stringify8`, `stringifyAll`, `stringifyObject`, `stringifyRules2`, `stringifyToken`, `stripBasename`, `stripUnit`, `strlen`, `style`, `stylesheet`, `submenuKeyDown`, `subsetEquality`, `substr`, `supportedRoles`, `supportedRolesSentence`, `supportsMaxLength`, `synchronize`, `t`, `t2`, `ta`, `tab`, `tab2`, `tc`, `te`, `test2`, `test3`, `testHasAttribute`, `testName`, `testNode`, `textContent`, `textWithRect`, `tf`, `tg`, `ti`, `tint`, `tj`, `toAppearAfter`, `toAppearBefore`, `toArray2`, `toBeChecked`, `toBeDisabled`, `toBeEmpty`, `toBeEmptyDOMElement`, `toBeEnabled`, `toBeInTheDOM`, `toBeInTheDocument`, `toBeInvalid`, `toBePartiallyChecked`, `toBePartiallyPressed`, `toBePressed`, `toBeRequired`, `toBeValid`, `toBeVisible`, `toColorHexString`, `toColorString`, `toContainElement`, `toContainHTML`, `toHaveAccessibleDescription`, `toHaveAccessibleErrorMessage`, `toHaveAccessibleName`, `toHaveAttribute`, `toHaveClass`, `toHaveDescription`, `toHaveDisplayValue`, `toHaveErrorMessage`, `toHaveFocus`, `toHaveFormValues`, `toHaveRole`, `toHaveSelection`, `toHaveStyle`, `toHaveTextContent`, `toHaveValue`, `toHexString`, `toHumanReadableAnsi`, `toInt`, `toInteger`, `toInteger2`, `toKey`, `toLength`, `toLength2`, `toMerged`, `toNumber2`, `toPrimitive`, `toPropertyKey`, `toSentence`, `toSource`, `toString`, `token`, `tokenToString`, `tokenize2`, `tooltipLabel`, `trackOrSetValue`, `transferFlags`, `transform`, `transitState`, `transparentize`, `traverse`, `triggerHoverStart`, `trim`, `tripleClick`, `tripleClick2`, `truncate`, `truncate2`, `truncate3`, `tryParse`, `tsx2`, `type`, `type2`, `type3`, `type4`, `typeEquality`, `typeOf`, `typescript2`, `ub`, `uc`, `ue`, `ug`, `ui`, `uj`, `unhover`, `unhover2`, `unindent`, `update`, `update2`, `updateBoxStyles`, `updateBoxes`, `updateHovered`, `updatePosition`, `updateSelectionOnFocus`, `updateState`, `updateStickyStack`, `upload`, `upload2`, `use2`, `useAddonState`, `useArgTypes`, `useArgs2`, `useAriaDescription`, `useAttribute`, `useCallbackRef`, `useChannel2`, `useComposedRefs`, `useContext22`, `useControlledState`, `useCurrentRouteId`, `useCurrentStory`, `useDataRouterContext`, `useDataRouterContext2`, `useDataRouterState`, `useDebounceCallback`, `useDirection`, `useEffect5`, `useFormAction`, `useFormResetListener`, `useGetLatest`, `useGlobalTypes`, `useGlobals2`, `useHook`, `useHref`, `useInRouterContext`, `useIsomorphicLayoutEffect`, `useLatest`, `useLinkClickHandler`, `useList`, `useListener`, `useLocation`, `useMediaQuery`, `useMemo3`, `useMemoLike`, `useNavigate`, `useNavigateStable`, `useNavigateUnstable`, `useParameter2`, `usePopperTooltip`, `usePresence`, `usePrevious`, `useResizeObserver`, `useResizeObserver2`, `useResolvedElement`, `useResolvedPath`, `useRouteContext`, `useRouteError`, `useRouteId`, `useSharedState`, `useStateMachine`, `useStateMachine2`, `useStoryPrepared`, `useStorybookApi`, `useStorybookState`, `useSubmit`, `useSyncExternalStore`, `useUniversalStore`, `v`, `validateClientSideSubmission`, `validateOptions2`, `validateOptions3`, `valueToExternal`, `valueToId`, `variadic`, `vb`, `vc`, `ve`, `vf`, `vg`, `vi`, `visit`, `vj`, `wait`, `waitFor`, `waitForElementToBeRemoved`, `waitForWrapper`, `walkNodes`, `walkRadio`, `walkTokens`, `warning`, `wasFocusInElement`, `wc`, `wf`, `wg`, `whitespace`, `whitespace2`, `wi`, `withId`, `withImplementation`, `withMeasure`, `withOutline`, `withTheme`, `within2`, `withinMaxClamp`, `wj`, `wrap`, `wrapAndBindImpl`, `wrapAnsi256`, `wrapAssertion`, `wrapAsync`, `wrapEvent`, `wrapSingleQueryWithSuggestion`, `writeDataTransferToClipboard`, `xb`, `xc`, `xh`, `xi`, `xj`, `xlinkTransform`, `xmlTransform`, `y`, `yaml2`, `yc`, `yh`, `yi`, `yj`, `z`, `zc`, `zd`, `zf`, `zh`, `zi`
- Top-level variables:
  - `A`, `A3`, `ADDON_ID`, `ADDON_ID2`, `ADDON_ID3`, `ADDON_ID4`, `ADDON_ID5`, `ADDON_ID6`, `ANY`, `AbstractToolbar`, `Action`, `ActionListItem`, `AddonStore`, `AddonStore2`, `Addon_TypesEnum`, `AnimationEvent`, `ApiLevel`, `AsymmetricMatcher3`, `AwaitRenderStatus`, `B`, `B2`, `B3`, `BadgeWrapper`, `BarInner`, `BaseContext`, `BaseSelect`, `Blockquote`, `Button`, `ButtonOrLink`, `Buttons`, `C3`, `CASE_SPLIT_PATTERN`, `CHANNEL_EVENT_PREFIX`, `Category`, `Cf`, `ChangeBuffer`, `Child`, `ClickInputOnEnter`, `ClipboardEvent`, `ClipboardStubControl`, `Code3`, `CollapseIcon2`, `CollapsibleContent`, `Comp2`, `CompositionEvent`, `Constructor`, `Container6`, `Container7`, `Content3`, `Context`, `CoreWebpackCompiler`, `DATE_TIME_REGEX`, `DEEPLY_EQUAL`, `DEFAULT_BACKGROUNDS`, `DEFAULT_OPTIONS2`, `DEFAULT_THEME`, `DEFAULT_THEME2`, `DIFF_DELETE`, `DL`, `DOCUMENT_POSITION_DISCONNECTED`, `DOMProps`, `DOM_KEY_LOCATION`, `DataRouterContext`, `DataRouterHook`, `DataRouterHook2`, `DataRouterStateHook2`, `DataTransferItemStub`, `Device`, `Dh`, `Div`, `DocumentWrapper`, `DragEvent`, `ELEMENT_NODE`, `ERROR_MESSAGE`, `EVENTS`, `EVENTS2`, `Ec`, `Ei`, `EmptyContent`, `ErrorCode`, `ErrorKind`, `ErrorPlugin`, `Event2`, `F`, `FOCUSABLE_SELECTOR`, `FORM_TAGS`, `FRACTION_PRECISION_REGEX`, `Feature`, `Ff`, `Fh`, `Filter`, `FinalTag`, `FocusEvent2`, `Form2`, `FormatError`, `GetIntrinsic`, `H`, `H1`, `H2`, `H3`, `H4`, `H5`, `H6`, `HEX`, `HIDDEN_TEXTAREA_STYLE`, `HR`, `Hash_default`, `He`, `I`, `IDENTIFIER_PREFIX_RE_1`, `INCOMPATIBLE`, `IS_KEYED_SENTINEL2`, `IS_RECORD_SYMBOL`, `Ia`, `Ib`, `Identifier`, `Img`, `Info`, `Input`, `Input4`, `InputEvent`, `Interceptor`, `IntlMessageFormat`, `InvalidCSSError`, `InvalidValueError`, `InvalidValueTypeError`, `IteratorSymbol`, `J`, `JSX`, `Ja`, `JestExtendError`, `Jj`, `KeyboardEvent2`, `KeyboardHost`, `Kg`, `L`, `LEFT_BUTTON`, `LI`, `LOGLEVEL`, `LRU`, `LRUCache`, `LZString`, `LZString2`, `Lb`, `List`, `ListCache_default`, `ListItem_default`, `Listbox`, `LoaderWrapper`, `MATCHERS_OBJECT`, `MAX_DEPTH`, `MAX_DIFF_STRING_LENGTH`, `MAX_LENGTH`, `MS`, `ManagerContext`, `MapCache_default`, `MapOrSimilar`, `Markers`, `Mb`, `MemoizeMap`, `Mi`, `MissingValueError`, `MockUniversalStore`, `Modal`, `ModalContext`, `Modal_styled_exports`, `Mouse`, `MouseButtonFlip`, `MouseEvent2`, `N`, `NO_DIFF_MESSAGE`, `Na`, `Nf`, `Nj`, `Node2`, `Note`, `OBJECT_PROTO`, `Ob`, `OutletContext`, `OwnElement`, `P`, `P3`, `PAGE_STEP_SIZE`, `PARAM_KEY3`, `PART_TYPE`, `PREPARE_ABORTED`, `Panel`, `Pe`, `Pointer`, `PointerEvent2`, `PointerEventsCheck`, `PointerEventsCheckLevel`, `PointerHost`, `PolishedError`, `PopStateEvent`, `PopStateEventType`, `PopoverProvider`, `Pre2`, `Precedence`, `Prism`, `ProgressEvent`, `Qd`, `REACT`, `REACT_ELEMENT_TYPE`, `Range`, `React`, `React10`, `React11`, `React12`, `React14`, `React15`, `React16`, `React2`, `React22`, `React23`, `React251`, `React27`, `React28`, `React3`, `React30`, `React31`, `React32`, `React4`, `React60`, `React67`, `React68`, `React69`, `React70`, `React71`, `React72`, `React9`, `React99`, `ReactIs2`, `RequestResponseError`, `ResetWrapper`, `ResultType`, `Rh`, `Root2`, `Root3`, `S`, `SAFE_TIMERS_SYMBOL`, `SEMVER_SPEC_VERSION`, `SKELETON_TYPE`, `SLOTTABLE_IDENTIFIER`, `SNIPPET_RENDERED`, `SPACE_CHARACTERS`, `SPACE_SEPARATOR_REGEX`, `SPACE_SYMBOL`, `SPACE_SYMBOL2`, `START_TRANSITION`, `START_TRANSITION2`, `STATUS`, `STORAGE_KEY`, `SYMBOL_REGEXP`, `SYMBOL_STATE`, `SelectOption`, `SelectedOptionCount`, `SemVer`, `Separator2`, `SetLike`, `SetLike2`, `Sf`, `Side`, `Similar`, `Slot2`, `SlotClone2`, `Slottable2`, `Span`, `StatusTypeIdMismatchError`, `StatusTypeIdMismatchError3`, `Store`, `StorybookError`, `StringContaining`, `Styled`, `StyledBar`, `StyledButton`, `StyledButton3`, `StyledTab`, `StyledTabButton`, `StyledTabButton2`, `StyledToggle`, `SupportedBuilder`, `SupportedFramework`, `SupportedLanguage`, `SupportedRenderer`, `System`, `T2`, `TEXT_NODE2`, `TITLE_PATH_SEPARATOR`, `TT`, `TYPE`, `TabErrorBoundary`, `Table`, `TabsState`, `Tag`, `Textarea`, `Title2`, `Title3`, `Title4`, `ToggleButton`, `TooltipProvider`, `TouchEvent`, `TrackChanges`, `TransitionEvent`, `U`, `UIEvent`, `UIValue`, `UNIVERSAL_CHECKLIST_STORE_OPTIONS`, `UNIVERSAL_STATUS_STORE_OPTIONS`, `UNIVERSAL_TEST_PROVIDER_STORE_OPTIONS`, `UNSAFE_DEFERRED_SYMBOL`, `UTF8_ACCEPT`, `Ug`, `UniversalStore`, `Vf`, `VisuallyHidden`, `Vk`, `WHATS_NEW_NOTIFICATION_ID`, `WHITE_SPACE_REGEX`, `We`, `Wi`, `WithTooltip_exports`, `WrappedComponent`, `Wrapper2`, `Wrapper3`, `Wrapper4`, `Wrapper6`, `X`, `XMLNS`, `Zoom`, `ZoomElementWrapper`, `_`, `_Object`, `_React`, `_React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_ReactCurrentOwner`, `_UNITS_unit`, `__DEV__`, `__create`, `__create2`, `__createBinding`, `__defProp`, `__defProp3`, `__getOwnPropDesc`, `__getOwnPropNames`, `__getProtoOf`, `__importDefault`, `__require`, `_a2`, `_a3`, `_a4`, `_a5`, `_action_target`, `_activeElement_shadowRoot`, `_alertRole`, `_allRoles`, `_alpha`, `_anchorNode_ownerDocument_getSelection`, `_anchorRect_bottom`, `_anchorRect_top`, `_ansiRegex`, `_ansiStyles`, `_ariaAbstractRoles`, `_ariaPropsMap`, `_behavior_type`, `_boundaryDimensions_scroll_axis`, `_boundaryDimensions_scroll_top`, `_cachedItemNodes_length`, `_calculateNodeHeight`, `_changes_tracked`, `_checkPointerEvents`, `_child`, `_child2`, `_childNode_key`, `_childNode_value`, `_childOffset_crossAxis`, `_childOffset_crossSize`, `_children`, `_children2`, `_children3`, `_class`, `_code`, `_collectionRef_current`, `_collection_getItem_props`, `_collections`, `_commandRole`, `_computeAriaValueText`, `_config_document_defaultView`, `_containerDimensions_scroll_axis`, `_container_scrollLeft`, `_container_scrollWidth`, `_contenteditable_firstChild`, `_def_code`, `_def_key`, `_default`, `_delegate_getFirstKey`, `_delegate_getFirstKey1`, `_delegate_getKeyAbove`, `_delegate_getKeyBelow`, `_delegate_getKeyLeftOf`, `_delegate_getKeyRightOf`, `_delegate_getLastKey`, `_delegate_getLastKey1`, `_docAbstractRole`, `_doc_activeElement`, `_document_activeElement`, `_dom`, `_e_detail`, `_el_fakeFiles`, `_el_ownerDocument`, `_el_querySelector`, `_el_textContent`, `_element`, `_elementRoles`, `_element_TrackChanges_tracked`, `_element_firstChild`, `_element_form_elements`, `_element_getAttribute`, `_element_labels`, `_element_ownerDocument_getElementById_textContent`, `_element_parentNode`, `_element_selectionStart`, `_element_textContent`, `_error`, `_escapeHTML`, `_event`, `_event_clipboardData`, `_excluded2`, `_extends22`, `_firstNode_key`, `_first_key`, `_focusScopeTree_getTreeNode`, `_focusScopeTree_getTreeNode_parent`, `_focusedNode_current`, `_formDataSupportsSubmitter`, `_generatorOptions`, `_get`, `_getActiveElement`, `_getComputedStyle`, `_getContentEditable`, `_getFirstItem`, `_getFirstItem_key`, `_getSuggestedQuery`, `_getValueOrTextContent`, `_globalListeners_current_get`, `_graphicsDocumentRole`, `_groupRef_current`, `_hue`, `_input_files`, `_input_files2`, `_insert`, `_interaction_current`, `_item_props`, `_iterationDecorator`, `_iterator2`, `_iteratorProxy`, `_keyboardMap_find`, `_keydownBehavior_event_key`, `_keys_values_next_value`, `_keyupBehavior_event_key`, `_labels`, `_lastFocused_current`, `_last_key`, `_listProps_onKeyDown`, `_manager_lastSelectedKey`, `_margins_axis1`, `_margins_left`, `_margins_top`, `_markup`, `_method`, `_n`, `_nameFromAlt`, `_nextSibling_node_key`, `_node`, `_nodeToRestoreRef_current`, `_node_colIndex`, `_node_key`, `_node_nextKey`, `_node_ownerDocument`, `_node_parent`, `_node_parent_scopeRef`, `_node_prevKey`, `_offsetModifierState`, `_options`, `_options_allowsCellSelection`, `_options_document`, `_opts_containingElement_scrollIntoView`, `_opts_from`, `_opts_root`, `_parentMenuRef_current`, `_parentNode_type`, `_partialNode_index`, `_partialNode_index1`, `_partialNode_value`, `_popperProps`, `_positionA_coords`, `_position_bottom`, `_position_maxHeight`, `_position_target`, `_previousPosition_caret`, `_process`, `_prohibitedAttributes`, `_properties`, `_props_defaultSelectedKey`, `_props_href`, `_props_id`, `_props_isDisabled`, `_props_isSelected`, `_props_offset`, `_props_onSelectionChange`, `_proto`, `_ref`, `_ref2`, `_ref4`, `_ref6`, `_ref8`, `_ref9`, `_refCountMap_get`, `_ref_current`, `_ref_current_parentElement`, `_rendered_props_id`, `_ret`, `_roleElement`, `_roleElements`, `_scope_`, `_scrollRef_current`, `_section_props`, `_section_props_arialabel`, `_selectedKeys_anchorKey`, `_selectedKeys_currentKey`, `_self`, `_startItem_index`, `_startItem_index2`, `_startRef_current`, `_state`, `_stateRef_current_observer`, `_state_focusStrategy`, `_state_metaKeyEvents`, `_state_metaKeyEvents1`, `_state_target`, `_step3`, `_submenuRef_current`, `_tag`, `_targetElement_scrollIntoView`, `_target_parentElement`, `_test`, `_text_slice_match`, `_text_slice_match_`, `_this`, `_this_assertiveLog`, `_this_collection_getItem`, `_this_collection_getItem_props`, `_this_count_button`, `_this_count_button1`, `_this_filter`, `_this_firstVisibleChild_node`, `_this_firstVisibleChild_node_key`, `_this_items_find`, `_this_keyMap_get`, `_this_lastVisibleChild_node_key`, `_this_layoutDelegate`, `_this_mouse_position_target`, `_this_node`, `_this_parentNode`, `_this_parentNode_node`, `_this_parentNode_node_key`, `_this_position_caret`, `_this_position_target`, `_this_previousVisibleSibling_node_key`, `_this_registry`, `_this_registry_code`, `_typeAndSelection_selection`, `_useContext`, `_usePopper`, `_useSSRCollectionNode`, `_useSlottedContext`, `_v_key`, `_val`, `_valueDescr_set`, `_value_match`, `_visualViewport_height`, `_visualViewport_pageLeft`, `_visualViewport_pageTop`, `_visualViewport_scale`, `_visualViewport_width`, `_vitest_worker__`, `_window_AnimationEvent`, `_window_ClipboardEvent`, `_window_CompositionEvent`, `_window_DragEvent`, `_window_Event`, `_window_FocusEvent`, `_window_InputEvent`, `_window_KeyboardEvent`, `_window_MouseEvent`, `_window_PointerEvent`, `_window_PopStateEvent`, `_window_ProgressEvent`, `_window_TouchEvent`, `_window_TransitionEvent`, `_window_UIEvent`, `_window_event_type`, `_window_navigator_userAgentData`, `_window_visualViewport`, `_window_visualViewport_height`, `a3`, `a4`, `aAncestors`, `aCount`, `aDiff`, `aDisplay`, `aEntries`, `aFormat`, `aKeys`, `aMultipleLines`, `aRest`, `aStack`, `aStart`, `aStartFollowing`, `aTag`, `aType`, `aValue`, `aValues`, `aa`, `abs`, `abs2`, `ac`, `accumulatedText`, `accumulatedText2F`, `actions`, `active`, `activeCall`, `activeElement`, `activeNode`, `actual`, `actualAccessibleDescription`, `actualAccessibleName`, `actualCurrent`, `actualRoles`, `additional`, `addons`, `addons2`, `addons3`, `addons_exports`, `adjust`, `adjusted`, `adjustment`, `afterIndicators`, `alertRole`, `alertdialogRole`, `alias`, `aliases`, `aliases2`, `allFound`, `allKeys`, `allLineNumbers`, `allStylesheetSelectors`, `allowed`, `alpha`, `alphabetical`, `alreadyCompletedException`, `alt`, `altVariationSide`, `anchor`, `anchorKey`, `anchorOffset`, `anchorOrAlias`, `anchorRect`, `animations`, `ansiColors`, `ansiColors2`, `ansiConverter`, `ansiMatch`, `anum`, `api`, `apiData`, `apostrophePosition`, `applicationRole`, `applyStyles_default`, `area`, `arg`, `argArray`, `argCloseResult`, `argIndex`, `args`, `argsLength`, `aria`, `ariaAbstractRoles`, `ariaDescription`, `ariaDpubRoles`, `ariaGraphicsRoles`, `ariaHasPopup`, `ariaInvalidName`, `ariaInvalidVal`, `ariaLabel`, `ariaLiteralRoles`, `arrLength`, `arrayMap_default`, `arrowPosition`, `arrowRef`, `art`, `articleRole`, `asNumber`, `asString`, `asTemplateStringsArr`, `assert3`, `assertErr`, `assertionErrorObjectProperties`, `assignedNodes`, `assocIndexOf_default`, `ast`, `astGenerator`, `asymmetricA`, `asymmetricMatcher`, `asymmetricMatchers`, `atimport`, `attr`, `attribute`, `attributeValue`, `attributes`, `autoFocusRef`, `availableSlots`, `availableWidth`, `b`, `b2`, `bF`, `bIterator`, `bLast`, `bLastPrev`, `bProp`, `bR`, `ba`, `backgroundStyles`, `bannerRole`, `base`, `baseGetTag_default`, `baseGet_default`, `baseIsNative_default`, `basePathGrammar`, `basePlacement`, `baseScope`, `baseStore`, `baseToString_default`, `basename`, `basicResult`, `before`, `beforeInvocationCallOrder`, `behavior`, `best`, `bestEquality1`, `bgColor`, `bind`, `blockquoteRole`, `blurred`, `borderHeight`, `borderLabels`, `bottom2`, `boxElement`, `boxElementByTargetElement`, `braces`, `bracketDict`, `brackets`, `brands`, `buildExports`, `builder`, `builtValue`, `builtins`, `button`, `buttonProps`, `buttonRole`, `c`, `c2`, `cache`, `cacheBabelInterop`, `cacheIdRef`, `cacheKey`, `cacheMeasurements`, `cached`, `cachedCollection`, `call2`, `callBind`, `callBound`, `callOrder`, `callRefsByResult`, `callback`, `callbackRef`, `callbacks`, `callsById`, `canElideFrames`, `canSetPrototype`, `canceled`, `candidates`, `canvas`, `captionRole`, `caseSensitiveTransform`, `castPath_default`, `catharsisTransformRules`, `caughtErr`, `cbElement`, `cbElementRef`, `cd`, `ce`, `cellRole`, `ch`, `chainableBehavior`, `chainableMethodWrapper`, `changed`, `changes`, `channel`, `channel_exports`, `channels_exports`, `char1`, `char2`, `character2`, `checkForListedLanguage_default`, `check_error_exports`, `checkboxRole`, `checkedRadio`, `checks`, `checks2`, `child`, `childId`, `childNode`, `childNodes`, `childRef`, `childStoryId`, `children`, `children2`, `childrenArray`, `childrenCount`, `childrenCreator`, `childrenRef`, `childrenResult`, `chromeDark`, `chunk2`, `classList`, `className`, `classNames`, `classes`, `cleanup`, `cleanupFn`, `clickTarget`, `clickableInputTypes`, `clicked`, `clientRect`, `clientX`, `client_logger_exports`, `clippingParents2`, `clone3`, `cloned`, `clonedExpected`, `clonedTree`, `closeParentheses`, `closingTagNameStartPosition`, `cls`, `clsx_default`, `cmp`, `code`, `codeFrame`, `codeLang`, `codeMap`, `codePoints`, `codeRole`, `codeString`, `codeUpper`, `codes`, `coerceRtlRegex`, `collect`, `collection`, `collection2`, `collectionId`, `color`, `color2`, `colors`, `colors2`, `colors3`, `colorsJSON`, `colorsObjs`, `columnheaderRole`, `combined`, `comboData`, `comboboxRole`, `comma`, `commandRole`, `commentColor`, `commonString`, `commonStyles`, `comp`, `comparator`, `comparatorResult`, `comparators`, `compare`, `compareBuild`, `comparisonString`, `complementaryRole`, `componentName`, `componentSelector`, `componentWrapperRef`, `components`, `components2`, `components_exports`, `compositeRole`, `comps`, `computedClassName`, `compver`, `concept`, `conciseScientificAndEngineeringOpts`, `config2`, `config4`, `configFilters`, `configFilters2`, `constraint`, `constructorName`, `container`, `containerHeight`, `containerRect`, `containerRef`, `containerScroll`, `contains2`, `content`, `contentColor`, `contentWidth`, `contenteditable`, `contentinfoRole`, `contents`, `context`, `contextState`, `contextStyle`, `contexts`, `controlType`, `converted`, `coords`, `copyKey`, `core_events_exports`, `count`, `countByTitle`, `counter`, `create4`, `createPopper4`, `create_exports`, `credentialsRegex`, `crossOrigin`, `css3`, `cssProp`, `ctor`, `ctx`, `cur`, `currObj`, `current`, `currentAnimationName`, `currentCache`, `currentElement`, `currentIndex`, `currentIsTarget`, `currentNode`, `currentOffset`, `currentOwner`, `currentProto`, `currentScope`, `currentSheet`, `currentState`, `currentStory`, `currentTarget`, `currentTime`, `currentUrl`, `currentValue`, `currentWalker`, `current_value`, `customTesterResult`, `d`, `d2`, `dMin`, `da`, `data`, `dataEmotionAttribute`, `dataMap`, `dataRouterContext`, `dataToInsert`, `dataTransferValue`, `dataViewA`, `dateTimePattern`, `debug2`, `decl`, `declaration2`, `decls`, `decode_1`, `decode_2`, `decode_json_1`, `decorators`, `decorators2`, `decorators3`, `deep_eql_default`, `def`, `defaultCloneOptions`, `defaultCodeValue`, `defaultContexts`, `defaultErrorElement`, `defaultGrid`, `defaultKeyMap`, `defaultKeyMap2`, `defaultLineNumberStyle`, `defaultLocale`, `defaultMethod`, `defaultModifiers`, `defaultModifiers2`, `defaultOptionsDirect`, `defaultPrevented`, `defaultShortcut`, `defaultShortcuts`, `defaultValue`, `defaults`, `define3`, `defineProperty`, `defined`, `definitionEnd`, `definitionRole`, `defs`, `del`, `delRange`, `delay`, `deleteBuffer`, `deletedDiff`, `deletion`, `deletionRole`, `delta`, `deltaW`, `depModifier`, `deprecated`, `deprecatedStoryAnnotation`, `desc`, `descendantLabelableElement`, `describedbyId`, `descriptionHint`, `descriptionString`, `descriptor`, `deselectCurrent`, `dest`, `detailsVisibility`, `device`, `dialogRole`, `dictionary`, `diff2`, `difference2`, `directApi_exports`, `directoryRole`, `dispatchBlur`, `dispose`, `dist`, `dist_exports2`, `div`, `doc`, `docAbstractRole`, `docAcknowledgmentsRole`, `docAfterwordRole`, `docAppendixRole`, `docBacklinkRole`, `docBiblioentryRole`, `docBibliographyRole`, `docBibliorefRole`, `docChapterRole`, `docColophonRole`, `docConclusionRole`, `docCoverRole`, `docCreditRole`, `docCreditsRole`, `docDedicationRole`, `docEndnoteRole`, `docEndnotesRole`, `docEpigraphRole`, `docEpilogueRole`, `docErrataRole`, `docExampleRole`, `docFootnoteRole`, `docForewordRole`, `docGlossaryRole`, `docGlossrefRole`, `docIndexRole`, `docIntroductionRole`, `docNoterefRole`, `docNoticeRole`, `docPagebreakRole`, `docPagefooterRole`, `docPageheaderRole`, `docPagelistRole`, `docPartRole`, `docPrefaceRole`, `docPrologueRole`, `docPullquoteRole`, `docQnaRole`, `docSubtitleRole`, `docTipRole`, `docTocRole`, `document1`, `document13`, `document3`, `documentElement`, `documentObject`, `documentPosition`, `documentRole`, `dom`, `domProps`, `domTypeName`, `dom_esm_exports`, `dot`, `dt`, `dtItem`, `e`, `e2`, `easing`, `eb`, `editableInputTypes`, `eg`, `el`, `elapsed`, `ele`, `element`, `elementCss`, `elementRoleList`, `elementRoleList2`, `elementRoleRelation`, `elementRoles3`, `elementStrings`, `elementStyle`, `elementTextAlternative`, `elements`, `els`, `emphasisRole`, `empty`, `encode_2`, `end2`, `endPosition`, `endentations`, `enhancedSpy`, `ensure`, `entities`, `entities_json_1`, `entity`, `entries`, `entry`, `env`, `envVars`, `eq4`, `eqSet`, `eq_default`, `eql`, `equal`, `equality1`, `err`, `error`, `errorKeys`, `errorKeys2`, `errorLikeString`, `errorMessages`, `errorName`, `errorProto`, `errorsList`, `escapedDescriptor`, `evaluateSubscription`, `event`, `eventInit`, `eventInitializer`, `eventMap`, `eventMap2`, `eventTypeListeners`, `events`, `events2`, `everyArgIsUndefined`, `existing`, `existingStyle`, `expect2`, `expectSpy`, `expected`, `expectedClassList`, `expectedEndBracket`, `expectedValue`, `expectsDescription`, `expectsErrorMessage`, `expectsSelection`, `explicitRole`, `explicitRoleSelector`, `exports`, `extendsType`, `extensions`, `f`, `f2`, `f4`, `f5`, `fadeIn`, `fadeInOut`, `fakeFiles`, `feedRole`, `fh`, `field`, `fieldProps`, `fields`, `figureRole`, `files`, `filter`, `filteredArgTypes`, `filteredCustomTesters`, `filteredSection`, `final`, `finalConfig`, `finalModalProps`, `finalShouldForwardProp`, `find2`, `first`, `firstChild`, `firstClientCodeFrame`, `firstDigit`, `firstKey`, `firstNode`, `firstRowIndex`, `firstStory`, `fittingPlacement`, `flagMsg`, `flags`, `flip_default`, `flippedPlacementInfo`, `fn4`, `fnLengthDesc`, `focusNode`, `focusable`, `focusableProps`, `focusedElement`, `focusedKey`, `focusedNode`, `forceInstrument`, `form`, `formRole`, `formValues`, `format5`, `formatOptions`, `formatOptionsZeroIndent`, `formatRegExp`, `formatter2`, `formatter_exports`, `found`, `found2`, `foundId`, `fr`, `fragmentResult`, `frame`, `freeGlobal`, `from2`, `fromItem`, `fullStatusStore2`, `functionBase`, `functionName`, `functionToString`, `functionType`, `functionTypes`, `g`, `g2`, `gen`, `genericParslet`, `genericRole`, `getArrayName2`, `getFirstChild`, `getMapData_default`, `getMultipleError`, `getNative_default`, `getPromiseValue2`, `getRawTag_default`, `getValue_default`, `get_default`, `getter`, `globalDir`, `globalRegistryKey`, `globalState`, `globalStrings`, `globalWindow`, `globals`, `globalsNameReferenceMap`, `globalsNameValueMap`, `globals_exports`, `grammar`, `graphicsDocumentRole`, `graphicsObjectRole`, `graphicsSymbolRole`, `gridRole`, `gridSelectorId`, `gridSize`, `gridStyleSelector`, `gridcellRole`, `groupRole`, `groups`, `gtfn`, `gtltComp`, `h3`, `h4`, `handleCallback`, `handleEvent`, `handleOrId`, `handleResize`, `handler`, `handlers`, `has`, `has2`, `hasCleanup`, `hasElementType`, `hasEventPrefix`, `hasLanguage`, `hasNativeStartsWith`, `hasOwnProperty6`, `hasParenthesis`, `hasPatch`, `hasPrevious`, `hasProperty2`, `hasRendered`, `hasRequiredReactIs`, `hasRequiredReactIs_production`, `hasRequiredReactIs_production_min`, `hasShortcuts`, `hasSymbols`, `hasX`, `hash2`, `hash3`, `hash4`, `hashClear_default`, `hashDelete_default`, `hashGet_default`, `hashHas_default`, `hashIndex`, `hashSet_default`, `head2`, `headingRole`, `height`, `height2`, `heightGrowthDirection`, `hex3`, `hexTable`, `hf`, `hideTimer`, `hide_default`, `high`, `higher`, `history2`, `historyState`, `hitMaxDepth`, `hook`, `hooks`, `hourCycle`, `hourCycles`, `hourLen`, `hours`, `href`, `hslColor`, `hslMatched`, `hslaMatched`, `htmlFor`, `hue`, `huePrime`, `i`, `i2`, `iEnd`, `iF`, `iLast`, `iLength`, `iR`, `iStart`, `ia`, `iconPaths`, `id`, `id2`, `identifierAndLocation`, `identifierStartRegex`, `identifierWithPointTracking`, `ids`, `ie`, `iframes`, `ignoreProperties`, `ignoreSsrWarning`, `ignoreSsrWarning2`, `imgRole`, `implementation`, `implicitHeadingLevels`, `implicitRole`, `import_ansi_to_html`, `import_aria_query`, `import_aria_query2`, `import_aria_query3`, `import_bash`, `import_browser_dtector`, `import_copy_to_clipboard`, `import_core`, `import_css`, `import_graphql`, `import_hoist_non_react_statics`, `import_js_extras`, `import_jsdoc_type_pratt_parser`, `import_json`, `import_jsx`, `import_jsx_runtime6`, `import_markdown`, `import_markup`, `import_memoizerific`, `import_memoizerific10`, `import_memoizerific12`, `import_memoizerific3`, `import_memoizerific4`, `import_memoizerific5`, `import_memoizerific6`, `import_memoizerific7`, `import_memoizerific8`, `import_memoizerific9`, `import_picocolors3`, `import_picoquery`, `import_picoquery2`, `import_picoquery5`, `import_react10`, `import_react100`, `import_react101`, `import_react102`, `import_react103`, `import_react104`, `import_react105`, `import_react106`, `import_react107`, `import_react108`, `import_react109`, `import_react11`, `import_react110`, `import_react111`, `import_react112`, `import_react113`, `import_react114`, `import_react116`, `import_react117`, `import_react118`, `import_react119`, `import_react12`, `import_react120`, `import_react121`, `import_react122`, `import_react123`, `import_react124`, `import_react125`, `import_react126`, `import_react127`, `import_react128`, `import_react129`, `import_react13`, `import_react130`, `import_react131`, `import_react132`, `import_react133`, `import_react134`, `import_react135`, `import_react136`, `import_react137`, `import_react138`, `import_react14`, `import_react140`, `import_react141`, `import_react142`, `import_react143`, `import_react144`, `import_react145`, `import_react146`, `import_react147`, `import_react148`, `import_react149`, `import_react15`, `import_react150`, `import_react151`, `import_react152`, `import_react153`, `import_react154`, `import_react155`, `import_react156`, `import_react157`, `import_react158`, `import_react159`, `import_react16`, `import_react160`, `import_react161`, `import_react162`, `import_react163`, `import_react164`, `import_react165`, `import_react166`, `import_react167`, `import_react168`, `import_react169`, `import_react17`, `import_react170`, `import_react171`, `import_react172`, `import_react173`, `import_react174`, `import_react175`, `import_react176`, `import_react177`, `import_react178`, `import_react179`, `import_react18`, `import_react180`, `import_react181`, `import_react182`, `import_react183`, `import_react184`, `import_react185`, `import_react186`, `import_react187`, `import_react188`, `import_react189`, `import_react19`, `import_react190`, `import_react20`, `import_react21`, `import_react22`, `import_react23`, `import_react24`, `import_react25`, `import_react26`, `import_react27`, `import_react28`, `import_react29`, `import_react30`, `import_react31`, `import_react32`, `import_react33`, `import_react34`, `import_react35`, `import_react36`, `import_react37`, `import_react38`, `import_react39`, `import_react4`, `import_react40`, `import_react41`, `import_react42`, `import_react43`, `import_react45`, `import_react46`, `import_react47`, `import_react49`, `import_react50`, `import_react51`, `import_react52`, `import_react53`, `import_react54`, `import_react55`, `import_react56`, `import_react57`, `import_react58`, `import_react59`, `import_react60`, `import_react61`, `import_react62`, `import_react63`, `import_react64`, `import_react65`, `import_react66`, `import_react67`, `import_react68`, `import_react69`, `import_react7`, `import_react70`, `import_react71`, `import_react72`, `import_react73`, `import_react74`, `import_react75`, `import_react76`, `import_react77`, `import_react78`, `import_react79`, `import_react8`, `import_react80`, `import_react81`, `import_react82`, `import_react83`, `import_react84`, `import_react85`, `import_react86`, `import_react87`, `import_react88`, `import_react89`, `import_react9`, `import_react90`, `import_react91`, `import_react92`, `import_react93`, `import_react94`, `import_react95`, `import_react96`, `import_react97`, `import_react98`, `import_react99`, `import_react_dom`, `import_react_dom2`, `import_react_dom5`, `import_react_dom6`, `import_redent`, `import_redent2`, `import_shim`, `import_store22`, `import_tiny_isequal`, `import_tsx`, `import_typescript`, `import_yaml`, `included`, `includedCdataInside`, `indent2`, `indentLengths`, `indentationNext`, `index4`, `indexEntries`, `indexId`, `indicator`, `info`, `inherit`, `inheritedComponent`, `init12`, `init16`, `init_Middleware`, `init_Parser`, `init_Prefixer`, `init_Serializer`, `init_added`, `init_arrayLikeToArray`, `init_arrayWithoutHoles`, `init_assertThisInitialized`, `init_computeAutoPlacement`, `init_computeOffsets`, `init_construct`, `init_contains`, `init_debounce`, `init_defineProperty`, `init_detailed`, `init_detectOverflow`, `init_diff`, `init_dist10`, `init_dist11`, `init_emotion_hash_esm`, `init_emotion_memoize_esm`, `init_esm`, `init_esm2`, `init_expandToHashMap`, `init_extends`, `init_getAltAxis`, `init_getBasePlacement`, `init_getBoundingClientRect`, `init_getClippingRect`, `init_getCompositeRect`, `init_getComputedStyle`, `init_getDocumentElement`, `init_getDocumentRect`, `init_getFreshSideObject`, `init_getHTMLElementScroll`, `init_getLayoutRect`, `init_getMainAxisFromPlacement`, `init_getNodeName`, `init_getNodeScroll`, `init_getOffsetParent`, `init_getParentNode`, `init_getPrototypeOf`, `init_getScrollParent`, `init_getVariation`, `init_getViewportRect`, `init_getWindow`, `init_getWindowScroll`, `init_getWindowScrollBarX`, `init_inheritsLoose`, `init_instanceOf`, `init_isLayoutViewport`, `init_isNativeFunction`, `init_isNativeReflectConstruct`, `init_isScrollParent`, `init_isTableElement`, `init_iterableToArray`, `init_lib`, `init_listScrollParents`, `init_mergeByName`, `init_mergePaddingObject`, `init_mjs`, `init_modifiers`, `init_nonIterableSpread`, `init_objectWithoutProperties`, `init_objectWithoutPropertiesLoose`, `init_orderModifiers`, `init_rectToClientRect`, `init_setPrototypeOf`, `init_stylis`, `init_taggedTemplateLiteralLoose`, `init_toConsumableArray`, `init_toPrimitive`, `init_toPropertyKey`, `init_typeof`, `init_types`, `init_unsupportedIterableToArray`, `init_updated`, `init_userAgent`, `init_within`, `init_wrapNativeSuper`, `initial2`, `initialGlobals4`, `initialState`, `inlineLineNumberStyle`, `inner`, `input2`, `inputLength`, `inputRange`, `inputRole`, `inputType`, `inputVariables`, `insert`, `insertData`, `insertable`, `insertionRole`, `inside`, `instance`, `instances`, `integer`, `internalRe`, `internalState`, `internal_index`, `interpolated`, `intrinsic`, `intrinsicName`, `is`, `isActive`, `isAddonsActive`, `isAriaMixed`, `isBrowser`, `isBrowser3`, `isCurrentAnimation`, `isCustomProperty3`, `isDeep`, `isDevelopment`, `isDevelopment2`, `isDiffEmpty`, `isDisabled3`, `isEmpty`, `isEmptyPath`, `isEnabled`, `isExiting`, `isExpectedValuePresent`, `isFirefox`, `isFocused`, `isFullscreen`, `isFunction_default`, `isHaveAriaInvalid`, `isHidden3`, `isInDocument`, `isInitialMount`, `isInlineCodeRegex`, `isInvalid`, `isJustReactStateUpdate`, `isKey_default`, `isKeyable_default`, `isLinkOverride`, `isMasked_default`, `isMultiline`, `isNaN2`, `isNaN22`, `isNaN3`, `isNavShown`, `isNested`, `isNode2`, `isObject7`, `isObjectLike_default`, `isObject_default`, `isOffsetParentAnElement`, `isOverflowX`, `isOwn`, `isPanelShown`, `isPinchZoomedIn`, `isPrepared`, `isPrimary`, `isProduction`, `isReal`, `isReferenceHidden`, `isRefocusing`, `isRegistered`, `isRequired`, `isResizing`, `isSSR`, `isSelected`, `isSub`, `isSymbol_default`, `isThrow`, `isUI`, `isValid`, `it`, `item`, `itemNode`, `itemProps`, `itemProps2`, `items`, `items2`, `j`, `jLast`, `javascript`, `jh`, `joiner`, `jsTokensExports`, `jsTokens_1`, `jsdocBaseGrammar`, `jsdocStringifyRules`, `json3`, `json4`, `jsonValue`, `jtpRules`, `k`, `k2`, `kd`, `key`, `keyMap`, `keyOfParslet`, `keyToFocus`, `keydownBehavior`, `keyframeName`, `keyframes2`, `keys3`, `keysToVisit`, `keyupBehavior`, `kg`, `kl`, `known`, `l`, `l2`, `label`, `labelAttributeNode`, `labelId`, `labelList`, `labelText`, `labelableElement`, `labelledNodeNames`, `labellingElement`, `labels`, `labelsFiltered`, `labelsProperty`, `labelsValue`, `landmarkRole`, `lang`, `lang2`, `langs`, `language`, `languageTag`, `languages2`, `last2`, `lastCheck`, `lastChild`, `lastError`, `lastFocusedElement`, `lastFocusedKey`, `lastIndex`, `lastKey`, `lastNode`, `lastParam`, `lastPart`, `lastReportRef`, `lastSelectionBehavior`, `latest`, `latestGetSnapshot`, `latestListener`, `layer`, `layout`, `layoutDelegateMethod`, `layoutViewport`, `layout_exports`, `le`, `left2`, `left3`, `leftHandEntries`, `leftHandItems`, `leftHandKeys`, `leftHandMap`, `leftHandType`, `leftResult`, `legacy`, `len`, `length2`, `lf`, `lightSyntaxColors`, `lightnessModification`, `line`, `line2`, `lineBreakCount`, `lineNumber`, `lineNumber2`, `lineno`, `lines`, `link`, `linkProps`, `linkRole`, `list`, `listCacheClear_default`, `listCacheDelete_default`, `listCacheGet_default`, `listCacheHas_default`, `listCacheSet_default`, `listCommon`, `listCommon2`, `listContents`, `listRole`, `listboxRole`, `listener`, `listeners3`, `listitemRole`, `lk`, `localName`, `localNameToRoleMappings`, `localNameToRoleMappings2`, `locale`, `location4`, `locationStart`, `location_1`, `location_2`, `log`, `logRole`, `lookbehindLength`, `lookupList`, `lookupList2`, `loose`, `looseOption`, `lruLen`, `m3`, `mArr`, `mainAxis`, `mainClippingParents`, `mainRole`, `major`, `managerContext`, `manager_api_exports`, `manager_errors_exports`, `map2`, `mapCacheClear_default`, `mapCacheDelete_default`, `mapCacheGet_default`, `mapCacheHas_default`, `mapCacheSet_default`, `mappedByTag`, `mappedKey`, `mappedToKey`, `margin`, `marginHeight`, `marginLabels`, `markRole`, `markup2`, `marqueeRole`, `match3`, `matchIdentifierAtIndex`, `matchIdx`, `matchIndex`, `matchMedia`, `matchedKey`, `matchedValue`, `matcher`, `matcherContext`, `matchers`, `matchers_exports`, `matches4`, `matchingOption`, `mathRole`, `max`, `max2`, `maxHeight`, `maxLength`, `maxLengthSupportedTypes`, `maxSafeInteger`, `maxSafeInteger2`, `mb`, `measurements`, `media`, `memo2`, `memoKey`, `memoizeCapped_default`, `memoizeResultRight`, `memoize_default`, `menu`, `menuId`, `menuRole`, `menubarRole`, `menuitemRole`, `menuitemcheckboxRole`, `menuitemradioRole`, `merge3`, `mergeKeys`, `mergeValues`, `merged`, `mergedOptions`, `mergedTheme`, `merger`, `message`, `meta`, `metadata`, `meterRole`, `method`, `methodCall`, `methodWrapper`, `metrics`, `min2`, `minIndent`, `minPosition`, `minver`, `missing`, `mixedArgsMsg`, `mj`, `mock`, `mockedEvent`, `mocks`, `modality`, `modifierLocks`, `moduleMockSpies`, `moduleParser`, `mouseEvents`, `mouseUpInit`, `mousemove`, `msg`, `msgObj`, `multiply`, `mutated`, `mutationEnd`, `n`, `n2`, `n3`, `nCommon`, `nCommonF`, `nF`, `nOmit`, `nR`, `name`, `nameFromAlt`, `nameFromLabel`, `nameFromSubTree`, `nameFromTitle`, `nameFromValue`, `nameHint`, `nameString`, `namedNotTerminated`, `nativeEvent`, `navigate`, `navigationRole`, `needsPositiveSign`, `negate`, `negative`, `nestedElement`, `nestedRematch`, `newAssertion`, `newCollection`, `newElem`, `newElement`, `newError`, `newId`, `newKeyword`, `newNode`, `newObj`, `newObject`, `newOptions`, `newParameter`, `newPos`, `newProps`, `newPxval`, `newRegExp`, `newSelected`, `newSize`, `newState`, `newStyled`, `newTree`, `newValue`, `next2`, `nextB`, `nextColIndex`, `nextElement`, `nextId`, `nextIndex`, `nextItemInSameLevel`, `nextKey`, `nextLayoutState`, `nextLocation`, `nextNode`, `nextOffset`, `nextParentheses`, `nextPlusOne`, `nextPosition`, `nextScopes`, `nextSibling`, `nextTarget`, `nextValue`, `noDiffMessage`, `node2`, `node3`, `nodeAtPointerRef`, `nodeKey`, `nodeRequire`, `nodeResult`, `nodeToRestore`, `nodeToRestoreRef`, `nodes`, `nonAlphaNumericRegex_`, `nonIndexProperties`, `noneRole`, `normal`, `normalCompletion`, `normalize2`, `normalize4`, `normalizedColor`, `normalizedColorName`, `normalizedOptions`, `normalizedText`, `not`, `noteRole`, `notifications_exports`, `ns`, `num`, `numA`, `number`, `numberFormat`, `numberFormatter`, `numberRegex`, `numeric`, `nums`, `o`, `o2`, `obj`, `obj1Type`, `objDescriptor`, `objId`, `objMethod`, `object`, `objectIs`, `objectToString_default`, `objectType`, `object_util_js_1`, `objects`, `observer`, `observerWrapper`, `oc`, `offset3`, `offsetParent`, `offsetX`, `offsetY`, `offset_default`, `ok`, `old`, `oldEntry`, `onAction`, `onClick`, `onCloseHandler`, `onResize`, `onceListener`, `onlyDigitsValue`, `op`, `open_in_editor_exports`, `openingBracePosition`, `operation`, `operator`, `oppositePlacement`, `opt`, `option`, `optionElement`, `optionRole`, `optional`, `optionalParslet`, `options`, `options2`, `optionsNormalized`, `optionsObj`, `optionsResult`, `optionsShouldForwardProp`, `opts`, `ordered`, `orderedModifiers`, `origLockSsfi`, `origSymbol`, `origin`, `original`, `originalAriaLabelledby`, `originalImplementation`, `originalLength`, `originalRange`, `originalTarget`, `others`, `out`, `outerAmount`, `output`, `outside`, `overflows`, `overlay`, `overlayId`, `overlayMargin`, `overlayRef`, `overlaySize`, `overlayTop`, `overlayTriggerState`, `overrideProps`, `overwritingMethodWrapper`, `own`, `ownProperties`, `ownProps`, `ownerDocument`, `p3`, `paddedCode`, `paddingLabels`, `paddingObject`, `paddingSize`, `paddingWidth`, `page`, `pageString`, `pageX`, `pageY`, `pair`, `pairs`, `paragraphRole`, `parameters2`, `params`, `parent`, `parentNode`, `parentOffset`, `parentParser`, `parentScope`, `parents`, `parse9`, `parseInt2`, `parseLeftAngleResult`, `parseOptions`, `parseQuoteResult`, `parseUnquotedResult`, `parse_js_1`, `parsed`, `parsedCSS`, `parsedColor`, `parsedColor1`, `parsedPath`, `part`, `partial`, `parts`, `pass`, `passive`, `patched`, `path`, `pathParser`, `pathType`, `pathname`, `pattern`, `patternChar`, `patternObj`, `pattern_1`, `patterns`, `payload`, `payload2`, `pb`, `pd`, `pe`, `pending`, `percentPosition`, `percentage`, `picocolors`, `pieces`, `pkg`, `placeholder`, `placeholderText`, `placement`, `placementInfo`, `plainObject`, `plainText`, `playgroundUrl`, `plugin2`, `plugins`, `plugins3`, `pointer4`, `pointerEvents`, `pointerIn`, `pointerName`, `pointerType`, `pointermin`, `popoverRef`, `popperOffsets_default`, `pos`, `position2`, `position3`, `powers`, `prefix4`, `prepends`, `prerelease`, `presentationRole`, `presentationRoles`, `presetEntries`, `prettifiedDOM`, `prettyFormat`, `prev2`, `prevAnimationName`, `prevComponentValue`, `prevItem`, `prevKey`, `prevLockSsfi`, `prevMouseX`, `prevOptions`, `prevPosition`, `prevProps`, `prevRect`, `prevScrollPos`, `prevUserRef`, `preventOverflow_default`, `previous`, `previousActiveElement`, `previousCursor`, `previousLength`, `previousNode`, `previousState`, `previousValue`, `prim`, `printObj`, `printWarning`, `printed`, `printedChild`, `privateApi`, `progressbarRole`, `promise`, `promise_default`, `prop`, `propAssertion`, `propDesc`, `propKey`, `propValue`, `properties`, `property`, `propertyContents`, `props`, `proto`, `protocol`, `prototype`, `prototypeDescriptor`, `provided`, `provider_exports`, `proxy`, `pseudoAfter`, `pseudoBefore`, `ptr`, `q`, `query`, `queryBy`, `queryHelpers`, `queryMethod`, `queryStr`, `queuedError`, `queuedErrors`, `quote2`, `r2`, `r3`, `r4`, `rAF`, `ra`, `radioList`, `radioRole`, `radiogroupRole`, `radios`, `range`, `rangeList`, `rangeMap`, `rangeRole`, `ranges`, `ratio`, `rawClassName`, `rawKeys`, `rc`, `re`, `reEscapeChars`, `reNonASCII`, `reactIs`, `reactIs2`, `reactIsExports`, `reactPropsRegex`, `reactive`, `readyState`, `realClipboard`, `rebuildEvent`, `received`, `receivedSelection`, `receivedType`, `receivedValue`, `rect`, `rects`, `red`, `ref`, `refCallback`, `refCount`, `reference2`, `reflectGetProto`, `refract`, `refractorJsx`, `refs`, `refs2`, `refs_exports`, `regex`, `regexPlus`, `regexpTag`, `regionRole`, `registeredStyles`, `relatedTargetEl`, `relation`, `releasePreviousModifier`, `releaseSelfModifier`, `removeCount`, `removeEvents`, `removeFrom`, `removedLruLen`, `renderProps`, `rendered`, `rendererName`, `repeatModifier`, `replace2`, `replaced`, `replacementArr`, `request`, `require_AsymmetricMatcher`, `require_ConvertAnsi`, `require_DOMCollection`, `require_DOMElement`, `require_Immutable`, `require_ReactElement`, `require_ReactTestComponent`, `require_alertRole`, `require_alertdialogRole`, `require_ansi_regex`, `require_ansi_styles`, `require_ansi_to_html`, `require_applicationRole`, `require_aria`, `require_ariaAbstractRoles`, `require_ariaDpubRoles`, `require_ariaGraphicsRoles`, `require_ariaLiteralRoles`, `require_ariaPropsMap`, `require_articleRole`, `require_bannerRole`, `require_bash`, `require_blockquoteRole`, `require_browser_dtector_umd_min`, `require_build`, `require_buttonRole`, `require_captionRole`, `require_case_insensitive_transform`, `require_case_sensitive_transform`, `require_cellRole`, `require_character_entities_legacy`, `require_character_reference_invalid`, `require_checkboxRole`, `require_clean`, `require_client`, `require_clike`, `require_cmp`, `require_codeRole`, `require_coerce`, `require_collections`, `require_columnheaderRole`, `require_comboboxRole`, `require_comma_separated_tokens`, `require_commandRole`, `require_comparator`, `require_compare`, `require_compare_build`, `require_compare_loose`, `require_complementaryRole`, `require_compositeRole`, `require_constants`, `require_contentinfoRole`, `require_copy_to_clipboard`, `require_core`, `require_create`, `require_css`, `require_css_escape`, `require_debug`, `require_decode`, `require_decode2`, `require_decode_codepoint`, `require_decode_entity_browser`, `require_decode_uri_component`, `require_defined_info`, `require_definitionRole`, `require_deletionRole`, `require_dialogRole`, `require_diff`, `require_directoryRole`, `require_dist`, `require_docAbstractRole`, `require_docAcknowledgmentsRole`, `require_docAfterwordRole`, `require_docAppendixRole`, `require_docBacklinkRole`, `require_docBiblioentryRole`, `require_docBibliographyRole`, `require_docBibliorefRole`, `require_docChapterRole`, `require_docColophonRole`, `require_docConclusionRole`, `require_docCoverRole`, `require_docCreditRole`, `require_docCreditsRole`, `require_docDedicationRole`, `require_docEndnoteRole`, `require_docEndnotesRole`, `require_docEpigraphRole`, `require_docEpilogueRole`, `require_docErrataRole`, `require_docExampleRole`, `require_docFootnoteRole`, `require_docForewordRole`, `require_docGlossaryRole`, `require_docGlossrefRole`, `require_docIndexRole`, `require_docIntroductionRole`, `require_docNoterefRole`, `require_docNoticeRole`, `require_docPagebreakRole`, `require_docPagefooterRole`, `require_docPageheaderRole`, `require_docPagelistRole`, `require_docPartRole`, `require_docPrefaceRole`, `require_docPrologueRole`, `require_docPullquoteRole`, `require_docQnaRole`, `require_docSubtitleRole`, `require_docTipRole`, `require_docTocRole`, `require_documentRole`, `require_domMap`, `require_elementRoleMap`, `require_emphasisRole`, `require_encode`, `require_entities`, `require_eq`, `require_es_object_atoms`, `require_escapeHTML`, `require_factory`, `require_feedRole`, `require_figureRole`, `require_find`, `require_formRole`, `require_genericRole`, `require_graphicsDocumentRole`, `require_graphicsObjectRole`, `require_graphicsSymbolRole`, `require_graphql`, `require_gridRole`, `require_gridcellRole`, `require_groupRole`, `require_gt`, `require_gte`, `require_gtr`, `require_hast_util_parse_selector`, `require_hastscript`, `require_headingRole`, `require_hoist_non_react_statics_cjs`, `require_html`, `require_html2`, `require_html3`, `require_identifiers`, `require_imgRole`, `require_immutable`, `require_inc`, `require_indent_string`, `require_info`, `require_inputRole`, `require_insertionRole`, `require_intersects`, `require_is_alphabetical`, `require_is_alphanumerical`, `require_is_decimal`, `require_is_hexadecimal`, `require_iterationDecorator`, `require_iteratorProxy`, `require_javascript`, `require_js_extras`, `require_json`, `require_jsx`, `require_jsx_runtime`, `require_landmarkRole`, `require_legacy`, `require_lib`, `require_lib2`, `require_linkRole`, `require_listRole`, `require_listboxRole`, `require_listitemRole`, `require_logRole`, `require_lrucache`, `require_lt`, `require_lte`, `require_ltr`, `require_lz_string`, `require_main`, `require_mainRole`, `require_major`, `require_markRole`, `require_markdown`, `require_markup`, `require_markup2`, `require_marqueeRole`, `require_mathRole`, `require_max_satisfying`, `require_memoizerific`, `require_menuRole`, `require_menubarRole`, `require_menuitemRole`, `require_menuitemcheckboxRole`, `require_menuitemradioRole`, `require_merge`, `require_meterRole`, `require_min_indent`, `require_min_satisfying`, `require_min_version`, `require_minor`, `require_navigationRole`, `require_neq`, `require_noneRole`, `require_normalize`, `require_noteRole`, `require_object_util`, `require_optionRole`, `require_outside`, `require_paragraphRole`, `require_parse`, `require_parse2`, `require_parse_entities`, `require_parse_options`, `require_patch`, `require_picocolors_browser`, `require_prerelease`, `require_presentationRole`, `require_prism_core`, `require_progressbarRole`, `require_radioRole`, `require_radiogroupRole`, `require_range2`, `require_rangeRole`, `require_rcompare`, `require_re`, `require_react`, `require_react_dom`, `require_react_dom_production_min`, `require_react_fast_compare`, `require_react_is`, `require_react_is2`, `require_react_is_production_min`, `require_react_is_production_min2`, `require_react_jsx_runtime_production_min`, `require_react_production_min`, `require_redent`, `require_regionRole`, `require_roleElementMap`, `require_rolesMap`, `require_roletypeRole`, `require_rowRole`, `require_rowgroupRole`, `require_rowheaderRole`, `require_rsort`, `require_satisfies`, `require_scheduler`, `require_scheduler_production_min`, `require_schema`, `require_scrollbarRole`, `require_searchRole`, `require_searchboxRole`, `require_sectionRole`, `require_sectionheadRole`, `require_selectRole`, `require_semver`, `require_semver2`, `require_separatorRole`, `require_shared`, `require_shim`, `require_simplify`, `require_sliderRole`, `require_sort`, `require_space_separated_tokens`, `require_spinbuttonRole`, `require_statusRole`, `require_store2`, `require_string_util`, `require_stringify`, `require_strip_indent`, `require_strongRole`, `require_structureRole`, `require_subscriptRole`, `require_subset`, `require_superscriptRole`, `require_switchRole`, `require_tabRole`, `require_tableRole`, `require_tablistRole`, `require_tabpanelRole`, `require_termRole`, `require_textboxRole`, `require_timeRole`, `require_timerRole`, `require_tiny_isequal`, `require_to_comparators`, `require_toggle_selection`, `require_toolbarRole`, `require_tooltipRole`, `require_treeRole`, `require_treegridRole`, `require_treeitemRole`, `require_tsx`, `require_types`, `require_typescript`, `require_use_sync_external_store_shim_production`, `require_valid`, `require_valid2`, `require_warning`, `require_widgetRole`, `require_windowRole`, `require_xlink`, `require_xml`, `require_xml2`, `require_xmlns`, `require_yaml`, `requires`, `res`, `reservedWords2`, `resetFocusFirstFlag`, `resetState`, `resetStyles`, `resizeObserver`, `resizeObserverInstance`, `resolveRef`, `resolved`, `response`, `responseEvent`, `rest`, `result`, `resultTuple`, `results`, `results1`, `ret`, `retainedState`, `rf`, `rgbMatched`, `rgbValue`, `rgbaMatched`, `right2`, `role`, `roleElement`, `roleMessage`, `roleValue`, `roles3`, `rolesMap`, `rolesSupportingValues`, `roletypeRole`, `root2`, `rootNode`, `rotate3602`, `round3`, `route`, `routePathnameIndex`, `router`, `router_exports`, `rowHeight`, `rowRole`, `rowgroupRole`, `rowheaderRole`, `rows`, `rule`, `rulesList`, `s`, `s2`, `s3`, `safe2`, `sanitized`, `satisfies`, `sawNonNull`, `scale`, `schema`, `scope`, `scope2`, `scopeContexts`, `scopeHooks`, `scopeRoot`, `score`, `script`, `scripts`, `scrollArea`, `scrollContainer`, `scrollParent`, `scrollParents`, `scrollPos`, `scrollSize`, `scrollable`, `scrollableElements`, `scrollableNode`, `scrollableRect`, `scrollbarRole`, `scrollbarWidth`, `scrollers`, `sd`, `search`, `searchIndex`, `searchRole`, `searchboxRole`, `secondChar`, `sectionRole`, `sectionheadRole`, `seen`, `segments`, `sel`, `selectRole`, `selectable`, `selected`, `selectedElement`, `selectedKey`, `selectedKeys`, `selectedOptions`, `selectedState`, `selection`, `selectionFocus`, `selectionStartsWithinElement`, `selector`, `selectorId`, `sentinel`, `sep`, `separator`, `separatorRole`, `serialize`, `serialized`, `serializedStyles`, `set3`, `setIdsA`, `setIdsB`, `setState2`, `setStateEvent`, `settings`, `settings_exports`, `shadowRoot`, `shadowRoot2`, `shared_js_1`, `sheet`, `sheetRefCurrent`, `shim`, `shortcut`, `shortcuts_exports`, `should`, `should2`, `shouldBeOpen`, `shouldClose`, `shouldForwardEvent`, `shouldForwardProp`, `shouldShowNav`, `shouldStopPropagation`, `should_exports`, `sibling`, `siblingNode`, `sign`, `signDisplay`, `signOpts`, `simpleResult`, `simplified`, `size`, `sizingStyle`, `skeleton`, `skipToStep2E`, `sl`, `sliderRole`, `slotKey`, `slotPropValue`, `snapshotRef`, `softWrapper`, `source`, `sourceKeys`, `sourceValue`, `space`, `spaceUntilMaxLength`, `specialParams`, `spinbuttonRole`, `split`, `splitPathRegex`, `splitValue`, `spy`, `spy2`, `spyName`, `src`, `src2`, `ssr`, `ssrStyles`, `stack`, `stackClone`, `stackTraceError`, `stacks`, `start2`, `startIndex`, `startItem`, `startObj`, `startOffset`, `startParts`, `startPosition`, `startTagRe`, `startTime`, `startToken`, `startingPosition`, `state2`, `state22`, `state3`, `state4`, `stateChangeHandlers`, `stateRef`, `staticExcludeTags`, `status`, `statusRole`, `statusStore`, `statuses`, `step2`, `sticky`, `stopPressStart`, `storage`, `store2`, `store3`, `storedStringifyRules`, `storiesHash`, `stories_exports`, `story`, `storyId`, `storyIndex`, `storybookRoot`, `str2`, `strategy`, `string`, `stringChild`, `stringEscapeChars`, `stringEscapeChars2`, `stringMode`, `stringRepresentation`, `stringTag2`, `stringToken`, `stringValueParslet`, `string_util_js_1`, `stringedValue`, `stringified`, `stringify4`, `stringify_js_1`, `strings`, `stripIndent`, `stripped`, `strongRole`, `structureRole`, `stub`, `style`, `styleAndLocation`, `styleElementByHighlight`, `styleLocation`, `styleStartPosition`, `styles4`, `stylisPlugins`, `subdiff`, `submenu`, `submenuProps`, `submit`, `submitter`, `subscribesToAllEvents`, `subscriptRole`, `substring`, `substrings`, `subtreeIsInaccessibleCache`, `successful`, `suffixId`, `suggestion`, `sup`, `superClassIter`, `superClassName`, `superscriptRole`, `superset`, `supportedFormEncTypes`, `supportedLocales`, `supports`, `svgElements`, `switchRole`, `symVal`, `symbolParslet`, `symbols`, `symbolsSupported`, `symbolsSupported2`, `syms`, `syncingResolve`, `syntaxhighlighter_exports`, `system`, `t`, `t2`, `t3`, `tModule`, `tStart`, `tabBarRef`, `tabIndex`, `tabListLabelProps`, `tabRole`, `tableCell`, `tableRole`, `tablistRole`, `tabpanelRole`, `tag`, `tagColor`, `tagName`, `tagNames`, `tagPattern`, `tags2`, `tailLength`, `target`, `targetHasOwnSelection`, `targetOldUserSelect`, `targetable`, `tb`, `tempKey`, `templateStringsArr`, `temporaryValue`, `termRole`, `test`, `test22`, `test3`, `testId`, `testKey`, `testProviderStore`, `test_exports`, `testerContext`, `testingLibrary`, `tests`, `text`, `text1_length`, `textContent`, `textPos`, `textToMatch`, `text_length`, `textboxRole`, `th`, `theChosenOne`, `theme`, `theme2`, `theme3`, `themesBase`, `theming_exports`, `thisArg`, `thisCall`, `thumbRect`, `thumbSizePx`, `timeData`, `timeRole`, `timeout`, `timeoutError`, `timeoutId`, `timer`, `timerRole`, `title`, `tmp`, `tmpMsg`, `to`, `toAdd`, `toBeMessage`, `toBePreloaded`, `toKey_default`, `toPaddingObject`, `toSegments`, `toSource_default`, `toStr`, `toStr2`, `toString22`, `toString5`, `toStringTag`, `toStringTag2`, `toString_default`, `toStringed`, `toggleCollapsed`, `token2`, `tokenList`, `tokens2`, `toolbarRole`, `tooltipAttributeValue`, `tooltipRole`, `top`, `trailingPathname`, `transformed`, `transitions`, `transport`, `transports`, `treeA`, `treeB`, `treeNode`, `treeNode2`, `treeNode3`, `treeRole`, `treegridRole`, `treeitemRole`, `triggerNode`, `trimmed`, `truncate22`, `truncate3`, `truncated`, `truthy`, `type5`, `typeAndSelection`, `typeDescr`, `typeEndPosition_1`, `typeInside`, `typeList`, `typeOf`, `typeParameter`, `typeParameters`, `types`, `typesX`, `types_exports`, `typescript2`, `u`, `u2`, `ua`, `uaData`, `uid`, `undefined2`, `uniqueSuggestionMessages`, `unitlessKeys`, `universalChecklistStore`, `unmasked`, `unprevented`, `unsetSides`, `update2`, `updateActiveDescendant`, `updatedLayout`, `url`, `urlObj`, `urlState`, `url_exports`, `useTabsState`, `used`, `userCodeFrame`, `userEvent`, `userEventApi`, `v`, `v1`, `v1Higher`, `val`, `valArray`, `valid`, `validMutationMethodsArr`, `validTokens`, `value`, `valueLength`, `valueMatches`, `valueMax`, `valueMin`, `valueNow`, `valueParts`, `valueText`, `valueToFormat`, `values`, `varName`, `varToken`, `vendor`, `version`, `versionA`, `versionDiff`, `versions`, `versions_exports`, `view`, `viewport2`, `visitorKeys`, `vl`, `w`, `walker`, `walkers`, `wasControlled`, `wasKeyboardVisible`, `wasNavShown`, `wasPanelShown`, `wasPending`, `wb`, `we`, `weakMemoize`, `whatsNewData`, `whatsnew_exports`, `widgetRole`, `width`, `width2`, `wildcards`, `win`, `window2`, `windowExtremities`, `windowObj`, `windowObject`, `windowRole`, `withPointerEvents`, `withType`, `worker`, `wrapped`, `x`, `xM`, `xa`, `xe`, `xf`, `xg`, `xml_json_1`, `xtend`, `y`, `yb`, `z`, `zeroWidth`, `zj`

### `storybook-static/sb-manager/globals.js`

- Top-level variables:
  - `globalsNameReferenceMap`

### `storybook-static/sb-manager/manager-stores.js`

- No parseable top-level symbols found

### `storybook-static/sb-manager/runtime.js`

- Functions:
  - `App`, `Canvas`, `Downshift3`, `Floater2`, `FloaterArrow2`, `FloaterCloseBtn`, `FloaterContainer`, `FormatError2`, `HighlightElement`, `HighlightStyles`, `IFrame`, `IntlMessageFormat2`, `InvalidValueError2`, `InvalidValueTypeError2`, `JoyrideSpotlight`, `JoyrideTooltipCloseButton`, `JoyrideTooltipContainer`, `MissingValueError2`, `MobileAbout`, `ObjectWithoutPrototypeCache2`, `Panel`, `Parser2`, `PolishedError2`, `Popper2`, `PreRenderAddons`, `RE`, `ReactFloater2`, `ReactFloaterPortal2`, `ReactFloaterWrapper2`, `Root3`, `ShortcutsPage`, `Similar`, `ToolbarManager`, `UpgradeBlock`, `WhatsNewPage`, `Wrapper8`, `Y`, `__`, `__assign`, `__commonJS`, `__esm`, `__export`, `__extends`, `__rest`, `__spreadArray`, `__toESM`, `__values`, `_assertThisInitialized`, `_assertThisInitialized2`, `_check_private_redeclaration`, `_classCallCheck`, `_class_apply_descriptor_get`, `_class_apply_descriptor_set`, `_class_extract_field_descriptor`, `_class_private_field_get`, `_class_private_field_init`, `_class_private_field_set`, `_construct`, `_createClass`, `_createSuper`, `_defineProperties`, `_defineProperty`, `_extends`, `_getPrototypeOf`, `_getPrototypeOf2`, `_inherits`, `_inheritsLoose`, `_isAlpha`, `_isAlphaOrSlash`, `_isNativeFunction`, `_isNativeReflectConstruct`, `_isNativeReflectConstruct2`, `_isPatternSyntax`, `_isPotentialElementNameChar`, `_isWhiteSpace`, `_objectSpread2`, `_objectWithoutProperties`, `_objectWithoutPropertiesLoose`, `_objectWithoutPropertiesLoose2`, `_possibleConstructorReturn`, `_setPrototypeOf`, `_setPrototypeOf2`, `_toPrimitive`, `_toPropertyKey`, `_wrapNativeSuper`, `a`, `added`, `adjustHue`, `animate`, `appendBits`, `applyResizeKeyboard`, `applyStyle`, `applyStyleOnLoad`, `approxEqual`, `arrow`, `assemble`, `assert`, `attachToScrollParents`, `b2`, `c`, `calculateRange`, `callAllEventHandlers`, `callOnChangeProps`, `canHaveLength`, `canHaveLength2`, `canUseDOM`, `canUseDOM2`, `cancel`, `canvasMapper`, `capitalizeString`, `cbToCb`, `check`, `checkEquality`, `checkEquality2`, `checkIfSnapshotChanged`, `clamp`, `classCallCheck`, `cleanup`, `cleanupStatusDiv`, `clockwise`, `cloneUnlessOtherwiseSpecified`, `clsx`, `colorToHex`, `colorToInt`, `combineIndexes`, `compareNumbers`, `compareNumbers2`, `compareValues`, `compareValues2`, `computeAutoPlacement`, `computePanelMaxSize`, `computeSidebarMaxWidth`, `computeStyle`, `convertToHex`, `convertToInt`, `convertToReactAriaPlacement2`, `copy3`, `createDefaultFormatters`, `createFastMemoizeCache`, `createLocation`, `createStore`, `curried`, `curry`, `cycle2`, `darken2`, `debounce`, `debounce4`, `deepmerge4`, `defaultArrayMerge`, `defineProperties`, `desaturate`, `destroy`, `disableEventListeners`, `downshiftCommonReducer`, `downshiftMultipleSelectionReducer`, `downshiftSelectReducer`, `downshiftUseComboboxReducer`, `dropdownHandleKeyDown`, `e2`, `e3`, `emptyFunction`, `emptyFunctionWithReset`, `emptyTarget`, `enableEventListeners`, `endsWith`, `equal`, `equal2`, `equal4`, `equalArray`, `equalArray2`, `equalArrayBuffer`, `equalArrayBuffer2`, `equalMap`, `equalMap2`, `equalSet`, `equalSet2`, `excavateModules`, `extendStatics`, `filter`, `filterTabs`, `filterToolsSide`, `find`, `findActiveLandmarkElement`, `findCommonOffsetParent`, `findIndex`, `flip`, `format`, `formatToParts`, `fullScreenMapper`, `generateId`, `generatePath`, `generateTestProviderLinks`, `get`, `getA11yStatusMessage`, `getActive`, `getArea`, `getBestPattern`, `getBit`, `getBordersSize`, `getBoundaries`, `getBoundingClientRect`, `getBrowser`, `getChangesOnSelection`, `getClientRect`, `getClientRect2`, `getDefaultHighlightedIndex`, `getDefaultHourSymbolFromLocale`, `getDefaultValue`, `getDocumentHeight`, `getElement`, `getElementPosition`, `getElementProps`, `getEnumerableOwnPropertySymbols`, `getFixedPositionOffsetParent`, `getGroupStatus`, `getHighlightedIndex`, `getHighlightedIndexOnOpen`, `getImageSettings`, `getInitialHighlightedIndex`, `getInitialState`, `getInitialValue`, `getItemAndIndex`, `getItemIndexByCharacterKey`, `getIterables`, `getIterables2`, `getKeys`, `getMarginSize`, `getMatches`, `getMergeFunction`, `getMergedStep`, `getNonDisabledIndex`, `getObjectType`, `getObjectType2`, `getObjectType3`, `getObjectType4`, `getOffsetParent`, `getOffsetRectRelativeToArbitraryNode`, `getOppositePlacement`, `getOppositeVariation`, `getOuterSizes`, `getParentNode`, `getPath`, `getPopperOffsets`, `getReactNodeText`, `getRect`, `getReferenceNode`, `getReferenceOffsets`, `getRoot`, `getRoundedOffsets`, `getScroll`, `getScrollParent`, `getScrollParent2`, `getScrollTo`, `getSelectedItem`, `getShim`, `getSize`, `getState2`, `getStatusDiv`, `getStyleComputedProperty`, `getStyleComputedProperty2`, `getStyles`, `getStyles2`, `getSupportedPropertyName`, `getTourProps`, `getViewportOffsetRectRelativeToArtbitraryNode`, `getWindow`, `getWindowSizes`, `groupByType`, `guard`, `guardAgainstInvalidArgTypes`, `handleArrowKeys`, `handleChange`, `handleEscape`, `handleKeyDown`, `handleRefs`, `handler`, `hasCustomOffsetParent`, `hasCustomScrollParent`, `hasEntry`, `hasEntry2`, `hasExtraKeys`, `hasExtraKeys2`, `hasPosition`, `hasProps`, `hasValidKeys`, `hasValue`, `hasValue2`, `hexToRGB`, `hide`, `hideBeacon`, `hsl`, `hslToHex`, `hslToRgb`, `hsla`, `icuUnitToEcma`, `inOutSine`, `includeScroll`, `includesOrEqualsTo`, `includesOrEqualsTo2`, `initialize`, `inner`, `interpolate`, `invariant`, `invokeOnChangeHandler`, `is`, `is2`, `is3`, `is4`, `isAcceptedCharacterKey`, `isArgumentElement`, `isControlledProp`, `isDOMElement`, `isDateElement`, `isDateTimeSkeleton`, `isDropdownsStateEqual`, `isElementVisible`, `isEqual2`, `isEqualPredicate`, `isEqualPredicate2`, `isExpandType`, `isFixed`, `isFormatXMLElementFn`, `isFunction3`, `isIE`, `isKeyDownOperationPermitted`, `isLegacy`, `isLiteralElement`, `isMergeableObject`, `isMobile`, `isModifierEnabled`, `isModifierRequired`, `isNonNullObject`, `isNumberElement`, `isNumberSkeleton`, `isNumeric`, `isObjectOfType`, `isObjectOfType2`, `isObjectOfType3`, `isObjectType`, `isObjectType2`, `isObjectType3`, `isOfType`, `isOfType2`, `isOfType3`, `isOfType4`, `isOfType5`, `isOffsetContainer`, `isOrContainsNode`, `isPluralElement`, `isPoundElement`, `isPrimitive`, `isPrimitiveType`, `isPrimitiveType2`, `isPrimitiveType3`, `isReactElement`, `isRequiredIf`, `isRgb`, `isSameType`, `isSameType2`, `isScrolling`, `isSearchResult`, `isSelectElement`, `isSpecial`, `isStateEqual`, `isTagElement`, `isTimeElement`, `isTransitionEvent`, `keepTogether`, `layoutStateIsEqual`, `lighten2`, `log`, `log2`, `make`, `mapper`, `mapper2`, `mapper3`, `measureElement`, `memo2`, `memoize`, `memoizedFunction`, `memoizerific3`, `menuMapper2`, `mergeConfig`, `mergeConfigs`, `mergeLiteral`, `mergeObject`, `microtaskDebounce`, `missingPropError`, `mix`, `monadic`, `moveToMostRecentLru`, `n3`, `nameToHex`, `nested`, `nested2`, `next`, `noop2`, `noop4`, `noop5`, `normalizeArrowKey`, `notUndefined`, `numberToHex`, `numericCompare`, `o3`, `objectKeys`, `off`, `offset`, `omit2`, `on`, `onDrag`, `onHoverStart`, `onKeyDown`, `onMouseDown`, `onMouseUp`, `onPointerUp`, `onScroll`, `onToggle`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionStart`, `once3`, `opacify`, `ownKeys`, `parse`, `parseConciseScientificAndEngineeringStem`, `parseDateTimeSkeleton`, `parseNotationOptions`, `parseNumberSkeleton`, `parseNumberSkeletonFromString`, `parseOffset`, `parseSign`, `parseSignificantPrecision`, `parseToHsl`, `parseToRgb`, `partial`, `partialImpl`, `partialRight`, `partialRightImpl`, `partialed`, `partialedRight`, `pick2`, `pickState`, `preventOverflow`, `propExists`, `propIsRequired`, `propertyIsOnObject`, `propertyIsUnsafe`, `pruneLocation`, `pxtoFactory`, `r2`, `r4`, `reduceHexValue`, `registerShortcuts`, `removeCachedResult`, `removeEventListeners`, `renderChild`, `renderStorybookUI`, `replaceLocaleContent`, `replacer`, `rgb`, `rgbToHsl`, `rgba`, `run`, `runModifiers`, `s`, `s2`, `saturate`, `scope`, `scrollDocument`, `scrollIntoView`, `scrollIntoView2`, `scrollParent2`, `scrollTo`, `searchItem`, `segments`, `serializerDefault`, `setAttributes`, `setHue`, `setLightness`, `setSaturation`, `setStatus`, `setStyles`, `setupEventListeners`, `shade`, `shift`, `shim`, `shouldScroll`, `stateReducer`, `strategyDefault`, `strategyMonadic`, `strategyVariadic`, `stripUnit`, `t`, `targetWithinDownshift`, `taskDebounce`, `throttle`, `tint`, `toColorString`, `toShortcutState`, `toValue`, `toolbarItemHasBeenExcluded`, `transitState`, `transparentize`, `treeChanges`, `treeChanges2`, `triggerHoverStart`, `trySelectNewStory`, `u`, `unwrapArray`, `update`, `updateState`, `updateState2`, `useA11yMessageStatus`, `useCombobox`, `useControlledReducer`, `useDebounce`, `useDragging`, `useEnhancedReducer`, `useFullStoryName`, `useGetterPropsCalledChecker`, `useIsInitialMount`, `useLandmark`, `useLandmarkIndicator`, `useLatestRef`, `useMeasure`, `useMediaQuery`, `useMouseAndTouchTracker`, `useMultipleSelection`, `useQRCode`, `useRegionFocusAnimation`, `useScrollIntoView`, `useSelect`, `useSyncExternalStore`, `useVirtualizer`, `useVirtualizerBase`, `v2`, `validateStep`, `validateSteps`, `variadic`, `withStatusColor`, `wrapIfNeeded`, `wrapper`
- Top-level variables:
  - `ADDON_ID`, `ADDON_ID2`, `ADDON_ID3`, `ADDON_ID4`, `ADDON_ID5`, `ADDON_ID6`, `ActionsWrapper`, `ApplyWrappers`, `BEHAVIORS`, `BrandArea`, `C2`, `CASE_SPLIT_PATTERN`, `Centered`, `CloseButton_default`, `CodeWrapper`, `CollapseButton`, `CollapseIconWrapper`, `Container`, `Container12`, `Container13`, `Container6`, `Container7`, `Container_default`, `DATE_TIME_REGEX`, `DEFAULTS`, `DEFAULT_HEIGHT`, `DEFAULT_REF_ID`, `DEFAULT_RETRIES`, `DOCUMENTATION_LINK2`, `DOCUMENTATION_LINK3`, `DOMProps`, `DOM_PROPERTIES_TO_CHECK`, `DOM_PROPERTIES_TO_CHECK2`, `DOM_PROPERTIES_TO_CHECK3`, `Disabled`, `Downshift2`, `ERROR_LEVEL_MAP`, `E_NOSCROLL`, `Ecc`, `ErrorCode`, `ErrorKind`, `Explorer`, `F`, `FRACTION_PRECISION_REGEX`, `FileListItemContentWrapperSkeleton`, `FileListWrapper`, `Floater`, `FloaterArrow`, `FocusOutline`, `Footer2`, `FormatError`, `HIGHLIGHT_KEYFRAMES_ID`, `Header2`, `I2`, `IDENTIFIER_PREFIX_RE_1`, `Icon`, `InputKeyDownArrowDown`, `IntlMessageFormat`, `InvalidValueError`, `InvalidValueTypeError`, `L3`, `LOADER_SEQUENCE`, `LayoutContext`, `LeafNode3`, `LocationMonitor`, `MEDIA_DESKTOP_BREAKPOINT`, `MINIMAL_VIEWPORTS`, `MODAL_HEIGHT`, `MapOrSimilar`, `MissingValueError`, `MobileAddonsDrawer`, `MobileMenuDrawer`, `Mode`, `NEW_ICON_MAP`, `NewTarget`, `NoResults2`, `Note`, `NotificationClearer`, `NotificationList`, `ONBOARDING_ARROW_STYLE_ID`, `P3`, `PART_TYPE`, `PagesInnerContainer`, `PolishedError`, `PreviewContainer`, `Primary`, `ProgressCircle2`, `Provider2`, `QRCodeSVG`, `QrCode`, `QrSegment`, `React`, `ReactFloaterPortal`, `ReactFloaterWrapper`, `ReactIs`, `ReactPropTypes`, `ReactPropTypesSecret`, `ReactProvider`, `S2`, `SHOW_ADDON_PANEL_BUTTON_ID`, `SIDEBAR_BOTTOM_SPACER_ID`, `SKELETON_TYPE`, `SNAP_THRESHOLD_PX`, `SNIPPET_RENDERED`, `SPACE_SEPARATOR_REGEX`, `STATUS`, `STATUS2`, `STATUS3`, `STATUSES`, `STORE_CHANNEL_EVENT_NAME`, `SUPPORTED_FRAMEWORKS`, `SUPPORTS_PATH2D`, `Sections`, `Shape`, `ShortcutsScreen`, `Sidebar3`, `Similar`, `SmallIcons`, `Spotlight_default`, `StatusContext`, `StorybookLogoStyled`, `StyledAnimatedButton`, `StyledButton2`, `StyledIframe`, `StyledSection`, `Super`, `Svg2`, `T3`, `TOOLBAR_ID`, `TRIGGER_TEST_RUN_REQUEST`, `TYPE`, `TabErrorBoundary`, `Tag2`, `ToolbarMenuItemContainer`, `TooltipProvider2`, `TourGuide`, `TreeExpandIconStyled`, `TypeIcon2`, `UI_STATE_ID`, `URL_VALUE_PATTERN`, `ViewportWrapper`, `W2`, `WHITE_SPACE_REGEX`, `WS_DISCONNECTED_NOTIFICATION_ID`, `Wrapper`, `Wrapper2`, `Wrapper3`, `Wrapper6`, `ZOOM_LEVELS`, `_2`, `_Ecc`, `_Mode`, `_QrCode`, `_QrSegment`, `_React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_ReactCurrentOwner`, `__create`, `__defProp`, `__defProp2`, `__defProp3`, `__getOwnPropDesc`, `__getOwnPropNames`, `__getProtoOf`, `__require`, `_a`, `_a2`, `_a3`, `_activeElement`, `_activeElement_shadowRoot`, `_alpha`, `_anchorRect_bottom`, `_anchorRect_top`, `_b`, `_boundaryDimensions_scroll_axis`, `_boundaryDimensions_scroll_top`, `_childOffset_crossAxis`, `_childOffset_crossSize`, `_containerDimensions_scroll_axis`, `_data`, `_document_activeElement`, `_el_ownerDocument`, `_enabledEventHandlers`, `_eventHandlers`, `_excluded`, `_excluded2`, `_extends22`, `_extends3`, `_extends4`, `_extends5`, `_getStyleComputedProp`, `_getWindowSizes`, `_globalListeners_current_get`, `_highlightedIndex`, `_highlightedIndex2`, `_hue`, `_inputRef`, `_latest`, `_margins_axis1`, `_margins_left`, `_margins_top`, `_newActiveIndex`, `_newActiveIndex2`, `_newStateToSet`, `_node_parent`, `_node_parent_scopeRef`, `_position_bottom`, `_position_maxHeight`, `_props`, `_proto`, `_ref`, `_ref0`, `_ref2`, `_ref3`, `_ref4`, `_ref5`, `_ref6`, `_ref_current`, `_requesting`, `_ro`, `_stateRef_current_observer`, `_state_metaKeyEvents`, `_state_metaKeyEvents1`, `_state_target`, `_super`, `_this`, `_this2`, `_this3`, `_this4`, `_this_landmarks_find_focus`, `_this_landmarks_nextLandmarkIndex_ref_current`, `_toggleButtonRef`, `_useContext`, `_useEnhancedReducer`, `_visualViewport_height`, `_visualViewport_pageLeft`, `_visualViewport_pageTop`, `_visualViewport_scale`, `_visualViewport_width`, `_window_event_type`, `_window_navigator_userAgentData`, `_window_visualViewport`, `_window_visualViewport_height`, `a2`, `a3`, `a5`, `actions`, `activeElement`, `activeIndex`, `actual`, `addonsShortcuts`, `afterItem`, `alignPatPos`, `allCodewords`, `allPanels`, `alpha`, `amount`, `anchor`, `anchorRect`, `anchorRef`, `angle`, `animateLandmark`, `animateOut`, `animation`, `animations`, `api`, `apostrophePosition`, `area`, `argCloseResult`, `args`, `ariaLabel`, `arrowElement`, `arrowPosition`, `attempts`, `attributeName`, `attributes`, `availableItems`, `availableSlots`, `b2`, `background2`, `baseUnitRegex`, `bb`, `beaconPopper`, `before2`, `bits`, `blurTarget`, `body`, `bottomOffset`, `boundaries`, `boundariesElement`, `boundariesNode`, `box`, `brands`, `browser`, `button`, `buttonStyleAdditions`, `c2`, `cache`, `cacheIdRef`, `cacheKey`, `callbackData`, `called`, `canUseSymbol`, `canceled`, `canvas`, `canvasStyle`, `capture`, `cardRef`, `ccbits`, `cells2`, `cellsToDraw`, `center`, `ch`, `changed`, `changes`, `channel`, `channels_default`, `char`, `checklist`, `child`, `childRef`, `childWindow`, `children`, `childrenResult`, `cleanup`, `cleanupStatus`, `clicked`, `clientX`, `client_default`, `client_logger_default`, `close`, `closestPreviousLandmark`, `closingTagNameStartPosition`, `clsx_default`, `code`, `codePoints`, `codeToKeyMap`, `collapseAll`, `collapsed`, `color2`, `combined`, `combinedIndex`, `commonAncestorContainer`, `commonPropTypes`, `component`, `components_default`, `components_default2`, `computedClassName`, `conciseScientificAndEngineeringOpts`, `config`, `container`, `containerHeight`, `containerRef`, `containerScroll`, `content`, `contentRef`, `contents`, `context`, `contextState`, `contextStyle`, `contextWithinDownshift`, `copyKey`, `copyTitle`, `core`, `core_events_default`, `count`, `counter`, `create_default`, `crossOrigin`, `cssRegex`, `ctx`, `current`, `currentCache`, `currentElement`, `currentElementNode`, `currentLandmark`, `currentNode`, `currentOffset`, `currentOwner`, `currentPlacement`, `currentSize`, `currentState`, `currentTarget`, `currentValue`, `curriedAdjustHue`, `curriedDarken`, `curriedDesaturate`, `curriedLighten`, `curriedMix`, `curriedOpacify`, `curriedSaturate`, `curriedSetHue`, `curriedSetLightness`, `curriedSetSaturation`, `curriedShade`, `curriedTint`, `curriedTransparentize`, `customMerge`, `d2`, `dark`, `dat`, `data`, `dataCapacityBits`, `dataCapacityBits2`, `dataCodewords`, `dateTimePattern`, `debug`, `deepmerge_1`, `defaultColor`, `defaultFloaterProps`, `defaultItemValues`, `defaultLinks`, `defaultLocale2`, `defaultOptions`, `defaultProps`, `defaultState`, `defaultStateValues`, `defaultTabs`, `defaultValue`, `define2`, `delta`, `depEndTime`, `depTime`, `deps`, `descendants`, `descriptor`, `deselectCurrent`, `destination`, `dimensions`, `disabledProp`, `dispatchBlur`, `dispose`, `dist`, `div`, `document11`, `documentElement`, `documentObject`, `domProps`, `downshiftElements`, `dropdownDefaultStateValues`, `e2`, `e3`, `e4`, `e_1`, `e_3`, `ecc`, `effectivelyComputed`, `el`, `element`, `element1root`, `elementIdsRef`, `elementRect`, `elementScroll`, `elements`, `empty`, `endByLane`, `endPerLane`, `endPosition`, `entry`, `err`, `error`, `esm_default`, `esm_default2`, `event`, `events`, `events2`, `eventsEnabled`, `excludeScroll`, `executeGhostStoriesFlow`, `f2`, `factor`, `fadeScaleIn`, `fgPath`, `filter`, `filteredPanels`, `findIcon`, `first`, `fixedPosition`, `flippedPlacementInfo`, `floorX`, `fn`, `focusOnOpen`, `focusableUIElements`, `forceStatus`, `format2`, `fragmentResult`, `furthestMeasurementsFound`, `fuse`, `g2`, `getType`, `global2`, `globalListeners`, `globalTypes`, `gpuAcceleration`, `groupStatus`, `groupValue`, `h3`, `handleClick`, `handleFileItemSelection`, `handler`, `hasCleanup`, `hasCustomScroll`, `hasElementType`, `hasInert`, `hasItems`, `hasMoreStateThanType`, `hasNativeReflectConstruct`, `hasNativeStartsWith`, `hash`, `head`, `height`, `heightGrowthDirection`, `heights`, `hex`, `hexRegex`, `higherZoomLevel`, `highlight`, `highlightable`, `highlightedElement`, `highlightedIndex`, `highlightedItemId`, `hourCycle`, `hourCycles`, `hourLen`, `href`, `hslColor`, `hslMatched`, `hslaMatched`, `html`, `hue`, `huePrime`, `i2`, `i3`, `i4`, `icons_default`, `icons_exports`, `id`, `idCounter`, `identifierAndLocation`, `ids`, `idx`, `img`, `import_copy_to_clipboard`, `import_copy_to_clipboard2`, `import_deepmerge`, `import_deepmerge2`, `import_deepmerge3`, `import_fuse`, `import_memoizerific`, `import_memoizerific2`, `import_memoizerific3`, `import_memoizerific4`, `import_prop_types`, `import_prop_types2`, `import_prop_types3`, `import_react_innertext`, `import_react_is`, `import_scroll`, `import_shim`, `import_store2`, `index`, `initialHighlight`, `initialLastViewedStoryIds`, `initialState`, `initialValue`, `input`, `inputId`, `inputKeyDownHandlers`, `inputRef`, `instance`, `invert2`, `invertTop`, `isALowPriority`, `isArrowUp`, `isBlurByTabChange`, `isBody`, `isBrowser2`, `isChecked`, `isDisplayed`, `isEnter`, `isExiting`, `isExpanded`, `isFirefox`, `isFirstCall`, `isFunction2`, `isFunction4`, `isIE11`, `isInitialMountRef`, `isItemSelected`, `isMounted`, `isNotificationsEnabled`, `isOpen`, `isPaddingNumber`, `isPagesShown`, `isPinchZoomedIn`, `isReact162`, `isRefocusing`, `isRegistered`, `isRendererReact`, `isResizing`, `isSSR`, `isTest`, `it`, `item`, `itemCount`, `itemError`, `itemExportError`, `itemId`, `itemSize`, `itemStatus`, `itemTitle`, `items`, `itemsLastIndex`, `j2`, `key`, `keyFn`, `keyFnRef`, `keys`, `keysA`, `l`, `l3`, `labelWithProgress`, `landmarkElement`, `landmarkMap`, `landmarksWithRole`, `lang`, `languageTag`, `lastFocused`, `lastFocusedElement`, `lastIndex`, `lastPart`, `latest`, `latestGetSnapshot`, `latestState`, `layout`, `leafs`, `left`, `leftComparator`, `leftKeys`, `len`, `length`, `lightnessModification`, `link`, `linkContent`, `links`, `list`, `locale`, `location2`, `location_1`, `location_2`, `logFn`, `logo`, `lowerZoomLevel`, `lowercasedKey`, `lruLen`, `m2`, `main`, `mainRef`, `mainSide`, `manager_api_default`, `manager_errors_default`, `mappedSteps`, `marginTop`, `match`, `matchIdentifierAtIndex`, `matchMedia`, `matchedValue`, `maxHeight`, `maxIndex`, `maxOffset`, `measurement`, `measurements`, `menu`, `menuElement`, `meta`, `mid`, `middle`, `min`, `minPenalty`, `minPosition`, `modifiers`, `modifiersToRun`, `mouseAndTouchTrackers`, `mouseAndTouchTrackersRef`, `mouseOverHandler`, `n3`, `n4`, `na`, `name`, `nameMatch`, `namedColorMap`, `navigate`, `newActiveIndex`, `newDeps`, `newHeight`, `newHighlightedIndex`, `newId`, `newLocation`, `newPxval`, `newSelectedItems`, `newStateMap`, `newStateToSet`, `newStatus`, `newTree`, `newValue`, `newWidth`, `next`, `nextAction`, `nextHighlightedIndex`, `nextLandmark`, `nextState`, `nextValue`, `noSize`, `node`, `nodeName`, `nodeRef`, `normalizedArgType`, `normalizedColor`, `normalizedColorName`, `normalizedShortcut`, `now`, `ns`, `numAlign`, `numBlocks`, `numCells`, `o3`, `o4`, `objRef`, `objectIs`, `objectTypeName`, `objectTypes`, `observer`, `offset2`, `offsetIndex`, `offsetInfo`, `offsetParent`, `offsetTop`, `offsets`, `onClick`, `onCloseHandler`, `onDismiss`, `onKeyDown`, `onSelectKey`, `onTimeout`, `onlyChild`, `openingBracePosition`, `oppositePosition`, `ops`, `opt`, `option`, `options2`, `optionsResult`, `order`, `originalTarget`, `output`, `overflow`, `overlay`, `overlayMargin`, `overlaySize`, `overlayTop`, `ownerDocument`, `p2`, `padding`, `panelResizer`, `panelResizerRef`, `panelWidth`, `parameters`, `parent`, `parentElement`, `parentId`, `parentNode`, `parentOffset`, `parseLeftAngleResult`, `parseQuoteResult`, `parseUnquotedResult`, `parseValue`, `parsedColor`, `parsedColor1`, `parts`, `path`, `patternChar`, `penalty`, `pendingAt`, `pendingThis`, `pixelRatio`, `placeholderLength`, `placeholderSymbol`, `placeholderSymbol2`, `placement`, `placementInfo`, `placements`, `pointerType`, `popperOffsets`, `popperRect`, `popper_default`, `portal`, `position`, `position2`, `positionWrapper`, `prefix`, `prevComponentValue`, `prevManagerLayoutStateRef`, `prevState`, `prevStateRef`, `previousFocusedElement`, `previousFurthestMeasurement`, `previousSelectedItemRef`, `previousStep`, `prim`, `propTypes`, `properties`, `property`, `props`, `prototype`, `providedArgsIndex`, `qrcode`, `qrcodegen`, `qrcodegen_default`, `r4`, `r5`, `r6`, `r7`, `re`, `react_default`, `react_dom_default`, `react_exports`, `rect`, `red`, `ref`, `refCallback`, `refLoading`, `refProp`, `refRect`, `referenceOffsets`, `registerScrollendEvent`, `registeredTestProviders`, `relatedTargetEl`, `rem`, `rem2`, `removedLruLen`, `renderProps`, `repeats`, `requestId`, `requesting`, `require_ReactPropTypesSecret`, `require_browser`, `require_cjs`, `require_copy_to_clipboard`, `require_factoryWithThrowingShims`, `require_fuse`, `require_memoizerific`, `require_prop_types`, `require_react_fast_compare`, `require_react_innertext`, `require_react_is`, `require_react_is_production_min`, `require_scroll`, `require_scrollparent`, `require_shallowequal`, `require_shim`, `require_store2`, `require_toggle_selection`, `require_use_sync_external_store_shim_production`, `rerender`, `res`, `resetItem`, `resizeObserver`, `resizeObserverInstance`, `rest2`, `result`, `resultTime`, `results`, `ret`, `rgbMatched`, `rgbValue`, `rgbaMatched`, `root2`, `rootElement`, `router_default`, `row`, `rule`, `runColor`, `s2`, `s3`, `s4`, `scale`, `scheduled`, `scrollContainers`, `scrollElement`, `scrollSize`, `scrollTimeout`, `scrollTop`, `scrollableAncestors`, `scrollableElements`, `searchResult`, `sectionRef`, `seg`, `segs`, `selected`, `selectedItem`, `selectedStory`, `selection`, `setFullyExpanded`, `setGetterPropCallInfo`, `setIdsA`, `setIdsB`, `shim`, `shortcut`, `shortcutKeys`, `shorthandRegex`, `shouldCallDispatch`, `shouldScrollRef`, `shouldSelect`, `shouldStopPropagation`, `siblings`, `side`, `sideA`, `sidebarDragX`, `sign`, `signDisplay`, `signOpts`, `size`, `sizeAxisState`, `skeleton`, `slideIn`, `slideIn2`, `slotKey`, `source`, `sourceIsArray`, `sourceSymbolKeys`, `spacerRef`, `split`, `splitRegex`, `spotlight2`, `src_default`, `start`, `startIndex`, `startOffset`, `startPerLane`, `startPosition`, `startingPosition`, `state`, `stateKeys`, `stateObj`, `stateRef`, `status`, `statusDiv`, `statusLinks`, `statusOrder`, `step`, `steps`, `stopPressStart`, `store3`, `storeOptions`, `stories`, `story`, `storyId`, `storyStatuses`, `strategy`, `stringToken`, `stringValue`, `style`, `styleAndLocation`, `styleLocation`, `styleStartPosition`, `styles2`, `subscribed`, `subscriptions`, `subtract`, `successful`, `supportedLocales`, `supportsMicroTasks`, `supportsScrollend`, `t2`, `t3`, `t4`, `tabContent`, `tabIndex`, `tab_1`, `tabs`, `tabsToInclude`, `tagName`, `tagType`, `target`, `targetOldUserSelect`, `targetStyles`, `targetWindow`, `temp`, `testKey`, `textRef`, `theme`, `theming_default`, `timeData`, `timeout`, `timeoutId`, `timeoutRef`, `timeouts`, `timer`, `title2`, `toOffset`, `toggle`, `toggleButtonKeyDownHandlers`, `toggleCollapsed`, `token`, `tokens2`, `toolbar`, `total`, `transformProp`, `transitions`, `type`, `typeEndPosition_1`, `types_default`, `u2`, `u3`, `unit`, `unknown`, `unsubscribe`, `updateA11yStatus`, `updatePosition`, `useArrowKeyNavigation`, `useControlPropsValidator`, `useIsomorphicLayoutEffect`, `userTagsCounts`, `v3`, `val`, `validTabNodes`, `validatePropTypes`, `value`, `valueA`, `values`, `varName`, `ver`, `version3`, `view1`, `virtualItems`, `w2`, `wasControlled`, `wasPanelShown`, `width`, `win`, `window2`, `windowObject`, `wrapperOffset`, `wrapperStyles`, `x2`, `z2`, `zoomLevel`

### `storybook-static/vite-inject-mocker-entry.js`

- No parseable top-level symbols found

### `tests/soak/adapter_concurrent.test.ts`

- Functions:
  - `heapUsed`
- Top-level variables:
  - `adapter`, `baseline`, `deltaMb`, `eventCount`, `frozenCount`, `peak`, `unsubs`

### `tests/soak/render_heavy.test.ts`

- Functions:
  - `createBars`
- Top-level variables:
  - `avgPerLoop`, `bars`, `close`, `drift`, `elapsedMs`, `high`, `lastLeftDomain`, `lastRightDomain`, `loops`, `low`, `open`, `pane`, `result`, `startedAt`

### `tsup.config.ts`

- No parseable top-level symbols found

## Update Workflow

1. After adding/changing functions/classes/variables, run:
   - `python scripts/generate_module_tree.py`
2. Review `module_tree_full.md` diff.
3. Commit source changes and updated tree together.
