const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.trm, req.query.user);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.trm, req.body.user);
});
function servResponse(req, res, next, trm, user) {
	// console.log(user);
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	// m.USR='" + user + "' AND
	var sql = "SELECT m.*, d.PLSEQ, d.PRO FROM EC.CTPLNMASTF as m LEFT JOIN EC.CTPLNDETLF AS d ON m.NAME=d.NAME AND m.TRM=d.TRM WHERE m.TRM='" + trm + "' ORDER BY d.PLSEQ";
	var sqlB = new db.dbstmt(dbconn);
	sqlB.exec(sql, (rs2, err) => {
		sqlB.close();
		if (err) {
			console.log("ERR90002 " + err);
			console.log("ERR90002 " + sql);
		}
		dbconn.disconn();
		dbconn.close();
		res.send(JSON.stringify({"PLANS": rs2 }));
	});
}

module.exports = router;