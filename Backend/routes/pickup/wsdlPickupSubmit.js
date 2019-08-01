var db = require('idb-connector');
var xt = require("itoolkit"); //10a 10p0 10z0

var pickupRequest = require('./PickupRequest');

// if (typeof Array.isArray === 'undefined') {
// 	Array.isArray = function (obj) {
// 		return Object.prototype.toString.call(obj) === '[object Array]';
// 	}
// };

function requestPickup(args, cb) {
	console.log("requestPickup");
	//console.log(args);
	var payload = {};
	pickupRequest.checkParams(args, payload, cb);
	console.log("After Check");
	console.log(payload);
}

module.exports = {
	requestPickup: requestPickup
};