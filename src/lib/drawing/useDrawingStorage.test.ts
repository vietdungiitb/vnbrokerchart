// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement, useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import type { DrawingObject } from "./types";
import type { DrawingStorageAdapter } from "./DrawingStorage";
import { createDrawingObject } from "./shared";
import { clearDrawingStyleTemplates } from "./drawingStyleRegistry";
import { useDrawingStorage } from "./useDrawingStorage";

const reactActEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

type StorageProbeProps = {
	symbol: string;
	timeframe: string;
	adapter?: DrawingStorageAdapter;
	initialDrawings?: readonly DrawingObject[];
};

let container: HTMLDivElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;
let latestDrawings: readonly DrawingObject[] = [];
let loadCalls: DrawingObject[][] = [];
let storageMock: ReturnType<typeof createStorageMock> | null = null;

function createStorageMock() {
	const store = new Map<string, string>();
	return {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => {
			store.set(key, value);
		},
		removeItem: (key: string) => {
			store.delete(key);
		},
	};
}

function StorageProbe({ symbol, timeframe, adapter, initialDrawings = [] }: StorageProbeProps) {
	const [drawings, setDrawings] = useState<readonly DrawingObject[]>(initialDrawings);
	latestDrawings = drawings;
	const handleLoad = useCallback((nextDrawings: DrawingObject[]) => {
		loadCalls.push(nextDrawings);
		setDrawings(nextDrawings);
	}, []);
	useDrawingStorage(symbol, timeframe, drawings, handleLoad, adapter);
	return null;
}

function renderStorageProbe(props: StorageProbeProps) {
	const currentRoot = root;
	if (!currentRoot) {
		throw new Error("storage probe root is not available");
	}

	act(() => {
		currentRoot.render(createElement(StorageProbe, props));
	});
}

beforeEach(() => {
	storageMock = createStorageMock();
	vi.stubGlobal("localStorage", storageMock);
	clearDrawingStyleTemplates();
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);
	latestDrawings = [];
	loadCalls = [];
});

afterEach(() => {
	if (root) {
		act(() => {
			root?.unmount();
		});
	}
	root = null;
	container?.remove();
	container = null;
	vi.unstubAllGlobals();
	clearDrawingStyleTemplates();
	storageMock = null;
});

describe("useDrawingStorage", () => {
	it("clears stale drawings when the storage key changes and no cache exists", () => {
		const seedDrawing = createDrawingObject("trendLine", [
			{ x: 100_000, y: 20 },
			{ x: 160_000, y: 40 },
		], { id: "drawing-1" });

		storageMock?.setItem(
			"rsc-drawings-v1-BTCUSD-1h",
			JSON.stringify({ drawings: [seedDrawing], styleTemplates: {} }),
		);

		renderStorageProbe({ symbol: "BTCUSD", timeframe: "1h" });
		expect(loadCalls).toEqual([[seedDrawing]]);
		expect(latestDrawings).toEqual([seedDrawing]);

		renderStorageProbe({ symbol: "ETHUSD", timeframe: "1h" });
		expect(loadCalls).toEqual([[seedDrawing], []]);
		expect(latestDrawings).toEqual([]);
	});

	it("preserves seeded drawings for explicit adapters when storage is empty", () => {
		const seedDrawing = createDrawingObject("trendLine", [
			{ x: 100_000, y: 20 },
			{ x: 160_000, y: 40 },
		], { id: "drawing-2" });
		const adapter: DrawingStorageAdapter = {
			load: vi.fn(() => ({ drawings: [seedDrawing], hasData: false })),
			save: vi.fn(),
			clear: vi.fn(),
			exportJSON: vi.fn(() => JSON.stringify([seedDrawing])),
			importJSON: vi.fn(() => [seedDrawing]),
		};

		renderStorageProbe({ symbol: "BTCUSD", timeframe: "1h", adapter, initialDrawings: [seedDrawing] });
		expect(loadCalls).toEqual([]);
		expect(latestDrawings).toEqual([seedDrawing]);

		renderStorageProbe({ symbol: "ETHUSD", timeframe: "1h", adapter, initialDrawings: [seedDrawing] });
		expect(loadCalls).toEqual([]);
		expect(latestDrawings).toEqual([seedDrawing]);
	});
});
