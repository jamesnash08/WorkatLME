var db = require('idb-connector');
var express = require('express');
var auth = require('./AuthToken.ts');
var router = express.Router();
var dbconn = new db.dbconn();
dbconn.conn("*LOCAL","DPIOPS","CHEX");

router.post('/', function (req, res, next) {

	//SET VARIABLES HERE
	var results = [];
	var user;
	var password;
	var host;
	
	if (req.body.user == null || req.body.password == null) {
		results = {
			'Error': 'User and Password required.'
		};
		res.send(JSON.stringify(results));
		
	} else {
		user = req.body.user.toUpperCase();
		password = req.body.password.toUpperCase();
		host = req.connection.remoteAddress.split(':')[3];
		var sql = "SELECT USRPR, USRPW, USREM FROM SY.USRPWX01 WHERE USRPR='" + user + "' AND USRPW='" + password + "'";

		console.log(req.headers);

		
		console.log("Login Attempt by: " + user + " at: " + host);

		var sqlA = new db.dbstmt(dbconn);
		sqlA.exec(sql, function (rs,err) {
			sqlA.close();
			if (rs[0] == null) {
				results = {
					'Error': 'User and Password incorrect.'
				};
				console.log("Login Failed by: " + user + " at: " + host);
				res.send(JSON.stringify(results));
				
			} else {
				console.log("User and password found. getting authority");
				var sql = "SELECT * FROM SY.INTPWM01 WHERE INTPR='" + user + "'";
				var sqlB = new db.dbstmt(dbconn);
				sqlB.exec(sql, function (rs2,err) {
					sqlB.close();
					console.debug(rs2);
					if (rs2[0] == null) {
						auth.encodeToken(
							rs[0].USRPR.trim(),
							rs[0].USREM.trim(),
							"",
							"",
							(token) => {
								results = {
									"USRPR": rs[0].USRPR.trim(),
									"USRPW": rs[0].USRPW.trim(),
									"USREM": rs[0].USREM.trim(),
									"INTTRM": " ",
									"INTAUTH": " ",
									"TOKEN": token

								};
								console.log("Login Success by: " + user + " at: " + host);
								res.send(JSON.stringify(results));
							
							});
					} else {
						auth.encodeToken(
							rs[0].USRPR.trim(),
							rs[0].USREM.trim(),
							rs2[0].INTTRM.trim(),
							rs2[0].INTAUTH.trim(),
							(token) => {

								results = {
									"USRPR": rs[0].USRPR.trim(),
									"USRPW": rs[0].USRPW.trim(),
									"USREM": rs[0].USREM.trim(),
									"INTTRM": rs2[0].INTTRM,
									"INTAUTH": rs2[0].INTAUTH.trim(),
									"TOKEN": token
								};
								console.log("Login Success by: " + user + " at: " + host);
								res.send(JSON.stringify(results));
								
							});
					}
				});
			}

		});

	}
});

process.on('exit', (code) => {
	dbconn.disconn();
	dbconn.close();
});

module.exports = router;