import { getBrandReleaseConfig, getBrandRuntimeVersion } from "../brand/brand";

import type { ReleaseCacheRecord, ReleaseNotice } from "./releaseTypes";
import { compareReleaseVersions, isStableReleaseVersion, normalizeReleaseTag } from "./releaseVersion";

interface GitHubReleasePayload {
	tag_name?: string;
	name?: string | null;
	html_url?: string;
	published_at?: string | null;
	body?: string | null;
	draft?: boolean;
	prerelease?: boolean;
}

function getStorage(): Storage | null {
	if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
		return null;
	}
	return window.localStorage;
}

function readCacheRecord(): ReleaseCacheRecord | null {
	const storage = getStorage();
	if (!storage) {
		return null;
	}
	const raw = storage.getItem(getBrandReleaseConfig().storageKeys.cache);
	if (!raw) {
		return null;
	}
	try {
		const parsed = JSON.parse(raw) as ReleaseCacheRecord;
		if (!parsed?.notice?.remoteVersion || !parsed.notice.fetchedAt) {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

function writeCacheRecord(record: ReleaseCacheRecord) {
	const storage = getStorage();
	if (!storage) {
		return;
	}
	storage.setItem(getBrandReleaseConfig().storageKeys.cache, JSON.stringify(record));
	if (record.etag) {
		storage.setItem(getBrandReleaseConfig().storageKeys.etag, record.etag);
	}
}

function readCachedEtag(): string | null {
	const storage = getStorage();
	if (!storage) {
		return null;
	}
	return storage.getItem(getBrandReleaseConfig().storageKeys.etag);
}

function mapGitHubPayloadToNotice(payload: GitHubReleasePayload, fetchedAt: number, etag?: string): ReleaseNotice | null {
	if (payload.draft) {
		return null;
	}
	const remoteVersion = normalizeReleaseTag(payload.tag_name ?? payload.name ?? "");
	const body = typeof payload.body === "string" ? payload.body : "";
	const bodyExcerpt = body
		.replace(/\r\n/g, "\n")
		.split("\n\n")[0]
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 240);

	return {
		localVersion: getBrandRuntimeVersion(),
		remoteVersion,
		releaseName: payload.name?.trim() || remoteVersion || "GitHub Release",
		releaseUrl: payload.html_url ?? getBrandReleaseConfig().repository.latestUrl,
		publishedAt: payload.published_at ?? new Date(fetchedAt).toISOString(),
		bodyExcerpt,
		fetchedAt,
		etag,
	};
}

function isFresh(record: ReleaseCacheRecord): boolean {
	return Date.now() - record.notice.fetchedAt < getBrandReleaseConfig().cacheTtlMs;
}

export async function fetchLatestGithubRelease(signal?: AbortSignal): Promise<ReleaseNotice | null> {
	const cacheRecord = readCacheRecord();
	if (cacheRecord && isFresh(cacheRecord)) {
		return cacheRecord.notice;
	}

	const headers = new Headers({ Accept: "application/vnd.github+json" });
	const cachedEtag = readCachedEtag() ?? cacheRecord?.etag;
	if (cachedEtag) {
		headers.set("If-None-Match", cachedEtag);
	}

	const response = await fetch(getBrandReleaseConfig().repository.apiLatestUrl, {
		headers,
		signal,
		cache: "no-store",
	});

	if (response.status === 304) {
		if (!cacheRecord) {
			return null;
		}
		const refreshedNotice: ReleaseNotice = {
			...cacheRecord.notice,
			fetchedAt: Date.now(),
			etag: cachedEtag ?? cacheRecord.notice.etag,
		};
		writeCacheRecord({ notice: refreshedNotice, etag: refreshedNotice.etag });
		return refreshedNotice;
	}

	if (!response.ok) {
		throw new Error(`GitHub release request failed with status ${response.status}`);
	}

	const payload = (await response.json()) as GitHubReleasePayload;
	const etag = response.headers.get("ETag") ?? undefined;
	const fetchedAt = Date.now();
	const notice = mapGitHubPayloadToNotice(payload, fetchedAt, etag);
	if (!notice) {
		return null;
	}

	writeCacheRecord({ notice, etag });
	return notice;
}

export function getCachedReleaseNotice(): ReleaseNotice | null {
	return readCacheRecord()?.notice ?? null;
}

export function getCachedReleaseEtag(): string | null {
	return readCachedEtag();
}

export function hasNewerStableRelease(localVersion: string, remoteVersion: string): boolean {
	if (!isStableReleaseVersion(remoteVersion)) {
		return false;
	}
	return compareReleaseVersions(localVersion, remoteVersion) < 0;
}