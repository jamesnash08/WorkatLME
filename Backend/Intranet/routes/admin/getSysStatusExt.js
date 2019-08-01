var xt = require("/QOpenSys/QIBM/ProdData/OPS/Node6/os400/xstoolkit/lib/itoolkit");
var wk = require("/QOpenSys/QIBM/ProdData/OPS/Node6/os400/xstoolkit/lib/iwork");
var express = require('express');
var router = express.Router();


router.get('/',function(req,res,next){
	servResponse(req,res,next);
});
router.post('/',function(req,res,next){
	servResponse(req,res,next);
});


function servResponse(req, res, next) {
	var conn = new xt.iConn("*LOCAL", "DPIOPS", "CHEX");
	var work = new wk.iWork(conn);
	//SET VARIABLES HERE
	work.getSysStatusExt(function(output) {
		res.send(JSON.stringify(output));
	});  // asynchronous
			
	
}

module.exports = router;
