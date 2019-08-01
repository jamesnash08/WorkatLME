import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService }	from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';

declare var $:any;

@Component({
  selector: 'reweigh',
  templateUrl: '../../pages/WI-reweigh.html',
  styles: [	'.odd { background-color: #F5F5DC;}' +
			'.even { background-color: #F0FFFF;}' +
			'.oddrow td { font-weight:bold; font-size:14px; background-color:rgba(150,150,150,0.3);}' +
			'.evenrow td { font-size:14px; font-weight:bold; }' +
			'.totals th {  font-size: 17px;  text-align: center;   padding-right: 2px;   background-color: white;   color: black;   border: 1px solid blue;   width: 60px;   height: 50px;   font-weight: bold;}' +
			'thead th { font-size: 16px;text-align: center; border: 2px solid black; border-bottom: 2px solid black; padding-right: 2px; color: white; background-color: #CC0000;    min-width: 70px;    height: 30px;}' +
			'td label {width:100%; height:100%;}' +
			'.hidecolumn {background-color:white !important; color:white !important; width:5px !important; border:0px !important;}']
})
export class reweighComponent {

public userManagement: any;
public tabledisplay:any = {};
public tabledata:any = {};
public tablelabels:any = [];
public keyORG:string;
public keyDST:string;
public keyFDST:string;
public TTRML:string;
public tabletotal:any = {};
public tablelabelsdisplay:any={};

  constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService) {
		this.userManagement = loginSvc;
}
	ngOnInit() {
		if(!this.userManagement.checkLogin()){
			this.router.navigate(['/']);
		}
		this.TTRML = this.userManagement.getTerminals();
		this.getData();
	}
	
	getData(){
		$('#content').append('<div id="loadingdiv">' +
		'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		var promise = $.ajax({
			url: environment.API + "/wi/getReweighInfo",
			method: 'post',
			dataType: 'json'
		});
		promise.done(function(response) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			var week;
			var bool = true;
			var lsttrm = "";
			this.tabledisplay = {};
			this.tabledata = {};
			this.tablelabels = [];
			this.tabletotal = {
				"DOB":0,
				"DRW":0,
				"DPC":0,
				"WOB":0,
				"WRW":0,
				"WPC":0,
				"MOB":0,
				"MRW":0,
				"MPC":0,
			};

			for(var i = 0; i < response.length; i++){
				var date = new Date(response[i].TRDATE);
				response[i].REWEIGHED = Number(response[i].REWEIGHED);
				response[i].OUTBOUND = Number(response[i].OUTBOUND);
				response[i].RWPERCENT = Number(response[i].RWPERCENT);
				if(!this.tabledata[response[i].TTRML]){
					week = date.getDay();
					bool = true;
					this.tabledata[response[i].TTRML] = {
						"DOB":response[i].OUTBOUND,
						"DRW":response[i].REWEIGHED,
						"DPC":0,
						"WOB":0,
						"WRW":0,
						"WPC":0,
						"MOB":0,
						"MRW":0,
						"MPC":0,
					};
					this.tabledata[response[i].TTRML].DPC = (this.tabledata[response[i].TTRML].DRW / this.tabledata[response[i].TTRML].DOB) * 100;
					this.tabledata[response[i].TTRML].DPC = this.tabledata[response[i].TTRML].DPC.toFixed(2);
					this.tabletotal.DOB += response[i].OUTBOUND;
					this.tabletotal.DRW += response[i].REWEIGHED;
					this.tabletotal.DPC = (this.tabletotal.DRW / this.tabletotal.DOB) * 100; 	
					this.tabletotal.DPC = this.tabletotal.DPC.toFixed(2);	
				}
				if(date.getDay() <= week && bool){
				this.tabledata[response[i].TTRML].WOB += response[i].OUTBOUND; 	
				this.tabledata[response[i].TTRML].WRW += response[i].REWEIGHED;
				this.tabledata[response[i].TTRML].WPC = (this.tabledata[response[i].TTRML].WRW / this.tabledata[response[i].TTRML].WOB) * 100;
				this.tabledata[response[i].TTRML].WPC = this.tabledata[response[i].TTRML].WPC.toFixed(2);
				this.tabletotal.WOB += response[i].OUTBOUND;
				this.tabletotal.WRW += response[i].REWEIGHED;
				this.tabletotal.WPC = (this.tabletotal.WRW / this.tabletotal.WOB) * 100; 
				this.tabletotal.WPC = this.tabletotal.WPC.toFixed(2);
				}else
					bool = false;

				this.tabledata[response[i].TTRML].MOB += response[i].OUTBOUND; 					 	
				this.tabledata[response[i].TTRML].MRW += response[i].REWEIGHED;				 	
				this.tabledata[response[i].TTRML].MPC = (this.tabledata[response[i].TTRML].MRW / this.tabledata[response[i].TTRML].MOB) * 100; 		
				this.tabledata[response[i].TTRML].MPC = this.tabledata[response[i].TTRML].MPC.toFixed(2);	

				this.tabletotal.MOB += response[i].OUTBOUND;
				this.tabletotal.MRW += response[i].REWEIGHED; 
				this.tabletotal.MPC = (this.tabletotal.MRW / this.tabletotal.MOB) * 100; 
				this.tabletotal.MPC = this.tabletotal.MPC.toFixed(2);	
			}
			this.tablelabels = ["DOB","DRW","DPC","/","WOB","WRW","WPC","/","MOB","MRW","MPC"];
			this.tablelabelsdisplay = {
				"DOB":"OB",
				"DRW":"RW",
				"DPC":"%",
				"WOB":"OB",
				"WRW":"RW",
				"WPC":"%",
				"MOB":"OB",
				"MRW":"RW",
				"MPC":"%",
			};

			//this.tablelabels.sort();
		}.bind(this));
		promise.fail(function(response) {
		});
	}

	objectkeys(row){
		return Object.keys(row);
	}
	numberWithCommasDecimal(x) {
		var rtnval;
		var y = Number(x);
		if(isNaN(y))
			y = 0;
		return y.toFixed(0).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	}
	returnMDY(date){
		if(date.toString().length > 0){
		var rtn = "1" + date.toString();
		return rtn.substring(3,5) + "/" + rtn.substring(5,7) + "/" + rtn.substring(1,3);
		}
		else
			return date;
	}

	// getDataTotal(key){
	// 	var rtn:number = 0;
	// 	var keys = this.objectkeys(this.tabledata[this.keyORG][this.keyDST]);
	// 	for(var i = 0; i < keys.length; i++){
	// 		if(key == "Length")
	// 			rtn += Number(this.tabledata[this.keyORG][this.keyDST][keys[i]].length);
	// 		else
	// 			for(var j=0; j < this.tabledata[this.keyORG][this.keyDST][keys[i]].length;j++)
	// 				rtn += Number(this.tabledata[this.keyORG][this.keyDST][keys[i]][j][key]);
	// 	}
	// 	return rtn;
	// }
}