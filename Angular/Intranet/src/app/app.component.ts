import { Component, AfterContentInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from './Authentication/authentication.service';
import { Title }     from '@angular/platform-browser';
import { contextMenuService } from './services/contextMenu.service';
@Component({
	selector: 'my-app',
	templateUrl: "./main_component.html"
})
export class AppComponent implements AfterContentInit {
	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private authSvc: AuthenticationService,
		public contextMenu: contextMenuService,
		private titleService: Title) 
		{ 
			this.userManagement = authSvc; 
			// this.contextMenu = contextMenu;
			router.events.subscribe((val) => {
				this.titleService.setTitle("LME, Inc. Intranet" );
			});
		}
	public userManagement: any;
	// public contextMenu:any;
	public user: string;
	public password: string;
	login(user: string, pass: string) {
		this.userManagement.login(user, pass);
	}
	logout() {
		this.userManagement.logout();
		this.router.navigate(['/']);
	}
	ngAfterContentInit() {
	}

	@HostListener('document:click', ['$event'])
	public documentClick(event: Event) {
		return this.contextMenu.documentClick(event);		
	}
	@HostListener('document:contextmenu', ['$event','[]'])
	public documentRightClick(event: Event) {
		return this.contextMenu.documentRightClick(event,[]);		
	}
}