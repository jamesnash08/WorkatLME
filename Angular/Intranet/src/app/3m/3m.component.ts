import { Component, AfterContentInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';
import { Title }     from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import { contextMenuService } from '../services/contextMenu.service';
// import {NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

declare var $: any;

@Component({
	selector: 'mmm',
	templateUrl: './3m.html',
	styleUrls: ['./3m.css']
})
export class mmmComponent {
	private version: number = 1.1;
	public userManagement: any;
	public displayData:any = {};
	public curYear:string = "2019";
	public prevYear:string = "2018";

	public titles: any = {
		FBNO: "PRO"
	};
	
	public chartData: any;
	public monthlyLabels:any= ['January','February','March','April','May','June','July','August','September','October','November','December'];
	public chartLabels: any = ["Current Month", "Last Month", "Last Year"];

	public barChartOptions: any = {
		responsive: true,
		// We use these empty structures as placeholders for dynamic theming.
		scales: { xAxes: [{}], yAxes: [{}] },
		plugins: {
		  datalabels: {
			anchor: 'end',
			align: 'end',
		  }
		}
	  };
	  public performanceData:any=[
		{ data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
		{ data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
	  ];
	  public netCHGData:any=[
		{ data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
		{ data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
	  ];



	public lineChartData: any = [];
	public lineChartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                }
            } // end callbacks:
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    userCallback: function (value, index, values) {
                        return value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                    }
                }
            }]
        }
    };

    public lineChartColors: Array<any> = [
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

    public lineChartLegend: boolean = true;
    public lineChartType: string = 'line';
    public lineChartLabel: any;

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService,
		private titleService: Title,
		public contextMenu: contextMenuService,
		public sanitizer: DomSanitizer) {
		this.userManagement = loginSvc;
	}
	ngOnInit() {
		this.getData();
	}
	
	getData(){
		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		var promise = $.ajax({
			url: environment.API + "/3m/cs550h",
			method: 'post',
			dataType: 'json'
		});
		promise.done(function (res) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			if (res.error)
				this.err = res.error;
			else {
				this.displayData = {};
				for(var i=0; i<res.length;i++){
					res[i]['PCTONTIME'] = Number(res[i].ONTIME / res[i].SHP).toFixed(2);
					if(!this.displayData[res[i].YEAR]){
						this.displayData[res[i].YEAR] = {};
						if(Number(res[i].YEAR) >= Number(this.curYear)){
							this.curYear = res[i].YEAR;
							this.prevYear = (Number(this.curYear)-1).toString();
						}
					}
					// if(!this.displayData[res[i].YEAR][res[i].MTHNBR])
						this.displayData[res[i].YEAR][res[i].MTHNBR] = res[i];
				}
				this.setPerformance();
			}
		}.bind(this));

		promise.fail(function (err) {
			console.log(err.toString());
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
		});
	}
	setPerformance(){
		this.performanceData = [];
		var keys = this.objectkeys(this.displayData[this.curYear]);
		this.performanceData.push({data:[],label:this.curYear});
		for(var i=0;i<keys.length;i++){
			this.performanceData[this.performanceData.length-1].data.push(this.displayData[this.curYear][keys[i]].SHP);
		}
		keys = this.objectkeys(this.displayData[this.prevYear]);
		this.performanceData.push({data:[],label:this.prevYear});
		for(var i=0;i<keys.length;i++){
			this.performanceData[this.performanceData.length-1].data.push(this.displayData[this.prevYear][keys[i]].SHP);
		}
	}
	setNetchg(){
		this.netCHGData = [];
		var keys = this.objectkeys(this.displayData[this.curYear]);
		this.netCHGData.push({data:[],label:this.curYear});
		for(var i=0;i<keys.length;i++){
			this.netCHGData[this.netCHGData.length-1].data.push(this.displayData[this.curYear][keys[i]].NETCHG);
		}
		keys = this.objectkeys(this.displayData[this.prevYear]);
		this.netCHGData.push({data:[],label:this.prevYear});
		for(var i=0;i<keys.length;i++){
			this.netCHGData[this.netCHGData.length-1].data.push(this.displayData[this.prevYear][keys[i]].NETCHG);
		}
	}

	selectGraph(key) {
        this.lineChartData = [];
        this.lineChartLabel = [];
        if (key != "DATE" && key != "TRM") {
            for (var j = 0; j < 3; j++) {
                this.lineChartData[j] = { data: [], label: this.chartLabels[j] };
                for (var i = 0; i < this.chartData[j].length; i++) {
                    this.lineChartData[j].data[i] = this.getNumberValue(this.chartData[j][i][key]);
                    if (i >= this.lineChartLabel.length)
                        this.lineChartLabel[this.lineChartLabel.length] = i + 1;
                }
            }
        }
	}
	getNumberValue(x) {
        if (!isNaN(x)) {
            return Number(x);
        } else if (x > "" || x > 0) {
            return Number(parseInt(x.replace(/,/g, '')));
        } else {
            return 0;
        }
	}
	
	objectkeys(arr){return Object.keys(arr);}
}