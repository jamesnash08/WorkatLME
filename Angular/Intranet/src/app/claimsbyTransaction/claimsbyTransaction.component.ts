import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';


declare var $: any;
//declare var openContextMenu: any;

@Component({
	selector: 'claimsbyTransaction',
	templateUrl: './claimsbyTransaction.html',
	styles: ['.odd { background-color: #F5F5DC;}' +
		'.even { background-color: #F0FFFF;}' +
		'.odd tr { background-color: #F5F5DC;}' +
		'.even tr { background-color: #F0FFFF;}' +
		'']
})
export class claimsbyTransactionComponent {
	//public objectKeys = Object.keys;
	public userManagement: any;
	public tableDisplay: any;
	public fulldata: any;
	public claimratio: any = {};
	public monthlyTotals: any;
	public terminals: any;
	public years: any;
	public year: number;
	public monthlyPros: any;
	public Xpos: number;
	public Ypos: number;
	public Zpos: number;
	public months: any;
	public sub: any;

	public proDetail: any;
	public selectedPro: any;
	public revtype: string;
	public revterm: any;

	public terminalShipments: any = [];
	public terminalShipmentsBoolean: boolean = false;

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
	public claimsType: string;

	public contextMenuPros: any = [
		{ "action": "ProLookup", "message": "Lookup Pro", "parm":"" }
	];

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService) {
		this.userManagement = loginSvc;

		this.tableDisplay = [];
		this.monthlyTotals = [];
		this.monthlyPros = [];
		this.years = [];
		this.year = 1;
		this.Xpos = -1;
		this.months = [
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
		this.lineChartData = [];
		this.revtype = "rev";
		this.revterm = {
			rev: "Claims",
			shortage: "Shortage",
			damage: "Damaged"
		};
		this.claimsType = "";
	}

	ngOnInit() {

		if (!this.userManagement.checkLogin()) {
			this.router.navigate(['/']);
		}

		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		var url = environment.API + "/claims/claimsbyTransaction";
		//this.claimsType = "Transaction";
		this.sub = this.route.params.subscribe(params => {
			this.years = [];
			this.monthlyTotals = [];
			this.claimsType = params['type'];
			url = environment.API + "/claims/claimsby" + this.claimsType;
			var promise = $.ajax({
				url: url,
				method: 'post',
				dataType: 'json'
			});
			promise.done(function (data) {
				$('#loadinggif').remove();
				$('#loadingdiv').remove();
				if(!data.error){
					data.ratio.forEach((item) => {
						item.YEAR = item.YEAR.toString().substring(2);
						if(!this.claimratio[item.RVTRMA])
							this.claimratio[item.RVTRMA] = {};
						if(!this.claimratio[item.RVTRMA][item.YEAR])
							this.claimratio[item.RVTRMA][item.YEAR] = {};
						this.claimratio[item.RVTRMA][item.YEAR][item.PERIOD] = item.REV;
					});
				this.fulldata = data.data;
				this.showMonthly(this.fulldata);
				// this.claimratio
				
				
				}else
					console.log(data.error);
			}.bind(this));

			promise.fail(function (response) {
				$('#loadinggif').remove();
				$('#loadingdiv').remove();

			});
		});
	}

	showMonthly(data) {
		this.terminals = [];
		this.years = [];

		if (this.claimsType == "Transaction")
			this.years[0] = Number(data[0].CLTRND.substring(1, 3));
		else if (this.claimsType == "Received")
			this.years[0] = Number(data[0].CLRECD.substring(1, 3));
		this.years[1] = this.years[0] + 1;

		this.monthlyTotals = [];
		this.monthlyPros = [];
		this.monthlyTotals[0] = [];
		this.monthlyTotals[1] = [];
		this.monthlyPros[0] = [];
		this.monthlyPros[1] = [];
		this.terminals[0] = data[0].CLSCAC;
		this.monthlyTotals[0][0] = [];
		this.monthlyTotals[1][0] = [];
		this.monthlyPros[0][0] = [];
		this.monthlyPros[1][0] = [];
		for (var j = 0; j < 12; j++) {
			this.monthlyTotals[0][0][j] = {
				"shp": 0,
				"rev": 0,
				"shortage": 0,
				"damage": 0,
				ratio:0
			};
			this.monthlyTotals[1][0][j] = {
				"shp": 0,
				"rev": 0,
				"shortage": 0,
				"damage": 0,
				ratio:0
			};
			this.monthlyPros[0][0][j] = [];
			this.monthlyPros[1][0][j] = [];
		}
		for (var i = 0; i < data.length; i++) {
			var yindex;
			if (this.claimsType == "Transaction")
				yindex = Number(data[i].CLTRND.substring(1, 3)) == this.years[0] ? 0 : 1;
			else if (this.claimsType == "Received")
				yindex = Number(data[i].CLRECD.substring(1, 3)) == this.years[0] ? 0 : 1;
			//var yindex = Number(data[i].CLTRND.substring(1,3)) == this.years[0] ? 0:1;
			if (data[i].CLSCAC != this.terminals[this.terminals.length - 1]) {
				//New Terminal Found
				this.terminals[this.terminals.length] = data[i].CLSCAC;

				for (var q = 0; q < 2; q++) {
					this.monthlyTotals[q][this.terminals.length - 1] = [];
					this.monthlyPros[q][this.terminals.length - 1] = [];
					for (var j = 0; j < 12; j++) {
						this.monthlyTotals[q][this.terminals.length - 1][j] = {
							"shp": 0,
							"rev": 0,
							"shortage": 0,
							"damage": 0,
							ratio:0
						};
						this.monthlyPros[q][this.terminals.length - 1][j] = [];
					}
				}
			}
			var x: number;
			if (this.claimsType == "Transaction")
				x = Number(data[i].CLTRND.substring(3, 5)) - 1;
			else if (this.claimsType == "Received")
				x = Number(data[i].CLRECD.substring(3, 5)) - 1;
			//var x = Number(data[i].CLTRND.substring(3,5))-1;
			this.monthlyTotals[yindex][this.terminals.length - 1][x].shp++;
			var intX: number;
			intX = Number(this.monthlyTotals[yindex][this.terminals.length - 1][x].rev);
			intX += Number(data[i].CLYRA);
			this.monthlyTotals[yindex][this.terminals.length - 1][x].rev = intX.toFixed(2);
			if (data[i].CLIDSC == "VISIBLE DAMAGE           " || data[i].CLIDSC == "CONCEALED DAMAGE         ") {
				var intY: number;
				intY = Number(this.monthlyTotals[yindex][this.terminals.length - 1][x].damage);
				intY += Number(data[i].CLYRA);
				this.monthlyTotals[yindex][this.terminals.length - 1][x].damage = intY.toFixed(2);
			} else {
				var intY: number;
				intY = Number(this.monthlyTotals[yindex][this.terminals.length - 1][x].shortage);
				intY += Number(data[i].CLYRA);
				this.monthlyTotals[yindex][this.terminals.length - 1][x].shortage = intY.toFixed(2);
			}
			if(this.claimratio[this.terminals[this.terminals.length-1].trim()])
			if(this.claimratio[this.terminals[this.terminals.length-1].trim()][this.years[yindex]])
			if(this.claimratio[this.terminals[this.terminals.length-1].trim()][this.years[yindex]][x+1]){
						this.monthlyTotals[yindex][this.terminals.length - 1][x].ratio = Number(parseFloat(this.monthlyTotals[yindex][this.terminals.length - 1][x].rev) / parseFloat(this.claimratio[this.terminals[this.terminals.length-1].trim()][this.years[yindex]][x+1]) * 100).toFixed(2);
			}

			this.monthlyPros[yindex][this.terminals.length - 1][x][this.monthlyPros[yindex][this.terminals.length - 1][x].length] = data[i];

		}
		this.terminals[this.terminals.length] = "TTL";
		for (var x = 0; x < 2; x++) {
			this.monthlyTotals[x][this.terminals.length - 1] = [];
			for (var j = 0; j < 12; j++) {
				this.monthlyTotals[x][this.terminals.length - 1][j] = {
					"shp": 0,
					"rev": 0,
					"shortage": 0,
					"damage": 0,
					ratio:0
				};
				//this.monthlyPros[q][this.terminals.length-1][j] = [];
			}
			for (var y = 0; y < 12; y++) {
				for (var z = 0; z < this.monthlyTotals[x].length - 1; z++) {
					var intX: number;
					intX = Number(this.monthlyTotals[x][this.terminals.length - 1][y].rev);
					intX += Number(this.monthlyTotals[x][z][y].rev);
					this.monthlyTotals[x][this.terminals.length - 1][y].rev = intX.toFixed(2);

					intX = Number(this.monthlyTotals[x][this.terminals.length - 1][y].shortage);
					intX += Number(this.monthlyTotals[x][z][y].shortage);
					this.monthlyTotals[x][this.terminals.length - 1][y].shortage = intX.toFixed(2);

					intX = Number(this.monthlyTotals[x][this.terminals.length - 1][y].damage);
					intX += Number(this.monthlyTotals[x][z][y].damage);
					this.monthlyTotals[x][this.terminals.length - 1][y].damage = intX.toFixed(2);
				}
			}
		}
	}



	selectPros(a, b, c) {
		this.Xpos = a;
		this.Ypos = b;
		this.Zpos = c;
	}

	objectkeys(row) {
		return Object.keys(row);
	}


	public lsttrm = -1;
	selectGraph(i) {
		//Select Graph
		this.lsttrm = i;
		this.lineChartData = [];
		for (var x = 0; x < 2; x++) {
			this.lineChartData[x] = { data: "", label: "Year: 20" + this.years[x] };
			this.lineChartData[x].data = [];
			for (var z = 0; z < 12; z++) {
				if (1 != this.monthlyTotals[x].length - 1) {
					this.lineChartData[x].data[z] = Number(this.monthlyTotals[x][i][z][this.revtype]);
				} else {
					for (var y = 0; y < this.monthlyTotals[x].length - 1; y++) {
						this.lineChartData[x].data[z] += Number(this.monthlyTotals[x][y][z][this.revtype])
					}
				}
			}
		}
		if (this.terminalShipmentsBoolean)
			this.selectGraphShipments(this.terminals[this.lsttrm].trim());
		//this.terminalShipmentsBoolean = true;
	}

	setGraphShipments(i) {
		if (this.terminalShipmentsBoolean) {
			for (var x = 2; x < 4; x++) {
				this.lineChartData[x] = { data: "", label: "Shipments: 20" + this.years[x - 2] };
				this.lineChartData[x].data = [];
				for (var z = 0; z < 12; z++) {
					if (this.terminalShipments[z + ((x - 2) * 12)])
						this.lineChartData[x].data[z] = Number(this.terminalShipments[z + ((x - 2) * 12)].IN) + Number(this.terminalShipments[z + ((x - 2) * 12)].OUT);
					else
						this.lineChartData[x].data[z] = 0;
				}
			}
		}
	}

	selectGraphShipments(i) {
		if (this.terminalShipmentsBoolean) {
			var promise = $.ajax({
				url: environment.API + "/claims/getShipments",
				method: 'post',
				dataType: 'json',
				data: { "trm": this.terminals[this.lsttrm] }
			});
			promise.done(function (data) {
				this.terminalShipments = data;
				this.lineChartData = [];
				this.selectGraph(i);
			}.bind(this));
			promise.fail(function (response) {
			});
		}
	}

	selectGraph2(i) {
		this.revtype = i;
		this.selectGraph(this.lsttrm);
	}

	numberWithCommasDecimal(x) {
		var rtnval;
		var y = Number(x);
		if (isNaN(y))
			y = 0;
		//var z = Number(y.toFixed(2));
		//if(isNaN(z))
		//	z = 0;
		//rtnval = z.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		//return rtnval;
		return y.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	}
	getTotals(a, b, c, d, e, f, g, h, i, j, k, l) {
		var x = this.numberWithCommasDecimal(Number(a) + Number(b) + Number(c) + Number(d) + Number(e) + Number(f) + Number(g) + Number(h) + Number(i) + Number(j) + Number(k) + Number(l));
		return x;
	}

	returnMDY(date) {
		var rtn = date.toString();
		return rtn.substring(3, 5) + "/" + rtn.substring(5, 7) + "/" + rtn.substring(1, 3);
	}

	Print() {
		var w = window.open();

		var html = "<!DOCTYPE HTML>";
		html += '<html lang="en-us">';
		html += '<head><style>' +
			'@page {size: landscape;}' +
			'p{font-size:14px;}' +
			'table td{padding-left:5px;	padding-bottom:2px;border: 1px solid black;}' +
			'table{border-collapse: collapse;width:100%;height:100%;}' +
			'button{display:none;}' +
			'canvas{display:block;}' +
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
