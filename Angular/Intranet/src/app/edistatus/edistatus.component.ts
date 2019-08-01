import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';

declare var $: any;

@Component({
	selector: 'ediStatus',
	templateUrl: './ediStatus.html',
	styleUrls: ['./ediStatus.css']
})
export class ediStatusComponent {

	public userManagement: any;


	constructor(public route: ActivatedRoute,
							public router: Router,
							public loginSvc: AuthenticationService) {
		this.userManagement = loginSvc;

	}

	ngOnInit() {

		var date = new Date();
		
	}

}