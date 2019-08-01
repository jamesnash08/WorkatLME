const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, "" + req.query.trm, req.query.date);
});
router.post('/', function (req, res, next) {
	servResponse(req, res, next, "" + req.body.trm, req.body.date);
});

function servResponse(req, res, next, trm, date) {
	//SET VARIABLES HERE
	var results = [];
	var dbconn = new db.dbconn();
	var curdate = new Date();
	var ldate = "1" + Number(curdate.getFullYear() - 1).toString().substring(2) + "0101";
	var ndate = Number(ldate);
	var trmstmt;
	var groupby;
	if (trm == "ALL") {
		trmstmt = " ";
		groupby = "CYMD ";
	} else {
		trmstmt = " AND TRM='" + trm + "' ";
		groupby = "CYMD, TRM ";
	}
	var sql;
	if (date > 0) {
		sql = "SELECT a.*, s.FNAME, s.LNAME " +
			"FROM (SELECT EMP, TRM, CYMD, COUNT(PRO) as SCANS, COUNT(DISTINCT PRO) AS PROS " +
			", SUM(CASE WHEN WEIGHT > 0 THEN 1 ELSE 0 END) AS SCANW " +
			"FROM RV.FSDIMD01 " +
			// "JOIN VM.SFEMPM01 AS s ON s.DRVNUM=EMP " +
			"WHERE CYMD=" + date + trmstmt +
			"GROUP BY EMP, TRM, CYMD " +
			"ORDER BY TRM, EMP) AS a " +
			"LEFT JOIN VM.SFEMPM01 as s ON CAST(s.DRVNUM AS varchar(6))=a.EMP";
	} else {
		sql = "SELECT CYMD, COUNT(PRO) as SCANS, COUNT(DISTINCT PRO) AS PROS, " +
			"SUM(CASE WHEN WEIGHT > 0 THEN 1 ELSE 0 END) AS SCANW " +
			"FROM RV.FSDIMD01 " +
			"WHERE CYMD >= " + ndate + trmstmt +
			"GROUP BY " + groupby +
			"ORDER BY CYMD DESC";
	}
	dbconn.conn("*LOCAL");
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs,err) {
		console.log(sql);
		if(err){
			console.log("ERR90002 " + err);
			console.log("ERR90002 " + sql);
		}
		sqlA.close();
		
		if (!rs[0]) {
			res.send(JSON.stringify({ 'error': 'No results found' }));
		} else {
			res.send(JSON.stringify(rs));
		}
		dbconn.disconn();
		dbconn.close();
	});

}
module.exports = router;

function get2Digit(val) {
	if (val.toString().length == 1)
		return "0" + val.toString();
	else
		return val.toString();
}