import { Component, AfterContentInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';
import { Title } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import { contextMenuService } from '../services/contextMenu.service';
// import {NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

declare var $: any;

@Component({
	selector: 'CityPlan',
	templateUrl: './cityplan.html',
	styleUrls: ['./cityplan.css']
})
export class cityplanComponent {
	private version: number = 1.1;
	public userManagement: any;
	public displaytable: any;
	public displayTotal: any = {};
	public displayDrivers: any = [];
	public proData: any = {};
	public proSort: any = {};
	public terminal: string;
	public terminalADR: any = {};
	private lstterminal: string;
	public getTRM: boolean = true;
	private user: string;
	public addPRO: string = "";
	public proSEQ: any = [];
	public tabInfo: any = {};

	public selectedPros: any = [];

	private curSort: string = "";

	public err: string;

	public dates: any = { 'CYMD': 0, 'MDY': 0, 'YMD': 0 };

	public groupShow: string = "";

	public tabUsed: any = {};
	public tabData: any = {};
	public tabState: string = "";
	public tabOptions: any = [];
	public tabUpdated: any = {};
	public planInfo: any = {};
	public newRoute: string = "";
	private refreshTimer: any;

	public iframeRoute: string = "";

	public newName: any = {};
	public metrix: any = {
		"SHP": "SHP",
		"PL": "PL",
		"WGT": "WGT",
		"HU": "H/U"
	};

	private tabRules: any = [
		{ check: "CNSNME", value: "GROUPE ROBERT", tab: "GROUPE ROBERT" },
		{ check: "CNSNME", value: "PROTRANS CONSOLIDATION", tab: "PROTRANS" }
	];
	private tabTracking: any = { "GROUPE ROBERT": true };//if true don't print tracking record

	public titles: any = {
		FBNO: "PRO",
		SUFFIX: "SFX",
		HAZCOD: "HZ",
		XGOLD: "XG",
		RESD: "RES",
		LGD: "LG",
		APPTDT: "AP",
		RDDDAT: "RDD",
		FROMA: "ORG",
		TOA: "DST",
		DOORNO: "DOOR1",
		DOORN2: "DOOR2",
		CNSNME: "CONSIGNEE",
		CNSADR: "ADDRESS",
		CNSCTY: "CITY",
		CNSSTA: "ST",
		CNSZIP: "ZIP",
		TTLPCS: "PCS",
		TTLWT: "WGT",
		HDUNITS: "HU",
		TRKTRM: "AT",
		TRLR: "TRLR",
		STATUS: "Status"
	};
	public planTitles: any = {
		FBNO: "PRO",
		SUFFIX: "SFX",
		HAZCOD: "HZ",
		XGOLD: "XG",
		RESD: "RES",
		LGD: "LG",
		APPTDT: "AP",
		RDDDAT: "RDD",
		FROMA: "ORG",
		TOA: "DST",
		DOORNO: "DOOR1",
		DOORN2: "DOOR2",
		CNSNME: "CONSIGNEE",
		CNSADR: "ADDRESS",
		CNSCTY: "CITY",
		CNSSTA: "ST",
		CNSZIP: "ZIP",
		TTLPCS: "PCS",
		TTLWT: "WGT",
		HDUNITS: "HU",
		TRKTRM: "AT",
		TRLR: "TRLR",
		STATUS: "Status"
	};

	public printing: boolean = false;
	//Get RDD Date
	public printTitles: any = {
		FBNO: "PRO",
		SUFFIX: "SFX",
		HAZCOD: "HZ",
		XGOLD: "XG",
		RESD: "RES",
		LGD: "LG",
		APPTDT: "AP",
		RDDDAT: "RDD",
		CNSNME: "CONSIGNEE",
		CNSADR: "ADDRESS",
		CNSCTY: "CITY",
		CNSSTA: "ST",
		CNSZIP: "ZIP",
		TTLPCS: "PCS",
		TTLWT: "WGT",
		HDUNITS: "HU",
		TRKTRM: "AT",
		TRLR: "TRLR",
		STATUS: "Status"
	};
	public currCymd: number;

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService,
		private titleService: Title,
		public contextMenu: contextMenuService,
		public sanitizer: DomSanitizer) {
		this.userManagement = loginSvc;
	}
	ngOnInit() {
		this.resetTRM();
	}
	@HostListener('document:mousedown', ['$event'])
	public documentClick(event: Event) {
		if (event['button'] == 0) {
			var path = event['path'] ? event['path'] : event.composedPath();
			if (event["ctrlKey"]) {
				if (path[0].id.substring(0, 3) == "PRO") {
					var pro = Number(path[0].id.substring(3));
					if (this.selectedPros.indexOf(pro) > -1)
						this.selectedPros.splice(this.selectedPros.indexOf(pro), 1);
					else
						this.selectedPros[this.selectedPros.length] = Number(path[0].id.substring(3));
				}
			} else if (event["shiftKey"]) {
				if (path[0].id.substring(0, 3) == "PRO") {
					var npro = Number(path[0].id.substring(3));
					//proSort   checkPro(pro)
					var lpro = this.selectedPros[this.selectedPros.length - 1];
					var start = false;
					var end = false;
					for (var i = 0; i < this.proSort.length; i++) {
						if (this.checkPro(this.proSort[i]) && (!start || !end)) {
							if (this.proSort[i] == lpro || this.proSort[i] == npro) {
								if (!start) {
									start = true;
								} else {
									end = true;
								}
							}
							if (this.selectedPros.indexOf(this.proSort[i]) == -1 && start) {
								this.selectedPros[this.selectedPros.length] = Number(this.proSort[i]);
							}
						}
					}
					// if (this.selectedPros.indexOf(pro) > -1)
					// 	this.selectedPros.splice(this.selectedPros.indexOf(pro), 1);
					// else
					// 	this.selectedPros[this.selectedPros.length] = Number(path[0].id.substring(3));
				}
			} else {
				this.selectedPros = [];
				if (path[0].id.substring(0, 3) == "PRO") {
					this.selectedPros[0] = Number(path[0].id.substring(3));
				}
			}
		}
		return true;
	}
	@HostListener('document:contextmenu', ['$event'])
	public documentRightClick(event: Event) {
		var jsonarray = [];
		var path = event['path'] ? event['path'] : event.composedPath();
		if (path[0].className == "unselectedButton" || path[0].className == "selectedButton") {
			jsonarray = [
				{ "action": "callback", "message": "View plan " + path[0].id, "parm": { "cb": "VIEWPLAN", "parm1": path[0].id }, "callback": this.contextCB.bind(this) },
				{ "action": "callback", "message": "Save plan " + path[0].id, "parm": { "cb": "SAVEPLAN", "parm1": path[0].id }, "callback": this.contextCB.bind(this) },
				{ "action": "callback", "message": "Delete plan " + path[0].id, "parm": { "cb": "DELETEPLAN", "parm1": path[0].id }, "callback": this.contextCB.bind(this) }
			];
		} else if (path[0].id.substring(0, 3) == "PRO") {
			var pro = Number(path[0].id.substring(3));
			jsonarray = [
				{ "action": "callback", "message": "Show map", "parm": { "cb": "GOOGLEPRO", "parm1": pro }, "callback": this.contextCB.bind(this) }
			];
		}
		return this.contextMenu.documentRightClick(event, jsonarray);
	}

	contextCB(json) {
		if (json.cb == "VIEWPLAN") {
			this.tabState = json.parm1;
			this.viewPlan();
		} else if (json.cb == "VIEWDOOR") {
			this.groupShow = json.parm1;
			// this.viewPlan();
		} else if (json.cb == "DELETEPLAN") {
			this.removeTab(json.parm1);
		} else if (json.cb == "SAVEPLAN") {
			this.updateTab(json.parm1, '');
		} else if (json.cb == "GOOGLEPRO") {
			this.buildGooglePlace(json.parm1);
		}
	}

	checkRouteName(name) {
		if (name == null || name == undefined) { this.err = "set route name"; }
		else if (name.trim() == "") { this.err = "set route name"; }
		else if (this.tabOptions.indexOf(name) > -1) { this.err = "set route name"; }
		else { this.addTab(name); }
	}
	addTab(tabName) {
		this.tabOptions[this.tabOptions.length] = tabName;
		this.tabState = tabName;
		this.tabData[tabName] = [];
		this.newRoute = "";
		this.newName[tabName] = tabName;
		this.planInfo[tabName] = {
			"TRLR": '',
			"DRVNUM": '',
			"TRUCK": '',
			"SCAC": '',
			"DOOR": '',
			"NAME": tabName,
			"USER": this.user,
			"TRM": this.terminal
		};
		this.tabUpdated[tabName] = false;
	}

	removeTab(tab) {
		if (window.confirm("Are you sure you want to delete the plan" + tab + "?")) {
			this.deletePlan(tab);
			for (var i = 0; i < this.tabData[tab].length; i++) {
				if (this.tabUsed[this.tabData[tab][i]])
					delete this.tabUsed[this.tabData[tab][i]];
				this.proData[this.tabData[tab][i]].LOC = "DOOR";
			}
			var index = this.tabOptions.indexOf(tab);
			this.tabOptions.splice(index, 1);
			this.tabState = "";
			delete this.tabData[tab];
			delete this.newName[tab];
			delete this.planInfo[tab];
			delete this.tabUpdated[tab];
			this.printing = false;
		}
	}

	renameTab(newName, oldName) {
		var index = this.tabOptions.indexOf(oldName);
		this.tabOptions[index] = newName;
		this.tabData[newName] = this.tabData[oldName];
		delete this.tabData[oldName];
		this.tabState = newName;
		delete this.newName[oldName];
		this.newName[newName] = newName;
		this.planInfo[newName] = this.planInfo[oldName];
		this.planInfo[newName].NAME = newName;
		delete this.planInfo[oldName];
		this.deletePlan(oldName);
	}
	resetTabs() {
		this.planInfo = {};
		this.newName = {};
		this.tabData = {};
		this.tabOptions = [];
		this.tabUsed = {};
		this.proData = {};
		this.tabUpdated = {};
		this.tabData['APPT set'] = [];
		this.tabData['APPT needed'] = [];
		this.tabData['Late LNHL'] = [];
		this.tabData['No plan'] = [];
		this.tabData['Old S PROs'] = [];
	}
	updateTab(tab, cb) {
		this.err = "";
		//json = {USER:,TRM:,NAME:,TLRL:,DRVNUM:,ROWS:[{SEQ:,PRO:}]}
		var json = {
			USER: this.planInfo[tab].USER,
			TRM: this.planInfo[tab].TRM,
			NAME: tab,
			TRLR: isNaN(this.planInfo[tab].TRLR) ? 0 : this.planInfo[tab].TRLR.trim(),
			DRVNUM: isNaN(this.planInfo[tab].DRVNUM) ? 0 : this.planInfo[tab].DRVNUM.trim(),
			TRUCK: isNaN(this.planInfo[tab].TRUCK) ? 0 : this.planInfo[tab].TRUCK.trim(),
			DOOR: isNaN(this.planInfo[tab].DOOR) ? 0 : this.planInfo[tab].DOOR.trim(),
			SCAC: !this.planInfo[tab].SCAC ? "" : this.planInfo[tab].SCAC.trim(),
			ROWS: []
		};//{SEQ:,PRO:}
		var lgt = this.tabData[tab].length;
		for (var i = 0; i < lgt; i++) {
			var mtseq = lgt - i;
			var plseq = i + 1;
			json.ROWS[i] = { PRO: this.tabData[tab][i], PLSEQ: plseq, MTSEQ: mtseq };
		}

		var promise = $.ajax({
			url: environment.API + "/cityplan/updateRoutes",
			method: 'post',
			data: { 'json': json, 'ver': this.version },
			dataType: 'json'
		});
		promise.done(function (res) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			this.tabUpdated[this.tabOptions[this.tabOptions.indexOf(tab)]] = false;
			if (cb != '')
				cb();

			if (res.error)
				this.err = res.error;
			else {
				this.err = res.success;
			}
		}.bind(this));

		promise.fail(function (err) {
			console.log(err.toString());
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
		});
	}
	updateTabs() {
		for (var i = 0; i < this.tabOptions.length; i++) {
			if (this.tabUpdated[this.tabOptions[i]]) {
				this.updateTab(this.tabOptions[i], function () {
					var ready = true;
					for (var j = 0; j < this.tabUpdated.length; j++) {
						if (this.tabUpdated[this.tabOptions[j]])
							ready = false;
					}
					if (ready) {
						var promise = $.ajax({
							url: environment.API + "/cityplan/getPlans",
							method: 'post',
							data: { 'user': this.user, 'trm': this.terminal },
							dataType: 'json'
						});
						promise.done(function (res) {
							$('#loadinggif').remove();
							$('#loadingdiv').remove();
							if (res.error)
								this.err = res.error;
							else {
								this.setPlans(res);
							}
						}.bind(this));

						promise.fail(function (err) {
							this.err = err;
							console.log(err.toString());
							$('#loadinggif').remove();
							$('#loadingdiv').remove();
						});
						// this.getData();
					}
				}.bind(this));
			}
		}
	}
	deletePlan(tab) {
		this.err = "";
		//json = {USER:,TRM:,NAME:,TLRL:,DRVNUM:,ROWS:[{SEQ:,PRO:}]}
		var json = {
			USER: this.planInfo[tab].USER,
			TRM: this.planInfo[tab].TRM,
			NAME: tab
		};//{SEQ:,PRO:}

		var promise = $.ajax({
			url: environment.API + "/cityplan/deletePlan",
			method: 'post',
			data: { 'json': json },
			dataType: 'json'
		});
		promise.done(function (res) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			if (res.error)
				this.err = res.error;
			else {
				this.err = res.success;
			}
		}.bind(this));

		promise.fail(function (err) {
			console.log(err.toString());
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
		});
	}
	writeTracking(tab) {
		this.err = "";
		//json = {USER:,TRM:,NAME:,TLRL:,DRVNUM:,ROWS:[{SEQ:,PRO:}]}
		if (!isNaN(this.planInfo[tab].TRLR)) {
			var json = {
				USER: this.user,
				TRM: this.planInfo[tab].TRM ? this.planInfo[tab].TRM : "   ",
				SCAC: this.planInfo[tab].SCAC ? this.planInfo[tab].SCAC : "    ",
				TRLR: this.planInfo[tab].TRLR ? this.planInfo[tab].TRLR : 0,
				ver: "1.0"
			};//{SEQ:,PRO:}

			var promise = $.ajax({
				url: environment.API + "/cityplan/writePlanned",
				method: 'post',
				data: { 'json': json, 'pros': this.tabData[tab] },
				dataType: 'json'
			});
			promise.done(function (res) {
				$('#loadinggif').remove();
				$('#loadingdiv').remove();
				if (res.error)
					this.err = res.error;
				else {
					this.err = res.success;
				}
			}.bind(this));

			promise.fail(function (err) {
				console.log(err.toString());
				$('#loadinggif').remove();
				$('#loadingdiv').remove();
			});
		} else
			this.err = "Must enter TRLR to write planned."
	}

	getData() {
		if (this.lstterminal != this.terminal) {
			this.displayTotal = { "WGT": 0, "HU": 0, "SHP": 0, "PL": 0, "DOOR": "TOTAL", "DOOR2": '' };
			this.titleService.setTitle(this.terminal + " planning");
			this.err = "";
			this.proData = {};
			this.displaytable = {};
			this.proSort = [];
			//Reset tabs
			this.resetTabs();
			this.user = this.userManagement.getUser();
			if (this.user == "") {
				this.router.navigate(['/home']);
			}
		}
		this.lstterminal = this.terminal;
		var trm = this.terminal;

		var before = Date.now();
		var all = this.getTRM ? "YES" : "NO";
		var promise = $.ajax({
			url: environment.API + "/cityplan/cityroutes",
			method: 'post',
			data: { 'trm': trm, 'user': this.user, "all": all, ver: this.version },
			dataType: 'json'
		});
		promise.done(function (res) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			// this.displaytable = {};
			var date = new Date();
			var month: string = "0" + (date.getMonth() + 1);
			month = month.substring(month.length - 2);
			var year = date.getFullYear().toString().substring(2);
			var day: string = "0" + date.getDate();
			day = day.substring(day.length - 2);
			this.dates = { 'CYMD': Number("1" + year + month + day), 'MDY': Number(month + day + year), 'YMD': Number(year + month + day) }
			date.setDate(date.getDate() - 7);
			var month: string = "0" + (date.getMonth() + 1);
			month = month.substring(month.length - 2);
			var year = date.getFullYear().toString().substring(2);
			var day: string = "0" + date.getDate();
			day = day.substring(day.length - 2);
			this.dates['RDDDAT'] = Number("1" + year + month + day);


			month = "01";
			year = date.getFullYear().toString().substring(2);
			day = "01";
			this.dates['FRDDDAT'] = Number("1" + year + month + day);

			if (res.error)
				this.err = res.error;
			else {
				var after = Date.now();
				var afterd = new Date();
				this.err = "Refreshed at " + afterd + " updated in " + ((after - before) / 1000).toFixed(0) + " second(s)";

				var prosAvailable = {};
				for (var i = 0; i < res.DATA.length; i++) {
					prosAvailable[res.DATA[i].FBNO] = true;
				}
				var keys = Object.keys(this.proData);
				for (var i = 0; i < keys.length; i++) {
					if (!prosAvailable[keys[i]]) {
						this.displayTotal.SHP--;
						this.displaytable[this.proData[keys[i]].DOORNO].SHP--;
						this.displaytable[this.proData[keys[i]].DOORNO].WGT -= isNaN(this.proData[keys[i]].WGT) ? 0 : this.proData[keys[i]].WGT;
						this.displaytable[this.proData[keys[i]].DOORNO].HU -= isNaN(this.proData[keys[i]].HU) ? 0 : this.proData[keys[i]].HU;

						if (this.tabUsed[keys[i]]) {
							this.displayTotal.PL--;
							this.displaytable[this.proData[keys[i]].DOORNO].PL--;
							if (this.tabData[this.tabUsed[keys[i]]])
								if (this.tabData[this.tabUsed[keys[i]]].indexOf(keys[i]) > -1)
									this.tabData[this.tabUsed[keys[i]]].splice(this.tabData[this.tabUsed[keys[i]]].indexOf(keys[i]), 1);
							delete this.tabUsed[keys[i]];
						}
						delete this.proData[keys[i]];
					}
				}

				for (var i = 0; i < res.DATA.length; i++) {
					// && res.DATA[i].TRKTRM.trim() == this.terminal.trim()
					if (res.DATA[i].TRKTRM != null) {
						res.DATA[i].DOORNO = res.DATA[i].DOORNO == null ? 'NONE' : res.DATA[i].DOORNO;
						if (!this.displaytable[res.DATA[i].DOORNO])
							this.displaytable[res.DATA[i].DOORNO] = { "ROWS": [], "DOOR": res.DATA[i].DOORNO, "DOOR2": res.DATA[i].DOORN2, "WGT": 0, "SHP": 0, "PL": 0, "HU": 0 };


						if (this.terminal == "MIL" && res.DATA[i].TRKTRM == "MIS") { }
						else if (res.DATA[i].SUFFIX == 'S' && Number(res.DATA[i].RDDDAT) < this.dates.FRDDDAT && !this.tabUsed[res.DATA[i].FBNO]) { }
						else {
							if (!this.tabUsed[res.DATA[i].FBNO]) {
								for (var r = 0; r < this.tabRules.length; r++) {
									if (res.DATA[i][this.tabRules[r].check].trim() == this.tabRules[r].value) {
										if (!this.tabData[this.tabRules[r].tab])
											this.addTab(this.tabRules[r].tab);
										this.tabData[this.tabRules[r].tab].push(res.DATA[i].FBNO);
										this.tabUsed[res.DATA[i].FBNO] = this.tabRules[r].tab;
									}
								}
							}

							res.DATA[i].LOC = !this.tabUsed[res.DATA[i].FBNO] ? "DOOR" : "TAB";

							if (!this.proData[res.DATA[i].FBNO]) {
								this.displaytable[res.DATA[i].DOORNO].ROWS[this.displaytable[res.DATA[i].DOORNO].ROWS.length] = res.DATA[i].FBNO;
								this.displaytable[res.DATA[i].DOORNO].WGT += this.setNumeric(res.DATA[i].TTLWT);
								this.displaytable[res.DATA[i].DOORNO].HU += this.setNumeric(res.DATA[i].HDUNITS);
								this.displaytable[res.DATA[i].DOORNO].SHP += 1;

								this.displayTotal.WGT += this.setNumeric(res.DATA[i].TTLWT);
								this.displayTotal.HU += this.setNumeric(res.DATA[i].HDUNITS);
								this.displayTotal.SHP += 1;
								this.proSort[this.proSort.length] = res.DATA[i].FBNO;
							}
							this.proData[res.DATA[i].FBNO] = res.DATA[i];


							if (res.DATA[i].APPTDT > 0 && !this.tabUsed[res.DATA[i].FBNO]) {
								var ymd: string = ("0" + res.DATA[i].APPTDT).substring(res.DATA[i].APPTDT.length == 6 ? 1 : 0);
								ymd = ymd.substring(4) + ymd.substring(0, 4);
								if (Number(this.dates.YMD) < Number(ymd)) {
									this.proData[res.DATA[i].FBNO].LOC = "TAB";
									this.tabData['APPT set'].push(res.DATA[i].FBNO);
									this.tabUsed[res.DATA[i].FBNO] = 'APPT set';
									this.displaytable[res.DATA[i].DOORNO].PL++;
									this.displayTotal.PL++;
								}
							} else if (res.DATA[i].APPT && res.DATA[i].APPT.substring(0, 2) == 'CA' && !this.tabUsed[res.DATA[i].FBNO]) {
								this.proData[res.DATA[i].FBNO].LOC = "TAB";
								this.tabData['APPT needed'].push(res.DATA[i].FBNO);
								this.tabUsed[res.DATA[i].FBNO] = 'APPT needed';
								this.displaytable[res.DATA[i].DOORNO].PL++;
								this.displayTotal.PL++;
							} else if (res.DATA[i].SUFFIX == 'S' && Number(res.DATA[i].RDDDAT) < this.dates.RDDDAT && !this.tabUsed[res.DATA[i].FBNO]) {
								this.proData[res.DATA[i].FBNO].LOC = "TAB";
								this.tabData['Old S PROs'].push(res.DATA[i].FBNO);
								this.tabUsed[res.DATA[i].FBNO] = 'Old S PROs';
								this.displaytable[res.DATA[i].DOORNO].PL++;
								this.displayTotal.PL++;
							}
						}
					}
				}

				if (res['PLANS']) {
					this.setPlans(res);
				}
				if (res['TRM']) {
					this.terminalADR = res['TRM'];
					this.displayDrivers = res['DRIVERS'];
					this.getTRM = false;
					// 	setInterval(this.getData,300000);
				}

			}
		}.bind(this));

		promise.fail(function (err) {
			console.log(err.toString());
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
		});

		// }
	}
	setNumeric(val) {
		return isNaN(val) ? 0 : Number(val);
	}
	getData2() {
		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		this.getData();
		this.refreshTimer = setInterval(function () { this.getData() }.bind(this), (1000 * 60) * 5);
	}
	setPlans(res) {
		var keys = Object.keys(this.tabUpdated);
		if (Array.isArray(res['PLANS']) && res['PLANS'].length > 0) {
			var plans = res['PLANS'];
			for (var i = 0; i < plans.length; i++) {
				if (!this.tabUpdated[plans[i].NAME]) {
					if (!this.tabData[plans[i].NAME.trim()]) {
						this.addTab(plans[i].NAME.trim());
					}
					this.planInfo[plans[i].NAME.trim()].TRLR = plans[i].TRLR;
					this.planInfo[plans[i].NAME.trim()].DRVNUM = plans[i].DRVNUM;
					this.planInfo[plans[i].NAME.trim()].TRUCK = plans[i].TRUCK;
					this.planInfo[plans[i].NAME.trim()].DOOR = plans[i].DOOR;
					this.planInfo[plans[i].NAME.trim()].SCAC = plans[i].SCAC;
					if (this.proData[plans[i].PRO] && this.proData[plans[i].PRO].LOC == "DOOR") {
						this.tabUsed[plans[i].PRO] = plans[i].NAME.trim();
						this.tabData[plans[i].NAME.trim()][this.tabData[plans[i].NAME.trim()].length] = plans[i].PRO;
						this.proData[plans[i].PRO].LOC = "TAB";
						this.displaytable[this.proData[plans[i].PRO].DOORNO].PL++;
						this.displayTotal.PL++;
					} else if (this.proData[plans[i].PRO] && this.proData[plans[i].PRO].LOC == "TAB" && (this.tabUsed[plans[i].PRO] == "APPT set" || this.tabUsed[plans[i].PRO] == "APPT needed")) {
						var tindex = this.tabData[this.tabUsed[plans[i].PRO]].indexOf(plans[i].PRO);
						this.tabData[this.tabUsed[plans[i].PRO]].splice(tindex, 1);
						this.tabUsed[plans[i].PRO] = plans[i].NAME.trim();
						this.tabData[plans[i].NAME.trim()].push(plans[i].PRO);
					}
				}
			}
			// if (this.tabOptions.length == 0)
			// 	this.addTab("Plan 1");
		}
		// else
		// this.addTab("Plan 1");
	}
	displayData(row, key) {
		if (key == "RDDDAT" && row[key]) {
			if (row[key].length == 7)
				return row[key].substring(3, 5) + "/" + row[key].substring(5) + "/" + row[key].substring(1, 3);
			else
				return "";
		} else if (key == "APPTDT" && row[key]) {
			if (row[key].length == 5)
				row[key] = "0" + row[key];
			return row[key].substring(0, 2) + "/" + row[key].substring(2, 4) + "/" + row[key].substring(4);
		} else if (key == "XGOLD" || key == "RESD" || key == "LGD") {
			if (row[key] != null && row[key].trim() > "")
				return "X";
			else
				return "";
		} else
			return row[key];
	}
	addtoEvent(list) {
		return JSON.stringify(list);
	}
	addPro(pro, tab) {
		if (this.proData[pro] && !this.tabUsed[pro]) {
			this.tabUsed[pro] = tab;
			this.tabData[tab].push(pro);
			this.proData[pro].LOC = "TAB";
			this.displaytable[this.proData[pro].DOORNO].PL++;
			this.displayTotal.PL++;
			this.addPRO = "";
			this.err = "Pro was added to plan " + tab;
			this.tabUpdated[tab] = true;
		} else if (this.tabUsed[pro] && (this.tabUsed[pro] == "APPT needed" || this.tabUsed[pro] == "APPT set")) {
			this.err = "Pro was added to plan " + tab + " and removed from " + this.tabUsed[pro];
			this.tabData[this.tabUsed[pro]].splice(this.tabData[this.tabUsed[pro]].indexOf(pro), 1);
			this.tabUsed[pro] = tab;
			this.tabData[tab].push(pro);
			this.addPRO = "";
			this.tabUpdated[tab] = true;
		} else if (this.tabUsed[pro])
			this.err = "Pro found on plan " + this.tabUsed[pro];
		else
			this.err = "Pro not found";
	}
	onItemDrop(e: any, state: string) {
		// Get the dropped data here
		var arrs = e.nativeEvent.path ? e.nativeEvent.path : e.nativeEvent.composedPath();
		var index = this.tabData[this.tabState].length;
		for (var i = 0; i < arrs.length; i++) {
			var name = arrs[i].localName != undefined ? arrs[i].localName : " ";
			if (name.indexOf("tr") > -1) {
				index = Number(arrs[i].id);
				i = arrs.length;
			}
		}
		//Remove it from old array
		for (var i = 0; i < e.dragData.length; i++) {
			var loc = this.proData[e.dragData[i]].LOC;
			this.proData[e.dragData[i]].LOC = "TAB";
			this.tabData[this.tabState].splice(index, 0, e.dragData[i]);

			if (loc == "DOOR") {
				this.tabUsed[e.dragData[i]] = state;
				this.displaytable[this.proData[e.dragData[i]].DOORNO].PL++;
				this.displayTotal.PL++;
			} else {
				for (var j = 0; j < this.tabData[this.tabState].length; j++) {
					if (this.tabData[this.tabState][j] == e.dragData[i] && j != index) {
						this.tabData[this.tabState].splice(j, 1);
						j = this.tabData[this.tabState].length;
					}
				}
			}
		}
		this.tabUpdated[this.tabState] = true;
		this.selectedPros = [];
	}
	tabDrop(e: any, tab) {
		this.tabUpdated[tab] = true;
		for (var i = 0; i < e.dragData.length; i++) {
			// Get the dropped data here
			if (this.proData[e.dragData[i]].LOC == "TAB") {
				this.tabData[this.tabState].splice(this.tabData[this.tabState].indexOf(e.dragData[i]), 1);
			} else {
				this.proData[e.dragData[i]].LOC = "TAB";
				this.tabUsed[e.dragData[i]] = tab;
				this.displaytable[this.proData[e.dragData[i]].DOORNO].PL++;
				this.displayTotal.PL++;
			}
			this.tabData[tab].push(e.dragData[i]);
		}
		this.selectedPros = [];
	}
	onItemRemove(pro) {
		delete this.tabUsed[pro];
		this.proData[pro].LOC = "DOOR";
		this.displaytable[this.proData[pro].DOORNO].PL--;
		this.displayTotal.PL--;
		this.tabData[this.tabState].splice(this.tabData[this.tabState].indexOf(pro), 1);
	}
	checkPro(pro) {
		if (this.proData[pro] && !this.tabUsed[pro]) {
			// && row.TRKTRM.trim() == this.terminal
			if (this.groupShow == "TOTAL" || this.proData[pro].DOORNO == this.groupShow)
				return true;
			else
				return false;
		}
		return false;
	}
	checkProSubmit() {
		if (!this.terminal)
			return true;
		else if (this.terminal.length == 3)
			return false;
		else
			return true;
	}
	checkIfSelected(pro) {
		if (this.selectedPros.indexOf(Number(pro)) > -1)
			return true;
		else
			return false;
	}
	showPlanOptions() {
		if (this.planInfo[this.tabState])
			return true;
		else
			return false;
	}
	resetTRM() {
		this.titleService.setTitle("LME city planning");
		this.displayTotal = {};
		this.displayDrivers = [];
		// this.displayPros: any = [];
		this.proData = {};
		this.proSort = {};
		this.terminal = "";
		this.lstterminal = "";
		this.getTRM = true;
		this.selectedPros = [];
		this.curSort = "";
		this.err = "";
		this.groupShow = "";
		this.tabUsed = {};
		this.tabData = {};
		this.tabState = "";
		this.tabOptions = [];
		this.tabUpdated = {};
		this.planInfo = {};
		this.newRoute = "";

		this.displaytable = {};
		this.tabData['APPT set'] = [];
		this.tabData['APPT needed'] = [];
		this.tabData['Late LNHL'] = [];
		this.tabData['No plan'] = [];

		var date = new Date();
		var month: string = "0" + (date.getMonth() + 1);
		month = month.substring(month.length - 2);
		var year = date.getFullYear().toString().substring(2);
		var day: string = "0" + date.getDate();
		day = day.substring(day.length - 2);
		this.dates = { 'CYMD': Number("1" + year + month + day), 'MDY': Number(month + day + year), 'YMD': Number(year + month + day) };
		clearInterval(this.refreshTimer);
	}
	printTab() {
		var w = window.open();
		var html = "<!DOCTYPE HTML>";
		html += '<html lang="en-us">';
		html += '<head><style>' +
			'@page {size: portrait;}' +
			'p{font-size:10px;}' +
			'table td{padding-left:5px;	padding-bottom:2px;border: 1px solid black;}' +
			'table{border-collapse: collapse;width:100%;height:100%; margin-bottom:15px; position:relative; page-break-inside:auto;}' +
			'tr{ page-break-inside:avoid;}' +
			'ng-container{page-break-inside:avoid;}' +
			'thead{border:1px solid black;}' +
			'div{position:relative; display:block;}' +
			'.printHide{display:none;}' +
			'.noborder{border:none;}' +
			'tr:nth-child(10n+1){page-break-after: always; page-break-inside:avoid; }' +
			// '.printShow{display:block;}' + 
			'th{border:1px solid black;} ' +
			'</style></head>';
		html += "<body>";
		html += $('#Print').html();
		html += "</body></html>";
		w.document.write(html);
		w.window.print();
		w.document.close();
	}
	planned() {
		if (this.user != "DPJRN" && !this.tabTracking[this.tabState] && ['APPT set', 'APPT needed', 'Late LNHL', 'No plan'].indexOf(this.tabState) == -1)
			this.writeTracking(this.tabState);
	}
	objectkeys(row) { return Object.keys(row); }
	sortByKey(key) { this.proSort = this.sortByKey2(this.proSort, key, this.proData); }
	sortByKey2(array, key, keyarray) {
		if (this.curSort != key) {
			this.curSort = key;

			return array.sort(function (a, b) {
				var x = keyarray[a][key]; var y = keyarray[b][key];
				if (isNaN(x) && isNaN(y))
					return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				else
					return ((Number(x) < Number(y)) ? -1 : ((Number(x) > Number(y)) ? 1 : 0));
			});
		} else {
			this.curSort = "";
			return array.sort(function (a, b) {
				var x = keyarray[a][key]; var y = keyarray[b][key];
				if (isNaN(x) && isNaN(y))
					return ((x > y) ? -1 : ((x < y) ? 1 : 0));
				else
					return ((Number(x) > Number(y)) ? -1 : ((Number(x) < Number(y)) ? 1 : 0));
			});
		}
	}
	buildGoogleRoutes(arr) {
		var url = "https://www.google.com/maps/dir/";
		url += this.terminalADR.TMADDRESS.trim().replace('  ', '+').replace(/\s/g, '+') + ",+" + this.terminalADR.TMCITY.trim().replace('  ', '+').replace(/\s/g, '+') + ",+" + this.terminalADR.TMSTATE.trim().replace('  ', '+').replace(/\s/g, '+') + "+" + this.terminalADR.TMZIP.trim().replace('  ', '+').replace(/\s/g, '+') + "/";
		for (var i = 0; i < arr.length; i++) {
			var CNSNME = this.proData[arr[i]].CNSNME.trim().replace('  ', '+').replace(/\s/g, '+');
			var CNSADR = this.proData[arr[i]].CNSADR.trim().replace('  ', '+').replace(/\s/g, '+');
			var CNSCTY = this.proData[arr[i]].CNSCTY.trim().replace('  ', '+').replace(/\s/g, '+');
			var CNSSTA = this.proData[arr[i]].CNSSTA.trim().replace('  ', '+').replace(/\s/g, '+');
			var CNSZIP = this.proData[arr[i]].CNSZIP.trim().replace('  ', '+').replace(/\s/g, '+');
			url += CNSNME + ",+" + CNSADR + ",+" + CNSCTY + ",+" + CNSSTA + "+" + CNSZIP + "/";
		}
		url += this.terminalADR.TMADDRESS.trim().replace('  ', '+').replace(/\s/g, '+') + ",+" + this.terminalADR.TMCITY.trim().replace('  ', '+').replace(/\s/g, '+') + ",+" + this.terminalADR.TMSTATE.trim().replace('  ', '+').replace(/\s/g, '+') + "+" + this.terminalADR.TMZIP.trim().replace('  ', '+').replace(/\s/g, '+') + "/";
		window.open(url);
	}
	buildBingRoutes(arr) {
		var url = "https://bing.com/maps/default.aspx?";
		url += "rtp=adr." + this.terminalADR.TMADDRESS.trim().replace('  ', '%20').replace(/\s/g, '%20') + ",%20" + this.terminalADR.TMCITY.trim().replace('  ', '%20').replace(/\s/g, '%20') + ",%20" + this.terminalADR.TMSTATE.trim().replace('  ', '%20').replace(/\s/g, '%20') + "%20" + this.terminalADR.TMZIP.trim().replace('  ', '%20').replace(/\s/g, '%20') + "~";
		for (var i = 0; i < arr.length; i++) {
			var CNSADR = this.proData[arr[i]].CNSADR.trim().replace('&', '').replace('  ', '%20').replace(/\s/g, '%20');
			var CNSCTY = this.proData[arr[i]].CNSCTY.trim().replace('  ', '%20').replace(/\s/g, '%20');
			var CNSSTA = this.proData[arr[i]].CNSSTA.trim().replace('  ', '%20').replace(/\s/g, '%20');
			var CNSZIP = this.proData[arr[i]].CNSZIP.trim().replace('  ', '%20').replace(/\s/g, '%20');
			url += "adr." + CNSADR + "," + CNSCTY + "," + CNSSTA + "%20" + CNSZIP + "~";
		}
		url += "adr." + this.terminalADR.TMADDRESS.trim().replace('  ', '%20').replace(/\s/g, '%20') + "," + this.terminalADR.TMCITY.trim().replace('  ', '%20').replace(/\s/g, '%20') + "," + this.terminalADR.TMSTATE.trim().replace('  ', '%20').replace(/\s/g, '%20') + "%20" + this.terminalADR.TMZIP.trim().replace('  ', '').replace(/\s/g, '') + "~";
		window.open(url);
	}
	viewPlan() {
		this.printing = true;
		this.proSEQ = [];
		this.tabInfo = { "bills": 0, "wgt": 0, "hu": 0 };
		for (var i = 0; i < this.tabData[this.tabState].length; i++) {
			if (this.proData[this.tabData[this.tabState][i]]) {
				this.proSEQ[this.proSEQ.length] = this.proSEQ.length + 1;
				this.tabInfo.bills++;
				this.tabInfo.wgt += Number(this.proData[this.tabData[this.tabState][i]].TTLWT);
				this.tabInfo.hu += Number(this.proData[this.tabData[this.tabState][i]].HDUNITS);
			}
		}
	}
	updateSEQ(tab, pro, seq, nseq) {
		nseq--;
		nseq = nseq < 1 ? 0 : nseq;
		nseq = nseq > this.tabData[tab].length ? this.tabData[tab].length : nseq;
		this.tabData[tab].splice(seq, 1);
		this.tabData[tab].splice(nseq, 0, pro);

		this.proSEQ = [];
		for (var i = 0; i < this.tabData[tab].length; i++) {
			this.proSEQ[i] = i + 1;
		}
		// this.proData[pro].SEQ = nseq;
	}
	// returnDisplayArray(arr){
	// 	var rtnarray = [];
	// 	for(var i=0; i<arr.length;i++){
	// 		if(this.checkPro(arr[i]))
	// 			rtnarray[rtnarray.length] = arr[i];
	// 	}
	// 	return rtnarray;
	// }


	buildGooglePlace(arr) {
		var url = "https://www.google.com/maps/place/";
		var CNSNME = this.proData[arr].CNSNME.trim().replace('  ', '+').replace(/\s/g, '+');
		var CNSADR = this.proData[arr].CNSADR.trim().replace('  ', '+').replace(/\s/g, '+');
		var CNSCTY = this.proData[arr].CNSCTY.trim().replace('  ', '+').replace(/\s/g, '+');
		var CNSSTA = this.proData[arr].CNSSTA.trim().replace('  ', '+').replace(/\s/g, '+');
		var CNSZIP = this.proData[arr].CNSZIP.trim().replace('  ', '+').replace(/\s/g, '+');
		url += CNSNME + ",+" + CNSADR + ",+" + CNSCTY + ",+" + CNSSTA + "+" + CNSZIP + "/";
		window.open(url);
	}
	barcodeTrailer(tab) {
		var rtn = this.planInfo[tab]['TRLR'] ? this.planInfo[tab]['TRLR'].trim() : "";
		rtn += this.planInfo[tab]['SCAC'] ? this.planInfo[tab]['SCAC'].trim() : "";
		return rtn;
	}
}