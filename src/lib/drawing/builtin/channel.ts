import type { DrawingToolDefinition } from "../types";
import { createDrawingObject, replacePoint } from "../shared";

const Channel: DrawingToolDefinition = {
	name: "channel",
	createDraft: (startPoint) => createDrawingObject("channel", [startPoint, startPoint, startPoint]),
	updateDraft: (draft, nextPoint) => replacePoint(draft, 1, nextPoint),
	render: () => undefined,
};

export default Channel;