export interface RawOHLCV {
	date: Date;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export interface IndicatorBandValue {
	top: number;
	middle: number;
	bottom: number;
}

export interface IndicatorMacdValue {
	macd: number;
	signal: number;
	divergence: number;
}

export interface IndicatorWhaleValue {
	whaleBuyVol?: number;
	whaleSellVol?: number;
}

export type IndicatorDatumValue = number | IndicatorBandValue | IndicatorMacdValue | IndicatorWhaleValue;

export interface EnrichedDatum extends RawOHLCV {
	ema13?: number;
	ema20?: number;
	ema50?: number;
	bollingerBand?: IndicatorBandValue;
	rsi?: number;
	macd?: IndicatorMacdValue;
	cvdApprox?: number;
	cvdDelta?: number;
	bullPower?: number;
	bearPower?: number;
	whaleBuyVol?: number;
	whaleSellVol?: number;
	cvdRealtime?: number;
	strengthRelative?: number;
	// CE15
	bbi?: number;
	sar?: number;
	obv?: number;
	wr?: number;
	vr?: number;
	indicatorValues?: Record<string, IndicatorDatumValue | undefined>;
}
