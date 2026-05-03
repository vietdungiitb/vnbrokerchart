import type { ReactNode } from "react";
import { useMemo } from "react";
import { scaleTime } from "d3-scale";

import ChartCanvas from "../../src/lib/ChartCanvas";
import type { StoryDatum } from "./storyData";
import { chartMargin, chartShellStyle, resolveStoryWidth } from "./chartTheme";
import { buildDefaultExtents } from "./storyData";

interface ChartSurfaceProps {
	data: StoryDatum[];
	height?: number;
	margin?: {
		left: number;
		right: number;
		top: number;
		bottom: number;
	};
	seriesName: string;
	xExtents?: [Date, Date] | ((data: StoryDatum[]) => [Date, Date]);
	children: ReactNode;
}

export function ChartSurface({ data, height = 620, margin = chartMargin, seriesName, xExtents, children }: ChartSurfaceProps) {
	const width = resolveStoryWidth();
	const xAccessor = (datum: StoryDatum) => datum.date;
	const displayXAccessor = xAccessor;
	const resolvedExtents = useMemo(() => {
		if (typeof xExtents === "function") {
			return xExtents(data);
		}

		return xExtents ?? buildDefaultExtents(data, 160);
	}, [data, xExtents]);

	return (
		<div style={chartShellStyle}>
			<ChartCanvas
				height={height}
				width={width}
				margin={margin}
				type="hybrid"
				seriesName={seriesName}
				data={data}
				xScale={scaleTime()}
				xAccessor={xAccessor}
				displayXAccessor={displayXAccessor}
				xExtents={resolvedExtents}
				mouseMoveEvent
				panEvent
				zoomEvent
				useCrossHairStyleCursor
				clamp
			>
				{children}
			</ChartCanvas>
		</div>
	);
}