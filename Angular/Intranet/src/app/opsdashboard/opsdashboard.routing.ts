import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { opsdashboardComponent } from './opsdashboard.component';

const routes: Routes = [
  { path: '', component: opsdashboardComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class opsdashboardRoutingModule { }
