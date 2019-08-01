const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.trm, req.query.trlr, req.query.cdate, req.query.ctime);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.trm, req.body.trlr, req.body.cdate, req.body.ctime);
});
function servResponse(req, res, next, trm, trlr, cdate, ctime) {
	var sql = "SELECT * "+
	"FROM EC.CPUDLD02 "+
	"WHERE CPTRMA='" + trm + "' AND CPTRLR="+trlr + " AND CPCLDT=" + cdate + " AND CPCLTM=" + ctime;
	// console.log(sql);
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs) {
		sqlA.close();
		if (rs[0] == null) {
			res.send(JSON.stringify({ 'error': 'No results found for TRLR' }));
		} else {
			res.send(JSON.stringify(rs));
		}
		dbconn.disconn();
      	dbconn.close();
	});
	
}

module.exports = router;