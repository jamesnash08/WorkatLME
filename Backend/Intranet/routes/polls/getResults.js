const db = require('idb-connector');
var express = require('express');
var router = express.Router();
var version = 1.1;

router.get('/', function (req, res, next) {
	servResponse(req, res, next,  req.query.pollid);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.pollid);
});
function servResponse(req, res, next,pollid) {
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	//Delete old records
	var sql = "SELECT d.SEQ, TRIM(d.TYPE) AS TYPE,trim(h.ANSWER) AS ANSWER, COUNT(h.ANSWER) AS SUM " +
	"FROM SY.POLLSDETLF AS d " +
	"LEFT JOIN SY.POLLSHISTF AS h ON d.POLLID=h.POLLID AND d.SEQ=h.SEQ " +
	"WHERE d.POLLID=" + pollid + " AND TYPE in ('BOOL','SATISFY','CHOICE') " + 
	"GROUP BY d.SEQ, d.TYPE, h.ANSWER";
	console.log(sql);
	var statement = new db.dbstmt(dbconn);
	statement.exec(sql, (rs,err) => {
		if(err){console.log(err);console.log(sql);}
		statement.close();
		dbconn.disconn();
		dbconn.close();
		res.send(JSON.stringify(rs));
			
	});
}

function get2Digit(val) {
    if (val.toString().length == 1)
        return "0" + val.toString();
    else
        return val.toString();
}

module.exports = router;