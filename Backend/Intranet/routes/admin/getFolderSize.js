var fs = require('fs'),
    path = require('path'),
    async = require('async');
const getSize = require('get-folder-size');
var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	servResponse(req,res,next,req.query.directory);
});
router.post('/',function(req,res,next){
	servResponse(req,res,next, req.body.directory);
});
function servResponse(req, res, next, directory) {
	if(directory <= "")
		directory = "/";
	readDir(directory,function(err,data){
		console.log("sorting data");
		data.sort((b, a) => parseFloat(a.sizeGB) - parseFloat(b.sizeGB));
		res.send(JSON.stringify(data));
	});
}

function readDir(dir, cb) {
	var sizes = [];
	fs.readdir(dir, function (err, list) {
		if (err) {
			console.log("Error " + err.toString());
			//return cb(err);
		}

		async.forEach(
			list,
			function (diritem, callback) {
				var item = path.join(dir, diritem);
				fs.lstat(item, function (err, stats) {
					if (!err) {
						//&& stats.isDirectory()
						getSize(item, (err, size) => {
							//if (err) { throw err; }
							// console.log("Folder " + item + " is " + size + ' bytes');
							var sizeGB = (size / 1024 / 1024 / 1024).toFixed(2);
							
							if(Number(sizeGB) >= 1){
							sizes.push({"path":item,"sizeGB":sizeGB});
							//console.log("Folder " + item + " is " + sizeGB + ' GB');
							}
							callback();
						});
					}else
						callback();
				});
				},
				function (err) {
					if (err)
						console.log("Error " + err.toString());
					cb(err,sizes);                    
				}
		);
	});
}

module.exports = router;
