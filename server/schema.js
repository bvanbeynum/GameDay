import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
	lastAccess: Date,
	agent: String,
	ip: String,
	domain: String,
	token: String
});

const locationSchema = new mongoose.Schema({
	x: Number,
	y: Number
});

const playerSchema = new mongoose.Schema({
	color: String,
	routeType: String,
	routeAction: String,
	location: { type: locationSchema },
	route: [{type: locationSchema}]
});

const prevYearSchema = new mongoose.Schema({
	year: String,
	season: String,
	division: String,
	rank: Number,
	round: Number,
	coachProtect: String,
	coachRequest: String,
	team: String,
	throwing: Number,
	catching: Number,
	running: Number,
	runTime: Number
});

const depthChart = new mongoose.Schema({
	positions: [{ color: String, group1: String, group2: String }]
})

export default {

	user: mongoose.model("user", {
		firstName: String,
		lastName: String,
		createdDate: Date,
		email: String,
		isAdmin: Boolean,
		teams: [String],
		devices: [{ type: deviceSchema }],
		tokens: [ String ],
		modules: [{ name: String, url: String }]
	}),

	request: mongoose.model("request", {
		userId: String,
		isActive: Boolean,
		name: String,
		email: String,
		device: { type: deviceSchema }
	}),

	division: mongoose.model("division", {
		name: String,
		year: Number,
		season: String
	}),
	
	team: mongoose.model("team", {
		name: String,
		division: {
			id: String,
			name: String,
			year: Number,
			season: String
		},
		confrence: String,
		coach: String,
		isManaged: Boolean,
		draftRound: Number,
		practiceDay: String,
		practiceTime: String,
		practiceLocation: String,
		practiceWeekend: String,
		teamDivision: { type: {}, select: false }
	}),
	
	player: mongoose.model("player", {
		division: {
			id: String,
			name: String,
			year: Number,
			season: String
		},
		team: {
			id: String,
			name: String,
			coach: String
		},
		draftRound: Number,
		draftRank: Number,
		brettRank: Number,
		draftNumber: Number,
		draftPick: Number,

		firstName: String,
		lastName: String,
		playerNumber: Number,
		dateOfBirth: Date,
		parentName: String,
		parentEmail: String,
		phone: String,
		shirtSize: String,
		allergies: String,

		requests: String,
		coachRequest: String,
		coachProtect: String,

		recThrowing: Number,
		recCatching: Number,
		throwing: Number,
		catching: Number,
		evalCatch: Number,
		running: Number,
		runTime: Number,
		height: Number,
		route: Number,
		speed: Number,
		hands: Number,
		draftBlock: Boolean,
		draftWatch: Boolean,
		
		depthGroup: Number,
		depthOffense: String,
		depthOffenseGroup: Number,
		depthDefense: String,
		depthDefenseGroup: Number,
		routeColor: String,
		
		prev: [{type: prevYearSchema}],
		notes: String,
		playerDivision: { type: {}, select: false }
	}),
	
	game: mongoose.model("game", {
		division: {
			id: String,
			name: String,
			year: Number,
			season: String
		},
		dateTime: Date,
		homeTeam: {
			id: String,
			name: String,
			score: Number,
			isWinner: Boolean
		},
		awayTeam: {
			id: String,
			name: String,
			score: Number,
			isWinner: Boolean
		},
		field: String,
		gameDivision: { type: {}, select: false }
	}),

	playBook: mongoose.model("playbook", {
		division: {
			id: String,
			name: String,
			year: Number,
			season: String
		},
		name: String,
		plays: [{ playId: String, sort: Number }],
		offense: { type: depthChart },
		defense: { type: depthChart }
	}),
	
	play: mongoose.model("play", {
		division: {
			id: String,
			name: String,
			year: Number,
			season: String
		},
		formation: String,
		name: String,
		field: String,
		rating: Number,
		sort: Number,
		strategy: String,
		players: [ playerSchema ]
	}),

	emailList: mongoose.model("emailList", {
		division: {
			id: String,
			name: String,
			year: Number,
			season: String
		},
		name: String,
		members: [{ name: String, email: String }]
	}),

	fieldLocation: mongoose.model("fieldLocation", {
		name: String,
		address: String,
		map: String
	}),

	email: mongoose.model("emaillog", {
		division: {
			id: String,
			name: String,
			year: String,
			season: String
		},
		sent: Date,
		to: [ String ],
		subject: String,
		emailText: String
	})
	
}