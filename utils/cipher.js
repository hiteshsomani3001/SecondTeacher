var crypto = require('crypto');
var hashPwd = function(salt, pwd){
	var hmac = crypto.createHmac('sha1', salt);
	return hmac.update(pwd).digest('hex');
};

var createSalt = function(){
	return crypto.randomBytes(120).toString('base64');
};
module.exports.hashPwd = hashPwd;
module.exports.createSalt = createSalt;