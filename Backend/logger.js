var fs = require("fs");
var logoutFile = __dirname + "/logs/server.log";
var errorFile = __dirname + "/logs/server_errors.log";

var loggingLevel= 0;


exports.setServerName = function(name){

	logoutFile = __dirname + "/logs/"+name+".log";
	errorFile = __dirname + "/logs/"+name+"_errors.log";
}

exports.log = function(p_stream){
	var d = new Date();
	var text;
	var msg;
	var stream = "" + p_stream;
	if(stream == ""){
	}else{
		text = d.toLocaleString("en-us", {timeZone: "America/Chicago",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"});
		if(stream.substring(0,3)=="ERR"){
			msg = Number(stream.substring(3,8));
			text += " " + stream.substring(0,8) + " " + ERRMSG[stream.substring(0,8)] + " " + stream.substring(9);
		}else{
			msg = 00000;
			text += " ERR10000 " + stream; 
		}
		if(msg >= loggingLevel * 10000){
			fs.appendFile(logoutFile,text + "\n",function (err) {
				if (err) return console.log(err);
			});
		}
		if(msg >= 80000)
		fs.appendFile(errorFile,text + "\n",function (err) {
			if (err) return console.log(err);
		});
	}
}

exports.error = function(stream){
	var d = new Date();
	var text;
	var msg;
	if(stream == null){
	}else{
		text = d.toLocaleString("en-us", {timeZone: "America/Chicago",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"});
		if(stream.substring(0,3)=="ERR"){
			msg = Number(stream.substring(3,8));
			text += " " + stream.substring(0,8) + " " + ERRMSG[stream.substring(0,8)] + " " + stream.substring(9);
		}else{
			msg = 90000;
			text += " ERR10000 " + stream; 
		}
		if(msg >= loggingLevel * 10000){
			fs.appendFile(logoutFile,text + "\n",function (err) {
				if (err) return console.log(err);
			});
		}
		if(msg >= 80000)
		fs.appendFile(errorFile,text + "\n",function (err) {
			if (err) return console.log(err);
		});
	}
}

exports.logLevel = function(newlevel){
	loggingLevel = newlevel;
}

var ERRMSG = {
	ERR00000:"Generic",
	ERR00001:"Route hit: ",
	ERR00002:"Route hit: ",
	ERR00003:"API Route hit: ",
	ERR00004:"Debug message: ",
	ERR10000:"Generic",
	ERR20000:"Generic",
	ERR20001:"",
	ERR30000:"Generic",
	ERR40000:"Generic",
	ERR50000:"Generic",
	ERR60000:"Generic",
	ERR70000:"Generic",
	ERR80000:"Generic",
	ERR80001:"Server Started",
	ERR90000:"Generic",
	ERR90001:"Possible Firewall Breach",
	ERR90002:"SQL error",
	ERR90003:"Invalid Route",
	ERR90004:"Program call error",
	ERR99999:"SHUTDOWN"
};