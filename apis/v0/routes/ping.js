module.exports = {
	method: "get",
	path: "ping",
	async execute(req, res, next) {
		res.json({
			success: true,
			code: 0,
			date: Date.now()
		});
		return;
	}
}
