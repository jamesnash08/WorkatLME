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
	var curdate = new Date();
	var y = curdate.getFullYear() - 1;
	var curcymd = Number("1" + y.toString().substring(2) + "0000");
	var endcymd = Number("1" + curdate.getFullYear().toString().substring(2) + "1231");
	sql = "SELECT c.CLYEAR, c.CLAIM# AS CLAIM, a.CLBLDD, d.CLIDSC, b.CLYRA, a.CLRECD, a.CLSTAT, b.CLSCAC, " +
	"b.CLTRND, c.PRO, b.CLNOT1, b.CLNOT2 " +
	"FROM CL.CLTRNM04 AS b " +
	"INNER JOIN CL.CLAIMMASTF AS a ON b.CLYEAR=a.CLYEAR AND b.CLAIM#=a.CLAIM# " +
	"INNER JOIN CL.CLPROMASTF AS c ON b.CLYEAR=c.CLYEAR AND b.CLAIM#=c.CLAIM# " +
	"INNER JOIN CL.CLICDM01 AS d ON a.CLCLSS=d.CLICOD " +
	"INNER JOIN SY.TRMLSM01 AS e ON SUBSTRING(b.CLSCAC,1,3)=e.TMTRMLCODE " +
	"WHERE b.CLTRND>" + curcymd + " AND b.CLTRND <= " + endcymd + " AND a.CLDDTE=0 " +
	"AND b.CLSCAC<>'YRC ' AND b.CLTYPE='LD' AND a.CLTYPE='LD' AND c.CLTYPE='LD' AND e.TMSUPCARTG<>'N' " +
	"ORDER BY b.CLSCAC, b.CLTRND";
	//filename = 'opintmqry.'+date; test

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
		dbconn.disconn();
      		dbconn.close();	
	});
	
}
module.exports = router;