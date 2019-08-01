import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService }	from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';

declare var $:any;

@Component({
  selector: 'OpsDashboard',
  templateUrl: './opsdaily.html',
  styles: [	'.odd { background-color: #F5F5DC;}' +
			'.even { background-color: #F0FFFF;}' +
			'.totals th {  font-size: 17px;  text-align: center;   padding-right: 2px;   background-color: white;   color: black;   border: 1px solid blue;   width: 60px;   height: 50px;   font-weight: bold;}' +
			'thead th { font-size: 16px;text-align: center; border: 2px solid black; border-bottom: 2px solid black; padding-right: 2px; color: white; background-color: #CC0000;    width: 70px;    height: 30px;}']
})
export class opsdailyComponent {

public userManagement: any;

public displayinfo: any;
public displaytable: any;
public displaytable2: any;
public years: any;
public graphKey: string;
public monthlyTable: any;
public monthlyTable2: any;



public lineChartData:any;

public lineChartOptions:any = {
     responsive: true,
	 maintainAspectRatio:false,
	 tooltips: {
		callbacks: {
			label: function(tooltipItem, data) {
				var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
				return value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			}
		} // end callbacks:
	},
	 scales: {
		yAxes: [{
			ticks: {
				beginAtZero:true,
				userCallback: function(value, index, values) {
        			return value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				}
			}
		}]
	 }
};

public lineChartColors:Array<any> = [
{ 
	backgroundColor: 'rgba(211,0,0,0.2)',
	borderColor: 'rgba(255,0,0,1)',
	pointBackgroundColor: 'rgba(255,0,0,1)',
	pointBorderColor: '#fff',
	pointHoverBackgroundColor: '#fff',
	pointHoverBorderColor: 'rgba(148,159,177,0.8)'
},
{ 
	backgroundColor: 'rgba(137, 197, 0,0.2)',
	borderColor: 'rgba(159, 238, 0,1)',
	pointBackgroundColor: 'rgba(159, 238, 0,1)',
	pointBorderColor: '#fff',
	pointHoverBackgroundColor: '#fff',
	pointHoverBorderColor: 'rgba(148,159,177,0.8)'
},
{ 
	backgroundColor: 'rgba(0, 127, 127,0.2)',
	borderColor: 'rgba(0, 153, 153,1)',
	pointBackgroundColor: 'rgba(0, 153, 153,1)',
	pointBorderColor: '#fff',
	pointHoverBackgroundColor: '#fff',
	pointHoverBorderColor: 'rgba(148,159,177,0.8)'
}
];

public lineChartLegend:boolean = true;
public lineChartType:string = 'line';
public lineChartLabel:any;

public titles:any;
public currCymd: number;

  constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService) {
		this.userManagement = loginSvc;
		this.displayinfo = null;
		this.displaytable = null;
		this.displaytable2 = null;
		this.lineChartData = [];
		this.lineChartLabel = [];
		this.years = [];
		this.titles = {
			TMCYMD:"DATE",
			JUL:"JUL",
			TRADE:"TRADE REV",
			REV:"TTL REV",
			FUEL:"FUEL",
			SYSAVG:"BILL/TRLR",
			date:"DATE",
			miles:"TTL MILES",
			loaded:"LOADED",
			empty:"EMPTY",
			loadcount:"TTL LOADED DISP",
			emptycount:"TTL MTY DISP",
			loadavgwgt:"LOAD FACTOR"
		};
		var currDate = new Date();
	  	var y = currDate.getFullYear() - 2; // Here we go back 2 years this shoudl match tmrvdhqry
		this.currCymd = Number(y.toString().substring(2));
		
}

	ngOnInit() {
		$('#content').append('<div id="loadingdiv">' +
		'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		var promise = $.ajax({
			url: environment.API + "/service/tmrvdhqry",
			method: 'post',
			dataType: 'json'
		});
		promise.done(function(results) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			if(this.displaytable == null) {
				this.displaytable = [];
			}
			
			this.years[0] = this.currCymd;
			this.years[1] = this.currCymd + 1;
			this.years[2] = this.currCymd + 2;
			
			this.displaytable[0] = [366];
			this.displaytable[1] = [366];
			this.displaytable[2] = [366];

			for(var x =0; x<3;x++){
				for(var y=0;y < 366;y++){
					this.displaytable[x][y] = {
						TMCYMD:"",
						JUL:(y+1).toString(),
						TRADE:"",
						FUEL:"",						
						REV:"",
						SYSAVG:""						
						}
				}
			}
			this.monthlyTable = {};

			for(var i = 0; i < results.length;i++) {
				var x = Number(results[i].TMCYMD.substring(1,3));
				var y = Number(results[i].TMCYMD.substring(3,5))-1;
				var result = results[i];
				if(!this.monthlyTable[x])
					this.monthlyTable[x] = [];
				if(!this.monthlyTable[x][y]){
					this.monthlyTable[x][y] = {
						TMCYMD:result.TMCYMD,
						YEAR:x,
						MONTH:y,
						TRADE:Number(result.TRADE),
						FUEL:Number(result.FUEL),						
						REV:Number(result.REV),
						SYSAVG:Number(result.SYSAVG),
						count:1
					};
				}else{
					this.monthlyTable[x][y].count += 1;
					this.monthlyTable[x][y].TRADE += Number(result.TRADE);
					this.monthlyTable[x][y].FUEL += Number(result.FUEL);
					this.monthlyTable[x][y].REV += Number(result.REV);
					this.monthlyTable[x][y].SYSAVG += Number(result.SYSAVG);
				}
				
				switch (result.TMCYMD.substring(1,3)) {

					case this.years[0].toString():
										this.displaytable[0][result.JUL-1] = result;
										break;

					case this.years[1].toString():
										this.displaytable[1][result.JUL-1] = result;
										break;

					case this.years[2].toString():
										this.displaytable[2][result.JUL-1] = result;
										break;

				}
				
				
			}

			//this.displayinfo.serviceTotal = data;
		
		}.bind(this));

		promise.fail(function(response) {

		});
		var promise2 = $.ajax({
			url: environment.API + "/service/dispatchMiles",
			method: 'post',
			dataType: 'json'
		});
		promise2.done(function(data) {
		if(this.displaytable2 == null)
			this.displaytable2 = [];
		this.displaytable2 = data;
		
		this.monthlyTable2 = {};

			for(var i = 0; i < data.length;i++) {
				var x = Number(data[i].date.toString().substring(1,3));
				var y = Number(data[i].date.toString().substring(3,5))-1;
				var result = data[i];
				if(!this.monthlyTable2[x])
					this.monthlyTable2[x] = [];
				if(!this.monthlyTable2[x][y]){
					this.monthlyTable2[x][y] = {
						date:result.date,
						YEAR:x,
						MONTH:y,
						empty:Number(result.empty),
						emptycount:Number(result.emptycount),						
						loadavgwgt:Number(result.loadavgwgt),
						loadcount:Number(result.loadcount),
						loaded:Number(result.loaded),
						miles:Number(result.miles),
						count:1
					};
				}else{
					this.monthlyTable2[x][y].count += 1;
					this.monthlyTable2[x][y].empty += Number(result.empty);
					this.monthlyTable2[x][y].emptycount += Number(result.emptycount);
					this.monthlyTable2[x][y].loadavgwgt += Number(result.loadavgwgt);
					this.monthlyTable2[x][y].loadcount += Number(result.loadcount);
					this.monthlyTable2[x][y].loaded += Number(result.loaded);
					this.monthlyTable2[x][y].miles += Number(result.miles);
				}
			}


		}.bind(this));

		promise2.fail(function(response) {

		});
	}

	objectkeys(row){
		return Object.keys(row);
	} 

	numberWithCommas(x) {
		var rtnval;
		var z = parseInt(x);
		if(isNaN(z))
		 z = 0;
		rtnval = z.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return rtnval;
	}
	numberWithCommasDecimal(x) {
		var rtnval;
		var y = Number(x);
		if(isNaN(y))
			y = 0;
		//var z = Number(y.toFixed(2));
		//if(isNaN(z))
		//	z = 0;
		//rtnval = z.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		//return rtnval;
		return y.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	}
	getPercent(cur,pre){
		if(cur != null && cur != "" && pre != null && pre != ""){
			var x:any;
			x = Number(cur.replace(/,/g,'')) / Number(pre.replace(/,/g,''));
			//x = parseInt(x);
			x = x * 100;
			x = x.toFixed(0) - 100;
			var y = x + "%";
			return y;
		}else{
			return "0%";
		}
	}
	getNumberValue(x){
		if(!isNaN(x)){
			return x;
		}else if(x > "" || x > 0){
			return parseInt(x.replace(/,/g,''));
		}else{
			return 0;
		}
	}
getAverage(val,count){
	return this.numberWithCommas(Number(val/count).toString());
}
returnMDY(date){
	if(date.toString().length > 0){
	var rtn = date.toString();
	return rtn.substring(3,5) + "/" + rtn.substring(5,7) + "/" + rtn.substring(1,3);
	}
	else
		return date;
}

	
selectGraph1(key){
	//this.graphKey = key;
	this.lineChartData = [];
	this.lineChartLabel = [];
	if(key != "TMCYMD" && key != "JUL"){
		// for(var y=0;y < this.displaytable.length-1;y++){
		// 	this.lineChartData[y] = {data:"",label:key};
		// 	this.lineChartData[y].data = [];
		// 	for(var i = this.displaytable[y+1].length-1; i >= 0;i--){
		// 		this.lineChartData[y].data[this.lineChartData[y].data.length] = this.displaytable[y+1][i][key];
		// 		if(y ==0)
		// 			this.lineChartLabel[this.lineChartLabel.length] = this.returnMDY(this.displaytable[y+1][i].TMCYMD);
		// 	}
		// }
		this.lineChartLabel=["January","February","March","April","May","June","July","August","September","October","November","December"];
		for(let year in this.monthlyTable){
			this.lineChartData[this.lineChartData.length] = {data:[], label:"20"+year};
			for(var i=0;i<this.monthlyTable[year].length;i++){
				this.lineChartData[this.lineChartData.length-1].data[i] = this.monthlyTable[year][i][key] / this.monthlyTable[year][i].count;
			}
		}
	}
}
selectGraph2(key){
	//this.graphKey = key;
	this.lineChartData = [];
	this.lineChartLabel = [];
	if(key != "date"){
		this.lineChartLabel=["January","February","March","April","May","June","July","August","September","October","November","December"];
		for(let year in this.monthlyTable2){
			this.lineChartData[this.lineChartData.length] = {data:[], label:"20"+year};
			for(var i=0;i<this.monthlyTable2[year].length;i++){
				this.lineChartData[this.lineChartData.length-1].data[i] = this.monthlyTable2[year][i][key] / this.monthlyTable2[year][i].count;
			}
		}
	}
}

// selectGraph2(key){
// 	this.lineChartData = [];
// 	this.lineChartLabel = [];
// 	if(key != "date"){
// 		this.lineChartData[0] = {data:"",label:key};
// 		this.lineChartData[0].data = [];
// 		for(var i = this.displaytable2.length-1; i >= 0;i--){
// 			this.lineChartData[0].data[this.lineChartData[0].data.length] = this.displaytable2[i][key];
// 			this.lineChartLabel[this.lineChartLabel.length] = this.returnMDY(this.displaytable2[i].date);
// 		}
// 	}
// }

}