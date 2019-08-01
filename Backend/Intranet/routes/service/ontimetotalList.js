const db = require('idb-connector');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, "" + req.query.trm);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, "" + req.body.trm);
});
function servResponse(req, res, next, trm) {
	var curdate = new Date();
	var ldate = "1" + Number(curdate.getFullYear() - 1).toString().substring(2) + "0101";
	var ndate = Number(ldate);
	if (trm > "" && trm != "ALL" && trm != "TOT")
		trm = "AND RVTRMA='" + trm + "' ";
	else if (trm != "TOT")
		trm = "AND RVTRMA!='ALL' ";
	var dbconn = new db.dbconn();
	var sql;
	if (trm == "TOT") {
		sql = "SELECT TMCYMD, SLTSOC + SLT4OC AS SHIP, SLTOOC + SLT4OC AS ONTIME, " +
		"SLT4IC + SLTSIC + STL4IC + STLSIC AS TOT9AM, SLT4IC + SLTSIC + STL4IC + STLSIC - SLT3IC AS SHP9AM " +
			"FROM RV.TMRVTH03 " +
			"WHERE TMCYMD >= " + ndate + " " +
			"ORDER BY TMCYMD ASC";
	} else {
		sql = "SELECT RVTRMA, TMCYMD, SLTSOC + SLT4OC AS SHIP, SLTOOC + SLT4OC AS ONTIME, t.TMSUPCARTG AS LME, " +
			"SLT4IC + SLTSIC + STL4IC + STLSIC AS TOT9AM, SLT4IC + SLTSIC + STL4IC + STLSIC - SLT3IC AS SHP9AM " +
			// ", (SLT4IC + SLTSIC + STL4IC + STLSIC - SLT3IC) /	(SLT4IC + SLTSIC + STL4IC + STLSIC) * 100 AS PCT9AM " +
			"FROM RV.TMRVTHISTF " +
			"INNER JOIN SY.TRMLSM01 as t ON RVTRMA=t.TMTRMLCODE " +
			"WHERE TMCYMD >= " + ndate + " " + trm +
			"ORDER BY TMCYMD ASC, RVTRMA";
	}
	dbconn.conn("*LOCAL");
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs) {
		sqlA.close();
		res.send(JSON.stringify(rs));
		dbconn.disconn();
		dbconn.close();
	});
	
}

module.exports = router;