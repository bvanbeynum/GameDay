import data from "./schema.js";

export default {

	userGet: (request, response) => {
		const filter = {};

		if (request.query.id) {
			filter["_id"] = request.query.id
		}
		if (request.query.usertoken) {
			filter["tokens"] = request.query.usertoken
		}
		if (request.query.devicetoken) {
			filter["devices.token"] = request.query.devicetoken
		}
		if (request.query.email) {
			filter["email"] = request.query.email;
		}

		data.user.find(filter)
			.lean()
			.exec()
			.then(usersData => {
				const users = usersData.map(({ _id, __v, ...user }) => ({ id: _id, ...user }));
				response.status(200).json({ users: users });
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			});
	},

	userSave: (request, response) => {
		if (!request.body.user) {
			response.status(550).json({ error: "Missing object to save" });
			return;
		}
		
		const userSave = request.body.user;

		if (userSave.id) {
			data.user.findById(userSave.id)
				.exec()
				.then(userData => {
					if (!userData) {
						throw new Error("User not found");
					}

					Object.keys(userSave).forEach(field => {
						if (field != "id") {
							userData[field] = userSave[field];
						}
					})

					return userData.save();
				})
				.then(userData => {
					response.status(200).json({ id: userData._id });
				})
				.catch(error => {
					response.status(570).json({ error: error.message });
				});
		}
		else {
			new data.user({ ...userSave })
				.save()
				.then(userData => {
					response.status(200).json({ id: userData._id });
				})
				.catch(error => {
					response.status(571).json({ error: error.message });
				})
		}
	},

	userDelete: (request, response) => {
		if (!request.query.id) {
			response.status(550).json({ error: "Missing ID to delete" });
			return;
		}

		data.user.deleteOne({ _id: request.query.id })
			.then(() => {
				response.status(200).json({ status: "ok" });
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			});
	},

	requestGet: (request, response) => {
		const filter = {};

		if (request.query.id) {
			filter["_id"] = request.query.id;
		}
		if (request.query.isactive) {
			filter.isActive = request.query.isactive === "true";
		}
		if (request.query.userid) {
			filter.userId = request.query.userid;
		}

		data.request.find(filter)
			.lean()
			.exec()
			.then(requestData => {
				const requests = requestData.map(({ _id, __v, ...user }) => ({ id: _id, ...user}));
				response.status(200).json({ requests: requests });
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			});
	},

	requestSave: (request, response) => {
		if (!request.body.request) {
			response.status(550).json({ error: "Missing object to save" });
			return;
		}

		const requestSave = request.body.request;

		if (requestSave.id) {
			data.request.findById(requestSave.id)
				.exec()
				.then(requestData => {
					if (!requestData) {
						throw new Error("Request not found");
					}

					Object.keys(requestSave).forEach(field => {
						if (field != "id") {
							requestData[field] = requestSave[field];
						}
					})

					return requestData.save();
				})
				.then(requestData => {
					response.status(200).json({ id: requestData["_id"] });
				})
				.catch(error => {
					response.status(561).json({ error: error.message });
				});
		}
		else {
			new data.request({ ...requestSave })
				.save()
				.then(requestData => {
					response.status(200).json({ id: requestData["_id"] });
				})
				.catch(error => {
					response.status(562).json({ error: error.message });
				})
		}
	},
	
	requestDelete: (request, response) => {
		if (!request.query.id) {
			response.status(550).json({ error: "Missing ID to delete" });
			return;
		}

		data.request.deleteOne({ _id: request.query.id })
			.then(() => {
				response.status(200).json({ status: "ok" });
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			});
	},

	divisionGet: (request, response) => {
		const filter = {};

		if (request.query.id) {
			filter._id = request.query.id;
		}

		data.division.find(filter)
			.lean()
			.exec()
			.then(divisionsDb => {
				const output = {
					divisions: divisionsDb.map(({ _id, __v, ...division }) => ({ id: _id, ...division }))
				};

				response.status(200).json(output);
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			});
	},

	divisionSave: (request, response) => {
		if (!request.body.division) {
			response.status(550).json({ error: "Missing object to save" });
			return;
		}

		const divisionSave = request.body.division;

		if (divisionSave.id) {
			data.division.findById(divisionSave.id)
				.exec()
				.then(divisionDb => {
					if (!divisionDb) {
						throw new Error("Division not found");
					}

					Object.keys(divisionSave).forEach(field => {
						if (field != "id") {
							divisionDb[field] = divisionSave[field];
						}
					})

					return divisionDb.save();
				})
				.then(divisionDb => {
					response.status(200).json({ id: divisionDb["_id"] });
				})
				.catch(error => {
					response.status(561).json({ error: error.message });
				});
		}
		else {
			new data.division(divisionSave)
				.save()
				.then(divisionDb => {
					response.status(200).json({ id: divisionDb["_id"] });
				})
				.catch(error => {
					response.status(562).json({ error: error.message });
				})
		}
	},
	
	divisionDelete: (request, response) => {
		if (!request.query.id) {
			response.status(550).json({ error: "Missing ID to delete" });
			return;
		}

		data.division.deleteOne({ _id: request.query.id })
			.then(() => {
				response.status(200).json({ status: "ok" });
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			});
	},

	teamGet: (request, response) => {
		const filter = {};

		if (request.query.id) {
			filter._id = request.query.id;
		}
		if (request.query.name) {
			filter.name = { $regex: new RegExp(request.query.name, "i") };
		}
		if (request.query.divisionid) {
			filter["division.id"] = request.query.divisionid;
		}
		if (request.query.managed) {
			filter.isManaged = true;
		}

		data.team.find(filter)
			.lean()
			.exec()
			.then(teamsDb => {
				
				const output = {
					teams: teamsDb.map(({ _id, __v, ...team }) => ({ id: _id, ...team }))
				};

				response.status(200).json(output);
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			})
	},

	teamSave: (request, response) => {
		if (!request.body.team) {
			response.status(550).json({ error: "Missing object to save" });
			return;
		}

		const teamSave = request.body.team;

		if (teamSave.id) {
			data.team.findById(teamSave.id)
				.exec()
				.then(teamDb => {
					if (!teamDb) {
						throw new Error("Team not found");
					}

					Object.keys(teamSave).forEach(field => {
						if (field != "id") {
							teamDb[field] = teamSave[field];
						}
					})

					return teamDb.save();
				})
				.then(teamDb => {
					response.status(200).json({ id: teamDb["_id"] });
				})
				.catch(error => {
					response.status(561).json({ error: error.message });
				});
		}
		else {
			new data.team(teamSave)
				.save()
				.then(teamDb => {
					response.status(200).json({ id: teamDb["_id"] });
				})
				.catch(error => {
					response.status(562).json({ error: error.message });
				})
		}
	},
	
	teamDelete: (request, response) => {
		if (!request.query.id) {
			response.status(550).json({ error: "Missing ID to delete" });
			return;
		}

		data.team.deleteOne({ _id: request.query.id })
			.then(() => {
				response.status(200).json({ status: "ok" });
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			});
	},

	gameGet: (request, response) => {
		const filter = {};

		if (request.query.id) {
			filter._id = request.query.id;
		}
		if (request.query.date) {
			const day = new Date(Date.parse(request.query.date)),
				endDate = new Date(day);
			
			endDate.setDate(day.getDate() + 1);
			filter.dateTime = { $gte: day, $lt: endDate };
		}
		if (request.query.divisionid) {
			filter["division.id"] = request.query.divisionid;
		}
		if (request.query.teamid) {
			filter.$or = [
				{ "homeTeam.id": request.query.teamid },
				{ "awayTeam.name": request.query.teamid }
			]
		}

		data.game.find(filter)
			.lean()
			.exec()
			.then(gamesDb => {
				const output = {
					games: gamesDb.map(({ _id, __v, ...game }) => ({ id: _id, ...game }))
				};

				response.status(200).json(output);
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			})
	},

	gameSave: (request, response) => {
		if (!request.body.game) {
			response.status(550).json({ error: "Missing object to save" });
			return;
		}

		const gameSave = request.body.game;

		if (gameSave.id) {
			data.game.findById(gameSave.id)
				.exec()
				.then(gameDb => {
					if (!gameDb) {
						throw new Error("Game not found");
					}

					Object.keys(gameSave).forEach(field => {
						if (field != "id") {
							gameDb[field] = gameSave[field];
						}
					})

					return gameDb.save();
				})
				.then(gameDb => {
					response.status(200).json({ id: gameDb["_id"] });
				})
				.catch(error => {
					response.status(561).json({ error: error.message });
				});
		}
		else {
			new data.game(gameSave)
				.save()
				.then(gameDb => {
					response.status(200).json({ id: gameDb["_id"] });
				})
				.catch(error => {
					response.status(562).json({ error: error.message });
				})
		}
	},
	
	gameDelete: (request, response) => {
		if (!request.query.id) {
			response.status(550).json({ error: "Missing ID to delete" });
			return;
		}

		data.game.deleteOne({ _id: request.query.id })
			.then(() => {
				response.status(200).json({ status: "ok" });
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			});
	},

	playerGet: (request, response) => {
		const filter = {};

		if (request.query.id) {
			filter._id = request.query.id;
		}
		if (request.query.divisionid) {
			filter["division.id"] = request.query.divisionid;
		}
		if (request.query.teamid) {
			filter["team.id"] = request.query.teamid;
		}

		const output = {};

		data.player.find(filter)
			.lean()
			.exec()
			.then(playersDb => {
				output.players = playersDb.map(({ _id, __v, ...player }) => ({ id: _id, ...player }));

				return data.player.find().lean().exec();
			})
			.then(playersDb => {
				output.players = output.players.map(player => ({
					...player,
					prev: playersDb.filter(playerAll => 
						player.division
						&& player.firstName
						&& player.parentEmail
						&& playerAll.division
						&& playerAll.firstName
						&& playerAll.parentEmail
						&& player.division.id !== playerAll.division.id
						&& player.parentEmail.toLowerCase() == playerAll.parentEmail.toLowerCase()
						&& player.firstName.toLowerCase() == playerAll.firstName.toLowerCase()
						)
				}));

				response.status(200).json(output);
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			})
	},

	playerSave: (request, response) => {
		if (!request.body.player) {
			response.status(550).json({ error: "Missing object to save" });
			return;
		}

		const playerSave = request.body.player;

		if (playerSave.id) {
			data.player.findById(playerSave.id)
				.exec()
				.then(playerDb => {
					if (!playerDb) {
						throw new Error("Player not found");
					}

					Object.keys(playerSave).forEach(field => {
						if (field != "id" && field != "prev") {
							playerDb[field] = playerSave[field];
						}
					})

					return playerDb.save();
				})
				.then(playerDb => {
					response.status(200).json({ id: playerDb["_id"] });
				})
				.catch(error => {
					response.status(561).json({ error: error.message });
				});
		}
		else {
			new data.player(playerSave)
				.save()
				.then(playerDb => {
					response.status(200).json({ id: playerDb["_id"] });
				})
				.catch(error => {
					response.status(562).json({ error: error.message });
				})
		}
	},
	
	playerDelete: (request, response) => {
		if (!request.query.id) {
			response.status(550).json({ error: "Missing ID to delete" });
			return;
		}

		data.player.deleteOne({ _id: request.query.id })
			.then(() => {
				response.status(200).json({ status: "ok" });
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			});
	},

	playGet: (request, response) => {
		const filter = {};

		if (request.query.id) {
			filter._id = request.query.id;
		}
		if (request.query.divisionid) {
			filter["division.id"] = request.query.divisionid;
		}

		data.play.find(filter)
			.lean()
			.exec()
			.then(playsDb => {
				const output = {
					plays: playsDb.map(({ _id, __v, ...play }) => ({ id: _id, ...play }))
				};

				response.status(200).json(output);
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			})
	},

	playSave: (request, response) => {
		if (!request.body.play) {
			response.status(550).json({ error: "Missing object to save" });
			return;
		}

		const playSave = request.body.play;

		if (playSave.id) {
			data.play.findById(playSave.id)
				.exec()
				.then(playDb => {
					if (!playDb) {
						throw new Error("Play not found");
					}

					Object.keys(playSave).forEach(field => {
						if (field != "id") {
							playDb[field] = playSave[field];
						}
					})

					return playDb.save();
				})
				.then(playDb => {
					response.status(200).json({ id: playDb["_id"] });
				})
				.catch(error => {
					response.status(561).json({ error: error.message });
				});
		}
		else {
			new data.play(playSave)
				.save()
				.then(playDb => {
					response.status(200).json({ id: playDb["_id"] });
				})
				.catch(error => {
					response.status(562).json({ error: error.message });
				})
		}
	},
	
	playDelete: (request, response) => {
		if (!request.query.id) {
			response.status(550).json({ error: "Missing ID to delete" });
			return;
		}

		data.play.deleteOne({ _id: request.query.id })
			.then(() => {
				response.status(200).json({ status: "ok" });
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			});
	},

	
	emailListGet: (request, response) => {
		const filter = {};

		if (request.query.id) {
			filter._id = request.query.id;
		}
		if (request.query.divisionid) {
			filter["division.id"] = request.query.divisionid;
		}

		data.emailList.find(filter)
			.lean()
			.exec()
			.then(emailListsDb => {
				const output = {
					emailLists: emailListsDb.map(({ _id, __v, ...emailList }) => ({ 
						...emailList,
						id: _id,
						members: emailList.members.map(({ _id, ...member }) => ({ ...member, id: _id }))
					}))
				};

				response.status(200).json(output);
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			})
	},

	emailListSave: (request, response) => {
		if (!request.body.emaillist) {
			response.status(550).json({ error: "Missing object to save" });
			return;
		}

		const emailListSave = request.body.emaillist;

		if (emailListSave.id) {
			data.emailList.findById(emailListSave.id)
				.exec()
				.then(emailListDb => {
					if (!emailListDb) {
						throw new Error("Not found in database");
					}

					Object.keys(emailListSave).forEach(field => {
						if (field != "id") {
							emailListDb[field] = emailListSave[field];
						}
					})

					return emailListDb.save();
				})
				.then(emailListDb => {
					response.status(200).json({ id: emailListDb["_id"] });
				})
				.catch(error => {
					response.status(561).json({ error: error.message });
				});
		}
		else {
			new data.emailList(emailListSave)
				.save()
				.then(emailListDb => {
					response.status(200).json({ id: emailListDb["_id"] });
				})
				.catch(error => {
					response.status(562).json({ error: error.message });
				})
		}
	},
	
	emailListDelete: (request, response) => {
		if (!request.query.id) {
			response.status(550).json({ error: "Missing ID to delete" });
			return;
		}

		data.emailList.deleteOne({ _id: request.query.id })
			.then(() => {
				response.status(200).json({ status: "ok" });
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			});
	},

	locationGet: (request, response) => {
		const filter = {};

		if (request.query.id) {
			filter._id = request.query.id;
		}

		data.fieldLocation.find(filter)
			.lean()
			.exec()
			.then(locationsDb => {
				const output = {
					locations: locationsDb.map(({ _id, __v, ...location }) => ({ id: _id, ...location }))
				};

				response.status(200).json(output);
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			})
	},

	locationSave: (request, response) => {
		if (!request.body.location) {
			response.status(550).json({ error: "Missing object to save" });
			return;
		}

		const locationSave = request.body.location;

		if (locationSave.id) {
			data.fieldLocation.findById(locationSave.id)
				.exec()
				.then(locationDb => {
					if (!locationDb) {
						throw new Error("Not found in database");
					}

					Object.keys(locationSave).forEach(field => {
						if (field != "id") {
							locationDb[field] = locationSave[field];
						}
					})

					return locationDb.save();
				})
				.then(locationDb => {
					response.status(200).json({ id: locationDb["_id"] });
				})
				.catch(error => {
					response.status(561).json({ error: error.message });
				});
		}
		else {
			new data.fieldLocation(locationSave)
				.save()
				.then(locationDb => {
					response.status(200).json({ id: locationDb["_id"] });
				})
				.catch(error => {
					response.status(562).json({ error: error.message });
				})
		}
	},
	
	locationDelete: (request, response) => {
		if (!request.query.id) {
			response.status(550).json({ error: "Missing ID to delete" });
			return;
		}

		data.fieldLocation.deleteOne({ _id: request.query.id })
			.then(() => {
				response.status(200).json({ status: "ok" });
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			});
	},

	emailGet: (request, response) => {
		const filter = {};

		if (request.query.id) {
			filter._id = request.query.id;
		}
		if (request.query.divisionid) {
			filter["division.id"] = request.query.divisionid;
		}

		data.email.find(filter)
			.lean()
			.exec()
			.then(emailsDb => {
				const output = {
					emails: emailsDb.map(({ _id, __v, ...email }) => ({ id: _id, ...email }))
				};

				response.status(200).json(output);
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			})
	},

	emailSave: (request, response) => {
		if (!request.body.email) {
			response.status(550).json({ error: "Missing object to save" });
			return;
		}

		const emailSave = request.body.email;

		if (emailSave.id) {
			data.email.findById(emailSave.id)
				.exec()
				.then(emailDb => {
					if (!emailDb) {
						throw new Error("Not found in database");
					}

					Object.keys(emailSave).forEach(field => {
						if (field != "id") {
							emailDb[field] = emailSave[field];
						}
					})

					return emailDb.save();
				})
				.then(emailDb => {
					response.status(200).json({ id: emailDb["_id"] });
				})
				.catch(error => {
					response.status(561).json({ error: error.message });
				});
		}
		else {
			new data.email(emailSave)
				.save()
				.then(emailDb => {
					response.status(200).json({ id: emailDb["_id"] });
				})
				.catch(error => {
					response.status(562).json({ error: error.message });
				})
		}
	},
	
	emailDelete: (request, response) => {
		if (!request.query.id) {
			response.status(550).json({ error: "Missing ID to delete" });
			return;
		}
		
		data.email.deleteOne({ _id: request.query.id })
			.then(() => {
				response.status(200).json({ status: "ok" });
			})
			.catch(error => {
				response.status(560).json({ error: error.message });
			});
	}

}