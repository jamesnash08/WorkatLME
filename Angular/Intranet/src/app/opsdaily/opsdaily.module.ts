import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { opsdailyRoutingModule } from './opsdaily.routing';

import { opsdailyComponent }   from './opsdaily.component';
import { ChartsModule} from 'ng2-charts';
// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    opsdailyRoutingModule,
		FormsModule,
    CommonModule,
    ChartsModule
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [opsdailyComponent],
  providers: [],
})
export class opsdailyModule { }
