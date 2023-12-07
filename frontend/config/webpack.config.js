const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	name: 'main_app',
	entry: './src/index',
	mode: 'development',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: '[name].bundle.js',
		chunkFilename: '[name].bundle.js',
	},
	resolve: {
		extensions: ['.ts', '.tsx'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'esbuild-loader',
				options: {
					loader: 'tsx',
					target: 'es2015',
					tsconfigRaw: require('./tsconfig.json'),
				},
			},
			{
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader' ],
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './public/index.html',
		}),
		new webpack.DefinePlugin({
			'process.env': {
				HOST: JSON.stringify(process.env.HOST)
			}
		})
	],
};
