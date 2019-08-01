import { ChartsModule} from 'ng2-charts';
import { HttpModule } from '@angular/http';
import { AgmCoreModule } from '@agm/core';
import { ActivatedRoute, Routes, RouterModule } from '@angular/router';

import { CommonModule } 						from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } 	from '@angular/core';
import { claimsbyTransactionComponent } 		from './claimsbyTransaction/claimsbyTransaction.component';
import { FormsModule } 							from '@angular/forms';
import { dailySalesReportComponent }			from './salesReports/dailySales.component';
import { monthlySalesReportComponent }			from './salesReports/monthlySales.component';
import { JohnDeereComponent }					from './salesReports/JohnDeere.component';
import { claimsJohnDeereComponent }				from './claims/claimsJohnDeere.component';
import { CoverageAreaComponent }				from './coverageArea/coverageArea.component';
import { outboundprojectionComponent }			from './linehaul/outboundprojection.component';
import { dockscanComponent }					from './wi/dockscan.component';
import { weightscalesComponent }				from './wi/weightscales.component';
import { ToDoListComponent}						from './documents/todolist.component';
import { reweighComponent }						from './wi/reweigh.component';
import { tonnageComponent }						from './wi/tonnage.component';
import { tapeHistoryComponent }					from './admin/tapeHistory.component';
import { rmainfoComponent }						from './admin/RMAInfo.component';

const routes: Routes = [
	{ path: '',									loadChildren: './home/home.module#homeModule'},
	{ path: 'home',								loadChildren: './home/home.module#homeModule'},
	{ path: 'opsdaily',							loadChildren: './opsdaily/opsdaily.module#opsdailyModule'},
	{ path: 'opsDashboard/:trm',				loadChildren: './opsdashboard/opsdashboard.module#opsdashboardModule'},
	{ path: 'publacklist',						loadChildren: './publacklist/publacklist.module#publacklistModule'},
	{ path: 'dimensioner',						loadChildren: './dimensioner/dimensioner.module#dimensionerModule'},
	{ path: 'intranetstatus',					loadChildren: './intranetstatus/intranetstatus.module#intranetstatusModule'},
	{ path: 'document/:page',					loadChildren: './documents/documents.module#documentsModule'},
	{ path: 'polls',							loadChildren: './polls/polls.module#pollsModule'},
	{ path: '3m',								loadChildren: './3m/3m.module#mmmModule'},

	{ path: 'claims/:type',						component: claimsbyTransactionComponent },
	{ path: 'salesReports/daily',				component: dailySalesReportComponent },
	{ path: 'salesReports/monthly',				component: monthlySalesReportComponent },
	{ path: 'salesReports/JohnDeere',			component: JohnDeereComponent },
	{ path: 'claimsReport/JohnDeere',			component: claimsJohnDeereComponent },
	{ path: 'coverageArea',						component: CoverageAreaComponent },
	{ path: 'outboundprojection',				component: outboundprojectionComponent},
	{ path: 'linehaul/outboundprojection',		component: outboundprojectionComponent},
	{ path: 'wi/dockscan',						component: dockscanComponent},
	{ path: 'wi/weightscales',					component: weightscalesComponent},
	{ path: 'ToDoList',							component: ToDoListComponent},
	{ path: 'wi/reweigh',						component: reweighComponent},
	{ path: 'wi/tonnage',						component: tonnageComponent},
	{ path: 'admin/tapeHistory',				component: tapeHistoryComponent},
	{ path: 'admin/rmainfo',					component: rmainfoComponent},

	{ path: 'billing',							loadChildren: './billing/billing.module#billingModule'},
	{ path: 'rdwsales',							loadChildren: './rdwsales/rdwsales.module#rdwsalesModule'},
	{ path: 'cityplan',							loadChildren: './cityplan/cityplan.module#cityplanModule'},
	{ path: 'lanes',							loadChildren: './lanes/lanes.module#lanesModule'},
	{ path: 'driverhours',                      loadChildren: './driverhours/driverhours.module#driverhoursModule'},
	{ path: 'pnmiles',                      	loadChildren: './pnmiles/pnmiles.module#pnmilesModule'},
	{ path: 'dktnrhistf',                      	loadChildren: './dktnrhistf/dktnrhistf.module#dktnrhistfModule'},
	{ path: 'terminallabor',                    loadChildren: './terminallabor/terminallabor.module#terminallaborModule'},
	// template
];
@NgModule({
	schemas:  [ CUSTOM_ELEMENTS_SCHEMA ],
	imports: [
				CommonModule,
				FormsModule,
				ChartsModule,
				HttpModule,
				RouterModule.forRoot(routes,{ enableTracing: false }),
				AgmCoreModule.forRoot({apiKey: 'AIzaSyCZefmLjpfV-bhOynCTpsdPLDj65EbRagE'})
			],
	declarations: [ claimsbyTransactionComponent, dailySalesReportComponent, monthlySalesReportComponent, JohnDeereComponent, claimsJohnDeereComponent, outboundprojectionComponent, dockscanComponent, weightscalesComponent, ToDoListComponent, reweighComponent, tonnageComponent, CoverageAreaComponent, tapeHistoryComponent, rmainfoComponent],
	exports: [RouterModule]
})
export class AppRoutingModule { }