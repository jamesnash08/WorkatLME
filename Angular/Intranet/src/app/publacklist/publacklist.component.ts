import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { tableService } from '../services/table.service';
import { environment } from '../../environments/environment';
import {ExcelService} from '../services/excel.service';

declare var $: any;

@Component({
	selector: 'OPS',
	templateUrl: './publacklist.html',
	styles: [	'.odd { background-color: #F5F5DC;}' +
	'.even { background-color: #F0FFFF;}' +
	'.oddrow td { font-weight:bold; font-size:14px; background-color:rgba(150,150,150,0.3);}' +
	'.evenrow td { font-size:14px; font-weight:bold; }' +
	'.totals th {  font-size: 17px;  text-align: center;   padding-right: 2px;   background-color: white;   color: black;   border: 1px solid blue;   width: 60px;   height: 50px;   font-weight: bold;}' +
	'thead th { font-size: 16px;text-align: center; border: 2px solid black; border-bottom: 2px solid black; padding-right: 2px; color: white; background-color: #CC0000;    min-width: 70px;    height: 30px;}' +
	'td label {width:100%; height:100%;}'],
	providers: [tableService]
})
export class publacklistComponent {

	public userManagement: any;
	public tabledata = {};
	public selectedTRM: string = "";

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService,
		public tableService: tableService,
		private excelService:ExcelService) {
		this.userManagement = loginSvc;
	}

	ngOnInit() {
		this.getData();
	}

	exportExcel(){
			this.excelService.exportAsExcelFile(this.tabledata[this.selectedTRM], 'PU_Blacklist' + "_" + this.selectedTRM);
	}

	getData() {
		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		var promise = $.ajax({
			url: environment.API + "/service/publacklist",
			method: 'post',
			dataType: 'json'
		});
		promise.done(function (response) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			this.tabledata["ALL"] = [];
			for(var i=0; i<response.length;i++){
				if(!this.tabledata[response[i].PTTRMA]){
					this.tabledata[response[i].PTTRMA] = [];
				}
				this.tabledata[response[i].PTTRMA][this.tabledata[response[i].PTTRMA].length] = response[i];
				this.tabledata["ALL"][this.tabledata["ALL"].length] = response[i];
			}
			//this.tabledata = response;
			this.tableService.sortByKey(this.tabledata["ALL"],"PUCZB");
		}.bind(this));

		promise.fail(function (response) {

		});


	}
	objectkeys(row) {
		return Object.keys(row);
	}
}
