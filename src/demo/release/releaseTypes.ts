export type ReleaseNoticeStatus = "idle" | "loading" | "up-to-date" | "update-available" | "offline" | "error";

export interface ReleaseNotice {
	localVersion: string;
	remoteVersion: string;
	releaseName: string;
	releaseUrl: string;
	publishedAt: string;
	bodyExcerpt: string;
	fetchedAt: number;
	etag?: string;
}

export interface ReleaseCacheRecord {
	notice: ReleaseNotice;
	etag?: string;
}