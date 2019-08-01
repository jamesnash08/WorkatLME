import { Injectable } from '@angular/core';
import { AuthenticationService } from '../Authentication/authentication.service';
import { environment } from '../../environments/environment';

declare var $: any;


@Injectable()
export class contextMenuService {

	public user: string = "";
	public userManagement: any;
	public contextMenuShow: boolean = false;
	public contextMenuItems: any = [];
	public contextMenuItemsDefault: any = {
		"1": { "action": "Copy", "message": "Copy", "parm": "" },
		"2": { "action": "Print", "message": "Print" }
	};
	public contextMenuPosition: any = { "X": 0, "Y": 0 };
	public contextMenuSuperceed: boolean = false;
	public contextMenuPros: any = [
		// { "action": "none", "message": "PRO", "parm": "" },
		{ "action": "ProLookup", "message": "Lookup Pro", "parm": "" },
		{ "action": "ProImaging", "message": "Imaging Pro", "parm": "" }
	];

	constructor(private authSvc: AuthenticationService, ) {
		this.userManagement = authSvc;
	}

	public openContextMenu(event, list) {
			var path = event.path ? event.path : event.composedPath();
			if (!event["ctrlKey"]) {
				if (list == "PRO" || (path[0].innerText.trim().length == 10 && !isNaN(path[0].innerText.trim())))
					list = this.contextMenuPros;
				else if (list == '')
					list = [];

				this.contextMenuShow = false;
				if (event.currentTarget.body)
					this.contextMenuPosition.X = event.clientX - (event.view.innerWidth - event.currentTarget.body.clientWidth) / 2;
				else
					this.contextMenuPosition.X = event.clientX - (event.view.innerWidth - path[path.length - 4].clientWidth) / 2;
				this.contextMenuPosition.Y = event.clientY;
				this.contextMenuItems = [];
				if (list.length > 0) {
					for (var i = 0; i < list.length; i++) {
						if (list[i].action == "ProLookup") {
							list[i].parm = path[0].innerText.trim();
							list[i].message = "Lookup PRO (" + path[0].innerText + ")";
						}
						if (list[i].action == "ProImaging") {
							list[i].parm = path[0].innerText.trim();
							list[i].message = "Imaging PRO (" + path[0].innerText + ")";
						}
						this.contextMenuItems[this.contextMenuItems.length] = list[i];
					}
					this.contextMenuItems[this.contextMenuItems.length - 1]["break"] = true;
				}
				var list2 = Object.keys(this.contextMenuItemsDefault);
				for (var i = 0; i < list2.length; i++) {
					if (this.contextMenuItemsDefault[list2[i]].action == "Copy") {
						this.contextMenuItemsDefault[list2[i]].parm = path[0].innerText;
					}
					this.contextMenuItems[this.contextMenuItems.length] = this.contextMenuItemsDefault[list2[i]];
				}
				setTimeout(function () {
					this.contextMenuShow = true;
				}.bind(this), 1);
				return false;
			}
	}

	public contextMenuClick(row) {
		switch (row.action) {
			case 'Copy':
				document.addEventListener('copy', (e: ClipboardEvent) => {
					e.clipboardData.setData('text/plain', (row.parm));
					e.preventDefault();
					document.removeEventListener('copy', null);
				});
				document.execCommand('copy');
				break;
			case 'Print':
				this.Print();
				break;
			case 'ProLookup':
				var json = { detail: { 'user': this.userManagement.user, 'param1': "getProInfo", 'param2': row.parm } };
				var event = new CustomEvent('getModal', json);

				document.dispatchEvent(event);
				break;
			case 'ProImaging':
				var json = { detail: { 'user': this.userManagement.user, 'param1': "getProImaging", 'param2': row.parm } };
				var event = new CustomEvent('getModal', json);

				document.dispatchEvent(event);
				break;
			case 'callback':
				row.callback(row.parm);
				break;
		}
		this.contextMenuShow = false;
	}
	// @HostListener('document:click', ['$event'])
	public documentClick(event: Event) {
		if (!event["ctrlKey"]) {
		this.contextMenuShow = false;
		}
		return true;
	}
	// @HostListener('document:contextmenu', ['$event','[]'])
	public documentRightClick(event: Event,list:any) {
		if (event["ctrlKey"]) {
			return true;
		} else {
			this.contextMenuShow = false;
			this.openContextMenu(event, list);
			return false;
		}
	}

	public objectkeys(row) { return Object.keys(row); }

	public Print() {
		var w = window.open();
		var html = "<!DOCTYPE HTML>";
		html += '<html lang="en-us">';
		html += '<head><style>' +
			'@page {size: landscape;}' +
			'p{font-size:14px;}' +
			'table td{padding-left:5px;	padding-bottom:2px;border: 1px solid black;}' +
			'table{border-collapse: collapse;width:100%;height:100%;}' +
			'button{display:none;}' +
			'canvas{display:block;}' +
			//'.border_under {border-bottom: 2px solid black;display: inline-block;margin-bottom:5px;min-width:400px;max-width:805px;}'+
			//'.subtitle{color: #000000;font-size: 18px;font-family:arial;font-weight:bold;font-style: italic;}'+
			'</style></head>';
		html += "<body>";
		html += $('#content').html();
		html += "</body></html>";
		w.document.write(html);
		w.window.print();
		w.document.close();
	}

	public isJSON(str){
		try{
			JSON.parse(str);
		}catch(e){
			return false;
		}
		return true;
	}

	public getLeft(){
		return Math.min(this.contextMenuPosition.X, document.body.clientWidth - 200);
	}
	public getTop(){
		return this.contextMenuPosition.Y ;
	}
}
