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
	var payload = {ratio:[],data:[]};
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	
	var stages = [0, 1].reduce((promiseChain, item) => {
		return promiseChain.then(() => new Promise((resolve, reject) => {
			asyncFunctionLookup(dbconn, item, payload, resolve, reject);
		}));
	},
	Promise.resolve());

	stages.then(() => {
		dbconn.disconn();
      	dbconn.close();	
		res.send(JSON.stringify(payload));

	}).catch((fail) => {
		dbconn.disconn();
      	dbconn.close();	
		res.send(JSON.stringify(payload));
	});
}

function asyncFunctionLookup(dbconn,item,payload,resolve,reject){
	switch (item) {
		case 0:
			var curdate = new Date();
			var y = curdate.getFullYear() - 1;
			var curcymd = Number("1" + y.toString().substring(2) + "0000");
			var endcymd = Number("1" + curdate.getFullYear().toString().substring(2) + "1231");
			var sql = "SELECT c.CLYEAR, c.CLAIM# AS CLAIM, a.CLBLDD, d.CLIDSC, b.CLYRA, a.CLRECD, a.CLSTAT, b.CLSCAC, " +
			"b.CLTRND, c.PRO, b.CLNOT1, b.CLNOT2 " +
			"FROM CL.CLTRNM04 AS b " +
			"INNER JOIN CL.CLAIMMASTF AS a ON b.CLYEAR=a.CLYEAR AND b.CLAIM#=a.CLAIM# " +
			"INNER JOIN CL.CLPROMASTF AS c ON b.CLYEAR=c.CLYEAR AND b.CLAIM#=c.CLAIM# " +
			"INNER JOIN CL.CLICDM01 AS d ON a.CLCLSS=d.CLICOD " +
			"INNER JOIN SY.TRMLSM01 AS e ON SUBSTRING(b.CLSCAC,1,3)=e.TMTRMLCODE " +
			"WHERE b.CLTRND>" + curcymd + " AND b.CLTRND <= " + endcymd + " AND a.CLDDTE=0 " +
			"AND b.CLSCAC<>'YRC ' AND b.CLTYPE='LD' AND a.CLTYPE='LD' AND c.CLTYPE='LD' AND e.TMSUPCARTG<>'N' " +
			"ORDER BY b.CLSCAC, b.CLTRND";		 
			 var sqlA = new db.dbstmt(dbconn);
			 sqlA.exec(sql, function(rs,err) {
				sqlA.close();
				if(!rs || err){
					payload = {'error':'No data found'};
					reject();
				}else{
					payload['data'] = rs;
					resolve();
				}
			});
			break;
		case 1:
			var curdate = new Date();
			var y = curdate.getFullYear() - 1;
			var curcymd = Number("1" + y.toString().substring(2) + "0000");
			var endcymd = Number("1" + curdate.getFullYear().toString().substring(2) + "1231");
			var sql = "SELECT RVTRMA, YEAR, PERIOD, SUM(LTLROC + TLROC) AS REV " +
			"FROM RV.TMRVTH01 " +
			"LEFT JOIN SY.CDATEM03 ON CYMD=TMCYMD " +
			"WHERE TMCYMD >" + curcymd + " AND TMCYMD <=" + endcymd + " "+
			"GROUP BY RVTRMA, YEAR, PERIOD " + 
			"ORDER BY RVTRMA, YEAR, PERIOD";		 
			 var sqlA = new db.dbstmt(dbconn);
			 sqlA.exec(sql, function(rs,err) {
				sqlA.close();
				if(!rs || err){
					console.log("ERR90002" + err);
					payload = {'error':'No ratio found'};
					reject();
				}else{
					payload['ratio'] = rs;
					resolve();
				}
			});
			break;
	}

}
module.exports = router;