import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService }	from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';

declare var $:any;

@Component({
  selector: 'status',
  templateUrl: './intranetstatus.html',
  styles: [	'.odd { background-color: #F5F5DC;}' +
			'.even { background-color: #F0FFFF;}' +
			'.totals th {  font-size: 17px;  text-align: center;   padding-right: 2px;   background-color: white;   color: black;   border: 1px solid blue;   width: 60px;   height: 50px;   font-weight: bold;}' +
			'thead th { font-size: 16px;text-align: center; border: 2px solid black; border-bottom: 2px solid black; padding-right: 2px; color: white; background-color: #CC0000;    width: 70px;    height: 30px;}']
})
export class intranetstatusComponent {

public userManagement: any;
public tabledisplay:any;

public refreshTimer: number;
public refreshRunning: boolean;
public serverMessage: string;

public refreshCountdownTime;
public refreshMessage;

public disableForms:boolean;

  constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService) {
		this.userManagement = loginSvc;
		this.tabledisplay = {};
}
	ngOnInit() {
		setTimeout(function(){
			if(!this.userManagement.hasAuthStrict('ADMIN')){
				this.router.navigate(['/']);
			}
			this.refreshStart();
		}.bind(this),10);
	}
	
	refreshStatus(){
		clearTimeout(this.refreshTimer);
		this.disableForms = true;
		var promise = $.ajax({
			url: environment.API + "/status",
			method: 'post',
			dataType: 'json'
		});
		promise.done(function(response) {
			this.disableForms = false;
			this.tabledisplay = response;
			this.refreshCountdownTime = 30;
			this.refreshMessage = "Refresh in " + this.refreshCountdownTime;
			this.refreshTimer = setInterval(this.refreshCountdown.bind(this),1000);
		}.bind(this));
		promise.fail(function(response) {
			this.disableForms = false;
			this.tabledisplay = [];
			clearTimeout(this.refreshTimer);
			this.serverMessage = "No response from Server!!!!";
		});
	}
	
	refreshStop(){
		this.refreshRunning = false;
		if(this.refreshTimer)
		clearTimeout(this.refreshTimer);
	}
	refreshStart(){
		this.refreshRunning = true;
		this.refreshStatus();
	}
	
	refreshCountdown(){
		this.refreshCountdownTime--;
		if(this.refreshCountdownTime <= 30)
			this.refreshMessage = "Refresh in " + this.refreshCountdownTime;
		if(this.refreshCountdownTime == 0){
			this.refreshMessage = "Refreshing";
			this.refreshStatus();
		}
	}
	
	startServer(){
	if(window.confirm("Are you sure you want to restart the server?")){
		this.disableForms = true;
		this.refreshStop();
		var promise = $.ajax({
			url: "http://lme.local:8090/start",
			method: 'get',
			dataType: 'json'
		});
		promise.done(function(response) {
			this.disableForms = false;
			this.serverMessage = response.response;		
			//this.refreshStart();
			setTimeout(this.refreshStart.bind(this),3000);
		}.bind(this));
		promise.fail(function(response) {
			this.disableForms = false;
		});
		// promise.timeout(function(){
		// 	this.disableForms = false;
		// });
	}
	}	
}
