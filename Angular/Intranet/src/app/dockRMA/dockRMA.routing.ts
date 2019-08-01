import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { dockRMAComponent } from './dockRMA.component';

const routes: Routes = [
  { path: '', component: dockRMAComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class dockRMARoutingModule { }
