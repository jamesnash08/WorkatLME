const db = require('idb-connector');
var fs = require('fs');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {

	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sql;
	sql = "SELECT SALES# as ID, SALESN, INTDATE, TAFREV FROM RV.RVS480W1 where SALES# in (select distinct SALES# from RV.RVS480W1) and intdate >= '1601' order by ID, INTDATE";
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
