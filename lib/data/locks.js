const fsPromises = require('node:fs/promises');

async function fsExists(path) {
	try {
		const temp = await fsPromises.stat(path);

		return 1;
	} catch (e) {
		if (e.code === 'ENOENT') {
			return 0;
		}

		throw e;
	}
}

const genericLocks = {
	async await(type, id) {
		const path = `./data/${type}/${id}/lock`;
		let i = 0;
	
		while (1) {
			const exist = await fsExists(path);
	
			if (!exist) {
				break;
			}
	
			const content = fs.readFileSync(path).toString();
			if (!isProcessAlive(parseInt(content))) {
				genericLockUnlock(type, id);
				break;
			}
	
			await sleep(10);
		}
	
		return 0;
	},
	async unlock(type, id) {
		const path = `./data/${type}/${id}/lock`;
	
		await fsPromises.unlink(path);
	},
	async lock(type, id) {
		const path = `./data/${type}/${id}/lock`;
	
		await fsPromises.writeFile(path, `${process.pid}`);
	
		return process.pid;
	}
}

const channelsExport = {
	async await(id) {
		return await genericLocks.await('channels', id);
	},
	async lock(id) {
		return await genericLocks.lock('channels', id);
	},
	async unlock(id) {
		return await genericLocks.unlock('channels', id);
	}
};

const guildsExport = {
	async await(id) {
		return await genericLocks.await('guilds', id);
	},	
	async lock(id) {
		return await genericLocks.lock('guilds', id);
	},
	async unlock(id) {
		return await genericLocks.unlock('guilds', id);
	}
};

const accountsExport = {
	async await(id) {
		return await genericLocks.unlock('accounts', id);
	},
	async lock(id) {
		return await genericLocks.lock('accounts', id);
	},	
	async unlock(id) {
		return await genericLocks.unlock('accounts', id);
	}
};


/* tokens don't need a locking mechanism lol */

module.exports = {
	accounts: accountsExport,
	channels: channelsExport,
	guilds: guildsExport
};
