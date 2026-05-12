import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getBrandReleaseConfig, getBrandRuntimeVersion } from "../brand/brand";

import type { ReleaseNotice, ReleaseNoticeStatus } from "./releaseTypes";
import { compareReleaseVersions, normalizeReleaseTag } from "./releaseVersion";
import { fetchLatestGithubRelease, getCachedReleaseNotice } from "./githubReleaseClient";

function readDismissedReleaseVersion(): string | null {
	if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
		return null;
	}
	return window.localStorage.getItem(getBrandReleaseConfig().storageKeys.dismissedVersion);
}

function writeDismissedReleaseVersion(version: string) {
	if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
		return;
	}
	window.localStorage.setItem(getBrandReleaseConfig().storageKeys.dismissedVersion, normalizeReleaseTag(version));
}

function deriveStatus(notice: ReleaseNotice | null, dismissedVersion: string | null): ReleaseNoticeStatus {
	if (!notice) {
		return "idle";
	}
	if (dismissedVersion && normalizeReleaseTag(dismissedVersion) === normalizeReleaseTag(notice.remoteVersion)) {
		return "up-to-date";
	}
	return compareReleaseVersions(notice.localVersion, notice.remoteVersion) < 0 ? "update-available" : "up-to-date";
}

export function useReleaseNotice() {
	const currentVersion = getBrandRuntimeVersion();
	const cachedNotice = useMemo(() => getCachedReleaseNotice(), []);
	const dismissedVersion = useMemo(() => readDismissedReleaseVersion(), []);
	const [latestRelease, setLatestRelease] = useState<ReleaseNotice | null>(cachedNotice);
	const [status, setStatus] = useState<ReleaseNoticeStatus>(() => deriveStatus(cachedNotice, dismissedVersion));
	const inFlightRef = useRef<Promise<void> | null>(null);
	const latestReleaseRef = useRef<ReleaseNotice | null>(cachedNotice);
	const mountedRef = useRef(true);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	useEffect(() => {
		latestReleaseRef.current = latestRelease;
	}, [latestRelease]);

	const refresh = useCallback(async () => {
		if (inFlightRef.current) {
			return inFlightRef.current;
		}
		const task = (async () => {
			setStatus("loading");
			try {
				const notice = await fetchLatestGithubRelease();
				if (!mountedRef.current) {
					return;
				}
				if (!notice) {
					const existingNotice = latestReleaseRef.current;
					setStatus(existingNotice ? deriveStatus(existingNotice, readDismissedReleaseVersion()) : "up-to-date");
					return;
				}
				latestReleaseRef.current = notice;
				setLatestRelease(notice);
				setStatus(deriveStatus(notice, readDismissedReleaseVersion()));
			} catch {
				if (!mountedRef.current) {
					return;
				}
				setStatus(typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "error");
			}
		})();
		inFlightRef.current = task.finally(() => {
			inFlightRef.current = null;
		});
		return inFlightRef.current;
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const dismissCurrentRelease = useCallback(() => {
		const notice = latestReleaseRef.current;
		if (!notice) {
			return;
		}
		writeDismissedReleaseVersion(notice.remoteVersion);
		setStatus("up-to-date");
	}, []);

	return {
		status,
		currentVersion,
		latestRelease,
		hasUpdate: status === "update-available",
		refresh,
		dismissCurrentRelease,
	};
}