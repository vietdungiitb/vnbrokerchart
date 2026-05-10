/**
 * Unit tests for VNInvestClient and DataSource adapters
 * Test cases T-INT-01 through T-INT-07 from AUDIT_PROTOCOL.md
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  VNInvestClient,
  RawOHLCVToStandardAdapter,
  createVNInvestClient,
  getVNInvestClient,
  clearVNInvestClient,
} from '../VNInvestClient';
import { DemoDataSource, VNInvestDataSource } from '../index';
import type { ChartResponse, ChartPoint } from '../../vninvest/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('VNInvestClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearVNInvestClient();
  });

  afterEach(() => {
    clearVNInvestClient();
  });

  // T-INT-01: VNInvestClient instantiation
  it('should create client with valid PAT token', () => {
    const client = new VNInvestClient('vni_validtoken123');
    expect(client).toBeDefined();
  });

  it('should throw error with empty PAT token on setPAT', () => {
    const client = new VNInvestClient();
    expect(() => client.setPAT('')).toThrow('PAT token is required');
    expect(() => client.setPAT('   ')).toThrow('PAT token is required');
  });

  // T-INT-02: Chart endpoint mock
  it('should call chart endpoint with correct parameters', async () => {
    const mockResponse: ChartResponse = {
      symbol: 'VCB',
      days: 5,
      timeframe: '1D',
      start_date: '2026-05-05',
      end_date: '2026-05-10',
      points: [
        {
          date: '2026-05-05',
          open: 60.5,
          high: 61.0,
          low: 60.0,
          close: 60.8,
          volume: 1000000,
        },
        {
          date: '2026-05-06',
          open: 60.8,
          high: 61.5,
          low: 60.5,
          close: 61.2,
          volume: 1100000,
        },
      ],
      technical: {
        bias: 'NEUTRAL',
        bias_label: 'Trung tính',
        bias_description: 'Neutral bias description',
        rsi14: 60.5,
        sma20: 60.4,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const client = new VNInvestClient('vni_testtoken');
    const result = await client.getChart('VCB', { days: 5, timeframe: '1D' });

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/stock-management/stocks/VCB/chart/'),
      expect.any(Object)
    );
  });

  // T-INT-03: Error handling
  it('should handle 401 Unauthorized error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Invalid or revoked PAT.' }),
    });

    const client = new VNInvestClient('vni_invalidtoken');
    await expect(client.getChart('VCB')).rejects.toThrow('API Error (401)');
  });

  it('should handle 404 Not Found error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Symbol not found' }),
    });

    const client = new VNInvestClient('vni_testtoken');
    await expect(client.getChart('INVALID')).rejects.toThrow('API Error (404)');
  });

  // T-INT-04: Stock list endpoint
  it('should fetch stock list', async () => {
    const mockStocks = [
      { symbol: 'VCB', company_name: 'Vietcombank', exchange: 'HOSE' },
      { symbol: 'HPG', company_name: 'Hoa Phat', exchange: 'HOSE' },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockStocks }),
    });

    const client = new VNInvestClient('vni_testtoken');
    const stocks = await client.getStocks();

    expect(stocks).toEqual(mockStocks);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/stock-management/stocks/'),
      expect.any(Object)
    );
  });

  // T-INT-05: Stock search (client-side)
  it('should search stocks by symbol', async () => {
    const mockStocks = [
      { symbol: 'VCB', company_name: 'Vietcombank' },
      { symbol: 'VCBS', company_name: 'Vietcombank Securities' },
      { symbol: 'HPG', company_name: 'Hoa Phat' },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockStocks }),
    });

    const client = new VNInvestClient('vni_testtoken');
    const results = await client.searchStocks('VCB');

    expect(results).toContainEqual(
      expect.objectContaining({ symbol: 'VCB' })
    );
    expect(results).toContainEqual(
      expect.objectContaining({ symbol: 'VCBS' })
    );
    expect(results).not.toContainEqual(
      expect.objectContaining({ symbol: 'HPG' })
    );
  });

  // T-INT-06: Realtime ticker
  it('should fetch ticker data', async () => {
    const mockTicker = {
      symbol: 'VCB',
      current_price: 61.2,
      change_pct: 0.8,
      volume: 2100000,
      last_date: '2026-05-10',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTicker,
    });

    const client = new VNInvestClient('vni_testtoken');
    const ticker = await client.getTicker('VCB');

    expect(ticker).toEqual(mockTicker);
  });

  // T-INT-07: Intraday trades
  it('should fetch intraday trades', async () => {
    const mockIntraday = {
      symbol: 'VCB',
      trades: [
        { time: '09:00', price: 61.0, volume: 10000, side: 'BUY' },
        { time: '09:30', price: 61.1, volume: 15000, side: 'SELL' },
      ],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockIntraday,
    });

    const client = new VNInvestClient('vni_testtoken');
    const intraday = await client.getIntraday('VCB');

    expect(intraday.trades).toHaveLength(2);
    expect(intraday.trades[0].side).toBe('BUY');
  });
});

describe('RawOHLCVToStandardAdapter', () => {
  const mockPoint: ChartPoint = {
    date: '2026-05-10',
    open: 60.5,
    high: 61.5,
    low: 60.0,
    close: 61.2,
    volume: 1500000,
  };

  // T-INT-08: Adapter single point conversion
  it('should convert ChartPoint to RawOHLCVBar', () => {
    const bar = RawOHLCVToStandardAdapter.toBar(mockPoint);

    expect(bar.date).toBeInstanceOf(Date);
    expect(bar.open).toBe(60.5);
    expect(bar.high).toBe(61.5);
    expect(bar.low).toBe(60.0);
    expect(bar.close).toBe(61.2);
    expect(bar.volume).toBe(1500000);
  });

  // T-INT-09: Adapter with technical indicators
  it('should include technical indicators when provided', () => {
    const technical = {
      bias: 'BULLISH' as const,
      bias_label: 'Tăng',
      bias_description: 'Uptrend',
      rsi14: 65.5,
    };

    const bar = RawOHLCVToStandardAdapter.toBar(mockPoint, technical);

    expect(bar.technical).toEqual(technical);
  });

  // T-INT-10: Adapter response conversion
  it('should convert ChartResponse to RawOHLCVBar array', () => {
    const response: ChartResponse = {
      symbol: 'VCB',
      days: 2,
      timeframe: '1D',
      start_date: '2026-05-09',
      end_date: '2026-05-10',
      points: [mockPoint, { ...mockPoint, date: '2026-05-09', close: 60.5 }],
      technical: {
        bias: 'NEUTRAL' as const,
        bias_label: 'Trung tính',
        bias_description: 'Neutral',
      },
    };

    const bars = RawOHLCVToStandardAdapter.fromChartResponse(response);

    expect(bars).toHaveLength(2);
    expect(bars[0].date).toBeInstanceOf(Date);
    expect(bars[0].technical?.rsi14).toBeUndefined(); // technical from response level
  });
});

describe('DataSource Factory', () => {
  it('should create and retrieve client instance', () => {
    const client1 = createVNInvestClient('vni_token1');
    const client2 = getVNInvestClient();

    expect(client1).toBe(client2);
  });

  it('should clear client instance', () => {
    createVNInvestClient('vni_token1');
    clearVNInvestClient();
    const client = getVNInvestClient();

    expect(client).toBeNull();
  });
});

describe('DemoDataSource', () => {
  it('should return available demo symbols', async () => {
    const source = new DemoDataSource();
    const symbols = await source.getSymbols();

    expect(symbols).toContain('AAPL');
    expect(symbols).toContain('MSFT');
  });

  it('should search demo symbols', async () => {
    const source = new DemoDataSource();
    const results = await source.searchSymbols('MSFT');

    expect(results).toContain('MSFT');
    expect(results).not.toContain('AAPL');
  });

  it('should return symbol names', async () => {
    const source = new DemoDataSource();
    const name = await source.getSymbolName('AAPL');

    expect(name).toBe('Apple Inc.');
  });
});

describe('VNInvestDataSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load bars from VNInvest client', async () => {
    const mockChartResponse: ChartResponse = {
      symbol: 'VCB',
      days: 5,
      timeframe: '1D',
      start_date: '2026-05-05',
      end_date: '2026-05-10',
      points: [
        {
          date: '2026-05-05',
          open: 60.5,
          high: 61.0,
          low: 60.0,
          close: 60.8,
          volume: 1000000,
        },
      ],
      technical: {
        bias: 'NEUTRAL',
        bias_label: 'Neutral',
        bias_description: 'Neutral bias',
      },
    };

    const mockClient = {
      getChart: vi.fn().mockResolvedValue(mockChartResponse),
    };

    const source = new VNInvestDataSource(mockClient);
    const bars = await source.loadBars('VCB', { days: 5, timeframe: '1D' });

    expect(bars).toHaveLength(1);
    expect(bars[0].close).toBe(60.8);
  });

  it('should fetch symbols from client', async () => {
    const mockStocks = [
      { symbol: 'VCB', company_name: 'Vietcombank' },
    ];

    const mockClient = {
      getStocks: vi.fn().mockResolvedValue(mockStocks),
    };

    const source = new VNInvestDataSource(mockClient);
    const symbols = await source.getSymbols();

    expect(symbols).toEqual(['VCB']);
  });
});
