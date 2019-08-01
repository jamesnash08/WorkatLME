const db = require('idb-connector');
var express = require('express');
var router = express.Router();
var version = 1.0;

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.user);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.user);
});
function servResponse(req, res, next, user) {
	var curdate = new Date();
	var ldate = Number(curdate.getFullYear().toString() + "" + get2Digit(curdate.getMonth() + 1) + "" + get2Digit(curdate.getDate()));
	var sql = "SELECT m.POLLID, TRIM(m.NAME) AS NAME, TRIM(m.DESC) AS DESC, m.CREATOR, m.CDATE, m.EDATE " +
		"FROM SY.POLLSMASTF AS m " + 
		"WHERE m.EDATE >= " + ldate + " " + 
		"ORDER BY m.POLLID";
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");

	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs, err) {
		sqlA.close();
		if (err) {
			dbconn.disconn();
			dbconn.close();
			console.log("ERR90002 " + err);
			console.log(sql);
			res.send(JSON.stringify({ 'error': 'No polls found' }));
		} else {
			var sql = "SELECT d.POLLID, d.SEQ, TRIM(d.TITLE) AS TITLE, TRIM(d.DESC) AS DESC, TRIM(d.C1) AS C1, TRIM(d.C2) AS C2, TRIM(d.C3) AS C3, TRIM(d.C4) AS C4, TRIM(d.C5) AS C5, TRIM(d.TYPE) AS TYPE, TRIM(h.ANSWER) AS ANSWER " +
			"FROM SY.POLLSMASTF AS m " +
			"LEFT JOIN SY.POLLSDETLF AS d ON m.POLLID=d.POLLID " + 
			"LEFT JOIN SY.POLLSHISTF AS h ON h.SUBMITTER='" + user + "' AND h.POLLID=m.POLLID AND h.SEQ=d.SEQ " +
			"WHERE m.EDATE >= " + ldate + " " + 
			"ORDER BY m.POLLID, d.SEQ";
			var sqlB = new db.dbstmt(dbconn);
			sqlB.exec(sql, function (rs2, err) {
				sqlB.close();
				if (err) {
					dbconn.disconn();
					dbconn.close();
					console.log("ERR90002 " + err);
					console.log(sql);
					res.send(JSON.stringify({ 'error': 'No polls found' }));
				} else {
					dbconn.disconn();
					dbconn.close();
					res.send(JSON.stringify({ "POLLS": rs, "QUESTIONS": rs2 }));
				}
			});
		}
	});

}

function get2Digit(val) {
    if (val.toString().length == 1)
        return "0" + val.toString();
    else
        return val.toString();
}

module.exports = router;