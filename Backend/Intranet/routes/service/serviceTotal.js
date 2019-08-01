const db = require('idb-connector');
var fs = require('fs');
var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	servResponse(req,res,next);
});
router.post('/',function(req,res,next){
	servResponse(req,res,next);
});
function servResponse (req, res, next) {
	var rtn = {
		"trev":0,
		"frev":0,
		"totrev":0,
		"tbills":0,
		"avgst":0,
		"glst":0
	};	
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sql;	
	sql = "SELECT LTEFIN, @UNCODED AS UNCODED, @UNRATED AS UNRATED, CMAOTR,CMAOFL,CMAOGL FROM EC.ECL504W1";
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function(rs) {
		sqlA.close();
		rtn.trev = Number(rs[0].CMAOTR);
		rtn.tbills = Number(rs[0].LTEFIN) + Number(rs[0].UNCODED) + Number(rs[0].UNRATED);
		rtn.totrev = Number(rs[0].CMAOTR) + Number(rs[0].CMAOFL);
		rtn.frev = Number(rs[0].CMAOFL);
		sql = "SELECT SYSAVG FROM RV.RVT420W1";
		var sqlB = new db.dbstmt(dbconn);
		sqlB.exec(sql, function(rs2) {
			sqlB.close();
			rtn.avgst = rs2[0].SYSAVG;
			sql = "SELECT * FROM RV.TRLGLMASTF WHERE TRLTRM='TTL'";
			var sqlC = new db.dbstmt(dbconn);
			sqlC.exec(sql, function(rs3) {
				sqlC.close();
				rtn.glst = rs3[0].TRLAVG;
				res.send(JSON.stringify(rtn));
				dbconn.disconn();
				dbconn.close();
			});
		});
	});
}

module.exports = router;