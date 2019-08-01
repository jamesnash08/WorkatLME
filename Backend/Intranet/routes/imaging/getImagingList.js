const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	var pro = req.query.pro;
	servResponse(req, res, next, pro);
});
router.post('/', function (req, res, next) {
	var pro = req.body.pro;
	servResponse(req, res, next, pro);
});

function servResponse(req, res, next, pro) {
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");

	var sql = "SELECT b.AHFOLN, c.AKAPPA, c.AKDOCN, c.AKDOCT, c.AKDTEA AS DATE, c.AKTEXT "+                               
	"FROM PACIVFIL.FLX010P AS a "+                                  
	"LEFT JOIN PACIVFIL.FLOCONL4 AS b ON b.AHFOLN=a.AOFOLN "+       
	"LEFT JOIN PACIVFIL.DOCHDRL2 AS c ON c.AKDOCN=b.AHDOCN "+       
	"WHERE a.AOUKEY = '" + pro + "' AND a.AOAPPA='LME'";
	console.log(sql);
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, (rs,err) => {
		sqlA.close();
		dbconn.disconn();
		dbconn.close();	
		if(err){
			console.log("ERR90002 " + err.toString());
			res.send(JSON.stringify({'error':"Invalid PRO"}));
		}else
			res.send(JSON.stringify(rs));
		
	});
}

module.exports = router;