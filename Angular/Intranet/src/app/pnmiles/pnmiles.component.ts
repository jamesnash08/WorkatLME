import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';
import { tableService } from '../services/table.service';
import { ExcelService } from '../services/excel.service';

declare var $: any;

@Component({
	selector: 'OpsDashboard',
	templateUrl: './pnmiles.html',
	styleUrls: ['./pnmiles.css']
})
export class pnmilesComponent {

	public userManagement: any;

	public dataLI: any;
	public dataLO: any;
	public displaytable: any = [];
	public exporttable: any = [];

	public prevTerminal: string;
	public terminal: string;
	public fromDate: string;
	public toDate: string;
	public checkType: string;

	public err: string;

	public titles: any = {
		VEHICLE_NUMBER: "Truck",
		DRIVERID: "EMP",
		MILES: "MILES",
		LIDATE: "LOGIN DATE",
		LITIME: "LOGIN TIME",
		LIODOM: "LOGIN ODOM",
		LODATE: "LOGOUT DATE",
		LOTIME: "LOGOUT TIME",
		LOODOM: "LOGOUT ODOM",
	};

	public currCymd: number;
	private curSort: string = "";

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService,
		private tableService: tableService,
		private excelService: ExcelService) {
		this.userManagement = loginSvc;
		this.displaytable = [];
		this.checkType = "Both";

	}

	ngOnInit() {
		var date = new Date();
		// this.getpnmiles();
	}



	getpnmiles(trm) {

		//if ((this.displaytable.length <= 0) && (this.prevTerminal != this.terminal)) {

			$('#content').append('<div id="loadingdiv">' +
				'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
			this.prevTerminal = trm;
			var promise = $.ajax({
				url: environment.API + "/ops/pnfilesMileage",
				method: 'post',
				data: { 'trm': trm },
				dataType: 'json'
			});
			// data: { 'trm': trm, 'fdate': fcymd,'tdate':tcymd},
			promise.done(function (res) {
				$('#loadinggif').remove();
				$('#loadingdiv').remove();
				if (res.error) {
					this.err = res.error;
				} else {
					for (var i = 0; i < res.length - 1; i++) {
						if (res[i].EID == 'LI' && res[i + 1].EID == 'LO' && res[i].DRIVERID == res[i + 1].DRIVERID && res[i].VEHICLE_NUMBER == res[i + 1].VEHICLE_NUMBER) {
							var index = this.displaytable.length;
							this.displaytable[index] = {
								VEHICLE_NUMBER: res[i].VEHICLE_NUMBER,
								DRIVERID: res[i].DRIVERID,
								MILES: 0,
								LIDATE: res[i].EFFECTIVE_DATETIME.substring(0, 10),
								LITIME: res[i].EFFECTIVE_DATETIME.substring(11, 19),
								LIODOM: Number(res[i].EVENT_DATA.substring(res[i].EVENT_DATA.indexOf('^') + 1)),
								LODATE: res[i + 1].EFFECTIVE_DATETIME.substring(0, 10),
								LOTIME: res[i + 1].EFFECTIVE_DATETIME.substring(11, 19),
								LOODOM: Number(res[i + 1].EVENT_DATA.substring(res[i].EVENT_DATA.indexOf('^') + 1)),
							};
							this.displaytable[index].MILES = Number(this.displaytable[index].LOODOM - this.displaytable[index].LIODOM).toFixed(1);
						}
					}
				}
			}.bind(this));

			promise.fail(function (err) {
				$('#loadinggif').remove();
				$('#loadingdiv').remove();
				console.log(err.toString());
			});

		// } else {
			
		// 	for (var i = 0; i < res.length - 1; i++) {
		// 		if (this.displaytable[i].EID == 'LI' && this.displaytable[i + 1].EID == 'LO' && this.displaytable[i].DRIVERID == this.displaytable[i + 1].DRIVERID && this.displaytable[i].VEHICLE_NUMBER == this.displaytable[i + 1].VEHICLE_NUMBER) {
		// 			var index = this.displaytable.length;
		// 			this.displaytable[index] = {
		// 				VEHICLE_NUMBER: res[i].VEHICLE_NUMBER,
		// 				DRIVERID: res[i].DRIVERID,
		// 				MILES: 0,
		// 				LIDATE: res[i].EFFECTIVE_DATETIME.substring(0, 10),
		// 				LITIME: res[i].EFFECTIVE_DATETIME.substring(11, 19),
		// 				LIODOM: Number(res[i].EVENT_DATA.substring(res[i].EVENT_DATA.indexOf('^') + 1)),
		// 				LODATE: res[i + 1].EFFECTIVE_DATETIME.substring(0, 10),
		// 				LOTIME: res[i + 1].EFFECTIVE_DATETIME.substring(11, 19),
		// 				LOODOM: Number(res[i + 1].EVENT_DATA.substring(res[i].EVENT_DATA.indexOf('^') + 1)),
		// 			};
		// 			this.displaytable[index].MILES = Number(this.displaytable[index].LOODOM - this.displaytable[index].LIODOM).toFixed(1);
		// 		}
		// 	}

		// }

	}

	checkDate(rowData) {

		var startTime = new Date(this.fromDate + "T05:59:00");
		var endTime = new Date(this.toDate + "T06:00:00");
		var currentLoginDate = new Date(rowData.LIDATE + "T" + rowData.LITIME.replace(/\./g, ":"));
		var currentLogoutDate = new Date(rowData.LIDATE + "T" + rowData.LITIME.replace(/\./g, ":"));

		if (this.checkType == "Both") {
			
			if ((currentLoginDate.getTime() >= startTime.getTime()) &&
				(currentLoginDate.getTime() <= endTime.getTime())) {
				return true;
			} else {
				return false;
			}

		} else if (this.checkType == "Login") {

			if ((currentLoginDate.getTime() >= startTime.getTime()) &&
				(currentLoginDate.getTime() <= endTime.getTime())) {
				return true;
			} else {
				return false;
			}

		} else if (this.checkType == "Logout") {

			if ((currentLogoutDate.getTime() >= startTime.getTime()) &&
				(currentLogoutDate.getTime() <= endTime.getTime())) {
				return true;
			} else {
				return false;
			}
		}

	}

	displayCell(row, key) {
		if (key == 'LEAVE')
			return Number(row[key]).toFixed(2);
		else if (key == 'TLDATE') {
			return row[key].substring(2, 4) + "/" + row[key].substring(4) + "/" + row[key].substring(0, 2);
		} else
			return row[key];
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
	getPercent(cur, pre) {
		if (cur != null && cur != "" && pre != null && pre != "") {
			var x: any;
			x = Number(cur.replace(/,/g, '')) / Number(pre.replace(/,/g, ''));
			//x = parseInt(x);
			x = x * 100;
			x = x.toFixed(0) - 100;
			var y = x + "%";
			return y;
		} else {
			return "0%";
		}
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
	getAverage(val, count) {
		return this.numberWithCommas(Number(val / count).toString());
	}
	returnMDY(date) {
		if (date.toString().length > 0) {
			var rtn = date.toString();
			return rtn.substring(3, 5) + "/" + rtn.substring(5, 7) + "/" + rtn.substring(1, 3);
		}
		else
			return date;
	}

	sortByKey(key) {
		this.displaytable = this.tableService.sortByKey(this.displaytable, key);
	}

	get2Digit(val) {
		if (val.toString().length == 1)
			return "0" + val.toString();
		else
			return val.toString();
	}

	exportExcel() {
		var excelIndex = 0;
		for (var rowId = 0;rowId < this.displaytable.length;rowId++) {

			if(this.checkDate(this.displaytable[rowId])) {
				this.exporttable[excelIndex] = this.displaytable[rowId];
				excelIndex = excelIndex + 1;
			}
			
		}
		this.excelService.exportAsExcelFile(this.exporttable, 'Peoplenet_Miles');
	}

}