const db = require('idb-connector');
var fs = require('fs');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.slsrep, req.query.period, req.query.year);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.slsrep, req.body.period, req.body.year);
});
function servResponse(req, res, next, slsrep, period, year) {
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sql;
	var periods;
	if(!isNaN(period))
	periods = "r.RAPERD="+period + " ";
	else if(period == "A1"){
		periods = "r.RAPERD>=1 AND r.RAPERD <=3 ";
	}else if(period == "A2"){
		periods = "r.RAPERD>=4 AND r.RAPERD <=6 ";
	}else if(period == "A3"){
		periods = "r.RAPERD>=7 AND r.RAPERD <=9 ";
	}else if(period == "A4"){
		periods = "r.RAPERD>=10 AND r.RAPERD <=12 ";
	}



	sql = "SELECT r.RACUST, c.CMNAME, SUM(r.RAOREV) AS REV, SUM(r.RATWGT) AS WGT "+
	"FROM RV.RVTRFM03 AS r "+
	"INNER JOIN (SELECT CMCUST, CMNAME, "+
	"CASE WHEN CMNATL > 0 THEN CMNATL WHEN CMSLSR > 0 THEN CMSLSR ELSE SLREP# END AS SLSREP "+
	"FROM RV.CUSTMM01 LEFT JOIN RV.SLCRFM01 ON SLCNBR=CMCUST) AS c ON c.CMCUST=r.RACUST "+
	"INNER JOIN RV.SLREPM01 AS s ON s.SLSNBR=c.SLSREP "+
	"WHERE r.RACUST != 0 AND r.RAYEAR = 20"+ year + " AND s.SLSREP="+ slsrep + " AND " +
	periods +
	"GROUP BY r.RACUST, c.CMNAME "+    
	"UNION ALL " + 
	"SELECT r.RACUST, c.CMNAME, SUM(CASE WHEN 1>0 THEN r.RAOREV * p.SLSPCT ELSE 0 END) AS REV, SUM(r.RATWGT) AS WGT "+
	"FROM RV.RVTRFM03 AS r "+
	"INNER JOIN RV.CUSSPM01 AS p ON p.TRFCUST=r.RACUST "+
	"INNER JOIN RV.CUSTMM01 AS c ON c.CMCUST=r.RACUST " + 
	"INNER JOIN RV.SLREPM01 AS s ON s.SLSREP=p.SUBSLS "+
	"WHERE r.RACUST != 0 AND r.RAYEAR = 20"+ year + " AND s.SLSREP="+ slsrep + " AND  p.EXPDATE = 9999999 AND " +
	periods +
	"GROUP BY r.RACUST, c.CMNAME "+  
	"ORDER BY REV DESC";
	console.log(sql);
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, (rs,err) => {
		sqlA.close();
		dbconn.disconn();
		dbconn.close();	
		if(rs == null || rs.length == 0)
			rs = {'error':'no details found'};
		if(err){
			console.log("ERR90002 " + err);
			console.log(sql);
			res.send(JSON.stringify({error:err.toString()}))
		}else		
			res.send(JSON.stringify(rs));
	});

}

module.exports = router;
