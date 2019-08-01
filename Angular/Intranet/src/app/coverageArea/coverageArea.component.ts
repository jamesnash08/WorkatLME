import { Component, OnInit, AfterContentInit, NgModule } from '@angular/core';

import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { AgmMap, AgmMarker } from '@agm/core';
import { environment } from '../../environments/environment';


//import { PolygonManager } from '../services/managers/polygon-manager';

// import { CoverageAreaRoutingModule } from './coverageArea.routing';

declare var $: any;
declare var google: any;
// just an interface for type safety.
interface marker {
  address?: string
  city?: string;
  draggable?: boolean;
  info?: string;
  key?: number;
  label?: string;
  lat: number;
  lng: number;
  name?: string;
  phone?: string;
  state?: string;
  zip?: string;
}

@Component({
  selector: 'CoverageArea',
  templateUrl: '../../pages/coverageArea.html',
  styles: [`.sebm-google-map-container {
        height: 100%;
        width:100%;
    }
    `]
})

//@Injectable();
export class CoverageAreaComponent implements OnInit {

  lat: number = 42.121655;
  lng: number = -93.625488;
  zoom: number = 4;
  maxzoom: number = 12;
  friends: any;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  markers: marker[] = [];
  mapstyles: any = [
    {
      "featureType": "administrative",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "landscape",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.man_made",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.man_made",
      "elementType": "geometry",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.natural",
      "elementType": "geometry",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.natural",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.natural.landcover",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.natural.landcover",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.natural.landcover",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.natural.terrain",
      "elementType": "geometry",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.attraction",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "transit.station.bus",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "water",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    }
  ];

  public selected: any = { zip: "", days: 0, trm: "" };
  public polygons: any = [];
  public polygons2: any = [];
  public zips: any;
  public settingZip: boolean = false;
  public trmMap: string;


  constructor(public http: Http) {
    this.polygons = [];
  }

  ngOnInit() {
    var promise = $.ajax({
      url: "/stored/coverageArea/TRMWEBQRY-Geo.json",
      type: "GET",
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      }
    });
    promise.done(function (data) {
      for (var key in data) {
        this.markers[this.markers.length] = {
          address: data[key].TMAddress[0],
          city: data[key].TMCity[0],
          name: data[key].TMName[0],
          state: data[key].TMState[0],
          draggable: false,
          lat: data[key].Latitude,
          lng: data[key].Longitude,
          label: data[key].TMTRMLCODE[0],
          key: this.markers.length,
          phone: "(800) 888-4950"
        }

        //this.markers = data;
      }
    }.bind(this));
    var promise2 = $.ajax({
      url: "/stored/coverageArea/allzips.json",
      type: "GET",
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      }
    });
    promise2.done(function (data) {
      this.setPolygons(data);
    }.bind(this));
  }

  getTerminalData(row) {
    this.trmMap = row.label;
    // if(this.lat == 42.121655 )
    //     this.lat = 42.122;
    // else
    //     this.lat = 42.121655;

    // this.lng = -93.625488;
    // this.zoom = 5;
    var promise = $.ajax({
      url: "/stored/coverageArea/zips" + row.label + ".json",
      type: "GET",
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      }
    });
    promise.done(function (data) {
      this.zips = data;
      this.setPolygons2(this.polygons);
      for (var i = 0; i < this.polygons.length; i++) {
        this.polygons[i].fill = this.getPolygonColor(this.polygons[i]);
      }
    }.bind(this));

  }

  setPolygons(paths) {
    this.polygons = [];
    //paths.length
    for (var i = 0; i < paths.length; i++) {
      var row = paths[i];
      if (row.ZIP) {
        this.polygons[this.polygons.length] = {
          paths: [],
          zip: row.ZIP,
          fill: "white"

        };
        // fill:"white"
        this.polygons[this.polygons.length - 1].paths[this.polygons[this.polygons.length - 1].paths.length] = [];
        for (var j = 0; j < row.geometry.length - 1; j++) {
          if (row.geometry[j] == 0) {
            this.polygons[this.polygons.length - 1].paths[this.polygons[this.polygons.length - 1].paths.length] = [];
            j++;
          }
          this.polygons[this.polygons.length - 1].paths[this.polygons[this.polygons.length - 1].paths.length - 1][this.polygons[this.polygons.length - 1].paths[this.polygons[this.polygons.length - 1].paths.length - 1].length] = {
            lng: row.geometry[j],
            lat: row.geometry[j + 1]
          };

          j++;

        }
      }
    }
  }

  setPolygons2(paths) {
    this.polygons2 = [];
    //paths.length
    for (var i = 0; i < paths.length; i++) {
      var row = paths[i];
      var row2;
      var days;
      if (this.zips[row.zip]) {
        row2 = this.zips[row.zip];
        days = row2.LNSTND;
      }else
        days = 0;

      if (row.zip) {
        if(!this.polygons2[days]){
        this.polygons2[days] = {
          paths: [],
          zip: row.zip,
          fill: this.getPolygonColor(row)

        };
      }
        // fill:"white"
        this.polygons2[days].paths[this.polygons2[days].paths.length] = [];
        for (var j = 0; j < row.paths.length; j++) {
          for (var z = 0; z < row.paths[j].length; z++) {
          this.polygons2[days].paths[this.polygons2[days].paths.length - 1][this.polygons2[days].paths[this.polygons2[days].paths.length - 1].length] = {
            lng: row.paths[j][z].lng,
            lat: row.paths[j][z].lat
          };

        }
        }
      }
    }
  }

  // getRecord(zip,points){
  //     return points.filter(data => data.PTZIP == zip);
  // }

  getPolygonColor(row) {
    if (this.trmMap == undefined)
      return "white";

    if (this.zips[row.zip]) {
      var row2 = this.zips[row.zip];
      var days = row2.LNSTND;
      if (row2.trm == this.trmMap)
        return "light red";
      else if (days == 1)
        return "#CC0000";
      else if (days == 2)
        return "orange";
      else if (days == 3)
        return "yellow";
      else if (days == 4)
        return "green";
      else if (days == 99)
        return "black";
      else
        return "blue";
    } else
      return "black";
  }

  getPolygonZip(row) {
    this.selected.zip = row.zip;
    this.selected.days = this.zips[row.zip].LNSTND;
    this.selected.trm = this.zips[row.zip].TRM;
    this.selected.ddays = this.zips[row.zip].PDAYS;
    this.selected.odays = this.zips[row.zip].QDAYS;
  }

  getPolygonStroke(zip) {
    return this.selected.zip == zip ? 1.0 : 0.0
  }

  Print() {
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
      '.noprint{display:none; visibility:hidden}' +
      '.print{display:block; visibility:visible}' +
      //'.border_under {border-bottom: 2px solid black;display: inline-block;margin-bottom:5px;min-width:400px;max-width:805px;}'+
      //'.subtitle{color: #000000;font-size: 18px;font-family:arial;font-weight:bold;font-style: italic;}'+
      '</style></head>';
    html += "<body>";
    html += $('#Print').html();
    html += "</body></html>";
    w.document.write(html);
    w.window.print();
    w.document.close();
  }

}
