import { useCallback, useMemo, useReducer } from "react";
import type { Dispatch } from "react";
import type { DrawingHistory, DrawingHistoryAction } from "./history";
import { createDrawingHistory, historyReducer } from "./history";
import type { DrawingObject } from "./types";
import type { DrawingAction, DrawingState } from "./stateMachine";
import { drawingReducer } from "./stateMachine";

export type DrawingInteractionAction = DrawingAction | DrawingHistoryAction;

export interface DrawingInteractionState {
	drawingState: DrawingState;
	history: DrawingHistory;
}

export interface UseDrawingInteractionReturn {
	drawingState: DrawingState;
	history: DrawingHistory;
	dispatch: Dispatch<DrawingInteractionAction>;
	undo: () => void;
	redo: () => void;
	deleteSelected: () => void;
	cancelDrawing: () => void;
	canUndo: boolean;
	canRedo: boolean;
	allDrawings: DrawingObject[];
}

function isHistoryAction(action: DrawingInteractionAction): action is DrawingHistoryAction {
	return action.type === "PUSH" || action.type === "REPLACE" || action.type === "UNDO" || action.type === "REDO" || action.type === "CLEAR";
}

function getSelectedObjectIds(state: DrawingState): string[] {
	switch (state.type) {
		case "selected":
			return [state.objectId];
		case "selectedMultiple":
			return state.objectIds;
		case "moving":
		case "resizing":
		case "editing":
			return [state.objectId];
		default:
			return [];
	}
}

export function createDrawingInteractionState(initialDrawings: readonly DrawingObject[] = []): DrawingInteractionState {
	return {
		drawingState: { type: "idle" },
		history: createDrawingHistory(initialDrawings),
	};
}

export function drawingInteractionReducer(
	state: DrawingInteractionState,
	action: DrawingInteractionAction,
): DrawingInteractionState {
	if (isHistoryAction(action)) {
		return {
			...state,
			history: historyReducer(state.history, action),
		};
	}

	return {
		...state,
		drawingState: drawingReducer(state.drawingState, action),
	};
}

export function deleteSelectedInteractionState(state: DrawingInteractionState): DrawingInteractionState {
	const selectedObjectIds = getSelectedObjectIds(state.drawingState);
	if (selectedObjectIds.length === 0) {
		return state;
	}

	const selectedDrawings = state.history.present.filter((drawing) => selectedObjectIds.includes(drawing.id));
	if (selectedDrawings.some((drawing) => drawing.locked)) {
		return state;
	}

	const nextDrawings = state.history.present.filter((drawing) => !selectedObjectIds.includes(drawing.id));
	const nextHistory = nextDrawings.length === state.history.present.length
		? state.history
		: historyReducer(state.history, { type: "REPLACE", drawings: nextDrawings });

	return {
		drawingState: { type: "idle" },
		history: nextHistory,
	};
}

export function useDrawingInteraction(initialDrawings: readonly DrawingObject[] = []): UseDrawingInteractionReturn {
	const [state, dispatch] = useReducer(drawingInteractionReducer, initialDrawings, createDrawingInteractionState);

	const undo = useCallback(() => {
		dispatch({ type: "UNDO" });
	}, [dispatch]);

	const redo = useCallback(() => {
		dispatch({ type: "REDO" });
	}, [dispatch]);

	const cancelDrawing = useCallback(() => {
		dispatch({ type: "CANCEL" });
	}, [dispatch]);

	const deleteSelected = useCallback(() => {
		const selectedObjectIds = getSelectedObjectIds(state.drawingState);
		if (selectedObjectIds.length === 0) {
			return;
		}

		const selectedDrawings = state.history.present.filter((drawing) => selectedObjectIds.includes(drawing.id));
		if (selectedDrawings.some((drawing) => drawing.locked)) {
			return;
		}

		const nextDrawings = state.history.present.filter((drawing) => !selectedObjectIds.includes(drawing.id));
		if (nextDrawings.length !== state.history.present.length) {
			dispatch({ type: "REPLACE", drawings: nextDrawings });
		}
		dispatch({ type: "CANCEL" });
	}, [dispatch, state.drawingState, state.history.present]);

	return useMemo(() => ({
		drawingState: state.drawingState,
		history: state.history,
		dispatch,
		undo,
		redo,
		deleteSelected,
		cancelDrawing,
		canUndo: state.history.past.length > 0,
		canRedo: state.history.future.length > 0,
		allDrawings: state.history.present,
	}), [cancelDrawing, deleteSelected, dispatch, redo, state.drawingState, state.history, undo]);
}