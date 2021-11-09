import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
	entry: {
		index: "./client/src/index.jsx",
		schedule: "./client/src/schedule.jsx",
		videoPlayer: "./client/src/videoplayer.jsx"
	},
	plugins: [
		new HtmlWebpackPlugin({ 
			filename: "index.html",
			title: "Game Day",
			favicon: "./client/src/components/favicon.ico",
			meta: {
				viewport: "width=device-width, initial-scale=1"
			},
			chunks: [ "index" ],
			templateContent: "<html><body><div id='root'></div></body></html>"
		}),
		new HtmlWebpackPlugin({ 
			filename: "schedule.html",
			title: "Game Day - Schedule",
			favicon: "./client/src/components/favicon.ico",
			meta: {
				viewport: "width=device-width, initial-scale=1"
			},
			chunks: [ "schedule" ],
			templateContent: "<html><body><div id='root'></div></body></html>"
		}),
		new HtmlWebpackPlugin({
			filename: "videoplayer.html",
			title: "Game Day - Video Player",
			favicon: "./client/src/components/favicon.ico",
			meta: {
				viewport: "width=device-width, initial-scale=1"
			},
			chunks: [ "videoPlayer" ],
			templateContent: "<html><body><div id='root'></div></body></html>"
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
