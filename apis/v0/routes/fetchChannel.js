const { verifyToken, isUserInGuild, isUserAllowedToParticipateInChannel } = require("../../../intlibs/common.js");

module.exports = {
	method: "post",
	path: "data/channel",
	async execute(req, res, next) {
		const userId = await verifyToken(req.headers['authorization']);
		if (userId === null) {
			res.status(403);
			res.json({ success: false, code: -1 });
			return;
		}

		if (typeof req.body?.cid !== 'string') {
			res.status(403);
			res.json({ success: false, code: -1 });
			return;
		}

		const channelData = await dbChannels.get(req.body.cid);

		if (!(await isUserAllowedToParticipateInChannel(userId, req.body.cid))) {
			res.status(403);
			res.json({ success: false, code: -2 });
		}

		if (!(await isUserInGuild(userId, req.body.cid))) {
			res.status(403);
			res.json({ success: false, code: -3 });
			return;
		}

		res.status(200);
		res.json({
			success: true,
			code: 0,
			payload: {
				name: channelData.nam,
				guildId: channelData.guildId
			}
		});

		return;
	}
}
