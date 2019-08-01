import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { mmmComponent } from './3m.component';

const routes: Routes = [
  { path: '', component: mmmComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class mmmRoutingModule { }
