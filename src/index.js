const fs = require('node:fs');
const path = require('node:path');
const events = require('node:events');

const express = require('express');
const mt = require('microtime');
const mp = require('mutex-promise');
const cp = require('cookie-parser');
const ws = require('express-ws');

const accounts = require('../lib/acc.js');
globalThis.mainLoop = new events();

globalThis.mainLoop.on('message', async (message) => {
	console.log(message);
});

const app = express();

accounts.loadAccounts();

ws(app);
app.use(cp());
app.use(express.json());

app.use((req, res, next) => {
	req.__recv = mt.now();

	res.on('close', async () => {
		const delay = mt.now()-req.__recv;

		process.stdout.write(`${new Date()} | ${req.ip} -> ${req.method} ${req.path} ${res.statusCode} (${delay}µs)\n`);
	});
	next();
});

globalThis.loadRoutes = () => {
	const routesDirectory = fs.readdirSync('./routes');

	process.stdout.write('Loading routes:\n');

	for (let i = 0; i < routesDirectory.length; i++) {
		const routeFile = path.join(process.cwd(), 'routes', routesDirectory[i]);
		const routeModule = require(routeFile);

		if (typeof routeModule !== 'object') throw new TypeError('routeModule is not an object!');
		if (typeof routeModule.method !== 'string') throw new TypeError('routeModule.method is not a string!');
		if (typeof routeModule.path !== 'string') throw new TypeError('routeModule.path is not a string!');
		if (typeof routeModule.execute !== 'function') throw new TypeError('routeModule.execute is not a function!');

		app[routeModule.method](routeModule.path, routeModule.execute);

		process.stdout.write(`\t${routeFile} -> ${routeModule.method.toUpperCase()} ${routeModule.path} \n`);
	}

	process.stdout.write('\n');

	return;
}
globalThis.loadRoutes();

app.listen(6868, async () => {
	process.stdout.write('OK\n');
});
