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