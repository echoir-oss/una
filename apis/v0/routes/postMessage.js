const { verifyToken, getAuthData, isUserInGuild, isUserAllowedToParticipateInChannel } = require("../../../intlibs/common.js");

module.exports = {
	method: "post",
	path: "message",
	async execute(req, res, next) {
		const userId = await verifyToken(req.headers['authorization']);
		if (userId === null) {
			res.status(403);
			res.json({ success: false, code: -1 });
			return;
		}

		const userData = await getAuthData(userId);

		if (typeof req.body.content !== 'string' || typeof req.body.cid !== 'string') {
			res.status(400);
			res.json({ success: false, code: -2 });

			return;
		}

		if (!(await isUserAllowedToParticipateInChannel(userId, req.body.cid))) {
			res.status(403);
			res.json({ success: false, code: -3 });

			return;
		}

		const messageId = snowflakeGen.getUniqueID().toString();

		mainLoop.emit('post', {
			from: {
				mid: messageId,
				uid: userId,
				gid: req.body.gid,
				cid: req.body.cid
			},
			text: req.body.content
		});

		res.status(200);
		res.json({
			success: true,
			code: 0,
			payload: {
				mid: messageId
			}
		});
	}
}
