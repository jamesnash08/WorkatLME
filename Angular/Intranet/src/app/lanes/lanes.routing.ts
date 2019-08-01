import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { lanesComponent } from './lanes.component';

const routes: Routes = [
  { path: '', component: lanesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class lanesRoutingModule { }
