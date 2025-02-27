// Imports =======================================================================

import path from "path";
import config from "./server/config.js";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import busboy from "connect-busboy";
import router from "./server/router.js";

// Declarations =======================================================================

const app = express();
const { json, urlencoded } = bodyParser;
const port = config.port || 9201;
const currentDirectory = path.resolve(process.cwd());


// Config =======================================================================

app.set("x-powered-by", false);
app.set("root", currentDirectory);
app.use(json({ limit: "50mb" }));
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(busboy()); 

// Routes =======================================================================

app.use(router);
app.use("/media", express.static(path.join(currentDirectory, "/client/media")));
app.use(express.static(path.join(currentDirectory, "/client/staticpages")));

if (config.mode === "development") {
	Promise.all([
		import("webpack"),
		import("webpack-dev-middleware"),
		import("./webpack.dev.js")
	])
	.then(([webpack, webpackDevMiddleware, webpackConfig]) => {
		const webpackLoader = webpack.default;
		const middleware = webpackDevMiddleware.default;

		const compilier = webpackLoader(webpackConfig.default);
		app.use(middleware(compilier, { publicPath: "/" }));
	});
}
else {
	app.use(express.static(path.join(currentDirectory, "/client/static")));
}

// listen (start app with node server.js) ======================================

app.listen(port, () => {
	console.log(`${ (new Date()).toLocaleDateString() } ${ (new Date()).toLocaleTimeString() }: App listening on port ${port}`);
});
