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
		
		var dbconn = new db.dbconn();
		dbconn.conn("*LOCAL");
		var sql;	
		sql = "select DISTINCT a.PUCZB# as PUCZB, a.PUCZBNAM, b.PTILSCAC, b.PTTRMA "+                                  
		"FROM CS.PUCZBM01 as a "+
		"INNER JOIN SY.POINTM01 as b ON b.PTZIP=a.PUCZB# AND b.PTEXPDATE=9999999 "+
		"ORDER BY b.PTTRMA, a.PUCZB#";
		var sqlA = new db.dbstmt(dbconn);
		sqlA.exec(sql, function(rs) {
			sqlA.close();
			res.send(JSON.stringify(rs));
			dbconn.disconn();
		dbconn.close();
		});
		

}
module.exports = router;