const burgerdatabase = require("burgerdatabase");

const dbUsers = new burgerdatabase({ path: "./datastore/users.json", noGzip: true });
const dbPass = new burgerdatabase({ path: "./datastore/auth.json", noGzip: true });

(async () => {
	const pass = dbPass.all();

	for (const [key, value] of Object.entries(pass )) {
		const passData = dbPass.get(key);

		const passDataA = {
			version: "0",
			email: passData.email,
			passhash: passData.passhash
		}
		const userDataA = {
			version: "0",
			username: passData.username
		}

		dbUsers.set(key, userDataA);
		dbPass.set(key, passDataA);
	}
})();
