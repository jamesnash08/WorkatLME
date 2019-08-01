import { Component, AfterContentInit, ViewChild }    	from '@angular/core';
import { Router, ActivatedRoute, Params } 	from '@angular/router';
import { Http, Request }                  	from '@angular/http';
import { AuthenticationService }	        from '../Authentication/authentication.service';
import { SalesDataService }					from './salesData.service';
import { BaseChartDirective , ChartsModule} from 'ng2-charts';
import { environment } from '../../environments/environment';

declare var $:any;

@Component({
  selector: 'OpsDashboard',
  templateUrl: '../../pages/dailySalesReport.html',
  styles: [	'.repsTab { ' +
  			'			position: relative;' +
  			'			vertical-align: top;' +
  			'			display: inline-block;' +
  			'			width: 20vw;' +
  			'			overflow: scroll;' +
  			'		}' +
  			'.canvasFrame { ' +
  			'			display: inline-block;' +
  			'			vertical-align: top;' +
  			'			width: 66vw;' +
  			'			height: 100vh;' +
  			'		}' +
 			'.odd { background-color: #F5F5DC;}' +
			'.even { background-color: #F0FFFF;}' +
			'.totals th {  font-size: 17px;  text-align: center;   padding-right: 2px;   background-color: white;   color: black;   border: 1px solid blue;   width: 60px;   height: 50px;   font-weight: bold;}' +
			'thead th { font-size: 16px;text-align: center; border: 2px solid black; border-bottom: 2px solid black; padding-right: 2px; color: white; background-color: #CC0000;    width: 70px;    height: 30px;}' +
			'#salesPerson { ' +
			'  //color: white; ' +
			'} ' +
			'#salesPerson:visited { ' +
			'  background-color: red;' +
			'} ' ]
})
export class dailySalesReportComponent {

	@ViewChild('myChart') myChart: BaseChartDirective;

	public userManagement: any;
	public managementTotals: any;
	public tabletotal:any;
	public salesPerson: number[];
	public next: number;
	public barChartOptions:any = {
		scales:{
			xAxes:[{
				ticks: {
					autoSkip: false
				}
			}]
		},
		scaleShowVerticalLines: false,
		responsive: true
	};
	public barChartLabels:string[];
	public fullBarChartLabels:string[];
	public barChartType:string = 'bar';
	public barChartLegend:boolean = true;
	public barChartData:any[];
	public fullBarChartData:any[];
	public dailyAverages: number[];
	public dailyGoals: number[];
	public barChartColors:Array<any> = [
		{ // Red
			backgroundColor: 'rgba(255,51,51,0.7)',
			borderColor: 'rgba(255,51,51,1)',
			pointBackgroundColor: 'rgba(255,51,51,1)',
			pointBorderColor: '#fff',
			pointHoverBackgroundColor: '#fff',
			pointHoverBorderColor: 'rgba(255,51,51,0.8)'
		},
		{ // Dark Green
			backgroundColor: 'rgba(60,132,60,0.7)',
			borderColor: 'rgba(77,83,96,1)',
			pointBackgroundColor: 'rgba(77,83,96,1)',
			pointBorderColor: '#fff',
			pointHoverBackgroundColor: '#fff',
			pointHoverBorderColor: 'rgba(77,83,96,1)'
		},
		{ // Dark Purple
			backgroundColor: 'rgba(153,0,76,0.7)',
			borderColor: 'rgba(153,0,76,1)',
			pointBackgroundColor: 'rgba(153,0,76,1)',
			pointBorderColor: '#fff',
			pointHoverBackgroundColor: '#fff',
			pointHoverBorderColor: 'rgba(153,0,76,1)'
		},
		{ // Blue
			backgroundColor: 'rgba(0,0,255,0.7)',
			borderColor: 'rgba(0,0,255,1)',
			pointBackgroundColor: 'rgba(0,0,255,1)',
			pointBorderColor: '#fff',
			pointHoverBackgroundColor: '#fff',
			pointHoverBorderColor: 'rgba(0,0,255,1)'
		}
	];

	constructor(public route: ActivatedRoute,
			public router: Router,
			public loginSvc: AuthenticationService,
			public salesData: SalesDataService) {
			this.userManagement = loginSvc;
			this.barChartData = [
				{
					data: [],
					label: 'Daily Revenue',
					hidden: true,
				},
				{
					data: [],
					label: 'Daily Goal',
					hidden: true,
				},
				{
					data: [],
					label: 'Monthly Revenue',
					hidden: false,
				},
				{
					data: [],
					label: 'Monthly Goal',
					hidden: true,
				}
			];

			this.barChartLabels = [];

			this.salesData.getDailyTotals().subscribe(

				res => {

					this.managementTotals = res;
					this.salesPerson = [];
					this.dailyAverages = [];
					this.dailyGoals = [];
					this.next = 0;

					this.barChartData = [
						{
							data: [],
							label: 'Daily Revenue',
							hidden: true,
						},
						{
							data: [],
							label: 'Daily Goal',
							hidden: true,
						},
						{
							data: [],
							label: 'Monthly Revenue',
							hidden: false,
						},
						{
							data: [],
							label: 'Monthly Goal',
							hidden: true,
						}
					];

					for (var idx = 0;idx < this.managementTotals.length; idx++) {

						this.salesPerson[ idx ] = res[ idx ].SRYNAME;
						this.barChartLabels[ idx ] = res[ idx ].SRYNAME;
						this.barChartData[ 0 ].data.push(res[ idx ].SRYAVGD);
						this.barChartData[ 1 ].data.push(res[ idx ].SRYGOALD);
						this.barChartData[ 2 ].data.push(res[ idx ].SRYAVG);
						this.barChartData[ 3 ].data.push(res[ idx ].SRYGOAL);
					}

					this.fullBarChartData = [];
					this.fullBarChartData[0] = this.barChartData[0].data;
					this.fullBarChartData[1] = this.barChartData[1].data;
					this.fullBarChartData[2] = this.barChartData[2].data;
					this.fullBarChartData[3] = this.barChartData[3].data;
					this.fullBarChartLabels = this.barChartLabels;
					
					console.log(this.managementTotals);

				},
				err => {
					console.log("Error occured");
				}

			);

	}

	ngOnInit() {
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

	allSalesPersons() {

		this.myChart.chart.config.data.datasets[0].data = this.fullBarChartData[ 0 ];
		this.myChart.chart.config.data.datasets[0].hidden = true;
		this.myChart.chart.config.data.datasets[1].data = this.fullBarChartData[ 1 ];
		this.myChart.chart.config.data.datasets[1].hidden = true;
		this.myChart.chart.config.data.datasets[2].data = this.fullBarChartData[ 2 ];
		this.myChart.chart.config.data.datasets[2].hidden = false;
		this.myChart.chart.config.data.datasets[3].data = this.fullBarChartData[ 3 ];
		this.myChart.chart.config.data.datasets[3].hidden = true;
		this.myChart.chart.config.data.labels = this.fullBarChartLabels;
		this.myChart.chart.update();

	}

	selectSalesPerson(id) {
		// this.barChartData = [];
		// this.barChartData = [
		// 		{
		// 			data: [ this.fullBarChartData[ 0 ].data[id] ],
		// 			label: 'Daily Revenue',
		// 			hidden: false,
		// 		},
		// 		{
		// 			data: [ this.fullBarChartData[ 1 ].data[id] ],
		// 			label: 'Daily Goal',
		// 			hidden: false,
		// 		},
		// 		{
		// 			data: [ this.fullBarChartData[ 2 ].data[id] ],
		// 			label: 'Monthly Revenue',
		// 			hidden: false,
		// 		},
		// 		{
		// 			data: [ this.fullBarChartData[ 3 ].data[id] ],
		// 			label: 'Monthly Goal',
		// 			hidden: false,
		// 		}
		// ];
		this.myChart.chart.config.data.datasets[0].hidden = false;
		this.myChart.chart.config.data.datasets[1].hidden = false;
		this.myChart.chart.config.data.datasets[2].hidden = false;
		this.myChart.chart.config.data.datasets[3].hidden = false;
		this.myChart.chart.config.data.labels = [];
		this.myChart.chart.config.data.labels[0] = this.fullBarChartLabels[ id ];
		this.myChart.chart.config.data.datasets[0].data = [ this.fullBarChartData[0][id] ];
		this.myChart.chart.config.data.datasets[1].data = [ this.fullBarChartData[1][id] ];
		this.myChart.chart.config.data.datasets[2].data = [ this.fullBarChartData[2][id] ];
		this.myChart.chart.config.data.datasets[3].data = [ this.fullBarChartData[3][id] ];
		this.myChart.chart.update();

	}

}
