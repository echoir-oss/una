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

const getUserGuildIds = require("./getUserGuildIds.js");

module.exports = async (userId, searchId) => {
	const guildIdList = await getUserGuildIds(userId);

	if (guildIdList === null) {
		return false;
	}

	for (let i = 0; i < guildIdList.length; i++) {
		if (guildIdList[i] === searchId) {
			return true;
		}
	}

	return false;
}
