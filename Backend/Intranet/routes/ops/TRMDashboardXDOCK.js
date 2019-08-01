const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, "" + req.query.trm);
});
router.post('/', function (req, res, next) {
	servResponse(req, res, next, "" + req.body.trm);
});

function servResponse(req, res, next, trm) {
	//SET VARIABLES HERE
	var results = [];
	var dbconn = new db.dbconn();
	var curdate = new Date();
	var ldate = "1" + Number(curdate.getFullYear() - 1).toString().substring(2) + "0101";
	var ndate = Number(ldate);

	var wstmt = "WHERE SCEDATE >= " + ndate + " ";
	var wstmt2 = "GROUP BY SCEDATE ";
	var wstmt3 = "ORDER BY SCEDATE DESC";
	var wstmt4 = ""
	if (trm != "ALL" && trm > "") {
		wstmt = "WHERE SCEDATE >= " + ndate + " AND SCTERM='" + trm + "' ";
		var wstmt2 = "GROUP BY SCEDATE ";
		var wstmt3 = "ORDER BY SCEDATE DESC";
		var wstmt4 = "";
	}
	//SUBSTRING(a.SCEDATE,2,2) AS OPPY, SUBSTRING(a.SCEDATE,4,2) AS OPPM,
	var sql = "SELECT SCEDATE" + wstmt4 + ", CAST(COUNT(DISTINCT SCPRO) AS int) AS PROS " +
		"FROM EC.SCNCTMASTF " +
		wstmt +
		wstmt2 +
		"UNION ALL " +
		"SELECT SCEDATE" + wstmt4 + ", COUNT(DISTINCT SCPRO) AS PROS " +
		"FROM EC.SCNCTHISTF " +
		wstmt + wstmt2 + wstmt3;
	dbconn.conn("*LOCAL");

	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs) {
		sqlA.close();
		if (!rs[0]) {
			res.send(JSON.stringify({ 'error': 'No results found' }));
			dbconn.disconn();
			dbconn.close();
		} else {
			sql = "SELECT a.OPCYMD,  CAST(SUM(a.IPSHP) AS int) AS IPSHP, CAST(SUM(a.OPSHP) AS int) AS OPSHP, CAST(SUM(a.XDSHP) AS int) AS XDSHP " +
				"FROM RV.OPINTM01 AS a " +
				"WHERE a.OPCYMD >=" + ndate + " AND a.OPTRM !='ALL' " +
				"GROUP BY a.OPCYMD " +
				"ORDER BY a.OPCYMD DESC";
			if (trm != "ALL" && trm > "") {
				sql = "SELECT a.OPCYMD,  a.IPSHP, a.OPSHP, a.XDSHP " +
					"FROM RV.OPINTM01 AS a " +
					"WHERE a.OPCYMD >=" + ndate + " AND a.OPTRM = '" + trm + "' " +
					"ORDER BY a.OPCYMD DESC";
			}
			//SUBSTRING(a.OPCYMD,2,2) AS OPPY, SUBSTRING(a.OPCYMD,4,2) AS OPPM,
			// dbconn.conn("*LOCAL");

			var sqlB = new db.dbstmt(dbconn);
			sqlB.exec(sql, function (rs2) {
				sqlB.close();
				if (!rs2[0]) {
					res.send(JSON.stringify({ "SCANS": rs }));
				} else {
					res.send(JSON.stringify({ "SCANS": rs, "BILLS": rs2 }));
				}
				dbconn.disconn();
				dbconn.close();
			});
			//res.send(JSON.stringify(rs));
		}
	});

}
module.exports = router;

function get2Digit(val) {
	if (val.toString().length == 1)
		return "0" + val.toString();
	else
		return val.toString();
}