/* 
 * Copyright (C) 2025 Emilia Luminé <legal@eqilia.eu>
 *
 * This file is part of Una, from Echoir (echoir.fr)
 *
 * Una is free software: you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License, version 3.
 * 
 * Una is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 * You should've received a copy of the GNU Affero General Public License along
 * with Una. If not, see <https://www.gnu.org/licenses>
*/

const process = require("node:process");

const uuid = require("uuid");

const queryA = globalThis.loadSQL("40-createGuildEntry");
const queryB = globalThis.loadSQL("20-addUserToGuild");
const queryC = globalThis.loadSQL("20-addChannelToGuild");

const createChannel = require("./createChannel.js");

module.exports = async (ownerId, guildName) => {
	const guildId = uuid.v7();

	const database = await globalThis.pool.connect();

	try {
		await database.query("BEGIN;");
		const resultA = await database.query(queryA, [guildId, guildName, ownerId, [], [ownerId]]);
		const resultB = await database.query(queryB, [guildId, ownerId]);
		const channelId = await createChannel(database, guildId, "general");
		const resultC = await database.query(queryC, [channelId, guildId]);
	} catch (e) {
		await database.query("ROLLBACK;");
		return null;
	}

	await database.query("COMMIT;");

	database.end();

	return guildId;
}
