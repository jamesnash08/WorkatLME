import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { dockRMARoutingModule } from './dockRMA.routing';

import { dockRMAComponent }   from './dockRMA.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    dockRMARoutingModule,
		FormsModule,
    CommonModule,
    NgbModule
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [dockRMAComponent],
  providers: [],
})
export class dockRMAModule { }
