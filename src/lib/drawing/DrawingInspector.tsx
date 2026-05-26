import { useEffect, useState } from "react";
import { isAlertableDrawingType } from "./drawingAlerts";
import { overrideDrawingStyle, projectDrawingStyleUpdate, resolveDrawingStyle, subscribeDrawingStyle } from "./drawingStyleRegistry";
import type { DrawingAlertConfig, DrawingAlertTrigger, DrawingObject, DrawingStyle } from "./types";

export interface DrawingInspectorTextEditorLabels {
	title: string;
	label: string;
	placeholder: string;
	edit: string;
	save: string;
	cancel: string;
	empty: string;
}

export interface DrawingInspectorTextEditorProps {
	active: boolean;
	value: string;
	labels: DrawingInspectorTextEditorLabels;
	onChange: (value: string) => void;
	onStartEdit: () => void;
	onCommit: () => void;
	onCancel: () => void;
}

export interface DrawingInspectorLabels {
	title: string;
	alert: string;
	alertEnabled: string;
	alertTrigger: string;
	alertTouch: string;
	alertBreak: string;
	alertCloseAbove: string;
	alertCloseBelow: string;
	stroke: string;
	fill: string;
	strokeWidth: string;
	lineStyle: string;
	opacity: string;
	solid: string;
	dashed: string;
	dotted: string;
	lock: string;
	unlock: string;
	clone: string;
	hide: string;
	show: string;
	bringToFront: string;
	sendToBack: string;
	delete: string;
	close: string;
}

export interface DrawingInspectorProps {
	drawing: DrawingObject | null;
	labels: DrawingInspectorLabels;
	selectionCount?: number;
	selectionSummary?: string;
	selectionLocked?: boolean;
	selectionVisible?: boolean;
	selectionContainsLocked?: boolean;
	textEditor?: DrawingInspectorTextEditorProps;
	position?: { x: number; y: number };
	onUpdate: (patch: Partial<DrawingObject>) => void;
	onDelete: () => void;
	onClone: () => void;
	onToggleLock: () => void;
	onToggleVisible: () => void;
	onBringToFront: () => void;
	onSendToBack: () => void;
	onClose: () => void;
}

function isColorString(value: string | undefined) {
	return typeof value === "string" && value.startsWith("#") ? value : "#ffffff";
}

function applyStyleChange(drawing: DrawingObject, onUpdate: (patch: Partial<DrawingObject>) => void, patch: Partial<DrawingStyle>): void {
	const { drawingPatch, overridePatch } = projectDrawingStyleUpdate(drawing, patch);
	onUpdate(drawingPatch);
	if (Object.keys(overridePatch).length > 0) {
		overrideDrawingStyle(drawing.id, overridePatch);
	}
}

function applyAlertChange(drawing: DrawingObject, onUpdate: (patch: Partial<DrawingObject>) => void, patch: Partial<DrawingAlertConfig>): void {
	onUpdate({
		alert: {
			enabled: drawing.alert?.enabled ?? false,
			trigger: drawing.alert?.trigger ?? "closeAbove",
			...patch,
		},
	});
}

export default function DrawingInspector({
	drawing,
	labels,
	selectionCount,
	selectionSummary,
	selectionLocked,
	selectionVisible,
	selectionContainsLocked,
	textEditor,
	position,
	onUpdate,
	onDelete,
	onClone,
	onToggleLock,
	onToggleVisible,
	onBringToFront,
	onSendToBack,
	onClose,
}: DrawingInspectorProps) {
	const [, setStyleRevision] = useState(0);
	useEffect(() => {
		if (!drawing) {
			return undefined;
		}
		return subscribeDrawingStyle(drawing.id, () => {
			setStyleRevision((value) => value + 1);
		});
	}, [drawing]);

	const isMultiSelect = (selectionCount ?? 0) > 1;

	if (!drawing && !isMultiSelect) {
		return null;
	}

	const effectiveDrawing = drawing
		? {
			...drawing,
			style: resolveDrawingStyle(drawing),
		}
		: null;
	const style = effectiveDrawing?.style;
	const alertSupported = drawing ? isAlertableDrawingType(drawing.type) : false;
	const alert = drawing?.alert ?? { enabled: false, trigger: "closeAbove" as DrawingAlertTrigger };
	const locked = selectionLocked ?? drawing?.locked === true;
	const visible = selectionVisible ?? drawing?.visible !== false;
	const deleteDisabled = selectionContainsLocked ?? locked;
	const strokeDasharray = style?.strokeDasharray ?? "solid";
	const left = position?.x ?? 16;
	const top = position?.y ?? 16;

	if (isMultiSelect) {
		return (
			<div
				className="rsc-drawing-inspector"
				style={{ left, top }}
				role="toolbar"
				aria-label={labels.title}
			>
				<div className="rsc-drawing-inspector__header">
					<div className="rsc-drawing-inspector__title">
						<strong>{labels.title}</strong>
						<span>{selectionSummary}</span>
					</div>
					<button type="button" className="rsc-drawing-inspector__icon" onClick={onClose} aria-label={labels.close}>
						x
					</button>
				</div>

				<div className="rsc-drawing-inspector__actions">
					<button type="button" onClick={onToggleLock} className="rsc-drawing-inspector__button">
						{locked ? labels.unlock : labels.lock}
					</button>
					<button type="button" onClick={onToggleVisible} className="rsc-drawing-inspector__button">
						{visible ? labels.hide : labels.show}
					</button>
					<button type="button" onClick={onBringToFront} className="rsc-drawing-inspector__button">
						{labels.bringToFront}
					</button>
					<button type="button" onClick={onSendToBack} className="rsc-drawing-inspector__button">
						{labels.sendToBack}
					</button>
					<button type="button" onClick={onDelete} className="rsc-drawing-inspector__button rsc-drawing-inspector__button--danger" disabled={deleteDisabled}>
						{labels.delete}
					</button>
				</div>
			</div>
		);
	}

	if (!drawing || !effectiveDrawing || !style) {
		return null;
	}

	return (
		<div
			className="rsc-drawing-inspector"
			style={{ left, top }}
			role="toolbar"
			aria-label={labels.title}
		>
			<div className="rsc-drawing-inspector__header">
				<div className="rsc-drawing-inspector__title">
					<strong>{labels.title}</strong>
					<span>{drawing.type}</span>
				</div>
				<button type="button" className="rsc-drawing-inspector__icon" onClick={onClose} aria-label={labels.close}>
					x
				</button>
			</div>

			<div className="rsc-drawing-inspector__swatches">
				<label className="rsc-drawing-inspector__field">
					<span>{labels.stroke}</span>
					<input
						type="color"
						value={isColorString(style.stroke)}
						onChange={(event) => applyStyleChange(drawing, onUpdate, { stroke: event.target.value })}
						aria-label={labels.stroke}
					/>
				</label>
				<label className="rsc-drawing-inspector__field">
					<span>{labels.fill}</span>
					<input
						type="color"
						value={isColorString(style.fill)}
						onChange={(event) => applyStyleChange(drawing, onUpdate, { fill: event.target.value })}
						aria-label={labels.fill}
					/>
				</label>
			</div>

			<div className="rsc-drawing-inspector__field">
				<label>
					<span>{labels.strokeWidth}</span>
					<input
						type="range"
						min="1"
						max="5"
						step="1"
						value={style.strokeWidth}
						onChange={(event) => applyStyleChange(drawing, onUpdate, { strokeWidth: Number(event.target.value) })}
						aria-label={labels.strokeWidth}
					/>
				</label>
			</div>

			<div className="rsc-drawing-inspector__field">
				<label>
					<span>{labels.lineStyle}</span>
					<select
						value={strokeDasharray}
						onChange={(event) => applyStyleChange(drawing, onUpdate, { strokeDasharray: event.target.value as DrawingStyle["strokeDasharray"] })}
						aria-label={labels.lineStyle}
					>
						<option value="solid">{labels.solid}</option>
						<option value="dashed">{labels.dashed}</option>
						<option value="dotted">{labels.dotted}</option>
					</select>
				</label>
			</div>

			<div className="rsc-drawing-inspector__field">
				<label>
					<span>{labels.opacity}</span>
					<input
						type="range"
						min="0.1"
						max="1"
						step="0.05"
						value={style.opacity ?? 1}
						onChange={(event) => applyStyleChange(drawing, onUpdate, { opacity: Number(event.target.value) })}
						aria-label={labels.opacity}
					/>
				</label>
			</div>

			{alertSupported && (
				<div className="rsc-drawing-inspector__field">
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
						<strong>{labels.alert}</strong>
						<label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
							<input
								type="checkbox"
								checked={alert.enabled}
								onChange={(event) => applyAlertChange(drawing, onUpdate, { enabled: event.target.checked })}
								aria-label={labels.alertEnabled}
							/>
							<span>{labels.alertEnabled}</span>
						</label>
					</div>
					<label>
						<span>{labels.alertTrigger}</span>
						<select
							value={alert.trigger}
							disabled={!alert.enabled}
							onChange={(event) => applyAlertChange(drawing, onUpdate, { trigger: event.target.value as DrawingAlertTrigger })}
							aria-label={labels.alertTrigger}
						>
							<option value="touch">{labels.alertTouch}</option>
							<option value="break">{labels.alertBreak}</option>
							<option value="closeAbove">{labels.alertCloseAbove}</option>
							<option value="closeBelow">{labels.alertCloseBelow}</option>
						</select>
					</label>
				</div>
			)}

			<div className="rsc-drawing-inspector__actions">
				<button type="button" onClick={onToggleLock} className="rsc-drawing-inspector__button">
					{locked ? labels.unlock : labels.lock}
				</button>
				<button type="button" onClick={onToggleVisible} className="rsc-drawing-inspector__button">
					{visible ? labels.hide : labels.show}
				</button>
				<button type="button" onClick={onClone} className="rsc-drawing-inspector__button">
					{labels.clone}
				</button>
				<button type="button" onClick={onBringToFront} className="rsc-drawing-inspector__button">
					{labels.bringToFront}
				</button>
				<button type="button" onClick={onSendToBack} className="rsc-drawing-inspector__button">
					{labels.sendToBack}
				</button>
				<button type="button" onClick={onDelete} className="rsc-drawing-inspector__button rsc-drawing-inspector__button--danger" disabled={locked}>
					{labels.delete}
				</button>
			</div>

			{drawing.type === "text" && textEditor && (
				<div className="rsc-drawing-inspector__field">
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
						<strong>{textEditor.labels.title}</strong>
						{!textEditor.active && (
							<button type="button" className="rsc-drawing-inspector__button" onClick={textEditor.onStartEdit} disabled={locked}>
								{textEditor.labels.edit}
							</button>
						)}
					</div>
					<span>{textEditor.labels.label}</span>
					{textEditor.active ? (
						<>
							<textarea
								value={textEditor.value}
								placeholder={textEditor.labels.placeholder}
								onChange={(event) => textEditor.onChange(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Escape") {
										event.preventDefault();
										textEditor.onCancel();
										return;
									}
									if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
										event.preventDefault();
										textEditor.onCommit();
									}
								}}
								rows={4}
								style={{
									width: "100%",
									resize: "vertical",
									borderRadius: 10,
									border: "1px solid rgba(148, 163, 184, 0.36)",
									padding: "10px 12px",
									font: "inherit",
									background: "rgba(15, 23, 42, 0.04)",
									color: "inherit",
								}}
							/>
							<div className="rsc-drawing-inspector__actions">
								<button type="button" className="rsc-drawing-inspector__button" onClick={textEditor.onCommit}>
									{textEditor.labels.save}
								</button>
								<button type="button" className="rsc-drawing-inspector__button" onClick={textEditor.onCancel}>
									{textEditor.labels.cancel}
								</button>
							</div>
						</>
					) : (
						<div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5, opacity: 0.92, marginTop: 6 }}>
							{drawing.text?.trim().length ? drawing.text : textEditor.labels.empty}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
