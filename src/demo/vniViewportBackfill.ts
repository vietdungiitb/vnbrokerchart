export interface ViewportVisibleRange {
	startIndex: number;
	endIndex: number;
	startDate: Date | number;
	endDate: Date | number;
	barCount: number;
}

export interface DatedBar {
	date: Date;
}

export interface VNIViewportBackfillWindow {
	fetchFrom: Date;
	fetchTo: Date;
	loadedStart: Date;
	visibleStart: Date;
	visibleEnd: Date;
	triggerBars: number;
}

interface VNIViewportBackfillOptions {
	leftTriggerRatio?: number;
	leftBufferRatio?: number;
	minBufferBars?: number;
	minTriggerBars?: number;
	defaultIntervalMs?: number;
}

function toDate(value: Date | number): Date | null {
	if (value instanceof Date) {
		return Number.isFinite(value.getTime()) ? value : null;
	}
	const date = new Date(value);
	return Number.isFinite(date.getTime()) ? date : null;
}

export function computeVNIViewportBackfillWindow(
	range: ViewportVisibleRange,
	loadedBars: readonly DatedBar[],
	options: VNIViewportBackfillOptions = {},
): VNIViewportBackfillWindow | null {
	if (loadedBars.length === 0 || range.barCount <= 0) {
		return null;
	}

	const visibleStart = toDate(range.startDate);
	const visibleEnd = toDate(range.endDate);
	if (!visibleStart || !visibleEnd) {
		return null;
	}

	const leftTriggerRatio = options.leftTriggerRatio ?? 0.25;
	const leftBufferRatio = options.leftBufferRatio ?? 2;
	const minBufferBars = options.minBufferBars ?? 60;
	const minTriggerBars = options.minTriggerBars ?? 0;
	const defaultIntervalMs = options.defaultIntervalMs ?? 86_400_000;
	const triggerBars = Math.max(3, Math.ceil(range.barCount * leftTriggerRatio), minTriggerBars);

	if (range.startIndex > triggerBars) {
		return null;
	}

	const visibleStartMs = visibleStart.getTime();
	const visibleEndMs = visibleEnd.getTime();
	const visibleSpanMs = Math.max(1, visibleEndMs - visibleStartMs);
	const inferredIntervalMs = range.barCount > 1
		? Math.max(1, Math.round(visibleSpanMs / Math.max(1, range.barCount - 1)))
		: defaultIntervalMs;
	const intervalMs = Number.isFinite(inferredIntervalMs) ? inferredIntervalMs : defaultIntervalMs;
	const loadedStart = loadedBars[0]?.date;
	if (!(loadedStart instanceof Date) || !Number.isFinite(loadedStart.getTime())) {
		return null;
	}

	const targetStartMs = visibleStartMs - Math.max(visibleSpanMs * leftBufferRatio, intervalMs * minBufferBars);
	const loadedStartMs = loadedStart.getTime();
	if (loadedStartMs <= targetStartMs) {
		return null;
	}

	const fetchToMs = loadedStartMs - 1;
	const fetchFromMs = Math.min(targetStartMs, fetchToMs);
	if (!Number.isFinite(fetchFromMs) || !Number.isFinite(fetchToMs) || fetchFromMs >= fetchToMs) {
		return null;
	}

	return {
		fetchFrom: new Date(fetchFromMs),
		fetchTo: new Date(fetchToMs),
		loadedStart,
		visibleStart,
		visibleEnd,
		triggerBars,
	};
}