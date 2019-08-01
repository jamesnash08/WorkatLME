const db = require('idb-connector');
var fs = require('fs');
var express = require('express');
var router = express.Router();


router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.type, req.query.json);
});
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.type, req.body.json);
});


function servResponse(req, res, next, type, json) {

	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sql;
	if (type == "insert") {//CTYPE: "M"
		//CYMD: "1181229"
		//TAPEID: "1"
		//TYPE: "M"
		//YEAR: "2018"
		var list = "(";
		for (var i = 0; i < json.length; i++) {
			list += json[i].CYMD;
			if (i < json.length - 1)
				list += ",";
		}
		list += ")";
		sql = "SELECT CYMD FROM SY.TAPEDHISTF WHERE CYMD IN " + list;
		var sqlA = new db.dbstmt(dbconn);
		sqlA.exec(sql, function (rs) {
			sqlA.close();
			for (var i = 0; i < rs.length; i++) {
				list.replace(rs[i].CYMD, "");
				list.replace(",,", ",");
			}
			for (var i = 0; i < json.length; i++) {
				if (list.indexOf(json[i].CYMD) > -1) {
					sql = "INSERT INTO SY.TAPEDHISTF (TAPEID,CYMD,TYPE  ) " +
						"VALUES(" + json[i].TAPEID + "," + json[i].CYMD + ",'" + json[i].TYPE + "')";
					var sqlB = new db.dbstmt(dbconn);
					sqlB.exec(sql, function () {
						sqlB.close();
					});
				} else {
					sql = "UPDATE SY.TAPEDHISTF " +
					"SET TAPEID=" + json[i].TAPEID + ", TYPE=" + json[i].TYPE + " WHERE CYMD=" + json[i].CYMD;
					var sqlB = new db.dbstmt(dbconn);
					sqlB.exec(sql, function () {
						sqlB.close();
					});
				}
			}
			res.send(JSON.stringify({ 'success': 'items inserted.' }));
			dbconn.disconn();
      		dbconn.close();	
		});

		


	} else {
		//sql = "SELECT * FROM SY.TAPEDHISTF";
		sql = "SELECT c.CYMD, c.YEAR, " +
			"CASE WHEN c.CYMD=c.ENPDDT THEN 'M' " +
			"ELSE ' ' END AS CTYPE, t.TAPEID, t.TYPE " +
			"FROM SY.CDATEM03 AS c " +
			"LEFT JOIN SY.TAPEDHISTF AS t ON t.CYMD=c.CYMD " +
			"WHERE c.CYMD >=" + ndate + " AND DAYS=7 " +
			"ORDER BY c.CYMD DESC";
		var sqlA = new db.dbstmt(dbconn);
		sqlA.exec(sql, function (rs) {
			sqlA.close();
			if (rs[0] == null) {
				res.send(JSON.stringify({ 'error': 'No results found' }));
			} else {
				res.send(JSON.stringify(rs));
			}

		});
		
	}
}

module.exports = router;
