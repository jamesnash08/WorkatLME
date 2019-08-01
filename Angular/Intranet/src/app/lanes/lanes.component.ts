import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';
// import {NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

declare var $: any;

@Component({
	selector: 'OpsDashboard',
	templateUrl: './lanes.html',
	styleUrls: ['./lanes.css']
})
export class lanesComponent {

	public userManagement: any;

	public displayinfo: any;
	public displaytable: any;
	public displayTotal:any = {};
	private tabledata: any;
	public graphKey: string;
	public monthlyTable: any;
	public monthlyTable2: any;
	private curSort: string;
	public terminal: string;
	public state:string;

	public fromdate:string;
	public todate:string;

	public err:string;

	public laneState:string = "IN";

	hoveredDate:any;

	public workDays:number=0;
	public metrix: any = {
		"FROMA":"ORG",
		"TOA":"DST",
		"DOOR":"DOOR",
		"SHP":"SHP",
		"WGT":"WGT",
		"HU":"H/U",
		"SHPA":"SHP Avg",
		"WGTA":"WGT Avg",
		"HUA":"H/U Avg"
};

	public titles: any = {
		FBNO: "PRO",
		FBDATE: "DATE",
		DATDEL: "DELIVERY",
		FROMA: "ORG",
		TOA: "DST",
		SHPNME: "SHIPPER",
		SHPADR: "ADDRESS",
		SHPCTY: "CITY",
		SHPSTA: "ST",
		SHPZIP: "ZIP",
		DOORNO: "DOOR1",
		DOORN2: "DOOR2",
		CNSNME: "CONSIGNEE",
		CNSADR: "ADDRESS",
		CNSCTY: "CITY",
		CNSSTA: "ST",
		CNSZIP: "ZIP",
		BLTNME: "PAYOR",
		BLTCTY: "CITY",
		BLTSTA: "STATE",
		BLTZIP: "ZIP",
		ADVCL: "ADV",
		BYDCL: "BYD",
		PPDCOL: "TERM",
		TTLPCS: "PCS",
		TTLWT: "WGT",
		OURREV: "REV",
		HDUNITS: "HU",
		TOTCHG: "TOT REV"
	};;
	public currCymd: number;

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService) {
		this.userManagement = loginSvc;
		this.displayinfo = null;
		this.displaytable = {};
	

		// this.fromDate = calendar.getToday();
    // this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);

	}

	ngOnInit() {
	}

	getShip() {
		this.displaytable = {};
		this.tabledata = {};
		if((this.terminal > "" || this.state > "") && this.fromdate != undefined && this.todate != undefined){
		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
			var fcymd = "2" +  this.fromdate.replace(/-/g,'').substring(2);
			var tcymd =  "2" + this.todate.replace(/-/g,'').substring(2);
			var promise = $.ajax({
				url: environment.API + "/ops/inship",
				method: 'post',
				data: { 'trm': this.terminal, 'state':this.state, 'fdate': fcymd,'tdate':tcymd},
				dataType: 'json'
			});
			promise.done(function (res) {
				$('#loadinggif').remove();
				$('#loadingdiv').remove();
				if(res.error)
					this.err = res.error;
				else{
					this.workDays = res['WORK'];

					this.tabledata['IN'] = res['DATA'];					
					this.displaytable['IN']={};
					this.displayTotal['IN']={"WGT":0,"WGTA":0,"SHP":0,"SHPA":0,"HU":0,"HUA":0};
					for(var i=0;i<res.DATA.length;i++){
						if(!this.displaytable['IN'][res.DATA[i].DOORNO])
							this.displaytable['IN'][res.DATA[i].DOORNO]={"ROWS":[],"DOOR":res.DATA[i].DOORNO,"FROMA":res.DATA[i].FROMA,"TOA":res.DATA[i].TOA,"WGT":0,"WGTA":0,"SHP":0,"SHPA":0,"HU":0,"HUA":0};
						this.displaytable['IN'][res.DATA[i].DOORNO].ROWS[this.displaytable['IN'][res.DATA[i].DOORNO].ROWS.length]= res.DATA[i];
						this.displaytable['IN'][res.DATA[i].DOORNO].WGT += Number(res.DATA[i].TTLWT);
						this.displaytable['IN'][res.DATA[i].DOORNO].HU += Number(res.DATA[i].HDUNITS);
						this.displaytable['IN'][res.DATA[i].DOORNO].SHP += 1;

						this.displaytable['IN'][res.DATA[i].DOORNO].WGTA = Number(this.displaytable['IN'][res.DATA[i].DOORNO].WGT / this.workDays).toFixed(0);
						this.displaytable['IN'][res.DATA[i].DOORNO].HUA = Number(this.displaytable['IN'][res.DATA[i].DOORNO].HU / this.workDays).toFixed(0);
						this.displaytable['IN'][res.DATA[i].DOORNO].SHPA = Number(this.displaytable['IN'][res.DATA[i].DOORNO].SHP / this.workDays).toFixed(0);

						this.displayTotal['IN'].WGT += Number(res.DATA[i].TTLWT);
						this.displayTotal['IN'].HU += Number(res.DATA[i].HDUNITS);
						this.displayTotal['IN'].SHP += 1;

						this.displayTotal['IN'].WGTA = Number(this.displayTotal['IN'].WGT / this.workDays).toFixed(0);
						this.displayTotal['IN'].HUA = Number(this.displayTotal['IN'].HU / this.workDays).toFixed(0);
						this.displayTotal['IN'].SHPA = Number(this.displayTotal['IN'].SHP / this.workDays).toFixed(0);
					}
				}
				var promise = $.ajax({
					url: environment.API + "/ops/outship",
					method: 'post',
					data: { 'trm': this.terminal, 'state':this.state, 'fdate': fcymd,'tdate':tcymd},
					dataType: 'json'
				});
				promise.done(function (res) {
					$('#loadinggif').remove();
					$('#loadingdiv').remove();
					if(res.error)
					this.err = res.error;
				else{
					this.tabledata['OUT'] = res;
					this.displaytable['OUT'] = this.tabledata['OUT'];

					this.displaytable['OUT']={};
					this.displayTotal['OUT']={"WGT":0,"WGTA":0,"SHP":0,"SHPA":0,"HU":0,"HUA":0};
					for(var i=0;i<res.length;i++){
						if(!this.displaytable['OUT'][res[i].DOORNO])
							this.displaytable['OUT'][res[i].DOORNO]={"ROWS":[],"DOOR":res[i].DOORNO,"WGT":0,"WGTA":0,"SHP":0,"SHPA":0,"HU":0,"HUA":0};
						this.displaytable['OUT'][res[i].DOORNO].ROWS[this.displaytable['OUT'][res[i].DOORNO].ROWS.length]= res[i];
						this.displaytable['OUT'][res[i].DOORNO].WGT += Number(res[i].TTLWT);
						this.displaytable['OUT'][res[i].DOORNO].HU += Number(res[i].HDUNITS);
						this.displaytable['OUT'][res[i].DOORNO].SHP += 1;

						this.displaytable['OUT'][res[i].DOORNO].WGTA = this.displaytable['OUT'][res[i].DOORNO].WGT / this.workDays;
						this.displaytable['OUT'][res[i].DOORNO].HUA = this.displaytable['OUT'][res[i].DOORNO].HU / this.workDays;
						this.displaytable['OUT'][res[i].DOORNO].SHPA = this.displaytable['OUT'][res[i].DOORNO].SHP / this.workDays;

						this.displayTotal['OUT'].WGT += Number(res[i].TTLWT);
						this.displayTotal['OUT'].HU += Number(res[i].HDUNITS);
						this.displayTotal['OUT'].SHP += 1;

						this.displayTotal['OUT'].WGTA = Number(this.displayTotal['OUT'].WGT / this.workDays).toFixed(0);
						this.displayTotal['OUT'].HUA = Number(this.displayTotal['OUT'].HU / this.workDays).toFixed(0);
						this.displayTotal['OUT'].SHPA = Number(this.displayTotal['OUT'].SHP / this.workDays).toFixed(0);
					}
				}
				}.bind(this));
		
				promise.fail(function (err) {
					console.log(err.toString());
				});

		}.bind(this));

		promise.fail(function (err) {
			console.log(err.toString());
		});
		
	}
	}
	displayMetrix(val){
		return isNaN(val) ? val : Number(val).toFixed(0)
	}

	objectkeys(row) {
		return Object.keys(row);
	}

	numberWithCommas(x) {
		var rtnval;
		var z = parseInt(x);
		if (isNaN(z))
			z = 0;
		rtnval = z.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return rtnval;
	}
	numberWithCommasDecimal(x) {
		var rtnval;
		var y = Number(x);
		if (isNaN(y))
			y = 0;
		return y.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	}
	getPercent(cur, pre) {
		if (cur != null && cur != "" && pre != null && pre != "") {
			var x: any;
			x = Number(cur.replace(/,/g, '')) / Number(pre.replace(/,/g, ''));
			//x = parseInt(x);
			x = x * 100;
			x = x.toFixed(0) - 100;
			var y = x + "%";
			return y;
		} else {
			return "0%";
		}
	}
	getNumberValue(x) {
		if (!isNaN(x)) {
			return x;
		} else if (x > "" || x > 0) {
			return parseInt(x.replace(/,/g, ''));
		} else {
			return 0;
		}
	}
	getAverage(val, count) {
		return this.numberWithCommas(Number(val / count).toString());
	}
	returnMDY(date) {
		if (date.toString().length > 0) {
			var rtn = date.toString();
			return rtn.substring(3, 5) + "/" + rtn.substring(5, 7) + "/" + rtn.substring(1, 3);
		}
		else
			return date;
	}

	sortByKey(key) {
		this.displaytable[this.laneState] = this.sortByKey2(this.displaytable[this.laneState], key);
	}
	sortByKey2(array, key) {
		if (this.curSort != key) {
			this.curSort = key;
			return array.sort(function (a, b) {
				var x = a[key]; var y = b[key];
				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			});
		} else {
			this.curSort = "";
			return array.sort(function (a, b) {
				var x = a[key]; var y = b[key];
				return ((x > y) ? -1 : ((x < y) ? 1 : 0));
			});
		}
	}
	get2digit(val) {
		if (val.length < 2) {
			return "0" + val;
		} else
			return val;
	}

	// onDateSelection(dateany;) {
	// 	if (!this.fromDate && !this.toDate) {
	// 	  this.fromDate = date;
	// 	} else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
	// 	  this.toDate = date;
	// 	} else {
	// 	  this.toDate = null;
	// 	  this.fromDate = date;
	// 	}
	//   }
	//   isHovered(dateany;) {
	// 	return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
	//   }
	
	//   isInside(dateany;) {
	// 	return date.after(this.fromDate) && date.before(this.toDate);
	//   }
	
	//   isRange(dateany;) {
	// 	return date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
	//   }
}