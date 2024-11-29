const fs = require('node:fs');
const acc = require('../lib/acc.js');

function naturaliseBody(body) {
	const out = {
		content: body.content,
		messageId: globalThis.snowflakeGen.getUniqueID().toString(),
		channelId: body.channelId,
		guildId: body.guildId
	}

	return out;
}

function validateBody(body) {
	if (typeof body?.content !== 'string') return false;
	if (typeof body?.channelId !== 'string') return false;
	if (typeof body?.guildId !== 'string') return false;

	if (body.content.length <= 0)
		return false;

	for (let i = 0; i < body.content.length; i++) {
		const c = body.content.charCodeAt(i);

		if (c > 65536)
			return false;

		if (c < 32)
			return false;
	}

	return true;
}

module.exports = {
	method: 'post',
	path: '/api/v0/message',
	async execute(req, res) {
		const authStatus = await acc.verifyToken(req.headers['authorisation']);
		if (authStatus === false) {
			res.status(401);

			res.json({
				success: 0
			});
			return 0;
		}

		if (!validateBody(req.body)) {
			res.status(400);

			res.json({
				success: 0
			});
			return 0;
		}

		const bodyNaturalised = naturaliseBody(req.body);
		bodyNaturalised.authorId = authStatus;

		globalThis.mainLoop.emit('messageCreate', bodyNaturalised);

		res.json({
			success: 1,
			messageId: bodyNaturalised.messageId
		});

		return 0;
	}
}
