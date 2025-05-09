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
const path = require("node:path");
const fs = require("node:fs");

globalThis.loadSQL = (sqlPathRelative) => {
	const sqlPathAbsolute = path.join(process.cwd(), "sql", `${sqlPathRelative}.sql`);

	return fs.readFileSync(sqlPathAbsolute, "utf8");
}

module.exports = {
	findGuildIdOfChannel: require("./findGuildIdOfChannel.js"),
	isUsernameTaken: require("./findIdByUsername.js"),
	getUserGuildIds: require("./getUserGuildIds.js"),
	verifyPassword: require("./verifyPassword.js"),
	getChannelData: require("./getChannelData.js"),
	findIdByEmail: require("./findIdByEmail.js"),
	findIdByToken: require("./findIdByToken.js"),
	isUserInGuild: require("./isUserInGuild.js"),
	createMessage: require("./createMessage.js"),
	getGuildData: require("./getGuildData.js"),
	createGuild: require("./createGuild.js"),
	createToken: require("./createToken.js"),
	createUser: require("./createUser.js")
};
