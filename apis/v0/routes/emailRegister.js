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
	method: "post",
	path: "register/email",
	async execute(req, res, next) {
		if (typeof req.body?.email !== "string" || typeof req.body?.username !== "string" || typeof req.body?.password !== "string") {
			res.status(403);
			res.json({
				error: -1,
			});
			return;
		}

		if (await (common.isUsernameTaken(req.body.username))) {
			res.status(403);
			res.json({
				error: -2
			});
			return;
		}

		if ((await common.findIdByEmail(req.body.email) !== null)) {
			res.status(403);
			res.json({
				error: -3
			});
			return;
		}

		const uuid = await common.createUser(req.body.username, req.body.email, req.body.password);

		res.json({
			error: 0,
			payload: {
				uuid
			}
		});

		return;
	}
}
