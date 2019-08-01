var fs = require('fs');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {

	//SET VARIABLES HERE
	var results = [];
	var path;

	if(req.query.path != null){
		path = "/www/lmelocal/htdocs/Documents/" + req.query.path;
		fs.readdir(path, function(err, files) {
			if(err){
				res.send(JSON.stringify(err));
			}else{
		 for(var i = 0; i < files.length; i++){
			results[results.length] = {
										"file":files[i],
										"directory": !files[i].includes('.')
									};
		 }
		  res.send(JSON.stringify(results));
			}
		});
	}else
		res.send(JSON.stringify({"error":"no path set"}));


});

module.exports = router;
