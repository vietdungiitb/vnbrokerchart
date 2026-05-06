import type { ComponentType } from "react";
import { format } from "d3-format";
import AreaSeries from "../../series/AreaSeries";
import BarSeries from "../../series/BarSeries";
import BollingerSeries from "../../series/BollingerSeries";
import CandlestickSeries from "../../series/CandlestickSeries";
import ElderRaySeries from "../../series/ElderRaySeries";
import LineSeries from "../../series/LineSeries";
import MACDSeries from "../../series/MACDSeries";
import OHLCSeries from "../../series/OHLCSeries";
import RSISeries from "../../series/RSISeries";
import type { EnrichedDatum } from "../calculators/types";
import type { SeriesSettingField } from "../types/indicator-catalog";
import type { SeriesConfig, SeriesTypeId, YAxisSide } from "../types/pane-descriptor";

export interface TooltipEntryDef {
	label: string;
	color?: string;
	format: (value: number) => string;
	accessor: (datum: EnrichedDatum) => number | undefined;
}

export interface RegistryEntry {
	component: ComponentType<any>;
	defaultParams: Record<string, unknown>;
	defaultYAxis: YAxisSide;
	yExtentsAccessors: Array<(datum: EnrichedDatum) => number | undefined>;
	tooltipEntry: (config: SeriesConfig) => TooltipEntryDef;
	settingsFields?: readonly SeriesSettingField[];
}

const registry = new Map<SeriesTypeId, RegistryEntry>();

function periodFromConfig(config: SeriesConfig, fallback: number) {
	const period = config.params?.period;
	return typeof period === "number" && Number.isFinite(period) ? period : fallback;
}

function colorFromConfig(config: SeriesConfig, fallback: string) {
	return typeof config.color === "string" && config.color.length > 0 ? config.color : fallback;
}

function registerLineSeries(type: SeriesTypeId, options: Omit<RegistryEntry, "component" | "defaultParams" | "defaultYAxis" | "yExtentsAccessors" | "tooltipEntry"> & {
	component: ComponentType<any>;
	defaultYAxis?: YAxisSide;
	defaultParams?: Record<string, unknown>;
	yExtentsAccessors: Array<(datum: EnrichedDatum) => number | undefined>;
	tooltipEntry: (config: SeriesConfig) => TooltipEntryDef;
	settingsFields?: readonly SeriesSettingField[];
}) {
	registerSeries(type, {
		component: options.component,
		defaultParams: options.defaultParams ?? {},
		defaultYAxis: options.defaultYAxis ?? "right",
		yExtentsAccessors: options.yExtentsAccessors,
		tooltipEntry: options.tooltipEntry,
		settingsFields: options.settingsFields,
	});
}

export function clearRegistry() {
	registry.clear();
}

export function registerSeries(type: SeriesTypeId, entry: RegistryEntry): void {
	registry.set(type, entry);
}

export function getSeries(type: SeriesTypeId): RegistryEntry {
	const entry = registry.get(type);
	if (!entry) {
		throw new Error(`SeriesRegistry: unknown type "${type}"`);
	}
	return entry;
}

export function listRegistered(): SeriesTypeId[] {
	return [...registry.keys()];
}

export function registerPhaseOneSeries() {
	clearRegistry();

	registerSeries("Candlestick", {
		component: CandlestickSeries,
		defaultParams: {},
		defaultYAxis: "right",
		yExtentsAccessors: [
			(d) => d.low,
			(d) => d.high,
		],
		tooltipEntry: () => ({
			label: "Price",
			format: format(".2f"),
			accessor: (d) => d.close,
		}),
	});

	registerSeries("HollowCandle", {
		component: CandlestickSeries,
		defaultParams: { hollow: true },
		defaultYAxis: "right",
		yExtentsAccessors: [
			(d) => d.low,
			(d) => d.high,
		],
		tooltipEntry: () => ({
			label: "Hollow",
			format: format(".2f"),
			accessor: (d) => d.close,
		}),
	});

	registerSeries("OHLC", {
		component: OHLCSeries,
		defaultParams: {},
		defaultYAxis: "right",
		yExtentsAccessors: [
			(d) => d.low,
			(d) => d.high,
		],
		tooltipEntry: () => ({
			label: "OHLC",
			format: format(".2f"),
			accessor: (d) => d.close,
		}),
	});

	registerSeries("HeikinAshi", {
		component: CandlestickSeries,
		defaultParams: { transformed: "heikinashi" },
		defaultYAxis: "right",
		yExtentsAccessors: [
			(d) => d.low,
			(d) => d.high,
		],
		tooltipEntry: () => ({
			label: "HA",
			format: format(".2f"),
			accessor: (d) => d.close,
		}),
	});

	registerLineSeries("Line", {
		component: LineSeries,
		yExtentsAccessors: [(d) => d.close],
		tooltipEntry: (config) => ({
			label: String(config.params?.label ?? "Line"),
			format: format(".2f"),
			accessor: (d) => d.close,
		}),
	});

	registerLineSeries("Area", {
		component: AreaSeries,
		yExtentsAccessors: [(d) => d.close],
		tooltipEntry: (config) => ({
			label: String(config.params?.label ?? "Area"),
			format: format(".2f"),
			accessor: (d) => d.close,
		}),
	});

	registerSeries("Bar", {
		component: BarSeries,
		defaultParams: {},
		defaultYAxis: "right",
		yExtentsAccessors: [(d) => d.close],
		tooltipEntry: (config) => ({
			label: String(config.params?.label ?? "Bar"),
			format: format(".2f"),
			accessor: (d) => d.close,
		}),
	});

	registerSeries("Volume", {
		component: BarSeries,
		defaultParams: {},
		defaultYAxis: "right",
		yExtentsAccessors: [(d) => d.volume],
		tooltipEntry: () => ({
			label: "Volume",
			format: format(".3s"),
			accessor: (d) => d.volume,
		}),
	});

	registerLineSeries("EMA", {
		component: LineSeries,
		defaultParams: { period: 20 },
		yExtentsAccessors: [(d) => d.ema20, (d) => d.ema50],
		settingsFields: [
			{ key: "period", labelKey: "settings.period", type: "number", defaultValue: 20, min: 1, step: 1 },
		],
		tooltipEntry: (config) => ({
			label: `EMA(${periodFromConfig(config, 20)})`,
			format: format(".2f"),
			accessor: (d) => d.ema20 ?? d.ema50 ?? d.close,
		}),
	});

	registerSeries("BollingerBand", {
		component: BollingerSeries,
		defaultParams: { period: 20, stdDev: 2 },
		defaultYAxis: "right",
		yExtentsAccessors: [
			(d) => d.bollingerBand?.top,
			(d) => d.bollingerBand?.middle,
			(d) => d.bollingerBand?.bottom,
		],
		settingsFields: [
			{ key: "period", labelKey: "settings.period", type: "number", defaultValue: 20, min: 5, step: 1 },
			{ key: "stdDev", labelKey: "settings.stdDev", type: "number", defaultValue: 2, min: 0.5, step: 0.5 },
		],
		tooltipEntry: (config) => ({
			label: `BB(${periodFromConfig(config, 20)},${config.params?.stdDev ?? 2})`,
			format: format(".2f"),
			accessor: (d) => d.bollingerBand?.middle ?? d.close,
		}),
	});

	registerSeries("RSI", {
		component: RSISeries,
		defaultParams: { period: 14 },
		defaultYAxis: "left",
		yExtentsAccessors: [(d) => d.rsi],
		settingsFields: [
			{ key: "period", labelKey: "settings.period", type: "number", defaultValue: 14, min: 2, step: 1 },
		],
		tooltipEntry: (config) => ({
			label: `RSI(${periodFromConfig(config, 14)})`,
			format: format(".1f"),
			accessor: (d) => d.rsi,
		}),
	});

	registerSeries("MACD", {
		component: MACDSeries,
		defaultParams: { fast: 12, slow: 26, signal: 9 },
		defaultYAxis: "right",
		yExtentsAccessors: [
			(d) => d.macd?.macd,
			(d) => d.macd?.signal,
			(d) => d.macd?.divergence,
		],
		settingsFields: [
			{ key: "fast", labelKey: "settings.fast", type: "number", defaultValue: 12, min: 1, step: 1 },
			{ key: "slow", labelKey: "settings.slow", type: "number", defaultValue: 26, min: 1, step: 1 },
			{ key: "signal", labelKey: "settings.signal", type: "number", defaultValue: 9, min: 1, step: 1 },
		],
		tooltipEntry: () => ({
			label: "MACD",
			format: format(".2f"),
			accessor: (d) => d.macd?.macd,
		}),
	});

	registerLineSeries("CVDApprox", {
		component: LineSeries,
		defaultYAxis: "right",
		defaultParams: {},
		yExtentsAccessors: [(d) => d.cvdApprox],
		tooltipEntry: () => ({
			label: "CVD",
			format: format(".0f"),
			accessor: (d) => d.cvdApprox,
		}),
	});

	registerLineSeries("CVDRealtime", {
		component: LineSeries,
		defaultYAxis: "right",
		defaultParams: {},
		yExtentsAccessors: [(d) => d.cvdRealtime],
		tooltipEntry: () => ({
			label: "CVD RT",
			format: format(".0f"),
			accessor: (d) => d.cvdRealtime,
		}),
	});

	registerSeries("StrengthElder", {
		component: ElderRaySeries,
		defaultParams: {},
		defaultYAxis: "right",
		yExtentsAccessors: [
			(d) => d.bullPower,
			(d) => d.bearPower,
		],
		tooltipEntry: () => ({
			label: "Strength",
			format: format(".2f"),
			accessor: (d) => d.bullPower,
		}),
	});

	registerLineSeries("StrengthRelative", {
		component: LineSeries,
		defaultYAxis: "right",
		defaultParams: {},
		yExtentsAccessors: [(d) => d.strengthRelative],
		tooltipEntry: () => ({
			label: "RS",
			format: format(".3f"),
			accessor: (d) => d.strengthRelative,
		}),
	});

	registerSeries("Whale", {
		component: BarSeries,
		defaultParams: { threshold: 50_000 },
		defaultYAxis: "right",
		yExtentsAccessors: [
			(d) => d.whaleBuyVol,
			(d) => d.whaleSellVol,
		],
		settingsFields: [
			{ key: "threshold", labelKey: "settings.thresholdUsd", type: "number", defaultValue: 50_000, min: 1000, step: 1000 },
		],
		tooltipEntry: () => ({
			label: "Whale",
			format: format(".3s"),
			accessor: (d) => d.whaleBuyVol ?? d.whaleSellVol,
		}),
	});
}
