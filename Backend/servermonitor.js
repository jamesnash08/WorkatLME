var logger = require(__dirname + "/logger");
console.log = logger.log;
console.error = logger.error;


var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var childProcess = require('child_process');
var fs = require('fs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access-control-allow-origin, access-control-allow-headers, access-control-allow-methods");
    //res.header("Access-Control-Allow-Credentials", true);
    next();
});
app.engine('pug', require('pug').__express);
app.set('view engine', 'pug');

var serverhost = __dirname.toString().indexOf("LMEAPI") > -1 ? '192.168.3.111' :
    __dirname.toString().indexOf("lmenew") > -1 ? '192.168.3.2' :
    __dirname.toString().indexOf("lmetest") > -1 ? '192.168.3.2' :
    '192.168.3.2';

var serverport = __dirname.toString().indexOf("LMEAPI") > -1 ? 9080 :
    __dirname.toString().indexOf("lmenew") > -1 ? 9081 :
    __dirname.toString().indexOf("lmetest") > -1 ? 9082 :
    9083;

if (process.argv[2])
    serverport = process.argv[2];

var child;
var childRunning = false;
var childRestarting = false;
var script = process.argv[3] ? process.argv[3] : 'server';
logger.setServerName(script);
prepScript();

function prepScript() {
    runScript(__dirname + '/' + script + '.js', function (err) {
        if (err) {
            console.log(err);
            childRunning = false;
        }
    });
}

function runScript(scriptPath, callback) {
    var invoked = false;
    child = childProcess.fork(scriptPath);
    childRunning = true;
    console.log("Monitor issued start command.");
    // listen for errors as they may prevent the exit event from firing
    child.on('error', function (err) {
        console.log("error:" + err);
        childRunning = false;
        prepScript();
        // console.log(err);
        if (invoked) return;
        invoked = true;
        callback(err);
    });
    // execute the callback once the process has finished running
    child.on('exit', function (code) {
        console.log("exit");
        childRunning = false;
        if (code) {
            console.log("ERR99999 Server ended due to code: " + code);
        }
        //if(!childRestarting)
        //    checkFilesFirst();        
        //callback(err);
    });
    child.on('close', function (err) {
        if (err == null) {
            childRunning = false;
            prepScript();
        } else
            console.log("ERR99999 error" + err);
    });
    //process.unref();
    child.on('message', function (msg) {
        // console.log("Test log: " + msg.toString());
        if (msg == "RESTART") {
            child.exit(0);
            prepScript();
        }
    });
}

resetAtMidnight();

process.on('SIGINT', function () {
    //child.kill('SIGINT');
    server.close();
    setTimeout(function () {
        process.exit(0)
    }, 200);
});

app.get('/start', function (req, res, next) {
    //Stop currently running instance
    childRestarting = true;
    console.log("Stop command issued");
    child.kill('SIGINT');
    //Start new instance
    setTimeout(function () {
        prepScript();
    }, 100);
    res.send(JSON.stringify({
        "response": "Server is starting"
    }));
});

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    //res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error.pug');
});

//module.exports = app;

var server = app.listen(serverhost, serverport, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("ERR80001 Monitor listening on port: " + serverport);
});

function get2Digit(i) {
    if (i.toString().length == 1) {
        i = "0" + i;
    }
    return i;
}

setInterval(function () {
    if (!childRunning)
        prepScript();
}, 5000);


function resetLog() {
    fs.rename(__dirname + '/logs/' + script + '.log', __dirname + '/logs/' + logDate, function (err) {
        console.log(err);
    });
}

var logDate;

function resetAtMidnight() {
    var now = new Date();
    logDate = script + "-" + now.getFullYear() + "-" + get2Digit(now.getMonth() + 1) + "-" + get2Digit(now.getDate().toString()) + ".log";
    var night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // the next day, ...
        0, 0, 0 // ...at 00:00:00 hours
    );
    var msToMidnight = night.getTime() - now.getTime();

    setTimeout(function () {
        resetLog(); //      <-- This is the function being called at midnight.
        resetAtMidnight(); //      Then, reset again next midnight.
    }, msToMidnight);
}

process.on('uncaughtException', function (err) {
    console.log("Child had uncaught exception " + err.toString());
    // childRestarting = true;
    // console.log("Stop command issued");
    // child.kill('SIGINT');
    // //Start new instance
    // setTimeout(function () { prepScript(); }, 100);
    // process.exit();
    //process.send("RESTART");
});