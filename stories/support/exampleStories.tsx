import { useState } from "react";

import { Label } from "../../src/lib/annotation";
import Chart from "../../src/lib/Chart";
import { XAxis, YAxis } from "../../src/lib/axes";
import { Brush } from "../../src/lib/interactive";
import {
	BarSeries,
	BollingerSeries,
	CandlestickSeries,
	LineSeries,
	MACDSeries,
	RSISeries,
	VolumeProfileSeries,
} from "../../src/lib/series";
import { MACDTooltip, MovingAverageTooltip, OHLCTooltip } from "../../src/lib/tooltip";
import { ChartSurface } from "./ChartSurface";
import {
	axisTheme,
	chartMargin,
	chartTheme,
	createOrigin,
	dateFormat,
	priceFormat,
	priceFormat3,
	storyButtonStyle,
	tooltipDisplayTexts,
	volumeAxisFormat,
	volumeFormat,
} from "./chartTheme";
import { buildDefaultExtents, createStoryData, type StoryDatum } from "./storyData";
import { StoryFrame } from "./StoryFrame";

const baseData = createStoryData(240);
const extendedData = createStoryData(360);

const pricePaneHeight = 320;
const volumePaneHeight = 110;
const macdPaneHeight = 140;
const rsiPaneHeight = 170;
const annotationPaneHeight = 360;
const hoverPaneHeight = 360;
const loadMorePriceHeight = 340;
const volumeProfileHeight = 420;

const macdAppearance = {
	stroke: {
		macd: chartTheme.macd,
		signal: chartTheme.macdSignal,
	},
	fill: {
		divergence: chartTheme.macdHistogram,
	},
};

const bollingerStroke = {
	top: "#f97316",
	middle: "#e2e8f0",
	bottom: "#f97316",
};

const rsiStroke = {
	line: chartTheme.rsi,
	top: "#ef4444",
	middle: "#94a3b8",
	bottom: "#10b981",
	outsideThreshold: "#f97316",
	insideThreshold: chartTheme.rsi,
};

const rsiOpacity = {
	top: 0.85,
	middle: 0.8,
	bottom: 0.85,
};

const rsiStrokeDasharray = {
	line: "Solid",
	top: "ShortDash",
	middle: "ShortDash",
	bottom: "ShortDash",
};

const rsiStrokeWidth = {
	outsideThreshold: 1,
	insideThreshold: 1,
	top: 1,
	middle: 1,
	bottom: 1,
};

function totalHeight(...paneHeights: number[]) {
	return chartMargin.top + paneHeights.reduce((sum, value) => sum + value, 0) + chartMargin.bottom;
}

function normalizeDateRange(start: Date, end: Date) {
	const orderedRange: [Date, Date] = start.getTime() <= end.getTime()
		? [start, end]
		: [end, start];

	return orderedRange;
}

function priceExtents(datum: StoryDatum) {
	return [datum.high, datum.low, datum.ema20, datum.ema50];
}

function bollingerExtents(datum: StoryDatum) {
	const band = datum.bollingerBand ?? {
		top: datum.high,
		middle: datum.close,
		bottom: datum.low,
	};

	return [datum.high, datum.low, band];
}

function macdExtents(datum: StoryDatum) {
	return datum.macd ?? {
		macd: 0,
		signal: 0,
		divergence: 0,
	};
}

function macdOptions() {
	return [
		{
			yAccessor: (datum: StoryDatum) => datum.ema20,
			type: "EMA",
			stroke: chartTheme.ema20,
			windowSize: 20,
		},
		{
			yAccessor: (datum: StoryDatum) => datum.ema50,
			type: "EMA",
			stroke: chartTheme.ema50,
			windowSize: 50,
		},
	];
}

function PriceXAxis() {
	return <XAxis axisAt="bottom" orient="bottom" {...axisTheme} ticks={6} tickFormat={dateFormat} />;
}

function PriceYAxis() {
	return <YAxis axisAt="right" orient="right" {...axisTheme} ticks={6} tickFormat={priceFormat} />;
}

function VolumeYAxis() {
	return <YAxis axisAt="left" orient="left" {...axisTheme} ticks={4} tickFormat={volumeAxisFormat} />;
}

function MacdYAxis() {
	return <YAxis axisAt="right" orient="right" {...axisTheme} ticks={5} tickFormat={priceFormat3} />;
}

function RsiYAxis() {
	return <YAxis axisAt="right" orient="right" {...axisTheme} ticks={5} tickFormat={priceFormat} />;
}

export function CandleStickStockScaleChartWithVolumeBarV3Story() {
	return (
		<StoryFrame
			title="Nến và khối lượng"
			subtitle="Bản chuyển đổi từ catalog volume bar sang một chart nến có volume, EMA 20/50 và tooltip OHLC theo dữ liệu sinh cục bộ."
		>
			<ChartSurface
				data={baseData}
				height={totalHeight(pricePaneHeight, volumePaneHeight)}
				seriesName="storybook-volume-bars"
			>
				<Chart id={1} height={pricePaneHeight} yExtents={priceExtents}>
					<PriceXAxis />
					<PriceYAxis />
					<CandlestickSeries />
					<LineSeries yAccessor={(datum: StoryDatum) => datum.ema20} stroke={chartTheme.ema20} />
					<LineSeries yAccessor={(datum: StoryDatum) => datum.ema50} stroke={chartTheme.ema50} />
					<OHLCTooltip origin={[-40, 0]} xDisplayFormat={dateFormat} volumeFormat={volumeFormat} displayTexts={tooltipDisplayTexts} />
					<MovingAverageTooltip origin={[-38, 15]} displayFormat={priceFormat} options={macdOptions()} />
				</Chart>

				<Chart id={2} height={volumePaneHeight} origin={createOrigin(volumePaneHeight)} yExtents={(datum: StoryDatum) => datum.volume}>
					<VolumeYAxis />
					<BarSeries yAccessor={(datum: StoryDatum) => datum.volume} fill={(datum: StoryDatum) => (datum.close > datum.open ? chartTheme.priceUp : chartTheme.priceDown)} />
				</Chart>
			</ChartSurface>
		</StoryFrame>
	);
}

export function CandleStickChartWithMACDIndicatorStory() {
	return (
		<StoryFrame
			title="Nến với MACD"
			subtitle="Biểu đồ này giữ nến, volume và một pane MACD riêng để kiểm tra histogram, đường tín hiệu và tooltip MACD."
		>
			<ChartSurface
				data={baseData}
				height={totalHeight(pricePaneHeight, volumePaneHeight, macdPaneHeight)}
				seriesName="storybook-macd"
			>
				<Chart id={1} height={pricePaneHeight} yExtents={priceExtents}>
					<PriceXAxis />
					<PriceYAxis />
					<CandlestickSeries />
					<LineSeries yAccessor={(datum: StoryDatum) => datum.ema20} stroke={chartTheme.ema20} />
					<LineSeries yAccessor={(datum: StoryDatum) => datum.ema50} stroke={chartTheme.ema50} />
					<OHLCTooltip origin={[-40, 0]} xDisplayFormat={dateFormat} volumeFormat={volumeFormat} displayTexts={tooltipDisplayTexts} />
					<MovingAverageTooltip origin={[-38, 15]} displayFormat={priceFormat} options={macdOptions()} />
				</Chart>

				<Chart id={2} height={volumePaneHeight} origin={createOrigin(volumePaneHeight + macdPaneHeight)} yExtents={(datum: StoryDatum) => datum.volume}>
					<VolumeYAxis />
					<BarSeries yAccessor={(datum: StoryDatum) => datum.volume} fill={(datum: StoryDatum) => (datum.close > datum.open ? chartTheme.priceUp : chartTheme.priceDown)} />
				</Chart>

				<Chart id={3} height={macdPaneHeight} origin={createOrigin(macdPaneHeight)} yExtents={macdExtents}>
					<PriceXAxis />
					<MacdYAxis />
					<MACDSeries yAccessor={(datum: StoryDatum) => datum.macd} stroke={macdAppearance.stroke} fill={macdAppearance.fill} />
					<MACDTooltip origin={[0, 0]} yAccessor={(datum: StoryDatum) => datum.macd} options={{ fast: 12, slow: 26, signal: 9 }} appearance={macdAppearance} />
				</Chart>
			</ChartSurface>
		</StoryFrame>
	);
}

export function CandleStickChartWithBrushStory() {
	const [xExtents, setXExtents] = useState<[Date, Date]>(() => buildDefaultExtents(baseData, 120));
	const [brushEnabled, setBrushEnabled] = useState(true);

	return (
		<StoryFrame
			title="Nến với brush"
			subtitle="Story này kiểm tra brush kéo vùng ở pane volume để thu hẹp khung nhìn giá theo span đã chọn."
			actions={(
				<>
					<button type="button" style={storyButtonStyle} onClick={() => setBrushEnabled((value) => !value)}>
						{brushEnabled ? "Tắt brush" : "Bật brush"}
					</button>
					<button type="button" style={storyButtonStyle} onClick={() => setXExtents(buildDefaultExtents(baseData, 120))}>
						Đặt lại phạm vi
					</button>
				</>
			)}
		>
			<ChartSurface
				data={baseData}
				height={totalHeight(pricePaneHeight, volumePaneHeight)}
				seriesName="storybook-brush"
				xExtents={xExtents}
			>
				<Chart id={1} height={pricePaneHeight} yExtents={priceExtents}>
					<PriceXAxis />
					<PriceYAxis />
					<CandlestickSeries />
					<LineSeries yAccessor={(datum: StoryDatum) => datum.ema20} stroke={chartTheme.ema20} />
					<LineSeries yAccessor={(datum: StoryDatum) => datum.ema50} stroke={chartTheme.ema50} />
					<OHLCTooltip origin={[-40, 0]} xDisplayFormat={dateFormat} volumeFormat={volumeFormat} displayTexts={tooltipDisplayTexts} />
				</Chart>

				<Chart id={2} height={volumePaneHeight} origin={createOrigin(volumePaneHeight)} yExtents={(datum: StoryDatum) => datum.volume}>
					<VolumeYAxis />
					<BarSeries yAccessor={(datum: StoryDatum) => datum.volume} fill={(datum: StoryDatum) => (datum.close > datum.open ? chartTheme.priceUp : chartTheme.priceDown)} />
					<Brush
						enabled={brushEnabled}
						type="2D"
						stroke={chartTheme.accent}
						fill={chartTheme.accent}
						fillOpacity={0.18}
						strokeOpacity={0.95}
						onStart={() => {}}
						onBrush={({ start, end }: any) => {
							const startDate = new Date(start.xValue);
							const endDate = new Date(end.xValue);
							setXExtents(normalizeDateRange(startDate, endDate));
						}}
					/>
				</Chart>
			</ChartSurface>
		</StoryFrame>
	);
}

export function CandleStickChartWithAnnotationStory() {
	const annotatedDatum = baseData[baseData.length - 18];

	return (
		<StoryFrame
			title="Nến với annotation"
			subtitle="Label annotation giúp kiểm tra vị trí văn bản và lớp ghi chú trên chart mà không cần tương tác ngoài canvas."
		>
			<ChartSurface data={baseData} height={totalHeight(annotationPaneHeight)} seriesName="storybook-annotation">
				<Chart id={1} height={annotationPaneHeight} yExtents={priceExtents}>
					<PriceXAxis />
					<PriceYAxis />
					<CandlestickSeries />
					<LineSeries yAccessor={(datum: StoryDatum) => datum.ema20} stroke={chartTheme.ema20} />
					<LineSeries yAccessor={(datum: StoryDatum) => datum.ema50} stroke={chartTheme.ema50} />
					<OHLCTooltip origin={[-40, 0]} xDisplayFormat={dateFormat} volumeFormat={volumeFormat} displayTexts={tooltipDisplayTexts} />
					<MovingAverageTooltip origin={[-38, 15]} displayFormat={priceFormat} options={macdOptions()} />
					<Label
						datum={annotatedDatum}
						x={({ xScale, xAccessor, datum }: any) => xScale(xAccessor(datum))}
						y={({ yScale, datum }: any) => yScale(datum.high) - 18}
						text="Tín hiệu bứt phá"
						fill={chartTheme.annotation}
						fontSize={14}
						opacity={0.95}
						rotate={0}
						textAnchor="middle"
					/>
				</Chart>
			</ChartSurface>
		</StoryFrame>
	);
}

export function CandleStickChartWithHoverTooltipStory() {
	return (
		<StoryFrame
			title="Nến với hover tooltip"
			subtitle="Story này tập trung vào lớp tooltip hover: OHLC, volume và EMA chạy trên cùng một panel để kiểm tra cảm giác đọc dữ liệu khi rê chuột."
		>
			<ChartSurface data={baseData} height={totalHeight(hoverPaneHeight)} seriesName="storybook-hover-tooltip">
				<Chart id={1} height={hoverPaneHeight} yExtents={priceExtents}>
					<PriceXAxis />
					<PriceYAxis />
					<CandlestickSeries />
					<LineSeries yAccessor={(datum: StoryDatum) => datum.ema20} stroke={chartTheme.ema20} />
					<LineSeries yAccessor={(datum: StoryDatum) => datum.ema50} stroke={chartTheme.ema50} />
					<OHLCTooltip origin={[-40, 0]} xDisplayFormat={dateFormat} volumeFormat={volumeFormat} displayTexts={tooltipDisplayTexts} />
					<MovingAverageTooltip origin={[-38, 15]} displayFormat={priceFormat} options={macdOptions()} />
				</Chart>
			</ChartSurface>
		</StoryFrame>
	);
}

export function CandleStickChartPanToLoadMoreStory() {
	const [visibleCount, setVisibleCount] = useState(120);
	const visibleData = extendedData.slice(extendedData.length - visibleCount);

	return (
		<StoryFrame
			title="Nến với tải thêm lịch sử"
			subtitle="Bản chuyển đổi này mô phỏng hành vi pan-to-load-more bằng nút nạp thêm nến cũ hơn và mở rộng span hiển thị trong cùng một view."
			actions={(
				<>
					<span style={{ color: chartTheme.mutedText, fontSize: 12, fontWeight: 700 }}>
						Đang hiển thị {visibleCount}/{extendedData.length} nến
					</span>
					<button
						type="button"
						style={storyButtonStyle}
						onClick={() => setVisibleCount((value) => Math.min(extendedData.length, value + 60))}
						disabled={visibleCount >= extendedData.length}
					>
						Tải thêm 60 nến cũ hơn
					</button>
					<button type="button" style={storyButtonStyle} onClick={() => setVisibleCount(120)}>
						Đặt lại
					</button>
				</>
			)}
		>
			<ChartSurface
				data={visibleData}
				height={totalHeight(loadMorePriceHeight, volumePaneHeight)}
				seriesName="storybook-load-more"
				xExtents={buildDefaultExtents(visibleData, visibleData.length)}
			>
				<Chart id={1} height={loadMorePriceHeight} yExtents={priceExtents}>
					<PriceXAxis />
					<PriceYAxis />
					<CandlestickSeries />
					<LineSeries yAccessor={(datum: StoryDatum) => datum.ema20} stroke={chartTheme.ema20} />
					<LineSeries yAccessor={(datum: StoryDatum) => datum.ema50} stroke={chartTheme.ema50} />
					<OHLCTooltip origin={[-40, 0]} xDisplayFormat={dateFormat} volumeFormat={volumeFormat} displayTexts={tooltipDisplayTexts} />
				</Chart>

				<Chart id={2} height={volumePaneHeight} origin={createOrigin(volumePaneHeight)} yExtents={(datum: StoryDatum) => datum.volume}>
					<VolumeYAxis />
					<BarSeries yAccessor={(datum: StoryDatum) => datum.volume} fill={(datum: StoryDatum) => (datum.close > datum.open ? chartTheme.priceUp : chartTheme.priceDown)} />
				</Chart>
			</ChartSurface>
		</StoryFrame>
	);
}

export function CandleStickChartWithRSIIndicatorStory() {
	return (
		<StoryFrame
			title="Nến với RSI và Bollinger"
			subtitle="Bản dựng này giữ overlay Bollinger trên pane giá và pane RSI riêng để kiểm tra lớp chỉ báo động lượng cùng dải biến động."
		>
			<ChartSurface
				data={baseData}
				height={totalHeight(pricePaneHeight, rsiPaneHeight)}
				seriesName="storybook-rsi"
			>
				<Chart id={1} height={pricePaneHeight} yExtents={bollingerExtents}>
					<PriceXAxis />
					<PriceYAxis />
					<CandlestickSeries />
					<BollingerSeries yAccessor={(datum: StoryDatum) => datum.bollingerBand} stroke={bollingerStroke} fill="rgba(56, 189, 248, 0.16)" />
					<OHLCTooltip origin={[-40, 0]} xDisplayFormat={dateFormat} volumeFormat={volumeFormat} displayTexts={tooltipDisplayTexts} />
				</Chart>

				<Chart id={2} height={rsiPaneHeight} origin={createOrigin(rsiPaneHeight)} yExtents={[0, 100]}>
					<PriceXAxis />
					<RsiYAxis />
					<RSISeries
						yAccessor={(datum: StoryDatum) => datum.rsi}
						stroke={rsiStroke}
						opacity={rsiOpacity}
						strokeDasharray={rsiStrokeDasharray}
						strokeWidth={rsiStrokeWidth}
						overSold={70}
						middle={50}
						overBought={30}
					/>
				</Chart>
			</ChartSurface>
		</StoryFrame>
	);
}

export function VolumeProfileChartStory() {
	return (
		<StoryFrame
			title="Volume profile"
			subtitle="Volume profile được đặt trên chart giá để kiểm tra cách các cột hồ sơ khớp với dữ liệu nến và hệ trục giá hiện có."
		>
			<ChartSurface data={baseData} height={totalHeight(volumeProfileHeight)} seriesName="storybook-volume-profile">
				<Chart id={1} height={volumeProfileHeight} yExtents={priceExtents}>
					<PriceXAxis />
					<PriceYAxis />
					<CandlestickSeries />
					<LineSeries yAccessor={(datum: StoryDatum) => datum.ema20} stroke={chartTheme.ema20} />
					<LineSeries yAccessor={(datum: StoryDatum) => datum.ema50} stroke={chartTheme.ema50} />
					<VolumeProfileSeries
						orient="right"
						bins={18}
						maxProfileWidthPercent={32}
						opacity={0.55}
						fill={({ type }: { type: string }) => (type === "up" ? chartTheme.volumeProfileUp : chartTheme.volumeProfileDown)}
						stroke="none"
					/>
					<OHLCTooltip origin={[-40, 0]} xDisplayFormat={dateFormat} volumeFormat={volumeFormat} displayTexts={tooltipDisplayTexts} />
				</Chart>
			</ChartSurface>
		</StoryFrame>
	);
}
