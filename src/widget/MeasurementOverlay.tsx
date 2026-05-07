import { Component, useMemo } from "react";
import GenericChartComponent from "../lib/GenericChartComponent";
import { getMouseCanvas } from "../lib/GenericComponent";
import { measurementPointToPixel, resolveMeasurementPoint, summarizeMeasurement, type MeasurementSelection } from "../lib/drawing/measuring";
import { useWidgetI18n } from "./context/WidgetI18nContext";

export interface MeasurementOverlayLabels {
	title: string;
	bars: string;
	price: string;
}

export interface MeasurementOverlayProps {
	enabled: boolean;
	isDark: boolean;
	priceFormat: (value: number) => string;
	labels: MeasurementOverlayLabels;
}

interface MeasurementOverlayState {
	draft: MeasurementSelection | null;
	committed: MeasurementSelection | null;
}

function formatSignedPrice(value: number, formatValue: (nextValue: number) => string) {
	return `${value >= 0 ? "+" : ""}${formatValue(Math.abs(value))}`;
}

function drawRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	const right = x + width;
	const bottom = y + height;
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(right - radius, y);
	ctx.quadraticCurveTo(right, y, right, y + radius);
	ctx.lineTo(right, bottom - radius);
	ctx.quadraticCurveTo(right, bottom, right - radius, bottom);
	ctx.lineTo(x + radius, bottom);
	ctx.quadraticCurveTo(x, bottom, x, bottom - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

function drawPoint(ctx: CanvasRenderingContext2D, x: number, y: number, accentColor: string) {
	ctx.save();
	ctx.fillStyle = accentColor;
	ctx.strokeStyle = "#ffffff";
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.arc(x, y, 4.5, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
}

function drawMeasurementLabel(
	ctx: CanvasRenderingContext2D,
	start: { x: number; y: number },
	end: { x: number; y: number },
	selection: MeasurementSelection,
	labels: MeasurementOverlayLabels,
	priceFormat: (value: number) => string,
	isDark: boolean,
	chartWidth: number,
	chartHeight: number,
	accentColor: string,
) {
	const summary = summarizeMeasurement(selection);
	const lines = [
		labels.title,
		`${labels.bars}: ${summary.bars}`,
		`${labels.price}: ${formatSignedPrice(summary.priceDelta, priceFormat)}`,
	];
	const paddingX = 10;
	const paddingY = 8;
	const lineHeight = 16;

	ctx.save();
	ctx.font = "600 12px Inter, ui-sans-serif, system-ui, sans-serif";
	ctx.textBaseline = "top";

	const boxWidth = Math.max(...lines.map((line) => ctx.measureText(line).width)) + paddingX * 2;
	const boxHeight = lineHeight * lines.length + paddingY * 2;

	let boxX = end.x + 14;
	if (boxX + boxWidth > chartWidth - 4) {
		boxX = Math.max(4, start.x - 14 - boxWidth);
	}

	let boxY = end.y - boxHeight - 14;
	if (boxY < 4) {
		boxY = Math.min(chartHeight - boxHeight - 4, end.y + 14);
	}
	boxY = Math.max(4, Math.min(boxY, chartHeight - boxHeight - 4));

	ctx.fillStyle = isDark ? "rgba(15, 23, 42, 0.94)" : "rgba(255, 255, 255, 0.96)";
	ctx.strokeStyle = accentColor;
	ctx.lineWidth = 1.25;
	drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 8);
	ctx.fill();
	ctx.stroke();

	ctx.fillStyle = isDark ? "#f8fafc" : "#0f172a";
	lines.forEach((line, index) => {
		ctx.fillText(line, boxX + paddingX, boxY + paddingY + index * lineHeight);
	});
	ctx.restore();
}

class MeasurementOverlayImpl extends Component<MeasurementOverlayProps, MeasurementOverlayState> {
	state: Readonly<MeasurementOverlayState> = {
		draft: null,
		committed: null,
	};

	static getDerivedStateFromProps(nextProps: MeasurementOverlayProps, prevState: MeasurementOverlayState) {
		if (!nextProps.enabled && (prevState.draft || prevState.committed)) {
			return {
				draft: null,
				committed: null,
			};
		}
		return null;
	}

	getSelection() {
		return this.state.draft ?? this.state.committed;
	}

	handleMouseDown = (moreProps: any) => {
		if (!this.props.enabled) {
			return;
		}

		const point = resolveMeasurementPoint(moreProps);
		if (!point) {
			return;
		}

		this.setState({
			draft: {
				start: point,
				end: point,
			},
			committed: null,
		});
	};

	handleMouseMove = (moreProps: any) => {
		if (!this.props.enabled) {
			return;
		}

		this.setState((state) => {
			if (!state.draft) {
				return null;
			}

			const point = resolveMeasurementPoint(moreProps);
			if (!point) {
				return null;
			}

			return {
				draft: {
					start: state.draft.start,
					end: point,
				},
				committed: state.committed,
			};
		});
	};

	handleClick = () => {
		if (!this.props.enabled) {
			return;
		}

		this.setState((state) => {
			if (!state.draft) {
				return null;
			}

			return {
				draft: null,
				committed: {
					start: state.draft.start,
					end: state.draft.end,
				},
			};
		});
	};

	handleUnHover = () => {
		if (!this.props.enabled) {
			return;
		}

		this.setState((state) => {
			if (!state.draft) {
				return null;
			}

			return {
				draft: null,
				committed: {
					start: state.draft.start,
					end: state.draft.end,
				},
			};
		});
	};

	drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
		const chartConfig = Array.isArray(moreProps.chartConfig) ? moreProps.chartConfig[0] : moreProps.chartConfig;

		if (!chartConfig) {
			return;
		}

		if (!this.props.enabled) {
			ctx.clearRect(0, 0, chartConfig.width, chartConfig.height);
			return;
		}

		const accentColor = this.props.isDark ? "rgba(245, 158, 11, 0.95)" : "rgba(180, 83, 9, 0.95)";
		const selection = this.getSelection();
		const hoverPoint = selection ? undefined : resolveMeasurementPoint(moreProps);

		if (selection) {
			const startPixel = measurementPointToPixel(selection.start, moreProps);
			const endPixel = measurementPointToPixel(selection.end, moreProps);
			if (!startPixel || !endPixel) {
				return;
			}

			ctx.save();
			ctx.strokeStyle = accentColor;
			ctx.fillStyle = accentColor;
			ctx.lineWidth = 1.5;
			ctx.setLineDash([5, 4]);
			ctx.beginPath();
			ctx.moveTo(startPixel.x, startPixel.y);
			ctx.lineTo(endPixel.x, endPixel.y);
			ctx.stroke();
			ctx.setLineDash([]);
			drawPoint(ctx, startPixel.x, startPixel.y, accentColor);
			drawPoint(ctx, endPixel.x, endPixel.y, accentColor);
			drawMeasurementLabel(
				ctx,
				startPixel,
				endPixel,
				selection,
				this.props.labels,
				this.props.priceFormat,
				this.props.isDark,
				chartConfig.width,
				chartConfig.height,
				accentColor,
			);
			ctx.restore();
			return;
		}

		if (!hoverPoint) {
			return;
		}

		const hoverPixel = measurementPointToPixel(hoverPoint, moreProps);
		if (!hoverPixel) {
			return;
		}

		drawPoint(ctx, hoverPixel.x, hoverPixel.y, accentColor);
	};

	render() {
		const { enabled } = this.props;
		const drawOn = enabled ? ["mousemove", "click", "pan", "zoom", "drag", "dragend"] : [];

		return (
			<GenericChartComponent
				clip={false}
				selected={enabled}
				interactiveCursorClass="react-stockcharts-magnet-cursor"
				disablePan={enabled}
				isHover={() => enabled}
				onMouseDown={this.handleMouseDown}
				onMouseMove={this.handleMouseMove}
				onClick={this.handleClick}
				onUnHover={this.handleUnHover}
				svgDraw={() => null}
				canvasDraw={this.drawOnCanvas}
				canvasToDraw={getMouseCanvas}
				drawOn={drawOn}
			/>
		);
	}
}

function MeasurementOverlayWithI18n(props: Omit<MeasurementOverlayProps, "labels">) {
	const { t } = useWidgetI18n();
	const labels = useMemo<MeasurementOverlayLabels>(() => ({
		title: t("measurement.title"),
		bars: t("measurement.bars"),
		price: t("measurement.price"),
	}), [t]);

	return <MeasurementOverlayImpl {...props} labels={labels} />;
}

export default MeasurementOverlayWithI18n;