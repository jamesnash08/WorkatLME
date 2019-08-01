import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService }	from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';

declare var $:any;

@Component({
  selector: 'weightscales',
  templateUrl: '../../pages/WI-weightscales.html',
  styles: [	'.odd { background-color: #F5F5DC;}' +
			'.even { background-color: #F0FFFF;}' +
			'.oddrow td { font-weight:bold; font-size:14px; background-color:rgba(150,150,150,0.3);}' +
			'.evenrow td { font-size:14px; font-weight:bold; }' +
			'.totals th {  font-size: 17px;  text-align: center;   padding-right: 2px;   background-color: white;   color: black;   border: 1px solid blue;   width: 60px;   height: 50px;   font-weight: bold;}' +
			'thead th { font-size: 16px;text-align: center; border: 2px solid black; border-bottom: 2px solid black; padding-right: 2px; color: white; background-color: #CC0000;    min-width: 70px;    height: 30px;}' +
			'td label {width:100%; height:100%;}']
})
export class weightscalesComponent {

public userManagement: any;
public tabledisplay:any;
public tabledata:any;
public tablelabels:any;
public keyORG:string;
public keyDST:string;
public keyFDST:string;
public trm:string;

  constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService) {
		this.userManagement = loginSvc;
		this.tabledisplay = {};
		this.tablelabels = [];
		this.keyORG = "";
		this.keyDST = "";
		this.keyFDST = "";
}
	ngOnInit() {
		if(!this.userManagement.checkLogin()){
			this.router.navigate(['/']);
		}
		this.trm = this.userManagement.getTerminals();
		this.getData();
	}
	
	getData(){
		$('#content').append('<div id="loadingdiv">' +
		'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		var promise = $.ajax({
			url: environment.API + "/wi/weightscales",
			method: 'post',
			dataType: 'json'
		});
		promise.done(function(response) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			this.tabledisplay = {};
			this.tabledata = {};
			this.tablelabels = [];
			var org = "";
			var dst = "";
			var fdst = "";
			for(var i = 0; i < response.length; i++){
				if(!this.tabledata[response[i].WSDATE]){
					this.tabledata[response[i].WSDATE] = {};
				}
				if(!this.tabledata[response[i].WSDATE][response[i].TRM]){
					this.tabledata[response[i].WSDATE][response[i].TRM] = [];
				}
				this.tabledata[response[i].WSDATE][response[i].TRM][this.tabledata[response[i].WSDATE][response[i].TRM].length] = response[i];
			}
			this.tablelabels = ["CGO","DSM","KCS"];
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