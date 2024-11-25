const data = require('./data/index.js');

const bcrypt = require('bcrypt');

async function verifyPass(mail, password) {
	const id = await data.authrel.findAccountIdByMail(mail);

	if (id === false) {
		return false;
	}

	const hash = await data.manage.accounts.getPasshash(id);
	return await bcrypt.compare(password, hash);
}

async function createToken(mail) {
	const token = require('crypto').randomBytes(16).toString('hex');

	await aMP.promise();
	aMP.lock();

	let tokens = db.get(`${mail}`);

	if (tokens === undefined) {
		tokens = [];
	}

	tokens.push([
		await mailToId(mail),
		token
	]);

	db.set(`${mail}`, tokens);

	aMP.unlock();
	return token;
}

async function verifyToken(token) {
	await aMP.promise();
	aMP.lock();

	let ret = false;

	for (const [key, value] of Object.entries(db.data)) {
		const tmp = await _verifyToken(key, token);

		if (tmp !== false) {
			ret = tmp;
			break;
		}
	}

	aMP.unlock();
	return ret;
}

async function _verifyToken(mail, token) {
	const tokens = db.get(mail);

	if (tokens === undefined) return false;

	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i][1] === token) {
			return tokens[i][0];
		}
	}

	return false;
}

async function changePass(mail, password) {
	await aMP.promise();
	aMP.lock();

	for (let i = 0; i < a.length; i++) {
		if (a[i][0] === mail) {

			const c = await bcrypt.hash(password, 10);

			a[i][1] = c;

			saveAccounts();

			aMP.unlock();
			return 1;
		}
	}

	aMP.unlock();
	return 0;
}

async function logoutToken(token) {
	await aMP.promise();
	aMP.lock();

	let clean = 0;

	const tokens = db.get('tokens');
	let tokensNew = [];

	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i][2] === token) {
			delete tokens[i];
			break;
		}
	}

	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i] === undefined) 
			continue;

		tokensNew.push(tokens[i]);
	}

	db.set('tokens', tokensNew);

	aMP.unlock();

	return true;
}

async function isUserAdministrative(user) {
	const a = db.get(`admin_${require('crypto').createHash('sha512').update(user).digest('hex')}`);

	if (a === undefined) {
		return false;
	}

	return true;
}

module.exports = {
	verifyPass,
	changePass,
	verifyToken,
	createToken,
	logoutToken,
	isUserAdministrative
}
