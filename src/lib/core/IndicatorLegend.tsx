import type { CSSProperties } from "react";
import type { PaneDescriptor, SeriesTypeId } from "./types/pane-descriptor";

export interface IndicatorLegendProps {
	pane: PaneDescriptor;
	onToggleSeries: (seriesType: SeriesTypeId, seriesIndex?: number) => void;
	onRemoveSeries: (seriesType: SeriesTypeId, seriesIndex?: number) => void;
	labels?: {
		seriesLabel?: (seriesType: SeriesTypeId, params?: Record<string, unknown>) => string;
		showIndicatorTitle?: string;
		hideIndicatorTitle?: string;
		removeIndicatorTitle?: string;
		showIndicatorAriaLabel?: (seriesLabel: string) => string;
		hideIndicatorAriaLabel?: (seriesLabel: string) => string;
		removeIndicatorAriaLabel?: (seriesLabel: string) => string;
	};
}

// Human-readable short labels for each series type
const SERIES_LABELS: Partial<Record<SeriesTypeId, string>> = {
	Candlestick: "Candle",
	HollowCandle: "Hollow",
	OHLC: "OHLC",
	HeikinAshi: "HA",
	Line: "Line",
	Area: "Area",
	Bar: "Bar",
	EMA: "EMA",
	BollingerBand: "BB",
	Volume: "Vol",
	Whale: "Whale",
	CVDApprox: "CVD",
	CVDRealtime: "CVD RT",
	RSI: "RSI",
	MACD: "MACD",
	StrengthElder: "Elder",
	StrengthRelative: "RS",
};

function seriesLabel(type: SeriesTypeId, params?: Record<string, unknown>): string {
	const base = SERIES_LABELS[type] ?? type;
	if (type === "EMA" && typeof params?.period === "number") return `EMA(${params.period})`;
	if (type === "RSI" && typeof params?.period === "number") return `RSI(${params.period})`;
	if (type === "BollingerBand" && typeof params?.period === "number") return `BB(${params.period})`;
	if (type === "MACD") {
		const fast = typeof params?.fast === "number" ? params.fast : 12;
		const slow = typeof params?.slow === "number" ? params.slow : 26;
		return `MACD(${fast},${slow})`;
	}
	return base;
}

// Price-chart primary series: shown in the chip strip only for non-pinned panes.
// For the pinned (price) pane, price type chips are hidden since chart type is
// controlled separately by the chart type button in the topbar.
const PRIMARY_CHART_TYPES: SeriesTypeId[] = [
	"Candlestick", "HollowCandle", "OHLC", "HeikinAshi", "Line", "Area", "Bar",
];

export function IndicatorLegend({ pane, onToggleSeries, onRemoveSeries, labels }: IndicatorLegendProps) {
	// For the price pane: exclude primary chart types (controlled by topbar chart type picker)
	// For other panes: show all series
	const chips = pane.pinned
		? pane.series.filter((s) => !PRIMARY_CHART_TYPES.includes(s.type))
		: pane.series;

	if (chips.length === 0) return null;

	return (
		<div className="rsc-indicator-legend">
			{chips.map((series) => {
				const seriesIndex = pane.series.indexOf(series);
				const hidden = series.visible === false;
				const shortLabel = labels?.seriesLabel?.(series.type, series.params) ?? seriesLabel(series.type, series.params);
				const chipStyle = series.color
					? ({ "--chip-color": series.color } as CSSProperties)
					: undefined;

				return (
					<div
						key={`${series.type}-${seriesIndex}`}
						className={`rsc-indicator-chip${hidden ? " rsc-indicator-chip--hidden" : ""}`}
						style={chipStyle}
					>
						<span className="rsc-indicator-chip__dot" aria-hidden="true" />
						<span className="rsc-indicator-chip__name">
							{shortLabel}
						</span>
						<button
							type="button"
							className="rsc-indicator-chip__btn rsc-indicator-chip__btn--eye"
							onClick={() => onToggleSeries(series.type, seriesIndex)}
							title={hidden ? labels?.showIndicatorTitle ?? "Hiện indicator" : labels?.hideIndicatorTitle ?? "Ẩn indicator"}
							aria-label={hidden ? labels?.showIndicatorAriaLabel?.(shortLabel) ?? `Hiện ${series.type}` : labels?.hideIndicatorAriaLabel?.(shortLabel) ?? `Ẩn ${series.type}`}
							aria-pressed={!hidden}
						>
							{hidden ? "◌" : "👁"}
						</button>
						<button
							type="button"
							className="rsc-indicator-chip__btn rsc-indicator-chip__btn--remove"
							onClick={() => onRemoveSeries(series.type, seriesIndex)}
							title={labels?.removeIndicatorTitle ?? "Xóa indicator khỏi pane này"}
							aria-label={labels?.removeIndicatorAriaLabel?.(shortLabel) ?? `Xóa ${series.type}`}
						>
							×
						</button>
					</div>
				);
			})}
		</div>
	);
}
