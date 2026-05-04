/**
 * ChartPaneSplitter
 * A thin draggable bar placed between chart panes as an absolute overlay.
 * Emits applyDragDelta on pointer move; double-click triggers resetLayout.
 */

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useRef } from "react";

interface ChartPaneSplitterProps {
	splitterIndex: 0 | 1;
	available: number;
	applyDragDelta: (index: 0 | 1, deltaY: number, available: number) => void;
	onDoubleClick: () => void;
	style?: CSSProperties;
}

export default function ChartPaneSplitter({
	splitterIndex,
	available,
	applyDragDelta,
	onDoubleClick,
	style,
}: ChartPaneSplitterProps) {
	// Track last pointer Y to compute incremental delta each frame
	const lastYRef = useRef<number | null>(null);
	const draggingRef = useRef(false);

	const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
		e.preventDefault();
		draggingRef.current = true;
		lastYRef.current = e.clientY;
		e.currentTarget.setPointerCapture(e.pointerId);
	};

	const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
		if (!draggingRef.current || lastYRef.current === null) return;
		const deltaY = e.clientY - lastYRef.current;
		if (deltaY === 0) return;
		lastYRef.current = e.clientY;
		applyDragDelta(splitterIndex, deltaY, available);
	};

	const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
		draggingRef.current = false;
		lastYRef.current = null;
		if (e.currentTarget.hasPointerCapture(e.pointerId)) {
			e.currentTarget.releasePointerCapture(e.pointerId);
		}
	};

	const handlePointerLeave = () => {
		draggingRef.current = false;
		lastYRef.current = null;
	};

	return (
		<div
			className="gc-pane-splitter"
			style={style}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerCancel={handlePointerUp}
			onPointerLeave={handlePointerLeave}
			onDoubleClick={onDoubleClick}
			title="Kéo để thay đổi chiều cao pane • Double-click để reset"
		>
			<div className="gc-pane-splitter__handle" />
		</div>
	);
}
