const db = require('idb-connector');
var fs = require('fs');
var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	servResponse(req,res,next);
});
router.post('/',function(req,res,next){
	servResponse(req,res,next);
});

function servResponse(req, res, next) {
	var results = [];
	var dbconn = new db.dbconn();
	var sql;
	var filename;
	var curdate = new Date();
	dbconn.conn("*LOCAL");
	if(curdate.getMonth >= 10){
		curdate.setFullYear(curdate.getFullYear() + 1);
	}
	var y = curdate.getFullYear() - 2;
	var curcymd = Number("1" + y.toString().substring(2) + "1100");
	var endcymd = Number("1" + curdate.getFullYear().toString().substring(2) + "1031");
	sql = "SELECT a.CLPAY# as CLPAY, c.CLYEAR, c.CLAIM# AS CLAIM, a.CLRECD, c.PRO, a.CLCLSS, a.CLAPPA, a.CLDDTE, a.CLMAMT " +
	"FROM CL.CLAIMMASTF AS a " +
	"INNER JOIN CL.CLPROMASTF AS c ON a.CLYEAR=c.CLYEAR AND a.CLAIM#=c.CLAIM# " +
	"WHERE a.CLPAY# IN (385556, 855824, 684253, 498379, 330583, 330584, 330586, 330589) AND a.CLRECD >= " + curcymd + " AND a.CLRECD <= " + endcymd + " " +  
	"ORDER BY a.CLPAY#, a.CLRECD, a.CLCLSS, a.CLYEAR, CLAIM";
	//filename = 'opintmqry.'+date; test
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
		dbconn.disconn();
      		dbconn.close();	
	});
	
}
module.exports = router;