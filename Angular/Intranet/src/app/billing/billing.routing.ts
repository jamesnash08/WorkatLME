import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { billingComponent } from './billing.component';

const routes: Routes = [
  { path: '', component: billingComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class billingRoutingModule { }
