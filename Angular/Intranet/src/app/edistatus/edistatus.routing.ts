import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ediStatusComponent } from './ediStatus.component';

const routes: Routes = [
  { path: '', component: ediStatusComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ediStatusRoutingModule { }
