import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";

export default [
	{
		input: "src/index.ts",
		output: [
			{
				file: 'dist/index.js',
				format: "cjs",
				sourcemap: true,
			},
			{
				file: 'dist/index.esm.js',
				format: "esm",
				sourcemap: true,
			},
		],
		plugins: [
			resolve({ extensions: ['.js', '.ts'] }),
			commonjs(),
			json(),
			typescript({
				tsconfig: "./tsconfig.json",
				exclude: [
					'dist',
					'node_modules/**',
				]
			}),
			terser(),
		]
	},
	// Generate TypeScript declaration files
	{
		input: 'dist/index.d.ts',
		output: [{ file: 'dist/index.d.ts', format: 'es' }],
		plugins: [dts()],
	}
];
