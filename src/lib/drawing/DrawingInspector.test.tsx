// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { createDrawingObject } from "./shared";
import DrawingInspector from "./DrawingInspector";
import { clearDrawingStyleOverrides, overrideDrawingStyle } from "./drawingStyleRegistry";

const reactActEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;

const labels = {
	title: "Inspector",
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
});