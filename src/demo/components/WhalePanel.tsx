import { useMemo } from "react";
import type { WhaleFeedResponse, WhaleOrderSummary } from "../vninvest/types";
import { useDemoI18n } from "../i18n";

export interface WhalePanelProps {
	data?: WhaleFeedResponse | null;
	isLoading?: boolean;
	symbol?: string;
}

/**
 * WhalePanel — displays whale buy/sell money flow summary
 * Shows aggregate money by size class (whale, shark, small)
 */
export function WhalePanel({ data, isLoading = false, symbol = "" }: WhalePanelProps) {
	const { t } = useDemoI18n();

	const toBillions = (value: unknown): string => {
		const numericValue = typeof value === "number" && Number.isFinite(value) ? value : 0;
		return `${(numericValue / 1_000_000_000).toFixed(1)}B`;
	};

	const summary = useMemo<WhaleOrderSummary | null>(() => {
		if (!data?.summary) {
			return null;
		}
		return data.summary;
	}, [data?.summary]);

	if (isLoading) {
		return (
			<div className="gc-whale-panel gc-whale-panel--loading">
				<div className="gc-whale-panel__header">
					<strong>{t("vninvest.whale")}</strong>
				</div>
				<div className="gc-whale-panel__loading-text">{t("common.loading")}</div>
			</div>
		);
	}

	if (!data || !summary) {
		return (
			<div className="gc-whale-panel gc-whale-panel--empty">
				<div className="gc-whale-panel__header">
					<strong>{t("vninvest.whale")}</strong>
				</div>
				<div className="gc-whale-panel__empty-text">{t("vninvest.whale.noData")}</div>
			</div>
		);
	}

	const sharkBuy = summary.shark_buy ?? 0;
	const sharkSell = summary.shark_sell ?? 0;
	const whaleBuy = summary.whale_buy ?? 0;
	const whaleSell = summary.whale_sell ?? 0;
	const smallBuy = summary.small_buy ?? 0;
	const smallSell = summary.small_sell ?? 0;

	return (
		<div className="gc-whale-panel">
			<div className="gc-whale-panel__header">
				<strong>{t("vninvest.whale")}</strong>
				{symbol && <span className="gc-whale-panel__symbol">{symbol}</span>}
			</div>

			<div className="gc-whale-panel__body">
				{/* Buy side */}
				<div className="gc-whale-panel__section gc-whale-panel__section--buy">
					<div className="gc-whale-panel__section-title gc-col-up">
						{t("vninvest.whale.buy")}
					</div>
					<div className="gc-whale-panel__metric">
						<span className="gc-whale-panel__metric-label">{t("vninvest.whale.shark")}</span>
						<span className="gc-whale-panel__metric-value">{toBillions(sharkBuy)}</span>
					</div>
					<div className="gc-whale-panel__metric">
						<span className="gc-whale-panel__metric-label">{t("vninvest.whale.whale")}</span>
						<span className="gc-whale-panel__metric-value">{toBillions(whaleBuy)}</span>
					</div>
					<div className="gc-whale-panel__metric">
						<span className="gc-whale-panel__metric-label">{t("vninvest.whale.small")}</span>
						<span className="gc-whale-panel__metric-value">{toBillions(smallBuy)}</span>
					</div>
				</div>

				{/* Sell side */}
				<div className="gc-whale-panel__section gc-whale-panel__section--sell">
					<div className="gc-whale-panel__section-title gc-col-dn">
						{t("vninvest.whale.sell")}
					</div>
					<div className="gc-whale-panel__metric">
						<span className="gc-whale-panel__metric-label">{t("vninvest.whale.shark")}</span>
						<span className="gc-whale-panel__metric-value">{toBillions(sharkSell)}</span>
					</div>
					<div className="gc-whale-panel__metric">
						<span className="gc-whale-panel__metric-label">{t("vninvest.whale.whale")}</span>
						<span className="gc-whale-panel__metric-value">{toBillions(whaleSell)}</span>
					</div>
					<div className="gc-whale-panel__metric">
						<span className="gc-whale-panel__metric-label">{t("vninvest.whale.small")}</span>
						<span className="gc-whale-panel__metric-value">{toBillions(smallSell)}</span>
					</div>
				</div>
			</div>

			{/* Net flow indicator */}
			<div className="gc-whale-panel__footer">
				<div className="gc-whale-panel__net-label">Net Flow</div>
				<div
					className={`gc-whale-panel__net-value${whaleBuy > whaleSell ? " gc-col-up" : " gc-col-dn"}`}
				>
					{toBillions(whaleBuy - whaleSell)}
				</div>
			</div>
		</div>
	);
}
