import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { opsdashboardRoutingModule } from './opsdashboard.routing';

import { opsdashboardComponent }   from './opsdashboard.component';
import { ChartsModule} from 'ng2-charts';
// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    opsdashboardRoutingModule,
		FormsModule,
    CommonModule,
    ChartsModule
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [opsdashboardComponent],
  providers: [],
})
export class opsdashboardModule { }
