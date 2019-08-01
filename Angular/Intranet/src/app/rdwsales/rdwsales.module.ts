import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { rdwsalesRoutingModule } from './rdwsales.routing';

import { rdwsalesComponent }   from './rdwsales.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    rdwsalesRoutingModule,
		FormsModule,
    CommonModule,
    NgbModule
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [rdwsalesComponent],
  providers: [],
})
export class rdwsalesModule { }
