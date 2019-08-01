import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';

//import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

declare var $: any;

@Component({
	selector: 'ToDoList',
	templateUrl: '../../pages/ToDoList.html',
	styleUrls: ['../../assets/css/ToDoList.css']
})

export class ToDoListComponent implements AfterContentInit {

	public userManagement: any;
	public srcURL: any = "";
	public showIframe: boolean = false;
	public documentList: any = [];
	public documentGroups: any = {};
	public docTitle: string = "";
	public selectedGroup: string = "";

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService,
		public sanitizer: DomSanitizer) {
		this.userManagement = loginSvc;
	}

	ngAfterContentInit() {
		if (!this.userManagement.checkLogin()) {
			this.router.navigate(['/']);
		} else {
			setTimeout(function () { this.getDocs(); }.bind(this), 1);
		}
		// setTimeout(function(){
		// 	this.returnGoogleDoc();
		// }.bind(this),1); 
	}

	getDocs() {
		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		var promise = $.ajax({
			url: environment.API + "/documents/getDocs?user=" + this.userManagement.getUser(),
			type: "GET",
			dataType: 'json'
		});
		promise.done(function (data) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			this.documentList = data;
			for (var i = 0; i < data.length; i++) {
				data[i].GROUP = data[i].GROUP.trim();
				if (data[i].GROUP == 'IT' && !this.userManagement.hasAuthStrict('ADMIN')) { }
				else {
					if (!this.documentGroups[data[i].GROUP])
						this.documentGroups[data[i].GROUP] = [];
					this.documentGroups[data[i].GROUP][this.documentGroups[data[i].GROUP].length] = data[i];
				}
			}
		}.bind(this))
			.fail(function (xhr) {
				$('#loadinggif').remove();
				$('#loadingdiv').remove();
				console.log('Error getting directory list', xhr);
			});
	}

	reloadIframe(){
		sessionStorage.clear();
		var src = this.srcURL;
		this.srcURL = "";
		setTimeout(function(){this.srcURL = src;}.bind(this),1);
	}

	returnGoogleDoc(user, edit, browse, title) {
		user = user.trim();
		this.docTitle = title;
		sessionStorage.clear();
		if (this.userManagement.hasAuthStrict('TODOLIST') || user == this.userManagement.getUser().substring(0,user.length)) {
			this.srcURL = this.sanitizer.bypassSecurityTrustResourceUrl(edit);
		} else {
			this.srcURL = this.sanitizer.bypassSecurityTrustResourceUrl(browse);
		}
		this.showIframe = true;
	}
	objectkeys(rows) { return Object.keys(rows); }
}