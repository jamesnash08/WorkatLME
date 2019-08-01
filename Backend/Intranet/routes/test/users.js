const db = require('idb-connector');
var dbconn = new db.dbconn();

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	//console.log(req.query.id);
	if(req.query.id > "" && req.query.id != null){
		var sql = "SELECT BLTEMPNAME FROM BR.BLTMPM01 WHERE CWUSERID='" + req.query.id + "'";
	   
		 dbconn.conn("*LOCAL");
		 
		 var sqlA = new db.dbstmt(dbconn);
		 sqlA.exec(sql, function(rs) {
			//console.log( rs );
			res.send(JSON.stringify(rs));
		sqlA.close();
		 });
		 
	}else{
		res.send("User not Found");
	}
})

module.exports = router;