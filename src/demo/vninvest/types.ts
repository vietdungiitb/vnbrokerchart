/**
 * VNInvest API Response Types
 * Mapped from backend/portfolio/market_data_service.py
 */

/**
 * Technical indicators from chart endpoint response
 */
export interface TechnicalIndicators {
  bias: 'NEUTRAL' | 'BEARISH' | 'BULLISH';
  bias_label: string;
  bias_description: string;
  sma20?: number;
  sma50?: number;
  rsi14?: number;
  avg_volume_20?: number;
  price_vs_sma20_pct?: number;
  price_vs_sma50_pct?: number;
  momentum_20d_pct?: number;
  range_position_pct?: number;
  latest_close?: number;
  change_percent?: number;
  macd?: number;
  macd_signal?: number;
  atr_14?: number;
  volatility_20?: number;
  volume_ratio?: number;
}

/**
 * Individual OHLCV bar from chart endpoint
 */
export interface ChartPoint {
  date: string; // ISO8601 format
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Chart endpoint response: GET /api/stock-management/stocks/{symbol}/chart/
 */
export interface ChartResponse {
  symbol: string;
  days: number;
  timeframe: string; // '1m', '5m', '15m', '1H', '1D', etc.
  interval?: string;
  start_date: string;
  end_date: string;
  points: ChartPoint[];
  technical: TechnicalIndicators;
}

/**
 * Stock item from list endpoint
 */
export interface StockItem {
  symbol: string;
  company_name: string;
  exchange: string;
  sector?: string;
  industry?: string;
  market_cap?: number;
  [key: string]: any; // Allow other fields
}

/**
 * Realtime ticker response: GET /api/realtime/ticker/{symbol}/
 */
export interface TickerResponse {
  symbol: string;
  current_price: number;
  change_pct: number;
  volume: number;
  last_date: string;
  market_phase?: string;
  matched_value?: number;
  [key: string]: any;
}

/**
 * Whale order (buy/sell)
 */
export interface WhaleOrder {
  ts: string; // Timestamp
  price: number;
  volume: number;
  matched_value: number;
  side: 'BUY' | 'SELL';
  size_class: string;
}

/**
 * Whale order summary
 */
export interface WhaleOrderSummary {
  buy_value: number;
  sell_value: number;
  shark_value?: number;
  whale_value?: number;
  [key: string]: any;
}

/**
 * Whale feed response: GET /api/realtime/whale-feed/{symbol}/
 */
export interface WhaleFeedResponse {
  symbol: string;
  whale_orders: WhaleOrder[];
  summary: WhaleOrderSummary;
  timestamp?: string;
}

/**
 * Individual intraday trade
 */
export interface IntradayTrade {
  time: string;
  price: number;
  volume: number;
  side: 'BUY' | 'SELL' | 'NO';
}

/**
 * Intraday trades response: GET /api/realtime/intraday/{symbol}/
 */
export interface IntradayResponse {
  symbol: string;
  trades: IntradayTrade[];
  timestamp?: string;
  [key: string]: any;
}

/**
 * Generic API error response
 */
export interface APIError {
  detail?: string | Record<string, unknown>;
  [key: string]: any;
}
