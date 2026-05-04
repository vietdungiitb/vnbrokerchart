export interface RawOHLCV {
	date: Date;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export interface EnrichedDatum extends RawOHLCV {
	ema13?: number;
	ema20?: number;
	ema50?: number;
	bollingerBand?: { top: number; middle: number; bottom: number };
	rsi?: number;
	macd?: { macd: number; signal: number; divergence: number };
	cvdApprox?: number;
	cvdDelta?: number;
	bullPower?: number;
	bearPower?: number;
	whaleBuyVol?: number;
	whaleSellVol?: number;
	cvdRealtime?: number;
	strengthRelative?: number;
}
