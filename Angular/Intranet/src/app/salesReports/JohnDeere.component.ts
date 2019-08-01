import { Component, AfterContentInit, ViewChild }    	from '@angular/core';
import { Router, ActivatedRoute, Params } 	from '@angular/router';
import { AuthenticationService }	        from '../Authentication/authentication.service';
import { SalesDataService }					from './salesData.service';
import { BaseChartDirective , ChartsModule} from 'ng2-charts';
import { environment } from '../../environments/environment';
declare var $:any;

@Component({
  selector: 'OpsDashboard',
  templateUrl: '../../pages/JohnDeere.html',
  styles: [	
 			'.odd { background-color: #F5F5DC;}' +
			'.even { background-color: #F0FFFF;}' +
			'button { background-color: rgba(54,124,43,1); color:rgba(253, 218, 1,1)}' 
			]
})
export class JohnDeereComponent {

	@ViewChild('myChart') myChart: BaseChartDirective;

	public userManagement: any;
	public tableDisplay: any;
	public totalData:any;
	public customers: any = {};
	public showAll:boolean = false;
	
	public chartTitle:string;
	public tableTitle:string;
	public tableYear:string = '';
	public tableCust:string = '';
	
	public barChartOptions:any = {
		title: {
            display: true,
			text: '',
			fontSize:50
		},
		tooltips: {
			callbacks: {
				label: function(tooltipItem, data) {
					var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
					return value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				}
			} // end callbacks:
		},
		scales:{
			yAxes: [{
				ticks:{
					fontSize:30,
					beginAtZero:true,
					userCallback: function(value, index, values) {
						return value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
					}
				}
			}],
			xAxes:[{
				ticks: {
					fontSize:30,
					autoSkip: false
				}
			}]
		},
		scaleShowVerticalLines: false,
		responsive: true
	};
	public gridChartOptions:any = {
		title: {
            display: false,
		},
		tooltips: {
			callbacks: {
				label: function(tooltipItem, data) {
					var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
					return value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				}
			} // end callbacks:
		},
		scales:{
			yAxes: [{
				ticks:{
					fontSize:10,
					beginAtZero:false,
					userCallback: function(value, index, values) {
						return value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
					}
				}
			}],
			xAxes:[{
				ticks: {
					fontSize:10,
					autoSkip: false
				}
			}]
		},
		scaleShowVerticalLines: false,
		responsive: true
	};
	
	public custTable:any[];
	
	public ignoreMM:any;
	public barChartLabels:string[];
	public barChartLabelsFull:string[];
	public barChartType:string = 'bar';
	public barChartLegend:boolean = true;
	public barChartData:any[];
	public barChartDataFull:any = {};
	public barChartColors:Array<any> = [
		{ // grey
			backgroundColor: 'rgba(54,124,43,0.7)',
			borderColor: 'rgba(54,124,43,1)',
			pointBackgroundColor: 'rgba(54,124,43,1)',
			pointBorderColor: '#fff',
			pointHoverBackgroundColor: '#fff',
			pointHoverBorderColor: 'rgba(54,124,43,0.8)'
		},
		{ // dark grey
			backgroundColor: 'rgba(253, 218, 1,0.7)',
			borderColor: 'rgba(253, 218, 1,1)',
			pointBackgroundColor: 'rgba(253, 218, 1,1)',
			pointBorderColor: '#fff',
			pointHoverBackgroundColor: '#fff',
			pointHoverBorderColor: 'rgba(253, 218, 1,1)'
		}
	];
	public url:any;

	constructor(public route: ActivatedRoute,
			public router: Router,
			public loginSvc: AuthenticationService,
			public salesData: SalesDataService) {
			this.userManagement = loginSvc;
			this.barChartLabels = [
			"November",
			"December",
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October"
		];
		this.barChartData = [{
			data:[],
			label:"YEAR 2018"
		},
		{
			data:[],
			label:"YEAR 2017"
		}];

	}

	ngOnInit() {
	
		if(!this.userManagement.hasAuth('SLMGR')){
			this.router.navigate(['/']);
		}
	
	
		var promise = $.ajax({
			url: environment.API + "/sales/JDWSR",
			method: 'post',
			dataType: 'json'
		});
		promise.done(function(data) {
		this.totalData = data;
		this.setTable(data);
		}.bind(this));

		promise.fail(function(response) {

		});
	}
	
	setTable(data){
		this.tableDisplay = {};//year
		this.customers["ALL"] = {JDWGT:"Weight",JDSHP:"Shipments",JDREV:"Revenue"};
		this.tableDisplay["ALL"] = {};
		for(var i = 0; i < data.length; i++){
			if(!this.tableDisplay[data[i].JDCUST])	
				this.tableDisplay[data[i].JDCUST] = {};
			if(!this.tableDisplay[data[i].JDCUST][data[i].JDYEAR])	
				this.tableDisplay[data[i].JDCUST][data[i].JDYEAR] = [];
			if(!this.tableDisplay["ALL"][data[i].JDYEAR])	
				this.tableDisplay["ALL"][data[i].JDYEAR] = [];
			this.customers[data[i].JDCUST] = {JDWGT:"Weight",JDSHP:"Shipments",JDREV:"Revenue"};
			this.tableDisplay[data[i].JDCUST][data[i].JDYEAR][data[i].JDSORT-1] = data[i];	
			//this.totalData[this.totalData.length] = data[i];
			if(!this.tableDisplay["ALL"][data[i].JDYEAR][data[i].JDSORT-1])
				this.tableDisplay["ALL"][data[i].JDYEAR][data[i].JDSORT-1] = {JDREV:0,JDWGT:0,JDSHP:0};
			//this.tableDisplay["ALL"][data[i].JDYEAR][data[i].JDSORT-1] = {
				this.tableDisplay["ALL"][data[i].JDYEAR][data[i].JDSORT-1].JDCUST="ALL";
				this.tableDisplay["ALL"][data[i].JDYEAR][data[i].JDSORT-1].JDMNTH=data[i].JDMNTH;
				this.tableDisplay["ALL"][data[i].JDYEAR][data[i].JDSORT-1].JDREV= Number(data[i].JDREV) + Number(this.tableDisplay["ALL"][data[i].JDYEAR][data[i].JDSORT-1].JDREV);
				this.tableDisplay["ALL"][data[i].JDYEAR][data[i].JDSORT-1].JDSHP= Number(data[i].JDSHP) + Number(this.tableDisplay["ALL"][data[i].JDYEAR][data[i].JDSORT-1].JDSHP);
				this.tableDisplay["ALL"][data[i].JDYEAR][data[i].JDSORT-1].JDWGT= Number(data[i].JDWGT) + Number(this.tableDisplay["ALL"][data[i].JDYEAR][data[i].JDSORT-1].JDWGT);
				this.tableDisplay["ALL"][data[i].JDYEAR][data[i].JDSORT-1].JDYEAR=data[i].JDYEAR;
				this.tableDisplay["ALL"][data[i].JDYEAR][data[i].JDSORT-1].JDSORT=data[i].JDSORT;
			//}
		}
		for(var key in this.customers){
			this.barChartDataFull[key] = {};
			for(var key2 in this.customers[key]){
				this.setChart(key,key2);
			}
		}
		this.chartTitle = "";
	}
	
	setChart(cust,key){
		this.tableCust = cust;
		this.tableYear = '';
		this.chartTitle = "Customer: " + cust + " - " + this.customers[cust][key];
		//this.barChartOptions.title.text = this.chartTitle;
		this.tableTitle = "Customer: " + cust;
		this.myChart.chart.options.title.text = this.chartTitle;
		this.barChartData = [];
		//this.myChart.chart.update();
		for(var i in this.tableDisplay[cust]){
			
			this.barChartData[this.barChartData.length] = {
				data: [],
				label: 'Year 20' + i
			}
			//if(this.tableYear == '')
			this.tableYear = i;
			// if(!isNaN(this.ignoreMM)){
			// 	var temp = this.barChartLabelsFull;
			// 	this.barChartLabels = temp.splice(0,this.ignoreMM);
			// }else{
			// 	this.barChartLabels = this.barChartLabelsFull;
			// }
			for(var j = 0; j < this.tableDisplay[cust][i].length;j++){
				//this.barChartData[this.barChartData.length - 1].data = [];
				if(j <= this.ignoreMM - 1 || isNaN(this.ignoreMM)){
					if(this.tableDisplay[cust][i][j])
						this.barChartData[this.barChartData.length - 1].data[j] = Number(this.tableDisplay[cust][i][j][key]);
					else
					this.barChartData[this.barChartData.length - 1].data[j] = 0;
				}
			}
		}
		if(!this.barChartData[1]){
			this.barChartData[1] = {
				data: [],
				label: ''
			}
		}
		if(this.barChartData[1].data.length < this.barChartData[0].data.length){
			for(var j:number = this.barChartData[1].data.length; j < this.barChartData[0].data.length; j++){
				this.barChartData[1].data[j] = 0;
			}
		}
		this.barChartDataFull[cust][key] = this.barChartData;
		this.tableYear = "18";
	}

	getTotals(key){
		var rows = this.tableDisplay[this.tableCust][this.tableYear];
		var total = 0;
		for(var i = 0; i < rows.length; i++){
			var row = rows[i];
			total += Number(row[key]);
		}
		return this.numberWithCommas(total);
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
		var z = Number(y.toFixed(0));
		if(isNaN(z))
			z = 0;
		rtnval = z.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return rtnval;
	}
	
	objectkeys(row){
		return Object.keys(row);
	}
	
	saveImage(img,src){
		let canvas = document.getElementById(img) as HTMLCanvasElement;
		let anchor = document.getElementById(src) as HTMLAnchorElement;
		anchor.href = canvas.toDataURL("image/jpg");
	}


}
