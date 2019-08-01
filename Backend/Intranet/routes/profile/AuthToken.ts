let moment = require('moment');
let jwt = require('jwt-simple');

// HS256 secrets are typically 128-bit random strings, for example hex-encoded:
//var secret = Buffer.from('fe1a1915a379f3be5394b64d14794932', 'hex');
let secret = "xxx";

function encodeToken(user, email, trm, auth, callback) {

	let payload = {
		exp: moment().add(12, 'hour').unix(),
		iat: moment().unix(),
		user: user,
		email: email,
		intTrm: trm,
		intAuth: auth
	};

	console.debug("Encode Current:" + moment().unix());
	console.debug("Encode Payload Login time:" + payload.iat);
	console.debug("Encode Payload Expired:" + payload.exp);
	callback(jwt.encode(payload, secret));

}

function decodeToken(token, callback) {

	try {

		let payload = jwt.decode(token, secret, true);

		console.debug("Payload: " + JSON.stringify(payload));

		let now = moment().unix();

		console.debug("Decode Current:            " + now);
		console.debug("Decode Payload Login time: " + payload.iat);
		console.debug("Decode Payload Expired:    " + payload.exp);

		// check if the token has expired
		if (now < payload.exp) {

			console.debug(payload.user + "\'s Token is Active!!");
			callback({ "Success": "Logged in as " + payload.user }, payload);

		} else {
			console.debug(payload.user + "\'s Token Expired!!");
			callback({ "Expired": "Logged out (Token Expired)" }, {});
		}

	} catch (Error) {
		console.debug("Error: " + JSON.stringify(Error));
		callback({ "Error": "Logged out!!" }, {});
	}

}

module.exports = {
	encodeToken,
	decodeToken
};

