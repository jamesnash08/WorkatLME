let db = require('idb-connector');
let xt = require("itoolkit");
const ratePayload = require("./ratePayload");
const ratePGM = require("./ratePGM");

function submitRate(cb, data) {

    var conn = new xt.iConn("DPI", "DPIOPS", "CHEX");
    // console.log(JSON.stringify(data));
    var payload = ratePayload.setupPayload(data);

    if (data.type == "LOOKUP") {
        var stages = [0, 1, 2, 3, 4, 5, 6, 7, 8].reduce((promiseChain, item) => {
                return promiseChain.then(() => new Promise((resolve, reject) => {
                    asyncFunctionLookup(conn, item, payload, resolve, reject);
                }));
            },
            Promise.resolve());

        stages.then(() => {
            console.log('Rate Lookup Completed!!');
            //console.log(payload);
            cb(payload);

        }).catch((fail) => {
            console.log("Rate Lookup Failed!! " + payload.Error);
            //console.log(payload);
            cb(payload);
        });
    } else {
        var stages = ["login", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].reduce((promiseChain, item) => {
                return promiseChain.then(() => new Promise((resolve, reject) => {
                    asyncFunction(conn, item, payload, resolve, reject);
                }));
            },
            Promise.resolve());

        stages.then(() => {

            if (!payload.Error) {
                console.log('Rate Completed!!');
                cb(payload);
            }

        }).catch((fail) => {
            if (payload.Error) {
                console.log("Rate Failed!! " + payload.Error);
                cb(payload);
            }
        });
    }

}

function asyncFunction(conn, item, payload, cb, fail) {

    //console.log(item + " running async Call!!");

    if (!payload.Error) {


        switch (item) {
            case "login":
                ratePGM.checkPermissions(conn, payload, cb, fail);
                break;
            case 0:
                checkZip('ORIG', payload.Quote.origbean.city, payload.Quote.origbean.state, payload.Quote.origbean.zip, payload.Quote.shipdate, payload, cb, fail);
                break;
            case 1:
                checkZip('DEST', payload.Quote.destbean.city, payload.Quote.destbean.state, payload.Quote.destbean.zip, payload.Quote.shipdate, payload, cb, fail);
                break;
            case 2:

                ratePGM.callBRM751(conn, payload, cb, fail);
                break;

            case 3:
                getTerm('ORIG', payload, cb, fail);
                break;
            case 4:
                getTerm('DEST', payload, cb, fail);
                break;
            case 5:
                ratePGM.callSYM710(conn, payload, cb, fail);
                ////console.log(payload);
                break;
            case 6:
                //console.log("Calling BRM730");
                ratePGM.callBRM730(conn, payload, cb, fail);
                break;
            case 7:
                //console.time("BRM732"+payload.Quote.quote);
                var items = payload.Quote.items.reduce((promiseChain, item) => {
                        return promiseChain.then(() => new Promise((resolve, reject) => {
                            ratePGM.callBRM732(conn, payload, item, "Freight", resolve, reject);
                            //console.log("Item: " + item.line);
                            //resolve();
                        }));
                    },
                    Promise.resolve());
                items.then(() => {
                    cb();
                }).catch((fail) => {
                    cb();
                });
                //console.timeEnd("BRM732"+payload.Quote.quote);

                // //console.time("BRM732_items");
                //     var promises = [];
                //     for(var i=0; i<payload.Quote.items.length;i++){
                //         promises[i] = new Promise((resolve, reject) => {
                //             ratePGM.callBRM732(conn, payload, payload.Quote.items[i], "Freight", resolve, reject);
                //         });
                //     }
                //     Promise.all(promises).then(function(){
                //         console.log("BRM732 items catch all");
                //         cb();
                //     }).catch((fail) =>{
                //         console.log("BRM732 items fail");
                //         cb();
                //     });
                // //console.timeEnd("BRM732_items");
                break;
            case 8:
                // //console.time("BRM732_accs");
                // var promises = [];
                // for(var i=0; i<payload.Quote.accs.length;i++){
                //     promises[i] = new Promise((resolve, reject) => {
                //         ratePGM.callBRM732(conn, payload, payload.Quote.accs[i], "Accessorial", resolve, reject);
                //     });
                // }
                // Promise.all(promises).then(function(){
                //     console.log("BRM732 accs catch all");
                //     cb();
                // }).catch((fail) =>{
                //     console.log("BRM732 accs fail");
                //     cb();
                // });
                // //console.timeEnd("BRM732_accs");
                //console.time("BRM732ACCS"+payload.Quote.quote);
                var assesorials = payload.Quote.accs.reduce((promiseChain, item) => {
                        return promiseChain.then(() => new Promise((resolve, reject) => {
                            ratePGM.callBRM732(conn, payload, item, "Accessorial", resolve, reject);
                            //console.log("Item: " + item.line);
                            //resolve();
                        }));
                    },
                    Promise.resolve());

                assesorials.then(() => {
                    //console.log("Complete");
                    cb();
                    ////console.log(payload.Quote.items);
                }).catch((fail) => {
                    cb();
                });

                //console.timeEnd("BRM732ACCS"+payload.Quote.quote);
                break;
            case 9:
                //console.time("BRM731"+payload.Quote.quote);
                ratePGM.callBRM731(conn, payload, cb, fail);
                //console.timeEnd("BRM731"+payload.Quote.quote);
                //console.debug(payload);
                break;
            case 10:
                // console.debug(payload);
                //console.time("BRM740"+payload.Quote.quote);
                ratePGM.callBRM740(conn, payload, cb, fail);
                //console.timeEnd("BRM740"+payload.Quote.quote);
                break;
            case 11:
                //console.time("BRM734"+payload.Quote.quote);
                ratePGM.getQuoteDetails(conn, payload, cb, fail);
                //console.timeEnd("BRM734"+payload.Quote.quote);
                break;
            case 12:
                //console.time("BRM736"+payload.Quote.quote);
                ratePGM.callBRM736(conn, payload, cb, fail);
                //console.timeEnd("BRM736"+payload.Quote.quote);
                break;
        }



    } else {
        //console.log("Catch All Error:" + payload);
        fail();
    }

}

function asyncFunctionLookup(conn, item, payload, cb, fail) {

    //console.log(item + " running async Call!!");

    if (!payload.Error) {

        switch (item) {
            case 0:
                ratePGM.checkPermissions(conn, payload, cb, fail);
                break;
            case 1:
                console.log("getQuote");
                ratePGM.getQuote(conn, payload, cb, fail);
                break;
            case 2:
                console.log("getQuoteDetails");
                ratePGM.getQuoteDetails(conn, payload, cb, fail);
                break;
            case 3:
                payload.Quote.shipdate = "20" + payload.Quote.shipdate.substring(1);
                checkZip('ORIG', payload.Quote.origbean.city, payload.Quote.origbean.state, payload.Quote.origbean.zip, payload.Quote.shipdate, payload, cb, fail);
                break;
            case 4:
                checkZip('DEST', payload.Quote.destbean.city, payload.Quote.destbean.state, payload.Quote.destbean.zip, payload.Quote.shipdate, payload, cb, fail);
                break;
            case 5:
                getTerm('ORIG', payload, cb, fail);
                break;
            case 6:
                getTerm('DEST', payload, cb, fail);
                break;
            case 7:
                ratePGM.callSYM710(conn, payload, cb, fail);
                break;
            case 8:
                ratePGM.callBRM736(conn, payload, cb, fail);
                break;

        }

    } else {
        //console.log("Catch All Error:" + payload);
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
    //console.time('UserAccount');
    let sqlAccountHeader = new db.dbstmt(dbconn);
    sqlAccountHeader.exec(accountCheck, function (rs, err) {

        delete sqlAccountHeader;
        //console.timeEnd('UserAccount');
        console.debug("--------------------------------------------");

        if (err) {
            //console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            console.log("ERR90002 " + accountCheck);
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
    // //console.time('Service-Day');
    let sqlServiceDayHeader = new db.dbstmt(dbconn);
    sqlServiceDayHeader.exec(serviceDayQuery, function (rs, err) {
        delete sqlServiceDayHeader;
        //console.timeEnd('Service-Day');
        console.debug("--------------------------------------------");
        if (err) {
            //console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            console.log("ERR90002 " + serviceDayQuery);
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

// function nextServiceDay(requestedDate, cb, fail) {

//     let dbconn;
//     let conn;
//     let error;
//     let curDate;
//     let formatCurDate;
//     let nextDay;

//     // Define DB connections
//     dbconn = new db.dbconn();
//     dbconn.conn("*LOCAL", "DPIOPS", "CHEX");
//     conn = new xt.iConn("*LOCAL", "DPIOPS", "CHEX");

//     console.debug("--------------------------------------------");
//     console.debug("nextServiceDay");
//     console.debug("--------------------------------------------");

//     nextDay = parseInt(requestedDate.substring(2, 4)) + 1;
//     if (nextDay <= 9) {
//         curDate = requestedDate.substring(0, 2) + "0" + nextDay + requestedDate.substring(4, 6);
//         formatCurDate = requestedDate.substring(0, 2) + "/" + nextDay + "/" + "20" + requestedDate.substring(4, 6);
//     } else {
//         curDate = requestedDate.substring(0, 2) + nextDay + requestedDate.substring(4, 6);
//         formatCurDate = requestedDate.substring(0, 2) + "/" + nextDay + "/" + "20" + requestedDate.substring(4, 6);
//     }

//     //console.log("Testing New Service Date: " + curDate);

//     // Here we check if non service day for billing and service
//     let serviceDayQuery = "select a.mmddyy as chkDate, a.nonsrv as billing, b.nonsrv as service " +
//         "from sy.cdtsvmastf as a, " +
//         "sy.cdatem03   as b " +
//         "where a.mmddyy = b.mmddyy " +
//         // no leading zero  
//         "and a.mmddyy = " + curDate;

//     console.debug(serviceDayQuery);
//     ////console.time('Next-Service-Day');
//     let sqlServiceDayHeader = new db.dbstmt(dbconn);
//     sqlServiceDayHeader.exec(serviceDayQuery, function (rs2, err) {
//         delete sqlServiceDayHeader;
//         ////console.timeEnd('Next-Service-Day');
//         console.debug("--------------------------------------------");
//         if (err) {
//             found = 1;
//             //console.log("ERR90002 " + err.toString());
//             payload.Error = "ERR90002 " + err.toString();
//             console.log("ERR90002 " + serviceDayQuery);
//             fail();
//         } else {

//             console.debug("Record: " + rs2[0]);
//             if ((rs2[0] != undefined) && (rs2[0].SERVICE != 'X') && (rs2[0].BILLING != 'X')) {
//                 found = 1;
//                 console.debug("Preposed Service Date: " + curDate);
//                 console.debug("--------------------------------------------");
//                 payload.nextDate = formatCurDate;
//                 payload.nextTime = "08:00 AM";

//                 fail();
//             } else if (rs2[0] == undefined) {
//                 console.debug(curDate.substring(0, 2));
//                 console.debug(curDate.substring(2, 4));
//                 console.debug(curDate.substring(4, 6));
//                 let nextMonth = (parseInt(curDate.substring(0, 2)) + 1) + "01" + curDate.substring(4, 6);
//                 console.debug("Next Month: " + nextMonth);
//                 nextServiceDay(nextMonth, cb, fail);
//             } else {
//                 nextServiceDay(curDate, cb, fail);
//             }

//         }

//     });

// }

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

function checkZip(direction, city, state, zip, date, payload, cb, fail) {
    // else if (!payload.Quote.)
    //     payload.Error = "Origin Zip: {0} is not valid for account: {1}.";
    // else if (!payload.Quote.)
    //     payload.Error = "Destination Zip: {0} is not valid for account: {1}.";
    // else if (!payload.Quote.)
    //     payload.Error = "Multiple Cities found for origin zipcode: {0}. An Origin City and State must be specified when Multiple are found.";
    // else if (!payload.Quote.)
    //     payload.Error = "Multiple Cities found for destination zipcode: {0}. A Destination City and State must be specified when Multiple are found.";
    var dbconn;

    var month = date.substring(4, 6);
    var day = date.substring(6, 8);
    var year = date.substring(2, 4);
    var cymd = "1" + year + month + day;
    ////console.log("1" + year + month + day);

    console.debug("--------------------------------------------");
    console.debug("checkZip");
    console.debug("--------------------------------------------");

    // Define DB connections
    dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");

    let queryCityStateZip = "SELECT " +
        "a.PTCITY as CITY, a.PTSTATE as STATE, a.PTZIP as ZIP, a.PTTRMA as LTRMA, " +
        "a.PTILSCAC as SCAC, a.PTILTRMA as ITRMA, b.PTCITYABRV as ACITY " +
        "FROM SY.POINTMASTF a " +
        "full outer join sy.pointm10 b on a.ptzip = b.ptzip and a.ptcity = b.ptcity " +
        "WHERE a.PTZIP = '" + zip + "' " +
        "AND a.PTRCDTYPE = ' ' " +
        //" AND a.PTCITY = '" + city.toUpperCase() + 
        " AND a.PTSTATE = '" + state.toUpperCase() +
        "' AND a.PTEFFDATE <= " + cymd +
        " AND a.PTEXPDATE >= " + cymd;

    console.debug(queryCityStateZip);
    ////console.time('QueryCityState');
    let sqlCityStateZipHeader = new db.dbstmt(dbconn);
    sqlCityStateZipHeader.exec(queryCityStateZip, function (rs, err) {

        delete sqlCityStateZipHeader;
        var cityFound = 0;

        ////console.timeEnd('QueryCityState');
        console.debug("--------------------------------------------");
        if (err) {
            //console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            console.log("ERR90002 " + queryCityStateZip);
            fail();
            //} else if (rs.length == 0) {
            //    if (direction == 'ORIG') {
            //        payload.Error = "Invalid origin Zip: {0}";
            //    }
            //    if (direction == 'DEST') {
            //        payload.Error = "Invalid destination Zip: {0}";
            //    }
            //    fail();
        } else {

            for (var rsIdx = 0; rsIdx < rs.length; rsIdx++) {

                // console.debug("Current City: " + city);
                // console.debug("City: " + rs[rsIdx].CITY);
                // console.debug("ACity: " + rs[rsIdx].ACITY);
                var currentCity = "";
                var currentAbrCity = "";

                if (rs[rsIdx] != null || rs[rsIdx] != undefined) {

                    currentCity = rs[rsIdx].CITY.trim();
                    if (rs[rsIdx].ACITY != null) {
                        currentAbrCity = rs[rsIdx].ACITY.trim();
                    } else {
                        currentAbrCity = "NONE";
                    }

                }

                if ((city != null) && (city != undefined) && (city.indexOf(currentCity) == 0)) {

                    this.cityFound = 1;

                    console.debug("Found");
                    if (direction == 'ORIG') {

                        console.debug("Results: " + rs[rsIdx].CITY);
                        payload.Quote.origbean.city = rs[rsIdx].CITY;
                        payload.Quote.origbean.state = rs[rsIdx].STATE;
                        payload.Quote.origbean.route = rs[rsIdx].LTRMA;
                        payload.Quote.origbean.carrier = rs[rsIdx].SCAC;

                        if (payload.Quote.origbean.carrier.length <= 0) {
                            payload.Quote.origbean.route = rs[rsIdx].ITRMA;
                        }

                        if (payload.Quote.origbean.carrier != "    " && payload.Quote.paymenttype == "P") {
                            payload.Error = "Unable to ship with prepaid payment terms at this origin.";
                            fail();
                        }


                    }

                    if (direction == 'DEST') {

                        console.debug("Results: " + rs[rsIdx].CITY);
                        payload.Quote.destbean.termcity = rs[rsIdx].CITY;
                        payload.Quote.destbean.termstate = rs[rsIdx].STATE;
                        payload.Quote.destbean.route = rs[rsIdx].LTRMA;
                        payload.Quote.destbean.carrier = rs[rsIdx].SCAC;

                        if (payload.Quote.destbean.carrier.length <= 0) {
                            payload.Quote.destbean.route = rs[rsIdx].ITRMA;
                        }

                        if (payload.Quote.destbean.carrier != '    ' && payload.Quote.paymenttype == "C") {
                            payload.Error = "Unable to ship with collect payment terms at this destination.";
                            fail();
                        }

                    }

                } else if ((city != null) && (city != undefined) && (currentAbrCity != 'NONE') && (city.indexOf(currentAbrCity) == 0)) {

                    this.cityFound = 1;

                    console.debug("ABR Found");
                    if (direction == 'ORIG') {

                        console.debug("Results: " + rs[rsIdx].ACITY);
                        payload.Quote.origbean.city = rs[rsIdx].ACITY;
                        payload.Quote.origbean.state = rs[rsIdx].STATE;
                        payload.Quote.origbean.route = rs[rsIdx].LTRMA;
                        payload.Quote.origbean.carrier = rs[rsIdx].SCAC;

                        if (payload.Quote.origbean.carrier.length <= 0) {
                            payload.Quote.origbean.route = rs[rsIdx].ITRMA;
                        }

                        if (payload.Quote.origbean.carrier != "    " && payload.Quote.paymenttype == "P") {
                            payload.Error = "Unable to ship with prepaid payment terms at this origin.";
                            fail();
                        }


                    }

                    if (direction == 'DEST') {

                        console.debug("Results: " + rs[rsIdx].ACITY);
                        payload.Quote.destbean.termcity = rs[rsIdx].ACITY;
                        payload.Quote.destbean.termstate = rs[rsIdx].STATE;
                        payload.Quote.destbean.route = rs[rsIdx].LTRMA;
                        payload.Quote.destbean.carrier = rs[rsIdx].SCAC;

                        if (payload.Quote.destbean.carrier.length <= 0) {
                            payload.Quote.destbean.route = rs[rsIdx].ITRMA;
                        }

                        if (payload.Quote.destbean.carrier != '    ' && payload.Quote.paymenttype == "C") {
                            payload.Error = "Unable to ship with collect payment terms at this destination.";
                            fail();
                        }

                    }

                }
            }

        }

        if (this.cityFound == 0) {

            if (direction == 'ORIG') {
                payload.Error = "Invalid origin Zip: {0}";
            }
            if (direction == 'DEST') {
                payload.Error = "Invalid destination Zip: {0}";
            }
            fail();

        } else {
            cb();
        }

    });

}

function getTerm(direction, payload, cb, fail) {

    let dbconn;

    // console.debug("--------------------------------------------");
    // console.debug("getTerm");
    // console.debug("--------------------------------------------");

    // Define DB connections
    dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");

    var queryTerm;

    if (direction == 'ORIG') {

        queryTerm = "SELECT TMADDRESS, TMCITY, TMSTATE, TMZIP, TMNAME, TMTERMINAL, TMTRMLCODE " +
            " FROM SY.TRMLSMASTF " +
            " WHERE TMTRMLCODE = '" + payload.Quote.origbean.route + "'";

    } else if (direction == 'DEST') {

        queryTerm = "SELECT TMADDRESS, TMCITY, TMSTATE, TMZIP, TMNAME, TMTERMINAL, TMTRMLCODE " +
            " FROM SY.TRMLSMASTF " +
            " WHERE TMTRMLCODE = '" + payload.Quote.destbean.route + "'";

    }

    console.debug(queryTerm);
    ////console.time('QueryCityState');
    let sqlTermHeader = new db.dbstmt(dbconn);
    sqlTermHeader.exec(queryTerm, function (rs, err) {
        delete sqlTermHeader;
        ////console.timeEnd('QueryCityState');
        console.debug("--------------------------------------------");
        if (err) {
            //console.log("ERR90002 " + err.toString());
            payload.Error = "ERR90002 " + err.toString();
            console.log("ERR90002 " + queryTerm);
            //console.log(queryTerm);
            fail();
        } else if (!rs[0] || rs.length == 0) {
            payload.Error = "Terminal not found";
            fail();
        } else {
            ////console.log(JSON.stringify(rs));
            if (direction == 'ORIG') {

                payload.Quote.origbean.termmaddress = rs[0].TMADDRESS;
                payload.Quote.origbean.termmcity = rs[0].TMCITY;
                payload.Quote.origbean.termmstate = rs[0].TMSTATE;
                payload.Quote.origbean.termmzip = rs[0].TMZIP;
                payload.Quote.origbean.termmname = rs[0].TMNAME;
                payload.Quote.origbean.terminalnumber = rs[0].TMTERMINAL;


            }

            if (direction == 'DEST') {

                payload.Quote.destbean.termaddress = rs[0].TMADDRESS;
                payload.Quote.destbean.termcity = rs[0].TMCITY;
                payload.Quote.destbean.termstate = rs[0].TMSTATE;
                payload.Quote.destbean.termzip = rs[0].TMZIP;
                payload.Quote.destbean.termname = rs[0].TMNAME;
                payload.Quote.destbean.terminalnumber = rs[0].TMTERMINAL;

            }
            cb();
        }

    });

}

module.exports = {
    submitRate: submitRate,
};