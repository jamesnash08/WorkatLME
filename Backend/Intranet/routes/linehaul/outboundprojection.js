
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
	//SET VARIABLES HERE
	var results = [];
	var dbconn = new db.dbconn();
	var sql;
	if(trm && trm != 'ALL')
		sql = "SELECT OPORGA, OPDSTA, OPSRVA, OPHDUNITS, OPTTLWGT, OPCOMMENT FROM EC.OBPRJT01 WHERE OPORGA='"+trm+"' ORDER BY OPORGA, OPDSTA, OPSRVA";
	else
		sql = "SELECT OPORGA, OPDSTA, OPSRVA, OPHDUNITS, OPTTLWGT, OPCOMMENT FROM EC.OBPRJT01 ORDER BY OPORGA, OPDSTA, OPSRVA";

	 dbconn.conn("*LOCAL");

	 var sqlA = new db.dbstmt(dbconn);
	 sqlA.exec(sql, function(rs) {
		sqlA.close();
		if(rs[0] == null){
			results = {'error':'No results found'};
			res.send(JSON.stringify(results));
		}else{
			results = rs;
			res.send(JSON.stringify(results));
		}
		dbconn.disconn();
      		dbconn.close();	

	});
	
}

module.exports = router;