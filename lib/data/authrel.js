const fsPromise = require('node:fs/promises');
const manage = require('./manage.js');

module.exports = {
	async findAccountIdByMail(mailA) {
		const dirReading = await fsPromise.readdir('./data/accounts');

		for (let i = 0; i < dirReading.length; i++) {
			const mailB = manage.accounts.getMail(`${dirReading[i]}`);

			if (mailA === mailB) {
				return dirReading[i];
			}

			continue;
		}

		return false;
	}
}
