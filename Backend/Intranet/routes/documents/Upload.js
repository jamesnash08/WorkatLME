//var fs = require('fs');
var express = require('express');
var router = express.Router();
var multer = require("multer");
//var uploads = multer();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/www/lmelocal/htdocs/Documents/' + req.headers.path + "/")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
  }
})

const upload = multer({storage:storage});

router.post("/", upload.single('uploads'), function(req, res) {
	console.log(JSON.stringify(req.file));
	res.json({success: true, message: JSON.stringify(req.file)});
});

module.exports = router;