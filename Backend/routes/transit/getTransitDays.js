var xt = require("itoolkit"); //10a 10p0 10z0
var db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.orgz, req.query.dstz);
});
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.orgz, req.body.dstz);
});

function servResponse(req, res, next, orgz, dstz) {
	if(orgz && dstz){
	var curdate = new Date();
	var ldate = "1" + Number(curdate.getFullYear()).toString().substring(2) + get2Digit(curdate.getMonth() + 1) + get2Digit(curdate.getDate());
	var cymd = ldate;
	var dbconn = new db.dbconn();
	dbconn.conn("DPI", "DPIOPS", "CHEX");
	var sql = "SELECT p.*, t.TMNAME, t.TMADDRESS, t.TMFAX1,t.TMCITY,t.TMZIP,t.TMSTATE " +
		"FROM SY.POINTMASTF AS p " +
		"LEFT JOIN SY.TRMLSMASTF AS t ON t.TMTRMLCODE=CASE WHEN p.PTILTRMA != '   ' THEN p.PTILTRMA ELSE p.PTTRMA END " +
		"WHERE p.PTZIP = '" + orgz + "' AND p.PTEFFDATE <= " + cymd + " AND p.PTEXPDATE > " + cymd + " " +
		"ORDER BY p.PTCITY, p.PTZIP";
	//p.PTCITY = '" + orgc + "' AND 
	// console.log(sql);
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, (org, err) => {
		sqlA.close();
		sql = "SELECT p.*, t.TMNAME, t.TMADDRESS, t.TMFAX1,t.TMCITY,t.TMZIP,t.TMSTATE " +
			"FROM SY.POINTMASTF AS p " +
			"LEFT JOIN SY.TRMLSMASTF AS t ON t.TMTRMLCODE=CASE WHEN p.PTILTRMA != '   ' THEN p.PTILTRMA ELSE p.PTTRMA END " +
			"WHERE p.PTZIP = '" + dstz + "' AND p.PTEFFDATE <= " + cymd + " AND p.PTEXPDATE > " + cymd + " " +
			"ORDER BY p.PTCITY, p.PTZIP";
		//AND p.PTCITY = '" + dstc + "' 
		// console.log(sql);
		var sqlB = new db.dbstmt(dbconn);
		sqlB.exec(sql, (dst, err) => {
			sqlB.close();

			//res.send(JSON.stringify(rs));
			var rs = [org[0], dst[0]];
			rs[0].PTTRMA = rs[0].PTILTRMA.trim() > "" ? rs[0].PTILTRMA : rs[0].PTTRMA;
			rs[1].PTTRMA = rs[1].PTILTRMA.trim() > "" ? rs[1].PTILTRMA : rs[1].PTTRMA;


			dbconn.disconn();
			dbconn.close();
			var conn = new xt.iConn("DPI", "DPIOPS", "CHEX");
			var pgm = new xt.iPgm("SYM710", {
				"lib": "SY"
			});
			pgm.addParam(rs[0].PTILSCAC, "4a");
			pgm.addParam(rs[1].PTILSCAC, "4a");
			pgm.addParam("20" + cymd.substring(1), "8a"); //
			pgm.addParam(rs[0].PTTRMA, "3a"); //orga
			pgm.addParam("", "2a"); //
			pgm.addParam("", "3a"); //
			pgm.addParam(rs[0].PTCITY, "25a");
			pgm.addParam(rs[0].PTSTATE, "2a");
			pgm.addParam(rs[0].PTZIP, "6a");
			pgm.addParam(rs[1].PTCITY, "25a");
			pgm.addParam(rs[1].PTSTATE, "2a");
			pgm.addParam(rs[1].PTZIP, "6a");
			pgm.addParam("", "1a"); //
			pgm.addParam("", "8a"); //
			pgm.addParam("", "3a"); //
			pgm.addParam(rs[1].PTTRMA, "3a"); //dsta
			pgm.addParam("", "4a");
			pgm.addParam("", "1a"); //
			pgm.addParam("", "3a"); //
			pgm.addParam("", "1a"); //
			pgm.addParam("", "1a"); //
			pgm.addParam("", "1a"); //
			pgm.addParam("", "1a"); //
			pgm.addParam("", "1100a"); //
			pgm.addParam("", "26a"); //
			pgm.addParam("", "26a"); //
			conn.add(pgm.toXML());
			//conn.setTimeout(60);
			conn.run(function (rsp) {
				result = JSON.parse(JSON.stringify(xt.xmlToJson(rsp)));
				//data[14].value
				//var results = { "zips": rs, "transit": JSON.parse(JSON.stringify(xt.xmlToJson(rsp))) };
				var data = result[0].data;
				var results = {
					"SERVICE_DAYS": data[14].value,
					"HOLIDAYS": data[18].value,
					"PICKUP_DATE": data[2].value,
					"ARRIVAL_DATE": data[13].value
				};
				res.send(JSON.stringify(results));
			});

		});
	});
}else
	res.send(JSON.stringify({"error":"Origin or Destination not set"}));
}
module.exports = router;

function get2Digit(val) {
	if (val.toString().length == 1)
		return "0" + val.toString();
	else
		return val.toString();
}