import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { lanesRoutingModule } from './lanes.routing';

import { lanesComponent }   from './lanes.component';
// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    lanesRoutingModule,
		FormsModule,
    CommonModule,
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [lanesComponent],
  providers: [],
})
export class lanesModule { }
