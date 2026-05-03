import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

export const chartTheme = {
	background: "linear-gradient(135deg, #020617 0%, #0f172a 48%, #111827 100%)",
	frameBackground: "linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(2, 6, 23, 0.98) 100%)",
	shellBackground: "rgba(2, 6, 23, 0.78)",
	border: "rgba(148, 163, 184, 0.20)",
	borderStrong: "rgba(148, 163, 184, 0.32)",
	text: "#e2e8f0",
	mutedText: "#94a3b8",
	accent: "#38bdf8",
	priceUp: "#10b981",
	priceDown: "#ef4444",
	ema20: "#22d3ee",
	ema50: "#f59e0b",
	macd: "#38bdf8",
	macdSignal: "#f59e0b",
	macdHistogram: "#ef4444",
	bollinger: "#38bdf8",
	rsi: "#60a5fa",
	volume: "#64748b",
	volumeProfileUp: "#6BA583",
	volumeProfileDown: "#FF0000",
	annotation: "#f8fafc",
};

export const themeFontFamily = '"Segoe UI Variable Text", "Aptos", "Segoe UI", sans-serif';

export const frameStyle = {
	display: "grid",
	gap: 16,
	padding: 24,
	borderRadius: 28,
	background: chartTheme.frameBackground,
	border: `1px solid ${chartTheme.border}`,
	boxShadow: "0 30px 70px rgba(2, 6, 23, 0.45)",
	color: chartTheme.text,
};

export const frameHeaderStyle = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "flex-start",
	gap: 16,
	flexWrap: "wrap",
};

export const frameKickerStyle = {
	display: "inline-flex",
	padding: "6px 12px",
	borderRadius: 999,
	background: "rgba(56, 189, 248, 0.12)",
	border: `1px solid rgba(56, 189, 248, 0.26)`,
	color: chartTheme.accent,
	fontSize: 11,
	fontWeight: 700,
	letterSpacing: "0.16em",
	textTransform: "uppercase",
};

export const frameTitleStyle = {
	margin: "12px 0 8px",
	fontSize: 30,
	lineHeight: 1.05,
	fontWeight: 800,
	letterSpacing: "-0.02em",
};

export const frameDescriptionStyle = {
	maxWidth: 920,
	margin: 0,
	fontSize: 14,
	lineHeight: 1.65,
	color: chartTheme.mutedText,
};

export const frameActionsStyle = {
	display: "flex",
	gap: 12,
	alignItems: "center",
	flexWrap: "wrap",
};

export const chartMargin = {
	left: 64,
	right: 84,
	top: 18,
	bottom: 34,
};

export const chartShellStyle = {
	overflowX: "auto",
	overflowY: "hidden",
	padding: 12,
	borderRadius: 24,
	background: chartTheme.shellBackground,
	border: `1px solid ${chartTheme.borderStrong}`,
};

export const storyButtonStyle = {
	appearance: "none",
	border: `1px solid ${chartTheme.borderStrong}`,
	background: "rgba(15, 23, 42, 0.88)",
	color: chartTheme.text,
	borderRadius: 999,
	padding: "10px 16px",
	fontSize: 13,
	fontWeight: 700,
	letterSpacing: "0.01em",
	cursor: "pointer",
};

export const axisTheme = {
	stroke: chartTheme.borderStrong,
	tickStroke: chartTheme.borderStrong,
	tickLabelFill: chartTheme.text,
	fontFamily: themeFontFamily,
	fontSize: 12,
	fontWeight: 500,
};

export const coordinateTheme = {
	fill: "rgba(15, 23, 42, 0.96)",
	opacity: 1,
	stroke: chartTheme.borderStrong,
	strokeOpacity: 1,
	strokeWidth: 1,
	fontFamily: themeFontFamily,
	fontSize: 12,
	textFill: chartTheme.text,
};

export const tooltipDisplayTexts = {
	d: "Ngày: ",
	o: " Mở: ",
	h: " Cao: ",
	l: " Thấp: ",
	c: " Đóng: ",
	v: " KL: ",
	na: "n/a",
};

export const priceFormat = format(".2f");
export const priceFormat3 = format(".3f");
export const volumeFormat = format(".3s");
export const volumeAxisFormat = format(".2s");
export const percentFormat = format(".2%");
export const dateFormat = timeFormat("%d/%m/%Y %H:%M");

export function createOrigin(offsetFromBottom: number) {
	return (_width: number, height: number): [number, number] => [0, height - offsetFromBottom];
}

export function resolveStoryWidth() {
	if (typeof window === "undefined") {
		return 1200;
	}

	return Math.max(960, Math.min(1400, window.innerWidth - 72));
}