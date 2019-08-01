import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { opsdailyComponent } from './opsdaily.component';

const routes: Routes = [
  { path: '', component: opsdailyComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class opsdailyRoutingModule { }
