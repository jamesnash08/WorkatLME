var db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.org.toString().toUpperCase(), req.query.dst.toString().toUpperCase(), req.query.date);
});
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.org.toString().toUpperCase(), req.body.dst.toString().toUpperCase(), req.body.date);
});
function servResponse(req, res, next, org, dst, cymd) {
	var dbconn = new db.dbconn();
	dbconn.conn("DPI", "DPIOPS", "CHEX");
	var sql = "SELECT * " +
		"FROM SY.POINTMASTF WHERE PTZIP IN ('" + org + "','" + dst + "') AND PTEFFDATE <= " + cymd + " AND PTEXPDATE > " + cymd + " " +
		"ORDER BY PTCITY, PTZIP";
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, (rs,err) => {
		if(err){
			console.log("ERR90002 " + err);
			console.log(sql);
		}
		sqlA.close();
		dbconn.disconn();
		dbconn.close();
		res.send(JSON.stringify(rs));
	});
}
module.exports = router;