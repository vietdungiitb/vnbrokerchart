import { describe, expect, it, vi } from "vitest";
import { MockAdapter } from "../../src/lib/adapters/MockAdapter";

function heapUsed() {
	return process.memoryUsage().heapUsed;
}

describe("soak/adapter_concurrent", () => {
	it("handles 500 concurrent bar subscribers and cleans up correctly", () => {
		vi.useFakeTimers();
		const adapter = new MockAdapter({ intervalMs: 20 });

		let eventCount = 0;
		const unsubs = Array.from({ length: 500 }, () => (
			adapter.subscribeToBar("VCB", "1m", () => {
				eventCount += 1;
			})
		));

		// Each subscription emits once immediately.
		expect(eventCount).toBe(500);

		vi.advanceTimersByTime(60);
		expect(eventCount).toBeGreaterThan(500);

		for (const unsubscribe of unsubs) {
			unsubscribe();
		}

		const frozenCount = eventCount;
		vi.advanceTimersByTime(100);
		expect(eventCount).toBe(frozenCount);

		vi.useRealTimers();
	});

	it("keeps memory growth bounded across repeated subscribe/unsubscribe cycles", () => {
		const baseline = heapUsed();
		let peak = baseline;

		for (let cycle = 0; cycle < 6; cycle += 1) {
			const adapter = new MockAdapter({ intervalMs: 60_000 });
			const unsubs = Array.from({ length: 500 }, () => (
				adapter.subscribeToBar("FPT", "5m", () => undefined)
			));

			for (const unsubscribe of unsubs) {
				unsubscribe();
			}

			if (typeof globalThis.gc === "function") {
				globalThis.gc();
			}
			peak = Math.max(peak, heapUsed());
		}

		const deltaMb = (peak - baseline) / (1024 * 1024);
		// Heuristic budget for CI/runtime differences.
		expect(deltaMb).toBeLessThan(96);
	});
});
