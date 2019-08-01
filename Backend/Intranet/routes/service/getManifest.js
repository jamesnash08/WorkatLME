var xt = require("itoolkit");
const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	if (req.query.parm)
		servResponse(req, res, next, req.query.parm);
	else
		res.send({
			"error": "Parm not set"
		});
}); //fdjkfdkj
router.post('/', function (req, res, next, parm) {
	if (req.body.parm)
		servResponse(req, res, next, req.body.parm);
	else
		res.send({
			"error": "Parm not set"
		});
});

function servResponse(req, res, next, param) {
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");

	var sql;
	sql = "SELECT DSPTIM FROM EC.DSPCHH02 " +
		"WHERE DSPDAT=" + param.date + " AND TRLR1=" + param.trlr + " AND FROM='" + param.orga + "' AND ARVTRM='" + param.dsta + "'";
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs) {
		sqlA.close();
		dbconn.disconn();
		dbconn.close();
		if (rs[0] == null) {
			res.send({
				'error': 'No Manifest found'
			});
		} else {
			var parm = "";
			for (var i = 0; i < 153; i++)
				parm = parm + " ";

			parm = setStringAt(parm, 10, param.date + "" + fourDigit(rs[0].DSPTIM));
			parm = setStringAt(parm, 21, param.orga + param.dsta);
			parm = setStringAt(parm, 27, param.trlr);
			var conn = new xt.iConn("*LOCAL", "DPIOPS", "CHEX");
			var pgm = new xt.iPgm("ECL210CLLL", {
				"lib": "EC"
			});
			var rtn = "";
			pgm.addParam(parm.toString(), "153a");
			pgm.addParam(rtn, "50a");
			conn.add(pgm.toXML());
			conn.setTimeout(60);
			conn.run(function (rsp) {
				var results = JSON.parse(JSON.stringify(xt.xmlToJson(rsp)));
				//console.log(results[0].data[2].value);
				//res.send(JSON.stringify(results[0].data[2].value));	
				res.send(JSON.stringify(results));
			});
		}

	});
}

function fourDigit(num) {

	if (num.length == 4)
		return num;
	else {
		while (num.length < 4) {
			num = "0" + num.toString();
		}
		return num;
	}


}

function setStringAt(str, index, chr) {
	if (index > str.length - 1) return str;
	return str.substr(0, index) + chr + str.substr(index + chr.length);
}

module.exports = router;