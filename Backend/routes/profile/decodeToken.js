//let db 			= require('idb-connector');
let express = require('express');
let auth = require('./AuthToken.ts');
let router = express.Router();

router.post('/', function (req, res, next) {

    //SET VARIABLES HERE
    var results = [];
    var user = "";
    var password = "";
    var token = "";
    var loginState = false;

    if ((req.body.token != null) && (req.body.token != undefined)) {

        console.time('decodeToken');

        auth.decodeToken(req.body.token, (message, details) => {

            console.timeEnd('decodeToken');

            if (message.Success != null) {
                console.debug("Login Token Success!");
                this.results = {
                    "Success": "Logged in as " + details.user,
                    "UserId": details.user,
                    "SiteKey": details.siteKeys,
                    "Features": details.features,
                    "CustomerNumbers": details.customerNumbers,
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
            "loginState": false,
            "results": ""
        };
        res.send(JSON.stringify(this.results));
    }

});

module.exports = router;