import { Component, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

declare var $: any;
@Component({
	selector: 'modal',
	templateUrl: '../../pages/modal.html'
})
export class modalComponent {

	public modalShow: boolean = false;
	public modalType: string = "";
	public modalData: any;
	public modalReturn: any = {};
	public modalDisplay: string = "";
	public modalSelect:any;
	private user:string = "";
	private options:any;

	constructor(private http: HttpClient) { 
		let headers = new HttpHeaders();
		headers = headers.append('Accept', 'application/json');
		headers = headers.append('Content-Type', 'application/json');
		headers = headers.append('Access-Control-Allow-Origin', 'http://lme.local');
		headers = headers.append('Access-Control-Allow-Methods', 'GET,POST');
		headers = headers.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
		this.options = { headers: headers }; // Create a request option
	}

	@HostListener('document:getModal', ['$event', '$event.detail.user','$event.detail.param1', '$event.detail.param2'])
	getModal(event, user2, param1, param2) {
		this.user = user2;
		if (param1 == "getProInfo"){
			this.getProInfo(param2);
		} else if(param1 == "getProImaging"){
			this.getProImaging(param2);
		}
	}

	openModal(data) {
		this.closeModal();
		this.modalData = data;
		setTimeout(function () {
			this.modalShow = true;
		}.bind(this), 1)

	}
	closeModal() {
		this.modalShow = false;
		this.modalData = [];
		this.modalSelect = "";
		// this.modalDisplay = "";
	}

	getProImaging(pro) {
		this.modalDisplay = pro;
		this.modalSelect = "";
		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		let req = this.http.post(
			environment.API + "/imaging/getImagingList",
			JSON.stringify({ "pro": pro }),	this.options).subscribe(
				res => {
					$('#loadinggif').remove();
					$('#loadingdiv').remove();
					this.modalType = "proImaging";
					this.openModal(res);
				},
				err => {
					$('#loadinggif').remove();
					$('#loadingdiv').remove();
					console.log("Error occured: " + err);
				}
			);
	}
	getDocument(row){
		if(row != ""){
			var docn = row.AKDOCN;
			var name = row.AKDOCT.trim() + "_" + this.modalDisplay + "_" + row.AKDOCN;
			$('#modal').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		let req = this.http.post(
			environment.API + "/imaging/getImagingDocument",
			JSON.stringify({ "name":name, "docn":docn }),	this.options).subscribe(
				res => {
					$('#loadinggif').remove();
					$('#loadingdiv').remove();
					if(res[0].success)
						window.open('/IMS/' + name + ".pdf");
				},
				err => {
					$('#loadinggif').remove();
					$('#loadingdiv').remove();
					console.log("Error occured: " + err);
				}
			);
		}
	}

	getProInfo(pro) {
		this.modalDisplay = pro;
		$('#content').append('<div id="loadingdiv">' +
			'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		let req = this.http.post(
			environment.API + "/service/getProTracking",
			JSON.stringify({ "pro": pro }),	this.options).subscribe(
				res => {
					$('#loadinggif').remove();
					$('#loadingdiv').remove();
					this.modalType = "prodetail";
					this.modalReturn[this.modalType] = {};
					this.modalReturn[this.modalType]["NOTES"] = [];
					for(var i=0; i <5;i++)
						this.addNoteLine();
					this.openModal(res);
				},
				err => {
					$('#loadinggif').remove();
					$('#loadingdiv').remove();
					console.log("Error occured: " + err);
				}
			);
	}

	objectkeys(row) { return Object.keys(row); }

	displayData(key,row){
		if(key == "TIME")
			return this.returnHMS(row[key]);
		else if(key == "DATE")
			return this.returnCYMDtoMDY(row[key]);
		else
			return row[key];
	}

	returnHMS(time){
		if(time.length <= 4)
			return time;
		else if(time.length == 5)
			time = "0" + time;
		return time.substring(0,2) + ":" + time.substring(2,4) + ":" + time.substring(4);
	}
	returnCYMDtoMDY(date){
		return date.substring(3,5) + "/" + date.substring(5) + "/" + date.substring(1,3);
	}

	addNoteLine(){
		this.modalReturn[this.modalType]["NOTES"][this.modalReturn[this.modalType]["NOTES"].length] = {
			"TIME":0,
			"DATE":0,
			"CN":"",
			"USER":this.user,
			"INT":"",
			"NOTES":""
		};
	}
	submitNotes(){
		var notes = this.modalReturn[this.modalType]["NOTES"];
		var submit = [];
		var time = this.getTime();
		this.modalReturn[this.modalType]["NOTES"] = [];
		for(var i=0;i<notes.length;i++){
			if(notes[i].NOTES > ""){
				notes[i].TIME = time;
				notes[i].DATE = this.getCYMD(0);
				notes[i].INT = this.user.substring(2);
				submit[submit.length] = notes[i];
			}
		}
		let req = this.http.post(
			environment.API + "/service/setProInfo",
			JSON.stringify({ "notes": submit,"pro":this.modalDisplay }), this.options).subscribe(
				res => {
					$('#loadinggif').remove();
					$('#loadingdiv').remove();
					this.modalReturn['prodetail']["NOTES"] = [];
					for(var i=0; i <5;i++)
						this.addNoteLine();
					this.modalData.notes = res;
				},
				err => {
					$('#loadinggif').remove();
					$('#loadingdiv').remove();
					console.log("Error occured: " + err);
				}
			);
	}

	getCYMD(addondays) {
		var curdate = new Date();
		curdate.setDate(curdate.getDate() + addondays);
		var ldate = "1" + curdate.getFullYear().toString().substring(2) + "" +this.get2Digit(curdate.getMonth() + 1) + "" +this.get2Digit(curdate.getDate());
		var ndate = Number(ldate);
		return ndate;
	}

	getTime() {
		var curdate = new Date(new Date().toLocaleString("en-us", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }));
		var ldate =this.get2Digit(curdate.getHours()) + "" +this.get2Digit(curdate.getMinutes()) + "" +this.get2Digit(curdate.getSeconds());
		return Number(ldate);
	}
	get2Digit(val) {
		if (val.toString().length == 1)
			return "0" + val.toString();
		else
			return val.toString();
	}
}
