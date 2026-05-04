import { bollingerSeries, emaSeries, macdSeries, rsiSeries } from "../../indicators/utils";
import { calcCVDApprox } from "./calcCVDApprox";
import { calcStrengthElder } from "./calcStrengthElder";
import { calcWhaleApprox } from "./calcWhaleApprox";
import type { EnrichedDatum, RawOHLCV } from "./types";

function blankUntil<T>(values: readonly T[], startIndex: number): Array<T | undefined> {
	return values.map((value, index) => (index >= startIndex ? value : undefined));
}

function mergeBand(
	upper: readonly number[],
	middle: readonly number[],
	lower: readonly number[],
	startIndex: number,
) {
	return upper.map((top, index) => {
		if (index < startIndex) {
			return undefined;
		}
		return {
			top,
			middle: middle[index] ?? middle[middle.length - 1] ?? top,
			bottom: lower[index] ?? lower[lower.length - 1] ?? top,
		};
	});
}

export function enrichData(raw: readonly RawOHLCV[], whaleThreshold = 50_000): EnrichedDatum[] {
	if (raw.length === 0) {
		return [];
	}

	const closes = raw.map((bar) => bar.close);
	const ema13Series = blankUntil(emaSeries(closes, 13), 12);
	const ema20Series = blankUntil(emaSeries(closes, 20), 19);
	const ema50Series = blankUntil(emaSeries(closes, 50), 49);
	const bollinger = (() => {
		const series = bollingerSeries(closes, 20, 2);
		return mergeBand(series.upper, series.middle, series.lower, 19);
	})();
	const rsiSeriesValues = blankUntil(rsiSeries(closes, 14), 14);
	const macd = macdSeries(closes, 12, 26, 9);
	const macdLine = blankUntil(macd.macd, 25);
	const signalLine = blankUntil(macd.signal, 25);
	const histogramLine = blankUntil(macd.histogram, 25);
	const cvd = calcCVDApprox(raw);
	const strength = calcStrengthElder(raw);
	const whale = calcWhaleApprox(raw, whaleThreshold);

	return raw.map((bar, index) => {
		const ema13 = ema13Series[index];
		const strengthPoint = strength[index];
		const macdValue = macdLine[index];
		const signalValue = signalLine[index];
		const histogramValue = histogramLine[index];

		return {
			...bar,
			ema13,
			ema20: ema20Series[index],
			ema50: ema50Series[index],
			bollingerBand: bollinger[index],
			rsi: rsiSeriesValues[index],
			macd: macdValue === undefined || signalValue === undefined || histogramValue === undefined
				? undefined
				: {
					macd: macdValue,
					signal: signalValue,
					divergence: histogramValue,
				},
			cvdApprox: cvd[index]?.cvdApprox,
			cvdDelta: cvd[index]?.cvdDelta,
			bullPower: strengthPoint?.bullPower,
			bearPower: strengthPoint?.bearPower,
			whaleBuyVol: whale[index]?.whaleBuyVol,
			whaleSellVol: whale[index]?.whaleSellVol,
		};
	});
}
