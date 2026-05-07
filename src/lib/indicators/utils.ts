export function numericExtent(values: readonly number[]): [number, number] {
	const finiteValues = values.filter((value) => Number.isFinite(value));
	if (finiteValues.length === 0) {
		return [0, 1];
	}

	const minValue = Math.min(...finiteValues);
	const maxValue = Math.max(...finiteValues);
	if (minValue === maxValue) {
		return [minValue - 1, maxValue + 1];
	}
	return [minValue, maxValue];
}

export function collectNumbers(value: unknown, collected: number[] = []): number[] {
	if (Array.isArray(value)) {
		for (const item of value) {
			collectNumbers(item, collected);
		}
		return collected;
	}

	if (typeof value === "number" && Number.isFinite(value)) {
		collected.push(value);
		return collected;
	}

	if (value && typeof value === "object") {
		for (const item of Object.values(value as Record<string, unknown>)) {
			collectNumbers(item, collected);
		}
	}

	return collected;
}

export function emaSeries(values: readonly number[], period: number): number[] {
	if (values.length === 0) {
		return [];
	}

	const smoothing = 2 / (Math.max(period, 1) + 1);
	const series: number[] = [];
	let previousEma = values[0] ?? 0;

	for (let index = 0; index < values.length; index += 1) {
		const current = values[index] ?? previousEma;
		if (index === 0) {
			previousEma = current;
			series.push(current);
			continue;
		}

		previousEma = (current - previousEma) * smoothing + previousEma;
		series.push(previousEma);
	}

	return series;
}

export function smaSeries(values: readonly number[], period: number): number[] {
	if (values.length === 0) {
		return [];
	}

	const window = Math.max(period, 1);
	const series: number[] = [];
	let rollingSum = 0;

	for (let index = 0; index < values.length; index += 1) {
		rollingSum += values[index] ?? 0;
		if (index >= window) {
			rollingSum -= values[index - window] ?? 0;
		}

		const divisor = Math.min(index + 1, window);
		series.push(rollingSum / divisor);
	}

	return series;
}

// ── CE15 compute functions ────────────────────────────────────────────────────

interface PriceBar {
	close: number;
	high: number;
	low: number;
	volume: number;
}

export function bbiSeries(bars: readonly PriceBar[]): number[] {
	const close = bars.map((b) => b.close);
	const ma3 = smaSeries(close, 3);
	const ma6 = smaSeries(close, 6);
	const ma12 = smaSeries(close, 12);
	const ma24 = smaSeries(close, 24);
	return close.map((_, i) => (ma3[i]! + ma6[i]! + ma12[i]! + ma24[i]!) / 4);
}

export function sarSeries(
	bars: readonly PriceBar[],
	afStep = 0.02,
	afMax = 0.2,
): number[] {
	if (bars.length < 2) {
		return bars.map(() => NaN);
	}

	const result: number[] = new Array(bars.length).fill(NaN) as number[];
	let isUpTrend = bars[1]!.close > bars[0]!.close;
	let af = afStep;
	let ep = isUpTrend ? bars[0]!.high : bars[0]!.low;
	let sar = isUpTrend ? bars[0]!.low : bars[0]!.high;

	result[0] = sar;

	for (let i = 1; i < bars.length; i++) {
		const bar = bars[i]!;
		const prevSar = sar;

		// Calculate new SAR
		sar = prevSar + af * (ep - prevSar);

		if (isUpTrend) {
			// SAR must be below prior two lows
			sar = Math.min(sar, bars[i - 1]!.low);
			if (i >= 2) sar = Math.min(sar, bars[i - 2]!.low);

			if (bar.low < sar) {
				// Trend reversal: down
				isUpTrend = false;
				sar = ep;
				ep = bar.low;
				af = afStep;
			} else {
				if (bar.high > ep) {
					ep = bar.high;
					af = Math.min(af + afStep, afMax);
				}
			}
		} else {
			// SAR must be above prior two highs
			sar = Math.max(sar, bars[i - 1]!.high);
			if (i >= 2) sar = Math.max(sar, bars[i - 2]!.high);

			if (bar.high > sar) {
				// Trend reversal: up
				isUpTrend = true;
				sar = ep;
				ep = bar.high;
				af = afStep;
			} else {
				if (bar.low < ep) {
					ep = bar.low;
					af = Math.min(af + afStep, afMax);
				}
			}
		}

		result[i] = sar;
	}

	return result;
}

export function obvSeries(bars: readonly PriceBar[]): number[] {
	const result: number[] = [0];
	for (let i = 1; i < bars.length; i++) {
		const delta =
			bars[i]!.close > bars[i - 1]!.close
				? bars[i]!.volume
				: bars[i]!.close < bars[i - 1]!.close
				? -bars[i]!.volume
				: 0;
		result.push(result[i - 1]! + delta);
	}
	return result;
}

export function wrSeries(bars: readonly PriceBar[], period = 14): number[] {
	return bars.map((_, i) => {
		if (i < period - 1) return NaN;
		const slice = bars.slice(i - period + 1, i + 1);
		const hh = Math.max(...slice.map((b) => b.high));
		const ll = Math.min(...slice.map((b) => b.low));
		if (hh === ll) return -50;
		return ((hh - bars[i]!.close) / (hh - ll)) * -100;
	});
}

export function vrSeries(bars: readonly PriceBar[], period = 26): number[] {
	return bars.map((_, i) => {
		if (i < period) return NaN;
		const slice = bars.slice(i - period + 1, i + 1);
		let up = 0, down = 0, flat = 0;
		for (let j = 1; j < slice.length; j++) {
			if (slice[j]!.close > slice[j - 1]!.close) up += slice[j]!.volume;
			else if (slice[j]!.close < slice[j - 1]!.close) down += slice[j]!.volume;
			else flat += slice[j]!.volume;
		}
		const denom = down + flat * 0.5;
		if (denom === 0) return 100;
		return ((up + flat * 0.5) / denom) * 100;
	});
}

export function rsiSeries(values: readonly number[], period: number): number[] {
	if (values.length === 0) {
		return [];
	}

	const window = Math.max(period, 1);
	const series: number[] = [50];
	let averageGain = 0;
	let averageLoss = 0;

	for (let index = 1; index < values.length; index += 1) {
		const change = (values[index] ?? 0) - (values[index - 1] ?? 0);
		const gain = Math.max(change, 0);
		const loss = Math.max(-change, 0);

		if (index <= window) {
			averageGain += gain;
			averageLoss += loss;
			const divisor = Math.min(index, window);
			const gainAverage = averageGain / divisor;
			const lossAverage = averageLoss / divisor;
			const relativeStrength = lossAverage === 0 ? Number.POSITIVE_INFINITY : gainAverage / lossAverage;
			series.push(100 - (100 / (1 + relativeStrength)));
			continue;
		}

		averageGain = ((averageGain * (window - 1)) + gain) / window;
		averageLoss = ((averageLoss * (window - 1)) + loss) / window;
		const relativeStrength = averageLoss === 0 ? Number.POSITIVE_INFINITY : averageGain / averageLoss;
		series.push(100 - (100 / (1 + relativeStrength)));
	}

	return series;
}

export interface MacdSeriesResult {
	macd: number[];
	signal: number[];
	histogram: number[];
}

export function macdSeries(values: readonly number[], fastPeriod: number, slowPeriod: number, signalPeriod: number): MacdSeriesResult {
	const fastEma = emaSeries(values, fastPeriod);
	const slowEma = emaSeries(values, slowPeriod);
	const macd = values.map((_, index) => (fastEma[index] ?? 0) - (slowEma[index] ?? 0));
	const signal = emaSeries(macd, signalPeriod);
	const histogram = macd.map((value, index) => value - (signal[index] ?? 0));

	return { macd, signal, histogram };
}

export interface BollingerSeriesResult {
	upper: number[];
	middle: number[];
	lower: number[];
}

function rollingStandardDeviation(values: readonly number[], period: number): number[] {
	if (values.length === 0) {
		return [];
	}

	const window = Math.max(period, 1);
	const series: number[] = [];

	for (let index = 0; index < values.length; index += 1) {
		const startIndex = Math.max(0, index - window + 1);
		const slice = values.slice(startIndex, index + 1);
		const mean = slice.reduce((sum, value) => sum + (value ?? 0), 0) / slice.length;
		const variance = slice.reduce((sum, value) => {
			const delta = (value ?? 0) - mean;
			return sum + (delta * delta);
		}, 0) / slice.length;
		series.push(Math.sqrt(variance));
	}

	return series;
}

export function bollingerSeries(values: readonly number[], period: number, multiplier: number): BollingerSeriesResult {
	const middle = smaSeries(values, period);
	const deviation = rollingStandardDeviation(values, period);
	const upper = middle.map((value, index) => value + ((deviation[index] ?? 0) * multiplier));
	const lower = middle.map((value, index) => value - ((deviation[index] ?? 0) * multiplier));

	return { upper, middle, lower };
}