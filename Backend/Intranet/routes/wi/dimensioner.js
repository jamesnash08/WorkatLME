const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	servResponse(req,res,next);
});
router.post('/',function(req,res,next){
	servResponse(req,res,next);
});
function servResponse(req, res, next) {
	//SET VARIABLES HERE
	var results = [];
	var dbconn = new db.dbconn();
	var curdate = new Date();
	curdate.setDate(curdate.getDate()-30);
	var ldate = "1" + curdate.getFullYear().toString().substring(2) + "" + get2Digit(curdate.getMonth() + 1) + "" + get2Digit(curdate.getDate());
	var ndate = Number(ldate);
	var sql = "SELECT b.PAYOR AS BILLTO, b.CONS, a.CUBE, a.CYMD, a.DCLASS, a.DENSITY, a.DIMDATE, a.DIMTIME, a.HEIGHT, a.LENGTH, a.WIDTH, a.WEIGHT, a.PRO, b.SHIP AS SHIPPER, a.TRM, a.EMP " +
	"FROM RV.FSDIMD01 as a " +
	"LEFT JOIN BR.BILLSM01 AS b ON b.PRO=a.PRO " +
	"WHERE a.CYMD >=" + ndate + " " +
	"ORDER BY a.CYMD DESC, a.TRM, a.PRO";

	 dbconn.conn("*LOCAL");

	 var sqlA = new db.dbstmt(dbconn);
	 sqlA.exec(sql, function(rs) {
		sqlA.close();
		if(rs[0] == null){
			results = {'error':'No results found'};
			res.send(JSON.stringify(results));
		}else{
			results = rs;
			res.send(JSON.stringify(results));
		}
	});
	
}
module.exports = router;
function get2Digit(val){
	if(val.toString().length == 1)
	return "0" + val.toString();
	else
	return val.toString();
}