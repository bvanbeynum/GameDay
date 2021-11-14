import client from "superagent";
import jwt from "jsonwebtoken";
import config from "./config.js";
import fs from "fs";
import path from "path";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export default {

	validateAccess: (request, response) => {
		if (!request.query.token) {
			response.redirect("/noaccess.html");
			return;
		}

		client.get(request.protocol + "://" + request.headers.host + "/data/user?usertoken=" + request.query.token)
			.then(clientResponse => {
				if (clientResponse.body.users && clientResponse.body.users.length === 1) {
					const user = clientResponse.body.users[0];

					let ipAddress = (request.headers["x-forwarded-for"] || "").split(",").pop().trim() || 
						request.connection.remoteAddress || 
						request.socket.remoteAddress || 
						request.connection.socket.remoteAddress;
					ipAddress = ipAddress.match(/[^:][\d.]+$/g).join("");

					user.devices.push({
						requestDate: new Date(),
						agent: request.headers["user-agent"],
						ip: ipAddress,
						token: request.query.token
					});

					user.tokens = user.tokens.filter(token => token !== request.query.token);

					client.post(request.protocol + "://" + request.headers.host + "/data/user")
						.send({ user: user })
						.then(clientResponse => {

							const encryptedToken = jwt.sign({ token: request.query.token }, config.jwt);
							response.cookie("gd", encryptedToken, { maxAge: 999999999999 });
							response.redirect("/");

						})
				}
				else {
					response.redirect("/noaccess.html");
				}
			})
			.catch((error) => {
				response.redirect("/noaccess.html");
			});
	},

	authenticate: (request, response, next) => {
		if (
			request.url.toLowerCase().startsWith("/noaccess.html") ||
			request.url.toLowerCase().startsWith("/data") ||
			request.url.toLowerCase().startsWith("/access")
			) {
			next();
		}
		else if (request.cookies.gd) {
			try {
				const tokenData = jwt.verify(request.cookies.gd, config.jwt);

				if (tokenData.token) {
					client.get(request.protocol + "://" + request.headers.host + "/data/user?devicetoken=" + tokenData.token)
						.then(clientResponse => {
							if (clientResponse.body.users && clientResponse.body.users.length === 1) {
								request.user = clientResponse.body.users[0];
								next();
							}
							else {
								response.redirect("/noaccess.html");
							}
						})
						.catch(() => {
							response.redirect("/noaccess.html");
						});
				}
			}
			catch (error) {
				response.redirect("/noaccess.html");
			}
		}
		else {
			response.redirect("/noaccess.html");
		}
	},

	divisionsLoad: (request, response) => {
		client.get(request.protocol + "://" + request.headers.host + "/data/team?managed=true")
			.then(clientResponse => {
				const output = {
					teams: clientResponse.body.teams
				}

				response.status(200).json(output);
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			})
	},

	scheduleLoad: (request, response) => {
		if (!request.query.divisionid) {
			response.status(550).json({ error: "Missing division" });
			return;
		}

		client.get(`${ request.protocol }://${ request.headers.host }/data/team?divisionid=${ request.query.divisionid }`)
			.then(clientReponse => {
				const output = {
					user: {
						firstName: request.user.firstName,
						lastName: request.user.lastName,
						modules: request.user.modules
					},
					teams: clientReponse.body.teams
				}

				client.get(`${ request.protocol }://${ request.headers.host }/data/player?divisionid=${ request.query.divisionid }`)
					.then(clientResponse => {
						const players = clientResponse.body.players;

						output.teams = output.teams.map(team => ({
							...team,
							players: players.filter(player => player.team && player.team.id === team.id)
						}));

						client.get(`${ request.protocol }://${ request.headers.host }/data/game?divisionid=${ request.query.divisionid }`)
							.then(clientReponse => {
								output.games = clientReponse.body.games;
		
								response.status(200).json(output);
							})
							.catch(error => {
								response.status(561).json({ error: error.message });
							});

					})
					.catch(error => {
						response.status(562).json({ error: error.message });
					})

			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			});
	},

	gameSave: (request, response) => {
		if (!request.body.game) {
			response.statusMessage = "Missing game to save";
			response.status(550).json({ error: "Missing game to save" });
			return;
		}

		client.post(`${ request.protocol }://${ request.headers.host }/data/game`)
			.send({ game: request.body.game })
			.then(clientResponse => {
				response.status(200).json({ id: clientResponse.body.id });
			})
			.catch(error => {
				response.statusMessage = error.message;
				response.status(560).json({ error: error.message });
			});
	},

	videoPlayerUpload: (request, response) => {
		request.busboy.on("file", (fieldName, file, fileName) => {
			file.pipe(fs.createWriteStream(path.join(request.app.get("root"), "client/media/video/" + fileName)));
		});
		
		request.busboy.on("finish", () => {
			response.status(200).json({status: "ok"});
		});
		
		request.pipe(request.busboy);
	},

	videoPlayerLoad: (request, response) => {
		
		client.get(`${ request.protocol }://${ request.headers.host }/data/team?divisionid=${ request.query.divisionid }&managed=true`)
			.then(clientResponse => {
				if (!clientResponse.body.teams || clientResponse.body.teams.length !== 1) {
					response.statusMessage = "Unable to retrieve managed team";
					response.status(562).json({ error: "Unable to retrieve managed team" });
					return;
				}

				const output = { 
					user: {
						firstName: request.user.firstName,
						lastName: request.user.lastName,
						modules: request.user.modules,
						team: clientResponse.body.teams[0]
					}
				};

				const videoPath = path.join(request.app.get("root"), "client/media/video");
				fs.readdir(videoPath, (error, files) => {
					
					if (error) {
						response.status(560).json({ error: error.message });
						response.end();
					}
					else {
						output.files = files.filter(file => /.mp4/i.test(file))
								.map(file => {
									const { mtime } = fs.statSync(`${ videoPath }/${ file }`);

									return {
										name: file,
										modified: mtime,
										thumb: fs.existsSync(`${ videoPath }/${ file.replace(/.mp4/i, ".png") }`) ? file.replace(/.mp4/i, ".png") : null
									};
								})

						response.status(200).json(output);
					}
					
				});
			})
			.catch(error => {
				response.status(561).json({ error: error.message });
			});
	}

}