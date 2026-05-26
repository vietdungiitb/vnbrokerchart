// @vitest-environment jsdom
import type { ReactElement } from "react";
import { scaleLinear, scaleTime } from "d3-scale";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const reactActEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
const originalConsoleError = console.error;
console.error = (..._args: unknown[]) => {};

vi.mock("../../lib/core/hooks/useCanvasResize", () => {
	const ref = { current: null as HTMLDivElement | null };
	return {
		useCanvasResize: () => ({
			ref,
			size: { width: 1200, height: 720 },
		}),
	};
});

let capturedGenericChartComponentProps: any[] = [];

vi.mock("../../lib/GenericChartComponent", async () => {
	const actual = await vi.importActual<typeof import("../../lib/GenericChartComponent")>("../../lib/GenericChartComponent");
	return {
		...actual,
		default: (props: any) => {
			capturedGenericChartComponentProps.push(props);
			return null;
		},
	};
});

let act: typeof import("react").act;
let createRoot: typeof import("react-dom/client").createRoot;
let VNBrokerChart: typeof import("../VNBrokerChart").VNBrokerChart;
let WidgetErrorBoundary: typeof import("../WidgetErrorBoundary").WidgetErrorBoundary;
let WidgetI18nProvider: typeof import("../context/WidgetI18nContext").WidgetI18nProvider;

beforeAll(async () => {
	({ act } = await import("react"));
	({ createRoot } = await import("react-dom/client"));
	({ VNBrokerChart } = await import("../VNBrokerChart"));
	({ WidgetErrorBoundary } = await import("../WidgetErrorBoundary"));
	({ WidgetI18nProvider } = await import("../context/WidgetI18nContext"));
});

type Deferred<T> = {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (reason?: unknown) => void;
};

function createDeferred<T>(): Deferred<T> {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((promiseResolve, promiseReject) => {
		resolve = promiseResolve;
		reject = promiseReject;
	});
	return { promise, resolve, reject };
}

function createAdapter(fetchBarsPromise: Promise<any[]>, label: string) {
	return {
		fetchBars: vi.fn().mockReturnValue(fetchBarsPromise),
		fetchMoreBars: vi.fn().mockResolvedValue([]),
		subscribeToBar: vi.fn().mockReturnValue(() => {}),
		subscribeToTrades: vi.fn().mockReturnValue(() => {}),
		subscribeToOrderbook: vi.fn().mockReturnValue(() => {}),
		searchSymbols: vi.fn().mockResolvedValue([]),
		label,
	};
}

function createBars(count: number) {
	return Array.from({ length: count }, (_, index) => {
		const date = new Date(Date.UTC(2026, 0, index + 1));
		const base = 100 + index;
		return {
			date,
			open: base,
			high: base + 3,
			low: base - 2,
			close: base + 1,
			volume: 1_000 + index * 10,
			index,
			dataIndex: index,
		};
	});
}

function isDrawingLayerProps(props: any) {
	return Array.isArray(props?.drawOn)
		&& props.drawOn.join(",") === "mousemove,click,drag,dragend,pan,zoom"
		&& typeof props.onMouseDown === "function"
		&& typeof props.onMouseMove === "function"
		&& typeof props.onClick === "function"
		&& typeof props.onDragStart === "function"
		&& typeof props.onDrag === "function"
		&& typeof props.onDragComplete === "function";
}

function getLatestDrawingLayerProps() {
	const drawingLayerProps = [...capturedGenericChartComponentProps].reverse().find(isDrawingLayerProps);
	if (!drawingLayerProps) {
		throw new Error("Unable to find DrawingLayer props");
	}
	return drawingLayerProps;
}

describe("VNBrokerChart", () => {
	let container: HTMLDivElement | null = null;
	let root: ReturnType<typeof createRoot> | null = null;
	let abortSpy: any = null;

	beforeEach(() => {
		window.localStorage.clear();
		document.documentElement.lang = "en";
		abortSpy = vi.spyOn(AbortController.prototype, "abort");
		capturedGenericChartComponentProps = [];
	});

	afterEach(() => {
		root?.unmount();
		root = null;
		container?.remove();
		container = null;
		abortSpy?.mockRestore();
		abortSpy = null;
		window.localStorage.clear();
		document.documentElement.lang = "en";
	});

	afterAll(() => {
		console.error = originalConsoleError;
	});

	it("shows the loading and empty states when no bars are available", async () => {
		const fetchDeferred = createDeferred<any[]>();
		const adapter = createAdapter(fetchDeferred.promise, "empty");

		container = document.createElement("div");
		container.style.width = "1200px";
		container.style.height = "720px";
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(<VNBrokerChart adapter={adapter as never} locale="vi" />);
		});

		expect(container.textContent).toContain("Đang tải biểu đồ…");

		await act(async () => {
			fetchDeferred.resolve([]);
			await Promise.resolve();
		});

		expect(container.textContent).toContain("Chưa có dữ liệu");
		expect(adapter.fetchBars).toHaveBeenCalledTimes(1);
	});

	it("aborts the in-flight fetch when adapter changes", async () => {
		const firstFetch = createDeferred<any[]>();
		const secondFetch = createDeferred<any[]>();
		const firstAdapter = createAdapter(firstFetch.promise, "first");
		const secondAdapter = createAdapter(secondFetch.promise, "second");

		container = document.createElement("div");
		container.style.width = "1200px";
		container.style.height = "720px";
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(<VNBrokerChart adapter={firstAdapter as never} locale="en" />);
		});

		await act(async () => {
			root?.render(<VNBrokerChart adapter={secondAdapter as never} locale="en" />);
		});

		expect(abortSpy?.mock.calls.length ?? 0).toBeGreaterThan(0);

		await act(async () => {
			firstFetch.resolve([]);
			secondFetch.resolve([]);
			await Promise.resolve();
		});
	});

	it("renders the error boundary fallback when the chart subtree throws", async () => {
		function ThrowingChild(): ReactElement {
			throw new Error("boom");
		}

		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(
				<WidgetI18nProvider locale="en">
					<WidgetErrorBoundary>
						<ThrowingChild />
					</WidgetErrorBoundary>
				</WidgetI18nProvider>,
			);
		});

		expect(container.textContent).toContain("An error occurred in the chart");
	});

	it("normalizes visible range dates for discontinuous scales", async () => {
		const adapter = createAdapter(Promise.resolve([]), "external-data");
		const bars = createBars(32);
		const onVisibleRangeChange = vi.fn();

		container = document.createElement("div");
		container.style.width = "1200px";
		container.style.height = "720px";
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(
				<VNBrokerChart
					adapter={adapter as never}
					data={bars}
					locale="en"
					showNonTradingDays={false}
					xExtents={[bars[8].date, bars[18].date]}
					onVisibleRangeChange={onVisibleRangeChange}
				/>,
			);
		});

		onVisibleRangeChange.mockClear();

		await act(async () => {
			root?.render(
				<VNBrokerChart
					adapter={adapter as never}
					data={bars}
					locale="en"
					showNonTradingDays={false}
					xExtents={[bars[5].date, bars[15].date]}
					onVisibleRangeChange={onVisibleRangeChange}
				/>,
			);
		});

		expect(onVisibleRangeChange).toHaveBeenCalledTimes(1);
		expect(onVisibleRangeChange).toHaveBeenCalledWith(expect.objectContaining({
			startDate: bars[5].date,
			endDate: bars[15].date,
			startIndex: 5,
			endIndex: 15,
			barCount: 11,
		}));
	});

	it("hydrates drawing runtime state from storage and emits drawing callbacks", async () => {
		const adapter = createAdapter(Promise.resolve([]), "external-data");
		const bars = createBars(24);
		const onDrawingChange = vi.fn();
		const onSelectionChange = vi.fn();
		const drawing = {
			id: "trend-1",
			type: "trendLine" as const,
			points: [
				{ x: bars[3].date.getTime(), y: 104 },
				{ x: bars[12].date.getTime(), y: 112 },
			],
			style: {
				stroke: "#ef4444",
				strokeWidth: 2,
			},
			createdAt: 1710000000000,
			updatedAt: 1710000000000,
		};

		window.localStorage.setItem("rsc-drawings-v1-BTCUSDT-1h", JSON.stringify([drawing]));

		container = document.createElement("div");
		container.style.width = "1200px";
		container.style.height = "720px";
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(
				<VNBrokerChart
					adapter={adapter as never}
					data={bars}
					locale="en"
					drawing={{
						onChange: onDrawingChange,
						onSelectionChange,
					}}
				/>,
			);
			await Promise.resolve();
		});

		expect(onDrawingChange).toHaveBeenCalled();
		expect(onDrawingChange.mock.calls.at(-1)?.[0]).toEqual(expect.arrayContaining([
			expect.objectContaining({
				id: "trend-1",
				type: "trendLine",
			}),
		]));
		expect(onSelectionChange).toHaveBeenCalledWith(null);
	});

	it("keeps initial drawings when no persisted cache exists", async () => {
		const adapter = createAdapter(Promise.resolve([]), "external-data");
		const bars = createBars(24);
		const onDrawingChange = vi.fn();
		const seedDrawing = {
			id: "seed-1",
			type: "rectangle" as const,
			points: [
				{ x: bars[2].date.getTime(), y: 101 },
				{ x: bars[10].date.getTime(), y: 109 },
			],
			style: {
				stroke: "#22c55e",
				strokeWidth: 2,
			},
			createdAt: 1710000000000,
			updatedAt: 1710000000000,
		};

		container = document.createElement("div");
		container.style.width = "1200px";
		container.style.height = "720px";
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(
				<VNBrokerChart
					adapter={adapter as never}
					data={bars}
					locale="en"
					drawing={{
						initialDrawings: [seedDrawing],
						onChange: onDrawingChange,
					}}
				/>,
			);
			await Promise.resolve();
		});

		expect(onDrawingChange).toHaveBeenCalled();
		expect(onDrawingChange.mock.calls.at(-1)?.[0]).toEqual(expect.arrayContaining([
			expect.objectContaining({
				id: "seed-1",
				type: "rectangle",
			}),
		]));
	});

	it("creates, selects, updates, and deletes drawings through widget runtime interactions", async () => {
		const adapter = createAdapter(Promise.resolve([]), "external-data");
		const bars = createBars(24);
		const onDrawingChange = vi.fn();
		const onSelectionChange = vi.fn();
		const chartConfig = {
			id: 1,
			paneId: "price",
			width: 400,
			height: 300,
			origin: [0, 0] as [number, number],
			yScale: scaleLinear().domain([0, 200]).range([300, 0]),
		};
		const xScale = scaleTime()
			.domain([bars[0].date, bars[bars.length - 1].date])
			.range([0, 400]);
		const xAccessor = (datum: { date: Date }) => datum.date;
		const makeMoreProps = (overrides: Record<string, unknown> = {}) => ({
			chartConfig,
			chartConfigList: [chartConfig],
			currentCharts: [1],
			xScale,
			xAccessor,
			plotData: bars,
			...overrides,
		});

		container = document.createElement("div");
		container.style.width = "1200px";
		container.style.height = "720px";
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(
				<VNBrokerChart
					adapter={adapter as never}
					data={bars}
					locale="en"
					drawing={{
						activeTool: "trendLine",
						onChange: onDrawingChange,
						onSelectionChange,
					}}
				/>,
			);
			await Promise.resolve();
		});

		const createProps = getLatestDrawingLayerProps();
		const createStart = [xScale(bars[5].date), chartConfig.yScale(120)] as [number, number];
		const createEnd = [xScale(bars[10].date), chartConfig.yScale(90)] as [number, number];

		await act(async () => {
			createProps.onMouseDown({
				mouseXY: createStart,
				startPos: createStart,
				chartConfig,
				chartConfigList: [chartConfig],
				currentCharts: [1],
				currentItem: bars[5],
				xScale,
				xAccessor,
				plotData: bars,
				event: { button: 0 },
			});
			await Promise.resolve();
		});

		const drawingPropsAfterMouseDown = getLatestDrawingLayerProps();

		await act(async () => {
			drawingPropsAfterMouseDown.onMouseMove({
				mouseXY: createEnd,
				chartConfig,
				chartConfigList: [chartConfig],
				currentCharts: [1],
				currentItem: bars[10],
				xScale,
				xAccessor,
				plotData: bars,
			});
			drawingPropsAfterMouseDown.onClick({
				mouseXY: createEnd,
				chartConfig,
				chartConfigList: [chartConfig],
				currentCharts: [1],
				currentItem: bars[10],
				xScale,
				xAccessor,
				plotData: bars,
				event: { shiftKey: false },
			});
			await Promise.resolve();
		});

		expect(onDrawingChange).toHaveBeenCalled();
		const createdDrawing = onDrawingChange.mock.calls.at(-1)?.[0]?.[0];
		expect(createdDrawing).toEqual(expect.objectContaining({
			id: expect.any(String),
			type: "trendLine",
		}));
		expect(onSelectionChange).toHaveBeenLastCalledWith(expect.objectContaining({
			id: createdDrawing.id,
			type: "trendLine",
		}));

		onDrawingChange.mockClear();
		onSelectionChange.mockClear();

		await act(async () => {
			root?.render(
				<VNBrokerChart
					adapter={adapter as never}
					data={bars}
					locale="en"
					drawing={{
						activeTool: "cursor",
						onChange: onDrawingChange,
						onSelectionChange,
					}}
				/>,
			);
			await Promise.resolve();
		});

		const cursorProps = getLatestDrawingLayerProps();
		const createdStartPixel = [xScale(createdDrawing.points[0].x), chartConfig.yScale(createdDrawing.points[0].y)] as [number, number];
		const createdEndPixel = [xScale(createdDrawing.points[1].x), chartConfig.yScale(createdDrawing.points[1].y)] as [number, number];
		const lineMidpoint = [
			(createdStartPixel[0] + createdEndPixel[0]) / 2,
			(createdStartPixel[1] + createdEndPixel[1]) / 2,
		] as [number, number];

		await act(async () => {
			cursorProps.onClick({
				mouseXY: [390, 20],
				chartConfig,
				chartConfigList: [chartConfig],
				currentCharts: [1],
				currentItem: bars[0],
				xScale,
				xAccessor,
				plotData: bars,
				event: { shiftKey: false },
			});
			await Promise.resolve();
		});

		const cursorPropsAfterDeselect = getLatestDrawingLayerProps();

		await act(async () => {
			cursorPropsAfterDeselect.onClick({
				mouseXY: lineMidpoint,
				chartConfig,
				chartConfigList: [chartConfig],
				currentCharts: [1],
				currentItem: bars[7],
				xScale,
				xAccessor,
				plotData: bars,
				event: { shiftKey: false },
			});
			await Promise.resolve();
		});

		expect(onSelectionChange).toHaveBeenLastCalledWith(expect.objectContaining({
			id: createdDrawing.id,
			type: "trendLine",
		}));

		onDrawingChange.mockClear();

			const cursorPropsAfterSelect = getLatestDrawingLayerProps();
		const dragStart = lineMidpoint;
		const dragEnd = [lineMidpoint[0] + 30, lineMidpoint[1] - 24] as [number, number];

		await act(async () => {
				cursorPropsAfterSelect.onMouseDown({
				mouseXY: dragStart,
				startPos: dragStart,
				chartConfig,
				chartConfigList: [chartConfig],
				currentCharts: [1],
				currentItem: bars[7],
				xScale,
				xAccessor,
				plotData: bars,
				event: { button: 0 },
			});
				cursorPropsAfterSelect.onDragStart({
				mouseXY: dragStart,
				startPos: dragStart,
				chartConfig,
				chartConfigList: [chartConfig],
				currentCharts: [1],
				currentItem: bars[7],
				xScale,
				xAccessor,
				plotData: bars,
			});
				cursorPropsAfterSelect.onDrag({
				mouseXY: dragEnd,
				startPos: dragStart,
				chartConfig,
				chartConfigList: [chartConfig],
				currentCharts: [1],
				currentItem: bars[9],
				xScale,
				xAccessor,
				plotData: bars,
			});
				cursorPropsAfterSelect.onDragComplete({
				mouseXY: dragEnd,
				startPos: dragStart,
				chartConfig,
				chartConfigList: [chartConfig],
				currentCharts: [1],
				currentItem: bars[9],
				xScale,
				xAccessor,
				plotData: bars,
			});
			await Promise.resolve();
		});

		const updatedDrawing = onDrawingChange.mock.calls.at(-1)?.[0]?.[0];
		expect(updatedDrawing).toEqual(expect.objectContaining({
			id: createdDrawing.id,
			type: "trendLine",
		}));
		expect(updatedDrawing.updatedAt).toBeGreaterThan(createdDrawing.updatedAt);
		expect(updatedDrawing.points).not.toEqual(createdDrawing.points);

		await act(async () => {
			window.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete", bubbles: true }));
			await Promise.resolve();
		});

		expect(onDrawingChange.mock.calls.at(-1)?.[0]).toEqual([]);
		expect(onSelectionChange).toHaveBeenLastCalledWith(null);
	});

	it("emits drawing alerts when the latest bar crosses a configured line", async () => {
		const adapter = createAdapter(Promise.resolve([]), "external-data");
		const initialBars = [
			{
				date: new Date(Date.UTC(2026, 0, 1)),
				open: 100,
				high: 103,
				low: 99,
				close: 102,
				volume: 1_000,
				index: 0,
				dataIndex: 0,
			},
			{
				date: new Date(Date.UTC(2026, 0, 2)),
				open: 102,
				high: 104,
				low: 101,
				close: 104,
				volume: 1_010,
				index: 1,
				dataIndex: 1,
			},
		] as const;
		const nextBars = [
			...initialBars,
			{
				date: new Date(Date.UTC(2026, 0, 3)),
				open: 104,
				high: 108,
				low: 103,
				close: 107,
				volume: 1_020,
				index: 2,
				dataIndex: 2,
			},
		];
		const onAlert = vi.fn();
		const alertDrawing = {
			id: "alert-line-1",
			type: "hLine" as const,
			points: [
				{ x: initialBars[0].date.getTime(), y: 105 },
				{ x: initialBars[1].date.getTime(), y: 105 },
			],
			style: {
				stroke: "#ef4444",
				strokeWidth: 2,
			},
			alert: {
				enabled: true,
				trigger: "closeAbove" as const,
			},
			createdAt: 1710000000000,
			updatedAt: 1710000000000,
		};

		container = document.createElement("div");
		container.style.width = "1200px";
		container.style.height = "720px";
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(
				<VNBrokerChart
					adapter={adapter as never}
					data={initialBars as never}
					symbol="VCB"
					timeframe="1d"
					locale="en"
					drawing={{
						initialDrawings: [alertDrawing],
						onAlert,
					}}
				/>,
			);
			await Promise.resolve();
		});

		expect(onAlert).not.toHaveBeenCalled();

		await act(async () => {
			root?.render(
				<VNBrokerChart
					adapter={adapter as never}
					data={nextBars as never}
					symbol="VCB"
					timeframe="1d"
					locale="en"
					drawing={{
						initialDrawings: [alertDrawing],
						onAlert,
					}}
				/>,
			);
			await Promise.resolve();
		});

		expect(onAlert).toHaveBeenCalledTimes(1);
		expect(onAlert).toHaveBeenCalledWith(expect.objectContaining({
			trigger: "closeAbove",
			referencePrice: 105,
			symbol: "VCB",
			timeframe: "1d",
			bar: expect.objectContaining({ close: 107 }),
		}));
	});
});
