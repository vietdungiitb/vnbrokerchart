import { useEffect, useState } from "react";
import { scaleTime } from "d3-scale";
import ChartCanvas from "../lib/ChartCanvas";
import Chart from "../lib/Chart";
import CandlestickSeries from "../lib/series/CandlestickSeries";
import { formatBinanceKlines, getOfflineDemoData, type DemoDatum } from "./demoData";

const LiveDemo = () => {
    const [data, setData] = useState<DemoDatum[]>(() => getOfflineDemoData());
    const [sourceLabel, setSourceLabel] = useState("Local fallback data");

    useEffect(() => {
        let cancelled = false;

        // Try live BTCUSDT data first, but keep the local fallback available.
        fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=100")
            .then(res => res.json())
            .then(json => {
                if (cancelled) return;
                setData(formatBinanceKlines(json));
                setSourceLabel("Live Binance data");
            })
            .catch(err => {
                console.error("Failed to fetch data:", err);
                if (cancelled) return;
                setData(getOfflineDemoData());
                setSourceLabel("Local fallback data");
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (data.length === 0) return <div style={{ color: "red", padding: 20 }}>No data available.</div>;

    const width = window.innerWidth - 40;
    const height = window.innerHeight - 150;
    const margin = { left: 50, right: 50, top: 20, bottom: 30 };

    return (
        <div>
            <div style={{ color: "white", padding: "0 20px 12px" }}>{sourceLabel}</div>
            <ChartCanvas
                height={height}
                width={width}
                margin={margin}
                type="hybrid"
                seriesName="BTCUSDT"
                data={data}
                xScale={scaleTime()}
                xAccessor={(d: any) => d.date}
                xExtents={[data[0].date, data[data.length - 1].date]}
                ratio={window.devicePixelRatio || 1}
            >
                <Chart id={1} yExtents={(d: any) => [d.high, d.low]}>
                    <CandlestickSeries />
                </Chart>
            </ChartCanvas>
        </div>
    );
};

export default LiveDemo;
