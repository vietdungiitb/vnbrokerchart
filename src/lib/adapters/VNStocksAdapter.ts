import type { DataAdapter, GetBarsParams, GetBarsResult } from "./DataAdapter";

/**
 * CE20-05: Placeholder adapter for VN stock market data.
 * Will be implemented when the VNStock backend endpoint is available.
 */
export class VNStocksAdapter implements DataAdapter {
	readonly name = "vnstocks";

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getBars(_params: GetBarsParams): Promise<GetBarsResult> {
		return Promise.reject(new Error("VNStocksAdapter chưa được triển khai."));
	}
}
