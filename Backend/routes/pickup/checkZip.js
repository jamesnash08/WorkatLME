// Definitions
let express = require('express');
let router = express.Router();
let db = require('idb-connector');
let xt = require("itoolkit");
let dbconn;
let conn;

// Define Routes for Get and Post
router.get('/', function (req, res, next) {
	//console.debug(req.query);
	servResponse(req, res, next, req.query);
});

router.post('/', function (req, res, next) {
	//console.debug(req.query);
	servResponse(req, res, next, req.body);
});

// This is a API function to lookup cities via zipcode
// passsing zipcode returns array of cities
//
function servResponse(req, res, next, data) {

	let payload = {};

	let stages = [1, 2].reduce((promiseChain, item) => {
			return promiseChain.then(() => new Promise((resolve, reject) => {
				asyncFunction(item, req, res, next, data, payload, resolve, reject);
			}));
		},
		Promise.resolve());

	stages.then(() => {
		console.log('ZipLookup Completed!!');
		//console.log(payload);
		res.send(JSON.stringify(payload));
	}).catch((fail) => {
		console.log("ZipLookup Failed!!");
		//console.log(payload);
		res.send(JSON.stringify(payload));
	});

}

function asyncFunction(item, req, res, next, data, payload, cb, fail) {

	console.debug("--------------------------------------------");
	console.debug("Checking Origin zipcode: " + data.zip);
	console.debug("Checking Destination zipcodes: " + data.destZip);
	console.debug("--------------------------------------------");

	switch (item) {
		case 1:
			// Check Orgin Zip
			getOrigZip(data.zip, payload, cb, fail);
			break;
		case 2:
			// Check Dest Zips
			if (data.destZip != undefined) {
				getDestZips(data.destZip, payload, cb, fail);
			} else {
				cb();
			}
			break;
	}

}

function getDestZips(data, payload, cb, fail) {

	// Define DB connections
	dbconn = new db.dbconn();
	dbconn.conn("DPI", "DPIOPS", "CHEX");
	conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

	console.debug("getDestZips: " + data);

	let destZips = "";

	if (data != undefined) {
		destZips = JSON.parse(data);
	} else {
		console.log("ERR90001: Missing Destination ZipCode Paramater");
		payload.Error = "ERR90001: Missing Destination ZipCode Paramater";
		fail();
	}

	console.debug("Parsed: " + destZips);

	if (destZips != undefined && destZips.length > 0) {

		let todayFormatted = "1190209";

		let destQuery = "SELECT DISTINCT a.PTZIP, a.PTSTATE, " +
			"(SELECT PTCITY FROM SY.POINTM03 AS p " +
			"WHERE a.PTEFFDATE <= " + todayFormatted +
			" AND a.PTEXPDATE > " + todayFormatted +
			" AND p.PTZIP = a.PTZIP LIMIT 1) AS PTCITY " +
			"FROM SY.POINTM01 AS a " +
			"WHERE a.PTZIP IN (";

		for (var zipId = 0; zipId < destZips.length; zipId++) {
			console.debug("Zip: " + destZips[zipId]);
			if (zipId > 0) {
				destQuery += ",";
			}

			destQuery += "'" + destZips[zipId] + "' ";

		}

		destQuery = destQuery + " ) AND a.PTEFFDATE <= " + todayFormatted +
			" AND a.PTEXPDATE > " + todayFormatted;

		console.debug(destQuery);

		console.time('DestZip');

		let sqlDestHandle = new db.dbstmt(dbconn);

		sqlDestHandle.exec(destQuery, function (rs, err) {
			delete sqlDestHandle;
			console.timeEnd('DestZip');
			console.debug("--------------------------------------------");
			if (err) {
				console.log("ERR90002 " + err.toString());
				payload.Error = "ERR90002 " + err.toString();
				fail();
			} else {

				//console.debug(rs);
				if (destZips.length == rs.length) {
					payload.Destination = JSON.stringify(rs);
				} else {

					console.log(JSON.stringify(rs));

					var currentZips = new Set();
					var activeZips = new Set();

					rs.forEach(function (dest) {
						//console.debug("Results: " + parseInt(dest.PTZIP));
						activeZips.add(parseInt(dest.PTZIP));
					});

					destZips.forEach(function (dest) {
						//console.debug(dest);
						if (!activeZips.has(dest)) {
							currentZips.add(dest);
						}
					});

					payload.InvalidZips = Array.from(currentZips);

					console.log("ERR90003: One of the Destination ZipCodes is invalid");
					payload.Error = "ERR90003: One of the Destination following ZipCodes is invalid " + payload.InvalidZips;
					fail();
				}
				cb();

			}

		});

	} else {
		console.log("ERR90004: Missing Destination ZipCode");
		payload.Error = "ERR90004: Missing Destination ZipCode";
		fail();
	}

}


function getOrigZip(data, payload, cb, fail) {

	// Define DB connections
	dbconn = new db.dbconn();
	dbconn.conn("DPI", "DPIOPS", "CHEX");
	conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

	console.debug("getOrigZip: " + data);
	if (data != undefined) {

		let origQuery = "SELECT DISTINCT PTCITY, PTSTATE, PTZIP FROM SY.POINTJ30 " +
			"WHERE PTZIP = '" + data + "'" +
			" ORDER BY PTCITY";

		console.debug(origQuery);

		// Define DB connections
		dbconn = new db.dbconn();
		dbconn.conn("DPI", "DPIOPS", "CHEX");
		conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

		console.time('OrigZip');

		let sqlOrigHandle = new db.dbstmt(dbconn);

		sqlOrigHandle.exec(origQuery, function (rs, err) {
			delete sqlOrigHandle;
			console.timeEnd('OrigZip');
			console.debug("--------------------------------------------");
			if (err) {
				console.log("ERR90005 " + err.toString());
				payload.Error = "ERR90005 " + err.toString();
				fail();
			} else {
				//console.debug(rs);
				payload.Origin = JSON.stringify(rs);
				cb();
			}

		});

	} else {
		console.log("ERR90006: Missing Origination ZipCode");
		payload.Error = "ERR90006: Missing Origination ZipCode";
		fail();
	}

}

module.exports = router;