const path = require("node:path");
const fs = require("node:fs");

module.exports = {
	basePath: "/api/v0/",
	routes: []
}

function loadRoutes() {
	const routesDirPath = path.join(__dirname, "./routes");
	const routesDir = fs.readdirSync(routesDirPath);

	for (let i = 0; i < routesDir.length; i++) {
		const routeModulePath = path.join(routesDirPath, routesDir[i]);
		const routeModule = require(routeModulePath);

		module.exports.routes.push(routeModule);
	}

	process.stdout.write('\n');
}
loadRoutes();
