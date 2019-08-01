//var xml = require('fs').readFileSync('/QIBM/UserData/WebSphere/AppServer/V85/Express/profiles/LMEAPI/installedApps/LMEWEB_LME4MEProd/NewShippingEAR.ear/NewShippingWar.war/wsdl/com/lme/shipping/webservice/ShipmentTracking.wsdl','utf8');
const wsdlTracking = require(__dirname + "/routes/tracking/wsdlTracking");
const wsdlPickup = require(__dirname + "/routes/pickup/wsdlPickup");
//const wsdlPricing = require(__dirname + "/routes/rate/wsdlPricing");
const rateSubmit = require(__dirname + "/routes/rate/rateSubmit");

var trackingXML = require('fs').readFileSync(__dirname + '/wsdl/LMEAPI_ShipmentTracking.wsdl', 'utf8');
var pickupXML = require('fs').readFileSync(__dirname + '/wsdl/PickupRequestMethods.wsdl', 'utf8');
var pickup2XML = require('fs').readFileSync(__dirname + '/wsdl/PickupRequestMethodsV2.wsdl', 'utf8');
var pricingXML = require('fs').readFileSync(__dirname + '/wsdl/CRIMethods.2.wsdl', 'utf8');

var pricingHit = {
	Rate: 0,
	Static: 0,
	Lookup: 0,
	Success: 0
};
var pickupHit = 0;
var trackingHit = 0;

var trackingService = {
	ShipmentTrackingService: {
		ShipmentTrackingSoapBinding: {
			getShipmentByPro: function (args, callback) {
				//console.log(args);
				wsdlTracking.getShipmentByPro((res) => {
					callback(res);
				}, args.in_pro, "PRO");
			},
			getShipmentsByBL: function (args, callback) {
				//console.log(args);
				wsdlTracking.getShipmentByPro((res) => {
					callback(res);
				}, args.in_bl, "BOL");
			}
		}
	}
};

var pickupService = {
	PickupRequestMethodsV2Service: {
		PickupRequestMethodsV2SoapBinding: {
			RequestPickup: function (args, callback) {
				wsdlPickup.requestPickup((res) => {
					callback(res);
				}, args);
			},
			RequestPickup_v2: function (args, callback) {
				wsdlPickup.requestPickup2((res) => {
					callback(res);
				}, args);
			}
		}
	}
};

var pricingService = {
	CRIMethodsService: {
		CRIMethods: {
			getCustomerRate: function (args, callback) {
				pricingHit.Rate++;
				try {
					args.criIn['UID'] = pricingHit.Rate + pricingHit.Static;
					console.time("getCustomerRate" + args.criIn['UID']);
					console.log(JSON.stringify(args));
					args.criIn['type'] = "OLD";

					rateSubmit.submitRate((payload) => {
						formatRate(payload, callback);
						if (payload.Quote != undefined && payload.quote != undefined) {
							console.log("Quote submit: " + payload.Quote.quote);
							console.timeEnd("getCustomerRate" + payload.Quote.UID);
						}
					}, args.criIn);
				} catch (e) {
					callback({
						Error: e
					});
				}
			},
			getCustomerRateStatic: function (args, callback) {
				pricingHit.Static++;
				try {
					args.criInStatic['type'] = "STATIC";
					args.criInStatic['UID'] = pricingHit.Rate + pricingHit.Static;
					console.time("getCustomerRateStatic" + args.criInStatic['UID']);
					console.log("STATIC: " + JSON.stringify(args));

					rateSubmit.submitRate((payload) => {
						formatRate(payload, callback);
						if (payload.Quote != undefined && payload.quote != undefined) {
							console.log("Quote submit: " + payload.Quote.quote);
							console.timeEnd("getCustomerRateStatic" + payload.Quote.UID);
						}
					}, args.criInStatic);
				} catch (e) {
					callback({
						Error: e
					});
				}
			},
			getCustomerRateByQuoteNumber: function (args, callback) {
				pricingHit.Lookup++;
				try {
					args['type'] = "LOOKUP";
					args.criInStatic['UID'] = pricingHit.Rate + pricingHit.Static;
					console.log(JSON.stringify(args));
					rateSubmit.submitRate((payload) => {
						formatRate(payload, callback);
						if (payload.Quote != undefined && payload.quote != undefined) {
							console.log("Quote submit: " + payload.Quote.quote);
							console.timeEnd("getCustomerRateByQuoteNumber" + payload.Quote.UID);
						}
					}, args.criInStatic);
				} catch (e) {
					callback({
						Error: e
					});
				}
			}
		}
	}
};

function formatRate(payload, callback) {
	var msg = {};
	//msg = payload;

	//console.log("FormatRate");
	//console.log(payload);
	if (payload.Error) {
		switch (payload.Error) {
			case "Input is null.":
				msg = payloadFault("GENEX001", payload.Error, []);
				break;
			case "could not get connection to validate user.":
				msg = payloadFault("GENEX002", payload.Error, []);
				break;
			case "Username is NULL or Blank":
				msg = payloadFault("AUTEX001", payload.Error, []);
				break;
			case "Could not validate username: {0} and password {1}.":
				msg = payloadFault("AUTEX004", payload.Error, [payload.Quote.userid, payload.Quote.password]);
				break;
			case "Origin City is empty.":
				msg = payloadFault("VLDEX001", payload.Error, []);
				break;
			case "Origin State is empty.":
				msg = payloadFault("VLDEX002", payload.Error, []);
				break;
			case "Origin Zip is empty.":
				msg = payloadFault("VLDEX003", payload.Error, []);
				break;
			case "Destination City is empty.":
				msg = payloadFault("VLDEX004", payload.Error, []);
				break;
			case "Destination State is empty.":
				msg = payloadFault("VLDEX005", payload.Error, []);
				break;
			case "Destination Zip is empty.":
				msg = payloadFault("VLDEX006", payload.Error, []);
				break;
			case "Customer Type is empty.":
				msg = payloadFault("VLDEX007", payload.Error, []);
				break;
			case "CustomerType: {0} is not valid.  Please use the values S=Shipper, C=Consignee, or T=Third Party Payor.":
				msg = payloadFault("VLDEX008", payload.Error, [payload.Quote.customertype]);
				break;
			case "PaymentType is empty.":
				msg = payloadFault("VLDEX009", payload.Error, []);
				break;
			case "PaymentType: {0} is not valid. Please use the values P=Prepaid or C=Collect":
				msg = payloadFault("VLDEX010", payload.Error, [payload.Quote.paymenttype]);
				break;
			case "Origin Zip: {0} is not valid for account: {1}.":
				msg = payloadFault("VLDEX011", payload.Error, [payload.Quote.origbean.zip, payload.Quote.accountnumber]);
				break;
			case "Destination Zip: {0} is not valid for account: {1}.":
				msg = payloadFault("VLDEX012", payload.Error, [payload.Quote.destbean.zip, payload.Quote.accountnumber]);
				break;
			case "Cannot have paymentType: {0} when customerType is {1}.":
				msg = payloadFault("VLDEX013", payload.Error, [payload.Quote.paymenttype, payload.Quote.customertype]);
				break;
			case "ShipDate: must be in the format MM/DD/YYYY":
				msg = payloadFault("VLDEX014", payload.Error, []);
				break;
			case "Invalid origin Zip: {0}":
				msg = payloadFault("VLDEX015", payload.Error, [payload.Quote.origbean.zip]);
				break;
			case "Multiple Cities found for origin zipcode: {0}. An Origin City and State must be specified when Multiple are found.":
				msg = payloadFault("VLDEX016", payload.Error, [payload.Quote.origbean.zip]);
				break;
			case "Invalid destination Zip: {0}":
				msg = payloadFault("VLDEX017", payload.Error, [payload.Quote.destbean.zip]);
				break;
			case "Multiple Cities found for destination zipcode: {0}. A Destination City and State must be specified when Multiple are found.":
				msg = payloadFault("VLDEX018", payload.Error, [payload.Quote.destbean.zip]);
				break;
			case "You must provide at least one commodity line.":
				msg = payloadFault("VLDEX019", payload.Error, []);
				break;
			case "You must provide a commodity class for commodity line.":
				msg = payloadFault("VLDEX020", payload.Error, []);
				break;
			case "You must provide a commodity weight for commodity line.":
				msg = payloadFault("VLDEX021", payload.Error, []);
				break;
			case "Commodity Class: is invalid.":
				msg = payloadFault("VLDEX022", payload.Error, []);
				break;
			case "You must specify a Full Value Coverage amount that is greater than 0 and less than $100,000 when you specify Y for FullValueCoverage.":
				msg = payloadFault("VLDEX023", payload.Error, []);
				break;
			case "COD: {0} is not valid. Please use the values Y=Yes or N=No.":
				msg = payloadFault("VLDEX024", payload.Error, [payload.Quote.CODflag]);
				break;
			case "CODPaymentType: {0} is not valid. Please use the values P=Prepaid or C=Collect.":
				msg = payloadFault("VLDEX025", payload.Error, [payload.Quote.codfeepaymenttype]);
				break;
			case "Hazmat: is not valid. Please use the values Y=Yes or N=No.":
				msg = payloadFault("VLDEX026", payload.Error, []);
				break;
			case "PalletType is null or blank and Y has been specified for usePalletPricing.":
				msg = payloadFault("VLDEX027", payload.Error, []);
				break;
			case "Invalid entry for PalletType: {0}. Please use one of the following values: PALLETS, CRATES, DRUMS, TOTES, TRACKS.":
				msg = payloadFault("VLDEX028", payload.Error, [payload.Quote.HandlingUnit]);
				break;
			case "PalletCount must be a positive integer when Y has been specified for usePalletPricing.":
				msg = payloadFault("VLDEX029", payload.Error, []);
				break;
			case "Pallet pricing is available for this account and zip code. Please specify Y or N for the parameter usePalletPricing.":
				msg = payloadFault("VLDEX030", payload.Error, []);
				break;
			case "Both prvtRsdncPckup and lmtdAccessPckup cannot specify Y on the same inquiry.":
				msg = payloadFault("VLDEX031", payload.Error, []);
				break;
			case "Both prvtRsdncDel and lmtAccessDel cannot specify Y on the same inquiry.":
				msg = payloadFault("VLDEX032", payload.Error, []);
				break;
			case "callConsgBfrDel or callforCarrierConv cannot specify Y when callforAppmnt specifies Y.":
				msg = payloadFault("VLDEX033", payload.Error, []);
				break;
			case "callforCarrierConv cannot specify Y when callConsgBfrDel specifies Y.":
				msg = payloadFault("VLDEX034", payload.Error, []);
				break;
			case "Unable to ship with collect payment terms at this destination.":
				msg = payloadFault("VLDEX036", payload.Error, []);
				break;
			case "Unable to ship with prepaid payment terms at this origin.":
				msg = payloadFault("VLDEX036", payload.Error, []);
				break;
			default:
				msg = payloadFault("GENEX001", payload.Error, []);

		}

	} else if (payload.Quote != undefined) {
		pricingHit.Success++;

		msg.accCharges = [];
		msg.arrivalDate = isoDateFormat(payload.Quote.arvdate);
		msg.commCharges = [];

		//payload.Quote.items.forEach(function (items) {
		//console.log(payload.Quote.items);
		for (var i = 0; i < payload.Quote.items.length; i++) {
			var items = payload.Quote.items[i];
			items.shippingclass == 925 ? "92.5" : items.shippingclass;
			items.shippingclass == 775 ? "77.5" : items.shippingclass;
			msg.commCharges.push({
				commCharge: (Number(items.charges) / 100).toFixed(2),
				commClass: items.fak > 0 ? items.shippingclass + " FAK - " + Number(items.fak) / 10 : Number(items.shippingclass).toFixed(0),
				commWeight: Number(items.weight),
				ratePerCWT: items.ratepercwt == "MIN" ? "MIN" : "$" + items.ratepercwt
			});
			//msg.commCharges[msg.commCharges.length] =  newCommItems;
			//console.log(newCommItems);
		}
		//});
		payload.Quote.accs.forEach(function (items) {
			var newAccItems = {};
			if (items.desc != "DECLARED VALUE") {
				newAccItems.accCharge = items.charges > 0 ? (Number(items.charges) / 100).toFixed(2) : "0.00";
				newAccItems.accText = items.desc;
			} else {
				newAccItems.accCharge = "0.00";
				newAccItems.accText = items.desc + " $" + items.charges / 100;
			}
			msg.accCharges.push(newAccItems);
		});
		//console.log(JSON.stringify(msg.commCharges));


		msg.destCityState = payload.Quote.destbean.city.trim() + ", " + payload.Quote.destbean.state;
		msg.destService = payload.Quote.dstserv;
		msg.destTermFax = payload.Quote.destbean.termfax;
		msg.destTerminal = payload.Quote.destbean.route + "-" + payload.Quote.destbean.termname.trim() + "-" + payload.Quote.destbean.terminalnumber;
		msg.destTermPhone = "800-888-4950";
		msg.destZip = payload.Quote.destbean.zip;
		msg.discountAmount = (Number(payload.Quote.discamount) / 100).toFixed(2);
		msg.discountPercent = (Number(payload.Quote.discpercent) / 100).toFixed(1);
		msg.fuelSurcharge = (Number(payload.Quote.fuelsurchargeamount) / 100).toFixed(2);
		msg.fuelSurchargePercent = (Number(payload.Quote.fuelsurchargepercent) / 100).toFixed(1);
		msg.netCharge = (Number(payload.Quote.net) / 100).toFixed(2);
		msg.netChargeTextMsg = payload.Quote.message;
		msg.origCityState = payload.Quote.origbean.city.trim() + ", " + payload.Quote.origbean.state;
		msg.origService = payload.Quote.orgserv;
		msg.origTermFax = payload.Quote.origbean.termfax;
		msg.origTerminal = payload.Quote.origbean.route + "-" + payload.Quote.origbean.termname.trim() + "-" + payload.Quote.origbean.terminalnumber;
		msg.origTermPhone = "800-888-4950";
		msg.origZip = payload.Quote.origbean.zip;
		msg.pickupDate = isoDateFormat(payload.Quote.shipdate);
		msg.quoteNumber = payload.Quote.quote;
		msg.serviceDay = Number(payload.Quote.days) + Number(payload.Quote.holidaydays) + Number(payload.Quote.specialextradays) + Number(payload.Quote.extradays);
		msg.subTotal = (Number(payload.Quote.totalfreight) / 100).toFixed(2);
		msg.tariff = payload.Quote.tariff;
		msg.tariffEffectiveDate = payload.Quote.effdate.substring(0, 2) + "/" + payload.Quote.effdate.substring(2, 4) + "/" + payload.Quote.effdate.substring(4, 6);
		msg.totalCharge = (Number(payload.Quote.totalcharge) / 100).toFixed(2);
		msg.ratedAsWeight = Number(payload.Quote.ratedweight).toFixed(2);
		msg.destTerm800 = "800-888-4950";
		msg.origTerm800 = "800-888-4950";
		msg.deficitCharge = (Number(payload.Quote.deficitcharge) / 100).toFixed(2);
		msg.deficitRate = (Number(payload.Quote.deficitrate) / 100).toFixed(2);
		msg.deficitWeight = Number(payload.Quote.deficitweight).toFixed(0);

	}


	callback({
		getCustomerRateReturn: msg
	});

}

function payloadFault(fault, error, arr) {
	var payload = {
		faultcode: "CRIException",
		faulstring: "com.lme.webservice.CRIException",
		detail: {
			CRIException: {
				errorCode: fault,
				errorDescription: error,

			}
		}
	}
	payload.detail.CRIException.variables = [];
	if (arr.length > 0) {
		for (var i = 0; i < arr.length; i++) {
			payload.detail.CRIException.variables.push(arr[i]);
		}
	} else
		payload.detail.CRIException.variables.push(" ");
	return payload;
}

function isoDateFormat(date) {

	date = date.substring(4, 6) + "/" + date.substring(6) + "/" + date.substring(0, 4);

	return date;
}

module.exports = {
	trackingService: trackingService,
	trackingXML: trackingXML,
	pickupService: pickupService,
	pricingService: pricingService,
	pickupXML: pickupXML,
	pickup2XML: pickup2XML,
	pricingXML: pricingXML,
	pricingHit: pricingHit
};
