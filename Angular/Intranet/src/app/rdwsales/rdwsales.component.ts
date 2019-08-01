import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';
import { ExcelService } from '../services/excel.service';

declare var $: any;

@Component({
	selector: 'MonthlySales',
	templateUrl: './rdwsales.html',
	styleUrls: ['./rdwsales.css']
})
export class rdwsalesComponent {

	public userManagement: any;

	public displaytable: any = {};
	public detailtable: any = [];
	public graphKey: string;
	public monthlyTable: any;
	public monthlyTable2: any;
	private curSort: string;
	public terminal: string;
	public months: any = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];


	public lineChartData: any;
	public lineChartOptions: any = {
		responsive: true,
		maintainAspectRatio: false
	};
	public lineChartColors: Array<any> = [
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
	public lineChartLegend: boolean = true;
	public lineChartType: string = 'line';

	public curYear: string = "";

	public err: string;

	public displayKeys: any = { 'period': 0, 'year': 0, 'slsrep': 0 };

	public titles: any = {
		SLSREP: "S#",
		SLSNAM: "Sales name",
		M1: "January",
		M2: "February",
		M3: "March",
		QA1: "Q1 AVG",
		M4: "April",
		M5: "May",
		M6: "June",
		QA2: "Q2 AVG",
		M7: "July",
		M8: "August",
		M9: "September",
		QA3: "Q3 AVG",
		M10: "October",
		M11: "November",
		M12: "December",
		QA4: "Q4 AVG",
		YA: "Annual AVG",
		YT: "Annual TOT"
	};
	public currCymd: number;

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService,
		private excelService: ExcelService) {
		this.userManagement = loginSvc;
		this.displaytable = [];
		// this.fromDate = calendar.getToday();
		// this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);

	}

	ngOnInit() {
		this.getData();
	}

	exportExcel() {
		this.excelService.exportAsExcelFile(this.displaytable[this.curYear], 'RDW Report');
	}
	exportDetailExcel() {
		this.excelService.exportAsExcelFile(this.detailtable, 'RDW Detail Report');
	}
	getData() {
		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		var auth = this.userManagement.getAuth();
		if (auth.indexOf("SLSMGR") > -1 || auth.indexOf("ALL") > -1)
			auth = "MGR";
		else if (auth.indexOf("SLS") > -1) {
			var test2 = auth.substring(auth.indexOf('SLS') + 3)
			auth = test2.substring(0, 2).trim();
		} else {
			auth = "";
		}
		if (auth != "") {
			var promise = $.ajax({
				url: environment.API + "/sales/rdwsales",
				method: 'post',
				data: { slrep: auth },
				dataType: 'json'
			});
			promise.done(function (res) {
				$('#loadinggif').remove();
				$('#loadingdiv').remove();
				if (res.error) {
					this.err = res.error;
				} else {
					for (var i = 0; i < res.length; i++) {
						if (!this.displaytable[res[i].RAYEAR]) {
							this.displaytable[res[i].RAYEAR] = {};
						}
						if (!this.displaytable[res[i].RAYEAR][res[i].SLSREP]) {
							this.displaytable[res[i].RAYEAR][res[i].SLSREP] = { SLSREP: res[i].SLSREP, SLSNAM: res[i].SLSNAM, M1: 0, M2: 0, M3: 0, Q1: 0, QA1: 0, M4: 0, M5: 0, M6: 0, Q2: 0, QA2: 0, M7: 0, M8: 0, M9: 0, Q3: 0, QA3: 0, M10: 0, M11: 0, M12: 0, Q4: 0, QA4: 0, YA: 0, YT: 0 };
						}
						this.displaytable[res[i].RAYEAR][res[i].SLSREP]["M" + res[i].RAPERD] = Number(res[i].REV);
						this.displaytable[res[i].RAYEAR][res[i].SLSREP]["Q1"] = this.displaytable[res[i].RAYEAR][res[i].SLSREP]["M1"] + this.displaytable[res[i].RAYEAR][res[i].SLSREP]["M2"] + this.displaytable[res[i].RAYEAR][res[i].SLSREP]["M3"];
						this.displaytable[res[i].RAYEAR][res[i].SLSREP]["Q2"] = this.displaytable[res[i].RAYEAR][res[i].SLSREP]["M4"] + this.displaytable[res[i].RAYEAR][res[i].SLSREP]["M5"] + this.displaytable[res[i].RAYEAR][res[i].SLSREP]["M6"];
						this.displaytable[res[i].RAYEAR][res[i].SLSREP]["Q3"] = this.displaytable[res[i].RAYEAR][res[i].SLSREP]["M7"] + this.displaytable[res[i].RAYEAR][res[i].SLSREP]["M8"] + this.displaytable[res[i].RAYEAR][res[i].SLSREP]["M9"];
						this.displaytable[res[i].RAYEAR][res[i].SLSREP]["Q4"] = this.displaytable[res[i].RAYEAR][res[i].SLSREP]["M10"] + this.displaytable[res[i].RAYEAR][res[i].SLSREP]["M11"] + this.displaytable[res[i].RAYEAR][res[i].SLSREP]["M12"];
						this.displaytable[res[i].RAYEAR][res[i].SLSREP]["YT"] = this.displaytable[res[i].RAYEAR][res[i].SLSREP]["Q1"] + this.displaytable[res[i].RAYEAR][res[i].SLSREP]["Q2"] + this.displaytable[res[i].RAYEAR][res[i].SLSREP]["Q3"] + this.displaytable[res[i].RAYEAR][res[i].SLSREP]["Q4"];

						this.displaytable[res[i].RAYEAR][res[i].SLSREP]["YA"] = this.displaytable[res[i].RAYEAR][res[i].SLSREP]["YT"] / 12;
						this.displaytable[res[i].RAYEAR][res[i].SLSREP]["QA1"] = this.displaytable[res[i].RAYEAR][res[i].SLSREP]["Q1"] / 3;
						this.displaytable[res[i].RAYEAR][res[i].SLSREP]["QA2"] = this.displaytable[res[i].RAYEAR][res[i].SLSREP]["Q2"] / 3;
						this.displaytable[res[i].RAYEAR][res[i].SLSREP]["QA3"] = this.displaytable[res[i].RAYEAR][res[i].SLSREP]["Q3"] / 3;
						this.displaytable[res[i].RAYEAR][res[i].SLSREP]["QA4"] = this.displaytable[res[i].RAYEAR][res[i].SLSREP]["Q4"] / 3;
					}
					// this.displaytable = res;
				}
			}.bind(this));

			promise.fail(function (err) {
				$('#loadinggif').remove();
				$('#loadingdiv').remove();
				console.log(err.toString());
			});
		}
	}
	getDetail(slsrep, period, year) {
		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		var promise = $.ajax({
			url: environment.API + "/sales/rdwsalesDetail",
			method: 'post',
			data: { 'slsrep': slsrep, 'period': period, 'year': year },
			dataType: 'json'
		});
		promise.done(function (res) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			if (res.error) {
				this.err = res.error;
			} else {
				this.displayKeys.slsrep = slsrep;
				this.displayKeys.period = period;
				this.displayKeys.year = year;
				this.detailtable = res;
			}
		}.bind(this));

		promise.fail(function (err) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			console.log(err.toString());
		});
	}
	showDetail(row) {
		if (this.displayKeys.slsrep == row.SLSREP && this.curYear == this.displayKeys.year)
			return true;
		else
			return false;
	}

	displayCell(row, key) {
		if (key == 'SLSREP' || key == 'SLSNAM')
			return row[key];
		else
			return this.numberWithCommas(row[key]);
	}

	clickCheck(row, key) {
		if (key == 'SLSREP' || key == 'SLSNAM' || (key.indexOf('M') == -1 && key.indexOf('QA') == -1)) {
			this.selectGraph(row['SLSREP']);

		} else {
			this.getDetail(row.SLSREP, key.substring(1), this.curYear);
		}
	}

	objectkeys(row) {
		return Object.keys(row);
	}

	numberWithCommas(x) {
		var rtnval;
		var z = parseInt(x);
		if (isNaN(z))
			z = 0;
		rtnval = z.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return rtnval;
	}
	numberWithCommasDecimal(x) {
		var rtnval;
		var y = Number(x);
		if (isNaN(y))
			y = 0;
		return y.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	}
	getNumberValue(x) {
		if (!isNaN(x)) {
			return x;
		} else if (x > "" || x > 0) {
			return parseInt(x.replace(/,/g, ''));
		} else {
			return 0;
		}
	}

	checkAuth(val) {
		var auth = this.userManagement.intAuth;
		if (auth.indexOf("SLSMGR"))
			return true;
		else if (Number(val) == Number(auth))
			return true;
		else
			return false;
	}

	sortByKey(key) {
		this.displaytable = this.sortByKey2(this.displaytable, key);
	}
	sortByKey2(array, key) {
		if (this.curSort != key) {
			this.curSort = key;
			return array.sort(function (a, b) {
				var x = a[key]; var y = b[key];
				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			});
		} else {
			this.curSort = "";
			return array.sort(function (a, b) {
				var x = a[key]; var y = b[key];
				return ((x > y) ? -1 : ((x < y) ? 1 : 0));
			});
		}
	}
	get2Digit(val) {
		if (val.toString().length == 1)
			return "0" + val.toString();
		else
			return val.toString();
	}
	selectGraph(slsrep) {
		//Select Graph
		this.lineChartData = [];
		for (var x = 0; x < this.displaytable.length; x++) {
			if (this.displaytable[x]) {
				var y = this.lineChartData.length;
				this.lineChartData[y] = { data: [], label: "Year: 20" + x};
				this.lineChartData[y].data = [];
				for (var z = 1; z <= 12; z++) {
					this.lineChartData[y].data[z-1] = Number(this.displaytable[x][slsrep]["M"+z]);
				}
			}
		}
		//this.terminalShipmentsBoolean = true;
	}
}