var xt = require("itoolkit"); //10a 10p0 10z0
var db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.pro, req.query.type);
});
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.pro, req.body.type);
});

if (typeof Array.isArray === 'undefined') {
	Array.isArray = function (obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	}
};

var starttime;

function servResponse(req, res, next, pro, type) {
	if (pro && type) {
		// starttime = Date.now();
		console.log("PRO: " + pro + " type: " + type);
		var dbconn = new db.dbconn();
		dbconn.conn("DPI", "DPIOPS", "CHEX");
		// if (Array.isArray(pro))
		var pro = pro.toString().split(',');
		var concat = "";
		var emsg = checkifValid(pro, type);
		if (emsg > "")
			res.send(JSON.stringify({
				'error': emsg
			}));
		else {
			if (type != "PCK")
				concat = "'";

			var list = "(" + concat;
			for (var i = 0; i < pro.length; i++) {
				if (i != 0) {
					// console.log(concat);
					list += concat + ", " + concat;
				}
				// console.log(pro[i]);
				if (type == "PRO")
					list += pro[i].substring(0, 10);
				else
					list += pro[i];
			}
			list += concat + ")";
			// console.log("PRO " + concat + list);
			if (type == "PRO" && pro[0] != null) {
				getInfo(dbconn, res, list);
			} else {
				var sql = "";
				if (type == "BOL")
					sql = "SELECT PRONBR FROM EC.WEBTKM01 WHERE BLDNBR IN " + list;
				else if (type == "PO")
					sql = "SELECT PRONBR FROM EC.WEBTKM01 WHERE PONMBR IN " + list;
				else if (type == "ACL")
					sql = "SELECT PRO AS PRONBR FROM EC.TRACEM03 WHERE ADVPRO IN " + list;
				else if (type == "PCK")
					sql = "SELECT PUPRO AS PRONBR FROM CS.PUFRTD01 WHERE PUPICKUP# IN " + list;
				else if (type == "LOAD")
					sql = "SELECT PUPRO AS PRONBR FROM CS.PUFRTD01 WHERE PULOAD# IN " + list;
				else if (type == "RN")
					sql = "SELECT PRO AS PRONBR FROM RV.RNNBRM01 WHERE REQUIRE# IN " + list;
				else
					res.send(JSON.stringify({
						"ERROR": "Invalid Type"
					}));
				// console.log(sql);
				if (sql > "") {
					var sqlA = new db.dbstmt(dbconn);
					sqlA.exec(sql, function (rs, err) {
						sqlA.close();
						if (rs != null && !err && rs.length > 0) {
							// getTime(starttime,"get type");
							list = "('";
							for (var i = 0; i < rs.length; i++) {
								if (i != 0)
									list += "', '";
								list += rs[i]['PRONBR'];
							}
							list += "')";
							// console.log("non PRO list " +list);
							getInfo(dbconn, res, list);
						} else {
							if (err) {
								console.log("ERR90002 " + err);
								console.log(sql);
							}
							res.send(JSON.stringify({
								"error": "No PROS found"
							}));
						}
					});
				}
			}
		}
	} else
		res.send(JSON.stringify({
			"error": "Required fields not set"
		}));
}

function getInfo(dbconn, res, list) {
	// getTime(starttime,"get pros");
	var sql;
	sql = "SELECT a.*, b.XRADVSCAC AS ADVSCAC, b.XRADVPRO AS ADVPRO, b.XRBYDSCAC AS BYDSCAC, b.XRBYDPRO AS BYDPRO, " +
		"c.DLVDAT, d.TMTRMLCODE, d.TMNAME, d.TMADDRESS, d.TMCITY, d.TMSTATE, d.TMZIP, d.TMPHONE1, d.TMPHONE2, d.TMFAX1, e.REQUIRE# AS RNNBR " +
		"FROM EC.WEBTKM01 AS a " +
		"LEFT JOIN SY.XRPROM01 AS b ON a.PRONBR=b.XRPRO " +
		"LEFT JOIN EC.TRACEM03 AS c ON c.PRO=a.PRONBR " +
		"LEFT JOIN SY.TRMLSM01 AS d ON c.DSTA=d.TMTRMLCODE " +
		"LEFT JOIN RV.RNNBRM01 AS e ON a.PRONBR=e.PRO " +
		"WHERE a.PRONBR IN " + list +
		" ORDER BY a.PRONBR";
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs, err) {
		sqlA.close();
		if (rs == null || err) {
			dbconn.disconn();
			dbconn.close();
			if (err) {
				console.log("ERR90002 " + err);
				console.log(sql);
			}
			res.send(JSON.stringify({
				"error": "No PROS found"
			}));
		} else {
			// getTime(starttime,"get pros info");
			list = list.replace(/'/g, "");
			sql = "SELECT a.PRO, a.TRLR, b.TKDESC, c.TMNAME, a.TRKDAT, a.TRKTIM, a.TRKTRM " +
				"FROM EC.TRACKH01 AS a " +
				"LEFT JOIN EC.TRKCDM01 AS b ON a.TRKCOD=b.TKCODE AND b.TKWEBUSE='Y'" +
				"LEFT JOIN SY.TRMLSM01 AS c ON a.TRKTRM=c.TMTRMLCODE " +
				"WHERE a.PRO IN " + list +
				"ORDER BY a.PRO, a.TRKDAT, a.TRKTIM";
			var sqlB = new db.dbstmt(dbconn);
			sqlB.exec(sql, function (rs2, err) {
				// getTime(starttime,"send results");

				sqlB.close();
				dbconn.disconn();
				dbconn.close();
				if (rs2 == null || err) {
					if (err) {
						console.log("ERR90002 " + err);
						console.log(sql);
					}
					res.send(JSON.stringify({
						"error": "No PROS found"
					}));
				} else {
					var results = {
						"Status": rs[0],
						"Details": rs2
					};
					res.send(JSON.stringify(results));
				}
			});
		}
	});
}

function checkifValid(pro, type) {

	var rtn = "";
	// console.log(pro);

	// if (Array.isArray(pro)) {
	//Check for duplicates
	// console.log("is array " + pro[0]);
	for (var i = 0; i < pro.length; i++) {

		if (pro[i] == null) {
			i = pro.length;
			rtn = 'Blank value not allowed';
		} else if (pro[i].trim() == '') {
			i = pro.length;
			rtn = 'Blank value not allowed';
		}
		// console.log(pro[i]);
		if (pro.indexOf(pro[i]) > -1 && pro.indexOf(pro[i]) != i) {
			i = pro.length;
			rtn = 'Duplicate values found';
		}
		if (pro[i].indexOf(',') > -1 || pro[i].indexOf(' ') > -1 || pro[i].indexOf(':') > -1) {
			i = pro.length;
			rtn = "Invalid characters found";
		}
		if (isNaN(pro[i]) && (type == "PCK" || type == "PRO")) {
			i = pro.length;
			rtn = 'Numeric values only for type selected';
		}
	}
	// }else{
	// 	if (pro.indexOf(',') > -1 || pro.indexOf(' ') > -1) {
	// 		rtn = "Invalid characters found";
	// 	}
	// 	if (isNaN(pro) && (type == "PCK")) {
	// 		rtn = 'Numeric values only for type selected';
	// 	}
	// }
	return rtn;
}

function returnPRO(pro) {
	// var pro = pro.toString();
}

function getTime(start, msg) {
	var now = Date.now();
	var dif = now - start;
	console.log(msg + " " + dif);
}
module.exports = router;