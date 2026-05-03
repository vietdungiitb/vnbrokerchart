# React Stockcharts Module Tree (Auto-generated)

> Do not edit manually. Regenerate with `python scripts/generate_module_tree.py`.

Generated at: `2026-05-03 15:29:11`

## Summary

- Total modules: 319
- Python modules: 1
- JS/TS modules: 318
- Total classes: 218
- Total functions: 313
- Total top-level variables: 1840

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

### `src/demo/demoData.ts`

- Functions:
  - `computeIndicators`, `fetchLiveDemoData`, `formatBinanceKlines`, `getOfflineDemoData`, `parseCsvRow`, `parseDateTime`
- Top-level variables:
  - `BINANCE_ENDPOINT`, `BOLLINGER_BAND_OPTIONS`, `DEMO_WINDOW`, `bollingerBandCalculator`, `ema20`, `ema50`, `enriched`, `json`, `macdCalculator`, `parsed`, `response`, `rsiCalculator`

### `src/demo/FullDemo.tsx`

- Functions:
  - `FullDemo`, `LegendRow`, `MetricTile`, `createOrigin`, `formatSigned`, `getInitialExtents`, `handleBrush`, `handleResetView`, `handleResize`, `normalizeBrushExtents`, `updateWidth`
- Top-level variables:
  - `axisTheme`, `bearishColor`, `bollingerAppearance`, `bottomXAxisTheme`, `bullishColor`, `cancelled`, `chartData`, `chartHeight`, `chartSurfaceRef`, `controller`, `coordinateTheme`, `dateFormat`, `ema20Stroke`, `ema50Stroke`, `emaTrendUp`, `endDate`, `endIndex`, `gridWidth`, `integerFormat`, `latest`, `macdAppearance`, `macdHeight`, `macdOrigin`, `margin`, `node`, `observer`, `offlineData`, `overviewHeight`, `overviewOrigin`, `percentFormat`, `plotHeight`, `previous`, `priceChange`, `priceChangePercent`, `priceFormat`, `priceHeight`, `priceYAxisTheme`, `resolvedChartWidth`, `rsiAppearance`, `rsiOrigin`, `rsiPanelHeight`, `rsiValue`, `sign`, `sourceStatusLabel`, `sourceTone`, `startDate`, `startIndex`, `themeFontFamily`, `tooltipDisplayTexts`, `topXAxisTheme`, `volumeFormat`, `volumeHeight`, `volumeOrigin`, `volumeYAxisTheme`

### `src/demo/index.tsx`

- Top-level variables:
  - `container`, `root`

### `src/demo/LiveDemo.tsx`

- Functions:
  - `LiveDemo`
- Top-level variables:
  - `cancelled`, `height`, `margin`, `width`

### `src/index.ts`

- Top-level variables:
  - `version`

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
  - `CANDIDATES_FOR_RESET`, `c`, `canvases`, `chartConfig`, `contextValue`, `currentCharts`, `currentItem`, `cursor`, `cursorStyle`, `cx`, `dimensions`, `direction`, `dragableComponents`, `dx`, `extent`, `initialPlotData`, `interaction`, `item`, `lastItem`, `lastItemX`, `log`, `newDomain`, `newDomainExtent`, `newStart`, `plotData`, `reset`, `response`, `result`, `state`, `tooltipStyle`, `updatedScale`, `updatedXScale`, `useWholeData`

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
  - `ALWAYS_TRUE_TYPES`, `canvasOriginX`, `canvasOriginY`, `chartConfig`

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

### `src/lib/interactive/Brush.tsx`

- Classes:
  - `Brush`
- Top-level variables:
  - `dashArray`, `height`, `shouldBrush`, `width`, `x`, `x1y1`, `y`

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
  - `chartWidth`, `clampedDomain`, `filteredData`, `lastItemXValue`, `left`, `log`, `newEnd`, `newLeftIndex`, `newRightIndex`, `newWidth`, `newXScale`, `plotData`, `realInputDomain`, `right`, `width`, `xScale`

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
  - `currentItem`, `divergence`, `macd`, `macdValue`, `origin`, `signal`

### `src/lib/tooltip/MovingAverageTooltip.tsx`

- Classes:
  - `MovingAverageTooltip`, `SingleMAToolTip`
- Top-level variables:
  - `config`, `currentItem`, `origin`, `tooltipLabel`, `translate`, `yDisplayValue`, `yValue`

### `src/lib/tooltip/OHLCTooltip.tsx`

- Classes:
  - `OHLCTooltip`
- Functions:
  - `defaultDisplay`
- Top-level variables:
  - `currentItem`, `displayDate`, `displayTextsDefault`, `item`, `itemsToDisplay`, `origin`

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

## Update Workflow

1. After adding/changing functions/classes/variables, run:
   - `python scripts/generate_module_tree.py`
2. Review `module_tree_full.md` diff.
3. Commit source changes and updated tree together.
