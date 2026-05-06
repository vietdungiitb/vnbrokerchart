import { useEffect, useMemo, useRef, useState } from "react";
import { getSeries, listRegistered, type PaneDescriptor, type SeriesConfig, type SeriesSettingField, type SeriesTypeId, type YAxisSide } from "../lib/core";
import type { UseDynamicPanesResult } from "../lib/core/hooks/useDynamicPanes";
import { isDefaultPaneId } from "../lib/core/types/pane-descriptor";
import { useDemoI18n } from "./i18n";

export type SettingsSection = "layout" | "indicators" | "theme" | "reset";

export interface PaneSettingsModalProps {
	open: boolean;
	section: SettingsSection;
	onSectionChange: (section: SettingsSection) => void;
	selectedPaneId: string;
	onSelectedPaneIdChange: (paneId: string) => void;
	paneState: UseDynamicPanesResult;
	maxVisiblePanes: number;
	onMaxVisiblePanesChange: (next: number) => void;
	onAddPane: () => void;
	onReset: () => void;
	isDark: boolean;
	toggleTheme: () => void;
	onClose: () => void;
}

function describeSeries(series: SeriesConfig, index: number): string {
	const label = series.type;
	if (series.type === "EMA" && typeof series.params?.period === "number") {
		return `EMA(${series.params.period}) #${index + 1}`;
	}
	if (series.type === "RSI" && typeof series.params?.period === "number") {
		return `RSI(${series.params.period}) #${index + 1}`;
	}
	if (series.type === "BollingerBand" && typeof series.params?.period === "number") {
		return `BB(${series.params.period}) #${index + 1}`;
	}
	if (series.type === "MACD") {
		const fast = typeof series.params?.fast === "number" ? series.params.fast : 12;
		const slow = typeof series.params?.slow === "number" ? series.params.slow : 26;
		return `MACD(${fast},${slow}) #${index + 1}`;
	}
	if (series.type === "Whale" && typeof series.params?.threshold === "number") {
		return `Whale(${series.params.threshold}) #${index + 1}`;
	}
	return `${label} #${index + 1}`;
}

function parseNumber(value: string, fallback: number): number {
	const next = Number.parseFloat(value);
	return Number.isFinite(next) ? next : fallback;
}

export function PaneSettingsModal({
	open,
	section,
	onSectionChange,
	selectedPaneId,
	onSelectedPaneIdChange,
	paneState,
	maxVisiblePanes,
	onMaxVisiblePanesChange,
	onAddPane,
	onReset,
	isDark,
	toggleTheme,
	onClose,
}: PaneSettingsModalProps) {
	const { t, getPaneLabel } = useDemoI18n();
	const dialogRef = useRef<HTMLDivElement | null>(null);
	const availableSeriesTypes = useMemo(() => listRegistered(), []);
	const [composerType, setComposerType] = useState<SeriesTypeId>("EMA");
	const [composerYAxis, setComposerYAxis] = useState<YAxisSide>("right");

	const selectedPane = useMemo(
		() => paneState.panes.find((pane) => pane.id === selectedPaneId) ?? paneState.visiblePanes[0] ?? paneState.panes[0],
		[paneState.panes, paneState.visiblePanes, selectedPaneId],
	);

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
		if (!open || availableSeriesTypes.length === 0) {
			return;
		}
		if (!availableSeriesTypes.includes(composerType)) {
			setComposerType(availableSeriesTypes[0]);
		}
	}, [availableSeriesTypes, composerType, open]);

	const resolvedComposerType = availableSeriesTypes.includes(composerType)
		? composerType
		: availableSeriesTypes[0] ?? "EMA";

	const composerEntry = useMemo(() => {
		if (availableSeriesTypes.length === 0) {
			return null;
		}
		try {
			return getSeries(resolvedComposerType);
		} catch {
			return null;
		}
	}, [availableSeriesTypes.length, resolvedComposerType]);

	useEffect(() => {
		if (composerEntry) {
			setComposerYAxis(composerEntry.defaultYAxis);
		}
	}, [composerEntry, resolvedComposerType]);

	if (!open) {
		return null;
	}

	const visibleCount = paneState.visiblePanes.length;
	const overLimit = visibleCount > maxVisiblePanes;
	const canAddPane = paneState.canAddPane;
	const paneLabel = (pane: PaneDescriptor) => getPaneLabel(pane.id, pane.label);
	const sectionLabels = useMemo<Record<SettingsSection, string>>(() => ({
		layout: t("settings.layout"),
		indicators: t("settings.indicators"),
		theme: t("settings.theme"),
		reset: t("settings.reset"),
	}), [t]);

	const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget) {
			onClose();
		}
	};

	const handleAddSeries = () => {
		if (!selectedPane || !composerEntry) {
			return;
		}
		paneState.addSeries(selectedPane.id, {
			type: resolvedComposerType,
			yAxis: composerYAxis,
			params: { ...composerEntry.defaultParams },
		});
	};

	const handleSeriesParamChange = (pane: PaneDescriptor, series: SeriesConfig, seriesIndex: number, patch: Record<string, unknown>) => {
		paneState.updateSeriesParams(pane.id, series.type, patch, seriesIndex);
	};

	const handleDeletePane = (pane: PaneDescriptor) => {
		paneState.deletePane(pane.id);
		if (pane.id === selectedPaneId) {
			const nextSelectedPaneId = paneState.visiblePanes.find((visiblePane) => visiblePane.id !== pane.id)?.id
				?? paneState.panes.find((nextPane) => nextPane.id !== pane.id)?.id
				?? "";
			if (nextSelectedPaneId) {
				onSelectedPaneIdChange(nextSelectedPaneId);
			}
		}
	};

	const renderSeriesParams = (pane: PaneDescriptor, series: SeriesConfig, seriesIndex: number) => {
		let entry: ReturnType<typeof getSeries> | undefined;
		try {
			entry = getSeries(series.type);
		} catch {
			return null;
		}

		const fields = entry.settingsFields ?? [];
		if (fields.length === 0) {
			return null;
		}

		const renderField = (field: SeriesSettingField) => {
			const rawValue = series.params?.[field.key];
			const currentValue = typeof rawValue === "number" && Number.isFinite(rawValue) ? rawValue : field.defaultValue;
			return (
				<label key={field.key} className="gc-settings-field">
					<span>{t(field.labelKey)}</span>
					<input
						type={field.type}
						className="gc-settings-input"
						min={field.min}
						max={field.max}
						step={field.step ?? 1}
						value={currentValue}
						onChange={(event) => handleSeriesParamChange(pane, series, seriesIndex, { [field.key]: parseNumber(event.target.value, currentValue) })}
					/>
				</label>
			);
		};

		if (fields.length === 1) {
			return renderField(fields[0]);
		}

		const gridClassName = fields.length === 3
			? "gc-settings-param-grid gc-settings-param-grid--three"
			: "gc-settings-param-grid";

		return <div className={gridClassName}>{fields.map(renderField)}</div>;
	};

	const renderLayoutSection = () => (
		<div className="gc-settings-panel">
			<div className="gc-settings-panel__header">
				<div>
					<div className="gc-settings-kicker">{t("settings.layoutKicker")}</div>
					<h3>{t("settings.managePanes")}</h3>
				</div>
				<div className="gc-settings-stat">{visibleCount}/{maxVisiblePanes}</div>
			</div>

			<div className="gc-settings-row gc-settings-row--split">
				<label className="gc-settings-field">
					<span>{t("settings.maxVisible")}</span>
					<input
						type="number"
						className="gc-settings-input"
						min={1}
						max={12}
						step={1}
						value={maxVisiblePanes}
						onChange={(event) => onMaxVisiblePanesChange(Math.max(1, parseNumber(event.target.value, maxVisiblePanes)))}
					/>
				</label>
				<button type="button" className="gc-btn gc-btn--accent" onClick={onAddPane} disabled={!canAddPane}>
					{t("settings.addPane")}
				</button>
			</div>

			<div className="gc-settings-pane-list">
				{paneState.panes.map((pane) => {
					const visibleIndex = paneState.visiblePanes.findIndex((visiblePane) => visiblePane.id === pane.id);
					const hidden = !pane.visible;
					const isDefaultPane = isDefaultPaneId(pane.id);
					const isSelected = pane.id === (selectedPane?.id ?? selectedPaneId);
					const canMoveUp = pane.visible && visibleIndex > 0;
					const canMoveDown = pane.visible && visibleIndex >= 0 && visibleIndex < paneState.visiblePanes.length - 1;
					return (
						<div
							key={pane.id}
							className={`gc-settings-pane${hidden ? " gc-settings-pane--hidden" : ""}${isSelected ? " gc-settings-pane--selected" : ""}`}
							onClick={() => onSelectedPaneIdChange(pane.id)}
							role="button"
							tabIndex={0}
						>
							<div className="gc-settings-pane__head">
								<div>
									<div className="gc-settings-pane__label">
										{paneLabel(pane)}
										{pane.pinned ? <span className="gc-settings-pill">{t("settings.pinned")}</span> : null}
										{isDefaultPane ? <span className="gc-settings-pill">{t("settings.defaultPane")}</span> : <span className="gc-settings-pill gc-settings-pill--muted">{t("settings.customPane")}</span>}
									</div>
									<div className="gc-settings-pane__meta">{t("settings.seriesMeta", { count: pane.series.length, ratio: Math.round(pane.heightRatio * 100) })}</div>
								</div>
								<div className="gc-settings-pane__actions">
									<button type="button" className="gc-btn" onClick={(event) => { event.stopPropagation(); pane.visible ? paneState.toggleVisible(pane.id) : paneState.restorePane(pane.id); }} disabled={hidden && !paneState.canAddPane}>
										{pane.visible ? t("settings.hide") : t("settings.restore")}
									</button>
									<button type="button" className="gc-btn" onClick={(event) => { event.stopPropagation(); if (pane.visible) paneState.toggleVisible(pane.id); }} disabled={pane.pinned || hidden}>
										{pane.pinned ? t("settings.locked") : t("settings.visible")}
									</button>
									{!isDefaultPane ? (
										<button
											type="button"
											className="gc-btn gc-btn--danger"
											onClick={(event) => { event.stopPropagation(); handleDeletePane(pane); }}
										>
											{t("settings.deletePane")}
										</button>
									) : null}
								</div>
							</div>
							{!isDefaultPane ? (
								<label className="gc-settings-field">
									<span>{t("settings.paneName")}</span>
									<input
										type="text"
										className="gc-settings-input"
										value={pane.label}
										onChange={(event) => paneState.renamePane(pane.id, event.target.value)}
									/>
								</label>
							) : null}
							<div className="gc-settings-pane__footer">
								<div className="gc-settings-pane__tags">
									{pane.series.map((series, index) => (
										<span key={`${pane.id}-${series.type}-${index}`} className="gc-tag">{describeSeries(series, index)}</span>
									))}
								</div>
								<div className="gc-settings-pane__arrows">
									<button type="button" className="gc-btn" onClick={(event) => { event.stopPropagation(); paneState.reorderPanes(visibleIndex, visibleIndex - 1); }} disabled={!canMoveUp}>↑</button>
									<button type="button" className="gc-btn" onClick={(event) => { event.stopPropagation(); paneState.reorderPanes(visibleIndex, visibleIndex + 1); }} disabled={!canMoveDown}>↓</button>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{overLimit ? <div className="gc-settings-note gc-settings-note--warn">{t("settings.overLimit")}</div> : null}
		</div>
	);

	const renderIndicatorsSection = () => (
		<div className="gc-settings-panel">
			<div className="gc-settings-panel__header">
				<div>
						<div className="gc-settings-kicker">{t("settings.indicatorKicker")}</div>
						<h3>{t("settings.indicatorEditor")}</h3>
				</div>
				<label className="gc-settings-field gc-settings-field--compact">
						<span>{t("settings.pane")}</span>
					<select
						className="gc-settings-select"
						value={selectedPane?.id ?? selectedPaneId}
						onChange={(event) => onSelectedPaneIdChange(event.target.value)}
					>
						{paneState.panes.map((pane) => (
							<option key={pane.id} value={pane.id}>{paneLabel(pane)}</option>
						))}
					</select>
				</label>
			</div>

			{selectedPane ? (
				<>
					<div className="gc-settings-pane-summary">
						<div className="gc-settings-pane-summary__title">
							{paneLabel(selectedPane)}
							{selectedPane.pinned ? <span className="gc-settings-pill">{t("settings.pinned")}</span> : null}
							{selectedPane.visible ? <span className="gc-settings-pill gc-settings-pill--ok">{t("settings.visible")}</span> : <span className="gc-settings-pill gc-settings-pill--muted">{t("settings.hidden")}</span>}
						</div>
						<div className="gc-settings-note">{t("settings.paneSummary")}</div>
					</div>

					<div className="gc-settings-series-list">
						{selectedPane.series.map((series, seriesIndex) => {
							const revealEnabled = selectedPane.visible || paneState.canAddPane;
							return (
								<div key={`${selectedPane.id}-${series.type}-${seriesIndex}`} className="gc-settings-series">
									<div className="gc-settings-series__head">
										<div>
											<div className="gc-settings-series__title">{describeSeries(series, seriesIndex)}</div>
											<div className="gc-settings-series__meta">{series.visible === false ? t("settings.hidden") : t("settings.visible")}</div>
										</div>
										<label className="gc-settings-field gc-settings-field--compact">
											<span>{t("settings.yAxis")}</span>
											<select
												className="gc-settings-select"
												value={series.yAxis}
												onChange={(event) => paneState.updateSeriesYAxis(selectedPane.id, series.type, event.target.value as YAxisSide, seriesIndex)}
											>
												<option value="left">{t("settings.yAxisLeft")}</option>
												<option value="right">{t("settings.yAxisRight")}</option>
											</select>
										</label>
										<div className="gc-settings-series__actions">
											<button type="button" className="gc-btn" onClick={() => paneState.toggleSeriesVisible(selectedPane.id, series.type, seriesIndex)} disabled={!revealEnabled && series.visible === false}>
												{series.visible === false ? t("settings.visible") : t("settings.hide")}
											</button>
											<button type="button" className="gc-btn gc-btn--danger" onClick={() => paneState.removeSeries(selectedPane.id, series.type, seriesIndex)}>
												{t("settings.remove")}
											</button>
										</div>
									</div>
									<div className="gc-settings-series__params">
										{renderSeriesParams(selectedPane, series, seriesIndex)}
									</div>
								</div>
							);
						})}
					</div>

					<div className="gc-settings-composer">
						<div className="gc-settings-composer__head">
							<div>
								<div className="gc-settings-kicker">{t("settings.addIndicator")}</div>
								<h4>{t("settings.createIndicator")}</h4>
							</div>
							<button type="button" className="gc-btn gc-btn--accent" onClick={handleAddSeries} disabled={!composerEntry || (!selectedPane.visible && !paneState.canAddPane)}>
								{t("settings.addIndicator")}
							</button>
						</div>
						<div className="gc-settings-param-grid gc-settings-param-grid--three">
							<label className="gc-settings-field">
								<span>{t("settings.indicatorType")}</span>
								<select className="gc-settings-select" value={resolvedComposerType} onChange={(event) => setComposerType(event.target.value as SeriesTypeId)}>
									{availableSeriesTypes.map((type) => (
										<option key={type} value={type}>{type}</option>
									))}
								</select>
							</label>
							<label className="gc-settings-field">
								<span>{t("settings.yAxis")}</span>
								<select className="gc-settings-select" value={composerYAxis} onChange={(event) => setComposerYAxis(event.target.value as YAxisSide)}>
									<option value="left">{t("settings.yAxisLeft")}</option>
									<option value="right">{t("settings.yAxisRight")}</option>
								</select>
							</label>
							<div className="gc-settings-note gc-settings-note--tight">
								{t("settings.composerNote")}
							</div>
						</div>
					</div>
				</>
			) : (
					<div className="gc-settings-empty">{t("settings.noPane")}</div>
			)}
		</div>
	);

	const renderThemeSection = () => (
		<div className="gc-settings-panel">
			<div className="gc-settings-panel__header">
				<div>
						<div className="gc-settings-kicker">{t("settings.themeKicker")}</div>
						<h3>{t("settings.appearanceShell")}</h3>
				</div>
				<button type="button" className="gc-btn gc-btn--accent" onClick={toggleTheme}>
						{isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
				</button>
			</div>
			<div className="gc-settings-note">
				{t("theme.shellMode", { mode: isDark ? t("theme.mode.dark") : t("theme.mode.light") })}
			</div>
		</div>
	);

	const renderResetSection = () => (
		<div className="gc-settings-panel">
			<div className="gc-settings-panel__header">
				<div>
						<div className="gc-settings-kicker">{t("settings.resetKicker")}</div>
						<h3>{t("settings.resetDefaults")}</h3>
				</div>
				<button type="button" className="gc-btn gc-btn--danger" onClick={onReset}>
						{t("settings.resetLayout")}
				</button>
			</div>
			<div className="gc-settings-note">
				{t("settings.resetNote")}
			</div>
		</div>
	);

	return (
		<div className="gc-settings-backdrop" onMouseDown={handleBackdropMouseDown}>
			<div ref={dialogRef} className="gc-settings-modal" role="dialog" aria-modal="true" aria-labelledby="pane-settings-title">
				<header className="gc-settings-modal__header">
					<div className="gc-settings-modal__hero">
						<div className="gc-settings-kicker">{t("settings.dialogKicker")}</div>
						<h2 id="pane-settings-title">{t("settings.dialogTitle")}</h2>
						<div className="gc-settings-modal__meta">
							<span className="gc-settings-badge gc-settings-badge--accent">{sectionLabels[section]}</span>
							<span className="gc-settings-badge">{`${t("common.panes")} ${visibleCount}/${maxVisiblePanes}`}</span>
							{selectedPane ? <span className="gc-settings-badge">{paneLabel(selectedPane)}</span> : null}
						</div>
					</div>
					<button type="button" className="gc-settings-modal__close" onClick={onClose} aria-label={t("settings.dialogClose")}>
						×
					</button>
				</header>
				<div className="gc-settings-modal__body">
					<nav className="gc-settings-modal__nav" aria-label={t("settings.manageSections")}>
						<div className="gc-settings-modal__nav-head">
							<div className="gc-settings-kicker">{t("settings.manageSections")}</div>
						</div>
						{([
							["layout", t("settings.layout")],
							["indicators", t("settings.indicators")],
							["theme", t("settings.theme")],
							["reset", t("settings.reset")],
						] as const).map(([nextSection, label]) => (
							<button
								key={nextSection}
								type="button"
								className={`gc-settings-modal__nav-item${section === nextSection ? " gc-settings-modal__nav-item--active" : ""}`}
								onClick={() => onSectionChange(nextSection)}
							>
								{label}
							</button>
						))}
					</nav>
					<div className="gc-settings-modal__content">
						<div className="gc-settings-modal__surface">
							{section === "layout" ? renderLayoutSection() : null}
							{section === "indicators" ? renderIndicatorsSection() : null}
							{section === "theme" ? renderThemeSection() : null}
							{section === "reset" ? renderResetSection() : null}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}