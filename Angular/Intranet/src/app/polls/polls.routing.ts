import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { pollsComponent } from './polls.component';

const routes: Routes = [
  { path: '', component: pollsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class pollsRoutingModule { }
