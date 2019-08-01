let express = require('express');
var app = express();
let router = express.Router();
let db = require('idb-connector');
let xt = require('itoolkit');
let pickupRequest = require('./PickupRequest');

let payload;

// Define post and get
router.get('/', function (req, res, next) {
    //console.debug(req.query);
    servResponse(req, res, next, req.query);
});

router.post('/', function (req, res, next) {
    //console.debug(req.body);
    servResponse(req, res, next, req.body);
});

function submitPickup(req, res, next, data) {

    var dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");
    var conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

    payload = {};

    payload.PickupRequest = {
        "specialInstructions": null,
        "phone": null,
        "requestorLine": null,
        "insidepickup": null,
        "shipCity": null,
        "shipZip": null,
        "pickTime": null,
        "closeAMPM": null,
        "thirdPartyPayor": null,
        "customerNum": null,
        "topMessage": null,
        "oversize": null,
        "r_message": null,
        "submitDate": null,
        "privaterespickup": null,
        "requestorAreaCode": null,
        "shipState": null,
        "pickNum": null,
        "poison": null,
        "requestorContact": null,
        "limitedaccpickup": null,
        "shipCompany": null,
        "closeTime": null,
        "requestorPrefix": null,
        "food": null,
        "pickAMPM": null,
        "shipContact": null,
        "shipAddress": null,
        "liftgaterequired": null,
        "paymentTerms": null,
        "pickDate": null,
        "units": [],
        "unitType": [],
        "weight": [],
        "loadNum": [],
        "consigneeName": [],
        "destCity": [],
        "destState": [],
        "destZip": [],
        "destZip": [],
        "hazMat": ['N'],
        "freezable": ['N'],
        "xgold": ['N']
    };

    let stages = [1, 2, 3, 4, 5, 6, 7, 8].reduce((promiseChain, item) => {
            return promiseChain.then(() => new Promise((resolve, reject) => {
                asyncFunction(item, req, res, next, data, payload, resolve, reject);
            }));
        },
        Promise.resolve());

    stages.then(() => {
        dbconn.disconn();
        dbconn.close();
        conn.close();
        console.log('Pickup Completed!!');
        //console.log(payload);
        res.send(JSON.stringify(payload));
    }).catch((fail) => {
        dbconn.disconn();
        dbconn.close();
        conn.close();
        console.log("Pickup Failed!!");
        //console.log(payload);
        res.send(JSON.stringify(payload));
    });

}

function asyncFunction(item, req, res, next, results, payload, cb, fail) {

    console.log(item + " running async Call!!");

    switch (item) {
        case 1:

            // 24 Fields for request
            if (results.customerNumber == undefined || results.customerNumber <= 0) {
                payload.Error = "Please provide a customer number!";
                fail();
                break;
            }

            if (results.paymentTerms == undefined) {
                payload.Error = "Please provide a Payment Terms!";
                fail();
                break;
            } else if (results.paymentTerms != null) {

                if (results.paymentTerms == 'T') {
                    if (results.thirdPartyPayor == undefined) {
                        payload.Error = "Missing Third Party Payor!";
                        fail();
                        break;
                    }

                } else if (results.paymentTerms != 'P' && results.paymentTerms != 'C' && results.paymentTerms != 'T') {
                    payload.Error = "Please provide a Valid Payment Type P T or C!";
                    fail();
                    break;
                }

            }

            if (results.shipPhone == undefined || results.shipPhone.length < 10) {
                payload.Error = "Please provide a Shipper Phone Number!";
                fail();
                break;
            }

            if (results.shipCompany == undefined || results.shipCompany.length < 1) {
                payload.Error = "Please provide a Shipper Company Name!";
                fail();
                break;
            }

            if (results.shipContact == undefined || results.shipContact.length < 2) {
                payload.Error = "Please provide a Shipper Contact!";
                fail();
                break;
            }

            if (results.shipAddress == undefined || !results.shipAddress.length > 2) {
                payload.Error = "Please provide a Shipper Address!";
                fail();
                break;
            }

            if (results.shipCity == undefined || !results.shipCity.length > 2) {
                payload.Error = "Please provide a Shipper City!";
                fail();
                break;
            }

            if (results.shipState == undefined || !results.shipState.length > 2) {
                payload.Error = "Please provide a Shipper State!";
                fail();
                break;
            }

            if (results.shipZip == undefined || !results.shipZip.length >= 8) {
                payload.Error = "Please provide a Shipper Zip!";
                fail();
                break;
            }

            if (results.shipEmail == undefined || !results.shipEmail.length > 3) {
                payload.Error = "Please provide a Shipper Email!";
                fail();
                break;
            }

            if (results.pickupDate == undefined || !results.pickupDate.length > 10) {
                payload.Error = "Please provide a Pickup Date!";
                fail();
                break;
            }

            if (results.originPickupTime == undefined || results.originPickupTime.length < 4) {
                payload.Error = "Please provide a Pickup Time!";
                fail();
                break;
            }

            if (results.destCloseTime == undefined || results.destCloseTime.length < 4) {
                payload.Error = "Please provide a Destination Close Time!";
                fail();
                break;
            }

            if (results.requestorName == undefined || results.requestorName.length < 2) {
                payload.Error = "Please provide a Requestor Name!";
                fail();
                break;
            }

            if (results.requestorPhone == undefined || results.requestorPhone.length < 10) {
                payload.Error = "Please provide a Requestor Phone Number!";
                fail();
                break;
            }

            if (results.food == undefined || ((!results.food == true) && (!results.food == false))) {
                payload.Error = "Please provide a true/false for Food!";
                fail();
                break;
            }

            if (results.posion == undefined || ((!results.posion == true) && (!results.posion == false))) {
                payload.Error = "Please provide a true/false for Posion!";
                fail();
                break;
            }

            if (results.oversize == undefined || ((!results.oversize == true) && (!results.oversize == false))) {
                payload.Error = "Please provide a true/false for Oversize!";
                fail();
                break;
            }

            if (results.insidePickup == undefined || ((!results.insidePickup == true) && (!results.insidePickup == false))) {
                payload.Error = "Please provide a true/false for Inside Pickup!";
                fail();
                break;
            }

            if (results.limitedAccessPickup == undefined || ((!results.limitedAccessPickup == true) && (!results.limitedAccessPickup == false))) {
                payload.Error = "Please provide a true/false for Limited Access Pickup!";
                fail();
                break;
            }

            if ((results.privateResidencePickup == undefined) || ((!results.privateResidencePickup == true) && (!results.privateResidencePickup == false))) {
                payload.Error = "Please provide a true/false for Private Residence Pickup!";
                fail();
                break;
            }

            if ((results.liftGateRequired == undefined) || ((!results.liftGateRequired == true) && (!results.liftGateRequired == false))) {
                payload.Error = "Please provide a true/false for Lift Gate Required!";
                fail();
                break;
            }

            let commodities;

            if (results.commodities == undefined) {
                payload.Error = "Please provide Commodities!";
                fail();
                break;
            } else {
                commodities = JSON.parse(results.commodities);

                if (commodities.consignedName == undefined) {

                } else if (commodities.destZipCode == undefined) {

                    if (commodities.destZipCode.length > 2) {
                        payload.Error = "Please provide Destination Zip Code!";
                        fail();
                        break;
                    }

                } else if (commodities.destCity == undefined) {

                    if (commodities.destCity.length > 2) {
                        payload.Error = "Please provide Destination City!";
                        fail();
                        break;
                    }

                } else if (commodities.destState == undefined) {

                    if (commodities.destState.length > 2) {
                        payload.Error = "Please provide Destination State!";
                        fail();
                        break;
                    }

                } else if (commodities.loadNumber == undefined) {

                    if (commodities.loadNumber.length > 2) {
                        payload.Error = "Please provide Destination Load Number!";
                        fail();
                        break;
                    }

                } else if (commodities.units == undefined) {

                    if (commodities.units.length > 2) {
                        payload.Error = "Please provide Destination Units!";
                        fail();
                        break;
                    }

                } else if (commodities.unitType == undefined) {

                    if (commodities.unitType.length > 2) {
                        payload.Error = "Please provide Destination Unit Type!";
                        fail();
                        break;
                    }

                } else if (commodities.weight == undefined) {

                    if (commodities.weight.length > 2) {
                        payload.Error = "Please provide Destination Weight!";
                        fail();
                        break;
                    }

                } else if (commodities.freezable == undefined) {

                    if (commodities.freezable.length > 2) {
                        payload.Error = "Please provide Destination Freezable!";
                        fail();
                        break;
                    }

                } else if (commodities.hazMat == undefined) {

                    if (commodities.hazMat.length > 2) {
                        payload.Error = "Please provide Destination hazMat!";
                        fail();
                        break;
                    }

                } else if (commodities.xgold == undefined) {

                    if (commodities.xgold.length > 2) {
                        payload.Error = "Please provide Destination XGold!";
                        fail();
                        break;
                    }

                }

            }

            // this.PickupRequest.specialInstructions = results.specialInstructions;
            // this.PickupRequest.phone = results.phone;
            // this.PickupRequest.requestorLine = results.requestorLine;
            // this.PickupRequest.insidepickup = results.insidePickup;
            // this.PickupRequest.shipCity = results.shipCity
            // this.PickupRequest.shipZip = results.shipZip;
            // this.PickupRequest.pickTime = results.pickTime;
            // this.PickupRequest.closeAMPM = results.closeAMPM;
            // this.PickupRequest.thirdPartyPayor = results.thirdPartyPayor;
            // this.PickupRequest.customerNum = results.customerNum;
            // this.PickupRequest.topMessage = results.topMessage;
            // this.PickupRequest.oversize = results.
            // this.PickupRequest.r_message = results.
            // this.PickupRequest.submitDate = results.
            // this.PickupRequest.privaterespickup = results.
            // this.PickupRequest.requestorAreaCode = results.
            // this.PickupRequest.shipState = results.
            // this.PickupRequest.pickNum = results.
            // this.PickupRequest.poison = results.
            // this.PickupRequest.requestorContact = results.
            // this.PickupRequest.limitedaccpickup = results.
            // this.PickupRequest.shipCompany = results.
            // this.PickupRequest.closeTime = results.
            // this.PickupRequest.requestorPrefix = results.
            // this.PickupRequest.food = results.
            // this.PickupRequest.pickAMPM = results.
            // this.PickupRequest.shipContact = results.
            // this.PickupRequest.shipAddress = results.
            // this.PickupRequest.liftgaterequired = results.
            // this.PickupRequest.paymentTerms = results.
            // this.PickupRequest.pickDate = results.
            // this.PickupRequest.units = results.
            // this.PickupRequest.unitType = results.
            // this.PickupRequest.weight = results.
            // this.PickupRequest.loadNum = results.
            // this.PickupRequest.consigneeName = results.
            // this.PickupRequest.destCity = results.
            // this.PickupRequest.destState = results.
            // this.PickupRequest.destZip = results.
            // this.PickupRequest.destZip = results.
            // this.PickupRequest.hazMat = results.
            // this.PickupRequest.freezable = results.
            // this.PickupRequest.xgold = results.


            cb();
            break;

        case 2:
            // Call getPickupNumber Start Pickup Process
            //getPickupNumber(results.shipPhone, payload, cb, fail);
            cb();
            break;
        case 3:
            cb();
            break;
        case 4:
            cb();
            break;
        case 5:
            cb();
            break;
        case 6:
            cb();
            break;
        case 7:
            cb();
            break;
        case 8:
            cb();
            break;

    }

}

function getPickupNumber(phone, cb, fail) {

    console.debug("--------------------------------------------");
    console.debug("getPickupNumber");
    console.debug("--------------------------------------------");

    app.post('/pickup/request', function (req, res) {
        res.send('POST request to homepage');
    });

    console.debug("--------------------------------------------");

}

module.exports = router;