var express = require('express');
var router = express.Router();
var xt = require("itoolkit");

router.get('/', function (req, res, next) {
	var name = req.query.name;
	var docn = req.query.docn;
	servResponse(req, res, next, name, docn);
});
router.post('/', function (req, res, next) {
	var name = req.body.name;
	var docn = req.body.docn;
	servResponse(req, res, next, name, docn);
});

function servResponse(req, res, next, name, docn) {
	var path = "/www/lmelocal/htdocs/IMS/";
	var conn = new xt.iConn("*LOCAL");
	var pgm = new xt.iPgm("IMAGETOPDF", {
		"lib": "DPIPGM"
	});
	pgm.addParam(name, "40a");
	pgm.addParam(path, "40a");
	pgm.addParam(Number(docn), "9p0");

	conn.add(pgm.toXML());
	conn.setTimeout(60);
	conn.run(function (rsp) {
		var results = JSON.parse(JSON.stringify(xt.xmlToJson(rsp)));
		res.send(JSON.stringify(results));

	});
}

module.exports = router;