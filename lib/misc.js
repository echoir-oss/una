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

module.exports = {
	sleep,
	isProcessAlive
};
