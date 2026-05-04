/**
 * ChartPaneSplitter
 * A thin draggable bar placed between chart panes as an absolute overlay.
 * Emits applyDragDelta on pointer move; double-click triggers resetLayout.
 */

import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { useEffect, useRef } from "react";

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
	// Track active mouse drag; move/up listeners are bound on window for robust dragging.
	const dragRef = useRef<{ lastY: number } | null>(null);
	const applyDragDeltaRef = useRef(applyDragDelta);
	const availableRef = useRef(available);

	useEffect(() => {
		applyDragDeltaRef.current = applyDragDelta;
	}, [applyDragDelta]);

	useEffect(() => {
		availableRef.current = available;
	}, [available]);

	useEffect(() => {
		const handleWindowMouseMove = (event: MouseEvent) => {
			const drag = dragRef.current;
			if (!drag) return;
			const deltaY = event.clientY - drag.lastY;
			if (deltaY === 0) return;
			drag.lastY = event.clientY;
			applyDragDeltaRef.current(splitterIndex, deltaY, availableRef.current);
		};

		const handleWindowMouseUp = () => {
			dragRef.current = null;
		};

		window.addEventListener("mousemove", handleWindowMouseMove);
		window.addEventListener("mouseup", handleWindowMouseUp);

		return () => {
			window.removeEventListener("mousemove", handleWindowMouseMove);
			window.removeEventListener("mouseup", handleWindowMouseUp);
		};
	}, [splitterIndex]);

	const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		dragRef.current = { lastY: e.clientY };
	};

	const handleMouseUp = () => {
		dragRef.current = null;
	};

	return (
		<div
			className="gc-pane-splitter"
			style={style}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onDoubleClick={onDoubleClick}
			title="Kéo để thay đổi chiều cao pane • Double-click để reset"
		>
			<div className="gc-pane-splitter__handle" />
		</div>
	);
}
