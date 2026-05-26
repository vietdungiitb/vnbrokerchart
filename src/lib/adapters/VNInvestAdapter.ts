/**
 * VNInvestAdapter — StockDataAdapter implementation for vninvest core-api.
 *
 * Endpoint mapping (vninvest core-api:8100 via nginx /api proxy):
 *   fetchBars / fetchMoreBars (daily+):  GET /core/v1/market-data/daily-prices/{symbol}/
 *   fetchBars / fetchMoreBars (intraday): GET /api/realtime/intraday/{symbol}/  (stub — returns empty)
 *   searchSymbols:                        GET /core/v1/market-data/symbols/?search={q}
 *   subscribeToBar:                       WS  /ws/market/{symbol}/  (MarketTickerConsumer)
 *   subscribeToTrades / subscribeToOrderbook: no-op stub (not yet available in core-api)
 *
 * Authentication: PAT Bearer token passed via Authorization header on every request.
 */

import { BaseAdapter, type RawOHLCVBar } from "./BaseAdapter";
import type { OrderbookSnapshot, SymbolInfo, Timeframe, Trade, Unsubscribe } from "../types/adapter";
import type { OHLCVBar } from "../types/ohlcv";

/** Timeframes considered daily or coarser — routed to native daily-prices endpoint. */
const DAILY_TF = new Set(["D", "1D", "1d", "W", "M", "Y"]);

interface DailyPriceRecord {
	date: string;
	open: string | number;
	high: string | number;
	low: string | number;
	close: string | number;
	volume: string | number;
}

interface DailyPricesResponse {
	symbol: string;
	results: DailyPriceRecord[];
}

interface IntradayTrade {
	ts?: string;
	time?: string;
	price: string | number;
	volume: string | number;
	side?: string;
}

interface IntradayResponse {
	results?: IntradayTrade[];
	items?: IntradayTrade[];
}

interface SymbolRecord {
	symbol: string;
	company_name?: string;
	exchange?: string;
}

interface SymbolListResponse {
	results?: SymbolRecord[];
}

interface MarketTickerMessage {
	symbol?: string;
	price?: string | number;
	open?: string | number;
	high?: string | number;
	low?: string | number;
	close?: string | number;
	volume?: string | number;
	session_date?: string;
}

export class VNInvestAdapter extends BaseAdapter {
	private patToken: string;

	/**
	 * @param baseUrl  Origin of the vninvest frontend/nginx, e.g. "http://localhost"
	 *                 Leave blank to use the current page origin (works with dev proxy).
	 * @param patToken PAT token obtained from core-api identity_access.
	 * @param cacheTtlMs Request memoisation window (default 5 s).
	 */
	constructor(baseUrl = "", patToken = "", cacheTtlMs = 5_000) {
		super(baseUrl, cacheTtlMs);
		this.patToken = patToken.trim();
	}

	/** Update the PAT token at runtime (e.g. after user logs in). */
	setPAT(token: string): void {
		this.patToken = token.trim();
	}

	// ── private helpers ─────────────────────────────────────────────────────

	private get authHeaders(): Record<string, string> {
		return this.patToken ? { Authorization: `Bearer ${this.patToken}` } : {};
	}

	private async get<T>(path: string): Promise<T> {
		return this.requestJson<T>(path, { headers: this.authHeaders });
	}

	// ── StockDataAdapter — REST ──────────────────────────────────────────────

	async fetchBars(symbol: string, timeframe: Timeframe, from: Date, to: Date): Promise<readonly OHLCVBar[]> {
		const cacheKey = `vni:bars:${symbol}:${timeframe}:${from.toISOString()}:${to.toISOString()}`;
		return this.memoize(cacheKey, () => this._loadBars(symbol, timeframe, { from, to }));
	}

	async fetchMoreBars(symbol: string, timeframe: Timeframe, before: Date, limit = 300): Promise<readonly OHLCVBar[]> {
		// Compute a generous lookback window based on timeframe.
		const days = this._lookbackDays(timeframe, limit);
		const from = new Date(before.getTime() - days * 86_400_000);
		const cacheKey = `vni:more:${symbol}:${timeframe}:${before.toISOString()}:${limit}`;
		return this.memoize(cacheKey, () => this._loadBars(symbol, timeframe, { from, to: before }));
	}

	private _lookbackDays(timeframe: Timeframe, limit: number): number {
		const tf = timeframe.toUpperCase();
		if (tf === "1M" || tf === "3M") return Math.ceil(limit / (390 / 1)) + 2;
		if (tf === "5M") return Math.ceil(limit / 78) + 2;
		if (tf === "15M") return Math.ceil(limit / 26) + 2;
		if (tf === "30M") return Math.ceil(limit / 13) + 2;
		if (tf === "1H" || tf === "H") return Math.ceil(limit / 7) + 2;
		if (tf === "4H") return Math.ceil(limit / 2) + 2;
		// Daily / Weekly / Monthly — 1 bar ≈ 1 day
		return limit + 10;
	}

	private async _loadBars(
		symbol: string,
		timeframe: Timeframe,
		range: { from: Date; to: Date },
	): Promise<readonly OHLCVBar[]> {
		if (DAILY_TF.has(timeframe)) {
			return this._fetchDailyBars(symbol, range);
		}
		return this._fetchIntradayBars(symbol, range);
	}

	/** Native daily-prices endpoint: GET /core/v1/market-data/daily-prices/{symbol}/ */
	private async _fetchDailyBars(symbol: string, range: { from: Date; to: Date }): Promise<readonly OHLCVBar[]> {
		const params = new URLSearchParams({
			date_from: range.from.toISOString().slice(0, 10),
			date_to: range.to.toISOString().slice(0, 10),
		});
		const path = `/core/v1/market-data/daily-prices/${encodeURIComponent(symbol)}/?${params}`;
		const data = await this.get<DailyPricesResponse>(path);
		const records: DailyPriceRecord[] = data.results ?? [];
		// core-api returns newest-first; chart needs oldest-first.
		const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
		const raw: RawOHLCVBar[] = sorted.map((r) => ({
			date: r.date,
			open: Number(r.open),
			high: Number(r.high),
			low: Number(r.low),
			close: Number(r.close),
			volume: Number(r.volume),
		}));
		return this.normalizeBars(raw);
	}

	/**
	 * Intraday bars from realtime trade tape.
	 * GET /api/realtime/intraday/{symbol}/ returns a graceful 200 + empty list
	 * while the native intraday SaaS endpoint is being built.
	 * Aggregation into OHLCV bars is done client-side per minute.
	 */
	private async _fetchIntradayBars(symbol: string, _range: { from: Date; to: Date }): Promise<readonly OHLCVBar[]> {
		try {
			const data = await this.get<IntradayResponse>(
				`/api/realtime/intraday/${encodeURIComponent(symbol)}/`,
			);
			const trades: IntradayTrade[] = data.results ?? data.items ?? [];
			if (trades.length === 0) return [];
			return this._aggregateTrades(trades);
		} catch {
			// Graceful fallback — endpoint is a stub, return empty
			return [];
		}
	}

	/** Aggregate trade tape into 1-minute OHLCV bars. */
	private _aggregateTrades(trades: IntradayTrade[]): readonly OHLCVBar[] {
		const buckets = new Map<number, { o: number; h: number; l: number; c: number; v: number }>();
		for (const t of trades) {
			const ts = t.ts ?? t.time ?? "";
			if (!ts) continue;
			const d = new Date(ts);
			// Round down to minute bucket
			const bucket = Math.floor(d.getTime() / 60_000) * 60_000;
			const price = Number(t.price);
			const vol = Number(t.volume);
			const existing = buckets.get(bucket);
			if (!existing) {
				buckets.set(bucket, { o: price, h: price, l: price, c: price, v: vol });
			} else {
				existing.h = Math.max(existing.h, price);
				existing.l = Math.min(existing.l, price);
				existing.c = price;
				existing.v += vol;
			}
		}
		const raw: RawOHLCVBar[] = [...buckets.entries()]
			.sort(([a], [b]) => a - b)
			.map(([ts, bar]) => ({
				date: new Date(ts),
				open: bar.o,
				high: bar.h,
				low: bar.l,
				close: bar.c,
				volume: bar.v,
			}));
		return this.normalizeBars(raw);
	}

	/** GET /core/v1/market-data/symbols/?search={query} */
	async searchSymbols(query: string): Promise<readonly SymbolInfo[]> {
		const params = new URLSearchParams({ search: query });
		const data = await this.get<SymbolListResponse>(
			`/core/v1/market-data/symbols/?${params}`,
		);
		const records: SymbolRecord[] = data.results ?? [];
		return records.map((r) => ({
			symbol: r.symbol,
			name: r.company_name ?? r.symbol,
			exchange: r.exchange ?? "VN",
		}));
	}

	// ── StockDataAdapter — WebSocket ─────────────────────────────────────────

	/**
	 * Subscribe to real-time bar updates via MarketTickerConsumer.
	 * WS path: /ws/market/{symbol}/
	 * vninvest pushes snapshot messages; we synthesise a 1-bar update on each message.
	 */
	subscribeToBar(symbol: string, _timeframe: Timeframe, onBar: (bar: OHLCVBar) => void): Unsubscribe {
		const base = this.buildWebSocketUrl(`/ws/market/${encodeURIComponent(symbol)}/`);
		// MarketTickerConsumer requires token via query string — WS headers not supported.
		const wsUrl = this.patToken ? `${base}?token=${encodeURIComponent(this.patToken)}` : base;
		let socket: WebSocket | null = null;

		try {
			socket = new WebSocket(wsUrl);
		} catch {
			return () => undefined;
		}

		socket.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data as string) as MarketTickerMessage;
				const price = Number(msg.price ?? msg.close ?? 0);
				if (!price) return;
				const now = new Date();
				const bar: OHLCVBar = {
					date: now,
					index: Date.now(),
					dataIndex: Date.now(),
					open: Number(msg.open ?? price),
					high: Number(msg.high ?? price),
					low: Number(msg.low ?? price),
					close: price,
					volume: Number(msg.volume ?? 0),
				};
				onBar(bar);
			} catch {
				// ignore malformed messages
			}
		};

		const ref = socket;
		return () => {
			ref.close();
		};
	}

	/** Trade tape subscription — not yet available in vninvest core-api, no-op. */
	subscribeToTrades(_symbol: string, _onTrade: (trade: Trade) => void): Unsubscribe {
		return () => undefined;
	}

	/** Order book subscription — not yet available in vninvest core-api, no-op. */
	subscribeToOrderbook(_symbol: string, _onUpdate: (snapshot: OrderbookSnapshot) => void): Unsubscribe {
		return () => undefined;
	}
}

/** Factory shorthand — reads baseUrl from current origin when omitted. */
export function createVNInvestAdapter(patToken = "", baseUrl = ""): VNInvestAdapter {
	return new VNInvestAdapter(baseUrl, patToken);
}
