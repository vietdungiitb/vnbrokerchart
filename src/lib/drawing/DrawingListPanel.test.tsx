// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import DrawingListPanel, { type DrawingListPanelLabels } from "./DrawingListPanel";
import { createDrawingObject } from "./shared";

const reactActEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

const labels: DrawingListPanelLabels = {
	title: "Objects",
	empty: "No objects",
	alert: "Alert",
	visible: "Visible",
	hidden: "Hidden",
	locked: "Locked",
	selected: "Selected",
	delete: "Delete",
};

describe("DrawingListPanel", () => {
	let container: HTMLDivElement | null = null;
	let root: ReturnType<typeof createRoot> | null = null;
	const onSelect = vi.fn();
	const onToggleVisible = vi.fn();
	const onDelete = vi.fn();

	beforeEach(() => {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		onSelect.mockClear();
		onToggleVisible.mockClear();
		onDelete.mockClear();
	});

	afterEach(() => {
		act(() => {
			root?.unmount();
		});
		root = null;
		container?.remove();
		container = null;
	});

	it("groups drawings into collapsible pane and group trees", () => {
		const drawings = [
			createDrawingObject("trendLine", [
				{ x: 100_000, y: 20 },
				{ x: 160_000, y: 40 },
			], { id: "drawing-a", label: "Primary", paneId: "price", groupId: "trend-alpha", alert: { enabled: true, trigger: "touch" } }),
			createDrawingObject("trendLine", [
				{ x: 110_000, y: 22 },
				{ x: 170_000, y: 42 },
			], { id: "drawing-b", label: "Secondary", paneId: "price", groupId: "trend-alpha" }),
			createDrawingObject("rectangle", [
				{ x: 120_000, y: 30 },
				{ x: 180_000, y: 50 },
			], { id: "drawing-c", label: "Momentum", paneId: "oscillator" }),
			createDrawingObject("hLine", [
				{ x: 130_000, y: 45 },
				{ x: 190_000, y: 45 },
			], { id: "drawing-d", label: "Standalone" }),
		];

		act(() => {
			root?.render(
				<DrawingListPanel
					drawings={drawings}
					selectedId="drawing-a"
					labels={labels}
					onSelect={onSelect}
					onToggleVisible={onToggleVisible}
					onDelete={onDelete}
				/>,
			);
		});

		expect(container?.textContent).toContain("price");
		expect(container?.textContent).toContain("trend-alpha");
		expect(container?.textContent).toContain("Alert");
		expect(container?.textContent).toContain("oscillator");
		expect(container?.textContent).toContain("Standalone");
		expect(container?.textContent).toContain("Primary");

		const groupToggle = container?.querySelector<HTMLButtonElement>('button[aria-label="trend-alpha"]');
		expect(groupToggle).not.toBeNull();
		act(() => {
			groupToggle?.click();
		});

		expect(container?.textContent).toContain("trend-alpha");
		expect(container?.textContent).not.toContain("Primary");
		expect(container?.textContent).not.toContain("Secondary");

		const paneToggle = container?.querySelector<HTMLButtonElement>('button[aria-label="price"]');
		expect(paneToggle).not.toBeNull();
		act(() => {
			paneToggle?.click();
		});

		expect(container?.textContent).not.toContain("trend-alpha");
		expect(container?.textContent).toContain("oscillator");
		expect(container?.textContent).toContain("Standalone");
	});

	it("keeps leaf actions wired inside the tree", () => {
		const drawings = [
			createDrawingObject("trendLine", [
				{ x: 100_000, y: 20 },
				{ x: 160_000, y: 40 },
			], { id: "drawing-a", label: "Primary", paneId: "price", groupId: "trend-alpha" }),
			createDrawingObject("hLine", [
				{ x: 130_000, y: 45 },
				{ x: 190_000, y: 45 },
			], { id: "drawing-d", label: "Standalone" }),
		];

		act(() => {
			root?.render(
				<DrawingListPanel
					drawings={drawings}
					selectedId="drawing-a"
					labels={labels}
					onSelect={onSelect}
					onToggleVisible={onToggleVisible}
					onDelete={onDelete}
				/>,
			);
		});

		const standaloneSelect = Array.from(container?.querySelectorAll<HTMLButtonElement>(".rsc-drawing-list-panel__select") ?? [])
			.find((button) => button.textContent?.includes("Standalone"));
		expect(standaloneSelect).toBeDefined();
		act(() => {
			standaloneSelect?.click();
		});

		expect(onSelect).toHaveBeenCalledWith("drawing-d");

		const standaloneItem = Array.from(container?.querySelectorAll<HTMLElement>(".rsc-drawing-list-panel__item") ?? [])
			.find((item) => item.textContent?.includes("Standalone"));
		expect(standaloneItem).toBeDefined();
		const actionButtons = standaloneItem?.querySelectorAll<HTMLButtonElement>(".rsc-drawing-list-panel__icon");
		act(() => {
			actionButtons?.[0]?.click();
			actionButtons?.[1]?.click();
		});

		expect(onToggleVisible).toHaveBeenCalledWith("drawing-d");
		expect(onDelete).toHaveBeenCalledWith("drawing-d");
	});
});