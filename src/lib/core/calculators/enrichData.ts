import type { SeriesConfig } from "../types/pane-descriptor";
import { buildIndicatorComputationPlan, computeIndicatorComputationResult, materializeIndicatorValues } from "./indicatorComputation";
import type { EnrichedDatum, RawOHLCV } from "./types";

export interface EnrichDataOptions {
	series?: readonly SeriesConfig[];
	whaleThreshold?: number;
}

function normalizeOptions(optionsOrWhaleThreshold?: EnrichDataOptions | number): Required<EnrichDataOptions> {
	if (typeof optionsOrWhaleThreshold === "number") {
		return { series: [], whaleThreshold: optionsOrWhaleThreshold };
	}
	return {
		series: optionsOrWhaleThreshold?.series ?? [],
		whaleThreshold: optionsOrWhaleThreshold?.whaleThreshold ?? 50_000,
	};
}
export function enrichData(raw: readonly RawOHLCV[], optionsOrWhaleThreshold?: EnrichDataOptions | number): EnrichedDatum[] {
	if (raw.length === 0) {
		return [];
	}
	const options = normalizeOptions(optionsOrWhaleThreshold);
	const plan = buildIndicatorComputationPlan(options.series, options.whaleThreshold);
	const result = computeIndicatorComputationResult(raw, plan);

	return raw.map((bar, index) => {
		const indicatorValues = materializeIndicatorValues(index, plan, result);
		return {
			...bar,
			ema13: result.emaByPeriod.get(13)?.[index],
			ema20: result.emaByPeriod.get(20)?.[index],
			ema50: result.emaByPeriod.get(50)?.[index],
			bollingerBand: result.bollingerByKey.get(plan.defaultBollingerKey)?.[index],
			rsi: result.rsiByPeriod.get(14)?.[index],
			macd: result.macdByKey.get(plan.defaultMacdKey)?.[index],
			cvdApprox: result.cvd[index]?.cvdApprox,
			cvdDelta: result.cvd[index]?.cvdDelta,
			bullPower: result.strength[index]?.bullPower,
			bearPower: result.strength[index]?.bearPower,
			whaleBuyVol: result.whaleByKey.get(plan.defaultWhaleKey)?.[index]?.whaleBuyVol,
			whaleSellVol: result.whaleByKey.get(plan.defaultWhaleKey)?.[index]?.whaleSellVol,
			// CE15
			bbi: plan.bbiEnabled ? result.bbi[index] : undefined,
			sar: result.sarByKey.size > 0 ? [...result.sarByKey.values()][0]?.[index] : undefined,
			obv: plan.obvEnabled ? result.obv[index] : undefined,
			wr: result.wrByPeriod.size > 0 ? [...result.wrByPeriod.values()][0]?.[index] : undefined,
			vr: result.vrByPeriod.size > 0 ? [...result.vrByPeriod.values()][0]?.[index] : undefined,
			indicatorValues: Object.keys(indicatorValues).length > 0 ? indicatorValues : undefined,
		};
	});
}
