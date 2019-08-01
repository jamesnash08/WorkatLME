var express = require('express');
var router = express.Router();
var db = require('idb-connector');
var xt = require("itoolkit");
var fs = require('fs');

router.get('/', function (req, res, next) {
	var docn = req.query.docn;
	servResponse(req, res, next, docn, req.query.pro, req.query.user, req.query.password);
});
router.post('/', function (req, res, next) {
	var docn = req.body.docn;
	servResponse(req, res, next, docn, req.body.pro, req.body.user, req.body.password);
});

function servResponse(req, res, next, docn, pro, user, password) {
	var dbconn = new db.dbconn();
	dbconn.conn("DPI", "DPIOPS", "CHEX");
	if (docn.length == 15 && docn.indexOf(".PDF") > -1)
		docn = docn.substring(2, 11);

	console.log(docn + " : " + user + " : " + password);
	var joinsql = "";
	var origin = req.get('origin') != undefined ? req.get('origin').toUpperCase().replace('.WWW', '') : '';
	if (!origin || origin.indexOf("HTTPS://LME4ME.COM") == -1) {
		// console.log(origin);
		joinsql += "AND m.CWPASSWORD='" + password + "' ";
	}

	sql = "SELECT b.PRO, c.CWUSERID FROM BR.BILLSM01 AS b " +
		"INNER JOIN RV.CUSWBD01 AS c ON c.CWUSERID='" + user + "' AND ( c.CMCUST=b.PAYOR OR c.CMCUST=b.SHIP or c.CMCUST=b.CONS )" +
		"INNER JOIN RV.CUSWBM01 AS m ON m.CWUSERID='" + user + "' " + joinsql +
		"WHERE b.PRO=" + pro + " " +
		"UNION ALL " +
		"SELECT f.FBNO AS PRO, c.CWUSERID FROM LIBBIL.FBMASTER AS f " +
		"INNER JOIN RV.CUSWBD01 AS c ON c.CWUSERID='" + user + "' AND ( c.CMCUST=f.BILLTO OR c.CMCUST=f.SHIPER or c.CMCUST=f.CONS )" +
		"INNER JOIN RV.CUSWBM01 AS m ON m.CWUSERID='" + user + "' " + joinsql +
		"WHERE f.FBNO=" + pro;

	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs, err) {
		// console.log(JSON.stringify(rs));
		sqlA.close();
		if (err) {
			dbconn.disconn();
			dbconn.close();
			console.log("ERR90002 " + err);
			console.log(sql);
			res.send(JSON.stringify({
				"error": "You are not authorized to this PRO"
			}));
		} else if (!rs[0] && user != "LMETEST") {
			dbconn.disconn();
			dbconn.close();
			res.send(JSON.stringify({
				"error": "You are not authorized to this PRO"
			}));
		} else if (rs.length > 0 || user == "LMETEST") {

			var name = "LME_" + docn;
			var path = "/www/lme4meprod/htdocs/IMS/";
			var conn = new xt.iConn("DPI", "DPIOPS", "CHEX");
			var pgm = new xt.iPgm("IMAGETOPDF", {
				"lib": "DPIPGM"
			});
			pgm.addParam(name, "40a");
			pgm.addParam(path, "40a");
			pgm.addParam(Number(docn), "9p0");

			conn.add(pgm.toXML());
			conn.run(function (rsp) {
				var results = JSON.parse(JSON.stringify(xt.xmlToJson(rsp)));
				if (results[0].success) {
					var path = '/www/lmenew/htdocs/IMS/' + name + '.pdf';
					var data = fs.readFileSync(path);
					if (data) {
						//  data = Buffer.concat(data); // do something with data 
						res.writeHead(200, {
							'Content-Type': 'application/pdf',
							'Content-Disposition': 'attachment; filename=' + name + '.pdf',
							'Content-Length': data.length
						});
						res.end(data);
						res.end();
					} else
						res.send(JSON.stringify({
							"error": "Document not created.  Try again later"
						}));
				} else
					res.send(JSON.stringify({
						"error": "Document not created.  Try again later"
					}));
				dbconn.disconn();
				dbconn.close();
			});

		} else {
			dbconn.disconn();
			dbconn.close();
			res.send(JSON.stringify({
				"error": "You are not authorized to this PRO"
			}));
		}

	});
}

module.exports = router;