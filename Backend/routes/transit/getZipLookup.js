var db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.zip.toString().toUpperCase());
});
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.zip.toString().toUpperCase());
});
function servResponse(req, res, next, zip) {
	var dbconn = new db.dbconn();
	dbconn.conn("DPI", "DPIOPS", "CHEX");
	var curdate = new Date();
	curdate.setDate(curdate.getDate());
	var cymd = "1" + curdate.getFullYear().toString().substring(2) + "" + get2Digit(curdate.getMonth() + 1) + "" + get2Digit(curdate.getDate());
	var sql = "SELECT PTCITY, PTSTATE, PTCOUNTRY, PTTRMA, PTILTRMA, PTZIP, PTILSCAC " +
		"FROM SY.POINTM17 WHERE PTZIP='" + zip + "' AND PTEFFDATE <= " + cymd + " AND PTEXPDATE > " + cymd + " " +
		"ORDER BY PTCITY, PTZIP";
	// console.log(sql);
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, (rs,err) => {
		sqlA.close();
		dbconn.disconn();
		dbconn.close();
		if(err){
			console.log("ERR90002 " + err);
			console.log(sql);
		}
		res.send(JSON.stringify(rs));
	});
}
module.exports = router;

function get2Digit(val) {
	if (val.toString().length == 1)
		return "0" + val.toString();
	else
		return val.toString();
}