const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = [
	{
		mode: 'development',
		entry: './electron/main.ts',
		target: 'electron-main',
		resolve: {
			extensions: ['.ts', '.js'],
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: [{ loader: 'ts-loader' }],
				},
				{
					test: /\.node$/,
					loader: 'node-loader',
				},
			],
		},
		output: {
			path: __dirname + '/build',
			filename: 'electron.js',
		},
		// Mark better-sqlite3 as an external module
		externals: {
			'better-sqlite3': 'commonjs better-sqlite3',
		},
	},
	{
		entry: './electron/preload.ts',
		target: 'electron-preload',
		resolve: {
			extensions: ['.ts', '.js'],
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: [{ loader: 'ts-loader' }],
				},
			],
		},
		output: {
			path: __dirname + '/build',
			filename: 'preload.js',
		},
	},
	{
		mode: 'development',
		entry: __dirname + '/src/index.tsx',
		target: 'electron-renderer',
		devtool: 'source-map',
		resolve: {
			extensions: ['.ts', '.tsx', '.js'],
		},
		module: {
			rules: [
				{
					test: /\.node$/,
					use: 'node-loader',
				},
				{
					test: /\.css$/i,
					use: ['style-loader', 'css-loader'],
				},
				{
					test: /\.s[ac]ss$/i,
					use: ['style-loader', 'css-loader', 'sass-loader'],
				},
				{
					test: /\.(js|ts|tsx)$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
					},
				},
				{
					test: /\.(png|jpe?g|gif)$/i,
					loader: 'file-loader',
					options: {
						name: '[path][name].[ext]',
					},
				},
			],
		},
		output: {
			path: __dirname + '/build',
			filename: 'react.js',
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: './public/index.html',
			}),
		],
	},
]
