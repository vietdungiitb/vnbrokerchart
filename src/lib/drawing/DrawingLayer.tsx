import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { getXValue } from "../utils/ChartDataUtil";
import GenericChartComponent, { getMouseCanvas } from "../GenericChartComponent";
import { createDraftFromTool, createTool, isDrawingToolName } from "./registry";
import { appendPoint, replaceNextPoint, replacePoint } from "./shared";
import type { DrawingObject, DrawingToolType, Point } from "./types";
import { renderDrawingToCanvas, clipSegmentToBox, type RenderCanvasOptions } from "./renderCanvas";
import { getResizeHandleIndex, hitTestDrawing } from "./hitTest";
import { findSnapPoint, MAGNET_TOLERANCE, type MagnetSensitivity, type SnapResult } from "./snap";
import type { UseDrawingInteractionReturn } from "./useDrawingInteraction";
import { getSelectedObjectIds } from "./stateMachine";
import type { ChartConfig } from "../StockChartContext";
import { subscribeDrawingStyleChanges } from "./drawingStyleRegistry";
import { useLongPress } from "./useLongPress";
import { chartPointToPixel } from "./coordinateUtils";

export interface DrawingLayerProps {
	activeTool: string;
	interaction: UseDrawingInteractionReturn;
	magnetSensitivity?: MagnetSensitivity;
	onToolUsed?: () => void;
	onContextMenu?: (moreProps: any, event: unknown) => void;
}

type ChartConfigLike = ChartConfig;

function getChartConfigList(moreProps: any): ChartConfigLike[] {
	const chartConfigList = moreProps.chartConfigList ?? moreProps.chartConfig;
	if (Array.isArray(chartConfigList)) {
		return chartConfigList;
	}
	return chartConfigList ? [chartConfigList] : [];
}

function resolveBaseChartConfig(moreProps: any): ChartConfigLike | undefined {
	const chartConfigList = getChartConfigList(moreProps);
	if (chartConfigList.length === 0) {
		return undefined;
	}

	return chartConfigList.find((each) => each.id === moreProps.chartId) || chartConfigList[0];
}

function resolveActiveChartConfig(moreProps: any): ChartConfigLike | undefined {
	const chartConfigList = getChartConfigList(moreProps);
	if (chartConfigList.length === 0) {
		return undefined;
	}

	const currentCharts = Array.isArray(moreProps.currentCharts) ? moreProps.currentCharts : [];
	for (const chartId of currentCharts) {
		const match = chartConfigList.find((each) => each.id === chartId);
		if (match) {
			return match;
		}
	}

	return resolveBaseChartConfig(moreProps);
}

function resolveDrawingChartConfig(moreProps: any, drawing?: DrawingObject, preferCurrentCharts = false): ChartConfigLike | undefined {
	const chartConfigList = getChartConfigList(moreProps);
	if (chartConfigList.length === 0) {
		return undefined;
	}

	if (drawing?.paneId) {
		const paneChartConfigs = chartConfigList.filter((each) => each.paneId === drawing.paneId);
		if (drawing.yScaleId) {
			const exactMatch = paneChartConfigs.find((each) => each.yScaleId === drawing.yScaleId);
			if (exactMatch) {
				return exactMatch;
			}
		}

		if (preferCurrentCharts) {
			const currentCharts = Array.isArray(moreProps.currentCharts) ? moreProps.currentCharts : [];
			const currentMatch = paneChartConfigs.find((each) => currentCharts.includes(each.id));
			if (currentMatch) {
				return currentMatch;
			}
		}

		if (paneChartConfigs.length > 0) {
			return paneChartConfigs[0];
		}
	}

	return resolveActiveChartConfig(moreProps);
}

function getAdjustedMousePosition(
	moreProps: any,
	targetChartConfig: ChartConfigLike,
	mousePosition: readonly [number, number] = moreProps.mouseXY,
): readonly [number, number] | undefined {
	const baseChartConfig = resolveBaseChartConfig(moreProps);
	if (!baseChartConfig || !Array.isArray(mousePosition)) {
		return undefined;
	}

	const [mouseX, mouseY] = mousePosition;
	const [baseOriginX, baseOriginY] = baseChartConfig.origin;
	const [targetOriginX, targetOriginY] = targetChartConfig.origin;
	return [mouseX + baseOriginX - targetOriginX, mouseY + baseOriginY - targetOriginY];
}

function toChartPoint(
	moreProps: any,
	mousePosition: readonly [number, number] = moreProps.mouseXY,
	chartConfig = resolveActiveChartConfig(moreProps),
): { x: number; y: number } | undefined {
	const targetChartConfig = chartConfig;
	const { currentItem, xAccessor, plotData, xScale } = moreProps;
	if (!targetChartConfig || typeof targetChartConfig.yScale?.invert !== "function") {
		return undefined;
	}

	const adjustedMousePosition = getAdjustedMousePosition(moreProps, targetChartConfig, mousePosition);
	if (!adjustedMousePosition) {
		return undefined;
	}

	const xValue = currentItem && xAccessor
		? xAccessor(currentItem)
		: getXValue(xScale, xAccessor, adjustedMousePosition, plotData);
	const dateValue = xValue instanceof Date ? xValue : new Date(xValue);
	const yValue = targetChartConfig.yScale.invert(adjustedMousePosition[1]);

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

function sortVisibleDrawings(drawings: readonly DrawingObject[]) {
	return drawings
		.map((drawing, index) => ({ drawing, index }))
		.filter(({ drawing }) => drawing.visible !== false)
		.sort((left, right) => (left.drawing.zIndex ?? 0) - (right.drawing.zIndex ?? 0) || left.index - right.index)
		.map(({ drawing }) => drawing);
}

function buildRenderScales(moreProps: any, chartConfig = resolveBaseChartConfig(moreProps)) {
	if (!chartConfig) {
		return undefined;
	}

	return {
		xScale: moreProps.xScale,
		xScaleInvert: moreProps.xScale.invert,
		yScale: chartConfig.yScale,
		yScaleInvert: chartConfig.yScale.invert,
		xAccessor: moreProps.xAccessor,
		plotData: moreProps.plotData,
	};
}

function getVisibleDrawings(interaction: UseDrawingInteractionReturn) {
	return sortVisibleDrawings(interaction.history.present);
}

function findHitDrawing(
	interaction: UseDrawingInteractionReturn,
	moreProps: any,
	hitIndexRef: MutableRefObject<SpatialIndexCache | null>,
	styleRevision: number,
) {
	const cachedIndex = hitIndexRef.current;
	const signature = buildSpatialIndexSignature(moreProps);
	const spatialIndex = cachedIndex
		&& cachedIndex.sourceDrawings === interaction.history.present
		&& cachedIndex.styleRevision === styleRevision
		&& cachedIndex.signature === signature
		? cachedIndex
		: (hitIndexRef.current = buildSpatialIndex(interaction.history.present, moreProps, styleRevision));
	const candidateDrawings = querySpatialIndex(spatialIndex, moreProps);
	if (candidateDrawings.length === 0) {
		return undefined;
	}

	const drawingsToCheck = candidateDrawings;
	return drawingsToCheck.find((drawing) => {
		const chartConfig = resolveDrawingChartConfig(moreProps, drawing, true);
		if (!chartConfig) {
			return false;
		}

		const renderScales = buildRenderScales(moreProps, chartConfig);
		if (!renderScales) {
			return false;
		}

		const adjustedMousePosition = getAdjustedMousePosition(moreProps, chartConfig);
		if (!adjustedMousePosition) {
			return false;
		}

		const [mouseX, mouseY] = adjustedMousePosition;
		return hitTestDrawing(drawing, mouseX, mouseY, renderScales, {
			chartWidth: chartConfig.width,
			chartHeight: chartConfig.height,
			plotData: renderScales.plotData,
		});
	});
}

function withChartTranslation(
	ctx: CanvasRenderingContext2D,
	baseChartConfig: ChartConfigLike,
	targetChartConfig: ChartConfigLike,
	render: () => void,
) {
	const [baseOriginX, baseOriginY] = baseChartConfig.origin;
	const [targetOriginX, targetOriginY] = targetChartConfig.origin;
	const deltaX = targetOriginX - baseOriginX;
	const deltaY = targetOriginY - baseOriginY;

	if (deltaX === 0 && deltaY === 0) {
		render();
		return;
	}

	ctx.save();
	ctx.translate(deltaX, deltaY);
	try {
		render();
	} finally {
		ctx.restore();
	}
}

function translateDrawing(drawing: DrawingObject, deltaX: number, deltaY: number): DrawingObject {
	if (deltaX === 0 && deltaY === 0) {
		return drawing;
	}

	return {
		...drawing,
		points: drawing.points.map((point) => ({
			x: point.x + deltaX,
			y: point.y + deltaY,
		})),
		style: { ...drawing.style },
		fibLevels: drawing.fibLevels ? [...drawing.fibLevels] : undefined,
		riskReward: drawing.riskReward ? { ...drawing.riskReward } : undefined,
		updatedAt: Date.now(),
	};
}

export function translateDrawingsByIds(
	drawings: readonly DrawingObject[],
	objectIds: readonly string[],
	deltaX: number,
	deltaY: number,
) {
	if (deltaX === 0 && deltaY === 0) {
		return [...drawings];
	}

	const selectedObjectIdSet = new Set(objectIds);
	return drawings.map((drawing) => (selectedObjectIdSet.has(drawing.id)
		? translateDrawing(drawing, deltaX, deltaY)
		: drawing));
}

function calculatePositionRiskReward(type: DrawingObject["type"], startPoint: Point | undefined, endPoint: Point | undefined) {
	if (!startPoint || !endPoint) {
		return undefined;
	}

	if (type === "longPosition") {
		return {
			entry: startPoint.y,
			stop: Math.min(startPoint.y, endPoint.y),
			target: Math.max(startPoint.y, endPoint.y),
		};
	}

	if (type === "shortPosition") {
		return {
			entry: startPoint.y,
			stop: Math.max(startPoint.y, endPoint.y),
			target: Math.min(startPoint.y, endPoint.y),
		};
	}

	return undefined;
}

function constrainResizePoint(drawing: DrawingObject, handleIndex: number, nextPoint: Point): Point {
	switch (drawing.type) {
		case "hLine": {
			const anchorIndex = handleIndex === 0 ? 1 : 0;
			const anchorPoint = drawing.points[anchorIndex];
			return {
				x: nextPoint.x,
				y: anchorPoint?.y ?? nextPoint.y,
			};
		}
		case "vLine": {
			const anchorIndex = handleIndex === 0 ? 1 : 0;
			const anchorPoint = drawing.points[anchorIndex];
			return {
				x: anchorPoint?.x ?? nextPoint.x,
				y: nextPoint.y,
			};
		}
		default:
			return nextPoint;
	}
}

function resizeDrawing(drawing: DrawingObject, handleIndex: number, nextPoint: Point): DrawingObject {
	if (drawing.points.length === 0) {
		return drawing;
	}

	const targetIndex = Math.max(0, Math.min(handleIndex, drawing.points.length - 1));
	const constrainedPoint = constrainResizePoint(drawing, targetIndex, nextPoint);
	const updated = replacePoint(drawing, targetIndex, { ...constrainedPoint });
	const resized: DrawingObject = {
		...updated,
		style: { ...drawing.style },
		fibLevels: drawing.fibLevels ? [...drawing.fibLevels] : undefined,
		riskReward: drawing.riskReward ? { ...drawing.riskReward } : undefined,
		updatedAt: Date.now(),
	};

	if (drawing.type === "longPosition" || drawing.type === "shortPosition") {
		return {
			...resized,
			riskReward: calculatePositionRiskReward(drawing.type, resized.points[0], resized.points[1]),
		};
	}

	return resized;
}

export function resizeDrawingsByIds(
	drawings: readonly DrawingObject[],
	objectIds: readonly string[],
	handleIndex: number,
	nextPoint: Point,
) {
	if (objectIds.length === 0) {
		return [...drawings];
	}

	const selectedObjectIdSet = new Set(objectIds);
	return drawings.map((drawing) => (selectedObjectIdSet.has(drawing.id)
		? resizeDrawing(drawing, handleIndex, nextPoint)
		: drawing));
}

function getSnapPoint(
	moreProps: any,
	interaction: UseDrawingInteractionReturn,
	activeTool: string,
	magnetSensitivity: MagnetSensitivity,
	chartConfig = resolveActiveChartConfig(moreProps),
): SnapResult | null {
	if (!isDrawingToolName(activeTool)) {
		return null;
	}

	if (!chartConfig) {
		return null;
	}

	const plotData = Array.isArray(moreProps.plotData) ? moreProps.plotData : [];
	const renderScales = buildRenderScales(moreProps, chartConfig);
	if (!renderScales) {
		return null;
	}

	const adjustedMousePosition = getAdjustedMousePosition(moreProps, chartConfig);
	if (!adjustedMousePosition) {
		return null;
	}

	const [mouseX, mouseY] = adjustedMousePosition;
	const tolerance = MAGNET_TOLERANCE[magnetSensitivity];
	return findSnapPoint(mouseX, mouseY, renderScales, plotData, getVisibleDrawings(interaction), tolerance);
}

function toDrawingPoint(moreProps: any, interaction: UseDrawingInteractionReturn, activeTool: string, magnetSensitivity: MagnetSensitivity) {
	const chartConfig = interaction.drawingState.type === "drawing"
		? resolveDrawingChartConfig(moreProps, interaction.drawingState.object)
		: resolveActiveChartConfig(moreProps);
	const point = toChartPoint(moreProps, moreProps.mouseXY, chartConfig);
	if (!point) {
		return undefined;
	}

	const snap = getSnapPoint(moreProps, interaction, activeTool, magnetSensitivity, chartConfig);
	return {
		point: snap?.chartPoint ?? point,
		snap,
	};
}

function currentDrawing(drawings: readonly DrawingObject[], drawingState: UseDrawingInteractionReturn["drawingState"]) {
	if (drawingState.type === "drawing" || drawingState.type === "complete") {
		return drawingState.object;
	}
	return drawings.find((drawing) => drawing.id === getSelectedDrawingId(drawingState));
}

const SPATIAL_INDEX_CELL_SIZE = 96;
const SPATIAL_INDEX_PADDING = 48;

interface SpatialBounds {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

interface SpatialCandidate {
	drawing: DrawingObject;
	orderIndex: number;
}

interface SpatialIndexGroup {
	chartConfig: ChartConfigLike;
	buckets: Map<string, SpatialCandidate[]>;
}

interface SpatialIndexCache {
	sourceDrawings: readonly DrawingObject[];
	styleRevision: number;
	signature: string;
	groups: Map<string, SpatialIndexGroup>;
}

function getCellKey(xIndex: number, yIndex: number) {
	return `${xIndex}:${yIndex}`;
}

function normalizeBounds(bounds: SpatialBounds, padding: number, width: number, height: number): SpatialBounds {
	return {
		minX: Math.max(0, bounds.minX - padding),
		minY: Math.max(0, bounds.minY - padding),
		maxX: Math.min(width, bounds.maxX + padding),
		maxY: Math.min(height, bounds.maxY + padding),
	};
}

function boundsFromPixels(points: ReadonlyArray<{ x: number; y: number }>, padding: number, width: number, height: number): SpatialBounds | null {
	if (points.length === 0) {
		return null;
	}

	const xs = points.map((point) => point.x);
	const ys = points.map((point) => point.y);
	return normalizeBounds({
		minX: Math.min(...xs),
		minY: Math.min(...ys),
		maxX: Math.max(...xs),
		maxY: Math.max(...ys),
	}, padding, width, height);
}

function getTextBounds(drawing: DrawingObject, pixelPoint: { x: number; y: number }, padding: number, width: number, height: number): SpatialBounds {
	const fontSize = drawing.style.fontSize ?? 12;
	const text = drawing.text?.trim().length ? drawing.text : "Text";
	const measuredWidth = Math.max(fontSize, text.length * fontSize * 0.6);
	return normalizeBounds({
		minX: pixelPoint.x - measuredWidth * 0.1,
		minY: pixelPoint.y - fontSize * 0.5,
		maxX: pixelPoint.x - measuredWidth * 0.1 + measuredWidth,
		maxY: pixelPoint.y - fontSize * 0.5 + fontSize,
	}, padding, width, height);
}

function getDrawingSpatialBounds(drawing: DrawingObject, renderScales: any, width: number, height: number): SpatialBounds | null {
	const padding = Math.max(SPATIAL_INDEX_PADDING, (drawing.style.strokeWidth ?? 1) * 8);
	const toPixels = drawing.points.map((point) => chartPointToPixel(point, renderScales));

	switch (drawing.type) {
		case "hLine": {
			const point = toPixels[0];
			if (!point) {
				return null;
			}
			return normalizeBounds({ minX: 0, minY: point.y, maxX: width, maxY: point.y }, padding, width, height);
		}
		case "vLine": {
			const point = toPixels[0];
			if (!point) {
				return null;
			}
			return normalizeBounds({ minX: point.x, minY: 0, maxX: point.x, maxY: height }, padding, width, height);
		}
		case "ray": {
			const [startPoint, endPoint] = toPixels;
			if (!startPoint || !endPoint) {
				return null;
			}
			const clipped = clipSegmentToBox(
				startPoint,
				{ x: startPoint.x + (endPoint.x - startPoint.x) * 10_000, y: startPoint.y + (endPoint.y - startPoint.y) * 10_000 },
				width,
				height,
			);
			return clipped ? boundsFromPixels(clipped, padding, width, height) : null;
		}
		case "extendedLine": {
			const [startPoint, endPoint] = toPixels;
			if (!startPoint || !endPoint) {
				return null;
			}
			const clipped = clipSegmentToBox(
				{ x: startPoint.x - (endPoint.x - startPoint.x) * 10_000, y: startPoint.y - (endPoint.y - startPoint.y) * 10_000 },
				{ x: startPoint.x + (endPoint.x - startPoint.x) * 10_000, y: startPoint.y + (endPoint.y - startPoint.y) * 10_000 },
				width,
				height,
			);
			return clipped ? boundsFromPixels(clipped, padding, width, height) : null;
		}
		case "text": {
			const point = toPixels[0];
			if (!point) {
				return null;
			}
			return getTextBounds(drawing, point, padding, width, height);
		}
		default:
			return boundsFromPixels(toPixels, padding, width, height);
	}
}

function buildSpatialIndexSignature(moreProps: any) {
	const chartConfigList = getChartConfigList(moreProps);
	const chartSignature = chartConfigList.map((chartConfig) => `${chartConfig.id}:${chartConfig.paneId ?? ""}:${chartConfig.yScaleId ?? ""}:${chartConfig.width}x${chartConfig.height}:${chartConfig.origin[0]},${chartConfig.origin[1]}`).join("|");
	const xScaleDomain = typeof moreProps.xScale?.domain === "function"
		? moreProps.xScale.domain().map((value: any) => (value instanceof Date ? value.getTime() : value)).join(",")
		: "";
	const xScaleRange = typeof moreProps.xScale?.range === "function"
		? moreProps.xScale.range().join(",")
		: "";
	const currentCharts = Array.isArray(moreProps.currentCharts) ? moreProps.currentCharts.join(",") : "";
	const plotDataLength = Array.isArray(moreProps.plotData) ? moreProps.plotData.length : 0;
	return `${chartSignature}::${xScaleDomain}::${xScaleRange}::${currentCharts}::${plotDataLength}`;
}

function buildSpatialIndex(drawings: readonly DrawingObject[], moreProps: any, styleRevision: number): SpatialIndexCache {
	const visibleDrawings = sortVisibleDrawings(drawings);
	const groups = new Map<string, SpatialIndexGroup>();
	const signature = buildSpatialIndexSignature(moreProps);

	visibleDrawings.forEach((drawing, orderIndex) => {
		const chartConfig = resolveDrawingChartConfig(moreProps, drawing, true);
		if (!chartConfig) {
			return;
		}

		const renderScales = buildRenderScales(moreProps, chartConfig);
		if (!renderScales) {
			return;
		}

		const bounds = getDrawingSpatialBounds(drawing, renderScales, chartConfig.width, chartConfig.height);
		if (!bounds) {
			return;
		}

		const groupKey = String(chartConfig.id);
		if (!groups.has(groupKey)) {
			groups.set(groupKey, { chartConfig, buckets: new Map() });
		}

		const group = groups.get(groupKey)!;
		const minCellX = Math.floor(bounds.minX / SPATIAL_INDEX_CELL_SIZE);
		const maxCellX = Math.floor(bounds.maxX / SPATIAL_INDEX_CELL_SIZE);
		const minCellY = Math.floor(bounds.minY / SPATIAL_INDEX_CELL_SIZE);
		const maxCellY = Math.floor(bounds.maxY / SPATIAL_INDEX_CELL_SIZE);

		for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
			for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
				const cellKey = getCellKey(cellX, cellY);
				if (!group.buckets.has(cellKey)) {
					group.buckets.set(cellKey, []);
				}
				group.buckets.get(cellKey)!.push({ drawing, orderIndex });
			}
		}
	});

	return {
		sourceDrawings: drawings,
		styleRevision,
		signature,
		groups,
	};
}

function querySpatialIndex(index: SpatialIndexCache, moreProps: any) {
	const candidates = new Map<string, SpatialCandidate>();
	for (const group of index.groups.values()) {
		const adjustedMousePosition = getAdjustedMousePosition(moreProps, group.chartConfig);
		if (!adjustedMousePosition) {
			continue;
		}

		const [mouseX, mouseY] = adjustedMousePosition;
		const minCellX = Math.floor((mouseX - SPATIAL_INDEX_CELL_SIZE) / SPATIAL_INDEX_CELL_SIZE);
		const maxCellX = Math.floor((mouseX + SPATIAL_INDEX_CELL_SIZE) / SPATIAL_INDEX_CELL_SIZE);
		const minCellY = Math.floor((mouseY - SPATIAL_INDEX_CELL_SIZE) / SPATIAL_INDEX_CELL_SIZE);
		const maxCellY = Math.floor((mouseY + SPATIAL_INDEX_CELL_SIZE) / SPATIAL_INDEX_CELL_SIZE);

		for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
			for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
				const cellCandidates = group.buckets.get(getCellKey(cellX, cellY));
				if (!cellCandidates) {
					continue;
				}

				for (const candidate of cellCandidates) {
					const existing = candidates.get(candidate.drawing.id);
					if (!existing || candidate.orderIndex > existing.orderIndex) {
						candidates.set(candidate.drawing.id, candidate);
					}
				}
			}
		}
	}

	return [...candidates.values()].sort((left, right) => right.orderIndex - left.orderIndex).map((candidate) => candidate.drawing);
}

function getSnapHintPalette(snapType: SnapResult["snapType"]) {
	switch (snapType) {
		case "intersection":
			return { fill: "#10b981", stroke: "#064e3b", radius: 7 };
		case "endpoint":
			return { fill: "#3b82f6", stroke: "#1e3a8a", radius: 6 };
		case "midpoint":
			return { fill: "#8b5cf6", stroke: "#4c1d95", radius: 6 };
		case "grid":
			return { fill: "#64748b", stroke: "#0f172a", radius: 6 };
		case "ohlc":
		default:
			return { fill: "#f5a623", stroke: "#ffffff", radius: 6 };
	}
}

function isMultiStepTool(toolName: DrawingToolType) {
	return toolName === "channel" || toolName === "parallelChannel" || toolName === "pitchfork" || toolName === "abcdPattern";
}

function hasRemainingPlaceholder(drawing: DrawingObject) {
	const startPoint = drawing.points[0];
	if (!startPoint) {
		return false;
	}

	return drawing.points.slice(1).some((point) => point.x === startPoint.x && point.y === startPoint.y);
}

export default function DrawingLayer({ activeTool, interaction, magnetSensitivity = "normal", onToolUsed, onContextMenu }: DrawingLayerProps) {
	const [styleRevision, setStyleRevision] = useState(0);
	useEffect(() => subscribeDrawingStyleChanges(() => {
		setStyleRevision((value) => value + 1);
	}), []);

	const selectedObjectIds = useMemo(() => getSelectedObjectIds(interaction.drawingState), [interaction.drawingState]);
	const selectedObjectIdSet = useMemo(() => new Set(selectedObjectIds), [selectedObjectIds]);
	const selectedDrawingId = getSelectedDrawingId(interaction.drawingState);
	const selectedDrawing = selectedDrawingId
		? interaction.history.present.find((drawing) => drawing.id === selectedDrawingId)
		: undefined;
	const canDragSelectedDrawing = activeTool === "cursor" && selectedDrawingId !== undefined && selectedDrawing?.locked !== true;
	const snapRef = useRef<SnapResult | null>(null);
	const hitIndexRef = useRef<SpatialIndexCache | null>(null);
	const pendingResizeHandleRef = useRef<number | null>(null);
	const dragSessionRef = useRef<{
		mode: "move" | "resize";
		objectId: string;
		selectedObjectIds: string[];
		startChartPoint?: Point;
		handleIndex?: number;
		chartConfig?: ChartConfigLike;
		baseDrawings: DrawingObject[];
	} | null>(null);
	const dragPreviewRef = useRef<DrawingObject[] | null>(null);

	const drawToCanvas = useCallback((ctx: CanvasRenderingContext2D, moreProps: any): void => {
		const baseChartConfig = resolveBaseChartConfig(moreProps);
		if (!baseChartConfig) {
			return;
		}

		const baseDrawings = dragPreviewRef.current ? sortVisibleDrawings(dragPreviewRef.current) : getVisibleDrawings(interaction);
		const drawings = [...baseDrawings];
		const draft = currentDrawing(drawings, interaction.drawingState);
		if (draft && !drawings.some((drawing) => drawing.id === draft.id)) {
			drawings.push(draft);
		}

		for (const drawing of drawings) {
			const chartConfig = resolveDrawingChartConfig(moreProps, drawing) || baseChartConfig;
			const renderScales = buildRenderScales(moreProps, chartConfig);
			if (!renderScales) {
				continue;
			}

			const canvasOptions: RenderCanvasOptions = {
				chartWidth: chartConfig.width,
				chartHeight: chartConfig.height,
				plotData: renderScales.plotData,
				isSelected: selectedObjectIdSet.has(drawing.id),
			};

			withChartTranslation(ctx, baseChartConfig, chartConfig, () => {
				renderDrawingToCanvas(ctx, drawing, renderScales, canvasOptions);
			});
		}

		const snap = snapRef.current;
		if (interaction.drawingState.type === "drawing" && snap) {
			const draftChartConfig = resolveDrawingChartConfig(moreProps, interaction.drawingState.object) || resolveActiveChartConfig(moreProps) || baseChartConfig;
			const renderScales = buildRenderScales(moreProps, draftChartConfig);
			if (renderScales) {
				const snapPalette = getSnapHintPalette(snap.snapType);
				withChartTranslation(ctx, baseChartConfig, draftChartConfig, () => {
					ctx.save();
					ctx.beginPath();
					ctx.arc(snap.pixelPoint.x, snap.pixelPoint.y, snapPalette.radius, 0, Math.PI * 2);
					ctx.fillStyle = snapPalette.fill;
					ctx.strokeStyle = snapPalette.stroke;
					ctx.lineWidth = 1.5;
					ctx.setLineDash([]);
					ctx.fill();
					ctx.stroke();
					ctx.restore();
				});
			}
		}
	}, [interaction, interaction.drawingState, selectedObjectIdSet]);

	const isHover = useCallback((moreProps: any) => {
		if (activeTool !== "cursor") {
			return false;
		}

		const hit = findHitDrawing(interaction, moreProps, hitIndexRef, styleRevision);
		return hit != null;
	}, [activeTool, interaction.history.present]);

	const handleDragStart = useCallback((moreProps: any) => {
		if (!canDragSelectedDrawing || !selectedDrawingId || !selectedDrawing) {
			pendingResizeHandleRef.current = null;
			return;
		}

		const chartConfig = resolveDrawingChartConfig(moreProps, selectedDrawing, true);
		const startChartPoint = toChartPoint(moreProps, moreProps.startPos, chartConfig);
		if (!startChartPoint) {
			pendingResizeHandleRef.current = null;
			return;
		}

		const resizeHandleIndex = pendingResizeHandleRef.current;
		if (resizeHandleIndex != null) {
			dragSessionRef.current = {
				mode: "resize",
				objectId: selectedDrawingId,
				selectedObjectIds: [selectedDrawingId],
				handleIndex: resizeHandleIndex,
				chartConfig,
				baseDrawings: interaction.history.present,
			};
			interaction.startResizing(selectedDrawingId, String(resizeHandleIndex));
		} else {
			dragSessionRef.current = {
				mode: "move",
				objectId: selectedDrawingId,
				selectedObjectIds: [selectedDrawingId],
				startChartPoint,
				chartConfig,
				baseDrawings: interaction.history.present,
			};
			interaction.startMoving(selectedDrawingId, startChartPoint, startChartPoint);
		}
		dragPreviewRef.current = null;
		pendingResizeHandleRef.current = null;
	}, [canDragSelectedDrawing, interaction, selectedDrawing, selectedDrawingId]);

	const handleDrag = useCallback((moreProps: any) => {
		const session = dragSessionRef.current;
		if (!session) {
			return;
		}

		const currentChartPoint = toChartPoint(moreProps, moreProps.mouseXY, session.chartConfig);
		if (!currentChartPoint) {
			return;
		}

		if (session.mode === "resize" && session.handleIndex != null) {
			dragPreviewRef.current = resizeDrawingsByIds(session.baseDrawings, session.selectedObjectIds, session.handleIndex, currentChartPoint);
			return;
		}

		if (!session.startChartPoint) {
			return;
		}

		const deltaX = currentChartPoint.x - session.startChartPoint.x;
		const deltaY = currentChartPoint.y - session.startChartPoint.y;
		dragPreviewRef.current = translateDrawingsByIds(session.baseDrawings, session.selectedObjectIds, deltaX, deltaY);
	}, []);

	const handleDragComplete = useCallback(() => {
		const session = dragSessionRef.current;
		if (!session) {
			pendingResizeHandleRef.current = null;
			return;
		}

		const previewDrawings = dragPreviewRef.current;
		dragSessionRef.current = null;
		pendingResizeHandleRef.current = null;
		dragPreviewRef.current = null;

		if (previewDrawings && (previewDrawings.length !== session.baseDrawings.length || previewDrawings.some((drawing, index) => drawing !== session.baseDrawings[index]))) {
			interaction.replaceDrawings(previewDrawings);
		}

		interaction.selectObject(session.objectId);
	}, [interaction]);

	const handleMouseDown = useCallback((moreProps: any) => {
		if (activeTool === "cursor" && canDragSelectedDrawing && selectedDrawingId && selectedDrawing) {
			const chartConfig = resolveDrawingChartConfig(moreProps, selectedDrawing, true);
			const [mouseX, mouseY] = Array.isArray(moreProps.mouseXY) ? moreProps.mouseXY : [NaN, NaN];
			if (chartConfig && Number.isFinite(mouseX) && Number.isFinite(mouseY)) {
				const renderScales = buildRenderScales(moreProps, chartConfig);
				if (renderScales) {
					const adjustedMousePosition = getAdjustedMousePosition(moreProps, chartConfig, moreProps.mouseXY);
					pendingResizeHandleRef.current = adjustedMousePosition
						? getResizeHandleIndex(selectedDrawing, adjustedMousePosition[0], adjustedMousePosition[1], renderScales)
						: null;
				} else {
					pendingResizeHandleRef.current = null;
				}
			} else {
				pendingResizeHandleRef.current = null;
			}
		} else {
			pendingResizeHandleRef.current = null;
		}

		if (!isDrawingToolName(activeTool)) {
			return;
		}

		if (interaction.drawingState.type === "drawing") {
			return;
		}

		const resolved = toDrawingPoint(moreProps, interaction, activeTool, magnetSensitivity);
		if (!resolved?.point) {
			return;
		}
		snapRef.current = resolved.snap;
		const chartConfig = resolveActiveChartConfig(moreProps);

		const toolName = activeTool as DrawingToolType;
		const draft = createDraftFromTool(toolName, resolved.point);
		interaction.dispatch({
			type: "START_DRAWING",
			toolName,
			object: {
				...draft,
				paneId: chartConfig?.paneId,
				yScaleId: chartConfig?.yScaleId,
			},
		});
	}, [activeTool, canDragSelectedDrawing, interaction, magnetSensitivity, selectedDrawing, selectedDrawingId]);

	const handleMouseMove = useCallback((moreProps: any) => {
		if (interaction.drawingState.type !== "drawing") {
			snapRef.current = null;
			return;
		}

		const resolved = toDrawingPoint(moreProps, interaction, interaction.drawingState.toolName, magnetSensitivity);
		if (!resolved?.point) {
			snapRef.current = null;
			return;
		}
		snapRef.current = resolved.snap;

		const tool = createTool(interaction.drawingState.toolName);
		const updated = tool.updateDraft(interaction.drawingState.object, resolved.point);
		interaction.dispatch({ type: "UPDATE_DRAWING", object: updated });
	}, [interaction, magnetSensitivity]);

	const handleClick = useCallback((moreProps: any) => {
		if (activeTool === "cursor" && interaction.drawingState.type !== "drawing") {
			const hit = findHitDrawing(interaction, moreProps, hitIndexRef, styleRevision);

			if (!hit) {
				interaction.cancelDrawing();
				return;
			}

			const handleSelect = () => {
				interaction.selectObject(hit.id);
			};

			if (moreProps.event?.shiftKey) {
				const nextSelectedIds = selectedObjectIdSet.has(hit.id)
					? selectedObjectIds.filter((id) => id !== hit.id)
					: [...selectedObjectIds, hit.id];
				interaction.setSelectedObjects(nextSelectedIds);
			} else {
				handleSelect();
			}
			return;
		}

		if (interaction.drawingState.type !== "drawing" || !isDrawingToolName(activeTool)) {
			return;
		}

		const resolved = toDrawingPoint(moreProps, interaction, interaction.drawingState.toolName, magnetSensitivity);
		if (!resolved?.point) {
			snapRef.current = null;
			return;
		}
		snapRef.current = resolved.snap;

		const toolName = interaction.drawingState.toolName;
		const draft = interaction.drawingState.object;

		if (toolName === "polyline") {
			const updated = appendPoint(draft, resolved.point);
			interaction.dispatch({ type: "UPDATE_DRAWING", object: updated });
			return;
		}

		if (isMultiStepTool(toolName)) {
			const updated = replaceNextPoint(draft, resolved.point);
			if (hasRemainingPlaceholder(updated)) {
				interaction.dispatch({ type: "UPDATE_DRAWING", object: updated });
				return;
			}

			interaction.dispatch({ type: "COMPLETE_DRAWING", object: updated });
			interaction.dispatch({ type: "PUSH", drawing: updated });
			interaction.selectObject(updated.id);
			onToolUsed?.();
			return;
		}

		const completed = createTool(toolName).updateDraft(draft, resolved.point);
		interaction.dispatch({ type: "COMPLETE_DRAWING", object: completed });
		interaction.dispatch({ type: "PUSH", drawing: completed });
		interaction.selectObject(completed.id);
		snapRef.current = null;
		onToolUsed?.();
	}, [activeTool, interaction, magnetSensitivity, onToolUsed, selectedObjectIds, selectedObjectIdSet]);

	const handleContextMenu = useCallback((moreProps: any) => {
		const nativeEvent = moreProps.event as MouseEvent | undefined;
		nativeEvent?.preventDefault?.();
		nativeEvent?.stopPropagation?.();

		if (interaction.drawingState.type === "drawing") {
			return;
		}

		const hit = findHitDrawing(interaction, moreProps, hitIndexRef, styleRevision);
		if (hit && selectedDrawingId !== hit.id) {
			interaction.selectObject(hit.id);
		}

		onContextMenu?.({
			...moreProps,
			hitDrawing: hit ?? null,
		}, moreProps.event);
	}, [interaction, onContextMenu, selectedDrawingId]);

	const handleDoubleClick = useCallback((moreProps: any) => {
		if (activeTool === "cursor" && interaction.drawingState.type !== "drawing") {
			const hit = findHitDrawing(interaction, moreProps, hitIndexRef, styleRevision);
			if (hit?.type === "text" && hit.locked !== true) {
				interaction.startEditing(hit.id, hit.text ?? "");
				return;
			}
		}

		if (interaction.drawingState.type !== "drawing" || interaction.drawingState.toolName !== "polyline") {
			return;
		}

		const resolved = toDrawingPoint(moreProps, interaction, interaction.drawingState.toolName, magnetSensitivity);
		if (!resolved?.point) {
			snapRef.current = null;
			return;
		}
		snapRef.current = resolved.snap;

		const tool = createTool("polyline");
		const completed = tool.updateDraft(interaction.drawingState.object, resolved.point);
		interaction.dispatch({ type: "UPDATE_DRAWING", object: completed });
		interaction.dispatch({ type: "COMPLETE_DRAWING", object: completed });
		interaction.dispatch({ type: "PUSH", drawing: completed });
		interaction.selectObject(completed.id);
		snapRef.current = null;
		onToolUsed?.();
	}, [activeTool, interaction, magnetSensitivity, onToolUsed]);

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

	const handleHover = useCallback(() => undefined, []);
	const handleUnHover = useCallback(() => undefined, []);

	const selectedCursorClass = canDragSelectedDrawing ? "react-stockcharts-move-cursor" : chartCursorClass;

	return (
		<GenericChartComponent
			clip={false}
			allowAnyChart
			selected={canDragSelectedDrawing}
			interactiveCursorClass={selectedCursorClass}
			disablePan={isDrawingToolName(activeTool)}
			isHover={isHover}
			onHover={handleHover}
			onUnHover={handleUnHover}
			onDragStart={handleDragStart}
			onDrag={handleDrag}
			onDragComplete={handleDragComplete}
			svgDraw={() => null}
			canvasDraw={drawToCanvas}
			canvasToDraw={getMouseCanvas}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onClick={handleClick}
			onContextMenu={handleContextMenu}
			onDoubleClick={handleDoubleClick}
			drawOn={[
				"mousemove",
				"click",
				"drag",
				"dragend",
				"pan",
				"zoom",
			]}
		/>
	);
}