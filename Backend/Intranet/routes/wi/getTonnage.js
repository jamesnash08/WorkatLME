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
	
	var lcurdate = "1" + curdate.getFullYear().toString().substring(2) + "" + get2Digit(curdate.getMonth() + 1) + "" + get2Digit(curdate.getDate());
	var ncurdate = Number(lcurdate);
	if(curdate.getDay() == 1)
	curdate.setDate(curdate.getDate() - 3);
	else if(curdate.getDay() == 0)
	curdate.setDate(curdate.getDate() - 2);
	else
	curdate.setDate(curdate.getDate() - 1);

	var ldate = "1" + curdate.getFullYear().toString().substring(2) + "" + get2Digit(curdate.getMonth() + 1) + "" + get2Digit(curdate.getDate());
	var ndate = Number(ldate);
	

	var sql = "Select DKTRML, "+              
"SUM(CASE WHEN DKSTAT = 'ONT' THEN DKTWGT ELSE 0 END) AS WGT, "+ 
"SUM(CASE WHEN DKSTAT = 'OCD' THEN DKTWGT ELSE 0 END) AS XWGT "+ 
"FROM EC.DCKTNH03 "+                                            
"WHERE DKTRND >= "+ ndate + " AND DKTRND < "+ ncurdate + " " +                                      
"GROUP BY DKTRML ORDER BY DKTRML";
	//console.log(sql);
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