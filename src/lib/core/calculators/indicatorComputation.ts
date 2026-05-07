import { bollingerSeries, emaSeries, macdSeries, rsiSeries, smaSeries, bbiSeries, sarSeries, obvSeries, wrSeries, vrSeries } from "../../indicators/utils";
import { buildIndicatorSeriesKey } from "../seriesValueResolver";
import type { SeriesConfig } from "../types/pane-descriptor";
import { calcCVDApprox } from "./calcCVDApprox";
import { calcStrengthElder } from "./calcStrengthElder";
import { calcWhaleApprox } from "./calcWhaleApprox";
import type { IndicatorBandValue, IndicatorDatumValue, IndicatorMacdValue, IndicatorWhaleValue, RawOHLCV } from "./types";

interface MacdConfig {
	fast: number;
	slow: number;
	signal: number;
}

interface BollingerConfig {
	period: number;
	stdDev: number;
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

function indicatorKey(series: SeriesConfig) {
	return buildIndicatorSeriesKey(series);
}

function defaultSeries(type: SeriesConfig["type"], params: Record<string, number> = {}): SeriesConfig {
	return { type, yAxis: "right", params };
}

export interface IndicatorComputationPlan {
	emaPeriods: Set<number>;
	smaPeriods: Set<number>;
	rsiPeriods: Set<number>;
	macdConfigs: Map<string, MacdConfig>;
	bollingerConfigs: Map<string, BollingerConfig>;
	whaleThresholds: Set<number>;
	bbiEnabled: boolean;
	sarByKey: Map<string, { afStep: number; afMax: number }>;
	obvEnabled: boolean;
	wrPeriods: Set<number>;
	vrPeriods: Set<number>;
	defaultMacdKey: string;
	defaultBollingerKey: string;
	defaultWhaleKey: string;
}

export interface IndicatorComputationResult {
	emaByPeriod: Map<number, Array<number | undefined>>;
	smaByPeriod: Map<number, Array<number | undefined>>;
	rsiByPeriod: Map<number, Array<number | undefined>>;
	macdByKey: Map<string, Array<IndicatorMacdValue | undefined>>;
	bollingerByKey: Map<string, Array<IndicatorBandValue | undefined>>;
	whaleByKey: Map<string, Array<IndicatorWhaleValue | undefined>>;
	bbi: Array<number | undefined>;
	sarByKey: Map<string, Array<number | undefined>>;
	obv: Array<number | undefined>;
	wrByPeriod: Map<number, Array<number | undefined>>;
	vrByPeriod: Map<number, Array<number | undefined>>;
	cvd: ReturnType<typeof calcCVDApprox>;
	strength: ReturnType<typeof calcStrengthElder>;
}

export function buildIndicatorComputationPlan(series: readonly SeriesConfig[], whaleThreshold: number): IndicatorComputationPlan {
	const emaPeriods = new Set<number>([13, 20, 50]);
	const smaPeriods = new Set<number>();
	const rsiPeriods = new Set<number>([14]);
	const macdConfigs = new Map<string, MacdConfig>();
	const bollingerConfigs = new Map<string, BollingerConfig>();
	const whaleThresholds = new Set<number>([whaleThreshold]);
	const sarByKey = new Map<string, { afStep: number; afMax: number }>();
	const wrPeriods = new Set<number>();
	const vrPeriods = new Set<number>();
	let bbiEnabled = false;
	let obvEnabled = false;
	const defaultMacdSeries = defaultSeries("MACD", { fast: 12, slow: 26, signal: 9 });
	const defaultBollingerSeries = defaultSeries("BollingerBand", { period: 20, stdDev: 2 });
	const defaultWhaleSeries = defaultSeries("Whale", { threshold: whaleThreshold });

	const defaultMacdKey = indicatorKey(defaultMacdSeries)!;
	const defaultBollingerKey = indicatorKey(defaultBollingerSeries)!;
	const defaultWhaleKey = indicatorKey(defaultWhaleSeries)!;

	macdConfigs.set(defaultMacdKey, { fast: 12, slow: 26, signal: 9 });
	bollingerConfigs.set(defaultBollingerKey, { period: 20, stdDev: 2 });

	for (const nextSeries of series) {
		switch (nextSeries.type) {
			case "EMA":
				emaPeriods.add(numberParam(nextSeries, "period", 20));
				break;
			case "MA":
				smaPeriods.add(numberParam(nextSeries, "period", 20));
				break;
			case "RSI":
				rsiPeriods.add(numberParam(nextSeries, "period", 14));
				break;
			case "MACD": {
				const key = indicatorKey(nextSeries);
				if (key) {
					macdConfigs.set(key, {
						fast: numberParam(nextSeries, "fast", 12),
						slow: numberParam(nextSeries, "slow", 26),
						signal: numberParam(nextSeries, "signal", 9),
					});
				}
				break;
			}
			case "BollingerBand": {
				const key = indicatorKey(nextSeries);
				if (key) {
					bollingerConfigs.set(key, {
						period: numberParam(nextSeries, "period", 20),
						stdDev: numberParam(nextSeries, "stdDev", 2),
					});
				}
				break;
			}
			case "Whale":
				whaleThresholds.add(numberParam(nextSeries, "threshold", whaleThreshold));
				break;
			case "BBI":
				bbiEnabled = true;
				break;
			case "SAR": {
				const key = indicatorKey(nextSeries);
				if (key) {
					sarByKey.set(key, {
						afStep: numberParam(nextSeries, "afStep", 0.02),
						afMax: numberParam(nextSeries, "afMax", 0.2),
					});
				}
				break;
			}
			case "OBV":
				obvEnabled = true;
				break;
			case "WR":
				wrPeriods.add(numberParam(nextSeries, "period", 14));
				break;
			case "VR":
				vrPeriods.add(numberParam(nextSeries, "period", 26));
				break;
			default:
				break;
		}
	}

	return {
		emaPeriods,
		smaPeriods,
		rsiPeriods,
		macdConfigs,
		bollingerConfigs,
		whaleThresholds,
		bbiEnabled,
		sarByKey,
		obvEnabled,
		wrPeriods,
		vrPeriods,
		defaultMacdKey,
		defaultBollingerKey,
		defaultWhaleKey,
	};
}

export function computeIndicatorComputationResult(raw: readonly RawOHLCV[], plan: IndicatorComputationPlan): IndicatorComputationResult {
	const closes = raw.map((bar) => bar.close);

	const emaByPeriod = new Map<number, Array<number | undefined>>();
	for (const period of plan.emaPeriods) {
		emaByPeriod.set(period, blankUntil(emaSeries(closes, period), Math.max(period - 1, 0)));
	}

	const smaByPeriod = new Map<number, Array<number | undefined>>();
	for (const period of plan.smaPeriods) {
		smaByPeriod.set(period, blankUntil(smaSeries(closes, period), Math.max(period - 1, 0)));
	}

	const rsiByPeriod = new Map<number, Array<number | undefined>>();
	for (const period of plan.rsiPeriods) {
		rsiByPeriod.set(period, blankUntil(rsiSeries(closes, period), Math.max(period, 1)));
	}

	const macdByKey = new Map<string, Array<IndicatorMacdValue | undefined>>();
	for (const [key, config] of plan.macdConfigs) {
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
	for (const [key, config] of plan.bollingerConfigs) {
		const series = bollingerSeries(closes, config.period, config.stdDev);
		bollingerByKey.set(key, mergeBand(series.upper, series.middle, series.lower, Math.max(config.period - 1, 0)));
	}

	const cvd = calcCVDApprox(raw);
	const strength = calcStrengthElder(raw);

	// CE15 indicators
	const bbi: Array<number | undefined> = plan.bbiEnabled
		? bbiSeries(raw)
		: new Array(raw.length).fill(undefined) as Array<undefined>;

	const sarByKey = new Map<string, Array<number | undefined>>();
	for (const [key, config] of plan.sarByKey) {
		sarByKey.set(key, blankUntil(sarSeries(raw, config.afStep, config.afMax), 1));
	}

	const obv: Array<number | undefined> = plan.obvEnabled
		? (obvSeries(raw) as Array<number | undefined>)
		: new Array(raw.length).fill(undefined) as Array<undefined>;

	const wrByPeriod = new Map<number, Array<number | undefined>>();
	for (const period of plan.wrPeriods) {
		wrByPeriod.set(period, blankUntil(wrSeries(raw, period), Math.max(period - 1, 0)));
	}

	const vrByPeriod = new Map<number, Array<number | undefined>>();
	for (const period of plan.vrPeriods) {
		vrByPeriod.set(period, blankUntil(vrSeries(raw, period), Math.max(period, 1)));
	}

	const whaleByKey = new Map<string, Array<IndicatorWhaleValue | undefined>>();
	for (const threshold of plan.whaleThresholds) {
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

	return {
		emaByPeriod,
		smaByPeriod,
		rsiByPeriod,
		macdByKey,
		bollingerByKey,
		whaleByKey,
		bbi,
		sarByKey,
		obv,
		wrByPeriod,
		vrByPeriod,
		cvd,
		strength,
	};
}

export function materializeIndicatorValues(index: number, plan: IndicatorComputationPlan, result: IndicatorComputationResult): Record<string, IndicatorDatumValue | undefined> {
	const indicatorValues: Record<string, IndicatorDatumValue | undefined> = {};

	for (const [period, values] of result.emaByPeriod) {
		const key = indicatorKey(defaultSeries("EMA", { period }));
		const value = values[index];
		if (key && value !== undefined) {
			indicatorValues[key] = value;
		}
	}

	for (const [period, values] of result.smaByPeriod) {
		const key = indicatorKey(defaultSeries("MA", { period }));
		const value = values[index];
		if (key && value !== undefined) {
			indicatorValues[key] = value;
		}
	}

	for (const [period, values] of result.rsiByPeriod) {
		const key = indicatorKey(defaultSeries("RSI", { period }));
		const value = values[index];
		if (key && value !== undefined) {
			indicatorValues[key] = value;
		}
	}

	for (const [key, values] of result.macdByKey) {
		const value = values[index];
		if (value !== undefined) {
			indicatorValues[key] = value;
		}
	}

	for (const [key, values] of result.bollingerByKey) {
		const value = values[index];
		if (value !== undefined) {
			indicatorValues[key] = value;
		}
	}

	for (const [key, values] of result.whaleByKey) {
		const value = values[index];
		if (value !== undefined) {
			indicatorValues[key] = value;
		}
	}

	// CE15 — SAR, WR, VR go into indicatorValues map
	for (const [key, values] of result.sarByKey) {
		const value = values[index];
		if (value !== undefined) {
			indicatorValues[key] = value;
		}
	}

	for (const [period, values] of result.wrByPeriod) {
		const key = indicatorKey(defaultSeries("WR", { period }));
		const value = values[index];
		if (key && value !== undefined) {
			indicatorValues[key] = value;
		}
	}

	for (const [period, values] of result.vrByPeriod) {
		const key = indicatorKey(defaultSeries("VR", { period }));
		const value = values[index];
		if (key && value !== undefined) {
			indicatorValues[key] = value;
		}
	}

	return indicatorValues;
}
