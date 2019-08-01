const db = require('idb-connector');
var fs = require('fs');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.slrep);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.slrep);
});
function servResponse(req, res, next, slrep) {
	var  date = new Date();
	var year = Number(date.getFullYear()-2);
	
	var sql;
	if(slrep == "MGR" || slrep == "ALL" || slrep == "DPI"){
		sql = "SELECT s.SLSREP, s.SLSNAM, SUM(r.RAOREV) AS REV, r.RAYEAR, r.RAPERD "+
		"FROM RV.RVTRFM03 AS r "+
		"INNER JOIN (SELECT CMCUST, "+
		"CASE WHEN CMNATL > 0 THEN CMNATL WHEN CMSLSR > 0 THEN CMSLSR ELSE SLREP# END AS SLSREP "+
		"FROM RV.CUSTMM01 LEFT JOIN RV.SLCRFM01 ON SLCNBR=CMCUST) AS c ON c.CMCUST=r.RACUST "+
		"INNER JOIN RV.SLREPM01 AS s ON s.SLSNBR=c.SLSREP "+
		"WHERE r.RACUST != 0 AND r.RAYEAR >= "+ year + " "+
		"AND c.SLSREP > 0 "+
		"GROUP BY r.RAYEAR, r.RAPERD, s.SLSREP, s.SLSNAM "+       
		"ORDER BY r.RAYEAR, r.RAPERD";
	}else if(slrep == ""){
		res.send(JSON.stringify({'error':'Sales rep number not found.'}));
	}else{
		sql = "SELECT s.SLSREP, s.SLSNAM, SUM(r.RAOREV) AS REV, r.RAYEAR, r.RAPERD "+
		"FROM RV.RVTRFM03 AS r "+
		"INNER JOIN (SELECT CMCUST, "+
		"CASE WHEN CMNATL > 0 THEN CMNATL WHEN CMSLSR > 0 THEN CMSLSR ELSE SLREP# END AS SLSREP "+
		"FROM RV.CUSTMM01 LEFT JOIN RV.SLCRFM01 ON SLCNBR=CMCUST) AS c ON c.CMCUST=r.RACUST "+
		"INNER JOIN RV.SLREPM01 AS s ON s.SLSNBR=c.SLSREP "+
		"WHERE r.RACUST != 0 AND r.RAYEAR >= "+ year + " "+
		"AND c.SLSREP = "+ slrep + " " + 
		"GROUP BY r.RAYEAR, r.RAPERD, s.SLSREP, s.SLSNAM "+       
		"ORDER BY r.RAYEAR, r.RAPERD";
	}
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, (rs,err) => {
		sqlA.close();
		dbconn.disconn();
		dbconn.close();	
		if(err){
			console.log("ERR90002 " + err);
			console.log(sql);
		}else{
			// console.log(sql);
			if(slrep == "DPI")
			res.send(JSON.stringify({sql:sql,data:rs}));
			else
			res.send(JSON.stringify(rs));
		}
	});

}

module.exports = router;
