
const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	servResponse(req,res,next,req.query.org,req.query.nxt,req.query.dst);
});
router.post('/',function(req,res,next){
	servResponse(req,res,next,req.body.org,req.body.nxt,req.body.dst);
});


function servResponse(req, res, next,org,nxt,dst) {
	//SET VARIABLES HERE

	var results = {};
	var returns = 0;
	var curdate = new Date();
	curdate.setDate(curdate.getDate()-7);
	var ldate = "1" + curdate.getFullYear().toString().substring(2) + "" + get2Digit(curdate.getMonth() + 1) + "" + get2Digit(curdate.getDate());
	var ndate = Number(ldate);
	if(org == null || nxt == null || dst == null){
		results = {'error':'No results found'};
			res.send(JSON.stringify(results));
	}

	var dbconn = new db.dbconn();
	var sql = "SELECT c.PRO, c.TPCS, c.HDUNIT, b.CONSZIP, a.OPTTLWGT, c.TWGT, c.RDDDAT, d.SHIPNAME, d.SHIPZIP " +
	"FROM EC.OBPRJT01 AS a " +
	"RIGHT JOIN CS.PUFRTD01 AS b ON a.OPPICKUP#=b.PUPICKUP# AND a.OPSRVA=b.PUDSTA " + 
	"LEFT JOIN BR.BILLSM01 AS c ON b.PUPRO=c.PRO " +
	"INNER JOIN CS.PUFRTM01 AS d ON a.OPPICKUP#=d.PUPICKUP# " + 
	"WHERE OPORGA='" + org + "' AND OPDSTA='" + nxt +"' AND OPSRVA='" + dst + "' " +
	"ORDER BY b.PUPRO";


	 dbconn.conn("*LOCAL");

	 var sqlA = new db.dbstmt(dbconn);
	 sqlA.exec(sql, function(rs) {
		 returns++;
		sqlA.close();
		if(rs[0] == null){
			//results = {'error':'No results found'};
			if(returns>1)
				res.send(JSON.stringify(results));
		}else{
				results["pros"] = rs;
			//results = rs;
			if(returns>1)
				res.send(JSON.stringify(results));
		}

	});
	var sql2 = "SELECT a.PRO, a.DSPTRM, a.DSTA, a.SHPNAM, a.CNSNAM, a.CNSST, a.TPCS, a.TWGT, a.TRLR, a.RDDDAT, a.DSPCOD, a.CONS, a.SHIP, " +
	"b.BDTYPC AS HAZMAT, c.FSACCT + d.FSACCT AS FSTAR " +
	"FROM EC.TRACEMASTF as a " +
	"LEFT OUTER JOIN BR.BILLSD01 AS b ON b.PRO=a.PRO AND b.BDTYPC LIKE 'HM%' " +
	"LEFT OUTER JOIN CS.FSTARM02 AS c ON a.CONS=c.FSACCT " +
	"LEFT OUTER JOIN CS.FSTARM01 AS d ON a.SHIP=d.FSACCT " +
	"WHERE a.DSPTRM='" + org + "' AND a.DSTA='" + dst +"' AND a.SUFX=' ' AND " +
	"(a.DSPDAT >= "+ndate+" OR (a.DSPDAT=0 AND a.ADVORG='   ')) AND a.PICKUP>="+ndate+" AND " +
	"((a.DSPTRM != a.DSTA AND a.DSPCOD = '   ' AND a.DLVDAT=0 AND a.DSPTRM!=a.DSTA) OR " +
	"(a.DSPTRM != a.BYDHUB AND a.BYDHUB!='   ' AND a.DSPCOD != '   ' AND a.DLVDAT=0 AND a.DSPTRM!=a.DSTA) OR " +
	"(a.DSPTRM != a.DSTA AND a.DSPCOD IN ('ARV','OND','STG') AND a.DLVDAT=0) OR " +
	"(a.DSPTRM != a.BYDHUB AND a.BYDHUB != '   ' AND a.DSPCOD IN ('ARV','OND','STG') AND a.DLVDAT=0) OR " +
	"(a.DSPTRM != a.DSTA AND a.DSPCOD = 'E/R' AND a.DLVDAT=0) OR " +
	"(a.BYDHUB != '   ' AND a.DSPCOD = 'E/R' AND a.DLVDAT=0)) " +
	"ORDER BY a.PRO";

	 dbconn.conn("*LOCAL");

	 var sqlB = new db.dbstmt(dbconn);
	 sqlB.exec(sql2, function(rs) {
		 returns++;
		sqlB.close();
		if(rs[0] == null){
			//results = {'error':'No results found'};
			if(returns>1)
				res.send(JSON.stringify(results));
		}else{
			results["lefttoload"] = rs;
			results["date"] = ndate;
			//results = rs;
			if(returns>1)
				res.send(JSON.stringify(results));
		}

	});
	
}

module.exports = router;

function get2Digit(val){
	if(val.toString().length == 1)
	return "0" + val.toString();
	else
	return val.toString();
}