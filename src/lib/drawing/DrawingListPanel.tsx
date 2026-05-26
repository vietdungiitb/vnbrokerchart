import { useMemo, useState } from "react";
import type { DrawingObject } from "./types";

export interface DrawingListPanelLabels {
	title: string;
	empty: string;
	alert: string;
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

type DrawingListLeafNode = {
	kind: "leaf";
	drawing: DrawingObject;
};

type DrawingListGroupNode = {
	kind: "group";
	key: string;
	label: string;
	children: DrawingListLeafNode[];
};

type DrawingListSectionChild = DrawingListLeafNode | DrawingListGroupNode;

type DrawingListSectionNode = {
	kind: "section";
	key: string;
	label: string;
	children: DrawingListSectionChild[];
};

type DrawingListTreeNode = DrawingListLeafNode | DrawingListGroupNode | DrawingListSectionNode;

function normalizeMetaValue(value: string | undefined) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
}

function getGroupKey(scopeKey: string, label: string) {
	return `${scopeKey}:${label}`;
}

function ensureGroupNode(
	children: Array<DrawingListTreeNode | DrawingListSectionChild>,
	groupMap: Map<string, DrawingListGroupNode>,
	key: string,
	label: string,
) {
	let groupNode = groupMap.get(key);
	if (!groupNode) {
		groupNode = {
			kind: "group",
			key,
			label,
			children: [],
		};
		groupMap.set(key, groupNode);
		children.push(groupNode);
	}
	return groupNode;
}

function buildDrawingTree(drawings: readonly DrawingObject[]) {
	const tree: DrawingListTreeNode[] = [];
	const sectionMap = new Map<string, DrawingListSectionNode>();
	const sectionGroupMaps = new Map<string, Map<string, DrawingListGroupNode>>();
	const rootGroupMap = new Map<string, DrawingListGroupNode>();

	for (const drawing of drawings) {
		const paneLabel = normalizeMetaValue(drawing.paneId);
		const groupLabel = normalizeMetaValue(drawing.groupId);
		const leafNode: DrawingListLeafNode = {
			kind: "leaf",
			drawing,
		};

		if (paneLabel) {
			let sectionNode = sectionMap.get(paneLabel);
			if (!sectionNode) {
				sectionNode = {
					kind: "section",
					key: `section:${paneLabel}`,
					label: paneLabel,
					children: [],
				};
				sectionMap.set(paneLabel, sectionNode);
				tree.push(sectionNode);
			}

			if (!groupLabel) {
				sectionNode.children.push(leafNode);
				continue;
			}

			let groupMap = sectionGroupMaps.get(sectionNode.key);
			if (!groupMap) {
				groupMap = new Map<string, DrawingListGroupNode>();
				sectionGroupMaps.set(sectionNode.key, groupMap);
			}
			const groupNode = ensureGroupNode(sectionNode.children, groupMap, getGroupKey(sectionNode.key, groupLabel), groupLabel);
			groupNode.children.push(leafNode);
			continue;
		}

		if (!groupLabel) {
			tree.push(leafNode);
			continue;
		}

		const groupNode = ensureGroupNode(tree, rootGroupMap, getGroupKey("root", groupLabel), groupLabel);
		groupNode.children.push(leafNode);
	}

	return tree;
}

function countTreeDrawings(node: DrawingListTreeNode | DrawingListSectionChild): number {
	switch (node.kind) {
		case "leaf":
			return 1;
		case "group":
			return node.children.length;
		case "section":
			return node.children.reduce((total, child) => total + countTreeDrawings(child), 0);
	}
}

function nodeContainsSelection(node: DrawingListTreeNode | DrawingListSectionChild, selectedId: string | null): boolean {
	if (!selectedId) {
		return false;
	}

	switch (node.kind) {
		case "leaf":
			return node.drawing.id === selectedId;
		case "group":
			return node.children.some((child) => nodeContainsSelection(child, selectedId));
		case "section":
			return node.children.some((child) => nodeContainsSelection(child, selectedId));
	}
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
	const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
	const tree = useMemo(() => buildDrawingTree(drawings), [drawings]);

	function toggleNode(key: string) {
		setCollapsedNodes((current) => ({
			...current,
			[key]: !current[key],
		}));
	}

	function renderLeaf(node: DrawingListLeafNode) {
		const drawing = node.drawing;
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
					{drawing.alert?.enabled ? <span className="rsc-drawing-list-panel__badge">{labels.alert}</span> : null}
					{drawing.paneId ? <span className="rsc-drawing-list-panel__badge">{drawing.paneId}</span> : null}
					{drawing.yScaleId ? <span className="rsc-drawing-list-panel__badge">{drawing.yScaleId}</span> : null}
					<span className="rsc-drawing-list-panel__badge">{hidden ? labels.hidden : labels.visible}</span>
					{locked ? <span className="rsc-drawing-list-panel__badge">{labels.locked}</span> : null}
					<button type="button" className="rsc-drawing-list-panel__icon" onClick={() => onToggleVisible(drawing.id)}>{hidden ? labels.visible : labels.hidden}</button>
					<button type="button" className="rsc-drawing-list-panel__icon" onClick={() => onDelete(drawing.id)} disabled={locked}>{labels.delete}</button>
				</div>
			</div>
		);
	}

	function renderGroup(node: DrawingListGroupNode) {
		const collapsed = collapsedNodes[node.key] === true;
		const selected = nodeContainsSelection(node, selectedId);

		return (
			<div
				key={node.key}
				className={`rsc-drawing-list-panel__item rsc-drawing-list-panel__group${selected ? " rsc-drawing-list-panel__item--selected" : ""}`}
			>
				<div className="rsc-drawing-list-panel__groupHeader">
					<button
						type="button"
						className="rsc-drawing-list-panel__toggle"
						onClick={() => toggleNode(node.key)}
						aria-expanded={!collapsed}
						aria-label={node.label}
					>
						{collapsed ? "▸" : "▾"}
					</button>
					<div className="rsc-drawing-list-panel__groupTitle">
						<strong>{node.label}</strong>
						<span>{countTreeDrawings(node)}</span>
					</div>
				</div>
				{!collapsed && <div className="rsc-drawing-list-panel__body">{node.children.map((child) => renderLeaf(child))}</div>}
			</div>
		);
	}

	function renderSection(node: DrawingListSectionNode) {
		const collapsed = collapsedNodes[node.key] === true;
		const selected = nodeContainsSelection(node, selectedId);

		return (
			<div
				key={node.key}
				className={`rsc-drawing-list-panel__item rsc-drawing-list-panel__section${selected ? " rsc-drawing-list-panel__item--selected" : ""}`}
			>
				<div className="rsc-drawing-list-panel__sectionHeader">
					<button
						type="button"
						className="rsc-drawing-list-panel__toggle"
						onClick={() => toggleNode(node.key)}
						aria-expanded={!collapsed}
						aria-label={node.label}
					>
						{collapsed ? "▸" : "▾"}
					</button>
					<div className="rsc-drawing-list-panel__sectionTitle">
						<strong>{node.label}</strong>
						<span>{countTreeDrawings(node)}</span>
					</div>
				</div>
				{!collapsed && <div className="rsc-drawing-list-panel__body">{node.children.map((child) => (child.kind === "leaf" ? renderLeaf(child) : renderGroup(child)))}</div>}
			</div>
		);
	}

	return (
		<div className="rsc-drawing-list-panel" style={{ left, top }}>
			<div className="rsc-drawing-list-panel__header">
				<strong>{labels.title}</strong>
				<span>{drawings.length}</span>
			</div>
			{drawings.length === 0 ? (
				<div className="rsc-drawing-list-panel__empty">{labels.empty}</div>
			) : (
				<div className="rsc-drawing-list-panel__items rsc-drawing-list-panel__tree">
					{tree.map((node) => (node.kind === "leaf" ? renderLeaf(node) : node.kind === "group" ? renderGroup(node) : renderSection(node)))}
				</div>
			)}
		</div>
	);
}
