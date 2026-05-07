import type {
	EnrichedDatum,
	IndicatorBandValue,
	IndicatorDatumValue,
	IndicatorMacdValue,
	IndicatorWhaleValue,
} from "./calculators/types";
import type { SeriesConfig } from "./types/pane-descriptor";

function numberParam(series: SeriesConfig, key: string, fallback: number) {
	const value = series.params?.[key];
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function exactLegacyValue(datum: EnrichedDatum, series: SeriesConfig): IndicatorDatumValue | undefined {
	switch (series.type) {
		case "EMA": {
			const period = numberParam(series, "period", 20);
			if (period === 13) return datum.ema13;
			if (period === 20) return datum.ema20;
			if (period === 50) return datum.ema50;
			return undefined;
		}
		case "BollingerBand": {
			const period = numberParam(series, "period", 20);
			const stdDev = numberParam(series, "stdDev", 2);
			return period === 20 && stdDev === 2 ? datum.bollingerBand : undefined;
		}
		case "RSI": {
			const period = numberParam(series, "period", 14);
			return period === 14 ? datum.rsi : undefined;
		}
		case "MACD": {
			const fast = numberParam(series, "fast", 12);
			const slow = numberParam(series, "slow", 26);
			const signal = numberParam(series, "signal", 9);
			return fast === 12 && slow === 26 && signal === 9 ? datum.macd : undefined;
		}
		case "Whale": {
			const threshold = numberParam(series, "threshold", 50_000);
			return threshold === 50_000
				? { whaleBuyVol: datum.whaleBuyVol, whaleSellVol: datum.whaleSellVol }
				: undefined;
		}
		default:
			return undefined;
	}
}

function asNumber(value: IndicatorDatumValue | undefined, pick?: (value: IndicatorDatumValue) => number | undefined) {
	if (value === undefined) {
		return undefined;
	}
	if (typeof value === "number") {
		return value;
	}
	return pick?.(value);
}

export function buildIndicatorSeriesKey(series: SeriesConfig): string | undefined {
	switch (series.type) {
		case "EMA":
			return `EMA:period=${numberParam(series, "period", 20)}`;
		case "MA":
			return `MA:period=${numberParam(series, "period", 20)}`;
		case "BollingerBand":
			return `BollingerBand:period=${numberParam(series, "period", 20)}:stdDev=${numberParam(series, "stdDev", 2)}`;
		case "RSI":
			return `RSI:period=${numberParam(series, "period", 14)}`;
		case "MACD":
			return `MACD:fast=${numberParam(series, "fast", 12)}:slow=${numberParam(series, "slow", 26)}:signal=${numberParam(series, "signal", 9)}`;
		case "Whale":
			return `Whale:threshold=${numberParam(series, "threshold", 50_000)}`;
		case "SAR":
			return `SAR:afStep=${numberParam(series, "afStep", 0.02)}:afMax=${numberParam(series, "afMax", 0.2)}`;
		case "WR":
			return `WR:period=${numberParam(series, "period", 14)}`;
		case "VR":
			return `VR:period=${numberParam(series, "period", 26)}`;
		default:
			return undefined;
	}
}

export function resolveSeriesDatumValue(datum: EnrichedDatum, series: SeriesConfig): IndicatorDatumValue | undefined {
	const key = buildIndicatorSeriesKey(series);
	if (key) {
		const value = datum.indicatorValues?.[key];
		if (value !== undefined) {
			return value;
		}
	}

	return exactLegacyValue(datum, series);
}

export function resolveSeriesValue(datum: EnrichedDatum, series: SeriesConfig): number | undefined {
	switch (series.type) {
		case "Candlestick":
		case "HollowCandle":
		case "OHLC":
		case "HeikinAshi":
		case "Line":
		case "Area":
		case "Bar":
			return datum.close;
		case "Volume":
			return datum.volume;
		case "EMA":
		case "MA":
		case "RSI":
		case "CVDApprox":
		case "CVDRealtime":
		case "StrengthRelative":
		case "WR":
		case "VR":
			return asNumber(resolveSeriesDatumValue(datum, series));
		case "BBI":
			return datum.bbi;
		case "SAR":
			return datum.sar ?? asNumber(resolveSeriesDatumValue(datum, series));
		case "OBV":
			return datum.obv;
		case "MACD":
			return asNumber(resolveSeriesDatumValue(datum, series), (value) => (value as IndicatorMacdValue).macd);
		case "BollingerBand":
			return asNumber(resolveSeriesDatumValue(datum, series), (value) => (value as IndicatorBandValue).middle);
		case "Whale":
			return asNumber(resolveSeriesDatumValue(datum, series), (value) => {
				const whale = value as IndicatorWhaleValue;
				return whale.whaleBuyVol ?? whale.whaleSellVol;
			});
		case "StrengthElder":
			return datum.bullPower;
		default:
			return datum.close;
	}
}

export function resolveSeriesStructuredValue(datum: EnrichedDatum, series: SeriesConfig) {
	switch (series.type) {
		case "BollingerBand":
			return (resolveSeriesDatumValue(datum, series) as IndicatorBandValue | undefined) ?? datum.bollingerBand;
		case "MACD":
			return (resolveSeriesDatumValue(datum, series) as IndicatorMacdValue | undefined) ?? datum.macd;
		case "Whale":
			return (resolveSeriesDatumValue(datum, series) as IndicatorWhaleValue | undefined)
				?? { whaleBuyVol: datum.whaleBuyVol, whaleSellVol: datum.whaleSellVol };
		case "StrengthElder":
			return { bullPower: datum.bullPower, bearPower: datum.bearPower };
		default:
			return resolveSeriesDatumValue(datum, series);
	}
}

export function resolveSeriesValueAccessors(series: SeriesConfig): Array<(datum: EnrichedDatum) => number | undefined> {
	switch (series.type) {
		case "Candlestick":
		case "HollowCandle":
		case "OHLC":
		case "HeikinAshi":
			return [(datum) => datum.low, (datum) => datum.high];
		case "Volume":
			return [(datum) => datum.volume];
		case "EMA":
		case "RSI":
		case "CVDApprox":
		case "CVDRealtime":
		case "StrengthRelative":
		case "Line":
		case "Area":
		case "Bar":
			return [(datum) => resolveSeriesValue(datum, series)];
		case "BollingerBand":
			return [
				(datum) => (resolveSeriesStructuredValue(datum, series) as IndicatorBandValue | undefined)?.top,
				(datum) => (resolveSeriesStructuredValue(datum, series) as IndicatorBandValue | undefined)?.middle,
				(datum) => (resolveSeriesStructuredValue(datum, series) as IndicatorBandValue | undefined)?.bottom,
			];
		case "MACD":
			return [
				(datum) => (resolveSeriesStructuredValue(datum, series) as IndicatorMacdValue | undefined)?.macd,
				(datum) => (resolveSeriesStructuredValue(datum, series) as IndicatorMacdValue | undefined)?.signal,
				(datum) => (resolveSeriesStructuredValue(datum, series) as IndicatorMacdValue | undefined)?.divergence,
			];
		case "StrengthElder":
			return [(datum) => datum.bullPower, (datum) => datum.bearPower];
		case "Whale":
			return [
				(datum) => (resolveSeriesStructuredValue(datum, series) as IndicatorWhaleValue | undefined)?.whaleBuyVol,
				(datum) => (resolveSeriesStructuredValue(datum, series) as IndicatorWhaleValue | undefined)?.whaleSellVol,
			];
		default:
			return [(datum) => resolveSeriesValue(datum, series)];
	}
}