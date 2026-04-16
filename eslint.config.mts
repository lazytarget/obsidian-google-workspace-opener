/// <reference types="node" />
import { dirname } from "path";
import { fileURLToPath } from "url";
import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";

const recommendedConfig = obsidianmd.configs?.recommended;
const recommendedConfigs = (Array.isArray(recommendedConfig)
	? recommendedConfig
	: recommendedConfig
		? [recommendedConfig]
		: []) as Parameters<typeof tseslint.config>;

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
	{
		files: ["src/**/*.ts", "manifest.json"],
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						'manifest.json'
					]
				},
				tsconfigRootDir,
				extraFileExtensions: ['.json']
			},
		},
	},
	...recommendedConfigs,
	globalIgnores([
		"node_modules",
		"dist",
		"esbuild.config.mjs",
		"eslint.config.mts",
		"eslint.config.js",
		"version-bump.mjs",
		"versions.json",
		"main.js",
	]),
);
