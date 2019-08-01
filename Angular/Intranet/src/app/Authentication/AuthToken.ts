import * as moment from 'moment';
import * as jwt    from 'jwt-simple';

declare var module: any

// HS256 secrets are typically 128-bit random strings, for example hex-encoded:
//var secret = Buffer.from('fe1a1915a379f3be5394b64d14794932', 'hex');
var secret = "\xbfW\xf7\x9a\xee\xa8\xb3\xbf\x17\xdb\x18\xb1\xcb\xd8\xc5\xd4\x15\x03_\xcc\xbf\x80\xb1\xbc";

function encodeToken(user, email, trm, auth) {

	var playload = {
		exp: moment().add(8, 'hour').set({hour:0,minute:0,second:0}).unix(),
		iat: moment().unix(),
		user: user,
		email: email,
		intTrm: trm,
		intAuth: auth
	};

	return jwt.encode(playload, secret);

}

function decodeToken(token, callback) {
	try {
		var payload = jwt.decode(token, secret);
		var now = moment().unix();
		// check if the token has expired
		if (now < payload.exp) {
			callback({ "Success": "Logged in as " + payload.user}, payload);
		}
	} catch(Error) {
		callback({ "Expired": "Logged out (Token Expired)" }, {});
	}
}

module.exports = {
  encodeToken,
  decodeToken
};
