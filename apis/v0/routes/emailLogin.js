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
	path: "login/email",
	async execute(req, res, next) {
		if (typeof req.body?.email !== "string" || typeof req.body?.password !== "string") {
			res.status(403);
			res.json({
				error: -1,
			});
			return;
		}

		const uuid = await common.findIdByEmail(req.body.email);
		if (uuid === null) {
			console.log("A");
			res.status(403);
			res.json({ error: -1, message: "Invalid credentials" });

			return;
		}

		if (!(await common.verifyPassword(uuid, req.body.password))) {
			console.log("B");
			res.status(403);
			res.json({ error: -1, message: "Invalid credentials" });

			return;
		}

		const token = await common.createToken(uuid);
		res.status(200);
		res.json({
			error: 0,
			payload: {
				uuid,
				token
			}
		});

		return;
	}
}
