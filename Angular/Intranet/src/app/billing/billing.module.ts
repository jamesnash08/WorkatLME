import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { billingRoutingModule } from './billing.routing'

import { billingComponent }   from './billing.component';

import { NgDragDropModule } from 'ng-drag-drop';
import { NgxBarcodeModule } from 'ngx-barcode';
// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    billingRoutingModule,
		FormsModule,
    CommonModule,
    NgDragDropModule.forRoot(),
    NgxBarcodeModule
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [billingComponent],
  providers: [],
})
export class billingModule { }
