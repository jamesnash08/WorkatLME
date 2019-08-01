import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export interface Result {
	// Properties
	Success: string;
	Error: string;
}
declare var $: any;

@Injectable()
export class AuthenticationService {

	private intAuth: any;
	private intTrm: any;
	private loginState: boolean;
	private loggedIn: boolean;
	private loginUrl: string;
	private results: any;
	private token: string;
	private userEmail: any;
	private user: string;
	private state: Result[];

	constructor(private http: HttpClient) {

		// Get current JWT token from Browser LocalStorage
		var token = localStorage.getItem('lmeInc');

		this.loginUrl = environment.API + "/profile/";
		this.results = '';
		this.user = '';
		this.userEmail = '';
		this.intTrm = '';
		this.intAuth = '';
		this.loginState = true;
		this.loggedIn = false;

		if ((token != null) && (token != undefined)) {
			this.results = { "Success": "Logged in!!" };
			this.loginState = true;

			let headers = new HttpHeaders();
			headers = headers.append('Accept', 'application/json');
			headers = headers.append('Content-Type', 'application/json');
			headers = headers.append('Access-Control-Allow-Origin', 'http://lme.local');
			headers = headers.append('Access-Control-Allow-Methods', 'GET,POST');
			headers = headers.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
			const options = { headers: headers }; // Create a request option

			$('content').append('<div id="loadingdiv">' +
				'<img id="loadinggif" src="/assets/Graphics/loading3.gif"></div>');
			var promise = $.ajax({
				url: this.loginUrl + 'decodeToken',
				method: 'post',
				data: { "token": token },
				dataType: 'json'
			});
			promise.done(function (res) {
				$('#loadinggif').remove();
				$('#loadingdiv').remove();
				//console.log(res);
				// Due to subscribe making res a type that has no properties we have to access with object["value"]
				// we could also use return type Observable<any>
				//localStorage.setItem('lmeInc', dataRecord.token);
				if(res['results'].Expired != undefined) {
					this.results = { "Error": res['results'].Expired};
					this.loginState = false;
					this.loggedIn = false;
					localStorage.removeItem('lmeInc');
				} else {
					this.user = res['user'];
					this.intTrm = res['intTrm'];
					this.intAuth = res['intAuth'];
					this.loggedIn = true;

					this.results = { "Success": "Logged in as " + this.user };
					//this.broadcastDetails();	
				}

			}.bind(this));

			promise.fail(function (err) {
				$('#loadinggif').remove();
				$('#loadingdiv').remove();
				console.log("Error occured");
				this.results = { "Error": "Login failed!!" };
				this.loginState = false;
				this.loggedIn = false;
				localStorage.removeItem('lmeInc');

			});
			//   let req = this.http.post(
			//     this.loginUrl + 'decodeToken',
			//     JSON.stringify({ "token" : token }),
			//     options).subscribe(
			//       res => {


			//       },
			//       err => {

			//       }
			//     );


		} else {
			this.results = { "Error": "Not logged in!!" };
			this.loginState = false;
			this.loggedIn = false;
			this.intAuth = "";
			this.intTrm = "";
			localStorage.removeItem('lmeInc');
		}

	}

	public login(username: string, password: string): Boolean {

		// const params = new HttpParams().set('status', status);
		// const params = new HttpHeaders().set('status', status);
		let headers = new HttpHeaders();
		headers = headers.append('Accept', 'application/json');
		headers = headers.append('Content-Type', 'application/json');
		headers = headers.append('Access-Control-Allow-Origin', 'http://lme.local');
		headers = headers.append('Access-Control-Allow-Methods', 'GET,POST');
		headers = headers.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
		let options = { headers: headers }; // Create a request option

		$('content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/assets/Graphics/loading3.gif"></div>');
		var promise = $.ajax({
			url: this.loginUrl + 'login',
			method: 'post',
			data: { "user": username, "password": password },
			dataType: 'json'
		});
		promise.done(function (res) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();

			if (res.Error == undefined) {
				//console.log(res);
				// Due to subscribe making res a type that has no properties we have to access with object["value"]
				// we could also use return type Observable<any>
				this.user = res["USRPR"];
				this.userEmail = res["USREM"];
				this.intTrm = res["INTTRM"];
				this.intAuth = res["INTAUTH"];
				this.token = res["TOKEN"];

				var dataRecord = {
					"user": this.user,
					"userEmail": this.userEmail,
					"intTrm": this.intTrm,
					"intAuth": this.intAuth,
					"token": this.token
				};
				this.loggedIn = true;
				this.loginState = true;
				localStorage.setItem('lmeInc', dataRecord.token);
				this.results = { "Success": "Logged in as " + this.user };

			} else {

				this.loggedIn = false;
				this.loginState = false;
				localStorage.removeItem('lmeInc');
				this.results = { "Error": "Login Failed!!" };

			}

			//this.broadcastDetails();
		}.bind(this));

		promise.fail(function (err) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			console.log("Error occured");
			this.results = { "Error": "Login Exception!!" };
			this.loggedIn = false;
			localStorage.removeItem('lmeInc');

		});
		// let req = this.http.post(
		// 					this.loginUrl + 'login',
		// 					JSON.stringify({ "user": username, "password": password }),
		// 					options).subscribe(
		// 										res => {

		// 										},
		// 										err => {

		// 										}
		// 									);

		return true;

	}

	public logout(): void {
		// clear token from LocalStorage
		this.token = null;
		this.loginState = false;
		localStorage.removeItem('lmeInc');
		this.intTrm = "";
		this.intAuth = "";
	}

	public checkLogin(): Boolean {
		return this.loginState;
	}
	public checkLoginStatus(): Boolean {
		return this.loggedIn;
	}

	public getState(): Boolean {

		if (this.results.Success) {
			return true;
		}

		return false;

	}

	public getStatusMessage(msgType): String {
		if (msgType == 'Success') {
			return this.results.Success;
		} else {
			return this.results.Error;
		}

	}
	public getUser() {
		return this.user;
	}

	public getAuth() {
		return this.intAuth;
	}

	public getTerminals() {
		return this.intTrm;
	}

	public getEmail() {
		return this.userEmail;
	}

	public getResults() {
		if (this.results.Error != null) {
			return this.results.Error;
		} else {
			return "Not Logged in!!"
		}

	}

	public hasTerminals(intTrm) {

		if (intTrm.length > 0) {

			if (this.intTrm == "ALL" || this.intTrm.search(intTrm) > -1)
				return true;
			else
				return false;

		} else {

			if (this.intTrm.length > 0)
				return true;
			else
				return false;

		}

	}

	public hasAuth(curAuth) {
		if (curAuth > "") {
			if ((this.intAuth.search("ALL") > -1) || (this.intAuth.search("ADMIN") > -1) || (this.intAuth.search(curAuth) > -1)) {
				//if (this.intAuth.search(intAuth) > -1 || intAuth.search("ALL") > -1 || this.intAuth.search("ADMIN") > -1)
				return true;
			} else {
				return false;
			}

		} else {
			return false;
		}
	}

	public hasAuthStrict(intAuth) {
		if (intAuth == "CHAT" && this.user.substring(0, 2) == "CS") {
			return true;
		}
		if (this.intAuth > "") {
			if (this.intAuth.search(intAuth) > -1)
				return true;
			else
				return false;
		}
		else
			return false;
	}



}
