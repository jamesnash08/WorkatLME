const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.trm);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.trm);
});
function servResponse(req, res, next, trm) {
	
	var date;
	var wsql = "INNER JOIN VM.SFEMPM02 AS s ON s.SFTERM='"+trm+"' AND DRIVERID=s.DRVNUM ";
	if(trm == "ALL")
		wsql = "INNER JOIN VM.SFEMPM02 AS s ON DRIVERID=s.DRVNUM ";
	var sql = "select EID,TRIM(VEHICLE_NUMBER) AS VEHICLE_NUMBER,TRIM(DRIVERID) AS DRIVERID,EFFECTIVE_datetime, event_data "+
	"FROM PNFILES.elogevents "+
	wsql +
	"WHERE EID IN ('LI','LO') AND DRIVERID NOT LIKE 'TEST%' AND VEHICLE_NUMBER NOT LIKE 'training%' "+
	"ORDER BY DRIVERID, EFFECTIVE_DATETIME";
			
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs) {
		sqlA.close();
		if (rs[0] == null) {
			// console.log(sql);
			res.send(JSON.stringify({ 'error': 'No results found'}));
		} else {
			res.send(JSON.stringify(rs));
		}
		dbconn.disconn();
      dbconn.close();
	});
	
}

module.exports = router;