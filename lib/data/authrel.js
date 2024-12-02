const fsPromise = require('node:fs/promises');
const manage = require('./manage.js');

module.exports = {
	async findAccountIdByMail(mailA) {
		const dirReading = await fsPromise.readdir('./data/accounts');

		for (let i = 0; i < dirReading.length; i++) {
			const mailB = await manage.accounts.getMail(`${dirReading[i]}`);

			if (mailA === mailB) {
				return dirReading[i];
			}

			continue;
		}

		return false;
	},
	async isUsernameTaken(username) {
		const dirReading = await fsPromise.readdir('./data/accounts');

		for (let i = 0; i < dirReading.length; i++) {
			const unB = await manage.accounts.getUsername(dirReading[i]);

			if (unB === username) return true;

			continue;
		}

		return false;
	}
}
