let xt = require("itoolkit");

exports.callBRM751 = function (conn, payload, cb, fail) {
    // Define DB connections
    //console.debug("--------------------------------------------");
    //console.debug("P_Weight " + payload.Quote.totalweight); //6
    //console.debug("Conszip " + payload.Quote.destbean.zip); //6
    //console.debug("shipzip " + payload.Quote.origbean.zip); //6
    //console.debug("P_Pickupa " + payload.Quote.shipdate); //8
    //console.debug("p_CUST " + payload.Quote.accountnumber); //7
    //returns good 60
    //console.debug("--------------------------------------------");
    var pgm = new xt.iPgm("BRM751", {
        "lib": "BR"
    });
    // Check Parameters
    ////console.time('BRM751'); // 5 Parameters

    if (!isNaN(payload.Quote.totalweight)) {
        pgm.addParam(Number(payload.Quote.totalweight).toFixed(0), "6A");
    } else {
        payload.Error = "Invalid total weight";
        fail();
    }
    if (payload.Quote.destbean.zip) {
        pgm.addParam(payload.Quote.destbean.zip, "6A");
    } else {
        payload.Error = "Invalid consignee zip code";
        fail();
    }
    if (payload.Quote.origbean.zip) {
        pgm.addParam(payload.Quote.origbean.zip, "6A");
    } else {
        payload.Error = "Invalid shipper zip code";
        fail();
    }
    if (!isNaN(payload.Quote.shipdate)) {
        pgm.addParam(payload.Quote.shipdate, "8A");
    } else {
        payload.Error = "Invalid date";
        fail();
    }
    if (!isNaN(payload.Quote.accountnumber)) {
        pgm.addParam(payload.Quote.accountnumber, "7A");
    } else {
        payload.Error = "Invalid customer number";
        fail();
    }
    pgm.addParam("", "60A");
    if (payload.Error == undefined) {
        ////console.debug(pgm.toXML());
        conn.add(pgm.toXML());
        conn.run(function (rs, err) {
            if (err) {
                //console.log("ERR90004 " + err.toString());
                payload.Error = "ERR90004 " + err.toString();
                fail();
            } else {
                ////console.timeEnd('BRM751');
                //console.debug("--------------------------------------------");
                payload.BRM751 = JSON.parse(JSON.stringify(xt.xmlToJson(rs)));
                ////console.log(payload.BRM751);
                //console.debug("--------------------------------------------");
                if (payload.BRM751[0].data[5].value.length != "") {
                    //console.log("Over Weight check");
                    //console.log(payload.BRM751[0].data[5].value)
                    payload.Error = "Over Weight check";
                    fail();
                }

                //if (payload.BRM751[0].data) {
                //    //console.debug(payload.BRM751[0].data);
                //}

                cb();
            }
        });
    } else {
        consolde.log("Rate failed: " + payload.Error + " BRM751");
        fail();
    }
}

exports.checkPermissions = function (conn, payload, cb, fail) {

    var db = require('idb-connector');
    var dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");

    try {
        user = payload.Quote.userid.toUpperCase();
        password = payload.Quote.password.toUpperCase();
    } catch (err) {
        console.log("Unable to convert case!");
    }

    var sql;
    sql = "SELECT A.CWUSERID, A.CWPASSWORD, B.CMCUST, B.CWFEATURE FROM RV.CUSWBMASTF A" +
        " JOIN RV.CUSWBDETLF B on A.CWUSERID = B.CWUSERID" +
        " WHERE A.CWUSERID = '" + user + "'" +
        " AND A.CWPASSWORD = '" + password + "'" +
        " AND A.ACTIVE = 'Y'";

    //console.log(sql);

    ////console.time("checkPasswd");

    var sqlA = new db.dbstmt(dbconn);
    sqlA.exec(sql, (rs, err) => {
        ////console.time("checkPasswd");
        sqlA.close();
        if (err) {
            dbconn.disconn();
            dbconn.close();
            console.log("ERR90002 " + err.toString());
            console.log("ERR90002 " + sql);
            payload.Error = "ERR90002 " + err.toString();
            fail();
        } else {

            dbconn.disconn();
            dbconn.close();

            var found = 0;

            for (var uid = 0; uid < rs.length; uid++) {
                if (rs[uid].CMCUST == payload.Quote.accountnumber) {
                    //console.log("Found Account!");
                    found = 1;
                } else if (rs[uid].CWUSERID.trim() == payload.Quote.userid.toUpperCase().trim()) {
                    //console.log("Found User!");
                    found = 1;
                }
            }

            if (found == 0) {
                payload.Error = "Could not validate username: {0} and password {1}.";
                fail();
            } else {
                cb();
            }

        }

    });

}

exports.getQuote = function (conn, payload, cb, fail) {

    var db = require('idb-connector');
    var dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");

    var sql;
    sql = "Select rqdate as shipdate, shpcty as shipcity, " +
        "shpst as shipstate, shpzp6 as shipzip, cnscty as concity, " +
        "cnsst as constate, cnszp6 as conzip, ship as shipnum, " +
        "cons as connum, ppd as paymenttime, codflg as codflag, " +
        "cfppd as codpaytime, cod as codamt, hmflag as hazmat, " +
        "rqmflr as floor, rqplts as numPallets, rqtflg as transitflag, " +
        "DISCST as acctno, rqdfwt as defictweight, rqdfrt as defrate, " +
        "rqdfrv as defcharge, twgt as totalWeight, rqtfrt as totalFreight, " +
        "dispct as discountpercent, disamt as discountamount, rqnetc as netcharge, " +
        "rqfpct as fuelpercent, rqfamt as fuelamount, totchg as totalcharge," +
        "rqtrff as tariff, rqtfef as tariffdate, rquntt as palletunit, " +
        "rqusep as usepallet, rqnsdm as nonstdsize from " +
        "br.rtqtehistf " + "where " + "rquote = " + payload.Quote.quote;

    //console.log(sql);

    ////console.time("getQuoteA");

    var sqlA = new db.dbstmt(dbconn);
    sqlA.exec(sql, (rs, err) => {
        ////console.time("getQuoteA");
        sqlA.close();
        if (err) {
            dbconn.disconn();
            dbconn.close();
            console.log("ERR90002 " + err.toString());
            console.log("ERR90002 " + sql);
            payload.Error = "ERR90002 " + err.toString();
            fail();
        } else {

            //dbconn.disconn();
            //dbconn.close();

            if (rs[0] != undefined) {
                payload.Quote.shipdate = rs[0].SHIPDATE;
                payload.Quote.shipcity = rs[0].SHIPCITY;
                payload.Quote.shipstate = rs[0].SHIPSTATE;
                payload.Quote.shipzip = rs[0].SHIPZIP;

                payload.Quote.origbean.city = rs[0].SHIPCITY.trim();
                payload.Quote.origbean.state = rs[0].SHIPSTATE.trim();
                payload.Quote.origbean.zip = rs[0].SHIPZIP.trim();

                payload.Quote.concity = rs[0].CONCITY;
                payload.Quote.constate = rs[0].CONSTATE;
                payload.Quote.conzip = rs[0].CONZIP;

                payload.Quote.destbean.city = rs[0].CONCITY.trim();
                payload.Quote.destbean.state = rs[0].CONSTATE.trim();
                payload.Quote.destbean.zip = rs[0].CONZIP.trim();

                payload.Quote.shipnum = rs[0].SHIP;
                payload.Quote.connum = rs[0].CONS;
                payload.Quote.paymenttime = rs[0].ppd;
                payload.Quote.codflag = rs[0].codflg;
                payload.Quote.conpaytime = rs[0].cfppd;
                payload.Quote.codamt = rs[0].cod;
                payload.Quote.hazmat = rs[0].hmflag;
                payload.Quote.floor = rs[0].rqmflr;
                payload.Quote.numPallets = rs[0].rqplts;
                payload.Quote.transitflag = rs[0].rqtflg;
                payload.Quote.acctno = rs[0].discst;
                payload.Quote.defictweight = rs[0].rqdfwt;
                payload.Quote.deficitrate = rs[0].rqdfrt;
                payload.Quote.deficitcharge = rs[0].rqdfrv;
                payload.Quote.totalweight = rs[0].twgt;
                payload.Quote.totalfreight = rs[0].rqtfrt;
                payload.Quote.discpercent = rs[0].dispct;
                payload.Quote.discamount = rs[0].disamt;
                payload.Quote.net = rs[0].rqnetc;
                payload.Quote.fuelsurchargepercent = rs[0].rqfpct;
                payload.Quote.fuelsurchargeamount = rs[0].rqfamt;
                payload.Quote.totalcharge = Number(rs[0].totchg);
                payload.Quote.tariff = rs[0].rqtrff;
                payload.Quote.tariffdate = rs[0].rqtfef;
                payload.Quote.palletunit = rs[0].rquntt;
                payload.Quote.usepallet = rs[0].rqusep;
                payload.Quote.nonstdsize = rs[0].rqnsdm;
                cb();
            }

        }

    });

}


exports.getQuoteDetails = function (conn, payload, cb, fail) {

    var db = require('idb-connector');
    var dbconn = new db.dbconn();
    dbconn.conn("DPI", "DPIOPS", "CHEX");

    var sql2;

    sql2 = "select * from br.rtqted01 where rquote = " + payload.Quote.quote + " ORDER BY RDLINE ASC";

    //console.log(sql2);

    ////console.time("getQuoteB");

    var sqlB = new db.dbstmt(dbconn);
    sqlB.exec(sql2, (rs2, err) => {
        ////console.time("getQuoteB");
        sqlB.close();
        if (err) {
            dbconn.disconn();
            dbconn.close();
            console.log("ERR90002 " + err.toString());
            console.log("ERR90002 " + sql);
            payload.Error = "ERR90002 " + err.toString();
            fail();
        } else {

            dbconn.disconn();
            dbconn.close();
            payload.Quote.items = [];
            payload.Quote.accs = [];
            for (var i = 0; i < rs2.length; i++) {

                payload.Quote[rs2[i].RDDETL == 1 ? "items" : "accs"].push({
                    linetype: rs2[i].RDDETL == 1 ? "Freight" : "Accessorial",
                    charges: rs2[i].RDRVNU * 100,
                    desc: rs2[i].RDDESC > "" ? rs2[i].RDDESC.trim() : "",
                    weight: rs2[i].RDWGT,
                    userid: payload.Quote.userid,
                    line: rs2[i].RDLINE,
                    code: rs2[i].RDCODE,
                    errflag: "",
                    fak: rs2[i].RDFAK,
                    ratepercwt: rs2[i].RDRATE > 0 ? rs2[i].RDRATE : "MIN",
                    quote: payload.Quote.quote,
                    shippingclass: rs2[i].RDCLSS,
                    accountnumber: payload.Quote.accountnumber,
                    ratetext: ""
                });

            }
            cb();
        }

    });

}

exports.callSYM710 = function (conn, payload, cb, fail) {
    //console.log("SYM710");
    // Define DB connections
    // 26 Paramaters
    //console.debug("--------------------------------------------");
    //console.debug("Origin Carrier " + payload.Quote.origbean.carrier);
    //console.debug("Destination Carrier " + payload.Quote.destbean.carrier);
    //console.debug("Ship Date " + payload.Quote.shipdate);
    //console.debug("Origin Terminal " + payload.Quote.origbean.route);
    //console.debug("Additional Days " + '');
    //console.debug("Additional Qual " + '');
    //console.debug("Origin City " + payload.Quote.origbean.city);
    //console.debug("Origin State " + payload.Quote.origbean.state);
    //console.debug("Origin Zip " + payload.Quote.origbean.zip);
    //console.debug("Destination City " + payload.Quote.destbean.city);
    //console.debug("Destination State " + payload.Quote.destbean.state);
    //console.debug("Destination Zip " + payload.Quote.destbean.zip);
    //console.debug("Error Flag " + '');
    //console.debug("Arrival Date " + '');
    //console.debug("Service Days " + '');
    //console.debug("Destination Terminal " + payload.Quote.destbean.route);
    //console.debug("SCAC " + payload.Quote.destbean.scac);
    //console.debug("OffShore " + '');
    //console.debug("Holiday Adjustment " + '');
    //console.debug("Show Std " + '');
    //console.debug("Show Ask " + '');
    //console.debug("Show Msg " + '');
    //console.debug("Display Status " + '');
    //console.debug("Messages " + '');
    //console.debug("Origin Service " + '');
    //console.debug("Destination Service " + '');
    //console.debug("--------------------------------------------");

    var pgm = new xt.iPgm("SYM710", {
        "lib": "SY"
    });
    // Check Parameters
    ////console.time('SYM710'); // 5 Parameters

    if (payload.Quote.origbean.carrier > "") {
        pgm.addParam(payload.Quote.origbean.carrier, "4A");
    } else {
        payload.Error = "Invalid Orig Carrier";
        fail();
    }

    if (payload.Quote.destbean.carrier > "") {
        pgm.addParam(payload.Quote.destbean.carrier, "4A");
    } else {
        payload.Error = "Invalid Dest Carrier";
        fail();
    }

    if (payload.Quote.shipdate > "") {
        pgm.addParam(payload.Quote.shipdate, "8A");
    } else {
        payload.Error = "Invalid Ship Date";
        fail();
    }

    if (payload.Quote.origbean.route > "") {
        pgm.addParam(payload.Quote.origbean.route, "3A");
    } else {
        payload.Error = "Invalid Orig Terminal";
        fail();
    }

    pgm.addParam("", "3A"); // Additional Days
    pgm.addParam("", "2A"); // Additional Qual

    if (payload.Quote.origbean.city > "") {
        pgm.addParam(payload.Quote.origbean.city, "25A");
    } else {
        payload.Error = "Invalid Orig City";
        fail();
    }

    if (payload.Quote.origbean.state > "") {
        pgm.addParam(payload.Quote.origbean.state, "2A");
    } else {
        payload.Error = "Invalid Orig State";
        fail();
    }

    if (payload.Quote.origbean.zip > "") {
        pgm.addParam(payload.Quote.origbean.zip, "6A");
    } else {
        payload.Error = "Invalid Orig Zip";
        fail();
    }

    if (payload.Quote.destbean.city > "") {
        pgm.addParam(payload.Quote.destbean.city, "25A");
    } else {
        payload.Error = "Invalid Dest City";
        fail();
    }

    if (payload.Quote.destbean.state > "") {
        pgm.addParam(payload.Quote.destbean.state, "2A");
    } else {
        payload.Error = "Invalid Dest State";
        fail();
    }

    if (payload.Quote.destbean.zip > "") {
        pgm.addParam(payload.Quote.destbean.zip, "6A");
    } else {
        payload.Error = "Invalid Dest Zip";
        fail();
    }

    pgm.addParam("", "1A"); // Error
    pgm.addParam("", "8A"); // Arrivial Date
    pgm.addParam("", "3A"); // Service Days

    if (payload.Quote.destbean.route > "") {
        pgm.addParam(payload.Quote.destbean.route, "6A");
    } else {
        payload.Error = "Invalid Dest Term";
    }

    // if (payload.Quote.destbean.scac > "") {
    //     pgm.addParam(payload.Quote.destbean.scac, "4A");
    // } else {
    //     payload.Error = "Invalid SCAC";
    //     fail();
    // }
    pgm.addParam("    ", "4A"); // Bscac

    pgm.addParam("", "1A"); // Off shore
    pgm.addParam("", "3A"); // Holiday Adjustment
    pgm.addParam("", "1A"); // Show Std
    pgm.addParam("", "1A"); // Show Ast
    pgm.addParam("", "1A"); // Show Msg
    pgm.addParam("", "1A"); // Disp Status
    pgm.addParam("", "1100A"); // Message
    pgm.addParam("", "26A"); // Orig Service
    pgm.addParam("", "26A"); // Dest Service

    if (payload.Error == undefined) {

        ////console.debug(pgm.toXML());
        conn.add(pgm.toXML());
        conn.run(function (rs, err) {
            if (err) {
                //console.log("ERR90004 " + err.toString());
                payload.Error = "ERR90004 " + err.toString();
                fail();
            } else {
                ////console.timeEnd('SYM710');
                //console.debug("--------------------------------------------");
                payload.SYM710 = JSON.parse(JSON.stringify(xt.xmlToJson(rs)));
                //console.log("SYM710 " + JSON.stringify(payload.SYM710[0].data));
                payload.Quote.extradays = payload.SYM710[0].data[4].value;
                payload.Quote.adddaysq = payload.SYM710[0].data[5].value;
                payload.Quote.rpgerrorflag = payload.SYM710[0].data[12].value;
                payload.Quote.arvdate = payload.SYM710[0].data[13].value;
                payload.Quote.days = payload.SYM710[0].data[14].value;
                payload.Quote.offshore = payload.SYM710[0].data[17].value;
                payload.Quote.holidaydays = payload.SYM710[0].data[18].value;
                payload.Quote.showStd = payload.SYM710[0].data[19].value;
                payload.Quote.showAsk = payload.SYM710[0].data[20].value;
                payload.Quote.showmsg = payload.SYM710[0].data[21].value;
                //payload.Quote.days = payload.SYM710[0].data[22].value;
                payload.Quote.longhtmlmessage = payload.SYM710[0].data[23].value;
                payload.Quote.orgserv = payload.SYM710[0].data[24].value;
                payload.Quote.dstserv = payload.SYM710[0].data[25].value;
                cb();
            }
        });
    } else {
        //console.log("Rate failed: " + payload.Error + " SYM710");
        fail();
    }

}

exports.callBRM730 = function (conn, payload, cb, fail) {
    // Define DB connections
    //console.debug("--------------------------------------------");
    //console.debug("Quote " + payload.Quote.quote); //Quote 8
    //console.debug("Customer number " + payload.Quote.accountnumber); //Cust 7
    //console.debug("Who is filling this out " + payload.Quote.customertype); //PPDCOL 1
    //console.debug("Handling unit Type " + payload.Quote.HandlingUnit); //Hu 3
    //console.debug("Number Of Handling Units " + payload.Quote.numHandlingUnits); //units 5
    //console.debug("--------------------------------------------");
    var pgm = new xt.iPgm("BRM730", {
        "lib": "BR"
    });
    // Check Parameters
    ////console.time('BRM730'); // 5 Parameters

    // Set Quote number to blank
    pgm.addParam("", "8A");

    if (!isNaN(payload.Quote.accountnumber)) {
        pgm.addParam(payload.Quote.accountnumber, "7A");
    } else {
        payload.Error = "Invalid customer number";
        fail();
    }

    if (payload.Quote.customertype == "T" || payload.Quote.customertype == "S" || payload.Quote.customertype == "C") {
        pgm.addParam(payload.Quote.customertype, "1A");
    } else {
        payload.Error = "Invalid customer type";
        fail();
    }
    if (payload.Quote.palletPricing == "Y") {
        if (payload.Quote.HandlingUnit) {
            pgm.addParam(payload.Quote.HandlingUnit, "3A");
        } else {
            payload.Error = "Invalid handling units";
            fail();
        }

        if (!isNaN(payload.Quote.numHandlingUnits)) {
            pgm.addParam(payload.Quote.numHandlingUnits, "5A");
        } else {
            payload.Error = "Invalid unit count";
            fail();
        }
    } else {
        pgm.addParam("", "3A");
        pgm.addParam("00000", "5A");
    }

    if (payload.Error == undefined) {

        //console.debug(pgm.toXML());
        conn.add(pgm.toXML());
        conn.run(function (rs, err) {
            if (err) {
                //console.log("ERR90004 " + err.toString());
                payload.Error = "ERR90004 " + err.toString();
                fail();
            } else {
                ////console.timeEnd('BRM730');
                //console.debug("--------------------------------------------");
                payload.BRM730 = JSON.parse(JSON.stringify(xt.xmlToJson(rs)));
                ////console.log("BRM730 " + JSON.stringify(payload.BRM730));
                payload.Quote.quote = payload.BRM730[0].data[0].value;
                cb();
            }
        });
    } else {
        consolde.log("Rate failed: " + payload.Error + " BRM730");
        fail();
    }
}
exports.callBRM732 = function (conn, payload, item, iType, cb, fail) {
    //writes detail records
    // Define DB connections
    var line, shippingclass, weight, code, type, error = "";
    if (iType == "Freight") {
        line = item.line;
        shippingclass = item.shippingclass;
        weight = Number(item.weight).toFixed(0);
        code = item.code;
        type = 1;
    }
    if (iType == "Accessorial") {
        line = item.line;
        shippingclass = item.shippingclass;
        weight = item.weight;
        code = item.code;
        type = code == "VL" ? 3 : 2;
    }

    //console.debug("--------------------------------------------");

    //console.debug("Quote " + payload.Quote.quote); //Quote 8
    //console.debug("Line " + line); //line 3
    //console.debug("shippingclass " + shippingclass); //shippingclass 4
    //console.debug("Weight " + weight); //weight 6
    //console.debug("Cust " + payload.Quote.accountnumber); //cust 7
    //console.debug("Error " + error); //error 1
    //console.debug("Code " + code); //code  4
    //console.debug("Type " + type); //type  1
    //console.debug("--------------------------------------------");




    // Check Parameters
    // ////console.time('BRM732'); // 8 Parameters
    var pgm = new xt.iPgm("BRM732", {
        "lib": "BR"
    });
    if (!isNaN(payload.Quote.quote)) {
        pgm.addParam(payload.Quote.quote, "8A");
    } else {
        //console.log("Quote? " + payload.Quote.quote);
        payload.Error = "Quote number invalid";
        fail();
    }
    if (line) {
        pgm.addParam(line, "3A");
    } else {
        payload.Error = "Line invalid";
        fail();
    }
    if (["50", "55", "60", "65", "70", "775", "85", "925", "100", "110", "125", "150", "175", "200", "250", "300", "400", "500"].indexOf(shippingclass) > -1 || iType == "Accessorial") {
        pgm.addParam(shippingclass, "4A");
    } else {
        payload.Error = "Commodity Class: is invalid.";
        fail();
    }
    if (weight || iType == "Accessorial") {
        pgm.addParam(weight, "6A");
    } else {
        payload.Error = "You must provide a commodity weight for commodity line.";
        fail();
    }
    if (payload.Quote.accountnumber) {
        pgm.addParam(payload.Quote.accountnumber, "7A");
    } else {
        payload.Error = "Account number invalid";
        fail();
    }
    pgm.addParam(error ? error : " ", "1A");

    //pgm.addParam(code ? code : "    ", "4A");
    if (code || iType == "Freight") {
        pgm.addParam(code, "4A");
    } else {
        payload.Error = "Code invalid";
        fail();
    }

    if (type) {
        pgm.addParam(type, "1A");
    } else {
        payload.Error = "Commodity type invalid";
        fail();
    }

    if (payload.Error == undefined) {
        //console.log("Write item " + line + " type " + code);
        //console.debug(pgm.toXML());
        conn.add(pgm.toXML());
        conn.run(function (rs, err) {
            if (err) {
                //console.log("ERR90004 " + err.toString());
                payload.Error = "ERR90004 " + err.toString();
                fail();
            } else {
                // ////console.timeEnd('BRM732');
                //console.debug("--------------------------------------------");
                payload.BRM732 = JSON.parse(JSON.stringify(xt.xmlToJson(rs)));
                if (payload.BRM732[0].data[6].value == 1) {
                    payload.Error = "No pricing found";
                    fail();
                } else
                    cb();
            }
        });
    } else {
        consolde.log("Rate failed: " + payload.Error + " BRM732");
        fail();
    }
}
exports.callBRM731 = function (conn, payload, cb, fail) {
    // Define DB connections
    //console.debug("--------------------------------------------");
    //console.debug("p_cust " + payload.Quote.accountnumber); //p_cust# 7
    //console.debug("shipcity " + payload.Quote.origbean.city); //shipcity 25
    //console.debug("shipstate " + payload.Quote.origbean.state); //shipstate 2
    //console.debug("shipzip " + payload.Quote.origbean.zip); //shipzip 6
    //console.debug("conscity " + payload.Quote.destbean.city); //conscity
    //console.debug("consstate " + payload.Quote.destbean.state); //code  4
    //console.debug("conszip " + payload.Quote.destbean.zip); //type  1
    //console.debug("p_pickup " + payload.Quote.shipdate); //type  8
    //returned fields
    //pltprc_found 1
    //p_maxplts  5
    //unit_code1  7
    //unit_code2  7
    //console.debug("--------------------------------------------");

    // Check Parameters
    ////console.time('BRM731'); // 12 Parameters
    var pgm = new xt.iPgm("BRM731", {
        "lib": "BR"
    });
    if (!isNaN(payload.Quote.accountnumber)) {
        pgm.addParam(payload.Quote.accountnumber, "7A");
    } else {
        payload.Error = "Customer number invalid";
        fail();
    }
    if (payload.Quote.origbean.city) {
        pgm.addParam(payload.Quote.origbean.city, "25A");
    } else {
        payload.Error = "Shipper city invalid";
        fail();
    }
    if (payload.Quote.origbean.state) {
        pgm.addParam(payload.Quote.origbean.state, "2A");
    } else {
        payload.Error = "Shipper state invalid";
        fail();
    }
    if (payload.Quote.origbean.zip) {
        pgm.addParam(payload.Quote.origbean.zip, "6A");
    } else {
        payload.Error = "Shipper zip invalid";
        fail();
    }
    if (payload.Quote.destbean.city) {
        pgm.addParam(payload.Quote.destbean.city, "25A");
    } else {
        payload.Error = "Consignee city invalid";
        fail();
    }
    if (payload.Quote.destbean.state) {
        pgm.addParam(payload.Quote.destbean.state, "2A");
    } else {
        payload.Error = "Consignee state invalid";
        fail();
    }
    if (payload.Quote.destbean.zip) {
        pgm.addParam(payload.Quote.destbean.zip, "6A");
    } else {
        payload.Error = "Consignee zip invalid";
        fail();
    }
    if (!isNaN(payload.Quote.shipdate)) {
        pgm.addParam(payload.Quote.shipdate, "8A");
    } else {
        payload.Error = "Invalid shipping date";
        fail();
    }
    pgm.addParam("", "1A");
    pgm.addParam("", "5A");
    pgm.addParam("", "7A");
    pgm.addParam("", "7A");

    if (payload.Error == undefined) {

        //console.debug(pgm.toXML());
        conn.add(pgm.toXML());
        conn.run(function (rs, err) {
            if (err) {
                //console.log("ERR90004 " + err.toString());
                payload.Error = "ERR90004 " + err.toString();
                fail();
            } else {
                ////console.timeEnd('BRM731');
                //console.debug("--------------------------------------------");
                payload.BRM731 = JSON.parse(JSON.stringify(xt.xmlToJson(rs)));
                //console.log("BRM731 " + JSON.stringify(payload.BRM731));
                if (payload.Quote.palletPricing == 'Y') {

                    console.log("PalletType: " + payload.Quote.palletType);

                    if (payload.Quote.palletType == 'PALLETS' ||
                        payload.Quote.palletType == 'PALLET' ||
                        payload.Quote.palletType == 'CRATES' ||
                        payload.Quote.palletType == 'DRUMS' ||
                        payload.Quote.palletType == 'TRACKS') {
                        //console.debug("Using Pallet Pricing");
                        cb();

                    } else if (payload.Quote.palletType.length > 0) {
                        //console.debug("Invalid pallet type");
                        payload.Error = "Invalid pallet type";
                        fail();
                    }

                } else {
                    // else if (!payload.Quote.)
                    //     payload.Error = "Pallet pricing is available for this account and zip code. Please specify Y or N for the parameter usePalletPricing.";
                    //console.debug("No Pallet Pricing");
                    cb();
                }
            }
        });
    } else {
        consolde.log("Rate failed: " + payload.Error + " BRM731");
        fail();
    }
}
exports.callBRM740 = function (conn, payload, cb, fail) {
    // Define DB connections
    //console.debug("--------------------------------------------");
    //console.debug("Quote " + payload.Quote.quote); // P_Quote 8
    //console.debug("Shipper city " + payload.Quote.origbean.city); // P_Shipcity 25
    //console.debug("Shipper state " + payload.Quote.origbean.state); // P_Shipstate  2
    //console.debug("Shipper zip " + payload.Quote.origbean.zip); // P_Shipzip  6
    //console.debug("Consignee city " + payload.Quote.destbean.city); // P_Conscity 25
    //console.debug("Consignee state " + payload.Quote.destbean.state); // P_Consstate  2
    //console.debug("Consignee zip " + payload.Quote.destbean.zip); // P_Conszip   6
    //console.debug("PPDCOL " + payload.Quote.paymenttype); // P_Ppdcol  1
    //console.debug("Shipdate " + payload.Quote.shipdate); // P_Pickupa 8 YYYYMMDD
    //console.debug("COD? " + payload.Quote.CODflag); // P_Codflag  1
    //console.debug("COD amount " + payload.Quote.codamt); // P_Codamount  8
    //console.debug("COD PPDCOL " + payload.Quote.codfeepaymenttype); // P_Cfppd    1
    //console.debug("Hazmat? " + payload.Quote.hazmat); // P_Hazflag  1
    //console.debug("Units " + payload.Quote.numHandlingUnits); // P_Units    2
    //console.debug("Handling unit " + payload.Quote.HandlingUnit); // P_216_Type  7 - pallets/crates/drums/totes/tracks
    //console.debug("ADV SCAC " + payload.Quote.origbean.carrier); // P_Advscac  4
    //console.debug("BYD SCAC " + payload.Quote.destbean.carrier); // P_Bydscac  4
    //console.debug("ORG " + payload.Quote.origbean.route); // P_Orga     3
    //console.debug("DST " + payload.Quote.destbean.route); // P_Dsta      3
    ////console.debug("ratestatus? " + payload.Quote.); // P_Ratestatus  1   19
    // P_Replace    1      20
    //console.debug("Arrival date " + payload.Quote.arvdate); // P_Arvdate    8
    //console.debug("Service standard " + payload.Quote.days); // P_Svcstd      3
    // P_Service_Msg   1100
    // P_Orgservice    26
    // P_Dstservice   26
    //console.debug("show standard " + payload.Quote.showStd); // P_Showstd    1
    //console.debug("show ask " + payload.Quote.showAsk); // P_Showask    1
    //console.debug("show msg " + payload.Quote.showmsg); // P_Showmsg    1
    // P_Use_Volume   1
    //console.debug("Protect from freezing? " + payload.Quote.protectFreeze); // P_ProtectFrz   1

    //console.debug("--------------------------------------------");

    // Check Parameters
    ////console.time('BRM740'); // 5 Parameters
    var pgm = new xt.iPgm("BRM740", {
        "lib": "BR"
    });
    if (!isNaN(payload.Quote.quote)) {
        pgm.addParam(payload.Quote.quote, "8A");
    } else {
        payload.Error = "Invalid quote number";
        fail();
    }
    if (payload.Quote.origbean.city) {
        pgm.addParam(payload.Quote.origbean.city, "25A");
    } else {
        payload.Error = "Invalid shipper city";
        fail();
    }
    if (payload.Quote.origbean.state) {
        pgm.addParam(payload.Quote.origbean.state, "2A");
    } else {
        payload.Error = "Invalid shipper state";
        fail();
    }
    if (payload.Quote.origbean.zip) {
        pgm.addParam(payload.Quote.origbean.zip, "6A");
    } else {
        payload.Error = "Invalid shipper zip";
        fail();
    }
    if (payload.Quote.destbean.city) {
        pgm.addParam(payload.Quote.destbean.city, "25A");
    } else {
        payload.Error = "Invalid consignee city";
        fail();
    }
    if (payload.Quote.destbean.state) {
        pgm.addParam(payload.Quote.destbean.state, "2A");
    } else {
        payload.Error = "Invalid consignee state";
        fail();
    }
    if (payload.Quote.destbean.zip) {
        pgm.addParam(payload.Quote.destbean.zip, "6A");
    } else {
        payload.Error = "Invalid consignee zip";
        fail();
    }
    if (payload.Quote.paymenttype) {
        pgm.addParam(payload.Quote.paymenttype, "1A");
    } else {
        payload.Error = "Invalid payment terms";
        fail();
    }
    if (payload.Quote.shipdate) {
        pgm.addParam(payload.Quote.shipdate, "8A");
    } else {
        payload.Error = "Invalid shipdate";
        fail();
    }
    pgm.addParam(payload.Quote.CODflag.toUpperCase() == "Y" ? "Y" : "N", "1A");
    if (payload.Quote.CODflag.toUpperCase() == "Y") {
        if (payload.Quote.codamt) {
            pgm.addParam(payload.Quote.codamt, "8A");
        } else {
            payload.Error = "Invalid COD amount";
            fail();
        }
        if (payload.Quote.codfeepaymenttype) {
            pgm.addParam(payload.Quote.codfeepaymenttype, "1A");
        } else {
            payload.Error = "Invalid COD payment terms";
            fail();
        }
    } else {
        pgm.addParam("00000000", "8A");
        pgm.addParam("", "1A");
    }
    if (payload.Quote.hazmat) {
        pgm.addParam(payload.Quote.hazmat, "1A");
    } else {
        payload.Error = "Invalid hazmat flag";
        fail();
    }
    if (payload.Quote.palletPricing == "Y") {
        if (!isNaN(payload.Quote.numHandlingUnits)) {
            pgm.addParam(payload.Quote.numHandlingUnits, "2A");
        } else {
            payload.Error = "Invalid unit count";
            fail();
        }
        if (payload.Quote.HandlingUnit) {
            pgm.addParam(payload.Quote.HandlingUnit, "7A");
        } else {
            payload.Error = "Invalid handling units";
            fail();
        }
    } else {
        pgm.addParam("00", "2A");
        pgm.addParam("", "7A");

    }
    pgm.addParam(payload.Quote.origbean.carrier, "4A");
    pgm.addParam(payload.Quote.destbean.carrier, "4A");
    if (payload.Quote.origbean.route) {
        pgm.addParam(payload.Quote.origbean.route, "3A");
    } else {
        payload.Error = "Invalid origin terminal";
        fail();
    }
    if (payload.Quote.destbean.route) {
        pgm.addParam(payload.Quote.destbean.route, "3A");
    } else {
        payload.Error = "Invalid destination terminal";
        fail();
    }
    pgm.addParam("0", "1A"); //rate quote status starts at 0
    pgm.addParam("", "1A");
    pgm.addParam("", "8A");
    pgm.addParam("", "3A");
    // if (payload.Quote.arvdate) {
    //     pgm.addParam(payload.Quote.arvdate, "8A");
    // } else {
    //     payload.Error = "Invalid arrival date";
    //     fail();
    // }
    // if (payload.Quote.days) {
    //     pgm.addParam(payload.Quote.days, "3A");
    // } else {
    //     payload.Error = "Invalid service standard";
    //     fail();
    // }
    pgm.addParam("", "1100A");
    pgm.addParam("", "26A");
    pgm.addParam("", "26A");
    pgm.addParam("", "1A");
    pgm.addParam("", "1A");
    pgm.addParam("", "1A");
    pgm.addParam("", "1A");
    pgm.addParam(payload.Quote.protectFreeze, "1A");

    if (payload.Error == undefined) {

        //console.debug(pgm.toXML());
        conn.add(pgm.toXML());
        conn.run(function (rs, err) {
            if (err) {
                //console.log("ERR90004 " + err.toString());
                payload.Error = "ERR90004 " + err.toString();
                fail();
            } else {
                ////console.timeEnd('BRM740');
                //console.debug("--------------------------------------------");
                payload.BRM740 = JSON.parse(JSON.stringify(xt.xmlToJson(rs)));
                //console.log("BRM740 " + JSON.stringify(payload.BRM740));
                payload.Quote.ratests = payload.BRM740[0].data[19].value;
                payload.Quote.replace = payload.BRM740[0].data[20].value;
                //payload.Quote.arvdate = payload.BRM740[0].data[21].value;
                //payload.Quote.days = payload.BRM740[0].data[22].value;
                payload.Quote.serv_msg = payload.BRM740[0].data[23].value;
                //payload.Quote.orgserv = payload.BRM740[0].data[24].value;
                //payload.Quote.dstserv = payload.BRM740[0].data[25].value;
                payload.Quote.showStd = payload.BRM740[0].data[26].value;
                payload.Quote.showAsk = payload.BRM740[0].data[27].value;
                payload.Quote.showmsg = payload.BRM740[0].data[28].value;
                //payload.Quote  = payload.BRM740[0].data[29].value;
                if (payload.Quote.ratests == 9) {
                    payload.Error = "Pricing not found";
                    fail();
                } else
                    cb();
            }
        });
    } else {
        consolde.log("Rate failed: " + payload.Error + " BRM740");
        fail();
    }
}

exports.callBRM734 = function (conn, payload, item, type, index, cb, fail) {
    //writes detail records
    // Define DB connections
    //console.debug("--------------------------------------------");
    //console.debug("Quote " + payload.Quote.quote); //Quote 8
    //console.debug("Line " + item.line); //line 3
    //p_fak 4
    //p_rate 6
    //p_revenue 8
    //p_code 4
    //p_description 35
    //p_type 1
    //console.debug("--------------------------------------------");

    // Check Parameters
    //////console.time('BRM734'); // 8 Parameters
    var pgm = new xt.iPgm("BRM734", {
        "lib": "BR"
    });
    if (!isNaN(payload.Quote.quote)) {
        pgm.addParam(payload.Quote.quote, "8A");
    } else {
        payload.Error = "Quote number invalid";
        fail();
    }
    if (item.line) {
        pgm.addParam(item.line, "3A");
    } else {
        payload.Error = "Line invalid";
        fail();
    }
    pgm.addParam("", "4A");
    pgm.addParam("", "6A");
    pgm.addParam("", "8A");
    pgm.addParam("", "4A");
    pgm.addParam("", "35A");
    pgm.addParam("", "1A");

    if (payload.Error == undefined) {

        //console.debug(pgm.toXML());
        conn.add(pgm.toXML());
        conn.run(function (rs, err) {
            if (err) {
                //console.log("ERR90004 " + err.toString());
                payload.Error = "ERR90004 " + err.toString();
                fail();
            } else {
                //////console.timeEnd('BRM734');
                //console.debug("--------------------------------------------");
                payload.BRM734 = JSON.parse(JSON.stringify(xt.xmlToJson(rs)));
                //console.log("BRM734 " + JSON.stringify(payload.BRM734));
                //pull back information into payload
                if (payload.BRM734[0].data[7].value == "9") {
                    //no record found may be an issue
                    //console.log("Item " + JSON.stringify(payload.Quote[type == "Freight" ? "items" : "accs"][index]));
                    //console.log("Return " + JSON.stringify(payload.BRM734[0].data));
                    payload.Error = "Detail records don't match";
                    fail();
                } else {
                    payload.Quote[type == "Freight" ? "items" : "accs"][index].fak = payload.BRM734[0].data[2].value;
                    payload.Quote[type == "Freight" ? "items" : "accs"][index].ratepercwt = payload.BRM734[0].data[3].value;
                    payload.Quote[type == "Freight" ? "items" : "accs"][index].charges = payload.BRM734[0].data[4].value;
                    payload.Quote[type == "Freight" ? "items" : "accs"][index].code = payload.BRM734[0].data[5].value;
                    payload.Quote[type == "Freight" ? "items" : "accs"][index].desc = payload.BRM734[0].data[6].value;
                    ////console.log("line " + JSON.stringify(payload.Quote[type == "Freight" ? "items" : "accs"][index]));
                    cb();
                }
            }
        });
    } else {
        consolde.log("Rate failed: " + payload.Error + " BRM734");
        fail();
    }
}
exports.callBRM736 = function (conn, payload, cb, fail) {
    // Define DB connections
    //console.debug("--------------------------------------------");
    //console.debug("Quote " + payload.Quote.quote); //Quote 8
    // Defweight  6
    // Defrate    7
    // Defrevenue  8
    // Ratedweight  7
    // Totfrtchg    8
    // Discamount   8
    // Netcharge  8
    // Fspercent  4
    // Fscharge    8
    // Totcharge   8
    // Tariff      8
    // Trfeffdate   6
    // Mcmessage    30
    // Showrates    1
    // Ratemessage  35
    // Discmcflag   1
    // Crqslsmsg    70
    // Discpercent  4
    // Xpressgold    325
    // XpressChrg    8
    // Rateexception  225
    //console.debug("--------------------------------------------");
    var pgm = new xt.iPgm("BRM736", {
        "lib": "BR"
    });
    // Check Parameters
    ////console.time('BRM736');
    if (!isNaN(payload.Quote.quote)) {
        pgm.addParam(payload.Quote.quote, "8A");
    } else {
        payload.Error = "Invalid Quote";
        fail();
    }
    pgm.addParam("", "6A");
    pgm.addParam("", "7A");
    pgm.addParam("", "8A");
    pgm.addParam("", "7A");
    pgm.addParam("", "8A");
    pgm.addParam("", "8A");
    pgm.addParam("", "8A");
    pgm.addParam("", "4A");
    pgm.addParam("", "8A");
    pgm.addParam("", "8A");
    pgm.addParam("", "8A");
    pgm.addParam("", "6A");
    pgm.addParam("", "30A");
    pgm.addParam("", "1A");
    pgm.addParam("", "35A");
    pgm.addParam("", "1A");
    pgm.addParam("", "70A");
    pgm.addParam("", "4A");
    pgm.addParam("", "325A");
    pgm.addParam("", "8A");
    pgm.addParam("", "255A");

    if (payload.Error == undefined) {

        ////console.debug(pgm.toXML());
        conn.add(pgm.toXML());
        conn.run(function (rs, err) {
            if (err) {
                //console.log("ERR90004 " + err.toString());
                payload.Error = "ERR90004 " + err.toString();
                fail();
            } else {
                ////console.timeEnd('BRM736');
                //console.debug("--------------------------------------------");
                payload.BRM736 = JSON.parse(JSON.stringify(xt.xmlToJson(rs)));
                //console.log("BRM736 " + JSON.stringify(payload.BRM736));
                payload.Quote.deficitweight = payload.BRM736[0].data[1].value;
                payload.Quote.deficitrate = payload.BRM736[0].data[2].value;
                payload.Quote.deficitcharge = payload.BRM736[0].data[3].value;
                payload.Quote.ratedweight = payload.BRM736[0].data[4].value;
                payload.Quote.totalfreight = payload.BRM736[0].data[5].value;
                payload.Quote.discamount = payload.BRM736[0].data[6].value;
                payload.Quote.net = payload.BRM736[0].data[7].value;
                payload.Quote.fuelsurchargepercent = payload.BRM736[0].data[8].value;
                payload.Quote.fuelsurchargeamount = payload.BRM736[0].data[9].value;
                payload.Quote.totalcharge = payload.BRM736[0].data[10].value;
                payload.Quote.tariff = payload.BRM736[0].data[11].value;
                payload.Quote.effdate = payload.BRM736[0].data[12].value;
                payload.Quote.message = payload.BRM736[0].data[13].value;
                //payload.Quote.showrates? = payload.BRM736[0].data[14].value;
                payload.Quote.ratemessage = payload.BRM736[0].data[15].value;
                payload.Quote.discflag = payload.BRM736[0].data[16].value;
                //payload.Quote.crqslsmsg = payload.BRM736[0].data[17].value;
                payload.Quote.discpercent = payload.BRM736[0].data[18].value;
                payload.Quote.xgoldmsg = payload.BRM736[0].data[19].value;
                payload.Quote.xpressgoldcurrency = payload.BRM736[0].data[20].value;
                payload.Quote.rateexception = payload.BRM736[0].data[21].value;
                cb();
            }
        });
    } else {
        console.log("Rate failed: " + payload.Error + " BRM736");
        fail();
    }
}

exports.callBRM738 = function (conn, payload, cb, fail) {
    // Define DB connections
    //console.log("Test");
    console.debug("--------------------------------------------");
    console.debug("Quote " + payload.Quote.quote);
    console.debug("Line " + payload.Quote.items[0].line);
    console.debug("Class " + payload.Quote.items[0].shippingclass);
    console.debug("Fak " + payload.Quote.items[0].fak);
    console.debug("Weight " + payload.Quote.items[0].weight);
    console.debug("--------------------------------------------");
    var pgm = new xt.iPgm("BRM738", {
        "lib": "BR"
    });

    // Check Parameters
    ////console.time('BRM738');

    if (!isNaN(payload.Quote.quote)) {
        pgm.addParam(payload.Quote.quote, "8A");
    } else {
        payload.Error = "Invalid Quote";
        fail();
    }

    if (!isNaN(payload.Quote.items[0].line)) {
        pgm.addParam(payload.Quote.items[0].line, "3A");
    } else {
        payload.Error = "Invalid Line Number";
        fail();
    }

    if (!isNaN(payload.Quote.items[0].shippingclass)) {
        pgm.addParam(payload.Quote.items[0].shippingclass, "4A");
    } else {
        payload.Error = "Invalid Class";
        fail();
    }

    if (!isNaN(payload.Quote.items[0].fak)) {
        pgm.addParam(payload.Quote.items[0].fak, "4A");
    } else {
        payload.Error = "Invalid Fak";
        fail();
    }

    if (!isNaN(payload.Quote.items[0].weight)) {
        pgm.addParam(payload.Quote.items[0].weight, "6A");
    } else {
        payload.Error = "Invalid Weight";
        fail();
    }

    pgm.addParam("", "6A"); // Rate
    pgm.addParam("", "8A"); // Revenue
    pgm.addParam("", "8A"); // Code
    pgm.addParam("", "35A"); // Desc
    pgm.addParam("", "1A"); // Type

    if (payload.Error == undefined) {

        console.debug(pgm.toXML());
        conn.add(pgm.toXML());
        conn.run(function (rs, err) {
            if (err) {
                //console.log("ERR90004 " + err.toString());
                payload.Error = "ERR90004 " + err.toString();
                fail();
            } else {
                ////console.timeEnd('BRM738');
                //console.debug("--------------------------------------------");
                payload.BRM738 = JSON.parse(JSON.stringify(xt.xmlToJson(rs)));
                //console.log("BRM738 " + JSON.stringify(payload.BRM738[0].data));
                //payload.Quote.deficitweight = payload.BRM738[0].data[1].value;
                //payload.Quote.deficitrate = payload.BRM738[0].data[2].value;
                //payload.Quote.deficitcharge = payload.BRM738[0].data[3].value;
                //payload.Quote.ratedweight = payload.BRM738[0].data[4].value;
                //payload.Quote.totalfreight = payload.BRM738[0].data[5].value;
                //payload.Quote.discamount = payload.BRM738[0].data[6].value;
                cb();
            }
        });
    } else {
        consolde.log("Rate failed: " + payload.Error + " BRM738");
        fail();
    }
}