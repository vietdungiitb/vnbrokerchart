import type { DrawingToolDefinition } from "../types";
import { createDrawingObject, replacePoint } from "../shared";

const Fibonacci: DrawingToolDefinition = {
	name: "fibonacci",
	createDraft: (startPoint) => createDrawingObject("fibonacci", [startPoint, startPoint]),
	updateDraft: (draft, nextPoint) => replacePoint(draft, 1, nextPoint),
	render: () => undefined,
};

export default Fibonacci;