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

const process = require("node:process");

const bcrypt = require("bcrypt");
const uuid = require("uuid");

const queryA = globalThis.loadSQL("40-createAuthEntry");
const queryB = globalThis.loadSQL("40-createUserEntry");

module.exports = async (username, email, password) => {
	const passhash = await bcrypt.hash(password, 10);
	const id = uuid.v7();

	const resultA = await globalThis.database.query(queryA, [id, username, email, passhash, 0, 0, ""]);
	const resultB = await globalThis.database.query(queryB, [id, username]);

	return id;
}
