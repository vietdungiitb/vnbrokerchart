import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
	brandAssetKeys,
	brandManifest,
	getBrandAssetPath,
	getBrandAssetUrl,
	getBrandDisplayName,
	getBrandLatestReleaseApiUrl,
	getBrandLatestReleaseUrl,
	getBrandReleaseConfig,
	getBrandRuntimeVersion,
	getBrandSiteTitle,
	getBrandTagline,
} from "./brand";

describe("brand manifest", () => {
	it("exposes a stable shared identity contract", () => {
		expect(brandManifest.name).toBe("VNBrockerChart");
		expect(brandManifest.shortName).toBe("VNBrockerChart");
		expect(getBrandDisplayName("vi")).toBe("VNBrockerChart");
		expect(getBrandDisplayName("en")).toBe("VNBrockerChart");
		expect(getBrandTagline("vi")).toContain("GitHub Release");
		expect(getBrandSiteTitle("en")).toBe("VNBrockerChart | Vietnam Stock Charts");
		expect(getBrandRuntimeVersion()).toBe("1.0.0");
		expect(getBrandLatestReleaseUrl()).toBe("https://github.com/vietdungiitb/vnbrockercharts/releases/latest");
		expect(getBrandLatestReleaseApiUrl()).toBe("https://api.github.com/repos/vietdungiitb/vnbrockercharts/releases/latest");
		expect(getBrandReleaseConfig().cacheTtlMs).toBe(6 * 60 * 60 * 1000);
	});

	it("references real logo and release assets", () => {
		for (const assetKey of brandAssetKeys) {
			const assetPath = getBrandAssetPath(assetKey);
			expect(assetPath.startsWith("brand/")).toBe(true);
			expect(existsSync(path.resolve(process.cwd(), assetPath))).toBe(true);
		}

		expect(getBrandAssetUrl("mark")).toContain("brand/assets/logo-mark.png");
		expect(brandManifest.release.storageKeys.cache).toBe("vnbrockercharts-release-cache-v1");
		expect(brandManifest.release.storageKeys.etag).toBe("vnbrockercharts-release-etag-v1");
		expect(brandManifest.release.storageKeys.dismissedVersion).toBe("vnbrockercharts-release-dismissed-version-v1");
	});
});