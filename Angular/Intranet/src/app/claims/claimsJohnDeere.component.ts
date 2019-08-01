import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService }	from '../Authentication/authentication.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

declare var $:any;

@Component({
  selector: 'claimsJohnDeere',
  templateUrl: '../../pages/claimsJohnDeere.html',
  styles: [	'.odd { background-color: #F5F5DC;}' +
			'.even { background-color: #F0FFFF;}' +
			'.odd tr { background-color: #F5F5DC;}' +
			'.even tr { background-color: #F0FFFF;}' +
			'.pagebreak {page-break-after: always}' +
			'']
})
export class claimsJohnDeereComponent {
//public objectKeys = Object.keys;
public userManagement: any;
public quarterData:any;
public annualData:any;
public fulldata:any;
public Xpos:number;
public Ypos:number;
public Zpos:number;
public types:any;
public typesDisplay:any;
public keys:any;
public lineChartLabel:any;
public quarterSelect:string;

public accColors:any = [];
public tableColors:any = [];
public accTitle:any = {330583:"Non-Managed  Code #",330584:"Dealer Parts - Quad Cities, Milan, Code  #",330586:"Managed Freight - CH Robinson  #",330589:"A&I #", 385556:"Dealer Parts - Quad Cities, Milan, Code  #",498379:"A&I #", 855824:"Managed Freight - CH Robinson  #",684253:"Non-Managed  Code #"};

public lineChartData:any;
public lineChartOptions:any = {
     responsive: true,
	 maintainAspectRatio:false
  };
  public lineChartColors:Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,130,180,0.7)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(60,132,60,0.7)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }
  ];
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'bar';
  public claimsType:string;

  constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService,
		public _sanitizer: DomSanitizer) {
		this.userManagement = loginSvc;
		this.types = ['c','s','v'];
		this.typesDisplay = {'c':'Concealed','s':'Short','v':'Visible'};
		this.keys = ['PaidTOT','PaidAMT','DenyTOT','DenyAMT','PendTOT','PendAMT'];
		
		this.lineChartLabel = [
			"Quarter 1",
			"Quarter 2",
			"Quarter 3",
			"Quarter 4"
		];
		this.lineChartData = [];
		this.Xpos = -1;
		this.tableColors[0] = ['ffffff','ff0000','ccffcc','00ccff','ff00ff','ff943b','fffd00','370bcf','1e0dd0'];
		this.tableColors[1] = ['000000','ffffff','000000','000000','000000','000000','000000','000000','ffffff'];

		this.accColors[0] = {YTD:"ffffff",ALL:"ff0000", 330583:"ff00ff",330584:"ccffcc",330586:"00ccff",330589:"ff943b", 385556:"ccffcc",498379:"ff943b", 855824:"00ccff",684253:"ff00ff"};
		this.accColors[1] = {YTD:"000000",ALL:"ffffff", 330583:"000000",330584:"000000",330586:"000000",330589:"000000", 385556:"000000",498379:"000000", 855824:"000000",684253:"000000"};
}

	ngOnInit() {
	
		if(!this.userManagement.hasAuth("ALL")){
			this.router.navigate(['/']);
		}
	
		
		//this.claimsType = "Transaction";
		
		var promise = $.ajax({
				url: environment.API + '/claims/claimsJohnDeere',
				method: 'post',
				dataType: 'json'
			});
		promise.done(function(data) {
			//this.fulldata = data;
			this.fulldata = {};//Year
			for(var i = 0; i < data.length; i++){
				var y = Number(data[i].CLRECD.substring(3,5)) > 10 ? Number(data[i].CLRECD.substring(1,3)) + 1 : Number(data[i].CLRECD.substring(1,3));
				if(!this.fulldata[y])
					this.fulldata[y] = [];//Quarter
				var q:number;
				switch (Number(data[i].CLRECD.substring(3,5))){
					case 11:
						q = 0;
						break;
					case 12:
						q=0;
						break;
					case 1:
						q=0;
						break;
					case 2:
						q=1;
						break;
					case 3:
						q=1;
						break;
					case 4:
						q=1;
						break;
					case 5:
						q=2;
						break;
					case 6:
						q=2;
						break;
					case 7:
						q=2;
						break;
					case 8:
						q=3;
						break;
					case 9:
						q=3;
						break;
					case 10:
						q=3;
						break;
				}
				if(!this.fulldata[y][q]){
					//this.fulldata[y][q] = {385556:[], 855824:[], 684253:[], 498379:[], 330583:[], 330584:[], 330586:[], 330589:[]};//Account
					this.fulldata[y][q] = {};
				}
				if(!this.fulldata[y][q][data[i].CLPAY])
					this.fulldata[y][q][data[i].CLPAY] = []; //pros

					this.fulldata[y][q][data[i].CLPAY][this.fulldata[y][q][data[i].CLPAY].length] = data[i];
			}
			this.quarterData = {};//Year
			this.annualData = {};
			for(let year in this.fulldata){
				this.quarterData[year] = [];//Quarter
				this.annualData[year] = {
					cPaidTOT:0,
					cDenyTOT:0,
					cPendTOT:0,
					cPaidAMT:0,
					cDenyAMT:0,
					cPendAMT:0,
					sPaidTOT:0,
					sDenyTOT:0,
					sPendTOT:0,
					sPaidAMT:0,
					sDenyAMT:0,
					sPendAMT:0,
					vPaidTOT:0,
					vDenyTOT:0,
					vPendTOT:0,
					vPaidAMT:0,
					vDenyAMT:0,
					vPendAMT:0
				}; //Info
				for(var q = 0; q < this.fulldata[year].length; q++){
					this.quarterData[year][q] = {};//Account
					this.quarterData[year][q]["ALL"] = {
						cPaidTOT:0,
						cDenyTOT:0,
						cPendTOT:0,
						cPaidAMT:0,
						cDenyAMT:0,
						cPendAMT:0,
						sPaidTOT:0,
						sDenyTOT:0,
						sPendTOT:0,
						sPaidAMT:0,
						sDenyAMT:0,
						sPendAMT:0,
						vPaidTOT:0,
						vDenyTOT:0,
						vPendTOT:0,
						vPaidAMT:0,
						vDenyAMT:0,
						vPendAMT:0
					}; //Info
					for(let acc in this.fulldata[year][q]){
						this.quarterData[year][q][acc] = {
							cPaidTOT:0,
							cDenyTOT:0,
							cPendTOT:0,
							cPaidAMT:0,
							cDenyAMT:0,
							cPendAMT:0,
							sPaidTOT:0,
							sDenyTOT:0,
							sPendTOT:0,
							sPaidAMT:0,
							sDenyAMT:0,
							sPendAMT:0,
							vPaidTOT:0,
							vDenyTOT:0,
							vPendTOT:0,
							vPaidAMT:0,
							vDenyAMT:0,
							vPendAMT:0
						}; //Info
						for(var p = 0;p < this.fulldata[year][q][acc].length;p++){
							var result = this.fulldata[year][q][acc][p];
							var key:string = "";
							var val:number;
							if(result.CLCLSS == 'C' || result.CLCLSS == 'S')
								key = result.CLCLSS.toLowerCase();
							else
								key = 'v';
							if(Number(result.CLAPPA) > 0){//Paid Claim
								key += "Paid";
								val = result.CLAPPA;
							}else if(result.CLDDTE.length > 1){
								key += "Deny";
								val = result.CLMAMT;
							}else{
								key += "Pend";
								val = result.CLMAMT;
							}
							var keyTOT = key + "TOT";
							var keyAMT = key + "AMT";

							this.annualData[year][keyTOT] += 1;
							this.annualData[year][keyAMT] = (Number(val) + Number(this.annualData[year][keyAMT])).toFixed(2);
							this.quarterData[year][q]["ALL"][keyTOT] += 1;
							this.quarterData[year][q]["ALL"][keyAMT] = (Number(val) + Number(this.quarterData[year][q]["ALL"][keyAMT])).toFixed(2);
							this.quarterData[year][q][acc][keyTOT] += 1;
							this.quarterData[year][q][acc][keyAMT] = (Number(val) + Number(this.quarterData[year][q][acc][keyAMT])).toFixed(2);
							//this.Xpos = year;
							//this.Ypos = q;
						}	
					}
				}

			}
			for(let year in this.fulldata){
				for(var q = 0; q < this.fulldata[year].length; q++){
					for(let acc in this.fulldata[year][q]){
						for(var p = 0;p < this.fulldata[year][q][acc].length;p++){
							this.quarterData[year][q]["YTD"] = this.annualData[year];
						}
					}
				}

			}

		}.bind(this));

		promise.fail(function(response) {

		});
	
	}

selectGraph(year,acc,type){
	this.lineChartData = [];
	var typeAMT = type + "AMT";
	var typeTOT = type + "TOT";
	this.selectGraphTOT(year,acc,typeTOT);
	this.selectGraphAMT(year,acc,typeAMT);	
}

selectGraphTOT(year,acc,type){
	this.lineChartData[0] = [];
	for(var x = 0;x<1;x++){
		this.lineChartData[0][x] = {data:[],label:"Account " + acc + " # Claims"};
		for(var z=0;z<12;z++){
			if(this.quarterData[year][z])
				this.lineChartData[0][x].data[z] = Number(this.quarterData[year][z][acc][type]);
			else
				this.lineChartData[0][x].data[z] = 0;
		}
	}
}
selectGraphAMT(year,acc,type){
	this.lineChartData[1] = [];
	for(var x = 0;x<1;x++){
		this.lineChartData[1][x] = {data:[],label:"Account " + acc + " $ Claims"};
		for(var z=0;z<12;z++){
			if(this.quarterData[year][z])
				this.lineChartData[1][x].data[z] = Number(this.quarterData[year][z][acc][type]);
			else
				this.lineChartData[1][x].data[z] = 0;
		}
	}
}



numberWithCommasDecimal(x) {
		var rtnval;
		var y = Number(x);
		if(isNaN(y))
			y = 0;
		return y.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	}
	numberWithCommas(x) {
		var rtnval;
		var y = Number(x);
		if(isNaN(y))
			y = 0;
		return y.toFixed(0).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	}
	//this.keys = ['PaidTOT','PaidAMT','DenyTOT','DenyAMT','PendTOT','PendAMT'];
getRecTOT(key,type){
	return this.quarterData[this.Xpos][this.Ypos][key][type+"PaidTOT"] + this.quarterData[this.Xpos][this.Ypos][key][type+"DenyTOT"] + this.quarterData[this.Xpos][this.Ypos][key][type+"PendTOT"];
}
getRecAMT(key,type){
	
		return this.numberWithCommasDecimal(this.getRecAMT2(key,type));
}
getRecAMT2(key,type){
	return Number(this.quarterData[this.Xpos][this.Ypos][key][type+"PaidAMT"]) + Number(this.quarterData[this.Xpos][this.Ypos][key][type+"DenyAMT"]) + Number(this.quarterData[this.Xpos][this.Ypos][key][type+"PendAMT"]);
}
getConTOT(key,type){
	return this.quarterData[this.Xpos][this.Ypos][key][type+"PaidTOT"] + this.quarterData[this.Xpos][this.Ypos][key][type+"DenyTOT"];
}
getConAMT(key,type){
	return this.numberWithCommasDecimal(this.getConAMT2(key,type));
}
getConAMT2(key,type){
	return Number(this.quarterData[this.Xpos][this.Ypos][key][type+"PaidAMT"]) + Number(this.quarterData[this.Xpos][this.Ypos][key][type+"DenyAMT"]);
}
getAMT(key,type){
	if(type.indexOf("TOT") > -1)
		return this.numberWithCommas(this.getAMT2(key,type));
	else
	return this.numberWithCommasDecimal(this.getAMT2(key,type));
}
getAMT2(key,type){
	return Number(this.quarterData[this.Xpos][this.Ypos][key]['c' + type]) + Number(this.quarterData[this.Xpos][this.Ypos][key]['s' + type]) + Number(this.quarterData[this.Xpos][this.Ypos][key]['v' + type]);
}
getRecAMTTotal(key){
	return this.numberWithCommasDecimal(this.getRecAMT2(key,'c') + this.getRecAMT2(key,'s') + this.getRecAMT2(key,'v'));
}
getConAMTTotal(key){
	return this.numberWithCommasDecimal(this.getConAMT2(key,'c') + this.getConAMT2(key,'s') + this.getConAMT2(key,'v'));
}
objectkeys(row){
	if(row){
	return Object.keys(row);
	}
	else
		return [];
}
objectkeys2(row){
	var arr:any;
	arr = Object.keys(row);
	arr.splice(arr.length-2,2);
	arr.splice(0,0,"YTD","ALL");
	return arr;
}

setPeriod(year,quarter){
	this.Xpos = year;
	this.Ypos = quarter;
}

getColor(key){
	//return this._sanitizer.bypassSecurityTrustStyle("background-color: #" + this.accColors[key] + ";");
	// return this._sanitizer.bypassSecurityTrustStyle("background-color: #" + this.tableColors[0][key] + "; color: #" + this.tableColors[1][key] + ";");
	return this._sanitizer.bypassSecurityTrustStyle("background-color: #" + this.accColors[0][key] + "; color: #" + this.accColors[1][key] + ";");
}

Print(){
	var w = window.open();

			var html = "<!DOCTYPE HTML>";
			html += '<html lang="en-us">';
			html += '<head><style>'+
			'@page {size: landscape;}' +
			'p{font-size:14px;}' +
			'table td{padding-left:5px;	padding-bottom:2px;border: 1px solid black;}' +
			'table{border-collapse: collapse;width:100%;height:100%; margin-bottom:15px;}' +
			'thead{border:1px solid black;}' +
			'th{border:1px solid black;} ' +
			'button{display:none;}' +
			'canvas{display:block;}' +
			'.pagebreak {page-break-after: always}' +
			//'.border_under {border-bottom: 2px solid black;display: inline-block;margin-bottom:5px;min-width:400px;max-width:805px;}'+
			//'.subtitle{color: #000000;font-size: 18px;font-family:arial;font-weight:bold;font-style: italic;}'+
			'</style></head>';
			html += "<body>";
			html += $('#Print').html();
			html += "</body></html>";
			w.document.write(html);
			w.window.print();
			w.document.close();
}

}
