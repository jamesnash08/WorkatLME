//let db 			= require('/QOpenSys/QIBM/ProdData/OPS/Node6/os400/db2i/lib/db2a');
let express = require('express');
let auth = require('./AuthToken.ts');
let router = express.Router();

router.post('/', function (req, res, next) {

    //SET VARIABLES HERE
    var results = [];
    var user = "";
    var password = "";
    var userEmail = "";
    var intTerm = "";
    var intAuth = "";
    var token = "";
    var loginState = false;

    if ((req.body.token != null) && (req.body.token != undefined)) {

        console.time('decodeToken');

        auth.decodeToken(req.body.token, (message, details) => {

            console.timeEnd('decodeToken');

            if (message.Success != null) {
                console.debug("Login Token Success!");
                this.results = {
                    "Success": "Logged in!!",
                    "user": details.user,
                    "userEmail": details.email,
                    "intTrm": details.intTrm,
                    "intAuth": details.intAuth,
                    "loginState": true,
                    "results": message
                };

            } else if (message.Expired != null) {
                console.debug("Login Token Expired!");
                this.results = {
                    "Error": "Logged out Token Expired!!",
                    "user": details.user,
                    "loginState": false,
                    "results": message
                };

            } else if (massage.Error != null) {
                console.debug("Login Token Exception!");
                this.results = {
                    "Error": "Login Failed Exception!!",
                    "user": details.user,
                    "loginState": false,
                    "results": message
                };
            }

            res.send(JSON.stringify(this.results));

        });

    } else {
        console.debug("Not Logged in!!");
        this.results = {
            "Error": "Not logged in!!",
            "user": details.user,
            "userEmail": details.email,
            "intTrm": "",
            "intAuth": "",
            "loginState": false,
            "results": ""
        };
        res.send(JSON.stringify(this.results));
    }

});

module.exports = router;