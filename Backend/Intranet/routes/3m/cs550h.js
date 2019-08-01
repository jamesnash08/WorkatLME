const db = require('idb-connector');
var express = require('express');
var router = express.Router();
var version = 1.0;

router.get('/', function (req, res, next) {
	servResponse(req, res, next);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next);
});
function servResponse(req, res, next) {
	var curdate = new Date();
	var ldate = Number(curdate.getFullYear().toString() + "" + get2Digit(curdate.getMonth() + 1) + "" + get2Digit(curdate.getDate()));
	var sql = "SELECT MTHNBR, YEAR, COUNT(PRO) AS SHP, SUM(WEIGHT) AS WGT, SUM(TPLT) AS PLT, SUM(TPCS) AS PCS, SUM(FUEL) AS FUEL, SUM(NETCHG) AS NETCHG, SUM(ACCESS) AS ACCESS, SUM(GRSCHG) AS GRSCHG, SUM(MILESDD) AS MILESDD, SUM(MILESLN) AS MILESLN, SUM(CASE WHEN ONTIME='Y' THEN 1 ELSE 0 END) AS ONTIME " +
	"FROM CS.CS550HISTF AS c " +
	"LEFT JOIN SY.CDATEM03 ON CYMD=c.DLVDTE " +
	"GROUP BY MTHNBR, YEAR ORDER BY YEAR DESC, MTHNBR ASC";
	// console.log(sql);
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");

	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs, err) {
		sqlA.close();
		if (err) {
			dbconn.disconn();
			dbconn.close();
			console.log("ERR90002 " + err);
			console.log("ERR90002 " + sql);
			res.send(JSON.stringify({ 'error': 'error with data' }));
		} else {			
			dbconn.disconn();
			dbconn.close();
			res.send(JSON.stringify(rs));
		}
	});

}

function get2Digit(val) {
    if (val.toString().length == 1)
        return "0" + val.toString();
    else
        return val.toString();
}

module.exports = router;