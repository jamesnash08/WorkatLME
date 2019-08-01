import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { homeRoutingModule } from './home.routing';

import { homeComponent }   from './home.component';
// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    homeRoutingModule,
		FormsModule,
    CommonModule
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [homeComponent],
  providers: [],
})
export class homeModule { }
