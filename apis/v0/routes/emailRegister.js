const { findIdByEmail, findIdByUsername, createUser } = require("../../../intlibs/common.js");

module.exports = {
	method: "post",
	path: "register/email",
	async execute(req, res, next) {
		if (typeof req.body?.email !== "string" || typeof req.body?.password !== "string" || typeof req.body?.username !== "string") {
			res.status(400);
			res.json({
				success: false,
				code: -1
			});
	
			return;
		}
	
		if ((await findIdByEmail(req.body.email)) !== null) {
			res.status(403);
			res.json({
				success: false,
				code: -2
			});
			
			return;
		}
	
		if ((await findIdByUsername(req.body.username)) !== null) {
			res.status(403);
			res.json({
				success: false,
				code: -3
			});
	
			return;
		}
	
		const id = await createUser(req.body.email, req.body.username, req.body.password);
	
		res.status(200);
		res.json({
			success: true,
			code: 0,
			payload: {
				id: id.toString()
			}
		});
	
		return;
	}
}
