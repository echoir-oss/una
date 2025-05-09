/* 
 * Copyright (C) 2025 Emilia Luminé <legal@eqilia.eu>
 *
 * This file is part of Una, from Echoir (echoir.fr)
 *
 * Una is free software: you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License, version 3.
 * 
 * Una is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 * You should've received a copy of the GNU Affero General Public License along
 * with Una. If not, see <https://www.gnu.org/licenses>
*/

const events = require("node:events");
const path = require("node:path");
const fs = require("node:fs");

const postgres = require("pg");
const nodemailer = require("nodemailer");
const expressWs = require("express-ws");
const express = require("express");

const config = require("./config.json");

globalThis.mainLoop = new events();
globalThis.meowl = nodemailer.createTransport(config.meowl);

// i feel like it might've been a better choice to create a sqlite-like abstraction
// instead of rewriting everything but eh
// that would just be hiding the absolutely disgusting code that is here
globalThis.database = new postgres.Client(config.pgconf);
globalThis.pool = new postgres.Pool(config.pgconf);
globalThis.config = config;

const app = express();
app.use(express.json());
expressWs(app);

app.options("*a", async (req, res, next) => {
	res.setHeader("access-control-request-method", "POST, GET");
	res.setHeader("access-control-request-headers", "content-type,authorization");
	res.status(200);
	res.end();
});

app.use((req, res, next) => {
	const start = Date.now();

	res.on("close", () => {
		console.log(`${new Date()} ${req.method} ${req.path} ${res.statusCode} (${Date.now()-start}ms)`);
	});

	next();
});

globalThis.loadApis = async () => {
	const apisDir = fs.readdirSync('./apis');

	for (let i = 0; i < apisDir.length; i++) {
		const apisModulePath = path.join(__dirname, "./apis", apisDir[i]);
		const apisModule = require(apisModulePath);

		process.stdout.write(`${apisModule.basePath}\n`);

		for (let j = 0; j < apisModule.routes.length; j++) {
			const route = apisModule.routes[j];

			app[route.method](`${apisModule.basePath}${route.path}`, route.execute);

			process.stdout.write(`\t${route.method.toUpperCase()}\t${apisModule.basePath}${route.path}\n`);
		}
	}

	process.stdout.write('\n');
}

(async () => {
	process.stdout.write('una\n');

	process.stdout.write("database... ");
	await globalThis.database.connect();
	process.stdout.write(":3\n");

	globalThis.loadApis();
	app.all("*a", async (req, res, next) => {
		res.status(403);
		res.end("fuck off");
	});

	app.listen(17534, async () => {
		process.stderr.write("listening on port 17534\n");
	});
})();

globalThis.mainLoop.on("messageCreate", (message) => {
	process.send(JSON.stringify({
		workerId: globalThis.workerId,
		payload: message
	}));
});

process.on("message", (data) => {
	let mesg;

	try {
		mesg = JSON.parse(data);
	} catch (e) {
		console.error(e);
		process.abort();
	}

	if (mesg.workerId === globalThis.workerId) {
		return;
	}

	switch (mesg.type) {
	case "messageCreate":
		globalThis.mainLoop.emit("messageCreate", mesg.payload);
		break;
	default:
		console.log(new TypeError("INVALID TYPE RECEIVED"));
		process.abort();

		break;
	}
});
