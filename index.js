const events = require("node:events");
const path = require("node:path");
const fs = require("node:fs");

const burgerdatabase = require("burgerdatabase");
const { Snowflake } = require("nodejs-snowflake");
const expressWs = require("express-ws");
const express = require("express");

globalThis.bcrypt = require("bcrypt");

globalThis.mainLoop = new events();
globalThis.snowflakeGen = new Snowflake({
	custom_epoch: 1730419200000,
	instance_id: 0
});

globalThis.dbMessages = new burgerdatabase({ path: "./messages.json", noGzip: true });
globalThis.dbChannels = new burgerdatabase({ path: "./channels.json", noGzip: true });
globalThis.dbTokens = new burgerdatabase({ path: "./tokens.json", noGzip: true });
globalThis.dbPass = new burgerdatabase({ path: "./auth.json", noGzip: true });

const app = express();
app.use(express.json());
expressWs(app);

globalThis.loadApis = async () => {
	const apisDir = fs.readdirSync('./apis').filter((fileName) => fileName.endsWith('.js'));

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

	globalThis.loadApis();

	app.listen(17534, async () => {
		process.stderr.write("listening on port 17534\n");
	});
})();
