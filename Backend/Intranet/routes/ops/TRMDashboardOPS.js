const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.trm, req.query.date);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.trm, req.body.date);
});
function servResponse(req, res, next, rtrm, rdate) {
	var trm;
	var date;
	var sql;
	if (rdate != null) {
		date = rdate;
		//sql = "SELECT * FROM RV.OPINTMASTF WHERE OPCYMD='" + date + "' ORDER BY OPCYMD";
		sql = "SELECT b.OPTRM as trm, b.OPDATE as date, b.OPPY as OPPY, b.OPPM, b.OPDOCK + b.OPDRIV AS tothours, b.OPDRIV AS drivhours, b.OPDOCK AS dockhours, b.PDMILES AS pdmiles, b.LHMILES AS lhmiles, b.EMSHIP / b.EMTRLR AS billtrlr, b.IPREV as ibrev, b.IPWGT AS ibwgt, b.IPSHP AS ibshp, b.OPREV AS obrev, b.OPWGT AS obwgt, b.OPSHP AS obshp, b.OPADMN AS opadmn, a.LTLROC + a.TLROC AS rvrev, a.LTLSOC + a.TLSOC AS rvshp, a.LTLWOC + a.TLWOC AS rvwgt " +
			"FROM RV.OPINTMASTF AS b " +
			"LEFT OUTER JOIN RV.TMRVTH01 AS a ON b.OPCYMD=a.TMCYMD AND b.OPTRM=a.RVTRMA " +
			"WHERE b.OPDATE='" + date + "' AND a.RVTRMA<>'ZZZ' AND b.OPTRM<>'ALL' ORDER BY b.OPCYMD DESC";
	} else if (rtrm == null || rtrm == 'ALL') {
		trm = "ALL";
		//sql = "SELECT * FROM RV.OPINTMASTF WHERE OPTRM='" + trm + "' ORDER BY OPCYMD";
		sql = "SELECT a.LTLROC + a.TLROC AS rvrev, a.LTLSOC + a.TLSOC AS rvshp, a.LTLWOC + a.TLWOC AS rvwgt, b.OPTRM as trm, b.OPDATE as date, b.OPPY as OPPY, b.OPPM, b.OPDOCK + b.OPDRIV AS tothours, b.OPDRIV AS drivhours, b.OPDOCK AS dockhours, b.PDMILES AS pdmiles, b.LHMILES AS lhmiles, b.EMSHIP / b.EMTRLR AS billtrlr, b.IPREV as ibrev, b.IPWGT AS ibwgt, b.IPSHP AS ibshp, b.OPREV AS obrev, b.OPWGT AS obwgt, b.OPSHP AS obshp, b.OPADMN AS opadmn " +
		"FROM RV.OPINTMASTF AS b " +
		"LEFT OUTER JOIN RV.TMRVTH03 AS a ON b.OPCYMD=a.TMCYMD " +
		"WHERE b.OPTRM='ALL' ORDER BY b.OPCYMD DESC";
	} else {
		trm = rtrm.toUpperCase();
		// sql = "SELECT * FROM RV.OPINTMASTF WHERE OPTRM='" + trm + "' ORDER BY OPCYMD";
		// sql = "SELECT b.OPTRM as trm, b.OPDATE as date, b.OPPY as OPPY, b.OPPM, b.OPDOCK  AS tothours, b.OPDRIV AS drivhours, b.OPDOCK AS dockhours, b.PDMILES AS pdmiles, b.LHMILES AS lhmiles, b.EMSHIP  AS billtrlr, b.IPREV as ibrev, b.IPWGT AS ibwgt, b.IPSHP AS ibshp, b.OPREV AS obrev, b.OPWGT AS obwgt, b.OPSHP AS obshp, b.OPADMN AS opadmn, a.LTLROC AS rvrev, a.LTLSOC AS rvshp, a.LTLWOC  AS rvwgt " +
		// 	"FROM RV.OPINTMASTF AS b " +
		// 	"LEFT JOIN RV.TMRVTH01 AS a ON b.OPCYMD=a.TMCYMD AND b.OPTRM='" + trm +"' " + 
		// 	"WHERE b.OPTRM='" + trm + "' ORDER BY b.OPCYMD DESC";

			sql = "SELECT b.OPTRM as trm, b.OPDATE as date, b.OPPY as OPPY, b.OPPM, CAST(b.OPDOCK AS int) + CAST(b.OPDRIV AS int) AS tothours, b.OPDRIV AS drivhours, b.OPDOCK AS dockhours, b.PDMILES AS pdmiles, b.LHMILES AS lhmiles, CASE WHEN b.EMTRLR > 0 THEN CAST(b.EMSHIP AS int) / CAST(b.EMTRLR AS int) ELSE 0 END AS billtrlr, b.IPREV as ibrev, b.IPWGT AS ibwgt, b.IPSHP AS ibshp, b.OPREV AS obrev, b.OPWGT AS obwgt, b.OPSHP AS obshp, b.OPADMN AS opadmn, CAST(a.LTLROC AS int) + CAST(a.TLROC AS int) AS rvrev, CAST(a.LTLSOC AS int) + CAST(a.TLSOC AS int) AS rvshp, CAST(a.LTLWOC AS int) + CAST(a.TLWOC AS int) AS rvwgt " +
			"FROM RV.OPINTMASTF AS b " +
			"LEFT JOIN RV.TMRVTH01 AS a ON b.OPCYMD=a.TMCYMD AND b.OPTRM=a.RVTRMA " + 
			"WHERE b.OPTRM='" + trm + "' ORDER BY b.OPCYMD DESC";

			// sql = "SELECT b.OPTRM as trm, b.OPDATE as date, b.OPPY as OPPY, b.OPPM, b.OPDOCK + b.OPDRIV AS tothours, b.OPDRIV AS drivhours, b.OPDOCK AS dockhours, b.PDMILES AS pdmiles, b.LHMILES AS lhmiles, b.EMSHIP / b.EMTRLR AS billtrlr, b.IPREV as ibrev, b.IPWGT AS ibwgt, b.IPSHP AS ibshp, b.OPREV AS obrev, b.OPWGT AS obwgt, b.OPSHP AS obshp, b.OPADMN AS opadmn, a.LTLROC + a.TLROC AS rvrev, a.LTLSOC + a.TLSOC AS rvshp, a.LTLWOC + a.TLWOC AS rvwgt " +
			// "FROM RV.OPINTMASTF AS b " +
			// "LEFT OUTER JOIN RV.TMRVTH01 AS a ON b.OPCYMD=a.TMCYMD AND b.OPTRM=a.RVTRMA " +
			// "WHERE b.OPTRM='" + trm + "' ORDER BY b.OPCYMD DESC";
	}
	// console.log(sql);
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs) {
		
		sqlA.close();
		if (rs[0] == null) {
			res.send(JSON.stringify({ 'error': 'No results found for TRM' }));
		} else {
			res.send(JSON.stringify(rs));
		}
		dbconn.disconn();
      	dbconn.close();
	});
	
}

module.exports = router;