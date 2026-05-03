import type { DrawingObject, DrawingToolType, Point } from "./types";

export type DrawingState =
	| { type: "idle" }
	| { type: "drawing"; toolName: DrawingToolType; object: DrawingObject }
	| { type: "complete"; object: DrawingObject }
	| { type: "selected"; objectId: string }
	| { type: "moving"; objectId: string; startPoint: Point; currentPoint: Point }
	| { type: "resizing"; objectId: string; handle: string }
	| { type: "editing"; objectId: string; text: string };

export type DrawingAction =
	| { type: "START_DRAWING"; toolName: DrawingToolType; object: DrawingObject }
	| { type: "UPDATE_DRAWING"; object: DrawingObject }
	| { type: "COMPLETE_DRAWING"; object: DrawingObject }
	| { type: "SELECT_OBJECT"; objectId: string }
	| { type: "START_MOVING"; objectId: string; startPoint: Point; currentPoint: Point }
	| { type: "START_RESIZING"; objectId: string; handle: string }
	| { type: "START_EDITING"; objectId: string; text?: string }
	| { type: "CANCEL" };

export function drawingReducer(state: DrawingState, action: DrawingAction): DrawingState {
	switch (action.type) {
		case "START_DRAWING":
			return {
				type: "drawing",
				toolName: action.toolName,
				object: action.object,
			};
		case "UPDATE_DRAWING":
			return state.type === "drawing"
				? {
					...state,
					object: action.object,
				}
				: state;
		case "COMPLETE_DRAWING":
			return {
				type: "complete",
				object: action.object,
			};
		case "SELECT_OBJECT":
			return {
				type: "selected",
				objectId: action.objectId,
			};
		case "START_MOVING":
			return {
				type: "moving",
				objectId: action.objectId,
				startPoint: action.startPoint,
				currentPoint: action.currentPoint,
			};
		case "START_RESIZING":
			return {
				type: "resizing",
				objectId: action.objectId,
				handle: action.handle,
			};
		case "START_EDITING":
			return {
				type: "editing",
				objectId: action.objectId,
				text: action.text ?? "",
			};
		case "CANCEL":
			return { type: "idle" };
		default:
			return state;
	}
}