const { verifyToken, isUserInGuild, isUserAllowedToParticipateInChannel } = require("../../../intlibs/common.js");

module.exports = {
	method: "get",
	path: "data/channel/:cid",
	async execute(req, res, next) {
		const userId = await verifyToken(req.headers['authorization']);
		if (userId === null) {
			res.status(403);
			res.json({ success: false, code: -1 });
			return;
		}

		const channelData = await dbChannels.get(req.params.cid);

		if (!(await isUserAllowedToParticipateInChannel(userId, req.params.cid))) {
			res.status(403);
			res.json({ success: false, code: -2 });
			return;
		}

		if (!(await isUserInGuild(userId, req.params.cid))) {
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
