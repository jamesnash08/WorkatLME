import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';
import {ExcelService} from '../services/excel.service';

declare var $: any;

@Component({
	selector: 'OpsDashboard',
	templateUrl: './driverhours.html',
	styleUrls: ['./driverhours.css']
})
export class driverhoursComponent {

	public userManagement: any;

	public displayinfo: any;
	public displaytable: any = false;
	private tabledata: any;
	public graphKey: string;
	public monthlyTable: any;
	public monthlyTable2: any;
	private curSort: string;
	public terminal: string;
	public months: any = [];

	public displaytrlr:any = [];
	public TRLRrow:any = {};

	public empAverage:string = "";
	public empFName:string = "";
	public empLName:string = "";
	public displayAverage:any = {
		TLSTRT:0,
		CPCLTM:0,
		LEAVE:0,
		BETWEEN:0,
		CPRTTM:0,
		TLSTOP:0,
		TLDRIV:0,
		TLDOC:0,
		TLLNHL:0
	};

	public fromdate:string;
	public todate:string;

	public err:string;

	public titles: any = {
		CPTRMA: "TRM",
		TLDATE:"DATE",
		CPTRLR: "TRLR",
		CPDRVR: "EMP",
		FNAME: "FIRST NAME",
		LNAME: "LAST NAME",
		TLSTRT: "PUNCH IN",
		START:"START",
		CPCLTM: "LOAD CLS",
		LEAVE: "LEAVE TIME",
		BETWEEN:"TIME BEFORE",
		CPRTTM:"RETURN TIME",
		TLSTOP: "PUNCH OUT",
		TLDRIV: "DRIVE HOURS",
		TLDOCK: "DOCK",
		TLLNHL: "LINEHAUL"
	};

	public trlrtitles: any = {
		CPSCAC: "SCAC",
		CPPUDL: "CPPUDL",
		CPPRON: "PRO",
		CPSUFX: "SUFX",
		CPEXC1: "EXC",
		CPEXC2: "EXC",
		CPEXC3: "EXC",
		CPTMIN: "IN",
		CPTMOT:"OUT",
		CPUNIT:"HU"
	};
	public currCymd: number;

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService,
		private excelService:ExcelService) {
		this.userManagement = loginSvc;
		this.displayinfo = null;
		this.displaytable = [];
		// this.fromDate = calendar.getToday();
    // this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);

	}

	ngOnInit() {
		var date = new Date();
		
	}

	setClick(row,key){
		if(key == "CPTRLR"){
			if(row == this.TRLRrow){
				this.TRLRrow = {};
				this.displaytrlr = [];
			}else
				this.getTrailerManifest(row);			
		}else{
			this.setAverage(row.CPDRVR);
		}
	}

	getTrailerManifest(row){
		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		var promise = $.ajax({
			url: environment.API + "/ops/getTrailerManifest",
			method: 'post',
			data: { 'trm': row.CPTRMA, 'trlr': row.CPTRLR,'cdate':Number("1" + row.TLDATE.toString()),'ctime':row.CPCLTM},
			dataType: 'json'
		});
		promise.done(function (res) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			if(res.error){
				this.err = res.error;
			}else{
				this.displaytrlr = res;
				this.TRLRrow = row;
			}
		}.bind(this));

		promise.fail(function (err) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			console.log(err.toString());
		});
	}

	setAverage(emp){
		this.displayAverage = {
			TLSTRT:0,
			LEAVE:0,
			BETWEEN:0,
			CPRTTM:0,
			TLSTOP:0,
			TLDRIV:0,
			TLDOCK:0,
			TLLNHL:0
		};
		this.empAverage = emp;
		var days = 0;
		for(var i=0;i<this.tabledata.length;i++){
			if(this.tabledata[i].CPDRVR == emp){
				days++;
				this.empFName = this.tabledata[i].FNAME;
				this.empLName = this.tabledata[i].LNAME;
				var keys = Object.keys(this.displayAverage);
				for(var j=0; j<keys.length;j++){
					var newfield = Number(this.tabledata[i][keys[j]]);
					if(newfield <= 99)
						newfield *= 100;
					this.displayAverage[keys[j]] += newfield;
				}
			}
		}
		for(var j=0; j<keys.length;j++){
			this.displayAverage[keys[j]] = Number(this.displayAverage[keys[j]] / (days)).toFixed(0);
		}
	}

	exportExcel(){
		this.excelService.exportAsExcelFile(this.displaytable, 'Driver_Hours');
	}

	updateStart(row){
		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');

		var promise = $.ajax({
			url: environment.API + "/ops/setPunchtime",
			method: 'post',
			data: { 'emp': row.CPDRVR, 'user': this.userManagement.getUser(),'punch':row.START},
			dataType: 'json'
		});
		promise.done(function (res) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			if(res.error){
				this.err = res.error;
			}else{
				this.err = res.success;
		}
		}.bind(this));

		promise.fail(function (err) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			console.log(err.toString());
		});
	}

	getDriverHours(trm) {
		if(trm > "" && this.fromdate != undefined && this.todate != undefined){
		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
			var fcymd =  this.fromdate.replace(/-/g,'').substring(2);
			var tcymd =  this.todate.replace(/-/g,'').substring(2);

		var promise = $.ajax({
			url: environment.API + "/ops/driverhours",
			method: 'post',
			data: { 'trm': trm, 'fdate': fcymd,'tdate':tcymd},
			dataType: 'json'
		});
		promise.done(function (res) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			if(res.error){
				this.err = res.error;
			}else{
			for(var i=0; i<res.length;i++){
				res[i]['BETWEEN'] = Number(Number(res[i]['LEAVE']) - Number(res[i]['TLSTRT'])).toFixed(2);
			}
			this.displaytable = res;
			this.tabledata = res;
		}
		}.bind(this));

		promise.fail(function (err) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			console.log(err.toString());
		});
	}else{
		this.err = "Terminal or dates not sent";
	}
	}

	displayCell(row,key){
		if(key == 'LEAVE')
			return Number(row[key]).toFixed(2);
		else if(key == 'TLDATE'){
			return row[key].substring(2,4) + "/" + row[key].substring(4) + "/" + row[key].substring(0,2);
		} else if(key == "TLSTRT"){
			if(row[key] == 0)
				return "PU only";
			else
				return row[key];
		}else
			return row[key];
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
		this.displaytable = this.sortByKey2(this.displaytable, key);
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
	get2Digit(val) {
		if (val.toString().length == 1)
			return "0" + val.toString();
		else
			return val.toString();
	}

	getTimeBetween(punchin,start){

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