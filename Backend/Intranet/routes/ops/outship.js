const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.trm, req.query.state, req.query.fdate, req.query.tdate);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.trm,req.body.state, req.body.fdate, req.body.tdate);
});
function servResponse(req, res, next, trm,state, fdate,tdate) {
	
	var date,sql;
	if(trm != undefined){
		sql = "SELECT FBNO, FBDATE, DATDEL, FROMA, TOA, SHPNME, SHPADR, SHPCTY, "+
	"SHPSTA, SHPZIP, DOORNO, DOORN2, CNSNME, CNSADR, CNSCTY, "+
	"CNSSTA, CNSZIP, BLTNME, BLTCTY, BLTSTA, BLTZIP, ADVCL, BYDCL, "+
	"PPDCOL, TTLPCS, TTLWT, OURREV, HDUNITS, TOTCHG "+  
	"FROM LIBBIL.FBMASTER "+        
	"LEFT JOIN BR.BILLXM01 ON FBNO = PRO AND SUFFIX = SUFX "+
	"LEFT JOIN EC.DDOORM07 ON SHPZIP = ZIP AND FROMA = TRMCOD "+
	"AND SHPCTY = CITY "+
	"WHERE DTEYMD >= " + fdate + " AND DTEYMD <= " + tdate + " " +
	"AND FROMA = '" + trm + "'   AND SUFFIX = ' ' AND TOTCHG > 0 AND SUBSTRING(FBNO,1,3) != '305'" +
	" ORDER BY FBDATE,DOORNO";
	}else{
		sql = "SELECT FBNO, FBDATE, DATDEL, FROMA, TOA, SHPNME, SHPADR, SHPCTY, "+
	"SHPSTA, SHPZIP, DOORNO, DOORN2, CNSNME, CNSADR, CNSCTY, "+
	"CNSSTA, CNSZIP, BLTNME, BLTCTY, BLTSTA, BLTZIP, ADVCL, BYDCL, "+
	"PPDCOL, TTLPCS, TTLWT, OURREV, HDUNITS, TOTCHG "+  
	"FROM LIBBIL.FBMASTER "+        
	"LEFT JOIN BR.BILLXM01 ON FBNO = PRO AND SUFFIX = SUFX "+
	"LEFT JOIN EC.DDOORM07 ON SHPZIP = ZIP AND FROMA = TRMCOD "+
	"AND SHPCTY = CITY "+
	"WHERE DTEYMD >= " + fdate + " AND DTEYMD <= " + tdate + " " +
	"AND STATE = '" + state + "'   AND SUFFIX = ' ' AND TOTCHG > 0 AND SUBSTRING(FBNO,1,3) != '305'" +
	" ORDER BY FBDATE,DOORNO";
	}
	
	// console.log(sql);
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs) {
	
		sqlA.close();
		if (rs[0] == null) {
			res.send(JSON.stringify({ 'error': 'No results found for Terminal/State' }));
		} else {
			res.send(JSON.stringify(rs));
		}
		dbconn.disconn();
      		dbconn.close();
	});
	
}

module.exports = router;