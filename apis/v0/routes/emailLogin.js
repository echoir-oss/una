const { findIdByEmail, verifyPassword, createToken } = require("../../../intlibs/common.js");

module.exports = {
	method: "post",
	path: "login/email",
	async execute(req, res, next) {
		if (typeof req.body?.email !== "string" || typeof req.body?.password !== "string") {
			res.status(400);
			res.json({
				success: false,
				code: -1
			});
	
			return;
		}

		const id = await findIdByEmail(req.body.email);
		if (id === null) {
			res.status(403);
			res.json({
				success: false,
				code: -2
			});

			return;
		}

		if (!(await verifyPassword(id, req.body.password))) {
			res.status(403);
			res.json({
				success: false,
				code: -3
			});
	
			return;
		}

		const token = await createToken(id);

		res.status(200);
		res.json({
			success: true,
			code: 0,
			payload: {
				id: id.toString(),
				token
			}
		});

		return;
	}
}
