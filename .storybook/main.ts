const config = {
	stories: ["../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	typescript: {
		reactDocgen: false,
	},
};

export default config;