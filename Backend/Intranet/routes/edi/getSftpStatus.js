var express = require('express');
var router = express.Router();
var fs = require('fs');
//const async = require("async");
//const path = require("path");


router.get('/', function (req, res, next) {
	console.log(req);
	servResponse(req, res, next);
});

router.post('/', function (req, res, next) {
	console.log(req);
	servResponse(req, res, next);
});

function servResponse(req, res, next) {

	console.log("Hit");
	var path = "/EDI_FTP/Logs/*.audit";

	var spawn = require('child_process').spawn;

	//cat = spawn('cat *.audit',["file1.avi", "file2.avi"]);
	cat = spawn('cat', [path]);
	cat.stdout.on("data", function (data) {
		console.log("StdOut " + data);
	});

	cat.stderr.on('data', (data) => {
		console.log("StdErr " + data);
	});

	cat.on('error', (err) => {
		console.log('Failed to start subprocess.');
	});

}

module.exports = router;