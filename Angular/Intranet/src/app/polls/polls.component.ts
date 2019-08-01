import { Component, AfterContentInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';
import { Title }     from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import { contextMenuService } from '../services/contextMenu.service';
import { ChartType, ChartOptions } from 'chart.js';
// import { SingleDataSet, Label } from 'ng2-charts';
// import {NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

declare var $: any;

@Component({
	selector: 'Polls',
	templateUrl: './polls.html',
	styleUrls: ['./polls.css']
})
export class pollsComponent {
	private version: number = 1.0;
	public userManagement: any;
	public user:string;
	public err:string;

	public Polls:any = {};//{1:}
	public selectedPoll: string="";
	public PollResults: any = {};
	public showResults:boolean = false;

	public showNew:boolean = false;

	public newPoll:any = {};
	
	public Satisfy:any = ["1","2","3","4","5"];
	public SatisfyDisplay:any = ['Very unsatisfied','Unsatisfied','Neutral','Satisfied','Very satisfied'];

	public Choices:any = [1,2,3,4,5];

	public pieChartOptions: ChartOptions = {
		responsive: true,
	  };
	  public pieChartLabels: any = {};
	  public pieChartData: any = {};
	  public pieChartType: ChartType = 'pie';
	  public pieChartLegend = true;
	  public pieChartPlugins = [];

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService,
		private titleService: Title,
		public contextMenu: contextMenuService,
		public sanitizer: DomSanitizer) {
		this.userManagement = loginSvc;
	}
	ngOnInit() {
		this.user = this.userManagement.getUser();
		this.err = "";
		this.getPolls();
	}
	getPolls() {
		this.Polls = {};
			if (this.user == "") {
				this.router.navigate(['/home']);
			}
		var promise = $.ajax({
			url: environment.API + "/polls/getPolls",
			method: 'post',
			data: { 'user': this.user},
			dataType: 'json'
		});
		promise.done(function (res) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();	
			if(res['error']){
				this.err = res['error'];
			}else{
			var polls = res.POLLS;
			var questions = res.QUESTIONS;	
			for(var i=0;i<polls.length;i++){
				this.Polls[polls[i].POLLID] = polls[i];
				this.Polls[polls[i].POLLID]['Q'] = [];
			}
			for(var i=0;i<questions.length;i++){
				this.Polls[questions[i].POLLID]['Q'].push(questions[i]);
			}
		}
		}.bind(this));

		promise.fail(function (err) {
			console.log(err.toString());
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
		});

		// }
	}

	addQuestion(){
		this.newPoll.Q.push({
			TITLE:'',
			DESC:'',
			TYPE:'',
			C1:'',
			C2:'',
			C3:'',
			C4:'',
			C5:''
		})
	}

	writeResult(arr){
		var json = [];
		for(var i=0;i<arr.length;i++){
			json.push({SEQ:arr[i].SEQ,ANSWER:arr[i].ANSWER?arr[i].ANSWER:""});
		}
		var promise = $.ajax({
			url: environment.API + "/polls/writeResult",
			method: 'post',
			data: { 'user': this.user,'pollid':arr[0].POLLID,'json':json},
			dataType: 'json'
		});
		promise.done(function (res) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();	
			if(res['error']){
				this.err = res['error'];
			}else{
			this.getResults(this.selectedPoll);
		}
		}.bind(this));

		promise.fail(function (err) {
			console.log(err.toString());
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
		});
	}
	getResults(pollid){
		var json = [];
		var promise = $.ajax({
			url: environment.API + "/polls/getResults",
			method: 'post',
			data: { 'pollid':pollid},
			dataType: 'json'
		});
		promise.done(function (res) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();	
			if(res['error']){
				this.err = res['error'];
			}else{
				this.PollResults = {};
				this.pieChartLabels = {};
				this.pieChartData = {};
				for(var i=0;i<res.length;i++){
					if(!this.PollResults[res[i].SEQ]){
						this.PollResults[res[i].SEQ] = {ANSWER:{},TYPE:res[i].TYPE};
						this.pieChartData[res[i].SEQ] = [];
						this.pieChartLabels[res[i].SEQ] = [];
					}
					if(!this.PollResults[res[i].SEQ].ANSWER[res[i].ANSWER]){
						this.PollResults[res[i].SEQ].ANSWER[res[i].ANSWER] = res[i].SUM;
						this.pieChartData[res[i].SEQ].push(res[i].SUM);
						var msg = res[i].ANSWER;
						if(this.PollResults[res[i].SEQ].TYPE == "SATISFY")
							msg = this.SatisfyDisplay[res[i].ANSWER];
						this.pieChartLabels[res[i].SEQ].push(msg);
					}
				}
				// public pieChartLabels: any = ['Download Sales', 'In-Store Sales', 'Mail Sales'];
				// public pieChartData: any = [300, 500, 100];
				this.showResults = true;
			}
		}.bind(this));

		promise.fail(function (err) {
			console.log(err.toString());
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
		});
	}
	createNew(){
		this.showNew=true;
		this.newPoll = {
			NAME:'',
			DESC:'',
			CREATOR:this.user,
			CDATE:'',
			EDATE:'' 
		};
		this.newPoll['Q'] = [];
		this.newPoll.Q.push({
			TITLE:'',
			DESC:'',
			C1:'',
			C2:'',
			C3:'',
			C4:'',
			C5:'',
			TYPE:'BOOL'
		});
	}
	createPoll(){
		var promise = $.ajax({
			url: environment.API + "/polls/createPoll",
			method: 'post',
			data: { 'poll':this.newPoll},
			dataType: 'json'
		});
		promise.done(function (res) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();	
			if(res['error']){
				this.err = res['error'];
			}else{
				this.err = res['success'];
				this.showNew = false;
				this.getPolls();
			}
			
		}.bind(this));

		promise.fail(function (err) {
			console.log(err.toString());
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
		});
	}
	
	print() {
		var w = window.open();
		var html = "<!DOCTYPE HTML>";
		html += '<html lang="en-us">';
		html += '<head><style>' +
			'@page {size: portrait;}' +
			'p{font-size:10px;}' +
			'table td{padding-left:5px;	padding-bottom:2px;border: 1px solid black;}' +
			'table{border-collapse: collapse;width:100%;height:100%; margin-bottom:15px; position:relative; page-break-inside:auto;}' +
			'tr{ page-break-inside:avoid;}' +
			'ng-container{page-break-inside:avoid;}' +
			'thead{border:1px solid black;}' +
			'div{position:relative; display:block;}' +
			'.printHide{display:none;}' +
			'.noborder{border:none;}'+
			'tr:nth-child(10n+1){page-break-after: always; page-break-inside:avoid; }' + 
			// '.printShow{display:block;}' + 
			'th{border:1px solid black;} ' +
			'</style></head>';
		html += "<body>";
		html += $('#Print').html();
		html += "</body></html>";
		w.document.write(html);
		w.window.print();
		w.document.close();
	}
	displayPollResult(seq,answer){
		var rtn = this.PollResults[seq].ANSWER[answer];
		var msg = answer;
		if(this.PollResults[seq].TYPE == "SATISFY")
			msg = this.SatisfyDisplay[answer];
		return msg + " : " + rtn;
	}

	objectkeys(arr){return Object.keys(arr);}
}