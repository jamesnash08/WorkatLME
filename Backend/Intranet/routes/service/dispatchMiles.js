const db = require('idb-connector');

var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	servResponse(req,res,next);
}); //fdjkfdkj
router.post('/',function(req,res,next){
	servResponse(req,res,next);
});
function servResponse (req, res, next) {
		
	var curdate = new Date();
	var results = [];
	//var y = curdate.getFullYear() - 1;
	var y = curdate.getFullYear();
	var curcymd = Number("1" + y.toString().substring(2) + "0000");
	var d = new Date(),
			fdate,
			tdate;
	d = new Date(d.toLocaleString("en-us", {timeZone: "America/Chicago"}));
		//res.send("");
		//if(d.getHours < 6){
		//	d.setDate(d.getDate() - 1);
		//}
		tdate = Number("1" + d.getFullYear().toString().substring(2) + "" + get2Digit(d.getMonth() + 1) + "" + get2Digit(d.getDate()));
		if(d.getDay() == 1)
			d.setDate(d.getDate() - 3);
		else if(d.getDay() == 0)
			d.setDate(d.getDate() - 2);
		else
			d.setDate(d.getDate() - 1);
		fdate = Number("1" + d.getFullYear().toString().substring(2) + "" + get2Digit(d.getMonth() + 1) + "" + get2Digit(d.getDate()));
		jdate = Number("1" + d.getFullYear().toString().substring(2) + "" + get2Digit(d.getMonth() + 1) + "" + get2Digit(d.getDate()));
	while(fdate > curcymd){
		var rtn = {
				"date":0,
				"miles":0,
				"loaded":0,
				"empty":0,
				"loadcount":0,
				"emptycount":0,
				"loadavgwgt":0
			};
		
		//console.log(fdate + " " + tdate);
		var dbconn = new db.dbconn();
		dbconn.conn("*LOCAL");
		var sql;	
		sql = "SELECT SUM(TRIPML) AS TRIPML, COUNT(TRIPML) AS SYVLDD, SUM(LDWGT1) AS LDWGT1, SUM(LDWGT2) AS LDWGT2, SUM(LDWGT3) AS LDWGT3 FROM EC.DSPCHH02 WHERE (LDBLS1>0 OR LDBLS2>0 OR LDBLS3>0) AND TRIPML>=10 AND ((DSPDAT = " + fdate + " AND DSPTIM > 600) OR (DSPDAT=" + tdate + " AND DSPTIM<=600) OR (DSPDAT>"+fdate+" AND DSPDAT<"+tdate+"))";
		var sqlA = new db.dbstmt(dbconn);
		sqlA.execSync(sql, function(rs) {
			sqlA.close();
			//console.log(Number(rs[0].TRIPML));
			rtn.loaded = Number(rs[0].TRIPML);
			rtn.loadcount = Number(rs[0].SYVLDD);
			rtn.loadavgwgt = (Number(rs[0].LDWGT1) + Number(rs[0].LDWGT2) + Number(rs[0].LDWGT3)) / Number(rtn.loadcount);
			
		});
		sql = "SELECT SUM(TRIPML) AS TRIPML, COUNT(TRIPML) AS SYVLDD FROM EC.DSPCHH02 WHERE LDBLS1=0 AND LDBLS2=0 AND LDBLS3=0 AND TRIPML>=10 AND ((DSPDAT=" + fdate + " AND DSPTIM>600) OR (DSPDAT=" + tdate + " AND DSPTIM<=600) OR (DSPDAT>"+fdate+" AND DSPDAT<"+tdate+"))";
			var sqlB = new db.dbstmt(dbconn);
			sqlB.execSync(sql, function(rs2) {
				sqlB.close();			
				rtn.date = fdate;
				rtn.emptycount = rs2[0].SYVLDD;
				rtn.empty = Number(rs2[0].TRIPML);
				rtn.miles = rtn.loaded + rtn.empty;
				results[results.length] = rtn;
			});
			
	tdate = fdate;
		if(d.getDay() == 1)
			d.setDate(d.getDate() - 3);
		else
			d.setDate(d.getDate() - 1);
		fdate = Number("1" + d.getFullYear().toString().substring(2) + "" + get2Digit(d.getMonth() + 1) + "" + get2Digit(d.getDate()));
	}
		
	res.send(JSON.stringify(results));
	dbconn.disconn();
	dbconn.close();
}

function get2Digit(text){
	if(text.toString().length == 1)
		text = "0" + text.toString();
	return text;
}

module.exports = router;