import type { DrawingObject } from "./types";

export interface DrawingListPanelLabels {
	title: string;
	empty: string;
	visible: string;
	hidden: string;
	locked: string;
	selected: string;
	delete: string;
}

export interface DrawingListPanelProps {
	drawings: DrawingObject[];
	selectedId: string | null;
	labels: DrawingListPanelLabels;
	position?: { x: number; y: number };
	onSelect: (id: string) => void;
	onToggleVisible: (id: string) => void;
	onDelete: (id: string) => void;
}

function formatDrawingLabel(drawing: DrawingObject) {
	return drawing.label?.trim().length ? drawing.label : drawing.type;
}

function formatTimestamp(timestamp: number) {
	try {
		return new Intl.DateTimeFormat(undefined, {
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(timestamp));
	} catch {
		return new Date(timestamp).toISOString();
	}
}

export default function DrawingListPanel({ drawings, selectedId, labels, position, onSelect, onToggleVisible, onDelete }: DrawingListPanelProps) {
	const left = position?.x ?? 16;
	const top = position?.y ?? 120;

	return (
		<div className="rsc-drawing-list-panel" style={{ left, top }}>
			<div className="rsc-drawing-list-panel__header">
				<strong>{labels.title}</strong>
				<span>{drawings.length}</span>
			</div>
			{drawings.length === 0 ? (
				<div className="rsc-drawing-list-panel__empty">{labels.empty}</div>
			) : (
				<div className="rsc-drawing-list-panel__items">
					{drawings.map((drawing) => {
						const isSelected = drawing.id === selectedId;
						const hidden = drawing.visible === false;
						const locked = drawing.locked === true;
						return (
							<div
								key={drawing.id}
								className={`rsc-drawing-list-panel__item${isSelected ? " rsc-drawing-list-panel__item--selected" : ""}`}
							>
								<button type="button" className="rsc-drawing-list-panel__select" onClick={() => onSelect(drawing.id)}>
									<span className="rsc-drawing-list-panel__label">{formatDrawingLabel(drawing)}</span>
									<span className="rsc-drawing-list-panel__meta">{formatTimestamp(drawing.createdAt)}</span>
								</button>
								<div className="rsc-drawing-list-panel__actions">
									<span className="rsc-drawing-list-panel__badge">{isSelected ? labels.selected : drawing.type}</span>
									<span className="rsc-drawing-list-panel__badge">{hidden ? labels.hidden : labels.visible}</span>
									{locked ? <span className="rsc-drawing-list-panel__badge">{labels.locked}</span> : null}
									<button type="button" className="rsc-drawing-list-panel__icon" onClick={() => onToggleVisible(drawing.id)}>{hidden ? labels.visible : labels.hidden}</button>
									<button type="button" className="rsc-drawing-list-panel__icon" onClick={() => onDelete(drawing.id)} disabled={locked}>{labels.delete}</button>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
