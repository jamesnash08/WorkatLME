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
	
	var sql = "SELECT * FROM EC.DKTNRHISTF ORDER BY RPTDAT DESC,WKTRML";
	// console.log(sql);
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs) {
		sqlA.close();
		if (rs[0] == null) {
			res.send(JSON.stringify({ 'error': 'No results found for TRM' }));
		} else {
			res.send(JSON.stringify(rs));
		}
		dbconn.disconn();
      	dbconn.close();
	});
	
}

module.exports = router;