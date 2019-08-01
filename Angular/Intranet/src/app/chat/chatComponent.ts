import { Component, AfterContentInit, OnDestroy, HostListener } from '@angular/core';
import { WebsocketService } from '../chat/websocket.service';
import { ChatService } from '../chat/chat.service';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';

declare var $: any;
@Component({
	selector: 'chat',
	templateUrl: '../../pages/chat.html',
	styleUrls: ['../../assets/css/chat.css'],
	providers: [WebsocketService, ChatService]
})
export class chatComponent implements AfterContentInit, OnDestroy {
		private version: string = "1.00";
		public user: string;
		public userManagement: any;
		//Chat variables
		public chatMessage: any = [];
		public onlineUsers: any = {};
		public offlineUsers: any = {};
		public onlineUsers2: any = {};
		public users: any = {};
		public users2: any = {};
		public groups: any = {};
		public notifications: any = {};
		public notification: boolean = false;
		public selectedGroup: number = 0;
		public selectedUser: string = "";
		public messages: any = {};
		public userLoggedIn: any = {};
		public chatUser: string = "";
		public chatPassword: string = "";
		public loggedIn: boolean;
		public sideBarState: string = "login";
		public sideBarShow: boolean = false;
		public fullBarShow: boolean = false;
	
		public groupNames: any = { "CS": "Customer Service", "SL": "Sales", "LINEHAUL": "Linehaul" };
		public hiddenGroups: string = "";
		public errormsg: any = {};
		public isConnected: boolean = false;
	
		public isPopUp: boolean = false;
		private popupWindow: Window;
		public popupBool: boolean = false;
	
		private creatingGroup: boolean = false;
		public loggingIn = false;
	
		public titleOriginal: string = "LME, Inc. Intranet";
		public titlebool: boolean = false;
	
		private sub: any;
		private token: string = '';
	
		private createdGroup: string = "";

		constructor(
			private chatService: ChatService,
			private route: ActivatedRoute,
			private router: Router,
			private authSvc: AuthenticationService,
			public titleService: Title
			// private modal:modalComponent
			// private proDetail: proDetailService
		) {
			this.userManagement = authSvc;
	
			window.onbeforeunload = function (e) {
				this.chatLogout();
				if (this.popupBool) {
					this.popupWindow.close();
				}
			}.bind(this);
		}

		@HostListener('document:logoutChat', ['$event'])
		getLogout(event) {
		this.chatLogout();
	}
ngOnInit() {
	this.router.events.subscribe(function (path) {
		if (!this.isPopUp) {
			this.fullBarShow = false;
			this.sideBarShow = false;
		}
	}.bind(this));
}

ngAfterContentInit() {
	setTimeout(function () {
		this.token = this.route.snapshot.queryParams['TOKEN'];
		if (this.token) {
			this.isPopUp = true;
			//this.popupBool = true;
			this.chatUser = this.token.substring(0, this.token.indexOf('-'));
			this.chatPassword = this.token.substring(this.token.indexOf('-') + 1);
			this.chatLogin();
			this.fullBarShow = false;
			this.sideBarShow = false;
		}
	}.bind(this), 1);
}

ngOnDestroy() {
	this.userManagement.unsubscribe;
}

popupChat() {
	if (!this.popupBool) {
		this.popupBool = true;
		this.popupWindow = <Window>window.open("http://lme.local/?TOKEN=" + this.chatUser + "-" + this.chatPassword, "_blank", 'modal=no');
	} else {
		this.popupBool = false;
		this.popupWindow.close();
	}
}
connect() {
	this.chatService.openConnection();
	this.chatService.messages.subscribe(msg => {
		var json = JSON.parse(JSON.stringify(msg));
		json = JSON.parse(json);
		if (json.type == "loggedin") {
			this.sendMsg({
				"type": "connect",
				"version": this.version,
				"user": json.json[0].USRPR,
				"name": json.json[0].USRNM,
				"email": json.json[0].USREM
			});
			this.loggedIn = true;
			this.sideBarState = "messages";
			this.userLoggedIn = json.json[0];
		} else if (json.type == "onlineusers") {
			this.getOnlineUsers(json.json);
		} else if (json.type == "offlineusers") {
			this.getOfflineUsers(json.json);
		} else if (json.type == "groups") {
			this.getGroups(json.json);
		} else if (json.type == "notifications") {
			this.getNotifications(json.json);
		} else if (json.type == "messages") {
			this.getMessages(json.json);
		} else if (json.type == "receive") {//{"type":"receive","group":1,"sender":"DPJRN","msg":"Hello Andy Again","date":1180629,"time":72136}
			this.getMessage(json);
		} else if (json.success) {
			if (json.type == "group") {
				if (this.createdGroup != "") {
					for (var i = 0; i < this.users[this.createdGroup].length; i++) {
						this.addGroup(this.users[this.createdGroup][i].user, json.INDEX);
					}
					this.createdGroup = "";
				}

				this.selectGroup(json.INDEX);
			} else if (json.type == "connected") {
			} else
				console.log(json.success);
		} else if (json.error) {
			this.errormsg = json;
			console.log("Error: " + json.error);
			if (json.type == "disconnect") {
				this.chatLogout();
			}
		} else if (json.type == "close")
			this.chatLogout();

	});
	setTimeout(function () { this.checkLogin(); }.bind(this), 5000);
}
checkLogin() {
	if (this.popupBool) {
		if (this.popupWindow.closed) {
			this.popupWindow.close();
			this.popupBool = false;
		}
	}
	this.isConnected = this.chatService.checkConnection();
	if (this.isConnected)
		setTimeout(function () { this.checkLogin(); }.bind(this), 5000);
	else
		this.chatLogout();
}
chatLogin() {
	this.errormsg = {};
	if (!this.loggedIn) {
		if (this.chatPassword == '*****' && !this.userManagement.hasAuthStrict('CHAT'))
			this.chatPassword = '';
		this.chatUser = this.chatUser.toUpperCase();
		this.loggingIn = true;
		if (!this.isConnected) {
			this.connect();
			setTimeout(function () {
				this.isConnected = this.chatService.checkConnection();
				if (this.isConnected) {
					this.sendMsg({
						"type": "login",
						"user": this.chatUser,
						"password": this.isPopUp ? this.token.substring(this.token.indexOf('-') + 1) : this.chatPassword
					});
				}
				this.loggingIn = false;
			}.bind(this), 1300);
		} else {
			this.sendMsg({
				"type": "login",
				"user": this.chatUser,
				"password": this.chatPassword
			});
			this.loggingIn = false;
		}
	}
}
chatLogout() {
	if (this.errormsg.type != "disconnect")
		this.errormsg = { "error": "You are no longer connected" };
	this.loggedIn = false;
	this.isConnected = false;
	this.chatService.resetConnection();
	// this.sideBarShow = false;
	// this.fullBarShow = false;
	this.selectedGroup = 0;
	this.resetTitle();
}
sendMsg(msg) {
	this.isConnected = this.chatService.checkConnection();
	if (this.isConnected)
		this.chatService.messages.next(msg);
	else {
		this.chatLogout();
	}
}
openChat(bool) {
	this.sideBarShow = bool;
	this.fullBarShow = !bool;
	if (this.userManagement.hasAuthStrict('CHAT')) {
		this.user = this.userManagement.getUser();
		this.chatUser = this.user.toUpperCase();
		this.chatPassword = '*****';
		this.chatLogin();
	}
}
getOnlineUsers(data) {
	this.onlineUsers = {};
	this.onlineUsers2 = {};
	for (var i = 0; i < data.length; i++) {
		if (data[i] != "") {
			if (data[i].user.toUpperCase().trim() != this.chatUser.toUpperCase().trim()) {
				if (!this.onlineUsers[data[i].group]) {
					this.onlineUsers[data[i].group] = [];
				}
				this.onlineUsers[data[i].group][this.onlineUsers[data[i].group].length] = data[i];
				this.onlineUsers2[data[i].user] = data[i];
				this.onlineUsers2[data[i].user]["vcon"] = "";
				this.onlineUsers2[data[i].user]["vcstatus"] = "";
			}
		}
	}
}
getOfflineUsers(data) {
	this.offlineUsers = {};
	for (var i = 0; i < data.length; i++) {
		if (data[i] != "") {
			data[i].GROUP = data[i].NAME.substring(data[i].NAME.search("-") + 1).trim();
			if (!this.offlineUsers[data[i].GROUP]) {
				this.offlineUsers[data[i].GROUP] = [];
			}
			this.offlineUsers[data[i].GROUP].push({
				"user": data[i].USER,
				"name": data[i].NAME.substring(0, data[i].NAME.search("-") - 1),
				"email": data[i].EMAIL,
				"group": data[i].GROUP
			});
			// ,
				// "vcon": data[i].VCON,
				// "vcstatus": data[i].VCSUBJECT.trim() == null ? "Out of office" : data[i].VCSUBJECT
		}
	}
	this.setUsers();
}
setUsers() {
	this.users = {};
	this.users2 = {};
	var keys = this.objectkeys(this.onlineUsers);
	for (var i = 0; i < keys.length; i++) {
		if (!this.users[keys[i]])
			this.users[keys[i]] = [];
		for (var j = 0; j < this.onlineUsers[keys[i]].length; j++) {
			if (this.onlineUsers[keys[i]][j]) {
				this.users[keys[i]][this.users[keys[i]].length] = this.onlineUsers[keys[i]][j];
				this.users[keys[i]][this.users[keys[i]].length - 1]["online"] = true;
				this.users2[this.onlineUsers[keys[i]][j].user] = this.onlineUsers[keys[i]][j];
			}
		}
	}
	keys = this.objectkeys(this.offlineUsers);
	for (var i = 0; i < keys.length; i++) {
		if (!this.users[keys[i]])
			this.users[keys[i]] = [];
		for (var j = 0; j < this.offlineUsers[keys[i]].length; j++) {
			if (this.offlineUsers[keys[i]][j] && this.offlineUsers[keys[i]][j].user != this.chatUser) {
				if (!this.users2[this.offlineUsers[keys[i]][j].user]) {
					this.users2[this.offlineUsers[keys[i]][j].user] = this.offlineUsers[keys[i]][j];
					this.users[keys[i]][this.users[keys[i]].length] = this.offlineUsers[keys[i]][j];
					this.users[keys[i]][this.users[keys[i]].length - 1]["online"] = false;
				}
			}
		}
	}
}
getGroups(data) {
	this.groups = {};
	for (var i = 0; i < data.length; i++) {//
		if (data[i] != "") {
			if (!this.groups[data[i].INDEX])
				this.groups[data[i].INDEX] = [];
			if (data[i].NAME.search('-') == -1)
				data[i].NAME += " - " + data[i].USER.substring(0, 2);
			this.groups[data[i].INDEX][this.groups[data[i].INDEX].length] = data[i];
		}
	}
}
getMessages(data) {
	this.messages = {};
	for (var i = 0; i < data.length; i++) {
		if (data[i] != "") {
			if (!this.messages[data[i].INDEX])
				this.messages[data[i].INDEX] = [];

			this.messages[data[i].INDEX][this.messages[data[i].INDEX].length] = data[i];
		}
	}
}
getMessage(data) {//{"type":"receive","group":1,"sender":"DPJRN","msg":"Hello Andy Again","date":1180629,"time":72136}
	if (data != "") {
		if (!this.messages[data.INDEX]) {
			this.messages[data.INDEX] = [];
		}
		if (!this.groups[data.INDEX])
			this.sendMsg({ "type": "getGroups" });
		this.messages[data.INDEX][this.messages[data.INDEX].length] = data;
	}
	if (data.INDEX == this.selectedGroup) {
		var out = document.getElementById("chatBubble");
		var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
		if (isScrolledToBottom)
			setTimeout(function () {
				var out = document.getElementById("chatBubble");
				out.scrollTop = out.scrollHeight;
			}, 0);
	} else {
		if (!this.notifications[data.INDEX]) {
			this.notifications[data.INDEX] = [];
		}
		this.notifications[data.INDEX][this.notifications[data.INDEX].length] = {
			"INDEX": data.INDEX,
			"DATE": data.DATE,
			"TIME": data.TIME,
			"SENDER": data.SENDER,
			"NAME": data.NAME
		};
		this.notification = true;
	}
	if (this.popupBool && data.SENDER.trim() != this.chatUser.trim()) {
		this.popupWindow.focus();
		//focusPopup();
	}
}
getNotifications(data) {
	this.notifications = {};
	for (var i = 0; i < data.length; i++) {
		if (data[i] != "") {
			if (!this.notifications[data[i].INDEX])
				this.notifications[data[i].INDEX] = [];
			data[i].NAME = data[i].NAME.substring(0, data[i].NAME.search("-") - 1).trim();
			this.notifications[data[i].INDEX][this.notifications[data[i].INDEX].length] = data[i];
		}
	}
	if (data.length > 0) {
		this.notification = true;
		var keys = this.objectkeys(this.notifications);
		this.titlebool = true;
		setTimeout(function () { this.updateTitle(keys, 0, 0); }.bind(this), 100);
	}
}
createMassGroup(group) {
	this.createdGroup = group;
	this.createGroup(group);
}
createGroup(user) {
	if (!this.creatingGroup) {
		this.creatingGroup = true;
		this.sendMsg({
			"type": "createGroup",
			"recipient": user
		});
		setTimeout(function () { this.creatingGroup = false; }.bind(this), 1000);
	}
}
addGroup(user, group) {
	this.sendMsg({
		"type": "addMember",
		"recipient": user,
		"index": group
	});
}
sendMessage(msg, group) {
	if (this.chatMessage[this.selectedGroup] > "") {
		this.sendMsg({
			"type": "send",
			"msg": msg,
			"index": group
		});
		this.chatMessage[this.selectedGroup] = "";
	}
}
checkNotifications(group) {
	if (this.notifications[group]) {
		if (this.notifications[group].length > 0)
			return true;
		else
			return false;
	} else
		return false;
}
checkIfNotification() {
	this.notification = false;
	if (this.notifications) {
		var keys = Object.keys(this.notifications);
		for (var i = 0; i < keys.length; i++) {
			if (this.checkNotifications(keys[i]))
				this.notification = true;
		}
	}
	if (!this.notification)
		this.resetTitle();
}
selectGroup(group) {
	this.selectedGroup = group;
	if (this.notifications[group]) {
		this.notifications[group] = [];
		this.checkIfNotification();
		if (!this.notification)
			$("#notification").text("");
		this.sendMsg({ 'type': 'deleteNotifications', 'group': group });
	}
	setTimeout(function () {
		var out = document.getElementById("chatBubble");
		out.scrollTop = out.scrollHeight;
	}, 0);
}
objectkeys(row) { return Object.keys(row); }
returnMDY(date) {
	if (date.toString().length > 0) {
		var rtn = date.toString();
		return rtn.substring(3, 5) + "/" + rtn.substring(5, 7) + "/" + rtn.substring(1, 3);
	} else
		return date;
}
returnTime(time) {
	if (time.toString().length > 0) {
		var rtn = time.toString();
		if (rtn.length < 6)
			rtn = "0" + rtn;
		return rtn.substring(0, 2) + ":" + rtn.substring(2, 4) + ":" + rtn.substring(4);
	} else
		return time;
}
isSenderMe(sender) { return sender.toUpperCase().trim() == this.user.toUpperCase().trim() ? true : false; }
toggleGroup(group) {//Show hide group
	this.selectedUser = "";
	var pos = this.hiddenGroups.indexOf(group);
	if (pos > -1)
		this.hiddenGroups = this.hiddenGroups.replace(" " + group, '');
	else
		this.hiddenGroups += " " + group;
}
updateTitle(keys, i, j) {
	if (this.titlebool) {
		if (i == -1) {
			this.titleService.setTitle(this.titleOriginal);
			$("#notification").text("");
			i = 0;
		} else if (this.notifications[keys[i]][j]) {
			this.titleService.setTitle(this.notifications[keys[i]][j].NAME + " Sent a message");
			$("#notification").text("You have a message from " + this.notifications[keys[i]][j].NAME);
			j++;
			if (j >= this.notifications[keys[i]].length) {
				j = 0;
				i++;
				if (i >= keys.length)
					i = -1;
			}
		} else {
			j = 0;
			i = 0;
		}
		setTimeout(function () {
			this.updateTitle(keys, i, j);
		}.bind(this), 2000);
	}
}
resetTitle() {
	this.titlebool = false;
	this.titleService.setTitle(this.titleOriginal);
}
testContextMenu(event, msg) {
	console.log(msg);
	return false;
}
public openLoading() {
	$('#content').append('<div id="loadingdiv">' +
		'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
}
public closeLoading() {
	$('#loadinggif').remove();
	$('#loadingdiv').remove();
}

}
