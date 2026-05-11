export interface TimeWindow {
	startMs: number;
	endMs: number;
}

export interface PlannerOptions {
	leftPrefetchRatio?: number;
	rightPrefetchRatio?: number;
}

export interface MissingSegments {
	leftMissing: boolean;
	rightMissing: boolean;
	leftTargetMs: number;
	rightTargetMs: number;
}

const DEFAULT_LEFT_PREFETCH_RATIO = 2.0;
const DEFAULT_RIGHT_PREFETCH_RATIO = 0.5;

export function computeTargetWindow(viewport: TimeWindow, options: PlannerOptions = {}): TimeWindow {
	const leftRatio = Number.isFinite(options.leftPrefetchRatio) ? Math.max(0, options.leftPrefetchRatio ?? 0) : DEFAULT_LEFT_PREFETCH_RATIO;
	const rightRatio = Number.isFinite(options.rightPrefetchRatio) ? Math.max(0, options.rightPrefetchRatio ?? 0) : DEFAULT_RIGHT_PREFETCH_RATIO;
	const startMs = Math.min(viewport.startMs, viewport.endMs);
	const endMs = Math.max(viewport.startMs, viewport.endMs);
	const widthMs = Math.max(1, endMs - startMs);

	return {
		startMs: startMs - widthMs * leftRatio,
		endMs: endMs + widthMs * rightRatio,
	};
}

export function computeLoadedWindow(data: readonly { date: Date | number }[]): TimeWindow | null {
	if (data.length === 0) {
		return null;
	}
	const first = data[0];
	const last = data[data.length - 1];
	if (!first || !last) {
		return null;
	}
	const firstMs = first.date instanceof Date ? first.date.getTime() : Number(first.date);
	const lastMs = last.date instanceof Date ? last.date.getTime() : Number(last.date);
	if (!Number.isFinite(firstMs) || !Number.isFinite(lastMs)) {
		return null;
	}
	return {
		startMs: Math.min(firstMs, lastMs),
		endMs: Math.max(firstMs, lastMs),
	};
}

export function computeMissingSegments(target: TimeWindow, loaded: TimeWindow): MissingSegments {
	return {
		leftMissing: target.startMs < loaded.startMs,
		rightMissing: target.endMs > loaded.endMs,
		leftTargetMs: target.startMs,
		rightTargetMs: target.endMs,
	};
}

export function shouldScheduleFetch(previous: MissingSegments | null, next: MissingSegments): boolean {
	if (!previous) {
		return next.leftMissing || next.rightMissing;
	}
	if (next.leftMissing && (!previous.leftMissing || next.leftTargetMs < previous.leftTargetMs)) {
		return true;
	}
	if (next.rightMissing && (!previous.rightMissing || next.rightTargetMs > previous.rightTargetMs)) {
		return true;
	}
	return false;
}
