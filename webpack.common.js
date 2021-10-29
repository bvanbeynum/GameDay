import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
	entry: {
		main: "./client/src/index.jsx"
	},
	plugins: [
		new HtmlWebpackPlugin({ 
			filename: "index.html",
			template: "./client/src/index.html",
			favicon: "./client/src/media/favicon.ico"
		}),
		new HtmlWebpackPlugin({ 
			filename: "noaccess.html",
			template: "./client/src/noaccess.html",
			favicon: "./client/src/media/favicon.ico",
			chunks: []
		}),
		new HtmlWebpackPlugin({
			filename: "working.html",
			template: "./client/src/working.html",
			chunks: []
		})
	],
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/i,
				exclude: /(node_modules|bower_components)/i,
				loader: "babel-loader",
				options: { presets: [ "@babel/env" ]}
			},
			{
				test: /\.css$/i,
				use: [ "style-loader", "css-loader" ]
			},
			{
				test: /\.(png|gif|jpg|ico)$/i,
				type: "asset/resource"
			}
		]
	},
	resolve: { extensions: [ "*", ".js", ".jsx" ]}
};
