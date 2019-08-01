var db = require('idb-connector');
var fs = require('fs');

var trm = process.argv[2];
if(trm > ""){
	servResponse();

var allzips = fs.readFileSync('allzips.json', 'utf8');
var directzips = fs.readFileSync('zips'+trm.toUpperCase()+'.json', 'utf8');

allzips = JSON.parse(allzips);
directzips = JSON.parse(directzips);

finalzips = [];
unfoundzips = [];

for(var i = 0; i < allzips.length;i++){
	var row	= getRecord(allzips[i].ZIP);
	if(row[0]){
	finalzips[finalzips.length] = {
		zip:row[0].PTZIP,
		geometry:allzips[i].geometry,
		LNSTND:row[0].LNSTND
	};
	}else{//we don't have info on it
		finalzips[finalzips.length] = {
			zip:allzips[i].ZIP,
			geometry:allzips[i].geometry,
			LNSTND:99
		};
		// unfoundzips[unfoundzips.length] = {
		// 	zip:allzips[i].ZIP
		// };
	}

	fs.writeFile('fzips' + trm.toUpperCase() + '.json', JSON.stringify(finalzips), function (err) {
		if (err) return console.log(err);
	});
	// fs.writeFile("unfoundzips.json",JSON.stringify(unfoundzips) ,function (err) {
	// 	if (err) return console.log(err);
	// });
}

function servResponse() {
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sql;
	sql = "SELECT DISTINCT p.PTZIP, l.LNSTND " +
	"FROM SY.POINTM01 as p " +
	"JOIN SY.LANESM01 as l ON p.PTTRMA=l.LNDPTA " +
	"WHERE l.LNOPTA ='" + trm + "' AND p.PTILSCAC ='    ' AND p.PTEXPDATE=9999999 " +
	"ORDER BY p.PTZIP ";
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function (rs,err) {
		sqlA.close();
		sql = "SELECT DISTINCT p.PTZIP, l.LNSTND " +
		"FROM SY.POINTM01 as p " +
		"JOIN SY.LANESM01 as l ON p.PTILTRMA=l.LNDPTA " +
		"WHERE l.LNOPTA ='" + trm + "' AND p.PTILSCAC !='    ' AND p.PTEXPDATE=9999999 AND p.PTCOUNTRY='US' " +
		"ORDER BY p.PTZIP ";
		var sqlB = new db.dbstmt(dbconn);
		sqlB.exec(sql, function (rs2,err) {
			sqlB.close();
			
			dbconn.disconn();
			dbconn.close();
			var results = rs.concat(rs2);

			fs.writeFile('zips'+trm.toUpperCase()+'.json',JSON.stringify(results) ,function (err) {
				if (err) return console.log(err);
			});

		});
	});
}

function getRecord(zip){
	return directzips.filter(data => data.PTZIP == zip);
}

