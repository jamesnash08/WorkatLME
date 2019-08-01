import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { cityplanRoutingModule } from './cityplan.routing';

import { cityplanComponent }   from './cityplan.component';

import { NgDragDropModule } from 'ng-drag-drop';
import { NgxBarcodeModule } from 'ngx-barcode';
// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    cityplanRoutingModule,
		FormsModule,
    CommonModule,
    NgDragDropModule.forRoot(),
    NgxBarcodeModule
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [cityplanComponent],
  providers: [],
})
export class cityplanModule { }
