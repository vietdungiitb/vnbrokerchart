import { useCallback, useMemo } from "react";
import type { ReactElement } from "react";
import { getXValue } from "../utils/ChartDataUtil";
import GenericComponent from "../GenericComponent";
import { createDraftFromTool, createTool, isDrawingToolName } from "./registry";
import { appendPoint, replacePoint } from "./shared";
import type { DrawingObject, DrawingToolType } from "./types";
import { renderDrawingToSvg, type RenderSvgOptions } from "./renderSvg";
import type { UseDrawingInteractionReturn } from "./useDrawingInteraction";
import { getSelectedObjectIds } from "./stateMachine";

export interface DrawingLayerProps {
	activeTool: string;
	interaction: UseDrawingInteractionReturn;
	onToolUsed?: () => void;
}

function resolveChartConfig(moreProps: any) {
	const chartConfigList = moreProps.chartConfig;
	if (Array.isArray(chartConfigList)) {
		return chartConfigList.find((each: any) => each.id === moreProps.chartId) || chartConfigList[0];
	}
	return chartConfigList;
}

function toChartPoint(moreProps: any): { x: number; y: number } | undefined {
	const chartConfig = resolveChartConfig(moreProps);
	const { mouseXY, currentItem, xAccessor, plotData, xScale } = moreProps;
	if (!Array.isArray(mouseXY) || !chartConfig || typeof chartConfig.yScale?.invert !== "function") {
		return undefined;
	}

	const xValue = currentItem && xAccessor
		? xAccessor(currentItem)
		: getXValue(xScale, xAccessor, mouseXY, plotData);
	const dateValue = xValue instanceof Date ? xValue : new Date(xValue);
	const yValue = chartConfig.yScale.invert(mouseXY[1]);

	if (!Number.isFinite(dateValue.getTime()) || !Number.isFinite(yValue)) {
		return undefined;
	}

	return { x: dateValue.getTime(), y: yValue };
}

function getSelectedDrawingId(drawingState: UseDrawingInteractionReturn["drawingState"]) {
	switch (drawingState.type) {
		case "selected":
			return drawingState.objectId;
		case "selectedMultiple":
			return undefined;
		case "moving":
		case "resizing":
		case "editing":
			return drawingState.objectId;
		default:
			return undefined;
	}
}

function buildRenderScales(moreProps: any) {
	const chartConfig = resolveChartConfig(moreProps);
	return {
		xScale: moreProps.xScale,
		xScaleInvert: moreProps.xScale.invert,
		yScale: chartConfig.yScale,
		yScaleInvert: chartConfig.yScale.invert,
		xAccessor: moreProps.xAccessor,
		plotData: moreProps.plotData,
	};
}

function currentDrawing(drawings: readonly DrawingObject[], drawingState: UseDrawingInteractionReturn["drawingState"]) {
	if (drawingState.type === "drawing" || drawingState.type === "complete") {
		return drawingState.object;
	}
	return drawings.find((drawing) => drawing.id === getSelectedDrawingId(drawingState));
}

export default function DrawingLayer({ activeTool, interaction, onToolUsed }: DrawingLayerProps) {
	const selectedObjectIds = useMemo(() => getSelectedObjectIds(interaction.drawingState), [interaction.drawingState]);
	const selectedObjectIdSet = useMemo(() => new Set(selectedObjectIds), [selectedObjectIds]);

	const renderSVG = useCallback((moreProps: any): ReactElement[] => {
		const chartConfig = resolveChartConfig(moreProps);
		if (!chartConfig) {
			return [];
		}

		const renderScales = buildRenderScales(moreProps);
		const drawings = interaction.history.present
			.map((drawing, index) => ({ drawing, index }))
			.filter(({ drawing }) => drawing.visible !== false)
			.sort((left, right) => (left.drawing.zIndex ?? 0) - (right.drawing.zIndex ?? 0) || left.index - right.index)
			.map(({ drawing }) => drawing);
		const draft = currentDrawing(drawings, interaction.drawingState);
		if (draft && !drawings.some((drawing) => drawing.id === draft.id)) {
			drawings.push(draft);
		}

		const handleSelect = (drawing: DrawingObject, event?: { shiftKey?: boolean }) => {
			if (event?.shiftKey) {
				const nextSelectedIds = selectedObjectIdSet.has(drawing.id)
					? selectedObjectIds.filter((id) => id !== drawing.id)
					: [...selectedObjectIds, drawing.id];
				interaction.dispatch({ type: "SET_SELECTED_OBJECTS", objectIds: nextSelectedIds });
				return;
			}

			interaction.dispatch({ type: "SELECT_OBJECT", objectId: drawing.id });
		};

		return drawings.flatMap((drawing) => renderDrawingToSvg(drawing, renderScales, {
			chartWidth: chartConfig.width,
			chartHeight: chartConfig.height,
			isSelected: selectedObjectIdSet.has(drawing.id),
			onSelect: activeTool === "cursor"
				? handleSelect
				: undefined,
		} satisfies RenderSvgOptions));
	}, [activeTool, interaction.drawingState, interaction.history.present, interaction.dispatch, selectedObjectIdSet, selectedObjectIds]);

	const handleMouseDown = useCallback((moreProps: any) => {
		if (!isDrawingToolName(activeTool)) {
			return;
		}

		if (activeTool === "polyline" && interaction.drawingState.type === "drawing" && interaction.drawingState.toolName === "polyline") {
			return;
		}

		const point = toChartPoint(moreProps);
		if (!point) {
			return;
		}

		const toolName = activeTool as DrawingToolType;
		interaction.dispatch({
			type: "START_DRAWING",
			toolName,
			object: createDraftFromTool(toolName, point),
		});
	}, [activeTool, interaction]);

	const handleMouseMove = useCallback((moreProps: any) => {
		if (interaction.drawingState.type !== "drawing") {
			return;
		}

		const point = toChartPoint(moreProps);
		if (!point) {
			return;
		}

		const tool = createTool(interaction.drawingState.toolName);
		const updated = tool.updateDraft(interaction.drawingState.object, point);
		interaction.dispatch({ type: "UPDATE_DRAWING", object: updated });
	}, [interaction]);

	const handleClick = useCallback((moreProps: any) => {
		if (interaction.drawingState.type !== "drawing" || !isDrawingToolName(activeTool)) {
			return;
		}

		const point = toChartPoint(moreProps);
		if (!point) {
			return;
		}

		const toolName = interaction.drawingState.toolName;
		const draft = interaction.drawingState.object;

		if (toolName === "channel") {
			const startPoint = draft.points[0];
			const midPoint = draft.points[1];
			if (startPoint && midPoint && midPoint.x === startPoint.x && midPoint.y === startPoint.y) {
				const updated = replacePoint(draft, 1, point);
				interaction.dispatch({ type: "UPDATE_DRAWING", object: updated });
				return;
			}

			const completed = replacePoint(draft, 2, point);
			interaction.dispatch({ type: "COMPLETE_DRAWING", object: completed });
			interaction.dispatch({ type: "PUSH", drawing: completed });
			interaction.dispatch({ type: "SELECT_OBJECT", objectId: completed.id });
			onToolUsed?.();
			return;
		}

		if (toolName === "polyline") {
			const updated = appendPoint(draft, point);
			interaction.dispatch({ type: "UPDATE_DRAWING", object: updated });
			return;
		}

		const completed = createTool(toolName).updateDraft(draft, point);
		interaction.dispatch({ type: "COMPLETE_DRAWING", object: completed });
		interaction.dispatch({ type: "PUSH", drawing: completed });
		interaction.dispatch({ type: "SELECT_OBJECT", objectId: completed.id });
		onToolUsed?.();
	}, [activeTool, interaction, onToolUsed]);

	const handleDoubleClick = useCallback((moreProps: any) => {
		if (interaction.drawingState.type !== "drawing" || interaction.drawingState.toolName !== "polyline") {
			return;
		}

		const point = toChartPoint(moreProps);
		if (!point) {
			return;
		}

		const tool = createTool("polyline");
		const completed = tool.updateDraft(interaction.drawingState.object, point);
		interaction.dispatch({ type: "UPDATE_DRAWING", object: completed });
		interaction.dispatch({ type: "COMPLETE_DRAWING", object: completed });
		interaction.dispatch({ type: "PUSH", drawing: completed });
		interaction.dispatch({ type: "SELECT_OBJECT", objectId: completed.id });
		onToolUsed?.();
	}, [interaction, onToolUsed]);

	const chartCursorClass = useMemo(() => {
		switch (activeTool) {
			case "hLine":
				return "react-stockcharts-ns-resize-cursor";
			case "vLine":
				return "react-stockcharts-ew-resize-cursor";
			case "text":
				return "react-stockcharts-default-cursor";
			case "cursor":
			case "crosshair":
				return undefined;
			default:
				return "react-stockcharts-crosshair-cursor";
		}
	}, [activeTool]);

	return (
		<GenericComponent
			clip={false}
			interactiveCursorClass={chartCursorClass}
			disablePan={isDrawingToolName(activeTool)}
			svgDraw={renderSVG}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onClick={handleClick}
			onDoubleClick={handleDoubleClick}
			drawOn={[
				"mousemove",
				"click",
				"drag",
				"dragend",
			]}
		/>
	);
}