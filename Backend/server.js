var logger = require(__dirname + "/logger");
console.log = logger.log;
console.error = logger.error;
logger.setServerName('server');

var express = require('express');
var appjs = require(__dirname + '/app');
var app = appjs['app'];

var https = require('https');
var http = require('http');
var fs = require('fs');
var soap = require('soap');
const soapService = require('./soService');

var serverport = __dirname.toString().indexOf("lmenew") > -1 ? 60006 :
	__dirname.toString().indexOf("lmetest") > -1 ? 8080 :
	__dirname.toString().indexOf("LMEAPI") > -1 ? 8081 :
	8082;

if (process.argv[2])
	serverport = process.argv[2];
//Write Log for route hits

var appRoutes = appjs['routes'];
var appCount = appjs['count'];
var appHit = appjs['hit'];
var userNames = appjs['userNames'];
var userCount = appjs['userCount'];
var userIP = appjs['userIP'];

module.exports = app;
var httpsServer = https.createServer({
	cert: fs.readFileSync('cert/new/LME4ME.COM.crt'),
	key: fs.readFileSync('cert/privateKey.key')
}, app).listen(serverport, function () {
	//soap.listen(httpsServer, '/wsdl/tracking', soapService.trackingService, soapService.trackingXML);
	//soap.listen(httpsServer, '/wsdl/pickup', soapService.pickupService, soapService.pickupXML);
	//soap.listen(httpsServer, '/wsdl/pickup2', soapService.pickupService, soapService.pickup2XML);
	//soap.listen(httpsServer, '/wsdl/pricing', soapService.pricingService, soapService.pricingXML);

	var host = httpsServer.address().address
	var port = httpsServer.address().port

	console.log("ERR80001 https://lme4me.com:" + port);
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
});

var wsdlOptions = {
	path: ''
}
// var httpServer;
// if (process.send)
// 	httpServer = http.createServer(app).listen(__dirname.toString().indexOf("lmenew") > -1 ? 80 : 81, '192.168.3.12', function () {
// 		soap.listen(httpServer, '/wsdl/tracking', soapService.trackingService, soapService.trackingXML);
// 		soap.listen(httpServer, '/wsdl/pickup', soapService.pickupService, soapService.pickupXML);
// 		soap.listen(httpServer, '/wsdl/pickup2', soapService.pickupService, soapService.pickup2XML);
// 		//soap.listen(httpServer, '/wsdl/pricing', soapService.pricingService, soapService.pricingXML);
// 		soap.listen(httpServer, {
// 			path: '/wsdl/pricing',
// 			services: soapService.pricingService,
// 			xml: soapService.pricingXML,
// 			// "overrideRootElement": {
// 			// 	"envelopeKey": "soapenv",
// 			// 	"namespace": "p548",
// 			// 	"xmlnsAttributes": [{
// 			// 		"name": "p548:soapenv",
// 			// 		"value": "http://webservice.lme.com"
// 			// 	}]
// 			// }
// 		});
// 		var host = httpServer.address().address
// 		var port = httpServer.address().port

// 		console.log("ERR80001 http://lme4me.com:" + port);
// 	});

// var server = app.listen(serverport, function () {
appjs.setRoutes();
app.use('/status', function (req, res, next) {
	console.log(JSON.stringify(soapService.pricingHit));
	var rtn = {};
	rtn.PricingHit = soapService.pricingHit;
	rtn.starttime = starttime;
	rtn.routes = appRoutes;
	rtn.count = appCount;
	rtn.hit = appHit;
	rtn.name = userNames;
	rtn.ip = userIP;
	rtn.usercount = userCount;
	res.send(JSON.stringify(rtn));
});

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


//Close Server on close message received
process.on('SIGINT', function () {
	console.log("ERR20001 Route: Pricing getCustomerRate has been hit " + soapService.pricingHit.Rate + " time(s)");
	console.log("ERR20001 Route: Pricing getCustomerRateStatic has been hit " + soapService.pricingHit.Static + " time(s)");
	console.log("ERR20001 Route: Pricing getCustomerRateByQuoteNumber has been hit " + soapService.pricingHit.Lookup + " time(s)");
	for (var i = 0; i < appRoutes.length; i++) {
		if (appCount[i] > 0)
			console.log("ERR20001 Route: " + appRoutes[i] + " has been hit " + appCount[i] + " time(s) last use was " + appHit[i]);
	}
	httpsServer.close();
	// if (httpServer)
	// 	httpServer.close();
	setTimeout(function () {
		process.exit(0)
	}, 200);
});

process.on('exit', function (code) {
	console.log('process on exit  ' + code);
});

process.on('uncaughtException', function (err) {
	console.log('ERR99999 ' + err);
	// process.exit();
	if (process.send)
		process.send("RESTART");
});