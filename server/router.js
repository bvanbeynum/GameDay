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

// ************************* API

// ************************* Routes

router.get("/access", api.validateAccess);

export default router;
