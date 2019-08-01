import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { intranetstatusRoutingModule } from './intranetstatus.routing';

import { intranetstatusComponent }   from './intranetstatus.component';
// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    intranetstatusRoutingModule,
		FormsModule,
    CommonModule
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [intranetstatusComponent],
  providers: [],
})
export class intranetstatusModule { }
