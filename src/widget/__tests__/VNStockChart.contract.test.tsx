// @vitest-environment jsdom
import type { ReactElement } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const reactActEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
const originalConsoleError = console.error;
console.error = (..._args: unknown[]) => {};

vi.mock("../../lib/core/hooks/useCanvasResize", () => {
	const ref = { current: null as HTMLDivElement | null };
	return {
		useCanvasResize: () => ({
			ref,
			size: { width: 1200, height: 720 },
		}),
	};
});

let act: typeof import("react").act;
let createRoot: typeof import("react-dom/client").createRoot;
let VNStockChart: typeof import("../VNStockChart").VNStockChart;
let WidgetErrorBoundary: typeof import("../WidgetErrorBoundary").WidgetErrorBoundary;
let WidgetI18nProvider: typeof import("../context/WidgetI18nContext").WidgetI18nProvider;

beforeAll(async () => {
	({ act } = await import("react"));
	({ createRoot } = await import("react-dom/client"));
	({ VNStockChart } = await import("../VNStockChart"));
	({ WidgetErrorBoundary } = await import("../WidgetErrorBoundary"));
	({ WidgetI18nProvider } = await import("../context/WidgetI18nContext"));
});

type Deferred<T> = {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (reason?: unknown) => void;
};

function createDeferred<T>(): Deferred<T> {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((promiseResolve, promiseReject) => {
		resolve = promiseResolve;
		reject = promiseReject;
	});
	return { promise, resolve, reject };
}

function createAdapter(fetchBarsPromise: Promise<any[]>, label: string) {
	return {
		fetchBars: vi.fn().mockReturnValue(fetchBarsPromise),
		fetchMoreBars: vi.fn().mockResolvedValue([]),
		subscribeToBar: vi.fn().mockReturnValue(() => {}),
		subscribeToTrades: vi.fn().mockReturnValue(() => {}),
		subscribeToOrderbook: vi.fn().mockReturnValue(() => {}),
		searchSymbols: vi.fn().mockResolvedValue([]),
		label,
	};
}

describe("VNStockChart", () => {
	let container: HTMLDivElement | null = null;
	let root: ReturnType<typeof createRoot> | null = null;
	let abortSpy: any = null;

	beforeEach(() => {
		window.localStorage.clear();
		document.documentElement.lang = "en";
		abortSpy = vi.spyOn(AbortController.prototype, "abort");
	});

	afterEach(() => {
		root?.unmount();
		root = null;
		container?.remove();
		container = null;
		abortSpy?.mockRestore();
		abortSpy = null;
		window.localStorage.clear();
		document.documentElement.lang = "en";
	});

	afterAll(() => {
		console.error = originalConsoleError;
	});

	it("shows the loading and empty states when no bars are available", async () => {
		const fetchDeferred = createDeferred<any[]>();
		const adapter = createAdapter(fetchDeferred.promise, "empty");

		container = document.createElement("div");
		container.style.width = "1200px";
		container.style.height = "720px";
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(<VNStockChart adapter={adapter as never} locale="vi" />);
		});

		expect(container.textContent).toContain("Đang tải biểu đồ…");

		await act(async () => {
			fetchDeferred.resolve([]);
			await Promise.resolve();
		});

		expect(container.textContent).toContain("Chưa có dữ liệu");
		expect(adapter.fetchBars).toHaveBeenCalledTimes(1);
	});

	it("aborts the in-flight fetch when adapter changes", async () => {
		const firstFetch = createDeferred<any[]>();
		const secondFetch = createDeferred<any[]>();
		const firstAdapter = createAdapter(firstFetch.promise, "first");
		const secondAdapter = createAdapter(secondFetch.promise, "second");

		container = document.createElement("div");
		container.style.width = "1200px";
		container.style.height = "720px";
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(<VNStockChart adapter={firstAdapter as never} locale="en" />);
		});

		await act(async () => {
			root?.render(<VNStockChart adapter={secondAdapter as never} locale="en" />);
		});

		expect(abortSpy?.mock.calls.length ?? 0).toBeGreaterThan(0);

		await act(async () => {
			firstFetch.resolve([]);
			secondFetch.resolve([]);
			await Promise.resolve();
		});
	});

	it("renders the error boundary fallback when the chart subtree throws", async () => {
		function ThrowingChild(): ReactElement {
			throw new Error("boom");
		}

		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(
				<WidgetI18nProvider locale="en">
					<WidgetErrorBoundary>
						<ThrowingChild />
					</WidgetErrorBoundary>
				</WidgetI18nProvider>,
			);
		});

		expect(container.textContent).toContain("An error occurred in the chart");
	});
});
