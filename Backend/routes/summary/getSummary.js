var xt = require("itoolkit"); //10a 10p0 10z0
var db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.userid);
});
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.userid);
});

function servResponse(req, res, next, user) {
	// console.log("get summary " + user);
	var results = {
		"shipments": [],
		"webpf": []
	};
	var dbconn = new db.dbconn();
	dbconn.conn("DPI", "DPIOPS", "chex");
	var conn = new xt.iConn("DPI", "DPIOPS", "chex");

	var pgm = new xt.iPgm("CSM713", {
		"lib": "CS"
	});
	pgm.addParam(user, "10a");
	conn.add(pgm.toXML());
	conn.run(function (rsp) {
		var rsp2 = JSON.parse(JSON.stringify(xt.xmlToJson(rsp)));
		var sql = "SELECT * FROM CS.USRPRW01 WHERE USRID='" + user + "'";
		var sqlA = new db.dbstmt(dbconn);
		sqlA.exec(sql, function (rs,err) {
			if(err){
				console.log("ERR90002 " + err);
				console.log("ERR90002 "+sql);
				dbconn.disconn();
				dbconn.close();
				res.send(JSON.stringify({
					"error": "Error on page"
				}));
			}else{
			sqlA.close();
			results.shipments = rs;
			sql = "SELECT a.USERID, a.ID AS FID, a.CYMD, a.TYPE, a.CREATOR, p.SHIPNAME AS P1, p.SHIPZIP AS P2, p.RDYDATE AS P3, r.SHPZP6 AS R1, r.CNSZP6 AS R2, r.TOTCHG AS R3, b.SHIPNAME AS B1, b.CONSNAME AS B2, b.TPPNAME AS B3, b.BLPDFNAME AS B4 " +
				"FROM SY.WEBPFH01 AS a " +
				"LEFT JOIN CS.PUFRTM01 AS p ON a.ID=p.PUPICKUP# " +
				"LEFT JOIN BR.RTQTEH01 AS r ON a.ID=r.RQUOTE " +
				"LEFT JOIN BR.BLWHDH01 AS b ON a.ID=b.BLRQUEST# " +
				"WHERE a.USERID='" + user + "' AND a.CREATOR != 'VLA'";
			var sqlB = new db.dbstmt(dbconn);
			sqlB.exec(sql, function (rs2, err) {
				sqlB.close();
				if (err) {
					dbconn.disconn();
					dbconn.close();
					console.log("ERR90002 " + err);
					console.log(sql);
					res.send(JSON.stringify({
						"error": "Error on page"
					}));
				} else {
					results.webpf = rs2;
					dbconn.disconn();
					dbconn.close();
					res.send(JSON.stringify(results));
				}
			});
		}
		});
	});
}
module.exports = router;