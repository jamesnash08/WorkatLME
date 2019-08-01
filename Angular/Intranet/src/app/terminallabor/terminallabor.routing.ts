import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { terminallaborComponent } from './terminallabor.component';

const routes: Routes = [
  { path: '', component: terminallaborComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class terminallaborRoutingModule { }
