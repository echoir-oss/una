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

const postgres = require("pg");
const config = require("../config.json");

const database = new postgres.Client(config.pgconf);

globalThis.loadSQL = (sqlPathRelative) => {
	const sqlPathAbsolute = path.join(process.cwd(), "sql", `${sqlPathRelative}.sql`);

	return fs.readFileSync(sqlPathAbsolute, "utf8");
}

(async () => {
	await database.connect();

	const result = await database.query(loadSQL("30-getUserGuildIds"), ["01968b10-45af-71d5-b7f2-151d748d7579"]);
	console.log(result.rows[0].guildids);

	await database.end();
})();
