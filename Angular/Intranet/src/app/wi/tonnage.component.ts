import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService }	from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';

declare var $:any;

@Component({
  selector: 'reweigh',
  templateUrl: '../../pages/WI-tonnage.html',
  styles: [	'.odd { background-color: #F5F5DC;}' +
			'.even { background-color: #F0FFFF;}' +
			'.oddrow td { font-weight:bold; font-size:14px; background-color:rgba(150,150,150,0.3);}' +
			'.evenrow td { font-size:14px; font-weight:bold; }' +
			'.totals th {  font-size: 17px;  text-align: center;   padding-right: 2px;   background-color: white;   color: black;   border: 1px solid blue;   width: 60px;   height: 50px;   font-weight: bold;}' +
			'thead th { font-size: 16px;text-align: center; border: 2px solid black; border-bottom: 2px solid black; padding-right: 2px; color: white; background-color: #CC0000;    min-width: 70px;    height: 30px;}' +
			'td label {width:100%; height:100%;}' +
			'.hidecolumn {background-color:white !important; color:white !important; width:5px !important; border:0px !important;}']
})
export class tonnageComponent {

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
			url: environment.API + "/wi/getTonnage",
			method: 'post',
			dataType: 'json'
		});
		promise.done(function(response) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			if(!response.error){
			this.tabledata = response;
			this.tablelabels = ["DKTRML","XWGT","WGT"];
			this.tablelabelsdisplay = {
				"DKTRML":"TRM",
				"XWGT":"X-DOCK WEIGHT",
				"WGT":"P&D WEIGHT"
			};
		}
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