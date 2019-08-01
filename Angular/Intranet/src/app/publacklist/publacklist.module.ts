import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { publacklistRoutingModule } from './publacklist.routing';

import { publacklistComponent }   from './publacklist.component';
import { ChartsModule} from 'ng2-charts';
// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    publacklistRoutingModule,
		FormsModule,
    CommonModule,
    ChartsModule
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [publacklistComponent],
  providers: [],
})
export class publacklistModule { }
