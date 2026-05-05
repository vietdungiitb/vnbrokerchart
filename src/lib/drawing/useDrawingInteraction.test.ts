import { describe, expect, it } from "vitest";
import { createDrawingObject } from "./shared";
import { createDrawingInteractionState, deleteSelectedInteractionState, drawingInteractionReducer } from "./useDrawingInteraction";

const startPoint = { x: 12, y: 34 };
const nextPoint = { x: 52, y: 64 };

function createTrendLineDrawing() {
	return createDrawingObject("trendLine", [startPoint, nextPoint], { id: "drawing-1" });
}

describe("useDrawingInteraction foundation", () => {
	it("creates an idle interaction snapshot with empty history", () => {
		const snapshot = createDrawingInteractionState();

		expect(snapshot.drawingState).toEqual({ type: "idle" });
		expect(snapshot.history.present).toHaveLength(0);
		expect(snapshot.history.past).toHaveLength(0);
		expect(snapshot.history.future).toHaveLength(0);
	});

	it("routes drawing and history actions through the shared reducer", () => {
		const drawing = createTrendLineDrawing();
		const drawingState = drawingInteractionReducer(createDrawingInteractionState(), {
			type: "START_DRAWING",
			toolName: "trendLine",
			object: drawing,
		});

		expect(drawingState.drawingState).toEqual({
			type: "drawing",
			toolName: "trendLine",
			object: drawing,
		});

		const completeState = drawingInteractionReducer(drawingState, {
			type: "COMPLETE_DRAWING",
			object: drawing,
		});

		expect(completeState.drawingState).toEqual({
			type: "complete",
			object: drawing,
		});

		const pushedState = drawingInteractionReducer(completeState, {
			type: "PUSH",
			drawing,
		});

		expect(pushedState.history.present).toEqual([drawing]);
		expect(pushedState.history.past).toHaveLength(1);

		const selectedState = drawingInteractionReducer(pushedState, {
			type: "SELECT_OBJECT",
			objectId: drawing.id,
		});

		expect(selectedState.drawingState).toEqual({
			type: "selected",
			objectId: drawing.id,
		});
	});

	it("clears the selected drawing from the interaction snapshot", () => {
		const drawing = createTrendLineDrawing();
		const selectedSnapshot = {
			drawingState: { type: "selected", objectId: drawing.id } as const,
			history: {
				past: [],
				present: [drawing],
				future: [],
			},
		};

		const deletedSnapshot = deleteSelectedInteractionState(selectedSnapshot);

		expect(deletedSnapshot.drawingState).toEqual({ type: "idle" });
		expect(deletedSnapshot.history.present).toHaveLength(0);
		expect(deletedSnapshot.history.past).toHaveLength(1);
	});
});