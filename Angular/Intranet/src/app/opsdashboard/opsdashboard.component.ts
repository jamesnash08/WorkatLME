import { Component, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../Authentication/authentication.service';
import { AppComponent } from '../app.component';
import { environment } from '../../environments/environment';

declare var $: any;

@Component({
    selector: 'OpsDashboard',
    templateUrl: './dashboard.html',
    styles: ['.odd { background-color: #F5F5DC;}' +
        '.even { background-color: #F0FFFF;}' +
        '.totals th {  font-size: 17px;  text-align: center;   padding-right: 2px;   background-color: white;   color: black;   border: 1px solid blue;   width: 60px;   height: 50px;   font-weight: bold;}' +
        'thead th { font-size: 16px;text-align: center; border: 2px solid black; border-bottom: 2px solid black; padding-right: 2px; color: white; background-color: #CC0000;    width: 70px;    height: 30px;}']
})
export class opsdashboardComponent implements AfterContentInit {

    public userManagement: any;
    public years: any = { "OPS": [], "Cross Dock": [], "Service_B": [] };
    private querydata: any = { "OPS": {}, "Cross Dock": {}, "Service_B": {} };

    public tabletotal: any = {};
    public tableLabels: any = {};
    public tableKeys: any = {};
    public tableFormat: any = {};
    public tabledisplay: any = {};
    public tabletotals: any = {};
    public tableprev: any = {};
    public tableprevyear: any = {};
    public trm: any;
    public sub: any;
    public selectedYear: string;
    public selectedPeriod: string;
    public trmscreen: boolean;
    public errmsg: string;
    public periodSelect: any;
    public tableState: string = "OPS";

    public tabData: any = [
        {
            "name": "OPS",
            "label": "OPS",
            "bgcolor": "#e6e42f",
            "color": "black",
            "display": true
        },
        {
            "name": "Cross Dock",
            "label": "Cross Dock",
            "bgcolor": "#158cd5",
            "color": "black",
            "display": true
        },
        {
            "name": "Service_B",
            "label": "Service (B)",
            "bgcolor": "#FF7B19",
            "color": "black",
            "display": true
        },
        {
            "name": "Service_D",
            "label": "Service (D)",
            "bgcolor": "#FF7B19",
            "color": "black",
            "display": true
        },
        {
            "name": "Dimensioner",
            "label": "Dimensioner",
            "bgcolor": "#bf3503",
            "color": "black",
            "display": false
        }
    ];

    public chartData: any;
    public chartLabels: any = ["Current Month", "Last Month", "Last Year"];
    public lineChartData: any = [];

    public lineChartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                }
            } // end callbacks:
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    userCallback: function (value, index, values) {
                        return value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                    }
                }
            }]
        }
    };

    public lineChartColors: Array<any> = [
        {
            backgroundColor: 'rgba(211,0,0,0.2)',
            borderColor: 'rgba(255,0,0,1)',
            pointBackgroundColor: 'rgba(255,0,0,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        },
        {
            backgroundColor: 'rgba(137, 197, 0,0.2)',
            borderColor: 'rgba(159, 238, 0,1)',
            pointBackgroundColor: 'rgba(159, 238, 0,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        },
        {
            backgroundColor: 'rgba(0, 127, 127,0.2)',
            borderColor: 'rgba(0, 153, 153,1)',
            pointBackgroundColor: 'rgba(0, 153, 153,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }
    ];

    public lineChartLegend: boolean = true;
    public lineChartType: string = 'line';
    public lineChartLabel: any;

    constructor(public route: ActivatedRoute,
        public router: Router,
        public loginSvc: AuthenticationService,
        public myapp: AppComponent) {
        this.userManagement = loginSvc;
    }

    ngAfterContentInit() {
        this.initialCheck();
    }

    initialCheck() {
        setTimeout(function () {
            if (!this.userManagement.checkLogin()) {
                this.router.navigate(['/']);
            } else if (!this.userManagement.checkLoginStatus()) {
                setTimeout(function () {
                    this.watchTRM();
                }.bind(this), 1000);
            }
            else {
                this.watchTRM();
            }
        }.bind(this), 1);
    }

    selectTerminal(TRM) {
        this.router.navigate(['/opsDashboard/' + TRM.toUpperCase()]);
    }

    watchTRM() {
        this.sub = this.route.params.subscribe(params => {
            this.trm = params['trm'];
            var trmauth = this.userManagement.getTerminals();
            if (trmauth.search(this.trm.toUpperCase()) > -1 || (trmauth == "ALL" && this.trm != 'SELECT')) {
                this.getTRMData(this.trm); // reset and set based on new parameter this time
                this.trmscreen = true;
            } else if (this.trm == 'SELECT') {
                this.trm = "";
                this.trmscreen = true;
                if (trmauth.trim().length == 3 && trmauth.trim() != "ALL") {
                    this.trmscreen = false;
                    this.trm = trmauth.trim();
                    this.getTRMData(this.trm);
                }
            } else {
                this.router.navigate(['/opsDashboard/SELECT']);
            }

        });
    }

    getTRMData(trm) {
        this.trm = trm;
        this.tableState = "OPS";
        var type = "OPS";
        this.periodSelect = "";
        this.selectedPeriod = "";
        this.selectedYear = "";
        this.setArrays(type);

        this.lineChartData = [];
        this.tableKeys[type] = [
            "TRM",
            "OPPY",
            "OPPM",
            "DATE",
            "tablebreak",
            "TOTHOURS",
            "DRIVHOURS",
            "DOCKHOURS",
            "PDMILES",
            "tablebreak",
            "RVREV",
            "RVWGT",
            "RVSHP",
            "LHMILES",
            "BILLTRLR",
            "tablebreak",
            "IBREV",
            "IBWGT",
            "IBSHP",
            "tablebreak",
            "OBREV",
            "OBWGT",
            "OBSHP"];
        this.tableLabels[type] = {
            "TOTHOURS": 'Hours',
            "DRIVHOURS": 'Driver',
            "DOCKHOURS": 'Dock',
            "PDMILES": 'PD Miles',
            "RVREV": 'RV REV',
            "RVWGT": 'RV WGT',
            "RVSHP": 'RV SHP',
            "LHMILES": 'LH Miles',
            "BILLTRLR": 'Bills / TRLR',
            "IBREV": 'I/B REV',
            "IBWGT": 'I/B WGT',
            "IBSHP": 'I/B SHP',
            "OBREV": 'O/B REV',
            "OBWGT": 'O/B WGT',
            "OBSHP": 'O/B SHP'
        };
        this.tableFormat[type] = {
            "BILLTRLR": "0.00"
        }
        this.errmsg = "";
        var trmauth = this.userManagement.getTerminals();
        if (this.querydata[type][trm]) {
            //You already requested this info.
            this.totalSet(this.querydata[type][trm], type);
        } else if (trmauth.search(trm) > -1 || trmauth.search("ALL") > -1) {
            this.years[type] = [];
            this.tabletotal = [];
            $('#content').append('<div id="loadingdiv">' +
                '<img id="loadinggif" src="/Graphics/loading.gif"></div>');
            //Get OPS data
            var promise2 = $.ajax({
                url: environment.API + "/ops/TRMDashboardOPS",
                method: 'post',
                dataType: 'json',
                data: { "trm": trm }
            });
            promise2.done(function (response) {
                $('#loadinggif').remove();
                $('#loadingdiv').remove();
                this.getXDockData(trm);
                this.getServiceData(trm);
                this.getServiceDataDirect(trm);
                this.getDimensionerData(trm);
                this.querydata[type][trm] = response;
                this.totalSet(response, type);
            }.bind(this));

            promise2.fail(function (response) {
                this.errmsg = "Data not found for terminal. try again later.";
                $('#loadinggif').remove();
                $('#loadingdiv').remove();
            });
            //});
        } else {
            this.errmsg = "Not authorized to that terminal";
        }

    }
    getXDockData(trm) {
        var type = "Cross Dock";
        this.setArrays(type);
        this.lineChartData = [];
        this.tableKeys[type] = [
            "TRM", // SCTERM OPTRM
            "OPPY",// FROM SCEDATE OPCYMD.substring(1,3)
            "OPPM",// FROM SCEDATE OPCYMD.substring(3,5)
            "DATE",//CYMD - SCEDATE OPCYMD
            "tablebreak",
            "PROS",
            "IPSHP",
            "OPSHP",
            "XDSHP",
            "SHP",
            "%PROS/SHP"];
        this.tableLabels[type] = {
            "PROS": 'Scanned Pros',
            "IPSHP": 'Inbound',
            "OPSHP": 'Outbound',
            "XDSHP": 'XDock',
            "SHP": "Total Bills",
            "%PROS/SHP": 'Percent'
        };
        this.errmsg = "";
        var trmauth = this.userManagement.getTerminals();
        if (this.querydata[type][this.trm]) {
            //You already requested this info.
            //this.totalSet(this.opintmqry[trm], type);
        } else if (trmauth.search(trm) > -1 || trmauth.search("ALL") > -1) {
            this.years[type] = [];
            this.tabletotal = [];
            $('#content').append('<div id="loadingdiv">' +
                '<img id="loadinggif" src="/Graphics/loading.gif"></div>');
            //Get OPS data
            var promise = $.ajax({
                url: environment.API + "/ops/TRMDashboardXDOCK",
                method: 'post',
                dataType: 'json',
                data: { "trm": trm }
            });
            promise.done(function (response) {
                $('#loadinggif').remove();
                $('#loadingdiv').remove();
                this.querydata[type] = {};
                this.querydata[type][this.trm] = [];
                var data = {};
                //this.querydata[type][this.trm]
                for (var i = 0; i < response.SCANS.length; i++) {
                    var json = response.SCANS[i];
                    data[json.SCEDATE] = {
                        "TRM": this.trm,
                        "OPPY": json.SCEDATE.substring(1, 3),// FROM SCEDATE OPCYMD.substring(1,3)
                        "OPPM": Number(json.SCEDATE.substring(3, 5)),// FROM SCEDATE OPCYMD.substring(3,5)
                        "DATE": this.returnMDYfromCYMD(json.SCEDATE),//CYMD - SCEDATE OPCYMD
                        "PROS": Number(json.PROS),
                        "IPSHP": 0,
                        "OPSHP": 0,
                        "XDSHP": 0,
                        "SHP": 0
                    }
                }
                for (var i = 0; i < response.BILLS.length; i++) {
                    var json = response.BILLS[i];
                    if (data[json.OPCYMD]) {
                        data[json.OPCYMD].IPSHP = Number(json.IPSHP);
                        data[json.OPCYMD].OPSHP = Number(json.OPSHP);
                        data[json.OPCYMD].XDSHP = Number(json.XDSHP);
                        data[json.OPCYMD].SHP = Number(json.IPSHP) + Number(json.OPSHP) + Number(json.XDSHP);
                    } else {
                        data[json.OPCYMD] = {
                            "TRM": this.trm,
                            "OPPY": json.OPCYMD.substring(1, 3),// FROM SCEDATE OPCYMD.substring(1,3)
                            "OPPM": Number(json.OPCYMD.substring(3, 5)),// FROM SCEDATE OPCYMD.substring(3,5)
                            "DATE": this.returnMDYfromCYMD(json.OPCYMD),//CYMD - SCEDATE OPCYMD
                            "PROS": 0,
                            "IPSHP": Number(json.IPSHP),
                            "OPSHP": Number(json.OPSHP),
                            "XDSHP": Number(json.XDSHP),
                            "SHP": Number(json.IPSHP) + Number(json.OPSHP) + Number(json.XDSHP)
                        }
                    }
                }
                var datakeys = this.objectkeys(data).reverse();
                for (var i = 1; i < datakeys.length; i++) {
                    var date = new Date("20" + datakeys[i].substring(1, 3) + "-" + datakeys[i].substring(3, 5) + "-" + datakeys[i].substring(5));
                    if (date.getDay() == 0 && i < datakeys.length - 1 && data[datakeys[i]].SHP > 0) {
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length] = data[datakeys[i]];
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length - 1].IPSHP += data[datakeys[i + 1]].IPSHP;
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length - 1].OPSHP += data[datakeys[i + 1]].OPSHP;
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length - 1].XDSHP += data[datakeys[i + 1]].XDSHP;
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length - 1].SHP += data[datakeys[i + 1]].SHP;
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length - 1].PROS += Number(data[datakeys[i + 1]].PROS);
                    } else if (date.getDay() == 4 && i > 0 && data[datakeys[i]].SHP > 0) {
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length] = data[datakeys[i]];
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length - 1].IPSHP += data[datakeys[i - 1]].IPSHP;
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length - 1].OPSHP += data[datakeys[i - 1]].OPSHP;
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length - 1].XDSHP += data[datakeys[i - 1]].XDSHP;
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length - 1].SHP += data[datakeys[i - 1]].SHP;
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length - 1].PROS += Number(data[datakeys[i - 1]].PROS);
                    } else if (date.getDay() == 5 || date.getDay() == 6 || data[datakeys[i]].SHP <= 0) {

                    } else if (i < datakeys.length - 1 && data[datakeys[i + 1]].SHP <= 0) {
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length] = data[datakeys[i]];
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length - 1].PROS += Number(data[datakeys[i + 1]].PROS);
                    } else {
                        this.querydata[type][this.trm][this.querydata[type][this.trm].length] = data[datakeys[i]];
                    }
                }
                this.totalSet(this.querydata[type][this.trm], type);
            }.bind(this));

            promise.fail(function (response) {
                $('#loadinggif').remove();
                $('#loadingdiv').remove();
            });
            //});
        } else {
            this.errmsg = "Not authorized to that terminal";
        }

    }

    getDimensionerData(trm) {
        var type = "Dimensioner";
        this.setArrays(type);
        this.lineChartData = [];
        this.tableKeys[type] = [
            "TRM", // SCTERM OPTRM
            "OPPY",// FROM SCEDATE OPCYMD.substring(1,3)
            "OPPM",// FROM SCEDATE OPCYMD.substring(3,5)
            "DATE",//CYMD - SCEDATE OPCYMD
            "tablebreak",
            "SCANS",
            "PROS",
            "SCANW",
            "%SCANW/SCANS"];
        this.tableLabels[type] = {
            "SCANS": 'Scans',
            "PROS": 'Pros',
            "SCANW": 'Weighed Scans',
            "%SCANW/SCANS": 'Percent'
        };
        this.errmsg = "";
        var trmauth = this.userManagement.getTerminals();
        // if (this.querydata[type][trm]) {
        //     //You already requested this info.
        //     this.totalSet(this.querydata[type][this.trm], type);
        // } else 
        if (trmauth.search(trm) > -1 || trmauth.search("ALL") > -1) {
            this.years[type] = [];
            this.tabletotal = [];
            $('#content').append('<div id="loadingdiv">' +
                '<img id="loadinggif" src="/Graphics/loading.gif"></div>');
            //Get OPS data
            var promise = $.ajax({
                url: environment.API + "/ops/TRMDashboardDimensioner",
                method: 'post',
                dataType: 'json',
                data: { "trm": trm, "date": 0 }
            });
            promise.done(function (response) {
                $('#loadinggif').remove();
                $('#loadingdiv').remove();
                this.querydata[type] = {};
                this.querydata[type][this.trm] = [];
                var data = {};
                //this.querydata[type][this.trm]
                for (var i = 0; i < response.length; i++) {
                    var json = response[i];
                    data[json.CYMD] = {
                        "TRM": this.trm,
                        "OPPY": json.CYMD.substring(1, 3),// FROM SCEDATE OPCYMD.substring(1,3)
                        "OPPM": Number(json.CYMD.substring(3, 5)),// FROM SCEDATE OPCYMD.substring(3,5)
                        "DATE": this.returnMDYfromCYMD(json.CYMD),//CYMD - SCEDATE OPCYMD
                        "CYMD": json.CYMD,
                        "PROS": Number(json.PROS),
                        "SCANS": Number(json.SCANS),
                        "SCANW": Number(json.SCANW),
                        "%SCANW/SCANS": "%SCANW/SCANS"
                    }
                }

                var datakeys = this.objectkeys(data).reverse();
                for (var i = 1; i < datakeys.length; i++) {
                    var date = new Date("20" + datakeys[i].substring(1, 3) + "-" + datakeys[i].substring(3, 5) + "-" + datakeys[i].substring(5));
                    this.querydata[type][this.trm][this.querydata[type][this.trm].length] = data[datakeys[i]];
                }
                this.totalSet(this.querydata[type][this.trm], type);
            }.bind(this));

            promise.fail(function (response) {
                $('#loadinggif').remove();
                $('#loadingdiv').remove();
            });
            //});
        } else {
            this.errmsg = "Not authorized to that terminal";
        }

    }

    getDimensionerDateData(trm, date) {
        var type = "DimensionerDate";
        this.setArrays(type);
        this.tableState = type;
        this.lineChartData = [];
        this.tableKeys[type] = [
            "TRM", // SCTERM OPTRM
            "OPPY",// FROM SCEDATE OPCYMD.substring(1,3)
            "OPPM",// FROM SCEDATE OPCYMD.substring(3,5)
            "DATE",//CYMD - SCEDATE OPCYMD
            "tablebreak",
            "EMP",
            "FNAME",
            "LNAME",
            "tablebreak",
            "SCANS",
            "PROS",
            "SCANW",
            "%SCANW/SCANS"];
        this.tableLabels[type] = {
            "EMP": "Employee",
            "FNAME": "First Name",
            "LNAME": "Last Name",
            "SCANS": 'Scans',
            "PROS": 'Pros',
            "SCANW": 'Weighed Scans',
            "%SCANW/SCANS": 'Percent'
        };
        this.tableFormat[type] = {
            "EMP": "!,"
        };
        this.errmsg = "";
        var trmauth = this.userManagement.getTerminals();
        this.years[type] = [];
        //this.tabletotal = [];
        $('#content').append('<div id="loadingdiv">' +
            '<img id="loadinggif" src="/Graphics/loading.gif"></div>');
        //Get OPS data
        var promise = $.ajax({
            url: environment.API + "/ops/TRMDashboardDimensioner",
            method: 'post',
            dataType: 'json',
            data: { "trm": trm, "date": date }
        });
        promise.done(function (response) {
            this.tableState = type;
            $('#loadinggif').remove();
            $('#loadingdiv').remove();
            this.querydata[type] = {};
            this.querydata[type][this.trm] = [];
            var data = {};
            //this.querydata[type][this.trm]
            for (var i = 0; i < response.length; i++) {
                var json = response[i];
                if (json.EMP.trim() == "") {
                    json.EMP = "000000";
                    json.FNAME = "Non Scanner";
                }
                data[json.EMP] = {
                    "TRM": this.trm,
                    "OPPY": json.CYMD.substring(1, 3),// FROM SCEDATE OPCYMD.substring(1,3)
                    "OPPM": Number(json.CYMD.substring(3, 5)),// FROM SCEDATE OPCYMD.substring(3,5)
                    "DATE": this.returnMDYfromCYMD(json.CYMD),//CYMD - SCEDATE OPCYMD
                    "EMP": json.EMP,
                    "FNAME": json.FNAME,
                    "LNAME": json.LNAME,
                    "PROS": Number(json.PROS),
                    "SCANS": Number(json.SCANS),
                    "SCANW": Number(json.SCANW),
                    "%SCANW/SCANS": "%SCANW/SCANS"
                }
            }

            var datakeys = this.objectkeys(data).reverse();
            for (var i = 0; i < datakeys.length; i++) {
                var date = new Date("20" + datakeys[i].substring(1, 3) + "-" + datakeys[i].substring(3, 5) + "-" + datakeys[i].substring(5));
                this.querydata[type][this.trm][this.querydata[type][this.trm].length] = data[datakeys[i]];
            }
            //this.totalSet(this.querydata[type][this.trm], type);
            this.tableState = type;
            this.tabledisplay[type] = this.querydata[type][this.trm];
        }.bind(this));

        promise.fail(function (response) {
            $('#loadinggif').remove();
            $('#loadingdiv').remove();
        });

    }

    getServiceData(trm) {
        var trm2 = trm == "ALL" ? "TOT" : trm;
        var type = "Service_B";
        this.setArrays(type);
        this.lineChartData = [];
        this.tableKeys[type] = [
            "TRM", // SCTERM OPTRM
            "OPPY",// FROM SCEDATE OPCYMD.substring(1,3)
            "OPPM",// FROM SCEDATE OPCYMD.substring(3,5)
            "DATE",//CYMD - SCEDATE OPCYMD
            "tablebreak",
            "SHIP",
            "ONTIME",
            "%ONTIME/SHIP",
            "TOT9AM",
            "SHP9AM",
            "%SHP9AM/TOT9AM"];
        this.tableLabels[type] = {
            "SHIP": 'Shipments',
            "ONTIME": 'Ontime',
            "%ONTIME/SHIP": 'Percent',
            "TOT9AM": "9AM Shipments",
            "SHP9AM": "9AM Ontime",
            "%SHP9AM/TOT9AM": "Percent"
        };
        this.errmsg = "";
        var trmauth = this.userManagement.getTerminals();
        if (this.querydata[type][this.trm]) {
            //You already requested this info.
            this.totalSet(this.querydata[type][this.trm], type);
        } else if (trmauth.search(trm) > -1 || trmauth.search("ALL") > -1) {
            this.years[type] = [];
            this.tabletotal = [];
            $('#content').append('<div id="loadingdiv">' +
                '<img id="loadinggif" src="/Graphics/loading.gif"></div>');
            //Get OPS data
            var promise = $.ajax({
                url: environment.API + "/service/ontimetotalList",
                method: 'post',
                dataType: 'json',
                data: { "trm": trm2 }
            });
            promise.done(function (response) {
                $('#loadinggif').remove();
                $('#loadingdiv').remove();
                this.querydata[type] = {};
                this.querydata[type][this.trm] = [];
                var data = {};
                //this.querydata[type][this.trm]
                for (var i = 0; i < response.length; i++) {
                    var json = response[i];
                    data[json.TMCYMD] = {
                        "TRM": this.trm,
                        "OPPY": json.TMCYMD.substring(1, 3),// FROM SCEDATE OPCYMD.substring(1,3)
                        "OPPM": Number(json.TMCYMD.substring(3, 5)),// FROM SCEDATE OPCYMD.substring(3,5)
                        "DATE": this.returnMDYfromCYMD(json.TMCYMD),//CYMD - SCEDATE OPCYMD
                        "SHIP": Number(json.SHIP),
                        "ONTIME": Number(json.ONTIME),
                        "%ONTIME/SHIP": "%ONTIME/SHIP",
                        "TOT9AM": Number(json.TOT9AM),
                        "SHP9AM": Number(json.SHP9AM),
                        "%SHP9AM/TOT9AM": "%SHP9AM/TOT9AM"
                    }
                }

                var datakeys = this.objectkeys(data).reverse();
                for (var i = 1; i < datakeys.length; i++) {
                    var date = new Date("20" + datakeys[i].substring(1, 3) + "-" + datakeys[i].substring(3, 5) + "-" + datakeys[i].substring(5));
                    this.querydata[type][this.trm][this.querydata[type][this.trm].length] = data[datakeys[i]];
                }
                this.totalSet(this.querydata[type][this.trm], type);
            }.bind(this));

            promise.fail(function (response) {
                $('#loadinggif').remove();
                $('#loadingdiv').remove();
            });
            //});
        } else {
            this.errmsg = "Not authorized to that terminal";
        }

    }

    getServiceDataDirect(trm) {
        var trm2 = trm == "ALL" ? "TOT" : trm;
        var type = "Service_D";
        this.setArrays(type);
        this.lineChartData = [];
        this.tableKeys[type] = [
            "TRM", // SCTERM OPTRM
            "OPPY",// FROM SCEDATE OPCYMD.substring(1,3)
            "OPPM",// FROM SCEDATE OPCYMD.substring(3,5)
            "DATE",//CYMD - SCEDATE OPCYMD
            "tablebreak",
            "SHIP",
            "ONTIME",
            "%ONTIME/SHIP",
            "TOT9AM",
            "SHP9AM",
            "%SHP9AM/TOT9AM"];
        this.tableLabels[type] = {
            "SHIP": 'Shipments',
            "ONTIME": 'Ontime',
            "%ONTIME/SHIP": 'Percent',
            "TOT9AM": "9AM Shipments",
            "SHP9AM": "9AM Ontime",
            "%SHP9AM/TOT9AM": "Percent"
        };
        this.errmsg = "";
        var trmauth = this.userManagement.getTerminals();
        if (this.querydata[type][this.trm]) {
            //You already requested this info.
            this.totalSet(this.querydata[type][this.trm], type);
        } else if (trmauth.search(trm) > -1 || trmauth.search("ALL") > -1) {
            this.years[type] = [];
            this.tabletotal = [];
            $('#content').append('<div id="loadingdiv">' +
                '<img id="loadinggif" src="/Graphics/loading.gif"></div>');
            //Get OPS data
            var promise = $.ajax({
                url: environment.API + "/service/ontimetotalListDirect",
                method: 'post',
                dataType: 'json',
                data: { "trm": trm2 }
            });
            promise.done(function (response) {
                $('#loadinggif').remove();
                $('#loadingdiv').remove();
                this.querydata[type] = {};
                this.querydata[type][this.trm] = [];
                var data = {};
                //this.querydata[type][this.trm]
                for (var i = 0; i < response.length; i++) {
                    var json = response[i];
                    data[json.TMCYMD] = {
                        "TRM": this.trm,
                        "OPPY": json.TMCYMD.substring(1, 3),// FROM SCEDATE OPCYMD.substring(1,3)
                        "OPPM": Number(json.TMCYMD.substring(3, 5)),// FROM SCEDATE OPCYMD.substring(3,5)
                        "DATE": this.returnMDYfromCYMD(json.TMCYMD),//CYMD - SCEDATE OPCYMD
                        "SHIP": Number(json.SHIP),
                        "ONTIME": Number(json.ONTIME),
                        "%ONTIME/SHIP": "%ONTIME/SHIP",
                        "TOT9AM": Number(json.TOT9AM),
                        "SHP9AM": Number(json.SHP9AM),
                        "%SHP9AM/TOT9AM": "%SHP9AM/TOT9AM"
                    }
                }

                var datakeys = this.objectkeys(data).reverse();
                for (var i = 1; i < datakeys.length; i++) {
                    var date = new Date("20" + datakeys[i].substring(1, 3) + "-" + datakeys[i].substring(3, 5) + "-" + datakeys[i].substring(5));
                    this.querydata[type][this.trm][this.querydata[type][this.trm].length] = data[datakeys[i]];
                }
                this.totalSet(this.querydata[type][this.trm], type);
            }.bind(this));

            promise.fail(function (response) {
                $('#loadinggif').remove();
                $('#loadingdiv').remove();
            });
            //});
        } else {
            this.errmsg = "Not authorized to that terminal";
        }

    }

    getLateShipments(trm, cymd) {
        var type = "Service_EXC";
        this.setArrays(type);
        this.lineChartData = [];
        this.tableKeys[type] = [
            "TRM", // SCTERM OPTRM
            "OPPY",// FROM SCEDATE OPCYMD.substring(1,3)
            "OPPM",// FROM SCEDATE OPCYMD.substring(3,5)
            "DATE",//CYMD - SCEDATE OPCYMD
            "tablebreak",
            "PRO",
            "SHPNAM",
            "SHPCTY",
            "SHPZP6",
            "CNSNAM",
            "CNSCTY",
            "CNSZP6",
            "STDDAY",
            "WRKDAY",
            "EXCCOD",
            "ORGKEY",
            "DSTKEY",
            "AFTER9",
            "PICKUP",
            "DLVDAT"];
        this.tableLabels[type] = {
            "PRO": "PRO",
            "SHPNAM": "SHIPPER",
            "SHPCTY": "CITY",
            "SHPZP6": "ZIP",
            "CNSNAM": "CONSIGNEE",
            "CNSCTY": "CITY",
            "CNSZP6": "ZIP",
            "STDDAY": "STAND DAYS",
            "WRKDAY": "DEL DAYS",
            "EXCCOD": "EXC",
            "ORGKEY": "ORG",
            "DSTKEY": "DST",
            "AFTER9": "9AM",
            "DLVDAT": "DEL DATE",
            "PICKUP": "PICK DATE"
        };
        this.tableFormat[type] = {
            "PRO": "!,",
            "PICKUP": "!,",
            "DLVDAT": "!,",
            "SHPZP6": "!,",
            "CNSZP6": "!,"
        };
        this.errmsg = "";
        $('#content').append('<div id="loadingdiv">' +
            '<img id="loadinggif" src="/Graphics/loading.gif"></div>');
        //Get OPS data
        var promise = $.ajax({
            url: environment.API + "/service/lateShipmentsGet",
            method: 'post',
            dataType: 'json',
            data: { "trm": trm, "cymd": cymd }
        });
        promise.done(function (response) {
            $('#loadinggif').remove();
            $('#loadingdiv').remove();
            if(response.length > 0){
            this.tableState = type;
            this.querydata[type] = {};
            this.querydata[type][this.trm] = [];
            var data = {};
            //this.querydata[type][this.trm]
            for (var i = 0; i < response.length; i++) {
                var json = response[i];
                data[json.PRO] = {
                    "TRM": this.trm,
                    "OPPY": json.DLVDAT.substring(1, 3),// FROM SCEDATE OPCYMD.substring(1,3)
                    "OPPM": Number(json.DLVDAT.substring(3, 5)),// FROM SCEDATE OPCYMD.substring(3,5)
                    "DATE": this.returnMDYfromCYMD(json.DLVDAT),//CYMD - SCEDATE OPCYMD
                    "PRO": Number(json.PRO),
                    "SHPNAM": json.SHPNAM,
                    "SHPCTY": json.SHPCTY,
                    "SHPZP6": json.SHPZP6,
                    "CNSNAM": json.CNSNAM,
                    "CNSCTY": json.CNSCTY,
                    "CNSZP6": json.CNSZP6,
                    "STDDAY": Number(json.STDDAY),
                    "WRKDAY": Number(json.WRKDAY),
                    "EXCCOD": json.EXCCOD,
                    "ORGKEY": json.ORGKEY,
                    "DSTKEY": json.DSTKEY,
                    "AFTER9": json.AFTER9,
                    "DLVDAT": Number(json.DLVDAT),
                    "PICKUP": Number(json.PICKUP),
                }
            }

            var datakeys = this.objectkeys(data).reverse();
            for (var i = 1; i < datakeys.length; i++) {
                var date = new Date("20" + datakeys[i].substring(1, 3) + "-" + datakeys[i].substring(3, 5) + "-" + datakeys[i].substring(5));
                this.querydata[type][this.trm][this.querydata[type][this.trm].length] = data[datakeys[i]];
            }
            //this.totalSet(this.querydata[type][this.trm], type);
            this.tabledisplay[type] = this.querydata[type][this.trm];
        }
        }.bind(this));

        promise.fail(function (response) {
            $('#loadinggif').remove();
            $('#loadingdiv').remove();
        });
        //});
    }

    getDate(date) {
        if (this.tableState == "OPS") {
            if (this.userManagement.getTerminals() == "ALL") {
                var promise2 = $.ajax({
                    url: environment.API + "/ops/opintmqry",
                    method: 'post',
                    dataType: 'json',
                    data: { "date": date }
                });
                promise2.done(function (data) {
                    this.dateSet(data);
                }.bind(this));

                promise2.fail(function (response) {

                });
            }
        } else if (this.tableState == "Dimensioner") {
            this.getDimensionerDateData(this.trm, this.returnCYMDfromMDY(date));
        }else if (this.tableState == "Service_D" || this.tableState == "Service_B") {
            this.getLateShipments(this.trm, this.returnCYMDfromMDY(date));
        }
    }

    dateSet(data) {
        this.tabletotals["OPS"] = [];
        for (var i = 0; i < data.length; i++) {
            this.tabledisplay['OPS'][this.tabledisplay["OPS"].length] = {
                "OPPY": data[i].OPPY,
                "OPPM": data[i].OPPM,
                "TRM": data[i].OPTRM,
                "DATE": data[i].OPDATE,
                "tablebreak1": "",
                "TOTHOURS": this.numberWithCommas(Number(data[i].OPDOCK) + Number(data[i].OPDRIV)),
                "DRIVHOURS": data[i].OPDRIV,
                "DOCKHOURS": this.numberWithCommas(data[i].OPDOCK),
                "PDMILES": this.numberWithCommas(data[i].PDMILES),
                "tablebreak2": "",
                "RVREV": this.numberWithCommas(data[i].REVENUE),
                "RVWGT": this.numberWithCommas(data[i].WEIGHT),
                "RVSHP": this.numberWithCommas(data[i].SHIPMENTS),
                "LHMILES": this.numberWithCommas(data[i].LHMILES),
                "BILLTRLR": Number(Number(data[i].EMSHIP) / Number(data[i].EMTRLR)).toFixed(2),
                "tablebreak3": "",
                "IBREV": this.numberWithCommas(data[i].IPREV),
                "IBWGT": this.numberWithCommas(data[i].IPWGT),
                "IBSHP": this.numberWithCommas(data[i].IPSHP),
                "tablebreak4": "",
                "OBREV": this.numberWithCommas(data[i].OPREV),
                "OBWGT": this.numberWithCommas(data[i].OPWGT),
                "OBSHP": this.numberWithCommas(data[i].OPSHP),
                "opadmn": this.numberWithCommas(data[i].OPADMN)
            };
        }
    }

    totalSet(data, key) {
        var x = 0;
        var y = 0;
        this.years[key][0] = [];
        this.tabletotal[key] = [];
        for (var i = 0; i < data.length; i++) {
            if (this.years[key][x][0] != data[i].OPPY && this.years[key][x][0] > 0) {
                x++;
                y = 0;
                this.years[key][x] = [];
            }
            if (y > 0 && this.years[key][x][y] != data[i].OPPM) {
                y++;
                this.years[key][x][y] = data[i].OPPM;
            }
            if (y == 0) {
                this.years[key][x][y] = data[i].OPPY;
                y++;
                this.years[key][x][y] = data[i].OPPM;
            }

            this.tabletotal[key][i] = {};
            for (var j = 0; j < this.tableKeys[key].length; j++) {
                if (this.tableKeys[key][j] != "tablebreak") {
                    this.tabletotal[key][i][this.tableKeys[key][j]] = data[i][this.tableKeys[key][j]];
                }
            }
        }
    }

    selectPeriod(year, period, key) {
        if (year != this.selectedYear || period != this.selectedPeriod) {
            this.selectedPeriod = period;
            this.selectedYear = year;
            this.lineChartData = [];
            this.tabledisplay[key] = [];
            this.tableprev[key] = [];
            this.tableprevyear[key] = [];
            this.tabletotals[key] = [];
            this.chartData = [[], [], []];
            for (var j = 0; j < this.tabletotal[key].length; j++) {
                if (this.tabletotal[key][j].OPPY == year && this.tabletotal[key][j].OPPM == period) {//tabledisplay
                    this.tabledisplay[key][this.tabledisplay[key].length] = {};
                    for (var i = 0; i < this.tableKeys[key].length; i++) {
                        if (this.tableKeys[key][i] != "tablebreak") {
                            this.tabledisplay[key][this.tabledisplay[key].length - 1][this.tableKeys[key][i]] = this.tabletotal[key][j][this.tableKeys[key][i]];
                        }
                    }

                    this.chartData[0][this.chartData[0].length] = this.tabletotal[key][j];
                } else if (this.tabletotal[key][j].OPPM == period - 1 && this.tabletotal[key][j].OPPY == year || (period == 1 && this.tabletotal[key][j].OPPM == 12 && this.tabletotal[key][j].OPPY == year - 1)) {//tableprev
                    this.tableprev[key][this.tableprev[key].length] = {};
                    for (var i = 0; i < this.tableKeys[key].length; i++) {
                        if (this.tableKeys[key][i] != "tablebreak") {
                            this.tableprev[key][this.tableprev[key].length - 1][this.tableKeys[key][i]] = this.tabletotal[key][j][this.tableKeys[key][i]];
                        }
                    }

                    this.chartData[1][this.chartData[1].length] = this.tabletotal[key][j];
                } else if (this.tabletotal[key][j].OPPM == period && this.tabletotal[key][j].OPPY == year - 1) {//tableprevyear
                    this.tableprevyear[key][this.tableprevyear[key].length] = {};
                    for (var i = 0; i < this.tableKeys[key].length; i++) {
                        if (this.tableKeys[key][i] != "tablebreak") {
                            this.tableprevyear[key][this.tableprevyear[key].length - 1][this.tableKeys[key][i]] = this.tabletotal[key][j][this.tableKeys[key][i]];
                        }
                    }

                    this.chartData[2][this.chartData[2].length] = this.tabletotal[key][j];
                }
            }
            //Get Averages
            this.tabletotals[key][this.tabletotals[key].length] = { "TRM": '', "DATE": "Work Days" };
            for (var i = 0; i < this.tableKeys[key].length; i++) {
                if (this.tableKeys[key][i] != "tablebreak" && this.tableKeys[key][i] != "DATE" && this.tableKeys[key][i] != "TRM" && this.tableKeys[key][i] != "OPPM" && this.tableKeys[key][i] != "OPPY") {
                    this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] = "AVG      " + this.tableLabels[key][this.tableKeys[key][i]];
                }
            }
            this.tabletotals[key][this.tabletotals[key].length] = { "TRM": '', "DATE": this.tabledisplay[key].length };
            for (var j = 0; j <= this.tabledisplay[key].length; j++) {
                for (var i = 0; i <= this.tableKeys[key].length; i++) {
                    if (this.tableKeys[key][i] != "tablebreak" && this.tableKeys[key][i] != "DATE" && this.tableKeys[key][i] != "TRM" && this.tableKeys[key][i] != "OPPM" && this.tableKeys[key][i] != "OPPY") {
                        if (j == this.tabledisplay[key].length) { // Set Averages
                            this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] =
                                this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] / this.tabledisplay[key].length;
                        } else {
                            if (isNaN(this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]])) {
                                this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] = 0;
                            }
                            this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] =
                                Number(this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]]) +
                                Number(this.tabledisplay[key][j][this.tableKeys[key][i]]);
                        }
                    }
                }
            }

            if (this.tableprev[key].length > 0) {//Prev Month
                this.tabletotals[key][this.tabletotals[key].length] = { "TRM": '', "DATE": "Prev Month" };
                this.tabletotals[key][this.tabletotals[key].length] = { "TRM": '', "DATE": "% Change" };
                this.tabletotals[key][this.tabletotals[key].length] = { "TRM": '', "DATE": "Work Days" };
                for (var i = 0; i < this.tableKeys[key].length; i++) {
                    if (this.tableKeys[key][i] != "tablebreak" && this.tableKeys[key][i] != "DATE" && this.tableKeys[key][i] != "TRM" && this.tableKeys[key][i] != "OPPM" && this.tableKeys[key][i] != "OPPY") {
                        this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] = "AVG      " + this.tableLabels[key][this.tableKeys[key][i]];
                    }
                }
                this.tabletotals[key][this.tabletotals[key].length] = { "TRM": '', "DATE": this.tableprev[key].length };
                for (var j = 0; j <= this.tableprev[key].length; j++) {
                    for (var i = 0; i <= this.tableKeys[key].length; i++) {
                        if (this.tableKeys[key][i] != "tablebreak" && this.tableKeys[key][i] != "DATE" && this.tableKeys[key][i] != "TRM" && this.tableKeys[key][i] != "OPPM" && this.tableKeys[key][i] != "OPPY") {
                            if (j == this.tableprev[key].length) { // Set Averages
                                this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] =
                                    this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] / this.tableprev[key].length;
                            } else {
                                if (isNaN(this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]])) {
                                    this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] = 0;
                                }
                                this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] =
                                    Number(this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]]) +
                                    Number(this.tableprev[key][j][this.tableKeys[key][i]]);
                            }
                        }
                    }
                }
                for (var i = 0; i <= this.tableKeys[key].length; i++) {
                    if (this.tableKeys[key][i] != "tablebreak" && this.tableKeys[key][i] != "DATE" && this.tableKeys[key][i] != "TRM" && this.tableKeys[key][i] != "OPPM" && this.tableKeys[key][i] != "OPPY") {
                        this.tabletotals[key][this.tabletotals[key].length - 3][this.tableKeys[key][i]] = this.getPercent(this.tabletotals[key][this.tabletotals[key].length - 5][this.tableKeys[key][i]], this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]], this.tableKeys[key][i]);
                    }
                }
            }

            if (this.tableprevyear[key].length > 0) {//Prev Year
                this.tabletotals[key][this.tabletotals[key].length] = { "TRM": '', "DATE": "Prev   Year" };
                this.tabletotals[key][this.tabletotals[key].length] = { "TRM": '', "DATE": "% Change" };
                this.tabletotals[key][this.tabletotals[key].length] = { "TRM": '', "DATE": "Work Days" };
                for (var i = 0; i < this.tableKeys[key].length; i++) {
                    if (this.tableKeys[key][i] != "tablebreak" && this.tableKeys[key][i] != "DATE" && this.tableKeys[key][i] != "TRM" && this.tableKeys[key][i] != "OPPM" && this.tableKeys[key][i] != "OPPY") {
                        this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] = "AVG      " + this.tableLabels[key][this.tableKeys[key][i]];
                    }
                }
                this.tabletotals[key][this.tabletotals[key].length] = { "TRM": '', "DATE": this.tableprevyear[key].length };
                for (var j = 0; j <= this.tableprevyear[key].length; j++) {
                    for (var i = 0; i <= this.tableKeys[key].length; i++) {
                        if (this.tableKeys[key][i] != "tablebreak" && this.tableKeys[key][i] != "DATE" && this.tableKeys[key][i] != "TRM" && this.tableKeys[key][i] != "OPPM" && this.tableKeys[key][i] != "OPPY") {
                            if (j == this.tableprevyear[key].length) { // Set Averages
                                this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] =
                                    this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] / this.tableprevyear[key].length;
                            } else {
                                if (isNaN(this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]])) {
                                    this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] = 0;
                                }
                                this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]] =
                                    Number(this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]]) +
                                    Number(this.tableprevyear[key][j][this.tableKeys[key][i]]);
                            }
                        }
                    }
                }
                for (var i = 0; i <= this.tableKeys[key].length; i++) {
                    if (this.tableKeys[key][i] != "tablebreak" && this.tableKeys[key][i] != "DATE" && this.tableKeys[key][i] != "TRM" && this.tableKeys[key][i] != "OPPM" && this.tableKeys[key][i] != "OPPY") {
                        this.tabletotals[key][this.tabletotals[key].length - 3][this.tableKeys[key][i]] = this.getPercent(this.tabletotals[key][this.tabletotals[key].length - 9][this.tableKeys[key][i]], this.tabletotals[key][this.tabletotals[key].length - 1][this.tableKeys[key][i]], this.tableKeys[key][i]);
                    }
                }
            }
        }
    }

    getHours(date, trm, key) {
        if (key == "TOTHOURS") {
            if (trm != "ALL") {
                date = this.returnYMD(date);
                var promise = $.ajax({
                    url: environment.API + "/service/getHours",
                    method: 'post',
                    dataType: 'json',
                    data: { "cdate": date, "trm": trm }
                });
                promise.done(function (data) {
                    this.tableState = "HOURS";
                    this.tabledisplay["HOURS"] = data;
                    this.tableKeys['HOURS'] = [
                        "LNAME",
                        "FNAME",
                        "DEPTCD",
                        "CTEMP",
                        "CTTRML",
                        "CTADMN",
                        "CTDOCK",
                        "CTDRIV",
                        "CTLNHL"
                    ];

                    this.tableLabels['HOURS'] = {
                        "LNAME": "Last Name",
                        "FNAME": "First Name",
                        "DEPTCD": "Dept",
                        "CTEMP": "ID",
                        "CTTRML": "TRM",
                        "CTADMN": "ADMIN",
                        "CTDOCK": "DOCK",
                        "CTDRIV": "DRIVE",
                        "CTLNHL": "LINEHAUL"
                    };
                    this.tableFormat['HOURS'] = {
                        "CTEMP": "!,",
                        "CTADMN": "0.00",
                        "CTDOCK": "0.00",
                        "CTDRIV": "0.00",
                        "CTLNHL": "0.00"

                    };

                    //this.tableHours = data;
                }.bind(this));

                promise.fail(function (response) {

                });
            }
        }
    }

    selectGraph(key) {
        this.lineChartData = [];
        this.lineChartLabel = [];
        if (key != "DATE" && key != "TRM") {
            for (var j = 0; j < 3; j++) {
                this.lineChartData[j] = { data: [], label: this.chartLabels[j] };
                for (var i = 0; i < this.chartData[j].length; i++) {
                    this.lineChartData[j].data[i] = this.getNumberValue(this.chartData[j][i][key]);
                    if (i >= this.lineChartLabel.length)
                        this.lineChartLabel[this.lineChartLabel.length] = i + 1;
                }
            }
        }
    }

    numberWithCommas(x) {
        var rtnval;
        var z = parseInt(x);
        if (isNaN(z))
            z = 0;
        rtnval = z.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return rtnval;
    }
    numberWithCommasDecimal(x) {
        var rtnval;
        var y = Number(x);
        if (isNaN(y))
            y = 0;
        var z = Number(y.toFixed(2));
        if (isNaN(z))
            z = 0;
        rtnval = z.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return rtnval;
    }
    getPercent2(pre, cur) {
        if (cur != null && cur != "" && pre != null && pre != "") {
            var x: any;
            x = Number(cur) / Number(pre);
            x = x * 100;
            x = x.toFixed(2);
            var y = x;
            return y;
        } else {
            return 0;
        }
    }
    getPercent(cur, pre, key2) {
        var key = "" + key2;
        if (key.substring(0, 1) == "%") {
            return pre - cur;
        } else {
            cur = "" + cur;
            pre = "" + pre;
            if (cur != null && cur != "" && pre != null && pre != "") {
                var x: any;
                x = Number(cur.replace(/,/g, '')) / Number(pre.replace(/,/g, ''));
                //x = parseInt(x);
                x = x * 100;
                x = x.toFixed(0) - 100;
                var y = x + "%";
                return y;
            } else {
                return "0%";
            }
        }
    }
    objectkeys(val) { return Object.keys(val); }
    getNumberValue(x) {
        if (!isNaN(x)) {
            return Number(x);
        } else if (x > "" || x > 0) {
            return Number(parseInt(x.replace(/,/g, '')));
        } else {
            return 0;
        }
    }

    showTable() {
        if (!this.tabledisplay[this.tableState])
            return false;
        else if (this.tabledisplay[this.tableState].length > 0)
            return true;
        else
            return false;
    }
    returnMDY(date) {//MDY to M/D/Y
        if (isNaN(date) || date.toString().length < 3)
            return date;
        var rtn;
        if (date.toString().length == 5)
            rtn = "0" + date.toString();
        else
            rtn = date.toString();
        return rtn.substring(0, 2) + "/" + rtn.substring(2, 4) + "/" + rtn.substring(4, 6);
    }
    returnYMDtoMDY(date) {
        if (isNaN(date) || date.toString().length < 3)
            return date;
        var rtn;
        if (date.toString().length == 5)
            rtn = "0" + date.toString();
        else
            rtn = date.toString();
        return rtn.substring(2, 4) + "/" + rtn.substring(4, 6) + "/" + rtn.substring(0, 2);
    }
    returnYMD(date) {
        var rtn;
        if (date.toString().length == 5)
            rtn = "0" + date.toString();
        else
            rtn = date.toString();
        return rtn.substring(4, 6) + "" + rtn.substring(0, 2) + "" + rtn.substring(2, 4);
    }
    returnMDYfromCYMD(date) {
        return date.substring(3, 5) + "" + date.substring(5) + "" + date.substring(1, 3);
    }
    returnCYMDfromMDY(date) {
        if (date.length == 5)
            date = "0" + date;
        return "1" + date.substring(4) + "" + date.substring(0, 2) + "" + date.substring(2, 4);
    }

    getTabColor() {
        for (var i = 0; i < this.tabData.length; i++) {
            if (this.tableState == this.tabData[i].name) {
                return this.tabData[i].bgcolor;
            }
        }
    }

    cellCheck(key): boolean {

        if (key == 'OPPY' || key == 'OPPM' || key == "DATE" || key == "TRM")
            return false;
        else
            return true;
    }
    displayCell(row, key) {
        var format = "";
        if (this.tableFormat[this.tableState])
            if (this.tableFormat[this.tableState][key])
                format = this.tableFormat[this.tableState][key];

        var val = this.displayCell2(row, key, format);
        if (val) {
            if (format.toString().indexOf('!') > -1) {
                var index = format.toString().indexOf('!');
                var char = format.substring(index + 1, index + 2);
                var re = new RegExp(char, 'g');
                val = val.toString().replace(re, "");
            }
            if (format.toString().indexOf('?') > -1) {

            }
        }
        return val;
    }
    displayCell2(row, key, format) {
        var val = row[key];
        if (key.indexOf('%') > -1) {
            if (row["DATE"] == "% Change") {
                return "%";
            } else {
                var key1 = key.substring(1, key.indexOf('/'));
                var key2 = key.substring(key.indexOf('/') + 1);
                if (isNaN(row[key1]) || isNaN(row[key2])) {
                    return val;
                } else
                    return this.getPercent2(row[key2], row[key1]);
            }
        }
        else if (isNaN(val)) {
            return val;
        } else if (format.indexOf('0.00') > -1) {
            var rtn = this.numberWithCommasDecimal(val);
            return rtn == 0 ? "" : rtn;
        } else {
            var rtn = this.numberWithCommas(val);
            return rtn == 0 ? "" : rtn;
        }
    }

    Print() {
        var w = window.open();

        var html = "<!DOCTYPE HTML>";
        html += '<html lang="en-us">';
        html += '<head><style>' +
            '@page {size: landscape;}' +
            'p{font-size:14px;}' +
            'table td{padding-left:5px;	padding-bottom:2px;border: 1px solid black;}' +
            'table{border-collapse: collapse;width:100%;height:100%; margin-bottom:15px;}' +
            'thead{border:1px solid black;}' +
            'th{border:1px solid black;} ' +
            'button{display:none;}' +
            'canvas{display:block;}' +
            '.pagebreak {page-break-after: always}' +
            //'.border_under {border-bottom: 2px solid black;display: inline-block;margin-bottom:5px;min-width:400px;max-width:805px;}'+
            //'.subtitle{color: #000000;font-size: 18px;font-family:arial;font-weight:bold;font-style: italic;}'+
            '</style></head>';
        html += "<body>";
        html += "<h1>Year 20" + this.selectedYear + " Period " + this.selectedPeriod + "</h1>";
        html += $('#Print').html();
        html += "</body></html>";
        w.document.write(html);
        w.window.print();
        w.document.close();
    }

    setArrays(type) {
        this.tabletotal[type] = [];
        this.tabledisplay[type] = [];
        this.tableprev[type] = [];
        this.tableprevyear[type] = [];
        if (!this.querydata[type])
            this.querydata[type] = [];
    }
}
