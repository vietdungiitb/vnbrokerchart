import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "cjs"],
	dts: true,
	splitting: true,
	sourcemap: true,
	clean: true,
	treeshake: true,
	outExtension({ format }) {
		return { js: format === "cjs" ? ".cjs" : ".js" };
	},
	external: [
		/^react$/,
		/^react-dom$/,
		/^d3(-|$)/,
		/^prop-types$/,
		/^debug$/,
		/^lodash\.flattendeep$/,
		/^save-svg-as-png$/,
	],
});