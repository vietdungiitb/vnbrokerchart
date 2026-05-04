import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { PaneDescriptor, SeriesConfig, SeriesTypeId } from "../types/pane-descriptor";
import { DEFAULT_PANES, PANE_LAYOUT_STORAGE_KEY, PANE_MAX_VISIBLE } from "../types/pane-descriptor";

const FRAME_VERTICAL_MARGIN = 36;
const MIN_PANE_HEIGHT = 80;

export interface StoredPaneLayout {
	version: 1;
	panes: readonly PaneDescriptor[];
}

export interface PaneLayoutStorageLike {
	getItem: (key: string) => string | null;
	setItem: (key: string, value: string) => void;
	removeItem: (key: string) => void;
}

export type DynamicPaneAction =
	| { type: "toggleVisible"; id: string }
	| { type: "addPane"; pane: Omit<PaneDescriptor, "id"> }
	| { type: "removePane"; id: string }
	| { type: "restorePane"; id: string }
	| { type: "addSeries"; paneId: string; series: SeriesConfig }
	| { type: "removeSeries"; paneId: string; seriesType: SeriesTypeId }
	| { type: "applyDelta"; splitterIndex: number; deltaY: number; available: number }
	| { type: "resetToDefault" }
	| { type: "reorderPanes"; fromVisibleIndex: number; toVisibleIndex: number };

export interface UseDynamicPanesResult {
	panes: PaneDescriptor[];
	visiblePanes: PaneDescriptor[];
	heights: number[];
	available: number;
	toggleVisible: (id: string) => void;
	addPane: (pane: Omit<PaneDescriptor, "id">) => void;
	removePane: (id: string) => void;
	restorePane: (id: string) => void;
	addSeries: (paneId: string, series: SeriesConfig) => void;
	removeSeries: (paneId: string, seriesType: SeriesTypeId) => void;
	applyDelta: (splitterIndex: number, deltaY: number) => void;
	resetToDefault: () => void;
	reorderPanes: (fromVisibleIndex: number, toVisibleIndex: number) => void;
	canAddPane: boolean;
}

function createId() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}
	return `pane-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneSeries(series: readonly SeriesConfig[]): SeriesConfig[] {
	return series.map((item) => ({
		...item,
		params: item.params ? { ...item.params } : undefined,
	}));
}

function clonePane(pane: PaneDescriptor): PaneDescriptor {
	return {
		...pane,
		series: cloneSeries(pane.series),
	};
}

function clonePaneList(panes: readonly PaneDescriptor[]): PaneDescriptor[] {
	return panes.map(clonePane);
}

function getVisiblePanes(panes: readonly PaneDescriptor[]): PaneDescriptor[] {
	return panes.filter((pane) => pane.visible);
}

function normalizeVisibleRatios(panes: readonly PaneDescriptor[]): PaneDescriptor[] {
	const next = clonePaneList(panes);
	const visible = next.filter((pane) => pane.visible);
	const total = visible.reduce((sum, pane) => sum + pane.heightRatio, 0);

	if (visible.length === 0) {
		return next;
	}

	if (total <= 0) {
		const ratio = 1 / visible.length;
		visible.forEach((pane) => {
			pane.heightRatio = ratio;
		});
		return next;
	}

	visible.forEach((pane) => {
		pane.heightRatio = pane.heightRatio / total;
	});

	return next;
}

function visibleCount(panes: readonly PaneDescriptor[]) {
	return panes.reduce((count, pane) => count + (pane.visible ? 1 : 0), 0);
}

function visibleIndices(panes: readonly PaneDescriptor[]) {
	const indices: number[] = [];
	panes.forEach((pane, index) => {
		if (pane.visible) {
			indices.push(index);
		}
	});
	return indices;
}

function ratiosToHeights(panes: readonly PaneDescriptor[], available: number): number[] {
	const visible = getVisiblePanes(panes);
	if (visible.length === 0) {
		return [];
	}

	const heights: number[] = [];
	let allocated = 0;
	visible.forEach((pane, index) => {
		if (index === visible.length - 1) {
			heights.push(Math.max(available - allocated, MIN_PANE_HEIGHT));
			return;
		}
		const height = Math.max(Math.round(pane.heightRatio * available), MIN_PANE_HEIGHT);
		heights.push(height);
		allocated += height;
	});

	const total = heights.reduce((sum, value) => sum + value, 0);
	if (total !== available && heights.length > 0) {
		heights[heights.length - 1] += available - total;
	}

	return heights;
}

function heightsToRatios(heights: readonly number[]): number[] {
	const total = heights.reduce((sum, value) => sum + value, 0);
	if (total <= 0) {
		return heights.map(() => 1 / heights.length);
	}
	return heights.map((height) => height / total);
}

function validatePane(candidate: unknown): candidate is PaneDescriptor {
	if (!candidate || typeof candidate !== "object") {
		return false;
	}
	const pane = candidate as PaneDescriptor;
	return typeof pane.id === "string"
		&& typeof pane.label === "string"
		&& typeof pane.pinned === "boolean"
		&& typeof pane.visible === "boolean"
		&& typeof pane.heightRatio === "number"
		&& Array.isArray(pane.series)
		&& typeof pane.splitScale === "boolean"
		&& (pane.tooltip === "ohlc" || pane.tooltip === "value" || pane.tooltip === "none");
}

function sanitizeLayout(raw: unknown): PaneDescriptor[] | null {
	if (!raw || typeof raw !== "object") {
		return null;
	}
	const stored = raw as Partial<StoredPaneLayout>;
	if (stored.version !== 1 || !Array.isArray(stored.panes) || stored.panes.length === 0) {
		return null;
	}
	if (!validatePane(stored.panes[0]) || stored.panes[0].pinned !== true) {
		return null;
	}
	if (!stored.panes.every(validatePane)) {
		return null;
	}
	return normalizeVisibleRatios(stored.panes.map(clonePane));
}

function readStoredPaneLayout(storage?: PaneLayoutStorageLike): PaneDescriptor[] {
	if (!storage) {
		return clonePaneList(DEFAULT_PANES);
	}

	try {
		const raw = storage.getItem(PANE_LAYOUT_STORAGE_KEY);
		if (!raw) {
			return clonePaneList(DEFAULT_PANES);
		}
		const parsed = JSON.parse(raw) as unknown;
		const layout = sanitizeLayout(parsed);
		return layout ?? clonePaneList(DEFAULT_PANES);
	} catch {
		return clonePaneList(DEFAULT_PANES);
	}
}

function writeStoredPaneLayout(panes: readonly PaneDescriptor[], storage?: PaneLayoutStorageLike): void {
	if (!storage) {
		return;
	}
	try {
		storage.setItem(PANE_LAYOUT_STORAGE_KEY, JSON.stringify({
			version: 1,
			panes,
		} satisfies StoredPaneLayout));
	} catch {
		// ignore storage quota / sandbox errors
	}
}

function makeDefaultLayout(): PaneDescriptor[] {
	return normalizeVisibleRatios(clonePaneList(DEFAULT_PANES));
}

function mutateVisibleRatio(panes: PaneDescriptor[], visiblePaneIndex: number, nextHeightRatio: number): PaneDescriptor[] {
	const next = clonePaneList(panes);
	const visible = next.filter((pane) => pane.visible);
	const pane = visible[visiblePaneIndex];
	if (!pane) {
		return next;
	}
	const ratio = Math.max(nextHeightRatio, 0);
	pane.heightRatio = ratio;
	return normalizeVisibleRatios(next);
}

function reorderVisiblePanes(panes: readonly PaneDescriptor[], fromVisibleIndex: number, toVisibleIndex: number): PaneDescriptor[] {
	if (fromVisibleIndex === toVisibleIndex) {
		return clonePaneList(panes);
	}

	const next = clonePaneList(panes);
	const visibleSlots = visibleIndices(next);
	if (fromVisibleIndex < 0 || fromVisibleIndex >= visibleSlots.length) {
		return next;
	}
	if (toVisibleIndex < 0 || toVisibleIndex >= visibleSlots.length) {
		return next;
	}
	if (toVisibleIndex === 0 || next[visibleSlots[fromVisibleIndex]]?.pinned) {
		return next;
	}

	const orderedVisible = visibleSlots.map((index) => next[index]);
	const [moved] = orderedVisible.splice(fromVisibleIndex, 1);
	if (!moved) {
		return next;
	}
	orderedVisible.splice(toVisibleIndex, 0, moved);

	let cursor = 0;
	return next.map((pane) => {
		if (!pane.visible) {
			return pane;
		}
		const replacement = orderedVisible[cursor];
		cursor += 1;
		return replacement;
	});
}

export function dynamicPanesReducer(state: readonly PaneDescriptor[], action: DynamicPaneAction): PaneDescriptor[] {
	switch (action.type) {
		case "toggleVisible": {
			const next = clonePaneList(state);
			const pane = next.find((item) => item.id === action.id);
			if (!pane || pane.pinned) {
				return next;
			}
			if (pane.visible && visibleCount(next) === 1) {
				return next;
			}
			pane.visible = !pane.visible;
			return normalizeVisibleRatios(next);
		}
		case "addPane": {
			const next = clonePaneList(state);
			if (visibleCount(next) >= PANE_MAX_VISIBLE) {
				return next;
			}
			const pane: PaneDescriptor = {
				...action.pane,
				id: createId(),
				series: cloneSeries(action.pane.series),
			};
			next.push(pane);
			return normalizeVisibleRatios(next);
		}
		case "removePane": {
			const next = clonePaneList(state);
			const pane = next.find((item) => item.id === action.id);
			if (!pane || pane.pinned) {
				return next;
			}
			if (pane.visible && visibleCount(next) === 1) {
				return next;
			}
			// Soft-delete: hide the pane so it can be restored from the Panes menu
			pane.visible = false;
			return normalizeVisibleRatios(next);
		}
		case "restorePane": {
			const next = clonePaneList(state);
			if (visibleCount(next) >= PANE_MAX_VISIBLE) {
				return next;
			}
			const pane = next.find((item) => item.id === action.id);
			if (!pane) {
				return next;
			}
			pane.visible = true;
			return normalizeVisibleRatios(next);
		}
		case "addSeries": {
			const next = clonePaneList(state);
			const pane = next.find((item) => item.id === action.paneId);
			if (!pane || pane.series.some((series) => series.type === action.series.type)) {
				return next;
			}
			pane.series.push({
				...action.series,
				params: action.series.params ? { ...action.series.params } : undefined,
			});
			return next;
		}
		case "removeSeries": {
			const next = clonePaneList(state);
			const pane = next.find((item) => item.id === action.paneId);
			if (!pane) {
				return next;
			}
			pane.series = pane.series.filter((series) => series.type !== action.seriesType);
			return next;
		}
		case "applyDelta": {
			const next = clonePaneList(state);
			const visible = getVisiblePanes(next);
			const topPane = visible[action.splitterIndex];
			const bottomPane = visible[action.splitterIndex + 1];
			if (!topPane || !bottomPane) {
				return next;
			}

			const available = Math.max(action.available, MIN_PANE_HEIGHT * 2);
			const heights = ratiosToHeights(visible, available);
			const topHeight = heights[action.splitterIndex];
			const bottomHeight = heights[action.splitterIndex + 1];
			const pairTotal = topHeight + bottomHeight;
			const minTop = MIN_PANE_HEIGHT;
			const minBottom = MIN_PANE_HEIGHT;
			const nextTop = Math.min(Math.max(topHeight + action.deltaY, minTop), pairTotal - minBottom);
			const nextBottom = pairTotal - nextTop;
			heights[action.splitterIndex] = nextTop;
			heights[action.splitterIndex + 1] = nextBottom;

			const updated = clonePaneList(next);
			let visibleCursor = 0;
			updated.forEach((pane) => {
				if (!pane.visible) {
					return;
				}
				pane.heightRatio = heights[visibleCursor] / available;
				visibleCursor += 1;
			});
			return normalizeVisibleRatios(updated);
		}
		case "resetToDefault":
			return makeDefaultLayout();
		case "reorderPanes":
			return reorderVisiblePanes(state, action.fromVisibleIndex, action.toVisibleIndex);
		default:
			return clonePaneList(state);
	}
}

export function createDefaultPaneLayout(): PaneDescriptor[] {
	return makeDefaultLayout();
}

export function loadPaneLayout(storage?: PaneLayoutStorageLike): PaneDescriptor[] {
	return readStoredPaneLayout(storage);
}

export function savePaneLayout(panes: readonly PaneDescriptor[], storage?: PaneLayoutStorageLike): void {
	writeStoredPaneLayout(panes, storage);
}

export function useDynamicPanes(totalHeight: number): UseDynamicPanesResult {
	const [panes, dispatch] = useReducer(dynamicPanesReducer, undefined, () => loadPaneLayout());

	const available = useMemo(() => {
		const visible = panes.filter((pane) => pane.visible).length;
		return Math.max(totalHeight - FRAME_VERTICAL_MARGIN, visible * MIN_PANE_HEIGHT);
	}, [panes, totalHeight]);

	const visiblePanes = useMemo(() => getVisiblePanes(panes), [panes]);
	const heights = useMemo(() => ratiosToHeights(panes, available), [panes, available]);

	useEffect(() => {
		savePaneLayout(panes, typeof localStorage !== "undefined" ? localStorage : undefined);
	}, [panes]);

	const toggleVisible = useCallback((id: string) => {
		dispatch({ type: "toggleVisible", id });
	}, []);

	const addPane = useCallback((pane: Omit<PaneDescriptor, "id">) => {
		dispatch({ type: "addPane", pane });
	}, []);

	const removePane = useCallback((id: string) => {
		dispatch({ type: "removePane", id });
	}, []);

	const restorePane = useCallback((id: string) => {
		dispatch({ type: "restorePane", id });
	}, []);

	const addSeries = useCallback((paneId: string, series: SeriesConfig) => {
		dispatch({ type: "addSeries", paneId, series });
	}, []);

	const removeSeries = useCallback((paneId: string, seriesType: SeriesTypeId) => {
		dispatch({ type: "removeSeries", paneId, seriesType });
	}, []);

	const applyDelta = useCallback((splitterIndex: number, deltaY: number) => {
		dispatch({ type: "applyDelta", splitterIndex, deltaY, available });
	}, [available]);

	const resetToDefault = useCallback(() => {
		try {
			if (typeof localStorage !== "undefined") {
				localStorage.removeItem(PANE_LAYOUT_STORAGE_KEY);
			}
		} catch {
			// ignore storage errors
		}
		dispatch({ type: "resetToDefault" });
	}, []);

	const reorderPanes = useCallback((fromVisibleIndex: number, toVisibleIndex: number) => {
		dispatch({ type: "reorderPanes", fromVisibleIndex, toVisibleIndex });
	}, []);

	return {
		panes,
		visiblePanes,
		heights,
		available,
		toggleVisible,
		addPane,
		removePane,
		restorePane,
		addSeries,
		removeSeries,
		applyDelta,
		resetToDefault,
		reorderPanes,
		canAddPane: visiblePanes.length < PANE_MAX_VISIBLE,
	};
}
