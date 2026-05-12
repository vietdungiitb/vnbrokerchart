// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getBrandReleaseConfig } from "../../brand/brand";
import { fetchLatestGithubRelease } from "../githubReleaseClient";

describe("githubReleaseClient", () => {
	beforeEach(() => {
		window.localStorage.clear();
		vi.restoreAllMocks();
	});

	it("returns cached data while TTL is fresh", async () => {
		const cachedAt = Date.now();
		window.localStorage.setItem(
			getBrandReleaseConfig().storageKeys.cache,
			JSON.stringify({
				notice: {
					localVersion: "1.0.0",
					remoteVersion: "1.0.1",
					releaseName: "v1.0.1",
					releaseUrl: "https://example.com/release",
					publishedAt: new Date(cachedAt).toISOString(),
					bodyExcerpt: "cached",
					fetchedAt: cachedAt,
					etag: "etag-123",
				},
				tetag: "etag-123",
			}),
		);
		const fetchSpy = vi.spyOn(globalThis, "fetch");

		const notice = await fetchLatestGithubRelease();

		expect(notice?.remoteVersion).toBe("1.0.1");
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("uses ETag and refreshes cache on 304", async () => {
		const cachedAt = Date.now() - getBrandReleaseConfig().cacheTtlMs - 1000;
		window.localStorage.setItem(
			getBrandReleaseConfig().storageKeys.cache,
			JSON.stringify({
				notice: {
					localVersion: "1.0.0",
					remoteVersion: "1.0.1",
					releaseName: "v1.0.1",
					releaseUrl: "https://example.com/release",
					publishedAt: new Date(cachedAt).toISOString(),
					bodyExcerpt: "cached",
					fetchedAt: cachedAt,
					etag: "etag-123",
				},
				tetag: "etag-123",
			}),
		);
		window.localStorage.setItem(getBrandReleaseConfig().storageKeys.etag, "etag-123");
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(null, {
				status: 304,
				headers: { ETag: "etag-123" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const notice = await fetchLatestGithubRelease();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ cache: "no-store" });
		expect(notice?.etag).toBe("etag-123");
		expect(notice?.remoteVersion).toBe("1.0.1");
	});

	it("maps a GitHub release payload to a notice", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({
				tag_name: "v1.1.0",
				name: "Release 1.1.0",
				html_url: "https://github.com/vietdungiitb/vnbrokercharts/releases/tag/v1.1.0",
				published_at: "2026-05-12T00:00:00.000Z",
				body: "Hello\n\nMore details",
			}), {
				status: 200,
				headers: { ETag: "etag-456" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const notice = await fetchLatestGithubRelease();

		expect(notice?.remoteVersion).toBe("1.1.0");
		expect(notice?.releaseName).toBe("Release 1.1.0");
		expect(notice?.bodyExcerpt).toBe("Hello");
		expect(window.localStorage.getItem(getBrandReleaseConfig().storageKeys.cache)).not.toBeNull();
	});
});