import { describe, expect, it, vi } from "vitest";
import GenericComponent from "./GenericComponent";

describe("GenericComponent unmount cleanup", () => {
	it("redraws the chart when a canvas-backed component unmounts", () => {
		const unsubscribe = vi.fn();
		const setCursorClass = vi.fn();
		const redraw = vi.fn();
		const component = new GenericComponent({
			svgDraw: () => null,
			canvasDraw: vi.fn(),
			drawOn: ["pan"],
			canvasToDraw: vi.fn(),
		} as any);

		component.context = {
			unsubscribe,
			setCursorClass,
			redraw,
			chartCanvasType: "hybrid",
		} as any;
		component.suscriberId = 42;
		component.iSetTheCursorClass = true;

		component.componentWillUnmount();

		expect(unsubscribe).toHaveBeenCalledWith(42);
		expect(setCursorClass).toHaveBeenCalledWith(null);
		expect(redraw).toHaveBeenCalledTimes(1);
	});

	it("does not redraw for svg-backed components", () => {
		const redraw = vi.fn();
		const component = new GenericComponent({
			svgDraw: () => null,
			drawOn: ["pan"],
		} as any);

		component.context = {
			unsubscribe: vi.fn(),
			setCursorClass: vi.fn(),
			redraw,
			chartCanvasType: "svg",
		} as any;
		component.suscriberId = 7;

		component.componentWillUnmount();

		expect(redraw).not.toHaveBeenCalled();
	});
});
