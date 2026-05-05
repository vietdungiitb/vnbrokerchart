import type { DrawingToolDefinition } from "../types";
import { createDrawingObject, replacePoint } from "../shared";

const FIB_EXTENSION_LEVELS = [1.272, 1.414, 1.618, 2, 2.618];

const FibExtension: DrawingToolDefinition = {
	name: "fibExtension",
	createDraft: (startPoint) => createDrawingObject("fibExtension", [startPoint, startPoint], { fibLevels: FIB_EXTENSION_LEVELS }),
	updateDraft: (draft, nextPoint) => replacePoint(draft, 1, nextPoint),
	render: () => undefined,
};

export default FibExtension;