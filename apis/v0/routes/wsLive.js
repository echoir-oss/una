const { verifyToken, isUserAllowedToParticipateInChannel, isUserInGuild } = require("../../../intlibs/common.js");

module.exports = {
	method: "ws",
	path: "live",
	async execute(ws, req) {
		const id = await verifyToken(req.headers['sec-websocket-protocol']);
		if (id === null) {
			ws.send(JSON.stringify({
				type: "authentication",
				payload: {
					accepted: false
				}
			}));
			ws.close();

			return;
		}

		function mainLoopPost(payload) {
			ws.send(JSON.stringify({
				type: "messagePost",
				payload: payload
			}));

			return;
		}

		function mainLoopGuildCreate(payload) {
			if (!isUserInGuild(id, payload.gid)) {
				console.log(payload.gid);
				return;
			}

			ws.send(JSON.stringify({
				type: "guildCreate",
				payload: payload
			}));

			return;
		}

		function mainLoopChannelCreate(payload) {
			console.log(payload);
			if (!isUserInGuild(id, payload.gid)) {
				console.log(payload.gid);
				return;
			}
			if (!isUserAllowedToParticipateInChannel(id, payload.cid)) {
				console.log(payload.cid);
				return;
			}

			ws.send(JSON.stringify({
				type: "channelCreate",
				payload: payload
			}));

			return;
		}

		ws.listenerThingieA = mainLoop.on('post', mainLoopPost);
		ws.listenerThingieB = mainLoop.on("channelCreate", mainLoopChannelCreate);
		ws.listenerThingieC = mainLoop.on("guildCreate", mainLoopGuildCreate);

		ws.send(JSON.stringify({
			type: "authentication",
			payload: {
				accepted: true
			}
		}));

		let gidList = [];

		for (const [key, value] of Object.entries(globalThis.dbGuilds.all())) {
			if (isUserInGuild(id.toString(), key)) {
				gidList.push(key);
			}
		}

		ws.send(JSON.stringify({
			type: "earlyInfo",
			payload: {
				gidList: gidList,
				uid: id
			}
		}));
		ws.send(JSON.stringify({
			type: "ready",
			payload: {}
		}));

		ws.on('close', async () => {
			mainLoop.removeListener('post', mainLoopPost);
			mainLoop.removeListener("channelCreate", mainLoopChannelCreate);
			mainLoop.removeListener("guildCreate", mainLoopGuildCreate);
		});
	}
}
