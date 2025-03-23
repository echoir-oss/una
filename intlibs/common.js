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

async function getAuthData(id) {
	let authData = await dbPass.get(`user_${id}`);

	if (authData === undefined) return null;
	authData = JSON.parse(authData);

	return authData;
}

async function getUserData(id) {
	let userData = await dbUsers.get(`user_${id}`);

	if (userData === undefined) return null;
	userData = JSON.parse(userData);

	return userData;
}

async function isUserInGuild(userId, guildId) {
	let guildData = dbGuilds.get(guildId);
	
	let status = false;

	if (guildData === undefined) {
		return false;
	}
	guildData = JSON.parse(guildData);

	for (let i = 0; i < guildData.memberIds.length; i++) {
		if (guildData.memberIds[i] === guildData) {
			status = true;
			break;
		}
	}

	return status;
}

async function isUserInChannel(userId, channelId) {
	let channelData = dbChannels.get(channelId);
	if (channelData === undefined) {
		return false;
	}
	channelData = JSON.parse(channelData);

	let guildData = dbGuilds.get(channelData.guildId);
	if (guildData === undefined) {
		return false;
	}
	guildData = JSON.parse(guildData);

	let status = false;

	for (let i = 0; i < guildData.memberIds.length; i++) {
		if (guildData.memberIds[i] === guildData) {
			status = true;
			break;
		}
	}

	return status;
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
		version: "0",
		email,
		username,
		passhash
	}

	await dbPass.set(`user_${id}`, userData);

	return id;
}

async function createDMGroup(name, ownerId, memberIds) {
	const cid = snowflakeGen.getUniqueID();

	const channelData = {
		version: "0",
		name,
		type: "dm",
		ownerId,
		memberIds
	}

	await dbChannels.set(`${cid}`, channelData);

	return cid.toString();
}

async function createChannel(name, guildId) {
	const guildData = dbGuilds.get(guildId);
	if (guildData === undefined) {
		return null;
	}

	const cid = snowflakeGen.getUniqueID();

	const channelData = {
		version: "0",
		name,
		type: "channel",
		guildId
	}

	guildData.channelIds.push(cid);

	globalThis.mainLoop.emit("channelCreate", {
		cid: cid,
		gid: guildId
	});

	await dbGuilds.set(`${guildId}`, guildData);
	await dbChannels.set(`${cid}`, channelData);

	return cid.toString();
}

async function createGuild(name, ownerId) {
	const gid = snowflakeGen.getUniqueID();

	const guildData = {
		version: "0",
		name,
		type: "guild",
		memberIds: [ownerId],
		channelIds: []
	}

	await dbGuilds.set(`${gid}`, guildData);
	return gid.toString();
}

module.exports = {
	findIdByUsername,
	findIdByEmail,
	createToken,
	verifyToken,
	getAuthData,
	getUserData,
	isUserInGuild,
	isUserAllowedToParticipateInChannel,
	verifyPassword,
	createDMGroup,
	createChannel,
	createGuild,
	createUser
}
