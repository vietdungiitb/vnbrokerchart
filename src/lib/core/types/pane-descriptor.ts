export type SeriesTypeId =
	| "Candlestick"
	| "HollowCandle"
	| "OHLC"
	| "HeikinAshi"
	| "Line"
	| "Area"
	| "Bar"
	| "Volume"
	| "EMA"
	| "BollingerBand"
	| "RSI"
	| "MACD"
	| "CVDApprox"
	| "CVDRealtime"
	| "StrengthElder"
	| "StrengthRelative"
	| "Whale";

export type YAxisSide = "left" | "right";

export interface SeriesConfig {
	type: SeriesTypeId;
	params?: Record<string, unknown>;
	yAxis: YAxisSide;
	overlay?: boolean;
	color?: string;
}

export type TooltipMode = "ohlc" | "value" | "none";

export interface PaneDescriptor {
	id: string;
	label: string;
	pinned: boolean;
	visible: boolean;
	heightRatio: number;
	series: SeriesConfig[];
	splitScale: boolean;
	tooltip: TooltipMode;
}

export const PANE_LAYOUT_STORAGE_KEY = "rsc-pane-layout-v1";
export const PANE_MAX_VISIBLE = 3;

export const DEFAULT_PANES: PaneDescriptor[] = [
	{
		id: "price",
		label: "Price",
		pinned: true,
		visible: true,
		heightRatio: 0.55,
		splitScale: false,
		tooltip: "ohlc",
		series: [
			{ type: "Candlestick", yAxis: "right" },
			{ type: "EMA", params: { period: 20, color: "#2d9cdb" }, yAxis: "right", overlay: true },
			{ type: "EMA", params: { period: 50, color: "#f2994a" }, yAxis: "right", overlay: true },
			{ type: "BollingerBand", params: { period: 20, stdDev: 2 }, yAxis: "right", overlay: true },
		],
	},
	{
		id: "volume",
		label: "Volume",
		pinned: false,
		visible: true,
		heightRatio: 0.25,
		splitScale: false,
		tooltip: "value",
		series: [
			{ type: "Volume", yAxis: "right" },
		],
	},
	{
		id: "momentum",
		label: "RSI+MACD",
		pinned: false,
		visible: true,
		heightRatio: 0.20,
		splitScale: true,
		tooltip: "value",
		series: [
			{ type: "RSI", params: { period: 14 }, yAxis: "left" },
			{ type: "MACD", params: { fast: 12, slow: 26, signal: 9 }, yAxis: "right" },
		],
	},
];
