'use strict';

var React = require('react');
var PropTypes4 = require('prop-types');
var d3Array = require('d3-array');
var d3Scale = require('d3-scale');
var d3ScaleChromatic = require('d3-scale-chromatic');
var flattenDeep = require('lodash.flattendeep');
var jsxRuntime = require('react/jsx-runtime');
var d3Selection = require('d3-selection');
var d3Path = require('d3-path');
var d3Interpolate = require('d3-interpolate');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);
var PropTypes4__default = /*#__PURE__*/_interopDefault(PropTypes4);
var flattenDeep__default = /*#__PURE__*/_interopDefault(flattenDeep);

var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/lib/utils/noop.ts
function noop() {
}

// src/lib/utils/identity.ts
function identity(value) {
  return value;
}
function zipper() {
  let combine = identity;
  function zip() {
    const n = arguments.length;
    if (!n) return [];
    const m = d3Array.min(arguments, d3_zipLength) ?? 0;
    let i, zips = new Array(m);
    for (i = -1; ++i < m; ) {
      for (let j = -1, zipItem = zips[i] = new Array(n); ++j < n; ) {
        zipItem[j] = arguments[j][i];
      }
      zips[i] = combine.apply(this, zips[i]);
    }
    return zips;
  }
  function d3_zipLength(d) {
    return d.length;
  }
  zip.combine = function(x) {
    if (!arguments.length) {
      return combine;
    }
    combine = x;
    return zip;
  };
  return zip;
}

// src/lib/utils/shallowEqual.ts
function isDate(date) {
  return Object.prototype.toString.call(date) === "[object Date]";
}
function isEqual(val1, val2) {
  return isDate(val1) && isDate(val2) ? val1.getTime() === val2.getTime() : val1 === val2;
}
function shallowEqual(a, b) {
  if (!a && !b) {
    return true;
  }
  if (!a && b || a && !b) {
    return false;
  }
  let numKeysA = 0, numKeysB = 0, key;
  for (key in b) {
    numKeysB++;
    if (b.hasOwnProperty(key) && !a.hasOwnProperty(key) || !isEqual(a[key], b[key])) {
      return false;
    }
  }
  for (key in a) {
    numKeysA++;
  }
  return numKeysA === numKeysB;
}
var PureComponent = class extends React__default.default.Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState) || !shallowEqual(this.context, nextContext);
  }
};
var PureComponent_default = PureComponent;

// src/lib/utils/index.ts
var isProduction = globalThis.process?.env?.NODE_ENV === "production";
function getLogger(prefix) {
  let logger = noop;
  if (!isProduction) {
    logger = __require("debug")("react-stockcharts:" + prefix);
  }
  return logger;
}
function functor(v) {
  return typeof v === "function" ? v : () => v;
}
function find(list, predicate, context = this) {
  for (let i = 0; i < list.length; ++i) {
    if (predicate.call(context, list[i], i, list)) {
      return list[i];
    }
  }
  return void 0;
}
function d3Window(node) {
  const d3win = node && (node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView);
  return d3win;
}
var MOUSEENTER = "mouseenter.interaction";
var MOUSELEAVE = "mouseleave.interaction";
var MOUSEMOVE = "mousemove.pan";
var MOUSEUP = "mouseup.pan";
var TOUCHMOVE = "touchmove.pan";
var TOUCHEND = "touchend.pan touchcancel.pan";
function getClosestItemIndexes(array, value, accessor, log4) {
  let lo = 0, hi = array.length - 1;
  while (hi - lo > 1) {
    const mid = Math.round((lo + hi) / 2);
    if (accessor(array[mid]) <= value) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  if (accessor(array[lo]).valueOf() === value.valueOf()) hi = lo;
  if (accessor(array[hi]).valueOf() === value.valueOf()) lo = hi;
  if (accessor(array[lo]) < value && accessor(array[hi]) < value) lo = hi;
  if (accessor(array[lo]) > value && accessor(array[hi]) > value) hi = lo;
  return { left: lo, right: hi };
}
function getClosestItem(array, value, accessor, log4) {
  const { left, right } = getClosestItemIndexes(array, value, accessor);
  if (left === right) {
    return array[left];
  }
  const closest = Math.abs(accessor(array[left]) - value) < Math.abs(accessor(array[right]) - value) ? array[left] : array[right];
  return closest;
}
d3Scale.scaleOrdinal(d3ScaleChromatic.schemeCategory10);
function head(array, accessor) {
  return array ? array[0] : void 0;
}
function last(array, accessor) {
  const length = array ? array.length : 0;
  return length ? array[length - 1] : void 0;
}
function isDefined(d) {
  return d !== null && typeof d != "undefined";
}
function isNotDefined(d) {
  return !isDefined(d);
}
function isObject(d) {
  return isDefined(d) && typeof d === "object" && !Array.isArray(d);
}
function mousePosition(e, defaultRect) {
  const container = e.currentTarget;
  const rect = defaultRect || container.getBoundingClientRect(), x = e.clientX - rect.left - container.clientLeft, y = e.clientY - rect.top - container.clientTop, xy = [Math.round(x), Math.round(y)];
  return xy;
}
function clearCanvas(canvasList, ratio) {
  canvasList.forEach((each) => {
    each.setTransform(1, 0, 0, 1, 0, 0);
    each.clearRect(-1, -1, each.canvas.width + 2, each.canvas.height + 2);
    each.scale(ratio, ratio);
  });
}
function hexToRGBA(inputHex, opacity) {
  if (!inputHex) {
    return "transparent";
  }
  const hex = inputHex.replace("#", "");
  if (inputHex.indexOf("#") > -1 && (hex.length === 3 || hex.length === 6)) {
    const multiplier = hex.length === 3 ? 1 : 2;
    const r = parseInt(hex.substring(0, 1 * multiplier), 16);
    const g = parseInt(hex.substring(1 * multiplier, 2 * multiplier), 16);
    const b = parseInt(hex.substring(2 * multiplier, 3 * multiplier), 16);
    const result = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    return result;
  }
  return inputHex;
}
function mapObject(object = {}, iteratee = identity) {
  const props = Object.keys(object);
  let result = new Array(props.length);
  props.forEach((key, index) => {
    result[index] = iteratee(object[key], key, object);
  });
  return result;
}
var StockChartContext = React.createContext(void 0);
var StockChartProvider = StockChartContext.Provider;
var useStockChart = () => {
  const context = React.useContext(StockChartContext);
  if (!context) {
    throw new Error("useStockChart must be used within a StockChartProvider");
  }
  return context;
};
var StockChartContext_default = StockChartContext;
var ChartContext = React.createContext(void 0);
var ChartProvider = ChartContext.Provider;
var useChart = () => {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a ChartProvider");
  }
  return context;
};
var Chart = (props) => {
  const { id, children, onContextMenu = noop } = props;
  const { chartConfig: allConfigs, subscribe, unsubscribe } = useStockChart();
  const chartConfig = React.useMemo(() => {
    return find(allConfigs, (each) => each.id === id);
  }, [allConfigs, id]);
  React.useEffect(() => {
    const listener = (type, moreProps, state, e) => {
      if (type === "contextmenu") {
        const { currentCharts } = moreProps;
        if (currentCharts.indexOf(id) > -1) {
          onContextMenu(moreProps, e);
        }
      }
    };
    subscribe("chart_" + id, { listener });
    return () => unsubscribe("chart_" + id);
  }, [id, subscribe, unsubscribe, onContextMenu]);
  if (!chartConfig) return null;
  const [x, y] = chartConfig.origin;
  return /* @__PURE__ */ jsxRuntime.jsx(ChartProvider, { value: { chartId: id, chartConfig }, children: /* @__PURE__ */ jsxRuntime.jsx("g", { transform: `translate(${x}, ${y})`, children }) });
};
Chart.propTypes = {
  height: PropTypes4__default.default.number,
  origin: PropTypes4__default.default.oneOfType([PropTypes4__default.default.array, PropTypes4__default.default.func]),
  id: PropTypes4__default.default.oneOfType([PropTypes4__default.default.number, PropTypes4__default.default.string]).isRequired,
  yExtents: PropTypes4__default.default.oneOfType([PropTypes4__default.default.array, PropTypes4__default.default.func]),
  onContextMenu: PropTypes4__default.default.func,
  yScale: PropTypes4__default.default.func,
  flipYScale: PropTypes4__default.default.bool,
  padding: PropTypes4__default.default.oneOfType([
    PropTypes4__default.default.number,
    PropTypes4__default.default.shape({
      top: PropTypes4__default.default.number,
      bottom: PropTypes4__default.default.number
    })
  ]),
  children: PropTypes4__default.default.node
};
Chart.defaultProps = {
  id: 0,
  origin: [0, 0],
  padding: 0,
  yScale: d3Scale.scaleLinear(),
  flipYScale: false,
  onContextMenu: noop
};
var Chart_default = Chart;

// src/lib/utils/ChartDataUtil.ts
function getDimensions({ width, height }, chartProps) {
  const chartHeight = chartProps.height || height;
  return {
    availableHeight: height,
    width,
    height: chartHeight
  };
}
function values(func) {
  return (d) => {
    const obj = func(d);
    if (isObject(obj)) {
      return mapObject(obj);
    }
    return obj;
  };
}
function isArraySize2AndNumber(yExtentsProp) {
  if (Array.isArray(yExtentsProp) && yExtentsProp.length === 2) {
    const [a, b] = yExtentsProp;
    return typeof a == "number" && typeof b == "number";
  }
  return false;
}
function getNewChartConfig(innerDimension, children, existingChartConfig = []) {
  return React__default.default.Children.map(children, (each) => {
    if (each && each.type.toString() === Chart_default.toString()) {
      const chartProps = {
        ...Chart_default.defaultProps,
        ...each.props
      };
      const {
        id,
        origin,
        padding,
        yExtents: yExtentsProp,
        yScale: yScaleProp,
        flipYScale,
        yExtentsCalculator
      } = chartProps;
      const yScale = yScaleProp.copy();
      const {
        width,
        height,
        availableHeight
      } = getDimensions(innerDimension, chartProps);
      const { yPan } = chartProps;
      let { yPanEnabled } = chartProps;
      const yExtents = isDefined(yExtentsProp) ? (Array.isArray(yExtentsProp) ? yExtentsProp : [yExtentsProp]).map(functor) : void 0;
      const prevChartConfig = find(existingChartConfig, (d) => d.id === id);
      if (isArraySize2AndNumber(yExtentsProp)) {
        if (isDefined(prevChartConfig) && prevChartConfig.yPan && prevChartConfig.yPanEnabled && yPan && yPanEnabled && shallowEqual(prevChartConfig.originalYExtentsProp, yExtentsProp)) {
          yScale.domain(prevChartConfig.yScale.domain());
        } else {
          const [a, b] = yExtentsProp;
          yScale.domain([a, b]);
        }
      } else if (isDefined(prevChartConfig) && prevChartConfig.yPanEnabled) {
        if (isArraySize2AndNumber(prevChartConfig.originalYExtentsProp)) ; else {
          yScale.domain(prevChartConfig.yScale.domain());
          yPanEnabled = true;
        }
      }
      return {
        id,
        origin: functor(origin)(width, availableHeight),
        padding,
        originalYExtentsProp: yExtentsProp,
        yExtents,
        yExtentsCalculator,
        flipYScale,
        yScale,
        yPan,
        yPanEnabled,
        width,
        height
      };
    }
    return void 0;
  }).filter((each) => isDefined(each));
}
function getCurrentCharts(chartConfig, mouseXY) {
  const currentCharts = chartConfig.filter((eachConfig) => {
    const top = eachConfig.origin[1];
    const bottom = top + eachConfig.height;
    return mouseXY[1] > top && mouseXY[1] < bottom;
  }).map((config) => config.id);
  return currentCharts;
}
function setRange(scale, height, padding, flipYScale) {
  if (scale.rangeRoundPoints || isNotDefined(scale.invert)) {
    if (isNaN(padding)) throw new Error("padding has to be a number for ordinal scale");
    if (scale.rangeRoundPoints) scale.rangeRoundPoints(flipYScale ? [0, height] : [height, 0], padding);
    if (scale.rangeRound) scale.range(flipYScale ? [0, height] : [height, 0]).padding(padding);
  } else {
    const { top, bottom } = isNaN(padding) ? padding : { top: padding, bottom: padding };
    scale.range(flipYScale ? [top, height - bottom] : [height - bottom, top]);
  }
  return scale;
}
function yDomainFromYExtents(yExtents, yScale, plotData) {
  const yValues = yExtents.map((eachExtent) => plotData.map(values(eachExtent)));
  const allYValues = flattenDeep__default.default(yValues);
  const realYDomain = yScale.invert ? d3Array.extent(allYValues) : Array.from(new Set(allYValues));
  return realYDomain;
}
function getChartConfigWithUpdatedYScales(chartConfig, { plotData, xAccessor, displayXAccessor, fullData }, xDomain, dy, chartsToPan) {
  const yDomains = chartConfig.map(({ yExtentsCalculator, yExtents, yScale }) => {
    const realYDomain = isDefined(yExtentsCalculator) ? yExtentsCalculator({ plotData, xDomain, xAccessor, displayXAccessor, fullData }) : yDomainFromYExtents(yExtents, yScale, plotData);
    const yDomainDY = isDefined(dy) ? yScale.range().map((each) => each - dy).map(yScale.invert) : yScale.domain();
    return {
      realYDomain,
      yDomainDY,
      prevYDomain: yScale.domain()
    };
  });
  const combine = zipper().combine((config, { realYDomain, yDomainDY, prevYDomain }) => {
    const { id, padding, height, yScale, yPan, flipYScale, yPanEnabled = false } = config;
    const another = isDefined(chartsToPan) ? chartsToPan.indexOf(id) > -1 : true;
    const domain = yPan && yPanEnabled ? another ? yDomainDY : prevYDomain : realYDomain;
    const newYScale = setRange(
      yScale.copy().domain(domain),
      height,
      padding,
      flipYScale
    );
    return {
      ...config,
      yScale: newYScale,
      realYDomain
    };
  });
  const updatedChartConfig = combine(chartConfig, yDomains);
  return updatedChartConfig;
}
function getCurrentItem(xScale, xAccessor, mouseXY, plotData) {
  if (!plotData || plotData.length === 0) return void 0;
  let xValue, item;
  if (xScale.invert) {
    xValue = xScale.invert(mouseXY[0]);
    item = getClosestItem(plotData, xValue, xAccessor);
  } else {
    const d = xScale.range().map((d2, idx) => ({ x: Math.abs(d2 - mouseXY[0]), idx })).reduce((a, b) => a.x < b.x ? a : b);
    item = isDefined(d) ? plotData[d.idx] : plotData[0];
  }
  return item;
}

// src/lib/utils/zoomBehavior.ts
function mouseBasedZoomAnchor({
  xScale,
  xAccessor,
  mouseXY,
  plotData,
  fullData
}) {
  const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
  if (isDefined(currentItem)) return xAccessor(currentItem);
  if (isDefined(xScale.invert)) return xScale.invert(mouseXY[0]);
  const lastItem = last(fullData);
  return isDefined(lastItem) ? xAccessor(lastItem) : xScale.domain()[1];
}
var EventCapture = class extends React.Component {
  static defaultProps;
  constructor(props) {
    super(props);
    this.handleEnter = this.handleEnter.bind(this);
    this.handleLeave = this.handleLeave.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handlePanEnd = this.handlePanEnd.bind(this);
    this.handlePan = this.handlePan.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handlePinchZoom = this.handlePinchZoom.bind(this);
    this.handlePinchZoomEnd = this.handlePinchZoomEnd.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleRightClick = this.handleRightClick.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.shouldPan = this.shouldPan.bind(this);
    this.canPan = this.canPan.bind(this);
    this.bindWheelListener = this.bindWheelListener.bind(this);
    this.setCursorClass = this.setCursorClass.bind(this);
    this.saveNode = this.saveNode.bind(this);
    this.mouseInside = false;
    this.focus = props.focus;
    this.mouseInteraction = true;
    this.state = {
      panInProgress: false
    };
  }
  saveNode(node) {
    this.node = node;
  }
  componentDidMount() {
    if (this.node) {
      d3Selection.select(this.node).on(MOUSEENTER, this.handleEnter).on(MOUSELEAVE, this.handleLeave);
      this.bindWheelListener();
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.focus !== this.props.focus) {
      this.focus = this.props.focus;
    }
    this.bindWheelListener();
  }
  componentWillUnmount() {
    if (this.node) {
      d3Selection.select(this.node).on(MOUSEENTER, null).on(MOUSELEAVE, null);
      this.node.removeEventListener("wheel", this.handleWheel);
      const win = d3Window(this.node);
      d3Selection.select(win).on(MOUSEMOVE, null);
    }
  }
  bindWheelListener() {
    if (!this.node) return;
    this.node.removeEventListener("wheel", this.handleWheel);
    this.node.addEventListener("wheel", this.handleWheel, { passive: false });
  }
  handleEnter(e) {
    const { onMouseEnter } = this.props;
    this.mouseInside = true;
    if (!this.state.panInProgress && !this.state.dragInProgress) {
      const win = d3Window(this.node);
      d3Selection.select(win).on(MOUSEMOVE, this.handleMouseMove);
    }
    onMouseEnter(e);
  }
  handleLeave(e) {
    const { onMouseLeave } = this.props;
    this.mouseInside = false;
    if (!this.state.panInProgress && !this.state.dragInProgress) {
      const win = d3Window(this.node);
      d3Selection.select(win).on(MOUSEMOVE, null);
    }
    onMouseLeave(e);
  }
  handleWheel(e) {
    const { zoom, onZoom } = this.props;
    const { panInProgress } = this.state;
    const yZoom = Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 0;
    const mouseXY = mousePosition(e);
    e.preventDefault();
    if (zoom && yZoom && !panInProgress) {
      const zoomDir = e.deltaY > 0 ? 1 : -1;
      onZoom(zoomDir, mouseXY, e);
    } else if (this.focus) {
      if (this.shouldPan()) {
        const {
          panStartXScale,
          chartsToPan
        } = this.state.panStart;
        this.lastNewPos = mouseXY;
        this.panHappened = true;
        this.dx += e.deltaX;
        this.dy += e.deltaY;
        const dxdy = { dx: this.dx, dy: this.dy };
        this.props.onPan(mouseXY, panStartXScale, dxdy, chartsToPan, e);
      } else {
        const { xScale, chartConfig } = this.props;
        const currentCharts = getCurrentCharts(chartConfig, mouseXY);
        this.dx = 0;
        this.dy = 0;
        this.setState({
          panInProgress: true,
          panStart: {
            panStartXScale: xScale,
            panOrigin: mouseXY,
            chartsToPan: currentCharts
          }
        });
      }
      this.queuePanEnd();
    }
  }
  queuePanEnd() {
    if (isDefined(this.panEndTimeout)) {
      clearTimeout(this.panEndTimeout);
    }
    this.panEndTimeout = setTimeout(() => {
      this.handlePanEnd();
    }, 100);
  }
  handleMouseMove(e) {
    const { onMouseMove, mouseMove } = this.props;
    if (this.mouseInteraction && mouseMove && !this.state.panInProgress) {
      const newPos = d3Selection.pointer(e, this.node);
      onMouseMove(newPos, "mouse", e);
    }
  }
  handleClick(e) {
    const mouseXY = mousePosition(e);
    const { onClick, onDoubleClick } = this.props;
    if (!this.panHappened && !this.dragHappened) {
      if (this.clicked) {
        onDoubleClick(mouseXY, e);
        this.clicked = false;
      } else {
        onClick(mouseXY, e);
        this.clicked = true;
        setTimeout(() => {
          if (this.clicked) {
            this.clicked = false;
          }
        }, 400);
      }
    }
  }
  handleRightClick(e) {
    e.stopPropagation();
    e.preventDefault();
    const { onContextMenu, onPanEnd } = this.props;
    const mouseXY = mousePosition(e, this.node.getBoundingClientRect());
    if (isDefined(this.state.panStart)) {
      const { panStartXScale, panOrigin, chartsToPan } = this.state.panStart;
      if (this.panHappened) {
        onPanEnd(mouseXY, panStartXScale, panOrigin, chartsToPan, e);
      }
      const win = d3Window(this.node);
      d3Selection.select(win).on(MOUSEMOVE, null).on(MOUSEUP, null);
      this.setState({
        panInProgress: false,
        panStart: null
      });
    }
    onContextMenu(mouseXY, e);
  }
  handleDrag(e) {
    if (this.props.onDrag) {
      this.dragHappened = true;
      const mouseXY = d3Selection.pointer(e, this.node);
      this.props.onDrag({
        startPos: this.state.dragStartPosition,
        mouseXY
      }, e);
    }
  }
  cancelDrag() {
    const win = d3Window(this.node);
    d3Selection.select(win).on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null).on(MOUSEUP, null);
    this.setState({
      dragInProgress: false
    });
    this.mouseInteraction = true;
  }
  handleDragEnd(e) {
    const mouseXY = d3Selection.pointer(e, this.node);
    const win = d3Window(this.node);
    d3Selection.select(win).on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null).on(MOUSEUP, null);
    if (this.dragHappened) {
      this.props.onDragComplete({
        mouseXY
      }, e);
    }
    this.setState({
      dragInProgress: false
    });
    this.mouseInteraction = true;
  }
  canPan() {
    const { getAllPanConditions } = this.props;
    const { pan: initialPanEnabled } = this.props;
    const {
      panEnabled,
      draggable: somethingSelected
    } = getAllPanConditions().reduce((returnObj, a) => {
      return {
        draggable: returnObj.draggable || a.draggable,
        panEnabled: returnObj.panEnabled && a.panEnabled
      };
    }, {
      draggable: false,
      panEnabled: initialPanEnabled
    });
    return {
      panEnabled,
      somethingSelected
    };
  }
  handleMouseDown(e) {
    if (e.button !== 0) {
      return;
    }
    const { xScale, chartConfig, onMouseDown } = this.props;
    this.panHappened = false;
    this.dragHappened = false;
    this.focus = true;
    if (!this.state.panInProgress && this.mouseInteraction) {
      const mouseXY = mousePosition(e);
      const currentCharts = getCurrentCharts(chartConfig, mouseXY);
      const {
        panEnabled,
        somethingSelected
      } = this.canPan();
      const pan = panEnabled && !somethingSelected;
      if (pan) {
        this.setState({
          panInProgress: pan,
          panStart: {
            panStartXScale: xScale,
            panOrigin: mouseXY,
            chartsToPan: currentCharts
          }
        });
        const win = d3Window(this.node);
        d3Selection.select(win).on(MOUSEMOVE, this.handlePan).on(MOUSEUP, this.handlePanEnd);
      } else {
        const win = d3Window(this.node);
        d3Selection.select(win).on(MOUSEMOVE, this.handleMouseMove);
        if (somethingSelected) {
          this.setState({
            panInProgress: false,
            dragInProgress: true,
            panStart: null,
            dragStartPosition: mouseXY
          });
          this.props.onDragStart({ startPos: mouseXY }, e);
          const win2 = d3Window(this.node);
          d3Selection.select(win2).on(MOUSEMOVE, this.handleDrag).on(MOUSEUP, this.handleDragEnd);
        }
      }
      onMouseDown(mouseXY, currentCharts, e);
    }
    e.preventDefault();
  }
  shouldPan() {
    const { pan: panEnabled, onPan } = this.props;
    return panEnabled && onPan && isDefined(this.state.panStart);
  }
  handlePan(e) {
    if (this.shouldPan()) {
      this.panHappened = true;
      const { panStartXScale, panOrigin, chartsToPan } = this.state.panStart;
      const mouseXY = this.mouseInteraction ? d3Selection.pointer(e, this.node) : d3Selection.pointers(e, this.node)[0];
      this.lastNewPos = mouseXY;
      const dx = mouseXY[0] - panOrigin[0];
      const dy = mouseXY[1] - panOrigin[1];
      this.dx = dx;
      this.dy = dy;
      this.props.onPan(
        mouseXY,
        panStartXScale,
        { dx, dy },
        chartsToPan,
        e
      );
    }
  }
  handlePanEnd(e = void 0) {
    const { pan: panEnabled, onPanEnd } = this.props;
    if (isDefined(this.state.panStart)) {
      const { panStartXScale, chartsToPan } = this.state.panStart;
      const win = d3Window(this.node);
      d3Selection.select(win).on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null).on(MOUSEUP, null).on(TOUCHMOVE, null).on(TOUCHEND, null);
      if (this.panHappened && panEnabled && onPanEnd) {
        const { dx, dy } = this;
        delete this.dx;
        delete this.dy;
        onPanEnd(this.lastNewPos, panStartXScale, { dx, dy }, chartsToPan, e);
      }
      this.setState({
        panInProgress: false,
        panStart: null
      });
    }
  }
  handleTouchMove(e) {
    const { onMouseMove } = this.props;
    const touchXY = d3Selection.pointer(e, this.node);
    onMouseMove(touchXY, "touch", e);
  }
  handleTouchStart(e) {
    this.mouseInteraction = false;
    const { pan: panEnabled, chartConfig, onMouseMove } = this.props;
    const { xScale, onPanEnd } = this.props;
    if (e.touches.length === 1) {
      this.panHappened = false;
      const touchXY = d3Selection.pointer(e, this.node);
      onMouseMove(touchXY, "touch", e);
      if (panEnabled) {
        const currentCharts = getCurrentCharts(chartConfig, touchXY);
        this.setState({
          panInProgress: true,
          panStart: {
            panStartXScale: xScale,
            panOrigin: touchXY,
            chartsToPan: currentCharts
          }
        });
        const win = d3Window(this.node);
        d3Selection.select(win).on(TOUCHMOVE, this.handlePan, false).on(TOUCHEND, this.handlePanEnd, false);
      }
    } else if (e.touches.length === 2) {
      const { panInProgress, panStart } = this.state;
      if (panInProgress && panEnabled && onPanEnd) {
        const { panStartXScale, panOrigin, chartsToPan } = panStart;
        const win = d3Window(this.node);
        d3Selection.select(win).on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null).on(MOUSEUP, null).on(TOUCHMOVE, this.handlePinchZoom, false).on(TOUCHEND, this.handlePinchZoomEnd, false);
        const [touch1Pos, touch2Pos] = d3Selection.pointers(e, this.node);
        if (this.panHappened && panEnabled && onPanEnd) {
          onPanEnd(this.lastNewPos, panStartXScale, panOrigin, chartsToPan, e);
        }
        this.setState({
          panInProgress: false,
          pinchZoomStart: {
            xScale,
            touch1Pos,
            touch2Pos,
            range: xScale.range(),
            chartsToPan
          }
        });
      }
    }
  }
  handlePinchZoom(e) {
    const [touch1Pos, touch2Pos] = d3Selection.pointers(e, this.node);
    const { xScale, zoom: zoomEnabled, onPinchZoom } = this.props;
    const { chartsToPan, ...initialPinch } = this.state.pinchZoomStart;
    if (zoomEnabled && onPinchZoom) {
      onPinchZoom(initialPinch, {
        touch1Pos,
        touch2Pos,
        xScale
      }, e);
    }
  }
  handlePinchZoomEnd(e) {
    const win = d3Window(this.node);
    d3Selection.select(win).on(TOUCHMOVE, null).on(TOUCHEND, null);
    const { zoom: zoomEnabled, onPinchZoomEnd } = this.props;
    const { chartsToPan, ...initialPinch } = this.state.pinchZoomStart;
    if (zoomEnabled && onPinchZoomEnd) {
      onPinchZoomEnd(initialPinch, e);
    }
    this.setState({
      pinchZoomStart: null
    });
  }
  setCursorClass(cursorOverrideClass) {
    if (cursorOverrideClass !== this.state.cursorOverrideClass) {
      this.setState({
        cursorOverrideClass
      });
    }
  }
  render() {
    const { height, width, disableInteraction, useCrossHairStyleCursor } = this.props;
    const className = this.state.cursorOverrideClass != null ? this.state.cursorOverrideClass : !useCrossHairStyleCursor ? "" : this.state.panInProgress ? "react-stockcharts-grabbing-cursor" : "react-stockcharts-crosshair-cursor";
    const interactionProps = disableInteraction || {
      onMouseDown: this.handleMouseDown,
      onClick: this.handleClick,
      onContextMenu: this.handleRightClick,
      onTouchStart: this.handleTouchStart,
      onTouchMove: this.handleTouchMove
    };
    return /* @__PURE__ */ jsxRuntime.jsx(
      "rect",
      {
        ref: this.saveNode,
        className,
        width,
        height,
        style: { opacity: 0 },
        ...interactionProps
      }
    );
  }
};
EventCapture.propTypes = {
  mouseMove: PropTypes4__default.default.bool.isRequired,
  zoom: PropTypes4__default.default.bool.isRequired,
  pan: PropTypes4__default.default.bool.isRequired,
  panSpeedMultiplier: PropTypes4__default.default.number.isRequired,
  focus: PropTypes4__default.default.bool.isRequired,
  useCrossHairStyleCursor: PropTypes4__default.default.bool.isRequired,
  width: PropTypes4__default.default.number.isRequired,
  height: PropTypes4__default.default.number.isRequired,
  chartConfig: PropTypes4__default.default.array,
  xScale: PropTypes4__default.default.func.isRequired,
  xAccessor: PropTypes4__default.default.func.isRequired,
  disableInteraction: PropTypes4__default.default.bool.isRequired,
  getAllPanConditions: PropTypes4__default.default.func.isRequired,
  onMouseMove: PropTypes4__default.default.func,
  onMouseEnter: PropTypes4__default.default.func,
  onMouseLeave: PropTypes4__default.default.func,
  onZoom: PropTypes4__default.default.func,
  onPinchZoom: PropTypes4__default.default.func,
  onPinchZoomEnd: PropTypes4__default.default.func.isRequired,
  onPan: PropTypes4__default.default.func,
  onPanEnd: PropTypes4__default.default.func,
  onDragStart: PropTypes4__default.default.func,
  onDrag: PropTypes4__default.default.func,
  onDragComplete: PropTypes4__default.default.func,
  onClick: PropTypes4__default.default.func,
  onDoubleClick: PropTypes4__default.default.func,
  onContextMenu: PropTypes4__default.default.func,
  onMouseDown: PropTypes4__default.default.func,
  children: PropTypes4__default.default.node
};
EventCapture.defaultProps = {
  mouseMove: false,
  zoom: false,
  pan: false,
  panSpeedMultiplier: 1,
  focus: false,
  onDragComplete: noop,
  disableInteraction: false
};
var EventCapture_default = EventCapture;
var log = getLogger("CanvasContainer");
var CanvasContainer = class extends React.Component {
  constructor(props) {
    super(props);
    this.setDrawCanvas = this.setDrawCanvas.bind(this);
    this.drawCanvas = {};
  }
  setDrawCanvas(node) {
    if (isDefined(node))
      this.drawCanvas[node.id] = node.getContext("2d");
    else
      this.drawCanvas = {};
  }
  getCanvasContexts() {
    if (isDefined(this.drawCanvas.axes)) {
      return this.drawCanvas;
    }
  }
  render() {
    const { height, width, type, zIndex, ratio } = this.props;
    if (type === "svg") return null;
    log("using ratio ", ratio);
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { position: "absolute", zIndex }, children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "canvas",
        {
          id: "bg",
          ref: this.setDrawCanvas,
          width: width * ratio,
          height: height * ratio,
          style: { position: "absolute", width, height }
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "canvas",
        {
          id: "axes",
          ref: this.setDrawCanvas,
          width: width * ratio,
          height: height * ratio,
          style: { position: "absolute", width, height }
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "canvas",
        {
          id: "mouseCoord",
          ref: this.setDrawCanvas,
          width: width * ratio,
          height: height * ratio,
          style: { position: "absolute", width, height }
        }
      )
    ] });
  }
};
CanvasContainer.propTypes = {
  width: PropTypes4__default.default.number.isRequired,
  height: PropTypes4__default.default.number.isRequired,
  type: PropTypes4__default.default.string.isRequired,
  zIndex: PropTypes4__default.default.number,
  ratio: PropTypes4__default.default.number.isRequired
};
var CanvasContainer_default = CanvasContainer;

// src/lib/scale/evaluator.ts
var log2 = getLogger("evaluator");
function getNewEnd(fallbackEnd, xAccessor, initialXScale, start) {
  const {
    lastItem,
    lastItemX
  } = fallbackEnd;
  const lastItemXValue = xAccessor(lastItem);
  const [rangeStart, rangeEnd] = initialXScale.range();
  const newEnd = (rangeEnd - rangeStart) / (lastItemX - rangeStart) * (lastItemXValue - start) + start;
  return newEnd;
}
function extentsWrapper(useWholeData, clamp2, pointsPerPxThreshold, minPointsPerPxThreshold, flipXScale) {
  function filterData(data, inputDomain, xAccessor, initialXScale, { currentPlotData, currentDomain, fallbackStart, fallbackEnd } = {}) {
    if (useWholeData) {
      return { plotData: data, domain: inputDomain };
    }
    let left = head(inputDomain);
    let right = last(inputDomain);
    let clampedDomain = inputDomain;
    let filteredData = getFilteredResponse(data, left, right, xAccessor);
    if (filteredData.length === 1 && isDefined(fallbackStart)) {
      left = fallbackStart;
      right = getNewEnd(fallbackEnd, xAccessor, initialXScale, left);
      clampedDomain = [
        left,
        right
      ];
      filteredData = getFilteredResponse(data, left, right, xAccessor);
    }
    if (typeof clamp2 === "function") {
      clampedDomain = clamp2(clampedDomain, [xAccessor(head(data)), xAccessor(last(data))]);
    } else {
      if (clamp2 === "left" || clamp2 === "both" || clamp2 === true) {
        clampedDomain = [
          Math.max(left, xAccessor(head(data))),
          clampedDomain[1]
        ];
      }
      if (clamp2 === "right" || clamp2 === "both" || clamp2 === true) {
        clampedDomain = [
          clampedDomain[0],
          Math.min(right, xAccessor(last(data)))
        ];
      }
    }
    if (clampedDomain !== inputDomain) {
      filteredData = getFilteredResponse(data, clampedDomain[0], clampedDomain[1], xAccessor);
    }
    const realInputDomain = clampedDomain;
    const xScale = initialXScale.copy().domain(realInputDomain);
    let width = Math.floor(xScale(xAccessor(last(filteredData))) - xScale(xAccessor(head(filteredData))));
    if (flipXScale && width < 0) {
      width = width * -1;
    }
    let plotData, domain;
    const chartWidth = last(xScale.range()) - head(xScale.range());
    log2(`Trying to show ${filteredData.length} points in ${width}px, I can show up to ${showMaxThreshold(width, pointsPerPxThreshold) - 1} points in that width. Also FYI the entire chart width is ${chartWidth}px and pointsPerPxThreshold is ${pointsPerPxThreshold}`);
    if (canShowTheseManyPeriods(width, filteredData.length, pointsPerPxThreshold, minPointsPerPxThreshold)) {
      plotData = filteredData;
      domain = realInputDomain;
      log2("AND IT WORKED");
    } else {
      if (chartWidth > showMaxThreshold(width, pointsPerPxThreshold) && isDefined(fallbackEnd)) {
        plotData = filteredData;
        const newEnd = getNewEnd(fallbackEnd, xAccessor, initialXScale, head(realInputDomain));
        domain = [
          head(realInputDomain),
          newEnd
        ];
        const newXScale = xScale.copy().domain(domain);
        const newWidth = Math.floor(newXScale(xAccessor(last(plotData))) - newXScale(xAccessor(head(plotData))));
        log2(`and ouch, that is too much, so instead showing ${plotData.length} in ${newWidth}px`);
      } else {
        plotData = currentPlotData || filteredData.slice(filteredData.length - showMax(width, pointsPerPxThreshold));
        domain = currentDomain || [xAccessor(head(plotData)), xAccessor(last(plotData))];
        const newXScale = xScale.copy().domain(domain);
        const newWidth = Math.floor(newXScale(xAccessor(last(plotData))) - newXScale(xAccessor(head(plotData))));
        log2(`and ouch, that is too much, so instead showing ${plotData.length} in ${newWidth}px`);
      }
    }
    return { plotData, domain };
  }
  return { filterData };
}
function canShowTheseManyPeriods(width, arrayLength, maxThreshold, minThreshold) {
  if (maxThreshold == null || minThreshold == null) return true;
  return arrayLength > showMinThreshold(width, minThreshold) && arrayLength < showMaxThreshold(width, maxThreshold);
}
function showMinThreshold(width, threshold) {
  return Math.max(1, Math.ceil(width * threshold));
}
function showMaxThreshold(width, threshold) {
  return Math.floor(width * threshold);
}
function showMax(width, threshold) {
  return Math.floor(showMaxThreshold(width, threshold) * 0.97);
}
function getFilteredResponse(data, left, right, xAccessor) {
  const newLeftIndex = getClosestItemIndexes(data, left, xAccessor).right;
  const newRightIndex = getClosestItemIndexes(data, right, xAccessor).left;
  const filteredData = data.slice(newLeftIndex, newRightIndex + 1);
  return filteredData;
}
function evaluator_default({
  xScale,
  useWholeData,
  clamp: clamp2,
  pointsPerPxThreshold,
  minPointsPerPxThreshold,
  flipXScale
}) {
  return extentsWrapper(
    useWholeData || isNotDefined(xScale.invert),
    clamp2,
    pointsPerPxThreshold,
    minPointsPerPxThreshold,
    flipXScale
  );
}
getLogger("ChartCanvas");
var CANDIDATES_FOR_RESET = [
  "seriesName",
  "xExtents"
];
function shouldResetChart(thisProps, nextProps) {
  return !CANDIDATES_FOR_RESET.every((key) => {
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
  return /* @__PURE__ */ jsxRuntime.jsx("style", { type: "text/css", children: tooltipStyle });
}
function getDimensions2(props) {
  return {
    height: props.height - props.margin.top - props.margin.bottom,
    width: props.width - props.margin.left - props.margin.right
  };
}
function getXScaleDirection(flipXScale) {
  return flipXScale ? -1 : 1;
}
function calculateFullData(props) {
  const { data: fullData, plotFull, xScale, clamp: clamp2, pointsPerPxThreshold, flipXScale } = props;
  const { xAccessor, displayXAccessor, minPointsPerPxThreshold } = props;
  const useWholeData = isDefined(plotFull) ? plotFull : xAccessor === identity;
  const { filterData } = evaluator_default({
    xScale,
    useWholeData,
    clamp: clamp2,
    pointsPerPxThreshold,
    minPointsPerPxThreshold,
    flipXScale
  });
  return {
    xAccessor,
    displayXAccessor: displayXAccessor || xAccessor,
    xScale: xScale.copy(),
    fullData,
    filterData
  };
}
function resetChart(props) {
  const state = calculateState(props);
  const { xAccessor, displayXAccessor, fullData } = state;
  const { plotData: initialPlotData, xScale } = state;
  const { postCalculator, children } = props;
  const plotData = postCalculator(initialPlotData);
  const dimensions = getDimensions2(props);
  const chartConfig = getChartConfigWithUpdatedYScales(
    getNewChartConfig(dimensions, children),
    { plotData, xAccessor, displayXAccessor, fullData },
    xScale.domain()
  );
  return {
    ...state,
    xScale,
    plotData,
    chartConfig
  };
}
function calculateState(props) {
  const { xAccessor: inputXAccesor, xExtents: xExtentsProp, data, padding, flipXScale } = props;
  const direction = getXScaleDirection(flipXScale);
  const dimensions = getDimensions2(props);
  const extent2 = typeof xExtentsProp === "function" ? xExtentsProp(data) : d3Array.extent(xExtentsProp.map((d) => functor(d)).map((each) => each(data, inputXAccesor)));
  const { xAccessor, displayXAccessor, xScale, fullData, filterData } = calculateFullData(props);
  const updatedXScale = setXRange(xScale, dimensions, padding, direction);
  const { plotData, domain } = filterData(fullData, extent2, inputXAccesor, updatedXScale);
  return {
    plotData,
    xScale: updatedXScale.domain(domain),
    xAccessor,
    displayXAccessor,
    fullData,
    filterData
  };
}
function setXRange(xScale, dimensions, padding, direction = 1) {
  const { left, right } = isNaN(padding) ? padding : { left: padding, right: padding };
  if (direction > 0) {
    xScale.range([left, dimensions.width - right]);
  } else {
    xScale.range([dimensions.width - right, left]);
  }
  return xScale;
}
var ChartCanvas = class extends React.Component {
  static defaultProps;
  constructor(props) {
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
  componentDidUpdate(prevProps) {
    const reset = shouldResetChart(prevProps, this.props);
    if (reset || prevProps.data !== this.props.data || prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
      const { fullData, ...state } = resetChart(this.props);
      this.fullData = fullData;
      this.setState(state, () => {
        this.notifyVisibleDomainChange();
      });
    }
  }
  saveEventCaptureNode(node) {
    this.eventCaptureNode = node;
  }
  saveCanvasContainerNode(node) {
    this.canvasContainerNode = node;
  }
  getMutableState() {
    return this.mutableState;
  }
  notifyVisibleDomainChange(xScale = this.state.xScale) {
    this.props.onVisibleDomainChange?.(xScale.domain());
  }
  getDataInfo() {
    return { ...this.state, fullData: this.fullData };
  }
  getCanvasContexts() {
    return this.canvasContainerNode?.getCanvasContexts();
  }
  generateSubscriptionId() {
    return ++this.lastSubscriptionId;
  }
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
  subscribe(id, rest) {
    const { getPanConditions = functor({ draggable: false, panEnabled: true }) } = rest;
    this.subscriptions = this.subscriptions.concat({ id, ...rest, getPanConditions });
  }
  unsubscribe(id) {
    this.subscriptions = this.subscriptions.filter((each) => each.id !== id);
  }
  getAllPanConditions() {
    return this.subscriptions.map((each) => each.getPanConditions());
  }
  setCursorClass(className) {
    this.eventCaptureNode?.setCursorClass(className);
  }
  amIOnTop(id) {
    const dragableComponents = this.subscriptions.filter((each) => each.getPanConditions().draggable);
    return dragableComponents.length > 0 && last(dragableComponents).id === id;
  }
  handleContextMenu(mouseXY, e) {
    const { xAccessor, chartConfig, plotData, xScale } = this.state;
    const currentCharts = getCurrentCharts(chartConfig, mouseXY);
    const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
    this.triggerEvent("contextmenu", { mouseXY, currentItem, currentCharts }, e);
  }
  handleMouseEnter(e) {
    this.triggerEvent("mouseenter", { show: true }, e);
  }
  handleMouseDown(mouseXY, currentCharts, e) {
    const { xScale, xAccessor, plotData } = this.state;
    const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
    this.triggerEvent("mousedown", { mouseXY, currentCharts, currentItem }, e);
  }
  calculateStateForDomain(newDomain) {
    const { xAccessor, displayXAccessor, xScale: initialXScale, chartConfig: initialChartConfig, plotData: initialPlotData, filterData } = this.state;
    const { fullData } = this;
    const { postCalculator } = this.props;
    const { plotData: beforePlotData, domain } = filterData(fullData, newDomain, xAccessor, initialXScale, { currentPlotData: initialPlotData, currentDomain: initialXScale.domain() });
    const plotData = postCalculator(beforePlotData);
    const updatedScale = initialXScale.copy().domain(domain);
    const chartConfig = getChartConfigWithUpdatedYScales(initialChartConfig, { plotData, xAccessor, displayXAccessor, fullData }, updatedScale.domain());
    return { xScale: updatedScale, plotData, chartConfig };
  }
  triggerEvent(type, props, e) {
    this.subscriptions.forEach((each) => {
      const state = { ...this.state, fullData: this.fullData, subscriptions: this.subscriptions };
      each.listener(type, props, state, e);
    });
  }
  draw(props = { force: false }) {
    this.subscriptions.forEach((each) => {
      if (isDefined(each.draw)) each.draw(props);
    });
  }
  redraw() {
    this.clearThreeCanvas();
    this.draw({ force: true });
  }
  handleZoom(zoomDirection, mouseXY, e) {
    if (this.panInProgress) return;
    const { xAccessor, xScale: initialXScale, plotData: initialPlotData } = this.state;
    const { zoomMultiplier, zoomAnchor, fullData } = this.props;
    const item = zoomAnchor({ xScale: initialXScale, xAccessor, mouseXY, plotData: initialPlotData, fullData: this.fullData });
    const cx = initialXScale(item);
    const c = zoomDirection > 0 ? 1 * zoomMultiplier : 1 / zoomMultiplier;
    const newDomain = initialXScale.range().map((x) => cx + (x - cx) * c).map(initialXScale.invert);
    const { xScale, plotData, chartConfig } = this.calculateStateForDomain(newDomain);
    this.setState({ xScale, plotData, chartConfig }, () => {
      this.triggerEvent("zoom", { xScale, plotData, chartConfig }, e);
      this.clearThreeCanvas();
      this.draw({ force: true });
      this.notifyVisibleDomainChange(xScale);
    });
  }
  xAxisZoom(newDomain) {
    const { xScale, plotData, chartConfig } = this.calculateStateForDomain(newDomain);
    this.setState({ xScale, plotData, chartConfig }, () => {
      this.triggerEvent("zoom", { xScale, plotData, chartConfig }, void 0);
      this.clearThreeCanvas();
      this.draw({ force: true });
      this.notifyVisibleDomainChange(xScale);
    });
  }
  yAxisZoom(chartId, newDomain) {
    this.clearThreeCanvas();
    const { chartConfig: initialChartConfig } = this.state;
    const chartConfig = initialChartConfig.map((each) => {
      if (each.id === chartId) {
        return { ...each, yScale: each.yScale.copy().domain(newDomain), yPanEnabled: true };
      }
      return each;
    });
    this.setState({ chartConfig });
  }
  panHelper(mouseXY, initialXScale, { dx, dy }, chartsToPan) {
    const { xAccessor, displayXAccessor, chartConfig: initialChartConfig, filterData } = this.state;
    const { fullData } = this;
    const { postCalculator } = this.props;
    const newDomain = initialXScale.range().map((x) => x - dx).map(initialXScale.invert);
    const { plotData: beforePlotData, domain } = filterData(fullData, newDomain, xAccessor, initialXScale, { currentPlotData: this.state.plotData, currentDomain: initialXScale.domain() });
    const updatedScale = initialXScale.copy().domain(domain);
    const plotData = postCalculator(beforePlotData);
    const chartConfig = getChartConfigWithUpdatedYScales(initialChartConfig, { plotData, xAccessor, displayXAccessor, fullData }, updatedScale.domain(), dy, chartsToPan);
    return { xScale: updatedScale, plotData, chartConfig, mouseXY, currentCharts: getCurrentCharts(chartConfig, mouseXY), currentItem: getCurrentItem(updatedScale, xAccessor, mouseXY, plotData) };
  }
  handlePan(mousePosition2, panStartXScale, dxdy, chartsToPan, e) {
    if (!this.waitingForPanAnimationFrame) {
      this.waitingForPanAnimationFrame = true;
      const state = this.panHelper(mousePosition2, panStartXScale, dxdy, chartsToPan);
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
  handlePanEnd(mousePosition2, panStartXScale, dxdy, chartsToPan, e) {
    const state = this.panHelper(mousePosition2, panStartXScale, dxdy, chartsToPan);
    this.panInProgress = false;
    this.clearThreeCanvas();
    this.setState(state, () => {
      this.notifyVisibleDomainChange(state.xScale);
    });
  }
  handleMouseMove(mouseXY, inputType, e) {
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
  handleMouseLeave(e) {
    this.triggerEvent("mouseleave", { show: false }, e);
    this.clearMouseCanvas();
    this.draw({ trigger: "mouseleave" });
  }
  handleDragStart({ startPos }, e) {
    this.triggerEvent("dragstart", { startPos }, e);
  }
  handleDrag({ startPos, mouseXY }, e) {
    const { chartConfig, plotData, xScale, xAccessor } = this.state;
    const currentCharts = getCurrentCharts(chartConfig, mouseXY);
    const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
    this.triggerEvent("drag", { startPos, mouseXY, currentItem, currentCharts }, e);
    this.mutableState = { mouseXY, currentItem, currentCharts };
    requestAnimationFrame(() => {
      this.clearMouseCanvas();
      this.draw({ trigger: "drag" });
    });
  }
  handleDragEnd({ mouseXY }, e) {
    this.triggerEvent("dragend", { mouseXY }, e);
    requestAnimationFrame(() => {
      this.clearMouseCanvas();
      this.draw({ trigger: "dragend" });
    });
  }
  handleClick(mousePosition2, e) {
    this.triggerEvent("click", this.mutableState, e);
    requestAnimationFrame(() => {
      this.clearMouseCanvas();
      this.draw({ trigger: "click" });
    });
  }
  handleDoubleClick(mousePosition2, e) {
    this.triggerEvent("dblclick", {}, e);
  }
  render() {
    const { type, height, width, margin, className, zIndex, defaultFocus, ratio, mouseMoveEvent, panEvent, zoomEvent, useCrossHairStyleCursor, onSelect, children } = this.props;
    const { plotData, xScale, xAccessor, chartConfig } = this.state;
    const dimensions = getDimensions2(this.props);
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
      setCursorClass: this.setCursorClass
    };
    return /* @__PURE__ */ jsxRuntime.jsx(StockChartProvider, { value: contextValue, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { position: "relative", width, height }, className, onClick: onSelect, children: [
      /* @__PURE__ */ jsxRuntime.jsx(CanvasContainer_default, { ref: this.saveCanvasContainerNode, type, ratio, width, height, zIndex }),
      /* @__PURE__ */ jsxRuntime.jsxs("svg", { className, width, height, style: { position: "absolute", zIndex: zIndex + 5 }, children: [
        cursor,
        /* @__PURE__ */ jsxRuntime.jsxs("defs", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("clipPath", { id: "chart-area-clip", children: /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "0", y: "0", width: dimensions.width, height: dimensions.height }) }),
          chartConfig.map((each, idx) => /* @__PURE__ */ jsxRuntime.jsx("clipPath", { id: `chart-area-clip-${each.id}`, children: /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "0", y: "0", width: each.width, height: each.height }) }, idx))
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("g", { transform: `translate(${margin.left + 0.5}, ${margin.top + 0.5})`, children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            EventCapture_default,
            {
              ref: this.saveEventCaptureNode,
              useCrossHairStyleCursor: cursorStyle,
              mouseMove: mouseMoveEvent && interaction,
              zoom: zoomEvent && interaction,
              pan: panEvent && interaction,
              width: dimensions.width,
              height: dimensions.height,
              chartConfig,
              xScale,
              xAccessor,
              focus: defaultFocus,
              disableInteraction: this.props.disableInteraction,
              getAllPanConditions: this.getAllPanConditions,
              onContextMenu: this.handleContextMenu,
              onClick: this.handleClick,
              onDoubleClick: this.handleDoubleClick,
              onMouseDown: this.handleMouseDown,
              onMouseMove: this.handleMouseMove,
              onMouseEnter: this.handleMouseEnter,
              onMouseLeave: this.handleMouseLeave,
              onDragStart: this.handleDragStart,
              onDrag: this.handleDrag,
              onDragComplete: this.handleDragEnd,
              onZoom: this.handleZoom,
              onPan: this.handlePan,
              onPanEnd: this.handlePanEnd
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("g", { className: "react-stockcharts-avoid-interaction", children })
        ] })
      ] })
    ] }) });
  }
};
ChartCanvas.propTypes = {
  width: PropTypes4__default.default.number.isRequired,
  height: PropTypes4__default.default.number.isRequired,
  margin: PropTypes4__default.default.object,
  ratio: PropTypes4__default.default.number.isRequired,
  type: PropTypes4__default.default.oneOf(["svg", "hybrid"]),
  data: PropTypes4__default.default.array.isRequired,
  xAccessor: PropTypes4__default.default.func,
  xExtents: PropTypes4__default.default.oneOfType([PropTypes4__default.default.array, PropTypes4__default.default.func]),
  zoomAnchor: PropTypes4__default.default.func,
  className: PropTypes4__default.default.string,
  seriesName: PropTypes4__default.default.string.isRequired,
  zIndex: PropTypes4__default.default.number,
  children: PropTypes4__default.default.node.isRequired,
  xScale: PropTypes4__default.default.func.isRequired,
  postCalculator: PropTypes4__default.default.func,
  flipXScale: PropTypes4__default.default.bool,
  useCrossHairStyleCursor: PropTypes4__default.default.bool,
  padding: PropTypes4__default.default.oneOfType([PropTypes4__default.default.number, PropTypes4__default.default.shape({ left: PropTypes4__default.default.number, right: PropTypes4__default.default.number })]),
  defaultFocus: PropTypes4__default.default.bool,
  zoomMultiplier: PropTypes4__default.default.number,
  onLoadMore: PropTypes4__default.default.func,
  displayXAccessor: PropTypes4__default.default.func,
  mouseMoveEvent: PropTypes4__default.default.bool,
  panEvent: PropTypes4__default.default.bool,
  clamp: PropTypes4__default.default.oneOfType([PropTypes4__default.default.string, PropTypes4__default.default.bool, PropTypes4__default.default.func]),
  zoomEvent: PropTypes4__default.default.bool,
  onSelect: PropTypes4__default.default.func,
  onVisibleDomainChange: PropTypes4__default.default.func,
  maintainPointsPerPixelOnResize: PropTypes4__default.default.bool,
  disableInteraction: PropTypes4__default.default.bool
};
ChartCanvas.defaultProps = {
  margin: { top: 20, right: 30, bottom: 30, left: 80 },
  type: "hybrid",
  className: "react-stockchart",
  zIndex: 1,
  xExtents: [d3Array.min, d3Array.max],
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
  zoomMultiplier: 1.2,
  clamp: false,
  zoomAnchor: mouseBasedZoomAnchor,
  maintainPointsPerPixelOnResize: true,
  disableInteraction: false,
  pointsPerPxThreshold: 2,
  minPointsPerPxThreshold: 0.02
};
var ChartCanvas_default = ChartCanvas;
var aliases = {
  mouseleave: "mousemove",
  panend: "pan",
  pinchzoom: "pan",
  mousedown: "mousemove",
  click: "mousemove",
  contextmenu: "mousemove",
  dblclick: "mousemove",
  dragstart: "drag",
  dragend: "drag",
  dragcancel: "drag"
};
var GenericComponent = class extends React.Component {
  // We will use the static contextType for the main StockChartContext
  static contextType = StockChartContext_default;
  // NOTE: React 19 no longer runs propTypes validation at runtime.
  // PropTypes kept for documentation and IDE tooling only.
  static propTypes = {
    svgDraw: PropTypes4__default.default.func.isRequired,
    canvasDraw: PropTypes4__default.default.func,
    drawOn: PropTypes4__default.default.array.isRequired,
    clip: PropTypes4__default.default.bool.isRequired,
    edgeClip: PropTypes4__default.default.bool.isRequired,
    interactiveCursorClass: PropTypes4__default.default.string,
    selected: PropTypes4__default.default.bool.isRequired,
    enableDragOnHover: PropTypes4__default.default.bool.isRequired,
    disablePan: PropTypes4__default.default.bool.isRequired,
    canvasToDraw: PropTypes4__default.default.func.isRequired,
    isHover: PropTypes4__default.default.func,
    onClick: PropTypes4__default.default.func,
    onClickWhenHover: PropTypes4__default.default.func,
    onClickOutside: PropTypes4__default.default.func,
    onPan: PropTypes4__default.default.func,
    onPanEnd: PropTypes4__default.default.func,
    onDragStart: PropTypes4__default.default.func,
    onDrag: PropTypes4__default.default.func,
    onDragComplete: PropTypes4__default.default.func,
    onDoubleClick: PropTypes4__default.default.func,
    onDoubleClickWhenHover: PropTypes4__default.default.func,
    onContextMenu: PropTypes4__default.default.func,
    onContextMenuWhenHover: PropTypes4__default.default.func,
    onMouseMove: PropTypes4__default.default.func,
    onMouseDown: PropTypes4__default.default.func,
    onHover: PropTypes4__default.default.func,
    onUnHover: PropTypes4__default.default.func,
    chartId: PropTypes4__default.default.oneOfType([PropTypes4__default.default.number, PropTypes4__default.default.string])
  };
  static defaultProps = {
    svgDraw: functor(null),
    canvasToDraw: (contexts) => contexts?.mouseCoord,
    clip: true,
    edgeClip: false,
    selected: false,
    disablePan: false,
    enableDragOnHover: false,
    onClickWhenHover: noop,
    onClickOutside: noop,
    onDragStart: noop,
    onMouseMove: noop,
    onMouseDown: noop
  };
  constructor(props) {
    super(props);
    this.drawOnCanvas = this.drawOnCanvas.bind(this);
    this.getMoreProps = this.getMoreProps.bind(this);
    this.listener = this.listener.bind(this);
    this.draw = this.draw.bind(this);
    this.updateMoreProps = this.updateMoreProps.bind(this);
    this.evaluateType = this.evaluateType.bind(this);
    this.isHover = this.isHover.bind(this);
    this.preCanvasDraw = this.preCanvasDraw.bind(this);
    this.postCanvasDraw = this.postCanvasDraw.bind(this);
    this.getPanConditions = this.getPanConditions.bind(this);
    this.shouldTypeProceed = this.shouldTypeProceed.bind(this);
    this.preEvaluate = this.preEvaluate.bind(this);
    this.moreProps = {};
    this.state = { updateCount: 0 };
  }
  componentDidMount() {
    const { subscribe, generateSubscriptionId } = this.context;
    const { chartId } = this.props;
    const { clip = true, edgeClip = false } = this.props;
    this.suscriberId = generateSubscriptionId();
    subscribe(this.suscriberId, {
      chartId,
      clip,
      edgeClip,
      listener: this.listener,
      draw: this.draw,
      getPanConditions: this.getPanConditions
    });
    this.updateMorePropsFromContext(this.context);
    this.componentDidUpdate({});
  }
  componentWillUnmount() {
    const { unsubscribe, setCursorClass } = this.context;
    unsubscribe(this.suscriberId);
    if (this.iSetTheCursorClass) {
      setCursorClass?.(null);
    }
  }
  componentDidUpdate(prevProps = {}) {
    const { chartCanvasType, setCursorClass } = this.context;
    const { canvasDraw, selected = false, interactiveCursorClass } = this.props;
    if (prevProps.selected !== selected) {
      if (selected && this.moreProps.hovering) {
        this.iSetTheCursorClass = true;
        setCursorClass?.(interactiveCursorClass);
      } else {
        this.iSetTheCursorClass = false;
        setCursorClass?.(null);
      }
    }
    if (isDefined(canvasDraw) && !this.evaluationInProgress && chartCanvasType !== "svg") {
      this.updateMoreProps(this.moreProps);
      this.drawOnCanvas();
    }
  }
  updateMorePropsFromContext(context) {
    const { xScale, plotData, chartConfig, getMutableState } = context;
    this.moreProps = {
      ...this.moreProps,
      ...getMutableState?.(),
      xScale,
      plotData,
      chartConfig
    };
  }
  updateMoreProps(moreProps) {
    Object.keys(moreProps).forEach((key) => {
      this.moreProps[key] = moreProps[key];
    });
  }
  shouldTypeProceed(_type, _moreProps) {
    return true;
  }
  preEvaluate(_type, _moreProps, _e) {
  }
  listener(type, moreProps, state, e) {
    if (isDefined(moreProps)) {
      this.updateMoreProps(moreProps);
    }
    this.evaluationInProgress = true;
    this.evaluateType(type, e);
    this.evaluationInProgress = false;
    if (isDefined(this.props.svgDraw) && this.props.drawOn.indexOf(aliases[type] || type) > -1) {
      this.forceUpdate();
    }
  }
  evaluateType(type, e) {
    const newType = aliases[type] || type;
    const proceed = this.props.drawOn.indexOf(newType) > -1;
    if (!proceed) return;
    this.preEvaluate(type, this.moreProps, e);
    if (!this.shouldTypeProceed(type, this.moreProps)) return;
    const { setCursorClass, amIOnTop } = this.context;
    switch (type) {
      case "zoom":
      case "mouseenter":
        break;
      case "mouseleave": {
        this.moreProps.hovering = false;
        this.props.onUnHover?.(this.getMoreProps(), e);
        break;
      }
      case "contextmenu": {
        this.props.onContextMenu?.(this.getMoreProps(), e);
        if (this.moreProps.hovering) this.props.onContextMenuWhenHover?.(this.getMoreProps(), e);
        break;
      }
      case "mousedown": {
        this.props.onMouseDown?.(this.getMoreProps(), e);
        break;
      }
      case "click": {
        const moreProps = this.getMoreProps();
        if (this.moreProps.hovering) this.props.onClickWhenHover?.(moreProps, e);
        else this.props.onClickOutside?.(moreProps, e);
        this.props.onClick?.(moreProps, e);
        break;
      }
      case "mousemove": {
        const prevHover = this.moreProps.hovering;
        this.moreProps.hovering = this.isHover(e);
        if (this.moreProps.hovering && !this.props.selected && amIOnTop?.(this.suscriberId) && isDefined(this.props.onHover)) {
          setCursorClass?.("react-stockcharts-pointer-cursor");
          this.iSetTheCursorClass = true;
        } else if (this.moreProps.hovering && this.props.selected && amIOnTop?.(this.suscriberId)) {
          setCursorClass?.(this.props.interactiveCursorClass);
          this.iSetTheCursorClass = true;
        } else if (prevHover && !this.moreProps.hovering && this.iSetTheCursorClass) {
          this.iSetTheCursorClass = false;
          setCursorClass?.(null);
        }
        const moreProps = this.getMoreProps();
        if (this.moreProps.hovering && !prevHover) this.props.onHover?.(moreProps, e);
        if (prevHover && !this.moreProps.hovering) this.props.onUnHover?.(moreProps, e);
        this.props.onMouseMove?.(moreProps, e);
        break;
      }
      case "dblclick": {
        const moreProps = this.getMoreProps();
        this.props.onDoubleClick?.(moreProps, e);
        if (this.moreProps.hovering) this.props.onDoubleClickWhenHover?.(moreProps, e);
        break;
      }
      case "pan": {
        this.moreProps.hovering = false;
        this.props.onPan?.(this.getMoreProps(), e);
        break;
      }
      case "panend": {
        this.props.onPanEnd?.(this.getMoreProps(), e);
        break;
      }
      case "dragstart": {
        if (this.getPanConditions().draggable) {
          if (amIOnTop?.(this.suscriberId)) {
            this.dragInProgress = true;
            this.props.onDragStart?.(this.getMoreProps(), e);
          }
        }
        this.someDragInProgress = true;
        break;
      }
      case "drag": {
        if (this.dragInProgress) this.props.onDrag?.(this.getMoreProps(), e);
        break;
      }
      case "dragend": {
        if (this.dragInProgress) this.props.onDragComplete?.(this.getMoreProps(), e);
        this.dragInProgress = false;
        this.someDragInProgress = false;
        break;
      }
    }
  }
  isHover(e) {
    return this.props.isHover?.(this.getMoreProps(), e) ?? false;
  }
  getPanConditions() {
    const draggable = !!(this.props.selected && this.moreProps.hovering) || this.props.enableDragOnHover && this.moreProps.hovering;
    return { draggable, panEnabled: !this.props.disablePan };
  }
  draw({ trigger, force } = { force: false }) {
    const type = trigger ? aliases[trigger] || trigger : void 0;
    const proceed = type ? this.props.drawOn.indexOf(type) > -1 : false;
    if (proceed || this.props.selected || force) {
      const { chartCanvasType } = this.context;
      const { canvasDraw } = this.props;
      if (isNotDefined(canvasDraw) || chartCanvasType === "svg") {
        this.setState(({ updateCount }) => ({ updateCount: updateCount + 1 }));
      } else {
        this.drawOnCanvas();
      }
    }
  }
  getMoreProps() {
    const { xScale, plotData, chartConfig, morePropsDecorator, xAccessor, displayXAccessor, width, height, fullData } = this.context;
    const { chartId } = this.props;
    const moreProps = {
      xScale,
      plotData,
      chartConfig,
      xAccessor,
      displayXAccessor,
      width,
      height,
      chartId,
      fullData,
      ...this.moreProps
    };
    return (morePropsDecorator || identity)(moreProps);
  }
  preCanvasDraw(_ctx, _moreProps) {
  }
  postCanvasDraw(_ctx, _moreProps) {
  }
  drawOnCanvas() {
    const { canvasDraw, canvasToDraw = (contexts) => contexts?.mouseCoord } = this.props;
    const { getCanvasContexts = () => void 0 } = this.context;
    const moreProps = this.getMoreProps();
    const ctx = canvasToDraw(getCanvasContexts());
    if (!ctx) return;
    this.preCanvasDraw(ctx, moreProps);
    canvasDraw?.(ctx, moreProps);
    this.postCanvasDraw(ctx, moreProps);
  }
  render() {
    const { chartCanvasType } = this.context;
    const { chartId, canvasDraw, clip, svgDraw } = this.props;
    if (isDefined(canvasDraw) && chartCanvasType !== "svg") return null;
    const suffix = isDefined(chartId) ? "-" + chartId : "";
    const style = clip ? { clipPath: `url(#chart-area-clip${suffix})` } : void 0;
    return /* @__PURE__ */ jsxRuntime.jsx("g", { style, children: svgDraw(this.getMoreProps()) });
  }
};
var GenericComponent_default = GenericComponent;
var ALWAYS_TRUE_TYPES = ["drag", "dragend"];
var GenericChartComponent = class extends GenericComponent_default {
  preCanvasDraw(ctx, moreProps) {
    super.preCanvasDraw(ctx, moreProps);
    ctx.save();
    const { margin, ratio } = this.context;
    const { chartConfig } = moreProps;
    const canvasOriginX = 0.5 * ratio + chartConfig.origin[0] + margin.left;
    const canvasOriginY = 0.5 * ratio + chartConfig.origin[1] + margin.top;
    const { chartConfig: { width, height } } = moreProps;
    const { clip, edgeClip } = this.props;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    if (edgeClip) {
      ctx.beginPath();
      ctx.rect(-1, canvasOriginY - 10, width + margin.left + margin.right + 1, height + 20);
      ctx.clip();
    }
    ctx.translate(canvasOriginX, canvasOriginY);
    if (clip) {
      ctx.beginPath();
      ctx.rect(-1, -1, width + 1, height + 1);
      ctx.clip();
    }
  }
  postCanvasDraw(ctx, moreProps) {
    super.postCanvasDraw(ctx, moreProps);
    ctx.restore();
  }
  updateMoreProps(moreProps) {
    super.updateMoreProps(moreProps);
    const { chartConfig: chartConfigList } = moreProps;
    if (chartConfigList && Array.isArray(chartConfigList)) {
      const { chartId } = this.props;
      const chartConfig = find(chartConfigList, (each) => each.id === chartId) || chartConfigList[0];
      if (chartConfig) {
        this.moreProps.chartConfig = chartConfig;
      }
    }
    if (isDefined(this.moreProps.chartConfig)) {
      const { origin } = this.moreProps.chartConfig;
      if (!Array.isArray(origin)) {
        return;
      }
      const [ox, oy] = origin;
      if (isDefined(moreProps.mouseXY)) {
        const { mouseXY: [x, y] } = moreProps;
        this.moreProps.mouseXY = [x - ox, y - oy];
      }
      if (isDefined(moreProps.startPos)) {
        const { startPos: [x, y] } = moreProps;
        this.moreProps.startPos = [x - ox, y - oy];
      }
    }
  }
  shouldTypeProceed(type, moreProps) {
    if ((type === "mousemove" || type === "click") && this.props.disablePan) {
      return true;
    }
    if (ALWAYS_TRUE_TYPES.indexOf(type) === -1 && isDefined(moreProps) && isDefined(moreProps.currentCharts)) {
      return moreProps.currentCharts.indexOf(this.props.chartId) > -1;
    }
    return true;
  }
};
var GenericChartComponentWrapper = (props) => {
  const { chartId } = useChart();
  return /* @__PURE__ */ jsxRuntime.jsx(GenericChartComponent, { ...props, chartId });
};
var GenericChartComponent_default = GenericChartComponentWrapper;
var BackgroundText = class _BackgroundText extends PureComponent_default {
  static defaultProps;
  static drawOnCanvas;
  static contextType = StockChartContext_default;
  componentDidMount() {
    if (this.context.chartCanvasType !== "svg" && isDefined(this.context.getCanvasContexts)) {
      const contexts = this.context.getCanvasContexts();
      const interval = isDefined(this.props.interval) ? this.props.interval : this.context.interval;
      if (contexts) _BackgroundText.drawOnCanvas(contexts.bg, this.props, { interval }, this.props.children);
    }
  }
  componentDidUpdate() {
    this.componentDidMount();
  }
  render() {
    const { chartCanvasType } = this.context;
    if (chartCanvasType !== "svg") return null;
    const { x, y, fill, opacity, stroke, strokeOpacity, fontFamily, fontSize, textAnchor } = this.props;
    const props = { x, y, fill, opacity, stroke, strokeOpacity, fontFamily, fontSize, textAnchor };
    const interval = isDefined(this.props.interval) ? this.props.interval : this.context.interval;
    return /* @__PURE__ */ jsxRuntime.jsx("text", { ...props, children: this.props.children(interval) });
  }
};
BackgroundText.drawOnCanvas = (ctx, props, { interval }, getText) => {
  ctx.clearRect(-1, -1, ctx.canvas.width + 2, ctx.canvas.height + 2);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(0.5, 0.5);
  const { x, y, fill, opacity, stroke, strokeOpacity, fontFamily, fontSize, textAnchor } = props;
  const text = getText(interval);
  ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = hexToRGBA(fill, opacity);
  ctx.textAlign = textAnchor === "middle" ? "center" : textAnchor;
  if (stroke !== "none") ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
  ctx.restore();
};
BackgroundText.propTypes = {
  x: PropTypes4__default.default.number.isRequired,
  y: PropTypes4__default.default.number.isRequired,
  fontFamily: PropTypes4__default.default.string,
  fontSize: PropTypes4__default.default.number.isRequired,
  fill: PropTypes4__default.default.string,
  stroke: PropTypes4__default.default.string,
  opacity: PropTypes4__default.default.number,
  strokeOpacity: PropTypes4__default.default.number,
  textAnchor: PropTypes4__default.default.string,
  children: PropTypes4__default.default.func,
  interval: PropTypes4__default.default.string
};
BackgroundText.defaultProps = {
  opacity: 0.3,
  fill: "#9E7523",
  stroke: "#9E7523",
  strokeOpacity: 1,
  fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
  fontSize: 12,
  textAnchor: "middle"
};
var BackgroundText_default = BackgroundText;
function withChartAndStockChart(Component6) {
  return function WrappedComponent(props) {
    const stockChartContext = useStockChart();
    const chartContext = useChart();
    return /* @__PURE__ */ jsxRuntime.jsx(Component6, { ...props, stockChartContext, chartContext });
  };
}
var ZoomButtons = class extends React.Component {
  static defaultProps;
  constructor(props) {
    super(props);
    this.handleZoomOut = this.handleZoomOut.bind(this);
    this.handleZoomIn = this.handleZoomIn.bind(this);
    this.zoom = this.zoom.bind(this);
  }
  zoom(direction) {
    const { xAxisZoom, xScale, plotData, xAccessor } = this.props.stockChartContext;
    const cx = xScale(xAccessor(last(plotData)));
    const { zoomMultiplier } = this.props;
    const c = direction > 0 ? 1 * zoomMultiplier : 1 / zoomMultiplier;
    const [start, end] = xScale.domain();
    const [newStart, newEnd] = xScale.range().map((x) => cx + (x - cx) * c).map(xScale.invert);
    const left = d3Interpolate.interpolateNumber(start, newStart);
    const right = d3Interpolate.interpolateNumber(end, newEnd);
    const foo = [0.25, 0.3, 0.5, 0.6, 0.75, 1].map((i) => {
      return [left(i), right(i)];
    });
    this.interval = setInterval(() => {
      xAxisZoom(foo.shift());
      if (foo.length === 0) {
        clearInterval(this.interval);
        delete this.interval;
      }
    }, 10);
  }
  handleZoomOut() {
    if (this.interval) return;
    this.zoom(1);
  }
  handleZoomIn() {
    if (this.interval) return;
    this.zoom(-1);
  }
  render() {
    const { chartConfig } = this.props.chartContext;
    const { width, height } = chartConfig;
    const { size, heightFromBase, rx, ry } = this.props;
    const { stroke, strokeOpacity, fill, strokeWidth, fillOpacity } = this.props;
    const { textFill, textStrokeWidth } = this.props;
    const { onReset } = this.props;
    const centerX = Math.round(width / 2);
    const y = height - heightFromBase;
    const [w, h] = size;
    const hLength = 5;
    const wLength = 6;
    const textY = Math.round(y + h / 2);
    const resetX = centerX;
    const zoomOut = d3Path.path();
    const zoomOutX = centerX - w - 2 * strokeWidth;
    zoomOut.moveTo(zoomOutX - wLength, textY);
    zoomOut.lineTo(zoomOutX + wLength, textY);
    zoomOut.closePath();
    const zoomIn = d3Path.path();
    const zoomInX = centerX + w + 2 * strokeWidth;
    zoomIn.moveTo(zoomInX - wLength, textY);
    zoomIn.lineTo(zoomInX + wLength, textY);
    zoomIn.moveTo(zoomInX, textY - hLength);
    zoomIn.lineTo(zoomInX, textY + hLength);
    return /* @__PURE__ */ jsxRuntime.jsxs("g", { className: "react-stockcharts-zoom-button", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "rect",
        {
          x: zoomOutX - w / 2,
          y,
          rx,
          ry,
          height: h,
          width: w,
          fill,
          fillOpacity,
          stroke,
          strokeOpacity,
          strokeWidth
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "path",
        {
          d: zoomOut.toString(),
          stroke: textFill,
          strokeWidth: textStrokeWidth
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "rect",
        {
          x: resetX - w / 2,
          y,
          rx,
          ry,
          height: h,
          width: w,
          fill,
          fillOpacity,
          stroke,
          strokeOpacity,
          strokeWidth
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx("g", { transform: `translate (${resetX}, ${y + h / 4}) scale(.14)`, children: /* @__PURE__ */ jsxRuntime.jsx(
        "path",
        {
          d: "M31 13C23.4 5.3 12.8.5 1.1.5c-23.3 0-42.3 19-42.3 42.5s18.9 42.5 42.3 42.5c13.8 0 26-6.6 33.7-16.9l-16.5-1.8C13.5 70.4 7.5 72.5 1 72.5c-16.2 0-29.3-13.2-29.3-29.4S-15.2 13.7 1 13.7c8.1 0 15.4 3.3 20.7 8.6l-10.9 11h32.5V.5L31 13z",
          fill: textFill
        }
      ) }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "rect",
        {
          x: zoomInX - w / 2,
          y,
          rx,
          ry,
          height: h,
          width: w,
          fill,
          fillOpacity,
          stroke,
          strokeOpacity,
          strokeWidth
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "path",
        {
          d: zoomIn.toString(),
          stroke: textFill,
          strokeWidth: textStrokeWidth
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "rect",
        {
          className: "react-stockcharts-enable-interaction out",
          onClick: this.handleZoomOut,
          x: zoomOutX - w / 2,
          y,
          rx,
          ry,
          height: h,
          width: w,
          fill: "none"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "rect",
        {
          className: "react-stockcharts-enable-interaction reset",
          onClick: onReset,
          x: resetX - w / 2,
          y,
          rx,
          ry,
          height: h,
          width: w,
          fill: "none"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "rect",
        {
          className: "react-stockcharts-enable-interaction in",
          onClick: this.handleZoomIn,
          x: zoomInX - w / 2,
          y,
          rx,
          ry,
          height: h,
          width: w,
          fill: "none"
        }
      )
    ] });
  }
};
ZoomButtons.propTypes = {
  zoomMultiplier: PropTypes4__default.default.number.isRequired,
  size: PropTypes4__default.default.array.isRequired,
  heightFromBase: PropTypes4__default.default.number.isRequired,
  rx: PropTypes4__default.default.number.isRequired,
  ry: PropTypes4__default.default.number.isRequired,
  stroke: PropTypes4__default.default.string.isRequired,
  strokeWidth: PropTypes4__default.default.number.isRequired,
  strokeOpacity: PropTypes4__default.default.number.isRequired,
  fill: PropTypes4__default.default.string.isRequired,
  fillOpacity: PropTypes4__default.default.number.isRequired,
  fontSize: PropTypes4__default.default.number.isRequired,
  textDy: PropTypes4__default.default.string.isRequired,
  textFill: PropTypes4__default.default.string.isRequired,
  textStrokeWidth: PropTypes4__default.default.number.isRequired,
  onReset: PropTypes4__default.default.func
};
ZoomButtons.defaultProps = {
  size: [30, 24],
  heightFromBase: 50,
  rx: 3,
  ry: 3,
  stroke: "#000000",
  strokeOpacity: 0.3,
  strokeWidth: 1,
  fill: "#D6D6D6",
  fillOpacity: 0.4,
  fontSize: 16,
  textDy: ".3em",
  textFill: "#000000",
  textStrokeWidth: 2,
  zoomMultiplier: 1.5,
  onReset: noop
};
var ZoomButtons_default = withChartAndStockChart(ZoomButtons);
var ChartSyncContext = React.createContext(void 0);
function ChartSyncProvider({ value, children }) {
  return React.createElement(ChartSyncContext.Provider, { value }, children);
}
var DataContext = React.createContext(void 0);
function DataProvider({ value, children }) {
  return React.createElement(DataContext.Provider, { value }, children);
}
function useDataContext() {
  const context = React.useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
}
function useCanvasResize() {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const element = ref.current;
    if (!element) {
      return void 0;
    }
    const updateSize = () => {
      setSize({
        width: element.clientWidth,
        height: element.clientHeight
      });
    };
    updateSize();
    if (typeof ResizeObserver === "undefined") {
      return void 0;
    }
    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);
  return { ref, size };
}

// src/lib/indicators/registry.ts
var indicatorRegistry = /* @__PURE__ */ new Map();
function normalizeIndicatorName(name) {
  return name.trim().toUpperCase();
}
function registerIndicator(indicator) {
  indicatorRegistry.set(normalizeIndicatorName(indicator.name), indicator);
  return indicator;
}
function getIndicator(name) {
  return indicatorRegistry.get(normalizeIndicatorName(name));
}

// src/lib/indicators/utils.ts
function numericExtent(values2) {
  const finiteValues = values2.filter((value) => Number.isFinite(value));
  if (finiteValues.length === 0) {
    return [0, 1];
  }
  const minValue = Math.min(...finiteValues);
  const maxValue = Math.max(...finiteValues);
  if (minValue === maxValue) {
    return [minValue - 1, maxValue + 1];
  }
  return [minValue, maxValue];
}
function collectNumbers(value, collected = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectNumbers(item, collected);
    }
    return collected;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    collected.push(value);
    return collected;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      collectNumbers(item, collected);
    }
  }
  return collected;
}
function emaSeries(values2, period) {
  if (values2.length === 0) {
    return [];
  }
  const smoothing = 2 / (Math.max(period, 1) + 1);
  const series = [];
  let previousEma = values2[0] ?? 0;
  for (let index = 0; index < values2.length; index += 1) {
    const current = values2[index] ?? previousEma;
    if (index === 0) {
      previousEma = current;
      series.push(current);
      continue;
    }
    previousEma = (current - previousEma) * smoothing + previousEma;
    series.push(previousEma);
  }
  return series;
}
function smaSeries(values2, period) {
  if (values2.length === 0) {
    return [];
  }
  const window2 = Math.max(period, 1);
  const series = [];
  let rollingSum = 0;
  for (let index = 0; index < values2.length; index += 1) {
    rollingSum += values2[index] ?? 0;
    if (index >= window2) {
      rollingSum -= values2[index - window2] ?? 0;
    }
    const divisor = Math.min(index + 1, window2);
    series.push(rollingSum / divisor);
  }
  return series;
}
function rsiSeries(values2, period) {
  if (values2.length === 0) {
    return [];
  }
  const window2 = Math.max(period, 1);
  const series = [50];
  let averageGain = 0;
  let averageLoss = 0;
  for (let index = 1; index < values2.length; index += 1) {
    const change = (values2[index] ?? 0) - (values2[index - 1] ?? 0);
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);
    if (index <= window2) {
      averageGain += gain;
      averageLoss += loss;
      const divisor = Math.min(index, window2);
      const gainAverage = averageGain / divisor;
      const lossAverage = averageLoss / divisor;
      const relativeStrength2 = lossAverage === 0 ? Number.POSITIVE_INFINITY : gainAverage / lossAverage;
      series.push(100 - 100 / (1 + relativeStrength2));
      continue;
    }
    averageGain = (averageGain * (window2 - 1) + gain) / window2;
    averageLoss = (averageLoss * (window2 - 1) + loss) / window2;
    const relativeStrength = averageLoss === 0 ? Number.POSITIVE_INFINITY : averageGain / averageLoss;
    series.push(100 - 100 / (1 + relativeStrength));
  }
  return series;
}
function macdSeries(values2, fastPeriod, slowPeriod, signalPeriod) {
  const fastEma = emaSeries(values2, fastPeriod);
  const slowEma = emaSeries(values2, slowPeriod);
  const macd = values2.map((_, index) => (fastEma[index] ?? 0) - (slowEma[index] ?? 0));
  const signal = emaSeries(macd, signalPeriod);
  const histogram = macd.map((value, index) => value - (signal[index] ?? 0));
  return { macd, signal, histogram };
}
function rollingStandardDeviation(values2, period) {
  if (values2.length === 0) {
    return [];
  }
  const window2 = Math.max(period, 1);
  const series = [];
  for (let index = 0; index < values2.length; index += 1) {
    const startIndex = Math.max(0, index - window2 + 1);
    const slice = values2.slice(startIndex, index + 1);
    const mean = slice.reduce((sum, value) => sum + (value ?? 0), 0) / slice.length;
    const variance = slice.reduce((sum, value) => {
      const delta = (value ?? 0) - mean;
      return sum + delta * delta;
    }, 0) / slice.length;
    series.push(Math.sqrt(variance));
  }
  return series;
}
function bollingerSeries(values2, period, multiplier) {
  const middle = smaSeries(values2, period);
  const deviation = rollingStandardDeviation(values2, period);
  const upper = middle.map((value, index) => value + (deviation[index] ?? 0) * multiplier);
  const lower = middle.map((value, index) => value - (deviation[index] ?? 0) * multiplier);
  return { upper, middle, lower };
}

// src/lib/indicators/builtin/ema.ts
var EMA = {
  name: "EMA",
  compute: (bars, period = 20) => emaSeries(bars.map((bar) => bar.close), period),
  computeExtents: (values2) => numericExtent(values2),
  render: () => void 0
};
var ema_default = EMA;

// src/lib/indicators/builtin/sma.ts
var SMA = {
  name: "SMA",
  compute: (bars, period = 20) => smaSeries(bars.map((bar) => bar.close), period),
  computeExtents: (values2) => numericExtent(values2),
  render: () => void 0
};
var sma_default = SMA;

// src/lib/indicators/builtin/rsi.ts
var RSI = {
  name: "RSI",
  compute: (bars, period = 14) => rsiSeries(bars.map((bar) => bar.close), period),
  computeExtents: () => [0, 100],
  yAxis: "right",
  render: () => void 0
};
var rsi_default = RSI;

// src/lib/indicators/builtin/macd.ts
var MACD = {
  name: "MACD",
  compute: (bars, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
    return macdSeries(bars.map((bar) => bar.close), fastPeriod, slowPeriod, signalPeriod);
  },
  computeExtents: (values2) => numericExtent(collectNumbers(values2)),
  render: () => void 0
};
var macd_default = MACD;

// src/lib/indicators/builtin/bollinger.ts
var BOLLINGER = {
  name: "BOLLINGER",
  compute: (bars, period = 20, multiplier = 2) => {
    return bollingerSeries(bars.map((bar) => bar.close), period, multiplier);
  },
  computeExtents: (values2) => numericExtent(collectNumbers(values2)),
  render: () => void 0
};
var bollinger_default = BOLLINGER;

// src/lib/indicators/builtin/volume.ts
var VOLUME = {
  name: "VOLUME",
  compute: (bars) => bars.map((bar) => bar.volume),
  computeExtents: (values2) => numericExtent(values2),
  yAxis: "right",
  render: () => void 0
};
var volume_default = VOLUME;

// src/lib/indicators/builtin/cvd.ts
var CVD = {
  name: "CVD",
  compute: (bars) => {
    let cumulative = 0;
    return bars.map((bar) => {
      const delta = (bar.buyVolume ?? 0) - (bar.sellVolume ?? 0);
      cumulative += delta;
      return cumulative;
    });
  },
  computeExtents: (values2) => numericExtent(values2),
  yAxis: "right",
  render: () => void 0
};
var cvd_default = CVD;

// src/lib/indicators/index.ts
registerIndicator(ema_default);
registerIndicator(sma_default);
registerIndicator(rsi_default);
registerIndicator(macd_default);
registerIndicator(bollinger_default);
registerIndicator(volume_default);
registerIndicator(cvd_default);

// src/lib/core/scales/computeScales.ts
function finiteExtent(values2) {
  const finiteValues = values2.filter((value) => Number.isFinite(value));
  if (finiteValues.length === 0) {
    return [0, 1];
  }
  const minValue = Math.min(...finiteValues);
  const maxValue = Math.max(...finiteValues);
  if (minValue === maxValue) {
    return [minValue - 1, maxValue + 1];
  }
  return [minValue, maxValue];
}
function mergeExtents(extents) {
  if (extents.length === 0) {
    return [0, 1];
  }
  const flattened = extents.flatMap(([minValue, maxValue]) => [minValue, maxValue]);
  return finiteExtent(flattened);
}
function collectAxisExtents(pane, data, axis) {
  return pane.indicators.filter((indicator) => (indicator.yAxis ?? "left") === axis).map((indicator) => {
    const definition = getIndicator(indicator.name);
    if (!definition?.computeExtents) {
      return void 0;
    }
    const computed = definition.compute(data, ...indicator.params ?? []);
    const extents = definition.computeExtents(computed);
    return finiteExtent(Array.isArray(extents) ? [...extents] : []);
  }).filter((extent2) => Boolean(extent2));
}
function computeScales(pane, data, canvasHeight) {
  const leftSeriesExtents = collectAxisExtents(pane, data, "left");
  const leftValues = leftSeriesExtents.length > 0 ? mergeExtents(leftSeriesExtents) : finiteExtent(data.flatMap((bar) => [bar.low, bar.high]));
  const leftScale = d3Scale.scaleLinear().domain(leftValues).range([canvasHeight, 0]).nice();
  const hasRightAxis = Boolean(pane.rightAxis) || pane.indicators.some((indicator) => indicator.yAxis === "right");
  if (!hasRightAxis) {
    return { leftScale };
  }
  const rightSeriesExtents = collectAxisExtents(pane, data, "right");
  const rightValues = rightSeriesExtents.length > 0 ? mergeExtents(rightSeriesExtents) : finiteExtent(data.map((bar) => bar.volume));
  const rightScale = d3Scale.scaleLinear().domain(rightValues).range([canvasHeight, canvasHeight * 0.75]).nice();
  return { leftScale, rightScale };
}
function ChartPane({ pane, children, className, style, ...rest }) {
  const { data } = useDataContext();
  const mainCanvasRef = React.useRef(null);
  const overlayCanvasRef = React.useRef(null);
  const { ref: containerRef, size } = useCanvasResize();
  const resolvedHeight = Math.max(size.height, pane.heightPx ?? 240, pane.minHeightPx ?? 40);
  const resolvedWidth = Math.max(size.width, 1);
  const chartScales = React.useMemo(() => computeScales(pane, data, resolvedHeight), [data, pane, resolvedHeight]);
  const syncValue = {
    pane,
    data,
    visibleData: data,
    width: resolvedWidth,
    height: resolvedHeight,
    leftScale: chartScales.leftScale,
    rightScale: chartScales.rightScale
  };
  const mergedStyle = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    minHeight: pane.minHeightPx ?? 40,
    height: pane.heightPx ? pane.heightPx : pane.heightPercent ? `${Math.round(pane.heightPercent * 100)}%` : void 0,
    overflow: "hidden",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: 8,
    border: "1px solid rgba(148, 163, 184, 0.18)",
    ...style
  };
  return /* @__PURE__ */ jsxRuntime.jsx("section", { ...rest, ref: containerRef, className, style: mergedStyle, "data-pane-id": pane.id, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { position: "relative", flex: "1 1 auto", minHeight: 0 }, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "canvas",
      {
        ref: mainCanvasRef,
        width: resolvedWidth,
        height: resolvedHeight,
        "aria-hidden": "true",
        style: { position: "absolute", inset: 0, width: "100%", height: "100%" }
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "canvas",
      {
        ref: overlayCanvasRef,
        width: resolvedWidth,
        height: resolvedHeight,
        "aria-hidden": "true",
        style: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(ChartSyncProvider, { value: syncValue, children })
  ] }) });
}
function clamp(value, minValue, maxValue) {
  return Math.min(Math.max(value, minValue), maxValue);
}
function PaneSplitter({ onResize, minTopHeight = 40, minBottomHeight = 40, className, style }) {
  const dragStateRef = React.useRef(null);
  const handlePointerDown = (event) => {
    const splitterElement = event.currentTarget;
    const topPaneElement = splitterElement.previousElementSibling;
    const bottomPaneElement = splitterElement.nextElementSibling;
    if (!topPaneElement) {
      return;
    }
    const startTopHeight = topPaneElement.getBoundingClientRect().height;
    const availableHeight = startTopHeight + (bottomPaneElement?.getBoundingClientRect().height ?? 0);
    dragStateRef.current = {
      startY: event.clientY,
      startTopHeight,
      maxTopHeight: Math.max(minTopHeight, availableHeight - minBottomHeight)
    };
    const handleMove = (moveEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState) {
        return;
      }
      const deltaY = moveEvent.clientY - dragState.startY;
      const nextHeight = clamp(dragState.startTopHeight + deltaY, minTopHeight, dragState.maxTopHeight);
      onResize(nextHeight);
    };
    const handleUp = () => {
      dragStateRef.current = null;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp, { once: true });
    splitterElement.setPointerCapture(event.pointerId);
  };
  const mergedStyle = {
    cursor: "row-resize",
    height: 8,
    flex: "0 0 auto",
    touchAction: "none",
    background: "linear-gradient(90deg, transparent, rgba(120, 130, 150, 0.6), transparent)",
    ...style
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      role: "separator",
      "aria-orientation": "horizontal",
      tabIndex: 0,
      className,
      style: mergedStyle,
      onPointerDown: handlePointerDown
    }
  );
}
var PaneManagerContext = React.createContext(void 0);
function PaneManagerProvider({ value, children }) {
  return React.createElement(PaneManagerContext.Provider, { value }, children);
}
var paneIdSeed = 0;
function createPaneId() {
  paneIdSeed += 1;
  return `pane-${paneIdSeed}`;
}
function normalizePane(input) {
  return {
    ...input,
    id: input.id ?? createPaneId(),
    indicators: input.indicators ?? []
  };
}
function clampHeight(pane, heightPx) {
  return Math.max(pane.minHeightPx ?? 40, heightPx);
}
function paneManagerReducer(state, action) {
  switch (action.type) {
    case "addPane":
      return [...state, normalizePane(action.pane)];
    case "removePane":
      return state.filter((pane) => pane.id !== action.paneId);
    case "resizePane":
      return state.map((pane) => pane.id === action.paneId ? { ...pane, heightPx: clampHeight(pane, action.heightPx) } : pane);
    case "addIndicator":
      return state.map((pane) => pane.id === action.paneId ? { ...pane, indicators: [...pane.indicators, action.indicator] } : pane);
    case "removeIndicator":
      return state.map((pane) => pane.id === action.paneId ? { ...pane, indicators: pane.indicators.filter((indicator) => indicator.name !== action.indicatorName) } : pane);
    case "updateIndicator":
      return state.map((pane) => pane.id === action.paneId ? {
        ...pane,
        indicators: pane.indicators.map((indicator) => indicator.name === action.indicatorName ? { ...indicator, ...action.patch } : indicator)
      } : pane);
    default:
      return state;
  }
}
function usePaneManager(initialPanes = []) {
  const [panes, dispatch] = React.useReducer(paneManagerReducer, initialPanes, (seed) => seed.map(normalizePane));
  const addPane = React.useCallback((pane) => {
    const normalizedPane = normalizePane(pane);
    dispatch({ type: "addPane", pane: normalizedPane });
    return normalizedPane.id;
  }, []);
  const removePane = React.useCallback((paneId) => {
    dispatch({ type: "removePane", paneId });
  }, []);
  const resizePane = React.useCallback((paneId, heightPx) => {
    dispatch({ type: "resizePane", paneId, heightPx });
  }, []);
  const addIndicator = React.useCallback((paneId, indicator) => {
    dispatch({ type: "addIndicator", paneId, indicator });
  }, []);
  const removeIndicator = React.useCallback((paneId, indicatorName) => {
    dispatch({ type: "removeIndicator", paneId, indicatorName });
  }, []);
  const updateIndicator = React.useCallback((paneId, indicatorName, patch) => {
    dispatch({ type: "updateIndicator", paneId, indicatorName, patch });
  }, []);
  return {
    panes,
    addPane,
    removePane,
    resizePane,
    addIndicator,
    removeIndicator,
    updateIndicator
  };
}
function ChartTerminal({ data, panes, adapter, children, className, style, ...rest }) {
  const paneState = usePaneManager(panes);
  const mergedStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    width: "100%",
    height: "100%",
    minHeight: 0,
    ...style
  };
  return /* @__PURE__ */ jsxRuntime.jsx(PaneManagerProvider, { value: paneState, children: /* @__PURE__ */ jsxRuntime.jsx(DataProvider, { value: { data, adapter }, children: /* @__PURE__ */ jsxRuntime.jsxs("section", { ...rest, className, style: mergedStyle, children: [
    paneState.panes.map((pane, index) => /* @__PURE__ */ jsxRuntime.jsxs(React.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ChartPane, { pane }),
      index < paneState.panes.length - 1 ? /* @__PURE__ */ jsxRuntime.jsx(PaneSplitter, { onResize: (heightPx) => paneState.resizePane(pane.id, heightPx) }) : null
    ] }, pane.id)),
    children
  ] }) }) });
}

// src/lib/adapters/BaseAdapter.ts
var BaseAdapter = class {
  constructor(baseUrl = "", cacheTtlMs = 1e3) {
    this.baseUrl = baseUrl;
    this.cacheTtlMs = cacheTtlMs;
  }
  baseUrl;
  cacheTtlMs;
  requestCache = /* @__PURE__ */ new Map();
  buildUrl(path2) {
    const fallbackOrigin = typeof globalThis.location !== "undefined" ? globalThis.location.origin : "http://localhost";
    return new URL(path2, this.baseUrl || fallbackOrigin).toString();
  }
  buildWebSocketUrl(path2) {
    const url = new URL(path2, this.baseUrl || (typeof globalThis.location !== "undefined" ? globalThis.location.origin : "http://localhost"));
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return url.toString();
  }
  async requestJson(path2, init) {
    const response = await fetch(this.buildUrl(path2), init);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }
  memoize(cacheKey, loader) {
    const cached = this.requestCache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }
    const value = loader().catch((error) => {
      this.requestCache.delete(cacheKey);
      throw error;
    });
    this.requestCache.set(cacheKey, {
      expiresAt: now + this.cacheTtlMs,
      value
    });
    return value;
  }
  normalizeBar(rawBar, fallbackIndex) {
    const rawDate = rawBar.date;
    return {
      ...rawBar,
      date: rawDate instanceof Date ? rawDate : new Date(rawDate),
      index: rawBar.index ?? fallbackIndex,
      dataIndex: rawBar.dataIndex ?? fallbackIndex
    };
  }
  normalizeBars(rawBars) {
    return rawBars.map((rawBar, index) => this.normalizeBar(rawBar, index));
  }
};

// src/lib/adapters/DjangoVnstockAdapter.ts
function normalizeTrade(symbol, payload) {
  const rawTrade = payload;
  return {
    symbol,
    price: rawTrade.price ?? 0,
    size: rawTrade.size ?? 0,
    timestamp: rawTrade.timestamp instanceof Date ? rawTrade.timestamp : new Date(rawTrade.timestamp ?? Date.now()),
    side: rawTrade.side ?? "unknown"
  };
}
function normalizeOrderbook(payload) {
  const rawSnapshot = payload;
  return {
    bids: rawSnapshot.bids ?? [],
    asks: rawSnapshot.asks ?? [],
    timestamp: rawSnapshot.timestamp instanceof Date ? rawSnapshot.timestamp : new Date(rawSnapshot.timestamp ?? Date.now())
  };
}
var DjangoVnstockAdapter = class extends BaseAdapter {
  constructor(baseUrl = "", cacheTtlMs = 1e3) {
    super(baseUrl, cacheTtlMs);
  }
  async fetchBars(symbol, timeframe, from, to) {
    const cacheKey = `bars:${symbol}:${timeframe}:${from.toISOString()}:${to.toISOString()}`;
    return this.memoize(cacheKey, async () => {
      const params = new URLSearchParams({
        tf: timeframe,
        from: from.toISOString(),
        to: to.toISOString()
      });
      const rawBars = await this.requestJson(`/api/bars/${symbol}/?${params}`);
      return this.normalizeBars(rawBars);
    });
  }
  async fetchMoreBars(symbol, timeframe, before, limit = 300) {
    const cacheKey = `more-bars:${symbol}:${timeframe}:${before.toISOString()}:${limit}`;
    return this.memoize(cacheKey, async () => {
      const params = new URLSearchParams({
        tf: timeframe,
        before: before.toISOString(),
        limit: String(limit)
      });
      const rawBars = await this.requestJson(`/api/bars/${symbol}/?${params}`);
      return this.normalizeBars(rawBars);
    });
  }
  subscribeToBar(symbol, timeframe, onBar) {
    const socket = new WebSocket(this.buildWebSocketUrl(`/ws/bars/${symbol}/${timeframe}/`));
    socket.onmessage = (event) => {
      const rawBar = JSON.parse(event.data);
      onBar(this.normalizeBar(rawBar, rawBar.index ?? 0));
    };
    return () => socket.close();
  }
  subscribeToTrades(symbol, onTrade) {
    const socket = new WebSocket(this.buildWebSocketUrl(`/ws/trades/${symbol}/`));
    socket.onmessage = (event) => {
      onTrade(normalizeTrade(symbol, JSON.parse(event.data)));
    };
    return () => socket.close();
  }
  subscribeToOrderbook(symbol, onUpdate) {
    const socket = new WebSocket(this.buildWebSocketUrl(`/ws/orderbook/${symbol}/`));
    socket.onmessage = (event) => {
      onUpdate(normalizeOrderbook(JSON.parse(event.data)));
    };
    return () => socket.close();
  }
  async searchSymbols(query) {
    const params = new URLSearchParams({ q: query });
    return this.requestJson(`/api/symbols/search/?${params}`);
  }
};
function createRestAdapter(baseUrl = "") {
  return new DjangoVnstockAdapter(baseUrl);
}

// src/lib/adapters/MockAdapter.ts
function createSampleBars(count) {
  const bars = [];
  let close = 100;
  for (let index = 0; index < count; index += 1) {
    const drift = Math.sin(index / 6) * 1.4;
    const open = close;
    close = Number((close + drift).toFixed(2));
    const high = Math.max(open, close) + 1.5;
    const low = Math.min(open, close) - 1.5;
    bars.push({
      date: new Date(Date.UTC(2024, 0, index + 1)),
      open,
      high,
      low,
      close,
      volume: 1e3 + index * 25,
      index,
      dataIndex: index
    });
  }
  return bars;
}
function cloneBar(bar, index) {
  return {
    ...bar,
    date: new Date(bar.date),
    index,
    dataIndex: index
  };
}
var MockAdapter = class {
  bars;
  symbols;
  intervalMs;
  constructor(options = {}) {
    this.bars = [...options.bars ?? createSampleBars(240)];
    this.symbols = options.symbols ?? [
      { symbol: "VCB", name: "Vietcombank", exchange: "HOSE" },
      { symbol: "FPT", name: "FPT Corporation", exchange: "HOSE" },
      { symbol: "MBB", name: "Military Bank", exchange: "HOSE" }
    ];
    this.intervalMs = options.intervalMs ?? 1e3;
  }
  async fetchBars(symbol, timeframe, from, to) {
    return this.bars.filter((bar) => bar.date >= from && bar.date <= to).map((bar, index) => cloneBar(bar, index));
  }
  async fetchMoreBars(symbol, timeframe, before, limit = 300) {
    return this.bars.filter((bar) => bar.date < before).slice(-limit).map((bar, index) => cloneBar(bar, index));
  }
  subscribeToBar(symbol, timeframe, onBar) {
    let cursor = 0;
    const emitNext = () => {
      if (this.bars.length === 0) {
        return;
      }
      const bar = cloneBar(this.bars[cursor % this.bars.length], cursor);
      onBar(bar);
      cursor += 1;
    };
    emitNext();
    const timerId = setInterval(emitNext, this.intervalMs);
    return () => clearInterval(timerId);
  }
  subscribeToTrades(symbol, onTrade) {
    if (this.bars.length === 0) {
      return () => void 0;
    }
    let tradeIndex = 0;
    const emitTrade = () => {
      const bar = this.bars[tradeIndex % this.bars.length];
      onTrade({
        symbol,
        price: bar.close,
        size: Math.max(1, Math.round(bar.volume / 100)),
        timestamp: new Date(bar.date),
        side: tradeIndex % 2 === 0 ? "buy" : "sell"
      });
      tradeIndex += 1;
    };
    emitTrade();
    const timerId = setInterval(emitTrade, this.intervalMs);
    return () => clearInterval(timerId);
  }
  subscribeToOrderbook(symbol, onUpdate) {
    if (this.bars.length === 0) {
      return () => void 0;
    }
    let snapshotIndex = 0;
    const emitSnapshot = () => {
      const bar = this.bars[snapshotIndex % this.bars.length];
      onUpdate({
        timestamp: new Date(bar.date),
        bids: [
          { price: bar.close - 0.5, size: 100 },
          { price: bar.close - 1, size: 80 }
        ],
        asks: [
          { price: bar.close + 0.5, size: 95 },
          { price: bar.close + 1, size: 75 }
        ]
      });
      snapshotIndex += 1;
    };
    emitSnapshot();
    const timerId = setInterval(emitSnapshot, this.intervalMs);
    return () => clearInterval(timerId);
  }
  async searchSymbols(query) {
    const normalizedQuery = query.trim().toUpperCase();
    if (!normalizedQuery) {
      return this.symbols;
    }
    return this.symbols.filter((symbol) => symbol.symbol.includes(normalizedQuery) || (symbol.name?.toUpperCase() ?? "").includes(normalizedQuery));
  }
};
function createMockBars(count = 240) {
  return createSampleBars(count);
}

// src/lib/drawing/registry.ts
var drawingToolRegistry = /* @__PURE__ */ new Map();
function registerDrawingTool(tool) {
  drawingToolRegistry.set(tool.name, tool);
  return tool;
}
function createTool(name) {
  const tool = drawingToolRegistry.get(name);
  if (!tool) {
    throw new Error(`Missing drawing tool: ${name}`);
  }
  return tool;
}
function listDrawingTools() {
  return [...drawingToolRegistry.values()];
}
function isDrawingToolName(name) {
  return drawingToolRegistry.has(name);
}
function createDraftFromTool(name, startPoint) {
  return createTool(name).createDraft(startPoint);
}

// src/lib/drawing/stateMachine.ts
function drawingReducer(state, action) {
  switch (action.type) {
    case "START_DRAWING":
      return {
        type: "drawing",
        toolName: action.toolName,
        object: action.object
      };
    case "UPDATE_DRAWING":
      return state.type === "drawing" ? {
        ...state,
        object: action.object
      } : state;
    case "COMPLETE_DRAWING":
      return {
        type: "complete",
        object: action.object
      };
    case "SELECT_OBJECT":
      return {
        type: "selected",
        objectId: action.objectId
      };
    case "START_MOVING":
      return {
        type: "moving",
        objectId: action.objectId,
        startPoint: action.startPoint,
        currentPoint: action.currentPoint
      };
    case "START_RESIZING":
      return {
        type: "resizing",
        objectId: action.objectId,
        handle: action.handle
      };
    case "START_EDITING":
      return {
        type: "editing",
        objectId: action.objectId,
        text: action.text ?? ""
      };
    case "CANCEL":
      return { type: "idle" };
    default:
      return state;
  }
}

// src/lib/drawing/history.ts
function cloneDrawings(drawings) {
  return drawings.map((drawing) => ({
    ...drawing,
    points: drawing.points.map((point) => ({ ...point })),
    style: { ...drawing.style }
  }));
}
function createDrawingHistory(drawings = []) {
  return {
    past: [],
    present: cloneDrawings(drawings),
    future: []
  };
}
function historyReducer(state, action) {
  switch (action.type) {
    case "PUSH":
      return {
        past: [...state.past, cloneDrawings(state.present)],
        present: [...state.present, action.drawing],
        future: []
      };
    case "REPLACE":
      return {
        past: [...state.past, cloneDrawings(state.present)],
        present: cloneDrawings(action.drawings),
        future: []
      };
    case "UNDO": {
      if (state.past.length === 0) {
        return state;
      }
      const nextPast = state.past.slice(0, -1);
      const previousPresent = state.past[state.past.length - 1];
      return {
        past: nextPast,
        present: cloneDrawings(previousPresent),
        future: [cloneDrawings(state.present), ...state.future]
      };
    }
    case "REDO": {
      if (state.future.length === 0) {
        return state;
      }
      const [nextPresent, ...remainingFuture] = state.future;
      return {
        past: [...state.past, cloneDrawings(state.present)],
        present: cloneDrawings(nextPresent),
        future: remainingFuture
      };
    }
    case "CLEAR":
      return {
        past: [...state.past, cloneDrawings(state.present)],
        present: [],
        future: []
      };
    default:
      return state;
  }
}

// src/lib/drawing/serialization.ts
function serializeDrawingObject(drawing) {
  return JSON.stringify(drawing);
}
function deserializeDrawingObject(payload) {
  return JSON.parse(payload);
}
function serializeDrawings(drawings) {
  return JSON.stringify(drawings);
}
function deserializeDrawings(payload) {
  return JSON.parse(payload);
}
function serializeDrawingHistory(history) {
  return JSON.stringify(history);
}
function deserializeDrawingHistory(payload) {
  return JSON.parse(payload);
}

// src/lib/drawing/shared.ts
var drawingIdSeed = 0;
function createDrawingId() {
  drawingIdSeed += 1;
  return `drawing-${drawingIdSeed}`;
}
var defaultDrawingStyle = {
  stroke: "#111827",
  strokeWidth: 1,
  strokeDasharray: "Solid",
  fill: "transparent",
  opacity: 1
};
function createDrawingObject(type, points, patch = {}) {
  const now = Date.now();
  return {
    id: patch.id ?? createDrawingId(),
    type,
    points,
    style: patch.style ? { ...defaultDrawingStyle, ...patch.style } : defaultDrawingStyle,
    text: patch.text,
    extendLeft: patch.extendLeft,
    extendRight: patch.extendRight,
    locked: patch.locked,
    visible: patch.visible ?? true,
    createdAt: patch.createdAt ?? now,
    updatedAt: patch.updatedAt ?? now
  };
}
function replacePoint(object, index, nextPoint) {
  return {
    ...object,
    points: object.points.map((point, pointIndex) => pointIndex === index ? nextPoint : point),
    updatedAt: Date.now()
  };
}

// src/lib/drawing/builtin/trendLine.ts
var TrendLine = {
  name: "trendLine",
  createDraft: (startPoint) => createDrawingObject("trendLine", [startPoint, startPoint]),
  updateDraft: (draft, nextPoint) => replacePoint(draft, 1, nextPoint),
  render: () => void 0
};
var trendLine_default = TrendLine;

// src/lib/drawing/builtin/hLine.ts
var HLine = {
  name: "hLine",
  createDraft: (startPoint) => createDrawingObject("hLine", [startPoint, { ...startPoint }], { extendLeft: true, extendRight: true }),
  updateDraft: (draft, nextPoint) => replacePoint(draft, 1, { x: nextPoint.x, y: draft.points[0]?.y ?? nextPoint.y }),
  render: () => void 0
};
var hLine_default = HLine;

// src/lib/drawing/builtin/vLine.ts
var VLine = {
  name: "vLine",
  createDraft: (startPoint) => createDrawingObject("vLine", [startPoint, { ...startPoint }], { extendLeft: false, extendRight: false }),
  updateDraft: (draft, nextPoint) => replacePoint(draft, 1, { x: draft.points[0]?.x ?? nextPoint.x, y: nextPoint.y }),
  render: () => void 0
};
var vLine_default = VLine;

// src/lib/drawing/builtin/fibonacci.ts
var Fibonacci = {
  name: "fibonacci",
  createDraft: (startPoint) => createDrawingObject("fibonacci", [startPoint, startPoint]),
  updateDraft: (draft, nextPoint) => replacePoint(draft, 1, nextPoint),
  render: () => void 0
};
var fibonacci_default = Fibonacci;

// src/lib/drawing/builtin/channel.ts
var Channel = {
  name: "channel",
  createDraft: (startPoint) => createDrawingObject("channel", [startPoint, startPoint, startPoint]),
  updateDraft: (draft, nextPoint) => replacePoint(draft, 1, nextPoint),
  render: () => void 0
};
var channel_default = Channel;

// src/lib/drawing/builtin/text.ts
var Text = {
  name: "text",
  createDraft: (startPoint) => createDrawingObject("text", [startPoint], { text: "" }),
  updateDraft: (draft, nextPoint) => {
    if (draft.points.length === 0) {
      return createDrawingObject("text", [nextPoint], { ...draft, text: draft.text ?? "" });
    }
    return replacePoint(draft, 0, nextPoint);
  },
  render: () => void 0
};
var text_default = Text;

// src/lib/drawing/index.ts
registerDrawingTool(trendLine_default);
registerDrawingTool(hLine_default);
registerDrawingTool(vLine_default);
registerDrawingTool(fibonacci_default);
registerDrawingTool(channel_default);
registerDrawingTool(text_default);

// src/index.ts
var version = "0.7.8";

exports.BackgroundText = BackgroundText_default;
exports.BaseAdapter = BaseAdapter;
exports.Chart = Chart_default;
exports.ChartCanvas = ChartCanvas_default;
exports.ChartPane = ChartPane;
exports.ChartTerminal = ChartTerminal;
exports.DjangoVnstockAdapter = DjangoVnstockAdapter;
exports.GenericChartComponent = GenericChartComponent_default;
exports.GenericComponent = GenericComponent_default;
exports.MockAdapter = MockAdapter;
exports.PaneSplitter = PaneSplitter;
exports.ZoomButtons = ZoomButtons_default;
exports.createDraftFromTool = createDraftFromTool;
exports.createDrawingHistory = createDrawingHistory;
exports.createDrawingTool = createTool;
exports.createMockBars = createMockBars;
exports.createRestAdapter = createRestAdapter;
exports.deserializeDrawingHistory = deserializeDrawingHistory;
exports.deserializeDrawingObject = deserializeDrawingObject;
exports.deserializeDrawings = deserializeDrawings;
exports.drawingReducer = drawingReducer;
exports.getIndicator = getIndicator;
exports.historyReducer = historyReducer;
exports.isDrawingToolName = isDrawingToolName;
exports.listDrawingTools = listDrawingTools;
exports.registerDrawingTool = registerDrawingTool;
exports.registerIndicator = registerIndicator;
exports.serializeDrawingHistory = serializeDrawingHistory;
exports.serializeDrawingObject = serializeDrawingObject;
exports.serializeDrawings = serializeDrawings;
exports.usePaneManager = usePaneManager;
exports.version = version;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map