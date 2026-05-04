/**
 * ChartPaneSplitter
 * A thin draggable bar placed between chart panes as an absolute overlay.
 * Emits applyDragDelta on pointer move; double-click triggers resetLayout.
 */

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

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
	const [isDragging, setIsDragging] = useState(false);
	const dragRef = useRef<{ pointerId: number; lastY: number } | null>(null);
	const rootRef = useRef<HTMLDivElement | null>(null);
	const applyDragDeltaRef = useRef(applyDragDelta);
	const availableRef = useRef(available);

	useEffect(() => {
		applyDragDeltaRef.current = applyDragDelta;
	}, [applyDragDelta]);

	useEffect(() => {
		availableRef.current = available;
	}, [available]);

	useEffect(() => {
		return () => {
			dragRef.current = null;
		};
	}, []);

	const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		event.preventDefault();
		const node = rootRef.current;
		if (node) {
			node.setPointerCapture(event.pointerId);
		}
		dragRef.current = { pointerId: event.pointerId, lastY: event.clientY };
		setIsDragging(true);
	};

	const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
		const drag = dragRef.current;
		if (!drag || drag.pointerId !== event.pointerId) return;
		const deltaY = event.clientY - drag.lastY;
		if (deltaY === 0) return;
		drag.lastY = event.clientY;
		applyDragDeltaRef.current(splitterIndex, deltaY, availableRef.current);
	};

	const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
		const drag = dragRef.current;
		if (!drag || drag.pointerId !== event.pointerId) return;
		const node = rootRef.current;
		if (node?.hasPointerCapture(event.pointerId)) {
			node.releasePointerCapture(event.pointerId);
		}
		dragRef.current = null;
		setIsDragging(false);
	};

	return (
		<div
			ref={rootRef}
			className={`gc-pane-splitter${isDragging ? " gc-pane-splitter--dragging" : ""}`}
			style={style}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={stopDragging}
			onPointerCancel={stopDragging}
			onDoubleClick={onDoubleClick}
			title="Kéo để thay đổi chiều cao pane • Double-click để reset"
		>
			<div className="gc-pane-splitter__handle" />
		</div>
	);
}
