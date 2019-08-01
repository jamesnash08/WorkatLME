var db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.pro, req.query.user, req.query.password);
});
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.pro, req.body.user, req.body.password);
});

function servResponse(req, res, next, pro, user, password) {
	var origin = req.get('origin') != undefined ? req.get('origin').toUpperCase().replace('.WWW', '') : '';
	var dbconn = new db.dbconn();
	dbconn.conn("DPI", "DPIOPS", "CHEX");
	var joinsql = "";
	//console.log(origin);
	try{
		user = user.toUpperCase();
	}catch(err){}
	try{
		password = password.toUpperCase();
	}catch(err){}
	if (
		(!origin || origin.indexOf("HTTPS://LME4ME.COM") == -1) &&
		(password != undefined)
	) {
		joinsql += "AND m.CWPASSWORD='" + password + "' ";
	}
	if (pro == null || pro.toString().trim() == "") {
		dbconn.disconn();
		dbconn.close();
		res.send(JSON.stringify({
			"error": "Invalid PRO"
		}));
	} else {
		var sql;
		sql = "SELECT b.PRO, c.CWUSERID FROM BR.BILLSM01 AS b " +
			"INNER JOIN RV.CUSWBD01 AS c ON c.CMCUST=b.PAYOR  OR c.CMCUST=b.ADVCL OR c.CMCUST=b.BYDCL " +
			"INNER JOIN RV.CUSWBM01 AS m ON m.CWUSERID='" + user + "' " + joinsql +
			"WHERE b.PRO=" + pro + " AND c.CWUSERID='" + user + "' " +
			"UNION ALL " +
			"SELECT f.FBNO AS PRO, c.CWUSERID FROM LIBBIL.FBMASTER AS f " +
			"INNER JOIN RV.CUSWBD01 AS c ON  c.CMCUST=f.BILLTO  OR c.CMCUST=f.ADVNBR OR c.CMCUST=f.BYDNBR " +
			"INNER JOIN RV.CUSWBM01 AS m ON m.CWUSERID='" + user + "' " + joinsql +
			"WHERE f.FBNO=" + pro + " AND c.CWUSERID='" + user + "'";
			console.log(sql);
		var sqlA = new db.dbstmt(dbconn);
		sqlA.exec(sql, (rs, err) => {
			if (err) {
				dbconn.disconn();
				dbconn.close();
				console.log("ERR90002 " + err.toString());
				console.log(sql);
				res.send(JSON.stringify({
					'error': "Invalid info"
				}));
			} else {
				// console.log(JSON.stringify(rs));
				sqlA.close();
				if (!rs[0]) {
					dbconn.disconn();
					dbconn.close();
					res.send(JSON.stringify({
						"error": "You are not authorized to this PRO"
					}));
				} else if (rs[0].CWUSERID.trim() == user.trim()) {
					//b.AHFOLN, c.AKAPPA,
					sql = "SELECT  c.AKDOCN, c.AKDOCT, c.AKDTEA AS DATE " +
						"FROM PACIVFIL.FLX010P AS a " +
						"LEFT JOIN PACIVFIL.FLOCONL4 AS b ON b.AHFOLN=a.AOFOLN " +
						"LEFT JOIN PACIVFIL.DOCHDRL2 AS c ON c.AKDOCN=b.AHDOCN " +
						"WHERE a.AOUKEY = '" + pro + "' AND a.AOAPPA='LME' AND AKDOCT IN ('BL','BOL','BILL','CBILL','DR','WI','DIMENSION')";
					console.log(sql);
					var sqlB = new db.dbstmt(dbconn);
					sqlB.exec(sql, function (rs2) {
						sqlB.close();
						dbconn.disconn();
						dbconn.close();
						if (!rs2[0])
							res.send(JSON.stringify({
								"error": "No documents found for this PRO"
							}));
						else
							res.send(JSON.stringify(rs2));
					});
				} else {
					dbconn.disconn();
					dbconn.close();
					res.send(JSON.stringify({
						"error": "You are not authorized to this PRO"
					}));
				}
			}
		});
	}
}
module.exports = router;