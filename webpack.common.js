import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
	entry: {
		index: "./client/src/index.jsx",
		schedule: "./client/src/schedule.jsx",
		videoPlayer: "./client/src/videoplayer.jsx",
		eval: "./client/src/eval.jsx",
		playermanage: "./client/src/playermanage.jsx",
		draft: "./client/src/draft.jsx",
		emailManage: "./client/src/emailmanage.jsx",
		emailEdit: "./client/src/emailedit.jsx",
		userManage: "./client/src/usermanage.jsx"
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
		}),
		new HtmlWebpackPlugin({
			filename: "eval.html",
			title: "Game Day - Evaluation",
			favicon: "./client/src/components/favicon.ico",
			meta: {
				viewport: "width=device-width, initial-scale=1"
			},
			chunks: [ "eval" ],
			templateContent: "<html><body><div id='root'></div></body></html>"
		}),
		new HtmlWebpackPlugin({
			filename: "playermanage.html",
			title: "Game Day - Player Management",
			favicon: "./client/src/components/favicon.ico",
			meta: {
				viewport: "width=device-width, initial-scale=1"
			},
			chunks: [ "playermanage" ],
			templateContent: "<html><body><div id='root'></div></body></html>"
		}),
		new HtmlWebpackPlugin({
			filename: "draft.html",
			title: "Game Day - Draft",
			favicon: "./client/src/components/favicon.ico",
			meta: {
				viewport: "width=device-width, initial-scale=1"
			},
			chunks: [ "draft" ],
			templateContent: "<html><body><div id='root'></div></body></html>"
		}),
		new HtmlWebpackPlugin({
			filename: "emailmanage.html",
			title: "Game Day - Email",
			favicon: "./client/src/components/favicon.ico",
			meta: {
				viewport: "width=device-width, initial-scale=1"
			},
			chunks: [ "emailManage" ],
			templateContent: "<html><body><div id='root'></div></body></html>"
		}),
		new HtmlWebpackPlugin({
			filename: "emailedit.html",
			title: "Game Day - Email",
			favicon: "./client/src/components/favicon.ico",
			meta: {
				viewport: "width=device-width, initial-scale=1"
			},
			chunks: [ "emailEdit" ],
			templateContent: "<html><body><div id='root'></div></body></html>"
		}),
		new HtmlWebpackPlugin({
			filename: "usermanage.html",
			title: "Game Day - User Management",
			favicon: "./client/src/components/favicon.ico",
			meta: {
				viewport: "width=device-width, initial-scale=1"
			},
			chunks: [ "userManage" ],
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
