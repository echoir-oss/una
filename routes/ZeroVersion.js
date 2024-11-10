module.exports = {
	method: 'get',
	path: '/api/v0/version',
	async execute(req, res) {
		res.end(require('../package.json').version);
	}
}
