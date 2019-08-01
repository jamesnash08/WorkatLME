var express = require('express');
// var Rollbar = require("rollbar");
// var rollbar = new Rollbar({
// 	accessToken: '8bd27c1d5aa54a9c809b6370daa8e364',
// 	captureUncaught: true,
// 	captureUnhandledRejections: true
// });

var app = express();
var bodyParser = require('body-parser');

var appPGMS = [];
var userIP = [];
var userCount = [];
var userNames = [];
var starttime;

// var pricingHit = require('')

//put these in server as well
var appRoutes = [];
var appCount = [];
var appHit = [];

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
	if (!res.headersSent) {
		//res.header("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Origin", "https://lme4me.com");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access-control-allow-origin, access-control-allow-headers, access-control-allow-methods, Authorization, path");
		res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	} else
		console.log("Headers already sent " + res.headersSent);
	next();
});
app.engine('pug', require('pug').__express);
app.set('view engine', 'pug');


app.all('*', function (req, res, next) {
	var tmpurl = req.url.indexOf('?') > -1 ? req.url.substring(0, req.url.indexOf('?')) : req.url;
	var origin = req.get('origin') != undefined ? req.get('origin').toUpperCase().replace('.WWW', '') : '';
	if (req.url.trim() != "/status" && req.url.trim() != "/isup" && req.method != 'OPTIONS') {
		var i = appRoutes.indexOf(tmpurl);
		var ip = req.connection.remoteAddress.split(':')[3];
		var ipindex = userIP.indexOf(ip);
		if (ipindex == -1) {
			var userindex = userIP.length;
			userIP[userindex] = ip;
			userCount[userindex] = 1;
		} else {
			userCount[ipindex] += 1;
		}
		if (req.body.user) {
			userNames[userIP.indexOf(ip)] = req.body.user;
		}
		// console.log("index " + i + " route " + tmpurl);
		if (i > -1) {
			appCount[i]++;
			var d = new Date();
			appHit[i] = d.toLocaleString("en-us", {
				timeZone: "America/Chicago",
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit"
			});
			if (req.connection.remoteAddress.split(':')[3].substring(0, 7) == "192.168" || req.connection.remoteAddress.split(':')[3].substring(0, 6) == "172.20" || req.connection.remoteAddress.split(':')[3].substring(0, 6) == "172.21" || req.connection.remoteAddress.split(':')[3].substring(0, 7) == "10.70.3") {
				console.log("ERR00001 " + req.url + " Remote IP: " + req.connection.remoteAddress.split(':')[3]);
			} else if (origin.indexOf("HTTPS://LME4ME.COM") == -1) {
				console.log("ERR00003 " + req.url + " Remote IP: " + req.connection.remoteAddress.split(':')[3]);
			} else {
				console.log("ERR00002 " + req.url + " Remote IP: " + req.connection.remoteAddress.split(':')[3]);
			}
			next();
		} else if (tmpurl != "" && tmpurl.indexOf("wsdl") == -1) {
			//invalid route hit. send error
			//var err = "ERR90003 " + tmpurl + " Remote IP: " + req.connection.remoteAddress.split(':')[3];
			//console.log(err);
			//possibly put code in to block the IP
			res.redirect('https://lme4me.com');
			res.end();
			//next(err);
		}
		// else if(tmpurl.indexOf("wsdl/tracking") > -1 && tmpurl.indexOf("?wsdl") == -1){
		// 	res.redirect('https://lme4me.com:8081/wsdl/tracking?wsdl');
		// 	next();
		// }
		else
			next();
	} else
		next();
});
//set routes ************************************************

app.use('/isup', function (req, res, next) {
	res.send(JSON.stringify({
		"online": true
	}));
});

// app.use('/status', function (req, res, next) {
// 	var rtn = {};
// 	// rtn.starttime = starttime;
// 	rtn.routes = appRoutes;
// 	rtn.count = appCount;
// 	rtn.hit = appHit;
// 	rtn.name = userNames;
// 	rtn.ip = userIP;
// 	rtn.usercount = userCount;
// 	res.send(JSON.stringify(rtn));
// });
//console.log("");
function setRoutes() {
	//Claims
	appuse('/claim/getClaimInfo', __dirname + '/routes/claim/getClaimInfo');

	//Profile
	appuse('/profile/login', __dirname + '/routes/profile/login');
	appuse('/profile/decodeToken', __dirname + '/routes/profile/decodeToken');
	var keys = require(__dirname + '/routes/profile/ediSshKeys');

	//Tracking
	appuse('/tracking/getShipmentTracking', __dirname + '/routes/tracking/getShipmentTracking');
	appuse('/tracking/getProTracking', __dirname + '/routes/tracking/getProTracking');
	appuse('/tracking/setProNotify', __dirname + '/routes/tracking/setProNotify');

	//Transit
	appuse('/transit/getZipLookup', __dirname + '/routes/transit/getZipLookup');
	appuse('/transit/getTransitTime', __dirname + '/routes/transit/getTransitTime');
	appuse('/transit/getTransitDays', __dirname + '/routes/transit/getTransitDays');

	//summary
	appuse('/summary/getSummary', __dirname + '/routes/summary/getSummary');

	//imaging
	appuse('/imaging/getImagingList', __dirname + '/routes/imaging/getImagingList');
	appuse('/imaging/getImagingDocument', __dirname + '/routes/imaging/getImagingDocument');
	appuse('/imaging/getImagingPDF', __dirname + '/routes/imaging/getImagingPDF');

	//pickup
	appuse('/pickup/lookup', __dirname + '/routes/pickup/locationLookup');
	appuse('/pickup/checkZip', __dirname + '/routes/pickup/checkZip');
	appuse('/pickup/submit', __dirname + '/routes/pickup/pickupSubmit');
	appuse('/pickup/request', __dirname + '/routes/pickup/pickupRestInterface');

	//rate
	appuse('/rate/rateDownloader', __dirname + '/routes/rate/rateDownloader');
}
//wsdl
//appuseWSDL('/wsdl/pricing?wsdl');
//appuseWSDL('/wsdl/pickup?wsdl');
//appuseWSDL('/wsdl/tracking?wsdl');



function appuse(loc, pgmloc) {
	var pgm = require(pgmloc);
	appPGMS[appPGMS.length] = pgm;
	appRoutes[appRoutes.length] = loc;
	appCount[appCount.length] = 0;
	appHit[appHit.length] = 0;
	app.use(loc, pgm);
}

function appuseWSDL(loc) {
	appRoutes[appRoutes.length] = loc;
	appCount[appCount.length] = 0;
	appHit[appHit.length] = 0;
}


module.exports = {
	app: app,
	setRoutes: setRoutes,
	routes: appRoutes,
	count: appCount,
	hit: appHit,
	userNames: userNames,
	userIP: userIP,
	userCount: userCount
};