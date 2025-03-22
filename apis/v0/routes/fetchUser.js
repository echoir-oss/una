const { getUserData } = require("../../../intlibs/common.js");

module.exports = {
	method: "get",
	path: "data/user",
	async execute(req, res, next) {
		if (typeof req.body?.userId !== 'string') {
			res.status(403);
			res.json({ success: false, code: -1 });
			return;
		}

		const userData = await getUserData(userId);
		
		if (userData === null) {
			res.status(403);
			res.json({ success: false, code: -2 });
			return;
		}

		res.json({
			success: true,
			code: 0,
			payload: {
				username: userData
			}
		});

		return;
	}
}
