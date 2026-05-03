import type { ReactNode } from "react";
import {
	frameActionsStyle,
	frameDescriptionStyle,
	frameHeaderStyle,
	frameKickerStyle,
	frameStyle,
	frameTitleStyle,
} from "./chartTheme";

interface StoryFrameProps {
	title: string;
	subtitle: string;
	actions?: ReactNode;
	children: ReactNode;
}

export function StoryFrame({ title, subtitle, actions, children }: StoryFrameProps) {
	return (
		<section style={frameStyle}>
			<header style={frameHeaderStyle}>
				<div>
					<div style={frameKickerStyle}>Ví dụ tương tác</div>
					<h2 style={frameTitleStyle}>{title}</h2>
					<p style={frameDescriptionStyle}>{subtitle}</p>
				</div>
				{actions ? <div style={frameActionsStyle}>{actions}</div> : null}
			</header>
			{children}
		</section>
	);
}