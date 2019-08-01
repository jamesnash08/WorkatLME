const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	var pro = req.query.pro;
	servResponse(req, res, next, pro, req.query.notes);
});
router.post('/', function (req, res, next) {
	var pro = req.body.pro;
	servResponse(req, res, next, pro, req.body.notes);
});

function servResponse(req, res, next, pro, notes) {
	var requests = 0;
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sql;
	for (var i = 0; i < notes.length; i++) {
		sql = "INSERT INTO BR.BILLSN01 (PRO,TRNTIM,TRNDAT,CRRNTE,TRNUSR,TRNINT,MSGTXT) VALUES(" + pro + "," + notes[i].TIME + "," + notes[i].DATE + ",'N','" + notes[i].USER + "','" + notes[i].INT + "','" + notes[i].NOTES + "')";
		var sqlA = new db.dbstmt(dbconn);
		sqlA.exec(sql, function () {
			requests = submitData(res,requests,notes.length,pro,dbconn);
		});
	}
}

function submitData(res,requests, notesl, pro,dbconn) {
	requests++;
	if (requests == notesl) {
		sql = "SELECT TRNTIM AS TIME, TRNDAT AS DATE, CRRNTE AS CN, TRNUSR AS USER, TRNINT AS INT, MSGTXT AS NOTES FROM BR.BILLSN01 WHERE PRO=" + pro;
		var sqlB = new db.dbstmt(dbconn);
		sqlB.exec(sql, function (rs) {
			sqlB.close();
			res.send(rs);
			dbconn.disconn();
		dbconn.close();
		});
	}
	return requests;
}

module.exports = router;