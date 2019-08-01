import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { intranetstatusComponent } from './intranetstatus.component';

const routes: Routes = [
  { path: '', component: intranetstatusComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class intranetstatusRoutingModule { }
