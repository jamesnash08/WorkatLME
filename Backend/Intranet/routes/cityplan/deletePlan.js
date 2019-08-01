const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.json);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.json);
});
function servResponse(req, res, next, json) {
	//json = {USER:,TRM:,NAME:,TRLR:,DRVNUM:,ROWS:[{PLSEQ:,MTSEQ:,PRO:}]}
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	//Delete old records
	var sql = "DELETE FROM EC.CTPLNMASTF WHERE TRM='" + json.TRM + "' AND NAME = '" + json.NAME.trim() + "'";
	console.log(sql);
	var statement = new db.dbstmt(dbconn);
	statement.exec(sql, (rs,err) => {
		statement.close();
		sql = "DELETE FROM EC.CTPLNDETLF WHERE TRM='" + json.TRM + "' AND NAME = '" + json.NAME.trim() + "'";
		console.log(sql);
		statement = new db.dbstmt(dbconn);
		statement.exec(sql, (rs,err) => {
			statement.close();
			dbconn.disconn();
			dbconn.close();
			res.send(JSON.stringify({ "success": "Plan was renamed" }));
		});

	});
}

module.exports = router;