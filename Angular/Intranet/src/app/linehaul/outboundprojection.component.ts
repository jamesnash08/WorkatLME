import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService }	from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';
declare var $:any;
declare var setTable:any;

@Component({
  selector: 'outboundprojection',
  templateUrl: '../../pages/LH-outboundprojection.html',
  styles: [	'.odd { background-color: #F5F5DC;}' +
			'.even { background-color: #F0FFFF;}' +
			'.oddrow td { font-weight:bold; font-size:14px; background-color:rgba(150,150,150,0.3);}' +
			'.evenrow td { font-size:14px; font-weight:bold; }' +
			'.totals th {  font-size: 17px;  text-align: center;   padding-right: 2px;   background-color: white;   color: black;   border: 1px solid blue;   width: 60px;   height: 50px;   font-weight: bold;}' +
			'thead th { font-size: 16px;text-align: center; border: 2px solid black; border-bottom: 2px solid black; padding-right: 2px; color: white; background-color: #CC0000;    min-width: 70px;    height: 30px;}' +
			'td label {width:100%; height:100%;}']
})
export class outboundprojectionComponent {

public userManagement: any;
public tabledisplay:any={};
public tabledata:any;
public tablelabels:any=[];
public handsondata:any=[];
public keyORG:string;
public keyDST:string;
public keyFDST:string;
public trm:string;
public table3:any;
public table4:any;
private tablebool:boolean = false;

  constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService) {
		this.userManagement = loginSvc;
		this.tabledisplay = {};
		this.tablelabels = [];
		this.keyORG = "";
		this.keyDST = "";
		this.keyFDST = "";
		this.table3 = [];
		this.table4 = [];
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
			url: environment.API + "/linehaul/outboundprojection",
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
				//if(this.trm.search(response[i].OPORGA) > -1 || this.trm.search("ALL") > -1){
				if(org != response[i].OPORGA){
					org = response[i].OPORGA;
					dst = "";
					fdst = "";
					if(this.tablelabels.indexOf(org) == -1)
						this.tablelabels[this.tablelabels.length] = org;
					this.tabledisplay[org] = {};
					this.tabledata[org] = {};
				}
				if(dst != response[i].OPDSTA){
					dst = response[i].OPDSTA;
					if(this.tablelabels.indexOf(dst) == -1)
						this.tablelabels[this.tablelabels.length] = dst;
					
					this.tabledisplay[org][dst]= {
						"OPORGA":org,
						"OPDSTA":dst,
						"OPHDUNITS":0,
						"OPTTLWGT":0,
						"OPSHP":0
					};
					this.tabledata[org][dst]= {};
				}
				if(fdst != response[i].OPSRVA){
					fdst = response[i].OPSRVA;
					this.tabledata[org][dst][fdst] = [];
				}
				this.tabledisplay[org][dst].OPHDUNITS = Number(this.tabledisplay[org][dst].OPHDUNITS) + Number(response[i].OPHDUNITS);
				this.tabledisplay[org][dst].OPTTLWGT = Number(this.tabledisplay[org][dst].OPTTLWGT) + Number(response[i].OPTTLWGT);
				this.tabledisplay[org][dst].OPSHP = Number(this.tabledisplay[org][dst].OPSHP) + Number(1);
				this.tabledata[org][dst][fdst][this.tabledata[org][dst][fdst].length] = response[i];
			//}

			}
			this.tablelabels.sort();
			setTimeout(function(){
				var options = {
					elementID : "tableID", // String
					width : window.innerWidth, // Integer or String(Percentage)
					height : window.innerHeight - 200//500 // Integer or String(Percentage)
				}
			setTable(options);
			}.bind(this),1);
		}.bind(this));
		promise.fail(function(response) {
		});
	}
	getOutboundStatus(fdst){
		this.keyFDST = fdst;
		var jsons = {org:this.keyORG,nxt:this.keyDST,dst:this.keyFDST};
		$('#content').append('<div id="loadingdiv">' +
		'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		var promise = $.ajax({
			url: environment.API + "/linehaul/outboundstatus",
			method: 'post',
			dataType: 'json',
			data:jsons
		});
		promise.done(function(data) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			if(data.pros)
				this.table3 = data.pros;	
			if(data.lefttoload)
				this.table4 = data.lefttoload;		
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
		if(date.toString().length > 0){
		var rtn = date.toString();
		return rtn.substring(3,5) + "/" + rtn.substring(5,7) + "/" + rtn.substring(1,3);
		}
		else
			return date;
	}

	getDataTotal(key){
		var rtn:number = 0;
		var keys = this.objectkeys(this.tabledata[this.keyORG][this.keyDST]);
		for(var i = 0; i < keys.length; i++){
			if(key == "Length")
				rtn += Number(this.tabledata[this.keyORG][this.keyDST][keys[i]].length);
			else
				for(var j=0; j < this.tabledata[this.keyORG][this.keyDST][keys[i]].length;j++)
					rtn += Number(this.tabledata[this.keyORG][this.keyDST][keys[i]][j][key]);
		}
		return rtn;
	}
}