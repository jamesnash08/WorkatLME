const db = require('idb-connector');
var express = require('express');
var router = express.Router();
var version = 1.1;

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.json,req.query.ver);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.json,req.body.ver);
});
function servResponse(req, res, next, json,ver) {
	if (ver >= version) {
	//json = {USER:,TRM:,NAME:,TRLR:,SCAC:,DOOR:,DRVNUM:,ROWS:[{PLSEQ:,MTSEQ:,PRO:}]}
	json.USER = json.USER?json.USER:'';
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	//Delete old records
	var sql = "DELETE FROM EC.CTPLNMASTF WHERE TRM='" + json.TRM + "' AND NAME='" + json.NAME + "'";
	console.log(sql);
	var statement = new db.dbstmt(dbconn);
	statement.exec(sql, (rs,err) => {
		if(err){console.log(err);console.log(sql);}
		statement.close();
		sql = "DELETE FROM EC.CTPLNDETLF WHERE TRM='" + json.TRM + "' AND TRIM(NAME)='" + json.NAME.trim() + "'";
		console.log(sql);
		statement = new db.dbstmt(dbconn);
		statement.exec(sql, (rs,err) => {
			if(err){console.log(err);console.log(sql);}
			statement.close();
			sql = "INSERT INTO EC.CTPLNMASTF (USR,TRM,NAME,SCAC,DOOR,TRLR,TRUCK,DRVNUM) VALUES('" + json.USER + "','" + json.TRM + "','" + json.NAME.trim() + "','" + json.SCAC + "','" + json.DOOR + "','" + json.TRLR + "','" + json.TRUCK + "','" + json.DRVNUM + "')";
			statement = new db.dbstmt(dbconn);
			console.log(sql);
			statement.exec(sql, (rs,err) => {
				if(err){console.log(err);console.log(sql);}
				statement.close();
				if (json.ROWS) {
					for (let i = 0; i < json.ROWS.length; i++) {
						let sqlfor = "INSERT INTO EC.CTPLNDETLF (USR,TRM,NAME,PRO,PLSEQ,MTSEQ) VALUES('" + json.USER + "','" + json.TRM + "','" + json.NAME + "'," + json.ROWS[i].PRO + "," + json.ROWS[i].PLSEQ + "," + json.ROWS[i].MTSEQ + ")";
						console.log(sqlfor);
						let statementfor = new db.dbstmt(dbconn);
						statementfor.exec(sqlfor, (rs,err) => {
							if(err){console.log(err);console.log(sqlfor);}
							statementfor.close();
							if (i == json.ROWS.length - 1) {
								dbconn.disconn();
								dbconn.close();
								res.send(JSON.stringify({ "success": "Plan was updated" }));
							}
						});
					}
				}
			});
		});
	});
}else
	res.send(JSON.stringify({ "error": "Refresh required for the update. Your Version " + ver + " required " + version }));
}

module.exports = router;