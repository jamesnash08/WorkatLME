import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { cityplanComponent } from './cityplan.component';

const routes: Routes = [
  { path: '', component: cityplanComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class cityplanRoutingModule { }
