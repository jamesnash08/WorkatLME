let express = require('express');
let router = express.Router();
let db = require('idb-connector');
let xt = require("itoolkit");
let dbconn;
let conn;

// Status Variables
//let bolHeader = 0;
//let bolDetail = 0;
//let quoteHeader = 0;
//let quoteDetail = 0;

// Initialize Structures
let payload = {};

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

    // Define DB connections
    dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");
    conn = new xt.iConn("DPI", "DPIOPS", "CHEX");

    // Define SQL Queries
    let bolQuery =
        "SELECT hr.BLRQUEST#, hr.BLPPDCOL, hr.SHIPNAME, " +
        "hr.SHIPATTN, hr.SHIPADDRES, hr.SHIPCITY, hr.SHIPSTATE, hr.SHIPZIP, hr.SHIPCNTRY, " +
        "hr.SHIPPHONE, hr.SHIPPHEXT, hr.SHIPEMAIL, hr.CONSNAME, hr.CONSATTN, hr.CONSADDRES, " +
        "hr.CONSCITY, hr.CONSSTATE, hr.CONSZIP, hr.CONSCNTRY, hr.CONSPHONE, hr.CONSPHEXT, hr.CONSEMAIL, " +
        "hr.TPPNAME, hr.TPPATTN, hr.TPPADDRESS, hr.TPPCITY, hr.TPPSTATE, hr.TPPZIP, hr.TPPCNTRY, hr.TPPPHONE, " +
        "hr.TPPPHEXT, hr.TPPEMAIL, hr.COD, hr.CDCERT,hr.CDCMPY, hr.CFPPD, hr.CODNAME, hr.CODADDRESS, hr.CODCITY, " +
        "hr.CODSTATE, hr.CODZIP, hr.CODCNTRY, hr.SHIPDATE,hr.PRO, hr.BLDNBR, hr.PONMBR, hr.HDUNIT, hr.TPCS, hr.TWGT, " +
        "hr.BLRQTYPE, hr.BLRQNAME, hr.BLRQEMAIL, hr.BLRQPHONE, hr.BLRQPHEXT, hr.BLRQFAX, hr.BLHZPHONE, hr.BLHZPHEXT, " +
        "hr.BLTOSHIP, hr.BLTOCONS, hr.BLTOTPP, hr.BLTOEMAIL, hr.BLLABELS, hr.BLLBLSTART, hr.CKDGT, hr.BLCLPHONE, " +
        "hr.BLCLPHEXT, hr.BLCLNAME, hr.RDDDATE, hr.CWUSERID, hr.BLTEMPNAME, hr.BLHZCOMPY, hr.BLHZCTRCT, " +
        "de.BDLINE, de.BDHDUNIT, de.BDHDFORM, de.BDPCS, de.BDFORM, de.BDDESC, " +
        "de.BDWGT, de.BDCLSS, de.BDNMFC, de.BDNMFCSUB, de.BDHMFLAG, de.BDHMCLASS, de.BDHMUNNA#, de.BDTYPC, " +
        "de.BDRCD, de.BDSUBTC, de.BDHMPG#, de.BDHMSUB1, de.BDHMSUB2 " +
        "FROM BR.BLWHDHISTF hr " +
        "JOIN BR.BLWDTHISTF de on hr.BLRQUEST# = de.BLRQUEST# " +
        "WHERE de.BLRQUEST# = " + data.BOLId +
        " order by de.bdline ";

    let quoteQuery =
        "SELECT qh.rqdate as shipdate, qh.shpcty as shipcity, qh.shpst as shipstate, qh.shpzp6 as shipzip, " +
        "qh.cnscty as concity, qh.cnsst as constate, qh.cnszp6 as conzip, qh.ship as shipnum, " +
        "qh.cons as connum, qh.ppd as paymenttime, qh.codflg as codflag, qh.cfppd as codpaytime, " +
        "qh.cod as codamt, qh.hmflag as hazmat, qh.rqmflr as floor, qh.rqplts as numPallets, " +
        "qh.rqtflg as transitflag, qh.DISCST as acctno, qh.rqdfwt as defictweight, " +
        "qh.rqdfrt as defrate, qh.rqdfrv as defcharge, qh.twgt as totalWeight, qh.rqtfrt as totalFreight, " +
        "qh.dispct as discountpercent, qh.disamt as discountamount, qh.rqnetc as netcharge, " +
        "qh.rqfpct as fuelpercent, qh.rqfamt as fuelamount, qh.totchg as totalcharge," +
        "qh.rqtrff as tariff, qh.rqtfef as tariffdate, qh.rquntt as palletunit, qh.rqusep as usepallet," +
        "qh.rqnsdm as nonstdsize, qd.rdclss, qd.rdfak, qd.rdwgt, qd.rdrvnu, qd.rdcode, qd.rdline, qd.rddesc, qd.rddetl " +
        "from br.rtqtehistf qh " +
        "join br.rtqtedetlf qd on qh.rquote = qd.rquote " +
        "where qd.rquote = " + data.quoteNumber;

    let locationDetails = "SELECT PUPICKUP# AS putmp, SHIPPHONE AS shipphone, " +
        "SHIPNAME AS shipname, SHIPADDR as shipaddr, SHIPCITY AS shipcity, " +
        "SHIPSTATE AS shipstate, SHIPZIP AS shipzip, SHIP# AS shipnum, " +
        "PUCONTACT AS pucontact, PUCLSTIME AS puclstime, PULINE AS linenum " +
        "FROM CS.PUSHPTRANF WHERE ";

    if ((data.BOLId != undefined) && (data.BOLId.length > 0)) {

        console.time('BOL');
        bolHeader = 1;
        let sqlBOLHeader = new db.dbstmt(dbconn);
        sqlBOLHeader.exec(bolQuery, function (rs, err) {
            delete sqlBOLHeader;
            if (err) {
                console.log("ERR90002 " + err.toString());
                payload.Error = "ERR9002 " + err.toString();
            } else {
                console.timeEnd('BOL');
                allDone("bol", rs);
                bolHeader = 0;
            }

        });

    } else if ((data.quoteNumber != undefined) && (data.quoteNumber != "")) {

        console.debug(quoteQuery);
        console.time('Quote');
        quoteHeader = 1;
        let sqlQuoteHeader = new db.dbstmt(dbconn);
        sqlQuoteHeader.exec(quoteQuery, function (rs, err) {
            delete sqlQuoteHeader;
            if (err) {
                console.log("ERR90002 " + err.toString());
                payload.Error = "ERR90002 " + err.toString();
            } else {
                console.timeEnd('Quote');
                //console.debug(rs);
                allDone("quote", rs);
                quoteHeader = 0;
            }

        });

    } else {
        csm710(data.PICKUP_PHONE);
    }

    function csm710(phone) {

        var pgm = new xt.iPgm("CSM710", {
            "lib": "CS"
        });

        console.time('CSM710');
        pgm.addParam(phone, "10A");
        pgm.addParam(" ", "1A");
        pgm.addParam(" ", "1A");
        pgm.addParam(" ", "8A");
        conn.add(pgm.toXML());
        conn.run(function (rs, err) {
            if (err) {
                console.log("ERR90002 " + err.toString());
                payload.Error = "ERR90002 " + err.toString();
            } else {
                console.timeEnd('CSM710');
                console.time('Phone');
                var results = JSON.parse(JSON.stringify(xt.xmlToJson(rs)));
                locationDetails = locationDetails +
                    "\"PUPICKUP#\" = " + results[0].data[3].value +
                    " AND SHIPPHONE = " + results[0].data[0].value;
                let sqlPhone = new db.dbstmt(dbconn);
                sqlPhone.exec(locationDetails, function (rs, err) {
                    delete sqlPhone;
                    if (err) {
                        console.log("ERR90002 " + err.toString());
                        payload.Error = "ERR90002 " + err.toString();
                    } else {
                        console.timeEnd('Phone');
                        allDone("phoneDetails", rs);
                    }

                });
                allDone("CSM710", results[0].data);

            }

        });

    }

    function allDone(dataType, result) {

        console.debug("Called AllDone: " + dataType);
        if (dataType == "bol") {

            if (result.length >= 1) {

                payload.BOLHEADER = result[0];
                payload.PickupRequest.closeAMPM = payload.BOLHEADER.closeAMPM;
                payload.PickupRequest.closeTime = payload.BOLHEADER.closeTime;
                payload.PickupRequest.customerNum = payload.BOLHEADER.customerNum;
                payload.PickupRequest.paymentTerms = payload.BOLHEADER.paymentTerms;
                payload.PickupRequest.pickAMPM = payload.BOLHEADER.pickAMPM;
                payload.PickupRequest.pickDate = payload.BOLHEADER.pickdate;
                payload.PickupRequest.pickTime = payload.BOLHEADER.pickTime;
                payload.PickupRequest.r_message = payload.BOLHEADER.r_message;
                payload.PickupRequest.requestorAreaCode = payload.BOLHEADER.requestorAreaCode;
                payload.PickupRequest.requestorContact = payload.BOLHEADER.requestorContact
                payload.PickupRequest.requestorLine = payload.BOLHEADER.requestorLine;
                payload.PickupRequest.requestorPreFix = payload.BOLHEADER.requestorPreFix;
                payload.PickupRequest.shipAddress = payload.BOLHEADER.SHIPADDRES;
                payload.PickupRequest.shipCity = payload.BOLHEADER.SHIPCITY;
                payload.PickupRequest.shipContact = payload.BOLHEADER.shipContact;
                payload.PickupRequest.shipName = payload.BOLHEADER.SHIPNAME;
                payload.PickupRequest.shipState = payload.BOLHEADER.SHIPSTATE;
                payload.PickupRequest.shipZip = payload.BOLHEADER.SHIPZIP;
                payload.PickupRequest.specialInstructions
                payload.PickupRequest.submitDate
                payload.PickupRequest.thirdPartyPayor

                payload.PickupRequest.food = 'N';
                payload.PickupRequest.insidepickup = 'N';
                payload.PickupRequest.liftgaterequired = 'N';
                payload.PickupRequest.limitedaccesspickup = 'N';
                payload.PickupRequest.oversize = 'N';
                payload.PickupRequest.posion = 'N';
                payload.PickupRequest.privaterespickup = 'N';

                if (payload.BOLHEADER.BDTYPC = 'FS') {
                    payload.PickupRequest.food = 'Y';
                }

                if (payload.BOLHEADER.BDTYPC = 'IP') {
                    payload.PickupRequest.insidepickup = 'Y';
                }

                if (payload.BOLHEADER.BDTYPC = 'LGD') {
                    payload.PickupRequest.liftgaterequired = 'Y';
                }

                if (payload.BOLHEADER.BDTYPC = 'LAP') {
                    payload.PickupRequest.limitedaccesspickup = 'Y';
                }

                if (payload.BOLHEADER.BDTYPC = 'OS') {
                    payload.PickupRequest.oversize = 'Y';
                }
                if (payload.BOLHEADER.BDTYPC = 'PN') {
                    payload.PickupRequest.posion = 'Y';
                }
                if (payload.BOLHEADER.BDTYPC = 'HP') {
                    payload.PickupRequest.privaterespickup = 'Y';
                }

                for (var bdIdx = 0; bdIdx < result.length; bdIdx++) {
                    if (result[bdIdx].BDPCS > 0) {
                        payload.PickupRequest.units.push(result[bdIdx].BDPCS);
                        payload.PickupRequest.unitType.push(result[bdIdx].BDFORM);
                        payload.PickupRequest.weight.push(result[bdIdx].BDWGT);
                        //payload.PickupRequest.loadNum.push(result[bdIdx].bdhdunit);
                        payload.PickupRequest.consigneeName.push(payload.BOLHEADER.CONSNAME);
                        payload.PickupRequest.destCity.push(payload.BOLHEADER.CONSCITY);
                        payload.PickupRequest.destState.push(payload.BOLHEADER.CONSSTATE);
                        payload.PickupRequest.destZip.push(payload.BOLHEADER.CONSZIP);
                        payload.PickupRequest.destZip.push(payload.BOLHEADER.CONSZIP);
                    }
                }

                payload.BOLDETAILS = result;
                csm710(payload.BOLHEADER.SHIPPHONE);

            } else {
                payload.Error = "Unable to find BOL Number";
                res.send(JSON.stringify(payload));
            }

        } else if (dataType == "quote") {

            if (result.length >= 1) {

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

                payload.QUOTE = result[0];
                payload.PickupRequest.pickDate = payload.QUOTE.SHIPDATE;
                payload.PickupRequest.shipCompany = payload.QUOTE.SHIPNAME;
                payload.PickupRequest.shipCity = payload.QUOTE.SHIPCITY;
                payload.PickupRequest.shipState = payload.QUOTE.SHIPSTATE;
                payload.PickupRequest.shipZip = payload.QUOTE.SHIPZIP;
                payload.PickupRequest.weight[0] = payload.QUOTE.TOTALWEIGHT;
                payload.PickupRequest.units[0] = payload.QUOTE.NUMPALLETS;
                payload.PickupRequest.unitType[0] = payload.QUOTE.PALLETUNIT;
                payload.PickupRequest.destCity[0] = payload.QUOTE.CONCITY;
                payload.PickupRequest.destState[0] = payload.QUOTE.CONSTATE;
                payload.PickupRequest.destZip[0] = payload.QUOTE.CONZIP;
                payload.PickupRequest.destZip[0] = payload.QUOTE.CONZIP;

                payload.PickupRequest.food = 'N';
                payload.PickupRequest.insidepickup = 'N';
                payload.PickupRequest.liftgaterequired = 'N';
                payload.PickupRequest.limitedaccesspickup = 'N';
                payload.PickupRequest.oversize = 'N';
                payload.PickupRequest.posion = 'N';
                payload.PickupRequest.privaterespickup = 'N';

                if (payload.QUOTE.RDCODE == 'FS') {
                    payload.PickupRequest.food = 'Y';
                }

                if (payload.QUOTE.RDCODE == 'IP') {
                    payload.PickupRequest.insidepickup = 'Y';
                }

                if (payload.QUOTE.RDCODE == 'LGD') {
                    payload.PickupRequest.liftgaterequired = 'Y';
                }

                if (payload.QUOTE.RDCODE == 'LAP') {
                    payload.PickupRequest.limitedaccesspickup = 'Y';
                }

                if (payload.QUOTE.RDCODE == 'OS') {
                    payload.PickupRequest.oversize = 'Y';
                }
                if (payload.QUOTE.RDCODE == 'PN') {
                    payload.PickupRequest.posion = 'Y';
                }
                if (payload.QUOTE.RDCODE == 'HP') {
                    payload.PickupRequest.privaterespickup = 'Y';
                }

                res.send(JSON.stringify(payload));

            } else {
                payload.Error = "NOQUOTE";
                payload.ErrorCode = "NOQUOTE";
                payload.ErrorDescription = "We were unable to lookup this quote. Please continue without carry over information.";
                res.send(JSON.stringify(payload));
            }


        } else if (dataType == "CSM710") {
            payload.CSM710 = {
                "PICKUP_PHONE": result[0].value,
                "PICKUP_NUMBER": result[3].value
            };
            payload.workPhone = result[0].value;
            payload.pickNum = result[3].value;

            //console.debug("Phone Result: " + payload.workPhone);
            //console.debug("Pickup Number: " + payload.pickNum);
        } else if (dataType == "phoneDetails") {

            payload.addrs = [];

            for (var idx = 0; idx < result.length; idx++) {

                payload.addrs[idx] = {
                    "linenum": result[idx].LINENUM,
                    "name": result[idx].SHIPNAME,
                    "address": result[idx].SHIPADDR,
                    "city": result[idx].SHIPCITY,
                    "state": result[idx].SHIPSTATE,
                    "zip": result[idx].SHIPZIP,
                    "contact": result[idx].PUCONTACT,
                    "closeTime": result[idx].PUCLSTIME
                }

            }

            res.send(JSON.stringify(payload));
        }

    }

}

module.exports = router;