import { useEffect, useState } from "react";
import { overrideDrawingStyle, resolveDrawingStyle, subscribeDrawingStyle } from "./drawingStyleRegistry";
import type { DrawingObject, DrawingStyle } from "./types";

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

function dashPatternFromStyle(value: DrawingStyle["strokeDasharray"]): number[] {
	switch (value) {
		case "dashed":
			return [6, 4];
		case "dotted":
			return [2, 4];
		default:
			return [];
	}
}

function updateStyle(drawing: DrawingObject, patch: Partial<DrawingStyle>): Partial<DrawingObject> {
	return {
		style: {
			...drawing.style,
			...patch,
		},
	};
}

export default function DrawingInspector({
	drawing,
	labels,
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

	if (!drawing) {
		return null;
	}

	const effectiveDrawing = {
		...drawing,
		style: resolveDrawingStyle(drawing),
	};
	const style = effectiveDrawing.style;
	const locked = drawing.locked === true;
	const visible = drawing.visible !== false;
	const strokeDasharray = style.strokeDasharray ?? "solid";
	const left = position?.x ?? 16;
	const top = position?.y ?? 16;

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
						onChange={(event) => overrideDrawingStyle(drawing.id, { color: event.target.value })}
						aria-label={labels.stroke}
					/>
				</label>
				<label className="rsc-drawing-inspector__field">
					<span>{labels.fill}</span>
					<input
						type="color"
						value={isColorString(style.fill)}
						onChange={(event) => onUpdate(updateStyle(drawing, { fill: event.target.value }))}
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
						onChange={(event) => overrideDrawingStyle(drawing.id, { lineWidth: Number(event.target.value) })}
						aria-label={labels.strokeWidth}
					/>
				</label>
			</div>

			<div className="rsc-drawing-inspector__field">
				<label>
					<span>{labels.lineStyle}</span>
					<select
						value={strokeDasharray}
						onChange={(event) => overrideDrawingStyle(drawing.id, { dashPattern: dashPatternFromStyle(event.target.value as DrawingStyle["strokeDasharray"]) })}
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
						onChange={(event) => overrideDrawingStyle(drawing.id, { opacity: Number(event.target.value) })}
						aria-label={labels.opacity}
					/>
				</label>
			</div>

			<div className="rsc-drawing-inspector__actions">
				<button type="button" onClick={onToggleLock} className="rsc-drawing-inspector__button">
					{locked ? labels.unlock : labels.lock}
				</button>
				<button type="button" onClick={onClone} className="rsc-drawing-inspector__button">
					{labels.clone}
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
