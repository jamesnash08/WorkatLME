const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	servResponse(req,res,next,req.query.trm);
});
router.post('/',function(req,res,next){
	servResponse(req,res,next,req.body.trm);
});
function servResponse(req, res, next,trm) {
	var dbconn = new db.dbconn();
	var sql;
	var curdate = new Date();
	var y = curdate.getFullYear() - 1;
	var curcymd = Number("1" + y.toString().substring(2) + "0000");
	var endcymd = Number("1" + curdate.getFullYear().toString().substring(2) + "1231");
	sql = "select RVTRMA AS TRM, SUBSTR(TMCYMD,2,2) AS YEAR, SUBSTRING(TMCYMD,4,2) AS MONTH,  SUM(LTLSOC) AS OUT, SUM(LTLSIC) AS IN " +                
	"FROM RV.TMRVTH01 " +                                                   
	"WHERE RVTRMA = '"+trm+"' AND TMCYMD >= "+curcymd+" AND TMCYMD <= "+endcymd+" " +
	"GROUP BY RVTRMA, SUBSTR(TMCYMD,2,2), SUBSTRING(TMCYMD,4,2) " +
	"ORDER BY YEAR,MONTH";
	//filename = 'opintmqry.'+date; test

	 dbconn.conn("*LOCAL");
	 var sqlA = new db.dbstmt(dbconn);
	 sqlA.exec(sql, function(rs) {
		sqlA.close();
		if(!rs[0]){
			res.send(JSON.stringify({'error':'No results found'}));
		}else{
			res.send(JSON.stringify(rs));
		}
		dbconn.disconn();
      		dbconn.close();	
	});
	
}
module.exports = router;