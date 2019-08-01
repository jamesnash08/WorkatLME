import { AppComponent } 							from './app.component';
import { AppRoutingModule } 						from './app-routing.module';
import { BrowserModule, Title } 							from '@angular/platform-browser';
import { CommonModule } 							from '@angular/common';
import { FormsModule } 								from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule } 	from '@angular/common/http';
import {
	Injectable,
	Injector,
	InjectionToken,
	NgModule,
	ErrorHandler
  } from '@angular/core';
// import { TextMaskModule }							from 'angular2-text-mask';
import { AuthenticationService }					from './Authentication/authentication.service';
import { SalesDataService }				  from './salesReports/salesData.service';
import { tableService } from './services/table.service';
import {ExcelService} from './services/excel.service';
import { modalComponent } from './services/modalComponent';
import { contextMenuService } from './services/contextMenu.service';
// import { contextMenuComponent } from './services/contextMenuComponent';
import { chatComponent } from './chat/chatComponent';
import { MyDatePickerModule } from 'mydatepicker';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

// import * as Rollbar from 'rollbar';

// const rollbarConfig = {
// 	accessToken: 'f868b7e9e0854af09c28c44280fcc567',
// 	captureUncaught: true,
// 	captureUnhandledRejections: true,
//   };
  
//   @Injectable()
//   export class RollbarErrorHandler implements ErrorHandler {
// 	constructor(private injector: Injector) {}
  
// 	handleError(err:any) : void {
// 	  var rollbar = this.injector.get(RollbarService);
// 	  rollbar.error(err.originalError || err);
// 	}
//   }
  
//   export function rollbarFactory() {
// 	  return new Rollbar(rollbarConfig);
//   }
  
//   export const RollbarService = new InjectionToken<Rollbar>('rollbar'); 

// declaractions contextMenuComponent,
//providers contextMenuComponent,
@NgModule({
	
	imports: [
		AppRoutingModule,
		BrowserModule,
		CommonModule,
		FormsModule,
		HttpClientModule,
		HttpClientJsonpModule,
		MyDatePickerModule,
		NgbModule
		// NgbModule
	],
	// TextMaskModule 
	exports: [ ],
	declarations: [ AppComponent,modalComponent, chatComponent ],
	providers: [ 
					AppComponent,
					AuthenticationService,
					contextMenuService,
					SalesDataService, 
					Title,
					tableService, 
					modalComponent, 
					chatComponent,
					ExcelService
					// { provide: ErrorHandler, useClass: RollbarErrorHandler },
					// { provide: RollbarService, useFactory: rollbarFactory }
	],
	bootstrap: [ AppComponent ]
})
export class AppModule { }
