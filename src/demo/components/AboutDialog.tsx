import { useEffect, useRef } from "react";

import {
	getBrandDescription,
	getBrandDisplayName,
	getBrandHomepageUrl,
	getBrandLatestReleaseUrl,
	getBrandRepositoryConfig,
	getBrandRepositoryUrl,
	getBrandRuntimeVersion,
	getBrandSiteTitle,
	getBrandTagline,
} from "../brand/brand";
import { useDemoI18n } from "../i18n";
import type { ReleaseNotice } from "../release/releaseTypes";
import type { ReleaseNoticeStatus } from "../release/releaseTypes";
import { BrandMark } from "./BrandMark";

export interface AboutDialogProps {
	open: boolean;
	currentVersion: string;
	latestRelease: ReleaseNotice | null;
	releaseStatus: ReleaseNoticeStatus;
	onClose: () => void;
	onCheckAgain: () => void;
	onDismissCurrentRelease: () => void;
}

function getReleaseStatusLabel(status: ReleaseNoticeStatus, t: ReturnType<typeof useDemoI18n>["t"]): string {
	switch (status) {
		case "loading":
		case "idle":
			return t("release.checking");
		case "update-available":
			return t("release.newVersionAvailable");
		case "offline":
			return t("release.offline");
		case "error":
			return t("release.retry");
		default:
			return t("release.upToDate");
	}
}

function formatPublishedAt(value: string | number, language: string): string {
	const formatter = new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
		year: "numeric",
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
	return formatter.format(new Date(value));
}

export function AboutDialog({ open, currentVersion, latestRelease, releaseStatus, onClose, onCheckAgain, onDismissCurrentRelease }: AboutDialogProps) {
	const { language, t } = useDemoI18n();
	const dialogRef = useRef<HTMLDivElement | null>(null);
	const repository = getBrandRepositoryConfig();
	const version = currentVersion || getBrandRuntimeVersion();

	useEffect(() => {
		if (!open) {
			return;
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose]);

	useEffect(() => {
		if (open) {
			void onCheckAgain();
		}
	}, [open, onCheckAgain]);

	if (!open) {
		return null;
	}

	const brandName = getBrandDisplayName(language);
	const tagline = getBrandTagline(language);
	const description = getBrandDescription(language);
	const siteTitle = getBrandSiteTitle(language);
	const releaseStatusLabel = getReleaseStatusLabel(releaseStatus, t);
	const latestVersion = latestRelease ? `v${latestRelease.remoteVersion}` : t("common.na");
	const publishedAt = latestRelease ? formatPublishedAt(latestRelease.publishedAt, language) : t("common.na");
	const releaseNotes = latestRelease?.bodyExcerpt || t("common.na");
	const releasePageUrl = latestRelease?.releaseUrl ?? getBrandLatestReleaseUrl();
	const canDismiss = releaseStatus === "update-available" && latestRelease !== null;

	return (
		<div
			className="gc-about-backdrop"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) {
					onClose();
				}
			}}
		>
			<div
				ref={dialogRef}
				className="gc-about-dialog"
				role="dialog"
				aria-modal="true"
				aria-labelledby="gc-about-title"
				aria-describedby="gc-about-description"
			>
				<header className="gc-about-dialog__header">
					<div className="gc-about-dialog__hero">
						<div className="gc-about-dialog__mark-shell">
							<BrandMark size={88} className="gc-about-dialog__mark" />
						</div>
						<div className="gc-about-dialog__hero-copy">
							<div className="gc-about-dialog__eyebrow">{t("about.eyebrow")}</div>
							<h2 id="gc-about-title" className="gc-about-dialog__title">{brandName}</h2>
							<p id="gc-about-description" className="gc-about-dialog__tagline">{tagline}</p>
						</div>
					</div>
					<button type="button" className="gc-about-dialog__close" aria-label={t("about.close")} onClick={onClose}>
						×
					</button>
				</header>

				<div className="gc-about-dialog__body">
					<section className="gc-about-dialog__summary">
						<p className="gc-about-dialog__copy">{description}</p>
						<p className="gc-about-dialog__copy gc-about-dialog__copy--muted">{siteTitle}</p>
						<div className={`gc-release-pill gc-release-pill--${releaseStatus}${releaseStatus === "update-available" ? " gc-release-pill--update" : ""}`} data-status={releaseStatus}>
							{releaseStatusLabel}
						</div>
					</section>

					<section className="gc-about-dialog__card">
						<div className="gc-about-dialog__meta-row">
							<span className="gc-about-dialog__meta-label">{t("about.currentVersion")}</span>
							<span className="gc-about-dialog__meta-value">v{version}</span>
						</div>
						<div className="gc-about-dialog__meta-row">
							<span className="gc-about-dialog__meta-label">{t("about.homepage")}</span>
							<a className="gc-about-dialog__link" href={getBrandHomepageUrl()} target="_blank" rel="noreferrer">
								{getBrandHomepageUrl().replace("https://", "")}
							</a>
						</div>
						<div className="gc-about-dialog__meta-row">
							<span className="gc-about-dialog__meta-label">{t("about.repository")}</span>
							<a className="gc-about-dialog__link" href={getBrandRepositoryUrl()} target="_blank" rel="noreferrer">
								{repository.owner}/{repository.name}
							</a>
						</div>
						<div className="gc-about-dialog__meta-row">
							<span className="gc-about-dialog__meta-label">{t("about.latestVersion")}</span>
							<a className="gc-about-dialog__link" href={releasePageUrl} target="_blank" rel="noreferrer">
								{latestVersion}
							</a>
						</div>
						<div className="gc-about-dialog__meta-row">
							<span className="gc-about-dialog__meta-label">{t("about.publishedAt")}</span>
							<span className="gc-about-dialog__meta-value">{publishedAt}</span>
						</div>
						<div className="gc-about-dialog__meta-row gc-about-dialog__meta-row--stacked">
							<span className="gc-about-dialog__meta-label">{t("about.releaseNotes")}</span>
							<p className="gc-about-dialog__release-notes">{releaseNotes}</p>
						</div>
						<div className="gc-about-dialog__meta-row">
							<span className="gc-about-dialog__meta-label">{t("about.releasePage")}</span>
							<a className="gc-about-dialog__link" href={releasePageUrl} target="_blank" rel="noreferrer">
								{releasePageUrl.replace("https://", "")}
							</a>
						</div>
						<div className="gc-about-dialog__meta-row">
							<span className="gc-about-dialog__meta-label">{t("release.lastChecked")}</span>
							<span className="gc-about-dialog__meta-value">{latestRelease ? formatPublishedAt(latestRelease.fetchedAt, language) : t("common.na")}</span>
						</div>
					</section>
				</div>

				<footer className="gc-about-dialog__footer">
					<button type="button" className="gc-bottom-btn gc-about-dialog__footer-btn" onClick={onCheckAgain}>
						{t("about.checkAgain")}
					</button>
					{canDismiss ? (
						<button type="button" className="gc-bottom-btn gc-about-dialog__footer-btn" onClick={onDismissCurrentRelease}>
							{t("release.dismiss")}
						</button>
					) : null}
					<a className="gc-about-dialog__link gc-about-dialog__footer-link" href={repository.latestUrl} target="_blank" rel="noreferrer">
						{t("about.openRelease")}
					</a>
					<button type="button" className="gc-bottom-btn gc-about-dialog__footer-btn" onClick={onClose}>
						{t("about.close")}
					</button>
				</footer>
			</div>
		</div>
	);
}