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
						response.status(560).json({ error: "Could not find user" });
						return;
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
						response.status(560).json({ error: "Request not found" });
						return;
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
	}

}