import client from "superagent";
import jwt from "jsonwebtoken";
import config from "./config.js";
import fs from "fs";
import path from "path";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import nodemailer from "nodemailer";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export default {

	requestAccess: (request, response) => {
		if (!request.body.email || !request.body.email.indexOf("@") < 0) {
			response.statusMessage = "Error";
			response.status(550).send("error");
			return;
		}

		client.get(`${ request.protocol}://${ request.headers.host }/data/user?email=${ request.body.email }`)
			.then(clientResponse => {
				let ipAddress = (request.headers["x-forwarded-for"] || "").split(",").pop().trim() || 
					request.connection.remoteAddress || 
					request.socket.remoteAddress || 
					request.connection.socket.remoteAddress;
				ipAddress = ipAddress.match(/[^:][\d.]+$/g).join("");

				const agent = request.headers["user-agent"],
					domain = request.headers.host,
					token = (Math.random() + 1).toString(36).substring(2,12),
					encryptedToken = jwt.sign({ token: token }, config.jwt),
					userRequest = {
						isActive: true,
						name: request.body.name,
						email: request.body.email,
						device: {
								lastAccess: new Date(),
								agent: agent,
								ip: ipAddress,
								domain: domain,
								token: token
							}
						},
					email = {
							from: "\"Gameday Website\" <bvanbeynum@gmail.com>",
							subject: "Game Day Access Requested",
							html: `Access requested from:<br><br>Domain: ${ domain }<br>IP: ${ ipAddress }<br>Browser: ${ agent }<br><br><a href="http://${ domain }">http://${ domain }</a>`,
							auth: {
								user: "bvanbeynum@gmail.com",
								refreshToken: "1//04K4dB_Z_X1rQCgYIARAAGAQSNwF-L9Irhjcc5YawPcBGv-zZuBiZHm2-s3bgPEJf6VQm6b9eTs7E4iuRbUij6-tzAVYi_3ZXbVU",
								accessToken: "ya29.a0AfH6SMCf0nD3px4QPS-MABYUSpsEEPPdOGAJkvCfOE5eMiuBIUPw-EWunj6wsbEXtJthE16v02r6VWhdcjOaUEmqGFQsD7iEZR26h4B8Lzfh-NAw2OjpfApxfjNz5NEv-JAT6kBTA4J7G2rntClDhTxanW-6_s2y528",
								expires: 3460
							}
						};
				
				if (clientResponse.body.users && clientResponse.body.users.length === 1) {
					userRequest.userId = clientResponse.body.users[0].id;
					email.to = clientResponse.body.users[0].email;
				}
				else {
					email.to = "maildrop444@gmail.com";
				}
				
				client.post(`${ request.protocol }://${ request.headers.host }/data/request`)
					.send({ request: userRequest })
					.then(() => {
						response.cookie("gd", encryptedToken, { maxAge: 999999999999 });
						
						const service = nodemailer.createTransport({
							host: "smtp.gmail.com",
							port: 465,
							secure: true,
							auth: {
								type: "OAuth2",
								clientId: "743032936512-vpikma7crc8dssoah9bv1la06s2sl4a2.apps.googleusercontent.com",
								clientSecret: "EGD193Mwf6kO798wdP9Bq7lf"
							}
						});
						
						service.sendMail(email, (error, mailResponse) => {
							if (error) {
								response.status(561).send("Error");
								return;
							}
							else {
								response.status(200).send("Ok");
								return;
							}
						});
					})
					.catch(() => response.status(562).send("Error"));
					
			})
			.catch(() => response.status(560).send("Error"));
	},
	
	validateAccess: (request, response) => {
		if (!request.query.token) {
			response.redirect("/noaccess.html");
			return;
		}

		client.get(`${request.protocol}://${request.headers.host}/data/user?usertoken=${request.query.token}`)
			.then(clientResponse => {
				if (clientResponse.body.users && clientResponse.body.users.length === 1) {
					const user = clientResponse.body.users[0];

					let ipAddress = (request.headers["x-forwarded-for"] || "").split(",").pop().trim() || 
						request.connection.remoteAddress || 
						request.socket.remoteAddress || 
						request.connection.socket.remoteAddress;
					ipAddress = ipAddress.match(/[^:][\d.]+$/g).join("");

					user.devices.push({
						lastAccess: new Date(),
						agent: request.headers["user-agent"],
						domain: request.headers.host,
						ip: ipAddress,
						token: request.query.token
					});

					user.tokens = user.tokens.filter(token => token !== request.query.token);

					client.post(`${request.protocol}://${request.headers.host}/data/user`)
						.send({ user: user })
						.then(() => {

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
			request.url.toLowerCase().startsWith("/access") ||
			request.url.toLowerCase().startsWith("/requestaccess") ||
			request.url.toLowerCase().startsWith("/api/videoplayerupload")
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
								request.user.devices = request.user.devices.map(device => ({
									...device,
									lastAccess: tokenData.token === device.token ? new Date() : device.lastAccess
								}));
								request.serverPath = `${ request.protocol }://${ request.headers.host }`;

								client.post(`${ request.serverPath }/data/user`)
									.send({ user: request.user })
									.then(() => {})
									.catch(() => {});

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

	loadState: (request, response, next) => {
		const divisionId = request.cookies.division;

		if (divisionId) {
			client.get(`${ request.protocol }://${ request.headers.host }/data/team?divisionid=${ divisionId }&managed=true`)
				.then(clientResponse => {
					if (clientResponse.body.teams && clientResponse.body.teams.length === 1) {
						request.division = clientResponse.body.teams[0].division;
						request.team = clientResponse.body.teams[0];
					}

					next();
				})
				.catch(() => {
					next();
				})
		}
		else {
			next();
		}
	},

	divisionsLoad: (request, response) => {
		client.get(request.protocol + "://" + request.headers.host + "/data/team")
			.then(clientResponse => {
				const output = {
					teams: clientResponse.body.teams.filter(team => request.user.teams && request.user.teams.some(userTeam => userTeam === team.id))
				}

				response.status(200).json(output);
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			})
	},

	divisionSave: (request, response) => {
		if (!request.body.teamdivision) {
			response.statusMessage = "Missing division and team to save";
			response.status(550).json({ error: "Missing division and team to save" });
			return;
		}

		const newDivision = {
			name: request.body.teamdivision.name,
			year: request.body.teamdivision.year,
			season: request.body.teamdivision.season
		};

		client.post(`${ request.protocol }://${ request.headers.host }/data/division`)
			.send({ division: newDivision })
			.then(clientResponse => {
				newDivision.id = clientResponse.body.id;
				
				const newTeam = {
					division: newDivision,
					name: request.body.teamdivision.teamName,
					coach: request.body.teamdivision.teamCoach,
					isManaged: true
				};

				client.post(`${ request.protocol }://${ request.headers.host }/data/team`)
					.send({ team: newTeam })
					.then(() => {

						client.get(`${ request.protocol }://${ request.headers.host }/data/team?managed=true`)
							.then(clientResponse => {

								response.status(200).json({ teams: clientResponse.body.teams });
								
							})
							.catch(error => {
								response.statusMessage = error.message;
								response.status(562).json({ error: error.message });
							});

					})
					.catch(error => {
						response.statusMessage = error.message;
						response.status(561).json({ error: error.message });
					});
			})
			.catch(error => {
				response.statusMessage = error.message;
				response.status(560).json({ error: error.message });
			});
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

	teamSave: (request, response) => {
		if (!request.body.team) {
			response.statusMessage = "Missing team to save";
			response.status(550).json({ error: "Missing team to save" });
			return;
		}

		client.post(`${ request.protocol }://${ request.headers.host }/data/team`)
			.send({ team: request.body.team })
			.then(clientReponse => {
				response.status(200).json({ id: clientReponse.body.id });
			})
			.catch(error => {
				response.statusMessage = error.message;
				response.status.json({ error: error.message });
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
		if (!request.query.divisionid) {
			response.status(560).json({ error: "Missing division" });
			return;
		}

		const today = new Date(),
			folderName = `${ today.getFullYear() }-${ (today.getMonth() + 1 + "").padStart(2, "0") }-${ today.getDate() }`,
			videoPath = path.join(request.app.get("root"), `client/media/video/${ request.query.divisionid }/${ folderName }`);

		if (!fs.existsSync(videoPath)) {
			fs.mkdirSync(videoPath, { recursive: true });
		}

		const files = fs.readdirSync(`${ videoPath }`),
			videoCount = files.filter(file => /.mp4$/i.test(file)).length,
			fileName = (videoCount + 1) + "";

		request.busboy.on("file", (fieldName, file, uploadName) => {
			if (!/.mp4$/i.test(uploadName)) {
				response.status(561).json({ error: "File is not an mp4 file" });
				return;
			}

			file.pipe(fs.createWriteStream(`${ videoPath }/${ fileName }.mp4`));
		});
		
		request.busboy.on("finish", () => {
			const converter = ffmpeg(`${ videoPath }/${ fileName }.mp4`).outputOptions("-frames 1");

			converter.output(`${ videoPath }/${ fileName }.jpg`)
				.on("end", () => {
					response.status(200).json({status: "ok"});
				})
				.on("error", error => {
					console.log(`error: ${ error.message }`);
					response.status(562).json({ error: error.message });
				})
				.run();
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

				const divisionPath = path.join(request.app.get("root"), `client/media/video/${ request.division.id }`);
				fs.readdir(divisionPath, (error, files) => {
					if (error) {
						response.status(560).json({ error: error.message });
						return;
					}

					const folders = files.filter(file => /[\d]{2,4}-[\d]{1,2}-[\d]{1,2}/.test(file));
					
					output.videos = folders.map(folder => {
						const files = fs.readdirSync(`${ divisionPath}/${ folder }`);
						
						return {
							date: new Date(Date.parse(folder)),
							files: files
								.filter(file => /.mp4/i.test(file))
								.map(file => ({
									name: file,
									path: `/media/video/${ request.division.id }/${ folder }`,
									folder: folder,
									thumb: fs.existsSync(`${ divisionPath }/${ folder }/${ file.replace(/.mp4/i, ".jpg") }`) ? file.replace(/.mp4/i, ".jpg") : null
								}))
						};
					});

					response.status(200).json(output);
				});
			})
			.catch(error => {
				response.status(561).json({ error: error.message });
			});
	},

	videoPlayerExport: (request, response) => {
		if (!request.body.export) {
			response.statusMessage = "Missing data to export";
			response.status(550).json({ error: "Missing data to export" });
			return;
		}

		const divisionPath = path.join(request.app.get("root"), `client/media/video/${ request.division.id }`),
			outputFile = Date.now() + ".jpeg",
			exportOptions = request.body.export;
		
		const converter = ffmpeg(`${ divisionPath }/${ exportOptions.folder }/${ exportOptions.fileName }`)
			.outputOptions(
				"-vf",
				"scale=180:-1," + 
				"framerate=fps=10"
			)
			.setStartTime(+exportOptions.start)
			.setDuration((+exportOptions.end - +exportOptions.start));
		
		converter.output(path.join(request.app.get("root"), "client/media/video/temp/" + outputFile))
			.on("end", () => {
				
				const fileData = fs.statSync(path.join(request.app.get("root"), "client/media/video/temp/" + outputFile));
				const fileSizeInBytes = fileData.size;
				const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
				
				response.status(200).json({ fileName: outputFile, size: fileSizeInMegabytes });
				
			})
			.on("error", (error) => {
				response.status(561).json({ error: error.message });
			})
			.run();
	},

	evaluationLoad: (request, response) => {
		const divisionId = request.query.divisionid || request.cookies.division;

		client.get(`${ request.protocol }://${ request.headers.host }/data/player?divisionid=${ divisionId }`)
			.then(clientResponse => {
				
				const output = { 
					user: {
						firstName: request.user.firstName,
						lastName: request.user.lastName,
						modules: request.user.modules,
						division: request.team ? request.team.division : null,
						team: request.team ? { id: request.team.id, name: request.team.name, coach: request.team.coach } : null
					},
					players: clientResponse.body.players
				};

				response.status(200).json(output);

			})
			.catch(error => {
				response.status(561).json({ error: error.message });
			});
	},

	evaluationSave: (request, response) => {
		if (!request.body.player) {
			response.statusMessage = "Missing player to save";
			response.status(550).json({ error: "Missing player to save" });
			return;
		}

		client.post(`${ request.protocol }://${ request.headers.host }/data/player`)
			.send({ player: request.body.player })
			.then(clientResponse => {
				response.status(200).json({ id: clientResponse.body.id });
			})
			.catch(error => {
				console.log(error);
				response.statusMessage = error.message;
				response.status(560).json({ error: error.message });
			});
	},

	playerManageLoad: (request, response) => {

		client.get(`${ request.protocol }://${ request.headers.host }/data/player?divisionid=${ request.cookies.division }`)
			.then(clientResponse => {

				const output = {
					user: {
						firstName: request.user.firstName,
						lastName: request.user.lastname,
						modules: request.user.modules,
						division: request.team ? request.team.division : null,
						team: request.team ? { id: request.team.id, name: request.team.name, coach: request.team.coach } : null
					},
					players: clientResponse.body.players
				};

				client.get(`${ request.protocol }://${ request.headers.host }/data/player`)
					.then(clientResponse => {
						output.attributes = [... new Set(clientResponse.body.players.map(player => Object.keys(player)).flat()) ]
							.filter(attribute => attribute !== "id")
							.sort((attributeA, attributeB) => attributeA.toLowerCase() > attributeB.toLowerCase() ? 1 : -1);

						response.status(200).json(output);
					})
					.catch(error => response.status(562).json({ error: error.message }))
			})
			.catch(error => response.status(561).json({ error: error.message }));
	},

	playerManageSave: (request, response) => {
		if (!request.body.saveplayers) {
			response.statusMessage = "Missing player list to save";
			response.status(550).json({ error: "Missing player list to save" });
			return;
		}

		const output = { requestCount: 0, completeCount: 0, error: [], response: [] };

		request.body.saveplayers.forEach(player => {
			output.requestCount++;
			client.post(`${ request.protocol }://${ request.headers.host }/data/player`)
				.send({ player: player })
				.end(onComplete);
		})
		
		function onComplete(error, clientResponse) {
			if (error) {
				output.error.push(error.message);
			}
			else {
				output.response.push(clientResponse.body.id);
			}

			output.completeCount++;
			if (output.requestCount === output.completeCount) {
				client.get(`${ request.protocol }://${ request.headers.host }/data/player?divisionid=${ request.cookies.division }`)
					.then(clientResponse => {
						response.status(200).json({ players: clientResponse.body.players });
					})
					.catch(error => response.status(561).json({ error: error.message }));
			}
		}
	},

	playerManageDelete: (request, response) => {
		if (!request.body.playerids) {
			response.statusMessage = "Missing player IDs to delete";
			response.status(550).json({ error: response.statusMessage });
			return;
		}

		const output = { deleteCount: 0, completeCount: 0, error: [] };

		request.body.playerids.forEach(playerId => {
			output.deleteCount++;
			client.delete(`${ request.protocol }://${ request.headers.host }/data/player?id=${ playerId }`)
				.end(onComplete);
		});

		function onComplete(error) {
			if (error) {
				output.error.push(error.message);
			}

			output.completeCount++;
			if (output.deleteCount === output.completeCount) {
				client.get(`${ request.protocol }://${ request.headers.host }/data/player?divisionid=${ request.division.id }`)
					.then(clientResponse => {
						response.status(200).json({ players: clientResponse.body.players });
					})
					.catch(error => response.status(561).json({ error: error.message }));
			}
		}
	},

	draftLoad: (request, response) => {
		
		client.get(`${ request.protocol }://${ request.headers.host }/data/team?divisionid=${ request.division.id }`)
			.then(clientResponse => {
				const output = {
					user: {
						firstName: request.user.firstName,
						lastName: request.user.lastName,
						modules: request.user.modules,
						division: request.division,
						team: request.team ? { id: request.team.id, name: request.team.name, coach: request.team.coach } : null
					},
					teams: clientResponse.body.teams.map(team => (({ id, division, draftRound, coach, name }) => ({ id, division, draftRound, coach, name }))(team))
				};

				client.get(`${ request.protocol }://${ request.headers.host }/data/player?divisionid=${ request.division.id }`)
					.then(clientResponse => {
						output.players = clientResponse.body.players;

						response.status(200).json(output);
					})
					.catch(error => response.status(562).json({ error: error.message }));
			})
			.catch(error => response.status(561).json({ error: error.message }));

	},

	draftRefresh: (request, response) => {
		if (!request.query.version) {
			response.statusMessage = "Missing version";
			response.status(550).json({ error: "Missing version" });
			return;
		}

		if (request.body.team) {
			// Update draft round
			if (!request.body.team.id) {
				response.statusMessage = "Invalid team";
				response.status(561).json({ error: "Invalid team" });
				return;
			}

			client.post(`${ request.protocol }://${ request.headers.host }/data/team`)
				.send({ team: {
					id: request.body.team.id,
					draftRound: request.body.team.draftRound || null
				} })
				.then(() => {
					loadDraft();
				})
				.catch(error => {
					response.statusMessage = error.message;
					response.status(562).json({ error: error.message });
					return;
				});
		}
		else if (request.body.players) {
			// Update draft picks
			const status = { queued: 0, updated: 0 };

			request.body.players.forEach(player => {
				status.queued++;

				client.post(`${ request.protocol }://${ request.headers.host }/data/player`)
					.send({ player: {
						id: player.id,
						draftPick: player.draftPick || null,
						team: player.team || null
					} })
					.end(() => {
						status.updated++;

						if (status.queued == status.updated) {
							loadDraft();
						}
					});
			})
		}
		else {
			// Refresh data
			loadDraft();
		}
		
		function loadDraft() {
			client.get(`${ request.protocol }://${ request.headers.host }/data/team?divisionid=${ request.division.id }`)
				.then(clientResponse => {
					const output = {
						version: request.query.version,
						teams: clientResponse.body.teams.map(team => (({ id, draftRound }) => ({ id, draftRound }))(team))
					};

					client.get(`${ request.protocol }://${ request.headers.host }/data/player?divisionid=${ request.division.id }`)
						.then(clientResponse => {
							output.players = clientResponse.body.players.map(player =>
								(({ id, draftPick, team }) => ({ id, draftPick, team }))(player)
								);

							response.status(200).json(output);
						})
						.catch(error => response.status(566).json({ error: error.message }));
				})
				.catch(error => response.status(565).json({ error: error.message }));
		}
	},

	emailManageLoad: (request, response) => {
		const output = {
			user: (
				({ firstName, lastName, modules }) => ({ firstName, lastName, modules, division: request.division, team: request.team })
				)(request.user)
		};

		client.get(`${ request.protocol }://${ request.headers.host }/data/location`)
			.then(clientResponse => {
				output.locations = clientResponse.body.locations;

				client.get(`${ request.protocol }://${ request.headers.host }/data/emaillist?divisionid=${ request.division.id }`)
					.then(clientResponse => {
						output.emailLists = clientResponse.body.emailLists;
						
						client.get(`${ request.protocol }://${ request.headers.host }/data/email?divisionid=${ request.division.id }`)
							.then(clientResponse => {
								output.emails = clientResponse.body.emails.map(({ emailText, ...email }) => email);

								response.status(200).json(output);
							})
							.catch(error => response.status(563).json({ error: error.message }));
					})
					.catch(error => response.status(562).json({ error: error.message }));
			})
			.catch(error => response.status(561).json({ error: error.message }));
	},

	emailManageSave: (request, response) => {
		const saveStatus = { 
				emailLists: { queued: 0, complete: 0},
				emailListDelete: { queued: 0, complete: 0 },
				locations: { queued: 0, complete: 0},
				locationDelete: { queued: 0, complete: 0 }
			},
			output = { emailLists: [], locations: [] };
		
		const onComplete = () => {
			if (
				saveStatus.emailLists.queued === saveStatus.emailLists.complete && 
				saveStatus.emailListDelete.queued === saveStatus.emailListDelete.complete &&
				saveStatus.locations.queued === saveStatus.locations.complete &&
				saveStatus.locationDelete.queued === saveStatus.locationDelete.complete
				) {

				client.get(`${ request.protocol }://${ request.headers.host }/data/location`)
					.then(clientResponse => {
						output.locations = clientResponse.body.locations;
		
						client.get(`${ request.protocol }://${ request.headers.host }/data/emaillist?divisionid=${ request.division.id }`)
							.then(clientResponse => {
								output.emailLists = clientResponse.body.emailLists;
								
								response.status(200).json(output);
							})
							.catch(error => response.status(562).json({ error: error.message }));
					})
					.catch(error => response.status(561).json({ error: error.message }));
					
			}
		};

		if (request.body.emaillists) {
			request.body.emaillists.forEach(emailList => {
				saveStatus.emailLists.queued++;

				client.post(`${ request.protocol }://${ request.headers.host }/data/emaillist`)
					.send({ emaillist: emailList })
					.then(() => {
						saveStatus.emailLists.complete++;
						onComplete();
					});
			});
		}

		if (request.body.emaillistdelete) {
			request.body.emaillistdelete.forEach(emailList => {
				saveStatus.emailListDelete.queued++;

				client.delete(`${ request.protocol }://${ request.headers.host }/data/emaillist?id=${ emailList }`)
					.then(() => {
						saveStatus.emailListDelete.complete++;
						onComplete();
					})
			})
		}

		if (request.body.locations) {
			request.body.locations.forEach(location => {
				saveStatus.locations.queued++;
				
				client.post(`${ request.protocol }://${ request.headers.host }/data/location`)
					.send({ location: location })
					.then(() => {
						saveStatus.locations.complete++;
						onComplete();
					});
			})
		}

		if (request.body.locationdelete) {
			request.body.locationdelete.forEach(location => {
				saveStatus.locationDelete.queued++;

				client.delete(`${ request.protocol }://${ request.headers.host }/data/location?id=${ location }`)
					.then(() => {
						saveStatus.locationDelete.complete++;
						onComplete();
					})
			})
		}

	},

	emailEditLoad: (request, response) => {
		const output = {
			user: (
				({ firstName, lastName, modules }) => ({ firstName, lastName, modules, division: request.division, team: request.team })
				)(request.user)
		};

		client.get(`${ request.protocol }://${ request.headers.host }/data/location`)
			.then(clientResponse => {
				output.locations = clientResponse.body.locations;

				client.get(`${ request.protocol }://${ request.headers.host }/data/emaillist?divisionid=${ request.division.id }`)
					.then(clientResponse => {
						output.emailLists = clientResponse.body.emailLists;
						
						if (request.query.id) {
							client.get(`${ request.protocol }://${ request.headers.host }/data/email?id=${ request.query.id }`)
								.then(clientResponse => {
									output.emailText = clientResponse.body.emails[0].emailText;

									response.status(200).json(output);
								})
								.catch(error => response.status(563).json({ error: error.message }));
						}
						else {
							response.status(200).json(output);
						}
					})
					.catch(error => response.status(562).json({ error: error.message }));
			})
			.catch(error => response.status(561).json({ error: error.message }));
	},

	emailEditSend: (request, response) => {
		if (!request.body.email) {
			response.statusMessage = "Missing email to send";
			response.status(550).json({ error: "Missing email to send" });
			return;
		}

		const email = request.body.email,
			images = RegExp("<img [\\w =\"]*src=[\"]?([^\" ]+)", "gim"),
			css = RegExp("background:[\w -]*url\([\"]?([^\"]+)[\"]?\)", "gim"),
			attachments = RegExp("<attach [\\w =\"]*src=[\"]?([^\" ]+)[\"]?[\w =\"]*\/>", "gim"),
			emailAttachments = [];
		let matches = null,
			emailBody = email.text,
			subject = (RegExp("<title>([^<]+)</title>", "gi")).exec(emailBody);

		if (!subject) {
			response.statusMessage = "Missing subject";
			response.status(561).json({ error: "Missing subject" });
			return;
		}
		else {
			subject = `${ subject[1] } \uD83C\uDFC8`;
		}

		// Images
		while ((matches = images.exec(emailBody)) != null) {
			let cidName = matches[1].substring(matches[1].lastIndexOf("/") + 1, matches[1].lastIndexOf("."))

			emailAttachments.push({
				fileName: matches[1].substring(matches[1].lastIndexOf("/") + 1),
				path: path.join(request.app.get("root"), `client/${ matches[1] }`),
				cid: cidName
			});
			emailBody = emailBody.replace(matches[1], `cid:${ cidName }`);
		}
		
		// CSS
		while ((matches = css.exec(emailBody)) != null) {
			let cidName = matches[1].substring(matches[1].lastIndexOf("/") + 1, matches[1].lastIndexOf("."))

			emailAttachments.push({
				fileName: matches[1].substring(matches[1].lastIndexOf("/") + 1),
				path: path.join(request.app.get("root"), `client/${ matches[1] }`),
				cid: cidName
			});
			emailBody = emailBody.replace(matches[1], `cid:${ cidName }`);
		}
		
		// Attachments
		while ((matches = attachments.exec(emailBody)) != null) {
			emailAttachments.push({
				fileName: matches[1].substring(matches[1].lastIndexOf("/") + 1),
				path: path.join(request.app.get("root"), `client/${ matches[1] }`)
			});
			
			emailBody = emailBody.replace(matches[0], "");
		}

		const service = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true,
			auth: {
				type: "OAuth2",
				clientId: "743032936512-vpikma7crc8dssoah9bv1la06s2sl4a2.apps.googleusercontent.com",
				clientSecret: "EGD193Mwf6kO798wdP9Bq7lf"
			}
		});
		
		var options = {
			from: "\"Brett van Beynum\" <bvanbeynum@gmail.com>",
			to: email.to,
			subject: subject,
			html: emailBody,
			attachments: emailAttachments,
			auth: {
				user: "bvanbeynum@gmail.com",
				refreshToken: "1//04K4dB_Z_X1rQCgYIARAAGAQSNwF-L9Irhjcc5YawPcBGv-zZuBiZHm2-s3bgPEJf6VQm6b9eTs7E4iuRbUij6-tzAVYi_3ZXbVU",
				accessToken: "ya29.a0AfH6SMCf0nD3px4QPS-MABYUSpsEEPPdOGAJkvCfOE5eMiuBIUPw-EWunj6wsbEXtJthE16v02r6VWhdcjOaUEmqGFQsD7iEZR26h4B8Lzfh-NAw2OjpfApxfjNz5NEv-JAT6kBTA4J7G2rntClDhTxanW-6_s2y528",
				expires: 3460
			}
		};
		
		service.sendMail(options, (error, mailResponse) => {
			if (error) {
				response.status(562).json({error: error.message});
				return;
			}
			else {
				const saveEmail = {
					division: request.division,
					sent: new Date(),
					to: email.to,
					subject: subject,
					emailText: email.text
				};

				client.post(`${ request.protocol }://${ request.headers.host }/data/email`)
					.send({ email: saveEmail })
					.then(clientResponse => {
						response.status(200).json({ emailId: clientResponse.body.id });
					})
					.catch(error => response.status(563).json({ error: error.message }));
			}
		});
	},

	userManageLoad: (request, response) => {
		const output = {
			user: (
				({ firstName, lastName, modules, isAdmin }) => ({ firstName, lastName, modules, isAdmin, division: request.division, team: request.team })
				)(request.user)
		};

		let userFilter = "";
		if (!request.user.isAdmin) {
			userFilter = `&userid=${ request.user.id }`;
		}

		client.get(`${ request.protocol }://${ request.headers.host }/data/request?isactive=true${ userFilter }`)
			.then(clientResponse => {
				output.requests = clientResponse.body.requests;

				client.get(`${ request.protocol }://${ request.headers.host }/data/user`)
					.then(clientResponse => {
						output.requests = output.requests.map(userRequest => ({
							...userRequest,
							user: clientResponse.body.users.find(user => user.id === userRequest.userId)
						}));

						if (request.user.isAdmin) {
								output.users = clientResponse.body.users;
						}
						
						response.status(200).json(output);
					})
					.catch(error => response.status(562).json({ error: error.message }));
			})
			.catch(error => response.status(561).json({ error: error.message }));
	},

	userManageSave: (request, response) => {
		if (request.body.requestaccept) {
			if (!request.body.requestaccept.id) {
				response.statusMessage = "Invalid request to accept/delete";
				response.status(550).json({ error: "Invalid request to accept/delete" });
				return;				
			}

			const getOutput = () => {
				const output = {};

				let userFilter = "";
				if (!request.user.isAdmin) {
					userFilter = `&userid=${ request.user.id }`;
				}
		
				client.get(`${ request.protocol }://${ request.headers.host }/data/request?isactive=true${ userFilter }`)
					.then(clientResponse => {
						output.requests = clientResponse.body.requests;
		
						client.get(`${ request.protocol }://${ request.headers.host }/data/user`)
							.then(clientResponse => {
								output.requests = output.requests.map(userRequest => ({
									...userRequest,
									user: clientResponse.body.users.find(user => user.id === userRequest.userId)
								}));
		
								if (request.user.isAdmin) {
										output.users = clientResponse.body.users;
								}
								
								response.status(200).json(output);
							})
							.catch(error => response.status(565).json({ error: error.message }));
					})
					.catch(error => response.status(564).json({ error: error.message }));
			}

			client.get(`${ request.protocol }://${ request.headers.host }/data/request?id=${ request.body.requestaccept.id }`)
				.then(clientResponse => {
					const userRequest = clientResponse.body.requests[0];

					if (request.body.requestaccept.userId) {
						client.get(`${ request.protocol }://${ request.headers.host }/data/user?id=${ request.body.requestaccept.userId }`)
							.then(clientResponse => {
								const updatedUser = {
									...clientResponse.body.user[0],
									devices: [
										...clientResponse.body.user[0].devices,
										userRequest.device
									]
								}

								client.post(`${ request.protocol }://${ request.headers.host }/data/user`)
									.send({ user: updatedUser })
									.then(() => getOutput())
									.catch(error => response.status(564).json({ error: error.message }));
							})
							.catch(error => response.status(563).json({ error: error.message }));
					}
					else {
						userRequest.isActive = false;

						client.post(`${ request.protocol }://${ request.headers.host }/data/request`)
							.send({ request: userRequest })
							.then(() => getOutput())
							.catch(error => response.status(562).json({ error: error.message }));
					}
				})
				.catch(error => response.status(561).json({ error: error.message }));
		}
	},

	playBookLoad: (request, response) => {
		const output = {
			user: (
				({ firstName, lastName, modules, isAdmin }) => ({ firstName, lastName, modules, isAdmin, division: request.division, team: request.team })
				)(request.user)
		};

		client.get(`${ request.serverPath }/data/playbook?divisionid=${ request.division.id }`)
			.then(clientResponse => {
				output.playBooks = clientResponse.body.playBooks;

				client.get(`${ request.serverPath }/data/play?divisionid=${ request.division.id }`)
					.then(clientResponse => {
						output.plays = clientResponse.body.plays;
						
						response.status(200).json(output);
					})
					.catch(error => response.status(561).json({ error: error.message }));
			})
			.catch(error => response.status(560).json({ error: error.message }));
	},

	playBookSave: (request, response) => {
		if (request.body.playbook) {
			client.post(`${ request.serverPath }/data/playbook`)
				.send({ playbook: request.body.playbook })
				.then(clientResponse => {
					response.status(200).json({ id: clientResponse.body.id });
				})
				.catch(error => response.status(560).json({ error: error.message }));
		}
		else if (request.query.deleteid) {
			client.delete(`${ request.serverPath }/data/playbook?id=${ request.query.deleteid }`)
				.then(() => response.status(200).json({ status: "ok" }))
				.catch(error => response.status(561).json({ error: error }));
		}
		else if (request.query.copyid) {
			client.get(`${ request.serverPath }/data/playbook?id=${ request.query.copyid }`)
				.then(clientResponse => {
					const newPlayBook = { 
						...clientResponse.body.playBooks[0],
						name: clientResponse.body.playBooks[0].name + " - copied",
						id: null
					};

					client.post(`${ request.serverPath }/data/playbook`)
						.send({ playbook: newPlayBook })
						.then(clientResponse => {
							response.status(200).json({ playBook: { ...newPlayBook, id: clientResponse.body.id }, server: clientResponse.body });
						})
						.catch(error => response.status(562).json({ error: error }));
				})
				.catch(error => response.status(561).json({ error: error }));
		}
	},

	playEditorLoad: (request, response) => {
		const output = {
			user: (
				({ firstName, lastName, modules, isAdmin }) => ({ firstName, lastName, modules, isAdmin, division: request.division, team: request.team })
				)(request.user)
		};

		client.get(`${ request.serverPath }/data/playbook?divisionid=${ request.division.id }`)
			.then(clientResponse => {
				output.playBooks = clientResponse.body.playBooks;

				if (request.query.id) {
					client.get(`${ request.serverPath }/data/play?id=${ request.query.id }`)
						.then(clientResponse => {
							output.play = clientResponse.body.plays[0];

							response.status(200).json(output);
						})
						.catch(error => response.status(561).json({ error: error.message }));
				}
				else {
					response.status(200).json(output);
				}
			})
			.catch(error => response.status(560).json({ error: error.message }));
	},

	playEditorSave: (request, response) => {
		const updates = { queue: 0, complete: 0, errors: [] };

		const updateComplete = error => {
			updates.complete++;
			
			if (error) {
				updates.errors.push(error.message);
			}

			if (updates.queue === updates.complete) {
				response.status(200).json({ updateCount: updates.complete, errors: updates.errors });
			}
		}

		if (request.query.deleteid) {
			client.delete(`${ request.serverPath }/data/play?id=${ request.query.deleteid }`)
				.then(() => response.status(200).json({ status: "ok" }))
				.catch(error => response.status(560).json({ error: error.message }));
		}
		else if (request.body.play && request.body.playbooks) {
			client.post(`${ request.serverPath }/data/play`)
				.send({ play: request.body.play })
				.then(() => {

					request.body.playbooks.forEach(playBook => {
						updates.queue++;

						client.post(`${ request.serverPath }/data/playbook`)
							.send({ playbook: playBook})
							.then(() => updateComplete())
							.catch(error => updateComplete(error));
					});
					
				})
				.catch(error => response.status(561).json({ error: error.message }));
		}
		else {
			response.status(200).json({ status: "nothing to update "});
		}
	},

	depthChartLoad: (request, response) => {
		const output = {
			user: (
				({ firstName, lastName, modules, isAdmin }) => ({ firstName, lastName, modules, isAdmin, division: request.division, team: request.team })
				)(request.user)
		};

		client.get(`${ request.serverPath }/data/playbook?id=${ request.query.id }`)
			.then(clientResponse => {
				output.playBook = clientResponse.body.playBooks[0];
				
				client.get(`${ request.serverPath }/data/player?teamid=${ request.team.id }`)
					.then(clientResponse => {
						output.players = clientResponse.body.players.map(player => ({
							id: player.id,
							firstName: player.firstName,
							lastName: player.lastName
						}));

						client.get(`${ request.serverPath }/data/play?divisionid=${ request.division.id }`)
							.then(clientResponse => {
								
								// Get the colors used on the plays already created for the division
								output.colors = [ ...new Set(clientResponse.body.plays.flatMap(play => play.players.flatMap(player => player.color))) ]
									.sort((colorA, colorB) => colorA > colorB ? 1 : -1);
								
								response.status(200).json(output);

							})
							.catch(error => response.status(561).json({ error: error.message }));
					})
					.catch(error => response.status(560).json({ error: error.message }));
			})
			.catch(error => response.status(562).json({ error: error.message }));
	},

	depthChartSave: (request, response) => {
		if (!request.body.playbook) {
			response.statusMessage = "Missing playbook to save";
			response.status(550).json({ error: "Missing playbook to save" });
			return;
		}

		client.post(`${ request.serverPath }/data/playbook`)
			.send({ playbook: request.body.playbook })
			.then(clientResponse => {
				response.status(200).json({ id: clientResponse.body.id });
			})
			.catch(error => response.status(560).json({ error: JSON.stringify(error) }));
	},

	uploadFile: (request, response) => {
		request.busboy.on("file", (fieldName, file, fileName) => {
			const emailFolder = path.join(request.app.get("root"), `client/media/email/`);
			file.pipe(fs.createWriteStream(`${ emailFolder }/${ fileName }`));
		});

		request.busboy.on("finish", () => {
			response.status(200).json({ status: "ok" });
		});

		request.pipe(request.busboy);
	}

}