import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { pnmilesComponent } from './pnmiles.component';

const routes: Routes = [
  { path: '', component: pnmilesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class pnmilesRoutingModule { }
