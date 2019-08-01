const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	var pro = req.query.pro;
	servResponse(req, res, next, pro);
});
router.post('/', function (req, res, next) {
	var pro = req.body.pro;
	servResponse(req, res, next, pro);
});

function servResponse(req, res, next, pro) {
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var rtn = {
		"track": [],
		"notes": [],
		"billing": [],
		"items": []
	};//test
	var sql;
	sql = "SELECT TRLR,SCAC,TKDESC AS STATUS,TRKTRM AS TRM,TRKDAT AS DATE,TRKTIM AS TIME,TRNINT AS INT, TRNUSR AS USER FROM EC.TRACKH01 JOIN EC.TRKCDM01 ON TRKCOD=TKCODE WHERE PRO=" + pro;
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs) {
		sqlA.close();
		rtn.track = rs;
		//console.log(JSON.stringify(rs));
		sql = "SELECT TRNTIM AS TIME, TRNDAT AS DATE, CRRNTE AS CN, TRNUSR AS USER, TRNINT AS INT, MSGTXT AS NOTES FROM BR.BILLSN01 WHERE PRO=" + pro;
		var sqlB = new db.dbstmt(dbconn);
		sqlB.exec(sql, function (rs2) {
			sqlB.close();
			rtn.notes = rs2;
			//console.log(JSON.stringify(rs2));
			sql = "SELECT SHIP, SHPNAM, SHPATN, SHPADR, SHPST, SHPCTY, SHPZP6, CONS, CNSNAM, CNSATN, CNSADR, CNSCTY, CNSST, CNSZP6, PAYTYP, PAYOR, PAYNAM, PAYATN, PAYADR, PAYCTY, PAYST, PAYZP6, ADVCL, ADVNAM, ADVDAT, ADVPRO, BYDCL, BYDNAM, ORGA, DSTA, BLDNBR, HDUNIT, TPCS, TWGT, TOTCHG, ADVREV, OURREV, BYDREV, COD, CODFEE, CFPPD, REVDAT " +
				"FROM BR.BILLSM01 WHERE PRO=" + pro;
			var sqlC = new db.dbstmt(dbconn);
			sqlC.exec(sql, function (rs3) {
				sqlC.close();
				//console.log(JSON.stringify(rs3));
				rtn.billing = rs3[0];
				sql = "SELECT BDPCS, BDFORM, BDDESC, BDCLSS, BDWGT FROM BR.BILLSD01 WHERE PRO=" + pro + " "; //AND (BDPCS>0 OR BDFORM='FRT')
				var sqlD = new db.dbstmt(dbconn);
				sqlD.exec(sql, function (rs4) {
					sqlD.close();
					//console.log(JSON.stringify(rs4));
					rtn.items = rs4;

					res.send(JSON.stringify(rtn));
					dbconn.disconn();
					dbconn.close();
				});
			});
		});
	});
}

module.exports = router;