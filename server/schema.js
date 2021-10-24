import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
	requestDate: Date,
	agent: String,
	ip: String,
	token: String
});

export default {

	user: mongoose.model("user", {
		firstName: String,
		lastName: String,
		createdDate: Date,
		devices: [{ type: deviceSchema }],
		tokens: [ String ]
	}),

	request: mongoose.model("request", {
		isActive: Boolean,
		device: { type: deviceSchema }
	})

}