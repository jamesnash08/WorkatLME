import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

declare var $: any;

@Component({
	selector: 'tapeHistory',
	templateUrl: '../../pages/admin-tapeHistory.html',
	styles: ['.odd2 { background-color: #F5F5DC;}' +
		'.even2 { background-color: #F0FFFF;}' +
		'.totals th {  font-size: 17px;  text-align: center;   padding-right: 2px;   background-color: white;   color: black;   border: 1px solid blue;   width: 60px;   height: 50px;   font-weight: bold;}' +
		'thead th { font-size: 16px;text-align: center; border: 2px solid black; border-bottom: 2px solid black; padding-right: 2px; color: white; background-color: #CC0000;    width: 70px;    height: 30px;}']
})
export class tapeHistoryComponent {

	public userManagement: any;
	public tabledisplay: any = {};
	public tabledata: any = [];
	private tableChange: any = [];
	private options: any;

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService,
		private http: HttpClient) {
		this.userManagement = loginSvc;
		let headers = new HttpHeaders();
		headers = headers.append('Accept', 'application/json');
		headers = headers.append('Content-Type', 'application/json');
		headers = headers.append('Access-Control-Allow-Origin', 'http://lme.local');
		headers = headers.append('Access-Control-Allow-Methods', 'GET,POST');
		headers = headers.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
		this.options = { headers: headers }; // Create a request option
	}
	ngOnInit() {
		setTimeout(function () {

			$('#modal').append('<div id="loadingdiv">' +
				'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
			let req = this.http.post(
				environment.API + "/admin/tapeHistory",
				JSON.stringify({ "type": "get", "json": [] }), this.options).subscribe(
					function(res) {
						$('#loadinggif').remove();
						$('#loadingdiv').remove();
						this.tabledisplay = res;
						this.tabledata = res;
					}.bind(this),
					err => {
						$('#loadinggif').remove();
						$('#loadingdiv').remove();
						console.log("Error occured: " + err);
					}
				);
		}.bind(this), 10);
	}

	objectkeys(obj) { return Object.keys(obj); }

	getType(obj, i) {
		if (i + 1 < obj.length) {
			if (obj[i + 1].CTYPE == "M") {
				this.tabledata[i].TYPE = "F";
				return "F";
			}
		}
		if (obj[i].CTYPE == "M") {
			this.tabledata[i].TYPE = "M";
			return "M";
		} else {
			return this.tabledata[i].TYPE;
		}
	}
	returnMDY(date) {
		return date.substring(3, 5) + "/" + date.substring(5) + "/" + date.substring(1, 3);
	}

	changeVal(i) {
		var changed = false;
		for (var j = 0; j < this.tableChange.length; j++) {
			if (this.tableChange[j].CYMD == this.tabledisplay[i].CYMD) {
				changed = true;
				this.tableChange[j] = this.tabledisplay[i];
			}
		}
		if (!changed)
			this.tableChange[this.tableChange.length] = this.tabledisplay[i];
	}

	updateVal() {
		if (this.tableChange.length > 0) {
			$('#modal').append('<div id="loadingdiv">' +
				'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
			let req = this.http.post(
				environment.API + "/admin/tapeHistory",
				JSON.stringify({ "type": "insert", "json": this.tableChange }), this.options).subscribe(
					function(res){
						$('#loadinggif').remove();
						$('#loadingdiv').remove();
						this.tableChange = [];
						// this.tabledata = res;
					}.bind(this),
					err => {
						$('#loadinggif').remove();
						$('#loadingdiv').remove();
						console.log("Error occured: " + err);
					}
				);
			this.tableChange = [];
		}
	}

}
