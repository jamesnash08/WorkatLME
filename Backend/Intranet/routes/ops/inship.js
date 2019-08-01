const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.trm, req.body.state, req.query.fdate, req.query.tdate);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.trm, req.body.state, req.body.fdate, req.body.tdate);
});
function servResponse(req, res, next, trm,state, fdate, tdate) {

	fdate = Number(fdate);
	tdate = Number(tdate);
	var date,sql;
	// console.log(trm);
	if(trm != undefined){
		sql = "SELECT FBNO, FBDATE, DATDEL, FROMA, TOA, SHPNME, SHPADR, SHPCTY, " +
		"SHPSTA, SHPZIP, CNSNME, CNSADR, CNSCTY, CNSSTA, CNSZIP, " +
		"DOORNO, DOORN2, BLTNME, BLTCTY, BLTSTA, BLTZIP, ADVCL, BYDCL, " +
		"PPDCOL, TTLPCS, TTLWT, OURREV, HDUNITS, TOTCHG " +
		"FROM LIBBIL.FBMASTER " +
		"LEFT JOIN BR.BILLXM01 ON FBNO = PRO AND SUFFIX = SUFX " +
		"LEFT JOIN EC.DDOORM07 ON CNSZIP = ZIP AND TOA = TRMCOD AND CNSCTY = CITY " +
		"WHERE DTEYMD >= " + fdate + " AND DTEYMD <= " + tdate + " AND SUFFIX=' ' AND TOTCHG > 0 AND TOA = '" + trm + "'  AND SUBSTRING(FBNO,1,3) != '305'" +
		" ORDER BY DATDEL,DOORNO";
	}else{
		sql = "SELECT FBNO, FBDATE, DATDEL, FROMA, TOA, SHPNME, SHPADR, SHPCTY, " +
		"SHPSTA, SHPZIP, CNSNME, CNSADR, CNSCTY, CNSSTA, CNSZIP, " +
		"DOORNO, DOORN2, BLTNME, BLTCTY, BLTSTA, BLTZIP, ADVCL, BYDCL, " +
		"PPDCOL, TTLPCS, TTLWT, OURREV, HDUNITS, TOTCHG " +
		"FROM LIBBIL.FBMASTER " +
		"LEFT JOIN BR.BILLXM01 ON FBNO = PRO AND SUFFIX = SUFX " +
		"LEFT JOIN EC.DDOORM07 ON CNSZIP = ZIP AND TOA = TRMCOD AND CNSCTY = CITY " +
		"WHERE DTEYMD >= " + fdate + " AND DTEYMD <= " + tdate + " AND SUFFIX=' ' AND TOTCHG > 0 AND STATE = '" + state + "'  AND SUBSTRING(FBNO,1,3) != '305'" +
		" ORDER BY DATDEL,DOORNO";
	}

	// console.log(sql);
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs) {
		sqlA.close();
		if (rs[0] == null) {
			dbconn.disconn();
			dbconn.close();
			res.send(JSON.stringify({ 'error': 'No results found for Terminal/State' }));
		} else {
			fdate -= 1000000;
			tdate -= 1000000;
			sql = "SELECT COUNT(NONSRV) AS WORK FROM SY.CDATEM03 WHERE NONSRV !='X' AND CYMD >=" + fdate + " AND CYMD <=" + tdate;
			var sqlB = new db.dbstmt(dbconn);
			sqlB.exec(sql, function (rs2) {
				sqlB.close();
				dbconn.disconn();
				dbconn.close();
				res.send(JSON.stringify({"DATA":rs,"WORK":rs2[0].WORK}));
			});
		}

	});

}

module.exports = router;