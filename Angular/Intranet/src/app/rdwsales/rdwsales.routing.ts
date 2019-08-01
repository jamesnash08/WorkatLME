import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { rdwsalesComponent } from './rdwsales.component';

const routes: Routes = [
  { path: '', component: rdwsalesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class rdwsalesRoutingModule { }
