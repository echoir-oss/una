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
const uuid = require("uuid");

module.exports = {
	method: "post",
	path: "message/:channelId",
	async execute(req, res, next) {
		const channelId = req.params.channelId;

		if (typeof req.body?.content !== "string") {
			res.status(403);
			res.json({ error: -2, message: "invalid content provided" });

			return;
		}

		if (typeof req.headers["authorization"] !== "string") {
			res.status(403);
			res.json({ error: -1, message: "invalid token provided" });

			return;
		}

		const author = common.findIdByToken(req.headers(["authorization"]));
		if (id === null) {
			res.status(403);
			res.json({ error: -1, message: "invalid token provided" });

			return;
		}

		const msgId = uuid.v7();
		globalThis.mainLoop.emit("messageCreate", {
			msgId,
			channelId,
			author,
			content: req.body.content
		});

		res.json({ error: 0, payload: {
			id: msgId
		}});
		return;
	}
}
