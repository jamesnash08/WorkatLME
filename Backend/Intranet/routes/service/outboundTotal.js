
const db = require('idb-connector');
var fs = require('fs');
var express = require('express');
var router = express.Router();
var hitcount = 0;

router.get('/', function (req, res, next) {
	hitcount++;
	//console.log("login has been hit " + hitcount + " time(s)");
	//SET VARIABLES HERE
	var results = [];
	var blankarray = {
		"trm": '',
		"date": 0,
		"toshp": 0,
		"towgt": 0,
		"torev": 0,
		"totrev": 0,
		"tofuel": 0,
		"togoal": 0,
		"togoal%": 0,
		"tishp": 0,
		"tiwgt": 0,
		"tirev": 0,
		"tirrev": 0,
		"tifuel": 0
	};


	var trm;
	var date;
	var dbconn = new db.dbconn();
	var sql;
	var filename;
	if (!req.body.trm) {
		trm = "ALL";
	} else {
		trm = req.body.trm.toUpperCase();
	}
	if (req.body.date != null) {
		date = req.body.date;
		//sql = "SELECT * FROM RV.OPINTMASTF WHERE OPCYMD='" + date + "' ORDER BY OPCYMD";
		sql = "SELECT * " +
			"FROM RV.TMRVTH01 " +
			"WHERE RVTRMA<>'ALL' AND THRDTE='" + date + "' ORDER BY RVTRM";
		filename = 'opintmqry.' + date;
	} else if (trm == 'ALL') {
		var curdate = new Date();
		var y;
		y = curdate.getFullYear() - 1;
		var curcymd = Number("1" + y.toString().substring(2) + "0101");
		//sql = "SELECT * FROM RV.OPINTMASTF WHERE OPTRM='" + trm + "' ORDER BY OPCYMD";
		sql = "SELECT * FROM RV.TMRVTH03 WHERE TMCYMD>='" + curcymd + "' ORDER BY TMCYMD";
		filename = 'opintmqry.' + trm;
	} else {
		var curdate = new Date();
		var y;
		y = curdate.getFullYear() - 1;
		var curcymd = Number("1" + y.toString().substring(2) + "0101");
		sql = "SELECT * FROM RV.TMRVTHISTF WHERE RVTRMA='" + trm + "' ORDER BY TMCYMD";
		filename = 'opintmqry.' + trm;
	}
	dbconn.conn("*LOCAL");

	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs) {
		sqlA.close();
		if (rs[0] == null) {
			results = { 'error': 'No results found' };
			res.send(JSON.stringify(results));
		} else {
			results = [];
			for (var i = 0; i < rs.length; i++) {
				var result = {
					"trm": '',
					"date": 0,
					"toshp": 0,
					"towgt": 0,
					"torev": 0,
					"totrev": 0,
					"tofuel": 0,
					"togoal": 0,
					"togoal%": 0,
					"tishp": 0,
					"tiwgt": 0,
					"tirev": 0,
					"tirrev": 0,
					"tifuel": 0
				};
				result.trm = rs[i].RVTRMA,
					result.date = rs[i].THRDTE,
					result.toshp = addValues(rs[i].LTLSOC, rs[i].TLSOC);
				result.towgt = addValues(rs[i].LTLWOC, rs[i].TLWOC);
				result.totrev = addValues(rs[i].LTLTOC, rs[i].TLTOC);
				result.tofuel = addValues(rs[i].LTLFOC, rs[i].TLFOC);
				result.torev = addValues(result.tofuel, result.totrev);
				result.tishp = addValues(rs[i].LTLSIC, rs[i].TLSIC);
				result.tiwgt = addValues(rs[i].LTLWIC, rs[i].TLWIC);
				result.titrev = addValues(rs[i].LTLTIC, rs[i].TLTIC);
				result.tifuel = addValues(rs[i].LTLFIC, rs[i].TLFIC);
				result.tirev = addValues(result.tifuel, result.titrev);

				results[i] = result;
			}
			//if(filename > ""){
			//	fs.writeFile("/www/lmelocal/htdocs/stored/hourly/"+filename+".txt",JSON.stringify(results),function (err){
			//		if (err) console.log(err);
			//	});
			//}
			res.send(JSON.stringify(results));
			dbconn.disconn();
			dbconn.close();
		}

	});

});

function addValues(val1, val2) {
	var val3 = Number(val1) + Number(val2);
	return val3.toFixed(0);
}

module.exports = router;