const db = require('idb-connector');

var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	servResponse(req,res,next);
});
router.post('/',function(req,res,next){
	servResponse(req,res,next);
});
function servResponse (req, res, next) {
	var d = new Date(),
		fdate,
		tdate,
		rtn = {
			"miles":0,
			"loaded":0,
			"empty":0,
			"loadcount":0,
			"loadavgwgt":0
		};
	d = new Date(d.toLocaleString("en-us", {timeZone: "America/Chicago"}));
	//res.send("");
	if(d.getHours < 6){
		d.setDate(d.getDate() - 1);
	}
	tdate = "1" + d.getFullYear().toString().substring(2) + "" + get2Digit(d.getMonth() + 1) + "" + get2Digit(d.getDate());
	if(d.getDay() == 1)
		d.setDate(d.getDate() - 3);
	else
		d.setDate(d.getDate() - 1);
	fdate = "1" + d.getFullYear().toString().substring(2) + "" + get2Digit(d.getMonth() + 1) + "" + get2Digit(d.getDate());
	//console.log(fdate + " " + tdate);
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sql;	
	sql = "SELECT SUM(TRIPML), DATEFLD " + 
	"FROM (SELECT CASE WHEN DSPTIM > 600 THEN " +
	"(SELECT b.CYMD "+
	"FROM (SELECT CYMD, DAYS, ROW_NUMBER() OVER(ORDER BY CYMD DESC) AS ROW2 FROM SY.CDATEM03) as b "+ 
	"WHERE b.ROW2 = (SELECT CASE WHEN a.DAYS=2 THEN a.ROW + 3 WHEN a.DAYS=1 THEN a.row+2 ELSE a.ROW + 1 END AS NEXTDAY "+
	"FROM (select ROW_NUMBER() OVER(ORDER BY CYMD DESC) AS ROW, DAYS,CYMD FROM SY.CDATEM03) AS a WHERE b.CYMD = c.DSPDAT)) " +
	"ELSE DSPDAT END AS DATEFLD, TRIPML FROM EC.DSPCHH02 as c WHERE (c.LDBLS1=0 AND c.LDBLS2=0 AND c.LDBLS3=0) AND c.TRIPML>=10 AND (c.DSPDAT<= 1180215 AND c.DSPDAT>=1170100)) as a GROUP BY DATEFLD ORDER BY DATEFLD DESC";
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function(rs) {
		sqlA.close();
		res.send(JSON.stringify(rs));
		//console.log(Number(rs[0].TRIPML));
	//	rtn.loaded = Number(rs[0].TRIPML);
	//	rtn.loadcount = Number(rs[0].SYVLDD);
	//	rtn.loadavgwgt = (Number(rs[0].LDWGT1) + Number(rs[0].LDWGT2) + Number(rs[0].LDWGT3)) / Number(rtn.loadcount);
	//	sql = "SELECT SUM(TRIPML) AS TRIPML FROM EC.DSPCHH02 WHERE LDBLS1=0 AND LDBLS2=0 AND LDBLS3=0 AND TRIPML>=10 AND (DSPDAT=" + fdate + " AND DSPTIM>600 OR DSPDAT=" + tdate + " AND DSPTIM<=600)";
	//	var sqlB = new db.dbstmt(dbconn);
	//	sqlB.exec(sql, function(rs2) {
	//		sqlB.close();			
	//		rtn.empty = Number(rs2[0].TRIPML);
	//		rtn.miles = rtn.loaded + rtn.empty;
				
	//		res.send(JSON.stringify(rtn));
		//});
	});

}

function get2Digit(text){
	if(text.toString().length == 1)
		text = "0" + text.toString();
	return text;
}

module.exports = router;