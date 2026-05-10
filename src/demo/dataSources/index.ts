/**
 * DataSource abstraction layer
 * Allows switching between demo and API data sources
 */

import type { RawOHLCV } from "../../lib/core/calculators/types";

/**
 * Common interface for data sources
 */
export interface DataSource {
  /**
   * Load OHLCV bars for a symbol
   */
  loadBars(symbol: string, options?: {
    days?: number;
    timeframe?: string;
  }): Promise<RawOHLCV[]>;

  /**
   * Get list of available symbols
   */
  getSymbols(): Promise<string[]>;

  /**
   * Search symbols by query
   */
  searchSymbols(query: string): Promise<string[]>;

  /**
   * Get display name for symbol (for UI)
   */
  getSymbolName(symbol: string): Promise<string>;
}

/**
 * Demo data source implementation
 * Uses local demo data from demoData.ts
 */
export class DemoDataSource implements DataSource {
  private demoSymbols = ['AAPL', 'MSFT', 'GE', 'BTC'];

  async loadBars(
    symbol: string,
    _options?: { days?: number; timeframe?: string }
  ): Promise<RawOHLCV[]> {
    try {
      // Dynamic import to avoid circular dependency
      const { getOfflineDemoBars } = await import('../demoData');
      const data = await getOfflineDemoBars();
      
      // For demo purposes, just return the data as-is
      // In a real app, you'd filter by symbol
      return data;
    } catch (error) {
      console.warn('Failed to load demo data:', error);
      return [];
    }
  }

  async getSymbols(): Promise<string[]> {
    return this.demoSymbols;
  }

  async searchSymbols(query: string): Promise<string[]> {
    const lowerQuery = query.toLowerCase();
    return this.demoSymbols.filter((s) =>
      s.toLowerCase().includes(lowerQuery)
    );
  }

  async getSymbolName(symbol: string): Promise<string> {
    const names: Record<string, string> = {
      AAPL: 'Apple Inc.',
      MSFT: 'Microsoft Corporation',
      GE: 'General Electric',
      BTC: 'Bitcoin',
    };
    return names[symbol] || symbol;
  }
}

/**
 * VNInvest API data source implementation
 */
export class VNInvestDataSource implements DataSource {
  constructor(private client: any) {} // VNInvestClient type

  async loadBars(
    symbol: string,
    options?: { days?: number; timeframe?: string }
  ): Promise<RawOHLCV[]> {
    try {
      const response = await this.client.getChart(symbol, options);
      
      // Convert ChartResponse to RawOHLCV[]
      return response.points.map((point: any) => ({
        date: new Date(point.date),
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume,
      }));
    } catch (error) {
      console.error(`Failed to load VNInvest data for ${symbol}:`, error);
      throw error;
    }
  }

  async getSymbols(): Promise<string[]> {
    try {
      const stocks = await this.client.getStocks();
      return stocks.map((s: any) => s.symbol);
    } catch (error) {
      console.error('Failed to fetch stock list:', error);
      return [];
    }
  }

  async searchSymbols(query: string): Promise<string[]> {
    try {
      const results = await this.client.searchStocks(query);
      return results.map((s: any) => s.symbol);
    } catch (error) {
      console.error('Failed to search symbols:', error);
      return [];
    }
  }

  async getSymbolName(symbol: string): Promise<string> {
    try {
      const stocks = await this.client.getStocks();
      const stock = stocks.find((s: any) => s.symbol === symbol);
      return stock?.company_name || symbol;
    } catch {
      return symbol;
    }
  }
}
