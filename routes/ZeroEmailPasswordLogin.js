const fs = require('node:fs');
const acc = require('../lib/acc.js');

module.exports = {
	method: 'post',
	path: '/api/v0/login',
	async execute(req, res) {
		let temp = false;

		res.setHeader('Content-Type', 'text/json');
		res.status(200);

		const id = await acc.verifyPass(req.body.mail, req.body.pass);
		if (id === false) {
			res.status(401);

			return res.end(JSON.stringify({
				success: 0
			}));
		}

		console.log(`id: ${id}`);

		temp = await acc.createToken(id);

		res.write(JSON.stringify({
			success: 1,
			token: temp
		}));

		res.end();
	}
}
