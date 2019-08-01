let express = require('express');
let router = express.Router();
let db = require('idb-connector');
let xt = require("itoolkit");



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

function servResponse(req, res, next, data) {

    payload = {};

    let stages = [1, 2, 3, 4, 5, 6].reduce((promiseChain, item) => {
            return promiseChain.then(() => new Promise((resolve, reject) => {
                asyncFunction(item, req, res, next, data, payload, resolve, reject);
            }));
        },
        Promise.resolve());

    stages.then(() => {
        console.log('Pickup Completed!!');
        console.log(payload);
        res.send(JSON.stringify(payload));
    }).catch((fail) => {
        console.log(fail);
        console.log("Pickup Failed!!");
        console.log(payload);
        res.send(JSON.stringify(payload));
    });

}

function asyncFunction(item, req, res, next, data, payload, cb, fail) {

    console.log(item + " running async Call!!");
    if (payload.Error == undefined) {

        var results = JSON.parse(data.PICKUP_REQUESTED);

        switch (item) {
            case 1:
                // Call CSM712 to Start Pickup Process
                callCSM712(results, payload, cb, fail);
                break;

            case 2:
                // Check Service Days
                //checkServiceDay("11/28/2019", cb, fail);
                //checkServiceDay("07/04/2019", cb, fail);
                checkServiceDay(results.pickDate, cb, fail);
                break;

            case 3:
                // Check Account number for Logging
                getUserAccount(results.userId, results.custnum, cb, fail);
                break;

            case 4:
                // Check zips and Non Service
                console.debug(results.destZip);
                console.debug(results.destZip.length);
                for (let csmId = 0; csmId < results.destZip.length; csmId++) {
                    console.log("Looping: " + csmId);
                    if (results.destZip[csmId] != undefined) {
                        console.debug(results.destZip[csmId]);
                        callCSM751(results.shipZip, results.destZip[csmId], results.paymentTerms, results.hazMat[csmId], results.pickDate, cb, fail);
                        checkNonService(results.destZip[csmId], cb, fail);
                        //callCSM714(csmId, results, cb, fail);
                        callCSM721(csmId, results, cb, fail);
                    }
                }
                break;

            case 5:
                //callCSM721(results, cb, fail);
                callEDM310(results.tempPickupNumber, cb, fail);
                //cb();
                break;

            case 6:
                callECC301CL(results.tempPickupNumber, cb, fail);
                break;

        }

    } else {
        console.log("Catch All Error:" + payload);
        fail();
    }

}

function callCSM712(results, payload, cb, fail) {

    let dbconn;
    let conn;

    // Define DB connections
    dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");
    conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

    let message = "";

    var pgm = new xt.iPgm("CSM712", {
        "lib": "CS"
    });

    // Pickup Submit Sends:
    // Location 
    // Time 
    // Payment Terms
    // Additional Pickup Requirements
    // Special Instructions
    //

    console.debug("--------------------------------------------");
    console.debug("CSM712");
    console.debug("--------------------------------------------");
    console.debug("Phone: " + results.phone);
    console.debug("PickupNumber: " + results.tempPickupNumber);
    console.debug("Ship Name: " + results.shipName);
    console.debug("Ship Address: " + results.shipAddress);
    console.debug("Ship City: " + results.shipCity);
    console.debug("Ship State: " + results.shipState);
    console.debug("Ship Zip: " + results.shipZip);
    console.debug("Ship Contact: " + results.shipContact);
    console.debug("Ship Caller: " + results.shipCaller);
    console.debug("Ship Caller Phone: " + results.shipCallerNumber);
    console.debug("Ready Date: " + results.pickDate);
    console.debug("Ready Time: " + results.pickTime);
    console.debug("Close Time: " + results.closeTime);
    console.debug("Payment Type: " + results.blppdcol);
    console.debug("TPP Name: " + results.tppName);
    console.debug("Account: " + results.custnum);
    console.debug("HP: " + results.pickupOptions[0].checked);
    console.debug("IP: " + results.pickupOptions[1].checked);
    console.debug("LAO: " + results.pickupOptions[2].checked);
    console.debug("LGO: " + results.pickupOptions[3].checked);
    console.debug("Over: " + results.pickupOptions[4].checked);
    console.debug("Posion: " + results.pickupOptions[5].checked);
    console.debug("Food: " + results.pickupOptions[6].checked);
    console.debug("Remark: " + results.specialins);
    console.debug("Init: " + results.pInit);
    console.debug("Message: " + message);
    console.debug("--------------------------------------------");
    console.debug("CSM712");
    console.debug("--------------------------------------------");

    // Check Parameters
    console.time('CSM712'); // 26 Parameters
    if (results.phone != undefined) {
        pgm.addParam(results.phone, "10A"); //Phone
    } else {
        pgm.addParam("          ", "10A");
        payload.Error = "Invalid Shipper Phone!";
        fail();
    }

    if (results.tempPickupNumber != undefined) {
        pgm.addParam(results.tempPickupNumber, "8A"); // Pickup Number
    } else {
        pgm.addParam("        ", "8A");
        payload.Error = "Invalid Temporary Pickup Number!";
        fail();
    }

    if (results.shipName != undefined) {
        pgm.addParam(results.shipName, "30A"); // Ship Name
    } else {
        pgm.addParam("                              ", "30A");
        payload.Error = "Missing Shipper Name!";
        fail();
    }

    if (results.shipAddress != undefined) {
        pgm.addParam(results.shipAddress, "30A"); // Ship Address
    } else {
        pgm.addParam("                              ", "30A");
        payload.Error = "Missing Shipper Address!";
        fail();
    }

    if (results.shipCity != undefined) {
        pgm.addParam(results.shipCity, "25A"); // Ship City
    } else {
        pgm.addParam("                         ", "25A");
        payload.Error = "Missing Shipper City!";
        fail();
    }

    if (results.shipState != undefined) {
        pgm.addParam(results.shipState, "2A"); // Ship State
    } else {
        pgm.addParam("  ", "2A");
        payload.Error = "Missing Shipper State!";
        fail();
    }

    if (results.shipZip != undefined) {
        pgm.addParam(results.shipZip, "6A"); // Ship Zip
    } else {
        pgm.addParam("      ", "6A");
        payload.Error = "Missing Shipper Zip!";
        fail();
    }

    if (results.shipContact != undefined) {
        pgm.addParam(results.shipContact, "30A"); // Ship Contact
    } else if ((results.shipContact == undefined) && (results.shipCaller == undefined)) {
        pgm.addParam("                              ", "30A");
        payload.Error = "Missing Shipper or Requestor Contact Name!";
        fail();
    } else {
        pgm.addParam("                              ", "30A");
    }

    if (results.shipCaller != undefined) {
        pgm.addParam(results.shipCaller, "30A"); // Ship Caller
    } else {
        pgm.addParam("                              ", "30A");
    }

    if (results.shipCallerNumber != undefined) {
        pgm.addParam(results.shipCallerNumber, "10A"); // Ship Caller Phone
    } else if ((results.shipCaller != undefined) && (results.shipCallerNumber == undefined)) {
        pgm.addParam("          ", "10A");
        payload.Error = "Missing Requestor Phone Number!";
        fail();
    } else {
        pgm.addParam("          ", "10A");
    }

    // Check PickDate
    if (results.pickDate != undefined) {
        let curMon = results.pickDate.substring(0, 2);
        let curDay = results.pickDate.substring(3, 5);
        let curYear = results.pickDate.substring(6, 10);
        //console.debug("Parsed Date: " + curMon + curDay + curYear);
        pgm.addParam(curMon + curDay + curYear, "8A"); // Ready Date
    } else {
        pgm.addParam("00000000");
        payload.Error = "Missing Pickup Date!";
        fail();
    }

    // Check PickTime
    if (results.pickTime != undefined) {

        let hrStd = results.pickTime.substring(1, 2);
        let hrMil = results.pickTime.substring(0, 2);
        let mm = results.pickTime.substring(2, 4);

        if ((hrMil >= 8) && (hrMil <= 12)) {
            pgm.addParam(hrStd + mm, "4A"); // Ready Time
        } else if ((hrMil > 12) && (hrMil <= 24)) {
            pgm.addParam(hrMil + mm, "4A"); // Ready Time
        } else {
            //var pDate = new Date(results.pickDate);
            payload.Error = "OUTSIDEPICKUPTIME";
            //payload.Proposed = {
            //    "Date": pDate + 1,
            //    "Time": "08:00"
            //}
        }

    } else {
        pgm.addParam("800", "4A");
        payload.Error = "Missing Pickup Time!";
        fail();
    }

    // Check CloseTime
    if (results.closeTime != undefined) {

        let hrStd = results.closeTime.substring(1, 2);
        let hrMil = results.closeTime.substring(0, 2);
        let mm = results.closeTime.substring(2, 4);

        if ((hrMil >= 8) && (hrMil <= 12)) {
            pgm.addParam(hrStd + mm, "4A"); // Ready Time
        } else if ((hrMil > 12) && (hrMil <= 24)) {
            pgm.addParam(hrMil + mm, "4A"); // Ready Time
        } else {
            payload.Error = "OUTSIDECLOSETIME";
            //console.log(results.pickDate);
            //payload.Proposed = {
            //    "Date": Date(results.pickDate) + 1,
            //    "Time": "17:00"
            //}
        }

    } else {
        pgm.addParam("1700", "4A");
        payload.Error = "Missing Close Time!";
        fail();
    }

    // Check Rest of parameters

    if (results.blppdcol != undefined) {
        pgm.addParam(results.blppdcol, "1A"); // Frt Terms
    } else {
        pgm.addParam(" ", "1A");
        payload.Error = "Missing Payment Terms!";
        fail();
    }

    if (results.tppName != undefined) {
        pgm.addParam(results.tppName, "30A"); // Tpp Name
    } else {
        pgm.addParam("                              ", "30A");
        if (results.blppdcol == 'T') {
            payload.Error = "Missing TPP Name!";
            fail();
        }

    }

    if (results.custnum != undefined) {
        pgm.addParam(results.custnum, "7A"); // Account
    } else {
        pgm.addParam("          ", "10A");
        payload.Error = "Missing Customer Number!";
        fail();
    }

    // NEED_HP
    if (results.pickupOptions[0].checked == true) {
        pgm.addParam('Y', "1A");
    } else {
        pgm.addParam('N', "1A");
    }

    // NEED_LAO
    if (results.pickupOptions[1].checked == true) {
        pgm.addParam('Y', "1A");
    } else {
        pgm.addParam('N', "1A");
    }

    // NEED_IP
    if (results.pickupOptions[2].checked == true) {
        pgm.addParam('Y', "1A");
    } else {
        pgm.addParam('N', "1A");
    }

    // NEED_LGO
    if (results.pickupOptions[3].checked == true) {
        pgm.addParam('Y', "1A");
    } else {
        pgm.addParam('N', "1A");
    }

    // HC_Overlength
    if (results.pickupOptions[4].checked == true) {
        pgm.addParam('Y', "1A");
    } else {
        pgm.addParam('N', "1A");
    }

    // HC_Posion
    if (results.pickupOptions[5].checked == true) {
        pgm.addParam('Y', "1A");
    } else {
        pgm.addParam('N', "1A");
    }

    // HC_Food
    if (results.pickupOptions[6].checked == true) {
        pgm.addParam('Y', "1A");
    } else {
        pgm.addParam('N', "1A");
    }

    if (results.specialins != undefined) {
        pgm.addParam(results.specialins, "280A"); // Remarks
    } else {
        pgm.addParam("                                                                                                    ", "280A");
    }

    if (results.pInit != null) {
        pgm.addParam(results.pInit, "5A"); // Init
    } else {
        fail();
    }

    pgm.addParam(message, "900A"); // Message

    if (payload.Error == undefined) {

        // Run RPG Call CSM712
        console.debug(pgm.toXML());
        conn.add(pgm.toXML());
        conn.run(function (rs, err) {
            if (err) {
                console.log("ERR90002 " + err.toString());
                payload.Error = "ERR90002 " + err.toString();
                fail();
            } else {
                console.timeEnd('CSM712');
                console.debug("--------------------------------------------");
                payload.CSM712MSG = JSON.parse(JSON.stringify(xt.xmlToJson(rs)));
                cb();
            }
        });

    } else {
        consolde.log("Pickup Failed: " + results.tempPickupNumber + "CSM712");
        fail();
    }

}

function getUserAccount(userName, account, cb, fail) {

    let dbconn;
    let conn;

    // Define DB connections
    dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");
    conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

    console.debug("--------------------------------------------");
    console.debug("getUserAccount");
    console.debug("--------------------------------------------");

    // check account number in future
    let accountCheck = "SELECT CWUSERID, CMCUST FROM RV.CUSWBD01 WHERE " +
        "CWUSERID = '" + userName + "'";

    console.debug(accountCheck);
    console.time('UserAccount');
    let sqlAccountHeader = new db.dbstmt(dbconn);
    sqlAccountHeader.exec(accountCheck, function (rs, err) {

        delete sqlAccountHeader;
        console.timeEnd('UserAccount');
        console.debug("--------------------------------------------");

        if (err) {
            console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            fail();
        } else {

            if (rs[0] == undefined) {

            } else if (rs[0].CMCUST == 926497) {
                // Update Partner Log
                updatePartnerLog(rs[0].CMCUST, "PITD", cb, fail);
            } else if (rs[0].CMCUST == 93755) {
                // Update Partner Log
                updatePartnerLog(rs[0].CMCUST, "WARD", cb, fail);
            }
            cb();
        }

    });

}

function updatePartnerLog(pickupNumber, partner, cb, fail) {

    let dbconn;
    let conn;

    console.debug("--------------------------------------------");
    console.debug("updatePartnerLog");
    console.debug("--------------------------------------------");

    // Define DB connections
    dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");
    conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

    let updatePartners = "INSERT INTO CS.PUFORMASTF VALUES(" + pickupNumber + ",'" + partner + "')";

    console.debug(updatePartners);
    console.time('UpdatePartners');
    let sqlServiceDayHeader = new db.dbstmt(dbconn);
    sqlServiceDayHeader.exec(updatePartners, function (rs, err) {
        delete sqlServiceDayHeader;
        console.timeEnd('UpdatePartners');
        console.debug("--------------------------------------------");
        if (err) {
            console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            fail();
        } else {
            console.debug(rs);
            cb();
        }

    });

}

function checkServiceDay(requestedDate, cb, fail) {

    let dbconn;
    let conn;

    // Define DB connections
    dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");
    conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

    console.debug("--------------------------------------------");
    console.debug("checkServiceDay");
    console.debug("--------------------------------------------");

    let serviceDate = formatDate(requestedDate, 'ServiceDay');
    console.debug("Service Day Date: " + serviceDate);

    // Here we check if non service day for billing and service
    let serviceDayQuery = "select a.nonsrv as billing, b.nonsrv as service " +
        "from sy.cdtsvmastf as a, " +
        "sy.cdatem03   as b " +
        "where a.mmddyy = b.mmddyy " +
        // no leading zero  
        "and a.mmddyy = " + serviceDate;

    console.debug(serviceDayQuery);
    console.time('Service-Day');
    let sqlServiceDayHeader = new db.dbstmt(dbconn);
    sqlServiceDayHeader.exec(serviceDayQuery, function (rs, err) {
        delete sqlServiceDayHeader;
        console.timeEnd('Service-Day');
        console.debug("--------------------------------------------");
        if (err) {
            console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            fail();
        } else {

            if ((rs[0] != undefined) && (rs[0].SERVICE == 'X')) {
                payload.Error = "NON-SERVICEDAY";
                console.debug("Service Exception");
                nextServiceDay(serviceDate, cb, fail);
            } else if ((rs[0] != undefined) && (rs[0].BILLING == 'X')) {
                payload.Error = "NON-BILLINGDAY";
                console.debug("Billing Exception");
                nextServiceDay(serviceDate, cb, fail);
            } else {
                cb();
            }

        }

    });

}

function nextServiceDay(requestedDate, cb, fail) {

    let dbconn;
    let conn;
    let error;
    let curDate;
    let formatCurDate;
    let nextDay;

    // Define DB connections
    dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");
    conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

    console.debug("--------------------------------------------");
    console.debug("nextServiceDay");
    console.debug("--------------------------------------------");

    nextDay = parseInt(requestedDate.substring(2, 4)) + 1;
    if (nextDay <= 9) {
        curDate = requestedDate.substring(0, 2) + "0" + nextDay + requestedDate.substring(4, 6);
        formatCurDate = requestedDate.substring(0, 2) + "/" + nextDay + "/" + "20" + requestedDate.substring(4, 6);
    } else {
        curDate = requestedDate.substring(0, 2) + nextDay + requestedDate.substring(4, 6);
        formatCurDate = requestedDate.substring(0, 2) + "/" + nextDay + "/" + "20" + requestedDate.substring(4, 6);
    }

    console.log("Testing New Service Date: " + curDate);

    // Here we check if non service day for billing and service
    let serviceDayQuery = "select a.mmddyy as chkDate, a.nonsrv as billing, b.nonsrv as service " +
        "from sy.cdtsvmastf as a, " +
        "sy.cdatem03   as b " +
        "where a.mmddyy = b.mmddyy " +
        // no leading zero  
        "and a.mmddyy = " + curDate;

    console.debug(serviceDayQuery);
    //console.time('Next-Service-Day');
    let sqlServiceDayHeader = new db.dbstmt(dbconn);
    sqlServiceDayHeader.exec(serviceDayQuery, function (rs2, err) {
        delete sqlServiceDayHeader;
        //console.timeEnd('Next-Service-Day');
        console.debug("--------------------------------------------");
        if (err) {
            found = 1;
            console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            fail();
        } else {

            console.debug("Record: " + rs2[0]);
            if ((rs2[0] != undefined) && (rs2[0].SERVICE != 'X') && (rs2[0].BILLING != 'X')) {
                found = 1;
                console.debug("Preposed Service Date: " + curDate);
                console.debug("--------------------------------------------");
                payload.nextDate = formatCurDate;
                payload.nextTime = "08:00 AM";
                fail();
            } else if (rs2[0] == undefined) {
                console.debug(curDate.substring(0, 2));
                console.debug(curDate.substring(2, 4));
                console.debug(curDate.substring(4, 6));
                let nextMonth = (parseInt(curDate.substring(0, 2)) + 1) + "01" + curDate.substring(4, 6);
                console.debug("Next Month: " + nextMonth);
                nextServiceDay(nextMonth, cb, fail);
            } else {
                nextServiceDay(curDate, cb, fail);
            }

        }

    });

}

function formatDate(curDate, format) {

    let formatedDate;
    let curMon = curDate.substring(0, 2);
    let curDay = curDate.substring(3, 5);
    let curYear = curDate.substring(6, 10);

    if (curMon < 10) {
        if (curMon.substring(0, 1) > 0) {
            curMon = "0" + curMon;
        }
    }

    if (format == 'ServiceDay') {
        formatedDate = curMon + curDay + curYear.substring(2, 4);
    } else if (format == 'CSM751') {
        formatedDate = curYear + curMon + curDay;
    } else {
        formatedDate = curMon + curDay + curYear;
    }

    return formatedDate;

}

function callCSM751(shipZip, consZip, payTerms, hazMat, pickupDate, cb, fail) {

    let dbconn;
    let conn;

    // Define DB connections
    dbconn = new db.dbconn();
    let option = {
        //host: "192.168.3.2",
        //port: 50005,
        //path: "/cgi-bin/xmlcgi.pgm",
        //ctl: "*here *debug",
        //buffer: 500000,
    };
    conn = new xt.iConn('DPI', "DPIOPS", "CHEX", option);
    //conn = new xt.iConn("DPI", "DPIOPS", "CHEX", options);

    let mPickDate = formatDate(pickupDate, 'CSM751');

    let orgTerm;
    let pGood;

    var pgm = new xt.iPgm("CSM751", {
        "lib": "CS"
    });

    console.debug("--------------------------------------------");
    console.debug("CSM751");
    console.debug("--------------------------------------------");
    console.debug("ShipZip: " + shipZip);
    console.debug("ConsZip: " + consZip);
    console.debug("Payment Terms: " + payTerms);
    console.debug("hazMat: " + hazMat);
    console.debug("PickDate: " + mPickDate);
    console.debug("--------------------------------------------");
    console.debug("CSM751");
    console.debug("--------------------------------------------");

    pgm.addParam("'" + shipZip + "'", "6A"); // Shipper Zipcode
    pgm.addParam("'" + consZip + "'", "6A"); // Consignee Zipcode  
    pgm.addParam(payTerms, "1A"); // Payment Terms
    if (hazMat == true) {
        pgm.addParam('Y', "1A"); // Haz Mat
    } else {
        pgm.addParam('N', "1A"); // Haz Mat    
    }
    pgm.addParam(mPickDate, "8A"); // Pickup Date
    pgm.addParam(" ", "3A"); // Org Term Response
    pgm.addParam(" ", "60A"); // P GOOD Response

    console.debug(pgm.toXML());
    conn.add(pgm.toXML());
    conn.run(function (rs, err) {

        //console.timeEnd("CSM751");

        if (err) {
            console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            fail();
        } else {
            console.debug("--------------------------------------------");
            if (payload.CSM751MSG == undefined) {
                payload.CSM751MSG = [];
            }
            payload.CSM751MSG = JSON.parse(JSON.stringify(xt.xmlToJson(rs)));

            //console.debug(rs);
            //console.debug(payload.CSM751MSG[0].data);
            //console.debug(payload.CSM751MSG[0].data[6].value);
            //cb();
        }
    });

    if (consZip == undefined) {
        payload.Error = "Missing Consignee zipcodes!";
        fail();
    }

}

function checkNonService(zip, cb, fail) {

    let dbconn;
    let conn;

    console.debug("--------------------------------------------");
    console.debug("checkNonService");
    console.debug("--------------------------------------------");

    // Define DB connections
    dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");
    conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

    let nonService = "SELECT PUCZBNAM FROM CS.PUCZBMASTF WHERE PUCZB# = " + zip;

    console.debug(nonService);
    //console.time('NONSVC');
    let sqlNonServiceHeader = new db.dbstmt(dbconn);
    sqlNonServiceHeader.exec(nonService, function (rs, err) {
        delete sqlNonServiceHeader;
        //console.timeEnd('NONSVC');
        console.debug("--------------------------------------------");
        if (err) {
            console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            fail();
        } else {
            //console.debug(rs);
            //console.debug(rs[0].PUCZBNAM);
            if (rs[0] != undefined && rs[0].PUCZBNAM != undefined) {
                if (payload.NonService == undefined) {
                    payload.NonService = [];
                }
                console.log("Length: " + rs[0].PUCZBNAM.length);
                payload.NonService.push(rs[0].PUCZBNAM);
                cb();
            }

        }

    });

}

// Submit Detail Records
function callCSM714(idx, data, cb, fail) {

    let dbconn;
    let conn;
    let message;

    // Define DB connections
    dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");
    conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

    var pgm = new xt.iPgm("CSM714", {
        "lib": "CS"
    });

    console.debug("--------------------------------------------");
    console.debug("CSM714");
    console.debug("--------------------------------------------");
    // 11 Parameters
    console.debug("CSM714");
    console.debug("Pickup Number: " + data.tempPickupNumber);
    console.debug("Line: " + (idx + 1));
    console.debug("Consignee Zip: " + data.destZip[idx]);
    console.debug("Handling Units: " + data.units[idx]);
    console.debug("PF Code: " + data.unitType[idx]);
    console.debug("Weight: " + data.weight[idx]);
    console.debug("Load Number: " + data.loadNum[idx]);
    console.debug("Haz Mat Flag: " + data.hazMat[idx]);
    console.debug("Freezing Flag: " + data.freezable[idx]);
    console.debug("Consignee Name: " + data.consigneeName[idx]);
    console.debug("X Gold Flag: " + data.xgold[idx]);
    console.debug("--------------------------------------------");
    console.debug("CSM714");
    console.debug("--------------------------------------------");

    pgm.addParam(data.tempPickupNumber, "8A");
    pgm.addParam((idx + 1), "3A");
    pgm.addParam(data.destZip[idx], "6A");
    pgm.addParam(data.units[idx], "5A");
    pgm.addParam(data.unitType[idx], "3A");
    pgm.addParam(data.weight[idx], "7A");
    pgm.addParam(data.loadNum[idx], "20A");
    pgm.addParam(data.hazMat[idx], "1A");
    pgm.addParam(data.freezable[idx], "1A");
    pgm.addParam(data.consigneeName[idx], "30A");
    pgm.addParam(data.xgold[idx], "1A");

    console.debug("Call CSM714-" + idx);
    console.debug(pgm.toXML());
    conn.add(pgm.toXML());
    conn.run(function (rs, err) {
        if (err) {
            console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            fail();
        } else {
            console.debug("714--------------------------------------------");
            if (payload.CSM714MSG == undefined) {
                payload.CSM714MSG = [];
            }
            if ((idx + 1) == data.destZip.length) {
                payload.CSM714MSG = JSON.parse(JSON.stringify(xt.xmlToJson(rs)));
                cb();
            }

        }

    });


}

// Finialize Pickup
function callCSM721(idx, data, cb, fail) {

    let dbconn;
    let conn;
    let message;

    // Define DB connections
    dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");
    conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

    var pgm = new xt.iPgm("CSM721", {
        "lib": "CS"
    });

    //for (var idx = 0; idx < data.destZip.length; idx++) {

    console.debug("--------------------------------------------");
    console.debug("CSM721");
    console.debug("--------------------------------------------");
    // 13 Parameters
    console.debug("CSM721");
    console.debug("Pickup Number: " + data.tempPickupNumber);
    console.debug("Line: " + (idx + 1));
    console.debug("Consignee Zip: " + data.destZip[idx]);
    console.debug("Handling Units: " + data.units[idx]);
    console.debug("PF Code: " + data.unitType[idx]);
    console.debug("Weight: " + data.weight[idx]);
    console.debug("Load Number: " + data.loadNum[idx]);
    console.debug("Consignee Name: " + data.consigneeName[idx]);
    console.debug("Consignee City: " + data.destCity[idx]);
    console.debug("Consignee State: " + data.destState[idx]);
    console.debug("Haz Mat Flag: " + data.hazMat[idx]);
    console.debug("Freezing Flag: " + data.freezable[idx]);
    console.debug("X Gold Flag: " + data.xgold[idx]);
    console.debug("--------------------------------------------");
    console.debug("CSM721");
    console.debug("--------------------------------------------");

    pgm.addParam(data.tempPickupNumber, "8A");
    pgm.addParam((idx + 1), "3A");
    pgm.addParam(data.destZip[idx], "6A");
    pgm.addParam(data.units[idx], "5A");
    pgm.addParam(data.unitType[idx], "3A");
    pgm.addParam(data.weight[idx], "7A");
    pgm.addParam(data.loadNum[idx], "20A");
    if (data.hazMat[idx] == true) {
        pgm.addParam('Y', "1A"); // Haz Mat
    } else {
        pgm.addParam('N', "1A"); // Haz Mat    
    }
    if (data.freezable[idx] == true) {
        pgm.addParam('Y', "1A"); // Freezable
    } else {
        pgm.addParam('N', "1A"); // Freezable  
    }
    pgm.addParam(data.consigneeName[idx], "30A");
    if (data.xgold[idx] == true) {
        pgm.addParam('Y', "1A"); // XGold
    } else {
        pgm.addParam('N', "1A"); // XGold    
    }
    pgm.addParam(data.destCity[idx], "30A");
    pgm.addParam(data.destState[idx], "2A");
    pgm.addParam(message, "900A");

    console.debug(pgm.toXML());
    conn.add(pgm.toXML());
    conn.run(function (rs, err) {
        if (err) {
            console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            fail();
        } else {
            console.debug("--------------------------------------------");
            //console.debug(rs);
            console.log("Pickup Submited: " + data.tempPickupNumber);
            payload.Success = data.tempPickupNumber;
            cancelPickup(data.tempPickupNumber, cb, fail);
        }

    });

    //}

}

// Say Hi to Kenny
// Send pickup to EDI
function callEDM310(pickupNumber, cb, fail) {

    let dbconn;
    let conn;

    // Define DB connections
    dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");
    conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

    var pgm = new xt.iPgm("EDM310", {
        "lib": "ED"
    });

    console.debug("--------------------------------------------");
    console.debug("EDM310");
    console.debug("--------------------------------------------");
    console.debug("Pickup Number: " + pickupNumber);
    pgm.addParam(pickupNumber, "8A"); // Pickup Number
    console.debug("--------------------------------------------");
    console.debug("EDM310");
    console.debug("--------------------------------------------");

    //console.debug(pgm.toXML());
    conn.add(pgm.toXML());
    conn.run(function (rs, err) {
        if (err) {
            console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            fail();
        } else {
            console.timeEnd("EDM310");
            console.debug("--------------------------------------------");
            console.debug(rs);
            cb();
        }

    });

}

// Say Hi to Ceetah
// Tells Cheetah that this pickup is ready.
function callECC301CL(pickupNumber, cb, fail) {

    let dbconn;
    let conn;

    // Define DB connections
    dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");
    conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

    var pgm = new xt.iPgm("ECC301CL", {
        "lib": "EC"
    });

    console.debug("--------------------------------------------");
    console.debug("ECC301CL");
    console.debug("--------------------------------------------");
    console.debug("Pickup Number: " + pickupNumber);
    pgm.addParam(pickupNumber, "8A"); // Pickup Number
    console.debug("--------------------------------------------");
    console.debug("ECC301CL");
    console.debug("--------------------------------------------");

    //console.debug(pgm.toXML());
    conn.add(pgm.toXML());
    conn.run(function (rs, err) {
        if (err) {
            console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            fail();
        } else {
            console.timeEnd("ECC301CL");
            console.debug("--------------------------------------------");
            console.debug(rs);
            cb();
        }

    });

}

function cancelPickup(pickupNumber, cb, fail) {

    let dbconn;
    let conn;

    console.debug("--------------------------------------------");
    console.debug("Canceling Pickup");
    console.debug("--------------------------------------------");

    // Define DB connections
    dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");
    conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

    var cDate = new Date();

    let cDateString;

    if ((cDate.getMonth() + 1) > 10) {
        cDateString = cDate.getYear() + (cDate.getMonth() + 1) + cDate.getDate();
    } else {
        cDateString = cDate.getYear() + "0" + (cDate.getMonth() + 1) + cDate.getDate();
    }

    let updatePickup = "UPDATE CS.PUFRTM01 " +
        "SET CNLINIT = 'API'" +
        ", CNLDATE = \'" + cDateString + "\', CNLTIME = \'" + cDate.getHours() + cDate.getMinutes() + cDate.getSeconds() + "\', CNLUSRNAM = 'API'" +
        " WHERE PUPICKUP# = \'" + pickupNumber + "\'";

    console.debug(updatePickup);
    let sqlUpdatePickupHeader = new db.dbstmt(dbconn);
    sqlUpdatePickupHeader.exec(updatePickup, function (rs, err) {
        delete sqlUpdatePickupHeader;
        console.debug("--------------------------------------------");
        if (err) {
            console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            fail();
        } else {
            console.debug(rs);
            cb();
        }

    });

}

module.exports = router;