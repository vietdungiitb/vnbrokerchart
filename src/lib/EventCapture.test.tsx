// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const pointerMock = vi.hoisted(() => vi.fn(() => [318, 271] as [number, number]));

vi.mock("d3-selection", async () => {
	const actual = await vi.importActual<typeof import("d3-selection")>("d3-selection");
	return {
		...actual,
		pointer: pointerMock,
	};
});

let EventCapture: typeof import("./EventCapture").default;

beforeAll(async () => {
	({ default: EventCapture } = await import("./EventCapture"));
});

afterEach(() => {
	vi.clearAllMocks();
	vi.useRealTimers();
});

describe("EventCapture click handling", () => {
	it("uses pointer coordinates from the capture node for clicks", () => {
		vi.useFakeTimers();

		const onClick = vi.fn();
		const onDoubleClick = vi.fn();
		const node = document.createElement("div");
		const capture = new EventCapture({
			onClick,
			onDoubleClick,
			pan: false,
			zoom: false,
			mouseMove: false,
			panSpeedMultiplier: 1,
			focus: false,
			useCrossHairStyleCursor: false,
			width: 640,
			height: 320,
			xScale: vi.fn(),
			xAccessor: vi.fn(),
			disableInteraction: false,
			getAllPanConditions: vi.fn(() => ({ panEnabled: false, somethingSelected: false })),
			onPinchZoomEnd: vi.fn(),
		} as any);

		capture.saveNode(node);

		const event = new MouseEvent("click", {
			bubbles: true,
			cancelable: true,
		});

		capture.handleClick(event);

		expect(pointerMock).toHaveBeenCalledTimes(1);
		expect(pointerMock).toHaveBeenCalledWith(event, node);
		expect(onClick).toHaveBeenCalledWith([318, 271], event);
		expect(onDoubleClick).not.toHaveBeenCalled();

		vi.runAllTimers();
	});
});