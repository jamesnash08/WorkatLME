const db = require('idb-connector');
var fs = require('fs');


var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	var dbconn = new db.dbconn();
	var sql;
	var rtn = {
		"ontimeD": 0,
		"ontimeT": 0
	};

	sql = "SELECT SLTSOC, SLTOOC, SLT4OC FROM RV.TMRVTH03 WHERE TMCYMD = (SELECT MAX(TMCYMD) FROM RV.TMRVTH03)";
	dbconn.conn("*LOCAL");
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs) {
		rtn.ontimeT = getpercent(parseInt(rs[0].SLTSOC) + parseInt(rs[0].SLT4OC), parseInt(rs[0].SLTOOC) + parseInt(rs[0].SLT4OC));
		sqlA.close();
		sql = "SELECT SLTSOC, SLTOOC, SLT4OC FROM RV.TMRVDH03 WHERE TMCYMD = (SELECT MAX(TMCYMD) FROM RV.TMRVDH03)";
		var sqlB = new db.dbstmt(dbconn);
		sqlB.exec(sql, function (rs) {
			rtn.ontimeD = getpercent(parseInt(rs[0].SLTSOC) + parseInt(rs[0].SLT4OC), parseInt(rs[0].SLTOOC) + parseInt(rs[0].SLT4OC));
			fs.writeFile("/www/lmelocal/htdocs/stored/daily/ontimetotal.txt", JSON.stringify(rtn), function (err) {
				if (err) console.log(err);
			});
			res.send(JSON.stringify(rtn));
			sqlB.close();
			dbconn.disconn();
		dbconn.close();
		});
	});

	
})

function getpercent(totalshipments, ontimeshipments) {
	//console.log(ontimeshipments + " / " + totalshipments);
	totalshipments = totalshipments.toFixed(2);
	ontimeshipments = ontimeshipments.toFixed(2);
	return (ontimeshipments / totalshipments * 100).toFixed(2);
}

module.exports = router;