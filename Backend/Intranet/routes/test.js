const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next);
});
function servResponse(req, res, next) {
	var sql = "SELECT FBNO32 FROM LIBBIL.FBMASTER WHERE FBNO=3251905788";
	console.log(sql);
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, (data,err) => {
		sqlA.close();	
		if (err) {
			errCallback(err);
		} else { // continue code
			dbconn.disconn();
			dbconn.close();	
			res.send(JSON.stringify({"success":data}));
		}
	});


	function errCallback(err){
		dbconn.disconn();
		dbconn.close();	
		console.log("ERR90002 " + err.toString());
		res.send(JSON.stringify({'error': err.toString()}));
	}
}

module.exports = router;