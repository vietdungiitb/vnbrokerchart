import type { CSSProperties, RefObject, DragEvent as ReactDragEvent } from "react";
import type { PaneDescriptor } from "./types/pane-descriptor";

export interface PaneHeaderProps {
	pane: PaneDescriptor;
	onToggleVisible: () => void;
	onRemove: () => void;
	onAddSeries?: () => void;
	onDragStart?: (event: ReactDragEvent<HTMLButtonElement>) => void;
	addButtonRef?: RefObject<HTMLButtonElement | null>;
	className?: string;
}

export function PaneHeader({ pane, onToggleVisible, onRemove, onAddSeries, onDragStart, addButtonRef, className }: PaneHeaderProps) {
	const style: CSSProperties = {};

	return (
		<div className={`rsc-pane-header${className ? ` ${className}` : ""}`} style={style}>
			<span className="rsc-pane-header__label">{pane.label}</span>
			<div className="rsc-pane-header__actions">
				{onDragStart ? (
					<button
						type="button"
						className="rsc-pane-btn rsc-pane-btn--drag"
						draggable={!pane.pinned}
						onDragStart={onDragStart}
						aria-label={`Kéo ${pane.label}`}
						title={pane.pinned ? "Pane chính không thể kéo" : "Kéo để đổi vị trí pane"}
					>
						⠿
					</button>
				) : null}
				{onAddSeries ? (
					<button
						ref={addButtonRef}
						type="button"
						className="rsc-pane-btn"
						onClick={onAddSeries}
						aria-label={`Thêm series cho ${pane.label}`}
						title="Thêm indicator/series"
					>
						+
					</button>
				) : null}
				<button
					type="button"
					className="rsc-pane-btn"
					onClick={onToggleVisible}
					disabled={pane.pinned}
					aria-label={pane.visible ? `Ẩn ${pane.label}` : `Hiện ${pane.label}`}
					title={pane.pinned ? "Pane chính luôn hiển thị" : pane.visible ? "Ẩn pane" : "Hiện lại pane"}
				>
					{pane.visible ? "👁" : "◌"}
				</button>
				{!pane.pinned ? (
					<button
						type="button"
						className="rsc-pane-btn"
						onClick={onRemove}
						aria-label={`Ẩn ${pane.label}`}
						title="Ẩn pane (có thể khôi phục từ menu Panes)"
					>
						×
					</button>
				) : null}
			</div>
		</div>
	);
}
