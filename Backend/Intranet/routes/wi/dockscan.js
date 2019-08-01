
const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next);
});
router.post('/', function (req, res, next) {
	servResponse(req, res, next);
});

function servResponse(req, res, next) {
	//SET VARIABLES HERE
	var results = [];
	var dbconn = new db.dbconn();
	var curdate = new Date();
	curdate.setDate(curdate.getDate() - 30);
	var ldate = "1" + curdate.getFullYear().toString().substring(2) + "" + get2Digit(curdate.getMonth() + 1) + "" + get2Digit(curdate.getDate());
	var ndate = Number(ldate);
	var sql = "SELECT a.SCEDATE, a.SCTERM, COUNT(a.SCPRO) as SCANS, COUNT(DISTINCT a.SCPRO) AS PROS " +
		"FROM EC.SCNCTMASTF as a " +
		"WHERE a.SCEDATE >= " + ndate + " " +
		"GROUP BY a.SCEDATE, a.SCTERM " +
		"UNION ALL " +
		"SELECT b.SCEDATE, b.SCTERM, COUNT(b.SCPRO) as SCANS, COUNT(DISTINCT b.SCPRO) AS PROS " +
		"FROM EC.SCNCTHISTF as b " +
		"WHERE b.SCEDATE >= " + ndate + " " +
		"GROUP BY SCEDATE, SCTERM " +
		"ORDER BY SCEDATE DESC, SCTERM";

	dbconn.conn("*LOCAL");

	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs) {
		sqlA.close();
		if (!rs[0]) {
			dbconn.disconn();
			dbconn.close();
			res.send(JSON.stringify({ 'error': 'No results found' }));
		} else {
			sql = "SELECT a.OPCYMD AS SCEDATE, a.OPTRM AS SCTERM, a.IPSHP + a.OPSHP + a.XDSHP AS BILLS " +
				"FROM RV.OPINTM01 AS a " +
				"WHERE a.OPCYMD >=" + ndate + " AND a.OPTRM !='ALL' " +
				"ORDER BY a.OPCYMD, a.OPTRM";

			dbconn.conn("*LOCAL");

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