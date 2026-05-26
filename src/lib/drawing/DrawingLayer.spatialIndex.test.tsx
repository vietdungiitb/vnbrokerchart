// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { scaleLinear, scaleTime } from "d3-scale";

import "./index";
import DrawingLayer from "./DrawingLayer";
import { createDrawingObject } from "./shared";
import { hitTestDrawing } from "./hitTest";

const reactActEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

let capturedProps: any = null;

vi.mock("../GenericChartComponent", async () => {
	const actual = await vi.importActual<typeof import("../GenericChartComponent")>("../GenericChartComponent");
	return {
		...actual,
		default: (props: any) => {
			capturedProps = props;
			return null;
		},
	};
});

vi.mock("./hitTest", async () => {
	const actual = await vi.importActual<typeof import("./hitTest")>("./hitTest");
	return {
		...actual,
		hitTestDrawing: vi.fn(actual.hitTestDrawing),
	};
});

describe("DrawingLayer spatial hit index", () => {
	let container: HTMLDivElement | null = null;
	let root: ReturnType<typeof createRoot> | null = null;
	const baseChartConfig = {
		id: 1,
		paneId: "price",
		width: 800,
		height: 600,
		origin: [0, 0] as [number, number],
		yScale: scaleLinear().domain([0, 100]).range([600, 0]),
	};

	beforeEach(() => {
		capturedProps = null;
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		vi.mocked(hitTestDrawing).mockClear();
	});

	afterEach(() => {
		act(() => {
			root?.unmount();
		});
		root = null;
		container?.remove();
		container = null;
	});

	it("limits exact hit-test probes to nearby drawings", () => {
		const target = createDrawingObject("trendLine", [
			{ x: Date.parse("2026-01-01T06:00:00.000Z"), y: 80 },
			{ x: Date.parse("2026-01-01T08:00:00.000Z"), y: 80 },
		], { id: "target", zIndex: 0 });
		const farDrawings = Array.from({ length: 80 }, (_, index) => createDrawingObject("trendLine", [
			{ x: Date.parse("2026-01-01T18:00:00.000Z") + index * 60_000, y: 15 + (index % 4) * 10 },
			{ x: Date.parse("2026-01-01T19:00:00.000Z") + index * 60_000, y: 15 + (index % 4) * 10 },
		], {
			id: `far-${index}`,
			zIndex: index + 1,
		}));
		const interaction = {
			drawingState: { type: "idle" },
			history: { present: [target, ...farDrawings] },
			selectObject: vi.fn(),
			setSelectedObjects: vi.fn(),
			cancelDrawing: vi.fn(),
			startMoving: vi.fn(),
			startResizing: vi.fn(),
			replaceDrawings: vi.fn(),
			dispatch: vi.fn(),
			startEditing: vi.fn(),
		} as any;
		const xScale = scaleTime()
			.domain([new Date("2026-01-01T00:00:00.000Z"), new Date("2026-01-02T00:00:00.000Z")])
			.range([0, 800]);

		act(() => {
			root?.render(createElement(DrawingLayer, {
				activeTool: "cursor",
				interaction,
			}));
		});

		expect(capturedProps).not.toBeNull();

		const isHoverResult = capturedProps.isHover({
			mouseXY: [200, 120],
			chartConfig: baseChartConfig,
			chartConfigList: [baseChartConfig],
			xScale,
			xAccessor: (datum: { date: Date }) => datum.date,
			plotData: [],
		});

		expect(isHoverResult).toBe(true);
		expect(vi.mocked(hitTestDrawing).mock.calls.length).toBeLessThan(10);
	});
});
