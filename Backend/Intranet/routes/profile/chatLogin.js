var db = require('idb-connector');
var express 	= require('express');
//var auth 		= require('./AuthToken.ts');
var router 		= express.Router();

router.post('/', function (req, res, next) {

	//SET VARIABLES HERE
	var results = [];
	var user;
	var password;
	var host;
	var dbconn = new db.dbconn();

	if(req.body.user == null || req.body.password == null){
		results = {'error':'User and Password required.'};
		res.send(JSON.stringify(results));
	}else{
		user = req.body.user.toUpperCase();
		password = req.body.password.toUpperCase();
		host = req.headers.hostname;
		var sql = "SELECT USRPR, USRPW, USRNM, USREM FROM SY.USRPWX01 WHERE USRPR='" + user + "' AND USRPW='" + password + "'";

		 dbconn.conn("*LOCAL");
		//console.log("Login Attempt by: " + user + " at: " + host);
		 var sqlA = new db.dbstmt(dbconn);
		 sqlA.exec(sql, function(rs) {
			sqlA.close();
			if(rs[0] == null){
				results = {'error':'User and Password incorrect.'};
				res.send(JSON.stringify(results));
			}else{
				res.send(JSON.stringify(rs));
			}

		});
		
	}
});

module.exports = router;
