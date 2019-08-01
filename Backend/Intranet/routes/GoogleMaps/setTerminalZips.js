const db = require('idb-connector');
var fs = require('fs');

//var trm = process.argv[2];
//if(trm > ""){
var terminals = fs.readFileSync('TRMWEBQRY-Geo.json', 'utf8');
terminals = JSON.parse(terminals);

for(var terminal in terminals){
servResponse(terminal);
}
//}
function servResponse (trm) {
	var dbconn = new db.dbconn();
	dbconn.conn("*LOCAL");
	var sql;	
	sql = "SELECT DISTINCT p.PTZIP, l.LNSTND + p.PDAYS AS LNSTND, p.PTTRMA AS TRM " +
	"FROM SY.POINTM01 as p " +
	"JOIN SY.LANESM01 as l ON p.PTTRMA=l.LNDPTA " +
	"JOIN SY.PNTADM01 as a ON p.PTZIP=a.SZIP " +
	"WHERE l.LNOPTA ='" + trm.toUpperCase() + "' AND p.PTILSCAC ='    ' AND p.PTEXPDATE=9999999 " +
	"ORDER BY p.PTZIP ";
	var sqlA = new db.dbstmt(dbconn);
	sqlA.exec(sql, function(rs) {
		sqlA.close();
		sql = "SELECT DISTINCT p.PTZIP, l.LNSTND + p.PDAYS AS LNSTND, p.PTILTRMA AS TRM " +
		"FROM SY.POINTM01 as p " +
		"JOIN SY.LANESM01 as l ON p.PTILTRMA=l.LNDPTA " +
		"JOIN SY.PNTADM01 as a ON p.PTZIP=a.SZIP " +
		"WHERE l.LNOPTA ='" + trm.toUpperCase() + "' AND p.PTILSCAC !='    ' AND p.PTEXPDATE=9999999 AND p.PTCOUNTRY='US' " +
		"ORDER BY p.PTZIP ";
		var sqlB = new db.dbstmt(dbconn);
		sqlB.exec(sql, function(rs2) {
			sqlB.close();
				
			var results = rs.concat(rs2);
			//console.log(results);

			// fs.writeFile('zips'+trm.toUpperCase()+'.json',JSON.stringify(results) ,function (err) {
			// 	if (err) return console.log(err);
			// });
			setFinal(trm,results);
		});
	});
}


var allzips;
var directzips;

function setFinal(trm,directzips){
allzips = fs.readFileSync('allzips.json', 'utf8');
allzips = JSON.parse(allzips);


var sortedZips = {};
for(var i = 0; i < allzips.length;i++){
	sortedZips[Number(allzips[i].ZIP)] = allzips[i];
}
//directzips = JSON.parse(directzips);

finalzips = [];
unfoundzips = [];

for(var i = 0; i < directzips.length;i++){

	var row	= directzips[i];
	if(sortedZips[Number(row.PTZIP)]){
	finalzips[finalzips.length] = {
		zip:row.PTZIP,
		trm:row.TRM,
		geometry: sortedZips[Number(row.PTZIP)].geometry,
		LNSTND:row.LNSTND
	};
}
}

fs.writeFile('fzips'+trm.toUpperCase()+'.json',JSON.stringify(finalzips) ,function (err) {
	if (err) return console.log(err);
});
}