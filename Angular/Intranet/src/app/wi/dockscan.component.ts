import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService }	from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';

declare var $:any;

@Component({
  selector: 'dockscan',
  templateUrl: '../../pages/WI-dockscan.html',
  styles: [	'.odd { background-color: #F5F5DC;}' +
			'.even { background-color: #F0FFFF;}' +
			'.oddrow td { font-size:12px; background-color:rgba(150,150,150,0.1);}' +
			'.evenrow td { font-size:12px; }' +
			'.totals th {  font-size: 17px;  text-align: center;   padding-right: 2px;   background-color: white;   color: black;   border: 1px solid blue;   width: 60px;   height: 50px;   font-weight: bold;}' +
			'thead th { font-size: 16px;text-align: center; border: 2px solid black; border-bottom: 2px solid black; padding-right: 2px; color: white; background-color: #CC0000;    min-width: 70px;    height: 30px;}' +
			'td label {width:100%; height:100%;}']
})
export class dockscanComponent {

public userManagement: any;
public tabledisplay:any;
public tabledata:any;
public tablelabels:any;
public keyORG:string;
public keyDST:string;
public keyFDST:string;
public trm:string;

public scrollWidth:any = 0;
public scrollHeight:any = 0;

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
			url: environment.API + "/wi/dockscan",
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
			var data = response.SCANS;
			for(var i = 0; i < data.length; i++){
				if(!this.tabledata[data[i].SCEDATE]){
					this.tabledata[data[i].SCEDATE] = {};
				}
				// if(!this.tabledata[data[i].SCEDATE][data[i].SCTERM]){
				// 	this.tabledata[data[i].SCEDATE][data[i].SCTERM] = [];
				// }
			//this.tabledata[data[i].SCEDATE][data[i].SCTERM][this.tabledata[data[i].SCEDATE][data[i].SCTERM].length] = data[i];
				this.tabledata[data[i].SCEDATE][data[i].SCTERM]= data[i];
			}
			if(response.BILLS){
				data = response.BILLS;
			for(var i = 0; i < data.length; i++){
				if(!this.tabledata[data[i].SCEDATE]){
					this.tabledata[data[i].SCEDATE] = {};
				}
				if(!this.tabledata[data[i].SCEDATE][data[i].SCTERM])
					this.tabledata[data[i].SCEDATE][data[i].SCTERM] = {};

				if(this.tablelabels.indexOf(data[i].SCTERM) == -1)
					this.tablelabels[this.tablelabels.length] = data[i].SCTERM;

				this.tabledata[data[i].SCEDATE][data[i].SCTERM]["BILLS"] = data[i].BILLS;
			}
			}
			//this.tablelabels = this.objectkeys(this.tabledata[Object.keys(this.tabledata).sort().pop()]);
			this.tablelabels = this.tablelabels.sort();
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
	getDataTable(keyx,keyy){
		this.keyDST = keyy;
		this.keyORG = keyx;		
	}
	returnMDY(date){
		if(date){
		var rtn = date.toString();
		return rtn.substring(3,5) + "/" + rtn.substring(5,7) + "/" + rtn.substring(1,3);
		}
		else
			return " ";
	}

	getPercent(fm,to){
		var rtn = Number(Number((fm/to) * 100).toFixed(0));
		if(isNaN(rtn))
			return 0;
		else
			return rtn;
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