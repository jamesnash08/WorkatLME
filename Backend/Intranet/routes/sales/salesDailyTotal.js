const db = require('idb-connector');
var fs = require('fs');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {

	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sql;
	sql = "select * from rv.srrvym01 where sryyear = ( SELECT VARCHAR_FORMAT(CURRENT TIMESTAMP, 'YY') FROM SYSIBM.SYSDUMMY1 ) and srymnth = ( SELECT VARCHAR_FORMAT(CURRENT TIMESTAMP, 'MM') FROM SYSIBM.SYSDUMMY1 )";
	var record = {};
	var results = [];
	var sqlA = new db.dbstmt(dbconn);

	sqlA.exec(sql, function(rs) {
		sqlA.close();

		for (var salesPeep = 0;salesPeep < rs.length; salesPeep++) {

			//console.log(rs);
			var id = rs[salesPeep].ID;
			var name = rs[salesPeep].SALESN;
			var month = rs[salesPeep].INTDATE;
			var sales = rs[salesPeep].TAFREV;

			//console.log ("Sales ID: " + id + " Sales Person:" + name + " YearMonth: " + month + " Sales: " + sales );


			//record = {
			//			[id]: id,
			//			[name]: name,
			//			[sales]: sales
			//		};

			//console.log(record);
			//results[.push(record)
			//if (!results[month]) {
			//	results[month] = [];
			//}

			//console.log (results);

			//results[salesPeep] = record;
			results.push(rs[salesPeep]);

		}

		//console.log(results);

		res.send(JSON.stringify(results));
		dbconn.disconn();
      		dbconn.close();	

	});

	

});

module.exports = router;
