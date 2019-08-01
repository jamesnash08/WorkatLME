
const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	servResponse(req,res,next);
});
router.post('/',function(req,res,next){
	servResponse(req,res,next);
});

function servResponse(req, res, next,trm) {
	//SET VARIABLES HERE
	var results = [];
	var dbconn = new db.dbconn();
	// var curdate = new Date();
	// curdate.setDate(curdate.getDate()-7);
	// var ldate = "1" + curdate.getFullYear().toString().substring(2) + "" + get2Digit(curdate.getMonth() + 1) + "" + get2Digit(curdate.getDate());
	// var ndate = Number(ldate);
	var sql;
	sql = "SELECT a.WSDATE, SUBSTRING(a.WSSCALE,1,3) AS TRM, a.PRO, a.WSPCS " +
	"FROM EC.FL225H03 as a " +
	"ORDER BY a.WSDATE DESC, a.WSSCALE, a.PRO";

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