const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.trm, req.query.fdate, req.query.tdate);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.trm, req.body.fdate, req.body.tdate);
});
function servResponse(req, res, next, trm, fdate, tdate) {
	
	var sql = "SELECT c.CPTRMA, t.TLDATE, c.CPTRLR, c.CPDRVR, t.TLSTRT, c.CPRTTM, t.TLLNHL, "+
	"TRUNC(c.CPLVTM/100,2) AS LEAVE,t.TLDRIV, s.FNAME, s.LNAME, t.TLSTOP, t.TLDOCK, c.CPCLTM, e.START, e.TRNUSR "+
	"FROM EC.TLHRSH01 as t "+
	"INNER JOIN EC.CPUDLM01 as c ON c.CPDRVR=t.TLEMP# AND "+
	"SUBSTRING(c.CPCLDT,2)=t.TLDATE "+
	"LEFT JOIN VM.SFEMPM01 as s ON s.DRVNUM=t.TLEMP# "+
	"LEFT JOIN SY.EMPPTM01 AS e ON s.DRVNUM=e.EMP " + 
	//"WHERE t.TLTRML='"+trm+"' AND t.TLDATE = "+fdate+" AND DEPTCD='DRV'";
	"WHERE t.TLTRML='"+trm+"' AND t.TLDATE >= "+fdate+" AND t.TLDATE <= "+tdate+" AND DEPTCD='DRV' ORDER BY c.CPDRVR, t.TLSTRT";
	// AND c.CPCLTM != 0
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs,err) {
		sqlA.close();
		if (err) {
			console.log("ERR9002 " +err);
			console.log(sql);
			res.send(JSON.stringify({ 'error': 'No results found for TRM' }));
		} else {
			res.send(JSON.stringify(rs));
		}
		dbconn.disconn();
      	dbconn.close();
	});
	
}

module.exports = router;