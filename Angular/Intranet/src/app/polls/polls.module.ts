import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { pollsRoutingModule } from './polls.routing';

import { pollsComponent }   from './polls.component';

import { NgDragDropModule } from 'ng-drag-drop';
import { ChartsModule} from 'ng2-charts';
// import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    pollsRoutingModule,
		FormsModule,
    CommonModule,
    ChartsModule,
    NgDragDropModule.forRoot(),
    // MyDatePickerModule
  ],
  exports: [],
  declarations: [pollsComponent],
  providers: [],
})
export class pollsModule { }
