let db = require('idb-connector');
let express = require('express');
let auth = require('./AuthToken.ts');
let router = express.Router();

router.post('/', function (req, res, next) {

	//SET VARIABLES HERE
	let results = [];
	let features = [];
	let siteKey = "";
	let customerNumbers = [];
	let userId = "";
	let user;
	let password;
	let host;
	let dbconn = new db.dbconn();
	dbconn.conn("DPI", "DPIOPS", "CHEX");

	if (req.body.user == null || req.body.password == null) {
		results = {
			'error': 'User and Password required.'
		};
		res.send(JSON.stringify(results));
	} else {
		user = req.body.user.toUpperCase();
		password = req.body.password.toUpperCase();
		// host = req.headers.hostname;
		host = req.get('origin');
		let sql = "SELECT MF.CWUSERID, MF.CWPASSWORD, MF.CWSITEKEY, MF.ACTIVE, DF.CMCUST, DF.CWFEATURE " +
			"FROM RV.CUSWBM02 MF JOIN RV.CUSWBDETLF DF on DF.CWUSERID = MF.CWUSERID " +
			"WHERE MF.CWUSERID = '" + user + "' AND MF.CWPASSWORD = '" + password + "'";

		console.log("Login Attempt by: " + user + " at: " + host);

		//console.time('userQuery');

		var sqlA = new db.dbstmt(dbconn);
		sqlA.exec(sql, function (rs) {

			sqlA.close();
			dbconn.disconn();
			dbconn.close();
			//console.timeEnd('userQuery');

			if (rs[0] == null) {
				results = {
					'Error': 'User and Password incorrect.'
				};

				console.log("Login Failed by: " + user + " at: " + host);

				res.send(JSON.stringify(results));
			} else {

				if (rs[0] != null) {

					// User and Active flag assume all features 
					for (let [key, val] of rs.entries()) {
						userId = val.CWUSERID;
						siteKey = val.CWSITEKEY;
						features[key] = val.CWFEATURE;
						customerNumbers[key] = val.CMCUST;
					}

					console.debug("UserId: " + userId);
					console.debug("SiteKey: " + siteKey);
					console.debug("Features: " + features);
					console.debug("customerNumbers: " + customerNumbers);

					auth.encodeToken(
						userId.trim(),
						siteKey.trim(),
						features,
						customerNumbers,
						(token) => {

							console.debug("Token: " + token);
							var successMessage = "";
							var failedMessage = "";

							if (token.length > 5) {
								successMessage = 'Logged in as ' + userId;
								console.log("Login Success by: " + user + " at: " + host);
							} else {
								failedMessage = 'Login Failed!!';
								console.log("Login Failed by: " + user + " at: " + host);
							}

							results = {
								"UserId": userId.trim(),
								"SiteKey": siteKey.trimLeft(),
								"Features": features,
								"CustomerNumbers": customerNumbers,
								"TOKEN": token,
								"Success": successMessage,
								"Failed": failedMessage,
								"Error": ""
							};

							res.send(JSON.stringify(results));

						}
					);


				}
			}

		});

	}
});

module.exports = router;