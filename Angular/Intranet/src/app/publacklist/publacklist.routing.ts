import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { publacklistComponent } from './publacklist.component';

const routes: Routes = [
  { path: '', component: publacklistComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class publacklistRoutingModule { }
