const fs = require('node:fs');
const acc = require('../lib/acc.js');

module.exports = {
	method: 'post',
	path: '/api/v0/login',
	async execute(req, res) {
		let temp = false;

		res.setHeader('Content-Type', 'text/json');
		res.status(200);

		temp = await acc.verifyPass(req.body.mail, req.body.pass);
		if (!temp) {
			return res.end(JSON.stringify({
				success: 0
			}));
		}

		temp = await acc.createToken(req.body.mail);

		res.write(JSON.stringify({
			success: 1,
			token: temp
		}));

		res.end();
	}
}
