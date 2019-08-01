var fs = require('fs');

var masterZipfile = 'allzips.json';
var masterAppZipfile = 'zipsAPP.json';
var terminal = masterAppZipfile.substr(4,3);
var terminalKMLFile = terminal + "-zips.kml";

var kmlHeader = "<?xml version=\"1.0\" encoding=\"UTF - 8\"?>\n" + 
                "<kml xmlns=\"http://www.opengis.net/kml/2.2\">\n" +
                "<Document>\n" + 
                "<name>LME - Terminal -" + terminal +"</name>\n" +
                "<Description>Terminal Map Showing Transit time Ranges</Description>\n" +
                "";

var kmlFooter = "</Document>\n</kml>\n";

var allzips = fs.readFileSync(masterZipfile, 'utf8');
var directzips = fs.readFileSync(masterAppZipfile, 'utf8');

finalzips = [];

allzips = JSON.parse(allzips);
directzips = JSON.parse(directzips);

for(var i = 0; i < directzips.length;i++){
    console.log(directzips[i].PTZIP);
    finalzips[i] = getRecord(directzips[i].PTZIP);
    //console.log(finalzips);
}

var zip = 0;
var kmlPayload = "";

for(var x = 0;x <= finalzips.length;x++) {
    kmlPayload += "<Placemark>\n" +
                "<name>" + zip + "</name>\n" +
                "<LineString>\n" +
                "  <extrude>1</extrude>" +
                "  <tessellate>1</tssellate>" +
                "  <altiudeMode>absolute</altitudeMode>" +
                "<coordinates>\n" +
                finalzips[x].geometry +  
                "</coordinates>" +
                "</Placemark>";
}

var kmlFile = kmlHeader + kmlPayload + kmlFooter;

fs.writeFile(terminalKMLFile, kmlFile, function (err) {
	if (err) return console.log(err);
});


function getRecord(zip) {
    if (zip.substring(0, 1) == "0")
        zip = zip.substring(1, 5);
    return allzips.filter(data => data.ZIP == zip);
}