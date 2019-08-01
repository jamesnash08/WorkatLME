const db = require('idb-connector');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.trm, req.query.cymd);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.trm, req.body.cymd);
});
function servResponse(req, res, next, trm, cymd) {

	if (trm > "" && trm != "ALL")
		trm = " AND ORGKEY='" + trm + "' OR DSTKEY='" + trm + "' AND DLVDAT=" + cymd + " ";
	else 
		trm = " ";
	var dbconn = new db.dbconn();
	var sql = "SELECT PRO, PICKUP, SHPNAM, SHPCTY, SHPZP6, CNSNAM, CNSCTY, CNSZP6, STDDAY, WRKDAY, EXCCOD, ORGKEY, DSTKEY, AFTER9, DLVDAT " +
	"FROM RV.LATSHTRANF " +
	"WHERE DLVDAT=" + cymd + trm +
	"ORDER BY ORGKEY, DSTKEY, PRO";
	
	dbconn.conn("*LOCAL");
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs) {
		sqlA.close();
		res.send(JSON.stringify(rs));
		dbconn.disconn();
		dbconn.close();
	});
	
}

module.exports = router;