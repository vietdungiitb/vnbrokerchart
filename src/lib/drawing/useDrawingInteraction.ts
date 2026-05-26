import { useCallback, useMemo, useReducer } from "react";
import type { Dispatch } from "react";
import type { DrawingHistory, DrawingHistoryAction } from "./history";
import { createDrawingHistory, historyReducer } from "./history";
import type { DrawingObject, Point } from "./types";
import type { DrawingAction, DrawingState } from "./stateMachine";
import { drawingReducer } from "./stateMachine";
import { clonePoint } from "./shared";

export type DrawingInteractionAction = DrawingAction | DrawingHistoryAction;

export interface DrawingInteractionState {
	drawingState: DrawingState;
	history: DrawingHistory;
}

export interface UseDrawingInteractionReturn {
	drawingState: DrawingState;
	history: DrawingHistory;
	dispatch: Dispatch<DrawingInteractionAction>;
	selectObject: (objectId: string) => void;
	setSelectedObjects: (objectIds: readonly string[]) => void;
	startMoving: (objectId: string, startPoint: Point, currentPoint: Point) => void;
	startResizing: (objectId: string, handle: string) => void;
	startEditing: (objectId: string, text?: string) => void;
	replaceDrawings: (drawings: readonly DrawingObject[]) => void;
	updateDrawing: (objectId: string, patch: Partial<DrawingObject>) => void;
	updateSelectedDrawings: (patch: Partial<DrawingObject>) => void;
	undo: () => void;
	redo: () => void;
	deleteSelected: () => void;
	cancelDrawing: () => void;
	bringSelectedToFront: () => void;
	sendSelectedToBack: () => void;
	/** CE19-02: Select all drawings sharing the same groupId */
	selectGroup: (groupId: string) => void;
	/** CE19-02: Delete all drawings sharing the same groupId */
	deleteGroup: (groupId: string) => void;
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

function cloneDrawingPoints(points: readonly Point[]) {
	return points.map(clonePoint);
}

function patchDrawing(drawing: DrawingObject, patch: Partial<DrawingObject>): DrawingObject {
	return {
		...drawing,
		...patch,
		points: patch.points ? cloneDrawingPoints(patch.points) : cloneDrawingPoints(drawing.points),
		style: patch.style ? { ...drawing.style, ...patch.style } : { ...drawing.style },
		fibLevels: patch.fibLevels ? [...patch.fibLevels] : drawing.fibLevels ? [...drawing.fibLevels] : undefined,
		riskReward: patch.riskReward ? { ...patch.riskReward } : drawing.riskReward ? { ...drawing.riskReward } : undefined,
		updatedAt: Date.now(),
	};
}

function replaceDrawingById(drawings: readonly DrawingObject[], objectId: string, patch: Partial<DrawingObject>) {
	return replaceDrawingsByIds(drawings, [objectId], patch);
}

function replaceDrawingsByIds(drawings: readonly DrawingObject[], objectIds: readonly string[], patch: Partial<DrawingObject>) {
	const selectedObjectIds = new Set(objectIds);
	let didChange = false;
	const nextDrawings = drawings.map((drawing) => {
		if (!selectedObjectIds.has(drawing.id)) {
			return drawing;
		}

		didChange = true;
		return patchDrawing(drawing, patch);
	});

	return didChange ? nextDrawings : null;
}

function getReorderTargetIds(drawings: readonly DrawingObject[], selectedObjectIds: readonly string[]) {
	if (selectedObjectIds.length === 0) {
		return [] as string[];
	}

	const selectedObjectIdSet = new Set(selectedObjectIds);
	const selectedDrawings = drawings.filter((drawing) => selectedObjectIdSet.has(drawing.id));
	if (selectedDrawings.length === 0) {
		return [] as string[];
	}

	const firstGroupId = selectedDrawings[0]?.groupId;
	if (firstGroupId && selectedDrawings.every((drawing) => drawing.groupId === firstGroupId)) {
		return drawings.filter((drawing) => drawing.groupId === firstGroupId).map((drawing) => drawing.id);
	}

	return selectedObjectIds;
}

function reorderDrawingsByIds(drawings: readonly DrawingObject[], objectIds: readonly string[], direction: "front" | "back") {
	if (objectIds.length === 0) {
		return null;
	}

	const targetIds = new Set(objectIds);
	const orderedDrawings = drawings
		.map((drawing, index) => ({ drawing, index }))
		.sort((left, right) => (left.drawing.zIndex ?? 0) - (right.drawing.zIndex ?? 0) || left.index - right.index);
	const targetDrawings = orderedDrawings.filter(({ drawing }) => targetIds.has(drawing.id)).map(({ drawing }) => drawing);
	if (targetDrawings.length === 0) {
		return null;
	}

	const currentMaxZIndex = orderedDrawings.reduce((currentMax, { drawing }) => Math.max(currentMax, drawing.zIndex ?? 0), 0);
	const currentMinZIndex = orderedDrawings.reduce((currentMin, { drawing }) => Math.min(currentMin, drawing.zIndex ?? 0), 0);
	const nextZIndexById = new Map<string, number>();

	if (direction === "front") {
		let nextZIndex = currentMaxZIndex + 1;
		for (const drawing of targetDrawings) {
			nextZIndexById.set(drawing.id, nextZIndex);
			nextZIndex += 1;
		}
	} else {
		let nextZIndex = currentMinZIndex - targetDrawings.length;
		for (const drawing of targetDrawings) {
			nextZIndexById.set(drawing.id, nextZIndex);
			nextZIndex += 1;
		}
	}

	let didChange = false;
	const nextDrawings = drawings.map((drawing) => {
		const nextZIndex = nextZIndexById.get(drawing.id);
		if (nextZIndex === undefined) {
			return drawing;
		}

		didChange = true;
		return patchDrawing(drawing, { zIndex: nextZIndex });
	});

	return didChange ? nextDrawings : null;
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

	const selectObject = useCallback((objectId: string) => {
		dispatch({ type: "SELECT_OBJECT", objectId });
	}, [dispatch]);

	const setSelectedObjects = useCallback((objectIds: readonly string[]) => {
		dispatch({ type: "SET_SELECTED_OBJECTS", objectIds: [...objectIds] });
	}, [dispatch]);

	const startMoving = useCallback((objectId: string, startPoint: Point, currentPoint: Point) => {
		dispatch({ type: "START_MOVING", objectId, startPoint, currentPoint });
	}, [dispatch]);

	const startResizing = useCallback((objectId: string, handle: string) => {
		dispatch({ type: "START_RESIZING", objectId, handle });
	}, [dispatch]);

	const startEditing = useCallback((objectId: string, text?: string) => {
		dispatch({ type: "START_EDITING", objectId, text });
	}, [dispatch]);

	const replaceDrawings = useCallback((drawings: readonly DrawingObject[]) => {
		dispatch({ type: "REPLACE", drawings: [...drawings] });
	}, [dispatch]);

	const updateDrawing = useCallback((objectId: string, patch: Partial<DrawingObject>) => {
		const nextDrawings = replaceDrawingById(state.history.present, objectId, patch);
		if (!nextDrawings) {
			return;
		}

		dispatch({ type: "REPLACE", drawings: nextDrawings });
	}, [dispatch, state.history.present]);

	const updateSelectedDrawings = useCallback((patch: Partial<DrawingObject>) => {
		const selectedObjectIds = getSelectedObjectIds(state.drawingState);
		if (selectedObjectIds.length === 0) {
			return;
		}

		const nextDrawings = replaceDrawingsByIds(state.history.present, selectedObjectIds, patch);
		if (!nextDrawings) {
			return;
		}

		dispatch({ type: "REPLACE", drawings: nextDrawings });
	}, [dispatch, state.drawingState, state.history.present]);

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

	const bringSelectedToFront = useCallback(() => {
		const selectedObjectIds = getSelectedObjectIds(state.drawingState);
		const targetObjectIds = getReorderTargetIds(state.history.present, selectedObjectIds);
		const nextDrawings = reorderDrawingsByIds(state.history.present, targetObjectIds, "front");
		if (!nextDrawings) {
			return;
		}

		dispatch({ type: "REPLACE", drawings: nextDrawings });
	}, [dispatch, state.drawingState, state.history.present]);

	const sendSelectedToBack = useCallback(() => {
		const selectedObjectIds = getSelectedObjectIds(state.drawingState);
		const targetObjectIds = getReorderTargetIds(state.history.present, selectedObjectIds);
		const nextDrawings = reorderDrawingsByIds(state.history.present, targetObjectIds, "back");
		if (!nextDrawings) {
			return;
		}

		dispatch({ type: "REPLACE", drawings: nextDrawings });
	}, [dispatch, state.drawingState, state.history.present]);

	const selectGroup = useCallback((groupId: string) => {
		const ids = state.history.present
			.filter((d) => d.groupId === groupId)
			.map((d) => d.id);
		dispatch({ type: "SET_SELECTED_OBJECTS", objectIds: ids });
	}, [dispatch, state.history.present]);

	const deleteGroup = useCallback((groupId: string) => {
		const groupDrawings = state.history.present.filter((drawing) => drawing.groupId === groupId);
		if (groupDrawings.some((drawing) => drawing.locked)) {
			return;
		}

		const nextDrawings = state.history.present.filter((d) => d.groupId !== groupId);
		if (nextDrawings.length !== state.history.present.length) {
			dispatch({ type: "REPLACE", drawings: nextDrawings });
		}
		dispatch({ type: "CANCEL" });
	}, [dispatch, state.history.present]);

	return useMemo(() => ({
		drawingState: state.drawingState,
		history: state.history,
		dispatch,
		selectObject,
		setSelectedObjects,
		startMoving,
		startResizing,
		startEditing,
		replaceDrawings,
		updateDrawing,
		updateSelectedDrawings,
		undo,
		redo,
		deleteSelected,
		cancelDrawing,
		bringSelectedToFront,
		sendSelectedToBack,
		selectGroup,
		deleteGroup,
		canUndo: state.history.past.length > 0,
		canRedo: state.history.future.length > 0,
		allDrawings: state.history.present,
	}), [bringSelectedToFront, cancelDrawing, deleteGroup, deleteSelected, dispatch, redo, replaceDrawings, selectGroup, selectObject, sendSelectedToBack, setSelectedObjects, startEditing, startMoving, startResizing, state.drawingState, state.history, undo, updateDrawing, updateSelectedDrawings]);
}