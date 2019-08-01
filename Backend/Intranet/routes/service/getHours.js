const db = require('idb-connector');
var fs = require('fs');
var express = require('express');
var router = express.Router();
router.get('/',function(req,res,next){
	if(req.query.cdate && req.query.trm)
		servResponse(req,res,next,req.query.cdate,req.query.trm);
	else
		res.send("{ERROR:'Date and TRM not found'}");
});
router.post('/',function(req,res,next){
	if(req.body.cdate && req.body.trm)
		servResponse(req,res,next,req.body.cdate,req.body.trm);
	else
		res.send("{ERROR:'Date and TRM not found'}");
});
function servResponse (req, res, next,cdate,trm) {
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sql;	
	sql = "SELECT TLTRML as CTTRML, TLDATE as CTDATE, TLEMP# as CTEMP, FNAME, LNAME, DEPTCD, TLDOCK as CTDOCK, TLDRIV as CTDRIV, TLLNHL as CTLNHL, TLADMN as CTADMN " +
	"FROM EC.TLHRSH01 " + 
	"JOIN VM.SFEMPMASTF ON TLEMP#=DRVNUM " + 
	"WHERE TLDATE="+ cdate +" AND DEPTCD <> 'OFC' AND TLTRML='"+ trm +"' " +
	"ORDER BY TLDATE DESC, TLTRML, TLEMP# ";
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function(rs) {
		sqlA.close();
		res.send(JSON.stringify(rs));
		dbconn.disconn();
		dbconn.close();
	});
}
module.exports = router;