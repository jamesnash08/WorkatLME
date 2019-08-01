var db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.pros, req.query.json);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.pros, req.body.json);
});
function servResponse(req, res, next, pros, json) {
	if (!json.ver) {
		res.send({ "error": "Refresh required for update" });
	} else {
		// var json = {user:,trlr:,trm:,scac:}
		var dbconn = new db.dbconn();
		dbconn.conn("*LOCAL");

		json.TRLR = isNaN(json.TRLR)?0:json.TRLR;
		try{
			if(json.TRLR.toString().trim().length == 0){
				json.TRLR = 0;
			}
		}catch(e){
			json.TRLR = 0;
		}
		// json.TRLR = "0" + json.TRLR.trim();
		var currtn = 0;

		var curdate = new Date();
		var ldate = "1" + curdate.getFullYear().toString().substring(2) + "" + get2Digit(curdate.getMonth() + 1) + "" + get2Digit(curdate.getDate());
		var trndat = Number(ldate);
		var trntim = get2Digit(curdate.getHours().toString()) + get2Digit(curdate.getMinutes());

		for (let i = 0; i < pros.length; i++) {
			let sql = "SELECT * FROM EC.TRACKH01 WHERE TRKCOD='PLN' AND PRO=" + pros[i];
			let statement = new db.dbstmt(dbconn);
			statement.exec(sql, (rs, err) => {
				if (err) { console.log("ERR90002 " + err); console.log(sql); }
				statement.close();
				if (rs == null || rs[0] == null) {
					let sql2 = "INSERT INTO EC.TRACKH01 (PRO,TRLR,SCAC,TRKCOD,TRKTRM,TRKDAT,TRKTIM,TRNUSR,TRNPGM,TRNDAT,TRNTIM,EDISNT) " +
						"VALUES (" + pros[i] + "," + json.TRLR + ",'" + json.SCAC + "','PLN','" + json.TRM + "'," + trndat + "," + trntim + ",'" + json.USER + "','CITYPLAN'," + trndat + "," + Number(trntim.toString() + "00") + ",'N')";
					let statement2 = new db.dbstmt(dbconn);
					statement2.exec(sql2, (rs, err) => {
						statement2.close();
						currtn++;
						if (err) { console.log("ERR90002 " + err); console.log(sql2); 
						dbconn.disconn();
						dbconn.close();
						res.send(JSON.stringify({ "error": err }));
						}else if (currtn == pros.length) {
							returnFunc(dbconn, res);
						}
					});
				} else {
					currtn++;
					if (currtn == pros.length) {
						returnFunc(dbconn, res);
					}
				}
			});
		}
	}




}

function returnFunc(dbconn, res) {
	dbconn.disconn();
	dbconn.close();
	res.send(JSON.stringify({ "success": "Tracking records were recorded" }));
}

module.exports = router;

function get2Digit(val) {
	if (val.toString().length == 1)
		return "0" + val.toString();
	else
		return val.toString();
}