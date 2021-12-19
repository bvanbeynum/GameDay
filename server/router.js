import express from "express";
import mongoose from "mongoose";
import config from "./config.js";
import data from "./data.js";
import api from "./api.js";

const { connect } = mongoose;
const router = express.Router();

connect("mongodb://" + config.db.user + ":" + config.db.pass + "@" + config.db.servers.join(",") + "/" + config.db.db + "?authSource=" + config.db.authDB, {useNewUrlParser: true, useUnifiedTopology: true });

router.use(api.authenticate)

// ************************* Data

router.get("/data/user", data.userGet);
router.post("/data/user", data.userSave);
router.delete("/data/user", data.userDelete);

router.get("/data/request", data.requestGet);
router.post("/data/request", data.requestSave);
router.delete("/data/request", data.requestDelete);

router.get("/data/division", data.divisionGet);
router.post("/data/division", data.divisionSave);
router.delete("/data/division", data.divisionDelete);

router.get("/data/game", data.gameGet);
router.post("/data/game", data.gameSave);
router.delete("/data/game", data.gameDelete);

router.get("/data/team", data.teamGet);
router.post("/data/team", data.teamSave);
router.delete("/data/team", data.teamDelete);

router.get("/data/player", data.playerGet);
router.post("/data/player", data.playerSave);
router.delete("/data/player", data.playerDelete);

router.get("/data/play", data.playGet);
router.post("/data/play", data.playSave);
router.delete("/data/play", data.playDelete);

// ************************* API

router.get("/api/divisionload", api.divisionsLoad);
router.get("/api/scheduleload", api.scheduleLoad);
router.post("/api/gamesave", api.gameSave);

router.post("/api/videoplayerupload", api.videoPlayerUpload);
router.get("/api/videoplayerload", api.videoPlayerLoad);

router.get("/api/evaluationload", api.loadState, api.evaluationLoad);
router.post("/api/evaluationsave", api.loadState, api.evaluationSave);

// ************************* Routes

router.get("/access", api.validateAccess);

export default router;
