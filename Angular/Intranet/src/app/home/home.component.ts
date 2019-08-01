import { Component } from '@angular/core';

declare var $:any;

@Component({
  selector: 'Home',
  templateUrl: './home.html',
  styleUrls: []
})
export class homeComponent {

public ontimeD:string;
public ontimeT:string;


  constructor() {
		this.ontimeD = "";
		this.ontimeT = "";
}

	ngAfterContentInit() {

		// var promise = $.ajax({
		// 	url: "http://lme.local/stored/daily/ontimetotal.txt",
		// 	method: 'GET',
		// 	dataType: 'json'
        // });

		// promise.done(function(response) {
		// 	this.ontimeD = response.ontimeD;
		// 	this.ontimeT = response.ontimeT;
		// }.bind(this));

		// promise.fail(function(response) {
		// 	var promise2 = $.ajax({
		// 		url: environment.API + "/service/ontimetotal",
		// 		method: 'GET',
		// 		dataType: 'json'
		// 	});
		// 	promise2.done(function(response) {
		// 		this.ontimeD = response.ontimeD;
		// 		this.ontimeT = response.ontimeT;
		// 	}.bind(this));

		// 	promise2.fail(function(response) {

		// 	});
		// }.bind(this));

	}
}
