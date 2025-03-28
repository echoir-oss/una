const { getUserData } = require("../../../intlibs/common.js");

module.exports = {
	method: "post",
	path: "data/user",
	async execute(req, res, next) {
		if (typeof req.body?.uid !== 'string') {
			res.status(403);
			res.json({ success: false, code: -1 });
			return;
		}

		const userData = await getUserData(req.body.uid);
		
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
