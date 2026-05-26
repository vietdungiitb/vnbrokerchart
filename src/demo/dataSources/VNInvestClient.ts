/**
 * VNInvest API Client and Data Adapters
 * Handles authentication, API calls, and conversion to chart-compatible format
 */

import {
  ChartResponse,
  ChartPoint,
  StockItem,
  TickerResponse,
  WhaleFeedResponse,
  WhaleOrder,
  WhaleOrderSummary,
  IntradayResponse,
  TechnicalIndicators,
} from '../vninvest/types';

/**
 * Standard OHLCV bar format used by react-stockcharts
 * Maps to recharts/D3 compatible format
 */
export interface RawOHLCVBar {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Optional technical indicators attached to the bar
  technical?: Partial<TechnicalIndicators>;
}

/**
 * API base URL and endpoints
 */
/**
 * Resolve API base URL with lightweight runtime config.
 * Priority:
 * 1) globalThis.__VNI_API_BASE__
 * 2) localStorage.vni_api_base
 * 3) current origin (works with dev proxy / reverse proxy)
 */
function resolveApiBase(): string {
  const globalBase =
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as { __VNI_API_BASE__?: unknown }).__VNI_API_BASE__ === 'string'
      ? String((globalThis as { __VNI_API_BASE__?: string }).__VNI_API_BASE__).trim()
      : '';

  const storageBase =
    typeof localStorage !== 'undefined' ? (localStorage.getItem('vni_api_base') || '').trim() : '';

  const originBase =
    typeof globalThis.location !== 'undefined' && globalThis.location.origin
      ? globalThis.location.origin
      : 'http://localhost';

  const selected = globalBase || storageBase || originBase;
  return selected.replace(/\/$/, '');
}

const API_BASE = resolveApiBase();

export const VNI_ENDPOINTS = {
  // ── Native SaaS endpoints (core-api) ─────────────────────────────────────
  /** Stock profiles list/search */
  SYMBOLS_LIST: `${API_BASE}/core/v1/market-data/symbols/`,
  /** Real-time snapshot (price, change_pct, volume) */
  SYMBOL_SNAPSHOT: (symbol: string) =>
    `${API_BASE}/core/v1/symbol-snapshot/${symbol}`,
  /** Native daily OHLCV bars */
  DAILY_PRICES: (symbol: string) =>
    `${API_BASE}/core/v1/market-data/daily-prices/${symbol}/`,
  /** Whale alert feed — filtered by ?symbol= query param */
  WHALE_FEED_SIGNALS: `${API_BASE}/api/signals/whale-feed/`,
  /** Order flow events per symbol */
  ORDER_FLOW: (symbol: string) =>
    `${API_BASE}/api/signals/order-flow/${symbol}/`,
  /** Auth */
  AUTH_TOKEN: `${API_BASE}/api/auth/token/`,

  // ── Legacy bridge — kept until native intraday SaaS endpoint exists ────────
  /** Legacy chart bridge (intraday timeframes only) */
  CHART: (symbol: string) =>
    `${API_BASE}/api/stock-management/stocks/${symbol}/chart/`,
  /** Legacy intraday trade tape — no native equivalent yet */
  INTRADAY: (symbol: string) =>
    `${API_BASE}/api/realtime/intraday/${symbol}/`,
  // STOCKS_LIST kept as alias for any remaining callers
  STOCKS_LIST: `${API_BASE}/core/v1/market-data/symbols/`,
  // TICKER kept as alias
  TICKER: (symbol: string) =>
    `${API_BASE}/core/v1/symbol-snapshot/${symbol}`,
  // WHALE_FEED kept as alias
  WHALE_FEED: (symbol: string) =>
    `${API_BASE}/api/signals/whale-feed/?symbol=${symbol}`,
};

/** Timeframes considered "daily or coarser" — routed to native SaaS endpoint */
const DAILY_TIMEFRAMES = new Set(['D', '1D', '1d', 'W', 'M', 'Y']);

/**
 * Supported timeframes for chart endpoint
 */
export const TIMEFRAME_MAP = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1H',
  '1H': '1H',
  '2H': '2H',
  '4H': '4H',
  '1d': 'D',
  '1D': 'D',
  'D': 'D',
  'W': 'W',
  'M': 'M',
  'Y': 'Y',
} as const;

type WhaleSummaryBucket = 'shark' | 'whale' | 'small';

interface CanonicalWhaleSummary {
  buy_value: number;
  sell_value: number;
  shark_buy: number;
  shark_sell: number;
  whale_buy: number;
  whale_sell: number;
  small_buy: number;
  small_sell: number;
  shark_value: number;
  whale_value: number;
  small_value: number;
}

function parseNumericCandidate(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function pickNumericField(source: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    if (key in source) {
      const parsed = parseNumericCandidate(source[key]);
      if (parsed !== 0 || source[key] === 0 || source[key] === '0') {
        return parsed;
      }
    }
  }
  return 0;
}

function classifySizeClass(sizeClass: unknown): WhaleSummaryBucket {
  if (typeof sizeClass !== 'string') {
    return 'small';
  }

  const normalized = sizeClass.trim().toLowerCase();
  if (normalized === 'whale') {
    return 'whale';
  }
  if (normalized === 'shark') {
    return 'shark';
  }
  return 'small';
}

function summarizeOrders(orders: WhaleOrder[]): CanonicalWhaleSummary {
  const summary: CanonicalWhaleSummary = {
    buy_value: 0,
    sell_value: 0,
    shark_buy: 0,
    shark_sell: 0,
    whale_buy: 0,
    whale_sell: 0,
    small_buy: 0,
    small_sell: 0,
    shark_value: 0,
    whale_value: 0,
    small_value: 0,
  };

  for (const order of orders) {
    const matchedValue = parseNumericCandidate(order.matched_value);
    const side = typeof order.side === 'string' ? order.side.toUpperCase() : '';
    const bucket = classifySizeClass(order.size_class);
    const isSell = side === 'SELL';

    if (isSell) {
      summary.sell_value += matchedValue;
    } else {
      summary.buy_value += matchedValue;
    }

    if (bucket === 'shark') {
      if (isSell) {
        summary.shark_sell += matchedValue;
      } else {
        summary.shark_buy += matchedValue;
      }
      summary.shark_value += matchedValue;
    } else if (bucket === 'whale') {
      if (isSell) {
        summary.whale_sell += matchedValue;
      } else {
        summary.whale_buy += matchedValue;
      }
      summary.whale_value += matchedValue;
    } else {
      if (isSell) {
        summary.small_sell += matchedValue;
      } else {
        summary.small_buy += matchedValue;
      }
      summary.small_value += matchedValue;
    }
  }

  return summary;
}

function normalizeWhaleSummary(rawSummary: unknown, orders: WhaleOrder[]): WhaleOrderSummary {
  const source = (rawSummary && typeof rawSummary === 'object' ? rawSummary : {}) as Record<string, unknown>;
  const orderSummary = summarizeOrders(orders);

  const normalized: CanonicalWhaleSummary = {
    buy_value: pickNumericField(source, ['buy_value', 'buyValue', 'total_buy', 'totalBuy']) || orderSummary.buy_value,
    sell_value: pickNumericField(source, ['sell_value', 'sellValue', 'total_sell', 'totalSell']) || orderSummary.sell_value,
    shark_buy: pickNumericField(source, ['shark_buy', 'shark_buy_value', 'sharkBuy']) || orderSummary.shark_buy,
    shark_sell: pickNumericField(source, ['shark_sell', 'shark_sell_value', 'sharkSell']) || orderSummary.shark_sell,
    whale_buy: pickNumericField(source, ['whale_buy', 'whale_buy_value', 'whaleBuy']) || orderSummary.whale_buy,
    whale_sell: pickNumericField(source, ['whale_sell', 'whale_sell_value', 'whaleSell']) || orderSummary.whale_sell,
    small_buy: pickNumericField(source, ['small_buy', 'small_buy_value', 'smallBuy']) || orderSummary.small_buy,
    small_sell: pickNumericField(source, ['small_sell', 'small_sell_value', 'smallSell']) || orderSummary.small_sell,
    shark_value: 0,
    whale_value: 0,
    small_value: 0,
  };

  normalized.shark_value = pickNumericField(source, ['shark_value', 'sharkValue']) || (normalized.shark_buy + normalized.shark_sell);
  normalized.whale_value = pickNumericField(source, ['whale_value', 'whaleValue']) || (normalized.whale_buy + normalized.whale_sell);
  normalized.small_value = pickNumericField(source, ['small_value', 'smallValue']) || (normalized.small_buy + normalized.small_sell);

  return {
    ...source,
    ...normalized,
  };
}

function normalizeWhaleOrders(rawOrders: unknown): WhaleOrder[] {
  if (!Array.isArray(rawOrders)) {
    return [];
  }

  return rawOrders.map((order): WhaleOrder => {
    const item = (order && typeof order === 'object' ? order : {}) as Record<string, unknown>;
    const volume = parseNumericCandidate(item.volume);
    const price = parseNumericCandidate(item.price);
    const matchedValue = parseNumericCandidate(item.matched_value) || price * volume;
    const side = (typeof item.side === 'string' ? item.side.toUpperCase() : 'BUY') as WhaleOrder['side'];

    return {
      ts: typeof item.ts === 'string' ? item.ts : '',
      price,
      volume,
      matched_value: matchedValue,
      side: side === 'SELL' ? 'SELL' : 'BUY',
      size_class: typeof item.size_class === 'string' ? item.size_class : 'small',
    };
  });
}

function normalizeWhaleFeedResponse(rawData: unknown, symbol: string): WhaleFeedResponse {
  const source = (rawData && typeof rawData === 'object' ? rawData : {}) as Record<string, unknown>;
  const whaleOrders = normalizeWhaleOrders(source.whale_orders);
  const normalizedSummary = normalizeWhaleSummary(source.summary, whaleOrders);

  return {
    symbol: typeof source.symbol === 'string' ? source.symbol : symbol.toUpperCase(),
    whale_orders: whaleOrders,
    summary: normalizedSummary,
    timestamp: typeof source.timestamp === 'string' ? source.timestamp : undefined,
  };
}

/**
 * VNInvest API Client
 */
export class VNInvestClient {
  private patToken: string;
  /** Epoch ms until which ALL requests are blocked due to a 429 response. */
  private throttledUntil = 0;

  constructor(patToken?: string) {
    this.patToken = patToken ? patToken.trim() : "";
  }

  /** Returns ms remaining in the current throttle window, or 0 if not throttled. */
  get throttleRemainingMs(): number {
    return Math.max(0, this.throttledUntil - Date.now());
  }

  /**
   * Set or update the PAT token
   */
  setPAT(token: string): void {
    if (!token || !token.trim()) {
      throw new Error("PAT token is required");
    }
    this.patToken = token.trim();
  }

  /**
   * Clear current PAT token (used when backend reports token revoked/expired)
   */
  clearPAT(): void {
    this.patToken = "";
  }

  /**
   * Get the current PAT token
   */
  getPAT(): string {
    return this.patToken;
  }

  /**
   * Check if client has a valid PAT token
   */
  hasPAT(): boolean {
    return this.patToken.length > 0;
  }

  /**
   * Make authenticated HTTP request to VNInvest API.
   * Implements a client-side 429 circuit breaker: when the server throttles
   * requests, all subsequent calls are rejected immediately (without hitting
   * the network) until the Retry-After window expires.
   */
  private async request<T>(
    url: string,
    options?: RequestInit
  ): Promise<{ data: T; status: number }> {
    // Circuit breaker: fail fast if still inside throttle window
    const remainingMs = this.throttleRemainingMs;
    if (remainingMs > 0) {
      const remainSec = Math.ceil(remainingMs / 1000);
      const err = new Error(
        `API Error (429): Request was throttled. Expected available in ${remainSec} seconds.`
      );
      (err as any).status = 429;
      (err as any).throttledUntil = this.throttledUntil;
      throw err;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.patToken}`,
          ...(options?.headers || {}),
        },
      });

      const rawText = await response.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        // Backend returned non-JSON (e.g. 504 proxy error page, nginx error)
        const preview = rawText.substring(0, 120);
        const err = new Error(
          `Backend unreachable (HTTP ${response.status}): ${preview}`
        );
        (err as any).status = response.status;
        throw err;
      }

      if (response.status === 429) {
        // Parse retry-after from response header or detail message
        let retryAfterSec = 60; // conservative default
        const retryHeader = response.headers.get('Retry-After');
        if (retryHeader && /^\d+$/.test(retryHeader.trim())) {
          retryAfterSec = parseInt(retryHeader.trim(), 10);
        } else if (typeof data?.detail === 'string') {
          const match = /(\d+)\s*second/i.exec(data.detail);
          if (match) retryAfterSec = parseInt(match[1], 10);
        }
        // Add a small buffer so we don't fire exactly at the boundary
        this.throttledUntil = Date.now() + retryAfterSec * 1000 + 2000;

        const detail = typeof data?.detail === 'string' ? data.detail : `throttled for ${retryAfterSec}s`;
        const error = new Error(`API Error (429): ${detail}`);
        (error as any).status = 429;
        (error as any).throttledUntil = this.throttledUntil;
        throw error;
      }

      if (!response.ok) {
        const error = new Error(
          `API Error (${response.status}): ${
            typeof data?.detail === 'string'
              ? data.detail
              : JSON.stringify(data)
          }`
        );
        (error as any).status = response.status;
        (error as any).data = data;
        throw error;
      }

      return { data, status: response.status };
    } catch (error) {
      if (error instanceof Error && (error as any).status) {
        throw error;
      }
      throw new Error(
        `Request failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get OHLCV chart data for a stock.
   * Routes daily/weekly/monthly timeframes to the native SaaS endpoint;
   * intraday timeframes fall back to the legacy bridge while a native
   * intraday SaaS endpoint is not yet available.
   */
  async getChart(
    symbol: string,
    options?: {
      days?: number;
      timeframe?: string;
    }
  ): Promise<ChartResponse> {
    const tf = options?.timeframe ?? 'D';
    const normalizedTf = (TIMEFRAME_MAP as Record<string, string>)[tf] ?? tf;

    if (DAILY_TIMEFRAMES.has(normalizedTf)) {
      return this._getChartNative(symbol, options);
    }
    return this._getChartLegacy(symbol, options);
  }

  /**
   * Native SaaS path: GET /core/v1/market-data/daily-prices/<symbol>/
   * Adapts DailyPriceSerializer response to the shared ChartResponse contract.
   */
  private async _getChartNative(
    symbol: string,
    options?: { days?: number; timeframe?: string }
  ): Promise<ChartResponse> {
    const params = new URLSearchParams();
    if (options?.days) {
      // Convert days → date_from for the native endpoint
      const from = new Date();
      from.setDate(from.getDate() - (options.days ?? 90));
      params.append('date_from', from.toISOString().slice(0, 10));
    }
    const url =
      VNI_ENDPOINTS.DAILY_PRICES(symbol) +
      (params.toString() ? `?${params.toString()}` : '');

    const { data } = await this.request<{ symbol: string; results: Array<{
      date: string; open: number; high: number; low: number;
      close: number; volume: number;
    }>; }>(url);

    const results = data.results ?? [];
    const points: ChartPoint[] = results.map((r) => ({
      date: r.date,
      open: Number(r.open),
      high: Number(r.high),
      low: Number(r.low),
      close: Number(r.close),
      volume: Number(r.volume),
    }));
    // Native returns newest-first; chart layer expects oldest-first
    points.reverse();

    const tf = options?.timeframe ?? 'D';
    return {
      symbol: data.symbol ?? symbol.toUpperCase(),
      days: options?.days ?? 90,
      timeframe: (TIMEFRAME_MAP as Record<string, string>)[tf] ?? tf,
      start_date: points[0]?.date ?? '',
      end_date: points[points.length - 1]?.date ?? '',
      points,
      technical: {} as any,
    };
  }

  /**
   * Legacy bridge path: GET /api/stock-management/stocks/<symbol>/chart/
   * Used for intraday timeframes until native SaaS OHLC endpoint exists.
   */
  private async _getChartLegacy(
    symbol: string,
    options?: { days?: number; timeframe?: string }
  ): Promise<ChartResponse> {
    const params = new URLSearchParams();
    if (options?.days) params.append('days', String(options.days));
    if (options?.timeframe) {
      const normalizedTimeframe =
        (TIMEFRAME_MAP as Record<string, string>)[options.timeframe] ??
        options.timeframe;
      params.append('timeframe', normalizedTimeframe);
    }
    const url =
      VNI_ENDPOINTS.CHART(symbol) +
      (params.toString() ? `?${params.toString()}` : '');
    const { data } = await this.request<ChartResponse>(url);
    return data;
  }

  /**
   * Get list of all stocks.
   * Native SaaS: GET /core/v1/market-data/symbols/
   */
  async getStocks(): Promise<StockItem[]> {
    const { data } = await this.request<{ results?: StockItem[] }>(
      VNI_ENDPOINTS.SYMBOLS_LIST
    );
    return data.results || [];
  }

  /**
   * Search stocks by symbol or company name
   * Client-side filtering on full list
   */
  async searchStocks(query: string): Promise<StockItem[]> {
    const all = await this.getStocks();
    const lowerQuery = query.toLowerCase();
    return all.filter(
      (s) =>
        s.symbol.toLowerCase().includes(lowerQuery) ||
        s.company_name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get realtime ticker/snapshot data.
   * Native SaaS: GET /core/v1/symbol-snapshot/<symbol>
   * Adapts SymbolSnapshot fields to TickerResponse contract.
   */
  async getTicker(symbol: string): Promise<TickerResponse> {
    const { data } = await this.request<{
      symbol: string;
      session_date: string;
      price: number;
      price_change: number;
      price_change_pct: number;
      volume: number;
      market_status?: string;
      [key: string]: any;
    }>(VNI_ENDPOINTS.SYMBOL_SNAPSHOT(symbol));
    // Adapt native snapshot shape → TickerResponse contract
    return {
      ...data,
      current_price: data.price,
      change_pct: data.price_change_pct,
      last_date: data.session_date,
      market_phase: data.market_status,
    };
  }

  /**
   * Get whale feed orders for a symbol.
   * Native SaaS: GET /api/signals/whale-feed/?symbol=<symbol>
   */
  async getWhaleFeed(symbol: string): Promise<WhaleFeedResponse> {
    const url = `${VNI_ENDPOINTS.WHALE_FEED_SIGNALS}?symbol=${encodeURIComponent(symbol)}`;
    const { data } = await this.request<unknown>(url);
    return normalizeWhaleFeedResponse(data, symbol);
  }

  /**
   * Get intraday trades
   */
  async getIntraday(symbol: string, pageSize?: number): Promise<IntradayResponse> {
    const url =
      VNI_ENDPOINTS.INTRADAY(symbol) +
      (pageSize ? `?page_size=${pageSize}` : '');

    const { data } = await this.request<IntradayResponse>(url);
    return data;
  }
}

/**
 * Adapter: Convert ChartPoint to RawOHLCVBar
 * Handles date parsing and optional technical indicators
 */
export class RawOHLCVToStandardAdapter {
  /**
   * Convert single ChartPoint to RawOHLCVBar
   */
  static toBar(point: ChartPoint, technical?: TechnicalIndicators): RawOHLCVBar {
    return {
      date: new Date(point.date),
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: point.volume,
      ...(technical && { technical }),
    };
  }

  /**
   * Convert ChartResponse to array of RawOHLCVBars
   */
  static fromChartResponse(response: ChartResponse): RawOHLCVBar[] {
    return response.points.map((point: ChartPoint) =>
      this.toBar(point, response.technical)
    );
  }
}

/**
 * Client factory: Create and cache client instance
 */
let clientInstance: VNInvestClient | null = null;

export function createVNInvestClient(patToken: string): VNInvestClient {
  clientInstance = new VNInvestClient(patToken);
  return clientInstance;
}

export function getVNInvestClient(): VNInvestClient | null {
  return clientInstance;
}

export function clearVNInvestClient(): void {
  clientInstance = null;
}
