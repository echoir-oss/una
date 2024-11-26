const sleep = (ms) => new Promise((a) => setTimeout(a, ms));

function isProcessAlive(pid) {
	try {
		const ret = process.kill(pid, 0);

		return ret ? 1 : 0;
	} catch (e) {
		if (e.code === 'EPERM') return 1;
		if (e.code === 'ESRCH') return 0;
	}
}

function isStringSafe(string) {
	for (let i = 0; i < string.length; i++) {
		const charcode = string.charCodeAt(i);

		if (string[i] === '.') return false;
		if (string[i] === '/') return false;

		if (charcode > 255) return false;
		if (charcode < 32) return false;
	}
	
	return true;
}

module.exports = {
	sleep,
	isProcessAlive,
	isStringSafe
};
