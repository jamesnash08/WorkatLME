var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	if (req.query.pro > "" && req.query.pro != null) {
		var xt = require("itoolkit");
		var conn = new xt.iConn("*LOCAL");
		var pgm = new xt.iPgm("CSX701CL", {
			"lib": "CS"
		});
		pgm.addParam(req.query.pro.toString(), "10a");
		pgm.addParam("", "4a");
		pgm.addParam("", "120a");
		conn.add(pgm.toXML());
		conn.setTimeout(60);
		conn.run(function (rsp) {
			var results = JSON.parse(JSON.stringify(xt.xmlToJson(rsp)));
			//console.log(results[0].data[2].value);
			res.send(JSON.stringify(results[0].data[2].value));
		});
	} else {
		res.send("Pro Not set");
	}
});
module.exports = router;