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

const findIdByToken00 = require("./findIdByToken00.js");

module.exports = async (token) => {
	const a = token.split("$");
	if (a.length !== 3) {
		return null;
	}

	switch (a[1]) {
	case "00":
		return await findIdByToken00(a[2]);
		break;
	default:
		return null;
	}

	return null;
}
