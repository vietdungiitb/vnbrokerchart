import { describe, expect, it } from "vitest";
import { HistoryFetchQueue } from "../historyFetchQueue";

describe("HistoryFetchQueue", () => {
	it("dedupes left jobs by keeping lower target", () => {
		const queue = new HistoryFetchQueue();
		queue.enqueue({ key: "k", side: "left", targetTs: 1000, priority: 1, generation: 1 });
		queue.enqueue({ key: "k", side: "left", targetTs: 900, priority: 1, generation: 1 });

		const job = queue.dequeue(1);
		expect(job?.targetTs).toBe(900);
	});

	it("dedupes right jobs by keeping higher target", () => {
		const queue = new HistoryFetchQueue();
		queue.enqueue({ key: "k", side: "right", targetTs: 2000, priority: 1, generation: 1 });
		queue.enqueue({ key: "k", side: "right", targetTs: 2500, priority: 1, generation: 1 });

		const job = queue.dequeue(1);
		expect(job?.targetTs).toBe(2500);
	});

	it("prioritizes higher priority jobs", () => {
		const queue = new HistoryFetchQueue();
		queue.enqueue({ key: "right", side: "right", targetTs: 3000, priority: 5, generation: 1 });
		queue.enqueue({ key: "left", side: "left", targetTs: 1000, priority: 10, generation: 1 });

		const first = queue.dequeue(1);
		expect(first?.side).toBe("left");
		queue.complete(first!.id);

		const second = queue.dequeue(1);
		expect(second?.side).toBe("right");
	});

	it("enforces single-flight until complete is called", () => {
		const queue = new HistoryFetchQueue();
		queue.enqueue({ key: "a", side: "left", targetTs: 1, priority: 1, generation: 1 });
		queue.enqueue({ key: "b", side: "left", targetTs: 2, priority: 1, generation: 1 });

		const first = queue.dequeue(1);
		expect(first).not.toBeNull();
		expect(queue.dequeue(1)).toBeNull();
		queue.complete(first!.id);
		expect(queue.dequeue(1)).not.toBeNull();
	});

	it("filters jobs by generation", () => {
		const queue = new HistoryFetchQueue();
		queue.enqueue({ key: "old", side: "left", targetTs: 1, priority: 1, generation: 1 });
		queue.enqueue({ key: "new", side: "left", targetTs: 1, priority: 1, generation: 2 });

		expect(queue.dequeue(2)?.key).toBe("new");
		expect(queue.dequeue(1)).toBeNull();
	});

	it("clears a generation", () => {
		const queue = new HistoryFetchQueue();
		queue.enqueue({ key: "old", side: "left", targetTs: 1, priority: 1, generation: 1 });
		queue.enqueue({ key: "new", side: "left", targetTs: 1, priority: 1, generation: 2 });
		queue.clearGeneration(1);

		expect(queue.dequeue(1)).toBeNull();
		expect(queue.dequeue(2)).not.toBeNull();
	});

	it("reports pending state", () => {
		const queue = new HistoryFetchQueue();
		expect(queue.hasPending()).toBe(false);
		queue.enqueue({ key: "k", side: "left", targetTs: 1, priority: 1, generation: 1 });
		expect(queue.hasPending()).toBe(true);
		expect(queue.hasPending(1)).toBe(true);
	});
});
