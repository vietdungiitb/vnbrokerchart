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
 * VNInvest API base URL - must match backend server URL
 * Docker dev uses nginx frontend reverse proxy on port 80 that forwards to backend
 */
const API_BASE = 'http://localhost';

export const VNI_ENDPOINTS = {
  CHART: (symbol: string) =>
    `${API_BASE}/api/stock-management/stocks/${symbol}/chart/`,
  STOCKS_LIST: `${API_BASE}/api/stock-management/stocks/`,
  TICKER: (symbol: string) =>
    `${API_BASE}/api/realtime/ticker/${symbol}/`,
  WHALE_FEED: (symbol: string) =>
    `${API_BASE}/api/realtime/whale-feed/${symbol}/`,
  INTRADAY: (symbol: string) =>
    `${API_BASE}/api/realtime/intraday/${symbol}/`,
};

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

/**
 * VNInvest API Client
 */
export class VNInvestClient {
  private patToken: string;

  constructor(patToken?: string) {
    this.patToken = patToken ? patToken.trim() : "";
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
   * Make authenticated HTTP request to VNInvest API
   */
  private async request<T>(
    url: string,
    options?: RequestInit
  ): Promise<{ data: T; status: number }> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.patToken}`,
          ...(options?.headers || {}),
        },
      });

      const data = await response.json();

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
   * Get OHLCV chart data for a stock
   */
  async getChart(
    symbol: string,
    options?: {
      days?: number;
      timeframe?: string;
    }
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
   * Get list of all stocks
   */
  async getStocks(): Promise<StockItem[]> {
    const { data } = await this.request<{ results?: StockItem[] }>(
      VNI_ENDPOINTS.STOCKS_LIST
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
   * Get realtime ticker data
   */
  async getTicker(symbol: string): Promise<TickerResponse> {
    const { data } = await this.request<TickerResponse>(
      VNI_ENDPOINTS.TICKER(symbol)
    );
    return data;
  }

  /**
   * Get whale feed orders
   */
  async getWhaleFeed(symbol: string): Promise<WhaleFeedResponse> {
    const { data } = await this.request<WhaleFeedResponse>(
      VNI_ENDPOINTS.WHALE_FEED(symbol)
    );
    return data;
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
