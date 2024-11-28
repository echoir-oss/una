const fsPromise = require('node:fs/promises');
const locks = require('./locks.js');

const misc = require('../misc.js');

const accountExports = {
	async createAccount(id) {
		await fsPromise.mkdir(`./data/accounts/${id}`);
		return;
	},

	async getPasshash(id) {
		return (await fsPromise.readFile(`./data/accounts/${id}/passhash`)).toString();
	},
	async setPasshash(id, passhash) {
		await locks.accounts.await(id);
		await locks.accounts.lock(id);

		await fsPromise.writeFile(`./data/accounts/${id}/passhash`, passhash);

		await locks.accounts.unlock();
		return;
	},

	async getUsername(id) {
		return (await fsPromise.readFile(`./data/accounts/${id}/username`)).toString();
	},
	async setUsername(id, username) {
		await locks.accounts.await(id);
		await locks.accounts.lock(id);

		await fsPromise.writeFile(`./data/accounts/${id}/username`, username);

		await locks.accounts.unlock(id);
		return;
	},

	async getDiscriminator(id) {
		const out = await fsPromise.readFile(`./data/accounts/${id}/discriminator`).toString();

		return parseInt(out);
	},
	async setDiscriminator(id, dis) {
		await locks.accounts.await(id);
		await locks.accounts.lock(id);

		await fsPromise.writeFile(`./data/accounts/${id}/discriminator`, dis.toString());

		await locks.accounts.unlock(id);
		return;
	},

	async getMail(id) {
		return (await fsPromise.readFile(`./data/accounts/${id}/mail`)).toString();
	},
	async setMail(id, mail) {
		await locks.accounts.await(id);
		await locks.accounts.lock(id);

		await fsPromise.writeFile(`./data/accounts/${id}/mail`, mail);

		await locks.accounts.unlock(id);
		return;
	},

	async getUsername(id) {
		return (await fsPromise.readFile(`./data/accounts/${id}/username`)).toString();
	},
	async setUsername(id, username) {
		await locks.accounts.await(id);
		await locks.accounts.lock(id);

		await fsPromise.writeFile(`./data/accounts/${id}/username`, username);

		await locks.accounts.unlock(id);
		return;
	}
}

const channelsExports = {}

const tokensExports = {
	async createToken(id, token) {
		await fsPromise.writeFile(`./data/tokens/${token}`, `${id}`);
		return 1;
	},

	async verifyToken(token) {
		if (!misc.isStringSafe(token)) return null;

		return (await fsPromise.readFile(`./data/tokens/${token}`)).toString();
	},

	async deleteToken(token) {
		if (!misc.isStringSafe(token)) return null;

		await fsPromise.unlink(`./data/tokens/${token}`);
	}
}

module.exports = {
	accounts: accountExports,
	tokens: tokensExports
}
