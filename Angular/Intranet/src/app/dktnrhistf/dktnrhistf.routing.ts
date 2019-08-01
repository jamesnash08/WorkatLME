import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { dktnrhistfComponent } from './dktnrhistf.component';

const routes: Routes = [
  { path: '', component: dktnrhistfComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class dktnrhistfRoutingModule { }
