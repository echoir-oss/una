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

async function findIdByUsername(username) {
	for (const [key, entry] of Object.entries((await dbPass.all()))) {
		if (!key.startsWith("user_")) continue;
		const id = key.split("").slice(5).join("");

		if (entry?.username === username) {
			return BigInt(id);
		}

		return id;
	}

	return null;
}

async function findIdByEmail(email) {
	for (const [key, entry] of Object.entries((await dbPass.all()))) {
		if (!key.startsWith("user_")) continue;
		const id = key.split("").slice(5).join('');

		if (entry?.email === email) {
			return BigInt(id);
		}
	}

	return null;
}

async function createToken(id) {
	const token = require('crypto').randomBytes(32).toString('hex');

	await dbTokens.set(token, `${id}`);

	return token;
}

async function verifyToken(token) {
	const id = await dbTokens.get(token);

	if (id === undefined) return null;

	return id;
}

async function getUserData(id) {
	const userData = await dbPass.get(`user_${id}`);

	if (userData === undefined) return null;

	return userData;
}

async function isUserAllowedToParticipateInChannel(id, channelId) {
	if (channelId !== "0") {
		return false;
	}

	return true;
}

async function verifyPassword(id, password) {
	const userData = await dbPass.get(`user_${id}`);

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

	await dbPass.set(`user_${id}`, userData);

	return id;
}

app.get("/api/v0/ping", async (req, res, next) => {
	res.json({
		success: true,
		code: 0,
		date: Date.now()
	});

	return;
});

app.post("/api/v0/login/email", async (req, res, next) => {
	if (typeof req.body?.email !== "string" || typeof req.body?.password !== "string") {
		res.status(400);
		res.json({
			success: false,
			code: -1
		});

		return;
	}

	const id = await findIdByEmail(req.body.email);
	if (id === null) {
		res.status(403);
		res.json({
			success: false,
			code: -2
		});

		return;
	}

	if (!(await verifyPassword(id, req.body.password))) {
		res.status(403);
		res.json({
			success: false,
			code: -3
		});

		return;
	}

	const token = await createToken(id);

	res.status(200);
	res.json({
		success: true,
		code: 0,
		payload: {
			id: id.toString(),
			token
		}
	});

	return;
});

app.post("/api/v0/register/email", async (req, res, next) => {
	if (typeof req.body?.email !== "string" || typeof req.body?.password !== "string" || typeof req.body?.username !== "string") {
		res.status(400);
		res.json({
			success: false,
			code: -1
		});

		return;
	}

	if ((await findIdByEmail(req.body.email)) !== null) {
		res.status(403);
		res.json({
			success: false,
			code: -2
		});
		
		return;
	}

	if ((await findIdByUsername(req.body.username)) !== null) {
		res.status(403);
		res.json({
			success: false,
			code: -3
		});

		return;
	}

	const id = await createUser(req.body.email, req.body.username, req.body.password);

	res.status(200);
	res.json({
		success: true,
		code: 0,
		payload: {
			id: id.toString()
		}
	});

	return;
});

app.post("/api/v0/message", async (req, res, next) => {
	const userId = await verifyToken(req.headers['authorization']);
	if (userId === null) {
		res.status(403);
		res.json({ success: false, code: -1 });
		return;
	}

	const userData = await getUserData(userId);

	if (typeof req.body.content !== 'string' || typeof req.body.cid !== 'string') {
		res.status(400);
		res.json({ success: false, code: -2 });

		return;
	}

	if (!(await isUserInGuild(userId, req.body.gid))) {
		res.status(403);
		res.json({ success: false, code: -3 });
	}

	if (!(await isUserAllowedToParticipateInChannel(userId, req.body.cid))) {
		res.status(403);
		res.json({ success: false, code: -4 });

		return;
	}

	const messageId = snowflakeGen.getUniqueID().toString();

	mainLoop.emit('post', {
		from: {
			mid: messageId,
			uid: userId,
			gid: req.body.gid,
			cid: req.body.cid
		},
		text: req.body.content
	});

	res.status(200);
	res.json({
		success: true,
		code: 0,
		payload: {
			mid: messageId
		}
	});
});

app.ws("/api/v0/live", async (ws, req) => {
	const id = await verifyToken(req.headers['sec-websocket-protocol']);
	if (id === null) {
		ws.send(JSON.stringify({
			type: "authentication",
			payload: {
				accepted: false
			}
		}));
		ws.close();

		return;
	}

	function mainLoopPost(payload) {
		ws.send(JSON.stringify({
			type: "messagePost",
			payload: payload
		}));

		return;
	}

	ws.listenerThingie = mainLoop.on('post', mainLoopPost);

	ws.send(JSON.stringify({
		type: "authentication",
		payload: {
			accepted: true
		}
	}));

	ws.send(JSON.stringify({
		type: "earlyInfo",
		payload: {
			gidList: ["1"],
			uid: id
		}
	}));

	ws.send(JSON.stringify({
		type: "ready",
		payload: {}
	}));

	ws.on('close', async () => {
		mainLoop.removeListener('post', mainLoopPost);
	});
});

app.listen(17534, async () => {
	process.stderr.write("Listening on port 17534\n");
});

