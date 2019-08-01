const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	servResponse(req,res,next,req.query.user);
});
router.post('/',function(req,res,next){
	servResponse(req,res,next,req.body.user);
});


function servResponse(req, res, next,user) {
	//SET VARIABLES HERE
	var dbconn = new db.dbconn();
	var sql = "SELECT m.*, d.USER " +
	"FROM SY.INTTDM01 AS m " +
	"LEFT JOIN SY.INTTDD01 AS d ON m.GROUP=d.GROUP AND d.USER=SUBSTRING('"+ user +"',1,LENGTH(TRIM(d.USER))) " +
	"ORDER BY m.INDEX";
	 dbconn.conn("*LOCAL");
	 var sqlA = new db.dbstmt(dbconn);
	 sqlA.exec(sql, function(rs) {
		sqlA.close();
		if(rs[0] == null){
			results = {'error':'No results found'};
			res.send(JSON.stringify(results));
		}else{
			res.send(JSON.stringify(rs));
		}
		dbconn.disconn();
		dbconn.close();	
	});
	
}

module.exports = router;