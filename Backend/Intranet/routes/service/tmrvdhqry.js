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
function servResponse (req, res, next) {
	hitcount++;
	//console.log("login has been hit " + hitcount + " time(s)");
	
	//SET VARIABLES HERE
	var results = [];
	var dbconn = new db.dbconn();
	var sql;
	var filename;
	var curdate = new Date();
	var y = curdate.getFullYear() - 2; // Here we go back 2 years this should match opsDaily.Component 
	var curcymd = Number("1" + y.toString().substring(2) + "0000");
	
	//sql = "SELECT * FROM RV.OPINTMASTF WHERE OPTRM='" + trm + "' ORDER BY OPCYMD";
	sql = "SELECT a.TMCYMD, DAYOFYEAR( '20' CONCAT substring(a.TMCYMD, 2, 2) CONCAT '-' CONCAT substring(a.TMCYMD, 4,2) CONCAT '-' CONCAT substring(a.TMCYMD, 6,2)) as JUL, " +
	"a.LTLROC + a.TLROC - a.LTLFOC AS TRADE, a.LTLFOC AS FUEL, a.LTLROC + a.TLROC AS REV, b.SYSAVG " + 
	"FROM RV.TMRVTH03 AS a " +
	"LEFT OUTER JOIN RV.RVT420H1 AS b ON TMCYMD=CYMD " +
	"WHERE a.TMCYMD >=" + curcymd + " " +
	"ORDER BY JUL, a.TMCYMD ASC";
	
	//filename = 'opintmqry.ALL';
	  
		 dbconn.conn("*LOCAL");
		 
		 var sqlA = new db.dbstmt(dbconn);
		 sqlA.exec(sql, function(rs) {
			sqlA.close();
			if(rs[0] == null){
				results = {'error':'No results found for TRM'};
				res.send(JSON.stringify(results));
			}else{
				results = rs;
				// if(filename > ""){
					// fs.writeFile("/www/lmelocal/htdocs/stored/hourly/"+filename+".txt",JSON.stringify(results),function (err){
						// if (err) console.log(err);
					// });
				// }
				res.send(JSON.stringify(results));
				dbconn.disconn();
		dbconn.close();
			}
				
		});
		
}

module.exports = router;