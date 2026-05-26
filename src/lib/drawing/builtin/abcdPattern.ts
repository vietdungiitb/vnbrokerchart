import type { ChartScales } from "../coordinateUtils";
import { chartPointToPixel } from "../coordinateUtils";
import type { DrawingObject, DrawingStyle, DrawingToolDefinition } from "../types";
import { createDrawingObject, defaultDrawingStyle, replaceNextPoint } from "../shared";

export const DEFAULT_ABCD_PATTERN_FILL = "#bfdbfe";
export const DEFAULT_ABCD_PATTERN_FILL_OPACITY = 0.08;

export interface AbcdPatternMetrics {
	points: Array<{ x: number; y: number }>;
	segmentMidpoints: Array<{ x: number; y: number }>;
	ab: number;
	bc: number;
	cd: number;
	bcToAb: number | null;
	cdToBc: number | null;
}

export function calculateAbcdPatternMetrics(drawing: DrawingObject, scales: ChartScales): AbcdPatternMetrics | null {
	const [aPoint, bPoint, cPoint, dPoint] = drawing.points;
	if (!aPoint || !bPoint || !cPoint || !dPoint) {
		return null;
	}

	const points = [aPoint, bPoint, cPoint, dPoint].map((point) => chartPointToPixel(point, scales));
	const [a, b, c, d] = points;
	const ab = Math.abs(b.y - a.y);
	const bc = Math.abs(c.y - b.y);
	const cd = Math.abs(d.y - c.y);

	return {
		points,
		segmentMidpoints: [
			{ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
			{ x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 },
			{ x: (c.x + d.x) / 2, y: (c.y + d.y) / 2 },
		],
		ab,
		bc,
		cd,
		bcToAb: ab > 0 ? bc / ab : null,
		cdToBc: bc > 0 ? cd / bc : null,
	};
}

export function resolveAbcdPatternFillColor(style: DrawingStyle): string {
	return style.fill && style.fill !== "transparent" ? style.fill : DEFAULT_ABCD_PATTERN_FILL;
}

export function resolveAbcdPatternFillOpacity(style: DrawingStyle): number {
	return style.fillOpacity ?? DEFAULT_ABCD_PATTERN_FILL_OPACITY;
}

const AbcdPattern: DrawingToolDefinition = {
	name: "abcdPattern",
	createDraft: (startPoint) => createDrawingObject("abcdPattern", [startPoint, startPoint, startPoint, startPoint], {
		style: {
			...defaultDrawingStyle,
			fill: DEFAULT_ABCD_PATTERN_FILL,
			fillOpacity: DEFAULT_ABCD_PATTERN_FILL_OPACITY,
		},
	}),
	updateDraft: (draft, nextPoint) => replaceNextPoint(draft, nextPoint),
	render: () => undefined,
};

export default AbcdPattern;