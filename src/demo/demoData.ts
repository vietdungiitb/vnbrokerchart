import { bollingerBand, ema, macd, rsi } from "../lib/indicator";
import type { OHLCV } from "../lib/types";
import bitstampCsv from "../../docs/data/bitfinex_xbtusd_1m.csv";

export interface BollingerBandPoint {
	top: number;
	middle: number;
	bottom: number;
}

export interface MACDPoint {
	macd?: number;
	signal?: number;
	divergence?: number;
}

export const BOLLINGER_BAND_OPTIONS = {
	windowSize: 20,
	sourcePath: "close",
	multiplier: 2,
	movingAverageType: "sma",
} as const;

export interface DemoDatum extends OHLCV {
	ema20?: number;
	ema50?: number;
	rsi?: number;
	macd?: MACDPoint;
	bollingerBand?: BollingerBandPoint;
}

const DEMO_WINDOW = 200;
const BINANCE_ENDPOINT = "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=200";

function parseDateTime(value: string) {
	return new Date(value.replace(" ", "T"));
}

function parseCsvRow(row: string): DemoDatum {
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

function computeIndicators(data: DemoDatum[]) {
	const enriched = data.slice().sort((left, right) => left.date.valueOf() - right.date.valueOf());
	type IndicatorBuilder = any;

	const ema20 = (ema() as IndicatorBuilder)
		.id(0)
		.options({ windowSize: 20 })
		.merge((datum: DemoDatum, value: number | undefined) => { datum.ema20 = value; })
		.accessor((datum: DemoDatum) => datum.ema20);

	const ema50 = (ema() as IndicatorBuilder)
		.id(1)
		.options({ windowSize: 50 })
		.merge((datum: DemoDatum, value: number | undefined) => { datum.ema50 = value; })
		.accessor((datum: DemoDatum) => datum.ema50);

	const rsiCalculator = (rsi() as IndicatorBuilder)
		.options({ windowSize: 14 })
		.merge((datum: DemoDatum, value: number | undefined) => { datum.rsi = value; })
		.accessor((datum: DemoDatum) => datum.rsi);

	const macdCalculator = (macd() as IndicatorBuilder)
		.options({ fast: 12, slow: 26, signal: 9 })
		.merge((datum: DemoDatum, value: MACDPoint | undefined) => { datum.macd = value; })
		.accessor((datum: DemoDatum) => datum.macd);

	const bollingerBandCalculator = (bollingerBand() as IndicatorBuilder)
		.options(BOLLINGER_BAND_OPTIONS)
		.merge((datum: DemoDatum, value: BollingerBandPoint | undefined) => { datum.bollingerBand = value; })
		.accessor((datum: DemoDatum) => datum.bollingerBand);

	ema20(enriched);
	ema50(enriched);
	rsiCalculator(enriched);
	macdCalculator(enriched);
	bollingerBandCalculator(enriched);
	return enriched.slice(-DEMO_WINDOW);
}

export function getOfflineDemoData(): DemoDatum[] {
	return computeIndicators(bitstampCsv.trim().split(/\r?\n/).slice(1).map(parseCsvRow));
}

type BinanceKline = [number | string, string, string, string, string, string, ...unknown[]];

export function formatBinanceKlines(json: BinanceKline[]): DemoDatum[] {
	const parsed = json.map((d: any) => ({
		date: new Date(d[0]),
		open: parseFloat(d[1]),
		high: parseFloat(d[2]),
		low: parseFloat(d[3]),
		close: parseFloat(d[4]),
		volume: parseFloat(d[5]),
	}));

	return computeIndicators(parsed);
}

export async function fetchLiveDemoData(signal?: AbortSignal): Promise<DemoDatum[]> {
	const response = await fetch(BINANCE_ENDPOINT, { signal });

	if (!response.ok) {
		throw new Error(`Không tải được dữ liệu Binance: ${response.status}`);
	}

	const json = await response.json() as BinanceKline[];
	return formatBinanceKlines(json);
}