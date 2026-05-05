import React, { Component } from "react";
import PropTypes from "prop-types";
import { extent as d3Extent, min, max } from "d3-array";

import {
	head,
	last,
	isDefined,
	isNotDefined,
	clearCanvas,
	shallowEqual,
	identity,
	noop,
	functor,
	getLogger,
} from "./utils";

import {
	mouseBasedZoomAnchor,
} from "./utils/zoomBehavior";

import { getNewChartConfig, getChartConfigWithUpdatedYScales, getCurrentCharts, getCurrentItem } from "./utils/ChartDataUtil";

import EventCapture from "./EventCapture";
import CanvasContainer from "./CanvasContainer";
import evaluator from "./scale/evaluator";
import { StockChartProvider } from "./StockChartContext";
import type { AnyRecord } from "./types";

type MouseXY = [number, number];

type ChartCanvasProps = AnyRecord;

type ChartCanvasState = AnyRecord & {
	plotData: any[];
	xScale: any;
	xAccessor: any;
	displayXAccessor: any;
	chartConfig: any[];
	filterData: any;
};

const log = getLogger("ChartCanvas");

const CANDIDATES_FOR_RESET = [
	"seriesName",
	"xExtents",
];

function shouldResetChart(thisProps: AnyRecord, nextProps: AnyRecord) {
	return !CANDIDATES_FOR_RESET.every(key => {
		const result = shallowEqual(thisProps[key], nextProps[key]);
		return result;
	});
}

function getCursorStyle() {
	const tooltipStyle = `
	.react-stockcharts-grabbing-cursor { pointer-events: all; cursor: grabbing; }
	.react-stockcharts-crosshair-cursor { pointer-events: all; cursor: crosshair; }
	.react-stockcharts-tooltip-hover { pointer-events: all; cursor: pointer; }
	.react-stockcharts-avoid-interaction { pointer-events: none; }
	.react-stockcharts-enable-interaction { pointer-events: all; }
	.react-stockcharts-default-cursor { cursor: default; }
	.react-stockcharts-move-cursor { cursor: move; }
	.react-stockcharts-pointer-cursor { cursor: pointer; }
	.react-stockcharts-ns-resize-cursor { cursor: ns-resize; }
	.react-stockcharts-ew-resize-cursor { cursor: ew-resize; }`;
	return (<style type="text/css">{tooltipStyle}</style>);
}

function getDimensions(props: AnyRecord) {
	return {
		height: props.height - props.margin.top - props.margin.bottom,
		width: props.width - props.margin.left - props.margin.right,
	};
}

function getXScaleDirection(flipXScale: boolean) {
	return flipXScale ? -1 : 1;
}

function calculateFullData(props: AnyRecord) {
	const { data: fullData, plotFull, xScale, clamp, pointsPerPxThreshold, flipXScale } = props;
	const { xAccessor, displayXAccessor, minPointsPerPxThreshold } = props;

	const useWholeData = isDefined(plotFull) ? plotFull : xAccessor === identity;

	const { filterData } = evaluator({
		xScale,
		useWholeData,
		clamp,
		pointsPerPxThreshold,
		minPointsPerPxThreshold,
		flipXScale,
	});

	return {
		xAccessor,
		displayXAccessor: displayXAccessor || xAccessor,
		xScale: xScale.copy(),
		fullData,
		filterData
	};
}

function resetChart(props: AnyRecord) {
	const state = calculateState(props);
	const { xAccessor, displayXAccessor, fullData } = state;
	const { plotData: initialPlotData, xScale } = state;
	const { postCalculator, children } = props;

	const plotData = postCalculator(initialPlotData);
	const dimensions = getDimensions(props);
	const chartConfig = getChartConfigWithUpdatedYScales(
		getNewChartConfig(dimensions, children),
		{ plotData, xAccessor, displayXAccessor, fullData },
		xScale.domain()
	);

	return {
		...state,
		xScale,
		plotData,
		chartConfig,
	};
}

function updateChart(newState: AnyRecord, initialXScale: any, props: AnyRecord, lastItemWasVisible: boolean, initialChartConfig: any) {
	const { fullData, xScale, xAccessor, displayXAccessor, filterData } = newState;
	const lastItem = last(fullData);
	const [start, end] = initialXScale.domain();
	const { postCalculator, children, padding, flipXScale, maintainPointsPerPixelOnResize } = props;
	const direction = getXScaleDirection(flipXScale);
	const dimensions = getDimensions(props);
	const updatedXScale = setXRange(xScale, dimensions, padding, direction);

	let initialPlotData;
	if (!lastItemWasVisible || end >= xAccessor(lastItem)) {
		const [rangeStart, rangeEnd] = initialXScale.range();
		const [newRangeStart, newRangeEnd] = updatedXScale.range();
		const newDomainExtent = ((newRangeEnd - newRangeStart) / (rangeEnd - rangeStart)) * (end - start);
		const newStart = maintainPointsPerPixelOnResize ? end - newDomainExtent : start;
		const lastItemX = initialXScale(xAccessor(lastItem));
		const response = filterData(fullData, [newStart, end], xAccessor, updatedXScale, { fallbackStart: start, fallbackEnd: { lastItem, lastItemX } });
		initialPlotData = response.plotData;
		updatedXScale.domain(response.domain);
	} else if (lastItemWasVisible && end < xAccessor(lastItem)) {
		const dx = initialXScale(xAccessor(lastItem)) - initialXScale.range()[1];
		const [newStart, newEnd] = initialXScale.range().map((x: number) => x + dx).map(initialXScale.invert);
		const response = filterData(fullData, [newStart, newEnd], xAccessor, updatedXScale);
		initialPlotData = response.plotData;
		updatedXScale.domain(response.domain);
	}
	const plotData = postCalculator(initialPlotData);
	const chartConfig = getChartConfigWithUpdatedYScales(
		getNewChartConfig(dimensions, children, initialChartConfig),
		{ plotData, xAccessor, displayXAccessor, fullData },
		updatedXScale.domain()
	);

	return {
		xScale: updatedXScale,
		xAccessor,
		chartConfig,
		plotData,
		fullData,
		filterData,
	};
}

function calculateState(props: AnyRecord) {
	const { xAccessor: inputXAccesor, xExtents: xExtentsProp, data, padding, flipXScale } = props;
	const direction = getXScaleDirection(flipXScale);
	const dimensions = getDimensions(props);
	const extent = typeof xExtentsProp === "function" ? xExtentsProp(data) : d3Extent(xExtentsProp.map((d: any) => functor(d)).map((each: any) => each(data, inputXAccesor)));
	const { xAccessor, displayXAccessor, xScale, fullData, filterData } = calculateFullData(props);
	const updatedXScale = setXRange(xScale, dimensions, padding, direction);
	const { plotData, domain } = filterData(fullData, extent, inputXAccesor, updatedXScale);

	return {
		plotData,
		xScale: updatedXScale.domain(domain),
		xAccessor,
		displayXAccessor,
		fullData,
		filterData,
	};
}

function setXRange(xScale: any, dimensions: { width: number }, padding: any, direction = 1) {
	const { left, right } = isNaN(padding) ? padding : { left: padding, right: padding };
	if (direction > 0) {
		xScale.range([left, dimensions.width - right]);
	} else {
		xScale.range([dimensions.width - right, left]);
	}
	return xScale;
}


class ChartCanvas extends Component<ChartCanvasProps, ChartCanvasState> {
	declare eventCaptureNode: { setCursorClass: (className: string | null | undefined) => void } | undefined;
	declare canvasContainerNode: { getCanvasContexts: () => any } | undefined;
	declare subscriptions: any[];
	declare interactiveState: any[];
	declare panInProgress: boolean;
	declare lastSubscriptionId: number;
	declare mutableState: AnyRecord;
	declare fullData: any[];
	declare prevMouseXY: MouseXY | undefined;
	declare waitingForMouseMoveAnimationFrame: boolean | undefined;
	declare waitingForPanAnimationFrame: boolean | undefined;
	static defaultProps: Partial<ChartCanvasProps>;
	constructor(props: ChartCanvasProps) {
		super(props);
		this.getDataInfo = this.getDataInfo.bind(this);
		this.getCanvasContexts = this.getCanvasContexts.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.handleZoom = this.handleZoom.bind(this);
		this.handlePan = this.handlePan.bind(this);
		this.handlePanEnd = this.handlePanEnd.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleDoubleClick = this.handleDoubleClick.bind(this);
		this.handleContextMenu = this.handleContextMenu.bind(this);
		this.handleDragStart = this.handleDragStart.bind(this);
		this.handleDrag = this.handleDrag.bind(this);
		this.handleDragEnd = this.handleDragEnd.bind(this);
		this.panHelper = this.panHelper.bind(this);
		this.xAxisZoom = this.xAxisZoom.bind(this);
		this.yAxisZoom = this.yAxisZoom.bind(this);
		this.calculateStateForDomain = this.calculateStateForDomain.bind(this);
		this.generateSubscriptionId = this.generateSubscriptionId.bind(this);
		this.draw = this.draw.bind(this);
		this.redraw = this.redraw.bind(this);
		this.getAllPanConditions = this.getAllPanConditions.bind(this);
		this.subscribe = this.subscribe.bind(this);
		this.unsubscribe = this.unsubscribe.bind(this);
		this.amIOnTop = this.amIOnTop.bind(this);
		this.saveEventCaptureNode = this.saveEventCaptureNode.bind(this);
		this.saveCanvasContainerNode = this.saveCanvasContainerNode.bind(this);
		this.setCursorClass = this.setCursorClass.bind(this);
		this.getMutableState = this.getMutableState.bind(this);
		this.notifyVisibleDomainChange = this.notifyVisibleDomainChange.bind(this);

		this.subscriptions = [];
		this.interactiveState = [];
		this.panInProgress = false;
		this.lastSubscriptionId = 0;
		this.mutableState = {};

		const { fullData, ...state } = resetChart(props);
		this.state = state;
		this.fullData = fullData;
	}

	componentDidUpdate(prevProps: Readonly<AnyRecord>) {
		const reset = shouldResetChart(prevProps, this.props);
		const sizeChanged = prevProps.width !== this.props.width || prevProps.height !== this.props.height;
		if (reset || prevProps.data !== this.props.data || sizeChanged) {
			const { fullData, ...state } = resetChart(this.props);
			this.fullData = fullData;
			this.setState(state, () => {
				this.syncStateToSubscriptions();
				this.clearThreeCanvas();
				this.draw({ force: true });
				this.notifyVisibleDomainChange();
			});
		}
	}

	saveEventCaptureNode(node: any) { this.eventCaptureNode = node; }
	saveCanvasContainerNode(node: any) { this.canvasContainerNode = node; }
	getMutableState() { return this.mutableState; }
	notifyVisibleDomainChange(xScale = this.state.xScale) {
		this.props.onVisibleDomainChange?.(xScale.domain());
	}
	getDataInfo() { return { ...this.state, fullData: this.fullData }; }
	getCanvasContexts() { return this.canvasContainerNode?.getCanvasContexts(); }
	generateSubscriptionId() { return ++this.lastSubscriptionId; }
	
	clearBothCanvas() {
		const canvases = this.getCanvasContexts();
		if (canvases?.axes) clearCanvas([canvases.axes, canvases.mouseCoord], this.props.ratio);
	}
	clearMouseCanvas() {
		const canvases = this.getCanvasContexts();
		if (canvases?.mouseCoord) clearCanvas([canvases.mouseCoord], this.props.ratio);
	}
	clearThreeCanvas() {
		const canvases = this.getCanvasContexts();
		if (canvases?.axes) clearCanvas([canvases.axes, canvases.mouseCoord, canvases.bg], this.props.ratio);
	}

	subscribe(id: string | number, rest: AnyRecord) {
		const { getPanConditions = functor({ draggable: false, panEnabled: true }) } = rest;
		this.subscriptions = this.subscriptions.concat({ id, ...rest, getPanConditions });
	}
	unsubscribe(id: string | number) { this.subscriptions = this.subscriptions.filter(each => each.id !== id); }
	getAllPanConditions() { return this.subscriptions.map(each => each.getPanConditions()); }
	setCursorClass(className: string | null | undefined) { this.eventCaptureNode?.setCursorClass(className); }
	amIOnTop(id: string | number) {
		const dragableComponents = this.subscriptions.filter(each => each.getPanConditions().draggable);
		return dragableComponents.length > 0 && last(dragableComponents).id === id;
	}

	handleContextMenu(mouseXY: MouseXY, e: unknown) {
		const { xAccessor, chartConfig, plotData, xScale } = this.state;
		const currentCharts = getCurrentCharts(chartConfig, mouseXY);
		const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
		this.triggerEvent("contextmenu", { mouseXY, currentItem, currentCharts }, e);
	}

	handleMouseEnter(e: unknown) {
		this.triggerEvent("mouseenter", { show: true }, e);
	}

	handleMouseDown(mouseXY: MouseXY, currentCharts: any, e: unknown) {
		const { xScale, xAccessor, plotData } = this.state;
		const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
		this.triggerEvent("mousedown", { mouseXY, currentCharts, currentItem }, e);
	}

	calculateStateForDomain(newDomain: any[]) {
		const { xAccessor, displayXAccessor, xScale: initialXScale, chartConfig: initialChartConfig, plotData: initialPlotData, filterData } = this.state;
		const { fullData } = this;
		const { postCalculator } = this.props;
		const { plotData: beforePlotData, domain } = filterData(fullData, newDomain, xAccessor, initialXScale, { currentPlotData: initialPlotData, currentDomain: initialXScale.domain() });
		const plotData = postCalculator(beforePlotData);
		const updatedScale = initialXScale.copy().domain(domain);
		const chartConfig = getChartConfigWithUpdatedYScales(initialChartConfig, { plotData, xAccessor, displayXAccessor, fullData }, updatedScale.domain());
		return { xScale: updatedScale, plotData, chartConfig };
	}

	triggerEvent(type: string, props: AnyRecord, e: unknown) {
		this.subscriptions.forEach(each => {
			const state = { ...this.state, fullData: this.fullData, subscriptions: this.subscriptions };
			each.listener(type, props, state, e);
		});
	}

	draw(props: { trigger?: string; force?: boolean } = { force: false }) { this.subscriptions.forEach(each => { if (isDefined(each.draw)) each.draw(props); }); }
	redraw() { this.clearThreeCanvas(); this.draw({ force: true }); }

	/**
	 * Push state into every subscription's moreProps using the "__sync__" event type.
	 * "__sync__" causes only updateMoreProps() — no evaluateType(), no forceUpdate().
	 * Call this BEFORE clearThreeCanvas()+draw() so draws use the correct scale/data.
	 */
	syncStateToSubscriptions(state?: { xScale: any; plotData: any; chartConfig: any }) {
		const s = state ?? {
			xScale: this.state.xScale,
			plotData: this.state.plotData,
			chartConfig: this.state.chartConfig,
		};
		this.triggerEvent("__sync__", s, null);
	}

	handleZoom(zoomDirection: number, mouseXY: MouseXY, e: unknown) {
		if (this.panInProgress) return;
		const { xAccessor, xScale: initialXScale, plotData: initialPlotData } = this.state;
		const { zoomMultiplier, zoomAnchor, fullData } = this.props;
		const item = zoomAnchor({ xScale: initialXScale, xAccessor, mouseXY, plotData: initialPlotData, fullData: this.fullData });
		const cx = initialXScale(item);
		const c = zoomDirection > 0 ? 1 * zoomMultiplier : 1 / zoomMultiplier;
		const newDomain = initialXScale.range().map((x: number) => cx + (x - cx) * c).map(initialXScale.invert);
		const { xScale, plotData, chartConfig } = this.calculateStateForDomain(newDomain);
		// Pre-sync moreProps BEFORE React re-renders so componentDidUpdate draws
		// with the correct zoom scale instead of stale pan scale.
		this.syncStateToSubscriptions({ xScale, plotData, chartConfig });
		this.clearThreeCanvas();
		this.setState({ xScale, plotData, chartConfig }, () => {
			this.draw({ force: true });
			this.notifyVisibleDomainChange(xScale);
		});
	}

	xAxisZoom(newDomain: any[]) {
		const { xScale, plotData, chartConfig } = this.calculateStateForDomain(newDomain);
		this.syncStateToSubscriptions({ xScale, plotData, chartConfig });
		this.clearThreeCanvas();
		this.setState({ xScale, plotData, chartConfig }, () => {
			this.draw({ force: true });
			this.notifyVisibleDomainChange(xScale);
		});
	}

	yAxisZoom(chartId: string | number, newDomain: any[]) {
		this.clearThreeCanvas();
		const { chartConfig: initialChartConfig } = this.state;
		const chartConfig = initialChartConfig.map(each => {
			if (each.id === chartId) {
				return { ...each, yScale: each.yScale.copy().domain(newDomain), yPanEnabled: true };
			}
			return each;
		});
		this.setState({ chartConfig });
	}

	panHelper(mouseXY: MouseXY, initialXScale: any, { dx, dy }: { dx: number; dy: number }, chartsToPan: any) {
		const { xAccessor, displayXAccessor, chartConfig: initialChartConfig, filterData } = this.state;
		const { fullData } = this;
		const { postCalculator } = this.props;
		const newDomain = initialXScale.range().map((x: number) => x - dx).map(initialXScale.invert);
		const { plotData: beforePlotData, domain } = filterData(fullData, newDomain, xAccessor, initialXScale, { currentPlotData: this.state.plotData, currentDomain: initialXScale.domain() });
		const updatedScale = initialXScale.copy().domain(domain);
		const plotData = postCalculator(beforePlotData);
		const chartConfig = getChartConfigWithUpdatedYScales(initialChartConfig, { plotData, xAccessor, displayXAccessor, fullData }, updatedScale.domain(), dy, chartsToPan);
		return { xScale: updatedScale, plotData, chartConfig, mouseXY, currentCharts: getCurrentCharts(chartConfig, mouseXY), currentItem: getCurrentItem(updatedScale, xAccessor, mouseXY, plotData) };
	}

	handlePan(mousePosition: MouseXY, panStartXScale: any, dxdy: { dx: number; dy: number }, chartsToPan: any, e: unknown) {
		if (!this.waitingForPanAnimationFrame) {
			this.waitingForPanAnimationFrame = true;
			const state = this.panHelper(mousePosition, panStartXScale, dxdy, chartsToPan);
			this.panInProgress = true;
			this.triggerEvent("pan", state, e);
			this.mutableState = { mouseXY: state.mouseXY, currentItem: state.currentItem, currentCharts: state.currentCharts };
			requestAnimationFrame(() => {
				this.waitingForPanAnimationFrame = false;
				this.clearBothCanvas();
				this.draw({ trigger: "pan" });
			});
		}
	}

	handlePanEnd(mousePosition: MouseXY, panStartXScale: any, dxdy: { dx: number; dy: number }, chartsToPan: any, e: unknown) {
		const state = this.panHelper(mousePosition, panStartXScale, dxdy, chartsToPan);
		this.panInProgress = false;
		// Pre-sync moreProps with final pan state so componentDidUpdate draws correctly.
		this.syncStateToSubscriptions({ xScale: state.xScale, plotData: state.plotData, chartConfig: state.chartConfig });
		this.clearThreeCanvas();
		this.setState(state, () => {
			this.notifyVisibleDomainChange(state.xScale);
		});
	}

	handleMouseMove(mouseXY: MouseXY, inputType: string, e: unknown) {
		const { chartConfig, plotData, xScale, xAccessor } = this.state;
		const currentCharts = getCurrentCharts(chartConfig, mouseXY);
		const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
		this.triggerEvent("mousemove", { show: true, mouseXY, prevMouseXY: this.prevMouseXY, currentItem, currentCharts }, e);
		this.prevMouseXY = mouseXY;
		this.mutableState = { mouseXY, currentItem, currentCharts };

		if (!this.waitingForMouseMoveAnimationFrame) {
			this.waitingForMouseMoveAnimationFrame = true;
			requestAnimationFrame(() => {
				this.clearMouseCanvas();
				this.draw({ trigger: "mousemove" });
				this.waitingForMouseMoveAnimationFrame = false;
			});
		}
	}

	handleMouseLeave(e: unknown) {
		this.triggerEvent("mouseleave", { show: false }, e);
		this.clearMouseCanvas();
		this.draw({ trigger: "mouseleave" });
	}

	handleDragStart({ startPos }: { startPos: MouseXY }, e: unknown) { this.triggerEvent("dragstart", { startPos }, e); }
	handleDrag({ startPos, mouseXY }: { startPos: MouseXY; mouseXY: MouseXY }, e: unknown) {
		const { chartConfig, plotData, xScale, xAccessor } = this.state;
		const currentCharts = getCurrentCharts(chartConfig, mouseXY);
		const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
		this.triggerEvent("drag", { startPos, mouseXY, currentItem, currentCharts }, e);
		this.mutableState = { mouseXY, currentItem, currentCharts };
		requestAnimationFrame(() => { this.clearMouseCanvas(); this.draw({ trigger: "drag" }); });
	}
	handleDragEnd({ mouseXY }: { mouseXY: MouseXY }, e: unknown) {
		this.triggerEvent("dragend", { mouseXY }, e);
		requestAnimationFrame(() => { this.clearMouseCanvas(); this.draw({ trigger: "dragend" }); });
	}

	handleClick(mousePosition: MouseXY, e: unknown) {
		this.triggerEvent("click", this.mutableState, e);
		requestAnimationFrame(() => { this.clearMouseCanvas(); this.draw({ trigger: "click" }); });
	}
	handleDoubleClick(mousePosition: MouseXY, e: unknown) { this.triggerEvent("dblclick", {}, e); }

	render() {
		const { type, height, width, margin, className, zIndex, defaultFocus, ratio, mouseMoveEvent, panEvent, zoomEvent, useCrossHairStyleCursor, onSelect, children } = this.props;
		const { plotData, xScale, xAccessor, chartConfig } = this.state;
		const dimensions = getDimensions(this.props);
		const interaction = !isNaN(xScale(xAccessor(head(plotData)))) && isDefined(xScale.invert);
		const cursorStyle = useCrossHairStyleCursor && interaction;
		const cursor = getCursorStyle();

		const contextValue = {
			fullData: this.fullData,
			plotData: this.state.plotData,
			width: dimensions.width,
			height: dimensions.height,
			chartConfig: this.state.chartConfig,
			xScale: this.state.xScale,
			xAccessor: this.state.xAccessor,
			displayXAccessor: this.state.displayXAccessor,
			chartCanvasType: this.props.type,
			margin: this.props.margin,
			ratio: this.props.ratio,
			xAxisZoom: this.xAxisZoom,
			yAxisZoom: this.yAxisZoom,
			getCanvasContexts: this.getCanvasContexts,
			redraw: this.redraw,
			subscribe: this.subscribe,
			unsubscribe: this.unsubscribe,
			generateSubscriptionId: this.generateSubscriptionId,
			getMutableState: this.getMutableState,
			amIOnTop: this.amIOnTop,
			setCursorClass: this.setCursorClass,
		};

		return (
			<StockChartProvider value={contextValue}>
				<div style={{ position: "relative", width, height }} className={className} onClick={onSelect}>
					<CanvasContainer ref={this.saveCanvasContainerNode} type={type} ratio={ratio} width={width} height={height} zIndex={zIndex}/>
					<svg className={className} width={width} height={height} style={{ position: "absolute", zIndex: (zIndex + 5) }}>
						{cursor}
						<defs>
							<clipPath id="chart-area-clip">
								<rect x="0" y="0" width={dimensions.width} height={dimensions.height} />
							</clipPath>
							{chartConfig.map((each, idx) => <clipPath key={idx} id={`chart-area-clip-${each.id}`}>
								<rect x="0" y="0" width={each.width} height={each.height} />
							</clipPath>)}
						</defs>
						<g transform={`translate(${margin.left + 0.5}, ${margin.top + 0.5})`}>
							<EventCapture
								ref={this.saveEventCaptureNode}
								useCrossHairStyleCursor={cursorStyle}
								mouseMove={mouseMoveEvent && interaction}
								zoom={zoomEvent && interaction}
								pan={panEvent && interaction}
								width={dimensions.width}
								height={dimensions.height}
								chartConfig={chartConfig}
								xScale={xScale}
								xAccessor={xAccessor}
								focus={defaultFocus}
								disableInteraction={this.props.disableInteraction}
								getAllPanConditions={this.getAllPanConditions}
								onContextMenu={this.handleContextMenu}
								onClick={this.handleClick}
								onDoubleClick={this.handleDoubleClick}
								onMouseDown={this.handleMouseDown}
								onMouseMove={this.handleMouseMove}
								onMouseEnter={this.handleMouseEnter}
								onMouseLeave={this.handleMouseLeave}
								onDragStart={this.handleDragStart}
								onDrag={this.handleDrag}
								onDragComplete={this.handleDragEnd}
								onZoom={this.handleZoom}
								onPan={this.handlePan}
								onPanEnd={this.handlePanEnd}
							/>
							<g className="react-stockcharts-avoid-interaction">
								{children}
							</g>
						</g>
					</svg>
				</div>
			</StockChartProvider>
		);
	}
}

ChartCanvas.propTypes = {
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	margin: PropTypes.object,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]),
	data: PropTypes.array.isRequired,
	xAccessor: PropTypes.func,
	xExtents: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
	zoomAnchor: PropTypes.func,
	className: PropTypes.string,
	seriesName: PropTypes.string.isRequired,
	zIndex: PropTypes.number,
	children: PropTypes.node.isRequired,
	xScale: PropTypes.func.isRequired,
	postCalculator: PropTypes.func,
	flipXScale: PropTypes.bool,
	useCrossHairStyleCursor: PropTypes.bool,
	padding: PropTypes.oneOfType([PropTypes.number, PropTypes.shape({ left: PropTypes.number, right: PropTypes.number })]),
	defaultFocus: PropTypes.bool,
	zoomMultiplier: PropTypes.number,
	onLoadMore: PropTypes.func,
	displayXAccessor: PropTypes.func,
	mouseMoveEvent: PropTypes.bool,
	panEvent: PropTypes.bool,
	clamp: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.func]),
	zoomEvent: PropTypes.bool,
	onSelect: PropTypes.func,
	onVisibleDomainChange: PropTypes.func,
	maintainPointsPerPixelOnResize: PropTypes.bool,
	disableInteraction: PropTypes.bool,
};

ChartCanvas.defaultProps = {
	margin: { top: 20, right: 30, bottom: 30, left: 80 },
	type: "hybrid",
	className: "react-stockchart",
	zIndex: 1,
	xExtents: [min, max],
	postCalculator: identity,
	padding: 0,
	xAccessor: identity,
	flipXScale: false,
	useCrossHairStyleCursor: true,
	defaultFocus: true,
	onLoadMore: noop,
	onSelect: noop,
	onVisibleDomainChange: noop,
	mouseMoveEvent: true,
	panEvent: true,
	zoomEvent: true,
	zoomMultiplier: 1.6,
	clamp: false,
	zoomAnchor: mouseBasedZoomAnchor,
	maintainPointsPerPixelOnResize: true,
	disableInteraction: false,
	pointsPerPxThreshold: 2,
	minPointsPerPxThreshold: 0.02,
};

export default ChartCanvas;
