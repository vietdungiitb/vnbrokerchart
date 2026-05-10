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
						<span className="gc-whale-panel__metric-value">{(summary.shark_buy / 1_000_000_000).toFixed(1)}B</span>
					</div>
					<div className="gc-whale-panel__metric">
						<span className="gc-whale-panel__metric-label">{t("vninvest.whale.whale")}</span>
						<span className="gc-whale-panel__metric-value">{(summary.whale_buy / 1_000_000_000).toFixed(1)}B</span>
					</div>
					<div className="gc-whale-panel__metric">
						<span className="gc-whale-panel__metric-label">{t("vninvest.whale.small")}</span>
						<span className="gc-whale-panel__metric-value">{(summary.small_buy / 1_000_000_000).toFixed(1)}B</span>
					</div>
				</div>

				{/* Sell side */}
				<div className="gc-whale-panel__section gc-whale-panel__section--sell">
					<div className="gc-whale-panel__section-title gc-col-dn">
						{t("vninvest.whale.sell")}
					</div>
					<div className="gc-whale-panel__metric">
						<span className="gc-whale-panel__metric-label">{t("vninvest.whale.shark")}</span>
						<span className="gc-whale-panel__metric-value">{(summary.shark_sell / 1_000_000_000).toFixed(1)}B</span>
					</div>
					<div className="gc-whale-panel__metric">
						<span className="gc-whale-panel__metric-label">{t("vninvest.whale.whale")}</span>
						<span className="gc-whale-panel__metric-value">{(summary.whale_sell / 1_000_000_000).toFixed(1)}B</span>
					</div>
					<div className="gc-whale-panel__metric">
						<span className="gc-whale-panel__metric-label">{t("vninvest.whale.small")}</span>
						<span className="gc-whale-panel__metric-value">{(summary.small_sell / 1_000_000_000).toFixed(1)}B</span>
					</div>
				</div>
			</div>

			{/* Net flow indicator */}
			<div className="gc-whale-panel__footer">
				<div className="gc-whale-panel__net-label">Net Flow</div>
				<div
					className={`gc-whale-panel__net-value${summary.whale_buy > summary.whale_sell ? " gc-col-up" : " gc-col-dn"}`}
				>
					{((summary.whale_buy - summary.whale_sell) / 1_000_000_000).toFixed(1)}B
				</div>
			</div>
		</div>
	);
}
