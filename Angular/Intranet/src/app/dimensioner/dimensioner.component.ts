import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService }	from '../Authentication/authentication.service';
import { tableService } from '../services/table.service';
import { environment } from '../../environments/environment';
import {ExcelService} from '../services/excel.service';

declare var $:any;

@Component({
  	selector: 'dimensioner',
  	templateUrl: './dimensioner.html',
  	styles: [	'.odd { background-color: #F5F5DC;}' +
			'.even { background-color: #F0FFFF;}' +
			'.oddrow td { font-weight:bold; font-size:14px; background-color:rgba(150,150,150,0.3);}' +
			'.evenrow td { font-size:14px; font-weight:bold; }' +
			'.totals th {  font-size: 17px;  text-align: center;   padding-right: 2px;   background-color: white;   color: black;   border: 1px solid blue;   width: 60px;   height: 50px;   font-weight: bold;}' +
			'thead th { font-size: 16px;text-align: center; border: 2px solid black; border-bottom: 2px solid black; padding-right: 2px; color: white; background-color: #CC0000;    min-width: 70px;    height: 30px;}' +
			'td label {width:100%; height:100%;}']
})
export class dimensionerComponent {

public userManagement: any;
public tabledisplay:any=[];
public tabledata:any;
public tableweighed:any={};
public tablepros:any={};
public tablelabels:any=[];
public dimData:any;
public searchOption:string;
public tableSearch:any = [];
public searchVal:string = ""
public searchBool:boolean = false;;

public detaillabels:any=[];
public keyTRM:string="";
public keyCYMD:string="";
public trm:string;
public tableCYMD:any=[];

  constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService,
		public tableService: tableService,
		private excelService:ExcelService) {
		this.userManagement = loginSvc;
}
	ngOnInit() {
		if(!this.userManagement.checkLogin()){
			this.router.navigate(['/']);
		}
		this.trm = this.userManagement.getTerminals();
		this.getData();
	}
	exportExcel(){
		if(this.tableSearch)
			this.excelService.exportAsExcelFile(this.tableSearch, 'Dimensioner');
		else if(this.tableCYMD.length > 0)
		this.excelService.exportAsExcelFile(this.tableCYMD, 'Dimensioner');
		// else if(this.tableCYMD.length > 0)
		// this.excelService.exportAsExcelFile(this.tableCYMD, 'Dimensioner');
	}
	
	getData(){
		$('#content').append('<div id="loadingdiv">' +
		'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		var promise = $.ajax({
			url: environment.API + "/wi/dimensioner",
			method: 'post',
			dataType: 'json'
		});
		promise.done(function(response) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			this.dimData = response;
			this.tabledisplay = {};
			this.tabledata = {};
			this.tableweighed = {};
			this.tablelabels = [];
			var lstpro;
			var lstprow;
			for(var i = 0; i < response.length; i++){
				if(!this.tabledata[response[i].CYMD]){
					this.tabledata[response[i].CYMD] = {};
					this.tableweighed[response[i].CYMD]={};
					this.tablepros[response[i].CYMD]={};
				}
				if(!this.tabledata[response[i].CYMD][response[i].TRM]){
					this.tabledata[response[i].CYMD][response[i].TRM] = [];
					this.tableweighed[response[i].CYMD][response[i].TRM]=[];
					this.tablepros[response[i].CYMD][response[i].TRM]={"scans":0,"weighed":0};
				}
				response[i].WEIGHT = Number(response[i].WEIGHT);
				response[i].DCLASS = Number(response[i].DCLASS);
				response[i].DIMDATE = Number(response[i].DIMDATE);
				response[i].DENSITY = Number(response[i].DENSITY);
				response[i].HEIGHT = Number(response[i].HEIGHT);
				response[i].LENGTH = Number(response[i].LENGTH);
				response[i].WIDTH = Number(response[i].WIDTH);
				response[i].CUBE = Number(response[i].CUBE);
				this.tabledata[response[i].CYMD][response[i].TRM][this.tabledata[response[i].CYMD][response[i].TRM].length] = response[i];
				if(response[i].WEIGHT > 0){
					this.tableweighed[response[i].CYMD][response[i].TRM][this.tableweighed[response[i].CYMD][response[i].TRM].length] = response[i];
				}
				if(response[i].PRO != lstpro){
					lstpro = response[i].PRO;
					lstprow = response[i].WEIGHT;
					this.tablepros[response[i].CYMD][response[i].TRM].scans++;
					if(response[i].WEIGHT > 0)
						this.tablepros[response[i].CYMD][response[i].TRM].weighed++;
				}else if(lstprow == 0 && response[i].WEIGHT > 0){
					lstprow = response[i].WEIGHT;
					this.tablepros[response[i].CYMD][response[i].TRM].weighed++;
				}
			}
			this.tablelabels = ["CGO","DSM","FAR","KCS"];
			this.detaillabels = ["PRO","TRM","EMP","LENGTH","WIDTH","HEIGHT","WEIGHT","CUBE","DENSITY","DCLASS","BILLTO","CONS","SHIPPER","DIMTIME","DIMDATE"];
		}.bind(this));
		promise.fail(function(response) {
		});
	}

	objectkeys(row){
		if(row)
			return Object.keys(row);
		else
			return [];
	}
	numberWithCommasDecimal(x,z) {
		var rtnval;
		var y = Number(x);
		if(isNaN(y))
			y = 0;
		return y.toFixed(z).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	}
	returnMDY(date){
		if(date.toString().length > 0){
		var rtn = date.toString();
		return rtn.substring(3,5) + "/" + rtn.substring(5,7) + "/" + rtn.substring(1,3);
		}
		else
			return date;
	}

	getValue(val,key){
		if(key == "DIMDATE"){
			val = val.toString();
			return val.substring(4,6) + "/" + val.substring(6) + "/" + val.substring(2,4);
		}else if(key == "DIMTIME"){
			if(val.length < 6)
				val = "0" + val;
			val = val.toString().substring(0,2) + ":" + val.toString().substring(2,4) + ":" + val.toString().substring(4);
			return val;
		}else if(key == "WEIGHT"){
			val = this.numberWithCommasDecimal(val,1);
			return val.substring(0,val.indexOf('.'));
		}else if(key == "LENGTH" || key == "WIDTH" || key == "HEIGHT"){
			return this.numberWithCommasDecimal(val,1);
		}else if(key == "CUBE" || key == "DENSITY"){
			return this.numberWithCommasDecimal(val,2);
		}else if(key == "BILLTO" || key == "CONS" || key == "SHIPPER"){
			return val == 0? '' : val;
		}else
			return val;
	}

	setCYMDTable(date){
		//this.curSort = "";
		this.keyCYMD = date;
		this.tableCYMD = [];
		for(var i=0;i<this.tablelabels.length;i++){
			var trm = this.tablelabels[i];
			if(this.tabledata[date][trm])
				for(var j=0;j<this.tabledata[date][trm].length;j++){
					this.tableCYMD[this.tableCYMD.length] = this.tabledata[date][trm][j];
				}
		}
	}

	changeSearch(key,val){
		this.searchBool = false;
		this.tableSearch = [];
		for(var i = 0; i < this.dimData.length;i++){
			var val2 = "" + this.dimData[i][key];
			if(val.trim() == val2.trim()){				
				this.tableSearch[this.tableSearch.length] = this.dimData[i];
				this.searchBool = true;
			}
		}
		if(this.dimData.length == 0){
		}
		// this.sortByKey(this.tableSearch,key);
	}

	checkSearch(val){
		if(val.trim().length == 0)
			this.searchBool = false;
	}

	sortByKey(array, key) {
		document.getElementById('tablebody').scrollTop = 0;
		this.tableService.sortByKey(array,key);
	}
}