import type { DrawingObject } from "./types";

export interface DrawingHistoryChange {
	id: string;
	before?: DrawingObject;
	after?: DrawingObject;
	beforeIndex?: number;
	afterIndex?: number;
}

export interface DrawingHistoryCommand {
	changes: DrawingHistoryChange[];
}

export interface DrawingHistory {
	past: DrawingHistoryCommand[];
	present: DrawingObject[];
	future: DrawingHistoryCommand[];
}

export type DrawingHistoryAction =
	| { type: "PUSH"; drawing: DrawingObject }
	| { type: "REPLACE"; drawings: DrawingObject[] }
	| { type: "UNDO" }
	| { type: "REDO" }
	| { type: "CLEAR" };

function snapshotDrawings(drawings: readonly DrawingObject[]) {
	return [...drawings];
}

export function createDrawingHistory(drawings: readonly DrawingObject[] = []): DrawingHistory {
	return {
		past: [],
		present: snapshotDrawings(drawings),
		future: [],
	};
}

function indexDrawings(drawings: readonly DrawingObject[]) {
	return new Map(drawings.map((drawing, index) => [drawing.id, { drawing, index }] as const));
}

function buildHistoryCommand(previous: readonly DrawingObject[], next: readonly DrawingObject[]): DrawingHistoryCommand | null {
	const previousById = indexDrawings(previous);
	const nextById = indexDrawings(next);
	const changes: DrawingHistoryChange[] = [];

	for (const [id, nextRecord] of nextById) {
		const previousRecord = previousById.get(id);
		if (!previousRecord) {
			changes.push({
				id,
				after: nextRecord.drawing,
				afterIndex: nextRecord.index,
			});
			continue;
		}

		if (previousRecord.drawing !== nextRecord.drawing || previousRecord.index !== nextRecord.index) {
			changes.push({
				id,
				before: previousRecord.drawing,
				after: nextRecord.drawing,
				beforeIndex: previousRecord.index,
				afterIndex: nextRecord.index,
			});
		}
	}

	for (const [id, previousRecord] of previousById) {
		if (nextById.has(id)) {
			continue;
		}

		changes.push({
			id,
			before: previousRecord.drawing,
			beforeIndex: previousRecord.index,
		});
	}

	return changes.length > 0 ? { changes } : null;
}

function invertHistoryCommand(command: DrawingHistoryCommand): DrawingHistoryCommand {
	return {
		changes: command.changes.map((change) => ({
			id: change.id,
			before: change.after,
			after: change.before,
			beforeIndex: change.afterIndex,
			afterIndex: change.beforeIndex,
		})),
	};
}

function applyHistoryCommand(drawings: readonly DrawingObject[], command: DrawingHistoryCommand): DrawingObject[] {
	const nextDrawings = [...drawings];
	const removals: number[] = [];
	const replacements: Array<{ id: string; drawing: DrawingObject }> = [];
	const insertions: Array<{ index: number; drawing: DrawingObject }> = [];

	for (const change of command.changes) {
		if (change.before && change.after) {
			if (change.beforeIndex !== change.afterIndex) {
				if (typeof change.beforeIndex === "number") {
					removals.push(change.beforeIndex);
				}
				if (typeof change.afterIndex === "number") {
					insertions.push({ index: change.afterIndex, drawing: change.after });
				}
			} else {
				replacements.push({ id: change.id, drawing: change.after });
			}
			continue;
		}

		if (change.before && !change.after) {
			if (typeof change.beforeIndex === "number") {
				removals.push(change.beforeIndex);
			}
			continue;
		}

		if (!change.before && change.after && typeof change.afterIndex === "number") {
			insertions.push({ index: change.afterIndex, drawing: change.after });
		}
	}

	const uniqueRemovals = [...new Set(removals)].filter((index) => Number.isInteger(index) && index >= 0).sort((left, right) => right - left);
	for (const index of uniqueRemovals) {
		if (index < nextDrawings.length) {
			nextDrawings.splice(index, 1);
		}
	}

	for (const replacement of replacements) {
		const index = nextDrawings.findIndex((drawing) => drawing.id === replacement.id);
		if (index >= 0) {
			nextDrawings[index] = replacement.drawing;
		}
	}

	const groupedInsertions = insertions
		.filter(({ index }) => Number.isInteger(index) && index >= 0)
		.sort((left, right) => left.index - right.index);
	let groupStart = 0;
	while (groupStart < groupedInsertions.length) {
		let groupEnd = groupStart + 1;
		while (groupEnd < groupedInsertions.length && groupedInsertions[groupEnd].index === groupedInsertions[groupStart].index) {
			groupEnd += 1;
		}

		for (let index = groupEnd - 1; index >= groupStart; index -= 1) {
			const insertion = groupedInsertions[index];
			const targetIndex = Math.min(insertion.index, nextDrawings.length);
			nextDrawings.splice(targetIndex, 0, insertion.drawing);
		}

		groupStart = groupEnd;
	}

	return nextDrawings;
}

export function historyReducer(state: DrawingHistory, action: DrawingHistoryAction): DrawingHistory {
	switch (action.type) {
		case "PUSH":
			return {
				past: [...state.past, {
					changes: [{
						id: action.drawing.id,
						after: action.drawing,
						afterIndex: state.present.length,
					}],
				}],
				present: [...state.present, action.drawing],
				future: [],
			};
		case "REPLACE": {
			const command = buildHistoryCommand(state.present, action.drawings);
			if (!command) {
				return state;
			}

			return {
				past: [...state.past, command],
				present: snapshotDrawings(action.drawings),
				future: [],
			};
		}
		case "UNDO": {
			if (state.past.length === 0) {
				return state;
			}

			const nextPast = state.past.slice(0, -1);
			const previousCommand = state.past[state.past.length - 1];
			return {
				past: nextPast,
				present: applyHistoryCommand(state.present, invertHistoryCommand(previousCommand)),
				future: [previousCommand, ...state.future],
			};
		}
		case "REDO": {
			if (state.future.length === 0) {
				return state;
			}

			const [nextCommand, ...remainingFuture] = state.future;
			return {
				past: [...state.past, nextCommand],
				present: applyHistoryCommand(state.present, nextCommand),
				future: remainingFuture,
			};
		}
		case "CLEAR":
			if (state.present.length === 0) {
				return state;
			}

			return {
				past: [...state.past, {
					changes: state.present.map((drawing, index) => ({
						id: drawing.id,
						before: drawing,
						beforeIndex: index,
					})),
				}],
				present: [],
				future: [],
			};
		default:
			return state;
	}
}