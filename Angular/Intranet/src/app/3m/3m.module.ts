import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { mmmRoutingModule } from './3m.routing';

import { mmmComponent }   from './3m.component';
import { ChartsModule} from 'ng2-charts';

// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    mmmRoutingModule,
		FormsModule,
    CommonModule,
    ChartsModule
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [mmmComponent],
  providers: [],
})
export class mmmModule { }
