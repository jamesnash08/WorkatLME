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

	var curdate = new Date();
	var ldate = "1" + Number(curdate.getFullYear() - 1).toString().substring(2) + "0101";
	var ndate = Number(ldate);

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
		sqlA.exec(sql, function (rs,err) {
			if(err){console.log(err);console.log(sql);}
			sqlA.close();
			for (var i = 0; i < rs.length; i++) {
				list.replace(rs[i].CYMD, "");
				list.replace(",,", ",");
			}
			for (let i = 0; i < json.length; i++) {
				if (list.indexOf(json[i].CYMD) > -1) {
					let sql2 = "INSERT INTO SY.TAPEDHISTF (TAPEID,CYMD,TYPE  ) " +
						"VALUES(" + json[i].TAPEID + "," + json[i].CYMD + ",'" + json[i].TYPE + "')";
						console.log(sql2);
					let sqlB = new db.dbstmt(dbconn);
					sqlB.exec(sql2, function (rs,err) {
						sqlB.close();
						if(i == json.length -1){
							dbconn.disconn();
							dbconn.close();
							res.send(JSON.stringify({ 'success': 'items inserted.' }));
						}
					});
				} else {
					let sql2 = "UPDATE SY.TAPEDHISTF " +
					"SET TAPEID=" + json[i].TAPEID + ", TYPE=" + json[i].TYPE + " WHERE CYMD=" + json[i].CYMD;
					console.log(sql2);
					let sqlB = new db.dbstmt(dbconn);
					sqlB.exec(sql2, function (rs,err) {
						sqlB.close();
						if(i == json.length -1){
							res.send(JSON.stringify({ 'success': 'items inserted.' }));
							dbconn.disconn();
							dbconn.close();
						}
					});
				}
			}
			
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
