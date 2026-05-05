import { enrichData } from "../lib/core/calculators/enrichData";
import type { EnrichedDatum, IndicatorBandValue, IndicatorMacdValue, RawOHLCV } from "../lib/core/calculators/types";
import type { SeriesConfig } from "../lib/core/types/pane-descriptor";
import bitstampCsv from "../../docs/data/bitfinex_xbtusd_1m.csv";

export type BollingerBandPoint = IndicatorBandValue;
export type MACDPoint = IndicatorMacdValue;
export type DemoDatum = EnrichedDatum;

export const BOLLINGER_BAND_OPTIONS = {
	windowSize: 20,
	sourcePath: "close",
	multiplier: 2,
	movingAverageType: "sma",
} as const;

const DEMO_WINDOW = 300;
const BINANCE_BASE = "https://api.binance.com/api/v3/klines";
const DEMO_CANONICAL_SERIES: readonly SeriesConfig[] = [
	{ type: "EMA", yAxis: "right", params: { period: 20 } },
	{ type: "EMA", yAxis: "right", params: { period: 50 } },
	{ type: "RSI", yAxis: "left", params: { period: 14 } },
	{ type: "MACD", yAxis: "right", params: { fast: 12, slow: 26, signal: 9 } },
	{ type: "BollingerBand", yAxis: "right", params: { period: 20, stdDev: 2 } },
];

/** Map demo timeframe labels → Binance interval strings */
export const BINANCE_INTERVAL_MAP: Record<string, string> = {
	"1m": "1m", "3m": "3m", "5m": "5m", "15m": "15m", "30m": "30m",
	"1h": "1h", "4h": "4h", "1D": "1d", "1W": "1w",
};

function parseDateTime(value: string) {
	return new Date(value.replace(" ", "T"));
}

function parseCsvRow(row: string): RawOHLCV {
	const [date, open, high, low, close, volume] = row.split(",");

	return {
		date: parseDateTime(date),
		open: Number(open),
		high: Number(high),
		low: Number(low),
		close: Number(close),
		volume: Number(volume),
	};
}

function normalizeBars(data: readonly RawOHLCV[]): RawOHLCV[] {
	return data
		.slice()
		.sort((left, right) => left.date.valueOf() - right.date.valueOf())
		.slice(-DEMO_WINDOW);
}

function computeIndicators(data: readonly RawOHLCV[]) {
	return enrichData(normalizeBars(data), { series: DEMO_CANONICAL_SERIES });
}

export function getOfflineDemoBars(): RawOHLCV[] {
	return normalizeBars(bitstampCsv.trim().split(/\r?\n/).slice(1).map(parseCsvRow));
}

export function getOfflineDemoData(): DemoDatum[] {
	return computeIndicators(getOfflineDemoBars());
}

type BinanceKline = [number | string, string, string, string, string, string, ...unknown[]];

export function formatBinanceKlineBars(json: BinanceKline[]): RawOHLCV[] {
	return normalizeBars(json.map((d: any) => ({
		date: new Date(d[0]),
		open: parseFloat(d[1]),
		high: parseFloat(d[2]),
		low: parseFloat(d[3]),
		close: parseFloat(d[4]),
		volume: parseFloat(d[5]),
	})));
}

export function formatBinanceKlines(json: BinanceKline[]): DemoDatum[] {
	return computeIndicators(formatBinanceKlineBars(json));
}

export interface FetchLiveOptions {
	symbol?: string;
	interval?: string;
	limit?: number;
	signal?: AbortSignal;
}

export async function fetchLiveDemoBars(options: FetchLiveOptions = {}): Promise<RawOHLCV[]> {
	const { symbol = "BTCUSDT", interval = "1h", limit = 300, signal } = options;
	const binanceInterval = BINANCE_INTERVAL_MAP[interval] ?? interval;
	const url = `${BINANCE_BASE}?symbol=${encodeURIComponent(symbol)}&interval=${binanceInterval}&limit=${limit}`;
	const response = await fetch(url, { signal });

	if (!response.ok) {
		throw new Error(`Không tải được dữ liệu Binance: ${response.status}`);
	}

	const json = await response.json() as BinanceKline[];
	return formatBinanceKlineBars(json);
}

export async function fetchLiveDemoData(options: FetchLiveOptions = {}): Promise<DemoDatum[]> {
	return computeIndicators(await fetchLiveDemoBars(options));
}