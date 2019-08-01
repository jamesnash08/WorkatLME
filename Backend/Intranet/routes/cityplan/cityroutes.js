const db = require('idb-connector');
var express = require('express');
var router = express.Router();
var version = 1.1;
var dbconn = new db.dbconn();
		dbconn.conn("*LOCAL");

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.trm, req.query.user, req.query.all, req.query.ver);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.trm, req.body.user, req.body.all, req.body.ver);
});
function servResponse(req, res, next, trm, user,all,ver) {
	if (ver >= version) {
		var j1 = "";
		var w1 = "f.TOA = '" + trm + "'";
		if(trm == "JLT"){
			j1 = "LEFT JOIN EC.CPTMPMASTF AS cptmp ON f.CNSZIP=cptmp.CPZIP ";
			w1 = "cptmp.CPTERM = '" + trm + "'";
		}
		var sql = "SELECT f.FBNO, f.SUFFIX, f.FROMA, f.TOA, " +
			"f.CNSNME, f.CNSADR, f.CNSCTY, f.CNSSTA, f.CNSZIP, " +
			"d.DOORNO, d.DOORN2,  " +
			"f.TTLPCS, f.TTLWT, trace.RDDDAT, f.HAZCOD, b.HDUNITS, ap.APPTDT, " +

			"(SELECT TRKTRM FROM EC.TRACKH01 WHERE PRO=f.FBNO AND SUFX=f.SUFFIX AND TRKCOD IN ('ARV','UNL','BS1','BS2','BS3','BS4','BS9','BAY','DCK','E/R','ONT','OND','OCT','LDG','TCD') " +
			"ORDER BY TRKDAT DESC, TRKTIM DESC " +
			"FETCH FIRST 1 ROWS only) AS TRKTRM,  " +

			// "(SELECT TKDESC "+
			"(SELECT CASE WHEN th.TRKCOD='BAY' THEN CONCAT(cd.TKDESC,th.SCAC) " +//scanned to bay
			"WHEN th.TRKCOD IN ('E/R') THEN CONCAT(CONCAT(cd.TKDESC,' ETA '),tr.ETATIME) " +//Enroute
			"WHEN th.TRKCOD='ONT' OR th.TRKCOD='OCT' THEN cd.TKDESC " +//On trailer or city trailer
			"ELSE cd.TKDESC END AS STATUS " +// All others just show status
			"FROM EC.TRACKH01 AS th " +
			"LEFT JOIN EC.TRKCDM01 AS cd ON cd.TKCODE=th.TRKCOD " +
			"LEFT JOIN EC.TRAILM01 AS tr ON tr.TRAILER#=th.TRLR AND tr.SCAC=th.SCAC " +
			"WHERE th.PRO=f.FBNO AND th.SUFX=f.SUFFIX AND th.TRKCOD IN ('ARV','BAY','DCK','E/R','ONT','OND','OCT','LDG','ETD','TCD') " +
			"ORDER BY th.TRKDAT DESC, th.TRKTIM DESC " +
			"FETCH FIRST 1 ROWS only) AS STATUS, " +

			"(SELECT th.TRLR " +//Enroute
			"FROM EC.TRACKH01 AS th " +
			"WHERE PRO=f.FBNO AND SUFX=f.SUFFIX AND th.TRKCOD IN ('ARV','BAY','DCK','E/R','ONT','OND','OCT','LDG','TCD') " +
			"ORDER BY th.TRKDAT DESC, th.TRKTIM DESC " +
			"FETCH FIRST 1 ROWS only) AS TRLR, " +

			"(SELECT BDTYPC FROM BR.BILLSD01 WHERE PRO=f.FBNO AND SUFX=f.SUFFIX AND BDTYPC LIKE 'XG%' " +
			"FETCH FIRST 1 ROWS only) AS XGOLD, " +

			"(SELECT BDTYPC FROM BR.BILLSD01 WHERE PRO=f.FBNO AND SUFX=f.SUFFIX AND BDTYPC LIKE 'CA%' AND BDTYPC != 'CADX' " +
			"FETCH FIRST 1 ROWS only) AS APPT, " +

			"(SELECT BDTYPC FROM BR.BILLSD01 WHERE PRO=f.FBNO AND SUFX=f.SUFFIX AND BDTYPC LIKE 'HD%' " +
			"FETCH FIRST 1 ROWS only) AS RESD, " +

			"(SELECT BDTYPC FROM BR.BILLSD01 WHERE PRO=f.FBNO AND SUFX=f.SUFFIX AND BDTYPC != 'LG%' " +
			"FETCH FIRST 1 ROWS only) AS LGD " +

			"FROM (SELECT FBNO, FROMA, TOA, CNSNME, CNSADR, CNSCTY, CNSSTA, CNSZIP, TTLPCS, TTLWT, HAZCOD, SUFFIX, DATDEL, BYDCL "+
			"FROM LIBBIL.FBMASTER "+
			"UNION "+
			"SELECT PRO AS FBNO, ORGA AS FROMA, DSTA AS TOA, CNSNAM AS CNSNME, CNSADR, CNSCTY, CNSST AS CNSSTA, CNSZP6 AS CNSZIP, HDUNIT AS TTLPCS, TWGT AS TTLWT, ' ' AS HAZCOD, SUFX AS SUFFIX, BMDLTD AS DATDEL, BYDNAM AS BYDCL "+
			"FROM BR.BILLSM31) AS f " +

			"LEFT JOIN CS.APTDETRANF AS ap ON ap.APTFBN=f.FBNO AND f.SUFFIX=ap.APTSFX " +
			"LEFT JOIN EC.TRACEM03 AS trace ON trace.PRO=f.FBNO AND trace.SUFX=f.SUFFIX  " +
			"LEFT JOIN BR.BILLXM01 AS b ON f.FBNO = b.PRO AND f.SUFFIX = b.SUFX " +
			"LEFT JOIN EC.DDOORM07 AS d ON f.CNSZIP = d.ZIP AND f.TOA = d.TRMCOD AND f.CNSCTY = d.CITY " +
			j1 +
			// "LEFT JOIN CS.FSTARM01 AS fs ON fs.FSACCT=f.CONS AND FSIBOB IN ('O','B') " +
			"WHERE "+w1+" AND DATDEL=0 AND f.BYDCL='    '" +
			"ORDER BY DATDEL,DOORNO";

		
		var sqlA = new db.dbstmt(dbconn);
		sqlA.exec(sql, function (rs, err) {
			sqlA.close();
			if (err) {
				console.log("ERR90002 " + err);
				console.log(sql);
				res.send(JSON.stringify({ 'error': 'No results found for TRM' }));
			} else if (rs[0] == null) {
				res.send(JSON.stringify({ 'error': 'No results found for TRM' }));
			} else {
				sql = "SELECT m.*, d.PRO FROM EC.CTPLNMASTF as m LEFT JOIN EC.CTPLNDETLF AS d ON m.USR=d.USR AND m.NAME=d.NAME AND m.TRM=d.TRM WHERE m.TRM='" + trm + "' ORDER BY d.PLSEQ";
				// sql = "SELECT m.*, d.PLSEQ, d.PRO FROM EC.CTPLNMASTF as m INNER JOIN EC.CTPLNDETLF AS d ON m.USR=d.USR AND m.NAME=d.NAME AND m.TRM=d.TRM WHERE m.USR='" + user + "' AND m.TRM='" + trm + "' ORDER BY d.PLSEQ";
				var sqlB = new db.dbstmt(dbconn);
				sqlB.exec(sql, (rs2, err) => {
					sqlB.close();
					if (err) {
						console.log("ERR90002 " + err);
						console.log(sql);
					}
					if (all == "YES") {
						sql = "SELECT DRVNUM,FNAME,LNAME FROM VM.SFEMPM01 WHERE SFTERM='" + trm + "' AND TERMDT = 0 ORDER BY LNAME";
						var sqlC = new db.dbstmt(dbconn);
						sqlC.exec(sql, (rs3, err) => {
							sqlC.close();
							if (err) {
								console.log("ERR90002 " + err);
								console.log(sql);
							}
							sql = "SELECT TMADDRESS,TMCITY,TMSTATE,TMZIP FROM SY.TRMLSM01 WHERE TMTRMLCODE='" + trm + "'";
							var sqlD = new db.dbstmt(dbconn);
							sqlD.exec(sql, (rs4, err) => {
								sqlD.close();
								if (err) {
									console.log("ERR90002 " + err);
									console.log(sql);
								}
								res.send(JSON.stringify({ "DATA": rs, "PLANS": rs2, "DRIVERS": rs3, "TRM": rs4[0] }));
							});
						});
					} else {
						res.send(JSON.stringify({ "DATA": rs, "PLANS": rs2 }));
					}
				});
			}
		});
	} else{
		res.send(JSON.stringify({ "error": "Refresh required for the update. Your Version " + ver + " required " + version }));
	}
}

process.on('exit', (code) => {
	dbconn.disconn();
	dbconn.close();
});

module.exports = router;