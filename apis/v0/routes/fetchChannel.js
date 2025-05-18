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
	path: "channel/:channelId",
	async execute(req, res, next) {
		const channelId = req.params.channelId;

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

		const guildId = await common.findGuildIdOfChannel(channelId);
		if (guildId === null) {
			res.status(403);
			res.json({ error: -2, message: "invalid channelId provided" });

			return;
		}

		const isUserInGuild = await common.isUserInGuild(userId, guildId);
		console.log(userId);
		console.log(guildId);

		console.log(isUserInGuild);

		if (!isUserInGuild) {
			res.status(403);
			res.json({ error: -3, message: "unauthorised" });

			return;
		}

		// const guild = await common.getGuildData(guildId);
		const channel = await common.getChannelData(channelId);

		res.json({
			error: 0,
			payload: {
				channelId,
				uuid: channel.uuid,
				name: channel.name,
				topic: channel.topic,
				guildId: channel.guildId
			}
		});
		return;
	}
}
