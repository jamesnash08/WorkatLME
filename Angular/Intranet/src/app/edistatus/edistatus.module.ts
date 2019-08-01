import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { ediStatusRoutingModule } from './ediStatus.routing';

import { ediStatusComponent }   from './ediStatus.component';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    ediStatusRoutingModule,
		FormsModule,
    CommonModule,
    NgbModule
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [ediStatusComponent],
  providers: [],
})
export class ediStatusModule { }
