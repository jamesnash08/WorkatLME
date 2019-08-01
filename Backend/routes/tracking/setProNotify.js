// var xt = require("itoolkit");//10a 10p0 10z0
var db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.pros, req.query.email, req.query.type);
}); 
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.pros, req.body.email, req.body.type);
});

function servResponse(req, res, next, pros, email, type) {
	var dbconn = new db.dbconn();
	dbconn.conn("DPI", "DPIOPS", "CHEX");
	var sql;
	for (var i = 0; i < pros.length; i++) {
		sql = "INSERT INTO SY.TRKNTTRANF " +
			"(PRO,EMAIL,NOTIFY)" +
			"VALUES (" + pros[i] + ",'" + email + "','" + type + "')";
		var sqlA = new db.dbstmt(dbconn);
		sqlA.exec(sql, function (err) {
			if(err){
				console.log("ERR90002 " + err);
				console.log(sql);
			}
		});
	}
	//if (i == pros.length - 1)
				res.send(JSON.stringify({ "success": "Notification set" }));
}

module.exports = router;