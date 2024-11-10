const fs = require('node:fs');

const bcrypt = require('bcrypt');
const bdb = require('burgerdatabase');
const mp = require('mutex-promise');

const db = new bdb({ path: './data/tokens.json', noGzip: true });

const aMP = new mp('echoirMainCoarseLock', {
	timeout: 6e4
});


let a = [];


async function loadAccounts() {
	await aMP.promise();
	aMP.lock();

	const x = fs.readFileSync('./data/accounts').toString().split('\n');

	for (let i = 0; i < x.length; i++) {
		const y = x[i].split(':');
		if (y.length === 5) {
			a.push(x[i].split(':'));
		}
	}

	aMP.unlock();
}

function saveAccounts() {
	const x = [];

	for (let i = 0; i < a.length; i++) {
		x.push(a[i].join(':'));
	}

	fs.writeFileSync('./data/accounts', x.join('\n'));
}

async function verifyPass(mail, password) {
	for (let i = 0; i < a.length; i++) {
		console.log(a);
		const b = a[i];

		if (b[0] === mail) {
			const c = await bcrypt.compare(password, b[2]);
			
			if (c) {
				return true;
			} else {
				return false;
			}
		}
	}

	return false;
}

async function mailToId(mail) {
	console.log(a);

	for (let i = 0; i < a.length; i++) {
		console.log(a[i][0]);

		if (a[i][0] === mail) {
			return a[i][1];
		}
	}

	return false;
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
		if (tokens[i] === undefined) {
			console.log('!');
			continue;
		}

		tokensNew.push(tokens[i]);
	}

	db.set('tokens', tokensNew);

	aMP.unlock();

	return true;
}

async function isUserAdministrative(user) {
	const a = db.get(`admin_${require('crypto').createHash('sha512').update(user).digest('hex')}`);

	console.log(a);

	if (a === undefined) {
		return false;
	}

	return true;
}

module.exports = {
	loadAccounts,
	saveAccounts,
	verifyPass,
	changePass,
	verifyToken,
	createToken,
	logoutToken,
	isUserAdministrative,
	mailToId
}
