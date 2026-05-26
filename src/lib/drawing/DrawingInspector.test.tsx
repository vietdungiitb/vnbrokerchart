// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { createDrawingObject } from "./shared";
import DrawingInspector from "./DrawingInspector";
import { clearDrawingStyleOverrides, getDrawingStyleOverride, overrideDrawingStyle } from "./drawingStyleRegistry";

const reactActEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;

const labels = {
	title: "Inspector",
	alert: "Alert",
	alertEnabled: "Enable alert",
	alertTrigger: "Trigger",
	alertTouch: "Touch",
	alertBreak: "Break",
	alertCloseAbove: "Close above",
	alertCloseBelow: "Close below",
	stroke: "Stroke",
	fill: "Fill",
	strokeWidth: "Stroke width",
	lineStyle: "Line style",
	opacity: "Opacity",
	solid: "Solid",
	dashed: "Dashed",
	dotted: "Dotted",
	lock: "Lock",
	unlock: "Unlock",
	clone: "Clone",
	hide: "Hide",
	show: "Show",
	bringToFront: "Bring to front",
	sendToBack: "Send to back",
	delete: "Delete",
	close: "Close",
};

const textLabels = {
	title: "Text",
	label: "Content",
	placeholder: "Enter text",
	edit: "Edit text",
	save: "Save",
	cancel: "Cancel",
	empty: "No text yet",
};

beforeEach(() => {
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);
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
	clearDrawingStyleOverrides();
});

describe("DrawingInspector text editing", () => {
	it("renders the text editor controls in active mode", () => {
		const drawing = createDrawingObject("text", [{ x: 120, y: 40 }], { id: "drawing-1", text: "Ghi chú" });
		const onChange = vi.fn();
		const onCommit = vi.fn();
		const onCancel = vi.fn();

		act(() => {
			root?.render(createElement(DrawingInspector, {
				drawing,
				labels,
				textEditor: {
					active: true,
					value: "Ghi chú",
					labels: textLabels,
					onChange,
					onStartEdit: vi.fn(),
					onCommit,
					onCancel,
				},
				onUpdate: vi.fn(),
				onDelete: vi.fn(),
				onClone: vi.fn(),
				onToggleLock: vi.fn(),
				onToggleVisible: vi.fn(),
				onBringToFront: vi.fn(),
				onSendToBack: vi.fn(),
				onClose: vi.fn(),
			}));
		});

		const textarea = container?.querySelector<HTMLTextAreaElement>("textarea");
		expect(textarea?.value).toBe("Ghi chú");

		const buttons = Array.from(container?.querySelectorAll<HTMLButtonElement>("button") ?? []);
		const saveButton = buttons.find((button) => button.textContent === "Save");
		const cancelButton = buttons.find((button) => button.textContent === "Cancel");

		act(() => {
			saveButton?.click();
			cancelButton?.click();
		});

		expect(onCommit).toHaveBeenCalledTimes(1);
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it("exposes the edit trigger when the editor is idle", () => {
		const drawing = createDrawingObject("text", [{ x: 120, y: 40 }], { id: "drawing-2", text: "Ghi chú" });
		const onStartEdit = vi.fn();

		act(() => {
			root?.render(createElement(DrawingInspector, {
				drawing,
				labels,
				textEditor: {
					active: false,
					value: "Ghi chú",
					labels: textLabels,
					onChange: vi.fn(),
					onStartEdit,
					onCommit: vi.fn(),
					onCancel: vi.fn(),
				},
				onUpdate: vi.fn(),
				onDelete: vi.fn(),
				onClone: vi.fn(),
				onToggleLock: vi.fn(),
				onToggleVisible: vi.fn(),
				onBringToFront: vi.fn(),
				onSendToBack: vi.fn(),
				onClose: vi.fn(),
			}));
		});

		const editButton = Array.from(container?.querySelectorAll<HTMLButtonElement>("button") ?? []).find((button) => button.textContent === "Edit text");
		act(() => {
			editButton?.click();
		});

		expect(onStartEdit).toHaveBeenCalledTimes(1);
	});

	it("reflects registry updates through the override subscription", () => {
		const drawing = createDrawingObject("trendLine", [{ x: 120, y: 40 }, { x: 160, y: 60 }], {
			id: "drawing-override",
			style: { stroke: "#111111", strokeWidth: 1 },
		});

		act(() => {
			root?.render(createElement(DrawingInspector, {
				drawing,
				labels,
				textEditor: undefined,
				position: undefined,
				onUpdate: vi.fn(),
				onDelete: vi.fn(),
				onClone: vi.fn(),
				onToggleLock: vi.fn(),
				onToggleVisible: vi.fn(),
				onBringToFront: vi.fn(),
				onSendToBack: vi.fn(),
				onClose: vi.fn(),
			}));
		});

		const strokeInput = container?.querySelector<HTMLInputElement>('input[type="color"]');
		expect(strokeInput?.value).toBe("#111111");

		act(() => {
			overrideDrawingStyle("drawing-override", { color: "#ff00ff" });
		});

		expect(strokeInput?.value).toBe("#ff00ff");
	});

	it("syncs style edits back to the resolved object snapshot and override registry", () => {
		const drawing = createDrawingObject("trendLine", [{ x: 120, y: 40 }, { x: 160, y: 60 }], {
			id: "drawing-sync",
			style: {
				stroke: "#111111",
				strokeWidth: 1,
				strokeDasharray: "dashed",
				fill: "#222222",
			},
		});
		const onUpdate = vi.fn();

		act(() => {
			root?.render(createElement(DrawingInspector, {
				drawing,
				labels,
				textEditor: undefined,
				position: undefined,
				onUpdate,
				onDelete: vi.fn(),
				onClone: vi.fn(),
				onToggleLock: vi.fn(),
				onToggleVisible: vi.fn(),
				onBringToFront: vi.fn(),
				onSendToBack: vi.fn(),
				onClose: vi.fn(),
			}));
		});

		act(() => {
			overrideDrawingStyle("drawing-sync", { color: "#ff0000" });
		});

		const strokeWidthInput = container?.querySelector<HTMLInputElement>('input[aria-label="Stroke width"]');
		expect(strokeWidthInput).not.toBeNull();

		act(() => {
			if (!strokeWidthInput) {
				return;
			}
			const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
			valueSetter?.call(strokeWidthInput, "4");
			strokeWidthInput.dispatchEvent(new Event("input", { bubbles: true }));
			strokeWidthInput.dispatchEvent(new Event("change", { bubbles: true }));
		});

		expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({
			style: expect.objectContaining({
				stroke: "#ff0000",
				strokeWidth: 4,
				fill: "#222222",
			}),
		}));
		expect(getDrawingStyleOverride("drawing-sync")).toEqual({
			color: "#ff0000",
			lineWidth: 4,
		});
	});

	it("renders batch actions in multi-select mode", () => {
		const drawing = createDrawingObject("trendLine", [{ x: 120, y: 40 }, { x: 160, y: 60 }], {
			id: "drawing-multi",
			style: { stroke: "#111111", strokeWidth: 1 },
		});
		const onToggleLock = vi.fn();
		const onToggleVisible = vi.fn();
		const onBringToFront = vi.fn();
		const onSendToBack = vi.fn();
		const onDelete = vi.fn();

		act(() => {
			root?.render(createElement(DrawingInspector, {
				drawing,
				labels,
				selectionCount: 2,
				selectionSummary: "Selected 2 drawings",
				selectionLocked: false,
				selectionVisible: true,
				textEditor: undefined,
				position: undefined,
				onUpdate: vi.fn(),
				onDelete,
				onClone: vi.fn(),
				onToggleLock,
				onToggleVisible,
				onBringToFront,
				onSendToBack,
				onClose: vi.fn(),
			}));
		});

		expect(container?.textContent).toContain("Selected 2 drawings");
		expect(container?.querySelectorAll('input[type="color"]').length).toBe(0);

		const buttons = Array.from(container?.querySelectorAll<HTMLButtonElement>("button") ?? []);
		const lockButton = buttons.find((button) => button.textContent === "Lock");
		const hideButton = buttons.find((button) => button.textContent === "Hide");
		const bringButton = buttons.find((button) => button.textContent === "Bring to front");
		const sendButton = buttons.find((button) => button.textContent === "Send to back");
		const deleteButton = buttons.find((button) => button.textContent === "Delete");

		act(() => {
			lockButton?.click();
			hideButton?.click();
			bringButton?.click();
			sendButton?.click();
			deleteButton?.click();
		});

		expect(onToggleLock).toHaveBeenCalledTimes(1);
		expect(onToggleVisible).toHaveBeenCalledTimes(1);
		expect(onBringToFront).toHaveBeenCalledTimes(1);
		expect(onSendToBack).toHaveBeenCalledTimes(1);
		expect(onDelete).toHaveBeenCalledTimes(1);
	});
});

describe("DrawingInspector alert editing", () => {
	it("renders alert controls for supported drawings and syncs alert changes", () => {
		const drawing = createDrawingObject("hLine", [{ x: 120, y: 40 }, { x: 160, y: 40 }], {
			id: "drawing-alert",
			alert: { enabled: false, trigger: "touch" },
		});
		const enabledDrawing = {
			...drawing,
			alert: { enabled: true as const, trigger: "touch" as const },
		};
		const onUpdate = vi.fn();

		act(() => {
			root?.render(createElement(DrawingInspector, {
				drawing,
				labels,
				textEditor: undefined,
				position: undefined,
				onUpdate,
				onDelete: vi.fn(),
				onClone: vi.fn(),
				onToggleLock: vi.fn(),
				onToggleVisible: vi.fn(),
				onBringToFront: vi.fn(),
				onSendToBack: vi.fn(),
				onClose: vi.fn(),
			}));
		});

		expect(container?.textContent).toContain("Alert");

		const alertToggle = container?.querySelector<HTMLInputElement>('input[type="checkbox"][aria-label="Enable alert"]');
		const alertTrigger = container?.querySelector<HTMLSelectElement>('select[aria-label="Trigger"]');
		expect(alertToggle?.checked).toBe(false);
		expect(alertTrigger?.value).toBe("touch");

		act(() => {
			alertToggle?.click();
		});

		expect(onUpdate).toHaveBeenLastCalledWith(expect.objectContaining({
			alert: {
				enabled: true,
				trigger: "touch",
			},
		}));

		act(() => {
			root?.render(createElement(DrawingInspector, {
				drawing: enabledDrawing,
				labels,
				textEditor: undefined,
				position: undefined,
				onUpdate,
				onDelete: vi.fn(),
				onClone: vi.fn(),
				onToggleLock: vi.fn(),
				onToggleVisible: vi.fn(),
				onBringToFront: vi.fn(),
				onSendToBack: vi.fn(),
				onClose: vi.fn(),
			}));
		});

		const enabledAlertTrigger = container?.querySelector<HTMLSelectElement>('select[aria-label="Trigger"]');

		act(() => {
			if (!enabledAlertTrigger) {
				return;
			}
			const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")?.set;
			valueSetter?.call(enabledAlertTrigger, "closeBelow");
			enabledAlertTrigger.dispatchEvent(new Event("change", { bubbles: true }));
		});

		expect(onUpdate).toHaveBeenLastCalledWith(expect.objectContaining({
			alert: {
				enabled: true,
				trigger: "closeBelow",
			},
		}));
	});
});