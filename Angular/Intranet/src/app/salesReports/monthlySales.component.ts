import { Component, AfterContentInit }    from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService }          from '../Authentication/authentication.service';
import { SalesDataService }				  from './salesData.service';
import { environment } from '../../environments/environment';

@Component({
	selector: 'MonthlySales',
	templateUrl: '../../pages/monthlySalesReport.html',
	styles: ['.odd { background-color: #F5F5DC;}' +
	'.even { background-color: #F0FFFF;}' +
	'.totals th {  font-size: 17px;  text-align: center;   padding-right: 2px;   background-color: white;   color: black;   border: 1px solid blue;   width: 60px;   height: 50px;   font-weight: bold;}' +
	'thead th { font-size: 16px;text-align: center; border: 2px solid black; border-bottom: 2px solid black; padding-right: 2px; color: white; background-color: #CC0000;    width: 70px;    height: 30px;}']

})
export class monthlySalesReportComponent {

	public userManagement: any;
	public managementTotals: any;
	public salesPerson: string[];
	public salesId: string[];
	public months: number[][];
	public years: number[];
	public displayYear: number[];
	public currentSalesPerson: number;
	public currentMonth: number;
	public currentTotal: string;
	public next: number;
	public colEnd: number;
	public salesIndex: number;

	constructor(public route: ActivatedRoute,
				public router: Router,
				public loginSvc: AuthenticationService,
				public salesData: SalesDataService) {

		this.userManagement = loginSvc;

		// We are subscribing to endpoint to fetch sales data using SalesDataService
		this.salesData.getMonthlyTotals().subscribe(

						res => {

							this.managementTotals = res;
							this.currentSalesPerson = 0;
							this.currentMonth = 0;
							this.currentTotal = "";
							this.salesPerson = [];
							this.salesId = [];
							this.months = [];
							this.years = [];
							this.displayYear = [];
							this.next = 0;
							this.salesIndex = 0;

							for (var idx = 0;idx < this.managementTotals.length; idx++) {

								// If not first record in array insert into arrays.
								if (!this.months[ this.currentSalesPerson ]) {
									this.salesId[ this.salesIndex ] = res[ idx ].ID;
									this.salesPerson[ this.salesIndex ] = res[ idx ].SALESN;
									this.displayYear[ this.salesIndex ] = res[ idx ].INTDATE;
									this.months[ this.currentSalesPerson ] = [];
									this.months[ this.currentSalesPerson ][ this.currentMonth ] = res[ idx ].TAFREV;
								} else {
									this.salesId[ this.salesIndex ] = res[ idx ].ID;
									this.salesPerson[ this.salesIndex ] = res[ idx ].SALESN;
									this.displayYear[ this.salesIndex ] = res[ idx ].INTDATE;
									this.months[ this.currentSalesPerson ][ this.currentMonth ] = res[idx].TAFREV;
								}

								// Here we check to make sure not december and process each month
								if ( this.currentMonth < 11 ) {

									//If it is a total we increment to handle current year
									if ( res[idx].ID == 0 ) {
										//this.currentSalesPerson += 1;
										this.currentMonth += 1;
									// If data is zero we switch to next month
									} else if (res[idx].TAFREV >= 0) {
										this.currentMonth += 1;
									} else {
										//this.currentSalesPerson += 1;
										this.currentMonth = 0;
									}

								// Hey it is december lets finish up year
								} else {

									//Checking if it is a total column
									if (res[idx].ID == 0) {
										// If first column grab last 2 digits of string
										if (res[idx].SALESN.includes("Total")) {
											// populate list of years to create buttons
											this.years[ this.salesIndex ] = res[idx].INTDATE.substring(0,2);
										}
										this.currentSalesPerson += 1;
										this.salesIndex += 1;
										this.currentMonth = 0;
									//} else if (res[idx].TAFREV >= 0) {
									//	this.currentMonth += 1;
									} else {
										//this.currentSalesPerson += 1;
										this.currentMonth = 0;
									}

								}

								//if ( ( res[idx].ID > 1 ) && ( this.currentMonth == 0 ) ) {
								//	this.currentSalesPerson += 1;

								// Look ahead index
								this.next = idx + 1;
								this.colEnd = this.next % 12;

								// Check for change in sales person
								if ( (this.next < this.managementTotals.length) && ( parseInt(res[idx].ID) > 0 ) && ( this.currentMonth == 0 ) ) {
									this.salesIndex += 1;
									this.currentSalesPerson += 1;
									this.currentMonth = 0;
								// Check for released sales reps
								} else if ( (this.next < this.managementTotals.length) && ( parseInt(res[idx].ID) > 0 ) && ( (parseInt(res[idx].ID) == parseInt(res[this.next].ID) ) && ( res[ idx ].SALESN != res[ this.next ].SALESN) ) ) {
									this.salesIndex += 1;
									this.currentSalesPerson += 1;
									this.currentMonth = 0;
								// Here we check for a change in total record for the 12 element or last month
								} else if ( (this.next < this.managementTotals.length) && ( res[idx].INTDATE != res[this.next].INTDATE && ( this.colEnd == 12 ) ) ) {
									this.salesIndex += 1;
									this.currentSalesPerson += 1;
									this.currentMonth = 0;
								// Check for change in ID mainly to catch change in years available
								} else if ( (this.next < this.managementTotals.length) && ( res[idx].ID != res[this.next].ID ) ) {
									if (res[idx].SALESN.includes("Total")) {
										this.years[ this.salesIndex ] = res[idx].INTDATE.substring(0,2);
									}
									this.salesIndex += 1;
									this.currentSalesPerson += 1;
									this.currentMonth = 0;
								}



							}
							console.log(this.months);
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

	sumQuarter(x1, x2, x3) {

		var rtnval;

		if( isNaN(x1) ) {
		 x1 = 0;

		}

		if( isNaN(x2) ) {
		 x2 = 0;

		}

		if( isNaN(x3) ) {
		 x3 = 0;

		}

		if ( x1 != 0 && x2 != 0 && x3 !=0 ) {

			var x = parseInt( x1);
			var y = parseInt( x2);
			var z = parseInt( x3);

			rtnval = (x + y + z) / 3;

			return this.numberWithCommas(rtnval);

		} else {
			return 0;
		}

	}

	compareQuarter( x1, x2, x3, x4, x5, x6 ) {
		var rtnval;

		if( isNaN(x1) ) {
		 x1 = 0;

		}

		if( isNaN(x2) ) {
		 x2 = 0;

		}

		if( isNaN(x3) ) {
		 x3 = 0;

		}

		if( isNaN(x4) ) {
		 x4 = 0;

		}

		if( isNaN(x5) ) {
		 x5 = 0;

		}

		if( isNaN(x6) ) {
		 x6 = 0;

		}

		if ( x1 != 0 && x2 != 0 && x3 != 0 && x4 != 0 && x5 != 0 && x6 != 0 ) {

			var t = parseInt( x1);
			var u = parseInt( x2);
			var v = parseInt( x3);
			var x = parseInt( x4);
			var y = parseInt( x5);
			var z = parseInt( x6);

			var firstQuarter = (t + u + v) / 3;
			var secondQuarter = (x + y + z) / 3;

			rtnval = secondQuarter - firstQuarter;

			return this.numberWithCommas(rtnval);

		} else {
			return 0;
		}

	}

		yearAverage( x1, x2, x3, x4, x5, x6, x7 ,x8, x9, x10, x11, x12 ) {
		var rtnval;

		if( isNaN(x1) ) {
		 x1 = 0;

		}

		if( isNaN(x2) ) {
		 x2 = 0;

		}

		if( isNaN(x3) ) {
		 x3 = 0;

		}

		if( isNaN(x4) ) {
		 x4 = 0;

		}

		if( isNaN(x5) ) {
		 x5 = 0;

		}

		if( isNaN(x6) ) {
		 x6 = 0;

		}

		if( isNaN(x7) ) {
		 x7 = 0;

		}

		if( isNaN(x8) ) {
		 x8 = 0;

		}

		if( isNaN(x9) ) {
		 x9 = 0;

		}

		if( isNaN(x10) ) {
		 x10 = 0;

		}

		if( isNaN(x11) ) {
		 x11 = 0;

		}

		if( isNaN(x12) ) {
		 x12 = 0;

		}

		if ( x1 != 0 && x2 != 0 && x3 != 0 && x4 != 0 && x5 != 0 && x6 != 0 && x7 != 0 && x8 != 0 && x9 != 0 && x10 != 0 && x11 != 0 && x12 != 0 ) {

			var o = parseInt( x1 );
			var p = parseInt( x2 );
			var q = parseInt( x3 );
			var r = parseInt( x4 );
			var s = parseInt( x5 );
			var t = parseInt( x6 );
			var u = parseInt( x7 );
			var v = parseInt( x8 );
			var w = parseInt( x9 );
			var x = parseInt( x10 );
			var y = parseInt( x11 );
			var z = parseInt( x12 );

			var firstQuarter = (t + u + v) / 3;
			var secondQuarter = (x + y + z) / 3;

			rtnval = (o + p + q + r + s + t + u + v + w + x + y + z) / 12;

			return this.numberWithCommas(rtnval);

		} else {
			return 0;
		}

	}

	selectYear(x) {
		var yearConvert = this.years[x].toString();
		this.currentTotal = yearConvert.substring(0,2);
	}

}
