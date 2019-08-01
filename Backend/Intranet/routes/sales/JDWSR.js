const db = require('idb-connector');
var fs = require('fs');

var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {

	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sql;
	sql = "SELECT JDCUST# AS JDCUST, JDYEAR, JDMNTH, JDWGT, JDSHP, JDREV, JDSORT FROM RV.JDWSRM01 ORDER BY JDCUST, JDYEAR, JDSORT";
	var record = {};
	var results = [];
	var sqlA = new db.dbstmt(dbconn);

	sqlA.exec(sql, function(rs) {
		sqlA.close();
		
		//console.log(results);
		res.send(JSON.stringify(rs));
		dbconn.disconn();
		dbconn.close();	
	});

	

});

module.exports = router;
