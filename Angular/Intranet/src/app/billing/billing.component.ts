import { Component, AfterContentInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';
import { Title }     from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import { contextMenuService } from '../services/contextMenu.service';
// import {NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

declare var $: any;

@Component({
	selector: 'OpsDashboard',
	templateUrl: './billing.html',
	styleUrls: ['./billing.css']
})
export class billingComponent {
	private version: number = 1.0;
	public userManagement: any;
	
	public BILLER: string;

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService,
		private titleService: Title,
		public contextMenu: contextMenuService,
		public sanitizer: DomSanitizer) {
		this.userManagement = loginSvc;
	}
	ngOnInit() {
	}
	// @HostListener('document:mousedown', ['$event'])
	// public documentClick(event: Event) {
	// 	var path = event['path'] ? event['path'] : event.composedPath();
	// 	if (event["ctrlKey"]) {
	// 		if (path[0].id.substring(0, 3) == "PRO") {
	// 			var pro = Number(path[0].id.substring(3));
	// 			if (this.selectedPros.indexOf(pro) > -1)
	// 				this.selectedPros.splice(this.selectedPros.indexOf(pro), 1);
	// 			else
	// 				this.selectedPros[this.selectedPros.length] = Number(path[0].id.substring(3));
	// 		}
	// 	} else {
	// 		this.selectedPros = [];
	// 		if (path[0].id.substring(0, 3) == "PRO") {
	// 			this.selectedPros[0] = Number(path[0].id.substring(3));
	// 		}
	// 	}
	// 	return true;
	// }
	// @HostListener('document:contextmenu', ['$event'])
	// public documentRightClick(event: Event) {
	// 	var jsonarray = [];
	// 	var path = event['path'] ? event['path'] : event.composedPath();
	// 	// if(path[0].className == "unselectedButton" || path[0].className == "selectedButton"){
	// 	// 	jsonarray = [
	// 	// 		{ "action": "callback", "message": "View plan " + path[0].id, "parm": {"cb":"VIEWPLAN","parm1":path[0].id}, "callback": this.contextCB.bind(this)},
	// 	// 		{ "action": "callback", "message": "Save plan " + path[0].id, "parm": {"cb":"SAVEPLAN","parm1":path[0].id}, "callback": this.contextCB.bind(this)},
	// 	// 		{ "action": "callback", "message": "Delete plan " + path[0].id, "parm": {"cb":"DELETEPLAN","parm1":path[0].id}, "callback": this.contextCB.bind(this)}
	// 	// 	];
	// 	// }
	// 	return this.contextMenu.documentRightClick(event,jsonarray);
	// }

	
}