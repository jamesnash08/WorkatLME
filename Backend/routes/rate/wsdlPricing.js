var xt = require("itoolkit"); //10a 10p0 10z0
var db = require('idb-connector');
var pricingPGMS = require('./RatePGM');

if (typeof Array.isArray === 'undefined') {
    Array.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
};

function getCustomerRate(cb, args) {
    console.log("getCustomerRate");
    console.log(args);
    var payload = {};

    var totalWeight = 0;

    payload.data = args;

    ratePGM.callBRM751(conn, results, payload, cb, fail);

    //ratePGM.callBRM730( conn, results, payload, cb, fail);
    //ratePGM.callBRM732( conn, results, payload, cb, fail);
    //ratePGM.callBRM731( conn, results, payload, cb, fail);

    //pricingPGMS.checkParams(args, payload);
    console.log(payload);
    //pickupRequest.callCSM712();
}


module.exports = {
    getCustomerRate: getCustomerRate,
};