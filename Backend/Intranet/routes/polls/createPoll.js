const db = require('idb-connector');
var express = require('express');
var router = express.Router();
var version = 1.0;

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.poll);
}); //fdjkfdkj
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.poll);
});
function servResponse(req, res, next, poll) {
	var sql = "SELECT MAX(POLLID) AS POLLID FROM SY.POLLSMASTF";
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");

	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs, err) {
		sqlA.close();
		if (err) {
			dbconn.disconn();
			dbconn.close();
			console.log("ERR90002 " + err);
			console.log("ERR90002 " + sql);
			res.send(JSON.stringify({ 'error': 'error finding poll ID/Try again' }));
		} else {
			var pollid = Number(rs[0].POLLID) + 1;
			console.log(pollid);
			var sql = "INSERT INTO SY.POLLSMASTF (POLLID,NAME,DESC,CREATOR,CDATE,EDATE) " +
			"VALUES("+pollid+",'"+poll.NAME+"','"+poll.DESC+"','"+poll.CREATOR+"',"+poll.CDATE+","+poll.EDATE+")";
			var sqlB = new db.dbstmt(dbconn);
			sqlB.exec(sql, function (rs2, err) {
				sqlB.close();
				if (err) {
					dbconn.disconn();
					dbconn.close();
					console.log("ERR90002 " + err);
					console.log("ERR90002 " + sql);
					res.send(JSON.stringify({ 'error': 'Records could not be written' }));
				} else {
					for(let i=0;i<poll.Q.length;i++){
						let j = i+1;
						var q = poll.Q[i];
						let sqlfor = "INSERT INTO SY.POLLSDETLF (POLLID,SEQ,TITLE,DESC,TYPE,C1,C2,C3,C4,C5) " +
						"VALUES("+pollid+","+j+",'"+q.TITLE+"','"+q.DESC+"','"+q.TYPE+"','"+q.C1+"','"+q.C2+"','"+q.C3+"','"+q.C4+"','"+q.C5+"')";
						let statement = new db.dbstmt(dbconn);
						statement.exec(sqlfor, function (rs, err) {
							statement.close();
							if(err){
								console.log("ERR90002 " + err);
								console.log("ERR90002 " + sql);
							}
							if(i==poll.Q.length-1){
								dbconn.disconn();
								dbconn.close();
								res.send(JSON.stringify({'success': 'Poll has been written','poll':pollid}));
							}
						});
					}
				}
			});
		}
	});

}

function get2Digit(val) {
    if (val.toString().length == 1)
        return "0" + val.toString();
    else
        return val.toString();
}

module.exports = router;