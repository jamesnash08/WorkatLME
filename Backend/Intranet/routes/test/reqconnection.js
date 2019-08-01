var express = require('express');
var router = express.Router();


router.get('/',function(req,res,next){
	servResponse(req,res,next);
});
router.post('/',function(req,res,next){
	servResponse(req,res,next);
});


function servResponse(req, res, next) {
	//SET VARIABLES HERE
	console.log(req.connection);
	res.send(req.connection.toString());
	//res.send("test");
}

module.exports = router;
