import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';

declare var $: any;

@Component({
	selector: 'RMAinfo',
	templateUrl: '../../pages/admin-rmainfo.html',
	styles: ['.odd2 { background-color: #F5F5DC;}' +
		'.even2 { background-color: #F0FFFF;}' +
		'.totals th {  font-size: 17px;  text-align: center;   padding-right: 2px;   background-color: white;   color: black;   border: 1px solid blue;   width: 60px;   height: 50px;   font-weight: bold;}' +
		'thead th { font-size: 16px;text-align: center; border: 2px solid black; border-bottom: 2px solid black; padding-right: 2px; color: white; background-color: #CC0000;    width: 70px;    height: 30px;}']
})
export class rmainfoComponent {

	public userManagement: any;
	public tabledisplay: any = {};
	public tabledata: any = [];
	private tableChange: any = [];

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService) {
		this.userManagement = loginSvc;
	}
	ngOnInit() {
		setTimeout(function () {

			var promise = $.ajax({
				url: environment.API + "/admin/RMAInfo",
				method: 'post',
				dataType: 'json',
				data: { "type": "get", "json": [] }
			});
			promise.done(function (data) {
				this.tabledisplay = data;
				this.tabledata = data;
			}.bind(this));
			promise.fail(function (response) {

			});
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
			var promise = $.ajax({
				url: environment.API + "/admin/tapeHistory",
				method: 'post',
				dataType: 'json',
				data: { "type": "insert", "json": this.tableChange }
			});
			promise.done(function (data) {
				this.tableChange = [];
			}.bind(this));
			promise.fail(function (response) {

			});
			this.tableChange = [];
		}
	}

}
