import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { dimensionerRoutingModule } from './dimensioner.routing';

import { dimensionerComponent }   from './dimensioner.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    dimensionerRoutingModule,
		FormsModule,
    CommonModule,
    NgbModule
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [dimensionerComponent],
  providers: [],
})
export class dimensionerModule { }
