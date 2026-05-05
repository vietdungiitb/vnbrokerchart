import { bollingerSeries, emaSeries, macdSeries, rsiSeries } from "../../indicators/utils";
import { buildIndicatorSeriesKey } from "../seriesValueResolver";
import type { SeriesConfig } from "../types/pane-descriptor";
import { calcCVDApprox } from "./calcCVDApprox";
import { calcStrengthElder } from "./calcStrengthElder";
import { calcWhaleApprox } from "./calcWhaleApprox";
import type { EnrichedDatum, IndicatorBandValue, IndicatorDatumValue, IndicatorMacdValue, IndicatorWhaleValue, RawOHLCV } from "./types";

export interface EnrichDataOptions {
	series?: readonly SeriesConfig[];
	whaleThreshold?: number;
}

function blankUntil<T>(values: readonly T[], startIndex: number): Array<T | undefined> {
	return values.map((value, index) => (index >= startIndex ? value : undefined));
}

function mergeBand(
	upper: readonly number[],
	middle: readonly number[],
	lower: readonly number[],
	startIndex: number,
): Array<IndicatorBandValue | undefined> {
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

function numberParam(series: SeriesConfig, key: string, fallback: number) {
	const value = series.params?.[key];
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
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

function indicatorKey(series: SeriesConfig) {
	return buildIndicatorSeriesKey(series);
}

function defaultSeries(type: SeriesConfig["type"], params: Record<string, number> = {}): SeriesConfig {
	return { type, yAxis: "right", params };
}

export function enrichData(raw: readonly RawOHLCV[], optionsOrWhaleThreshold?: EnrichDataOptions | number): EnrichedDatum[] {
	if (raw.length === 0) {
		return [];
	}
	const options = normalizeOptions(optionsOrWhaleThreshold);

	const closes = raw.map((bar) => bar.close);
	const emaPeriods = new Set<number>([13, 20, 50]);
	const rsiPeriods = new Set<number>([14]);
	const macdConfigs = new Map<string, { fast: number; slow: number; signal: number }>();
	const bollingerConfigs = new Map<string, { period: number; stdDev: number }>();
	const whaleThresholds = new Set<number>([options.whaleThreshold]);
	const defaultMacdSeries = defaultSeries("MACD", { fast: 12, slow: 26, signal: 9 });
	const defaultBollingerSeries = defaultSeries("BollingerBand", { period: 20, stdDev: 2 });
	const defaultWhaleSeries = defaultSeries("Whale", { threshold: options.whaleThreshold });

	macdConfigs.set(indicatorKey(defaultMacdSeries)!, { fast: 12, slow: 26, signal: 9 });
	bollingerConfigs.set(indicatorKey(defaultBollingerSeries)!, { period: 20, stdDev: 2 });

	for (const series of options.series) {
		switch (series.type) {
			case "EMA":
				emaPeriods.add(numberParam(series, "period", 20));
				break;
			case "RSI":
				rsiPeriods.add(numberParam(series, "period", 14));
				break;
			case "MACD": {
				const key = indicatorKey(series);
				if (key) {
					macdConfigs.set(key, {
						fast: numberParam(series, "fast", 12),
						slow: numberParam(series, "slow", 26),
						signal: numberParam(series, "signal", 9),
					});
				}
				break;
			}
			case "BollingerBand": {
				const key = indicatorKey(series);
				if (key) {
					bollingerConfigs.set(key, {
						period: numberParam(series, "period", 20),
						stdDev: numberParam(series, "stdDev", 2),
					});
				}
				break;
			}
			case "Whale":
				whaleThresholds.add(numberParam(series, "threshold", options.whaleThreshold));
				break;
			default:
				break;
		}
	}

	const emaByPeriod = new Map<number, Array<number | undefined>>();
	for (const period of emaPeriods) {
		emaByPeriod.set(period, blankUntil(emaSeries(closes, period), Math.max(period - 1, 0)));
	}

	const rsiByPeriod = new Map<number, Array<number | undefined>>();
	for (const period of rsiPeriods) {
		rsiByPeriod.set(period, blankUntil(rsiSeries(closes, period), Math.max(period, 1)));
	}

	const macdByKey = new Map<string, Array<IndicatorMacdValue | undefined>>();
	for (const [key, config] of macdConfigs) {
		const macd = macdSeries(closes, config.fast, config.slow, config.signal);
		const macdLine = blankUntil(macd.macd, Math.max(config.slow - 1, 0));
		const signalLine = blankUntil(macd.signal, Math.max(config.slow - 1, 0));
		const histogramLine = blankUntil(macd.histogram, Math.max(config.slow - 1, 0));
		macdByKey.set(key, raw.map((_, index) => {
			const macdValue = macdLine[index];
			const signalValue = signalLine[index];
			const histogramValue = histogramLine[index];
			if (macdValue === undefined || signalValue === undefined || histogramValue === undefined) {
				return undefined;
			}
			return {
				macd: macdValue,
				signal: signalValue,
				divergence: histogramValue,
			};
		}));
	}

	const bollingerByKey = new Map<string, Array<IndicatorBandValue | undefined>>();
	for (const [key, config] of bollingerConfigs) {
		const series = bollingerSeries(closes, config.period, config.stdDev);
		bollingerByKey.set(key, mergeBand(series.upper, series.middle, series.lower, Math.max(config.period - 1, 0)));
	}

	const cvd = calcCVDApprox(raw);
	const strength = calcStrengthElder(raw);
	const whaleByKey = new Map<string, Array<IndicatorWhaleValue | undefined>>();
	for (const threshold of whaleThresholds) {
		const key = indicatorKey(defaultSeries("Whale", { threshold }));
		if (!key) {
			continue;
		}
		whaleByKey.set(
			key,
			calcWhaleApprox(raw, threshold).map((point) => (
				point.whaleBuyVol === undefined && point.whaleSellVol === undefined
					? undefined
					: { whaleBuyVol: point.whaleBuyVol, whaleSellVol: point.whaleSellVol }
			)),
		);
	}

	const defaultBollingerKey = indicatorKey(defaultBollingerSeries)!;
	const defaultMacdKey = indicatorKey(defaultMacdSeries)!;
	const defaultWhaleKey = indicatorKey(defaultWhaleSeries)!;

	return raw.map((bar, index) => {
		const ema13 = emaByPeriod.get(13)?.[index];
		const strengthPoint = strength[index];
		const indicatorValues: Record<string, IndicatorDatumValue | undefined> = {};

		for (const [period, values] of emaByPeriod) {
			const key = indicatorKey(defaultSeries("EMA", { period }));
			const value = values[index];
			if (key && value !== undefined) {
				indicatorValues[key] = value;
			}
		}

		for (const [period, values] of rsiByPeriod) {
			const key = indicatorKey(defaultSeries("RSI", { period }));
			const value = values[index];
			if (key && value !== undefined) {
				indicatorValues[key] = value;
			}
		}

		for (const [key, values] of macdByKey) {
			const value = values[index];
			if (value !== undefined) {
				indicatorValues[key] = value;
			}
		}

		for (const [key, values] of bollingerByKey) {
			const value = values[index];
			if (value !== undefined) {
				indicatorValues[key] = value;
			}
		}

		for (const [key, values] of whaleByKey) {
			const value = values[index];
			if (value !== undefined) {
				indicatorValues[key] = value;
			}
		}

		const defaultMacd = macdByKey.get(defaultMacdKey)?.[index];
		const defaultWhale = whaleByKey.get(defaultWhaleKey)?.[index];

		return {
			...bar,
			ema13,
			ema20: emaByPeriod.get(20)?.[index],
			ema50: emaByPeriod.get(50)?.[index],
			bollingerBand: bollingerByKey.get(defaultBollingerKey)?.[index],
			rsi: rsiByPeriod.get(14)?.[index],
			macd: defaultMacd,
			cvdApprox: cvd[index]?.cvdApprox,
			cvdDelta: cvd[index]?.cvdDelta,
			bullPower: strengthPoint?.bullPower,
			bearPower: strengthPoint?.bearPower,
			whaleBuyVol: defaultWhale?.whaleBuyVol,
			whaleSellVol: defaultWhale?.whaleSellVol,
			indicatorValues: Object.keys(indicatorValues).length > 0 ? indicatorValues : undefined,
		};
	});
}
