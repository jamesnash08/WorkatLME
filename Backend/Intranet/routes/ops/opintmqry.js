const db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	servResponse(req,res,next, req.query.trm, req.query.date);
}); //fdjkfdkj
router.post('/',function(req,res,next){
	servResponse(req,res,next, req.body.trm, req.body.date);
});
function servResponse (req, res, next,rtrm,rdate) {
	var trm;
	var date;
	var sql;
	if(rdate != null){
		date = rdate;
		//sql = "SELECT * FROM RV.OPINTMASTF WHERE OPCYMD='" + date + "' ORDER BY OPCYMD";
		sql = "SELECT b.*, a.LTLROC + a.TLROC AS REVENUE, a.LTLSOC + a.TLSOC AS SHIPMENTS, a.LTLWOC + a.TLWOC AS WEIGHT " + 
		"FROM RV.OPINTMASTF AS b " + 
		"LEFT OUTER JOIN RV.TMRVTH01 AS a ON b.OPCYMD=a.TMCYMD AND b.OPTRM=a.RVTRMA " +
		"WHERE b.OPDATE='" + date + "' AND a.RVTRMA<>'ZZZ' AND b.OPTRM<>'ALL' ORDER BY b.OPCYMD DESC";
		filename = 'opintmqry.'+date;
	}else if(rtrm == null || rtrm == 'ALL'){
		trm = "ALL";
		//sql = "SELECT * FROM RV.OPINTMASTF WHERE OPTRM='" + trm + "' ORDER BY OPCYMD";
		sql = "SELECT a.LTLROC + a.TLROC AS REVENUE, a.LTLSOC + a.TLSOC AS SHIPMENTS, a.LTLWOC + a.TLWOC AS WEIGHT, b.* " + 
		"FROM RV.OPINTMASTF AS b " + 
		"LEFT OUTER JOIN RV.TMRVTH03 AS a ON b.OPCYMD=a.TMCYMD " +
		"WHERE b.OPTRM='ALL' ORDER BY b.OPCYMD DESC";
		filename = 'opintmqry.ALL';
	}else{
		trm = rtrm.toUpperCase();
		//sql = "SELECT * FROM RV.OPINTMASTF WHERE OPTRM='" + trm + "' ORDER BY OPCYMD";
		sql = "SELECT b.*, a.LTLROC + a.TLROC AS REVENUE, a.LTLSOC + a.TLSOC AS SHIPMENTS, a.LTLWOC + a.TLWOC AS WEIGHT " + 
		"FROM RV.OPINTMASTF AS b "+
		"LEFT OUTER JOIN RV.TMRVTH01 AS a ON b.OPCYMD=a.TMCYMD AND b.OPTRM=a.RVTRMA " +
		"WHERE b.OPTRM='" + trm + "' AND a.RVTRMA='" + trm + "' ORDER BY b.OPCYMD DESC";
		filename = 'opintmqry.'+trm;
	}	   
		var dbconn = new db.dbconn();
		dbconn.conn("*LOCAL");
		 
		 var sqlA = new db.dbstmt(dbconn);
		 sqlA.exec(sql, function(rs) {
			sqlA.close();
			if(rs[0] == null){
				res.send(JSON.stringify({'error':'No results found for TRM'}));
			}else{
				res.send(JSON.stringify(rs));
			}
			dbconn.disconn();
      		dbconn.close();	
		});
		
}

module.exports = router;