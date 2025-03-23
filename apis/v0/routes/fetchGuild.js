const { verifyToken, isUserInGuild } = require("../../../intlibs/common.js");

module.exports = {
	method: "post",
	path: "data/guild",
	async execute(req, res, next) {
		const userId = await verifyToken(req.headers['authorization']);
		if (userId === null) {
			res.status(403);
			res.json({ success: false, code: -1 });
			return;
		}

		if (typeof req.body?.gid !== 'string') {
			res.status(403);
			res.json({ success: false, code: -1 });
			return;
		}

		const guildData = await dbGuilds.get(req.body.gid);
		
		if (guildData === null) {
			res.status(403);
			res.json({ success: false, code: -2 });
			return;
		}

		if (!(await isUserInGuild(userId, req.body.gid))) {
			res.status(403);
			res.json({ success: false, code: -3 });
			return;
		}

		res.json({
			success: true,
			code: 0,
			payload: {
				name: guildData.name,
				memberIds: guildData.memberIds,
				channelIds: guildData.channelIds
			}
		});

		return;
	}
}
