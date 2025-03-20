async function findIdByUsername(username) {
	for (const [key, entry] of Object.entries((await dbPass.all()))) {
		if (!key.startsWith("user_")) continue;
		const id = key.split("").slice(5).join("");

		if (entry?.username === username) {
			return BigInt(id);
		}

		return id;
	}

	return null;
}

async function findIdByEmail(email) {
	for (const [key, entry] of Object.entries((await dbPass.all()))) {
		if (!key.startsWith("user_")) continue;
		const id = key.split("").slice(5).join('');

		if (entry?.email === email) {
			return BigInt(id);
		}
	}

	return null;
}

async function createToken(id) {
	const token = require('crypto').randomBytes(32).toString('hex');

	await dbTokens.set(token, `${id}`);

	return token;
}

async function verifyToken(token) {
	const id = await dbTokens.get(token);

	if (id === undefined) return null;

	return id;
}

async function getUserData(id) {
	const userData = await dbPass.get(`user_${id}`);

	if (userData === undefined) return null;

	return userData;
}

async function isUserInGuild(userId, guildId) {
	if (guildId === "2") {
		return true;
	}

	return false;
}

async function isUserInChannel(userId, channelId) {
	if (channelId === "5") {
		return true;
	}

	return false;
}

async function isUserAllowedToParticipateInChannel(userId, channelId) {
	const channelObject = dbChannels.get(channelId);

	if (channelObject === undefined) {
		return false;
	}

	if (!isUserInChannel(userId, channelId)) {
		return false;
	}

	if (channelId !== "0") {
		return false;
	}

	return true;
}

async function verifyPassword(id, password) {
	const userData = await dbPass.get(`user_${id}`);

	if (typeof userData?.passhash !== 'string') return false;

	if (!(await bcrypt.compare(password, userData?.passhash))) {
		return false;
	}

	return true;
}

async function createUser(email, username, password) {
	if (findIdByUsername(username) !== null) return null; 
	if (findIdByEmail(email) !== null) return null;

	const passhash = await bcrypt.hash(password, 10);
	const id = snowflakeGen.getUniqueID();

	const userData = {
		email,
		username,
		passhash
	}

	await dbPass.set(`user_${id}`, userData);

	return id;
}

module.exports = {
	findIdByUsername,
	findIdByEmail,
	createToken,
	verifyToken,
	getUserData,
	isUserInGuild,
	isUserAllowedToParticipateInChannel,
	verifyPassword,
	createUser
}
