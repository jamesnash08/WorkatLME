const db = require('idb-connector');
var express = require('express');
var router = express.Router();
var version = 1.1;

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.user, req.query.pollid, req.query.json);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.user, req.body.pollid, req.body.json);
});
function servResponse(req, res, next,user,pollid, json) {
	//json = {USER:,TRM:,NAME:,TRLR:,SCAC:,DOOR:,DRVNUM:,ROWS:[{PLSEQ:,MTSEQ:,PRO:}]}
	var curdate = new Date();
	var ldate = Number(curdate.getFullYear().toString() + "" + get2Digit(curdate.getMonth() + 1) + "" + get2Digit(curdate.getDate()));
	json.USER = json.USER?json.USER:'';
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	//Delete old records
	var sql = "DELETE FROM SY.POLLSHISTF WHERE POLLID=" + pollid + " AND SUBMITTER='" + user + "'";
	var statement = new db.dbstmt(dbconn);
	statement.exec(sql, (rs,err) => {
		if(err){console.log(err);console.log(sql);}
		statement.close();
		// console.log(json);
		for (let i = 0; i < json.length; i++) {
			let sqlfor = "INSERT INTO SY.POLLSHISTF (POLLID,SUBMITTER,SEQ,ANSWER,DATE) VALUES(" + pollid + ",'" + user + "'," + json[i].SEQ + ",'" + json[i].ANSWER + "'," + ldate + ")";
			
			let statementfor = new db.dbstmt(dbconn);
			statementfor.exec(sqlfor, (rs,err) => {
				if(err){console.log(err);console.log(sqlfor);}
				statementfor.close();
				if(i == json.length -1){
					dbconn.disconn();
					dbconn.close();
					res.send(JSON.stringify({ "success": "Plan was updated" }));
				}
			});
		}
	});
}

async function insertSQL(dbconn,sql){

}

function get2Digit(val) {
    if (val.toString().length == 1)
        return "0" + val.toString();
    else
        return val.toString();
}

module.exports = router;