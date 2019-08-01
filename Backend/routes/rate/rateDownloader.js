var express = require('express');
var router = express.Router();
var xt = require("itoolkit");

router.get('/', function (req, res, next) {
	servResponse(req, res, next, req.query.user);
});
router.post('/', function (req, res, next) {
	servResponse(req, res, next, req.body.user);
});

function servResponse(req, res, next, user) {
	var conn = new xt.iConn("DPI", "DPIOPS", "CHEX");
	var pgm = new xt.iPgm("BRR503", {
		"lib": "BR"
	});
	pgm.addParam(user, "10a");
	pgm.addParam(" ", "1a");
	conn.add(pgm.toXML());
	//conn.setTimeout(60);
	conn.run(function (rsp) {
		var results = JSON.parse(JSON.stringify(xt.xmlToJson(rsp)));
		if (results[0].success && results[0].data[1].value == "Y") {
			var pgm2 = new xt.iPgm("BRR502", {
				"lib": "BR"
			});
			pgm2.addParam(user, "10a");
			conn.add(pgm2.toXML());
			//conn.setTimeout(60);
			conn.run(function (rsp2) {
				res.send(JSON.stringify({
					"result": results[0].data[1].value
				}));
			});
		} else {
			res.send(JSON.stringify({
				"result": "N"
			}));
		}
		//res.send(JSON.stringify({"result":results[0].data[1].value}));
	});
}

module.exports = router;