const { verifyToken } = require("../../../intlibs/common.js");

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

		ws.listenerThingie = mainLoop.on('post', mainLoopPost);

		ws.send(JSON.stringify({
			type: "authentication",
			payload: {
				accepted: true
			}
		}));

		ws.send(JSON.stringify({
			type: "earlyInfo",
			payload: {
				gidList: ["1"],
				uid: id
			}
		}));

		ws.send(JSON.stringify({
			type: "ready",
			payload: {}
		}));

		ws.on('close', async () => {
			mainLoop.removeListener('post', mainLoopPost);
		});
	}
}
