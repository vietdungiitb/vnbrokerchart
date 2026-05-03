import { getIndicator, listIndicators, registerIndicator } from "./registry";
import EMA from "./builtin/ema";
import SMA from "./builtin/sma";
import RSI from "./builtin/rsi";
import MACD from "./builtin/macd";
import BOLLINGER from "./builtin/bollinger";
import VOLUME from "./builtin/volume";
import CVD from "./builtin/cvd";

registerIndicator(EMA);
registerIndicator(SMA);
registerIndicator(RSI);
registerIndicator(MACD);
registerIndicator(BOLLINGER);
registerIndicator(VOLUME);
registerIndicator(CVD);

export { getIndicator, listIndicators, registerIndicator } from "./registry";
export type { IndicatorName, IndicatorRegistry, RegisteredIndicator } from "./types";
export { EMA, SMA, RSI, MACD, BOLLINGER, VOLUME, CVD };