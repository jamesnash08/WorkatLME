var xt = require("itoolkit"); //10a 10p0 10z0
var db = require('idb-connector');
var pickupRequest = require('./PickupRequest');

if (typeof Array.isArray === 'undefined') {
	Array.isArray = function (obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	}
};

function requestPickup(cb, args) {
	console.log("requestPickup");
	//console.log(args);
	var payload = {};
	pickupRequest.checkParams(args, payload);
	console.log(payload);
	//pickupRequest.callCSM712();
}

function requestPickup2(cb, args) {
	console.log("requestPickup2");
	console.log(args);
	var payload = {};
	pickupRequest.checkParams(args, payload);
	console.log(payload);
	//pickupRequest.callCSM712();
}


module.exports = {
	requestPickup: requestPickup,
	requestPickup2: requestPickup2
};