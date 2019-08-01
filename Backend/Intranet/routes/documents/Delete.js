var fs = require('fs');
var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {
	//SET VARIABLES HERE
	

	if(req.body.path != null && req.body.file != null){
		var file = req.body.file;
		var path = "/www/lmelocal/htdocs/Documents/" + req.body.path + "/" + file;
		fs.unlink(path, (err) => {
			if (err) 
				res.send(JSON.stringify({"result":path}));
				//throw err;
				res.send(JSON.stringify({"result":"File was deleted"}));
		  });

	}else
		res.send(JSON.stringify({"error":"File not set"}));


});

module.exports = router;
