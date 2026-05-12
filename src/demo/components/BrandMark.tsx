import type { CSSProperties } from "react";

import { getBrandAssetUrl } from "../brand/brand";

export interface BrandMarkProps {
	size?: number;
	className?: string;
	style?: CSSProperties;
}

export function BrandMark({ size = 28, className, style }: BrandMarkProps) {
	return (
		<img
			src={getBrandAssetUrl("mark")}
			alt=""
			aria-hidden="true"
			draggable={false}
			width={size}
			height={size}
			className={className}
			style={style}
		/>
	);
}