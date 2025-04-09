const { getUserData } = require("../../../intlibs/common.js");

module.exports = {
	method: "get",
	path: "data/user/:uid",
	async execute(req, res, next) {
		const userData = await getUserData(req.params.uid);
		if (userData === null) {
			res.status(403);
			res.json({ success: false, code: -2 });
			return;
		}

		res.json({
			success: true,
			code: 0,
			payload: {
				username: userData.username
			}
		});

		return;
	}
}
