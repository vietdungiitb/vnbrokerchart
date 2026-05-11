export type FetchSide = "left" | "right";

export type StopReason = "TARGET_REACHED" | "EMPTY_PAGE" | "NO_PROGRESS" | "MAX_PAGES" | "ERROR";

export interface EnqueueFetchJob {
	key: string;
	side: FetchSide;
	targetTs: number;
	priority: number;
	generation: number;
}

export interface FetchJob extends EnqueueFetchJob {
	id: string;
	createdAt: number;
}

function mergeTarget(side: FetchSide, currentTarget: number, nextTarget: number) {
	return side === "left" ? Math.min(currentTarget, nextTarget) : Math.max(currentTarget, nextTarget);
}

export class HistoryFetchQueue {
	private jobs: FetchJob[] = [];
	private inflight: FetchJob | null = null;

	enqueue(input: EnqueueFetchJob): FetchJob {
		const existing = this.jobs.find((job) => job.key === input.key && job.side === input.side && job.generation === input.generation);
		if (existing) {
			existing.targetTs = mergeTarget(input.side, existing.targetTs, input.targetTs);
			existing.priority = Math.max(existing.priority, input.priority);
			return existing;
		}

		const job: FetchJob = {
			...input,
			id: `${input.key}:${input.side}:${input.generation}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
			createdAt: Date.now(),
		};
		this.jobs.push(job);
		return job;
	}

	dequeue(generation: number): FetchJob | null {
		if (this.inflight) {
			return null;
		}

		const candidates = this.jobs.filter((job) => job.generation === generation);
		if (candidates.length === 0) {
			return null;
		}

		candidates.sort((left, right) => {
			if (left.priority !== right.priority) {
				return right.priority - left.priority;
			}
			return left.createdAt - right.createdAt;
		});

		const next = candidates[0];
		if (!next) {
			return null;
		}

		this.jobs = this.jobs.filter((job) => job.id !== next.id);
		this.inflight = next;
		return next;
	}

	complete(id: string) {
		if (this.inflight?.id === id) {
			this.inflight = null;
		}
	}

	hasPending(generation?: number): boolean {
		if (typeof generation === "number") {
			return this.jobs.some((job) => job.generation === generation) || this.inflight?.generation === generation;
		}
		return this.jobs.length > 0 || this.inflight !== null;
	}

	clearGeneration(generation: number) {
		this.jobs = this.jobs.filter((job) => job.generation !== generation);
		if (this.inflight?.generation === generation) {
			this.inflight = null;
		}
	}

	clearAll() {
		this.jobs = [];
		this.inflight = null;
	}

	snapshot() {
		return {
			pending: this.jobs.length,
			inflight: this.inflight,
		};
	}
}
