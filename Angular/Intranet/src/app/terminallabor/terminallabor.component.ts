import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';
import {ExcelService} from '../services/excel.service';

declare var $: any;

@Component({
	selector: 'OpsDashboard',
	templateUrl: './terminallabor.html',
	styleUrls: ['./terminallabor.css']
})
export class terminallaborComponent {

	public userManagement: any;

	public displayinfo: any;
	public displaytable: any = {};
	private tabledata: any;
	public graphKey: string;
	public monthlyTable: any;
	public monthlyTable2: any;
	private curSort: string;
	public terminal: string;
	public months: any = [];

	public dataState:string = "DCK";

	public displaytrlr:any = [];
	public TRLRrow:any = {};

	public empAverage:string = "";
	public empFName:string = "";
	public empLName:string = "";


	public fromdate:string;
	public todate:string;

	public err:string;

	public titles: any = {
	"DCK":{
		TLDATE:"DATE",
		'TLEMP#':"EMP",
		FNAME:"First Name",
		LNAME:"Last Name",
		DEPTCD:"Dept",
		TLSTRT:"Start",
		START:"START",
		TLSTOP:"Stop",
		TLDOCK:"DOCK",
		TLDRIV:"Drive",
		TLLNHL:"Linehaul",
		TLCLER:"Clerical",
		TLLNCH:"Lunch",
		TLVACH:"Vacation",
		TLADMN:"Admin",
		TLMEET:"Meeting"
	},
	"OFC":{
		TLDATE:"DATE",
		'TLEMP#':"EMP",
		FNAME:"First Name",
		LNAME:"Last Name",
		DEPTCD:"Dept",
		TLSTRT:"Start",
		START:"START",
		TLSTOP:"Stop",
		TLCLER:"Clerical",
		TLLNCH:"Lunch",
		TLVACH:"Vacation",
	}
	};


	public currCymd: number;

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService,
		private excelService:ExcelService) {
		this.userManagement = loginSvc;
		this.displayinfo = null;
		// this.fromDate = calendar.getToday();
    // this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);

	}

	ngOnInit() {
		// this.getData("ALL");
		
	}

	setClick(row,key){
	
	}
	
	updateStart(row){
		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');

		var promise = $.ajax({
			url: environment.API + "/ops/setPunchtime",
			method: 'post',
			data: { 'emp': row['TLEMP#'], 'user': this.userManagement.getUser(),'punch':row.START},
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

	getData(trm) {
		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
			var fcymd =  this.fromdate.replace(/-/g,'').substring(2);
			var tcymd =  this.todate.replace(/-/g,'').substring(2);
			
		var promise = $.ajax({
			url: environment.API + "/ops/TerminalLaborHours",
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
				this.displaytable = {"OFC":[],"DCK":[]};
				for(var i=0;i<res.length;i++){
					this.displaytable[res[i].DEPTCD][this.displaytable[res[i].DEPTCD].length] = res[i];
				}
			// this.displaytable = res;
			// this.tabledata = res;
		}
		}.bind(this));

		promise.fail(function (err) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			console.log(err.toString());
		});
	}

	exportExcel(){
		this.excelService.exportAsExcelFile(this.displaytable[this.dataState], 'Terminal_Labor_'+this.dataState);
	}

	displayCell(row,key){
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

	returnMDY(date) {
		if (date.toString().length > 0) {
			var rtn = date.toString();
			return rtn.substring(3, 5) + "/" + rtn.substring(5, 7) + "/" + rtn.substring(1, 3);
		}
		else
			return date;
	}

	sortByKey(key) {
		this.displaytable[this.dataState] = this.sortByKey2(this.displaytable[this.dataState], key);
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
}