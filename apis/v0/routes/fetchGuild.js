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

const common = require("../../../intlibs/common");

module.exports = {
	method: "get",
	path: "guild/:guildId",
	async execute(req, res, next) {
		const guildId = req.params.guildId;

		if (typeof req.headers["authorization"] !== "string") {
			res.status(403);
			res.json({ error: -1, message: "invalid token provided" });
		
			return;
		}
		
		const userId = await common.findIdByToken(req.headers["authorization"]);
		if (userId === null) {
			res.status(403);
			res.json({ error: -1, message: "invalid token provided" });
		
			return;
		}

		if (!(await common.isUserInGuild(userId, guildId))) {
			res.status(403);
			res.json({ error: -2, message: "unauthorised" });

			return;
		}

		const guild = await common.getGuildData(guildId);

		res.json({
			error: 0,
			payload: {
				guildId,
				name: guild.name,
				ownerId: guild.ownerId,
				channelIds: guild.channels
			}
		});
		return;
	}
}
