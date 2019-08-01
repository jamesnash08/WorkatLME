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
	var year = Number(date.getFullYear()-2).toString().substring(2);
	
	var sql;
	if(slrep == "MGR" || slrep == "ALL" || slrep == "DPI"){
		sql = "SELECT s.SLSREP, s.SLSNAM, r.SRAVGT AS REV, r.SRYYEAR AS RAYEAR, r.SRYMNTH AS RAPERD "+
		"FROM RV.SRRVYMASTF AS r "+
		"INNER JOIN RV.SLREPM01 AS s ON s.SLSREP=r.SRYNMBR "+
		"WHERE r.SRYYEAR >= "+ year + " "+
		"AND s.SLSREP > 0 "+       
		"ORDER BY RAYEAR, RAPERD";
	}else if(slrep == ""){
		res.send(JSON.stringify({'error':'Sales rep number not found.'}));
	}else{
		sql = "SELECT s.SLSREP, s.SLSNAM, r.SRAVGT AS REV, r.SRYYEAR AS RAYEAR, r.SRYMNTH AS RAPERD "+
		"FROM RV.SRRVYMASTF AS r "+
		"INNER JOIN RV.SLREPM01 AS s ON s.SLSREP=r.SRYNMBR "+
		"WHERE r.SRYYEAR >= "+ year + " "+
		"AND s.SLSREP = "+ slrep + " " +     
		"ORDER BY RAYEAR, RAPERD";
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
