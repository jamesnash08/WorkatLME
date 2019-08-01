function setupPayload(data) {
    if (!data) {
        payload = {
            Error: "Input is null"
        }
        return payload;
    }
    //set fields up on payload
    var payload = {};

    if (data.quoteNumber != undefined) {
        payload["Quote"] = {
            destscacname: "",
            arrivedate: "",
            origroute: "",
            destbean: {
                zip: "",
                termstate: "",
                terminalnumber: "",
                scacname: "",
                state: "",
                interlinename: "",
                type: "",
                termfax: "",
                termname: "",
                city: "",
                address: "",
                scac: "",
                route: "",
                termcity: "",
                carrier: "",
                interlinecode: "",
                termzip: "",
                termphone: "800-888-4950"
            },
            destscac: "",
            offshore: "",
            standardtoshow: "",
            shipdate: "",
            messagestatus: "",
            asterisktoshow: "",
            specialextradays: "",
            origscac: "",
            message: "",
            holidaydays: "",
            messagetoshow: "",
            servicetype: "",
            days: "",
            extradays: "",
            rpgerrorflag: "",
            origbean: {
                zip: "",
                termstate: "",
                terminalnumber: "",
                scacname: "",
                state: "",
                interlinename: "",
                type: "",
                termfax: "",
                termname: "",
                city: "",
                address: "",
                scac: "",
                route: "",
                termcity: "",
                carrier: "",
                interlinecode: "",
                termzip: "",
                termphone: "800-888-4950"
            },
            origscacname: "",
            destroute: "",
            showdestscac: "",
            palletPricing: "",
            ratetoshow: "",
            maxpallets: "",
            userid: data.username,
            password: data.password,
            fuelsurchargepercent: "",
            orga: "",
            message2: "",
            hazmat: "",
            customertype: "",
            effdate: "",
            discpercent: "",
            custinfo: {
                zip: "",
                name: "",
                state: "",
                account: "",
                city: ""
            },
            showmsg: "",
            dstserv: "",
            protectFreeze: "",
            deficitweight: "",
            showAsk: "",
            codfeepaymenttype: "",
            BydScac: "",
            longhtmlmessage: "",
            orgserv: "",
            totalfreight: "",
            dsta: "",
            floor: "",
            items: [],
            serv_msg: "",
            AdbScac: "",
            ratests: "",
            deficitcharge: "",
            pType: "",
            discflag: "",
            paymenttype: "",
            net: "",
            HandlingUnit: "",
            transitstatus: "",
            accs: [],
            ratemessage: "",
            quote: data.quoteNumber,
            tariff: "",
            accountnumber: "",
            svcstd: "",
            discamount: "",
            customername: "",
            showpallets: "",
            fuelsurchargeamount: "",
            totalweight: "",
            arvdate: "",
            pallets: "",
            palletCount: "",
            palletType: "",
            usePalletPricing: "",
            xpressgoldcurrency: "",
            UnitCode1: "",
            CODflag: "",
            replace: "",
            UnitCode2: "",
            ratedweight: "",
            deficitrate: "",
            codamt: "",
            totalcharge: "",
            showStd: "",
            numHandlingUnits: "",
            xgoldmsg: "",
        };

    } else {

        payload["DayBean"] = {}
        payload["Quote"] = {
            destscacname: "",
            arrivedate: "",
            origroute: "",
            destbean: {
                zip: data.destZip,
                termstate: "",
                terminalnumber: "",
                scacname: "",
                state: data.destState,
                interlinename: "",
                type: "",
                termfax: "",
                termname: "",
                city: data.destCity.toUpperCase(),
                address: "",
                scac: "",
                route: "",
                termcity: "",
                carrier: "",
                interlinecode: "",
                termzip: "",
                termphone: "800-888-4950"
            },
            destscac: "",
            offshore: "",
            standardtoshow: "",
            shipdate: getDate(data.shipDate),
            messagestatus: "",
            asterisktoshow: "",
            specialextradays: "",
            origscac: "",
            message: "",
            holidaydays: "",
            messagetoshow: "",
            servicetype: "",
            days: "",
            extradays: "",
            rpgerrorflag: "",
            origbean: {
                zip: data.origZip,
                termstate: "",
                terminalnumber: "",
                scacname: "",
                state: data.origState,
                interlinename: "",
                type: "",
                termfax: "",
                termname: "",
                city: data.origCity.toUpperCase(),
                address: "",
                scac: "",
                route: "",
                termcity: "",
                carrier: "",
                interlinecode: "",
                termzip: "",
                termphone: "800-888-4950"
            },
            origscacname: "",
            destroute: "",
            showdestscac: "",
            palletPricing: data.usePalletPricing,
            ratetoshow: "",
            maxpallets: "",
            palletCount: "",
            palletType: "",
            usePalletPricing: "",
            userid: data.username,
            password: data.password,
            fuelsurchargepercent: "",
            orga: "",
            message2: "",
            hazmat: data.hazMat ? data.hazMat : "N",
            customertype: data.customerType,
            effdate: "",
            discpercent: "",
            custinfo: {
                zip: "",
                name: "",
                state: "",
                account: "",
                city: ""
            },
            showmsg: "",
            dstserv: "",
            protectFreeze: data.protectFreeze,
            deficitweight: "",
            showAsk: "",
            codfeepaymenttype: data.CODPayTerms,
            BydScac: "",
            longhtmlmessage: "",
            orgserv: "",
            totalfreight: "",
            dsta: "",
            floor: "",
            items: [],
            serv_msg: "",
            AdbScac: "",
            ratests: "",
            deficitcharge: "",
            pType: "",
            discflag: "",
            paymenttype: data.paymentType,
            net: "",
            HandlingUnit: data.HandlingUnit > "" ? data.HandlingUnit : "PALLETS",
            transitstatus: "",
            accs: [],
            ratemessage: "",
            quote: "",
            tariff: "",
            accountnumber: data.accountNumber,
            svcstd: "",
            discamount: "",
            customername: "",
            showpallets: "",
            fuelsurchargeamount: "",
            totalweight: "",
            arvdate: "",
            pallets: "",
            xpressgoldcurrency: "",
            UnitCode1: "",
            CODflag: data.COD,
            replace: "",
            UnitCode2: "",
            ratedweight: "",
            deficitrate: "",
            codamt: data.CODAmount ? Number(data.CODAmount) * 100 : 0,
            totalcharge: "",
            showStd: "",
            numHandlingUnits: data.numHandlingUnits > 0 ? data.numHandlingUnits : data.palletCount,
            xgoldmsg: "",
            UID:data.UID
        }

        //console.log("After setting structure");

        var totweight = 0;

        if (data.type == "STATIC") {
            data.commLines = [];
            for (var i = 1; i <= 10; i++) {

                console.log("commClass: " + data["commClass" + i]);
                console.log("commweight: " + data["commweight" + i]);
                if (data["commClass" + i] > 0 && data["commweight" + 1] > 0)
                    data.commLines.push({
                        commClass: data["commClass" + i],
                        commweight: Number(data["commweight" + i].replace(',', ''))
                    });
                else if (data["commClass" + i] > 0 && data["commweight" + i] != undefined) {
                    payload.Error = "You must provide a commodity weight for commodity line.";
                    // console.log("commodity line " + i);
                } else if (data["commClass" + i] != undefined && data["commweight" + i] > 0) {
                    payload.Error = "You must provide a commodity class for commodity line.";
                    // console.log("commodity line " + i);
                }
            }
            console.log("STATIC COMMODITIES " + JSON.stringify(data.commLines));
        }

        for (var i = 0; i < data.commLines.length; i++) {
            data.commLines[i].commClass = data.commLines[i].commClass.replace(".", "");
            //try {
            data.commLines[i].commweight = Number(data.commLines[i].commweight.toString().replace(',', ''));
            //} catch (e) {
            //    console.log(e.toString());
            //}
            addQuoteItem(payload, data.commLines[i]);
            totweight = Number(totweight) + Number(data.commLines[i].commweight);
        }
        console.log("Total weight " + totweight);
        payload.Quote.totalweight = totweight;

        //console.log("Pallet Count: " + data.palletCount);
        //console.log("Pallet Type: " + data.palletType);
        //console.log("Pallet Pricing: " + data.usePalletPricing);
        if (data.palletCount != undefined && data.palletCount.length > 0) {
            payload.Quote.palletCount = data.palletCount;
        }
        if (data.palletType != undefined && data.palletType.length > 0) {
            payload.Quote.palletType = data.palletType.toUpperCase();
        }

        if (data.usePalletPricing != undefined && data.usePalletPricing.length > 0) {
            payload.Quote.usePalletPricing = data.usePalletPricing;
        }

        //if (data.type == "OLD") {
        if (data.callforAppmnt == "Y")
            addQuoteAccs(payload, "NC", "");
        if (data.callforCarrierConv == "Y")
            addQuoteAccs(payload, "NC", "");
        if (data.callConsgBfrDel == "Y")
            addQuoteAccs(payload, "NC", "");
        if (data.fullValueCoverage == "Y")
            addQuoteAccs(payload, "VL", data.fvcAmount);
        if (data.insideDel == "Y" && data.paymentType == 'C')
            addQuoteAccs(payload, "IDC", "");
        if (data.insideDel == "Y" && data.paymentType == 'P')
            addQuoteAccs(payload, "IDP", "");
        if (data.insidePckup == "Y" && data.paymentType == 'C')
            addQuoteAccs(payload, "IPC", "");
        if (data.insidePckup == "Y" && data.paymentType == 'P')
            addQuoteAccs(payload, "IPP", "");
        if (data.lftgtReqDel == "Y")
            addQuoteAccs(payload, "LGD", "");
        if (data.lftgtRqrdPckup == "Y")
            addQuoteAccs(payload, "LGO", "");
        if (data.lmtAccessDel == "Y")
            addQuoteAccs(payload, "LAD", "");
        if (data.lmtdAccessPckup == "Y")
            addQuoteAccs(payload, "LAO", "");
        if (data.prvtRsdncDel == "Y" && data.paymentType == 'C')
            addQuoteAccs(payload, "HDC", "");
        if (data.prvtRsdncDel == "Y" && data.paymentType == 'P')
            addQuoteAccs(payload, "HDP", "");
        if (data.prvtRsdncPckup == "Y" && data.paymentType == 'C')
            addQuoteAccs(payload, "HPC", "");
        if (data.prvtRsdncPckup == "Y" && data.paymentType == 'P')
            addQuoteAccs(payload, "HPP", "");
        //} else {

        // }
        if (!payload.Quote.userid)
            payload.Error = "Username is NULL or Blank";
        else if (!payload.Quote.password)
            payload.Error = "Password is NULL or Blank";
        else if (!payload.Quote.origbean.city)
            payload.Error = "Origin City is empty.";
        else if (!payload.Quote.origbean.state)
            payload.Error = "Origin State is empty.";
        else if (!payload.Quote.origbean.zip)
            payload.Error = "Origin Zip is empty.";
        else if (!payload.Quote.destbean.city)
            payload.Error = "Destination City is empty.";
        else if (!payload.Quote.destbean.state)
            payload.Error = "Destination State is empty.";
        else if (!payload.Quote.destbean.zip)
            payload.Error = "Destination Zip is empty.";
        else if (!payload.Quote.customertype)
            payload.Error = "Customer Type is empty.";
        else if (!payload.Quote.customertype)
            payload.Error = "CustomerType: {0} is not valid.  Please use the values S=Shipper, C=Consignee, or T=Third Party Payor.";
        else if (!payload.Quote.paymenttype)
            payload.Error = "PaymentType is empty.";
        else if (payload.Quote.paymenttype != "P" && payload.Quote.paymenttype != "C")
            payload.Error = "PaymentType: {0} is not valid. Please use the values P=Prepaid or C=Collect";
        else if ((payload.Quote.paymenttype == "P" && payload.Quote.customertype == "C") || (payload.Quote.paymenttype == "C" && payload.Quote.customertype == "S"))
            payload.Error = "Cannot have paymentType: {0} when customerType is {1}.";
        else if (payload.Quote.shipdate == "FAIL")
            payload.Error = "ShipDate: must be in the format MM/DD/YYYY";
        else if (!payload.Quote.items.length || payload.Quote.items.length == 0)
            payload.Error = "You must provide at least one commodity line.";
        else if (data.fullValueCoverage == "Y" && (data.fvcAmount <= 0 || data.fvcAmount > 100000))
            payload.Error = "You must specify a Full Value Coverage amount that is greater than 0 and less than $100,000 when you specify Y for FullValueCoverage.";
        else if (payload.Quote.CODflag != "Y" && payload.Quote.CODflag != "N")
            payload.Error = "COD: {0} is not valid. Please use the values Y=Yes or N=No.";
        else if (payload.Quote.codfeepaymenttype != "P" && payload.Quote.codfeepaymenttype != "C" && payload.Quote.CODflag == "Y")
            payload.Error = "CODPaymentType: {0} is not valid. Please use the values P=Prepaid or C=Collect.";
        else if (payload.Quote.hazmat != "Y" && payload.Quote.hazmat != "N")
            payload.Error = "Hazmat: is not valid. Please use the values Y=Yes or N=No.";
        else if (payload.Quote.palletPricing == "Y" && payload.Quote.HandlingUnit == "")
            payload.Error = "HandlingUnit is null or blank and Y has been specified for usePalletPricing.";
        else if (payload.Quote.palletPricing == "Y" && ["PALLETS", "CRATES", "DRUMS", "TOTES", "TRACKS"].indexOf(payload.Quote.HandlingUnit) == -1)
            payload.Error = "Invalid entry for HandlingUnit: {0}. Please use one of the following values: PALLETS, CRATES, DRUMS, TOTES, TRACKS.";
        else if (payload.Quote.palletPricing == "Y" && payload.Quote.numHandlingUnits <= 0)
            payload.Error = "numHandlingUnits must be a positive integer when Y has been specified for usePalletPricing.";
        else if (data.prvtRsdncPckup == "Y" && data.lmtdAccessPckup == "Y")
            payload.Error = "Both prvtRsdncPckup and lmtdAccessPckup cannot specify Y on the same inquiry.";
        else if (data.prvtRsdncDel == "Y" && data.lmtAccessDel == "Y")
            payload.Error = "Both prvtRsdncDel and lmtAccessDel cannot specify Y on the same inquiry.";
        else if ((data.callConsgBfrDel == "Y" || data.callforCarrierConv == "Y") && data.callforAppmnt == "Y")
            payload.Error = "callConsgBfrDel or callforCarrierConv cannot specify Y when callforAppmnt specifies Y.";
        else if (data.callforCarrierConv == "Y" && data.callConsgBfrDel == "Y")
            payload.Error = "callforCarrierConv cannot specify Y when callConsgBfrDel specifies Y.";
        // console.log("initial setup done");
        if (payload.Error) {
            console.log("Error found in initial setup " + payload.Error);
        }

    }

    return payload;
}

function addQuoteItem(payload, data) {
    payload.Quote.items.push({
        linetype: "Freight",
        charges: "",
        desc: "",
        weight: Number(data.commweight).toFixed(0),
        userid: payload.Quote.userid,
        line: payload.Quote.items.length + payload.Quote.accs.length + 1,
        code: "",
        errflag: "",
        fak: "",
        ratepercwt: "",
        quote: "",
        shippingclass: data.commClass,
        accountnumber: payload.Quote.accountnumber,
        ratetext: ""
    });
    return payload;
}

function addQuoteAccs(payload, data, val) {
    payload.Quote.accs.push({
        linetype: "Accessorial",
        charges: "",
        desc: "",
        weight: val ? val : 0,
        userid: payload.Quote.userid,
        line: payload.Quote.items.length + payload.Quote.accs.length + 1,
        code: data,
        errflag: "",
        fak: "",
        ratepercwt: "",
        quote: "",
        shippingclass: "",
        accountnumber: payload.Quote.accountnumber,
        ratetext: ""
    });
    return payload;
}

function getDate(shipdate) {
    var date;
    if (shipdate.length == 10) {
        if (shipdate.substring(2, 3) == "/" && shipdate.substring(5, 6) == "/")
            date = shipdate.substring(6) + "" + shipdate.substring(0, 2) + "" + shipdate.substring(3, 5);
    } else if (shipdate.length == 9) {
        if (shipdate.substring(1, 2) == "/" && shipdate.substring(4, 5) == "/")
            date = shipdate.substring(5) + "0" + shipdate.substring(0, 1) + "" + shipdate.substring(2, 4);
    } else if (shipdate.length == 8) {
        if (!isNaN(shipdate))
            date = shipdate;
    } else {
        date = "FAIL";
    }
    console.log("Shipment Date " + shipdate + " after conversion " + date);
    return date;
}

module.exports = {
    addQuoteAccs: addQuoteAccs,
    addQuoteItem: addQuoteItem,
    setupPayload: setupPayload
}