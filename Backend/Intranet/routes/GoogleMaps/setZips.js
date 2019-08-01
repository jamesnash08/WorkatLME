var fs = require('fs');
var trm = process.argv[2];
if(trm > ""){
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
}

fs.writeFile('fzips'+trm.toUpperCase()+'.json',JSON.stringify(finalzips) ,function (err) {
	if (err) return console.log(err);
});
// fs.writeFile("unfoundzips.json",JSON.stringify(unfoundzips) ,function (err) {
// 	if (err) return console.log(err);
// });


function getRecord(zip){
	return directzips.filter(data => data.PTZIP == zip);
}
}