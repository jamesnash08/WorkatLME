const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.emp, req.query.user, req.query.punch);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.emp, req.body.user, req.body.punch);
});
function servResponse(req, res, next, emp, user, punch) {
	var curdate = new Date();
	var ldate = "1" + curdate.getFullYear().toString().substring(2) + "" + get2Digit(curdate.getMonth() + 1) + "" + get2Digit(curdate.getDate());
	var trndat = Number(ldate);
	var trntim = get2Digit(curdate.getHours().toString()) + get2Digit(curdate.getMinutes());

	var sql = "DELETE FROM SY.EMPPTM01 WHERE EMP=" + emp;
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, (rs,err) => {
		if(err){
			console.log("ERR90002 " + err);
			console.log(sql);
		}
		sqlA.close();
		sql = "INSERT INTO SY.EMPPTM01 (EMP,START,TRNDAT,TRNTIM,TRNUSR) " +
			"VALUES (" + emp + "," + punch + "," + trndat + "," + trntim + ",'" + user + "')";
		console.log(sql);
		var sqlB = new db.dbstmt(dbconn);
		sqlB.exec(sql, (rs,err) => {
			sqlB.close();
			if(err){
				console.log("ERR90002 " + err);
				console.log(sql);
			}
			res.send(JSON.stringify({ "success": "Record updated" }));
			dbconn.disconn();
			dbconn.close();
		});
		
	});

}

module.exports = router;

function get2Digit(val) {
	if (val.toString().length == 1)
		return "0" + val.toString();
	else
		return val.toString();
}