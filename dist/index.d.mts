import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import React__default, { Component, HTMLAttributes, ReactNode, CSSProperties } from 'react';
import * as d3_scale from 'd3-scale';
import PropTypes from 'prop-types';

type AnyRecord = Record<string, any>;
type ChartDatum = any;
type ChartAccessor<T = any, R = any> = (datum: T) => R;
interface OHLCV {
    date: Date | number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    [key: string]: any;
}
interface CandleWick {
    stroke: string;
    x: number;
    y1: number;
    y2: number;
    y3: number;
    y4: number;
}
interface CandleData {
    x: number;
    y: number;
    wick: CandleWick;
    height: number;
    width: number;
    fill: string;
    stroke: string;
    className?: string;
}
interface BarData {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
}
interface CanvasContexts {
    axes?: CanvasRenderingContext2D;
    mouseCoord?: CanvasRenderingContext2D;
    bg?: CanvasRenderingContext2D;
    [key: string]: any;
}
type MoreProps = AnyRecord;

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
declare class ChartCanvas extends Component<ChartCanvasProps, ChartCanvasState> {
    eventCaptureNode: {
        setCursorClass: (className: string | null | undefined) => void;
    } | undefined;
    canvasContainerNode: {
        getCanvasContexts: () => any;
    } | undefined;
    subscriptions: any[];
    interactiveState: any[];
    panInProgress: boolean;
    lastSubscriptionId: number;
    mutableState: AnyRecord;
    fullData: any[];
    prevMouseXY: MouseXY | undefined;
    waitingForMouseMoveAnimationFrame: boolean | undefined;
    waitingForPanAnimationFrame: boolean | undefined;
    static defaultProps: Partial<ChartCanvasProps>;
    constructor(props: ChartCanvasProps);
    componentDidUpdate(prevProps: Readonly<AnyRecord>): void;
    saveEventCaptureNode(node: any): void;
    saveCanvasContainerNode(node: any): void;
    getMutableState(): AnyRecord;
    notifyVisibleDomainChange(xScale?: any): void;
    getDataInfo(): {
        fullData: any[];
        plotData: any[];
        xScale: any;
        xAccessor: any;
        displayXAccessor: any;
        chartConfig: any[];
        filterData: any;
    };
    getCanvasContexts(): any;
    generateSubscriptionId(): number;
    clearBothCanvas(): void;
    clearMouseCanvas(): void;
    clearThreeCanvas(): void;
    subscribe(id: string | number, rest: AnyRecord): void;
    unsubscribe(id: string | number): void;
    getAllPanConditions(): any[];
    setCursorClass(className: string | null | undefined): void;
    amIOnTop(id: string | number): boolean;
    handleContextMenu(mouseXY: MouseXY, e: unknown): void;
    handleMouseEnter(e: unknown): void;
    handleMouseDown(mouseXY: MouseXY, currentCharts: any, e: unknown): void;
    calculateStateForDomain(newDomain: any[]): {
        xScale: any;
        plotData: any;
        chartConfig: any;
    };
    triggerEvent(type: string, props: AnyRecord, e: unknown): void;
    draw(props?: {
        trigger?: string;
        force?: boolean;
    }): void;
    redraw(): void;
    handleZoom(zoomDirection: number, mouseXY: MouseXY, e: unknown): void;
    xAxisZoom(newDomain: any[]): void;
    yAxisZoom(chartId: string | number, newDomain: any[]): void;
    panHelper(mouseXY: MouseXY, initialXScale: any, { dx, dy }: {
        dx: number;
        dy: number;
    }, chartsToPan: any): {
        xScale: any;
        plotData: any;
        chartConfig: any;
        mouseXY: MouseXY;
        currentCharts: any[];
        currentItem: any;
    };
    handlePan(mousePosition: MouseXY, panStartXScale: any, dxdy: {
        dx: number;
        dy: number;
    }, chartsToPan: any, e: unknown): void;
    handlePanEnd(mousePosition: MouseXY, panStartXScale: any, dxdy: {
        dx: number;
        dy: number;
    }, chartsToPan: any, e: unknown): void;
    handleMouseMove(mouseXY: MouseXY, inputType: string, e: unknown): void;
    handleMouseLeave(e: unknown): void;
    handleDragStart({ startPos }: {
        startPos: MouseXY;
    }, e: unknown): void;
    handleDrag({ startPos, mouseXY }: {
        startPos: MouseXY;
        mouseXY: MouseXY;
    }, e: unknown): void;
    handleDragEnd({ mouseXY }: {
        mouseXY: MouseXY;
    }, e: unknown): void;
    handleClick(mousePosition: MouseXY, e: unknown): void;
    handleDoubleClick(mousePosition: MouseXY, e: unknown): void;
    render(): react_jsx_runtime.JSX.Element;
}

declare function noop(): void;

declare class PureComponent extends React__default.Component<any, any> {
    shouldComponentUpdate(nextProps: any, nextState: any, nextContext: any): boolean;
}

declare const Chart: {
    (props: AnyRecord): react_jsx_runtime.JSX.Element | null;
    propTypes: {
        height: PropTypes.Requireable<number>;
        origin: PropTypes.Requireable<NonNullable<any[] | ((...args: any[]) => any) | null | undefined>>;
        id: PropTypes.Validator<NonNullable<NonNullable<string | number | null | undefined>>>;
        yExtents: PropTypes.Requireable<NonNullable<any[] | ((...args: any[]) => any) | null | undefined>>;
        onContextMenu: PropTypes.Requireable<(...args: any[]) => any>;
        yScale: PropTypes.Requireable<(...args: any[]) => any>;
        flipYScale: PropTypes.Requireable<boolean>;
        padding: PropTypes.Requireable<NonNullable<number | PropTypes.InferProps<{
            top: PropTypes.Requireable<number>;
            bottom: PropTypes.Requireable<number>;
        }> | null | undefined>>;
        children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
    };
    defaultProps: {
        id: number;
        origin: number[];
        padding: number;
        yScale: d3_scale.ScaleLinear<number, number, never>;
        flipYScale: boolean;
        onContextMenu: typeof noop;
    };
};

interface ChartConfig {
    id: number | string;
    origin: [number, number];
    padding: number | {
        top: number;
        bottom: number;
    };
    yScale: any;
    yExtents: any[];
    width: number;
    height: number;
    mouseCoordinates?: {
        at: string;
        format: (n: number) => string;
    };
}
interface StockChartContextValue {
    plotData: any[];
    fullData: any[];
    chartConfig: ChartConfig[];
    xScale: any;
    xAccessor: (d: any) => any;
    displayXAccessor: (d: any) => any;
    width: number;
    height: number;
    chartCanvasType: "svg" | "hybrid";
    margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    ratio: number;
    getCanvasContexts?: () => CanvasContexts | undefined;
    xAxisZoom?: (newDomain: any[]) => void;
    yAxisZoom?: (chartId: string | number, newDomain: any[]) => void;
    amIOnTop?: (id: string | number) => boolean;
    redraw?: () => void;
    subscribe: (id: string | number, rest: AnyRecord) => void;
    unsubscribe: (id: string | number) => void;
    setCursorClass?: (className: string | null | undefined) => void;
    generateSubscriptionId: () => number;
    getMutableState: () => AnyRecord;
    morePropsDecorator?: (moreProps: AnyRecord) => AnyRecord;
}

interface GenericComponentProps {
    svgDraw: (moreProps: AnyRecord) => React__default.ReactNode;
    canvasDraw?: (ctx: CanvasRenderingContext2D, moreProps: AnyRecord) => void;
    drawOn: string[];
    clip?: boolean;
    edgeClip?: boolean;
    interactiveCursorClass?: string;
    selected?: boolean;
    enableDragOnHover?: boolean;
    disablePan?: boolean;
    canvasToDraw?: (contexts: CanvasContexts | undefined) => CanvasRenderingContext2D | undefined;
    isHover?: (moreProps: AnyRecord, e?: unknown) => boolean;
    onClick?: (moreProps: AnyRecord, e?: unknown) => void;
    onClickWhenHover?: (moreProps: AnyRecord, e?: unknown) => void;
    onClickOutside?: (moreProps: AnyRecord, e?: unknown) => void;
    onPan?: (moreProps: AnyRecord, e?: unknown) => void;
    onPanEnd?: (moreProps: AnyRecord, e?: unknown) => void;
    onDragStart?: (moreProps: AnyRecord, e?: unknown) => void;
    onDrag?: (moreProps: AnyRecord, e?: unknown) => void;
    onDragComplete?: (moreProps: AnyRecord, e?: unknown) => void;
    onDoubleClick?: (moreProps: AnyRecord, e?: unknown) => void;
    onDoubleClickWhenHover?: (moreProps: AnyRecord, e?: unknown) => void;
    onContextMenu?: (moreProps: AnyRecord, e?: unknown) => void;
    onContextMenuWhenHover?: (moreProps: AnyRecord, e?: unknown) => void;
    onMouseMove?: (moreProps: AnyRecord, e?: unknown) => void;
    onMouseDown?: (moreProps: AnyRecord, e?: unknown) => void;
    onHover?: (moreProps: AnyRecord, e?: unknown) => void;
    onUnHover?: (moreProps: AnyRecord, e?: unknown) => void;
    chartId?: number | string;
    morePropsDecorator?: (moreProps: AnyRecord) => AnyRecord;
}
interface GenericComponentState {
    updateCount: number;
}
declare class GenericComponent extends Component<GenericComponentProps, GenericComponentState> {
    static contextType: React__default.Context<StockChartContextValue | undefined>;
    static propTypes: {
        svgDraw: PropTypes.Validator<(...args: any[]) => any>;
        canvasDraw: PropTypes.Requireable<(...args: any[]) => any>;
        drawOn: PropTypes.Validator<any[]>;
        clip: PropTypes.Validator<boolean>;
        edgeClip: PropTypes.Validator<boolean>;
        interactiveCursorClass: PropTypes.Requireable<string>;
        selected: PropTypes.Validator<boolean>;
        enableDragOnHover: PropTypes.Validator<boolean>;
        disablePan: PropTypes.Validator<boolean>;
        canvasToDraw: PropTypes.Validator<(...args: any[]) => any>;
        isHover: PropTypes.Requireable<(...args: any[]) => any>;
        onClick: PropTypes.Requireable<(...args: any[]) => any>;
        onClickWhenHover: PropTypes.Requireable<(...args: any[]) => any>;
        onClickOutside: PropTypes.Requireable<(...args: any[]) => any>;
        onPan: PropTypes.Requireable<(...args: any[]) => any>;
        onPanEnd: PropTypes.Requireable<(...args: any[]) => any>;
        onDragStart: PropTypes.Requireable<(...args: any[]) => any>;
        onDrag: PropTypes.Requireable<(...args: any[]) => any>;
        onDragComplete: PropTypes.Requireable<(...args: any[]) => any>;
        onDoubleClick: PropTypes.Requireable<(...args: any[]) => any>;
        onDoubleClickWhenHover: PropTypes.Requireable<(...args: any[]) => any>;
        onContextMenu: PropTypes.Requireable<(...args: any[]) => any>;
        onContextMenuWhenHover: PropTypes.Requireable<(...args: any[]) => any>;
        onMouseMove: PropTypes.Requireable<(...args: any[]) => any>;
        onMouseDown: PropTypes.Requireable<(...args: any[]) => any>;
        onHover: PropTypes.Requireable<(...args: any[]) => any>;
        onUnHover: PropTypes.Requireable<(...args: any[]) => any>;
        chartId: PropTypes.Requireable<NonNullable<string | number | null | undefined>>;
    };
    static defaultProps: {
        svgDraw: any;
        canvasToDraw: (contexts: CanvasContexts | undefined) => CanvasRenderingContext2D | undefined;
        clip: true;
        edgeClip: false;
        selected: false;
        disablePan: false;
        enableDragOnHover: false;
        onClickWhenHover: typeof noop;
        onClickOutside: typeof noop;
        onDragStart: typeof noop;
        onMouseMove: typeof noop;
        onMouseDown: typeof noop;
    };
    context: StockChartContextValue;
    moreProps: AnyRecord;
    suscriberId: number;
    dragInProgress: boolean | undefined;
    someDragInProgress: boolean | undefined;
    iSetTheCursorClass: boolean | undefined;
    evaluationInProgress: boolean | undefined;
    constructor(props: GenericComponentProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps?: Readonly<Partial<GenericComponentProps>>): void;
    updateMorePropsFromContext(context: StockChartContextValue): void;
    updateMoreProps(moreProps: AnyRecord): void;
    shouldTypeProceed(_type: string, _moreProps: AnyRecord): boolean;
    preEvaluate(_type?: string, _moreProps?: AnyRecord, _e?: unknown): void;
    listener(type: string, moreProps: AnyRecord, state: unknown, e: unknown): void;
    evaluateType(type: string, e: unknown): void;
    isHover(e: unknown): boolean;
    getPanConditions(): {
        draggable: any;
        panEnabled: boolean;
    };
    draw({ trigger, force }?: {
        trigger?: string;
        force?: boolean;
    }): void;
    getMoreProps(): AnyRecord;
    preCanvasDraw(_ctx: CanvasRenderingContext2D, _moreProps: AnyRecord): void;
    postCanvasDraw(_ctx: CanvasRenderingContext2D, _moreProps: AnyRecord): void;
    drawOnCanvas(): void;
    render(): react_jsx_runtime.JSX.Element | null;
}

declare const GenericChartComponentWrapper: (props: Omit<GenericComponentProps, "chartId">) => react_jsx_runtime.JSX.Element;

declare class BackgroundText extends PureComponent {
    [key: string]: any;
    context: any;
    static defaultProps: any;
    static drawOnCanvas: any;
    static contextType: React.Context<StockChartContextValue | undefined>;
    componentDidMount(): void;
    componentDidUpdate(): void;
    render(): react_jsx_runtime.JSX.Element | null;
}

declare const _default: (props: any) => react_jsx_runtime.JSX.Element;

interface OHLCVBar {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    buyVolume?: number;
    sellVolume?: number;
    foreignBuy?: number;
    foreignSell?: number;
    openInterest?: number;
    index: number;
    dataIndex: number;
}

type Unsubscribe = () => void;
type Timeframe = string;
interface Trade {
    symbol: string;
    price: number;
    size: number;
    timestamp: Date;
    side?: "buy" | "sell" | "unknown";
}
interface OrderbookLevel {
    price: number;
    size: number;
}
interface OrderbookSnapshot {
    bids: readonly OrderbookLevel[];
    asks: readonly OrderbookLevel[];
    timestamp: Date;
}
interface SymbolInfo {
    symbol: string;
    name?: string;
    exchange?: string;
}
interface StockDataAdapter {
    fetchBars(symbol: string, timeframe: Timeframe, from: Date, to: Date): Promise<readonly OHLCVBar[]>;
    fetchMoreBars(symbol: string, timeframe: Timeframe, before: Date, limit?: number): Promise<readonly OHLCVBar[]>;
    subscribeToBar(symbol: string, timeframe: Timeframe, onBar: (bar: OHLCVBar) => void): Unsubscribe;
    subscribeToTrades(symbol: string, onTrade: (trade: Trade) => void): Unsubscribe;
    subscribeToOrderbook(symbol: string, onUpdate: (snapshot: OrderbookSnapshot) => void): Unsubscribe;
    searchSymbols(query: string): Promise<readonly SymbolInfo[]>;
}

interface YAxisConfig {
    autoScale?: boolean;
    inverted?: boolean;
    scaleType?: "linear" | "log" | "percentage";
    tickFormat?: (value: number) => string;
}
interface IndicatorConfig {
    name: string;
    params?: readonly unknown[];
    yAxis?: "left" | "right";
    visible?: boolean;
    style?: Record<string, unknown>;
}
interface PaneConfig {
    id: string;
    heightPx?: number;
    heightPercent?: number;
    minHeightPx?: number;
    label?: string;
    indicators: IndicatorConfig[];
    leftAxis?: YAxisConfig;
    rightAxis?: YAxisConfig;
}

type PaneInput = Omit<PaneConfig, "id"> & {
    id?: string;
};
interface PaneManagerState {
    panes: PaneConfig[];
    addPane: (pane: PaneInput) => string;
    removePane: (paneId: string) => void;
    resizePane: (paneId: string, heightPx: number) => void;
    addIndicator: (paneId: string, indicator: IndicatorConfig) => void;
    removeIndicator: (paneId: string, indicatorName: string) => void;
    updateIndicator: (paneId: string, indicatorName: string, patch: Partial<IndicatorConfig>) => void;
}
declare function usePaneManager(initialPanes?: readonly PaneInput[]): PaneManagerState;

interface ChartTerminalProps extends HTMLAttributes<HTMLElement> {
    data: readonly OHLCVBar[];
    panes: readonly PaneInput[];
    adapter?: StockDataAdapter;
    children?: ReactNode;
}
declare function ChartTerminal({ data, panes, adapter, children, className, style, ...rest }: ChartTerminalProps): react_jsx_runtime.JSX.Element;

interface ChartPaneProps extends HTMLAttributes<HTMLElement> {
    pane: PaneConfig;
    children?: ReactNode;
}
declare function ChartPane({ pane, children, className, style, ...rest }: ChartPaneProps): react_jsx_runtime.JSX.Element;

interface PaneSplitterProps {
    onResize: (topPaneNewHeightPx: number) => void;
    minTopHeight?: number;
    minBottomHeight?: number;
    className?: string;
    style?: CSSProperties;
}
declare function PaneSplitter({ onResize, minTopHeight, minBottomHeight, className, style }: PaneSplitterProps): react_jsx_runtime.JSX.Element;

interface IndicatorDefinition<TInput = OHLCVBar, TOutput = unknown, TParams extends readonly unknown[] = readonly unknown[]> {
    name: string;
    compute: (bars: readonly TInput[], ...params: TParams) => TOutput;
    render?: (context: {
        values: TOutput;
        bars: readonly TInput[];
    }) => unknown;
    computeExtents?: (values: TOutput) => readonly [number, number] | readonly number[];
    yAxis?: "left" | "right";
}

type RegisteredIndicator = IndicatorDefinition<OHLCVBar, unknown, readonly unknown[]>;

declare function registerIndicator<TOutput, TParams extends readonly unknown[]>(indicator: IndicatorDefinition<OHLCVBar, TOutput, TParams>): IndicatorDefinition<OHLCVBar, TOutput, TParams>;
declare function getIndicator(name: string): RegisteredIndicator | undefined;

type RawOHLCVBar = Omit<OHLCVBar, "date" | "index" | "dataIndex"> & {
    date: string | number | Date;
    index?: number;
    dataIndex?: number;
};
declare abstract class BaseAdapter implements StockDataAdapter {
    protected readonly baseUrl: string;
    protected readonly cacheTtlMs: number;
    private readonly requestCache;
    protected constructor(baseUrl?: string, cacheTtlMs?: number);
    protected buildUrl(path: string): string;
    protected buildWebSocketUrl(path: string): string;
    protected requestJson<T>(path: string, init?: RequestInit): Promise<T>;
    protected memoize<T>(cacheKey: string, loader: () => Promise<T>): Promise<T>;
    protected normalizeBar(rawBar: RawOHLCVBar, fallbackIndex: number): OHLCVBar;
    protected normalizeBars(rawBars: readonly RawOHLCVBar[]): OHLCVBar[];
    abstract fetchBars(symbol: string, timeframe: Timeframe, from: Date, to: Date): Promise<readonly OHLCVBar[]>;
    abstract fetchMoreBars(symbol: string, timeframe: Timeframe, before: Date, limit?: number): Promise<readonly OHLCVBar[]>;
    abstract subscribeToBar(symbol: string, timeframe: Timeframe, onBar: (bar: OHLCVBar) => void): Unsubscribe;
    abstract subscribeToTrades(symbol: string, onTrade: (trade: Trade) => void): Unsubscribe;
    abstract subscribeToOrderbook(symbol: string, onUpdate: (snapshot: OrderbookSnapshot) => void): Unsubscribe;
    abstract searchSymbols(query: string): Promise<readonly SymbolInfo[]>;
}

declare class DjangoVnstockAdapter extends BaseAdapter {
    constructor(baseUrl?: string, cacheTtlMs?: number);
    fetchBars(symbol: string, timeframe: Timeframe, from: Date, to: Date): Promise<readonly OHLCVBar[]>;
    fetchMoreBars(symbol: string, timeframe: Timeframe, before: Date, limit?: number): Promise<readonly OHLCVBar[]>;
    subscribeToBar(symbol: string, timeframe: Timeframe, onBar: (bar: OHLCVBar) => void): Unsubscribe;
    subscribeToTrades(symbol: string, onTrade: (trade: Trade) => void): Unsubscribe;
    subscribeToOrderbook(symbol: string, onUpdate: (snapshot: OrderbookSnapshot) => void): Unsubscribe;
    searchSymbols(query: string): Promise<readonly SymbolInfo[]>;
}
declare function createRestAdapter(baseUrl?: string): DjangoVnstockAdapter;

interface MockAdapterOptions {
    symbols?: readonly SymbolInfo[];
    bars?: readonly OHLCVBar[];
    intervalMs?: number;
}
declare class MockAdapter {
    private readonly bars;
    private readonly symbols;
    private readonly intervalMs;
    constructor(options?: MockAdapterOptions);
    fetchBars(symbol: string, timeframe: Timeframe, from: Date, to: Date): Promise<readonly OHLCVBar[]>;
    fetchMoreBars(symbol: string, timeframe: Timeframe, before: Date, limit?: number): Promise<readonly OHLCVBar[]>;
    subscribeToBar(symbol: string, timeframe: Timeframe, onBar: (bar: OHLCVBar) => void): Unsubscribe;
    subscribeToTrades(symbol: string, onTrade: (trade: Trade) => void): Unsubscribe;
    subscribeToOrderbook(symbol: string, onUpdate: (snapshot: OrderbookSnapshot) => void): Unsubscribe;
    searchSymbols(query: string): Promise<readonly SymbolInfo[]>;
}
declare function createMockBars(count?: number): OHLCVBar[];

type Point = Readonly<{
    x: number;
    y: number;
}>;
type DrawingToolType = "trendLine" | "hLine" | "vLine" | "fibonacci" | "channel" | "text";
interface DrawingStyle {
    stroke: string;
    strokeWidth: number;
    strokeDasharray?: string;
    fill?: string;
    opacity?: number;
    fontSize?: number;
    fontFamily?: string;
}
interface DrawingObject {
    id: string;
    type: DrawingToolType;
    points: Point[];
    style: DrawingStyle;
    text?: string;
    extendLeft?: boolean;
    extendRight?: boolean;
    locked?: boolean;
    visible?: boolean;
    createdAt: number;
    updatedAt: number;
}
interface DrawingToolDefinition {
    name: DrawingToolType;
    createDraft: (startPoint: Point) => DrawingObject;
    updateDraft: (draft: DrawingObject, nextPoint: Point) => DrawingObject;
    render?: (ctx: CanvasRenderingContext2D, object: DrawingObject) => void;
}

declare function registerDrawingTool(tool: DrawingToolDefinition): DrawingToolDefinition;
declare function createTool(name: DrawingToolType): DrawingToolDefinition;
declare function listDrawingTools(): DrawingToolDefinition[];
declare function isDrawingToolName(name: string): name is DrawingToolType;
declare function createDraftFromTool(name: DrawingToolType, startPoint: Point): DrawingObject;

type DrawingState = {
    type: "idle";
} | {
    type: "drawing";
    toolName: DrawingToolType;
    object: DrawingObject;
} | {
    type: "complete";
    object: DrawingObject;
} | {
    type: "selected";
    objectId: string;
} | {
    type: "moving";
    objectId: string;
    startPoint: Point;
    currentPoint: Point;
} | {
    type: "resizing";
    objectId: string;
    handle: string;
} | {
    type: "editing";
    objectId: string;
    text: string;
};
type DrawingAction = {
    type: "START_DRAWING";
    toolName: DrawingToolType;
    object: DrawingObject;
} | {
    type: "UPDATE_DRAWING";
    object: DrawingObject;
} | {
    type: "COMPLETE_DRAWING";
    object: DrawingObject;
} | {
    type: "SELECT_OBJECT";
    objectId: string;
} | {
    type: "START_MOVING";
    objectId: string;
    startPoint: Point;
    currentPoint: Point;
} | {
    type: "START_RESIZING";
    objectId: string;
    handle: string;
} | {
    type: "START_EDITING";
    objectId: string;
    text?: string;
} | {
    type: "CANCEL";
};
declare function drawingReducer(state: DrawingState, action: DrawingAction): DrawingState;

interface DrawingHistory {
    past: DrawingObject[][];
    present: DrawingObject[];
    future: DrawingObject[][];
}
type DrawingHistoryAction = {
    type: "PUSH";
    drawing: DrawingObject;
} | {
    type: "REPLACE";
    drawings: DrawingObject[];
} | {
    type: "UNDO";
} | {
    type: "REDO";
} | {
    type: "CLEAR";
};
declare function createDrawingHistory(drawings?: readonly DrawingObject[]): DrawingHistory;
declare function historyReducer(state: DrawingHistory, action: DrawingHistoryAction): DrawingHistory;

declare function serializeDrawingObject(drawing: DrawingObject): string;
declare function deserializeDrawingObject(payload: string): DrawingObject;
declare function serializeDrawings(drawings: readonly DrawingObject[]): string;
declare function deserializeDrawings(payload: string): DrawingObject[];
declare function serializeDrawingHistory(history: DrawingHistory): string;
declare function deserializeDrawingHistory(payload: string): DrawingHistory;

declare const version = "0.7.8";

export { type AnyRecord, BackgroundText, type BarData, BaseAdapter, type CandleData, type CandleWick, type CanvasContexts, Chart, type ChartAccessor, ChartCanvas, type ChartDatum, ChartPane, ChartTerminal, DjangoVnstockAdapter, GenericChartComponentWrapper as GenericChartComponent, GenericComponent, type IndicatorConfig, type IndicatorDefinition, MockAdapter, type MoreProps, type OHLCV, type OHLCVBar, type PaneConfig, PaneSplitter, type StockDataAdapter, type Unsubscribe, type YAxisConfig, _default as ZoomButtons, createDraftFromTool, createDrawingHistory, createTool as createDrawingTool, createMockBars, createRestAdapter, deserializeDrawingHistory, deserializeDrawingObject, deserializeDrawings, drawingReducer, getIndicator, historyReducer, isDrawingToolName, listDrawingTools, registerDrawingTool, registerIndicator, serializeDrawingHistory, serializeDrawingObject, serializeDrawings, usePaneManager, version };
