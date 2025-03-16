const events = require("node:events");
const path = require("node:path");
const fs = require("node:fs");

const burgerdatabase = require("burgerdatabase");
const { Snowflake } = require("nodejs-snowflake");
const expressWs = require("express-ws");
const express = require("express");
const bcrypt = require("bcrypt");

const mainLoop = new events();
const snowflakeGen = new Snowflake({
	custom_epoch: 1730419200000,
	instance_id: 0
});

const dbMessages = new burgerdatabase({ path: "./messages.json", noGzip: true });
const dbChannels = new burgerdatabase({ path: "./channels.json", noGzip: true });
const dbTokens = new burgerdatabase({ path: "./tokens.json", noGzip: true });
const dbPass = new burgerdatabase({ path: "./auth.json", noGzip: true });

const app = express();
app.use(express.json());
expressWs(app);

function findIdByUsername(username) {
	for (const [key, entry] of Object.entries(dbPass.data)) {
		if (!key.startsWith("user_")) continue;
		const id = key.split("").slice(5).join("");

		if (entry?.username === username) {
			return BigInt(id);
		}

		return id;
	}

	return null;
}

function findIdByEmail(email) {
	for (const [key, entry] of Object.entries(dbPass.data)) {
		if (!key.startsWith("user_")) continue;
		const id = key.split("").slice(5).join('');

		if (entry?.email === email) {
			return BigInt(id);
		}
	}

	return null;
}

function createToken(id) {
	const token = require('crypto').randomBytes(32).toString('hex');

	dbTokens.set(token, `${id}`);

	return token;
}

function verifyToken(token) {
	const id = dbTokens.get(token);

	if (id === undefined) return null;

	return id;
}

function getUserData(id) {
	const userData = dbPass.get(`user_${id}`);

	if (userData === undefined) return null;

	return userData;
}

function isUserAllowedToParticipateInChannel(id, channelId) {
	if (channelId !== "0") {
		return false;
	}

	return true;
}

async function verifyPassword(id, password) {
	const userData = dbPass.get(`user_${id}`);

	if (typeof userData?.passhash !== 'string') return false;

	if (!(await bcrypt.compare(password, userData?.passhash))) {
		return false;
	}

	return true;
}

async function createUser(email, username, password) {
	if (findIdByUsername(username) !== null) return null; 
	if (findIdByEmail(email) !== null) return null;

	const passhash = await bcrypt.hash(password, 10);
	const id = snowflakeGen.getUniqueID();

	const userData = {
		email,
		username,
		passhash
	}

	dbPass.set(`user_${id}`, userData);

	return id;
}

app.get("/api/v0/ping", async (req, res, next) => {
	res.end(`${JSON.stringify({ date: Date.now() })}\n`);
	return;
});

app.post("/api/v0/login/email", async (req, res, next) => {
	if (typeof req.body?.email !== "string" || typeof req.body?.password !== "string") {
		res.status(400);
		res.json({});

		return;
	}

	const id = findIdByEmail(req.body.email);
	if (id === null) {
		res.status(403);
		res.json({});

		return;
	}

	if (!verifyPassword(id, req.body.password)) {
		res.status(403);
		res.json({});

		return;
	}

	const token = createToken(id);

	res.status(200);
	res.json({
		id: id.toString(),
		token
	});

	return;
});

app.post("/api/v0/signup/email", async (req, res, next) => {
	if (typeof req.body?.email !== "string" || typeof req.body?.password !== "string" || typeof req.body?.username !== "string") {
		res.status(400);
		res.json({});

		return;
	}

	if (findIdByEmail(req.body.email) !== null) {
		res.status(403);
		res.json({ extra: "E-mail address already in use!" });
		
		return;
	}

	if (findIdByUsername(req.body.username) !== null) {
		res.status(403);
		res.json({ extra: "Username already in use!" });

		return;
	}

	const id = await createUser(req.body.email, req.body.username, req.body.password);

	res.status(200);
	res.json({
		id: id.toString()
	});

	return;
});

app.post("/api/v0/post", async (req, res, next) => {
	const userId = verifyToken(req.headers['authorization']);
	if (userId === null) {
		res.status(403);
		res.json({ extra: "Unauthorised" });
		return;
	}

	const userData = getUserData(userId);

	if (typeof req.body.content !== 'string' || typeof req.body.channelId !== 'string') {
		res.status(400);
		res.json({ extra: "Invalid content" });

		return;
	}

	if (!isUserAllowedToParticipateInChannel(userId, req.body.channelId)) {
		res.status(403);
		res.json({ extra: "User is not allowed to participate in channel" });

		return;
	}

	const messageId = snowflakeGen.getUniqueID();

	mainLoop.emit('post', { messageId: messageId.toString(), userId: userId.toString(), username: userData.username, content: req.body.content });
	res.json({
		messageId: messageId.toString(),
		channelId: req.body.channelId,
		content: req.body.content
	});
});

app.ws("/api/v0/ws", async (ws, req) => {
	const id = verifyToken(req.headers['sec-websocket-protocol']);
	if (id === null) {
		ws.close();

		return;
	}

	function mainLoopPost(payload) {
		ws.send(JSON.stringify({
			type: "post",
			payload: payload
		}));

		return;
	}

	ws.listenerThingie = mainLoop.on('post', mainLoopPost);

	ws.send(JSON.stringify({
		type: "status",
		payload: { acceptedTimestamp: Date.now(), accepted: true }
	}));

	ws.on('close', async () => {
		mainLoop.removeListener('post', mainLoopPost);
	});
});

app.listen(17534, async () => {
	process.stderr.write("Listening on port 17534\n");
});

