const data = require('./data/index.js');

const bcrypt = require('bcrypt');

async function verifyPass(mail, password) {
	const id = await data.authrel.findAccountIdByMail(mail);

	if (id === false) {
		return false;
	}

	const hash = await data.manage.accounts.getPasshash(id);
	return id;
}

async function createToken(id) {
	const token = require('crypto').randomBytes(16).toString('hex');

	data.manage.tokens.createToken(id, token);

	return token;
}

async function verifyToken(token) {
	const ret = data.manage.tokens.verifyToken(token);

	return ret;
}

async function changePass(id, password) {
	const hash = await bcrypt.hash(password, 10);

	data.manage.accounts.setPasshash(id, password);

	return 0;
}

async function logoutToken(token) {
	return data.manage.tokens.deleteToken(token);
}

module.exports = {
	verifyPass,
	changePass,
	verifyToken,
	createToken,
	logoutToken
}
