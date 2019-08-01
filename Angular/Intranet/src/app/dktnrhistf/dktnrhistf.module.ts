import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { dktnrhistfRoutingModule } from './dktnrhistf.routing';

import { dktnrhistfComponent }   from './dktnrhistf.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    dktnrhistfRoutingModule,
		FormsModule,
    CommonModule,
    NgbModule
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [dktnrhistfComponent],
  providers: [],
})
export class dktnrhistfModule { }
