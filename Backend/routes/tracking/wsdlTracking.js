var xt = require("itoolkit"); //10a 10p0 10z0
var db = require('idb-connector');


if (typeof Array.isArray === 'undefined') {
	Array.isArray = function (obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	}
};

var starttime;
function getShipmentByPro(cb, pro, type) {
	// starttime = Date.now();
	var dbconn = new db.dbconn();
	dbconn.conn("DPI", "DPIOPS", "CHEX");
	// if (Array.isArray(pro))
	var pro = pro.toString().split(',');
	var concat = "";
	var emsg = checkifValid(pro, type);
	if (emsg > "")
		cb({ 'error': emsg });
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
		if (type == "PRO") {
			getInfo(cb, dbconn, list);
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
				cb({ "ERROR": "Invalid Type" });
			// console.log(sql);
			if (sql > "") {
				var sqlA = new db.dbstmt(dbconn);
				sqlA.exec(sql, (rs, err) => {
					sqlA.close();
					if (rs[0] && !err) {
						// getTime(starttime,"get type");
						list = "('";
						for (var i = 0; i < rs.length; i++) {
							if (i != 0)
								list += "', '";
							list += rs[i]['PRONBR'];
						}
						list += "')";
						// console.log("non PRO list " +list);
						getInfo(cb, dbconn, list);
					} else {
						console.log("ERR90002 " + err);
						console.log("ERR90002 " + sql);
						cb({
							errorCode: "SHPEX003",
							errorDescription:"No shipments found for PRO number"
						});
					}
				});
			}
		}
	}
}

function getInfo(cb, dbconn, list) {
	// getTime(starttime,"get pros");
	var sql;
	sql = "SELECT a.* , b.XRADVSCAC AS ADVSCAC, b.XRADVPRO AS ADVPRO, b.XRBYDSCAC AS BYDSCAC, b.XRBYDPRO AS BYDPRO, " +
		"c.DLVDAT, d.TMTRMLCODE, d.TMNAME, d.TMADDRESS, d.TMCITY, d.TMSTATE, d.TMZIP, d.TMPHONE1, d.TMPHONE2, d.TMFAX1, e.REQUIRE# AS RNNBR, c.RDDDAT " +
		"FROM EC.WEBTKM01 AS a " +
		"LEFT JOIN SY.XRPROM01 AS b ON a.PRONBR=b.XRPRO " +
		"LEFT JOIN EC.TRACEM03 AS c ON c.PRO=a.PRONBR " +
		"LEFT JOIN SY.TRMLSM01 AS d ON c.DSTA=d.TMTRMLCODE " +
		"LEFT JOIN RV.RNNBRM01 AS e ON a.PRONBR=e.PRO " +
		"WHERE a.PRONBR IN " + list +
		" ORDER BY a.PRONBR";
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, (rs, err) => {
		sqlA.close();
		if (!rs[0] || err) {
			dbconn.disconn();
			dbconn.close();
			console.log("ERR90002" + err);
			console.log("ERR90002" + sql);
			cb({
				errorCode: "SHPEX003",
				errorDescription:"No shipments found for PRO number"
			});
		} else {
			// getTime(starttime,"get pros info");
			list = list.replace(/'/g, "");
			sql = "SELECT a.PRO, a.SCAC, a.TRLR, b.TKDESC, c.TMNAME, a.TRKDAT, a.TRKTIM, a.TRKCOD " +
				"FROM EC.TRACKH01 AS a " +
				"LEFT JOIN EC.TRKCDM01 AS b ON a.TRKCOD=b.TKCODE " +
				"LEFT JOIN SY.TRMLSM01 AS c ON a.TRKTRM=c.TMTRMLCODE " +
				"WHERE a.PRO IN " + list + " AND b.TKWEBUSE='Y' " +
				"ORDER BY a.PRO, a.TRKDAT, a.TRKTIM";
			//console.log(sql);
			var sqlB = new db.dbstmt(dbconn);
			sqlB.exec(sql, function (rs2) {
				// getTime(starttime,"send results");

				var rs2format = [];
				for(var rs2i=0; rs2i<rs2.length;rs2i++){
					rs2format[rs2i] = {
						proNumber:rs2[rs2i].PRO.trim(),
						scac:rs2[rs2i].SCAC.trim(),
						statusDate:returnCYMDtoMDY(rs2[rs2i].TRKDAT),
						statusTime:rs2[rs2i].TRKTIM,
						terminal:rs2[rs2i].TMNAME.trim(),
						trackingCode:rs2[rs2i].TRKCOD.trim(),
						trackingStatus:rs2[rs2i].TKDESC.trim(),
						trailer:rs2[rs2i].TRLR.trim()
					};
				}
				sqlB.close();
				dbconn.disconn();
				dbconn.close();
				if (!rs2[0]) {
					cb({
						errorCode: "SHPEX003",
						errorDescription:"No shipments found for PRO number"
					});
				} else {
					var results = { 
						getShipmentByProReturn: { 
							pronumber: rs[0].PRONBR.trim(), 
							advancecl: rs[0].ADVSCAC, 
							billdatestring: rs[0].PRODTE, 
							billoflading: rs[0].BLDNBR ? rs[0].BLDNBR.trim() : "", 
							consigneecity: rs[0].CNSCTY.trim(), 
							destTerminal: rs[0].TMTRMLCODE.trim(), 
							estDelDate: returnCYMDtoMDY(rs[0].RDDDAT), 
							pieces: Number(rs[0].PIECES), 
							purchaseorder: rs[0].PONMBR ? rs[0].PONMBR.trim() : "", 
							shippercity:rs[0].SHPCTY.trim(),
							shippingstatus:rs[0].STATUS.trim(),
							weight:rs[0].WEIGHT,
							"details":{
								"ShipmentDetails": rs2format 
							}
						} 
					};
					cb(results);
				}
			});
		}
	});
}

function checkifValid(pro, type) {

	var rtn = "";
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
	return rtn;
}

function returnPRO(pro) {
	// var pro = pro.toString();
}

function returnCYMDtoMDY(date) {
	if (date > "" && date > "0")
		return date.substring(3, 5) + "/" + date.substring(5) + "/" + date.substring(1, 3);
	else
		return "";
}

function getTime(start, msg) {
	var now = Date.now();
	var dif = now - start;
	console.log(msg + " " + dif);
}
module.exports = { getShipmentByPro: getShipmentByPro };