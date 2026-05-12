import { getBrandLatestReleaseUrl } from "../brand/brand";
import { useDemoI18n } from "../i18n";
import type { ReleaseNoticeStatus } from "../release/releaseTypes";

export interface BrandFooterProps {
	version: string;
	releaseStatus: ReleaseNoticeStatus;
	hasUpdate: boolean;
	onOpenAbout: () => void;
}

function getReleaseLabel(status: ReleaseNoticeStatus, hasUpdate: boolean, t: ReturnType<typeof useDemoI18n>["t"]): string {
	if (hasUpdate) {
		return t("release.newVersionAvailable");
	}
	switch (status) {
		case "loading":
		case "idle":
			return t("release.checking");
		case "offline":
			return t("release.offline");
		case "error":
			return t("release.retry");
		default:
			return t("release.upToDate");
	}
}

export function BrandFooter({ version, releaseStatus, hasUpdate, onOpenAbout }: BrandFooterProps) {
	const { t } = useDemoI18n();
	const releaseLabel = getReleaseLabel(releaseStatus, hasUpdate, t);

	return (
		<>
			<button type="button" className="gc-bottom-btn" aria-haspopup="dialog" onClick={onOpenAbout}>
				{t("footer.about")}
			</button>
			<span className={`gc-release-pill gc-release-pill--${releaseStatus}${hasUpdate ? " gc-release-pill--update" : ""}`} data-status={releaseStatus}>
				{releaseLabel}
			</span>
			<a className="gc-bottom-btn" href={getBrandLatestReleaseUrl()} target="_blank" rel="noreferrer">
				{t("footer.release")}
			</a>
			<span className="gc-version-badge">{t("footer.version", { version })}</span>
		</>
	);
}