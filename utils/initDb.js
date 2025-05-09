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

const config = require("../config.json");

const postgres = require("pg");
const database = new postgres.Client(config.pgconf);

async function runSQL(query) {
	console.log(query);
	await database.query(query);
}

(async () => {
	await database.connect();

	const sqlFiles = fs.readdirSync("./sql").filter((meow) => meow.startsWith("00") || meow.startsWith("10"));

	for (let i = 0; i < sqlFiles.length; i++) {
		const sqlPath = path.join(process.cwd(), "sql", sqlFiles[i])

		await runSQL(fs.readFileSync(sqlPath, "utf8"));
	}

	await database.end();
})();
