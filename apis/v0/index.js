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

const path = require("node:path");
const fs = require("node:fs");

const routes = [];

const dirReading = fs.readdirSync(path.join(__dirname, "./routes"));
for (let i = 0; i < dirReading.length; i++) {
	const module = require(path.join(__dirname, "./routes", dirReading[i]));
	routes.push(module);
}

module.exports = {
	basePath: "/api/v0/",
	routes
};
