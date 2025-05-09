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

const queryA = globalThis.loadSQL("30-getPasshash");

module.exports = async (uuid, password) => {
	const result = await globalThis.database.query(queryA, [uuid]);

	if (result.rows.length !== 1) {
		return null;
	}

	return await bcrypt.compare(password, result.rows[0].passhash);
}
