import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';

//import { ActivatedRoute } from '@angular/router';
import { AuthenticationService }	from '../Authentication/authentication.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { environment } from '../../environments/environment';

declare var $:any;

@Component({
	selector: 'Documents',
	templateUrl: './documents.html',
	styleUrls: []
})

export class documentsComponent {

	public userManagement: any;
	public filesToUpload: Array<File>;

	public fileList:any;
	public displayList:any;
	public page: string;
	public pagereplace:string;
	public sub: any;
	public url: string;
	public directory: boolean;
	public parentdir:string;
	public searchterm: string;
	public docMessage: string;
	public uploadStatus: string;
	public chosenFile: any;

	constructor(public route: ActivatedRoute,
		public router: Router,
		public loginSvc: AuthenticationService) {
		this.userManagement = loginSvc;

		this.fileList = [];
		this.displayList = [];

	}

	ngOnInit() {
		// if(!this.userManagement.checkLogin()){
		// 	this.router.navigate(['/']);
		// }


		this.sub = this.route.params.subscribe(params => {
			this.page = params['page'];
			//this.router.navigate(['/document']);
			this.fileList = [];
			this.parentdir = "";
			this.pagereplace = "";
			for(var i = this.page.length; i > 0; i--){
				if(this.page.substring(i-1,i)=="^"){
					this.parentdir = this.page.substring(0,i-1);
					i = 0;
				}
			}
			this.searchterm = "";
			if(this.page > "" && this.page != "..^"){
			this.pagereplace = this.page.replace("^","/");
			this.pagereplace = this.pagereplace.replace("^","/");
			this.pagereplace = this.pagereplace.replace("^","/");
			this.pagereplace = this.pagereplace.replace("^","/");
			this.pagereplace = this.pagereplace.replace("^","/");
			this.pagereplace = this.pagereplace.replace("^","/");
			this.pagereplace = this.pagereplace.replace("^","/");
			this.docMessage = "";

				this.getDocs();
			}

		});
	}

	searchDocs(term){
		this.docMessage ="";
		this.displayList = [];
		for(var i = 0; i < this.fileList.length; i++){
			//if(term.toUpperCase() == this.fileList[i].file.toUpperCase().substring(0,term.length) || this.fileList[i].file == "Parent Directory")
			if(this.fileList[i].file.toUpperCase().indexOf(term.toUpperCase()) > -1 || this.fileList[i].file == "Parent Directory")
				this.displayList[this.displayList.length]=this.fileList[i];
		}
	}

	getDocs(){

		this.url = environment.API + "/documents/getfiles?path=" + this.pagereplace;
		$('#content').append('<div id="loadingdiv">' +
		'<img id="loadinggif" src="/Graphics/loading.gif"></div>');
		var promise = $.ajax({
			url: this.url,
			type: "GET"
			//data: JSON.stringify(this.model),
			//crossDomain: true,
			});
		promise.done(function (data) {
			$('#loadinggif').remove();
			$('#loadingdiv').remove();
			this.displayList = [];
			this.fileList = [];
			var json = JSON.parse(data);
			if(this.parentdir > ""){
				this.fileList[this.fileList.length] = {file:"Parent Directory",directory:true};
			}
			for(var i = 0; i < json.length; i++){
				if(json[i].file != "Thumbs.db" && json[i].directory){
					if(!isNaN(json[i].file.substring(0,4)))
						this.fileList.splice(0, 0, json[i]);
					else
						this.fileList[this.fileList.length] = json[i];
				}
			}
			for(var i = 0; i < json.length; i++){
				if(json[i].file != "Thumbs.db" && !json[i].directory){
					this.fileList[this.fileList.length] = json[i];
				}
			}
			this.displayList = this.fileList;
		}.bind(this))
		.fail(function(xhr){
			console.log('Error getting directory list', xhr);
			this.docMessage = 'Error getting directory list';
		});
	}



	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	isManifest(file){
		if(this.parentdir != 'LHLPICS')
			return false;
		else{
			file = file.replace("Fw_ ","");
			//this.page = LHLPICS^2018-03-06
			var trlr, orga, dsta, date;
			date = Number("1" + this.page.substring(10,12) +""+ this.page.substring(13,15) +""+ this.page.substring(16,18));
			if(!isNaN(file.trim().substring(0,6))){
			trlr = file.substring(0,6);
			orga = file.substring(7,10).toUpperCase();
			dsta = file.substring(14,17).toUpperCase();
			}	else{
			trlr = file.substring(11,17);
			orga = file.substring(0,3).toUpperCase();
			dsta = file.substring(7,10).toUpperCase();
			}
			if(!isNaN(trlr) && orga.trim().length == 3 && dsta.trim().length == 3 && date > 1180000)
				return true;
			else
				return false;

		}
	}
	getManifest(file){
		this.docMessage = "";
		file = file.replace("Fw_ ","");
		var trlr, orga, dsta, date, parm;
		date = Number("1" + this.page.substring(10,12) +""+ this.page.substring(13,15) +""+ this.page.substring(16,18));
		if(!isNaN(file.trim().substring(0,6))){
		trlr = file.substring(0,6);
		orga = file.substring(7,10).toUpperCase();
		dsta = file.substring(14,17).toUpperCase();
		}	else{
		trlr = file.substring(11,17);
		orga = file.substring(0,3).toUpperCase();
		dsta = file.substring(7,10).toUpperCase();
		}
		// parm = "";
		// for(var i = 0; i < 153; i++)
		// 	parm = parm + " ";
		// parm =  this.setStringAt(parm, 10, date + "0000");
		// parm =  this.setStringAt(parm, 21, orga + dsta);
		// parm =  this.setStringAt(parm, 27, trlr);
		var data = {};
		//data.parm = parm;
		data["trlr"] = trlr;
		data["orga"] = orga;
		data["dsta"] = dsta;
		data["date"] = date;

		var promise = $.ajax({
			url: environment.API + "/service/getManifest",
			method: 'get',
			dataType: 'json',
			data: {"parm":data}
			});
		promise.done(function (data) {
			if(data.error > ""){
				this.docMessage = data.error;
			}
			else{
				if(data[0].data[1].value.trim() != "")
					window.open('/stored/'+ data[0].data[1].value,'_blank');
				else{
					this.docMessage = "Manifest not found";
				}
			}
		}.bind(this))
		.fail(function(xhr){
			console.log('Error getting manifest', xhr);
			this.docMessage = 'Error getting manifest';
		});
	}

	upload() {
        this.makeFileRequest(environment.API + "/documents/Upload", [], this.filesToUpload, this.pagereplace).then((result) => {
			console.log(result);
			this.uploadStatus = "Successfully uploaded file";
			this.chosenFile = null;
			this.getDocs();
        }, (error) => {
            console.error(error);
		});
    }
	fileChangeEvent(fileInput: any){
        this.filesToUpload = <Array<File>> fileInput.target.files;
    }
	makeFileRequest(url: string, params: Array<string>, files: Array<File>, path: string) {
    		return new Promise((resolve, reject) => {
            var formData: any = new FormData();
			var xhr = new XMLHttpRequest();

			//formData.append("path",path);
            //for(var i = 0; i < files.length; i++) {
            //    formData.append("uploads", files[i], files[i].name);
			//}
        	formData.append("uploads", files[0], files[0].name);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(xhr.response);
                    }
                }
            }
			xhr.open("POST", url, true);
			//xhr.setRequestHeader('Content-Type','multipart/form-data');
			xhr.setRequestHeader('path', path)
            xhr.send(formData);
        });
    }

	removeFile(path,file){
		if(window.confirm("Are you sure you want to delete " + file + "?")){
		this.url = environment.API + "/documents/Delete";
		var promise = $.ajax({
			url: this.url,
			type: "POST",
			data: {
				'path':path,
				'file':file
			}
			//data: JSON.stringify(this.model),
			//crossDomain: true,
			});
		promise.done(function (data) {
			this.uploadStatus = "File was deleted";
			this.getDocs();
		}.bind(this))
		.fail(function(xhr){
			console.log('Error deleting file', xhr);
		});
	}
	}

	setStringAt(str,index,chr){
		if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+chr.length);
	}

}

