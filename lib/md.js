const crypto = require('node:crypto');

function sha512(data) {
	return crypto.createHash('sha512').update(data).digest('hex');
}
