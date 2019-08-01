if (process.send) {
	console.log = require('./logger').log;
	//console.debug = require('./logger').debug;
	console.error = require('./logger').error;
}
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	// res.setHeader("Access-Control-Allow-Origin", "https://lme4me.com");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access-control-allow-origin, access-control-allow-headers, access-control-allow-methods, Authorization, path");
	res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");

	next();
});
app.engine('pug', require('pug').__express);
app.set('view engine', 'pug');

var serverport = __dirname.toString().indexOf("lmelocal") > -1 ? 8080 : 8081;
if (process.argv[2])
	serverport = process.argv[2];
//Write Log for route hits
var appRoutes = [];
var appCount = [];
var appHit = [];
var appPGMS = [];
var userIP = [];
var userCount = [];
var userNames = [];
var starttime;

app.all('*', function (req, res, next) {
	var tmpurl = req.url.indexOf('?') > -1 ? req.url.substring(0, req.url.indexOf('?')) : req.url;
	var origin = req.get('origin') != undefined ? req.get('origin').toUpperCase().replace('.WWW', '') : '';
	if (req.url.trim() != "/status" && req.method != 'OPTIONS') {
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
			} else {
				console.log("ERR00002 " + req.url + " Remote IP: " + req.connection.remoteAddress.split(':')[3]);
			}
			next();
		} else if (tmpurl != "") {
			//invalid route hit. send error
			var err = "ERR90004 " + tmpurl + " Remote IP: " + req.connection.remoteAddress.split(':')[3];
			console.log(err);
			//possibly put code in to block the IP
			// res.redirect('https://lme4me.com');
			res.end();
			//next(err);
		} else
			next();
	} else
		next();
});
//set routes ************************************************
app.use('/status', function (req, res, next) {
	var rtn = {};
	rtn.starttime = starttime;
	rtn.routes = appRoutes;
	rtn.count = appCount;
	rtn.hit = appHit;
	rtn.name = userNames;
	rtn.ip = userIP;
	rtn.usercount = userCount;
	res.send(JSON.stringify(rtn));
});

//ADMIN
// appuse('/admin/getSysStatus','./routes/admin/getSysStatus');
// appuse('/admin/getSysStatusExt','./routes/admin/getSysStatusExt');
appuse('/admin/tapeHistory', './routes/admin/tapeHistory');
appuse('/admin/RMAInfo', './routes/admin/RMAInfo');
appuse('/admin/getFolderSize', './routes/admin/getFolderSize');

//TEST
//appuse('/test/listUser', users);
appuse('/test', './routes/test');
//appuse('/test/program', program);
appuse('/test/reqconnection', './routes/test/reqconnection');

//Service
appuse('/service/ontimetotal', './routes/service/ontimetotal');
appuse('/service/ontimetotallist', './routes/service/ontimetotalList');
appuse('/service/ontimetotallistDirect', './routes/service/ontimetotalListDirect');
appuse('/service/outboundTotal', './routes/service/outboundTotal');
appuse('/service/serviceTotal', './routes/service/serviceTotal');
appuse('/service/getProTracking', './routes/service/getProTracking');
appuse('/service/dispatchMiles', './routes/service/dispatchMiles');
appuse('/service/tmrvdhqry', './routes/service/tmrvdhqry');
appuse('/service/getManifest', './routes/service/getManifest');
appuse('/service/getHours', './routes/service/getHours');
appuse('/service/publacklist', './routes/service/publacklist');
appuse('/service/lateShipmentsGet', './routes/service/lateShipmentsGet');
appuse('/service/setProInfo', './routes/service/setProInfo');

//IMAGING
appuse('/imaging/getImagingList', './routes/imaging/getImagingList');
appuse('/imaging/getImagingDocument', './routes/imaging/getImagingDocument');


//OPS
appuse('/ops/TRMDashboardOPS', './routes/ops/TRMDashboardOPS');
appuse('/ops/TRMDashboardXDOCK', './routes/ops/TRMDashboardXDOCK');
appuse('/ops/opintmqry', './routes/ops/opintmqry');
appuse('/ops/TRMDashboardDimensioner', './routes/ops/TRMDashboardDimensioner');
appuse('/ops/outship', './routes/ops/outship');
appuse('/ops/inship', './routes/ops/inship');
appuse('/ops/driverhours', './routes/ops/driverhours');
appuse('/ops/getTrailerManifest', './routes/ops/getTrailerManifest');
appuse('/ops/setPunchtime', './routes/ops/setPunchtime');
appuse('/ops/dktnrhistf', './routes/ops/dktnrhistf');
appuse('/ops/TerminalLaborHours', './routes/ops/TerminalLaborHours');

appuse('/ops/pnfilesMileage', './routes/ops/pnfilesMileage');

//City plan
appuse('/cityplan/cityroutes', './routes/cityplan/cityroutes');
appuse('/cityplan/updateRoutes', './routes/cityplan/updateRoutes');
appuse('/cityplan/deletePlan', './routes/cityplan/deletePlan');
appuse('/cityplan/getPlans', './routes/cityplan/getPlans');
appuse('/cityplan/writePlanned', './routes/cityplan/writePlanned');

//3m
appuse('/3m/cs550h', './routes/3m/cs550h');

//POLLS
appuse('/polls/getPolls', './routes/polls/getPolls');
appuse('/polls/writeResult', './routes/polls/writeResult');
appuse('/polls/getResults', './routes/polls/getResults');
appuse('/polls/createPoll', './routes/polls/createPoll');

//Sales
appuse('/sales/salesDailyTotal', './routes/sales/salesDailyTotal');
appuse('/sales/salesMonthlyTotal', './routes/sales/salesMonthlyTotal');
appuse('/sales/JDWSR', './routes/sales/JDWSR');
appuse('/sales/rdwsales', './routes/sales/rdwsalesnew');
appuse('/sales/rdwsalesDetail', './routes/sales/rdwsalesDetail');

//Profile
appuse('/profile/login', './routes/profile/login');
appuse('/profile/chatLogin', './routes/profile/chatLogin');
appuse('/profile/decodeToken', './routes/profile/decodeToken');
var keys = require('./routes/profile/ediSshKeys');


//Documents
appuse('/documents/getfiles', './routes/documents/getfiles');
appuse('/documents/Upload', './routes/documents/Upload');
appuse('/documents/Delete', './routes/documents/Delete');
appuse('/documents/getDocs', './routes/documents/getDocs');

//Claims
appuse('/claims/claimsbyTransaction', './routes/claims/claimbyTransaction');
appuse('/claims/claimsJohnDeere', './routes/claims/claimsJohnDeere');
appuse('/claims/claimsJohnDeereTotals', './routes/claims/claimsJohnDeereTotals');
appuse('/claims/getShipments', './routes/claims/getShipments');

//EDI
appuse('/edi/sFtpStatus', './routes/edi/getSftpStatus');

//Linehaul
appuse('/linehaul/outboundprojection', './routes/linehaul/outboundprojection');
appuse('/linehaul/outboundstatus', './routes/linehaul/outboundstatus');

//WI
appuse('/wi/dockscan', './routes/wi/dockscan');
appuse('/wi/weightscales', './routes/wi/weightscales');
appuse('/wi/dimensioner', './routes/wi/dimensioner');
appuse('/wi/getReweighInfo', './routes/wi/getReweighInfo');
appuse('/wi/getTonnage', './routes/wi/getTonnage');

// appuse('/test/getProTracking', './getProTracking');

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	// render the error page
	res.status(err.status || 500);
	res.render('error.pug');

});

module.exports = app;

var server = app.listen(serverport, function () {

	var host = server.address().address
	var port = server.address().port

	console.log("ERR80001 http://lme.local:" + port);

	var d = new Date();

	starttime = d.toLocaleString("en-us", {
		timeZone: "America/Chicago",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"
	});
	server.setTimeout(600000);
	//server.close();
});

//Close Server on close message received
process.on('SIGINT', function () {
	for (var i = 0; i < appRoutes.length; i++) {
		if (appCount[i] > 0)
			console.log("ERR20001 Route: " + appRoutes[i] + " has been hit " + appCount[i] + " time(s) last use was " + appHit[i]);
	}
	for (var i = 0; i < appRoutes.length; i++) {
		if (appCount[i] == 0)
			console.log("ERR20002 Route: " + appRoutes[i] + " was not hit since server start");
	}
	server.close();
	setTimeout(function () {
		process.exit(0)
	}, 200);
});

process.on('exit', (code) => {
	console.log('process on exit  ' + code);
});

process.on('uncaughtException', function (err) {
	console.log('ERR99999 uncaught' + err);
	// process.exit();
	if (process.send)
		process.send("RESTART");
});

function appuse(loc, pgmloc) {
	var pgm = require(pgmloc);
	appPGMS[appPGMS.length] = pgm;
	appRoutes[appRoutes.length] = loc;
	appCount[appCount.length] = 0;
	appHit[appHit.length] = 0;
	app.use(loc, pgm);
}