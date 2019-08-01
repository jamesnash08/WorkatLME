var db = require('idb-connector');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.pro, req.query.claim, req.query.user, req.query.password);
});
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.pro, req.body.claim, req.body.user, req.body.password);
});
function servResponse(req, res, next, pro, claim, user, password) {
	var dbconn = new db.dbconn();
	dbconn.conn("DPI", "DPIOPS", "CHEX");
	if (claim > "") {
		lookupclaim(dbconn, req, res, claim, pro, user, password);
	} else if (!pro) {
		res.send(JSON.stringify({ "error": "No claim set" }));
	} else if (pro.length == 10) {
		var sql = "SELECT CLAIM# AS CLAIM, CLTYPE, CLYEAR FROM CL.CLPROMASTF WHERE PRO=" + pro;
		// console.log(sql);
		var sqlA = new db.dbstmt(dbconn);
		sqlA.exec(sql, (rs,err) => {
			sqlA.close();
			if (!rs[0] || err) {
				dbconn.disconn();
				dbconn.close();
				console.log("ERR90002 " + err);
				res.send(JSON.stringify({ "error": "Claim not found by PRO" }));
			} else {
				var claimnum = rs[0].CLAIM.toString();
				while (claimnum.length < 5) {
					claimnum = "0" + claimnum;
				}
				claim = rs[0].CLYEAR + "" + rs[0].CLTYPE + "" + claimnum;
				lookupclaim(dbconn, req, res, claim, pro, user, password);
			}
		});
	}
}

function lookupclaim(dbconn, req, res, claim, pro, user, password) {
	var sql = "SELECT c.claim# as claimNumber, c.clyear,c.CLMATN as claimantNumber,prof.pro, clscode.CLIDSC, c.clshpn as shipper, c.clpayn as payor,c.CLCONN as consignee, c.CLPAY# as custnum,	c.CLMDTE as claimDate, c.CLRECD as dateReceived, c.CLBLDD as billDate, c.CLMAMT as amount,c.CLDEST as dest, c.CLORGN as origin, c.CLMANT as claimant, c.CLMATT as claimantatt, c.CLMADD as claimantaddr, c.CLCTY as claimantcty, c.CLSTE as claimantstate, c.CLZIP as claimantzip, c.clsdte as settleDate, c.clsamt as settleAmount, c.clschk as settleCheck, c.clsld2 as settleDate2, c.clsam2 as settleAmount2, c.clsck2 as settleCheck2, c.clddte as declineDate, d.clddsc as declineCode, c.cldamt as declineAmount, c.clappd as approvalDate, c.clappa as approvalAmount, c.clstat as status, cltrn.* " +
		"FROM CL.CLAIMM05 AS c " +
		"left join cl.cldcdm01 as d on c.cldcod = d.cldcod " +
		"left join CL.CLPROMASTF AS prof ON prof.clyear = c.clyear AND prof.claim# = c.claim# " +
		"left join cl.clicdm01 as clscode ON clscode.CLICOD = c.CLCLSS " +
		"left join CL.CLTRNMASTF as cltrn ON cltrn.clyear = c.clyear AND cltrn.claim# = c.claim# " +
		"WHERE c.cltype = 'LD' and c.claim# = " + Number(claim.substring(6)) + " and c.clyear = " + Number(claim.substring(0, 4));
	console.log(sql);
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, (rs,err) => {
		sqlA.close();
		if(!rs || rs == null || rs.length == 0 || rs[0] == null || err){
			dbconn.disconn();
			dbconn.close();
			res.send(JSON.stringify({ "error": "Claim not found" }));
		}else{
		
		rs[0]["CLAIM"] = claim;
		pro = rs[0].PRO;
		var joinsql = "";
		var origin = req.get('origin');
		if (!origin || origin.indexOf("https://lme4me.com") == -1) {
			// console.log(origin);
			joinsql += "AND m.CWPASSWORD='" + password + "' ";
		}
		sql = "SELECT b.PRO, c.CWUSERID FROM BR.BILLSM01 AS b " +
			"INNER JOIN RV.CUSWBD01 AS c ON c.CWUSERID='" + user + "' AND ( c.CMCUST=b.PAYOR OR c.CMCUST=b.SHIP or c.CMCUST=b.CONS )" +
			"INNER JOIN RV.CUSWBM01 AS m ON m.CWUSERID='" + user + "' " + joinsql +
			"WHERE b.PRO=" + pro + " " +
			"UNION ALL " +
			"SELECT f.FBNO AS PRO, c.CWUSERID FROM LIBBIL.FBMASTER AS f " +
			"INNER JOIN RV.CUSWBD01 AS c ON c.CWUSERID='" + user + "' AND ( c.CMCUST=f.BILLTO OR c.CMCUST=f.SHIPER or c.CMCUST=f.CONS )" +
			"INNER JOIN RV.CUSWBM01 AS m ON m.CWUSERID='" + user + "' " + joinsql +
			"WHERE f.FBNO=" + pro;
		if (user.toUpperCase().trim() == "LMETEST") {
			sendResults(res, rs);
		} else {
			console.log(sql);
			var sqlB = new db.dbstmt(dbconn);
			sqlB.exec(sql, function (rs2,err) {
				if (!rs2 || rs2 == null || rs2.length == 0 || rs2[0] == null) {
					res.send(JSON.stringify({"error": "You are not authorized to this Claim"}));
				} else if(!err) {
					sendResults(res, rs);
				}else{
					console.log("ERR90002 " + err);
					console.log(sql);
					res.send(JSON.stringify({"error": "Results not found"}));
				}
			});
		}
	}
	});
}

function sendResults(res, rs) {
	var status = "";
	if(rs[0].STATUS == 'R')
		status = "Reopened"
	else if(rs[0].STATUS == 'O')
		status = "Open"
	else if(rs[0].STATUS == 'C' || rs[0].STATUS == 'X'){
		if(rs[0].DECLINEDATE > 0)
			status = "Closed-Denied"
		else if(rs[0].SETTLEDATE > 0)
			status = "Closed-Paid"
	}
	var result = {
		"CLAIM": rs[0].CLAIM,
		"PRO": rs[0].PRO,
		"CLAIMSTATUS": status,
		"DATERECEIVED": rs[0].DATERECEIVED,
		"CLCLAIM": rs[0].CLAIMANTNUMBER,
		"CLIDSC": rs[0].CLIDSC,
		"approvalDate": rs[0].APPROVALDATE,
		"claimCheckDate": rs[0].SETTLEDATE,
		"SETTLECHECK": rs[0].SETTLECHECK,
		"DECLINEDATE": rs[0].DECLINEDATE,
		"DECLINECODE": rs[0].DECLINECODE,

	};
	res.send(JSON.stringify({ "results": result }));
}

module.exports = router;