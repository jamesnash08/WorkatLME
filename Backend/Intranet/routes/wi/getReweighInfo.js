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
	var dbconn = new db.dbconn();
	var curdate = new Date();
	//curdate.setDate(curdate.getDate());
	var ldate;
	if(Number(curdate.getDate()) < 2)
		ldate = curdate.getFullYear().toString() + "-" + get2Digit(curdate.getMonth()) + "-01";
	else
		ldate = curdate.getFullYear().toString() + "-" + get2Digit(curdate.getMonth() + 1) + "-01";
	var ndate = ldate;
	var sql = "SELECT a.* " +
	"FROM RV.RWTRMH01 as a " +
	"WHERE a.TRDATE >= '" + ndate + "' " +
	"ORDER BY a.TTRML, a.TRDATE DESC";
	 dbconn.conn("*LOCAL");
	 var sqlA = new db.dbstmt(dbconn);
	 sqlA.exec(sql, function(rs) {
		sqlA.close();
		if(!rs[0]){
			res.send(JSON.stringify({'error':'No results found'}));
		}else{
			res.send(JSON.stringify(rs));
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