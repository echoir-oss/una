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
	method: "ws",
	path: "live",
	async execute(ws, req) {
		const token = req.headers['sec-websocket-protocol'];
		const uuid = await common.findIdByToken(token);
	
		ws.json = (objectie) => {
			ws.send(JSON.stringify(objectie));
		}
		ws.onMessage = (messageObject) => {
			ws.json({
				guildId: messageObject.guildId,
				authorId: messageObject.author,
				content: messageObject.content
			});
		}

		if (uuid === null) {
			ws.json({
				type: "authentication",
				payload: {
					accepted: false
				}
			});
			ws.close();
			return;
		}

		ws.json({
			type: "authentication",
			payload: {
				accepted: true
			}
		});

		const guildIds = await common.getUserGuildIds(uuid);
		for (let i = 0; i < guildIds.length; i++) {
			ws.json({
				type: "guildAvailable",
				payload: {
					guildId: guildIds[i]
				}
			});
		}

		ws.json({
			type: "ready",
			payload: {}
		});

		// common.getUserGuildIds(uuid);

		return;
	}
}
