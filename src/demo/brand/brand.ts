import brandManifestData from "../../../brand/brand.manifest.json";
import packageJson from "../../../package.json";
import appleTouchIconUrl from "../../../brand/assets/apple-touch-icon.png";
import favicon16Url from "../../../brand/assets/favicon-16.png";
import favicon32Url from "../../../brand/assets/favicon-32.png";
import logoMarkUrl from "../../../brand/assets/logo-mark.png";
import socialPreviewUrl from "../../../brand/assets/social-preview.png";
import logoSourceUrl from "../../../brand/source/logo-source.png";

export type BrandLocale = "vi" | "en";

export type BrandAssetKey = keyof BrandManifest["logo"];

export interface BrandLocalizedText {
	vi: string;
	en: string;
}

export interface BrandRepositoryConfig {
	owner: string;
	name: string;
	url: string;
	latestUrl: string;
	apiLatestUrl: string;
}

export interface BrandReleaseConfig {
	repository: BrandRepositoryConfig;
	cacheTtlMs: number;
	storageKeys: {
		cache: string;
		etag: string;
		dismissedVersion: string;
	};
}

export interface BrandManifest {
	name: string;
	shortName: string;
	displayName: BrandLocalizedText;
	tagline: BrandLocalizedText;
	description: BrandLocalizedText;
	homepageUrl: string;
	repositoryUrl: string;
	themeColor: string;
	backgroundColor: string;
	logo: {
		source: string;
		mark: string;
		favicon16: string;
		favicon32: string;
		appleTouchIcon: string;
		socialPreview: string;
	};
	release: BrandReleaseConfig;
	siteTitle: BrandLocalizedText;
}

const brandManifest: BrandManifest = brandManifestData;
const runtimeVersion = packageJson.version;
const brandAssetUrls: Record<BrandAssetKey, string> = {
	source: logoSourceUrl,
	mark: logoMarkUrl,
	favicon16: favicon16Url,
	favicon32: favicon32Url,
	appleTouchIcon: appleTouchIconUrl,
	socialPreview: socialPreviewUrl,
};

export const brandAssetKeys = ["source", "mark", "favicon16", "favicon32", "appleTouchIcon", "socialPreview"] as const;

export { brandManifest };

export function getBrandDisplayName(locale: BrandLocale): string {
	return brandManifest.displayName[locale];
}

export function getBrandTagline(locale: BrandLocale): string {
	return brandManifest.tagline[locale];
}

export function getBrandDescription(locale: BrandLocale): string {
	return brandManifest.description[locale];
}

export function getBrandSiteTitle(locale: BrandLocale): string {
	return brandManifest.siteTitle[locale];
}

export function getBrandRuntimeVersion(): string {
	return runtimeVersion;
}

export function getBrandRepositoryConfig(): BrandRepositoryConfig {
	return brandManifest.release.repository;
}

export function getBrandReleaseConfig(): BrandReleaseConfig {
	return brandManifest.release;
}

export function getBrandHomepageUrl(): string {
	return brandManifest.homepageUrl;
}

export function getBrandRepositoryUrl(): string {
	return brandManifest.repositoryUrl;
}

export function getBrandAssetPath(assetKey: BrandAssetKey): string {
	return brandManifest.logo[assetKey];
}

export function getBrandAssetUrl(assetKey: BrandAssetKey): string {
	return brandAssetUrls[assetKey];
}

export function getBrandLogoMarkupUrls(): Record<BrandAssetKey, string> {
	return {
		source: getBrandAssetUrl("source"),
		mark: getBrandAssetUrl("mark"),
		favicon16: getBrandAssetUrl("favicon16"),
		favicon32: getBrandAssetUrl("favicon32"),
		appleTouchIcon: getBrandAssetUrl("appleTouchIcon"),
		socialPreview: getBrandAssetUrl("socialPreview"),
	};
}

export function getBrandLatestReleaseUrl(): string {
	return brandManifest.release.repository.latestUrl;
}

export function getBrandLatestReleaseApiUrl(): string {
	return brandManifest.release.repository.apiLatestUrl;
}