import { describe, expect, it } from "vitest";

import { BarReplayController, evaluateDrawingAlerts } from "../../src";
import { createDrawingObject } from "../../src/lib/drawing/shared";

function createBar(index: number) {
	const date = new Date(Date.UTC(2026, 0, index + 1));
	const close = 100 + index * 0.5;
	return {
		date,
		open: close - 0.4,
		high: close + 0.8,
		low: close - 1.2,
		close,
		volume: 1_000 + index,
		index,
		dataIndex: index,
	};
}

describe("soak/drawing_replay_alerts", () => {
	it("steps through replay data and keeps alert evaluation stable", () => {
		const bars = Array.from({ length: 240 }, (_, index) => createBar(index));
		const alertDrawing = createDrawingObject("hLine", [
			{ x: bars[0].date.getTime(), y: 500 },
			{ x: bars[1].date.getTime(), y: 500 },
		], {
			id: "soak-alert-1",
			alert: { enabled: true, trigger: "closeAbove" },
		});
		const controller = new BarReplayController({
			allData: bars,
			startIndex: 1,
		});
		const alertEvents: Array<{ close: number; referencePrice: number }> = [];
		let previousBar = controller.getCurrentBar();

		controller.subscribe((state) => {
			const currentBar = state.currentBar;
			if (!previousBar || !currentBar) {
				previousBar = currentBar;
				return;
			}

			alertEvents.push(
				...evaluateDrawingAlerts([alertDrawing], previousBar, currentBar, {
					symbol: "VCB",
					timeframe: "1d",
				}).map((event) => ({
					close: event.bar.close,
					referencePrice: event.referencePrice,
				})),
			);
			previousBar = currentBar;
		});

		for (let index = 1; index < bars.length; index += 1) {
			controller.stepForward();
		}

		expect(controller.getCurrentIndex()).toBe(bars.length);
		expect(alertEvents).toHaveLength(0);

		controller.dispose();
	});
});
