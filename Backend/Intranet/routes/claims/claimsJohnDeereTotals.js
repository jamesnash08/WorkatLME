const db = require('idb-connector');
var fs = require('fs');
var express = require('express');
var router = express.Router();
var hitcount = 0;

router.get('/',function(req,res,next){
	servResponse(req,res,next);
});
router.post('/',function(req,res,next){
	servResponse(req,res,next);
});


function servResponse(req, res, next) {
	hitcount++;
	//console.log("login has been hit " + hitcount + " time(s)");

	//SET VARIABLES HERE
	var results = [];
	var dbconn = new db.dbconn();
	var sql;
	var filename;

	var curdate = new Date();
	if(curdate.getMonth >= 10){
		curdate.setFullYear(curdate.getFullYear() + 1);
	}
	var y = curdate.getFullYear() - 2;
	var curcymd = Number("1" + y.toString().substring(2) + "1100");
	var endcymd = Number("1" + curdate.getFullYear().toString().substring(2) + "1031");
	sql = "SELECT a.CLPAY# as CLPAY, d.CLIDSC, a.CLRECD, c.PRO, a.CLCLSS, a.CLAPPA, a.CLDDTE, a.CLMAMT " +
	"FROM CL.CLAIMMASTF AS a " +
	"INNER JOIN CL.CLPROMASTF AS c ON a.CLYEAR=c.CLYEAR AND a.CLAIM#=c.CLAIM# " +
	"INNER JOIN CL.CLICDM01 AS d ON a.CLCLSS=d.CLICOD " +
	"WHERE a.CLPAY# IN (385556, 855824, 684253) AND a.CLENTD >= " + curcymd + " AND a.CLENTD <= " + endcymd + " " +  
	"ORDER BY a.CLPAY#, a.CLENTD, a.CLCLSS " +
	"GROUP BY ";
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
			//if(filename > ""){
			//	fs.writeFile("/www/lmelocal/htdocs/stored/hourly/"+filename+".txt",JSON.stringify(results),function (err){
			//		if (err) console.log(err);
			//	});
			//}

			res.send(JSON.stringify(results));
		}
		dbconn.disconn();
		dbconn.close();	
	});
	
}

module.exports = router;
