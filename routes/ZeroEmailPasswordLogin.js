const acc = require('../lib/acc.js');

module.exports = {
	method: 'post',
	path: '/api/v0/login',
	async execute(req, res) {
		const id = await acc.verifyPass(req.body.mail, req.body.pass);
		if (id === false) {
			res.status(401);

			return res.end(JSON.stringify({
				success: 0
			}));
		}

		const token = await acc.createToken(id);

		res.json({
			success: 1,
			token
		});
	}
}
