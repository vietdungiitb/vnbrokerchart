import type { DrawingObject, DrawingStyle } from "./types";

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
	if (!drawing) {
		return null;
	}

	const locked = drawing.locked === true;
	const visible = drawing.visible !== false;
	const style = drawing.style;
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
						onChange={(event) => onUpdate(updateStyle(drawing, { stroke: event.target.value }))}
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
						onChange={(event) => onUpdate(updateStyle(drawing, { strokeWidth: Number(event.target.value) }))}
						aria-label={labels.strokeWidth}
					/>
				</label>
			</div>

			<div className="rsc-drawing-inspector__field">
				<label>
					<span>{labels.lineStyle}</span>
					<select
						value={strokeDasharray}
						onChange={(event) => onUpdate(updateStyle(drawing, { strokeDasharray: event.target.value as DrawingStyle["strokeDasharray"] }))}
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
						onChange={(event) => onUpdate(updateStyle(drawing, { opacity: Number(event.target.value) }))}
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
		</div>
	);
}
